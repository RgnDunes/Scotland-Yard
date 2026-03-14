import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createGameId } from '../src/engine/gameState.js'
import Room from './Room.js'
import { CLIENT_EVENTS, SERVER_EVENTS } from './events.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

/** @type {Map<string, Room>} roomCode -> Room instance */
const rooms = new Map()

// --- HTTP Endpoints ---

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    rooms: rooms.size,
    uptime: process.uptime(),
  })
})

// --- Helpers ---

/**
 * Generates a unique room code not already in use.
 */
function generateUniqueRoomCode() {
  let code
  let attempts = 0
  do {
    code = createGameId()
    attempts++
  } while (rooms.has(code) && attempts < 100)
  return code
}

/**
 * Finds the room a socket belongs to (by iterating rooms).
 * Returns { room, playerId } or null.
 */
function findRoomBySocket(socketId) {
  for (const [, room] of rooms) {
    const playerId = room.socketToPlayer.get(socketId)
    if (playerId) {
      return { room, playerId }
    }
  }
  return null
}

/**
 * Handles a room auto-cleanup when timer fires.
 */
function handleRoomCleanup(roomCode) {
  const room = rooms.get(roomCode)
  if (room) {
    room.cleanup()
    rooms.delete(roomCode)
  }
}

// --- Socket.IO Connection Handler ---

