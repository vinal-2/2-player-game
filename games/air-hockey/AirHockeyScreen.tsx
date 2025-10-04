"use client"

import { useEffect } from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const AirHockeyScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()

  useEffect(() => {
    trackEvent("game_start", { game_id: gameId, mode })
    playSound("game-start")
    onEvent?.({ type: "custom", payload: { action: "air_hockey_placeholder" } })
  }, [gameId, mode, onEvent, playSound, trackEvent])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Air Hockey</Text>
        <Text style={styles.body}>The new Air Hockey experience is under construction. Thanks for your patience!</Text>
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
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(15, 118, 110, 0.15)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
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
    backgroundColor: "#14b8a6",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default AirHockeyScreen
