"use client"

import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import ConnectFourView from "./ConnectFourView"
import ConnectFourModel from "./ConnectFourModel"
import ConnectFourController from "./ConnectFourController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const ConnectFourScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()
  const [model] = useState(() => new ConnectFourModel())
  const [controller] = useState(() => new ConnectFourController(model))

  useEffect(() => {
    controller.initialize()
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")
    onEvent?.({ type: "custom", payload: { action: "connect-four_start" } })

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
      <ConnectFourView state={model.state} onReset={handleReset} onBack={handleBack} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default ConnectFourScreen
