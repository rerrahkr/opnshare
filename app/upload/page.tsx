"use client";

import { LucideAlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import {
  FaFileAlt,
  FaMemory,
  FaSpinner,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createInstrumentDoc } from "@/features/instrument/api";
import {
  getInstrumentLoader,
  READABLE_FILE_EXTENSIONS,
} from "@/features/instrument/loader";
import {
  type EditableInstrumentMetaInfo,
  editableInstrumentMetaInfoSchema,
  instrumentTagSchema,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGS,
  type RecommendedChip,
} from "@/features/instrument/models";
import type { FmInstrument } from "@/features/instrument/types";
import { useAuthUser } from "@/stores/auth";
import { TagInput } from "./components/tag-input";
import { TextInputDialogButton } from "./components/text-input-dialog-button";

type UploadMethod = "file" | "text";
type ImportStatus = UploadMethod | "none";

const RECOMMENDED_CHIP_SELECTION: RecommendedChip[] = [
  "OPN",
  "OPNA",
  "OPNB",
  "OPN2",
];

export default function UploadPage() {
  const router = useRouter();
  const user = useAuthUser();
  const userUid = user?.uid ?? "";

  const [instName, setInstName] = useState<string>("");
  const [invalidName, setInvalidName] = useState<string>("");
  const [selectedChip, setSelectedChip] = useState<RecommendedChip | undefined>(
    undefined
  );
  const [tags, setTags] = useState<string[]>([]);
  const [invalidTags, setInvalidTags] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [invalidDescription, setInvalidDescription] = useState<string>("");

  const [uploadMethod, setUploadMethod] = useState<UploadMethod>("file");
  const [importStatus, setImportStatus] = useState<ImportStatus>("none");
  const [instrument, setInstrument] = useState<FmInstrument | undefined>(
    undefined
  );

  const [binFile, setBinFile] = useState<File | undefined>(undefined);
  const [fileLoadError, setFileLoadError] = useState<string>("");
  const supportedFileExtensions = READABLE_FILE_EXTENSIONS;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [router, user]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      const instrumentLoader = getInstrumentLoader(selectedFile);
      const buffer = await selectedFile.arrayBuffer();
      const [loadedInstrument] = instrumentLoader(buffer);

      setInstrument(loadedInstrument);
      setBinFile(selectedFile);
      setFileLoadError("");
      setImportStatus("file");
    } catch {
      setInstrument(undefined);
      setBinFile(undefined);
      setFileLoadError("Unsupported file format.");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setInvalidName("");
    setInvalidTags([]);
    setInvalidDescription("");
    setSubmitError("");

    try {
      if (selectedChip === undefined || instrument === undefined) {
        return;
      }

      const metaInfo: EditableInstrumentMetaInfo = {
        name: instName,
        description,
        chip: selectedChip,
        tags,
      };
      const parseResult = editableInstrumentMetaInfoSchema.safeParse(metaInfo);
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

      try {
        await createInstrumentDoc(userUid, instrument, metaInfo);

        router.push("/upload/success");
      } catch (error: unknown) {
        console.log(error);
        setSubmitError("An error occurred during upload.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Instrument</h1>
          <p className="text-muted-foreground">
            Share your instruments and let other users discover them
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instrument Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Instrument Name *</Label>
              <Input
                placeholder="e.g. Epic Lead"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {invalidName !== "" && (
              <Alert variant="destructive" className="w-full">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidName}</AlertDescription>
              </Alert>
            )}

            {/* Recommended Chip*/}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recommended Chip *</Label>
              <Select
                onValueChange={(value) =>
                  setSelectedChip(value as RecommendedChip)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chip" />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDED_CHIP_SELECTION.map((chip) => (
                    <SelectItem key={chip} value={chip}>
                      {chip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tags (max {MAX_TAGS} tags)
              </Label>
              <TagInput
                values={tags}
                maxCount={MAX_TAGS}
                onChange={setTags}
                validator={(tag) => instrumentTagSchema.safeParse(tag).success}
                disabled={isSubmitting}
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

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description (max {MAX_DESCRIPTION_LENGTH} characters)
              </Label>
              <Textarea
                placeholder="Describe the characteristics and usage of this instrument..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={4}
                disabled={isSubmitting}
              />
              <div className="text-xs text-muted-foreground text-right">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </div>
            </div>
            {invalidDescription !== "" && (
              <Alert variant="destructive" className="w-full">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidDescription}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Method Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={uploadMethod === "file" ? "default" : "outline"}
                className="h-20 flex flex-col"
                onClick={() => setUploadMethod("file")}
                disabled={isSubmitting}
              >
                <FaMemory className="h-6 w-6 mb-2" />
                Binary File
              </Button>
              <Button
                variant={uploadMethod === "text" ? "default" : "outline"}
                className="h-20 flex flex-col"
                onClick={() => setUploadMethod("text")}
                disabled={isSubmitting}
              >
                <FaFileAlt className="h-6 w-6 mb-2" />
                Text Input
              </Button>
            </div>

            {/* File Upload */}
            {uploadMethod === "file" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center relative">
                  <FaUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Drop files here or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported format: {supportedFileExtensions.join(", ")}
                    </p>
                  </div>
                  {!isSubmitting && (
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept={supportedFileExtensions.join(",")}
                      onChange={handleFileChange}
                    />
                  )}
                </div>

                {fileLoadError && (
                  <Alert variant="destructive">
                    <LucideAlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileLoadError}</AlertDescription>
                  </Alert>
                )}

                {binFile && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{binFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInstrument(undefined);
                        setBinFile(undefined);
                      }}
                      disabled={isSubmitting}
                    >
                      <FaTimes className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            {uploadMethod === "text" && (
              <div className="space-y-4">
                <TextInputDialogButton
                  disabled={isSubmitting}
                  onImported={(newInstrument) => {
                    setInstrument(newInstrument);
                    setImportStatus("text");
                    setBinFile(undefined);
                  }}
                />

                {importStatus === "text" && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Text data imported successfully
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end space-y-3">
          {submitError && (
            <Alert variant="destructive" className="w-full">
              <LucideAlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Button
            disabled={
              !instName ||
              importStatus === "none" ||
              selectedChip === undefined ||
              isSubmitting
            }
            className="px-8"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
