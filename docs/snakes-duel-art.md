# Snakes Duel Skins & Theming Brief (v0.1)

## Goals
- Provide modern, vibrant cosmetic options without impacting gameplay.
- Mirror benchmark titles with seasonal variations and unlockable palettes.

## Base Skins (Launch)
1. Classic Neon (green + blue trail)
2. Sunset Blaze (orange + magenta trail)
3. Arctic Pulse (cyan + white trail)
4. Midnight Pixel (purple + teal trail)

## Seasonal Overrides
- Winter: icy textures with subtle particle breath.
- Spring: floral decals and pastel trails.
- Summer: tropical gradients, sparkle particle on apple consumption.
- Autumn: leaf particles and warm palette.

## Unlock Rules
- Default skins: Classic + Sunset available by default.
- Additional skins unlocked via milestone achievements (e.g., 50 apples eaten total) or premium bundle.
- No gameplay advantages; purely visual.

## Asset Requirements
- Snake body segment sprites (head, straight, turn, tail) in 3 resolutions (1x/2x/3x).
- Trail shader parameters or overlay textures for glow effect.
- Apple variants per season (color swap + small particle burst).
- UI badges for skin selection carousel.

## Integration Notes
- Use existing `SeasonalContext` to swap palette assets at runtime.
- Store skin config in `core/theme` so other games can consume pattern.
- Plan to expose selection via Settings > Cosmetics after MVP.

## Next Steps
- Request concept art for each skin + seasonal variant.
- Confirm asset delivery timelines with art team.

## Implementation Status
- Skin selection UI added in Snakes Duel placeholder screen; selections persist via AsyncStorage and update snake palettes.


## Handoff Checklist
- Deliver PSD/SVG for body segments (head/straight/turn/tail) per base + seasonal variants.
- Provide particle textures for seasonal trails (winter frost, spring bloom, summer sparkle, autumn leaf).
- Supply palette tokens for integration into `SeasonalContext` mapping.
- Target delivery: 2025-09-27 for concept sign-off; final assets by 2025-10-05.

