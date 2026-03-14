import { describe, it, expect } from 'vitest'
import { TRANSPORT, getAdjacentNodes } from '../../src/engine/graph.js'

describe('graph', () => {
  it('exports transport constants', () => {
    expect(TRANSPORT.TAXI).toBe('taxi')
    expect(TRANSPORT.BUS).toBe('bus')
    expect(TRANSPORT.UNDERGROUND).toBe('underground')
    expect(TRANSPORT.FERRY).toBe('ferry')
  })

  it('getAdjacentNodes returns empty array for unknown node', () => {
    expect(getAdjacentNodes(999, 'taxi')).toEqual([])
  })
})
