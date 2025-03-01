"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchMemes,
  loadLikedMemes,
  loadUserMemes,
} from "@/redux/features/memes/memesSlice";
import { loadUserProfile } from "@/redux/features/user/userSlice";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { trending, status } = useSelector((state: RootState) => state.memes);

  useEffect(() => {
    // Load data from localStorage and API
    dispatch(loadLikedMemes());
    dispatch(loadUserMemes());
    dispatch(loadUserProfile());

    if (status === "idle") {
      dispatch(fetchMemes());
    }
  }, [dispatch, status]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to <span className="text-primary">MemeVerse</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Explore, create, and share the funniest memes on the internet.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg">
                <Link href="/explore">Start Exploring</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/upload">Create a Meme</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Memes Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                <TrendingUp className="mr-1 h-4 w-4" />
                Trending Now
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Hot Memes
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out what's making the internet laugh today.
              </p>
            </motion.div>
          </div>

          {status === "loading" ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="meme-grid mt-8"
            >
              {trending.slice(0, 6).map((meme) => (
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
          )}

          <div className="flex justify-center mt-10">
            <Button asChild size="lg">
              <Link href="/explore">View All Memes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to enjoy and create memes in one place.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              {[
                {
                  title: "Explore Memes",
                  description:
                    "Browse through thousands of memes with our intuitive interface.",
                  icon: "🔍",
                  link: "/explore",
                },
                {
                  title: "Create Memes",
                  description:
                    "Upload and customize your own memes with our easy-to-use editor.",
                  icon: "🎨",
                  link: "/upload",
                },
                {
                  title: "Share & Interact",
                  description:
                    "Like, comment, and share your favorite memes with friends.",
                  icon: "❤️",
                  link: "/explore",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                  <Button asChild variant="link">
                    <Link href={feature.link}>Learn more</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Join the Fun?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Start exploring and creating memes today!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <Button asChild size="lg">
                  <Link href="/explore">Start Exploring</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/upload">Create a Meme</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
