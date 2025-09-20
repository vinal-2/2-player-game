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

export type SnakesDuelEvent =
  | { type: "apple_eaten"; playerId: string; length: number; tickRate: number; position: SnakeSegment }
  | { type: "collision"; playerId: string; reason: "wall" | "self" | "opponent" | "head_on"; tick: number }
  | { type: "round_end"; winner: string | null; ticks: number }

export interface SnakesDuelState {
  grid: number[][]
  status: "idle" | "countdown" | "running" | "paused" | "gameover"
  apples: { x: number; y: number }[]
  snakes: SnakeRuntime[]
  countdown?: number
  winner?: "player1" | "player2" | "bot" | null
  tickRate: number
  ticks: number
  lastEliminated?: { id: string; reason: "wall" | "self" | "opponent" | "head_on" }[]
}

const createEmptyGrid = (width: number, height: number) =>
  Array.from({ length: height }, () => Array(width).fill(0))

const BASE_TICK_RATE = 6
const MAX_TICK_RATE = 10
const RAMP_APPLES = 20
const COUNTDOWN_SECONDS = 3

export class SnakesDuelModel implements GameModel {
  public isActive = false
  public state: SnakesDuelState

  private tickAccumulator = 0
  private countdownTimer = 0
  private emitEvent: (event: SnakesDuelEvent) => void = () => {}

  constructor(public readonly gridWidth: number, public readonly gridHeight: number) {
    this.state = {
      grid: createEmptyGrid(gridWidth, gridHeight),
      status: "idle",
      apples: [],
      snakes: [],
      winner: null,
      tickRate: BASE_TICK_RATE,
      ticks: 0,
      lastEliminated: [],
    }
  }

  public setEventEmitter(emitter: (event: SnakesDuelEvent) => void) {
    this.emitEvent = emitter
  }

  public initialize(): void {
    this.seedDemoState()
    this.startCountdown(COUNTDOWN_SECONDS)
  }

