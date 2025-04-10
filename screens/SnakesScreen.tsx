"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { Dimensions, PanResponder } from "react-native"
import SoundContext from "../contexts/SoundContext"

const { width, height } = Dimensions.get("window")
const BOARD_SIZE = Math.min(width * 0.9, height * 0.6)
const GRID_SIZE = 20
const CELL_SIZE = BOARD_SIZE / GRID_SIZE

const Direction = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

const SnakesScreen = ({ route, navigation }) => {
  const { mode } = route.params
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameActive, setGameActive] = useState(true)
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [snake1, setSnake1] = useState([
    { x: 5, y: 15 },
    { x: 4, y: 15 },
    { x: 3, y: 15 },
  ])
  const [snake2, setSnake2] = useState([
    { x: 15, y: 5 },
    { x: 16, y: 5 },
    { x: 17, y: 5 },
  ])
  const [direction1, setDirection1] = useState(Direction.RIGHT)
  const [direction2, setDirection2] = useState(Direction.LEFT)
  const [winner, setWinner] = useState(null)
  const { playSound } = useContext(SoundContext)
  const confettiRef = useRef(null)
  const gameLoopRef = useRef(null)

  // Initialize game
  useEffect(() => {
    playSound(require('../assets/sounds/game-start.mp3'))
    startGame()
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [])

  // Setup pan responders for swipe controls
  const player1PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        
        // Determine swipe direction
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0 && direction1 !== Direction.LEFT) {
            setDirection1(Direction.RIGHT)
          } else if (dx < 0 && direction1 !== Direction.RIGHT) {
            setDirection1(Direction.LEFT)
          }
        } else {
          // Vertical swipe
          if (dy > 0 && direction1 !== Direction.UP) {
            setDirection1(Direction.DOWN)
          } else if (dy < 0 && direction1 !== Direction.DOWN) {
            setDirection1(Direction.UP)
          }
        }
      },
    }),
  ).current

  const player2PanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === "friend",
      onMoveShouldSetPanResponder: () => mode === "friend",
      onPanResponderRelease: (evt, gestureState) => {
        if (mode !== "friend") return
        
        const { dx, dy } = gestureState
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        
        // Determine swipe direction
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0 && direction2 !== Direction.LEFT) {
            setDirection2(Direction.RIGHT)
          } else if (dx < 0 && direction2 !== Direction.RIGHT) {
            setDirection2(Direction.LEFT)
          }
        } else {
          // Vertical swipe
          if (dy > 0 && direction2 !== Direction.UP) {
            setDirection2(Direction.DOWN)
          } else if (dy < 0 && direction2 !== Direction.DOWN) {
            setDirection2(Direction.UP)
          }
        }
      },
    }),
  ).current

  const startGame = () => {
    setGameActive(true)
    setWinner(null)
    
    // Start game loop
    gameLoopRef.current = setInterval(() => {
      moveSnakes()
    }, 150) // Speed of the game
  }

  const moveSnakes = () => {
    if (!gameActive) return

    // Move snake 1
    const newSnake1 = [...snake1]
    const newHead1 = {
      x: (newSnake1[0].x + direction1.x + GRID_SIZE) % GRID_SIZE,
      y: (newSnake1[0].y + direction1.y + GRID_SIZE) % GRID_SIZE,
    }
    newSnake1.unshift(newHead1)

    // Move snake 2 (or bot)
    const newSnake2 = [...snake2]
    let newDirection2 = direction2
    
    if (mode === "bot") {
      // Simple bot AI
      newDirection2 = getBotDirection(newSnake2[0], food, newSnake2, newSnake1)
    }
    
    const newHead2 = {
      x: (newSnake2[0].x + newDirection2.x + GRID_SIZE) % GRID_SIZE,
      y: (newSnake2[0].y + newDirection2.y + GRID_SIZE) % GRID_SIZE,
    }
    newSnake2.unshift(newHead2)
    
    // Check if either snake ate food
    let newFood = food
    let snake1AteFood = false
    let snake2AteFood = false
    
    if (newHead1.x === food.x && newHead1.y === food.y) {
      snake1AteFood = true
      playSound(require('../assets/sounds/eat-food.mp3'))
      newFood = generateFood(newSnake1, newSnake2)
    } else {
      newSnake1.pop()
    }
    
    if (newHead2.x === food.x && newHead2.y === food.y) {
      snake2AteFood = true
      playSound(require('../assets/sounds/eat-food.mp3'))
      newFood = generateFood(newSnake1, newSnake2)
    } else {
      newSnake2.pop()
    }
    
    // Check for collisions
    const collision = checkCollision(newHead1, newHead2, newSnake1, newSnake2)
    
    if (collision) {
      handleCollision(collision)
      return
    }
    
    // Update state
    setSnake1(newSnake1)
    setSnake2(newSnake2)
    setFood(newFood)
    setDirection2(newDirection2)
  }

  const getBotDirection = (head, food, botSnake, playerSnake) => {
    // Simple bot AI: Try to move toward food while avoiding collisions
    const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT]
    
    // Filter out directions that would cause immediate collision
    const safeDirections = possibleDirections.filter(dir => {
      const nextPos = {
        x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE,
      }
      
      // Check if next position would hit any snake
      return !botSnake.some(segment => segment.x === nextPos.x && segment.y === nextPos.y) &&
             !playerSnake.some(segment => segment.x === nextPos.x && segment.y === nextPos.y)
    })
    
    if (safeDirections.length === 0) {
      // No safe direction, just continue current direction
      return direction2
    }
    
    // Find direction that gets closest to food
    return safeDirections.reduce((best, dir) => {
      const nextPos = {
        x: (head.x + dir.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + dir.y + GRID_SIZE) % GRID_SIZE,
      }
      
      const currentDistance = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y)
      const bestDistance = Math.abs(head.x + best.x - food.x) + Math.abs(head.y + best.y - food.y)
      
      return currentDistance < bestDistance ? dir : best
    }, safeDirections[0])
  }

  const generateFood = (snake1, snake2) => {
    // Generate food in a position not occupied by either snake
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (
      snake1.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      snake2.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    )
    
    return newFood
  }

  const checkCollision = (head1, head2, snake1, snake2) => {
    // Check if snake 1 hit snake 2
    if (snake2.some((segment, index) => index > 0 && segment.x === head1.x && segment.y === head1.y)) {
      return "player2"
    }
    
    // Check if snake 2 hit snake 1
    if (snake1.some((segment, index) => index > 0 && segment.x === head2.x && segment.y === head2.y)) {
      return "player1"
    }
    
    // Check if snake 1 hit itself
    if (snake1.some((segment, index) => index > 0 && segment.x === head1.x && segment.y === head1.y)) {
      return "player2"
    }
    
    // Check if snake 2 hit itself
    if (snake2.some((segment, index) => index > 0 && segment.x === head2.x && segment.y === head2.y)) {
      return "player1"
    }
    
    // Check if snakes hit each other's heads
    if (head1.x === head2.x && head1.y === head2.y) {
      return "draw"
    }
    
    return null
