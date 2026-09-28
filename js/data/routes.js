/* ==========================================================================
   CatKeyLab - Central URL & Canonical Route Mapping
   ========================================================================== */

export const BASE_URL = 'https://catkeylab.com';

export const TOOL_ROUTES = {
  // Human Benchmarks & Cognitive Tests (tools/)
  'reaction-time-test': {
    path: '/tools/reaction-time-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Reaction Time Test',
    aliases: ['reaction-time-test', 'reaction-test', 'reaction-time']
  },
  'sequence-memory-test': {
    path: '/tools/sequence-memory-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Sequence Memory Test',
    aliases: ['sequence-memory-test', 'sequence-memory']
  },
  'aim-trainer-test': {
    path: '/tools/aim-trainer/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Aim Trainer',
    aliases: ['aim-trainer', 'aim-trainer-test', 'aim-test']
  },
  'number-memory-test': {
    path: '/tools/number-memory-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Number Memory Test',
    aliases: ['number-memory-test', 'number-memory']
  },
  'verbal-memory-test': {
    path: '/tools/verbal-memory-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Verbal Memory Test',
    aliases: ['verbal-memory-test', 'verbal-memory']
  },
  'chimp-test': {
    path: '/tools/chimp-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Chimp Test',
    aliases: ['chimp-test', 'chimpanzee-test']
  },
  'visual-memory-test': {
    path: '/tools/visual-memory-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Visual Memory Test',
    aliases: ['visual-memory-test', 'visual-memory']
  },
  'typing-test': {
    path: '/tools/typing-test/',
    category: 'benchmarks',
    categoryName: 'Human Benchmarks',
    displayName: 'Typing Speed Test (WPM)',
    aliases: ['typing-test', 'typing-speed-test', 'wpm-test']
  },

  // Hardware Testers (tools/)
  'mouse-test': {
    path: '/tools/mouse-test/',
    category: 'hardware',
    categoryName: 'Hardware Tests',
    displayName: 'Mouse Tester',
    aliases: ['mouse-test', 'mouse-tester']
  },
  'keyboard-test': {
    path: '/tools/keyboard-test/',
    category: 'hardware',
    categoryName: 'Hardware Tests',
    displayName: 'Keyboard Tester',
    aliases: ['keyboard-test', 'keyboard-tester']
  },
  'double-click-test': {
    path: '/tools/double-click-test/',
    category: 'hardware',
    categoryName: 'Hardware Tests',
    displayName: 'Double Click Tester',
    aliases: ['double-click-test', 'double-click', 'mouse-chatter-test']
  },

  // Speed & Clicking Utilities (tools/)
  'cps-test': {
    path: '/tools/cps-test/',
    category: 'speed',
    categoryName: 'Speed Tests',
    displayName: 'CPS Test (Clicks Per Second)',
    aliases: ['cps-test', 'clicks-per-second']
  },
  'click-speed-test': {
    path: '/tools/click-speed-test/',
    category: 'speed',
    categoryName: 'Speed Tests',
    displayName: 'Click Speed Test',
    aliases: ['click-speed-test', 'click-speed']
  },
  'click-counter': {
    path: '/tools/click-counter/',
    category: 'speed',
    categoryName: 'Speed Tests',
    displayName: 'Digital Click Counter',
    aliases: ['click-counter', 'tally-counter']
  },
  'auto-clicker': {
    path: '/tools/auto-clicker/',
    category: 'speed',
    categoryName: 'Speed Tests',
    displayName: 'Online Auto Clicker',
    aliases: ['auto-clicker', 'autoclicker']
  },

  // Companion Arcade Games (games/)
  'cat-mini-golf-game': {
    path: '/games/mini-golf/',
    category: 'games',
    categoryName: 'Arcade Games',
    displayName: 'Nibbles Mini Golf (18 Holes)',
    aliases: ['mini-golf', 'cat-mini-golf-game', 'cat-mini-golf', 'golf']
  },
  'cat-fishing-game': {
    path: '/games/fishing/',
    category: 'games',
    categoryName: 'Arcade Games',
    displayName: 'Cat Fishing Game',
    aliases: ['fishing', 'cat-fishing-game', 'cat-fishing']
  },
  'fruit-slicer-game': {
    path: '/games/fruit-slicer/',
    category: 'games',
    categoryName: 'Arcade Games',
    displayName: 'Fruit Slicer Arcade',
    aliases: ['fruit-slicer', 'fruit-slicer-game', 'fruit-slice']
  },
  'fish-maze-game': {
    path: '/games/fish-maze/',
    category: 'games',
    categoryName: 'Arcade Games',
    displayName: 'Nibbles Fish Maze',
    aliases: ['fish-maze', 'fish-maze-game', 'cat-maze']
  },
  'card-memory-game': {
    path: '/games/card-memory/',
    category: 'games',
    categoryName: 'Arcade Games',
    displayName: 'Card Memory Match (3D)',
    aliases: ['card-memory', 'card-memory-game', 'cat-card-memory']
  }
};

