import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../../store/gameStore.js'
import styles from './EndScreen.module.css'

function EndScreen() {
  const game = useGameStore((state) => state.game)

  const isFinished = game?.phase === 'finished'
  const winner = game?.winner ?? null
  const winReason = game?.winReason ?? ''

  const mrxWon = winner === 'mrx'
  const detectivesWon = winner === 'detectives'

  const handlePlayAgain = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <AnimatePresence>
      {isFinished && (
        <motion.div
          className={`${styles.endOverlay} ${mrxWon ? styles.endMrXWin : ''} ${detectivesWon ? styles.endDetWin : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={styles.endContent}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 20,
              delay: 0.2,
            }}
          >
            <motion.h1
              className={styles.endTitle}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {mrxWon ? 'Mr. X Wins' : 'Detectives Win'}
            </motion.h1>

            <motion.p
              className={styles.endSubtitle}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {mrxWon
                ? 'The city remains in his shadow.'
                : 'Justice has been served!'}
            </motion.p>

            {winReason && (
              <motion.p
                className={styles.endReason}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {winReason}
              </motion.p>
            )}

            <motion.button
              className={styles.playAgainButton}
              onClick={handlePlayAgain}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(EndScreen)
