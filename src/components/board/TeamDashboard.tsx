import React from 'react';
import { TeamConfig, Piece } from "@/types/game";
import { Badge } from "@/components/ui/badge";
import { Home, PlayCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TeamDashboardProps {
  team: TeamConfig;
  pieces: Piece[];
  isCurrentTurn: boolean;
  onNextTurn?: () => void;
  onSelectPiece?: (pieceId: string) => void;
  selectedPieceId?: string | null;
  onMoveOption?: (pieceId: string, steps: number) => void;
  onDragStart?: (pieceId: string, event: React.PointerEvent) => void;
}

export const TeamDashboard = ({ 
  team, 
  pieces, 
  isCurrentTurn, 
  onNextTurn,
  onSelectPiece,
  selectedPieceId,
  onMoveOption,
  onDragStart
}: TeamDashboardProps) => {
  const teamPieces = pieces.filter(p => p.team === team.id);
  const finishedPieces = teamPieces.filter(p => p.isFinished);
  const activePieces = teamPieces.filter(p => p.nodeId !== null && !p.isFinished);
  const waitingPieces = teamPieces.filter(p => p.nodeId === null && !p.isFinished);
  
  const totalCount = teamPieces.length;
  const finishedCount = finishedPieces.length;

  const moveOptions = [
    { label: '도', steps: 1, color: 'hsl(200, 70%, 50%)' },
    { label: '개', steps: 2, color: 'hsl(180, 70%, 45%)' },
    { label: '걸', steps: 3, color: 'hsl(150, 70%, 40%)' },
    { label: '윷', steps: 4, color: 'hsl(45, 90%, 50%)' },
    { label: '모', steps: 5, color: 'hsl(25, 90%, 50%)' },
    { label: '빽', steps: -1, color: 'hsl(0, 0%, 40%)' },
  ];

  return (
    <div 
      className={`flex flex-col gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl border-2 transition-all duration-500 ${
        isCurrentTurn 
          ? 'bg-background shadow-xl scale-[1.02] z-10' 
          : 'bg-white/5 border-white/10'
      }`}
      style={{ 
        borderColor: isCurrentTurn ? team.color : 'rgba(255,255,255,0.1)',
        boxShadow: isCurrentTurn ? `0 10px 30px ${team.color}20` : 'none'
      }}
    >
      {/* Header: Name and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-muted/50 text-lg lg:text-xl shadow-sm">
            {team.emoji}
          </div>
          <div>
            <h3 className="font-black text-sm lg:text-base tracking-tight leading-tight" style={{ color: isCurrentTurn ? team.color : 'white' }}>
              {team.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={10} className="text-green-600 lg:w-3 lg:h-3" />
              <span className="text-[9px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {finishedCount} / {totalCount} 골인
              </span>
            </div>
          </div>
        </div>
        {isCurrentTurn && (
          <Badge className="bg-primary hover:bg-primary shadow-md animate-pulse px-2 py-0.5 font-black text-[9px] lg:text-[10px] uppercase">
            Turn
          </Badge>
        )}
      </div>

      {/* Piece Status Lists */}
      <div className="grid grid-cols-2 gap-2 mt-0.5 lg:mt-1">
        {/* Waiting Pieces (Not yet out) */}
        <div className="bg-muted/20 p-1.5 lg:p-2 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-all">
          <div className="flex items-center gap-1 mb-1 lg:mb-1.5">
            <Home size={10} className="text-gray-400 lg:w-3 lg:h-3" />
            <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-tighter">안 나온 말</span>
          </div>
          <div className="flex flex-wrap gap-1 lg:gap-1.5 relative">
            {waitingPieces.length > 0 ? (
              waitingPieces.map((p) => (
                <div key={p.id} className="relative">
                  <Popover 
                    open={selectedPieceId === p.id && isCurrentTurn} 
                    onOpenChange={(open) => {
                      if (!open) onSelectPiece?.(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button 
                        onPointerDown={(e) => isCurrentTurn && onDragStart?.(p.id, e)}
                        onClick={() => isCurrentTurn && onSelectPiece?.(p.id)}
                        disabled={!isCurrentTurn}
                        className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center text-xs lg:text-sm shadow-sm border-2 transition-all ${
                          selectedPieceId === p.id 
                          ? 'scale-110 border-primary shadow-md ring-2 ring-primary/20 ring-offset-1' 
                          : 'border-white/50 hover:scale-105 active:scale-95'
                        } ${!isCurrentTurn ? 'cursor-not-allowed grayscale' : ''}`}
                        style={{ backgroundColor: team.colorLight }}
                      >
                        {team.emoji}
                      </button>
                    </PopoverTrigger>

                    <PopoverContent 
                      className="w-auto p-0 border-none bg-transparent shadow-none" 
                      side="top" 
                      sideOffset={8}
                    >
                      <div className="animate-in fade-in zoom-in-95 duration-200 origin-bottom">
                        <div className="bg-white p-1 rounded-xl shadow-2xl border-2 border-primary/20 flex gap-1 whitespace-nowrap min-w-[150px] lg:min-w-[180px] justify-center backdrop-blur-md bg-white/95">
                          {moveOptions.map((opt) => (
                            <button
                              key={opt.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveOption?.(p.id, opt.steps);
                              }}
                              className="w-6 h-6 lg:w-7 lg:h-7 rounded-full text-[9px] lg:text-[10px] font-black flex items-center justify-center text-white shadow-sm hover:scale-110 active:scale-90 transition-transform"
                              style={{ backgroundColor: opt.color }}
                            >
                              {opt.label}
                            </button>
                          ))}
                          {/* Arrow */}
                          <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/95" />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))
            ) : (
              <span className="text-[8px] lg:text-[9px] text-muted-foreground/50 font-medium tracking-tight">모든 말 출발</span>
            )}
          </div>
        </div>

        {/* Active Pieces (Count Only) */}
        <div className="bg-primary/5 p-1.5 lg:p-2 rounded-lg border border-primary/5 hover:border-primary/10 transition-all flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 mb-0.5 lg:mb-1">
            <PlayCircle size={10} className="text-primary lg:w-3 lg:h-3" />
            <span className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-tighter">말판 위</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg lg:text-xl font-black text-primary leading-none">
              {activePieces.length}
            </span>
            <span className="text-[9px] lg:text-[10px] font-bold text-primary/60">동</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {isCurrentTurn && (
        <Button 
          onClick={onNextTurn} 
          disabled={!onNextTurn}
          className="w-full font-black text-xs lg:text-sm h-9 lg:h-10 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] rounded-lg flex items-center justify-center gap-1 lg:gap-1.5 mt-0.5 lg:mt-1"
          style={{ 
            backgroundColor: team.color, 
            boxShadow: `0 4px 15px ${team.color}30` 
          }}
        >
          턴 넘기기 <ChevronRight size={14} className="lg:w-[18px] lg:h-[18px]" />
        </Button>
      )}
    </div>
  );
};
