/* ==========================================================================
   CatKeyLab - Interactive Mouse & Hardware Button Tester Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let mouseCanvasCtx = null;
let trailParticles = [];
let scrollDelta = 0;
let totalMouseClicks = 0;
let animationFrameId = null;

export function renderMouseTest(container) {
  totalMouseClicks = 0;
  scrollDelta = 0;

  const isMobile = window.innerWidth <= 768;

  container.innerHTML = `
    ${isMobile ? `
      <div style="background:var(--bg-secondary); border:1px solid var(--accent-amber); padding:1.5rem; border-radius:var(--radius-lg); text-align:center; margin-bottom:1.5rem; box-shadow:var(--shadow-md);">
        <div style="font-size:2.2rem; margin-bottom:0.5rem;">💻 Desktop Hardware Tool</div>
        <h3 style="color:var(--accent-amber); font-size:1.25rem; font-weight:800; margin-bottom:0.5rem;">Desktop Computer Recommended</h3>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.25rem;">Mouse Button (MB1–MB5) testing requires a desktop computer with a physical mouse attached.</p>
        <div style="display:flex; gap:0.5rem; justify-content:center; flex-wrap:wrap;">
          <a href="#cps-test" class="btn btn-primary btn-sm">⚡ Try Mobile CPS Test</a>
          <a href="#typing-test" class="btn btn-secondary btn-sm">⌨️ Try Mobile Typing Test</a>
          <a href="#aim-trainer-test" class="btn btn-secondary btn-sm">🎯 Mobile Aim Trainer</a>
        </div>
      </div>
    ` : ''}

    <div class="tool-wrapper" style="border:1px solid var(--accent-cyan-glow);">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">🖱️</span>
            <span data-i18n="mouseTestTitle">${t('mouseTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text">Test Left, Right, Middle (MB3), Side Back (MB4), Side Forward (MB5) buttons, and Scroll Wheel velocity online.</p>
        </div>
        <div class="status-badge status-running">
          <span class="status-dot"></span>
          <span>Hardware Listener Active</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
        <!-- Left: Interactive Mouse SVG Visualizer -->
        <div style="background:var(--bg-card); padding:2rem; border-radius:var(--radius-lg); display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid var(--glass-border); backdrop-filter:blur(12px);" id="mouse-test-area">
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
          <p style="margin-top:1.25rem; color:var(--accent-cyan); font-size:0.9rem; font-weight:600; text-align:center;">
            ⚡ Click anywhere inside this card to test MB1, MB2, MB3, MB4 & MB5
          </p>
        </div>

        <!-- Right: Movement Trail & Scroll Tester -->
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="background:var(--bg-card); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">Interactive Cursor Trail Canvas</span>
              <span style="font-size:0.75rem; color:var(--accent-cyan);">Move mouse to draw glow trails</span>
            </div>
            <canvas id="mouse-trail-canvas" class="mouse-trail-canvas"></canvas>
          </div>

          <div class="stats-dashboard" style="margin-top:0;">
            <div class="stat-box">
              <div id="mt-detected-btn" class="stat-value" style="font-size:1.2rem; color:var(--accent-cyan);">None</div>
              <div class="stat-label">Last Detected Button</div>
            </div>
            <div class="stat-box">
              <div id="mt-total-clicks" class="stat-value" style="color:var(--accent-emerald);">0</div>
              <div class="stat-label">Total Clicks Registered</div>
            </div>
            <div class="stat-box">
              <div id="mt-scroll-val" class="stat-value" style="font-size:1.1rem; color:var(--accent-amber);">0</div>
              <div class="stat-label">Scroll Wheel Delta</div>
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
    addTrailParticle(e);
  });

  startTrailAnimation();
}

function handleMouseDown(e) {
  playClickSound(700, 0.03);
  totalMouseClicks++;
  const totalClicksEl = document.getElementById('mt-total-clicks');
  if (totalClicksEl) totalClicksEl.textContent = totalMouseClicks;

  let btnName = 'Unknown';
  let partId = null;

  switch (e.button) {
    case 0:
      btnName = 'Left Click (MB1)';
      partId = 'mp-left';
      break;
    case 1:
      btnName = 'Middle Click (MB3)';
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

  const detectedBtnEl = document.getElementById('mt-detected-btn');
  if (detectedBtnEl) detectedBtnEl.textContent = btnName;

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

function addTrailParticle(e) {
  const canvas = document.getElementById('mouse-trail-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  trailParticles.push({
    x, y,
    size: Math.random() * 5 + 3,
    alpha: 1.0,
    color: Math.random() > 0.5 ? '#06b6d4' : '#6366f1'
  });
}

function startTrailAnimation() {
  const canvas = document.getElementById('mouse-trail-canvas');
  if (!canvas || !mouseCanvasCtx) return;

  function render() {
    mouseCanvasCtx.fillStyle = 'rgba(11, 15, 25, 0.2)';
    mouseCanvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      mouseCanvasCtx.beginPath();
      mouseCanvasCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      mouseCanvasCtx.fillStyle = p.color;
      mouseCanvasCtx.globalAlpha = p.alpha;
      mouseCanvasCtx.fill();
      mouseCanvasCtx.globalAlpha = 1.0;

      p.alpha -= 0.04;
      p.size = Math.max(0, p.size - 0.1);

      if (p.alpha <= 0) {
        trailParticles.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

export function cleanupMouseTest() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  trailParticles = [];
}
