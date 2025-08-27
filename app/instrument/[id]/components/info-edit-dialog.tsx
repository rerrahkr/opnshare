import { LucideAlertCircle } from "lucide-react";
import type React from "react";
import { useState, useTransition } from "react";
import { FaSpinner } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateInstrumentDoc } from "@/features/instrument/api";
import { DescriptionTextarea } from "@/features/instrument/components/description-textarea";
import { TagInput } from "@/features/instrument/components/tag-input";
import {
  type EditableInstrumentMetaInfo,
  editableInstrumentMetaInfoSchema,
  instrumentTagSchema,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGS,
  RECOMMENDED_CHIPS,
  type RecommendedChip,
} from "@/features/instrument/models";

type InfoEditDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
  metaInfo: EditableInstrumentMetaInfo;
  setMetaInfo: (metaInfo: EditableInstrumentMetaInfo) => void;
};

export function InfoEditDialog({
  open,
  setOpen,
  id,
  metaInfo,
  setMetaInfo,
}: InfoEditDialogProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState<string>(metaInfo.name);
  const [invalidName, setInvalidName] = useState<string>("");
  const [selectedChip, setSelectedChip] = useState<RecommendedChip>(
    metaInfo.chip
  );
  const [tags, setTags] = useState<string[]>(metaInfo.tags);
  const [invalidTags, setInvalidTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>(metaInfo.description);
  const [invalidDescription, setInvalidDescription] = useState<string>("");

  const [updateError, setUpdateError] = useState<string>("");

  function handleSubmit() {
    setInvalidName("");
    setInvalidTags([]);
    setInvalidDescription("");
    setUpdateError("");

    const newInfo: EditableInstrumentMetaInfo = {
      name,
      chip: selectedChip,
      tags,
      description,
    };
    const parseResult = editableInstrumentMetaInfoSchema.safeParse(newInfo);
    if (!parseResult.success) {
      const errors = parseResult.error.format();
      if (errors.name) {
        setInvalidName(errors.name._errors[0]);
      }
      if (errors.description) {
        setInvalidDescription(errors.description._errors[0]);
      }
      if (errors.tags) {
        const tagError = errors.tags;
        let messages: string[] = [];
        if (Array.isArray(tagError)) {
          for (let i = 0; i < tagError.length; i++) {
            const error = tagError[i];
            if ("_errors" in error && error._errors.length > 0) {
              messages = [
                ...messages,
                `${tags.at(i) ?? ""}: ${error._errors[0]}`,
              ];
            }
          }
        }
        if ("_errors" in tagError) {
          messages = [...messages, tagError._errors[0]];
        }
        setInvalidTags(messages);
      }
      return;
    }

    startTransition(async () => {
      try {
        await updateInstrumentDoc(id, newInfo);
        setMetaInfo(newInfo);
        setOpen(false);
      } catch {
        setUpdateError("An error occurred during upload.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Instrument</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Instrument Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
          {invalidName !== "" && (
            <Alert variant="destructive" className="w-full">
              <LucideAlertCircle className="h-4 w-4" />
              <AlertDescription>{invalidName}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Recommended Chip *</Label>
            <Select
              value={selectedChip}
              onValueChange={(value) =>
                setSelectedChip(value as RecommendedChip)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chip" />
              </SelectTrigger>
              <SelectContent>
                {RECOMMENDED_CHIPS.map((chip) => (
                  <SelectItem key={chip} value={chip}>
                    {chip}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags (max {MAX_TAGS})</Label>
            <TagInput
              values={tags}
              maxCount={MAX_TAGS}
              onChange={setTags}
              validator={(tag) => instrumentTagSchema.safeParse(tag).success}
              disabled={isPending}
            />
          </div>
          {invalidTags.length > 0 && (
            <Alert variant="destructive" className="w-full">
              <LucideAlertCircle className="h-4 w-4" />
              <AlertDescription>
                {invalidTags.length === 1 ? (
                  invalidTags[0]
                ) : (
                  <ul className="list-inside list-disc">
                    {invalidTags.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Description (max {MAX_DESCRIPTION_LENGTH} characters)
            </Label>
            <DescriptionTextarea
              value={description}
              onChange={setDescription}
              disabled={isPending}
            />
          </div>
          {invalidDescription !== "" && (
            <Alert variant="destructive" className="w-full">
              <LucideAlertCircle className="h-4 w-4" />
              <AlertDescription>{invalidDescription}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-end space-y-3">
            {updateError && (
              <Alert variant="destructive" className="w-full">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={isPending || !name} onClick={handleSubmit}>
                {isPending ? (
                  <>
                    <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
