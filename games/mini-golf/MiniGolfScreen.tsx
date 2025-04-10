tsx
"use client";

import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { SafeAreaView, ImageBackground } from "react-native";
import { GameEngine } from "../../core/GameEngine";
import { useSound } from "../../contexts/SoundContext";
import { useAnalytics } from "../../contexts/AnalyticsContext";
import { useSeasonal } from "../../contexts/SeasonalContext";
import MiniGolfView from "./MiniGolfView";
import MiniGolfModel from "./MiniGolfModel";
import MiniGolfController from "./MiniGolfController";

interface MiniGolfScreenProps {
  route: {
    params: {
      mode: "friend" | "bot";
    };
  };
  navigation: any;
}

const MiniGolfScreen: React.FC<MiniGolfScreenProps> = ({ route, navigation }) => {
  const { mode } = route.params;
  const { playSound } = useSound();
  const { trackEvent } = useAnalytics();
  const { getSeasonalGameBackground } = useSeasonal();

  const [model] = useState(() => new MiniGolfModel());
  const [controller] = useState(() => new MiniGolfController(model, mode));

  const gameLoopRef = useRef<number | null>(null);
  const gameEngine = GameEngine.getInstance();

  useEffect(() => {
    gameEngine.registerGame("mini-golf", model, controller);

    model.setOnGameOver((winner) => {
      if (winner === "draw") {
        playSound("draw");
        trackEvent("game_draw", { game: "mini-golf" });
      } else {
        playSound("win");
        trackEvent("game_over", { game: "mini-golf", winner });
      }
    });

    gameEngine.startGame("mini-golf");
    playSound("game-start");
    trackEvent("game_start", { game: "mini-golf", mode });
    const gameLoop = () => {
        const deltaTime = 0.016;
        model.update(deltaTime)

        if (gameLoopRef.current !== null) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      };
      gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      gameEngine.stopGame();
      controller.cleanup();
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, []);

  const handleReset = () => {
    controller.handleInput({ type: "reset" });
    playSound("game-start");
    trackEvent("game_reset", { game: "mini-golf" });
  };

  const handleBack = () => {
    playSound("button-press");
    navigation.goBack();
  };

  const handleShot = (direction: number, force: number) => {
    playSound("cell-tap");
    controller.handleInput({ type: "shot", direction, force });
  };

  const handleUpdate = () => {
    
  };

  const backgroundImage =
    getSeasonalGameBackground("mini-golf") ||
    require("../../assets/images/mini-golf-bg.png");

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <MiniGolfView
          state={model.state}
          onReset={handleReset}
          onBack={handleBack}
          onShot={handleShot}
          onUpdate={handleUpdate}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default MiniGolfScreen;