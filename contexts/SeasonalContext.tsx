"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { particleManifest } from "../core/assets"

// Define the seasons we'll support
export type Season = "spring" | "summer" | "autumn" | "winter" | "none"

// Define special events that can occur during the year
export type SpecialEvent = {
  id: string
  name: string
  startDate: Date
  endDate: Date
  themeColor: string
  icon: string
  description: string
}

// Define the shape of our context data
export type SnakesDuelTextures = {
  head: number
  body: number
  turn: number
  tail: number
  grid: number
  apple: number
}

export type SnakesDuelSeasonalTheme = {
  textures: SnakesDuelTextures
  particle: keyof typeof particleManifest
  palette: {
    fill: string
    glow: string
  }
}

export type HomeSeasonalAssets = {
  hero: number
  banner: number
}

type SeasonalContextType = {
  currentSeason: Season
  specialEvents: SpecialEvent[]
  activeEvent: SpecialEvent | null
  seasonalTheme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    accentColor: string
  }
  isSeasonalThemeEnabled: boolean
  toggleSeasonalTheme: () => void
  getSeasonalGameBackground: (gameId: string) => number | null
  getSnakesDuelTheme: () => SnakesDuelSeasonalTheme
  getHomeArtwork: () => HomeSeasonalAssets
}

// Create the context with a default undefined value
const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined)

// Special events data
const specialEvents: SpecialEvent[] = [
  {
    id: "halloween",
    name: "Halloween",
    startDate: new Date(new Date().getFullYear(), 9, 15), // October 15
    endDate: new Date(new Date().getFullYear(), 10, 5), // November 5
    themeColor: "#FF6B00",
    icon: "skull",
    description: "Spooky games and challenges!",
  },
  {
    id: "christmas",
    name: "Christmas",
    startDate: new Date(new Date().getFullYear(), 11, 1), // December 1
    endDate: new Date(new Date().getFullYear(), 11, 31), // December 31
    themeColor: "#E53935",
    icon: "snow",
    description: "Festive winter games!",
  },
  {
    id: "easter",
    name: "Easter",
    // Easter date changes each year, this is approximate
    startDate: new Date(new Date().getFullYear(), 2, 15), // March 15
    endDate: new Date(new Date().getFullYear(), 3, 15), // April 15
    themeColor: "#8E24AA",
    icon: "egg",
    description: "Egg-citing games and surprises!",
  },
  {
    id: "summer-vacation",
    name: "Summer Vacation",
    startDate: new Date(new Date().getFullYear(), 5, 15), // June 15
    endDate: new Date(new Date().getFullYear(), 7, 31), // August 31
    themeColor: "#039BE5",
    icon: "sunny",
    description: "Summer fun for everyone!",
  },
]

// Seasonal theme colors
const seasonalThemes = {
  spring: {
    primaryColor: "#4CAF50",
    secondaryColor: "#8BC34A",
    backgroundColor: "#E8F5E9",
    accentColor: "#FF9800",
  },
  summer: {
    primaryColor: "#03A9F4",
    secondaryColor: "#00BCD4",
    backgroundColor: "#E1F5FE",
    accentColor: "#FF5722",
  },
  autumn: {
    primaryColor: "#FF9800",
    secondaryColor: "#F57C00",
    backgroundColor: "#FFF3E0",
    accentColor: "#795548",
  },
  winter: {
    primaryColor: "#3F51B5",
    secondaryColor: "#5C6BC0",
    backgroundColor: "#E8EAF6",
    accentColor: "#E91E63",
  },
  none: {
    primaryColor: "#2196F3",
    secondaryColor: "#1976D2",
    backgroundColor: "#E3F2FD",
    accentColor: "#FFC107",
  },
}

