/* ==========================================================================
   CatKeyLab - Global Anonymous Leaderboard View Component
   ========================================================================== */

import { t } from '../i18n.js';
import { getAnonProfile, updateAnonHandle, randomizeAnonHandle, cycleAnonAvatar, getLeaderboard } from '../leaderboard.js';

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
  { id: 'cps-test', label: '⚡ CPS Test' }
];

export function renderLeaderboardView(container) {
  const profile = getAnonProfile();

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
          <button id="lb-cycle-emoji-btn" class="btn btn-secondary btn-sm">🎭 Cycle Emoji</button>
          <button id="lb-randomize-btn" class="btn btn-secondary btn-sm">🎲 Randomize All</button>
          <button id="lb-edit-btn" class="btn btn-primary btn-sm">✏️ Edit Name</button>
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

      <!-- Leaderboard Ranking Table -->
      <div class="lb-table-container">
        <div id="lb-table-content"></div>
      </div>
    </div>
  `;

  bindEvents();
  renderTable(activeTestId);
}

function bindEvents() {
  const tabs = document.querySelectorAll('.lb-tab-btn');
  const avatarBtn = document.getElementById('lb-avatar-btn');
  const cycleEmojiBtn = document.getElementById('lb-cycle-emoji-btn');
  const randomizeBtn = document.getElementById('lb-randomize-btn');
  const editBtn = document.getElementById('lb-edit-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTestId = tab.dataset.tab;
      renderTable(activeTestId);
    });
  });

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

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const current = getAnonProfile();
      const input = prompt("Enter your anonymous cat alias:", current.handle);
      if (input && input.trim()) {
        const updated = updateAnonHandle(input);
        const handleEl = document.getElementById('lb-handle-text');
        if (handleEl) handleEl.textContent = updated.handle;
        renderTable(activeTestId);
      }
    });
  }
}

function renderTable(testId) {
  const content = document.getElementById('lb-table-content');
  if (!content) return;

  const list = getLeaderboard(testId);
  const profile = getAnonProfile();

  if (list.length === 0) {
    content.innerHTML = `
      <div style="text-align:center; padding:3.5rem 1.5rem; color:var(--text-secondary);">
        <div style="font-size:3rem; margin-bottom:0.5rem;">🐾🏆</div>
        <h3 style="font-size:1.3rem; font-weight:800; color:var(--text-primary); margin-bottom:0.4rem;">No Scores Logged Yet</h3>
        <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:1.25rem;">Be the very first player to set a high score record on this test!</p>
        <a href="#${testId}" class="btn btn-primary btn-sm">🎮 Play Test Now</a>
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
                ${item.date || 'Recent'}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}
