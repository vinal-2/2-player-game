import type { GameModel } from "../../core/GameEngine"

type PlayerId = "player1" | "player2"

type Vector = {
  x: number
  y: number
}

export interface PaddleState {
  position: Vector
  radius: number
}

export interface PuckState {
  position: Vector
  velocity: Vector
  radius: number
}

export interface AirHockeyState {
  boardWidth: number
  boardHeight: number
  paddles: Record<PlayerId, PaddleState>
  puck: PuckState
  scores: Record<PlayerId, number>
  status: "running" | "finished"
  winner: PlayerId | null
}

export type AirHockeyEvent = { type: "goal"; scorer: PlayerId } | { type: "finished"; winner: PlayerId }

const PADDLE_SPEED_LIMIT = 520
const PUCK_FRICTION = 0.996
const PUCK_WALL_DAMPING = 0.97
const GOALS_TO_WIN = 5

export class AirHockeyModel implements GameModel {
  public isActive = false
  public state: AirHockeyState

  private notifyStateChange: () => void = () => {}
  private emitEvent: (event: AirHockeyEvent) => void = () => {}

  constructor(private readonly boardWidth: number, private readonly boardHeight: number) {
    const paddleRadius = boardWidth * 0.08
    const puckRadius = boardWidth * 0.04

    this.state = {
      boardWidth,
      boardHeight,
      paddles: {
        player1: {
          position: { x: boardWidth / 2, y: boardHeight * 0.85 },
          radius: paddleRadius,
        },
        player2: {
          position: { x: boardWidth / 2, y: boardHeight * 0.15 },
          radius: paddleRadius,
        },
      },
      puck: {
        position: { x: boardWidth / 2, y: boardHeight / 2 },
        velocity: { x: 0, y: 0 },
        radius: puckRadius,
      },
      scores: { player1: 0, player2: 0 },
      status: "running",
      winner: null,
    }
  }

  public setOnStateChange(callback: () => void) {
    this.notifyStateChange = callback
  }

  public setEventEmitter(emitter: (event: AirHockeyEvent) => void) {
    this.emitEvent = emitter
  }

  public initialize(): void {
    this.isActive = true
    this.resetPositions()
  }

  public update(deltaTime: number): void {
    if (!this.isActive || this.state.status !== "running") return

    this.applyPuckPhysics(deltaTime)
    this.checkCollisions()
    this.notifyStateChange()
  }

  public reset(): void {
    this.state.status = "running"
    this.state.winner = null
    this.resetPositions()
    this.notifyStateChange()
  }

  public movePaddle(player: PlayerId, x: number, y: number) {
    const paddle = this.state.paddles[player]
    const clampedX = Math.max(paddle.radius, Math.min(this.boardWidth - paddle.radius, x))
    const halfBoard = this.boardHeight / 2
    const limits = player === "player1"
      ? { min: halfBoard, max: this.boardHeight - paddle.radius }
      : { min: paddle.radius, max: halfBoard }
    const clampedY = Math.max(limits.min, Math.min(limits.max, y))
    paddle.position.x = clampedX
    paddle.position.y = clampedY
  }

  private resetPositions(serving: PlayerId = "player1") {
    const { puck, paddles } = this.state
    puck.position = { x: this.boardWidth / 2, y: this.boardHeight / 2 }
    const direction = serving === "player1" ? -1 : 1
    puck.velocity = { x: 0, y: direction * 260 }
    paddles.player1.position = { x: this.boardWidth / 2, y: this.boardHeight * 0.85 }
    paddles.player2.position = { x: this.boardWidth / 2, y: this.boardHeight * 0.15 }
  }

  private applyPuckPhysics(deltaTime: number) {
    const { puck } = this.state
    puck.position.x += puck.velocity.x * deltaTime
    puck.position.y += puck.velocity.y * deltaTime

    puck.velocity.x *= PUCK_FRICTION
    puck.velocity.y *= PUCK_FRICTION

    const radius = puck.radius
    if (puck.position.x <= radius || puck.position.x >= this.boardWidth - radius) {
      puck.velocity.x = -puck.velocity.x * PUCK_WALL_DAMPING
      puck.position.x = Math.max(radius, Math.min(this.boardWidth - radius, puck.position.x))
    }

    if (puck.position.y <= radius || puck.position.y >= this.boardHeight - radius) {
      const scorer: PlayerId = puck.position.y <= radius ? "player1" : "player2"
      this.handleGoal(scorer)
    }
  }

  private checkCollisions() {
    const { puck, paddles } = this.state
    ;(Object.keys(paddles) as PlayerId[]).forEach((player) => {
      const paddle = paddles[player]
      const dx = puck.position.x - paddle.position.x
      const dy = puck.position.y - paddle.position.y
      const distance = Math.hypot(dx, dy)
      const minDistance = puck.radius + paddle.radius

      if (distance < minDistance) {
        const nx = dx / (distance || 1)
        const ny = dy / (distance || 1)
        const overlap = minDistance - distance
        puck.position.x += nx * overlap
        puck.position.y += ny * overlap

        const dot = puck.velocity.x * nx + puck.velocity.y * ny
        puck.velocity.x -= 2 * dot * nx
        puck.velocity.y -= 2 * dot * ny

        const speedLimit = PADDLE_SPEED_LIMIT
        const speed = Math.hypot(puck.velocity.x, puck.velocity.y)
        if (speed > speedLimit) {
          const scale = speedLimit / speed
          puck.velocity.x *= scale
          puck.velocity.y *= scale
        }
      }
    })
  }

  private handleGoal(scorer: PlayerId) {
    if (this.state.status !== "running") return

    this.state.scores[scorer] += 1
    this.emitEvent({ type: "goal", scorer })

    if (this.state.scores[scorer] >= GOALS_TO_WIN) {
      this.state.status = "finished"
      this.state.winner = scorer
      this.emitEvent({ type: "finished", winner: scorer })
      this.isActive = false
      this.notifyStateChange()
      return
    }

    this.resetPositions(scorer)
  }
}
