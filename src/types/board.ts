import { Piece } from './game';

/**
 * Represents the current drag state of a game piece.
 */
export interface DragState {
  pieceId: string;
  currentX: number;
  currentY: number;
}

/**
 * Represents a visual capture effect (explosion/shockwave) on the board.
 */
export interface CaptureEffect {
  x: number;
  y: number;
  id: string;
}

/**
 * Represents a piece currently undergoing step-by-step movement animation.
 */
export interface AnimatingPiece {
  id: string;
  path: string[];
  currentIndex: number;
}

/**
 * Props for the YutBoard sub-components.
 */
export interface BoardPosition {
  x: number;
  y: number;
}
