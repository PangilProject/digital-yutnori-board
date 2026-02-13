export interface GameNode {
  id: string;
  x: number;
  y: number;
  isCorner?: boolean;
  isCenter?: boolean;
  label?: string;
}

export interface BoardEdge {
  from: string;
  to: string;
}

export interface Piece {
  id: string;
  team: 'blue' | 'red';
  nodeId: string | null; // null = home (off-board)
}

export interface TeamConfig {
  name: string;
  pieceCount: number;
}

export interface GameState {
  blueTeam: TeamConfig;
  redTeam: TeamConfig;
  pieces: Piece[];
  logs: string[];
}
