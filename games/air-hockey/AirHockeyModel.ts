import type { GameModel } from "../../core/GameEngine"
import { CollisionDetection } from "../../utils/CollisionDetection"

export interface Paddle {
  x: number
  y: number
  radius: number
}

export interface Puck {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export interface Goal {
  x: number
  y: number
  width: number
  height: number
}

export interface AirHockeyState {
  boardWidth: number
  boardHeight: number
  player1Paddle: Paddle
  player2Paddle: Paddle
  puck: Puck
  player1Goal: Goal
  player2Goal: Goal
  scores: {
    player1: number
    player2: number
  }
  gameActive: boolean
  winner: string | null
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const MAX_GOALS = 5
const GOAL_RESET_DELAY = 900
const PUCK_SPEED_MIN = 3
const PUCK_SPEED_MAX = 15
const WALL_DAMPING = 0.965

/**
 * Air Hockey Game Model with improved physics and AI support
 */
export class AirHockeyModel implements GameModel {
  public isActive = false
  public state: AirHockeyState

  private friction = 0.9965
  private paddleVelocity = {
    player1: { vx: 0, vy: 0 },
    player2: { vx: 0, vy: 0 },
  }

  private onGoalScored: (player: string) => void = () => {}
  private onGameOver: (winner: string) => void = () => {}
  private onStateChange: () => void = () => {}

  constructor(boardWidth: number, boardHeight: number) {
    const paddleRadius = boardWidth * 0.05
    const puckRadius = boardWidth * 0.03
    const goalWidth = boardWidth * 0.4

    this.state = {
      boardWidth,
      boardHeight,
      player1Paddle: {
        x: boardWidth / 2,
        y: boardHeight - paddleRadius * 2,
        radius: paddleRadius,
      },
      player2Paddle: {
        x: boardWidth / 2,
        y: paddleRadius * 2,
        radius: paddleRadius,
      },
      puck: {
        x: boardWidth / 2,
        y: boardHeight / 2,
        vx: 0,
        vy: 0,
        radius: puckRadius,
      },
      player1Goal: {
        x: (boardWidth - goalWidth) / 2,
        y: boardHeight - 12,
        width: goalWidth,
        height: 24,
      },
      player2Goal: {
        x: (boardWidth - goalWidth) / 2,
        y: -12,
        width: goalWidth,
        height: 24,
      },
      scores: {
        player1: 0,
        player2: 0,
      },
      gameActive: false,
      winner: null,
    }
  }

  public setOnGoalScored(callback: (player: string) => void): void {
    this.onGoalScored = callback
  }

  public setOnGameOver(callback: (winner: string) => void): void {
    this.onGameOver = callback
  }

  public setOnStateChange(callback: () => void): void {
    this.onStateChange = callback
  }

  public initialize(): void {
    this.resetPuck()
    this.state.gameActive = true
    this.isActive = true
  }

  public update(deltaTime: number): void {
    if (!this.state.gameActive) return

    const dt = clamp(deltaTime, 0.001, 0.05)
    const frameScale = dt * 60
    const damping = Math.pow(this.friction, frameScale)

    const { puck } = this.state

    puck.vx *= damping
    puck.vy *= damping

    if (Math.abs(puck.vx) < 0.01) puck.vx = 0
    if (Math.abs(puck.vy) < 0.01) puck.vy = 0

    puck.x += puck.vx * frameScale
    puck.y += puck.vy * frameScale

    this.handleWallCollisions()
    this.handlePaddleCollisions()
    this.checkForGoals()

    this.decayPaddleVelocity()
    this.onStateChange()
  }

  private decayPaddleVelocity(): void {
    this.paddleVelocity.player1.vx *= 0.6
    this.paddleVelocity.player1.vy *= 0.6
    this.paddleVelocity.player2.vx *= 0.6
    this.paddleVelocity.player2.vy *= 0.6
  }

