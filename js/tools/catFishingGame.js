/* ==========================================================================
   CatKeyLab - Nibbles 2D Cartoon Fishing Game (HTML5 Canvas 2D)
   ========================================================================== */

import { t } from '../i18n.js';
import { 
  playClickSound, 
  playSuccessSound, 
  playSplashSound, 
  playBiteAlertSound, 
  playReelSound, 
  playEscapeSound 
} from '../audio.js';
import { submitScore } from '../leaderboard.js';

// Canvas & Engine State
let canvas = null;
let ctx = null;
let animFrameId = null;

// Game State Enum: 'IDLE', 'READY', 'CASTING', 'WAITING', 'BITE', 'REELING', 'CATCH', 'ESCAPE', 'GAMEOVER'
let gameState = 'IDLE';

// Game Timers & Statistics
let gameTimeLeft = 60.0;
let timerInterval = null;
let currentScore = 0;
let totalFishCaught = 0;
let personalHighScore = 0;
let catchesBreakdown = {
  minnow: 0,
  clownfish: 0,
  pufferfish: 0,
  koi: 0,
  kraken: 0,
  boot: 0
};

// Key & Event Listeners state
let spaceListenerBound = false;

// Bite & Reeling Mechanic Variables
let biteTimer = null;
let biteTimeoutId = null;
let biteWindowTimer = 0; // seconds remaining to hit Reel
let activeBitingFish = null;

// Tension Reeling Mini-Game State
let reelingTension = 50; // 0 to 100
let reelingProgress = 0; // 0 to 100%
let reelingTargetZone = { start: 30, end: 75 }; // Green catch zone
let tensionDriftSpeed = 0;

// World & Visual Physics Objects
let animationTime = 0;

// Boat & Nibbles Mascot Position
let boat = {
  x: 140,
  y: 118,
  targetY: 118,
  bobOffset: 0,
  tilt: 0
};

// Fishing Rod Tip
let rodTip = {
  x: 200,
  y: 75
};

// Bobber & Line State
let bobber = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  vx: 0,
  vy: 0,
  active: false,
  submerged: false,
  dipOffset: 0
};

// Line Cast Arc Animation
let castArc = {
  active: false,
  progress: 0,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
};

// Toast & Catch Text Popups
let catchToast = null; // { text, x, y, alpha, color }

// Particle Systems
let particles = []; // Water splashes, bubbles, sparkles, sparkles

// Fish Definitions Database
const FISH_TYPES = [
  {
    id: 'minnow',
    name: 'Silver Minnow',
    emoji: '🐟',
    points: 100,
    speed: 1.8,
    width: 32,
    height: 18,
    color: '#38bdf8', // Sky Blue
    accentColor: '#e0f2fe',
    rarity: 0.40,
    biteReactionWindow: 1.6,
    difficulty: 1.0
  },
  {
    id: 'clownfish',
    name: 'Orange Clownfish',
    emoji: '🐠',
    points: 250,
    speed: 1.4,
    width: 38,
    height: 24,
    color: '#f97316', // Orange
    accentColor: '#ffffff', // White stripes
    rarity: 0.30,
    biteReactionWindow: 1.4,
    difficulty: 1.3
  },
  {
    id: 'pufferfish',
    name: 'Spiky Pufferfish',
    emoji: '🐡',
    points: 400,
    speed: 1.1,
    width: 44,
    height: 32,
    color: '#eab308', // Gold/Yellow
    accentColor: '#78350f', // Dark spikes
    rarity: 0.17,
    biteReactionWindow: 1.25,
    difficulty: 1.6
  },
  {
    id: 'koi',
    name: 'Golden Koi',
    emoji: '✨',
    points: 750,
    speed: 2.3,
    width: 48,
    height: 26,
    color: '#fbbf24', // Shining Gold
    accentColor: '#d97706',
    rarity: 0.08,
    biteReactionWindow: 1.0,
    difficulty: 2.0
  },
  {
    id: 'kraken',
    name: 'Legendary Rainbow Fish',
    emoji: '🌈',
    points: 1500,
    speed: 2.7,
    width: 58,
    height: 34,
    color: '#ec4899', // Pink / Rainbow aura
    accentColor: '#a855f7',
    rarity: 0.03,
    biteReactionWindow: 0.85,
    difficulty: 2.6
  },
  {
    id: 'boot',
    name: 'Old Leather Boot',
    emoji: '👞',
    points: 25,
    speed: 0.5,
    width: 36,
    height: 26,
    color: '#78350f',
    accentColor: '#451a03',
    rarity: 0.02,
    biteReactionWindow: 2.0,
    difficulty: 0.8
  }
];

