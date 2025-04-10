tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { ConnectFourState, Piece } from './ConnectFourModel';
import { Ionicons } from '@expo/vector-icons';

interface ConnectFourViewProps {
  state: ConnectFourState;
  onReset: () => void;
  onBack: () => void;
  onDrop: (column: number) => void;
}

const ConnectFourView: React.FC<ConnectFourViewProps> = ({ state, onReset, onBack, onDrop }) => {
  const renderPiece = (piece: Piece) => {
    switch (piece) {
      case 'red':
        return <Image source={require('../../assets/images/red-piece.png')} style={styles.pieceImage} />;
      case 'yellow':
        return <Image source={require('../../assets/images/yellow-piece.png')} style={styles.pieceImage} />;
      default:
        return null;
    }
  };

  const renderColumn = (column: number, pieces: Piece[]) => {
    return (
      <TouchableOpacity key={column} style={styles.column} onPress={() => onDrop(column)}>
        {pieces.map((piece, row) => (
          <View key={row} style={styles.cell}>
            {renderPiece(piece)}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/connect-four-bg.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.board}>
          {state.board.map((columnPieces, column) => renderColumn(column, columnPieces))}
        </View>
        {state.winner && <View style={styles.winnerContainer}><Text style={styles.winner}>{state.winner === 'draw' ? "Draw" : `${state.winner} wins!`}</Text></View>}
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
  board: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10
  },
  column: {
    marginHorizontal: 5,
  },
  cell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceImage: {
    width: 35,
    height: 35,
    resizeMode: 'contain'
  },
  winnerContainer:{
    position: "absolute",
    bottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  winner:{
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  }
});

export default ConnectFourView;