"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Audio } from "expo-av"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AssetLoader } from "../utils/AssetLoader"
import { soundManifest } from "../core/assets"

export type SoundPlaybackKey =
  | "background-music"
  | "button-press"
  | "game-start"
  | "win"
  | "draw"
  | "cell-tap"
  | "invalid-move"
  | "toggle"
  | "wall-hit"
  | "paddle-hit"
  | "score"
  | "collision"
  | "round-start"
  | "eat-food"

type PlayableSound = SoundPlaybackKey | ReturnType<typeof require>

type SoundContextValue = {
  isSoundEnabled: boolean
  isMusicEnabled: boolean
  toggleSound: () => Promise<void>
  toggleMusic: () => Promise<void>
  playSound: (sound: PlayableSound) => Promise<void>
  playMusic: () => Promise<void>
  stopMusic: () => Promise<void>
}

const SoundContext = createContext<SoundContextValue | undefined>(undefined)

export type SoundProviderProps = {
  children: ReactNode
}

export const SoundProvider = ({ children }: SoundProviderProps) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const backgroundMusicRef = useRef<Audio.Sound | null>(null)
  const assetLoader = useMemo(() => AssetLoader.getInstance(), [])

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [soundPref, musicPref] = await Promise.all([
          AsyncStorage.getItem("soundEnabled"),
          AsyncStorage.getItem("musicEnabled"),
        ])

        if (soundPref !== null) {
          setIsSoundEnabled(soundPref === "true")
        }

        if (musicPref !== null) {
          setIsMusicEnabled(musicPref === "true")
        }
      } catch (error) {
        console.warn("Sound preferences could not be loaded", error)
      }
    }

    loadPreferences()
  }, [])

  useEffect(() => {
    let isMounted = true

    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        })

        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/background-music.mp3"),
        )
        await sound.setIsLoopingAsync(true)

        if (!isMounted) {
          await sound.unloadAsync()
          return
        }

        backgroundMusicRef.current = sound

        if (isMusicEnabled) {
          await sound.playAsync()
        }
      } catch (error) {
        console.warn("Background music could not be initialised", error)
      }
    }

    initAudio()

    return () => {
      isMounted = false
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.unloadAsync().catch(() => undefined)
        backgroundMusicRef.current = null
      }
    }
  }, [isMusicEnabled])

  const persistPreference = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString())
    } catch (error) {
      console.warn(`Preference ${key} could not be saved`, error)
    }
  }

  const toggleSound = async () => {
    const nextValue = !isSoundEnabled
    setIsSoundEnabled(nextValue)
    await persistPreference("soundEnabled", nextValue)
  }

  const toggleMusic = async () => {
    const nextValue = !isMusicEnabled
    setIsMusicEnabled(nextValue)

    const music = backgroundMusicRef.current
    if (!music) {
      await persistPreference("musicEnabled", nextValue)
      return
    }

    try {
      if (nextValue) {
        await music.playAsync()
      } else {
        await music.pauseAsync()
      }
    } catch (error) {
      console.warn("Unable to toggle music playback", error)
    }

    await persistPreference("musicEnabled", nextValue)
  }

  const playSound = async (sound: PlayableSound) => {
    if (!isSoundEnabled) return

    try {
      if (typeof sound === "string") {
        await assetLoader.playSound(sound as SoundPlaybackKey)
        return
      }

      const { sound: isolatedSound } = await Audio.Sound.createAsync(sound)
      await isolatedSound.playAsync()
      isolatedSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          isolatedSound.unloadAsync().catch(() => undefined)
        }
      })
    } catch (error) {
      console.warn("Sound effect could not be played", error)
    }
  }

  const playMusic = async () => {
    if (!isMusicEnabled) return
    const music = backgroundMusicRef.current
    if (!music) return

    try {
      await music.setPositionAsync(0)
      await music.playAsync()
    } catch (error) {
      console.warn("Background music could not be played", error)
    }
  }

  const stopMusic = async () => {
    const music = backgroundMusicRef.current
    if (!music) return

    try {
      await music.pauseAsync()
    } catch (error) {
      console.warn("Background music could not be paused", error)
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
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}

export default SoundContext
