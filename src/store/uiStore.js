import { create } from 'zustand'

let toastId = 0

const useUIStore = create((set, get) => ({
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

  addToast: (message, variant = 'info', duration = 3500) => {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id, message, variant, duration }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
    return id
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setHighlightedNodes: (nodeIds) => set({ highlightedNodes: nodeIds }),
  setMapTransform: (scale, offset) =>
    set({ mapScale: scale, mapOffset: offset }),
}))

export default useUIStore
