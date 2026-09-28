/* ==========================================================================
   CatKeyLab - Breadcrumbs Component with Schema.org Microdata
   ========================================================================== */

import { t } from '../i18n.js';

export function renderBreadcrumbs(container, currentRouteName, categoryName = 'Tools', categoryPath = '/tools/') {
  if (!currentRouteName) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="/" itemprop="item"><span itemprop="name">${t('navHome') || 'Home'}</span></a>
        <meta itemprop="position" content="1" />
      </span>
      <span class="separator">/</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="${categoryPath}" itemprop="item"><span itemprop="name">${categoryName}</span></a>
        <meta itemprop="position" content="2" />
      </span>
      <span class="separator">/</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span style="color:var(--text-primary); font-weight:600;" itemprop="name">${currentRouteName}</span>
        <meta itemprop="position" content="3" />
      </span>
    </nav>
  `;
}
