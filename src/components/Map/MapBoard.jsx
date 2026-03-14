import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { graph, TRANSPORT } from '../../engine/graph.js'
import useUIStore from '../../store/uiStore.js'
import useGameStore from '../../store/gameStore.js'
import { useMapInteraction } from '../../hooks/useMapInteraction.js'
import MapBackground from './MapBackground.jsx'
import MapEdge from './MapEdge.jsx'
import MapLegend from './MapLegend.jsx'
import MapNode from './MapNode.jsx'
import TokenLayer from './TokenLayer.jsx'
import styles from './Map.module.css'

const VIEWBOX = '0 0 1640 1230'
const MOBILE_BREAKPOINT = 768

/**
 * Builds a deduplicated list of all edges in the graph.
 * Each edge: { from, to, transport }
 * Keyed as min-max to avoid drawing A->B and B->A.
 */
function buildEdgeList() {
  const seen = new Set()
  const edges = []
  const transports = [TRANSPORT.TAXI, TRANSPORT.BUS, TRANSPORT.UNDERGROUND, TRANSPORT.FERRY]

  for (let nodeId = 1; nodeId <= 199; nodeId++) {
    const node = graph[nodeId]
    if (!node) continue

    for (const transport of transports) {
      const neighbors = node[transport]
      if (!neighbors) continue

      for (const neighbor of neighbors) {
        const edgeKey = `${Math.min(nodeId, neighbor)}-${Math.max(nodeId, neighbor)}-${transport}`
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey)
          edges.push({ from: nodeId, to: neighbor, transport })
        }
      }
    }
  }

  return edges
}

/** All 199 node IDs */
const NODE_IDS = Array.from({ length: 199 }, (_, i) => i + 1)

