const express = require('express');
const router = express.Router();
const GameService = require('../services/gameService');

// Middleware to check session
const validateSession = async (req, res, next) => {
  const sessionId = req.params.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
  
  try {
    const state = await GameService.getSessionState(sessionId);
    if (state.session.status !== 'in_progress') {
       return res.status(400).json({ error: 'Session is not in progress' });
    }
    req.gameState = state;
    next();
  } catch (err) {
    res.status(404).json({ error: 'Session not found' });
  }
};

router.post('/start', async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'Player ID required' });
    
    const result = await GameService.startSession(playerId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const state = await GameService.getSessionState(req.params.sessionId);
    res.json(state);
  } catch (err) {
    res.status(404).json({ error: 'Session not found' });
  }
});

router.post('/:sessionId/action', validateSession, async (req, res) => {
  try {
    const { module, actionType, isCorrect } = req.body;
    
    // Generic action endpoint (e.g. clicking irrelevant log line)
    // For puzzle submission, use /puzzle
    if (isCorrect !== undefined) {
       const scoreChange = isCorrect ? 50 : -100;
       const stabChange = isCorrect ? 5 : -10;
       await GameService.updateScoreAndStability(req.params.sessionId, scoreChange, stabChange);
       await GameService.logEvent(req.params.sessionId, isCorrect ? 'correct_action' : 'wrong_action', { module, actionType });
    } else {
       await GameService.logEvent(req.params.sessionId, 'generic_action', { module, actionType });
    }
    
    const newState = await GameService.getSessionState(req.params.sessionId);
    res.json(newState);
  } catch (err) {
    res.status(500).json({ error: 'Action failed' });
  }
});

router.post('/:sessionId/puzzle', validateSession, async (req, res) => {
  try {
    const { module, answer } = req.body;
    if (!module || !answer) return res.status(400).json({ error: 'Module and answer required' });
    
    const result = await GameService.validatePuzzle(req.params.sessionId, module, answer);
    const newState = await GameService.getSessionState(req.params.sessionId);
    
    res.json({ result, state: newState });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:sessionId/clue', validateSession, async (req, res) => {
  try {
    const { clueCode, module } = req.body;
    if (!clueCode || !module) return res.status(400).json({ error: 'Clue code and module required' });
    
    const result = await GameService.addClue(req.params.sessionId, module, clueCode);
    const newState = await GameService.getSessionState(req.params.sessionId);
    
    res.json({ result, state: newState });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add clue' });
  }
});

router.post('/:sessionId/hint', validateSession, async (req, res) => {
  try {
    const { module, hintLevel } = req.body;
    
    await GameService.useHint(req.params.sessionId, module, hintLevel);
    const newState = await GameService.getSessionState(req.params.sessionId);
    
    res.json({ state: newState });
  } catch (err) {
    res.status(500).json({ error: 'Failed to use hint' });
  }
});

router.post('/:sessionId/complete', validateSession, async (req, res) => {
  try {
    const { timeRemaining } = req.body;
    
    const result = await GameService.finishGame(req.params.sessionId, timeRemaining || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete game' });
  }
});

module.exports = router;
