"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useSound } from "../contexts/SoundContext"
import { useAd } from "../contexts/AdContext"
import { useSeasonal } from "../contexts/SeasonalContext"
import { useAnalytics } from "../contexts/AnalyticsContext"
import { LinearGradient } from "expo-linear-gradient"
import * as Linking from 'expo-linking';

const SettingsScreen = ({ navigation }) => {
  const { isSoundEnabled, isMusicEnabled, toggleSound, toggleMusic, playSound } = useSound()
  const { isPremium, setPremium } = useAd()
  const { isSeasonalThemeEnabled, toggleSeasonalTheme, activeEvent } = useSeasonal()
  const { trackEvent } = useAnalytics()

  const [settings, setSettings] = useState({
    soundEffects: isSoundEnabled,
    music: isMusicEnabled,
    vibration: true,
    notifications: true,
    darkMode: false,
    autoSave: true,
    seasonalTheme: isSeasonalThemeEnabled,
  })

  // Update the toggleSetting function to handle seasonal theme
  const toggleSetting = (key) => {
    playSound(require("../assets/sounds/toggle.mp3"))
    trackEvent("setting_toggle", { setting: key, value: !settings[key] })

    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

    if (key === "soundEffects") {
      toggleSound()
    } else if (key === "music") {
      toggleMusic()
    } else if (key === "seasonalTheme") {
      toggleSeasonalTheme()
    }
  }

  const handlePremiumPress = () => {
    playSound(require("../assets/sounds/button-press.mp3"))
    trackEvent("premium_button_click", { screen: "settings" })

    if (isPremium) {
      Alert.alert("Premium Active", "You already have premium access! Enjoy your ad-free experience.", [{ text: "OK" }])
    } else {
      navigation.navigate("Premium")
    }
  }

  const handleContactPress = () => {
    playSound(require("../assets/sounds/button-press.mp3"))
    trackEvent("about_item_click", { item: "contact_us" });
    Linking.openURL(`mailto:support@happypenguins.com?subject=Support Request`);
  };




  const renderSettingItem = (icon, title, description, settingKey) => {
    return (
      <Animated.View
        style={styles.settingItem}
        entering={Animated.spring({
          velocity: 3,
          stiffness: 80,
          damping: 15,
        })}
      >
        <View style={styles.settingInfo}>
          <View style={[styles.settingIconContainer, settings[settingKey] && { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name={icon} size={24} color={settings[settingKey] ? "#FF6B00" : "#999"} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={settings[settingKey]}
          onValueChange={() => toggleSetting(settingKey)}
          trackColor={{ false: "#D1D1D1", true: "#FFCC80" }}
          thumbColor={settings[settingKey] ? "#FF6B00" : "#F4F4F4"}
        />
      </Animated.View>
    )
  }

  return (
    <ImageBackground source={require("../assets/images/settings-bg.png")} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.premiumBanner}>
            <LinearGradient
              colors={isPremium ? ["#FFD700", "#FFA000"] : ["#FF6B00", "#FF3D00"]}
              style={styles.premiumBannerGradient}
            >
              <View style={styles.premiumContent}>
                <View>
                  <Text style={styles.premiumTitle}>{isPremium ? "Premium Active" : "Go Premium"}</Text>
                  <Text style={styles.premiumDescription}>
                    {isPremium ? "Enjoy your ad-free experience!" : "Remove ads and support development"}
                  </Text>
                </View>
                {!isPremium && (
                  <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumPress}>
                    <Text style={styles.premiumButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.8)", "rgba(255, 107, 0, 0.6)"]} style={styles.sectionHeader}>
              <Ionicons name="volume-high" size={22} color="#FFF" />
              <Text style={styles.sectionTitle}>Sound & Feedback</Text>
            </LinearGradient>

            {renderSettingItem("musical-notes-outline", "Sound Effects", "Play sounds during gameplay", "soundEffects")}

            {renderSettingItem("musical-note-outline", "Background Music", "Play music while in the app", "music")}

            {renderSettingItem("pulse-outline", "Vibration", "Vibrate on game events", "vibration")}
          </View>

          <View style={styles.section}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.8)", "rgba(255, 107, 0, 0.6)"]} style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={22} color="#FFF" />
              <Text style={styles.sectionTitle}>Appearance</Text>
            </LinearGradient>

            {renderSettingItem("moon-outline", "Dark Mode", "Use dark colors for the app theme", "darkMode")}
            {renderSettingItem(
              "color-palette-outline",
              "Seasonal Themes",
              activeEvent ? `Enable ${activeEvent.name} theme` : "Enable seasonal themes and events",
              "seasonalTheme",
            )}
          </View>

          <View style={styles.section}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.8)", "rgba(255, 107, 0, 0.6)"]} style={styles.sectionHeader}>
              <Ionicons name="settings" size={22} color="#FFF" />
              <Text style={styles.sectionTitle}>General</Text>
            </LinearGradient>

            {renderSettingItem(
              "notifications-outline",
              "Notifications",
              "Receive game reminders and updates",
              "notifications",
            )}

            {renderSettingItem("save-outline", "Auto-Save", "Automatically save game progress", "autoSave")}
          </View>

          <View style={styles.section}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.8)", "rgba(255, 107, 0, 0.6)"]} style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={22} color="#FFF" />
              <Text style={styles.sectionTitle}>About</Text>
            </LinearGradient>

            <TouchableOpacity
              style={styles.aboutItem}
              onPress={() => {
                playSound(require("../assets/sounds/button-press.mp3"))
                trackEvent("about_item_click", { item: "app_version" })
                Alert.alert("About", "Kids Two Player Games\nVersion 1.0.0\n© 2023 All Rights Reserved")
              }}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="information-circle-outline" size={24} color="#FF6B00" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>App Version</Text>
                  <Text style={styles.settingDescription}>v1.0.0</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutItem}
              onPress={() => {
                playSound(require("../assets/sounds/button-press.mp3"))
                trackEvent("about_item_click", { item: "privacy_policy" })
                Alert.alert(
                  "Privacy Policy",
                  "This app does not collect any personal data from users. We respect your privacy.",
                )
              }}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#FF6B00" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>Read our privacy policy</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutItem}
              onPress={() => {
                playSound(require("../assets/sounds/button-press.mp3"))
                trackEvent("about_item_click", { item: "rate_app" })
                Alert.alert("Rate Us", "If you enjoy our app, please take a moment to rate it!", [
                  { text: "Not Now" },
                  { text: "Rate App", onPress: () => trackEvent("rate_app_click") },
                ])
              }}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="star-outline" size={24} color="#FF6B00" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Rate This App</Text>
                  <Text style={styles.settingDescription}>Tell us what you think</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutItem}
              onPress={handleContactPress}
            >
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="mail-outline" size={24} color="#FF6B00" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Contact Us</Text>
                  <Text style={styles.settingDescription}>Get in touch for support</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            




          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            playSound(require("../assets/sounds/button-press.mp3"))
            trackEvent("navigation", { action: "back_to_home", from: "settings" })
            navigation.goBack()
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backButtonText}>Back to Games</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  premiumBanner: {
    margin: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  premiumBannerGradient: {
    padding: 20,
  },
  premiumContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  premiumDescription: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: "#FF6B00",
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    margin: 15,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  aboutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#777",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    elevation: 3,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
})

export default SettingsScreen
