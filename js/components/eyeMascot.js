/* ==========================================================================
   ClickPulse - Interactive Eye Mascot Component
   ========================================================================== */

import { playClickSound } from '../audio.js';

const DIALOGUE_LINES = [
  "hey.",
  "i saw that.",
  "you found this pretty fast.",
  "click that one.",
  "why are you still here?",
  "okay, that one's actually good.",
  "mouse looks sharp today.",
  "testing keys, are we?",
  "boop.",
  "nice click.",
  "i'm watching you.",
  "blink and you'll miss it.",
  "surprised to see me?",
  "looking good!"
];

const FAST_SCROLL_DIALOGUES = [
  "whoa, slow down!",
  "scrolling fast today, huh?",
  "are you racing someone?",
  "my pupil can't keep up with that!",
  "did you miss something up there?",
  "judging your scroll speed hard right now...",
  "speed reader alert!",
  "calm down on that scroll wheel!"
];

const EXPRESSIONS = ['happy', 'surprised', 'squint', 'wink'];

let pupilEl = null;
let eyeEl = null;
let speechEl = null;

/**
 * Mascot Typing Speed & Accuracy Judge
 */
export function judgeTypingSpeed(wpm, accuracy) {
  if (!eyeEl) return;

  EXPRESSIONS.forEach(exp => eyeEl.classList.remove(exp));

  let expression = 'happy';
  let dialogue = '';

  if (accuracy < 85) {
    expression = 'squint';
    dialogue = `${wpm} WPM is fast, but ${accuracy}% accuracy? Watch those typos!`;
  } else if (wpm < 30) {
    expression = 'squint';
    const lines = [
      `${wpm} WPM... are you typing with one finger?`,
      `${wpm} WPM? Take your time, i'm not going anywhere...`,
      `${wpm} WPM. My grandma types faster!`,
      `Warm up those fingers! Only ${wpm} WPM.`
    ];
    dialogue = lines[Math.floor(Math.random() * lines.length)];
  } else if (wpm <= 65) {
    expression = 'wink';
    const lines = [
      `${wpm} WPM! Solid casual typist!`,
      `${wpm} WPM with ${accuracy}% accuracy. Respectable pace.`,
      `Nice and steady: ${wpm} WPM!`,
      `Smooth typing! ${wpm} WPM.`
    ];
    dialogue = lines[Math.floor(Math.random() * lines.length)];
  } else if (wpm <= 100) {
    expression = 'surprised';
    const lines = [
      `WHOA! ${wpm} WPM!! Fast fingers!`,
      `${wpm} WPM! Mechanical keyboard power!`,
      `${wpm} WPM! You're flying across those keys!`,
      `Speed demon alert! ${wpm} WPM!`
    ];
    dialogue = lines[Math.floor(Math.random() * lines.length)];
  } else {
    expression = 'happy';
    const lines = [
      `HOLY ${wpm} WPM!! Are you a robot?!`,
      `${wpm} WPM! My eyes are spinning!`,
      `GODLIKE TYPIST! ${wpm} WPM with ${accuracy}% accuracy!`,
      `Pro gamer typist unlocked: ${wpm} WPM!`
    ];
    dialogue = lines[Math.floor(Math.random() * lines.length)];
  }

  eyeEl.classList.add(expression);
  setTimeout(() => {
    if (eyeEl) eyeEl.classList.remove(expression);
  }, 3500);

  showSpeechBubble(dialogue);
}

let targetPupilX = 0;
let targetPupilY = 0;
let currentPupilX = 0;
let currentPupilY = 0;

let isMouseNear = false;
let speechTimeout = null;
let lastSpeechTime = 0;

let lastScrollY = window.scrollY;
let lastScrollTime = Date.now();
let lastJudgementTime = 0;

export function initEyeMascot() {
  const container = document.getElementById('eye-mascot-container');
  if (!container) return;

  container.innerHTML = `
    <div class="mascot-container">
      <div id="mascot-speech" class="mascot-speech-bubble">hey.</div>
      <div id="mascot-eye" class="mascot-character" aria-label="Click Pulse Eye Mascot">
        <div class="mascot-eyelid-top"></div>
        <div class="mascot-sclera">
          <div id="mascot-pupil" class="mascot-pupil"></div>
        </div>
        <div class="mascot-eyelid-bottom"></div>
      </div>
    </div>
  `;

  pupilEl = document.getElementById('mascot-pupil');
  eyeEl = document.getElementById('mascot-eye');
  speechEl = document.getElementById('mascot-speech');

  if (!eyeEl || !pupilEl) return;

  // Bind Mouse, Touch & Scroll Events
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('scroll', handleScroll, { passive: true });
  eyeEl.addEventListener('click', handleMascotClick);

  // Start Animation Loops
  requestAnimationFrame(animatePupil);
  scheduleBlink();
  schedulePeriodicSpeech();

  // Initial welcome greeting after 2 seconds
  setTimeout(() => {
    showSpeechBubble("hey.");
  }, 2000);
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
    const scrollSpeed = (scrollDelta / timeDelta) * 1000; // pixels per sec

    // If scrolling faster than 2200 px/sec and at least 7 sec since last scroll judgment
    if (scrollSpeed > 2200 && now - lastJudgementTime > 7000) {
      lastJudgementTime = now;
      judgeFastScroll();
    }

    lastScrollY = currentScrollY;
    lastScrollTime = now;
  }
}

