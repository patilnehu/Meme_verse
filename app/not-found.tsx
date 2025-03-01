"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  // Random 404 meme images
  const memeImages = [
    "https://i.imgflip.com/7ry9g1.jpg",
    "https://i.imgflip.com/7ry9jt.jpg",
    "https://i.imgflip.com/7ry9n3.jpg",
  ]

  // Pick a random meme
  const randomMeme = memeImages[Math.floor(Math.random() * memeImages.length)]

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 md:px-6 md:py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md flex flex-col items-center"
      >
        <div className="relative w-full max-w-sm aspect-square mb-8 rounded-lg overflow-hidden">
          <Image
            src={randomMeme || "/placeholder.svg"}
            alt="404 Not Found Meme"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
        <p className="text-xl font-medium mb-1">Page Not Found</p>
        <p className="text-muted-foreground mb-8">The page you're looking for has gone to find better memes.</p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/explore">
              <Search className="h-4 w-4 mr-2" />
              Explore Memes
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

