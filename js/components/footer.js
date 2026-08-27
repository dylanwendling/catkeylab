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
            <a href="#" class="logo">
              <div class="logo-icon" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 0 12px rgba(16,185,129,0.4);">
                🐱
              </div>
              <div class="logo-text">CatKey<span style="color:var(--accent-emerald);">Lab</span> 🐾</div>
            </a>
            <p data-i18n="footerAbout">${t('footerAbout')}</p>
            <div style="margin-top:0.6rem;">
              <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="footer-link" style="color:var(--accent-amber); font-weight:700; display:inline-flex; align-items:center; gap:0.35rem;">
                <span>🎮 Created by SnowyOrca on itch.io</span> ↗
              </a>
            </div>
            <div class="privacy-badge" style="margin-top:0.6rem;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span data-i18n="privacyNotice">${t('privacyNotice')}</span>
            </div>
          </div>

          <!-- Tools Column -->
          <div>
            <h4 class="footer-title" data-i18n="navTools">${t('navTools')}</h4>
            <div class="footer-links">
              <a href="#typing-test" class="footer-link" data-i18n="navTypingTest">${t('navTypingTest')}</a>
              <a href="#auto-clicker" class="footer-link" data-i18n="navAutoClicker">${t('navAutoClicker')}</a>
              <a href="#cps-test" class="footer-link" data-i18n="navCPSTest">${t('navCPSTest')}</a>
              <a href="#click-speed-test" class="footer-link" data-i18n="navClickSpeedTest">${t('navClickSpeedTest')}</a>
              <a href="#click-counter" class="footer-link" data-i18n="navClickCounter">${t('navClickCounter')}</a>
              <a href="#mouse-test" class="footer-link" data-i18n="navMouseTest">${t('navMouseTest')}</a>
              <a href="#keyboard-test" class="footer-link" data-i18n="navKeyboardTest">${t('navKeyboardTest')}</a>
              <a href="#reaction-time-test" class="footer-link" data-i18n="navReactionTimeTest">${t('navReactionTimeTest')}</a>
              <a href="#double-click-test" class="footer-link" data-i18n="navDoubleClickTest">${t('navDoubleClickTest')}</a>
            </div>
          </div>

          <!-- Languages Column -->
          <div>
            <h4 class="footer-title" data-i18n="navLanguages">${t('navLanguages')}</h4>
            <div class="footer-links" style="display:grid; grid-template-columns: 1fr 1fr; gap:0.4rem;">
              ${LANGUAGES.map(lang => `
                <a href="javascript:void(0)" class="footer-link footer-lang-btn" data-lang="${lang.code}">
                  ${lang.flag} ${lang.name}
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Legal & Info Column -->
          <div>
            <h4 class="footer-title">Platform & Privacy</h4>
            <div class="footer-links">
              <a href="https://catkeylab.onrender.com/#about" class="footer-link">About CatKeyLab</a>
              <a href="https://catkeylab.onrender.com/#privacy" class="footer-link">Privacy Policy</a>
              <a href="https://catkeylab.onrender.com/#terms" class="footer-link">Terms of Service</a>
              <a href="https://catkeylab.onrender.com/#sitemap" class="footer-link">Sitemap & Index</a>
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
