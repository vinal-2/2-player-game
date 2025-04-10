"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

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
  getSeasonalGameBackground: (gameId: string) => string | null
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

// Game-specific seasonal backgrounds
const seasonalGameBackgrounds = {
  spring: {
    "tic-tac-toe": "spring-tic-tac-toe-bg.png",
    "ping-pong": "spring-ping-pong-bg.png",
    // Add more game backgrounds as needed
  },
  summer: {
    "tic-tac-toe": "summer-tic-tac-toe-bg.png",
    "ping-pong": "summer-ping-pong-bg.png",
    // Add more game backgrounds as needed
  },
  autumn: {
    "tic-tac-toe": "autumn-tic-tac-toe-bg.png",
    "ping-pong": "autumn-ping-pong-bg.png",
    // Add more game backgrounds as needed
  },
  winter: {
    "tic-tac-toe": "winter-tic-tac-toe-bg.png",
    "ping-pong": "winter-ping-pong-bg.png",
    // Add more game backgrounds as needed
  },
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
  // State for current season and active event
  const [currentSeason, setCurrentSeason] = useState<Season>("none")
  const [activeEvent, setActiveEvent] = useState<SpecialEvent | null>(null)
  const [isSeasonalThemeEnabled, setIsSeasonalThemeEnabled] = useState(true)

  // Determine current season and check for active events on mount
  useEffect(() => {
    const determineCurrentSeason = () => {
      const now = new Date()
      const month = now.getMonth()

      // Determine season based on month (Northern Hemisphere)
      if (month >= 2 && month <= 4) {
        return "spring" // March to May
      } else if (month >= 5 && month <= 7) {
        return "summer" // June to August
      } else if (month >= 8 && month <= 10) {
        return "autumn" // September to November
      } else {
        return "winter" // December to February
      }
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

    // Set up a daily check for season changes and events
    const dailyCheck = setInterval(() => {
      setCurrentSeason(determineCurrentSeason())
      setActiveEvent(checkForActiveEvents())
    }, 86400000) // 24 hours in milliseconds

    return () => clearInterval(dailyCheck)
  }, [])

  // Toggle seasonal theme preference
  const toggleSeasonalTheme = async () => {
    const newValue = !isSeasonalThemeEnabled
    setIsSeasonalThemeEnabled(newValue)

    try {
      await AsyncStorage.setItem("seasonalThemeEnabled", newValue.toString())
    } catch (error) {
      console.error("Error saving seasonal theme preference:", error)
    }
  }

  // Get seasonal background for a specific game
  const getSeasonalGameBackground = (gameId: string): string | null => {
    if (!isSeasonalThemeEnabled) return null

    // If there's an active event, prioritize event-specific backgrounds
    if (activeEvent) {
      // This would require additional event-specific background mapping
      // For now, we'll just return null to use the default background
      return null
    }

    // Otherwise use season-specific backgrounds
    const seasonBackgrounds = seasonalGameBackgrounds[currentSeason]
    return seasonBackgrounds && seasonBackgrounds[gameId] ? seasonBackgrounds[gameId] : null
  }

  // Determine which theme to use (event theme takes priority over seasonal theme)
  const theme =
    activeEvent && isSeasonalThemeEnabled
      ? {
          primaryColor: activeEvent.themeColor,
          secondaryColor: activeEvent.themeColor,
          backgroundColor: "#FFFFFF",
          accentColor: "#FFC107",
        }
      : seasonalThemes[isSeasonalThemeEnabled ? currentSeason : "none"]

  // Context value
  const value = {
    currentSeason,
    specialEvents,
    activeEvent,
    seasonalTheme: theme,
    isSeasonalThemeEnabled,
    toggleSeasonalTheme,
    getSeasonalGameBackground,
  }

  return <SeasonalContext.Provider value={value}>{children}</SeasonalContext.Provider>
}

/**
 * Custom hook to use the SeasonalContext
 *
 * This hook provides access to the seasonal context data and functions.
 * It throws an error if used outside of a SeasonalProvider.
 */
export const useSeasonal = () => {
  const context = useContext(SeasonalContext)
  if (context === undefined) {
    throw new Error("useSeasonal must be used within a SeasonalProvider")
  }
  return context
}
