"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../contexts/GameContext"
import { useSound } from "../contexts/SoundContext"
import { useAd } from "../contexts/AdContext"
import { useAnalytics } from "../contexts/AnalyticsContext"

// Import all game components
import AirHockeyScreen from "../games/air-hockey/AirHockeyScreen"
import TicTacToeScreen from "../games/tic-tac-toe/TicTacToeScreen"
import PingPongScreen from "../games/ping-pong/PingPongGame"
import SpinnerWarScreen from "../games/spinner-war/SpinnerWarScreen"

import AdModal from "../components/AdModal"

const GameScreen = ({ route, navigation }) => {
  const { gameId } = route.params
  const { getGameById } = useGame()
  const { playSound } = useSound()
  const { adModalVisible, timeUntilNextAd } = useAd()
  const { trackEvent } = useAnalytics()
  const [game, setGame] = useState(getGameById(gameId))
  const [showInstructions, setShowInstructions] = useState(true)
  const [gameMode, setGameMode] = useState("friend") // "friend" or "bot"

  useEffect(() => {
    trackEvent("screen_view", { screen: "game", game_id: gameId })
    playSound("game-start")

    // Handle back button
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.goBack()
      return true
    })

    return () => {
      backHandler.remove()
    }
  }, [])

  const renderGameComponent = () => {
    switch (game?.id) {
      case "air-hockey":
        return <AirHockeyScreen route={{ params: { mode: gameMode } }} navigation={navigation} />
      case "tic-tac-toe":
        return <TicTacToeScreen route={{ params: { mode: gameMode } }} navigation={navigation} />
      case "ping-pong":
        return <PingPongScreen route={{ params: { mode: gameMode } }} navigation={navigation} />
      case "spinner-war":
        return <SpinnerWarScreen route={{ params: { mode: gameMode } }} navigation={navigation} />
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Game not found!</Text>
          </View>
        )
    }
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found!</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              playSound("button-press")
              navigation.goBack()
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (showInstructions) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: game.backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              playSound("button-press")
              navigation.goBack()
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.gameTitle}>{game.name}</Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Play</Text>
          <Text style={styles.instructionsText}>{game.instructions}</Text>

          <View style={styles.modeSelection}>
            <Text style={styles.modeTitle}>Select Game Mode:</Text>

            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[styles.modeButton, gameMode === "friend" && styles.modeButtonActive]}
                onPress={() => {
                  playSound("button-press")
                  setGameMode("friend")
                }}
              >
                <Ionicons name="people" size={24} color={gameMode === "friend" ? "white" : "#FFFFFF80"} />
                <Text style={[styles.modeButtonText, gameMode === "friend" && styles.modeButtonTextActive]}>
                  Two Players
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeButton, gameMode === "bot" && styles.modeButtonActive]}
                onPress={() => {
                  playSound("button-press")
                  setGameMode("bot")
                }}
              >
                <Ionicons name="hardware-chip" size={24} color={gameMode === "bot" ? "white" : "#FFFFFF80"} />
                <Text style={[styles.modeButtonText, gameMode === "bot" && styles.modeButtonTextActive]}>
                  Play vs Bot
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              playSound("button-press")
              setShowInstructions(false)
              trackEvent("game_start", { game_id: gameId, mode: gameMode })
            }}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: game.backgroundColor }]}>
      {renderGameComponent()}
      <AdModal visible={adModalVisible} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  instructionsContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
    margin: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modeSelection: {
    width: "100%",
    marginBottom: 32,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  modeButtonActive: {
    backgroundColor: "rgba(255, 107, 0, 0.8)",
  },
  modeButtonText: {
    color: "#FFFFFF80",
    fontWeight: "bold",
    marginTop: 8,
  },
  modeButtonTextActive: {
    color: "white",
  },
  startButton: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 20,
    color: "white",
    marginBottom: 16,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "#FF5252",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
})

export default GameScreen
