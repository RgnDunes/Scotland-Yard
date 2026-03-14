import { getValidMoves } from './movement.js'
import {
  findShortestPath,
  getAllAdjacentNodeIds,
  getAdjacentNodes,
  TRANSPORT,
} from './graph.js'
import { isRevealTurn } from './gameState.js'

/**
 * Returns positions of all non-eliminated detectives.
 */
function getDetectivePositions(state) {
  return state.players
    .filter((p) => p.role === 'detective' && !p.isEliminated)
    .map((p) => p.position)
}

/**
 * Returns the Mr. X player object from state.
 */
function getMrX(state) {
  return state.players.find((p) => p.role === 'mrx')
}

/**
 * Computes BFS distance from a source node to a target node using all transports.
 * Returns the number of hops, or Infinity if unreachable.
 */
function bfsDistance(fromNode, toNode) {
  const path = findShortestPath(fromNode, toNode)
  return path ? path.length - 1 : Infinity
}

/**
 * Computes the minimum BFS distance from a node to any detective.
 */
function minDistanceToDetectives(nodeId, detectivePositions) {
  let min = Infinity
  for (const dPos of detectivePositions) {
    const dist = bfsDistance(nodeId, dPos)
    if (dist < min) min = dist
  }
  return min
}

/**
 * Counts the number of escape routes (adjacent nodes not occupied by detectives)
 * from a given node.
 */
function countEscapeRoutes(nodeId, detectivePositionSet) {
  const adjacent = getAllAdjacentNodeIds(nodeId)
  return adjacent.filter((n) => !detectivePositionSet.has(n)).length
}

/**
 * Computes the centroid (average position in graph distance terms) of detective positions.
 * Returns the detective position that is closest to all others (the "center" of the cluster).
 */
function detectiveClusterCenter(detectivePositions) {
  if (detectivePositions.length === 0) return null
  if (detectivePositions.length === 1) return detectivePositions[0]

  let bestNode = detectivePositions[0]
  let bestTotalDist = Infinity

  for (const candidate of detectivePositions) {
    let totalDist = 0
    for (const other of detectivePositions) {
      if (candidate !== other) {
        totalDist += bfsDistance(candidate, other)
      }
    }
    if (totalDist < bestTotalDist) {
      bestTotalDist = totalDist
      bestNode = candidate
    }
  }

  return bestNode
}

/**
 * Builds the list of all reachable nodes for Mr. X via any transport (including black ticket).
 * Excludes nodes occupied by detectives.
 * Returns array of { nodeId, transport, useBlack }.
 */
function getMrXAllMoves(state) {
  const mrx = getMrX(state)
  if (!mrx) return []

  const detPositions = new Set(getDetectivePositions(state))
  const validMoves = getValidMoves(state, mrx.id)

  const moves = validMoves
    .filter((m) => !detPositions.has(m.nodeId))
    .map((m) => ({ nodeId: m.nodeId, transport: m.transport, useBlack: false }))

  // Add black ticket moves (any adjacent node reachable via any transport)
  if (mrx.tickets.black > 0) {
    const allTransports = [TRANSPORT.TAXI, TRANSPORT.BUS, TRANSPORT.UNDERGROUND, TRANSPORT.FERRY]
    const blackTargets = new Set()
    for (const transport of allTransports) {
      for (const neighbor of getAdjacentNodes(mrx.position, transport)) {
        if (!detPositions.has(neighbor)) {
          blackTargets.add(neighbor)
        }
      }
    }
    // Add black ticket variants for nodes not already reachable via normal tickets
    const normalTargets = new Set(moves.map((m) => m.nodeId))
    for (const nodeId of blackTargets) {
      if (!normalTargets.has(nodeId)) {
        moves.push({ nodeId, transport: 'black', useBlack: true })
      }
    }
  }

  return moves
}

/**
 * Scores a move for Mr. X based on strategic factors.
 *
 * score = (min distance to nearest detective * 10)
 *       + (number of escape routes from destination * 3)
 *       + (is underground move ? 2 : 0)
 *       - (is moving toward detective cluster ? 5 : 0)
 */
function scoreMove(move, detectivePositions, clusterCenter) {
  const detPositionSet = new Set(detectivePositions)
  const minDist = minDistanceToDetectives(move.nodeId, detectivePositions)
  const escapeRoutes = countEscapeRoutes(move.nodeId, detPositionSet)
  const isUnderground = move.transport === TRANSPORT.UNDERGROUND

  let clusterPenalty = 0
  if (clusterCenter != null) {
    const distToCluster = bfsDistance(move.nodeId, clusterCenter)
    // If we're moving closer to the cluster than 3 hops, penalize
    if (distToCluster <= 2) {
      clusterPenalty = 5
    }
  }

  return (
    minDist * 10 +
    escapeRoutes * 3 +
    (isUnderground ? 2 : 0) -
    clusterPenalty
  )
}

