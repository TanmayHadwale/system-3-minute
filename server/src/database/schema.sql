CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER REFERENCES players(id),
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  score INTEGER DEFAULT 1000,
  stability INTEGER DEFAULT 100,
  status TEXT DEFAULT 'in_progress', -- in_progress | completed | collapsed
  seed TEXT,
  puzzles TEXT
);

CREATE TABLE IF NOT EXISTS game_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER REFERENCES game_sessions(id),
  module TEXT NOT NULL,           -- frontend | database | logic | logs | core
  completed BOOLEAN DEFAULT 0,
  clues TEXT DEFAULT '[]',        -- JSON array of clue codes found in this module
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER REFERENCES game_sessions(id),
  event_type TEXT NOT NULL,       -- correct_action | wrong_action | hint_used | clue_found | module_restored
  event_data TEXT,                -- JSON blob with details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  completion_time INTEGER,        -- seconds remaining
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
