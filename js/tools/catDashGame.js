/* ==========================================================================
   CatKeyLab - Cat Dash 🐾 Side-Scrolling Endless Runner Arcade Game
   ========================================================================== */

import { t } from '../i18n.js';
import { submitScore } from '../leaderboard.js';

// Game Configuration & Virtual Resolution
const V_WIDTH = 960;
const V_HEIGHT = 540;
const GROUND_Y = 430;
const CAT_X = 140;

// Game State Enum
const STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  SHOP: 'SHOP',
  DAILY: 'DAILY',
  HOWTO: 'HOWTO'
};

// Skin Catalog
const SKINS = [
  { id: 'ginger', name: 'Ginger Tabby', icon: '🐱', cost: 0, bodyColor: '#f97316', stripeColor: '#c2410c', bellyColor: '#ffedd5', eyeColor: '#10b981' },
  { id: 'black', name: 'Midnight Cat', icon: '🐈‍⬛', cost: 100, bodyColor: '#1e293b', stripeColor: '#0f172a', bellyColor: '#334155', eyeColor: '#f59e0b' },
  { id: 'gray', name: 'Smoky Gray', icon: '🩶', cost: 250, bodyColor: '#64748b', stripeColor: '#475569', bellyColor: '#cbd5e1', eyeColor: '#38bdf8' },
  { id: 'calico', name: 'Calico Patch', icon: '🐾', cost: 450, bodyColor: '#f8fafc', stripeColor: '#ea580c', bellyColor: '#1e293b', eyeColor: '#10b981' },
  { id: 'white', name: 'Snow White', icon: '🤍', cost: 700, bodyColor: '#f8fafc', stripeColor: '#e2e8f0', bellyColor: '#ffffff', eyeColor: '#38bdf8' },
  { id: 'neon', name: 'Cyber Neon', icon: '⚡', cost: 1200, bodyColor: '#0f172a', stripeColor: '#06b6d4', bellyColor: '#ec4899', eyeColor: '#22d3ee' }
];

// Biomes based on run distance
const BIOMES = [
  { name: 'Sunny Neighborhood', startDist: 0, skyTop: '#38bdf8', skyBottom: '#bae6fd', groundColor: '#16a34a', groundGrass: '#22c55e', roadColor: '#78716c' },
  { name: 'Green Forest Trail', startDist: 500, skyTop: '#065f46', skyBottom: '#10b981', groundColor: '#14532d', groundGrass: '#15803d', roadColor: '#57534e' },
  { name: 'Sunset City Rooftops', startDist: 1200, skyTop: '#4c1d95', skyBottom: '#f97316', groundColor: '#1e1b4b', groundGrass: '#312e81', roadColor: '#334155' },
  { name: 'Moonlit Cat Kingdom', startDist: 2200, skyTop: '#090d16', skyBottom: '#1e1b4b', groundColor: '#030712', groundGrass: '#1e293b', roadColor: '#1e293b' }
];

// Core Runtime State
let canvas = null;
let ctx = null;
let animFrameId = null;
let lastTime = 0;
let currentState = STATES.MENU;
let isDailyMode = false;
let dailySeed = 1;

// Audio Context & Synthesizer
let audioCtx = null;
let isSoundEnabled = true;

// Player Cat Physics
let cat = {
  x: CAT_X,
  y: GROUND_Y - 48,
  width: 52,
  height: 48,
  vy: 0,
  gravity: 0.72,
  jumpStrength: -13.6,
  isGrounded: true,
  isSliding: false,
  slideTimer: 0,
  slideMaxDuration: 520, // ms
  runFrame: 0,
  animTimer: 0,
  hasShield: false,
  catnipTimer: 0, // ms
  squash: 1.0,
  stretch: 1.0
};

// Gameplay Metrics
let distance = 0;
let score = 0;
let fishCount = 0;
let coinCount = 0;
let scrollSpeed = 5.2;
let maxScrollSpeed = 10.5;
let combo = 1;
let comboTimer = 0;

// World & Object Collections
let obstacles = [];
let collectibles = [];
let particles = [];
let bgScenery = [];
let patternCooldown = 0;

// Mobile Touch & Pointer Tracking
let touchStartY = 0;
let touchStartX = 0;
let isTouchDown = false;
let showTouchButtons = true;

// Persistence Data Structure
let gameSave = {
  highScore: 0,
  maxDistance: 0,
  totalFish: 0,
  coins: 0,
  unlockedSkins: ['ginger'],
  equippedSkin: 'ginger',
  sound: true,
  touchButtons: true,
  dailyRecords: {} // Keyed by YYYY-MM-DD: { completed: bool, bestDist: number }
};

/* ==========================================================================
   Sound Synthesis (Web Audio API)
   ========================================================================== */
function initAudio() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq1, freq2, duration, type = 'sine', gainVal = 0.15) {
  if (!isSoundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(freq1, now);
    if (freq2) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq2), now + duration);
    }

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (_) {}
}

function playSound(type) {
  if (!isSoundEnabled) return;
  initAudio();
  switch (type) {
    case 'jump':
      playTone(280, 680, 0.14, 'triangle', 0.2);
      break;
    case 'slide':
      playTone(320, 140, 0.2, 'sawtooth', 0.08);
      break;
    case 'fish':
      playTone(880, 1320, 0.12, 'sine', 0.18);
      break;
    case 'coin':
      playTone(987, 1480, 0.15, 'triangle', 0.18);
      break;
    case 'powerup':
      playTone(440, 880, 0.3, 'sine', 0.22);
      break;
    case 'hit':
      playTone(150, 40, 0.25, 'sawtooth', 0.25);
      break;
    case 'shield_break':
      playTone(600, 200, 0.3, 'square', 0.15);
      break;
    case 'click':
      playTone(600, 300, 0.04, 'sine', 0.1);
      break;
  }
}

