import React, { forwardRef, useMemo } from "react"
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from "react-native"

import type { SnakesDuelState, SnakeSegment } from "./SnakesDuelModel"

interface SnakesDuelViewProps {
  state: SnakesDuelState
  mode: "friend" | "bot"
  selectedSkins: Record<"player1" | "player2", string>
  onSelectSkin: (playerId: "player1" | "player2", skinId: string) => void
  onBack: () => void
  onReset: () => void
  onToggleMode: () => void
}

const SKIN_OPTIONS = [
  { id: "classic-neon", label: "Classic Neon" },
  { id: "sunset-blaze", label: "Sunset Blaze" },
  { id: "arctic-pulse", label: "Arctic Pulse" },
  { id: "midnight-pixel", label: "Midnight Pixel" },
] as const

const skinPalette: Record<string, { fill: string; glow: string }> = {
  "classic-neon": { fill: "#22c55e", glow: "rgba(34,197,94,0.3)" },
  "sunset-blaze": { fill: "#f97316", glow: "rgba(249,115,22,0.3)" },
  "arctic-pulse": { fill: "#38bdf8", glow: "rgba(56,189,248,0.3)" },
  "midnight-pixel": { fill: "#a855f7", glow: "rgba(168,85,247,0.3)" },
}

const SnakesDuelView = forwardRef<View, SnakesDuelViewProps>(
  ({ state, mode, selectedSkins, onSelectSkin, onBack, onReset, onToggleMode }, ref) => {
    const { width, height } = useWindowDimensions()
    const gridHeight = state.grid.length
    const gridWidth = state.grid[0]?.length ?? 0
    const isTablet = width >= 768
    const gutter = isTablet ? 6 : 4
    const horizontalPadding = isTablet ? 48 : 32
    const verticalSpace = Math.max(height * 0.55, 260)
    const maxBoardWidth = width - horizontalPadding
    const idealBoard = Math.min(maxBoardWidth, verticalSpace)
    const baseCell = gridWidth > 0 ? (idealBoard - gutter * (gridWidth - 1)) / gridWidth : 0
    const cellSize = baseCell > 0 ? Math.floor(baseCell) : 12
    const boardWidth = cellSize * gridWidth + gutter * Math.max(gridWidth - 1, 0)
    const boardHeight = cellSize * gridHeight + gutter * Math.max(gridHeight - 1, 0)

    const boardStyle = useMemo(
      () => ({
        width: boardWidth,
        height: boardHeight,
      }),
      [boardWidth, boardHeight],
    )

    const toPixel = (value: number) => value * (cellSize + gutter)

    const renderSnakeSegment = (segment: SnakeSegment, color: string, key: string, glow: string, isHead: boolean) => (
      <View
        key={key}
        style={{
          position: "absolute",
          left: toPixel(segment.x),
          top: toPixel(segment.y),
          width: cellSize,
          height: cellSize,
          borderRadius: 6,
          backgroundColor: isHead ? color : `${color}dd`,
          shadowColor: glow,
          shadowOpacity: 0.6,
          shadowRadius: 8,
        }}
      />
    )

    const appleNodes = state.apples.map((apple, index) => (
      <View
        key={`apple-${index}`}
        style={{
          position: "absolute",
          left: toPixel(apple.x) + cellSize * 0.2,
          top: toPixel(apple.y) + cellSize * 0.2,
          width: cellSize * 0.6,
          height: cellSize * 0.6,
          borderRadius: cellSize,
          backgroundColor: "#facc15",
          shadowColor: "#facc15",
          shadowOpacity: 0.45,
          shadowRadius: 6,
        }}
      />
    ))

    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.chip} onPress={onBack}>
            <Text style={styles.chipText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.statusGroup}>
            <Text style={styles.statusLabel}>Mode</Text>
            <TouchableOpacity style={styles.modeChip} onPress={onToggleMode}>
              <Text style={styles.modeText}>{mode === "bot" ? "Solo vs Bot" : "Two Players"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.chip} onPress={onReset}>
            <Text style={styles.chipText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.skinRow}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skinRowContent}
        >
          {SKIN_OPTIONS.map((option) => {
            const isSelected = selectedSkins.player1 === option.id
            return (
              <TouchableOpacity
                key={`p1-skin-${option.id}`}
                style={[styles.skinChip, isSelected && styles.skinChipActive]}
                onPress={() => onSelectSkin("player1", option.id)}
              >
                <Text style={[styles.skinChipLabel, isSelected && styles.skinChipLabelActive]}>{`P1 · ${option.label}`}</Text>
              </TouchableOpacity>
            )
          })}
          {SKIN_OPTIONS.map((option) => {
            const isSelected = selectedSkins.player2 === option.id
            return (
              <TouchableOpacity
                key={`p2-skin-${option.id}`}
                style={[styles.skinChip, isSelected && styles.skinChipActive]}
                onPress={() => onSelectSkin("player2", option.id)}
              >
                <Text style={[styles.skinChipLabel, isSelected && styles.skinChipLabelActive]}>{`P2 · ${option.label}`}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View style={styles.boardWrapper}>
          <View style={[styles.board, boardStyle]}>
            {state.grid.map((_, rowIndex) => (
              <View
                key={`row-${rowIndex}`}
                style={{
                  flexDirection: "row",
                  height: cellSize,
                  marginBottom: rowIndex < gridHeight - 1 ? gutter : 0,
                }}
              >
                {state.grid[rowIndex].map((__value, columnIndex) => (
                  <View
                    key={`cell-${rowIndex}-${columnIndex}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      marginRight: columnIndex < gridWidth - 1 ? gutter : 0,
                      borderRadius: 6,
                      backgroundColor: (rowIndex + columnIndex) % 2 === 0 ? "rgba(15,23,42,0.95)" : "rgba(20,30,54,0.95)",
                    }}
                  />
                ))}
              </View>
            ))}

            {appleNodes}

            {state.snakes.map((snake) => {
              const palette = skinPalette[snake.skin] ?? skinPalette["classic-neon"]
              return snake.segments.map((segment, index) =>
                renderSnakeSegment(segment, palette.fill, `${snake.id}-${index}`, palette.glow, index === 0),
              )
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tick Rate: {state.tickRate.toFixed(1)} • Status: {state.status.toUpperCase()}
          </Text>
        </View>
      </View>
    )
  },
)

SnakesDuelView.displayName = "SnakesDuelView"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(15, 118, 110, 0.85)",
  },
  chipText: {
    color: "white",
    fontWeight: "700",
  },
  statusGroup: {
    alignItems: "center",
  },
  statusLabel: {
    color: "rgba(226,232,240,0.75)",
    fontSize: 12,
  },
  modeChip: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(14,165,233,0.85)",
  },
  modeText: {
    color: "white",
    fontWeight: "700",
  },
  skinRow: {
    maxHeight: 52,
  },
  skinRowContent: {
    paddingVertical: 8,
    gap: 8,
  },
  skinChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(30,41,59,0.65)",
  },
  skinChipActive: {
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  skinChipLabel: {
    color: "rgba(226,232,240,0.75)",
    fontWeight: "600",
  },
  skinChipLabelActive: {
    color: "white",
  },
  boardWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  board: {
    position: "relative",
    borderRadius: 24,
    backgroundColor: "rgba(15,23,42,0.9)",
    padding: 12,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "rgba(226,232,240,0.7)",
    fontSize: 13,
  },
})

export default SnakesDuelView
