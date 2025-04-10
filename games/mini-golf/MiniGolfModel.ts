ts
import type { GameModel } from "../../core/GameEngine";

type Player = "player1";

interface Ball {
  x: number;
  y: number;
  xSpeed: number;
  ySpeed: number;
  radius: number;
}

type Course = {
  width: number;
  height: number;
  obstacles: { x: number; y: number; width: number; height: number }[];
  hole: { x: number; y: number; radius: number };
  start: { x: number; y: number };
};

export interface MiniGolfState {
  ball: Ball;
  course: Course;
  player: Player;
  gameOver: boolean;
  winner: Player | null;
  strokes: number;
  isBallMoving: boolean;
}

export class MiniGolfModel implements GameModel {
  public state: MiniGolfState;
  private onGameOver: (winner: Player | "draw") => void = () => {};

  constructor() {
    this.state = {
      ball: { x: 0, y: 0, xSpeed: 0, ySpeed: 0, radius: 10 },
      course: {
        width: 400,
        height: 500,
        obstacles: [
          { x: 100, y: 100, width: 50, height: 150 },
          { x: 250, y: 250, width: 50, height: 100 },
          { x: 50, y: 400, width: 100, height: 25 },
          { x: 300, y: 50, width: 25, height: 100 },
          { x: 100, y: 250, width: 25, height: 25 },
          { x: 300, y: 400, width: 25, height: 25 },
          { x: 200, y: 150, width: 25, height: 25 },
          { x: 200, y: 350, width: 25, height: 25 },
        ],
        obstacles: [],
        hole: { x: 350, y: 50, radius: 15 },
        start: { x: 50, y: 350 },
      },
      player: "player1",
      gameOver: false,
      winner: null,
      strokes: 0,
      isBallMoving: false,
    };
  }

  public setOnGameOver(callback: (winner: Player | "draw") => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
  }

  public reset(): void {
    this.state.ball = {
      x: this.state.course.start.x,
      y: this.state.course.start.y,
      xSpeed: 0,
      ySpeed: 0,
      radius: 10,
    };
    this.state.gameOver = false;
    this.state.winner = null;
    this.state.strokes = 0;
    this.state.isBallMoving = false;
  }

  public hitBall(xSpeed: number, ySpeed: number): void {
    if (this.state.gameOver) return;
    this.state.ball.xSpeed = xSpeed;
    this.state.ball.ySpeed = ySpeed;
    this.state.isBallMoving = true;
    this.state.strokes++;
  }

  public update(deltaTime: number): void {
    if (this.state.gameOver) return;

    if(this.state.isBallMoving){
        // Apply friction
        this.state.ball.xSpeed *= 0.99;
        this.state.ball.ySpeed *= 0.99;
        
        // Move the ball
        this.state.ball.x += this.state.ball.xSpeed * deltaTime;
        this.state.ball.y += this.state.ball.ySpeed * deltaTime;
    }

    // Check for wall collisions
    if (this.state.ball.x - this.state.ball.radius < 0) {
      this.state.ball.x = this.state.ball.radius;
      this.state.ball.xSpeed *= -1;
      if(this.state.ball.xSpeed < 0.1){
        this.state.ball.xSpeed = 0;
      }
    }
    if (this.state.ball.x + this.state.ball.radius > this.state.course.width) {
      this.state.ball.x = this.state.course.width - this.state.ball.radius;
      this.state.ball.xSpeed *= -1;
    }
    if (this.state.ball.y - this.state.ball.radius < 0) {
      this.state.ball.y = this.state.ball.radius;
      this.state.ball.ySpeed *= -1;
    }
    if (this.state.ball.y + this.state.ball.radius > this.state.course.height) {
      this.state.ball.y = this.state.course.height - this.state.ball.radius;
      this.state.ball.ySpeed *= -1;
    }
    
    //Check for obstacle collision
    this.state.course.obstacles.forEach((obstacle) => {
      if (
        this.state.ball.x + this.state.ball.radius > obstacle.x &&
        this.state.ball.x - this.state.ball.radius < obstacle.x + obstacle.width &&
        this.state.ball.y + this.state.ball.radius > obstacle.y &&
        this.state.ball.y - this.state.ball.radius < obstacle.y + obstacle.height
      ) {
        const overlapLeft = Math.abs(this.state.ball.x + this.state.ball.radius - obstacle.x);
        const overlapRight = Math.abs(this.state.ball.x - this.state.ball.radius - (obstacle.x + obstacle.width));
        const overlapTop = Math.abs(this.state.ball.y + this.state.ball.radius - obstacle.y);
        const overlapBottom = Math.abs(this.state.ball.y - this.state.ball.radius - (obstacle.y + obstacle.height));

        if (overlapLeft < overlapRight && overlapLeft < overlapTop && overlapLeft < overlapBottom) {
          this.state.ball.x = obstacle.x - this.state.ball.radius;
          this.state.ball.xSpeed *= -1;
        } else if (overlapRight < overlapTop && overlapRight < overlapBottom) {
          this.state.ball.x = obstacle.x + obstacle.width + this.state.ball.radius;
          this.state.ball.xSpeed *= -1;
        } else if (overlapTop < overlapBottom) {
          this.state.ball.y = obstacle.y - this.state.ball.radius;
          this.state.ball.ySpeed *= -1;
        } else {
          this.state.ball.y = obstacle.y + obstacle.height + this.state.ball.radius;
          this.state.ball.ySpeed *= -1;
        }
      }
    })

    // Check for hole collision
    const distanceToHole = Math.sqrt(
      (this.state.ball.x - this.state.course.hole.x) ** 2 +
        (this.state.ball.y - this.state.course.hole.y) ** 2
    );
    if (distanceToHole < this.state.course.hole.radius + this.state.ball.radius) {
      this.state.gameOver = true;
      this.state.winner = this.state.player;
      this.onGameOver(this.state.player);
    }

    // Check if ball is stopped
    if (Math.abs(this.state.ball.xSpeed) < 0.1 && Math.abs(this.state.ball.ySpeed) < 0.1) {
      this.state.ball.xSpeed = 0;
      this.state.ball.ySpeed = 0;
      this.state.isBallMoving = false;
    }
  }

  public setIsBallMoving(isMoving: boolean): void {
    this.state.isBallMoving = isMoving;
  }
}