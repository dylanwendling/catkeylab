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
let selectedMaxHoles = 18; // 3, 9, or 18
let currentHoleIndex = 0;
let strokeCount = 0;
let totalStrokes = 0;
let totalPar = 71;
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

// 18 Full Playable Mini Golf Holes
const ALL_18_HOLES = [
  { name: 'Hole 1: Sunny Tee ☀️', par: 3, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 700, y: 250 }, walls: [], sandTraps: [{ x: 400, y: 180, w: 100, h: 140, label: '🏖️ SAND TRAP' }], waterHazards: [], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 2: Bumper Alley 🧱', par: 3, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 700, y: 250 }, walls: [{ x: 380, y: 100, w: 35, h: 300, label: '🧱 BUMPER WALL' }], sandTraps: [], waterHazards: [], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 3: Sand Trap Bend 🏖️', par: 3, weather: 'sun', ballStart: { x: 100, y: 150 }, holePos: { x: 700, y: 380 }, walls: [{ x: 300, y: 0, w: 30, h: 300, label: '🧱 BUMPER WALL' }], sandTraps: [{ x: 450, y: 200, w: 140, h: 160, label: '🏖️ SAND TRAP' }], waterHazards: [], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 4: Windmill Pass 🌀', par: 4, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 720, y: 250 }, walls: [], sandTraps: [], waterHazards: [], icePatches: [], portals: [], windmills: [{ x: 400, y: 250, radius: 70, angle: 0, speed: 0.03, label: '🌀 WINDMILL' }] },
  { name: 'Hole 5: Water Crossing 🌊', par: 4, weather: 'rain', ballStart: { x: 100, y: 250 }, holePos: { x: 710, y: 250 }, walls: [], sandTraps: [], waterHazards: [{ x: 330, y: 100, w: 140, h: 300, label: '🌊 WATER HAZARD (+1)' }], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 6: Portal Jump 🌀', par: 4, weather: 'sun', ballStart: { x: 100, y: 120 }, holePos: { x: 700, y: 400 }, walls: [{ x: 260, y: 0, w: 30, h: 350, label: '🧱 BUMPER WALL' }], sandTraps: [], waterHazards: [], icePatches: [], portals: [{ inX: 180, inY: 400, outX: 620, outY: 120, radius: 25, label: '🌀 PORTAL' }], windmills: [] },
  { name: 'Hole 7: Ice Slide 🧊', par: 4, weather: 'snow', ballStart: { x: 90, y: 250 }, holePos: { x: 710, y: 250 }, walls: [], sandTraps: [], waterHazards: [], icePatches: [{ x: 250, y: 120, w: 300, h: 260, label: '🧊 SLICK ICE' }], portals: [], windmills: [] },
  { name: 'Hole 8: Double Bumper 🧱', par: 4, weather: 'sun', ballStart: { x: 100, y: 100 }, holePos: { x: 700, y: 400 }, walls: [{ x: 250, y: 0, w: 30, h: 320, label: '🧱 BUMPER WALL' }, { x: 500, y: 180, w: 30, h: 320, label: '🧱 BUMPER WALL' }], sandTraps: [], waterHazards: [], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 9: Forest Loop 🌴', par: 5, weather: 'rain', ballStart: { x: 100, y: 250 }, holePos: { x: 720, y: 400 }, walls: [{ x: 240, y: 0, w: 25, h: 310, label: '🧱 WALL' }], sandTraps: [{ x: 310, y: 360, w: 160, h: 110, label: '🏖️ SAND' }], waterHazards: [{ x: 290, y: 100, w: 190, h: 180, label: '🌊 WATER' }], icePatches: [], portals: [{ inX: 180, inY: 420, outX: 630, outY: 100, radius: 25, label: '🌀 PORTAL' }], windmills: [{ x: 610, y: 250, radius: 60, angle: 0, speed: 0.03, label: '🌀 WINDMILL' }] },
  { name: 'Hole 10: Rainy Slalom 🌧️', par: 4, weather: 'rain', ballStart: { x: 100, y: 250 }, holePos: { x: 700, y: 250 }, walls: [{ x: 300, y: 100, w: 30, h: 180, label: '🧱 WALL' }, { x: 500, y: 220, w: 30, h: 180, label: '🧱 WALL' }], sandTraps: [{ x: 380, y: 180, w: 90, h: 140, label: '🏖️ SAND' }], waterHazards: [], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 11: Narrow Water Bridge 🌉', par: 4, weather: 'rain', ballStart: { x: 100, y: 250 }, holePos: { x: 710, y: 250 }, walls: [], sandTraps: [], waterHazards: [{ x: 250, y: 50, w: 300, h: 160, label: '🌊 WATER' }, { x: 250, y: 290, w: 300, h: 160, label: '🌊 WATER' }], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 12: Portal Maze 🌀', par: 4, weather: 'night', ballStart: { x: 90, y: 400 }, holePos: { x: 710, y: 100 }, walls: [{ x: 200, y: 150, w: 400, h: 30, label: '🧱 WALL' }, { x: 400, y: 300, w: 30, h: 180, label: '🧱 WALL' }], sandTraps: [], waterHazards: [], icePatches: [], portals: [{ inX: 140, inY: 100, outX: 680, outY: 400, radius: 25, label: '🌀 PORTAL' }], windmills: [] },
  { name: 'Hole 13: Double Windmill 🌀', par: 4, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 720, y: 250 }, walls: [], sandTraps: [], waterHazards: [], icePatches: [], portals: [], windmills: [{ x: 280, y: 250, radius: 60, angle: 0, speed: 0.035, label: '🌀 WINDMILL 1' }, { x: 520, y: 250, radius: 60, angle: Math.PI / 4, speed: -0.035, label: '🌀 WINDMILL 2' }] },
  { name: 'Hole 14: Snowy Ice Run 🧊', par: 4, weather: 'snow', ballStart: { x: 90, y: 100 }, holePos: { x: 710, y: 400 }, walls: [{ x: 350, y: 0, w: 30, h: 320, label: '🧱 WALL' }], sandTraps: [], waterHazards: [], icePatches: [{ x: 120, y: 220, w: 200, h: 180, label: '🧊 SLICK ICE' }, { x: 420, y: 100, w: 200, h: 180, label: '🧊 SLICK ICE' }], portals: [], windmills: [] },
  { name: 'Hole 15: Sand & Water Combo 🏖️', par: 4, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 700, y: 250 }, walls: [], sandTraps: [{ x: 250, y: 100, w: 120, h: 300, label: '🏖️ SAND' }], waterHazards: [{ x: 450, y: 100, w: 120, h: 300, label: '🌊 WATER' }], icePatches: [], portals: [], windmills: [] },
  { name: 'Hole 16: Windmill Water Gauntlet 🌀', par: 5, weather: 'rain', ballStart: { x: 100, y: 250 }, holePos: { x: 720, y: 250 }, walls: [], sandTraps: [], waterHazards: [{ x: 420, y: 100, w: 150, h: 300, label: '🌊 WATER' }], icePatches: [], portals: [], windmills: [{ x: 280, y: 250, radius: 65, angle: 0, speed: -0.04, label: '🌀 WINDMILL' }] },
  { name: 'Hole 17: Island Green ⛳', par: 4, weather: 'sun', ballStart: { x: 100, y: 250 }, holePos: { x: 710, y: 250 }, walls: [], sandTraps: [], waterHazards: [{ x: 250, y: 50, w: 350, h: 400, label: '🌊 WATER HAZARD (+1)' }], icePatches: [], portals: [{ inX: 180, inY: 250, outX: 710, outY: 150, radius: 25, label: '🌀 PORTAL' }], windmills: [] },
  { name: 'Hole 18: Grand Finale 🏆', par: 5, weather: 'night', ballStart: { x: 90, y: 420 }, holePos: { x: 710, y: 100 }, walls: [{ x: 200, y: 200, w: 400, h: 25, label: '🧱 WALL' }], sandTraps: [{ x: 120, y: 100, w: 100, h: 100, label: '🏖️ SAND' }], waterHazards: [{ x: 450, y: 280, w: 180, h: 140, label: '🌊 WATER' }], icePatches: [{ x: 250, y: 50, w: 120, h: 140, label: '🧊 ICE' }], portals: [{ inX: 120, inY: 280, outX: 680, outY: 380, radius: 25, label: '🌀 PORTAL' }], windmills: [{ x: 390, y: 330, radius: 65, angle: 0, speed: -0.04, label: '🌀 WINDMILL' }] }
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
          Click & drag backward on the golf ball to aim & shoot! Master wind, portals, sand traps, and water hazards.
        </p>

        <!-- Course Selector & Control Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; background:var(--bg-secondary); border:1px solid var(--border-color); padding:0.85rem 1.25rem; border-radius:var(--radius-lg); margin-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; font-weight:700;">
            <span id="golf-hole-title" style="color:var(--accent-cyan); font-size:1.05rem;">Hole 1: Sunny Tee ☀️</span>
            <span style="background:var(--bg-tertiary); padding:0.25rem 0.65rem; border-radius:var(--radius-sm); font-size:0.85rem; color:var(--text-secondary);" id="golf-par-text">Par 3</span>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <!-- Round Length Selector -->
            <div style="display:flex; gap:0.3rem;">
              <button class="btn btn-secondary btn-sm golf-round-btn" data-holes="3">⛳ 3 Holes</button>
              <button class="btn btn-secondary btn-sm golf-round-btn" data-holes="9">⛳ 9 Holes</button>
              <button class="btn btn-secondary btn-sm golf-round-btn active" data-holes="18">⛳ 18 Holes</button>
            </div>

            <!-- Wind Indicator -->
            <div id="golf-wind-badge" style="background:var(--bg-tertiary); border:1px solid var(--border-color); padding:0.35rem 0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.85rem; color:var(--accent-emerald);">
              💨 Wind: CalmMph
            </div>

            <button id="pu-undo-btn" class="btn btn-secondary btn-sm" style="border-color:var(--accent-emerald); font-weight:700;">↩️ Undo Shot</button>
          </div>
        </div>

        <!-- Main Golf Canvas Display -->
        <div style="position:relative; display:inline-block; max-width:100%; border-radius:var(--radius-lg); overflow:hidden; border:3px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.4);">
          <canvas id="golf-canvas" width="800" height="500" style="display:block; width:100%; height:auto; background:#1b4332; cursor:crosshair;"></canvas>
        </div>

        <!-- Live Golf Dashboard -->
        <div class="stats-dashboard" style="max-width:650px; margin:1.25rem auto 1.5rem auto;">
          <div class="stat-box">
            <div id="golf-stroke-val" class="stat-value">0</div>
            <div class="stat-label">Hole Strokes</div>
          </div>
          <div class="stat-box">
            <div id="golf-total-stroke-val" class="stat-value">0</div>
            <div class="stat-label">Total Score</div>
          </div>
          <div class="stat-box">
            <div id="golf-total-par-val" class="stat-value">71</div>
            <div class="stat-label">Round Par</div>
          </div>
          <div class="stat-box">
            <div id="golf-hole-progress" class="stat-value">1 / 18</div>
            <div class="stat-label">Hole Progress</div>
          </div>
        </div>

        <div>
          <button id="golf-reset-btn" class="btn btn-primary btn-lg">🎲 Restart Selected Course</button>
        </div>
      </div>
    </div>

    <!-- Golf Victory Result Modal -->
    <div id="golf-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center;">
        <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">⛳ Golf Championship Complete!</h2>
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
  calculateTotalPar();
  loadHole(0);

  if (animFrameId) cancelAnimationFrame(animFrameId);
  gameLoop();
}

