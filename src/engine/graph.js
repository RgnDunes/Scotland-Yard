export const TRANSPORT = {
  TAXI: 'taxi',
  BUS: 'bus',
  UNDERGROUND: 'underground',
  FERRY: 'ferry',
}

export const graph = {}

export function getAdjacentNodes(nodeId, transport) {
  return graph[nodeId]?.[transport] ?? []
}

export function getAllReachableNodes(nodeId) {
  const node = graph[nodeId]
  if (!node) return { taxi: [], bus: [], underground: [], ferry: [] }
  return {
    taxi: node.taxi || [],
    bus: node.bus || [],
    underground: node.underground || [],
    ferry: node.ferry || [],
  }
}
