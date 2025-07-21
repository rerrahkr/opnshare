"use client"

import { useState } from "react"
import { AlertCircle, Mail, Lock, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const [currentEmail, setCurrentEmail] = useState("user@example.com")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reauthDialogOpen, setReauthDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [reauthPassword, setReauthPassword] = useState("")
  const [emailChangeMessage, setEmailChangeMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pendingAction, setPendingAction] = useState<"email" | "password" | null>(null)
  const [deleteError, setDeleteError] = useState("")

  const requiresReauth = () => Math.random() < 0.5 // 50%の確率で再認証が必要

  const handleEmailChange = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (requiresReauth()) {
        setPendingAction("email")
        setReauthDialogOpen(true)
        return
      }

      // メール変更処理
      setEmailDialogOpen(false)
      setEmailChangeMessage(`${newEmail} に確認用メールを送信しました。メールをご確認ください。`)
      setNewEmail("")
    } catch (error) {
      console.error("Email change error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePasswordChange = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (requiresReauth()) {
        setPendingAction("password")
        setReauthDialogOpen(true)
        return
      }

      // パスワード変更処理
      setPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Password change error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccountDelete = async () => {
    setIsProcessing(true)
    setDeleteError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // ランダムで失敗させる（20%の確率）
      if (Math.random() < 0.2) {
        throw new Error("パスワードが正しくありません。")
      }

      // アカウント削除処理
      setDeleteDialogOpen(false)
      setDeletePassword("")
      // 成功時はトップページに遷移する処理をここに追加
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "削除処理中にエラーが発生しました。")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReauth = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 再認証成功後、元の処理を実行
      setReauthDialogOpen(false)
      setReauthPassword("")

      switch (pendingAction) {
        case "email":
          setEmailDialogOpen(false)
          setEmailChangeMessage(`${newEmail} に確認用メールを送信しました。メールをご確認ください。`)
          setNewEmail("")
          break
        case "password":
          setPasswordDialogOpen(false)
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
          break
      }

      setPendingAction(null)
    } catch (error) {
      console.error("Reauth error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">アカウント設定</h1>
          <p className="text-muted-foreground">アカウントの設定を管理できます</p>
        </div>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              メールアドレス
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>現在のメールアドレス</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">{currentEmail}</div>
            </div>

            {emailChangeMessage && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>{emailChangeMessage}</AlertDescription>
              </Alert>
            )}

            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">メールアドレスを変更</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>メールアドレス変更</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">新しいメールアドレス</Label>
                    <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={isProcessing}>
                      キャンセル
                    </Button>
                    <Button onClick={handleEmailChange} disabled={!newEmail || isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          変更中...
                        </>
                      ) : (
                        "変更"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              パスワード
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">パスワードを変更</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>パスワード変更</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">現在のパスワード</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新しいパスワード</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} disabled={isProcessing}>
                      キャンセル
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          変更中...
                        </>
                      ) : (
                        "変更"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              アカウント削除
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                アカウントを削除すると、すべての投稿データが完全に削除されます。この操作は取り消せません。
              </AlertDescription>
            </Alert>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">アカウントを削除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>アカウント削除の確認</AlertDialogTitle>
                  <AlertDialogDescription>
                    本当にアカウントを削除しますか？この操作は取り消せません。すべての投稿データが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">パスワードを入力して確認</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="現在のパスワードを入力"
                    />
                  </div>

                  {deleteError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isProcessing}>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDelete}
                    disabled={!deletePassword || isProcessing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isProcessing ? (
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
          </CardContent>
        </Card>
      </div>

      {/* Reauthentication Dialog */}
      <Dialog open={reauthDialogOpen} onOpenChange={setReauthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>再認証が必要です</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                セキュリティのため、この操作を実行するには再度パスワードを入力してください。
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="reauthPassword">パスワード</Label>
              <Input
                id="reauthPassword"
                type="password"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="現在のパスワードを入力"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReauthDialogOpen(false)} disabled={isProcessing}>
                キャンセル
              </Button>
              <Button onClick={handleReauth} disabled={!reauthPassword || isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    認証中...
                  </>
                ) : (
                  "認証"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
