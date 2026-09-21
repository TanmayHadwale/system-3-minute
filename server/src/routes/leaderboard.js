const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/leaderboard - top 10 entries, sorted by score desc, then time desc
router.get('/', (req, res) => {
  const query = 'SELECT player_name, score, completion_time, created_at FROM leaderboard ORDER BY score DESC, completion_time DESC LIMIT 10';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// DELETE /api/leaderboard - clear all entries
router.delete('/', (req, res) => {
  db.run('DELETE FROM leaderboard', [], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Leaderboard cleared successfully', changes: this.changes });
  });
});

// POST /api/leaderboard/clear - clear all entries
router.post('/clear', (req, res) => {
  db.run('DELETE FROM leaderboard', [], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Leaderboard cleared successfully', changes: this.changes });
  });
});

module.exports = router;
