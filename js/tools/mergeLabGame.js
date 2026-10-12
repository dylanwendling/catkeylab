/* ==========================================================================
   CatKeyLab - Merge Lab Game Engine
   High-Precision Number-Merging Swipe Puzzle with In-Board Power-Ups,
   Progressive Board Sizes (5x5, 6x6, 8x8, 10x10), Web Audio & Leaderboard Integration.
   ========================================================================== */

import { t } from '../i18n.js';
import { getAudioContext, isSoundEnabled, toggleSound } from '../audio.js';
import { submitScore, getLeaderboard, getAnonProfile } from '../leaderboard.js';

// Game State Enum: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'BOARD_SELECT'
let gameState = 'MENU';
let gameMode = 'CLASSIC'; // 'CLASSIC', 'TIMED', 'CHALLENGE'

// Canvas Context & Engine
let canvas = null;
let ctx = null;
let animFrameId = null;
let containerRef = null;

// Virtual High-DPI Coordinate Space
const V_SIZE = 560; // 560x560 board coordinate space

// Board Configurations & Unlock Thresholds
const BOARD_CONFIGS = {
  '5x5': {
    id: '5x5',
    name: '5×5 Laboratory (Intro)',
    size: 5,
    cells: 25,
    spawnCount: 1,
    unlockReqText: 'Default Starting Board',
    unlockTile: 0,
    unlockScore: 0,
    desc: 'Introduction to lab synthesis and common power-ups.'
  },
  '6x6': {
    id: '6x6',
    name: '6×6 Expansion Lab',
    size: 6,
    cells: 36,
    spawnCount: 1,
    unlockReqText: 'Create a 512 Tile or 2,500 Pts on 5×5',
    unlockTile: 512,
    unlockScore: 2500,
    desc: 'Wider grid with uncommon lightning and magnet power-ups.'
  },
  '8x8': {
    id: '8x8',
    name: '8×8 Advanced Reactor',
    size: 8,
    cells: 64,
    spawnCount: 2,
    unlockReqText: 'Create a 1024 Tile or 8,000 Pts on 6×6',
    unlockTile: 1024,
    unlockScore: 8000,
    desc: 'Deep strategic room for chain reactions and rare wildcards.'
  },
  '10x10': {
    id: '10x10',
    name: '10×10 Quantum Master',
    size: 10,
    cells: 100,
    spawnCount: 2,
    unlockReqText: 'Create a 2048 Tile or 20,000 Pts on 8×8',
    unlockTile: 2048,
    unlockScore: 20000,
    desc: 'The ultimate synthesis grid. Epic black holes & quantum leaps.'
  }
};

let currentBoardId = '5x5';
let boardSize = 5;
let grid = []; // 2D array [row][col] of tile or power-up objects
let movingTiles = []; // Tiles animating sliding motion
let particles = [];
let floatingTexts = [];
let lastTimestamp = 0;
let isAnimating = false;
let animProgress = 1.0;

// Stats & Scoring
let score = 0;
let combo = 0;
let maxCombo = 0;
let highestTile = 2;
let totalMerges = 0;
let powerUpsCollected = 0;
let timeLeft = 180; // For Timed Mode (180s = 3 mins)
let timerInterval = null;
let overdriveTurns = 0;
let screenShakeAmount = 0;

// Challenge Objectives
let challengeTargetTile = 1024;
let challengeCompleted = false;

// Power-Up Database Definitions
const POWER_UP_TYPES = {
  // Common
  BOMB: {
    id: 'BOMB',
    name: 'Bomb',
    icon: '💣',
    rarity: 'common',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.7)',
    desc: 'Detonates 3×3 surrounding area!'
  },
  ERASER: {
    id: 'ERASER',
    name: 'Tile Eraser',
    icon: '🧽',
    rarity: 'common',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.7)',
    desc: 'Wipes out the lowest tile on the board!'
  },
  SHUFFLE: {
    id: 'SHUFFLE',
    name: 'Mini Shuffle',
    icon: '🔀',
    rarity: 'common',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.7)',
    desc: 'Shuffles tiles into merge clusters!'
  },
  // Uncommon
  LIGHTNING: {
    id: 'LIGHTNING',
    name: 'Lightning Beam',
    icon: '⚡',
    rarity: 'uncommon',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.7)',
    desc: 'Clears an entire row or column!'
  },
  MULTIPLIER: {
    id: 'MULTIPLIER',
    name: 'Multiplier 2×',
    icon: '✖️',
    rarity: 'uncommon',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.7)',
    desc: 'Doubles colliding tile value!'
  },
  MAGNET: {
    id: 'MAGNET',
    name: 'Magnet',
    icon: '🧲',
    rarity: 'uncommon',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.7)',
    desc: 'Pulls matching tiles together for instant merges!'
  },
  // Rare
  CHAIN_REACTOR: {
    id: 'CHAIN_REACTOR',
    name: 'Chain Reactor',
    icon: '⚛️',
    rarity: 'rare',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.7)',
    desc: 'Auto-merges adjacent matching pairs!'
  },
  WILD: {
    id: 'WILD',
    name: 'Wild Tile',
    icon: '🃏',
    rarity: 'rare',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    desc: 'Chameleon tile: merges with ANY number!'
  },
  BOARD_CLEANER: {
    id: 'BOARD_CLEANER',
    name: 'Board Cleaner',
    icon: '🧹',
    rarity: 'rare',
    color: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.7)',
    desc: 'Vaporizes all 2s and 4s across the board!'
  },
  // Epic & Legendary
  BLACK_HOLE: {
    id: 'BLACK_HOLE',
    name: 'Black Hole',
    icon: '🌌',
    rarity: 'epic',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.85)',
    desc: 'Vortex absorbs surrounding tiles into score!'
  },
  QUANTUM: {
    id: 'QUANTUM',
    name: 'Quantum Merge',
    icon: '🧬',
    rarity: 'epic',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.85)',
    desc: 'Leaps tile value 2 tiers higher!'
  },
  OVERDRIVE: {
    id: 'OVERDRIVE',
    name: 'Overdrive Surge',
    icon: '🔥',
    rarity: 'legendary',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.9)',
    desc: '3× Score Surge and guaranteed power-ups!'
  }
};

// Power-Up Spawn Probability Scaling Configuration
const POWER_UP_SPAWN_TIERS = [
  { minVal: 4, maxVal: 16, chance: 0.16, pool: ['BOMB', 'ERASER', 'SHUFFLE'] },
  { minVal: 32, maxVal: 64, chance: 0.32, pool: ['BOMB', 'ERASER', 'SHUFFLE', 'LIGHTNING', 'MULTIPLIER', 'MAGNET'] },
  { minVal: 128, maxVal: 256, chance: 0.50, pool: ['LIGHTNING', 'MULTIPLIER', 'MAGNET', 'CHAIN_REACTOR', 'WILD', 'BOARD_CLEANER'] },
  { minVal: 512, maxVal: 1024, chance: 0.75, pool: ['CHAIN_REACTOR', 'WILD', 'BOARD_CLEANER', 'BLACK_HOLE', 'QUANTUM'] },
  { minVal: 2048, maxVal: Infinity, chance: 0.95, pool: ['BLACK_HOLE', 'QUANTUM', 'OVERDRIVE'] }
];