// Game-specific seasonal backgrounds (module references)
const seasonalGameBackgrounds: Record<Season, Record<string, number>> = {
  spring: {
    "tic-tac-toe": require("../assets/images/tic-tac-toe-bg.png"),
    "ping-pong": require("../assets/images/ping-pong/table-spring.png"),
    "spinner-war": require("../assets/images/spinner-war/arena-1.png"),
    "air-hockey": require("../assets/images/air-hockey/arena.png"),
    "snakes-duel": require("../assets/images/snakes-duel/grid-spring.png"),
  },
  summer: {
    "tic-tac-toe": require("../assets/images/tic-tac-toe-bg.png"),
    "ping-pong": require("../assets/images/ping-pong/table-summer.png"),
    "spinner-war": require("../assets/images/spinner-war/arena-2.png"),
    "air-hockey": require("../assets/images/air-hockey/arena.png"),
    "snakes-duel": require("../assets/images/snakes-duel/grid-summer.png"),
  },
  autumn: {
    "tic-tac-toe": require("../assets/images/tic-tac-toe-bg.png"),
    "ping-pong": require("../assets/images/ping-pong/table-autumn.png"),
    "spinner-war": require("../assets/images/spinner-war/arena-3.png"),
    "air-hockey": require("../assets/images/air-hockey/arena.png"),
    "snakes-duel": require("../assets/images/snakes-duel/grid-autumn.png"),
  },
  winter: {
    "tic-tac-toe": require("../assets/images/tic-tac-toe-bg.png"),
    "ping-pong": require("../assets/images/ping-pong/table-winter.png"),
    "spinner-war": require("../assets/images/spinner-war/arena-1.png"),
    "air-hockey": require("../assets/images/air-hockey/arena.png"),
    "snakes-duel": require("../assets/images/snakes-duel/grid-winter.png"),
  },
  none: {
    "snakes-duel": require("../assets/images/snakes-duel/grid-winter.png"),
  },
}

const homeSeasonalAssets: Record<Exclude<Season, "none">, HomeSeasonalAssets> = {
  spring: {
    hero: require("../assets/images/home/hero-spring.png"),
    banner: require("../assets/images/seasonal/banner-spring.png"),
  },
  summer: {
    hero: require("../assets/images/home/hero-summer.png"),
    banner: require("../assets/images/seasonal/banner-summer.png"),
  },
  autumn: {
    hero: require("../assets/images/home/hero-autumn.png"),
    banner: require("../assets/images/seasonal/banner-autumn.png"),
  },
  winter: {
    hero: require("../assets/images/home/hero-winter.png"),
    banner: require("../assets/images/seasonal/banner-winter.png"),
  },
}

const homeAssetsBySeason: Record<Season, HomeSeasonalAssets> = {
  ...homeSeasonalAssets,
  none: homeSeasonalAssets.spring,
}

const snakeSeasonalThemesBase: Record<Exclude<Season, "none">, SnakesDuelSeasonalTheme> = {
  spring: {
    textures: {
      head: require("../assets/images/snakes-duel/spring-head.png"),
      body: require("../assets/images/snakes-duel/spring-body.png"),
      turn: require("../assets/images/snakes-duel/spring-turn.png"),
      tail: require("../assets/images/snakes-duel/spring-tail.png"),
      grid: require("../assets/images/snakes-duel/grid-spring.png"),
      apple: require("../assets/images/snakes-duel/apple-spring.png"),
    },
    particle: "snakes-spring",
    palette: {
      fill: "#22c55e",
      glow: "rgba(34,197,94,0.3)",
    },
  },
  summer: {
    textures: {
      head: require("../assets/images/snakes-duel/summer-head.png"),
      body: require("../assets/images/snakes-duel/summer-body.png"),
      turn: require("../assets/images/snakes-duel/summer-turn.png"),
      tail: require("../assets/images/snakes-duel/summer-tail.png"),
      grid: require("../assets/images/snakes-duel/grid-summer.png"),
      apple: require("../assets/images/snakes-duel/apple-summer.png"),
    },
    particle: "snakes-summer",
    palette: {
      fill: "#fde047",
      glow: "rgba(253,224,71,0.28)",
    },
  },
  autumn: {
    textures: {
      head: require("../assets/images/snakes-duel/autumn-head.png"),
      body: require("../assets/images/snakes-duel/autumn-body.png"),
      turn: require("../assets/images/snakes-duel/autumn-turn.png"),
      tail: require("../assets/images/snakes-duel/autumn-tail.png"),
      grid: require("../assets/images/snakes-duel/grid-autumn.png"),
      apple: require("../assets/images/snakes-duel/apple-autumn.png"),
    },
    particle: "snakes-autumn",
    palette: {
      fill: "#f97316",
      glow: "rgba(249,115,22,0.32)",
    },
  },
  winter: {
    textures: {
      head: require("../assets/images/snakes-duel/winter-head.png"),
      body: require("../assets/images/snakes-duel/winter-body.png"),
      turn: require("../assets/images/snakes-duel/winter-turn.png"),
      tail: require("../assets/images/snakes-duel/winter-tail.png"),
      grid: require("../assets/images/snakes-duel/grid-winter.png"),
      apple: require("../assets/images/snakes-duel/apple-winter.png"),
    },
    particle: "snakes-winter",
    palette: {
      fill: "#38bdf8",
      glow: "rgba(56,189,248,0.35)",
    },
  },
}

