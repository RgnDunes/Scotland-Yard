import { memo } from 'react'
import useGameStore from '../../store/gameStore.js'
import TicketHand from '../Tickets/TicketHand.jsx'
import styles from './Panels.module.css'

function DetectivePanel() {
  const detectives = useGameStore((state) => state.getDetectives())
  const currentPlayer = useGameStore((state) => state.getCurrentTurnPlayer())

  if (detectives.length === 0) return null

  return (
    <aside className={styles.detectivePanel}>
      <h2 className={styles.panelTitle}>Detectives</h2>
      <div className={styles.detectiveList}>
        {detectives.map((det) => {
          const isActive = currentPlayer?.id === det.id
          const colorIndex = det.detectiveIndex ?? 1
          const colorClass = styles[`detectiveColor${colorIndex}`] ?? ''

          return (
            <div
              key={det.id}
              className={`${styles.detectiveCard} ${isActive ? styles.detectiveCardActive : ''} ${det.isEliminated ? styles.detectiveCardEliminated : ''}`}
            >
              <div className={styles.detectiveHeader}>
                <span
                  className={`${styles.detectiveColor} ${colorClass}`}
                  aria-hidden="true"
                />
                <span className={styles.detectiveName}>{det.name}</span>
                {det.isEliminated && (
                  <span className={styles.detectiveBadge}>Out</span>
                )}
              </div>
              <div className={styles.detectivePosition}>
                Station <strong>{det.position}</strong>
              </div>
              <TicketHand playerId={det.id} />
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default memo(DetectivePanel)
