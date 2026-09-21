// client/src/puzzles/circuitEngine.js
// Guaranteed-solvable circuit puzzle generation, validation, and hint engine.

// Directions: 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
export const DIR_UP = 0;
export const DIR_RIGHT = 1;
export const DIR_DOWN = 2;
export const DIR_LEFT = 3;

export function getTilePorts(type, rot) {
  const normRot = ((rot % 360) + 360) % 360;

  if (type === 'cross') return [true, true, true, true];

  if (type === 'straight') {
    if (normRot === 0 || normRot === 180) {
      return [true, false, true, false]; // UP & DOWN
    }
    return [false, true, false, true]; // LEFT & RIGHT
  }

  if (type === 'corner') {
    if (normRot === 0)   return [true, true, false, false];   // UP & RIGHT
    if (normRot === 90)  return [false, true, true, false];  // RIGHT & DOWN
    if (normRot === 180) return [false, false, true, true]; // DOWN & LEFT
    if (normRot === 270) return [true, false, false, true]; // LEFT & UP
  }

  if (type === 'tee') {
    if (normRot === 0)   return [true, true, false, true];  // UP, RIGHT, LEFT
    if (normRot === 90)  return [true, true, true, false];  // UP, RIGHT, DOWN
    if (normRot === 180) return [false, true, true, true]; // RIGHT, DOWN, LEFT
    if (normRot === 270) return [true, false, true, true]; // DOWN, LEFT, UP
  }

  return [false, false, false, false];
}

// Canonical Solved Layouts for 3x3
// Grid indices:
// 0(0,0)  1(0,1)  2(0,2)
// 3(1,0)  4(1,1)  5(1,2)
// 6(2,0)  7(2,1)  8(2,2)
// Power enters 0 from LEFT (3). Target exits 8 to RIGHT (1).

const SOLVED_TEMPLATES = [
  // Layout A: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)
  {
    pathIndices: [0, 1, 2, 5, 8],
    tiles: [
      { id: 't0', type: 'straight', targetRot: 90 }, // Left -> Right
      { id: 't1', type: 'straight', targetRot: 90 }, // Left -> Right
      { id: 't2', type: 'corner',   targetRot: 180 }, // Left -> Down
      { id: 't3', type: 'corner',   targetRot: 90 },
      { id: 't4', type: 'cross',    targetRot: 0 },
      { id: 't5', type: 'straight', targetRot: 0 },   // Up -> Down
      { id: 't6', type: 'straight', targetRot: 90 },
      { id: 't7', type: 'corner',   targetRot: 270 },
      { id: 't8', type: 'corner',   targetRot: 0 },   // Up -> Right (Out)
    ],
  },
  // Layout B: (0,0) -> (1,0) -> (1,1) -> (2,1) -> (2,2)
  {
    pathIndices: [0, 3, 4, 7, 8],
    tiles: [
      { id: 't0', type: 'corner',   targetRot: 180 }, // Left -> Down
      { id: 't1', type: 'straight', targetRot: 90 },
      { id: 't2', type: 'corner',   targetRot: 90 },
      { id: 't3', type: 'corner',   targetRot: 0 },   // Up -> Right
      { id: 't4', type: 'corner',   targetRot: 180 }, // Left -> Down
      { id: 't5', type: 'straight', targetRot: 0 },
      { id: 't6', type: 'corner',   targetRot: 90 },
      { id: 't7', type: 'corner',   targetRot: 0 },   // Up -> Right
      { id: 't8', type: 'straight', targetRot: 90 },  // Left -> Right (Out)
    ],
  },
  // Layout C: (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2)
  {
    pathIndices: [0, 3, 6, 7, 8],
    tiles: [
      { id: 't0', type: 'corner',   targetRot: 180 }, // Left -> Down
      { id: 't1', type: 'cross',    targetRot: 0 },
      { id: 't2', type: 'straight', targetRot: 0 },
      { id: 't3', type: 'straight', targetRot: 0 },   // Up -> Down
      { id: 't4', type: 'corner',   targetRot: 90 },
      { id: 't5', type: 'straight', targetRot: 90 },
      { id: 't6', type: 'corner',   targetRot: 0 },   // Up -> Right
      { id: 't7', type: 'straight', targetRot: 90 },  // Left -> Right
      { id: 't8', type: 'straight', targetRot: 90 },  // Left -> Right (Out)
    ],
  },
];

