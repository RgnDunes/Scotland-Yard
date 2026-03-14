import { describe, it, expect } from 'vitest'
import { createPlayer, createInitialState } from '../../src/engine/gameState.js'
import {
  getValidMoves,
  canMoveTo,
  applyMove,
  applyBlackTicketMove,
  applyDoubleMove,
} from '../../src/engine/movement.js'

function makeTestState() {
  const mrx = createPlayer('mrx-1', 'Mr. X', 'mrx', null)
  const d1 = createPlayer('d-1', 'Detective 1', 'detective', 1)
  const d2 = createPlayer('d-2', 'Detective 2', 'detective', 2)
  const state = createInitialState([mrx, d1, d2], 67)
  // Place detectives at known positions
  const players = state.players.map((p) => {
    if (p.id === 'd-1') return { ...p, position: 13 }
    if (p.id === 'd-2') return { ...p, position: 52 }
    return p
  })
  return { ...state, players }
}

describe('movement', () => {
  it('getValidMoves returns moves for Mr. X', () => {
    const state = makeTestState()
    const moves = getValidMoves(state, 'mrx-1')
    expect(moves.length).toBeGreaterThan(0)
    // Mr. X at 67, should be able to reach neighbors
    const nodeIds = moves.map((m) => m.nodeId)
    expect(nodeIds).toContain(51)
    expect(nodeIds).toContain(66)
  })

  it('getValidMoves returns moves for detective', () => {
    const state = makeTestState()
    const moves = getValidMoves(state, 'd-1')
    expect(moves.length).toBeGreaterThan(0)
  })

  it('detectives cannot move to node occupied by another detective', () => {
    const state = makeTestState()
    // d-1 at 13, d-2 at 52. Node 52 is a neighbor of 13 via bus
    const moves = getValidMoves(state, 'd-1')
    const moveToD2 = moves.filter((m) => m.nodeId === 52)
    expect(moveToD2.length).toBe(0)
  })

  it('canMoveTo validates correctly', () => {
    const state = makeTestState()
    // Mr. X at 67, taxi to 51 should be valid
    const result = canMoveTo(state, 'mrx-1', 51, 'taxi')
    expect(result.valid).toBe(true)
  })

  it('canMoveTo rejects invalid transport', () => {
    const state = makeTestState()
    // Node 1 is not adjacent to 67 via taxi
    const result = canMoveTo(state, 'mrx-1', 1, 'taxi')
    expect(result.valid).toBe(false)
  })

  it('applyMove moves the player and spends ticket', () => {
    const state = makeTestState()
    const newState = applyMove(state, 'mrx-1', 51, 'taxi')
    const mrx = newState.players.find((p) => p.id === 'mrx-1')
    expect(mrx.position).toBe(51)
    expect(mrx.tickets.taxi).toBe(3) // started with 4
  })

  it('applyMove updates ticket tracker for Mr. X', () => {
    const state = makeTestState()
    const newState = applyMove(state, 'mrx-1', 51, 'taxi')
    expect(newState.ticketTracker.length).toBe(1)
    expect(newState.ticketTracker[0].ticket).toBe('taxi')
  })

  it('applyMove transfers detective ticket to Mr. X', () => {
    const state = makeTestState()
    // First move Mr. X
    let newState = applyMove(state, 'mrx-1', 51, 'taxi')
    // Now detective 1 moves (d-1 at 13, move to 4 via taxi)
    newState = applyMove(newState, 'd-1', 4, 'taxi')
    const mrx = newState.players.find((p) => p.id === 'mrx-1')
    expect(mrx.tickets.taxi).toBe(4) // 4-1 (spent) +1 (received) = 4
  })

  it('applyBlackTicketMove hides transport type', () => {
    const state = makeTestState()
    const newState = applyBlackTicketMove(state, 51)
    const mrx = newState.players.find((p) => p.id === 'mrx-1')
    expect(mrx.position).toBe(51)
    expect(mrx.tickets.black).toBe(4) // started with 5
    expect(newState.ticketTracker[0].ticket).toBe('?')
  })

  it('applyDoubleMove activates double move', () => {
    const state = makeTestState()
    const newState = applyDoubleMove(state)
    expect(newState.mrxState.isDoubleMoveActive).toBe(true)
    expect(newState.mrxState.doubleMovePending).toBe(true)
    const mrx = newState.players.find((p) => p.id === 'mrx-1')
    expect(mrx.tickets.double).toBe(1)
  })

  it('double move lets Mr. X move twice', () => {
    const state = makeTestState()
    let s = applyDoubleMove(state)
    // First move
    s = applyMove(s, 'mrx-1', 51, 'taxi')
    expect(s.currentPlayerIndex).toBe(0) // Still Mr. X's turn
    // Second move
    s = applyMove(s, 'mrx-1', 38, 'taxi')
    expect(s.currentPlayerIndex).toBe(1) // Now detective's turn
  })

  it('applyMove throws on invalid move', () => {
    const state = makeTestState()
    expect(() => applyMove(state, 'mrx-1', 1, 'taxi')).toThrow()
  })

  it('reveal turn records position', () => {
    // Turn 3 is a reveal turn
    const state = { ...makeTestState(), turn: 3 }
    const newState = applyMove(state, 'mrx-1', 51, 'taxi')
    expect(newState.ticketTracker[0].revealedPosition).toBe(51)
  })

  it('non-reveal turn does not record position', () => {
    const state = { ...makeTestState(), turn: 1 }
    const newState = applyMove(state, 'mrx-1', 51, 'taxi')
    expect(newState.ticketTracker[0].revealedPosition).toBeNull()
  })
})
