import { describe, it, expect } from 'vitest'
import {
  checkWinCondition,
  isMrXCaught,
  isMrXEscaped,
} from '../../src/engine/winCondition.js'
import { createPlayer, createInitialState } from '../../src/engine/gameState.js'

function makeTestState(overrides = {}) {
  const mrx = createPlayer('mrx-1', 'Mr. X', 'mrx', null)
  const d1 = createPlayer('d-1', 'Detective 1', 'detective', 1)
  const d2 = createPlayer('d-2', 'Detective 2', 'detective', 2)
  const state = createInitialState([mrx, d1, d2], 67)
  const players = state.players.map((p) => {
    if (p.id === 'd-1') return { ...p, position: 13 }
    if (p.id === 'd-2') return { ...p, position: 52 }
    return p
  })
  return { ...state, players, ...overrides }
}

describe('winCondition', () => {
  it('isMrXCaught returns true when detective on same position', () => {
    const state = makeTestState()
    const players = state.players.map((p) => {
      if (p.id === 'd-1') return { ...p, position: 67 } // Same as Mr. X
      return p
    })
    expect(isMrXCaught({ ...state, players })).toBe(true)
  })

  it('isMrXCaught returns false when no detective on Mr. X position', () => {
    const state = makeTestState()
    expect(isMrXCaught(state)).toBe(false)
  })

  it('isMrXEscaped returns true after turn 24 at round start', () => {
    const state = makeTestState({ turn: 24, currentPlayerIndex: 0 })
    expect(isMrXEscaped(state)).toBe(true)
  })

  it('isMrXEscaped returns false mid-game', () => {
    const state = makeTestState({ turn: 10, currentPlayerIndex: 0 })
    expect(isMrXEscaped(state)).toBe(false)
  })

  it('checkWinCondition detects detective catch', () => {
    const state = makeTestState()
    const players = state.players.map((p) => {
      if (p.id === 'd-1') return { ...p, position: 67 }
      return p
    })
    const result = checkWinCondition({ ...state, players })
    expect(result.winner).toBe('detectives')
    expect(result.reason).toContain('caught')
  })

  it('checkWinCondition detects Mr. X escape', () => {
    const state = makeTestState({ turn: 24, currentPlayerIndex: 0 })
    const result = checkWinCondition(state)
    expect(result.winner).toBe('mrx')
    expect(result.reason).toContain('survived')
  })

  it('checkWinCondition returns null when game ongoing', () => {
    const state = makeTestState()
    const result = checkWinCondition(state)
    expect(result.winner).toBeNull()
  })

  it('checkWinCondition detects all detectives stuck', () => {
    const state = makeTestState()
    // Set all detective tickets to 0
    const players = state.players.map((p) => {
      if (p.role === 'detective') {
        return {
          ...p,
          tickets: { taxi: 0, bus: 0, underground: 0, ferry: 0, black: 0, double: 0 },
        }
      }
      return p
    })
    const s = { ...state, players, currentPlayerIndex: 1 }
    const result = checkWinCondition(s)
    expect(result.winner).toBe('mrx')
    expect(result.reason).toContain('stuck')
  })
})
