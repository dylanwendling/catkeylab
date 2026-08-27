/* ==========================================================================
   ClickPulse - Online Click Counter Tool Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, triggerVibration, toggleSound, isSoundEnabled } from '../audio.js';

let count = 0;

export function renderClickCounter(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
            </svg>
            <span data-i18n="counterTitle">${t('counterTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="counterSubtitle">${t('counterSubtitle')}</p>
        </div>
      </div>

      <!-- Controls Row -->
      <div class="control-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom:1.5rem;">
        <div class="form-group">
          <label class="form-label" data-i18n="lblGoal">${t('lblGoal')}</label>
          <input type="number" id="cc-goal-input" class="form-input" placeholder="Optional Goal (e.g. 100)" min="1">
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblSound">${t('lblSound')}</label>
          <button id="cc-sound-toggle" class="btn btn-secondary" style="width:100%;">
            🔊 Sound: <span id="cc-sound-status">${isSoundEnabled() ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblVibration">${t('lblVibration')}</label>
          <button id="cc-vib-toggle" class="btn btn-secondary" style="width:100%;">
            📳 Vibration: ON
          </button>
        </div>
      </div>

      <!-- Big Counter Target Pad -->
      <div id="cc-counter-pad" class="click-target-area" style="min-height:300px; background:linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.08));">
        <div id="cc-count-display" style="font-size: clamp(4rem, 12vw, 7rem); font-weight:900; color:var(--text-primary); line-height:1; user-select:none;">0</div>
        <div style="font-size:1.1rem; color:var(--text-secondary); margin-top:0.75rem;">Click anywhere or press Spacebar / Enter</div>
      </div>

      <!-- Action Button Bar -->
      <div style="display:flex; justify-content:center; gap:1rem; margin-top:1.75rem; flex-wrap:wrap;">
        <button id="cc-btn-add" class="btn btn-primary btn-lg" style="min-width:140px;">
          +1 Click
        </button>
        <button id="cc-btn-sub" class="btn btn-secondary btn-lg" style="min-width:140px;">
          -1 Subtract
        </button>
        <button id="cc-btn-reset" class="btn btn-secondary btn-lg">
          <span data-i18n="btnReset">${t('btnReset')}</span>
        </button>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const pad = document.getElementById('cc-counter-pad');
  const addBtn = document.getElementById('cc-btn-add');
  const subBtn = document.getElementById('cc-btn-sub');
  const resetBtn = document.getElementById('cc-btn-reset');
  const soundToggle = document.getElementById('cc-sound-toggle');

  pad.addEventListener('click', (e) => {
    increment(e);
  });

  addBtn.addEventListener('click', (e) => {
    increment(e);
  });

  subBtn.addEventListener('click', () => {
    decrement();
  });

  resetBtn.addEventListener('click', reset);

  soundToggle.addEventListener('click', () => {
    const newState = toggleSound();
    document.getElementById('cc-sound-status').textContent = newState ? 'ON' : 'OFF';
  });

  window.addEventListener('keydown', handleKeydown);
}

function handleKeydown(e) {
  if ((e.code === 'Space' || e.code === 'Enter') && e.target.tagName !== 'INPUT') {
    e.preventDefault();
    increment();
  }
}

function increment(e) {
  count++;
  updateDisplay();
  playClickSound(650 + Math.min(count % 50 * 10, 300), 0.04);
  triggerVibration(25);

  if (e && e.target) {
    createRipple(e);
  }

  // Check goal
  const goalVal = parseInt(document.getElementById('cc-goal-input').value);
  if (goalVal && count === goalVal) {
    setTimeout(() => {
      alert(`🎯 Goal of ${goalVal} clicks reached! Great job!`);
    }, 50);
  }
}

function decrement() {
  if (count > 0) {
    count--;
    updateDisplay();
    playClickSound(450, 0.04);
  }
}

function reset() {
  count = 0;
  updateDisplay();
}

function updateDisplay() {
  const el = document.getElementById('cc-count-display');
  if (el) el.textContent = count;
}

function createRipple(e) {
  const pad = document.getElementById('cc-counter-pad');
  if (!pad || !e.clientX) return;
  const rect = pad.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '80px';
  ripple.style.height = '80px';
  pad.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

export function cleanupClickCounter() {
  window.removeEventListener('keydown', handleKeydown);
}
