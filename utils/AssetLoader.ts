import { Asset } from "expo-asset"
import { Audio } from "expo-av"
import { Image } from "react-native"
import * as Font from "expo-font"

import { imageManifest, soundManifest } from "../core/assets"

/**
 * Asset Loader
 *
 * Handles preloading and caching of assets
 */
export class AssetLoader {
  private static instance: AssetLoader
  private loadedImages: Map<string, any> = new Map()
  private loadedSounds: Map<string, Audio.Sound> = new Map()
  private loadedFonts = false

  // Singleton pattern
  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader()
    }
    return AssetLoader.instance
  }

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Preloads all assets
   */
  public async preloadAll(): Promise<void> {
    try {
      await Promise.all([this.preloadImages(), this.preloadSounds(), this.preloadFonts()])
      console.log("All assets preloaded successfully")
    } catch (error) {
      console.error("Error preloading assets:", error)
    }
  }

  /**
   * Preloads all images
   */
  public async preloadImages(): Promise<void> {
    const imagePromises = imageManifest.map(async (asset) => {
      if (typeof asset === "number") {
        const { uri } = Asset.fromModule(asset)
        await Image.prefetch(uri)
        this.loadedImages.set(asset.toString(), asset)
      }
    })

    await Promise.all(imagePromises)
    console.log("Images preloaded successfully")
  }

  /**
   * Preloads all sounds
   */
  public async preloadSounds(): Promise<void> {
    const soundAssets = [
      { key: "button-press", asset: require("../assets/sounds/button-press.mp3") },
      { key: "game-start", asset: require("../assets/sounds/game-start.mp3") },
      { key: "win", asset: require("../assets/sounds/win.mp3") },
      { key: "draw", asset: require("../assets/sounds/draw.mp3") },
      { key: "cell-tap", asset: require("../assets/sounds/cell-tap.mp3") },
      { key: "invalid-move", asset: require("../assets/sounds/invalid-move.mp3") },
      { key: "toggle", asset: require("../assets/sounds/toggle.mp3") },
      { key: "wall-hit", asset: require("../assets/sounds/wall-hit.mp3") },
      { key: "paddle-hit", asset: require("../assets/sounds/paddle-hit.mp3") },
      { key: "score", asset: require("../assets/sounds/score.mp3") },
      { key: "collision", asset: require("../assets/sounds/collision.mp3") },
      { key: "round-start", asset: require("../assets/sounds/round-start.mp3") },
      { key: "eat-food", asset: require("../assets/sounds/eat-food.mp3") },
      // Add more sounds as needed
    ]

    // Create sound promises
    const soundPromises = soundAssets.map(async ({ key, asset }) => {\r\n      try {\r\n        const { sound } = await Audio.Sound.createAsync(asset)\r\n        this.loadedSounds.set(key, sound)\r\n      } catch (error) {\r\n        console.warn(`Sound asset ${key} failed to preload`, error)\r\n      }\r\n    })

    await Promise.all(soundPromises)
    console.log("Sounds preloaded successfully")
  }

  /**
   * Preloads all fonts
   */
  public async preloadFonts(): Promise<void> {
    if (this.loadedFonts) return

    await Font.loadAsync({
      "game-font": require("../assets/fonts/game-font.ttf"),
      "game-font-bold": require("../assets/fonts/game-font-bold.ttf"),
      // Add more fonts as needed
    })

    this.loadedFonts = true
    console.log("Fonts preloaded successfully")
  }

  /**
   * Gets a preloaded image
   */
  public getImage(key: string | number): any {
    return this.loadedImages.get(key.toString())
  }

  /**
   * Gets a preloaded sound
   */
  public getSound(key: string): Audio.Sound | undefined {
    return this.loadedSounds.get(key)
  }

  /**
   * Plays a preloaded sound
   */
  public async playSound(key: string): Promise<void> {
    const sound = this.loadedSounds.get(key)
    if (sound) {
      try {
        await sound.setPositionAsync(0)
        await sound.playAsync()
      } catch (error) {
        console.error(`Error playing sound ${key}:`, error)
      }
    } else {
      console.warn(`Sound ${key} not found`)
    }
  }

  /**
   * Unloads all assets
   */
  public async unloadAll(): Promise<void> {
    // Unload sounds
    for (const sound of this.loadedSounds.values()) {\r\n      try {\r\n        await sound.unloadAsync()\r\n      } catch (error) {\r\n        console.warn("Sound could not be unloaded", error)\r\n      }\r\n    }
    this.loadedSounds.clear()

    // Clear image cache
    this.loadedImages.clear()

    console.log("All assets unloaded")
  }
}

