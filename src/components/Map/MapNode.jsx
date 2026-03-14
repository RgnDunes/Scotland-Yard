import React, { useCallback } from 'react'
import { locations } from '../../engine/locations.js'
import { graph, UNDERGROUND_STATIONS } from '../../engine/graph.js'
import styles from './Map.module.css'

const undergroundSet = new Set(UNDERGROUND_STATIONS)

/* Pre-compute which nodes have bus connections */
const busSet = new Set()
for (let i = 1; i <= 199; i++) {
  if (graph[i]?.bus?.length > 0) busSet.add(i)
}

function MapNode({ nodeId, isHighlighted, isHovered, hasDetective, hasMrX, isSelected, onClick }) {
  const loc = locations[nodeId]
  if (!loc) return null

  const isUnderground = undergroundSet.has(nodeId)
  const isBus = busSet.has(nodeId)
  const radius = isUnderground ? 14 : isBus ? 12 : 11

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      if (onClick) onClick(nodeId)
    },
    [onClick, nodeId],
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        if (onClick) onClick(nodeId)
      }
    },
    [onClick, nodeId],
  )

  let groupClass = styles.node
  if (isUnderground) groupClass += ` ${styles.nodeUnderground}`
  else if (isBus) groupClass += ` ${styles.nodeBus}`
  if (isHighlighted) groupClass += ` ${styles.nodeHighlighted}`
  if (isHovered) groupClass += ` ${styles.nodeHovered}`
  if (hasDetective || hasMrX) groupClass += ` ${styles.nodeOccupied}`

  return (
    <g
      className={groupClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isHighlighted ? 0 : -1}
      aria-label={`Station ${nodeId}${isHighlighted ? ', valid move' : ''}${hasDetective ? ', occupied by detective' : ''}${hasMrX ? ', Mr. X location' : ''}`}
      aria-pressed={isSelected || undefined}
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
        aria-hidden="true"
      >
        {nodeId}
      </text>

      {/* Tooltip shown on hover */}
      <g className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`} aria-hidden="true">
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

/**
 * Custom comparison: only re-render when visual-affecting props change.
 * nodeId and onClick identity are stable (useCallback in parent).
 */
function arePropsEqual(prev, next) {
  return (
    prev.nodeId === next.nodeId &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isHovered === next.isHovered &&
    prev.hasDetective === next.hasDetective &&
    prev.hasMrX === next.hasMrX &&
    prev.isSelected === next.isSelected &&
    prev.onClick === next.onClick
  )
}

export default React.memo(MapNode, arePropsEqual)
