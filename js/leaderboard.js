/* ==========================================================================
   CatKeyLab - Anonymous Leaderboard & Identity Engine
   ========================================================================== */

const CAT_NAMES = [
  "Speedy Tabby", "Laser Whiskers", "Nimble Calico", "Cosmic Panther",
  "Cheetah Paw", "Shadow Lynx", "Turbo Tomcat", "Cyber Kitten",
  "Stealth Leopard", "Atomic Ginger", "Hyper Pounce", "Sonic Claws",
  "Velvet Tiger", "Pixel Whiskers", "Blaze Feline", "Quantum Purr"
];

const CAT_EMOJIS = ["🐱", "😸", "😹", "😻", "😼", "😽", "🙀", "🐯", "🐆", "🐈"];

// Default Seed Leaderboards for all Benchmark Tools
const INITIAL_LEADERBOARDS = {
  'reaction-time-test': [
    { handle: "Sonic Claws #9102", avatar: "🐆", score: 142, display: "142 ms", date: "Today" },
    { handle: "Atomic Ginger #4829", avatar: "⚡", score: 158, display: "158 ms", date: "Yesterday" },
    { handle: "Laser Whiskers #1092", avatar: "🐱", score: 175, display: "175 ms", date: "2 days ago" },
    { handle: "Cyber Kitten #7731", avatar: "😸", score: 189, display: "189 ms", date: "3 days ago" },
    { handle: "Speedy Tabby #3821", avatar: "🐈", score: 204, display: "204 ms", date: "4 days ago" },
    { handle: "Cosmic Panther #8192", avatar: "🐯", score: 215, display: "215 ms", date: "5 days ago" }
  ],
  'sequence-memory-test': [
    { handle: "Hyper Pounce #3391", avatar: "🧠", score: 24, display: "Level 24", date: "Today" },
    { handle: "Pixel Whiskers #8812", avatar: "😻", score: 19, display: "Level 19", date: "Yesterday" },
    { handle: "Nimble Calico #4491", avatar: "😼", score: 16, display: "Level 16", date: "2 days ago" },
    { handle: "Turbo Tomcat #9021", avatar: "🐈", score: 14, display: "Level 14", date: "3 days ago" },
    { handle: "Shadow Lynx #1823", avatar: "🐱", score: 12, display: "Level 12", date: "5 days ago" }
  ],
  'aim-trainer-test': [
    { handle: "Laser Whiskers #1092", avatar: "🎯", score: 210, display: "210 ms", date: "Today" },
    { handle: "Sonic Claws #9102", avatar: "🐆", score: 235, display: "235 ms", date: "Yesterday" },
    { handle: "Blaze Feline #5512", avatar: "😼", score: 258, display: "258 ms", date: "2 days ago" },
    { handle: "Atomic Ginger #4829", avatar: "⚡", score: 280, display: "280 ms", date: "3 days ago" },
    { handle: "Cheetah Paw #7712", avatar: "🐯", score: 310, display: "310 ms", date: "4 days ago" }
  ],
  'number-memory-test': [
    { handle: "Quantum Purr #9910", avatar: "🔢", score: 18, display: "18 Digits", date: "Today" },
    { handle: "Hyper Pounce #3391", avatar: "🧠", score: 15, display: "15 Digits", date: "Yesterday" },
    { handle: "Cosmic Panther #8192", avatar: "🐯", score: 13, display: "13 Digits", date: "2 days ago" },
    { handle: "Velvet Tiger #2281", avatar: "😸", score: 11, display: "11 Digits", date: "3 days ago" },
    { handle: "Speedy Tabby #3821", avatar: "🐈", score: 9, display: "9 Digits", date: "4 days ago" }
  ],
  'verbal-memory-test': [
    { handle: "Pixel Whiskers #8812", avatar: "💬", score: 124, display: "124 Words", date: "Today" },
    { handle: "Stealth Leopard #6102", avatar: "😼", score: 98, display: "98 Words", date: "Yesterday" },
    { handle: "Nimble Calico #4491", avatar: "🐱", score: 76, display: "76 Words", date: "2 days ago" },
    { handle: "Atomic Ginger #4829", avatar: "⚡", score: 62, display: "62 Words", date: "3 days ago" }
  ],
  'chimp-test': [
    { handle: "Quantum Purr #9910", avatar: "🐒", score: 16, display: "16 Numbers", date: "Today" },
    { handle: "Blaze Feline #5512", avatar: "😼", score: 13, display: "13 Numbers", date: "Yesterday" },
    { handle: "Hyper Pounce #3391", avatar: "🧠", score: 11, display: "11 Numbers", date: "2 days ago" },
    { handle: "Turbo Tomcat #9021", avatar: "🐈", score: 9, display: "9 Numbers", date: "4 days ago" }
  ],
  'visual-memory-test': [
    { handle: "Hyper Pounce #3391", avatar: "🔳", score: 17, display: "Level 17 (19 Tiles)", date: "Today" },
    { handle: "Pixel Whiskers #8812", avatar: "😻", score: 14, display: "Level 14 (16 Tiles)", date: "Yesterday" },
    { handle: "Shadow Lynx #1823", avatar: "🐱", score: 12, display: "Level 12 (14 Tiles)", date: "3 days ago" },
    { handle: "Cheetah Paw #7712", avatar: "🐯", score: 10, display: "Level 10 (12 Tiles)", date: "4 days ago" }
  ],
  'typing-test': [
    { handle: "Sonic Claws #9102", avatar: "⚡", score: 148, display: "148 WPM", date: "Today" },
    { handle: "Atomic Ginger #4829", avatar: "⌨️", score: 125, display: "125 WPM", date: "Yesterday" },
    { handle: "Speedy Tabby #3821", avatar: "🐈", score: 108, display: "108 WPM", date: "2 days ago" },
    { handle: "Cyber Kitten #7731", avatar: "😸", score: 92, display: "92 WPM", date: "3 days ago" },
    { handle: "Cosmic Panther #8192", avatar: "🐯", score: 84, display: "84 WPM", date: "4 days ago" }
  ],
  'cps-test': [
    { handle: "Cheetah Paw #7712", avatar: "⚡", score: 16, display: "16.4 CPS", date: "Today" },
    { handle: "Sonic Claws #9102", avatar: "🐆", score: 14, display: "14.2 CPS", date: "Yesterday" },
    { handle: "Turbo Tomcat #9021", avatar: "🐈", score: 12, display: "12.8 CPS", date: "2 days ago" },
    { handle: "Atomic Ginger #4829", avatar: "😸", score: 10, display: "10.5 CPS", date: "3 days ago" }
  ]
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

export function updateAnonHandle(customName) {
  const profile = getAnonProfile();
  if (customName && customName.trim().length > 0) {
    profile.handle = customName.trim().substring(0, 24);
    localStorage.setItem('catkeylab_anon_profile', JSON.stringify(profile));
  }
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

// Get Leaderboard Data for a Test
export function getLeaderboard(testId) {
  let boards = localStorage.getItem('catkeylab_leaderboards');
  let data = null;

  if (boards) {
    try {
      data = JSON.parse(boards);
    } catch (e) {}
  }

  if (!data) {
    data = INITIAL_LEADERBOARDS;
    localStorage.setItem('catkeylab_leaderboards', JSON.stringify(data));
  }

  const list = data[testId] || INITIAL_LEADERBOARDS[testId] || [];

  // Sort logic (Lower is better for reaction-time and aim-trainer; Higher is better for others)
  const isLowerBetter = testId === 'reaction-time-test' || testId === 'aim-trainer-test';

  return list.sort((a, b) => isLowerBetter ? a.score - b.score : b.score - a.score);
}

// Submit Anonymous Score
export function submitScore(testId, scoreVal, scoreDisplay) {
  if (scoreVal <= 0) return null;

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
    allBoards = JSON.parse(localStorage.getItem('catkeylab_leaderboards')) || INITIAL_LEADERBOARDS;
  } catch (e) {
    allBoards = INITIAL_LEADERBOARDS;
  }

  allBoards[testId] = topList;
  localStorage.setItem('catkeylab_leaderboards', JSON.stringify(allBoards));

  // Find user rank position
  const rankIdx = topList.findIndex(item => item.handle === profile.handle);
  const userRank = rankIdx !== -1 ? rankIdx + 1 : topList.length + 1;

  // Calculate Percentile Rating
  const percentile = getPercentile(testId, scoreVal);

  return {
    rank: userRank,
    percentile,
    profile,
    isTopThree: userRank <= 3
  };
}

// Calculate Percentile Rating
export function getPercentile(testId, score) {
  switch (testId) {
    case 'reaction-time-test':
      if (score < 160) return "Top 1% (Superhuman Reflexes)";
      if (score < 190) return "Top 5% (Pro Gamer Level)";
      if (score < 220) return "Top 15% (Above Average)";
      if (score < 260) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'typing-test':
      if (score >= 120) return "Top 1% (Godlike Typist)";
      if (score >= 90) return "Top 5% (Pro Speed)";
      if (score >= 70) return "Top 15% (Fast Typist)";
      if (score >= 50) return "Top 40% (Average Typist)";
      return "Bottom 30%";

    case 'sequence-memory-test':
      if (score >= 20) return "Top 1% (Grandmaster)";
      if (score >= 15) return "Top 5% (Exceptional)";
      if (score >= 11) return "Top 15% (Above Average)";
      if (score >= 7) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'aim-trainer-test':
      if (score < 220) return "Top 1% (Sharpshooter)";
      if (score < 260) return "Top 5% (Pro Aim)";
      if (score < 300) return "Top 15% (Above Average)";
      if (score < 350) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'number-memory-test':
      if (score >= 16) return "Top 1% (Photographic Memory)";
      if (score >= 12) return "Top 5% (Pro Memory)";
      if (score >= 9) return "Top 15% (Above Average)";
      if (score >= 7) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'verbal-memory-test':
      if (score >= 110) return "Top 1% (Master Recall)";
      if (score >= 80) return "Top 5% (Pro Recall)";
      if (score >= 55) return "Top 15% (Above Average)";
      if (score >= 35) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'chimp-test':
      if (score >= 15) return "Top 1% (Chimp Master)";
      if (score >= 12) return "Top 5% (Superior)";
      if (score >= 9) return "Top 15% (Above Average)";
      if (score >= 7) return "Top 40% (Average)";
      return "Bottom 30%";

    case 'visual-memory-test':
      if (score >= 16) return "Top 1% (Spatial Master)";
      if (score >= 13) return "Top 5% (Pro Spatial)";
      if (score >= 10) return "Top 15% (Above Average)";
      if (score >= 7) return "Top 40% (Average)";
      return "Bottom 30%";

    default:
      return "Top 20%";
  }
}
