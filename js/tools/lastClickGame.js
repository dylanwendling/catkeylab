/* ==========================================================================
   CatKeyLab - Last Click: A Power-Up Minesweeper Game
   High-Precision HTML5 Canvas & Grid Arcade Tactical Minesweeper
   Features Board-Based Collectible Power-Ups, Mine Defusal, Shield Protection,
   First-Click Cascade Guarantee, Combo Streaks, Daily Challenge & Leaderboards.
   ========================================================================== */

import { t } from '../i18n.js';
import { getAudioContext, isSoundEnabled, toggleSound } from '../audio.js';
import { submitScore, getLeaderboard, getAnonProfile } from '../leaderboard.js';

// Game State Enum: 'IDLE', 'PLAYING', 'TARGETING', 'WON', 'LOST'
let gameState = 'IDLE';

// Container & References
let containerRef = null;
let boardContainer = null;
let timerInterval = null;

// Difficulty Configurations
const DIFFICULTIES = {
  beginner: { id: 'beginner', name: 'Beginner', rows: 9, cols: 9, mines: 10, specials: 3, badge: '🟢 Easy' },
  intermediate: { id: 'intermediate', name: 'Intermediate', rows: 16, cols: 16, mines: 40, specials: 6, badge: '🟡 Medium' },
  expert: { id: 'expert', name: 'Expert', rows: 16, cols: 24, mines: 66, specials: 10, badge: '🔴 Hard' },
  daily: { id: 'daily', name: 'Daily Challenge', rows: 12, cols: 12, mines: 22, specials: 5, badge: '📅 Daily' }
};

let currentDiffId = 'beginner';

// Power-Up Special Tile Types
const SPECIAL_TYPES = {
  SCANNER: { id: 'SCANNER', name: 'Scanner', icon: '📡', color: '#06b6d4', desc: 'Scan 3×3 area to highlight mines for 5s' },
  DEFUSER: { id: 'DEFUSER', name: 'Defuser', icon: '✂️', color: '#10b981', desc: 'Disarm 1 mine & reduce neighboring numbers' },
  SHIELD: { id: 'SHIELD', name: 'Shield', icon: '🛡️', color: '#3b82f6', desc: 'Absorbs 1 accidental mine explosion' },
  PULSE: { id: 'PULSE', name: 'Reveal Pulse', icon: '⚡', color: '#a855f7', desc: 'Safely clears 3×3 zone without detonating mines' },
  DOUBLE_PTS: { id: 'DOUBLE_PTS', name: 'Double Points', icon: '🌟', color: '#eab308', desc: '2× points for next 10 safe reveals' },
  MYSTERY: { id: 'MYSTERY', name: 'Mystery Gift', icon: '🎁', color: '#ec4899', desc: 'Grants a random beneficial power-up' },
  CHAIN: { id: 'CHAIN', name: 'Chain Reaction', icon: '⚛️', color: '#f43f5e', desc: 'Sends an electrical pulse collecting nearby special tiles' },
  RECHARGE: { id: 'RECHARGE', name: 'Recharge', icon: '🔋', color: '#14b8a6', desc: 'Restores 1 charge to a depleted power-up' }
};

// Cyber Themes (Unlockable via Credits)
const THEMES = {
  cyber: { id: 'cyber', name: 'Cyber Neon', bg: '#070b19', tileBg: '#131c36', tileRev: '#0b1124', tileBorder: '#1e293b', cost: 0 },
  matrix: { id: 'matrix', name: 'Matrix Terminal', bg: '#021207', tileBg: '#052910', tileRev: '#021a0a', tileBorder: '#10b981', cost: 150 },
  retro: { id: 'retro', name: 'Arcade 95', bg: '#181b20', tileBg: '#2c3340', tileRev: '#1c212b', tileBorder: '#4b5563', cost: 300 },
  synthwave: { id: 'synthwave', name: 'Sunset Synth', bg: '#180728', tileBg: '#361159', tileRev: '#200838', tileBorder: '#ec4899', cost: 500 }
};

let currentThemeId = 'cyber';

// Number Color Palette (High contrast cyber neon)
const NUMBER_COLORS = [
  '',
  '#38bdf8', // 1: Cyan
  '#4ade80', // 2: Emerald Green
  '#f87171', // 3: Bright Rose / Red
  '#a855f7', // 4: Neon Purple
  '#f59e0b', // 5: Amber Gold
  '#2dd4bf', // 6: Teal
  '#f43f5e', // 7: Crimson
  '#ffffff'  // 8: Ultra White
];

// Board Grid State
let grid = []; // 2D array of cells: grid[r][c]
let rows = 9;
let cols = 9;
let totalMines = 10;
let remainingMines = 10;
let firstClickDone = false;

// Player Inventory & Stats
let inventory = {
  scanner: 1,
  defuser: 1,
  shield: 0,
  pulse: 0
};

let doublePtsRemaining = 0;
let score = 0;
let highScore = 0;
let movesCount = 0;
let secondsElapsed = 0;
let comboStreak = 0;
let maxComboStreak = 0;
let cyberCredits = 0;
let unlockedThemes = ['cyber'];

// Active Targeting State
let activeTargetingPowerUp = null; // 'scanner' | 'defuser' | 'pulse' | null

// Mobile Flag Mode Toggle
let mobileFlagMode = false;

// Seeded Random Number Generator for Daily Challenges
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let seededRng = null;

