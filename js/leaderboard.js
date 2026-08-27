/* ==========================================================================
   CatKeyLab - Anonymous Leaderboard & Identity Engine
   ========================================================================== */

const CAT_NAMES = [
  "Speedy Tabby", "Laser Whiskers", "Nimble Calico", "Cosmic Panther",
  "Cheetah Paw", "Shadow Lynx", "Turbo Tomcat", "Cyber Kitten",
  "Stealth Leopard", "Atomic Ginger", "Hyper Pounce", "Sonic Claws",
  "Velvet Tiger", "Pixel Whiskers", "Blaze Feline", "Quantum Purr"
];

const CAT_EMOJIS = ["🐱", "😸", "😹", "😻", "😼", "😽", "🙀", "🐯", "🐆", "🐈", "🦁", "🐾", "🐈‍⬛", "⚡", "🧠", "🎯"];

// Initial Empty Leaderboards for all Benchmark Tools
const INITIAL_LEADERBOARDS = {
  'reaction-time-test': [],
  'sequence-memory-test': [],
  'aim-trainer-test': [],
  'number-memory-test': [],
  'verbal-memory-test': [],
  'chimp-test': [],
  'visual-memory-test': [],
  'typing-test': [],
  'cps-test': []
};

// Get or Create Anonymous Identity
export function getAnonProfile() {
  let profile = localStorage.getItem('catkeylab_anon_profile');
  if (profile) {
    try {
      return JSON.parse(profile);
    } catch (e) {}
  }

  // Create new fun anonymous profile
  const randomName = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomEmoji = CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)];

  const newProfile = {
    id: `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    handle: `${randomName} #${randomNum}`,
    avatar: randomEmoji
  };

  localStorage.setItem('catkeylab_anon_profile', JSON.stringify(newProfile));
  return newProfile;
}



export function cycleAnonAvatar() {
  const profile = getAnonProfile();
  const currentIdx = CAT_EMOJIS.indexOf(profile.avatar);
  const nextIdx = (currentIdx + 1) % CAT_EMOJIS.length;
  profile.avatar = CAT_EMOJIS[nextIdx];
  localStorage.setItem('catkeylab_anon_profile', JSON.stringify(profile));
  return profile;
}

export function randomizeAnonHandle() {
  const randomName = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomEmoji = CAT_EMOJIS[Math.floor(Math.random() * CAT_EMOJIS.length)];

  const profile = getAnonProfile();
  profile.handle = `${randomName} #${randomNum}`;
  profile.avatar = randomEmoji;

  localStorage.setItem('catkeylab_anon_profile', JSON.stringify(profile));
  return profile;
}

// Cross-Tab BroadcastChannel Engine
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('catkeylab_leaderboard_sync') : null;
let updateCallback = null;

export function setLeaderboardUpdateCallback(cb) {
  updateCallback = cb;
}

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'SCORE_SUBMITTED') {
      if (updateCallback) updateCallback(event.data.testId);
    }
  };
}

const GLOBAL_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/1278149811099688960';

// Purge old local storage keys to guarantee 100% clean data slate
function purgeOldKeys() {
  ['catkeylab_leaderboards', 'catkeylab_leaderboards_v2', 'catkeylab_leaderboards_v3', 'catkeylab_leaderboards_v4'].forEach(k => {
    if (localStorage.getItem(k)) localStorage.removeItem(k);
  });
}
purgeOldKeys();

