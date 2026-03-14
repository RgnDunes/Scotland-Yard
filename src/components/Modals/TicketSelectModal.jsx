import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore.js'
import styles from './Modals.module.css'

const TRANSPORT_LABELS = {
  taxi: 'Taxi',
  bus: 'Bus',
  underground: 'Underground',
  ferry: 'Ferry',
}

const TRANSPORT_ICONS = {
  taxi: '\u{1F695}',
  bus: '\u{1F68C}',
  underground: '\u{1F687}',
  ferry: '\u{26F4}\uFE0F',
}

function TicketSelectModal() {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const closeModal = useUIStore((state) => state.closeModal)

  const isOpen = activeModal === 'ticketSelect'

  const handleSelect = useCallback(
    (transport) => {
      if (modalData?.onSelect) {
        modalData.onSelect(transport)
      }
      closeModal()
    },
    [modalData, closeModal],
  )

  const handleBackdropClick = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <AnimatePresence>
      {isOpen && modalData && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Select transport ticket"
          >
            <h2 className={styles.modalTitle}>
              Choose Transport to Station {modalData.nodeId}
            </h2>
            <div className={styles.ticketOptions}>
              {(modalData.availableTransports ?? []).map((transport) => (
                <motion.button
                  key={transport}
                  className={`${styles.ticketOption} ${styles[`ticketOption${TRANSPORT_LABELS[transport]}`] ?? ''}`}
                  onClick={() => handleSelect(transport)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={styles.ticketOptionIcon} aria-hidden="true">
                    {TRANSPORT_ICONS[transport] ?? ''}
                  </span>
                  <span className={styles.ticketOptionLabel}>
                    {TRANSPORT_LABELS[transport] ?? transport}
                  </span>
                </motion.button>
              ))}
            </div>
            <button className={styles.modalCancel} onClick={handleBackdropClick}>
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(TicketSelectModal)
