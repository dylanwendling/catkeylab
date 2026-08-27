/* ==========================================================================
   ClickPulse - Interactive Cat Mascot Component (Ginger Tabby Upgrade)
   ========================================================================== */

import { playClickSound } from '../audio.js';

const CAT_DIALOGUES = [
  "meow.",
  "purrrrr...",
  "i saw your cursor!",
  "click that one, human.",
  "mouse looks delicious today.",
  "testing keys, are we?",
  "mrrp?",
  "nice click!",
  "i'm watching you...",
  "blink and you'll miss it.",
  "pet me!"
];

const PURR_DIALOGUES = [
  "purrrrr...",
  "*purrs happily*",
  "mrrp! <3",
  "meow~",
  "good human!",
  "more pets please!",
  "purrrrrrrrr..."
];

const FAST_SCROLL_DIALOGUES = [
  "whoa, cat eyes can't track that scroll!",
  "slow down, human!",
  "are you racing someone?",
  "my whiskers are twitching from that speed!",
  "scrolling fast today, huh?",
  "speed reader alert!"
];

let leftPupilEl = null;
let rightPupilEl = null;
let leftPawEl = null;
let rightPawEl = null;
let catEl = null;
let speechEl = null;

let targetPupilX = 0;
let targetPupilY = 0;
let currentPupilX = 0;
let currentPupilY = 0;

let targetLeftPawX = 0;
let targetLeftPawY = 0;
let currentLeftPawX = 0;
let currentLeftPawY = 0;

let targetRightPawX = 0;
let targetRightPawY = 0;
let currentRightPawX = 0;
let currentRightPawY = 0;

let isMouseNear = false;
let speechTimeout = null;
let lastSpeechTime = 0;

let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let lastJudgementTime = 0;

export function initCatMascot() {
  const container = document.getElementById('eye-mascot-container');
  if (!container) return;

  container.innerHTML = `
    <div class="mascot-container">
      <div id="mascot-speech" class="mascot-speech-bubble">meow.</div>
      <div id="cat-character" class="cat-character" aria-label="ClickPulse Cat Mascot">
        <div class="cat-ear cat-ear-left"></div>
        <div class="cat-ear cat-ear-right"></div>
        <div class="cat-head">
          <div class="cat-eyes-row">
            <div class="cat-sclera">
              <div class="cat-eyelid"></div>
              <div id="cat-pupil-left" class="cat-pupil"></div>
            </div>
            <div class="cat-sclera">
              <div class="cat-eyelid"></div>
              <div id="cat-pupil-right" class="cat-pupil"></div>
            </div>
          </div>
          <div class="cat-snout">
            <div class="cat-nose"></div>
          </div>
          <div class="cat-whiskers">
            <div class="whisker-line"></div>
            <div class="whisker-line"></div>
          </div>
        </div>
        <div id="cat-paw-left" class="cat-paw cat-paw-left"></div>
        <div id="cat-paw-right" class="cat-paw cat-paw-right"></div>
      </div>
    </div>
  `;

  leftPupilEl = document.getElementById('cat-pupil-left');
  rightPupilEl = document.getElementById('cat-pupil-right');
  leftPawEl = document.getElementById('cat-paw-left');
  rightPawEl = document.getElementById('cat-paw-right');
  catEl = document.getElementById('cat-character');
  speechEl = document.getElementById('mascot-speech');

  if (!catEl) return;

  // Bind Mouse, Touch & Scroll Events
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Pet the Cat Handlers (Click + Hover Petting)
  catEl.addEventListener('click', handlePetting);
  catEl.addEventListener('mouseenter', handlePetting);

  // Start Animation Loops
  requestAnimationFrame(animateMascot);
  scheduleBlink();
  schedulePeriodicSpeech();

  // Initial welcome greeting after 2 seconds
  setTimeout(() => {
    showSpeechBubble("meow.");
  }, 2000);
}

/**
 * Pet the Cat Reaction (Synthesizes purr chime sound, spawns heart particle, pops speech)
 */
