/* ==========================================================================
   CatKeyLab - StackSnatch: Strategic Nesting Board Game
   Inspired by nested-piece capture board games (like Gobblet).
   Players place pieces of different sizes; larger pieces can cover smaller.
   Win by forming a line of 3 (3x3) or 4 (4x4) of your exposed pieces.
   Modes: 3x3 Classic, 4x4 Advanced. Local 2-player or vs AI (Easy/Medium/Hard).
   ========================================================================== */

import { getAudioContext, isSoundEnabled, toggleSound } from '../audio.js';
import { submitScore, getLeaderboard, getAnonProfile } from '../leaderboard.js';

// ── Game Configuration ────────────────────────────────────────────────────────
let containerRef = null;

// Board variants
const VARIANTS = {
  '3x3': {
    size: 3,
    pieceCount: [2, 2, 2], // [small, medium, large] per player
    sizes: [1, 2, 3],
    winLen: 3
  },
  '4x4': {
    size: 4,
    pieceCount: [2, 2, 2, 2], // [tiny, small, medium, large] per player
    sizes: [1, 2, 3, 4],
    winLen: 4
  }
};

// ── Game State ────────────────────────────────────────────────────────────────
let variant = '3x3'; // '3x3' | '4x4'
let vsAI = false;
let aiDifficulty = 'medium'; // 'easy' | 'medium' | 'hard'
let currentPlayer = 0; // 0 = P1, 1 = P2/AI
let board = []; // board[r][c] = stack array of {owner: 0|1, size: 1..N} (last = top)
let supply = [[], []]; // supply[player][idx] = {size}
let selectedSource = null; // { type:'supply'|'board', player, sizeIdx, r, c }
let gamePhase = 'MENU'; // 'MENU'|'PLAYING'|'OVER'
let winner = null; // 0|1|null
let moveHistory = [];
let aiThinking = false;
let scoreSubmitted = false;

// Player appearances
const PLAYER_COLORS = [
  { main: '#10b981', light: '#34d399', dark: '#059669', name: 'Emerald', emoji: '🟢' },
  { main: '#f43f5e', light: '#fb7185', dark: '#e11d48', name: 'Crimson', emoji: '🔴' }
];

const PLAYER_NAMES = ['Player 1', 'Player 2'];

// ── Entry Point ───────────────────────────────────────────────────────────────

export function renderStackSnatchGame(container) {
  containerRef = container;
  gamePhase = 'MENU';
  renderMenuHTML();
}

export function cleanupStackSnatchGame() {
  const existingBanner = document.querySelector('.ss-winner-banner');
  if (existingBanner) existingBanner.remove();
  containerRef = null;
  gamePhase = 'MENU';
  selectedSource = null;
  aiThinking = false;
}

// ── Menu ──────────────────────────────────────────────────────────────────────