/* ==========================================================================
   Persistence & LocalStorage
   ========================================================================== */
function loadSaveData() {
  try {
    const saved = localStorage.getItem('catkeylab_cat_dash_save');
    if (saved) {
      const parsed = JSON.parse(saved);
      gameSave = { ...gameSave, ...parsed };
      isSoundEnabled = gameSave.sound !== false;
      showTouchButtons = gameSave.touchButtons !== false;
    }
  } catch (_) {}
}

function persistSaveData() {
  try {
    localStorage.setItem('catkeylab_cat_dash_save', JSON.stringify(gameSave));
  } catch (_) {}
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ==========================================================================
   Pseudo-Random Deterministic Generator for Daily Mode
   ========================================================================== */
function seededRandom() {
  if (!isDailyMode) return Math.random();
  dailySeed = (dailySeed * 9301 + 49297) % 233280;
  return dailySeed / 233280;
}

function initDailySeed() {
  const key = getTodayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  dailySeed = Math.abs(hash) + 1;
}

/* ==========================================================================
   Game Reset & Initialization
   ========================================================================== */
function resetRun(daily = false) {
  isDailyMode = daily;
  if (isDailyMode) {
    initDailySeed();
  }

  distance = 0;
  score = 0;
  fishCount = 0;
  coinCount = 0;
  scrollSpeed = 5.2;
  combo = 1;
  comboTimer = 0;

  cat.y = GROUND_Y - 48;
  cat.vy = 0;
  cat.isGrounded = true;
  cat.isSliding = false;
  cat.slideTimer = 0;
  cat.hasShield = false;
  cat.catnipTimer = 0;
  cat.squash = 1.0;
  cat.stretch = 1.0;

  obstacles = [];
  collectibles = [];
  particles = [];
  bgScenery = [];
  patternCooldown = 180; // Safe initial runway

  // Initialize initial background parallax elements
  for (let i = 0; i < 6; i++) {
    bgScenery.push({
      type: 'cloud',
      x: i * 180 + Math.random() * 80,
      y: 40 + Math.random() * 90,
      speed: 0.5,
      size: 40 + Math.random() * 40
    });
  }
  for (let i = 0; i < 5; i++) {
    bgScenery.push({
      type: 'fence',
      x: i * 220,
      y: GROUND_Y - 40,
      speed: 1.8
    });
  }
}

/* ==========================================================================
   Procedural Chunk & Pattern Spawning
   ========================================================================== */
function spawnPattern() {
  const rand = seededRandom();
  const currentBiome = getCurrentBiome();

  // Pattern A: Single Ground Box with parabolic fish arc
  if (rand < 0.28) {
    obstacles.push({
      type: 'box',
      name: 'Cardboard Box',
      x: V_WIDTH,
      y: GROUND_Y - 42,
      width: 44,
      height: 42,
      color: '#b45309'
    });
    for (let i = 0; i < 3; i++) {
      collectibles.push({
        type: 'fish',
        x: V_WIDTH - 20 + i * 36,
        y: GROUND_Y - 110 - Math.sin((i / 2) * Math.PI) * 35,
        collected: false
      });
    }
    patternCooldown = 280 + scrollSpeed * 22;
  }
  // Pattern B: Low Overhead Clothesline / Barrier (MUST SLIDE!)
  else if (rand < 0.52) {
    obstacles.push({
      type: 'overhead',
      name: 'Hanging Clothesline',
      x: V_WIDTH,
      y: GROUND_Y - 96,
      width: 80,
      height: 60,
      color: '#f43f5e'
    });
    // Coins underneath to reward sliding
    for (let i = 0; i < 3; i++) {
      collectibles.push({
        type: 'coin',
        x: V_WIDTH + 10 + i * 30,
        y: GROUND_Y - 22,
        collected: false
      });
    }
    patternCooldown = 320 + scrollSpeed * 24;
  }
  // Pattern C: Double Stacked Boxes or Wide Log
  else if (rand < 0.72) {
    obstacles.push({
      type: 'double_box',
      name: 'Double Box',
      x: V_WIDTH,
      y: GROUND_Y - 68,
      width: 46,
      height: 68,
      color: '#92400e'
    });
    collectibles.push({
      type: 'golden_fish',
      x: V_WIDTH + 14,
      y: GROUND_Y - 145,
      collected: false
    });
    patternCooldown = 340 + scrollSpeed * 26;
  }
  // Pattern D: Rolling Can / Yarn Ball hazard (Dynamic speed!)
  else if (rand < 0.88) {
    obstacles.push({
      type: 'rolling_can',
      name: 'Rolling Yarn',
      x: V_WIDTH,
      y: GROUND_Y - 32,
      width: 34,
      height: 32,
      vx: -2.0, // extra relative speed
      color: '#06b6d4',
      rotation: 0
    });
    patternCooldown = 300 + scrollSpeed * 22;
  }
  // Pattern E: Powerup Runway (Milk Shield or Catnip Leaf)
  else {
    const isCatnip = seededRandom() > 0.5;
    collectibles.push({
      type: isCatnip ? 'catnip' : 'shield',
      x: V_WIDTH,
      y: GROUND_Y - 80,
      collected: false
    });
    patternCooldown = 240 + scrollSpeed * 20;
  }
}

function getCurrentBiome() {
  for (let i = BIOMES.length - 1; i >= 0; i--) {
    if (distance >= BIOMES[i].startDist) {
      return BIOMES[i];
    }
  }
  return BIOMES[0];
}

/* ==========================================================================
   Player Actions (Jump & Slide)
   ========================================================================== */
function triggerJump() {
  if (currentState !== STATES.PLAYING) return;
  if (cat.isGrounded) {
    cat.vy = cat.jumpStrength;
    cat.isGrounded = false;
    cat.squash = 0.7;
    cat.stretch = 1.35;
    playSound('jump');

    // Spawn takeoff dust puffs
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: cat.x + 10 + Math.random() * 20,
        y: GROUND_Y - 2,
        vx: -1.5 - Math.random() * 2,
        vy: -Math.random() * 2,
        size: 4 + Math.random() * 4,
        color: '#e2e8f0',
        alpha: 0.8,
        life: 25
      });
    }
  }
}

