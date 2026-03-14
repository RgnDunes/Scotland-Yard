import { memo, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import MrXLogEntry from './MrXLogEntry.jsx'
import styles from './MrXLog.module.css'

function MrXLog() {
  const ticketTracker = useGameStore((state) => state.game?.ticketTracker ?? [])
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [ticketTracker.length])

  return (
    <div className={styles.mrxLog}>
      <h3 className={styles.logTitle}>Mr. X Travel Log</h3>

      <div className={styles.logHeader}>
        <span className={styles.logHeaderTurn}>Turn</span>
        <span className={styles.logHeaderTicket}>Ticket</span>
        <span className={styles.logHeaderPosition}>Position</span>
      </div>

      <div className={styles.logList} ref={listRef}>
        <AnimatePresence>
          {ticketTracker.map((entry, index) => (
            <MrXLogEntry key={entry.turn} entry={entry} index={index} />
          ))}
        </AnimatePresence>

        {ticketTracker.length === 0 && (
          <p className={styles.logEmpty}>
            Mr. X has not made any moves yet
          </p>
        )}
      </div>
    </div>
  )
}

export default memo(MrXLog)
