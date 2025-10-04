import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { Direction, SnakeId, SnakesDuelState } from "./SnakesDuelModel"

type SnakesDuelViewProps = {
  state: SnakesDuelState
  mode: "friend" | "bot"
  onChangeDirection: (player: SnakeId, direction: Direction) => void
  onResetRound: () => void
  onExit: () => void
}

const GRID_CELL_SIZE = 18

const SnakesDuelView: React.FC<SnakesDuelViewProps> = ({ state, mode, onChangeDirection, onResetRound, onExit }) => {
  const renderGrid = () => {
    const cells: React.ReactElement[] = []

    for (let y = 0; y < state.gridHeight; y++) {
      for (let x = 0; x < state.gridWidth; x++) {
        const snake = state.snakes.find((s) => s.segments.some((segment) => segment.x === x && segment.y === y))
        const isApple = state.apples.some((apple) => apple.x === x && apple.y === y)

        let backgroundColor = "#0f172a"
        if (snake) {
          backgroundColor = snake.id === "player1" ? "#f97316" : "#38bdf8"
        } else if (isApple) {
          backgroundColor = "#facc15"
        }

        cells.push(
          <View
            key={${x}-}
            style={[
              styles.cell,
              {
                width: GRID_CELL_SIZE,
                height: GRID_CELL_SIZE,
                backgroundColor,
              },
            ]}
          />,
        )
      }
    }
    return cells
  }

  const renderControls = (player: SnakeId) => (
    <View style={styles.dPad}>
      <View style={styles.dPadRow}>
        <TouchableOpacity style={styles.dPadButton} onPress={() => onChangeDirection(player, "up")}>
          <Text style={styles.dPadLabel}>?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dPadRow}>
        <TouchableOpacity style={styles.dPadButton} onPress={() => onChangeDirection(player, "left")}>
          <Text style={styles.dPadLabel}>?</Text>
        </TouchableOpacity>
        <View style={styles.dPadSpacer} />
        <TouchableOpacity style={styles.dPadButton} onPress={() => onChangeDirection(player, "right")}>
          <Text style={styles.dPadLabel}>?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dPadRow}>
        <TouchableOpacity style={styles.dPadButton} onPress={() => onChangeDirection(player, "down")}>
          <Text style={styles.dPadLabel}>?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderOverlay = () => {
    if (state.status === "running") return null

    const message = state.status === "countdown" ? Round starts in  : state.winner ? ${state.winner.toUpperCase()} wins! : "Draw"

    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>{message}</Text>
        {state.status === "finished" && (
          <TouchableOpacity style={styles.overlayButton} onPress={onResetRound}>
            <Text style={styles.overlayButtonText}>Play Again</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>P1: {state.scores.player1}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.scoreLabel}>P2: {state.scores.player2}</Text>
      </View>

      <View style={styles.boardWrapper}>
        <View
          style={[
            styles.board,
            {
              width: state.gridWidth * GRID_CELL_SIZE,
              height: state.gridHeight * GRID_CELL_SIZE,
            },
          ]}
        >
          {renderGrid()}
          {renderOverlay()}
        </View>
      </View>

      <View style={styles.controlsRow}>
        {renderControls("player1")}
        {mode === "friend" && renderControls("player2")}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  exitButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(248,250,252,0.12)",
  },
  exitText: {
    color: "#f8fafc",
    fontWeight: "600",
  },
  boardWrapper: {
    alignItems: "center",
  },
  board: {
    borderRadius: 12,
    backgroundColor: "#020617",
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "rgba(148,163,184,0.2)",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 24,
  },
  dPad: {
    gap: 6,
    alignItems: "center",
  },
  dPadRow: {
    flexDirection: "row",
    gap: 12,
  },
  dPadSpacer: {
    width: 32,
  },
  dPadButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.8)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.3)",
  },
  dPadLabel: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.8)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  overlayTitle: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
  },
  overlayButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#38bdf8",
  },
  overlayButtonText: {
    color: "#0f172a",
    fontWeight: "700",
  },
})

export default SnakesDuelView
