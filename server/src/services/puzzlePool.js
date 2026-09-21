// server/src/services/puzzlePool.js
// Minimal stub — puzzle logic has been moved to the frontend.
// The backend only stores the seed and handles leaderboard persistence.

function selectPuzzlesForSession(seed) {
  return {
    puzzles: {},
    liveEvents: [],
    seed,
  };
}

module.exports = { selectPuzzlesForSession };
