"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

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
          <CardTitle className="text-2xl">アカウント登録完了</CardTitle>
          <p className="text-muted-foreground">プロフィール情報を入力してください</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User ID (Read-only) */}
          <div className="space-y-2">
            <Label>投稿者ID（変更不可）</Label>
            <Input value={userId} disabled />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <Input
              id="displayName"
              placeholder="表示名を入力"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード確認</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>プロフィール画像（任意）</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profileImage ? URL.createObjectURL(profileImage) : undefined} />
                <AvatarFallback>
                  <Upload className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    画像を選択
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
            登録完了
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
