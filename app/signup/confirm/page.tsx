"use client";

import { FirebaseError } from "firebase/app";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { LucideAlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { useAuthUser } from "@/stores/auth";

export default function SignUpConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [invalidUserId, setInvalidUserId] = useState<boolean>(false);
  const [invalidPassword, setInvalidPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const user = useAuthUser();

  useEffect(() => {
    (async () => {
      // Check if user information is fulfilled.
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // No need to confirm again if user already exists.
          router.push("/");
        }

        // If some data is not completed, stay on this page.
        return;
      }

      // If user is not signed in, check if the email link is valid.
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation.");
        }

        try {
          await signInWithEmailLink(auth, email || "", window.location.href);
        } catch (_error: unknown) {
          // console.error("Error confirming registration:", _error);
          router.push("/signup");
        }
      } else {
        // console.error("Invalid sign-in link");
        router.push("/signup");
      }
    })();
  }, [router, user]);

  async function reauthenticate(user: User, emailToUse: string): Promise<void> {
    try {
      // Reauthenticate with email link.

      if (emailToUse && isSignInWithEmailLink(auth, window.location.href)) {
        // console.log("Attempting reauthentication with email link...");
        await signInWithEmailLink(auth, emailToUse, window.location.href);
        await updatePassword(user, password);
        // console.log("Password updated successfully after reauthentication");
      } else {
        // console.error("Cannot reauthenticate: Email link not available");
        throw "Authentication expired. Please sign in again from the email link.";
      }
    } catch (reauthError) {
      // console.error("Reauthentication failed:", reauthError);
      if (
        reauthError instanceof FirebaseError &&
        reauthError.code === "auth/invalid-action-code"
      ) {
        throw "The email link has expired. Please request a new registration link.";
      }
    }
  }

  async function handleSubmitInfo() {
    if (!user) {
      router.push("/signup");
      return;
    }

    setIsSubmitting(true);
    setInvalidUserId(false);
    setInvalidPassword("");

    // Check User ID uniqueness
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setInvalidUserId(true);
        setIsSubmitting(false);
        return;
      }
    } catch (_err) {
      // console.error("Error checking user ID:", err);
      setIsSubmitting(false);
      return;
    }

    // Password check
    if (!password || password !== confirmPassword) {
      window.alert("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    // Update password
    try {
      await updatePassword(user, password);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/weak-password":
            setInvalidPassword("Password must be at least 6 characters long.");
            setIsSubmitting(false);
            return;

          case "auth/requires-recent-login":
            try {
              const savedEmail = window.localStorage.getItem("emailForSignIn");
              const emailToUse = user.email || savedEmail || "";
              await reauthenticate(user, emailToUse);
            } catch (err: unknown) {
              if (typeof err === "string") {
                window.alert(err);
              }
              router.push("/signup");
              return;
            }
            break;

          default:
            // console.error("Error updating password:", err);
            setIsSubmitting(false);
            return;
        }
      }
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        userId,
        displayName,
        imageUrl: "",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      });

      window.localStorage.removeItem("emailForSignIn");
      // console.log("Registration completed successfully");
    } catch (_err) {
      // console.error("Error saving user data:", _err);
      setIsSubmitting(false);
      return;
    }

    router.push("/");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSubmitInfo();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Registration</CardTitle>
          <p className="text-muted-foreground">
            Please enter your profile information
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            {/* User ID */}
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            {invalidUserId && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This user ID is already taken. Please choose another one.
                </AlertDescription>
              </Alert>
            )}

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
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
            {invalidPassword !== "" && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>{invalidPassword}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                !userId ||
                !password ||
                !confirmPassword ||
                !displayName ||
                password !== confirmPassword ||
                isSubmitting
              }
            >
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
