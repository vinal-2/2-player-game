import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"

import type { PenaltyKicksState } from "./PenaltyKicksModel"

interface PenaltyKicksViewProps {
  state: PenaltyKicksState
  onBack: () => void
  onReset: () => void
  onShoot: () => void
  onSave: () => void
}

const PenaltyKicksView: React.FC<PenaltyKicksViewProps> = ({ state, onBack, onReset, onShoot, onSave }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Penalty Kicks (coming soon)</Text>
      <Text style={styles.subTitle}>Shots: {state.shotsTaken} / {state.maxShots}</Text>
      <Text style={styles.score}>Shooter {state.score.shooter} : {state.score.keeper} Keeper</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={onShoot}>
          <Text style={styles.buttonText}>Register Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onSave}>
          <Text style={styles.buttonText}>Register Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.footerButton} onPress={onReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  subTitle: {
    color: "#cbd5f5",
    marginBottom: 8,
  },
  score: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#22c55e",
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#ef4444",
  },
  footerRow: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(148, 163, 184, 0.35)",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "700",
  },
})

export default PenaltyKicksView
