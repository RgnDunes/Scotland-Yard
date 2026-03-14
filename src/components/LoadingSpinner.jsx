import styles from './LoadingSpinner.module.css'

/**
 * Full-page loading spinner used as the Suspense fallback for lazy-loaded routes.
 */
function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer} role="status" aria-label="Loading">
      <div className={styles.spinner} />
    </div>
  )
}

export default LoadingSpinner
