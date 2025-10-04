import React from "react"
import { View, Text, StyleSheet } from "react-native"
import type { PingPongState } from "./PingPongModel"

type PingPongViewProps = {
  state: PingPongState
}

const PingPongView: React.FC<PingPongViewProps> = ({ state }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Ping Pong</Text>
    <Text style={styles.body}>Status: {state.status}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    color: "white",
  },
  body: {
    marginTop: 8,
    color: "#94a3b8",
  },
})

export default PingPongView
