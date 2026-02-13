import { useState, useRef, useCallback, useMemo } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece } from '@/types/game';

interface YutBoardProps {
  pieces: Piece[];
  blueTeamName: string;
  redTeamName: string;
  onMovePiece: (pieceId: string, targetNodeId: string | null) => void;
}

interface DragState {
  pieceId: string;
  currentX: number;
  currentY: number;
}

const PIECE_RADIUS = 18;
const HOME_Y = 640;

function getHomePiecePositions(team: 'blue' | 'red', totalPieces: number) {
  const baseX = team === 'blue' ? 80 : 380;
  return Array.from({ length: totalPieces }, (_, i) => ({
    x: baseX + i * 50,
    y: HOME_Y,
  }));
}

const YutBoard = ({ pieces, blueTeamName, redTeamName, onMovePiece }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, typeof BOARD_NODES[0]>();
    BOARD_NODES.forEach(n => map.set(n.id, n));
    return map;
  }, []);

  // Group pieces by nodeId for stacking
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
      // Dropped in home zone
      onMovePiece(drag.pieceId, null);
    }
    setDrag(null);
  }, [drag, onMovePiece]);

  const getPiecePosition = (piece: Piece): { x: number; y: number } => {
    if (drag && drag.pieceId === piece.id) {
      return { x: drag.currentX, y: drag.currentY };
    }
    if (piece.nodeId) {
      const node = nodeMap.get(piece.nodeId);
      if (node) {
        // Offset if stacking with different team at same node
        const sameNodeOtherTeam = pieces.some(
          p => p.id !== piece.id && p.nodeId === piece.nodeId && p.team !== piece.team
        );
        const offset = sameNodeOtherTeam ? (piece.team === 'blue' ? -12 : 12) : 0;
        return { x: node.x + offset, y: node.y };
      }
    }
    // Home position
    const teamPieces = pieces.filter(p => p.team === piece.team);
    const idx = teamPieces.indexOf(piece);
    const positions = getHomePiecePositions(piece.team, teamPieces.length);
    return positions[idx] || { x: 300, y: HOME_Y };
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

  const teamColor = (team: 'blue' | 'red') =>
    team === 'blue' ? 'hsl(220, 75%, 50%)' : 'hsl(355, 75%, 50%)';

  const teamColorLight = (team: 'blue' | 'red') =>
    team === 'blue' ? 'hsl(220, 75%, 70%)' : 'hsl(355, 75%, 70%)';

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 700"
      className="w-full max-w-[600px] mx-auto touch-none select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Board background */}
      <rect x="20" y="20" width="560" height="560" rx="12" fill="hsl(35, 35%, 78%)" stroke="hsl(35, 25%, 55%)" strokeWidth="3" />

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
            stroke="hsl(35, 20%, 55%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Nodes */}
      {BOARD_NODES.map(node => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.isCorner || node.isCenter ? 20 : 14}
            fill={node.isCorner || node.isCenter ? 'hsl(35, 30%, 50%)' : 'hsl(35, 25%, 62%)'}
            stroke="hsl(35, 20%, 40%)"
            strokeWidth="2"
          />
          {node.label && (
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="bold"
              fill="hsl(35, 10%, 95%)"
              pointerEvents="none"
            >
              {node.label}
            </text>
          )}
        </g>
      ))}

      {/* Home zone divider */}
      <line x1="30" y1="610" x2="570" y2="610" stroke="hsl(35, 20%, 70%)" strokeWidth="1" strokeDasharray="6 4" />

      {/* Home labels */}
      <text x="80" y="625" fontSize="12" fontWeight="bold" fill={teamColor('blue')}>{blueTeamName}</text>
      <text x="380" y="625" fontSize="12" fontWeight="bold" fill={teamColor('red')}>{redTeamName}</text>

      {/* Pieces */}
      {pieces.map(piece => {
        if (!isStackRepresentative(piece) && !(drag && drag.pieceId === piece.id)) return null;
        const pos = getPiecePosition(piece);
        const count = drag?.pieceId === piece.id ? 1 : getStackCount(piece);
        const isDragging = drag?.pieceId === piece.id;

        return (
          <g
            key={piece.id}
            style={{ cursor: 'grab', opacity: isDragging ? 0.8 : 1 }}
            onPointerDown={(e) => handlePointerDown(e, piece.id)}
          >
            {/* Shadow */}
            <circle
              cx={pos.x + 2}
              cy={pos.y + 2}
              r={PIECE_RADIUS}
              fill="rgba(0,0,0,0.15)"
            />
            {/* Piece body */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={PIECE_RADIUS}
              fill={teamColor(piece.team)}
              stroke={isDragging ? 'hsl(45, 100%, 60%)' : teamColorLight(piece.team)}
              strokeWidth={isDragging ? 3 : 2}
            />
            {/* Piece inner */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={10}
              fill={teamColorLight(piece.team)}
              pointerEvents="none"
            />
            {/* Stack badge */}
            {count > 1 && (
              <>
                <circle
                  cx={pos.x + 14}
                  cy={pos.y - 14}
                  r={10}
                  fill="hsl(45, 90%, 55%)"
                  stroke="hsl(35, 40%, 30%)"
                  strokeWidth="1.5"
                  pointerEvents="none"
                />
                <text
                  x={pos.x + 14}
                  y={pos.y - 13}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="bold"
                  fill="hsl(35, 40%, 15%)"
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
            stroke="hsl(45, 100%, 60%)"
            strokeWidth="2"
            strokeDasharray="4 4"
            pointerEvents="none"
          />
        );
      })()}
    </svg>
  );
};

export default YutBoard;
