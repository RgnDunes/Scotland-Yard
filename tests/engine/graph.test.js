import { describe, it, expect } from 'vitest'
import {
  TRANSPORT,
  graph,
  getAdjacentNodes,
  getAllReachableNodes,
  getAllAdjacentNodeIds,
  findShortestPath,
  getNodesWithinDistance,
  validateGraph,
  UNDERGROUND_STATIONS,
  BUS_STOPS,
  FERRY_NODES,
} from '../../src/engine/graph.js'

describe('graph', () => {
  it('exports transport constants', () => {
    expect(TRANSPORT.TAXI).toBe('taxi')
    expect(TRANSPORT.BUS).toBe('bus')
    expect(TRANSPORT.UNDERGROUND).toBe('underground')
    expect(TRANSPORT.FERRY).toBe('ferry')
  })

  it('contains all 199 nodes', () => {
    for (let i = 1; i <= 199; i++) {
      expect(graph[i]).toBeDefined()
    }
  })

  it('no node has zero total connections', () => {
    for (let i = 1; i <= 199; i++) {
      const node = graph[i]
      const total =
        (node.taxi?.length || 0) +
        (node.bus?.length || 0) +
        (node.underground?.length || 0) +
        (node.ferry?.length || 0)
      expect(total).toBeGreaterThan(0)
    }
  })

  it('all adjacency is symmetric', () => {
    const { valid, errors } = validateGraph()
    expect(errors).toEqual([])
    expect(valid).toBe(true)
  })

  it('ferry nodes are 108, 115, 157, 194', () => {
    expect(FERRY_NODES).toEqual([108, 115, 157, 194])
    for (const node of FERRY_NODES) {
      expect(graph[node].ferry.length).toBeGreaterThan(0)
    }
  })

  it('underground stations are correct', () => {
    expect(UNDERGROUND_STATIONS.length).toBe(14)
    for (const station of UNDERGROUND_STATIONS) {
      expect(graph[station].underground.length).toBeGreaterThan(0)
    }
  })

  it('no more than 20 nodes have underground connections', () => {
    let count = 0
    for (let i = 1; i <= 199; i++) {
      if (graph[i].underground?.length > 0) count++
    }
    expect(count).toBeLessThanOrEqual(20)
  })

  it('getAdjacentNodes returns correct neighbors', () => {
    expect(getAdjacentNodes(1, 'taxi')).toEqual([8, 9])
    expect(getAdjacentNodes(999, 'taxi')).toEqual([])
  })

  it('getAllReachableNodes returns all transport types', () => {
    const reachable = getAllReachableNodes(1)
    expect(reachable).toHaveProperty('taxi')
    expect(reachable).toHaveProperty('bus')
    expect(reachable).toHaveProperty('underground')
    expect(reachable).toHaveProperty('ferry')
  })

  it('getAllAdjacentNodeIds returns unique set of all neighbors', () => {
    const adjacent = getAllAdjacentNodeIds(13)
    expect(adjacent).toContain(4)
    expect(adjacent).toContain(14)
    expect(adjacent.length).toBeGreaterThan(0)
  })

  it('findShortestPath finds path between connected nodes', () => {
    const path = findShortestPath(1, 9)
    expect(path).toEqual([1, 9])
  })

  it('findShortestPath finds multi-hop path', () => {
    const path = findShortestPath(1, 20)
    expect(path).not.toBeNull()
    expect(path[0]).toBe(1)
    expect(path[path.length - 1]).toBe(20)
  })

  it('findShortestPath returns self for same node', () => {
    expect(findShortestPath(1, 1)).toEqual([1])
  })

  it('getNodesWithinDistance returns reachable nodes', () => {
    const nodes = getNodesWithinDistance(1, 1)
    expect(nodes).toContain(8)
    expect(nodes).toContain(9)
  })

  it('getNodesWithinDistance with 2 moves returns more nodes', () => {
    const nodes1 = getNodesWithinDistance(1, 1)
    const nodes2 = getNodesWithinDistance(1, 2)
    expect(nodes2.length).toBeGreaterThanOrEqual(nodes1.length)
  })
})
