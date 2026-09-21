const API_BASE = 'http://localhost:3001/api';

export const api = {
  async registerPlayer(name) {
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to register');
    return res.json();
  },

  async startGame(playerId) {
    const res = await fetch(`${API_BASE}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId })
    });
    if (!res.ok) throw new Error('Failed to start');
    return res.json();
  },

  async getSession(sessionId) {
    const res = await fetch(`${API_BASE}/game/${sessionId}`);
    if (!res.ok) throw new Error('Failed to get session');
    return res.json();
  },

  async submitAction(sessionId, module, actionType, isCorrect) {
    const res = await fetch(`${API_BASE}/game/${sessionId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, actionType, isCorrect })
    });
    return res.json();
  },

  async submitPuzzle(sessionId, module, answer) {
    const res = await fetch(`${API_BASE}/game/${sessionId}/puzzle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, answer })
    });
    return res.json();
  },
  
  async submitClue(sessionId, module, clueCode) {
    const res = await fetch(`${API_BASE}/game/${sessionId}/clue`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ module, clueCode })
    });
    return res.json();
  },
  
  async useHint(sessionId, module, hintLevel) {
     const res = await fetch(`${API_BASE}/game/${sessionId}/hint`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ module, hintLevel })
     });
     return res.json();
  },

  async completeGame(sessionId, timeRemaining) {
    const res = await fetch(`${API_BASE}/game/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeRemaining })
    });
    return res.json();
  },
  
  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return res.json();
  },

  async clearLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      // Fallback to POST /clear
      const fallback = await fetch(`${API_BASE}/leaderboard/clear`, {
        method: 'POST',
      });
      return fallback.json();
    }
    return res.json();
  }
};
