import React from "react"
import { View, Text, StyleSheet } from "react-native"
import type { AirHockeyState } from "./AirHockeyModel"

type AirHockeyViewProps = {
  state: AirHockeyState
  width: number
  height: number
}

const AirHockeyView: React.FC<AirHockeyViewProps> = ({ state, width, height }) => {
  const scaleX = width / state.boardWidth
  const scaleY = height / state.boardHeight

  const scalePosition = (pos: { x: number; y: number }) => ({
    x: pos.x * scaleX,
    y: pos.y * scaleY,
  })

  return (
    <View style={[styles.board, { width, height }] }>
      <View style={styles.centerLine} />
      {(Object.keys(state.paddles) as ("player1" | "player2")[]).map((player) => {
        const paddle = state.paddles[player]
        const scaled = scalePosition(paddle.position)
        const radius = paddle.radius * Math.min(scaleX, scaleY)
        return (
          <View
            key={player}
            style={[
              styles.paddle,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                left: scaled.x - radius,
                top: scaled.y - radius,
                backgroundColor: player === "player1" ? "#22c55e" : "#3b82f6",
              },
            ]}
          />
        )
      })}
      <View
        style={(() => {
          const scaled = scalePosition(state.puck.position)
          const radius = state.puck.radius * Math.min(scaleX, scaleY)
          return {
            position: "absolute" as const,
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            left: scaled.x - radius,
            top: scaled.y - radius,
            backgroundColor: "#facc15",
          }
        })()}
      />
      <View style={styles.scoreOverlay}>
        <Text style={styles.scoreText}>P1 {state.scores.player1}</Text>
        <Text style={styles.scoreText}>P2 {state.scores.player2}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    overflow: "hidden",
  },
  centerLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(226,232,240,0.15)",
  },
  paddle: {
    position: "absolute",
  },
  scoreOverlay: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  scoreText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
})

export default AirHockeyView
