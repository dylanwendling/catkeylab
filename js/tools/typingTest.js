/* ==========================================================================
   ClickPulse - Monkeytype-Inspired Typing Speed Challenge Tool (Gamified)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { judgeTypingSpeed } from '../components/eyeMascot.js';
import { triggerRandomTool } from '../router.js';

const WORD_BANK = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "with",
  "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which",
  "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no",
  "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state",
  "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then",
  "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day",
  "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where",
  "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel",
  "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old",
  "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call",
  "system", "right", "number", "part", "small", "every", "field", "large", "point", "turned", "asked"
];

let testDuration = 30; // 15, 30, or 60
let timeRemaining = 30;
let timerInterval = null;

let generatedWords = [];
let currentWordIndex = 0;
let currentLetterIndex = 0;

let totalTypedChars = 0;
let correctChars = 0;
let errorCount = 0;
let isTestActive = false;
let isTestFinished = false;

let confettiAnimationId = null;

export function renderTypingTest(container) {
  cleanupTypingTest();

  const savedBest = localStorage.getItem('clickpulse_best_wpm') || '0';

  container.innerHTML = `
    <div class="tool-wrapper" style="border:1px solid var(--accent-cyan-glow);">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">⌨️⚡</span>
            <span data-i18n="typingTestTitle">${t('typingTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text">Distraction-free, minimal typing speed test. Type words smoothly and let the Eye Mascot judge your WPM!</p>
        </div>
        <div class="header-actions">
          <div style="display:flex; gap:0.5rem; background:var(--bg-tertiary); padding:0.25rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <button class="btn btn-sm mode-btn active" data-time="15">15s</button>
            <button class="btn btn-sm mode-btn" data-time="30">30s</button>
            <button class="btn btn-sm mode-btn" data-time="60">60s</button>
          </div>
          <button id="tt-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Live Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="tt-timer-val" class="stat-value" style="color:var(--accent-amber); font-size:2rem;">${testDuration}s</div>
          <div class="stat-label">Time Remaining</div>
        </div>
        <div class="stat-box">
          <div id="tt-wpm-val" class="stat-value" style="color:var(--accent-cyan); font-size:2rem;">0</div>
          <div class="stat-label">WPM (Words / Min)</div>
        </div>
        <div class="stat-box">
          <div id="tt-acc-val" class="stat-value" style="color:var(--accent-emerald); font-size:2rem;">100%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-box">
          <div id="tt-best-val" class="stat-value" style="color:var(--accent-primary); font-size:2rem;">${savedBest}</div>
          <div class="stat-label">Personal Best WPM</div>
        </div>
      </div>

      <!-- Monkeytype-Style Words Display Canvas -->
      <div id="typing-test-box" class="typing-box" tabindex="0">
        <div id="typing-words-wrapper" class="typing-words-wrapper"></div>
        <div id="typing-focus-notice" class="typing-focus-notice">
          <span>Click here or press any key to focus & start typing</span>
        </div>
      </div>
    </div>

    <!-- Gamified Results Modal Container -->
    <div id="typing-results-modal" class="modal-overlay"></div>
    <canvas id="confetti-canvas" class="confetti-canvas"></canvas>
  `;

  initTypingTestLogic();
}

function initTypingTestLogic() {
  const box = document.getElementById('typing-test-box');
  const resetBtn = document.getElementById('tt-reset-btn');
  const modeBtns = document.querySelectorAll('.mode-btn');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      testDuration = parseInt(btn.dataset.time, 10);
      resetTest();
    });
  });

  if (resetBtn) resetBtn.addEventListener('click', resetTest);
  if (box) {
    box.addEventListener('focus', () => hideFocusNotice());
    box.addEventListener('blur', () => showFocusNotice());
  }

  window.addEventListener('keydown', handleKeyDown);
  resetTest();
}

function resetTest() {
  cleanupTimer();
  cleanupConfetti();
  closeResultsModal();

  isTestActive = false;
  isTestFinished = false;
  timeRemaining = testDuration;
  currentWordIndex = 0;
  currentLetterIndex = 0;
  totalTypedChars = 0;
  correctChars = 0;
  errorCount = 0;

  const timerEl = document.getElementById('tt-timer-val');
  const wpmEl = document.getElementById('tt-wpm-val');
  const accEl = document.getElementById('tt-acc-val');

  if (timerEl) timerEl.textContent = `${testDuration}s`;
  if (wpmEl) wpmEl.textContent = '0';
  if (accEl) accEl.textContent = '100%';

  generateWordList();
  renderWords();

  const box = document.getElementById('typing-test-box');
  if (box) box.focus();
}

function generateWordList() {
  generatedWords = [];
  for (let i = 0; i < 70; i++) {
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    generatedWords.push(word);
  }
}

function renderWords() {
  const wrapper = document.getElementById('typing-words-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = generatedWords.map((word, wIdx) => {
    const letters = word.split('').map((char, lIdx) => {
      let activeClass = (wIdx === 0 && lIdx === 0) ? 'current-letter' : '';
      return `<span class="tp-letter ${activeClass}" data-char="${char}">${char}</span>`;
    }).join('');
    return `<div class="tp-word ${wIdx === 0 ? 'current-word' : ''}">${letters}</div>`;
  }).join('');
}

function handleKeyDown(e) {
  // Restart shortcut on Enter when finished
  if (isTestFinished) {
    if (e.key === 'Enter') {
      e.preventDefault();
      resetTest();
    }
    return;
  }

  // Ignore modifier keys
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const isLetter = e.key.length === 1;
  const isBackspace = e.key === 'Backspace';

  if (!isLetter && !isBackspace) return;

  e.preventDefault();

  if (!isTestActive) {
    startTimer();
  }

  playClickSound(650, 0.02);

  const wordEls = document.querySelectorAll('.tp-word');
  if (currentWordIndex >= wordEls.length) return;

  const currentWordEl = wordEls[currentWordIndex];
  const letterEls = currentWordEl.querySelectorAll('.tp-letter');

  if (isBackspace) {
    if (currentLetterIndex > 0) {
      currentLetterIndex--;
      const letter = letterEls[currentLetterIndex];
      letter.classList.remove('correct', 'incorrect', 'current-letter');
      letter.classList.add('current-letter');

      if (currentLetterIndex + 1 < letterEls.length) {
        letterEls[currentLetterIndex + 1].classList.remove('current-letter');
      }
    }
    return;
  }

  // Handle Character Input
  if (currentLetterIndex < letterEls.length) {
    const targetChar = letterEls[currentLetterIndex].dataset.char;
    totalTypedChars++;

    if (e.key === targetChar) {
      correctChars++;
      letterEls[currentLetterIndex].classList.add('correct');
    } else {
      errorCount++;
      letterEls[currentLetterIndex].classList.add('incorrect');
    }

    letterEls[currentLetterIndex].classList.remove('current-letter');
    currentLetterIndex++;

    if (currentLetterIndex < letterEls.length) {
      letterEls[currentLetterIndex].classList.add('current-letter');
    }
  } else if (e.key === ' ') {
    // Move to next word on spacebar
    currentWordEl.classList.remove('current-word');
    currentWordIndex++;
    currentLetterIndex = 0;

    if (currentWordIndex < wordEls.length) {
      const nextWordEl = wordEls[currentWordIndex];
      nextWordEl.classList.add('current-word');
      const nextLetters = nextWordEl.querySelectorAll('.tp-letter');
      if (nextLetters.length > 0) nextLetters[0].classList.add('current-letter');
    }
  }

  updateLiveStats();
}

function startTimer() {
  isTestActive = true;
  timerInterval = setInterval(() => {
    timeRemaining--;
    const timerEl = document.getElementById('tt-timer-val');
    if (timerEl) timerEl.textContent = `${timeRemaining}s`;

    updateLiveStats();

    if (timeRemaining <= 0) {
      finishTest();
    }
  }, 1000);
}

function updateLiveStats() {
  const timeElapsedSec = Math.max(1, testDuration - timeRemaining);
  const wpm = Math.round((correctChars / 5) / (timeElapsedSec / 60));
  const accuracy = Math.round((correctChars / Math.max(1, totalTypedChars)) * 100);

  const wpmEl = document.getElementById('tt-wpm-val');
  const accEl = document.getElementById('tt-acc-val');

  if (wpmEl) wpmEl.textContent = wpm;
  if (accEl) accEl.textContent = `${accuracy}%`;
}

function finishTest() {
  cleanupTimer();
  isTestActive = false;
  isTestFinished = true;

  // Play Fanfare Chime Sequence
  playClickSound(523.25, 0.08); // C5
  setTimeout(() => playClickSound(659.25, 0.08), 90); // E5
  setTimeout(() => playClickSound(783.99, 0.12), 180); // G5

  const timeElapsedSec = testDuration;
  const finalWpm = Math.round((correctChars / 5) / (timeElapsedSec / 60));
  const rawWpm = Math.round((totalTypedChars / 5) / (timeElapsedSec / 60));
  const finalAccuracy = Math.round((correctChars / Math.max(1, totalTypedChars)) * 100);

  // Update Personal Best
  const currentBest = parseInt(localStorage.getItem('clickpulse_best_wpm') || '0', 10);
  const isNewHigh = finalWpm > currentBest;
  if (isNewHigh) {
    localStorage.setItem('clickpulse_best_wpm', finalWpm.toString());
    const bestEl = document.getElementById('tt-best-val');
    if (bestEl) bestEl.textContent = finalWpm;
  }

  // Trigger Eye Mascot Judging
  judgeTypingSpeed(finalWpm, finalAccuracy);

  // Trigger Canvas Confetti Explosion
  triggerConfetti();

  // Show High-Energy Results Modal
  showResultsModal(finalWpm, rawWpm, finalAccuracy, errorCount, isNewHigh);
}

/**
 * Render Gamified Results Modal Popup
 */
