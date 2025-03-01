import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  name: string
  bio: string
  profilePicture: string
}

interface UserState {
  currentUser: User
}

const initialState: UserState = {
  currentUser: {
    name: "Meme Lover",
    bio: "I love creating and sharing memes!",
    profilePicture: "/placeholder.svg?height=200&width=200",
  },
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      state.currentUser = {
        ...state.currentUser,
        ...action.payload,
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("userProfile", JSON.stringify(state.currentUser))
      }
    },
    loadUserProfile: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("userProfile")
        if (saved) {
          state.currentUser = JSON.parse(saved)
        }
      }
    },
  },
})

export const { updateProfile, loadUserProfile } = userSlice.actions

export default userSlice.reducer

