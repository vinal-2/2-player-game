tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import { GameEngine } from "../../core/GameEngine"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"
import ChessView from "./ChessView"
import ChessModel from "./ChessModel"
import ChessController from "./ChessController"

interface ChessScreenProps {
  route: {
    params: {
      mode: "friend" | "bot"
    }
  }
  navigation: any
}

const ChessScreen: React.FC<ChessScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new ChessModel())
  const [controller] = useState(() => new ChessController(model, mode))

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame("chess", model, controller)

    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw")
        trackEvent("game_draw", { game: "chess" })
      } else {
        playSound("win")
        trackEvent("game_over", { game: "chess", winner })
      }
    })

    gameEngine.startGame("chess")
    playSound("game-start")
    trackEvent("game_start", { game: "chess", mode })

    return () => {
      gameEngine.stopGame()
      controller.cleanup()
    }
  }, [])

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: "chess" })
  }

  const handleBack = () => {
    playSound("button-press")
    navigation.goBack()
  }

  const handleSelectPiece = (row: number, col: number) => {
    playSound("cell-tap");
    controller.handleInput({ type: "cellPress", from: { x: col, y: row } });
  };

  const handleMovePiece = (from: { row: number, col: number }, to: { row: number, col: number }) => {
    playSound("cell-tap");
    controller.handleInput({ type: "movePiece", from, to });
  }

  const backgroundImage = getSeasonalGameBackground("chess") || require("../../assets/images/chess-bg.png")

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ChessView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onSelectPiece={handleSelectPiece}
          onMovePiece={handleMovePiece}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default ChessScreen