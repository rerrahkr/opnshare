// SPDX-FileCopyrightText: 2025 Rerrah
// SPDX-License-Identifier: MIT

#pragma once

#include <array>
#include <cstdint>

namespace synth {
struct FmOperator {
  std::uint8_t ar;
  std::uint8_t dr;
  std::uint8_t sr;
  std::uint8_t rr;
  std::uint8_t sl;
  std::uint8_t tl;
  std::uint8_t ks;
  std::uint8_t ml;
  std::uint8_t dt;
  std::uint8_t ssg_eg;
  bool am;
};

struct FmInstrument {
  std::uint8_t al;
  std::uint8_t fb;

  std::array<FmOperator, 4> op;

  std::uint8_t lfo_freq;
  std::uint8_t ams;
  std::uint8_t pms;
};
}  // namespace synth
