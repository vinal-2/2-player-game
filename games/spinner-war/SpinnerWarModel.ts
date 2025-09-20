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
  powerUp?: { x: number; y: number; radius: number; type: 'speed'; expiresAt: number } | null;
  boosts: { player1: number; player2: number }; // multiplier
  gameActive: boolean;
  winner: string | null;
}

export class SpinnerWarModel implements GameModel {
  public isActive = false;
  public state: SpinnerWarState;
  private friction = 0.985; // lighter drag for momentum
  private wallDamping = 0.92;
  private burstThreshold = 7; // relative speed for burst FX
  private onImpact: (x: number, y: number, energy: number) => void = () => {};
  private onPickup: (x: number, y: number, who: 'player1'|'player2') => void = () => {};
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
      powerUp: null,
      boosts: { player1: 1, player2: 1 },
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

    this.updateSpinner(this.state.player1, this.state.boosts.player1);
    this.updateSpinner(this.state.player2, this.state.boosts.player2);

    this.handleWallCollision(this.state.player1);
    this.handleWallCollision(this.state.player2);

    this.handleSpinnerCollision();
    this.updatePowerUp(deltaTime);
    this.checkPowerUpPickup();
    this.checkForOutOfBounds();
  }

  private updateSpinner(spinner: Spinner, boostMultiplier: number): void {
    // Apply friction
    spinner.vx *= this.friction;
    spinner.vy *= this.friction;

    // Update position
    spinner.x += spinner.vx * boostMultiplier;
    spinner.y += spinner.vy * boostMultiplier;
  }

  private handleWallCollision(spinner: Spinner): void {
    const { areaCenterX, areaCenterY, areaRadius } = this.state;
    const dx = spinner.x - areaCenterX;
    const dy = spinner.y - areaCenterY;
    const dist = Math.max(Math.hypot(dx, dy), 0.0001);
    const maxDist = areaRadius - spinner.radius;
    if (dist > maxDist) {
      // push back inside and reflect velocity along normal
      const nx = dx / dist;
      const ny = dy / dist;
      spinner.x = areaCenterX + nx * maxDist;
      spinner.y = areaCenterY + ny * maxDist;
      const vn = spinner.vx * nx + spinner.vy * ny;
      spinner.vx = (spinner.vx - 2 * vn * nx) * this.wallDamping;
      spinner.vy = (spinner.vy - 2 * vn * ny) * this.wallDamping;
      const energy = Math.abs(vn);
      if (energy > this.burstThreshold) this.onImpact(spinner.x, spinner.y, energy);
    }
  }

  private handleSpinnerCollision(): void {
    const { player1, player2 } = this.state;

    if (
      CollisionDetection.circleCollision(
        { x: player1.x, y: player1.y, radius: player1.radius },
        { x: player2.x, y: player2.y, radius: player2.radius }
      )
    ) {
      const dx = player2.x - player1.x;
      const dy = player2.y - player1.y;
      const dist = Math.max(Math.hypot(dx, dy), 0.0001);
      const nx = dx / dist;
      const ny = dy / dist;

      // Separate to avoid interpenetration
      const overlap = player1.radius + player2.radius - dist;
      const push = overlap / 2 + 0.5;
      player1.x -= nx * push;
      player1.y -= ny * push;
      player2.x += nx * push;
      player2.y += ny * push;

      // Relative velocity along normal
      const rvx = player2.vx - player1.vx;
      const rvy = player2.vy - player1.vy;
      const relVel = rvx * nx + rvy * ny;

      // Simple elastic impulse with damping
      const impulse = -1.2 * relVel;
      player1.vx -= impulse * nx;
      player1.vy -= impulse * ny;
      player2.vx += impulse * nx;
      player2.vy += impulse * ny;

      const energy = Math.abs(relVel);
      if (energy > this.burstThreshold) this.onImpact((player1.x + player2.x) / 2, (player1.y + player2.y) / 2, energy);
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
    this.state.powerUp = null;
    this.state.boosts = { player1: 1, player2: 1 };
  }

  public setOnImpact(callback: (x: number, y: number, energy: number) => void) {
    this.onImpact = callback;
  }
  public setOnPickup(callback: (x: number, y: number, who: 'player1'|'player2') => void) {
    this.onPickup = callback;
  }

  // Power-up logic
  private nextSpawnIn = 0;
  private lastTime = Date.now();

  private updatePowerUp(deltaTime: number) {
    const now = Date.now();
    if (!this.state.powerUp) {
      if (this.nextSpawnIn <= 0) {
        // schedule next spawn 12–20s
        this.nextSpawnIn = 12000 + Math.floor(Math.random() * 8000);
        this.lastTime = now;
      } else {
        this.nextSpawnIn -= now - this.lastTime;
        this.lastTime = now;
        if (this.nextSpawnIn <= 0) {
          const r = this.state.areaRadius * 0.65;
          const angle = Math.random() * Math.PI * 2;
          const px = this.state.areaCenterX + Math.cos(angle) * r;
          const py = this.state.areaCenterY + Math.sin(angle) * r;
          this.state.powerUp = { x: px, y: py, radius: 10, type: 'speed', expiresAt: now + 6000 };
        }
      }
    } else {
      // Despawn if expired
      if (now > this.state.powerUp.expiresAt) {
        this.state.powerUp = null;
        this.nextSpawnIn = 4000; // shorter wait to try again
        this.lastTime = now;
      }
    }

    // Decay boosts softly back to 1
    this.state.boosts.player1 = 1 + (this.state.boosts.player1 - 1) * 0.96;
    this.state.boosts.player2 = 1 + (this.state.boosts.player2 - 1) * 0.96;
  }

  private checkPowerUpPickup() {
    const pu = this.state.powerUp;
    if (!pu) return;
    const { player1, player2 } = this.state;
    const hit1 = CollisionDetection.circleCollision({ x: pu.x, y: pu.y, radius: pu.radius }, { x: player1.x, y: player1.y, radius: player1.radius });
    const hit2 = CollisionDetection.circleCollision({ x: pu.x, y: pu.y, radius: pu.radius }, { x: player2.x, y: player2.y, radius: player2.radius });
    if (hit1 || hit2) {
      const who = hit1 ? 'player1' : 'player2';
      this.state.boosts[who] = Math.min(1.5, this.state.boosts[who] + 0.35);
      this.state.powerUp = null;
      this.nextSpawnIn = 10000; // delay next spawn after pickup
      this.lastTime = Date.now();
      // pickup cue at pickup center
      this.onPickup(pu.x, pu.y, who);
    }
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
