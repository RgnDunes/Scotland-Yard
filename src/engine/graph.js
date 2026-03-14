export const TRANSPORT = {
  TAXI: 'taxi',
  BUS: 'bus',
  UNDERGROUND: 'underground',
  FERRY: 'ferry',
}

// Complete Scotland Yard board game graph: 199 nodes with adjacency data
// by transport type (taxi, bus, underground, ferry).
// Sources: AlexElvers/scotland-yard-data, Rosuav/ScotlandYard (cross-verified)
// Stats: 346 taxi edges, 99 bus edges, 20 underground edges, 3 ferry edges
export const graph = {
  1: { taxi: [8, 9], bus: [46, 58], underground: [46], ferry: [] },
  2: { taxi: [10, 20], bus: [], underground: [], ferry: [] },
  3: { taxi: [4, 11, 12], bus: [22, 23], underground: [], ferry: [] },
  4: { taxi: [3, 13], bus: [], underground: [], ferry: [] },
  5: { taxi: [15, 16], bus: [], underground: [], ferry: [] },
  6: { taxi: [7, 29], bus: [], underground: [], ferry: [] },
  7: { taxi: [6, 17], bus: [42], underground: [], ferry: [] },
  8: { taxi: [1, 18, 19], bus: [], underground: [], ferry: [] },
  9: { taxi: [1, 19, 20], bus: [], underground: [], ferry: [] },
  10: { taxi: [2, 11, 21, 34], bus: [], underground: [], ferry: [] },
  11: { taxi: [3, 10, 22], bus: [], underground: [], ferry: [] },
  12: { taxi: [3, 23], bus: [], underground: [], ferry: [] },
  13: { taxi: [4, 14, 23, 24], bus: [14, 23, 52], underground: [46, 67, 89], ferry: [] },
  14: { taxi: [13, 15, 25], bus: [13, 15], underground: [], ferry: [] },
  15: { taxi: [5, 14, 16, 26, 28], bus: [14, 29, 41], underground: [], ferry: [] },
  16: { taxi: [5, 15, 28, 29], bus: [], underground: [], ferry: [] },
  17: { taxi: [7, 29, 30], bus: [], underground: [], ferry: [] },
  18: { taxi: [8, 31, 43], bus: [], underground: [], ferry: [] },
  19: { taxi: [8, 9, 32], bus: [], underground: [], ferry: [] },
  20: { taxi: [2, 9, 33], bus: [], underground: [], ferry: [] },
  21: { taxi: [10, 33], bus: [], underground: [], ferry: [] },
  22: { taxi: [11, 23, 34, 35], bus: [3, 23, 34, 65], underground: [], ferry: [] },
  23: { taxi: [12, 13, 22, 37], bus: [3, 13, 22, 67], underground: [], ferry: [] },
  24: { taxi: [13, 37, 38], bus: [], underground: [], ferry: [] },
  25: { taxi: [14, 38, 39], bus: [], underground: [], ferry: [] },
  26: { taxi: [15, 27, 39], bus: [], underground: [], ferry: [] },
  27: { taxi: [26, 28, 40], bus: [], underground: [], ferry: [] },
  28: { taxi: [15, 16, 27, 41], bus: [], underground: [], ferry: [] },
  29: { taxi: [6, 16, 17, 41, 42], bus: [15, 41, 42, 55], underground: [], ferry: [] },
  30: { taxi: [17, 42], bus: [], underground: [], ferry: [] },
  31: { taxi: [18, 43, 44], bus: [], underground: [], ferry: [] },
  32: { taxi: [19, 33, 44, 45], bus: [], underground: [], ferry: [] },
  33: { taxi: [20, 21, 32, 46], bus: [], underground: [], ferry: [] },
  34: { taxi: [10, 22, 47, 48], bus: [22, 46, 63], underground: [], ferry: [] },
  35: { taxi: [22, 36, 48, 65], bus: [], underground: [], ferry: [] },
  36: { taxi: [35, 37, 49], bus: [], underground: [], ferry: [] },
  37: { taxi: [23, 24, 36, 50], bus: [], underground: [], ferry: [] },
  38: { taxi: [24, 25, 50, 51], bus: [], underground: [], ferry: [] },
  39: { taxi: [25, 26, 51, 52], bus: [], underground: [], ferry: [] },
  40: { taxi: [27, 41, 52, 53], bus: [], underground: [], ferry: [] },
  41: { taxi: [28, 29, 40, 54], bus: [15, 29, 52, 87], underground: [], ferry: [] },
  42: { taxi: [29, 30, 56, 72], bus: [7, 29, 72], underground: [], ferry: [] },
  43: { taxi: [18, 31, 57], bus: [], underground: [], ferry: [] },
  44: { taxi: [31, 32, 58], bus: [], underground: [], ferry: [] },
  45: { taxi: [32, 46, 58, 59, 60], bus: [], underground: [], ferry: [] },
  46: { taxi: [33, 45, 47, 61], bus: [1, 34, 58, 78], underground: [1, 13, 74, 79], ferry: [] },
  47: { taxi: [34, 46, 62], bus: [], underground: [], ferry: [] },
  48: { taxi: [34, 35, 62, 63], bus: [], underground: [], ferry: [] },
  49: { taxi: [36, 50, 66], bus: [], underground: [], ferry: [] },
  50: { taxi: [37, 38, 49], bus: [], underground: [], ferry: [] },
  51: { taxi: [38, 39, 52, 67, 68], bus: [], underground: [], ferry: [] },
  52: { taxi: [39, 40, 51, 69], bus: [13, 41, 67, 86], underground: [], ferry: [] },
  53: { taxi: [40, 54, 69], bus: [], underground: [], ferry: [] },
  54: { taxi: [41, 53, 55, 70], bus: [], underground: [], ferry: [] },
  55: { taxi: [54, 71], bus: [29, 89], underground: [], ferry: [] },
  56: { taxi: [42, 91], bus: [], underground: [], ferry: [] },
  57: { taxi: [43, 58, 73], bus: [], underground: [], ferry: [] },
  58: { taxi: [44, 45, 57, 59, 74, 75], bus: [1, 46, 74, 77], underground: [], ferry: [] },
  59: { taxi: [45, 58, 75, 76], bus: [], underground: [], ferry: [] },
  60: { taxi: [45, 61, 76], bus: [], underground: [], ferry: [] },
  61: { taxi: [46, 60, 62, 76, 78], bus: [], underground: [], ferry: [] },
  62: { taxi: [47, 48, 61, 79], bus: [], underground: [], ferry: [] },
  63: { taxi: [48, 64, 79, 80], bus: [34, 65, 79, 100], underground: [], ferry: [] },
  64: { taxi: [63, 65, 81], bus: [], underground: [], ferry: [] },
  65: { taxi: [35, 64, 66, 82], bus: [22, 63, 67, 82], underground: [], ferry: [] },
  66: { taxi: [49, 65, 67, 82], bus: [], underground: [], ferry: [] },
  67: { taxi: [51, 66, 68, 84], bus: [23, 52, 65, 82, 102], underground: [13, 79, 89, 111], ferry: [] },
  68: { taxi: [51, 67, 69, 85], bus: [], underground: [], ferry: [] },
  69: { taxi: [52, 53, 68, 86], bus: [], underground: [], ferry: [] },
  70: { taxi: [54, 71, 87], bus: [], underground: [], ferry: [] },
  71: { taxi: [55, 70, 72, 89], bus: [], underground: [], ferry: [] },
  72: { taxi: [42, 71, 90, 91], bus: [42, 105, 107], underground: [], ferry: [] },
  73: { taxi: [57, 74, 92], bus: [], underground: [], ferry: [] },
  74: { taxi: [58, 73, 75, 92], bus: [58, 94], underground: [46], ferry: [] },
  75: { taxi: [58, 59, 74, 94], bus: [], underground: [], ferry: [] },
  76: { taxi: [59, 60, 61, 77], bus: [], underground: [], ferry: [] },
  77: { taxi: [76, 78, 95, 96], bus: [58, 78, 94, 124], underground: [], ferry: [] },
  78: { taxi: [61, 77, 79, 97], bus: [46, 77, 79], underground: [], ferry: [] },
  79: { taxi: [62, 63, 78, 98], bus: [63, 78], underground: [46, 67, 93, 111], ferry: [] },
  80: { taxi: [63, 99, 100], bus: [], underground: [], ferry: [] },
  81: { taxi: [64, 82, 100], bus: [], underground: [], ferry: [] },
  82: { taxi: [65, 66, 81, 101], bus: [65, 67, 100, 140], underground: [], ferry: [] },
  83: { taxi: [101, 102], bus: [], underground: [], ferry: [] },
  84: { taxi: [67, 85], bus: [], underground: [], ferry: [] },
  85: { taxi: [68, 84, 103], bus: [], underground: [], ferry: [] },
  86: { taxi: [69, 103, 104], bus: [52, 87, 102, 116], underground: [], ferry: [] },
  87: { taxi: [70, 88], bus: [41, 86, 105], underground: [], ferry: [] },
  88: { taxi: [87, 89, 117], bus: [], underground: [], ferry: [] },
  89: { taxi: [71, 88, 105], bus: [55, 105], underground: [13, 67, 128, 140], ferry: [] },
  90: { taxi: [72, 91, 105], bus: [], underground: [], ferry: [] },
  91: { taxi: [56, 72, 90, 105, 107], bus: [], underground: [], ferry: [] },
  92: { taxi: [73, 74, 93], bus: [], underground: [], ferry: [] },
  93: { taxi: [92, 94], bus: [94], underground: [79], ferry: [] },
  94: { taxi: [75, 93, 95], bus: [74, 77, 93], underground: [], ferry: [] },
  95: { taxi: [77, 94, 122], bus: [], underground: [], ferry: [] },
  96: { taxi: [77, 97, 109], bus: [], underground: [], ferry: [] },
  97: { taxi: [78, 96, 98, 109], bus: [], underground: [], ferry: [] },
  98: { taxi: [79, 97, 99, 110], bus: [], underground: [], ferry: [] },
  99: { taxi: [80, 98, 110, 112], bus: [], underground: [], ferry: [] },
  100: { taxi: [80, 81, 101, 112, 113], bus: [63, 82, 111], underground: [], ferry: [] },
  101: { taxi: [82, 83, 100, 114], bus: [], underground: [], ferry: [] },
  102: { taxi: [83, 103, 115], bus: [67, 86, 127], underground: [], ferry: [] },
  103: { taxi: [85, 86, 102], bus: [], underground: [], ferry: [] },
  104: { taxi: [86, 116], bus: [], underground: [], ferry: [] },
  105: { taxi: [89, 90, 91, 106, 108], bus: [72, 87, 89, 107, 108], underground: [], ferry: [] },
  106: { taxi: [105, 107], bus: [], underground: [], ferry: [] },
  107: { taxi: [91, 106, 119], bus: [72, 105, 161], underground: [], ferry: [] },
  108: { taxi: [105, 117, 119], bus: [105, 116, 135], underground: [], ferry: [115] },
  109: { taxi: [96, 97, 110, 124], bus: [], underground: [], ferry: [] },
  110: { taxi: [98, 99, 109, 111], bus: [], underground: [], ferry: [] },
  111: { taxi: [110, 112, 124], bus: [100, 124], underground: [67, 79, 153, 163], ferry: [] },
  112: { taxi: [99, 100, 111, 125], bus: [], underground: [], ferry: [] },
  113: { taxi: [100, 114, 125], bus: [], underground: [], ferry: [] },
  114: { taxi: [101, 113, 115, 126, 131, 132], bus: [], underground: [], ferry: [] },
  115: { taxi: [102, 114, 126, 127], bus: [], underground: [], ferry: [108, 157] },
  116: { taxi: [104, 117, 118, 127], bus: [86, 108, 127, 142], underground: [], ferry: [] },
  117: { taxi: [88, 108, 116, 129], bus: [], underground: [], ferry: [] },
  118: { taxi: [116, 129, 134, 142], bus: [], underground: [], ferry: [] },
  119: { taxi: [107, 108, 136], bus: [], underground: [], ferry: [] },
  120: { taxi: [121, 144], bus: [], underground: [], ferry: [] },
  121: { taxi: [120, 122, 145], bus: [], underground: [], ferry: [] },
  122: { taxi: [95, 121, 123, 146], bus: [123, 144], underground: [], ferry: [] },
  123: { taxi: [122, 124, 137, 148, 149], bus: [122, 124, 144, 165], underground: [], ferry: [] },
  124: { taxi: [109, 111, 123, 130, 138], bus: [77, 111, 123, 153], underground: [], ferry: [] },
  125: { taxi: [112, 113, 131], bus: [], underground: [], ferry: [] },
  126: { taxi: [114, 115, 127, 140], bus: [], underground: [], ferry: [] },
  127: { taxi: [115, 116, 126, 133, 134], bus: [102, 116, 133], underground: [], ferry: [] },
  128: { taxi: [142, 143, 160, 172, 188], bus: [135, 142, 161, 187, 199], underground: [89, 140, 185], ferry: [] },
  129: { taxi: [117, 118, 135, 142, 143], bus: [], underground: [], ferry: [] },
  130: { taxi: [124, 131, 139], bus: [], underground: [], ferry: [] },
  131: { taxi: [114, 125, 130], bus: [], underground: [], ferry: [] },
  132: { taxi: [114, 140], bus: [], underground: [], ferry: [] },
  133: { taxi: [127, 140, 141], bus: [127, 140, 157], underground: [], ferry: [] },
  134: { taxi: [118, 127, 141, 142], bus: [], underground: [], ferry: [] },
  135: { taxi: [129, 136, 143, 161], bus: [108, 128, 161], underground: [], ferry: [] },
  136: { taxi: [119, 135, 162], bus: [], underground: [], ferry: [] },
  137: { taxi: [123, 147], bus: [], underground: [], ferry: [] },
  138: { taxi: [124, 150, 152], bus: [], underground: [], ferry: [] },
  139: { taxi: [130, 140, 153, 154], bus: [], underground: [], ferry: [] },
  140: { taxi: [126, 132, 133, 139, 154, 156], bus: [82, 133, 154, 156], underground: [89, 128, 153], ferry: [] },
  141: { taxi: [133, 134, 142, 158], bus: [], underground: [], ferry: [] },
  142: { taxi: [118, 128, 129, 134, 141, 143, 158], bus: [116, 128, 157], underground: [], ferry: [] },
  143: { taxi: [128, 129, 135, 142, 160], bus: [], underground: [], ferry: [] },
  144: { taxi: [120, 145, 177], bus: [122, 123, 163], underground: [], ferry: [] },
  145: { taxi: [121, 144, 146], bus: [], underground: [], ferry: [] },
  146: { taxi: [122, 145, 147, 163], bus: [], underground: [], ferry: [] },
  147: { taxi: [137, 146, 164], bus: [], underground: [], ferry: [] },
  148: { taxi: [123, 149, 164], bus: [], underground: [], ferry: [] },
  149: { taxi: [123, 148, 150, 165], bus: [], underground: [], ferry: [] },
  150: { taxi: [138, 149, 151], bus: [], underground: [], ferry: [] },
  151: { taxi: [150, 152, 165, 166], bus: [], underground: [], ferry: [] },
  152: { taxi: [138, 151, 153], bus: [], underground: [], ferry: [] },
  153: { taxi: [139, 152, 154, 166, 167], bus: [124, 154, 180, 184], underground: [111, 140, 163, 185], ferry: [] },
  154: { taxi: [139, 140, 153, 155], bus: [140, 153, 156], underground: [], ferry: [] },
  155: { taxi: [154, 156, 167, 168], bus: [], underground: [], ferry: [] },
  156: { taxi: [140, 155, 157, 169], bus: [140, 154, 157, 184], underground: [], ferry: [] },
  157: { taxi: [156, 158, 170], bus: [133, 142, 156, 185], underground: [], ferry: [115, 194] },
  158: { taxi: [141, 142, 157, 159], bus: [], underground: [], ferry: [] },
  159: { taxi: [158, 170, 172, 186, 198], bus: [], underground: [], ferry: [] },
  160: { taxi: [128, 143, 161, 173], bus: [], underground: [], ferry: [] },
  161: { taxi: [135, 160, 174], bus: [107, 128, 135, 199], underground: [], ferry: [] },
  162: { taxi: [136, 175], bus: [], underground: [], ferry: [] },
  163: { taxi: [146, 177], bus: [144, 176, 191], underground: [111, 153], ferry: [] },
  164: { taxi: [147, 148, 178, 179], bus: [], underground: [], ferry: [] },
  165: { taxi: [149, 151, 179, 180], bus: [123, 180, 191], underground: [], ferry: [] },
  166: { taxi: [151, 153, 181, 183], bus: [], underground: [], ferry: [] },
  167: { taxi: [153, 155, 168, 183], bus: [], underground: [], ferry: [] },
  168: { taxi: [155, 167, 184], bus: [], underground: [], ferry: [] },
  169: { taxi: [156, 184], bus: [], underground: [], ferry: [] },
  170: { taxi: [157, 159, 185], bus: [], underground: [], ferry: [] },
  171: { taxi: [173, 175, 199], bus: [], underground: [], ferry: [] },
  172: { taxi: [128, 159, 187], bus: [], underground: [], ferry: [] },
  173: { taxi: [160, 171, 174, 188], bus: [], underground: [], ferry: [] },
  174: { taxi: [161, 173, 175], bus: [], underground: [], ferry: [] },
  175: { taxi: [162, 171, 174], bus: [], underground: [], ferry: [] },
  176: { taxi: [177, 189], bus: [163, 190], underground: [], ferry: [] },
  177: { taxi: [144, 163, 176], bus: [], underground: [], ferry: [] },
  178: { taxi: [164, 189, 191], bus: [], underground: [], ferry: [] },
  179: { taxi: [164, 165, 191], bus: [], underground: [], ferry: [] },
  180: { taxi: [165, 181, 193], bus: [153, 165, 184, 190], underground: [], ferry: [] },
  181: { taxi: [166, 180, 182, 193], bus: [], underground: [], ferry: [] },
  182: { taxi: [181, 183, 195], bus: [], underground: [], ferry: [] },
  183: { taxi: [166, 167, 182, 196], bus: [], underground: [], ferry: [] },
  184: { taxi: [168, 169, 185, 196, 197], bus: [153, 156, 180, 185], underground: [], ferry: [] },
  185: { taxi: [170, 184, 186], bus: [157, 184, 187], underground: [128, 153], ferry: [] },
  186: { taxi: [159, 185, 198], bus: [], underground: [], ferry: [] },
  187: { taxi: [172, 188, 198], bus: [128, 185], underground: [], ferry: [] },
  188: { taxi: [128, 173, 187, 199], bus: [], underground: [], ferry: [] },
  189: { taxi: [176, 178, 190], bus: [], underground: [], ferry: [] },
  190: { taxi: [189, 191, 192], bus: [176, 180, 191], underground: [], ferry: [] },
  191: { taxi: [178, 179, 190, 192], bus: [163, 165, 190], underground: [], ferry: [] },
  192: { taxi: [190, 191, 194], bus: [], underground: [], ferry: [] },
  193: { taxi: [180, 181, 194], bus: [], underground: [], ferry: [] },
  194: { taxi: [192, 193, 195], bus: [], underground: [], ferry: [157] },
  195: { taxi: [182, 194, 197], bus: [], underground: [], ferry: [] },
  196: { taxi: [183, 184, 197], bus: [], underground: [], ferry: [] },
  197: { taxi: [184, 195, 196], bus: [], underground: [], ferry: [] },
  198: { taxi: [159, 186, 187, 199], bus: [], underground: [], ferry: [] },
  199: { taxi: [171, 188, 198], bus: [128, 161], underground: [], ferry: [] },
}

