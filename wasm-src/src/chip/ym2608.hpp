// SPDX-FileCopyrightText: 2025 Rerrah
// SPDX-License-Identifier: MIT

#pragma once

#include <cstdint>
#include <memory>

#include "../instrument.hpp"
#include "../pitch.hpp"

namespace ymfm {
class ym2608;
}

namespace synth::chip {
class Ym2608 {
 public:
  Ym2608();
  ~Ym2608();

  bool Reset();

  std::uint32_t sampling_rate() const;
  std::uint8_t num_channels() const { return 6; }

  bool KeyOn(std::uint8_t ch, const Pitch& pitch);
  bool KeyOff(std::uint8_t ch);

  bool SetInstrument(const FmInstrument& instrument);

  bool Generate(float* left_buffer, float* right_buffer,
                std::uint32_t num_samples);

 private:
  std::unique_ptr<ymfm::ym2608> chip_;

  void WriteLow(std::uint8_t address, std::uint8_t data);
  void WriteHigh(std::uint8_t address, std::uint8_t data);
};
}  // namespace synth::chip
