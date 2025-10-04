"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useGame } from "../contexts/GameContext"
import { useSound } from "../contexts/SoundContext"
import { useAd } from "../contexts/AdContext"
import { useAnalytics } from "../contexts/AnalyticsContext"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../navigation/types"

import { getGameComponent } from "../core/gameRegistry"

import AdModal from "../components/AdModal"
import type { GameMode, GameRuntimeEvent } from "../core/gameRuntime"
import type { GameCatalogEntry } from "../core/gameCatalog"

const DEFAULT_MODE: GameMode = "friend"

type GameScreenProps = NativeStackScreenProps<RootStackParamList, "Game">

const GameScreen = ({ route, navigation }: GameScreenProps): JSX.Element => {
  const { gameId } = route.params
  const { getGameById } = useGame()
  const { playSound } = useSound()
  const { adModalVisible } = useAd()
  const { trackEvent } = useAnalytics()
  const [game, setGame] = useState<GameCatalogEntry | undefined>(undefined)
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_MODE)
  const [showInstructions, setShowInstructions] = useState(true)
  const instructionsVisibleRef = useRef(showInstructions)

  useEffect(() => {
    const entry = getGameById(gameId)
    setGame(entry)
    setShowInstructions(true)
  }, [gameId, getGameById])

  useEffect(() => {
    instructionsVisibleRef.current = showInstructions
  }, [showInstructions])

  const handleGameEvent = useCallback(
    (event: GameRuntimeEvent) => {
      trackEvent("game_event", {
        game_id: gameId,
        event: event.type,
        ...(event.payload ?? {}),
      })
    },
    [gameId, trackEvent],
  )

  const handleExitGame = useCallback(() => {
    playSound("button-press")
    trackEvent("game_exit", { game_id: gameId })
    setShowInstructions(true)
  }, [gameId, playSound, trackEvent])

  const handleStartGame = useCallback(() => {
    playSound("button-press")
    trackEvent("game_start", { game_id: gameId, mode: gameMode })
    setShowInstructions(false)
  }, [gameId, gameMode, playSound, trackEvent])

  useEffect(() => {
    trackEvent("screen_view", { screen: "game", game_id: gameId })
    playSound("game-start")

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!instructionsVisibleRef.current) {
        handleExitGame()
        return true
      }

      navigation.goBack()
      return true
    })

    return () => {
      backHandler.remove()
    }
  }, [gameId, handleExitGame, navigation, playSound, trackEvent])

  const isPlayable = game?.status === "playable" && game?.componentId

  const SelectedComponent = useMemo(() => {
    if (!game?.componentId) return undefined
    return getGameComponent(game.componentId)
  }, [game])

  const supportedModes = game?.supportedModes ?? ["local"]
  const canPlayBot = supportedModes.includes("bot")

  useEffect(() => {
    if (!canPlayBot && gameMode === "bot") {
      setGameMode("friend")
    }
  }, [canPlayBot, gameMode])

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found!</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              playSound("button-press")
              navigation.goBack()
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderModeButton = (mode: GameMode, label: string, icon: keyof typeof Ionicons.glyphMap) => {
    const isActive = gameMode === mode
    const disabled = mode === "bot" && !canPlayBot

    return (
      <TouchableOpacity
        style={[styles.modeButton, isActive && styles.modeButtonActive, disabled && styles.modeButtonDisabled]}
        activeOpacity={disabled ? 1 : 0.8}
        disabled={disabled}
        onPress={() => {
          playSound("button-press")
          setGameMode(mode)
        }}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isActive ? "white" : "#FFFFFF80"}
        />
        <Text
          style={[styles.modeButtonText, isActive && styles.modeButtonTextActive, disabled && styles.modeButtonTextDisabled]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderInstructions = () => {
    if (!isPlayable || !SelectedComponent) {
      return (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{game.name}</Text>
          <Text style={styles.instructionsText}>{game.description}</Text>
          <View style={styles.comingSoonTag}>
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
          <TouchableOpacity style={[styles.startButton, styles.startButtonDisabled]} activeOpacity={1}>
            <Text style={[styles.startButtonText, styles.startButtonTextDisabled]}>In Development</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to Play</Text>
        <Text style={styles.instructionsText}>{game.instructions}</Text>

        <View style={styles.modeSelection}>
          <Text style={styles.modeTitle}>Select Game Mode:</Text>
          <View style={styles.modeButtons}>
            {renderModeButton("friend", "Two Players", "people")}
            {renderModeButton("bot", "VS Bot", "hardware-chip")}
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: game.backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (showInstructions) {
              playSound("button-press")
              navigation.goBack()
            } else {
              handleExitGame()
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.gameTitle}>{game.name}</Text>

        <View style={{ width: 24 }} />
      </View>

      {showInstructions ? (
        renderInstructions()
      ) : (
        SelectedComponent && (
          <SelectedComponent
            gameId={game.id}
            mode={gameMode}
            onExit={handleExitGame}
            onEvent={handleGameEvent}
          />
        )
      )}

      <AdModal visible={adModalVisible} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  gameTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  instructionsContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
    margin: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modeSelection: {
    width: "100%",
    marginBottom: 32,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  modeButtonActive: {
    backgroundColor: "rgba(255, 107, 0, 0.85)",
  },
  modeButtonDisabled: {
    opacity: 0.4,
  },
  modeButtonText: {
    color: "#FFFFFF80",
    fontWeight: "bold",
    marginTop: 8,
  },
  modeButtonTextActive: {
    color: "white",
  },
  modeButtonTextDisabled: {
    color: "#FFFFFF80",
  },
  startButton: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  startButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
  },
  errorText: {
    fontSize: 20,
    color: "white",
    marginBottom: 16,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "#FF5252",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  comingSoonTag: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  comingSoonText: {
    color: "white",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
})

export default GameScreen





