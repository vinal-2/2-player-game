import type { GameModel } from "../../core/GameEngine"

export type SnakeId = "player1" | "player2"
export type Direction = "up" | "down" | "left" | "right"

export interface SnakeSegment {
  x: number
  y: number
}

export interface SnakeRuntime {
  id: SnakeId
  segments: SnakeSegment[]
  direction: Direction
  pendingDirection: Direction
  pendingGrowth: number
  isBot: boolean
}

export interface SnakesDuelState {
  gridWidth: number
  gridHeight: number
  snakes: SnakeRuntime[]
  apples: SnakeSegment[]
  status: "countdown" | "running" | "finished"
  winner: SnakeId | "draw" | null
  countdown: number
  tickRate: number
  scores: Record<SnakeId, number>
}

export type SnakesDuelEvent =
  | { type: "apple"; snakeId: SnakeId; length: number }
  | { type: "collision"; snakeId: SnakeId; reason: "wall" | "self" | "opponent" | "draw" }
  | { type: "round_end"; winner: SnakeId | "draw" | null }

const BASE_TICK_RATE = 6
const COUNTDOWN_SECONDS = 3

const OPPOSITES: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
}

const directionVectors: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

export class SnakesDuelModel implements GameModel {
  public isActive = false
  public state: SnakesDuelState

  private tickAccumulator = 0
  private countdownTimer = COUNTDOWN_SECONDS
  private emitEvent: (event: SnakesDuelEvent) => void = () => {}
  private notifyStateChange: () => void = () => {}

  constructor(private readonly gridWidth: number, private readonly gridHeight: number) {
    this.state = {
      gridWidth,
      gridHeight,
      snakes: [],
      apples: [],
      status: "countdown",
      winner: null,
      countdown: COUNTDOWN_SECONDS,
      tickRate: BASE_TICK_RATE,
      scores: { player1: 0, player2: 0 },
    }
    this.resetSnakes()
    this.spawnApple()
  }

  public setEventEmitter(emitter: (event: SnakesDuelEvent) => void) {
    this.emitEvent = emitter
  }

  public setOnStateChange(callback: () => void) {
    this.notifyStateChange = callback
  }

  public initialize(): void {
    this.isActive = true
    this.state.status = "countdown"
    this.countdownTimer = COUNTDOWN_SECONDS
    this.state.countdown = COUNTDOWN_SECONDS
  }

  public update(deltaTime: number): void {
    if (!this.isActive) return

    if (this.state.status === "countdown") {
      this.countdownTimer -= deltaTime
      this.state.countdown = Math.max(0, Math.ceil(this.countdownTimer))
      if (this.countdownTimer <= 0) {
        this.beginRound()
      }
      this.notifyStateChange()
      return
    }

    if (this.state.status !== "running") {
      return
    }

    this.tickAccumulator += deltaTime
    const stepInterval = 1 / this.state.tickRate

    while (this.tickAccumulator >= stepInterval) {
      this.tickAccumulator -= stepInterval
      this.step()
    }
  }

  public reset(): void {
    this.resetSnakes()
    this.state.apples = []
    this.spawnApple()
    this.state.status = "countdown"
    this.state.winner = null
    this.countdownTimer = COUNTDOWN_SECONDS
    this.state.countdown = COUNTDOWN_SECONDS
    this.tickAccumulator = 0
    this.isActive = true
    this.notifyStateChange()
  }

  public setPlayerDirection(id: SnakeId, direction: Direction) {
    const snake = this.state.snakes.find((s) => s.id === id)
    if (!snake) return
    if (OPPOSITES[snake.direction] === direction) return
    snake.pendingDirection = direction
  }

  public setSnakeAsBot(id: SnakeId, isBot: boolean) {
    const snake = this.state.snakes.find((s) => s.id === id)
    if (snake) {
      snake.isBot = isBot
    }
  }

  public finishRound(winner: SnakeId | "draw") {
    this.state.status = "finished"
    this.state.winner = winner
    if (winner === "player1" || winner === "player2") {
      this.state.scores[winner] += 1
    }
    this.emitEvent({ type: "round_end", winner })
    this.notifyStateChange()
  }

