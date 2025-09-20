import type { GameController } from "../../core/GameEngine"
import type { TicTacToeModel, BotDifficulty } from "./TicTacToeModel"

/**
 * Tic Tac Toe Game Controller
 *
 * Handles user input and updates the game model
 */
export class TicTacToeController implements GameController {
  private model: TicTacToeModel
  private gameMode: "friend" | "bot"
  private botDelay = 800 // milliseconds
  private botDifficulty: BotDifficulty = "medium"
  private botMoveTimeout: ReturnType<typeof setTimeout> | null = null

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
    if (this.shouldBotPlay()) {
      this.scheduleBotMove()
    }
  }

  /**
   * Handles user input
   */
  public handleInput(input: any): void {
    if (input.type === "cellPress") {
      const success = this.model.handleCellPress(input.index)

      if (success && this.shouldBotPlay()) {
        this.scheduleBotMove()
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

  public setDifficulty(difficulty: BotDifficulty): void {
    this.botDifficulty = difficulty
    if (difficulty === "easy") {
      this.botDelay = 900
    } else if (difficulty === "hard") {
      this.botDelay = 500
    } else {
      this.botDelay = 700
    }
  }

  private shouldBotPlay(): boolean {
    return this.gameMode === "bot" && this.model.state.currentPlayer === "O" && !this.model.state.gameOver
  }

  private scheduleBotMove(): void {
    if (this.botMoveTimeout) {
      clearTimeout(this.botMoveTimeout)
    }
    this.botMoveTimeout = setTimeout(() => {
      this.model.makeBotMove(this.botDifficulty)
      this.botMoveTimeout = null
    }, this.botDelay)
  }

  /**
   * Cleans up the controller
   */
  public cleanup(): void {
    if (this.botMoveTimeout) {
      clearTimeout(this.botMoveTimeout)
    }
  }
}
