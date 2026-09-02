/* ==========================================================================
   CatKeyLab - Nibbles 2D Fruit Slicer Arcade Game
   ========================================================================== */

import { t } from '../i18n.js';
import { 
  playClickSound, 
  playSuccessSound, 
  playSliceSound, 
  playEscapeSound 
} from '../audio.js';
import { submitScore } from '../leaderboard.js';

// Canvas Context & Engine
let canvas = null;
let ctx = null;
let animFrameId = null;

// Game State Enum: 'READY', 'PLAYING', 'GAMEOVER'
let gameState = 'READY';

// Match Timers & Statistics
let gameTimeLeft = 0;
let matchStartTime = 0;
let currentScore = 0;
let lives = 3;
let personalHighScore = 0;
let spawnTimer = 0;
let spawnInterval = 1100; // ms between fruit waves

let catchesBreakdown = {
  watermelon: 0,
  orange: 0,
  strawberry: 0,
  pineapple: 0,
  kiwi: 0,
  dragonfruit: 0,
  starfruit: 0
};

// Blade Trail System
let bladePath = []; // Array of {x, y, time}
let isSlashing = false;
let lastPointerPos = null;

// Fruit Database Definitions
const FRUIT_TYPES = [
  {
    id: 'watermelon',
    name: 'Watermelon',
    emoji: '🍉',
    points: 10,
    radius: 36,
    outerColor: '#15803d',
    innerColor: '#ef4444',
    seedColor: '#000000',
    rarity: 0.35
  },
  {
    id: 'orange',
    name: 'Juicy Orange',
    emoji: '🍊',
    points: 15,
    radius: 30,
    outerColor: '#ea580c',
    innerColor: '#f97316',
    seedColor: '#fef08a',
    rarity: 0.25
  },
  {
    id: 'strawberry',
    name: 'Red Strawberry',
    emoji: '🍓',
    points: 20,
    radius: 26,
    outerColor: '#dc2626',
    innerColor: '#f87171',
    seedColor: '#fef08a',
    rarity: 0.18
  },
  {
    id: 'pineapple',
    name: 'Golden Pineapple',
    emoji: '🍍',
    points: 25,
    radius: 38,
    outerColor: '#b45309',
    innerColor: '#fbbf24',
    seedColor: '#78350f',
    rarity: 0.11
  },
  {
    id: 'kiwi',
    name: 'Lime Kiwi',
    emoji: '🥝',
    points: 30,
    radius: 28,
    outerColor: '#78350f',
    innerColor: '#84cc16',
    seedColor: '#000000',
    rarity: 0.06
  },
  {
    id: 'dragonfruit',
    name: 'Vivid Dragonfruit',
    emoji: '🐉',
    points: 45,
    radius: 34,
    outerColor: '#db2777',
    innerColor: '#f472b6',
    seedColor: '#1e293b',
    rarity: 0.04
  },
  {
    id: 'starfruit',
    name: 'Golden Star Fruit',
    emoji: '⭐',
    points: 75,
    radius: 32,
    outerColor: '#ca8a04',
    innerColor: '#fef08a',
    seedColor: '#a16207',
    rarity: 0.01
  }
];

let activeFruits = [];
let slicedHalves = [];
let particles = [];
let toasts = [];
let animationTime = 0;

// Combo Multiplier System
let currentComboCount = 0;
let lastSliceTime = 0;

/**
 * Main Render Entry Point
 */
