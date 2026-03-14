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

---

# Mr. X AI Bot System

## Plan

- [x] Step 1: Implement `src/engine/mrxAi.js` — full AI module with `getMrXMove` (3 difficulty levels) and `getDetectiveAiMove`
- [x] Step 2: Update `src/store/gameStore.js` — add `aiSettings` state, `executeMrXAiTurn()`, `executeDetectiveAiTurn()`
- [x] Step 3: Update `src/pages/Setup.jsx` — add AI toggle checkbox and difficulty selector UI
- [x] Step 4: Update `src/pages/Setup.module.css` — add CSS styles for AI options (CSS variables only)
- [x] Step 5: Update `src/pages/Game.jsx` — skip PassDeviceModal for AI Mr. X, auto-execute AI turn after 800ms delay
- [x] Step 6: Verify — ESLint clean, build succeeds, no console.log, no inline styles, no hardcoded colors

## Architecture Notes
- AI functions are pure: input state, output move decision
- Scoring function: `score = (minDist * 10) + (escapeRoutes * 3) + (underground ? 2 : 0) - (clusterPenalty ? 5 : 0)`
- Easy: 70% random / 30% strategic, no black/double ticket strategy
- Medium: Full strategic scoring
- Hard: Medium + 2-move lookahead (simulates detective optimal response)
- Black ticket: used when detective within 1 hop OR on reveal turns
- Double move: used when cornered (minDist <= 1) or before reveal turns
- Detective AI: BFS toward last revealed Mr. X position, or board center (node 100) if none
- AI settings stored in gameStore and passed from Setup page via `initLocalGame`

## Results
- All files implemented and verified
- ESLint: 0 errors, 0 warnings
- Vite build: succeeds (503 modules, 485KB JS output)
- No console.log, no inline styles in new code, all CSS uses variables

---

# Polish: Accessibility, Error Boundaries, Performance

## Plan

- [x] Step 1: Create ErrorBoundary component (class component) with fallback prop, logger, dark themed CSS
- [x] Step 2: Create LoadingSpinner component for Suspense fallback
- [x] Step 3: Update App.jsx — wrap Routes in ErrorBoundary, lazy load Lobby/Game, Suspense
- [x] Step 4: Performance — custom React.memo comparison on MapNode, verify MapEdge memo
- [x] Step 5: Accessibility — role/tabIndex/aria-label/onKeyDown on MapNode, aria-live region in MapBoard, aria-label on SVG
- [x] Step 6: Mobile layout — sidebar as bottom drawer, horizontal scroll tickets, larger touch targets, full-screen modals
- [x] Step 7: Update README with badges, screenshot, rules, contributing guide

## Results
- Build: succeeds (508 modules, code-split Lobby/Game chunks)
- Lint: 0 errors, 0 warnings
- Tests: 45/45 passing
- No console.log, no inline styles, no hardcoded colors in new code
