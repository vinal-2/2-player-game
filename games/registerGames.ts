import { registerGameComponent } from "../core/gameRegistry"
import type { GameRuntimeComponent } from "../core/gameRegistry"

import AirHockeyScreen from "./air-hockey/AirHockeyScreen"
import TicTacToeScreen from "./tic-tac-toe/TicTacToeScreen"
import PingPongScreen from "./ping-pong/PingPongScreen"
import SpinnerWarScreen from "./spinner-war/SpinnerWarScreen"

type GameRegistryEntry = {
  id: string
  component: GameRuntimeComponent
}

const registryEntries: GameRegistryEntry[] = [
  { id: "air-hockey", component: AirHockeyScreen },
  { id: "tic-tac-toe", component: TicTacToeScreen },
  { id: "ping-pong", component: PingPongScreen },
  { id: "spinner-war", component: SpinnerWarScreen },
]

let isInitialised = false

export const initialiseGameRegistry = () => {
  if (isInitialised) {
    return
  }

  registryEntries.forEach(({ id, component }) => {
    registerGameComponent(id, component)
  })

  isInitialised = true
}