  private handleWallCollisions(): void {
    const { puck, boardWidth, boardHeight } = this.state

    if (puck.x - puck.radius <= 0) {
      puck.x = puck.radius
      puck.vx = Math.abs(puck.vx) * WALL_DAMPING
    } else if (puck.x + puck.radius >= boardWidth) {
      puck.x = boardWidth - puck.radius
      puck.vx = -Math.abs(puck.vx) * WALL_DAMPING
    }

    if (puck.y - puck.radius <= 0) {
      puck.y = puck.radius
      puck.vy = Math.abs(puck.vy) * WALL_DAMPING
    } else if (puck.y + puck.radius >= boardHeight) {
      puck.y = boardHeight - puck.radius
      puck.vy = -Math.abs(puck.vy) * WALL_DAMPING
    }
  }

  private handlePaddleCollisions(): void {
    const { puck, player1Paddle, player2Paddle } = this.state

    if (
      CollisionDetection.circleCollision(
        { x: puck.x, y: puck.y, radius: puck.radius },
        { x: player1Paddle.x, y: player1Paddle.y, radius: player1Paddle.radius },
      )
    ) {
      this.resolvePaddleBounce(player1Paddle, this.paddleVelocity.player1)
    }

    if (
      CollisionDetection.circleCollision(
        { x: puck.x, y: puck.y, radius: puck.radius },
        { x: player2Paddle.x, y: player2Paddle.y, radius: player2Paddle.radius },
      )
    ) {
      this.resolvePaddleBounce(player2Paddle, this.paddleVelocity.player2)
    }
  }

  private resolvePaddleBounce(paddle: Paddle, paddleVelocity: { vx: number; vy: number }): void {
    const { puck } = this.state

    const dx = puck.x - paddle.x
    const dy = puck.y - paddle.y
    const distance = Math.max(Math.hypot(dx, dy), 0.001)
    const nx = dx / distance
    const ny = dy / distance

    // Push puck outside the paddle to avoid sticking
    const overlap = paddle.radius + puck.radius - distance
    if (overlap > 0) {
      puck.x += nx * overlap
      puck.y += ny * overlap
    }

    const incomingDot = puck.vx * nx + puck.vy * ny
    const reflectVx = puck.vx - 2 * incomingDot * nx
    const reflectVy = puck.vy - 2 * incomingDot * ny

    const paddleInfluenceX = paddleVelocity.vx * 0.7
    const paddleInfluenceY = paddleVelocity.vy * 0.7

    let newVx = reflectVx + paddleInfluenceX
    let newVy = reflectVy + paddleInfluenceY

    let speed = Math.hypot(newVx, newVy)
    if (speed < PUCK_SPEED_MIN) {
      const scale = PUCK_SPEED_MIN / (speed || 1)
      newVx *= scale
      newVy *= scale
      speed = PUCK_SPEED_MIN
    }
    if (speed > PUCK_SPEED_MAX) {
      const scale = PUCK_SPEED_MAX / speed
      newVx *= scale
      newVy *= scale
    }

    puck.vx = newVx
    puck.vy = newVy
  }

  private checkForGoals(): void {
    const { puck, player1Goal, player2Goal } = this.state

    if (
      puck.y + puck.radius >= player1Goal.y &&
      puck.x >= player1Goal.x &&
      puck.x <= player1Goal.x + player1Goal.width
    ) {
      this.handleGoal("player2")
    } else if (
      puck.y - puck.radius <= player2Goal.y + player2Goal.height &&
      puck.x >= player2Goal.x &&
      puck.x <= player2Goal.x + player2Goal.width
    ) {
      this.handleGoal("player1")
    }
  }

  private handleGoal(scorer: string): void {
    this.state.gameActive = false
    this.state.scores[scorer]++
    this.onGoalScored(scorer)
    // Nudge puck velocity to reduce silent stalls between rounds
    this.state.puck.vx = 0
    this.state.puck.vy = 0
    this.onStateChange()

    if (this.state.scores[scorer] >= MAX_GOALS) {
      this.state.winner = scorer
      this.onGameOver(scorer)
      this.onStateChange()
      return
    }

    setTimeout(() => {
      this.resetPuck()
      this.state.gameActive = true
      this.onStateChange()
    }, GOAL_RESET_DELAY)
  }

