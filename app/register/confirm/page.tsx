"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LuUpload } from "react-icons/lu"

export default function RegisterConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [userId] = useState(() => Math.random().toString(36).substring(2, 8)) // Generated user ID

  const handleSubmit = () => {
    // TODO: Complete registration
    router.push("/mypage")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Registration</CardTitle>
          <p className="text-muted-foreground">Please enter your profile information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User ID (Read-only) */}
          <div className="space-y-2">
            <Label>User ID (Cannot be changed)</Label>
            <Input value={userId} disabled />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileImage ? URL.createObjectURL(profileImage) : undefined} />
                <AvatarFallback>
                  <LuUpload className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Select Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </Button>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!password || !confirmPassword || !displayName || password !== confirmPassword}
            onClick={handleSubmit}
          >
            Complete Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
