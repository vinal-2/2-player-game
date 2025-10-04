"use client"

import { useEffect } from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAnalytics } from "../../contexts/AnalyticsContext"
import { useSound } from "../../contexts/SoundContext"
import type { GameRuntimeProps } from "../../core/gameRuntime"

const PingPongScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { trackEvent } = useAnalytics()
  const { playSound } = useSound()

  useEffect(() => {
    playSound("game-start")
    trackEvent("game_start", { game_id: gameId, mode })
    onEvent?.({ type: "custom", payload: { action: "ping_pong_placeholder" } })
  }, [gameId, mode, onEvent, playSound, trackEvent])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ping Pong</Text>
        <Text style={styles.body}>Spin mechanics and crowd FX are being reworked. We’ll reopen the table soon.</Text>
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
    backgroundColor: "#082f49",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(59,130,246,0.15)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e0f2fe",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#bae6fd",
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

export default PingPongScreen
