"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AssetLoader } from "../utils/AssetLoader"
import { useAnalytics } from "../contexts/AnalyticsContext"

interface SplashScreenProps {
  onFinish: () => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { trackEvent } = useAnalytics()
  const [progress, setProgress] = useState(0)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.8))[0]

  useEffect(() => {
    // Track splash screen view
    trackEvent("splash_screen_view")

    // Start fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Load assets
    const loadAssets = async () => {
      const assetLoader = AssetLoader.getInstance()

      try {
        // Preload assets in chunks to show progress
        await assetLoader.preloadFonts()
        setProgress(0.3)

        await assetLoader.preloadImages()
        setProgress(0.6)

        await assetLoader.preloadSounds()
        setProgress(1)

        // Wait a bit to show the completed progress
        setTimeout(() => {
          // Fade out
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            onFinish()
            trackEvent("splash_screen_complete")
          })
        }, 500)
      } catch (error) {
        console.error("Error loading assets:", error)
        // Even if there's an error, continue to the app
        onFinish()
      }
    }

    loadAssets()
  }, [])

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={styles.background} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Two Player Games</Text>
        <Text style={styles.subtitle}>Fun for Kids!</Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF80",
    marginBottom: 40,
  },
  progressContainer: {
    width: 200,
    height: 6,
    backgroundColor: "#FFFFFF20",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B00",
  },
})

export default SplashScreen