function handlePetting(e) {
  if (e && e.type === 'mouseenter' && Math.random() > 0.4) return;

  playPurrSound();

  if (!catEl) return;

  catEl.classList.add('purring');
  setTimeout(() => {
    if (catEl) catEl.classList.remove('purring');
  }, 1800);

  spawnFloatingParticle(e);

  const line = PURR_DIALOGUES[Math.floor(Math.random() * PURR_DIALOGUES.length)];
  showSpeechBubble(line);
}

/**
 * Synthesize Purr Chime Sound via Web Audio API
 */
function playPurrSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.36);
  } catch (err) {
    playClickSound(520, 0.03);
  }
}

/**
 * Spawn Floating Heart or Paw Print Particle
 */
function spawnFloatingParticle(e) {
  const container = document.getElementById('eye-mascot-container');
  if (!container) return;

  const particle = document.createElement('div');
  particle.className = 'floating-particle';
  particle.textContent = Math.random() < 0.6 ? '❤️' : '🐾';

  const rect = catEl.getBoundingClientRect();
  particle.style.left = `${rect.left + rect.width / 2 - 10 + (Math.random() * 20 - 10)}px`;
  particle.style.top = `${rect.top}px`;

  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 1200);
}

/**
 * Fast Scroll Judgement Detection
 */
function handleScroll() {
  const now = Date.now();
  const currentScrollY = window.scrollY;
  const timeDelta = now - lastScrollTime;

  if (timeDelta > 50) {
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    const scrollSpeed = (scrollDelta / timeDelta) * 1000;

    if (scrollSpeed > 2200 && now - lastJudgementTime > 7000) {
      lastJudgementTime = now;
      judgeFastScroll();
    }

    lastScrollY = currentScrollY;
    lastScrollTime = now;
  }
}

function judgeFastScroll() {
  if (!catEl) return;

  catEl.classList.add('squint');
  setTimeout(() => {
    if (catEl) catEl.classList.remove('squint');
  }, 2400);

  const line = FAST_SCROLL_DIALOGUES[Math.floor(Math.random() * FAST_SCROLL_DIALOGUES.length)];
  showSpeechBubble(line);
}

/**
 * Cat WPM & Accuracy Speed Judge
 */
export function judgeTypingSpeed(wpm, accuracy) {
  if (!catEl) return;

  catEl.classList.remove('squint', 'play-mode');

  let dialogue = '';

  if (accuracy < 85) {
    catEl.classList.add('squint');
    dialogue = `meow... ${wpm} WPM is fast, but ${accuracy}% accuracy? watch those typos!`;
  } else if (wpm < 30) {
    catEl.classList.add('squint');
    dialogue = `meow... ${wpm} WPM? type faster, human! i'm falling asleep...`;
  } else if (wpm <= 65) {
    dialogue = `purrr... ${wpm} WPM! respectable casual typist!`;
  } else if (wpm <= 100) {
    catEl.classList.add('play-mode');
    dialogue = `WHOA! ${wpm} WPM!! fast fingers! *swats paws*`;
  } else {
    catEl.classList.add('play-mode');
    dialogue = `PURRR-FECT ${wpm} WPM!! GODLIKE TYPIST! *happy cat noises*`;
  }

  setTimeout(() => {
    if (catEl) catEl.classList.remove('squint', 'play-mode');
  }, 3500);

  showSpeechBubble(dialogue);
}

/**
 * Mouse Pupil Tracking & Cursor-Tracking Swatting Paws
 */
