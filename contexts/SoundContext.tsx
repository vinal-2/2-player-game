"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Audio } from "expo-av"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AssetLoader } from "../utils/AssetLoader"

type SoundContextType = {
  isSoundEnabled: boolean
  isMusicEnabled: boolean
  toggleSound: () => void
  toggleMusic: () => void
  playSound: (sound: any) => Promise<void>
  playMusic: () => Promise<void>
  stopMusic: () => Promise<void>
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export const SoundProvider = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(null)

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const soundPref = await AsyncStorage.getItem("soundEnabled")
        const musicPref = await AsyncStorage.getItem("musicEnabled")

        if (soundPref !== null) {
          setIsSoundEnabled(soundPref === "true")
        }

        if (musicPref !== null) {
          setIsMusicEnabled(musicPref === "true")
        }
      } catch (error) {
        console.error("Error loading sound preferences:", error)
      }
    }

    loadPreferences()
  }, [])

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        })

        const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/background-music.mp3"))
        await sound.setIsLoopingAsync(true)
        setBackgroundMusic(sound)

        if (isMusicEnabled) {
          await sound.playAsync()
        }
      } catch (error) {
        console.error("Error initializing audio:", error)
      }
    }

    initAudio()

    return () => {
      if (backgroundMusic) {
        backgroundMusic.unloadAsync()
      }
    }
  }, [])

  // Toggle sound
  const toggleSound = async () => {
    const newValue = !isSoundEnabled
    setIsSoundEnabled(newValue)
    try {
      await AsyncStorage.setItem("soundEnabled", newValue.toString())
    } catch (error) {
      console.error("Error saving sound preference:", error)
    }
  }

  // Toggle music
  const toggleMusic = async () => {
    const newValue = !isMusicEnabled
    setIsMusicEnabled(newValue)

    if (backgroundMusic) {
      if (newValue) {
        await backgroundMusic.playAsync()
      } else {
        await backgroundMusic.pauseAsync()
      }
    }

    try {
      await AsyncStorage.setItem("musicEnabled", newValue.toString())
    } catch (error) {
      console.error("Error saving music preference:", error)
    }
  }

  // Play sound
  const playSound = async (sound: any) => {
    if (!isSoundEnabled) return

    try {
      const assetLoader = AssetLoader.getInstance()

      if (typeof sound === "string") {
        // Play preloaded sound by key
        await assetLoader.playSound(sound)
      } else {
        // Play sound from require
        const { sound: soundObject } = await Audio.Sound.createAsync(sound)
        await soundObject.playAsync()

        // Unload when finished
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            soundObject.unloadAsync()
          }
        })
      }
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  // Play music
  const playMusic = async () => {
    if (isMusicEnabled && backgroundMusic) {
      try {
        await backgroundMusic.setPositionAsync(0)
        await backgroundMusic.playAsync()
      } catch (error) {
        console.error("Error playing background music:", error)
      }
    }
  }

  // Stop music
  const stopMusic = async () => {
    if (backgroundMusic) {
      try {
        await backgroundMusic.pauseAsync()
      } catch (error) {
        console.error("Error stopping background music:", error)
      }
    }
  }

  return (
    <SoundContext.Provider
      value={{
        isSoundEnabled,
        isMusicEnabled,
        toggleSound,
        toggleMusic,
        playSound,
        playMusic,
        stopMusic,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export const useSound = () => {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
