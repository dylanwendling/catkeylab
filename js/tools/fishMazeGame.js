/* ==========================================================================
   CatKeyLab - Help Nibbles Find the Fish Maze Game
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, playSuccessSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let mazeGrid = [];
let gridRows = 10;
let gridCols = 10;
let playerPos = { r: 0, c: 0 };
let fishPos = { r: gridRows - 1, c: gridCols - 1 };
let movesCount = 0;
let startTime = 0;
let timerInterval = null;
let isPlaying = false;
let keyListenerBound = false;

export function renderFishMazeGame(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:800px; margin:0 auto; text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
          <span style="font-size:2.2rem;">🐟</span>
          <h1 style="font-size:2rem; font-weight:800;">Help Nibbles Find the Fish Maze</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1.5rem;">
          Guide Nibbles 🐱 through the maze to reach the delicious Fish 🐟! Use Arrow keys, WASD, or on-screen D-Pad.
        </p>

        <!-- Live Dashboard -->
        <div class="stats-dashboard" style="max-width:500px; margin:0 auto 1.5rem auto;">
          <div class="stat-box">
            <div id="fm-moves" class="stat-value">0</div>
            <div class="stat-label">Moves Taken</div>
          </div>
          <div class="stat-box">
            <div id="fm-timer" class="stat-value">0.0s</div>
            <div class="stat-label">Time Elapsed</div>
          </div>
        </div>

        <!-- Maze Grid Container -->
        <div class="maze-container-wrapper" style="display:flex; justify-content:center; margin-bottom:1.5rem;">
          <div id="fm-maze-board" class="maze-board"></div>
        </div>

        <!-- Touch D-Pad Controls -->
        <div class="maze-dpad" style="display:inline-flex; flex-direction:column; align-items:center; gap:0.4rem; margin-bottom:1.5rem;">
          <button id="fm-dpad-up" class="btn btn-secondary" style="width:55px; height:50px; font-size:1.2rem;">⬆️</button>
          <div style="display:flex; gap:0.4rem;">
            <button id="fm-dpad-left" class="btn btn-secondary" style="width:55px; height:50px; font-size:1.2rem;">⬅️</button>
            <button id="fm-dpad-down" class="btn btn-secondary" style="width:55px; height:50px; font-size:1.2rem;">⬇️</button>
            <button id="fm-dpad-right" class="btn btn-secondary" style="width:55px; height:50px; font-size:1.2rem;">➡️</button>
          </div>
        </div>

        <div>
          <button id="fm-reset-btn" class="btn btn-primary btn-lg">🎲 New Maze Game</button>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <div id="fm-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center;">
        <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">🐟 Yummy! Nibbles Found the Fish!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">Nibbles purrs happily and thanks you for solving the maze!</p>

        <div class="stats-dashboard" style="margin-bottom:1.5rem;">
          <div class="stat-box">
            <div id="fm-modal-time" class="stat-value">0.0s</div>
            <div class="stat-label">Time Taken</div>
          </div>
          <div class="stat-box">
            <div id="fm-modal-moves" class="stat-value">0</div>
            <div class="stat-label">Total Moves</div>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="fm-modal-retry" class="btn btn-primary btn-lg" style="flex:1; min-width:140px;">Play Again</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 View Leaderboard</a>
        </div>
      </div>
    </div>
  `;

  initGame();
  bindEvents();
}

function generateMaze(rows, cols) {
  // Initialize grid with 4 walls per cell: [Top, Right, Bottom, Left]
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      visited: false,
      walls: [true, true, true, true]
    }))
  );

  const stack = [];
  const start = { r: 0, c: 0 };
  grid[start.r][start.c].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    const dirs = [
      { r: -1, c: 0, wall: 0, opp: 2 }, // Top
      { r: 0, c: 1, wall: 1, opp: 3 },  // Right
      { r: 1, c: 0, wall: 2, opp: 0 },  // Bottom
      { r: 0, c: -1, wall: 3, opp: 1 }  // Left
    ];

    dirs.forEach(d => {
      const nr = current.r + d.r;
      const nc = current.c + d.c;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
        neighbors.push({ r: nr, c: nc, dir: d });
      }
    });

    if (neighbors.length > 0) {
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[current.r][current.c].walls[chosen.dir.wall] = false;
      grid[chosen.r][chosen.c].walls[chosen.dir.opp] = false;
      grid[chosen.r][chosen.c].visited = true;
      stack.push({ r: chosen.r, c: chosen.c });
    } else {
      stack.pop();
    }
  }

  return grid;
}

function initGame() {
  if (timerInterval) clearInterval(timerInterval);
  isPlaying = false;
  movesCount = 0;
  startTime = 0;
  playerPos = { r: 0, c: 0 };
  fishPos = { r: gridRows - 1, c: gridCols - 1 };

  const movesEl = document.getElementById('fm-moves');
  const timerEl = document.getElementById('fm-timer');
  if (movesEl) movesEl.textContent = '0';
  if (timerEl) timerEl.textContent = '0.0s';

  mazeGrid = generateMaze(gridRows, gridCols);
  renderBoard();
}

function renderBoard() {
  const board = document.getElementById('fm-maze-board');
  if (!board) return;

  board.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
  board.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
  board.innerHTML = '';

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const cell = document.createElement('div');
      cell.className = 'maze-cell';

      const walls = mazeGrid[r][c].walls;
      if (walls[0]) cell.classList.add('wall-top');
      if (walls[1]) cell.classList.add('wall-right');
      if (walls[2]) cell.classList.add('wall-bottom');
      if (walls[3]) cell.classList.add('wall-left');

      if (r === playerPos.r && c === playerPos.c) {
        cell.classList.add('cell-player');
        cell.innerHTML = '<span class="cell-emoji">🐱</span>';
      } else if (r === fishPos.r && c === fishPos.c) {
        cell.classList.add('cell-fish');
        cell.innerHTML = '<span class="cell-emoji">🐟</span>';
      }

      board.appendChild(cell);
    }
  }
}

function movePlayer(dr, dc) {
  const currentCell = mazeGrid[playerPos.r][playerPos.c];
  
  // Direction wall check: 0=Top, 1=Right, 2=Bottom, 3=Left
  let wallIdx = -1;
  if (dr === -1 && dc === 0) wallIdx = 0;
  else if (dr === 0 && dc === 1) wallIdx = 1;
  else if (dr === 1 && dc === 0) wallIdx = 2;
  else if (dr === 0 && dc === -1) wallIdx = 3;

  if (wallIdx !== -1 && currentCell.walls[wallIdx]) {
    return; // Blocked by wall
  }

  const newR = playerPos.r + dr;
  const newC = playerPos.c + dc;

  if (newR >= 0 && newR < gridRows && newC >= 0 && newC < gridCols) {
    if (!isPlaying) {
      isPlaying = true;
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 100);
    }

    playerPos = { r: newR, c: newC };
    movesCount++;

    const movesEl = document.getElementById('fm-moves');
    if (movesEl) movesEl.textContent = movesCount;

    playClickSound(600, 0.02);
    renderBoard();

    // Check Win Condition
    if (playerPos.r === fishPos.r && playerPos.c === fishPos.c) {
      finishGame();
    }
  }
}

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  const timerEl = document.getElementById('fm-timer');
  if (timerEl) timerEl.textContent = `${elapsed.toFixed(1)}s`;
}

function finishGame() {
  clearInterval(timerInterval);
  isPlaying = false;

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  playSuccessSound();

  // Score submission (Lower time is better)
  if (parseFloat(totalTime) > 0) {
    submitScore('fish-maze-game', parseFloat(totalTime), `${totalTime}s (${movesCount} moves)`);
  }

  document.getElementById('fm-modal-time').textContent = `${totalTime}s`;
  document.getElementById('fm-modal-moves').textContent = movesCount;
  document.getElementById('fm-modal').classList.add('open');
}

function bindEvents() {
  const resetBtn = document.getElementById('fm-reset-btn');
  const modalRetry = document.getElementById('fm-modal-retry');

  if (resetBtn) resetBtn.addEventListener('click', initGame);
  if (modalRetry) {
    modalRetry.addEventListener('click', () => {
      document.getElementById('fm-modal').classList.remove('open');
      initGame();
    });
  }

  // D-Pad Touch Listeners
  const btnUp = document.getElementById('fm-dpad-up');
  const btnDown = document.getElementById('fm-dpad-down');
  const btnLeft = document.getElementById('fm-dpad-left');
  const btnRight = document.getElementById('fm-dpad-right');

  if (btnUp) btnUp.addEventListener('click', () => movePlayer(-1, 0));
  if (btnDown) btnDown.addEventListener('click', () => movePlayer(1, 0));
  if (btnLeft) btnLeft.addEventListener('click', () => movePlayer(0, -1));
  if (btnRight) btnRight.addEventListener('click', () => movePlayer(0, 1));

  // Keyboard Event Listener
  if (!keyListenerBound) {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
    });
    keyListenerBound = true;
  }
}

export function cleanupFishMazeGame() {
  if (timerInterval) clearInterval(timerInterval);
}
