/* ==========================================================================
   CatKeyLab - Split Master: Precision Cutting Puzzle Game
   A game where players must cut shapes as close to 50/50 as possible.
   Features: Classic Mode, Endless Mode, Daily Challenge, Leaderboard Integration,
   Polygon Clipping Area Calculation, Animated Cuts, Sound FX, Mobile Touch Support.
   ========================================================================== */

import { getAudioContext, isSoundEnabled, toggleSound } from '../audio.js';
import { submitScore, getLeaderboard, getAnonProfile } from '../leaderboard.js';

// ── Game State ───────────────────────────────────────────────────────────────
let gameState = 'MENU'; // 'MENU' | 'PLAYING' | 'RESULT' | 'GAMEOVER'
let containerRef = null;
let animFrameId = null;
let canvas = null;
let ctx = null;

// ── Mode & Session ───────────────────────────────────────────────────────────
let currentMode = 'classic'; // 'classic' | 'endless' | 'daily'
let round = 0;
let totalRounds = 8;
let totalScore = 0;
let roundScores = [];
let accuracyList = [];
let highScoreClassic = 0;
let highScoreEndless = 0;
let endlessLives = 3;

// ── Current Shape ────────────────────────────────────────────────────────────
let currentShape = null;
let cutLine = null;        // { x1, y1, x2, y2 } in canvas coords
let isDrawingCut = false;
let cutStart = null;
let cutConfirmed = false;
let cutAnimProgress = 0;
let halfA = null;   // polygon vertices
let halfB = null;   // polygon vertices
let separationAnim = 0;
let resultShown = false;
let inputLocked = false;

// ── Difficulty ───────────────────────────────────────────────────────────────
const DIFFICULTY_THRESHOLDS = [
  { round: 1, shapes: ['circle', 'rect', 'triangle', 'watermelon'] },
  { round: 3, shapes: ['circle', 'rect', 'triangle', 'pentagon', 'ellipse', 'watermelon', 'carrot', 'fish'] },
  { round: 5, shapes: ['circle', 'rect', 'triangle', 'pentagon', 'ellipse', 'star', 'lShape', 'arrow', 'watermelon', 'carrot', 'fish', 'bottle'] },
  { round: 7, shapes: ['circle', 'rect', 'triangle', 'pentagon', 'ellipse', 'star', 'lShape', 'arrow', 'cross', 'hexagon', 'watermelon', 'carrot', 'fish', 'bottle', 'blob'] }
];

// ── Seeded RNG (Daily Challenge) ─────────────────────────────────────────────
let seededRng = null;

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed() {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

function rng() {
  if (currentMode === 'daily' && seededRng) return seededRng();
  return Math.random();
}

// ── Canvas Sizing ─────────────────────────────────────────────────────────────
const V_W = 480;
const V_H = 400;
let scale = 1;

// ── Shape Color Palettes ──────────────────────────────────────────────────────
const SHAPE_PALETTES = [
  { fill: '#10b981', stroke: '#34d399', shadow: 'rgba(16,185,129,0.5)', name: 'Emerald' },
  { fill: '#3b82f6', stroke: '#60a5fa', shadow: 'rgba(59,130,246,0.5)', name: 'Blue' },
  { fill: '#8b5cf6', stroke: '#a78bfa', shadow: 'rgba(139,92,246,0.5)', name: 'Purple' },
  { fill: '#f43f5e', stroke: '#fb7185', shadow: 'rgba(244,63,94,0.5)', name: 'Rose' },
  { fill: '#f97316', stroke: '#fb923c', shadow: 'rgba(249,115,22,0.5)', name: 'Orange' },
  { fill: '#eab308', stroke: '#fde047', shadow: 'rgba(234,179,8,0.5)', name: 'Gold' },
  { fill: '#06b6d4', stroke: '#22d3ee', shadow: 'rgba(6,182,212,0.5)', name: 'Cyan' },
  { fill: '#ec4899', stroke: '#f472b6', shadow: 'rgba(236,72,153,0.5)', name: 'Pink' }
];

const SHAPE_NAMES = {
  circle: '🔵 Circle', rect: '🟥 Rectangle', triangle: '🔺 Triangle',
  pentagon: '⬠ Pentagon', ellipse: '🥚 Ellipse', star: '⭐ Star',
  lShape: '🔡 L-Shape', arrow: '➡️ Arrow', cross: '✚ Cross', hexagon: '⬡ Hexagon',
  watermelon: '🍉 Watermelon Slice', carrot: '🥕 Garden Carrot', fish: '🐟 Nibbles Fish',
  bottle: '🧪 Chemistry Flask', blob: '🫧 Irregular Blob'
};

const REACTION_MESSAGES = [
  { maxErr: 0.5, msgs: ['🎯 FLAWLESS! You cut with laser precision!', '🏆 PERFECT! Absolutely unbelievable!', '✨ MATHEMATICAL! Exactly 50/50!'] },
  { maxErr: 2, msgs: ['💎 INCREDIBLE! Almost perfect!', '🔥 HOT PRECISION! Nearly flawless!', '⚡ SUPERCUT! Razor-sharp accuracy!'] },
  { maxErr: 5, msgs: ['🌟 EXCELLENT! Very impressive!', '👏 GREAT CUT! You\'ve got the eye!', '✂️ SHARP! Great spatial sense!'] },
  { maxErr: 10, msgs: ['👍 GOOD! Solid spatial awareness!', '✅ NICE! Getting the hang of it!', '🙂 DECENT! Practice makes perfect!'] },
  { maxErr: 20, msgs: ['😅 NOT BAD! Close-ish!', '🤔 HMM! You\'ll nail it next time!', '📐 KEEP PRACTICING! You\'re learning!'] },
  { maxErr: 100, msgs: ['😬 ROUGH! Try again!', '🙈 WHOOPS! Needs more precision!', '😂 YIKES! Way off the 50/50 mark!'] }
];

// ────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ────────────────────────────────────────────────────────────────────────────

export function renderSplitMasterGame(container) {
  containerRef = container;
  gameState = 'MENU';
  totalScore = 0;
  round = 0;
  roundScores = [];
  accuracyList = [];

  try {
    highScoreClassic = parseInt(localStorage.getItem('sm_hs_classic')) || 0;
    highScoreEndless = parseInt(localStorage.getItem('sm_hs_endless')) || 0;
  } catch (e) {}

  renderMenuHTML();
}

export function cleanupSplitMasterGame() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  removeCanvasListeners();
  containerRef = null;
  canvas = null;
  ctx = null;
  currentShape = null;
  cutLine = null;
  halfA = null;
  halfB = null;
  inputLocked = false;
}

