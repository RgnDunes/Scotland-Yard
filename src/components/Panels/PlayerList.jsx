import { memo } from 'react'
import useGameStore from '../../store/gameStore.js'
import styles from './Panels.module.css'

function PlayerList() {
  const players = useGameStore((state) => state.game?.players ?? [])
  const currentPlayer = useGameStore((state) => state.getCurrentTurnPlayer())

  if (players.length === 0) return null

  return (
    <div className={styles.playerList}>
      {players.map((player) => {
        const isActive = currentPlayer?.id === player.id
        const isMrX = player.role === 'mrx'

        return (
          <div
            key={player.id}
            className={`${styles.playerItem} ${isActive ? styles.playerItemActive : ''} ${player.isEliminated ? styles.playerItemEliminated : ''}`}
          >
            <span
              className={`${styles.playerDot} ${isMrX ? styles.playerDotMrX : ''}`}
              aria-hidden="true"
            />
            <span className={styles.playerName}>{player.name}</span>
            <span
              className={`${styles.roleBadge} ${isMrX ? styles.roleBadgeMrX : styles.roleBadgeDetective}`}
            >
              {isMrX ? 'Mr. X' : 'Det.'}
            </span>
            {player.isEliminated && (
              <span className={styles.eliminatedBadge}>Out</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default memo(PlayerList)
