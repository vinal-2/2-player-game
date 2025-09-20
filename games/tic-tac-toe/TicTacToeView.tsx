"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, TouchableOpacity, Text, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { TicTacToeState, BotDifficulty } from "./TicTacToeModel"
import type { GameView } from "../../core/GameEngine"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { AccessibilityManager } from "../../utils/AccessibilityManager"

interface TicTacToeViewProps {
  state: TicTacToeState
  onCellPress: (index: number) => void
  onReset: () => void
  onResetScores: () => void
  onBack: () => void
  gameMode: "friend" | "bot"
  difficulty: BotDifficulty
  onDifficultyChange: (difficulty: BotDifficulty) => void
}

const difficultyOptions: BotDifficulty[] = ["easy", "medium", "hard"]

export const TicTacToeView: React.FC<TicTacToeViewProps> & GameView = ({
  state,
  onCellPress,
  onReset,
  onResetScores,
  onBack,
  gameMode,
  difficulty,
  onDifficultyChange,
}) => {
  const { seasonalTheme } = useSeasonal()
  const accessibilityManager = AccessibilityManager.getInstance()
  const boardBackground = seasonalTheme?.backgroundColor || "rgba(187, 222, 251, 0.85)"

  const cellAnims = useRef(
    Array(9)
      .fill(0)
      .map(() => new Animated.Value(0)),
  )

  const scoreAnim = useRef(new Animated.Value(1)).current
  const winPulseAnim = useRef(new Animated.Value(0)).current
  const winPulseRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    cellAnims.current.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    })
  }, [])

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scoreAnim, {
        toValue: 1.3,
        duration: accessibilityManager.getAnimationDuration(200),
        useNativeDriver: true,
      }),
      Animated.spring(scoreAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start()
  }, [accessibilityManager, state.scores])

  useEffect(() => {
    if (state.gameOver && state.winner && state.winner !== "draw") {
      winPulseRef.current?.stop()
      winPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(winPulseAnim, {
            toValue: 1,
            duration: accessibilityManager.getAnimationDuration(260),
            useNativeDriver: true,
          }),
          Animated.timing(winPulseAnim, {
            toValue: 0,
            duration: accessibilityManager.getAnimationDuration(260),
            useNativeDriver: true,
          }),
        ]),
      )
      winPulseRef.current.start()
    } else {
      winPulseRef.current?.stop()
      winPulseRef.current = null
      winPulseAnim.setValue(0)
    }

    return () => {
      winPulseRef.current?.stop()
    }
  }, [accessibilityManager, state.gameOver, state.winner, winPulseAnim])

  const renderCell = (index: number) => {
    const isWinningCell = state.winningCells.includes(index)
    const cellValue = state.board[index]

    const accessibleLabel = `Cell ${Math.floor(index / 3) + 1}, ${(index % 3) + 1}, ${
      cellValue ? `contains ${cellValue}` : "empty"
    }${isWinningCell ? ", winning cell" : ""}`

    const winningTransform = isWinningCell
      ? [
          {
            scale: winPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
          },
        ]
      : []

    return (
      <Animated.View
        style={{
          transform: [{ scale: cellAnims.current[index] }, ...winningTransform],
        }}
      >
        <TouchableOpacity
          style={[styles.cell, isWinningCell && styles.winningCell]}
          onPress={() => onCellPress(index)}
          activeOpacity={0.7}
          disabled={state.board[index] !== "" || state.gameOver}
          {...accessibilityManager.createAccessibleProps(accessibleLabel, "Double tap to place your mark", "button")}
        >
          {cellValue === "X" && (
            <Animated.Text style={[styles.cellText, { color: "#FF5252" }, isWinningCell && styles.winningCellText]}>
              X
            </Animated.Text>
          )}
          {cellValue === "O" && (
            <Animated.Text style={[styles.cellText, { color: "#2196F3" }, isWinningCell && styles.winningCellText]}>
              O
            </Animated.Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerInfo}>
        <Animated.View
          style={[
            styles.playerCard,
            state.currentPlayer === "X" ? styles.activePlayerCard : null,
            state.currentPlayer === "X" && { transform: [{ scale: scoreAnim }] },
          ]}
        >
          <Text style={[styles.playerLabel, state.currentPlayer === "X" && styles.activePlayerLabel]}>Player X</Text>
          <Text style={[styles.scoreText, state.currentPlayer === "X" && styles.activeScoreText]}>
            {state.scores.X}
          </Text>
        </Animated.View>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <Animated.View
          style={[
            styles.playerCard,
            state.currentPlayer === "O" ? styles.activePlayerCard : null,
            state.currentPlayer === "O" && { transform: [{ scale: scoreAnim }] },
          ]}
        >
          <Text style={[styles.playerLabel, state.currentPlayer === "O" && styles.activePlayerLabel]}>
            {gameMode === "bot" ? "Bot" : "Player O"}
          </Text>
          <Text style={[styles.scoreText, state.currentPlayer === "O" && styles.activeScoreText]}>
            {state.scores.O}
          </Text>
        </Animated.View>
      </View>

      {gameMode === "bot" && (
        <View style={styles.difficultyRow}>
          {difficultyOptions.map((level) => {
            const isActive = difficulty === level
            return (
              <TouchableOpacity
                key={`difficulty-${level}`}
                style={[styles.difficultyChip, isActive && styles.difficultyChipActive]}
                onPress={() => onDifficultyChange(level)}
              >
                <Text style={[styles.difficultyText, isActive && styles.difficultyTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}

      <View style={styles.boardContainer}>
        <View style={[styles.board, { backgroundColor: boardBackground }]}
        >
          <View style={styles.row}>
            {renderCell(0)}
            {renderCell(1)}
            {renderCell(2)}
          </View>
          <View style={styles.row}>
            {renderCell(3)}
            {renderCell(4)}
            {renderCell(5)}
          </View>
          <View style={styles.row}>
            {renderCell(6)}
            {renderCell(7)}
            {renderCell(8)}
          </View>
        </View>
      </View>

      {state.gameOver && state.winner && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>
            {state.winner === "draw" ? "It’s a draw!" : `${state.winner} wins!`}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.resetButtonText}>New Round</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetScoresButton} onPress={onResetScores}>
          <Ionicons name="trophy" size={18} color="white" />
          <Text style={styles.resetButtonText}>Reset Scores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={onBack}>
          <Ionicons name="home" size={18} color="white" />
          <Text style={styles.resetButtonText}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  playerCard: {
    width: 120,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 12,
    alignItems: "center",
  },
  activePlayerCard: {
    borderWidth: 2,
    borderColor: "#FFC107",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EEE",
  },
  activePlayerLabel: {
    color: "#FF6B00",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  activeScoreText: {
    color: "#FF6B00",
  },
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  difficultyChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 6,
  },
  difficultyChipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  difficultyText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  difficultyTextActive: {
    color: "white",
  },
  vsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  vsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  boardContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  board: {
    width: 300,
    height: 300,
    borderRadius: 15,
    overflow: "hidden",
    padding: 5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  row: {
    flexDirection: "row",
    height: "33.33%",
  },
  cell: {
    width: "33.33%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "white",
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  winningCell: {
    backgroundColor: "#FFF9C4",
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  cellText: {
    fontSize: 50,
    fontWeight: "bold",
  },
  winningCellText: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameOverContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#FF5252",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
  },
  resetScoresButton: {
    backgroundColor: "#FF9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default TicTacToeView
