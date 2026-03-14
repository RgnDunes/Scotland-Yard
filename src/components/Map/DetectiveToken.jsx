import React from 'react'
import styles from './Map.module.css'

/**
 * Detective token rendered at the given SVG coordinates.
 * Color is derived from the CSS variable --detective-{detectiveIndex}.
 */
function DetectiveToken({ detectiveIndex, x, y, isCurrentTurn }) {
  const colorVar = `var(--detective-${detectiveIndex})`
  let groupClass = `${styles.token} ${styles.detectiveToken}`
  if (isCurrentTurn) groupClass += ` ${styles.tokenCurrentTurn}`

  return (
    <g className={groupClass}>
      <circle
        cx={x}
        cy={y}
        r={14}
        fill={colorVar}
        className={styles.tokenCircle}
      />
      <text
        x={x}
        y={y}
        className={styles.tokenText}
      >
        {detectiveIndex}
      </text>
    </g>
  )
}

export default React.memo(DetectiveToken)
