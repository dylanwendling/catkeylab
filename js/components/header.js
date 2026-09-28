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
        <a href="/" class="logo" id="header-logo">
          <div class="logo-icon">🐱</div>
          <div class="logo-text">CatKey<span>Lab</span></div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-desktop">
          <a href="/" class="nav-link" data-route="" data-i18n="navHome">${t('navHome')}</a>
          
          <!-- Benchmarks Dropdown -->
          <div class="dropdown" id="benchmarks-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span data-i18n="navBenchmarks">${t('navBenchmarks')}</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/reaction-time-test/" class="dropdown-item"><span>⏱️</span> <span>Reaction Time Test</span></a>
              <a href="/tools/sequence-memory-test/" class="dropdown-item"><span>🧠</span> <span>Sequence Memory Test</span></a>
              <a href="/tools/aim-trainer/" class="dropdown-item"><span>🎯</span> <span>Aim Trainer</span></a>
              <a href="/tools/number-memory-test/" class="dropdown-item"><span>🔢</span> <span>Number Memory Test</span></a>
              <a href="/tools/verbal-memory-test/" class="dropdown-item"><span>💬</span> <span>Verbal Memory Test</span></a>
              <a href="/tools/chimp-test/" class="dropdown-item"><span>🐒</span> <span>Chimp Test</span></a>
              <a href="/tools/visual-memory-test/" class="dropdown-item"><span>🔳</span> <span>Visual Memory Test</span></a>
              <a href="/tools/typing-test/" class="dropdown-item"><span>⌨️</span> <span>WPM Typing Test</span></a>
            </div>
          </div>

          <!-- Hardware Dropdown -->
          <div class="dropdown" id="hardware-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span data-i18n="navHardware">${t('navHardware')}</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/keyboard-test/" class="dropdown-item"><span>⌨️</span> <span data-i18n="navKeyboardTest">${t('navKeyboardTest')}</span></a>
              <a href="/tools/mouse-test/" class="dropdown-item"><span>🖱️</span> <span data-i18n="navMouseTest">${t('navMouseTest')}</span></a>
              <a href="/tools/double-click-test/" class="dropdown-item"><span>⚡</span> <span data-i18n="navDoubleClickTest">${t('navDoubleClickTest')}</span></a>
            </div>
          </div>

          <!-- Speed & Tools Dropdown -->
          <div class="dropdown" id="tools-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span data-i18n="navTools">${t('navTools')}</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/cps-test/" class="dropdown-item"><span>⚡</span> <span data-i18n="navCPSTest">${t('navCPSTest')}</span></a>
              <a href="/tools/click-speed-test/" class="dropdown-item"><span>🚀</span> <span data-i18n="navClickSpeedTest">${t('navClickSpeedTest')}</span></a>
              <a href="/tools/click-counter/" class="dropdown-item"><span>🔢</span> <span data-i18n="navClickCounter">${t('navClickCounter')}</span></a>
              <a href="/tools/auto-clicker/" class="dropdown-item"><span>🤖</span> <span data-i18n="navAutoClicker">${t('navAutoClicker')}</span></a>
              <div style="height:1px; background:var(--border-color); margin:0.35rem 0;"></div>
              <a href="/tools/" class="dropdown-item"><span>📂</span> <strong>All Tools Directory</strong></a>
            </div>
          </div>

          <!-- Games Dropdown -->
          <div class="dropdown" id="games-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span data-i18n="navGames">${t('navGames')}</span>
              <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu">
              <a href="/games/mini-golf/" class="dropdown-item"><span>⛳</span> <span>Nibbles Mini Golf (18H)</span></a>
              <a href="/games/fishing/" class="dropdown-item"><span>🎣</span> <span>Cat Fishing Game</span></a>
              <a href="/games/fruit-slicer/" class="dropdown-item"><span>🍉</span> <span>Fruit Slicer Arcade</span></a>
              <a href="/games/fish-maze/" class="dropdown-item"><span>🐟</span> <span>Nibbles Fish Maze</span></a>
              <a href="/games/card-memory/" class="dropdown-item"><span>🎴</span> <span>Card Memory Match</span></a>
            </div>
          </div>

          <a href="/about/" class="nav-link" data-route="about" data-i18n="navAbout">${t('navAbout')}</a>
          <a href="/faq/" class="nav-link" data-route="faq" data-i18n="navFAQ">${t('navFAQ')}</a>
        </nav>

        <div class="header-actions">
          <!-- Surprise Me Discovery Button -->
          <button id="nav-surprise-btn" class="btn btn-sm btn-surprise" style="padding:0.45rem 0.9rem;">
            <span>🎲 Surprise Me!</span>
          </button>

          <!-- Vertical Separator Divider -->
          <div class="header-divider"></div>

          <!-- Language Selector Dropdown (Globe Icon, No Windows Flag Bug) -->
          <div class="dropdown" id="lang-dropdown">
            <button class="dropdown-btn" aria-haspopup="true" style="padding:0 0.65rem;" title="Select Language">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.8;"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>${currentLangObj.code.toUpperCase()}</span>
              <svg class="chevron-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="dropdown-menu dropdown-right" role="menu">
              ${LANGUAGES.map(lang => `
                <button type="button" class="dropdown-item ${lang.code === currentLangCode ? 'active' : ''}" data-lang="${lang.code}" role="menuitem">
                  <span style="font-size:0.82rem; font-weight:700; color:var(--accent-emerald); width:24px;">${lang.code.toUpperCase()}</span>
                  <span>${lang.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Dark/Light Theme Toggle -->
          <button id="theme-toggle-btn" class="btn-icon-header" aria-label="Toggle theme" title="Toggle theme">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button id="hamburger-btn" class="hamburger-btn" aria-label="Open menu">
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-drawer" class="mobile-drawer">
        <a href="/" class="mobile-nav-link" data-route="">
          <span data-i18n="navHome">${t('navHome')}</span>
        </a>
        <a href="/tools/typing-test/" class="mobile-nav-link" data-route="typing-test">
          <span>⌨️ Typing Speed Test</span>
        </a>
        <a href="/tools/cps-test/" class="mobile-nav-link" data-route="cps-test">
          <span>⚡ CPS Speed Test</span>
        </a>
        <a href="/tools/aim-trainer/" class="mobile-nav-link" data-route="aim-trainer">
          <span>🎯 Aim Trainer</span>
        </a>
        <a href="/tools/keyboard-test/" class="mobile-nav-link" data-route="keyboard-test">
          <span>🖥️ Keyboard Tester</span>
        </a>
        <a href="/tools/mouse-test/" class="mobile-nav-link" data-route="mouse-test">
          <span>🖱️ Mouse Tester</span>
        </a>
        <a href="/tools/reaction-time-test/" class="mobile-nav-link" data-route="reaction-time-test">
          <span>⏱️ Reaction Time Test</span>
        </a>
        <a href="/tools/sequence-memory-test/" class="mobile-nav-link" data-route="sequence-memory-test">
          <span>🧠 Sequence Memory</span>
        </a>
        <a href="/games/mini-golf/" class="mobile-nav-link" data-route="cat-mini-golf-game">
          <span>⛳ Nibbles Mini Golf</span>
        </a>
        <a href="/games/fishing/" class="mobile-nav-link" data-route="cat-fishing-game">
          <span>🎣 Cat Fishing Game</span>
        </a>
        <a href="/games/fruit-slicer/" class="mobile-nav-link" data-route="fruit-slicer-game">
          <span>🍉 Fruit Slicer Arcade</span>
        </a>
        <div style="height:1px; background:var(--border-color); margin:0.5rem 0;"></div>
        <a href="/tools/" class="mobile-nav-link" data-route="tools">
          <strong>📂 All Tools Directory</strong>
        </a>
        <a href="/about/" class="mobile-nav-link" data-route="about">
          <span>ℹ️ About CatKeyLab</span>
        </a>
        <a href="/faq/" class="mobile-nav-link" data-route="faq">
          <span>❓ FAQ</span>
        </a>
        <a href="/privacy/" class="mobile-nav-link" data-route="privacy">
          <span>🛡️ Privacy Policy</span>
        </a>
      </div>
    </header>

    <!-- Concrete Mobile Bottom Navigation Bar (Screens <= 768px) -->
    <nav id="mobile-bottom-bar" class="mobile-bottom-bar">
      <a href="/" class="mobile-bottom-tab" data-route="">
        <span class="tab-icon">🏠</span>
        <span class="tab-label">Home</span>
      </a>
      <a href="/tools/typing-test/" class="mobile-bottom-tab" data-route="typing-test">
        <span class="tab-icon">⌨️</span>
        <span class="tab-label">Typing</span>
      </a>
      <a href="/tools/cps-test/" class="mobile-bottom-tab" data-route="cps-test">
        <span class="tab-icon">⚡</span>
        <span class="tab-label">CPS</span>
      </a>
      <a href="/tools/aim-trainer/" class="mobile-bottom-tab" data-route="aim-trainer">
        <span class="tab-icon">🎯</span>
        <span class="tab-label">Aim</span>
      </a>
      <a href="/tools/" class="mobile-bottom-tab" data-route="tools">
        <span class="tab-icon">📂</span>
        <span class="tab-label">Tools</span>
      </a>
    </nav>
  `;

  bindHeaderEvents();
}

let outsideClickBound = false;

function closeOpenDropdowns(except) {
  document.querySelectorAll('.dropdown.open').forEach(dd => {
    if (dd !== except) dd.classList.remove('open');
  });
}

function bindHeaderEvents() {
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dd => {
    const btn = dd.querySelector(':scope > .dropdown-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = !dd.classList.contains('open');
        closeOpenDropdowns(willOpen ? dd : null);
        dd.classList.toggle('open', willOpen);
      });
    }
  });

  const drawer = document.getElementById('mobile-drawer');

  if (!outsideClickBound) {
    outsideClickBound = true;
    document.addEventListener('click', (e) => {
      const openDropdown = e.target.closest('.dropdown.open');
      if (!openDropdown) closeOpenDropdowns();

      const currentDrawer = document.getElementById('mobile-drawer');
      if (currentDrawer && !currentDrawer.contains(e.target) && !e.target.closest('#hamburger-btn')) {
        currentDrawer.classList.remove('open');
        document.body.classList.remove('drawer-open');
      }
    });
  }

  const langDropdown = document.getElementById('lang-dropdown');
  if (langDropdown) {
    langDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('[data-lang]');
      if (!item || !langDropdown.contains(item)) return;
      e.preventDefault();
      e.stopPropagation();
      const code = item.getAttribute('data-lang');
      langDropdown.classList.remove('open');
      setLanguage(code, true);
    });
  }

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

  // Active Tab Highlight Tracker (Canonical URL + Hash)
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash.replace('#', '').trim();
  const bottomTabs = document.querySelectorAll('.mobile-bottom-tab');
  bottomTabs.forEach(tab => {
    const route = tab.dataset.route;
    const href = tab.getAttribute('href') || '';
    if (
      (href && (href === currentPath || (currentPath.startsWith(href) && href !== '/'))) ||
      (route && currentPath.includes(route)) ||
      (route === currentHash && currentHash !== '') ||
      (currentPath === '/' && (route === '' || href === '/'))
    ) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}
