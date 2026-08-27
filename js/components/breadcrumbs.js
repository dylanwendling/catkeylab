/* ==========================================================================
   CatKeyLab - Breadcrumbs Component for SEO
   ========================================================================== */

import { t } from '../i18n.js';

export function renderBreadcrumbs(container, currentRouteName) {
  if (!currentRouteName) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="#" data-i18n="navHome">${t('navHome')}</a>
      <span class="separator">/</span>
      <a href="#tools" data-i18n="navTools">${t('navTools')}</a>
      <span class="separator">/</span>
      <span style="color:var(--text-primary); font-weight:600;">${currentRouteName}</span>
    </nav>
  `;
}
