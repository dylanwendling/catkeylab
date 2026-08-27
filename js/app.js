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

  // 2. Render Global Layout Components
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  if (headerContainer) renderHeader(headerContainer);
  if (footerContainer) renderFooter(footerContainer);

  // 3. Register Translation Updater Callback
  window.updatePageTranslations = () => {
    if (headerContainer) renderHeader(headerContainer);
    if (footerContainer) renderFooter(footerContainer);
    handleRoute();
  };

  // 4. Bind Client Route Listeners
  window.addEventListener('hashchange', handleRoute);
  
  // Initial Route Render
  handleRoute();
});
