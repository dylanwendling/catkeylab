/* ==========================================================================
   ClickPulse - Main Application Entry Point
   ========================================================================== */

import { initTheme } from './theme.js';
import { initAudio } from './audio.js';
import { initI18n, t } from './i18n.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { handleRoute } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Subsystems
  initTheme();
  initAudio();
  initI18n();

  // 2. Setup Global Mouse Tracking Spotlight Aura & Card Parallax
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
  
  // Initial Route Render
  handleRoute();
});

/**
 * Hardware-accelerated cursor spotlight aura & interactive card tilt physics
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

  // Card 3D tilt effect on hover
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.tool-card, .hero-quick-test-card, .stat-box');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.tool-card, .hero-quick-test-card, .stat-box');
    if (card) {
      card.style.transform = '';
    }
  });
}
