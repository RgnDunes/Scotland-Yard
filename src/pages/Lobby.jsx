import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../hooks/useSocket.js'
import { CLIENT_EVENTS } from '../multiplayer/events.js'
import useGameStore from '../store/gameStore.js'
import styles from './Lobby.module.css'

const ROLES = ['mrx', 'detective']
const ROLE_LABELS = { mrx: 'Mr. X', detective: 'Detective' }

/**
 * Copies text to the clipboard using the Clipboard API.
 */
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
}

/**
 * Player row within the lobby player list.
 * Shows name, assigned role, and role selection for the local player.
 */
function PlayerRow({ player, isMe, onAssignRole }) {
  return (
    <div className={`${styles.playerRow} ${isMe ? styles.playerRowMe : ''}`}>
      <div className={styles.playerInfo}>
        <span className={styles.playerName}>{player.name}</span>
        {player.isHost && <span className={styles.hostBadge}>Host</span>}
        {isMe && <span className={styles.youBadge}>You</span>}
      </div>

      <div className={styles.roleSection}>
        {isMe ? (
          <div className={styles.roleButtons}>
            {ROLES.map((role) => (
              <button
                key={role}
                className={`${styles.roleButton} ${player.role === role ? styles.roleButtonActive : ''} ${role === 'mrx' ? styles.roleButtonMrx : styles.roleButtonDet}`}
                onClick={() => onAssignRole(role)}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        ) : (
          <span
            className={`${styles.roleTag} ${player.role === 'mrx' ? styles.roleTagMrx : styles.roleTagDet}`}
          >
            {player.role ? ROLE_LABELS[player.role] : 'Choosing...'}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Waiting indicator with pulsing dots animation.
 */
function WaitingDots() {
  return (
    <span className={styles.waitingDots}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  )
}

function Lobby() {
  const navigate = useNavigate()
  const { code } = useParams()

  const { connected, emit, roomCode, playerId, roomState, error } = useSocket()
  const gameMode = useGameStore((s) => s.mode)
  const game = useGameStore((s) => s.game)

  /* ── Local UI state ──────────────────────────────────────── */
  const [view, setView] = useState(
    code && code !== 'online' ? 'joining' : 'choose',
  )
  const [joinCode, setJoinCode] = useState(
    code && code !== 'online' ? code : '',
  )
  const [playerName, setPlayerName] = useState('')
  const [copied, setCopied] = useState(false)

  /* Auto-join if navigated with a room code from URL */
  useEffect(() => {
    if (code && code !== 'online' && connected && !roomCode) {
      setView('joining')
      setJoinCode(code)
    }
  }, [code, connected, roomCode])

  /* Navigate to game when server signals game:started */
  const activeRoomCode = roomCode || null
  useEffect(() => {
    if (gameMode === 'online' && game && activeRoomCode) {
      navigate(`/game/${activeRoomCode}`)
    }
  }, [gameMode, game, activeRoomCode, navigate])

  /* ── Derived state ──────────────────────────────────────── */
  const players = roomState?.players || []
  const isHost = players.length > 0 && players[0]?.id === playerId
  const inRoom = activeRoomCode != null

  /*
   * Roles validation for starting the game:
   * - Exactly one Mr. X
   * - At least 2 detectives (3+ total players)
   * - Every player has a role assigned
   */
  const mrxCount = players.filter((p) => p.role === 'mrx').length
  const detCount = players.filter((p) => p.role === 'detective').length
  const allAssigned = players.every((p) => p.role != null)
  const canStart =
    isHost &&
    players.length >= 3 &&
    mrxCount === 1 &&
    detCount >= 2 &&
    allAssigned

  /* ── Handlers ───────────────────────────────────────────── */
  const handleBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleCreateRoom = useCallback(() => {
    if (!connected || !playerName.trim()) return
    emit(CLIENT_EVENTS.CREATE_ROOM, { playerName: playerName.trim() })
    setView('lobby')
  }, [connected, playerName, emit])

  const handleJoinRoom = useCallback(() => {
    if (!connected || !joinCode.trim() || !playerName.trim()) return
    emit(CLIENT_EVENTS.JOIN_ROOM, {
      roomCode: joinCode.trim().toUpperCase(),
      playerName: playerName.trim(),
    })
    setView('lobby')
  }, [connected, joinCode, playerName, emit])

  const handleAssignRole = useCallback(
    (role) => {
      if (!connected) return
      emit(CLIENT_EVENTS.ASSIGN_ROLE, { role })
    },
    [connected, emit],
  )

  const handleStartGame = useCallback(() => {
    if (!connected || !canStart) return
    emit(CLIENT_EVENTS.START_GAME, { roomCode: activeRoomCode })
  }, [connected, canStart, activeRoomCode, emit])

  const handleCopyCode = useCallback(() => {
    if (!activeRoomCode) return
    copyToClipboard(activeRoomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeRoomCode])

  const handleJoinCodeChange = useCallback((e) => {
    setJoinCode(e.target.value.toUpperCase())
  }, [])

  const handleNameChange = useCallback((e) => {
    setPlayerName(e.target.value)
  }, [])

  const handleChooseCreate = useCallback(() => {
    setView('create')
  }, [])

  const handleChooseJoin = useCallback(() => {
    setView('join')
  }, [])

  const handleBackToChoose = useCallback(() => {
    setView('choose')
  }, [])

  /* ── Connection status indicator ─────────────────────────── */
  const connectionIndicator = (
    <div
      className={`${styles.connectionStatus} ${connected ? styles.connectionOnline : styles.connectionOffline}`}
    >
      <span className={styles.connectionDot} />
      <span className={styles.connectionLabel}>
        {connected ? 'Connected' : 'Connecting...'}
      </span>
    </div>
  )

  /* ── Choose Create or Join ──────────────────────────────── */
  if (!inRoom && view === 'choose') {
    return (
      <div className={styles.lobbyPage}>
        {connectionIndicator}
        <motion.div
          className={styles.lobbyContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.lobbyTitle}>Online Multiplayer</h1>
          <p className={styles.lobbySubtitle}>
            Create a new room or join an existing one
          </p>

          <div className={styles.choiceCards}>
            <motion.button
              className={styles.choiceCard}
              onClick={handleChooseCreate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.choiceIcon}>+</span>
              <span className={styles.choiceBody}>
                <span className={styles.choiceTitle}>Create Room</span>
                <span className={styles.choiceDesc}>
                  Start a new game and invite friends
                </span>
              </span>
            </motion.button>

            <motion.button
              className={styles.choiceCard}
              onClick={handleChooseJoin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={styles.choiceIcon}>{'\u2192'}</span>
              <span className={styles.choiceBody}>
                <span className={styles.choiceTitle}>Join Room</span>
                <span className={styles.choiceDesc}>
                  Enter a room code to join a friend
                </span>
              </span>
            </motion.button>
          </div>

          <motion.button
            className={styles.backButton}
            onClick={handleBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  /* ── Create Room Form ───────────────────────────────────── */
  if (!inRoom && view === 'create') {
    return (
      <div className={styles.lobbyPage}>
        {connectionIndicator}
        <motion.div
          className={styles.lobbyContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.lobbyTitle}>Create Room</h1>
          <p className={styles.lobbySubtitle}>
            Enter your display name to create a room
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Name</label>
            <input
              className={styles.formInput}
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <motion.button
              className={styles.secondaryButton}
              onClick={handleBackToChoose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
            <motion.button
              className={styles.primaryButton}
              onClick={handleCreateRoom}
              disabled={!connected || !playerName.trim()}
              whileHover={
                connected && playerName.trim() ? { scale: 1.03 } : {}
              }
              whileTap={
                connected && playerName.trim() ? { scale: 0.97 } : {}
              }
            >
              Create
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Join Room Form ─────────────────────────────────────── */
  if (!inRoom && (view === 'join' || view === 'joining')) {
    return (
      <div className={styles.lobbyPage}>
        {connectionIndicator}
        <motion.div
          className={styles.lobbyContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.lobbyTitle}>Join Room</h1>
          <p className={styles.lobbySubtitle}>
            Enter the room code and your display name
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Room Code</label>
            <input
              className={styles.formInputCode}
              type="text"
              value={joinCode}
              onChange={handleJoinCodeChange}
              placeholder="ABCDEF"
              maxLength={6}
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Name</label>
            <input
              className={styles.formInput}
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <motion.button
              className={styles.secondaryButton}
              onClick={handleBackToChoose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
            <motion.button
              className={styles.primaryButton}
              onClick={handleJoinRoom}
              disabled={
                !connected || !joinCode.trim() || !playerName.trim()
              }
              whileHover={
                connected && joinCode.trim() && playerName.trim()
                  ? { scale: 1.03 }
                  : {}
              }
              whileTap={
                connected && joinCode.trim() && playerName.trim()
                  ? { scale: 0.97 }
                  : {}
              }
            >
              Join
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── In-Room Lobby ──────────────────────────────────────── */
  return (
    <div className={styles.lobbyPage}>
      {connectionIndicator}
      <motion.div
        className={styles.lobbyContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.lobbyTitle}>Game Lobby</h1>

        {/* Room Code Display */}
        <div className={styles.roomCodeSection}>
          <span className={styles.roomCodeLabel}>Room Code</span>
          <motion.button
            className={styles.roomCode}
            onClick={handleCopyCode}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            title="Click to copy"
          >
            {activeRoomCode}
          </motion.button>
          <AnimatePresence>
            {copied && (
              <motion.span
                className={styles.copiedText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Player List */}
        <div className={styles.playerList}>
          <div className={styles.playerListHeader}>
            <span className={styles.playerListTitle}>
              Players ({players.length})
            </span>
            {players.length < 3 && (
              <span className={styles.playerListHint}>
                Need {3 - players.length} more
              </span>
            )}
          </div>

          <div className={styles.playerRows}>
            {players.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                isMe={player.id === playerId}
                onAssignRole={handleAssignRole}
              />
            ))}
          </div>
        </div>

        {/* Waiting indicator */}
        {players.length < 3 && (
          <div className={styles.waitingSection}>
            <span className={styles.waitingText}>Waiting for players</span>
            <WaitingDots />
          </div>
        )}

        {/* Validation messages */}
        {players.length >= 3 && mrxCount === 0 && (
          <p className={styles.validationText}>
            One player must select Mr. X to start
          </p>
        )}
        {players.length >= 3 && mrxCount > 1 && (
          <p className={styles.validationText}>
            Only one player can be Mr. X
          </p>
        )}
        {!allAssigned && players.length >= 3 && mrxCount === 1 && (
          <p className={styles.validationText}>
            All players must select a role
          </p>
        )}

        {error && <p className={styles.errorText}>{error}</p>}

        {/* Actions */}
        <div className={styles.lobbyActions}>
          <motion.button
            className={styles.secondaryButton}
            onClick={handleBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Leave
          </motion.button>

          {isHost && (
            <motion.button
              className={styles.startButton}
              onClick={handleStartGame}
              disabled={!canStart}
              whileHover={canStart ? { scale: 1.03 } : {}}
              whileTap={canStart ? { scale: 0.97 } : {}}
            >
              Start Game
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Lobby
