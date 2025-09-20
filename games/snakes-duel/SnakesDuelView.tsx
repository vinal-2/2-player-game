import React, { forwardRef, useMemo } from "react"
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView, Image } from "react-native"

import { useSeasonal } from "../../contexts/SeasonalContext"
import { AssetLoader } from "../../utils/AssetLoader"
import { particleManifest } from "../../core/assets"
import type { SnakesDuelState, SnakeSegment, SnakeRuntime } from "./SnakesDuelModel"

interface SnakesDuelViewProps {
  state: SnakesDuelState
  mode: "friend" | "bot"
  selectedSkins: Record<"player1" | "player2", string>
  selectedDifficulty: "rookie" | "pro" | "legend"
  appleSplashes: Array<{ id: string; x: number; y: number }>
  onSelectSkin: (playerId: "player1" | "player2", skinId: string) => void
  onSelectDifficulty: (level: "rookie" | "pro" | "legend") => void
  onBack: () => void
  onReset: () => void
  onToggleMode: () => void
  onRematch: () => void
}

const SKIN_OPTIONS = [
  { id: "classic-neon", label: "Classic Neon" },
  { id: "sunset-blaze", label: "Sunset Blaze" },
  { id: "arctic-pulse", label: "Arctic Pulse" },
  { id: "midnight-pixel", label: "Midnight Pixel" },
] as const

const DIFFICULTY_OPTIONS: Array<{ id: "rookie" | "pro" | "legend"; label: string }> = [
  { id: "rookie", label: "Rookie" },
  { id: "pro", label: "Pro" },
  { id: "legend", label: "Legend" },
]

const BASE_SKIN_PALETTE: Record<string, { fill: string; glow: string }> = {
  "classic-neon": { fill: "#22c55e", glow: "rgba(34,197,94,0.3)" },
  "sunset-blaze": { fill: "#f97316", glow: "rgba(249,115,22,0.3)" },
  "arctic-pulse": { fill: "#38bdf8", glow: "rgba(56,189,248,0.3)" },
  "midnight-pixel": { fill: "#a855f7", glow: "rgba(168,85,247,0.3)" },
}

const winnerLabel = (winner: string | null | undefined) => {
  if (!winner) return "Draw"
  if (winner === "player1") return "Player 1 Wins"
  if (winner === "player2") return "Player 2 Wins"
  return "Bot Wins"
}

const directionToAngle: Record<SnakeRuntime["direction"], number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
}

type SegmentKind = "head" | "body" | "turn" | "tail"

type SegmentOrientation = {
  kind: SegmentKind
  rotation: number
}

const vectorToDirection = (dx: number, dy: number): SnakeRuntime["direction"] => {
  if (dx === 1) return "right"
  if (dx === -1) return "left"
  if (dy === 1) return "down"
  if (dy === -1) return "up"
  return "up"
}

const turnRotationMap: Record<string, number> = {
  "up-right": 0,
  "right-up": 0,
  "right-down": 90,
  "down-right": 90,
  "down-left": 180,
  "left-down": 180,
  "left-up": 270,
  "up-left": 270,
}

const resolveSegmentOrientation = (snake: SnakeRuntime, index: number): SegmentOrientation => {
  const segments = snake.segments

  if (index === 0) {
    return { kind: "head", rotation: directionToAngle[snake.direction] }
  }

  if (index === segments.length - 1) {
    const prev = segments[index - 1]
    const segment = segments[index]
    const direction = vectorToDirection(segment.x - prev.x, segment.y - prev.y)
    return { kind: "tail", rotation: directionToAngle[direction] }
  }

  const prev = segments[index - 1]
  const segment = segments[index]
  const next = segments[index + 1]

  const incoming = vectorToDirection(segment.x - prev.x, segment.y - prev.y)
  const outgoing = vectorToDirection(next.x - segment.x, next.y - segment.y)

  if (incoming === outgoing) {
    const rotation = incoming === "left" || incoming === "right" ? 90 : 0
    return { kind: "body", rotation }
  }

  const key = `${incoming}-${outgoing}`
  const rotation = turnRotationMap[key] ?? 0
  return { kind: "turn", rotation }
}

