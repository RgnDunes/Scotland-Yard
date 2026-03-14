import { getAdjacentNodes, TRANSPORT } from './graph.js'
import { isRevealTurn, advanceTurn } from './gameState.js'
import { spendTicket, receiveTicket } from './tickets.js'

const ALL_TRANSPORTS = [TRANSPORT.TAXI, TRANSPORT.BUS, TRANSPORT.UNDERGROUND, TRANSPORT.FERRY]

/**
 * Returns the set of positions occupied by non-eliminated detectives.
 */
function getDetectivePositions(state) {
  return new Set(
    state.players
      .filter((p) => p.role === 'detective' && !p.isEliminated)
      .map((p) => p.position),
  )
}

/**
 * Finds a player by ID in the state.
 */
function findPlayer(state, playerId) {
  return state.players.find((p) => p.id === playerId) ?? null
}

/**
 * Returns all valid moves for a player.
 * Each move is { nodeId, transport }.
 * For Mr. X, black ticket moves are NOT included here (use applyBlackTicketMove separately).
 */
export function getValidMoves(state, playerId) {
  const player = findPlayer(state, playerId)
  if (!player || player.isEliminated) return []

  const isMrX = player.role === 'mrx'
  const detectivePositions = getDetectivePositions(state)
  const moves = []

  for (const transport of ALL_TRANSPORTS) {
    const neighbors = getAdjacentNodes(player.position, transport)

    for (const nodeId of neighbors) {
      // Detectives cannot move onto other detectives
      if (!isMrX && detectivePositions.has(nodeId)) {
        continue
      }

      // Check ticket availability (ferry is free)
      if (transport !== TRANSPORT.FERRY && player.tickets[transport] <= 0) {
        continue
      }

      moves.push({ nodeId, transport })
    }
  }

  return moves
}

/**
 * Validates whether a specific move is legal.
 * Returns { valid: boolean, reason: string|null }.
 */
export function canMoveTo(state, playerId, nodeId, transport) {
  const player = findPlayer(state, playerId)
  if (!player) {
    return { valid: false, reason: 'Player not found' }
  }
  if (player.isEliminated) {
    return { valid: false, reason: 'Player is eliminated' }
  }

  // Verify the transport route exists between current position and target
  const neighbors = getAdjacentNodes(player.position, transport)
  if (!neighbors.includes(nodeId)) {
    return {
      valid: false,
      reason: `No ${transport} route from ${player.position} to ${nodeId}`,
    }
  }

  // Check ticket availability (ferry is free)
  if (transport !== TRANSPORT.FERRY && player.tickets[transport] <= 0) {
    return { valid: false, reason: `No ${transport} tickets remaining` }
  }

  // Detectives cannot land on other detectives
  if (player.role === 'detective') {
    const detectivePositions = getDetectivePositions(state)
    if (detectivePositions.has(nodeId) && nodeId !== player.position) {
      return { valid: false, reason: 'Node occupied by another detective' }
    }
  }

  return { valid: true, reason: null }
}

/**
 * Applies a move for a player, returning the new game state.
 * Handles ticket spending, Mr. X ticket receiving, position history, and turn advancement.
 */