function handleMouseMove(e) {
  if (!catEl) return;

  const rect = catEl.getBoundingClientRect();
  const catCenterX = rect.left + rect.width / 2;
  const catCenterY = rect.top + rect.height / 2;

  const deltaX = e.clientX - catCenterX;
  const deltaY = e.clientY - catCenterY;
  const distance = Math.hypot(deltaX, deltaY);

  // Mouse Play Mode & Paw Cursor Tracking (< 220px)
  if (distance < 220) {
    if (!isMouseNear) {
      isMouseNear = true;
      catEl.classList.add('play-mode');
      if (Math.random() < 0.4) {
        showSpeechBubble("mrrp! mouse detected!");
      }
    }

    // Calculate paw reach vector toward cursor
    const maxPawReach = 18; // max pixels paws reach out
    const pawAngle = Math.atan2(deltaY, deltaX);
    const pawReachDist = Math.min(distance * 0.12, maxPawReach);

    targetLeftPawX = Math.cos(pawAngle) * pawReachDist;
    targetLeftPawY = Math.sin(pawAngle) * pawReachDist - 6;

    targetRightPawX = Math.cos(pawAngle) * (pawReachDist * 0.9);
    targetRightPawY = Math.sin(pawAngle) * (pawReachDist * 0.9) - 6;

  } else {
    if (isMouseNear) {
      isMouseNear = false;
      catEl.classList.remove('play-mode');
    }

    targetLeftPawX = 0;
    targetLeftPawY = 0;
    targetRightPawX = 0;
    targetRightPawY = 0;
  }

  // Pupil offset calculation
  const maxRadius = 6;
  const angle = Math.atan2(deltaY, deltaX);
  const pupilDistance = Math.min(distance * 0.08, maxRadius);

  targetPupilX = Math.cos(angle) * pupilDistance;
  targetPupilY = Math.sin(angle) * pupilDistance;
}

/**
 * Smooth Lerp frame loop for both pupils and cursor-tracking paws
 */
function animateMascot() {
  // Smooth pupil tracking
  if (leftPupilEl && rightPupilEl) {
    currentPupilX += (targetPupilX - currentPupilX) * 0.14;
    currentPupilY += (targetPupilY - currentPupilY) * 0.14;

    const pupilTransform = `translate(${currentPupilX.toFixed(2)}px, ${currentPupilY.toFixed(2)}px)`;
    leftPupilEl.style.transform = pupilTransform;
    rightPupilEl.style.transform = pupilTransform;
  }

  // Smooth paw cursor swatting tracking
  if (leftPawEl && rightPawEl) {
    currentLeftPawX += (targetLeftPawX - currentLeftPawX) * 0.18;
    currentLeftPawY += (targetLeftPawY - currentLeftPawY) * 0.18;

    currentRightPawX += (targetRightPawX - currentRightPawX) * 0.18;
    currentRightPawY += (targetRightPawY - currentRightPawY) * 0.18;

    const rotLeft = (currentLeftPawX * 1.5).toFixed(1);
    const rotRight = (currentRightPawX * 1.5).toFixed(1);

    leftPawEl.style.transform = `translate(${currentLeftPawX.toFixed(2)}px, ${currentLeftPawY.toFixed(2)}px) rotate(${rotLeft}deg)`;
    rightPawEl.style.transform = `translate(${currentRightPawX.toFixed(2)}px, ${currentRightPawY.toFixed(2)}px) rotate(${rotRight}deg)`;
  }

  requestAnimationFrame(animateMascot);
}

/**
 * Natural organic blinking timer
 */
function scheduleBlink() {
  const nextBlinkDelay = Math.random() * 3500 + 2500;

  setTimeout(() => {
    if (catEl) {
      catEl.classList.add('blinking');
      setTimeout(() => {
        catEl.classList.remove('blinking');
        scheduleBlink();
      }, 120);
    } else {
      scheduleBlink();
    }
  }, nextBlinkDelay);
}

/**
 * Occasional periodic dialogue bubble
 */
function schedulePeriodicSpeech() {
  const delay = Math.random() * 20000 + 15000;

  setTimeout(() => {
    const now = Date.now();
    if (now - lastSpeechTime > 12000) {
      const line = CAT_DIALOGUES[Math.floor(Math.random() * CAT_DIALOGUES.length)];
      showSpeechBubble(line);
    }
    schedulePeriodicSpeech();
  }, delay);
}

/**
 * Render speech bubble popup
 */
function showSpeechBubble(text) {
  if (!speechEl) return;

  speechEl.textContent = text;
  speechEl.classList.add('active');
  lastSpeechTime = Date.now();

  if (speechTimeout) clearTimeout(speechTimeout);

  speechTimeout = setTimeout(() => {
    if (speechEl) speechEl.classList.remove('active');
  }, 3200);
}
