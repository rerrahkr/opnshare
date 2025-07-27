"use client";

import { type ActionCodeSettings, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEnvelope, FaSpinner } from "react-icons/fa";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { useAuthUser } from "@/stores/auth";

const emailSchema = z.string().email();

type RequestState = "prohibited" | "prepared" | "requesting" | "requested";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("prohibited");

  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (user) {
      // If user is already signed in, redirect to home page.
      router.push("/");
    }
  }, [router, user]);

  async function handleEmailSubmit() {
    setRequestState("requesting");

    try {
      const actionCodeSettings: ActionCodeSettings = {
        // url: `${window.location.origin}/reset-password/confirm`,
        url: `${window.location.origin}/signin`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      setRequestState("requested");
    } catch (_error: unknown) {
      // console.error("Error sending reset email:", _error);
      setRequestState("prepared");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleEmailSubmit();
  }

  if (requestState === "requested") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <FaEnvelope className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Email Sent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We've sent a password reset link to {email}. Please check your
              email.
            </p>
            <div className="text-sm text-muted-foreground">
              If you don't receive the email, please check your spam folder.
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setRequestState("prepared")}
              >
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-muted-foreground">
            Enter your registered email address
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  const parsedResult = emailSchema.safeParse(e.target.value);
                  if (parsedResult.success) {
                    setRequestState("prepared");
                  } else {
                    setRequestState("prohibited");
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={requestState !== "prepared"}
            >
              {requestState === "requesting" ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/signin" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
