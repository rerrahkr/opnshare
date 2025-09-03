import type React from "react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/features/instrument/components/tag-input";
import {
  instrumentTagSchema,
  RECOMMENDED_CHIPS,
  type RecommendedChip,
} from "@/features/instrument/models";
import { MAX_LIKE_COUNT } from "../defines";

type FilterPanelProps = {
  selectedChips: string[];
  onChipChange: (chip: RecommendedChip, checked: boolean) => void;
  filterTags: string[];
  onChangeTags: (tags: string[]) => void;
  likeRange: number[];
  onLikeRangeChange: (range: [number, number]) => void;
};

export function FilterPanel({
  selectedChips,
  onChipChange,
  filterTags,
  onChangeTags,
  likeRange,
  onLikeRangeChange,
}: FilterPanelProps) {
  const chips = RECOMMENDED_CHIPS;

  // State for numeric inputs
  const [likeMin, setLikeMin] = useState<number>(likeRange[0]);
  const [likeMax, setLikeMax] = useState<number>(likeRange[1]);

  // Update input fields when likeRange changes
  useEffect(() => {
    setLikeMin(likeRange[0]);
    setLikeMax(likeRange[1]);
  }, [likeRange]);

  // Correct and update like range
  function handleLikeRangeUpdate() {
    // Range correction
    let min = Math.max(0, Math.min(likeMin, MAX_LIKE_COUNT));
    let max = Math.max(0, Math.min(likeMax, MAX_LIKE_COUNT));

    // Swap if min > max
    if (min > max) {
      [min, max] = [max, min];
    }

    // Update input fields with corrected values
    setLikeMin(min);
    setLikeMax(max);

    // Notify parent component
    onLikeRangeChange([min, max]);
  }

  function getHandleChange(set: React.Dispatch<React.SetStateAction<number>>) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (value !== undefined) {
        set(value);
      }
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Filter by Tags</h3>
        <div className="space-y-3">
          <TagInput
            maxCount={25}
            values={filterTags}
            onChange={onChangeTags}
            small
            validator={(text: string) =>
              instrumentTagSchema.safeParse(text).success
            }
          />
          {filterTags.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Search instruments with these tags
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Chip</h3>
        <div className="space-y-2">
          {chips.map((chip) => (
            <div key={chip} className="flex items-center space-x-2">
              <Checkbox
                id={chip}
                checked={selectedChips.includes(chip)}
                onCheckedChange={(checked) =>
                  onChipChange(chip as RecommendedChip, !!checked)
                }
              />
              <Label htmlFor={chip} className="text-sm cursor-pointer">
                {chip}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Likes</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                min="0"
                max="500"
                value={likeMin}
                onChange={getHandleChange(setLikeMin)}
                onBlur={handleLikeRangeUpdate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLikeRangeUpdate();
                  }
                }}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                min="0"
                max="500"
                value={likeMax}
                onChange={getHandleChange(setLikeMax)}
                onBlur={handleLikeRangeUpdate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLikeRangeUpdate();
                  }
                }}
                className="text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Range: 0-{MAX_LIKE_COUNT}
          </p>
        </div>
      </div>
    </div>
  );
}