// Active Swimming Fish Entities
let swimmingFish = [];

// Environmental Decor (Clouds, Seaweed, Bubbles)
let clouds = [];
let seaweedClumps = [];
let bubbles = [];

/**
 * Initialize Canvas & Render Main HTML Component
 */
export function renderCatFishingGame(container) {
  // Load saved high score from localStorage
  try {
    personalHighScore = parseInt(localStorage.getItem('catkeylab_fishing_highscore')) || 0;
  } catch (e) {
    personalHighScore = 0;
  }

  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto; text-align:center;">
        
        <!-- Game Header -->
        <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
          <span style="font-size:2.2rem;">🎣</span>
          <h1 style="font-size:2rem; font-weight:800;">Nibbles 2D Fishing Adventure</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1.25rem;">
          Cast your fishing line into the water, wait for a bite ❗️, and reel in high-value fish before the 60s timer runs out!
        </p>

        <!-- Live Dashboard Stats -->
        <div class="stats-dashboard" style="max-width:720px; margin:0 auto 1.25rem auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
          <div class="stat-box">
            <div id="fg-timer" class="stat-value" style="color:var(--accent-amber);">60.0s</div>
            <div class="stat-label">Time Remaining</div>
          </div>
          <div class="stat-box">
            <div id="fg-score" class="stat-value" style="color:var(--accent-emerald);">0</div>
            <div class="stat-label">Total Score</div>
          </div>
          <div class="stat-box">
            <div id="fg-caught" class="stat-value" style="color:var(--accent-cyan);">0</div>
            <div class="stat-label">Fish Caught</div>
          </div>
          <div class="stat-box">
            <div id="fg-highscore" class="stat-value" style="color:var(--accent-primary);">${personalHighScore}</div>
            <div class="stat-label">Personal Best</div>
          </div>
        </div>

        <!-- Canvas Container -->
        <div style="position:relative; width:100%; max-width:850px; margin:0 auto 1.25rem auto; border-radius:var(--radius-lg); overflow:hidden; border:2px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.3); background:#0284c7;">
          <canvas id="fishing-canvas" width="850" height="460" style="display:block; width:100%; height:auto; cursor:pointer; touch-action:manipulation;"></canvas>
        </div>

        <!-- Action Control Bar -->
        <div style="display:flex; justify-content:center; align-items:center; gap:1rem; flex-wrap:wrap;">
          <button id="fg-action-btn" class="btn btn-primary btn-lg" style="min-width:240px; font-size:1.2rem; font-weight:800; padding:0.85rem 1.75rem; transition:transform 0.1s ease, box-shadow 0.2s ease;">
            🎣 START FISHING GAME
          </button>
          <button id="fg-reset-btn" class="btn btn-secondary btn-lg">
            🔄 Reset
          </button>
        </div>

        <!-- Keyboard Shortcut Hint -->
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.75rem;">
          💡 <strong>Tip:</strong> Press <kbd style="background:var(--bg-tertiary); padding:0.15rem 0.4rem; border-radius:4px; border:1px solid var(--border-color);">Spacebar</kbd> or click anywhere on the water to Cast & Reel!
        </p>

      </div>
    </div>

    <!-- Game Over Results Modal -->
    <div id="fg-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center; max-width:500px; padding:2rem;">
        <div style="font-size:3rem; margin-bottom:0.5rem;" id="fg-modal-icon">🏆</div>
        <h2 style="font-size:1.9rem; font-weight:800; margin-bottom:0.25rem;" id="fg-modal-title">Time's Up! Great Catch!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1.25rem;" id="fg-modal-subtitle">Nibbles is thrilled with today's fishing haul!</p>

        <!-- Final Stats Cards -->
        <div class="stats-dashboard" style="margin-bottom:1.25rem; display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div class="stat-box">
            <div id="fg-modal-score" class="stat-value" style="color:var(--accent-emerald);">0</div>
            <div class="stat-label">Final Score</div>
          </div>
          <div class="stat-box">
            <div id="fg-modal-count" class="stat-value" style="color:var(--accent-cyan);">0</div>
            <div class="stat-label">Fish Caught</div>
          </div>
        </div>

        <!-- Fish Breakdown List -->
        <div id="fg-modal-breakdown" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1rem; margin-bottom:1.5rem; text-align:left; font-size:0.9rem; line-height:1.7;">
        </div>

        <!-- High Score Badge Banner -->
        <div id="fg-modal-highscore-banner" style="display:none; background:linear-gradient(90deg, #f59e0b, #ec4899); color:#fff; font-weight:800; padding:0.5rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:1rem; box-shadow:0 4px 15px rgba(245,158,11,0.4);">
          🎉 NEW PERSONAL HIGH SCORE! 👑
        </div>

        <!-- Modal Actions -->
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="fg-modal-play-again" class="btn btn-primary btn-lg" style="flex:1; min-width:140px; font-weight:800;">Play Again 🔄</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 Leaderboards</a>
        </div>
      </div>
    </div>
  `;

  initGameSetup();
  bindUIEvents();
}

/**
 * Initialize Canvas Context & World Geometry
 */
function initGameSetup() {
  canvas = document.getElementById('fishing-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  // World Initialization
  clouds = [
    { x: 80, y: 35, speed: 0.2, size: 28 },
    { x: 340, y: 22, speed: 0.15, size: 36 },
    { x: 620, y: 42, speed: 0.25, size: 30 }
  ];

  seaweedClumps = [
    { x: 80, height: 80, color: '#15803d', phase: 0 },
    { x: 220, height: 110, color: '#166534', phase: 1.2 },
    { x: 400, height: 95, color: '#15803d', phase: 2.4 },
    { x: 580, height: 120, color: '#166534', phase: 0.8 },
    { x: 740, height: 85, color: '#15803d', phase: 3.1 }
  ];

  bubbles = [];
  for (let i = 0; i < 16; i++) {
    bubbles.push({
      x: Math.random() * canvas.width,
      y: 160 + Math.random() * 280,
      radius: 1.5 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.7,
      wobble: Math.random() * Math.PI * 2
    });
  }

  // Populate Initial Swimming Fish underwater
  initSwimmingFish(7);

  // Set Default State
  gameState = 'IDLE';
  gameTimeLeft = 60.0;
  currentScore = 0;
  totalFishCaught = 0;
  catchesBreakdown = { minnow: 0, clownfish: 0, pufferfish: 0, koi: 0, kraken: 0, boot: 0 };

  updateHUD();
  updateActionButtonText();

  // Start Animation Loop
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animationTime = 0;
  gameLoop();
}

/**
 * Populate Swimming Underwater Fish
 */
function initSwimmingFish(count = 7) {
  swimmingFish = [];
  for (let i = 0; i < count; i++) {
    swimmingFish.push(spawnRandomFish());
  }
}

/**
 * Spawn a single swimming fish entity based on weighted rarity
 */
function spawnRandomFish(forcedType = null) {
  let typeObj = forcedType;
  if (!typeObj) {
    const rand = Math.random();
    let cum = 0;
    for (const f of FISH_TYPES) {
      cum += f.rarity;
      if (rand <= cum) {
        typeObj = f;
        break;
      }
    }
    if (!typeObj) typeObj = FISH_TYPES[0];
  }

  const direction = Math.random() > 0.5 ? 1 : -1;
  const startX = direction === 1 ? -60 - Math.random() * 100 : canvas.width + 60 + Math.random() * 100;
  const startY = 175 + Math.random() * 230; // Underwater zone (150px to 420px)

  return {
    type: typeObj,
    x: startX,
    y: startY,
    targetY: startY,
    dx: direction * (typeObj.speed * (0.85 + Math.random() * 0.3)),
    dy: 0,
    swimPhase: Math.random() * Math.PI * 2,
    isTargeted: false
  };
}

/**
 * Start 60-Second Game Match
 */
function startGameMatch() {
  if (timerInterval) clearInterval(timerInterval);

  gameState = 'READY';
  gameTimeLeft = 60.0;
  currentScore = 0;
  totalFishCaught = 0;
  catchesBreakdown = { minnow: 0, clownfish: 0, pufferfish: 0, koi: 0, kraken: 0, boot: 0 };
  bobber.active = false;

  updateHUD();
  updateActionButtonText();

  // 60-second timer interval
  timerInterval = setInterval(() => {
    gameTimeLeft -= 0.1;
    if (gameTimeLeft <= 0) {
      gameTimeLeft = 0;
      triggerGameOver();
    }
    updateHUD();
  }, 100);

  playClickSound(800, 0.05);
}

/**
 * Perform Line Cast Action
 */
function castFishingLine() {
  if (gameState !== 'READY') return;

  gameState = 'CASTING';

  // Target spot in water: Random x between 360 and 720
  const targetX = 360 + Math.random() * 340;
  const targetY = 138; // Water surface line

  castArc.active = true;
  castArc.progress = 0;
  castArc.startX = rodTip.x;
  castArc.startY = rodTip.y;
  castArc.endX = targetX;
  castArc.endY = targetY;

  bobber.x = rodTip.x;
  bobber.y = rodTip.y;
  bobber.active = true;

  playClickSound(500, 0.08);
  updateActionButtonText();
}

/**
 * Handle Bobber Splash Landing & Schedule Fish Bite
 */
function onBobberLanded() {
  gameState = 'WAITING';
  bobber.x = castArc.endX;
  bobber.y = castArc.endY;

  // Create Water Splash Particles
  createSplashParticles(bobber.x, bobber.y);
  playSplashSound();

  updateActionButtonText();

  // Schedule bite after 1.2s to 3.2s
  const biteWaitTime = 1200 + Math.random() * 2000;
  
  if (biteTimeoutId) clearTimeout(biteTimeoutId);
  biteTimeoutId = setTimeout(() => {
    if (gameState === 'WAITING' && gameTimeLeft > 0) {
      triggerFishBite();
    }
  }, biteWaitTime);
}

/**
 * Trigger Fish Bite Alert Event
 */
function triggerFishBite() {
  gameState = 'BITE';

  // Select a fish to bite hook
  activeBitingFish = spawnRandomFish().type;
  biteWindowTimer = activeBitingFish.biteReactionWindow;

  // Visual Bobber Dip & Splash
  bobber.dipOffset = 18;
  createSplashParticles(bobber.x, bobber.y + 10);
  playBiteAlertSound();

  updateActionButtonText();
}

/**
 * Start Interactive Tension Reeling Mini-Game
 */
function startReelingMiniGame() {
  if (gameState !== 'BITE') return;

  gameState = 'REELING';

  reelingTension = 50;
  reelingProgress = 15; // Start with 15% bonus for fast reaction!
  tensionDriftSpeed = (Math.random() > 0.5 ? 1 : -1) * (1.2 * activeBitingFish.difficulty);

  // Define target green tension zone
  const zoneWidth = Math.max(25, 45 - activeBitingFish.difficulty * 6);
  const zoneStart = 25 + Math.random() * (50 - zoneWidth);
  reelingTargetZone = { start: zoneStart, end: zoneStart + zoneWidth };

  playReelSound();
  updateActionButtonText();
}

/**
 * Player Taps/Clicks Reel Button during Reeling
 */
function reelActionInput() {
  if (gameState === 'READY') {
    castFishingLine();
  } else if (gameState === 'BITE') {
    startReelingMiniGame();
  } else if (gameState === 'REELING') {
    // Increase Tension & Progress
    reelingTension = Math.min(100, reelingTension + 12);
    reelingProgress = Math.min(100, reelingProgress + 14);
    playReelSound();

    if (reelingProgress >= 100) {
      completeSuccessfulCatch();
    }
  } else if (gameState === 'GAMEOVER' || gameState === 'IDLE') {
    startGameMatch();
  }
}

/**
 * Successfully Caught Fish Handler
 */
function completeSuccessfulCatch() {
  gameState = 'CATCH';
  const fish = activeBitingFish;

  currentScore += fish.points;
  totalFishCaught++;
  catchesBreakdown[fish.id] = (catchesBreakdown[fish.id] || 0) + 1;

  if (currentScore > personalHighScore) {
    personalHighScore = currentScore;
    try {
      localStorage.setItem('catkeylab_fishing_highscore', personalHighScore.toString());
    } catch (e) {}
  }

  // Create Catch Celebration Toast & Sparkles
  catchToast = {
    text: `CAUGHT ${fish.name.toUpperCase()}! +${fish.points} PTS ${fish.emoji}`,
    x: bobber.x,
    y: bobber.y - 40,
    alpha: 1.0,
    color: fish.color
  };

  createCatchSparkleParticles(bobber.x, bobber.y);
  playSuccessSound();

  updateHUD();

  // Reset bobber back to rod after 1.2s
  setTimeout(() => {
    if (gameState === 'CATCH' && gameTimeLeft > 0) {
      bobber.active = false;
      gameState = 'READY';
      updateActionButtonText();
    }
  }, 1200);
}

/**
 * Fish Escaped Handler
 */
function handleFishEscape(reason = 'Missed Reaction') {
  gameState = 'ESCAPE';
  
  createSplashParticles(bobber.x, bobber.y);
  playEscapeSound();

  catchToast = {
    text: `FISH ESCAPED! 💨`,
    x: bobber.x,
    y: bobber.y - 30,
    alpha: 1.0,
    color: '#ef4444'
  };

  setTimeout(() => {
    if (gameState === 'ESCAPE' && gameTimeLeft > 0) {
      bobber.active = false;
      gameState = 'READY';
      updateActionButtonText();
    }
  }, 1000);
}

/**
 * Game Over Handler
 */
function triggerGameOver() {
  if (timerInterval) clearInterval(timerInterval);

  gameState = 'GAMEOVER';
  bobber.active = false;

  updateHUD();
  updateActionButtonText();

  // Score Submission to Global Leaderboard
  if (currentScore > 0) {
    submitScore('cat-fishing-game', currentScore, `${currentScore} pts (${totalFishCaught} fish)`);
  }

  // Render Modal Results
  const modalScore = document.getElementById('fg-modal-score');
  const modalCount = document.getElementById('fg-modal-count');
  const modalBreakdown = document.getElementById('fg-modal-breakdown');
  const highscoreBanner = document.getElementById('fg-modal-highscore-banner');

  if (modalScore) modalScore.textContent = currentScore;
  if (modalCount) modalCount.textContent = totalFishCaught;

  if (highscoreBanner) {
    highscoreBanner.style.display = currentScore > 0 && currentScore >= personalHighScore ? 'block' : 'none';
  }

  if (modalBreakdown) {
    modalBreakdown.innerHTML = `
      <div style="font-weight:700; color:var(--accent-cyan); margin-bottom:0.4rem;">📊 Haul Summary:</div>
      ${FISH_TYPES.map(f => {
        const count = catchesBreakdown[f.id] || 0;
        if (count === 0) return '';
        return `
          <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
            <span>${f.emoji} ${f.name} (x${count})</span>
            <span style="font-weight:700; color:var(--accent-emerald);">+${count * f.points} pts</span>
          </div>
        `;
      }).join('') || '<div style="color:var(--text-muted); font-style:italic;">No fish caught this run. Try again!</div>'}
    `;
  }

  const modal = document.getElementById('fg-modal');
  if (modal) modal.classList.add('open');
}

/**
 * Update HTML Stats HUD
 */
function updateHUD() {
  const timerEl = document.getElementById('fg-timer');
  const scoreEl = document.getElementById('fg-score');
  const caughtEl = document.getElementById('fg-caught');
  const highscoreEl = document.getElementById('fg-highscore');

  if (timerEl) timerEl.textContent = `${Math.max(0, gameTimeLeft).toFixed(1)}s`;
  if (scoreEl) scoreEl.textContent = currentScore;
  if (caughtEl) caughtEl.textContent = totalFishCaught;
  if (highscoreEl) highscoreEl.textContent = personalHighScore;
}

/**
 * Update Action Button Styles & Labels dynamically
 */
function updateActionButtonText() {
  const btn = document.getElementById('fg-action-btn');
  if (!btn) return;

  btn.className = 'btn btn-lg';

  if (gameState === 'IDLE') {
    btn.innerHTML = '🎣 START FISHING GAME';
    btn.classList.add('btn-primary');
    btn.style.transform = 'none';
  } else if (gameState === 'READY') {
    btn.innerHTML = '🎣 CAST LINE (Spacebar)';
    btn.classList.add('btn-primary');
    btn.style.transform = 'none';
  } else if (gameState === 'CASTING') {
    btn.innerHTML = '⏳ Casting Line...';
    btn.classList.add('btn-secondary');
  } else if (gameState === 'WAITING') {
    btn.innerHTML = '🌊 Waiting for Bite...';
    btn.classList.add('btn-secondary');
  } else if (gameState === 'BITE') {
    btn.innerHTML = '⚡ REEL NOW! ❗️';
    btn.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
    btn.style.color = '#ffffff';
    btn.style.boxShadow = '0 0 25px rgba(239,68,68,0.8)';
    btn.style.transform = 'scale(1.08)';
  } else if (gameState === 'REELING') {
    btn.innerHTML = '🎣 REELING! CLICK/SPACE! ⚡';
    btn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
    btn.style.color = '#ffffff';
    btn.style.boxShadow = '0 0 25px rgba(16,185,129,0.8)';
  } else if (gameState === 'CATCH') {
    btn.innerHTML = '✨ CAUGHT! 🐟';
    btn.classList.add('btn-primary');
  } else if (gameState === 'GAMEOVER') {
    btn.innerHTML = '🔄 PLAY AGAIN';
    btn.classList.add('btn-primary');
  }
}

/**
 * Particles Helpers
 */
function createSplashParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI - Math.PI;
    const speed = 1.5 + Math.random() * 3.5;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.0,
      radius: 2 + Math.random() * 3,
      alpha: 1.0,
      color: '#e0f2fe',
      life: 0.6
    });
  }
}

function createCatchSparkleParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 40 - 20),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      radius: 3 + Math.random() * 4,
      alpha: 1.0,
      color: ['#fbbf24', '#38bdf8', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)],
      life: 0.9
    });
  }
}

/**
 * Main Canvas Render Loop (60 FPS)
 */
function gameLoop() {
  animationTime += 0.03;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Render Sky & Atmospheric Background
  drawSkyBackground();

  // 2. Render Underwater Zone & Caustics
  drawUnderwaterWorld();

  // 3. Update & Render Swimming Fish
  updateAndDrawFish();

  // 4. Render Floating Boat & Nibbles Cat Mascot
  drawBoatAndNibbles();

  // 5. Update & Render Line Cast Physics & Bobber
  updateAndDrawFishingLine();

  // 6. Update Reeling Mechanics & Tension Meter
  if (gameState === 'REELING') {
    updateReelingPhysics();
    drawReelingMeterOverlay();
  }

  // 7. Update & Draw Particles
  updateAndDrawParticles();

  // 8. Draw Catch Popups
  drawCatchToast();

  // 9. Draw Bite Alert Overlay Banner
  if (gameState === 'BITE') {
    updateBiteTimer();
    drawBiteAlertBanner();
  }

  animFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Render Sky & Sunrise Atmosphere
 */
function drawSkyBackground() {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
  skyGrad.addColorStop(0, '#38bdf8'); // Sky blue
  skyGrad.addColorStop(0.7, '#7dd3fc');
  skyGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, 140);

  // Sun
  ctx.save();
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(720, 45, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Moving Clouds
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > canvas.width + 60) c.x = -60;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx.arc(c.x + c.size * 0.7, c.y - c.size * 0.3, c.size * 0.8, 0, Math.PI * 2);
    ctx.arc(c.x + c.size * 1.3, c.y, c.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Render Ocean Surface & Underwater Environment
 */
function drawUnderwaterWorld() {
  const waterSurfaceY = 135;

  // Underwater Ocean Gradient
  const oceanGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0284c7'); // Bright ocean cyan
  oceanGrad.addColorStop(0.4, '#0369a1');
  oceanGrad.addColorStop(1, '#0c4a6e'); // Deep abyss blue
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, waterSurfaceY, canvas.width, canvas.height - waterSurfaceY);

  // Underwater Sun Light Caustics Rays
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 5; i++) {
    const rayX = 150 + i * 160 + Math.sin(animationTime + i) * 20;
    ctx.beginPath();
    ctx.moveTo(rayX, waterSurfaceY);
    ctx.lineTo(rayX + 60, canvas.height);
    ctx.lineTo(rayX - 30, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  // Floating Air Bubbles
  bubbles.forEach(b => {
    b.y -= b.speed;
    b.x += Math.sin(animationTime * 2 + b.wobble) * 0.4;
    if (b.y < waterSurfaceY) {
      b.y = canvas.height + 10;
      b.x = Math.random() * canvas.width;
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Swaying Seaweed/Kelp Bed
  seaweedClumps.forEach(s => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x, canvas.height);
    
    const tipX = s.x + Math.sin(animationTime * 1.5 + s.phase) * 25;
    const midX = s.x + Math.sin(animationTime * 1.5 + s.phase) * 12;
    ctx.quadraticCurveTo(midX, canvas.height - s.height / 2, tipX, canvas.height - s.height);
    ctx.stroke();
  });

  // Water Surface Animated Waves
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(0, waterSurfaceY);
  for (let x = 0; x <= canvas.width; x += 20) {
    const y = waterSurfaceY + Math.sin(x * 0.03 + animationTime * 3) * 3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, waterSurfaceY + 12);
  ctx.lineTo(0, waterSurfaceY + 12);
  ctx.closePath();
  ctx.fill();
}

/**
 * Update & Render Swimming Fish
 */
function updateAndDrawFish() {
  swimmingFish.forEach((fish, idx) => {
    // Swim Movement
    fish.x += fish.dx;
    fish.swimPhase += 0.15;
    fish.y = fish.targetY + Math.sin(fish.swimPhase) * 6;

    // Wrap / Turn Around
    if (fish.dx > 0 && fish.x > canvas.width + 80) {
      swimmingFish[idx] = spawnRandomFish();
    } else if (fish.dx < 0 && fish.x < -80) {
      swimmingFish[idx] = spawnRandomFish();
    }

    // Render Fish Sprite
    drawFishEntity(fish);
  });
}

/**
 * Render Vector Fish Sprite with Tail Wiggle Animation
 */
function drawFishEntity(fish) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  
  // Flip if moving left
  if (fish.dx < 0) {
    ctx.scale(-1, 1);
  }

  const f = fish.type;
  const w = f.width;
  const h = f.height;
  const tailAngle = Math.sin(fish.swimPhase * 1.8) * 0.25;

  // Tail Fin
  ctx.fillStyle = f.accentColor;
  ctx.save();
  ctx.translate(-w / 2, 0);
  ctx.rotate(tailAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-14, -h / 2);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-14, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Fish Body
  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Special Body Patterns (Clownfish stripes, Puffer spikes, Rainbow glow)
  if (f.id === 'clownfish') {
    ctx.fillStyle = f.accentColor;
    ctx.fillRect(-w * 0.1, -h * 0.45, 6, h * 0.9);
    ctx.fillRect(w * 0.15, -h * 0.35, 5, h * 0.7);
  } else if (f.id === 'kraken') {
    // Rainbow Aura Glow
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Fish Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w / 3, -h / 5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(w / 3 + 1, -h / 5, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw Boat & Nibbles Mascot
 */
function drawBoatAndNibbles() {
  boat.bobOffset = Math.sin(animationTime * 2.2) * 3;
  boat.tilt = Math.sin(animationTime * 1.8) * 0.03;

  const bX = boat.x;
  const bY = boat.y + boat.bobOffset;

  ctx.save();
  ctx.translate(bX, bY);
  ctx.rotate(boat.tilt);

  // 1. Boat Hull
  ctx.fillStyle = '#b45309'; // Warm Wood
  ctx.beginPath();
  ctx.moveTo(-65, 0);
  ctx.lineTo(65, 0);
  ctx.lineTo(50, 30);
  ctx.lineTo(-50, 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.fillRect(-50, 3, 100, 4);

  // 2. Nibbles Cat Mascot Sitting in Boat
  // Cat Head
  ctx.fillStyle = '#f97316'; // Ginger Orange
  ctx.beginPath();
  ctx.arc(0, -22, 16, 0, Math.PI * 2);
  ctx.fill();

  // Cat Ears
  ctx.beginPath();
  ctx.moveTo(-12, -32);
  ctx.lineTo(-5, -42);
  ctx.lineTo(-2, -30);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(12, -32);
  ctx.lineTo(5, -42);
  ctx.lineTo(2, -30);
  ctx.fill();

  // Yellow Fisherman Bucket Hat 🎣
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-15, -36, 30, 8);
  ctx.fillRect(-10, -44, 20, 10);

  // Cat Eyes & Nose
  ctx.fillStyle = '#10b981'; // Emerald Eyes
  ctx.beginPath();
  ctx.arc(-5, -24, 3, 0, Math.PI * 2);
  ctx.arc(5, -24, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-5, -24, 1.5, 0, Math.PI * 2);
  ctx.arc(5, -24, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Fishing Rod held by Nibbles
  rodTip.x = bX + 65;
  rodTip.y = bY - 45;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, -15);
  ctx.lineTo(65, -45);
  ctx.stroke();

  ctx.restore();
}

/**
 * Update Line Cast Animation & Draw Fishing Line & Bobber
 */
function updateAndDrawFishingLine() {
  if (!bobber.active) return;

  // Arc physics during casting
  if (castArc.active) {
    castArc.progress += 0.05;
    if (castArc.progress >= 1.0) {
      castArc.progress = 1.0;
      castArc.active = false;
      onBobberLanded();
    }

    const tProgress = castArc.progress;
    bobber.x = castArc.startX + (castArc.endX - castArc.startX) * tProgress;
    const arcHeight = -60 * Math.sin(tProgress * Math.PI);
    bobber.y = castArc.startY + (castArc.endY - castArc.startY) * tProgress + arcHeight;
  } else {
    // Floating Bobber on Water Surface
    bobber.y = 138 + Math.sin(animationTime * 3) * 2 + bobber.dipOffset;
    if (bobber.dipOffset > 0) bobber.dipOffset *= 0.9;
  }

  // Draw Curved Tension Fishing Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);

  const controlX = (rodTip.x + bobber.x) / 2;
  const controlY = Math.max(rodTip.y, bobber.y) + (gameState === 'REELING' ? -15 : 20);
  ctx.quadraticCurveTo(controlX, controlY, bobber.x, bobber.y);
  ctx.stroke();

  // Draw Bobber Float
  ctx.save();
  ctx.translate(bobber.x, bobber.y);

  // Red Top / White Bottom Bobber
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, -4, 6, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -4, 6, 0, Math.PI);
  ctx.fill();

  // Water Ripple Rings
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 + Math.sin(animationTime * 4) * 3, 5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Bite Reaction Countdown Window Timer
 */
function updateBiteTimer() {
  biteWindowTimer -= 0.03;
  if (biteWindowTimer <= 0) {
    handleFishEscape('Reaction Window Expired');
  }
}

/**
 * Draw Flashing "BITE!" Alert Badge & Reel Window Indicator
 */
function drawBiteAlertBanner() {
  ctx.save();
  ctx.translate(bobber.x, bobber.y - 45);

  const scale = 1.0 + Math.sin(animationTime * 12) * 0.15;
  ctx.scale(scale, scale);

  // Alert Box
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(-45, -20, 90, 32, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('❗️ BITE!', 0, 2);

  ctx.restore();
}

/**
 * Update Tension Reeling Mechanics
 */
function updateReelingPhysics() {
  // Tension Drifts downward automatically if player doesn't tap
  reelingTension = Math.max(0, reelingTension - 0.45);

  // Check if tension is within target green zone
  const inZone = reelingTension >= reelingTargetZone.start && reelingTension <= reelingTargetZone.end;
  if (inZone) {
    reelingProgress = Math.min(100, reelingProgress + 0.35);
  } else {
    reelingProgress = Math.max(0, reelingProgress - 0.15);
  }

  // Win or Line Snap Conditions
  if (reelingProgress >= 100) {
    completeSuccessfulCatch();
  } else if (reelingTension >= 98) {
    handleFishEscape('Line Snapped from High Tension');
  }
}

/**
 * Draw Interactive Reeling Meter Bar on Canvas
 */
function drawReelingMeterOverlay() {
  const barW = 340;
  const barH = 26;
  const barX = (canvas.width - barW) / 2;
  const barY = 30;

  ctx.save();

  // Background Container Card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barX - 15, barY - 15, barW + 30, 80, 12);
  ctx.fill();
  ctx.stroke();

  // Title Label
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`KEEP TENSION IN GREEN ZONE! CLICK / TAP REEL! ⚡`, canvas.width / 2, barY - 2);

  // 1. Tension Meter Track
  ctx.fillStyle = '#334155';
  ctx.fillRect(barX, barY, barW, barH);

  // Green Target Catch Zone
  const zoneX = barX + (reelingTargetZone.start / 100) * barW;
  const zoneW = ((reelingTargetZone.end - reelingTargetZone.start) / 100) * barW;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
  ctx.fillRect(zoneX, barY, zoneW, barH);

  // Tension Needle
  const needleX = barX + (reelingTension / 100) * barW;
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(needleX - 3, barY - 4, 6, barH + 8);

  // 2. Catch Progress Bar Below
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(barX, barY + barH + 6, barW, 8);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(barX, barY + barH + 6, (reelingProgress / 100) * barW, 8);

  ctx.restore();
}

/**
 * Update & Draw Splash/Sparkle Particles
 */
function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;

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

/**
 * Draw Catch Score Toast
 */
function drawCatchToast() {
  if (!catchToast) return;

  catchToast.y -= 0.8;
  catchToast.alpha -= 0.015;

  if (catchToast.alpha <= 0) {
    catchToast = null;
    return;
  }

  ctx.save();
  ctx.globalAlpha = catchToast.alpha;
  ctx.fillStyle = catchToast.color;
  ctx.shadowColor = catchToast.color;
  ctx.shadowBlur = 10;
  ctx.font = '900 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(catchToast.text, catchToast.x, catchToast.y);
  ctx.restore();
}

/**
 * Bind UI Buttons & Mouse/Keyboard Events
 */
function bindUIEvents() {
  const actionBtn = document.getElementById('fg-action-btn');
  const resetBtn = document.getElementById('fg-reset-btn');
  const modalPlayAgain = document.getElementById('fg-modal-play-again');

  if (actionBtn) {
    actionBtn.addEventListener('click', reelActionInput);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('fg-modal').classList.remove('open');
      startGameMatch();
    });
  }

  if (modalPlayAgain) {
    modalPlayAgain.addEventListener('click', () => {
      document.getElementById('fg-modal').classList.remove('open');
      startGameMatch();
    });
  }

  // Click on Canvas directly to Cast/Reel
  if (canvas) {
    canvas.addEventListener('click', (e) => {
      e.preventDefault();
      reelActionInput();
    });
  }

  // Keyboard Spacebar Listener
  if (!spaceListenerBound) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        const hash = window.location.hash.replace('#', '').trim();
        if (hash === 'cat-fishing-game') {
          e.preventDefault();
          reelActionInput();
        }
      }
    });
    spaceListenerBound = true;
  }
}

/**
 * Cleanup function on view navigation
 */
export function cleanupCatFishingGame() {
  if (timerInterval) clearInterval(timerInterval);
  if (biteTimeoutId) clearTimeout(biteTimeoutId);
  if (animFrameId) cancelAnimationFrame(animFrameId);
}
