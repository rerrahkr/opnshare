import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type TextExportDialogProps = {
  format: string;
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TextExportDialog({
  format,
  text,
  open,
  onOpenChange: setOpen,
}: TextExportDialogProps): React.JSX.Element {
  const [openTooltip, setOpenTooltip] = useState<boolean>(false);

  function handleCopyButtonClick() {
    navigator.clipboard.writeText(text);
    setOpenTooltip(true);
    setTimeout(() => setOpenTooltip(false), 1000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{format} Export</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          You can copy instrument parameters as {format} text.
        </DialogDescription>
        <div className="space-y-4">
          <Textarea
            readOnly
            value={text}
            rows={10}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <TooltipProvider>
              <Tooltip open={openTooltip}>
                <TooltipTrigger asChild>
                  <Button onClick={handleCopyButtonClick}>
                    Copy to Clipboard
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copied!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
