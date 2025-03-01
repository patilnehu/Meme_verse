"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import {
  fetchMemes,
  setCurrentMeme,
  toggleLikeMeme,
  addComment,
  loadLikedMemes,
  type Comment,
} from "@/redux/features/memes/memesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, ArrowLeft, Send } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

export default function MemePage({ params }: { params: { id: string } }) {
  const { id } = params
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { currentMeme, status, likedMemes } = useSelector((state: RootState) => state.memes)
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    dispatch(loadLikedMemes())

    if (status === "idle") {
      dispatch(fetchMemes()).then(() => {
        dispatch(setCurrentMeme(id))
      })
    } else {
      dispatch(setCurrentMeme(id))
    }
  }, [dispatch, id, status])

  const handleLike = () => {
    dispatch(toggleLikeMeme(id))

    if (!likedMemes.includes(id)) {
      toast({
        title: "Meme liked!",
        description: "This meme has been added to your liked memes.",
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentMeme?.name || "Check out this meme!",
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Meme link copied to clipboard.",
      })
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim()) return

    const newComment: Comment = {
      id: uuidv4(),
      text: commentText,
      user: currentUser.name,
      date: new Date().toISOString(),
    }

    dispatch(addComment({ memeId: id, comment: newComment }))
    setCommentText("")
  }

  if (status === "loading" || !currentMeme) {
    return (
      <div className="container flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isLiked = likedMemes.includes(id)

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/explore">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Meme Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square overflow-hidden rounded-lg border"
          >
            <Image
              src={currentMeme.url || "/placeholder.svg"}
              alt={currentMeme.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Meme Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold">{currentMeme.name}</h1>
              <p className="text-muted-foreground mt-1">
                {currentMeme.category} • {formatDate(currentMeme.date || new Date().toISOString())}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className={`like-button flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
                <span>{currentMeme.likes}</span>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{currentMeme.comments?.length || 0}</span>
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </Button>
            </div>

            {/* Comments Section */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold">Comments</h2>

              {/* Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {currentMeme.comments && currentMeme.comments.length > 0 ? (
                    currentMeme.comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{comment.user}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(comment.date)}</p>
                        </div>
                        <p className="mt-2">{comment.text}</p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

