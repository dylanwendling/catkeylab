/* ==========================================================================
   CatKeyLab - Aim Trainer Test (30 Targets Visual Reflex & Accuracy)
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let targetsRemaining = 30;
let totalTargets = 30;
let targetStartTime = 0;
let targetTimes = [];
let misses = 0;
let state = 'start'; // 'start', 'playing', 'finished'

export function renderAimTrainerTest(container) {
  cleanupAimTrainerTest();

  const savedBest = localStorage.getItem('catkeylab_aim_best') || '0';

  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🎯</span>
            <span data-i18n="aimTestTitle">${t('aimTestTitle') || 'Aim Trainer'}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="aimTestSubtitle">
            ${t('aimTestSubtitle') || 'Hit 30 targets as quickly and accurately as possible.'}
          </p>
        </div>
        <div class="header-actions">
          <button id="aim-reset-btn" class="btn btn-secondary btn-sm">🔄 Restart</button>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="aim-val-remaining" class="stat-value" style="color:var(--accent-amber); font-size:2.2rem;">30</div>
          <div class="stat-label">Remaining Targets</div>
        </div>
        <div class="stat-box">
          <div id="aim-val-avg" class="stat-value" style="color:var(--accent-cyan); font-size:2.2rem;">0 ms</div>
          <div class="stat-label">Avg Speed</div>
        </div>
        <div class="stat-box">
          <div id="aim-val-best" class="stat-value" style="color:var(--accent-emerald); font-size:2.2rem;">${savedBest ? savedBest + ' ms' : '--'}</div>
          <div class="stat-label">Personal Best (30 Targets)</div>
        </div>
      </div>

      <!-- Target Shooting Arena Canvas -->
      <div id="aim-arena" class="aim-arena">
        <!-- Start / Finished Overlay -->
        <div id="aim-overlay" class="aim-overlay">
          <div id="aim-overlay-card" class="aim-overlay-card">
            <div style="font-size:3.5rem; margin-bottom:0.5rem;">🎯</div>
            <h2 id="aim-overlay-title" style="font-size:1.8rem; font-weight:800; margin-bottom:0.5rem;">Aim Trainer</h2>
            <p id="aim-overlay-desc" style="color:var(--text-secondary); margin-bottom:1.5rem;">Click the target as fast as you can. 30 targets total.</p>
            <button id="aim-start-btn" class="btn btn-primary btn-lg">Start Test</button>
          </div>
        </div>

        <div id="aim-target" class="aim-target" style="display:none;">
          <div class="aim-ring-outer">
            <div class="aim-ring-inner">
              <div class="aim-bullseye"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const startBtn = document.getElementById('aim-start-btn');
  const resetBtn = document.getElementById('aim-reset-btn');
  const arena = document.getElementById('aim-arena');
  const target = document.getElementById('aim-target');

  if (startBtn) {
    startBtn.addEventListener('click', startTest);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cleanupAimTrainerTest();
      startTest();
    });
  }

  if (arena) {
    arena.addEventListener('click', (e) => {
      if (state !== 'playing') return;
      // Miss registered if arena clicked outside target
      if (!target.contains(e.target)) {
        misses++;
      }
    });
  }

  if (target) {
    target.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents counting as arena miss
      if (state !== 'playing') return;

      const hitTime = Math.round(performance.now() - targetStartTime);
      targetTimes.push(hitTime);
      playClickSound(850, 0.04);

      targetsRemaining--;
      document.getElementById('aim-val-remaining').textContent = targetsRemaining;

      const currentAvg = Math.round(targetTimes.reduce((a, b) => a + b, 0) / targetTimes.length);
      document.getElementById('aim-val-avg').textContent = `${currentAvg} ms`;

      if (targetsRemaining > 0) {
        spawnTarget();
      } else {
        finishTest();
      }
    });
  }
}

function startTest() {
  targetsRemaining = 30;
  targetTimes = [];
  misses = 0;
  state = 'playing';

  const overlay = document.getElementById('aim-overlay');
  if (overlay) overlay.style.display = 'none';

  document.getElementById('aim-val-remaining').textContent = targetsRemaining;
  document.getElementById('aim-val-avg').textContent = '0 ms';

  spawnTarget();
}

function spawnTarget() {
  const arena = document.getElementById('aim-arena');
  const target = document.getElementById('aim-target');
  if (!arena || !target) return;

  target.style.display = 'block';

  const arenaRect = arena.getBoundingClientRect();
  const targetSize = 60; // 60px target diameter

  const maxX = arenaRect.width - targetSize - 20;
  const maxY = arenaRect.height - targetSize - 20;

  const randomX = Math.max(10, Math.floor(Math.random() * maxX));
  const randomY = Math.max(10, Math.floor(Math.random() * maxY));

  target.style.left = `${randomX}px`;
  target.style.top = `${randomY}px`;

  targetStartTime = performance.now();
}

function finishTest() {
  state = 'finished';

  const target = document.getElementById('aim-target');
  if (target) target.style.display = 'none';

  const avgSpeed = Math.round(targetTimes.reduce((a, b) => a + b, 0) / targetTimes.length);
  const totalClicks = targetTimes.length + misses;
  const accuracy = Math.round((targetTimes.length / totalClicks) * 100);

  saveBestScore(avgSpeed);

  const bestScore = localStorage.getItem('catkeylab_aim_best') || avgSpeed;
  document.getElementById('aim-val-best').textContent = `${bestScore} ms`;

  const overlay = document.getElementById('aim-overlay');
  const title = document.getElementById('aim-overlay-title');
  const desc = document.getElementById('aim-overlay-desc');
  const startBtn = document.getElementById('aim-start-btn');

  if (title) title.textContent = `${avgSpeed} ms / target`;
  if (desc) desc.innerHTML = `Accuracy: <strong>${accuracy}%</strong> (${misses} misses)<br>Personal Best: <strong>${bestScore} ms</strong>`;
  if (startBtn) startBtn.textContent = 'Try Again';

  if (overlay) overlay.style.display = 'flex';
}

function saveBestScore(avgMs) {
  const currentBest = parseInt(localStorage.getItem('catkeylab_aim_best') || '0');
  if (currentBest === 0 || avgMs < currentBest) {
    localStorage.setItem('catkeylab_aim_best', avgMs);
  }
}

export function cleanupAimTrainerTest() {
  state = 'start';
}
