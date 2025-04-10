ts
import type { GameModel } from "../../core/GameEngine";

type Player = "white" | "black";

enum PieceType {
  Pawn = "pawn",
  Rook = "rook",
  Knight = "knight",
  Bishop = "bishop",
  Queen = "queen",
  King = "king",
}

interface Piece {
  type: PieceType;
  player: Player;
}

type Board = (Piece | null)[][];

export interface ChessState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | null;
  selectedPiece: { row: number, col: number } | null;
  possibleMoves: { row: number, col: number }[];
}

export class ChessModel implements GameModel {
  public state: ChessState;
  private onGameOver: (winner: Player | "draw") => void = () => {};
  private readonly gridSize = 8;

  constructor() {
    this.state = {
      board: this.createBoard(),
      currentPlayer: "white",
      gameOver: false,
      winner: null,
      selectedPiece: null,
      possibleMoves: [],
    };
  }

  public setOnGameOver(callback: (winner: Player | "draw") => void): void {
    this.onGameOver = callback;
  }

  public initialize(): void {
    this.reset();
  }

  private createBoard(): Board {
    const board: Board = Array.from({ length: this.gridSize }, () =>
      Array(this.gridSize).fill(null)
    );

    // Place white pieces
    board[7][0] = { type: PieceType.Rook, player: "white" };
    board[7][1] = { type: PieceType.Knight, player: "white" };
    board[7][2] = { type: PieceType.Bishop, player: "white" };
    board[7][3] = { type: PieceType.Queen, player: "white" };
    board[7][4] = { type: PieceType.King, player: "white" };
    board[7][5] = { type: PieceType.Bishop, player: "white" };
    board[7][6] = { type: PieceType.Knight, player: "white" };
    board[7][7] = { type: PieceType.Rook, player: "white" };
    for (let i = 0; i < this.gridSize; i++) {
      board[6][i] = { type: PieceType.Pawn, player: "white" };
    }

    // Place black pieces
    board[0][0] = { type: PieceType.Rook, player: "black" };
    board[0][1] = { type: PieceType.Knight, player: "black" };
    board[0][2] = { type: PieceType.Bishop, player: "black" };
    board[0][3] = { type: PieceType.Queen, player: "black" };
    board[0][4] = { type: PieceType.King, player: "black" };
    board[0][5] = { type: PieceType.Bishop, player: "black" };
    board[0][6] = { type: PieceType.Knight, player: "black" };
    board[0][7] = { type: PieceType.Rook, player: "black" };
    for (let i = 0; i < this.gridSize; i++) {
      board[1][i] = { type: PieceType.Pawn, player: "black" };
    }

    return board;
  }

  public reset(): void {
    this.state.board = this.createBoard();
    this.state.currentPlayer = "white";
    this.state.gameOver = false;
    this.state.winner = null;
    this.state.selectedPiece = null;
    this.state.possibleMoves = [];
  }

  public selectPiece(row: number, col: number): void {
      const piece = this.state.board[row][col];
      if(piece && piece.player === this.state.currentPlayer){
          this.state.selectedPiece = {row, col};
          this.state.possibleMoves = this.getPossibleMoves(row, col);
      }
  }

  public makeMove(toRow: number, toCol: number): boolean {
    if (this.state.gameOver || !this.state.selectedPiece) return false;

    const fromRow = this.state.selectedPiece.row;
    const fromCol = this.state.selectedPiece.col;
    const piece = this.state.board[fromRow][fromCol];
    if (!piece) return false;

    const isValidMove = this.state.possibleMoves.some(
      (move) => move.row === toRow && move.col === toCol
    );
    if (!isValidMove) return false;

    this.state.board[toRow][toCol] = piece;
    this.state.board[fromRow][fromCol] = null;

    this.state.selectedPiece = null;
    this.state.possibleMoves = [];
    
    if (this.checkGameOver()) {
        this.state.gameOver = true;
        this.state.winner = this.state.currentPlayer;
        this.onGameOver(this.state.currentPlayer);
    } else {
        this.state.currentPlayer = this.state.currentPlayer === "white" ? "black" : "white";
    }

    return true;
  }

  private getPossibleMoves(row: number, col: number): { row: number; col: number }[] {
    const piece = this.state.board[row][col];
    if (!piece) return [];

    switch (piece.type) {
      case PieceType.Pawn:
        return this.getPawnMoves(row, col, piece.player);
      case PieceType.Rook:
        return this.getRookMoves(row, col);
      case PieceType.Knight:
        return this.getKnightMoves(row, col);
      case PieceType.Bishop:
        return this.getBishopMoves(row, col);
      case PieceType.Queen:
        return this.getQueenMoves(row, col);
      case PieceType.King:
        return this.getKingMoves(row, col);
      default:
        return [];
    }
  }

