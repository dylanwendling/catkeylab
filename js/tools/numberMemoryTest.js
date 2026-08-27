/* ==========================================================================
   CatKeyLab - Number Memory Test (Digit Span Recall Challenge)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let level = 1;
let currentNumber = '';
let state = 'start'; // 'start', 'showing', 'input', 'result', 'game_over'
let timerTimeout = null;

export function renderNumberMemoryTest(container) {
  cleanupNumberMemoryTest();

  const savedBest = localStorage.getItem('catkeylab_number_best') || '0';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🔢</span>
            <span data-i18n="numberTestTitle">${t('numberTestTitle') || 'Number Memory'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="numberTestSubtitle">
            ${t('numberTestSubtitle') || 'Remember the longest number sequence you can.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="nm-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="nm-val-digits" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">${level}</div>
          <div class="stat-label">Digits</div>
        </div>
        <div class="stat-box">
          <div id="nm-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${savedBest}</div>
          <div class="stat-label">Personal Best Digits</div>
        </div>
      </div>

      <!-- Main Game Card -->
      <div class="nm-card">
        <!-- Start Phase -->
        <div id="nm-start-view" class="nm-view">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">🔢</div>
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Number Memory</h2>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">The average person can remember 7 numbers at once. Can you do more?</p>
          <button id="nm-start-btn" class="btn btn-primary btn-lg">Start Test</button>
        </div>

        <!-- Showing Number Phase -->
        <div id="nm-show-view" class="nm-view" style="display:none;">
          <div id="nm-number-display" class="nm-number-text">0</div>
          <div class="nm-progress-bar-container">
            <div id="nm-progress-fill" class="nm-progress-fill"></div>
          </div>
        </div>

        <!-- User Input Phase -->
        <div id="nm-input-view" class="nm-view" style="display:none;">
          <h3 style="font-size:1.4rem; font-weight:700; margin-bottom:1rem;">What was the number?</h3>
          <form id="nm-form" style="display:flex; flex-direction:column; align-items:center; gap:1rem; width:100%; max-width:360px;">
            <input type="text" id="nm-user-input" class="form-input nm-input-field" autocomplete="off" autofocus placeholder="Type digits here...">
            <button type="submit" class="btn btn-primary btn-block">Submit</button>
          </form>
        </div>

        <!-- Game Over Result View -->
        <div id="nm-result-view" class="nm-view" style="display:none;">
          <div id="nm-result-icon" style="font-size:3.5rem; margin-bottom:0.5rem;">❌</div>
          <h2 id="nm-result-title" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Number</h2>
          <div style="margin-bottom:1.25rem;">
            <div style="color:var(--text-muted); font-size:0.9rem;">NUMBER SHOWN:</div>
            <div id="nm-shown-val" style="font-size:1.6rem; font-weight:700; color:var(--text-primary); text-decoration:line-through;">123</div>
            <div style="color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem;">YOUR ANSWER:</div>
            <div id="nm-user-val" style="font-size:1.6rem; font-weight:700; color:var(--accent-rose);">124</div>
          </div>
          <h3 id="nm-level-score" style="font-size:1.3rem; margin-bottom:1.5rem; color:var(--accent-cyan);">Level 1</h3>
          <button id="nm-retry-btn" class="btn btn-primary btn-lg">Try Again</button>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('nm-start-btn');
  const retryBtn = document.getElementById('nm-retry-btn');
  const resetBtn = document.getElementById('nm-reset-btn');
  const form = document.getElementById('nm-form');

  if (startBtn) startBtn.addEventListener('click', startTest);
  if (retryBtn) retryBtn.addEventListener('click', startTest);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupNumberMemoryTest();
      startTest();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit();
    });
  }
}

function startTest() {
  level = 1;
  state = 'showing';
  showLevel();
}

function showLevel() {
  state = 'showing';
  document.getElementById('nm-val-digits').textContent = level;

  // Generate random number of length `level`
  currentNumber = generateRandomNumber(level);

  // Switch views
  hideAllViews();
  const showView = document.getElementById('nm-show-view');
  if (showView) showView.style.display = 'flex';

  const numDisplay = document.getElementById('nm-number-display');
  if (numDisplay) numDisplay.textContent = currentNumber;

  // Progress animation
  const fill = document.getElementById('nm-progress-fill');
  const duration = 1800 + (level * 400); // base 1.8s + 0.4s per digit

  if (fill) {
    fill.style.transition = 'none';
    fill.style.width = '100%';
    setTimeout(() => {
      fill.style.transition = `width ${duration}ms linear`;
      fill.style.width = '0%';
    }, 20);
  }

  timerTimeout = setTimeout(() => {
    promptInput();
  }, duration + 50);
}

function promptInput() {
  state = 'input';
  hideAllViews();

  const inputView = document.getElementById('nm-input-view');
  if (inputView) inputView.style.display = 'flex';

  const inputEl = document.getElementById('nm-user-input');
  if (inputEl) {
    inputEl.value = '';
    inputEl.focus();
  }
}

function handleSubmit() {
  if (state !== 'input') return;

  const inputEl = document.getElementById('nm-user-input');
  const userInput = inputEl ? inputEl.value.trim() : '';

  if (userInput === currentNumber) {
    // Correct! Level up!
    playClickSound(800, 0.05);
    level++;
    saveBestScore(level - 1);
    showLevel();
  } else {
    // Wrong! Game Over!
    playClickSound(300, 0.08);
    saveBestScore(level - 1);
    showGameOver(userInput);
  }
}

function showGameOver(userInput) {
  state = 'game_over';
  hideAllViews();

  const resultView = document.getElementById('nm-result-view');
  if (resultView) resultView.style.display = 'flex';

  const achievedDigits = level - 1;
  const rankInfo = achievedDigits > 0 ? submitScore('number-memory-test', achievedDigits, `${achievedDigits} Digits`) : null;

  const bestScore = localStorage.getItem('catkeylab_number_best') || achievedDigits;
  document.getElementById('nm-val-best').textContent = bestScore;

  document.getElementById('nm-shown-val').textContent = currentNumber;
  document.getElementById('nm-user-val').textContent = userInput || '(empty)';
  document.getElementById('nm-level-score').innerHTML = `
    <div>Level ${achievedDigits} (${achievedDigits} digits) • Personal Best: ${bestScore}</div>
    <div style="color:var(--accent-cyan); font-size:1rem; font-weight:700; margin-top:0.4rem; margin-bottom:0.75rem;">🏆 Rank #${rankInfo ? rankInfo.rank : '-'} • ${rankInfo ? rankInfo.percentile : ''}</div>
    <a href="#leaderboards" class="btn btn-secondary btn-sm" style="margin-bottom:0.75rem;">🏆 View Global Leaderboard</a>
  `;
}

function hideAllViews() {
  ['nm-start-view', 'nm-show-view', 'nm-input-view', 'nm-result-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function generateRandomNumber(length) {
  let result = '';
  // First digit should be 1-9
  result += Math.floor(Math.random() * 9) + 1;
  for (let i = 1; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function saveBestScore(digits) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_number_best') || '0');
  if (digits > currentBest) {
    localStorage.setItem('catkeylab_number_best', digits);
  }
}

export function cleanupNumberMemoryTest() {
  if (timerTimeout) clearTimeout(timerTimeout);
  state = 'start';
}