io.on('connection', (socket) => {

  // ---- CREATE_ROOM ----
  socket.on(CLIENT_EVENTS.CREATE_ROOM, ({ playerName }) => {
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Player name is required' })
      return
    }

    const roomCode = generateUniqueRoomCode()
    const room = new Room(roomCode)
    rooms.set(roomCode, room)

    const result = room.addPlayer(socket.id, playerName.trim(), true)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      rooms.delete(roomCode)
      return
    }

    socket.join(roomCode)
    socket.emit(SERVER_EVENTS.ROOM_CREATED, {
      roomCode,
      playerId: result.playerId,
    })
  })

  // ---- JOIN_ROOM ----
  socket.on(CLIENT_EVENTS.JOIN_ROOM, ({ roomCode, playerName }) => {
    if (!roomCode || !playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Room code and player name are required' })
      return
    }

    const code = roomCode.toUpperCase().trim()
    const room = rooms.get(code)
    if (!room) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Room not found' })
      return
    }

    const result = room.addPlayer(socket.id, playerName.trim())
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    socket.join(code)

    // Notify the joining player
    socket.emit(SERVER_EVENTS.ROOM_JOINED, {
      playerId: result.playerId,
      roomState: room.getRoomState(),
    })

    // Notify everyone else in the room
    socket.to(code).emit(SERVER_EVENTS.PLAYER_JOINED, {
      playerName: playerName.trim(),
    })

    // Send updated room state to all
    room.broadcast(io, SERVER_EVENTS.ROOM_UPDATED, room.getRoomState())
  })

  // ---- ASSIGN_ROLE ----
  socket.on(CLIENT_EVENTS.ASSIGN_ROLE, ({ role }) => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found
    const result = room.assignRole(playerId, role)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    // Broadcast updated room state to all players
    room.broadcast(io, SERVER_EVENTS.ROOM_UPDATED, room.getRoomState())
  })

  // ---- START_GAME ----
  socket.on(CLIENT_EVENTS.START_GAME, () => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found

    // Only the host can start the game
    if (playerId !== room.hostId) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Only the host can start the game' })
      return
    }

    const result = room.startGame()
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    // Send filtered game state to each player individually
    for (const [pid] of room.players) {
      const filteredState = room.getStateForPlayer(pid)
      room.sendToPlayer(io, pid, SERVER_EVENTS.GAME_STARTED, { gameState: filteredState })
    }
  })

  // ---- MAKE_MOVE ----
  socket.on(CLIENT_EVENTS.MAKE_MOVE, ({ nodeId, transport }) => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found
    const result = room.handleMove(playerId, nodeId, transport)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    // If this was a reveal turn, broadcast the reveal to everyone
    if (result.reveal) {
      room.broadcast(io, SERVER_EVENTS.GAME_REVEAL, result.reveal)
    }

    // If game is over, broadcast full reveal to everyone
    if (result.gameOver) {
      room.broadcast(io, SERVER_EVENTS.GAME_OVER, result.gameOver)
      room.scheduleCleanup(handleRoomCleanup)
    }

    // Send updated filtered state to each player
    room.broadcastGameState(io)
  })

  // ---- USE_BLACK_TICKET ----
  socket.on(CLIENT_EVENTS.USE_BLACK_TICKET, ({ nodeId }) => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found
    const result = room.handleBlackTicketMove(playerId, nodeId)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    if (result.reveal) {
      room.broadcast(io, SERVER_EVENTS.GAME_REVEAL, result.reveal)
    }

    if (result.gameOver) {
      room.broadcast(io, SERVER_EVENTS.GAME_OVER, result.gameOver)
      room.scheduleCleanup(handleRoomCleanup)
    }

    room.broadcastGameState(io)
  })

  // ---- USE_DOUBLE_MOVE ----
  socket.on(CLIENT_EVENTS.USE_DOUBLE_MOVE, () => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found
    const result = room.handleDoubleMove(playerId)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    // Double move just activates -- Mr. X still needs to make their moves.
    // Send updated state so the client knows double move is active.
    room.broadcastGameState(io)
  })

  // ---- PASS_TURN ----
  socket.on(CLIENT_EVENTS.PASS_TURN, () => {
    const found = findRoomBySocket(socket.id)
    if (!found) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'You are not in a room' })
      return
    }

    const { room, playerId } = found
    const result = room.handlePassTurn(playerId)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    if (result.gameOver) {
      room.broadcast(io, SERVER_EVENTS.GAME_OVER, result.gameOver)
      room.scheduleCleanup(handleRoomCleanup)
    }

    room.broadcastGameState(io)
  })

  // ---- RECONNECT ----
  socket.on(CLIENT_EVENTS.RECONNECT, ({ roomCode, playerId }) => {
    if (!roomCode || !playerId) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Room code and player ID are required' })
      return
    }

    const code = roomCode.toUpperCase().trim()
    const room = rooms.get(code)
    if (!room) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: 'Room not found' })
      return
    }

    const result = room.reconnectPlayer(socket.id, playerId)
    if (result.error) {
      socket.emit(SERVER_EVENTS.ROOM_ERROR, { message: result.error })
      return
    }

    // Cancel room cleanup if it was scheduled
    room.cancelCleanup()

    socket.join(code)

    // Notify everyone of the reconnection
    room.broadcast(io, SERVER_EVENTS.PLAYER_RECONNECTED, {
      playerName: result.playerName,
    })

    // Send current state to the reconnected player
    if (room.status === 'playing' || room.status === 'finished') {
      const filteredState = room.getStateForPlayer(playerId)
      socket.emit(SERVER_EVENTS.GAME_STATE, { gameState: filteredState })
    } else {
      socket.emit(SERVER_EVENTS.ROOM_UPDATED, room.getRoomState())
    }
  })

  // ---- DISCONNECT ----
  socket.on('disconnect', () => {
    const found = findRoomBySocket(socket.id)
    if (!found) return

    const { room } = found
    const disconnected = room.disconnectPlayer(socket.id)
    if (!disconnected) return

    const { playerId, playerName } = disconnected

    // Broadcast the departure
    room.broadcast(io, SERVER_EVENTS.PLAYER_LEFT, { playerName })

    // If in waiting (lobby), remove the player entirely
    if (room.status === 'waiting') {
      room.players.delete(playerId)
      room.broadcast(io, SERVER_EVENTS.ROOM_UPDATED, room.getRoomState())

      // If the room is now empty, delete it
      if (room.players.size === 0) {
        room.cleanup()
        rooms.delete(room.code)
      }
      return
    }

    // If in-game, start the disconnect grace timer
    room.startDisconnectTimer(playerId, (_timedOutPlayerId) => {
      // After timeout, check if all players are disconnected
      if (room.allDisconnected()) {
        room.scheduleCleanup(handleRoomCleanup)
      }
    })

    // If all players are already disconnected, schedule cleanup
    if (room.allDisconnected()) {
      room.scheduleCleanup(handleRoomCleanup)
    }
  })
})

// --- Start Server ---

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Scotland Yard server listening on port ${PORT}`)
})
