"use client"

import { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import SplashScreen from "./screens/SplashScreen"
import HomeScreen from "./screens/HomeScreen"
import GameScreen from "./screens/GameScreen"
import SettingsScreen from "./screens/SettingsScreen"
import PremiumScreen from "./screens/PremiumScreen"

import { SoundProvider } from "./contexts/SoundContext"
import { AdProvider } from "./contexts/AdContext"
import { GameProvider } from "./contexts/GameContext"
import { SeasonalProvider } from "./contexts/SeasonalContext"
import { AnalyticsProvider } from "./contexts/AnalyticsContext"
import { initialiseGameRegistry } from "./games/registerGames"
import type { RootStackParamList } from "./navigation/types"

initialiseGameRegistry()

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return (
      <AnalyticsProvider>
        <SplashScreen onFinish={() => setIsLoading(false)} />
      </AnalyticsProvider>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AnalyticsProvider>
          <AdProvider>
            <SoundProvider>
              <GameProvider>
                <SeasonalProvider>
                  <StatusBar style="light" />
                  <NavigationContainer>
                    <Stack.Navigator
                      screenOptions={{
                        headerShown: false,
                        animation: "fade",
                      }}
                    >
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Game" component={GameScreen} />
                      <Stack.Screen name="Settings" component={SettingsScreen} />
                      <Stack.Screen name="Premium" component={PremiumScreen} />
                    </Stack.Navigator>
                  </NavigationContainer>
                </SeasonalProvider>
              </GameProvider>
            </SoundProvider>
          </AdProvider>
        </AnalyticsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}