// Color Palette for Numbered Tiles
const TILE_COLORS = {
  2: { bg: '#1e293b', text: '#38bdf8', border: '#0284c7' },
  4: { bg: '#0f766e', text: '#ccfbf1', border: '#14b8a6' },
  8: { bg: '#0369a1', text: '#e0f2fe', border: '#38bdf8' },
  16: { bg: '#1d4ed8', text: '#eff6ff', border: '#60a5fa' },
  32: { bg: '#4338ca', text: '#e0e7ff', border: '#818cf8' },
  64: { bg: '#6d28d9', text: '#ede9fe', border: '#a78bfa' },
  128: { bg: '#7e22ce', text: '#faf5ff', border: '#c084fc' },
  256: { bg: '#a21caf', text: '#fdf4ff', border: '#e879f9' },
  512: { bg: '#be123c', text: '#ffe4e6', border: '#fb7185' },
  1024: { bg: '#c2410c', text: '#ffedd5', border: '#fb923c' },
  2048: { bg: '#b45309', text: '#fef3c7', border: '#fde047' },
  4096: { bg: '#047857', text: '#d1fae5', border: '#34d399' },
  8192: { bg: '#0e7490', text: '#cffafe', border: '#22d3ee' }
};

/* ==========================================================================
   Sound Synthesis System (Web Audio API)
   ========================================================================== */

function playLabSound(type, param = 1) {
  if (!isSoundEnabled()) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'swipe') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'merge') {
      const freq = Math.min(1200, 280 + Math.log2(param || 2) * 65);
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'powerup_spawn') {
      [659.25, 880, 1174.66].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.15);
      });
    } else if (type === 'powerup_collect') {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        gain.gain.setValueAtTime(0.16, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.18);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.18);
      });
    } else if (type === 'bomb') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'lightning') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'game_over') {
      [360, 320, 270, 200].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.09);
        gain.gain.setValueAtTime(0.18, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.25);
      });
    }
  } catch (e) {}
}

/* ==========================================================================
   Persistence & Local Storage Progression System
   ========================================================================== */

function getProgression() {
  const defaultProg = {
    unlocked: ['5x5'],
    activeBoard: '5x5',
    records: {
      '5x5': { highScore: 0, maxTile: 2, totalMerges: 0 },
      '6x6': { highScore: 0, maxTile: 2, totalMerges: 0 },
      '8x8': { highScore: 0, maxTile: 2, totalMerges: 0 },
      '10x10': { highScore: 0, maxTile: 2, totalMerges: 0 }
    }
  };
  try {
    const raw = localStorage.getItem('catkeylab_mergelab_progression');
    if (!raw) return defaultProg;
    const parsed = JSON.parse(raw);
    return { ...defaultProg, ...parsed, records: { ...defaultProg.records, ...(parsed.records || {}) } };
  } catch (e) {
    return defaultProg;
  }
}

function saveProgression(prog) {
  try {
    localStorage.setItem('catkeylab_mergelab_progression', JSON.stringify(prog));
  } catch (e) {}
}

function checkBoardUnlocks() {
  const prog = getProgression();
  let newlyUnlocked = false;

  // Check 6x6 Unlock (From 5x5: Tile 512 or 2,500 pts)
  if (!prog.unlocked.includes('6x6')) {
    const rec5 = prog.records['5x5'];
    if ((rec5 && (rec5.maxTile >= 512 || rec5.highScore >= 2500)) || highestTile >= 512 || score >= 2500) {
      prog.unlocked.push('6x6');
      newlyUnlocked = '6×6 Expansion Lab';
    }
  }

  // Check 8x8 Unlock (From 6x6: Tile 1024 or 8,000 pts)
  if (!prog.unlocked.includes('8x8')) {
    const rec6 = prog.records['6x6'];
    if (prog.unlocked.includes('6x6') && ((rec6 && (rec6.maxTile >= 1024 || rec6.highScore >= 8000)) || highestTile >= 1024 || score >= 8000)) {
      prog.unlocked.push('8x8');
      newlyUnlocked = '8×8 Advanced Reactor';
    }
  }

  // Check 10x10 Unlock (From 8x8: Tile 2048 or 20,000 pts)
  if (!prog.unlocked.includes('10x10')) {
    const rec8 = prog.records['8x8'];
    if (prog.unlocked.includes('8x8') && ((rec8 && (rec8.maxTile >= 2048 || rec8.highScore >= 20000)) || highestTile >= 2048 || score >= 20000)) {
      prog.unlocked.push('10x10');
      newlyUnlocked = '10×10 Quantum Master Board';
    }
  }

  // Save updated records
  const curRec = prog.records[currentBoardId] || { highScore: 0, maxTile: 2, totalMerges: 0 };
  if (score > curRec.highScore) curRec.highScore = score;
  if (highestTile > curRec.maxTile) curRec.maxTile = highestTile;
  curRec.totalMerges += totalMerges;
  prog.records[currentBoardId] = curRec;

  saveProgression(prog);

  if (newlyUnlocked) {
    spawnFloatingText(`🔓 UNLOCKED: ${newlyUnlocked}!`, V_SIZE / 2, 80, '#fde047');
    playLabSound('powerup_spawn');
  }

  return prog;
}

/* ==========================================================================
   Main Render Entry Point
   ========================================================================== */

