import { Component } from 'react'
import { logger } from '../utils/logger.js'
import styles from './ErrorBoundary.module.css'

/**
 * Error boundary that catches render errors in its subtree.
 * Shows a fallback UI with a reload button, or a custom fallback via the `fallback` prop.
 *
 * @prop {React.ReactNode} fallback - Optional custom fallback UI
 * @prop {React.ReactNode} children - Child components to wrap
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logger.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon} aria-hidden="true">
              !
            </div>
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorMessage}>
              An unexpected error occurred. Please reload the page to try again.
            </p>
            <button
              className={styles.errorReloadButton}
              onClick={this.handleReload}
              type="button"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
