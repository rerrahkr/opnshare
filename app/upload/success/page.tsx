import Link from "next/link"
import { CheckCircle, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Upload Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your instrument has been uploaded successfully. Other users can now discover your instrument.
          </p>

          <div className="space-y-3 pt-4">
            <Button asChild className="w-full">
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload another instrument
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/mypage">
                <User className="h-4 w-4 mr-2" />
                Back to my page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
