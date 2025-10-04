import type { GameModel } from "../../core/GameEngine"

export type PingPongWinner = "player1" | "player2" | "draw" | null

export interface PingPongState {
  status: "idle" | "running" | "finished"
  winner: PingPongWinner
}

export class PingPongModel implements GameModel {
  public isActive = false
  public state: PingPongState = {
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

export default PingPongModel
