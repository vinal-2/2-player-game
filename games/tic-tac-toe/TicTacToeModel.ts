import type { GameModel } from "../../core/GameEngine"

export type CellValue = "X" | "O" | ""

export interface TicTacToeState {
  board: CellValue[]
  currentPlayer: CellValue
  scores: {
    X: number
    O: number
  }
  gameOver: boolean
  winner: CellValue | "draw" | null
  winningCells: number[]
}

/**
 * Tic Tac Toe Game Model
 *
 * Handles the game state and logic for the Tic Tac Toe game
 */
export class TicTacToeModel implements GameModel {
  public isActive = false
  public state: TicTacToeState
  private onCellPress: (index: number) => void = () => {}
  private onGameOver: (winner: CellValue | "draw") => void = () => {}

  constructor() {
    this.state = {
      board: Array(9).fill(""),
      currentPlayer: "X",
      scores: { X: 0, O: 0 },
      gameOver: false,
      winner: null,
      winningCells: [],
    }
  }

  /**
   * Sets the callback for when a cell is pressed
   */
  public setOnCellPress(callback: (index: number) => void): void {
    this.onCellPress = callback
  }

  /**
   * Sets the callback for when the game is over
   */
  public setOnGameOver(callback: (winner: CellValue | "draw") => void): void {
    this.onGameOver = callback
  }

  /**
   * Initializes the game
   */
  public initialize(): void {
    this.reset()
    this.isActive = true
  }

  /**
   * Updates the game state
   */
  public update(deltaTime: number): void {
    // No continuous updates needed for Tic Tac Toe
  }

  /**
   * Handles a cell press
   */
  public handleCellPress(index: number): boolean {
    if (this.state.board[index] !== "" || this.state.gameOver) {
      return false
    }

    // Update the board
    const newBoard = [...this.state.board]
    newBoard[index] = this.state.currentPlayer
    this.state.board = newBoard

    // Check for a winner
    const winner = this.checkWinner(newBoard)
    if (winner) {
      this.state.gameOver = true
      this.state.winner = winner

      if (winner !== "draw") {
        this.state.scores[winner]++
        this.onGameOver(winner)
      } else {
        this.onGameOver("draw")
      }

      return true
    }

    // Switch players
    this.state.currentPlayer = this.state.currentPlayer === "X" ? "O" : "X"

    // Notify listeners
    this.onCellPress(index)

    return true
  }

  /**
   * Makes a bot move
   */
  public makeBotMove(): boolean {
    if (this.state.gameOver || this.state.currentPlayer !== "O") {
      return false
    }

    const { board } = this.state

    // Try to win
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        const testBoard = [...board]
        testBoard[i] = "O"
        if (this.checkWinner(testBoard) === "O") {
          return this.handleCellPress(i)
        }
      }
    }

    // Try to block
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        const testBoard = [...board]
        testBoard[i] = "X"
        if (this.checkWinner(testBoard) === "X") {
          return this.handleCellPress(i)
        }
      }
    }

    // Take center if available
    if (board[4] === "") {
      return this.handleCellPress(4)
    }

    // Take corners if available
    const corners = [0, 2, 6, 8].filter((i) => board[i] === "")
    if (corners.length > 0) {
      return this.handleCellPress(corners[Math.floor(Math.random() * corners.length)])
    }

    // Take any available space
    const availableSpaces = board.map((cell, index) => (cell === "" ? index : -1)).filter((i) => i !== -1)
    if (availableSpaces.length > 0) {
      return this.handleCellPress(availableSpaces[Math.floor(Math.random() * availableSpaces.length)])
    }

    return false
  }

  /**
   * Checks if there is a winner
   */
  private checkWinner(board: CellValue[]): CellValue | "draw" | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        this.state.winningCells = [a, b, c]
        return board[a]
      }
    }

    // Check for draw
    if (!board.includes("")) {
      return "draw"
    }

    return null
  }

  /**
   * Resets the game
   */
  public reset(): void {
    this.state.board = Array(9).fill("")
    this.state.currentPlayer = "X"
    this.state.gameOver = false
    this.state.winner = null
    this.state.winningCells = []
  }

  /**
   * Resets the scores
   */
  public resetScores(): void {
    this.state.scores = { X: 0, O: 0 }
  }
}
