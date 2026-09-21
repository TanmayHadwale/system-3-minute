const express = require('express');
const router = express.Router();
const db = require('../database/db');

// POST /api/players - create/register a player
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Valid name is required' });
  }

  const stmt = db.prepare('INSERT INTO players (name) VALUES (?)');
  stmt.run([name.trim()], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ playerId: this.lastID });
  });
  stmt.finalize();
});

module.exports = router;