function getDailySeed() {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function getRandom() {
  if (currentDiffId === 'daily' && seededRng) {
    return seededRng();
  }
  return Math.random();
}

/* ==========================================================================
   Persistence & Storage
   ========================================================================== */

function loadPersistence() {
  try {
    highScore = parseInt(localStorage.getItem('catkeylab_lastclick_highscore')) || 0;
    cyberCredits = parseInt(localStorage.getItem('catkeylab_lastclick_credits')) || 0;
    const rawThemes = localStorage.getItem('catkeylab_lastclick_themes');
    if (rawThemes) unlockedThemes = JSON.parse(rawThemes);
    const savedTheme = localStorage.getItem('catkeylab_lastclick_active_theme');
    if (savedTheme && THEMES[savedTheme]) currentThemeId = savedTheme;
  } catch (e) {}
}

function savePersistence() {
  try {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('catkeylab_lastclick_highscore', highScore.toString());
    }
    localStorage.setItem('catkeylab_lastclick_credits', cyberCredits.toString());
    localStorage.setItem('catkeylab_lastclick_themes', JSON.stringify(unlockedThemes));
    localStorage.setItem('catkeylab_lastclick_active_theme', currentThemeId);
  } catch (e) {}
}

/* ==========================================================================
   Sound Synthesis System (Web Audio API)
   ========================================================================== */

function playSfx(type, param = 1) {
  if (!isSoundEnabled()) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'click_safe') {
      const freq = 360 + Math.min(param, 8) * 80;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.06);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'flag') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'unflag') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.setValueAtTime(460, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'powerup_collect') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } else if (type === 'scan') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'defuse') {
      [880, 1174.66, 1760].forEach((f, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);
        gain.gain.setValueAtTime(0.22, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } else if (type === 'shield_hit') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'pulse') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'explosion') {
      const bufferSize = actx.sampleRate * 0.45;
      const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = actx.createBufferSource();
      noise.buffer = buffer;
      const gain = actx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      noise.connect(gain);
      gain.connect(actx.destination);
      noise.start(now);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.22, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    }
  } catch (e) {}
}

/* ==========================================================================
   Board & Grid State Initialization
   ========================================================================== */

function initNewGame(diffId = currentDiffId) {
  currentDiffId = diffId;
  const cfg = DIFFICULTIES[diffId] || DIFFICULTIES.beginner;
  rows = cfg.rows;
  cols = cfg.cols;
  totalMines = cfg.mines;
  remainingMines = cfg.mines;

  if (diffId === 'daily') {
    seededRng = mulberry32(getDailySeed());
  } else {
    seededRng = null;
  }

  // Clear timers & state
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  secondsElapsed = 0;
  movesCount = 0;
  score = 0;
  comboStreak = 0;
  firstClickDone = false;
  activeTargetingPowerUp = null;
  doublePtsRemaining = 0;
  gameState = 'IDLE';

  // Base starting inventory
  inventory = {
    scanner: 1,
    defuser: 1,
    shield: 0,
    pulse: 0
  };

  // Build empty grid
  grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        r,
        c,
        isMine: false,
        adjacentMines: 0,
        state: 'HIDDEN', // 'HIDDEN' | 'REVEALED' | 'FLAGGED'
        specialTile: null, // null | key of SPECIAL_TYPES
        isScanned: false,
        isDefused: false
      });
    }
    grid.push(row);
  }

  renderBoardDOM();
  updateHUD();
  closeModals();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameState === 'PLAYING' || gameState === 'TARGETING') {
      secondsElapsed++;
      const timerEl = document.getElementById('lc-hud-timer');
      if (timerEl) timerEl.textContent = `${secondsElapsed}s`;
    }
  }, 1000);
}

/* First Click Safety & Procedural Generation */
function generateMinesAndSpecials(firstR, firstC) {
  const cfg = DIFFICULTIES[currentDiffId] || DIFFICULTIES.beginner;
  const safeCoords = new Set();

  // Protect clicked cell and all its immediate 8 neighbors to guarantee an opening cascade
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = firstR + dr;
      const nc = firstC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        safeCoords.add(`${nr},${nc}`);
      }
    }
  }

  // Eligible coordinates for mines
  const eligibleCoords = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeCoords.has(`${r},${c}`)) {
        eligibleCoords.push({ r, c });
      }
    }
  }

  // Shuffle eligible coordinates
  for (let i = eligibleCoords.length - 1; i > 0; i--) {
    const j = Math.floor(getRandom() * (i + 1));
    [eligibleCoords[i], eligibleCoords[j]] = [eligibleCoords[j], eligibleCoords[i]];
  }

  // Place mines
  const mineCount = Math.min(totalMines, eligibleCoords.length);
  for (let i = 0; i < mineCount; i++) {
    const { r, c } = eligibleCoords[i];
    grid[r][c].isMine = true;
  }

  // Remaining coordinates for special power-up tiles
  const remainingCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isMine && !(r === firstR && c === firstC)) {
        remainingCells.push({ r, c });
      }
    }
  }

  // Shuffle and place special tiles
  for (let i = remainingCells.length - 1; i > 0; i--) {
    const j = Math.floor(getRandom() * (i + 1));
    [remainingCells[i], remainingCells[j]] = [remainingCells[j], remainingCells[i]];
  }

  const specialKeys = Object.keys(SPECIAL_TYPES);
  const numSpecials = Math.min(cfg.specials, remainingCells.length);
  for (let i = 0; i < numSpecials; i++) {
    const { r, c } = remainingCells[i];
    const spKey = specialKeys[Math.floor(getRandom() * specialKeys.length)];
    grid[r][c].specialTile = spKey;
  }

  // Calculate adjacent mine counts
  calculateAllAdjacencies();
}

function calculateAllAdjacencies() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
              count++;
            }
          }
        }
        grid[r][c].adjacentMines = count;
      }
    }
  }
}

/* ==========================================================================
   Tile Reveal & Cascade Engine
   ========================================================================== */

