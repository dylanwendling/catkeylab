/* ==========================================================================
   ClickPulse - Monkeytype-Inspired Typing Speed Challenge Tool
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { judgeTypingSpeed } from '../components/eyeMascot.js';

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
    window.addEventListener('keydown', handleKeyDown);
  }

  resetTest();
}

function resetTest() {
  cleanupTimer();
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
}

function generateWordList() {
  generatedWords = [];
  for (let i = 0; i < 60; i++) {
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
  // Ignore modifier keys and shortcuts
  if (e.ctrlKey || e.altKey || e.metaKey || isTestFinished) return;

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

  playClickSound(1000, 0.08);

  const timeElapsedSec = testDuration;
  const finalWpm = Math.round((correctChars / 5) / (timeElapsedSec / 60));
  const finalAccuracy = Math.round((correctChars / Math.max(1, totalTypedChars)) * 100);

  // Update Personal Best
  const currentBest = parseInt(localStorage.getItem('clickpulse_best_wpm') || '0', 10);
  if (finalWpm > currentBest) {
    localStorage.setItem('clickpulse_best_wpm', finalWpm.toString());
    const bestEl = document.getElementById('tt-best-val');
    if (bestEl) bestEl.textContent = finalWpm;
  }

  // Trigger Eye Mascot Judging!
  judgeTypingSpeed(finalWpm, finalAccuracy);
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
  window.removeEventListener('keydown', handleKeyDown);
}
