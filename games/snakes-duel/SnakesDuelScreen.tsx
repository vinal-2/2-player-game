"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { SafeAreaView, ImageBackground, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { GameEngine } from "../../core/GameEngine"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

import { SnakesDuelModel } from "./SnakesDuelModel"
import { SnakesDuelController } from "./SnakesDuelController"
import SnakesDuelView from "./SnakesDuelView"

const GRID_WIDTH = 22
const GRID_HEIGHT = 22

const MODE_STORAGE_KEY = "snakes-duel-mode"
const SKIN_STORAGE_KEY = "snakes-duel-skins"

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
  const [viewVersion, setViewVersion] = useState(0)
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
    controller.setMode(currentMode)
  }, [controller, currentMode])

  useEffect(() => {
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

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SnakesDuelView
          ref={viewRef}
          state={model.state}
          mode={currentMode}
          selectedSkins={selectedSkins}
          onSelectSkin={handleSelectSkin}
          onBack={onExit}
          onReset={handleReset}
          onToggleMode={handleToggleMode}
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

export default SnakesDuelScreen
