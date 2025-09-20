"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  ImageBackground,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

import AsyncStorage from "@react-native-async-storage/async-storage"
import type { GameRuntimeProps } from "../../core/gameRuntime"
import { useSound } from "../../contexts/SoundContext"
import { useAnalytics } from "../../contexts/AnalyticsContext"

const { width, height } = Dimensions.get("window")
const BOARD_WIDTH = width * 0.95
const BOARD_HEIGHT = height * 0.6
const PADDLE_WIDTH = BOARD_WIDTH * 0.28
const PADDLE_HEIGHT = 20
const BALL_SIZE = 16
const MAX_SCORE = 11

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))
const MAX_SPIN = 1.6
const easeTowards = (current: number, target: number, factor: number) => current + (target - current) * factor

const PingPongScreen: React.FC<GameRuntimeProps> = ({ gameId, mode, onExit, onEvent }) => {
  const { playSound } = useSound()
  const { trackEvent } = useAnalytics()
  const { getSeasonalGameBackground } = useSeasonal()
  const assetLoader = useMemo(() => AssetLoader.getInstance(), [])
  // crowd ambience cue timer
  const crowdCueTimer = useRef<NodeJS.Timeout | null>(null)

  const crowdBackdropFar = useMemo(
    () => assetLoader.getImage(require("../../assets/images/ping-pong/crowd-layer-far.png")) ?? require("../../assets/images/ping-pong/crowd-layer-far.png"),
    [assetLoader],
  )

  const crowdBackdropNear = useMemo(
    () => assetLoader.getImage(require("../../assets/images/ping-pong/crowd-layer-near.png")) ?? require("../../assets/images/ping-pong/crowd-layer-near.png"),
    [assetLoader],
  )

  const boardSurface = useMemo(
    () => getSeasonalGameBackground("ping-pong") ?? require("../../assets/images/ping-pong/table-spring.png"),
    [getSeasonalGameBackground],
  )


  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameActive, setGameActive] = useState(true)
  const [rallyCount, setRallyCount] = useState(0)
  const [winnerBanner, setWinnerBanner] = useState<string | null>(null)
  const [ambienceEnabled, setAmbienceEnabled] = useState(true)

  useEffect(() => {
    const loadScores = async () => {
      try {
        const stored = await AsyncStorage.getItem(`ping-pong-scores-${gameId}`)
        if (stored) {
          const parsed = JSON.parse(stored) as { player1: number; player2: number }
          if (parsed && typeof parsed.player1 === "number" && typeof parsed.player2 === "number") {
            setScores(parsed)
          }
        }
      } catch (error) {
        // ignore load errors
      }
    }
    loadScores()
  }, [gameId])

  useEffect(() => {
    if (crowdCueTimer.current) {
      clearTimeout(crowdCueTimer.current)
      crowdCueTimer.current = null
    }
    if (!ambienceEnabled) return
    const scheduleCue = () => {
      if (!ambienceEnabled) return
      try {
        playSound(require("../../assets/sounds/round-start.mp3"))
      } catch {}
      const delay = 7000 + Math.floor(Math.random() * 5000)
      crowdCueTimer.current = setTimeout(scheduleCue, delay)
    }
    crowdCueTimer.current = setTimeout(scheduleCue, 6000)
    return () => {
      if (crowdCueTimer.current) {
        clearTimeout(crowdCueTimer.current)
        crowdCueTimer.current = null
      }
    }
  }, [ambienceEnabled, playSound])

  const player1Position = useRef(new Animated.ValueXY({ x: BOARD_WIDTH / 2 - PADDLE_WIDTH / 2, y: BOARD_HEIGHT - 40 })).current
  const player2Position = useRef(new Animated.ValueXY({ x: BOARD_WIDTH / 2 - PADDLE_WIDTH / 2, y: 20 })).current
  const ballPosition = useRef(new Animated.ValueXY({ x: BOARD_WIDTH / 2 - BALL_SIZE / 2, y: BOARD_HEIGHT / 2 - BALL_SIZE / 2 })).current

  const ballVelocity = useRef({ vx: 0, vy: 0 })
  const player1StartX = useRef(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2)
  const player2StartX = useRef(BOARD_WIDTH / 2 - PADDLE_WIDTH / 2)
  const player1Velocity = useRef(0)
  const player2Velocity = useRef(0)
  const spinRef = useRef(0)
  const lastHitRef = useRef<"player1" | "player2" | null>(null)

  const animationRef = useRef<number | null>(null)
  const lastUpdateTime = useRef(Date.now())

  const startGame = () => {
    setWinnerBanner(null)
    setGameActive(true)
    resetBall()
    lastUpdateTime.current = Date.now()
    gameLoop()
  }

  const resetBall = (towardsPlayer: "player1" | "player2" | null = null) => {
    ballPosition.setValue({ x: BOARD_WIDTH / 2 - BALL_SIZE / 2, y: BOARD_HEIGHT / 2 - BALL_SIZE / 2 })
    const angle = Math.random() * Math.PI * 0.6 - Math.PI * 0.3
    const baseSpeed = 5.5
    const dir = towardsPlayer === "player1" ? 1 : towardsPlayer === "player2" ? -1 : Math.random() < 0.5 ? 1 : -1
    ballVelocity.current = {
      vx: Math.cos(angle) * baseSpeed,
      vy: Math.sin(angle) * baseSpeed * dir,
    }
    spinRef.current = 0
    lastHitRef.current = null
  }

  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        player1StartX.current = player1Position.x._value
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = clamp(player1StartX.current + gestureState.dx, 0, BOARD_WIDTH - PADDLE_WIDTH)
        player1Velocity.current = newX - player1Position.x._value
        player1Position.setValue({ x: newX, y: player1Position.y._value })
      },
      onPanResponderRelease: () => {
        player1Velocity.current = 0
      },
    }),
  ).current

  const player2PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === "friend",
      onPanResponderGrant: () => {
        player2StartX.current = player2Position.x._value
      },
      onPanResponderMove: (_, gestureState) => {
        if (mode === "bot") {
          return
        }
        const newX = clamp(player2StartX.current + gestureState.dx, 0, BOARD_WIDTH - PADDLE_WIDTH)
        player2Velocity.current = newX - player2Position.x._value
        player2Position.setValue({ x: newX, y: player2Position.y._value })
      },
      onPanResponderRelease: () => {
        player2Velocity.current = 0
      },
    }),
  ).current

  const botUpdate = (dt: number) => {
    if (mode !== "bot") return

    const targetX = ballPosition.x._value + BALL_SIZE / 2
    const easeFactor = 0.12 + Math.min(Math.abs(ballVelocity.current.vy) / 10, 0.18)
    const newX = clamp(easeTowards(player2Position.x._value, targetX - PADDLE_WIDTH / 2, easeFactor * dt * 60), 0, BOARD_WIDTH - PADDLE_WIDTH)
    player2Velocity.current = newX - player2Position.x._value
    player2Position.setValue({ x: newX, y: player2Position.y._value })
  }

  const gameLoop = () => {
    if (!gameActive) return

    const now = Date.now()
    const delta = (now - lastUpdateTime.current) / 16.6667
    lastUpdateTime.current = now

    botUpdate(delta)

    let newX = ballPosition.x._value + ballVelocity.current.vx * delta
    let newY = ballPosition.y._value + ballVelocity.current.vy * delta

    if (newX <= 0) {
      newX = 0
      ballVelocity.current.vx = Math.abs(ballVelocity.current.vx) * 0.98
    } else if (newX + BALL_SIZE >= BOARD_WIDTH) {
      newX = BOARD_WIDTH - BALL_SIZE
      ballVelocity.current.vx = -Math.abs(ballVelocity.current.vx) * 0.98
    }

    const paddle1Y = player1Position.y._value
    const paddle2Y = player2Position.y._value

    if (newY + BALL_SIZE >= paddle1Y) {
      const paddleX = player1Position.x._value
      if (newX + BALL_SIZE >= paddleX && newX <= paddleX + PADDLE_WIDTH) {
        handlePaddleBounce("player1", paddleX, paddle1Y, newX)
        newY = BOARD_HEIGHT - BALL_SIZE - 2
      } else {
        handleScore("player2")
        return
      }
    } else if (newY <= paddle2Y + PADDLE_HEIGHT) {
      const paddleX = player2Position.x._value
      if (newX + BALL_SIZE >= paddleX && newX <= paddleX + PADDLE_WIDTH) {
        handlePaddleBounce("player2", paddleX, paddle2Y, newX)
        newY = paddle2Y + PADDLE_HEIGHT + 2
      } else {
        handleScore("player1")
        return
      }
    }

    ballVelocity.current.vx += spinRef.current * 0.02
    spinRef.current = clamp(spinRef.current * 0.96, -MAX_SPIN, MAX_SPIN)

    ballVelocity.current.vx = clamp(ballVelocity.current.vx, -9.5, 9.5)
    ballVelocity.current.vy = clamp(ballVelocity.current.vy, -12, 12)

    ballPosition.setValue({ x: newX, y: newY })

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const handlePaddleBounce = (paddle: "player1" | "player2", paddleX: number, paddleY: number, nextBallX: number) => {
    const velocity = paddle === "player1" ? player1Velocity.current : player2Velocity.current
    const offset = nextBallX + BALL_SIZE / 2 - (paddleX + PADDLE_WIDTH / 2)
    const normalizedOffset = clamp(offset / (PADDLE_WIDTH / 2), -1, 1)
    const incomingSpeed = Math.sqrt(ballVelocity.current.vx ** 2 + ballVelocity.current.vy ** 2)

    // Set vertical direction away from paddle, increase a touch for pace
    const verticalBase = Math.max(4.5, incomingSpeed * 0.92)
    ballVelocity.current.vy = (paddle === "player1" ? -verticalBase : verticalBase)

    // Horizontal based on hit position + paddle movement
    const horizontalDelta = normalizedOffset * 5 + velocity * 0.5
    ballVelocity.current.vx = clamp(horizontalDelta, -10.5, 10.5)

    // Spin proportional to hit offset and paddle motion; will decay over time
    spinRef.current = clamp(normalizedOffset * 1.05 + velocity * 0.22, -MAX_SPIN, MAX_SPIN)

    const nextRally = lastHitRef.current && lastHitRef.current !== paddle ? rallyCount + 1 : 1
    lastHitRef.current = paddle
    setRallyCount(nextRally)

    if (nextRally === 6 || nextRally === 10) {
      playSound("round-start")
      trackEvent("ping_pong_rally_milestone", { game: gameId, rally: nextRally })
    } else {
      playSound("paddle-hit")
    }

    onEvent?.({ type: "custom", payload: { action: "rally", count: nextRally } })
  }

  const handleScore = (scorer: "player1" | "player2") => {
    setGameActive(false)
    playSound("score")

    const nextScore = scores[scorer] + 1
    const updatedScores = { ...scores, [scorer]: nextScore }
    setScores(updatedScores)
    AsyncStorage.setItem(`ping-pong-scores-${gameId}`, JSON.stringify(updatedScores)).catch(() => undefined)

    setRallyCount(0)
    trackEvent("ping_pong_score", { game: gameId, scorer, score: nextScore })
    onEvent?.({ type: "score", payload: { scorer, score: nextScore } })

    const opponent = scorer === "player1" ? "player2" : "player1"
    resetBall(opponent)

    setTimeout(() => {
      if (nextScore >= MAX_SCORE) {
        const winnerLabel = scorer === "player1" ? "Player 1" : mode === "bot" ? "Bot" : "Player 2"
        setWinnerBanner(`${winnerLabel} wins the match!`)
        trackEvent("ping_pong_match", { game: gameId, winner: scorer })
        onEvent?.({ type: "game_over", payload: { winner: scorer } })
      } else {
        setGameActive(true)
        gameLoop()
      }
    }, 700)
  }

  useEffect(() => {
    startGame()
    return () => {
      if (crowdCueTimer.current) clearTimeout(crowdCueTimer.current)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleReset = () => {
    setScores({ player1: 0, player2: 0 })
    setRallyCount(0)
    setGameActive(true)
    resetBall()
    trackEvent("ping_pong_reset", { game: gameId })
    startGame()
  }

  const handleBack = () => {
    playSound("button-press")
    onExit()
  }

  return (
    <ImageBackground source={crowdBackdropFar} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCapsule}>
            <Text style={styles.scoreLabel}>Player 1</Text>
            <Text style={styles.scoreValue}>{scores.player1}</Text>
          </View>
          <View style={styles.rallyBadge}>
            <Ionicons name="flash" size={16} color="white" />
            <Text style={styles.rallyText}>{rallyCount} Rally</Text>
          </View>
          <View style={styles.scoreCapsule}>
            <Text style={styles.scoreLabel}>{mode === "bot" ? "Bot" : "Player 2"}</Text>
            <Text style={styles.scoreValue}>{scores.player2}</Text>
          </View>
        </View>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.footerButton} onPress={() => setAmbienceEnabled((v) => !v)}>
            <Ionicons name={ambienceEnabled ? "volume-high" : "volume-mute"} size={18} color="white" />
            <Text style={styles.footerButtonText}>{ambienceEnabled ? "Crowd On" : "Crowd Off"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.boardContainer}>
          <ImageBackground source={boardSurface} style={styles.board} imageStyle={styles.boardImage}>
            <Image source={crowdBackdropNear} style={styles.crowdLayerNear} resizeMode="cover" />
            <View style={styles.net} />

            <Animated.View
              style={[
                styles.paddle,
                styles.player2Paddle,
                {
                  transform: player2Position.getTranslateTransform(),
                  width: PADDLE_WIDTH,
                  height: PADDLE_HEIGHT,
                },
              ]}
              {...player2PanResponder.panHandlers}
            />

            <Animated.View
              style={[
                styles.paddle,
                styles.player1Paddle,
                {
                  transform: player1Position.getTranslateTransform(),
                  width: PADDLE_WIDTH,
                  height: PADDLE_HEIGHT,
                },
              ]}
              {...player1PanResponder.panHandlers}
            />

            <Animated.View
              style={[
                styles.ball,
                { transform: ballPosition.getTranslateTransform(), width: BALL_SIZE, height: BALL_SIZE },
              ]}
            />
          </ImageBackground>
        </View>

        {winnerBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{winnerBanner}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleReset}>
            <Ionicons name="reload" size={18} color="white" />
            <Text style={styles.footerButtonText}>New Match</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={handleBack}>
            <Ionicons name="home" size={18} color="white" />
            <Text style={styles.footerButtonText}>Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  scoreCapsule: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  scoreValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  rallyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(163, 230, 53, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rallyText: {
    marginLeft: 6,
    color: "white",
    fontWeight: "700",
  },
  boardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: "rgba(15, 118, 110, 0.85)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  boardImage: {
    borderRadius: 20,
  },
  crowdLayerNear: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
    opacity: 0.85,
  },
  net: {
    position: "absolute",
    top: BOARD_HEIGHT / 2 - 2,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  paddle: {
    position: "absolute",
    borderRadius: 12,
  },
  player1Paddle: {
    bottom: 24,
    backgroundColor: "#f97316",
  },
  player2Paddle: {
    top: 24,
    backgroundColor: "#38bdf8",
  },
  ball: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: BALL_SIZE / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  banner: {
    marginHorizontal: 24,
    backgroundColor: "rgba(15,23,42,0.85)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  bannerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  footerButtonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 8,
  },
})

export default PingPongScreen

