import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOOL_METADATA } from './js/data/toolMetadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

// 1. Setup dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR);

// 2. Copy static assets
const assetsToCopy = ['assets', 'css', 'js', 'favicon.svg', 'orange-cat.jpg'];
for (const asset of assetsToCopy) {
  if (fs.existsSync(path.join(__dirname, asset))) {
    fs.cpSync(path.join(__dirname, asset), path.join(DIST_DIR, asset), { recursive: true });
  }
}

// 3. Read template
const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function escapeHtml(unsafe) {
  return (unsafe || '').toString()
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function generateToolHtml(toolKey, tool) {
  const content = tool.content || {};
  let html = `<div class="seo-fallback">\n`;
  html += `<h1>${tool.icon} ${escapeHtml(tool.desc)}</h1>\n`;
  if (content.intro) html += `<p>${escapeHtml(content.intro)}</p>\n`;
  
  if (content.howTo) {
    html += `<h2>How to Use</h2><ul>`;
    for (const step of content.howTo) html += `<li>${escapeHtml(step)}</li>`;
    html += `</ul>\n`;
  }
  if (content.whatItMeasures) html += `<h2>What It Measures</h2><p>${escapeHtml(content.whatItMeasures)}</p>\n`;
  if (content.whyUseIt) html += `<h2>Why Use It</h2><p>${escapeHtml(content.whyUseIt)}</p>\n`;
  if (content.interpretResults) html += `<h2>How to Interpret Results</h2><p>${escapeHtml(content.interpretResults)}</p>\n`;
  if (content.tips) {
    html += `<h2>Tips</h2><ul>`;
    for (const tip of content.tips) html += `<li>${escapeHtml(tip)}</li>`;
    html += `</ul>\n`;
  }
  
  if (tool.faqs) {
    html += `<h2>FAQs</h2>`;
    for (const faq of tool.faqs) {
      html += `<h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>\n`;
    }
  }
  
  html += `</div>`;
  return html;
}

// 4. Generate tool pages
const sitemapUrls = [];
const today = new Date().toISOString().split('T')[0];

sitemapUrls.push(`  <url>\n    <loc>https://catkeylab.com/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);

// Add non-tool pages
const extraPages = ['tools', 'leaderboards', 'daily-challenge', 'about', 'privacy', 'terms', 'sitemap', 'nibbles'];
for (const page of extraPages) {
  const pageDir = path.join(DIST_DIR, page);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'index.html'), template);
  sitemapUrls.push(`  <url>\n    <loc>https://catkeylab.com/${page}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
}

for (const [key, tool] of Object.entries(TOOL_METADATA)) {
  const toolDir = path.join(DIST_DIR, key);
  fs.mkdirSync(toolDir, { recursive: true });
  
  const toolHtml = generateToolHtml(key, tool);
  
  // Replace seo fallback
  let pageHtml = template.replace(/<div class="seo-fallback" style="display: none;">[\s\S]*?<\/div>\s*<\/div>\s*<\/main>/, 
    toolHtml + '\n    </div>\n  </main>');
  
  // Also catch if it didn't match perfectly, just simple replacement
  if (pageHtml === template) {
    pageHtml = template.replace(/<div class="seo-fallback" style="display: none;">[\s\S]*?<\/div>/, toolHtml);
  }
  
  // Replace title and desc
  const title = `CatKeyLab 🐾 - ${escapeHtml(tool.category).toUpperCase()} Tool`;
  pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  pageHtml = pageHtml.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(tool.desc)}">`);
  
  // Update canonical
  pageHtml = pageHtml.replace(/<link rel="canonical" href="https:\/\/catkeylab.com\/">/, `<link rel="canonical" href="https://catkeylab.com/${key}/">`);

  fs.writeFileSync(path.join(toolDir, 'index.html'), pageHtml);
  
  sitemapUrls.push(`  <url>\n    <loc>https://catkeylab.com/${key}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`);
}

// 5. Root index.html
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), template);

// 6. Generate Sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.join('\n')}
</urlset>`;

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
if (fs.existsSync(path.join(__dirname, 'robots.txt'))) {
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), fs.readFileSync(path.join(__dirname, 'robots.txt'), 'utf8'));
}

console.log('Build completed successfully! Static output generated in /dist');