export function renderMergeLabGame(container) {
  containerRef = container;
  const prog = getProgression();
  currentBoardId = prog.activeBoard || '5x5';
  boardSize = BOARD_CONFIGS[currentBoardId].size;

  container.innerHTML = `
    <div class="ml-wrapper" style="max-width:620px; margin:0 auto; user-select:none;">
      
      <!-- Top Lab Header & Mode Selector -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:0.65rem 1rem; margin-bottom:0.75rem; box-shadow:0 4px 14px rgba(0,0,0,0.25);">
        
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.8rem;">🧪</span>
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); font-weight:700;">Score</div>
            <div id="ml-hud-score" style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan); line-height:1;">0</div>
          </div>
        </div>

        <!-- Mode & Board Picker Buttons -->
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button id="ml-board-select-btn" class="btn btn-sm btn-secondary" style="font-weight:700; font-size:0.85rem; padding:0.4rem 0.75rem;" title="Select Board Size">
            🎛️ <span id="ml-hud-board-label">${currentBoardId}</span>
          </button>
          <button id="ml-mode-toggle-btn" class="btn btn-sm btn-secondary" style="font-weight:700; font-size:0.85rem; padding:0.4rem 0.75rem;" title="Switch Game Mode">
            🕹️ <span id="ml-hud-mode-label">CLASSIC</span>
          </button>
        </div>

        <!-- Controls (Sound & Pause) -->
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <button id="ml-sound-btn" class="btn btn-sm btn-secondary" style="padding:0.45rem 0.65rem; font-size:1.1rem; line-height:1;" title="Toggle Sound">
            ${isSoundEnabled() ? '🔊' : '🔇'}
          </button>
          <button id="ml-pause-btn" class="btn btn-sm btn-secondary" style="padding:0.45rem 0.75rem; font-weight:700;" title="Pause Game (Esc)">
            ⏸️
          </button>
        </div>

      </div>

      <!-- Quick Metrics Ribbon -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; background:rgba(0,0,0,0.25); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.4rem 0.85rem; margin-bottom:0.75rem; font-size:0.82rem;">
        <div>🏆 Best: <strong id="ml-hud-best" style="color:var(--accent-amber);">${prog.records[currentBoardId]?.highScore || 0}</strong></div>
        <div>🔬 Highest: <strong id="ml-hud-highest" style="color:var(--accent-primary);">2</strong></div>
        <div>⚡ Combo: <strong id="ml-hud-combo" style="color:#fde047;">1x</strong></div>
        <div id="ml-hud-timer-container" style="display:none; color:var(--accent-rose);">⏱️ <strong id="ml-hud-timer">180s</strong></div>
      </div>

      <!-- Main Canvas Container -->
      <div id="ml-canvas-container" style="position:relative; width:100%; border-radius:var(--radius-xl); overflow:hidden; border:2px solid var(--border-color); box-shadow:0 14px 40px rgba(0,0,0,0.5); background:#060a17; touch-action:none;">
        <canvas id="ml-canvas" style="display:block; width:100%; height:auto; cursor:grab; -webkit-tap-highlight-color:transparent;"></canvas>

        <!-- 1. Main Menu Overlay -->
        <div id="ml-modal-menu" style="position:absolute; inset:0; background:rgba(6,10,23,0.88); backdrop-filter:blur(8px); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10;">
          <div style="font-size:3.5rem; margin-bottom:0.25rem;">🧪</div>
          <h1 style="font-size:2.5rem; font-weight:900; letter-spacing:0.04em; margin-bottom:0.25rem; background:linear-gradient(135deg, #22d3ee, #a855f7, #ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            MERGE LAB
          </h1>
          <p style="color:var(--text-secondary); font-size:0.95rem; max-width:380px; margin-bottom:1.5rem;">
            Swipe to merge matching elements. Larger merges spawn collectible in-board laboratory power-ups!
          </p>

          <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%; max-width:300px; margin-bottom:1.5rem;">
            <button id="ml-btn-start" class="btn btn-primary btn-lg" style="font-size:1.2rem; font-weight:900; padding:0.85rem; box-shadow:0 0 24px rgba(6,182,212,0.4);">
              ▶️ START EXPERIMENT
            </button>
            <button id="ml-btn-open-boards" class="btn btn-secondary btn-lg" style="font-weight:700;">
              🎛️ Select Board Size
            </button>
            <button id="ml-btn-tutorial" class="btn btn-secondary" style="font-weight:600;">
              📖 Power-Up Codex & Rules
            </button>
          </div>

          <p style="font-size:0.8rem; color:var(--text-muted); max-width:360px;">
            ⌨️ <strong>Desktop:</strong> Arrow Keys or WASD • 📱 <strong>Mobile:</strong> Swipe anywhere on board
          </p>
        </div>

        <!-- 2. Board Selection Overlay -->
        <div id="ml-modal-boards" style="position:absolute; inset:0; background:rgba(6,10,23,0.92); backdrop-filter:blur(8px); display:none; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:12; overflow-y:auto;">
          <h2 style="font-size:1.8rem; font-weight:900; margin-bottom:0.25rem; color:var(--text-primary);">🎛️ SELECT LABORATORY GRID</h2>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.25rem;">Unlock larger boards by synthesizing high-tier tiles!</p>

          <div id="ml-boards-list" style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; width:100%; max-width:440px; margin-bottom:1.25rem;">
            <!-- Dynamically populated -->
          </div>

          <button id="ml-btn-close-boards" class="btn btn-secondary" style="font-weight:700; width:100%; max-width:200px;">
            ← Back
          </button>
        </div>

        <!-- 3. Power-Up Codex / Tutorial Overlay -->
        <div id="ml-modal-codex" style="position:absolute; inset:0; background:rgba(6,10,23,0.95); backdrop-filter:blur(8px); display:none; flex-direction:column; justify-content:flex-start; align-items:center; padding:1.5rem; text-align:left; z-index:14; overflow-y:auto;">
          <div style="width:100%; max-width:480px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h2 style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan); margin:0;">📖 Lab Codex & Power-Ups</h2>
              <button id="ml-btn-close-codex" class="btn btn-sm btn-secondary" style="padding:0.3rem 0.6rem;">✕</button>
            </div>
            
            <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">
              Unlike other merge games, power-ups in <strong>Merge Lab</strong> spawn directly as <strong>collectible tiles on the board</strong>! When you swipe a numbered tile into a power-up, it activates immediately!
            </p>

            <div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.5rem;">
              ${Object.values(POWER_UP_TYPES).map(pu => `
                <div style="display:flex; align-items:center; gap:0.75rem; background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.6rem 0.85rem;">
                  <div style="font-size:1.8rem; min-width:36px; text-align:center;">${pu.icon}</div>
                  <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <strong style="color:${pu.color}; font-size:0.95rem;">${pu.name}</strong>
                      <span style="font-size:0.7rem; text-transform:uppercase; font-weight:800; background:rgba(255,255,255,0.08); padding:0.15rem 0.4rem; border-radius:4px; color:var(--text-muted);">${pu.rarity}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary);">${pu.desc}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4. Pause Menu Overlay -->
        <div id="ml-modal-pause" style="position:absolute; inset:0; background:rgba(6,10,23,0.88); backdrop-filter:blur(8px); display:none; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10;">
          <div style="font-size:3rem; margin-bottom:0.5rem;">⏸️</div>
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.25rem; color:var(--text-primary);">EXPERIMENT PAUSED</h2>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1.5rem;">The laboratory reaction is on hold.</p>

          <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%; max-width:260px;">
            <button id="ml-btn-resume" class="btn btn-primary btn-lg" style="font-weight:800;">
              ▶️ Resume (Esc)
            </button>
            <button id="ml-btn-restart-pause" class="btn btn-secondary btn-lg" style="font-weight:700;">
              🔄 Restart Run
            </button>
            <button id="ml-btn-menu-pause" class="btn btn-secondary" style="font-weight:600;">
              🏠 Main Menu
            </button>
          </div>
        </div>

        <!-- 5. Game Over Overlay -->
        <div id="ml-modal-gameover" style="position:absolute; inset:0; background:rgba(6,10,23,0.92); backdrop-filter:blur(8px); display:none; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10; overflow-y:auto;">
          <div style="font-size:3rem; margin-bottom:0.25rem;">💥</div>
          <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.25rem; color:var(--text-primary);">REACTION COMPLETE!</h2>
          <div id="ml-new-record-tag" style="display:none; background:linear-gradient(135deg, #eab308, #f59e0b); color:#000; font-size:0.8rem; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; padding:0.25rem 0.75rem; border-radius:999px; margin-bottom:0.75rem;">
            🏆 NEW LABORATORY RECORD!
          </div>

          <!-- Stats Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; width:100%; max-width:340px; margin-bottom:1.25rem;">
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Final Score</div>
              <div id="ml-go-score" style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan);">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Highest Tile</div>
              <div id="ml-go-tile" style="font-size:1.6rem; font-weight:900; color:var(--accent-amber);">2</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Total Merges</div>
              <div id="ml-go-merges" style="font-size:1.3rem; font-weight:800; color:var(--text-primary);">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Power-Ups Used</div>
              <div id="ml-go-powerups" style="font-size:1.3rem; font-weight:800; color:#34d399;">0</div>
            </div>
          </div>

          <!-- Leaderboard Rank Badge -->
          <div id="ml-go-rank-card" style="display:none; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); border-radius:var(--radius-md); padding:0.6rem 1rem; width:100%; max-width:340px; margin-bottom:1.25rem;">
            <div id="ml-go-rank-text" style="font-size:0.9rem; font-weight:700; color:var(--accent-cyan);">
              🏆 Submitted to Global Leaderboard!
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display:flex; flex-direction:column; gap:0.65rem; width:100%; max-width:340px;">
            <button id="ml-btn-play-again" class="btn btn-primary btn-lg" style="font-weight:900; font-size:1.15rem; padding:0.85rem;">
              🔄 PLAY AGAIN
            </button>
            <div style="display:flex; gap:0.65rem;">
              <a href="/leaderboards/" class="btn btn-secondary" style="flex:1; font-size:0.9rem; font-weight:700; text-align:center;">
                🏆 Leaderboard
              </a>
              <button id="ml-btn-menu-go" class="btn btn-secondary" style="flex:1; font-size:0.9rem; font-weight:700;">
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick How to Play Guide -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted); padding:0 0.5rem; flex-wrap:wrap; gap:0.5rem;">
        <div>🧪 <strong>Swipe / WASD</strong> to move all tiles</div>
        <div>💣 <strong>Collide into power-ups</strong> to collect them</div>
        <div>⚡ <strong>Bigger merges</strong> spawn rarer power-ups</div>
      </div>

    </div>
  `;

  // Canvas Setup
  canvas = document.getElementById('ml-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();

  // Event Handlers
  bindControls();

  // Initialize Menu Board Preview
  initMenuBoard();

  // Start Animation Loop
  lastTimestamp = performance.now();
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   Canvas Sizing & High-DPI Handling
   ========================================================================== */

function resizeCanvas() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.width = V_SIZE * dpr;
  canvas.height = V_SIZE * dpr;
  canvas.style.aspectRatio = '1 / 1';
}

window.addEventListener('resize', () => {
  if (canvas && gameState) resizeCanvas();
});

/* ==========================================================================
   Game Initialization & Lifecycle
   ========================================================================== */

function startNewGame() {
  playLabSound('swipe');
  gameState = 'PLAYING';

  // Reset Variables
  score = 0;
  combo = 0;
  maxCombo = 0;
  highestTile = 2;
  totalMerges = 0;
  powerUpsCollected = 0;
  overdriveTurns = 0;
  particles = [];
  floatingTexts = [];
  isAnimating = false;

  boardSize = BOARD_CONFIGS[currentBoardId].size;

  // Initialize Empty Board
  grid = [];
  for (let r = 0; r < boardSize; r++) {
    grid[r] = [];
    for (let c = 0; c < boardSize; c++) {
      grid[r][c] = null;
    }
  }

  // Spawn initial tiles
  const initialSpawns = boardSize >= 8 ? 4 : 2;
  for (let i = 0; i < initialSpawns; i++) {
    spawnNewNumberedTile();
  }

  // Handle Timed Mode
  if (timerInterval) clearInterval(timerInterval);
  if (gameMode === 'TIMED') {
    timeLeft = 180;
    document.getElementById('ml-hud-timer-container').style.display = 'block';
    document.getElementById('ml-hud-timer').textContent = `${timeLeft}s`;
    timerInterval = setInterval(() => {
      if (gameState === 'PLAYING') {
        timeLeft--;
        const timerEl = document.getElementById('ml-hud-timer');
        if (timerEl) timerEl.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          gameOver();
        }
      }
    }, 1000);
  } else {
    document.getElementById('ml-hud-timer-container').style.display = 'none';
  }

  updateHUD();

  // Hide Modals
  document.getElementById('ml-modal-menu').style.display = 'none';
  document.getElementById('ml-modal-boards').style.display = 'none';
  document.getElementById('ml-modal-codex').style.display = 'none';
  document.getElementById('ml-modal-pause').style.display = 'none';
  document.getElementById('ml-modal-gameover').style.display = 'none';
}

function initMenuBoard() {
  boardSize = 5;
  grid = [];
  for (let r = 0; r < boardSize; r++) {
    grid[r] = [];
    for (let c = 0; c < boardSize; c++) {
      grid[r][c] = null;
    }
  }
  // Decorative layout in menu
  grid[2][2] = createTile(128);
  grid[1][2] = createTile(64);
  grid[3][2] = createTile(64);
  grid[2][1] = createTile(32);
  grid[2][3] = createTile(32);
  grid[0][2] = createPowerUpTile('BOMB');
  grid[4][2] = createPowerUpTile('LIGHTNING');
  grid[2][0] = createPowerUpTile('WILD');
  grid[2][4] = createPowerUpTile('QUANTUM');
}

function pauseGame() {
  if (gameState !== 'PLAYING') return;
  gameState = 'PAUSED';
  document.getElementById('ml-modal-pause').style.display = 'flex';
}

function resumeGame() {
  if (gameState !== 'PAUSED') return;
  gameState = 'PLAYING';
  lastTimestamp = performance.now();
  document.getElementById('ml-modal-pause').style.display = 'none';
}

function gameOver() {
  if (timerInterval) clearInterval(timerInterval);
  gameState = 'GAMEOVER';
  playLabSound('game_over');

  // Check progression & board unlocks
  const prog = checkBoardUnlocks();
  const curRec = prog.records[currentBoardId] || { highScore: 0 };
  const isNewRecord = score > curRec.highScore;

  // Submit to Global Leaderboard
  let rankInfo = null;
  if (score > 0) {
    rankInfo = submitScore('merge-lab', score, `${score} pts (${currentBoardId} • Tile ${highestTile})`);
  }

  document.getElementById('ml-go-score').textContent = score;
  document.getElementById('ml-go-tile').textContent = highestTile;
  document.getElementById('ml-go-merges').textContent = totalMerges;
  document.getElementById('ml-go-powerups').textContent = powerUpsCollected;

  const newRecTag = document.getElementById('ml-new-record-tag');
  if (newRecTag) newRecTag.style.display = isNewRecord ? 'inline-block' : 'none';

  const rankCard = document.getElementById('ml-go-rank-card');
  const rankText = document.getElementById('ml-go-rank-text');
  if (rankCard && rankText && rankInfo) {
    rankCard.style.display = 'block';
    rankText.innerHTML = `🏆 <strong>Rank #${rankInfo.rank}</strong> Worldwide (${rankInfo.percentile})`;
  } else if (rankCard) {
    rankCard.style.display = 'none';
  }

  document.getElementById('ml-modal-gameover').style.display = 'flex';
}

