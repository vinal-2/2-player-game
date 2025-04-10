import type { GameController } from "../../core/GameEngine"
import type { AirHockeyModel } from "./AirHockeyModel"
import { InputManager } from "../../utils/InputManager"

/**
 * Air Hockey Game Controller
 *
 * Handles user input and updates the game model
 */
export class AirHockeyController implements GameController {
  private model: AirHockeyModel
  private inputManager: InputManager
  private gameMode: "friend" | "bot"
  private botDifficulty = 0.5 // 0 to 1, where 1 is hardest

  constructor(model: AirHockeyModel, gameMode: "friend" | "bot") {
    this.model = model
    this.gameMode = gameMode
    this.inputManager = InputManager.getInstance()
  }

  /**
   * Initializes the controller
   */
  public initialize(): void {
    // Register input handlers
    this.inputManager.registerPanListener("player1Paddle", this.handlePlayer1Input)

    if (this.gameMode === "friend") {
      this.inputManager.registerPanListener("player2Paddle", this.handlePlayer2Input)
    }
  }

  /**
   * Updates the controller
   */
  public update(deltaTime: number): void {
    // Update bot if in bot mode
    if (this.gameMode === "bot" && this.model.state.gameActive) {
      this.model.updateBotPaddle(this.botDifficulty)
    }
  }

  /**
   * Handles input for player 1
   */
  private handlePlayer1Input = (gestureState: any): void => {
    if (!this.model.state.gameActive) return

    const { player1Paddle } = this.model.state
    const newX = player1Paddle.x + gestureState.dx
    const newY = player1Paddle.y + gestureState.dy

    this.model.movePlayer1Paddle(newX, newY)
  }

  /**
   * Handles input for player 2
   */
  private handlePlayer2Input = (gestureState: any): void => {
    if (!this.model.state.gameActive || this.gameMode !== "friend") return

    const { player2Paddle } = this.model.state
    const newX = player2Paddle.x + gestureState.dx
    const newY = player2Paddle.y + gestureState.dy

    this.model.movePlayer2Paddle(newX, newY)
  }

  /**
   * Sets the bot difficulty
   */
  public setBotDifficulty(difficulty: number): void {
    // Clamp between 0 and 1
    this.botDifficulty = Math.max(0, Math.min(difficulty, 1))
  }

  /**
   * Handles any input
   */
  public handleInput(input: any): void {
    // This method is required by the interface but not used directly
    // Input is handled by the registered listeners
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    this.inputManager.removePanListener("player1Paddle")
    this.inputManager.removePanListener("player2Paddle")
  }
}
