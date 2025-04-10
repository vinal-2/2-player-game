import { CollisionDetection } from "../../utils/CollisionDetection";
import type { GameModel } from "../../core/GameEngine";

export interface Spinner {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

export interface SpinnerWarState {
  player1: Spinner;
  player2: Spinner;
  areaRadius: number;
  areaCenterX: number;
  areaCenterY: number;
  gameActive: boolean;
  winner: string | null;
}

export class SpinnerWarModel implements GameModel {
  public isActive = false;
  public state: SpinnerWarState;
  private friction = 0.98;
  private onGameOver: (winner: string) => void = () => {};

  constructor(areaRadius: number, areaCenterX: number, areaCenterY: number) {
    const spinnerRadius = areaRadius * 0.15;
    this.state = {
      player1: {
        x: areaCenterX - areaRadius * 0.3,
        y: areaCenterY,
        radius: spinnerRadius,
        vx: 0,
        vy: 0,
        color: "#FF5252",
      },
      player2: {
        x: areaCenterX + areaRadius * 0.3,
        y: areaCenterY,
        radius: spinnerRadius,
        vx: 0,
        vy: 0,
        color: "#2196F3",
      },
      areaRadius,
      areaCenterX,
      areaCenterY,
      gameActive: false,
      winner: null,
    };
  }

  public setOnGameOver(callback: (winner: string) => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
    this.state.gameActive = true;
    this.isActive = true;
  }

  public update(deltaTime: number): void {
    if (!this.state.gameActive) return;

    this.updateSpinner(this.state.player1);
    this.updateSpinner(this.state.player2);

    this.handleSpinnerCollision();
    this.checkForOutOfBounds();
  }

  private updateSpinner(spinner: Spinner): void {
    // Apply friction
    spinner.vx *= this.friction;
    spinner.vy *= this.friction;

    // Update position
    spinner.x += spinner.vx;
    spinner.y += spinner.vy;
  }

  private handleSpinnerCollision(): void {
    const { player1, player2 } = this.state;

    if (
      CollisionDetection.circleCollision(
        { x: player1.x, y: player1.y, radius: player1.radius },
        { x: player2.x, y: player2.y, radius: player2.radius }
      )
    ) {
      const angle = CollisionDetection.calculateBounceAngle(
        { x: player1.x, y: player1.y },
        { x: player2.x, y: player2.y }
      );

      const speed1 = Math.sqrt(player1.vx * player1.vx + player1.vy * player1.vy);
      const speed2 = Math.sqrt(player2.vx * player2.vx + player2.vy * player2.vy);

      player1.vx = Math.cos(angle) * speed2;
      player1.vy = Math.sin(angle) * speed2;
      player2.vx = Math.cos(angle + Math.PI) * speed1;
      player2.vy = Math.sin(angle + Math.PI) * speed1;
    }
  }

  private checkForOutOfBounds(): void {
    const { player1, player2, areaRadius, areaCenterX, areaCenterY } = this.state;

    const distanceToCenter1 = Math.sqrt(
      (player1.x - areaCenterX) ** 2 + (player1.y - areaCenterY) ** 2
    );
    const distanceToCenter2 = Math.sqrt(
      (player2.x - areaCenterX) ** 2 + (player2.y - areaCenterY) ** 2
    );

    if (distanceToCenter1 + player1.radius > areaRadius) {
        this.state.gameActive = false;
        this.state.winner = "player2";
        this.onGameOver("player2");
      } else if (distanceToCenter2 + player2.radius > areaRadius) {
        this.state.gameActive = false;
        this.state.winner = "player1";
        this.onGameOver("player1");
      }
  }

  public reset(): void {
    const { areaRadius, areaCenterX, areaCenterY } = this.state;
    const spinnerRadius = areaRadius * 0.15;

    this.state.player1 = {
      x: areaCenterX - areaRadius * 0.3,
      y: areaCenterY,
      radius: spinnerRadius,
      vx: 0,
      vy: 0,
      color: "#FF5252",
    };

    this.state.player2 = {
      x: areaCenterX + areaRadius * 0.3,
      y: areaCenterY,
      radius: spinnerRadius,
      vx: 0,
      vy: 0,
      color: "#2196F3",
    };
    this.state.gameActive = true;
    this.state.winner = null;
  }
  public movePlayer1(vx: number, vy: number): void{
    this.state.player1.vx += vx
    this.state.player1.vy += vy
  }

  public movePlayer2(vx: number, vy: number): void{
    this.state.player2.vx += vx
    this.state.player2.vy += vy
  }
}