import { useRef, useCallback } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';

// 서브 컴포넌트들
import YutBoardDefs from './board/YutBoardDefs';
import YutNode from './board/YutNode';
import YutPiece from './board/YutPiece';
import MoveMenu from './board/MoveMenu';
import CaptureEffectComponent from './board/CaptureEffect';

interface YutBoardProps {
  /** 게임의 모든 말 상태 데이터 */
  pieces: Piece[];
  /** 팀 목록 및 팀별 설정 정보 */
  teams: TeamConfig[];
  /** 말 이동(상태 변경) 시 호출되는 콜백 함수 */
  onMovePiece: (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => void;
  /** 인터랙션 제한을 위한 현재 차례인 팀의 ID */
  currentTurn?: string;
}

/** 고정 레이아웃 상수 */
const PIECE_RADIUS = 16;
const GOAL_ZONE = { x: 50, y: 565, w: 60, h: 40 }; // 골인(종료) 처리를 위한 시각적 영역

/**
 * 메인 윷놀이 보드판 컴포넌트입니다.
 * 선언적 SVG 구조를 제공하며, 사용자는 드래그나 이동 메뉴를 통해 게임을 플레이할 수 있습니다.
 */
const YutBoard = ({ pieces, teams, onMovePiece, currentTurn }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // 모든 상호작용 로직(드래그, 애니메이션 등)을 hook으로 캡슐화
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
   * 말의 움직임(드래그 또는 클릭)이 시작될 때 호출됩니다.
   */
  const handlePointerDown = useCallback((e: React.PointerEvent, pieceId: string) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (piece?.isFinished || animatingPiece) return;
    
    // 현재 차례인 팀의 말만 움직일 수 있도록 제한
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

    // 짧은 클릭인지 드래그인지 구분하기 위한 핸들러
    const handleUp = () => {
      // 200ms 미만의 짧은 탭은 '메뉴 열기'로 판단
      if (Date.now() - startTime < 200) {
        setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
      }
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointerup', handleUp);
  }, [clientToSVG, pieces, animatingPiece, currentTurn, setDrag, setSelectedPieceId]);

  /**
   * 마우스/터치 이동 중에 실시간으로 말의 좌표를 업데이트합니다.
   */
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY, svgRef.current);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
    if (selectedPieceId) setSelectedPieceId(null); // 드래그 시작 시 이동 메뉴 숨김
  }, [drag, clientToSVG, selectedPieceId, setDrag, setSelectedPieceId]);

  /**
   * 드래그가 끝났을 때 가장 가까운 노드에 말을 안착시키거나 골인 처리를 수행합니다.
   */
  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    
    // 골인 영역 안에 들어왔는지 확인
    const inGoalZone = drag.currentX >= GOAL_ZONE.x - GOAL_ZONE.w/2 && 
                      drag.currentX <= GOAL_ZONE.x + GOAL_ZONE.w/2 &&
                      drag.currentY >= GOAL_ZONE.y - GOAL_ZONE.h/2 &&
                      drag.currentY <= GOAL_ZONE.y + GOAL_ZONE.h/2;
    
    const piece = pieces.find(p => p.id === drag.pieceId);
    // 골인 가능한 위치(시작점 근처 노드들)에 있는지 확인
    const canFinish = piece?.nodeId === 'n0' || piece?.nodeId === 'n15' || piece?.nodeId === 'n10' || piece?.nodeId === 'n24';
    
    if (inGoalZone && piece?.nodeId && canFinish) {
      onMovePiece(drag.pieceId, null, true);
    } else {
      const nearest = findNearestNode(drag.currentX, drag.currentY);
      if (nearest) {
        // 대기석에서 바로 출발 노드(n0)로 들어가는 것은 금지 (반드시 도~모 이동 필요)
        if (piece?.nodeId === null && nearest.id === 'n0') {
          onMovePiece(drag.pieceId, null);
        } else {
          onMovePiece(drag.pieceId, nearest.id);
        }
      } else if (drag.currentY > 600) {
        onMovePiece(drag.pieceId, null); // 대기석(Home)으로 복귀
      }
    }
    setDrag(null);
  }, [drag, onMovePiece, pieces, setDrag]);

  /**
   * 해당 말이 스택(업기)의 대표 말인지 확인합니다.
   * 같은 노드에 같은 팀 말이 여러 개 있을 때 한 번만 렌더링하고 배지를 달아줍니다.
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
      onPointerDown={() => setSelectedPieceId(null)} // 보드 배경 클릭 시 이동 메뉴 닫기
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <YutBoardDefs isShaking={isShaking} />

      <g className={isShaking ? 'shake-it' : ''}>
        {/* 메인 보드 판 프레임 */}
        <rect x="15" y="15" width="570" height="570" rx="16" fill="url(#boardBg)" stroke="url(#boardBorder)" strokeWidth="4" />
        <rect x="30" y="30" width="540" height="540" rx="8" fill="none" stroke="hsl(30, 25%, 62%)" strokeWidth="1" strokeDasharray="8 4" />

        {/* 노드 사이의 경로 선 연결 */}
        {BOARD_EDGES.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          return from && to ? <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(30, 22%, 52%)" strokeWidth="2.5" strokeLinecap="round" /> : null;
        })}

        {/* 전통적인 노드들 (도, 개, 걸...) */}
        {BOARD_NODES.map(node => <YutNode key={node.id} node={node} />)}

        {/* 보드 하단 대기석 대지 */}
        <rect x="15" y="608" width="570" height="76" rx="10" fill="hsl(35, 30%, 88%)" stroke="hsl(35, 20%, 75%)" strokeWidth="1.5" />

        {/* 시각적 🏁 골인 영역 */}
        <rect x={GOAL_ZONE.x - GOAL_ZONE.w/2} y={GOAL_ZONE.y - GOAL_ZONE.h/2} width={GOAL_ZONE.w} height={GOAL_ZONE.h} rx="8" fill="hsla(145, 70%, 50%, 0.1)" stroke="hsl(145, 70%, 40%)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={GOAL_ZONE.x} y={GOAL_ZONE.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="hsl(145, 80%, 30%)" pointerEvents="none">🏁 꼴인</text>

        {/* 상호작용적 캡처(잡기) 시각 효과 */}
        {captureEffect && <CaptureEffectComponent effect={captureEffect} />}

        {/* 대기석 영역의 팀 이름 라벨들 */}
        {teams.map((team, i) => {
          const cols = teams.length <= 2 ? 2 : teams.length;
          const baseX = 20 + i * (560 / cols) + 10;
          return <text key={team.id} x={baseX} y={638} fontSize="11" fontWeight="bold" fill={team.color}>{team.emoji} {team.name}</text>;
        })}

        {/* 보드판 위의 모든 말들 */}
        {pieces.map(piece => {
          // 스택 대표가 아니거나 드래그 중인 것이 아니라면 렌더링 생략 (중복 방지)
          if (!isStackRepresentative(piece) && !(drag && drag.pieceId === piece.id)) return null;
          const pos = getPiecePosition(piece);
          const groupKey = `${piece.nodeId}-${piece.team}`;
          // 드래그나 애니메이션 중에는 전체 스택 크기를 반영
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

        {/* 이동 툴팁 메뉴 (말을 클릭했을 때 표시) */}
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

        {/* 드래그 도중 노드 근처로 갔을 때의 가이드 서클 (자석 효과 피드백) */}
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
