import type { GameController } from "../../core/GameEngine"
import type { TicTacToeModel } from "./TicTacToeModel"

/**
 * Tic Tac Toe Game Controller
 *
 * Handles user input and updates the game model
 */
export class TicTacToeController implements GameController {
  private model: TicTacToeModel
  private gameMode: "friend" | "bot"
  private botDelay = 800 // milliseconds

  constructor(model: TicTacToeModel, gameMode: "friend" | "bot") {
    this.model = model
    this.gameMode = gameMode
  }

  /**
   * Initializes the controller
   */
  public initialize(): void {
    // Set up event handlers
    this.model.setOnCellPress(this.handleCellPress)
  }

  /**
   * Updates the controller
   */
  public update(deltaTime: number): void {
    // No continuous updates needed for Tic Tac Toe
  }

  /**
   * Handles a cell press
   */
  private handleCellPress = (index: number): void => {
    // If in bot mode and it's the bot's turn, make a bot move after a delay
    if (this.gameMode === "bot" && this.model.state.currentPlayer === "O" && !this.model.state.gameOver) {
      setTimeout(() => {
        this.model.makeBotMove()
      }, this.botDelay)
    }
  }

  /**
   * Handles user input
   */
  public handleInput(input: any): void {
    if (input.type === "cellPress") {
      const success = this.model.handleCellPress(input.index)

      if (success && this.gameMode === "bot" && this.model.state.currentPlayer === "O" && !this.model.state.gameOver) {
        setTimeout(() => {
          this.model.makeBotMove()
        }, this.botDelay)
      }
    } else if (input.type === "reset") {
      this.model.reset()
    } else if (input.type === "resetScores") {
      this.model.resetScores()
    }
  }

  /**
   * Sets the bot delay
   */
  public setBotDelay(delay: number): void {
    this.botDelay = delay
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    // No cleanup needed for Tic Tac Toe
  }
}
