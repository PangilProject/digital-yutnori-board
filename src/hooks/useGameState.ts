import { useState, useCallback, useEffect } from 'react';
import { GameState, Piece, TeamConfig } from '@/types/game';
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

function createInitialPieces(blueCount: number, redCount: number): Piece[] {
  const pieces: Piece[] = [];
  for (let i = 0; i < blueCount; i++) {
    pieces.push({ id: `blue-${i}`, team: 'blue', nodeId: null });
  }
  for (let i = 0; i < redCount; i++) {
    pieces.push({ id: `red-${i}`, team: 'red', nodeId: null });
  }
  return pieces;
}

export function initializeGame(blueTeam: TeamConfig, redTeam: TeamConfig): GameState {
  const state: GameState = {
    blueTeam,
    redTeam,
    pieces: createInitialPieces(blueTeam.pieceCount, redTeam.pieceCount),
    logs: [`게임 시작! ${blueTeam.name} vs ${redTeam.name}`],
  };
  saveState(state);
  return state;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(() => loadState());

  useEffect(() => {
    if (gameState) saveState(gameState);
  }, [gameState]);

  const movePiece = useCallback((pieceId: string, targetNodeId: string | null) => {
    setGameState(prev => {
      if (!prev) return prev;
      const piece = prev.pieces.find(p => p.id === pieceId);
      if (!piece) return prev;
      if (piece.nodeId === targetNodeId) return prev;

      const teamName = piece.team === 'blue' ? prev.blueTeam.name : prev.redTeam.name;
      const pieceNum = parseInt(pieceId.split('-')[1]) + 1;
      const targetLabel = targetNodeId
        ? (getNodeById(targetNodeId)?.label || targetNodeId)
        : '대기석';

      const logEntry = `${teamName} ${pieceNum}번 말 → ${targetLabel}`;

      return {
        ...prev,
        pieces: prev.pieces.map(p =>
          p.id === pieceId ? { ...p, nodeId: targetNodeId } : p
        ),
        logs: [...prev.logs, logEntry],
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    clearGameState();
    setGameState(null);
  }, []);

  return { gameState, setGameState, movePiece, resetGame };
}
