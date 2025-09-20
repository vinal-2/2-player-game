import type { GameModel } from "../../core/GameEngine"

export interface PenaltyKicksState {
  status: "idle" | "countdown" | "running" | "summary"
  score: { shooter: number; keeper: number }
  shotsTaken: number
  maxShots: number
}

export class PenaltyKicksModel implements GameModel {
  public isActive = false
  public state: PenaltyKicksState

  constructor(public readonly roundShots = 5) {
    this.state = {
      status: "idle",
      score: { shooter: 0, keeper: 0 },
      shotsTaken: 0,
      maxShots: roundShots,
    }
  }

  public initialize(): void {
    this.reset()
    this.state.status = "countdown"
    this.isActive = true
  }

  public update(_deltaTime: number): void {
    // placeholder; real timing loop will arrive in implementation pass
  }

  public registerGoal(): void {
    this.state.score.shooter += 1
    this.afterShot()
  }

  public registerSave(): void {
    this.state.score.keeper += 1
    this.afterShot()
  }

  public reset(): void {
    this.state.status = "idle"
    this.state.score = { shooter: 0, keeper: 0 }
    this.state.shotsTaken = 0
  }

  private afterShot(): void {
    this.state.shotsTaken += 1
    if (this.state.shotsTaken >= this.state.maxShots) {
      this.state.status = "summary"
      this.isActive = false
    }
  }
}
