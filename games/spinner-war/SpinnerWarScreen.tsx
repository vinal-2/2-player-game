"use client"

import { useEffect } from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const SpinnerWarScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()

  useEffect(() => {
    playSound("game-start")
    trackEvent("game_start", { game_id: gameId, mode })
    onEvent?.({ type: "custom", payload: { action: "spinner_war_placeholder" } })
  }, [gameId, mode, onEvent, playSound, trackEvent])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Spinner War</Text>
        <Text style={styles.body}>Battle upgrades are still in progress. We’ll bring the spinners back soon!</Text>
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
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#eff6ff",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#bfdbfe",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default SpinnerWarScreen
