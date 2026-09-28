#!/usr/bin/env python3
"""
CatKeyLab - Static Site Generator (SSG) & Pre-rendering Engine
Generates crawlable, AdSense-compliant static HTML pages for all tools, games, and platform pages.
"""

import os
import sys
import re
import ast
import json
from html import escape

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_URL = "https://catkeylab.com"

# 1. Tool Canonical Route Configuration
TOOL_ROUTES = {
    # Human Benchmarks & Cognitive Tests (tools/)
    'reaction-time-test': {
        'path': '/tools/reaction-time-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Reaction Time Test',
        'aliases': ['reaction-time-test', 'reaction-test', 'reaction-time']
    },
    'sequence-memory-test': {
        'path': '/tools/sequence-memory-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Sequence Memory Test',
        'aliases': ['sequence-memory-test', 'sequence-memory']
    },
    'aim-trainer-test': {
        'path': '/tools/aim-trainer/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Aim Trainer',
        'aliases': ['aim-trainer', 'aim-trainer-test', 'aim-test']
    },
    'number-memory-test': {
        'path': '/tools/number-memory-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Number Memory Test',
        'aliases': ['number-memory-test', 'number-memory']
    },
    'verbal-memory-test': {
        'path': '/tools/verbal-memory-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Verbal Memory Test',
        'aliases': ['verbal-memory-test', 'verbal-memory']
    },
    'chimp-test': {
        'path': '/tools/chimp-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Chimp Test',
        'aliases': ['chimp-test', 'chimpanzee-test']
    },
    'visual-memory-test': {
        'path': '/tools/visual-memory-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Visual Memory Test',
        'aliases': ['visual-memory-test', 'visual-memory']
    },
    'typing-test': {
        'path': '/tools/typing-test/',
        'category': 'benchmarks',
        'categoryName': 'Human Benchmarks',
        'displayName': 'Typing Speed Test (WPM)',
        'aliases': ['typing-test', 'typing-speed-test', 'wpm-test']
    },

    # Hardware Testers (tools/)
    'mouse-test': {
        'path': '/tools/mouse-test/',
        'category': 'hardware',
        'categoryName': 'Hardware Tests',
        'displayName': 'Mouse Tester',
        'aliases': ['mouse-test', 'mouse-tester']
    },
    'keyboard-test': {
        'path': '/tools/keyboard-test/',
        'category': 'hardware',
        'categoryName': 'Hardware Tests',
        'displayName': 'Keyboard Tester',
        'aliases': ['keyboard-test', 'keyboard-tester']
    },
    'double-click-test': {
        'path': '/tools/double-click-test/',
        'category': 'hardware',
        'categoryName': 'Hardware Tests',
        'displayName': 'Double Click Tester',
        'aliases': ['double-click-test', 'double-click', 'mouse-chatter-test']
    },

    # Speed & Clicking Utilities (tools/)
    'cps-test': {
        'path': '/tools/cps-test/',
        'category': 'speed',
        'categoryName': 'Speed Tests',
        'displayName': 'CPS Test (Clicks Per Second)',
        'aliases': ['cps-test', 'clicks-per-second']
    },
    'click-speed-test': {
        'path': '/tools/click-speed-test/',
        'category': 'speed',
        'categoryName': 'Speed Tests',
        'displayName': 'Click Speed Test',
        'aliases': ['click-speed-test', 'click-speed']
    },
    'click-counter': {
        'path': '/tools/click-counter/',
        'category': 'speed',
        'categoryName': 'Speed Tests',
        'displayName': 'Digital Click Counter',
        'aliases': ['click-counter', 'tally-counter']
    },
    'auto-clicker': {
        'path': '/tools/auto-clicker/',
        'category': 'speed',
        'categoryName': 'Speed Tests',
        'displayName': 'Online Auto Clicker',
        'aliases': ['auto-clicker', 'autoclicker']
    },

    # Companion Arcade Games (games/)
    'cat-mini-golf-game': {
        'path': '/games/mini-golf/',
        'category': 'games',
        'categoryName': 'Arcade Games',
        'displayName': 'Nibbles Mini Golf (18 Holes)',
        'aliases': ['mini-golf', 'cat-mini-golf-game', 'cat-mini-golf', 'golf']
    },
    'cat-fishing-game': {
        'path': '/games/fishing/',
        'category': 'games',
        'categoryName': 'Arcade Games',
        'displayName': 'Cat Fishing Game',
        'aliases': ['fishing', 'cat-fishing-game', 'cat-fishing']
    },
    'fruit-slicer-game': {
        'path': '/games/fruit-slicer/',
        'category': 'games',
        'categoryName': 'Arcade Games',
        'displayName': 'Fruit Slicer Arcade',
        'aliases': ['fruit-slicer', 'fruit-slicer-game', 'fruit-slice']
    },
    'fish-maze-game': {
        'path': '/games/fish-maze/',
        'category': 'games',
        'categoryName': 'Arcade Games',
        'displayName': 'Nibbles Fish Maze',
        'aliases': ['fish-maze', 'fish-maze-game', 'cat-maze']
    },
    'card-memory-game': {
        'path': '/games/card-memory/',
        'category': 'games',
        'categoryName': 'Arcade Games',
        'displayName': 'Card Memory Match (3D)',
        'aliases': ['card-memory', 'card-memory-game', 'cat-card-memory']
    }
}

