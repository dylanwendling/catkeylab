/* ==========================================================================
   ClickPulse - FAQ & JSON-LD Schema Generator Component
   ========================================================================== */

export function renderFAQ(container, faqData = []) {
  if (!faqData || faqData.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <section class="faq-section">
      <div class="section-header" style="text-align:left;">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <p class="section-subtitle" style="margin:0;">Everything you need to know about this tool, browser rules, and performance.</p>
      </div>

      <div class="faq-list">
        ${faqData.map((item, idx) => `
          <div class="faq-item ${idx === 0 ? 'open' : ''}">
            <button class="faq-question">
              <span>${item.q}</span>
              <span class="faq-icon">▼</span>
            </button>
            <div class="faq-answer">
              <p>${item.a}</p>
            </div>
          </div>
        `).map(html => html).join('')}
      </div>
    </section>
  `;

  bindFAQEvents();
  injectFAQSchema(faqData);
}

function bindFAQEvents() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
}

function injectFAQSchema(faqData) {
  let schemaScript = document.getElementById('faq-json-ld');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'faq-json-ld';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const schemaJSON = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  schemaScript.textContent = JSON.stringify(schemaJSON);
}
