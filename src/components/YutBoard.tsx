import { useRef, useCallback } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';

// Sub-components
import YutBoardDefs from './board/YutBoardDefs';
import YutNode from './board/YutNode';
import YutPiece from './board/YutPiece';
import MoveMenu from './board/MoveMenu';
import CaptureEffectComponent from './board/CaptureEffect';

interface YutBoardProps {
  /** Current state of all pieces in the game */
  pieces: Piece[];
  /** List of teams and their configurations */
  teams: TeamConfig[];
  /** Callback triggered when a piece is moved (state change) */
  onMovePiece: (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => void;
  /** Current team's ID to restrict interactions */
  currentTurn?: string;
}

/** Fixed layout constants */
const PIECE_RADIUS = 16;
const GOAL_ZONE = { x: 50, y: 565, w: 60, h: 40 }; // Visual target for finishing pieces

/**
 * Main YutBoard component.
 * It provides a declarative SVG-based game board where players can drag pieces or 
 * use the movement menu to play Yutnori.
 */
const YutBoard = ({ pieces, teams, onMovePiece, currentTurn }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Encapsulated interactive logic
  const { 
    states, 
    setters, 
    memos, 
    helpers 
  } = useYutBoardLogic(pieces, teams, onMovePiece, currentTurn);

  const { drag, captureEffect, isShaking, selectedPieceId, animatingPiece } = states;
  const { setDrag, setSelectedPieceId } = setters;
  const { pieceGroups, teamMap, nodeMap } = memos;
  const { clientToSVG, getPiecePosition, getMovementPath } = helpers;

  /**
   * Handles the start of a piece movement (drag or click).
   */
  const handlePointerDown = useCallback((e: React.PointerEvent, pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece?.isFinished || animatingPiece) return;
    
    // Safety check: Only allow moving active team's pieces
    if (currentTurn && piece?.team !== currentTurn) {
      setSelectedPieceId(null);
      return;
    }

    const startTime = Date.now();
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const pos = clientToSVG(e.clientX, e.clientY, svgRef.current);
    setDrag({ pieceId, currentX: pos.x, currentY: pos.y });

    // Distinguish between a short tap (click) and a sustained drag
    const handleUp = () => {
      if (Date.now() - startTime < 200) {
        setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
      }
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointerup', handleUp);
  }, [clientToSVG, pieces, animatingPiece, currentTurn, setDrag, setSelectedPieceId]);

  /**
   * Updates piece position in real-time during mouse/touch move.
   */
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY, svgRef.current);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
    if (selectedPieceId) setSelectedPieceId(null); // Hide menu while dragging
  }, [drag, clientToSVG, selectedPieceId, setDrag, setSelectedPieceId]);

  /**
   * Snaps the dragged piece to the nearest node or handles the finish line.
   */
  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    
    // Check if piece is in the Goal zone
    const inGoalZone = drag.currentX >= GOAL_ZONE.x - GOAL_ZONE.w/2 && 
                      drag.currentX <= GOAL_ZONE.x + GOAL_ZONE.w/2 &&
                      drag.currentY >= GOAL_ZONE.y - GOAL_ZONE.h/2 &&
                      drag.currentY <= GOAL_ZONE.y + GOAL_ZONE.h/2;
    
    const piece = pieces.find(p => p.id === drag.pieceId);
    const canFinish = piece?.nodeId === 'n0' || piece?.nodeId === 'n15' || piece?.nodeId === 'n10' || piece?.nodeId === 'n24';
    
    if (inGoalZone && piece?.nodeId && canFinish) {
      onMovePiece(drag.pieceId, null, true);
    } else {
      const nearest = findNearestNode(drag.currentX, drag.currentY);
      if (nearest) {
        // Enforce entry rule: Cannot land on Start node directly from home
        if (piece?.nodeId === null && nearest.id === 'n0') {
          onMovePiece(drag.pieceId, null);
        } else {
          onMovePiece(drag.pieceId, nearest.id);
        }
      } else if (drag.currentY > 600) {
        onMovePiece(drag.pieceId, null); // Return to home
      }
    }
    setDrag(null);
  }, [drag, onMovePiece, pieces, setDrag]);

  /**
   * Determines if a piece is the "visible" one for its stack.
   * Only one piece per team per node is rendered with a count badge.
   */
  const isStackRepresentative = (piece: Piece): boolean => {
    if (drag?.pieceId === piece.id || animatingPiece?.id === piece.id || !piece.nodeId) return true;
    const group = pieceGroups.get(`${piece.nodeId}-${piece.team}`);
    return group ? group[0].id === piece.id : true;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 600 690`}
      className="w-full max-w-[600px] mx-auto touch-none select-none"
      onPointerDown={() => setSelectedPieceId(null)} // Deselect menu when clicking board background
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <YutBoardDefs isShaking={isShaking} />

      <g className={isShaking ? 'shake-it' : ''}>
        {/* Main board frame */}
        <rect x="15" y="15" width="570" height="570" rx="16" fill="url(#boardBg)" stroke="url(#boardBorder)" strokeWidth="4" />
        <rect x="30" y="30" width="540" height="540" rx="8" fill="none" stroke="hsl(30, 25%, 62%)" strokeWidth="1" strokeDasharray="8 4" />

        {/* Board edges (path lines) */}
        {BOARD_EDGES.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          return from && to ? <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(30, 22%, 52%)" strokeWidth="2.5" strokeLinecap="round" /> : null;
        })}

        {/* Traditional nodes */}
        {BOARD_NODES.map(node => <YutNode key={node.id} node={node} />)}

        {/* Home area for pieces not yet in play */}
        <rect x="15" y="608" width="570" height="76" rx="10" fill="hsl(35, 30%, 88%)" stroke="hsl(35, 20%, 75%)" strokeWidth="1.5" />

        {/* Visual Goal Zone */}
        <rect x={GOAL_ZONE.x - GOAL_ZONE.w/2} y={GOAL_ZONE.y - GOAL_ZONE.h/2} width={GOAL_ZONE.w} height={GOAL_ZONE.h} rx="8" fill="hsla(145, 70%, 50%, 0.1)" stroke="hsl(145, 70%, 40%)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={GOAL_ZONE.x} y={GOAL_ZONE.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="hsl(145, 80%, 30%)" pointerEvents="none">🏁 꼴인</text>

        {/* Interactive capture effects */}
        {captureEffect && <CaptureEffectComponent effect={captureEffect} />}

        {/* Team labels in the home area */}
        {teams.map((team, i) => {
          const cols = teams.length <= 2 ? 2 : teams.length;
          const baseX = 20 + i * (560 / cols) + 10;
          return <text key={team.id} x={baseX} y={638} fontSize="11" fontWeight="bold" fill={team.color}>{team.emoji} {team.name}</text>;
        })}

        {/* Game pieces */}
        {pieces.map(piece => {
          if (!isStackRepresentative(piece) && !(drag && drag.pieceId === piece.id)) return null;
          const pos = getPiecePosition(piece);
          const groupKey = `${piece.nodeId}-${piece.team}`;
          const count = drag?.pieceId === piece.id || animatingPiece?.id === piece.id ? (pieceGroups.get(groupKey)?.length || 1) : (piece.nodeId ? (pieceGroups.get(groupKey)?.length || 1) : 1);
          const team = teamMap.get(piece.team);
          return team ? (
            <YutPiece
              key={piece.id}
              piece={piece}
              team={team}
              pos={pos}
              count={count}
              isDragging={drag?.pieceId === piece.id}
              onPointerDown={(e) => handlePointerDown(e, piece.id)}
              radius={PIECE_RADIUS}
            />
          ) : null;
        })}

        {/* Movement Menu Tooltip */}
        {selectedPieceId && !animatingPiece && (() => {
          const piece = pieces.find(p => p.id === selectedPieceId);
          return piece ? (
            <MoveMenu 
              pos={getPiecePosition(piece)} 
              onMoveOption={(steps) => setters.setAnimatingPiece({ 
                id: selectedPieceId, 
                path: getMovementPath(piece.nodeId, steps), 
                currentIndex: 0 
              })} 
            />
          ) : null;
        })()}

        {/* Visual feedback for snapping */}
        {drag && (() => {
          const nearest = findNearestNode(drag.currentX, drag.currentY);
          return nearest ? (
            <circle cx={nearest.x} cy={nearest.y} r={22} fill="none" stroke="hsl(45, 100%, 55%)" strokeWidth="2.5" strokeDasharray="5 4" pointerEvents="none">
              <animate attributeName="stroke-dashoffset" from="0" to="18" dur="0.8s" repeatCount="indefinite" />
            </circle>
          ) : null;
        })()}
      </g>
    </svg>
  );
};

export default YutBoard;
