tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { SpinnerWarView } from "./SpinnerWarView"
import { SpinnerWarModel } from "./SpinnerWarModel"
import { SpinnerWarController } from "./SpinnerWarController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const SpinnerWarScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const arenaRadius = 140
  const arenaCenterX = 180
  const arenaCenterY = 260
  const [model] = useState(() => new SpinnerWarModel(arenaRadius, arenaCenterX, arenaCenterY))
  const [controller] = useState(() => new SpinnerWarController(model))
  const viewRef = React.useRef<{ triggerImpact(): void } | null>(null)

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame(gameId, model, controller)

    model.setOnGameOver((winner) => {
      playSound("win")
      trackEvent("game_over", { game: gameId, winner })
      onEvent?.({ type: "game_over", payload: { winner } })
    })
    model.setOnImpact((x, y, energy) => {
      // impact FX hook: play collision and trigger view pulse
      playSound("collision")
      trackEvent("spinner_impact", { game: gameId, energy })
      controller.registerImpact(energy)
      if (viewRef.current) {
        viewRef.current.triggerImpact()
      }
      onEvent?.({ type: "custom", payload: { action: "impact", x, y, energy } })
    })
    model.setOnPickup((x, y, who) => {
      // distinct pickup chime
      playSound("eat-food")
      trackEvent("spinner_pickup", { game: gameId, who })
      controller.registerImpact(8)
      if (viewRef.current) {
        viewRef.current.triggerImpact()
      }
    })

    gameEngine.startGame(gameId)
    playSound("game-start")
    trackEvent("game_start", { game: gameId, mode })

    return () => {
      gameEngine.stopGame(gameId)
      gameEngine.unregisterGame(gameId)
      controller.cleanup()
    }
  }, [])

  useEffect(() => {
    AsyncStorage.getItem("spinner-war-difficulty")
      .then((stored) => {
        if (stored === "rookie" || stored === "pro" || stored === "legend") {
          controller.handleInput({ type: `difficulty${stored}` })
        }
      })
      .catch(() => undefined)
  }, [controller])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: gameId })
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }
  const handlePress = (player: "player1" | "player2", action: string) => {
    controller.handleInput({ type: action + player })
  }

  const handleMode = (mode: "friend" | "bot") => {
    controller.handleInput({ type: mode === "bot" ? "modebot" : "modefriend" })
  }
  const handleDifficulty = (level: "rookie" | "pro" | "legend") => {
    controller.handleInput({ type: `difficulty${level}` })
    AsyncStorage.setItem("spinner-war-difficulty", level).catch(() => undefined)
  }

  const backgroundImage = getSeasonalGameBackground(gameId) || require("../../assets/images/spinner-war-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SpinnerWarView
          ref={viewRef}
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onPress={handlePress}
          onModeChange={handleMode}
          onDifficultyChange={handleDifficulty}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default SpinnerWarScreen
