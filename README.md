# Scotland Yard

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rgndunes.github.io/Scotland-Yard/)
[![CI](https://github.com/RgnDunes/Scotland-Yard/actions/workflows/ci.yml/badge.svg)](https://github.com/RgnDunes/Scotland-Yard/actions)

A digital adaptation of the classic asymmetric multiplayer detective board game **Scotland Yard** (1983 Spiel des Jahres winner). One player secretly moves around a 199-location map of London as Mr. X, while 2-5 detectives work cooperatively to track and catch him.

## Screenshot

The game board renders a programmatic SVG map of London with 199 numbered stations connected by taxi (yellow), bus (red), underground (blue), and ferry (cyan) routes. Player tokens appear as colored circles on the map. The sidebar displays player status, ticket counts, and Mr. X's travel log. A bottom bar shows the current player's ticket hand and special action buttons.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/RgnDunes/Scotland-Yard.git
cd Scotland-Yard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will be available at `http://localhost:5173/Scotland-Yard/`.

### Multiplayer

To play online multiplayer, start both the frontend and the Socket.IO server:

```bash
npm run dev:all
```

This starts the Vite dev server and the Socket.IO multiplayer server concurrently.

## Game Modes

| Mode | Players | Description |
|------|---------|-------------|
| **Local Hot-Seat** | 3-6 | Pass the device between turns. A privacy screen appears before each turn to prevent peeking. |
| **Online Multiplayer** | 3-6 | Create or join a room with a shareable code. Each player sees their own screen. |
| **vs AI (Mr. X Bot)** | 2-6 | Play as detectives against an AI-controlled Mr. X. Three difficulty levels: Easy, Medium, and Hard. |

## Game Rules

Scotland Yard is an asymmetric detective game set on a map of London:

### Objective
- **Detectives** win by landing on Mr. X's location (catching him).
- **Mr. X** wins by surviving all 24 turns without being caught, or if all detectives are eliminated (stranded with no valid moves).

### Movement
- Players move between connected stations using transport tickets:
  - **Taxi** (yellow routes) -- short hops between adjacent stations
  - **Bus** (red routes) -- medium-range connections
  - **Underground** (blue routes) -- long-range travel between major stations
  - **Ferry** (cyan dashed routes) -- river crossings
- Each move costs one ticket of the corresponding transport type.
- Detectives have a limited supply of tickets. Mr. X collects used detective tickets.

### Mr. X's Advantages
- **Secret Movement**: Mr. X's position is hidden. Only the transport type used is logged.
- **Reveal Turns**: Mr. X's exact position is revealed on turns 3, 8, 13, 18, and 24.
- **Black Tickets**: Hide the transport type used (appears as "?" in the log). Can also be used to take ferries.
- **Double Move**: Use a double-move ticket to take two consecutive turns, making it harder for detectives to predict Mr. X's next position.

### Detective Strategy
- Detectives share information and coordinate to surround Mr. X.
- Use the travel log and reveal turns to narrow down Mr. X's possible locations.
- Block routes and form a net to corner Mr. X.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite                   |
| State     | Zustand                           |
| Animation | Framer Motion                     |
| Routing   | React Router v6                   |
| Styles    | CSS Modules + CSS custom properties|
| Map       | SVG (programmatic from graph data)|
| Testing   | Vitest + Testing Library          |
| Backend   | Node.js + Express + Socket.IO 4   |
| Deploy    | GitHub Pages via GitHub Actions   |

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create your branch from `main`.
2. **Install** dependencies with `npm install`.
3. **Make your changes** -- follow the existing code style (CSS Modules, CSS variables, no inline styles).
4. **Run tests** with `npm test` to ensure nothing is broken.
5. **Run lint** with `npm run lint` to check for code quality issues.
6. **Open a Pull Request** with a clear description of what you changed and why.

### Code Guidelines

- Use CSS Modules for all styling -- no inline styles.
- Use CSS custom properties (variables) for colors -- no hardcoded color values.
- Use the `logger` utility from `src/utils/logger.js` instead of `console.log`.
- Keep components small and focused (single responsibility).
- Wrap memoized components with `React.memo` for performance.
- Ensure all interactive elements are keyboard-accessible.

## License

ISC
