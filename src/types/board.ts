import { Piece } from './game';

/**
 * 게임 말의 현재 드래그 상태를 나타냅니다.
 */
export interface DragState {
  /** 드래그 중인 말의 ID */
  pieceId: string;
  /** 현재 마우스/터치의 SVG 좌표상 X 위치 */
  currentX: number;
  /** 현재 마우스/터치의 SVG 좌표상 Y 위치 */
  currentY: number;
}

/**
 * 보드판 위에 표시될 시각적 캡처 효과(폭발/충격파)를 나타냅니다.
 */
export interface CaptureEffect {
  /** 효과가 표시될 X 좌표 */
  x: number;
  /** 효과가 표시될 Y 좌표 */
  y: number;
  /** 효과의 고유 ID (React key로 사용) */
  id: string;
}

/**
 * 현재 단계별 이동 애니메이션이 진행 중인 말을 나타냅니다.
 */
export interface AnimatingPiece {
  /** 애니메이션 중인 말의 ID */
  id: string;
  /** 이동해야 할 노드 ID들의 경로 배열 */
  path: string[];
  /** 현재 경로 배열에서 몇 번째 노드에 위치해 있는지의 인덱스 */
  currentIndex: number;
}

/**
 * 보드판 위 컴포넌트들의 위치 좌표를 나타냅니다.
 */
export interface BoardPosition {
  x: number;
  y: number;
}
