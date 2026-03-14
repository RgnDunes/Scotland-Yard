import { memo } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { REVEAL_TURNS } from '../../engine/locations.js'
import styles from './HUD.module.css'

function RevealCountdown() {
  const turn = useGameStore((state) => state.game?.turn ?? 0)

  const nextReveal = REVEAL_TURNS.find((rt) => rt >= turn) ?? null

  if (nextReveal === null) return null

  const turnsUntilReveal = nextReveal - turn
  const isUrgent = turnsUntilReveal <= 1
  const isRevealNow = turnsUntilReveal === 0

  return (
    <motion.div
      className={`${styles.revealCountdown} ${isUrgent ? styles.revealUrgent : ''}`}
      animate={isUrgent ? { scale: [1, 1.04, 1] } : {}}
      transition={isUrgent ? { repeat: Infinity, duration: 1.2 } : {}}
    >
      {isRevealNow ? (
        <span className={styles.revealText}>Mr. X reveals this turn!</span>
      ) : (
        <span className={styles.revealText}>
          Mr. X reveals in{' '}
          <strong className={styles.revealNumber}>{turnsUntilReveal}</strong>
          {turnsUntilReveal === 1 ? ' turn' : ' turns'}
        </span>
      )}
    </motion.div>
  )
}

export default memo(RevealCountdown)
