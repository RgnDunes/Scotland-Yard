export function getRoutesBetween(fromNode, toNode, graph) {
  const routes = []
  const node = graph[fromNode]
  if (!node) return routes
  if (node.taxi?.includes(toNode)) routes.push('taxi')
  if (node.bus?.includes(toNode)) routes.push('bus')
  if (node.underground?.includes(toNode)) routes.push('underground')
  if (node.ferry?.includes(toNode)) routes.push('ferry')
  return routes
}
