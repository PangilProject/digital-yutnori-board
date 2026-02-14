import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode, getMovementPath } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';
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
}

interface DragState {
  pieceId: string;
  currentX: number;
  currentY: number;
}

interface CaptureEffect {
  x: number;
  y: number;
  id: string;
}

interface AnimatingPiece {
  id: string;
  path: string[];
  currentIndex: number;
}

const PIECE_RADIUS = 16;
const HOME_Y_START = 630;
const GOAL_ZONE = { x: 50, y: 565, w: 60, h: 40 }; // Near starting point n0

const YutBoard = ({ pieces, teams, onMovePiece, currentTurn }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [captureEffect, setCaptureEffect] = useState<CaptureEffect | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<AnimatingPiece | null>(null);

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

  useEffect(() => {
    if (!animatingPiece) return;

    const timer = setTimeout(() => {
      if (animatingPiece.currentIndex < animatingPiece.path.length - 1) {
        setAnimatingPiece(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
      } else {
        const finalNodeId = animatingPiece.path[animatingPiece.path.length - 1];
        onMovePiece(animatingPiece.id, finalNodeId);
        setAnimatingPiece(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [animatingPiece, onMovePiece]);

  const prevPiecesRef = useRef<Piece[]>(pieces);
  useEffect(() => {
    const prev = prevPiecesRef.current;
    const current = pieces;
    
    const movedPiece = current.find(p => {
      const oldP = prev.find(op => op.id === p.id);
      return p.nodeId && p.nodeId !== oldP?.nodeId;
    });

    if (movedPiece && movedPiece.nodeId) {
      const targetNodeId = movedPiece.nodeId;
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

  const clientToSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

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
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag({ pieceId, currentX: pos.x, currentY: pos.y });

    const handleUp = () => {
      if (Date.now() - startTime < 200) {
        setSelectedPieceId(prev => prev === pieceId ? null : pieceId);
      }
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointerup', handleUp);
  }, [clientToSVG, pieces, animatingPiece, currentTurn]);

  const handleMoveOption = useCallback((steps: number) => {
    if (!selectedPieceId) return;
    const piece = pieces.find(p => p.id === selectedPieceId);
    if (!piece) return;

    const path = getMovementPath(piece.nodeId, steps);
    if (path.length > 0) {
      setAnimatingPiece({ id: selectedPieceId, path, currentIndex: 0 });
    }
    setSelectedPieceId(null);
  }, [selectedPieceId, pieces]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
    if (selectedPieceId) setSelectedPieceId(null);
  }, [drag, clientToSVG, selectedPieceId]);

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
      } else if (drag.currentY > 600) {
        onMovePiece(drag.pieceId, null);
      }
    }
    setDrag(null);
  }, [drag, onMovePiece, pieces]);

  const getHomePiecePosition = (teamIndex: number, pieceIndex: number, isFinished: boolean = false): { x: number; y: number } => {
    const cols = teams.length <= 2 ? 2 : teams.length;
    const colWidth = 560 / cols;
    const baseX = 20 + teamIndex * colWidth + colWidth / 2;
    const spacing = teams.length > 2 ? 28 : 42;
    const startX = baseX - ((Math.min(4, pieces.filter(p => !p.nodeId && !p.isFinished).length) - 1) * spacing) / 2;
    return { x: startX + (pieceIndex % 4) * spacing, y: HOME_Y_START + 35 + (isFinished ? 25 : 0) };
  };

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
    return getHomePiecePosition(teamIndex, Math.max(0, teamPieces.indexOf(piece)));
  };

  const isStackRepresentative = (piece: Piece): boolean => {
    if (drag?.pieceId === piece.id || animatingPiece?.id === piece.id || !piece.nodeId) return true;
    const group = pieceGroups.get(`${piece.nodeId}-${piece.team}`);
    return group ? group[0].id === piece.id : true;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 600 ${690}`}
      className="w-full max-w-[600px] mx-auto touch-none select-none"
      onPointerDown={() => setSelectedPieceId(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <YutBoardDefs isShaking={isShaking} />

      <g className={isShaking ? 'shake-it' : ''}>
        <rect x="15" y="15" width="570" height="570" rx="16" fill="url(#boardBg)" stroke="url(#boardBorder)" strokeWidth="4" />
        <rect x="30" y="30" width="540" height="540" rx="8" fill="none" stroke="hsl(30, 25%, 62%)" strokeWidth="1" strokeDasharray="8 4" />

        {BOARD_EDGES.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          return from && to ? <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(30, 22%, 52%)" strokeWidth="2.5" strokeLinecap="round" /> : null;
        })}

        {BOARD_NODES.map(node => <YutNode key={node.id} node={node} />)}

        <rect x="15" y="608" width="570" height="76" rx="10" fill="hsl(35, 30%, 88%)" stroke="hsl(35, 20%, 75%)" strokeWidth="1.5" />

        <rect x={GOAL_ZONE.x - GOAL_ZONE.w/2} y={GOAL_ZONE.y - GOAL_ZONE.h/2} width={GOAL_ZONE.w} height={GOAL_ZONE.h} rx="8" fill="hsla(145, 70%, 50%, 0.1)" stroke="hsl(145, 70%, 40%)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={GOAL_ZONE.x} y={GOAL_ZONE.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill="hsl(145, 80%, 30%)" pointerEvents="none">🏁 꼴인</text>

        {captureEffect && <CaptureEffectComponent effect={captureEffect} />}

        {teams.map((team, i) => {
          const cols = teams.length <= 2 ? 2 : teams.length;
          const baseX = 20 + i * (560 / cols) + 10;
          return <text key={team.id} x={baseX} y={638} fontSize="11" fontWeight="bold" fill={team.color}>{team.emoji} {team.name}</text>;
        })}

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

        {selectedPieceId && !animatingPiece && (() => {
          const piece = pieces.find(p => p.id === selectedPieceId);
          return piece ? <MoveMenu pos={getPiecePosition(piece)} onMoveOption={handleMoveOption} /> : null;
        })()}

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
