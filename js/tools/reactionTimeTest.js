/* ==========================================================================
   CatKeyLab - Reaction Time Test Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';
import { submitScore } from '../leaderboard.js';

let state = 'start'; // 'start', 'wait', 'ready', 'early', 'result'
let startTime = null;
let waitTimeout = null;
let attempts = [];

export function renderReactionTimeTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span data-i18n="reactionTestTitle">${t('reactionTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="reactionTestSubtitle">${t('reactionTestSubtitle')}</p>
        </div>
      </div>

      <!-- State Box Target Area -->
      <div id="rt-target-box" class="reaction-box reaction-state-start">
        <div id="rt-icon" style="font-size:3.5rem; margin-bottom:1rem;">🎯</div>
        <div id="rt-msg-title" style="font-size:1.8rem; font-weight:800;" data-i18n="reactionStateStart">${t('reactionStateStart')}</div>
        <div id="rt-msg-sub" style="font-size:1rem; opacity:0.9; margin-top:0.5rem;">Click when ready</div>
      </div>

      <!-- Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-box">
          <div id="rt-val-last" class="stat-value">0 ms</div>
          <div class="stat-label">Last Reaction</div>
        </div>
        <div class="stat-box">
          <div id="rt-val-best" class="stat-value">${getBestReaction()} ms</div>
          <div class="stat-label" data-i18n="lblBestReaction">${t('lblBestReaction')}</div>
        </div>
        <div class="stat-box">
          <div id="rt-val-avg" class="stat-value">0 ms</div>
          <div class="stat-label" data-i18n="lblAvgReaction">${t('lblAvgReaction')}</div>
        </div>
        <div class="stat-box">
          <div id="rt-val-attempts" class="stat-value">0</div>
          <div class="stat-label">Attempts</div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const targetBox = document.getElementById('rt-target-box');
  if (targetBox) {
    targetBox.addEventListener('click', handleBoxClick);
  }
}

function handleBoxClick() {
  const targetBox = document.getElementById('rt-target-box');
  const icon = document.getElementById('rt-icon');
  const title = document.getElementById('rt-msg-title');
  const sub = document.getElementById('rt-msg-sub');

  if (state === 'start' || state === 'result' || state === 'early') {
    // Transition to WAIT
    state = 'wait';
    targetBox.className = 'reaction-box reaction-state-wait';
    icon.textContent = '⏳';
    title.textContent = t('reactionStateWait');
    sub.textContent = 'Keep your finger ready on the mouse button...';

    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2s - 5s
    waitTimeout = setTimeout(() => {
      // Transition to READY
      state = 'ready';
      startTime = performance.now();
      targetBox.className = 'reaction-box reaction-state-ready';
      icon.textContent = '⚡';
      title.textContent = t('reactionStateReady');
      sub.textContent = 'CLICK NOW!';
    }, randomDelay);
  } else if (state === 'wait') {
    // Clicked TOO EARLY
    clearTimeout(waitTimeout);
    state = 'early';
    playClickSound(300, 0.08);
    targetBox.className = 'reaction-box reaction-state-early';
    icon.textContent = '⚠️';
    title.textContent = t('reactionStateTooEarly');
    sub.textContent = 'Click to try again';
  } else if (state === 'ready') {
    // Successful Reaction Click!
    const reactionTime = Math.round(performance.now() - startTime);
    playClickSound(900, 0.04);
    state = 'result';
    attempts.push(reactionTime);
    saveBestReaction(reactionTime);

    const rankInfo = submitScore('reaction-time-test', reactionTime, `${reactionTime} ms`);

    targetBox.className = 'reaction-box reaction-state-result';
    icon.textContent = '🏆';
    title.textContent = `${reactionTime} ms`;
    sub.innerHTML = `${getRatingString(reactionTime)} • <strong>${rankInfo ? rankInfo.percentile : ''}</strong> (Click to try again)`;

    updateDashboard(reactionTime);
  }
}

function updateDashboard(lastMs) {
  document.getElementById('rt-val-last').textContent = `${lastMs} ms`;
  document.getElementById('rt-val-best').textContent = `${getBestReaction()} ms`;
  
  const sum = attempts.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / attempts.length);
  document.getElementById('rt-val-avg').textContent = `${avg} ms`;
  document.getElementById('rt-val-attempts').textContent = attempts.length;
}

function getRatingString(ms) {
  if (ms < 150) return '🚀 Superhuman speed!';
  if (ms < 200) return '⚡ Excellent reflex!';
  if (ms < 250) return '👍 Above Average';
  if (ms < 320) return '😐 Average';
  return '🐢 Below Average';
}

function getBestReaction() {
  return localStorage.getItem('catkeylab_reaction_best') || '0';
}

function saveBestReaction(ms) {
  const current = parseInt(getBestReaction());
  if (current === 0 || ms < current) {
    localStorage.setItem('catkeylab_reaction_best', ms);
  }
}

export function cleanupReactionTimeTest() {
  if (waitTimeout) clearTimeout(waitTimeout);
}
