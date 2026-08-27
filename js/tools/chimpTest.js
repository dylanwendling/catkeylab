/* ==========================================================================
   CatKeyLab - Chimp Test (Are You Smarter Than a Chimpanzee?)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let numberCount = 4;
let nextExpected = 1;
let strikes = 0;
let isHidden = false;
let state = 'start'; // 'start', 'playing', 'game_over'
let gridPositions = [];

const GRID_ROWS = 5;
const GRID_COLS = 8;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

export function renderChimpTest(container) {
  cleanupChimpTest();

  const savedBest = localStorage.getItem('catkeylab_chimp_best') || '4';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🐒</span>
            <span data-i18n="chimpTestTitle">${t('chimpTestTitle') || 'Chimp Test'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="chimpTestSubtitle">
            ${t('chimpTestSubtitle') || 'Are you smarter than a chimpanzee? Test working memory.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="cp-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="cp-val-numbers" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">4</div>
          <div class="stat-label">Numbers</div>
        </div>
        <div class="stat-box">
          <div id="cp-val-strikes" class="stat-value" style="color:var(--accent-rose); font-size:2.2rem;">0 / 3</div>
          <div class="stat-label">Strikes</div>
        </div>
        <div class="stat-box">
          <div id="cp-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${savedBest}</div>
          <div class="stat-label">Personal Best Numbers</div>
        </div>
      </div>

      <!-- Main Game Arena -->
      <div class="cp-arena">
        <!-- Start / Game Over Overlay -->
        <div id="cp-overlay" class="cp-overlay">
          <div id="cp-overlay-card" class="cp-overlay-card">
            <div style="font-size:3.5rem; margin-bottom:0.5rem;">🐒</div>
            <h2 id="cp-overlay-title" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Chimp Test</h2>
            <p id="cp-overlay-desc" style="color:var(--text-secondary); margin-bottom:1.5rem;">Click the squares in numerical order (1, 2, 3...). The numbers will hide after you click 1!</p>
            <button id="cp-start-btn" class="btn btn-primary btn-lg">Start Test</button>
          </div>
        </div>

        <!-- 5x8 Grid -->
        <div class="cp-grid">
          ${Array.from({ length: TOTAL_CELLS }).map((_, i) => `
            <div class="cp-cell" data-cell-idx="${i}"></div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('cp-start-btn');
  const resetBtn = document.getElementById('cp-reset-btn');

  if (startBtn) startBtn.addEventListener('click', startGame);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupChimpTest();
      startGame();
    });
  }
}

function startGame() {
  numberCount = 4;
  strikes = 0;
  state = 'playing';

  updateDashboard();
  const overlay = document.getElementById('cp-overlay');
  if (overlay) overlay.style.display = 'none';

  setupLevel();
}

function setupLevel() {
  nextExpected = 1;
  isHidden = false;

  // Clear all cells
  const cells = document.querySelectorAll('.cp-cell');
  cells.forEach(c => {
    c.innerHTML = '';
    c.className = 'cp-cell';
  });

  // Pick random unique cell indices for `numberCount`
  const pool = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
  gridPositions = [];

  for (let num = 1; num <= numberCount; num++) {
    const randomIdxIdx = Math.floor(Math.random() * pool.length);
    const cellIdx = pool.splice(randomIdxIdx, 1)[0];
    gridPositions.push({ num, cellIdx });

    const cell = document.querySelector(`.cp-cell[data-cell-idx="${cellIdx}"]`);
    if (cell) {
      cell.classList.add('has-number');
      cell.dataset.num = num;
      cell.textContent = num;

      cell.onclick = () => handleTileClick(cell, num);
    }
  }
}

function handleTileClick(cell, num) {
  if (state !== 'playing') return;

  if (num === nextExpected) {
    // Correct tile!
    playClickSound(800, 0.04);
    cell.classList.remove('has-number', 'hidden-square');
    cell.classList.add('empty-cleared');
    cell.textContent = '';
    cell.onclick = null;

    if (nextExpected === 1) {
      // Hide remaining numbers!
      isHidden = true;
      hideRemainingNumbers();
    }

    nextExpected++;

    if (nextExpected > numberCount) {
      // Level cleared! Advance!
      saveBestScore(numberCount);
      numberCount++;
      updateDashboard();
      setTimeout(setupLevel, 400);
    }
  } else {
    // Wrong tile clicked!
    playClickSound(300, 0.08);
    cell.classList.add('wrong');
    strikes++;
    updateDashboard();

    if (strikes >= 3) {
      handleGameOver();
    } else {
      setTimeout(setupLevel, 600);
    }
  }
}

function hideRemainingNumbers() {
  const cells = document.querySelectorAll('.cp-cell.has-number');
  cells.forEach(c => {
    c.classList.add('hidden-square');
    c.textContent = '';
  });
}

function updateDashboard() {
  document.getElementById('cp-val-numbers').textContent = numberCount;
  document.getElementById('cp-val-strikes').textContent = `${strikes} / 3`;

  saveBestScore(numberCount - 1);
  const best = localStorage.getItem('catkeylab_chimp_best') || '4';
  document.getElementById('cp-val-best').textContent = best;
}

function handleGameOver() {
  state = 'game_over';

  const scoreNum = numberCount - 1;
  const rankInfo = scoreNum > 0 ? submitScore('chimp-test', scoreNum, `${scoreNum} Numbers`) : null;

  const overlay = document.getElementById('cp-overlay');
  const title = document.getElementById('cp-overlay-title');
  const desc = document.getElementById('cp-overlay-desc');
  const startBtn = document.getElementById('cp-start-btn');

  const bestScore = localStorage.getItem('catkeylab_chimp_best') || scoreNum;

  if (title) title.textContent = `Game Over - ${scoreNum} Numbers`;
  if (desc) desc.innerHTML = `Personal Best: <strong>${bestScore} Numbers</strong><br><span style="color:var(--accent-cyan); font-weight:700;">🏆 Rank #${rankInfo ? rankInfo.rank : '-'} • ${rankInfo ? rankInfo.percentile : ''}</span>`;
  if (startBtn) startBtn.textContent = 'Try Again';

  if (overlay) overlay.style.display = 'flex';
}

function saveBestScore(score) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_chimp_best') || '4');
  if (score > currentBest) {
    localStorage.setItem('catkeylab_chimp_best', score);
  }
}

export function cleanupChimpTest() {
  state = 'start';
}
