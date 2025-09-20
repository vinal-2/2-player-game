import type { GameModel } from "../../core/GameEngine"
import { manhattan } from "./utils/pathfinding"

export interface SnakeSegment {
  x: number
  y: number
}

export interface SnakeRuntime {
  id: "player1" | "player2" | "bot"
  segments: SnakeSegment[]
  direction: "up" | "down" | "left" | "right"
  pendingGrowth: number
  isBot: boolean
  skin: string
}

export interface SnakesDuelState {
  grid: number[][]
  status: "idle" | "countdown" | "running" | "paused" | "gameover"
  apples: { x: number; y: number }[]
  snakes: SnakeRuntime[]
  countdown?: number
  winner?: "player1" | "player2" | "bot" | null
  tickRate: number
  ticks: number
}

const createEmptyGrid = (width: number, height: number) =>
  Array.from({ length: height }, () => Array(width).fill(0))

const BASE_TICK_RATE = 6
const MAX_TICK_RATE = 10
const RAMP_APPLES = 20

export class SnakesDuelModel implements GameModel {
  public isActive = false
  public state: SnakesDuelState
  private tickAccumulator = 0

  constructor(public readonly gridWidth: number, public readonly gridHeight: number) {
    this.state = {
      grid: createEmptyGrid(gridWidth, gridHeight),
      status: "idle",
      apples: [],
      snakes: [],
      winner: null,
      tickRate: BASE_TICK_RATE,
      ticks: 0,
    }
  }

  public initialize(): void {
    this.seedDemoState()
    this.state.status = "running"
    this.isActive = true
  }

  public update(deltaTime: number): void {
    if (this.state.status !== "running") return

    this.tickAccumulator += deltaTime
    const tickInterval = 1 / this.state.tickRate

    while (this.tickAccumulator >= tickInterval) {
      this.tickAccumulator -= tickInterval
      this.step()
    }
  }

  public reset(): void {
    this.state = {
      grid: createEmptyGrid(this.gridWidth, this.gridHeight),
      status: "idle",
      apples: [],
      snakes: [],
      winner: null,
      tickRate: BASE_TICK_RATE,
      ticks: 0,
    }
    this.seedDemoState()
  }

  private step(): void {
    this.state.ticks += 1
    this.updateTickRate()
    // TODO: advance snakes, handle collisions, spawn apples
  }

  private updateTickRate(): void {
    const applesEaten = this.state.snakes.reduce((sum, snake) => sum + Math.max(0, snake.segments.length - 3), 0)
    const ramp = Math.min(applesEaten / RAMP_APPLES, 1)
    const tensionMultiplier = this.calculateTensionMultiplier()
    const target = BASE_TICK_RATE + ramp * (MAX_TICK_RATE - BASE_TICK_RATE) * tensionMultiplier
    this.state.tickRate = Math.min(MAX_TICK_RATE, target)
  }

  private calculateTensionMultiplier(): number {
    const snakes = this.state.snakes
    if (snakes.length < 2) return 1
    const headA = snakes[0].segments[0]
    const headB = snakes[1].segments[0]
    const distance = manhattan(headA.x, headA.y, headB.x, headB.y)
    if (distance <= 3) return 1.15
    if (distance <= 6) return 1.05
    return 1
  }

  private seedDemoState(): void {
    const centerX = Math.floor(this.gridWidth / 2)
    const centerY = Math.floor(this.gridHeight / 2)

    this.state.snakes = [
      {
        id: "player1",
        segments: [
          { x: centerX - 5, y: this.gridHeight - 6 },
          { x: centerX - 5, y: this.gridHeight - 5 },
          { x: centerX - 5, y: this.gridHeight - 4 },
        ],
        direction: "up",
        pendingGrowth: 0,
        isBot: false,
        skin: "classic-neon",
      },
      {
        id: "player2",
        segments: [
          { x: centerX + 4, y: 5 },
          { x: centerX + 4, y: 6 },
          { x: centerX + 4, y: 7 },
        ],
        direction: "down",
        pendingGrowth: 0,
        isBot: true,
        skin: "sunset-blaze",
      },
    ]

    this.state.apples = [{ x: centerX, y: centerY }]
  }
}
