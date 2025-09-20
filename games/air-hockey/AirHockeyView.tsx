"use client"

import type React from "react"
import { useEffect, useMemo, useRef } from "react"
import { View, StyleSheet, Animated, Text, TouchableOpacity, ImageBackground, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import type { AirHockeyState } from "./AirHockeyModel"
import type { GameView } from "../../core/GameEngine"
import type { AirHockeyDifficulty } from "./AirHockeyController"
import { useSeasonal } from "../../contexts/SeasonalContext"
import { AssetLoader } from "../../utils/AssetLoader"
import { particleManifest } from "../../core/assets"
import { useSound } from "../../contexts/SoundContext"

interface AirHockeyViewProps {
  state: AirHockeyState
  lastGoal: "player1" | "player2" | null
  mode: "friend" | "bot"
  difficulty: AirHockeyDifficulty
  onDifficultyChange: (difficulty: AirHockeyDifficulty) => void
  onReset: () => void
  onBack: () => void
  player1PanHandlers: any
  player2PanHandlers: any
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

const difficultyLabels: Record<AirHockeyDifficulty, string> = {
  rookie: "Rookie",
  pro: "Pro",
  legend: "Legend",
}

export const AirHockeyView: React.FC<AirHockeyViewProps> & GameView = ({
  state,
  lastGoal,
  mode,
  difficulty,
  onDifficultyChange,
  onReset,
  onBack,
  player1PanHandlers,
  player2PanHandlers,
}) => {
  const { getSeasonalGameBackground } = useSeasonal()
  const { playSound } = useSound()

  const assetLoader = useMemo(() => AssetLoader.getInstance(), [])
  const goalLightSource = useMemo(() => {
    const module = particleManifest["air-hockey-goal-light"]
    return module ? assetLoader.getImage(module) ?? module : null
  }, [assetLoader])
  const puckTrailSource = useMemo(() => {
    const module = particleManifest["air-hockey-puck-trail"]
    return module ? assetLoader.getImage(module) ?? module : null
  }, [assetLoader])

  const player1Position = useRef(
    new Animated.ValueXY({
      x: state.player1Paddle.x - state.player1Paddle.radius,
      y: state.player1Paddle.y - state.player1Paddle.radius,
    }),
  ).current

  const player2Position = useRef(
    new Animated.ValueXY({
      x: state.player2Paddle.x - state.player2Paddle.radius,
      y: state.player2Paddle.y - state.player2Paddle.radius,
    }),
  ).current

  const puckPosition = useRef(
    new Animated.ValueXY({
      x: state.puck.x - state.puck.radius,
      y: state.puck.y - state.puck.radius,
    }),
  ).current

  const goalFlashAnim = useRef(new Animated.Value(0)).current
  const boardPulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    player1Position.setValue({
      x: state.player1Paddle.x - state.player1Paddle.radius,
      y: state.player1Paddle.y - state.player1Paddle.radius,
    })

    player2Position.setValue({
      x: state.player2Paddle.x - state.player2Paddle.radius,
      y: state.player2Paddle.y - state.player2Paddle.radius,
    })

    puckPosition.setValue({
      x: state.puck.x - state.puck.radius,
      y: state.puck.y - state.puck.radius,
    })
  }, [player1Position, player2Position, puckPosition, state])

  useEffect(() => {
    if (lastGoal) {
      goalFlashAnim.setValue(1)
      Animated.timing(goalFlashAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start()

      Animated.sequence([
        Animated.timing(boardPulseAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(boardPulseAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [boardPulseAnim, goalFlashAnim, lastGoal])

  const backgroundImage = useMemo(
    () => getSeasonalGameBackground("air-hockey") || require("../../assets/images/air-hockey-bg.png"),
    [getSeasonalGameBackground],
  )

  const renderDifficultySwitch = () => {
    if (mode !== "bot") {
      return null
    }

    const entries = Object.entries(difficultyLabels) as [AirHockeyDifficulty, string][]

    return (
      <View style={styles.difficultyRow}>
        {entries.map(([level, label]) => {
          const isActive = difficulty === level
          return (
            <TouchableOpacity
              key={`difficulty-${level}`}
              style={[styles.difficultyChip, isActive && styles.difficultyChipActive]}
              onPress={() => {
                playSound("toggle")
                onDifficultyChange(level)
              }}
            >
              <Text style={[styles.difficultyText, isActive && styles.difficultyTextActive]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  return (
    <LinearGradient colors={["#0f172a", "#111827"]} style={styles.container}>
      <View style={styles.scoreBoard}>
        <Animated.View
          style={[styles.scoreCard, lastGoal === "player1" && styles.scoreCardActive]}
        >
          <Text style={styles.scoreLabel}>Player 1</Text>
          <Text style={styles.scoreValue}>{state.scores.player1}</Text>
        </Animated.View>

        <View style={styles.bestOfContainer}>
          <Ionicons name="flag" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.bestOfText}>First to 5</Text>
        </View>

        <Animated.View
          style={[styles.scoreCard, lastGoal === "player2" && styles.scoreCardActive]}
        >
          <Text style={styles.scoreLabel}>{mode === "bot" ? "Bot" : "Player 2"}</Text>
          <Text style={styles.scoreValue}>{state.scores.player2}</Text>
        </Animated.View>
      </View>

      {renderDifficultySwitch()}

      <View style={styles.boardWrapper}>
        <ImageBackground source={backgroundImage} style={styles.boardBackground}>
          {goalLightSource && (
            <AnimatedImage
              pointerEvents="none"
              source={goalLightSource}
              style={[
                styles.goalFlash,
                {
                  opacity: goalFlashAnim,
                  tintColor:
                    lastGoal === "player1"
                      ? "rgba(59,130,246,0.85)"
                      : "rgba(249,115,22,0.85)",
                },
              ]}
              resizeMode="cover"
            />
          )}

          <Animated.View
            style={[
              styles.board,
              {
                transform: [
                  {
                    scale: boardPulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.centerLine} />
            <View style={styles.centerCircle} />

            <Animated.View
              style={[
                styles.paddle,
                styles.player2Paddle,
                {
                  width: state.player2Paddle.radius * 2,
                  height: state.player2Paddle.radius * 2,
                  transform: player2Position.getTranslateTransform(),
                },
              ]}
              {...player2PanHandlers}
            />

            <Animated.View
              style={[
                styles.paddle,
                styles.player1Paddle,
                {
                  width: state.player1Paddle.radius * 2,
                  height: state.player1Paddle.radius * 2,
                  transform: player1Position.getTranslateTransform(),
                },
              ]}
              {...player1PanHandlers}
            />

            <Animated.View
              style={[
                styles.puck,
                {
                  width: state.puck.radius * 2,
                  height: state.puck.radius * 2,
                  transform: puckPosition.getTranslateTransform(),
                },
              ]}
            />
          </Animated.View>
        </ImageBackground>
      </View>

      {state.winner && (
        <View style={styles.winnerBanner}>
          <Text style={styles.winnerText}>
            {state.winner === "player1"
              ? "Player 1 takes the match!"
              : mode === "bot"
                ? "The bot wins!"
                : "Player 2 takes the match!"}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            playSound("round-start")
            onReset()
          }}
        >
          <Ionicons name="reload" size={20} color="white" />
          <Text style={styles.buttonText}>Reset Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            playSound("button-press")
            onBack()
          }}
        >
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  scoreBoard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  scoreCard: {
    width: 110,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 12,
  },
  scoreCardActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  scoreLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  scoreValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  bestOfContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bestOfText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 6,
  },
  difficultyChipActive: {
    backgroundColor: "#38bdf8",
    borderColor: "#38bdf8",
  },
  difficultyText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  difficultyTextActive: {
    color: "white",
  },
  boardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  boardBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    overflow: "hidden",
  },
  goalFlash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  board: {
    width: "90%",
    aspectRatio: 0.64,
    borderRadius: 24,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 12,
    overflow: "hidden",
  },
  centerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  centerCircle: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  paddle: {
    position: "absolute",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  player1Paddle: {
    backgroundColor: "#f97316",
  },
  player2Paddle: {
    backgroundColor: "#38bdf8",
  },
  puckTrail: {
    position: "absolute",
    opacity: 0.8,
  },
  puck: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  winnerBanner: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    alignItems: "center",
  },
  winnerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#38bdf8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8,
  },
})

export default AirHockeyView
