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
let lastBounceSoundTime = 0;

function playBounceSound(velocity) {
  const now = performance.now();
  if (now - lastBounceSoundTime > 120 && Math.abs(velocity) > 2.5) {
    lastBounceSoundTime = now;
    playClickSound(540, 0.02);
  }
}

/**
 * Calculates current screen boundaries accounting for sticky header & mobile home bar
 */
function getYarnBoundaries() {
  const isMobile = window.innerWidth <= 768;
  const ballSize = yarnEl ? (yarnEl.offsetWidth || (isMobile ? 44 : 56)) : (isMobile ? 44 : 56);

  // 1. Header Boundary (Top)
  let headerBottom = 0;
  const headerEl = document.querySelector('.site-header');
  if (headerEl) {
    const rect = headerEl.getBoundingClientRect();
    if (rect.bottom > 0) {
      headerBottom = rect.bottom;
    }
  }
  if (!headerBottom) {
    headerBottom = 62;
  }
  const minY = Math.max(10, headerBottom + 8);

  // 2. Mobile Home Bar Boundary (Bottom)
  let bottomLimit = window.innerHeight;
  const bottomBarEl = document.getElementById('mobile-bottom-bar');
  if (bottomBarEl) {
    const style = window.getComputedStyle(bottomBarEl);
    if (style.display !== 'none' && style.visibility !== 'hidden') {
      const rect = bottomBarEl.getBoundingClientRect();
      if (rect.top > 0) {
        bottomLimit = rect.top;
      } else {
        bottomLimit = window.innerHeight - (bottomBarEl.offsetHeight || 64);
      }
    }
  }

  // Hard safe fallback on mobile: ensure bottomLimit is at least 74px above viewport bottom
  if (isMobile) {
    bottomLimit = Math.min(bottomLimit, window.innerHeight - 74);
  }

  const maxY = Math.max(minY + 20, bottomLimit - ballSize - 8);

  // 3. Horizontal Viewport Boundaries (Left & Right)
  const minX = 10;
  const maxX = Math.max(minX + 20, window.innerWidth - ballSize - 10);

  return { minX, maxX, minY, maxY, ballSize, isMobile };
}

export function clampYarnToBounds() {
  if (!yarnEl) return;
  const bounds = getYarnBoundaries();
  if (posX < bounds.minX) posX = bounds.minX;
  if (posX > bounds.maxX) posX = bounds.maxX;
  if (posY < bounds.minY) posY = bounds.minY;
  if (posY > bounds.maxY) posY = bounds.maxY;
  updateYarnPosition();
}

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

  // Set initial position safely well above the mobile home bar and food bowl
  const bounds = getYarnBoundaries();
  posX = Math.max(bounds.minX, bounds.maxX - (bounds.isMobile ? 16 : 40));
  // Position clearly above the food bowl and home bar on mobile (110px above maxY)
  posY = Math.max(bounds.minY + 20, bounds.maxY - (bounds.isMobile ? 110 : 50));
  updateYarnPosition();

  // Re-verify position on next animation frame after layout reflow
  requestAnimationFrame(() => {
    clampYarnToBounds();
  });

  // Mouse & Touch Drag Handlers
  yarnEl.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  yarnEl.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);

  window.addEventListener('resize', () => {
    clampYarnToBounds();
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

  // Clamp within playable bounds so user cannot drag under header or home bar
  const bounds = getYarnBoundaries();
  if (posX < bounds.minX) posX = bounds.minX;
  if (posX > bounds.maxX) posX = bounds.maxX;
  if (posY < bounds.minY) posY = bounds.minY;
  if (posY > bounds.maxY) posY = bounds.maxY;

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

    const bounds = getYarnBoundaries();

    // 1. Horizontal Left/Right Boundary Bounces
    if (posX < bounds.minX) {
      posX = bounds.minX;
      velX = Math.abs(velX) * 0.65;
      playBounceSound(velX);
    } else if (posX > bounds.maxX) {
      posX = bounds.maxX;
      velX = -Math.abs(velX) * 0.65;
      playBounceSound(velX);
    }

    // 2. Header (Top) Bounce
    if (posY < bounds.minY) {
      posY = bounds.minY;
      velY = Math.abs(velY) * 0.65; // Bounce downward away from header
      playBounceSound(velY);
    } 
    // 3. Home Bar / Bottom Screen Bounce
    else if (posY > bounds.maxY) {
      posY = bounds.maxY;
      velY = -Math.abs(velY) * 0.65; // Bounce upward away from home bar
      playBounceSound(velY);
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
  const bounds = getYarnBoundaries();
  const radius = bounds.ballSize / 2;
  const yarnCenterX = posX + radius;
  const yarnCenterY = posY + radius;

  const dist = Math.hypot(yarnCenterX - mascotPos.x, yarnCenterY - mascotPos.y);

  if (dist < 280) {
    updateYarnPawTracking(yarnCenterX, yarnCenterY);
  }

  if (dist < 160) {
    reactToYarn(yarnCenterX, yarnCenterY);
  }
}
