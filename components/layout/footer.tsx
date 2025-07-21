import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">音</span>
              </div>
              <span className="font-bold">音色共有サービス</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              FM音源の音色を共有するオープンソースプラットフォーム
            </p>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/your-org/timbre-sharing-service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>

        <div className="border-t mt-6 pt-6 text-center">
          <div className="text-sm text-muted-foreground">© 2024 音色共有サービス</div>
        </div>
      </div>
    </footer>
  )
}