# 2. Extract TOOL_METADATA from js/data/toolMetadata.js
def load_tool_metadata():
    with open('js/data/toolMetadata.js', 'r', encoding='utf-8') as f:
        js_code = f.read()
    s = re.sub(r'^\s*export\s+const\s+TOOL_METADATA\s*=\s*', '', js_code).strip()
    if s.endswith(';'):
        s = s[:-1].strip()

    def repl_key(match):
        prefix = match.group(1)
        key = match.group(2)
        colon = match.group(3)
        return f"{prefix}'{key}'{colon}"

    s = re.sub(r'([{,]\s*)([a-zA-Z_]\w*)(\s*:)', repl_key, s)
    return ast.literal_eval(s)

def render_ad_slot():
    return """
      <div class="safe-ad-container" style="margin: 3.5rem auto 2rem; max-width: 900px; text-align: center;">
        <div class="ad-slot ad-banner" style="min-height: 250px; background: rgba(0,0,0,0.15); border: 1px dashed rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span class="ad-label" style="display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.75rem;">Advertisement</span>
          <ins class="adsbygoogle"
               style="display:block; width:100%;"
               data-ad-client="ca-pub-8935268300975005"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
    """

STATIC_HEADER_HTML = """
    <header class="site-header">
      <div class="container header-inner">
        <a href="/" class="logo" id="header-logo">
          <div class="logo-icon" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 0 12px rgba(16,185,129,0.4);">
            🐱
          </div>
          <div class="logo-text">CatKey<span style="color:var(--accent-emerald);">Lab</span> 🐾</div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-desktop">
          <a href="/" class="nav-link" data-route="">Home</a>
          
          <!-- Benchmarks Dropdown -->
          <div class="dropdown" id="benchmarks-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>🧠 Benchmarks ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/reaction-time-test/" class="dropdown-item">⏱️ Reaction Time Test</a>
              <a href="/tools/sequence-memory-test/" class="dropdown-item">🧠 Sequence Memory Test</a>
              <a href="/tools/aim-trainer/" class="dropdown-item">🎯 Aim Trainer</a>
              <a href="/tools/number-memory-test/" class="dropdown-item">🔢 Number Memory Test</a>
              <a href="/tools/verbal-memory-test/" class="dropdown-item">💬 Verbal Memory Test</a>
              <a href="/tools/chimp-test/" class="dropdown-item">🐒 Chimp Test</a>
              <a href="/tools/visual-memory-test/" class="dropdown-item">🔳 Visual Memory Test</a>
              <a href="/tools/typing-test/" class="dropdown-item">⌨️ WPM Typing Test</a>
            </div>
          </div>

          <!-- Hardware Dropdown -->
          <div class="dropdown" id="hardware-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>🖱️ Hardware ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/keyboard-test/" class="dropdown-item">⌨️ Keyboard Key Tester</a>
              <a href="/tools/mouse-test/" class="dropdown-item">🖱️ Mouse Hardware Tester</a>
              <a href="/tools/double-click-test/" class="dropdown-item">⚡ Double Click Tester</a>
            </div>
          </div>

          <!-- Speed & Tools Dropdown -->
          <div class="dropdown" id="tools-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>⚡ Speed & Utilities ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="/tools/cps-test/" class="dropdown-item">⚡ CPS Speed Test</a>
              <a href="/tools/click-speed-test/" class="dropdown-item">🚀 Click Speed Test</a>
              <a href="/tools/click-counter/" class="dropdown-item">🔢 Digital Click Counter</a>
              <a href="/tools/auto-clicker/" class="dropdown-item">🤖 Online Auto Clicker</a>
              <div style="height:1px; background:var(--border-color); margin:0.35rem 0;"></div>
              <a href="/tools/" class="dropdown-item"><strong>📂 All Tools Directory</strong></a>
            </div>
          </div>

          <!-- Games Dropdown -->
          <div class="dropdown" id="games-dropdown">
            <button class="dropdown-btn" aria-haspopup="true">
              <span>🎮 Games ▾</span>
            </button>
            <div class="dropdown-menu">
              <a href="/games/mini-golf/" class="dropdown-item">⛳ Nibbles Mini Golf (18H)</a>
              <a href="/games/fishing/" class="dropdown-item">🎣 Cat Fishing Game</a>
              <a href="/games/fruit-slicer/" class="dropdown-item">🍉 Fruit Slicer Arcade</a>
              <a href="/games/fish-maze/" class="dropdown-item">🐟 Nibbles Fish Maze</a>
              <a href="/games/card-memory/" class="dropdown-item">🎴 Card Memory Match</a>
            </div>
          </div>

          <a href="/about/" class="nav-link" data-route="about">About</a>
          <a href="/faq/" class="nav-link" data-route="faq">FAQ</a>
        </nav>
      </div>
    </header>
"""

