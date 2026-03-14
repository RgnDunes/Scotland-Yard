import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import { TOTAL_TURNS } from '../../engine/locations.js'
import styles from './HUD.module.css'

function TurnBanner() {
  const currentPlayer = useGameStore((state) => state.getCurrentTurnPlayer())
  const turn = useGameStore((state) => state.game?.turn ?? 0)

  if (!currentPlayer) return null

  const isMrX = currentPlayer.role === 'mrx'

  return (
    <div className={styles.turnBannerWrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlayer.id}
          className={`${styles.turnBanner} ${isMrX ? styles.turnBannerMrX : ''}`}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span className={styles.turnPlayerName}>
            {currentPlayer.name}&apos;s Turn
          </span>
          <span className={styles.turnCounter}>
            Turn {turn}/{TOTAL_TURNS}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default memo(TurnBanner)
