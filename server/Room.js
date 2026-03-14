import { createPlayer, createInitialState, advanceTurn, getCurrentPlayer, isRevealTurn } from '../src/engine/gameState.js'
import { applyMove, applyBlackTicketMove, applyDoubleMove } from '../src/engine/movement.js'
import { checkWinCondition } from '../src/engine/winCondition.js'
import { hasAnyValidMove } from '../src/engine/tickets.js'
import { DETECTIVE_STARTING_POSITIONS } from '../src/engine/locations.js'
import { SERVER_EVENTS } from './events.js'

const MRX_STARTING_POSITIONS = [35, 45, 51, 71, 78, 104, 106, 127, 132, 146, 166, 170, 172]

const DISCONNECT_TIMEOUT_MS = 60_000
const ROOM_CLEANUP_MS = 10 * 60_000
const MAX_PLAYERS = 6
const MIN_PLAYERS = 3

/**
 * Generates a unique player ID (prefixed for readability).
 */
function generatePlayerId() {
  return 'p_' + Math.random().toString(36).slice(2, 10)
}

/**
 * Picks a random element from an array and removes it (mutates the array).
 */
function pickRandom(arr) {
  const idx = Math.floor(Math.random() * arr.length)
  return arr.splice(idx, 1)[0]
}

/**
 * Room manages a single game session: lobby, game state, player connections,
 * reconnection timers, and cleanup scheduling.
 */
export default class Room {
  constructor(code) {
    this.code = code
    this.players = new Map()
    this.gameState = null
    this.status = 'waiting'
    this.createdAt = Date.now()
    this.hostId = null

    // socketId -> playerId mapping for fast lookup on disconnect
    this.socketToPlayer = new Map()

    // playerId -> disconnect timer
    this.disconnectTimers = new Map()

    // Cleanup timer for room removal
    this.cleanupTimer = null
  }

  /**
   * Adds a player to the room lobby.
   * Returns the created player info or null if the room is full/in-game.
   */
  addPlayer(socketId, playerName, isHost = false) {
    if (this.status !== 'waiting') {
      return { error: 'Game already in progress' }
    }
    if (this.players.size >= MAX_PLAYERS) {
      return { error: 'Room is full (max 6 players)' }
    }

    const playerId = generatePlayerId()
    const playerInfo = {
      id: playerId,
      name: playerName,
      socketId,
      role: null,
      connected: true,
    }

    if (isHost) {
      this.hostId = playerId
    }

    this.players.set(playerId, playerInfo)
    this.socketToPlayer.set(socketId, playerId)

    return { playerId, playerInfo }
  }

  /**
   * Assigns a role to a player in the lobby.
   * Roles: 'mrx' or 'detective'.
   * Only one player can be Mr. X.
   */
  assignRole(playerId, role) {
    if (this.status !== 'waiting') {
      return { error: 'Cannot assign roles after game has started' }
    }

    const player = this.players.get(playerId)
    if (!player) {
      return { error: 'Player not found' }
    }

    if (role !== 'mrx' && role !== 'detective') {
      return { error: 'Invalid role. Must be "mrx" or "detective"' }
    }

    if (role === 'mrx') {
      // Check if someone else is already Mr. X
      for (const [id, p] of this.players) {
        if (p.role === 'mrx' && id !== playerId) {
          return { error: 'Another player is already Mr. X' }
        }
      }
    }

    player.role = role
    return { success: true }
  }

  /**
   * Reconnects a previously disconnected player with a new socket.
   */
  reconnectPlayer(newSocketId, playerId) {
    const player = this.players.get(playerId)
    if (!player) {
      return { error: 'Player not found in this room' }
    }

    // Clear the disconnect timer
    const timer = this.disconnectTimers.get(playerId)
    if (timer) {
      clearTimeout(timer)
      this.disconnectTimers.delete(playerId)
    }

    // Remove old socket mapping
    for (const [sid, pid] of this.socketToPlayer) {
      if (pid === playerId) {
        this.socketToPlayer.delete(sid)
        break
      }
    }

    // Update with new socket
    player.socketId = newSocketId
    player.connected = true
    this.socketToPlayer.set(newSocketId, playerId)

    return { success: true, playerName: player.name }
  }

