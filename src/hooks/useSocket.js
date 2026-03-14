import { useState, useEffect, useCallback, useRef } from 'react'
import { socket } from '../multiplayer/socket.js'
import { SERVER_EVENTS } from '../multiplayer/events.js'
import useGameStore from '../store/gameStore.js'
import useUIStore from '../store/uiStore.js'

const NOOP_RETURN = {
  connected: false,
  emit: () => {},
  roomCode: null,
  playerId: null,
  roomState: null,
  error: null,
}

/**
 * Full socket lifecycle hook for multiplayer connectivity.
 *
 * Manages connection/disconnection, registers all server event listeners,
 * dispatches state updates to gameStore and uiStore, and exposes a
 * clean API for components to interact with the server.
 *
 * @param {{ enabled?: boolean }} options - Pass enabled:false to skip connecting
 * @returns {{ connected, emit, roomCode, playerId, error, roomState }}
 */
export function useSocket(options = {}) {
  const { enabled = true } = options

  const [connected, setConnected] = useState(socket.connected)
  const [roomCode, setRoomCode] = useState(null)
  const [playerId, setPlayerId] = useState(null)
  const [roomState, setRoomState] = useState(null)
  const [error, setError] = useState(null)

  const addToast = useUIStore.getState().addToast
  const showModal = useUIStore.getState().showModal

  /* Track whether the hook is mounted to avoid stale updates */
  const mountedRef = useRef(true)

  useEffect(() => {
    if (!enabled) return

    mountedRef.current = true

    /* Connect on mount */
    if (!socket.connected) {
      socket.connect()
    }

    /* ── Connection lifecycle ──────────────────────────────── */
    function onConnect() {
      if (!mountedRef.current) return
      setConnected(true)
      setError(null)
      addToast('Connected to server', 'success')
    }

    function onDisconnect() {
      if (!mountedRef.current) return
      setConnected(false)
      addToast('Connection lost', 'warning')
    }

    function onConnectError(err) {
      if (!mountedRef.current) return
      setConnected(false)
      setError(err.message || 'Connection failed')
      addToast('Failed to connect to server', 'warning')
    }

    /* ── Room events ──────────────────────────────────────── */
    function onRoomCreated(data) {
      if (!mountedRef.current) return
      setRoomCode(data.roomCode)
      setPlayerId(data.playerId)
      setRoomState(data.room)
      setError(null)
    }

    function onRoomJoined(data) {
      if (!mountedRef.current) return
      setRoomCode(data.roomCode)
      setPlayerId(data.playerId)
      setRoomState(data.room)
      setError(null)
    }

    function onRoomUpdated(data) {
      if (!mountedRef.current) return
      setRoomState(data.room)
    }

    function onRoomError(data) {
      if (!mountedRef.current) return
      const message = data?.message || 'Room error'
      setError(message)
      addToast(message, 'warning')
    }

    /* ── Game events ──────────────────────────────────────── */
    function onGameStarted(data) {
      if (!mountedRef.current) return
      const { syncFromServer, setOnlineMode } = useGameStore.getState()
      setOnlineMode(data.playerId, data.role)
      syncFromServer(data.gameState)
    }

    function onGameState(data) {
      if (!mountedRef.current) return
      const { syncFromServer } = useGameStore.getState()
      syncFromServer(data.gameState)
    }

    function onGameReveal(data) {
      if (!mountedRef.current) return
      showModal('reveal', {
        position: data.position,
        turn: data.turn,
      })
    }

    function onGameOver(data) {
      if (!mountedRef.current) return
      const { syncFromServer } = useGameStore.getState()
      if (data.gameState) {
        syncFromServer(data.gameState)
      }
      showModal('endGame', {
        winner: data.winner,
        reason: data.reason,
      })
    }

    /* ── Player events ────────────────────────────────────── */
    function onPlayerJoined(data) {
      if (!mountedRef.current) return
      setRoomState(data.room)
      addToast(`${data.playerName} joined the room`, 'info')
    }

    function onPlayerLeft(data) {
      if (!mountedRef.current) return
      setRoomState(data.room)
      addToast(`${data.playerName} left the room`, 'warning')
    }

    function onPlayerReconnected(data) {
      if (!mountedRef.current) return
      setRoomState(data.room)
      addToast(`${data.playerName} reconnected`, 'success')
    }

    /* ── Generic error ────────────────────────────────────── */
    function onError(data) {
      if (!mountedRef.current) return
      const message = data?.message || 'An error occurred'
      setError(message)
      addToast(message, 'warning')
    }

    /* ── Register all listeners ────────────────────────────── */
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    socket.on(SERVER_EVENTS.ROOM_CREATED, onRoomCreated)
    socket.on(SERVER_EVENTS.ROOM_JOINED, onRoomJoined)
    socket.on(SERVER_EVENTS.ROOM_UPDATED, onRoomUpdated)
    socket.on(SERVER_EVENTS.ROOM_ERROR, onRoomError)

    socket.on(SERVER_EVENTS.GAME_STARTED, onGameStarted)
    socket.on(SERVER_EVENTS.GAME_STATE, onGameState)
    socket.on(SERVER_EVENTS.GAME_REVEAL, onGameReveal)
    socket.on(SERVER_EVENTS.GAME_OVER, onGameOver)

    socket.on(SERVER_EVENTS.PLAYER_JOINED, onPlayerJoined)
    socket.on(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeft)
    socket.on(SERVER_EVENTS.PLAYER_RECONNECTED, onPlayerReconnected)

    socket.on(SERVER_EVENTS.ERROR, onError)

    /* If socket was already connected before mounting */
    if (socket.connected) {
      setConnected(true)
    }

    /* ── Cleanup ───────────────────────────────────────────── */
    return () => {
      mountedRef.current = false

      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)

      socket.off(SERVER_EVENTS.ROOM_CREATED, onRoomCreated)
      socket.off(SERVER_EVENTS.ROOM_JOINED, onRoomJoined)
      socket.off(SERVER_EVENTS.ROOM_UPDATED, onRoomUpdated)
      socket.off(SERVER_EVENTS.ROOM_ERROR, onRoomError)

      socket.off(SERVER_EVENTS.GAME_STARTED, onGameStarted)
      socket.off(SERVER_EVENTS.GAME_STATE, onGameState)
      socket.off(SERVER_EVENTS.GAME_REVEAL, onGameReveal)
      socket.off(SERVER_EVENTS.GAME_OVER, onGameOver)

      socket.off(SERVER_EVENTS.PLAYER_JOINED, onPlayerJoined)
      socket.off(SERVER_EVENTS.PLAYER_LEFT, onPlayerLeft)
      socket.off(SERVER_EVENTS.PLAYER_RECONNECTED, onPlayerReconnected)

      socket.off(SERVER_EVENTS.ERROR, onError)

      socket.disconnect()
    }
  }, [enabled, addToast, showModal])

  /**
   * Emit a client event to the server.
   */
  const emit = useCallback((event, data) => {
    if (!socket.connected) return
    socket.emit(event, data)
  }, [])

  if (!enabled) {
    return NOOP_RETURN
  }

  return {
    connected,
    emit,
    roomCode,
    playerId,
    roomState,
    error,
  }
}
