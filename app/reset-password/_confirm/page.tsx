"use client";

import { FirebaseError } from "firebase/app";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { LucideAlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { useAuthUser } from "@/stores/auth";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [invalidPassword, setInvalidPassword] = useState<string>("");

  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const user = useAuthUser();

  useEffect(() => {
    if (user) {
      // If user is already signed in, redirect to home page.
      router.push("/");
      return;
    }

    (async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode || "");
      } catch (_error: unknown) {
        // console.error("Invalid or expired reset code:", _error);
        router.push("/reset-password");
      }
    })();
  }, [oobCode, router, user]);

  async function handleSubmit() {
    setInvalidPassword("");
    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode || "", password);
      router.push("/signin");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/weak-password":
            setInvalidPassword("Password must be at least 6 characters long.");
            break;

          default:
            // console.error("Error resetting password:", error);
            break;
        }
      }

      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <p className="text-muted-foreground">Enter your new password</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

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
            className="w-full"
            disabled={
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              isSubmitting
            }
            onClick={handleSubmit}
          >
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
