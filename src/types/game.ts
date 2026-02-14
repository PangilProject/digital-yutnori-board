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

export type TeamId = 'team0' | 'team1' | 'team2' | 'team3';

export interface Piece {
  id: string;
  team: TeamId;
  nodeId: string | null; // null = home (off-board)
  isFinished?: boolean;
}

export interface TeamConfig {
  id: TeamId;
  name: string;
  pieceCount: number;
  color: string;       // HSL main color
  colorLight: string;  // HSL lighter shade
  emoji: string;
}

export interface TeamStats {
  /** 총 이동 횟수 */
  moveCount: number;
  /** 상대방 말을 잡은 횟수 */
  captureCount: number;
  /** 우리 팀 말을 업은 횟수 */
  stackCount: number;
  /** 골인한 말의 개수 */
  finishedCount: number;
}

export interface GameState {
  teams: TeamConfig[];
  pieces: Piece[];
  logs: string[];
  currentTurn: TeamId;
  /** 승리한 팀의 ID (게임 종료 시 설정) */
  winnerId?: TeamId | null;
  /** 팀별 게임 통계 데이터 */
  stats?: Record<TeamId, TeamStats>;
}

export const TEAM_PRESETS: { color: string; colorLight: string; emoji: string; defaultName: string }[] = [
  { color: 'hsl(220, 80%, 50%)',  colorLight: 'hsl(220, 80%, 72%)',  emoji: '🔵', defaultName: '청팀' },
  { color: 'hsl(355, 80%, 50%)',  colorLight: 'hsl(355, 80%, 72%)',  emoji: '🔴', defaultName: '홍팀' },
  { color: 'hsl(145, 70%, 40%)',  colorLight: 'hsl(145, 70%, 65%)',  emoji: '🟢', defaultName: '녹팀' },
  { color: 'hsl(45, 90%, 50%)',   colorLight: 'hsl(45, 90%, 72%)',   emoji: '🟡', defaultName: '황팀' },
];

const RANDOM_NAMES = [
  '번개', '폭풍', '태양', '달빛', '별똥', '용감', '무적', '질풍',
  '천둥', '화산', '은하', '유성', '돌풍', '사자', '호랑', '독수리',
  '매', '불꽃', '파도', '눈보라', '해적', '닌자', '기사', '전사',
];

export function getRandomTeamName(): string {
  return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
}