function renderMenuHTML() {
  if (!containerRef) return;
  gamePhase = 'MENU';

  const lb33 = getLeaderboard('stacksnatch-3x3');
  const lb44 = getLeaderboard('stacksnatch-4x4');

  containerRef.innerHTML = `
    <div class="container section" style="padding-top:1.5rem;">
      <div class="tool-wrapper" style="max-width:820px; margin:0 auto;">
        <!-- Title -->
        <div style="text-align:center; margin-bottom:2rem;">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">🎲</div>
          <h1 style="font-size:2.2rem; font-weight:900; letter-spacing:-0.03em; background:linear-gradient(135deg,#10b981,#a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">StackSnatch</h1>
          <p style="color:var(--text-secondary); font-size:1.05rem; margin-top:0.4rem;">Place and stack pieces strategically. Bigger pieces can cover smaller ones. First to align ${variant === '3x3' ? '3' : '4'} wins!</p>
        </div>

        <!-- Board Variant Selection -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.75rem; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.05em;">Choose Board</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div id="ss-choose-3x3" class="ss-variant-card" data-v="3x3" style="cursor:pointer; background:var(--bg-secondary); border:2px solid var(--accent-cyan); border-radius:var(--radius-lg); padding:1.25rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:2rem; margin-bottom:0.4rem;">3×3</div>
              <div style="font-weight:800; color:var(--text-primary);">Classic Board</div>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Quick games • 3 sizes • Match 3</div>
              ${lb33[0] ? `<div style="margin-top:0.6rem; font-size:0.8rem; color:var(--accent-cyan);">Record: ${lb33[0].score} wins — ${lb33[0].avatar} ${lb33[0].handle}</div>` : ''}
            </div>
            <div id="ss-choose-4x4" class="ss-variant-card" data-v="4x4" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:2rem; margin-bottom:0.4rem;">4×4</div>
              <div style="font-weight:800; color:var(--text-primary);">Advanced Board</div>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">Strategic depth • 4 sizes • Match 4</div>
              ${lb44[0] ? `<div style="margin-top:0.6rem; font-size:0.8rem; color:var(--accent-cyan);">Record: ${lb44[0].score} wins — ${lb44[0].avatar} ${lb44[0].handle}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Opponent Selection -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.75rem; font-size:0.9rem; text-transform:uppercase; letter-spacing:0.05em;">Opponent</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:0.75rem;">
            <div id="ss-opp-pvp" class="ss-opp-card" style="cursor:pointer; background:var(--bg-secondary); border:2px solid var(--accent-cyan); border-radius:var(--radius-md); padding:1rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:1.5rem; margin-bottom:0.3rem;">👥</div>
              <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">2 Players</div>
              <div style="font-size:0.78rem; color:var(--text-secondary);">Local 1v1</div>
            </div>
            <div id="ss-opp-easy" class="ss-opp-card" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:1.5rem; margin-bottom:0.3rem;">🤖</div>
              <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">AI Easy</div>
              <div style="font-size:0.78rem; color:var(--text-secondary);">Random moves</div>
            </div>
            <div id="ss-opp-medium" class="ss-opp-card" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:1.5rem; margin-bottom:0.3rem;">🤖</div>
              <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">AI Medium</div>
              <div style="font-size:0.78rem; color:var(--text-secondary);">Blocks & wins</div>
            </div>
            <div id="ss-opp-hard" class="ss-opp-card" style="cursor:pointer; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; transition:all 0.2s;">
              <div style="font-size:1.5rem; margin-bottom:0.3rem;">🤖</div>
              <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">AI Hard</div>
              <div style="font-size:0.78rem; color:var(--text-secondary);">Minimax search</div>
            </div>
          </div>
        </div>

        <!-- How to Play -->
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1.5rem;">
          <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.75rem;">🎲 How to Play StackSnatch</div>
          <ul style="color:var(--text-secondary); font-size:0.9rem; line-height:1.9; list-style:disc; padding-left:1.25rem;">
            <li>Each player has pieces in <strong>multiple sizes</strong> (small to large)</li>
            <li>Place a piece from your supply onto any empty space, OR onto a smaller piece</li>
            <li>Move an <strong>exposed piece</strong> on the board to any eligible space</li>
            <li><strong>Larger pieces</strong> can cover smaller pieces of either color</li>
            <li>When you move a piece, the <strong>previously hidden piece is revealed</strong></li>
            <li>Win by forming <strong>${variant === '3x3' ? '3' : '4'} in a row</strong> of your exposed pieces (horizontal, vertical, or diagonal)</li>
          </ul>
        </div>

        <div style="text-align:center;">
          <button id="ss-start-btn" class="btn btn-primary" style="min-width:180px; font-size:1rem;">▶ Start Game</button>
        </div>
      </div>
    </div>
  `;

  // State tracking for selections
  let selectedVariant = '3x3';
  let selectedOpp = 'pvp';
  let selectedDiff = 'medium';

  function updateVariantUI() {
    containerRef.querySelectorAll('.ss-variant-card').forEach(c => {
      const isSelected = c.dataset.v === selectedVariant;
      c.style.border = isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)';
      c.style.background = isSelected ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)';
    });
  }

  function updateOppUI() {
    containerRef.querySelectorAll('.ss-opp-card').forEach(c => {
      const id = c.id;
      let isSelected = false;
      if (id === 'ss-opp-pvp' && selectedOpp === 'pvp') isSelected = true;
      if (id === 'ss-opp-easy' && selectedOpp === 'ai' && selectedDiff === 'easy') isSelected = true;
      if (id === 'ss-opp-medium' && selectedOpp === 'ai' && selectedDiff === 'medium') isSelected = true;
      if (id === 'ss-opp-hard' && selectedOpp === 'ai' && selectedDiff === 'hard') isSelected = true;
      c.style.border = isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)';
      c.style.background = isSelected ? 'rgba(168,85,247,0.08)' : 'var(--bg-secondary)';
    });
  }

  containerRef.querySelectorAll('.ss-variant-card').forEach(c => {
    c.addEventListener('click', () => { selectedVariant = c.dataset.v; updateVariantUI(); });
  });

  const oppPvp = document.getElementById('ss-opp-pvp');
  const oppEasy = document.getElementById('ss-opp-easy');
  const oppMed = document.getElementById('ss-opp-medium');
  const oppHard = document.getElementById('ss-opp-hard');

  if (oppPvp) oppPvp.addEventListener('click', () => { selectedOpp = 'pvp'; updateOppUI(); });
  if (oppEasy) oppEasy.addEventListener('click', () => { selectedOpp = 'ai'; selectedDiff = 'easy'; updateOppUI(); });
  if (oppMed) oppMed.addEventListener('click', () => { selectedOpp = 'ai'; selectedDiff = 'medium'; updateOppUI(); });
  if (oppHard) oppHard.addEventListener('click', () => { selectedOpp = 'ai'; selectedDiff = 'hard'; updateOppUI(); });

  const startBtn = document.getElementById('ss-start-btn');
  if (startBtn) startBtn.addEventListener('click', () => {
    variant = selectedVariant;
    vsAI = selectedOpp === 'ai';
    aiDifficulty = selectedDiff;
    startGame();
  });

  updateVariantUI();
  updateOppUI();
}

// ── Game Init ─────────────────────────────────────────────────────────────────

function startGame() {
  const cfg = VARIANTS[variant];
  const n = cfg.size;

  // Init board: n x n, each cell is a stack []
  board = Array.from({ length: n }, () => Array.from({ length: n }, () => []));

  // Init supply: each player gets cfg.pieceCount[i] of size cfg.sizes[i]
  supply = [[], []];
  for (let p = 0; p < 2; p++) {
    for (let i = 0; i < cfg.sizes.length; i++) {
      for (let k = 0; k < cfg.pieceCount[i]; k++) {
        supply[p].push({ size: cfg.sizes[i] });
      }
    }
  }

  currentPlayer = 0;
  winner = null;
  selectedSource = null;
  moveHistory = [];
  aiThinking = false;
  gamePhase = 'PLAYING';
  scoreSubmitted = false;

  renderGameHTML();
}

// ── Game HTML ─────────────────────────────────────────────────────────────────

function renderGameHTML() {
  if (!containerRef) return;

  const cfg = VARIANTS[variant];
  const n = cfg.size;

  containerRef.innerHTML = `
    <div class="container section" style="padding-top:1rem;">
      <div style="max-width:700px; margin:0 auto;">
        <!-- HUD -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:700; text-transform:uppercase;">🎲 StackSnatch ${variant}</span>
            <span id="ss-mode-label" style="font-size:0.82rem; color:var(--text-secondary);">${vsAI ? `vs AI (${aiDifficulty})` : '2 Players'}</span>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button id="ss-restart-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
            <button id="ss-menu-btn" class="btn btn-secondary btn-sm">🏠 Menu</button>
            <button id="ss-sound-btn" class="btn btn-secondary btn-sm">${isSoundEnabled() ? '🔊' : '🔇'}</button>
          </div>
        </div>

        <!-- Player Info -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;" id="ss-player-hud">
        </div>

        <!-- Board Area -->
        <div id="ss-game-area" style="display:flex; gap:1.5rem; align-items:flex-start; flex-wrap:wrap;">
          <!-- P1 Supply (left or top on mobile) -->
          <div id="ss-supply-0" style="flex-shrink:0;"></div>

          <!-- Board -->
          <div id="ss-board" style="flex:1; min-width:0;"></div>

          <!-- P2 Supply (right or bottom on mobile) -->
          <div id="ss-supply-1" style="flex-shrink:0;"></div>
        </div>

        <!-- Move History -->
        <div style="margin-top:1rem; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem; max-height:100px; overflow-y:auto;" id="ss-move-log">
          <div style="font-size:0.78rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:0.4rem;">Move Log</div>
          <div id="ss-move-log-entries" style="font-size:0.82rem; color:var(--text-secondary);"></div>
        </div>
      </div>
    </div>
  `;

  bindGameButtons();
  renderGame();
}

function bindGameButtons() {
  const restartBtn = document.getElementById('ss-restart-btn');
  const menuBtn = document.getElementById('ss-menu-btn');
  const soundBtn = document.getElementById('ss-sound-btn');

  if (restartBtn) restartBtn.addEventListener('click', startGame);
  if (menuBtn) menuBtn.addEventListener('click', renderMenuHTML);
  if (soundBtn) soundBtn.addEventListener('click', () => {
    toggleSound();
    soundBtn.textContent = isSoundEnabled() ? '🔊' : '🔇';
  });
}

// ── Render Game State ─────────────────────────────────────────────────────────

function renderGame() {
  if (!containerRef) return;
  renderPlayerHUD();
  renderBoard();
  renderSupplies();
  renderMoveLog();
}

function renderPlayerHUD() {
  const hud = document.getElementById('ss-player-hud');
  if (!hud) return;

  hud.innerHTML = [0, 1].map(p => {
    const col = PLAYER_COLORS[p];
    const isActive = currentPlayer === p && gamePhase === 'PLAYING';
    const name = vsAI && p === 1 ? `🤖 AI (${aiDifficulty})` : PLAYER_NAMES[p];
    return `
      <div style="background:${isActive ? `rgba(${p === 0 ? '16,185,129' : '244,63,94'},0.12)` : 'var(--bg-secondary)'}; border:${isActive ? `2px solid ${col.main}` : '1px solid var(--border-color)'}; border-radius:var(--radius-md); padding:0.85rem; text-align:center; transition:all 0.2s;">
        <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:${col.main};">${isActive ? '▶ ' : ''}${name}</div>
        <div style="margin-top:0.4rem; display:flex; justify-content:center; gap:0.4rem; flex-wrap:wrap;">
          ${VARIANTS[variant].sizes.map(sz => {
            const count = supply[p].filter(pc => pc.size === sz).length;
            return `<span style="font-size:0.82rem; color:${count > 0 ? col.main : 'var(--text-muted)'}; font-weight:700;">${sz === 1 ? '●' : sz === 2 ? '⬤' : sz === 3 ? '◉' : '◎'}×${count}</span>`;
          }).join('')}
        </div>
        ${isActive && aiThinking ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">🤔 Thinking...</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderBoard() {
  const boardEl = document.getElementById('ss-board');
  if (!boardEl) return;

  const cfg = VARIANTS[variant];
  const n = cfg.size;
  const cellSize = Math.min(100, Math.floor((Math.min(400, (containerRef.clientWidth || 700) - 200)) / n));

  boardEl.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(${n},${cellSize}px); gap:6px; background:var(--bg-primary); border:2px solid var(--border-color); border-radius:var(--radius-lg); padding:10px; margin:0 auto; width:fit-content;">
      ${Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const stack = board[r][c];
          const top = stack[stack.length - 1];
          const isSelected = selectedSource && selectedSource.type === 'board' && selectedSource.r === r && selectedSource.c === c;
          const canPlace = canPlaceAt(r, c);
          const isLegal = selectedSource && canPlace;

          let cellContent = '';
          if (top) {
            const col = PLAYER_COLORS[top.owner];
            const pctSize = Math.min(90, 30 + top.size * 17);
            cellContent = `
              <div style="width:${pctSize}%; height:${pctSize}%; border-radius:50%; background:${col.main}; border:3px solid ${col.light}; box-shadow:0 0 ${top.size * 4}px ${col.main}; transition:all 0.2s; display:flex; align-items:center; justify-content:center; font-size:${Math.round(cellSize * 0.18)}px; font-weight:900; color:white;">${top.size}</div>
            `;
          }

          return `
            <div class="ss-cell" data-r="${r}" data-c="${c}"
              style="width:${cellSize}px; height:${cellSize}px; display:flex; align-items:center; justify-content:center; border-radius:var(--radius-sm); cursor:pointer; transition:all 0.15s;
              background:${isSelected ? 'rgba(168,85,247,0.2)' : isLegal ? 'rgba(16,185,129,0.12)' : 'var(--bg-secondary)'};
              border:${isSelected ? '2px solid var(--accent-purple)' : isLegal ? '2px solid rgba(16,185,129,0.5)' : '1px solid var(--border-color)'};
              box-shadow:${isSelected ? '0 0 12px rgba(168,85,247,0.4)' : ''};"
              title="${top ? `${PLAYER_NAMES[top.owner]} size ${top.size}` : 'Empty'}${stack.length > 1 ? ` (${stack.length} stacked)` : ''}">
              ${cellContent}
            </div>
          `;
        }).join('')
      ).join('')}
    </div>
  `;

  // Bind cell clicks
  boardEl.querySelectorAll('.ss-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      if (gamePhase !== 'PLAYING') return;
      if (vsAI && currentPlayer === 1) return; // AI's turn
      const r = parseInt(cell.dataset.r);
      const c = parseInt(cell.dataset.c);
      handleBoardClick(r, c);
    });
  });
}

function renderSupplies() {
  for (let p = 0; p < 2; p++) {
    const supplyEl = document.getElementById(`ss-supply-${p}`);
    if (!supplyEl) continue;

    const col = PLAYER_COLORS[p];
    const isActive = currentPlayer === p && gamePhase === 'PLAYING' && !(vsAI && p === 1);
    const cfg = VARIANTS[variant];
    const name = vsAI && p === 1 ? '🤖 AI' : `P${p + 1}`;

    // Group by size
    const grouped = cfg.sizes.map(sz => ({
      sz,
      count: supply[p].filter(pc => pc.size === sz).length
    }));

    supplyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:center;">
        <div style="font-size:0.75rem; font-weight:700; color:${col.main}; text-transform:uppercase;">${name}</div>
        ${grouped.map(({ sz, count }) => {
          if (count === 0) return `<div style="opacity:0.2; font-size:0.78rem; color:var(--text-muted);">×0 sz${sz}</div>`;
          const pctSize = 18 + sz * 10;
          const isSelected = selectedSource && selectedSource.type === 'supply' && selectedSource.player === p && selectedSource.sizeIdx === sz;
          const clickable = isActive && count > 0;
          return `
            <div class="ss-supply-piece" data-player="${p}" data-size="${sz}"
              style="cursor:${clickable ? 'pointer' : 'default'}; width:${pctSize + 16}px; height:${pctSize + 16}px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:${isSelected ? `3px solid var(--accent-purple)` : `2px solid ${col.light}`}; background:${isSelected ? 'rgba(168,85,247,0.2)' : `rgba(${p === 0 ? '16,185,129' : '244,63,94'},0.1)`}; box-shadow:${isSelected ? '0 0 12px rgba(168,85,247,0.5)' : ''}; transition:all 0.15s; position:relative;">
              <div style="width:${pctSize}px; height:${pctSize}px; border-radius:50%; background:${count > 0 ? col.main : 'var(--bg-tertiary)'}; box-shadow:0 0 ${sz * 3}px ${col.main}; display:flex; align-items:center; justify-content:center; font-size:${Math.round(pctSize * 0.45)}px; font-weight:900; color:white;">${sz}</div>
              <span style="position:absolute; top:-4px; right:-4px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:99px; font-size:0.7rem; font-weight:700; color:var(--text-secondary); padding:1px 5px;">${count}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (isActive) {
      supplyEl.querySelectorAll('.ss-supply-piece').forEach(el => {
        el.addEventListener('click', () => {
          const player = parseInt(el.dataset.player);
          const sz = parseInt(el.dataset.size);
          if (supply[player].some(pc => pc.size === sz)) {
            handleSupplyClick(player, sz);
          }
        });
      });
    }
  }
}

