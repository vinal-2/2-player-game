import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { DotsAndBoxesState } from "./DotsAndBoxesModel"

type DotsAndBoxesViewProps = {
  state: DotsAndBoxesState
  onReset: () => void
  onBack: () => void
}

const DotsAndBoxesView: React.FC<DotsAndBoxesViewProps> = ({ state, onReset, onBack }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Dots & Boxes</Text>
    <Text style={styles.subtitle}>This classic is on the bench while we rebuild the new version.</Text>
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
    backgroundColor: "#1f2937",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
  },
  primaryText: {
    color: "black",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  secondaryText: {
    color: "#fbbf24",
    fontWeight: "600",
  },
})

export default DotsAndBoxesView
