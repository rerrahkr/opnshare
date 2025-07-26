"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FaSearch, FaHeart, FaDownload, FaHashtag } from "react-icons/fa"
import { FaShuffle } from "react-icons/fa6"
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Instrument Sharing Service
          </h1>
          <p className="text-lg text-muted-foreground">Share FM synthesizer instruments and discover new sounds</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search instruments..."
                  className="pl-10 h-12 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 px-6 bg-transparent"
                onClick={() => router.push("/instrument/random-id-789")}
              >
                <FaShuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/your-org/instrument-sharing-service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FaGithub className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New Instruments</h2>
            <Button variant="ghost" onClick={() => router.push("/search")}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TimbreCard key={i} />
            ))}
          </div>
        </section>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Download Ranking */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <FaDownload className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Download Ranking</h2>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((rank) => (
                <RankingItem key={rank} rank={rank} type="download" />
              ))}
            </div>
          </section>

          {/* Like Ranking */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <FaHeart className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Like Ranking</h2>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((rank) => (
                <RankingItem key={rank} rank={rank} type="like" />
              ))}
            </div>
          </section>
        </div>

        {/* Popular Tags */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FaHashtag className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Popular Tags</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Bass", "Lead", "Pad", "Pluck", "Brass", "Strings", "FX", "Drum"].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm py-2 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => router.push(`/search?tag=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TimbreCard() {
  const router = useRouter()
  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push("/instrument/sample-id-" + Math.floor(Math.random() * 1000))}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Epic Lead</CardTitle>
            <p className="text-sm text-muted-foreground">by SynthMaster</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Lead
            </Badge>
            <Badge variant="outline" className="text-xs">
              Epic
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FaDownload className="h-3 w-3" />
                245
              </span>
              <span className="flex items-center gap-1">
                <FaHeart className="h-3 w-3" />
                89
              </span>
            </div>
            <span>2024/01/15</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RankingItem({ rank, type }: { rank: number; type: "download" | "like" }) {
  const router = useRouter()
  const icon = type === "download" ? FaDownload : FaHeart
  const Icon = icon
  const count = type === "download" ? 1250 - rank * 100 : 500 - rank * 50

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push("/instrument/ranking-id-" + rank)}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${
            rank === 1
              ? "bg-yellow-500 text-white"
              : rank === 2
                ? "bg-gray-400 text-white"
                : rank === 3
                  ? "bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground"
          }
        `}
        >
          {rank}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Amazing Bass Sound</h3>
          <p className="text-sm text-muted-foreground">by BassGuru</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" />
          {count}
        </div>
      </div>
    </Card>
  )
}
