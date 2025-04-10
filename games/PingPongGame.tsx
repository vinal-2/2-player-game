"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Dimensions, PanResponder, Animated } from "react-native"
import { useSound } from "../contexts/SoundContext"

const { width, height } = Dimensions.get("window")
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 20
const BALL_SIZE = 15
const INITIAL_BALL_SPEED = 5

const PingPongGame = ({onGameOver}) => {
  const { playSound } = useSound()
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameState, setGameState] = useState("playing") // playing, paused, gameOver
  const [winner, setWinner] = useState(null)
  
  // Refs for animation values
  const player1Position = useRef(new Animated.ValueXY({ x: width / 2 - PADDLE_WIDTH / 2, y: height - 100 })).current
  const player2Position = useRef(new Animated.ValueXY({ x: width / 2 - PADDLE_WIDTH / 2, y: 80 })).current
  const ballPosition = useRef(new Animated.ValueXY({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 })).current
  const MAX_SCORE = 5
  
  // Ball velocity
  const ballVelocity = useRef({ x: INITIAL_BALL_SPEED, y: INITIAL_BALL_SPEED })
  
  // Animation frame
  const animationRef = useRef(null)
  
  // Pan responders for paddles
  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newX = player1Position.x._value + gestureState.dx
        
        // Boundary check
        if (newX < 0) newX = 0
        if (newX > width - PADDLE_WIDTH) newX = width - PADDLE_WIDTH
        
        player1Position.setValue({ x: newX, y: player1Position.y._value })
      },
    })
  ).current
  
  const player2PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        let newX = player2Position.x._value + gestureState.dx
        
        // Boundary check
        if (newX < 0) newX = 0
        if (newX > width - PADDLE_WIDTH) newX = width - PADDLE_WIDTH
        
        player2Position.setValue({ x: newX, y: player2Position.y._value })
      },
    })
  ).current
  
  // Game loop
  useEffect(() => {
    startGame()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  const startGame = () => {
    // Reset ball position
    resetBall()
    
    // Set random initial direction
    const angle = Math.random() * Math.PI * 2
    ballVelocity.current = {
      x: Math.cos(angle) * INITIAL_BALL_SPEED,
      y: Math.sin(angle) * INITIAL_BALL_SPEED,
    }
    
    setGameState("playing")
    gameLoop()
  }
  
  const resetBall = (scoredByPlayer?: string) => {
    ballPosition.setValue({ x: width / 2 - BALL_SIZE / 2, y: height / 2 - BALL_SIZE / 2 })
    
    // Set random initial direction based on who scored
    const angle = Math.random() * Math.PI / 2 + (scoredByPlayer === "player2" ? Math.PI : 0); // player1 sends to player 2 and viceversa
    ballVelocity.current = {
      x: Math.cos(angle) * INITIAL_BALL_SPEED,
      y: Math.sin(angle) * INITIAL_BALL_SPEED * (scoredByPlayer === "player2" ? 1 : -1),
    }
  }
  

  const gameLoop = () => {
    if (gameState !== "playing") return
    
    // Update ball position
    const ballX = ballPosition.x._value + ballVelocity.current.x
    const ballY = ballPosition.y._value + ballVelocity.current.y
    
    // Wall collision (left/right)
    if (ballX <= 0 || ballX >= width - BALL_SIZE) {
      playSound("wall-hit")
      ballVelocity.current.x *= -1
    }

        // Score check (top/bottom)
    if (ballY <= 0) {
      setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
      playSound("score");
      resetBall("player1");
    } else if (ballY >= height - BALL_SIZE) {
      setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
      playSound("score");
      resetBall("player2");
    }

        // Check for game over
    if (scores.player1 >= MAX_SCORE || scores.player2 >= MAX_SCORE) {
        setGameState('gameOver');
        setWinner(scores.player1 > scores.player2 ? 'player1' : 'player2');
        onGameOver(scores.player1 > scores.player2 ? 'player1' : 'player2')
    }

    // Paddle collision (player 1 - bottom)
    if (
      ballY + BALL_SIZE >= player1Position.y._value &&
      ballY <= player1Position.y._value + PADDLE_HEIGHT &&
      ballX + BALL_SIZE >= player1Position.x._value &&
      ballX <= player1Position.x._value + PADDLE_WIDTH
    ) {
      // Calculate bounce angle based on where the ball hit the paddle
      const hitPosition = (ballX + BALL_SIZE / 2 - player1Position.x._value) / PADDLE_WIDTH
      const bounceAngle = hitPosition * Math.PI - Math.PI / 2
      
      const speed = Math.sqrt(ballVelocity.current.x ** 2 + ballVelocity.current.y ** 2)
      ballVelocity.current.x = Math.cos(bounceAngle) * speed
      ballVelocity.current.y = -Math.abs(Math.sin(bounceAngle) * speed)
      
      playSound("bounce")
    }
    
    // Paddle collision (player 2 - top)
    if (
      ballY <= player2Position.y._value + PADDLE_HEIGHT &&
      ballY + BALL_SIZE >= player2Position.y._value &&
      ballX + BALL_SIZE >= player2Position.x._value &&
      ballX <= player2Position.x._value + PADDLE_WIDTH
    ) {
            // Calculate bounce angle based on where the ball hit the paddle
            const hitPosition = (ballX + BALL_SIZE / 2 - player2Position.x._value) / PADDLE_WIDTH;
            const bounceAngle = hitPosition * Math.PI - Math.PI / 2;
            const speed = Math.sqrt(ballVelocity.current.x ** 2 + ballVelocity.current.y ** 2);
            ballVelocity.current.x = Math.cos(bounceAngle) * speed;
            ballVelocity.current.y = Math.abs(Math.sin(bounceAngle) * speed);
            playSound("paddle-hit");
        }
    Animated.timing(ballPosition, {
      toValue: { x: ballX, y: ballY },
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      animationRef.current = requestAnimationFrame(gameLoop)
    })
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.ball, { transform: ballPosition.getTranslateTransform() }]}
      />
      <Animated.View
        style={[styles.paddle, { transform: player1Position.getTranslateTransform() }]}
        {...player1PanResponder.panHandlers}
      />
      <Animated.View
        style={[styles.paddle, { transform: player2Position.getTranslateTransform() }]}
        {...player2PanResponder.panHandlers}
      />
      <Text style={styles.score}>{scores.player2} - {scores.player1}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: "#fff",
  },
  paddle: {
    position: "absolute",
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  score: {
    position: "absolute",
    top: 40,
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
})

export default PingPongGame
