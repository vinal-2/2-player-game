import type { GameModel } from "../../core/GameEngine"

export type TicTacToeWinner = "player1" | "player2" | "draw" | null

export interface TicTacToeState {
  status: "idle" | "running" | "finished"
  winner: TicTacToeWinner
}

export class TicTacToeModel implements GameModel {
  public isActive = false
  public state: TicTacToeState = {
    status: "idle",
    winner: null,
  }

  public initialize(): void {
    this.isActive = true
    this.reset()
  }

  public update(): void {}

  public reset(): void {
    this.state = { status: "running", winner: null }
  }
}

export default TicTacToeModel
