"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import {
  FaBars,
  FaCog,
  FaSearch,
  FaSignOutAlt,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { auth } from "@/lib/firebase";
import { useAuthUser, useAuthUserId } from "@/stores/auth";

export function Header() {
  const user = useAuthUser();
  const userId = useAuthUserId();

  const pathname = usePathname();
  const router = useRouter();
  const isSignedIn = user !== null;
  const showSearchInHeader = pathname !== "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && userId === "") {
      router.push("/signup/confirm");
    }
  }, [user, userId, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (_err: unknown) {
      // console.error("Error signing out:", _err);
      window.alert("Failed to log out. Please try again later.");
      return;
    }
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">I</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline">
              InstrumentShare
            </span>
          </Link>

          {/* Search Bar (desktop, not on home page) */}
          {showSearchInHeader && (
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-md mx-8"
            >
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search instruments..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/upload">
                    <FaUpload className="h-4 w-4 mr-2" />
                    Upload
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <FaUser className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/user/${userId}`}>
                        <FaUser className="mr-2 h-4 w-4" />
                        My Page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <FaCog className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <FaBars className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {showSearchInHeader && (
                  <form onSubmit={handleSearch} className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search instruments..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                )}

                {isSignedIn ? (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/upload">
                        <FaUpload className="h-4 w-4 mr-2" />
                        Upload
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={`/user/${userId}`}>
                        <FaUser className="h-4 w-4 mr-2" />
                        My Page
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/settings">
                        <FaCog className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={handleSignOut}
                    >
                      <FaSignOutAlt className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/signin">Sign In</Link>
                    </Button>
                    <Button className="justify-start" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