function renderMoveLog() {
  const logEl = document.getElementById('ss-move-log-entries');
  if (!logEl) return;
  const recent = moveHistory.slice(-8).reverse();
  logEl.innerHTML = recent.map(m => `<div>${m}</div>`).join('') || '<div style="color:var(--text-muted);">No moves yet.</div>';
}

// ── Interaction Logic ─────────────────────────────────────────────────────────

function handleSupplyClick(player, sz) {
  if (gamePhase !== 'PLAYING' || currentPlayer !== player) return;
  if (supply[player].filter(pc => pc.size === sz).length === 0) return;

  if (selectedSource && selectedSource.type === 'supply' && selectedSource.player === player && selectedSource.sizeIdx === sz) {
    // Deselect
    selectedSource = null;
  } else {
    selectedSource = { type: 'supply', player, sizeIdx: sz };
  }
  renderGame();
}

function handleBoardClick(r, c) {
  if (gamePhase !== 'PLAYING') return;

  const stack = board[r][c];
  const top = stack[stack.length - 1];

  if (selectedSource) {
    // Try to place
    if (canPlaceAt(r, c)) {
      executeMove(r, c);
    } else if (top && top.owner === currentPlayer && !isBoardSourceSelected(r, c)) {
      // Select this piece instead
      selectedSource = { type: 'board', player: currentPlayer, r, c };
      renderGame();
    } else {
      // Invalid click - deselect
      selectedSource = null;
      renderGame();
    }
  } else {
    // Select a piece from board
    if (top && top.owner === currentPlayer) {
      selectedSource = { type: 'board', player: currentPlayer, r, c };
      renderGame();
    }
  }
}

