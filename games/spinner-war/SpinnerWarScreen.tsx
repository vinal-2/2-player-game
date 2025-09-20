tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"
import SpinnerWarView from "./SpinnerWarView"
import SpinnerWarModel from "./SpinnerWarModel"
import SpinnerWarController from "./SpinnerWarController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const SpinnerWarScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new SpinnerWarModel())
  const [controller] = useState(() => new SpinnerWarController(model, mode))

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame(gameId, model, controller)

    model.setOnGameOver((winner) => {
      playSound("win")
      trackEvent("game_over", { game: gameId, winner })
      onEvent?.({ type: "game_over", payload: { winner } })
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

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: gameId })
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }
  const handlePress = (index: number) => {
    playSound("button-press")
    controller.handleInput({ type: "press", index })
    onEvent?.({ type: "custom", payload: { action: "press", index } })
  }

  const backgroundImage = getSeasonalGameBackground(gameId) || require("../../assets/images/spinner-war-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <SpinnerWarView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onPress={handlePress}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default SpinnerWarScreen