/* ==========================================================================
   CatKeyLab - Online Auto Clicker Tool Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let isRunning = false;
let clickIntervalId = null;
let totalClicks = 0;
let startTime = null;

export function renderAutoClicker(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
            </svg>
            <span data-i18n="autoClickerTitle">${t('autoClickerTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="autoClickerSubtitle">${t('autoClickerSubtitle')}</p>
        </div>
        <div id="ac-status-badge" class="status-pill status-idle">
          <span class="status-dot"></span>
          <span id="ac-status-text" data-i18n="statusIdle">${t('statusIdle')}</span>
        </div>
      </div>

      <!-- Limitation Notice Box -->
      <div class="notice-box">
        <div class="notice-icon">⚠️</div>
        <div>
          <strong data-i18n="limitationTitle">${t('limitationTitle')}</strong>: 
          <span data-i18n="limitationDesc">${t('limitationDesc')}</span>
        </div>
      </div>

      <!-- Settings Controls -->
      <div class="control-grid">
        <div class="form-group">
          <label class="form-label" data-i18n="lblInterval">${t('lblInterval')}</label>
          <input type="number" id="ac-interval" class="form-input" value="100" min="10" max="10000" step="10">
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblCPS">${t('lblCPS')}</label>
          <input type="number" id="ac-cps" class="form-input" value="10" min="0.1" max="100" step="0.1">
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblButton">${t('lblButton')}</label>
          <select id="ac-button" class="form-select">
            <option value="left" data-i18n="optLeft">${t('optLeft')}</option>
            <option value="middle" data-i18n="optMiddle">${t('optMiddle')}</option>
            <option value="right" data-i18n="optRight">${t('optRight')}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblClickType">${t('lblClickType')}</label>
          <select id="ac-type" class="form-select">
            <option value="single" data-i18n="optSingle">${t('optSingle')}</option>
            <option value="double" data-i18n="optDouble">${t('optDouble')}</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblTargetCount">${t('lblTargetCount')}</label>
          <select id="ac-limit-mode" class="form-select">
            <option value="infinite" data-i18n="optInfinite">${t('optInfinite')}</option>
            <option value="target" data-i18n="optTarget">${t('optTarget')}</option>
          </select>
        </div>

        <div class="form-group" id="ac-limit-count-wrapper" style="display:none;">
          <label class="form-label">Count Limit</label>
          <input type="number" id="ac-limit-count" class="form-input" value="100" min="1" max="100000">
        </div>

        <div class="form-group">
          <label class="form-label" data-i18n="lblStartHotkey">${t('lblStartHotkey')}</label>
          <input type="text" id="ac-start-key" class="form-input" value="Space" readonly>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
        <button id="ac-toggle-btn" class="btn btn-primary btn-lg" style="min-width:180px;">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span id="ac-btn-text" data-i18n="btnStart">${t('btnStart')}</span> (Space)
        </button>

        <button id="ac-reset-btn" class="btn btn-secondary">
          <span data-i18n="btnReset">${t('btnReset')}</span>
        </button>
      </div>

      <!-- Live Interactive Target Pad -->
      <div id="ac-target-area" class="click-target-area">
        <div class="target-icon">🎯</div>
        <div class="target-prompt" data-i18n="autoClickerTargetPrompt">${t('autoClickerTargetPrompt')}</div>
        <div class="target-subprompt" data-i18n="autoClickerTargetSubprompt">${t('autoClickerTargetSubprompt')}</div>
      </div>

      <!-- Live Stats Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-box">
          <div id="ac-stat-clicks" class="stat-value">0</div>
          <div class="stat-label" data-i18n="lblTotalClicks">${t('lblTotalClicks')}</div>
        </div>
        <div class="stat-box">
          <div id="ac-stat-cps" class="stat-value">0.0</div>
          <div class="stat-label" data-i18n="lblCPS">${t('lblCPS')}</div>
        </div>
        <div class="stat-box">
          <div id="ac-stat-time" class="stat-value">0s</div>
          <div class="stat-label">Elapsed Time</div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const intervalInput = document.getElementById('ac-interval');
  const cpsInput = document.getElementById('ac-cps');
  const limitModeSelect = document.getElementById('ac-limit-mode');
  const limitCountWrapper = document.getElementById('ac-limit-count-wrapper');
  const toggleBtn = document.getElementById('ac-toggle-btn');
  const resetBtn = document.getElementById('ac-reset-btn');
  const targetArea = document.getElementById('ac-target-area');

  // Sync Interval <-> CPS
  intervalInput.addEventListener('input', () => {
    const val = parseFloat(intervalInput.value);
    if (val > 0) {
      cpsInput.value = (1000 / val).toFixed(1);
    }
  });

  cpsInput.addEventListener('input', () => {
    const val = parseFloat(cpsInput.value);
    if (val > 0) {
      intervalInput.value = Math.round(1000 / val);
    }
  });

  limitModeSelect.addEventListener('change', () => {
    limitCountWrapper.style.display = limitModeSelect.value === 'target' ? 'flex' : 'none';
  });

  toggleBtn.addEventListener('click', toggleAutoClicker);
  resetBtn.addEventListener('click', resetStats);

  // Allow manual clicking on target pad too
  targetArea.addEventListener('click', (e) => {
    triggerTargetClick(e);
  });

  // Hotkey Space listener
  window.addEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(e) {
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    toggleAutoClicker();
  }
}

function toggleAutoClicker() {
  if (isRunning) {
    stopAutoClicker();
  } else {
    startAutoClicker();
  }
}

function startAutoClicker() {
  isRunning = true;
  startTime = Date.now();
  
  const statusBadge = document.getElementById('ac-status-badge');
  const statusText = document.getElementById('ac-status-text');
  const btnText = document.getElementById('ac-btn-text');
  const toggleBtn = document.getElementById('ac-toggle-btn');

  statusBadge.className = 'status-pill status-running';
  statusText.textContent = t('statusRunning');
  btnText.textContent = t('btnStop');
  toggleBtn.className = 'btn btn-danger btn-lg';

  const interval = Math.max(10, parseInt(document.getElementById('ac-interval').value) || 100);
  const isDouble = document.getElementById('ac-type').value === 'double';
  const limitMode = document.getElementById('ac-limit-mode').value;
  const limitCount = parseInt(document.getElementById('ac-limit-count').value) || 100;

  clickIntervalId = setInterval(() => {
    triggerTargetClick();
    if (isDouble) {
      setTimeout(() => triggerTargetClick(), 30);
    }

    if (limitMode === 'target' && totalClicks >= limitCount) {
      stopAutoClicker();
    }
  }, interval);
}

function stopAutoClicker() {
  isRunning = false;
  if (clickIntervalId) {
    clearInterval(clickIntervalId);
    clickIntervalId = null;
  }

  const statusBadge = document.getElementById('ac-status-badge');
  const statusText = document.getElementById('ac-status-text');
  const btnText = document.getElementById('ac-btn-text');
  const toggleBtn = document.getElementById('ac-toggle-btn');

  if (statusBadge) {
    statusBadge.className = 'status-pill status-idle';
    statusText.textContent = t('statusIdle');
    btnText.textContent = t('btnStart');
    toggleBtn.className = 'btn btn-primary btn-lg';
  }
}

function triggerTargetClick(e) {
  totalClicks++;
  playClickSound(700, 0.03);

  const clicksEl = document.getElementById('ac-stat-clicks');
  const cpsEl = document.getElementById('ac-stat-cps');
  const timeEl = document.getElementById('ac-stat-time');
  const targetArea = document.getElementById('ac-target-area');

  if (clicksEl) clicksEl.textContent = totalClicks;

  if (startTime) {
    const elapsedSec = (Date.now() - startTime) / 1000;
    if (timeEl) timeEl.textContent = elapsedSec.toFixed(1) + 's';
    if (cpsEl && elapsedSec > 0) {
      cpsEl.textContent = (totalClicks / elapsedSec).toFixed(1);
    }
  }

  // Create visual ripple on target box
  if (targetArea) {
    const rect = targetArea.getBoundingClientRect();
    const x = e ? e.clientX - rect.left : rect.width / 2;
    const y = e ? e.clientY - rect.top : rect.height / 2;

    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '60px';
    ripple.style.height = '60px';
    targetArea.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}

function resetStats() {
  stopAutoClicker();
  totalClicks = 0;
  startTime = null;
  document.getElementById('ac-stat-clicks').textContent = '0';
  document.getElementById('ac-stat-cps').textContent = '0.0';
  document.getElementById('ac-stat-time').textContent = '0s';
}

export function cleanupAutoClicker() {
  stopAutoClicker();
  window.removeEventListener('keydown', handleGlobalKeydown);
}
