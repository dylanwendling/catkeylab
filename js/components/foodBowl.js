/* ==========================================================================
   CatKeyLab - Interactive Cat Food Bowl & Fish Feeding Component 🥣🐟
   ========================================================================== */

import { getMascotPosition, feedFishToCat, updateYarnPawTracking } from './catMascot.js';
import { playClickSound } from '../audio.js';

let activeFishEl = null;
let isDraggingFish = false;
let fishX = 0;
let fishY = 0;

export function initFoodBowl() {
  if (document.getElementById('food-bowl-container')) return;

  const container = document.createElement('div');
  container.id = 'food-bowl-container';
  container.className = 'food-bowl-container';
  container.innerHTML = `
    <div id="food-bowl" class="food-bowl-toy" title="Click or drag to grab a fish and feed the cat! 🥣🐟">
      <span class="bowl-emoji">🥣</span>
      <span class="bowl-fish-indicator">🐟</span>
    </div>
  `;
  document.body.appendChild(container);

  const bowlEl = document.getElementById('food-bowl');
  if (!bowlEl) return;

  bowlEl.addEventListener('mousedown', spawnAndStartDragFish);
  bowlEl.addEventListener('touchstart', spawnAndStartDragFish, { passive: false });

  window.addEventListener('mousemove', onDragFish);
  window.addEventListener('mouseup', endDragFish);

  window.addEventListener('touchmove', onDragFish, { passive: false });
  window.addEventListener('touchend', endDragFish);
}

function spawnAndStartDragFish(e) {
  if (e) e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Remove existing active fish if any
  if (activeFishEl) activeFishEl.remove();

  const fish = document.createElement('div');
  fish.className = 'draggable-fish';
  fish.innerHTML = '🐟';
  document.body.appendChild(fish);

  activeFishEl = fish;
  isDraggingFish = true;

  fishX = clientX;
  fishY = clientY;

  updateFishPosition();
  playClickSound(720, 0.03);
}

function onDragFish(e) {
  if (!isDraggingFish || !activeFishEl) return;
  if (e.touches && e.cancelable) e.preventDefault();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  fishX = clientX;
  fishY = clientY;

  updateFishPosition();
  checkCatFeedingProximity();
}

function endDragFish() {
  if (!isDraggingFish) return;
  isDraggingFish = false;

  if (activeFishEl) {
    checkCatFeedingProximity(true);
    // If not fed, fish drops away after 600ms
    const targetFish = activeFishEl;
    targetFish.classList.add('dropping');
    setTimeout(() => {
      if (targetFish) targetFish.remove();
    }, 600);
    activeFishEl = null;
  }
}

function updateFishPosition() {
  if (!activeFishEl) return;
  activeFishEl.style.left = `${fishX - 20}px`;
  activeFishEl.style.top = `${fishY - 20}px`;
}

function checkCatFeedingProximity(isRelease = false) {
  if (!activeFishEl) return;

  const mascotPos = getMascotPosition();
  const dist = Math.hypot(fishX - mascotPos.x, fishY - mascotPos.y);

  if (dist < 280) {
    updateYarnPawTracking(fishX, fishY);
  }

  if (dist < 130) {
    // Feed Fish to Cat!
    feedFishToCat(fishX, fishY);

    // Eaten animation for fish
    if (activeFishEl) {
      activeFishEl.classList.add('eaten');
      const eatenFish = activeFishEl;
      activeFishEl = null;
      isDraggingFish = false;
      setTimeout(() => {
        if (eatenFish) eatenFish.remove();
      }, 300);
    }
  }
}
