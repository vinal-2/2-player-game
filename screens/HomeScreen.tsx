"use client"

import React from "react"
import { SafeAreaView, StyleSheet, Text, View } from "react-native"

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Two Player Games</Text>
        <Text style={styles.body}>The home carousel is being rebuilt. Launch games directly from the library once they return.</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(59,130,246,0.12)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#cbd5f5",
    lineHeight: 22,
  },
})

export default HomeScreen
