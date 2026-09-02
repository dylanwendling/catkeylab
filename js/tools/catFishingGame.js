/* ==========================================================================
   CatKeyLab - Nibbles 2D Cartoon Fishing Game (Balanced Fun Mashing Engine)
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

// Canvas Context & Engine
let canvas = null;
let ctx = null;
let animFrameId = null;

// Game State Enum: 'IDLE', 'READY', 'CASTING', 'FISHING', 'STRIKING', 'BITING', 'REELING', 'CATCH', 'ESCAPE', 'GAMEOVER'
let gameState = 'IDLE';

// Match Timers & Statistics
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

// Input State
let keysPressed = {};
let listenersBound = false;

// Submerged Lure Physics
let lure = {
  x: 400,
  y: 240,
  speed: 3.5,
  active: false,
  wigglePhase: 0
};

// Single-Fish Attraction & Exactly 3 Strikes System
let activeAttractedFish = null; // Strictly ONLY ONE fish attracted at any time!
let strikeCount = 0; // Exactly 3 strikes for all fish
let biteReactionTimer = 0;

// Balanced Fun Button Mashing Reeling Mini-Game State
let reelingTension = 45; // Starts in green zone
let reelingProgress = 25; // 25% initial progress
let reelingTimer = 8.0; // 8-second generous countdown per reel attempt
let lureStartY = 240;
let reelingTargetZone = { start: 20, end: 80 }; // Wide, forgiving green catch zone

// Boat & Mascot Visual Position
let boat = {
  x: 140,
  y: 118,
  bobOffset: 0,
  tilt: 0
};

let rodTip = {
  x: 200,
  y: 75
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

// Banners & Particle Systems
let catchToast = null;
let strikeBanner = null;
let particles = [];
let animationTime = 0;

// Fish Database Definitions
const FISH_TYPES = [
  {
    id: 'minnow',
    name: 'Silver Minnow',
    emoji: '🐟',
    points: 100,
    speed: 1.8,
    width: 32,
    height: 18,
    color: '#38bdf8',
    accentColor: '#e0f2fe',
    rarity: 0.40,
    difficulty: 1.0
  },
  {
    id: 'clownfish',
    name: 'Orange Clownfish',
    emoji: '🐠',
    points: 250,
    speed: 1.5,
    width: 38,
    height: 24,
    color: '#f97316',
    accentColor: '#ffffff',
    rarity: 0.30,
    difficulty: 1.3
  },
  {
    id: 'pufferfish',
    name: 'Spiky Pufferfish',
    emoji: '🐡',
    points: 400,
    speed: 1.2,
    width: 44,
    height: 32,
    color: '#eab308',
    accentColor: '#78350f',
    rarity: 0.17,
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
    color: '#fbbf24',
    accentColor: '#d97706',
    rarity: 0.08,
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
    color: '#ec4899',
    accentColor: '#a855f7',
    rarity: 0.03,
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
    difficulty: 0.8
  }
];

let swimmingFish = [];
let clouds = [];
let seaweedClumps = [];
let bubbles = [];

/**
 * Main Render Entry Point
 */
