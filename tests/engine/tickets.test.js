import { describe, it, expect } from 'vitest'
import {
  spendTicket,
  receiveTicket,
  getTicketCount,
  hasAnyValidMove,
} from '../../src/engine/tickets.js'
import { createPlayer, createInitialState } from '../../src/engine/gameState.js'

describe('tickets', () => {
  it('spendTicket deducts one ticket', () => {
    const tickets = { taxi: 10, bus: 8, underground: 4, ferry: 0, black: 0, double: 0 }
    const result = spendTicket(tickets, 'taxi')
    expect(result.taxi).toBe(9)
    expect(tickets.taxi).toBe(10) // original unchanged
  })

  it('spendTicket throws on zero tickets', () => {
    const tickets = { taxi: 0, bus: 8, underground: 4, ferry: 0, black: 0, double: 0 }
    expect(() => spendTicket(tickets, 'taxi')).toThrow('Insufficient')
  })

  it('spendTicket ferry is free', () => {
    const tickets = { taxi: 10, bus: 8, underground: 4, ferry: 0, black: 0, double: 0 }
    const result = spendTicket(tickets, 'ferry')
    expect(result).toEqual(tickets)
  })

  it('receiveTicket adds one ticket', () => {
    const mrxTickets = { taxi: 4, bus: 3, underground: 3, ferry: 0, black: 5, double: 2 }
    const result = receiveTicket(mrxTickets, 'taxi')
    expect(result.taxi).toBe(5)
  })

  it('receiveTicket ferry does nothing', () => {
    const mrxTickets = { taxi: 4, bus: 3, underground: 3, ferry: 0, black: 5, double: 2 }
    const result = receiveTicket(mrxTickets, 'ferry')
    expect(result).toEqual(mrxTickets)
  })

  it('getTicketCount returns correct count', () => {
    const player = { tickets: { taxi: 7, bus: 3, underground: 2, ferry: 0, black: 0, double: 0 } }
    expect(getTicketCount(player, 'taxi')).toBe(7)
    expect(getTicketCount(player, 'bus')).toBe(3)
  })

  it('hasAnyValidMove returns true for player with valid moves', () => {
    const mrx = createPlayer('mrx-1', 'Mr. X', 'mrx', null)
    const d1 = createPlayer('d-1', 'D1', 'detective', 1)
    const state = createInitialState([mrx, d1], 67)
    const players = state.players.map((p) => {
      if (p.id === 'd-1') return { ...p, position: 13 }
      return p
    })
    const s = { ...state, players }
    expect(hasAnyValidMove(s, 'mrx-1')).toBe(true)
    expect(hasAnyValidMove(s, 'd-1')).toBe(true)
  })

  it('hasAnyValidMove returns false for eliminated player', () => {
    const mrx = createPlayer('mrx-1', 'Mr. X', 'mrx', null)
    const d1 = createPlayer('d-1', 'D1', 'detective', 1)
    const state = createInitialState([mrx, d1], 67)
    const players = state.players.map((p) => {
      if (p.id === 'd-1') return { ...p, position: 13, isEliminated: true }
      return p
    })
    const s = { ...state, players }
    expect(hasAnyValidMove(s, 'd-1')).toBe(false)
  })
})
