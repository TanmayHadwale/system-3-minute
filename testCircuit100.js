// testCircuit100.js
// Programmatic test suite: generates and solves 100 consecutive circuit puzzles.
import { generateSolvableCircuit, evaluateCircuit, getCircuitNextMove } from './client/src/puzzles/circuitEngine.js';

console.log('=== STARTING 100 TILE PUZZLE SOLVABILITY TESTS ===');

let passCount = 0;
let totalMoves = 0;

for (let i = 1; i <= 100; i++) {
  const seed = 1000 + i * 37;
  const puzzle = generateSolvableCircuit(seed);

  // 1. Verify puzzle starts scrambled (unconnected)
  const initialEval = evaluateCircuit(puzzle.tiles);
  if (initialEval.isConnected) {
    console.error(`Test #${i} FAILED: puzzle was already connected at start`);
    process.exit(1);
  }

  // 2. Programmatically solve the puzzle using getCircuitNextMove
  let currentTiles = puzzle.tiles.map(t => ({ ...t }));
  let moves = 0;
  const maxMovesAllowed = 16;

  while (moves < maxMovesAllowed) {
    const nextMove = getCircuitNextMove(currentTiles, puzzle.templatePath, puzzle.solution);
    if (!nextMove) break; // all path tiles aligned

    // Apply the rotation
    currentTiles[nextMove.tileIndex].currentRot = nextMove.neededRot;
    moves += nextMove.movesNeeded;

    const evalResult = evaluateCircuit(currentTiles);
    if (evalResult.isConnected) {
      break;
    }
  }

  const finalEval = evaluateCircuit(currentTiles);
  if (!finalEval.isConnected) {
    console.error(`Test #${i} FAILED: could not solve puzzle within ${maxMovesAllowed} moves`);
    process.exit(1);
  }

  passCount++;
  totalMoves += moves;
}

const avgMoves = (totalMoves / passCount).toFixed(1);
console.log(`✓ 100/100 PUZZLES GENERATED AND SOLVED SUCCESSFULLY!`);
console.log(`✓ Zero unsolvable puzzles.`);
console.log(`✓ Average moves to solve: ${avgMoves} moves (target: 4-8 moves).`);
console.log('=== ALL TESTS PASSED ===');
