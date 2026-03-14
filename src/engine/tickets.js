import { getAdjacentNodes, TRANSPORT } from './graph.js'

const ALL_TRANSPORTS = [TRANSPORT.TAXI, TRANSPORT.BUS, TRANSPORT.UNDERGROUND, TRANSPORT.FERRY]

/**
 * Returns a new tickets object with one ticket of the given transport spent.
 * Throws if the player has insufficient tickets.
 * Ferry is free — no ticket is deducted.
 */
export function spendTicket(tickets, transport) {
  if (transport === TRANSPORT.FERRY) {
    return { ...tickets }
  }

  const count = tickets[transport]
  if (count === undefined) {
    throw new Error(`Unknown transport type: ${transport}`)
  }
  if (count <= 0) {
    throw new Error(`Insufficient ${transport} tickets (have ${count})`)
  }

  return { ...tickets, [transport]: count - 1 }
}

/**
 * Returns a new tickets object for Mr. X after receiving a spent detective ticket.
 * Ferry tickets are free and never transferred.
 */
export function receiveTicket(mrxTickets, transport) {
  if (transport === TRANSPORT.FERRY) {
    return { ...mrxTickets }
  }

  return { ...mrxTickets, [transport]: (mrxTickets[transport] || 0) + 1 }
}

/**
 * Returns the count of a specific ticket type for a player.
 */
export function getTicketCount(player, transport) {
  return player.tickets[transport] ?? 0
}

/**
 * Checks if a player has any valid move available.
 * A player is stuck if no adjacent node is reachable via any transport
 * they hold tickets for (considering occupied nodes for detectives).
 */
export function hasAnyValidMove(state, playerId) {
  const player = state.players.find((p) => p.id === playerId)
  if (!player || player.isEliminated) return false

  const position = player.position
  const isMrX = player.role === 'mrx'

  // Collect positions occupied by detectives (for blocking checks)
  const detectivePositions = new Set(
    state.players
      .filter((p) => p.role === 'detective' && !p.isEliminated)
      .map((p) => p.position),
  )

  for (const transport of ALL_TRANSPORTS) {
    const neighbors = getAdjacentNodes(position, transport)
    for (const neighbor of neighbors) {
      // Detectives cannot move to nodes occupied by other detectives
      if (!isMrX && detectivePositions.has(neighbor) && neighbor !== player.position) {
        continue
      }

      // Check ticket availability
      if (transport === TRANSPORT.FERRY) {
        // Ferry is free for everyone
        return true
      }

      if (player.tickets[transport] > 0) {
        return true
      }

      // Mr. X can use a black ticket for any transport
      if (isMrX && player.tickets.black > 0) {
        return true
      }
    }
  }

  return false
}