/* ==========================================================================
   Tile Creation & Spawning Engine
   ========================================================================== */

let nextTileId = 1;

function createTile(val) {
  return {
    id: nextTileId++,
    isPowerUp: false,
    val: val,
    scale: 1,
    spawnAnim: 1.0,
    mergedInto: false
  };
}

function createPowerUpTile(typeKey) {
  const pu = POWER_UP_TYPES[typeKey] || POWER_UP_TYPES.BOMB;
  return {
    id: nextTileId++,
    isPowerUp: true,
    type: typeKey,
    info: pu,
    scale: 1,
    spawnAnim: 1.0
  };
}

function getEmptyCells() {
  const empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (!grid[r][c]) {
        empty.push({ r, c });
      }
    }
  }
  return empty;
}

function spawnNewNumberedTile() {
  const empty = getEmptyCells();
  if (empty.length === 0) return false;
  const pos = empty[Math.floor(Math.random() * empty.length)];
  const val = Math.random() < 0.88 ? 2 : 4;
  grid[pos.r][pos.c] = createTile(val);
  return true;
}

function checkAndSpawnPowerUp(mergedVal) {
  // Find matching probability tier
  const tier = POWER_UP_SPAWN_TIERS.find(t => mergedVal >= t.minVal && mergedVal <= t.maxVal);
  if (!tier) return;

  const effectiveChance = overdriveTurns > 0 ? 0.95 : tier.chance;
  if (Math.random() <= effectiveChance) {
    const empty = getEmptyCells();
    if (empty.length === 0) return; // Board full, gracefully skip

    const pos = empty[Math.floor(Math.random() * empty.length)];
    const chosenType = tier.pool[Math.floor(Math.random() * tier.pool.length)];
    const pu = createPowerUpTile(chosenType);
    grid[pos.r][pos.c] = pu;

    playLabSound('powerup_spawn');
    spawnPowerUpSpawnBurst(pos.r, pos.c, pu.info.color);
    spawnFloatingText(`+${pu.info.icon} ${pu.info.name}!`, getCellCenter(pos.r, pos.c).x, getCellCenter(pos.r, pos.c).y - 20, pu.info.color);
  }
}

