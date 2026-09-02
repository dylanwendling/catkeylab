/* ==========================================================================
   CatKeyLab - Header Navigation Component (Cat Theme)
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
          <div class="logo-icon" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 0 12px rgba(16,185,129,0.4);">
            🐱
          </div>
          <div class="logo-text">CatKey<span style="color:var(--accent-emerald);">Lab</span> 🐾</div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-desktop">
          <a href="#" class="nav-link" data-route="" data-i18n="navHome">${t('navHome')}</a>
          
          <!-- Benchmarks Dropdown -->
          <div class="dropdown" id="benchmarks-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>🧠 Benchmarks ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="#reaction-time-test" class="dropdown-item">⏱️ Reaction Time Test</a>
              <a href="#sequence-memory-test" class="dropdown-item">🧠 Sequence Memory Test</a>
              <a href="#aim-trainer-test" class="dropdown-item">🎯 Aim Trainer</a>
              <a href="#number-memory-test" class="dropdown-item">🔢 Number Memory Test</a>
              <a href="#verbal-memory-test" class="dropdown-item">💬 Verbal Memory Test</a>
              <a href="#chimp-test" class="dropdown-item">🐒 Chimp Test</a>
              <a href="#visual-memory-test" class="dropdown-item">🔳 Visual Memory Test</a>
              <a href="#typing-test" class="dropdown-item">⌨️ WPM Typing Test</a>
            </div>
          </div>

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
              <span>⚡ All Utilities ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="#cps-test" class="dropdown-item" data-i18n="navCPSTest">⚡ CPS Speed Test</a>
              <a href="#fruit-slicer-game" class="dropdown-item">🍉 Fruit Slicer Arcade</a>
              <a href="#auto-clicker" class="dropdown-item" data-i18n="navAutoClicker">🤖 Online Auto Clicker</a>
              <a href="#click-speed-test" class="dropdown-item" data-i18n="navClickSpeedTest">🚀 Click Speed Test</a>
              <a href="#click-counter" class="dropdown-item" data-i18n="navClickCounter">🔢 Digital Click Counter</a>
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

      <!-- Mobile Navigation Drawer (100% Mobile Benchmarks) -->
      <div id="mobile-drawer" class="mobile-drawer">
        <a href="#" class="mobile-nav-link" data-route="">
          <span data-i18n="navHome">${t('navHome')}</span>
        </a>
        <a href="#typing-test" class="mobile-nav-link" data-route="typing-test">
          <span>⌨️ Typing Speed Test</span>
        </a>
        <a href="#cps-test" class="mobile-nav-link" data-route="cps-test">
          <span>⚡ CPS Speed Test</span>
        </a>
        <a href="#aim-trainer-test" class="mobile-nav-link" data-route="aim-trainer-test">
          <span>🎯 Aim Trainer</span>
        </a>
        <a href="#cat-mini-golf-game" class="mobile-nav-link" data-route="cat-mini-golf-game">
          <span>⛳ Nibbles Mini Golf</span>
        </a>
        <a href="#reaction-time-test" class="mobile-nav-link" data-route="reaction-time-test">
          <span>⏱️ Reaction Time Test</span>
        </a>
        <a href="#sequence-memory-test" class="mobile-nav-link" data-route="sequence-memory-test">
          <span>🧠 Sequence Memory</span>
        </a>
        <a href="#click-speed-test" class="mobile-nav-link" data-route="click-speed-test">
          <span>🚀 Click Speed Test</span>
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

    <!-- Concrete Mobile Bottom Navigation Bar (Screens <= 768px) -->
    <nav id="mobile-bottom-bar" class="mobile-bottom-bar">
      <a href="#" class="mobile-bottom-tab" data-route="">
        <span class="tab-icon">🏠</span>
        <span class="tab-label">Home</span>
      </a>
      <a href="#typing-test" class="mobile-bottom-tab" data-route="typing-test">
        <span class="tab-icon">⌨️</span>
        <span class="tab-label">Typing</span>
      </a>
      <a href="#cps-test" class="mobile-bottom-tab" data-route="cps-test">
        <span class="tab-icon">⚡</span>
        <span class="tab-label">CPS</span>
      </a>
      <a href="#aim-trainer-test" class="mobile-bottom-tab" data-route="aim-trainer-test">
        <span class="tab-icon">🎯</span>
        <span class="tab-label">Aim</span>
      </a>
      <a href="#tools" class="mobile-bottom-tab" data-route="tools">
        <span class="tab-icon">📂</span>
        <span class="tab-label">Tools</span>
      </a>
    </nav>
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

  const drawer = document.getElementById('mobile-drawer');

  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => dd.classList.remove('open'));
    if (drawer && !drawer.contains(e.target) && !e.target.closest('#hamburger-btn')) {
      drawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
    }
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

  if (hamburgerBtn && drawer) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      document.body.classList.toggle('drawer-open', isOpen);
    });

    drawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        document.body.classList.remove('drawer-open');
      });
    });
  }

  // Active Bottom Bar Highlight Tracker
  const currentHash = window.location.hash.replace('#', '').trim();
  const bottomTabs = document.querySelectorAll('.mobile-bottom-tab');
  bottomTabs.forEach(tab => {
    const route = tab.dataset.route;
    if (route === currentHash || (currentHash === '' && route === '')) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}
