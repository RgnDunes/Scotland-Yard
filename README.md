# Scotland Yard

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rgndunes.github.io/Scotland-Yard/)
[![CI](https://github.com/RgnDunes/Scotland-Yard/actions/workflows/ci.yml/badge.svg)](https://github.com/RgnDunes/Scotland-Yard/actions)

A digital adaptation of the classic asymmetric multiplayer detective board game Scotland Yard (1983 Spiel des Jahres winner). One player secretly moves around a 199-location map of London as Mr. X, while 2-5 detectives work cooperatively to track and catch him.

## Quick Start

```bash
npm install
npm run dev
```

## Multiplayer

```bash
npm run dev:all
```

This starts both the Vite dev server and the Socket.IO multiplayer server.

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

## Game Modes

- **Local Hot-Seat** (3-6 players) — pass the device between turns
- **Online Multiplayer** — create/join rooms with a code
- **vs AI** — play against a Mr. X bot (Easy/Medium/Hard)

## Game Rules

Scotland Yard is an asymmetric detective game:

- **Mr. X** moves secretly around London using taxi, bus, and underground
- **Detectives** (2-5) cooperate to deduce and catch Mr. X
- Mr. X reveals his position on turns 3, 8, 13, 18, and 24
- Mr. X has special black tickets (hide transport type) and double-move tickets
- **Detectives win** by landing on Mr. X's location
- **Mr. X wins** by surviving all 24 turns

## License

ISC
