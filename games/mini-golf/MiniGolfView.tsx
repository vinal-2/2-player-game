import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { MiniGolfState } from "./MiniGolfModel"

type MiniGolfViewProps = {
  state: MiniGolfState
  onReset: () => void
  onBack: () => void
}

const MiniGolfView: React.FC<MiniGolfViewProps> = ({ state, onReset, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Mini Golf</Text>
    <Text style={styles.subtitle}>The mini golf course is getting resurfaced. Please check back later!</Text>
    <Text style={styles.status}>Status: {state.status}</Text>
    {state.winner && <Text style={styles.status}>Winner: {state.winner}</Text>}

    <TouchableOpacity style={styles.primaryButton} onPress={onReset}>
      <Text style={styles.primaryText}>Reset Placeholder</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
      <Text style={styles.secondaryText}>Back to Games</Text>
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#38bdf8",
  },
  primaryText: {
    color: "#0f172a",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  secondaryText: {
    color: "#38bdf8",
    fontWeight: "600",
  },
})

export default MiniGolfView
