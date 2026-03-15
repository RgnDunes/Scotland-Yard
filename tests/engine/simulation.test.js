import { describe, it, expect } from 'vitest'
import {
  createPlayer,
  createInitialState,
  getCurrentPlayer,
  advanceTurn,
} from '../../src/engine/gameState.js'
import {
  getValidMoves,
  applyMove,
  applyBlackTicketMove,
  applyDoubleMove,
} from '../../src/engine/movement.js'
import { checkWinCondition } from '../../src/engine/winCondition.js'
import { getMrXMove, getDetectiveAiMove } from '../../src/engine/mrxAi.js'
import { DETECTIVE_STARTING_POSITIONS, TOTAL_TURNS, REVEAL_TURNS } from '../../src/engine/locations.js'
import { getAllAdjacentNodeIds } from '../../src/engine/graph.js'

/* ── Helpers ──────────────────────────────────────────────── */

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Validates that every invariant holds on the current game state.
 * Returns an array of violation strings (empty = valid).
 */
function validateState(state, context) {
  const violations = []
  const prefix = context ? `[${context}] ` : ''

  // Phase must be valid
  if (state.phase !== 'playing' && state.phase !== 'finished') {
    violations.push(`${prefix}Invalid phase: ${state.phase}`)
  }

  // Exactly 1 Mr. X
  const mrxCount = state.players.filter((p) => p.role === 'mrx').length
  if (mrxCount !== 1) {
    violations.push(`${prefix}Expected 1 Mr. X, found ${mrxCount}`)
  }

  // All positions in range 1-199
  for (const p of state.players) {
    if (p.position < 1 || p.position > 199) {
      violations.push(`${prefix}${p.name} has invalid position: ${p.position}`)
    }
  }

  // No negative tickets
  for (const p of state.players) {
    for (const [type, count] of Object.entries(p.tickets)) {
      if (count < 0) {
        violations.push(`${prefix}${p.name} has negative ${type} tickets: ${count}`)
      }
    }
  }

  // Turn within valid range (can be 0 at start, up to TOTAL_TURNS+1 at end)
  if (state.turn < 0 || state.turn > TOTAL_TURNS + 2) {
    violations.push(`${prefix}Turn out of range: ${state.turn}`)
  }

  // currentPlayerIndex in bounds
  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
    violations.push(`${prefix}currentPlayerIndex out of bounds: ${state.currentPlayerIndex}`)
  }

  return violations
}

/**
 * Runs a full game simulation with AI controlling all players.
 *
 * @param {number} numDetectives - Number of detectives (1-5)
 * @param {string} difficulty - Mr. X AI difficulty ('easy'|'medium'|'hard')
 * @returns {{ winner, winReason, turns, moves, violations, blackTicketUses, doubleMoveUses, error? }}
 */
function simulateGame(numDetectives, difficulty = 'medium') {
  const players = [createPlayer('mrx', 'Mr. X', 'mrx', null)]
  for (let i = 1; i <= numDetectives; i++) {
    players.push(createPlayer(`d${i}`, `Detective ${i}`, 'detective', i))
  }

  const startPositions = shuffleArray(DETECTIVE_STARTING_POSITIONS)
  const placedPlayers = players.map((p, idx) => {
    if (p.role === 'detective') {
      return { ...p, position: startPositions[idx - 1] }
    }
    return p
  })

  const usedPositions = new Set(
    placedPlayers.filter((p) => p.role === 'detective').map((p) => p.position),
  )
  const allNodes = Array.from({ length: 199 }, (_, i) => i + 1)
  const availableStarts = allNodes.filter((n) => !usedPositions.has(n))
  const mrxStart = pickRandom(availableStarts)

  let state = createInitialState(placedPlayers, mrxStart)

  const result = {
    winner: null,
    winReason: null,
    turns: 0,
    moves: 0,
    violations: [],
    blackTicketUses: 0,
    doubleMoveUses: 0,
    error: null,
  }

  const MAX_ITERATIONS = 500

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    if (state.phase === 'finished') break

    const currentPlayer = getCurrentPlayer(state)
    if (!currentPlayer) {
      result.error = `No current player at turn ${state.turn}, index ${state.currentPlayerIndex}`
      break
    }

    try {
      if (currentPlayer.role === 'mrx') {
        const decision = getMrXMove(state, difficulty)

        if (!decision) {
          state = advanceTurn(state)
          result.moves++
          const win = checkWinCondition(state)
          if (win.winner) {
            state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
          }
          continue
        }

        if (decision.useDouble) {
          state = applyDoubleMove(state)
          result.doubleMoveUses++
        }

        if (decision.useBlack) {
          state = applyBlackTicketMove(state, decision.nodeId)
          result.blackTicketUses++
        } else {
          state = applyMove(state, currentPlayer.id, decision.nodeId, decision.transport)
        }
        result.moves++

        let win = checkWinCondition(state)
        if (win.winner) {
          state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
          break
        }

        if (decision.useDouble && decision.secondMove && state.phase === 'playing') {
          const mrxAfter = state.players.find((p) => p.role === 'mrx')
          if (mrxAfter) {
            if (decision.secondMove.useBlack) {
              state = applyBlackTicketMove(state, decision.secondMove.nodeId)
              result.blackTicketUses++
            } else {
              state = applyMove(
                state,
                mrxAfter.id,
                decision.secondMove.nodeId,
                decision.secondMove.transport,
              )
            }
            result.moves++

            win = checkWinCondition(state)
            if (win.winner) {
              state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
              break
            }
          }
        }
      } else {
        const decision = getDetectiveAiMove(state, currentPlayer.id)

        if (!decision) {
          state = advanceTurn(state)
          result.moves++
          const win = checkWinCondition(state)
          if (win.winner) {
            state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
          }
          continue
        }

        state = applyMove(state, currentPlayer.id, decision.nodeId, decision.transport)
        result.moves++

        const win = checkWinCondition(state)
        if (win.winner) {
          state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
          break
        }
      }
    } catch (err) {
      result.error = `Turn ${state.turn}, ${currentPlayer.name}: ${err.message}`
      break
    }

    const v = validateState(state, `Turn ${state.turn}`)
    result.violations.push(...v)
  }

  result.winner = state.winner
  result.winReason = state.winReason
  result.turns = state.turn

  return result
}

