import React from 'react';
import { TeamConfig, Piece } from "@/types/game";
import { Badge } from "@/components/ui/badge";
import { Home, PlayCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamDashboardProps {
  team: TeamConfig;
  pieces: Piece[];
  isCurrentTurn: boolean;
  onNextTurn?: () => void;
}

export const TeamDashboard = ({ team, pieces, isCurrentTurn, onNextTurn }: TeamDashboardProps) => {
  const teamPieces = pieces.filter(p => p.team === team.id);
  const finishedCount = teamPieces.filter(p => p.isFinished).length;
  const onBoardCount = teamPieces.filter(p => p.nodeId !== null && !p.isFinished).length;
  const homeCount = teamPieces.length - finishedCount - onBoardCount;
  const totalCount = teamPieces.length;
  const progress = totalCount > 0 ? (finishedCount / totalCount) * 100 : 0;

  return (
    <div 
      className={`flex flex-col gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
        isCurrentTurn 
          ? 'bg-background shadow-2xl scale-[1.03] z-10 border-opacity-100' 
          : 'bg-muted/40 opacity-70 border-transparent grayscale-[0.3]'
      }`}
      style={{ 
        borderColor: isCurrentTurn ? team.color : `${team.color}15`,
        boxShadow: isCurrentTurn ? `0 15px 40px ${team.color}25` : 'none'
      }}
    >
      {/* Header: Name and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted/50 text-2xl shadow-sm">
            {team.emoji}
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tight" style={{ color: team.color }}>
              {team.name}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
              Team Dashboard
            </p>
          </div>
        </div>
        {isCurrentTurn && (
          <Badge className="bg-primary hover:bg-primary shadow-lg animate-bounce px-3 py-1 font-black text-xs">
            현재 차례
          </Badge>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
            Game Progress
          </span>
          <span className="text-sm font-black italic" style={{ color: team.color }}>
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full transition-all duration-1000 ease-in-out relative" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: team.color 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* Piece Counts Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="group flex flex-col items-center p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-all hover:bg-muted/50">
          <Home size={18} className="text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-black leading-none mb-1">{homeCount}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">대기중</span>
        </div>
        <div className="group flex flex-col items-center p-3 rounded-2xl bg-primary/5 border border-primary/5 hover:border-primary/20 transition-all hover:bg-primary/10">
          <PlayCircle size={18} className="text-primary mb-2 group-hover:rotate-12 transition-transform" />
          <span className="text-lg font-black leading-none mb-1 text-primary">{onBoardCount}</span>
          <span className="text-[10px] font-bold text-primary/70 uppercase tracking-tighter">활동중</span>
        </div>
        <div className="group flex flex-col items-center p-3 rounded-2xl bg-green-500/5 border border-green-500/5 hover:border-green-500/20 transition-all hover:bg-green-500/10">
          <CheckCircle2 size={18} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-black leading-none mb-1 text-green-600">{finishedCount}</span>
          <span className="text-[10px] font-bold text-green-600/70 uppercase tracking-tighter">골인!</span>
        </div>
      </div>

      {/* Optional: Simple list of pieces on board could go here if requested, 
          but grid view is cleaner for a dashboard. */}

      {/* Action Button */}
      {isCurrentTurn && onNextTurn && (
        <Button 
          onClick={onNextTurn} 
          className="mt-2 w-full font-black text-lg h-12 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] rounded-xl flex items-center justify-center gap-2"
          style={{ 
            backgroundColor: team.color, 
            boxShadow: `0 8px 25px ${team.color}40` 
          }}
        >
          턴 넘기기 <ChevronRight size={22} />
        </Button>
      )}
    </div>
  );
};
