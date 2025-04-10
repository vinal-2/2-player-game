tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { ChessState, PieceType, Player } from './ChessModel';
import { Ionicons } from '@expo/vector-icons';

interface ChessViewProps {
  state: ChessState;
  onReset: () => void;
  onBack: () => void;
  onSelectPiece: (row: number, col: number) => void;
  onMovePiece: (from: { row: number, col: number }, to: { row: number, col: number }) => void;
}

const ChessView: React.FC<ChessViewProps> = ({ state, onReset, onBack, onMovePiece, onSelectPiece }) => {

  const gridSize = 8;
  const squareSize = 40;

  const getPieceImage = (pieceType: PieceType, player: Player) => {
    const base = '../../assets/images/';
    const color = player === 'white' ? 'white' : 'black';
    switch (pieceType) {
      case PieceType.Pawn: return require(`${base}${color}-pawn.png`);
      case PieceType.Rook: return require(`${base}${color}-rook.png`);
      case PieceType.Knight: return require(`${base}${color}-knight.png`);
      case PieceType.Bishop: return require(`${base}${color}-bishop.png`);
      case PieceType.Queen: return require(`${base}${color}-queen.png`);
      case PieceType.King: return require(`${base}${color}-king.png`);
      default: return null;
    }
  };

  const renderBoard = () => {
    const board: JSX.Element[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const isBlack = (row + col) % 2 === 1;
        let squareColor = isBlack ? 'grey' : 'white';
        const piece = state.board[row][col];
        let isPossibleMove = false;
        
        if (state.selectedPiece) {
          isPossibleMove = state.possibleMoves.some(
            (move) => move.row === row && move.col === col
          );
        }

        if (state.selectedPiece && state.selectedPiece.row === row && state.selectedPiece.col === col) {
          squareColor = 'yellow'; // Highlight selected piece
        } else if (isPossibleMove) {
          squareColor = 'lightgreen'; // Highlight possible moves
        }

        board.push(          
          <TouchableOpacity
            key={`square-${row}-${col}`}
            style={[styles.square, { backgroundColor: squareColor, width: squareSize, height: squareSize }]}
            onPress={() => handleSquarePress(row, col)}
          >
            {piece && getPieceImage(piece.type, piece.player) && (
              <Image source={getPieceImage(piece.type, piece.player)} style={styles.piece} />
            )}
          </TouchableOpacity>
        );
        
      }
    }
    return board;
  };

  const handleSquarePress = (row: number, col: number) => {
    if (state.selectedPiece) {
      onMovePiece({ row: state.selectedPiece.row, col: state.selectedPiece.col }, { row, col });
    } else {
      onSelectPiece(row, col);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/chess-bg.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.boardContainer}>
          {renderBoard()}
        </View>
          {state.gameOver && state.winner && <View style={styles.winnerContainer}><Text style={styles.winner}>{state.winner === 'draw' ? "Draw" : `${state.winner} wins!`}</Text></View>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    position: 'absolute',
    top: 0,
  },
  backButton: {
    padding: 10,
  },
  resetButton: {
    padding: 10,
  },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    height: 320,
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  piece: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  winnerContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  winner: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  }
});

export default ChessView;