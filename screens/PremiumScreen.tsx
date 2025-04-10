"use client"

import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useAd } from "../contexts/AdContext"
import { useSound } from "../contexts/SoundContext"
import { useAnalytics } from "../contexts/AnalyticsContext"

const PremiumScreen = ({ navigation }) => {
  const { setPremium } = useAd()
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()

  const handlePurchase = () => {
    playSound("win")
    setPremium(true)
    trackEvent("premium_purchase", { type: "lifetime" })
    navigation.navigate("Home")
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            playSound("button-press")
            trackEvent("navigation", { action: "back", from: "premium" })
            navigation.goBack()
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Go Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Image source={require("../assets/images/premium-badge.png")} style={styles.premiumBadge} />

        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>Enjoy an ad-free experience!</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Remove all advertisements</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Unlock exclusive games</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Support future development</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Early access to new games</Text>
          </View>
        </View>

        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={[styles.pricingOption, styles.pricingOptionSelected]}
            onPress={() => {
              playSound("button-press")
              trackEvent("premium_option_selected", { option: "lifetime" })
            }}
          >
            <View style={styles.pricingBadge}>
              <Text style={styles.pricingBadgeText}>Best Value</Text>
            </View>
            <Text style={styles.pricingTitle}>Lifetime</Text>
            <Text style={styles.pricingPrice}>$4.99</Text>
            <Text style={styles.pricingDescription}>One-time payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pricingOption}
            onPress={() => {
              playSound("button-press")
              trackEvent("premium_option_selected", { option: "monthly" })
            }}
          >
            <Text style={styles.pricingTitle}>Monthly</Text>
            <Text style={styles.pricingPrice}>$0.99</Text>
            <Text style={styles.pricingDescription}>Billed monthly</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <LinearGradient
            colors={["#FFD700", "#FFA000"]}
            style={styles.purchaseButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.purchaseButtonText}>Purchase Premium</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Payment will be charged to your account at confirmation of purchase. Subscriptions automatically renew unless
          auto-renew is turned off at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A2E",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  premiumBadge: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 32,
    textAlign: "center",
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: "white",
    marginLeft: 12,
  },
  pricingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  pricingOption: {
    width: "48%",
    backgroundColor: "#16213E",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  pricingOptionSelected: {
    borderColor: "#FFD700",
    position: "relative",
  },
  pricingBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricingBadgeText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    marginTop: 8,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: "#FFFFFF80",
  },
  purchaseButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 16,
  },
  purchaseButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: "#FFFFFF80",
    textAlign: "center",
  },
})

export default PremiumScreen
