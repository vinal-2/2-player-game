"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from "react-native"

import { GameEngine } from "../../core/GameEngine"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import SnakesDuelView from "./SnakesDuelView"
import { SnakesDuelModel, type SnakesDuelEvent } from "./SnakesDuelModel"
import SnakesDuelController from "./SnakesDuelController"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const GRID_WIDTH = 18
const GRID_HEIGHT = 18

const SnakesDuelScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()

  const [model] = useState(() => new SnakesDuelModel(GRID_WIDTH, GRID_HEIGHT))
  const [controller] = useState(() => new SnakesDuelController(model, mode))
  const [renderVersion, setRenderVersion] = useState(0)
  const [currentMode, setCurrentMode] = useState<"friend" | "bot">(mode)

  const gameEngine = useMemo(() => GameEngine.getInstance(), [])

  const handleModelEvent = useCallback((event: SnakesDuelEvent) => {
    switch (event.type) {
      case "apple":
        playSound("eat-food")
        onEvent?.({ type: "custom", payload: { action: "snakes_apple", id: event.snakeId, length: event.length } })
        break
      case "collision":
        playSound("collision")
        onEvent?.({ type: "custom", payload: { action: "snakes_collision", id: event.snakeId, reason: event.reason } })
        break
      case "round_end":
        playSound("round-start")
        onEvent?.({ type: "custom", payload: { action: "snakes_round_end", winner: event.winner } })
        break
    }
  }, [onEvent, playSound])

  useEffect(() => {
    model.setEventEmitter(handleModelEvent)
    model.setOnStateChange(() => setRenderVersion((value) => value + 1))
    controller.setMode(mode)

    gameEngine.registerGame(gameId, model, controller)
    gameEngine.startGame(gameId)
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")

    return () => {
      gameEngine.stopGame()
      gameEngine.unregisterGame?.(gameId)
      controller.cleanup()
    }
  }, [controller, gameEngine, gameId, mode, model, playSound, trackEvent, handleModelEvent])

  const handleModelEvent = (event: SnakesDuelEvent) => {
    switch (event.type) {
      case "apple":
        playSound("eat-food")
        onEvent?.({ type: "custom", payload: { action: "snakes_apple", id: event.snakeId, length: event.length } })
        break
      case "collision":
        playSound("collision")
        onEvent?.({
          type: "custom",
          payload: { action: "snakes_collision", id: event.snakeId, reason: event.reason },
        })
        break
      case "round_end":
        playSound("round-start")
        onEvent?.({ type: "custom", payload: { action: "snakes_round_end", winner: event.winner } })
        break
    }
  }

  const handleDirection = (snakeId: "player1" | "player2", direction: "up" | "down" | "left" | "right") => {
    controller.handleInput({ type: "direction", snakeId, direction })
  }

  const handleResetRound = () => {
    controller.handleInput({ type: "reset" })
  }

  const toggleMode = () => {
    const nextMode = currentMode === "bot" ? "friend" : "bot"
    setCurrentMode(nextMode)
    controller.setMode(nextMode)
    trackEvent("snakes_mode_toggle", { game_id: gameId, mode: nextMode })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleResetRound}>
          <Text style={styles.toolbarButtonText}>Reset Round</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton} onPress={toggleMode}>
          <Text style={styles.toolbarButtonText}>Mode: {currentMode === "bot" ? "VS Bot" : "2 Players"}</Text>
        </TouchableOpacity>
      </View>

      <SnakesDuelView
        key={snakes-view-}
        state={model.state}
        mode={currentMode}
        onChangeDirection={handleDirection}
        onResetRound={handleResetRound}
        onExit={onExit}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarButton: {
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolbarButtonText: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
})

export default SnakesDuelScreen


