"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  FaDownload,
  FaEdit,
  FaEllipsisV,
  FaExclamationCircle,
  FaHeart,
  FaShare,
  FaSpinner,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  isLikedInstrument,
  likeInstrument,
  unlikeInstrument,
} from "@/features/instrument/api";
import {
  EXPORTABLE_FORMATS,
  type ExportableFormat,
  getInstrumentExporter,
} from "@/features/instrument/exporter";
import type { RecommendedChip } from "@/features/instrument/models";
import type { FmInstrument, FmOperator } from "@/features/instrument/types";
import { useAuthUser, useAuthUserId } from "@/stores/auth";
import { isoStringToLocaleString } from "@/utils/date";
import { TextExportDialog } from "./text-export-dialog";

// import { AudioPreview } from "./components/audio-preview";

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

type LikeState = {
  isLiked: boolean;
  likeCount: number;
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
  const authedUser = useAuthUser();
  const authedUserId = useAuthUserId();

  const [isPending, startTransition] = useTransition();

  const [likeState, setLikeState] = useState<LikeState>({
    isLiked: false,
    likeCount,
  });

  const exportTargets = EXPORTABLE_FORMATS;
  const [exportTarget, setExportTarget] = useState<ExportableFormat>("Furnace");
  const [textExportOpen, setTextExportOpen] = useState<boolean>(false);
  const [exportedText, setExportedText] = useState<string>("");

  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Edit state
  const [editInstrumentName, setEditInstrumentName] = useState<string>(name);
  const [editDescription, setEditDescription] = useState<string>(description);
  const [editTags, setEditTags] = useState<string[]>(tags);
  const [newTag, setNewTag] = useState("");

  const isOwnInstrument = authedUserId === authorUserId;

  useEffect(() => {
    if (!authedUser) {
      setLikeState((prev) => ({ ...prev, isLiked: false }));
    } else {
      (async () => {
        const isLiked = await isLikedInstrument(id, authedUser.uid);
        setLikeState((prev) => ({ ...prev, isLiked }));
      })();
    }
  }, [authedUser, id]);

  function handleExport() {
    const exporter = getInstrumentExporter(exportTarget);
    if (exporter.type === "file") {
      try {
        const buffer = exporter.exporter(instrument, name);
        const file = new File([buffer], `${name}${exporter.extension}`);
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

  const addTag = () => {
    if (newTag && editTags.length < 5 && !editTags.includes(newTag)) {
      setEditTags([...editTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  const handleEdit = () => {
    // Edit processing
    setEditOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Random failure (50% chance)
      if (Math.random() < 0.5) {
        throw new Error(
          "An error occurred during deletion. Please try again later."
        );
      }

      // On success, return to user page
      router.push("/user/johndoe");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "An error occurred during deletion."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
  };

  const handleChipClick = () => {
    router.push(`/search?chip=${encodeURIComponent(recommendedChip)}`);
  };

  async function handleLikeToggle() {
    if (isPending || !authedUser) {
      return;
    }

    startTransition(async () => {
      try {
        if (likeState.isLiked) {
          await unlikeInstrument(id, authedUser.uid);
          setLikeState((prev) => ({
            isLiked: !prev.isLiked,
            likeCount: prev.likeCount - 1,
          }));
        } else {
          await likeInstrument(id, authedUser.uid);
          setLikeState((prev) => ({
            isLiked: !prev.isLiked,
            likeCount: prev.likeCount + 1,
          }));
        }
      } catch {}
    });
  }

  const [shareUrl, setShareUrl] = useState<string>("");
  useEffect(() => {
    setShareUrl(`${window.location.origin}/instrument/${id}`);
  }, [id]);

  return (
    <>
      {/* Main Content */}
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{name}</h1>
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
              <Button
                variant={likeState.isLiked ? "default" : "outline"}
                onClick={handleLikeToggle}
                className="flex items-center gap-2"
                disabled={!authedUser}
              >
                <FaHeart
                  className={`h-4 w-4 ${likeState.isLiked ? "fill-current" : ""}`}
                />
                {likeState.isLiked ? "Liked" : "Like"}
                <span className="text-sm">{likeState.likeCount}</span>
              </Button>

              <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FaShare className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out Epic Lead Sound!")}&url=${encodeURIComponent(shareUrl)}`
                      )
                    }
                  >
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
              {tags.map((tag) => (
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
                {recommendedChip}
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
                {description}
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
        {/* <AudioPreview /> */}

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

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Instrument</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Instrument Name *</Label>
              <Input
                value={editInstrumentName}
                onChange={(e) => setEditInstrumentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags (max 5)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button onClick={addTag} disabled={editTags.length >= 5}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    {tag}
                    <FaTimes
                      className="h-3 w-3 ml-1"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description (max 500 characters)
              </Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className="text-xs text-muted-foreground text-right">
                {editDescription.length}/500
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instrument</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this instrument? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <FaExclamationCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TextExportDialog
        format={exportTarget}
        text={exportedText}
        open={textExportOpen}
        onOpenChange={setTextExportOpen}
      />
    </>
  );
}
