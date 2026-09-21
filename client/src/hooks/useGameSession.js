import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useGameSession() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshState = useCallback(async () => {
    if (!sessionId) return;
    try {
      const state = await api.getSession(sessionId);
      setGameState(state);
    } catch (e) {
      console.error(e);
      // maybe clear session if not found
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      refreshState();
    } else {
      localStorage.removeItem('sessionId');
      setGameState(null);
    }
  }, [sessionId, refreshState]);

  const startSession = async (playerName) => {
    setLoading(true);
    try {
       const { playerId } = await api.registerPlayer(playerName);
       const { sessionId: newSessionId } = await api.startGame(playerId);
       setSessionId(newSessionId);
    } finally {
       setLoading(false);
    }
  };
  
  const submitPuzzle = async (module, answer) => {
      const res = await api.submitPuzzle(sessionId, module, answer);
      setGameState(res.state);
      return res.result;
  };

  const submitAction = async (module, actionType, isCorrect) => {
      const state = await api.submitAction(sessionId, module, actionType, isCorrect);
      setGameState(state);
  };
  
  const submitClue = async (module, clueCode) => {
      const res = await api.submitClue(sessionId, module, clueCode);
      setGameState(res.state);
      return res.result;
  };
  
  const finishGame = async (timeRemaining) => {
      const res = await api.completeGame(sessionId, timeRemaining);
      await refreshState();
      return res;
  };
  
  const clearSession = () => setSessionId(null);

  return {
    sessionId,
    gameState,
    loading,
    startSession,
    refreshState,
    submitPuzzle,
    submitAction,
    submitClue,
    finishGame,
    clearSession
  };
}