/* ==========================================================================
   Swipe Movement & Board Resolution Engine
   ========================================================================== */

function executeMove(direction) {
  if (gameState !== 'PLAYING' || isAnimating) return;

  // Directions: 'UP', 'DOWN', 'LEFT', 'RIGHT'
  let dRow = 0, dCol = 0;
  if (direction === 'UP') dRow = -1;
  else if (direction === 'DOWN') dRow = 1;
  else if (direction === 'LEFT') dCol = -1;
  else if (direction === 'RIGHT') dCol = 1;

  let moved = false;
  let mergesThisTurn = 0;

  // Reset merged flags
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (grid[r][c]) grid[r][c].mergedInto = false;
    }
  }

  // Determine iteration order so tiles slide from leading edge
  const rowIndices = [];
  const colIndices = [];
  for (let i = 0; i < boardSize; i++) {
    rowIndices.push(i);
    colIndices.push(i);
  }
  if (dRow > 0) rowIndices.reverse();
  if (dCol > 0) colIndices.reverse();

  // Slide & Collide Tiles
  rowIndices.forEach(r => {
    colIndices.forEach(c => {
      const tile = grid[r][c];
      if (!tile) return;

      let curR = r;
      let curC = c;

      while (true) {
        const nextR = curR + dRow;
        const nextC = curC + dCol;

        // Wall boundary
        if (nextR < 0 || nextR >= boardSize || nextC < 0 || nextC >= boardSize) break;

        const target = grid[nextR][nextC];

        if (!target) {
          // Slide into empty cell
          grid[nextR][nextC] = tile;
          grid[curR][curC] = null;
          curR = nextR;
          curC = nextC;
          moved = true;
        } else {
          // 1. COLLISION WITH A POWER-UP TILE!
          if (target.isPowerUp) {
            // Collect target power-up using current tile
            activatePowerUp(target.type, nextR, nextC, tile);
            grid[nextR][nextC] = tile;
            grid[curR][curC] = null;
            moved = true;
            break;
          } else if (tile.isPowerUp) {
            // Power-up slid into a numbered tile
            activatePowerUp(tile.type, curR, curC, target);
            grid[curR][curC] = null;
            moved = true;
            break;
          }

          // 2. TILE-TO-TILE MERGE COLLISION
          const isWildMerge = tile.type === 'WILD' || target.type === 'WILD';
          const canMerge = (tile.val === target.val || isWildMerge) && !target.mergedInto && !tile.mergedInto;

          if (canMerge) {
            // Execute Merge!
            const newVal = isWildMerge ? (tile.val === target.val ? tile.val * 2 : Math.max(tile.val || 2, target.val || 2) * 2) : target.val * 2;
            const mult = overdriveTurns > 0 ? 3 : 1;
            const points = newVal * (combo + 1) * mult;

            score += points;
            totalMerges++;
            mergesThisTurn++;
            if (newVal > highestTile) highestTile = newVal;

            target.val = newVal;
            target.mergedInto = true;
            target.scale = 1.35; // Pop animation
            grid[curR][curC] = null;

            moved = true;
            playLabSound('merge', newVal);
            spawnMergeSparkles(nextR, nextC, TILE_COLORS[newVal]?.border || '#38bdf8');
            spawnFloatingText(`+${points}`, getCellCenter(nextR, nextC).x, getCellCenter(nextR, nextC).y - 12, '#fde047');

            // Chance to spawn in-board power-up from this merge
            checkAndSpawnPowerUp(newVal);
          }

          break; // Blocked by tile
        }
      }
    });
  });

  if (moved) {
    playLabSound('swipe');

    // Update Combo
    if (mergesThisTurn > 0) {
      combo++;
      if (combo > maxCombo) maxCombo = combo;
    } else {
      combo = 0;
    }

    if (overdriveTurns > 0) overdriveTurns--;

    // Spawn New Numbered Tiles
    const spawnNum = BOARD_CONFIGS[currentBoardId].spawnCount;
    for (let s = 0; s < spawnNum; s++) {
      spawnNewNumberedTile();
    }

    updateHUD();

    // Check Game Over
    if (checkGameOver()) {
      setTimeout(gameOver, 350);
    }
  }
}

function checkGameOver() {
  const empty = getEmptyCells();
  if (empty.length > 0) return false;

  // Check if any power-up is on the board (power-ups can always be activated or free space)
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (grid[r][c] && grid[r][c].isPowerUp) return false;
    }
  }

  // Check for any valid adjacent merge
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const cur = grid[r][c];
      if (!cur) return false;

      // Check right neighbor
      if (c + 1 < boardSize) {
        const right = grid[r][c + 1];
        if (right && (right.val === cur.val || right.type === 'WILD' || cur.type === 'WILD')) return false;
      }
      // Check down neighbor
      if (r + 1 < boardSize) {
        const down = grid[r + 1][c];
        if (down && (down.val === cur.val || down.type === 'WILD' || cur.type === 'WILD')) return false;
      }
    }
  }

  return true; // No valid moves remain
}

/* ==========================================================================
   Power-Up Activation Engine
   ========================================================================== */

