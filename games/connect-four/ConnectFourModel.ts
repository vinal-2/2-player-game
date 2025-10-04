import type { GameModel } from "../../core/GameEngine"

export type ConnectFourWinner = "player1" | "player2" | "draw" | null

export interface ConnectFourState {
  status: "idle" | "running" | "finished"
  winner: ConnectFourWinner
}

export class ConnectFourModel implements GameModel {
  public isActive = false
  public state: ConnectFourState = {
    status: "idle",
    winner: null,
  }

  private notifyGameOver: (winner: "player1" | "player2" | "draw") => void = () => {}

  public setOnGameOver(listener: (winner: "player1" | "player2" | "draw") => void) {
    this.notifyGameOver = listener
  }

  public initialize(): void {
    this.isActive = true
    this.reset()
  }

  public update(): void {
    // Placeholder implementation has no per-frame updates
  }

  public reset(): void {
    this.state = { status: "running", winner: null }
  }

  public finish(winner: "player1" | "player2" | "draw"): void {
    this.state = { status: "finished", winner }
    this.notifyGameOver(winner)
  }
}

export default ConnectFourModel
