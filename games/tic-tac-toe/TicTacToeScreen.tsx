"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { TicTacToeView } from "./TicTacToeView"
import { TicTacToeModel } from "./TicTacToeModel"
import { TicTacToeController } from "./TicTacToeController"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"

interface TicTacToeScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

/**
 * Tic Tac Toe Screen Component
 *
 * This component connects the Tic Tac Toe game to the React Native navigation
 */
const TicTacToeScreen: React.FC<TicTacToeScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  // Create model and controller
  const [model] = useState(() => new TicTacToeModel())
  const [controller] = useState(() => new TicTacToeController(model, mode))

  // Get game engine
  const gameEngine = GameEngine.getInstance()

  // Register game with engine
  useEffect(() => {
    gameEngine.registerGame("ticTacToe", model, controller)

    // Set up event handlers
    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw")
        trackEvent("game_draw", { game: "ticTacToe" })
      } else {
        playSound("win")
        trackEvent("game_over", { game: "ticTacToe", winner })
      }
    })

    // Start the game
    gameEngine.startGame("ticTacToe")
    playSound("game-start")
    trackEvent("game_start", { game: "ticTacToe", mode })

    // Clean up
    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  // Handle cell press
  const handleCellPress = (index: number) => {
    playSound("cell-tap")
    controller.handleInput({ type: "cellPress", index })
  }

  // Handle reset
  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: "ticTacToe" })
  }

  // Handle reset scores
  const handleResetScores = () => {
    controller.handleInput({ type: "resetScores" })
    playSound("button-press")
    trackEvent("scores_reset", { game: "ticTacToe" })
  }

  // Handle back
  const handleBack = () => {
    playSound("button-press")
    navigation.goBack()
  }

  // Get seasonal background or use default
  const backgroundImage = getSeasonalGameBackground("tic-tac-toe") || require("../../assets/images/tic-tac-toe-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TicTacToeView
          state={model.state}
          onCellPress={handleCellPress}
          onReset={handleReset}
          onResetScores={handleResetScores}
          onBack={handleBack}
          gameMode={mode}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default TicTacToeScreen
