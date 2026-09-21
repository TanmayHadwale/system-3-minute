const db = require('../database/db');
const { selectPuzzlesForSession } = require('./puzzlePool');

// Core game settings
const STARTING_SCORE = 1000;
const STARTING_STABILITY = 100;

const SCORE_CORRECT = 200;
const SCORE_CLUE = 100;
const SCORE_WRONG = -100;
const SCORE_HINT = -150;

const STABILITY_CORRECT = 5;
const STABILITY_WRONG = -10;

const MODULES = ['logs', 'database', 'frontend', 'logic', 'core'];

function generateSeed() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class GameService {
  
  static async startSession(playerId) {
    return new Promise((resolve, reject) => {
      const seed = generateSeed();
      const sessionConfig = selectPuzzlesForSession(seed);
      
      const stmt = db.prepare('INSERT INTO game_sessions (player_id, score, stability, status, seed, puzzles) VALUES (?, ?, ?, ?, ?, ?)');
      // Let's bundle liveEvents into the puzzles json to avoid altering schema again.
      const dbPayload = { puzzles: sessionConfig.puzzles, liveEvents: sessionConfig.liveEvents };
      
      stmt.run([playerId, STARTING_SCORE, STARTING_STABILITY, 'in_progress', seed, JSON.stringify(dbPayload)], function(err) {
        if (err) return reject(err);
        
        const sessionId = this.lastID;
        
        // Initialize progress for each module
        const progressStmt = db.prepare('INSERT INTO game_progress (session_id, module, completed, clues) VALUES (?, ?, ?, ?)');
        MODULES.forEach(mod => {
          progressStmt.run([sessionId, mod, 0, '[]']);
        });
        progressStmt.finalize();
        
        GameService.logEvent(sessionId, 'GAME_STARTED', { seed });
        
        resolve({ sessionId, startTime: new Date().toISOString(), seed });
      });
      stmt.finalize();
    });
  }

  static async getSessionState(sessionId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM game_sessions WHERE id = ?', [sessionId], (err, session) => {
        if (err) return reject(err);
        if (!session) return reject(new Error('Session not found'));

        db.all('SELECT * FROM game_progress WHERE session_id = ?', [sessionId], (err, progressRows) => {
          if (err) return reject(err);
          
          db.all('SELECT * FROM game_events WHERE session_id = ? ORDER BY created_at DESC', [sessionId], (err, eventRows) => {
             if (err) return reject(err);
             
             // Format progress
             const progress = {};
             progressRows.forEach(row => {
               progress[row.module] = {
                 completed: Boolean(row.completed),
                 clues: JSON.parse(row.clues || '[]')
               };
             });
             
             // Extract payload
             const dbPayload = JSON.parse(session.puzzles || '{}');
             const puzzlesRaw = dbPayload.puzzles || {};
             const liveEvents = dbPayload.liveEvents || [];
             
             const publicPuzzles = {};
             for (const mod in puzzlesRaw) {
               const p = puzzlesRaw[mod];
               publicPuzzles[mod] = {
                 id: p.id, type: p.type, difficulty: p.difficulty, instructions: p.instructions, data: p.data, clueReward: p.clueReward
               };
             }
             
             resolve({
               session,
               progress,
               events: eventRows,
               puzzles: publicPuzzles,
               liveEvents
             });
          });
        });
      });
    });
  }
  
  static async logEvent(sessionId, eventType, eventData) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO game_events (session_id, event_type, event_data) VALUES (?, ?, ?)', 
        [sessionId, eventType, JSON.stringify(eventData)], 
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  static async updateScoreAndStability(sessionId, scoreChange, stabilityChange) {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE game_sessions SET 
              score = score + ?, 
              stability = MAX(0, MIN(100, stability + ?)) 
              WHERE id = ?`,
        [scoreChange, stabilityChange, sessionId],
        (err) => err ? reject(err) : resolve()
      );
    });
  }
  
  static async addClue(sessionId, module, clueObj) {
    const state = await this.getSessionState(sessionId);
    const modProgress = state.progress[module];
    
    // clueObj is { key, value }
    const clueAlreadyExists = modProgress.clues.some(c => c.key === clueObj.key);
    if (clueAlreadyExists) {
      return { added: false };
    }
    
    const newClues = [...modProgress.clues, clueObj];
    
    return new Promise((resolve, reject) => {
      db.run('UPDATE game_progress SET clues = ? WHERE session_id = ? AND module = ?',
        [JSON.stringify(newClues), sessionId, module],
        async (err) => {
          if (err) return reject(err);
          
          await this.updateScoreAndStability(sessionId, SCORE_CLUE, STABILITY_CORRECT);
          await this.logEvent(sessionId, 'CLUE_DISCOVERED', { module, clueKey: clueObj.key });
          
          resolve({ added: true, clueObj });
        }
      );
    });
  }
  
  static async completeModule(sessionId, module) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE game_progress SET completed = 1 WHERE session_id = ? AND module = ?',
        [sessionId, module],
        async (err) => {
           if (err) return reject(err);
           await this.logEvent(sessionId, 'MODULE_RESTORED', { module });
           resolve();
        }
      );
    });
  }

  static async validatePuzzle(sessionId, module, answer) {
    return new Promise((resolve, reject) => {
      db.get('SELECT puzzles FROM game_sessions WHERE id = ?', [sessionId], async (err, row) => {
         if (err || !row) return reject(err || new Error('Session not found'));
         
         const dbPayload = JSON.parse(row.puzzles);
         const puzzles = dbPayload.puzzles;
         const puzzle = puzzles[module];
         if (!puzzle) return reject(new Error('No puzzle for this module'));
         
         // Support complex checking for paths/sorts if needed, or just exact string match
         const isCorrect = String(answer).toLowerCase() === String(puzzle.solution).toLowerCase();
         
         if (isCorrect) {
           await this.updateScoreAndStability(sessionId, SCORE_CORRECT, STABILITY_CORRECT);
           await this.logEvent(sessionId, 'PUZZLE_SOLVED', { module, puzzleId: puzzle.id });
           await this.completeModule(sessionId, module);
           
           if (puzzle.clueReward) {
              await this.addClue(sessionId, module, puzzle.clueReward);
           }
           
           resolve({ success: true, reward: puzzle.clueReward });
         } else {
           await this.updateScoreAndStability(sessionId, SCORE_WRONG, STABILITY_WRONG);
           await this.logEvent(sessionId, 'PUZZLE_FAILED', { module, puzzleId: puzzle.id, providedAnswer: answer });
           resolve({ success: false });
         }
      });
    });
  }
  
  static async useHint(sessionId, module, hintLevel) {
    await this.updateScoreAndStability(sessionId, SCORE_HINT, 0);
    await this.logEvent(sessionId, 'HINT_USED', { module, hintLevel });
    return { success: true };
  }
  
  static async finishGame(sessionId, timeRemainingSeconds) {
      const state = await this.getSessionState(sessionId);
      const timeBonus = timeRemainingSeconds * 5;
      const finalScore = state.session.score + timeBonus;
      
      return new Promise((resolve, reject) => {
        db.run("UPDATE game_sessions SET status = 'completed', end_time = CURRENT_TIMESTAMP, score = ? WHERE id = ?",
          [finalScore, sessionId],
          (err) => {
            if (err) return reject(err);
            
            GameService.logEvent(sessionId, 'GAME_COMPLETED', { finalScore, timeBonus, timeRemainingSeconds });
            
            // Add to leaderboard
            db.get('SELECT name FROM players WHERE id = ?', [state.session.player_id], (err, player) => {
               if (err || !player) return reject(err || new Error('Player not found'));
               
               db.run('INSERT INTO leaderboard (player_name, score, completion_time) VALUES (?, ?, ?)',
                 [player.name, finalScore, timeRemainingSeconds],
                 (err) => {
                    if (err) return reject(err);
                    resolve({ finalScore, timeBonus });
                 }
               );
            });
          }
        );
      });
  }
}

module.exports = GameService;
