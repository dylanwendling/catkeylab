/* ==========================================================================
   CatKeyLab - Cat Battleship vs AI Nibbles Game
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, playSuccessSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

const SHIPS = [
  { name: 'Cardboard Fort 🏰', size: 5, icon: '🏰' },
  { name: 'Cat Tree Tower 🗼', size: 4, icon: '🗼' },
  { name: 'Fish Tank 🐠', size: 3, icon: '🐠' },
  { name: 'Scratching Post 🪵', size: 3, icon: '🪵' },
  { name: 'Cozy Cat Bed 🛋️', size: 2, icon: '🛋️' }
];

const BOARD_SIZE = 10;

let playerBoard = [];
let aiBoard = [];
let playerHits = 0;
let aiHits = 0;
let shotsTaken = 0;
let totalShipTiles = SHIPS.reduce((acc, s) => acc + s.size, 0); // 17 tiles
let gamePhase = 'placement'; // 'placement', 'battle', 'finished'
let aiTargetStack = [];

export function renderCatBattleshipGame(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:950px; margin:0 auto; text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
          <span style="font-size:2.2rem;">🚢</span>
          <h1 style="font-size:2rem; font-weight:800;">Cat Battleship vs AI Nibbles</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1.5rem;">
          Command your Cat Fleet against AI Nibbles 🐱! Sink Cardboard Forts, Cat Trees, and Fish Tanks in a 10x10 naval battle.
        </p>

        <!-- Live Commentary Box -->
        <div id="bs-dialogue" class="bs-dialogue-box" style="background:var(--bg-secondary); border:1px solid var(--accent-cyan); padding:1rem; border-radius:var(--radius-lg); max-width:650px; margin:0 auto 1.5rem auto; font-weight:600; color:var(--text-primary);">
          🐱 <strong>AI Nibbles:</strong> "Meow! Deploy your cat fleet to start the naval battle!"
        </div>

        <!-- Live Stats Dashboard -->
        <div class="stats-dashboard" style="max-width:550px; margin:0 auto 1.5rem auto;">
          <div class="stat-box">
            <div id="bs-shots" class="stat-value">0</div>
            <div class="stat-label">Shots Taken</div>
          </div>
          <div class="stat-box">
            <div id="bs-sunk-ai" class="stat-value">0 / 5</div>
            <div class="stat-label">Enemy Ships Sunk</div>
          </div>
          <div class="stat-box">
            <div id="bs-sunk-player" class="stat-value">0 / 5</div>
            <div class="stat-label">Your Ships Sunk</div>
          </div>
        </div>

        <!-- Dual Battleship Boards -->
        <div style="display:flex; justify-content:center; gap:2rem; flex-wrap:wrap; margin-bottom:1.5rem;">
          <!-- Player Fleet Board -->
          <div style="text-align:center;">
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; color:var(--accent-emerald);">🛡️ Your Cat Fleet</h3>
            <div id="bs-player-board" class="bs-board"></div>
          </div>

          <!-- AI Target Board -->
          <div style="text-align:center;">
            <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:0.5rem; color:var(--accent-cyan);">🎯 Target Board (AI Nibbles)</h3>
            <div id="bs-ai-board" class="bs-board"></div>
          </div>
        </div>

        <div>
          <button id="bs-start-btn" class="btn btn-primary btn-lg">🎲 Deploy Fleet &amp; Start Battle</button>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <div id="bs-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center;">
        <h2 id="bs-modal-title" style="font-size:1.8rem; margin-bottom:0.5rem;">🏆 Victory! You Defeated AI Nibbles!</h2>
        <p id="bs-modal-sub" style="color:var(--text-secondary); margin-bottom:1rem;">You successfully sank AI Nibbles' entire naval fleet!</p>

        <div class="stats-dashboard" style="margin-bottom:1.5rem;">
          <div class="stat-box">
            <div id="bs-modal-shots" class="stat-value">0</div>
            <div class="stat-label">Total Shots Taken</div>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="bs-modal-retry" class="btn btn-primary btn-lg" style="flex:1; min-width:140px;">Play Again</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 View Leaderboard</a>
        </div>
      </div>
    </div>
  `;

  initGame();
  bindEvents();
}

function createEmptyGrid() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      hasShip: false,
      shipId: null,
      hit: false
    }))
  );
}

function placeFleetRandomly(grid) {
  SHIPS.forEach((ship, shipId) => {
    let placed = false;
    while (!placed) {
      const isHorizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * (isHorizontal ? BOARD_SIZE : BOARD_SIZE - ship.size + 1));
      const c = Math.floor(Math.random() * (isHorizontal ? BOARD_SIZE - ship.size + 1 : BOARD_SIZE));

      let canPlace = true;
      for (let i = 0; i < ship.size; i++) {
        const checkR = isHorizontal ? r : r + i;
        const checkC = isHorizontal ? c + i : c;
        if (grid[checkR][checkC].hasShip) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < ship.size; i++) {
          const placeR = isHorizontal ? r : r + i;
          const placeC = isHorizontal ? c + i : c;
          grid[placeR][placeC].hasShip = true;
          grid[placeR][placeC].shipId = shipId;
          grid[placeR][placeC].icon = ship.icon;
        }
        placed = true;
      }
    }
  });
}

function initGame() {
  gamePhase = 'placement';
  playerHits = 0;
  aiHits = 0;
  shotsTaken = 0;
  aiTargetStack = [];

  playerBoard = createEmptyGrid();
  aiBoard = createEmptyGrid();

  placeFleetRandomly(playerBoard);
  placeFleetRandomly(aiBoard);

  const shotsEl = document.getElementById('bs-shots');
  const aiSunkEl = document.getElementById('bs-sunk-ai');
  const playerSunkEl = document.getElementById('bs-sunk-player');
  const dialogueEl = document.getElementById('bs-dialogue');

  if (shotsEl) shotsEl.textContent = '0';
  if (aiSunkEl) aiSunkEl.textContent = '0 / 5';
  if (playerSunkEl) playerSunkEl.textContent = '0 / 5';
  if (dialogueEl) dialogueEl.innerHTML = '🐱 <strong>AI Nibbles:</strong> "Meow! Click Deploy Fleet to start the naval battle!"';

  renderBoards();
}

function renderBoards() {
  const pContainer = document.getElementById('bs-player-board');
  const aiContainer = document.getElementById('bs-ai-board');
  if (!pContainer || !aiContainer) return;

  // Render Player Board
  pContainer.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
  pContainer.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'bs-cell';
      const cellData = playerBoard[r][c];

      if (cellData.hit) {
        cell.classList.add(cellData.hasShip ? 'cell-hit' : 'cell-miss');
        cell.textContent = cellData.hasShip ? '💥' : '💦';
      } else if (cellData.hasShip) {
        cell.classList.add('cell-ship');
        cell.textContent = cellData.icon || '⚓';
      }

      pContainer.appendChild(cell);
    }
  }

  // Render AI Target Board
  aiContainer.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
  aiContainer.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'bs-cell bs-target-cell';
      const cellData = aiBoard[r][c];

      if (cellData.hit) {
        cell.classList.add(cellData.hasShip ? 'cell-hit' : 'cell-miss');
        cell.textContent = cellData.hasShip ? '💥' : '💦';
      }

      cell.addEventListener('click', () => handlePlayerShot(r, c));
      aiContainer.appendChild(cell);
    }
  }
}

function handlePlayerShot(r, c) {
  if (gamePhase !== 'battle' || aiBoard[r][c].hit) return;

  aiBoard[r][c].hit = true;
  shotsTaken++;

  const shotsEl = document.getElementById('bs-shots');
  if (shotsEl) shotsEl.textContent = shotsTaken;

  const dialogueEl = document.getElementById('bs-dialogue');

  if (aiBoard[r][c].hasShip) {
    playerHits++;
    playClickSound(800, 0.04);
    if (dialogueEl) dialogueEl.innerHTML = `🎯 <strong>DIRECT HIT!</strong> You struck AI Nibbles' ${aiBoard[r][c].icon || 'ship'} at cell (${String.fromCharCode(65 + c)}${r + 1})!`;
  } else {
    playClickSound(400, 0.02);
    if (dialogueEl) dialogueEl.innerHTML = `💦 <strong>Splash!</strong> Your strike missed AI Nibbles' fleet at (${String.fromCharCode(65 + c)}${r + 1}).`;
  }

  updateSunkStats();
  renderBoards();

  if (playerHits === totalShipTiles) {
    finishGame(true);
    return;
  }

  // AI Turn after 500ms delay
  setTimeout(handleAiTurn, 550);
}

function handleAiTurn() {
  if (gamePhase !== 'battle') return;

  let targetR = -1;
  let targetC = -1;

  if (aiTargetStack.length > 0) {
    const next = aiTargetStack.pop();
    targetR = next.r;
    targetC = next.c;
  } else {
    let valid = false;
    while (!valid) {
      targetR = Math.floor(Math.random() * BOARD_SIZE);
      targetC = Math.floor(Math.random() * BOARD_SIZE);
      if (!playerBoard[targetR][targetC].hit) valid = true;
    }
  }

  playerBoard[targetR][targetC].hit = true;

  const dialogueEl = document.getElementById('bs-dialogue');

  if (playerBoard[targetR][targetC].hasShip) {
    aiHits++;
    if (dialogueEl) dialogueEl.innerHTML = `🐾 <strong>AI Nibbles:</strong> "Paw-strike! I swatted your ${playerBoard[targetR][targetC].icon || 'ship'} at (${String.fromCharCode(65 + targetC)}${targetR + 1})! 💥"`;

    // Add adjacent cells for AI targeting
    const adj = [
      { r: targetR - 1, c: targetC },
      { r: targetR + 1, c: targetC },
      { r: targetR, c: targetC - 1 },
      { r: targetR, c: targetC + 1 }
    ];
    adj.forEach(a => {
      if (a.r >= 0 && a.r < BOARD_SIZE && a.c >= 0 && a.c < BOARD_SIZE && !playerBoard[a.r][a.c].hit) {
        aiTargetStack.push(a);
      }
    });
  } else {
    if (dialogueEl) dialogueEl.innerHTML = `🐱 <strong>AI Nibbles:</strong> "Oops! My paw-strike missed at (${String.fromCharCode(65 + targetC)}${targetR + 1})! 💦"`;
  }

  updateSunkStats();
  renderBoards();

  if (aiHits === totalShipTiles) {
    finishGame(false);
  }
}

function updateSunkStats() {
  // Check Sunk AI Ships
  let aiSunkCount = 0;
  SHIPS.forEach((ship, shipId) => {
    let allHit = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (aiBoard[r][c].shipId === shipId && !aiBoard[r][c].hit) {
          allHit = false;
        }
      }
    }
    if (allHit) aiSunkCount++;
  });

  // Check Sunk Player Ships
  let playerSunkCount = 0;
  SHIPS.forEach((ship, shipId) => {
    let allHit = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (playerBoard[r][c].shipId === shipId && !playerBoard[r][c].hit) {
          allHit = false;
        }
      }
    }
    if (allHit) playerSunkCount++;
  });

  const aiSunkEl = document.getElementById('bs-sunk-ai');
  const playerSunkEl = document.getElementById('bs-sunk-player');

  if (aiSunkEl) aiSunkEl.textContent = `${aiSunkCount} / 5`;
  if (playerSunkEl) playerSunkEl.textContent = `${playerSunkCount} / 5`;
}

function finishGame(playerWon) {
  gamePhase = 'finished';

  const modalTitle = document.getElementById('bs-modal-title');
  const modalSub = document.getElementById('bs-modal-sub');
  const modalShots = document.getElementById('bs-modal-shots');

  if (playerWon) {
    playSuccessSound();
    submitScore('cat-battleship-game', shotsTaken, `${shotsTaken} shots taken`);
    if (modalTitle) modalTitle.textContent = '🏆 Victory! You Defeated AI Nibbles!';
    if (modalSub) modalSub.textContent = 'You successfully sank AI Nibbles\' entire naval fleet!';
  } else {
    if (modalTitle) modalTitle.textContent = '😿 Defeat! AI Nibbles Won!';
    if (modalSub) modalSub.textContent = 'AI Nibbles swatted and sank your entire cat fleet!';
  }

  if (modalShots) modalShots.textContent = shotsTaken;
  document.getElementById('bs-modal').classList.add('open');
}

function bindEvents() {
  const startBtn = document.getElementById('bs-start-btn');
  const modalRetry = document.getElementById('bs-modal-retry');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      initGame();
      gamePhase = 'battle';
      const dialogueEl = document.getElementById('bs-dialogue');
      if (dialogueEl) dialogueEl.innerHTML = '⚔️ <strong>BATTLE STARTED!</strong> Click cells on AI Nibbles\' target board to fire!';
    });
  }

  if (modalRetry) {
    modalRetry.addEventListener('click', () => {
      document.getElementById('bs-modal').classList.remove('open');
      initGame();
      gamePhase = 'battle';
    });
  }
}

export function cleanupCatBattleshipGame() {}
