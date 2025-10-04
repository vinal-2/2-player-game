import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { ConnectFourState } from "./ConnectFourModel"

type ConnectFourViewProps = {
  state: ConnectFourState
  onReset: () => void
  onBack: () => void
}

const ConnectFourView: React.FC<ConnectFourViewProps> = ({ state, onReset, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Connect Four</Text>
    <Text style={styles.subtitle}>Connect Four is temporarily offline while we rebuild the new experience.</Text>
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
    backgroundColor: "#f97316",
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
    borderColor: "#fb923c",
  },
  secondaryText: {
    color: "#fed7aa",
    fontWeight: "600",
  },
})

export default ConnectFourView