const snakeSeasonalThemes: Record<Season, SnakesDuelSeasonalTheme> = {
  ...snakeSeasonalThemesBase,
  none: snakeSeasonalThemesBase.spring,
}

/**
 * SeasonalProvider component
 *
 * This provider manages seasonal themes and special events for the app.
 * It determines the current season based on the date and checks for any
 * active special events. It also provides functions to get seasonal assets
 * and toggle seasonal theming.
 */
export const SeasonalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState<Season>("none")
  const [activeEvent, setActiveEvent] = useState<SpecialEvent | null>(null)
  const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(true)

  useEffect(() => {
    const determineCurrentSeason = () => {
      const now = new Date()
      const month = now.getMonth()
      if (month >= 2 && month <= 4) {
        return "spring"
      } else if (month >= 5 && month <= 7) {
        return "summer"
      } else if (month >= 8 && month <= 10) {
        return "autumn"
      }
      return "winter"
    }

    const checkForActiveEvents = () => {
      const now = new Date()
      return specialEvents.find((event) => now >= event.startDate && now <= event.endDate) || null
    }

    const loadSeasonalPreference = async () => {
      try {
        const value = await AsyncStorage.getItem("seasonalThemeEnabled")
        if (value !== null) {
          setIsSeasonalThemeEnabled(value === "true")
        }
      } catch (error) {
        console.error("Error loading seasonal theme preference:", error)
      }
    }

    setCurrentSeason(determineCurrentSeason())
    setActiveEvent(checkForActiveEvents())
    loadSeasonalPreference()

    const dailyCheck = setInterval(() => {
      setCurrentSeason(determineCurrentSeason())
      setActiveEvent(checkForActiveEvents())
    }, 86400000)

    return () => clearInterval(dailyCheck)
  }, [])

  const toggleSeasonalTheme = async () => {
    const newValue = !isSeasonalThemeEnabled
    setIsSeasonalThemeEnabled(newValue)

    try {
      await AsyncStorage.setItem("seasonalThemeEnabled", newValue.toString())
    } catch (error) {
      console.error("Error saving seasonal theme preference:", error)
    }
  }

  const getSeasonalGameBackground = (gameId: string): number | null => {
    if (!isSeasonalThemeEnabled) return null

    if (activeEvent) {
      return null
    }

    const seasonBackgrounds = seasonalGameBackgrounds[currentSeason]
    return seasonBackgrounds && seasonBackgrounds[gameId] ? seasonBackgrounds[gameId] : null
  }

  const getSnakesDuelTheme = useCallback((): SnakesDuelSeasonalTheme => {
    if (!isSeasonalThemeEnabled) {
      return snakeSeasonalThemes.none
    }

    if (activeEvent) {
      return snakeSeasonalThemes[currentSeason] ?? snakeSeasonalThemes.none
    }

    return snakeSeasonalThemes[currentSeason] ?? snakeSeasonalThemes.none
  }, [activeEvent, currentSeason, isSeasonalThemeEnabled])

  const getHomeArtwork = useCallback((): HomeSeasonalAssets => {
    if (!isSeasonalThemeEnabled) {
      return homeAssetsBySeason.none
    }

    if (activeEvent) {
      return homeAssetsBySeason[currentSeason] ?? homeAssetsBySeason.none
    }

    return homeAssetsBySeason[currentSeason] ?? homeAssetsBySeason.none
  }, [activeEvent, currentSeason, isSeasonalThemeEnabled])

  const theme =
    activeEvent && isSeasonalThemeEnabled
      ? {
          primaryColor: activeEvent.themeColor,
          secondaryColor: activeEvent.themeColor,
          backgroundColor: "#FFFFFF",
          accentColor: "#FFC107",
        }
      : seasonalThemes[isSeasonalThemeEnabled ? currentSeason : "none"]

  const value = {
    currentSeason,
    specialEvents,
    activeEvent,
    seasonalTheme: theme,
    isSeasonalThemeEnabled,
    toggleSeasonalTheme,
    getSeasonalGameBackground,
    getSnakesDuelTheme,
    getHomeArtwork,
  }

  return <SeasonalContext.Provider value={value}>{children}</SeasonalContext.Provider>
}

export const useSeasonal = () => {
  const context = useContext(SeasonalContext)
  if (context === undefined) {
    throw new Error("useSeasonal must be used within a SeasonalProvider")
  }
  return context
}