STATIC_FOOTER_HTML = """
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; box-shadow:0 0 10px rgba(16,185,129,0.3);">
              🐱
            </div>
            <div class="logo-text">CatKey<span style="color:var(--accent-emerald);">Lab</span> 🐾</div>
          </div>
          <p class="footer-desc">
            Free, private, high-performance browser-based hardware testing suite and human benchmark tests.
            No downloads or installation required.
          </p>
          <div class="footer-badges" style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem;">
            <span class="badge" style="background:rgba(16,185,129,0.1); color:var(--accent-emerald); border:1px solid rgba(16,185,129,0.2); font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">100% Client-Side</span>
            <span class="badge" style="background:rgba(6,182,212,0.1); color:var(--accent-cyan); border:1px solid rgba(6,182,212,0.2); font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">No Log Tracking</span>
            <span class="badge" style="background:rgba(249,115,22,0.1); color:var(--accent-primary); border:1px solid rgba(249,115,22,0.2); font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">MIT License</span>
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-title">🧠 Cognitive Benchmarks</div>
          <ul class="footer-links">
            <li><a href="/tools/reaction-time-test/">Reaction Time Test</a></li>
            <li><a href="/tools/sequence-memory-test/">Sequence Memory Test</a></li>
            <li><a href="/tools/aim-trainer/">Aim Trainer</a></li>
            <li><a href="/tools/number-memory-test/">Number Memory Test</a></li>
            <li><a href="/tools/verbal-memory-test/">Verbal Memory Test</a></li>
            <li><a href="/tools/chimp-test/">Chimp Test</a></li>
            <li><a href="/tools/visual-memory-test/">Visual Memory Test</a></li>
            <li><a href="/tools/typing-test/">Typing Speed Test (WPM)</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <div class="footer-title">🖱️ Hardware & Speed Tests</div>
          <ul class="footer-links">
            <li><a href="/tools/keyboard-test/">Keyboard Key Tester</a></li>
            <li><a href="/tools/mouse-test/">Mouse Hardware Tester</a></li>
            <li><a href="/tools/double-click-test/">Double Click Tester</a></li>
            <li><a href="/tools/cps-test/">CPS Speed Test</a></li>
            <li><a href="/tools/click-speed-test/">Click Speed Test</a></li>
            <li><a href="/tools/click-counter/">Click Counter</a></li>
            <li><a href="/tools/auto-clicker/">Online Auto Clicker</a></li>
            <li><a href="/games/mini-golf/">Cat Mini Golf</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <div class="footer-title">🐾 Platform & Trust</div>
          <ul class="footer-links">
            <li><a href="/about/">About CatKeyLab & Dylan</a></li>
            <li><a href="/faq/">Frequently Asked Questions</a></li>
            <li><a href="/leaderboards/">Anonymous Global Leaderboards</a></li>
            <li><a href="/privacy/">Privacy Policy</a></li>
            <li><a href="/terms/">Terms of Service</a></li>
            <li><a href="/contact/">Contact & Feedback</a></li>
            <li><a href="/sitemap/">Sitemap & Tools Directory</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div class="copyright">
            © 2026 CatKeyLab. Open source under the MIT License. Built with ❤️ for keyboard & hardware enthusiasts.
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            Inspired by Nibbles 🐱 the Ginger Tabby Cat.
          </div>
        </div>
      </div>
    </footer>
"""

def render_html_page(title, description, canonical_path, breadcrumbs_html, content_html, tool_key="", schemas=None):
    canonical_url = f"{BASE_URL}{canonical_path}"
    json_ld_scripts = ""
    if schemas:
        for s in schemas:
            json_ld_scripts += f'\n  <script type="application/ld+json">\n{json.dumps(s, indent=2)}\n  </script>'

    hreflang_html = ""
    if canonical_path == "/":
        hreflang_html = """
  <link rel="alternate" hreflang="x-default" href="https://catkeylab.com/">
  <link rel="alternate" hreflang="en" href="https://catkeylab.com/?lang=en">
  <link rel="alternate" hreflang="es" href="https://catkeylab.com/?lang=es">
  <link rel="alternate" hreflang="fr" href="https://catkeylab.com/?lang=fr">
  <link rel="alternate" hreflang="de" href="https://catkeylab.com/?lang=de">
  <link rel="alternate" hreflang="pt" href="https://catkeylab.com/?lang=pt">
  <link rel="alternate" hreflang="it" href="https://catkeylab.com/?lang=it">
  <link rel="alternate" hreflang="nl" href="https://catkeylab.com/?lang=nl">
  <link rel="alternate" hreflang="pl" href="https://catkeylab.com/?lang=pl">
  <link rel="alternate" hreflang="tr" href="https://catkeylab.com/?lang=tr">
  <link rel="alternate" hreflang="ru" href="https://catkeylab.com/?lang=ru">
  <link rel="alternate" hreflang="ja" href="https://catkeylab.com/?lang=ja">
  <link rel="alternate" hreflang="ko" href="https://catkeylab.com/?lang=ko">
  <link rel="alternate" hreflang="zh" href="https://catkeylab.com/?lang=zh">"""

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(description)}">
  
  <!-- Favicon Icons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="alternate icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <meta name="theme-color" content="#10b981">

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8935268300975005" crossorigin="anonymous"></script>

  <!-- Canonical & hreflang Tags -->
  <link rel="canonical" href="{canonical_url}">{hreflang_html}

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(description)}">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escape(title)}">
  <meta name="twitter:description" content="{escape(description)}">

  <!-- Google Fonts & Stylesheets -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/mascot.css">
{json_ld_scripts}
</head>
<body{f' data-tool-key="{tool_key}"' if tool_key else ''}>
  <!-- Sylva 3D Hero Background -->
  <canvas id="sylva-canvas"></canvas>

  <!-- Site Header Container -->
  <div id="app-header">
{STATIC_HEADER_HTML}
  </div>

  <!-- Main App Body -->
  <main id="main-app">
    <div class="container" id="breadcrumbs-container" style="padding-top:1rem;">
      {breadcrumbs_html}
    </div>
    <div id="main-content">
      {content_html}
    </div>
  </main>

  <!-- Interactive Mascot Widget -->
  <div id="eye-mascot-container"></div>

  <!-- Site Footer Container -->
  <div id="app-footer">
{STATIC_FOOTER_HTML}
  </div>

  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <!-- Entry Script -->
  <script type="module" src="/js/app.js"></script>
