"use client"

import { useState, useRouter } from "react"
import { FaExclamationCircle, FaEnvelope, FaLock, FaTrash, FaSpinner } from "react-icons/fa"
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
  const router = useRouter()

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
      setEmailChangeMessage(`A confirmation email has been sent to ${newEmail}. Please check your email.`)
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
        throw new Error("Incorrect password.")
      }

      // アカウント削除処理
      setDeleteDialogOpen(false)
      setDeletePassword("")
      // 成功時はトップページに遷移する処理をここに追加
      router.push("/")
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "An error occurred during deletion.")
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
          setEmailChangeMessage(`A confirmation email has been sent to ${newEmail}. Please check your email.`)
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
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaEnvelope className="h-5 w-5" />
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Email Address</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">{currentEmail}</div>
            </div>

            {emailChangeMessage && (
              <Alert>
                <FaEnvelope className="h-4 w-4" />
                <AlertDescription>{emailChangeMessage}</AlertDescription>
              </Alert>
            )}

            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Email Address</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Email Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button onClick={handleEmailChange} disabled={!newEmail || isProcessing}>
                      {isProcessing ? (
                        <>
                          <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change"
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
              <FaLock className="h-5 w-5" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPasswordDialogOpen(false)} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change"
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
              <FaTrash className="h-5 w-5" />
              Delete Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <FaExclamationCircle className="h-4 w-4" />
              <AlertDescription>
                Deleting your account will permanently remove all your posted data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This action cannot be undone. All your posted data
                    will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>

                  {deleteError && (
                    <Alert variant="destructive">
                      <FaExclamationCircle className="h-4 w-4" />
                      <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDelete}
                    disabled={!deletePassword || isProcessing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
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
            <DialogTitle>Re-authentication Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <FaExclamationCircle className="h-4 w-4" />
              <AlertDescription>
                For security reasons, please enter your password again to perform this action.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="reauthPassword">Password</Label>
              <Input
                id="reauthPassword"
                type="password"
                value={reauthPassword}
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReauthDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={handleReauth} disabled={!reauthPassword || isProcessing}>
                {isProcessing ? (
                  <>
                    <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