function showResultsModal(wpm, rawWpm, accuracy, errors, isNewHigh) {
  const modalEl = document.getElementById('typing-results-modal');
  if (!modalEl) return;

  // Determine Rank Tier
  let rankClass = 'rank-casual';
  let rankTitle = '⌨️ CASUAL TYPIST';

  if (wpm >= 100) {
    rankClass = 'rank-godlike';
    rankTitle = '🏆 GODLIKE TYPIST';
  } else if (wpm >= 65) {
    rankClass = 'rank-speed';
    rankTitle = '⚡ SPEED DEMON';
  } else if (wpm >= 45) {
    rankClass = 'rank-pro';
    rankTitle = '🎯 PRO TYPIST';
  } else if (wpm >= 25) {
    rankClass = 'rank-casual';
    rankTitle = '⌨️ CASUAL TYPIST';
  } else {
    rankClass = 'rank-novice';
    rankTitle = '🐣 NOVICE TYPIST';
  }

  modalEl.innerHTML = `
    <div class="modal-card typing-modal-card">
      ${isNewHigh ? '<div class="new-record-banner">🔥 NEW PERSONAL BEST SCORE! 🔥</div>' : ''}
      <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.25rem;">Test Complete!</h2>
      <div class="rank-badge-pill ${rankClass}">${rankTitle}</div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="font-size:2.2rem; font-weight:800; color:var(--accent-cyan);">${wpm}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Final WPM</div>
        </div>
        <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="font-size:2.2rem; font-weight:800; color:var(--accent-emerald);">${accuracy}%</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Accuracy</div>
        </div>
        <div style="background:var(--bg-primary); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="font-size:1.2rem; font-weight:700; color:var(--text-primary);">${rawWpm}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Raw WPM</div>
        </div>
        <div style="background:var(--bg-primary); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="font-size:1.2rem; font-weight:700; color:var(--accent-rose);">${errors}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Typos / Errors</div>
        </div>
      </div>

      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
        <button id="modal-retry-btn" class="btn btn-primary btn-lg" style="flex:1; min-width:180px;">
          🎮 Try Again (Enter)
        </button>
        <button id="modal-surprise-btn" class="btn btn-surprise btn-lg" style="flex:1; min-width:180px;">
          🎲 Try Random Tool
        </button>
      </div>
    </div>
  `;

  modalEl.classList.add('open');

  const retryBtn = document.getElementById('modal-retry-btn');
  const surpriseBtn = document.getElementById('modal-surprise-btn');

  if (retryBtn) retryBtn.addEventListener('click', resetTest);
  if (surpriseBtn) surpriseBtn.addEventListener('click', triggerRandomTool);
}

function closeResultsModal() {
  const modalEl = document.getElementById('typing-results-modal');
  if (modalEl) modalEl.classList.remove('open');
}

/**
 * Canvas Confetti Particle Generator
 */
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#39c5bb', '#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 6
    });
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y > canvas.height) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    }
  }

  renderConfetti();
}

function cleanupConfetti() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
  }
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function hideFocusNotice() {
  const notice = document.getElementById('typing-focus-notice');
  if (notice) notice.style.display = 'none';
}

function showFocusNotice() {
  const notice = document.getElementById('typing-focus-notice');
  if (notice && !isTestActive) notice.style.display = 'flex';
}

function cleanupTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function cleanupTypingTest() {
  cleanupTimer();
  cleanupConfetti();
  closeResultsModal();
  window.removeEventListener('keydown', handleKeyDown);
}
