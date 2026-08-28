/* ==========================================================================
   CatKeyLab - Interactive Throwable Yarn Ball Toy Component 🧶
   ========================================================================== */

import { getMascotPosition, reactToYarn, updateYarnPawTracking } from './catMascot.js';
import { playClickSound } from '../audio.js';

let yarnEl = null;
let posX = 0;
let posY = 0;
let velX = 0;
let velY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let isDragging = false;
let animationId = null;

export function initYarnBall() {
  // Spawn Yarn Container if not present
  if (document.getElementById('yarn-ball-container')) return;

  const container = document.createElement('div');
  container.id = 'yarn-ball-container';
  container.className = 'yarn-ball-container';
  container.innerHTML = `
    <div id="yarn-ball" class="yarn-ball-toy" title="Click and drag to throw yarn at the cat! 🧶">
      <div class="yarn-pattern">🧶</div>
    </div>
  `;
  document.body.appendChild(container);

  yarnEl = document.getElementById('yarn-ball');
  if (!yarnEl) return;

  // Set initial position at bottom right safely within viewport bounds
  posX = Math.max(10, window.innerWidth - (window.innerWidth < 640 ? 65 : 120));
  posY = Math.max(10, window.innerHeight - (window.innerWidth < 640 ? 70 : 100));
  updateYarnPosition();

  // Mouse & Touch Drag Handlers
  yarnEl.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  yarnEl.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);

  window.addEventListener('resize', () => {
    const maxX = Math.max(10, window.innerWidth - 65);
    const maxY = Math.max(10, window.innerHeight - 65);
    if (posX > maxX) posX = maxX;
    if (posY > maxY) posY = maxY;
    updateYarnPosition();
  });

  // Physics animation loop
  animationId = requestAnimationFrame(updatePhysics);
}

function startDrag(e) {
  if (e.touches && e.cancelable) e.preventDefault();
  isDragging = true;
  velX = 0;
  velY = 0;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  lastMouseX = clientX;
  lastMouseY = clientY;

  if (yarnEl) yarnEl.classList.add('dragging');
  playClickSound(650, 0.03);
}

function onDrag(e) {
  if (!isDragging) return;
  if (e.touches && e.cancelable) e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const dx = clientX - lastMouseX;
  const dy = clientY - lastMouseY;

  posX += dx;
  posY += dy;

  // Clamp within viewport to prevent horizontal page scrolling
  const maxX = Math.max(10, window.innerWidth - 60);
  const maxY = Math.max(10, window.innerHeight - 60);
  if (posX < 5) posX = 5;
  if (posX > maxX) posX = maxX;
  if (posY < 5) posY = 5;
  if (posY > maxY) posY = maxY;

  // Smooth velocity calculation for flicking/throwing momentum
  velX = dx * 0.8;
  velY = dy * 0.8;

  lastMouseX = clientX;
  lastMouseY = clientY;

  updateYarnPosition();
  checkCatProximity();
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;

  if (yarnEl) yarnEl.classList.remove('dragging');
  checkCatProximity();
}

function updatePhysics() {
  if (!isDragging && (Math.abs(velX) > 0.05 || Math.abs(velY) > 0.05)) {
    posX += velX;
    posY += velY;

    // Friction damping
    velX *= 0.94;
    velY *= 0.94;

    // Viewport Boundary Bounce (Strictly Clamped)
    const maxX = Math.max(10, window.innerWidth - 65);
    const maxY = Math.max(10, window.innerHeight - 65);

    if (posX < 10) {
      posX = 10;
      velX = -velX * 0.6;
    } else if (posX > maxX) {
      posX = maxX;
      velX = -velX * 0.6;
    }

    if (posY < 10) {
      posY = 10;
      velY = -velY * 0.6;
    } else if (posY > maxY) {
      posY = maxY;
      velY = -velY * 0.6;
    }

    updateYarnPosition();
    checkCatProximity();
  }

  animationId = requestAnimationFrame(updatePhysics);
}

function updateYarnPosition() {
  if (!yarnEl) return;
  yarnEl.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotate(${posX * 2}deg)`;
}

function checkCatProximity() {
  const mascotPos = getMascotPosition();
  const yarnCenterX = posX + 28;
  const yarnCenterY = posY + 28;

  const dist = Math.hypot(yarnCenterX - mascotPos.x, yarnCenterY - mascotPos.y);

  if (dist < 280) {
    updateYarnPawTracking(yarnCenterX, yarnCenterY);
  }

  if (dist < 160) {
    reactToYarn(yarnCenterX, yarnCenterY);
  }
}