function MapBoard({ onNodeClick: onNodeClickProp }) {
  const [isMobile, setIsMobile] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const hoveredNode = useUIStore((s) => s.hoveredNode)
  const selectedNode = useUIStore((s) => s.selectedNode)
  const setHoveredNode = useUIStore((s) => s.setHoveredNode)
  const highlightedNodes = useUIStore((s) => s.highlightedNodes)
  const setMapTransform = useUIStore((s) => s.setMapTransform)

  const game = useGameStore((s) => s.game)
  const makeMove = useGameStore((s) => s.makeMove)
  const validMoves = useGameStore((s) => s.validMoves)

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  /* Announce turn changes for screen readers */
  useEffect(() => {
    if (!game) return
    const currentPlayer = game.players[game.currentPlayerIndex]
    if (currentPlayer) {
      setAnnouncement(`Turn ${game.turn}: ${currentPlayer.name}'s turn. ${validMoves.length} valid moves available.`)
    }
  }, [game?.turn, game?.currentPlayerIndex, validMoves.length])

  const { scale, offset, handlers, containerRef } = useMapInteraction({
    disabled: isMobile,
  })

  /* Sync transform to UI store */
  useEffect(() => {
    setMapTransform(scale, offset)
  }, [scale, offset, setMapTransform])

  /* Pre-compute all edges once (static data) */
  const allEdges = useMemo(() => buildEdgeList(), [])

  /* Group edges by transport for layered rendering */
  const edgesByTransport = useMemo(() => {
    const groups = {
      [TRANSPORT.TAXI]: [],
      [TRANSPORT.BUS]: [],
      [TRANSPORT.UNDERGROUND]: [],
      [TRANSPORT.FERRY]: [],
    }
    for (const edge of allEdges) {
      groups[edge.transport].push(edge)
    }
    return groups
  }, [allEdges])

  /* Build sets for quick lookup */
  const highlightedSet = useMemo(() => new Set(highlightedNodes), [highlightedNodes])

  const validMoveSet = useMemo(() => {
    const s = new Set()
    for (const move of validMoves) {
      s.add(move.nodeId)
    }
    return s
  }, [validMoves])

  const occupiedByDetective = useMemo(() => {
    if (!game) return new Set()
    return new Set(
      game.players
        .filter((p) => p.role === 'detective' && !p.isEliminated)
        .map((p) => p.position),
    )
  }, [game])

  const mrxPosition = useMemo(() => {
    if (!game) return null
    const mrx = game.players.find((p) => p.role === 'mrx')
    return mrx?.position ?? null
  }, [game])

  const handleNodeClick = useCallback(
    (nodeId) => {
      if (!game) return

      if (onNodeClickProp) {
        onNodeClickProp(nodeId)
        return
      }

      /* If a valid move targets this node, execute it */
      const move = validMoves.find((m) => m.nodeId === nodeId)
      if (move) {
        makeMove(nodeId, move.transport)
      }
    },
    [game, validMoves, makeMove, onNodeClickProp],
  )

  const handleNodeHover = useCallback(
    (nodeId) => {
      setHoveredNode(nodeId)
    },
    [setHoveredNode],
  )

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null)
  }, [setHoveredNode])

  const transformValue = isMobile
    ? undefined
    : `translate(${offset.x}, ${offset.y}) scale(${scale})`

  return (
    <div
      className={styles.mapContainer}
      ref={containerRef}
      {...(isMobile ? {} : handlers)}
    >
      {/* Screen reader announcements for game events */}
      <div
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {announcement}
      </div>

      <svg
        className={styles.mapSvg}
        viewBox={VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Scotland Yard game board with 199 stations connected by taxi, bus, underground, and ferry routes"
        role="img"
      >
        <g transform={transformValue}>
          {/* Layer 0: Geographic background */}
          <MapBackground />

          {/* Layer 1: Taxi edges (bottom) */}
          <g>
            {edgesByTransport[TRANSPORT.TAXI].map((edge) => (
              <MapEdge
                key={`${edge.from}-${edge.to}-${edge.transport}`}
                from={edge.from}
                to={edge.to}
                transport={edge.transport}
              />
            ))}
          </g>

          {/* Layer 2: Bus edges */}
          <g>
            {edgesByTransport[TRANSPORT.BUS].map((edge) => (
              <MapEdge
                key={`${edge.from}-${edge.to}-${edge.transport}`}
                from={edge.from}
                to={edge.to}
                transport={edge.transport}
              />
            ))}
          </g>

          {/* Layer 3: Underground edges */}
          <g>
            {edgesByTransport[TRANSPORT.UNDERGROUND].map((edge) => (
              <MapEdge
                key={`${edge.from}-${edge.to}-${edge.transport}`}
                from={edge.from}
                to={edge.to}
                transport={edge.transport}
              />
            ))}
          </g>

          {/* Layer 4: Ferry edges (top of edges) */}
          <g>
            {edgesByTransport[TRANSPORT.FERRY].map((edge) => (
              <MapEdge
                key={`${edge.from}-${edge.to}-${edge.transport}`}
                from={edge.from}
                to={edge.to}
                transport={edge.transport}
              />
            ))}
          </g>

          {/* Layer 5: All 199 nodes on top of edges */}
          <g>
            {NODE_IDS.map((nodeId) => (
              <g
                key={nodeId}
                onMouseEnter={() => handleNodeHover(nodeId)}
                onMouseLeave={handleNodeLeave}
              >
                <MapNode
                  nodeId={nodeId}
                  isHighlighted={highlightedSet.has(nodeId) || validMoveSet.has(nodeId)}
                  isHovered={hoveredNode === nodeId}
                  isSelected={selectedNode === nodeId}
                  hasDetective={occupiedByDetective.has(nodeId)}
                  hasMrX={mrxPosition === nodeId}
                  onClick={handleNodeClick}
                />
              </g>
            ))}
          </g>

          {/* Layer 6: Player tokens on top of everything */}
          <TokenLayer />
        </g>
      </svg>

      <MapLegend />
    </div>
  )
}

export default MapBoard
