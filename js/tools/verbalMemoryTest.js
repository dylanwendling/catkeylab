/* ==========================================================================
   CatKeyLab - Verbal Memory Test (Sequential Word Recall Challenge)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

const WORD_BANK = [
  "river", "mountain", "keyboard", "sunset", "whisper", "emerald", "velocity", "galaxy",
  "shadow", "feather", "harbor", "phantom", "echo", "crystal", "lantern", "thunder",
  "mirage", "horizon", "beacon", "pinnacle", "circuit", "silence", "harvest", "compass",
  "orbit", "glacier", "prism", "tempest", "synergy", "vortex", "meadow", "blasphemy",
  "spectrum", "cascade", "radiance", "solitude", "nebula", "zenith", "labyrinth", "illusion",
  "infinity", "friction", "paradox", "resonance", "twilight", "catalyst", "monolith", "eclipse",
  "frontier", "sanctuary", "serenade", "threshold", "oblivion", "continuum", "spectrum", "solace",
  "avalanche", "bastion", "meridian", "phenomenon", "quicksand", "sovereign", "tremor", "wanderer",
  "abyss", "alchemist", "aqueduct", "boulder", "celestial", "dynasty", "element", "fortress",
  "gargoyle", "helix", "irony", "jungle", "kingdom", "lineage", "majesty", "nomad",
  "oasis", "paladin", "quarry", "relic", "safari", "tapestry", "utopia", "valkyrie"
];

let score = 0;
let lives = 3;
let seenWords = new Set();
let currentWord = '';
let isCurrentWordSeen = false;
let state = 'start'; // 'start', 'playing', 'game_over'

export function renderVerbalMemoryTest(container) {
  cleanupVerbalMemoryTest();

  const savedBest = localStorage.getItem('catkeylab_verbal_best') || '0';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">💬</span>
            <span data-i18n="verbalTestTitle">${t('verbalTestTitle') || 'Verbal Memory Test'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="verbalTestSubtitle">
            ${t('verbalTestSubtitle') || 'Keep as many words in short-term memory as possible.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="vb-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="vb-val-score" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">0</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat-box">
          <div id="vb-val-lives" class="stat-value" style="color:var(--accent-rose); font-size:2.2rem;">3 / 3</div>
          <div class="stat-label">Lives</div>
        </div>
        <div class="stat-box">
          <div id="vb-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${savedBest}</div>
          <div class="stat-label">Personal Best Score</div>
        </div>
      </div>

      <!-- Verbal Card Arena -->
      <div class="vb-card">
        <!-- Start Phase -->
        <div id="vb-start-view" class="vb-view">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">💬</div>
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Verbal Memory</h2>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">You will be shown words one by one. Click <strong>SEEN</strong> if you have seen the word in this test, or <strong>NEW</strong> if it is appearing for the first time.</p>
          <button id="vb-start-btn" class="btn btn-primary btn-lg">Start Test</button>
        </div>

        <!-- Gameplay Phase -->
        <div id="vb-play-view" class="vb-view" style="display:none;">
          <div id="vb-word-display" class="vb-word-text">word</div>
          <div class="vb-action-buttons">
            <button id="vb-btn-seen" class="btn btn-secondary btn-lg vb-choice-btn">
              <span>👁️ SEEN</span>
            </button>
            <button id="vb-btn-new" class="btn btn-primary btn-lg vb-choice-btn">
              <span>✨ NEW</span>
            </button>
          </div>
        </div>

        <!-- Game Over View -->
        <div id="vb-result-view" class="vb-view" style="display:none;">
          <div style="font-size:3.5rem; margin-bottom:0.5rem;">💔</div>
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Game Over</h2>
          <p style="color:var(--text-secondary); margin-bottom:1rem;">You ran out of lives!</p>
          <h3 id="vb-final-score-text" style="font-size:2rem; font-weight:800; color:var(--accent-cyan); margin-bottom:1.5rem;">Score: 0</h3>
          <button id="vb-retry-btn" class="btn btn-primary btn-lg">Try Again</button>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('vb-start-btn');
  const retryBtn = document.getElementById('vb-retry-btn');
  const resetBtn = document.getElementById('vb-reset-btn');
  const seenBtn = document.getElementById('vb-btn-seen');
  const newBtn = document.getElementById('vb-btn-new');

  if (startBtn) startBtn.addEventListener('click', startGame);
  if (retryBtn) retryBtn.addEventListener('click', startGame);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupVerbalMemoryTest();
      startGame();
    });
  }

  if (seenBtn) seenBtn.addEventListener('click', () => handleChoice(true));
  if (newBtn) newBtn.addEventListener('click', () => handleChoice(false));
}

function startGame() {
  score = 0;
  lives = 3;
  seenWords.clear();
  state = 'playing';

  updateDashboard();
  hideAllViews();

  const playView = document.getElementById('vb-play-view');
  if (playView) playView.style.display = 'flex';

  nextWord();
}

function nextWord() {
  const wordsSeenArr = Array.from(seenWords);
  const shouldPickSeen = wordsSeenArr.length > 2 && Math.random() < 0.45;

  if (shouldPickSeen) {
    currentWord = wordsSeenArr[Math.floor(Math.random() * wordsSeenArr.length)];
    isCurrentWordSeen = true;
  } else {
    // Pick unseen word
    const unseenPool = WORD_BANK.filter(w => !seenWords.has(w));
    if (unseenPool.length > 0) {
      currentWord = unseenPool[Math.floor(Math.random() * unseenPool.length)];
    } else {
      currentWord = wordsSeenArr[Math.floor(Math.random() * wordsSeenArr.length)];
    }
    isCurrentWordSeen = seenWords.has(currentWord);
  }

  const wordEl = document.getElementById('vb-word-display');
  if (wordEl) wordEl.textContent = currentWord;
}

function handleChoice(userSaidSeen) {
  if (state !== 'playing') return;

  if (userSaidSeen === isCurrentWordSeen) {
    // Correct!
    playClickSound(750, 0.04);
    score++;
    seenWords.add(currentWord);
    updateDashboard();
    nextWord();
  } else {
    // Wrong choice!
    playClickSound(300, 0.08);
    lives--;
    seenWords.add(currentWord);
    updateDashboard();

    if (lives <= 0) {
      handleGameOver();
    } else {
      nextWord();
    }
  }
}

function updateDashboard() {
  document.getElementById('vb-val-score').textContent = score;
  document.getElementById('vb-val-lives').textContent = `${lives} / 3`;

  saveBestScore(score);
  const best = localStorage.getItem('catkeylab_verbal_best') || score;
  document.getElementById('vb-val-best').textContent = best;
}

function handleGameOver() {
  state = 'game_over';
  hideAllViews();

  const rankInfo = score > 0 ? submitScore('verbal-memory-test', score, `${score} Words`) : null;

  const resultView = document.getElementById('vb-result-view');
  if (resultView) resultView.style.display = 'flex';

  document.getElementById('vb-final-score-text').innerHTML = `
    <div>Score: ${score} words</div>
    <div style="font-size:1.1rem; color:var(--accent-emerald); font-weight:700; margin-top:0.4rem; margin-bottom:0.75rem;">🏆 Rank #${rankInfo ? rankInfo.rank : '-'} • ${rankInfo ? rankInfo.percentile : ''}</div>
    <a href="#leaderboards" class="btn btn-secondary btn-sm" style="margin-bottom:0.75rem;">🏆 View Global Leaderboard</a>
  `;
}

function hideAllViews() {
  ['vb-start-view', 'vb-play-view', 'vb-result-view'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function saveBestScore(currentScore) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_verbal_best') || '0');
  if (currentScore > currentBest) {
    localStorage.setItem('catkeylab_verbal_best', currentScore);
  }
}

export function cleanupVerbalMemoryTest() {
  state = 'start';
}