  private beginRound() {
    this.state.status = "running"
    this.tickAccumulator = 0
    this.notifyStateChange()
  }

  private step() {
    const nextPositions = this.state.snakes.map((snake) => {
      snake.direction = snake.pendingDirection
      const vector = directionVectors[snake.direction]
      const head = snake.segments[0]
      return {
        snake,
        nextHead: { x: head.x + vector.dx, y: head.y + vector.dy },
      }
    })

    const occupied = new Set<string>()
    this.state.snakes.forEach((snake) => {
      snake.segments.forEach((segment) => occupied.add(this.cellKey(segment.x, segment.y)))
    })

    const eliminations: { snake: SnakeRuntime; reason: "wall" | "self" | "opponent" | "draw" }[] = []

    nextPositions.forEach(({ snake, nextHead }) => {
      if (this.isOutOfBounds(nextHead)) {
        eliminations.push({ snake, reason: "wall" })
        return
      }

      const headKey = this.cellKey(nextHead.x, nextHead.y)

      const hitSelf = snake.segments.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y)
      if (hitSelf) {
        eliminations.push({ snake, reason: "self" })
        return
      }

      const opponent = this.state.snakes.find((other) => other.id !== snake.id && other.segments.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y))
      if (opponent) {
        eliminations.push({ snake, reason: "opponent" })
        return
      }

      snake.segments.unshift(nextHead)
      const ateApple = this.consumeApple(nextHead)
      if (ateApple) {
        snake.pendingGrowth += 1
        this.emitEvent({ type: "apple", snakeId: snake.id, length: snake.segments.length })
        this.spawnApple()
      }

      if (snake.pendingGrowth > 0) {
        snake.pendingGrowth -= 1
      } else {
        snake.segments.pop()
      }
      occupied.add(headKey)
    })

    if (eliminations.length > 0) {
      const surviving = this.state.snakes.filter((snake) => !eliminations.some((elim) => elim.snake.id === snake.id))
      if (surviving.length === 0) {
        this.finishRound("draw")
      } else if (surviving.length === 1) {
        this.finishRound(surviving[0].id)
      } else {
        eliminations.forEach((elim) => this.emitEvent({ type: "collision", snakeId: elim.snake.id, reason: elim.reason }))
      }
    }

    this.notifyStateChange()
  }

  private consumeApple(position: SnakeSegment): boolean {
    const index = this.state.apples.findIndex((apple) => apple.x === position.x && apple.y === position.y)
    if (index >= 0) {
      this.state.apples.splice(index, 1)
      return true
    }
    return false
  }

  private spawnApple() {
    const occupied = new Set<string>()
    this.state.snakes.forEach((snake) => {
      snake.segments.forEach((segment) => occupied.add(this.cellKey(segment.x, segment.y)))
    })

    const available: SnakeSegment[] = []
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const key = this.cellKey(x, y)
        if (!occupied.has(key)) {
          available.push({ x, y })
        }
      }
    }

    if (available.length === 0) return
    const choice = available[Math.floor(Math.random() * available.length)]
    this.state.apples.push(choice)
  }

  private resetSnakes() {
    const midX = Math.floor(this.gridWidth / 2)
    const midY = Math.floor(this.gridHeight / 2)

    this.state.snakes = [
      {
        id: "player1",
        segments: [
          { x: midX - 4, y: midY + 3 },
          { x: midX - 4, y: midY + 4 },
          { x: midX - 4, y: midY + 5 },
        ],
        direction: "up",
        pendingDirection: "up",
        pendingGrowth: 0,
        isBot: false,
      },
      {
        id: "player2",
        segments: [
          { x: midX + 3, y: midY - 3 },
          { x: midX + 3, y: midY - 2 },
          { x: midX + 3, y: midY - 1 },
        ],
        direction: "down",
        pendingDirection: "down",
        pendingGrowth: 0,
        isBot: true,
      },
    ]
  }

  private isOutOfBounds(position: SnakeSegment): boolean {
    return position.x < 0 || position.x >= this.gridWidth || position.y < 0 || position.y >= this.gridHeight
  }

  private cellKey(x: number, y: number) {
    return ${x}:
  }
}