function activatePowerUp(typeKey, atRow, atCol, triggeringTile) {
  powerUpsCollected++;
  playLabSound('powerup_collect');
  const pos = getCellCenter(atRow, atCol);

  if (typeKey === 'BOMB') {
    // 3x3 blast area
    screenShakeAmount = 10;
    playLabSound('bomb');
    let clearedCount = 0;
    for (let r = Math.max(0, atRow - 1); r <= Math.min(boardSize - 1, atRow + 1); r++) {
      for (let c = Math.max(0, atCol - 1); c <= Math.min(boardSize - 1, atCol + 1); c++) {
        if (grid[r][c] && grid[r][c] !== triggeringTile) {
          grid[r][c] = null;
          clearedCount++;
          spawnMergeSparkles(r, c, '#ef4444');
        }
      }
    }
    score += clearedCount * 50;
    spawnFloatingText('💣 BOMB DETONATED (+3×3)!', pos.x, pos.y - 25, '#ef4444');
  }

  else if (typeKey === 'ERASER') {
    // Find lowest tile on the board and erase it
    let lowestVal = Infinity;
    let targetCell = null;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const t = grid[r][c];
        if (t && !t.isPowerUp && t.val < lowestVal) {
          lowestVal = t.val;
          targetCell = { r, c };
        }
      }
    }
    if (targetCell) {
      grid[targetCell.r][targetCell.c] = null;
      spawnMergeSparkles(targetCell.r, targetCell.c, '#06b6d4');
      spawnFloatingText(`🧽 ERASED TILE ${lowestVal}!`, pos.x, pos.y - 25, '#06b6d4');
    }
  }

  else if (typeKey === 'SHUFFLE') {
    // Rearrange all numbered tiles randomly
    const tilesList = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[r][c] && !grid[r][c].isPowerUp) {
          tilesList.push(grid[r][c]);
          grid[r][c] = null;
        }
      }
    }
    // Shuffle tiles list
    for (let i = tilesList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesList[i], tilesList[j]] = [tilesList[j], tilesList[i]];
    }
    // Place back into random empty cells
    tilesList.forEach(t => {
      const empty = getEmptyCells();
      if (empty.length > 0) {
        const pick = empty[Math.floor(Math.random() * empty.length)];
        grid[pick.r][pick.c] = t;
      }
    });
    spawnFloatingText('🔀 TILES SHUFFLED!', pos.x, pos.y - 25, '#f97316');
  }

  else if (typeKey === 'LIGHTNING') {
    // Vaporize entire row or column (picks whichever has more tiles)
    playLabSound('lightning');
    screenShakeAmount = 8;
    let rowTiles = 0, colTiles = 0;
    for (let i = 0; i < boardSize; i++) {
      if (grid[atRow][i] && grid[atRow][i] !== triggeringTile) rowTiles++;
      if (grid[i][atCol] && grid[i][atCol] !== triggeringTile) colTiles++;
    }

    if (rowTiles >= colTiles) {
      for (let c = 0; c < boardSize; c++) {
        if (grid[atRow][c] && grid[atRow][c] !== triggeringTile) {
          grid[atRow][c] = null;
          spawnMergeSparkles(atRow, c, '#eab308');
        }
      }
      spawnFloatingText('⚡ LIGHTNING ROW CLEARED!', pos.x, pos.y - 25, '#eab308');
    } else {
      for (let r = 0; r < boardSize; r++) {
        if (grid[r][atCol] && grid[r][atCol] !== triggeringTile) {
          grid[r][atCol] = null;
          spawnMergeSparkles(r, atCol, '#eab308');
        }
      }
      spawnFloatingText('⚡ LIGHTNING COLUMN CLEARED!', pos.x, pos.y - 25, '#eab308');
    }
    score += 250;
  }

  else if (typeKey === 'MULTIPLIER') {
    // Double colliding tile value
    if (triggeringTile && !triggeringTile.isPowerUp) {
      triggeringTile.val *= 2;
      if (triggeringTile.val > highestTile) highestTile = triggeringTile.val;
      score += triggeringTile.val * 2;
      spawnFloatingText(`✖️ TILE DOUBLED TO ${triggeringTile.val}!`, pos.x, pos.y - 25, '#a855f7');
    }
  }

  else if (typeKey === 'MAGNET') {
    // Pull identical tile pairs adjacent to each other for instant merges
    let magneticMerges = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const t1 = grid[r][c];
        if (t1 && !t1.isPowerUp) {
          for (let r2 = r; r2 < boardSize; r2++) {
            for (let c2 = (r2 === r ? c + 1 : 0); c2 < boardSize; c2++) {
              const t2 = grid[r2][c2];
              if (t2 && !t2.isPowerUp && t2.val === t1.val) {
                // Merge t2 into t1!
                t1.val *= 2;
                grid[r2][c2] = null;
                magneticMerges++;
                score += t1.val;
                spawnMergeSparkles(r, c, '#3b82f6');
                break;
              }
            }
          }
        }
      }
    }
    spawnFloatingText(`🧲 MAGNET ATTRACTED ${magneticMerges} PAIRS!`, pos.x, pos.y - 25, '#3b82f6');
  }

  else if (typeKey === 'CHAIN_REACTOR') {
    // Chain merge all adjacent identical pairs
    let chainCount = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const cur = grid[r][c];
        if (cur && !cur.isPowerUp && !cur.mergedInto) {
          if (c + 1 < boardSize && grid[r][c + 1] && grid[r][c + 1].val === cur.val) {
            cur.val *= 2;
            cur.mergedInto = true;
            grid[r][c + 1] = null;
            chainCount++;
            score += cur.val * 2;
          }
        }
      }
    }
    spawnFloatingText(`⚛️ CHAIN REACTION (${chainCount} MERGES)!`, pos.x, pos.y - 25, '#ec4899');
  }

  else if (typeKey === 'WILD') {
    // Wild tile acts as a universal catalyst
    spawnFloatingText('🃏 WILD CATALYST COLLECTED!', pos.x, pos.y - 25, '#10b981');
  }

  else if (typeKey === 'BOARD_CLEANER') {
    // Clear all 2s and 4s
    let cleared = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const t = grid[r][c];
        if (t && !t.isPowerUp && (t.val === 2 || t.val === 4)) {
          grid[r][c] = null;
          cleared++;
          spawnMergeSparkles(r, c, '#14b8a6');
        }
      }
    }
    score += cleared * 30;
    spawnFloatingText(`🧹 CLEANED ${cleared} LOW TILES!`, pos.x, pos.y - 25, '#14b8a6');
  }

  else if (typeKey === 'BLACK_HOLE') {
    // 2-tile radius vortex
    screenShakeAmount = 14;
    let totalAbsorbed = 0;
    for (let r = Math.max(0, atRow - 2); r <= Math.min(boardSize - 1, atRow + 2); r++) {
      for (let c = Math.max(0, atCol - 2); c <= Math.min(boardSize - 1, atCol + 2); c++) {
        if (grid[r][c] && grid[r][c] !== triggeringTile) {
          totalAbsorbed += (grid[r][c].val || 10);
          grid[r][c] = null;
          spawnMergeSparkles(r, c, '#8b5cf6');
        }
      }
    }
    score += totalAbsorbed * 2 + 1000;
    spawnFloatingText(`🌌 BLACK HOLE CONVERTED +${totalAbsorbed * 2}!`, pos.x, pos.y - 25, '#8b5cf6');
  }

  else if (typeKey === 'QUANTUM') {
    // Advance tile 2 tiers higher (e.g. 128 -> 512)
    if (triggeringTile && !triggeringTile.isPowerUp) {
      triggeringTile.val *= 4;
      if (triggeringTile.val > highestTile) highestTile = triggeringTile.val;
      score += triggeringTile.val * 3;
      spawnFloatingText(`🧬 QUANTUM LEAP → ${triggeringTile.val}!`, pos.x, pos.y - 25, '#f43f5e');
    }
  }

  else if (typeKey === 'OVERDRIVE') {
    overdriveTurns = 5;
    score += 500;
    spawnFloatingText('🔥 OVERDRIVE SURGE (5 TURNS 3×)!', pos.x, pos.y - 25, '#fbbf24');
  }
}