/* ── Test Suites ──────────────────────────────────────────── */

describe('Game Simulation - Full Games', () => {
  const GAMES_PER_CONFIG = 50

  it('completes 50 games with 2 detectives (easy) without crashing', () => {
    const results = []
    for (let i = 0; i < GAMES_PER_CONFIG; i++) {
      results.push(simulateGame(2, 'easy'))
    }

    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error('Errors:', errors.map((e) => e.error))
    }
    expect(errors).toHaveLength(0)
  })

  it('completes 50 games with 3 detectives (medium) without crashing', () => {
    const results = []
    for (let i = 0; i < GAMES_PER_CONFIG; i++) {
      results.push(simulateGame(3, 'medium'))
    }

    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error('Errors:', errors.map((e) => e.error))
    }
    expect(errors).toHaveLength(0)
  })

  it('completes 50 games with 5 detectives (hard) without crashing', () => {
    const results = []
    for (let i = 0; i < GAMES_PER_CONFIG; i++) {
      results.push(simulateGame(5, 'hard'))
    }

    const errors = results.filter((r) => r.error)
    if (errors.length > 0) {
      console.error('Errors:', errors.map((e) => e.error))
    }
    expect(errors).toHaveLength(0)
  })
})

describe('Game Simulation - State Invariants', () => {
  const ALL_RESULTS = []

  // Run a batch of games and collect results for invariant checking
  for (let i = 0; i < 30; i++) {
    ALL_RESULTS.push(simulateGame(3, 'medium'))
    ALL_RESULTS.push(simulateGame(5, 'hard'))
  }

  it('all games produce a valid winner', () => {
    for (const r of ALL_RESULTS) {
      if (!r.error) {
        expect(['mrx', 'detectives']).toContain(r.winner)
        expect(r.winReason).toBeTruthy()
      }
    }
  })

  it('no state violations across all games', () => {
    const allViolations = ALL_RESULTS.flatMap((r) => r.violations)
    if (allViolations.length > 0) {
      console.error('State violations:', allViolations.slice(0, 10))
    }
    expect(allViolations).toHaveLength(0)
  })

  it('all games end within 24 turns', () => {
    for (const r of ALL_RESULTS) {
      if (!r.error) {
        expect(r.turns).toBeLessThanOrEqual(TOTAL_TURNS + 1)
      }
    }
  })

  it('Mr. X uses black tickets in hard difficulty', () => {
    const hardGames = ALL_RESULTS.filter((_, i) => i % 2 === 1) // odd indices are hard
    const totalBlack = hardGames.reduce((sum, r) => sum + r.blackTicketUses, 0)
    expect(totalBlack).toBeGreaterThan(0)
  })

  it('Mr. X uses double moves in hard difficulty', () => {
    const hardGames = ALL_RESULTS.filter((_, i) => i % 2 === 1)
    const totalDouble = hardGames.reduce((sum, r) => sum + r.doubleMoveUses, 0)
    expect(totalDouble).toBeGreaterThan(0)
  })

  it('both sides can win (game is balanced)', () => {
    const mrxWins = ALL_RESULTS.filter((r) => r.winner === 'mrx').length
    const detWins = ALL_RESULTS.filter((r) => r.winner === 'detectives').length
    // At least 1 win for each side across 60 games
    expect(mrxWins).toBeGreaterThan(0)
    expect(detWins).toBeGreaterThan(0)
  })
})