function calculateTotalPar() {
  totalPar = ALL_18_HOLES.slice(0, selectedMaxHoles).reduce((acc, h) => acc + h.par, 0);
}

function loadHole(index) {
  currentHoleIndex = index;
  const hole = ALL_18_HOLES[currentHoleIndex];
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
  const hole = ALL_18_HOLES[currentHoleIndex];

  // Update Windmills Angle
  if (hole.windmills && hole.windmills.length > 0) {
    hole.windmills.forEach(wm => {
      wm.angle += wm.speed;
    });
  }

  // Ball Movement Dynamics & Sub-Stepping Physics (Prevents Wall Tunneling)
  if (ballMoving) {
    const SUB_STEPS = 5;
    const stepVx = ball.vx / SUB_STEPS;
    const stepVy = ball.vy / SUB_STEPS;

    let currentFriction = 0.984;

    // Sand Traps Check
    hole.sandTraps.forEach(sand => {
      if (ball.x > sand.x && ball.x < sand.x + sand.w && ball.y > sand.y && ball.y < sand.y + sand.h) {
        currentFriction = 0.82; // Heavy drag
      }
    });

    // Ice Patches Check
    hole.icePatches.forEach(ice => {
      if (ball.x > ice.x && ball.x < ice.x + ice.w && ball.y > ice.y && ball.y < ice.y + ice.h) {
        currentFriction = 0.995; // Super slick
      }
    });

    for (let s = 0; s < SUB_STEPS; s++) {
      ball.x += stepVx;
      ball.y += stepVy;

      // Outer Border Collisions
      if (ball.x - ball.radius < 10) { ball.x = 10 + ball.radius; ball.vx = Math.abs(ball.vx) * 0.75; playClickSound(500, 0.02); }
      if (ball.x + ball.radius > 790) { ball.x = 790 - ball.radius; ball.vx = -Math.abs(ball.vx) * 0.75; playClickSound(500, 0.02); }
      if (ball.y - ball.radius < 10) { ball.y = 10 + ball.radius; ball.vy = Math.abs(ball.vy) * 0.75; playClickSound(500, 0.02); }
      if (ball.y + ball.radius > 490) { ball.y = 490 - ball.radius; ball.vy = -Math.abs(ball.vy) * 0.75; playClickSound(500, 0.02); }

      // Bumper Wall Continuous Collision Resolution
      hole.walls.forEach(w => {
        if (ball.x + ball.radius > w.x && ball.x - ball.radius < w.x + w.w &&
            ball.y + ball.radius > w.y && ball.y - ball.radius < w.y + w.h) {

          const overlapLeft = (ball.x + ball.radius) - w.x;
          const overlapRight = (w.x + w.w) - (ball.x - ball.radius);
          const overlapTop = (ball.y + ball.radius) - w.y;
          const overlapBottom = (w.y + w.h) - (ball.y - ball.radius);

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapLeft) {
            ball.x = w.x - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.8;
          } else if (minOverlap === overlapRight) {
            ball.x = w.x + w.w + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.8;
          } else if (minOverlap === overlapTop) {
            ball.y = w.y - ball.radius;
            ball.vy = -Math.abs(ball.vy) * 0.8;
          } else if (minOverlap === overlapBottom) {
            ball.y = w.y + w.h + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.8;
          }
          playClickSound(600, 0.02);
        }
      });
    }

    // Apply Friction Decay & Wind
    const currentSpeed = Math.hypot(ball.vx, ball.vy);
    if (currentSpeed > 0.35) {
      ball.vx += wind.x * 0.04;
      ball.vy += wind.y * 0.04;
    }

    ball.vx *= currentFriction;
    ball.vy *= currentFriction;

    // Water Hazard Check
    hole.waterHazards.forEach(water => {
      if (ball.x > water.x && ball.x < water.x + water.w && ball.y > water.y && ball.y < water.y + water.h) {
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
        if (currentHoleIndex + 1 < selectedMaxHoles) {
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
  const hole = ALL_18_HOLES[currentHoleIndex];

  // 1. Clear & Background Course Colors
  ctx.fillStyle = weatherMode === 'night' ? '#0f172a' : (weatherMode === 'snow' ? '#e2e8f0' : '#2d6a4f');
  ctx.fillRect(0, 0, 800, 500);

  // Outer Border Frame
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 790, 490);

  ctx.font = 'bold 12px sans-serif';

  // 2. Render Sand Traps 🏖️ with Outlines & Labels
  hole.sandTraps.forEach(sand => {
    ctx.fillStyle = '#fde047';
    ctx.fillRect(sand.x, sand.y, sand.w, sand.h);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.strokeRect(sand.x, sand.y, sand.w, sand.h);

    ctx.fillStyle = '#854d0e';
    ctx.fillText(sand.label || '🏖️ SAND TRAP', sand.x + 10, sand.y + 22);
  });

  // 3. Render Water Hazards 🌊 with Outlines & Labels
  hole.waterHazards.forEach(water => {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(water.x, water.y, water.w, water.h);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3;
    ctx.strokeRect(water.x, water.y, water.w, water.h);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(water.label || '🌊 WATER HAZARD (+1)', water.x + 10, water.y + 22);
  });

  // 4. Render Ice Patches 🧊 with Outlines & Labels
  hole.icePatches.forEach(ice => {
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(ice.x, ice.y, ice.w, ice.h);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(ice.x, ice.y, ice.w, ice.h);

    ctx.fillStyle = '#1e3a8a';
    ctx.fillText(ice.label || '🧊 SLICK ICE', ice.x + 10, ice.y + 22);
  });

  // 5. Render Obstacle Walls 🧱 with Outlines & Labels
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
    ctx.beginPath();
    ctx.arc(p.inX, p.inY, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌀 IN', p.inX - 14, p.inY - p.radius - 6);

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

  // 7. Render Windmills 🌀 (Supports Multiple Windmills per Hole)
  if (hole.windmills && hole.windmills.length > 0) {
    hole.windmills.forEach(wm => {
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
      ctx.fillText(wm.label || '🌀 WINDMILL', wm.x - 35, wm.y - wm.radius - 10);
    });
  }

  // 8. Render Hole Cup & Flag ⛳
  ctx.beginPath();
  ctx.arc(hole.holePos.x, hole.holePos.y, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 3;
  ctx.stroke();

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

  lastBallState = { x: ball.x, y: ball.y, strokes: strokeCount, total: totalStrokes };

  // Cap maximum shot power to prevent excessive speed tunneling
  const powerMag = Math.hypot(powerX, powerY);
  const maxPower = 180;
  if (powerMag > maxPower) {
    powerX = (powerX / powerMag) * maxPower;
    powerY = (powerY / powerMag) * maxPower;
  }

  const speedMult = 0.11;

  ball.vx = powerX * speedMult;
  ball.vy = powerY * speedMult;

  ballMoving = true;
  strokeCount++;
  totalStrokes++;
  playClickSound(750, 0.03);
  updateHUD();
}

function updateHUD() {
  const hole = ALL_18_HOLES[currentHoleIndex];
  const holeTitleEl = document.getElementById('golf-hole-title');
  const parTextEl = document.getElementById('golf-par-text');
  const strokeValEl = document.getElementById('golf-stroke-val');
  const totalStrokeValEl = document.getElementById('golf-total-stroke-val');
  const totalParValEl = document.getElementById('golf-total-par-val');
  const progressEl = document.getElementById('golf-hole-progress');

  if (holeTitleEl) holeTitleEl.textContent = hole.name;
  if (parTextEl) parTextEl.textContent = `Par ${hole.par}`;
  if (strokeValEl) strokeValEl.textContent = strokeCount;
  if (totalStrokeValEl) totalStrokeValEl.textContent = totalStrokes;
  if (totalParValEl) totalParValEl.textContent = totalPar;
  if (progressEl) progressEl.textContent = `${currentHoleIndex + 1} / ${selectedMaxHoles}`;
}

function finishCourse() {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const scoreDiff = totalStrokes - totalPar;
  let parDiffDisplay = 'E';
  if (scoreDiff < 0) parDiffDisplay = `${scoreDiff}`;
  else if (scoreDiff > 0) parDiffDisplay = `+${scoreDiff}`;

  playSuccessSound();
  submitScore('cat-mini-golf-game', totalStrokes, `${totalStrokes} Strokes (${parDiffDisplay} on ${selectedMaxHoles} Holes)`);

  document.getElementById('golf-modal-score').textContent = totalStrokes;
  document.getElementById('golf-modal-par-diff').textContent = parDiffDisplay;
  document.getElementById('golf-modal').classList.add('open');
}

function bindEvents() {
  const resetBtn = document.getElementById('golf-reset-btn');
  const modalRetry = document.getElementById('golf-modal-retry');
  const roundBtns = document.querySelectorAll('.golf-round-btn');
  const undoBtn = document.getElementById('pu-undo-btn');

  if (resetBtn) resetBtn.addEventListener('click', () => loadHole(0));
  if (modalRetry) {
    modalRetry.addEventListener('click', () => {
      document.getElementById('golf-modal').classList.remove('open');
      initCanvas();
    });
  }

  // Round Length Selector Buttons (3, 9, 18 Holes)
  roundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roundBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      selectedMaxHoles = parseInt(btn.dataset.holes, 10);
      calculateTotalPar();
      loadHole(0);
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