function handleTileClick(r, c) {
  if (gameState !== 'IDLE' && gameState !== 'PLAYING') return;

  const cell = grid[r][c];

  // If flagged, ignore regular click
  if (cell.state === 'FLAGGED') return;

  // First click guarantees safety & starts timer
  if (!firstClickDone) {
    firstClickDone = true;
    gameState = 'PLAYING';
    generateMinesAndSpecials(r, c);
    startTimer();
  }

  movesCount++;

  // 1. If clicking a mine
  if (cell.isMine) {
    // Shield Check: Protect the run!
    if (inventory.shield > 0) {
      inventory.shield--;
      cell.isMine = false;
      cell.isDefused = true;
      cell.state = 'REVEALED';

      // Recalculate neighbors
      recalculateNeighborsAfterDefuse(r, c);
      remainingMines = Math.max(0, remainingMines - 1);
      score += 150;

      playSfx('shield_hit');
      spawnFloatingText('🛡️ SHIELD SAVED RUN!', r, c, '#3b82f6');
      renderCellDOM(r, c);
      updateHUD();
      checkWinCondition();
      return;
    }

    // Detonation & Defeat
    triggerGameOver(false, r, c);
    return;
  }

  // 2. Already revealed: Chording support
  if (cell.state === 'REVEALED') {
    handleChording(r, c);
    return;
  }

  // 3. Reveal Safe Tile
  revealCell(r, c);
  updateHUD();
  checkWinCondition();
}

function revealCell(r, c) {
  const cell = grid[r][c];
  if (cell.state !== 'HIDDEN' || cell.isMine) return;

  cell.state = 'REVEALED';
  comboStreak++;
  if (comboStreak > maxComboStreak) maxComboStreak = comboStreak;

  // Score Calculation
  let pts = 50 + (cell.adjacentMines * 15);
  if (doublePtsRemaining > 0) {
    pts *= 2;
    doublePtsRemaining--;
  }
  const comboMultiplier = Math.min(5, 1 + Math.floor(comboStreak / 4));
  pts *= comboMultiplier;
  score += pts;

  // Floating score flyout on combos
  if (comboStreak >= 3) {
    spawnFloatingText(`+${pts} (${comboMultiplier}x)`, r, c, '#fde047');
  }

  playSfx('click_safe', cell.adjacentMines);

  // Check special tile discovery
  if (cell.specialTile) {
    activateSpecialTile(cell.specialTile, r, c);
  }

  renderCellDOM(r, c);

  // Cascade Reveal for Empty (0 adjacent) Tiles
  if (cell.adjacentMines === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = grid[nr][nc];
          if (neighbor.state === 'HIDDEN' && !neighbor.isMine) {
            revealCell(nr, nc);
          }
        }
      }
    }
  }
}

/* Chording: Clicking a revealed number opens unflagged neighbors if flag count matches */
function handleChording(r, c) {
  const cell = grid[r][c];
  if (cell.state !== 'REVEALED' || cell.adjacentMines === 0) return;

  let flagCount = 0;
  const neighbors = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const n = grid[nr][nc];
        if (n.state === 'FLAGGED') flagCount++;
        if (n.state === 'HIDDEN') neighbors.push(n);
      }
    }
  }

  if (flagCount === cell.adjacentMines) {
    neighbors.forEach(n => {
      if (n.isMine) {
        if (inventory.shield > 0) {
          inventory.shield--;
          n.isMine = false;
          n.isDefused = true;
          n.state = 'REVEALED';
          recalculateNeighborsAfterDefuse(n.r, n.c);
          remainingMines = Math.max(0, remainingMines - 1);
          playSfx('shield_hit');
          spawnFloatingText('🛡️ SHIELD BLOCKED!', n.r, n.c, '#3b82f6');
          renderCellDOM(n.r, n.c);
        } else {
          triggerGameOver(false, n.r, n.c);
        }
      } else {
        revealCell(n.r, n.c);
      }
    });
    updateHUD();
    checkWinCondition();
  }
}

/* Flagging Toggle */
function toggleFlag(r, c) {
  if (gameState !== 'IDLE' && gameState !== 'PLAYING') return;
  const cell = grid[r][c];

  if (cell.state === 'REVEALED') return;

  if (cell.state === 'HIDDEN') {
    if (remainingMines <= 0) return; // Prevent excessive flags
    cell.state = 'FLAGGED';
    remainingMines--;
    playSfx('flag');
  } else if (cell.state === 'FLAGGED') {
    cell.state = 'HIDDEN';
    remainingMines++;
    playSfx('unflag');
  }

  renderCellDOM(r, c);
  updateHUD();
  checkWinCondition();
}

/* ==========================================================================
   Special Tiles & Power-Up Effects
   ========================================================================== */

function activateSpecialTile(typeKey, r, c) {
  const sp = SPECIAL_TYPES[typeKey];
  if (!sp) return;

  playSfx('powerup_collect');

  switch (typeKey) {
    case 'SCANNER':
      inventory.scanner = Math.min(3, inventory.scanner + 1);
      spawnFloatingText(`📡 +1 SCANNER!`, r, c, sp.color);
      break;

    case 'DEFUSER':
      inventory.defuser = Math.min(3, inventory.defuser + 1);
      spawnFloatingText(`✂️ +1 DEFUSER!`, r, c, sp.color);
      break;

    case 'SHIELD':
      inventory.shield = Math.min(2, inventory.shield + 1);
      spawnFloatingText(`🛡️ +1 SHIELD!`, r, c, sp.color);
      break;

    case 'PULSE':
      inventory.pulse = Math.min(3, inventory.pulse + 1);
      spawnFloatingText(`⚡ +1 REVEAL PULSE!`, r, c, sp.color);
      break;

    case 'DOUBLE_PTS':
      doublePtsRemaining += 10;
      spawnFloatingText(`🌟 2× POINTS (10 Moves)!`, r, c, sp.color);
      break;

    case 'MYSTERY':
      const gifts = ['SCANNER', 'DEFUSER', 'SHIELD', 'PULSE', 'DOUBLE_PTS'];
      const luckyGift = gifts[Math.floor(getRandom() * gifts.length)];
      activateSpecialTile(luckyGift, r, c);
      break;

    case 'CHAIN':
      triggerChainReaction(r, c);
      break;

    case 'RECHARGE':
      rechargeDepletedPowerUp(r, c);
      break;
  }
}

