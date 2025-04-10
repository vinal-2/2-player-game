# Kids Two Player Games

A collection of fun two-player games designed for kids to play together on a single device.

## Features

- Multiple two-player games (Tic Tac Toe, Air Hockey, Ping Pong, Spinner War, etc.)
- Bot mode for single-player experience
- Sound effects and background music
- Seasonal themes and special events
- Premium mode to remove ads

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/kids-two-player-games.git
cd kids-two-player-games
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Start the development server:
\`\`\`bash
expo start
\`\`\`

4. Run on a device or emulator:
   - Scan the QR code with the Expo Go app on your mobile device
   - Press 'a' to run on an Android emulator
   - Press 'i' to run on an iOS simulator

## Project Structure

\`\`\`
kids-two-player-games/
├── assets/                  # Images, sounds, and fonts
│   ├── fonts/               # Custom fonts
│   ├── images/              # Game images and icons
│   └── sounds/              # Sound effects and music
├── components/              # Reusable UI components
├── contexts/                # React Context providers
├── core/                    # Core game engine
├── games/                   # Individual game implementations
│   ├── air-hockey/          # Air Hockey game
│   ├── ping-pong/           # Ping Pong game
│   ├── tic-tac-toe/         # Tic Tac Toe game
│   └── spinner-war/         # Spinner War game
├── screens/                 # App screens
├── utils/                   # Utility functions
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
└── package.json             # Project dependencies
\`\`\`

## Games

### Air Hockey
Two players control paddles to hit a puck into the opponent's goal.

### Ping Pong
Classic table tennis game where players control paddles to bounce a ball back and forth.

### Tic Tac Toe
Traditional X and O game on a 3x3 grid.

### Spinner War
Players control spinning tops and try to push the opponent out of the arena.

## Development

### Adding a New Game

1. Create a new directory in the `games/` folder
2. Implement the game using the MVC pattern:
   - Create a Model class that implements the `GameModel` interface
   - Create a Controller class that implements the `GameController` interface
   - Create a View component that implements the `GameView` interface
3. Register the game in `contexts/GameContext.tsx`

### Building for Production

\`\`\`bash
expo build:android  # For Android
expo build:ios      # For iOS
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by Ionicons
- Sound effects from [source]
- Background music from [source]
\`\`\`
