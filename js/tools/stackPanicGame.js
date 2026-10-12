/* ==========================================================================
   CatKeyLab - Stack Panic Arcade Game Engine
   High-Precision HTML5 Canvas Arcade Stacking Game with Slicing Physics,
   Combos, Special Blocks, Web Audio Synthesis & Anonymous Leaderboard Integration.
   ========================================================================== */

import { t } from '../i18n.js';
import { getAudioContext, isSoundEnabled, toggleSound } from '../audio.js';
import { submitScore, getLeaderboard, getAnonProfile } from '../leaderboard.js';

// Game State Enum: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
let gameState = 'MENU';

// Canvas Context & Engine
let canvas = null;
let ctx = null;
let animFrameId = null;
let containerRef = null;

// Virtual High-DPI Coordinate Space
const V_WIDTH = 480;
const V_HEIGHT = 700;
const BLOCK_HEIGHT = 32;
const BASE_BLOCK_WIDTH = 240;
const BASE_SPEED = 220; // Virtual pixels per second

// Game Session Variables
let tower = [];
let currentBlock = null;
let debrisList = [];
let particles = [];
let floatingTexts = [];
let cameraY = 0;
let targetCameraY = 0;
let lastTimestamp = 0;

// Stats & Scoring
let score = 0;
let highScore = 0;
let combo = 0;
let maxCombo = 0;
let perfectCount = 0;
let totalGamesPlayed = 0;
let totalLifetimePerfects = 0;
let shieldActive = false;
let slowMoTurns = 0;
let screenShakeAmount = 0;

// Block Palette: Neon Arcade Cyber Palette
const BLOCK_PALETTES = [
  { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', border: '#22d3ee', name: 'Cyan' },
  { main: '#3b82f6', glow: 'rgba(59, 130, 246, 0.6)', border: '#60a5fa', name: 'Blue' },
  { main: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.6)', border: '#a78bfa', name: 'Purple' },
  { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)', border: '#f472b6', name: 'Pink' },
  { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)', border: '#fb7185', name: 'Rose' },
  { main: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', border: '#fb923c', name: 'Orange' },
  { main: '#eab308', glow: 'rgba(234, 179, 8, 0.6)', border: '#fde047', name: 'Yellow' },
  { main: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', border: '#34d399', name: 'Emerald' }
];

// Special Block Definitions
const SPECIAL_TYPES = {
  NORMAL: 'NORMAL',
  BONUS: 'BONUS',     // Golden Block: +50 Bonus Points
  SLOWMO: 'SLOWMO',   // Frost Cyan: Slows horizontal speed for 3 blocks
  SHIELD: 'SHIELD',   // Emerald Shield: Absorbs 1 near-miss/mistake
  WIDE: 'WIDE'        // Neon Magenta: Expands block width +30px
};

// Controls debounce state
let canDrop = true;

/* ==========================================================================
   Sound Synthesis System (Web Audio API)
   ========================================================================== */

function playArcadeSound(type, param = 1) {
  if (!isSoundEnabled()) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    if (type === 'drop_thud') {
      // Solid block placement thud
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'perfect') {
      // Perfect placement ascending chime chord
      const comboStep = Math.min(param, 10);
      const baseFreq = 440 * Math.pow(1.06, comboStep * 1.5);
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      freqs.forEach((freq, idx) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);
        gain.gain.setValueAtTime(0.18, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + 0.28);
      });
    } else if (type === 'bonus') {
      // Sparkling golden bonus sound
      [659.25, 830.61, 987.77, 1318.51].forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.2, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.18);
      });
    } else if (type === 'shield_gain') {
      // Shield activated hum
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(587.33, now + 0.22);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'shield_save') {
      // Shield consumed rescue blast
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'game_over') {
      // Melancholic descending arcade fail chord
      [320, 280, 240, 180].forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } else if (type === 'button') {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {}
}

/* ==========================================================================
   Persistence & Local Storage Helpers
   ========================================================================== */

function loadPersistedData() {
  try {
    highScore = parseInt(localStorage.getItem('catkeylab_stack_panic_highscore')) || 0;
    totalGamesPlayed = parseInt(localStorage.getItem('catkeylab_stack_panic_games_played')) || 0;
    totalLifetimePerfects = parseInt(localStorage.getItem('catkeylab_stack_panic_perfects')) || 0;
  } catch (e) {
    highScore = 0;
    totalGamesPlayed = 0;
    totalLifetimePerfects = 0;
  }
}

function savePersistedData() {
  try {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('catkeylab_stack_panic_highscore', highScore.toString());
    }
    localStorage.setItem('catkeylab_stack_panic_games_played', totalGamesPlayed.toString());
    localStorage.setItem('catkeylab_stack_panic_perfects', totalLifetimePerfects.toString());
  } catch (e) {}
}

