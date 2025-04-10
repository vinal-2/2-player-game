"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { AirHockeyState } from "./AirHockeyModel"
import type { GameView } from "../../core/GameEngine"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { useSound } from "../../contexts/SoundContext"

interface AirHockeyViewProps {
  state: AirHockeyState
  onReset: () => void
  onBack: () => void
  player1PanHandlers: any
  player2PanHandlers: any
}

/**
 * Air Hockey Game View
 *
 * Renders the Air Hockey game UI
 */
export const AirHockeyView: React.FC<AirHockeyViewProps> & GameView = ({
  state,
  onReset,
  onBack,
  player1PanHandlers,
  player2PanHandlers,
}) => {
  const { seasonalTheme, getSeasonalGameBackground } = useSeasonal()
  const { playSound } = useSound()

  // References for animations
  const player1Position = useRef(
    new Animated.ValueXY({
      x: state.player1Paddle.x - state.player1Paddle.radius,
      y: state.player1Paddle.y - state.player1Paddle.radius,
    }),
  ).current

  const player2Position = useRef(
    new Animated.ValueXY({
      x: state.player2Paddle.x - state.player2Paddle.radius,
      y: state.player2Paddle.y - state.player2Paddle.radius,
    }),
  ).current

  const puckPosition = useRef(
    new Animated.ValueXY({
      x: state.puck.x - state.puck.radius,
      y: state.puck.y - state.puck.radius,
    }),
  ).current

  // Update animated values when state changes
  useEffect(() => {
    player1Position.setValue({
      x: state.player1Paddle.x - state.player1Paddle.radius,
      y: state.player1Paddle.y - state.player1Paddle.radius,
    })

    player2Position.setValue({
      x: state.player2Paddle.x - state.player2Paddle.radius,
      y: state.player2Paddle.y - state.player2Paddle.radius,
    })

    puckPosition.setValue({
      x: state.puck.x - state.puck.radius,
      y: state.puck.y - state.puck.radius,
    })
  }, [state])

  // Get seasonal background
  const backgroundImage = getSeasonalGameBackground("air-hockey") || require("../../assets/images/air-hockey-bg.png")

  return (
    <View style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Player 1</Text>
          <Text style={styles.scoreValue}>{state.scores.player1}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{state.gameMode === "friend" ? "Player 2" : "Bot"}</Text>
          <Text style={styles.scoreValue}>{state.scores.player2}</Text>
        </View>
      </View>

      <View style={[styles.board, { backgroundColor: seasonalTheme.primaryColor }]}>
        {/* Top goal */}
        <View style={[styles.goal, styles.topGoal]} />

        {/* Bottom goal */}
        <View style={[styles.goal, styles.bottomGoal]} />

        {/* Center line */}
        <View style={styles.centerLine} />

        {/* Player 2 paddle (top) */}
        <Animated.View
          style={[
            styles.paddle,
            styles.player2Paddle,
            {
              width: state.player2Paddle.radius * 2,
              height: state.player2Paddle.radius * 2,
              transform: player2Position.getTranslateTransform(),
            },
          ]}
          {...player2PanHandlers}
        />

        {/* Player 1 paddle (bottom) */}
        <Animated.View
          style={[
            styles.paddle,
            styles.player1Paddle,
            {
              width: state.player1Paddle.radius * 2,
              height: state.player1Paddle.radius * 2,
              transform: player1Position.getTranslateTransform(),
            },
          ]}
          {...player1PanHandlers}
        />

        {/* Puck */}
        <Animated.View
          style={[
            styles.puck,
            {
              width: state.puck.radius * 2,
              height: state.puck.radius * 2,
              transform: puckPosition.getTranslateTransform(),
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            playSound(require("../../assets/sounds/button-press.mp3"))
            onReset()
          }}
        >
          <Ionicons name="reload" size={20} color="white" />
          <Text style={styles.buttonText}>Reset Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            playSound(require("../../assets/sounds/button-press.mp3"))
            onBack()
          }}
        >
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Required method for GameView interface
AirHockeyView.render = () => {
  // This is handled by React's rendering system
}

// Required method for GameView interface
AirHockeyView.update = (state: any) => {
  // This is handled by React's props system
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  scoreBoard: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    padding: 15,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  board: {
    width: "95%",
    aspectRatio: 1.5,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  goal: {
    position: "absolute",
    width: "40%",
    height: 20,
    backgroundColor: "#1565C0",
    left: "30%",
  },
  topGoal: {
    top: -10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bottomGoal: {
    bottom: -10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  centerLine: {
    position: "absolute",
    top: "50%",
    width: "100%",
    height: 4,
    backgroundColor: "white",
    opacity: 0.4,
  },
  paddle: {
    borderRadius: 50,
    position: "absolute",
    elevation: 5,
  },
  player1Paddle: {
    backgroundColor: "#FF5252",
  },
  player2Paddle: {
    backgroundColor: "#4CAF50",
  },
  puck: {
    borderRadius: 50,
    backgroundColor: "#FFC107",
    position: "absolute",
    elevation: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 15,
  },
  resetButton: {
    backgroundColor: "#FF5252",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})
