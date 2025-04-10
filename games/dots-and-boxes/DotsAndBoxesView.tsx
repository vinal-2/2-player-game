tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { DotsAndBoxesState, Line } from './DotsAndBoxesModel';
import { Ionicons } from '@expo/vector-icons';

interface DotsAndBoxesViewProps {
  state: DotsAndBoxesState;
  onReset: () => void;
  onBack: () => void;
  onDrawLine: (from: { x: number, y: number }, to: { x: number, y: number }) => void;
}

const DotsAndBoxesView: React.FC<DotsAndBoxesViewProps> = ({ state, onReset, onBack, onDrawLine }) => {
  const gridSize = 5;
  const dotRadius = 8;
  const dotSpacing = 50;

  const renderDots = () => {
    const dots = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        dots.push(
          <View
            key={`dot-${row}-${col}`}
            style={[
              styles.dot,
              {
                left: col * dotSpacing,
                top: row * dotSpacing,
              },
            ]}
          />
        );
      }
    }
    return dots;
  };

  const renderLines = () => {
    const lines = [];
    for (const line of state.lines) {
        if(line.owner){
            const isHorizontal = line.row1 === line.row2;
            const lineStyle = {
                position: 'absolute',
                backgroundColor: line.owner === "player1" ? 'red' : 'blue',
                height: isHorizontal ? 5 : dotSpacing,
                width: isHorizontal ? dotSpacing : 5,
                left: isHorizontal
                    ? Math.min(line.col1, line.col2) * dotSpacing + dotRadius
                    : line.col1 * dotSpacing + dotRadius,
                top: isHorizontal
                    ? line.row1 * dotSpacing + dotRadius
                    : Math.min(line.row1, line.row2) * dotSpacing + dotRadius,
            };

            lines.push(
                <View
                  key={`line-${line.row1}-${line.col1}-${line.row2}-${line.col2}`}
                  style={lineStyle}
                />
            );
        }
    }
    return lines;
  };
  const renderBoxes = () => {
      const boxes = [];
      for(let y = 0; y < gridSize -1; y++){
          for(let x = 0; x < gridSize-1; x++){
              const key = `${x},${y}`;
              const player = state.boxes[key]
                if(player){
                    boxes.push(
                        <View key={key} style={[styles.box, {left: x * dotSpacing + dotRadius, top: y*dotSpacing + dotRadius, backgroundColor: player === "red" ? "rgba(255,0,0,0.3)" : "rgba(0,0,255,0.3)"}]}></View>
                    );
                }
          }
      }
      return boxes;
  };

  const handleDotPress = (col: number, row: number) => {
    const possibleLines = [
      { row1: row, col1: col, row2: row, col2: col + 1 }, // Right
      { row1: row, col1: col, row2: row, col2: col - 1 }, // Left
      { row1: row, col1: col, row2: row + 1, col2: col }, // Down
      { row1: row, col1: col, row2: row - 1, col2: col }, // Up
    ];
  
    for (const { row1, col1, row2, col2 } of possibleLines) {
        if(row2 >= 0 && row2 < gridSize && col2 >= 0 && col2 < gridSize) {
            const existingLine = state.lines.find(l => (l.row1 === row1 && l.col1 === col1 && l.row2 === row2 && l.col2 === col2) || (l.row1 === row2 && l.col1 === col2 && l.row2 === row1 && l.col2 === col1))
            if(existingLine && !existingLine.owner){
                onDrawLine({x: col1, y: row1}, {x: col2, y: row2})
            }
        }
    }
  };
  
  const renderClickableDots = () => {
    const clickableDots = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        clickableDots.push(
          <TouchableOpacity
            key={`dot-clickable-${row}-${col}`}
            style={[
              styles.clickableDot,
              {
                left: col * dotSpacing,
                top: row * dotSpacing,
              },
            ]}
            onPress={() => handleDotPress(col,row)}
          />
        );
      }
    }
    return clickableDots;
  };

  return (
    <ImageBackground source={require('../../assets/images/dots-and-boxes-bg.png')} style={styles.backgroundImage}>
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
          {renderBoxes()}
          {renderLines()}
          {renderDots()}
          {renderClickableDots()}
        </View>
        <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, {color: "red"}]}>Red: {state.player1Score}</Text>
            <Text style={[styles.scoreText, {color: "blue"}]}>Blue: {state.player2Score}</Text>
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
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  clickableDot: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
    box: {
        position: 'absolute',
        width: dotSpacing,
        height: 50,
    },
    scoreContainer: {
        position: "absolute",
        bottom: 20,
        flexDirection: "row",
        gap: 20
    },
    scoreText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    winnerContainer:{
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

export default DotsAndBoxesView;