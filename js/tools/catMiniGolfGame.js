/* ==========================================================================
   CatKeyLab - Nibbles Ultimate 2D Mini Golf Engine (HTML5 Canvas 2D Physics)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, playSuccessSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let canvas = null;
let ctx = null;
let animFrameId = null;

// Game State
let currentHoleIndex = 0;
let strokeCount = 0;
let totalStrokes = 0;
let totalPar = 12; // Hole 1 (Par 3) + Hole 2 (Par 4) + Hole 3 (Par 5) = 12
let isAiming = false;
let aimStartPos = { x: 0, y: 0 };
let aimCurrentPos = { x: 0, y: 0 };
let ballMoving = false;
let holeCompleted = false;

let lastBallState = null; // For Undo Shot

// Ball Physics Object
let ball = {
  x: 100,
  y: 250,
  vx: 0,
  vy: 0,
  radius: 9,
  friction: 0.982,
  color: '#ffffff'
};

// Wind Engine Vector
let wind = { x: 0, y: 0, strength: 0 };

// Weather Particle System
let weatherMode = 'sun'; // 'sun', 'rain', 'snow', 'night'
let weatherParticles = [];

// Holes & Courses Setup
const HOLES = [
  {
    name: 'Hole 1: Sunny Meadow ☀️',
    par: 3,
    weather: 'sun',
    ballStart: { x: 100, y: 250 },
    holePos: { x: 700, y: 250 },
    walls: [
      { x: 380, y: 100, w: 35, h: 300, label: '🧱 BUMPER WALL' }
    ],
    sandTraps: [
      { x: 480, y: 150, w: 130, h: 200, label: '🏖️ SAND TRAP' }
    ],
    waterHazards: [],
    icePatches: [],
    portals: [],
    windmill: null
  },
  {
    name: 'Hole 2: Catnip Forest 🌴',
    par: 4,
    weather: 'rain',
    ballStart: { x: 100, y: 150 },
    holePos: { x: 720, y: 400 },
    walls: [
      { x: 240, y: 0, w: 25, h: 310, label: '🧱 BUMPER WALL' },
      { x: 500, y: 180, w: 25, h: 320, label: '🧱 BUMPER WALL' }
    ],
    sandTraps: [
      { x: 310, y: 360, w: 160, h: 110, label: '🏖️ SAND TRAP' }
    ],
    waterHazards: [
      { x: 290, y: 100, w: 190, h: 180, label: '🌊 WATER HAZARD (+1)' }
    ],
    icePatches: [],
    portals: [
      { inX: 180, inY: 420, outX: 630, outY: 100, radius: 25, label: '🌀 PORTAL' }
    ],
    windmill: { x: 610, y: 250, radius: 60, angle: 0, speed: 0.03, label: '🌀 WINDMILL' }
  },
  {
    name: 'Hole 3: Ice & Snow Peaks ❄️',
    par: 5,
    weather: 'snow',
    ballStart: { x: 90, y: 420 },
    holePos: { x: 710, y: 100 },
    walls: [
      { x: 200, y: 200, w: 400, h: 25, label: '🧱 BUMPER WALL' },
      { x: 380, y: 0, w: 25, h: 200, label: '🧱 BUMPER WALL' }
    ],
    sandTraps: [],
    waterHazards: [
      { x: 450, y: 280, w: 180, h: 140, label: '🌊 WATER HAZARD (+1)' }
    ],
    icePatches: [
      { x: 250, y: 50, w: 120, h: 140, label: '🧊 SLICK ICE' },
      { x: 50, y: 240, w: 130, h: 130, label: '🧊 SLICK ICE' }
    ],
    portals: [
      { inX: 120, inY: 100, outX: 680, outY: 380, radius: 25, label: '🌀 PORTAL' }
    ],
    windmill: { x: 390, y: 330, radius: 65, angle: 0, speed: -0.04, label: '🌀 WINDMILL' }
  }
];

export function renderCatMiniGolfGame(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto; text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
          <span style="font-size:2.2rem;">⛳</span>
          <h1 style="font-size:2rem; font-weight:800;">Nibbles Ultimate 2D Mini Golf</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1rem;">
          Click & drag backward on the golf ball to aim & shoot! Avoid sand traps, water hazards, and bumper walls.
        </p>

        <!-- Weather & Control Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; background:var(--bg-secondary); border:1px solid var(--border-color); padding:0.85rem 1.25rem; border-radius:var(--radius-lg); margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; font-weight:700;">
            <span id="golf-hole-title" style="color:var(--accent-cyan); font-size:1.05rem;">Hole 1: Sunny Meadow ☀️</span>
            <span style="background:var(--bg-tertiary); padding:0.25rem 0.65rem; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--text-secondary);" id="golf-par-text">Par 3</span>
          </div>

          <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
            <!-- Wind Indicator -->
            <div id="golf-wind-badge" style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:0.35rem 0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.85rem; color:var(--accent-emerald);">
              💨 Wind: CalmMph
            </div>

            <!-- Weather Selector Buttons -->
            <div style="display:flex; gap:0.3rem;">
              <button class="btn btn-secondary btn-sm golf-weather-btn active" data-weather="sun" title="Sunny Weather">☀️</button>
              <button class="btn btn-secondary btn-sm golf-weather-btn" data-weather="rain" title="Rain Weather">🌧️</button>
              <button class="btn btn-secondary btn-sm golf-weather-btn" data-weather="snow" title="Snow Weather">❄️</button>
              <button class="btn btn-secondary btn-sm golf-weather-btn" data-weather="night" title="Night Mode">🌙</button>
            </div>

            <button id="pu-undo-btn" class="btn btn-secondary btn-sm" style="border-color:var(--accent-emerald); font-weight:700;">↩️ Undo Shot</button>
          </div>
        </div>

        <!-- Main Golf Canvas Display -->
        <div style="position:relative; display:inline-block; max-width:100%; border-radius:var(--radius-lg); overflow:hidden; border:3px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.4);">
          <canvas id="golf-canvas" width="800" height="500" style="display:block; width:100%; height:auto; background:#1b4332; cursor:crosshair;"></canvas>
        </div>

        <!-- Live Golf Dashboard -->
        <div class="stats-dashboard" style="max-width:600px; margin:1.25rem auto 1.5rem auto;">
          <div class="stat-box">
            <div id="golf-stroke-val" class="stat-value">0</div>
            <div class="stat-label">Current Hole Strokes</div>
          </div>
          <div class="stat-box">
            <div id="golf-total-stroke-val" class="stat-value">0</div>
            <div class="stat-label">Total Strokes</div>
          </div>
          <div class="stat-box">
            <div id="golf-total-par-val" class="stat-value">12</div>
            <div class="stat-label">Course Par</div>
          </div>
        </div>

        <div>
          <button id="golf-reset-btn" class="btn btn-primary btn-lg">🎲 Restart Golf Game</button>
        </div>
      </div>
    </div>

    <!-- Golf Victory Result Modal -->
    <div id="golf-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center;">
        <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">⛳ Hole-in-One Champion!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">Nibbles purrs and celebrates your mini golf masterclass!</p>

        <div class="stats-dashboard" style="margin-bottom:1.5rem;">
          <div class="stat-box">
            <div id="golf-modal-score" class="stat-value">0</div>
            <div class="stat-label">Total Strokes</div>
          </div>
          <div class="stat-box">
            <div id="golf-modal-par-diff" class="stat-value">E</div>
            <div class="stat-label">Score vs Par</div>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="golf-modal-retry" class="btn btn-primary btn-lg" style="flex:1; min-width:140px;">Play Again</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 View Leaderboard</a>
        </div>
      </div>
    </div>
  `;

  initCanvas();
  bindEvents();
}

function initCanvas() {
  canvas = document.getElementById('golf-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  currentHoleIndex = 0;
  totalStrokes = 0;
  loadHole(0);

  if (animFrameId) cancelAnimationFrame(animFrameId);
  gameLoop();
}

function loadHole(index) {
  currentHoleIndex = index;
  const hole = HOLES[currentHoleIndex];
  strokeCount = 0;
  holeCompleted = false;
  ballMoving = false;

  ball.x = hole.ballStart.x;
  ball.y = hole.ballStart.y;
  ball.vx = 0;
  ball.vy = 0;

  weatherMode = hole.weather;
  generateWind();
  initWeatherParticles();
  updateHUD();
}

function generateWind() {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.floor(Math.random() * 15); // 0 to 14 mph wind
  wind = {
    x: Math.cos(angle) * (speed * 0.008),
    y: Math.sin(angle) * (speed * 0.008),
    strength: speed,
    angle
  };

  const windEl = document.getElementById('golf-wind-badge');
  if (windEl) {
    const dirs = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
    const dirIdx = Math.round(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;
    windEl.textContent = `💨 Wind: ${speed} mph ${dirs[dirIdx]}`;
  }
}

function initWeatherParticles() {
  weatherParticles = [];
  const count = weatherMode === 'rain' ? 80 : (weatherMode === 'snow' ? 60 : 0);
  for (let i = 0; i < count; i++) {
    weatherParticles.push({
      x: Math.random() * 800,
      y: Math.random() * 500,
      speed: Math.random() * 4 + 2,
      radius: Math.random() * 2.5 + 1,
      length: Math.random() * 12 + 6
    });
  }
}

function gameLoop() {
  updatePhysics();
  renderCanvas();
  animFrameId = requestAnimationFrame(gameLoop);
}

function updatePhysics() {
  const hole = HOLES[currentHoleIndex];

  // Update Windmill Blade Angle
  if (hole.windmill) {
    hole.windmill.angle += hole.windmill.speed;
  }

  // Ball Movement Dynamics
  if (ballMoving) {
    const currentSpeed = Math.hypot(ball.vx, ball.vy);

    // Apply Wind Force (only when ball is rolling)
    if (currentSpeed > 0.35) {
      ball.vx += wind.x * 0.04;
      ball.vy += wind.y * 0.04;
    }

    // Check Surface Friction
    let currentFriction = 0.982;

    // Sand Traps Check
    hole.sandTraps.forEach(sand => {
      if (ball.x > sand.x && ball.x < sand.x + sand.w && ball.y > sand.y && ball.y < sand.y + sand.h) {
        currentFriction = 0.82; // Heavy drag
      }
    });

    // Ice Patches Check
    hole.icePatches.forEach(ice => {
      if (ball.x > ice.x && ball.x < ice.x + ice.w && ball.y > ice.y && ball.y < ice.y + ice.h) {
        currentFriction = 0.994; // Super slick
      }
    });

    // Water Hazard Check
    hole.waterHazards.forEach(water => {
      if (ball.x > water.x && ball.x < water.x + water.w && ball.y > water.y && ball.y < water.y + water.h) {
        // Water Penalty
        strokeCount++;
        totalStrokes++;
        playClickSound(300, 0.05);
        ball.x = hole.ballStart.x;
        ball.y = hole.ballStart.y;
        ball.vx = 0;
        ball.vy = 0;
        ballMoving = false;
        updateHUD();
      }
    });

    // Apply Velocity
    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= currentFriction;
    ball.vy *= currentFriction;

    // Outer Border Bounce
    if (ball.x - ball.radius < 10) { ball.x = 10 + ball.radius; ball.vx *= -0.75; playClickSound(500, 0.02); }
    if (ball.x + ball.radius > 790) { ball.x = 790 - ball.radius; ball.vx *= -0.75; playClickSound(500, 0.02); }
    if (ball.y - ball.radius < 10) { ball.y = 10 + ball.radius; ball.vy *= -0.75; playClickSound(500, 0.02); }
    if (ball.y + ball.radius > 490) { ball.y = 490 - ball.radius; ball.vy *= -0.75; playClickSound(500, 0.02); }

    // Custom Obstacle Walls Collision
    hole.walls.forEach(w => {
      if (ball.x + ball.radius > w.x && ball.x - ball.radius < w.x + w.w &&
          ball.y + ball.radius > w.y && ball.y - ball.radius < w.y + w.h) {
        if (ball.x < w.x || ball.x > w.x + w.w) ball.vx *= -0.8;
        if (ball.y < w.y || ball.y > w.y + w.h) ball.vy *= -0.8;
        playClickSound(600, 0.02);
      }
    });

    // Teleporter Portal Check
    hole.portals.forEach(p => {
      const dist = Math.hypot(ball.x - p.inX, ball.y - p.inY);
      if (dist < p.radius) {
        ball.x = p.outX;
        ball.y = p.outY;
        playClickSound(900, 0.03);
      }
    });

    // Stop Threshold (Static Ground Friction)
    if (Math.hypot(ball.vx, ball.vy) < 0.25) {
      ball.vx = 0;
      ball.vy = 0;
      ballMoving = false;
    }

    // Check Hole Drop (Victory on current hole)
    const distToCup = Math.hypot(hole.holePos.x - ball.x, hole.holePos.y - ball.y);
    if (distToCup < 14 && Math.hypot(ball.vx, ball.vy) < 4.5 && !holeCompleted) {
      holeCompleted = true;
      ball.x = hole.holePos.x;
      ball.y = hole.holePos.y;
      ball.vx = 0;
      ball.vy = 0;
      ballMoving = false;
      playSuccessSound();

      setTimeout(() => {
        if (currentHoleIndex + 1 < HOLES.length) {
          loadHole(currentHoleIndex + 1);
        } else {
          finishCourse();
        }
      }, 1200);
    }
  }
}

function renderCanvas() {
  if (!ctx) return;
  const hole = HOLES[currentHoleIndex];

  // 1. Clear & Background Course Colors
  ctx.fillStyle = weatherMode === 'night' ? '#0f172a' : (weatherMode === 'snow' ? '#e2e8f0' : '#2d6a4f');
  ctx.fillRect(0, 0, 800, 500);

  // Outer Border Frame
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 790, 490);

  ctx.font = 'bold 12px sans-serif';

  // 2. Render Sand Traps 🏖️ with Bold Borders & Labels
  hole.sandTraps.forEach(sand => {
    ctx.fillStyle = '#fde047';
    ctx.fillRect(sand.x, sand.y, sand.w, sand.h);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.strokeRect(sand.x, sand.y, sand.w, sand.h);

    ctx.fillStyle = '#854d0e';
    ctx.fillText(sand.label || '🏖️ SAND TRAP', sand.x + 10, sand.y + 22);
  });

  // 3. Render Water Hazards 🌊 with Bold Borders & Labels
  hole.waterHazards.forEach(water => {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(water.x, water.y, water.w, water.h);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3;
    ctx.strokeRect(water.x, water.y, water.w, water.h);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(water.label || '🌊 WATER HAZARD (+1)', water.x + 10, water.y + 22);
  });

  // 4. Render Ice Patches 🧊 with Bold Borders & Labels
  hole.icePatches.forEach(ice => {
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(ice.x, ice.y, ice.w, ice.h);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(ice.x, ice.y, ice.w, ice.h);

    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(ice.label || '🧊 SLICK ICE', ice.x + 10, ice.y + 22);
  });

  // 5. Render Obstacle Walls 🧱 with High-Contrast Outlines & Labels
  hole.walls.forEach(w => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(w.x, w.y, w.w, w.h);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🧱 WALL', w.x + 4, w.y + (w.h > 40 ? 25 : 16));
  });

  // 6. Render Portals 🌀 with Outlines & Labels
  hole.portals.forEach(p => {
    // Portal Entrance
    ctx.beginPath();
    ctx.arc(p.inX, p.inY, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌀 IN', p.inX - 14, p.inY - p.radius - 6);

    // Portal Exit
    ctx.beginPath();
    ctx.arc(p.outX, p.outY, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌀 OUT', p.outX - 18, p.outY - p.radius - 6);
  });

  // 7. Render Windmill 🌀 with Outlines & Labels
  if (hole.windmill) {
    const wm = hole.windmill;
    ctx.save();
    ctx.translate(wm.x, wm.y);
    ctx.rotate(wm.angle);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-7, 0, 14, wm.radius);
      ctx.strokeRect(-7, 0, 14, wm.radius);
    }
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌀 WINDMILL', wm.x - 35, wm.y - wm.radius - 10);
  }

  // 8. Render Hole Cup & Flag ⛳
  ctx.beginPath();
  ctx.arc(hole.holePos.x, hole.holePos.y, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Flag pole & red flag
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hole.holePos.x, hole.holePos.y);
  ctx.lineTo(hole.holePos.x, hole.holePos.y - 38);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(hole.holePos.x, hole.holePos.y - 38);
  ctx.lineTo(hole.holePos.x + 20, hole.holePos.y - 30);
  ctx.lineTo(hole.holePos.x, hole.holePos.y - 22);
  ctx.fill();

  ctx.fillStyle = '#34d399';
  ctx.fillText('⛳ CUP', hole.holePos.x - 18, hole.holePos.y + 28);

  // 9. Render Weather Particles (Rain / Snow)
  if (weatherMode === 'rain') {
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
    ctx.lineWidth = 1.5;
    weatherParticles.forEach(p => {
      p.y += p.speed;
      if (p.y > 500) p.y = 0;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2, p.y + p.length);
      ctx.stroke();
    });
  } else if (weatherMode === 'snow') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    weatherParticles.forEach(p => {
      p.y += p.speed * 0.5;
      p.x += Math.sin(p.y * 0.05) * 0.5;
      if (p.y > 500) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 10. Aim Vector Line
  if (isAiming) {
    const dx = aimStartPos.x - aimCurrentPos.x;
    const dy = aimStartPos.y - aimCurrentPos.y;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x + dx * 0.8, ball.y + dy * 0.8);
    ctx.stroke();
  }

  // 11. Render Golf Ball ⚪
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function shootBall(powerX, powerY) {
  if (ballMoving || holeCompleted) return;

  // Save State for Undo Shot
  lastBallState = { x: ball.x, y: ball.y, strokes: strokeCount, total: totalStrokes };

  const speedMult = 0.12;

  ball.vx = powerX * speedMult;
  ball.vy = powerY * speedMult;

  ballMoving = true;
  strokeCount++;
  totalStrokes++;
  playClickSound(750, 0.03);
  updateHUD();
}

function updateHUD() {
  const hole = HOLES[currentHoleIndex];
  const holeTitleEl = document.getElementById('golf-hole-title');
  const parTextEl = document.getElementById('golf-par-text');
  const strokeValEl = document.getElementById('golf-stroke-val');
  const totalStrokeValEl = document.getElementById('golf-total-stroke-val');
  const totalParValEl = document.getElementById('golf-total-par-val');

  if (holeTitleEl) holeTitleEl.textContent = hole.name;
  if (parTextEl) parTextEl.textContent = `Par ${hole.par}`;
  if (strokeValEl) strokeValEl.textContent = strokeCount;
  if (totalStrokeValEl) totalStrokeValEl.textContent = totalStrokes;
  if (totalParValEl) totalParValEl.textContent = totalPar;
}

function finishCourse() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const scoreDiff = totalStrokes - totalPar;
  let parDiffDisplay = 'E';
  if (scoreDiff < 0) parDiffDisplay = `${scoreDiff}`;
  else if (scoreDiff > 0) parDiffDisplay = `+${scoreDiff}`;

  playSuccessSound();
  submitScore('cat-mini-golf-game', totalStrokes, `${totalStrokes} Strokes (${parDiffDisplay})`);

  document.getElementById('golf-modal-score').textContent = totalStrokes;
  document.getElementById('golf-modal-par-diff').textContent = parDiffDisplay;
  document.getElementById('golf-modal').classList.add('open');
}

function bindEvents() {
  const resetBtn = document.getElementById('golf-reset-btn');
  const modalRetry = document.getElementById('golf-modal-retry');
  const weatherBtns = document.querySelectorAll('.golf-weather-btn');
  const undoBtn = document.getElementById('pu-undo-btn');

  if (resetBtn) resetBtn.addEventListener('click', () => loadHole(0));
  if (modalRetry) {
    modalRetry.addEventListener('click', () => {
      document.getElementById('golf-modal').classList.remove('open');
      initCanvas();
    });
  }

  // Weather Buttons
  weatherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      weatherBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      weatherMode = btn.dataset.weather;
      initWeatherParticles();
    });
  });

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (lastBallState && !ballMoving) {
        ball.x = lastBallState.x;
        ball.y = lastBallState.y;
        strokeCount = lastBallState.strokes;
        totalStrokes = lastBallState.total;
        updateHUD();
      }
    });
  }

  // Pointer Aim & Drag Listeners on Canvas & Window
  if (!canvas) return;

  const getCanvasPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (ballMoving || holeCompleted) return;
    const pos = getCanvasPos(e);
    const distToBall = Math.hypot(pos.x - ball.x, pos.y - ball.y);

    if (distToBall < 45) {
      isAiming = true;
      aimStartPos = { x: ball.x, y: ball.y };
      aimCurrentPos = pos;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  });

  const handlePointerMove = (e) => {
    if (isAiming) {
      aimCurrentPos = getCanvasPos(e);
    }
  };

  const handlePointerUp = (e) => {
    if (isAiming) {
      isAiming = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}

      const dx = aimStartPos.x - aimCurrentPos.x;
      const dy = aimStartPos.y - aimCurrentPos.y;
      if (Math.hypot(dx, dy) > 10) {
        shootBall(dx, dy);
      }
    }
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
}

export function cleanupCatMiniGolfGame() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
}
