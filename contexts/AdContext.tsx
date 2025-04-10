"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Alert, AppState } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAnalytics } from "./AnalyticsContext"

type AdContextType = {
  isPremium: boolean
  showAd: () => Promise<void>
  setPremium: (value: boolean) => Promise<void>
  lastAdTime: number | null
  adModalVisible: boolean
  closeAdModal: () => void
  timeUntilNextAd: number
}

const AdContext = createContext<AdContextType | undefined>(undefined)

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackEvent } = useAnalytics()
  const [isPremium, setIsPremium] = useState(false)
  const [lastAdTime, setLastAdTime] = useState<number | null>(null)
  const [adModalVisible, setAdModalVisible] = useState(false)
  const [adTimer, setAdTimer] = useState(0)
  const [timeUntilNextAd, setTimeUntilNextAd] = useState(600) // 10 minutes in seconds
  const [appState, setAppState] = useState(AppState.currentState)
  const [gameStartTime, setGameStartTime] = useState<number | null>(null)

  // Load premium status
  useEffect(() => {
    const loadPremiumStatus = async () => {
      try {
        const status = await AsyncStorage.getItem("premiumStatus")
        if (status !== null) {
          setIsPremium(status === "true")
        }

        const lastAd = await AsyncStorage.getItem("lastAdTime")
        if (lastAd !== null) {
          setLastAdTime(Number.parseInt(lastAd, 10))
        }
      } catch (error) {
        console.error("Error loading premium status:", error)
      }
    }

    loadPremiumStatus()

    // Start tracking game time
    setGameStartTime(Date.now())

    // App state listener for background/foreground transitions
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground
        setGameStartTime(Date.now())
      }
      setAppState(nextAppState)
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Check if it's time to show an ad
  useEffect(() => {
    if (isPremium || !gameStartTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const gameTimeInSeconds = (now - gameStartTime) / 1000

      // Calculate time until next ad
      const timeSinceLastAd = lastAdTime ? (now - lastAdTime) / 1000 : 600
      const remainingTime = Math.max(0, 600 - timeSinceLastAd)
      setTimeUntilNextAd(Math.floor(remainingTime))

      // Show ad after 10 minutes of gameplay if no ad shown recently
      if (gameTimeInSeconds > 600 && (!lastAdTime || now - lastAdTime > 600000)) {
        showAd()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPremium, gameStartTime, lastAdTime])

  // Ad timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (adModalVisible) {
      setAdTimer(30) // 30 seconds ad duration

      timer = setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [adModalVisible])

  const setPremium = async (value: boolean) => {
    setIsPremium(value)
    trackEvent("premium_status_change", { isPremium: value })

    try {
      await AsyncStorage.setItem("premiumStatus", value.toString())
    } catch (error) {
      console.error("Error saving premium status:", error)
    }
  }

  const showAd = async () => {
    if (isPremium) return

    setAdModalVisible(true)
    setLastAdTime(Date.now())
    setGameStartTime(Date.now()) // Reset game time counter
    trackEvent("ad_shown", { type: "interstitial" })

    try {
      await AsyncStorage.setItem("lastAdTime", Date.now().toString())
    } catch (error) {
      console.error("Error saving last ad time:", error)
    }
  }

  const closeAdModal = () => {
    if (adTimer === 0) {
      setAdModalVisible(false)
      trackEvent("ad_closed")
    } else {
      Alert.alert("Ad in progress", "Please wait until the ad finishes.")
    }
  }

  return (
    <AdContext.Provider
      value={{
        isPremium,
        showAd,
        setPremium,
        lastAdTime,
        adModalVisible,
        closeAdModal,
        timeUntilNextAd,
      }}
    >
      {children}
    </AdContext.Provider>
  )
}

export const useAd = () => {
  const context = useContext(AdContext)
  if (context === undefined) {
    throw new Error("useAd must be used within an AdProvider")
  }
  return context
}