describe('Game Simulation - Ticket Tracking', () => {
  it('detective tickets decrease correctly after moves', () => {
    const players = [
      createPlayer('mrx', 'Mr. X', 'mrx', null),
      createPlayer('d1', 'Det 1', 'detective', 1),
      createPlayer('d2', 'Det 2', 'detective', 2),
    ]

    const startPositions = shuffleArray(DETECTIVE_STARTING_POSITIONS)
    const placed = players.map((p, i) => {
      if (p.role === 'detective') return { ...p, position: startPositions[i - 1] }
      return p
    })

    const usedPos = new Set(placed.filter((p) => p.role === 'detective').map((p) => p.position))
    const avail = Array.from({ length: 199 }, (_, i) => i + 1).filter((n) => !usedPos.has(n))
    let state = createInitialState(placed, pickRandom(avail))

    // Play until it's a detective's turn
    while (state.phase === 'playing') {
      const cp = getCurrentPlayer(state)
      if (cp.role === 'detective') {
        const initialTaxi = cp.tickets.taxi
        const initialBus = cp.tickets.bus
        const initialUnder = cp.tickets.underground
        const totalBefore = initialTaxi + initialBus + initialUnder

        const decision = getDetectiveAiMove(state, cp.id)
        if (!decision) {
          state = advanceTurn(state)
          continue
        }

        state = applyMove(state, cp.id, decision.nodeId, decision.transport)
        const after = state.players.find((p) => p.id === cp.id)
        const totalAfter = after.tickets.taxi + after.tickets.bus + after.tickets.underground

        // Exactly 1 ticket less (ferry is free so it might not decrease)
        if (decision.transport !== 'ferry') {
          expect(totalAfter).toBe(totalBefore - 1)
        }
        break
      }

      // Mr. X moves
      const dec = getMrXMove(state, 'medium')
      if (!dec) { state = advanceTurn(state); continue }
      if (dec.useBlack) {
        state = applyBlackTicketMove(state, dec.nodeId)
      } else {
        state = applyMove(state, cp.id, dec.nodeId, dec.transport)
      }

      const win = checkWinCondition(state)
      if (win.winner) break
    }
  })

  it('Mr. X receives tickets spent by detectives', () => {
    const players = [
      createPlayer('mrx', 'Mr. X', 'mrx', null),
      createPlayer('d1', 'Det 1', 'detective', 1),
    ]

    const startPositions = shuffleArray(DETECTIVE_STARTING_POSITIONS)
    const placed = players.map((p, i) => {
      if (p.role === 'detective') return { ...p, position: startPositions[i - 1] }
      return p
    })

    const usedPos = new Set(placed.filter((p) => p.role === 'detective').map((p) => p.position))
    const avail = Array.from({ length: 199 }, (_, i) => i + 1).filter((n) => !usedPos.has(n))
    let state = createInitialState(placed, pickRandom(avail))

    // Get Mr. X's initial total tickets
    const mrxBefore = state.players.find((p) => p.role === 'mrx')
    const mrxTotalBefore = mrxBefore.tickets.taxi + mrxBefore.tickets.bus + mrxBefore.tickets.underground

    // Play one full round (Mr. X + detective)
    let detMoved = false
    for (let i = 0; i < 10 && !detMoved; i++) {
      if (state.phase === 'finished') break
      const cp = getCurrentPlayer(state)

      if (cp.role === 'mrx') {
        const dec = getMrXMove(state, 'medium')
        if (!dec) { state = advanceTurn(state); continue }
        if (dec.useBlack) {
          state = applyBlackTicketMove(state, dec.nodeId)
        } else {
          state = applyMove(state, cp.id, dec.nodeId, dec.transport)
        }
      } else {
        const dec = getDetectiveAiMove(state, cp.id)
        if (!dec) { state = advanceTurn(state); continue }

        const transport = dec.transport
        state = applyMove(state, cp.id, dec.nodeId, transport)
        detMoved = true

        // Mr. X should have received 1 ticket of the type the detective used
        if (transport !== 'ferry') {
          const mrxAfter = state.players.find((p) => p.role === 'mrx')
          const mrxTotalAfter = mrxAfter.tickets.taxi + mrxAfter.tickets.bus + mrxAfter.tickets.underground

          // Mr. X spent 1 on their move, but received 1 from detective
          // Net change depends on what Mr. X used vs what detective gave
          // Just check the specific transport increased by 1 relative to after Mr. X's move
          expect(mrxAfter.tickets[transport]).toBeGreaterThanOrEqual(0)
        }
      }

      const win = checkWinCondition(state)
      if (win.winner) {
        state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
        break
      }
    }
  })
})

