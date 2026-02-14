import { useRef, useCallback } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';

// 서브 컴포넌트들
import YutBoardDefs from './board/YutBoardDefs';
import YutNode from './board/YutNode';
import YutPiece from './board/YutPiece';
import MoveMenu from './board/MoveMenu';
import CaptureEffectComponent from './board/CaptureEffect';

interface YutBoardProps {
  pieces: Piece[];
  teams: TeamConfig[];
  onMovePiece: (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => void;
  currentTurn?: string;
  logic: any; // 전달받은 보드 로직 상태 및 헬퍼
}

const PIECE_RADIUS = 13;
const GOAL_ZONE = { x: 50, y: 565, w: 60, h: 40 };

const YutBoard = ({ pieces, teams, onMovePiece, currentTurn, logic }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { states, setters, memos, helpers } = logic;
  const { drag, captureEffect, isShaking, selectedPieceId, animatingPiece } = states;
  const { setDrag, setSelectedPieceId } = setters;
  const { pieceGroups, teamMap, nodeMap } = memos;
  const { clientToSVG, getPiecePosition, getMovementPath } = helpers;

  const handlePointerDown = useCallback((e: React.PointerEvent, pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece?.isFinished || animatingPiece) return;
    
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

    const handleUp = () => {
      if (Date.now() - startTime < 200) {
        setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
      }
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointerup', handleUp);
  }, [clientToSVG, pieces, animatingPiece, currentTurn, setDrag, setSelectedPieceId]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY, svgRef.current);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
    if (selectedPieceId) setSelectedPieceId(null);
  }, [drag, clientToSVG, selectedPieceId, setDrag, setSelectedPieceId]);

  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    
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
        if (piece?.nodeId === null && nearest.id === 'n0') {
          onMovePiece(drag.pieceId, null);
        } else {
          onMovePiece(drag.pieceId, nearest.id);
        }
      } else {
        // 대시보드로 통합되었으므로, 보드 바깥으로 드래그하면 원래 자리(노드)로 복귀하거나 
        // nodeId가 없는 말(대기중)인 경우 null로 유지
        onMovePiece(drag.pieceId, piece?.nodeId || null);
      }
    }
    setDrag(null);
  }, [drag, onMovePiece, pieces, setDrag]);

  const isStackRepresentative = (piece: Piece): boolean => {
    if (drag?.pieceId === piece.id || animatingPiece?.id === piece.id || !piece.nodeId) return true;
    const group = pieceGroups.get(`${piece.nodeId}-${piece.team}`);
    return group ? group[0].id === piece.id : true;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 600 600`}
      className="w-full max-w-[1000px] mx-auto touch-none select-none"
      onPointerDown={() => setSelectedPieceId(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <YutBoardDefs isShaking={isShaking} />

      <g className={isShaking ? 'shake-it' : ''}>
        {/* 메인 보드 판 프레임 */}
        <rect x="15" y="15" width="570" height="570" rx="24" fill="url(#boardBg)" stroke="url(#boardBorder)" strokeWidth="4" />
        <rect x="30" y="30" width="540" height="540" rx="16" fill="none" stroke="hsl(30, 25%, 62%)" strokeWidth="1" strokeDasharray="8 4" />

        {/* 노드 사이의 경로 선 연결 */}
        {BOARD_EDGES.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          return from && to ? <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(30, 22%, 52%)" strokeWidth="3" strokeLinecap="round" /> : null;
        })}

        {/* 전통적인 노드들 */}
        {BOARD_NODES.map(node => <YutNode key={node.id} node={node} />)}

        {/* 시각적 🏁 골인 영역 */}
        <rect x={GOAL_ZONE.x - GOAL_ZONE.w/2} y={GOAL_ZONE.y - GOAL_ZONE.h/2} width={GOAL_ZONE.w} height={GOAL_ZONE.h} rx="8" fill="hsla(145, 70%, 50%, 0.1)" stroke="hsl(145, 70%, 40%)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={GOAL_ZONE.x} y={GOAL_ZONE.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="hsl(145, 80%, 30%)" pointerEvents="none">🏁 꼴인</text>

        {/* 상호작용적 캡처(잡기) 시각 효과 */}
        {captureEffect && <CaptureEffectComponent effect={captureEffect} />}

        {/* 보드판 위의 말들 (nodeId가 있는 말만 렌더링) */}
        {pieces.map(piece => {
          // 대기석이나 골인한 말은 보드판에서 더 이상 렌더링하지 않음 (대시보드 통합)
          if (!piece.nodeId || piece.isFinished) {
            // 드래그 중, 애니메이션 중, 또는 선택된 경우에만 예외적으로 렌더링
            const isActiveInLogic = drag?.pieceId === piece.id || 
                                   animatingPiece?.id === piece.id || 
                                   selectedPieceId === piece.id;
            if (!isActiveInLogic) return null;
          }

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

        {/* 이동 툴팁 메뉴 */}
        {selectedPieceId && !animatingPiece && (() => {
          const piece = pieces.find(p => p.id === selectedPieceId);
          return piece ? (
            <MoveMenu 
              pos={getPiecePosition(piece)} 
              onMoveOption={(steps) => {
                setters.setAnimatingPiece({ 
                  id: selectedPieceId, 
                  path: getMovementPath(piece.nodeId, steps), 
                  currentIndex: 0 
                });
                setSelectedPieceId(null);
              }} 
            />
          ) : null;
        })()}

        {/* 드래그 도중 노드 근처 가이드 */}
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