// Fetch Global Remote Leaderboards from Cloud Store
export async function fetchGlobalLeaderboards() {
  try {
    const res = await fetch(GLOBAL_BLOB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return;
    const remoteData = await res.json();
    if (!remoteData || typeof remoteData !== 'object') return;

    let localBoards = {};
    try {
      localBoards = JSON.parse(localStorage.getItem('catkeylab_leaderboards_v5')) || {};
    } catch (e) {}

    let hasChanges = false;

    Object.keys(INITIAL_LEADERBOARDS).forEach(testId => {
      const remoteList = Array.isArray(remoteData[testId]) ? remoteData[testId] : [];
      const localList = Array.isArray(localBoards[testId]) ? localBoards[testId] : [];

      const isLowerBetter = testId === 'reaction-time-test' || testId === 'aim-trainer-test';
      const mergedMap = new Map();

      [...localList, ...remoteList].forEach(item => {
        if (!item || !item.handle || typeof item.score !== 'number') return;
        const existing = mergedMap.get(item.handle);
        if (!existing) {
          mergedMap.set(item.handle, item);
        } else {
          const isBetter = isLowerBetter ? item.score < existing.score : item.score > existing.score;
          if (isBetter) mergedMap.set(item.handle, item);
        }
      });

      const mergedList = Array.from(mergedMap.values())
        .sort((a, b) => isLowerBetter ? a.score - b.score : b.score - a.score)
        .slice(0, 50);

      localBoards[testId] = mergedList;
      hasChanges = true;
    });

    if (hasChanges) {
      localStorage.setItem('catkeylab_leaderboards_v5', JSON.stringify(localBoards));
      if (updateCallback) updateCallback();
    }
  } catch (e) {
    // Offline resilience
  }
}

// Automatic 3-Second Live Polling Loop across all clients
setInterval(fetchGlobalLeaderboards, 3000);

// Get Leaderboard Data for a Test
export function getLeaderboard(testId) {
  purgeOldKeys();

  let boards = localStorage.getItem('catkeylab_leaderboards_v5');
  let data = null;

  if (boards) {
    try {
      data = JSON.parse(boards);
    } catch (e) {}
  }

  if (!data) {
    data = INITIAL_LEADERBOARDS;
    localStorage.setItem('catkeylab_leaderboards_v5', JSON.stringify(data));
  }

  const list = data[testId] || [];

  // Trigger background cloud pull
  fetchGlobalLeaderboards();

  // Sort logic (Lower is better for reaction-time and aim-trainer; Higher is better for others)
  const isLowerBetter = testId === 'reaction-time-test' || testId === 'aim-trainer-test';

  return list.sort((a, b) => isLowerBetter ? a.score - b.score : b.score - a.score);
}

// Submit Anonymous Score
export function submitScore(testId, scoreVal, scoreDisplay) {
  if (scoreVal <= 0) return null;

  localStorage.setItem('catkeylab_last_active_test', testId);

  const profile = getAnonProfile();
  const list = getLeaderboard(testId);

  // Check if profile already has an entry
  const existingIdx = list.findIndex(item => item.handle === profile.handle);

  const isLowerBetter = testId === 'reaction-time-test' || testId === 'aim-trainer-test';

  const newEntry = {
    handle: profile.handle,
    avatar: profile.avatar,
    score: scoreVal,
    display: scoreDisplay,
    date: "Just now",
    isUser: true
  };

  if (existingIdx !== -1) {
    const prev = list[existingIdx];
    const isNewRecord = isLowerBetter ? scoreVal < prev.score : scoreVal > prev.score;
    if (isNewRecord) {
      list[existingIdx] = newEntry;
    }
  } else {
    list.push(newEntry);
  }

  // Sort and keep top 50
  list.sort((a, b) => isLowerBetter ? a.score - b.score : b.score - a.score);
  const topList = list.slice(0, 50);

  let allBoards = {};
  try {
    allBoards = JSON.parse(localStorage.getItem('catkeylab_leaderboards_v5')) || INITIAL_LEADERBOARDS;
  } catch (e) {
    allBoards = INITIAL_LEADERBOARDS;
  }

  allBoards[testId] = topList;
  localStorage.setItem('catkeylab_leaderboards_v5', JSON.stringify(allBoards));

  // Notify other local tabs in real-time
  if (syncChannel) {
    syncChannel.postMessage({ type: 'SCORE_SUBMITTED', testId, entry: newEntry });
  }

  // Push to Global Cloud Store asynchronously
  syncGlobalCloud(testId, newEntry);

  if (updateCallback) updateCallback(testId);

  // Find user rank position
  const rankIdx = topList.findIndex(item => item.handle === profile.handle);
  const userRank = rankIdx !== -1 ? rankIdx + 1 : topList.length + 1;

  // Calculate Percentile Rating
  const percentile = getPercentile(testId, scoreVal, userRank);

  return {
    rank: userRank,
    percentile,
    profile,
    isTopThree: userRank <= 3
  };
}

// Global Cloud Synchronization Engine
async function syncGlobalCloud(testId, newEntry) {
  try {
    let remoteData = {};
    try {
      const res = await fetch(GLOBAL_BLOB_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) remoteData = await res.json() || {};
    } catch (e) {}

    const isLowerBetter = testId === 'reaction-time-test' || testId === 'aim-trainer-test';
    const currentList = Array.isArray(remoteData[testId]) ? remoteData[testId] : [];

    const existingIdx = currentList.findIndex(item => item.handle === newEntry.handle);
    if (existingIdx !== -1) {
      const prev = currentList[existingIdx];
      const isBetter = isLowerBetter ? newEntry.score < prev.score : newEntry.score > prev.score;
      if (isBetter) currentList[existingIdx] = newEntry;
    } else {
      currentList.push(newEntry);
    }

    currentList.sort((a, b) => isLowerBetter ? a.score - b.score : b.score - a.score);
    remoteData[testId] = currentList.slice(0, 50);

    // Save updated global leaderboards to cloud store
    await fetch(GLOBAL_BLOB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(remoteData)
    });
  } catch (e) {
    // Offline resilience
  }
}