function triggerSlide() {
  if (currentState !== STATES.PLAYING) return;
  if (cat.isGrounded && !cat.isSliding) {
    cat.isSliding = true;
    cat.slideTimer = cat.slideMaxDuration;
    playSound('slide');

    // Slide sparks / dust
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: cat.x + 5,
        y: GROUND_Y - 4,
        vx: -2.5 - Math.random() * 2,
        vy: -Math.random() * 1.5,
        size: 5 + Math.random() * 3,
        color: '#cbd5e1',
        alpha: 0.7,
        life: 20
      });
    }
  }
}

/* ==========================================================================
   Game Loop & Engine Updates
   ========================================================================== */
function update(dt) {
  if (currentState !== STATES.PLAYING) return;

  // Speed Progression (Smooth acceleration)
  scrollSpeed = Math.min(maxScrollSpeed, 5.2 + (distance / 450) * 0.45);
  distance += scrollSpeed * 0.05;
  score = Math.floor(distance * 10 + fishCount * 25 + coinCount * 50);

  // Combo timer
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) combo = 1;
  }

  // Update Catnip Powerup
  if (cat.catnipTimer > 0) {
    cat.catnipTimer -= dt;
    // Rainbow particle emission during Catnip rush
    particles.push({
      x: cat.x - 10,
      y: cat.y + 15 + Math.random() * 18,
      vx: -scrollSpeed * 0.8,
      vy: (Math.random() - 0.5) * 2,
      size: 6 + Math.random() * 4,
      color: `hsl(${Date.now() % 360}, 90%, 65%)`,
      alpha: 0.9,
      life: 22
    });
  }

  // Update Cat Physics
  cat.vy += cat.gravity;
  cat.y += cat.vy;

  // Ground Collision
  const groundTargetY = GROUND_Y - (cat.isSliding ? 24 : 48);
  if (cat.y >= groundTargetY) {
    if (!cat.isGrounded && cat.vy > 0) {
      cat.squash = 1.25;
      cat.stretch = 0.8;
      // Landing dust
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: cat.x + 10 + Math.random() * 20,
          y: GROUND_Y - 2,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 1.8,
          size: 4 + Math.random() * 3,
          color: '#cbd5e1',
          alpha: 0.6,
          life: 18
        });
      }
    }
    cat.y = groundTargetY;
    cat.vy = 0;
    cat.isGrounded = true;
  } else {
    cat.isGrounded = false;
  }

  // Squash/Stretch decay
  cat.squash += (1.0 - cat.squash) * 0.15;
  cat.stretch += (1.0 - cat.stretch) * 0.15;

  // Slide duration timer
  if (cat.isSliding) {
    cat.slideTimer -= dt;
    if (cat.slideTimer <= 0) {
      cat.isSliding = false;
      cat.y = GROUND_Y - 48;
    }
  }

  // Running Animation Frame
  cat.animTimer += dt;
  if (cat.animTimer > 85) {
    cat.animTimer = 0;
    cat.runFrame = (cat.runFrame + 1) % 4;
  }

  // Update Procedural Spawner
  patternCooldown -= scrollSpeed;
  if (patternCooldown <= 0) {
    spawnPattern();
  }

  // Update Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= scrollSpeed + (obs.vx || 0);
    if (obs.rotation !== undefined) obs.rotation += 0.08;

    // Hitbox check
    const catHitbox = {
      x: cat.x + 8,
      y: cat.y + 6,
      width: cat.width - 16,
      height: (cat.isSliding ? 20 : cat.height - 10)
    };

    const obsHitbox = {
      x: obs.x + obs.width * 0.1,
      y: obs.y + obs.height * 0.1,
      width: obs.width * 0.8,
      height: obs.height * 0.8
    };

    if (checkCollision(catHitbox, obsHitbox)) {
      if (cat.catnipTimer > 0) {
        // Invulnerable: smash obstacle
        obstacles.splice(i, 1);
        spawnDestructionSparks(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.color);
        playSound('hit');
        score += 100;
        continue;
      }

      if (cat.hasShield) {
        // Shield absorbs collision
        cat.hasShield = false;
        obstacles.splice(i, 1);
        spawnDestructionSparks(obs.x + obs.width / 2, obs.y + obs.height / 2, '#38bdf8');
        playSound('shield_break');
        continue;
      }

      // Game Over Collision
      triggerGameOver();
      return;
    }

    if (obs.x < -120) {
      obstacles.splice(i, 1);
    }
  }

  // Update Collectibles
  for (let i = collectibles.length - 1; i >= 0; i--) {
    const item = collectibles[i];
    item.x -= scrollSpeed;

    // Magnet effect during Catnip
    if (cat.catnipTimer > 0) {
      const dx = (cat.x + 20) - item.x;
      const dy = (cat.y + 20) - item.y;
      const d = Math.hypot(dx, dy);
      if (d < 240) {
        item.x += (dx / d) * 11;
        item.y += (dy / d) * 11;
      }
    }

    const itemHitbox = {
      x: item.x - 14,
      y: item.y - 14,
      width: 28,
      height: 28
    };

    const catHitbox = {
      x: cat.x,
      y: cat.y,
      width: cat.width,
      height: cat.height
    };

    if (!item.collected && checkCollision(catHitbox, itemHitbox)) {
      item.collected = true;
      collectibles.splice(i, 1);

      if (item.type === 'fish') {
        fishCount++;
        score += 25 * combo;
        playSound('fish');
        spawnCollectSparks(item.x, item.y, '#38bdf8');
      } else if (item.type === 'golden_fish') {
        fishCount += 3;
        coinCount += 2;
        score += 150 * combo;
        playSound('coin');
        spawnCollectSparks(item.x, item.y, '#f59e0b');
      } else if (item.type === 'coin') {
        coinCount++;
        score += 50 * combo;
        playSound('coin');
        spawnCollectSparks(item.x, item.y, '#eab308');
      } else if (item.type === 'shield') {
        cat.hasShield = true;
        playSound('powerup');
        spawnCollectSparks(item.x, item.y, '#60a5fa');
      } else if (item.type === 'catnip') {
        cat.catnipTimer = 4200; // 4.2 seconds
        playSound('powerup');
        spawnCollectSparks(item.x, item.y, '#10b981');
      }

      combo = Math.min(4, combo + 1);
      comboTimer = 2200; // 2.2s combo window
      continue;
    }

    if (item.x < -60) {
      collectibles.splice(i, 1);
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.alpha = Math.max(0, p.life / 25);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update Background Scenery Parallax
  for (let sc of bgScenery) {
    sc.x -= sc.speed * (scrollSpeed / 5.2);
    if (sc.x < -150) {
      sc.x = V_WIDTH + 80 + Math.random() * 100;
      if (sc.type === 'cloud') sc.y = 30 + Math.random() * 100;
    }
  }
}

function checkCollision(r1, r2) {
  return !(
    r1.x + r1.width < r2.x ||
    r1.x > r2.x + r2.width ||
    r1.y + r1.height < r2.y ||
    r1.y > r2.y + r2.height
  );
}

function spawnCollectSparks(x, y, color) {
  for (let i = 0; i < 7; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      size: 3 + Math.random() * 3,
      color: color,
      alpha: 1.0,
      life: 20
    });
  }
}

