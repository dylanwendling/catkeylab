/* ==========================================================================
   CatKeyLab - Client Route Engine & SEO Meta Coordinator
   ========================================================================== */

import { t, getCurrentLang } from './i18n.js';
import { renderBreadcrumbs } from './components/breadcrumbs.js';
import { renderFAQ } from './components/faq.js';
import { renderAdSpace } from './components/adSpaces.js';
import { renderLeaderboardView } from './components/leaderboardView.js?v=2';
import { initYarnBall } from './components/yarnBall.js';
import { renderDiagnosticWizard } from './components/diagnosticWizard.js';
import { renderDailyChallengeTeaser, renderDailyChallengePage } from './components/dailyChallenge.js';
import { resolveRoute, TOOL_ROUTES, STATIC_PAGES } from './data/routes.js';

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
import { renderFishMazeGame, cleanupFishMazeGame } from './tools/fishMazeGame.js';
import { renderCardMemoryGame, cleanupCardMemoryGame } from './tools/cardMemoryGame.js';
import { renderCatMiniGolfGame, cleanupCatMiniGolfGame } from './tools/catMiniGolfGame.js';
import { renderCatFishingGame, cleanupCatFishingGame } from './tools/catFishingGame.js';
import { renderFruitSlicerGame, cleanupFruitSlicerGame } from './tools/fruitSlicerGame.js';
import { renderCatTypingDungeon_MAIN as renderCatTypingDungeon, cleanupCatTypingDungeon } from './tools/catTypingDungeon.js?v=26';

let currentCleanup = null;

function trackToolUsage(toolId) {
  try {
    let usage = JSON.parse(localStorage.getItem('catkeylab_tool_play_counts')) || {};
    usage[toolId] = (usage[toolId] || 0) + 1;
    localStorage.setItem('catkeylab_tool_play_counts', JSON.stringify(usage));
  } catch (e) {}
}

function getToolPlayCounts() {
  try {
    return JSON.parse(localStorage.getItem('catkeylab_tool_play_counts')) || {};
  } catch (e) {
    return {};
  }
}

