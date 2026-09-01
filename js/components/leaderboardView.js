/* ==========================================================================
   CatKeyLab - Global Anonymous Leaderboard View Component
   ========================================================================== */

import { t } from '../i18n.js';
import { getAnonProfile, randomizeAnonHandle, cycleAnonAvatar, getLeaderboard, setLeaderboardUpdateCallback, fetchGlobalLeaderboards } from '../leaderboard.js';
import { handleRoute } from '../router.js';

let activeTestId = 'reaction-time-test';

const TEST_TABS = [
  { id: 'reaction-time-test', label: '⏱️ Reaction Time' },
  { id: 'sequence-memory-test', label: '🧠 Sequence Memory' },
  { id: 'aim-trainer-test', label: '🎯 Aim Trainer' },
  { id: 'number-memory-test', label: '🔢 Number Memory' },
  { id: 'verbal-memory-test', label: '💬 Verbal Memory' },
  { id: 'chimp-test', label: '🐒 Chimp Test' },
  { id: 'visual-memory-test', label: '🔳 Visual Memory' },
  { id: 'typing-test', label: '⌨️ Typing Speed' },
  { id: 'cps-test', label: '⚡ CPS Test' },
  { id: 'fish-maze-game', label: '🐟 Fish Maze' },
  { id: 'card-memory-game', label: '🎴 Card Memory' },
  { id: 'cat-fishing-game', label: '🎣 Cat Fishing' },
  { id: 'cat-mini-golf-game-3', label: '⛳ Mini Golf (3 Holes)' },
  { id: 'cat-mini-golf-game-9', label: '⛳ Mini Golf (9 Holes)' },
  { id: 'cat-mini-golf-game-18', label: '🏆 Mini Golf (18 Holes)' }
];

export function renderLeaderboardView(container) {
  const profile = getAnonProfile();

  // Open directly to the last played test tab
  const lastTest = localStorage.getItem('catkeylab_last_active_test');
  if (lastTest && TEST_TABS.some(t => t.id === lastTest)) {
    activeTestId = lastTest;
  }

  const currentTab = TEST_TABS.find(t => t.id === activeTestId) || TEST_TABS[0];

  container.innerHTML = `
    <div class="container section" style="padding-top:1.5rem;">
      <div class="section-header">
        <h1 class="section-title">
          <span style="font-size:2.2rem;">🏆</span>
          <span>Anonymous Global Leaderboards</span>
        </h1>
        <p class="section-subtitle">
          100% private, anonymous high scores across all CatKeyLab human benchmark games & speed tools.
        </p>
      </div>

      <!-- Anonymous User Handle Profile Bar -->
      <div class="lb-profile-card">
        <div class="lb-profile-info">
          <button id="lb-avatar-btn" class="lb-avatar lb-avatar-clickable" title="Click to cycle avatar emoji!">
            <span id="lb-avatar-icon">${profile.avatar}</span>
          </button>
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; letter-spacing:0.05em;">YOUR ANONYMOUS ALIAS (CLICK EMOJI TO CHANGE)</div>
            <div id="lb-handle-text" class="lb-handle-title">${profile.handle}</div>
          </div>
        </div>
        <div class="lb-profile-actions">
          <button id="lb-sync-cloud-btn" class="btn btn-secondary btn-sm">🔄 Refresh Live Scores</button>
          <button id="lb-cycle-emoji-btn" class="btn btn-secondary btn-sm">🎭 Cycle Emoji</button>
          <button id="lb-randomize-btn" class="btn btn-primary btn-sm">🎲 Randomize Name & Emoji</button>
        </div>
      </div>

      <!-- Test Navigation Tabs -->
      <div class="lb-tabs-container">
        ${TEST_TABS.map(tab => `
          <button class="lb-tab-btn ${tab.id === activeTestId ? 'active' : ''}" data-tab="${tab.id}">
            ${tab.label}
          </button>
        `).join('')}
      </div>

      <!-- Header Bar with Direct Play Button -->
      <div class="lb-table-container">
        <div class="lb-header-bar" style="display:flex; justify-space-between; align-items:center; padding:1rem 1.25rem; background:var(--bg-tertiary); border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:0.75rem;">
          <div style="font-weight:700; color:var(--text-primary); font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
            <span>Current Benchmark:</span>
            <span id="lb-current-test-label" style="color:var(--accent-cyan); font-weight:800;">${currentTab.label}</span>
          </div>
          <button id="lb-header-play-btn" class="btn btn-primary btn-sm" style="font-weight:700; cursor:pointer;">
            🎮 Play ${currentTab.label} Now →
          </button>
        </div>
        <div id="lb-table-content"></div>
      </div>
    </div>
  `;

  bindEvents();
  renderTable(activeTestId);

  // Register real-time cross-tab sync callback
  setLeaderboardUpdateCallback((testId) => {
    if (!testId || testId === activeTestId) {
      renderTable(activeTestId);
    }
  });
}

