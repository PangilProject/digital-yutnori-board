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
