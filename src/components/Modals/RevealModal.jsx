import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore.js'
import styles from './Modals.module.css'

function RevealModal() {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const closeModal = useUIStore((state) => state.closeModal)

  const isOpen = activeModal === 'reveal'
  const position = modalData?.position ?? '?'
  const turn = modalData?.turn ?? null

  const handleDismiss = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleDismiss}
        >
          <motion.div
            className={styles.revealContainer}
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Mr. X position revealed"
          >
            <motion.div
              className={styles.revealGlow}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <h2 className={styles.revealTitle}>Mr. X Spotted!</h2>
            {turn && <p className={styles.revealTurn}>Turn {turn}</p>}
            <motion.div
              className={styles.revealPosition}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
                delay: 0.3,
              }}
            >
              {position}
            </motion.div>
            <p className={styles.revealHint}>Station {position}</p>
            <button className={styles.revealDismiss} onClick={handleDismiss}>
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(RevealModal)
