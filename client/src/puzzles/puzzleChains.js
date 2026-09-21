// client/src/puzzles/puzzleChains.js
// Controlled randomized puzzle chains for the arcade puzzle game.
// 100% visual, interactive, zero exam/essay questions.

function seededRng(seed) {
  let s = (seed % 2147483647);
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export const MODULE_ORDER = [
  'files',     // 1. File Hunt
  'circuit',   // 2. Power Routing
  'memory',    // 3. Memory Sync
  'scanner',   // 4. Radar / Terminal Scan
  'assembly',  // 5. Data Assembly
  'sync',      // 6. Timing Sync
  'core',      // 7. Final Core Restoration
];

export const MODULE_LABELS = {
  files:    'FILE SYSTEM',
  circuit:  'POWER GRID',
  memory:   'MEMORY BUFFER',
  scanner:  'RADAR SCANNER',
  assembly: 'DATA CORE',
  sync:     'HARMONIC SYNC',
  core:     'SYSTEM CORE',
};

export const MODULE_ICONS = {
  files:    '📁',
  circuit:  '⚡',
  memory:   '🧠',
  scanner:  '📡',
  assembly: '🧩',
  sync:     '⏱️',
  core:     '⬡',
};

export function generateGameChain(seed = Date.now()) {
  const rng = seededRng(seed);

  // Randomizable parameters across chains
  const coreKeywords = ['NOVA', 'ECHO', 'SIGMA', 'DELTA', 'ZENITH', 'NEXUS'];
  const colors = ['BLUE', 'CYAN', 'VIOLET', 'AMBER', 'EMERALD'];
  const nodeNums = ['07', '42', '16', '99', '03', '88'];

  const coreKeyword = pick(coreKeywords, rng);
  const coreColor = pick(colors, rng);
  const coreNode = pick(nodeNums, rng);
  const coreToken = `${coreKeyword}-${coreNode}`;

  // Circuit puzzle configurations (3x3 grid)
  // Connections: 0: Up, 1: Right, 2: Down, 3: Left
  // Straight: [0, 2] or [1, 3]
  // Corner: [0, 1] (UR), [1, 2] (RD), [2, 3] (DL), [3, 0] (LU)
  // Cross: [0, 1, 2, 3]
  // Let's create a pre-validated solvable 3x3 path:
  // Source at (0, 0) Left (in from left). Target at (2, 2) Right (out to right).
  // Path: (0,0) [RD corner] -> (0,1) [LR straight] -> (0,2) [DL corner] -> (1,2) [UD straight] -> (2,2) [UR corner] -> Out!
  // We can randomize rotation offsets for tiles.
  const circuitTilesA = [
    // row 0
    { id: 'c0', type: 'straight', correctRot: 90, currentRot: (90 + 90 * Math.floor(rng() * 3 + 1)) % 360 }, // LR
    { id: 'c1', type: 'straight', correctRot: 90, currentRot: (90 + 90 * Math.floor(rng() * 3 + 1)) % 360 }, // LR
    { id: 'c2', type: 'corner', correctRot: 180, currentRot: (180 + 90 * Math.floor(rng() * 3 + 1)) % 360 }, // DL
    // row 1
    { id: 'c3', type: 'straight', correctRot: 0, currentRot: (0 + 90 * Math.floor(rng() * 3 + 1)) % 360 },
    { id: 'c4', type: 'cross', correctRot: 0, currentRot: 0 },
    { id: 'c5', type: 'straight', correctRot: 0, currentRot: (0 + 90 * Math.floor(rng() * 3 + 1)) % 360 }, // UD
    // row 2
    { id: 'c6', type: 'corner', correctRot: 0, currentRot: (0 + 90 * Math.floor(rng() * 3 + 1)) % 360 },
    { id: 'c7', type: 'straight', correctRot: 90, currentRot: (90 + 90 * Math.floor(rng() * 3 + 1)) % 360 },
    { id: 'c8', type: 'corner', correctRot: 0, currentRot: (0 + 90 * Math.floor(rng() * 3 + 1)) % 360 }, // UR -> Right out
  ];

  // Memory sequence: 4 steps from [0, 1, 2, 3]
  const memSequence = [
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
    Math.floor(rng() * 4),
  ];

  // Radar Scanner target frequency (e.g. 142.8 MHz or coordinate)
  const targetFreq = pick(['104.2', '142.8', '210.5', '433.9', '868.0'], rng);

  // Data Assembly chips
  // Player needs to slot [CORE], [NODE], [07]
  const assemblySolution = ['CORE', 'NODE', coreNode];
  const assemblyFragments = [
    { id: 'f1', label: 'CORE', icon: '⬡', color: 'cyan' },
    { id: 'f2', label: 'NODE', icon: '⚡', color: 'blue' },
    { id: 'f3', label: coreNode, icon: '★', color: 'amber' },
    { id: 'f4', label: 'NULL', icon: '⨯', color: 'red' },
    { id: 'f5', label: '99', icon: '◆', color: 'slate' },
  ].sort(() => rng() - 0.5);

  return {
    seed,
    coreKeyword,
    coreColor,
    coreNode,
    coreToken,
    modules: {
      files: {
        id: 'files',
        title: 'FILE SYSTEM',
        objective: 'FIND THE CORE FRAGMENT FILE',
        files: [
          { id: 'f_readme', name: 'README.sys', isDecoy: true, note: 'SYSTEM RESTORATION GUIDE: ALL SECTORS CRITICAL' },
          { id: 'f_cache', name: 'CACHE.tmp', isDecoy: true, note: 'CORRUPTED MEMORY DUMP' },
          { id: 'f_target', name: 'CORE_FRAGMENT.sys', isTarget: true, clue: { key: 'CORE-NODE', label: 'Core Node', value: `${coreColor} ● ${coreNode}`, symbol: '●', color: coreColor } },
          { id: 'f_backup', name: 'BACKUP.dat', isDecoy: true, note: 'BACKUP NOT FOUND' },
          { id: 'f_unknown', name: 'UNKNOWN_03.tmp', isDecoy: true, isGlitch: true, note: 'DECOY FILE' },
          { id: 'f_logs', name: 'SYS_EVENT.log', isDecoy: true, note: 'SYSTEM RUNTIME: 03:00' },
        ],
        clueReward: { key: 'CORE-NODE', label: 'Core Node', value: `${coreColor} ● ${coreNode}`, symbol: '●', color: coreColor },
      },
      circuit: {
        id: 'circuit',
        title: 'POWER GRID',
        objective: 'ROTATE TILES TO ROUTE POWER',
        tiles: circuitTilesA,
        clueReward: { key: 'TARGET-FREQ', label: 'Radar Frequency', value: `${targetFreq} MHz`, symbol: '📡', color: 'cyan' },
      },
      memory: {
        id: 'memory',
        title: 'MEMORY BUFFER',
        objective: 'REPEAT THE GLYPH SEQUENCE',
        glyphs: [
          { id: 0, symbol: '●', label: 'CIRCLE', color: 'cyan' },
          { id: 1, symbol: '▲', label: 'TRIANGLE', color: 'amber' },
          { id: 2, symbol: '■', label: 'SQUARE', color: 'magenta' },
          { id: 3, symbol: '◆', label: 'DIAMOND', color: 'emerald' },
        ],
        sequence: memSequence,
        clueReward: { key: 'KEYWORD', label: 'Core Keyword', value: coreKeyword, symbol: '🔑', color: 'amber' },
      },
      scanner: {
        id: 'scanner',
        title: 'RADAR SCANNER',
        objective: 'SWEEP AND LOCK ONTO SIGNAL',
        targetFreq,
        frequencies: ['104.2', '142.8', '210.5', '433.9', '868.0'].sort(() => rng() - 0.5),
        clueReward: { key: 'CHIP-SEQ', label: 'Assembly Blueprint', value: `CORE → NODE → ${coreNode}`, symbol: '🧩', color: 'emerald' },
      },
      assembly: {
        id: 'assembly',
        title: 'DATA CORE',
        objective: 'SLOT CHIPS TO ASSEMBLE OVERRIDE',
        solution: assemblySolution,
        fragments: assemblyFragments,
        clueReward: { key: 'CORE-KEY', label: 'Core Key', value: coreToken, symbol: '⬡', color: 'violet' },
      },
      sync: {
        id: 'sync',
        title: 'HARMONIC SYNC',
        objective: 'TIMING: TAP SYNC IN GREEN ZONE',
        targetZone: { min: 40, max: 65 },
        requiredHits: 2,
        clueReward: { key: 'OVERDRIVE', label: 'Core Overdrive', value: 'READY', symbol: '⚡', color: 'green' },
      },
      core: {
        id: 'core',
        title: 'SYSTEM CORE',
        objective: 'ENGAGE RELAYS AND RESTORE CORE',
        requiredToken: coreToken,
        relays: [
          { id: 'relay_files', name: 'FILE REPOSITORY' },
          { id: 'relay_power', name: 'MAIN POWER GRID' },
          { id: 'relay_logic', name: 'LOGIC HARMONICS' },
          { id: 'relay_data',  name: 'OVERRIDE MATRIX' },
        ],
      },
    },
  };
}