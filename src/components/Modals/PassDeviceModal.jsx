import { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore.js'
import styles from './Modals.module.css'

const ACTIVATION_DELAY = 3000

function PassDeviceModal() {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const closeModal = useUIStore((state) => state.closeModal)

  const [isReady, setIsReady] = useState(false)

  const isOpen = activeModal === 'passDevice'
  const playerName = modalData?.playerName ?? 'Next Player'
  const isMrX = modalData?.role === 'mrx'

  useEffect(() => {
    if (!isOpen) {
      setIsReady(false)
      return
    }

    const timer = setTimeout(() => {
      setIsReady(true)
    }, ACTIVATION_DELAY)

    return () => clearTimeout(timer)
  }, [isOpen])

  const handleBegin = useCallback(() => {
    if (!isReady) return
    if (modalData?.onReady) {
      modalData.onReady()
    }
    closeModal()
  }, [isReady, modalData, closeModal])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.passOverlay} ${isMrX ? styles.passOverlayMrX : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMrX && <div className={styles.passRadialGlow} />}
          <motion.div
            className={styles.passContent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h2 className={styles.passHeading}>Pass the Device</h2>
            <p className={styles.passSubtext}>Hand the device to</p>
            <p className={`${styles.passPlayerName} ${isMrX ? styles.passPlayerNameMrX : ''}`}>{playerName}</p>

            <motion.button
              className={`${styles.passButton} ${isReady ? (isMrX ? styles.passButtonMrX : styles.passButtonReady) : ''}`}
              onClick={handleBegin}
              disabled={!isReady}
              whileHover={isReady ? { scale: 1.05 } : {}}
              whileTap={isReady ? { scale: 0.95 } : {}}
            >
              {isReady ? 'Tap to Begin' : 'Wait...'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(PassDeviceModal)