function spawnDestructionSparks(x, y, color) {
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 8,
      size: 4 + Math.random() * 5,
      color: color,
      alpha: 1.0,
      life: 25
    });
  }
}

function triggerGameOver() {
  currentState = STATES.GAMEOVER;
  playSound('hit');

  // Update Progression & Currency
  gameSave.totalFish += fishCount;
  gameSave.coins += coinCount;

  if (score > gameSave.highScore) {
    gameSave.highScore = score;
    // Submit score to local / community leaderboards
    submitScore('cat-dash', score, {
      distance: Math.floor(distance),
      fish: fishCount
    });
  }

  if (distance > gameSave.maxDistance) {
    gameSave.maxDistance = Math.floor(distance);
  }

  // Daily Challenge status
  if (isDailyMode) {
    const todayKey = getTodayKey();
    if (!gameSave.dailyRecords[todayKey]) {
      gameSave.dailyRecords[todayKey] = { completed: false, bestDist: 0 };
    }
    const rec = gameSave.dailyRecords[todayKey];
    rec.bestDist = Math.max(rec.bestDist, Math.floor(distance));
    if (rec.bestDist >= 650 && !rec.completed) {
      rec.completed = true;
      gameSave.coins += 150; // Daily Completion Bonus!
    }
  }

  persistSaveData();
  renderDOMOverlay();
}

/* ==========================================================================
   Canvas Rendering Engine
   ========================================================================== */
