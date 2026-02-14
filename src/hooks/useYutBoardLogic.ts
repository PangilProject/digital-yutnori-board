import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BOARD_NODES, findNearestNode, getMovementPath } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';
import { DragState, CaptureEffect, AnimatingPiece } from '@/types/board';

/**
 * 윷놀이 보드의 복잡한 상호작용 상태와 로직을 관리하는 커스텀 훅입니다.
 * 
 * 주요 기능:
 * 1. 말 드래그 및 노드 스냅(자석) 기능
 * 2. 단계별 이동 애니메이션 처리
 * 3. 말 잡기(Capture) 자동 감지 및 시각 효과 트리거
 * 4. 말 업기(Stacking) 로직 처리 (함께 이동)
 * 5. SVG 레이아웃을 위한 동적 좌표 계산
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

  // 노드 ID를 키로 하는 캐시 맵 (성능 최적화)
  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof BOARD_NODES[0]>();
    BOARD_NODES.forEach(n => map.set(n.id, n));
    return map;
  }, []);

  // 팀 ID를 키로 하는 캐시 맵
  const teamMap = useMemo(() => {
    const map = new Map<string, TeamConfig>();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  /**
   * 보드판 위에 있는 말들을 노드 ID와 팀별로 그룹화합니다.
   * '말 업기(Stacking)' 여부를 판단하는 데 사용됩니다.
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
   * 애니메이션 중인 말의 위치를 순차적으로 업데이트합니다.
   * 250ms 간격으로 한 칸씩 이동합니다.
   */
  useEffect(() => {
    if (!animatingPiece) return;

    const timer = setTimeout(() => {
      if (animatingPiece.currentIndex < animatingPiece.path.length - 1) {
        // 아직 이동할 경로가 남았다면 다음 인덱스로 업데이트
        setAnimatingPiece(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
      } else {
        // 애니메이션 완료: 실제 게임 상태(gameState)를 업데이트
        const finalNodeId = animatingPiece.path[animatingPiece.path.length - 1];
        onMovePiece(animatingPiece.id, finalNodeId);
        setAnimatingPiece(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [animatingPiece, onMovePiece]);

  /**
   * 말의 상태 변화를 감시하여 '말 잡기'가 발생했을 때 시각적 효과를 트리거합니다.
   * 이전 상태와 현재 상태를 비교하여 판단합니다.
   */
  const prevPiecesRef = useRef<Piece[]>(pieces);
  useEffect(() => {
    const prev = prevPiecesRef.current;
    const current = pieces;
    
    // 특정 노드로 새로 이동해온 말을 찾습니다.
    const movedPiece = current.find(p => {
      const oldP = prev.find(op => op.id === p.id);
      return p.nodeId && p.nodeId !== oldP?.nodeId;
    });

    if (movedPiece && movedPiece.nodeId) {
      const targetNodeId = movedPiece.nodeId;
      // 잡기 판정: 이전 상태에서는 상대방 말이 해당 노드에 있었으나, 
      // 현재 상태에서는 그 말이 대기석(nodeId: null)으로 돌아간 경우
      const wasCaptured = prev.some(p => p.nodeId === targetNodeId && p.team !== movedPiece.team) &&
                          current.some(p => p.nodeId === null && p.team !== movedPiece.team && prev.find(op => op.id === p.id)?.nodeId === targetNodeId);
      
      if (wasCaptured) {
        const node = BOARD_NODES.find(n => n.id === targetNodeId);
        if (node) {
          const effectId = Math.random().toString(36).substring(7);
          setCaptureEffect({ x: node.x, y: node.y, id: effectId });
          setIsShaking(true);
          // 일정 시간 후 효과 및 화면 흔들림 중지
          setTimeout(() => setIsShaking(false), 500);
          setTimeout(() => setCaptureEffect(prev => prev?.id === effectId ? null : prev), 2000);
        }
      }
    }
    prevPiecesRef.current = pieces;
  }, [pieces]);

  /**
   * 브라우저 클라이언트 좌표를 SVG 기준 좌표(0-600)로 변환합니다.
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
   * 대기석(Home)에 있는 말들의 위치 좌표를 계산합니다.
   * 팀 수에 따라 겹치지 않게 간격을 조정합니다.
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
   * 말의 현재 절대 (x, y) 좌표를 결정합니다.
   * 애니메이션 중, 드래그 중, 업기 상태, 대기석 상태 등을 모두 고려합니다.
   */
  const getPiecePosition = (piece: Piece): { x: number; y: number } => {
    // 1. 애니메이션 중인 경우
    if (animatingPiece) {
      const targetPiece = pieces.find(p => p.id === animatingPiece.id);
      // 함께 업힌 말들도 같이 애니메이션 되도록 처리
      if (targetPiece && piece.team === targetPiece.team && piece.nodeId === targetPiece.nodeId && !piece.isFinished) {
        const nodeId = animatingPiece.path[animatingPiece.currentIndex];
        const node = nodeMap.get(nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
      }
    }
    
    // 2. 드래그 중인 경우
    if (drag) {
      const draggingPiece = pieces.find(p => p.id === drag.pieceId);
      // 드래그 중인 말과 함께 업힌 말들도 같이 움직임
      if (piece.id === drag.pieceId || (draggingPiece?.nodeId && piece.nodeId === draggingPiece.nodeId && piece.team === draggingPiece.team && !piece.isFinished)) {
        return { x: drag.currentX, y: drag.currentY };
      }
    }

    // 3. 골인하여 이미 나간 말의 경우 (보드 구석에 표시)
    if (piece.isFinished) {
      const teamIndex = teams.findIndex(t => t.id === piece.team);
      const finishedPieces = pieces.filter(p => p.team === piece.team && p.isFinished);
      return { x: 550 - finishedPieces.indexOf(piece) * 15, y: 580 - teamIndex * 15 };
    }

    // 4. 보드판 위에 있는 경우
    if (piece.nodeId) {
      const node = nodeMap.get(piece.nodeId);
      if (node) {
        const teamsAtNode = [...new Set(pieces.filter(p => p.nodeId === piece.nodeId && !p.isFinished).map(p => p.team))];
        // 만약 다른 팀의 말이 같은 곳에 있다면 살짝 어긋나게 표시하여 겹침 방지
        if (teamsAtNode.length > 1) {
          const teamIdx = teamsAtNode.indexOf(piece.team);
          const angle = (teamIdx / teamsAtNode.length) * Math.PI * 2 - Math.PI / 2;
          return { x: node.x + Math.cos(angle) * 14, y: node.y + Math.sin(angle) * 14 };
        }
        return { x: node.x, y: node.y };
      }
    }

    // 5. 대기석에 있는 경우
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
