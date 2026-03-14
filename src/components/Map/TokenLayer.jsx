import React from 'react'
import { locations } from '../../engine/locations.js'
import useGameStore from '../../store/gameStore.js'
import DetectiveToken from './DetectiveToken.jsx'
import MrXToken from './MrXToken.jsx'

/**
 * Renders all player tokens on top of the map.
 * Reads positions from the game store.
 */
function TokenLayer() {
  const game = useGameStore((s) => s.game)
  const isRevealTurn = useGameStore((s) => s.isRevealTurn)
  const getLastRevealedPosition = useGameStore((s) => s.getLastRevealedPosition)

  if (!game) return null

  const currentPlayer = game.players[game.currentPlayerIndex]
  const detectives = game.players.filter((p) => p.role === 'detective' && !p.isEliminated)
  const mrx = game.players.find((p) => p.role === 'mrx')

  /* Determine Mr. X visibility and position */
  const reveal = isRevealTurn()
  const mrxVisible = reveal && mrx?.position != null
  const lastRevealed = getLastRevealedPosition()
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
