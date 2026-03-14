import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useGameStore from '../store/gameStore.js'
import useUIStore from '../store/uiStore.js'
import MapBoard from '../components/Map/MapBoard.jsx'
import TurnBanner from '../components/HUD/TurnBanner.jsx'
import RevealCountdown from '../components/HUD/RevealCountdown.jsx'
import Toast from '../components/HUD/Toast.jsx'
import DetectivePanel from '../components/Panels/DetectivePanel.jsx'
import MrXPanel from '../components/Panels/MrXPanel.jsx'
import TicketHand from '../components/Tickets/TicketHand.jsx'
import MrXLog from '../components/MrXLog/MrXLog.jsx'
import TicketSelectModal from '../components/Modals/TicketSelectModal.jsx'
import PassDeviceModal from '../components/Modals/PassDeviceModal.jsx'
import RevealModal from '../components/Modals/RevealModal.jsx'
import EndScreen from '../components/EndScreen/EndScreen.jsx'
import styles from './Game.module.css'

const SIDEBAR_TAB_PLAYERS = 'players'
const SIDEBAR_TAB_LOG = 'log'

/**
 * Main game page that orchestrates the full local hot-seat game loop.
 *
 * Turn flow:
 * 1. Show PassDeviceModal for current player
 * 2. Player dismisses modal -> set them as current local player
 * 3. Show map with valid moves highlighted
 * 4. Player clicks a valid node:
 *    - Multiple transports -> show TicketSelectModal
 *    - Single transport -> make move directly
 * 5. After move: check win, if reveal turn show RevealModal, advance turn
 * 6. Game over -> show EndScreen
 */