</body>
</html>
"""

def generate_tool_page(tool_key, tool_meta, tool_route):
    content = tool_meta.get('content', {})
    tool_title = tool_route.get('displayName', tool_key.replace('-', ' ').title())
    icon = tool_meta.get('icon', '⚡')
    desc = tool_meta.get('desc', '')
    canonical_path = tool_route['path']
    category_name = tool_route['categoryName']
    category_path = '/games/mini-golf/' if tool_route['category'] == 'games' else '/tools/'

    page_title = f"{tool_title} {icon} - Free Online Hardware Test & Benchmark | CatKeyLab 🐾"

    # Breadcrumbs HTML
    breadcrumbs_html = f"""
    <nav class="breadcrumbs" aria-label="Breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="/" itemprop="item"><span itemprop="name">Home</span></a>
        <meta itemprop="position" content="1" />
      </span>
      <span class="separator">/</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a href="{category_path}" itemprop="item"><span itemprop="name">{category_name}</span></a>
        <meta itemprop="position" content="2" />
      </span>
      <span class="separator">/</span>
      <span itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span style="color:var(--text-primary); font-weight:600;" itemprop="name">{tool_title}</span>
        <meta itemprop="position" content="3" />
      </span>
    </nav>
    """

    # Related tools HTML
    related_links_html = ""
    related_tools = content.get('relatedTools', [])
    if related_tools:
        links = []
        for r_key in related_tools:
            if r_key in TOOL_ROUTES:
                r_route = TOOL_ROUTES[r_key]
                r_title = r_route['displayName']
                links.append(f'<a href="{r_route["path"]}" class="related-tool-link">{r_title}</a>')
        if links:
            related_links_html = f"""
            <div class="info-section">
              <h3>Related Tools & Benchmarks</h3>
              <div class="related-tools-grid">{' '.join(links)}</div>
            </div>
            """

    # How to list
    how_to_html = ""
    if content.get('howTo'):
        steps = "".join(f"<li>{escape(step)}</li>" for step in content['howTo'])
        how_to_html = f"""
        <div class="info-section">
          <h2>How to Use {escape(tool_title)}</h2>
          <ol class="info-steps">{steps}</ol>
        </div>
        """

    # Measures
    measures_html = ""
    if content.get('whatItMeasures'):
        measures_html = f"""
        <div class="info-section">
          <h2>What This Test Measures</h2>
          <p>{escape(content['whatItMeasures'])}</p>
        </div>
        """

    # Why use it
    why_html = ""
    if content.get('whyUseIt'):
        why_html = f"""
        <div class="info-section">
          <h2>Why Use This Test</h2>
          <p>{escape(content['whyUseIt'])}</p>
        </div>
        """

    # Results
    results_html = ""
    if content.get('interpretResults'):
        results_html = f"""
        <div class="info-section">
          <h2>How to Interpret Your Results</h2>
          <p>{escape(content['interpretResults'])}</p>
        </div>
        """

    # Tips
    tips_html = ""
    if content.get('tips'):
        tips_items = "".join(f"<li>{escape(tip)}</li>" for tip in content['tips'])
        tips_html = f"""
        <div class="info-section">
          <h2>Tips for Accurate Results</h2>
          <ul>{tips_items}</ul>
        </div>
        """

    # FAQ HTML
    faq_items = tool_meta.get('faqs', [])
    faq_html = ""
    faq_schema_items = []
    if faq_items:
        faq_cards = []
        for faq in faq_items:
            q = faq.get('q', '')
            a = faq.get('a', '')
            faq_schema_items.append({
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": a
                }
            })
            faq_cards.append(f"""
              <div class="faq-item" style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1rem;">
                <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:0.5rem;">{escape(q)}</h3>
                <p style="color:var(--text-secondary); line-height:1.6;">{a}</p>
              </div>
            """)
        faq_html = f"""
        <div id="tool-faq-container" style="margin-top: 2rem;">
          <h2 style="font-size:1.75rem; font-weight:800; margin-bottom:1.5rem; text-align:center;">Frequently Asked Questions</h2>
          <div class="faq-list" style="max-width:900px; margin:0 auto;">
            {''.join(faq_cards)}
          </div>
        </div>
        """

    # Content HTML
    content_html = f"""
    <div class="container" style="padding-top:1.5rem;">
      <div class="tool-page-layout">
        <!-- Main Column (Tool) -->
        <div class="tool-page-main">
          <!-- Tool Title & Introduction -->
          <div style="margin-bottom:1.5rem;">
            <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
              <span>{icon}</span> <span>{escape(tool_title)}</span>
            </h1>
            {f'<p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">{escape(content.get("intro", desc))}</p>' if content.get("intro") or desc else ''}
          </div>

          <!-- Interactive Tool Widget -->
          <div id="tool-render-box">
            <div style="min-height:360px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg-secondary); border:2px dashed var(--border-color); border-radius:var(--radius-lg); padding:2rem; text-align:center;">
              <div style="font-size:3rem; margin-bottom:1rem;">{icon}</div>
              <h2 style="font-size:1.5rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">{escape(tool_title)}</h2>
              <p style="color:var(--text-secondary); max-width:480px; margin-bottom:1.5rem;">{escape(desc)}</p>
              <button class="btn btn-primary btn-lg" onclick="window.location.reload()">
                <span>⚡ Launch {escape(tool_title)}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Sidebar Column (Informational Only - Ads safely separated below) -->
        <div class="tool-page-sidebar">
          <div class="tool-content-section">
            {how_to_html}
            {measures_html}
            {why_html}
            {results_html}
            {tips_html}
            {related_links_html}
          </div>
        </div>
      </div>
      
      <!-- Safe Ad Space BELOW the tool and guide with strict buffer margins -->
      {render_ad_slot()}

      <!-- Full Width FAQ Section -->
      {faq_html}
    </div>
    """

    # Schemas
    schemas = [
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": f"{tool_title} - CatKeyLab",
            "url": f"{BASE_URL}{canonical_path}",
            "description": desc,
            "operatingSystem": "All",
            "applicationCategory": "BrowserApplication",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": f"{BASE_URL}/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": category_name,
                    "item": f"{BASE_URL}{category_path}"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": tool_title,
                    "item": f"{BASE_URL}{canonical_path}"
                }
            ]
        }
    ]

    if faq_schema_items:
        schemas.append({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faq_schema_items
        })

    return render_html_page(page_title, desc, canonical_path, breadcrumbs_html, content_html, tool_key=tool_key, schemas=schemas)

def generate_home_page(tool_metadata):
    home_title = "CatKeyLab 🐾 - Free Online Keyboard, Mouse & Typing Tests"
    home_desc = "Free browser-based tools to test keyboards, mice, typing speed, clicking performance, reaction time, and memory. No downloads or installation required. Works on all devices."

    default_popular = ['typing-test', 'mouse-test', 'keyboard-test', 'reaction-time-test']
    all_keys = list(TOOL_ROUTES.keys())
    all_keys.sort(key=lambda k: 0 if k in default_popular else 1)

    cards_html = []
    for key in all_keys:
        route = TOOL_ROUTES[key]
        meta = tool_metadata.get(key, {})
        icon = meta.get('icon', '⚡')
        display_name = route['displayName']
        desc = meta.get('desc', '')
        is_pop = key in default_popular
        badge_text = "🔥 TOP SEARCHED" if is_pop else route['categoryName'].upper()
        badge_style = "background:rgba(6,182,212,0.2); color:var(--accent-cyan); font-weight:700;" if is_pop else ""
        card_style = "border:1px solid var(--accent-cyan-glow); background:linear-gradient(180deg, rgba(6,182,212,0.08), var(--bg-card));" if is_pop else ""
        
        cards_html.append(f"""
            <div class="tool-card {'featured-tool-card' if is_pop else ''}" style="{card_style}">
              <div>
                <div class="tool-card-header">
                  <div class="tool-card-icon" style="font-size:2rem;">{icon}</div>
                  <span class="tool-card-badge" style="{badge_style}">{badge_text}</span>
                </div>
                <h3 class="tool-card-title">{escape(display_name)}</h3>
                <p class="tool-card-desc">{escape(desc)}</p>
              </div>
              <div class="tool-card-footer">
                <a href="{route['path']}" class="btn {'btn-primary' if is_pop else 'btn-secondary'} btn-sm" style="width:100%;">
                  <span>Launch Tool {icon}</span> →
                </a>
              </div>
            </div>""")

    home_body = f"""
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge" style="background:linear-gradient(90deg, rgba(16,185,129,0.18), rgba(249,115,22,0.18)); border-color:rgba(16,185,129,0.35); color:var(--accent-emerald);">
          🐾 CatKeyLab • Free Browser-Based Input Testing & Benchmarks
        </div>
        <h1 class="hero-title">
          <span>Free Online Keyboard, Mouse &amp; <span style="white-space: nowrap;">Typing Tests 🐾</span></span>
        </h1>
        <p class="hero-subtitle">
          CatKeyLab provides free browser-based tools for testing keyboards, mice, typing speed, clicking performance, reaction time, memory, and other computer-input functions. No downloads, no accounts: just open and test.
        </p>
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
        <div id="diagnostic-wizard-container"></div>
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
          {''.join(cards_html)}
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

    {render_ad_slot()}

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

    <!-- FAQ Section -->
    <section class="section">
      <div class="container">
        <div class="tool-wrapper" style="max-width:850px; margin:0 auto;">
          <h2 style="font-size:2rem; font-weight:800; margin-bottom:1.5rem; text-align:center;">Frequently Asked Questions (FAQ)</h2>
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md);">
              <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">Is CatKeyLab completely free to use?</h3>
              <p style="color:var(--text-secondary); line-height:1.6;">Yes, 100% free with no subscriptions, accounts, or software downloads required.</p>
            </div>
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md);">
              <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">Does CatKeyLab record my keystrokes or mouse clicks?</h3>
              <p style="color:var(--text-secondary); line-height:1.6;">No. All input events are processed entirely inside your local browser sandbox and are never transmitted to any external server.</p>
            </div>
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md);">
              <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">How do I test if my mouse is double-clicking accidentally?</h3>
              <p style="color:var(--text-secondary); line-height:1.6;">Use the Double Click Tester. It measures millisecond intervals between consecutive clicks; switches releasing bounce signals below 80ms are flagged as switch chatter.</p>
            </div>
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md);">
              <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">What is a good typing speed (WPM)?</h3>
              <p style="color:var(--text-secondary); line-height:1.6;">The global average typing speed is roughly 40 WPM. Speeds between 60-80 WPM are considered fast, and 90+ WPM places you in the top 5% of typists.</p>
            </div>
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md);">
              <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">What is the average human reaction time?</h3>
              <p style="color:var(--text-secondary); line-height:1.6;">The median human reaction time for visual stimuli is approximately 250 milliseconds. Dedicated gamers typically score between 180ms and 220ms.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    """

    home_schemas = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CatKeyLab",
            "url": "https://catkeylab.com/",
            "description": home_desc,
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://catkeylab.com/tools/?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CatKeyLab",
            "url": "https://catkeylab.com/",
            "logo": "https://catkeylab.com/assets/favicon.svg"
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Is CatKeyLab completely free to use?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, 100% free with no subscriptions, accounts, or software downloads required."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Does CatKeyLab record my keystrokes or mouse clicks?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "No. All input events are processed entirely inside your local browser sandbox and are never transmitted to any external server."
                    }
                },
                {
                    "@type": "Question",
                    "name": "How do I test if my mouse is double-clicking accidentally?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Use the Double Click Tester. It measures millisecond intervals between consecutive clicks; switches releasing bounce signals below 80ms are flagged as switch chatter."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is a good typing speed (WPM)?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The global average typing speed is roughly 40 WPM. Speeds between 60-80 WPM are considered fast, and 90+ WPM places you in the top 5% of typists."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the average human reaction time?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The median human reaction time for visual stimuli is approximately 250 milliseconds. Dedicated gamers typically score between 180ms and 220ms."
                    }
                }
            ]
        }
    ]

    home_html = render_html_page(home_title, home_desc, "/", "", home_body, tool_key="", schemas=home_schemas)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(home_html)
    print("✅ Generated root home page: index.html (/)")

def main():
    print("🐾 Starting CatKeyLab Static Site Generation...")
    tool_metadata = load_tool_metadata()
    print(f"Loaded {len(tool_metadata)} tools successfully from toolMetadata.js.")

    generated_paths = []

    # 1. Generate Tool Pages
    for tool_key, tool_route in TOOL_ROUTES.items():
        if tool_key in tool_metadata:
            meta = tool_metadata[tool_key]
            html = generate_tool_page(tool_key, meta, tool_route)
            
            # Directory path relative to root
            rel_dir = tool_route['path'].strip('/')
            os.makedirs(rel_dir, exist_ok=True)
            out_file = os.path.join(rel_dir, 'index.html')
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write(html)
            generated_paths.append(tool_route['path'])
            print(f"✅ Generated: {out_file} ({tool_route['path']})")

            # Check aliases (e.g. tools/aim-trainer-test/)
            for alias in tool_route.get('aliases', []):
                alias_clean = alias.strip('/')
                alias_dir = f"tools/{alias_clean}" if tool_route['category'] != 'games' else f"games/{alias_clean}"
                if alias_dir != rel_dir and not os.path.exists(os.path.join(alias_dir, 'index.html')):
                    os.makedirs(alias_dir, exist_ok=True)
                    alias_file = os.path.join(alias_dir, 'index.html')
                    with open(alias_file, 'w', encoding='utf-8') as f:
                        f.write(html)
                    print(f"   ↳ Alias generated: {alias_file}")

    # 2. Rich Pre-rendered Platform Pages
    # About Page
    about_body = """
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.5rem;">About CatKeyLab 🐾</h1>
        <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
          Free, Private & Powerful Online Hardware Testing Suite & Typing Speed Challenge
        </p>

        <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
          <!-- Creator Callout Card -->
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.25rem;">🎮 Created by Dylan</h3>
              <p style="color:var(--text-secondary);">CatKeyLab is crafted by Dylan. Check out games, utilities, and interactive creations on itch.io!</p>
              <p style="margin-top:0.5rem;"><a href="/about/" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat & See His Real-Life Photo →</a></p>
            </div>
            <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:linear-gradient(135deg, #f97316, #ea580c); border:none; font-weight:700;">
              <span>Visit Dylan on itch.io</span> ↗
            </a>
          </div>

          <!-- Featured Cat Card -->
          <div style="background:linear-gradient(135deg, rgba(249,115,22,0.16), rgba(16,185,129,0.16)); border:2px solid #f97316; padding:2rem; border-radius:var(--radius-lg); display:flex; align-items:center; gap:2rem; flex-wrap:wrap; box-shadow:0 10px 30px rgba(0,0,0,0.35); margin-bottom:1rem;">
            <img src="/assets/orange-cat.jpg" alt="Real Orange Cat in Box - Inspiration for Nibbles" style="width:340px; max-width:100%; height:340px; object-fit:cover; border-radius:var(--radius-lg); border:4px solid #fb923c; box-shadow:0 12px 30px rgba(249,115,22,0.45); flex-shrink:0; margin:0 auto;" />
            <div style="flex:1; min-width:260px;">
              <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
                Meet Nibbles in Real Life! 🐱
              </h2>
              <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">
                This adorable orange cat sitting in a cardboard box is the real-life inspiration behind <strong>Nibbles</strong>! Created by <strong>Dylan</strong>, Nibbles lives on CatKeyLab to keep you company while you test hardware, practice typing, and play companion arcade games!
              </p>
            </div>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">📖 Platform Overview</h3>
            <p>
              <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>) is a lightweight, high-performance web application built for testing mouse hardware, keyboard switches, WPM typing speed, click velocity, and reaction latency directly inside your web browser.
            </p>
            <p style="margin-top:0.75rem;">
              Unlike bloated desktop software, CatKeyLab operates <strong>100% client-side</strong>, requiring <strong>zero downloads, zero plugins, zero accounts, and zero tracking</strong>. All hardware test measurements, typing accuracy calculations, and high score benchmarks process locally in your browser sandbox to guarantee absolute privacy and instant performance.
            </p>
          </div>
        </div>
        """ + render_ad_slot() + """
      </div>
    </div>
    """

    # FAQ Page
    faq_body = """
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.75rem;">
          ❓ Frequently Asked Questions
        </h1>
        <p class="hero-subtitle" style="margin-bottom:2rem; color:var(--text-secondary); font-size:1.1rem; line-height:1.7;">
          Everything you need to know about testing keyboards, diagnosing mouse button issues, measuring typing speed, and understanding human cognitive benchmarks on CatKeyLab.
        </p>

        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">How do I test if a keyboard key is broken or unresponsive?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">Open the <a href="/tools/keyboard-test/" style="color:var(--accent-cyan);">Keyboard Tester</a>, click inside the test area, and press each key on your physical keyboard. Every key that registers correctly will light up on the visual layout and record its keycode in the event log. If a key fails to highlight, it is not registering with the browser, which indicates a faulty switch, debris under the keycap, or a broken circuit board trace.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">What is keyboard ghosting and key rollover (NKRO)?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">Keyboard ghosting occurs when pressing multiple keys simultaneously causes some keystrokes to fail or registers unpressed keys. "NKRO" (N-Key Rollover) means your keyboard can accurately register as many keys as you press at once without limitation. You can test your keyboard rollover capability using the <a href="/tools/keyboard-test/" style="color:var(--accent-cyan);">Keyboard Tester</a> by holding down multiple keys simultaneously.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">How do I detect mouse double-clicking issues (switch chatter)?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">Use our <a href="/tools/double-click-test/" style="color:var(--accent-cyan);">Double Click Tester</a>. Click once firmly inside the test zone. If the tool registers two clicks with an interval under 40 milliseconds when you only clicked once, your mouse switch is "chattering": a common mechanical failure where worn micro-switch contacts bounce involuntarily.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">How is typing speed (WPM) calculated?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">Words Per Minute (WPM) is standardized as <code>(Characters Typed ÷ 5) ÷ Minutes Elapsed</code>. Any 5 keystrokes (including spaces and punctuation) count as one standardized "word". Accuracy is calculated as the percentage of correct characters out of total characters typed. Test yours on the <a href="/tools/typing-test/" style="color:var(--accent-cyan);">Typing Speed Test</a>.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">What is the average human visual reaction time?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">The average visual reaction time for healthy adults is between 200ms and 250ms. Gamers and athletes often reach 150ms–190ms. Display latency, monitor refresh rate (60Hz vs 144Hz+), and mouse polling rate also affect measured times by several milliseconds. Measure yours with our <a href="/tools/reaction-time-test/" style="color:var(--accent-cyan);">Reaction Time Test</a>.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">What is a good CPS (Clicks Per Second) score?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">Standard regular clicking with one finger averages 6 to 8 CPS. Gamers practicing butterfly clicking or jitter clicking routinely achieve 10 to 14+ CPS. Specialized techniques like drag clicking on textured mouse switches can reach 20+ CPS. Test your click rate on the <a href="/tools/cps-test/" style="color:var(--accent-cyan);">CPS Test</a>.</p>
          </div>
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.5rem;">
            <h3 style="font-size:1.2rem; color:var(--text-primary); margin-bottom:0.5rem;">Does CatKeyLab collect or transmit my keystrokes or mouse clicks?</h3>
            <p style="color:var(--text-secondary); line-height:1.7;">No. CatKeyLab operates 100% client-side inside your browser sandbox. Your typing text, mouse coordinates, and test scores are processed locally on your device. We do not store, track, or transmit your private hardware logs.</p>
          </div>
        </div>
        """ + render_ad_slot() + """
      </div>
    </div>
    """

    # Privacy Policy Page
    privacy_body = """
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:1rem;">Privacy Policy</h1>
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
      </div>
    </div>
    """

    # Terms of Service Page
    terms_body = """
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:1rem;">Terms of Service</h1>
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
            <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">3. Open Source & MIT License</h3>
            <p>CatKeyLab is licensed under the <strong>MIT License</strong>. You are free to use, modify, and distribute the project for personal or commercial applications under the terms of the MIT open-source license.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">4. Disclaimer of Warranty</h3>
            <p>All utilities are provided "AS IS", without warranty of any kind, express or implied. Hardware measurements depend on device hardware, operating system drivers, and browser performance.</p>
          </div>
        </div>
      </div>
    </div>
    """

    # Contact Page
    contact_body = """
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
    """

    # Tools Directory Page
    tools_cards = []
    for k, r in TOOL_ROUTES.items():
        meta = tool_metadata.get(k, {})
        tools_cards.append(f"""
          <div class="tool-card" style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-size:2rem; margin-bottom:0.5rem;">{meta.get('icon', '⚡')}</div>
              <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">{escape(r['displayName'])}</h3>
              <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.6; margin-bottom:1.5rem;">{escape(meta.get('desc', ''))}</p>
            </div>
            <a href="{r['path']}" class="btn btn-primary btn-sm" style="width:100%; text-align:center;">
              <span>Use {escape(r['displayName'])}</span> →
            </a>
          </div>
        """)

    tools_body = f"""
    <div class="container section">
      <div class="section-header" style="text-align:center; margin-bottom:2.5rem;">
        <h1 class="section-title">All Tools & Benchmarks Directory</h1>
        <p class="section-subtitle" style="max-width:700px; margin:0.5rem auto 0; color:var(--text-secondary);">Browse our complete suite of 20 online hardware testing tools, cognitive human benchmarks, and companion arcade games.</p>
      </div>

      <div class="grid grid-cols-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        {''.join(tools_cards)}
      </div>
      {render_ad_slot()}
    </div>
    """

    # Sitemap Directory Page
    sitemap_list_items = []
    for k, r in TOOL_ROUTES.items():
        meta = tool_metadata.get(k, {})
        sitemap_list_items.append(f'<li><a href="{r["path"]}" style="color:var(--accent-cyan); font-weight:600;">{meta.get("icon", "⚡")} {escape(r["displayName"])}</a> - <span style="color:var(--text-muted);">{escape(meta.get("desc", ""))}</span></li>')

    sitemap_body = f"""
    <div class="container section">
      <div class="tool-wrapper" style="max-width:960px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.5rem;">Sitemap & Tools Directory</h1>
        <p class="hero-subtitle" style="margin-bottom:2rem; color:var(--text-secondary);">Complete directory and URL index of all testing utilities, games, and platform policies on CatKeyLab.</p>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:2rem; border-radius:var(--radius-lg);">
          <h2 style="font-size:1.4rem; color:var(--text-primary); margin-bottom:1rem;">🛠️ Hardware Testing & Benchmark Tools</h2>
          <ul style="line-height:2.2; margin-left:1.5rem;">
            {''.join(sitemap_list_items)}
          </ul>

          <h2 style="font-size:1.4rem; color:var(--text-primary); margin-top:2rem; margin-bottom:1rem;">📄 Platform Policies & Information</h2>
          <ul style="line-height:2.2; margin-left:1.5rem;">
            <li><a href="/about/" style="color:var(--accent-cyan); font-weight:600;">About CatKeyLab & Creator Dylan</a></li>
            <li><a href="/faq/" style="color:var(--accent-cyan); font-weight:600;">Frequently Asked Questions</a></li>
            <li><a href="/privacy/" style="color:var(--accent-cyan); font-weight:600;">Privacy Policy</a></li>
            <li><a href="/terms/" style="color:var(--accent-cyan); font-weight:600;">Terms of Service</a></li>
            <li><a href="/contact/" style="color:var(--accent-cyan); font-weight:600;">Contact & Support</a></li>
            <li><a href="/leaderboards/" style="color:var(--accent-cyan); font-weight:600;">Anonymous Global Leaderboards</a></li>
          </ul>
        </div>
      </div>
    </div>
    """

    platform_pages = {
        'about': {
            'path': '/about/',
            'title': 'About CatKeyLab & Creator Dylan - Free Online Hardware Testing',
            'desc': 'Learn about CatKeyLab, created by Dylan. 100% free, client-side, browser-native hardware testers, Human Benchmarks, and Nibbles the real orange cat companion.',
            'crumb': 'About',
            'body': about_body
        },
        'faq': {
            'path': '/faq/',
            'title': 'Frequently Asked Questions - CatKeyLab 🐾 Hardware Testing FAQ',
            'desc': 'Common questions and answers regarding keyboard switch testing, mouse button chatter diagnostics, WPM typing speed calculations, and reaction benchmarks.',
            'crumb': 'FAQ',
            'body': faq_body
        },
        'privacy': {
            'path': '/privacy/',
            'title': 'Privacy Policy - 100% Client-Side Processing - CatKeyLab 🛡️',
            'desc': 'CatKeyLab guarantees 100% client-side execution. Zero keystrokes, mouse events, or hardware test logs are collected or sent to any server.',
            'crumb': 'Privacy Policy',
            'body': privacy_body
        },
        'terms': {
            'path': '/terms/',
            'title': 'Terms of Service - MIT Open Source Utilities - CatKeyLab 📄',
            'desc': 'Terms of service and MIT open-source licensing agreement for CatKeyLab free browser-based testing tools and companion arcade games.',
            'crumb': 'Terms of Service',
            'body': terms_body
        },
        'contact': {
            'path': '/contact/',
            'title': 'Contact & Support - Dylan @ CatKeyLab 📬',
            'desc': 'Get in touch with creator Dylan for questions, tool requests, hardware diagnostic suggestions, or support for CatKeyLab.',
            'crumb': 'Contact & Support',
            'body': contact_body
        },
        'sitemap': {
            'path': '/sitemap/',
            'title': 'Sitemap & Tools Directory - CatKeyLab Index 🗺️',
            'desc': 'Complete directory and index of all 20 online hardware testing tools, Human Benchmark cognitive tests, and companion games on CatKeyLab.',
            'crumb': 'Sitemap & Index',
            'body': sitemap_body
        },
        'tools': {
            'path': '/tools/',
            'title': 'All Tools & Benchmarks Directory - CatKeyLab 📂',
            'desc': 'Browse all free online keyboard switch testers, mouse button testers, typing speed tests, clicking speed tests, and memory benchmark utilities.',
            'crumb': 'All Tools',
            'body': tools_body
        },
        'leaderboards': {
            'path': '/leaderboards/',
            'title': 'Anonymous Global Leaderboards - CatKeyLab 🏆',
            'desc': '100% private, anonymous high scores and rank percentiles across all CatKeyLab human benchmark tests with live real-time updates.',
            'crumb': 'Anonymous Leaderboards',
            'body': tools_body  # Will hydrate with leaderboard table
        }
    }

    # Generate Platform Pages
    for p_key, p_info in platform_pages.items():
        crumb = p_info['crumb']
        b_html = f"""
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span class="separator">/</span>
          <span style="color:var(--text-primary); font-weight:600;">{crumb}</span>
        </nav>
        """

        html = render_html_page(p_info['title'], p_info['desc'], p_info['path'], b_html, p_info['body'])
        rel_dir = p_info['path'].strip('/')
        os.makedirs(rel_dir, exist_ok=True)
        out_file = os.path.join(rel_dir, 'index.html')
        with open(out_file, 'w', encoding='utf-8') as f:
            f.write(html)
        generated_paths.append(p_info['path'])
        print(f"✅ Generated platform page: {out_file} ({p_info['path']})")

    # 3. Generate Pre-rendered Root Home Page (index.html)
    generate_home_page(tool_metadata)

    # 4. Generate sitemap.xml with 100% canonical URLs (0 hashes)
    print("\n🗺️ Generating sitemap.xml...")
    sitemap_entries = [f"""  <url>
    <loc>{BASE_URL}/</loc>
    <lastmod>2026-09-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>"""]

    for path in sorted(generated_paths):
        priority = "0.9" if path.startswith("/tools/") or path.startswith("/games/") else "0.7"
        sitemap_entries.append(f"""  <url>
    <loc>{BASE_URL}{path}</loc>
    <lastmod>2026-09-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>""")

    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{'\n'.join(sitemap_entries)}
</urlset>
"""
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)
    print(f"✅ sitemap.xml successfully generated with {len(sitemap_entries)} canonical URLs!")

    print("\n🎉 Static site generation complete!")

if __name__ == '__main__':
    main()
