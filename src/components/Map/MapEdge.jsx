import React from 'react'
import { locations } from '../../engine/locations.js'
import styles from './Map.module.css'

const TRANSPORT_CLASSES = {
  taxi: styles.edgeTaxi,
  bus: styles.edgeBus,
  underground: styles.edgeUnderground,
  ferry: styles.edgeFerry,
}

/**
 * Offset index is used to separate parallel lines between the same two nodes.
 * For each (from, to, transport) combo we apply a perpendicular offset
 * so taxi/bus/underground lines don't overlap when sharing a route.
 */
const OFFSET_MAP = {
  taxi: -3,
  bus: 0,
  underground: 3,
  ferry: 5,
}

function computeOffset(fromLoc, toLoc, px) {
  if (px === 0) return { x1: fromLoc.x, y1: fromLoc.y, x2: toLoc.x, y2: toLoc.y }

  const dx = toLoc.x - fromLoc.x
  const dy = toLoc.y - fromLoc.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { x1: fromLoc.x, y1: fromLoc.y, x2: toLoc.x, y2: toLoc.y }

  /* Perpendicular unit vector */
  const nx = -dy / len
  const ny = dx / len

  return {
    x1: fromLoc.x + nx * px,
    y1: fromLoc.y + ny * px,
    x2: toLoc.x + nx * px,
    y2: toLoc.y + ny * px,
  }
}

function MapEdge({ from, to, transport }) {
  const fromLoc = locations[from]
  const toLoc = locations[to]
  if (!fromLoc || !toLoc) return null

  const offsetPx = OFFSET_MAP[transport] ?? 0
  const { x1, y1, x2, y2 } = computeOffset(fromLoc, toLoc, offsetPx)

  const className = `${styles.edge} ${TRANSPORT_CLASSES[transport] || ''}`

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className={className}
    />
  )
}

export default React.memo(MapEdge)
