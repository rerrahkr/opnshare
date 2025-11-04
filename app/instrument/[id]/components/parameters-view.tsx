import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { instrumentToText } from "@/features/instrument/text";
import type { FmInstrument } from "@/features/instrument/types";

type ParametersViewProps = {
  instrument: FmInstrument;
};

export function ParametersView({
  instrument,
}: ParametersViewProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted rounded-lg">
          <pre className="text-xs font-mono whitespace-pre-wrap break-words">
            {instrumentToText(instrument)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
