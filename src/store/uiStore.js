import { create } from 'zustand'

const useUIStore = create((set) => ({
  activeModal: null,
  modalData: null,
  toasts: [],
  hoveredNode: null,
  selectedNode: null,
  highlightedNodes: [],
  mapScale: 1,
  mapOffset: { x: 0, y: 0 },
  showModal: (type, data) => set({ activeModal: type, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setHighlightedNodes: (nodeIds) => set({ highlightedNodes: nodeIds }),
  setMapTransform: (scale, offset) =>
    set({ mapScale: scale, mapOffset: offset }),
}))

export default useUIStore
