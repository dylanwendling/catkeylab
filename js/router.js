/* ==========================================================================
   ClickPulse - Client Route Engine & SEO Meta Coordinator
   ========================================================================== */

import { t, getCurrentLang } from './i18n.js';
import { renderBreadcrumbs } from './components/breadcrumbs.js';
import { renderFAQ } from './components/faq.js';
import { renderAdSpace } from './components/adSpaces.js';

import { renderAutoClicker, cleanupAutoClicker } from './tools/autoClicker.js';
import { renderCPSTest, cleanupCPSTest } from './tools/cpsTest.js';
import { renderClickSpeedTest, cleanupClickSpeedTest } from './tools/clickSpeedTest.js';
import { renderClickCounter, cleanupClickCounter } from './tools/clickCounter.js';
import { renderMouseTest, cleanupMouseTest } from './tools/mouseTest.js';
import { renderKeyboardTest, cleanupKeyboardTest } from './tools/keyboardTest.js';
import { renderReactionTimeTest, cleanupReactionTimeTest } from './tools/reactionTimeTest.js';
import { renderDoubleClickTest, cleanupDoubleClickTest } from './tools/doubleClickTest.js';

let currentCleanup = null;

export function triggerRandomTool() {
  const keys = Object.keys(TOOL_METADATA);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  window.location.hash = `#${randomKey}`;
}

export const TOOL_METADATA = {
  'mouse-test': {
    titleKey: 'mouseTestTitle',
    desc: 'Interactive online mouse button and scroll wheel tester. Test Left, Right, Middle, Side Back/Forward buttons and cursor tracking.',
    icon: '🖱️',
    category: 'hardware',
    renderFn: renderMouseTest,
    cleanupFn: cleanupMouseTest,
    faqs: [
      { q: 'Which mouse buttons can I test?', a: 'You can test Left Click (MB1), Right Click (MB2), Middle Click (MB3/Wheel), Side Button 4 (Back), Side Button 5 (Forward), and Scroll Wheel direction.' },
      { q: 'How to check if my mouse right click or side buttons work?', a: 'Click anywhere inside our interactive mouse visualizer. The corresponding mouse button will glow cyan in real time if functioning properly.' }
    ]
  },
  'keyboard-test': {
    titleKey: 'keyboardTestTitle',
    desc: 'Interactive visual keyboard key tester. Press any key to see real-time highlight feedback, event keycode logging, and modifier status.',
    icon: '⌨️',
    category: 'hardware',
    renderFn: renderKeyboardTest,
    cleanupFn: cleanupKeyboardTest,
    faqs: [
      { q: 'Does this keyboard tester support all keyboard layouts?', a: 'Yes! The tester listens to standard DOM KeyboardEvents so any QWERTY, AZERTY, or custom layout keys will register.' },
      { q: 'Why is key testing important for gaming and typing?', a: 'Key testing helps verify key rollover (NKRO), ghosting, and faulty key switches on mechanical or membrane keyboards.' }
    ]
  },
  'auto-clicker': {
    titleKey: 'autoClickerTitle',
    desc: 'Free online auto clicker running directly in your browser. Set click intervals, target counts, and hotkeys with zero software downloads.',
    icon: '🎯',
    category: 'clicking',
    renderFn: renderAutoClicker,
    cleanupFn: cleanupAutoClicker,
    faqs: [
      { q: 'How does an online auto clicker work?', a: 'An online auto clicker uses browser JavaScript timers to simulate rapid mouse click events automatically inside the active web page canvas.' },
      { q: 'Can an online auto clicker click outside the browser?', a: 'No. Due to browser security sandbox rules, web applications cannot control the mouse cursor on your Windows or Mac desktop outside the browser window.' },
      { q: 'Is this auto clicker 100% free to use?', a: 'Yes! ClickPulse is 100% free, private, and requires zero installation or account creation.' }
    ]
  },
  'cps-test': {
    titleKey: 'cpsTestTitle',
    desc: 'Test your Clicks Per Second (CPS) with our free online CPS calculator. Select 1s, 5s, 10s, 30s, or 60s tests and track your personal best.',
    icon: '⚡',
    category: 'speed',
    renderFn: renderCPSTest,
    cleanupFn: cleanupCPSTest,
    faqs: [
      { q: 'What is a good CPS score?', a: 'An average human CPS score is around 6 to 8 CPS. Gamers using jitter or butterfly clicking can achieve 10 to 14+ CPS.' },
      { q: 'What clicking techniques increase CPS?', a: 'Popular clicking techniques include Butterfly Clicking, Jitter Clicking, Drag Clicking, and regular index finger tapping.' }
    ]
  },
  'click-speed-test': {
    titleKey: 'speedTestTitle',
    desc: 'Measure your click velocity, burst speed, and clicking consistency with real-time analytics and dynamic speed gauges.',
    icon: '🚀',
    category: 'speed',
    renderFn: renderClickSpeedTest,
    cleanupFn: cleanupClickSpeedTest,
    faqs: [
      { q: 'How is click speed measured?', a: 'Click speed is measured by logging timestamps of consecutive clicks and calculating average intervals in milliseconds.' }
    ]
  },
  'click-counter': {
    titleKey: 'counterTitle',
    desc: 'Online digital click counter with audio sound effects, touch vibration, keyboard shortcuts (Spacebar), and target goal tracking.',
    icon: '🔢',
    category: 'clicking',
    renderFn: renderClickCounter,
    cleanupFn: cleanupClickCounter,
    faqs: [
      { q: 'Can I use keyboard keys to increment the counter?', a: 'Yes! You can press the Spacebar or Enter key to count clicks effortlessly.' }
    ]
  },
  'reaction-time-test': {
    titleKey: 'reactionTestTitle',
    desc: 'Test your visual reaction time in milliseconds. Wait for the signal to turn green and click as fast as you can.',
    icon: '⏱️',
    category: 'speed',
    renderFn: renderReactionTimeTest,
    cleanupFn: cleanupReactionTimeTest,
    faqs: [
      { q: 'What is the average human reaction time?', a: 'The average visual reaction time for humans is between 200ms and 250ms.' }
    ]
  },
  'double-click-test': {
    titleKey: 'doubleClickTitle',
    desc: 'Test your double-clicking speed and detect faulty mouse switch hardware chatter with millisecond precision.',
    icon: '👆',
    category: 'hardware',
    renderFn: renderDoubleClickTest,
    cleanupFn: cleanupDoubleClickTest,
    faqs: [
      { q: 'What is mouse double click chatter?', a: 'Mouse chatter occurs when a degraded micro-switch registers two clicks involuntarily within less than 50 milliseconds.' }
    ]
  }
};

