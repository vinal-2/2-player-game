"use client"

import React from "react"
import { SafeAreaView, StyleSheet, Text } from "react-native"

const PlaceholderScreen: React.FC<{ title: string }> = ({ title }) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.text}>{title} legacy screen removed. Launch the new runtime from the main menu.</Text>
  </SafeAreaView>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
    padding: 24,
  },
  text: {
    color: "#e2e8f0",
    fontSize: 16,
    textAlign: "center",
  },
})

export default PlaceholderScreen
