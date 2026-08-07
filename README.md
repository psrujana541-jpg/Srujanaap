# Drawlulu.io - Real-Time Multiplayer Drawing & Guessing Game

A modern, high-performance real-time multiplayer drawing and guessing game built with React, Vite, HTML5 Canvas API, Node.js, Express, and Socket.io.

## Features

- 🎨 **Real-time synchronized drawing canvas**: Smooth brush strokes, eraser, bucket fill, color options, brush size controls, and undo support.
- ⚡ **Instant guess detection & speed scoring**: Point calculations based on guess speed and accuracy, plus proximity hints for close guesses.
- 👥 **Room system**: Create custom rooms with custom round counts and draw timers, or join existing rooms via room codes.
- 🏆 **Dynamic Live Scoreboard & Podium**: Real-time rank changes, score updates, and celebratory podium confetti at game end.
- 🎭 **Custom Avatars & Vibrant UI**: Colorful modern dark/neon glassmorphism UI with responsive components.

## Getting Started

### Installation

1. Install root, server, and client dependencies:
```bash
npm run install:all
```

2. Start both server & client in development mode:
```bash
npm run dev
```

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`
