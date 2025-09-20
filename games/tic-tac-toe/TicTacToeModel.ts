import type { GameModel } from "../../core/GameEngine"

export type CellValue = "X" | "O" | ""

export type BotDifficulty = "easy" | "medium" | "hard"

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

const winningLines: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

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
  private onStateChange: () => void = () => {}

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

  public setOnStateChange(callback: () => void): void {
    this.onStateChange = callback
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

    const newBoard = [...this.state.board]
    newBoard[index] = this.state.currentPlayer
    this.state.board = newBoard

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

      this.onStateChange()
      return true
    }

    this.state.currentPlayer = this.state.currentPlayer === "X" ? "O" : "X"
    this.onCellPress(index)
    this.onStateChange()

    return true
  }

  /**
   * Makes a bot move
   */
  public makeBotMove(difficulty: BotDifficulty = "medium"): boolean {
    if (this.state.gameOver || this.state.currentPlayer !== "O") {
      return false
    }

    const move = this.chooseBotMove(difficulty)
    if (move === null || move === undefined) {
      return false
    }
    return this.handleCellPress(move)
  }

  private chooseBotMove(difficulty: BotDifficulty): number | null {
    const board = [...this.state.board]

    if (difficulty === "easy") {
      return this.getRandomMove(board)
    }

    if (difficulty === "hard") {
      return this.getHardMove(board)
    }

    return this.getMediumMove(board)
  }

  private getRandomMove(board: CellValue[]): number | null {
    const available = this.getAvailableMoves(board)
    if (available.length === 0) {
      return null
    }
    return available[Math.floor(Math.random() * available.length)]
  }

  private getMediumMove(board: CellValue[]): number | null {
    for (const move of this.getAvailableMoves(board)) {
      const testBoard = [...board]
      testBoard[move] = "O"
      if (this.evaluateBoard(testBoard) === "O") {
        return move
      }
    }

    for (const move of this.getAvailableMoves(board)) {
      const testBoard = [...board]
      testBoard[move] = "X"
      if (this.evaluateBoard(testBoard) === "X") {
        return move
      }
    }

    if (board[4] === "") {
      return 4
    }

    const corners = [0, 2, 6, 8].filter((index) => board[index] === "")
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }

    return this.getRandomMove(board)
  }

  private getHardMove(board: CellValue[]): number | null {
    let bestScore = -Infinity
    let bestMove: number | null = null

    for (const move of this.getAvailableMoves(board)) {
      const testBoard = [...board]
      testBoard[move] = "O"
      const score = this.minimax(testBoard, 0, false)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private minimax(board: CellValue[], depth: number, isMaximizing: boolean): number {
    const outcome = this.evaluateBoard(board)
    if (outcome === "O") {
      return 10 - depth
    }
    if (outcome === "X") {
      return depth - 10
    }
    if (outcome === "draw") {
      return 0
    }

    if (isMaximizing) {
      let bestScore = -Infinity
      for (const move of this.getAvailableMoves(board)) {
        board[move] = "O"
        const score = this.minimax(board, depth + 1, false)
        board[move] = ""
        bestScore = Math.max(bestScore, score)
      }
      return bestScore
    }

    let bestScore = Infinity
    for (const move of this.getAvailableMoves(board)) {
      board[move] = "X"
      const score = this.minimax(board, depth + 1, true)
      board[move] = ""
      bestScore = Math.min(bestScore, score)
    }
    return bestScore
  }

  private getAvailableMoves(board: CellValue[]): number[] {
    const moves: number[] = []
    board.forEach((cell, index) => {
      if (cell === "") {
        moves.push(index)
      }
    })
    return moves
  }

  private evaluateBoard(board: CellValue[]): CellValue | "draw" | null {
    for (const [a, b, c] of winningLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    if (!board.includes("")) {
      return "draw"
    }

    return null
  }

  /**
   * Checks if there is a winner
   */
  private checkWinner(board: CellValue[]): CellValue | "draw" | null {
    for (const [a, b, c] of winningLines) {
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
    this.onStateChange()
  }

  /**
   * Resets the scores
   */
  public resetScores(): void {
    this.state.scores = { X: 0, O: 0 }
    this.onStateChange()
  }
}
