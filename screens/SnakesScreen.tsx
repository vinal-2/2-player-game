"use client"

import React from "react"
import { View, Text, StyleSheet } from "react-native"

const SnakesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Snakes has moved! Launch Snakes Duel from the game carousel.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#111827",
  },
  text: {
    color: "#cbd5f5",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
})

export default SnakesScreen