// Calculate Percentile Rating
export function getPercentile(testId, score, rank = null) {
  // If player achieved Rank #1, #2, or #3 on the leaderboard, prioritize their rank!
  if (rank === 1) return "Top 1% (Leaderboard #1 Leader! 🥇)";
  if (rank === 2) return "Top 2% (Leaderboard #2 🥈)";
  if (rank === 3) return "Top 3% (Leaderboard #3 🥉)";

  switch (testId) {
    case 'reaction-time-test':
      if (score < 180) return "Top 1% (Superhuman Reflexes)";
      if (score < 210) return "Top 5% (Pro Gamer Level)";
      if (score < 250) return "Top 15% (Above Average)";
      if (score < 300) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'typing-test':
      if (score >= 110) return "Top 1% (Godlike Typist)";
      if (score >= 85) return "Top 5% (Speed Demon)";
      if (score >= 65) return "Top 15% (Fast Typist)";
      if (score >= 45) return "Top 40% (Average Typist)";
      return "Top 60% (Novice)";

    case 'sequence-memory-test':
      if (score >= 15) return "Top 1% (Grandmaster)";
      if (score >= 11) return "Top 5% (Exceptional)";
      if (score >= 8) return "Top 15% (Above Average)";
      if (score >= 5) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'aim-trainer-test':
      if (score < 240) return "Top 1% (Sharpshooter)";
      if (score < 280) return "Top 5% (Pro Aim)";
      if (score < 330) return "Top 15% (Above Average)";
      if (score < 400) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'number-memory-test':
      if (score >= 14) return "Top 1% (Photographic Memory)";
      if (score >= 10) return "Top 5% (Pro Memory)";
      if (score >= 7) return "Top 15% (Above Average)";
      if (score >= 5) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'verbal-memory-test':
      if (score >= 80) return "Top 1% (Master Recall)";
      if (score >= 55) return "Top 5% (Pro Recall)";
      if (score >= 35) return "Top 15% (Above Average)";
      if (score >= 20) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'chimp-test':
      if (score >= 13) return "Top 1% (Chimp Master)";
      if (score >= 10) return "Top 5% (Superior)";
      if (score >= 7) return "Top 15% (Above Average)";
      if (score >= 5) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'visual-memory-test':
      if (score >= 14) return "Top 1% (Spatial Master)";
      if (score >= 11) return "Top 5% (Pro Spatial)";
      if (score >= 8) return "Top 15% (Above Average)";
      if (score >= 5) return "Top 40% (Average)";
      return "Top 60% (Casual)";

    case 'cps-test':
      if (score >= 12) return "Top 1% (Cybergod Clicker)";
      if (score >= 10) return "Top 5% (Cheetah Clicker)";
      if (score >= 8) return "Top 15% (Rabbit Clicker)";
      if (score >= 6) return "Top 40% (Greyhound Clicker)";
      return "Top 60% (Casual)";

    default:
      return "Top 15%";
  }
}
