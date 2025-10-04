"use client"

import { useEffect } from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const TicTacToeScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()

  useEffect(() => {
    playSound("game-start")
    trackEvent("game_start", { game_id: gameId, mode })
    onEvent?.({ type: "custom", payload: { action: "tic_tac_toe_placeholder" } })
  }, [gameId, mode, onEvent, playSound, trackEvent])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Tic Tac Toe</Text>
        <Text style={styles.body}>We are upgrading Tic Tac Toe with smarter AI and polished FX. Stay tuned!</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            playSound("button-press")
            onExit()
          }}
        >
          <Text style={styles.buttonText}>Back to Games</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(34,197,94,0.12)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#cbd5f5",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#22c55e",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "600",
  },
})

export default TicTacToeScreen
