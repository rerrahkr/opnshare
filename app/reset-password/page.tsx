"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaEnvelope } from "react-icons/fa"

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")

  const handleEmailSubmit = () => {
    // TODO: Send password reset email
    setStep(2)
  }

  if (step === 2) {
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
              We've sent a password reset link to {email}. Please check your email.
            </p>
            <div className="text-sm text-muted-foreground">
              If you don't receive the email, please check your spam folder.
            </div>
            <div className="space-y-2">
              <Button variant="outline" onClick={() => setStep(1)}>
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
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <p className="text-muted-foreground">Enter your registered email address</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button className="w-full" disabled={!email} onClick={handleEmailSubmit}>
            Send Reset Email
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
