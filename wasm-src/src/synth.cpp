// SPDX-FileCopyrightText: 2025 Rerrah
// SPDX-License-Identifier: MIT

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <algorithm>
#include <array>
#include <list>
#include <mutex>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>

#include "chip/ym2608.hpp"
#include "chip/ym2612.hpp"
#include "instrument.hpp"
#include "keyboard.hpp"
#include "miniaudio.h"
#include "pitch.hpp"

namespace {
// Chip instance.
using VariantChip = std::variant<synth::chip::Ym2608, synth::chip::Ym2612>;
VariantChip chip_instance;

// Temporary buffer.
constexpr std::size_t kInitialBufferSize{0x10000};
std::vector<float> original_rate_buffer[2] = {
    std::vector<float>(kInitialBufferSize),
    std::vector<float>(kInitialBufferSize),
};

std::vector<float> resampled_rate_buffer[2] = {
    std::vector<float>(kInitialBufferSize),
    std::vector<float>(kInitialBufferSize),
};

// Resampling settings.
std::uint32_t sampling_rate{44100};
ma_resampler left_resampler, right_resampler;

// Keyboard management.
synth::Keyboard keyboard{6};

// Command management.
struct NoteOnCommand {
  int ch;
  synth::Pitch pitch;
};

struct NoteOffCommand {
  int ch;
};

struct SetInstrumentCommand {
  synth::FmInstrument instrument;
};

using Command =
    std::variant<NoteOnCommand, NoteOffCommand, SetInstrumentCommand>;
std::list<Command> command_memory{};

struct CommandVisitor {
  bool operator()(const NoteOnCommand& command) const {
    return std::visit(
        [command](auto& chip) { return chip.KeyOn(command.ch, command.pitch); },
        chip_instance);
  }

  bool operator()(const NoteOffCommand& command) const {
    return std::visit([command](auto& chip) { return chip.KeyOff(command.ch); },
                      chip_instance);
  }

  bool operator()(const SetInstrumentCommand& command) const {
    return std::visit(
        [command](auto& chip) {
          return chip.SetInstrument(command.instrument);
        },
        chip_instance);
  }
};

CommandVisitor command_visitor{};

// Mutex.
std::mutex chip_input_mutex, chip_output_mutex;
}  // namespace

