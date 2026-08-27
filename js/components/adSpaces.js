/* ==========================================================================
   CatKeyLab - Non-Intrusive Ad Space Component
   ========================================================================== */

export function renderAdSpace(type = 'banner', slotId = '') {
  return `
    <div class="ad-slot ad-${type}">
      <span class="ad-label">Advertisement</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-8935268300975005"
           ${slotId ? `data-ad-slot="${slotId}"` : ''}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </div>
  `;
}
