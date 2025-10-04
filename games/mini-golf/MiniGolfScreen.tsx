"use client"

import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import MiniGolfView from "./MiniGolfView"
import MiniGolfModel from "./MiniGolfModel"
import MiniGolfController from "./MiniGolfController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const MiniGolfScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()
  const [model] = useState(() => new MiniGolfModel())
  const [controller] = useState(() => new MiniGolfController(model))

  useEffect(() => {
    controller.initialize()
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")
    onEvent?.({ type: "custom", payload: { action: "mini_golf_placeholder" } })

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
      <MiniGolfView state={model.state} onReset={handleReset} onBack={handleBack} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default MiniGolfScreen
