# Multiplayer Backend Implementation

## Plan

- [x] Step 1: Write `server/events.js` — full event constants (ESM), mirroring `src/multiplayer/events.js` with all events
- [x] Step 2: Write `server/Room.js` — Room class with full game logic, state filtering, reconnection, cleanup
- [x] Step 3: Write `server/index.js` — Express + Socket.IO server with all event handlers, room management
- [x] Step 4: Verify the server starts without errors

## Architecture Notes
- Package.json has `"type": "module"` so server files use ESM `import/export`
- Server imports engine modules directly from `../src/engine/`
- Room class owns game state and exposes filtered views per player role
- Mr. X position is NEVER sent to detective clients (security critical)
- Reconnection: 60s grace period with timer, then mark disconnected
- Room auto-cleanup: 10 min after game ends or all disconnect

## Results
- All 3 server files implemented and verified
- Server starts cleanly on port 3001, health endpoint responds
- No syntax errors, no unused imports
