"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"

import { GameEngine } from "../../core/GameEngine"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

import { PenaltyKicksModel } from "./PenaltyKicksModel"
import { PenaltyKicksController } from "./PenaltyKicksController"
import PenaltyKicksView from "./PenaltyKicksView"

const PenaltyKicksScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { getSeasonalGameBackground } = useSeasonal()
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()

  const [model] = useState(() => new PenaltyKicksModel())
  const [controller] = useState(() => new PenaltyKicksController(model, mode))
  const [viewVersion, setViewVersion] = useState(0)

  const backgroundImage = getSeasonalGameBackground(gameId) || require("../../assets/images/settings-bg.png")
  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame(gameId, model, controller)
    model.initialize()
    controller.initialize()
    gameEngine.startGame(gameId)
    playSound("game-start")
    trackEvent("game_start", { game: gameId, mode })

    return () => {
      gameEngine.stopGame(gameId)
      gameEngine.unregisterGame(gameId)
      controller.cleanup()
    }
  }, [controller, gameEngine, gameId, model, mode, playSound, trackEvent])

  const handleReset = () => {
    model.reset()
    onEvent?.({ type: "custom", payload: { action: "reset" } })
    trackEvent("penalty_reset", { game: gameId })
    setViewVersion((v) => v + 1)
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <PenaltyKicksView
          key={`penalty-view-${viewVersion}`}
          state={model.state}
          onBack={handleBack}
          onReset={handleReset}
          onShoot={() => {
            model.registerGoal()
            onEvent?.({ type: "custom", payload: { action: "goal", score: model.state.score } })
            setViewVersion((v) => v + 1)
          }}
          onSave={() => {
            model.registerSave()
            onEvent?.({ type: "custom", payload: { action: "save", score: model.state.score } })
            setViewVersion((v) => v + 1)
          }}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default PenaltyKicksScreen
