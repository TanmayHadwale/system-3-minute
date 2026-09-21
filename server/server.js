require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Init DB
require('./src/database/db');

// Routes
const playersRouter = require('./src/routes/players');
const gameRouter = require('./src/routes/game');
const leaderboardRouter = require('./src/routes/leaderboard');

app.use('/api/players', playersRouter);
app.use('/api/game', gameRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
