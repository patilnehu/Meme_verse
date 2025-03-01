"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { fetchMemes } from "@/redux/features/memes/memesSlice"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Trophy, Medal, Award } from "lucide-react"

export default function LeaderboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items, status } = useSelector((state: RootState) => state.memes)

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMemes())
    }
  }, [dispatch, status])

  // Get top 10 memes by likes
  const topMemes = [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10)

  // Create a map of users and their total likes
  const userLikesMap = items.reduce(
    (acc, meme) => {
      if (meme.user) {
        if (!acc[meme.user]) {
          acc[meme.user] = 0
        }
        acc[meme.user] += meme.likes || 0
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array and sort by likes
  const topUsers = Object.entries(userLikesMap)
    .map(([user, likes]) => ({ user, likes }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-12"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">Top memes and users based on likes and engagement</p>
          </div>

          {/* Top Memes Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Top 10 Memes</h2>
            </div>

            {status === "loading" ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {topMemes.map((meme, index) => (
                  <motion.div
                    key={meme.id}
                    variants={item}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                      {index + 1}
                    </div>

                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={meme.url || "/placeholder.svg"}
                        alt={meme.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/meme/${meme.id}`} className="hover:underline">
                        <h3 className="font-medium truncate">{meme.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">By {meme.user || "Anonymous"}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm">
                        <Heart className="h-4 w-4 text-red-500" />
                        {meme.likes}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <MessageCircle className="h-4 w-4" />
                        {meme.comments?.length || 0}
                      </span>
                    </div>

                    <Button asChild size="sm">
                      <Link href={`/meme/${meme.id}`}>View</Link>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Top Users Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold">Top 10 Users</h2>
            </div>

            {status === "loading" ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {topUsers.map((user, index) => (
                  <motion.div
                    key={user.user}
                    variants={item}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                      {index + 1}
                    </div>

                    <div className="relative h-12 w-12 rounded-full overflow-hidden border">
                      <Image
                        src={`/placeholder.svg?height=48&width=48`}
                        alt={user.user}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium">{user.user}</h3>
                      <p className="text-sm text-muted-foreground">Total Likes: {user.likes}</p>
                    </div>

                    {index < 3 && (
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && <Medal className="h-6 w-6 text-yellow-500" />}
                        {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                        {index === 2 && <Medal className="h-6 w-6 text-amber-700" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

