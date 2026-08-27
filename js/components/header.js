/* ==========================================================================
   ClickPulse - Header Navigation Component
   ========================================================================== */

import { t, LANGUAGES, getCurrentLang, setLanguage } from '../i18n.js';
import { toggleTheme } from '../theme.js';
import { triggerRandomTool } from '../router.js';

export function renderHeader(container) {
  const currentLangCode = getCurrentLang();
  const currentLangObj = LANGUAGES.find(l => l.code === currentLangCode) || LANGUAGES[0];

  container.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#" class="logo" id="header-logo">
          <div class="logo-icon">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="logo-text">Click<span>Pulse</span></div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-desktop">
          <a href="#" class="nav-link" data-route="" data-i18n="navHome">${t('navHome')}</a>
          
          <a href="#typing-test" class="nav-link nav-link-featured" data-route="typing-test">
            <span>⌨️⚡ Typing Challenge</span>
            <span class="nav-badge-hot">HOT</span>
          </a>

          <!-- Hardware Dropdown -->
          <div class="dropdown" id="hardware-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>🖱️ Hardware ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="#mouse-test" class="dropdown-item" data-i18n="navMouseTest">🖱️ Mouse Hardware Tester</a>
              <a href="#keyboard-test" class="dropdown-item" data-i18n="navKeyboardTest">⌨️ Keyboard Key Tester</a>
            </div>
          </div>

          <!-- Speed & Tools Dropdown -->
          <div class="dropdown" id="tools-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>⚡ All Tools ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="#cps-test" class="dropdown-item" data-i18n="navCPSTest">⚡ CPS Speed Test</a>
              <a href="#auto-clicker" class="dropdown-item" data-i18n="navAutoClicker">🤖 Online Auto Clicker</a>
              <a href="#click-speed-test" class="dropdown-item" data-i18n="navClickSpeedTest">⏱️ Click Speed Test</a>
              <a href="#click-counter" class="dropdown-item" data-i18n="navClickCounter">🔢 Digital Click Counter</a>
              <a href="#reaction-time-test" class="dropdown-item" data-i18n="navReactionTimeTest">🎯 Reaction Time Test</a>
              <a href="#double-click-test" class="dropdown-item" data-i18n="navDoubleClickTest">⚡ Double Click Test</a>
              <div style="height:1px; background:var(--border-color); margin:0.35rem 0;"></div>
              <a href="#tools" class="dropdown-item"><strong>📂 All Tools Directory</strong></a>
            </div>
          </div>
        </nav>

        <div class="header-actions">
          <!-- Surprise Me Discovery Button -->
          <button id="nav-surprise-btn" class="btn btn-sm btn-surprise" style="padding:0.45rem 0.9rem;">
            <span>🎲 Surprise Me!</span>
          </button>

          <!-- Vertical Separator Divider -->
          <div class="header-divider"></div>

          <!-- Language Selector Dropdown -->
          <div class="dropdown" id="lang-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>${currentLangObj.flag} ${currentLangObj.code.toUpperCase()}</span>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu">
              ${LANGUAGES.map(lang => `
                <div class="dropdown-item ${lang.code === currentLangCode ? 'active' : ''}" data-lang="${lang.code}">
                  <span>${lang.flag}</span>
                  <span>${lang.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dark/Light Theme Toggle -->
          <button id="theme-toggle-btn" class="btn btn-sm btn-secondary" aria-label="Toggle theme" style="padding:0.6rem;">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button id="hamburger-btn" class="hamburger-btn" aria-label="Open menu">
            <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-drawer" class="mobile-drawer">
        <a href="#" class="mobile-nav-link" data-route="">
          <span data-i18n="navHome">${t('navHome')}</span>
        </a>
        <a href="#typing-test" class="mobile-nav-link" data-route="typing-test">
          <span>⌨️⚡ Typing Speed Test</span>
        </a>
        <a href="#mouse-test" class="mobile-nav-link" data-route="mouse-test">
          <span>🖱️ Mouse Hardware Tester</span>
        </a>
        <a href="#keyboard-test" class="mobile-nav-link" data-route="keyboard-test">
          <span>⌨️ Keyboard Key Tester</span>
        </a>
        <a href="#auto-clicker" class="mobile-nav-link" data-route="auto-clicker">
          <span>🤖 Online Auto Clicker</span>
        </a>
        <a href="#cps-test" class="mobile-nav-link" data-route="cps-test">
          <span>⚡ CPS Speed Test</span>
        </a>
        <a href="#click-speed-test" class="mobile-nav-link" data-route="click-speed-test">
          <span>⏱️ Click Speed Test</span>
        </a>
        <a href="#click-counter" class="mobile-nav-link" data-route="click-counter">
          <span>🔢 Digital Click Counter</span>
        </a>
        <a href="#reaction-time-test" class="mobile-nav-link" data-route="reaction-time-test">
          <span>🎯 Reaction Time Test</span>
        </a>
        <a href="#double-click-test" class="mobile-nav-link" data-route="double-click-test">
          <span>⚡ Double Click Test</span>
        </a>
        <div style="height:1px; background:var(--border-color); margin:0.5rem 0;"></div>
        <a href="#tools" class="mobile-nav-link" data-route="tools">
          <strong>📂 All Tools Directory</strong>
        </a>
      </div>
    </header>
  `;

  bindHeaderEvents();
}

function bindHeaderEvents() {
  // Dropdown Open/Close
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dropdown-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdowns.forEach(other => { if (other !== dd) other.classList.remove('open'); });
      dd.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    dropdowns.forEach(dd => dd.classList.remove('open'));
  });

  // Language Selection
  const langItems = document.querySelectorAll('#lang-dropdown .dropdown-item');
  langItems.forEach(item => {
    item.addEventListener('click', () => {
      const code = item.dataset.lang;
      setLanguage(code, true);
    });
  });

  // Theme Toggle Button
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Surprise Me Discovery Button
  const navSurpriseBtn = document.getElementById('nav-surprise-btn');
  if (navSurpriseBtn) {
    navSurpriseBtn.addEventListener('click', triggerRandomTool);
  }

  // Mobile Drawer Toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (hamburgerBtn && drawer) {
    hamburgerBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });
  }
}
