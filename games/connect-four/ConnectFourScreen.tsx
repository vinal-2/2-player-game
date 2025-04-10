tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"
import ConnectFourView from "./ConnectFourView"
import ConnectFourModel from "./ConnectFourModel"
import ConnectFourController from "./ConnectFourController"

interface ConnectFourScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

const ConnectFourScreen: React.FC<ConnectFourScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new ConnectFourModel())
  const [controller] = useState(() => new ConnectFourController(model, mode))

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame("connectFour", model, controller)

    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw")
        trackEvent("game_draw", { game: "connectFour" })
      } else {
        playSound("win")
        trackEvent("game_over", { game: "connectFour", winner })
      }
    })

    gameEngine.startGame("connectFour")
    playSound("game-start")
    trackEvent("game_start", { game: "connectFour", mode })

    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: "connectFour" })
  }

  const handleBack = () => {
    playSound("button-press")
    navigation.goBack()
  }

  const handleCellPress = (column: number) => {
    playSound("cell-tap")
    controller.handleInput({ type: "cellPress", column })
  }

  const backgroundImage = getSeasonalGameBackground("connect-four") || require("../../assets/images/connect-four-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ConnectFourView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onCellPress={handleCellPress}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default ConnectFourScreen