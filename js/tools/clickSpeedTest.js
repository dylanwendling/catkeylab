/* ==========================================================================
   CatKeyLab - Click Speed Test Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let isRunning = false;
let clickTimes = [];
let startTime = null;
let timerId = null;

export function renderClickSpeedTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <span data-i18n="speedTestTitle">${t('speedTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="speedTestSubtitle">${t('speedTestSubtitle')}</p>
        </div>
      </div>

      <!-- Live Speed Gauge Bar -->
      <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); text-align:center; margin-bottom:1.5rem; border:1px solid var(--border-color);">
        <div style="font-size:0.85rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">Velocity Gauge</div>
        <div id="cst-gauge-val" style="font-size:3.5rem; font-weight:900; color:var(--accent-primary); line-height:1;">0.0 <span style="font-size:1.2rem; color:var(--text-secondary);">CPS</span></div>
        <div style="width:100%; height:12px; background:var(--bg-primary); border-radius:var(--radius-full); overflow:hidden; margin-top:1rem;">
          <div id="cst-gauge-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #10b981, #f59e0b, #ef4444); transition:width 0.15s ease;"></div>
        </div>
      </div>

      <!-- Click Box -->
      <div id="cst-target" class="click-target-area" style="min-height:220px;">
        <div class="target-icon">🚀</div>
        <div class="target-prompt">CLICK TO MEASURE VELOCITY</div>
        <div class="target-subprompt">Click repeatedly to gauge your burst speed and click interval in ms</div>
      </div>

      <!-- Statistics Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-box">
          <div id="cst-val-peak" class="stat-value">0.0</div>
          <div class="stat-label">Peak CPS</div>
        </div>
        <div class="stat-box">
          <div id="cst-val-avg-interval" class="stat-value">0 ms</div>
          <div class="stat-label">Avg Interval (ms)</div>
        </div>
        <div class="stat-box">
          <div id="cst-val-total" class="stat-value">0</div>
          <div class="stat-label">Clicks Logged</div>
        </div>
        <div class="stat-box">
          <div id="cst-val-stability" class="stat-value">100%</div>
          <div class="stat-label">Consistency</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:1.5rem;">
        <button id="cst-reset-btn" class="btn btn-secondary">
          <span data-i18n="btnReset">${t('btnReset')}</span>
        </button>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const target = document.getElementById('cst-target');
  const resetBtn = document.getElementById('cst-reset-btn');

  target.addEventListener('click', (e) => {
    handleTargetClick(e);
  });

  resetBtn.addEventListener('click', resetTest);
}

function handleTargetClick(e) {
  const now = performance.now();
  clickTimes.push(now);
  playClickSound(750, 0.03);

  // Keep last 15 clicks for burst speed calculation
  if (clickTimes.length > 20) {
    clickTimes.shift();
  }

  calculateVelocity();
  createRipple(e);
}

function calculateVelocity() {
  if (clickTimes.length < 2) return;

  const count = clickTimes.length;
  const timeSpanMs = clickTimes[count - 1] - clickTimes[0];
  const currentCPS = timeSpanMs > 0 ? ((count - 1) / (timeSpanMs / 1000)) : 0;

  // Calculate Intervals
  let totalIntervals = 0;
  let intervals = [];
  for (let i = 1; i < count; i++) {
    const diff = clickTimes[i] - clickTimes[i - 1];
    intervals.push(diff);
    totalIntervals += diff;
  }
  const avgInterval = totalIntervals / intervals.length;

  // Update Gauge
  const gaugeVal = document.getElementById('cst-gauge-val');
  const gaugeBar = document.getElementById('cst-gauge-bar');
  const peakVal = document.getElementById('cst-val-peak');
  const avgIntervalVal = document.getElementById('cst-val-avg-interval');
  const totalVal = document.getElementById('cst-val-total');

  if (gaugeVal) gaugeVal.innerHTML = `${currentCPS.toFixed(1)} <span style="font-size:1.2rem; color:var(--text-secondary);">CPS</span>`;
  if (gaugeBar) {
    const pct = Math.min(100, (currentCPS / 16) * 100);
    gaugeBar.style.width = `${pct}%`;
  }
  if (totalVal) totalVal.textContent = clickTimes.length;
  if (avgIntervalVal) avgIntervalVal.textContent = `${Math.round(avgInterval)} ms`;

  // Peak CPS tracking
  if (peakVal) {
    const prevPeak = parseFloat(peakVal.textContent) || 0;
    if (currentCPS > prevPeak) {
      peakVal.textContent = currentCPS.toFixed(1);
    }
  }
}

function createRipple(e) {
  const target = document.getElementById('cst-target');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.className = 'click-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = '60px';
  ripple.style.height = '60px';
  target.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

function resetTest() {
  clickTimes = [];
  document.getElementById('cst-gauge-val').innerHTML = `0.0 <span style="font-size:1.2rem; color:var(--text-secondary);">CPS</span>`;
  document.getElementById('cst-gauge-bar').style.width = '0%';
  document.getElementById('cst-val-peak').textContent = '0.0';
  document.getElementById('cst-val-avg-interval').textContent = '0 ms';
  document.getElementById('cst-val-total').textContent = '0';
}

export function cleanupClickSpeedTest() {}
