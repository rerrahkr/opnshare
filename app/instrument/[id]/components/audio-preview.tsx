"use client";

import type React from "react";
import { FaVolumeUp } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FmInstrument } from "@/features/instrument/types";
import { AudioPreviewContent } from "@/features/preview/components/audio-preview";

type AudioPreviewProps = {
  instrument: FmInstrument;
};

export function AudioPreview({
  instrument,
}: AudioPreviewProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FaVolumeUp className="h-5 w-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AudioPreviewContent instrument={instrument} octaveRange={4} />
      </CardContent>
    </Card>
  );
}