export const STATIC_PAGES = {
  'about': { path: '/about/', title: 'About CatKeyLab & Creator Dylan', crumb: 'About' },
  'faq': { path: '/faq/', title: 'Frequently Asked Questions - CatKeyLab', crumb: 'FAQ' },
  'privacy': { path: '/privacy/', title: 'Privacy Policy - 100% Client-Side - CatKeyLab', crumb: 'Privacy Policy' },
  'terms': { path: '/terms/', title: 'Terms of Service - CatKeyLab', crumb: 'Terms' },
  'contact': { path: '/contact/', title: 'Contact & Support - CatKeyLab', crumb: 'Contact' },
  'sitemap': { path: '/sitemap/', title: 'Sitemap & Tools Directory - CatKeyLab', crumb: 'Sitemap' },
  'tools': { path: '/tools/', title: 'Tools & Games Directory - CatKeyLab', crumb: 'All Tools' },
  'leaderboards': { path: '/leaderboards/', title: 'Anonymous Global Leaderboards - CatKeyLab', crumb: 'Leaderboards' },
  'nibbles': { path: '/nibbles/', title: 'Meet Nibbles 🐱 - The Real Orange Cat - CatKeyLab', crumb: 'Meet Nibbles' }
};

/**
 * Resolves any incoming URL path or hash into a canonical route object
 * @param {string} pathname
 * @param {string} hash
 * @returns {object} { type: 'home'|'tool'|'page', key: string, canonicalPath: string, meta?: object }
 */
export function resolveRoute(pathname = '', hash = '') {
  // 1. Clean up pathname and hash
  let cleanPath = (pathname || '').replace(/\/index\.html$/, '/').replace(/^\/|\/$/g, '').trim();
  let cleanHash = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '').trim();

  // If there is a hash, check if it maps to any known tool or page first (for backwards compatibility)
  const candidate = cleanHash || cleanPath;

  if (!candidate || candidate === '') {
    return { type: 'home', key: '', canonicalPath: '/' };
  }

  // 2. Direct match in static pages
  for (const [pageKey, pageInfo] of Object.entries(STATIC_PAGES)) {
    const pageTrim = pageInfo.path.replace(/^\/|\/$/g, '');
    if (cleanPath === pageTrim || cleanHash === pageKey || cleanPath === pageKey) {
      return {
        type: 'page',
        key: pageKey,
        canonicalPath: pageInfo.path,
        pageInfo
      };
    }
  }

  // 3. Match tool by path or aliases
  for (const [toolKey, toolRoute] of Object.entries(TOOL_ROUTES)) {
    const routeTrim = toolRoute.path.replace(/^\/|\/$/g, '');
    if (
      cleanPath === routeTrim ||
      cleanHash === toolKey ||
      cleanPath === toolKey ||
      toolRoute.aliases.includes(cleanHash) ||
      toolRoute.aliases.includes(cleanPath) ||
      cleanPath === `tools/${toolKey}` ||
      cleanPath === `games/${toolKey}` ||
      cleanPath.endsWith(`/${toolKey}`)
    ) {
      return {
        type: toolRoute.category === 'games' ? 'game' : 'tool',
        key: toolKey,
        canonicalPath: toolRoute.path,
        toolRoute
      };
    }

    // Check aliases with category prefixes (e.g. tools/aim-trainer, games/mini-golf)
    for (const alias of toolRoute.aliases) {
      if (
        cleanPath === `tools/${alias}` ||
        cleanPath === `games/${alias}` ||
        cleanHash === alias
      ) {
        return {
          type: toolRoute.category === 'games' ? 'game' : 'tool',
          key: toolKey,
          canonicalPath: toolRoute.path,
          toolRoute
        };
      }
    }
  }

  // 4. Default fallback: Home
  return { type: 'home', key: '', canonicalPath: '/' };
}
