import { Asset } from "expo-asset"
import { Audio } from "expo-av"
import { Image } from "react-native"
import * as Font from "expo-font"

import { imageManifest, soundManifest } from "../core/assets"
import type { SoundPlaybackKey } from "../contexts/SoundContext"

const SOUND_PRELOAD_EXCLUSIONS: SoundPlaybackKey[] = ["background-music"]

/**
 * Asset Loader
 *
 * Handles preloading and caching of assets
 */
export class AssetLoader {
  private static instance: AssetLoader
  private loadedImages: Map<string, number> = new Map()
  private loadedSounds: Map<SoundPlaybackKey, Audio.Sound> = new Map()
  private loadedFonts = false

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader()
    }
    return AssetLoader.instance
  }

  private constructor() {}

  /**
   * Preloads images, sounds, and fonts in parallel.
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
   * Preload and cache all image modules defined in the manifest.
   */
  public async preloadImages(): Promise<void> {
    const imagePromises = imageManifest.map(async (asset) => {
      if (typeof asset !== "number" || this.loadedImages.has(asset.toString())) {
        return
      }

      const { uri } = Asset.fromModule(asset)
      await Image.prefetch(uri)
      this.loadedImages.set(asset.toString(), asset)
    })

    await Promise.all(imagePromises)
    console.log("Images preloaded successfully")
  }

  /**
   * Preload Expo Audio sounds from the shared manifest, skipping long-running music tracks.
   */
  public async preloadSounds(): Promise<void> {
    const entries = Object.entries(soundManifest) as Array<[SoundPlaybackKey, any]>

    const soundPromises = entries
      .filter(([key]) => !SOUND_PRELOAD_EXCLUSIONS.includes(key))
      .map(async ([key, module]) => {
        if (this.loadedSounds.has(key)) {
          return
        }

        try {
          const { sound } = await Audio.Sound.createAsync(module)
          this.loadedSounds.set(key, sound)
        } catch (error) {
          console.warn(`Sound asset ${key} failed to preload`, error)
        }
      })

    await Promise.all(soundPromises)
    console.log("Sounds preloaded successfully")
  }

  /**
   * Load custom fonts once.
   */
  public async preloadFonts(): Promise<void> {
    if (this.loadedFonts) return

    await Font.loadAsync({
      "game-font": require("../assets/fonts/game-font.ttf"),
      "game-font-bold": require("../assets/fonts/game-font-bold.ttf"),
    })

    this.loadedFonts = true
    console.log("Fonts preloaded successfully")
  }

  /**
   * Retrieve a preloaded image module id.
   */
  public getImage(key: string | number): number | undefined {
    return this.loadedImages.get(key.toString())
  }

  /**
   * Retrieve a preloaded Audio.Sound instance.
   */
  public getSound(key: SoundPlaybackKey): Audio.Sound | undefined {
    return this.loadedSounds.get(key)
  }

  /**
   * Play a cached sound effect by key.
   */
  public async playSound(key: SoundPlaybackKey): Promise<void> {
    const sound = this.loadedSounds.get(key)
    if (!sound) {
      console.warn(`Sound ${key} not found`)
      return
    }

    try {
      await sound.setPositionAsync(0)
      await sound.playAsync()
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error)
    }
  }

  /**
   * Dispose of cached assets.
   */
  public async unloadAll(): Promise<void> {
    for (const sound of this.loadedSounds.values()) {
      try {
        await sound.unloadAsync()
      } catch (error) {
        console.warn("Sound could not be unloaded", error)
      }
    }
    this.loadedSounds.clear()
    this.loadedImages.clear()

    console.log("All assets unloaded")
  }
}
