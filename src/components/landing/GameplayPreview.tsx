import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import YutBoard from '@/components/YutBoard';
import { TeamDashboard } from '@/components/board/TeamDashboard';
import { useYutBoardLogic } from '@/hooks/useYutBoardLogic';
import { Piece, TeamConfig, TeamId } from '@/types/game';

// Preview 전용 더미 데이터
import CaptureNarrator from '@/components/board/CaptureNarrator';

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
  const [isDemoEnded, setIsDemoEnded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  const [lastCapture, setLastCapture] = useState<{capturingTeam: string, capturedTeam: string, count: number, id: string} | null>(null);
  
  // 실제 게임 로직 훅을 프리뷰 데이터로 초기화
  const handleMovePiece = (pieceId: string, targetNodeId: string | null, isGoalMove?: boolean) => {
    if (isDemoEnded) return;

    setPieces(prev => {
      const movedPiece = prev.find(p => p.id === pieceId);
      if (!movedPiece) return prev;

      // 1. 이동 처리
      let newPieces = prev.map(p => {
        if (p.id === pieceId) {
          if (isGoalMove) return { ...p, nodeId: null, isFinished: true };
          return { ...p, nodeId: targetNodeId };
        }
        return p;
      });

      // 2. 잡기 처리 (일반 이동일 때만)
      if (targetNodeId && !isGoalMove) {
        const opponentPieces = newPieces.filter(p => 
          p.nodeId === targetNodeId && 
          p.team !== movedPiece.team && 
          !p.isFinished
        );

        if (opponentPieces.length > 0) {
          // 잡힌 말들 대기소로 보내기
          newPieces = newPieces.map(p => 
            opponentPieces.some(op => op.id === p.id) ? { ...p, nodeId: null } : p
          );
          
          // 이펙트 트리거
          const capturedTeamId = opponentPieces[0].team;
          const capturingTeam = PREVIEW_TEAMS.find(t => t.id === movedPiece.team);
          const capturedTeam = PREVIEW_TEAMS.find(t => t.id === capturedTeamId);
          
          setLastCapture({
            capturingTeam: capturingTeam?.name || 'Blue Team',
            capturedTeam: capturedTeam?.name || 'Red Team',
            count: opponentPieces.length,
            id: `preview-capture-${Date.now()}`
          });
        }
      }

      return newPieces;
    });
  };

  const logic = useYutBoardLogic(pieces, PREVIEW_TEAMS, handleMovePiece, currentTurn);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full relative">
      {/* Dashboard Area */}
      <div className={cn(
        "w-full lg:w-72 flex flex-col gap-4 transition-all duration-700",
        isDemoEnded ? "opacity-40 grayscale pointer-events-none" : "animate-in slide-in-from-left-10"
      )}>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md mb-2">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Interactive Demo</p>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            아래 대시보드에서 말을 꺼내 보드판으로 직접 드래그해보세요! <span className="text-white font-bold">파란말</span>로 <span className="text-red-400 font-bold">빨간말</span>을 잡아보세요.
          </p>
        </div>
        
        <TeamDashboard 
          team={PREVIEW_TEAMS[0]} 
          pieces={pieces} 
          isCurrentTurn={currentTurn === 'team0'}
          onNextTurn={() => setIsDemoEnded(true)}
          onSelectPiece={id => !isDemoEnded && logic.setters.setSelectedPieceId(id)}
          selectedPieceId={logic.states.selectedPieceId}
          onMoveOption={(id, steps) => {
            if (isDemoEnded) return;
            const path = logic.helpers.getMovementPath(pieces.find(p => p.id === id)?.nodeId || null, steps);
            logic.setters.setAnimatingPiece({ id, path, currentIndex: 0 });
            // Ensure any lingering drag state is cleared
            logic.setters.setDrag(null);
          }}
          onDragStart={(id, e) => {
            if (isDemoEnded) return;
            const pos = logic.helpers.clientToSVG(e.clientX, e.clientY, svgRef.current);
            logic.setters.setDrag({ pieceId: id, currentX: pos.x, currentY: pos.y });
          }}
        />
      </div>

      {/* Board Area */}
      <div className="flex-1 relative p-4 md:p-8 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden group">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />
        
        <div className={cn("relative z-10 transition-all duration-1000", isDemoEnded && "blur-sm grayscale opacity-30")}>
          <YutBoard 
            pieces={pieces} 
            teams={PREVIEW_TEAMS} 
            onMovePiece={handleMovePiece}
            currentTurn={currentTurn}
            logic={logic}
            svgRef={svgRef}
          />
        </div>

        {/* Floating Instruction / Demo Ended Overlay */}
        {!isDemoEnded ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-sm font-bold text-white whitespace-nowrap">보드 위에서 말을 자유롭게 움직여보세요</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 bg-slate-950/20 backdrop-blur-[2px]">
            <div className="p-8 rounded-[2.5rem] bg-white text-slate-900 shadow-2xl flex flex-col items-center text-center gap-4 border-4 border-blue-500/20">
              <span className="text-4xl text-blue-500">🎮</span>
              <div>
                <h3 className="text-2xl font-black tracking-tighter mb-1">체험판 종료</h3>
                <p className="text-sm font-medium text-slate-500 leading-tight">
                  이제 실제 게임에서 <br />모든 기능을 경험해보세요!
                </p>
              </div>
              <Button 
                onClick={() => navigate('/setup')} 
                className="h-12 px-8 font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
              >
                진짜 게임 시작하기
              </Button>
              <button 
                onClick={() => {
                  setPieces(INITIAL_PIECES);
                  setCurrentTurn('team0');
                  setIsDemoEnded(false);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 underline underline-offset-4"
              >
                한 번 더 체험하기
              </button>
            </div>
          </div>
        )}
        
        {/* Capture Effect Overlay for Preview */}
        {lastCapture && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            <CaptureNarrator {...lastCapture} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameplayPreview;
