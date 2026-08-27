/* ==========================================================================
   CatKeyLab - Cat Card Memory Match Game
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, playSuccessSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

const CAT_CARD_EMOJIS = ['🐱', '🐟', '🧶', '🐾', '🐁', '🥣', '🥛', '🔔'];

let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;
let turnsCount = 0;
let startTime = 0;
let timerInterval = null;
let isPlaying = false;
let isChecking = false;

export function renderCardMemoryGame(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:850px; margin:0 auto; text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
          <span style="font-size:2.2rem;">🎴</span>
          <h1 style="font-size:2rem; font-weight:800;">Cat Card Memory Match</h1>
        </div>
        <p class="section-subtitle" style="margin-bottom:1.5rem;">
          Flip cards to find all 8 matching cat-themed pairs! Test your visual recall & concentration.
        </p>

        <!-- Live Dashboard -->
        <div class="stats-dashboard" style="max-width:550px; margin:0 auto 1.5rem auto;">
          <div class="stat-box">
            <div id="cm-turns" class="stat-value">0</div>
            <div class="stat-label">Turns Taken</div>
          </div>
          <div class="stat-box">
            <div id="cm-matches" class="stat-value">0 / 8</div>
            <div class="stat-label">Pairs Matched</div>
          </div>
          <div class="stat-box">
            <div id="cm-timer" class="stat-value">0.0s</div>
            <div class="stat-label">Time Elapsed</div>
          </div>
        </div>

        <!-- Memory Grid Board -->
        <div id="cm-grid-board" class="memory-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; max-width:550px; margin:0 auto 1.5rem auto;"></div>

        <div>
          <button id="cm-reset-btn" class="btn btn-primary btn-lg">🎲 New Card Game</button>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <div id="cm-modal" class="modal-overlay">
      <div class="modal-card" style="text-align:center;">
        <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">🎉 Fantastic Memory!</h2>
        <p style="color:var(--text-secondary); margin-bottom:1rem;">You found all 8 matching cat pairs!</p>

        <div class="stats-dashboard" style="margin-bottom:1.5rem;">
          <div class="stat-box">
            <div id="cm-modal-turns" class="stat-value">0</div>
            <div class="stat-label">Total Turns</div>
          </div>
          <div class="stat-box">
            <div id="cm-modal-time" class="stat-value">0.0s</div>
            <div class="stat-label">Total Time</div>
          </div>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button id="cm-modal-retry" class="btn btn-primary btn-lg" style="flex:1; min-width:140px;">Play Again</button>
          <a href="#leaderboards" class="btn btn-secondary btn-lg" style="flex:1; min-width:140px;">🏆 View Leaderboard</a>
        </div>
      </div>
    </div>
  `;

  initGame();
  bindEvents();
}

function initGame() {
  if (timerInterval) clearInterval(timerInterval);
  isPlaying = false;
  isChecking = false;
  turnsCount = 0;
  matchedPairs = 0;
  flippedCards = [];
  startTime = 0;

  const turnsEl = document.getElementById('cm-turns');
  const matchesEl = document.getElementById('cm-matches');
  const timerEl = document.getElementById('cm-timer');

  if (turnsEl) turnsEl.textContent = '0';
  if (matchesEl) matchesEl.textContent = '0 / 8';
  if (timerEl) timerEl.textContent = '0.0s';

  // Shuffle 8 pairs of cards
  const deck = [...CAT_CARD_EMOJIS, ...CAT_CARD_EMOJIS];
  cardsArray = deck.sort(() => Math.random() - 0.5).map((emoji, id) => ({
    id,
    emoji,
    isFlipped: false,
    isMatched: false
  }));

  renderCards();
}

function renderCards() {
  const board = document.getElementById('cm-grid-board');
  if (!board) return;

  board.innerHTML = '';

  cardsArray.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = `memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
    cardEl.dataset.index = index;

    cardEl.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-front">🐾</div>
        <div class="memory-card-back">${card.emoji}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => handleCardClick(index));
    board.appendChild(cardEl);
  });
}

function handleCardClick(index) {
  if (!isPlaying) {
    isPlaying = true;
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
  }

  const card = cardsArray[index];
  if (isChecking || card.isFlipped || card.isMatched) return;

  playClickSound(700, 0.03);
  card.isFlipped = true;
  flippedCards.push({ card, index });

  renderCards();

  if (flippedCards.length === 2) {
    turnsCount++;
    const turnsEl = document.getElementById('cm-turns');
    if (turnsEl) turnsEl.textContent = turnsCount;

    isChecking = true;

    const [first, second] = flippedCards;
    if (first.card.emoji === second.card.emoji) {
      // Match Found
      first.card.isMatched = true;
      second.card.isMatched = true;
      matchedPairs++;

      const matchesEl = document.getElementById('cm-matches');
      if (matchesEl) matchesEl.textContent = `${matchedPairs} / 8`;

      playSuccessSound();
      flippedCards = [];
      isChecking = false;

      renderCards();

      if (matchedPairs === CAT_CARD_EMOJIS.length) {
        finishGame();
      }
    } else {
      // Mismatch
      setTimeout(() => {
        first.card.isFlipped = false;
        second.card.isFlipped = false;
        flippedCards = [];
        isChecking = false;
        renderCards();
      }, 850);
    }
  }
}

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000;
  const timerEl = document.getElementById('cm-timer');
  if (timerEl) timerEl.textContent = `${elapsed.toFixed(1)}s`;
}

function finishGame() {
  clearInterval(timerInterval);
  isPlaying = false;

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Score submission (Lower turns is better)
  submitScore('card-memory-game', turnsCount, `${turnsCount} turns (${totalTime}s)`);

  document.getElementById('cm-modal-turns').textContent = turnsCount;
  document.getElementById('cm-modal-time').textContent = `${totalTime}s`;
  document.getElementById('cm-modal').classList.add('open');
}

function bindEvents() {
  const resetBtn = document.getElementById('cm-reset-btn');
  const modalRetry = document.getElementById('cm-modal-retry');

  if (resetBtn) resetBtn.addEventListener('click', initGame);
  if (modalRetry) {
    modalRetry.addEventListener('click', () => {
      document.getElementById('cm-modal').classList.remove('open');
      initGame();
    });
  }
}

export function cleanupCardMemoryGame() {
  if (timerInterval) clearInterval(timerInterval);
}
