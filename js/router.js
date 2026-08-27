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

export const TOOL_METADATA = {
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
  'mouse-test': {
    titleKey: 'mouseTestTitle',
    desc: 'Interactive online mouse button and scroll wheel tester. Test Left, Right, Middle, Side Back/Forward buttons and cursor tracking.',
    icon: '🖱️',
    category: 'hardware',
    renderFn: renderMouseTest,
    cleanupFn: cleanupMouseTest,
    faqs: [
      { q: 'Which mouse buttons can I test?', a: 'You can test Left Click (MB1), Right Click (MB2), Middle Click (MB3/Wheel), Side Button 4 (Back), Side Button 5 (Forward), and Scroll Wheel direction.' }
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
      { q: 'Does this keyboard tester support all keyboard layouts?', a: 'Yes! The tester listens to standard DOM KeyboardEvents so any QWERTY, AZERTY, or custom layout keys will register.' }
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
    updateSEOMetadata('ClickPulse - Free Online Browser Clicking & Testing Tools', 'Use powerful browser-based clicking, mouse, keyboard, and speed testing utilities directly in your browser. 100% free and private.');
  } else if (hash === 'tools') {
    renderToolsDirectoryPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'All Tools');
    updateSEOMetadata('Tools Directory - ClickPulse', 'Browse all free online clicking, speed testing, and hardware diagnostic tools.');
  } else if (TOOL_METADATA[hash]) {
    const meta = TOOL_METADATA[hash];
    renderToolPage(mainContainer, hash, meta);
    renderBreadcrumbs(breadcrumbsContainer, t(meta.titleKey));
    updateSEOMetadata(`${t(meta.titleKey)} - ClickPulse`, meta.desc);
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
        <div class="hero-badge" data-i18n="heroBadge">${t('heroBadge')}</div>
        <h1 class="hero-title">
          <span data-i18n="heroTitle">${t('heroTitle')}</span>
        </h1>
        <p class="hero-subtitle" data-i18n="heroSubtitle">${t('heroSubtitle')}</p>
        <div class="hero-ctas">
          <a href="#auto-clicker" class="btn btn-primary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span data-i18n="btnTryAutoClicker">${t('btnTryAutoClicker')}</span>
          </a>
          <a href="#tools" class="btn btn-secondary btn-lg" data-i18n="btnExploreTools">${t('btnExploreTools')}</a>
        </div>
      </div>
    </section>

    <!-- Featured Tools Grid -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Browser Utilities</h2>
          <p class="section-subtitle">Instant online tools for gamers, office workers, and hardware testing.</p>
        </div>

        <div class="grid grid-cols-4">
          ${Object.keys(TOOL_METADATA).map(key => {
            const tool = TOOL_METADATA[key];
            return `
              <div class="tool-card">
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

  renderFAQ(document.getElementById('home-faq-container'), [
    { q: 'Do I need to download or install software to use ClickPulse?', a: 'No! All tools on ClickPulse run 100% inside your web browser using HTML5, Web Audio, and Vanilla JavaScript.' },
    { q: 'Is ClickPulse safe and private?', a: 'Yes. None of your clicks, keypresses, or test scores are ever sent to an external server. Everything stays on your local device.' }
  ]);
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
