import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useUIStore from '../../store/uiStore.js'
import styles from './HUD.module.css'

const VARIANT_CLASSES = {
  info: styles.toastInfo,
  success: styles.toastSuccess,
  warning: styles.toastWarning,
  error: styles.toastError,
}

function ToastItem({ toast }) {
  const removeToast = useUIStore((state) => state.removeToast)

  const handleDismiss = useCallback(() => {
    removeToast(toast.id)
  }, [removeToast, toast.id])

  const variantClass = VARIANT_CLASSES[toast.variant] ?? VARIANT_CLASSES.info

  return (
    <motion.div
      className={`${styles.toast} ${variantClass}`}
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      layout
    >
      <span className={styles.toastMessage}>{toast.message}</span>
      <button
        className={styles.toastDismiss}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </motion.div>
  )
}

function Toast() {
  const toasts = useUIStore((state) => state.toasts)

  return (
    <div className={styles.toastContainer} aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default memo(Toast)