export function applyMove(state, playerId, nodeId, transport) {
  const validation = canMoveTo(state, playerId, nodeId, transport)
  if (!validation.valid) {
    throw new Error(`Invalid move: ${validation.reason}`)
  }

  const player = findPlayer(state, playerId)
  const playerIndex = state.players.findIndex((p) => p.id === playerId)
  const isMrX = player.role === 'mrx'

  // Spend the ticket (ferry is free, spendTicket handles this)
  const newTickets = spendTicket(player.tickets, transport)

  // Determine if Mr. X should receive this ticket (detective spent a non-ferry ticket)
  const mrxReceivesTicket = !isMrX && transport !== TRANSPORT.FERRY
  const mrxIndex = mrxReceivesTicket
    ? state.players.findIndex((p) => p.role === 'mrx')
    : -1

  // Update players immutably: move the acting player and optionally grant Mr. X the ticket
  const newPlayers = state.players.map((p, i) => {
    if (i === playerIndex) {
      return { ...p, position: nodeId, tickets: newTickets }
    }
    if (mrxReceivesTicket && i === mrxIndex) {
      return { ...p, tickets: receiveTicket(p.tickets, transport) }
    }
    return p
  })

  let newMrxState = { ...state.mrxState }
  let newTicketTracker = [...state.ticketTracker]

  // If Mr. X moved, update position history and ticket tracker
  if (isMrX) {
    const revealed = isRevealTurn(state.turn)

    newMrxState = {
      ...newMrxState,
      positionHistory: [
        ...newMrxState.positionHistory,
        {
          turn: state.turn,
          position: nodeId,
          ticketUsed: transport,
          revealed,
        },
      ],
    }

    newTicketTracker = [
      ...newTicketTracker,
      {
        turn: state.turn,
        ticket: transport,
        revealedPosition: revealed ? nodeId : null,
      },
    ]
  }

  const newState = {
    ...state,
    players: newPlayers,
    mrxState: newMrxState,
    ticketTracker: newTicketTracker,
  }

  return advanceTurn(newState)
}

/**
 * Applies a black ticket move for Mr. X.
 * Black ticket lets Mr. X use any transport type, and the tracker shows "?" for transport.
 * Returns the new state.
 */
export function applyBlackTicketMove(state, nodeId) {
  const mrx = state.players.find((p) => p.role === 'mrx')
  if (!mrx) {
    throw new Error('Mr. X not found')
  }
  if (mrx.tickets.black <= 0) {
    throw new Error('No black tickets remaining')
  }

  // Check that the node is reachable via ANY transport from current position
  let isReachable = false
  for (const transport of ALL_TRANSPORTS) {
    const neighbors = getAdjacentNodes(mrx.position, transport)
    if (neighbors.includes(nodeId)) {
      isReachable = true
      break
    }
  }
  if (!isReachable) {
    throw new Error(`Node ${nodeId} is not reachable from ${mrx.position} via any transport`)
  }

  const mrxIndex = state.players.findIndex((p) => p.role === 'mrx')
  const newTickets = { ...mrx.tickets, black: mrx.tickets.black - 1 }

  const newPlayers = state.players.map((p, i) => {
    if (i !== mrxIndex) return p
    return { ...p, position: nodeId, tickets: newTickets }
  })

  const revealed = isRevealTurn(state.turn)

  const newMrxState = {
    ...state.mrxState,
    positionHistory: [
      ...state.mrxState.positionHistory,
      {
        turn: state.turn,
        position: nodeId,
        ticketUsed: 'black',
        revealed,
      },
    ],
  }

  const newTicketTracker = [
    ...state.ticketTracker,
    {
      turn: state.turn,
      ticket: '?',
      revealedPosition: revealed ? nodeId : null,
    },
  ]

  const newState = {
    ...state,
    players: newPlayers,
    mrxState: newMrxState,
    ticketTracker: newTicketTracker,
  }

  return advanceTurn(newState)
}

/**
 * Activates a double move for Mr. X, consuming one double-move ticket.
 * Mr. X will take two consecutive moves this turn.
 * Returns the new state.
 */
export function applyDoubleMove(state) {
  const mrx = state.players.find((p) => p.role === 'mrx')
  if (!mrx) {
    throw new Error('Mr. X not found')
  }
  if (mrx.tickets.double <= 0) {
    throw new Error('No double move tickets remaining')
  }

  const mrxIndex = state.players.findIndex((p) => p.role === 'mrx')
  const newTickets = { ...mrx.tickets, double: mrx.tickets.double - 1 }

  const newPlayers = state.players.map((p, i) => {
    if (i !== mrxIndex) return p
    return { ...p, tickets: newTickets }
  })

  return {
    ...state,
    players: newPlayers,
    mrxState: {
      ...state.mrxState,
      isDoubleMoveActive: true,
      doubleMovePending: true,
    },
  }
}
