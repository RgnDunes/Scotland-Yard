import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  createPlayer,
  createInitialState,
  getCurrentPlayer,
  advanceTurn,
  isRevealTurn,
} from '../engine/gameState.js'
import {
  getValidMoves,
  applyMove,
  applyBlackTicketMove,
  applyDoubleMove,
} from '../engine/movement.js'
import { checkWinCondition } from '../engine/winCondition.js'
import { DETECTIVE_STARTING_POSITIONS } from '../engine/locations.js'
import { getAllAdjacentNodeIds } from '../engine/graph.js'
import { getMrXMove, getDetectiveAiMove } from '../engine/mrxAi.js'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getBlackTicketMoves(state, mrx) {
  const detPositions = new Set(
    state.players
      .filter((p) => p.role === 'detective' && !p.isEliminated)
      .map((p) => p.position),
  )
  return getAllAdjacentNodeIds(mrx.position).filter(
    (n) => !detPositions.has(n),
  )
}

const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    game: null,
    mode: null,
    myPlayerId: null,
    myRole: null,
    isMyTurn: false,
    validMoves: [],
    blackTicketMoves: [],
    aiSettings: { mrxIsAi: false, mrxDifficulty: 'medium' },

    initLocalGame: (playerNames, mrxPlayerIndex, aiSettings) => {
      const players = playerNames.map((name, i) => {
        const isMrX = i === mrxPlayerIndex
        return createPlayer(
          `player-${i}`,
          name,
          isMrX ? 'mrx' : 'detective',
          isMrX ? null : i < mrxPlayerIndex ? i + 1 : i,
        )
      })

      const mrx = players.find((p) => p.role === 'mrx')
      const detectives = players.filter((p) => p.role === 'detective')

      const startPositions = shuffleArray(DETECTIVE_STARTING_POSITIONS)
      const orderedPlayers = [mrx, ...detectives].map((p, i) => {
        if (p.role === 'detective') {
          return { ...p, position: startPositions[i - 1], detectiveIndex: i }
        }
        return p
      })

      const usedPositions = new Set(
        orderedPlayers
          .filter((p) => p.role === 'detective')
          .map((p) => p.position),
      )
      const availableStarts = Array.from(
        { length: 199 },
        (_, i) => i + 1,
      ).filter((n) => !usedPositions.has(n))
      const mrxStart = pickRandom(availableStarts)

      const game = createInitialState(orderedPlayers, mrxStart)

      set({
        game,
        mode: 'local',
        myPlayerId: null,
        myRole: null,
        isMyTurn: false,
        validMoves: [],
        blackTicketMoves: [],
        aiSettings: aiSettings || { mrxIsAi: false, mrxDifficulty: 'medium' },
      })
    },

    setCurrentLocalPlayer: (playerId) => {
      const { game } = get()
      if (!game) return
      const player = game.players.find((p) => p.id === playerId)
      if (!player) return
      const moves = getValidMoves(game, playerId)
      const blackMoves =
        player.role === 'mrx' && player.tickets.black > 0
          ? getBlackTicketMoves(game, player)
          : []
      const currentPlayer = getCurrentPlayer(game)
      set({
        myPlayerId: playerId,
        myRole: player.role,
        isMyTurn: currentPlayer.id === playerId,
        validMoves: moves,
        blackTicketMoves: blackMoves,
      })
    },

    makeMove: (nodeId, transport) => {
      const { game, myPlayerId } = get()
      if (!game || !myPlayerId) return

      let newState = applyMove(game, myPlayerId, nodeId, transport)
      const winResult = checkWinCondition(newState)
      if (winResult.winner) {
        newState = {
          ...newState,
          phase: 'finished',
          winner: winResult.winner,
          winReason: winResult.reason,
        }
      }
      set({ game: newState, validMoves: [], blackTicketMoves: [] })
    },

    useBlackTicket: (nodeId) => {
      const { game } = get()
      if (!game) return

      let newState = applyBlackTicketMove(game, nodeId)
      const winResult = checkWinCondition(newState)
      if (winResult.winner) {
        newState = {
          ...newState,
          phase: 'finished',
          winner: winResult.winner,
          winReason: winResult.reason,
        }
      }
      set({ game: newState, validMoves: [], blackTicketMoves: [] })
    },

    useDoubleMove: () => {
      const { game } = get()
      if (!game) return

      const newState = applyDoubleMove(game)
      const mrx = newState.players.find((p) => p.role === 'mrx')
      const moves = getValidMoves(newState, mrx.id)
      const blackMoves =
        mrx.tickets.black > 0 ? getBlackTicketMoves(newState, mrx) : []
      set({
        game: newState,
        validMoves: moves,
        blackTicketMoves: blackMoves,
      })
    },

    passTurn: () => {
      const { game } = get()
      if (!game) return
      const newState = advanceTurn(game)
      set({ game: newState, validMoves: [], blackTicketMoves: [] })
    },

    /**
     * Sets the store into online multiplayer mode.
     * Called when the server confirms the game has started.
     */
    setOnlineMode: (playerId, role) => {
      set({
        mode: 'online',
        myPlayerId: playerId,
        myRole: role,
        isMyTurn: false,
        validMoves: [],
        blackTicketMoves: [],
      })
    },

    /**
     * Syncs the full game state received from the server.
     * In online mode, recomputes validMoves if it is this player's turn.
     */
    syncFromServer: (gameState) => {
      const { myPlayerId, mode } = get()

      if (mode === 'online' && myPlayerId && gameState) {
        const currentPlayer = getCurrentPlayer(gameState)
        const isMyTurn = currentPlayer?.id === myPlayerId

        if (isMyTurn) {
          const moves = getValidMoves(gameState, myPlayerId)
          const player = gameState.players.find((p) => p.id === myPlayerId)
          const blackMoves =
            player?.role === 'mrx' && player.tickets.black > 0
              ? getBlackTicketMoves(gameState, player)
              : []

          set({
            game: gameState,
            isMyTurn: true,
            validMoves: moves,
            blackTicketMoves: blackMoves,
          })
        } else {
          set({
            game: gameState,
            isMyTurn: false,
            validMoves: [],
            blackTicketMoves: [],
          })
        }
      } else {
        set({ game: gameState })
      }
    },

    getMrXPosition: () => {
      const { game, myRole } = get()
      if (!game) return null
      if (myRole === 'mrx') {
        return game.players.find((p) => p.role === 'mrx')?.position ?? null
      }
      return null
    },

    getPlayer: (playerId) => {
      const { game } = get()
      return game?.players.find((p) => p.id === playerId) ?? null
    },

    getDetectives: () => {
      const { game } = get()
      return game?.players.filter((p) => p.role === 'detective') ?? []
    },

    getCurrentTurnPlayer: () => {
      const { game } = get()
      if (!game) return null
      return getCurrentPlayer(game)
    },

    isRevealTurn: () => {
      const { game } = get()
      if (!game) return false
      return isRevealTurn(game.turn)
    },

    getLastRevealedPosition: () => {
      const { game } = get()
      if (!game) return null
      const revealed = game.mrxState.positionHistory.filter(
        (h) => h.revealed,
      )
      return revealed.length > 0
        ? revealed[revealed.length - 1].position
        : null
    },

    /**
     * Executes an AI turn for Mr. X.
     * Calls getMrXMove to decide the move, then applies it to game state.
     * Handles black ticket usage and double moves.
     * Returns true if a move was made, false otherwise.
     */
    executeMrXAiTurn: () => {
      const { game, aiSettings } = get()
      if (!game || game.phase === 'finished') return false

      const mrx = game.players.find((p) => p.role === 'mrx')
      if (!mrx) return false

      const currentPlayer = getCurrentPlayer(game)
      if (currentPlayer.role !== 'mrx') return false

      const decision = getMrXMove(game, aiSettings.mrxDifficulty)
      if (!decision) {
        // Mr. X has no valid moves; advance turn
        const newState = advanceTurn(game)
        set({ game: newState, validMoves: [], blackTicketMoves: [] })
        return false
      }

      let newState = game

      // Handle double move activation first
      if (decision.useDouble && mrx.tickets.double > 0) {
        newState = applyDoubleMove(newState)
      }

      // Apply the main move
      if (decision.useBlack) {
        newState = applyBlackTicketMove(newState, decision.nodeId)
      } else {
        newState = applyMove(newState, mrx.id, decision.nodeId, decision.transport)
      }

      // Check win condition after first move
      let winResult = checkWinCondition(newState)
      if (winResult.winner) {
        newState = {
          ...newState,
          phase: 'finished',
          winner: winResult.winner,
          winReason: winResult.reason,
        }
        set({ game: newState, validMoves: [], blackTicketMoves: [] })
        return true
      }

      // If double move was used, apply the second move
      if (decision.useDouble && decision.secondMove) {
        const mrxAfterFirst = newState.players.find((p) => p.role === 'mrx')
        if (mrxAfterFirst && newState.mrxState.doubleMovePending === false) {
          // The second move of a double
          if (decision.secondMove.useBlack) {
            newState = applyBlackTicketMove(newState, decision.secondMove.nodeId)
          } else {
            newState = applyMove(
              newState,
              mrxAfterFirst.id,
              decision.secondMove.nodeId,
              decision.secondMove.transport,
            )
          }

          winResult = checkWinCondition(newState)
          if (winResult.winner) {
            newState = {
              ...newState,
              phase: 'finished',
              winner: winResult.winner,
              winReason: winResult.reason,
            }
          }
        }
      }

      set({ game: newState, validMoves: [], blackTicketMoves: [] })
      return true
    },

    /**
     * Executes an AI turn for a disconnected detective.
     * Uses simple BFS-based strategy to move toward Mr. X's last known position.
     * Returns true if a move was made, false otherwise.
     */
    executeDetectiveAiTurn: (playerId) => {
      const { game } = get()
      if (!game || game.phase === 'finished') return false

      const detective = game.players.find((p) => p.id === playerId)
      if (!detective || detective.isEliminated) return false

      const decision = getDetectiveAiMove(game, playerId)
      if (!decision) {
        // Detective has no valid moves; advance turn
        const newState = advanceTurn(game)
        set({ game: newState, validMoves: [], blackTicketMoves: [] })
        return false
      }

      let newState = applyMove(game, playerId, decision.nodeId, decision.transport)
      const winResult = checkWinCondition(newState)
      if (winResult.winner) {
        newState = {
          ...newState,
          phase: 'finished',
          winner: winResult.winner,
          winReason: winResult.reason,
        }
      }

      set({ game: newState, validMoves: [], blackTicketMoves: [] })
      return true
    },
  })),
)

export default useGameStore