// ── Menu ─────────────────────────────────────────────────────────────────────

function renderMenuHTML() {
  if (!containerRef) return;
  gameState = 'MENU';

  const lb_classic = getLeaderboard('split-master-classic');
  const lb_endless = getLeaderboard('split-master-endless');
  const lb_daily = getLeaderboard('split-master-daily');

  const topClassic = lb_classic[0];
  const topEndless = lb_endless[0];
  const topDaily = lb_daily[0];

  const profile = getAnonProfile();
  const myClassic = lb_classic.find(e => e.handle === profile.handle);
  const myEndless = lb_endless.find(e => e.handle === profile.handle);

  containerRef.innerHTML = `
    <div class="container section" style="padding-top:1.5rem;">
      <div class="tool-wrapper" style="max-width:760px; margin:0 auto;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:2rem;">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">✂️</div>
          <h1 style="font-size:2.2rem; font-weight:900; letter-spacing:-0.03em; background:linear-gradient(135deg,#10b981,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Split Master</h1>
          <p style="color:var(--text-secondary); font-size:1.05rem; margin-top:0.4rem;">Cut shapes as close to 50/50 as possible. The closer to perfect, the more points!</p>
        </div>

        <!-- Mode Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-bottom:2rem;">
          <div class="sm-mode-card" id="sm-btn-classic" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; text-align:center; transition:all 0.2s;">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎯</div>
            <div style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">Classic</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem;">8 Rounds • Increasing Difficulty</div>
            ${myClassic ? `<div style="margin-top:0.75rem; font-size:0.8rem; color:var(--accent-cyan); font-weight:700;">Your Best: ${myClassic.score.toLocaleString()} pts</div>` : `<div style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">No score yet</div>`}
          </div>
          <div class="sm-mode-card" id="sm-btn-endless" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; text-align:center; transition:all 0.2s;">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">♾️</div>
            <div style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">Endless</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem;">Continuous • Score Attack</div>
            ${myEndless ? `<div style="margin-top:0.75rem; font-size:0.8rem; color:var(--accent-cyan); font-weight:700;">Your Best: ${myEndless.score.toLocaleString()} pts</div>` : `<div style="margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">No score yet</div>`}
          </div>
          <div class="sm-mode-card" id="sm-btn-daily" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; text-align:center; transition:all 0.2s;">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">📅</div>
            <div style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">Daily Challenge</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem;">Same shapes for everyone today</div>
            <div style="margin-top:0.75rem; font-size:0.8rem; color:#f59e0b; font-weight:700;">${new Date().toLocaleDateString('en', { month:'short', day:'numeric' })} Challenge</div>
          </div>
        </div>

        <!-- Top Scores Row -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:2rem;">
          ${topClassic ? `<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center;"><div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">🏆 Classic Record</div><div style="font-size:1.2rem; font-weight:800; color:var(--accent-cyan); margin-top:0.25rem;">${topClassic.score.toLocaleString()} pts</div><div style="font-size:0.8rem; color:var(--text-secondary);">${topClassic.avatar} ${topClassic.handle}</div></div>` : ''}
          ${topEndless ? `<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center;"><div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">♾️ Endless Record</div><div style="font-size:1.2rem; font-weight:800; color:var(--accent-cyan); margin-top:0.25rem;">${topEndless.score.toLocaleString()} pts</div><div style="font-size:0.8rem; color:var(--text-secondary);">${topEndless.avatar} ${topEndless.handle}</div></div>` : ''}
          ${topDaily ? `<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center;"><div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">📅 Daily Record</div><div style="font-size:1.2rem; font-weight:800; color:var(--accent-cyan); margin-top:0.25rem;">${topDaily.score.toLocaleString()} pts</div><div style="font-size:0.8rem; color:var(--text-secondary);">${topDaily.avatar} ${topDaily.handle}</div></div>` : ''}
        </div>

        <!-- How to Play -->
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1.5rem;">
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.75rem;">✂️ How to Play</div>
          <ul style="color:var(--text-secondary); font-size:0.92rem; line-height:2; list-style:disc; padding-left:1.25rem;">
            <li>Click & drag to draw a cutting line across the shape</li>
            <li>Release to confirm your cut — see how close to 50/50 you are!</li>
            <li>Earn up to <strong style="color:var(--accent-cyan);">1,000 points</strong> per round based on accuracy</li>
            <li>A perfect 50/50 split = maximum points</li>
          </ul>
        </div>

        <!-- Sound Button -->
        <div style="text-align:center;">
          <button id="sm-sound-toggle" class="btn btn-secondary btn-sm" style="margin-right:0.5rem;">${isSoundEnabled() ? '🔊 Sound On' : '🔇 Sound Off'}</button>
        </div>
      </div>
    </div>
  `;

  // Mode hover effect
  containerRef.querySelectorAll('.sm-mode-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = 'var(--accent-cyan)';
      card.style.transform = 'translateY(-3px)';
      card.style.boxShadow = '0 8px 24px rgba(16,185,129,0.2)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = 'var(--border-color)';
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  const btnClassic = document.getElementById('sm-btn-classic');
  const btnEndless = document.getElementById('sm-btn-endless');
  const btnDaily = document.getElementById('sm-btn-daily');
  const btnSound = document.getElementById('sm-sound-toggle');

  if (btnClassic) btnClassic.addEventListener('click', () => startGame('classic'));
  if (btnEndless) btnEndless.addEventListener('click', () => startGame('endless'));
  if (btnDaily) btnDaily.addEventListener('click', () => startGame('daily'));
  if (btnSound) btnSound.addEventListener('click', () => {
    toggleSound();
    btnSound.textContent = isSoundEnabled() ? '🔊 Sound On' : '🔇 Sound Off';
  });
}

// ── Game Start ────────────────────────────────────────────────────────────────

function startGame(mode) {
  currentMode = mode;
  round = 0;
  totalScore = 0;
  roundScores = [];
  accuracyList = [];
  inputLocked = false;

  if (mode === 'daily') {
    seededRng = mulberry32(getDailySeed());
    totalRounds = 6;
  } else if (mode === 'classic') {
    seededRng = null;
    totalRounds = 8;
  } else {
    seededRng = null;
    totalRounds = Infinity;
    endlessLives = 3;
  }

  renderGameHTML();
  nextRound();
}

// ── Game HTML Shell ───────────────────────────────────────────────────────────

function renderGameHTML() {
  if (!containerRef) return;
  gameState = 'PLAYING';

  const modeLabel = currentMode === 'classic' ? '🎯 Classic' : currentMode === 'endless' ? '♾️ Endless' : '📅 Daily';

  containerRef.innerHTML = `
    <div class="container section" style="padding-top:1rem;">
      <div style="max-width:700px; margin:0 auto;">
        <!-- HUD -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">${modeLabel}</div>
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:0.3rem 0.75rem; font-size:0.9rem; color:var(--text-secondary);">
              Round <span id="sm-round-num">1</span>${currentMode !== 'endless' ? `/${totalRounds}` : ''}
            </div>
            ${currentMode === 'endless' ? `<div id="sm-lives-container" style="font-size:1rem; letter-spacing:2px;" title="Remaining Lives">${'❤️'.repeat(endlessLives)}</div>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="font-weight:800; font-size:1.2rem; color:var(--accent-cyan);"><span id="sm-total-score">0</span> pts</div>
            <button id="sm-menu-btn" class="btn btn-secondary btn-sm">✖ Menu</button>
            <button id="sm-sound-btn" class="btn btn-secondary btn-sm">${isSoundEnabled() ? '🔊' : '🔇'}</button>
          </div>
        </div>

        <!-- Shape Name Label -->
        <div style="text-align:center; margin-bottom:0.75rem;">
          <span id="sm-shape-label" style="font-size:1rem; font-weight:700; color:var(--text-secondary); letter-spacing:0.05em; text-transform:uppercase;"></span>
        </div>

        <!-- Instructions -->
        <div id="sm-instructions" style="text-align:center; margin-bottom:0.5rem; color:var(--text-muted); font-size:0.88rem;">
          Click and drag across the shape to draw your cut line
        </div>

        <!-- Canvas -->
        <div style="position:relative; display:flex; justify-content:center;">
          <canvas id="sm-canvas" style="border-radius:var(--radius-lg); border:1px solid var(--border-color); cursor:crosshair; touch-action:none; display:block;"></canvas>
        </div>

        <!-- Result Panel -->
        <div id="sm-result-panel" style="display:none; margin-top:1.25rem; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; text-align:center;">
          <div id="sm-result-reaction" style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom:0.5rem;"></div>
          <div id="sm-result-accuracy" style="font-size:1rem; color:var(--text-secondary); margin-bottom:0.25rem;"></div>
          <div id="sm-result-score" style="font-size:1.3rem; font-weight:800; color:var(--accent-cyan); margin-bottom:1rem;"></div>
          <div id="sm-result-split" style="display:flex; gap:1rem; justify-content:center; margin-bottom:1rem;"></div>
          <button id="sm-continue-btn" class="btn btn-primary" style="min-width:160px;">Next Shape →</button>
        </div>
      </div>
    </div>
  `;

  canvas = document.getElementById('sm-canvas');
  initCanvas();
  bindGameEvents();
}

function initCanvas() {
  if (!canvas) return;
  const container = canvas.parentElement;
  const maxW = Math.min(container.clientWidth - 32, 480);
  scale = maxW / V_W;
  canvas.width = Math.round(V_W * scale);
  canvas.height = Math.round(V_H * scale);
  ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
}

// ── Next Round ────────────────────────────────────────────────────────────────

function nextRound() {
  round++;
  cutLine = null;
  cutConfirmed = false;
  halfA = null;
  halfB = null;
  separationAnim = 0;
  resultShown = false;
  inputLocked = false;

  const shapeList = getAvailableShapes();
  const shapeType = shapeList[Math.floor(rng() * shapeList.length)];
  const palette = SHAPE_PALETTES[Math.floor(rng() * SHAPE_PALETTES.length)];
  currentShape = generateShape(shapeType, palette);

  // Update HUD
  const roundEl = document.getElementById('sm-round-num');
  const scoreEl = document.getElementById('sm-total-score');
  const labelEl = document.getElementById('sm-shape-label');
  if (roundEl) roundEl.textContent = round;
  if (scoreEl) scoreEl.textContent = totalScore.toLocaleString();
  if (labelEl) labelEl.textContent = SHAPE_NAMES[shapeType] || shapeType;

  // Hide result panel
  const panel = document.getElementById('sm-result-panel');
  if (panel) panel.style.display = 'none';

  // Update instructions
  const instr = document.getElementById('sm-instructions');
  if (instr) instr.style.display = '';

  startDrawLoop();
}

function getAvailableShapes() {
  let shapes = DIFFICULTY_THRESHOLDS[0].shapes;
  for (const t of DIFFICULTY_THRESHOLDS) {
    if (round >= t.round) shapes = t.shapes;
  }
  return shapes;
}

// ── Shape Generation ─────────────────────────────────────────────────────────

function generateShape(type, palette) {
  const cx = V_W / 2;
  const cy = V_H / 2;
  let verts = [];
  let shapeType = type;

  switch (type) {
    case 'circle': {
      const r = 90 + rng() * 40;
      verts = circleToPolygon(cx, cy, r, 64);
      break;
    }
    case 'rect': {
      const w = 120 + rng() * 120;
      const h = 80 + rng() * 100;
      verts = rectToPolygon(cx - w / 2, cy - h / 2, w, h);
      break;
    }
    case 'triangle': {
      const r = 100 + rng() * 40;
      verts = regularPolygon(cx, cy, r, 3, rng() * Math.PI);
      break;
    }
    case 'pentagon': {
      const r = 90 + rng() * 30;
      verts = regularPolygon(cx, cy, r, 5, rng() * Math.PI);
      break;
    }
    case 'hexagon': {
      const r = 90 + rng() * 30;
      verts = regularPolygon(cx, cy, r, 6, rng() * Math.PI);
      break;
    }
    case 'ellipse': {
      const rx = 100 + rng() * 50;
      const ry = 55 + rng() * 35;
      const angle = rng() * Math.PI;
      verts = ellipseToPolygon(cx, cy, rx, ry, angle, 64);
      break;
    }
    case 'star': {
      const ro = 100 + rng() * 30;
      const ri = ro * (0.35 + rng() * 0.2);
      verts = starPolygon(cx, cy, ro, ri, 5, rng() * Math.PI);
      break;
    }
    case 'lShape': {
      const s = 70 + rng() * 40;
      verts = lShapePolygon(cx, cy, s);
      break;
    }
    case 'arrow': {
      const w = 160 + rng() * 40;
      const h = 100 + rng() * 40;
      verts = arrowPolygon(cx, cy, w, h);
      break;
    }
    case 'cross': {
      const arm = 55 + rng() * 25;
      const thick = 35 + rng() * 15;
      verts = crossPolygon(cx, cy, arm, thick);
      break;
    }
    case 'watermelon': {
      const r = 90 + rng() * 30;
      const angle = rng() * Math.PI * 2;
      verts = watermelonPolygon(cx, cy, r, angle);
      break;
    }
    case 'carrot': {
      const w = 70 + rng() * 20;
      const h = 130 + rng() * 30;
      const angle = rng() * Math.PI * 2;
      verts = carrotPolygon(cx, cy, w, h, angle);
      break;
    }
    case 'fish': {
      const len = 140 + rng() * 30;
      const angle = rng() * Math.PI * 2;
      verts = fishPolygon(cx, cy, len, angle);
      break;
    }
    case 'bottle': {
      const w = 90 + rng() * 25;
      const h = 120 + rng() * 30;
      verts = bottlePolygon(cx, cy, w, h);
      break;
    }
    case 'blob': {
      const r = 85 + rng() * 25;
      const angle = rng() * Math.PI * 2;
      verts = blobPolygon(cx, cy, r, angle);
      break;
    }
    default: {
      verts = circleToPolygon(cx, cy, 100, 64);
    }
  }

  return { type: shapeType, verts, palette, cx, cy };
}

// ── Polygon Generators ────────────────────────────────────────────────────────

function circleToPolygon(cx, cy, r, n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

function ellipseToPolygon(cx, cy, rx, ry, angle, n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const px = Math.cos(a) * rx;
    const py = Math.sin(a) * ry;
    return {
      x: cx + Math.cos(angle) * px - Math.sin(angle) * py,
      y: cy + Math.sin(angle) * px + Math.cos(angle) * py
    };
  });
}

