import type { GameModel } from "../../core/GameEngine"
import { CollisionDetection } from "../../utils/CollisionDetection"

// Define the game state types
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

/**
 * Air Hockey Game Model
 *
 * Handles the game state and logic for the Air Hockey game
 */
export class AirHockeyModel implements GameModel {
  public isActive = false
  public state: AirHockeyState
  private friction = 0.98
  private maxScore = 5
  private onGoalScored: (player: string) => void = () => {}
  private onGameOver: (winner: string) => void = () => {}

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
        y: boardHeight - 10,
        width: goalWidth,
        height: 20,
      },
      player2Goal: {
        x: (boardWidth - goalWidth) / 2,
        y: -10,
        width: goalWidth,
        height: 20,
      },
      scores: {
        player1: 0,
        player2: 0,
      },
      gameActive: false,
      winner: null,
    }
  }

  /**
   * Sets the callback for when a goal is scored
   */
  public setOnGoalScored(callback: (player: string) => void): void {
    this.onGoalScored = callback
  }

  /**
   * Sets the callback for when the game is over
   */
  public setOnGameOver(callback: (winner: string) => void): void {
    this.onGameOver = callback
  }

  /**
   * Initializes the game
   */
  public initialize(): void {
    this.resetPuck()
    this.state.gameActive = true
    this.isActive = true
  }

  /**
   * Updates the game state
   */
  public update(deltaTime: number): void {
    if (!this.state.gameActive) return

    // Apply friction
    this.state.puck.vx *= this.friction
    this.state.puck.vy *= this.friction

    // Update puck position
    this.state.puck.x += this.state.puck.vx
    this.state.puck.y += this.state.puck.vy

    // Check for wall collisions
    this.handleWallCollisions()

    // Check for paddle collisions
    this.handlePaddleCollisions()

    // Check for goals
    this.checkForGoals()
  }

  /**
   * Handles wall collisions
   */
  private handleWallCollisions(): void {
    const { puck, boardWidth } = this.state

    // Left and right walls
    if (puck.x - puck.radius <= 0) {
      puck.x = puck.radius
      puck.vx = -puck.vx
    } else if (puck.x + puck.radius >= boardWidth) {
      puck.x = boardWidth - puck.radius
      puck.vx = -puck.vx
    }
  }

  /**
   * Handles paddle collisions
   */
  private handlePaddleCollisions(): void {
    const { puck, player1Paddle, player2Paddle } = this.state

    // Check collision with player 1 paddle
    if (
      CollisionDetection.circleCollision(
        { x: puck.x, y: puck.y, radius: puck.radius },
        { x: player1Paddle.x, y: player1Paddle.y, radius: player1Paddle.radius },
      )
    ) {
      // Calculate collision response
      const angle = CollisionDetection.calculateBounceAngle(
        { x: player1Paddle.x, y: player1Paddle.y },
        { x: puck.x, y: puck.y },
      )

      const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy)
      const newSpeed = Math.max(speed, 5) // Minimum speed after collision

      puck.vx = Math.cos(angle) * newSpeed
      puck.vy = Math.sin(angle) * newSpeed
    }

    // Check collision with player 2 paddle
    if (
      CollisionDetection.circleCollision(
        { x: puck.x, y: puck.y, radius: puck.radius },
        { x: player2Paddle.x, y: player2Paddle.y, radius: player2Paddle.radius },
      )
    ) {
      // Calculate collision response
      const angle = CollisionDetection.calculateBounceAngle(
        { x: player2Paddle.x, y: player2Paddle.y },
        { x: puck.x, y: puck.y },
      )

      const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy)
      const newSpeed = Math.max(speed, 5) // Minimum speed after collision

      puck.vx = Math.cos(angle) * newSpeed
      puck.vy = Math.sin(angle) * newSpeed
    }
  }

  /**
   * Checks if a goal has been scored
   */
  private checkForGoals(): void {
    const { puck, player1Goal, player2Goal } = this.state

    // Check if puck is in player 1's goal
    if (
      puck.y + puck.radius >= player1Goal.y &&
      puck.x >= player1Goal.x &&
      puck.x <= player1Goal.x + player1Goal.width
    ) {
      this.handleGoal("player2")
    }

    // Check if puck is in player 2's goal
    else if (
      puck.y - puck.radius <= player2Goal.y + player2Goal.height &&
      puck.x >= player2Goal.x &&
      puck.x <= player2Goal.x + player2Goal.width
    ) {
      this.handleGoal("player1")
    }
  }

  /**
   * Handles a goal being scored
   */
  private handleGoal(scorer: string): void {
    this.state.gameActive = false

    // Update scores
    this.state.scores[scorer]++

    // Notify listeners
    this.onGoalScored(scorer)

    // Check if game is over
    if (this.state.scores[scorer] >= this.maxScore) {
      this.state.winner = scorer
      this.onGameOver(scorer)
    } else {
      // Reset for next round
      setTimeout(() => {
        this.resetPuck()
        this.state.gameActive = true
      }, 1000)
    }
  }

  /**
   * Resets the puck to the center with a random velocity
   */
  private resetPuck(): void {
    const { boardWidth, boardHeight } = this.state

    this.state.puck.x = boardWidth / 2
    this.state.puck.y = boardHeight / 2

    // Random angle between -45 and 45 degrees or 135 and 225 degrees
    const angle =
      Math.random() < 0.5
        ? (Math.random() * Math.PI) / 2 - Math.PI / 4
        : (Math.random() * Math.PI) / 2 - Math.PI / 4 + Math.PI

    const speed = 3
    this.state.puck.vx = Math.cos(angle) * speed
    this.state.puck.vy = Math.sin(angle) * speed
  }

  /**
   * Moves player 1's paddle
   */
  public movePlayer1Paddle(x: number, y: number): void {
    const { player1Paddle, boardWidth, boardHeight } = this.state

    // Constrain to board boundaries
    player1Paddle.x = Math.max(player1Paddle.radius, Math.min(x, boardWidth - player1Paddle.radius))

    // Constrain to bottom half of the board
    player1Paddle.y = Math.max(boardHeight / 2, Math.min(y, boardHeight - player1Paddle.radius))
  }

  /**
   * Moves player 2's paddle
   */
  public movePlayer2Paddle(x: number, y: number): void {
    const { player2Paddle, boardWidth, boardHeight } = this.state

    // Constrain to board boundaries
    player2Paddle.x = Math.max(player2Paddle.radius, Math.min(x, boardWidth - player2Paddle.radius))

    // Constrain to top half of the board
    player2Paddle.y = Math.max(player2Paddle.radius, Math.min(y, boardHeight / 2))
  }

  /**
   * Updates the bot's paddle position
   */
  public updateBotPaddle(difficulty: number): void {
    const { puck, player2Paddle, boardWidth } = this.state

    // Only move if the puck is in the top half
    if (puck.y < this.state.boardHeight / 2) {
      // Calculate target X position (with some error based on difficulty)
      const errorFactor = 1 - difficulty // 0 = perfect, 1 = very inaccurate
      const randomError = (Math.random() - 0.5) * errorFactor * boardWidth * 0.5
      const targetX = puck.x + randomError

      // Move towards target with a speed based on difficulty
      const speed = 0.05 + difficulty * 0.1 // 0.05 to 0.15
      const newX = player2Paddle.x + (targetX - player2Paddle.x) * speed

      // Update position (constrained to board)
      player2Paddle.x = Math.max(player2Paddle.radius, Math.min(newX, boardWidth - player2Paddle.radius))
    }
  }

  /**
   * Resets the game
   */
  public reset(): void {
    this.state.scores = { player1: 0, player2: 0 }
    this.state.winner = null
    this.resetPuck()
    this.state.gameActive = true
  }
}
