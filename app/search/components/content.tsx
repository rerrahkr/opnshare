"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FaFilter, FaList, FaSearch, FaTh } from "react-icons/fa";
import type { InstrumentMetaInfo } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { searchInstruments } from "@/features/instrument/api";
import { InstrumentCard } from "@/features/instrument/components/instrument-card";
import type {
  InstrumentDoc,
  RecommendedChip,
} from "@/features/instrument/models";
import { getUidNameTable } from "@/features/user/api";
import { useSearchStore } from "@/stores/search";
import { PAGE_SIZE } from "../defines";
import { type SearchParams, type SortBy, searchParamsSchema } from "../types";
import { FilterPanel } from "./filter-panel";
import { InstrumentListItem } from "./instrument-list-item";

type SearchResultDisplayState = {
  infoList: InstrumentMetaInfo[];
  hasMore: boolean;
  page: number;
  lastDoc:
    | {
        id: string;
        doc: InstrumentDoc;
      }
    | undefined;
};

const INIT_SEARCH_RESULT_STATE: SearchResultDisplayState = {
  infoList: [],
  hasMore: true,
  page: 0,
  lastDoc: undefined,
} as const;

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
  // Initialize filter conditions from URL
  const [selectedChips, setSelectedChips] = useState<RecommendedChip[]>(
    parsedSearchParams.chip
  );
  const [filterTags, setFilterTags] = useState<string[]>(
    parsedSearchParams.tag
  );
  // const [likeRange, setLikeRange] = useState<[number, number]>(
  //   parsedSearchParams.likes
  // );

  // Infinite scroll states
  const [isPending, startTransition] = useTransition();
  const [searchResultState, setSearchResultState] =
    useState<SearchResultDisplayState>(INIT_SEARCH_RESULT_STATE);

  function clearSearchResultState() {
    setSearchResultState(INIT_SEARCH_RESULT_STATE);
  }

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadSearchResults = useCallback(async () => {
    if (isPending || !searchResultState.hasMore) return;

    startTransition(async () => {
      try {
        const { docs, hasMore } = await searchInstruments({
          searchQuery: searchQuery,
          sortBy: sortBy,
          chips: selectedChips,
          tags: filterTags,
          // likeRange: likeRange,
          pageSize: PAGE_SIZE,
          lastDoc: searchResultState.lastDoc,
        });

        const authorUids = [...new Set(docs.map(([doc]) => doc.authorUid))];
        const userTable = await getUidNameTable(authorUids);

        const infoList = docs.map(([doc, id]) => ({
          id,
          name: doc.name,
          author: userTable[doc.authorUid] ?? "",
          tags: doc.tags,
          likes: doc.likeCount,
          dateIso: doc.createdAt.toDate().toISOString(),
        }));

        setSearchResultState((prev) => ({
          infoList: [...prev.infoList, ...infoList],
          hasMore,
          page: prev.page + 1,
          lastDoc: docs[docs.length - 1]
            ? {
                id: docs[docs.length - 1][1],
                doc: docs[docs.length - 1][0],
              }
            : prev.lastDoc,
        }));
      } catch (e) {
        console.error(e);
        setSearchResultState((prev) => ({
          ...prev,
          hasMore: false,
        }));
      }
    });
  }, [
    isPending,
    searchResultState,
    searchQuery,
    sortBy,
    selectedChips,
    filterTags,
    // likeRange,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadSearchResults();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadSearchResults]);

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
        } else if (key === "chip" || key === "tag") {
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
    startTransition(() => {
      clearSearchResultState();
      updateURL({ q: searchQuery });
      loadSearchResults();
    });
  }

  function handleSortChange(value: string) {
    const method = value as SortBy;
    setSortBy(method);
    startTransition(() => {
      clearSearchResultState();
      updateURL({ sort: method });
      loadSearchResults();
    });
  }

  function handleChipChange(chip: RecommendedChip, checked: boolean) {
    const newChips = checked
      ? [...selectedChips, chip]
      : selectedChips.filter((c) => c !== chip);
    setSelectedChips(newChips);
    startTransition(() => {
      clearSearchResultState();
      updateURL({ chip: newChips });
      loadSearchResults();
    });
  }

  function handleChangeTags(tags: string[]) {
    setFilterTags(tags);
    startTransition(() => {
      clearSearchResultState();
      updateURL({ tag: tags });
      loadSearchResults();
    });
  }

  // function handleLikeRangeChange(range: [number, number]) {
  //   setLikeRange(range);
  //   startTransition(() => {
  //     clearSearchResultState();
  //     updateURL({ likes: range });
  //     loadSearchResults();
  //   });
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form className="flex gap-4 mb-4" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search instruments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

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
                  // likeRange={likeRange}
                  // onLikeRangeChange={handleLikeRangeChange}
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
                // likeRange={likeRange}
                // onLikeRangeChange={handleLikeRangeChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            Search Results: {searchResultState.infoList.length} items
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResultState.infoList.map((info) => (
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
              {searchResultState.infoList.map((info) => (
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

          {/* Intersection Observer Target */}
          <div
            ref={observerTarget}
            className="h-10 flex items-center justify-center mt-8"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : searchResultState.hasMore ? (
              <span className="text-sm text-muted-foreground">
                Scroll down to load more
              </span>
            ) : searchResultState.infoList.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                All results loaded
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No results found
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
