"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LuUpload, LuX, LuFileText, LuBinary, LuAlertCircle, LuLoader2 } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UploadPage() {
  const router = useRouter()
  const [timbeName, setTimbeName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"file" | "text">("file")
  const [textInput, setTextInput] = useState("")
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedChip, setSelectedChip] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [textDialogOpen, setTextDialogOpen] = useState(false)
  const [textError, setTextError] = useState("")
  const [hasValidTextData, setHasValidTextData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const driverChipMap: Record<string, string[]> = {
    PMD: ["OPN", "OPNA", "OPM"],
    FMP: ["OPN", "OPNA"],
    BambooTracker: ["OPN2", "OPL3"],
    Furnace: ["OPN", "OPN2", "OPL3", "OPM"],
  }

  const addTag = () => {
    if (newTag && tags.length < 5 && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // ファイル検証（仮実装：mp3のみ許可）
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
      if (fileExtension === "mp3") {
        setFile(selectedFile)
        setFileError("")
      } else {
        setFile(null)
        setFileError("Unsupported file format. Please select an mp3 file.")
      }
    }
  }

  const handleDriverChange = (driver: string) => {
    setSelectedDriver(driver)
    setSelectedChip("") // チップ選択をリセット
  }

  const handleTextImport = () => {
    // テキスト検証（仮実装：「1234」のみ許可）
    if (textInput.trim() === "1234") {
      setTextError("")
      setHasValidTextData(true)
      setTextDialogOpen(false)
    } else {
      setTextError("Invalid instrument data. Please enter in correct format.")
    }
  }

  const handleTextDialogClose = () => {
    setTextDialogOpen(false)
    setTextError("")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // 仮の投稿処理（mp3ファイルの場合は失敗）
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 2秒待機

      if (uploadMethod === "file" && file) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase()
        if (fileExtension === "mp3") {
          throw new Error("An error occurred while processing the mp3 file. Please try a different file format.")
        }
      }

      // 投稿成功 - 完了ページに遷移
      router.push("/upload/success")
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred during upload.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Instrument</h1>
          <p className="text-muted-foreground">Share your instruments and let other users discover them</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timbre Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Instrument Name *</label>
              <Input
                placeholder="e.g. Epic Lead Sound"
                value={timbeName}
                onChange={(e) => setTimbeName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (max 5)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  disabled={isSubmitting}
                />
                <Button onClick={addTag} disabled={tags.length >= 5 || isSubmitting}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <LuX className="h-3 w-3 ml-1" onClick={() => !isSubmitting && removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (max 500 characters)</label>
              <Textarea
                placeholder="Describe the characteristics and usage of this instrument..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                disabled={isSubmitting}
              />
              <div className="text-xs text-muted-foreground text-right">{description.length}/500</div>
            </div>
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
                <LuBinary className="h-6 w-6 mb-2" />
                Binary File
              </Button>
              <Button
                variant={uploadMethod === "text" ? "default" : "outline"}
                className="h-20 flex flex-col"
                onClick={() => setUploadMethod("text")}
                disabled={isSubmitting}
              >
                <LuFileText className="h-6 w-6 mb-2" />
                Text Input
              </Button>
            </div>

            {/* File Upload */}
            {uploadMethod === "file" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center relative">
                  <LuUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drop files here or click to select</p>
                    <p className="text-xs text-muted-foreground">Supported format: .mp3</p>
                  </div>
                  {!isSubmitting && (
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                  )}
                </div>

                {fileError && (
                  <Alert variant="destructive">
                    <LuAlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}

                {file && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">{file.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isSubmitting}>
                      <LuX className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            {uploadMethod === "text" && (
              <div className="space-y-4">
                <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent" disabled={isSubmitting}>
                      <LuFileText className="h-4 w-4 mr-2" />
                      Input as Text
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Instrument Data Input</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Driver Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sound Driver *</label>
                        <Select value={selectedDriver} onValueChange={handleDriverChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(driverChipMap).map((driver) => (
                              <SelectItem key={driver} value={driver}>
                                {driver}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Chip Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chip Type *</label>
                        <Select value={selectedChip} onValueChange={setSelectedChip} disabled={!selectedDriver}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chip" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDriver &&
                              driverChipMap[selectedDriver]?.map((chip) => (
                                <SelectItem key={chip} value={chip}>
                                  {chip}
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

                      {textError && (
                        <Alert variant="destructive">
                          <LuAlertCircle className="h-4 w-4" />
                          <AlertDescription>{textError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleTextDialogClose}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleTextImport}
                          disabled={!selectedDriver || !selectedChip || !textInput.trim()}
                        >
                          Import
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {hasValidTextData && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Text data imported successfully ({selectedDriver} - {selectedChip})
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
              <LuAlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <Button
            disabled={!timbeName || (!file && !hasValidTextData) || isSubmitting}
            className="px-8"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <LuLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
