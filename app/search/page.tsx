"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { FaSearch, FaFilter, FaTh, FaList, FaTimes } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")

  // Initialize filter conditions from URL
  const [selectedChips, setSelectedChips] = useState<string[]>(
    searchParams.get("chips") ? searchParams.get("chips")!.split(",") : [],
  )
  const [filterTags, setFilterTags] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
  )
  const [downloadRange, setDownloadRange] = useState<number[]>(() => {
    const downloads = searchParams.get("downloads")
    if (downloads) {
      const [min, max] = downloads.split("-").map(Number)
      return [min, max]
    }
    return [0, 1000]
  })
  const [likeRange, setLikeRange] = useState<number[]>(() => {
    const likes = searchParams.get("likes")
    if (likes) {
      const [min, max] = likes.split("-").map(Number)
      return [min, max]
    }
    return [0, 500]
  })

  // Function to update URL
  const updateURL = (updates: Record<string, string | string[] | number[] | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        if (key === "downloads" || key === "likes") {
          params.set(key, `${value[0]}-${value[1]}`)
        } else {
          params.set(key, value.join(","))
        }
      } else {
        params.set(key, String(value))
      }
    })

    router.push(`/search?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ q: searchQuery })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    updateURL({ sort: value })
  }

  const handleChipChange = (chip: string, checked: boolean) => {
    const newChips = checked ? [...selectedChips, chip] : selectedChips.filter((c) => c !== chip)
    setSelectedChips(newChips)
    updateURL({ chips: newChips })
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !filterTags.includes(tag)) {
      const newTags = [...filterTags, tag]
      setFilterTags(newTags)
      updateURL({ tags: newTags })
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = filterTags.filter((tag) => tag !== tagToRemove)
    setFilterTags(newTags)
    updateURL({ tags: newTags })
  }

  const handleDownloadRangeChange = (value: number[]) => {
    setDownloadRange(value)
    updateURL({ downloads: value })
  }

  const handleLikeRangeChange = (value: number[]) => {
    setLikeRange(value)
    updateURL({ likes: value })
  }

  // Calculate search result count (based on filter conditions)
  const getResultCount = () => {
    let count = 245 // Base count

    // Adjust count based on filter conditions
    if (filterTags.length > 0) count = Math.floor(count * 0.7)
    if (selectedChips.length > 0) count = Math.floor(count * 0.8)
    if (downloadRange[0] > 0 || downloadRange[1] < 1000) count = Math.floor(count * 0.6)
    if (likeRange[0] > 0 || likeRange[1] < 500) count = Math.floor(count * 0.6)

    return Math.max(1, count)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search instruments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden bg-transparent">
                  <FaFilter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter</SheetTitle>
                </SheetHeader>
                <FilterPanel
                  selectedChips={selectedChips}
                  onChipChange={handleChipChange}
                  filterTags={filterTags}
                  onTagAdd={handleTagAdd}
                  onTagRemove={handleTagRemove}
                  downloadRange={downloadRange}
                  onDownloadRangeChange={handleDownloadRangeChange}
                  likeRange={likeRange}
                  onLikeRangeChange={handleLikeRangeChange}
                />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <FaTh className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <FaList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <FilterPanel
                selectedChips={selectedChips}
                onChipChange={handleChipChange}
                filterTags={filterTags}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                downloadRange={downloadRange}
                onDownloadRangeChange={handleDownloadRangeChange}
                likeRange={likeRange}
                onLikeRangeChange={handleLikeRangeChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">Search results: {getResultCount()} items</div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <TimbreCard key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <TimbreListItem key={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPanel({
  selectedChips,
  onChipChange,
  filterTags,
  onTagAdd,
  onTagRemove,
  downloadRange,
  onDownloadRangeChange,
  likeRange,
  onLikeRangeChange,
}: {
  selectedChips: string[]
  onChipChange: (chip: string, checked: boolean) => void
  filterTags: string[]
  onTagAdd: (tag: string) => void
  onTagRemove: (tag: string) => void
  downloadRange: number[]
  onDownloadRangeChange: (value: number[]) => void
  likeRange: number[]
  onLikeRangeChange: (value: number[]) => void
}) {
  const chips = ["OPL3", "OPN2", "OPM", "OPL2", "OPNA"]
  const [newFilterTag, setNewFilterTag] = useState("")

  // State for numeric inputs
  const [downloadMin, setDownloadMin] = useState(downloadRange[0].toString())
  const [downloadMax, setDownloadMax] = useState(downloadRange[1].toString())
  const [likeMin, setLikeMin] = useState(likeRange[0].toString())
  const [likeMax, setLikeMax] = useState(likeRange[1].toString())

  // Update input fields when downloadRange changes
  useEffect(() => {
    setDownloadMin(downloadRange[0].toString())
    setDownloadMax(downloadRange[1].toString())
  }, [downloadRange])

  // Update input fields when likeRange changes
  useEffect(() => {
    setLikeMin(likeRange[0].toString())
    setLikeMax(likeRange[1].toString())
  }, [likeRange])

  const addFilterTag = () => {
    if (newFilterTag) {
      onTagAdd(newFilterTag)
      setNewFilterTag("")
    }
  }

  // Correct and update download range
  const handleDownloadRangeUpdate = () => {
    let min = Number.parseInt(downloadMin) || 0
    let max = Number.parseInt(downloadMax) || 1000

    // Range correction
    min = Math.max(0, Math.min(min, 1000))
    max = Math.max(0, Math.min(max, 1000))

    // Swap if min > max
    if (min > max) {
      ;[min, max] = [max, min]
    }

    // Update input fields with corrected values
    setDownloadMin(min.toString())
    setDownloadMax(max.toString())

    // Notify parent component
    onDownloadRangeChange([min, max])
  }

  // Correct and update like range
  const handleLikeRangeUpdate = () => {
    let min = Number.parseInt(likeMin) || 0
    let max = Number.parseInt(likeMax) || 500

    // Range correction
    min = Math.max(0, Math.min(min, 500))
    max = Math.max(0, Math.min(max, 500))

    // Swap if min > max
    if (min > max) {
      ;[min, max] = [max, min]
    }

    // Update input fields with corrected values
    setLikeMin(min.toString())
    setLikeMax(max.toString())

    // Notify parent component
    onLikeRangeChange([min, max])
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Filter by Tags</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tag"
              value={newFilterTag}
              onChange={(e) => setNewFilterTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFilterTag())}
            />
            <Button size="sm" onClick={addFilterTag} disabled={!newFilterTag}>
              Add
            </Button>
          </div>
          {filterTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <FaTimes className="h-3 w-3 ml-1" onClick={() => onTagRemove(tag)} />
                </Badge>
              ))}
            </div>
          )}
          {filterTags.length > 0 && <p className="text-xs text-muted-foreground">Search instruments with these tags</p>}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Chip</h3>
        <div className="space-y-2">
          {chips.map((chip) => (
            <div key={chip} className="flex items-center space-x-2">
              <Checkbox
                id={chip}
                checked={selectedChips.includes(chip)}
                onCheckedChange={(checked) => onChipChange(chip, !!checked)}
              />
              <label htmlFor={chip} className="text-sm cursor-pointer">
                {chip}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Downloads</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Min</label>
              <Input
                type="number"
                min="0"
                max="1000"
                value={downloadMin}
                onChange={(e) => setDownloadMin(e.target.value)}
                onBlur={handleDownloadRangeUpdate}
                onKeyPress={(e) => e.key === "Enter" && handleDownloadRangeUpdate()}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max</label>
              <Input
                type="number"
                min="0"
                max="1000"
                value={downloadMax}
                onChange={(e) => setDownloadMax(e.target.value)}
                onBlur={handleDownloadRangeUpdate}
                onKeyPress={(e) => e.key === "Enter" && handleDownloadRangeUpdate()}
                className="text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Range: 0-1000</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Likes</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Min</label>
              <Input
                type="number"
                min="0"
                max="500"
                value={likeMin}
                onChange={(e) => setLikeMin(e.target.value)}
                onBlur={handleLikeRangeUpdate}
                onKeyPress={(e) => e.key === "Enter" && handleLikeRangeUpdate()}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max</label>
              <Input
                type="number"
                min="0"
                max="500"
                value={likeMax}
                onChange={(e) => setLikeMax(e.target.value)}
                onBlur={handleLikeRangeUpdate}
                onKeyPress={(e) => e.key === "Enter" && handleLikeRangeUpdate()}
                className="text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Range: 0-500</p>
        </div>
      </div>
    </div>
  )
}

function TimbreCard() {
  const router = useRouter()

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push("/instrument/sample-id-123")}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Epic Lead Sound</h3>
            <p className="text-sm text-muted-foreground">by SynthMaster</p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Lead
            </Badge>
            <Badge variant="outline" className="text-xs">
              Epic
            </Badge>
            <Badge variant="outline" className="text-xs">
              OPL3
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>DL: 245</span>
              <span>♥: 89</span>
            </div>
            <span>2024/01/15</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TimbreListItem() {
  const router = useRouter()

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push("/instrument/sample-id-456")}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium">Epic Lead Sound</h3>
            <p className="text-sm text-muted-foreground mb-2">by SynthMaster</p>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className="text-xs">
                Lead
              </Badge>
              <Badge variant="outline" className="text-xs">
                Epic
              </Badge>
              <Badge variant="outline" className="text-xs">
                OPL3
              </Badge>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>DL: 245 | ♥: 89</div>
            <div>2024/01/15</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
