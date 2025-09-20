"use client"

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { GameCatalogEntry } from "../core/gameCatalog"
import type { GameAvailability, SupportedMode } from "../core/gameCatalog"
import { gameManifest } from "../games/manifest"

export type { GameCatalogEntry, GameAvailability, SupportedMode } from "../core/gameCatalog"

type GameContextValue = {
  games: GameCatalogEntry[]
  recentlyPlayed: string[]
  favorites: string[]
  addToRecentlyPlayed: (gameId: string) => Promise<void>
  toggleFavorite: (gameId: string) => Promise<void>
  getGameById: (id: string) => GameCatalogEntry | undefined
  getGamesByCategory: (category: string) => GameCatalogEntry[]
}

const gamesFromManifest = gameManifest

const GameContext = createContext<GameContextValue | undefined>(undefined)

const RECENTLY_PLAYED_KEY = "recentlyPlayed"
const FAVORITES_KEY = "favorites"

export type GameProviderProps = {
  children: React.ReactNode
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [games] = useState<GameCatalogEntry[]>(gamesFromManifest)
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const loadPersistedState = async () => {
      try {
        const [recentValue, favoriteValue] = await Promise.all([
          AsyncStorage.getItem(RECENTLY_PLAYED_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
        ])

        if (!isMounted) {
          return
        }

        if (recentValue) {
          setRecentlyPlayed(JSON.parse(recentValue))
        }

        if (favoriteValue) {
          setFavorites(JSON.parse(favoriteValue))
        }
      } catch (error) {
        console.warn("Game context state could not be loaded", error)
      }
    }

    loadPersistedState()

    return () => {
      isMounted = false
    }
  }, [])

  const addToRecentlyPlayed = useCallback(
    async (gameId: string) => {
      const updated = [gameId, ...recentlyPlayed.filter((id) => id !== gameId)].slice(0, 5)
      setRecentlyPlayed(updated)
      try {
        await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn("Recently played list could not be persisted", error)
      }
    },
    [recentlyPlayed],
  )

  const toggleFavorite = useCallback(
    async (gameId: string) => {
      const updated = favorites.includes(gameId)
        ? favorites.filter((id) => id !== gameId)
        : [...favorites, gameId]

      setFavorites(updated)

      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      } catch (error) {
        console.warn("Favorites could not be persisted", error)
      }
    },
    [favorites],
  )

  const getGameById = useCallback((id: string) => games.find((game) => game.id === id), [games])

  const getGamesByCategory = useCallback(
    (category: string) => games.filter((game) => game.category === category),
    [games],
  )

  const value = useMemo(
    () => ({
      games,
      recentlyPlayed,
      favorites,
      addToRecentlyPlayed,
      toggleFavorite,
      getGameById,
      getGamesByCategory,
    }),
    [
      games,
      recentlyPlayed,
      favorites,
      addToRecentlyPlayed,
      toggleFavorite,
      getGameById,
      getGamesByCategory,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

export default GameContext
