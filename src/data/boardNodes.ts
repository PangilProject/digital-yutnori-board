import { GameNode, BoardEdge } from '@/types/game';

// Board layout: 600x600 SVG, nodes positioned 50-550
// 20 outer nodes (square perimeter, 6 per side sharing corners)
// 9 inner nodes (2 diagonals crossing at center)
// Total: 29 nodes

export const BOARD_NODES: GameNode[] = [
  // Bottom edge (left to right)
  { id: 'n0',  x: 50,  y: 550, isCorner: true, label: '출발' },
  { id: 'n1',  x: 150, y: 550 },
  { id: 'n2',  x: 250, y: 550 },
  { id: 'n3',  x: 350, y: 550 },
  { id: 'n4',  x: 450, y: 550 },
  { id: 'n5',  x: 550, y: 550, isCorner: true },

  // Right edge (bottom to top, excluding n5)
  { id: 'n6',  x: 550, y: 450 },
  { id: 'n7',  x: 550, y: 350 },
  { id: 'n8',  x: 550, y: 250 },
  { id: 'n9',  x: 550, y: 150 },
  { id: 'n10', x: 550, y: 50, isCorner: true },

  // Top edge (right to left, excluding n10)
  { id: 'n11', x: 450, y: 50 },
  { id: 'n12', x: 350, y: 50 },
  { id: 'n13', x: 250, y: 50 },
  { id: 'n14', x: 150, y: 50 },
  { id: 'n15', x: 50,  y: 50, isCorner: true },

  // Left edge (top to bottom, excluding n15 and n0)
  { id: 'n16', x: 50,  y: 150 },
  { id: 'n17', x: 50,  y: 250 },
  { id: 'n18', x: 50,  y: 350 },
  { id: 'n19', x: 50,  y: 450 },

  // Diagonal: bottom-left (n0) → center → top-right (n10)
  { id: 'n20', x: 133, y: 467 },
  { id: 'n21', x: 217, y: 383 },
  // center
  { id: 'n24', x: 300, y: 300, isCenter: true, label: '방' },
  { id: 'n22', x: 383, y: 217 },
  { id: 'n23', x: 467, y: 133 },

  // Diagonal: bottom-right (n5) → center → top-left (n15)
  { id: 'n25', x: 467, y: 467 },
  { id: 'n26', x: 383, y: 383 },
  // center already defined (n24)
  { id: 'n27', x: 217, y: 217 },
  { id: 'n28', x: 133, y: 133 },
];

export const BOARD_EDGES: BoardEdge[] = [
  // Outer square path
  { from: 'n0',  to: 'n1' },
  { from: 'n1',  to: 'n2' },
  { from: 'n2',  to: 'n3' },
  { from: 'n3',  to: 'n4' },
  { from: 'n4',  to: 'n5' },
  { from: 'n5',  to: 'n6' },
  { from: 'n6',  to: 'n7' },
  { from: 'n7',  to: 'n8' },
  { from: 'n8',  to: 'n9' },
  { from: 'n9',  to: 'n10' },
  { from: 'n10', to: 'n11' },
  { from: 'n11', to: 'n12' },
  { from: 'n12', to: 'n13' },
  { from: 'n13', to: 'n14' },
  { from: 'n14', to: 'n15' },
  { from: 'n15', to: 'n16' },
  { from: 'n16', to: 'n17' },
  { from: 'n17', to: 'n18' },
  { from: 'n18', to: 'n19' },
  { from: 'n19', to: 'n0' },

  // Diagonal 1: bottom-left to top-right
  { from: 'n0',  to: 'n20' },
  { from: 'n20', to: 'n21' },
  { from: 'n21', to: 'n24' },
  { from: 'n24', to: 'n22' },
  { from: 'n22', to: 'n23' },
  { from: 'n23', to: 'n10' },

  // Diagonal 2: bottom-right to top-left
  { from: 'n5',  to: 'n25' },
  { from: 'n25', to: 'n26' },
  { from: 'n26', to: 'n24' },
  { from: 'n24', to: 'n27' },
  { from: 'n27', to: 'n28' },
  { from: 'n28', to: 'n15' },
];

