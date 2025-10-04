"use client"

import React from "react"
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useSound } from "../contexts/SoundContext"

const SettingsScreen: React.FC = () => {
  const { playSound } = useSound()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body}>Settings are being rebuilt to fit the new platform structure.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => playSound("button-press")}
        >
          <Text style={styles.buttonText}>Check back soon</Text>
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
    backgroundColor: "rgba(148,163,184,0.12)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#cbd5f5",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#64748b",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
})

export default SettingsScreen