namespace synth {
enum ChipType {
  Ym2608 = 0,
  Ym2612 = 1,
};

bool initializeResampler(std::uint32_t rate) {
  ma_resampler_uninit(&left_resampler, nullptr);
  ma_resampler_uninit(&right_resampler, nullptr);

  const auto internal_rate = std::visit(
      [](const auto& chip) { return chip.sampling_rate(); }, chip_instance);

  ma_resampler_config config = ma_resampler_config_init(
      ma_format_f32, 1, internal_rate, rate, ma_resample_algorithm_linear);

  if (ma_resampler_init(&config, nullptr, &left_resampler) != MA_SUCCESS ||
      ma_resampler_init(&config, nullptr, &right_resampler) != MA_SUCCESS) {
    return false;
  }

  return true;
}

bool SetSamplingRate(std::uint32_t rate) {
  std::scoped_lock lock(chip_input_mutex, chip_output_mutex);

  bool result = initializeResampler(rate);
  if (result) {
    sampling_rate = rate;
  }

  return result;
}

bool ChangeChip(int type) {
  std::scoped_lock lock(chip_input_mutex, chip_output_mutex);

  switch (static_cast<ChipType>(type)) {
    case ChipType::Ym2608:
      if (!std::holds_alternative<synth::chip::Ym2608>(chip_instance)) {
        chip_instance.emplace<synth::chip::Ym2608>();
      }
      break;

    case ChipType::Ym2612:
    if (!std::holds_alternative<synth::chip::Ym2612>(chip_instance)) {
      chip_instance.emplace<synth::chip::Ym2612>();
    }
    break;

    default:
      // Unsupported chip type.
      return false;
  }

  // Reset note-on memory.
  const auto num_channels = std::visit(
      [](const auto& chip) { return chip.num_channels(); }, chip_instance);
  keyboard = Keyboard(num_channels);

  return initializeResampler(sampling_rate);
}

bool Initialize() { return ChangeChip(ChipType::Ym2608); }

bool Deinitialize() {
  std::lock_guard<std::mutex> lock(chip_output_mutex);

  ma_resampler_uninit(&left_resampler, nullptr);
  ma_resampler_uninit(&right_resampler, nullptr);

  return true;
}

void Reset() {
  std::visit([](auto& chip) { chip.Reset(); }, chip_instance);
}

void KeyOn(int id, int octave, int semitone) {
  std::lock_guard<std::mutex> lock(chip_input_mutex);

  const auto [key_on_ch, key_off_ch] = keyboard.KeyOn(id);

  if (key_off_ch) {
    command_memory.push_back(NoteOffCommand{key_off_ch.value()});
  }

  command_memory.push_back(NoteOnCommand{key_on_ch, {octave, semitone}});
}

void KeyOff(int id) {
  std::lock_guard<std::mutex> lock(chip_input_mutex);

  const auto key_off_ch = keyboard.KeyOff(id);

  if (key_off_ch) {
    command_memory.push_back(NoteOffCommand{key_off_ch.value()});
  }
}

void SetInstrument(const FmInstrument& instrument) {
  std::lock_guard<std::mutex> lock(chip_input_mutex);

  command_memory.push_back(SetInstrumentCommand{instrument});
}

bool Generate(emscripten::val left_buffer, emscripten::val right_buffer,
              std::uint32_t num_samples) {
  {
    std::lock_guard<std::mutex> lock(chip_input_mutex);

    while (!command_memory.empty()) {
      if (!std::visit(command_visitor, command_memory.front())) {
        return false;
      }
      command_memory.pop_front();
    }
  }

  {
    std::lock_guard<std::mutex> lock(chip_output_mutex);

    ma_uint64 required_input_samples = 0;
    ma_uint64 output_samples = static_cast<ma_uint64>(num_samples);
    if (ma_resampler_get_required_input_frame_count(
            &left_resampler, output_samples, &required_input_samples) !=
        MA_SUCCESS) {
      return false;
    }

    if (required_input_samples > original_rate_buffer[0].size()) {
      original_rate_buffer[0].resize(required_input_samples, 0.f);
      original_rate_buffer[1].resize(required_input_samples, 0.f);
    }

    if (!std::visit(
            [required_input_samples](auto& chip) {
              return chip.Generate(
                  original_rate_buffer[0].data(),
                  original_rate_buffer[1].data(),
                  static_cast<std::uint32_t>(required_input_samples));
            },
            chip_instance)) {
      return false;
    }

    if (num_samples > resampled_rate_buffer[0].size()) {
      resampled_rate_buffer[0].resize(num_samples);
      resampled_rate_buffer[1].resize(num_samples);
    }

    ma_resampler_process_pcm_frames(
        &left_resampler, original_rate_buffer[0].data(),
        &required_input_samples, resampled_rate_buffer[0].data(),
        &output_samples);
    ma_resampler_process_pcm_frames(
        &right_resampler, original_rate_buffer[1].data(),
        &required_input_samples, resampled_rate_buffer[1].data(),
        &output_samples);

    // Copy the generated data to the SharedArrayBuffer.
    auto float32_array = emscripten::val::global("Float32Array");
    auto left_view = float32_array.new_(
        emscripten::typed_memory_view(num_samples, resampled_rate_buffer[0].data()));
    auto right_view = float32_array.new_(
        emscripten::typed_memory_view(num_samples, resampled_rate_buffer[1].data()));
    left_buffer.call<void>("set", left_view, emscripten::val(0));
    right_buffer.call<void>("set", right_view, emscripten::val(0));
  }

  return true;
}
}  // namespace synth

EMSCRIPTEN_BINDINGS(synth_module) {
  using namespace synth;

  emscripten::value_array<std::array<FmOperator, 4>>("FmOperatorArray")
      .element(emscripten::index<0>())
      .element(emscripten::index<1>())
      .element(emscripten::index<2>())
      .element(emscripten::index<3>());

  emscripten::value_object<FmOperator>("FmOperator")
      .field("ar", &FmOperator::ar)
      .field("dr", &FmOperator::dr)
      .field("sr", &FmOperator::sr)
      .field("rr", &FmOperator::rr)
      .field("sl", &FmOperator::sl)
      .field("tl", &FmOperator::tl)
      .field("ks", &FmOperator::ks)
      .field("ml", &FmOperator::ml)
      .field("dt", &FmOperator::dt)
      .field("ssgEg", &FmOperator::ssg_eg)
      .field("am", &FmOperator::am);

  emscripten::value_object<FmInstrument>("FmInstrument")
      .field("al", &FmInstrument::al)
      .field("fb", &FmInstrument::fb)
      .field("op", &FmInstrument::op)
      .field("lfoFreq", &FmInstrument::lfo_freq)
      .field("ams", &FmInstrument::ams)
      .field("pms", &FmInstrument::pms);

  emscripten::function("initialize", &Initialize);
  emscripten::function("deinitialize", &Deinitialize);
  emscripten::function("reset", &Reset);
  emscripten::function("changeChip", &ChangeChip);
  emscripten::function("setSamplingRate", &SetSamplingRate);
  emscripten::function("keyOn", &KeyOn);
  emscripten::function("keyOff", &KeyOff);
  emscripten::function("setInstrument", &SetInstrument);
  emscripten::function("generate", &Generate);
}
