import { useState, useCallback, useRef, useEffect } from 'react'

const MIN_SCALE = 0.4
const MAX_SCALE = 4.0
const ZOOM_SENSITIVITY = 0.001

/**
 * Hook for map pan/zoom interactions.
 * Returns { scale, offset, handlers, resetView, containerRef }
 *
 * - Pan: mouse drag or single-touch drag
 * - Zoom: mouse wheel, centered on cursor position
 * - Double-click: reset to fit-all view
 * - Clamped between MIN_SCALE and MAX_SCALE
 */
export function useMapInteraction({ disabled = false } = {}) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  })

  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const clampScale = useCallback((s) => {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
  }, [])

  const handleWheel = useCallback(
    (e) => {
      if (disabled) return
      e.preventDefault()

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      setScale((prevScale) => {
        const delta = -e.deltaY * ZOOM_SENSITIVITY
        const newScale = clampScale(prevScale * (1 + delta))
        const scaleFactor = newScale / prevScale

        setOffset((prevOffset) => ({
          x: cursorX - scaleFactor * (cursorX - prevOffset.x),
          y: cursorY - scaleFactor * (cursorY - prevOffset.y),
        }))

        return newScale
      })
    },
    [disabled, clampScale],
  )

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled) return
      if (e.button !== 0) return

      dragState.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y,
      }

      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [disabled, offset],
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.current.isDragging) return

      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY

      setOffset({
        x: dragState.current.startOffsetX + dx,
        y: dragState.current.startOffsetY + dy,
      })
    },
    [],
  )

  const handlePointerUp = useCallback(() => {
    dragState.current.isDragging = false
  }, [])

  const handleDoubleClick = useCallback(
    (e) => {
      if (disabled) return
      e.preventDefault()
      resetView()
    },
    [disabled, resetView],
  )

  /* Attach wheel listener with { passive: false } so preventDefault works */
  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel, disabled])

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onDoubleClick: handleDoubleClick,
  }

  return {
    scale,
    offset,
    handlers,
    resetView,
    containerRef,
  }
}
