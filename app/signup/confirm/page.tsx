"use client";

import { FirebaseError } from "firebase/app";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
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
import type React from "react";
import { use, useEffect, useState } from "react";
import { LuAlertCircle, LuUpload } from "react-icons/lu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { useGetCurrentUser, useIsSignedIn } from "@/stores/auth";

function validateImage(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    // File format
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      reject("Only JPG, PNG, and GIF files are allowed.");
      return;
    }

    // Maximum file size (2 MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      reject("File size must be less than 2MB.");
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Minimum size (128 x 128 px)
      if (img.width < 128 || img.height < 128) {
        reject("Image must be at least 128x128 pixels.");
        return;
      }

      // Maximum size (2048 x 2048 px)
      if (img.width > 2048 || img.height > 2048) {
        reject("Image must be no larger than 2048x2048 pixels.");
        return;
      }

      // Is rectangle?
      if (img.width !== img.height) {
        reject("Image must be square (same width and height).");
        return;
      }

      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject("Invalid image file.");
    };

    img.src = url;
  });
}

export default function RegisterConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [invalidUserId, setInvalidUserId] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>("");

  const getUser = useGetCurrentUser();
  const hasSignedIn = useIsSignedIn();

  useEffect(() => {
    (async () => {
      if (hasSignedIn) {
        const user = getUser();
        if (!user) {
          console.error("User not found");
          router.push("/signin");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // No need to confirm again if user already exists.
          router.push("/");
        }

        // If some data is not completed, stay on this page.
        return;
      }

      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          email = window.prompt("Please provide your email for confirmation.");
        }

        try {
          await signInWithEmailLink(auth, email || "", window.location.href);
        } catch (error) {
          console.error("Error confirming registration:", error);
          router.push("/signup");
        }
      } else {
        console.error("Invalid sign-in link");
        router.push("/signup");
      }
    })();
  }, [router, hasSignedIn, getUser]);

  const handleSubmit = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setInvalidUserId(true);
        return;
      }

      setInvalidUserId(false);
    } catch (err) {
      console.error("Error checking user ID:", err);
      return;
    }

    const user = getUser();
    if (!user) {
      window.alert("User not found");
      return;
    }

    if (!password || password !== confirmPassword) {
      window.alert("Passwords do not match");
      return;
    }

    try {
      await updatePassword(user, password);
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/weak-password":
            window.alert("Weak password");
            return;

          case "auth/requires-recent-login":
            try {
              // Reauthenticate with email link.
              const email = user.email;
              const savedEmail = window.localStorage.getItem("emailForSignIn");
              const emailToUse = email || savedEmail;

              if (
                emailToUse &&
                isSignInWithEmailLink(auth, window.location.href)
              ) {
                console.log("Attempting reauthentication with email link...");
                await signInWithEmailLink(
                  auth,
                  emailToUse,
                  window.location.href
                );
                await updatePassword(user, password);
                console.log(
                  "Password updated successfully after reauthentication"
                );
              } else {
                console.error(
                  "Cannot reauthenticate: Email link not available"
                );
                window.alert(
                  "Authentication expired. Please sign in again from the email link."
                );
                router.push("/signup");
                return;
              }
            } catch (reauthError) {
              console.error("Reauthentication failed:", reauthError);
              if (
                reauthError instanceof FirebaseError &&
                reauthError.code === "auth/invalid-action-code"
              ) {
                window.alert(
                  "The email link has expired. Please request a new registration link."
                );
                router.push("/signup");
              }
              return;
            }
            break;

          default:
            console.error("Error updating password:", err);
            return;
        }
      }
    }

    if (profileImage) {
      // TODO: Firebase StorageにアップロードしてURLを取得
      // const imageUrl = await uploadProfileImage(profileImage, user.uid);
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
      console.log("Registration completed successfully");
    } catch (err) {
      console.error("Error saving user data:", err);
      return;
    }

    router.push("/");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileImage(null);
      setImageError("");
      return;
    }

    try {
      await validateImage(file);

      setImageError("");
      setProfileImage(file);
    } catch (err: unknown) {
      e.target.value = "";

      setImageError(err as string);
      setProfileImage(null);
      return;
    }
  };

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
          {/* User ID */}
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </div>
          {invalidUserId && (
            <Alert>
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

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={
                    profileImage ? URL.createObjectURL(profileImage) : undefined
                  }
                />
                <AvatarFallback>
                  <LuUpload className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Select Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </Button>
                {imageError && (
                  <Alert className="mt-2">
                    <LuAlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF • Square • 128-2048px • Max 2MB
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={
              !userId ||
              !password ||
              !confirmPassword ||
              !displayName ||
              password !== confirmPassword
            }
            onClick={handleSubmit}
          >
            Complete Registration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
