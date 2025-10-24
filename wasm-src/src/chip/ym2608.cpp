// SPDX-FileCopyrightText: 2025 Rerrah
// SPDX-License-Identifier: MIT

#include "ym2608.hpp"

#include <array>
#include <limits>

#include "ymfm_opn.h"

namespace {
ymfm::ymfm_interface ymfm_common_interface{};

constexpr std::uint32_t kClock{3'993'600 * 2};

std::uint16_t PitchToBlockAndFNumber(const synth::Pitch& pitch) {
  static std::int16_t fnum_table[12] = {
      0x0266, 0x028b, 0x02b2, 0x02db, 0x0307, 0x0334,
      0x0365, 0x0398, 0x03ce, 0x0406, 0x0442, 0x0480,
  };

  return (pitch.octave << 11) | fnum_table[static_cast<int>(pitch.semitone)];
}

constexpr std::uint8_t kSlotFlags = 0xf0;
constexpr std::uint8_t kHighChannelKeyOnFlag = 0x04;
constexpr std::uint8_t kCenterPanning = 0xc0;

class Ym2608InstrumentView {
 public:
  explicit Ym2608InstrumentView(const synth::FmInstrument& instrument) noexcept
      : instrument_(instrument) {}

  std::uint8_t value_fb_al() const noexcept {
    return (instrument_.fb & 0x7) >> 3 | (instrument_.al & 0x7);
  }

  std::uint8_t value_lfo_freq() const noexcept {
    return instrument_.lfo_freq & 0xf;
  }

  std::uint8_t value_ams_pms() const noexcept {
    return (instrument_.ams & 0x3) << 4 | (instrument_.pms & 0x7);
  }

  class OperatorView;

  OperatorView operator_view(std::size_t index) const {
    return OperatorView(instrument_.op.at(index));
  }

  class OperatorView {
   public:
    std::uint8_t value_dt_ml() const noexcept {
      return (op_.dt & 0x7) << 4 | (op_.ml & 0xF);
    }

    std::uint8_t value_ks_ar() const noexcept {
      return (op_.ks & 0x3) << 6 | (op_.ar & 0x1F);
    }

    std::uint8_t value_am_dr() const noexcept {
      return (op_.am ? 0x80 : 0) | (op_.dr & 0x1F);
    }

    std::uint8_t value_sl_rr() const noexcept {
      return (op_.sl & 0xF) << 4 | (op_.rr & 0xF);
    }

    std::uint8_t value_sr() const noexcept { return op_.sr & 0x1F; }

    std::uint8_t value_ssg_eg() const noexcept { return op_.ssg_eg & 0xF; }

    std::uint8_t value_tl() const noexcept { return op_.tl & 0x7F; }

   private:
    explicit OperatorView(const synth::FmOperator& op) noexcept : op_(op) {}

    const synth::FmOperator& op_;

    friend OperatorView Ym2608InstrumentView::operator_view(
        std::size_t index) const;
  };

 private:
  const synth::FmInstrument& instrument_;
};
}  // namespace

