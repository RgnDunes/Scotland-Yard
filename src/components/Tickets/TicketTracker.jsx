import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import styles from './Tickets.module.css'

const TICKET_ICONS = {
  taxi: '\u{1F695}',
  bus: '\u{1F68C}',
  underground: '\u{1F687}',
  ferry: '\u{26F4}\uFE0F',
  '?': '\u{2753}',
}

function TicketTracker() {
  const ticketTracker = useGameStore((state) => state.game?.ticketTracker ?? [])

  return (
    <div className={styles.tracker}>
      <h3 className={styles.trackerTitle}>Mr. X Travel Log</h3>
      <div className={styles.trackerList}>
        <AnimatePresence>
          {ticketTracker.map((entry, index) => (
            <motion.div
              key={entry.turn}
              className={`${styles.trackerEntry} ${entry.revealedPosition ? styles.trackerEntryRevealed : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
            >
              <span className={styles.trackerTurn}>{entry.turn}</span>
              <span className={styles.trackerIcon} aria-hidden="true">
                {TICKET_ICONS[entry.ticket] ?? entry.ticket}
              </span>
              <span className={styles.trackerPosition}>
                {entry.revealedPosition ?? '?'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {ticketTracker.length === 0 && (
          <p className={styles.trackerEmpty}>No moves recorded yet</p>
        )}
      </div>
    </div>
  )
}

export default memo(TicketTracker)
