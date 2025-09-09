"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaDownload, FaEdit, FaEllipsisV, FaUser } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShareDropdownMenu } from "@/components/ui/share-dropdown-menu";
import {
  EXPORTABLE_FORMATS,
  type ExportableFormat,
  getInstrumentExporter,
} from "@/features/instrument/exporter";
import type {
  EditableInstrumentMetaInfo,
  RecommendedChip,
} from "@/features/instrument/models";
import type { FmInstrument, FmOperator } from "@/features/instrument/types";
import { useAuthUserId } from "@/stores/auth";
import { isoStringToLocaleString } from "@/utils/date";
import { AudioPreview } from "./audio-preview";
import { DeleteDialog } from "./delete-dialog";
import { InfoEditDialog } from "./info-edit-dialog";
import { LikeButton } from "./like-button";
import { TextExportDialog } from "./text-export-dialog";

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function instrumentToText(instrument: FmInstrument): string {
  function operatorToText(op: FmOperator): string {
    return `AR=${op.ar}, DR=${op.dr}, SR=${op.sr}, RR=${op.rr}, SL=${op.sl}, TL=${op.tl}, KS=${op.ks}, ML=${op.ml}, DT=${op.dt}, AM=${op.am ? "ON" : "OFF"}, SSGEG=${op.ssgEg}`;
  }

  return `AL: ${instrument.al}
FB: ${instrument.fb}
OP1: ${operatorToText(instrument.op[0])}
OP2: ${operatorToText(instrument.op[1])}
OP3: ${operatorToText(instrument.op[2])}
OP4: ${operatorToText(instrument.op[3])}
LFO: Freq=${instrument.lfoFreq}, AMS=${instrument.ams}, PMS=${instrument.pms}`;
}

type InstrumentDetailContentProps = {
  id: string;
  name: string;
  authorName: string;
  authorUserId: string;
  createdDateIso: string;
  likeCount: number;
  tags: string[];
  recommendedChip: RecommendedChip;
  description: string;
  data: FmInstrument;
};

export function InstrumentDetailContent({
  id,
  name,
  authorName,
  authorUserId,
  createdDateIso,
  likeCount,
  tags,
  recommendedChip,
  description,
  data: instrument,
}: InstrumentDetailContentProps) {
  const router = useRouter();
  const authedUserId = useAuthUserId();

  const [metaInfo, setMetaInfo] = useState<EditableInstrumentMetaInfo>({
    name,
    description,
    chip: recommendedChip,
    tags,
  });

  const exportTargets = EXPORTABLE_FORMATS;
  const [exportTarget, setExportTarget] = useState<ExportableFormat>("Furnace");
  const [textExportOpen, setTextExportOpen] = useState<boolean>(false);
  const [exportedText, setExportedText] = useState<string>("");

  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const isOwnInstrument = authedUserId === authorUserId;

  function handleExport() {
    const exporter = getInstrumentExporter(exportTarget);
    if (exporter.type === "file") {
      try {
        const buffer = exporter.exporter(instrument, metaInfo.name);
        const file = new File(
          [buffer],
          `${metaInfo.name}${exporter.extension}`
        );
        downloadFile(file);
      } catch {
        console.error("File export is failed.");
      }
    } else {
      try {
        setExportedText(exporter.exporter(instrument));
        setTextExportOpen(true);
      } catch {
        console.error("Text export is failed.");
      }
    }
  }

  function handleTagClick(tag: string) {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
  }

  function handleChipClick() {
    router.push(`/search?chip=${encodeURIComponent(metaInfo.chip)}`);
  }

  const [sharedUrl, setSharedUrl] = useState<string>("");
  useEffect(() => {
    setSharedUrl(`${window.location.origin}/instrument/${id}`);
  }, [id]);

  return (
    <>
      {/* Main Content */}
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{metaInfo.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Link
                  href={`/user/${authorUserId}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <FaUser className="h-4 w-4" />
                  {authorName}
                </Link>
                <span>&bull;</span>
                <span>{isoStringToLocaleString(createdDateIso)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LikeButton instrumentId={id} likeCount={likeCount} />

              <ShareDropdownMenu
                sharedUrl={sharedUrl}
                messageX={`Check out ${metaInfo.name} by ${authorName}!`}
              />

              {isOwnInstrument && (
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <FaEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <FaEllipsisV className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>

          {/* Tags and Recommended Chip */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {metaInfo.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Recommended Chip:</span>
              <Badge
                variant="outline"
                className="px-3 py-1 cursor-pointer hover:bg-accent transition-colors"
                onClick={handleChipClick}
              >
                {metaInfo.chip}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-0 h-auto font-normal text-left w-full">
              <div className="whitespace-pre-wrap break-words word-break-break-all">
                {metaInfo.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-sm font-medium mb-2 block">Target:</Label>
            <Select
              value={exportTarget}
              onValueChange={(target) =>
                setExportTarget(target as ExportableFormat)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportTargets.map((target) => (
                  <SelectItem key={target} value={target}>
                    {target}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleExport}
            >
              <FaDownload className="h-4 w-4 mr-2" />
              Export ({exportTarget})
            </Button>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <AudioPreview />

        {/* Parameters Section */}
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
      </div>

      <InfoEditDialog
        open={editOpen}
        setOpen={setEditOpen}
        id={id}
        metaInfo={metaInfo}
        setMetaInfo={setMetaInfo}
      />

      <DeleteDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        userId={authedUserId}
        instrumentId={id}
      />

      <TextExportDialog
        format={exportTarget}
        text={exportedText}
        open={textExportOpen}
        onOpenChange={setTextExportOpen}
      />
    </>
  );
}
