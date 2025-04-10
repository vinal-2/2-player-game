"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useGame } from "../contexts/GameContext"
import { useSound } from "../contexts/SoundContext"
import { useAd } from "../contexts/AdContext"
import { useSeasonal } from "../contexts/SeasonalContext"
import { useAnalytics } from "../contexts/AnalyticsContext"
import AdModal from "../components/AdModal"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width / 3 - 16
const ITEM_HEIGHT = ITEM_WIDTH

const HomeScreen = ({ navigation }) => {
  const { games, recentlyPlayed, addToRecentlyPlayed, getGameById } = useGame()
  const { playSound } = useSound()
  const { isPremium, adModalVisible, timeUntilNextAd } = useAd()
  const { seasonalTheme, activeEvent } = useSeasonal()
  const { trackEvent } = useAnalytics()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGames, setFilteredGames] = useState(games)
  const [bounceAnim] = useState(new Animated.Value(1))

  useEffect(() => {
    // Track screen view
    trackEvent("screen_view", { screen: "home" })

    // Filter games based on search query
    if (searchQuery.trim() === "") {
      setFilteredGames(games)
    } else {
      const filtered = games.filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredGames(filtered)
    }
  }, [searchQuery, games])

  useEffect(() => {
    // Start bounce animation for game icons
    const startBounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.bounce,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Restart animation after a delay
        setTimeout(startBounceAnimation, 3000)
      })
    }

    startBounceAnimation()

    return () => {
      bounceAnim.setValue(1)
    }
  }, [])

  const handleGamePress = (game) => {
    playSound("button-press")
    addToRecentlyPlayed(game.id)
    trackEvent("game_selected", { game: game.id })
    navigation.navigate("Game", { gameId: game.id })
  }

  const renderGameItem = ({ item }) => (
    <TouchableOpacity style={styles.gameItem} onPress={() => handleGamePress(item)} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.gameIconContainer,
          {
            backgroundColor: item.backgroundColor,
            transform: [{ scale: bounceAnim }],
          },
        ]}
      >
        <Ionicons name={item.icon} size={ITEM_WIDTH * 0.4} color="white" />
      </Animated.View>
      <Text style={styles.gameName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  const renderRecentlyPlayedSection = () => {
    if (recentlyPlayed.length === 0) return null

    return (
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <FlatList
          data={recentlyPlayed.map((id) => getGameById(id)).filter(Boolean)}
          renderItem={renderGameItem}
          keyExtractor={(item) => `recent-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentList}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      <LinearGradient
        colors={[
          activeEvent ? activeEvent.themeColor : seasonalTheme.primaryColor,
          activeEvent ? activeEvent.themeColor + "CC" : seasonalTheme.secondaryColor,
        ]}
        style={styles.background}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          <View>
            <Text style={styles.title}>Two Player Games</Text>
            <Text style={styles.subtitle}>Fun for Kids!</Text>
          </View>
        </View>

        <View style={styles.headerButtons}>
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => {
                playSound("button-press")
                trackEvent("premium_button_click")
                navigation.navigate("Premium")
              }}
            >
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.premiumButtonText}>Premium</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              playSound("button-press")
              trackEvent("settings_button_click")
              navigation.navigate("Settings")
            }}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#FFFFFF80" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search games..."
          placeholderTextColor="#FFFFFF80"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text)
            if (text.length > 0) {
              trackEvent("search", { query: text })
            }
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#FFFFFF80" />
          </TouchableOpacity>
        )}
      </View>

      {activeEvent && (
        <View style={[styles.eventBanner, { backgroundColor: activeEvent.themeColor + "33" }]}>
          <Ionicons name={activeEvent.icon} size={24} color={activeEvent.themeColor} />
          <Text style={[styles.eventText, { color: activeEvent.themeColor }]}>
            {activeEvent.name}: {activeEvent.description}
          </Text>
        </View>
      )}

      {renderRecentlyPlayedSection()}

      <Text style={styles.sectionTitle}>All Games</Text>

      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gamesList}
      />

      <AdModal visible={adModalVisible} />
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF80",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  premiumButtonText: {
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 12,
  },
  settingsButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16213E",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "white",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  recentSection: {
    marginBottom: 8,
  },
  recentList: {
    paddingHorizontal: 12,
  },
  gamesList: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  gameItem: {
    width: ITEM_WIDTH,
    marginHorizontal: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  gameIconContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF20",
  },
  gameName: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  eventBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  eventText: {
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
  },
})

export default HomeScreen
