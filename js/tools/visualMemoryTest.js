/* ==========================================================================
   CatKeyLab - Visual Memory Test (Spatial Grid Memory Recall)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let level = 1;
let gridSize = 3; // 3x3 up to 7x7
let targetCount = 3;
let targetTiles = new Set();
let selectedTiles = new Set();
let strikes = 0;
let state = 'start'; // 'start', 'showing', 'user_turn', 'game_over'
let displayTimeout = null;

export function renderVisualMemoryTest(container) {
  cleanupVisualMemoryTest();

  const savedBest = localStorage.getItem('catkeylab_visual_best') || '3';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🔳</span>
            <span data-i18n="visualTestTitle">${t('visualTestTitle') || 'Visual Memory Test'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="visualTestSubtitle">
            ${t('visualTestSubtitle') || 'Remember an increasingly large board of squares.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="vm-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="vm-val-level" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">Level 1</div>
          <div class="stat-label">Level</div>
        </div>
        <div class="stat-box">
          <div id="vm-val-strikes" class="stat-value" style="color:var(--accent-rose); font-size:2.2rem;">0 / 3</div>
          <div class="stat-label">Strikes</div>
        </div>
        <div class="stat-box">
          <div id="vm-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${savedBest}</div>
          <div class="stat-label">Personal Best Tiles</div>
        </div>
      </div>

      <!-- Visual Memory Board Arena -->
      <div class="vm-arena">
        <!-- Start / Game Over Overlay -->
        <div id="vm-overlay" class="vm-overlay">
          <div id="vm-overlay-card" class="vm-overlay-card">
            <div style="font-size:3.5rem; margin-bottom:0.5rem;">🔳</div>
            <h2 id="vm-overlay-title" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Visual Memory</h2>
            <p id="vm-overlay-desc" style="color:var(--text-secondary); margin-bottom:1.5rem;">Memorize the highlighted squares, then click them once they flip back.</p>
            <button id="vm-start-btn" class="btn btn-primary btn-lg">Start Test</button>
          </div>
        </div>

        <div id="vm-grid" class="vm-grid" style="--grid-dim: 3;"></div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('vm-start-btn');
  const resetBtn = document.getElementById('vm-reset-btn');

  if (startBtn) startBtn.addEventListener('click', startGame);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupVisualMemoryTest();
      startGame();
    });
  }
}

function startGame() {
  level = 1;
  gridSize = 3;
  targetCount = 3;
  strikes = 0;
  state = 'showing';

  updateDashboard();
  const overlay = document.getElementById('vm-overlay');
  if (overlay) overlay.style.display = 'none';

  setupRound();
}

function setupRound() {
  state = 'showing';
  selectedTiles.clear();
  targetTiles.clear();

  // Grid sizing logic
  gridSize = Math.min(7, 3 + Math.floor((level - 1) / 2));
  targetCount = 3 + (level - 1);

  const gridEl = document.getElementById('vm-grid');
  if (!gridEl) return;

  gridEl.style.setProperty('--grid-dim', gridSize);
  gridEl.innerHTML = '';

  const totalCells = gridSize * gridSize;

  // Pick random target cell indices
  const pool = Array.from({ length: totalCells }, (_, i) => i);
  for (let i = 0; i < targetCount; i++) {
    const randomIdxIdx = Math.floor(Math.random() * pool.length);
    const cellIdx = pool.splice(randomIdxIdx, 1)[0];
    targetTiles.add(cellIdx);
  }

  // Build cells
  for (let i = 0; i < totalCells; i++) {
    const tile = document.createElement('div');
    tile.className = 'vm-tile';
    tile.dataset.tileIdx = i;

    if (targetTiles.has(i)) {
      tile.classList.add('highlight');
    }

    tile.addEventListener('click', () => handleTileClick(tile, i));
    gridEl.appendChild(tile);
  }

  // Show highlighted tiles for 1.2s, then start user turn
  displayTimeout = setTimeout(() => {
    const tiles = gridEl.querySelectorAll('.vm-tile');
    tiles.forEach(t => t.classList.remove('highlight'));
    state = 'user_turn';
  }, 1200);
}

function handleTileClick(tile, tileIdx) {
  if (state !== 'user_turn' || selectedTiles.has(tileIdx)) return;

  selectedTiles.add(tileIdx);

  if (targetTiles.has(tileIdx)) {
    // Correct tile!
    playClickSound(800, 0.04);
    tile.classList.add('correct');

    if (selectedTiles.size === targetTiles.size) {
      // Completed level!
      saveBestScore(targetCount);
      level++;
      updateDashboard();
      state = 'showing';

      displayTimeout = setTimeout(setupRound, 600);
    }
  } else {
    // Wrong tile!
    playClickSound(300, 0.08);
    tile.classList.add('wrong');
    strikes++;
    updateDashboard();

    // Reveal target tiles
    targetTiles.forEach(idx => {
      const t = document.querySelector(`.vm-tile[data-tile-idx="${idx}"]`);
      if (t && !selectedTiles.has(idx)) {
        t.classList.add('missed');
      }
    });

    state = 'showing';

    if (strikes >= 3) {
      setTimeout(handleGameOver, 800);
    } else {
      setTimeout(setupRound, 1000);
    }
  }
}

function updateDashboard() {
  document.getElementById('vm-val-level').textContent = `Level ${level}`;
  document.getElementById('vm-val-strikes').textContent = `${strikes} / 3`;

  saveBestScore(targetCount);
  const best = localStorage.getItem('catkeylab_visual_best') || '3';
  document.getElementById('vm-val-best').textContent = best;
}

function handleGameOver() {
  state = 'game_over';

  const overlay = document.getElementById('vm-overlay');
  const title = document.getElementById('vm-overlay-title');
  const desc = document.getElementById('vm-overlay-desc');
  const startBtn = document.getElementById('vm-start-btn');

  const bestScore = localStorage.getItem('catkeylab_visual_best') || targetCount;

  if (title) title.textContent = `Game Over - Level ${level}`;
  if (desc) desc.textContent = `You reached ${targetCount} tiles remembered. Personal Best: ${bestScore}`;
  if (startBtn) startBtn.textContent = 'Try Again';

  if (overlay) overlay.style.display = 'flex';
}

function saveBestScore(tiles) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_visual_best') || '3');
  if (tiles > currentBest) {
    localStorage.setItem('catkeylab_visual_best', tiles);
  }
}

export function cleanupVisualMemoryTest() {
  if (displayTimeout) clearTimeout(displayTimeout);
  state = 'start';
}
