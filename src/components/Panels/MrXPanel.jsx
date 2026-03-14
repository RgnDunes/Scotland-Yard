import { memo } from 'react'
import useGameStore from '../../store/gameStore.js'
import { REVEAL_TURNS } from '../../engine/locations.js'
import TicketHand from '../Tickets/TicketHand.jsx'
import styles from './Panels.module.css'

function MrXPanel() {
  const myRole = useGameStore((state) => state.myRole)
  const game = useGameStore((state) => state.game)

  if (myRole !== 'mrx' || !game) return null

  const mrx = game.players.find((p) => p.role === 'mrx')
  if (!mrx) return null

  const currentTurn = game.turn

  return (
    <aside className={styles.mrxPanel}>
      <h2 className={styles.panelTitleMrX}>Mr. X</h2>

      <div className={styles.mrxInfo}>
        <div className={styles.mrxPositionBlock}>
          <span className={styles.mrxPositionLabel}>Your Position</span>
          <span className={styles.mrxPositionValue}>{mrx.position}</span>
        </div>
      </div>

      <div className={styles.mrxSection}>
        <h3 className={styles.mrxSectionTitle}>Tickets</h3>
        <TicketHand playerId={mrx.id} />
      </div>

      <div className={styles.mrxSection}>
        <h3 className={styles.mrxSectionTitle}>Reveal Schedule</h3>
        <div className={styles.revealSchedule}>
          {REVEAL_TURNS.map((rt) => {
            const isPast = rt < currentTurn
            const isCurrent = rt === currentTurn
            return (
              <span
                key={rt}
                className={`${styles.revealTurnBadge} ${isPast ? styles.revealTurnPast : ''} ${isCurrent ? styles.revealTurnCurrent : ''}`}
              >
                {rt}
              </span>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default memo(MrXPanel)
