import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../store"

export interface Meme {
  id: string
  name: string
  url: string
  width: number
  height: number
  box_count: number
  captions?: number
  likes?: number
  comments?: Comment[]
  date?: string
  category?: string
  user?: string
}

export interface Comment {
  id: string
  text: string
  user: string
  date: string
}

interface MemesState {
  items: Meme[]
  trending: Meme[]
  userMemes: Meme[]
  likedMemes: string[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  currentMeme: Meme | null
  searchResults: Meme[]
}

const initialState: MemesState = {
  items: [],
  trending: [],
  userMemes: [],
  likedMemes: [],
  status: "idle",
  error: null,
  currentMeme: null,
  searchResults: [],
}

// Fetch memes from Imgflip API
export const fetchMemes = createAsyncThunk("memes/fetchMemes", async () => {
  const response = await fetch("https://api.imgflip.com/get_memes")
  const data = await response.json()

  if (!data.success) {
    throw new Error("Failed to fetch memes")
  }

  // Add additional properties to memes
  const memes = data.data.memes.map((meme: Meme) => ({
    ...meme,
    likes: Math.floor(Math.random() * 1000),
    comments: [],
    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    category: ["Trending", "New", "Classic", "Random"][Math.floor(Math.random() * 4)],
  }))

  return memes
})

// Search memes
export const searchMemes = createAsyncThunk("memes/searchMemes", async (query: string, { getState }) => {
  const state = getState() as RootState
  const allMemes = state.memes.items

  return allMemes.filter((meme) => meme.name.toLowerCase().includes(query.toLowerCase()))
})

// Add comment to meme
export const addComment = createAsyncThunk(
  "memes/addComment",
  async ({ memeId, comment }: { memeId: string; comment: Comment }, { getState }) => {
    return { memeId, comment }
  },
)

const memesSlice = createSlice({
  name: "memes",
  initialState,
  reducers: {
    setCurrentMeme: (state, action: PayloadAction<string>) => {
      state.currentMeme = state.items.find((meme) => meme.id === action.payload) || null
    },
    toggleLikeMeme: (state, action: PayloadAction<string>) => {
      const memeId = action.payload

      if (state.likedMemes.includes(memeId)) {
        state.likedMemes = state.likedMemes.filter((id) => id !== memeId)

        // Decrease like count
        const meme = state.items.find((m) => m.id === memeId)
        if (meme && meme.likes) meme.likes--
      } else {
        state.likedMemes.push(memeId)

        // Increase like count
        const meme = state.items.find((m) => m.id === memeId)
        if (meme && meme.likes) meme.likes++
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("likedMemes", JSON.stringify(state.likedMemes))
      }
    },
    loadLikedMemes: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("likedMemes")
        if (saved) {
          state.likedMemes = JSON.parse(saved)
        }
      }
    },
    addUserMeme: (state, action: PayloadAction<Meme>) => {
      state.userMemes.push(action.payload)

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userMemes", JSON.stringify(state.userMemes))
      }
    },
    loadUserMemes: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("userMemes")
        if (saved) {
          state.userMemes = JSON.parse(saved)
        }
      }
    },
    filterMemesByCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload
      if (category === "All") return

      state.searchResults = state.items.filter((meme) => meme.category === category)
    },
    sortMemes: (state, action: PayloadAction<"likes" | "date">) => {
      const sortBy = action.payload

      if (sortBy === "likes") {
        state.searchResults = [...state.searchResults].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      } else if (sortBy === "date") {
        state.searchResults = [...state.searchResults].sort(
          (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
        )
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemes.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchMemes.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload

        // Set trending memes (top 10 by likes)
        state.trending = [...action.payload].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10)

        // Initialize search results with all memes
        state.searchResults = action.payload
      })
      .addCase(fetchMemes.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.error.message || "Failed to fetch memes"
      })
      .addCase(searchMemes.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { memeId, comment } = action.payload
        const meme = state.items.find((m) => m.id === memeId)

        if (meme) {
          if (!meme.comments) meme.comments = []
          meme.comments.push(comment)

          // Update current meme if it's the one being commented on
          if (state.currentMeme && state.currentMeme.id === memeId) {
            state.currentMeme = meme
          }

          // Save comments to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "memeComments",
              JSON.stringify(
                state.items.reduce(
                  (acc, meme) => {
                    if (meme.comments && meme.comments.length > 0) {
                      acc[meme.id] = meme.comments
                    }
                    return acc
                  },
                  {} as Record<string, Comment[]>,
                ),
              ),
            )
          }
        }
      })
  },
})

export const {
  setCurrentMeme,
  toggleLikeMeme,
  loadLikedMemes,
  addUserMeme,
  loadUserMemes,
  filterMemesByCategory,
  sortMemes,
} = memesSlice.actions

export default memesSlice.reducer

