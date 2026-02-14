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
  const finishedPieces = teamPieces.filter(p => p.isFinished);
  const activePieces = teamPieces.filter(p => p.nodeId !== null && !p.isFinished);
  const waitingPieces = teamPieces.filter(p => p.nodeId === null && !p.isFinished);
  
  const totalCount = teamPieces.length;
  const finishedCount = finishedPieces.length;

  return (
    <div 
      className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all duration-500 ${
        isCurrentTurn 
          ? 'bg-background shadow-xl scale-[1.02] z-10' 
          : 'bg-muted/30 opacity-80 border-transparent'
      }`}
      style={{ 
        borderColor: isCurrentTurn ? team.color : `${team.color}10`,
        boxShadow: isCurrentTurn ? `0 10px 30px ${team.color}20` : 'none'
      }}
    >
      {/* Header: Name and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-muted/50 text-xl shadow-sm">
            {team.emoji}
          </div>
          <div>
            <h3 className="font-black text-base tracking-tight leading-tight" style={{ color: team.color }}>
              {team.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={12} className="text-green-600" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {finishedCount} / {totalCount} 골인
              </span>
            </div>
          </div>
        </div>
        {isCurrentTurn && (
          <Badge className="bg-primary hover:bg-primary shadow-md animate-pulse px-2 py-0.5 font-black text-[9px] uppercase">
            Turn
          </Badge>
        )}
      </div>

      {/* Piece Status Lists */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        {/* Waiting Pieces */}
        <div className="bg-muted/20 p-2 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-all">
          <div className="flex items-center gap-1 mb-1.5">
            <Home size={12} className="text-muted-foreground" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">대기 중</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {waitingPieces.length > 0 ? (
              waitingPieces.map((p) => (
                <div 
                  key={p.id} 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-white/50"
                  style={{ backgroundColor: team.colorLight }}
                >
                  {team.emoji}
                </div>
              ))
            ) : (
              <span className="text-[9px] text-muted-foreground/50 font-medium">없음</span>
            )}
          </div>
        </div>

        {/* Active Pieces */}
        <div className="bg-primary/5 p-2 rounded-lg border border-primary/5 hover:border-primary/10 transition-all">
          <div className="flex items-center gap-1 mb-1.5">
            <PlayCircle size={12} className="text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">활동 중</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activePieces.length > 0 ? (
              activePieces.map((p) => (
                <div 
                  key={p.id} 
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-white/50"
                  style={{ backgroundColor: team.color, color: 'white' }}
                  title={`위치: ${p.nodeId}`}
                >
                  {team.emoji}
                </div>
              ))
            ) : (
              <span className="text-[9px] text-primary/30 font-medium">없음</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {isCurrentTurn && onNextTurn && (
        <Button 
          onClick={onNextTurn} 
          className="w-full font-black text-sm h-10 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] rounded-lg flex items-center justify-center gap-1.5 mt-1"
          style={{ 
            backgroundColor: team.color, 
            boxShadow: `0 4px 15px ${team.color}30` 
          }}
        >
          턴 넘기기 <ChevronRight size={18} />
        </Button>
      )}
    </div>
  );
};
