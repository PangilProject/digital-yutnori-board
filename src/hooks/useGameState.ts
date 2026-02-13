import { useState, useCallback, useEffect } from 'react';
import { GameState, Piece, TeamConfig, TeamId } from '@/types/game';
import { getNodeById } from '@/data/boardNodes';

const STORAGE_KEY = 'yutnori-game-state';

function loadState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function createInitialPieces(teams: TeamConfig[]): Piece[] {
  const pieces: Piece[] = [];
  teams.forEach(team => {
    for (let i = 0; i < team.pieceCount; i++) {
      pieces.push({ id: `${team.id}-${i}`, team: team.id, nodeId: null });
    }
  });
  return pieces;
}

export function initializeGame(teams: TeamConfig[]): GameState {
  const teamNames = teams.map(t => t.name).join(' vs ');
  const state: GameState = {
    teams,
    pieces: createInitialPieces(teams),
    logs: [`🎮 게임 시작! ${teamNames}`],
    currentTurn: teams[0].id,
  };
  saveState(state);
  return state;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(() => loadState());

  useEffect(() => {
    if (gameState) saveState(gameState);
  }, [gameState]);

  const getTeam = useCallback((teamId: TeamId, state: GameState): TeamConfig | undefined => {
    return state.teams.find(t => t.id === teamId);
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const currentIndex = prev.teams.findIndex(t => t.id === prev.currentTurn);
      const nextIndex = (currentIndex + 1) % prev.teams.length;
      const nextTeam = prev.teams[nextIndex];
      return {
        ...prev,
        currentTurn: nextTeam.id,
        logs: [...prev.logs, `👋 ${nextTeam.emoji} ${nextTeam.name}의 차례입니다.`],
      };
    });
  }, []);

  const movePiece = useCallback((pieceId: string, targetNodeId: string | null, isGoalMove: boolean = false) => {
    setGameState(prev => {
      if (!prev) return prev;
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece) return prev;
      
      // Block moves if it's not the team's turn
      if (piece.team !== prev.currentTurn) {
        return {
          ...prev,
          logs: [...prev.logs, `⚠️ 현재는 ${prev.teams.find(t => t.id === prev.currentTurn)?.name}의 차례입니다!`],
        };
      }

      // Identify all pieces in the stack (same team, same node)
      // Special: If at home (nodeId null), only move one piece at a time
      const stackPieces = piece.nodeId === null 
        ? [piece]
        : prev.pieces.filter(p => 
            p.team === piece.team && 
            p.nodeId === piece.nodeId && 
            !p.isFinished
          );
      const stackIds = stackPieces.map(p => p.id);
      const stackCount = stackPieces.length;

      const team = getTeam(piece.team, prev);
      const pieceNum = stackCount > 1 
        ? `${stackCount}개의 말` 
        : `${parseInt(stackIds[0].split('-')[1]) + 1}번 말`;
      
      let targetLabel = '';
      if (isGoalMove) {
        targetLabel = '🏁 골인!';
      } else {
        targetLabel = targetNodeId
          ? (getNodeById(targetNodeId)?.label || targetNodeId)
          : '대기석';
      }

      const logs = [...prev.logs];
      logs.push(`${team?.emoji || ''} ${team?.name || piece.team} ${pieceNum} → ${targetLabel}`);

      if (isGoalMove) {
        const updatedPieces = prev.pieces.map(p =>
          stackIds.includes(p.id) ? { ...p, nodeId: null, isFinished: true } : p
        );
        return { ...prev, pieces: updatedPieces, logs };
      }

      // Capture: send opponent pieces at this node back home
      let updatedPieces = prev.pieces.map(p =>
        stackIds.includes(p.id) ? { ...p, nodeId: targetNodeId } : p
      );

      if (targetNodeId) {
        const capturedPieces = updatedPieces.filter(
          p => p.nodeId === targetNodeId && p.team !== piece.team && !p.isFinished
        );
        if (capturedPieces.length > 0) {
          const capturedTeams = new Set(capturedPieces.map(p => p.team));
          capturedTeams.forEach(capturedTeamId => {
            const capturedTeam = getTeam(capturedTeamId, prev);
            const count = capturedPieces.filter(p => p.team === capturedTeamId).length;
            logs.push(`💥 ${team?.name}이(가) ${capturedTeam?.name}의 말 ${count}개를 잡았습니다!`);
          });
          updatedPieces = updatedPieces.map(p =>
            capturedPieces.some(cp => cp.id === p.id) ? { ...p, nodeId: null } : p
          );
        }
      }

      return { ...prev, pieces: updatedPieces, logs };
    });
  }, [getTeam]);

  const resetGame = useCallback(() => {
    clearGameState();
    setGameState(null);
  }, []);

  return { gameState, setGameState, movePiece, nextTurn, resetGame };
}