function triggerChainReaction(originR, originC) {
  spawnFloatingText('⚛️ CHAIN REACTION!', originR, originC, '#f43f5e');
  let chained = 0;

  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      const nr = originR + dr;
      const nc = originC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const cell = grid[nr][nc];
        if (cell.specialTile && cell.state === 'HIDDEN' && !cell.isMine) {
          chained++;
          revealCell(nr, nc);
        }
      }
    }
  }

  score += chained * 150;
}

function rechargeDepletedPowerUp(r, c) {
  if (inventory.scanner < 1) {
    inventory.scanner++;
    spawnFloatingText('🔋 RECHARGED SCANNER!', r, c, '#14b8a6');
  } else if (inventory.defuser < 1) {
    inventory.defuser++;
    spawnFloatingText('🔋 RECHARGED DEFUSER!', r, c, '#14b8a6');
  } else if (inventory.pulse < 1) {
    inventory.pulse++;
    spawnFloatingText('🔋 RECHARGED PULSE!', r, c, '#14b8a6');
  } else if (inventory.shield < 1) {
    inventory.shield++;
    spawnFloatingText('🔋 RECHARGED SHIELD!', r, c, '#14b8a6');
  } else {
    score += 300;
    spawnFloatingText('🔋 FULL CHARGES (+300 PTS)!', r, c, '#14b8a6');
  }
}

/* Dynamic Mine Disarm & Recalculation */
function recalculateNeighborsAfterDefuse(defusedR, defusedC) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = defusedR + dr;
      const nc = defusedC + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const n = grid[nr][nc];
        if (!n.isMine && n.adjacentMines > 0) {
          n.adjacentMines--;
          renderCellDOM(nr, nc);
        }
      }
    }
  }
}

/* ==========================================================================
   Targeting Mode (Scanner, Defuser, Reveal Pulse)
   ========================================================================== */

function selectTargetingPowerUp(powerUpKey) {
  if (gameState !== 'PLAYING') return;

  if (inventory[powerUpKey] <= 0) {
    spawnBanner(`❌ No ${powerUpKey.toUpperCase()} charges remaining!`);
    return;
  }

  if (activeTargetingPowerUp === powerUpKey) {
    cancelTargeting();
    return;
  }

  activeTargetingPowerUp = powerUpKey;
  gameState = 'TARGETING';

  updateHUD();
  spawnBanner(`🎯 Click board tile to target with ${powerUpKey.toUpperCase()} (or Cancel)`);
}

function cancelTargeting() {
  activeTargetingPowerUp = null;
  if (gameState === 'TARGETING') gameState = 'PLAYING';
  updateHUD();
  clearTargetReticles();
}

function handleTargetingClick(r, c) {
  if (!activeTargetingPowerUp) return;

  const targetCell = grid[r][c];

  if (activeTargetingPowerUp === 'scanner') {
    // 3×3 Radar Scan
    inventory.scanner--;
    playSfx('scan');
    let found = 0;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const cell = grid[nr][nc];
          cell.isScanned = true;
          if (cell.isMine) found++;
          renderCellDOM(nr, nc);
        }
      }
    }

    spawnFloatingText(`📡 SCAN: ${found} MINE(S)`, r, c, '#06b6d4');

    // Remove scan highlight after 5 seconds
    setTimeout(() => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            grid[nr][nc].isScanned = false;
            renderCellDOM(nr, nc);
          }
        }
      }
    }, 5000);

  } else if (activeTargetingPowerUp === 'defuser') {
    // Defuse Targeted Mine
    if (targetCell.state === 'REVEALED') {
      spawnBanner('⚠️ Cannot defuse an already revealed tile!');
      return;
    }

    if (!targetCell.isMine) {
      spawnBanner('ℹ️ No mine here! Safe reveal instead.');
      inventory.defuser--;
      revealCell(r, c);
    } else {
      inventory.defuser--;
      targetCell.isMine = false;
      targetCell.isDefused = true;
      targetCell.state = 'REVEALED';
      remainingMines = Math.max(0, remainingMines - 1);
      score += 250;

      recalculateNeighborsAfterDefuse(r, c);
      playSfx('defuse');
      spawnFloatingText('✂️ MINE DEFUSED!', r, c, '#10b981');
      renderCellDOM(r, c);
    }

  } else if (activeTargetingPowerUp === 'pulse') {
    // Reveal Pulse: Clears safe tiles in 3×3 zone, completely bypassing mines
    inventory.pulse--;
    playSfx('pulse');

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const cell = grid[nr][nc];
          if (!cell.isMine && cell.state === 'HIDDEN') {
            revealCell(nr, nc);
          }
        }
      }
    }
    spawnFloatingText('⚡ PULSE CLEARED SAFE TILES!', r, c, '#a855f7');
  }

  cancelTargeting();
  checkWinCondition();
}

function clearTargetReticles() {
  document.querySelectorAll('.lc-cell-targeted').forEach(el => el.classList.remove('lc-cell-targeted'));
}

/* ==========================================================================
   Win / Loss State Machine
   ========================================================================== */

