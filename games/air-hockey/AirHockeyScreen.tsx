"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { SafeAreaView, ImageBackground } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { AirHockeyView } from "./AirHockeyView"
import { AirHockeyModel } from "./AirHockeyModel"
import { AirHockeyController, type AirHockeyDifficulty } from "./AirHockeyController"
import { GameEngine } from "../../core/GameEngine"
import type { GameRuntimeProps } from "../../core/gameRuntime"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSeasonal } from "../../contexts/SeasonalContext"

const GOAL_STORAGE_KEY = "air-hockey-scores"

const difficultyOrder: AirHockeyDifficulty[] = ["rookie", "pro", "legend"]

const AirHockeyScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()

  const boardWidth = 320
  const boardHeight = 520

  const [model] = useState(() => new AirHockeyModel(boardWidth, boardHeight))
  const [controller] = useState(() => new AirHockeyController(model, mode))
  const [forceRender, setForceRender] = useState(0)
  const [goalFlash, setGoalFlash] = useState<"player1" | "player2" | null>(null)
  const [difficulty, setDifficulty] = useState<AirHockeyDifficulty>("pro")
  const goalFxIndex = useRef(0)
  const goalFx = useRef([
    require("../../assets/sounds/score.mp3"),
    require("../../assets/sounds/round-start.mp3"),
    require("../../assets/sounds/collision.mp3"),
  ] as const)

  const lastGoalTimeout = useRef<NodeJS.Timeout | null>(null)

  const gameEngine = GameEngine.getInstance()

  useEffect(() => {
    model.setOnStateChange(() => {
      setForceRender((value) => value + 1)
    })
  }, [model])

  useEffect(() => {
    if (mode === "bot") {
      controller.setBotDifficulty(difficulty)
    }
  }, [controller, difficulty, mode])

  useEffect(() => {
    const loadScores = async () => {
      try {
        const stored = await AsyncStorage.getItem(GOAL_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as { player1: number; player2: number }
          if (parsed && typeof parsed.player1 === "number" && typeof parsed.player2 === "number") {
            model.state.scores = parsed
            setForceRender((value) => value + 1)
          }
        }
      } catch (error) {
        // ignore
      }
    }

    loadScores()
  }, [model])

  useEffect(() => {
    gameEngine.registerGame(gameId, model, controller)

    model.setOnGoalScored((player) => {
      // Rotate through goal FX for variety
      const sounds = goalFx.current
      const fx = sounds[goalFxIndex.current % sounds.length]
      goalFxIndex.current = (goalFxIndex.current + 1) % sounds.length
      playSound(fx)
      trackEvent("game_score", { game: gameId, player })
      onEvent?.({ type: "score", payload: { player } })
      setGoalFlash(player as "player1" | "player2")
      if (lastGoalTimeout.current) {
        clearTimeout(lastGoalTimeout.current)
      }
      lastGoalTimeout.current = setTimeout(() => {
        setGoalFlash(null)
      }, 900)
      AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(model.state.scores)).catch(() => undefined)
    })

    model.setOnGameOver((winner) => {
      playSound(require("../../assets/sounds/win.mp3"))
      trackEvent("game_over", { game: gameId, winner })
      onEvent?.({ type: "game_over", payload: { winner } })
    })

    gameEngine.startGame(gameId)
    playSound(require("../../assets/sounds/game-start.mp3"))
    trackEvent("game_start", { game: gameId, mode, difficulty })

    return () => {
      if (lastGoalTimeout.current) {
        clearTimeout(lastGoalTimeout.current)
      }
      gameEngine.stopGame(gameId)
      gameEngine.unregisterGame(gameId)
      controller.cleanup()
    }
  }, [controller, difficulty, gameEngine, gameId, mode, model, onEvent, playSound, trackEvent])

  const handleReset = useCallback(() => {
    model.reset()
    playSound(require("../../assets/sounds/game-start.mp3"))
    trackEvent("game_reset", { game: gameId })
    AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(model.state.scores)).catch(() => undefined)
  }, [gameId, model, playSound, trackEvent])

  const handleBack = useCallback(() => {
    playSound(require("../../assets/sounds/button-press.mp3"))
    onExit()
  }, [onExit, playSound])

  const handleDifficultyChange = useCallback(
    (level: AirHockeyDifficulty) => {
      setDifficulty(level)
      controller.setBotDifficulty(level)
      AsyncStorage.setItem("air-hockey-difficulty", level).catch(() => undefined)
      trackEvent("air_hockey_difficulty", { game: gameId, level })
      onEvent?.({ type: "custom", payload: { action: "difficulty", level } })
    },
    [controller, gameId, onEvent, trackEvent],
  )

  useEffect(() => {
    AsyncStorage.getItem("air-hockey-difficulty")
      .then((stored) => {
        if (stored === "rookie" || stored === "pro" || stored === "legend") {
          setDifficulty(stored)
          controller.setBotDifficulty(stored)
        }
      })
      .catch(() => undefined)
  }, [controller])

  const backgroundImage = useMemo(
    () => getSeasonalGameBackground(gameId) || require("../../assets/images/air-hockey-bg.png"),
    [gameId, getSeasonalGameBackground],
  )

  return (
    <ImageBackground key={`${forceRender}`} source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <AirHockeyView
          state={model.state}
          lastGoal={goalFlash}
          mode={mode}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
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
