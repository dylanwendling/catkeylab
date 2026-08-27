/* ==========================================================================
   CatKeyLab - Double Click Tester Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let lastClickTime = null;
let doubleClickLog = [];

export function renderDoubleClickTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
            </svg>
            <span data-i18n="doubleClickTitle">${t('doubleClickTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="doubleClickSubtitle">${t('doubleClickSubtitle')}</p>
        </div>
      </div>

      <!-- Target Box -->
      <div id="dct-target-box" class="click-target-area" style="min-height:240px;">
        <div class="target-icon">👆👆</div>
        <div class="target-prompt">DOUBLE CLICK HERE</div>
        <div class="target-subprompt">Perform rapid double-clicks to measure speed and detect mouse switch defects</div>
      </div>

      <!-- Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-box">
          <div id="dct-val-interval" class="stat-value">0 ms</div>
          <div class="stat-label" data-i18n="lblDoubleInterval">${t('lblDoubleInterval')}</div>
        </div>
        <div class="stat-box">
          <div id="dct-val-rating" class="stat-value" style="font-size:1.2rem; color:var(--accent-cyan);">Waiting...</div>
          <div class="stat-label" data-i18n="lblStatusRating">${t('lblStatusRating')}</div>
        </div>
        <div class="stat-box">
          <div id="dct-val-fastest" class="stat-value">0 ms</div>
          <div class="stat-label">Fastest Double Click</div>
        </div>
        <div class="stat-box">
          <div id="dct-val-chatter" class="stat-value" style="color:var(--accent-emerald);">0</div>
          <div class="stat-label">Faulty Double Clicks</div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const targetBox = document.getElementById('dct-target-box');
  if (targetBox) {
    targetBox.addEventListener('click', handleTargetClick);
  }
}

function handleTargetClick(e) {
  const now = performance.now();
  playClickSound(700, 0.03);

  if (lastClickTime !== null) {
    const diff = Math.round(now - lastClickTime);

    if (diff < 500) { // Considered a double click pair
      evaluateDoubleClick(diff);
      lastClickTime = null; // Reset for next pair
      createRipple(e);
      return;
    }
  }

  lastClickTime = now;
}

function evaluateDoubleClick(ms) {
  document.getElementById('dct-val-interval').textContent = `${ms} ms`;
  
  let rating = 'Normal';
  let color = 'var(--accent-cyan)';
  let isFaulty = false;

  if (ms < 50) {
    rating = '⚠️ Faulty Hardware Chatter (<50ms)';
    color = 'var(--accent-rose)';
    isFaulty = true;
  } else if (ms < 100) {
    rating = '⚡ Ultra Fast (50-100ms)';
    color = 'var(--accent-emerald)';
  } else if (ms < 220) {
    rating = '👍 Fast Double Click (100-220ms)';
    color = 'var(--accent-primary)';
  } else {
    rating = '🐢 Slow Double Click (>220ms)';
    color = 'var(--text-secondary)';
  }

  const ratingEl = document.getElementById('dct-val-rating');
  if (ratingEl) {
    ratingEl.textContent = rating;
    ratingEl.style.color = color;
  }

  // Fastest Tracking
  const fastestEl = document.getElementById('dct-val-fastest');
  if (fastestEl) {
    const currentFastest = parseInt(fastestEl.textContent) || 9999;
    if (ms >= 50 && ms < currentFastest) {
      fastestEl.textContent = `${ms} ms`;
    }
  }

  // Faulty Counter
  if (isFaulty) {
    const chatterEl = document.getElementById('dct-val-chatter');
    if (chatterEl) {
      chatterEl.textContent = parseInt(chatterEl.textContent) + 1;
    }
  }
}

function createRipple(e) {
  const targetBox = document.getElementById('dct-target-box');
  if (!targetBox) return;
  const rect = targetBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '70px';
  ripple.style.height = '70px';
  targetBox.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

export function cleanupDoubleClickTest() {}