function checkWinCondition() {
  if (gameState !== 'PLAYING') return;

  let allSafesRevealed = true;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.isMine && cell.state !== 'REVEALED') {
        allSafesRevealed = false;
        break;
      }
    }
    if (!allSafesRevealed) break;
  }

  if (allSafesRevealed) {
    triggerGameOver(true);
  }
}

function triggerGameOver(isWin, triggerR = 0, triggerC = 0) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;

  if (isWin) {
    gameState = 'WON';
    playSfx('win');

    // Time & Efficiency Bonus
    const timeBonus = Math.max(0, 1000 - (secondsElapsed * 5));
    const finalScore = score + timeBonus + (remainingMines * 100);
    score = finalScore;

    const earnedCredits = Math.max(10, Math.floor(finalScore / 50));
    cyberCredits += earnedCredits;
    savePersistence();

    // Submit to leaderboard
    submitScore('last-click', score);

    showVictoryModal(earnedCredits);
  } else {
    gameState = 'LOST';
    playSfx('explosion');
    comboStreak = 0;

    // Reveal all mines on the board
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.isMine) {
          cell.state = 'REVEALED';
          renderCellDOM(r, c);
        }
      }
    }

    savePersistence();
    showDefeatModal(triggerR, triggerC);
  }

  updateHUD();
}

/* ==========================================================================
   DOM Rendering & UI
   ========================================================================== */

