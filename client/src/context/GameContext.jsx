// client/src/context/GameContext.jsx
// Central arcade game engine — state, timer, scoring, audio, clues, progressive hints.
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { generateGameChain, MODULE_ORDER, MODULE_LABELS } from '../puzzles/puzzleChains';
import { playSound as _playSound } from '../puzzles/soundManager';
import { api } from '../services/api';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  // ── Core game state ──────────────────────────────────────────
  const [status, setStatus]               = useState('idle'); // idle | playing | completed | game_over
  const [timeLeft, setTimeLeft]           = useState(180);
  const [score, setScore]                 = useState(0);
  const [scorePopups, setScorePopups]     = useState([]); // [{ id, text, type: 'pos'|'neg' }]
  const [chain, setChain]                 = useState(null);
  const [clues, setClues]                 = useState([]);
  const [solvedModules, setSolvedModules] = useState({
    files: false,
    circuit: false,
    memory: false,
    scanner: false,
    assembly: false,
    sync: false,
    core: false,
  });

  // ── Hint System State ─────────────────────────────────────────
  const [hintsUsed, setHintsUsed]                 = useState(0);
  const [hintPenalty, setHintPenalty]             = useState(0);
  const [hintLevelByModule, setHintLevelByModule] = useState({}); // { [mod]: 1|2|3 }
  const [activeHint, setActiveHint]               = useState(null); // { module, level, id, text }
  const [hintCooldownUntil, setHintCooldownUntil] = useState(0); // timestamp

  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [activeModule, setActiveModule]   = useState('files');
  const [sessionId, setSessionId]         = useState(null);
  const [glitchActive, setGlitchActive]   = useState(false);

  const timerRef        = useRef(null);
  const soundEnabledRef = useRef(true);
  const statusRef       = useRef('idle');

  // Keep refs in sync
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // ── Sound ────────────────────────────────────────────────────
  const playSound = useCallback((key, param) => {
    if (soundEnabledRef.current) _playSound(key, param);
  }, []);

  // ── Score Popups ─────────────────────────────────────────────
  const triggerScorePopup = useCallback((points) => {
    const id = Date.now() + Math.random();
    const text = points > 0 ? `+${points}` : `${points}`;
    const type = points > 0 ? 'pos' : 'neg';
    setScorePopups(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  }, []);

  const addScore = useCallback((pts) => {
    if (statusRef.current !== 'playing') return;
    setScore(prev => prev + pts);
    triggerScorePopup(pts);
  }, [triggerScorePopup]);

  const deductScore = useCallback((pts) => {
    if (statusRef.current !== 'playing') return;
    setScore(prev => Math.max(0, prev - pts));
    triggerScorePopup(-pts);
  }, [triggerScorePopup]);

  // ── Timer ────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          if (statusRef.current === 'playing') {
            setStatus('game_over');
          }
          return 0;
        }
        if (next === 60) _playSound('timerWarning');
        if (next === 30) _playSound('timerWarning');
        if (next === 10) _playSound('timerWarning');
        return next;
      });
    }, 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // ── Module State Helper ──────────────────────────────────────
  const getModuleState = useCallback((mod) => {
    if (!chain) return 'LOCKED';
    if (solvedModules[mod]) return 'RESTORED';
    const idx = MODULE_ORDER.indexOf(mod);
    if (idx === 0) return 'ACTIVE';
    if (mod === 'core') {
      const allPrevDone = MODULE_ORDER.filter(m => m !== 'core').every(m => solvedModules[m]);
      return allPrevDone ? 'ACTIVE' : 'LOCKED';
    }
    const prev = MODULE_ORDER[idx - 1];
    return solvedModules[prev] ? 'ACTIVE' : 'LOCKED';
  }, [chain, solvedModules]);

  const getCurrentObjective = useCallback(() => {
    if (!chain) return '';
    const firstUnsolved = MODULE_ORDER.find(m => !solvedModules[m]);
    if (!firstUnsolved) return 'SYSTEM RESTORATION COMPLETE';
    return chain.modules[firstUnsolved]?.objective || 'RESTORE SYSTEM';
  }, [chain, solvedModules]);

  // ── Clue Management ──────────────────────────────────────────
  const addClue = useCallback((clue) => {
    if (!clue) return;
    setClues(prev => {
      if (prev.some(c => c.key === clue.key)) return prev;
      return [...prev, clue];
    });
    addScore(25);
    playSound('clue');
  }, [addScore, playSound]);

  // ── Complete a Module ────────────────────────────────────────
  const completeModule = useCallback((moduleName) => {
    if (statusRef.current !== 'playing') return;
    if (solvedModules[moduleName]) return;

    const newSolved = { ...solvedModules, [moduleName]: true };
    setSolvedModules(newSolved);
    addScore(100);
    playSound('moduleRestored');

    const pData = chain?.modules?.[moduleName];
    if (pData?.clueReward) {
      addClue(pData.clueReward);
    }

    // Auto-advance to next module
    const nextMod = MODULE_ORDER.find(m => !newSolved[m]);
    if (nextMod) {
      setTimeout(() => {
        setActiveModule(nextMod);
      }, 700);
    }
  }, [solvedModules, addScore, playSound, chain, addClue]);

  // ── Progressive 3-Level Hint Architecture ────────────────────
  const getHintCost = useCallback((moduleName) => {
    const curLevel = hintLevelByModule[moduleName] || 0;
    if (curLevel === 0) return 10;
    if (curLevel === 1) return 20;
    return 30;
  }, [hintLevelByModule]);

  const getNextHintLevel = useCallback((moduleName) => {
    const curLevel = hintLevelByModule[moduleName] || 0;
    return Math.min(3, curLevel + 1);
  }, [hintLevelByModule]);

  const requestHint = useCallback((moduleName) => {
    if (statusRef.current !== 'playing' || timeLeft <= 0) {
      return { success: false, reason: 'GAME_OVER' };
    }

    const now = Date.now();
    if (now < hintCooldownUntil) {
      return { success: false, reason: 'COOLDOWN', remainingMs: hintCooldownUntil - now };
    }

    const cost = getHintCost(moduleName);
    if (score < cost) {
      playSound('incorrect');
      return { success: false, reason: 'NO_SCORE', cost };
    }

    const nextLevel = getNextHintLevel(moduleName);

    // Apply cost
    deductScore(cost);
    setHintsUsed(h => h + 1);
    setHintPenalty(p => p + cost);
    setHintLevelByModule(prev => ({
      ...prev,
      [moduleName]: nextLevel,
    }));

    // Trigger audio & cooldown
    playSound('hint');
    setHintCooldownUntil(now + 3500); // 3.5s cooldown

    // Set active visual hint state
    const hintId = Date.now();
    setActiveHint({
      module: moduleName,
      level: nextLevel,
      id: hintId,
    });

    // Auto-clear active visual highlight after 5 seconds
    setTimeout(() => {
      setActiveHint(current => {
        if (current?.id === hintId) return null;
        return current;
      });
    }, 5000);

    return { success: true, level: nextLevel, cost };
  }, [timeLeft, hintCooldownUntil, getHintCost, getNextHintLevel, score, deductScore, playSound]);

  // ── Start Game ───────────────────────────────────────────────
  const startGame = useCallback(async () => {
    stopTimer();
    const seed = Date.now() % 9999991;
    const newChain = generateGameChain(seed);

    setChain(newChain);
    setStatus('playing');
    setTimeLeft(180);
    setScore(0);
    setScorePopups([]);
    setClues([]);
    setSolvedModules({
      files: false,
      circuit: false,
      memory: false,
      scanner: false,
      assembly: false,
      sync: false,
      core: false,
    });
    setHintsUsed(0);
    setHintPenalty(0);
    setHintLevelByModule({});
    setActiveHint(null);
    setHintCooldownUntil(0);
    setActiveModule('files');
    setSessionId(null);

    startTimer();
    playSound('boot');

    try {
      const playerName = `OPERATOR_${seed.toString(36).toUpperCase()}`;
      const { playerId } = await api.registerPlayer(playerName);
      const { sessionId: sid } = await api.startGame(playerId);
      setSessionId(sid);
    } catch {
      // offline fallback
    }
  }, [stopTimer, startTimer, playSound]);

  // ── Finish Game ──────────────────────────────────────────────
  const finishGame = useCallback(async (won) => {
    stopTimer();
    const timeBonus = won ? timeLeft * 2 : 0;
    const finalScore = score + timeBonus;
    setScore(finalScore);
    setStatus(won ? 'completed' : 'game_over');

    if (won) {
      playSound('win');
    } else {
      playSound('incorrect');
    }

    if (sessionId) {
      try {
        await api.completeGame(sessionId, won ? timeLeft : 0);
      } catch {
        // ignore
      }
    }
  }, [stopTimer, timeLeft, score, sessionId, playSound]);

  // ── Glitch Twist Trigger ─────────────────────────────────────
  const triggerGlitch = useCallback(() => {
    setGlitchActive(true);
    playSound('glitch');
    setTimeout(() => setGlitchActive(false), 900);
  }, [playSound]);

  const value = {
    status,
    timeLeft,
    score,
    scorePopups,
    chain,
    clues,
    solvedModules,
    hintsUsed,
    hintPenalty,
    hintLevelByModule,
    activeHint,
    hintCooldownUntil,
    soundEnabled,
    activeModule,
    glitchActive,
    setActiveModule,
    startGame,
    completeModule,
    addClue,
    addScore,
    deductScore,
    getHintCost,
    getNextHintLevel,
    requestHint,
    finishGame,
    triggerGlitch,
    toggleSound: () => setSoundEnabled(p => !p),
    playSound,
    getModuleState,
    getCurrentObjective,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within <GameProvider>');
  return ctx;
}