const SnakesDuelView = forwardRef<View, SnakesDuelViewProps>(
  (
    {
      state,
      mode,
      selectedSkins,
      selectedDifficulty,
      appleSplashes,
      onSelectSkin,
      onSelectDifficulty,
      onBack,
      onReset,
      onToggleMode,
      onRematch,
    },
    ref,
  ) => {
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

    const { getSnakesDuelTheme } = useSeasonal()
    const seasonalSnakeTheme = useMemo(() => getSnakesDuelTheme(), [getSnakesDuelTheme])
    const skinPalette = useMemo(
      () => ({
        ...BASE_SKIN_PALETTE,
        "classic-neon": seasonalSnakeTheme.palette,
      }),
      [seasonalSnakeTheme],
    )
    const appleFill = seasonalSnakeTheme.palette.fill
    const appleGlow = seasonalSnakeTheme.palette.glow

    const assetLoader = useMemo(() => AssetLoader.getInstance(), [])
    const textures = seasonalSnakeTheme.textures
    const textureSources = useMemo<Record<SegmentKind, any>>(
      () => ({
        head: assetLoader.getImage(textures.head) ?? textures.head,
        body: assetLoader.getImage(textures.body) ?? textures.body,
        turn: assetLoader.getImage(textures.turn) ?? textures.turn,
        tail: assetLoader.getImage(textures.tail) ?? textures.tail,
      }),
      [assetLoader, textures.head, textures.body, textures.turn, textures.tail],
    )

    const gridSource = useMemo(() => assetLoader.getImage(textures.grid) ?? textures.grid, [assetLoader, textures.grid])
    const appleSprite = useMemo(
      () => assetLoader.getImage(textures.apple) ?? textures.apple,
      [assetLoader, textures.apple],
    )

    const particleSource = useMemo(() => {
      const module = particleManifest[seasonalSnakeTheme.particle]
      if (!module) return null
      return assetLoader.getImage(module) ?? module
    }, [assetLoader, seasonalSnakeTheme.particle])

    const toPixel = (value: number) => value * (cellSize + gutter)
    const particleSize = Math.max(cellSize * 1.35, 28)
    const particleOffset = (particleSize - cellSize) / 2

    const renderSnakeSegment = (
      snake: SnakeRuntime,
      segment: SnakeSegment,
      index: number,
      palette: { fill: string; glow: string },
    ) => {
      const { kind, rotation } = resolveSegmentOrientation(snake, index)
      const source = textureSources[kind]

      return (
        <Image
          key={`${snake.id}-${index}`}
          source={source}
          style={{
            position: "absolute",
            left: toPixel(segment.x),
            top: toPixel(segment.y),
            width: cellSize,
            height: cellSize,
            resizeMode: "contain",
            shadowColor: palette.glow,
            shadowOpacity: 0.55,
            shadowRadius: 8,
            transform: [{ rotate: `${rotation}deg` }],
          }}
        />
      )
    }

    const appleNodes = appleSprite
      ? state.apples.map((apple, index) => (
          <Image
            key={`apple-${index}`}
            source={appleSprite}
            style={{
              position: "absolute",
              left: toPixel(apple.x) + cellSize * 0.1,
              top: toPixel(apple.y) + cellSize * 0.1,
              width: cellSize * 0.8,
              height: cellSize * 0.8,
              resizeMode: "contain",
            }}
          />
        ))
      : state.apples.map((apple, index) => (
          <View
            key={`apple-${index}`}
            style={{
              position: "absolute",
              left: toPixel(apple.x) + cellSize * 0.2,
              top: toPixel(apple.y) + cellSize * 0.2,
              width: cellSize * 0.6,
              height: cellSize * 0.6,
              borderRadius: cellSize,
              backgroundColor: appleFill,
              shadowColor: appleFill,
              shadowOpacity: 0.45,
              shadowRadius: 6,
            }}
          />
        ))

    const showCountdown = state.status === "countdown" && state.countdown
    const showGameOver = state.status === "gameover"

    return (
      <View ref={ref} style={styles.container}>
        <View style={styles.headerRow}>
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

        {mode === "bot" && (
          <View style={styles.difficultyRow}>
            {DIFFICULTY_OPTIONS.map(({ id, label }) => {
              const active = selectedDifficulty === id
              return (
                <TouchableOpacity
                  key={`difficulty-${id}`}
                  style={[styles.diffChip, active && styles.diffChipActive]}
                  onPress={() => onSelectDifficulty(id)}
                >
                  <Text style={[styles.diffChipText, active && styles.diffChipTextActive]}>{label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

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
                <Text style={[styles.skinChipLabel, isSelected && styles.skinChipLabelActive]}>{`P1 - ${option.label}`}</Text>
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
                <Text style={[styles.skinChipLabel, isSelected && styles.skinChipLabelActive]}>{`P2 - ${option.label}`}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View style={styles.boardWrapper}>
          <View style={[styles.board, boardStyle, { shadowColor: appleFill }]}>
            {gridSource && (
              <Image
                source={gridSource}
                style={[styles.gridImage, { width: boardWidth, height: boardHeight }]}
                resizeMode="cover"
              />
            )}
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

            {appleSplashes.map((splash) =>
              particleSource ? (
                <Image
                  key={`splash-${splash.id}`}
                  source={particleSource}
                  style={{
                    position: "absolute",
                    left: toPixel(splash.x) - particleOffset,
                    top: toPixel(splash.y) - particleOffset,
                    width: particleSize,
                    height: particleSize,
                    resizeMode: "contain",
                  }}
                />
              ) : (
                <View
                  key={`splash-${splash.id}`}
                  style={{
                    position: "absolute",
                    left: toPixel(splash.x) + cellSize * 0.1,
                    top: toPixel(splash.y) + cellSize * 0.1,
                    width: cellSize * 0.8,
                    height: cellSize * 0.8,
                    borderRadius: cellSize,
                    backgroundColor: appleGlow,
                    borderWidth: 2,
                    borderColor: appleFill,
                  }}
                />
              ),
            )}

            {state.snakes.map((snake) => {
              const palette = skinPalette[snake.skin] ?? skinPalette["classic-neon"]
              return snake.segments.map((segment, index) =>
                renderSnakeSegment(snake, segment, index, palette),
              )
            })}

            {(showCountdown || showGameOver) && (
              <View style={styles.overlay}>
                <Text style={styles.overlayTitle}>
                  {showCountdown ? state.countdown : winnerLabel(state.winner)}
                </Text>
                {showGameOver ? (
                  <View style={styles.overlayActions}>
                    <TouchableOpacity style={styles.overlayButtonPrimary} onPress={onRematch}>
                      <Text style={styles.overlayButtonText}>Rematch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.overlayButtonSecondary} onPress={onBack}>
                      <Text style={styles.overlayButtonText}>Menu</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.overlaySubtitle}>Round starting...</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tick Rate: {state.tickRate.toFixed(1)} | Status: {state.status.toUpperCase()}
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
  headerRow: {
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
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  diffChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(30,41,59,0.6)",
  },
  diffChipActive: {
    backgroundColor: "rgba(59,130,246,0.9)",
  },
  diffChipText: {
    color: "rgba(226,232,240,0.75)",
    fontWeight: "600",
  },
  diffChipTextActive: {
    color: "white",
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
    overflow: "hidden",
  },
  gridImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.92,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  overlayTitle: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
  },
  overlaySubtitle: {
    marginTop: 6,
    color: "rgba(226,232,240,0.8)",
    fontSize: 14,
  },
  overlayActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  overlayButtonPrimary: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(59,130,246,0.95)",
  },
  overlayButtonSecondary: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(30,41,59,0.85)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  overlayButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
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

