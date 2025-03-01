"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { loadUserMemes, loadLikedMemes } from "@/redux/features/memes/memesSlice"
import { updateProfile, loadUserProfile } from "@/redux/features/user/userSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Edit, User, Check, X } from "lucide-react"

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { toast } = useToast()
  const { userMemes, items, likedMemes } = useSelector((state: RootState) => state.memes)
  const { currentUser } = useSelector((state: RootState) => state.user)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentUser.name)
  const [bio, setBio] = useState(currentUser.bio)
  const [profilePicture, setProfilePicture] = useState(currentUser.profilePicture)
  const [activeTab, setActiveTab] = useState<"uploads" | "likes">("uploads")

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(loadUserProfile())
    dispatch(loadUserMemes())
    dispatch(loadLikedMemes())
  }, [dispatch])

  // Get liked memes from the store
  const likedMemesData = items.filter((meme) => likedMemes.includes(meme.id))

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Check if file is an image
    if (!file.type.match("image.*")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF).",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a display name.",
        variant: "destructive",
      })
      return
    }

    dispatch(
      updateProfile({
        name,
        bio,
        profilePicture,
      }),
    )

    setIsEditing(false)

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleCancelEdit = () => {
    setName(currentUser.name)
    setBio(currentUser.bio)
    setProfilePicture(currentUser.profilePicture)
    setIsEditing(false)
  }

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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-8"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                <Image
                  src={profilePicture || "/placeholder.svg"}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              </div>

              {isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-0 right-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Change
                </Button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start">
              {isEditing ? (
                <div className="w-full space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Display Name
                    </label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-md" />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="max-w-md" />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-2 text-center md:text-left">{currentUser.bio}</p>

                  <div className="flex gap-4 mt-4">
                    <div className="text-center">
                      <p className="font-bold">{userMemes.length}</p>
                      <p className="text-xs text-muted-foreground">Uploads</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{likedMemes.length}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8">
              <button
                className={`pb-4 font-medium text-sm ${
                  activeTab === "uploads" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("uploads")}
              >
                My Uploads
              </button>
              <button
                className={`pb-4 font-medium text-sm ${
                  activeTab === "likes" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("likes")}
              >
                Liked Memes
              </button>
            </div>
          </div>

          {/* Memes Grid */}
          {activeTab === "uploads" ? (
            userMemes.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="meme-grid">
                {userMemes.map((meme) => (
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No uploads yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">You haven't uploaded any memes yet.</p>
                <Button asChild>
                  <Link href="/upload">Upload a Meme</Link>
                </Button>
              </div>
            )
          ) : likedMemesData.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="meme-grid">
              {likedMemesData.map((meme) => (
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
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No liked memes</h3>
              <p className="text-muted-foreground mt-1 mb-4">You haven't liked any memes yet.</p>
              <Button asChild>
                <Link href="/explore">Explore Memes</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