function regularPolygon(cx, cy, r, n, offset = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

function rectToPolygon(x, y, w, h) {
  return [
    { x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }
  ];
}

function starPolygon(cx, cy, ro, ri, points, offset = 0) {
  const verts = [];
  for (let i = 0; i < points * 2; i++) {
    const a = offset + (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? ro : ri;
    verts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return verts;
}

function lShapePolygon(cx, cy, s) {
  return [
    { x: cx - s, y: cy - s },
    { x: cx, y: cy - s },
    { x: cx, y: cy },
    { x: cx + s, y: cy },
    { x: cx + s, y: cy + s },
    { x: cx - s, y: cy + s }
  ];
}

function arrowPolygon(cx, cy, w, h) {
  const hw = w / 2, hh = h / 2, arrowW = hw * 0.5;
  return [
    { x: cx - hw, y: cy - hh * 0.35 },
    { x: cx, y: cy - hh * 0.35 },
    { x: cx, y: cy - hh },
    { x: cx + hw, y: cy },
    { x: cx, y: cy + hh },
    { x: cx, y: cy + hh * 0.35 },
    { x: cx - hw, y: cy + hh * 0.35 }
  ];
}

function crossPolygon(cx, cy, arm, thick) {
  const t = thick / 2;
  return [
    { x: cx - t, y: cy - arm },
    { x: cx + t, y: cy - arm },
    { x: cx + t, y: cy - t },
    { x: cx + arm, y: cy - t },
    { x: cx + arm, y: cy + t },
    { x: cx + t, y: cy + t },
    { x: cx + t, y: cy + arm },
    { x: cx - t, y: cy + arm },
    { x: cx - t, y: cy + t },
    { x: cx - arm, y: cy + t },
    { x: cx - arm, y: cy - t },
    { x: cx - t, y: cy - t }
  ];
}

function watermelonPolygon(cx, cy, r, angle = 0) {
  const verts = [{ x: cx, y: cy }];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const a = angle + (Math.PI * i) / steps;
    verts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return verts;
}

function carrotPolygon(cx, cy, w, h, angle = 0) {
  const verts = [];
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  function rot(x, y) {
    return { x: cx + x * cos - y * sin, y: cy + x * sin + y * cos };
  }
  verts.push(rot(0, h * 0.55));
  verts.push(rot(w * 0.5, -h * 0.25));
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI * i) / 8;
    verts.push(rot((w * 0.5) * Math.cos(a), -h * 0.25 - (w * 0.3) * Math.sin(a)));
  }
  verts.push(rot(-w * 0.5, -h * 0.25));
  return verts;
}

function fishPolygon(cx, cy, len, angle = 0) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  function rot(x, y) {
    return { x: cx + x * cos - y * sin, y: cy + x * sin + y * cos };
  }
  const verts = [];
  verts.push(rot(len * 0.5, 0));
  for (let i = 1; i <= 8; i++) {
    const t = (i / 8) * Math.PI;
    verts.push(rot(len * 0.45 * Math.cos(t), -len * 0.25 * Math.sin(t)));
  }
  verts.push(rot(-len * 0.6, -len * 0.3));
  verts.push(rot(-len * 0.42, 0));
  verts.push(rot(-len * 0.6, len * 0.3));
  for (let i = 7; i >= 1; i--) {
    const t = (i / 8) * Math.PI;
    verts.push(rot(len * 0.45 * Math.cos(t), len * 0.25 * Math.sin(t)));
  }
  return verts;
}

