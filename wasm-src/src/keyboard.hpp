// SPDX-FileCopyrightText: 2025 Rerrah
// SPDX-License-Identifier: MIT

#pragma once

#include <algorithm>
#include <list>
#include <optional>
#include <unordered_map>

namespace synth {
class Keyboard {
 public:
  explicit Keyboard(std::size_t num_polyphony) {
    std::generate_n(
        std::back_inserter(channels_), num_polyphony,
        [ch = static_cast<std::uint8_t>(0)]() mutable { return ch++; });
  }

  std::pair<std::uint8_t, std::optional<std::uint8_t>> KeyOn(
      int id) {
    std::optional<std::uint8_t> key_off_ch;

    if (channels_.empty()) {
      auto popped_id = std::move(key_on_queue_.back());
      key_on_queue_.pop_back();
      key_off_ch = id_to_channel_[popped_id];
      channels_.push_back(key_off_ch.value());
      id_to_channel_.erase(popped_id);
    }

    key_on_queue_.push_front(id);

    std::uint8_t key_on_ch = channels_.front();
    id_to_channel_[id] = key_on_ch;
    channels_.pop_front();

    return std::make_pair(key_on_ch, std::move(key_off_ch));
  }

  std::optional<std::uint8_t> KeyOff(int id) {
    auto it = id_to_channel_.find(id);
    if (it == id_to_channel_.end()) {
      return std::nullopt;
    }

    int key_off_ch = it->second;
    id_to_channel_.erase(it);
    channels_.push_back(key_off_ch);

    key_on_queue_.remove(id);

    return key_off_ch;
  }

 private:
  std::list<int> key_on_queue_;
  std::list<std::uint8_t> channels_;

  std::unordered_map<int, std::uint8_t> id_to_channel_;
};
}  // namespace synth