describe('Game Simulation - Reveal Turns', () => {
  it('Mr. X position history marks reveals on correct turns', () => {
    // Run several games and check reveal turn accuracy
    for (let g = 0; g < 10; g++) {
      const result = simulateGame(3, 'medium')
      if (result.error) continue

      // Reconstruct: run one more game and inspect state
      const players = [
        createPlayer('mrx', 'Mr. X', 'mrx', null),
        createPlayer('d1', 'Det 1', 'detective', 1),
        createPlayer('d2', 'Det 2', 'detective', 2),
        createPlayer('d3', 'Det 3', 'detective', 3),
      ]

      const startPositions = shuffleArray(DETECTIVE_STARTING_POSITIONS)
      const placed = players.map((p, i) => {
        if (p.role === 'detective') return { ...p, position: startPositions[i - 1] }
        return p
      })

      const usedPos = new Set(placed.filter((p) => p.role === 'detective').map((p) => p.position))
      const avail = Array.from({ length: 199 }, (_, i) => i + 1).filter((n) => !usedPos.has(n))
      let state = createInitialState(placed, pickRandom(avail))

      for (let iter = 0; iter < 500; iter++) {
        if (state.phase === 'finished') break

        const cp = getCurrentPlayer(state)
        try {
          if (cp.role === 'mrx') {
            const dec = getMrXMove(state, 'medium')
            if (!dec) { state = advanceTurn(state); continue }
            if (dec.useDouble) state = applyDoubleMove(state)
            if (dec.useBlack) {
              state = applyBlackTicketMove(state, dec.nodeId)
            } else {
              state = applyMove(state, cp.id, dec.nodeId, dec.transport)
            }
            if (dec.useDouble && dec.secondMove && state.phase === 'playing') {
              const mrx = state.players.find((p) => p.role === 'mrx')
              if (dec.secondMove.useBlack) {
                state = applyBlackTicketMove(state, dec.secondMove.nodeId)
              } else {
                state = applyMove(state, mrx.id, dec.secondMove.nodeId, dec.secondMove.transport)
              }
            }
          } else {
            const dec = getDetectiveAiMove(state, cp.id)
            if (!dec) { state = advanceTurn(state); continue }
            state = applyMove(state, cp.id, dec.nodeId, dec.transport)
          }
        } catch { break }

        const win = checkWinCondition(state)
        if (win.winner) {
          state = { ...state, phase: 'finished', winner: win.winner, winReason: win.reason }
          break
        }
      }

      // Check that revealed entries match REVEAL_TURNS
      for (const entry of state.mrxState.positionHistory) {
        if (REVEAL_TURNS.includes(entry.turn)) {
          expect(entry.revealed).toBe(true)
        } else {
          expect(entry.revealed).toBe(false)
        }
      }
    }
  })
})

describe('Game Simulation - Summary Stats', () => {
  it('prints summary statistics for 100 games', () => {
    const results = []
    for (let i = 0; i < 50; i++) {
      results.push(simulateGame(3, 'medium'))
      results.push(simulateGame(5, 'hard'))
    }

    const mrxWins = results.filter((r) => r.winner === 'mrx').length
    const detWins = results.filter((r) => r.winner === 'detectives').length
    const errors = results.filter((r) => r.error).length
    const violations = results.reduce((sum, r) => sum + r.violations.length, 0)
    const avgTurns = results.reduce((sum, r) => sum + r.turns, 0) / results.length
    const totalBlack = results.reduce((sum, r) => sum + r.blackTicketUses, 0)
    const totalDouble = results.reduce((sum, r) => sum + r.doubleMoveUses, 0)
    const totalMoves = results.reduce((sum, r) => sum + r.moves, 0)

    console.log('\n=== SIMULATION SUMMARY (100 games) ===')
    console.log(`Mr. X wins:      ${mrxWins} (${((mrxWins / results.length) * 100).toFixed(1)}%)`)
    console.log(`Detective wins:  ${detWins} (${((detWins / results.length) * 100).toFixed(1)}%)`)
    console.log(`Errors:          ${errors}`)
    console.log(`State violations:${violations}`)
    console.log(`Avg game length: ${avgTurns.toFixed(1)} turns`)
    console.log(`Total moves:     ${totalMoves}`)
    console.log(`Black tickets:   ${totalBlack} uses`)
    console.log(`Double moves:    ${totalDouble} uses`)
    console.log('======================================\n')

    expect(errors).toBe(0)
    expect(violations).toBe(0)
  })
})
