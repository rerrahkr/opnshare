"use client";

// import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LucideAlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { useAuthUser } from "@/stores/auth";

const emailSchema = z.string().email();

export default function SignInPage() {
  const router = useRouter();
  const user = useAuthUser();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [failedSignIn, setFailedSignIn] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [router, user]);

  async function handleSignIn() {
    setFailedSignIn(false);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(redirectPath);
    } catch (_error: unknown) {
      setFailedSignIn(true);
      setIsSubmitting(false);
      // if (_error instanceof FirebaseError) {
      //   console.error("Error signing in:", _error);
      // } else {
      //   console.error("An unknown error occurred during sign in:", _error);
      // }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSignIn();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <p className="text-muted-foreground">
            Please sign in to your account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                disabled={isSubmitting}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {failedSignIn && (
              <Alert variant="destructive">
                <LucideAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid email or password. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={
                !emailSchema.safeParse(email).success ||
                !password ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <Link
              href="/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
