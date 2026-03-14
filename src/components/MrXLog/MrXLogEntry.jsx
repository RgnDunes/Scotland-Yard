import { memo } from 'react'
import { motion } from 'framer-motion'
import styles from './MrXLog.module.css'

const TICKET_LABELS = {
  taxi: 'Taxi',
  bus: 'Bus',
  underground: 'Underground',
  ferry: 'Ferry',
  '?': 'Black Ticket',
}

const TICKET_ICONS = {
  taxi: '\u{1F695}',
  bus: '\u{1F68C}',
  underground: '\u{1F687}',
  ferry: '\u{26F4}\uFE0F',
  '?': '\u{2753}',
}

function MrXLogEntry({ entry, index }) {
  const isRevealed = entry.revealedPosition !== null

  return (
    <motion.div
      className={`${styles.logEntry} ${isRevealed ? styles.logEntryRevealed : ''}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div className={styles.logTurnCol}>
        <span className={styles.logTurnNumber}>{entry.turn}</span>
      </div>

      <div className={styles.logTicketCol}>
        <span className={styles.logTicketIcon} aria-hidden="true">
          {TICKET_ICONS[entry.ticket] ?? ''}
        </span>
        <span className={styles.logTicketName}>
          {TICKET_LABELS[entry.ticket] ?? entry.ticket}
        </span>
      </div>

      <div className={styles.logPositionCol}>
        {isRevealed ? (
          <span className={styles.logPositionRevealed}>
            {entry.revealedPosition}
          </span>
        ) : (
          <span className={styles.logPositionHidden}>?</span>
        )}
      </div>
    </motion.div>
  )
}

export default memo(MrXLogEntry)
