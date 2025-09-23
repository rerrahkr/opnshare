import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { FmSynthesizerProvider } from "./_provider/synth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPNShare",
  description:
    "Explore and share FM sound instruments for OPN-series chips used in retro game music and chiptunes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FmSynthesizerProvider>
            <Header />
            <main>{children}</main>
          </FmSynthesizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
