import { useState, useRef, useCallback, useMemo } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';

interface YutBoardProps {
  pieces: Piece[];
  teams: TeamConfig[];
  onMovePiece: (pieceId: string, targetNodeId: string | null) => void;
}

interface DragState {
  pieceId: string;
  currentX: number;
  currentY: number;
}

const PIECE_RADIUS = 16;
const HOME_Y_START = 630;

const YutBoard = ({ pieces, teams, onMovePiece }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

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

  // Group pieces by nodeId+team for stacking
  const pieceGroups = useMemo(() => {
    const groups = new Map<string, Piece[]>();
    pieces.forEach(p => {
      if (p.nodeId) {
        const key = `${p.nodeId}-${p.team}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
      }
    });
    return groups;
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
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag({ pieceId, currentX: pos.x, currentY: pos.y });
  }, [clientToSVG]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
  }, [drag, clientToSVG]);

  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    const nearest = findNearestNode(drag.currentX, drag.currentY);
    if (nearest) {
      onMovePiece(drag.pieceId, nearest.id);
    } else if (drag.currentY > 600) {
      onMovePiece(drag.pieceId, null);
    }
    setDrag(null);
  }, [drag, onMovePiece]);

  const getHomePiecePosition = (teamIndex: number, pieceIndex: number): { x: number; y: number } => {
    const cols = teams.length <= 2 ? 2 : teams.length;
    const colWidth = 560 / cols;
    const baseX = 20 + teamIndex * colWidth + 30;
    return { x: baseX + pieceIndex * 42, y: HOME_Y_START + 30 };
  };

  const getPiecePosition = (piece: Piece): { x: number; y: number } => {
    if (drag && drag.pieceId === piece.id) {
      return { x: drag.currentX, y: drag.currentY };
    }
    if (piece.nodeId) {
      const node = nodeMap.get(piece.nodeId);
      if (node) {
        // Offset for multiple teams at the same node
        const teamsAtNode = [...new Set(
          pieces.filter(p => p.nodeId === piece.nodeId).map(p => p.team)
        )];
        if (teamsAtNode.length > 1) {
          const teamIdx = teamsAtNode.indexOf(piece.team);
          const angle = (teamIdx / teamsAtNode.length) * Math.PI * 2 - Math.PI / 2;
          return { x: node.x + Math.cos(angle) * 14, y: node.y + Math.sin(angle) * 14 };
        }
        return { x: node.x, y: node.y };
      }
    }
    // Home position
    const teamIndex = teams.findIndex(t => t.id === piece.team);
    const teamPieces = pieces.filter(p => p.team === piece.team && p.nodeId === null);
    const idx = teamPieces.indexOf(piece);
    return getHomePiecePosition(teamIndex, idx >= 0 ? idx : 0);
  };

  const getStackCount = (piece: Piece): number => {
    if (!piece.nodeId) return 1;
    const key = `${piece.nodeId}-${piece.team}`;
    return pieceGroups.get(key)?.length || 1;
  };

  const isStackRepresentative = (piece: Piece): boolean => {
    if (!piece.nodeId) return true;
    const key = `${piece.nodeId}-${piece.team}`;
    const group = pieceGroups.get(key);
    return group ? group[0].id === piece.id : true;
  };

  const svgHeight = 600 + 30 + 60; // board + gap + home area

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 600 ${svgHeight}`}
      className="w-full max-w-[600px] mx-auto touch-none select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Defs for gradients */}
      <defs>
        <radialGradient id="boardBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="hsl(35, 40%, 82%)" />
          <stop offset="100%" stopColor="hsl(35, 35%, 72%)" />
        </radialGradient>
        <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
        </filter>
        <filter id="pieceShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
        </filter>
        <linearGradient id="boardBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(30, 40%, 55%)" />
          <stop offset="100%" stopColor="hsl(30, 30%, 40%)" />
        </linearGradient>
      </defs>

      {/* Board background */}
      <rect x="15" y="15" width="570" height="570" rx="16" fill="url(#boardBg)" stroke="url(#boardBorder)" strokeWidth="4" />
      {/* Inner board decoration */}
      <rect x="30" y="30" width="540" height="540" rx="8" fill="none" stroke="hsl(30, 25%, 62%)" strokeWidth="1" strokeDasharray="8 4" />

      {/* Edges */}
      {BOARD_EDGES.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            stroke="hsl(30, 22%, 52%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Nodes */}
      {BOARD_NODES.map(node => {
        const r = node.isCorner ? 22 : node.isCenter ? 20 : 13;
        return (
          <g key={node.id} filter="url(#nodeShadow)">
            <circle
              cx={node.x}
              cy={node.y}
              r={r}
              fill={
                node.isCorner
                  ? 'hsl(30, 35%, 48%)'
                  : node.isCenter
                  ? 'hsl(25, 40%, 45%)'
                  : 'hsl(32, 28%, 60%)'
              }
              stroke="hsl(28, 25%, 38%)"
              strokeWidth="2"
            />
            {(node.isCorner || node.isCenter) && (
              <circle
                cx={node.x}
                cy={node.y}
                r={r - 5}
                fill="none"
                stroke="hsl(35, 30%, 65%)"
                strokeWidth="1"
              />
            )}
            {node.label && (
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.isCorner ? 11 : 10}
                fontWeight="bold"
                fill="hsl(40, 20%, 92%)"
                pointerEvents="none"
              >
                {node.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Home zone */}
      <rect x="15" y="608" width="570" height="76" rx="10" fill="hsl(35, 30%, 88%)" stroke="hsl(35, 20%, 75%)" strokeWidth="1.5" />

      {/* Home labels */}
      {teams.map((team, i) => {
        const cols = teams.length <= 2 ? 2 : teams.length;
        const colWidth = 560 / cols;
        const baseX = 20 + i * colWidth + 10;
        return (
          <text key={team.id} x={baseX} y={HOME_Y_START + 8} fontSize="11" fontWeight="bold" fill={team.color}>
            {team.emoji} {team.name}
          </text>
        );
      })}

      {/* Pieces */}
      {pieces.map(piece => {
        if (!isStackRepresentative(piece) && !(drag && drag.pieceId === piece.id)) return null;
        const pos = getPiecePosition(piece);
        const count = drag?.pieceId === piece.id ? 1 : getStackCount(piece);
        const isDragging = drag?.pieceId === piece.id;
        const team = teamMap.get(piece.team);
        if (!team) return null;

        return (
          <g
            key={piece.id}
            style={{ cursor: 'grab', opacity: isDragging ? 0.85 : 1 }}
            filter={isDragging ? undefined : 'url(#pieceShadow)'}
            onPointerDown={(e) => handlePointerDown(e, piece.id)}
          >
            {/* Piece body */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={PIECE_RADIUS}
              fill={team.color}
              stroke={isDragging ? 'hsl(45, 100%, 60%)' : team.colorLight}
              strokeWidth={isDragging ? 3 : 2}
            />
            {/* Piece inner ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={9}
              fill={team.colorLight}
              pointerEvents="none"
            />
            {/* Piece shine */}
            <circle
              cx={pos.x - 4}
              cy={pos.y - 5}
              r={4}
              fill="rgba(255,255,255,0.35)"
              pointerEvents="none"
            />
            {/* Stack badge */}
            {count > 1 && (
              <>
                <circle
                  cx={pos.x + 13}
                  cy={pos.y - 13}
                  r={9}
                  fill="hsl(45, 95%, 55%)"
                  stroke="hsl(35, 50%, 30%)"
                  strokeWidth="1.5"
                  pointerEvents="none"
                />
                <text
                  x={pos.x + 13}
                  y={pos.y - 12}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="bold"
                  fill="hsl(35, 50%, 12%)"
                  pointerEvents="none"
                >
                  ×{count}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Snap preview */}
      {drag && (() => {
        const nearest = findNearestNode(drag.currentX, drag.currentY);
        if (!nearest) return null;
        return (
          <circle
            cx={nearest.x}
            cy={nearest.y}
            r={22}
            fill="none"
            stroke="hsl(45, 100%, 55%)"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            pointerEvents="none"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="18" dur="0.8s" repeatCount="indefinite" />
          </circle>
        );
      })()}
    </svg>
  );
};

export default YutBoard;
