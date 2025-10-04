"use client"

import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import ChessView from "./ChessView"
import ChessModel from "./ChessModel"
import ChessController from "./ChessController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const ChessScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()
  const [model] = useState(() => new ChessModel())
  const [controller] = useState(() => new ChessController(model))

  useEffect(() => {
    controller.initialize()
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")
    onEvent?.({ type: "custom", payload: { action: "chess_start" } })

    return () => {
      controller.cleanup()
      model.reset()
    }
  }, [controller, gameId, mode, model, onEvent, playSound, trackEvent])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game_id: gameId })
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ChessView state={model.state} onReset={handleReset} onBack={handleBack} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default ChessScreen
