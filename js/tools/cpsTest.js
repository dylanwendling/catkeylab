/* ==========================================================================
   ClickPulse - CPS Test (Clicks Per Second) Tool Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound, triggerVibration } from '../audio.js';

let testState = 'idle'; // 'idle', 'running', 'finished'
let selectedDuration = 5;
let clickCount = 0;
let startTime = null;
let timerInterval = null;

export function renderCPSTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span data-i18n="cpsTestTitle">${t('cpsTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="cpsTestSubtitle">${t('cpsTestSubtitle')}</p>
        </div>
      </div>

      <!-- Duration Selector Tabs -->
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
        <button class="btn btn-sm btn-secondary cps-dur-btn active" data-dur="1">1 Sec</button>
        <button class="btn btn-sm btn-secondary cps-dur-btn" data-dur="5">5 Sec</button>
        <button class="btn btn-sm btn-secondary cps-dur-btn" data-dur="10">10 Sec</button>
        <button class="btn btn-sm btn-secondary cps-dur-btn" data-dur="30">30 Sec</button>
        <button class="btn btn-sm btn-secondary cps-dur-btn" data-dur="60">60 Sec</button>
      </div>

      <!-- Progress Bar Indicator -->
      <div style="width:100%; height:8px; background:var(--bg-tertiary); border-radius:var(--radius-full); overflow:hidden; margin-bottom:1.5rem;">
        <div id="cps-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, var(--accent-primary), var(--accent-cyan)); transition:width 0.1s linear;"></div>
      </div>

      <!-- Interactive Big Target Box -->
      <div id="cps-target-box" class="click-target-area" style="min-height:280px;">
        <div class="target-icon">⚡</div>
        <div id="cps-prompt-title" class="target-prompt" data-i18n="cpsTargetPrompt">${t('cpsTargetPrompt')}</div>
        <div id="cps-prompt-sub" class="target-subprompt" data-i18n="cpsTargetSubprompt">${t('cpsTargetSubprompt')}</div>
      </div>

      <!-- Live Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-box">
          <div id="cps-val-clicks" class="stat-value">0</div>
          <div class="stat-label" data-i18n="lblTotalClicks">${t('lblTotalClicks')}</div>
        </div>
        <div class="stat-box">
          <div id="cps-val-cps" class="stat-value">0.0</div>
          <div class="stat-label" data-i18n="lblCPS">${t('lblCPS')}</div>
        </div>
        <div class="stat-box">
          <div id="cps-val-timer" class="stat-value">${selectedDuration}.0s</div>
          <div class="stat-label">Time Remaining</div>
        </div>
        <div class="stat-box">
          <div id="cps-val-best" class="stat-value">${getBestCPS(selectedDuration)}</div>
          <div class="stat-label" data-i18n="lblPersonalBest">${t('lblPersonalBest')}</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:1.5rem;">
        <button id="cps-reset-btn" class="btn btn-secondary">
          <span data-i18n="btnReset">${t('btnReset')}</span>
        </button>
      </div>
    </div>

    <!-- Result Modal -->
    <div id="cps-modal" class="modal-overlay">
      <div class="modal-card">
        <h2 style="font-size:1.8rem; margin-bottom:0.5rem;">🎉 Test Completed!</h2>
        <p style="color:var(--text-secondary);">Here is your click speed breakdown:</p>
        
        <div class="modal-badge" id="cps-modal-cps">0.0 CPS</div>
        <p id="cps-modal-rank" style="font-weight:700; color:var(--accent-cyan); margin-bottom:1rem;"></p>

        <div class="stats-dashboard" style="margin-bottom:1.5rem;">
          <div class="stat-box">
            <div id="cps-modal-total" class="stat-value">0</div>
            <div class="stat-label">Total Clicks</div>
          </div>
          <div class="stat-box">
            <div id="cps-modal-dur" class="stat-value">0s</div>
            <div class="stat-label">Duration</div>
          </div>
        </div>

        <button id="cps-modal-close" class="btn btn-primary btn-lg" style="width:100%;">Try Again</button>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const durBtns = document.querySelectorAll('.cps-dur-btn');
  const targetBox = document.getElementById('cps-target-box');
  const resetBtn = document.getElementById('cps-reset-btn');
  const modalClose = document.getElementById('cps-modal-close');

  durBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (testState === 'running') return;
      durBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      selectedDuration = parseInt(btn.dataset.dur);
      resetTest();
    });
  });

  targetBox.addEventListener('click', (e) => {
    handleTargetClick(e);
  });

  resetBtn.addEventListener('click', resetTest);
  modalClose.addEventListener('click', () => {
    document.getElementById('cps-modal').classList.remove('open');
    resetTest();
  });
}

function handleTargetClick(e) {
  if (testState === 'finished') return;

  if (testState === 'idle') {
    testState = 'running';
    startTime = Date.now();
    clickCount = 1;
    playClickSound(800, 0.03);
    triggerVibration(20);

    const promptTitle = document.getElementById('cps-prompt-title');
    const promptSub = document.getElementById('cps-prompt-sub');
    if (promptTitle) promptTitle.textContent = 'KEEP CLICKING FAST!';
    if (promptSub) promptSub.textContent = 'Timer is ticking...';

    startTimer();
  } else if (testState === 'running') {
    clickCount++;
    playClickSound(800 + Math.min(clickCount * 10, 400), 0.03);
    triggerVibration(15);
  }

  updateLiveStats();
  createRipple(e);
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, selectedDuration - elapsed);

    const timerEl = document.getElementById('cps-val-timer');
    const progressBar = document.getElementById('cps-progress-bar');

    if (timerEl) timerEl.textContent = remaining.toFixed(1) + 's';
    if (progressBar) {
      const pct = Math.min(100, (elapsed / selectedDuration) * 100);
      progressBar.style.width = `${pct}%`;
    }

    if (remaining <= 0) {
      finishTest();
    }
  }, 50);
}

function updateLiveStats() {
  const clicksEl = document.getElementById('cps-val-clicks');
  const cpsEl = document.getElementById('cps-val-cps');

  if (clicksEl) clicksEl.textContent = clickCount;
  if (cpsEl && startTime) {
    const elapsed = Math.max(0.1, (Date.now() - startTime) / 1000);
    cpsEl.textContent = (clickCount / elapsed).toFixed(1);
  }
}

function finishTest() {
  testState = 'finished';
  clearInterval(timerInterval);

  const finalCPS = (clickCount / selectedDuration).toFixed(1);
  saveBestCPS(selectedDuration, finalCPS);

  // Determine Rank
  let rank = '🐢 Turtle';
  if (finalCPS >= 13) rank = '⚡ Cybergod (13+ CPS)';
  else if (finalCPS >= 10) rank = '🐆 Cheetah (10-13 CPS)';
  else if (finalCPS >= 7) rank = '🐇 Rabbit (7-10 CPS)';
  else if (finalCPS >= 5) rank = '🐕 Greyhound (5-7 CPS)';

  document.getElementById('cps-modal-cps').textContent = `${finalCPS} CPS`;
  document.getElementById('cps-modal-rank').textContent = `Rank: ${rank}`;
  document.getElementById('cps-modal-total').textContent = clickCount;
  document.getElementById('cps-modal-dur').textContent = `${selectedDuration}s`;
  document.getElementById('cps-modal').classList.add('open');
}

function createRipple(e) {
  const targetBox = document.getElementById('cps-target-box');
  if (!targetBox) return;
  const rect = targetBox.getBoundingClientRect();
  const x = e ? e.clientX - rect.left : rect.width / 2;
  const y = e ? e.clientY - rect.top : rect.height / 2;

  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '70px';
  ripple.style.height = '70px';
  targetBox.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

function resetTest() {
  testState = 'idle';
  clickCount = 0;
  startTime = null;
  if (timerInterval) clearInterval(timerInterval);

  const timerEl = document.getElementById('cps-val-timer');
  const clicksEl = document.getElementById('cps-val-clicks');
  const cpsEl = document.getElementById('cps-val-cps');
  const progressBar = document.getElementById('cps-progress-bar');
  const promptTitle = document.getElementById('cps-prompt-title');
  const promptSub = document.getElementById('cps-prompt-sub');
  const bestEl = document.getElementById('cps-val-best');

  if (timerEl) timerEl.textContent = `${selectedDuration}.0s`;
  if (clicksEl) clicksEl.textContent = '0';
  if (cpsEl) cpsEl.textContent = '0.0';
  if (progressBar) progressBar.style.width = '0%';
  if (promptTitle) promptTitle.textContent = t('cpsTargetPrompt');
  if (promptSub) promptSub.textContent = t('cpsTargetSubprompt');
  if (bestEl) bestEl.textContent = getBestCPS(selectedDuration);
}

function getBestCPS(dur) {
  return localStorage.getItem(`clickpulse_cps_best_${dur}`) || '0.0';
}

function saveBestCPS(dur, cps) {
  const current = parseFloat(getBestCPS(dur));
  if (parseFloat(cps) > current) {
    localStorage.setItem(`clickpulse_cps_best_${dur}`, cps);
  }
}

export function cleanupCPSTest() {
  if (timerInterval) clearInterval(timerInterval);
}
