import React from "react"
import { View, Text, StyleSheet } from "react-native"

type TicTacToeViewProps = {
  message?: string
}

const TicTacToeView: React.FC<TicTacToeViewProps> = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Tic Tac Toe</Text>
    <Text style={styles.body}>{message ?? "Placeholder view"}</Text>
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

export default TicTacToeView