  /**
   * Handles a player disconnecting. Starts the grace period timer.
   * Returns the playerId and playerName of the disconnected player, or null.
   */
  disconnectPlayer(socketId) {
    const playerId = this.socketToPlayer.get(socketId)
    if (!playerId) return null

    const player = this.players.get(playerId)
    if (!player) return null

    player.connected = false
    this.socketToPlayer.delete(socketId)

    return { playerId, playerName: player.name }
  }

  /**
   * Starts the disconnect grace timer for a player.
   * After DISCONNECT_TIMEOUT_MS, marks the player as permanently disconnected.
   */
  startDisconnectTimer(playerId, onTimeout) {
    // Clear any existing timer
    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId))
    }

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(playerId)
      const player = this.players.get(playerId)
      if (player) {
        player.connected = false
      }
      if (onTimeout) onTimeout(playerId)
    }, DISCONNECT_TIMEOUT_MS)

    this.disconnectTimers.set(playerId, timer)
  }

  /**
   * Validates lobby state and starts the game.
   * Requires: at least MIN_PLAYERS, exactly 1 Mr. X, all roles assigned.
   * Assigns random starting positions to all players.
   */
  startGame() {
    if (this.status !== 'waiting') {
      return { error: 'Game already started' }
    }

    const playerList = [...this.players.values()]

    if (playerList.length < MIN_PLAYERS) {
      return { error: `Need at least ${MIN_PLAYERS} players to start (have ${playerList.length})` }
    }

    // Verify all players have roles assigned
    const unassigned = playerList.filter((p) => !p.role)
    if (unassigned.length > 0) {
      return { error: `${unassigned.length} player(s) have not selected a role` }
    }

    // Verify exactly one Mr. X
    const mrxPlayers = playerList.filter((p) => p.role === 'mrx')
    if (mrxPlayers.length !== 1) {
      return { error: 'Exactly one player must be Mr. X' }
    }

    // Verify at least one detective
    const detectives = playerList.filter((p) => p.role === 'detective')
    if (detectives.length < 1) {
      return { error: 'At least one detective is required' }
    }

    // Assign starting positions
    const availableDetectiveStarts = [...DETECTIVE_STARTING_POSITIONS]
    const mrxStart = pickRandom([...MRX_STARTING_POSITIONS])

    // Build game players array: Mr. X first, then detectives
    const mrxPlayer = createPlayer(mrxPlayers[0].id, mrxPlayers[0].name, 'mrx', null)
    const gamePlayers = [mrxPlayer]

    detectives.forEach((d, i) => {
      const startPos = pickRandom(availableDetectiveStarts)
      const detective = createPlayer(d.id, d.name, 'detective', i + 1)
      detective.position = startPos
      gamePlayers.push(detective)
    })

    this.gameState = createInitialState(gamePlayers, mrxStart)
    this.status = 'playing'

    return { success: true }
  }

  /**
   * Handles a standard move (taxi, bus, underground, ferry).
   * Returns { success, reveal, gameOver } or { error }.
   */
  handleMove(playerId, nodeId, transport) {
    if (this.status !== 'playing' || !this.gameState) {
      return { error: 'Game is not in progress' }
    }

    const currentPlayer = getCurrentPlayer(this.gameState)
    if (currentPlayer.id !== playerId) {
      return { error: 'It is not your turn' }
    }

    try {
      const prevTurn = this.gameState.turn
      this.gameState = applyMove(this.gameState, playerId, nodeId, transport)

      const result = { success: true, reveal: null, gameOver: null }

      // Check if this was a reveal turn for Mr. X
      if (currentPlayer.role === 'mrx' && isRevealTurn(prevTurn)) {
        result.reveal = { position: nodeId, turn: prevTurn }
      }

      // Check win condition
      const winCheck = checkWinCondition(this.gameState)
      if (winCheck.winner) {
        this.gameState = {
          ...this.gameState,
          phase: 'finished',
          winner: winCheck.winner,
          winReason: winCheck.reason,
        }
        result.gameOver = {
          winner: winCheck.winner,
          reason: winCheck.reason,
          mrxHistory: this.gameState.mrxState.positionHistory,
        }
        this.status = 'finished'
      } else {
        // Check if the next player is stuck (skip them)
        this._skipStuckPlayers()
      }

      return result
    } catch (err) {
      return { error: err.message }
    }
  }

  /**
   * Handles Mr. X using a black ticket.
   */
  handleBlackTicketMove(playerId, nodeId) {
    if (this.status !== 'playing' || !this.gameState) {
      return { error: 'Game is not in progress' }
    }

    const currentPlayer = getCurrentPlayer(this.gameState)
    if (currentPlayer.id !== playerId) {
      return { error: 'It is not your turn' }
    }
    if (currentPlayer.role !== 'mrx') {
      return { error: 'Only Mr. X can use black tickets' }
    }

    try {
      const prevTurn = this.gameState.turn
      this.gameState = applyBlackTicketMove(this.gameState, nodeId)

      const result = { success: true, reveal: null, gameOver: null }

      if (isRevealTurn(prevTurn)) {
        result.reveal = { position: nodeId, turn: prevTurn }
      }

      const winCheck = checkWinCondition(this.gameState)
      if (winCheck.winner) {
        this.gameState = {
          ...this.gameState,
          phase: 'finished',
          winner: winCheck.winner,
          winReason: winCheck.reason,
        }
        result.gameOver = {
          winner: winCheck.winner,
          reason: winCheck.reason,
          mrxHistory: this.gameState.mrxState.positionHistory,
        }
        this.status = 'finished'
      } else {
        this._skipStuckPlayers()
      }

      return result
    } catch (err) {
      return { error: err.message }
    }
  }

  /**
   * Handles Mr. X activating a double move.
   * This does not end the turn -- Mr. X must still make two moves afterward.
   */
  handleDoubleMove(playerId) {
    if (this.status !== 'playing' || !this.gameState) {
      return { error: 'Game is not in progress' }
    }

    const currentPlayer = getCurrentPlayer(this.gameState)
    if (currentPlayer.id !== playerId) {
      return { error: 'It is not your turn' }
    }
    if (currentPlayer.role !== 'mrx') {
      return { error: 'Only Mr. X can use double move' }
    }

    try {
      this.gameState = applyDoubleMove(this.gameState)
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  /**
   * Handles a player passing their turn.
   * Only allowed when the player has no valid moves.
   */
  handlePassTurn(playerId) {
    if (this.status !== 'playing' || !this.gameState) {
      return { error: 'Game is not in progress' }
    }

    const currentPlayer = getCurrentPlayer(this.gameState)
    if (currentPlayer.id !== playerId) {
      return { error: 'It is not your turn' }
    }

    // Only allow passing if the player genuinely has no moves
    if (hasAnyValidMove(this.gameState, playerId)) {
      return { error: 'You have valid moves available and cannot pass' }
    }

    // Mark the player as eliminated (stuck) and advance the turn
    const playerIndex = this.gameState.players.findIndex((p) => p.id === playerId)
    const newPlayers = this.gameState.players.map((p, i) => {
      if (i === playerIndex) return { ...p, isEliminated: true }
      return p
    })

    this.gameState = advanceTurn({ ...this.gameState, players: newPlayers })

    const result = { success: true, gameOver: null }

    // Re-check win conditions after elimination
    const winCheck = checkWinCondition(this.gameState)
    if (winCheck.winner) {
      this.gameState = {
        ...this.gameState,
        phase: 'finished',
        winner: winCheck.winner,
        winReason: winCheck.reason,
      }
      result.gameOver = {
        winner: winCheck.winner,
        reason: winCheck.reason,
        mrxHistory: this.gameState.mrxState.positionHistory,
      }
      this.status = 'finished'
    }

    return result
  }

  /**
   * CRITICAL SECURITY: Returns game state filtered for a specific player.
   * - Detectives: Mr. X position is null, positionHistory only shows revealed entries
   * - Mr. X: receives full state
   */
  getStateForPlayer(playerId) {
    if (!this.gameState) return null

    const player = this.players.get(playerId)
    if (!player) return null

    const isMrX = player.role === 'mrx'

    if (isMrX) {
      // Mr. X gets the full, unfiltered state
      return { ...this.gameState }
    }

    // Detective view: hide Mr. X's current position and non-revealed history
    const filteredPlayers = this.gameState.players.map((p) => {
      if (p.role === 'mrx') {
        return { ...p, position: null }
      }
      return { ...p }
    })

    const filteredPositionHistory = this.gameState.mrxState.positionHistory.filter(
      (entry) => entry.revealed,
    )

    return {
      ...this.gameState,
      players: filteredPlayers,
      mrxState: {
        ...this.gameState.mrxState,
        positionHistory: filteredPositionHistory,
      },
    }
  }

  /**
   * Returns a summary of the room suitable for lobby display.
   */
  getRoomState() {
    const playerList = []
    for (const [, p] of this.players) {
      playerList.push({
        id: p.id,
        name: p.name,
        role: p.role,
        connected: p.connected,
        isHost: p.id === this.hostId,
      })
    }
    return {
      code: this.code,
      status: this.status,
      players: playerList,
      hostId: this.hostId,
    }
  }

  /**
   * Broadcasts an event to all connected players in the room via Socket.IO.
   */
  broadcast(io, event, data) {
    for (const [, player] of this.players) {
      if (player.connected && player.socketId) {
        io.to(player.socketId).emit(event, data)
      }
    }
  }

  /**
   * Sends an event to a specific player by playerId.
   */
  sendToPlayer(io, playerId, event, data) {
    const player = this.players.get(playerId)
    if (player && player.connected && player.socketId) {
      io.to(player.socketId).emit(event, data)
    }
  }

  /**
   * Sends filtered game state to each player individually.
   */
  broadcastGameState(io) {
    for (const [playerId] of this.players) {
      const filteredState = this.getStateForPlayer(playerId)
      if (filteredState) {
        this.sendToPlayer(io, playerId, SERVER_EVENTS.GAME_STATE, { gameState: filteredState })
      }
    }
  }

  /**
   * Schedules room cleanup after a delay. Used when game finishes or all disconnect.
   */
  scheduleCleanup(onCleanup) {
    if (this.cleanupTimer) return // Already scheduled

    this.cleanupTimer = setTimeout(() => {
      this.cleanup()
      if (onCleanup) onCleanup(this.code)
    }, ROOM_CLEANUP_MS)
  }

  /**
   * Cancels any pending cleanup timer.
   */
  cancelCleanup() {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Cleans up all timers and resources for this room.
   */
  cleanup() {
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer)
    }
    this.disconnectTimers.clear()

    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Checks if all players are disconnected.
   */
  allDisconnected() {
    for (const [, player] of this.players) {
      if (player.connected) return false
    }
    return this.players.size > 0
  }

  /**
   * Skips players who have no valid moves (auto-eliminates stuck detectives).
   * Called after each successful move to keep the game flowing.
   */
  _skipStuckPlayers() {
    if (!this.gameState || this.gameState.phase === 'finished') return

    let iterations = 0
    const maxIterations = this.gameState.players.length

    while (iterations < maxIterations) {
      const current = getCurrentPlayer(this.gameState)
      if (!current || current.isEliminated) {
        this.gameState = advanceTurn(this.gameState)
        iterations++
        continue
      }

      // If current player is a detective with no valid moves, eliminate and advance
      if (current.role === 'detective' && !hasAnyValidMove(this.gameState, current.id)) {
        const playerIndex = this.gameState.players.findIndex((p) => p.id === current.id)
        const newPlayers = this.gameState.players.map((p, i) => {
          if (i === playerIndex) return { ...p, isEliminated: true }
          return p
        })
        this.gameState = advanceTurn({ ...this.gameState, players: newPlayers })
        iterations++
        continue
      }

      break
    }
  }
}
