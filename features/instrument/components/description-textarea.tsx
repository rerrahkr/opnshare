import type React from "react";
import { Textarea } from "@/components/ui/textarea";
import { MAX_DESCRIPTION_LENGTH } from "../models";

type DescriptionTextareaProps = {
  placeholder?: string | undefined;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean | undefined;
};

export function DescriptionTextarea({
  value,
  onChange: setValue,
  placeholder,
  disabled,
}: DescriptionTextareaProps): React.JSX.Element {
  const maxLength = MAX_DESCRIPTION_LENGTH;

  return (
    <>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        rows={4}
        placeholder={placeholder}
        disabled={disabled}
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength}
      </div>
    </>
  );
}
