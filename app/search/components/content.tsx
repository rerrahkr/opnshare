"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { FaFilter, FaList, FaSearch, FaTh } from "react-icons/fa";
import { z } from "zod";
import type { InstrumentMetaInfo } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InstrumentCard } from "@/features/instrument/components/instrument-card";
import {
  type RecommendedChip,
  recommendedChipSchema,
} from "@/features/instrument/models";
import { MAX_LIKE_COUNT } from "../defines";
import { FilterPanel } from "./filter-panel";

// TODO: Load actual data
const infoList: InstrumentMetaInfo[] = [
  {
    id: "aaaaa",
    author: "abc",
    name: "qc",
    likes: 12,
    tags: ["aa", "bb"],
    dateIso: new Date().toISOString(),
  },
  {
    id: "ANBC",
    author: "SIV",
    name: "ewvf",
    likes: 3,
    tags: ["bb"],
    dateIso: new Date().toISOString(),
  },
  {
    id: "vdwww",
    author: "eee",
    name: "2vr23",
    likes: 1,
    tags: ["cc"],
    dateIso: new Date().toISOString(),
  },
  {
    id: "vwewa",
    author: "abc",
    name: "BHCI",
    likes: 13,
    tags: ["aa", "cc"],
    dateIso: new Date().toISOString(),
  },
];

import { useSearchStore } from "@/stores/search";
import { InstrumentListItem } from "./instrument-list-item";

const searchParamsSchema = z.object({
  q: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.string().min(1).max(100).optional()
  ),

  sort: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z
      .union([
        z.literal("newest"),
        z.literal("popular"),
        z.literal("downloads"),
        z.literal("likes"),
      ])
      .default("newest")
  ),

  page: z.preprocess((val) => {
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isNaN(n) ? undefined : n;
    }
    return undefined;
  }, z.number().min(1).default(1)),

  chips: z.preprocess((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return undefined;
  }, z.array(recommendedChipSchema).default([])),

  tags: z.preprocess((val) => {
    if (typeof val === "string") {
      return val
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return undefined;
  }, z.array(z.string()).default([])),

  likes: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        const nums = val.split("-").map((v) => Number(v));
        return nums.some((n) => Number.isNaN(n)) ? undefined : nums;
      }
      return undefined;
    },
    z.tuple([z.number().min(0), z.number().min(0)]).default([0, MAX_LIKE_COUNT])
  ),
});

type SearchParams = z.infer<typeof searchParamsSchema>;
type SortBy = SearchParams["sort"];

const ITEMS_PER_PAGE = 9;

export function SearchPageContent() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const parsedSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // Get initial values from URL
  const { viewMode, setViewMode } = useSearchStore();
  const [searchQuery, setSearchQuery] = useState<string>(
    parsedSearchParams.q || ""
  );
  const [sortBy, setSortBy] = useState<SortBy>(parsedSearchParams.sort);
  const currentPage = parsedSearchParams.page;

  // Initialize filter conditions from URL
  const [selectedChips, setSelectedChips] = useState<RecommendedChip[]>(
    parsedSearchParams.chips
  );
  const [filterTags, setFilterTags] = useState<string[]>(
    parsedSearchParams.tags
  );
  const [likeRange, setLikeRange] = useState<[number, number]>(
    parsedSearchParams.likes
  );

  // Function to update URL
  function updateURL(updates: Partial<SearchParams>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        if (key === "likes" && value.length === 2) {
          params.set(key, value.join("-"));
        } else if (key === "chips" || key === "tags") {
          params.set(key, value.join(","));
        }
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`/search?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateURL({ q: searchQuery, page: 1 });
  }

  function handleSortChange(value: string) {
    const method = value as SortBy;
    setSortBy(method);
    updateURL({ sort: method, page: 1 });
  }

  function handleChipChange(chip: RecommendedChip, checked: boolean) {
    const newChips = checked
      ? [...selectedChips, chip]
      : selectedChips.filter((c) => c !== chip);
    setSelectedChips(newChips);
    updateURL({ chips: newChips });
  }

  function handleChangeTags(tags: string[]) {
    setFilterTags(tags);
    updateURL({ tags });
  }

  function handleLikeRangeChange(range: [number, number]) {
    setLikeRange(range);
    updateURL({ likes: range });
  }

  const resultCount = infoList.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search instruments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                console.log(e.target.value);
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden bg-transparent">
                  <FaFilter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter</SheetTitle>
                </SheetHeader>
                <FilterPanel
                  selectedChips={selectedChips}
                  onChipChange={handleChipChange}
                  filterTags={filterTags}
                  onChangeTags={handleChangeTags}
                  likeRange={likeRange}
                  onLikeRangeChange={handleLikeRangeChange}
                />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <FaTh className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <FaList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <FilterPanel
                selectedChips={selectedChips}
                onChipChange={handleChipChange}
                filterTags={filterTags}
                onChangeTags={handleChangeTags}
                likeRange={likeRange}
                onLikeRangeChange={handleLikeRangeChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            Search results: {resultCount} items
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {infoList.map((info) => (
                <InstrumentCard
                  key={info.id}
                  id={info.id}
                  title={info.name}
                  author={info.author}
                  tags={info.tags}
                  likes={info.likes}
                  dateIso={info.dateIso}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {infoList.map((info) => (
                <InstrumentListItem
                  key={info.id}
                  id={info.id}
                  title={info.name}
                  author={info.author}
                  tags={info.tags}
                  likes={info.likes}
                  dateIso={info.dateIso}
                />
              ))}
            </div>
          )}

          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/search?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: (currentPage - 1).toString(),
                      })}`}
                    />
                  </PaginationItem>
                )}
                {Array.from({
                  length: Math.ceil(resultCount / ITEMS_PER_PAGE),
                }).map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(resultCount / ITEMS_PER_PAGE) ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={`page-${pageNumber}`}>
                        <PaginationLink
                          href={`/search?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            page: pageNumber.toString(),
                          })}`}
                          isActive={currentPage === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                {currentPage < Math.ceil(resultCount / ITEMS_PER_PAGE) && (
                  <PaginationItem>
                    <PaginationNext
                      href={`/search?${new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        page: (currentPage + 1).toString(),
                      })}`}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