export function handleRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  const mainContainer = document.getElementById('main-content');
  const breadcrumbsContainer = document.getElementById('breadcrumbs-container');

  // Perform previous view cleanup
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Highlight Active Nav Links
  updateNavState(hash);

  if (!hash || hash === '') {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
    updateSEOMetadata('Mouse Test & Keyboard Test Online - Free Hardware & Click Tools | ClickPulse', 'Free online mouse button tester, keyboard key tester, CPS click speed test, and auto clicker. Test mouse right click, side buttons, scroll wheel, and key rollover instantly.');
  } else if (hash === 'tools') {
    renderToolsDirectoryPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'All Tools');
    updateSEOMetadata('Mouse & Keyboard Tools Directory - ClickPulse', 'Browse all free online mouse button testers, keyboard key testers, clicking, and speed testing utilities.');
  } else if (TOOL_METADATA[hash]) {
    const meta = TOOL_METADATA[hash];
    renderToolPage(mainContainer, hash, meta);
    renderBreadcrumbs(breadcrumbsContainer, t(meta.titleKey));
    updateSEOMetadata(`${t(meta.titleKey)} - ClickPulse Hardware Tools`, meta.desc);
    currentCleanup = meta.cleanupFn;
  } else if (hash === 'about' || hash === 'privacy' || hash === 'terms') {
    renderLegalPage(mainContainer, hash);
    renderBreadcrumbs(breadcrumbsContainer, hash.toUpperCase());
    updateSEOMetadata(`${hash.toUpperCase()} - ClickPulse`, 'ClickPulse platform policies and information.');
  } else {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
  }

  window.scrollTo(0, 0);
}