function draw() {
  if (!ctx) return;
  const biome = getCurrentBiome();

  // 1. Sky Gradient Background
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, biome.skyTop);
  skyGrad.addColorStop(1, biome.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // 2. Sun or Moon
  if (biome.name.includes('Moonlit')) {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(820, 90, 44, 0, Math.PI * 2);
    ctx.fill();
    // Star sparkles
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect((i * 47) % V_WIDTH, (i * 29) % 220, 2, 2);
    }
  } else {
    // Warm Sun
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(820, 80, 38, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Parallax Background Scenery
  for (let sc of bgScenery) {
    if (sc.type === 'cloud') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sc.size * 0.5, 0, Math.PI * 2);
      ctx.arc(sc.x + sc.size * 0.35, sc.y - sc.size * 0.15, sc.size * 0.45, 0, Math.PI * 2);
      ctx.arc(sc.x + sc.size * 0.7, sc.y, sc.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (sc.type === 'fence') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(sc.x, GROUND_Y - 32, 12, 32);
      ctx.fillRect(sc.x + 18, GROUND_Y - 32, 12, 32);
      ctx.fillRect(sc.x - 4, GROUND_Y - 24, 40, 6);
    }
  }

  // 4. Ground & Road Surface
  ctx.fillStyle = biome.roadColor;
  ctx.fillRect(0, GROUND_Y, V_WIDTH, V_HEIGHT - GROUND_Y);

  ctx.fillStyle = biome.groundGrass;
  ctx.fillRect(0, GROUND_Y - 4, V_WIDTH, 6);

  // Road dashed center line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const dashOffset = (distance * 14) % 40;
  for (let x = -dashOffset; x < V_WIDTH; x += 40) {
    ctx.fillRect(x, GROUND_Y + 45, 22, 5);
  }

  // 5. Draw Obstacles
  for (let obs of obstacles) {
    drawObstacle(obs);
  }

  // 6. Draw Collectibles
  for (let item of collectibles) {
    drawCollectible(item);
  }

  // 7. Draw Particles
  for (let p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. Draw Player Cat
  drawPlayerCat();
}

function drawObstacle(obs) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (obs.type === 'box' || obs.type === 'double_box') {
    // Cardboard Box
    ctx.fillStyle = obs.color;
    ctx.fillRect(0, 0, obs.width, obs.height);
    // Box tape
    ctx.fillStyle = '#d97706';
    ctx.fillRect(obs.width / 2 - 4, 0, 8, obs.height);
    // Box shading
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, obs.width, obs.height);
  } else if (obs.type === 'overhead') {
    // Overhead Clothesline / Pipe with warning tape
    ctx.fillStyle = '#64748b';
    ctx.fillRect(obs.width / 2 - 4, -120, 8, 120); // pole
    ctx.fillStyle = obs.color;
    ctx.fillRect(0, 0, obs.width, obs.height);
    // Hazard stripes
    ctx.fillStyle = '#fde047';
    for (let x = 6; x < obs.width; x += 22) {
      ctx.fillRect(x, 4, 10, obs.height - 8);
    }
  } else if (obs.type === 'rolling_can') {
    // Rolling Can / Yarn Ball
    ctx.translate(obs.width / 2, obs.height / 2);
    ctx.rotate(obs.rotation || 0);
    ctx.fillStyle = obs.color;
    ctx.beginPath();
    ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Inner spiral
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(obs.width * 0.15, -obs.height * 0.15, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCollectible(item) {
  ctx.save();
  ctx.translate(item.x, item.y);

  // Bobbing float animation
  const bob = Math.sin((Date.now() / 150) + item.x) * 4;
  ctx.translate(0, bob);

  if (item.type === 'fish') {
    // Blue/Silver Minnow
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐟', 0, 0);
  } else if (item.type === 'golden_fish') {
    // Rare Golden Koi
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐠', 0, 0);
  } else if (item.type === 'coin') {
    // Gold Coin
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', 0, 1);
  } else if (item.type === 'shield') {
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🥛', 0, 0);
  } else if (item.type === 'catnip') {
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌿', 0, 0);
  }

  ctx.restore();
}

function drawPlayerCat() {
  const skin = SKINS.find(s => s.id === gameSave.equippedSkin) || SKINS[0];
  ctx.save();

  // Ground drop shadow
  const shadowScale = Math.max(0.3, 1 - (GROUND_Y - cat.y) / 220);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(cat.x + 24, GROUND_Y - 2, 26 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(cat.x + cat.width / 2, cat.y + cat.height / 2);
  ctx.scale(cat.squash, cat.stretch);
  ctx.translate(-cat.width / 2, -cat.height / 2);

  // Powerup Shield Aura
  if (cat.hasShield) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(26, 24, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Catnip Aura
  if (cat.catnipTimer > 0) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(26, 24, 30 + Math.sin(Date.now() / 80) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (cat.isSliding) {
    // Crouched Sliding Cat Body
    ctx.fillStyle = skin.bodyColor;
    ctx.beginPath();
    ctx.ellipse(26, 32, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sliding Head
    ctx.beginPath();
    ctx.arc(44, 28, 14, 0, Math.PI * 2);
    ctx.fill();

    // Pinned back ears
    ctx.beginPath();
    ctx.moveTo(40, 18);
    ctx.lineTo(34, 12);
    ctx.lineTo(44, 15);
    ctx.fill();

    // Sliding Eye
    ctx.fillStyle = skin.eyeColor;
    ctx.beginPath();
    ctx.arc(48, 26, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Normal / Jumping Running Cat Body
    ctx.fillStyle = skin.bodyColor;
    ctx.beginPath();
    ctx.ellipse(24, 24, 20, 15, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Belly patch
    ctx.fillStyle = skin.bellyColor;
    ctx.beginPath();
    ctx.ellipse(22, 28, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cat Head
    ctx.fillStyle = skin.bodyColor;
    ctx.beginPath();
    ctx.arc(38, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(33, 6);
    ctx.lineTo(38, -4);
    ctx.lineTo(43, 6);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(43, 8);
    ctx.lineTo(48, 0);
    ctx.lineTo(51, 10);
    ctx.fill();

    // Eyes
    ctx.fillStyle = skin.eyeColor;
    ctx.beginPath();
    ctx.arc(43, 14, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(44, 14, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = skin.bellyColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(44, 18);
    ctx.lineTo(56, 17);
    ctx.moveTo(44, 20);
    ctx.lineTo(54, 22);
    ctx.stroke();

    // Tail wave
    ctx.strokeStyle = skin.bodyColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailWave = Math.sin(Date.now() / 120) * 8;
    ctx.moveTo(6, 24);
    ctx.quadraticCurveTo(-6, 10 + tailWave, -4, 2);
    ctx.stroke();

    // Running Legs (4-frame animated cycle)
    ctx.fillStyle = skin.bodyColor;
    const legCycle = cat.isGrounded ? Math.sin((cat.runFrame / 4) * Math.PI * 2) * 8 : 0;
    // Front leg
    ctx.fillRect(32 + legCycle, 36, 6, 12);
    // Back leg
    ctx.fillRect(14 - legCycle, 36, 6, 12);
  }

  ctx.restore();
}

/* ==========================================================================
   HTML DOM UI Overlays & Menu Controller
   ========================================================================== */
function renderDOMOverlay() {
  const hudEl = document.getElementById('cd-hud');
  const modalEl = document.getElementById('cd-modal-overlay');
  const modalContent = document.getElementById('cd-modal-content');
  if (!hudEl || !modalEl || !modalContent) return;

  // Toggle HUD display
  hudEl.style.display = (currentState === STATES.PLAYING) ? 'flex' : 'none';

  // Live HUD metrics
  const distEl = document.getElementById('cd-hud-dist');
  const scoreEl = document.getElementById('cd-hud-score');
  const fishEl = document.getElementById('cd-hud-fish');
  const coinsEl = document.getElementById('cd-hud-coins');
  const boostEl = document.getElementById('cd-hud-boost');

  if (distEl) distEl.textContent = `${Math.floor(distance)}m`;
  if (scoreEl) scoreEl.textContent = score;
  if (fishEl) fishEl.textContent = fishCount;
  if (coinsEl) coinsEl.textContent = coinCount;
  if (boostEl) {
    if (cat.catnipTimer > 0) {
      boostEl.style.display = 'block';
      boostEl.textContent = `⚡ CATNIP RUSH (${(cat.catnipTimer / 1000).toFixed(1)}s)`;
    } else if (cat.hasShield) {
      boostEl.style.display = 'block';
      boostEl.textContent = `🛡️ SHIELD ACTIVE`;
    } else {
      boostEl.style.display = 'none';
    }
  }

  // Modals based on State
  if (currentState === STATES.MENU) {
    modalEl.style.display = 'flex';
    modalContent.innerHTML = `
      <div class="cd-panel">
        <div class="cd-title-logo">🐾 CAT DASH</div>
        <p class="cd-tagline">Fast & Addictive Endless Runner Arcade</p>

        <div class="cd-menu-stats">
          <div><span>🏆 High Score</span><strong>${gameSave.highScore}</strong></div>
          <div><span>📏 Longest Run</span><strong>${gameSave.maxDistance}m</strong></div>
          <div><span>🪙 Cat Coins</span><strong>${gameSave.coins}</strong></div>
        </div>

        <div class="cd-btn-stack">
          <button id="cd-btn-play" class="btn btn-primary btn-lg" style="width:100%;">
            <span>▶ Start Dash Run</span>
          </button>
          <button id="cd-btn-daily" class="btn btn-secondary btn-md" style="width:100%;">
            <span>📅 Daily Challenge (${getTodayKey()})</span>
          </button>
          <div style="display:flex; gap:0.5rem; width:100%;">
            <button id="cd-btn-shop" class="btn btn-secondary btn-sm" style="flex:1;">
              <span>👗 Wardrobe (${gameSave.unlockedSkins.length}/${SKINS.length})</span>
            </button>
            <button id="cd-btn-howto" class="btn btn-secondary btn-sm" style="flex:1;">
              <span>❓ Instructions</span>
            </button>
          </div>
        </div>
      </div>
    `;
    bindMenuEvents();
  } else if (currentState === STATES.PAUSED) {
    modalEl.style.display = 'flex';
    modalContent.innerHTML = `
      <div class="cd-panel">
        <h2 style="font-size:1.8rem; margin-bottom:1rem; color:var(--text-primary);">⏸️ Game Paused</h2>
        <div class="cd-btn-stack">
          <button id="cd-btn-resume" class="btn btn-primary btn-md" style="width:100%;"><span>▶ Resume Run</span></button>
          <button id="cd-btn-restart" class="btn btn-secondary btn-md" style="width:100%;"><span>🔁 Restart Run</span></button>
          <button id="cd-btn-sound" class="btn btn-secondary btn-sm" style="width:100%;">
            <span>${isSoundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}</span>
          </button>
          <button id="cd-btn-quit" class="btn btn-secondary btn-sm" style="width:100%;"><span>🏠 Main Menu</span></button>
        </div>
      </div>
    `;
    bindPauseEvents();
  } else if (currentState === STATES.GAMEOVER) {
    modalEl.style.display = 'flex';
    const isNewBest = score >= gameSave.highScore && score > 0;
    modalContent.innerHTML = `
      <div class="cd-panel">
        <h2 style="font-size:1.8rem; margin-bottom:0.25rem; color:var(--accent-rose);">💥 Run Complete!</h2>
        ${isNewBest ? '<div class="cd-badge-best">🌟 NEW PERSONAL BEST!</div>' : ''}

        <div class="cd-results-grid">
          <div class="cd-res-box">
            <span>Distance</span>
            <strong>${Math.floor(distance)}m</strong>
          </div>
          <div class="cd-res-box">
            <span>Score</span>
            <strong>${score}</strong>
          </div>
          <div class="cd-res-box">
            <span>Fish Caught</span>
            <strong>🐟 ${fishCount}</strong>
          </div>
          <div class="cd-res-box">
            <span>Coins Earned</span>
            <strong>🪙 +${coinCount}</strong>
          </div>
        </div>

        <div class="cd-btn-stack">
          <button id="cd-btn-playagain" class="btn btn-primary btn-lg" style="width:100%;"><span>🔁 Dash Again</span></button>
          <button id="cd-btn-menu-exit" class="btn btn-secondary btn-md" style="width:100%;"><span>🏠 Main Menu</span></button>
        </div>
      </div>
    `;
    bindGameOverEvents();
  } else if (currentState === STATES.SHOP) {
    modalEl.style.display = 'flex';
    modalContent.innerHTML = `
      <div class="cd-panel cd-panel-wide">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="font-size:1.6rem; color:var(--text-primary);">👗 Cat Wardrobe Shop</h2>
          <div style="font-weight:700; color:var(--accent-amber); font-size:1.1rem;">🪙 ${gameSave.coins} Coins</div>
        </div>

        <div class="cd-skins-grid">
          ${SKINS.map(s => {
            const isUnlocked = gameSave.unlockedSkins.includes(s.id);
            const isEquipped = gameSave.equippedSkin === s.id;
            return `
              <div class="cd-skin-card ${isEquipped ? 'equipped' : ''}">
                <div style="font-size:2.5rem; margin-bottom:0.25rem;">${s.icon}</div>
                <div style="font-weight:700; font-size:1rem; color:var(--text-primary);">${s.name}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.6rem;">
                  ${isUnlocked ? (isEquipped ? 'Active' : 'Unlocked') : `🪙 ${s.cost} Coins`}
                </div>
                ${isEquipped 
                  ? '<button class="btn btn-sm btn-secondary" disabled style="width:100%; opacity:0.6;">Equipped</button>'
                  : (isUnlocked 
                    ? `<button class="btn btn-sm btn-secondary cd-btn-equip" data-id="${s.id}" style="width:100%;">Equip</button>`
                    : `<button class="btn btn-sm btn-primary cd-btn-buy" data-id="${s.id}" data-cost="${s.cost}" style="width:100%;" ${gameSave.coins < s.cost ? 'disabled' : ''}>Unlock</button>`)
                }
              </div>
            `;
          }).join('')}
        </div>

        <button id="cd-btn-shop-back" class="btn btn-secondary btn-md" style="width:100%; margin-top:1.25rem;"><span>← Back to Menu</span></button>
      </div>
    `;
    bindShopEvents();
  } else if (currentState === STATES.DAILY) {
    const todayKey = getTodayKey();
    const rec = gameSave.dailyRecords[todayKey] || { completed: false, bestDist: 0 };
    modalEl.style.display = 'flex';
    modalContent.innerHTML = `
      <div class="cd-panel">
        <h2 style="font-size:1.6rem; margin-bottom:0.5rem; color:var(--accent-cyan);">📅 Daily Challenge</h2>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.25rem;">Same deterministic obstacle track for all players today! Reach <strong>650m</strong> to win.</p>

        <div style="background:var(--bg-primary); border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span>Target Distance:</span><strong>650 meters</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span>Your Best Today:</span><strong>${rec.bestDist}m</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Challenge Status:</span>
            <strong style="color:${rec.completed ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">
              ${rec.completed ? '✅ Completed (+150 🪙)' : '⏳ In Progress'}
            </strong>
          </div>
        </div>

        <div class="cd-btn-stack">
          <button id="cd-btn-start-daily" class="btn btn-primary btn-lg" style="width:100%;"><span>▶ Launch Daily Track</span></button>
          <button id="cd-btn-daily-back" class="btn btn-secondary btn-md" style="width:100%;"><span>← Back to Menu</span></button>
        </div>
      </div>
    `;
    bindDailyEvents();
  } else if (currentState === STATES.HOWTO) {
    modalEl.style.display = 'flex';
    modalContent.innerHTML = `
      <div class="cd-panel cd-panel-wide">
        <h2 style="font-size:1.6rem; margin-bottom:1rem; color:var(--text-primary);">🐾 How to Play Cat Dash</h2>
        <div style="text-align:left; font-size:0.92rem; line-height:1.7; color:var(--text-secondary); margin-bottom:1.5rem;">
          <p><strong>🦘 Jump:</strong> Tap screen, press Space / W / Up Arrow, or tap the [ JUMP ] button to leap over cardboard boxes and rolling obstacles.</p>
          <p style="margin-top:0.5rem;"><strong>🏃 Slide:</strong> Swipe Down, press S / Down Arrow, or tap the [ SLIDE ] button to slide under hanging clotheslines and pipes.</p>
          <p style="margin-top:0.5rem;"><strong>🐟 Collectibles:</strong> Catch silver fish (+25 pts) and coins (+50 pts) to build score multipliers and unlock wardrobe skins.</p>
          <p style="margin-top:0.5rem;"><strong>🛡️ Milk Bottle:</strong> Grants a blue barrier bubble that saves you from 1 obstacle crash.</p>
          <p style="margin-top:0.5rem;"><strong>🌿 Catnip Rush:</strong> Temporarily grants invulnerability and acts as a fish magnet!</p>
        </div>
        <button id="cd-btn-howto-back" class="btn btn-secondary btn-md" style="width:100%;"><span>← Got It!</span></button>
      </div>
    `;
    document.getElementById('cd-btn-howto-back').addEventListener('click', () => {
      currentState = STATES.MENU;
      renderDOMOverlay();
    });
  } else {
    modalEl.style.display = 'none';
  }
}

/* ==========================================================================
   Event Binding & Interactions
   ========================================================================== */
function bindMenuEvents() {
  document.getElementById('cd-btn-play')?.addEventListener('click', () => {
    resetRun(false);
    currentState = STATES.PLAYING;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-daily')?.addEventListener('click', () => {
    currentState = STATES.DAILY;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-shop')?.addEventListener('click', () => {
    currentState = STATES.SHOP;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-howto')?.addEventListener('click', () => {
    currentState = STATES.HOWTO;
    renderDOMOverlay();
  });
}

function bindPauseEvents() {
  document.getElementById('cd-btn-resume')?.addEventListener('click', () => {
    currentState = STATES.PLAYING;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-restart')?.addEventListener('click', () => {
    resetRun(isDailyMode);
    currentState = STATES.PLAYING;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-sound')?.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    gameSave.sound = isSoundEnabled;
    persistSaveData();
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-quit')?.addEventListener('click', () => {
    currentState = STATES.MENU;
    renderDOMOverlay();
  });
}

function bindGameOverEvents() {
  document.getElementById('cd-btn-playagain')?.addEventListener('click', () => {
    resetRun(isDailyMode);
    currentState = STATES.PLAYING;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-menu-exit')?.addEventListener('click', () => {
    currentState = STATES.MENU;
    renderDOMOverlay();
  });
}

function bindShopEvents() {
  document.querySelectorAll('.cd-btn-equip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const skinId = e.currentTarget.dataset.id;
      gameSave.equippedSkin = skinId;
      persistSaveData();
      renderDOMOverlay();
    });
  });

  document.querySelectorAll('.cd-btn-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const skinId = e.currentTarget.dataset.id;
      const cost = parseInt(e.currentTarget.dataset.cost, 10);
      if (gameSave.coins >= cost && !gameSave.unlockedSkins.includes(skinId)) {
        gameSave.coins -= cost;
        gameSave.unlockedSkins.push(skinId);
        gameSave.equippedSkin = skinId;
        playSound('coin');
        persistSaveData();
        renderDOMOverlay();
      }
    });
  });

  document.getElementById('cd-btn-shop-back')?.addEventListener('click', () => {
    currentState = STATES.MENU;
    renderDOMOverlay();
  });
}

function bindDailyEvents() {
  document.getElementById('cd-btn-start-daily')?.addEventListener('click', () => {
    resetRun(true);
    currentState = STATES.PLAYING;
    renderDOMOverlay();
  });
  document.getElementById('cd-btn-daily-back')?.addEventListener('click', () => {
    currentState = STATES.MENU;
    renderDOMOverlay();
  });
}

/* ==========================================================================
   Input Listeners (Pointer, Keyboard, Virtual Buttons)
   ========================================================================== */
function setupInputListeners() {
  // Desktop Keyboard
  const handleKeydown = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      triggerJump();
    } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      triggerSlide();
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (currentState === STATES.PLAYING) {
        currentState = STATES.PAUSED;
        renderDOMOverlay();
      } else if (currentState === STATES.PAUSED) {
        currentState = STATES.PLAYING;
        renderDOMOverlay();
      }
    }
  };
  window.addEventListener('keydown', handleKeydown);

  // Unified Pointer & Swipe Events on Canvas
  if (canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      initAudio();
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      isTouchDown = true;
    });

    canvas.addEventListener('pointerup', (e) => {
      if (!isTouchDown) return;
      isTouchDown = false;
      const deltaX = e.clientX - touchStartX;
      const deltaY = e.clientY - touchStartY;

      // Swipe Down check
      if (deltaY > 28 && Math.abs(deltaY) > Math.abs(deltaX)) {
        triggerSlide();
      } else {
        // Simple Tap -> Jump
        triggerJump();
      }
    });

    canvas.addEventListener('pointercancel', () => {
      isTouchDown = false;
    });
  }

  // On-screen Mobile Touch Buttons
  const btnJump = document.getElementById('cd-touch-jump');
  const btnSlide = document.getElementById('cd-touch-slide');
  const btnPause = document.getElementById('cd-hud-pause');

  if (btnJump) {
    btnJump.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      initAudio();
      triggerJump();
    });
  }

  if (btnSlide) {
    btnSlide.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      initAudio();
      triggerSlide();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (currentState === STATES.PLAYING) {
        currentState = STATES.PAUSED;
        renderDOMOverlay();
      }
    });
  }

  // Safe window tab blur pause
  window.addEventListener('blur', () => {
    if (currentState === STATES.PLAYING) {
      currentState = STATES.PAUSED;
      renderDOMOverlay();
    }
  });
}