/* ==========================================================================
   Game Initialization & Lifecycle
   ========================================================================== */

export function renderStackPanicGame(container) {
  containerRef = container;
  loadPersistedData();

  container.innerHTML = `
    <div class="sp-wrapper" style="max-width:560px; margin:0 auto; user-select:none;">
      
      <!-- Top HUD Header -->
      <div class="sp-hud-bar" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:0.65rem 1rem; margin-bottom:0.75rem; box-shadow:0 4px 14px rgba(0,0,0,0.25);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.6rem;">🥞</span>
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); font-weight:700;">Score</div>
            <div id="sp-hud-score" style="font-size:1.5rem; font-weight:900; color:var(--accent-cyan); line-height:1;">0</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:1.25rem;">
          <!-- Combo Badge Indicator -->
          <div id="sp-hud-combo-badge" style="display:none; align-items:center; gap:0.25rem; background:linear-gradient(135deg, rgba(234,179,8,0.2), rgba(249,115,22,0.2)); border:1px solid rgba(234,179,8,0.5); padding:0.25rem 0.65rem; border-radius:999px;">
            <span style="font-size:0.9rem;">⚡</span>
            <span id="sp-hud-combo-text" style="font-size:0.85rem; font-weight:900; color:#fde047;">1x</span>
          </div>

          <!-- Shield Badge Indicator -->
          <div id="sp-hud-shield-badge" style="display:none; align-items:center; gap:0.25rem; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.5); padding:0.25rem 0.65rem; border-radius:999px;">
            <span style="font-size:0.9rem;">🛡️</span>
            <span style="font-size:0.85rem; font-weight:900; color:#34d399;">SHIELD</span>
          </div>

          <!-- SlowMo Badge Indicator -->
          <div id="sp-hud-slowmo-badge" style="display:none; align-items:center; gap:0.25rem; background:rgba(6,182,212,0.2); border:1px solid rgba(6,182,212,0.5); padding:0.25rem 0.65rem; border-radius:999px;">
            <span style="font-size:0.9rem;">❄️</span>
            <span id="sp-hud-slowmo-text" style="font-size:0.85rem; font-weight:900; color:#22d3ee;">3</span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.5rem;">
          <!-- Sound Toggle Button -->
          <button id="sp-sound-toggle-btn" class="btn btn-sm btn-secondary" style="padding:0.45rem 0.65rem; font-size:1.1rem; line-height:1;" title="Toggle Sound">
            ${isSoundEnabled() ? '🔊' : '🔇'}
          </button>
          <!-- Pause / Resume Button -->
          <button id="sp-pause-btn" class="btn btn-sm btn-secondary" style="padding:0.45rem 0.75rem; font-weight:700;" title="Pause Game (Esc)">
            ⏸️
          </button>
        </div>
      </div>

      <!-- Main Game Canvas Container -->
      <div id="sp-canvas-container" style="position:relative; width:100%; border-radius:var(--radius-xl); overflow:hidden; border:2px solid var(--border-color); box-shadow:0 14px 40px rgba(0,0,0,0.5); background:#060913; touch-action:manipulation;">
        <canvas id="sp-canvas" style="display:block; width:100%; height:auto; cursor:pointer; -webkit-tap-highlight-color:transparent;"></canvas>

        <!-- Menu / Game State Modals -->
        
        <!-- 1. Main Menu Overlay -->
        <div id="sp-modal-main" style="position:absolute; inset:0; background:rgba(6,9,19,0.85); backdrop-filter:blur(6px); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10;">
          <div style="font-size:3.2rem; margin-bottom:0.25rem; filter:drop-shadow(0 0 16px rgba(6,182,212,0.5));">🥞</div>
          <h1 style="font-size:2.4rem; font-weight:900; letter-spacing:0.04em; margin-bottom:0.25rem; background:linear-gradient(135deg, #22d3ee, #a855f7, #ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
            STACK PANIC
          </h1>
          <p style="color:var(--text-secondary); font-size:1rem; margin-bottom:1.5rem; font-weight:500;">
            How high can you go before the tower crumbles?
          </p>

          <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:0.85rem 1.75rem; margin-bottom:1.75rem; width:100%; max-width:320px;">
            <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); font-weight:700;">Personal High Score</div>
            <div id="sp-main-highscore" style="font-size:2rem; font-weight:900; color:var(--accent-amber);">${highScore} pts</div>
          </div>

          <button id="sp-btn-play" class="btn btn-primary btn-lg" style="width:100%; max-width:320px; font-size:1.25rem; font-weight:900; padding:0.9rem 1.5rem; margin-bottom:1rem; box-shadow:0 0 24px rgba(6,182,212,0.4);">
            ▶️ PLAY NOW
          </button>

          <p style="font-size:0.85rem; color:var(--text-muted); max-width:340px; line-height:1.5;">
            ⌨️ <strong>Controls:</strong> Press <strong>Spacebar</strong>, <strong>Left Click</strong>, or <strong>Tap Screen</strong> to drop. Line up blocks perfectly to build combos!
          </p>
        </div>

        <!-- 2. Pause Menu Overlay -->
        <div id="sp-modal-pause" style="position:absolute; inset:0; background:rgba(6,9,19,0.85); backdrop-filter:blur(6px); display:none; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10;">
          <div style="font-size:3rem; margin-bottom:0.5rem;">⏸️</div>
          <h2 style="font-size:2rem; font-weight:900; margin-bottom:0.25rem; color:var(--text-primary);">GAME PAUSED</h2>
          <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1.75rem;">Take a breath: the stack is waiting for you.</p>

          <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%; max-width:280px;">
            <button id="sp-btn-resume" class="btn btn-primary btn-lg" style="font-weight:800;">
              ▶️ Resume (Esc)
            </button>
            <button id="sp-btn-restart-pause" class="btn btn-secondary btn-lg" style="font-weight:700;">
              🔄 Restart Match
            </button>
            <button id="sp-btn-mainmenu-pause" class="btn btn-secondary" style="font-weight:600;">
              🏠 Main Menu
            </button>
          </div>
        </div>

        <!-- 3. Game Over Overlay -->
        <div id="sp-modal-gameover" style="position:absolute; inset:0; background:rgba(6,9,19,0.9); backdrop-filter:blur(8px); display:none; flex-direction:column; justify-content:center; align-items:center; padding:1.5rem; text-align:center; z-index:10; overflow-y:auto;">
          <div style="font-size:3rem; margin-bottom:0.25rem;">💥</div>
          <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.25rem; color:var(--text-primary);">TOWER OVER!</h2>
          <div id="sp-new-record-tag" style="display:none; background:linear-gradient(135deg, #eab308, #f59e0b); color:#000; font-size:0.8rem; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; padding:0.25rem 0.75rem; border-radius:999px; margin-bottom:0.75rem;">
            🏆 NEW PERSONAL BEST!
          </div>

          <!-- Stats Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; width:100%; max-width:340px; margin-bottom:1.25rem;">
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Final Score</div>
              <div id="sp-go-score" style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan);">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Best Score</div>
              <div id="sp-go-best" style="font-size:1.6rem; font-weight:900; color:var(--accent-amber);">0</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Tower Height</div>
              <div id="sp-go-height" style="font-size:1.3rem; font-weight:800; color:var(--text-primary);">0 Floors</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:700;">Max Combo</div>
              <div id="sp-go-combo" style="font-size:1.3rem; font-weight:800; color:#fde047;">0x</div>
            </div>
          </div>

          <!-- Leaderboard Anonymous Rank Badge -->
          <div id="sp-go-rank-card" style="display:none; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); border-radius:var(--radius-md); padding:0.6rem 1rem; width:100%; max-width:340px; margin-bottom:1.25rem;">
            <div id="sp-go-rank-text" style="font-size:0.9rem; font-weight:700; color:var(--accent-cyan);">
              🏆 Submitted to Global Leaderboard!
            </div>
          </div>

          <!-- Buttons -->
          <div style="display:flex; flex-direction:column; gap:0.65rem; width:100%; max-width:340px;">
            <button id="sp-btn-play-again" class="btn btn-primary btn-lg" style="font-weight:900; font-size:1.15rem; padding:0.85rem;">
              🔄 PLAY AGAIN
            </button>
            <div style="display:flex; gap:0.65rem;">
              <a href="/leaderboards/" class="btn btn-secondary" style="flex:1; font-size:0.9rem; font-weight:700; text-align:center;">
                🏆 Leaderboard
              </a>
              <button id="sp-btn-mainmenu-go" class="btn btn-secondary" style="flex:1; font-size:0.9rem; font-weight:700;">
                🏠 Menu
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Controls Reference Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted); padding:0 0.5rem;">
        <div>⚡ <strong>Space / Click / Tap</strong> to drop block</div>
        <div>🛡️ <strong>Shield</strong> saves 1 miss</div>
        <div>❄️ <strong>Slow-Mo</strong> cools speed</div>
      </div>

    </div>
  `;

  // Canvas Setup with High-DPI Scaling
  canvas = document.getElementById('sp-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();

  // Bind Event Handlers
  bindControls();

  // Enter Menu State
  gameState = 'MENU';
  initMenuIdleGame();

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
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

  canvas.width = V_WIDTH * dpr;
  canvas.height = V_HEIGHT * dpr;
  canvas.style.aspectRatio = `${V_WIDTH} / ${V_HEIGHT}`;
}

window.addEventListener('resize', () => {
  if (canvas && gameState) resizeCanvas();
});

/* ==========================================================================
   Game State Machine Transitions
   ========================================================================== */

function startNewGame() {
  playArcadeSound('button');
  gameState = 'PLAYING';

  // Reset Variables
  score = 0;
  combo = 0;
  maxCombo = 0;
  perfectCount = 0;
  shieldActive = false;
  slowMoTurns = 0;
  screenShakeAmount = 0;
  debrisList = [];
  particles = [];
  floatingTexts = [];
  cameraY = 0;
  targetCameraY = 0;
  canDrop = true;

  // Base Tower Foundation
  tower = [];
  const baseBlock = {
    x: (V_WIDTH - BASE_BLOCK_WIDTH) / 2,
    y: V_HEIGHT - BLOCK_HEIGHT * 2.5,
    w: BASE_BLOCK_WIDTH,
    h: BLOCK_HEIGHT,
    colorIndex: 0,
    type: SPECIAL_TYPES.NORMAL
  };
  tower.push(baseBlock);

  // Spawn First Moving Block
  spawnNextBlock();

  // Update UI Elements
  updateHUD();
  document.getElementById('sp-modal-main').style.display = 'none';
  document.getElementById('sp-modal-pause').style.display = 'none';
  document.getElementById('sp-modal-gameover').style.display = 'none';
}

function pauseGame() {
  if (gameState !== 'PLAYING') return;
  playArcadeSound('button');
  gameState = 'PAUSED';
  document.getElementById('sp-modal-pause').style.display = 'flex';
}

function resumeGame() {
  if (gameState !== 'PAUSED') return;
  playArcadeSound('button');
  gameState = 'PLAYING';
  lastTimestamp = performance.now();
  document.getElementById('sp-modal-pause').style.display = 'none';
}

function returnToMainMenu() {
  playArcadeSound('button');
  gameState = 'MENU';
  document.getElementById('sp-modal-main').style.display = 'flex';
  document.getElementById('sp-modal-pause').style.display = 'none';
  document.getElementById('sp-modal-gameover').style.display = 'none';
  initMenuIdleGame();
}

function gameOver() {
  gameState = 'GAMEOVER';
  playArcadeSound('game_over');
  totalGamesPlayed++;
  savePersistedData();

  // Screen Shake Impact
  screenShakeAmount = 14;

  const isNewRecord = score > highScore;
  if (isNewRecord) {
    highScore = score;
    savePersistedData();
  }

  // Submit to Anonymous Leaderboards
  let rankInfo = null;
  if (score > 0) {
    rankInfo = submitScore('stack-panic', score, `${score} pts (H: ${tower.length})`);
  }

  // Update Game Over Modal
  document.getElementById('sp-go-score').textContent = score;
  document.getElementById('sp-go-best').textContent = highScore;
  document.getElementById('sp-go-height').textContent = `${tower.length} Floors`;
  document.getElementById('sp-go-combo').textContent = `${maxCombo}x`;

  const newRecordTag = document.getElementById('sp-new-record-tag');
  if (newRecordTag) {
    newRecordTag.style.display = isNewRecord ? 'inline-block' : 'none';
  }

  const rankCard = document.getElementById('sp-go-rank-card');
  const rankText = document.getElementById('sp-go-rank-text');
  if (rankCard && rankText && rankInfo) {
    rankCard.style.display = 'block';
    rankText.innerHTML = `🏆 <strong>Rank #${rankInfo.rank}</strong> Worldwide (${rankInfo.percentile})`;
  } else if (rankCard) {
    rankCard.style.display = 'none';
  }

  document.getElementById('sp-modal-gameover').style.display = 'flex';
}

/* ==========================================================================
   Block Mechanics & Spawning
   ========================================================================== */

function spawnNextBlock() {
  const topBlock = tower[tower.length - 1];
  const nextY = topBlock.y - BLOCK_HEIGHT;
  const level = tower.length;

  // Determine Special Block Type
  let blockType = SPECIAL_TYPES.NORMAL;
  if (level >= 6 && Math.random() < 0.22) {
    const r = Math.random();
    if (r < 0.35) blockType = SPECIAL_TYPES.BONUS;
    else if (r < 0.60) blockType = SPECIAL_TYPES.SLOWMO;
    else if (r < 0.80 && !shieldActive) blockType = SPECIAL_TYPES.SHIELD;
    else blockType = SPECIAL_TYPES.WIDE;
  }

  // Speed Scaling with level
  let speedMultiplier = 1 + Math.min(2.5, level * 0.038);
  if (slowMoTurns > 0) {
    speedMultiplier *= 0.6; // 40% reduction
  }
  const speed = BASE_SPEED * speedMultiplier;

  // Alternating spawn sides
  const spawnFromLeft = level % 2 === 0;
  const startX = spawnFromLeft ? -topBlock.w + 10 : V_WIDTH - 10;
  const dir = spawnFromLeft ? 1 : -1;

  currentBlock = {
    x: startX,
    y: nextY,
    w: topBlock.w,
    h: BLOCK_HEIGHT,
    speed: speed,
    dir: dir,
    colorIndex: level % BLOCK_PALETTES.length,
    type: blockType
  };

  // Adjust Camera Tracking Target
  if (level > 6) {
    targetCameraY = (level - 6) * BLOCK_HEIGHT;
  }
}

/* ==========================================================================
   Block Drop & Precise Collision Overlap Calculations
   ========================================================================== */

function dropCurrentBlock() {
  if (gameState !== 'PLAYING' || !currentBlock || !canDrop) return;
  canDrop = false;

  const topBlock = tower[tower.length - 1];
  const diff = currentBlock.x - topBlock.x;
  const perfectTolerance = Math.max(3, currentBlock.w * 0.045);

  // 1. Check for Perfect Placement Alignment
  if (Math.abs(diff) <= perfectTolerance) {
    // Snap to exact position
    currentBlock.x = topBlock.x;
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    perfectCount++;
    totalLifetimePerfects++;

    // Calculate Points: Base 5 + (combo * 3)
    const pointsEarned = (5 + combo * 3) * (currentBlock.type === SPECIAL_TYPES.BONUS ? 2 : 1);
    score += pointsEarned;

    // Trigger Audio & Visuals
    playArcadeSound('perfect', combo);
    spawnPerfectCelebration(currentBlock.x + currentBlock.w / 2, currentBlock.y + currentBlock.h / 2);
    spawnFloatingText(`PERFECT! x${combo} (+${pointsEarned})`, currentBlock.x + currentBlock.w / 2, currentBlock.y - 12, '#fde047');
    screenShakeAmount = 4;

    finalizePlacement(currentBlock);
    return;
  }

  // 2. Normal Placement Overlap Calculation
  const overlapLeft = Math.max(currentBlock.x, topBlock.x);
  const overlapRight = Math.min(currentBlock.x + currentBlock.w, topBlock.x + topBlock.w);
  const overlapWidth = overlapRight - overlapLeft;

  if (overlapWidth <= 0) {
    // Complete Miss!
    handleMiss();
    return;
  }

  // Slicing Physics: Cut off the overhang
  combo = 0; // Reset Combo
  score += (1 * (currentBlock.type === SPECIAL_TYPES.BONUS ? 5 : 1));

  let sliceX, sliceW;
  if (currentBlock.x < topBlock.x) {
    // Overhanging on left side
    sliceX = currentBlock.x;
    sliceW = topBlock.x - currentBlock.x;
  } else {
    // Overhanging on right side
    sliceX = topBlock.x + topBlock.w;
    sliceW = (currentBlock.x + currentBlock.w) - (topBlock.x + topBlock.w);
  }

  // Spawn Falling Sliced Debris Object
  spawnDebris(sliceX, currentBlock.y, sliceW, currentBlock.h, currentBlock.colorIndex, currentBlock.dir);
  spawnPlacementSparks(overlapLeft + (currentBlock.x < topBlock.x ? 0 : overlapWidth), currentBlock.y + currentBlock.h);
  playArcadeSound('drop_thud');

  // Trim Current Block
  currentBlock.x = overlapLeft;
  currentBlock.w = overlapWidth;

  spawnFloatingText('+1', currentBlock.x + currentBlock.w / 2, currentBlock.y - 10, '#22d3ee');
  finalizePlacement(currentBlock);
}

function handleMiss() {
  // If Shield is active, rescue the player!
  if (shieldActive) {
    shieldActive = false;
    playArcadeSound('shield_save');
    screenShakeAmount = 8;

    const topBlock = tower[tower.length - 1];
    currentBlock.x = topBlock.x;
    currentBlock.w = topBlock.w;

    spawnFloatingText('🛡️ SHIELD SAVED YOU!', V_WIDTH / 2, currentBlock.y - 14, '#34d399');
    spawnShieldBurst(currentBlock.x + currentBlock.w / 2, currentBlock.y + currentBlock.h / 2);
    finalizePlacement(currentBlock);
    return;
  }

  // Full Miss Fall Debris
  spawnDebris(currentBlock.x, currentBlock.y, currentBlock.w, currentBlock.h, currentBlock.colorIndex, currentBlock.dir);
  currentBlock = null;
  gameOver();
}

function finalizePlacement(placedBlock) {
  // Apply Special Block Effects
  if (placedBlock.type === SPECIAL_TYPES.BONUS) {
    score += 50;
    playArcadeSound('bonus');
    spawnFloatingText('🌟 BONUS +50!', placedBlock.x + placedBlock.w / 2, placedBlock.y - 28, '#fde047');
  } else if (placedBlock.type === SPECIAL_TYPES.SLOWMO) {
    slowMoTurns = 4; // Active for next 4 blocks
    playArcadeSound('button');
    spawnFloatingText('❄️ SLOW-MO!', placedBlock.x + placedBlock.w / 2, placedBlock.y - 28, '#22d3ee');
  } else if (placedBlock.type === SPECIAL_TYPES.SHIELD) {
    shieldActive = true;
    playArcadeSound('shield_gain');
    spawnFloatingText('🛡️ SHIELD GAINED!', placedBlock.x + placedBlock.w / 2, placedBlock.y - 28, '#34d399');
  } else if (placedBlock.type === SPECIAL_TYPES.WIDE) {
    placedBlock.w = Math.min(BASE_BLOCK_WIDTH, placedBlock.w + 32);
    playArcadeSound('bonus');
    spawnFloatingText('💖 RECOVERY +32px!', placedBlock.x + placedBlock.w / 2, placedBlock.y - 28, '#f472b6');
  }

  // Decrement slowmo if active
  if (slowMoTurns > 0) slowMoTurns--;

  // Push to Tower
  tower.push(placedBlock);
  currentBlock = null;
  updateHUD();

  // Spawning next block with slight delay for natural rhythm
  setTimeout(() => {
    if (gameState === 'PLAYING') {
      spawnNextBlock();
      canDrop = true;
    }
  }, 120);
}

/* ==========================================================================
   Debris Physics & Particle Effects
   ========================================================================== */

function spawnDebris(x, y, w, h, colorIndex, dir) {
  debrisList.push({
    x: x,
    y: y,
    w: w,
    h: h,
    vx: dir * (40 + Math.random() * 60),
    vy: -40,
    rot: 0,
    vrot: dir * (3 + Math.random() * 4),
    colorIndex: colorIndex,
    alpha: 1
  });
}

function spawnPlacementSparks(x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      radius: 2 + Math.random() * 3,
      color: '#22d3ee',
      alpha: 1,
      decay: 2.2
    });
  }
}

