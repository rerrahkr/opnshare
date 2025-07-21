"use client"

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Download, Volume2, Edit, MoreVertical, Share2, X, AlertCircle, Loader2 } from "lucide-react"
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

export default function TimbreDetailPage({ params }: { params: { id: string } }) {
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

  // 編集用の状態
  const [editTimbeName, setEditTimbeName] = useState("Epic Lead Sound")
  const [editDescription, setEditDescription] = useState(
    "この音色は80年代のシンセポップにインスパイアされたエピックなリードサウンドです。高域の輝きと温かみのある中域が特徴で、メロディラインを際立たせることができます。特にOPL3チップでの再生時に最も美しく響くように調整されています。アルペジオやソロパートに最適で、楽曲に壮大さを演出できます。",
  )
  const [editTags, setEditTags] = useState<string[]>(["リード", "エピック", "シンセサイザー"])
  const [newTag, setNewTag] = useState("")

  const chips = ["OPL3", "OPN2", "OPM", "OPL2"]
  const currentUser = "johndoe" // 現在のユーザー
  const timbreAuthor = "johndoe" // この音色の作者
  const isOwnTimbre = currentUser === timbreAuthor

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
    // 編集処理
    setEditOpen(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // ランダムで失敗させる（50%の確率）
      if (Math.random() < 0.5) {
        throw new Error("削除処理中にエラーが発生しました。しばらく時間をおいてから再度お試しください。")
      }

      // 成功時はユーザーページに戻る
      router.push("/user/johndoe")
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "削除中にエラーが発生しました。")
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

  const shareUrl = `${window.location.origin}/timbre/${params.id}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/search">
            <ArrowLeft className="h-4 w-4 mr-2" />
            検索に戻る
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
                <span>2024年1月15日</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={handleLikeToggle}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "いいね済み" : "いいね"}
                <span className="text-sm">{likeCount}</span>
              </Button>

              <DropdownMenu open={shareOpen} onOpenChange={setShareOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    シェア
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent("Epic Lead Sound をチェック！")}&url=${encodeURIComponent(shareUrl)}`,
                      )
                    }
                  >
                    Twitterでシェア
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(shareUrl)}>
                    リンクをコピー
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isOwnTimbre && (
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </Button>

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                        削除
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
                onClick={() => handleTagClick("リード")}
              >
                リード
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick("エピック")}
              >
                エピック
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick("シンセサイザー")}
              >
                シンセサイザー
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">推奨チップ:</span>
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
            <CardTitle className="text-lg">説明</CardTitle>
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
                            この音色は80年代のシンセポップにインスパイアされたエピックなリードサウンドです。
                            高域の輝きと温かみのある中域が特徴で、メロディラインを際立たせることができます。
                            特にOPL3チップでの再生時に最も美しく響くように調整されています。
                            アルペジオやソロパートに最適で、楽曲に壮大さを演出できます。
                          </span>
                          <span className="text-primary ml-1">続きを読む</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words word-break-break-all">
                          この音色は80年代のシンセポップにインスパイアされたエピックなリードサウンドです。
                          高域の輝きと温かみのある中域が特徴で、メロディラインを際立たせることができます。
                          特にOPL3チップでの再生時に最も美しく響くように調整されています。
                          アルペジオやソロパートに最適で、楽曲に壮大さを演出できます。
                        </div>
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {descriptionOpen && (
                    <Button variant="ghost" className="p-0 h-auto font-normal text-primary">
                      閉じる
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
              ダウンロード
              <span className="text-sm font-normal text-muted-foreground">
                総DL数: 387回 (オリジナル: 245回 + エクスポート: 142回)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original File */}
            <div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                オリジナルファイルをダウンロード
              </Button>
            </div>

            <Separator />

            {/* Export Section */}
            <div className="space-y-4">
              <h3 className="font-medium">エクスポート</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">チップ:</label>
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
                  <label className="text-sm font-medium mb-2 block">ターゲット:</label>
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
              <Button variant="outline" className="w-full" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                エクスポート ({selectedTarget})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              試聴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">チップ:</label>
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
                  <label className="text-sm font-medium">オクターブ:</label>
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
            <CardTitle className="text-lg">パラメーター</CardTitle>
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
            <DialogTitle>音色を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">音色名 *</label>
              <Input value={editTimbeName} onChange={(e) => setEditTimbeName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">タグ (最大5個)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="タグを入力"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button onClick={addTag} disabled={editTags.length >= 5}>
                  追加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">説明 (最大500文字)</label>
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
                キャンセル
              </Button>
              <Button onClick={handleEdit}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>音色を削除</AlertDialogTitle>
            <AlertDialogDescription>本当にこの音色を削除しますか？この操作は取り消せません。</AlertDialogDescription>
          </AlertDialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteOpen(false)}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  削除中...
                </>
              ) : (
                "削除する"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Text Export Modal */}
      <Dialog open={textExportOpen} onOpenChange={setTextExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTarget} エクスポート</DialogTitle>
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
                閉じる
              </Button>
              <Button onClick={() => navigator.clipboard.writeText("export text")}>クリップボードにコピー</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
