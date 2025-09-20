// Paste into core/assets.ts
export const imageManifest = [
  // ...existing entries
  require("../assets/images/snakes-duel/winter-head.png"),
  require("../assets/images/snakes-duel/winter-body.png"),
  require("../assets/images/snakes-duel/winter-turn.png"),
  require("../assets/images/snakes-duel/winter-tail.png"),
  require("../assets/images/snakes-duel/spring-head.png"),
  require("../assets/images/snakes-duel/spring-body.png"),
  require("../assets/images/snakes-duel/spring-turn.png"),
  require("../assets/images/snakes-duel/spring-tail.png"),
  require("../assets/images/snakes-duel/summer-head.png"),
  require("../assets/images/snakes-duel/summer-body.png"),
  require("../assets/images/snakes-duel/summer-turn.png"),
  require("../assets/images/snakes-duel/summer-tail.png"),
  require("../assets/images/snakes-duel/autumn-head.png"),
  require("../assets/images/snakes-duel/autumn-body.png"),
  require("../assets/images/snakes-duel/autumn-turn.png"),
  require("../assets/images/snakes-duel/autumn-tail.png"),
];

export const particleManifest = {
  "snakes-winter": require("../assets/particles/winter-particle.png"),
  "snakes-spring": require("../assets/particles/spring-particle.png"),
  "snakes-summer": require("../assets/particles/summer-particle.png"),
  "snakes-autumn": require("../assets/particles/autumn-particle.png"),
};

// Example SeasonalContext mapping
export const snakeSeasonalPalettes = {
  winter: { body: "snakes-duel/winter-body.png", trail: "particles/winter-particle.png" },
  spring: { body: "snakes-duel/spring-body.png", trail: "particles/spring-particle.png" },
  summer: { body: "snakes-duel/summer-body.png", trail: "particles/summer-particle.png" },
  autumn: { body: "snakes-duel/autumn-body.png", trail: "particles/autumn-particle.png" },
};