function bottlePolygon(cx, cy, w, h) {
  return [
    { x: cx - w * 0.2, y: cy - h * 0.5 },
    { x: cx + w * 0.2, y: cy - h * 0.5 },
    { x: cx + w * 0.2, y: cy - h * 0.2 },
    { x: cx + w * 0.5, y: cy + h * 0.3 },
    { x: cx + w * 0.4, y: cy + h * 0.5 },
    { x: cx - w * 0.4, y: cy + h * 0.5 },
    { x: cx - w * 0.5, y: cy + h * 0.3 },
    { x: cx - w * 0.2, y: cy - h * 0.2 }
  ];
}

function blobPolygon(cx, cy, r, angle = 0) {
  const verts = [];
  const steps = 36;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2 + angle;
    const rad = r * (1 + 0.18 * Math.sin(3 * a) + 0.12 * Math.cos(5 * a));
    verts.push({ x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) });
  }
  return verts;
}

// ── Draw Loop ─────────────────────────────────────────────────────────────────

function startDrawLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  let lastT = 0;

  function loop(t) {
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    drawFrame(dt);
    animFrameId = requestAnimationFrame(loop);
  }
  animFrameId = requestAnimationFrame(loop);
}

function drawFrame(dt) {
  if (!ctx || !canvas || !currentShape) return;

  ctx.clearRect(0, 0, V_W, V_H);

  // Background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, V_W, V_H);

  if (cutConfirmed && halfA && halfB) {
    separationAnim = Math.min(1, separationAnim + dt * 2.5);
    const ease = easeOutCubic(separationAnim);
    const offset = ease * 30;

    // Find cut direction for separation
    if (cutLine) {
      const dx = cutLine.x2 - cutLine.x1;
      const dy = cutLine.y2 - cutLine.y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      drawPolygon(ctx, halfA, currentShape.palette.fill, currentShape.palette.stroke, -nx * offset, -ny * offset);
      drawPolygon(ctx, halfB, currentShape.palette.fill, currentShape.palette.stroke, nx * offset, ny * offset);
    }
  } else {
    drawPolygon(ctx, currentShape.verts, currentShape.palette.fill, currentShape.palette.stroke, 0, 0);
  }

  // Draw cut line
  if (cutLine) {
    drawCutLine(ctx, cutLine, cutConfirmed);
  }

  // Draw live cut while dragging
  if (isDrawingCut && cutStart) {
    // Nothing extra - cutLine updates in mousemove
  }

  // Guide cross-hairs
  if (!cutLine && !cutConfirmed) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(V_W / 2, 0); ctx.lineTo(V_W / 2, V_H);
    ctx.moveTo(0, V_H / 2); ctx.lineTo(V_W, V_H / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawPolygon(ctx, verts, fill, stroke, offX = 0, offY = 0) {
  if (!verts || verts.length < 3) return;
  ctx.save();
  ctx.translate(offX, offY);
  ctx.beginPath();
  ctx.moveTo(verts[0].x, verts[0].y);
  for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
  ctx.closePath();

  // Glow
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 18;
  ctx.fillStyle = fill;
  ctx.globalAlpha = 0.9;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.restore();
}

function drawCutLine(ctx, line, confirmed) {
  ctx.save();
  ctx.strokeStyle = confirmed ? '#10b981' : '#ffffff';
  ctx.lineWidth = confirmed ? 2.5 : 2;
  ctx.shadowColor = confirmed ? '#10b981' : 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = confirmed ? 14 : 8;
  if (!confirmed) ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(line.x1, line.y1);
  ctx.lineTo(line.x2, line.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ── Canvas Input Events ───────────────────────────────────────────────────────

let _boundPointerDown = null;
let _boundPointerMove = null;
let _boundPointerUp = null;

function bindGameEvents() {
  const menuBtn = document.getElementById('sm-menu-btn');
  const soundBtn = document.getElementById('sm-sound-btn');

  if (menuBtn) menuBtn.addEventListener('click', () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    removeCanvasListeners();
    renderMenuHTML();
  });

  if (soundBtn) soundBtn.addEventListener('click', () => {
    toggleSound();
    soundBtn.textContent = isSoundEnabled() ? '🔊' : '🔇';
  });

  if (!canvas) return;

  _boundPointerDown = onPointerDown;
  _boundPointerMove = onPointerMove;
  _boundPointerUp = onPointerUp;

  canvas.addEventListener('pointerdown', _boundPointerDown, { passive: false });
  canvas.addEventListener('pointermove', _boundPointerMove, { passive: false });
  canvas.addEventListener('pointerup', _boundPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', _boundPointerUp, { passive: false });
}

function removeCanvasListeners() {
  if (canvas && _boundPointerDown) {
    canvas.removeEventListener('pointerdown', _boundPointerDown);
    canvas.removeEventListener('pointermove', _boundPointerMove);
    canvas.removeEventListener('pointerup', _boundPointerUp);
    canvas.removeEventListener('pointercancel', _boundPointerUp);
  }
  _boundPointerDown = null;
  _boundPointerMove = null;
  _boundPointerUp = null;
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / scale,
    y: (e.clientY - rect.top) / scale
  };
}

function onPointerDown(e) {
  e.preventDefault();
  if (inputLocked || cutConfirmed) return;
  isDrawingCut = true;
  const pos = getCanvasPos(e);
  cutStart = pos;
  cutLine = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
  canvas.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  e.preventDefault();
  if (!isDrawingCut || !cutStart) return;
  const pos = getCanvasPos(e);
  cutLine = { x1: cutStart.x, y1: cutStart.y, x2: pos.x, y2: pos.y };
}

function onPointerUp(e) {
  e.preventDefault();
  if (!isDrawingCut) return;
  isDrawingCut = false;

  if (!cutLine) return;
  const dx = cutLine.x2 - cutLine.x1;
  const dy = cutLine.y2 - cutLine.y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < 20) {
    // Too short, discard
    cutLine = null;
    cutStart = null;
    return;
  }

  confirmCut();
}

// ── Cut Confirmation & Scoring ────────────────────────────────────────────────

function confirmCut() {
  if (!currentShape || !cutLine || inputLocked) return;
  inputLocked = true;
  cutConfirmed = true;

  playSlashSound();

  // Clip polygon by cut line
  const result = clipPolygonByLine(currentShape.verts, cutLine);
  halfA = result.a;
  halfB = result.b;

  const areaA = polygonArea(halfA);
  const areaB = polygonArea(halfB);
  const total = areaA + areaB;

  if (total < 1) {
    // Cut missed the shape
    const errPct = 50;
    if (currentMode === 'endless') {
      endlessLives = Math.max(0, endlessLives - 1);
      const livesEl = document.getElementById('sm-lives-container');
      if (livesEl) livesEl.textContent = '❤️'.repeat(endlessLives) || '💀';
    }
    showResult(errPct, 0);
    return;
  }

  const ratioA = (areaA / total) * 100;
  const ratioB = (areaB / total) * 100;
  const errPct = Math.abs(ratioA - 50);

  // Score: perfect = 1000, 50% off = 0
  const accuracy = Math.max(0, 100 - errPct * 2);
  const roundScore = Math.round(accuracy * 10);

  if (currentMode === 'endless' && errPct >= 20) {
    endlessLives = Math.max(0, endlessLives - 1);
    const livesEl = document.getElementById('sm-lives-container');
    if (livesEl) livesEl.textContent = '❤️'.repeat(endlessLives) || '💀';
  }

  totalScore += roundScore;
  roundScores.push(roundScore);
  accuracyList.push(100 - errPct * 2);

  // Update score display
  const scoreEl = document.getElementById('sm-total-score');
  if (scoreEl) scoreEl.textContent = totalScore.toLocaleString();

  setTimeout(() => showResult(errPct, roundScore, ratioA, ratioB), 600);
}

function showResult(errPct, roundScore, ratioA = 50, ratioB = 50) {
  if (resultShown) return;
  resultShown = true;

  const panel = document.getElementById('sm-result-panel');
  const reactionEl = document.getElementById('sm-result-reaction');
  const accuracyEl = document.getElementById('sm-result-accuracy');
  const scoreEl = document.getElementById('sm-result-score');
  const splitEl = document.getElementById('sm-result-split');
  const continueBtn = document.getElementById('sm-continue-btn');
  const instr = document.getElementById('sm-instructions');

  if (instr) instr.style.display = 'none';

  // Pick reaction
  let reactionMsg = REACTION_MESSAGES[REACTION_MESSAGES.length - 1].msgs[0];
  for (const tier of REACTION_MESSAGES) {
    if (errPct <= tier.maxErr) {
      reactionMsg = tier.msgs[Math.floor(Math.random() * tier.msgs.length)];
      break;
    }
  }

  if (reactionEl) reactionEl.textContent = reactionMsg;
  if (accuracyEl) accuracyEl.innerHTML = `<strong>${(100 - errPct * 2).toFixed(1)}%</strong> accuracy — ${errPct.toFixed(2)}% off perfect`;
  if (scoreEl) scoreEl.textContent = `+${roundScore.toLocaleString()} pts`;

  // Split bar visualization
  if (splitEl) {
    const pA = ratioA.toFixed(1);
    const pB = ratioB.toFixed(1);
    splitEl.innerHTML = `
      <div style="flex:1; text-align:right;">
        <div style="font-size:1.1rem; font-weight:800; color:var(--accent-cyan);">${pA}%</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">Side A</div>
      </div>
      <div style="display:flex; align-items:center; width:160px; height:20px; border-radius:9999px; overflow:hidden; border:1px solid var(--border-color);">
        <div style="height:100%; background:var(--accent-cyan); width:${pA}%; transition:width 0.5s ease;"></div>
        <div style="height:100%; background:var(--accent-purple); flex:1;"></div>
      </div>
      <div style="flex:1; text-align:left;">
        <div style="font-size:1.1rem; font-weight:800; color:var(--accent-purple);">${pB}%</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">Side B</div>
      </div>
    `;
  }

  if (panel) panel.style.display = '';

  if (continueBtn) {
    const isOutOfLives = currentMode === 'endless' && endlessLives <= 0;
    const isLastRound = isOutOfLives || (currentMode !== 'endless' && round >= totalRounds);

    if (isOutOfLives && reactionEl) {
      reactionEl.textContent = '💔 Out of Lives! Game Over!';
    }

    continueBtn.textContent = isLastRound ? '🏁 See Final Score' : 'Next Shape →';
    continueBtn.onclick = () => {
      if (isLastRound) {
        endGame();
      } else {
        nextRound();
      }
    };

    const oldBank = document.getElementById('sm-bank-btn');
    if (oldBank) oldBank.remove();
    if (currentMode === 'endless' && !isLastRound) {
      const bankBtn = document.createElement('button');
      bankBtn.id = 'sm-bank-btn';
      bankBtn.className = 'btn btn-secondary';
      bankBtn.style.cssText = 'min-width:140px; margin-left:0.5rem;';
      bankBtn.textContent = '💰 Bank & End Run';
      bankBtn.onclick = () => endGame();
      continueBtn.parentNode.appendChild(bankBtn);
    }
  }

  playResultSound(errPct);
}

// ── Game Over ─────────────────────────────────────────────────────────────────

function endGame() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  gameState = 'GAMEOVER';

  const avgAccuracy = accuracyList.length > 0
    ? accuracyList.reduce((a, b) => a + b, 0) / accuracyList.length
    : 0;

  const leaderboardId = currentMode === 'daily' ? 'split-master-daily'
    : currentMode === 'endless' ? 'split-master-endless'
    : 'split-master-classic';

  const result = submitScore(leaderboardId, totalScore, `${totalScore.toLocaleString()} pts`);

  // Save local high score
  if (currentMode === 'classic' && totalScore > highScoreClassic) {
    highScoreClassic = totalScore;
    try { localStorage.setItem('sm_hs_classic', totalScore); } catch(e) {}
  }
  if (currentMode === 'endless' && totalScore > highScoreEndless) {
    highScoreEndless = totalScore;
    try { localStorage.setItem('sm_hs_endless', totalScore); } catch(e) {}
  }

  const profile = getAnonProfile();
  const rank = result ? result.rank : null;

  containerRef.innerHTML = `
    <div class="container section" style="padding-top:1.5rem;">
      <div style="max-width:620px; margin:0 auto; text-align:center;">
        <div style="font-size:4rem; margin-bottom:0.75rem;">${avgAccuracy >= 80 ? '🏆' : avgAccuracy >= 60 ? '🎯' : avgAccuracy >= 40 ? '✂️' : '😅'}</div>
        <h1 style="font-size:2rem; font-weight:900; letter-spacing:-0.03em; margin-bottom:0.25rem;">Game Over!</h1>
        <p style="color:var(--text-secondary); margin-bottom:2rem;">
          ${currentMode === 'daily' ? '📅 Daily Challenge Complete!' : currentMode === 'endless' ? `♾️ Endless Run — ${round} rounds` : `🎯 Classic — ${round} rounds`}
        </p>

        <!-- Stats -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Final Score</div>
            <div style="font-size:1.8rem; font-weight:900; color:var(--accent-cyan); margin-top:0.25rem;">${totalScore.toLocaleString()}</div>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Avg Accuracy</div>
            <div style="font-size:1.8rem; font-weight:900; color:var(--accent-emerald); margin-top:0.25rem;">${avgAccuracy.toFixed(1)}%</div>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem;">
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">${rank ? 'Rank' : 'Rounds'}</div>
            <div style="font-size:1.8rem; font-weight:900; color:var(--accent-purple); margin-top:0.25rem;">${rank ? `#${rank}` : round}</div>
          </div>
        </div>

        ${rank && rank <= 3 ? `<div style="background:linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.05)); border:1px solid rgba(234,179,8,0.3); border-radius:var(--radius-lg); padding:1rem; margin-bottom:1.5rem; color:#fde047; font-weight:700;">🎉 You're on the leaderboard at #${rank}!</div>` : ''}

        <!-- Round Breakdown -->
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1.5rem; text-align:left;">
          <div style="font-weight:700; margin-bottom:0.75rem; color:var(--text-primary);">Round Breakdown</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:0.5rem;">
            ${roundScores.map((s, i) => `
              <div style="background:var(--bg-tertiary); border-radius:var(--radius-sm); padding:0.5rem; text-align:center;">
                <div style="font-size:0.75rem; color:var(--text-muted);">Round ${i + 1}</div>
                <div style="font-weight:800; color:${s >= 800 ? 'var(--accent-cyan)' : s >= 500 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">${s}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
          <button id="sm-replay-btn" class="btn btn-primary">🔄 Play Again</button>
          <button id="sm-menu-end-btn" class="btn btn-secondary">🏠 Main Menu</button>
        </div>
      </div>
    </div>
  `;

  const replayBtn = document.getElementById('sm-replay-btn');
  const menuBtn = document.getElementById('sm-menu-end-btn');
  if (replayBtn) replayBtn.addEventListener('click', () => startGame(currentMode));
  if (menuBtn) menuBtn.addEventListener('click', renderMenuHTML);
}

// ── Polygon Clipping ──────────────────────────────────────────────────────────
// Uses Sutherland-Hodgman style half-plane clipping

function clipPolygonByLine(verts, line) {
  // Line: from (x1,y1) to (x2,y2) — use the line as a half-plane divider
  // Points on the left of the directed line go into set A, right into set B
  const { x1, y1, x2, y2 } = line;

  function side(p) {
    return (x2 - x1) * (p.y - y1) - (y2 - y1) * (p.x - x1);
  }

  function intersect(p, q) {
    const a1 = y2 - y1, b1 = x1 - x2, c1 = a1 * x1 + b1 * y1;
    const a2 = q.y - p.y, b2 = p.x - q.x, c2 = a2 * p.x + b2 * p.y;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-10) return { x: p.x, y: p.y };
    return { x: (c1 * b2 - c2 * b1) / det, y: (a1 * c2 - a2 * c1) / det };
  }

  const polyA = [];
  const polyB = [];

  for (let i = 0; i < verts.length; i++) {
    const curr = verts[i];
    const next = verts[(i + 1) % verts.length];
    const sc = side(curr);
    const sn = side(next);

    if (sc >= 0) polyA.push(curr);
    else polyB.push(curr);

    if ((sc >= 0) !== (sn >= 0)) {
      const pt = intersect(curr, next);
      polyA.push(pt);
      polyB.push({ ...pt });
    }
  }

  return { a: polyA, b: polyB };
}

function polygonArea(verts) {
  if (!verts || verts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < verts.length; i++) {
    const j = (i + 1) % verts.length;
    area += verts[i].x * verts[j].y;
    area -= verts[j].x * verts[i].y;
  }
  return Math.abs(area) / 2;
}

// ── Sound ─────────────────────────────────────────────────────────────────────

function playSlashSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext(); if (!ctx) return;
    const now = ctx.currentTime;
    // Quick swoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.15);
  } catch (e) {}
}

function playResultSound(errPct) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext(); if (!ctx) return;
    const now = ctx.currentTime;
    const freq = errPct <= 2 ? 1046 : errPct <= 10 ? 783 : errPct <= 20 ? 523 : 300;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.3);
  } catch (e) {}
}
