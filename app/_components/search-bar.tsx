"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
// import { FaShuffle } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar(): React.JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search instruments..."
          className="pl-10 h-12 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="h-12 px-6">
        Search
      </Button>
      {/* <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-12 px-6 bg-transparent"
        onClick={() => router.push("/instrument/random-id-789")}
      >
        <FaShuffle className="h-4 w-4 mr-2" />
        Random
      </Button> */}
    </form>
  );
}
