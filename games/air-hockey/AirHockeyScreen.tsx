"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { AirHockeyView } from "./AirHockeyView"
import { AirHockeyModel } from "./AirHockeyModel"
import { AirHockeyController } from "./AirHockeyController"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"

interface AirHockeyScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

/**
 * Air Hockey Screen Component
 *
 * This component connects the Air Hockey game to the React Native navigation
 */
const AirHockeyScreen: React.FC<AirHockeyScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  // Get screen dimensions
  const boardWidth = 300
  const boardHeight = 500

  // Create model and controller
  const [model] = useState(() => new AirHockeyModel(boardWidth, boardHeight))
  const [controller] = useState(() => new AirHockeyController(model, mode))

  // Get game engine
  const gameEngine = GameEngine.getInstance()

  // Register game with engine
  useEffect(() => {
    gameEngine.registerGame("airHockey", model, controller)

    // Set up event handlers
    model.setOnGoalScored((player) => {
      playSound(require("../../assets/sounds/score.mp3"))
      trackEvent("game_score", { game: "airHockey", player })
    })

    model.setOnGameOver((winner) => {
      playSound(require("../../assets/sounds/win.mp3"))
      trackEvent("game_over", { game: "airHockey", winner })
    })

    // Start the game
    gameEngine.startGame("airHockey")
    playSound(require("../../assets/sounds/game-start.mp3"))
    trackEvent("game_start", { game: "airHockey", mode })

    // Clean up
    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  // Handle reset
  const handleReset = () => {
    model.reset()
    playSound(require("../../assets/sounds/game-start.mp3"))
    trackEvent("game_reset", { game: "airHockey" })
  }

  // Handle back
  const handleBack = () => {
    playSound(require("../../assets/sounds/button-press.mp3"))
    navigation.goBack()
  }

  // Get seasonal background or use default
  const backgroundImage = getSeasonalGameBackground("air-hockey") || require("../../assets/images/air-hockey-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AirHockeyView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          player1PanHandlers={controller.player1PanHandlers}
          player2PanHandlers={controller.player2PanHandlers}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default AirHockeyScreen
