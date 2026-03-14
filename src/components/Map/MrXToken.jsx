import React from 'react'
import styles from './Map.module.css'

/**
 * Mr. X token. Only rendered when visible is true.
 * Shows a pulsing red glow on reveal turns.
 */
function MrXToken({ x, y, visible, isReveal }) {
  if (!visible) return null

  let groupClass = `${styles.token} ${styles.mrxToken}`
  if (isReveal) groupClass += ` ${styles.mrxReveal}`

  return (
    <g className={groupClass}>
      <circle
        cx={x}
        cy={y}
        r={14}
        className={styles.tokenCircle}
      />
      <text
        x={x}
        y={y}
        className={styles.tokenText}
      >
        {isReveal ? 'X' : '?'}
      </text>
    </g>
  )
}

export default React.memo(MrXToken)