export function renderCatFishingGame(container) {
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
        <p class="section-subtitle" style="margin-bottom:1rem;">
          Control your lure underwater with <strong>Arrow Keys / D-Pad</strong>, tease fish with <strong>3 strikes ⚡</strong>, and <strong>MASH REEL / SPACEBAR</strong> to catch!
        </p>

        <!-- Live Dashboard Stats -->
        <div class="stats-dashboard" style="max-width:760px; margin:0 auto 1.25rem auto; display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
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
        <div style="position:relative; width:100%; max-width:850px; margin:0 auto 1rem auto; border-radius:var(--radius-lg); overflow:hidden; border:2px solid var(--border-color); box-shadow:0 12px 32px rgba(0,0,0,0.3); background:#0284c7;">
          <canvas id="fishing-canvas" width="850" height="460" style="display:block; width:100%; height:auto; cursor:pointer; touch-action:none;"></canvas>
        </div>

        <!-- Touch D-Pad & Control Bar -->
        <div style="display:flex; justify-content:center; align-items:center; gap:1.5rem; flex-wrap:wrap; background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-lg); margin-bottom:1rem;">
          
          <!-- On-Screen Directional D-Pad -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.35rem;">
            <button id="fg-dpad-up" class="btn btn-secondary" style="width:50px; height:44px; font-size:1.2rem; font-weight:800;" title="Move Up ⬆️">⬆️</button>
            <div style="display:flex; gap:0.35rem;">
              <button id="fg-dpad-left" class="btn btn-secondary" style="width:50px; height:44px; font-size:1.2rem; font-weight:800;" title="Move Left ⬅️">⬅️</button>
              <button id="fg-dpad-down" class="btn btn-secondary" style="width:50px; height:44px; font-size:1.2rem; font-weight:800;" title="Sink Down ⬇️">⬇️</button>
              <button id="fg-dpad-right" class="btn btn-secondary" style="width:50px; height:44px; font-size:1.2rem; font-weight:800;" title="Move Right ➡️">➡️</button>
            </div>
          </div>

          <!-- Main Action / Mash Reel Button -->
          <div style="display:flex; flex-direction:column; gap:0.6rem; min-width:240px; flex:1; max-width:320px;">
            <button id="fg-action-btn" class="btn btn-primary btn-lg" style="width:100%; font-size:1.2rem; font-weight:800; padding:0.85rem 1.25rem;">
              🎣 CAST LURE INTO WATER
            </button>
            <button id="fg-reset-btn" class="btn btn-secondary btn-sm" style="width:100%;">
              🔄 New Game
            </button>
          </div>
        </div>

        <!-- Keyboard Controls Guide -->
        <p style="font-size:0.85rem; color:var(--text-muted);">
          💡 <strong>Controls:</strong> Use <kbd style="background:var(--bg-tertiary); padding:0.15rem 0.4rem; border-radius:4px;">Arrow Keys</kbd> / <kbd style="background:var(--bg-tertiary); padding:0.15rem 0.4rem; border-radius:4px;">WASD</kbd> to steer lure. Mash <kbd style="background:var(--bg-tertiary); padding:0.15rem 0.4rem; border-radius:4px;">Spacebar</kbd> repeatedly to keep tension in the green catch zone!
        </p>

      </div>
    </div>

    <!-- Results Modal -->
    <div id="fg-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center; max-width:500px; padding:2rem;">
        <div style="font-size:3rem; margin-bottom:0.5rem;" id="fg-modal-icon">🏆</div>
        <h2 style="font-size:1.9rem; font-weight:800; margin-bottom:0.25rem;">Time's Up! Great Haul!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1.25rem;">Nibbles purrs happily and thanks you for today's catch!</p>

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

        <div id="fg-modal-breakdown" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1rem; margin-bottom:1.5rem; text-align:left; font-size:0.9rem; line-height:1.7;">
        </div>

        <div id="fg-modal-highscore-banner" style="display:none; background:linear-gradient(90deg, #f59e0b, #ec4899); color:#fff; font-weight:800; padding:0.5rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:1rem;">
          🎉 NEW PERSONAL HIGH SCORE! 👑
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="fg-modal-play-again" class="btn btn-primary btn-lg" style="flex:1; min-width:140px; font-weight:800;">Play Again 🔄</button>
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
  canvas = document.getElementById('fishing-canvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

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

  initSwimmingFish(7);

  gameState = 'IDLE';
  gameTimeLeft = 60.0;
  currentScore = 0;
  totalFishCaught = 0;
  catchesBreakdown = { minnow: 0, clownfish: 0, pufferfish: 0, koi: 0, kraken: 0, boot: 0 };
  lure.active = false;
  activeAttractedFish = null;
  strikeCount = 0;

  updateHUD();
  updateActionButton();

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animationTime = 0;
  gameLoop();
}

/**
 * Initialize Swimming Fish Entities
 */
function initSwimmingFish(count = 7) {
  swimmingFish = [];
  for (let i = 0; i < count; i++) {
    swimmingFish.push(spawnRandomFish());
  }
}

function spawnRandomFish() {
  const rand = Math.random();
  let typeObj = null;
  let cum = 0;

  for (const f of FISH_TYPES) {
    cum += f.rarity;
    if (rand <= cum) {
      typeObj = f;
      break;
    }
  }
  if (!typeObj) typeObj = FISH_TYPES[0];

  const direction = Math.random() > 0.5 ? 1 : -1;
  const startX = direction === 1 ? -60 - Math.random() * 100 : canvas.width + 60 + Math.random() * 100;
  const startY = 180 + Math.random() * 220;

  return {
    type: typeObj,
    x: startX,
    y: startY,
    targetY: startY,
    dx: direction * (typeObj.speed * (0.85 + Math.random() * 0.3)),
    dy: 0,
    facing: direction,
    swimPhase: Math.random() * Math.PI * 2,
    isAttracted: false,
    isHooked: false,
    strikeCooldown: 0
  };
}

/**
 * Start Match
 */
function startGameMatch() {
  if (timerInterval) clearInterval(timerInterval);

  gameState = 'READY';
  gameTimeLeft = 60.0;
  currentScore = 0;
  totalFishCaught = 0;
  catchesBreakdown = { minnow: 0, clownfish: 0, pufferfish: 0, koi: 0, kraken: 0, boot: 0 };
  lure.active = false;
  activeAttractedFish = null;
  strikeCount = 0;

  updateHUD();
  updateActionButton();

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
 * Cast Lure
 */
function castLure() {
  if (gameState !== 'READY') return;

  gameState = 'CASTING';

  castArc.active = true;
  castArc.progress = 0;
  castArc.startX = rodTip.x;
  castArc.startY = rodTip.y;
  castArc.endX = 400;
  castArc.endY = 220;

  lure.x = rodTip.x;
  lure.y = rodTip.y;
  lure.active = true;

  playClickSound(500, 0.08);
  updateActionButton();
}

/**
 * Lure Lands in Ocean
 */
function onLureLanded() {
  gameState = 'FISHING';
  lure.x = castArc.endX;
  lure.y = castArc.endY;

  createSplashParticles(lure.x, lure.y);
  playSplashSound();

  activeAttractedFish = null;
  strikeCount = 0;

  updateActionButton();
}

/**
 * Trigger Tease Strike Event (Exactly 3 Strikes for ALL fish)
 */
function triggerStrikeEvent(fishEntity) {
  gameState = 'STRIKING';
  activeAttractedFish = fishEntity;
  strikeCount++;

  playClickSound(900, 0.06);
  createSplashParticles(lure.x, lure.y);

  if (strikeCount < 3) {
    // Tease Strikes #1 and #2
    strikeBanner = {
      text: `⚡ STRIKE #${strikeCount}!`,
      x: lure.x,
      y: lure.y - 30,
      alpha: 1.0,
      color: '#f59e0b'
    };

    // Fish backs off 45px smoothly
    fishEntity.x += (fishEntity.facing === 1 ? -45 : 45);
    fishEntity.strikeCooldown = 45; // 0.75s cooldown
    fishEntity.isAttracted = false;

    setTimeout(() => {
      if (gameState === 'STRIKING') {
        gameState = 'FISHING';
        fishEntity.isAttracted = true;
        updateActionButton();
      }
    }, 650);
  } else {
    // Strike #3 -> FULL BITE / HOOKED!
    triggerFullBiteEvent(fishEntity);
  }
}

/**
 * Full Bite Event
 */
function triggerFullBiteEvent(fishEntity) {
  gameState = 'BITING';
  biteReactionTimer = 1.6;
  activeAttractedFish = fishEntity;
  fishEntity.isHooked = true; // Lock hooked state immediately so fish NEVER jitters!

  playBiteAlertSound();

  strikeBanner = {
    text: `❗️ BITE! HOOKED!`,
    x: lure.x,
    y: lure.y - 40,
    alpha: 1.0,
    color: '#ef4444'
  };

  updateActionButton();
}

/**
 * Start Generous, Wide-Zone Reeling Mini-Game!
 */
function startReelingMiniGame() {
  if (gameState !== 'BITING' && gameState !== 'FISHING' && gameState !== 'STRIKING') return;

  gameState = 'REELING';

  reelingTension = 45; // Starts inside wide green zone
  reelingProgress = 25; // 25% initial progress
  reelingTimer = 8.0; // 8 seconds generous timer
  lureStartY = lure.y;

  const diff = activeAttractedFish ? activeAttractedFish.type.difficulty : 1.0;
  // Wide, generous green catch zone (from 40% to 65% width depending on fish)
  const zoneWidth = Math.max(38, 70 - diff * 12);
  const zoneStart = 15 + Math.random() * (75 - zoneWidth);
  reelingTargetZone = { start: zoneStart, end: zoneStart + zoneWidth };

  if (activeAttractedFish) {
    activeAttractedFish.isHooked = true;
  }

  playReelSound();
  updateActionButton();
}

/**
 * Main Action Router
 */
function handleMainAction() {
  if (gameState === 'IDLE' || gameState === 'GAMEOVER') {
    startGameMatch();
  } else if (gameState === 'READY') {
    castLure();
  } else if (gameState === 'BITING') {
    startReelingMiniGame();
  } else if (gameState === 'REELING') {
    // Smooth Button Mash Tap Boost!
    reelingTension = Math.min(100, reelingTension + 9);
    playReelSound();
  }
}

/**
 * Complete Catch when Reeling Progress reaches 100%
 */
function completeCatch() {
  gameState = 'CATCH';
  const fishType = activeAttractedFish ? activeAttractedFish.type : FISH_TYPES[0];

  currentScore += fishType.points;
  totalFishCaught++;
  catchesBreakdown[fishType.id] = (catchesBreakdown[fishType.id] || 0) + 1;

  if (currentScore > personalHighScore) {
    personalHighScore = currentScore;
    try {
      localStorage.setItem('catkeylab_fishing_highscore', personalHighScore.toString());
    } catch (e) {}
  }

  catchToast = {
    text: `CAUGHT ${fishType.name.toUpperCase()}! +${fishType.points} PTS ${fishType.emoji}`,
    x: lure.x,
    y: lure.y - 40,
    alpha: 1.0,
    color: fishType.color
  };

  createCatchSparkleParticles(lure.x, lure.y);
  playSuccessSound();

  if (activeAttractedFish) {
    activeAttractedFish.isHooked = false;
    activeAttractedFish.isAttracted = false;
    const idx = swimmingFish.indexOf(activeAttractedFish);
    if (idx !== -1) swimmingFish[idx] = spawnRandomFish();
    activeAttractedFish = null;
  }

  strikeCount = 0;

  updateHUD();

  setTimeout(() => {
    if (gameState === 'CATCH' && gameTimeLeft > 0) {
      lure.active = false;
      gameState = 'READY';
      updateActionButton();
    }
  }, 1200);
}

/**
 * Handle Escape
 */
function handleEscape(reason = 'Line Snapped') {
  gameState = 'ESCAPE';
  
  createSplashParticles(lure.x, lure.y);
  playEscapeSound();

  catchToast = {
    text: `FISH ESCAPED! 💨`,
    x: lure.x,
    y: lure.y - 30,
    alpha: 1.0,
    color: '#ef4444'
  };

  if (activeAttractedFish) {
    activeAttractedFish.isHooked = false;
    activeAttractedFish.isAttracted = false;
    activeAttractedFish = null;
  }

  strikeCount = 0;

  setTimeout(() => {
    if (gameState === 'ESCAPE' && gameTimeLeft > 0) {
      lure.active = false;
      gameState = 'READY';
      updateActionButton();
    }
  }, 1000);
}

/**
 * Trigger Game Over Modal
 */
function triggerGameOver() {
  if (timerInterval) clearInterval(timerInterval);

  gameState = 'GAMEOVER';
  lure.active = false;
  if (activeAttractedFish) {
    activeAttractedFish.isHooked = false;
    activeAttractedFish.isAttracted = false;
    activeAttractedFish = null;
  }

  updateHUD();
  updateActionButton();

  if (currentScore > 0) {
    submitScore('cat-fishing-game', currentScore, `${currentScore} pts (${totalFishCaught} fish)`);
  }

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
 * Update Stats HUD
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
 * Update Action Button Styles & Labels
 */
function updateActionButton() {
  const btn = document.getElementById('fg-action-btn');
  if (!btn) return;

  btn.className = 'btn btn-lg';

  if (gameState === 'IDLE') {
    btn.innerHTML = '🎣 START FISHING GAME';
    btn.classList.add('btn-primary');
  } else if (gameState === 'READY') {
    btn.innerHTML = '🎣 CAST LURE INTO WATER';
    btn.classList.add('btn-primary');
  } else if (gameState === 'CASTING') {
    btn.innerHTML = '⏳ Casting Line...';
    btn.classList.add('btn-secondary');
  } else if (gameState === 'FISHING') {
    btn.innerHTML = '🌊 MOVE LURE (ARROW KEYS / D-PAD)';
    btn.classList.add('btn-secondary');
  } else if (gameState === 'STRIKING') {
    btn.innerHTML = '⚡ FISH STRIKING LURE!';
    btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    btn.style.color = '#fff';
  } else if (gameState === 'BITING') {
    btn.innerHTML = '⚡ REEL NOW! HOOKED! ❗️';
    btn.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
    btn.style.color = '#ffffff';
    btn.style.boxShadow = '0 0 25px rgba(239,68,68,0.8)';
  } else if (gameState === 'REELING') {
    btn.innerHTML = '⚡ MASH REEL / SPACEBAR! 🎣';
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
 * Main 60FPS Game Loop
 */
function gameLoop() {
  animationTime += 0.03;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSky();
  drawOcean();

  if (gameState === 'FISHING') {
    updateLureControls();
  }

  updateFishEntities();
  drawBoat();
  drawFishingLineAndLure();

  if (gameState === 'REELING') {
    updateReelingButtonMashingPhysics();
    drawReelingButtonMashingOverlay();
  }

  updateAndDrawParticles();
  drawToastBanners();

  animFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Render Sky
 */
function drawSky() {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 140);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.7, '#7dd3fc');
  skyGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, 140);

  ctx.save();
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(720, 45, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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
 * Render Ocean
 */
function drawOcean() {
  const waterSurfaceY = 135;

  const oceanGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, canvas.height);
  oceanGrad.addColorStop(0, '#0284c7');
  oceanGrad.addColorStop(0.4, '#0369a1');
  oceanGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, waterSurfaceY, canvas.width, canvas.height - waterSurfaceY);

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
 * Update Submerged Lure Controls
 */
function updateLureControls() {
  if (gameState === 'FISHING') {
    let dx = 0;
    let dy = 0;

    if (keysPressed['ArrowUp'] || keysPressed['KeyW']) dy -= 1;
    if (keysPressed['ArrowDown'] || keysPressed['KeyS']) dy += 1;
    if (keysPressed['ArrowLeft'] || keysPressed['KeyA']) dx -= 1;
    if (keysPressed['ArrowRight'] || keysPressed['KeyD']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      lure.x += dx * lure.speed;
      lure.y += dy * lure.speed;
      lure.wigglePhase += 0.3;
    } else {
      lure.y += Math.sin(animationTime * 3) * 0.4;
    }

    lure.x = Math.max(100, Math.min(canvas.width - 50, lure.x));
    lure.y = Math.max(150, Math.min(canvas.height - 30, lure.y));
  }
}

/**
 * Update Swimming Fish & Single-Attraction Lock
 */
function updateFishEntities() {
  // Lock attraction to ONLY ONE single fish at a time
  if (!activeAttractedFish && gameState === 'FISHING' && lure.active) {
    let closestFish = null;
    let closestDist = 110;

    swimmingFish.forEach(fish => {
      if (fish.strikeCooldown <= 0 && !fish.isHooked) {
        const dist = Math.hypot(fish.x - lure.x, fish.y - lure.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestFish = fish;
        }
      }
    });

    if (closestFish) {
      activeAttractedFish = closestFish;
      closestFish.isAttracted = true;
    }
  }

  swimmingFish.forEach((fish, idx) => {
    if (fish.strikeCooldown > 0) {
      fish.strikeCooldown--;
    }

    // If fish is hooked (during BITING or REELING state), lock position cleanly to lure with ZERO jitter!
    if (fish.isHooked && (gameState === 'BITING' || gameState === 'REELING' || gameState === 'STRIKING')) {
      fish.x = lure.x;
      fish.y = lure.y + 14;
      drawFishEntity(fish);
      return;
    }

    if (!fish.isAttracted) {
      // Normal Peaceful Swim AI
      fish.x += fish.dx;
      fish.swimPhase += 0.15;
      fish.y = fish.targetY + Math.sin(fish.swimPhase) * 6;
      fish.facing = fish.dx >= 0 ? 1 : -1;

      if (fish.dx > 0 && fish.x > canvas.width + 80) swimmingFish[idx] = spawnRandomFish();
      else if (fish.dx < 0 && fish.x < -80) swimmingFish[idx] = spawnRandomFish();
    } else {
      // ONLY the active attracted fish stalks the lure!
      const angle = Math.atan2(lure.y - fish.y, lure.x - fish.x);
      fish.x += Math.cos(angle) * (fish.type.speed * 1.4);
      fish.y += Math.sin(angle) * (fish.type.speed * 1.4);

      if (lure.x > fish.x + 8) fish.facing = 1;
      else if (lure.x < fish.x - 8) fish.facing = -1;

      const dist = Math.hypot(fish.x - lure.x, fish.y - lure.y);

      // Strike Trigger
      if (dist < 24 && gameState === 'FISHING') {
        triggerStrikeEvent(fish);
      }
    }

    drawFishEntity(fish);
  });
}

/**
 * Draw Vector Fish Entity (Zero Jitter When Hooked)
 */
function drawFishEntity(fish) {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  
  if (fish.isHooked) {
    // Lock orientation -90 deg pointing UP towards hook with smooth struggle wiggle (ZERO jitter!)
    ctx.rotate(-Math.PI / 2 + Math.sin(animationTime * 8) * 0.12);
  } else if (fish.facing === -1) {
    ctx.scale(-1, 1);
  }

  const f = fish.type;
  const w = f.width;
  const h = f.height;
  const tailAngle = Math.sin(fish.swimPhase * 1.8) * 0.25;

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

  ctx.fillStyle = f.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (f.id === 'clownfish') {
    ctx.fillStyle = f.accentColor;
    ctx.fillRect(-w * 0.1, -h * 0.45, 6, h * 0.9);
    ctx.fillRect(w * 0.15, -h * 0.35, 5, h * 0.7);
  } else if (f.id === 'kraken') {
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

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
 * Draw Boat & Nibbles
 */
function drawBoat() {
  boat.bobOffset = Math.sin(animationTime * 2.2) * 3;
  boat.tilt = Math.sin(animationTime * 1.8) * 0.03;

  const bX = boat.x;
  const bY = boat.y + boat.bobOffset;

  ctx.save();
  ctx.translate(bX, bY);
  ctx.rotate(boat.tilt);

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-65, 0);
  ctx.lineTo(65, 0);
  ctx.lineTo(50, 30);
  ctx.lineTo(-50, 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.fillRect(-50, 3, 100, 4);

  // Nibbles Cat
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(0, -22, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ears
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

  // Yellow Fisherman Hat
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-15, -36, 30, 8);
  ctx.fillRect(-10, -44, 20, 10);

  // Eyes
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(-5, -24, 3, 0, Math.PI * 2);
  ctx.arc(5, -24, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-5, -24, 1.5, 0, Math.PI * 2);
  ctx.arc(5, -24, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Fishing Rod
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
 * Draw Fishing Line & Lure
 */
function drawFishingLineAndLure() {
  if (!lure.active) return;

  if (castArc.active) {
    castArc.progress += 0.05;
    if (castArc.progress >= 1.0) {
      castArc.progress = 1.0;
      castArc.active = false;
      onLureLanded();
    }
    const tP = castArc.progress;
    lure.x = castArc.startX + (castArc.endX - castArc.startX) * tP;
    const height = -60 * Math.sin(tP * Math.PI);
    lure.y = castArc.startY + (castArc.endY - castArc.startY) * tP + height;
  }

  // Curved Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(rodTip.x, rodTip.y);
  const midX = (rodTip.x + lure.x) / 2;
  const midY = (rodTip.y + lure.y) / 2 + (gameState === 'REELING' ? -15 : 20);
  ctx.quadraticCurveTo(midX, midY, lure.x, lure.y);
  ctx.stroke();

  // Submerged Lure
  ctx.save();
  ctx.translate(lure.x, lure.y);
  ctx.rotate(Math.sin(lure.wigglePhase) * 0.4);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-4, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(6, 3, 4, 0, Math.PI);
  ctx.stroke();

  ctx.restore();
}

/**
 * Balanced, Forgiving Button Mashing Reeling Physics
 */
function updateReelingButtonMashingPhysics() {
  const diff = activeAttractedFish ? activeAttractedFish.type.difficulty : 1.0;

  // 1. Gentle Thrashing Pull (Very forgiving needle drift)
  const pullDecay = 0.28 + diff * 0.12;
  reelingTension = Math.max(0, reelingTension - pullDecay);

  // 2. Generous Countdown timer (8.0s)
  reelingTimer -= 0.016;

  // 3. Check if needle is inside Wide Green Catch Zone
  const inZone = reelingTension >= reelingTargetZone.start && reelingTension <= reelingTargetZone.end;
  if (inZone) {
    reelingProgress = Math.min(100, reelingProgress + 1.25); // Fast, rewarding progress fill!
  } else {
    reelingProgress = Math.max(0, reelingProgress - 0.15); // Very mild decay outside zone!
  }

  // 4. Update fish position vertically based on reelingProgress (0% = start pos, 100% = boat surface at y=140)
  lure.y = lureStartY - (reelingProgress / 100) * (lureStartY - 140);

  // 5. Win / Loss Conditions
  if (reelingProgress >= 100) {
    completeCatch();
  } else if (reelingTension >= 99) {
    handleEscape('Line Snapped from Over-Mashing!');
  } else if (reelingTimer <= 0) {
    handleEscape('Fish Slipped Hook!');
  }
}

/**
 * Draw Interactive Button Mashing Reeling Sweet-Spot Overlay
 */
function drawReelingButtonMashingOverlay() {
  const barW = 340;
  const barH = 26;
  const barX = (canvas.width - barW) / 2;
  const barY = 25;

  ctx.save();

  // Outer Card Overlay
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(barX - 15, barY - 15, barW + 30, 85, 12);
  ctx.fill();
  ctx.stroke();

  // Header Instructions & Timer
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⚡ MASH REEL / SPACEBAR! TIME: ${Math.max(0, reelingTimer).toFixed(1)}s ⚡`, canvas.width / 2, barY - 2);

  // 1. Tension Track
  ctx.fillStyle = '#334155';
  ctx.fillRect(barX, barY, barW, barH);

  // Green Catch Zone
  const zoneX = barX + (reelingTargetZone.start / 100) * barW;
  const zoneW = ((reelingTargetZone.end - reelingTargetZone.start) / 100) * barW;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
  ctx.fillRect(zoneX, barY, zoneW, barH);

  // Needle Position
  const needleX = barX + (reelingTension / 100) * barW;
  ctx.fillStyle = reelingTension > 90 ? '#ef4444' : '#fbbf24';
  ctx.fillRect(needleX - 3, barY - 4, 6, barH + 8);

  // 2. Catch Progress Bar Below
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(barX, barY + barH + 6, barW, 8);

  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(barX, barY + barH + 6, (reelingProgress / 100) * barW, 8);

  ctx.restore();
}

/**
 * Particles
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

function createSplashParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 3,
      alpha: 1.0,
      color: '#e0f2fe'
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
      color: ['#fbbf24', '#38bdf8', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]
    });
  }
}

/**
 * Toast Banners
 */
function drawToastBanners() {
  if (strikeBanner) {
    strikeBanner.y -= 0.5;
    strikeBanner.alpha -= 0.02;
    if (strikeBanner.alpha <= 0) {
      strikeBanner = null;
    } else {
      ctx.save();
      ctx.globalAlpha = strikeBanner.alpha;
      ctx.fillStyle = strikeBanner.color;
      ctx.shadowColor = strikeBanner.color;
      ctx.shadowBlur = 12;
      ctx.font = '900 17px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(strikeBanner.text, strikeBanner.x, strikeBanner.y);
      ctx.restore();
    }
  }

  if (catchToast) {
    catchToast.y -= 0.8;
    catchToast.alpha -= 0.015;
    if (catchToast.alpha <= 0) {
      catchToast = null;
    } else {
      ctx.save();
      ctx.globalAlpha = catchToast.alpha;
      ctx.fillStyle = catchToast.color;
      ctx.shadowColor = catchToast.color;
      ctx.shadowBlur = 12;
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(catchToast.text, catchToast.x, catchToast.y);
      ctx.restore();
    }
  }
}

/**
 * Bind Input Listeners
 */
function bindInputEvents() {
  const actionBtn = document.getElementById('fg-action-btn');
  const resetBtn = document.getElementById('fg-reset-btn');
  const modalPlayAgain = document.getElementById('fg-modal-play-again');

  if (actionBtn) {
    actionBtn.addEventListener('pointerdown', () => {
      isReelInputActive = true;
      handleMainAction();
    });
    actionBtn.addEventListener('pointerup', () => { isReelInputActive = false; });
    actionBtn.addEventListener('pointerleave', () => { isReelInputActive = false; });
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

  // D-Pad Touch Listeners
  const btnUp = document.getElementById('fg-dpad-up');
  const btnDown = document.getElementById('fg-dpad-down');
  const btnLeft = document.getElementById('fg-dpad-left');
  const btnRight = document.getElementById('fg-dpad-right');

  const bindDpad = (el, keyName) => {
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      keysPressed[keyName] = true;
      if (keyName === 'ArrowUp') isReelInputActive = true;
      handleMainAction();
    });
    el.addEventListener('pointerup', () => {
      keysPressed[keyName] = false;
      if (keyName === 'ArrowUp') isReelInputActive = false;
    });
    el.addEventListener('pointerleave', () => {
      keysPressed[keyName] = false;
      if (keyName === 'ArrowUp') isReelInputActive = false;
    });
  };

  bindDpad(btnUp, 'ArrowUp');
  bindDpad(btnDown, 'ArrowDown');
  bindDpad(btnLeft, 'ArrowLeft');
  bindDpad(btnRight, 'ArrowRight');

  // Mouse / Touch Drag on Canvas
  if (canvas) {
    let isDragging = false;

    const moveLureToEvent = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      if (gameState === 'FISHING' && lure.active) {
        lure.x = Math.max(100, Math.min(canvas.width - 50, mouseX));
        lure.y = Math.max(150, Math.min(canvas.height - 30, mouseY));
        lure.wigglePhase += 0.4;
      }
    };

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      moveLureToEvent(e);
      if (gameState === 'READY' || gameState === 'BITING' || gameState === 'IDLE' || gameState === 'REELING') {
        handleMainAction();
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (isDragging) moveLureToEvent(e);
    });

    canvas.addEventListener('pointerup', () => { isDragging = false; });
  }

  // Keyboard Event Listeners
  if (!listenersBound) {
    window.addEventListener('keydown', (e) => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash !== 'cat-fishing-game') return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
        keysPressed[e.code] = true;

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          handleMainAction();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      keysPressed[e.code] = false;
    });

    listenersBound = true;
  }
}

/**
 * Cleanup
 */
export function cleanupCatFishingGame() {
  if (timerInterval) clearInterval(timerInterval);
  if (animFrameId) cancelAnimationFrame(animFrameId);
}