  private getPawnMoves(row: number, col: number, player: Player): { row: number; col: number }[] {
    const moves: { row: number; col: number }[] = [];
    const direction = player === "white" ? -1 : 1;
    const startRow = player === "white" ? 6 : 1;

    // Move forward
    if (this.isValidMove(row + direction, col) && !this.state.board[row + direction][col]) {
      moves.push({ row: row + direction, col });
      if (row === startRow && !this.state.board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    // Capture diagonally
    if (this.isValidMove(row + direction, col + 1) && this.state.board[row + direction][col + 1]?.player !== player) {
        moves.push({ row: row + direction, col: col + 1 });
    }
    if (this.isValidMove(row + direction, col - 1) && this.state.board[row + direction][col - 1]?.player !== player) {
        moves.push({ row: row + direction, col: col - 1 });
    }

    return moves;
  }

  private getRookMoves(row: number, col: number): { row: number; col: number }[] {
      return this.getLineMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
  }
  
  private getKnightMoves(row: number, col: number): { row: number; col: number }[] {
      return this.getLShapedMoves(row, col);
  }
  
  private getBishopMoves(row: number, col: number): { row: number; col: number }[] {
      return this.getLineMoves(row, col, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
  }
  
  private getQueenMoves(row: number, col: number): { row: number; col: number }[] {
      return this.getLineMoves(row, col, [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]);
  }
  
  private getKingMoves(row: number, col: number): { row: number; col: number }[] {
      return this.getSingleStepMoves(row, col);
  }

  private getLineMoves(row: number, col: number, directions: number[][]): { row: number; col: number }[] {
      const moves: { row: number; col: number }[] = [];
      const piece = this.state.board[row][col];
      if (!piece) return moves;

      for (const [dr, dc] of directions) {
          for (let i = 1; i < this.gridSize; i++) {
              const newRow = row + dr * i;
              const newCol = col + dc * i;
              if (!this.isValidMove(newRow, newCol)) break;
              const targetPiece = this.state.board[newRow][newCol];
              if (targetPiece) {
                if(targetPiece.player !== piece.player) moves.push({ row: newRow, col: newCol });
                  break;
              }
              moves.push({ row: newRow, col: newCol });
          }
      }
      return moves;
  }
  
  private getLShapedMoves(row: number, col: number): { row: number; col: number }[] {
      const moves: { row: number; col: number }[] = [];
      const piece = this.state.board[row][col];
      if (!piece) return moves;
  
      const knightMoves = [
          { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
          { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
          { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
          { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 },
      ];
  
      for (const move of knightMoves) {
          if (this.isValidMove(move.row, move.col)) {
              const targetPiece = this.state.board[move.row][move.col];
              if (!targetPiece || targetPiece.player !== piece.player) {
                  moves.push(move);
              }
          }
      }
  
      return moves;
  }

  private getSingleStepMoves(row: number, col: number): { row: number; col: number }[] {
      const moves: { row: number; col: number }[] = [];
      const piece = this.state.board[row][col];
      if (!piece) return moves;
  
      const kingMoves = [
          { row: row - 1, col: col - 1 }, { row: row - 1, col: col }, { row: row - 1, col: col + 1 },
          { row: row, col: col - 1 }, { row: row, col: col + 1 },
          { row: row + 1, col: col - 1 }, { row: row + 1, col: col }, { row: row + 1, col: col + 1 },
      ];
  
      for (const move of kingMoves) {
          if (this.isValidMove(move.row, move.col)) {
              const targetPiece = this.state.board[move.row][move.col];
              if (!targetPiece || targetPiece.player !== piece.player) {
                  moves.push(move);
              }
          }
      }
  
      return moves;
  }

  private isValidMove(row: number, col: number): boolean {
    return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
  }
  
  private checkGameOver(): boolean {\n      const opponentPlayer = this.state.currentPlayer === \"white\" ? \"black\" : \"white\";\n      let hasOpponentMoves = false;\n  \n      for (let row = 0; row < this.gridSize; row++) {\n          for (let col = 0; col < this.gridSize; col++) {\n              const piece = this.state.board[row][col];\n              if (piece && piece.player === opponentPlayer) {\n                  const possibleMoves = this.getPossibleMoves(row, col);\n                  if (possibleMoves.length > 0) {\n                      hasOpponentMoves = true;\n                      break;\n                  }\n              }\n          }\n          if (hasOpponentMoves) break;\n      }\n\n      if(!hasOpponentMoves){\n        this.state.winner = this.state.currentPlayer;\n        this.onGameOver(this.state.currentPlayer)\n      }\n  \n      return !hasOpponentMoves;\n  }\n
  }
}