function isBoardSourceSelected(r, c) {
  return selectedSource && selectedSource.type === 'board' && selectedSource.r === r && selectedSource.c === c;
}

function canPlaceAt(r, c) {
  if (!selectedSource) return false;
  const stack = board[r][c];
  const top = stack[stack.length - 1];

  const mySize = selectedSource.type === 'supply' ? selectedSource.sizeIdx : board[selectedSource.r][selectedSource.c].slice(-1)[0]?.size;

  if (!mySize) return false;
  if (!top) return true; // Empty cell
  return mySize > top.size; // Must be strictly larger to cover
}

function executeMove(toR, toC) {
  if (!selectedSource) return;

  let movePiece;
  let fromDesc;

  if (selectedSource.type === 'supply') {
    // Remove from supply
    const idx = supply[currentPlayer].findIndex(pc => pc.size === selectedSource.sizeIdx);
    if (idx === -1) { selectedSource = null; return; }
    movePiece = supply[currentPlayer].splice(idx, 1)[0];
    movePiece.owner = currentPlayer;
    fromDesc = `supply (sz${movePiece.size})`;
  } else {
    // Remove from board (only top piece)
    const fromStack = board[selectedSource.r][selectedSource.c];
    if (fromStack.length === 0) { selectedSource = null; return; }
    movePiece = fromStack.pop();
    fromDesc = `(${selectedSource.r},${selectedSource.c})`;
  }

  // Place on target
  board[toR][toC].push(movePiece);

  const pName = vsAI && currentPlayer === 1 ? 'AI' : PLAYER_NAMES[currentPlayer];
  moveHistory.push(`${pName}: ${fromDesc} → (${toR},${toC})`);

  playMoveSound();

  // Check win
  const winResult = checkWin();
  if (winResult !== null) {
    winner = winResult;
    gamePhase = 'OVER';
    selectedSource = null;
    renderGame();
    handleGameOver(winner);
    return;
  }

  // Switch player
  currentPlayer = 1 - currentPlayer;
  selectedSource = null;
  renderGame();

  // Trigger AI if needed
  if (vsAI && currentPlayer === 1 && gamePhase === 'PLAYING') {
    aiThinking = true;
    renderPlayerHUD();
    setTimeout(() => {
      doAIMove();
    }, 400 + Math.random() * 300);
  }
}

