"use client"

import { useState, useEffect, useRef, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  ImageBackground,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"
import SoundContext from "../contexts/SoundContext"
import ConfettiCannon from "react-native-confetti-cannon"

const { width, height } = Dimensions.get("window")
const BOARD_WIDTH = width * 0.95
const BOARD_HEIGHT = height * 0.6
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 20
const BALL_SIZE = 15



const PingPongScreen = ({ route, navigation }) => {
  const { mode } = route.params
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameActive, setGameActive] = useState(true)
  const { playSound } = useContext(SoundContext)
  const confettiRef = useRef(null)

  const ballPosition = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - BALL_SIZE / 2,
      y: BOARD_HEIGHT / 2 - BALL_SIZE / 2,
    }),
  ).current

  const ballVelocity = useRef({ x: 3, y: 5 })

  const player1Position = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: BOARD_HEIGHT - PADDLE_HEIGHT * 1.5,
    }),
  ).current

  const player2Position = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: PADDLE_HEIGHT / 2,
    }),
  ).current

  const animationRef = useRef(null)
  const lastUpdateTime = useRef(Date.now())

  // Setup pan responder for player 1 paddle
  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newX = player1Position.x._value + gestureState.dx
        newX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_WIDTH))
        player1Position.setValue({ x: newX, y: player1Position.y._value })
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
        newX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_WIDTH))
        player2Position.setValue({ x: newX, y: player2Position.y._value })
      },
    }),
  ).current

  // Game loop
  useEffect(() => {
    playSound(require("../assets/sounds/game-start.mp3"))
    startGame()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startGame = () => {
    setGameActive(true)
    resetBall()
    gameLoop()
  }

  const resetBall = () => {
    ballPosition.setValue({
      x: BOARD_WIDTH / 2 - BALL_SIZE / 2,
      y: BOARD_HEIGHT / 2 - BALL_SIZE / 2,
    })

    // Add random initial velocity
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4 // -45 to 45 degrees
    const speed = 5
    ballVelocity.current = {
      x: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      y: Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    }
  }

  const gameLoop = () => {
    if (!gameActive) return

    const now = Date.now()
    const deltaTime = now - lastUpdateTime.current
    lastUpdateTime.current = now

    // Limit to 60fps equivalent
    if (deltaTime < 16) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // Update ball position based on velocity
    let newX = ballPosition.x._value + ballVelocity.current.x
    let newY = ballPosition.y._value + ballVelocity.current.y

    // Wall collisions (left and right)
    if (newX <= 0 || newX >= BOARD_WIDTH - BALL_SIZE) {
      ballVelocity.current.x *= -1
      newX = newX <= 0 ? 0 : BOARD_WIDTH - BALL_SIZE
      playSound(require("../assets/sounds/wall-hit.mp3"))
    }

    // Top and bottom collisions (scoring)
    if (newY <= 0) {
      // Check if it hits player 2's paddle
      const paddleX = player2Position.x._value
      if (newX + BALL_SIZE >= paddleX && newX <= paddleX + PADDLE_WIDTH) {
        // Bounce off paddle
        ballVelocity.current.y *= -1
        newY = 0

        // Adjust x velocity based on where ball hit the paddle
        const hitPosition = newX + BALL_SIZE / 2 - (paddleX + PADDLE_WIDTH / 2)
        ballVelocity.current.x = hitPosition * 0.2

        playSound(require("../assets/sounds/paddle-hit.mp3"))
      } else {
        // Player 1 scored
        handleScore("player1")
        return
      }
    } else if (newY >= BOARD_HEIGHT - BALL_SIZE) {
      // Check if it hits player 1's paddle
      const paddleX = player1Position.x._value
      if (newX + BALL_SIZE >= paddleX && newX <= paddleX + PADDLE_WIDTH) {
        // Bounce off paddle
        ballVelocity.current.y *= -1
        newY = BOARD_HEIGHT - BALL_SIZE

        // Adjust x velocity based on where ball hit the paddle
        const hitPosition = newX + BALL_SIZE / 2 - (paddleX + PADDLE_WIDTH / 2)
        ballVelocity.current.x = hitPosition * 0.2

        playSound(require("../assets/sounds/paddle-hit.mp3"))
      } else {
        // Player 2 scored
        handleScore("player2")
        return
      }
    }

    // Move ball
    ballPosition.setValue({ x: newX, y: newY })

    // Simple bot AI
    if (mode === "bot") {
      updateBotPaddle()
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const updateBotPaddle = () => {
    // Bot difficulty - adjust these values to make the bot easier or harder
    const reactionSpeed = 0.1 // Higher = faster reaction (0-1)
    const accuracy = 0.8 // Higher = more accurate (0-1)

    // Predict where the ball will be
    if (ballVelocity.current.y < 0) {
      // Ball is moving toward bot
      const botX = player2Position.x._value
      const ballX = ballPosition.x._value

      // Add some randomness to make the bot imperfect
      const targetX = ballX - PADDLE_WIDTH / 2 + Math.random() * PADDLE_WIDTH * (1 - accuracy)

      // Move toward the predicted position
      const newX = botX + (targetX - botX) * reactionSpeed
      const limitedX = Math.max(0, Math.min(newX, BOARD_WIDTH - PADDLE_WIDTH))

      player2Position.setValue({
        x: limitedX,
        y: player2Position.y._value,
      })
    }
  }

  const handleScore = (scorer) => {
    setGameActive(false)
    playSound(require("../assets/sounds/score.mp3"))

    // Update scores
    setScores((prev) => ({
      ...prev,
      [scorer]: prev[scorer] + 1,
    }))

    // Check if game is over
    if (scores[scorer] + 1 >= 5) {
      playSound(require("../assets/sounds/win.mp3"))
      if (confettiRef.current) {
        confettiRef.current.start()
      }

      const winner = scorer === "player1" ? "Player 1" : mode === "friend" ? "Player 2" : "Bot"
      setTimeout(() => {
        Alert.alert("Game Over", `${winner} wins the game!`, [{ text: "New Game", onPress: resetGame }], {
          cancelable: false,
        })
      }, 1000)
    } else {
      // Continue after score
      setTimeout(() => {
        resetBall()
        setGameActive(true)
        gameLoop()
      }, 1000)
    }
  }

  const resetGame = () => {
    setScores({ player1: 0, player2: 0 })
    resetBall()
    setGameActive(true)
    playSound(require("../assets/sounds/game-start.mp3"))
    gameLoop()
  }

  return (
    <ImageBackground source={require("../assets/images/ping-pong-bg.png")} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <ConfettiCannon ref={confettiRef} count={100} origin={{ x: width / 2, y: 0 }} autoStart={false} fadeOut />

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

          {/* Ball */}
          <Animated.View style={[styles.ball, { transform: ballPosition.getTranslateTransform() }]} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Ionicons name="reload" size={20} color="white" />
            <Text style={styles.buttonText}>Reset Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              playSound(require("../assets/sounds/button-press.mp3"))
              navigation.goBack()
            }}
          >
            <Ionicons name="home" size={20} color="white" />
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
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
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: "rgba(33, 150, 243, 0.8)",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    borderRadius: 10,
    position: "absolute",
  },
  player1Paddle: {
    backgroundColor: "#FF5252",
    bottom: 10,
  },
  player2Paddle: {
    backgroundColor: "#4CAF50",
    top: 10,
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: "#FFC107",
    position: "absolute",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
    elevation: 3,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default PingPongScreen