/* ==========================================================================
   Visual Particles & Floating Texts
   ========================================================================== */

function spawnMergeSparkles(r, c, color) {
  const center = getCellCenter(r, c);
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 80;
    particles.push({
      x: center.x,
      y: center.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      color: color,
      alpha: 1,
      decay: 2.2
    });
  }
}

function spawnPowerUpSpawnBurst(r, c, color) {
  const center = getCellCenter(r, c);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const speed = 60 + Math.random() * 90;
    particles.push({
      x: center.x,
      y: center.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3,
      color: color,
      alpha: 1,
      decay: 1.8
    });
  }
}

function spawnFloatingText(text, x, y, color) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    vy: -35,
    color: color,
    alpha: 1
  });
}

function getCellCenter(r, c) {
  const padding = 14;
  const gap = boardSize >= 8 ? 6 : 10;
  const boardArea = V_SIZE - padding * 2;
  const cellSize = (boardArea - (boardSize - 1) * gap) / boardSize;
  const x = padding + c * (cellSize + gap) + cellSize / 2;
  const y = padding + r * (cellSize + gap) + cellSize / 2;
  return { x, y, cellSize };
}

/* ==========================================================================
   Main Game Loop & Rendering Engine
   ========================================================================== */

function gameLoop(now) {
  const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
  lastTimestamp = now;

  update(dt);
  render();

  animFrameId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  if (screenShakeAmount > 0) {
    screenShakeAmount = Math.max(0, screenShakeAmount - dt * 25);
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= dt * p.decay;
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  // Update Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.2;
    if (ft.alpha <= 0) floatingTexts.splice(i, 1);
  }

  // Animate Tile Scale Pop Decay
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const t = grid[r][c];
      if (t && t.scale > 1) {
        t.scale = Math.max(1, t.scale - dt * 2.5);
      }
    }
  }
}

function render() {
  if (!ctx || !canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  ctx.save();
  ctx.scale(dpr, dpr);

  if (screenShakeAmount > 0) {
    const sx = (Math.random() - 0.5) * screenShakeAmount;
    const sy = (Math.random() - 0.5) * screenShakeAmount;
    ctx.translate(sx, sy);
  }

  // Background Lab Chassis Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, V_SIZE);
  bgGrad.addColorStop(0, '#040713');
  bgGrad.addColorStop(1, '#090f24');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, V_SIZE, V_SIZE);

  // Draw Grid Matrix
  const padding = 14;
  const gap = boardSize >= 8 ? 6 : 10;
  const boardArea = V_SIZE - padding * 2;
  const cellSize = (boardArea - (boardSize - 1) * gap) / boardSize;

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const x = padding + c * (cellSize + gap);
      const y = padding + r * (cellSize + gap);

      // Empty Slot Well
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      roundRect(ctx, x, y, cellSize, cellSize, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const tile = grid[r][c];
      if (tile) {
        drawCellTile(tile, x, y, cellSize);
      }
    }
  }

  // Draw Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Draw Floating Text Popups
  floatingTexts.forEach(ft => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = '900 15px Inter, sans-serif';
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  ctx.restore();
}

