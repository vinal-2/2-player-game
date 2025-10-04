"use client"

import React from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSound } from "../contexts/SoundContext"

const PremiumScreen: React.FC = () => {
  const { playSound } = useSound()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Premium Upgrades</Text>
        <Text style={styles.body}>Premium perks are being redesigned. We will surface the new offer soon.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => playSound("button-press")}
        >
          <Text style={styles.buttonText}>Stay tuned</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(236,72,153,0.12)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fdf4ff",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#fbcfe8",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ec4899",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default PremiumScreen