  private resetPuck(): void {
    const { boardWidth, boardHeight, puck } = this.state

    puck.x = boardWidth / 2
    puck.y = boardHeight / 2

    const baseAngle = Math.random() * Math.PI * 2
    const speed = clamp(Math.random() * 4 + 5, PUCK_SPEED_MIN, PUCK_SPEED_MAX * 0.6)
    puck.vx = Math.cos(baseAngle) * speed
    puck.vy = Math.sin(baseAngle) * speed

    this.onStateChange()
  }

  public movePlayer1Paddle(x: number, y: number): void {
    const { player1Paddle, boardWidth, boardHeight } = this.state
    const clampedX = clamp(x, player1Paddle.radius, boardWidth - player1Paddle.radius)
    const clampedY = clamp(y, boardHeight / 2, boardHeight - player1Paddle.radius)

    this.paddleVelocity.player1.vx = clampedX - player1Paddle.x
    this.paddleVelocity.player1.vy = clampedY - player1Paddle.y

    player1Paddle.x = clampedX
    player1Paddle.y = clampedY
  }

  public movePlayer2Paddle(x: number, y: number): void {
    const { player2Paddle, boardWidth, boardHeight } = this.state
    const clampedX = clamp(x, player2Paddle.radius, boardWidth - player2Paddle.radius)
    const clampedY = clamp(y, player2Paddle.radius, boardHeight / 2)

    this.paddleVelocity.player2.vx = clampedX - player2Paddle.x
    this.paddleVelocity.player2.vy = clampedY - player2Paddle.y

    player2Paddle.x = clampedX
    player2Paddle.y = clampedY
  }

  public updateBotPaddle(difficulty: number): void {
    const { puck, player2Paddle, boardWidth, boardHeight } = this.state

    const puckSpeed = Math.hypot(puck.vx, puck.vy)
    const baseFocus = 0.52 - (1 - difficulty) * 0.08
    const focusAdjust = Math.min(puckSpeed / PUCK_SPEED_MAX, 1) * 0.12
    const focusZone = boardHeight * clamp(baseFocus + focusAdjust, 0.4, 0.68)
    if (puck.y >= focusZone) return

    const predictionSteps = 12 + Math.floor(difficulty * 22)
    const predictedX = this.predictPuckX(predictionSteps)

    const misRead = (Math.random() - 0.5) * (1 - difficulty) * boardWidth * 0.18
    const laneLimit = boardWidth * (0.18 + difficulty * 0.22)
    const center = boardWidth / 2
    const targetX = clamp(
      center + clamp(predictedX + misRead - center, -laneLimit, laneLimit),
      player2Paddle.radius,
      boardWidth - player2Paddle.radius,
    )

    let chaseSpeed = 0.07 + difficulty * 0.14 + (puckSpeed / PUCK_SPEED_MAX) * 0.04
    chaseSpeed = clamp(chaseSpeed, 0.07, 0.24)

    const delta = (targetX - player2Paddle.x) * chaseSpeed
    player2Paddle.x += delta
    this.paddleVelocity.player2.vx = delta
  }

  private predictPuckX(steps: number): number {
    const { puck, boardWidth } = this.state
    let simulatedX = puck.x
    let simulatedY = puck.y
    let vx = puck.vx
    let vy = puck.vy

    for (let i = 0; i < steps; i++) {
      simulatedX += vx
      simulatedY += vy

      if (simulatedX - puck.radius <= 0 || simulatedX + puck.radius >= boardWidth) {
        vx = -vx
        simulatedX = clamp(simulatedX, puck.radius, boardWidth - puck.radius)
      }
    }

    return simulatedX
  }

  public reset(): void {
    this.state.scores = { player1: 0, player2: 0 }
    this.state.winner = null
    this.resetPuck()
    this.state.gameActive = true
    this.onStateChange()
  }
}
