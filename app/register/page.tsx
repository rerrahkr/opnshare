"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail } from "lucide-react"

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [userId] = useState(() => Math.random().toString(36).substring(2, 8)) // Generated user ID

  const handleEmailSubmit = () => {
    // TODO: Send registration email
    setStep(2)
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Email Sent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">We've sent a registration link to {email}. Please check your email.</p>
            <div className="text-sm text-muted-foreground">
              If you don't receive the email, please check your spam folder.
            </div>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <p className="text-muted-foreground">Create your account</p>
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
            Send Registration Link
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
