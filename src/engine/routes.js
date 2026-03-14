import { graph as defaultGraph } from './graph.js'

export function getRoutesBetween(fromNode, toNode, graphData) {
  const g = graphData || defaultGraph
  const routes = []
  const node = g[fromNode]
  if (!node) return routes
  if (node.taxi?.includes(toNode)) routes.push('taxi')
  if (node.bus?.includes(toNode)) routes.push('bus')
  if (node.underground?.includes(toNode)) routes.push('underground')
  if (node.ferry?.includes(toNode)) routes.push('ferry')
  return routes
}

export function getTransportColor(transport) {
  const colors = {
    taxi: 'var(--transport-taxi)',
    bus: 'var(--transport-bus)',
    underground: 'var(--transport-underground)',
    ferry: 'var(--transport-ferry)',
    black: 'var(--ticket-black)',
    double: 'var(--ticket-double)',
  }
  return colors[transport] || 'var(--color-text-muted)'
}

export function getTransportLabel(transport) {
  const labels = {
    taxi: 'Taxi',
    bus: 'Bus',
    underground: 'Underground',
    ferry: 'Ferry',
    black: 'Black Ticket',
    double: 'Double Move',
  }
  return labels[transport] || transport
}
