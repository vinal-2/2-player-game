"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

import { useGame } from "../contexts/GameContext"
import { useSound } from "../contexts/SoundContext"
import { useAd } from "../contexts/AdContext"
import { useSeasonal } from "../contexts/SeasonalContext"
import { useAnalytics } from "../contexts/AnalyticsContext"
import AdModal from "../components/AdModal"
import { palette } from "../core/theme"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width / 3 - 18
const FEATURE_WIDTH = width * 0.72
const FEATURE_HEIGHT = FEATURE_WIDTH * 0.55
const TUTORIAL_STORAGE_KEY = "home-tutorial-dismissed"

const CATEGORY_ICONS: Record<string, number> = {
  board: require("../assets/images/home/categories/board.png"),
  puzzle: require("../assets/images/home/categories/puzzle.png"),
  reflex: require("../assets/images/home/categories/reflex.png"),
  sports: require("../assets/images/home/categories/sports.png"),
}

const DEFAULT_CATEGORY_ICON = require("../assets/images/ui/icon-star-128.png")


const HomeScreen = ({ navigation }) => {
  const { games, recentlyPlayed, addToRecentlyPlayed, getGameById } = useGame()
  const { playSound } = useSound()
  const { isPremium, adModalVisible, timeUntilNextAd } = useAd()
  const { seasonalTheme, activeEvent, currentSeason, getHomeArtwork } = useSeasonal()
  const { trackEvent } = useAnalytics()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredGames, setFilteredGames] = useState(games)
  const [tutorialVisible, setTutorialVisible] = useState(false)
  const bounceAnim = useRef(new Animated.Value(1)).current
  const homeArtwork = useMemo(() => getHomeArtwork(), [getHomeArtwork])

  const playableGames = useMemo(
    () => games.filter((game) => game.status === "playable"),
    [games],
  )

  const featuredGames = useMemo(() => {
    const newOrPlayables = playableGames.filter((game) => game.isNew)
    if (newOrPlayables.length > 0) {
      return newOrPlayables.slice(0, 5)
    }
    return playableGames.slice(0, 5)
  }, [playableGames])

  const categoryChips = useMemo(() => {
    const set = new Set<string>()
    games.forEach((game) => {
      if (game.category) {
        set.add(game.category)
      }
    })
    return ["all", ...Array.from(set)]
  }, [games])

  useEffect(() => {
    trackEvent("screen_view", { screen: "home" })
  }, [trackEvent])

  useEffect(() => {
    const loadTutorialState = async () => {
      try {
        const value = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY)
        if (!value) {
          setTutorialVisible(true)
        }
      } catch (error) {
        setTutorialVisible(true)
      }
    }
    loadTutorialState()
  }, [])

  useEffect(() => {
    const newFiltered = games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || game.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredGames(newFiltered)
  }, [games, searchQuery, selectedCategory])

  useEffect(() => {
    let isMounted = true
    let animationTimeout: ReturnType<typeof setTimeout> | undefined

    const animate = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.06,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isMounted) {
          return
        }
        animationTimeout = setTimeout(animate, 3600)
      })
    }

    animate()

    return () => {
      isMounted = false
      if (animationTimeout) {
        clearTimeout(animationTimeout)
      }
      bounceAnim.stopAnimation()
      bounceAnim.setValue(1)
    }
  }, [bounceAnim])

  const handleGamePress = useCallback(
    (game) => {
      const isLocked = game.status !== "playable"
      const isPremiumLocked = game.isPremium && !isPremium

      if (isLocked || isPremiumLocked) {
        playSound("invalid-move")
        trackEvent("game_locked", { game: game.id, reason: isLocked ? "status" : "premium" })
        if (isPremiumLocked) {
          navigation.navigate("Premium")
        }
        return
      }

      playSound("button-press")
      void addToRecentlyPlayed(game.id)
      trackEvent("game_selected", { game: game.id })
      navigation.navigate("Game", { gameId: game.id })
    },
    [addToRecentlyPlayed, isPremium, navigation, playSound, trackEvent],
  )

  const handleDismissTutorial = useCallback(async () => {
    setTutorialVisible(false)
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, "seen")
    } catch (error) {
      // ignore persistence errors
    }
  }, [])

  const renderFeaturedCard = ({ item }) => (
    <Pressable
      style={styles.featureCard}
      onPress={() => handleGamePress(item)}
    >
      <LinearGradient
        colors={[item.backgroundColor, palette.midnight]}
        style={styles.featureGradient}
      >
        <View style={styles.featureTop}
        >
          <Text style={styles.featureBadge}>{item.isNew ? "New" : "Featured"}</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </View>
        <View style={styles.featureIconRow}
        >
          <View style={[styles.featureIconCircle, { backgroundColor: "rgba(255,255,255,0.15)" }]}
          >
            <Ionicons name={item.icon} size={42} color="white" />
          </View>
        </View>
        <Text style={styles.featureTitle}>{item.name}</Text>
        <Text style={styles.featureDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.featureFooter}
        >
          <Text style={styles.featureModeText}>
            {item.supportedModes.includes("bot") ? "VS Bot" : "Local"}
          </Text>
          <Ionicons name="game-controller" size={18} color="white" />
        </View>
      </LinearGradient>
    </Pressable>
  )

  const renderGameItem = ({ item }) => {
    const isLocked = item.status !== "playable"
    const isPremiumLocked = item.isPremium && !isPremium
    const disabled = isLocked || isPremiumLocked
    const badgeLabel = isLocked
      ? "Coming Soon"
      : isPremiumLocked
        ? "Premium"
        : null

    return (
      <TouchableOpacity
        style={styles.gameItem}
        onPress={() => handleGamePress(item)}
        activeOpacity={disabled ? 1 : 0.75}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.gameIconContainer,
            {
              backgroundColor: item.backgroundColor,
              transform: [{ scale: bounceAnim }],
            },
            disabled && styles.gameIconDisabled,
          ]}
        >
          <Ionicons name={item.icon} size={ITEM_WIDTH * 0.44} color="white" />
          {badgeLabel && (
            <View style={styles.gameBadge}>
              <Text style={styles.gameBadgeText}>{badgeLabel}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.gameName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderRecentCard = (gameId) => {
    const game = getGameById(gameId)
    if (!game) return null

    return (
      <Pressable
        key={`recent-${gameId}`}
        style={styles.recentCard}
        onPress={() => handleGamePress(game)}
      >
        <View style={[styles.recentIcon, { backgroundColor: game.backgroundColor }]}
        >
          <Ionicons name={game.icon} size={24} color="white" />
        </View>
        <View style={styles.recentInfo}
        >
          <Text style={styles.recentTitle}>{game.name}</Text>
          <Text style={styles.recentSubtitle} numberOfLines={1}>
            {game.supportedModes.includes("bot") ? "VS Bot" : "Local multiplayer"}
          </Text>
        </View>
        <Ionicons name="play" size={20} color="white" />
      </Pressable>
    )
  }

  return (
    <LinearGradient colors={[palette.midnight, palette.deepBlue]} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Image source={require("../assets/images/logo.png")} style={styles.logo} />
              <View>
                <Text style={styles.title}>Two Player Games</Text>
                <Text style={styles.subtitle}>Arcade fun for friends & family</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                playSound("button-press")
                navigation.navigate("Settings")
              }}
            >
              <Ionicons name="settings" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {activeEvent && (
            <LinearGradient
              colors={[activeEvent.themeColor, "rgba(255,255,255,0.1)"]}
              style={styles.eventBanner}
            >
              <Ionicons name={activeEvent.icon || "sparkles"} size={22} color="white" />
              <Text style={[styles.eventText, { color: "white" }]}
              >
                {activeEvent.name}: {activeEvent.description}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </LinearGradient>
          )}

          <View style={styles.heroSection}>
            <ImageBackground
              source={homeArtwork.banner}
              style={styles.heroBackground}
              imageStyle={styles.heroBackgroundImage}
            >
              <Image source={homeArtwork.hero} style={styles.heroArtwork} resizeMode="cover" />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTag}>{currentSeason.toUpperCase()} Spotlight</Text>
                <Text style={styles.heroTitle}>Fresh seasonal boards & FX ready to play</Text>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search games"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => {
                playSound("button-press")
                navigation.navigate("Premium")
              }}
            >
              <Ionicons name="sparkles" size={18} color={palette.gold} />
              <Text style={styles.premiumButtonText}>
                {isPremium ? "Premium Active" : "Go Premium"}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredGames}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `feature-${item.id}`}
            renderItem={renderFeaturedCard}
            contentContainerStyle={styles.featureList}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={FEATURE_WIDTH + 16}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categoryChips.map((category) => {
              const isActive = selectedCategory === category
              return (
                <Pressable
                  key={`category-${category}`}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => {
                    playSound("toggle")
                    setSelectedCategory(category)
                  }}
                >
                  <View style={styles.categoryChipContent}>
                    {category === "all" ? (
                      <Ionicons name="apps" size={16} color="white" />
                    ) : (
                      <Image
                        source={CATEGORY_ICONS[category.toLowerCase()] ?? DEFAULT_CATEGORY_ICON}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {category === "all" ? "All Games" : category.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>

          {recentlyPlayed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Played</Text>
                <Ionicons name="time" size={18} color="rgba(255,255,255,0.6)" />
              </View>
              <View>
                {recentlyPlayed.slice(0, 4).map(renderRecentCard)}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Game Library</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredGames.length} {filteredGames.length === 1 ? "title" : "titles"}
              </Text>
            </View>
            <View style={styles.gamesList}>
              {filteredGames.map((game) => (
                <View key={game.id}>{renderGameItem({ item: game })}</View>
              ))}
            </View>
          </View>

          <Text style={styles.adCountdown}>Next ad in {timeUntilNextAd}s</Text>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={tutorialVisible} transparent animationType="fade">
        <View style={styles.tutorialOverlay}>
          <View style={styles.tutorialCard}>
            <Text style={styles.tutorialTitle}>Welcome!</Text>
            <Text style={styles.tutorialBody}>
              Swipe through featured battles, pick a category, or invite a friend. Tap a card to jump straight into the arena.
            </Text>
            <TouchableOpacity style={styles.tutorialButton} onPress={handleDismissTutorial}>
              <Text style={styles.tutorialButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AdModal visible={adModalVisible} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 42,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  eventBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  eventText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "white",
    fontSize: 15,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  premiumButtonText: {
    marginLeft: 6,
    color: palette.gold,
    fontWeight: "700",
    fontSize: 13,
  },
  featureList: {
    paddingLeft: 20,
    paddingBottom: 18,
  },
  featureCard: {
    width: FEATURE_WIDTH,
    height: FEATURE_HEIGHT,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  featureGradient: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
  },
  featureTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  featureIconRow: {
    alignItems: "center",
  },
  featureIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  featureDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  featureFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featureModeText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    fontSize: 12,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  heroBackground: {
    borderRadius: 24,
    overflow: "hidden",
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroArtwork: {
    width: "100%",
    height: 160,
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  heroTag: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  heroTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  categoriesRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  categoryChipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 18,
    height: 18,
  },
  categoryText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "white",
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    color: "white",
    fontWeight: "700",
  },
  recentSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
  },
  gamesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameItem: {
    width: ITEM_WIDTH,
    marginBottom: 18,
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
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.24)",
  },
  gameIconDisabled: {
    opacity: 0.45,
  },
  gameBadge: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gameName: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  adCountdown: {
    marginTop: 18,
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  tutorialCard: {
    backgroundColor: "rgba(26,26,46,0.95)",
    borderRadius: 20,
    padding: 24,
    width: "85%",
  },
  tutorialTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  tutorialBody: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  tutorialButton: {
    alignSelf: "flex-end",
    backgroundColor: palette.accentOrange,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  tutorialButtonText: {
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
})

export default HomeScreen
