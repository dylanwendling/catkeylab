/* ==========================================================================
   CatKeyLab - Footer Component (Cat Theme)
   ========================================================================== */

import { t, LANGUAGES, setLanguage } from '../i18n.js';

export function renderFooter(container) {
  container.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand Summary Column -->
          <div class="footer-brand">
            <a href="/" class="logo">
              <div class="logo-icon">🐱</div>
              <div class="logo-text">CatKey<span>Lab</span></div>
            </a>
            <p data-i18n="footerAbout">${t('footerAbout')}</p>
            <div style="margin-top:0.6rem;">
              <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="footer-link" style="color:var(--accent-amber); font-weight:700; display:inline-flex; align-items:center; gap:0.35rem;">
                <span>🎮 Created by Dylan on itch.io</span> ↗
              </a>
            </div>
            <div class="privacy-badge" style="margin-top:0.6rem;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span data-i18n="privacyNotice">${t('privacyNotice')}</span>
            </div>
          </div>

          <!-- Tools Column -->
          <div>
            <h4 class="footer-title">Human Benchmarks</h4>
            <div class="footer-links">
              <a href="/tools/reaction-time-test/" class="footer-link">Reaction Time Test</a>
              <a href="/tools/sequence-memory-test/" class="footer-link">Sequence Memory</a>
              <a href="/tools/aim-trainer/" class="footer-link">Aim Trainer</a>
              <a href="/tools/number-memory-test/" class="footer-link">Number Memory</a>
              <a href="/tools/verbal-memory-test/" class="footer-link">Verbal Memory</a>
              <a href="/tools/chimp-test/" class="footer-link">Chimp Test</a>
              <a href="/tools/visual-memory-test/" class="footer-link">Visual Memory</a>
              <a href="/tools/typing-test/" class="footer-link">Typing Speed (WPM)</a>
            </div>
          </div>

          <!-- Hardware & Speed Column -->
          <div>
            <h4 class="footer-title">Hardware & Speed</h4>
            <div class="footer-links">
              <a href="/tools/keyboard-test/" class="footer-link">Keyboard Key Tester</a>
              <a href="/tools/mouse-test/" class="footer-link">Mouse Button Tester</a>
              <a href="/tools/double-click-test/" class="footer-link">Double Click Tester</a>
              <a href="/tools/cps-test/" class="footer-link">CPS Speed Test</a>
              <a href="/tools/click-speed-test/" class="footer-link">Click Speed Test</a>
              <a href="/tools/click-counter/" class="footer-link">Click Counter</a>
              <a href="/tools/auto-clicker/" class="footer-link">Online Auto Clicker</a>
              <a href="/tools/" class="footer-link"><strong>Browse All Tools</strong></a>
            </div>
          </div>

          <!-- Games Column -->
          <div>
            <h4 class="footer-title">Arcade Games</h4>
            <div class="footer-links">
              <a href="/games/mini-golf/" class="footer-link">⛳ Nibbles Mini Golf</a>
              <a href="/games/fishing/" class="footer-link">🎣 Cat Fishing Game</a>
              <a href="/games/fruit-slicer/" class="footer-link">🍉 Fruit Slicer</a>
              <a href="/games/fish-maze/" class="footer-link">🐟 Nibbles Fish Maze</a>
              <a href="/games/card-memory/" class="footer-link">🎴 Card Memory Match</a>
              <a href="/leaderboards/" class="footer-link">🏆 Leaderboards</a>
            </div>
          </div>

          <!-- Legal & Info Column -->
          <div>
            <h4 class="footer-title">Platform & Privacy</h4>
            <div class="footer-links">
              <a href="/about/" class="footer-link">About CatKeyLab</a>
              <a href="/faq/" class="footer-link">Frequently Asked Questions</a>
              <a href="/privacy/" class="footer-link">Privacy Policy</a>
              <a href="/terms/" class="footer-link">Terms of Service</a>
              <a href="/contact/" class="footer-link">Contact & Support</a>
              <a href="/sitemap/" class="footer-link">Sitemap & Index</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div data-i18n="copyright">${t('copyright')}</div>
          <div>No desktop downloads required. All calculations occur locally in your browser.</div>
        </div>
      </div>
    </footer>
  `;

  bindFooterEvents();
}

function bindFooterEvents() {
  const langBtns = document.querySelectorAll('.footer-lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.lang;
      setLanguage(code, true);
    });
  });
}
