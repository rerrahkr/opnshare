"use client";

import { type ActionCodeSettings, sendSignInLinkToEmail } from "firebase/auth";
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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("prohibited");

  const user = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [router, user]);

  async function handleEmailSubmit() {
    setRequestState("requesting");

    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/signup/confirm`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      window.localStorage.setItem("emailForSignIn", email);

      setRequestState("requested");
    } catch (_error) {
      // console.error("Error creating user:", _error);
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
              We've sent a registration link to {email}. Please check your
              email.
            </p>
            <div className="text-sm text-muted-foreground">
              If you don't receive the email, please check your spam folder.
            </div>
            <Button
              variant="outline"
              onClick={() => setRequestState("prepared")}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <p className="text-muted-foreground">Create your account</p>
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

                  const parsedEmail = emailSchema.safeParse(e.target.value);
                  if (parsedEmail.success) {
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
                "Send Registration Link"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
