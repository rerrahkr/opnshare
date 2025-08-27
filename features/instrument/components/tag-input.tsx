import type React from "react";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  values: string[];
  maxCount: number;
  onChange: (values: string[]) => void;
  validator?: (text: string) => boolean;
  disabled?: boolean;
};

export function TagInput({
  values,
  maxCount,
  onChange,
  validator = () => true,
  disabled = false,
}: TagInputProps): React.JSX.Element {
  const [newTag, setNewTag] = useState<string>("");

  const canAdd = values.length < maxCount;

  function addTag() {
    if (canAdd && validator(newTag) && !values.includes(newTag)) {
      onChange([...values, newTag]);
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    onChange(values.filter((value) => value !== tag));
  }

  return (
    <>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Enter tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTag();
            }
          }}
          disabled={disabled}
        />
        <Button onClick={addTag} disabled={!canAdd || disabled}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <FaTimes
              className={`h-3 w-3 ml-1 ${canAdd ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={disabled ? undefined : () => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>
    </>
  );
}
