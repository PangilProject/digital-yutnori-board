import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { BOARD_NODES, BOARD_EDGES, findNearestNode } from '@/data/boardNodes';
import { Piece, TeamConfig } from '@/types/game';

interface YutBoardProps {
  pieces: Piece[];
  teams: TeamConfig[];
  onMovePiece: (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => void;
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

const PIECE_RADIUS = 16;
const HOME_Y_START = 630;
const GOAL_ZONE = { x: 50, y: 565, w: 60, h: 40 }; // Near starting point n0

const YutBoard = ({ pieces, teams, onMovePiece }: YutBoardProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [captureEffect, setCaptureEffect] = useState<CaptureEffect | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const lastCaptureRef = useRef<string | null>(null);

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
      if (p.nodeId && !p.isFinished) {
        const key = `${p.nodeId}-${p.team}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
      }
    });
    return groups;
  }, [pieces]);

  // Effect to trigger capture animation
  useEffect(() => {
    const activePiecesOnBoard = pieces.filter(p => p.nodeId && !p.isFinished);
    // Find if any pieces were returned home while another piece moved to their node
    // Simplified: check for changes in piece counts at nodes
  }, [pieces]);

  // Detect capture by comparing previous pieces state
  const prevPiecesRef = useRef<Piece[]>(pieces);
  useEffect(() => {
    const prev = prevPiecesRef.current;
    const current = pieces;
    
    // Find a piece that moved to a node
    const movedPiece = current.find(p => {
      const oldP = prev.find(op => op.id === p.id);
      return p.nodeId && p.nodeId !== oldP?.nodeId;
    });

    if (movedPiece && movedPiece.nodeId) {
      const targetNodeId = movedPiece.nodeId;
      // Check if any opponent piece was at targetNodeId in prev, but is now null in current
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
    if (piece?.isFinished) return;

    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag({ pieceId, currentX: pos.x, currentY: pos.y });
  }, [clientToSVG, pieces]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const pos = clientToSVG(e.clientX, e.clientY);
    setDrag(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
  }, [drag, clientToSVG]);

  const handlePointerUp = useCallback(() => {
    if (!drag) return;
    
    // Goal check: Near n0 but not snapping to n0
    const inGoalZone = drag.currentX >= GOAL_ZONE.x - GOAL_ZONE.w/2 && 
                      drag.currentX <= GOAL_ZONE.x + GOAL_ZONE.w/2 &&
                      drag.currentY >= GOAL_ZONE.y - GOAL_ZONE.h/2 &&
                      drag.currentY <= GOAL_ZONE.y + GOAL_ZONE.h/2;
    
    // Logic: If piece is already on board and moves to goal zone
    const piece = pieces.find(p => p.id === drag.pieceId);
    const canFinish = piece?.nodeId === 'n0' || piece?.nodeId === 'n15' || piece?.nodeId === 'n10' || piece?.nodeId === 'n24';
    
    if (inGoalZone && piece?.nodeId && canFinish) {
      onMovePiece(drag.pieceId, null, true);
      setDrag(null);
      return;
    }

    const nearest = findNearestNode(drag.currentX, drag.currentY);
    if (nearest) {
      onMovePiece(drag.pieceId, nearest.id);
    } else if (drag.currentY > 600) {
      onMovePiece(drag.pieceId, null);
    }
    setDrag(null);
  }, [drag, onMovePiece, pieces]);

  const getHomePiecePosition = (teamIndex: number, pieceIndex: number, isFinished: boolean = false): { x: number; y: number } => {
    const cols = teams.length <= 2 ? 2 : teams.length;
    const colWidth = 560 / cols;
    const baseX = 20 + teamIndex * colWidth + 30;
    const yOffset = isFinished ? 25 : 0;
    return { x: baseX + (pieceIndex % 4) * 42, y: HOME_Y_START + 30 + yOffset };
  };

  const getPiecePosition = (piece: Piece): { x: number; y: number } => {
    if (drag && drag.pieceId === piece.id) {
      return { x: drag.currentX, y: drag.currentY };
    }
    if (piece.isFinished) {
      const teamIndex = teams.findIndex(t => t.id === piece.team);
      const finishedPieces = pieces.filter(p => p.team === piece.team && p.isFinished);
      const idx = finishedPieces.indexOf(piece);
      return { x: 550 - idx * 15, y: 580 - teamIndex * 15 }; // Small stack in corner or dedicated area
    }
    if (piece.nodeId) {
      const node = nodeMap.get(piece.nodeId);
      if (node) {
        // Offset for multiple teams at the same node
        const teamsAtNode = [...new Set(
          pieces.filter(p => p.nodeId === piece.nodeId && !p.isFinished).map(p => p.team)
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
    const teamPieces = pieces.filter(p => p.team === piece.team && p.nodeId === null && !p.isFinished);
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
        <style>{`
          @keyframes shake {
            0% { transform: translate(0,0) rotate(0); }
            10% { transform: translate(-5px,-5px) rotate(-1deg); }
            20% { transform: translate(5px,5px) rotate(1deg); }
            30% { transform: translate(-5px,5px) rotate(-1deg); }
            40% { transform: translate(5px,-5px) rotate(1deg); }
            50% { transform: translate(-5px,-5px) rotate(-1deg); }
            60% { transform: translate(5px,5px) rotate(1deg); }
            70% { transform: translate(-5px,5px) rotate(-1deg); }
            80% { transform: translate(5px,-5px) rotate(1deg); }
            90% { transform: translate(-5px,-5px) rotate(-1deg); }
            100% { transform: translate(0,0) rotate(0); }
          }
          .shake-it { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        `}</style>
      </defs>

      <g className={isShaking ? 'shake-it' : ''}>
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

      {/* Goal zone near starting point */}
      <rect 
        x={GOAL_ZONE.x - GOAL_ZONE.w/2} 
        y={GOAL_ZONE.y - GOAL_ZONE.h/2} 
        width={GOAL_ZONE.w} 
        height={GOAL_ZONE.h} 
        rx="8" 
        fill="hsla(145, 70%, 50%, 0.1)" 
        stroke="hsl(145, 70%, 40%)" 
        strokeWidth="2" 
        strokeDasharray="4 3"
      />
      <text 
        x={GOAL_ZONE.x} 
        y={GOAL_ZONE.y} 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="10" 
        fontWeight="bold" 
        fill="hsl(145, 80%, 30%)"
        pointerEvents="none"
      >
        🏁 꼴인
      </text>

      {/* Capture Effect */}
      {captureEffect && (
        <g key={captureEffect.id}>
          {/* Shockwaves */}
          <circle cx={captureEffect.x} cy={captureEffect.y} r={10} fill="none" stroke="white" strokeWidth="4">
            <animate attributeName="r" from="10" to="100" dur="0.6s" repeatCount="1" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.6s" repeatCount="1" fill="freeze" />
          </circle>
          <circle cx={captureEffect.x} cy={captureEffect.y} r={15} fill="none" stroke="hsl(0, 100%, 50%)" strokeWidth="8">
            <animate attributeName="r" from="15" to="80" dur="0.8s" repeatCount="1" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="0.8s" repeatCount="1" fill="freeze" />
          </circle>
          <circle cx={captureEffect.x} cy={captureEffect.y} r={20} fill="none" stroke="hsl(45, 100%, 50%)" strokeWidth="4">
            <animate attributeName="r" from="20" to="60" dur="1s" repeatCount="1" fill="freeze" />
            <animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="1" fill="freeze" />
          </circle>
          
          {/* Explosion Text */}
          <text
            x={captureEffect.x}
            y={captureEffect.y}
            fontSize="48"
            textAnchor="middle"
            dominantBaseline="central"
            filter="drop-shadow(0 0 10px rgba(255,0,0,0.5))"
          >
            🔥 💥 🔥
            <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="1" fill="freeze" />
            <animateTransform attributeName="transform" type="scale" from="0.2" to="1.8" dur="0.6s" repeatCount="1" />
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.5s" repeatCount="1" additive="sum" />
          </text>
        </g>
      )}

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
      </g>
    </svg>
  );
};

export default YutBoard;
