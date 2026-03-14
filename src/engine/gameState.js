import { REVEAL_TURNS, TOTAL_TURNS, INITIAL_TICKETS } from './locations.js'

/**
 * Generates a random 6-character alphanumeric room code.
 */
export function createGameId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

/**
 * Creates a player object.
 * @param {string} id - Unique player identifier
 * @param {string} name - Display name
 * @param {'mrx'|'detective'} role - Player role
 * @param {number|null} detectiveIndex - 1-5 for detectives, null for Mr. X
 */
export function createPlayer(id, name, role, detectiveIndex) {
  const tickets =
    role === 'mrx'
      ? { ...INITIAL_TICKETS.mrx }
      : { ...INITIAL_TICKETS.detective, black: 0, double: 0 }

  return {
    id,
    name,
    role,
    detectiveIndex: detectiveIndex ?? null,
    position: null,
    tickets,
    isEliminated: false,
  }
}

/**
 * Creates the full initial game state.
 * @param {Array} players - Array of player objects (Mr. X first, then detectives)
 * @param {number} mrxStartPosition - Starting node for Mr. X
 * @returns {Object} Complete game state
 */
export function createInitialState(players, mrxStartPosition) {
  const statePlayers = players.map((p) => {
    if (p.role === 'mrx') {
      return { ...p, position: mrxStartPosition }
    }
    return { ...p }
  })

  return {
    id: createGameId(),
    phase: 'playing',
    turn: 1,
    currentPlayerIndex: 0,
    players: statePlayers,
    mrxState: {
      positionHistory: [],
      isDoubleMoveActive: false,
      doubleMovePending: false,
    },
    ticketTracker: [],
    winner: null,
    winReason: null,
  }
}

/**
 * Advances the turn to the next non-eliminated player.
 * Handles round advancement when all players have moved.
 * Returns the new state (pure function).
 */
export function advanceTurn(state) {
  const totalPlayers = state.players.length
  let nextIndex = state.currentPlayerIndex + 1
  let newTurn = state.turn

  // If Mr. X has a double move pending, he goes again
  if (state.mrxState.doubleMovePending) {
    return {
      ...state,
      mrxState: {
        ...state.mrxState,
        doubleMovePending: false,
      },
      // currentPlayerIndex stays 0 (Mr. X)
    }
  }

  // If Mr. X double move was active (second move just completed), deactivate it
  const newMrxState = state.mrxState.isDoubleMoveActive
    ? { ...state.mrxState, isDoubleMoveActive: false }
    : { ...state.mrxState }

  // Skip eliminated players
  while (nextIndex < totalPlayers && state.players[nextIndex].isEliminated) {
    nextIndex++
  }

  // If we've gone past all players, advance the round
  if (nextIndex >= totalPlayers) {
    newTurn = state.turn + 1
    nextIndex = 0

    // Check if game should end (past final turn)
    if (newTurn > TOTAL_TURNS) {
      return {
        ...state,
        turn: TOTAL_TURNS,
        currentPlayerIndex: 0,
        phase: 'finished',
        winner: 'mrx',
        winReason: 'Mr. X survived all 24 turns',
        mrxState: newMrxState,
      }
    }
  }

  return {
    ...state,
    turn: newTurn,
    currentPlayerIndex: nextIndex,
    mrxState: newMrxState,
  }
}

/**
 * Returns the current player object from the state.
 */
export function getCurrentPlayer(state) {
  return state.players[state.currentPlayerIndex]
}

/**
 * Checks if a given turn number is a reveal turn.
 */
export function isRevealTurn(turn) {
  return REVEAL_TURNS.includes(turn)
}
