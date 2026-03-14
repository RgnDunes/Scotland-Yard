import { memo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import styles from './HUD.module.css'

const TICKET_LABELS = {
  taxi: 'Taxi',
  bus: 'Bus',
  underground: 'Underground',
  ferry: 'Ferry',
  '?': 'Black Ticket',
}

function ActionLog() {
  const ticketTracker = useGameStore((state) => state.game?.ticketTracker ?? [])
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [ticketTracker.length])

  return (
    <div className={styles.actionLog}>
      <h3 className={styles.actionLogTitle}>Activity</h3>
      <div className={styles.actionLogList} ref={listRef}>
        <AnimatePresence>
          {ticketTracker.map((entry) => (
            <motion.div
              key={`log-${entry.turn}`}
              className={styles.actionLogEntry}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.actionLogTurn}>T{entry.turn}</span>
              <span className={styles.actionLogText}>
                Mr. X used{' '}
                <strong>{TICKET_LABELS[entry.ticket] ?? entry.ticket}</strong>
                {entry.revealedPosition && (
                  <span className={styles.actionLogReveal}>
                    {' '}
                    — spotted at {entry.revealedPosition}
                  </span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {ticketTracker.length === 0 && (
          <p className={styles.actionLogEmpty}>No activity yet</p>
        )}
      </div>
    </div>
  )
}

export default memo(ActionLog)
