import { instrumentToText } from "@/features/instrument/text";
import type { FmInstrument } from "@/features/instrument/types";

type ParametersPreviewProps = {
  instrument: FmInstrument;
};

export function ParametersView({ instrument }: ParametersPreviewProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
        {instrumentToText(instrument)}
      </pre>
    </div>
  );
}
