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

interface SpinnerWarScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

const SpinnerWarScreen: React.FC<SpinnerWarScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new SpinnerWarModel())
  const [controller] = useState(() => new SpinnerWarController(model, mode))

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame("spinnerWar", model, controller)

    model.setOnGameOver((winner) => {
      playSound("win")
      trackEvent("game_over", { game: "spinnerWar", winner })
    })

    gameEngine.startGame("spinnerWar")
    playSound("game-start")
    trackEvent("game_start", { game: "spinnerWar", mode })

    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: "spinnerWar" })
  }

  const handleBack = () => {
    playSound("button-press")
    navigation.goBack()
  }
  const handlePress = (index: number) => {
    playSound("button-press")
    controller.handleInput({ type: "press", index })
  }

  const backgroundImage = getSeasonalGameBackground("spinner-war") || require("../../assets/images/spinner-war-bg.png")

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