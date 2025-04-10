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
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import SoundContext from "../contexts/SoundContext"
import ConfettiCannon from "react-native-confetti-cannon"

const { width, height } = Dimensions.get("window")
const ARENA_SIZE = Math.min(width * 0.9, height * 0.6)
const SPINNER_SIZE = 60

const SpinnerWarScreen = ({ route, navigation }) => {
  const { mode } = route.params
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameActive, setGameActive] = useState(true)
  const [winner, setWinner] = useState(null)
  const { playSound } = useContext(SoundContext)
  const confettiRef = useRef(null)

  const player1Position = useRef(
    new Animated.ValueXY({
      x: ARENA_SIZE / 4 - SPINNER_SIZE / 2,
      y: ARENA_SIZE / 2 - SPINNER_SIZE / 2,
    }),
  ).current

  const player2Position = useRef(
    new Animated.ValueXY({
      x: (ARENA_SIZE * 3) / 4 - SPINNER_SIZE / 2,
      y: ARENA_SIZE / 2 - SPINNER_SIZE / 2,
    }),
  ).current

  const player1Rotation = useRef(new Animated.Value(0)).current
  const player2Rotation = useRef(new Animated.Value(0)).current

  // Start spinner rotations
  useEffect(() => {
    Animated.loop(
      Animated.timing(player1Rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start()

    Animated.loop(
      Animated.timing(player2Rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start()

    playSound(require("../assets/sounds/game-start.mp3"))
  }, [])

  // Setup pan responder for player 1 spinner
  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => gameActive,
      onMoveShouldSetPanResponder: () => gameActive,
      onPanResponderMove: (evt, gestureState) => {
        let newX = player1Position.x._value + gestureState.dx
        let newY = player1Position.y._value + gestureState.dy

        // Keep spinner within arena bounds
        newX = Math.max(0, Math.min(newX, ARENA_SIZE - SPINNER_SIZE))
        newY = Math.max(0, Math.min(newY, ARENA_SIZE - SPINNER_SIZE))

        player1Position.setValue({ x: newX, y: newY })
        checkCollision()
      },
    }),
  ).current

  // Setup pan responder for player 2 spinner
  const player2PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => gameActive && mode === "friend",
      onMoveShouldSetPanResponder: () => gameActive && mode === "friend",
      onPanResponderMove: (evt, gestureState) => {
        if (mode === "bot") return

        let newX = player2Position.x._value + gestureState.dx
        let newY = player2Position.y._value + gestureState.dy

        // Keep spinner within arena bounds
        newX = Math.max(0, Math.min(newX, ARENA_SIZE - SPINNER_SIZE))
        newY = Math.max(0, Math.min(newY, ARENA_SIZE - SPINNER_SIZE))

        player2Position.setValue({ x: newX, y: newY })
        checkCollision()
      },
    }),
  ).current

  // Bot movement
  useEffect(() => {
    if (mode === "bot" && gameActive) {
      const botInterval = setInterval(() => {
        moveBotSpinner()
      }, 50)

      return () => clearInterval(botInterval)
    }
  }, [gameActive, mode])

  const moveBotSpinner = () => {
    // Bot strategy: Move toward player with some randomness
    const botX = player2Position.x._value
    const botY = player2Position.y._value
    const playerX = player1Position.x._value
    const playerY = player1Position.y._value

    // Calculate direction to player
    let dx = playerX - botX
    let dy = playerY - botY

    // Add some randomness
    dx += (Math.random() - 0.5) * 20
    dy += (Math.random() - 0.5) * 20

    // Normalize and scale
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length > 0) {
      dx = (dx / length) * 3 // Bot speed
      dy = (dy / length) * 3
    }

    // Update position
    let newX = botX + dx
    let newY = botY + dy

    // Keep within bounds
    newX = Math.max(0, Math.min(newX, ARENA_SIZE - SPINNER_SIZE))
    newY = Math.max(0, Math.min(newY, ARENA_SIZE - SPINNER_SIZE))

    player2Position.setValue({ x: newX, y: newY })
    checkCollision()
  }

  const checkCollision = () => {
    if (!gameActive) return

    const p1x = player1Position.x._value + SPINNER_SIZE / 2
    const p1y = player1Position.y._value + SPINNER_SIZE / 2
    const p2x = player2Position.x._value + SPINNER_SIZE / 2
    const p2y = player2Position.y._value + SPINNER_SIZE / 2

    // Calculate distance between spinners
    const distance = Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2))

    // Check if spinners are colliding
    if (distance < SPINNER_SIZE) {
      playSound(require("../assets/sounds/collision.mp3"))

      // Calculate push direction
      const angle = Math.atan2(p2y - p1y, p2x - p1x)
      const pushForce = 15

      // Push player 2
      const newX2 = player2Position.x._value + Math.cos(angle) * pushForce
      const newY2 = player2Position.y._value + Math.sin(angle) * pushForce

      // Check if pushed out of bounds
      if (newX2 < 0 || newX2 > ARENA_SIZE - SPINNER_SIZE || newY2 < 0 || newY2 > ARENA_SIZE - SPINNER_SIZE) {
        // Player 1 wins
        handleWin("player1")
        return
      }

      // Push player 1 in opposite direction
      const newX1 = player1Position.x._value - Math.cos(angle) * pushForce
      const newY1 = player1Position.y._value - Math.sin(angle) * pushForce

      // Check if pushed out of bounds
      if (newX1 < 0 || newX1 > ARENA_SIZE - SPINNER_SIZE || newY1 < 0 || newY1 > ARENA_SIZE - SPINNER_SIZE) {
        // Player 2 wins
        handleWin("player2")
        return
      }

      // Apply the push
      player1Position.setValue({ x: newX1, y: newY1 })
      player2Position.setValue({ x: newX2, y: newY2 })
    }
  }

  const handleWin = (player) => {
    setGameActive(false)
    setWinner(player)

    playSound(require("../assets/sounds/win.mp3"))
    if (confettiRef.current) {
      confettiRef.current.start()
    }

    // Update scores
    setScores((prev) => ({
      ...prev,
      [player]: prev[player] + 1,
    }))

    // Check if game is over
    if (scores[player] + 1 >= 5) {
      const winnerName = player === "player1" ? "Player 1" : mode === "friend" ? "Player 2" : "Bot"
      setTimeout(() => {
        Alert.alert("Game Over", `${winnerName} wins the match!`, [{ text: "New Match", onPress: resetMatch }], {
          cancelable: false,
        })
      }, 1000)
    } else {
      setTimeout(() => {
        resetRound()
      }, 1500)
    }
  }

  const resetRound = () => {
    // Reset positions
    player1Position.setValue({
      x: ARENA_SIZE / 4 - SPINNER_SIZE / 2,
      y: ARENA_SIZE / 2 - SPINNER_SIZE / 2,
    })

    player2Position.setValue({
      x: (ARENA_SIZE * 3) / 4 - SPINNER_SIZE / 2,
      y: ARENA_SIZE / 2 - SPINNER_SIZE / 2,
    })

    setWinner(null)
    setGameActive(true)
    playSound(require("../assets/sounds/round-start.mp3"))
  }

  const resetMatch = () => {
    setScores({ player1: 0, player2: 0 })
    resetRound()
  }

  return (
    <ImageBackground source={require("../assets/images/spinner-war-bg.png")} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <ConfettiCannon ref={confettiRef} count={100} origin={{ x: width / 2, y: 0 }} autoStart={false} fadeOut />

        <View style={styles.scoreBoard}>
          <View style={[styles.scoreContainer, winner === "player1" && styles.winnerScoreContainer]}>
            <Text style={styles.scoreLabel}>Player 1</Text>
            <Text style={styles.scoreValue}>{scores.player1}</Text>
          </View>
          <View style={styles.roundsContainer}>
            <Text style={styles.roundsText}>Best of 5</Text>
          </View>
          <View style={[styles.scoreContainer, winner === "player2" && styles.winnerScoreContainer]}>
            <Text style={styles.scoreLabel}>{mode === "friend" ? "Player 2" : "Bot"}</Text>
            <Text style={styles.scoreValue}>{scores.player2}</Text>
          </View>
        </View>

        <View style={styles.arenaContainer}>
          <View style={styles.arena}>
            {/* Player 1 spinner */}
            <Animated.View
              style={[
                styles.spinner,
                styles.player1Spinner,
                {
                  transform: [
                    ...player1Position.getTranslateTransform(),
                    {
                      rotate: player1Rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
              {...player1PanResponder.panHandlers}
            >
              <View style={styles.spinnerInner} />
            </Animated.View>

            {/* Player 2 spinner */}
            <Animated.View
              style={[
                styles.spinner,
                styles.player2Spinner,
                {
                  transform: [
                    ...player2Position.getTranslateTransform(),
                    {
                      rotate: player2Rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
              {...player2PanResponder.panHandlers}
            >
              <View style={styles.spinnerInner} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>Drag your spinner to push your opponent out of the arena!</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetRound}>
            <Ionicons name="reload" size={20} color="white" />
            <Text style={styles.buttonText}>Reset Round</Text>
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
    alignItems: "center",
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
  winnerScoreContainer: {
    backgroundColor: "rgba(255, 193, 7, 0.8)",
    borderWidth: 2,
    borderColor: "#FF6B00",
  },
  roundsContainer: {
    alignItems: "center",
  },
  roundsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  arenaContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  arena: {
    width: ARENA_SIZE,
    height: ARENA_SIZE,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#FF6B00",
    overflow: "hidden",
    position: "relative",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  player1Spinner: {
    backgroundColor: "#FF5252",
  },
  player2Spinner: {
    backgroundColor: "#2196F3",
  },
  spinnerInner: {
    width: SPINNER_SIZE * 0.6,
    height: SPINNER_SIZE * 0.6,
    borderRadius: (SPINNER_SIZE * 0.6) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  instructionsContainer: {
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    marginVertical: 10,
  },
  instructionsText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
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

export default SpinnerWarScreen
