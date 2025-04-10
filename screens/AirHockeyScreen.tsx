"use client"

import { useState, useEffect, useRef } from "react"
import { View, StyleSheet, PanResponder, Animated, Text, Dimensions, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")
const BOARD_WIDTH = width * 0.95
const BOARD_HEIGHT = height * 0.6
const PADDLE_SIZE = 50
const PUCK_SIZE = 30
const GOAL_WIDTH = BOARD_WIDTH * 0.4

const AirHockeyScreen = ({ route, navigation }) => {
  const { mode } = route.params
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameActive, setGameActive] = useState(true)

  const puckPosition = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PUCK_SIZE / 2,
      y: BOARD_HEIGHT / 2 - PUCK_SIZE / 2,
    }),
  ).current

  const puckVelocity = useRef({ x: 0, y: 0 })

  const player1Position = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_SIZE / 2,
      y: BOARD_HEIGHT - PADDLE_SIZE * 1.5,
    }),
  ).current

  const player2Position = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_SIZE / 2,
      y: PADDLE_SIZE / 2,
    }),
  ).current

  const animationRef = useRef(null)

  // Setup pan responder for player 1 paddle
  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newX = player1Position.x._value + gestureState.dx
        let newY = player1Position.y._value + gestureState.dy

        // Limit to bottom half of the board for player 1
        newX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_SIZE))
        newY = Math.max(BOARD_HEIGHT / 2, Math.min(newY, BOARD_HEIGHT - PADDLE_SIZE))

        player1Position.setValue({ x: newX, y: newY })
      },
    }),
  ).current

  // Setup pan responder for player 2 paddle (when in friend mode)
  const player2PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (mode === "bot") return

        let newX = player2Position.x._value + gestureState.dx
        let newY = player2Position.y._value + gestureState.dy

        // Limit to top half of the board for player 2
        newX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_SIZE))
        newY = Math.max(0, Math.min(newY, BOARD_HEIGHT / 2 - PADDLE_SIZE))

        player2Position.setValue({ x: newX, y: newY })
      },
    }),
  ).current

  // Game loop
  useEffect(() => {
    startGame()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setGameActive(true)
    resetPuck()
    gameLoop()
  }

  const resetPuck = () => {
    puckPosition.setValue({
      x: BOARD_WIDTH / 2 - PUCK_SIZE / 2,
      y: BOARD_HEIGHT / 2 - PUCK_SIZE / 2,
    })

    // Add random initial velocity
    const angle = Math.random() * Math.PI * 2
    const speed = 3
    puckVelocity.current = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    }
  }

  const gameLoop = () => {
    if (!gameActive) return

    // Update puck position based on velocity
    let newX = puckPosition.x._value + puckVelocity.current.x
    let newY = puckPosition.y._value + puckVelocity.current.y

    // Wall collisions
    if (newX <= 0 || newX >= BOARD_WIDTH - PUCK_SIZE) {
      puckVelocity.current.x *= -1
      newX = newX <= 0 ? 0 : BOARD_WIDTH - PUCK_SIZE
    }

    // Goal check (top and bottom)
    if (newY <= 0) {
      // Check if it's in the goal area
      if (
        newX + PUCK_SIZE / 2 >= (BOARD_WIDTH - GOAL_WIDTH) / 2 &&
        newX + PUCK_SIZE / 2 <= (BOARD_WIDTH + GOAL_WIDTH) / 2
      ) {
        // Player 1 scored
        handleGoal("player1")
        return
      } else {
        puckVelocity.current.y *= -1
        newY = 0
      }
    } else if (newY >= BOARD_HEIGHT - PUCK_SIZE) {
      // Check if it's in the goal area
      if (
        newX + PUCK_SIZE / 2 >= (BOARD_WIDTH - GOAL_WIDTH) / 2 &&
        newX + PUCK_SIZE / 2 <= (BOARD_WIDTH + GOAL_WIDTH) / 2
      ) {
        // Player 2 scored
        handleGoal("player2")
        return
      } else {
        puckVelocity.current.y *= -1
        newY = BOARD_HEIGHT - PUCK_SIZE
      }
    }

    // Collision with paddles
    checkPaddleCollision(player1Position, "player1")
    checkPaddleCollision(player2Position, "player2")

    // Move puck
    puckPosition.setValue({ x: newX, y: newY })

    // Simple bot AI
    if (mode === "bot") {
      updateBotPaddle()
    }

    // Apply friction
    puckVelocity.current.x *= 0.99
    puckVelocity.current.y *= 0.99

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const checkPaddleCollision = (paddlePosition, player) => {
    const paddleX = paddlePosition.x._value
    const paddleY = paddlePosition.y._value
    const puckX = puckPosition.x._value
    const puckY = puckPosition.y._value

    // Check if puck collides with paddle
    if (
      puckX < paddleX + PADDLE_SIZE &&
      puckX + PUCK_SIZE > paddleX &&
      puckY < paddleY + PADDLE_SIZE &&
      puckY + PUCK_SIZE > paddleY
    ) {
      // Calculate collision response
      const paddleCenterX = paddleX + PADDLE_SIZE / 2
      const paddleCenterY = paddleY + PADDLE_SIZE / 2
      const puckCenterX = puckX + PUCK_SIZE / 2
      const puckCenterY = puckY + PUCK_SIZE / 2

      // Direction from paddle to puck
      let dx = puckCenterX - paddleCenterX
      let dy = puckCenterY - paddleCenterY

      // Normalize
      const length = Math.sqrt(dx * dx + dy * dy)
      if (length > 0) {
        dx /= length
        dy /= length
      }

      // Set new velocity based on collision angle
      const speed = Math.sqrt(puckVelocity.current.x ** 2 + puckVelocity.current.y ** 2)
      const newSpeed = Math.max(speed, 5) // Minimum speed after collision

      puckVelocity.current.x = dx * newSpeed
      puckVelocity.current.y = dy * newSpeed
    }
  }

  const updateBotPaddle = () => {
    // Simple bot AI: move toward the puck when it's in top half
    if (puckPosition.y._value < BOARD_HEIGHT / 2) {
      const botX = player2Position.x._value
      const puckCenterX = puckPosition.x._value + PUCK_SIZE / 2 - PADDLE_SIZE / 2

      // Move toward the puck with a delay (for easier gameplay)
      const newX = botX + (puckCenterX - botX) * 0.05
      const limitedX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_SIZE))

      player2Position.setValue({
        x: limitedX,
        y: player2Position.y._value,
      })
    }
  }

  const handleGoal = (scorer) => {
    setGameActive(false)

    // Update scores
    setScores((prev) => ({
      ...prev,
      [scorer]: prev[scorer] + 1,
    }))

    // Check if game is over
    if (scores[scorer] + 1 >= 5) {
      const winner = scorer === "player1" ? "Player 1" : mode === "friend" ? "Player 2" : "Bot"
      Alert.alert("Game Over", `${winner} wins the game!`, [{ text: "New Game", onPress: resetGame }], {
        cancelable: false,
      })
    } else {
      // Continue after goal
      setTimeout(() => {
        resetPuck()
        setGameActive(true)
        gameLoop()
      }, 1000)
    }
  }

  const resetGame = () => {
    setScores({ player1: 0, player2: 0 })
    resetPuck()
    setGameActive(true)
    gameLoop()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Player 1</Text>
          <Text style={styles.scoreValue}>{scores.player1}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>{mode === "friend" ? "Player 2" : "Bot"}</Text>
          <Text style={styles.scoreValue}>{scores.player2}</Text>
        </View>
      </View>

      <View style={styles.board}>
        {/* Top goal */}
        <View style={[styles.goal, styles.topGoal]} />

        {/* Bottom goal */}
        <View style={[styles.goal, styles.bottomGoal]} />

        {/* Center line */}
        <View style={styles.centerLine} />

        {/* Player 2 paddle (top) */}
        <Animated.View
          style={[styles.paddle, styles.player2Paddle, { transform: player2Position.getTranslateTransform() }]}
          {...player2PanResponder.panHandlers}
        />

        {/* Player 1 paddle (bottom) */}
        <Animated.View
          style={[styles.paddle, styles.player1Paddle, { transform: player1Position.getTranslateTransform() }]}
          {...player1PanResponder.panHandlers}
        />

        {/* Puck */}
        <Animated.View style={[styles.puck, { transform: puckPosition.getTranslateTransform() }]} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Ionicons name="reload" size={20} color="white" />
          <Text style={styles.buttonText}>Reset Game</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
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
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  goal: {
    position: "absolute",
    width: GOAL_WIDTH,
    height: 20,
    backgroundColor: "#1565C0",
    left: (BOARD_WIDTH - GOAL_WIDTH) / 2,
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
    top: BOARD_HEIGHT / 2 - 2,
    width: BOARD_WIDTH,
    height: 4,
    backgroundColor: "white",
    opacity: 0.4,
  },
  paddle: {
    width: PADDLE_SIZE,
    height: PADDLE_SIZE,
    borderRadius: PADDLE_SIZE / 2,
    position: "absolute",
  },
  player1Paddle: {
    backgroundColor: "#FF5252",
  },
  player2Paddle: {
    backgroundColor: "#4CAF50",
  },
  puck: {
    width: PUCK_SIZE,
    height: PUCK_SIZE,
    borderRadius: PUCK_SIZE / 2,
    backgroundColor: "#FFC107",
    position: "absolute",
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

export default AirHockeyScreen