export function renderLastClickGame(container) {
  containerRef = container;
  loadPersistence();

  container.innerHTML = `
    <style>
      .lc-wrapper {
        max-width: 680px;
        margin: 0 auto;
        user-select: none;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
      }

      /* Compact mobile padding & zero-scroll vertical footprint */
      @media (max-width: 768px) {
        .tool-page-main > div:first-child {
          margin-bottom: 0.25rem !important;
        }
        .tool-page-main > div:first-child h1 {
          font-size: 1.35rem !important;
          margin-bottom: 0.1rem !important;
        }
        .tool-page-main > div:first-child p {
          display: none !important;
        }
        .container {
          padding-top: 0.25rem !important;
        }
      }

      /* Clean 2-Row Unified HUD Card */
      .lc-hud-card {
        width: 100%;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 0.45rem 0.65rem;
        margin-bottom: 0.4rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        box-sizing: border-box;
      }

      .lc-hud-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        gap: 0.4rem;
      }

      .lc-hud-pills {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .lc-hud-pills::-webkit-scrollbar { display: none; }

      .lc-stat-pill {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: var(--radius-md);
        padding: 0.2rem 0.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 52px;
      }

      .lc-stat-label {
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        line-height: 1;
        margin-bottom: 0.1rem;
      }

      .lc-stat-val {
        font-size: 1.15rem;
        font-weight: 900;
        line-height: 1.1;
      }

      .lc-hud-actions {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .lc-btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 1.05rem;
        padding: 0;
        transition: all var(--transition-fast);
      }
      .lc-btn-icon:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: var(--accent-cyan);
      }

      /* Row 2: Secondary Control Strip (Flag Toggle + Power-Ups) */
      .lc-hud-sub-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: var(--radius-sm);
        padding: 0.2rem 0.45rem;
        gap: 0.4rem;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .lc-hud-sub-strip::-webkit-scrollbar { display: none; }

      .lc-flag-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
        border: 1px solid var(--border-color);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        white-space: nowrap;
        transition: all var(--transition-fast);
      }
      .lc-flag-toggle.active {
        background: rgba(244, 63, 94, 0.25);
        border-color: #f43f5e;
        color: #fb7185;
      }

      .lc-powerup-bar {
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .lc-powerup-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.2rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--text-primary);
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--transition-fast);
      }
      .lc-powerup-btn:hover:not(:disabled) {
        border-color: var(--accent-cyan);
        background: rgba(255, 255, 255, 0.12);
      }
      .lc-powerup-btn.active {
        background: rgba(6, 182, 212, 0.25);
        border-color: #06b6d4;
        color: #22d3ee;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
      }
      .lc-powerup-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .lc-powerup-count {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 999px;
        padding: 0.05rem 0.35rem;
        font-size: 0.65rem;
      }

      /* Notification Banner */
      #lc-banner {
        width: 100%;
        background: rgba(6, 182, 212, 0.15);
        border: 1px solid rgba(6, 182, 212, 0.35);
        border-radius: var(--radius-md);
        padding: 0.25rem 0.6rem;
        margin-bottom: 0.35rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--accent-cyan);
        text-align: center;
        display: none;
      }

      /* Grid Board Viewport Container */
      #lc-board-container {
        position: relative;
        width: 100%;
        max-width: 640px;
        max-height: calc(100dvh - 170px);
        background: #070b19;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-xl);
        overflow: auto;
        padding: 0.6rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        touch-action: pan-x pan-y;
        box-sizing: border-box;
        scrollbar-width: thin;
      }

      .lc-grid {
        display: grid;
        gap: 3px;
        margin: 0 auto;
        width: fit-content;
      }

      /* Grid Tile Cell */
      .lc-cell {
        width: 32px;
        height: 32px;
        background: #131c36;
        border: 1px solid #1e293b;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 900;
        cursor: pointer;
        transition: transform 0.05s, background-color 0.15s;
        box-sizing: border-box;
        position: relative;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .lc-cell:hover:not(.revealed) {
        background: #1d2b52;
        border-color: #38bdf8;
      }

      .lc-cell.revealed {
        background: #0b1124;
        border-color: rgba(255, 255, 255, 0.04);
        cursor: default;
      }

      .lc-cell.flagged {
        background: rgba(244, 63, 94, 0.18);
        border-color: #f43f5e;
      }

      .lc-cell.mine-revealed {
        background: rgba(239, 68, 68, 0.35);
        border-color: #ef4444;
      }

      .lc-cell.scanned-mine {
        border-color: #f97316 !important;
        box-shadow: 0 0 10px #f97316 !important;
        animation: lcRadarPulse 1s infinite alternate;
      }

      .lc-cell.defused-safe {
        background: rgba(16, 185, 129, 0.25) !important;
        border-color: #10b981 !important;
      }

      @keyframes lcRadarPulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.08); }
      }

      /* Floating Text Animations */
      .lc-flyout {
        position: absolute;
        pointer-events: none;
        font-weight: 900;
        font-size: 0.85rem;
        z-index: 20;
        animation: lcFlyUp 0.85s forwards ease-out;
      }

      @keyframes lcFlyUp {
        0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -24px) scale(1.2); }
      }

      /* Floating Modal Overlays */
      .lc-modal {
        position: absolute;
        inset: 0;
        background: rgba(6, 10, 23, 0.88);
        backdrop-filter: blur(8px);
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.25rem;
        text-align: center;
        z-index: 50;
      }
    </style>

    <div class="lc-wrapper">
      
      <!-- Unified Clean HUD Card -->
      <div class="lc-hud-card">
        
        <!-- Row 1: Mines, Time, Moves, Score, Best & Actions -->
        <div class="lc-hud-top-row">
          <div class="lc-hud-pills">
            <div class="lc-stat-pill" title="Remaining Mines">
              <span class="lc-stat-label">MINES</span>
              <span id="lc-hud-mines" class="lc-stat-val" style="color:var(--accent-rose);">💣 ${totalMines}</span>
            </div>
            <div class="lc-stat-pill" title="Elapsed Time">
              <span class="lc-stat-label">TIME</span>
              <span id="lc-hud-timer" class="lc-stat-val" style="color:var(--accent-amber);">0s</span>
            </div>
            <div class="lc-stat-pill" title="Score">
              <span class="lc-stat-label">SCORE</span>
              <span id="lc-hud-score" class="lc-stat-val" style="color:var(--accent-cyan);">0</span>
            </div>
            <div class="lc-stat-pill" title="Personal Best">
              <span class="lc-stat-label">BEST</span>
              <span id="lc-hud-best" class="lc-stat-val" style="color:#fde047;">${highScore}</span>
            </div>
          </div>

          <div class="lc-hud-actions">
            <button id="lc-diff-btn" class="lc-powerup-btn" style="font-size:0.75rem; padding:0.25rem 0.55rem;" title="Change Difficulty">
              ${DIFFICULTIES[currentDiffId].badge}
            </button>
            <button id="lc-btn-sound" class="lc-btn-icon" title="Toggle Audio">
              ${isSoundEnabled() ? '🔊' : '🔇'}
            </button>
            <button id="lc-btn-restart" class="lc-btn-icon" title="Restart Run">
              🔄
            </button>
          </div>
        </div>

        <!-- Row 2: Flag Mode & Power-Up Action Bar -->
        <div class="lc-hud-sub-strip">
          <button id="lc-btn-flag-toggle" class="lc-flag-toggle" title="Toggle Flagging Mode (or Right-Click)">
            <span>🚩 Flag Mode</span>
            <span id="lc-flag-status">OFF</span>
          </button>

          <div class="lc-powerup-bar">
            <button id="lc-pu-scanner" class="lc-powerup-btn" title="Scan 3×3 zone for hidden mines">
              <span>📡 Scan</span>
              <span id="lc-pu-scanner-count" class="lc-powerup-count">${inventory.scanner}</span>
            </button>
            <button id="lc-pu-defuser" class="lc-powerup-btn" title="Disarm a mine safely">
              <span>✂️ Defuse</span>
              <span id="lc-pu-defuser-count" class="lc-powerup-count">${inventory.defuser}</span>
            </button>
            <button id="lc-pu-shield" class="lc-powerup-btn" title="Passive: Absorbs next mine explosion" disabled>
              <span>🛡️ Shield</span>
              <span id="lc-pu-shield-count" class="lc-powerup-count">${inventory.shield}</span>
            </button>
            <button id="lc-pu-pulse" class="lc-powerup-btn" title="Safely reveal 3×3 safe zone">
              <span>⚡ Pulse</span>
              <span id="lc-pu-pulse-count" class="lc-powerup-count">${inventory.pulse}</span>
            </button>
            <button id="lc-btn-cancel-target" class="lc-powerup-btn" style="display:none; background:#ef4444; color:#fff;" title="Cancel targeting">
              ✖️ Cancel
            </button>
          </div>
        </div>

      </div>

      <!-- Tactical Feedback Banner -->
      <div id="lc-banner"></div>

      <!-- Main Game Board Container -->
      <div id="lc-board-container">
        <div id="lc-grid" class="lc-grid"></div>

        <!-- 1. Difficulty & Daily Challenge Selection Modal -->
        <div id="lc-modal-diff" class="lc-modal">
          <div style="font-size:2.4rem; margin-bottom:0.25rem;">💣</div>
          <h2 style="font-size:1.6rem; font-weight:900; margin-bottom:0.5rem; color:var(--text-primary);">SELECT DIFFICULTY</h2>
          <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%; max-width:280px; margin-bottom:1rem;">
            <button class="btn btn-secondary" onclick="window.lcSetDiff('beginner')">
              🟢 Beginner (9×9 • 10 Mines)
            </button>
            <button class="btn btn-secondary" onclick="window.lcSetDiff('intermediate')">
              🟡 Intermediate (16×16 • 40 Mines)
            </button>
            <button class="btn btn-secondary" onclick="window.lcSetDiff('expert')">
              🔴 Expert (24×16 • 66 Mines)
            </button>
            <button class="btn btn-primary" onclick="window.lcSetDiff('daily')" style="box-shadow:0 0 16px rgba(6,182,212,0.4);">
              📅 Daily Seeded Challenge
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.lcCloseDiff()">Close</button>
        </div>

        <!-- 2. Victory Modal -->
        <div id="lc-modal-victory" class="lc-modal">
          <div style="font-size:3rem; margin-bottom:0.25rem;">🏆</div>
          <h2 style="font-size:2rem; font-weight:900; color:#4ade80; margin-bottom:0.25rem;">BOARD CLEARED!</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1rem;">
            Tactical Mine Sweeping Masterclass. All threats neutralized.
          </p>
          <div style="background:rgba(255,255,255,0.05); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem 1.25rem; margin-bottom:1.25rem; width:100%; max-width:280px;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Final Score</div>
            <div id="lc-vic-score" style="font-size:1.8rem; font-weight:900; color:var(--accent-cyan);">0</div>
            <div id="lc-vic-credits" style="font-size:0.85rem; font-weight:700; color:#fde047; margin-top:0.2rem;">+0 Cyber Credits 🪙</div>
          </div>
          <button class="btn btn-primary btn-lg" onclick="window.lcRestart()" style="width:100%; max-width:260px; font-weight:900;">
            ▶️ PLAY AGAIN
          </button>
        </div>

        <!-- 3. Defeat Modal -->
        <div id="lc-modal-defeat" class="lc-modal">
          <div style="font-size:3rem; margin-bottom:0.25rem;">💥</div>
          <h2 style="font-size:2rem; font-weight:900; color:#f43f5e; margin-bottom:0.25rem;">DETONATION!</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1rem;">
            A hidden mine was triggered. Shield was depleted.
          </p>
          <div style="background:rgba(255,255,255,0.05); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem 1.25rem; margin-bottom:1.25rem; width:100%; max-width:280px;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Final Score</div>
            <div id="lc-def-score" style="font-size:1.8rem; font-weight:900; color:var(--accent-cyan);">0</div>
          </div>
          <button class="btn btn-primary btn-lg" onclick="window.lcRestart()" style="width:100%; max-width:260px; font-weight:900;">
            🔄 TRY AGAIN
          </button>
        </div>

      </div>

    </div>
  `;

  boardContainer = document.getElementById('lc-board-container');

  // Window helper hooks for inline onclicks
  window.lcRestart = () => initNewGame(currentDiffId);
  window.lcSetDiff = (id) => {
    initNewGame(id);
    document.getElementById('lc-modal-diff').style.display = 'none';
  };
  window.lcCloseDiff = () => {
    document.getElementById('lc-modal-diff').style.display = 'none';
  };

  bindUIEvents();
  initNewGame(currentDiffId);
}

