ts
import type { GameModel } from "../../core/GameEngine";

type Player = "red" | "yellow";
type Board = (Player | "empty")[][];

export interface ConnectFourState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | null;
}

export class ConnectFourModel implements GameModel {
  public isActive = false;
  public state: ConnectFourState;
  private onGameOver: (winner: Player | "draw") => void = () => {};
  private readonly rows = 6;
  private readonly cols = 7;

  constructor() {
    this.state = {
      board: this.createBoard(),
      currentPlayer: "red",
      gameOver: false,
      winner: null,
    };
  }

  public setOnGameOver(callback: (winner: Player | "draw") => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
    this.isActive = true;
  }

  private createBoard(): Board {
    return Array.from({ length: this.rows }, () =>
      Array(this.cols).fill("empty")
    );
  }

  public reset(): void {
    this.state.board = this.createBoard();
    this.state.currentPlayer = "red";
    this.state.gameOver = false;
    this.state.winner = null;
  }

  public makeMove(col: number): boolean {
    if (this.state.gameOver) return false;
    if (!this.isValidMove(col)) return false;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.state.board[row][col] === "empty") {
        this.state.board[row][col] = this.state.currentPlayer;
        if (this.checkWin(row, col)) {
          this.state.gameOver = true;
          this.state.winner = this.state.currentPlayer;
          this.onGameOver(this.state.currentPlayer);
        } else if (this.isBoardFull()) {
          this.state.gameOver = true;
          this.onGameOver("draw");
        } else {
          this.state.currentPlayer =
            this.state.currentPlayer === "red" ? "yellow" : "red";
        }
        return true;
      }
    }
    return false;
  }

  private isValidMove(col: number): boolean {
    return col >= 0 && col < this.cols && this.state.board[0][col] === "empty";
  }

  private checkWin(row: number, col: number): boolean {
    return (
      this.checkHorizontal(row, col) ||
      this.checkVertical(row, col) ||
      this.checkDiagonal(row, col)
    );
  }

  private checkHorizontal(row: number, col: number): boolean {
    let count = 0;
    for (let i = Math.max(0, col - 3); i <= Math.min(this.cols - 1, col + 3); i++) {
      if (this.state.board[row][i] === this.state.currentPlayer) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) return true;
    }
    return false;
  }

  private checkVertical(row: number, col: number): boolean {
    let count = 0;
    for (let i = Math.max(0, row - 3); i <= Math.min(this.rows - 1, row + 3); i++) {
      if (this.state.board[i][col] === this.state.currentPlayer) {
        count++;
      } else {
        count = 0;
      }
      if (count >= 4) return true;
    }
    return false;
  }

  private checkDiagonal(row: number, col: number): boolean {
    return this.checkDiagonalUp(row,col) || this.checkDiagonalDown(row,col)
  }
  private checkDiagonalUp(row: number, col: number): boolean {
    let count = 0;
    for (let i = -3; i <= 3; i++) {
        const newRow = row - i;
        const newCol = col + i;
        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols && this.state.board[newRow][newCol] === this.state.currentPlayer) {
            count++;
        } else {
            count = 0;
        }
        if (count >= 4) return true;
    }
    return false;
}
private checkDiagonalDown(row: number, col: number): boolean {
    let count = 0;
    for (let i = -3; i <= 3; i++) {
        const newRow = row + i;
        const newCol = col + i;
        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols && this.state.board[newRow][newCol] === this.state.currentPlayer) {
            count++;
        } else {
            count = 0;
        }
        if (count >= 4) return true;
    }
    return false;
}
  private isBoardFull(): boolean {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.state.board[row][col] === "empty") {
          return false;
        }
      }
    }
    return true;
  }
}