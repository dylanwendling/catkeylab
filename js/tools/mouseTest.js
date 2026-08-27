/* ==========================================================================
   ClickPulse - Interactive Mouse & Button Tester Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let mouseCanvasCtx = null;
let lastMousePos = { x: 0, y: 0 };
let scrollDelta = 0;

export function renderMouseTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
            </svg>
            <span data-i18n="mouseTestTitle">${t('mouseTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="mouseTestSubtitle">${t('mouseTestSubtitle')}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:2rem;">
        <!-- Left: Interactive Mouse SVG Visualizer -->
        <div style="background:var(--bg-tertiary); padding:2rem; border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid var(--border-color);" id="mouse-test-area">
          <div class="mouse-svg-wrapper">
            <svg viewBox="0 0 200 300" width="100%" height="100%">
              <!-- Mouse Body Base -->
              <path class="mouse-part" id="mp-body" d="M50 80 C50 20, 150 20, 150 80 L150 220 C150 280, 50 280, 50 220 Z" fill="var(--bg-secondary)" stroke="var(--border-color)" stroke-width="4"/>
              
              <!-- Left Click Button -->
              <path class="mouse-part" id="mp-left" d="M54 78 C54 26, 96 26, 96 78 L96 115 L54 115 Z" fill="rgba(255,255,255,0.05)" stroke="var(--border-color)" stroke-width="2"/>
              
              <!-- Right Click Button -->
              <path class="mouse-part" id="mp-right" d="M104 78 C104 26, 146 26, 146 78 L146 115 L104 115 Z" fill="rgba(255,255,255,0.05)" stroke="var(--border-color)" stroke-width="2"/>
              
              <!-- Scroll Wheel -->
              <rect class="mouse-part" id="mp-wheel" x="93" y="55" width="14" height="35" rx="7" fill="var(--accent-primary)" stroke="#ffffff" stroke-width="1"/>
              
              <!-- Side Button 1 (MB4 Back) -->
              <rect class="mouse-part" id="mp-side1" x="42" y="130" width="8" height="28" rx="3" fill="var(--bg-primary)" stroke="var(--border-color)"/>
              
              <!-- Side Button 2 (MB5 Forward) -->
              <rect class="mouse-part" id="mp-side2" x="42" y="165" width="8" height="28" rx="3" fill="var(--bg-primary)" stroke="var(--border-color)"/>
            </svg>
          </div>
          <p style="margin-top:1rem; color:var(--text-secondary); font-size:0.9rem;">Click any button inside this box to test registration</p>
        </div>

        <!-- Right: Movement Trail & Scroll Tester -->
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="background:var(--bg-tertiary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; margin-bottom:0.5rem;" data-i18n="lblCursorPosition">${t('lblCursorPosition')}</div>
            <canvas id="mouse-trail-canvas" class="mouse-trail-canvas"></canvas>
          </div>

          <div class="stats-dashboard" style="margin-top:0;">
            <div class="stat-box">
              <div id="mt-detected-btn" class="stat-value" style="font-size:1.2rem;">None</div>
              <div class="stat-label" data-i18n="lblDetectedButton">${t('lblDetectedButton')}</div>
            </div>
            <div class="stat-box">
              <div id="mt-scroll-val" class="stat-value">0</div>
              <div class="stat-label" data-i18n="lblScrollDelta">${t('lblScrollDelta')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  initCanvasAndEvents();
}

function initCanvasAndEvents() {
  const area = document.getElementById('mouse-test-area');
  const canvas = document.getElementById('mouse-trail-canvas');
  if (!canvas) return;

  mouseCanvasCtx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Prevent context menu on test area for right click testing
  area.addEventListener('contextmenu', (e) => e.preventDefault());

  area.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleMouseDown(e);
  });

  area.addEventListener('mouseup', (e) => {
    handleMouseUp(e);
  });

  area.addEventListener('wheel', (e) => {
    handleWheel(e);
  });

  canvas.addEventListener('mousemove', (e) => {
    drawTrail(e);
  });
}

function handleMouseDown(e) {
  playClickSound(700, 0.03);
  let btnName = 'Unknown';
  let partId = null;

  switch (e.button) {
    case 0:
      btnName = 'Left Click (MB1)';
      partId = 'mp-left';
      break;
    case 1:
      btnName = 'Middle Click (Wheel / MB3)';
      partId = 'mp-wheel';
      break;
    case 2:
      btnName = 'Right Click (MB2)';
      partId = 'mp-right';
      break;
    case 3:
      btnName = 'Side Back (MB4)';
      partId = 'mp-side1';
      break;
    case 4:
      btnName = 'Side Forward (MB5)';
      partId = 'mp-side2';
      break;
  }

  document.getElementById('mt-detected-btn').textContent = btnName;
  if (partId) {
    const el = document.getElementById(partId);
    if (el) el.classList.add('active');
  }
}

function handleMouseUp(e) {
  const parts = document.querySelectorAll('.mouse-part');
  parts.forEach(p => p.classList.remove('active'));
}

function handleWheel(e) {
  e.preventDefault();
  scrollDelta += e.deltaY > 0 ? 1 : -1;
  const scrollEl = document.getElementById('mt-scroll-val');
  if (scrollEl) scrollEl.textContent = `${scrollDelta} (${e.deltaY > 0 ? 'Down' : 'Up'})`;

  const wheelPart = document.getElementById('mp-wheel');
  if (wheelPart) {
    wheelPart.classList.add('active');
    setTimeout(() => wheelPart.classList.remove('active'), 150);
  }
}

function drawTrail(e) {
  const canvas = document.getElementById('mouse-trail-canvas');
  if (!canvas || !mouseCanvasCtx) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  mouseCanvasCtx.fillStyle = 'rgba(99, 102, 241, 0.15)';
  mouseCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  mouseCanvasCtx.beginPath();
  mouseCanvasCtx.arc(x, y, 6, 0, Math.PI * 2);
  mouseCanvasCtx.fillStyle = '#06b6d4';
  mouseCanvasCtx.fill();
}

export function cleanupMouseTest() {}
