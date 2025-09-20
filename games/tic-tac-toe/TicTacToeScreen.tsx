"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { TicTacToeView } from "./TicTacToeView"
import { TicTacToeModel, BotDifficulty } from "./TicTacToeModel"
import { TicTacToeController } from "./TicTacToeController"
import { GameEngine } from "../../core/GameEngine"
import type { GameRuntimeProps } from "../../core/gameRuntime"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"

const SCORE_STORAGE_KEY = "tic-tac-toe-scores"

const TicTacToeScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const [model] = useState(() => new TicTacToeModel())
  const [controller] = useState(() => new TicTacToeController(model, mode))
  const [difficulty, setDifficulty] = useState<BotDifficulty>("medium")
  const [, forceUpdate] = useState(0)

  const notifyStateChange = useCallback(() => {
    forceUpdate((value) => value + 1)
  }, [])

  useEffect(() => {
    model.setOnStateChange(notifyStateChange)
  }, [model, notifyStateChange])

  useEffect(() => {
    controller.setDifficulty(difficulty)
  }, [controller, difficulty])

  useEffect(() => {
    const loadScores = async () => {
      try {
        const stored = await AsyncStorage.getItem(SCORE_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && typeof parsed.X === "number" && typeof parsed.O === "number") {
            model.state.scores = parsed
            notifyStateChange()
          }
        }
      } catch (error) {
        // ignore
      }
    }

    loadScores()
  }, [model, notifyStateChange])

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    gameEngine.registerGame(gameId, model, controller)

    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw")
        trackEvent("game_draw", { game: gameId })
        onEvent?.({ type: "game_over", payload: { winner: "draw" } })
      } else {
        playSound("win")
        trackEvent("game_over", { game: gameId, winner })
        onEvent?.({ type: "game_over", payload: { winner } })
      }
    })

    gameEngine.startGame(gameId)
    playSound("game-start")
    trackEvent("game_start", { game: gameId, mode, difficulty })

    return () => {
      gameEngine.stopGame(gameId)
      gameEngine.unregisterGame(gameId)
      controller.cleanup()
    }
  }, [controller, difficulty, gameEngine, gameId, mode, model, onEvent, playSound, trackEvent])

  useEffect(() => {
    AsyncStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(model.state.scores)).catch(() => undefined)
  }, [model.state.scores.X, model.state.scores.O])

  const handleCellPress = (index: number) => {
    playSound("cell-tap")
    controller.handleInput({ type: "cellPress", index })
  }

  const handleReset = () => {
    controller.handleInput({ type: "reset" })
    playSound("game-start")
    trackEvent("game_reset", { game: gameId })
  }

  const handleResetScores = () => {
    controller.handleInput({ type: "resetScores" })
    playSound("button-press")
    trackEvent("scores_reset", { game: gameId })
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }

  const handleDifficultyChange = (level: BotDifficulty) => {
    setDifficulty(level)
    trackEvent("tic_tac_toe_difficulty", { game: gameId, level })
    onEvent?.({ type: "custom", payload: { action: "difficulty", level } })
  }

  const backgroundImage = getSeasonalGameBackground(gameId) || require("../../assets/images/tic-tac-toe-bg.png")

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
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
        />
      </SafeAreaView>
    </ImageBackground>
  )
}

export default TicTacToeScreen
