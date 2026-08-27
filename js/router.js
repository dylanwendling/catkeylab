/* ==========================================================================
   CatKeyLab - Client Route Engine & SEO Meta Coordinator
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
import { renderTypingTest, cleanupTypingTest } from './tools/typingTest.js';

import { renderSequenceMemoryTest, cleanupSequenceMemoryTest } from './tools/sequenceMemoryTest.js';
import { renderAimTrainerTest, cleanupAimTrainerTest } from './tools/aimTrainerTest.js';
import { renderNumberMemoryTest, cleanupNumberMemoryTest } from './tools/numberMemoryTest.js';
import { renderVerbalMemoryTest, cleanupVerbalMemoryTest } from './tools/verbalMemoryTest.js';
import { renderChimpTest, cleanupChimpTest } from './tools/chimpTest.js';
import { renderVisualMemoryTest, cleanupVisualMemoryTest } from './tools/visualMemoryTest.js';
import { renderLeaderboardView } from './components/leaderboardView.js';

let currentCleanup = null;

export function triggerRandomTool() {
  const currentHash = window.location.hash.replace('#', '') || '';
  const allKeys = Object.keys(TOOL_METADATA);
  
  // Filter out current active tool so user always gets a different surprise tool
  const availableKeys = allKeys.filter(key => key !== currentHash);
  
  if (availableKeys.length === 0) return;

  const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  window.location.hash = `#${randomKey}`;
}

export const TOOL_METADATA = {
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
  'sequence-memory-test': {
    titleKey: 'sequenceTestTitle',
    desc: 'Remember an increasingly long pattern of button presses with Simon Says interactive tones.',
    icon: '🧠',
    category: 'memory',
    renderFn: renderSequenceMemoryTest,
    cleanupFn: cleanupSequenceMemoryTest,
    faqs: [
      { q: 'How does the Sequence Memory test work?', a: 'Watch the sequence of glowing pads, then repeat it in exact order. Each round adds one extra pad to the sequence.' }
    ]
  },
  'aim-trainer-test': {
    titleKey: 'aimTestTitle',
    desc: 'How quickly can you hit 30 targets? Test your mouse precision and reflex speed.',
    icon: '🎯',
    category: 'speed',
    renderFn: renderAimTrainerTest,
    cleanupFn: cleanupAimTrainerTest,
    faqs: [
      { q: 'What is a good score on Aim Trainer?', a: 'Under 300 milliseconds per target is considered fast aiming speed for gaming.' }
    ]
  },
  'number-memory-test': {
    titleKey: 'numberTestTitle',
    desc: 'Remember the longest number sequence you can. The number length increases every level.',
    icon: '🔢',
    category: 'memory',
    renderFn: renderNumberMemoryTest,
    cleanupFn: cleanupNumberMemoryTest,
    faqs: [
      { q: 'What is average number memory capacity?', a: 'Most humans can hold around 7 digits in working short-term memory.' }
    ]
  },
  'verbal-memory-test': {
    titleKey: 'verbalTestTitle',
    desc: 'Keep as many words in short term memory as possible. Identify whether each word is SEEN or NEW.',
    icon: '💬',
    category: 'memory',
    renderFn: renderVerbalMemoryTest,
    cleanupFn: cleanupVerbalMemoryTest,
    faqs: [
      { q: 'How is Verbal Memory scored?', a: 'You earn 1 point for every correct SEEN or NEW guess with 3 lives total.' }
    ]
  },
  'chimp-test': {
    titleKey: 'chimpTestTitle',
    desc: 'Are you smarter than a chimpanzee? Memorize number locations before they turn into blank tiles.',
    icon: '🐒',
    category: 'memory',
    renderFn: renderChimpTest,
    cleanupFn: cleanupChimpTest,
    faqs: [
      { q: 'Why is it called the Chimp Test?', a: 'Based on Kyoto University research where chimpanzees outperformed humans in rapid working memory tests.' }
    ]
  },
  'visual-memory-test': {
    titleKey: 'visualTestTitle',
    desc: 'Remember an increasingly large board of squares as the grid expands.',
    icon: '🔳',
    category: 'memory',
    renderFn: renderVisualMemoryTest,
    cleanupFn: cleanupVisualMemoryTest,
    faqs: [
      { q: 'How does Visual Memory scale?', a: 'The board expands from 3x3 up to 7x7 grid with progressively more highlighted squares to remember.' }
    ]
  },
  'typing-test': {
    titleKey: 'typingTestTitle',
    desc: 'Distraction-free, Monkeytype-inspired typing speed test. Test your WPM and accuracy live with mechanical sounds and Eye Mascot judging.',
    icon: '⌨️',
    category: 'speed',
    renderFn: renderTypingTest,
    cleanupFn: cleanupTypingTest,
    faqs: [
      { q: 'How is typing speed (WPM) calculated?', a: 'WPM (Words Per Minute) is calculated as (Standardized Words Typed / Minutes Elapsed), where 1 standardized word equals 5 characters.' },
      { q: 'How does the Eye Mascot judge typing speed?', a: 'The mascot calculates your final WPM and accuracy percentage, reacting with expressions and funny judging dialogue based on your performance level.' }
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
      { q: 'Which mouse buttons can I test?', a: 'You can test Left Click (MB1), Right Click (MB2), Middle Click (MB3/Wheel), Side Button 4 (Back), Side Button 5 (Forward), and Scroll Wheel direction.' },
      { q: 'How to check if my mouse right click or side buttons work?', a: 'Click anywhere inside our interactive mouse visualizer. The corresponding mouse button will glow cyan in real time if functioning properly.' }
    ]
  },
  'keyboard-test': {
    titleKey: 'keyboardTestTitle',
    desc: 'Interactive visual keyboard key tester. Press any key to see real-time highlight feedback, event keycode logging, and modifier status.',
    icon: '🖥️',
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
      { q: 'Is this auto clicker 100% free to use?', a: 'Yes! CatKeyLab is 100% free, private, and requires zero installation or account creation.' }
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
    updateSEOMetadata('CatKeyLab 🐾 - Mouse Hardware Tester, Keyboard Tester & Typing Speed Challenge', 'Free online mouse button tester, keyboard key tester, WPM typing test, CPS click speed test, and auto clicker with Nibbles the Cat.');
  } else if (hash === 'tools') {
    renderToolsDirectoryPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'All Tools');
    updateSEOMetadata('Mouse & Keyboard Tools Directory - CatKeyLab 🐾', 'Browse all free online mouse button testers, keyboard key testers, typing tests, clicking, and speed testing utilities.');
  } else if (hash === 'leaderboards') {
    renderLeaderboardView(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'Anonymous Leaderboards 🏆');
    updateSEOMetadata('Anonymous Leaderboards & High Scores - CatKeyLab 🐾', '100% private, anonymous high scores and rank percentiles across all human benchmark tests.');
  } else if (TOOL_METADATA[hash]) {
    const meta = TOOL_METADATA[hash];
    renderToolPage(mainContainer, hash, meta);
    renderBreadcrumbs(breadcrumbsContainer, t(meta.titleKey));
    updateSEOMetadata(`${t(meta.titleKey)} - CatKeyLab 🐾 Hardware Tools`, meta.desc);
    currentCleanup = meta.cleanupFn;
  } else if (hash === 'about' || hash === 'privacy' || hash === 'terms' || hash === 'sitemap') {
    renderLegalPage(mainContainer, hash);
    renderBreadcrumbs(breadcrumbsContainer, hash === 'sitemap' ? 'Sitemap & Index' : hash.toUpperCase());
    updateSEOMetadata(`${hash === 'sitemap' ? 'Sitemap & Index' : hash.toUpperCase()} - CatKeyLab 🐾`, 'CatKeyLab platform policies and index.');
  } else if (hash === 'nibbles' || hash === 'meet-nibbles') {
    renderMeetNibblesPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'Meet Nibbles 🐱');
    updateSEOMetadata('Meet Nibbles 🐱 - The Real Orange Cat Behind CatKeyLab', 'Meet Nibbles the Ginger Tabby Cat! Inspired by Dylan\'s real-life orange cat sitting in a box.');
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
        <div class="hero-badge" style="background:linear-gradient(90deg, rgba(16,185,129,0.18), rgba(249,115,22,0.18)); border-color:rgba(16,185,129,0.35); color:var(--accent-emerald);">
          🐾 CatKeyLab • Handcrafted Hardware Testers & Typing Speed Challenge
        </div>
        <h1 class="hero-title">
          <span>Test Mouse Hardware, Keyboard Keys &amp; <span style="white-space: nowrap;">Typing Speed 🐾</span></span>
        </h1>
        <p class="hero-subtitle">
          Tested & approved by Nibbles the Cat. Free, private, browser-based tools to verify mouse buttons (MB1-MB5, right click, scroll), keyboard switches, and WPM typing speed.
        </p>
        <div class="hero-ctas">
          <a href="#typing-test" class="btn btn-primary btn-lg">
            <span>⌨️⚡ Test Typing Speed (WPM)</span>
          </a>
          <a href="#mouse-test" class="btn btn-secondary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
            <span>🖱️ Test Mouse Hardware</span>
          </a>
          <a href="#keyboard-test" class="btn btn-secondary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            <span>🖥️ Test Keyboard Keys</span>
          </a>
          <button id="hero-surprise-btn" class="btn btn-surprise btn-lg">
            <span>🎲 Surprise Me!</span>
          </button>
        </div>

        <!-- Hero Quick Test Interactive Card -->
        <div class="hero-quick-test-card" id="hero-quick-test-zone">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="font-weight:700; font-size:1.1rem; color:var(--accent-emerald); display:flex; align-items:center; gap:0.5rem;">
              <span class="status-dot" style="background:var(--accent-emerald);"></span>
              <span>⚡ Instant Mouse & Keyboard Quick Inspector</span>
            </div>
            <span style="font-size:0.8rem; color:var(--text-muted);">Click anywhere or press any key right now to inspect live</span>
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
          <p class="section-subtitle">Promoted browser tools for checking typing speed (WPM), mouse buttons, keyboard rollover, and click performance.</p>
        </div>

        <div class="grid grid-cols-4">
          ${(() => {
            const featuredOrder = ['typing-test', 'mouse-test', 'keyboard-test', 'cps-test'];
            const sortedToolKeys = Object.keys(TOOL_METADATA).sort((a, b) => {
              const indexA = featuredOrder.indexOf(a);
              const indexB = featuredOrder.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return 0;
            });

            return sortedToolKeys.map(key => {
              const tool = TOOL_METADATA[key];
              const isFeatured = featuredOrder.includes(key);
              return `
                <div class="tool-card ${isFeatured ? 'featured-tool-card' : ''}" style="${isFeatured ? 'border:1px solid var(--accent-cyan-glow); background:linear-gradient(180deg, rgba(6,182,212,0.08), var(--bg-card));' : ''}">
                  <div>
                    <div class="tool-card-header">
                      <div class="tool-card-icon" style="font-size:2rem;">${tool.icon}</div>
                      <span class="tool-card-badge" style="${isFeatured ? 'background:rgba(6,182,212,0.2); color:var(--accent-cyan); font-weight:700;' : ''}">${isFeatured ? '🔥 TOP SEARCHED' : tool.category}</span>
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
            }).join('');
          })()}
        </div>
      </div>
    </section>

    <!-- Embedded Anonymous Leaderboards Section -->
    <section class="section" style="padding-top:0;">
      <div id="home-leaderboard-container"></div>
    </section>

    ${renderAdSpace('banner')}

    <!-- Educational & Value Section -->
    <section class="section" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div style="max-width:800px; margin:0 auto; line-height:1.7;">
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem;">Everything You Need For Clicking & Hardware Diagnostics — Directly In Your Browser</h2>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            CatKeyLab is designed from the ground up to provide fast, lightweight, and completely browser-native tools for clicking, WPM typing speed tests, CPS performance, mouse button diagnostics, and keyboard event logging.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            Unlike traditional desktop software that requires downloads, executable installers, or system administrator permissions, all tools on CatKeyLab execute 100% locally inside your web browser. This guarantees ultimate privacy, instant access, and cross-platform compatibility across Windows, macOS, Linux, ChromeOS, iOS, and Android.
          </p>
        </div>
      </div>
    </section>

    <div class="container" id="home-faq-container"></div>
  `;

  initHeroQuickTestListeners();

  const lbContainer = document.getElementById('home-leaderboard-container');
  if (lbContainer) {
    renderLeaderboardView(lbContainer);
  }

  renderFAQ(document.getElementById('home-faq-container'), [
    { q: 'Do I need to download or install software to use CatKeyLab?', a: 'No! All tools on CatKeyLab run 100% inside your web browser using HTML5, Web Audio API, and Vanilla JavaScript.' },
    { q: 'Is CatKeyLab safe and private?', a: 'Yes. None of your clicks, keypresses, WPM typing tests, or test scores are ever sent to an external server. Everything stays on your local device.' }
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
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="memory" data-i18n="filterMemory">${t('filterMemory') || '🧠 Cognitive Memory'}</button>
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
  let title = 'About CatKeyLab';
  let body = `
    <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
      Free, Private & Powerful Online Hardware Testing Suite & Typing Speed Challenge 🐾
    </p>

    <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
      <!-- Creator Callout Card -->
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.25rem;">🎮 Created by Dylan</h3>
          <p style="color:var(--text-secondary);">CatKeyLab is crafted by Dylan. Check out games, utilities, and interactive creations on itch.io!</p>
          <p style="margin-top:0.5rem;"><a href="#nibbles" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat & See His Real-Life Photo →</a></p>
        </div>
        <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:linear-gradient(135deg, #f97316, #ea580c); border:none; font-weight:700;">
          <span>Visit Dylan on itch.io</span> ↗
        </a>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">📖 Overview</h3>
        <p>
          <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>) is a lightweight, high-performance web application built for testing mouse hardware, keyboard switches, WPM typing speed, click velocity, and reaction latency directly inside your web browser.
        </p>
        <p style="margin-top:0.75rem;">
          Unlike bloated desktop software, CatKeyLab operates <strong>100% client-side</strong>, requiring <strong>zero downloads, zero plugins, zero accounts, and zero tracking</strong>. All hardware test measurements, typing accuracy calculations, and high score benchmarks process locally in your browser sandbox to guarantee absolute privacy and instant performance.
        </p>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🐱 Nibbles the Cat & Interactive Companions</h3>
        <p>CatKeyLab features <strong>Nibbles</strong>, a playful Ginger Tabby Cat wearing a ruby red collar with a shiny gold bell 🔔 who accompanies you while you test hardware!</p>
        <ul style="margin-top:0.75rem; margin-left:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
          <li><strong>🐾 Pupil & Paw Tracking</strong>: Nibbles' pupils follow your cursor across the viewport, while his paws reach out toward nearby mouse movements.</li>
          <li><strong>⌨️ WPM Typing Judging</strong>: Nibbles evaluates your typing speed, purring happily for fast typists or squinting judgmentally at typos!</li>
          <li><strong>🧶 Throwable Yarn Ball Toy</strong>: Interactive yarn ball featuring drag-and-throw physics, friction damping, and screen boundary bounce physics.</li>
          <li><strong>🥣 Cat Food Bowl & Fish Feeding</strong>: Click or drag the food bowl to spawn fresh fish 🐟 to feed Nibbles.</li>
        </ul>
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🏆 Anonymous Global Leaderboards</h3>
        <p>CatKeyLab features a 100% private, anonymous leaderboard and percentile ranking engine. Players automatically receive a fun anonymous cat alias (e.g., <em>Speedy Tabby #4820</em>) with zero account creation or personal data collection.</p>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">✨ Included Tools & Modules (15 Suite Modules)</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:0.75rem;">
          <div><strong>⏱️ Reaction Time Test</strong>: Visual reaction latency tester in milliseconds.</div>
          <div><strong>🧠 Sequence Memory Test</strong>: Simon-says 3x3 interactive pattern recall with tones.</div>
          <div><strong>🎯 Aim Trainer</strong>: 30 targets precision challenge measuring acquisition speed & accuracy.</div>
          <div><strong>🔢 Number Memory Test</strong>: Digit span recall test with animated progress timer.</div>
          <div><strong>💬 Verbal Memory Test</strong>: SEEN vs NEW sequential word memory test with 3 lives.</div>
          <div><strong>🐒 Chimp Test</strong>: Ascending working memory grid test inspired by Kyoto University.</div>
          <div><strong>🔳 Visual Memory Test</strong>: Spatial matrix pattern recall expanding up to 7x7 grid.</div>
          <div><strong>⌨️ Typing Speed (WPM)</strong>: Distraction-free Monkeytype-inspired test with mechanical key sounds.</div>
          <div><strong>🖱️ Mouse Hardware Tester</strong>: MB1–MB5 buttons, scroll wheel direction, and velocity inspector.</div>
          <div><strong>🖥️ Keyboard Key Tester</strong>: NKRO key rollover verification and DOM KeyCode inspector.</div>
          <div><strong>🎯 Online Auto Clicker</strong>: In-browser automated clicking simulator with interval controls.</div>
          <div><strong>⚡ CPS Speed Test</strong>: Timed clicks-per-second benchmarking with high score badges.</div>
          <div><strong>🚀 Click Speed Test</strong>: Real-time velocity analytics and click consistency gauges.</div>
          <div><strong>🔢 Digital Click Counter</strong>: Tactile tally counter with spacebar triggers and target alerts.</div>
          <div><strong>👆 Double Click Tester</strong>: Hardware chatter detector for faulty mouse micro-switches.</div>
        </div>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🔊 Web Audio API Synthesizer</h3>
        <p>To maintain 100% offline capability and zero network overhead, CatKeyLab programmatically synthesizes audio in real-time using native Web Audio API oscillators for mechanical typing clicks, UI chimes, and cat purr sounds.</p>
      </div>
    </div>
  `;

  if (type === 'privacy') {
    title = 'Privacy Policy';
    body = `
      <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
        100% Client-Side Processing • Anonymous Leaderboards • Zero Personal Data Collection 🛡️
      </p>

      <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🔒 Zero Personal Data Collection</h3>
          <p>At <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>), we believe hardware testing and typing utilities should be fast, private, and secure. We do not collect, transmit, or store any personal data, email addresses, names, IP logs, keypress histories, or private hardware logs.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🏆 Anonymous Leaderboards & Firebase Cloud Storage</h3>
          <p>CatKeyLab features a 100% private, anonymous global leaderboard system. High scores process anonymously without account registration:</p>
          <ul style="margin-top:0.5rem; margin-left:1.25rem; display:flex; flex-direction:column; gap:0.3rem;">
            <li>Players receive auto-generated anonymous cat aliases (e.g. <em>Speedy Tabby #4820</em>) and cat emoji avatars.</li>
            <li>No personal identification or custom text handles are stored.</li>
            <li>Leaderboard score entries are synchronized via Firebase Realtime Database REST API.</li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🖥️ Local Browser Sandbox Execution</h3>
          <p>All tool calculations—including mouse button detection, keyboard keycode logging, WPM speed benchmarks, and reaction time measurements—execute <strong>100% locally inside your web browser sandbox</strong>. No raw test data ever leaves your device.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">💾 Local Storage Usage</h3>
          <p>CatKeyLab uses standard browser <code>localStorage</code> solely for persisting non-sensitive preferences locally on your device:</p>
          <ul style="margin-top:0.5rem; margin-left:1.25rem;">
            <li>Dark / Light color theme preference (<code>catkeylab_theme</code>)</li>
            <li>Sound effects toggle state (<code>catkeylab_sound</code>)</li>
            <li>Personal high scores and CPS personal best benchmarks</li>
            <li>Anonymous cat profile handle (<code>catkeylab_anon_profile</code>)</li>
          </ul>
          <p style="margin-top:0.5rem;">You can clear this data at any time by clearing your browser site data.</p>
        </div>
      </div>
    `;
  } else if (type === 'terms') {
    title = 'Terms of Service';
    body = `
      <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
        MIT Licensed Open Utilities • Anonymous Global Leaderboards • Terms of Use 📄
      </p>

      <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">1. Acceptance of Terms</h3>
          <p>By accessing and using <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>), created by Dylan (<a href="https://snowyorca.itch.io/" target="_blank" style="color:var(--accent-cyan);">snowyorca.itch.io</a>), you agree to these Terms of Service. CatKeyLab provides free, browser-native hardware testing, cognitive Human Benchmark games, and typing utilities for personal, commercial, and educational use.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">2. Use of Utilities & Browser Sandbox</h3>
          <p>All tools on CatKeyLab run strictly within your web browser sandbox using modern web standards (HTML5, CSS3, JavaScript ES2022+, and Web Audio API). Tools are intended for hardware verification, cognitive speed practice, and hardware chatter diagnostics.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">3. Anonymous Leaderboards & Fair Play</h3>
          <p>CatKeyLab features global anonymous high score leaderboards across all 9 benchmark games. Players agree to participate in fair play without using automated cheat scripts or artificial score injection.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">4. Open Source & MIT License</h3>
          <p>CatKeyLab is licensed under the <strong>MIT License</strong>. You are free to use, modify, and distribute the project for personal or commercial applications under the terms of the MIT open-source license.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">5. Disclaimer of Warranty</h3>
          <p>All utilities are provided "AS IS", without warranty of any kind, express or implied. Hardware measurements depend on device hardware, operating system drivers, and browser performance.</p>
        </div>
      </div>
    `;
  } else if (type === 'sitemap') {
    title = 'Sitemap & Index';
    body = `
      <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
        Complete Index of Interactive Tools, Cognitive Benchmarks & Resources on CatKeyLab 🗺️
      </p>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-emerald); font-size:1.2rem; margin-bottom:1rem;">🧠 Human Benchmark Suite</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#reaction-time-test" style="color:var(--text-primary); font-weight:600;">⏱️ Reaction Time Latency Test</a></li>
            <li><a href="#sequence-memory-test" style="color:var(--text-primary); font-weight:600;">🧠 Sequence Memory Test (Simon Grid)</a></li>
            <li><a href="#aim-trainer-test" style="color:var(--text-primary); font-weight:600;">🎯 Aim Trainer Precision Challenge</a></li>
            <li><a href="#number-memory-test" style="color:var(--text-primary); font-weight:600;">🔢 Number Memory Digit Span Test</a></li>
            <li><a href="#verbal-memory-test" style="color:var(--text-primary); font-weight:600;">💬 Verbal Memory Word Recall Test</a></li>
            <li><a href="#chimp-test" style="color:var(--text-primary); font-weight:600;">🐒 Chimp Test Working Memory Grid</a></li>
            <li><a href="#visual-memory-test" style="color:var(--text-primary); font-weight:600;">🔳 Visual Memory Spatial Recall Test</a></li>
            <li><a href="#typing-test" style="color:var(--text-primary); font-weight:600;">⌨️ Typing Speed Challenge (WPM)</a></li>
            <li><a href="#leaderboards" style="color:var(--accent-cyan); font-weight:700;">🏆 Anonymous Global Leaderboards</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-cyan); font-size:1.2rem; margin-bottom:1rem;">🖱️ Hardware & Speed Diagnostics</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#mouse-test" style="color:var(--text-primary); font-weight:600;">🖱️ Mouse Button & Movement Tester</a></li>
            <li><a href="#keyboard-test" style="color:var(--text-primary); font-weight:600;">🖥️ Visual Keyboard Switch Tester</a></li>
            <li><a href="#auto-clicker" style="color:var(--text-primary); font-weight:600;">🎯 In-Browser Online Auto Clicker</a></li>
            <li><a href="#cps-test" style="color:var(--text-primary); font-weight:600;">⚡ CPS Test (Clicks Per Second)</a></li>
            <li><a href="#click-speed-test" style="color:var(--text-primary); font-weight:600;">🚀 Click Velocity & Burst Speed Test</a></li>
            <li><a href="#click-counter" style="color:var(--text-primary); font-weight:600;">🔢 Digital Tally Click Counter</a></li>
            <li><a href="#double-click-test" style="color:var(--text-primary); font-weight:600;">👆 Mouse Double Click Chatter Tester</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-rose); font-size:1.2rem; margin-bottom:1rem;">Platform & Information</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#nibbles" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat</a></li>
            <li><a href="https://catkeylab.com/#about" style="color:var(--text-primary); font-weight:600;">About CatKeyLab</a></li>
            <li><a href="https://catkeylab.com/#privacy" style="color:var(--text-primary); font-weight:600;">Privacy Policy</a></li>
            <li><a href="https://catkeylab.com/#terms" style="color:var(--text-primary); font-weight:600;">Terms of Service</a></li>
            <li><a href="https://catkeylab.com/#sitemap" style="color:var(--text-primary); font-weight:600;">Sitemap & Index</a></li>
          </ul>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:1rem;">${title}</h1>
        <div>${body}</div>
      </div>
    </div>
  `;
}

function renderMeetNibblesPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.6rem;">
          <span>🐱 Meet Nibbles the Cat</span>
        </h1>
        <p class="hero-subtitle" style="margin-bottom:1.75rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
          The Real-Life Orange Cat Inspiration & Interactive Mascot Companion 🐾
        </p>

        <!-- Real Orange Cat Featured Hero Card -->
        <div style="background:linear-gradient(135deg, rgba(249,115,22,0.16), rgba(16,185,129,0.16)); border:2px solid #f97316; padding:2rem; border-radius:var(--radius-lg); display:flex; align-items:center; gap:2rem; flex-wrap:wrap; box-shadow:0 10px 30px rgba(0,0,0,0.35); margin-bottom:2rem;">
          <img src="./assets/orange-cat.jpg" alt="Real Orange Cat in Box - Inspiration for Nibbles" style="width:380px; max-width:100%; height:380px; object-fit:cover; border-radius:var(--radius-lg); border:4px solid #fb923c; box-shadow:0 12px 30px rgba(249,115,22,0.45); flex-shrink:0; margin:0 auto;" />
          <div style="flex:1; min-width:260px;">
            <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
              Meet Nibbles in Real Life! 🐱
            </h2>
            <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">
              This adorable orange cat sitting in a cardboard box is the real-life inspiration behind <strong>Nibbles</strong>! Created by <strong>Dylan</strong>, Nibbles lives on CatKeyLab to keep you company while you test hardware, practice typing, and click.
            </p>
          </div>
        </div>

        <!-- Nibbles Interactive Guide Cards -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-emerald); margin-bottom:0.5rem;">👀 Pupil & Cursor Tracking</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Nibbles' emerald eyes follow your mouse cursor smoothly across the screen in real-time as you move around the site.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-cyan); margin-bottom:0.5rem;">🐾 Swatting Paws & Petting</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Move your cursor close to Nibbles to see his white paws reach out to swat! Click Nibbles directly to pet him and hear him purr.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-amber); margin-bottom:0.5rem;">⌨️ WPM Typing Judging</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Take the Typing Speed Challenge! Nibbles calculates your WPM and accuracy, purring happily for fast typists or squinting judgmentally at typos.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-rose); margin-bottom:0.5rem;">🧶 Throwable Yarn Ball Toy</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Drag and toss the red yarn ball 🧶 across your screen. Throw it near Nibbles to watch his paws and pupils eagerly swat at the toy!</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--accent-primary); font-size:1.2rem; margin-bottom:0.5rem;">🥣 Cat Food Bowl & Fish</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Click the blue cat bowl 🥣 in the bottom-right corner to spawn fresh fish 🐟. Drag fish to Nibbles to feed him yummy treats!</p>
          </div>
        </div>
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