function Game() {
  const navigate = useNavigate()

  /* ── Store selectors ──────────────────────────────────────── */
  const game = useGameStore((s) => s.game)
  const mode = useGameStore((s) => s.mode)
  const myRole = useGameStore((s) => s.myRole)
  const validMoves = useGameStore((s) => s.validMoves)
  const blackTicketMoves = useGameStore((s) => s.blackTicketMoves)
  const makeMove = useGameStore((s) => s.makeMove)
  const storeUseBlackTicket = useGameStore((s) => s.useBlackTicket)
  const storeUseDoubleMove = useGameStore((s) => s.useDoubleMove)
  const passTurn = useGameStore((s) => s.passTurn)
  const setCurrentLocalPlayer = useGameStore((s) => s.setCurrentLocalPlayer)
  const getCurrentTurnPlayer = useGameStore((s) => s.getCurrentTurnPlayer)

  const showModal = useUIStore((s) => s.showModal)
  const addToast = useUIStore((s) => s.addToast)
  const setHighlightedNodes = useUIStore((s) => s.setHighlightedNodes)

  /* ── Local state ──────────────────────────────────────────── */
  const [sidebarTab, setSidebarTab] = useState(SIDEBAR_TAB_PLAYERS)
  const [blackTicketMode, setBlackTicketMode] = useState(false)
  const [awaitingPassDevice, setAwaitingPassDevice] = useState(true)
  const [pendingReveal, setPendingReveal] = useState(false)

  /* Track previous turn/player to detect changes */
  const prevTurnKeyRef = useRef(null)
  /* Track which reveal entries we have already shown */
  const shownRevealsRef = useRef(0)

  const hasGame = game != null && mode === 'local'
  const currentPlayer = hasGame ? getCurrentTurnPlayer() : null
  const isFinished = game?.phase === 'finished'
  const isMrXTurn = currentPlayer?.role === 'mrx'

  const mrx = game?.players.find((p) => p.role === 'mrx')
  const hasDoubleTicket = (mrx?.tickets.double ?? 0) > 0
  const hasBlackTicket = (mrx?.tickets.black ?? 0) > 0
  const isDoubleMoveActive = game?.mrxState?.isDoubleMoveActive || false

  const turnKey = hasGame
    ? `${game.turn}-${game.currentPlayerIndex}`
    : null

  /* ── Turn change detection ────────────────────────────────── */
  useEffect(() => {
    if (!hasGame || isFinished || turnKey == null) return

    if (prevTurnKeyRef.current !== turnKey) {
      prevTurnKeyRef.current = turnKey
      setBlackTicketMode(false)

      /* Check if a new reveal entry appeared in Mr. X's history */
      const mrxHistory = game.mrxState.positionHistory
      const revealedEntries = mrxHistory.filter((h) => h.revealed)

      if (revealedEntries.length > shownRevealsRef.current) {
        const latestReveal = revealedEntries[revealedEntries.length - 1]
        shownRevealsRef.current = revealedEntries.length
        setPendingReveal(true)
        showModal('reveal', {
          position: latestReveal.position,
          turn: latestReveal.turn,
        })
        return
      }

      /* No reveal pending - show pass device modal directly */
      showPassDevice()
    }
  }, [turnKey, hasGame, isFinished])

  /* When reveal modal is dismissed, show pass device modal */
  useEffect(() => {
    if (!pendingReveal) return

    const checkInterval = setInterval(() => {
      const activeModal = useUIStore.getState().activeModal
      if (activeModal !== 'reveal') {
        clearInterval(checkInterval)
        setPendingReveal(false)
        showPassDevice()
      }
    }, 200)

    return () => clearInterval(checkInterval)
  }, [pendingReveal])

  /* ── Highlight valid moves when player is set ──────────── */
  useEffect(() => {
    if (!hasGame) return

    if (blackTicketMode && blackTicketMoves.length > 0) {
      setHighlightedNodes(blackTicketMoves)
    } else if (validMoves.length > 0) {
      setHighlightedNodes(validMoves.map((m) => m.nodeId))
    } else {
      setHighlightedNodes([])
    }
  }, [validMoves, blackTicketMoves, blackTicketMode, setHighlightedNodes, hasGame])

  /* Clean up highlights on unmount */
  useEffect(() => {
    return () => setHighlightedNodes([])
  }, [setHighlightedNodes])

  /* ── Pass device flow ─────────────────────────────────────── */
  function showPassDevice() {
    const state = useGameStore.getState()
    const g = state.game
    if (!g || g.phase === 'finished') return

    const player = g.players[g.currentPlayerIndex]
    if (!player) return

    setAwaitingPassDevice(true)
    showModal('passDevice', {
      playerName: player.name,
      onReady: () => {
        setCurrentLocalPlayer(player.id)
        setAwaitingPassDevice(false)

        /* After setting the player, check if they have valid moves */
        setTimeout(() => {
          const updated = useGameStore.getState()
          if (
            updated.validMoves.length === 0 &&
            updated.blackTicketMoves.length === 0
          ) {
            addToast(
              `${player.name} has no valid moves and must pass.`,
              'warning',
            )
          }
        }, 0)
      },
    })
  }

  /* ── Node click handler (intercepts MapBoard clicks) ──────── */
  const handleNodeClick = useCallback(
    (nodeId) => {
      if (!hasGame || isFinished || awaitingPassDevice) return
      if (!currentPlayer) return

      /* Black ticket mode for Mr. X */
      if (blackTicketMode && isMrXTurn) {
        if (blackTicketMoves.includes(nodeId)) {
          storeUseBlackTicket(nodeId)
          setBlackTicketMode(false)
          addToast('Mr. X used a Black Ticket', 'info')
        }
        return
      }

      /* Find all valid transports for this destination */
      const movesForNode = validMoves.filter((m) => m.nodeId === nodeId)
      if (movesForNode.length === 0) return

      if (movesForNode.length === 1) {
        makeMove(nodeId, movesForNode[0].transport)
        addToast(
          `${currentPlayer.name} moved to station ${nodeId}`,
          'success',
        )
      } else {
        showModal('ticketSelect', {
          nodeId,
          availableTransports: movesForNode.map((m) => m.transport),
          onSelect: (transport) => {
            makeMove(nodeId, transport)
            addToast(
              `${currentPlayer.name} moved to station ${nodeId}`,
              'success',
            )
          },
        })
      }
    },
    [
      hasGame,
      isFinished,
      awaitingPassDevice,
      currentPlayer,
      blackTicketMode,
      isMrXTurn,
      blackTicketMoves,
      validMoves,
      makeMove,
      storeUseBlackTicket,
      showModal,
      addToast,
    ],
  )

  /* ── Mr. X: Double Move ───────────────────────────────────── */
  const handleDoubleMove = useCallback(() => {
    if (!isMrXTurn || !hasDoubleTicket) return
    storeUseDoubleMove()
    addToast('Mr. X activated Double Move!', 'warning')
  }, [isMrXTurn, hasDoubleTicket, storeUseDoubleMove, addToast])

  /* ── Mr. X: Toggle Black Ticket Mode ──────────────────────── */
  const handleToggleBlackTicket = useCallback(() => {
    setBlackTicketMode((prev) => !prev)
  }, [])

  /* ── Skip turn (no valid moves) ───────────────────────────── */
  const handleSkipTurn = useCallback(() => {
    if (!currentPlayer) return
    addToast(`${currentPlayer.name} passed (no valid moves).`, 'warning')
    passTurn()
  }, [currentPlayer, addToast, passTurn])

  /* ── Check if current player has no valid moves ───────────── */
  const hasNoMoves =
    hasGame &&
    !awaitingPassDevice &&
    validMoves.length === 0 &&
    blackTicketMoves.length === 0 &&
    !isFinished

  /* ── Sidebar tab handlers ─────────────────────────────────── */
  const handleTabPlayers = useCallback(() => {
    setSidebarTab(SIDEBAR_TAB_PLAYERS)
  }, [])

  const handleTabLog = useCallback(() => {
    setSidebarTab(SIDEBAR_TAB_LOG)
  }, [])

  /* ── No game: show empty state ────────────────────────────── */
  if (!hasGame) {
    return (
      <div className={styles.emptyState}>
        <h1 className={styles.emptyStateTitle}>No Game in Progress</h1>
        <p className={styles.emptyStateText}>
          Set up a local game to start playing.
        </p>
        <motion.button
          className={styles.emptyStateButton}
          onClick={() => navigate('/setup')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Go to Setup
        </motion.button>
      </div>
    )
  }

  return (
    <div className={styles.gamePage}>
      {/* ── Header ──────────────────────────────────────────── */}
      <header className={styles.gameHeader}>
        <div className={styles.gameHeaderLeft}>
          <TurnBanner />
        </div>
        <div className={styles.gameHeaderRight}>
          <RevealCountdown />
          {isDoubleMoveActive && (
            <span className={styles.doubleMoveIndicator}>
              Double Move Active
            </span>
          )}
        </div>
      </header>

      {/* ── Map ─────────────────────────────────────────────── */}
      <div className={styles.gameMap}>
        <MapBoard onNodeClick={handleNodeClick} />
      </div>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={styles.gameSidebar}>
        <div className={styles.sidebarTabs}>
          <button
            className={`${styles.sidebarTab} ${sidebarTab === SIDEBAR_TAB_PLAYERS ? styles.sidebarTabActive : ''}`}
            onClick={handleTabPlayers}
          >
            Players
          </button>
          <button
            className={`${styles.sidebarTab} ${sidebarTab === SIDEBAR_TAB_LOG ? styles.sidebarTabActive : ''}`}
            onClick={handleTabLog}
          >
            Mr. X Log
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {sidebarTab === SIDEBAR_TAB_PLAYERS && (
            <>
              {myRole === 'mrx' ? <MrXPanel /> : null}
              <DetectivePanel />
            </>
          )}
          {sidebarTab === SIDEBAR_TAB_LOG && <MrXLog />}
        </div>
      </aside>

      {/* ── Bottom Bar ──────────────────────────────────────── */}
      <div className={styles.gameBottom}>
        {currentPlayer && !awaitingPassDevice && (
          <>
            <span className={styles.gameBottomLabel}>
              {currentPlayer.name}
            </span>
            <div className={styles.gameBottomTickets}>
              <TicketHand playerId={currentPlayer.id} />
            </div>

            {/* Mr. X special actions */}
            {isMrXTurn && (
              <>
                <motion.button
                  className={styles.doubleMoveButton}
                  onClick={handleDoubleMove}
                  disabled={!hasDoubleTicket || isDoubleMoveActive}
                  whileHover={
                    hasDoubleTicket && !isDoubleMoveActive
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    hasDoubleTicket && !isDoubleMoveActive
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  Double Move ({mrx?.tickets.double ?? 0})
                </motion.button>

                <motion.button
                  className={`${styles.blackTicketToggle} ${blackTicketMode ? styles.blackTicketToggleActive : ''}`}
                  onClick={handleToggleBlackTicket}
                  disabled={!hasBlackTicket}
                  whileHover={hasBlackTicket ? { scale: 1.05 } : {}}
                  whileTap={hasBlackTicket ? { scale: 0.95 } : {}}
                >
                  Black Ticket ({mrx?.tickets.black ?? 0})
                </motion.button>
              </>
            )}
          </>
        )}
      </div>

      {/* ── No Valid Moves Bar ───────────────────────────────── */}
      {hasNoMoves && (
        <div className={styles.noMovesBar}>
          <span className={styles.noMovesText}>
            {currentPlayer?.name} has no valid moves.
          </span>
          <motion.button
            className={styles.noMovesSkipButton}
            onClick={handleSkipTurn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip Turn
          </motion.button>
        </div>
      )}

      {/* ── Modals & Overlays ───────────────────────────────── */}
      <Toast />
      <TicketSelectModal />
      <PassDeviceModal />
      <RevealModal />
      <EndScreen />
    </div>
  )
}

export default Game