namespace synth::chip {
Ym2608::Ym2608()
    : chip_(std::make_unique<ymfm::ym2608>(ymfm_common_interface)) {
  chip_->set_fidelity(ymfm::OPN_FIDELITY_MIN);

  Reset();
}

Ym2608::~Ym2608() = default;

bool Ym2608::Reset() {
  if (!chip_) {
    return false;
  }

  chip_->reset();

  WriteLow(0x29, 0x80);  // Emit interrupt / YM2608 mode

  WriteLow(0x27, 0);  // Disable FM 3ch extended mode

  for (std::uint8_t ch = 0; ch < 3; ++ch) {
    WriteLow(0xB4 + ch, kCenterPanning);
    WriteHigh(0xB4 + ch, kCenterPanning);
  }

  return true;
}

std::uint32_t Ym2608::sampling_rate() const {
  return chip_ ? chip_->sample_rate(kClock) : 0;
}

bool Ym2608::KeyOn(std::uint8_t ch, const Pitch& pitch) {
  if (!chip_) {
    return false;
  }

  std::uint16_t block_and_fnum = PitchToBlockAndFNumber(pitch);

  if (ch < 3) {
    WriteLow(0xA4 + ch, block_and_fnum >> 8);
    WriteLow(0xA0 + ch, block_and_fnum & 0xFF);
    WriteLow(0x28, kSlotFlags | ch);
  } else if (ch < 6) {
    const auto high_ch = ch - 3;
    WriteHigh(0xA4 + high_ch, block_and_fnum >> 8);
    WriteHigh(0xA0 + high_ch, block_and_fnum & 0xFF);
    WriteLow(0x28, kSlotFlags | kHighChannelKeyOnFlag | high_ch);
  }

  return true;
}

bool Ym2608::KeyOff(std::uint8_t ch) {
  if (!chip_) {
    return false;
  }

  if (ch < 3) {
    WriteLow(0x28, ~kSlotFlags & ch);
  } else if (ch < 6) {
    const auto high_ch = ch - 3;
    WriteLow(0x28, ~kSlotFlags & (kHighChannelKeyOnFlag | high_ch));
  }

  return true;
}

bool Ym2608::SetInstrument(const FmInstrument& instrument) {
  if (!chip_) {
    return false;
  }

  WriteLow(0x22, instrument.lfo_freq);

  const auto write_low_and_high = [this](std::uint8_t address,
                                         std::uint8_t data) {
    WriteLow(address, data);
    WriteHigh(address, data);
  };

  Ym2608InstrumentView inst_view{instrument};

  for (std::uint8_t ch_offset = 0; ch_offset < 3; ++ch_offset) {
    write_low_and_high(0xB0 + ch_offset, inst_view.value_fb_al());

    write_low_and_high(0xB4 + ch_offset,
                       kCenterPanning | inst_view.value_ams_pms());

    static const std::array<std::uint8_t, 4> kOpOffset{0x0, 0x8, 0x4, 0xC};
    for (std::size_t i = 0; i < 4; ++i) {
      std::uint8_t op_offset = kOpOffset.at(i);
      auto op_view = inst_view.operator_view(i);

      const auto write_op = [write_low_and_high, ch_offset, op_offset](
                                std::uint8_t address, std::uint8_t data) {
        write_low_and_high(address + ch_offset + op_offset, data);
      };

      write_op(0x30, op_view.value_dt_ml());
      write_op(0x40, op_view.value_tl());
      write_op(0x50, op_view.value_ks_ar());
      write_op(0x60, op_view.value_am_dr());
      write_op(0x70, op_view.value_sr());
      write_op(0x80, op_view.value_sl_rr());
      write_op(0x90, op_view.value_ssg_eg());
    }
  }

  return true;
}

void Ym2608::WriteLow(std::uint8_t address, std::uint8_t data) {
  // if (!chip_) {
  //   return;
  // }

  chip_->write_address(address);
  chip_->write_data(data);
}

void Ym2608::WriteHigh(std::uint8_t address, std::uint8_t data) {
  // if (!chip_) {
  //   return;
  // }

  chip_->write_address_hi(address & 0xFF);
  chip_->write_data_hi(data);
}

bool Ym2608::Generate(float* left_buffer, float* right_buffer,
                      std::uint32_t num_samples) {
  if (!chip_) {
    return false;
  }

  ymfm::ym2608::output_data output;
  for (std::uint32_t i = 0; i < num_samples; ++i) {
    chip_->generate(&output);

    static constexpr float kNormalizeFactor =
        std::numeric_limits<std::int16_t>::max();
    left_buffer[i] = output.data[0] / kNormalizeFactor;
    right_buffer[i] = output.data[1] / kNormalizeFactor;
  }

  return true;
}
}  // namespace synth::chip
