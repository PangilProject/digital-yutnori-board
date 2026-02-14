import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BOARD_NODES, findNearestNode, getMovementPath } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';
import { DragState, CaptureEffect, AnimatingPiece } from '@/types/board';

/**
 * Custom hook that manages the complex interactive state and logic of the YutBoard.
 * 
 * It handles:
 * 1. Piece dragging and snapping to nodes.
 * 2. Step-by-step movement animations.
 * 3. Automatic capture detection and visual effects.
 * 4. Piece stacking logic (moving stacks together).
 * 5. Dynamic coordinate calculation for SVG layout.
 */
export function useYutBoardLogic(
  pieces: Piece[], 
  teams: TeamConfig[], 
  onMovePiece: (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => void,
  currentTurn?: string
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [captureEffect, setCaptureEffect] = useState<CaptureEffect | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<AnimatingPiece | null>(null);

  // Constants mapping
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof BOARD_NODES[0]>();
    BOARD_NODES.forEach(n => map.set(n.id, n));
    return map;
  }, []);

  const teamMap = useMemo(() => {
    const map = new Map<string, TeamConfig>();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  /**
   * Groups pieces currently on the board by their nodeId and team.
   * This is used to determine if pieces are "stacked" (업기).
   */
  const pieceGroups = useMemo(() => {
    const groups = new Map<string, Piece[]>();
    pieces.forEach(p => {
      if (p.nodeId && !p.isFinished) {
        const key = `${p.nodeId}-${p.team}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
      }
    });
    return groups;
  }, [pieces]);

  /**
   * Sequentially updates the position of an animating piece.
   * Speed of animation is controlled by the 250ms timeout.
   */
  useEffect(() => {
    if (!animatingPiece) return;

    const timer = setTimeout(() => {
      if (animatingPiece.currentIndex < animatingPiece.path.length - 1) {
        setAnimatingPiece(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
      } else {
        // Animation complete: finalize move in state
        const finalNodeId = animatingPiece.path[animatingPiece.path.length - 1];
        onMovePiece(animatingPiece.id, finalNodeId);
        setAnimatingPiece(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [animatingPiece, onMovePiece]);

  /**
   * Monitor piece state changes to automatically trigger capture effects.
   * We compare previous piece positions with current positions.
   */
  const prevPiecesRef = useRef<Piece[]>(pieces);
  useEffect(() => {
    const prev = prevPiecesRef.current;
    const current = pieces;
    
    // Find the piece that just moved onto the board at a specific node
    const movedPiece = current.find(p => {
      const oldP = prev.find(op => op.id === p.id);
      return p.nodeId && p.nodeId !== oldP?.nodeId;
    });

    if (movedPiece && movedPiece.nodeId) {
      const targetNodeId = movedPiece.nodeId;
      // Capture logic: opponent pieces were at this node in 'prev', but are 'home' (nodeId: null) in 'current'
      const wasCaptured = prev.some(p => p.nodeId === targetNodeId && p.team !== movedPiece.team) &&
                          current.some(p => p.nodeId === null && p.team !== movedPiece.team && prev.find(op => op.id === p.id)?.nodeId === targetNodeId);
      
      if (wasCaptured) {
        const node = BOARD_NODES.find(n => n.id === targetNodeId);
        if (node) {
          const effectId = Math.random().toString(36).substring(7);
          setCaptureEffect({ x: node.x, y: node.y, id: effectId });
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          setTimeout(() => setCaptureEffect(prev => prev?.id === effectId ? null : prev), 2000);
        }
      }
    }
    prevPiecesRef.current = pieces;
  }, [pieces]);

  /**
   * Translates client coordinates to SVG coordinates (0-600 space).
   */
  const clientToSVG = useCallback((clientX: number, clientY: number, svg: SVGSVGElement | null) => {
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  /**
   * Calculates the SVG coordinate for a specific team's home area.
   * Prevents overlap by adjusting spacing based on team count.
   */
  const getHomePiecePosition = (teamIndex: number, pieceIndex: number, counts: number): { x: number; y: number } => {
    const cols = teams.length <= 2 ? 2 : teams.length;
    const colWidth = 560 / cols;
    const baseX = 20 + teamIndex * colWidth + colWidth / 2;
    const spacing = teams.length > 2 ? 28 : 42;
    const startX = baseX - ((Math.min(4, counts) - 1) * spacing) / 2;
    return { x: startX + (pieceIndex % 4) * spacing, y: 630 + 35 };
  };

  /**
   * Determines the current absolute (x, y) coordinate of a piece.
   * Considers: Animation, Dragging, Stacking, and Home positions.
   */
  const getPiecePosition = (piece: Piece): { x: number; y: number } => {
    if (animatingPiece) {
      const targetPiece = pieces.find(p => p.id === animatingPiece.id);
      if (targetPiece && piece.team === targetPiece.team && piece.nodeId === targetPiece.nodeId && !piece.isFinished) {
        const nodeId = animatingPiece.path[animatingPiece.currentIndex];
        const node = nodeMap.get(nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
      }
    }
    
    if (drag) {
      const draggingPiece = pieces.find(p => p.id === drag.pieceId);
      if (piece.id === drag.pieceId || (draggingPiece?.nodeId && piece.nodeId === draggingPiece.nodeId && piece.team === draggingPiece.team && !piece.isFinished)) {
        return { x: drag.currentX, y: drag.currentY };
      }
    }

    if (piece.isFinished) {
      const teamIndex = teams.findIndex(t => t.id === piece.team);
      const finishedPieces = pieces.filter(p => p.team === piece.team && p.isFinished);
      return { x: 550 - finishedPieces.indexOf(piece) * 15, y: 580 - teamIndex * 15 };
    }

    if (piece.nodeId) {
      const node = nodeMap.get(piece.nodeId);
      if (node) {
        const teamsAtNode = [...new Set(pieces.filter(p => p.nodeId === piece.nodeId && !p.isFinished).map(p => p.team))];
        if (teamsAtNode.length > 1) {
          const teamIdx = teamsAtNode.indexOf(piece.team);
          const angle = (teamIdx / teamsAtNode.length) * Math.PI * 2 - Math.PI / 2;
          return { x: node.x + Math.cos(angle) * 14, y: node.y + Math.sin(angle) * 14 };
        }
        return { x: node.x, y: node.y };
      }
    }

    const teamIndex = teams.findIndex(t => t.id === piece.team);
    const teamPieces = pieces.filter(p => p.team === piece.team && p.nodeId === null && !p.isFinished);
    return getHomePiecePosition(teamIndex, Math.max(0, teamPieces.indexOf(piece)), teamPieces.length);
  };

  return {
    states: { drag, captureEffect, isShaking, selectedPieceId, animatingPiece },
    setters: { setDrag, setCaptureEffect, setIsShaking, setSelectedPieceId, setAnimatingPiece },
    memos: { pieceGroups, nodeMap, teamMap },
    helpers: { clientToSVG, getPiecePosition, getMovementPath },
  };
}