/* ==========================================================================
   Main RAF Game Loop
   ========================================================================== */
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min(64, timestamp - lastTime);
  lastTime = timestamp;

  update(dt);
  draw();

  animFrameId = requestAnimationFrame(gameLoop);
}

/* ==========================================================================
   Public Interface & Mount / Cleanup
   ========================================================================== */
export function renderCatDashGame(container) {
  loadSaveData();

  container.innerHTML = `
    <div id="cat-dash-root" class="cat-dash">
      <div class="cd-stage-wrapper">
        <!-- Render Canvas -->
        <canvas id="cd-canvas" width="${V_WIDTH}" height="${V_HEIGHT}"></canvas>

        <!-- Live Gameplay HUD -->
        <div id="cd-hud" class="cd-hud" style="display:none;">
          <div class="cd-hud-left">
            <div class="cd-stat-pill">📏 <span id="cd-hud-dist">0m</span></div>
            <div class="cd-stat-pill">⭐ <span id="cd-hud-score">0</span></div>
            <div class="cd-stat-pill">🐟 <span id="cd-hud-fish">0</span></div>
            <div class="cd-stat-pill">🪙 <span id="cd-hud-coins">0</span></div>
          </div>
          <div class="cd-hud-right">
            <div id="cd-hud-boost" class="cd-boost-pill" style="display:none;">⚡ BOOST</div>
            <button id="cd-hud-pause" class="cd-pause-btn" aria-label="Pause Game">⏸️</button>
          </div>
        </div>

        <!-- Tactile On-Screen Mobile Action Buttons -->
        <div id="cd-touch-controls" class="cd-touch-controls">
          <button id="cd-touch-slide" class="cd-action-btn cd-btn-slide" aria-label="Slide">
            <span>🏃 SLIDE</span>
          </button>
          <button id="cd-touch-jump" class="cd-action-btn cd-btn-jump" aria-label="Jump">
            <span>🦘 JUMP</span>
          </button>
        </div>

        <!-- Modals & Menu Overlay -->
        <div id="cd-modal-overlay" class="cd-modal-overlay">
          <div id="cd-modal-content"></div>
        </div>
      </div>
    </div>
  `;

  canvas = document.getElementById('cd-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
  }

  setupInputListeners();
  currentState = STATES.MENU;
  renderDOMOverlay();

  lastTime = performance.now();
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(gameLoop);
}

export function cleanupCatDashGame() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (audioCtx && audioCtx.state !== 'closed') {
    try {
      audioCtx.close();
    } catch (_) {}
    audioCtx = null;
  }
}
