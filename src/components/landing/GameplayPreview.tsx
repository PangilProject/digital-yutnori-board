import React, { useState, useRef } from 'react';
import YutBoard from '@/components/YutBoard';
import { TeamDashboard } from '@/components/board/TeamDashboard';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';
import { Piece, TeamConfig, TeamId } from '@/types/game';

// Preview 전용 더미 데이터
const PREVIEW_TEAMS: TeamConfig[] = [
  { id: 'team0' as TeamId, name: 'Blue Team', color: '#3b82f6', colorLight: '#dbeafe', emoji: '🔵', pieceCount: 4 },
  { id: 'team1' as TeamId, name: 'Red Team', color: '#ef4444', colorLight: '#fee2e2', emoji: '🔴', pieceCount: 4 },
];

const INITIAL_PIECES: Piece[] = [
  { id: 'p0', team: 'team0', nodeId: 'n1', isFinished: false },
  { id: 'p1', team: 'team0', nodeId: null, isFinished: false },
  { id: 'p2', team: 'team1', nodeId: 'n12', isFinished: false },
  { id: 'p3', team: 'team1', nodeId: null, isFinished: false },
];

export const GameplayPreview = () => {
  const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
  const [currentTurn, setCurrentTurn] = useState<string>('team0');
  const svgRef = useRef<SVGSVGElement>(null);

  // 실제 게임 로직 훅을 프리뷰 데이터로 초기화
  const handleMovePiece = (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => {
    setPieces(prev => prev.map(p => {
      if (p.id === pieceId) {
        if (isGoalMove) return { ...p, nodeId: null, isFinished: true };
        return { ...p, nodeId: targetNodeId };
      }
      return p;
    }));
  };

  const logic = useYutBoardLogic(pieces, PREVIEW_TEAMS, handleMovePiece, currentTurn);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
      {/* Dashboard Area */}
      <div className="w-full lg:w-72 flex flex-col gap-4 animate-in slide-in-from-left-10 duration-1000">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-2">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Interactive Demo</p>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            아래 대시보드에서 말을 꺼내 보드판으로 직접 드래그해보세요! 
          </p>
        </div>
        
        <TeamDashboard 
          team={PREVIEW_TEAMS[0]} 
          pieces={pieces} 
          isCurrentTurn={currentTurn === 'team0'}
          onNextTurn={() => setCurrentTurn('team1')}
          onSelectPiece={id => logic.setters.setSelectedPieceId(id)}
          selectedPieceId={logic.states.selectedPieceId}
          onMoveOption={(id, steps) => {
            const path = logic.helpers.getMovementPath(pieces.find(p => p.id === id)?.nodeId || null, steps);
            logic.setters.setAnimatingPiece({ id, path, currentIndex: 0 });
          }}
          onDragStart={(id, e) => {
            const pos = logic.helpers.clientToSVG(e.clientX, e.clientY, svgRef.current);
            logic.setters.setDrag({ pieceId: id, currentX: pos.x, currentY: pos.y });
          }}
        />
      </div>

      {/* Board Area */}
      <div className="flex-1 relative p-4 md:p-8 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10">
          <YutBoard 
            pieces={pieces} 
            teams={PREVIEW_TEAMS} 
            onMovePiece={handleMovePiece}
            currentTurn={currentTurn}
            logic={logic}
            svgRef={svgRef}
          />
        </div>

        {/* Floating Instruction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-sm font-bold text-white whitespace-nowrap">보드 위에서 말을 자유롭게 움직여보세요</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameplayPreview;
