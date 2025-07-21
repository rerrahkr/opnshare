"use client"

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LuArrowLeft,
  LuHeart,
  LuDownload,
  LuVolume2,
  LuEdit,
  LuMoreVertical,
  LuShare2,
  LuX,
  LuAlertCircle,
  LuLoader2,
} from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InstrumentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedChip, setSelectedChip] = useState("OPL3")
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(89)
  const [isPlaying, setIsPlaying] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState("BambooTracker")
  const [playbackChip, setPlaybackChip] = useState("OPL3")
  const [textExportOpen, setTextExportOpen] = useState(false)
  const [octaveOffset, setOctaveOffset] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Edit state
  const [editInstrumentName, setEditInstrumentName] = useState("Epic Lead Sound")
  const [editDescription, setEditDescription] = useState(
    "This instrument is an epic lead sound inspired by 80s synthpop. It features bright highs and warm mids that make melody lines stand out. It's specially tuned to sound most beautiful when played on the OPL3 chip. Perfect for arpeggios and solo parts, it can add grandeur to your music.",
  )
  const [editTags, setEditTags] = useState<string[]>(["Lead", "Epic", "Synthesizer"])
  const [newTag, setNewTag] = useState("")

  const chips = ["OPL3", "OPN2", "OPM", "OPL2"]
  const currentUser = "johndoe" // Current user
  const instrumentAuthor = "johndoe" // Author of this instrument
  const isOwnInstrument = currentUser === instrumentAuthor

  const exportTargets: Record<string, Array<{ name: string; type: "file" | "text" }>> = {
    OPN: [
      { name: "BambooTracker", type: "file" },
      { name: "Furnace", type: "file" },
      { name: "PMD", type: "text" },
      { name: "FMP", type: "text" },
    ],
    OPN2: [
      { name: "Furnace", type: "file" },
      { name: "Deflemask", type: "file" },
    ],
    OPL3: [
      { name: "Furnace", type: "file" },
      { name: "AdLib Tracker", type: "file" },
    ],
  }

  const handleExport = () => {
    const target = exportTargets[selectedChip]?.find((t) => t.name === selectedTarget)
    if (target?.type === "file") {
      console.log(`Downloading ${selectedTarget} file`)
    } else {
      setTextExportOpen(true)
    }
  }

  const addTag = () => {
    if (newTag && editTags.length < 5 && !editTags.includes(newTag)) {
      setEditTags([...editTags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove))
  }

  const handleEdit = () => {
    // Edit processing
    setEditOpen(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Random failure (50% chance)
      if (Math.random() < 0.5) {
        throw new Error("An error occurred during deletion. Please try again later.")
      }

      // On success, return to user page
      router.push("/user/johndoe")
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "An error occurred during deletion.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTagClick = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`)
  }

  const handleChipClick = (chip: string) => {
    router.push(`/search?chip=${encodeURIComponent(chip)}`)
  }

  const handleLikeToggle = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  const shareUrl = `${window.location.origin}/instrument/${params.id}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/search">
            <LuArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Epic Lead Sound</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Link href="/user/synthmaster" className="flex items-center gap-2 hover:underline">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  SynthMaster
                </Link>
                <span>•</span>
                <span>January 15, 2024</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={handleLikeToggle}
                className="flex items-center gap-2"
              >
                <LuHeart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
                <span className="text-sm">{likeCount}</span>
              </Button>

              <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <LuShare2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out Epic Lead Sound!")}&url=${encodeURIComponent(shareUrl)}`,
                      )
                    }
                  >
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isOwnInstrument && (
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <LuEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <LuMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
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
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick("Lead")}
              >
                Lead
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick("Epic")}
              >
                Epic
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick("Synthesizer")}
              >
                Synthesizer
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Recommended Chip:</span>
              <Badge
                variant="outline"
                className="px-3 py-1 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleChipClick("OPL3")}
              >
                OPL3
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
            <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen}>
              <div className="space-y-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto font-normal text-left w-full">
                    <div className="text-left w-full">
                      {!descriptionOpen ? (
                        <div className="break-words overflow-hidden">
                          <span className="line-clamp-3">
                            This instrument is an epic lead sound inspired by 80s synthpop. It features bright highs and
                            warm mids that make melody lines stand out. It's specially tuned to sound most beautiful
                            when played on the OPL3 chip. Perfect for arpeggios and solo parts, it can add grandeur to
                            your music.
                          </span>
                          <span className="text-primary ml-1">Read more</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words word-break-break-all">
                          This instrument is an epic lead sound inspired by 80s synthpop. It features bright highs and
                          warm mids that make melody lines stand out. It's specially tuned to sound most beautiful when
                          played on the OPL3 chip. Perfect for arpeggios and solo parts, it can add grandeur to your
                          music.
                        </div>
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {descriptionOpen && (
                    <Button variant="ghost" className="p-0 h-auto font-normal text-primary">
                      Show less
                    </Button>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Download
              <span className="text-sm font-normal text-muted-foreground">
                Total Downloads: 387 (Original: 245 + Export: 142)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original File */}
            <div>
              <Button className="w-full">
                <LuDownload className="h-4 w-4 mr-2" />
                Download Original File
              </Button>
            </div>

            <Separator />

            {/* Export Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Export</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chip:</label>
                  <Select value={selectedChip} onValueChange={setSelectedChip}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(exportTargets).map((chip) => (
                        <SelectItem key={chip} value={chip}>
                          {chip}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target:</label>
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportTargets[selectedChip]?.map((target) => (
                        <SelectItem key={target.name} value={target.name}>
                          {target.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={handleExport}>
                <LuDownload className="h-4 w-4 mr-2" />
                Export ({selectedTarget})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LuVolume2 className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Chip:</label>
                  <Select value={playbackChip} onValueChange={setPlaybackChip}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chips.map((chip) => (
                        <SelectItem key={chip} value={chip}>
                          {chip}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Octave:</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOctaveOffset(Math.max(-1, octaveOffset - 1))}
                    disabled={octaveOffset <= -1}
                  >
                    ←
                  </Button>
                  <span className="text-sm font-mono w-8 text-center">
                    {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOctaveOffset(Math.min(8, octaveOffset + 1))}
                    disabled={octaveOffset >= 8}
                  >
                    →
                  </Button>
                </div>
              </div>

              {/* Piano Keyboard - 4 octaves */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-center">
                  <div className="relative">
                    {/* White keys */}
                    <div className="flex">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const whiteKeyIndex = i % 7
                        const octave = Math.floor(i / 7)
                        const notes = ["C", "D", "E", "F", "G", "A", "B"]
                        const note = notes[whiteKeyIndex]
                        const actualOctave = octave + 2 + octaveOffset
                        return (
                          <button
                            key={i}
                            className="bg-white border border-gray-300 w-6 h-16 hover:bg-gray-100 transition-colors relative"
                            onClick={() => {
                              /* Play note */
                            }}
                          >
                            <span className="text-xs text-gray-600 absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              {note}
                              {actualOctave}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {/* Black keys */}
                    <div className="absolute top-0 flex">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const whiteKeyIndex = i % 7
                        const octave = Math.floor(i / 7)
                        if ([0, 1, 3, 4, 5].includes(whiteKeyIndex)) {
                          const blackNotes = ["C#", "D#", "", "F#", "G#", "A#"]
                          const blackNote = blackNotes[whiteKeyIndex]
                          const actualOctave = octave + 2 + octaveOffset
                          return (
                            <button
                              key={`black-${i}`}
                              className="bg-gray-800 w-4 h-10 hover:bg-gray-700 transition-colors relative -ml-2 z-10"
                              style={{ marginLeft: i === 0 ? "16px" : "8px" }}
                              onClick={() => {
                                /* Play black note */
                              }}
                            >
                              <span className="text-xs text-white absolute bottom-1 left-1/2 transform -translate-x-1/2">
                                {blackNote}
                                {actualOctave}
                              </span>
                            </button>
                          )
                        } else {
                          return <div key={`spacer-${i}`} className="w-6" />
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parameters Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {`// OPL3 Parameters
ALG: 4
FB: 3
OP1: AR=15, DR=2, SL=1, RR=4, TL=0, KS=0, ML=1, AM=0, VB=0, EG=1, KR=0, WS=0
OP2: AR=15, DR=1, SL=2, RR=3, TL=8, KS=0, ML=2, AM=0, VB=0, EG=1, KR=0, WS=1
OP3: AR=15, DR=3, SL=1, RR=5, TL=12, KS=1, ML=1, AM=0, VB=0, EG=1, KR=0, WS=0
OP4: AR=15, DR=2, SL=0, RR=4, TL=0, KS=0, ML=4, AM=0, VB=1, EG=1, KR=0, WS=2`}
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
              <label className="text-sm font-medium">Instrument Name *</label>
              <Input value={editInstrumentName} onChange={(e) => setEditInstrumentName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (max 5)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} disabled={editTags.length >= 5}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <LuX className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (max 500 characters)</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className="text-xs text-muted-foreground text-right">{editDescription.length}/500</div>
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
              Are you sure you want to delete this instrument? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <LuAlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <LuLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Text Export Modal */}
      <Dialog open={textExportOpen} onOpenChange={setTextExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTarget} Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              readOnly
              value={`; ${selectedTarget} format export
; Epic Lead Sound
@001 {
  LFO: 0, 0, 0, 0
  CH: 64, 0, 0, 0, 0, 120, 0
  M1: 31, 0, 0, 15, 0, 0, 1, 0, 0, 0, 1, 0
  C1: 31, 8, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0
  M2: 31, 12, 1, 3, 1, 0, 1, 0, 0, 0, 1, 0
  C2: 31, 0, 0, 4, 0, 0, 4, 0, 1, 0, 1, 0
}`}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTextExportOpen(false)}>
                Close
              </Button>
              <Button onClick={() => navigator.clipboard.writeText("export text")}>Copy to Clipboard</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
