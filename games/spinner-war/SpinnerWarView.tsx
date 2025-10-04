import React from "react"
import { View, Text, StyleSheet } from "react-native"
import type { SpinnerWarState } from "./SpinnerWarModel"

type SpinnerWarViewProps = {
  state: SpinnerWarState
}

const SpinnerWarView: React.FC<SpinnerWarViewProps> = ({ state }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Spinner War</Text>
    <Text style={styles.body}>Status: {state.status}</Text>
    {state.winner && <Text style={styles.body}>Winner: {state.winner}</Text>}
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    color: "white",
  },
  body: {
    marginTop: 8,
    color: "#cbd5f5",
  },
})

export default SpinnerWarView
