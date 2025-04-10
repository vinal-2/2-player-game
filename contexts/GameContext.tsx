"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type GameType = {
  id: string
  name: string
  icon: string
  backgroundColor: string
  description: string
  instructions: string
  component: string
  difficulty?: number
  minPlayers?: number
  maxPlayers?: number
  category?: string
  isNew?: boolean
  isPremium?: boolean
}

type GameContextType = {
  games: GameType[]
  recentlyPlayed: string[]
  favorites: string[]
  addToRecentlyPlayed: (gameId: string) => void
  toggleFavorite: (gameId: string) => void
  getGameById: (id: string) => GameType | undefined
  getGamesByCategory: (category: string) => GameType[]
}

const gamesList: GameType[] = [
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    icon: "grid",
    backgroundColor: "#FF5252",
    description: "Instead of using pen and paper just open the app and challenge your friend on the same device!",
    instructions: "Tap to place your mark. Get three in a row to win!",
    component: "TicTacToeGame",
    difficulty: 1,
    minPlayers: 1,
    maxPlayers: 2,
    category: "board",
  },
  {
    id: "air-hockey",
    name: "Air Hockey",
    icon: "disc",
    backgroundColor: "#2196F3",
    description: "Use your finger to move the paddle and score letting the puck entering in your friend's goal!",
    instructions: "Drag your paddle to hit the puck. Score by getting the puck in your opponent's goal!",
    component: "AirHockeyGame",
    difficulty: 2,
    minPlayers: 1,
    maxPlayers: 2,
    category: "sports",
  },
  {
    id: "ping-pong",
    name: "Ping Pong",
    icon: "table-tennis",
    backgroundColor: "#FFC107",
    description: "Move the racket with your finger and challenge your friends!",
    instructions: "Swipe to move your paddle. Don't let the ball pass you!",
    component: "PingPongGame",
    difficulty: 2,
    minPlayers: 1,
    maxPlayers: 2,
    category: "sports",
  },
  {
    id: "spinner-war",
    name: "Spinner War",
    icon: "refresh-circle",
    backgroundColor: "#607D8B",
    description: "Push your opponent outside the stage! Two players on a small area are too much!",
    instructions: "Tap and hold to spin. Push your opponent off the platform to win!",
    component: "SpinnerWarGame",
    difficulty: 3,
    minPlayers: 1,
    maxPlayers: 2,
    category: "action",
  },
  {
    id: "connect-four",
    name: "Connect Four",
    icon: "apps",
    backgroundColor: "#E91E63",
    description: "Drop discs to connect four of your color in a row!",
    instructions: "Tap a column to drop your disc. Connect four discs vertically, horizontally, or diagonally to win!",
    component: "ConnectFourGame",
    difficulty: 2,
    minPlayers: 1,
    maxPlayers: 2,
    category: "board",
    isNew: true,
  },
  {
    id: "dots-and-boxes",
    name: "Dots & Boxes",
    icon: "square",
    backgroundColor: "#3F51B5",
    description: "Take turns drawing lines to complete boxes!",
    instructions: "Tap between dots to draw a line. Complete a box to earn a point and go again!",
    component: "DotsAndBoxesGame",
    difficulty: 2,
    minPlayers: 1,
    maxPlayers: 2,
    category: "board",
  },
  {
    id: "chess",
    name: "Chess",
    icon: "options",
    backgroundColor: "#009688",
    description: "The classic strategy game of kings and queens!",
    instructions: "Tap to select a piece, then tap to move. Checkmate your opponent's king to win!",
    component: "ChessGame",
    difficulty: 4,
    minPlayers: 1,
    maxPlayers: 2,
    category: "board",
    isPremium: true,
  },
  {
    id: "mini-golf",
    name: "Mini Golf",
    icon: "golf",
    backgroundColor: "#8BC34A",
    description: "Take turns putting the ball into the hole with as few strokes as possible!",
    instructions: "Drag to aim and set power. Get the ball in the hole with fewer strokes than your opponent!",
    component: "MiniGolfGame",
    difficulty: 3,
    minPlayers: 1,
    maxPlayers: 4,
    category: "sports",
    isPremium: true,
  },
]

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games] = useState<GameType[]>(gamesList)
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  // Load saved data
  useEffect(() => {
    const loadData = async () => {
      try {
        const recentlyPlayedData = await AsyncStorage.getItem("recentlyPlayed")
        if (recentlyPlayedData) {
          setRecentlyPlayed(JSON.parse(recentlyPlayedData))
        }

        const favoritesData = await AsyncStorage.getItem("favorites")
        if (favoritesData) {
          setFavorites(JSON.parse(favoritesData))
        }
      } catch (error) {
        console.error("Error loading game data:", error)
      }
    }

    loadData()
  }, [])

  const addToRecentlyPlayed = async (gameId: string) => {
    try {
      const newRecentlyPlayed = [gameId, ...recentlyPlayed.filter((id) => id !== gameId)].slice(0, 5) // Keep only the 5 most recent

      setRecentlyPlayed(newRecentlyPlayed)
      await AsyncStorage.setItem("recentlyPlayed", JSON.stringify(newRecentlyPlayed))
    } catch (error) {
      console.error("Error saving recently played:", error)
    }
  }

  const toggleFavorite = async (gameId: string) => {
    try {
      let newFavorites: string[]

      if (favorites.includes(gameId)) {
        newFavorites = favorites.filter((id) => id !== gameId)
      } else {
        newFavorites = [...favorites, gameId]
      }

      setFavorites(newFavorites)
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites))
    } catch (error) {
      console.error("Error saving favorites:", error)
    }
  }

  const getGameById = (id: string) => {
    return games.find((game) => game.id === id)
  }

  const getGamesByCategory = (category: string) => {
    return games.filter((game) => game.category === category)
  }

  return (
    <GameContext.Provider
      value={{
        games,
        recentlyPlayed,
        favorites,
        addToRecentlyPlayed,
        toggleFavorite,
        getGameById,
        getGamesByCategory,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