export function renderFruitSlicerGame(container) {
  try {
    personalHighScore = parseInt(localStorage.getItem('catkeylab_slicer_highscore')) || 0;
  } catch (e) {
    personalHighScore = 0;
  }

  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto; text-align:center;">
        
        <!-- Game Header -->
        <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
          <span style="font-size:2.2rem;">🍉</span>
          <h1 style="font-size:2rem; font-weight:800;">Nibbles Fruit Slicer Arcade</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1rem;">
          Swipe or click & drag your blade to <strong>slice flying fruits ⚔️</strong>, trigger <strong>combos ⚡</strong>, and protect your <strong>3 lives ❤️</strong>!
        </p>

        <!-- Live Dashboard Stats -->
        <div class="stats-dashboard" style="max-width:760px; margin:0 auto 1.25rem auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
          <div class="stat-box">
            <div id="fs-lives" class="stat-value" style="color:var(--accent-rose); font-size:1.6rem;">❤️ ❤️ ❤️</div>
            <div class="stat-label">Lives Remaining</div>
          </div>
          <div class="stat-box">
            <div id="fs-score" class="stat-value" style="color:var(--accent-emerald);">0</div>
            <div class="stat-label">Total Score</div>
          </div>
          <div class="stat-box">
            <div id="fs-combo" class="stat-value" style="color:var(--accent-amber);">1x</div>
            <div class="stat-label">Current Combo</div>
          </div>
          <div class="stat-box">
            <div id="fs-highscore" class="stat-value" style="color:var(--accent-primary);">${personalHighScore}</div>
            <div class="stat-label">Personal Best</div>
          </div>
        </div>

        <!-- Canvas Container -->
        <div style="position:relative; width:100%; max-width:850px; margin:0 auto 1rem auto; border-radius:var(--radius-lg); overflow:hidden; border:2px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.4); background:#090d16;">
          <canvas id="slicer-canvas" width="850" height="520" style="display:block; width:100%; height:auto; cursor:crosshair; touch-action:none;"></canvas>
        </div>

        <!-- Control Bar -->
        <div style="display:flex; justify-content:center; align-items:center; gap:1rem; flex-wrap:wrap; background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-lg); margin-bottom:1rem; max-width:550px; margin-left:auto; margin-right:auto;">
          <button id="fs-action-btn" class="btn btn-primary btn-lg" style="flex:2; font-size:1.2rem; font-weight:800; padding:0.85rem 1.25rem;">
            ⚔️ START SLICING GAME
          </button>
          <button id="fs-reset-btn" class="btn btn-secondary btn-lg" style="flex:1; font-weight:700;">
            🔄 New Game
          </button>
        </div>

        <!-- Controls Guide -->
        <p style="font-size:0.85rem; color:var(--text-muted);">
          💡 <strong>Controls:</strong> Click & Drag (or swipe finger on mobile) across fruits to slice them. Slice 2+ fruits in one quick swipe for a <strong>COMBO BONUS</strong>!
        </p>

      </div>
    </div>

    <!-- Results Modal -->
    <div id="fs-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center; max-width:500px; padding:2rem;">
        <div style="font-size:3rem; margin-bottom:0.5rem;" id="fs-modal-icon">🍉</div>
        <h2 style="font-size:1.9rem; font-weight:800; margin-bottom:0.25rem;">Game Over! Great Slice!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1.25rem;">Nibbles purrs and enjoys today's fresh fruit salad!</p>

        <div class="stats-dashboard" style="margin-bottom:1.25rem; display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="stat-box">
            <div id="fs-modal-score" class="stat-value" style="color:var(--accent-emerald);">0</div>
            <div class="stat-label">Final Score</div>
          </div>
          <div class="stat-box">
            <div id="fs-modal-best" class="stat-value" style="color:var(--accent-cyan);">${personalHighScore}</div>
            <div class="stat-label">Personal Best</div>
          </div>
        </div>

        <div id="fs-modal-breakdown" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1rem; margin-bottom:1.5rem; text-align:left; font-size:0.9rem; line-height:1.7;">
        </div>

        <div id="fs-modal-highscore-banner" style="display:none; background:linear-gradient(90deg, #f59e0b, #ec4899); color:#fff; font-weight:800; padding:0.5rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:1rem;">
          🎉 NEW PERSONAL HIGH SCORE! 👑
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="fs-modal-play-again" class="btn btn-primary btn-lg" style="flex:1; min-width:140px; font-weight:800;">Play Again 🔄</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 Leaderboards</a>
        </div>
      </div>
    </div>
  `;

  initGameSetup();
  bindInputEvents();
}

/**
 * Setup Canvas & World
 */
function initGameSetup() {
  canvas = document.getElementById('slicer-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  resetGameToReady();

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animationTime = 0;
  gameLoop();
}

/**
 * Reset Game State to Ready (Waits for Player to Click Start)
 */
function resetGameToReady() {
  gameState = 'READY';
  currentScore = 0;
  lives = 3;
  spawnInterval = 1100;
  spawnTimer = 0;
  activeFruits = [];
  slicedHalves = [];
  particles = [];
  toasts = [];
  bladePath = [];
  currentComboCount = 0;
  catchesBreakdown = { watermelon: 0, orange: 0, strawberry: 0, pineapple: 0, kiwi: 0, dragonfruit: 0, starfruit: 0 };

  updateHUD();
  updateActionButton();
}

/**
 * Start Match
 */
function startMatch() {
  gameState = 'PLAYING';
  matchStartTime = Date.now();
  currentScore = 0;
  lives = 3;
  spawnInterval = 1100;
  spawnTimer = 0;
  activeFruits = [];
  slicedHalves = [];
  particles = [];
  toasts = [];
  catchesBreakdown = { watermelon: 0, orange: 0, strawberry: 0, pineapple: 0, kiwi: 0, dragonfruit: 0, starfruit: 0 };

  spawnFruitWave();

  updateHUD();
  updateActionButton();
  playClickSound(800, 0.05);
}

/**
 * Spawn Wave of Fruits
 */
function spawnFruitWave() {
  const waveSize = currentScore > 300 ? Math.floor(2 + Math.random() * 3) : (currentScore > 100 ? Math.floor(1 + Math.random() * 2) : 1);

  for (let i = 0; i < waveSize; i++) {
    const rand = Math.random();
    let typeObj = FRUIT_TYPES[0];
    let cum = 0;

    for (const f of FRUIT_TYPES) {
      cum += f.rarity;
      if (rand <= cum) {
        typeObj = f;
        break;
      }
    }

    const startX = 120 + Math.random() * (canvas.width - 240);
    const startY = canvas.height + 40;
    
    // Calculate parabolic arc velocities towards center of canvas
    const targetCenterX = canvas.width / 2 + (Math.random() * 200 - 100);
    const vx = (targetCenterX - startX) * 0.012 + (Math.random() * 2 - 1);
    const vy = -(13.5 + Math.random() * 3.5);

    activeFruits.push({
      type: typeObj,
      x: startX,
      y: startY,
      vx: vx,
      vy: vy,
      gravity: 0.28,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.12,
      sliced: false
    });
  }
}

/**
 * Slice Fruit Entity into Two Halves!
 */
function sliceFruit(fruit, sliceAngle = 0) {
  fruit.sliced = true;
  currentScore += fruit.type.points;
  catchesBreakdown[fruit.type.id] = (catchesBreakdown[fruit.type.id] || 0) + 1;

  if (currentScore > personalHighScore) {
    personalHighScore = currentScore;
    try {
      localStorage.setItem('catkeylab_slicer_highscore', personalHighScore.toString());
    } catch (e) {}
  }

  // Track Combo Multiplier
  const now = Date.now();
  if (now - lastSliceTime < 300) {
    currentComboCount++;
  } else {
    currentComboCount = 1;
  }
  lastSliceTime = now;

  if (currentComboCount >= 2) {
    const comboBonus = currentComboCount * 10;
    currentScore += comboBonus;
    toasts.push({
      text: `🔥 ${currentComboCount}x COMBO! +${comboBonus}`,
      x: fruit.x,
      y: fruit.y - 30,
      alpha: 1.0,
      color: '#f59e0b',
      scale: 1.3
    });
    playSuccessSound();
  } else {
    toasts.push({
      text: `+${fruit.type.points}`,
      x: fruit.x,
      y: fruit.y - 20,
      alpha: 1.0,
      color: fruit.type.innerColor,
      scale: 1.0
    });
    playSliceSound();
  }

  // Create Left Half
  slicedHalves.push({
    type: fruit.type,
    x: fruit.x,
    y: fruit.y,
    vx: fruit.vx - 3.5,
    vy: fruit.vy - 1.5,
    gravity: 0.32,
    rotation: fruit.rotation,
    vRot: -0.15,
    side: 'left',
    alpha: 1.0
  });

  // Create Right Half
  slicedHalves.push({
    type: fruit.type,
    x: fruit.x,
    y: fruit.y,
    vx: fruit.vx + 3.5,
    vy: fruit.vy - 1.5,
    gravity: 0.32,
    rotation: fruit.rotation,
    vRot: 0.15,
    side: 'right',
    alpha: 1.0
  });

  // Juicy Particle Explosion
  createJuiceSplashParticles(fruit.x, fruit.y, fruit.type.innerColor);

  updateHUD();
}

/**
 * Handle Fruit Missed (Fell off bottom of screen)
 */
function handleFruitMissed(fruit) {
  lives--;
  playEscapeSound();

  toasts.push({
    text: `💔 MISSED!`,
    x: fruit.x,
    y: canvas.height - 60,
    alpha: 1.0,
    color: '#ef4444',
    scale: 1.2
  });

  updateHUD();

  if (lives <= 0) {
    triggerGameOver();
  }
}

/**
 * Trigger Game Over Modal
 */
function triggerGameOver() {
  gameState = 'GAMEOVER';
  updateHUD();
  updateActionButton();

  if (currentScore > 0) {
    submitScore('fruit-slicer-game', currentScore, `${currentScore} pts`);
  }

  const modalScore = document.getElementById('fs-modal-score');
  const modalBest = document.getElementById('fs-modal-best');
  const modalBreakdown = document.getElementById('fs-modal-breakdown');
  const highscoreBanner = document.getElementById('fs-modal-highscore-banner');

  if (modalScore) modalScore.textContent = currentScore;
  if (modalBest) modalBest.textContent = personalHighScore;
  if (highscoreBanner) {
    highscoreBanner.style.display = currentScore > 0 && currentScore >= personalHighScore ? 'block' : 'none';
  }

  if (modalBreakdown) {
    modalBreakdown.innerHTML = `
      <div style="font-weight:700; color:var(--accent-cyan); margin-bottom:0.4rem;">📊 Sliced Fruit Haul:</div>
      ${FRUIT_TYPES.map(f => {
        const count = catchesBreakdown[f.id] || 0;
        if (count === 0) return '';
        return `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
            <span>${f.emoji} ${f.name} (x${count})</span>
            <span style="font-weight:700; color:var(--accent-emerald);">+${count * f.points} pts</span>
          </div>
        `;
      }).join('') || '<div style="color:var(--text-muted); font-style:italic;">No fruits sliced this run. Try again!</div>'}
    `;
  }

  const modal = document.getElementById('fs-modal');
  if (modal) modal.classList.add('open');
}

/**
 * Update HUD
 */
function updateHUD() {
  const livesEl = document.getElementById('fs-lives');
  const scoreEl = document.getElementById('fs-score');
  const comboEl = document.getElementById('fs-combo');
  const highscoreEl = document.getElementById('fs-highscore');

  if (livesEl) {
    let hearts = '';
    for (let i = 0; i < 3; i++) {
      hearts += i < lives ? '❤️ ' : '🖤 ';
    }
    livesEl.textContent = hearts.trim();
  }

  if (scoreEl) scoreEl.textContent = currentScore;
  if (comboEl) comboEl.textContent = `${currentComboCount > 1 ? currentComboCount + 'x 🔥' : '1x'}`;
  if (highscoreEl) highscoreEl.textContent = personalHighScore;
}

/**
 * Update Action Button
 */
function updateActionButton() {
  const btn = document.getElementById('fs-action-btn');
  if (!btn) return;

  btn.className = 'btn btn-lg';

  if (gameState === 'READY') {
    btn.innerHTML = '⚔️ START SLICING GAME';
    btn.classList.add('btn-primary');
  } else if (gameState === 'PLAYING') {
    btn.innerHTML = '⚔️ SWIPE OR DRAG TO SLICE!';
    btn.classList.add('btn-secondary');
  } else if (gameState === 'GAMEOVER') {
    btn.innerHTML = '🔄 PLAY AGAIN';
    btn.classList.add('btn-primary');
  }
}

/**
 * Main 60FPS Game Loop
 */
function gameLoop() {
  animationTime += 0.03;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  if (gameState === 'PLAYING') {
    updateSpawning();
    updateFruitPhysics();
  }

  drawFruitEntities();
  drawSlicedHalves();
  drawBladeTrail();

  updateAndDrawParticles();
  drawToasts();

  animFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Render Background
 */
function drawBackground() {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle Arcade Dojo Wall Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

/**
 * Fruit Spawning Logic
 */
function updateSpawning() {
  spawnTimer += 16.6;
  const currentInterval = Math.max(550, 1100 - (currentScore * 2.2));

  if (spawnTimer >= currentInterval) {
    spawnTimer = 0;
    spawnFruitWave();
  }
}

/**
 * Update Fruit Trajectory Physics & Collision
 */
function updateFruitPhysics() {
  for (let i = activeFruits.length - 1; i >= 0; i--) {
    const f = activeFruits[i];

    if (f.sliced) {
      activeFruits.splice(i, 1);
      continue;
    }

    f.x += f.vx;
    f.vy += f.gravity;
    f.y += f.vy;
    f.rotation += f.vRot;

    // Check collision with active blade swipe trail!
    if (bladePath.length >= 2) {
      const p1 = bladePath[bladePath.length - 2];
      const p2 = bladePath[bladePath.length - 1];
      const dist = distToSegment({ x: f.x, y: f.y }, p1, p2);

      if (dist <= f.type.radius + 6) {
        const sliceAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        sliceFruit(f, sliceAngle);
        activeFruits.splice(i, 1);
        continue;
      }
    }

    // Missed Fruit (Fell past bottom)
    if (f.vy > 0 && f.y > canvas.height + 60) {
      activeFruits.splice(i, 1);
      handleFruitMissed(f);
    }
  }

  // Update Sliced Halves Physics
  for (let i = slicedHalves.length - 1; i >= 0; i--) {
    const h = slicedHalves[i];
    h.x += h.vx;
    h.vy += h.gravity;
    h.y += h.vy;
    h.rotation += h.vRot;
    h.alpha -= 0.015;

    if (h.y > canvas.height + 80 || h.alpha <= 0) {
      slicedHalves.splice(i, 1);
    }
  }
}

/**
 * Draw Vector Fruit Entities
 */
function drawFruitEntities() {
  activeFruits.forEach(f => {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    drawFruitGraphic(f.type);

    ctx.restore();
  });
}

/**
 * Draw Fruit Graphic Vector
 */
function drawFruitGraphic(t) {
  const r = t.radius;

  // Outer Peel
  ctx.fillStyle = t.outerColor;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // Inner Flesh
  ctx.fillStyle = t.innerColor;
  ctx.beginPath();
  ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
  ctx.fill();

  // Custom Fruit Details
  if (t.id === 'watermelon') {
    ctx.fillStyle = t.seedColor;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (r * 0.5), Math.sin(angle) * (r * 0.5), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (t.id === 'orange') {
    ctx.strokeStyle = t.seedColor;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * (r - 7), Math.sin(angle) * (r - 7));
      ctx.stroke();
    }
  } else if (t.id === 'pineapple') {
    ctx.strokeStyle = t.seedColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.5); ctx.lineTo(r * 0.5, r * 0.5);
    ctx.moveTo(r * 0.5, -r * 0.5); ctx.lineTo(-r * 0.5, r * 0.5);
    ctx.stroke();
  } else if (t.id === 'starfruit') {
    ctx.fillStyle = t.seedColor;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glossy Shine Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.35, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw Sliced Fruit Halves Spinning Apart
 */
function drawSlicedHalves() {
  slicedHalves.forEach(h => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, h.alpha);
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);

    const r = h.type.radius;

    ctx.beginPath();
    if (h.side === 'left') {
      ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5);
    } else {
      ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5);
    }
    ctx.closePath();

    ctx.fillStyle = h.type.innerColor;
    ctx.fill();

    ctx.strokeStyle = h.type.outerColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  });
}

/**
 * Draw Blade Trail
 */
function drawBladeTrail() {
  const now = Date.now();
  bladePath = bladePath.filter(p => now - p.time < 180);

  if (bladePath.length < 2) return;

  ctx.save();
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 18;

  for (let i = 1; i < bladePath.length; i++) {
    const p1 = bladePath[i - 1];
    const p2 = bladePath[i];
    const progress = i / bladePath.length;
    const width = progress * 14;

    ctx.strokeStyle = `rgba(255, 255, 255, ${progress})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Particles & Juice Splashes
 */
function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.alpha -= 0.025;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function createJuiceSplashParticles(x, y, color) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      radius: 2.5 + Math.random() * 3.5,
      alpha: 1.0,
      color: color
    });
  }
}

