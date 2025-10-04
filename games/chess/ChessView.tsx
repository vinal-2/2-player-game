import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { ChessState } from "./ChessModel"

type ChessViewProps = {
  state: ChessState
  onReset: () => void
  onBack: () => void
}

const ChessView: React.FC<ChessViewProps> = ({ state, onReset, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chess</Text>
      <Text style={styles.subtitle}>We are rebuilding the full chess experience.</Text>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#111827",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    textAlign: "center",
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    color: "#cbd5f5",
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#6366f1",
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4c1d95",
  },
  secondaryText: {
    color: "#c4b5fd",
    fontWeight: "600",
  },
})

export default ChessView
