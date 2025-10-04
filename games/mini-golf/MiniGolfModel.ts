import type { GameModel } from "../../core/GameEngine"

export type MiniGolfWinner = "player1" | "player2" | "draw" | null

export interface MiniGolfState {
  status: "idle" | "running" | "finished"
  winner: MiniGolfWinner
}

export class MiniGolfModel implements GameModel {
  public isActive = false
  public state: MiniGolfState = {
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

  public update(): void {}

  public reset(): void {
    this.state = { status: "running", winner: null }
  }

  public finish(winner: "player1" | "player2" | "draw"): void {
    this.state = { status: "finished", winner }
    this.notifyGameOver(winner)
  }
}

export default MiniGolfModel
