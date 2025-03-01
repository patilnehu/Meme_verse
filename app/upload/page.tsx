"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/redux/store"
import { addUserMeme } from "@/redux/features/memes/memesSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, ImageIcon, Wand2, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

export default function UploadPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser } = useSelector((state: RootState) => state.user)

  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-fill title from filename if empty
    if (!title && file.name) {
      const fileName = file.name.split(".")[0]
      // Convert to title case and replace underscores/hyphens with spaces
      const formattedName = fileName
        .replace(/[-_]/g, " ")
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

      setTitle(formattedName)
    }
  }

  const handleGenerateCaption = async () => {
    if (!imagePreview) return

    setIsGeneratingCaption(true)

    try {
      // Simulate API call to generate caption
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Sample captions
      const captions = [
        "When you finally find the bug in your code after 5 hours",
        "That moment when you realize it's only Tuesday",
        "Me explaining to my mom why I need a new gaming PC",
        "When someone says they'll be ready in 5 minutes",
        "How I look waiting for my code to compile",
        "My face when the internet goes down for 5 minutes",
      ]

      const randomCaption = captions[Math.floor(Math.random() * captions.length)]
      setCaption(randomCaption)

      toast({
        title: "Caption generated!",
        description: "AI has created a caption for your meme.",
      })
    } catch (error) {
      toast({
        title: "Failed to generate caption",
        description: "Please try again or write your own caption.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCaption(false)
    }
  }

  const handleUpload = async () => {
    if (!imageFile || !title) {
      toast({
        title: "Missing information",
        description: "Please provide a title and upload an image.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // In a real app, we would upload to ImgBB or similar service
      // For this demo, we'll simulate an upload and use the local preview
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create new meme object
      const newMeme = {
        id: uuidv4(),
        name: title,
        url: imagePreview as string, // In a real app, this would be the URL from the upload service
        width: 500,
        height: 500,
        box_count: 2,
        captions: caption ? 1 : 0,
        likes: 0,
        comments: [],
        date: new Date().toISOString(),
        category: "New",
        user: currentUser.name,
      }

      // Add to Redux store
      dispatch(addUserMeme(newMeme))

      toast({
        title: "Meme uploaded successfully!",
        description: "Your meme has been added to your profile.",
      })

      // Redirect to the meme page
      router.push(`/meme/${newMeme.id}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your meme. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Create a Meme</h1>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Upload Area */}
            <div className="flex flex-col space-y-4">
              <div
                className={`
                  border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center
                  min-h-[300px] cursor-pointer hover:bg-muted/50 transition-colors
                  ${imagePreview ? "border-primary" : "border-border"}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full min-h-[300px]">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Meme preview"
                      fill
                      className="object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearImage()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            </div>

            {/* Meme Details */}
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Meme Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter a title for your meme"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="caption" className="block text-sm font-medium">
                    Caption (optional)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleGenerateCaption}
                    disabled={!imagePreview || isGeneratingCaption || isUploading}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    {isGeneratingCaption ? "Generating..." : "Generate Caption"}
                  </Button>
                </div>
                <Textarea
                  id="caption"
                  placeholder="Add a funny caption to your meme"
                  className="min-h-[100px]"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <Button
                className="mt-4"
                size="lg"
                onClick={handleUpload}
                disabled={!imagePreview || !title || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Meme"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

