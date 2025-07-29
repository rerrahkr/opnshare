"use client";

import { FirebaseError } from "firebase/app";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  validatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { LucideAlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaExclamationCircle,
  FaLock,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { useAuthUser } from "@/stores/auth";

const emailSchema = z.string().email();

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthUser();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [currentEmail, setCurrentEmail] = useState<string>(user?.email || "");
  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [failedEmailChange, setFailedEmailChange] = useState<boolean>(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [failedPasswordChange, setFailedPasswordChange] = useState<string>("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [passwordForDelete, setPasswordForDelete] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");

  const [reauthDialogOpen, setReauthDialogOpen] = useState<boolean>(false);
  const [reauthPassword, setReauthPassword] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<
    "email" | "password" | null
  >(null);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [router, user]);

  async function handleEmailChange() {
    if (!user) {
      // console.error("User is not authenticated.");
      return;
    }

    setIsProcessing(true);
    setFailedEmailChange(false);

    try {
      await verifyBeforeUpdateEmail(user, newEmail);

      setEmailDialogOpen(false);
      setEmailChangeMessage(
        `A confirmation email has been sent to ${newEmail}. Please check your email.`
      );
      setCurrentEmail(newEmail);
      setNewEmail("");
    } catch (error: unknown) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/requires-recent-login"
      ) {
        // Open reauth dialog if reauthentication is required.
        setPendingAction("email");
        setReauthDialogOpen(true);
        return;
      }
      // console.error("Email change error:", error);
      setFailedEmailChange(true);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handlePasswordChange() {
    if (!user) {
      // console.error("User is not authenticated.");
      return;
    }

    setIsProcessing(true);
    try {
      const status = await validatePassword(auth, newPassword);
      if (!status.isValid) {
        setFailedPasswordChange("Password must be at least 6 characters long.");
        return;
      }

      await updatePassword(user, newPassword);

      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (
        error instanceof FirebaseError &&
        error.code === "auth/requires-recent-login"
      ) {
        // Open reauth dialog if reauthentication is required.
        setPendingAction("password");
        setReauthDialogOpen(true);
        return;
      }
      // console.error("Password change error:", error);
      setFailedPasswordChange("Failed to change password. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAccountDelete() {
    if (!user) {
      // console.error("User is not authenticated.");
      return;
    }

    setIsProcessing(true);
    setDeleteError("");

    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email || "", passwordForDelete)
      );

      // Delete user info and account
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userDoc = querySnapshot.docs[0];
      if (userDoc) {
        await deleteDoc(userDoc.ref);
      }

      await deleteUser(user);

      setDeleteDialogOpen(false);
      setPasswordForDelete("");

      router.push("/");
    } catch (_error: unknown) {
      setDeleteError("An error occurred during account deletion.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReauth() {
    if (!user) {
      // console.error("User is not authenticated.");
      return;
    }

    setIsProcessing(true);
    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email || "", reauthPassword)
      );

      setReauthDialogOpen(false);
      setReauthPassword("");

      // Do the pending action
      switch (pendingAction) {
        case "email":
          try {
            await verifyBeforeUpdateEmail(user, newEmail);

            setEmailDialogOpen(false);
            setEmailChangeMessage(
              `A confirmation email has been sent to ${newEmail}. Please check your email.`
            );
            setCurrentEmail(newEmail);
            setNewEmail("");
          } catch (_error: unknown) {
            setFailedEmailChange(true);
          }
          break;
        case "password":
          try {
            await updatePassword(user, newPassword);

            setPasswordDialogOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          } catch (_error: unknown) {
            setFailedPasswordChange(
              "Failed to change password. Please try again."
            );
          }
          break;
      }

      setPendingAction(null);
    } catch (error) {
      console.error("Reauth error:", error);
    } finally {
      setIsProcessing(false);
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
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                  </div>
                  {failedEmailChange && (
                    <Alert variant="destructive">
                      <LucideAlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to change email. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEmailDialogOpen(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEmailChange}
                      disabled={
                        !emailSchema.safeParse(newEmail).success || isProcessing
                      }
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

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaLock className="h-5 w-5" />
              Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
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
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {failedPasswordChange !== "" && (
                    <Alert variant="destructive">
                      <LucideAlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {failedPasswordChange}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPasswordDialogOpen(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        !currentPassword ||
                        !newPassword ||
                        newPassword !== confirmPassword ||
                        isProcessing
                      }
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
                Deleting your account will permanently remove all your posted
                data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone. All your posted data will be permanently
                    removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">
                      Enter your password to confirm
                    </Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={passwordForDelete}
                      onChange={(e) => setPasswordForDelete(e.target.value)}
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
                  <AlertDialogCancel disabled={isProcessing}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDelete}
                    disabled={!passwordForDelete || isProcessing}
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
                For security reasons, please enter your password again to
                perform this action.
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
              <Button
                variant="outline"
                onClick={() => setReauthDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReauth}
                disabled={!reauthPassword || isProcessing}
              >
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
  );
}
