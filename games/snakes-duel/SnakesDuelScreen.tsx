"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { SafeAreaView, ImageBackground, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"

import { GameEngine } from "../../core/GameEngine"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

import { SnakesDuelModel, type SnakesDuelEvent } from "./SnakesDuelModel"
import { SnakesDuelController } from "./SnakesDuelController"
import SnakesDuelView from "./SnakesDuelView"

const GRID_WIDTH = 22
const GRID_HEIGHT = 22

const MODE_STORAGE_KEY = "snakes-duel-mode"
const SKIN_STORAGE_KEY = "snakes-duel-skins"
const DIFFICULTY_STORAGE_KEY = "snakes-duel-difficulty"

const SnakesDuelScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { getSeasonalGameBackground } = useSeasonal()
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()

  const [model] = useState(() => new SnakesDuelModel(GRID_WIDTH, GRID_HEIGHT))
  const [controller] = useState(() => new SnakesDuelController(model, mode))
  const [currentMode, setCurrentMode] = useState<"friend" | "bot">(mode === "bot" ? "bot" : "friend")
  const [selectedSkins, setSelectedSkins] = useState<Record<"player1" | "player2", string>>({
    player1: "classic-neon",
    player2: "sunset-blaze",
  })
  const [difficulty, setDifficulty] = useState<"rookie" | "pro" | "legend">("pro")
  const [viewVersion, setViewVersion] = useState(0)
  const [appleSplashes, setAppleSplashes] = useState<Array<{ id: string; x: number; y: number }>>([])
  const splashTimers = useRef<Record<string, NodeJS.Timeout>>({})
  const backgroundImage = getSeasonalGameBackground(gameId) || require("../../assets/images/spinner-war-bg.png")
  const gameEngine = GameEngine.getInstance()
  const viewRef = useRef<View | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(MODE_STORAGE_KEY)
      .then((stored) => {
        if (stored === "bot" || stored === "friend") {
          setCurrentMode(stored)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    AsyncStorage.getItem(SKIN_STORAGE_KEY)
      .then((stored) => {
        if (!stored) {
          applySkinsToModel(model, selectedSkins)
          return
        }
        const parsed = JSON.parse(stored) as Record<string, string>
        const next = {
          player1: parsed.player1 || "classic-neon",
          player2: parsed.player2 || "sunset-blaze",
        } as Record<"player1" | "player2", string>
        setSelectedSkins(next)
        applySkinsToModel(model, next)
        setViewVersion((v) => v + 1)
      })
      .catch(() => {
        applySkinsToModel(model, selectedSkins)
      })
  }, [model])

  useEffect(() => {
    AsyncStorage.getItem(DIFFICULTY_STORAGE_KEY)
      .then((stored) => {
        if (stored === "rookie" || stored === "pro" || stored === "legend") {
          setDifficulty(stored)
          controller.setDifficulty(stored)
        }
      })
      .catch(() => undefined)
  }, [controller])

  useEffect(
    () => () => {
      Object.values(splashTimers.current).forEach((timer) => clearTimeout(timer))
      splashTimers.current = {}
    },
    [],
  )

  useEffect(() => {
    controller.setMode(currentMode)
  }, [controller, currentMode])

  useEffect(() => {
    controller.setDifficulty(difficulty)
  }, [controller, difficulty])

  useEffect(() => {
    controller.setEventEmitter((event) => {
      trackEvent("snakes_ai_replan", { game: gameId, difficulty: event.difficulty, reason: event.reason })
      if (event.reason === "fallback") {
        trackEvent("snakes_ai_escape", { game: gameId, difficulty: event.difficulty })
      }
      onEvent?.({ type: "custom", payload: { action: "ai_replan", ...event } })
    })
    model.setEventEmitter(handleModelEvent)
    gameEngine.registerGame(gameId, model, controller)
    model.initialize()
    controller.initialize()
    gameEngine.startGame(gameId)
    playSound("game-start")
    trackEvent("game_start", { game: gameId, mode: currentMode })

    return () => {
      gameEngine.stopGame(gameId)
      gameEngine.unregisterGame(gameId)
      controller.cleanup()
    }
  }, [controller, gameEngine, gameId, model, currentMode, playSound, trackEvent])

  const handleModelEvent = (event: SnakesDuelEvent) => {
    switch (event.type) {
      case "apple_eaten":
        triggerHaptic("light")
        trackEvent("snakes_apple_eaten", {
          game: gameId,
          player: event.playerId,
          length: event.length,
          tickRate: event.tickRate,
        })
        addAppleSplash(event.position)
        onEvent?.({ type: "custom", payload: { action: "apple", ...event } })
        break
      case "collision":
        triggerHaptic("heavy")
        trackEvent("snakes_collision", {
          game: gameId,
          player: event.playerId,
          reason: event.reason,
        })
        onEvent?.({ type: "custom", payload: { action: "collision", ...event } })
        break
      case "round_end":
        triggerHaptic("medium")
        trackEvent("snakes_round_end", { game: gameId, winner: event.winner, ticks: event.ticks })
        onEvent?.({ type: "custom", payload: { action: "round_end", ...event } })
        break
    }
  }

  const handleToggleMode = () => {
    const nextMode = currentMode === "bot" ? "friend" : "bot"
    setCurrentMode(nextMode)
    AsyncStorage.setItem(MODE_STORAGE_KEY, nextMode).catch(() => undefined)
    onEvent?.({ type: "custom", payload: { action: "mode_toggle", mode: nextMode } })
  }

  const handleReset = () => {
    model.reset()
    applySkinsToModel(model, selectedSkins)
    onEvent?.({ type: "custom", payload: { action: "reset" } })
    trackEvent("snakes_placeholder_reset", { game: gameId })
    setViewVersion((v) => v + 1)
  }

  const handleRematch = () => {
    model.startRematchCountdown()
    onEvent?.({ type: "custom", payload: { action: "rematch" } })
    trackEvent("snakes_rematch", { game: gameId })
    setViewVersion((v) => v + 1)
  }

  const handleSelectSkin = (playerId: "player1" | "player2", skinId: string) => {
    setSelectedSkins((prev) => {
      if (prev[playerId] === skinId) return prev
      const next = { ...prev, [playerId]: skinId }
      applySkinsToModel(model, next)
      AsyncStorage.setItem(SKIN_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined)
      onEvent?.({ type: "custom", payload: { action: "skin_select", player: playerId, skin: skinId } })
      setViewVersion((v) => v + 1)
      return next
    })
  }

  const handleSelectDifficulty = (level: "rookie" | "pro" | "legend") => {
    setDifficulty(level)
    AsyncStorage.setItem(DIFFICULTY_STORAGE_KEY, level).catch(() => undefined)
    trackEvent("snakes_difficulty", { game: gameId, level })
    onEvent?.({ type: "custom", payload: { action: "difficulty", level } })
  }

  const addAppleSplash = (position: { x: number; y: number }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setAppleSplashes((prev) => [...prev, { id, ...position }])
    const timeout = setTimeout(() => {
      setAppleSplashes((prev) => prev.filter((splash) => splash.id !== id))
      delete splashTimers.current[id]
    }, 550)
    splashTimers.current[id] = timeout
  }

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SnakesDuelView
          ref={viewRef}
          state={model.state}
          mode={currentMode}
          selectedSkins={selectedSkins}
          selectedDifficulty={difficulty}
          appleSplashes={appleSplashes}
          onSelectDifficulty={handleSelectDifficulty}
          onSelectSkin={handleSelectSkin}
          onBack={onExit}
          onReset={handleReset}
          onToggleMode={handleToggleMode}
          onRematch={handleRematch}
          key={`snakes-view-${viewVersion}`}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

const applySkinsToModel = (
  model: SnakesDuelModel,
  skins: Record<"player1" | "player2", string>,
) => {
  model.state.snakes.forEach((snake) => {
    if (snake.id === "player1" || snake.id === "player2") {
      snake.skin = skins[snake.id]
    }
  })
}

const triggerHaptic = async (style: "light" | "medium" | "heavy") => {
  try {
    switch (style) {
      case "light":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
    }
  } catch {
    // ignore haptics failures
  }
}

export default SnakesDuelScreen