export const SNAP_RADIUS = 40;

export function getNodeById(id: string): GameNode | undefined {
  return BOARD_NODES.find(n => n.id === id);
}

export function findNearestNode(x: number, y: number): GameNode | null {
  let nearest: GameNode | null = null;
  let minDist = Infinity;
  for (const node of BOARD_NODES) {
    const dist = Math.hypot(node.x - x, node.y - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }
  return minDist <= SNAP_RADIUS ? nearest : null;
}

// Yutnori pathfinding logic
export function getMovementPath(startNodeId: string | null, steps: number): string[] {
  const path: string[] = [];
  let currentId = startNodeId;

  // Decide the "track" at the start of the move
  let track: 'outer' | 'diagonal1' | 'diagonal2' | 'fromCenter' = 'outer';
  if (currentId === 'n5') track = 'diagonal2';
  else if (currentId === 'n10') track = 'diagonal1';
  else if (currentId === 'n25' || currentId === 'n26') track = 'diagonal2';
  else if (currentId === 'n23' || currentId === 'n22') track = 'diagonal1';
  else if (currentId === 'n24') track = 'fromCenter';
  else if (['n27', 'n28'].includes(currentId || '')) track = 'diagonal2';
  else if (['n21', 'n20'].includes(currentId || '')) track = 'diagonal1';

  // Back-do logic
  if (steps === -1) {
    if (!currentId) return [];
    if (currentId === 'n0') return ['n19'];
    const prevNodeMap: Record<string, string> = {
      'n1': 'n0', 'n2': 'n1', 'n3': 'n2', 'n4': 'n3', 'n5': 'n4',
      'n6': 'n5', 'n7': 'n6', 'n8': 'n7', 'n9': 'n8', 'n10': 'n9',
      'n11': 'n10', 'n12': 'n11', 'n13': 'n12', 'n14': 'n13', 'n15': 'n14',
      'n16': 'n15', 'n17': 'n16', 'n18': 'n17', 'n19': 'n18',
      'n25': 'n5', 'n26': 'n25', 'n24': 'n26', 'n27': 'n24', 'n28': 'n27',
      'n23': 'n10', 'n22': 'n23', 'n21': 'n24', 'n20': 'n21'
    };
    const prev = prevNodeMap[currentId];
    return prev ? [prev] : [];
  }

  for (let i = 0; i < steps; i++) {
    let nextId = '';

    if (!currentId) {
      nextId = 'n1';
    } else {
      // 골인 판정: n0에 도착하거나 n0를 통과하려고 할 때
      if (currentId === 'n0') {
        path.push('goal');
        break;
      }

      if (track === 'outer') {
        const num = parseInt(currentId.substring(1));
        if (currentId.startsWith('n') && num < 19) nextId = `n${num+1}`;
        else if (currentId === 'n19') nextId = 'n0';
      } else if (track === 'diagonal2') {
        // n5 -> n25 -> n26 -> n24 -> n27 -> n28 -> n15
        const diag2 = ['n5', 'n25', 'n26', 'n24', 'n27', 'n28', 'n15', 'n16', 'n17', 'n18', 'n19', 'n0'];
        const idx = diag2.indexOf(currentId);
        if (idx !== -1 && idx < diag2.length - 1) nextId = diag2[idx+1];
      } else if (track === 'diagonal1') {
        // n10 -> n23 -> n22 -> n24 -> n21 -> n20 -> n0
        const diag1 = ['n10', 'n23', 'n22', 'n24', 'n21', 'n20', 'n0'];
        const idx = diag1.indexOf(currentId);
        if (idx !== -1 && idx < diag1.length - 1) nextId = diag1[idx+1];
      } else if (track === 'fromCenter') {
        // Default from center is towards exit BL
        const toExit = ['n24', 'n21', 'n20', 'n0'];
        const idx = toExit.indexOf(currentId);
        if (idx !== -1 && idx < toExit.length - 1) nextId = toExit[idx+1];
      }
    }

    if (nextId) {
      path.push(nextId);
      currentId = nextId;
    } else break;
  }
  return path;
}
