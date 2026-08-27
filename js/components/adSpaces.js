/* ==========================================================================
   CatKeyLab - Non-Intrusive Ad Space Component
   ========================================================================== */

export function renderAdSpace(type = 'banner') {
  return `
    <div class="ad-slot ad-${type}">
      <span class="ad-label">Advertisement</span>
      <div class="ad-placeholder-box">
        <span>Sponsor Advertisement Space</span>
      </div>
    </div>
  `;
}