export function triggerRandomTool() {
  const resolvedCurrent = resolveRoute(window.location.pathname, window.location.hash);
  const currentKey = resolvedCurrent.key || '';
  const allKeys = Object.keys(TOOL_METADATA);
  
  // Filter out current active tool so user always gets a different surprise tool
  const availableKeys = allKeys.filter(key => key !== currentKey);
  if (availableKeys.length === 0) return;

  const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  const targetPath = TOOL_ROUTES[randomKey] ? TOOL_ROUTES[randomKey].path : `/tools/${randomKey}/`;
  history.pushState(null, '', targetPath);
  handleRoute();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

import { TOOL_METADATA as _METADATA } from './data/toolMetadata.js';

export const TOOL_METADATA = { ..._METADATA };
TOOL_METADATA['reaction-time-test'].renderFn = renderReactionTimeTest;
TOOL_METADATA['reaction-time-test'].cleanupFn = cleanupReactionTimeTest;
TOOL_METADATA['sequence-memory-test'].renderFn = renderSequenceMemoryTest;
TOOL_METADATA['sequence-memory-test'].cleanupFn = cleanupSequenceMemoryTest;
TOOL_METADATA['aim-trainer-test'].renderFn = renderAimTrainerTest;
TOOL_METADATA['aim-trainer-test'].cleanupFn = cleanupAimTrainerTest;
TOOL_METADATA['number-memory-test'].renderFn = renderNumberMemoryTest;
TOOL_METADATA['number-memory-test'].cleanupFn = cleanupNumberMemoryTest;
TOOL_METADATA['verbal-memory-test'].renderFn = renderVerbalMemoryTest;
TOOL_METADATA['verbal-memory-test'].cleanupFn = cleanupVerbalMemoryTest;
TOOL_METADATA['chimp-test'].renderFn = renderChimpTest;
TOOL_METADATA['chimp-test'].cleanupFn = cleanupChimpTest;
TOOL_METADATA['visual-memory-test'].renderFn = renderVisualMemoryTest;
TOOL_METADATA['visual-memory-test'].cleanupFn = cleanupVisualMemoryTest;
TOOL_METADATA['fish-maze-game'].renderFn = renderFishMazeGame;
TOOL_METADATA['fish-maze-game'].cleanupFn = cleanupFishMazeGame;
TOOL_METADATA['card-memory-game'].renderFn = renderCardMemoryGame;
TOOL_METADATA['card-memory-game'].cleanupFn = cleanupCardMemoryGame;
TOOL_METADATA['cat-mini-golf-game'].renderFn = renderCatMiniGolfGame;
TOOL_METADATA['cat-mini-golf-game'].cleanupFn = cleanupCatMiniGolfGame;
TOOL_METADATA['cat-fishing-game'].renderFn = renderCatFishingGame;
TOOL_METADATA['cat-fishing-game'].cleanupFn = cleanupCatFishingGame;
TOOL_METADATA['fruit-slicer-game'].renderFn = renderFruitSlicerGame;
TOOL_METADATA['fruit-slicer-game'].cleanupFn = cleanupFruitSlicerGame;
TOOL_METADATA['cat-typing-dungeon'].renderFn = renderCatTypingDungeon;
TOOL_METADATA['cat-typing-dungeon'].cleanupFn = cleanupCatTypingDungeon;
TOOL_METADATA['typing-test'].renderFn = renderTypingTest;
TOOL_METADATA['typing-test'].cleanupFn = cleanupTypingTest;
TOOL_METADATA['mouse-test'].renderFn = renderMouseTest;
TOOL_METADATA['mouse-test'].cleanupFn = cleanupMouseTest;
TOOL_METADATA['keyboard-test'].renderFn = renderKeyboardTest;
TOOL_METADATA['keyboard-test'].cleanupFn = cleanupKeyboardTest;
TOOL_METADATA['auto-clicker'].renderFn = renderAutoClicker;
TOOL_METADATA['auto-clicker'].cleanupFn = cleanupAutoClicker;
TOOL_METADATA['cps-test'].renderFn = renderCPSTest;
TOOL_METADATA['cps-test'].cleanupFn = cleanupCPSTest;
TOOL_METADATA['click-speed-test'].renderFn = renderClickSpeedTest;
TOOL_METADATA['click-speed-test'].cleanupFn = cleanupClickSpeedTest;
TOOL_METADATA['click-counter'].renderFn = renderClickCounter;
TOOL_METADATA['click-counter'].cleanupFn = cleanupClickCounter;
TOOL_METADATA['double-click-test'].renderFn = renderDoubleClickTest;
TOOL_METADATA['double-click-test'].cleanupFn = cleanupDoubleClickTest;
;

export function handleRoute() {
  const resolved = resolveRoute(window.location.pathname, window.location.hash);

  // If visitor arrived via legacy hash, rewrite URL bar to canonical path
  if (window.location.hash) {
    history.replaceState(null, '', resolved.canonicalPath);
  }

  const mainContainer = document.getElementById('main-content');
  const breadcrumbsContainer = document.getElementById('breadcrumbs-container');

  // Perform previous view cleanup
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Highlight Active Nav Links
  updateNavState(resolved.canonicalPath, resolved.key);

  if (resolved.type === 'home') {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
    updateSEOMetadata('CatKeyLab 🐾 - Free Online Keyboard, Mouse & Typing Tests', 'Free browser-based tools to test keyboards, mice, typing speed, clicking performance, reaction time, and memory. No downloads required.');
  } else if (resolved.type === 'tool' || resolved.type === 'game') {
    trackToolUsage(resolved.key);
    const meta = TOOL_METADATA[resolved.key];
    const categoryName = resolved.toolRoute ? resolved.toolRoute.categoryName : (resolved.type === 'game' ? 'Arcade Games' : 'Hardware & Benchmarks');
    const categoryPath = resolved.type === 'game' ? '/games/mini-golf/' : '/tools/';

    renderToolPage(mainContainer, resolved.key, meta);
    renderBreadcrumbs(breadcrumbsContainer, t(meta.titleKey), categoryName, categoryPath);
    updateSEOMetadata(`${t(meta.titleKey)} - CatKeyLab 🐾`, meta.desc);
    currentCleanup = meta.cleanupFn;
  } else if (resolved.type === 'page') {
    if (resolved.key === 'tools') {
      renderToolsDirectoryPage(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'All Tools', 'Directory', '/tools/');
      updateSEOMetadata('Mouse & Keyboard Tools Directory - CatKeyLab 🐾', 'Browse all free online mouse button testers, keyboard key testers, typing tests, clicking, and speed testing utilities.');
    } else if (resolved.key === 'leaderboards') {
      renderLeaderboardView(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'Anonymous Leaderboards 🏆', 'Platform', '/leaderboards/');
      updateSEOMetadata('Anonymous Leaderboards & High Scores - CatKeyLab 🐾', '100% private, anonymous high scores and rank percentiles across all human benchmark tests.');
    } else if (resolved.key === 'daily-challenge') {
      renderDailyChallengePage(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'Daily Challenge 📅', 'Platform', '/daily-challenge/');
      updateSEOMetadata('Daily Challenge - CatKeyLab 🐾', 'Complete today\'s 5 daily benchmark challenges.');
    } else if (resolved.key === 'faq') {
      renderFAQPage(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'FAQ', 'Platform', '/faq/');
      updateSEOMetadata('Frequently Asked Questions - CatKeyLab 🐾', 'Frequently asked questions about keyboard testing, mouse button testing, typing speed measurement, and reaction times.');
    } else if (resolved.key === 'contact') {
      renderContactPage(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'Contact & Support', 'Platform', '/contact/');
      updateSEOMetadata('Contact & Support - CatKeyLab 🐾', 'Contact Dylan and the CatKeyLab support team for questions, feedback, and hardware tool suggestions.');
    } else if (resolved.key === 'nibbles' || resolved.key === 'meet-nibbles') {
      renderMeetNibblesPage(mainContainer);
      renderBreadcrumbs(breadcrumbsContainer, 'Meet Nibbles 🐱', 'Platform', '/about/');
      updateSEOMetadata('Meet Nibbles 🐱 - The Real Orange Cat Behind CatKeyLab', 'Meet Nibbles the Ginger Tabby Cat! Inspired by Dylan\'s real-life orange cat sitting in a box.');
    } else {
      renderLegalPage(mainContainer, resolved.key);
      const crumb = resolved.pageInfo ? resolved.pageInfo.crumb : resolved.key.toUpperCase();
      renderBreadcrumbs(breadcrumbsContainer, crumb, 'Platform', `/${resolved.key}/`);
      updateSEOMetadata(`${crumb} - CatKeyLab 🐾`, 'CatKeyLab platform policies and index.');
    }
  } else {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
  }

  window.scrollTo(0, 0);
}

function updateNavState(canonicalPath, routeKey) {
  document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-bottom-tab').forEach(link => {
    const href = link.getAttribute('href') || '';
    const route = link.dataset.route || '';
    if (
      (canonicalPath && href === canonicalPath) ||
      (routeKey && route === routeKey) ||
      (canonicalPath === '/' && (href === '/' || href === '#' || route === ''))
    ) {
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
        <div class="hero-badge" data-i18n="heroBadge" style="background:linear-gradient(90deg, rgba(16,185,129,0.18), rgba(249,115,22,0.18)); border-color:rgba(16,185,129,0.35); color:var(--accent-emerald);">
          ${t('heroBadge')}
        </div>
        <h1 class="hero-title" data-i18n="heroTitle">${t('heroTitle')}</h1>
        <p class="hero-subtitle" data-i18n="heroSubtitle">${t('heroSubtitle')}</p>
        <div class="hero-ctas">
          <a href="/tools/typing-test/" class="btn btn-primary btn-lg">
            <span>⌨️⚡ Test Typing Speed (WPM)</span>
          </a>
          <a href="/tools/mouse-test/" class="btn btn-secondary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
            <span>🖱️ Test Mouse Buttons</span>
          </a>
          <a href="/tools/keyboard-test/" class="btn btn-secondary btn-lg">
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

    <section class="section" style="padding-top:2.5rem;">
      <div class="container">
        <!-- Diagnostic Wizard -->
        <div id="diagnostic-wizard-container"></div>
        
        <!-- Daily Challenge -->
        <div id="daily-challenge-container"></div>
      </div>
    </section>

    <!-- Embedded Anonymous Leaderboards Section -->
    <section class="section" style="padding-top:0;">
      <div id="home-leaderboard-container"></div>
    </section>

    <!-- Featured Tools Grid -->
    <section class="section" style="padding-top:0;">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Online Hardware Testers & Speed Utilities</h2>
          <p class="section-subtitle">Promoted browser tools for checking typing speed (WPM), mouse buttons, keyboard rollover, and click performance.</p>
        </div>

        <div class="grid grid-cols-4">
          ${(() => {
            const playCounts = getToolPlayCounts();
            const defaultPopular = ['cat-mini-golf-game', 'cat-fishing-game', 'fruit-slicer-game', 'typing-test'];

            const sortedToolKeys = Object.keys(TOOL_METADATA).sort((a, b) => {
              const indexA = defaultPopular.indexOf(a);
              const indexB = defaultPopular.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              const countA = playCounts[a] || 0;
              const countB = playCounts[b] || 0;
              return countB - countA;
            });

            const topFourSet = new Set(sortedToolKeys.slice(0, 4));

            return sortedToolKeys.map(key => {
              const tool = TOOL_METADATA[key];
              const isPopular = topFourSet.has(key);
              const targetPath = TOOL_ROUTES[key] ? TOOL_ROUTES[key].path : (/^cat-|^fruit-|^fish-|^card-/.test(key) ? `/games/${key}/` : `/tools/${key}/`);

              return `
                <div class="tool-card ${isPopular ? 'featured-tool-card' : ''}" style="${isPopular ? 'border:1px solid var(--accent-cyan-glow); background:linear-gradient(180deg, rgba(6,182,212,0.08), var(--bg-card));' : ''}">
                  <div>
                    <div class="tool-card-header">
                      <div class="tool-card-icon" style="font-size:2rem;">${tool.icon}</div>
                      <span class="tool-card-badge" style="${isPopular ? 'background:rgba(6,182,212,0.2); color:var(--accent-cyan); font-weight:700;' : ''}">${isPopular ? '🔥 TOP SEARCHED' : tool.category.toUpperCase()}</span>
                    </div>
                    <h3 class="tool-card-title">${t(tool.titleKey)}</h3>
                    <p class="tool-card-desc">${tool.desc}</p>
                  </div>
                  <div class="tool-card-footer">
                    <a href="${targetPath}" class="btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;">
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

    <!-- Informational Section: Free Online Keyboard & Mouse Testing Tools -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Free Online Keyboard & Mouse Testing Tools</h2>
        </div>
        <div class="info-section">
          <p>CatKeyLab is a free collection of browser-based tools designed to help you test, troubleshoot, and measure the performance of your computer input devices. If you want to verify that every key on your keyboard registers correctly, check that all your mouse buttons are working, measure your typing speed in words per minute, or test your clicking speed and reaction time, CatKeyLab provides focused tools for each task.</p>
          <p>All tests run directly in your browser with no downloads, installations, or account creation required. Your keystrokes, clicks, and test results are processed locally on your device and are never transmitted to any server. CatKeyLab also includes cognitive benchmarks for <a href="/tools/sequence-memory-test/">sequence memory</a>, <a href="/tools/number-memory-test/">number memory</a>, <a href="/tools/verbal-memory-test/">verbal memory</a>, <a href="/tools/visual-memory-test/">visual memory</a>, and <a href="/tools/reaction-time-test/">reaction time</a>: giving you everything you need to test your gear and your own skills.</p>
        </div>

        <div class="info-grid">
          <!-- How to Test Your Keyboard -->
          <div class="info-section">
            <h3>🖥️ How to Test Your Keyboard</h3>
            <p>Use the <a href="/tools/keyboard-test/">Keyboard Tester</a> to verify that each key on your physical keyboard is registering correctly:</p>
            <ol class="info-steps">
              <li>Open the <a href="/tools/keyboard-test/">Keyboard Tester</a> and click inside the test area.</li>
              <li>Press each key on your physical keyboard one at a time.</li>
              <li>Confirm that each key highlights on the on-screen layout.</li>
              <li>Look for keys that fail to register or show incorrect key codes.</li>
              <li>Test modifier combinations (Shift, Ctrl, Alt) and try pressing multiple keys simultaneously to check rollover.</li>
            </ol>
            <p>People usually test keyboards when checking a new purchase, evaluating a used keyboard before buying, troubleshooting an unresponsive or stuck key, verifying a laptop keyboard, or confirming that a mechanical keyboard's switches are all functioning after cleaning or modification.</p>
          </div>

          <!-- How to Test a Mouse -->
          <div class="info-section">
            <h3>🖱️ How to Test a Mouse</h3>
            <p>Use the <a href="/tools/mouse-test/">Mouse Button & Movement Tester</a> to check that your mouse buttons, scroll wheel, and cursor tracking are working properly:</p>
            <ol class="info-steps">
              <li>Open the <a href="/tools/mouse-test/">Mouse Tester</a> and click inside the test area.</li>
              <li>Press each mouse button: left, right, middle (scroll click), and side buttons if available.</li>
              <li>Scroll the wheel up and down to confirm scroll detection.</li>
              <li>Move the mouse to verify smooth cursor tracking.</li>
              <li>Use the <a href="/tools/double-click-test/">Double Click Tester</a> to check for unintended double-click chatter.</li>
            </ol>
            <p>If your mouse is acting up, check for buttons that don't work, buttons that trigger without being pressed (indicating switch chatter), scroll wheel directions that do not detect, or jerky cursor movement. If a single click is registering as a double-click, your mouse switch may be worn and should be tested with the <a href="/tools/double-click-test/">Double Click Tester</a>.</p>
          </div>
        </div>

        <!-- Why Test Your Keyboard or Mouse? -->
        <div class="info-section">
          <h3>Why Test Your Keyboard or Mouse?</h3>
          <p>Testing your devices can save you a lot of headaches:</p>
          <ul>
            <li><strong>New device verification</strong>: Confirm that every button and key works correctly out of the box before your return window closes.</li>
            <li><strong>Used or refurbished purchases</strong>: Test a used keyboard or mouse before committing to a purchase to detect worn switches or broken keys.</li>
            <li><strong>Troubleshooting input problems</strong>: If a key is not responding or a mouse button behaves inconsistently, testing helps isolate whether the issue is hardware or software.</li>
            <li><strong>Double-click issues</strong>: Aging mouse switches can develop "chatter," causing accidental double-clicks. The <a href="/tools/double-click-test/">Double Click Tester</a> measures click intervals to detect this.</li>
            <li><strong>Performance measurement</strong>: Track your <a href="/tools/typing-test/">typing speed</a>, <a href="/tools/cps-test/">clicking speed</a>, and <a href="/tools/reaction-time-test/">reaction time</a> to monitor improvement over time.</li>
            <li><strong>Keyboard rollover verification</strong>: Gamers can test whether their keyboard supports pressing multiple keys simultaneously using the <a href="/tools/keyboard-test/">Keyboard Tester</a>.</li>
          </ul>
        </div>

        <!-- Which Test Do I Need? -->
        <div class="info-section" style="margin-top:2.5rem;">
          <h3>🧭 Which CatKeyLab Tool Should I Use?</h3>
          <p>Find the right testing tool or game for your needs:</p>
          <div style="overflow-x:auto; margin-top:1rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <table style="width:100%; border-collapse: collapse; text-align:left; background:var(--bg-secondary);">
              <thead>
                <tr style="border-bottom:2px solid var(--border-color);">
                  <th style="padding:1rem; color:var(--text-primary);">If you want to...</th>
                  <th style="padding:1rem; color:var(--text-primary);">Use</th>
                </tr>
              </thead>
              <tbody style="color:var(--text-secondary);">
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Check whether keyboard keys work</td>
                  <td style="padding:1rem;"><a href="/tools/keyboard-test/" style="color:var(--accent-cyan); font-weight:600;">Keyboard Tester 🖥️</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test mouse buttons and scroll wheel</td>
                  <td style="padding:1rem;"><a href="/tools/mouse-test/" style="color:var(--accent-cyan); font-weight:600;">Mouse Tester 🖱️</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Check for accidental double clicks (mouse chatter)</td>
                  <td style="padding:1rem;"><a href="/tools/double-click-test/" style="color:var(--accent-cyan); font-weight:600;">Double Click Tester 👆</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Measure raw clicking speed (burst & endurance)</td>
                  <td style="padding:1rem;"><a href="/tools/cps-test/" style="color:var(--accent-cyan); font-weight:600;">CPS Test ⚡</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Analyze clicking speed consistency and velocity</td>
                  <td style="padding:1rem;"><a href="/tools/click-speed-test/" style="color:var(--accent-cyan); font-weight:600;">Click Speed Test 🚀</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Measure typing speed (WPM) and accuracy</td>
                  <td style="padding:1rem;"><a href="/tools/typing-test/" style="color:var(--accent-cyan); font-weight:600;">Typing Speed Test ⌨️</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Measure visual reaction speed</td>
                  <td style="padding:1rem;"><a href="/tools/reaction-time-test/" style="color:var(--accent-cyan); font-weight:600;">Reaction Time Test ⏱️</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Practice mouse aiming and target acquisition</td>
                  <td style="padding:1rem;"><a href="/tools/aim-trainer/" style="color:var(--accent-cyan); font-weight:600;">Aim Trainer 🎯</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test short-term pattern memory</td>
                  <td style="padding:1rem;"><a href="/tools/sequence-memory-test/" style="color:var(--accent-cyan); font-weight:600;">Sequence Memory Test 🧠</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test short-term digit span memory</td>
                  <td style="padding:1rem;"><a href="/tools/number-memory-test/" style="color:var(--accent-cyan); font-weight:600;">Number Memory Test 🔢</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test verbal word recognition memory</td>
                  <td style="padding:1rem;"><a href="/tools/verbal-memory-test/" style="color:var(--accent-cyan); font-weight:600;">Verbal Memory Test 💬</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test spatial matrix pattern recall</td>
                  <td style="padding:1rem;"><a href="/tools/visual-memory-test/" style="color:var(--accent-cyan); font-weight:600;">Visual Memory Test 🔳</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Test rapid working memory (like chimpanzees)</td>
                  <td style="padding:1rem;"><a href="/tools/chimp-test/" style="color:var(--accent-cyan); font-weight:600;">Chimp Test 🐒</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Automate mouse clicking inside the browser</td>
                  <td style="padding:1rem;"><a href="/tools/auto-clicker/" style="color:var(--accent-cyan); font-weight:600;">Auto Clicker 🎯</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Count things manually (with target goals)</td>
                  <td style="padding:1rem;"><a href="/tools/click-counter/" style="color:var(--accent-cyan); font-weight:600;">Click Counter 🔢</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Play a physics 2D mini golf game</td>
                  <td style="padding:1rem;"><a href="/games/mini-golf/" style="color:var(--accent-cyan); font-weight:600;">Cat Mini Golf ⛳</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Catch fish in a rapid clicking mini-game</td>
                  <td style="padding:1rem;"><a href="/games/fishing/" style="color:var(--accent-cyan); font-weight:600;">Cat Fishing Game 🎣</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Slice flying fruit with your mouse or finger</td>
                  <td style="padding:1rem;"><a href="/games/fruit-slicer/" style="color:var(--accent-cyan); font-weight:600;">Fruit Slicer 🍉</a></td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td style="padding:1rem;">Navigate Nibbles through a procedural maze</td>
                  <td style="padding:1rem;"><a href="/games/fish-maze/" style="color:var(--accent-cyan); font-weight:600;">Fish Maze 🐟</a></td>
                </tr>
                <tr>
                  <td style="padding:1rem;">Match 3D cat cards in a visual recognition game</td>
                  <td style="padding:1rem;"><a href="/games/card-memory/" style="color:var(--accent-cyan); font-weight:600;">Card Memory Match 🎴</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    ${renderAdSpace('banner')}

    <!-- Expanded Diagnostics & Value Section -->
    <section class="section" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div style="max-width:800px; margin:0 auto; line-height:1.7;">
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem;">Everything You Need For Clicking & Hardware Diagnostics: Directly In Your Browser</h2>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            CatKeyLab is a free website where you can test your mouse and keyboard without installing anything. It provides diagnostic tools for <a href="/tools/keyboard-test/" style="color:var(--accent-cyan);">keyboard keys</a>, <a href="/tools/mouse-test/" style="color:var(--accent-cyan);">mouse buttons and scroll wheel</a>, <a href="/tools/double-click-test/" style="color:var(--accent-cyan);">double-click behavior</a>, and <a href="/tools/typing-test/" style="color:var(--accent-cyan);">typing speed</a>, along with performance benchmarks for <a href="/tools/cps-test/" style="color:var(--accent-cyan);">clicking speed</a>, <a href="/tools/reaction-time-test/" style="color:var(--accent-cyan);">reaction time</a>, and <a href="/tools/aim-trainer/" style="color:var(--accent-cyan);">aim accuracy</a>.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            Everything runs right in your browser, so it works perfectly on Windows, macOS, Linux, ChromeOS, iOS, and Android with no installation or administrator permissions. All tests happen on your own device: we never record or send your keystrokes or clicks anywhere.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            <strong>What you can find out:</strong> Whether keys and buttons register correctly, which key codes your keyboard sends, whether your mouse has double-click chatter, your typing speed and accuracy, your clicking rate, and your visual reaction time. <strong>What these tests can't fix:</strong> CatKeyLab cannot access hardware internals, diagnose electrical faults, or detect issues that do not produce observable browser-level events. If a key or button does not register in the tester, the problem could be the switch, wiring, driver, or OS-level configuration.
          </p>
          <p style="color:var(--text-secondary);">
            If you're having issues, try the <a href="/tools/keyboard-test/" style="color:var(--accent-cyan);">Keyboard Tester</a> or <a href="/tools/mouse-test/" style="color:var(--accent-cyan);">Mouse Tester</a> to check whether your device is sending events to the browser. If a key or button is not detected, try a different USB port, check your device drivers, or test in another browser to determine whether the issue is hardware or software.
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

  const wizContainer = document.getElementById('diagnostic-wizard-container');
  if (wizContainer) {
    renderDiagnosticWizard(wizContainer);
  }

  const dcContainer = document.getElementById('daily-challenge-container');
  if (dcContainer) {
    renderDailyChallengeTeaser(dcContainer);
  }

  renderFAQ(document.getElementById('home-faq-container'), [
    { q: 'How do I test my keyboard?', a: 'Open the <a href="/keyboard-test/">Keyboard Tester</a>, click inside the test area, and press each key on your physical keyboard. Every key that registers correctly will highlight on the on-screen layout. Keys that do not highlight may be faulty or not sending events to the browser.' },
    { q: 'How do I know if a keyboard key is broken?', a: 'If you press a key in the <a href="/keyboard-test/">Keyboard Tester</a> and it does not highlight or appear in the event log, the key is not sending a signal to the browser. This usually indicates a faulty switch, broken connection, or driver issue. Try the key in another application to confirm.' },
    { q: 'Can I test a laptop keyboard?', a: 'Yes. Laptop keyboards send the same keyboard events as external keyboards. Open the <a href="/keyboard-test/">Keyboard Tester</a> in your browser and press keys directly on your laptop keyboard.' },
    { q: 'Can I test a mechanical keyboard?', a: 'Yes. Mechanical keyboards work through the same browser keyboard events. You can also use the <a href="/keyboard-test/">Keyboard Tester</a> to verify key rollover by pressing multiple keys simultaneously to see how many register at once.' },
    { q: 'How do I test my mouse buttons?', a: 'Open the <a href="/mouse-test/">Mouse Button & Movement Tester</a> and click inside the test area with each mouse button. The corresponding button (left, right, middle, side buttons) will highlight if it registers correctly.' },
    { q: 'How do I test for mouse double-clicking problems?', a: 'Use the <a href="/double-click-test/">Double Click Tester</a>. Click once firmly inside the test area. If the tool registers two clicks with a very short interval (under 40ms) when you only clicked once, your mouse may have switch chatter: a common hardware fault with aging mice.' },
    { q: 'What is a good typing speed?', a: 'Average typists score around 40 WPM (Words Per Minute). Office workers typically type 50–80 WPM. Professional typists often exceed 100 WPM. You can measure your typing speed with the <a href="/typing-test/">Typing Speed Test</a>.' },
    { q: 'Does CatKeyLab store what I type?', a: 'No. All typing data, keystrokes, clicks, and test results are processed entirely within your local browser. Nothing is sent to any external server. CatKeyLab uses localStorage only for preferences like theme choice and personal high scores.' },
    { q: 'Do I need to install anything to use CatKeyLab?', a: 'No. All tools run 100% inside your web browser using standard HTML5, JavaScript, and Web Audio API. There is nothing to download, install, or configure.' },
    { q: 'Do CatKeyLab tests work on mobile devices?', a: 'Most tests work on mobile browsers. The <a href="/typing-test/">Typing Speed Test</a> works with mobile soft keyboards (like Gboard), and touch-based tools like the <a href="/reaction-time-test/">Reaction Time Test</a> and games work with tap input. Hardware-specific tests like the <a href="/keyboard-test/">Keyboard Tester</a> are designed for physical keyboards.' },
    { q: 'Is CatKeyLab safe and private?', a: 'Yes. CatKeyLab does not collect personal data, email addresses, or browsing history. All test measurements process locally in your browser. The only network requests are for anonymous leaderboard scores (auto-generated cat aliases, no personal information) and ad delivery.' },
    { q: 'How accurate are the typing and reaction time tests?', a: 'Results depend on your browser, operating system, and hardware. Modern browsers on desktop provide millisecond-precision timing, which is sufficient for meaningful comparisons. For the most consistent results, use a desktop browser, close unnecessary tabs, and take multiple attempts.' }
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
                <a href="${TOOL_ROUTES[key] ? TOOL_ROUTES[key].path : (/^cat-|^fruit-|^fish-|^card-/.test(key) ? `/games/${key}/` : `/tools/${key}/`)}" class="btn btn-primary btn-sm" style="width:100%;">
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
  const content = toolMeta.content || {};
  const toolTitle = t(toolMeta.titleKey);

  // Check if #tool-render-box is already in the document (from SSG pre-render)
  const existingBox = document.getElementById('tool-render-box');
  const isPreRendered = existingBox && document.body.dataset.toolKey === toolKey;

  if (isPreRendered) {
    // Only mount interactive logic, don't blow away pre-rendered HTML
    toolMeta.renderFn(existingBox);
    return;
  }

  // Build related tools HTML if available
  let relatedToolsHTML = '';
  if (content.relatedTools && content.relatedTools.length > 0) {
    const relatedLinks = content.relatedTools
      .filter(key => TOOL_METADATA[key])
      .map(key => {
        const related = TOOL_METADATA[key];
        const targetPath = TOOL_ROUTES[key] ? TOOL_ROUTES[key].path : (/^cat-|^fruit-|^fish-|^card-/.test(key) ? `/games/${key}/` : `/tools/${key}/`);
        return `<a href="${targetPath}" class="related-tool-link">${related.icon} ${t(related.titleKey)}</a>`;
      }).join('');
    if (relatedLinks) {
      relatedToolsHTML = `
        <div class="info-section">
          <h3>Related Tools</h3>
          <div class="related-tools-grid">${relatedLinks}</div>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="container" style="padding-top:1.5rem;">
      <div class="tool-page-layout">
        <!-- Main Column (Tool) -->
        <div class="tool-page-main">
          <!-- Tool Title & Introduction -->
          <div style="margin-bottom:1.5rem;">
            <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
              <span>${toolMeta.icon}</span> <span>${toolTitle}</span>
            </h1>
            ${content.intro ? `<p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">${content.intro}</p>` : ''}
          </div>

          <!-- Interactive Tool Widget -->
          <div id="tool-render-box"></div>
        </div>
        
        <!-- Sidebar Column (Informational Only - Ads safely separated below) -->
        <div class="tool-page-sidebar">
          <div class="tool-content-section">
            ${content.howTo ? `
              <div class="info-section">
                <h2>How to Use ${toolTitle}</h2>
                <ol class="info-steps">
                  ${content.howTo.map(step => `<li>${step}</li>`).join('')}
                </ol>
              </div>
            ` : ''}

            ${content.whatItMeasures ? `
              <div class="info-section">
                <h2>What This Test Measures</h2>
                <p>${content.whatItMeasures}</p>
              </div>
            ` : ''}

            ${content.whyUseIt ? `
              <div class="info-section">
                <h2>Why Use This Test</h2>
                <p>${content.whyUseIt}</p>
              </div>
            ` : ''}

            ${content.interpretResults ? `
              <div class="info-section">
                <h2>How to Interpret Your Results</h2>
                <p>${content.interpretResults}</p>
              </div>
            ` : ''}

            ${content.tips ? `
              <div class="info-section">
                <h2>Tips for Accurate Results</h2>
                <ul>
                  ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${relatedToolsHTML}
          </div>
        </div>
      </div>
      
      <!-- Safe Ad Space BELOW the tool and guide with strict buffer margins -->
      <div class="safe-ad-container" style="margin: 3.5rem auto 1.5rem; max-width: 900px; text-align: center;">
        ${renderAdSpace('banner')}
      </div>

      <!-- Full Width FAQ Section -->
      <div id="tool-faq-container" style="margin-top: 2rem;"></div>
    </div>
  `;

  document.body.dataset.toolKey = toolKey;
  const toolRenderBox = document.getElementById('tool-render-box');
  toolMeta.renderFn(toolRenderBox);
  renderFAQ(document.getElementById('tool-faq-container'), toolMeta.faqs);
}

function renderFAQPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.75rem;">
          ❓ Frequently Asked Questions
        </h1>
        <p class="hero-subtitle" style="margin-bottom:2rem; color:var(--text-secondary); font-size:1.1rem; line-height:1.7;">
          Everything you need to know about testing keyboards, diagnosing mouse button issues, measuring typing speed, and understanding human cognitive benchmarks on CatKeyLab.
        </p>

        <div id="faq-page-accordion"></div>
      </div>
    </div>
  `;

  renderFAQ(document.getElementById('faq-page-accordion'), [
    { q: 'How do I test if a keyboard key is broken or unresponsive?', a: 'Open the <a href="/tools/keyboard-test/">Keyboard Tester</a>, click inside the test area, and press each key on your keyboard. Every key that registers correctly will light up on the visual layout and record its keycode in the event log. If a key fails to highlight, it is not registering with the browser, which indicates a faulty switch, debris under the keycap, or a broken circuit board trace.' },
    { q: 'What is keyboard ghosting and key rollover (NKRO)?', a: 'Keyboard ghosting occurs when pressing multiple keys simultaneously causes some keystrokes to fail or registers unpressed keys. "NKRO" (N-Key Rollover) means your keyboard can accurately register as many keys as you press at once without limitation. You can test your keyboard rollover capability using the <a href="/tools/keyboard-test/">Keyboard Tester</a> by holding down multiple keys simultaneously.' },
    { q: 'How do I detect mouse double-clicking issues (switch chatter)?', a: 'Use our <a href="/tools/double-click-test/">Double Click Tester</a>. Click once firmly inside the test zone. If the tool registers two clicks with an interval under 40 milliseconds when you only clicked once, your mouse switch is "chattering": a common mechanical failure where worn micro-switch contacts bounce involuntarily.' },
    { q: 'How is typing speed (WPM) calculated?', a: 'Words Per Minute (WPM) is standardized as <code>(Characters Typed ÷ 5) ÷ Minutes Elapsed</code>. Any 5 keystrokes (including spaces and punctuation) count as one standardized "word". Accuracy is calculated as the percentage of correct characters out of total characters typed. Test yours on the <a href="/tools/typing-test/">Typing Speed Test</a>.' },
    { q: 'What is the average human visual reaction time?', a: 'The average visual reaction time for healthy adults is between 200ms and 250ms. Gamers and athletes often reach 150ms–190ms. Display latency, monitor refresh rate (60Hz vs 144Hz+), and mouse polling rate also affect measured times by several milliseconds. Measure yours with our <a href="/tools/reaction-time-test/">Reaction Time Test</a>.' },
    { q: 'What is a good CPS (Clicks Per Second) score?', a: 'Standard regular clicking with one finger averages 6 to 8 CPS. Gamers practicing butterfly clicking or jitter clicking routinely achieve 10 to 14+ CPS. Specialized techniques like drag clicking on textured mouse switches can reach 20+ CPS. Test your click rate on the <a href="/tools/cps-test/">CPS Test</a>.' },
    { q: 'Does CatKeyLab collect or transmit my keystrokes or mouse clicks?', a: 'No. CatKeyLab operates 100% client-side inside your browser sandbox. Your typing text, mouse coordinates, and test scores are processed locally on your device. We do not store, track, or transmit your private hardware logs.' },
    { q: 'Do these tests work on mobile phones and tablets?', a: 'Yes! CatKeyLab features mobile-responsive touch controls, mobile soft keyboard buffers (for typing on iOS/Android virtual keyboards), and touch-friendly game controls for smartphones and tablets.' },
    { q: 'Are the global leaderboards anonymous?', a: 'Yes! CatKeyLab automatically generates a fun, anonymous cat alias (like <em>Speedy Tabby #4820</em>) with zero account creation, email sign-up, or personal data collection.' }
  ]);
}

function renderContactPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:850px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.75rem;">
          📬 Contact & Support
        </h1>
        <p class="hero-subtitle" style="margin-bottom:2rem; color:var(--text-secondary); font-size:1.1rem; line-height:1.7;">
          Have questions, suggestions for new hardware testing tools, or feedback about CatKeyLab? We'd love to hear from you!
        </p>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem; margin-bottom:2.5rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">💬</div>
            <h3 style="color:var(--text-primary); margin-bottom:0.5rem;">Creator & Developer</h3>
            <p style="color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">CatKeyLab is designed and developed by Dylan. Discover games, interactive utilities, and creations on itch.io.</p>
            <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              <span>Visit Dylan on itch.io</span> ↗
            </a>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">✉️</div>
            <h3 style="color:var(--text-primary); margin-bottom:0.5rem;">Email Support</h3>
            <p style="color:var(--text-secondary); line-height:1.6; margin-bottom:1rem;">For business inquiries, bug reports, or feature requests, contact us directly via email.</p>
            <a href="mailto:support@catkeylab.com" class="btn btn-secondary btn-sm">
              <span>support@catkeylab.com</span>
            </a>
          </div>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); line-height:1.8; color:var(--text-secondary);">
          <h3 style="color:var(--text-primary); margin-bottom:0.75rem;">🐱 Project Mission & Open Source</h3>
          <p>CatKeyLab was built to provide a clean, distraction-free, 100% private alternative to bloated desktop testing applications and ad-cluttered spam sites. Every tool is built with modern web standards (HTML5 Canvas, CSS3, ES2022+ JavaScript, Web Audio API) and licensed under the MIT License.</p>
          <p style="margin-top:0.75rem;">Check out our <a href="/about/" style="color:var(--accent-cyan); font-weight:600;">About Page</a> to meet Nibbles the real cat, or review our <a href="/privacy/" style="color:var(--accent-cyan); font-weight:600;">Privacy Policy</a> for details on our client-side data guarantee.</p>
        </div>
      </div>
    </div>
  `;
}

function renderLegalPage(container, type) {
  let title = 'About CatKeyLab';
  let body = `
    <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
      Free, Private & Powerful Online Hardware Testing Suite & Typing Speed Challenge 🐾
    </p>

    <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
      <!-- Featured Cat Card (Meet Nibbles in Real Life) -->
      <div id="meet-nibbles-card" style="background:linear-gradient(135deg, rgba(249,115,22,0.16), rgba(16,185,129,0.16)); border:2px solid #f97316; padding:2rem; border-radius:var(--radius-lg); display:flex; align-items:center; gap:2rem; flex-wrap:wrap; box-shadow:0 10px 30px rgba(0,0,0,0.35);">
        <img src="/assets/orange-cat.jpg" 
             onerror="if(!this.dataset.tried){this.dataset.tried=1; this.src='../assets/orange-cat.jpg';}else if(this.dataset.tried==1){this.dataset.tried=2; this.src='./assets/orange-cat.jpg';}else if(this.dataset.tried==2){this.dataset.tried=3; this.src='assets/orange-cat.jpg';}" 
             alt="Real Orange Cat in Box - Inspiration for Nibbles" 
             style="width:300px; max-width:100%; height:300px; object-fit:cover; border-radius:var(--radius-lg); border:4px solid #fb923c; box-shadow:0 12px 30px rgba(249,115,22,0.45); flex-shrink:0; margin:0 auto;" />
        <div style="flex:1; min-width:260px;">
          <div style="display:inline-block; background:rgba(249,115,22,0.25); color:#f97316; font-size:0.8rem; font-weight:800; padding:0.3rem 0.75rem; border-radius:var(--radius-full); text-transform:uppercase; margin-bottom:0.75rem;">
            🐾 Meet Nibbles in Real Life
          </div>
          <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
            Meet Nibbles in Real Life! 🐱
          </h2>
          <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem; margin-bottom:1.25rem;">
            This adorable orange cat sitting in a cardboard box is the real-life inspiration behind <strong>Nibbles</strong>! Created by <strong>Dylan</strong>, Nibbles lives on CatKeyLab to keep you company while you test hardware, practice typing, and play companion arcade games!
          </p>
          <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg, #f97316, #ea580c); border:none; box-shadow:0 4px 14px rgba(249,115,22,0.4); font-weight:700;">
            <span>🎮 Visit Dylan on itch.io</span> ↗
          </a>
        </div>
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
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🏆 Anonymous Global Leaderboards</h3>
        <p>CatKeyLab features a 100% private, anonymous leaderboard and percentile ranking engine. Players automatically receive a fun anonymous cat alias (e.g., <em>Speedy Tabby #4820</em>) with zero account creation or personal data collection.</p>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">✨ Included Tools & Modules (20 Suite Modules)</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-top:0.75rem;">
          <div><strong>⏱️ Reaction Time Test</strong>: Visual reaction latency tester in milliseconds.</div>
          <div><strong>🧠 Sequence Memory Test</strong>: Simon-says 3x3 interactive pattern recall with tones.</div>
          <div><strong>🎯 Aim Trainer</strong>: 30 targets precision challenge measuring acquisition speed & accuracy.</div>
          <div><strong>🔢 Number Memory Test</strong>: Digit span recall test with animated progress timer.</div>
          <div><strong>💬 Verbal Memory Test</strong>: SEEN vs NEW sequential word memory test with 3 lives.</div>
          <div><strong>🐒 Chimp Test</strong>: Ascending working memory grid test inspired by Kyoto University.</div>
          <div><strong>🔳 Visual Memory Test</strong>: Spatial matrix pattern recall expanding up to 7x7 grid.</div>
          <div><strong>⌨️ Typing Speed (WPM)</strong>: Distraction-free Monkeytype-inspired test with mechanical key sounds.</div>
          <div><strong>⛳ Nibbles 2D Mini Golf</strong>: 18-hole 2D physics golf game with 3/9/18 hole rounds, portals & windmills.</div>
          <div><strong>🎣 Cat Fishing Game</strong>: Interactive 2D cartoon fishing adventure with Nibbles.</div>
          <div><strong>🍉 Fruit Slicer Game</strong>: Juicy 2D fruit slicer arcade game to test rapid swiping.</div>
          <div><strong>🐟 Help Nibbles Find Fish</strong>: 10x10 procedural maze puzzle guide game with touch/WASD controls.</div>
          <div><strong>🎴 Cat Card Memory Match</strong>: 3D card flipping memory game matching 8 cat pairs.</div>
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
          <p>At <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>), we believe hardware testing, typing utilities, and companion arcade games should be fast, private, and secure. We do not collect, transmit, or store any personal data, email addresses, names, IP logs, keypress histories, or private hardware logs.</p>
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
          <p>All tool calculations-including mouse button detection, keyboard keycode logging, WPM speed benchmarks, mini golf physics, and reaction time measurements-execute <strong>100% locally inside your web browser sandbox</strong>. No raw test data ever leaves your device.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">💾 Local Storage Usage</h3>
          <p>CatKeyLab uses standard browser <code>localStorage</code> solely for persisting non-sensitive preferences locally on your device:</p>
          <ul style="margin-top:0.5rem; margin-left:1.25rem;">
            <li>Dark / Light color theme preference (<code>catkeylab_theme</code>)</li>
            <li>Sound effects toggle state (<code>catkeylab_sound</code>)</li>
            <li>Personal high scores and benchmark progress</li>
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
          <p>By accessing and using <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>), created by Dylan (<a href="https://snowyorca.itch.io/" target="_blank" style="color:var(--accent-cyan);">snowyorca.itch.io</a>), you agree to these Terms of Service. CatKeyLab provides free, browser-native hardware testing, cognitive Human Benchmark games, companion arcade games, and typing utilities for personal, commercial, and educational use.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">2. Use of Utilities & Browser Sandbox</h3>
          <p>All tools on CatKeyLab run strictly within your web browser sandbox using modern web standards (HTML5 Canvas, CSS3, JavaScript ES2022+, and Web Audio API). Tools are intended for hardware verification, cognitive speed practice, and hardware chatter diagnostics.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">3. Anonymous Leaderboards & Fair Play</h3>
          <p>CatKeyLab features global anonymous high score leaderboards across all benchmark games. Players agree to participate in fair play without using automated cheat scripts or artificial score injection.</p>
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
        Complete Index of Interactive Tools, Companion Arcade Games & Resources on CatKeyLab 🗺️
      </p>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-emerald); font-size:1.2rem; margin-bottom:1rem;">🧠 Human Benchmark Suite</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="/reaction-time-test/" style="color:var(--text-primary); font-weight:600;">⏱️ Reaction Time Latency Test</a></li>
            <li><a href="/sequence-memory-test/" style="color:var(--text-primary); font-weight:600;">🧠 Sequence Memory Test (Simon Grid)</a></li>
            <li><a href="/aim-trainer-test/" style="color:var(--text-primary); font-weight:600;">🎯 Aim Trainer Precision Challenge</a></li>
            <li><a href="/number-memory-test/" style="color:var(--text-primary); font-weight:600;">🔢 Number Memory Digit Span Test</a></li>
            <li><a href="/verbal-memory-test/" style="color:var(--text-primary); font-weight:600;">💬 Verbal Memory Word Recall Test</a></li>
            <li><a href="/chimp-test/" style="color:var(--text-primary); font-weight:600;">🐒 Chimp Test Working Memory Grid</a></li>
            <li><a href="/visual-memory-test/" style="color:var(--text-primary); font-weight:600;">🔳 Visual Memory Spatial Recall Test</a></li>
            <li><a href="/typing-test/" style="color:var(--text-primary); font-weight:600;">⌨️ Typing Speed Challenge (WPM)</a></li>
            <li><a href="/leaderboards/" style="color:var(--accent-cyan); font-weight:700;">🏆 Anonymous Global Leaderboards</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-amber); font-size:1.2rem; margin-bottom:1rem;">🎮 Nibbles Companion Arcade Games</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="/cat-fishing-game/" style="color:var(--accent-cyan); font-weight:700;">🎣 Nibbles 2D Fishing Adventure</a></li>
            <li><a href="/fruit-slicer-game/" style="color:var(--text-primary); font-weight:600;">🍉 Nibbles Fruit Slicer Arcade</a></li>
            <li><a href="/cat-mini-golf-game/" style="color:var(--text-primary); font-weight:600;">⛳ Nibbles 2D Mini Golf (18 Holes)</a></li>
            <li><a href="/fish-maze-game/" style="color:var(--text-primary); font-weight:600;">🐟 Help Nibbles Find Fish (Maze)</a></li>
            <li><a href="/card-memory-game/" style="color:var(--text-primary); font-weight:600;">🎴 Cat Card Memory Match (3D)</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-cyan); font-size:1.2rem; margin-bottom:1rem;">🖱️ Hardware & Speed Diagnostics</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="/mouse-test/" style="color:var(--text-primary); font-weight:600;">🖱️ Mouse Button & Movement Tester</a></li>
            <li><a href="/keyboard-test/" style="color:var(--text-primary); font-weight:600;">🖥️ Visual Keyboard Switch Tester</a></li>
            <li><a href="/auto-clicker/" style="color:var(--text-primary); font-weight:600;">🎯 In-Browser Online Auto Clicker</a></li>
            <li><a href="/cps-test/" style="color:var(--text-primary); font-weight:600;">⚡ CPS Test (Clicks Per Second)</a></li>
            <li><a href="/click-speed-test/" style="color:var(--text-primary); font-weight:600;">🚀 Click Velocity & Burst Speed Test</a></li>
            <li><a href="/click-counter/" style="color:var(--text-primary); font-weight:600;">🔢 Digital Tally Click Counter</a></li>
            <li><a href="/double-click-test/" style="color:var(--text-primary); font-weight:600;">👆 Mouse Double Click Chatter Tester</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-rose); font-size:1.2rem; margin-bottom:1rem;">Platform & Information</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="/nibbles/" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat</a></li>
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
          <img src="/assets/orange-cat.jpg" 
               onerror="if(!this.dataset.tried){this.dataset.tried=1; this.src='../assets/orange-cat.jpg';}else if(this.dataset.tried==1){this.dataset.tried=2; this.src='./assets/orange-cat.jpg';}else if(this.dataset.tried==2){this.dataset.tried=3; this.src='assets/orange-cat.jpg';}" 
               alt="Real Orange Cat in Box - Inspiration for Nibbles" 
               style="width:380px; max-width:100%; height:380px; object-fit:cover; border-radius:var(--radius-lg); border:4px solid #fb923c; box-shadow:0 12px 30px rgba(249,115,22,0.45); flex-shrink:0; margin:0 auto;" />
          <div style="flex:1; min-width:260px;">
            <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
              Meet Nibbles in Real Life! 🐱
            </h2>
            <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">
              This adorable orange cat sitting in a cardboard box is the real-life inspiration behind <strong>Nibbles</strong>! Created by <strong>Dylan</strong>, Nibbles lives on CatKeyLab to keep you company while you test hardware, practice typing, and play companion arcade games!
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
            <h3 style="font-size:1.2rem; color:var(--accent-amber); margin-bottom:0.5rem;">⛳ Nibbles 2D Mini Golf</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Play an 18-hole HTML5 Canvas 2D physics mini golf game with Nibbles! Master wind, portals, sand traps, and dual windmills.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-cyan); margin-bottom:0.5rem;">🎣 Cat Fishing Game</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Help Nibbles catch fish in this interactive 2D cartoon fishing adventure by clicking rapidly when you get a bite!</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-primary); margin-bottom:0.5rem;">🍉 Nibbles Fruit Slicer</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Swipe your mouse or finger to help Nibbles slice flying fruit in this juicy arcade minigame.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-rose); margin-bottom:0.5rem;">🐟 Help Nibbles Find Fish</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Guide Nibbles through a 10x10 procedural maze puzzle to catch delicious fish using keyboard WASD or touch D-Pad controls!</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--accent-primary); font-size:1.2rem; margin-bottom:0.5rem;">🎴 Cat Card Memory Match</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Flip 3D cat cards to test your memory and find all 8 matching pairs in the fewest turns possible.</p>
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