// Check if a tile configuration connects from Source (0 Left) to Target (8 Right)
export function evaluateCircuit(tiles) {
  if (!tiles || tiles.length < 9) {
    return { isConnected: false, energizedIds: new Set(), pathIndices: [] };
  }

  const energized = new Set();
  const queue = [];
  const parentMap = new Map();

  // Check if tile 0 accepts Left input (DIR_LEFT = 3)
  const t0Ports = getTilePorts(tiles[0].type, tiles[0].currentRot);
  if (t0Ports[DIR_LEFT]) {
    energized.add(tiles[0].id);
    queue.push({ r: 0, c: 0, index: 0 });
  }

  const opposite = [2, 3, 0, 1]; // Up<->Down, Right<->Left
  const deltas = [
    { dr: -1, dc: 0, dir: DIR_UP },
    { dr: 0, dc: 1, dir: DIR_RIGHT },
    { dr: 1, dc: 0, dir: DIR_DOWN },
    { dr: 0, dc: -1, dir: DIR_LEFT },
  ];

  while (queue.length > 0) {
    const { r, c, index } = queue.shift();
    const curTile = tiles[index];
    const curPorts = getTilePorts(curTile.type, curTile.currentRot);

    for (const d of deltas) {
      if (!curPorts[d.dir]) continue;
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;

      const nextIndex = nr * 3 + nc;
      const nextTile = tiles[nextIndex];
      if (energized.has(nextTile.id)) continue;

      const nextPorts = getTilePorts(nextTile.type, nextTile.currentRot);
      if (nextPorts[opposite[d.dir]]) {
        energized.add(nextTile.id);
        parentMap.set(nextIndex, index);
        queue.push({ r: nr, c: nc, index: nextIndex });
      }
    }
  }

  // Check if tile 8 is reached and has an open Right exit (DIR_RIGHT = 1)
  const tEnd = tiles[8];
  const tEndPorts = getTilePorts(tEnd.type, tEnd.currentRot);
  const win = energized.has(tEnd.id) && tEndPorts[DIR_RIGHT];

  // Reconstruct path if connected
  const path = [];
  if (win) {
    let curr = 8;
    while (curr !== undefined) {
      path.unshift(curr);
      curr = parentMap.get(curr);
    }
  }

  return { isConnected: !!win, energizedIds: energized, pathIndices: path };
}

// Guaranteed Solvable Generator
// Scrambles only 4 to 6 rotations away from a verified canonical template
export function generateSolvableCircuit(seed = Date.now()) {
  let s = (seed % 2147483647);
  if (s <= 0) s += 2147483646;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // 1. Pick a template
  const template = SOLVED_TEMPLATES[Math.floor(rng() * SOLVED_TEMPLATES.length)];

  for (let attempt = 0; attempt < 50; attempt++) {
    // 2. Clone template tiles with known targetRot
    const tiles = template.tiles.map((t, idx) => ({
      ...t,
      index: idx,
      currentRot: t.targetRot, // Start in solved state
    }));

    // Verify template itself is solved
    const baseEval = evaluateCircuit(tiles);
    if (!baseEval.isConnected) {
      console.error('Template is not solved!', template);
      continue;
    }

    // 3. Select 3 to 4 tiles on the path and 1-2 off-path tiles to scramble
    // Rotation offsets: 90, 180, or 270
    const rotations = [90, 180, 270];

    // Pick 3 path tiles to rotate
    const pathTilesToScramble = [...template.pathIndices]
      .sort(() => rng() - 0.5)
      .slice(0, 3);

    pathTilesToScramble.forEach(idx => {
      const offset = rotations[Math.floor(rng() * rotations.length)];
      tiles[idx].currentRot = (tiles[idx].targetRot + offset) % 360;
    });

    // Also rotate 1 or 2 decoy tiles
    const decoyIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
      idx => !template.pathIndices.includes(idx)
    );
    if (decoyIndices.length > 0) {
      const dIdx = decoyIndices[Math.floor(rng() * decoyIndices.length)];
      tiles[dIdx].currentRot = (tiles[dIdx].currentRot + 90) % 360;
    }

    // 4. Verify that:
    // A) It is not already solved
    // B) Rotating tiles back to targetRot reaches solution
    const checkEval = evaluateCircuit(tiles);
    if (!checkEval.isConnected) {
      return {
        tiles,
        templatePath: template.pathIndices,
        solution: template.tiles.map(t => t.targetRot),
      };
    }
  }

  // Absolute fallback: Template A with tile 0 and tile 2 rotated by 90
  const fallbackTiles = SOLVED_TEMPLATES[0].tiles.map((t, i) => ({
    ...t,
    index: i,
    currentRot: i === 0 || i === 2 ? (t.targetRot + 90) % 360 : t.targetRot,
  }));

  return {
    tiles: fallbackTiles,
    templatePath: SOLVED_TEMPLATES[0].pathIndices,
    solution: SOLVED_TEMPLATES[0].tiles.map(t => t.targetRot),
  };
}

// Hint Solver: finds the next tile on the solution path that is misaligned
export function getCircuitNextMove(tiles, solutionPath, solutionRotations) {
  for (const idx of solutionPath) {
    const tile = tiles[idx];
    const targetRot = solutionRotations[idx];
    const currentRot = ((tile.currentRot % 360) + 360) % 360;
    const target = ((targetRot % 360) + 360) % 360;

    // For straight tiles, 0 == 180 and 90 == 270
    if (tile.type === 'straight') {
      if (currentRot % 180 !== target % 180) {
        return {
          tileIndex: idx,
          tileId: tile.id,
          neededRot: target,
          movesNeeded: 1,
        };
      }
    } else {
      if (currentRot !== target) {
        const diff = ((target - currentRot + 360) % 360) / 90;
        return {
          tileIndex: idx,
          tileId: tile.id,
          neededRot: target,
          movesNeeded: diff,
        };
      }
    }
  }
  return null;
}
