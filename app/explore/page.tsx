"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchMemes, searchMemes, filterMemesByCategory, sortMemes } from "@/redux/features/memes/memesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Search } from "lucide-react"
import { debounce } from "@/lib/utils"

export default function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, searchResults, status } = useSelector((state: RootState) => state.memes)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"likes" | "date">("likes")

  const itemsPerPage = 12
  const totalPages = Math.ceil(searchResults.length / itemsPerPage)

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMemes())
    }
  }, [dispatch, status])

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      dispatch(searchMemes(query))
    }, 300),
    [],
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)

    if (category === "All") {
      dispatch(searchMemes(""))
    } else {
      dispatch(filterMemesByCategory(category))
    }
  }

  const handleSortChange = (sortType: "likes" | "date") => {
    setSortBy(sortType)
    dispatch(sortMemes(sortType))
  }

  // Get current page items
  const currentItems = searchResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col items-start space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Explore Memes</h1>

        {/* Search and Filters */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search memes..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["All", "Trending", "New", "Classic", "Random"].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant={sortBy === "likes" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("likes")}
            >
              Most Liked
            </Button>
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("date")}
            >
              Newest
            </Button>
          </div>
        </div>

        {/* Memes Grid */}
        {status === "loading" ? (
          <div className="flex justify-center items-center w-full min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : currentItems.length > 0 ? (
          <motion.div variants={container} initial="hidden" animate="show" className="meme-grid w-full mt-6">
            {currentItems.map((meme) => (
              <motion.div
                key={meme.id}
                variants={item}
                className="meme-card overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <Link href={`/meme/${meme.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={meme.url || "/placeholder.svg"}
                      alt={meme.name}
                      fill
                      className="object-cover transition-all hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{meme.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {meme.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {meme.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full min-h-[300px] text-center">
            <p className="text-muted-foreground mb-4">No memes found matching your search.</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                dispatch(searchMemes(""))
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center w-full mt-8">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show (centered around current page)
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

