import type { ComponentType } from "react"

import type { GameRuntimeProps } from "./gameRuntime"

export type GameRuntimeComponent = ComponentType<GameRuntimeProps>

const registry: Record<string, GameRuntimeComponent> = {}

export const registerGameComponent = (id: string, component: GameRuntimeComponent) => {
  registry[id] = component
}

export const getGameComponent = (id: string): GameRuntimeComponent | undefined => registry[id]

export const getRegisteredComponentIds = () => Object.keys(registry)
