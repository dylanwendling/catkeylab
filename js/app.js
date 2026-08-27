/* ==========================================================================
   CatKeyLab - Main Application Entry Point
   ========================================================================== */

import { initTheme } from './theme.js';
import { initAudio } from './audio.js';
import { initI18n, t } from './i18n.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initCatMascot } from './components/catMascot.js';
import { initYarnBall } from './components/yarnBall.js';
import { initFoodBowl } from './components/foodBowl.js';
import { handleRoute } from './router.js';
import { fetchGlobalLeaderboards } from './leaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Subsystems & Cloud Leaderboards
  initTheme();
  initAudio();
  initI18n();
  fetchGlobalLeaderboards();

  // 2. Initialize Interactive Cat Mascot, Throwable Yarn Ball & Food Bowl 🥣🐟
  initCatMascot();
  initYarnBall();
  initFoodBowl();

  // 3. Setup Global Mouse Tracking Spotlight Aura & Card Parallax
  initMouseSpotlight();

  // 3. Render Global Layout Components
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  if (headerContainer) renderHeader(headerContainer);
  if (footerContainer) renderFooter(footerContainer);

  // 4. Register Translation Updater Callback
  window.updatePageTranslations = () => {
    if (headerContainer) renderHeader(headerContainer);
    if (footerContainer) renderFooter(footerContainer);
    handleRoute();
  };

  // 5. Bind Client Route Listeners
  window.addEventListener('hashchange', handleRoute);

  // Global Link Interceptor for same-hash clicks (e.g. "Play Test Now" buttons)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      const targetHash = link.getAttribute('href').replace('#', '').trim();
      const currentHash = window.location.hash.replace('#', '').trim();
      if (targetHash === currentHash) {
        e.preventDefault();
        handleRoute();
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 10);
      }
    }
  });

  // Initial Route Render
  handleRoute();
});

/**
 * Hardware-accelerated cursor spotlight aura
 */
function initMouseSpotlight() {
  let requestID = null;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!requestID) {
      requestID = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
        requestID = null;
      });
    }
  });
}