function renderBoardDOM() {
  const gridEl = document.getElementById('lc-grid');
  if (!gridEl) return;

  gridEl.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
  gridEl.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellEl = document.createElement('div');
      cellEl.id = `lc-c-${r}-${c}`;
      cellEl.className = 'lc-cell';
      cellEl.dataset.r = r;
      cellEl.dataset.c = c;

      // Desktop Left Click & Mobile Tap
      cellEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameState === 'TARGETING') {
          handleTargetingClick(r, c);
        } else if (mobileFlagMode) {
          toggleFlag(r, c);
        } else {
          handleTileClick(r, c);
        }
      });

      // Desktop Right Click: Flagging
      cellEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(r, c);
      });

      gridEl.appendChild(cellEl);
    }
  }
}

function renderCellDOM(r, c) {
  const cell = grid[r][c];
  const cellEl = document.getElementById(`lc-c-${r}-${c}`);
  if (!cellEl) return;

  cellEl.className = 'lc-cell';
  cellEl.textContent = '';
  cellEl.style.color = '';

  if (cell.state === 'FLAGGED') {
    cellEl.classList.add('flagged');
    cellEl.textContent = '🚩';
    return;
  }

  if (cell.isScanned && cell.isMine) {
    cellEl.classList.add('scanned-mine');
    cellEl.textContent = '⚠️';
    return;
  }

  if (cell.state === 'REVEALED') {
    cellEl.classList.add('revealed');

    if (cell.isDefused) {
      cellEl.classList.add('defused-safe');
      cellEl.textContent = '🛠️';
      return;
    }

    if (cell.isMine) {
      cellEl.classList.add('mine-revealed');
      cellEl.textContent = '💣';
      return;
    }

    // Special Tile Emblem
    if (cell.specialTile) {
      const sp = SPECIAL_TYPES[cell.specialTile];
      if (sp) {
        cellEl.textContent = sp.icon;
        cellEl.title = sp.name;
        return;
      }
    }

    // Number Clues
    if (cell.adjacentMines > 0) {
      cellEl.textContent = cell.adjacentMines;
      cellEl.style.color = NUMBER_COLORS[cell.adjacentMines] || '#fff';
    }
  }
}