  public update(deltaTime: number): void {
    if (this.state.status === "gameover") {
      return
    }

    if (this.state.status === "countdown") {
      this.countdownTimer -= deltaTime
      this.state.countdown = Math.max(1, Math.ceil(this.countdownTimer))
      if (this.countdownTimer <= 0) {
        this.beginRound()
      }
      return
    }

    if (this.state.status !== "running") {
      return
    }

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
      lastEliminated: [],
    }
    this.seedDemoState()
    this.startCountdown(COUNTDOWN_SECONDS)
  }

  private startCountdown(seconds: number): void {
    this.state.status = "countdown"
    this.countdownTimer = seconds
    this.state.countdown = Math.ceil(seconds)
    this.tickAccumulator = 0
    this.isActive = true
  }

  public startRematchCountdown(): void {
    this.startCountdown(COUNTDOWN_SECONDS)
  }

  private beginRound(): void {
    this.state.status = "running"
    this.state.countdown = undefined
    this.state.ticks = 0
    this.tickAccumulator = 0
  }

  private step(): void {
    this.state.ticks += 1
    this.updateTickRate()

    const moves = this.state.snakes.map((snake) => ({
      snake,
      nextHead: this.getNextHead(snake),
      eliminate: false,
      reason: "wall" as "wall" | "self" | "opponent" | "head_on",
    }))

    const tailsToVacate = new Set<string>()
    this.state.snakes.forEach((snake) => {
      const tail = snake.segments[snake.segments.length - 1]
      if (snake.pendingGrowth === 0) {
        tailsToVacate.add(this.makeKey(tail.x, tail.y))
      }
    })

    const occupied = new Map<string, SnakeRuntime>()
    this.state.snakes.forEach((snake) => {
      snake.segments.forEach((segment) => {
        occupied.set(this.makeKey(segment.x, segment.y), snake)
      })
    })

    const headTargets = new Map<string, SnakeRuntime[]>()

    moves.forEach((move) => {
      const { nextHead, snake } = move
      const outOfBounds =
        nextHead.x < 0 ||
        nextHead.y < 0 ||
        nextHead.x >= this.gridWidth ||
        nextHead.y >= this.gridHeight
      if (outOfBounds) {
        move.eliminate = true
        move.reason = "wall"
        return
      }

      const targetKey = this.makeKey(nextHead.x, nextHead.y)
      const occupants = headTargets.get(targetKey)
      if (occupants) {
        occupants.push(snake)
      } else {
        headTargets.set(targetKey, [snake])
      }

      const occupyingSnake = occupied.get(targetKey)
      if (occupyingSnake) {
        const isTail = tailsToVacate.has(targetKey) && occupyingSnake.id === snake.id
        if (!isTail) {
          move.eliminate = true
          move.reason = occupyingSnake === snake ? "self" : "opponent"
        }
      }
    })

    headTargets.forEach((snakesAtCell, key) => {
      if (snakesAtCell.length > 1) {
        moves.forEach((move) => {
          if (this.makeKey(move.nextHead.x, move.nextHead.y) === key) {
            move.eliminate = true
            move.reason = "head_on"
          }
        })
      }
    })

    const eliminations: { id: string; reason: "wall" | "self" | "opponent" | "head_on" }[] = []

    moves.forEach((move) => {
      const { snake, nextHead, eliminate } = move
      if (eliminate) {
        eliminations.push({ id: snake.id, reason: move.reason })
        return
      }

      const appleIndex = this.state.apples.findIndex((apple) => apple.x === nextHead.x && apple.y === nextHead.y)
      const ateApple = appleIndex !== -1

      snake.segments.unshift(nextHead)
      if (ateApple) {
        snake.pendingGrowth += 1
        this.state.apples.splice(appleIndex, 1)
        this.spawnApple()
        this.emitEvent({
          type: "apple_eaten",
          playerId: snake.id,
          length: snake.segments.length,
          tickRate: this.state.tickRate,
          position: nextHead,
        })
      }

      if (snake.pendingGrowth > 0) {
        snake.pendingGrowth -= 1
      } else {
        snake.segments.pop()
      }
    })

    if (eliminations.length > 0) {
      this.state.lastEliminated = eliminations
      eliminations.forEach((elim) => {
        this.emitEvent({ type: "collision", playerId: elim.id, reason: elim.reason, tick: this.state.ticks })
      })
      this.resolveEndState(eliminations)
    }
  }

  private resolveEndState(eliminations: { id: string; reason: "wall" | "self" | "opponent" | "head_on" }[]): void {
    const surviving = this.state.snakes.filter((snake) => !eliminations.some((elim) => elim.id === snake.id))

    this.state.snakes = surviving

    if (surviving.length === 0) {
      this.state.status = "gameover"
      this.state.winner = null
      this.emitEvent({ type: "round_end", winner: null, ticks: this.state.ticks })
      return
    }

    if (surviving.length === 1) {
      this.state.status = "gameover"
      this.state.winner = surviving[0].id
      this.emitEvent({ type: "round_end", winner: surviving[0].id, ticks: this.state.ticks })
      return
    }
  }

  private getNextHead(snake: SnakeRuntime): SnakeSegment {
    const head = snake.segments[0]
    switch (snake.direction) {
      case "up":
        return { x: head.x, y: head.y - 1 }
      case "down":
        return { x: head.x, y: head.y + 1 }
      case "left":
        return { x: head.x - 1, y: head.y }
      case "right":
      default:
        return { x: head.x + 1, y: head.y }
    }
  }

  private spawnApple(): void {
    const occupied = new Set<string>()
    this.state.snakes.forEach((snake) => {
      snake.segments.forEach((segment) => {
        occupied.add(this.makeKey(segment.x, segment.y))
      })
    })

    const freeCells: Array<{ x: number; y: number }> = []
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const key = this.makeKey(x, y)
        if (!occupied.has(key)) {
          freeCells.push({ x, y })
        }
      }
    }

    if (freeCells.length === 0) return
    const spawnIndex = Math.floor(Math.random() * freeCells.length)
    const spot = freeCells[spawnIndex]
    this.state.apples.push(spot)
  }

  private makeKey(x: number, y: number) {
    return `${x}:${y}`
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

