import type { GameModel } from "../../core/GameEngine";

type Player = "player1" | "player2";

interface Line {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
  owner: Player | null;
}

type Boxes = {
  [key: string]: Player | null;
};

export interface DotsAndBoxesState {
  boxes: Boxes
  lines: Line[];
  currentPlayer: Player;
  player1Score: number;
  player2Score: number;
  gameOver: boolean;
  winner: Player | null;
}

export class DotsAndBoxesModel implements GameModel {  
  private onGameOver: (winner: Player | "draw") => void = () => {};
  private readonly gridSize = 5;

  constructor() {
    this.state = {
      lines: this.createLines(),
      boxes: this.createBoxes(),      
      currentPlayer: "player1",
      player1Score: 0,
      player2Score: 0,
      gameOver: false,
      winner: null,
    };
  }

  public setOnGameOver(callback: (winner: Player | "draw") => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
  }

  private createLines(): Line[] {
    const lines: Line[] = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (col < this.gridSize - 1) {
          lines.push({ row1: row, col1: col, row2: row, col2: col + 1, owner: null });
        }
        if (row < this.gridSize - 1) {
          lines.push({ row1: row, col1: col, row2: row + 1, col2: col, owner: null });
        }
      }
    }
    return lines;
  }

  private createBoxes(): Boxes {
    const boxes: Boxes = {};
    for (let row = 0; row < this.gridSize - 1; row++) {
      for (let col = 0; col < this.gridSize - 1; col++) {
        const key = `${col},${row}`
        boxes[key] = null;
      }
    }
    return boxes;
  }

  public reset(): void {
    this.state.lines = this.createLines();
    this.state.boxes = this.createBoxes();    
    this.state.currentPlayer = "player1";
    this.state.player1Score = 0;
    this.state.player2Score = 0;
    this.state.gameOver = false;
    this.state.winner = null;
  }

  public makeMove(
    line: {
      row1: number;
      col1: number;
      row2: number;
      col2: number;
      owner: Player | null;
    }
  ): boolean {
    if (this.state.gameOver) return false;
    const foundLine = this.state.lines.find(
      (l) => (l.row1 === line.row1 && l.col1 === line.col1 && l.row2 === line.row2 && l.col2 === line.col2) ||
        (l.row1 === line.row2 &&
          l.col1 === line.col2 &&
          l.row2 === line.row1 &&
          l.col2 === line.col1)

    );

    if (!foundLine || foundLine.owner !== null) return false;

    foundLine.owner = this.state.currentPlayer;

    const completedBoxes = this.checkCompletedBoxes(foundLine);

    if (completedBoxes.length > 0) {
      completedBoxes.forEach(box => this.state.boxes[`${box.col},${box.row}`] = this.state.currentPlayer)
        
      if (this.state.currentPlayer === "player1") {
        this.state.player1Score += completedBoxes.length;
      } else {
        this.state.player2Score += completedBoxes.length;
      }
    }

    if (this.checkGameOver()) {
      this.state.gameOver = true;
      if (this.state.player1Score > this.state.player2Score) {
        this.state.winner = "player1";
      } else if (this.state.player2Score > this.state.player1Score) {
        this.state.winner = "player2";
      }
      this.onGameOver(this.state.winner || "draw");
    } else if (completedBoxes.length === 0) {
        this.state.currentPlayer = this.state.currentPlayer === "player1" ? "player2" : "player1";
    }

    return true;
  }

  private checkCompletedBoxes(line: Line): { row: number; col: number }[] {
    const boxes: { row: number; col: number }[] = [];
    const { row1, col1, row2, col2 } = line;

    // Check boxes above and below the horizontal line
    if (row1 === row2) {
      if (row1 > 0) {
        const boxAbove = this.state.boxes[`${Math.min(col1, col2)},${row1 - 1}`];
        if (boxAbove === null) {
          const left = this.state.lines.find(
            l =>
              (l.row1 === row1 - 1 && l.col1 === col1 && l.row2 === row1 && l.col2 === col1) ||
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row1 - 1 && l.col2 === col1)
          );
          const right = this.state.lines.find(
            l =>
              (l.row1 === row1 - 1 && l.col1 === col2 && l.row2 === row1 && l.col2 === col2) ||
              (l.row1 === row1 && l.col1 === col2 && l.row2 === row1 - 1 && l.col2 === col2)
          );
          const bottom = this.state.lines.find(
            l =>
              (l.row1 === row1 - 1 && l.col1 === col1 && l.row2 === row1 - 1 && l.col2 === col2) ||
              (l.row1 === row1 - 1 && l.col1 === col2 && l.row2 === row1 - 1 && l.col2 === col1)
          );
          if (left && right && bottom && left.owner && right.owner && bottom.owner) {
            boxes.push({ col: Math.min(col1, col2), row: row1 - 1 });
          }
        }
      }

      if (row1 < this.gridSize - 1) {
        const boxBelow = this.state.boxes[`${Math.min(col1, col2)},${row1}`];
        if (boxBelow === null) {
          const left = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row1 + 1 && l.col2 === col1) ||
              (l.row1 === row1 + 1 && l.col1 === col1 && l.row2 === row1 && l.col2 === col1)
          );
          const right = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col2 && l.row2 === row1 + 1 && l.col2 === col2) ||
              (l.row1 === row1 + 1 && l.col1 === col2 && l.row2 === row1 && l.col2 === col2)
          );
          const top = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row1 && l.col2 === col2) ||
              (l.row1 === row1 && l.col1 === col2 && l.row2 === row1 && l.col2 === col1)
          );
          if (left && right && top && left.owner && right.owner && top.owner) {
            boxes.push({ col: Math.min(col1, col2), row: row1});
          }
        }
      }
    }

    // Check boxes to the left and right of the vertical line
    if (col1 === col2) {
      if (col1 > 0) {
        const boxLeft = this.state.boxes[`${col1 - 1},${Math.min(row1, row2)}`];
        if (boxLeft === null) {
          const top = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 - 1 && l.row2 === row1 && l.col2 === col1) ||
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row1 && l.col2 === col1 - 1)
          );
          const bottom = this.state.lines.find(
            l =>
              (l.row1 === row2 && l.col1 === col1 - 1 && l.row2 === row2 && l.col2 === col1) ||
              (l.row1 === row2 && l.col1 === col1 && l.row2 === row2 && l.col2 === col1 - 1)
          );
          const right = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 - 1 && l.row2 === row2 && l.col2 === col1 - 1) ||
              (l.row1 === row2 && l.col1 === col1 - 1 && l.row2 === row1 && l.col2 === col1 - 1)
          );

          if (top && bottom && right && top.owner && bottom.owner && right.owner) {
            boxes.push({ col: col1 - 1, row: Math.min(row1, row2) });
          }
        }
      }

      if (col1 < this.gridSize - 1) {
        const boxRight = this.state.boxes[`${col1},${Math.min(row1, row2)}`];
        if (boxRight === null) {
          const top = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row1 && l.col2 === col1 + 1) ||
              (l.row1 === row1 && l.col1 === col1 + 1 && l.row2 === row1 && l.col2 === col1)
          );
          const bottom = this.state.lines.find(
            l =>
              (l.row1 === row2 && l.col1 === col1 && l.row2 === row2 && l.col2 === col1 + 1) ||
              (l.row1 === row2 && l.col1 === col1 + 1 && l.row2 === row2 && l.col2 === col1)
          );
          const left = this.state.lines.find(
            l =>
              (l.row1 === row1 && l.col1 === col1 && l.row2 === row2 && l.col2 === col1) ||
              (l.row1 === row2 && l.col1 === col1 && l.row2 === row1 && l.col2 === col1)
          );
          if (top && bottom && left && top.owner && bottom.owner && left.owner) {
            boxes.push({ col: col1, row: Math.min(row1, row2) });
          }
        }
      }
    }

    return boxes;
  }

  private checkGameOver(): boolean {
    return Object.values(this.state.boxes).every((owner) => owner !== null);
  }
}