// ── Win Check ─────────────────────────────────────────────────────────────────

function checkWin() {
  const cfg = VARIANTS[variant];
  const n = cfg.size;
  const winLen = cfg.winLen;

  // Get visible board (top of each stack, or null)
  const visible = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const st = board[r][c];
      return st.length > 0 ? st[st.length - 1].owner : null;
    })
  );

  function lineWin(cells) {
    if (cells.some(v => v === null)) return null;
    if (cells.every(v => v === cells[0])) return cells[0];
    return null;
  }

  // Check rows
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= n - winLen; c++) {
      const cells = Array.from({ length: winLen }, (_, i) => visible[r][c + i]);
      const w = lineWin(cells);
      if (w !== null) return w;
    }
  }

  // Check cols
  for (let c = 0; c < n; c++) {
    for (let r = 0; r <= n - winLen; r++) {
      const cells = Array.from({ length: winLen }, (_, i) => visible[r + i][c]);
      const w = lineWin(cells);
      if (w !== null) return w;
    }
  }

  // Check diag down-right
  for (let r = 0; r <= n - winLen; r++) {
    for (let c = 0; c <= n - winLen; c++) {
      const cells = Array.from({ length: winLen }, (_, i) => visible[r + i][c + i]);
      const w = lineWin(cells);
      if (w !== null) return w;
    }
  }

  // Check diag down-left
  for (let r = 0; r <= n - winLen; r++) {
    for (let c = winLen - 1; c < n; c++) {
      const cells = Array.from({ length: winLen }, (_, i) => visible[r + i][c - i]);
      const w = lineWin(cells);
      if (w !== null) return w;
    }
  }

  return null;
}

