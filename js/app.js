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
import { initSylvaHero } from './components/sylvaHero.js';

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

  // 3. Initialize Sylva 3D Hero Background
  initSylvaHero();

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

  // 5. Bind Client Route Listeners (popstate & hashchange for back-compat)
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);

  // Global Link Interceptor for smooth client routing and hash back-compat
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;

    // Handle hash links (e.g. #typing-test)
    if (href.startsWith('#')) {
      const targetHash = href.replace('#', '').trim();
      if (!targetHash) {
        e.preventDefault();
        history.pushState(null, '', '/');
        handleRoute();
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }

    // Handle internal path links (e.g. /tools/typing-test/, /games/mini-golf/)
    if (
      href.startsWith('/') &&
      !href.startsWith('//') &&
      !link.target &&
      !link.download &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      if (window.location.pathname !== href) {
        history.pushState(null, '', href);
      }
      handleRoute();
      window.scrollTo({ top: 0, behavior: 'instant' });
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