// 14 underground stations
export const UNDERGROUND_STATIONS = [1, 13, 46, 67, 74, 79, 89, 93, 111, 128, 140, 153, 163, 185]

// 62 bus stops
export const BUS_STOPS = [
  1, 3, 7, 13, 14, 15, 22, 23, 29, 34, 41, 42, 46, 52, 55, 58, 63, 65, 67,
  72, 74, 77, 78, 79, 82, 86, 87, 89, 93, 94, 100, 102, 105, 107, 108, 111,
  116, 122, 123, 124, 127, 128, 133, 135, 140, 142, 144, 153, 154, 156, 157,
  161, 163, 165, 176, 180, 184, 185, 187, 190, 191, 199,
]

// Ferry nodes (water/river routes, Mr. X only via black ticket)
// Route: 108 <-> 115 <-> 157 <-> 194
export const FERRY_NODES = [108, 115, 157, 194]

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

export function getAllAdjacentNodeIds(nodeId) {
  const reachable = getAllReachableNodes(nodeId)
  const all = new Set([
    ...reachable.taxi,
    ...reachable.bus,
    ...reachable.underground,
    ...reachable.ferry,
  ])
  return [...all]
}

export function findShortestPath(fromNode, toNode, allowedTransports) {
  if (fromNode === toNode) return [fromNode]
  const transports = allowedTransports || ['taxi', 'bus', 'underground', 'ferry']
  const visited = new Set([fromNode])
  const queue = [[fromNode]]
  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]
    for (const transport of transports) {
      for (const neighbor of getAdjacentNodes(current, transport)) {
        if (neighbor === toNode) return [...path, neighbor]
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          queue.push([...path, neighbor])
        }
      }
    }
  }
  return null
}

