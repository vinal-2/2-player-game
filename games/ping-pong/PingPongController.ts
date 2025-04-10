import type { GameModel } from "../../core/GameEngine";
import { useSound } from "../../contexts/SoundContext";
import { useEffect, useRef } from "react";

type Player = "player1" | "player2";

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  xSpeed: number;
  ySpeed: number;
}

export interface PingPongState {
  player1: Paddle;
  player2: Paddle;
  ball: Ball;
  score: {
    player1: number;
    player2: number;
  };
  gameOver: boolean;
  winner: Player | null;
}

export class PingPongModel implements GameModel {
  public state: PingPongState;
  private onGameOver: (winner: Player | "draw") => void = () => {};
  private playSound: (sound: any) => void;

  constructor(playSound: (sound: any) => void) {
    this.state = {
      player1: { x: 10, y: 200, width: 10, height: 100, speed: 8 },
      player2: { x: 460, y: 200, width: 10, height: 100, speed: 8 },
      ball: { x: 240, y: 250, radius: 10, xSpeed: 5, ySpeed: 5 },
      score: { player1: 0, player2: 0 },
      gameOver: false,
      winner: null,
    };
    this.playSound = playSound;
  }

  public setOnGameOver(callback: (winner: Player | "draw") => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
  }

  public reset(): void {
    this.state.player1.y = 200;
    this.state.player2.y = 200;
    this.state.ball = { x: 240, y: 250, radius: 10, xSpeed: 5, ySpeed: 5 };
    this.state.score = { player1: 0, player2: 0 };
    this.state.gameOver = false;
    this.state.winner = null;
  }

  public update(): void {
    if (this.state.gameOver) return;
    // Move ball
    this.state.ball.x += this.state.ball.xSpeed;
    this.state.ball.y += this.state.ball.ySpeed;

    // Bounce off top and bottom walls
    if (this.state.ball.y + this.state.ball.radius > 500 || this.state.ball.y - this.state.ball.radius < 0) {
      this.state.ball.ySpeed *= -1;
      // Play sound
      this.playSound(require("../../assets/sounds/wall-hit.mp3"));
    }

    // Check for paddle collisions
    const player1Collision =
      this.state.ball.x - this.state.ball.radius < this.state.player1.x + this.state.player1.width &&
      this.state.ball.y > this.state.player1.y &&
      this.state.ball.y < this.state.player1.y + this.state.player1.height;

    const player2Collision =
      this.state.ball.x + this.state.ball.radius > this.state.player2.x &&
      this.state.ball.y > this.state.player2.y &&
      this.state.ball.y < this.state.player2.y + this.state.player2.height;

    if (player1Collision || player2Collision) {
      this.state.ball.xSpeed *= -1;
      // Play sound
      this.playSound(require("../../assets/sounds/paddle-hit.mp3"));
    }

    // Check for scoring
    if (this.state.ball.x - this.state.ball.radius < 0) {
      this.state.score.player2++;
      this.resetBall();
    } else if (this.state.ball.x + this.state.ball.radius > 480) {
      this.state.score.player1++;
      this.resetBall();
    }

    // Check for game over
    if (this.state.score.player1 >= 10) {
      this.state.gameOver = true;
      this.state.winner = "player1";
      this.onGameOver("player1");
    } else if (this.state.score.player2 >= 10) {
      this.state.gameOver = true;
      this.state.winner = "player2";
      this.onGameOver("player2");
    }
  }

  public movePaddle(playerId: Player, y: number): void {
    if (playerId === "player1") {
      this.state.player1.y = Math.max(0, Math.min(y, 400));
    } else {
      this.state.player2.y = Math.max(0, Math.min(y, 400));
    }
  }

  private resetBall(): void {
    this.state.ball.x = 240;
    this.state.ball.y = 250;
    this.state.ball.xSpeed *= -1; // Reverse direction
  }
}

export default PingPongModel;