// ── Game Over ─────────────────────────────────────────────────────────────────

function handleGameOver(winnerIdx) {
  if (scoreSubmitted) return;
  scoreSubmitted = true;

  const profile = getAnonProfile();
  const col = PLAYER_COLORS[winnerIdx];
  const winnerName = vsAI && winnerIdx === 1 ? '🤖 AI' : PLAYER_NAMES[winnerIdx];
  const isHumanWin = !vsAI || winnerIdx === 0;
  const leaderboardId = variant === '3x3' ? 'stacksnatch-3x3' : 'stacksnatch-4x4';

  // Submit if human won
  let result = null;
  if (isHumanWin) {
    const wins = (parseInt(localStorage.getItem(`ss_wins_${variant}`)) || 0) + 1;
    try { localStorage.setItem(`ss_wins_${variant}`, wins); } catch(e) {}
    result = submitScore(leaderboardId, wins, `${wins} win${wins !== 1 ? 's' : ''}`);
  }

  playWinSound();

  // Show winner banner
  const boardArea = document.getElementById('ss-game-area');
  if (boardArea) {
    const banner = document.createElement('div');
    banner.className = 'ss-winner-banner';
    banner.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:var(--bg-secondary); border:2px solid ${col.main}; border-radius:var(--radius-lg);
      padding:2rem 3rem; text-align:center; z-index:999; box-shadow:0 20px 60px rgba(0,0,0,0.6);
      min-width:280px; animation:fadeIn 0.3s ease;
    `;
    banner.innerHTML = `
      <div style="font-size:3rem; margin-bottom:0.5rem;">${winnerIdx === 0 ? '🏆' : vsAI ? '🤖' : '🏅'}</div>
      <div style="font-size:1.6rem; font-weight:900; color:${col.main}; margin-bottom:0.25rem;">${winnerName} Wins!</div>
      <div style="color:var(--text-secondary); margin-bottom:1.25rem;">${isHumanWin ? `Score submitted to leaderboard!${result && result.rank <= 3 ? ` <strong style="color:var(--accent-cyan);">Rank #${result.rank}!</strong>` : ''}` : 'Better luck next time!'}</div>
      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
        <button id="ss-rematch-btn" class="btn btn-primary">🔄 Rematch</button>
        <button id="ss-winner-menu-btn" class="btn btn-secondary">🏠 Menu</button>
      </div>
    `;
    document.body.appendChild(banner);

    const rematch = document.getElementById('ss-rematch-btn');
    const menuBtn = document.getElementById('ss-winner-menu-btn');
    if (rematch) rematch.addEventListener('click', () => { banner.remove(); startGame(); });
    if (menuBtn) menuBtn.addEventListener('click', () => { banner.remove(); renderMenuHTML(); });
  }
}

// ── AI Engine ─────────────────────────────────────────────────────────────────

function doAIMove() {
  if (gamePhase !== 'PLAYING' || currentPlayer !== 1) { aiThinking = false; return; }

  const move = getAIMove(aiDifficulty);
  if (move) {
    applyAIMove(move);
  } else {
    // No valid moves (shouldn't happen but handle gracefully)
    aiThinking = false;
    currentPlayer = 0;
    renderGame();
  }
}

function getLegalMoves(player) {
  const cfg = VARIANTS[variant];
  const n = cfg.size;
  const moves = [];

  // Moves from supply (deduplicated by piece size)
  const uniqueSizes = [...new Set(supply[player].map(p => p.size))];
  for (const size of uniqueSizes) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const top = board[r][c].slice(-1)[0];
        if (!top || size > top.size) {
          moves.push({ type: 'supply', size: size, toR: r, toC: c });
        }
      }
    }
  }

  // Moves from board
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const st = board[r][c];
      const top = st[st.length - 1];
      if (!top || top.owner !== player) continue;
      for (let tr = 0; tr < n; tr++) {
        for (let tc = 0; tc < n; tc++) {
          if (tr === r && tc === c) continue;
          const tTop = board[tr][tc].slice(-1)[0];
          if (!tTop || top.size > tTop.size) {
            moves.push({ type: 'board', fromR: r, fromC: c, toR: tr, toC: tc });
          }
        }
      }
    }
  }

  return moves;
}

function applyAIMove(move) {
  let piece;
  if (move.type === 'supply') {
    const idx = supply[1].findIndex(pc => pc.size === move.size);
    if (idx === -1) { aiThinking = false; return; }
    piece = supply[1].splice(idx, 1)[0];
    piece.owner = 1;
    moveHistory.push(`AI: supply (sz${piece.size}) → (${move.toR},${move.toC})`);
  } else {
    piece = board[move.fromR][move.fromC].pop();
    moveHistory.push(`AI: (${move.fromR},${move.fromC}) → (${move.toR},${move.toC})`);
  }

  board[move.toR][move.toC].push(piece);
  playMoveSound();

  aiThinking = false;

  const winResult = checkWin();
  if (winResult !== null) {
    winner = winResult;
    gamePhase = 'OVER';
    renderGame();
    handleGameOver(winner);
    return;
  }

  currentPlayer = 0;
  renderGame();
}

function getAIMove(difficulty) {
  const legalMoves = getLegalMoves(1);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy') {
    // Mostly random with occasional win move
    if (Math.random() < 0.3) {
      const winMove = findWinMove(1, legalMoves);
      if (winMove) return winMove;
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  if (difficulty === 'medium') {
    // Win if possible, block player win, then strategic
    const winMove = findWinMove(1, legalMoves);
    if (winMove) return winMove;
    const blockMove = findWinMove(0, getLegalMoves(0));
    if (blockMove) {
      // Find a move that covers the position the opponent would win from
      const coverMove = legalMoves.find(m => m.toR === blockMove.toR && m.toC === blockMove.toC);
      if (coverMove) return coverMove;
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Hard: minimax with alpha-beta
  const depth = variant === '3x3' ? 3 : 2;
  const best = minimaxRoot(depth, 1);
  if (best) return best;
  return legalMoves[0];
}

function findWinMove(player, moves) {
  for (const move of moves) {
    // Simulate move
    const state = simulateMove(move, player);
    if (state.win === player) return move;
  }
  return null;
}

function simulateMove(move, player) {
  // Deep copy board and supply for simulation
  const bCopy = board.map(row => row.map(cell => [...cell.map(p => ({ ...p }))]));
  const sCopy = supply.map(s => s.map(p => ({ ...p })));

  let piece;
  if (move.type === 'supply') {
    const idx = sCopy[player].findIndex(pc => pc.size === move.size);
    if (idx === -1) return { board: bCopy, supply: sCopy, win: null };
    piece = sCopy[player].splice(idx, 1)[0];
    piece.owner = player;
  } else {
    piece = bCopy[move.fromR][move.fromC].pop();
  }
  bCopy[move.toR][move.toC].push(piece);

  const win = checkWinOnBoard(bCopy);
  return { board: bCopy, supply: sCopy, win };
}

function checkWinOnBoard(b) {
  const n = b.length;
  const cfg = VARIANTS[variant];
  const winLen = cfg.winLen;
  const visible = b.map(row => row.map(cell => cell.length > 0 ? cell[cell.length - 1].owner : null));

  function lineWin(cells) {
    if (cells.some(v => v === null)) return null;
    if (cells.every(v => v === cells[0])) return cells[0];
    return null;
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= n - winLen; c++) {
      const w = lineWin(Array.from({ length: winLen }, (_, i) => visible[r][c + i]));
      if (w !== null) return w;
    }
  }
  for (let c = 0; c < n; c++) {
    for (let r = 0; r <= n - winLen; r++) {
      const w = lineWin(Array.from({ length: winLen }, (_, i) => visible[r + i][c]));
      if (w !== null) return w;
    }
  }
  for (let r = 0; r <= n - winLen; r++) {
    for (let c = 0; c <= n - winLen; c++) {
      const w = lineWin(Array.from({ length: winLen }, (_, i) => visible[r + i][c + i]));
      if (w !== null) return w;
    }
  }
  for (let r = 0; r <= n - winLen; r++) {
    for (let c = winLen - 1; c < n; c++) {
      const w = lineWin(Array.from({ length: winLen }, (_, i) => visible[r + i][c - i]));
      if (w !== null) return w;
    }
  }
  return null;
}

// Minimax with alpha-beta for Hard AI
function minimaxRoot(depth, player) {
  const moves = getLegalMoves(player);
  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = moves[0];
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    const state = simulateMove(move, player);
    if (state.win === player) return move; // Immediate win
    const score = minimax(state.board, state.supply, depth - 1, 1 - player, alpha, beta);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    alpha = Math.max(alpha, bestScore);
  }
  return bestMove;
}

function minimax(b, s, depth, player, alpha, beta) {
  const win = checkWinOnBoard(b);
  if (win === 1) return 100 + depth;  // AI wins
  if (win === 0) return -100 - depth; // Human wins
  if (depth === 0) return evalBoard(b, 1);

  const moves = getLegalMovesOnState(b, s, player);
  if (moves.length === 0) return 0;

  let best = player === 1 ? -Infinity : Infinity;

  for (const move of moves) {
    const st = simMoveOnState(b, s, move, player);
    const score = minimax(st.board, st.supply, depth - 1, 1 - player, alpha, beta);
    if (player === 1) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function getLegalMovesOnState(b, s, player) {
  const n = b.length;
  const moves = [];
  const uniqueSizes = [...new Set(s[player].map(p => p.size))];
  for (const size of uniqueSizes) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const top = b[r][c].slice(-1)[0];
        if (!top || size > top.size) moves.push({ type: 'supply', size: size, toR: r, toC: c });
      }
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const top = b[r][c].slice(-1)[0];
      if (!top || top.owner !== player) continue;
      for (let tr = 0; tr < n; tr++) {
        for (let tc = 0; tc < n; tc++) {
          if (tr === r && tc === c) continue;
          const tTop = b[tr][tc].slice(-1)[0];
          if (!tTop || top.size > tTop.size) moves.push({ type: 'board', fromR: r, fromC: c, toR: tr, toC: tc });
        }
      }
    }
  }
  return moves;
}

function simMoveOnState(b, s, move, player) {
  const bCopy = b.map(row => row.map(cell => [...cell.map(p => ({ ...p }))]));
  const sCopy = s.map(row => [...row.map(p => ({ ...p }))]);
  let piece;
  if (move.type === 'supply') {
    const idx = sCopy[player].findIndex(pc => pc.size === move.size);
    if (idx === -1) return { board: bCopy, supply: sCopy };
    piece = sCopy[player].splice(idx, 1)[0];
    piece.owner = player;
  } else {
    piece = bCopy[move.fromR][move.fromC].pop();
  }
  bCopy[move.toR][move.toC].push(piece);
  return { board: bCopy, supply: sCopy };
}

function evalBoard(b, aiPlayer) {
  const n = b.length;
  const cfg = VARIANTS[variant];
  const winLen = cfg.winLen;
  let score = 0;
  const visible = b.map(row => row.map(cell => cell.length > 0 ? cell[cell.length - 1].owner : null));

  function evalLine(cells) {
    const aiCount = cells.filter(v => v === aiPlayer).length;
    const opCount = cells.filter(v => v === 1 - aiPlayer).length;
    if (aiCount > 0 && opCount === 0) score += Math.pow(3, aiCount);
    if (opCount > 0 && aiCount === 0) score -= Math.pow(3, opCount);
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= n - winLen; c++) evalLine(Array.from({ length: winLen }, (_, i) => visible[r][c + i]));
  }
  for (let c = 0; c < n; c++) {
    for (let r = 0; r <= n - winLen; r++) evalLine(Array.from({ length: winLen }, (_, i) => visible[r + i][c]));
  }
  for (let r = 0; r <= n - winLen; r++) {
    for (let c = 0; c <= n - winLen; c++) evalLine(Array.from({ length: winLen }, (_, i) => visible[r + i][c + i]));
    for (let c = winLen - 1; c < n; c++) evalLine(Array.from({ length: winLen }, (_, i) => visible[r + i][c - i]));
  }
  return score;
}

// ── Sound FX ──────────────────────────────────────────────────────────────────

function playMoveSound() {
  if (!isSoundEnabled()) return;
  try {
    const actx = getAudioContext(); if (!actx) return;
    const now = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + currentPlayer * 120, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(now); osc.stop(now + 0.12);
  } catch (e) {}
}

function playWinSound() {
  if (!isSoundEnabled()) return;
  try {
    const actx = getAudioContext(); if (!actx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      const t = actx.currentTime + i * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain); gain.connect(actx.destination);
      osc.start(t); osc.stop(t + 0.18);
    });
  } catch (e) {}
}
