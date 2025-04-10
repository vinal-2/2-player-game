"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { AnalyticsManager } from "../utils/AnalyticsManager"

type AnalyticsContextType = {
  trackEvent: (name: string, params?: Record<string, any>) => void
  setUserId: (userId: string | null) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const analyticsManager = AnalyticsManager.getInstance()

  useEffect(() => {
    // Track app start
    analyticsManager.trackEvent("app_start")

    return () => {
      // Track app close and clean up
      analyticsManager.trackEvent("app_close")
      analyticsManager.cleanup()
    }
  }, [])

  const trackEvent = (name: string, params?: Record<string, any>) => {
    analyticsManager.trackEvent(name, params)
  }

  const setUserId = (userId: string | null) => {
    analyticsManager.setUserId(userId)
  }

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        setUserId,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