function updateNavState(route) {
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const linkRoute = link.dataset.route;
    if (linkRoute === route) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function renderHomePage(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge" style="background:linear-gradient(90deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2)); border-color:var(--accent-cyan-glow); color:var(--accent-cyan);">
          🖱️ Online Mouse Tester & ⌨️ Keyboard Key Tester
        </div>
        <h1 class="hero-title">
          <span>Test Your Mouse & Keyboard Hardware Online</span>
        </h1>
        <p class="hero-subtitle">
          Instant, free, and private online tools to test mouse buttons (MB1-MB5, right click, scroll wheel) and verify keyboard key switches, rollover, and click speed.
        </p>
        <div class="hero-ctas">
          <a href="#mouse-test" class="btn btn-primary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
            <span>🖱️ Test Mouse Hardware</span>
          </a>
          <a href="#keyboard-test" class="btn btn-secondary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span>⌨️ Test Keyboard Keys</span>
          </a>
          <button id="hero-surprise-btn" class="btn btn-surprise btn-lg">
            <span>🎲 Surprise Me!</span>
          </button>
        </div>

        <!-- Hero Quick Test Interactive Card -->
        <div class="hero-quick-test-card" id="hero-quick-test-zone">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="font-weight:700; font-size:1.1rem; color:var(--accent-cyan); display:flex; align-items:center; gap:0.5rem;">
              <span class="status-dot" style="background:var(--accent-emerald);"></span>
              <span>Instant Quick Hardware Inspector</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">Click mouse or press any key to test live</span>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:1rem; text-align:center;">
            <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div id="hero-mouse-btn" style="font-size:1.3rem; font-weight:800; color:var(--accent-cyan);">Click Here</div>
              <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; margin-top:0.2rem;">Last Mouse Event</div>
            </div>
            <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div id="hero-key-btn" style="font-size:1.3rem; font-weight:800; color:var(--accent-emerald);">Press Any Key</div>
              <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; margin-top:0.2rem;">Last Keyboard Key</div>
            </div>
            <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div id="hero-count-val" style="font-size:1.3rem; font-weight:800; color:var(--accent-primary);">0</div>
              <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase; margin-top:0.2rem;">Total Inputs Registered</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Tools Grid -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Online Hardware Testers & Speed Utilities</h2>
          <p class="section-subtitle">Promoted browser tools for checking mouse buttons, keyboard rollover, and click performance.</p>
        </div>

        <div class="grid grid-cols-4">
          ${Object.keys(TOOL_METADATA).map(key => {
            const tool = TOOL_METADATA[key];
            const isFeatured = key === 'mouse-test' || key === 'keyboard-test';
            return `
              <div class="tool-card ${isFeatured ? 'featured-tool-card' : ''}" style="${isFeatured ? 'border:1px solid var(--accent-cyan-glow); background:linear-gradient(180deg, rgba(6,182,212,0.08), var(--bg-card));' : ''}">
                <div>
                  <div class="tool-card-header">
                    <div class="tool-card-icon" style="font-size:2rem;">${tool.icon}</div>
                    <span class="tool-card-badge" style="${isFeatured ? 'background:rgba(6,182,212,0.2); color:var(--accent-cyan);' : ''}">${isFeatured ? '🔥 TOP SEARCHED' : tool.category}</span>
                  </div>
                  <h3 class="tool-card-title">${t(tool.titleKey)}</h3>
                  <p class="tool-card-desc">${tool.desc}</p>
                </div>
                <div class="tool-card-footer">
                  <a href="#${key}" class="btn ${isFeatured ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;">
                    <span>${t('btnUseTool')} ${tool.icon}</span> →
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    ${renderAdSpace('banner')}

    <!-- Educational & Value Section -->
    <section class="section" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div style="max-width:800px; margin:0 auto; line-height:1.7;">
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem;">Everything You Need For Clicking & Hardware Diagnostics — Directly In Your Browser</h2>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            ClickPulse is designed from the ground up to provide fast, lightweight, and completely browser-native tools for clicking, CPS speed testing, mouse button diagnostics, and keyboard event logging.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            Unlike traditional desktop software that requires downloads, executable installers, or system administrator permissions, all tools on ClickPulse execute 100% locally inside your web browser. This guarantees ultimate privacy, instant access, and cross-platform compatibility across Windows, macOS, Linux, ChromeOS, iOS, and Android.
          </p>
        </div>
      </div>
    </section>

    <div class="container" id="home-faq-container"></div>
  `;

  initHeroQuickTestListeners();

  renderFAQ(document.getElementById('home-faq-container'), [
    { q: 'Do I need to download or install software to use ClickPulse?', a: 'No! All tools on ClickPulse run 100% inside your web browser using HTML5, Web Audio, and Vanilla JavaScript.' },
    { q: 'Is ClickPulse safe and private?', a: 'Yes. None of your clicks, keypresses, or test scores are ever sent to an external server. Everything stays on your local device.' }
  ]);
}

function initHeroQuickTestListeners() {
  const quickTestZone = document.getElementById('hero-quick-test-zone');
  const mouseValEl = document.getElementById('hero-mouse-btn');
  const keyValEl = document.getElementById('hero-key-btn');
  const countValEl = document.getElementById('hero-count-val');
  const surpriseBtn = document.getElementById('hero-surprise-btn');

  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', triggerRandomTool);
  }

  if (!quickTestZone) return;

  let inputCount = 0;
  const mouseNames = ['Left Click (MB1)', 'Middle Click (MB3)', 'Right Click (MB2)', 'Side Back (MB4)', 'Side Forward (MB5)'];

  quickTestZone.addEventListener('contextmenu', (e) => e.preventDefault());

  quickTestZone.addEventListener('mousedown', (e) => {
    e.preventDefault();
    inputCount++;
    if (countValEl) countValEl.textContent = inputCount;
    if (mouseValEl) {
      const btnName = mouseNames[e.button] || `Button ${e.button}`;
      mouseValEl.textContent = btnName;
      mouseValEl.style.color = 'var(--accent-cyan)';
    }
  });

  const keyHandler = (e) => {
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '') return;
    inputCount++;
    if (countValEl) countValEl.textContent = inputCount;
    if (keyValEl) {
      keyValEl.textContent = `${e.key === ' ' ? 'Space' : e.key} (${e.code})`;
      keyValEl.style.color = 'var(--accent-emerald)';
    }
  };

  window.addEventListener('keydown', keyHandler);
}

function renderToolsDirectoryPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="section-header">
        <h1 class="section-title" data-i18n="toolsDirectoryTitle">${t('toolsDirectoryTitle')}</h1>
        <p class="section-subtitle" data-i18n="toolsDirectorySubtitle">${t('toolsDirectorySubtitle')}</p>
      </div>

      <!-- Search & Filter Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:2rem; flex-wrap:wrap;">
        <input type="text" id="tool-search-input" class="form-input" placeholder="🔍 Search tools by name..." style="max-width:320px;">
        
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary tool-filter-btn active" data-filter="all" data-i18n="filterAll">${t('filterAll')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="clicking" data-i18n="filterClicking">${t('filterClicking')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="speed" data-i18n="filterSpeed">${t('filterSpeed')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="hardware" data-i18n="filterHardware">${t('filterHardware')}</button>
        </div>
      </div>

      <div class="grid grid-cols-3" id="tools-directory-grid">
        ${Object.keys(TOOL_METADATA).map(key => {
          const tool = TOOL_METADATA[key];
          return `
            <div class="tool-card directory-tool-card" data-category="${tool.category}" data-name="${t(tool.titleKey).toLowerCase()}">
              <div>
                <div class="tool-card-header">
                  <div class="tool-card-icon">${tool.icon}</div>
                  <span class="tool-card-badge">${tool.category}</span>
                </div>
                <h3 class="tool-card-title">${t(tool.titleKey)}</h3>
                <p class="tool-card-desc">${tool.desc}</p>
              </div>
              <div class="tool-card-footer">
                <a href="#${key}" class="btn btn-primary btn-sm" style="width:100%;">
                  <span data-i18n="btnUseTool">${t('btnUseTool')}</span> →
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  bindToolsDirectoryEvents();
}

function bindToolsDirectoryEvents() {
  const searchInput = document.getElementById('tool-search-input');
  const filterBtns = document.querySelectorAll('.tool-filter-btn');
  const cards = document.querySelectorAll('.directory-tool-card');

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      filterCards();
    });
  });

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = document.querySelector('.tool-filter-btn.active').dataset.filter;

    cards.forEach(card => {
      const name = card.dataset.name;
      const category = card.dataset.category;

      const matchesQuery = name.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

function renderToolPage(container, toolKey, toolMeta) {
  container.innerHTML = `
    <div class="container" style="padding-top:1.5rem;">
      <div id="tool-render-box"></div>
      
      ${renderAdSpace('banner')}

      <div id="tool-faq-container"></div>
    </div>
  `;

  const toolRenderBox = document.getElementById('tool-render-box');
  toolMeta.renderFn(toolRenderBox);
  renderFAQ(document.getElementById('tool-faq-container'), toolMeta.faqs);
}

function renderLegalPage(container, type) {
  let title = 'About ClickPulse';
  let body = 'ClickPulse is a free online browser-based tool suite.';

  if (type === 'privacy') {
    title = 'Privacy Policy';
    body = 'ClickPulse respects your privacy. All interactive tools process data 100% client-side in your web browser. We do not track mouse clicks, keyboard input, or test scores.';
  } else if (type === 'terms') {
    title = 'Terms of Service';
    body = 'All tools are provided "as-is" for personal, educational, and testing purposes.';
  }

  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper">
        <h1 style="font-size:2rem; font-weight:800; margin-bottom:1rem;">${title}</h1>
        <p style="color:var(--text-secondary); line-height:1.7;">${body}</p>
      </div>
    </div>
  `;
}

function updateSEOMetadata(title, description) {
  document.title = title;
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;

  // Open Graph
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title;
}