function drawCellTile(t, x, y, size) {
  ctx.save();

  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.translate(cx, cy);
  ctx.scale(t.scale, t.scale);

  const drawX = -size / 2;
  const drawY = -size / 2;

  if (t.isPowerUp) {
    // Power-Up Tile Object
    const pu = t.info || POWER_UP_TYPES.BOMB;
    ctx.shadowColor = pu.glow;
    ctx.shadowBlur = 16;

    // Glowing border and vibrant dark background
    ctx.fillStyle = '#0f172a';
    roundRect(ctx, drawX, drawY, size, size, 8);
    ctx.fill();

    // Rarity Outer Border Ring
    ctx.strokeStyle = pu.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pulse Circle Aura
    ctx.fillStyle = pu.glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Icon Emoji
    const fontSize = Math.max(16, Math.floor(size * 0.42));
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pu.icon, 0, 0);

  } else {
    // Numbered Tile
    const colors = TILE_COLORS[t.val] || { bg: '#047857', text: '#d1fae5', border: '#34d399' };

    // Fill Tile Body
    ctx.fillStyle = colors.bg;
    roundRect(ctx, drawX, drawY, size, size, 8);
    ctx.fill();

    // Edge Highlight & Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Gloss bevel
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(drawX, drawY, size, 4);

    // Number Typography (dynamically auto-scaled based on digits & board size)
    const valStr = t.val.toString();
    let fontSize = Math.floor(size * 0.42);
    if (valStr.length >= 4) fontSize = Math.floor(size * 0.30);
    else if (valStr.length === 3) fontSize = Math.floor(size * 0.36);

    ctx.font = `900 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(valStr, 0, 0);
  }

  ctx.restore();
}

function roundRect(context, x, y, w, h, r) {
  if (context.roundRect) {
    context.beginPath();
    context.roundRect(x, y, w, h, r);
  } else {
    context.beginPath();
    context.rect(x, y, w, h);
  }
}

/* ==========================================================================
   HUD Updates & UI Synchronization
   ========================================================================== */

function updateHUD() {
  const scoreEl = document.getElementById('ml-hud-score');
  if (scoreEl) scoreEl.textContent = score;

  const prog = getProgression();
  const curRec = prog.records[currentBoardId] || { highScore: 0 };
  const bestEl = document.getElementById('ml-hud-best');
  if (bestEl) bestEl.textContent = Math.max(curRec.highScore, score);

  const highEl = document.getElementById('ml-hud-highest');
  if (highEl) highEl.textContent = highestTile;

  const comboEl = document.getElementById('ml-hud-combo');
  if (comboEl) comboEl.textContent = `${Math.max(1, combo)}x`;

  const boardLabel = document.getElementById('ml-hud-board-label');
  if (boardLabel) boardLabel.textContent = currentBoardId;

  const modeLabel = document.getElementById('ml-hud-mode-label');
  if (modeLabel) modeLabel.textContent = gameMode;
}

function openBoardSelectModal() {
  const modal = document.getElementById('ml-modal-boards');
  const list = document.getElementById('ml-boards-list');
  if (!modal || !list) return;

  const prog = getProgression();
  list.innerHTML = Object.values(BOARD_CONFIGS).map(b => {
    const isUnlocked = prog.unlocked.includes(b.id);
    const isCurrent = b.id === currentBoardId;
    const rec = prog.records[b.id] || { highScore: 0, maxTile: 2 };

    return `
      <div class="ml-board-card" data-board-id="${b.id}" style="background:rgba(255,255,255,${isCurrent ? '0.12' : '0.04'}); border:2px solid ${isCurrent ? 'var(--accent-cyan)' : (isUnlocked ? 'var(--border-color)' : 'rgba(239,68,68,0.4)')}; border-radius:var(--radius-lg); padding:0.85rem; text-align:left; cursor:${isUnlocked ? 'pointer' : 'not-allowed'}; opacity:${isUnlocked ? '1' : '0.6'};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <strong style="color:${isCurrent ? 'var(--accent-cyan)' : 'var(--text-primary)'}; font-size:1.05rem;">${b.size}×${b.size}</strong>
          <span style="font-size:0.75rem; font-weight:800; padding:0.15rem 0.45rem; border-radius:4px; ${isUnlocked ? 'background:rgba(16,185,129,0.2); color:#34d399;' : 'background:rgba(239,68,68,0.2); color:#f87171;'}">
            ${isUnlocked ? (isCurrent ? 'ACTIVE' : 'READY') : 'LOCKED 🔒'}
          </span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem; line-height:1.4;">
          ${isUnlocked ? `🏆 Best: <strong>${rec.highScore}</strong> • Max: <strong>${rec.maxTile}</strong>` : `🔒 Req: <em>${b.unlockReqText}</em>`}
        </div>
        ${isUnlocked ? `
          <button class="btn btn-sm ${isCurrent ? 'btn-primary' : 'btn-secondary'}" style="width:100%; font-size:0.8rem; font-weight:700;">
            ${isCurrent ? 'Playing Now' : 'Select Board'}
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  list.querySelectorAll('.ml-board-card').forEach(card => {
    card.addEventListener('click', () => {
      const bId = card.dataset.boardId;
      if (prog.unlocked.includes(bId)) {
        currentBoardId = bId;
        boardSize = BOARD_CONFIGS[bId].size;
        prog.activeBoard = bId;
        saveProgression(prog);
        modal.style.display = 'none';
        updateHUD();
        startNewGame();
      }
    });
  });

  modal.style.display = 'flex';
}

/* ==========================================================================
   Input Handling: Desktop (Keys/WASD) & Mobile Touch Gestures
   ========================================================================== */

function bindControls() {
  // Modal Buttons
  const btnStart = document.getElementById('ml-btn-start');
  const btnBoards = document.getElementById('ml-btn-open-boards');
  const btnCodex = document.getElementById('ml-btn-tutorial');
  const btnCloseCodex = document.getElementById('ml-btn-close-codex');
  const btnCloseBoards = document.getElementById('ml-btn-close-boards');
  const btnBoardSelect = document.getElementById('ml-board-select-btn');
  const btnModeToggle = document.getElementById('ml-mode-toggle-btn');
  const btnPause = document.getElementById('ml-pause-btn');
  const btnResume = document.getElementById('ml-btn-resume');
  const btnRestartPause = document.getElementById('ml-btn-restart-pause');
  const btnMenuPause = document.getElementById('ml-btn-menu-pause');
  const btnPlayAgain = document.getElementById('ml-btn-play-again');
  const btnMenuGo = document.getElementById('ml-btn-menu-go');
  const btnSound = document.getElementById('ml-sound-btn');

  if (btnStart) btnStart.addEventListener('click', startNewGame);
  if (btnBoards) btnBoards.addEventListener('click', openBoardSelectModal);
  if (btnBoardSelect) btnBoardSelect.addEventListener('click', openBoardSelectModal);
  if (btnCloseBoards) btnCloseBoards.addEventListener('click', () => {
    document.getElementById('ml-modal-boards').style.display = 'none';
  });

  if (btnCodex) btnCodex.addEventListener('click', () => {
    document.getElementById('ml-modal-codex').style.display = 'flex';
  });
  if (btnCloseCodex) btnCloseCodex.addEventListener('click', () => {
    document.getElementById('ml-modal-codex').style.display = 'none';
  });

  if (btnModeToggle) {
    btnModeToggle.addEventListener('click', () => {
      if (gameMode === 'CLASSIC') gameMode = 'TIMED';
      else if (gameMode === 'TIMED') gameMode = 'CHALLENGE';
      else gameMode = 'CLASSIC';
      updateHUD();
      if (gameState === 'PLAYING') startNewGame();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (gameState === 'PLAYING') pauseGame();
      else if (gameState === 'PAUSED') resumeGame();
    });
  }
  if (btnResume) btnResume.addEventListener('click', resumeGame);
  if (btnRestartPause) btnRestartPause.addEventListener('click', startNewGame);
  if (btnMenuPause) btnMenuPause.addEventListener('click', () => {
    document.getElementById('ml-modal-pause').style.display = 'none';
    document.getElementById('ml-modal-menu').style.display = 'flex';
    gameState = 'MENU';
    initMenuBoard();
  });

  if (btnPlayAgain) btnPlayAgain.addEventListener('click', startNewGame);
  if (btnMenuGo) btnMenuGo.addEventListener('click', () => {
    document.getElementById('ml-modal-gameover').style.display = 'none';
    document.getElementById('ml-modal-menu').style.display = 'flex';
    gameState = 'MENU';
    initMenuBoard();
  });

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = !toggleSound();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // Keyboard Event Handlers
  const handleKeyDown = (e) => {
    if (gameState === 'PLAYING') {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        executeMove('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        executeMove('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        executeMove('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        executeMove('RIGHT');
      } else if (e.code === 'Escape') {
        e.preventDefault();
        pauseGame();
      }
    } else if (gameState === 'PAUSED' && e.code === 'Escape') {
      e.preventDefault();
      resumeGame();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  containerRef._mlKeyHandler = handleKeyDown;

  // Touch Swipe Gesture Tracking
  if (canvas) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouching = true;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (!isTouching || e.changedTouches.length === 0) return;
      isTouching = false;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const minSwipeDistance = 30;

      if (Math.hypot(deltaX, deltaY) < minSwipeDistance) return;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) executeMove('RIGHT');
        else executeMove('LEFT');
      } else {
        if (deltaY > 0) executeMove('DOWN');
        else executeMove('UP');
      }
    }, { passive: true });

    // Desktop Mouse Drag Gesture Support
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDown = false;

    canvas.addEventListener('mousedown', (e) => {
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      isMouseDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;

      const deltaX = e.clientX - mouseStartX;
      const deltaY = e.clientY - mouseStartY;
      const minDrag = 35;

      if (Math.hypot(deltaX, deltaY) < minDrag) return;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) executeMove('RIGHT');
        else executeMove('LEFT');
      } else {
        if (deltaY > 0) executeMove('DOWN');
        else executeMove('UP');
      }
    });
  }
}

/* ==========================================================================
   Cleanup Routine (SPA Navigation Unmount)
   ========================================================================== */

export function cleanupMergeLabGame() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (containerRef && containerRef._mlKeyHandler) {
    window.removeEventListener('keydown', containerRef._mlKeyHandler);
    containerRef._mlKeyHandler = null;
  }
  gameState = 'MENU';
}
