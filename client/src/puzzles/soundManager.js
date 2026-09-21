// client/src/puzzles/soundManager.js
// Arcade Web Audio synthesizer — zero external files, crisp responsive audio.

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone({ frequency = 440, type = 'sine', duration = 0.15, volume = 0.25, delay = 0 } = {}) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.02);
  } catch {
    // Silently ignore browser audio constraints
  }
}

function playNoise({ duration = 0.1, volume = 0.1, delay = 0 } = {}) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    noise.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    noise.start(ctx.currentTime + delay);
    noise.stop(ctx.currentTime + delay + duration);
  } catch {
    // ignore
  }
}

const SOUNDS = {
  boot: () => {
    playTone({ frequency: 220, type: 'sawtooth', duration: 0.1, volume: 0.15, delay: 0 });
    playTone({ frequency: 440, type: 'sine', duration: 0.12, volume: 0.2, delay: 0.1 });
    playTone({ frequency: 880, type: 'sine', duration: 0.25, volume: 0.25, delay: 0.22 });
  },
  click: () => {
    playTone({ frequency: 950, type: 'square', duration: 0.03, volume: 0.08 });
  },
  hint: () => {
    playTone({ frequency: 620, type: 'sine', duration: 0.08, volume: 0.2 });
    playTone({ frequency: 950, type: 'sine', duration: 0.18, volume: 0.25, delay: 0.07 });
  },
  rotate: () => {
    playTone({ frequency: 600, type: 'sine', duration: 0.05, volume: 0.12 });
  },
  slot: () => {
    playTone({ frequency: 700, type: 'triangle', duration: 0.04, volume: 0.15 });
    playTone({ frequency: 1050, type: 'sine', duration: 0.08, volume: 0.2, delay: 0.04 });
  },
  pulse: () => {
    playTone({ frequency: 520, type: 'sine', duration: 0.08, volume: 0.2 });
  },
  laser: () => {
    playTone({ frequency: 1200, type: 'sawtooth', duration: 0.07, volume: 0.15 });
    playTone({ frequency: 600, type: 'sawtooth', duration: 0.1, volume: 0.12, delay: 0.05 });
  },
  correct: () => {
    playTone({ frequency: 523.25, type: 'sine', duration: 0.09, volume: 0.25, delay: 0 });
    playTone({ frequency: 659.25, type: 'sine', duration: 0.09, volume: 0.25, delay: 0.09 });
    playTone({ frequency: 783.99, type: 'sine', duration: 0.18, volume: 0.3, delay: 0.18 });
  },
  incorrect: () => {
    playTone({ frequency: 180, type: 'sawtooth', duration: 0.15, volume: 0.2, delay: 0 });
    playTone({ frequency: 140, type: 'sawtooth', duration: 0.2, volume: 0.2, delay: 0.12 });
  },
  clue: () => {
    playTone({ frequency: 659.25, type: 'sine', duration: 0.08, volume: 0.2, delay: 0 });
    playTone({ frequency: 880, type: 'sine', duration: 0.08, volume: 0.25, delay: 0.08 });
    playTone({ frequency: 1174.66, type: 'sine', duration: 0.2, volume: 0.25, delay: 0.16 });
  },
  moduleRestored: () => {
    playTone({ frequency: 440, type: 'triangle', duration: 0.1, volume: 0.2, delay: 0 });
    playTone({ frequency: 554.37, type: 'sine', duration: 0.1, volume: 0.25, delay: 0.08 });
    playTone({ frequency: 659.25, type: 'sine', duration: 0.12, volume: 0.25, delay: 0.16 });
    playTone({ frequency: 880, type: 'sine', duration: 0.3, volume: 0.3, delay: 0.26 });
  },
  timerWarning: () => {
    playTone({ frequency: 880, type: 'square', duration: 0.08, volume: 0.15, delay: 0 });
    playTone({ frequency: 880, type: 'square', duration: 0.08, volume: 0.15, delay: 0.2 });
  },
  glitch: () => {
    playNoise({ duration: 0.12, volume: 0.15 });
    playTone({ frequency: 120, type: 'sawtooth', duration: 0.1, volume: 0.18 });
  },
  win: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      playTone({ frequency: freq, type: 'sine', duration: 0.2, volume: 0.28, delay: idx * 0.1 });
    });
  },
  memoryTone: (idx = 0) => {
    const scale = [392, 440, 523.25, 659.25, 783.99];
    const freq = scale[idx % scale.length];
    playTone({ frequency: freq, type: 'sine', duration: 0.2, volume: 0.25 });
  }
};

export function playSound(key, param) {
  if (key === 'memoryTone') {
    SOUNDS.memoryTone(param);
  } else if (SOUNDS[key]) {
    SOUNDS[key]();
  }
}
