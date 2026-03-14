import { TOTAL_TURNS } from './locations.js'
import { hasAnyValidMove } from './tickets.js'

/**
 * Checks if any detective occupies Mr. X's position.
 */
export function isMrXCaught(state) {
  const mrx = state.players.find((p) => p.role === 'mrx')
  if (!mrx) return false

  return state.players.some(
    (p) => p.role === 'detective' && !p.isEliminated && p.position === mrx.position,
  )
}

/**
 * Checks if Mr. X has survived all 24 turns (game is over and Mr. X was not caught).
 */
export function isMrXEscaped(state) {
  return state.turn >= TOTAL_TURNS && state.currentPlayerIndex === 0 && !isMrXCaught(state)
}

/**
 * Comprehensive win condition check. Evaluates all possible win/loss scenarios.
 * Returns { winner: null|'mrx'|'detectives', reason: null|String }.
 *
 * Win conditions:
 * - Detectives win: A detective moves onto Mr. X's position
 * - Detectives win: Mr. X has no valid moves (cornered)
 * - Mr. X wins: Survived all 24 turns
 * - Mr. X wins: All detectives are stuck (no valid moves for any detective)
 */
export function checkWinCondition(state) {
  // Detective victory: Mr. X is caught
  if (isMrXCaught(state)) {
    const catcher = state.players.find(
      (p) => p.role === 'detective' && !p.isEliminated && p.position === state.players.find((m) => m.role === 'mrx').position,
    )
    return {
      winner: 'detectives',
      reason: `${catcher?.name || 'A detective'} caught Mr. X at position ${catcher?.position}`,
    }
  }

  // Mr. X victory: survived all turns
  if (isMrXEscaped(state)) {
    return {
      winner: 'mrx',
      reason: 'Mr. X survived all 24 turns',
    }
  }

  // Mr. X cornered: Mr. X has no valid moves on their turn
  const mrx = state.players.find((p) => p.role === 'mrx')
  if (mrx && state.currentPlayerIndex === 0 && !hasAnyValidMove(state, mrx.id)) {
    return {
      winner: 'detectives',
      reason: 'Mr. X has no valid moves',
    }
  }

  // All detectives stuck: no detective can move
  const activeDetectives = state.players.filter(
    (p) => p.role === 'detective' && !p.isEliminated,
  )
  if (activeDetectives.length > 0) {
    const allStuck = activeDetectives.every((d) => !hasAnyValidMove(state, d.id))
    if (allStuck) {
      return {
        winner: 'mrx',
        reason: 'All detectives are stuck with no valid moves',
      }
    }
  }

  return { winner: null, reason: null }
}