/**
 * Toast Banners
 */
function drawToasts() {
  for (let i = toasts.length - 1; i >= 0; i--) {
    const tObj = toasts[i];
    tObj.y -= 0.8;
    tObj.alpha -= 0.02;

    if (tObj.alpha <= 0) {
      toasts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = tObj.alpha;
    ctx.fillStyle = tObj.color;
    ctx.shadowColor = tObj.color;
    ctx.shadowBlur = 10;
    ctx.font = `900 ${Math.floor(16 * tObj.scale)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(tObj.text, tObj.x, tObj.y);
    ctx.restore();
  }
}

/**
 * Distance Point to Segment Math Utility
 */
function distToSegment(p, v, w) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let tP = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  tP = Math.max(0, Math.min(1, tP));
  return Math.hypot(p.x - (v.x + tP * (w.x - v.x)), p.y - (v.y + tP * (w.y - v.y)));
}

/**
 * Bind Input Listeners
 */
function bindInputEvents() {
  const actionBtn = document.getElementById('fs-action-btn');
  const resetBtn = document.getElementById('fs-reset-btn');
  const modalPlayAgain = document.getElementById('fs-modal-play-again');

  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      if (gameState === 'READY' || gameState === 'GAMEOVER') {
        startMatch();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('fs-modal').classList.remove('open');
      resetGameToReady();
    });
  }

  if (modalPlayAgain) {
    modalPlayAgain.addEventListener('click', () => {
      document.getElementById('fs-modal').classList.remove('open');
      startMatch();
    });
  }

  if (canvas) {
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (isSlashing) {
        bladePath.push({ x: x, y: y, time: Date.now() });
      }
    };

    canvas.addEventListener('pointerdown', (e) => {
      isSlashing = true;
      if (gameState === 'READY') {
        startMatch();
      }
      handlePointerMove(e);
    });

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', () => { isSlashing = false; });
    canvas.addEventListener('pointercancel', () => { isSlashing = false; });
  }
}

/**
 * Cleanup
 */
export function cleanupFruitSlicerGame() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
}