export function getNodesWithinDistance(nodeId, maxMoves, allowedTransports) {
  const transports = allowedTransports || ['taxi', 'bus', 'underground', 'ferry']
  const visited = new Set([nodeId])
  let frontier = [nodeId]
  for (let step = 0; step < maxMoves; step++) {
    const nextFrontier = []
    for (const current of frontier) {
      for (const transport of transports) {
        for (const neighbor of getAdjacentNodes(current, transport)) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            nextFrontier.push(neighbor)
          }
        }
      }
    }
    frontier = nextFrontier
  }
  visited.delete(nodeId)
  return [...visited]
}

export function validateGraph() {
  const errors = []
  for (let i = 1; i <= 199; i++) {
    if (!graph[i]) {
      errors.push(`Node ${i} missing from graph`)
      continue
    }
    const node = graph[i]
    const totalConnections =
      (node.taxi?.length || 0) +
      (node.bus?.length || 0) +
      (node.underground?.length || 0) +
      (node.ferry?.length || 0)
    if (totalConnections === 0) {
      errors.push(`Node ${i} has no connections`)
    }
    for (const transport of ['taxi', 'bus', 'underground', 'ferry']) {
      for (const target of node[transport] || []) {
        if (target < 1 || target > 199) {
          errors.push(`Node ${i} has invalid ${transport} target ${target}`)
        }
        if (!graph[target]?.[transport]?.includes(i)) {
          errors.push(`Asymmetric ${transport} edge: ${i}->${target} exists but ${target}->${i} missing`)
        }
      }
    }
  }
  return { valid: errors.length === 0, errors }
}
