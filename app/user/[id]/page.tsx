"use client"

import type React from "react"

import { useState } from "react"
import { FaCalendar, FaHeart, FaMusic, FaCog, FaEdit, FaShare, FaDownload } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaUser } from "react-icons/fa"

export default function UserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const isOwnProfile = params.id === "johndoe"
  const [displayName, setDisplayName] = useState(isOwnProfile ? "JohnDoe" : "SynthMaster")
  const [bio, setBio] = useState(
    isOwnProfile
      ? "I enjoy creating instruments as a hobby. I especially like making experimental sounds using FM synthesis."
      : "I love FM synthesis and synthesizers. My goal is to bring 80s sounds back to the modern era.",
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
    }
  }

  const shareUrl = `${window.location.origin}/user/${params.id}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="h-32 w-32 mx-auto md:mx-0 rounded-full bg-muted flex items-center justify-center">
            {/*<FaUser className="h-16 w-16 text-muted-foreground" />*/
}                          </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  <p className="text-muted-foreground">@{params.id}</p>
                </div>

                <p className="text-muted-foreground">{bio}</p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FaCalendar className="h-4 w-4" />
                    Joined May 2023
                  </div>
                  <div className="flex items-center gap-1">
                    <FaMusic className="h-4 w-4" />
                    Posts: {isOwnProfile ? 1 : 24}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaHeart className="h-4 w-4" />
                    Likes received: {isOwnProfile ? 42 : 1247}
                  </div>
                </div>

                <div className="flex gap-3 justify-center md:justify-start">
                  {isOwnProfile && (
                    <>
                      <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <FaEdit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="displayName">Display Name</Label>
                              <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setProfileEditOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={() => setProfileEditOpen(false)}>Save</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" asChild>
                        <Link href="/settings">
                          <FaCog className="h-4 w-4 mr-2" />
                          Account Settings
                        </Link>
                      </Button>
                    </>
                  )}

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
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${displayName}'s instruments!`)}&url=${encodeURIComponent(shareUrl)}`,
                          )
                        }
                      >
                        Share on Twitter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(shareUrl)}>
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posted Instruments</TabsTrigger>
            <TabsTrigger value="likes">Liked Instruments</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isOwnProfile ? (
                <TimbreCard title="JohnDoeTone" author="JohnDoe" />
              ) : (
                Array.from({ length: 6 }).map((_, i) => <TimbreCard key={i} title="Epic Lead" author="SynthMaster" />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <TimbreCard key={i} title="Epic Lead" author="SynthMaster" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TimbreCard({ title, author }: { title: string; author: string }) {
  const router = useRouter()

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push("/instrument/sample-id-" + Math.floor(Math.random() * 1000))}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">by {author}</p>
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
