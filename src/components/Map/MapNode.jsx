import React, { useCallback } from 'react'
import { locations } from '../../engine/locations.js'
import { UNDERGROUND_STATIONS } from '../../engine/graph.js'
import styles from './Map.module.css'

const undergroundSet = new Set(UNDERGROUND_STATIONS)

function MapNode({ nodeId, isHighlighted, isHovered, hasDetective, hasMrX, onClick }) {
  const loc = locations[nodeId]
  if (!loc) return null

  const isUnderground = undergroundSet.has(nodeId)
  const radius = isUnderground ? 10 : 8

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      if (onClick) onClick(nodeId)
    },
    [onClick, nodeId],
  )

  let groupClass = styles.node
  if (isUnderground) groupClass += ` ${styles.nodeUnderground}`
  if (isHighlighted) groupClass += ` ${styles.nodeHighlighted}`
  if (isHovered) groupClass += ` ${styles.nodeHovered}`
  if (hasDetective || hasMrX) groupClass += ` ${styles.nodeOccupied}`

  return (
    <g
      className={groupClass}
      onClick={handleClick}
      role="button"
      tabIndex={-1}
      aria-label={`Station ${nodeId}`}
    >
      <circle
        cx={loc.x}
        cy={loc.y}
        r={radius}
        className={styles.nodeFill}
      />
      <text
        x={loc.x}
        y={loc.y}
        className={styles.nodeLabel}
      >
        {nodeId}
      </text>

      {/* Tooltip shown on hover */}
      <g className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`}>
        <rect
          x={loc.x - 16}
          y={loc.y - radius - 20}
          width={32}
          height={16}
          className={styles.tooltipBg}
        />
        <text
          x={loc.x}
          y={loc.y - radius - 12}
          className={styles.tooltipText}
        >
          {nodeId}
        </text>
      </g>
    </g>
  )
}

export default React.memo(MapNode)
