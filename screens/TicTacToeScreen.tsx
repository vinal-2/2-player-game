"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated, ImageBackground } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import SoundContext from "../contexts/SoundContext"
import { LinearGradient } from "expo-linear-gradient"
import ConfettiCannon from "react-native-confetti-cannon"

const { width } = Dimensions.get("window")
const BOARD_SIZE = width * 0.85
const CELL_SIZE = BOARD_SIZE / 3

const TicTacToeScreen = ({ route, navigation }) => {
  const { mode } = route.params
  const [board, setBoard] = useState(Array(9).fill(""))
  const [currentPlayer, setCurrentPlayer] = useState("X")
  const [scores, setScores] = useState({ X: 0, O: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [winningCells, setWinningCells] = useState([])
  const { playSound } = useContext(SoundContext)
  const confettiRef = useRef(null)

  // Animation refs
  const cellAnims = useRef(
    Array(9)
      .fill(0)
      .map(() => new Animated.Value(0)),
  )
  const scoreAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Animate cells appearing
    cellAnims.current.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }).start()
    })

    // Animate score
    Animated.spring(scoreAnim, {
      toValue: 1,
      tension: 40,
      friction: 8,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    if (mode === "bot" && currentPlayer === "O" && !gameOver) {
      // Simple bot move after a slight delay
      const timer = setTimeout(() => {
        makeAIMove()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, mode, gameOver])

  const makeAIMove = () => {
    const emptyCells = board.map((cell, index) => (cell === "" ? index : null)).filter((i) => i !== null)

    if (emptyCells.length > 0) {
      // Try to win
      for (const index of emptyCells) {
        const newBoard = [...board]
        newBoard[index] = "O"
        if (checkWinner(newBoard) === "O") {
          handleCellPress(index)
          return
        }
      }

      // Try to block
      for (const index of emptyCells) {
        const newBoard = [...board]
        newBoard[index] = "X"
        if (checkWinner(newBoard) === "X") {
          handleCellPress(index)
          return
        }
      }

      // Take center if available
      if (emptyCells.includes(4)) {
        handleCellPress(4)
        return
      }

      // Take corners if available
      const corners = [0, 2, 6, 8].filter((corner) => emptyCells.includes(corner))
      if (corners.length > 0) {
        handleCellPress(corners[Math.floor(Math.random() * corners.length)])
        return
      }

      // Take random move
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      handleCellPress(randomIndex)
    }
  }

  const handleCellPress = (index) => {
    if (board[index] !== "" || gameOver) {
      playSound(require("../assets/sounds/invalid-move.mp3"))
      return
    }

    playSound(require("../assets/sounds/cell-tap.mp3"))

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    // Animate the cell that was just pressed
    Animated.sequence([
      Animated.timing(cellAnims.current[index], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(cellAnims.current[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start()

    const winner = checkWinner(newBoard)
    if (winner) {
      setGameOver(true)
      setScores({
        ...scores,
        [winner]: scores[winner] + 1,
      })

      // Animate score change
      Animated.sequence([
        Animated.timing(scoreAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scoreAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start()

      playSound(require("../assets/sounds/win.mp3"))
      if (confettiRef.current) {
        confettiRef.current.start()
      }

      setTimeout(() => {
        showGameOverAlert(`${winner === "X" ? "Player X" : mode === "friend" ? "Player O" : "Bot"} wins!`)
      }, 1000)
      return
    }

    if (!newBoard.includes("")) {
      setGameOver(true)
      playSound(require("../assets/sounds/draw.mp3"))
      showGameOverAlert("It's a tie!")
      return
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
  }

  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningCells([a, b, c])
        return board[a]
      }
    }
    return null
  }

  const showGameOverAlert = (message) => {
    Alert.alert("Game Over", message, [{ text: "Play Again", onPress: resetGame }], { cancelable: false })
  }

  const resetGame = () => {
    setBoard(Array(9).fill(""))
    setCurrentPlayer("X")
    setGameOver(false)
    setWinningCells([])
    playSound(require("../assets/sounds/game-start.mp3"))

    // Reset cell animations
    cellAnims.current.forEach((anim) => {
      anim.setValue(0)
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start()
    })
  }

  const renderCell = (index) => {
    const isWinningCell = winningCells.includes(index)

    return (
      <Animated.View
        style={{
          transform: [{ scale: cellAnims.current[index] }],
        }}
      >
        <TouchableOpacity
          style={[styles.cell, isWinningCell && styles.winningCell]}
          onPress={() => handleCellPress(index)}
          activeOpacity={0.7}
        >
          {board[index] === "X" && (
            <Animated.Text style={[styles.cellText, { color: "#FF5252" }, isWinningCell && styles.winningCellText]}>
              X
            </Animated.Text>
          )}
          {board[index] === "O" && (
            <Animated.Text style={[styles.cellText, { color: "#2196F3" }, isWinningCell && styles.winningCellText]}>
              O
            </Animated.Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <ImageBackground source={require("../assets/images/tic-tac-toe-bg.png")} style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
        <ConfettiCannon ref={confettiRef} count={100} origin={{ x: width / 2, y: 0 }} autoStart={false} fadeOut />

        <View style={styles.playerInfo}>
          <Animated.View
            style={[
              styles.playerCard,
              currentPlayer === "X" ? styles.activePlayerCard : null,
              currentPlayer === "X" && { transform: [{ scale: scoreAnim }] },
            ]}
          >
            <LinearGradient
              colors={currentPlayer === "X" ? ["#FF9D00", "#FF5252"] : ["#FFFFFF", "#F0F0F0"]}
              style={styles.playerCardGradient}
            />
            <Text style={[styles.playerLabel, currentPlayer === "X" && styles.activePlayerLabel]}>Player X</Text>
            <Text style={[styles.scoreText, currentPlayer === "X" && styles.activeScoreText]}>{scores.X}</Text>
          </Animated.View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <Animated.View
            style={[
              styles.playerCard,
              currentPlayer === "O" ? styles.activePlayerCard : null,
              currentPlayer === "O" && { transform: [{ scale: scoreAnim }] },
            ]}
          >
            <LinearGradient
              colors={currentPlayer === "O" ? ["#2196F3", "#0D47A1"] : ["#FFFFFF", "#F0F0F0"]}
              style={styles.playerCardGradient}
            />
            <Text style={[styles.playerLabel, currentPlayer === "O" && styles.activePlayerLabel]}>
              {mode === "friend" ? "Player O" : "Bot"}
            </Text>
            <Text style={[styles.scoreText, currentPlayer === "O" && styles.activeScoreText]}>{scores.O}</Text>
          </Animated.View>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.board}>
            <View style={styles.row}>
              {renderCell(0)}
              {renderCell(1)}
              {renderCell(2)}
            </View>
            <View style={styles.row}>
              {renderCell(3)}
              {renderCell(4)}
              {renderCell(5)}
            </View>
            <View style={styles.row}>
              {renderCell(6)}
              {renderCell(7)}
              {renderCell(8)}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Ionicons name="reload" size={20} color="white" />
            <Text style={styles.resetButtonText}>Reset Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              playSound(require("../assets/sounds/button-press.mp3"))
              navigation.goBack()
            }}
          >
            <Ionicons name="home" size={20} color="white" />
            <Text style={styles.resetButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  playerInfo: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  playerCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    width: "40%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: "hidden",
  },
  playerCardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  activePlayerCard: {
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  playerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  activePlayerLabel: {
    color: "#FFF",
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  activeScoreText: {
    color: "#FFF",
  },
  vsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  vsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  boardContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: "rgba(187, 222, 251, 0.8)",
    borderRadius: 15,
    overflow: "hidden",
    padding: 5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  row: {
    flexDirection: "row",
    height: CELL_SIZE,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    backgroundColor: "white",
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  winningCell: {
    backgroundColor: "#FFF9C4",
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  cellText: {
    fontSize: 50,
    fontWeight: "bold",
  },
  winningCellText: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "#FF5252",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  homeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default TicTacToeScreen