/**
 * Trigger judging reaction when user scrolls fast
 */
function judgeFastScroll() {
  if (!eyeEl) return;

  // Apply squint / judging expression
  eyeEl.classList.add('squint');
  setTimeout(() => {
    if (eyeEl) eyeEl.classList.remove('squint');
  }, 2400);

  // Pick random judging speech line
  const line = FAST_SCROLL_DIALOGUES[Math.floor(Math.random() * FAST_SCROLL_DIALOGUES.length)];
  showSpeechBubble(line);
}

/**
 * Calculate smooth target coordinates for pupil tracking
 */
function handleMouseMove(e) {
  if (!eyeEl) return;

  const rect = eyeEl.getBoundingClientRect();
  const eyeCenterX = rect.left + rect.width / 2;
  const eyeCenterY = rect.top + rect.height / 2;

  const deltaX = e.clientX - eyeCenterX;
  const deltaY = e.clientY - eyeCenterY;
  const distance = Math.hypot(deltaX, deltaY);

  // Proximity Detection (< 150px)
  if (distance < 150 && !isMouseNear) {
    isMouseNear = true;
    eyeEl.classList.add('surprised');
    if (Math.random() < 0.4) {
      showSpeechBubble("hey, you're close!");
    }
  } else if (distance >= 150 && isMouseNear) {
    isMouseNear = false;
    eyeEl.classList.remove('surprised');
  }

  // Constrain max pupil offset distance inside sclera (~10px)
  const maxRadius = 10;
  const angle = Math.atan2(deltaY, deltaX);
  const pupilDistance = Math.min(distance * 0.1, maxRadius);

  targetPupilX = Math.cos(angle) * pupilDistance;
  targetPupilY = Math.sin(angle) * pupilDistance;
}

/**
 * Smooth Lerp pupil positioning frame loop
 */
function animatePupil() {
  if (pupilEl) {
    currentPupilX += (targetPupilX - currentPupilX) * 0.12;
    currentPupilY += (targetPupilY - currentPupilY) * 0.12;

    pupilEl.style.transform = `translate(${currentPupilX.toFixed(2)}px, ${currentPupilY.toFixed(2)}px)`;
  }
  requestAnimationFrame(animatePupil);
}

/**
 * Natural organic blinking timer
 */
function scheduleBlink() {
  const nextBlinkDelay = Math.random() * 3500 + 2500; // 2.5s to 6s

  setTimeout(() => {
    if (eyeEl) {
      eyeEl.classList.add('blinking');
      setTimeout(() => {
        eyeEl.classList.remove('blinking');

        // 15% chance of double-blink
        if (Math.random() < 0.15) {
          setTimeout(() => {
            if (eyeEl) {
              eyeEl.classList.add('blinking');
              setTimeout(() => eyeEl.classList.remove('blinking'), 100);
            }
          }, 120);
        }

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
  const delay = Math.random() * 20000 + 15000; // 15s to 35s

  setTimeout(() => {
    const now = Date.now();
    if (now - lastSpeechTime > 12000) {
      const line = DIALOGUE_LINES[Math.floor(Math.random() * DIALOGUE_LINES.length)];
      showSpeechBubble(line);
    }
    schedulePeriodicSpeech();
  }, delay);
}

/**
 * Click mascot handler (plays sound, triggers expression, speaks line)
 */
function handleMascotClick() {
  playClickSound(850, 0.04);

  if (!eyeEl) return;

  // Clear existing expressions
  EXPRESSIONS.forEach(exp => eyeEl.classList.remove(exp));

  // Pick random expression
  const randomExp = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
  eyeEl.classList.add(randomExp);

  setTimeout(() => {
    if (eyeEl) eyeEl.classList.remove(randomExp);
  }, 1200);

  // Pick random dialogue
  const line = DIALOGUE_LINES[Math.floor(Math.random() * DIALOGUE_LINES.length)];
  showSpeechBubble(line);
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
