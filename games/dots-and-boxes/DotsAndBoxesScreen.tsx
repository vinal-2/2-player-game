tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"
import DotsAndBoxesView from "./DotsAndBoxesView"
import DotsAndBoxesModel from "./DotsAndBoxesModel"
import DotsAndBoxesController from "./DotsAndBoxesController"

interface DotsAndBoxesScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

const DotsAndBoxesScreen: React.FC<DotsAndBoxesScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new DotsAndBoxesModel())
  const [controller] = useState(() => new DotsAndBoxesController(model, mode))

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame("dotsAndBoxes", model, controller)

    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw")
        trackEvent("game_draw", { game: "dotsAndBoxes" })
      } else {
        playSound("win")
        trackEvent("game_over", { game: "dotsAndBoxes", winner })
      }
    })

    gameEngine.startGame("dotsAndBoxes")
    playSound("game-start")
    trackEvent("game_start", { game: "dotsAndBoxes", mode })

    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: "dotsAndBoxes" })
  }

  const handleBack = () => {
    playSound("button-press")
    navigation.goBack()
  }

  const handleLinePress = (line: string) => {
    playSound("cell-tap")
    controller.handleInput({ type: "linePress", line })
  }

  const backgroundImage = getSeasonalGameBackground("dots-and-boxes") || require("../../assets/images/dots-and-boxes-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <DotsAndBoxesView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onLinePress={handleLinePress}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default DotsAndBoxesScreen