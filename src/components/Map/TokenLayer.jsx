import React, { useMemo } from 'react'
import { locations, REVEAL_TURNS } from '../../engine/locations.js'
import useGameStore from '../../store/gameStore.js'
import DetectiveToken from './DetectiveToken.jsx'
import MrXToken from './MrXToken.jsx'

/**
 * Renders all player tokens on top of the map.
 * Reads positions from the game store.
 */
function TokenLayer() {
  const game = useGameStore((s) => s.game)

  const detectives = useMemo(
    () =>
      game?.players.filter((p) => p.role === 'detective' && !p.isEliminated) ??
      [],
    [game],
  )

  if (!game) return null

  const currentPlayer = game.players[game.currentPlayerIndex]
  const mrx = game.players.find((p) => p.role === 'mrx')

  /* Determine Mr. X visibility and position */
  const reveal = REVEAL_TURNS.includes(game.turn)
  const mrxVisible = reveal && mrx?.position != null
  const revealedEntries = game.mrxState.positionHistory.filter(
    (h) => h.revealed,
  )
  const lastRevealed =
    revealedEntries.length > 0
      ? revealedEntries[revealedEntries.length - 1].position
      : null
  const mrxDisplayPosition = mrxVisible ? mrx.position : lastRevealed
  const mrxLoc = mrxDisplayPosition ? locations[mrxDisplayPosition] : null

  return (
    <g>
      {/* Detective tokens */}
      {detectives.map((det) => {
        const loc = locations[det.position]
        if (!loc) return null

        return (
          <DetectiveToken
            key={det.id}
            detectiveIndex={det.detectiveIndex}
            x={loc.x}
            y={loc.y}
            isCurrentTurn={currentPlayer?.id === det.id}
          />
        )
      })}

      {/* Mr. X token (only when visible / last revealed) */}
      {mrxLoc && (
        <MrXToken
          x={mrxLoc.x}
          y={mrxLoc.y}
          visible={mrxDisplayPosition != null}
          isReveal={reveal}
        />
      )}
    </g>
  )
}

export default React.memo(TokenLayer)