function spawnPerfectCelebration(x, y) {
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const speed = 90 + Math.random() * 140;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 3.5,
      color: i % 2 === 0 ? '#fde047' : '#a855f7',
      alpha: 1,
      decay: 1.8
    });
  }
}

function spawnShieldBurst(x, y) {
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 120;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3,
      color: '#34d399',
      alpha: 1,
      decay: 2.0
    });
  }
}

function spawnFloatingText(text, x, y, color) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    vy: -45,
    color: color,
    alpha: 1,
    scale: 1
  });
}

/* ==========================================================================
   Idle Menu Demo Mode
   ========================================================================== */

let menuAutoTimer = 0;

function initMenuIdleGame() {
  tower = [];
  debrisList = [];
  particles = [];
  floatingTexts = [];
  cameraY = 0;
  targetCameraY = 0;

  const baseBlock = {
    x: (V_WIDTH - BASE_BLOCK_WIDTH) / 2,
    y: V_HEIGHT - BLOCK_HEIGHT * 3,
    w: BASE_BLOCK_WIDTH,
    h: BLOCK_HEIGHT,
    colorIndex: 0,
    type: SPECIAL_TYPES.NORMAL
  };
  tower.push(baseBlock);

  currentBlock = {
    x: 40,
    y: baseBlock.y - BLOCK_HEIGHT,
    w: BASE_BLOCK_WIDTH,
    h: BLOCK_HEIGHT,
    speed: BASE_SPEED * 0.9,
    dir: 1,
    colorIndex: 1,
    type: SPECIAL_TYPES.NORMAL
  };
  menuAutoTimer = 0;
}