function bindEvents() {
  const tabs = document.querySelectorAll('.lb-tab-btn');
  const avatarBtn = document.getElementById('lb-avatar-btn');
  const syncCloudBtn = document.getElementById('lb-sync-cloud-btn');
  const cycleEmojiBtn = document.getElementById('lb-cycle-emoji-btn');
  const randomizeBtn = document.getElementById('lb-randomize-btn');
  const headerPlayBtn = document.getElementById('lb-header-play-btn');

  if (headerPlayBtn) {
    headerPlayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const routeId = activeTestId.startsWith('cat-mini-golf-game') ? 'cat-mini-golf-game' : activeTestId;
      window.location.hash = '#' + routeId;
      handleRoute();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTestId = tab.dataset.tab;
      localStorage.setItem('catkeylab_last_active_test', activeTestId);

      const currentTab = TEST_TABS.find(t => t.id === activeTestId) || TEST_TABS[0];
      const labelEl = document.getElementById('lb-current-test-label');
      if (labelEl) labelEl.textContent = currentTab.label;
      if (headerPlayBtn) headerPlayBtn.textContent = `🎮 Play ${currentTab.label} Now →`;

      renderTable(activeTestId);
    });
  });

  if (syncCloudBtn) {
    syncCloudBtn.addEventListener('click', async () => {
      syncCloudBtn.disabled = true;
      syncCloudBtn.textContent = '⏳ Syncing...';
      const success = await fetchGlobalLeaderboards();
      renderTable(activeTestId);
      setTimeout(() => {
        syncCloudBtn.disabled = false;
        syncCloudBtn.textContent = success ? '✅ Scores Synced!' : '🔄 Refresh Live Scores';
        setTimeout(() => {
          syncCloudBtn.textContent = '🔄 Refresh Live Scores';
        }, 1500);
      }, 400);
    });
  }

  const handleAvatarCycle = () => {
    const updated = cycleAnonAvatar();
    const iconEl = document.getElementById('lb-avatar-icon');
    if (iconEl) iconEl.textContent = updated.avatar;
    renderTable(activeTestId);
  };

  if (avatarBtn) avatarBtn.addEventListener('click', handleAvatarCycle);
  if (cycleEmojiBtn) cycleEmojiBtn.addEventListener('click', handleAvatarCycle);

  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      const updated = randomizeAnonHandle();
      const handleEl = document.getElementById('lb-handle-text');
      const iconEl = document.getElementById('lb-avatar-icon');
      if (handleEl) handleEl.textContent = updated.handle;
      if (iconEl) iconEl.textContent = updated.avatar;
      renderTable(activeTestId);
    });
  }
}

function renderTable(testId) {
  const content = document.getElementById('lb-table-content');
  if (!content) return;

  const list = getLeaderboard(testId);
  const profile = getAnonProfile();
  const currentTab = TEST_TABS.find(t => t.id === testId) || TEST_TABS[0];

  if (list.length === 0) {
    content.innerHTML = `
      <div style="text-align:center; padding:3.5rem 1.5rem; color:var(--text-secondary);">
        <div style="font-size:3rem; margin-bottom:0.5rem;">🐾🏆</div>
        <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-primary); margin-bottom:0.4rem;">No Scores Logged Yet</h3>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:0;">Be the very first player to set a high score record on this test using the button above!</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <table class="lb-table">
      <thead>
        <tr>
          <th style="width:80px;">Rank</th>
          <th>Player Alias</th>
          <th style="text-align:right;">High Score</th>
          <th style="text-align:right; width:140px;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${list.map((item, index) => {
          const rank = index + 1;
          const isUser = item.handle === profile.handle;
          let rankBadge = `#${rank}`;

          if (rank === 1) rankBadge = '🥇 1st';
          else if (rank === 2) rankBadge = '🥈 2nd';
          else if (rank === 3) rankBadge = '🥉 3rd';

          return `
            <tr class="${isUser ? 'lb-row-user' : ''}">
              <td>
                <span class="lb-rank-pill ${rank <= 3 ? 'rank-top' : ''}">${rankBadge}</span>
              </td>
              <td>
                <div class="lb-player-cell">
                  <span class="lb-player-avatar">${item.avatar || '🐱'}</span>
                  <span class="lb-player-name">${item.handle}</span>
                  ${isUser ? '<span class="lb-you-tag">YOU</span>' : ''}
                </div>
              </td>
              <td style="text-align:right; font-weight:800; color:var(--accent-cyan);">
                ${item.display}
              </td>
              <td style="text-align:right; color:var(--text-muted); font-size:0.85rem;">
                ${formatRelativeTime(item.timestamp, item.date)}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function formatRelativeTime(timestamp, fallbackDate) {
  if (!timestamp) return fallbackDate || 'Just now';

  const elapsedSec = Math.floor((Date.now() - timestamp) / 1000);

  if (elapsedSec < 60) return 'Just now';
  const mins = Math.floor(elapsedSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const dateObj = new Date(timestamp);
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