/**
 * Determines whether Mr. X should use a black ticket for a given move.
 * Only use when:
 * - A detective is 1 move away (urgent evasion)
 * - It's a reveal turn and Mr. X wants to hide transport type
 * - Not early in the game (conserve for later)
 */
function shouldUseBlackTicket(state, move, detectivePositions) {
  const mrx = getMrX(state)
  if (!mrx || mrx.tickets.black <= 0) return false
  // Don't waste black tickets if the move already uses one
  if (move.useBlack) return false

  const minDist = minDistanceToDetectives(move.nodeId, detectivePositions)

  // Urgent evasion: a detective is 1 move away from current position
  const currentMinDist = minDistanceToDetectives(mrx.position, detectivePositions)
  if (currentMinDist <= 1) return true

  // Reveal turn: hide the transport type
  if (isRevealTurn(state.turn) && minDist <= 3) return true

  return false
}

/**
 * Determines whether Mr. X should use a double move.
 * Use when:
 * - Cornered (no single move gives distance >= 2)
 * - Turn before a reveal turn (escape the area)
 * - Significant advantage from two moves
 */
function shouldUseDoubleMove(state, bestScore, detectivePositions) {
  const mrx = getMrX(state)
  if (!mrx || mrx.tickets.double <= 0) return false

  const currentMinDist = minDistanceToDetectives(mrx.position, detectivePositions)

  // Cornered: best single move still leaves us dangerously close
  if (currentMinDist <= 1 && bestScore < 20) return true

  // Turn before a reveal turn: want to get far away
  if (isRevealTurn(state.turn + 1) && currentMinDist <= 3) return true

  return false
}

/**
 * Evaluates a double move sequence for Mr. X.
 * Simulates the first move, then finds the best second move.
 * Returns { firstMove, secondMove, totalScore }.
 */
function evaluateDoubleMove(state, firstMove, detectivePositions) {
  const mrx = getMrX(state)
  if (!mrx) return null

  // Simulate first move position
  const simulatedPosition = firstMove.nodeId
  const detPositionSet = new Set(detectivePositions)
  const clusterCenter = detectiveClusterCenter(detectivePositions)

  // Find valid moves from the simulated position
  const allTransports = [TRANSPORT.TAXI, TRANSPORT.BUS, TRANSPORT.UNDERGROUND, TRANSPORT.FERRY]
  const secondMoves = []
  for (const transport of allTransports) {
    const neighbors = getAdjacentNodes(simulatedPosition, transport)
    for (const nodeId of neighbors) {
      if (!detPositionSet.has(nodeId) && nodeId !== mrx.position) {
        // Check ticket availability after first move
        const ticketsAfterFirst = { ...mrx.tickets }
        if (firstMove.useBlack) {
          ticketsAfterFirst.black--
        } else if (firstMove.transport !== TRANSPORT.FERRY) {
          ticketsAfterFirst[firstMove.transport]--
        }

        if (transport !== TRANSPORT.FERRY && ticketsAfterFirst[transport] > 0) {
          secondMoves.push({ nodeId, transport, useBlack: false })
        } else if (transport === TRANSPORT.FERRY) {
          secondMoves.push({ nodeId, transport, useBlack: false })
        }
      }
    }
  }

  if (secondMoves.length === 0) return null

  let bestSecond = null
  let bestSecondScore = -Infinity

  for (const sm of secondMoves) {
    const score = scoreMove(sm, detectivePositions, clusterCenter)
    if (score > bestSecondScore) {
      bestSecondScore = score
      bestSecond = sm
    }
  }

  if (!bestSecond) return null

  const firstScore = scoreMove(firstMove, detectivePositions, clusterCenter)
  return {
    firstMove,
    secondMove: bestSecond,
    totalScore: firstScore + bestSecondScore,
  }
}

/**
 * Hard difficulty: look 2 moves ahead.
 * For each candidate move, simulate detectives moving optimally toward that position,
 * then evaluate whether Mr. X's position is still safe.
 */
function scoreMoveWithLookahead(move, state, detectivePositions, clusterCenter) {
  const baseScore = scoreMove(move, detectivePositions, clusterCenter)

  // Simulate: each detective moves one step closer to Mr. X's new position
  const simulatedDetPositions = detectivePositions.map((dPos) => {
    const path = findShortestPath(dPos, move.nodeId, ['taxi', 'bus', 'underground'])
    if (path && path.length > 1) {
      return path[1] // One step closer
    }
    return dPos
  })

  // After detectives move, how safe is Mr. X at the new position?
  const postMoveMinDist = minDistanceToDetectives(move.nodeId, simulatedDetPositions)

  // Score bonus/penalty based on safety after detective response
  const safetyBonus = postMoveMinDist >= 2 ? 5 : -10

  return baseScore + safetyBonus
}

