import { LucideAlertCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getInstrumentParser,
  SUPPORTED_TEXT_FORMATS,
  type TextFormat,
} from "@/features/instrument/parser";
import type { FmInstrument } from "@/features/instrument/types";

type TextInputDialogButtonProps = {
  disabled?: boolean;
  onImported: (instrument: FmInstrument) => void;
};

export function TextInputDialogButton({
  onImported,
  disabled = false,
}: TextInputDialogButtonProps): React.JSX.Element {
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [selectedTextFormat, setSelectedTextFormat] = useState<
    TextFormat | undefined
  >(undefined);
  const [textInput, setTextInput] = useState("");
  const [textImportError, setTextImportError] = useState<string>("");

  function handleTextImport() {
    if (!selectedTextFormat) {
      return;
    }

    const parser = getInstrumentParser(selectedTextFormat);
    try {
      const instrument = parser(textInput);

      setTextImportError("");
      onImported(instrument);
      setTextDialogOpen(false);
    } catch {
      setTextImportError(
        "Invalid instrument data. Please enter in correct format."
      );
    }
  }

  function handleTextDialogClose() {
    setTextDialogOpen(false);
    setTextImportError("");
  }

  return (
    <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={disabled}
        >
          <FaFileAlt className="h-4 w-4 mr-2" />
          Input as Text
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Instrument Data Input</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Text Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Format *</Label>
            <Select
              value={selectedTextFormat}
              onValueChange={(format) =>
                setSelectedTextFormat(format as TextFormat)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select text format" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TEXT_FORMATS.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Paste instrument data... (For testing: enter 1234)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />

          {textImportError && (
            <Alert variant="destructive">
              <LucideAlertCircle className="h-4 w-4" />
              <AlertDescription>{textImportError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleTextDialogClose}>
              Cancel
            </Button>
            <Button
              onClick={handleTextImport}
              disabled={!selectedTextFormat || !textInput.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