function updateHUD() {
  const minesEl = document.getElementById('lc-hud-mines');
  if (minesEl) minesEl.textContent = `💣 ${remainingMines}`;

  const scoreEl = document.getElementById('lc-hud-score');
  if (scoreEl) scoreEl.textContent = score;

  const bestEl = document.getElementById('lc-hud-best');
  if (bestEl) bestEl.textContent = Math.max(score, highScore);

  const diffBtn = document.getElementById('lc-diff-btn');
  if (diffBtn) diffBtn.textContent = DIFFICULTIES[currentDiffId].badge;

  // Inventory Charges
  const sCount = document.getElementById('lc-pu-scanner-count');
  if (sCount) sCount.textContent = inventory.scanner;
  const dCount = document.getElementById('lc-pu-defuser-count');
  if (dCount) dCount.textContent = inventory.defuser;
  const shCount = document.getElementById('lc-pu-shield-count');
  if (shCount) shCount.textContent = inventory.shield;
  const pCount = document.getElementById('lc-pu-pulse-count');
  if (pCount) pCount.textContent = inventory.pulse;

  // Targeting Active States
  document.getElementById('lc-pu-scanner')?.classList.toggle('active', activeTargetingPowerUp === 'scanner');
  document.getElementById('lc-pu-defuser')?.classList.toggle('active', activeTargetingPowerUp === 'defuser');
  document.getElementById('lc-pu-pulse')?.classList.toggle('active', activeTargetingPowerUp === 'pulse');

  const cancelBtn = document.getElementById('lc-btn-cancel-target');
  if (cancelBtn) cancelBtn.style.display = activeTargetingPowerUp ? 'inline-flex' : 'none';
}

function spawnFloatingText(text, r, c, color = '#22d3ee') {
  if (!boardContainer) return;
  const cellEl = document.getElementById(`lc-c-${r}-${c}`);
  if (!cellEl) return;

  const flyout = document.createElement('div');
  flyout.className = 'lc-flyout';
  flyout.textContent = text;
  flyout.style.color = color;

  const rect = cellEl.getBoundingClientRect();
  const parentRect = boardContainer.getBoundingClientRect();

  flyout.style.left = `${rect.left - parentRect.left + rect.width / 2}px`;
  flyout.style.top = `${rect.top - parentRect.top}px`;

  boardContainer.appendChild(flyout);
  setTimeout(() => flyout.remove(), 900);
}

function spawnBanner(msg) {
  const b = document.getElementById('lc-banner');
  if (!b) return;
  b.textContent = msg;
  b.style.display = 'block';
  setTimeout(() => {
    if (b.textContent === msg) b.style.display = 'none';
  }, 4000);
}

function showVictoryModal(credits) {
  const modal = document.getElementById('lc-modal-victory');
  const scoreEl = document.getElementById('lc-vic-score');
  const credEl = document.getElementById('lc-vic-credits');
  if (scoreEl) scoreEl.textContent = score;
  if (credEl) credEl.textContent = `+${credits} Cyber Credits 🪙`;
  if (modal) modal.style.display = 'flex';
}

function showDefeatModal(r, c) {
  const modal = document.getElementById('lc-modal-defeat');
  const scoreEl = document.getElementById('lc-def-score');
  if (scoreEl) scoreEl.textContent = score;
  if (modal) modal.style.display = 'flex';
}

function closeModals() {
  document.querySelectorAll('.lc-modal').forEach(m => m.style.display = 'none');
}

function bindUIEvents() {
  const btnRestart = document.getElementById('lc-btn-restart');
  if (btnRestart) btnRestart.addEventListener('click', () => initNewGame(currentDiffId));

  const btnSound = document.getElementById('lc-btn-sound');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = !toggleSound();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  const btnDiff = document.getElementById('lc-diff-btn');
  if (btnDiff) {
    btnDiff.addEventListener('click', () => {
      document.getElementById('lc-modal-diff').style.display = 'flex';
    });
  }

  // Mobile Flag Mode Toggle
  const btnFlagToggle = document.getElementById('lc-btn-flag-toggle');
  const flagStatusEl = document.getElementById('lc-flag-status');
  if (btnFlagToggle) {
    btnFlagToggle.addEventListener('click', () => {
      mobileFlagMode = !mobileFlagMode;
      btnFlagToggle.classList.toggle('active', mobileFlagMode);
      if (flagStatusEl) flagStatusEl.textContent = mobileFlagMode ? 'ON' : 'OFF';
    });
  }

  // Power-Up Targeting Triggers
  const puScanner = document.getElementById('lc-pu-scanner');
  if (puScanner) puScanner.addEventListener('click', () => selectTargetingPowerUp('scanner'));

  const puDefuser = document.getElementById('lc-pu-defuser');
  if (puDefuser) puDefuser.addEventListener('click', () => selectTargetingPowerUp('defuser'));

  const puPulse = document.getElementById('lc-pu-pulse');
  if (puPulse) puPulse.addEventListener('click', () => selectTargetingPowerUp('pulse'));

  const btnCancelTarget = document.getElementById('lc-btn-cancel-target');
  if (btnCancelTarget) btnCancelTarget.addEventListener('click', cancelTargeting);

  // Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (e.code === 'KeyF') {
      e.preventDefault();
      mobileFlagMode = !mobileFlagMode;
      btnFlagToggle?.classList.toggle('active', mobileFlagMode);
      if (flagStatusEl) flagStatusEl.textContent = mobileFlagMode ? 'ON' : 'OFF';
    } else if (e.code === 'Digit1') {
      selectTargetingPowerUp('scanner');
    } else if (e.code === 'Digit2') {
      selectTargetingPowerUp('defuser');
    } else if (e.code === 'Digit3') {
      selectTargetingPowerUp('pulse');
    } else if (e.code === 'Escape') {
      cancelTargeting();
      closeModals();
    } else if (e.code === 'Space' && (gameState === 'WON' || gameState === 'LOST')) {
      e.preventDefault();
      initNewGame(currentDiffId);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  if (containerRef) containerRef._lcKeyHandler = handleKeyDown;
}

/* ==========================================================================
   Cleanup Routine (Route Unmount)
   ========================================================================== */

export function cleanupLastClickGame() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (containerRef && containerRef._lcKeyHandler) {
    window.removeEventListener('keydown', containerRef._lcKeyHandler);
    containerRef._lcKeyHandler = null;
  }
  gameState = 'IDLE';
}
