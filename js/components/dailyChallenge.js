import { getAnonProfile } from '../leaderboard.js';
import { TOOL_METADATA } from '../router.js';
import { t } from '../i18n.js';

const CHALLENGE_ROUTES = [
  ['cps-test', 'cat-fishing-game', 'fruit-slicer-game'],
  ['reaction-time-test', 'aim-trainer-test'],
  ['sequence-memory-test', 'number-memory-test', 'verbal-memory-test'],
  ['chimp-test', 'visual-memory-test', 'card-memory-game'],
  ['typing-test', 'fish-maze-game', 'cat-mini-golf-game']
];

const FIREBASE_USERS_URL = 'https://catkeylab-default-rtdb.firebaseio.com/users';

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyTests() {
  const dateString = getTodayString();
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  return CHALLENGE_ROUTES.map(group => group[index % group.length]);
}

async function loadUserProgress() {
  const profile = getAnonProfile();
  const safeHandle = profile.handle.replace(/[.#$/[\]]/g, '_');
  
  try {
    const res = await fetch(`${FIREBASE_USERS_URL}/${safeHandle}/dailyChallenge.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (e) {
    console.warn("Failed to load daily challenge from Firebase, falling back to localStorage", e);
  }

  const local = localStorage.getItem('catkeylab_daily_challenge');
  if (local) {
    try { return JSON.parse(local); } catch(e) {}
  }

  return { date: null, completedTests: [], results: [], streak: 0, lastStreakDate: null };
}

async function saveUserProgress(progress) {
  const profile = getAnonProfile();
  const safeHandle = profile.handle.replace(/[.#$/[\]]/g, '_');
  
  localStorage.setItem('catkeylab_daily_challenge', JSON.stringify(progress));

  try {
    await fetch(`${FIREBASE_USERS_URL}/${safeHandle}/dailyChallenge.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    });
  } catch (e) {
    console.warn("Failed to save daily challenge to Firebase", e);
  }
}

let currentChallengeState = null;

export async function renderDailyChallengeTeaser(container) {
  const today = getTodayString();
  const tests = getDailyTests();
  
  const progress = await loadUserProgress();
  
  let isCompletedToday = (progress.date === today && progress.completedTests.length === 5);
  let testsCompleted = progress.date === today ? progress.completedTests.length : 0;
  
  let html = `
    <div class="info-section" style="margin-top:2.5rem; text-align:left;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3>📅 Daily Challenge</h3>
          <p style="color:var(--text-secondary);">Complete today's five tests and see how you stack up.</p>
        </div>
        ${progress.streak > 0 ? `<div style="background:var(--bg-secondary); border:1px solid var(--accent-emerald); padding:0.5rem 1rem; border-radius:20px; font-weight:700; color:var(--accent-emerald);">🔥 ${progress.streak} Day Streak</div>` : ''}
      </div>
      
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; margin-top:1.5rem;">
  `;

  if (isCompletedToday) {
    html += `
        <div style="text-align:center; padding:1rem 0;">
          <h4 style="color:var(--accent-emerald); font-size:1.5rem; margin-bottom:0.5rem;">🎉 Daily Challenge Complete!</h4>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">You've completed all 5 tests for today. Check back tomorrow for a new challenge!</p>
          <a href="#daily-challenge" class="btn btn-primary" style="color: var(--bg-primary); font-weight: 800;">View Results</a>
        </div>
    `;
  } else {
    html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:1rem;">
          <h4 style="font-size:1.2rem; color:var(--text-primary);">Today's 5 Tests (${testsCompleted}/5 Completed)</h4>
          <div style="display:flex; gap:0.5rem;">
            ${tests.map((_, i) => `<div style="width:12px; height:12px; border-radius:50%; ${i < testsCompleted ? 'background:var(--accent-emerald);' : 'background:var(--bg-primary); border:1px solid var(--border-color);'}"></div>`).join('')}
          </div>
        </div>
        <ul style="list-style:none; padding:0; margin:0 0 1.5rem 0; display:flex; flex-direction:column; gap:0.5rem;">
          ${tests.map((testId, i) => {
            const meta = TOOL_METADATA[testId];
            const isDone = i < testsCompleted;
            return `
              <li style="display:flex; align-items:center; gap:0.75rem; padding:0.75rem; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); opacity:${isDone ? '0.6' : '1'};">
                <span style="font-size:1.2rem;">${isDone ? '✅' : meta.icon}</span>
                <span style="font-weight:600; color:var(--text-primary); ${isDone ? 'text-decoration:line-through;' : ''}">${t(meta.titleKey)}</span>
              </li>
            `;
          }).join('')}
        </ul>
        <a href="#daily-challenge" class="btn btn-primary" style="width:100%; justify-content:center; padding:1rem; font-size:1.1rem;">
          <span style="color:var(--bg-primary); font-weight:800;">${testsCompleted > 0 ? 'Resume Challenge' : 'Start Challenge'}</span>
        </a>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

export async function renderDailyChallengePage(container) {
  const today = getTodayString();
  const tests = getDailyTests();
  let progress = await loadUserProgress();
  
  if (progress.date !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (progress.lastStreakDate !== yesterdayString && progress.lastStreakDate !== today) {
      progress.streak = 0;
    }
    
    progress.date = today;
    progress.completedTests = [];
    progress.results = [];
    await saveUserProgress(progress);
  }

  currentChallengeState = {
    tests,
    progress,
    container
  };

  renderChallengeStep();
}

function renderChallengeStep() {
  const { tests, progress, container } = currentChallengeState;
  const currentIdx = progress.completedTests.length;

  if (currentIdx >= 5) {
    renderFinalResults();
    return;
  }

  const testId = tests[currentIdx];
  const meta = TOOL_METADATA[testId];

  container.innerHTML = `
    <div class="container" style="padding-top:1.5rem; max-width:800px;">
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:var(--radius-lg); margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700; letter-spacing:0.05em; margin-bottom:0.25rem;">Daily Challenge</div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--text-primary);">Test ${currentIdx + 1} of 5</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          ${tests.map((_, i) => `<div style="width:14px; height:14px; border-radius:50%; ${i < currentIdx ? 'background:var(--accent-emerald);' : (i === currentIdx ? 'background:var(--accent-primary); box-shadow:0 0 10px var(--accent-primary);' : 'background:var(--bg-primary); border:1px solid var(--border-color);')}"></div>`).join('')}
        </div>
      </div>
      
      <div id="daily-challenge-tool-container" style="border:1px solid var(--border-color); border-radius:var(--radius-lg); background:var(--bg-primary); overflow:hidden;"></div>
    </div>
  `;

  const toolContainer = document.getElementById('daily-challenge-tool-container');
  
  const onTestCompleted = async (e) => {
    const emittedId = e.detail.testId;
    if (!emittedId.startsWith(testId)) return; 
    
    window.removeEventListener('catkeylab-test-completed', onTestCompleted);
    
    progress.completedTests.push(testId);
    progress.results.push({
      testId: testId,
      title: t(meta.titleKey),
      scoreDisplay: e.detail.scoreDisplay
    });
    
    if (progress.completedTests.length === 5) {
      progress.streak += 1;
      progress.lastStreakDate = progress.date;
    }
    
    await saveUserProgress(progress);
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);';
    overlay.innerHTML = `
      <div style="background:var(--bg-secondary); padding:2rem; border-radius:var(--radius-lg); border:1px solid var(--border-color); text-align:center; max-width:400px; width:90%;">
        <h2 style="font-size:1.8rem; color:var(--text-primary); margin-bottom:0.5rem;">Test Complete!</h2>
        <p style="font-size:1.2rem; color:var(--accent-emerald); margin-bottom:1.5rem; font-weight:700;">${e.detail.scoreDisplay}</p>
        <button id="dc-next-btn" class="btn btn-primary btn-lg" style="width:100%; justify-content:center;">${progress.completedTests.length === 5 ? 'View Final Results' : 'Continue to Next Test →'}</button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    document.getElementById('dc-next-btn').addEventListener('click', () => {
      document.body.removeChild(overlay);
      renderChallengeStep();
    });
  };
  
  window.addEventListener('catkeylab-test-completed', onTestCompleted);
  
  meta.renderFn(toolContainer);
}

function renderFinalResults() {
  const { progress, container } = currentChallengeState;
  
  container.innerHTML = `
    <div class="container" style="padding-top:2.5rem; max-width:600px;">
      <div style="text-align:center; margin-bottom:2rem;">
        <h1 style="font-size:2.5rem; color:var(--accent-emerald); margin-bottom:0.5rem; font-weight:800;">🎉 Challenge Complete!</h1>
        <p style="color:var(--text-secondary); font-size:1.1rem;">You've completed the Daily Challenge for ${progress.date}.</p>
        ${progress.streak > 0 ? `<div style="display:inline-block; margin-top:1rem; background:var(--bg-secondary); border:1px solid var(--accent-emerald); padding:0.5rem 1.5rem; border-radius:30px; font-weight:700; color:var(--accent-emerald); font-size:1.1rem;">🔥 ${progress.streak} Day Streak</div>` : ''}
      </div>
      
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); margin-bottom:2rem;">
        <h3 style="font-size:1.2rem; margin-bottom:1.5rem; color:var(--text-primary); text-align:center;">Your Results</h3>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${progress.results.map((res, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md);">
              <span style="color:var(--text-secondary); font-weight:500;">${i+1}. ${res.title}</span>
              <span style="color:var(--accent-cyan); font-weight:800; font-size:1.1rem;">${res.scoreDisplay}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="display:flex; gap:1rem; justify-content:center;">
        <a href="#tools" class="btn btn-secondary btn-lg">Return to Tools</a>
        <a href="#" class="btn btn-primary btn-lg" style="color: var(--bg-primary); font-weight: 800;">Back to Home</a>
      </div>
    </div>
  `;
}
