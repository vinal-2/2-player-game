"use client"

import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import DotsAndBoxesView from "./DotsAndBoxesView"
import DotsAndBoxesModel from "./DotsAndBoxesModel"
import DotsAndBoxesController from "./DotsAndBoxesController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const DotsAndBoxesScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()
  const [model] = useState(() => new DotsAndBoxesModel())
  const [controller] = useState(() => new DotsAndBoxesController(model))

  useEffect(() => {
    controller.initialize()
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")
    onEvent?.({ type: "custom", payload: { action: "dots_placeholder" } })

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
      <DotsAndBoxesView state={model.state} onReset={handleReset} onBack={handleBack} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default DotsAndBoxesScreen
