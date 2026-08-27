/* ==========================================================================
   CatKeyLab - Sequence Memory Test (Simon Says 3x3 Grid)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, getAudioContext } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let sequence = [];
let userStep = 0;
let level = 1;
let state = 'start'; // 'start', 'showing', 'user_turn', 'game_over'
let displayTimeout = null;

// Frequencies for the 9 pads
const TONES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];

export function renderSequenceMemoryTest(container) {
  cleanupSequenceMemoryTest();

  const bestScore = localStorage.getItem('catkeylab_sequence_best') || '1';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🧠</span>
            <span data-i18n="sequenceTestTitle">${t('sequenceTestTitle') || 'Sequence Memory Test'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="sequenceTestSubtitle">
            ${t('sequenceTestSubtitle') || 'Remember an increasingly long pattern of button presses.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="sq-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="sq-val-level" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">${level}</div>
          <div class="stat-label">Level</div>
        </div>
        <div class="stat-box">
          <div id="sq-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${bestScore}</div>
          <div class="stat-label">Personal Best</div>
        </div>
      </div>

      <!-- Main Game Arena -->
      <div class="seq-game-container">
        <!-- Start / Game Over Overlay -->
        <div id="sq-overlay" class="seq-overlay">
          <div id="sq-overlay-content" class="seq-overlay-card">
            <div style="font-size:3rem; margin-bottom:0.5rem;">🧠</div>
            <h2 id="sq-overlay-title" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Sequence Memory</h2>
            <p id="sq-overlay-desc" style="color:var(--text-secondary); margin-bottom:1.5rem;">Memorize the glowing sequence and repeat it.</p>
            <button id="sq-start-btn" class="btn btn-primary btn-lg">Start Test</button>
          </div>
        </div>

        <!-- 3x3 Button Grid -->
        <div class="seq-grid">
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `
            <button class="seq-pad" data-index="${i}" aria-label="Pad ${i + 1}"></button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('sq-start-btn');
  const resetBtn = document.getElementById('sq-reset-btn');
  const pads = document.querySelectorAll('.seq-pad');

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupSequenceMemoryTest();
      startGame();
    });
  }

  pads.forEach(pad => {
    pad.addEventListener('click', () => {
      const idx = parseInt(pad.dataset.index);
      handlePadClick(idx);
    });
  });
}

function startGame() {
  sequence = [];
  level = 1;
  userStep = 0;
  state = 'showing';

  const overlay = document.getElementById('sq-overlay');
  if (overlay) overlay.style.display = 'none';

  document.getElementById('sq-val-level').textContent = level;

  addToSequence();
  playSequence();
}

function addToSequence() {
  const nextPad = Math.floor(Math.random() * 9);
  sequence.push(nextPad);
}

function playSequence() {
  state = 'showing';
  userStep = 0;

  let delay = 600;
  sequence.forEach((padIdx, i) => {
    displayTimeout = setTimeout(() => {
      flashPad(padIdx);
      if (i === sequence.length - 1) {
        displayTimeout = setTimeout(() => {
          state = 'user_turn';
        }, 500);
      }
    }, (i + 1) * delay);
  });
}

function flashPad(padIdx, isWrong = false) {
  const pad = document.querySelector(`.seq-pad[data-index="${padIdx}"]`);
  if (!pad) return;

  playTone(TONES[padIdx] || 440);

  if (isWrong) {
    pad.classList.add('wrong');
    setTimeout(() => pad.classList.remove('wrong'), 400);
  } else {
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 350);
  }
}

function handlePadClick(padIdx) {
  if (state !== 'user_turn') return;

  if (padIdx === sequence[userStep]) {
    // Correct step
    flashPad(padIdx);
    userStep++;

    if (userStep === sequence.length) {
      // Completed current level
      level++;
      document.getElementById('sq-val-level').textContent = level;
      saveBestScore(level);

      state = 'showing';
      displayTimeout = setTimeout(() => {
        addToSequence();
        playSequence();
      }, 800);
    }
  } else {
    // Wrong step - Game Over!
    flashPad(padIdx, true);
    handleGameOver();
  }
}

function handleGameOver() {
  state = 'game_over';
  saveBestScore(level);

  const rankInfo = submitScore('sequence-memory-test', level, `Level ${level}`);

  const bestScore = localStorage.getItem('catkeylab_sequence_best') || level;
  document.getElementById('sq-val-best').textContent = bestScore;

  const overlay = document.getElementById('sq-overlay');
  const title = document.getElementById('sq-overlay-title');
  const desc = document.getElementById('sq-overlay-desc');
  const startBtn = document.getElementById('sq-start-btn');

  if (title) title.textContent = `Game Over - Level ${level}`;
  if (desc) desc.innerHTML = `
    <div>Personal Best: <strong>Level ${bestScore}</strong></div>
    <div style="color:var(--accent-cyan); font-weight:700; margin-top:0.4rem; margin-bottom:0.75rem;">🏆 Rank #${rankInfo ? rankInfo.rank : '-'} • ${rankInfo ? rankInfo.percentile : ''}</div>
    <a href="#leaderboards" class="btn btn-secondary btn-sm" style="margin-bottom:0.75rem;">🏆 View Global Leaderboard</a>
  `;
  if (startBtn) startBtn.textContent = 'Try Again';

  if (overlay) overlay.style.display = 'flex';
}

function saveBestScore(currentLevel) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_sequence_best') || '1');
  if (currentLevel > currentBest) {
    localStorage.setItem('catkeylab_sequence_best', currentLevel);
  }
}

function playTone(freq) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export function cleanupSequenceMemoryTest() {
  if (displayTimeout) clearTimeout(displayTimeout);
  state = 'start';
}