/**
 * Picks a random element from an array.
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Main Mr. X AI decision function.
 * Returns { nodeId, transport, useBlack, useDouble }
 *
 * @param {Object} state - Current game state
 * @param {'easy'|'medium'|'hard'} difficulty - AI difficulty level
 */
export function getMrXMove(state, difficulty = 'medium') {
  const mrx = getMrX(state)
  if (!mrx) return null

  const detectivePositions = getDetectivePositions(state)
  const allMoves = getMrXAllMoves(state)

  if (allMoves.length === 0) return null

  // Easy difficulty: 70% random, 30% strategic
  if (difficulty === 'easy') {
    if (Math.random() < 0.7) {
      const randomMove = pickRandom(allMoves)
      return {
        nodeId: randomMove.nodeId,
        transport: randomMove.transport,
        useBlack: randomMove.useBlack,
        useDouble: false,
      }
    }
    // 30% of the time, fall through to medium strategy
  }

  const clusterCenter = detectiveClusterCenter(detectivePositions)

  // Score all moves
  let scoredMoves
  if (difficulty === 'hard') {
    scoredMoves = allMoves.map((move) => ({
      ...move,
      score: scoreMoveWithLookahead(move, state, detectivePositions, clusterCenter),
    }))
  } else {
    scoredMoves = allMoves.map((move) => ({
      ...move,
      score: scoreMove(move, detectivePositions, clusterCenter),
    }))
  }

  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score)

  const bestMove = scoredMoves[0]

  // Determine black ticket usage
  let useBlack = bestMove.useBlack
  if (!useBlack && difficulty !== 'easy') {
    useBlack = shouldUseBlackTicket(state, bestMove, detectivePositions)
  }

  // Determine double move usage
  let useDouble = false
  if (difficulty !== 'easy' && mrx.tickets.double > 0) {
    useDouble = shouldUseDoubleMove(state, bestMove.score, detectivePositions)

    // If using double move, evaluate best double-move combination
    if (useDouble) {
      let bestDoubleResult = null
      let bestDoubleTotalScore = -Infinity

      for (const move of scoredMoves.slice(0, 5)) {
        const result = evaluateDoubleMove(state, move, detectivePositions)
        if (result && result.totalScore > bestDoubleTotalScore) {
          bestDoubleTotalScore = result.totalScore
          bestDoubleResult = result
        }
      }

      // Only use double move if it significantly improves the position
      if (bestDoubleResult && bestDoubleTotalScore > bestMove.score * 1.3) {
        return {
          nodeId: bestDoubleResult.firstMove.nodeId,
          transport: bestDoubleResult.firstMove.transport,
          useBlack: bestDoubleResult.firstMove.useBlack,
          useDouble: true,
          secondMove: {
            nodeId: bestDoubleResult.secondMove.nodeId,
            transport: bestDoubleResult.secondMove.transport,
            useBlack: false,
          },
        }
      }
      useDouble = false
    }
  }

  return {
    nodeId: bestMove.nodeId,
    transport: bestMove.useBlack ? bestMove.transport : bestMove.transport,
    useBlack,
    useDouble: false,
  }
}

/**
 * Simple AI for detectives (used for disconnected players).
 * Strategy:
 * - Find last revealed Mr. X position
 * - Move toward that position using BFS
 * - If no revealed position, move toward board center (node ~100)
 *
 * @param {Object} state - Current game state
 * @param {string} detectiveId - ID of the detective to move
 * @returns {{ nodeId: number, transport: string }|null}
 */
export function getDetectiveAiMove(state, detectiveId) {
  const detective = state.players.find((p) => p.id === detectiveId)
  if (!detective || detective.isEliminated) return null

  const validMoves = getValidMoves(state, detectiveId)
  if (validMoves.length === 0) return null

  // Find last revealed Mr. X position
  const revealedHistory = state.mrxState.positionHistory.filter((h) => h.revealed)
  const targetNode =
    revealedHistory.length > 0
      ? revealedHistory[revealedHistory.length - 1].position
      : 100 // Board center approximation

  // Score each move by how much it reduces BFS distance to the target
  let bestMove = validMoves[0]
  let bestDistance = Infinity

  for (const move of validMoves) {
    const dist = bfsDistance(move.nodeId, targetNode)
    if (dist < bestDistance) {
      bestDistance = dist
      bestMove = move
    }
  }

  return {
    nodeId: bestMove.nodeId,
    transport: bestMove.transport,
  }
}