/* ==========================================================================
   Main Game Loop (Time-Delta RequestAnimationFrame)
   ========================================================================== */

function gameLoop(now) {
  const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
  lastTimestamp = now;

  update(dt);
  render();

  animFrameId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Screen Shake Decay
  if (screenShakeAmount > 0) {
    screenShakeAmount = Math.max(0, screenShakeAmount - dt * 25);
  }

  // Smooth Camera Lerp
  cameraY += (targetCameraY - cameraY) * Math.min(1, dt * 6);

  if (gameState === 'PLAYING') {
    // Current Moving Block Motion
    if (currentBlock) {
      currentBlock.x += currentBlock.dir * currentBlock.speed * dt;

      // Bounce off Virtual Bounds
      if (currentBlock.dir > 0 && currentBlock.x + currentBlock.w > V_WIDTH + 40) {
        currentBlock.dir = -1;
      } else if (currentBlock.dir < 0 && currentBlock.x < -40) {
        currentBlock.dir = 1;
      }
    }
  } else if (gameState === 'MENU' && currentBlock) {
    // Idle Menu Sway Demo
    currentBlock.x += currentBlock.dir * currentBlock.speed * dt;
    if (currentBlock.dir > 0 && currentBlock.x + currentBlock.w > V_WIDTH - 20) {
      currentBlock.dir = -1;
    } else if (currentBlock.dir < 0 && currentBlock.x < 20) {
      currentBlock.dir = 1;
    }
  }

  // Update Falling Debris Physics
  for (let i = debrisList.length - 1; i >= 0; i--) {
    const d = debrisList[i];
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.vy += 650 * dt; // Gravity
    d.rot += d.vrot * dt;
    d.alpha -= dt * 0.45;

    if (d.y - cameraY > V_HEIGHT + 100 || d.alpha <= 0) {
      debrisList.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.alpha -= dt * p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.3;
    ft.scale += dt * 0.2;

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

/* ==========================================================================
   Rendering Engine
   ========================================================================== */

function render() {
  if (!ctx || !canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  ctx.save();
  ctx.scale(dpr, dpr);

  // Apply Screen Shake
  if (screenShakeAmount > 0) {
    const sx = (Math.random() - 0.5) * screenShakeAmount;
    const sy = (Math.random() - 0.5) * screenShakeAmount;
    ctx.translate(sx, sy);
  }

  // 1. Background: Dark Arcade Gradient with Subtle Grid
  const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
  bgGrad.addColorStop(0, '#040711');
  bgGrad.addColorStop(0.5, '#070b18');
  bgGrad.addColorStop(1, '#090d1f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Background Cyber Grid Lines (Parallax with camera)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridOffsetY = (cameraY * 0.3) % 40;
  for (let y = gridOffsetY; y < V_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(V_WIDTH, y);
    ctx.stroke();
  }
  for (let x = 0; x < V_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, V_HEIGHT);
    ctx.stroke();
  }

  // 2. Camera Transform for Tower & Debris
  ctx.save();
  ctx.translate(0, cameraY);

  // Draw Ground Base Platform
  ctx.fillStyle = '#0f172a';
  ctx.fillRect((V_WIDTH - BASE_BLOCK_WIDTH - 40) / 2, V_HEIGHT - BLOCK_HEIGHT * 1.5, BASE_BLOCK_WIDTH + 40, BLOCK_HEIGHT * 2);
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect((V_WIDTH - BASE_BLOCK_WIDTH - 40) / 2, V_HEIGHT - BLOCK_HEIGHT * 1.5, BASE_BLOCK_WIDTH + 40, BLOCK_HEIGHT * 2);

  // Render Tower Blocks
  tower.forEach((b, idx) => {
    drawBlock(b, idx === tower.length - 1);
  });

  // Render Active Moving Block
  if (currentBlock) {
    drawBlock(currentBlock, true, true);
  }

  // Render Falling Sliced Debris
  debrisList.forEach(d => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, d.alpha);
    ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
    ctx.rotate(d.rot);

    const pal = BLOCK_PALETTES[d.colorIndex % BLOCK_PALETTES.length];
    ctx.fillStyle = pal.main;
    ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);
    ctx.restore();
  });

  // Render Particles
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Render Floating Texts
  floatingTexts.forEach(ft => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = '900 16px Inter, sans-serif';
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  ctx.restore(); // Restore Camera Transform

  ctx.restore(); // Restore Canvas DPR Transform
}

function drawBlock(b, isTop = false, isMoving = false) {
  const pal = BLOCK_PALETTES[b.colorIndex % BLOCK_PALETTES.length];

  ctx.save();

  // Glow on top/active block
  if (isTop || isMoving) {
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 14;
  }

  // Special Block Visual Accents
  let fillStyle = pal.main;
  let strokeStyle = pal.border;

  if (b.type === SPECIAL_TYPES.BONUS) {
    fillStyle = '#eab308';
    strokeStyle = '#fde047';
    ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
  } else if (b.type === SPECIAL_TYPES.SLOWMO) {
    fillStyle = '#06b6d4';
    strokeStyle = '#67e8f9';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
  } else if (b.type === SPECIAL_TYPES.SHIELD) {
    fillStyle = '#10b981';
    strokeStyle = '#6ee7b7';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
  } else if (b.type === SPECIAL_TYPES.WIDE) {
    fillStyle = '#ec4899';
    strokeStyle = '#f472b6';
    ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
  }

  // Block Body Fill
  ctx.fillStyle = fillStyle;
  ctx.fillRect(b.x, b.y, b.w, b.h);

  // Top Light Highlight Bevel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.fillRect(b.x, b.y, b.w, 4);

  // Bottom Shadow Bevel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4);

  // Glowing Outline Border
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(b.x, b.y, b.w, b.h);

  // Special Block Emblem Icons
  if (b.type !== SPECIAL_TYPES.NORMAL && b.w > 36) {
    let icon = '';
    if (b.type === SPECIAL_TYPES.BONUS) icon = '🌟';
    else if (b.type === SPECIAL_TYPES.SLOWMO) icon = '❄️';
    else if (b.type === SPECIAL_TYPES.SHIELD) icon = '🛡️';
    else if (b.type === SPECIAL_TYPES.WIDE) icon = '💖';

    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, b.x + b.w / 2, b.y + b.h / 2);
  }

  ctx.restore();
}

/* ==========================================================================
   HUD Updates & UI Synchronization
   ========================================================================== */

function updateHUD() {
  const scoreEl = document.getElementById('sp-hud-score');
  if (scoreEl) scoreEl.textContent = score;

  const comboBadge = document.getElementById('sp-hud-combo-badge');
  const comboText = document.getElementById('sp-hud-combo-text');
  if (comboBadge && comboText) {
    if (combo >= 2) {
      comboBadge.style.display = 'flex';
      comboText.textContent = `${combo}x`;
    } else {
      comboBadge.style.display = 'none';
    }
  }

  const shieldBadge = document.getElementById('sp-hud-shield-badge');
  if (shieldBadge) {
    shieldBadge.style.display = shieldActive ? 'flex' : 'none';
  }

  const slowmoBadge = document.getElementById('sp-hud-slowmo-badge');
  const slowmoText = document.getElementById('sp-hud-slowmo-text');
  if (slowmoBadge && slowmoText) {
    if (slowMoTurns > 0) {
      slowmoBadge.style.display = 'flex';
      slowmoText.textContent = slowMoTurns;
    } else {
      slowmoBadge.style.display = 'none';
    }
  }
}

/* ==========================================================================
   Input Controls & Accessibility Binding
   ========================================================================== */

function bindControls() {
  // Modal Buttons
  const btnPlay = document.getElementById('sp-btn-play');
  const btnResume = document.getElementById('sp-btn-resume');
  const btnRestartPause = document.getElementById('sp-btn-restart-pause');
  const btnMainMenuPause = document.getElementById('sp-btn-mainmenu-pause');
  const btnPlayAgain = document.getElementById('sp-btn-play-again');
  const btnMainMenuGo = document.getElementById('sp-btn-mainmenu-go');
  const btnPause = document.getElementById('sp-pause-btn');
  const btnSoundToggle = document.getElementById('sp-sound-toggle-btn');

  if (btnPlay) btnPlay.addEventListener('click', startNewGame);
  if (btnResume) btnResume.addEventListener('click', resumeGame);
  if (btnRestartPause) btnRestartPause.addEventListener('click', startNewGame);
  if (btnMainMenuPause) btnMainMenuPause.addEventListener('click', returnToMainMenu);
  if (btnPlayAgain) btnPlayAgain.addEventListener('click', startNewGame);
  if (btnMainMenuGo) btnMainMenuGo.addEventListener('click', returnToMainMenu);

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (gameState === 'PLAYING') pauseGame();
      else if (gameState === 'PAUSED') resumeGame();
    });
  }

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      const isMuted = !toggleSound();
      btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // Screen Click & Pointer Touch Dropping
  if (canvas) {
    const handlePointerAction = (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') {
        dropCurrentBlock();
      } else if (gameState === 'MENU') {
        startNewGame();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerAction);
  }

  // Keyboard Accessibility
  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === 'PLAYING') {
        dropCurrentBlock();
      } else if (gameState === 'MENU') {
        startNewGame();
      } else if (gameState === 'GAMEOVER') {
        startNewGame();
      }
    } else if (e.code === 'Escape') {
      e.preventDefault();
      if (gameState === 'PLAYING') {
        pauseGame();
      } else if (gameState === 'PAUSED') {
        resumeGame();
      }
    } else if (e.code === 'Enter') {
      if (gameState === 'MENU' || gameState === 'GAMEOVER') {
        e.preventDefault();
        startNewGame();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  containerRef._spKeyHandler = handleKeyDown;
}

/* ==========================================================================
   Cleanup Routine (Route Unmount)
   ========================================================================== */

export function cleanupStackPanicGame() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (containerRef && containerRef._spKeyHandler) {
    window.removeEventListener('keydown', containerRef._spKeyHandler);
    containerRef._spKeyHandler = null;
  }
  gameState = 'MENU';
}
