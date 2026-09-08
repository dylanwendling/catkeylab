/* ==========================================================================
   CatKeyLab - Client Route Engine & SEO Meta Coordinator
   ========================================================================== */

import { t, getCurrentLang } from './i18n.js';
import { renderBreadcrumbs } from './components/breadcrumbs.js';
import { renderFAQ } from './components/faq.js';
import { renderAdSpace } from './components/adSpaces.js';

import { renderAutoClicker, cleanupAutoClicker } from './tools/autoClicker.js';
import { renderCPSTest, cleanupCPSTest } from './tools/cpsTest.js';
import { renderClickSpeedTest, cleanupClickSpeedTest } from './tools/clickSpeedTest.js';
import { renderClickCounter, cleanupClickCounter } from './tools/clickCounter.js';
import { renderMouseTest, cleanupMouseTest } from './tools/mouseTest.js';
import { renderKeyboardTest, cleanupKeyboardTest } from './tools/keyboardTest.js';
import { renderReactionTimeTest, cleanupReactionTimeTest } from './tools/reactionTimeTest.js';
import { renderDoubleClickTest, cleanupDoubleClickTest } from './tools/doubleClickTest.js';
import { renderTypingTest, cleanupTypingTest } from './tools/typingTest.js';

import { renderSequenceMemoryTest, cleanupSequenceMemoryTest } from './tools/sequenceMemoryTest.js';
import { renderAimTrainerTest, cleanupAimTrainerTest } from './tools/aimTrainerTest.js';
import { renderNumberMemoryTest, cleanupNumberMemoryTest } from './tools/numberMemoryTest.js';
import { renderVerbalMemoryTest, cleanupVerbalMemoryTest } from './tools/verbalMemoryTest.js';
import { renderChimpTest, cleanupChimpTest } from './tools/chimpTest.js';
import { renderVisualMemoryTest, cleanupVisualMemoryTest } from './tools/visualMemoryTest.js';
import { renderFishMazeGame, cleanupFishMazeGame } from './tools/fishMazeGame.js';
import { renderCardMemoryGame, cleanupCardMemoryGame } from './tools/cardMemoryGame.js';
import { renderCatMiniGolfGame, cleanupCatMiniGolfGame } from './tools/catMiniGolfGame.js';
import { renderCatFishingGame, cleanupCatFishingGame } from './tools/catFishingGame.js';
import { renderFruitSlicerGame, cleanupFruitSlicerGame } from './tools/fruitSlicerGame.js';
import { renderLeaderboardView } from './components/leaderboardView.js';

let currentCleanup = null;

function trackToolUsage(toolId) {
  try {
    let usage = JSON.parse(localStorage.getItem('catkeylab_tool_play_counts')) || {};
    usage[toolId] = (usage[toolId] || 0) + 1;
    localStorage.setItem('catkeylab_tool_play_counts', JSON.stringify(usage));
  } catch (e) {}
}

function getToolPlayCounts() {
  try {
    return JSON.parse(localStorage.getItem('catkeylab_tool_play_counts')) || {};
  } catch (e) {
    return {};
  }
}

export function triggerRandomTool() {
  const currentHash = window.location.hash.replace('#', '') || '';
  const allKeys = Object.keys(TOOL_METADATA);
  
  // Filter out current active tool so user always gets a different surprise tool
  const availableKeys = allKeys.filter(key => key !== currentHash);
  
  if (availableKeys.length === 0) return;

  const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  window.location.hash = `#${randomKey}`;
}

export const TOOL_METADATA = {
  'reaction-time-test': {
    titleKey: 'reactionTestTitle',
    desc: 'Test your visual reaction time in milliseconds. Wait for the signal to turn green and click as fast as you can.',
    icon: '⏱️',
    category: 'speed',
    renderFn: renderReactionTimeTest,
    cleanupFn: cleanupReactionTimeTest,
    content: {
      intro: 'Measure how quickly you can respond to a visual stimulus. This test records your reaction time in milliseconds by measuring the delay between a color change and your click.',
      howTo: [
        'Click the "Start" button to begin the test.',
        'Wait for the screen to change from red to green — do not click early.',
        'Click as quickly as possible once you see the green signal.',
        'Your reaction time in milliseconds will be displayed.',
        'Repeat for multiple attempts to get a consistent average.'
      ],
      whatItMeasures: 'This test measures your visual reaction latency — the time between seeing a stimulus and physically responding with a mouse click. It captures the combined speed of your visual processing, neural signal transmission, and motor response.',
      whyUseIt: 'Reaction time testing is useful for gamers benchmarking their reflexes, athletes measuring response speed, researchers studying human performance, or anyone curious about how fast they react to visual cues.',
      interpretResults: 'Under 200ms is considered fast. 200–250ms is average for most people. 250–350ms is below average. Reaction time naturally varies between attempts, so take several tries and consider your average rather than a single result.',
      tips: [
        'Use a mouse rather than a trackpad for more consistent results.',
        'Avoid clicking during the red (waiting) phase — early clicks reset the test.',
        'Take the test when alert and focused for the most accurate measurement.',
        'Multiple attempts give a better picture than a single try.'
      ],
      relatedTools: ['aim-trainer-test', 'click-speed-test', 'cps-test']
    },
    faqs: [
      { q: 'What is the average human reaction time?', a: 'The average visual reaction time for humans is between 200ms and 250ms.' },
      { q: 'Does monitor refresh rate affect reaction time scores?', a: 'Yes. A higher refresh rate monitor (144Hz+) can reduce display latency by several milliseconds compared to a standard 60Hz display, potentially improving measured reaction times.' },
      { q: 'Why did my reaction time vary between attempts?', a: 'Reaction time naturally fluctuates based on alertness, anticipation, fatigue, and even the time of day. Taking multiple attempts and averaging the results gives the most reliable measurement.' },
      { q: 'Can I use this test on a phone or tablet?', a: 'Yes. The test works on touchscreens, though touch response latency may differ slightly from mouse-click latency due to different input processing.' }
    ]
  },
  'sequence-memory-test': {
    titleKey: 'sequenceTestTitle',
    desc: 'Remember an increasingly long pattern of button presses with Simon Says interactive tones.',
    icon: '🧠',
    category: 'memory',
    renderFn: renderSequenceMemoryTest,
    cleanupFn: cleanupSequenceMemoryTest,
    content: {
      intro: 'Test your sequential memory by repeating an increasingly long pattern of colored pads. Inspired by the classic Simon Says game, each round adds one more step to the sequence you need to remember.',
      howTo: [
        'Click "Start" to begin the test.',
        'Watch the sequence of pads that light up and listen to the tones.',
        'After the sequence finishes, click the pads in the same order.',
        'If correct, the sequence grows by one additional step.',
        'The test ends when you click the wrong pad in the sequence.'
      ],
      whatItMeasures: 'This test measures your sequential short-term memory capacity — your ability to observe, store, and accurately reproduce an ordered pattern. Each additional step in the sequence increases the cognitive load on your working memory.',
      whyUseIt: 'Sequential memory is important for musicians learning note patterns, students memorizing procedures, and anyone wanting to exercise their short-term recall ability. It is also a well-known cognitive benchmark used in psychology.',
      interpretResults: 'Reaching level 7–8 is average for most adults. Levels 10+ demonstrate strong sequential memory. The audio tones provide an additional memory cue — some people remember sequences better through sound than visual patterns alone.',
      tips: [
        'Pay attention to both the visual pattern and the audio tones — dual encoding helps memory.',
        'Try to group the sequence into chunks of 3–4 rather than remembering each step individually.',
        'Take the test in a quiet environment to avoid distraction.',
        'Consistent practice can improve sequential memory over time.'
      ],
      relatedTools: ['number-memory-test', 'visual-memory-test', 'verbal-memory-test', 'chimp-test']
    },
    faqs: [
      { q: 'How does the Sequence Memory test work?', a: 'Watch the sequence of glowing pads, then repeat it in exact order. Each round adds one extra pad to the sequence.' },
      { q: 'What is a good score on the Sequence Memory test?', a: 'An average score is around level 7–8. Reaching level 12 or higher indicates excellent sequential memory recall.' },
      { q: 'Does practicing this test improve my memory?', a: 'Yes — sequential memory exercises like this can strengthen your working memory with consistent practice, similar to how musicians improve through repetitive pattern training.' }
    ]
  },
  'aim-trainer-test': {
    titleKey: 'aimTestTitle',
    desc: 'How quickly can you hit 30 targets? Test your mouse precision and reflex speed.',
    icon: '🎯',
    category: 'speed',
    renderFn: renderAimTrainerTest,
    cleanupFn: cleanupAimTrainerTest,
    content: {
      intro: 'Test your mouse accuracy and target acquisition speed by clicking 30 randomly placed targets as fast as possible. This tool measures how quickly and precisely you can move your cursor to a target and click it.',
      howTo: [
        'Click "Start" to begin the aim training session.',
        'A target will appear at a random position on the screen.',
        'Move your mouse to the target and click it as quickly as possible.',
        'A new target appears immediately after each successful hit.',
        'After hitting all 30 targets, your average time per target is displayed.'
      ],
      whatItMeasures: 'The Aim Trainer measures your target acquisition speed — how fast you can identify a target location, move your cursor to it, and click accurately. This combines visual processing, hand-eye coordination, and fine motor control.',
      whyUseIt: 'Aim training is commonly used by gamers to improve mouse accuracy in competitive games like first-person shooters. It is also useful for anyone who wants to improve their mouse control and cursor precision for everyday computing tasks.',
      interpretResults: 'Under 300ms per target is considered fast. 300–500ms is average. Over 600ms suggests room for improvement. Your score depends on mouse sensitivity, screen size, and familiarity with the exercise.',
      tips: [
        'Adjust your mouse sensitivity (DPI) to a level that feels comfortable and controlled.',
        'Focus on smooth, deliberate cursor movements rather than erratic flicking.',
        'Use a proper mousepad for consistent tracking.',
        'Warm up with a few rounds before comparing scores seriously.'
      ],
      relatedTools: ['reaction-time-test', 'click-speed-test', 'mouse-test']
    },
    faqs: [
      { q: 'What is a good score on Aim Trainer?', a: 'Under 300 milliseconds per target is considered fast aiming speed for gaming.' },
      { q: 'Does mouse DPI affect aim trainer performance?', a: 'Yes. A comfortable DPI setting allows more controlled cursor movement. Most competitive gamers use between 400–1600 DPI, but the best setting depends on your personal preference and screen resolution.' },
      { q: 'Can aim training actually improve my gaming accuracy?', a: 'Regular aim training helps build muscle memory for mouse movements. While it does not replicate in-game conditions, it strengthens the fundamental hand-eye coordination used in aiming.' }
    ]
  },
  'number-memory-test': {
    titleKey: 'numberTestTitle',
    desc: 'Remember the longest number sequence you can. The number length increases every level.',
    icon: '🔢',
    category: 'memory',
    renderFn: renderNumberMemoryTest,
    cleanupFn: cleanupNumberMemoryTest,
    content: {
      intro: 'Challenge your numerical short-term memory by memorizing increasingly long number sequences. Each level displays a number for a brief period, and you must type it back from memory.',
      howTo: [
        'Click "Start" to begin the test.',
        'A number will appear on screen for a few seconds.',
        'After the number disappears, type the number you saw into the input field.',
        'If correct, the next level shows a longer number.',
        'The test ends when you enter an incorrect number.'
      ],
      whatItMeasures: 'This test measures your digit span — the maximum number of digits you can hold in short-term working memory at one time. Digit span is a well-established cognitive measurement used in standardized intelligence and memory assessments.',
      whyUseIt: 'Understanding your digit span is useful for evaluating working memory capacity. Students, professionals, and researchers use digit span tests to benchmark cognitive performance or track changes in memory over time.',
      interpretResults: 'The average adult can remember about 7 digits (plus or minus 2). Scoring 9+ digits consistently indicates above-average short-term memory capacity. Scores below 5 may indicate fatigue or distraction rather than a memory deficit.',
      tips: [
        'Try "chunking" — break long numbers into groups of 3–4 digits (like a phone number).',
        'Say the number quietly to yourself while memorizing to use verbal reinforcement.',
        'Avoid external distractions during the test.',
        'Do not rush — use the full display time to encode the number.'
      ],
      relatedTools: ['sequence-memory-test', 'verbal-memory-test', 'visual-memory-test', 'chimp-test']
    },
    faqs: [
      { q: 'What is average number memory capacity?', a: 'Most humans can hold around 7 digits in working short-term memory.' },
      { q: 'What is the "chunking" technique?', a: 'Chunking means grouping individual digits into larger units (e.g., remembering "4821" as one chunk rather than four separate digits). This technique effectively expands how much you can hold in working memory.' },
      { q: 'Is digit span linked to intelligence?', a: 'Digit span is one component of standardized cognitive assessments, but it measures a specific type of working memory rather than overall intelligence. Many factors affect digit span, including attention and practice.' }
    ]
  },
  'verbal-memory-test': {
    titleKey: 'verbalTestTitle',
    desc: 'Keep as many words in short term memory as possible. Identify whether each word is SEEN or NEW.',
    icon: '💬',
    category: 'memory',
    renderFn: renderVerbalMemoryTest,
    cleanupFn: cleanupVerbalMemoryTest,
    content: {
      intro: 'Test your verbal memory by identifying whether each word shown has appeared before or is being shown for the first time. You have three lives — each incorrect answer costs one life.',
      howTo: [
        'Click "Start" to begin the test.',
        'A word will appear on screen.',
        'If you have seen this word before during the test, click "SEEN."',
        'If this is the first time the word has appeared, click "NEW."',
        'Continue identifying words correctly. Three wrong answers end the test.'
      ],
      whatItMeasures: 'This test measures your verbal recognition memory — your ability to remember and distinguish previously encountered words from new ones. It challenges you to maintain an expanding mental list of seen words as the test progresses.',
      whyUseIt: 'Verbal memory is fundamental to reading comprehension, language learning, and academic performance. This test provides a quick benchmark of how well you can track and recognize previously encountered verbal information.',
      interpretResults: 'Scores above 70 indicate strong verbal recall. Scores between 40–70 are average. The test becomes increasingly difficult as the pool of seen words grows, making it harder to distinguish old words from new ones.',
      tips: [
        'Try to form a quick mental association or image for each new word to strengthen encoding.',
        'Focus on the word itself rather than trying to maintain a running list.',
        'Take the test when well-rested for more accurate results.',
        'Avoid guessing — deliberate recall produces better scores than random choices.'
      ],
      relatedTools: ['number-memory-test', 'sequence-memory-test', 'visual-memory-test']
    },
    faqs: [
      { q: 'How is Verbal Memory scored?', a: 'You earn 1 point for every correct SEEN or NEW guess with 3 lives total.' },
      { q: 'Why do the words start repeating?', a: 'Repetition is the core mechanic — the test deliberately re-shows previously displayed words mixed with new ones to challenge your ability to remember which words you have already seen.' },
      { q: 'Does this test use the same word list every time?', a: 'Words are drawn from a curated list and presented in a randomized order, so each test session will have a different sequence.' }
    ]
  },
  'chimp-test': {
    titleKey: 'chimpTestTitle',
    desc: 'Are you smarter than a chimpanzee? Memorize number locations before they turn into blank tiles.',
    icon: '🐒',
    category: 'memory',
    renderFn: renderChimpTest,
    cleanupFn: cleanupChimpTest,
    content: {
      intro: 'Based on research at Kyoto University where chimpanzees outperformed humans in rapid spatial memory tasks, this test challenges you to memorize the positions of numbered tiles and click them in ascending order after they are hidden.',
      howTo: [
        'Click "Start" to begin the test.',
        'Numbers will briefly appear on a grid of tiles.',
        'After the numbers disappear, click the tiles in ascending numerical order (1, 2, 3...).',
        'If correct, the next round adds one more number to memorize.',
        'The test ends when you click the wrong tile.'
      ],
      whatItMeasures: 'This test measures your rapid spatial working memory — the ability to quickly memorize the positions of multiple items in a spatial layout and recall their order. Chimpanzees are remarkably good at this specific type of memory task.',
      whyUseIt: 'The Chimp Test is a fascinating way to benchmark your spatial memory against a well-known cognitive research standard. It challenges a specific type of rapid visual encoding that differs from verbal or sequential memory.',
      interpretResults: 'Reaching level 7–8 matches the average human performance. Levels 9+ demonstrate strong spatial memory. In the original research, trained chimpanzees consistently reached levels that most human participants could not match.',
      tips: [
        'Focus on the spatial pattern rather than trying to read each number individually.',
        'Try to take a mental "snapshot" of the entire grid during the display phase.',
        'Start by locating the lowest numbers first, since you need to click in ascending order.',
        'Consistent practice can improve your spatial encoding speed.'
      ],
      relatedTools: ['visual-memory-test', 'sequence-memory-test', 'number-memory-test']
    },
    faqs: [
      { q: 'Why is it called the Chimp Test?', a: 'Based on Kyoto University research where chimpanzees outperformed humans in rapid working memory tests.' },
      { q: 'Can humans actually beat chimpanzees at this test?', a: 'Some practiced humans can reach high levels, but the original research showed that trained chimpanzees consistently outperformed most human participants at rapid spatial number recall.' },
      { q: 'What cognitive skills does the Chimp Test target?', a: 'It specifically targets rapid spatial working memory — the ability to quickly encode and recall the positions of items in a visual layout, which is a distinct skill from verbal or sequential memory.' }
    ]
  },
  'visual-memory-test': {
    titleKey: 'visualTestTitle',
    desc: 'Remember an increasingly large board of squares as the grid expands.',
    icon: '🔳',
    category: 'memory',
    renderFn: renderVisualMemoryTest,
    cleanupFn: cleanupVisualMemoryTest,
    content: {
      intro: 'Test your visual spatial memory by memorizing which squares on a grid are highlighted, then selecting them from memory. The grid grows larger and adds more highlighted squares each level.',
      howTo: [
        'Click "Start" to begin the test.',
        'A grid of squares will appear with some squares briefly highlighted.',
        'After the highlights disappear, click the squares that were highlighted.',
        'If you correctly identify enough squares, the grid expands for the next level.',
        'Three mistakes end the test.'
      ],
      whatItMeasures: 'This test measures your visual-spatial short-term memory — the ability to remember the locations of items in a two-dimensional layout. As the grid expands from 3×3 to larger sizes, the test increasingly challenges your spatial encoding capacity.',
      whyUseIt: 'Visual-spatial memory is important for navigation, design work, reading maps, and many everyday tasks that require remembering where things are located. This test provides a structured way to measure and exercise this ability.',
      interpretResults: 'Reaching level 8–10 is average. Levels 12+ indicate strong visual-spatial memory. Performance depends on how effectively you can encode a spatial pattern during the brief display period.',
      tips: [
        'Look for shapes or patterns formed by the highlighted squares rather than memorizing each one individually.',
        'Focus on the overall "shape" of the highlighted area as a single image.',
        'Avoid looking away during the display phase.',
        'Practice regularly to build your spatial pattern recognition.'
      ],
      relatedTools: ['chimp-test', 'sequence-memory-test', 'number-memory-test', 'card-memory-game']
    },
    faqs: [
      { q: 'How does Visual Memory scale?', a: 'The board expands from 3x3 up to 7x7 grid with progressively more highlighted squares to remember.' },
      { q: 'What is the difference between Visual Memory and Chimp Test?', a: 'Visual Memory asks you to remember locations (which tiles were highlighted), while the Chimp Test asks you to remember both locations and their numerical order. They test related but distinct spatial memory skills.' },
      { q: 'Does screen size affect Visual Memory scores?', a: 'A larger screen can make the grid easier to see, but the core challenge is spatial pattern recall, which is more about memory capacity than visual acuity.' }
    ]
  },
  'fish-maze-game': {
    titleKey: 'fishMazeTitle',
    desc: 'Help Nibbles 🐱 navigate through a dynamic maze to find and eat the delicious Fish 🐟!',
    icon: '🐟',
    category: 'games',
    renderFn: renderFishMazeGame,
    cleanupFn: cleanupFishMazeGame,
    content: {
      intro: 'Guide Nibbles the Cat through a procedurally generated maze to reach the fish at the end. Use keyboard controls or the on-screen touch D-Pad to navigate through corridors and find the path.',
      howTo: [
        'Click "Start" to generate a new maze.',
        'Use Arrow keys, WASD keys, or the on-screen D-Pad buttons to move Nibbles.',
        'Navigate through the corridors to find the fish.',
        'Each new maze is randomly generated, so every game is different.',
        'Try to reach the fish in as few moves as possible.'
      ],
      whatItMeasures: 'This game exercises spatial reasoning, navigation, and problem-solving. While not a formal cognitive test, maze navigation engages the same mental mapping skills used in everyday spatial orientation.',
      whyUseIt: 'Maze games provide a fun way to exercise spatial reasoning and planning. This game also works well for testing keyboard input responsiveness — if arrow keys or WASD controls do not respond properly, it may indicate a keyboard input issue.',
      interpretResults: 'This is a casual game rather than a scored test. Faster completion with fewer moves indicates better spatial planning and familiarity with maze-solving strategies.',
      tips: [
        'Follow one wall consistently (e.g., always turn right) to systematically explore the maze.',
        'Look ahead at junction points before committing to a direction.',
        'On mobile, use the on-screen D-Pad for reliable touch controls.',
        'Try to mentally map the maze layout as you explore.'
      ],
      relatedTools: ['keyboard-test', 'card-memory-game', 'chimp-test']
    },
    faqs: [
      { q: 'How do I control Nibbles in the maze?', a: 'Use your keyboard Arrow keys, WASD keys, or the on-screen touch D-Pad buttons.' },
      { q: 'Is the maze the same every time?', a: 'No — each maze is procedurally generated, so you get a unique layout every time you start a new game.' },
      { q: 'Can I play the maze game on mobile?', a: 'Yes. Use the on-screen D-Pad touch buttons to navigate Nibbles through the maze on phones and tablets.' }
    ]
  },
  'card-memory-game': {
    titleKey: 'cardMemoryTitle',
    desc: 'Flip 3D cat-themed cards to find all 8 matching pairs in the fewest turns possible.',
    icon: '🎴',
    category: 'games',
    renderFn: renderCardMemoryGame,
    cleanupFn: cleanupCardMemoryGame,
    content: {
      intro: 'A classic card matching game with cat-themed 3D flip animations. Flip two cards at a time to find matching pairs — complete all 8 matches using as few turns as possible.',
      howTo: [
        'Cards are laid out face-down in a 4×4 grid.',
        'Click any card to flip it and reveal its cat image.',
        'Click a second card to check for a match.',
        'If the two cards match, they stay face-up. If not, both flip back.',
        'Continue until you have matched all 8 pairs.'
      ],
      whatItMeasures: 'This game tests your visual recognition memory — your ability to remember the positions and identities of previously seen cards. Fewer turns to complete the game indicates stronger visual recall.',
      whyUseIt: 'Card matching is a well-known memory exercise that strengthens visual recognition and spatial recall. It provides a fun, low-pressure way to challenge your short-term memory.',
      interpretResults: 'Completing the game in under 16 turns (the minimum possible is 8 perfect matches) is excellent. 16–24 turns is average. More than 24 turns suggests you may benefit from focusing more carefully on card positions.',
      tips: [
        'Mentally note the position of every card you flip, even if it does not match your current target.',
        'Develop a systematic scanning pattern rather than clicking randomly.',
        'Start with corners or edges to create spatial anchors.',
        'Take a moment to recall before clicking your second card.'
      ],
      relatedTools: ['visual-memory-test', 'sequence-memory-test', 'chimp-test']
    },
    faqs: [
      { q: 'How many cards are in the Memory Match grid?', a: '16 cards total, containing 8 matching cat pairs.' },
      { q: 'What is the best possible score?', a: 'The minimum number of turns to complete the game is 8 — one perfect match per turn with no mistakes.' },
      { q: 'Does this game work on touchscreens?', a: 'Yes. Tap cards on your phone or tablet to flip them. The 3D flip animation works on all modern mobile browsers.' }
    ]
  },
  'cat-mini-golf-game': {
    titleKey: 'catMiniGolfTitle',
    desc: 'HTML5 Canvas 2D Physics Mini Golf with 18 holes, dynamic weather, wind, strategic sand traps, water hazards, kinetic windmills, and portals!',
    icon: '⛳',
    category: 'games',
    renderFn: renderCatMiniGolfGame,
    cleanupFn: cleanupCatMiniGolfGame,
    content: {
      intro: 'A full-featured 2D mini golf game with physics simulation, 18 unique holes, and interactive course hazards. Choose between 3, 9, or 18 hole rounds and try to finish under par.',
      howTo: [
        'Select your course length: 3 holes (Quick), 9 holes (Front Nine), or 18 holes (Championship).',
        'Click or touch the golf ball and drag backward to aim your shot.',
        'The drag direction sets the angle and the drag distance sets the power.',
        'Release to take your shot.',
        'Navigate around hazards and reach the hole in as few strokes as possible.'
      ],
      whatItMeasures: 'While primarily a game, mini golf tests hand-eye coordination, spatial planning, and your ability to judge angles and power. Course hazards add strategic decision-making to each shot.',
      whyUseIt: 'This is an entertaining casual game that also exercises mouse or touch precision. The physics engine simulates realistic ball movement, bouncing, friction, and wind effects.',
      interpretResults: 'Each hole has a par score. Finishing under par across the course indicates strong spatial judgment and power control. Your total stroke count is tracked across all holes.',
      tips: [
        'Start with short, controlled shots to learn how the physics and bouncing work.',
        'Account for wind direction shown on the wind indicator.',
        'Use wall bounces strategically to navigate around obstacles.',
        'Avoid sand traps — they slow the ball significantly with heavy drag.'
      ],
      relatedTools: ['aim-trainer-test', 'fish-maze-game', 'cat-fishing-game']
    },
    faqs: [
      { q: 'How do I aim and shoot the golf ball?', a: 'Click or touch and drag backward on the golf ball to adjust your shot angle and power meter, then release! You can drag anywhere across the screen.' },
      { q: 'How do I choose course length?', a: 'Use the course selector buttons on the control bar to choose between 3 Holes (Quick), 9 Holes (Front Nine), or full 18 Holes (Championship).' },
      { q: 'What do the course hazards & features do?', a: 'Sand traps slow down your ball with heavy drag, water hazards add +1 stroke penalty and reset the tee, ice patches slide smoothly, portals warp your ball, and rotating windmill blades deflect shots!' }
    ]
  },
  'cat-fishing-game': {
    titleKey: 'catFishingTitle',
    desc: 'Interactive 2D Cartoon Fishing Adventure with Nibbles the Cat 🐱! Cast your line, click & drag your lure underwater to attract hungry fish 🐟, and mash REEL to catch!',
    icon: '🎣',
    category: 'games',
    renderFn: renderCatFishingGame,
    cleanupFn: cleanupCatFishingGame,
    content: {
      intro: 'Join Nibbles the Cat on a 2D fishing adventure. Cast your lure into the ocean, attract fish by dragging it underwater, and complete a reeling mini-game to catch 6 different species of fish.',
      howTo: [
        'Click "Cast Lure" to throw your fishing line into the ocean.',
        'Click and drag your lure underwater to attract nearby fish.',
        'Wait for a fish to bite — you will see a "BITE! HOOKED!" indicator.',
        'Rapidly press the "Reel" button or Spacebar to keep the tension in the green zone.',
        'Successfully reel in the fish to earn points based on the species.'
      ],
      whatItMeasures: 'This game combines mouse coordination (lure steering), reaction time (responding to bites), and rapid clicking (reeling mini-game). It is primarily an entertainment game rather than a formal test.',
      whyUseIt: 'The fishing game provides an entertaining way to practice mouse dragging precision and rapid clicking. The reeling mini-game is also a fun coordination challenge.',
      interpretResults: 'Points are scored based on the rarity and value of fish caught. Silver Minnow (100 pts), Orange Clownfish (250 pts), Spiky Pufferfish (400 pts), Golden Koi (750 pts), Legendary Rainbow Fish (1500 pts), and Brown Mudfish (50 pts).',
      tips: [
        'Move your lure slowly and steadily to attract fish — erratic movement can scare them away.',
        'During the reeling phase, maintain a steady clicking rhythm rather than mashing as fast as possible.',
        'Look for rarer fish species in deeper water for higher point values.',
        'Use Spacebar for the reel button if rapid mouse clicking is tiring.'
      ],
      relatedTools: ['cat-mini-golf-game', 'fruit-slicer-game', 'cps-test']
    },
    faqs: [
      { q: 'How do I cast and steer the lure underwater?', a: 'Click CAST LURE to launch your line into the ocean, then click and drag (or touch drag) your lure anywhere underwater to attract nearby fish!' },
      { q: 'How does the Reeling Mini-Game work?', a: 'Once a fish bites ("❗️ BITE! HOOKED!"), repeatedly mash the REEL button or Spacebar to keep the tension needle inside the green catch zone and pull the fish up to Nibbles\' boat!' },
      { q: 'How many different fish species can I catch?', a: 'There are 6 unique fish species: Silver Minnow (100 PTS), Orange Clownfish (250 PTS), Spiky Pufferfish (400 PTS), Golden Koi (750 PTS), Legendary Rainbow Fish (1500 PTS), and Brown Mudfish (50 PTS)!' }
    ]
  },
  'fruit-slicer-game': {
    titleKey: 'fruitSlicerTitle',
    desc: 'Juicy 2D Fruit Slicer Arcade with Nibbles 🐱! Drag or swipe your blade to slice flying fruits ⚔️, trigger multi-slice combo multipliers, and defend your 3 lives!',
    icon: '🍉',
    category: 'games',
    renderFn: renderFruitSlicerGame,
    cleanupFn: cleanupFruitSlicerGame,
    content: {
      intro: 'Slice flying fruits by swiping your mouse or finger across the screen. Score points with each slice, chain multi-fruit combos for bonus multipliers, and avoid letting fruits fall unsliced.',
      howTo: [
        'Click or tap "Start" to begin the game.',
        'Fruits will fly upward from the bottom of the screen.',
        'Click and drag your mouse (or swipe your finger) across fruits to slice them.',
        'Slice multiple fruits in one swipe for combo multiplier bonuses.',
        'Avoid letting fruits fall past the bottom unsliced — each missed fruit costs one life.'
      ],
      whatItMeasures: 'This game tests hand-eye coordination, mouse/touch dragging speed, and reaction time. Achieving high combo multipliers requires quick visual scanning and precise swipe timing.',
      whyUseIt: 'The Fruit Slicer is an entertaining arcade game that also exercises mouse dragging and swiping coordination. It is particularly well-suited for touchscreen play.',
      interpretResults: 'Points depend on the number of fruits sliced and combo multipliers earned. Higher combos (3x, 4x+) require slicing multiple fruits in a single swipe, rewarding quick reflexes and spatial anticipation.',
      tips: [
        'Wait for multiple fruits to be in the air before swiping to build combos.',
        'Use long, sweeping drag motions to maximize the area your blade covers.',
        'Focus on the bottom of the screen to catch fruits before they fall.',
        'On mobile, use broad finger swipes for larger blade coverage.'
      ],
      relatedTools: ['aim-trainer-test', 'reaction-time-test', 'cat-fishing-game']
    },
    faqs: [
      { q: 'How do I slice fruits on desktop and mobile?', a: 'Click and drag your mouse across the canvas (or swipe your finger on touch screens) to create a glowing blade trail. Any fruit intersecting your blade path will split in half!' },
      { q: 'How do combos and scoring work?', a: 'Slicing multiple fruits in one quick swipe grants COMBO multipliers (2x, 3x, 4x+) for massive bonus points!' },
      { q: 'How do I lose lives?', a: 'You start with 3 heart lives (❤️ ❤️ ❤️). If any fruit falls past the bottom of the screen unsliced, you lose 1 life. Slicing fruits keeps your run alive!' }
    ]
  },
  'typing-test': {
    titleKey: 'typingTestTitle',
    desc: 'Distraction-free, Monkeytype-inspired typing speed test. Test your WPM and accuracy live with mechanical sounds and Eye Mascot judging.',
    icon: '⌨️',
    category: 'speed',
    renderFn: renderTypingTest,
    cleanupFn: cleanupTypingTest,
    content: {
      intro: 'Measure your typing speed in Words Per Minute (WPM) and accuracy with a clean, distraction-free test interface. Featuring synthesized mechanical keyboard sounds and live feedback as you type.',
      howTo: [
        'Select a test duration (15s, 30s, or 60s).',
        'Start typing the displayed text — the timer begins with your first keystroke.',
        'Correct characters are highlighted green; mistakes are highlighted red.',
        'Your live WPM and accuracy update in real-time as you type.',
        'After the timer ends, your final WPM, accuracy, and character counts are displayed.'
      ],
      whatItMeasures: 'This test measures your typing speed (WPM — Words Per Minute) and accuracy percentage. WPM is calculated using the standard measurement where one "word" equals 5 characters, including spaces. Accuracy is the percentage of correct keystrokes out of total keystrokes.',
      whyUseIt: 'Knowing your typing speed is useful for job applications that require a minimum WPM, academic assessments, personal improvement tracking, or simply curiosity. Regular practice with typing tests can measurably improve your speed and accuracy over time.',
      interpretResults: 'Under 30 WPM is considered slow. 30–50 WPM is average for casual typists. 50–80 WPM is above average and typical for office workers. 80–120 WPM is fast. 120+ WPM is professional or competitive level. Accuracy above 95% is considered good.',
      tips: [
        'Focus on accuracy first — speed comes naturally with correct technique.',
        'Maintain proper finger positioning on the home row (ASDF / JKL;).',
        'Do not look at the keyboard while typing.',
        'Take the test multiple times and track your improvement over time.',
        'Use the longer test durations (30s or 60s) for more accurate WPM measurements.'
      ],
      relatedTools: ['keyboard-test', 'reaction-time-test', 'cps-test']
    },
    faqs: [
      { q: 'How is typing speed (WPM) calculated?', a: 'WPM (Words Per Minute) is calculated as (Standardized Words Typed / Minutes Elapsed), where 1 standardized word equals 5 characters.' },
      { q: 'What is a good typing speed?', a: 'Average typists score around 40 WPM. Office workers typically type 50–80 WPM. Professional typists and competitive speed typists often exceed 100 WPM.' },
      { q: 'Does CatKeyLab store what I type?', a: 'No. All typing data is processed locally in your browser. No keystrokes, text, or typing patterns are transmitted to any server.' },
      { q: 'How does the Eye Mascot judge typing speed?', a: 'The mascot calculates your final WPM and accuracy percentage, reacting with expressions and funny judging dialogue based on your performance level.' },
      { q: 'Can I test my typing speed on a phone?', a: 'Yes, though mobile soft keyboards (like Gboard) produce different WPM results than physical keyboards due to auto-correction, swipe typing, and different key layouts.' }
    ]
  },
  'mouse-test': {
    titleKey: 'mouseTestTitle',
    desc: 'Interactive online mouse button and scroll wheel tester. Test Left, Right, Middle, Side Back/Forward buttons and cursor tracking.',
    icon: '🖱️',
    category: 'hardware',
    renderFn: renderMouseTest,
    cleanupFn: cleanupMouseTest,
    content: {
      intro: 'Test all of your mouse buttons and scroll wheel directly in your browser. The interactive visualizer shows real-time feedback when you press any mouse button, scroll the wheel, or move the cursor within the test area.',
      howTo: [
        'Click anywhere inside the mouse visualizer test area.',
        'The corresponding button (Left, Right, Middle, Side Back, Side Forward) will highlight when pressed.',
        'Test the scroll wheel by scrolling up and down inside the test area.',
        'Move your mouse to verify smooth cursor tracking.',
        'Check that all buttons register correctly and release properly.'
      ],
      whatItMeasures: 'This tool detects and displays which mouse buttons are being activated using standard browser mouse events. It shows button identity (MB1 through MB5), scroll wheel direction, and cursor position within the test area.',
      whyUseIt: 'Use this tool to verify that all mouse buttons work correctly on a new mouse, troubleshoot an unresponsive button, check side buttons on a gaming mouse, or confirm scroll wheel functionality. It is especially useful when testing a used or refurbished mouse before purchase.',
      interpretResults: 'Each mouse button should highlight immediately when pressed and release when you let go. If a button does not highlight at all, it may not be registering. If a button highlights without being pressed, the switch may have a hardware fault. Scroll wheel should register both up and down directions smoothly.',
      tips: [
        'Right-click inside the test area — the tool prevents the context menu so you can test MB2 freely.',
        'If side buttons (MB4/MB5) do not register, your browser or operating system may be intercepting those buttons for navigation.',
        'Test each button individually to isolate any issues.',
        'Compare behavior across different browsers if a button seems unresponsive.'
      ],
      relatedTools: ['double-click-test', 'keyboard-test', 'click-speed-test', 'cps-test']
    },
    faqs: [
      { q: 'Which mouse buttons can I test?', a: 'You can test Left Click (MB1), Right Click (MB2), Middle Click (MB3/Wheel), Side Button 4 (Back), Side Button 5 (Forward), and Scroll Wheel direction.' },
      { q: 'How to check if my mouse right click or side buttons work?', a: 'Click anywhere inside our interactive mouse visualizer. The corresponding mouse button will glow cyan in real time if functioning properly.' },
      { q: 'Can this tool detect mouse hardware damage?', a: 'This tool can confirm whether button presses are registering in the browser. If a button does not register at all, the switch may be faulty. However, the tool cannot diagnose internal hardware issues like degraded switches or sensor problems — only whether button events reach the browser.' },
      { q: 'Why won\'t my side buttons register?', a: 'Some browsers and operating systems intercept MB4 and MB5 for back/forward navigation. Try testing in a different browser, or check your mouse driver software for button remapping settings.' }
    ]
  },
  'keyboard-test': {
    titleKey: 'keyboardTestTitle',
    desc: 'Interactive visual keyboard key tester. Press any key to see real-time highlight feedback, event keycode logging, and modifier status.',
    icon: '🖥️',
    category: 'hardware',
    renderFn: renderKeyboardTest,
    cleanupFn: cleanupKeyboardTest,
    content: {
      intro: 'Press any key on your physical keyboard to see it highlighted on an interactive on-screen keyboard layout. This tool logs key events, key codes, and modifier key states in real-time to help you verify that every key on your keyboard is working correctly.',
      howTo: [
        'Click inside the test area to make sure it has focus.',
        'Press any key on your physical keyboard.',
        'The corresponding key on the visual keyboard layout will highlight.',
        'Check the event log below for detailed key code and event information.',
        'Test all keys you want to verify — especially modifier keys (Shift, Ctrl, Alt).'
      ],
      whatItMeasures: 'This tool captures browser KeyboardEvent data for every keypress, including the key name, key code, and modifier key states. It visually maps each keypress to a standard keyboard layout so you can see exactly which keys are registering.',
      whyUseIt: 'Use this tool to test a newly purchased keyboard, check a used keyboard before buying, troubleshoot keys that seem unresponsive or stuck, verify key rollover (pressing multiple keys simultaneously), or inspect the exact key codes being sent by your keyboard.',
      interpretResults: 'Every key you press should immediately highlight on the visual layout and appear in the event log. If a key does not register at all, it may have a faulty switch or connection. If a key registers as a different key, there may be a layout or driver issue.',
      tips: [
        'Test multiple keys held simultaneously to check your keyboard\'s key rollover (NKRO) capability.',
        'Try every modifier key combination (Shift, Ctrl, Alt, Win/Cmd) to verify they work together.',
        'If testing a mechanical keyboard, press each key firmly to ensure the switch activates.',
        'For laptop keyboards, test keys around the edges and corners where flex may affect contact.'
      ],
      relatedTools: ['mouse-test', 'typing-test', 'double-click-test']
    },
    faqs: [
      { q: 'Does this keyboard tester support all keyboard layouts?', a: 'Yes! The tester listens to standard DOM KeyboardEvents so any QWERTY, AZERTY, or custom layout keys will register.' },
      { q: 'How do I test if a specific key is broken?', a: 'Press the key in question. If it does not highlight on the visual keyboard and does not appear in the event log, the key is not sending a signal to the browser. This usually indicates a faulty key switch, broken connection, or a driver issue.' },
      { q: 'Can I test a laptop keyboard with this tool?', a: 'Yes. Laptop keyboards send the same keyboard events as external keyboards. Open the tester in your browser and press keys directly on your laptop keyboard.' },
      { q: 'Can I test a mechanical keyboard?', a: 'Yes. Mechanical keyboards work the same way through browser keyboard events. You can also use this tool to verify key rollover — press multiple keys simultaneously to see how many register at once.' },
      { q: 'Why is key testing important for gaming and typing?', a: 'Key testing helps verify key rollover (NKRO), ghosting, and faulty key switches on mechanical or membrane keyboards.' }
    ]
  },
  'auto-clicker': {
    titleKey: 'autoClickerTitle',
    desc: 'Free online auto clicker running directly in your browser. Set click intervals, target counts, and hotkeys with zero software downloads.',
    icon: '🎯',
    category: 'clicking',
    renderFn: renderAutoClicker,
    cleanupFn: cleanupAutoClicker,
    content: {
      intro: 'A browser-based auto clicker that simulates rapid mouse clicks within the page. Configure click interval, total click count, and start/stop hotkeys — all without downloading or installing any software.',
      howTo: [
        'Set your desired click interval (time between clicks in milliseconds).',
        'Optionally set a target click count, or leave unlimited for continuous clicking.',
        'Click the "Start" button or press the configured hotkey to begin auto-clicking.',
        'The auto clicker will click at the specified interval within the browser page.',
        'Click "Stop" or press the hotkey again to stop auto-clicking.'
      ],
      whatItMeasures: 'This is a utility tool rather than a test. It generates automated click events at a configurable rate within the browser page. The click counter tracks total automated clicks performed.',
      whyUseIt: 'Online auto clickers are useful for browser-based games that require repetitive clicking, testing click-handling code, or automating repetitive in-page interactions without installing desktop software.',
      interpretResults: 'The counter displays total clicks performed. The actual click rate may vary slightly from the configured interval depending on browser timer precision and system load.',
      tips: [
        'Start with a moderate interval (100ms+) to avoid overwhelming your browser.',
        'Use the hotkey feature for convenient start/stop control.',
        'This tool only clicks within the browser page — it cannot click outside the browser window.',
        'If you need very high click rates, note that browser timers have a minimum resolution of approximately 4ms.'
      ],
      relatedTools: ['cps-test', 'click-counter', 'click-speed-test']
    },
    faqs: [
      { q: 'How does an online auto clicker work?', a: 'An online auto clicker uses browser JavaScript timers to simulate rapid mouse click events automatically inside the active web page canvas.' },
      { q: 'Can an online auto clicker click outside the browser?', a: 'No. Due to browser security sandbox rules, web applications cannot control the mouse cursor on your Windows or Mac desktop outside the browser window.' },
      { q: 'Is this auto clicker 100% free to use?', a: 'Yes! CatKeyLab is 100% free, private, and requires zero installation or account creation.' },
      { q: 'What is the fastest click interval I can set?', a: 'You can set intervals as low as 1ms, but browser JavaScript timers have a minimum effective resolution of approximately 4ms. Very fast intervals may not execute at the exact specified rate.' }
    ]
  },
  'cps-test': {
    titleKey: 'cpsTestTitle',
    desc: 'Test your Clicks Per Second (CPS) with our free online CPS calculator. Select 1s, 5s, 10s, 30s, or 60s tests and track your personal best.',
    icon: '⚡',
    category: 'speed',
    renderFn: renderCPSTest,
    cleanupFn: cleanupCPSTest,
    content: {
      intro: 'Measure your clicking speed in Clicks Per Second (CPS) over configurable time durations. Click as fast as possible within the test area and track your personal best scores across different time intervals.',
      howTo: [
        'Select a test duration: 1 second, 5 seconds, 10 seconds, 30 seconds, or 60 seconds.',
        'Click inside the test area to start the timer.',
        'Click as fast as possible until the timer runs out.',
        'Your CPS score (total clicks divided by seconds) is displayed.',
        'Try to beat your personal best score shown on the results screen.'
      ],
      whatItMeasures: 'CPS (Clicks Per Second) measures how many mouse clicks you can perform per second on average over the selected time duration. Shorter durations test burst clicking speed, while longer durations test sustained clicking endurance.',
      whyUseIt: 'CPS testing is popular among gamers who use techniques like jitter clicking, butterfly clicking, or drag clicking to maximize click rate. It is also useful for comparing mouse switch responsiveness or measuring sustained clicking stamina.',
      interpretResults: 'Average CPS is 6–8 for regular clicking. 8–12 CPS indicates fast clicking. 12–16+ CPS typically requires advanced techniques like jitter or butterfly clicking. Scores above 16 CPS may involve drag clicking. Note that 1-second tests tend to show higher CPS than longer duration tests.',
      tips: [
        'Use your index finger and middle finger alternating (butterfly click) for higher speeds.',
        'Jitter clicking uses rapid arm tension to vibrate your finger on the mouse button.',
        'Shorter test durations (1s, 5s) favor burst speed; longer tests (30s, 60s) test endurance.',
        'Make sure your mouse is on a stable surface for consistent results.'
      ],
      relatedTools: ['click-speed-test', 'click-counter', 'auto-clicker', 'double-click-test']
    },
    faqs: [
      { q: 'What is a good CPS score?', a: 'An average human CPS score is around 6 to 8 CPS. Gamers using jitter or butterfly clicking can achieve 10 to 14+ CPS.' },
      { q: 'What clicking techniques increase CPS?', a: 'Popular clicking techniques include Butterfly Clicking, Jitter Clicking, Drag Clicking, and regular index finger tapping.' },
      { q: 'Does the type of mouse affect CPS?', a: 'Yes. Mice with lighter switches and shorter actuation distances can produce faster click registration. Gaming mice are generally optimized for rapid clicking.' },
      { q: 'Why is my CPS different on 1-second vs. 10-second tests?', a: 'Short-duration tests measure burst speed — your fastest possible rate for a brief moment. Longer tests measure sustained clicking speed, which is usually lower due to fatigue.' }
    ]
  },
  'click-speed-test': {
    titleKey: 'speedTestTitle',
    desc: 'Measure your click velocity, burst speed, and clicking consistency with real-time analytics and dynamic speed gauges.',
    icon: '🚀',
    category: 'speed',
    renderFn: renderClickSpeedTest,
    cleanupFn: cleanupClickSpeedTest,
    content: {
      intro: 'Analyze your clicking performance with real-time speed gauges that track velocity, burst speed, and consistency. Unlike a simple CPS counter, this tool provides detailed analytics about the timing between your clicks.',
      howTo: [
        'Click "Start" to begin the click speed analysis.',
        'Click rapidly in the test area.',
        'Watch the real-time speed gauges update with each click.',
        'The tool tracks your average speed, burst speed, and clicking consistency.',
        'Review your detailed analytics when you finish.'
      ],
      whatItMeasures: 'This tool measures the time intervals between consecutive clicks and calculates average click velocity, peak burst speed, and clicking consistency (how uniform your click timing is).',
      whyUseIt: 'While the CPS Test gives you a simple clicks-per-second number, the Click Speed Test provides deeper analytics about your clicking patterns. This is useful for understanding whether your clicking is consistent or varies significantly between clicks.',
      interpretResults: 'A smaller average interval between clicks means faster clicking. High consistency means your clicks are evenly spaced. Low consistency means your click timing varies significantly, which may indicate fatigue or inconsistent technique.',
      tips: [
        'Focus on maintaining a steady rhythm rather than maximum speed for better consistency scores.',
        'Compare your burst speed (fastest few clicks) to your average speed to understand your speed range.',
        'Use this test alongside the CPS Test for a complete picture of your clicking performance.',
        'A comfortable mouse grip and stable surface improve consistency.'
      ],
      relatedTools: ['cps-test', 'click-counter', 'double-click-test', 'auto-clicker']
    },
    faqs: [
      { q: 'How is click speed measured?', a: 'Click speed is measured by logging timestamps of consecutive clicks and calculating average intervals in milliseconds.' },
      { q: 'What is the difference between CPS Test and Click Speed Test?', a: 'The CPS Test measures total clicks over a fixed time period. The Click Speed Test analyzes the timing between individual clicks, providing velocity, burst speed, and consistency metrics.' },
      { q: 'What does "clicking consistency" mean?', a: 'Clicking consistency measures how uniform the time intervals between your clicks are. A high consistency score means your clicks are evenly spaced, while low consistency indicates variable timing.' }
    ]
  },
  'click-counter': {
    titleKey: 'counterTitle',
    desc: 'Online digital click counter with audio sound effects, touch vibration, keyboard shortcuts (Spacebar), and target goal tracking.',
    icon: '🔢',
    category: 'clicking',
    renderFn: renderClickCounter,
    cleanupFn: cleanupClickCounter,
    content: {
      intro: 'A simple, reliable digital tally counter that tracks your total clicks. Features audio feedback, haptic vibration on mobile, keyboard shortcuts, and optional target goal tracking.',
      howTo: [
        'Click the counter button, press Spacebar, or press Enter to increment the count.',
        'Each click adds one to the counter with audio and visual feedback.',
        'On mobile devices, each tap includes haptic vibration feedback.',
        'Optionally set a target count goal to track progress toward a number.',
        'Use the reset button to clear the counter back to zero.'
      ],
      whatItMeasures: 'This is a counting utility rather than a performance test. It simply tracks the total number of clicks, taps, or key presses you make.',
      whyUseIt: 'Use the click counter as a digital tally counter for anything that needs counting — inventory items, exercise reps, event attendees, or any situation where you need a reliable running count with accessible input methods.',
      interpretResults: 'The counter displays your current total. If you set a target goal, a progress indicator shows how close you are to reaching it.',
      tips: [
        'Use Spacebar or Enter for hands-free counting when your hands are occupied.',
        'Set a target goal to get notified when you reach your desired count.',
        'The counter retains your count until you explicitly reset it.',
        'On mobile, the haptic vibration provides tactile confirmation of each count.'
      ],
      relatedTools: ['cps-test', 'click-speed-test', 'auto-clicker']
    },
    faqs: [
      { q: 'Can I use keyboard keys to increment the counter?', a: 'Yes! You can press the Spacebar or Enter key to count clicks effortlessly.' },
      { q: 'Does the counter save my count if I leave the page?', a: 'The current count is maintained while you remain on the page. Navigating away or refreshing will reset the counter.' },
      { q: 'Can I use this on my phone?', a: 'Yes. Tap the counter button on your touchscreen. Each tap includes haptic vibration feedback on supported devices.' }
    ]
  },
  'double-click-test': {
    titleKey: 'doubleClickTitle',
    desc: 'Test your double-clicking speed and detect faulty mouse switch hardware chatter with millisecond precision.',
    icon: '👆',
    category: 'hardware',
    renderFn: renderDoubleClickTest,
    cleanupFn: cleanupDoubleClickTest,
    content: {
      intro: 'Test your double-click speed and check for mouse button "chatter" — a common hardware fault where a single click accidentally registers as two clicks due to a worn-out micro-switch.',
      howTo: [
        'Click inside the test area.',
        'The tool records the time interval between consecutive clicks in milliseconds.',
        'Intentionally double-click to see your natural double-click speed.',
        'To test for chatter, click once firmly and check if a second click registers unintentionally.',
        'Intervals under 40–50ms on a single click likely indicate switch chatter.'
      ],
      whatItMeasures: 'This tool measures the precise time interval (in milliseconds) between consecutive mouse click events. It detects both intentional double-clicks and unintentional "chatter" — false double-clicks caused by degraded micro-switches.',
      whyUseIt: 'Mouse chatter is a common problem with aging mice where a single click registers as a double-click. This can cause issues like accidentally opening files, selecting/deselecting items, and other frustrating behavior. This tool helps you confirm whether your mouse has a chatter problem.',
      interpretResults: 'Intentional double-clicks typically register between 60–200ms apart. If you see intervals under 40ms when you are only clicking once, your mouse switch may be "chattering" — registering false double-clicks due to mechanical wear. Consistent chatter under 20ms strongly suggests a failing micro-switch.',
      tips: [
        'Click firmly and deliberately with single clicks to test for chatter — do not try to double-click.',
        'Repeat the single-click test 10+ times to check for intermittent chatter.',
        'If chatter is detected, the issue is typically hardware-related and may require mouse replacement or switch repair.',
        'Test both the left and right mouse buttons separately.'
      ],
      relatedTools: ['mouse-test', 'click-speed-test', 'cps-test']
    },
    faqs: [
      { q: 'What is mouse double click chatter?', a: 'Mouse chatter occurs when a degraded micro-switch registers two clicks involuntarily within less than 50 milliseconds.' },
      { q: 'How do I know if my mouse has chatter?', a: 'Click once firmly inside the test area. If the tool registers two clicks with a very short interval (under 40ms) when you only clicked once, your mouse likely has a chatter problem.' },
      { q: 'Can mouse chatter be fixed?', a: 'Some users fix chatter by adjusting the Windows double-click speed setting or using debounce software. However, chatter is usually a hardware issue caused by a worn micro-switch and may ultimately require mouse replacement or switch soldering repair.' },
      { q: 'Is chatter only a problem with old mice?', a: 'Chatter most commonly occurs with aged micro-switches, but it can also appear on new mice with defective switches. Even high-end gaming mice can develop chatter over time.' }
    ]
  }
};


export function handleRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  const mainContainer = document.getElementById('main-content');
  const breadcrumbsContainer = document.getElementById('breadcrumbs-container');

  // Perform previous view cleanup
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Highlight Active Nav Links
  updateNavState(hash);

  if (!hash || hash === '') {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
    updateSEOMetadata('CatKeyLab 🐾 - Free Online Keyboard, Mouse & Typing Tests', 'Free browser-based tools to test keyboards, mice, typing speed, clicking performance, reaction time, and memory. No downloads required.');
  } else if (hash === 'tools') {
    renderToolsDirectoryPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'All Tools');
    updateSEOMetadata('Mouse & Keyboard Tools Directory - CatKeyLab 🐾', 'Browse all free online mouse button testers, keyboard key testers, typing tests, clicking, and speed testing utilities.');
  } else if (hash === 'leaderboards') {
    renderLeaderboardView(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'Anonymous Leaderboards 🏆');
    updateSEOMetadata('Anonymous Leaderboards & High Scores - CatKeyLab 🐾', '100% private, anonymous high scores and rank percentiles across all human benchmark tests.');
  } else if (TOOL_METADATA[hash]) {
    trackToolUsage(hash);
    const meta = TOOL_METADATA[hash];
    renderToolPage(mainContainer, hash, meta);
    renderBreadcrumbs(breadcrumbsContainer, t(meta.titleKey));
    updateSEOMetadata(`${t(meta.titleKey)} - CatKeyLab 🐾 Hardware Tools`, meta.desc);
    currentCleanup = meta.cleanupFn;
  } else if (hash === 'about' || hash === 'privacy' || hash === 'terms' || hash === 'sitemap') {
    renderLegalPage(mainContainer, hash);
    renderBreadcrumbs(breadcrumbsContainer, hash === 'sitemap' ? 'Sitemap & Index' : hash.toUpperCase());
    updateSEOMetadata(`${hash === 'sitemap' ? 'Sitemap & Index' : hash.toUpperCase()} - CatKeyLab 🐾`, 'CatKeyLab platform policies and index.');
  } else if (hash === 'nibbles' || hash === 'meet-nibbles') {
    renderMeetNibblesPage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, 'Meet Nibbles 🐱');
    updateSEOMetadata('Meet Nibbles 🐱 - The Real Orange Cat Behind CatKeyLab', 'Meet Nibbles the Ginger Tabby Cat! Inspired by Dylan\'s real-life orange cat sitting in a box.');
  } else {
    renderHomePage(mainContainer);
    renderBreadcrumbs(breadcrumbsContainer, null);
  }

  window.scrollTo(0, 0);
}

function updateNavState(route) {
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const linkRoute = link.dataset.route;
    if (linkRoute === route) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function renderHomePage(container) {
  container.innerHTML = `
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
          CatKeyLab provides free browser-based tools for testing keyboards, mice, typing speed, clicking performance, reaction time, memory, and other computer-input functions. No downloads, no accounts — just open and test.
        </p>
        <div class="hero-ctas">
          <a href="#typing-test" class="btn btn-primary btn-lg">
            <span>⌨️⚡ Test Typing Speed (WPM)</span>
          </a>
          <a href="#mouse-test" class="btn btn-secondary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>
            <span>🖱️ Test Mouse Buttons</span>
          </a>
          <a href="#keyboard-test" class="btn btn-secondary btn-lg">
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

    <!-- Featured Tools Grid -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Online Hardware Testers & Speed Utilities</h2>
          <p class="section-subtitle">Promoted browser tools for checking typing speed (WPM), mouse buttons, keyboard rollover, and click performance.</p>
        </div>

        <div class="grid grid-cols-4">
          ${(() => {
            const playCounts = getToolPlayCounts();
            const defaultPopular = ['cat-mini-golf-game', 'cat-fishing-game', 'fruit-slicer-game', 'typing-test'];

            const sortedToolKeys = Object.keys(TOOL_METADATA).sort((a, b) => {
              const indexA = defaultPopular.indexOf(a);
              const indexB = defaultPopular.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              const countA = playCounts[a] || 0;
              const countB = playCounts[b] || 0;
              return countB - countA;
            });

            const topFourSet = new Set(sortedToolKeys.slice(0, 4));

            return sortedToolKeys.map(key => {
              const tool = TOOL_METADATA[key];
              const isPopular = topFourSet.has(key);

              return `
                <div class="tool-card ${isPopular ? 'featured-tool-card' : ''}" style="${isPopular ? 'border:1px solid var(--accent-cyan-glow); background:linear-gradient(180deg, rgba(6,182,212,0.08), var(--bg-card));' : ''}">
                  <div>
                    <div class="tool-card-header">
                      <div class="tool-card-icon" style="font-size:2rem;">${tool.icon}</div>
                      <span class="tool-card-badge" style="${isPopular ? 'background:rgba(6,182,212,0.2); color:var(--accent-cyan); font-weight:700;' : ''}">${isPopular ? '🔥 TOP SEARCHED' : tool.category.toUpperCase()}</span>
                    </div>
                    <h3 class="tool-card-title">${t(tool.titleKey)}</h3>
                    <p class="tool-card-desc">${tool.desc}</p>
                  </div>
                  <div class="tool-card-footer">
                    <a href="#${key}" class="btn ${isPopular ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;">
                      <span>${t('btnUseTool')} ${tool.icon}</span> →
                    </a>
                  </div>
                </div>
              `;
            }).join('');
          })()}
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
          <p>CatKeyLab is a free collection of browser-based tools designed to help you test, troubleshoot, and measure the performance of your computer input devices. Whether you need to verify that every key on your keyboard registers correctly, check that all your mouse buttons are working, measure your typing speed in words per minute, or test your clicking speed and reaction time, CatKeyLab provides focused tools for each task.</p>
          <p>All tests run directly in your browser with no downloads, installations, or account creation required. Your keystrokes, clicks, and test results are processed locally on your device and are never transmitted to any server. CatKeyLab also includes cognitive benchmarks for <a href="#sequence-memory-test">sequence memory</a>, <a href="#number-memory-test">number memory</a>, <a href="#verbal-memory-test">verbal memory</a>, <a href="#visual-memory-test">visual memory</a>, and <a href="#reaction-time-test">reaction time</a> — providing a complete set of tools for measuring both hardware function and human performance.</p>
        </div>

        <div class="info-grid">
          <!-- How to Test Your Keyboard -->
          <div class="info-section">
            <h3>🖥️ How to Test Your Keyboard</h3>
            <p>Use the <a href="#keyboard-test">Keyboard Tester</a> to verify that each key on your physical keyboard is registering correctly:</p>
            <ol class="info-steps">
              <li>Open the <a href="#keyboard-test">Keyboard Tester</a> and click inside the test area.</li>
              <li>Press each key on your physical keyboard one at a time.</li>
              <li>Confirm that each key highlights on the on-screen layout.</li>
              <li>Look for keys that fail to register or show incorrect key codes.</li>
              <li>Test modifier combinations (Shift, Ctrl, Alt) and try pressing multiple keys simultaneously to check rollover.</li>
            </ol>
            <p>Common reasons to test a keyboard include checking a new purchase, evaluating a used keyboard before buying, troubleshooting an unresponsive or stuck key, verifying a laptop keyboard, or confirming that a mechanical keyboard's switches are all functioning after cleaning or modification.</p>
          </div>

          <!-- How to Test a Mouse -->
          <div class="info-section">
            <h3>🖱️ How to Test a Mouse</h3>
            <p>Use the <a href="#mouse-test">Mouse Button & Movement Tester</a> to check that your mouse buttons, scroll wheel, and cursor tracking are working properly:</p>
            <ol class="info-steps">
              <li>Open the <a href="#mouse-test">Mouse Tester</a> and click inside the test area.</li>
              <li>Press each mouse button — left, right, middle (scroll click), and side buttons if available.</li>
              <li>Scroll the wheel up and down to confirm scroll detection.</li>
              <li>Move the mouse to verify smooth cursor tracking.</li>
              <li>Use the <a href="#double-click-test">Double Click Tester</a> to check for unintended double-click chatter.</li>
            </ol>
            <p>When diagnosing a mouse, look for buttons that do not register, buttons that trigger without being pressed (indicating switch chatter), scroll wheel directions that do not detect, or jerky cursor movement. If a single click is registering as a double-click, your mouse switch may be worn and should be tested with the <a href="#double-click-test">Double Click Tester</a>.</p>
          </div>
        </div>

        <!-- Why Test Your Keyboard or Mouse? -->
        <div class="info-section">
          <h3>Why Test Your Keyboard or Mouse?</h3>
          <p>There are several practical situations where testing input devices can save time and frustration:</p>
          <ul>
            <li><strong>New device verification</strong> — Confirm that every button and key works correctly out of the box before your return window closes.</li>
            <li><strong>Used or refurbished purchases</strong> — Test a used keyboard or mouse before committing to a purchase to detect worn switches or broken keys.</li>
            <li><strong>Troubleshooting input problems</strong> — If a key is not responding or a mouse button behaves inconsistently, testing helps isolate whether the issue is hardware or software.</li>
            <li><strong>Double-click issues</strong> — Aging mouse switches can develop "chatter," causing accidental double-clicks. The <a href="#double-click-test">Double Click Tester</a> measures click intervals to detect this.</li>
            <li><strong>Performance measurement</strong> — Track your <a href="#typing-test">typing speed</a>, <a href="#cps-test">clicking speed</a>, and <a href="#reaction-time-test">reaction time</a> to monitor improvement over time.</li>
            <li><strong>Keyboard rollover verification</strong> — Gamers can test whether their keyboard supports pressing multiple keys simultaneously using the <a href="#keyboard-test">Keyboard Tester</a>.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Embedded Anonymous Leaderboards Section -->
    <section class="section" style="padding-top:0;">
      <div id="home-leaderboard-container"></div>
    </section>

    ${renderAdSpace('banner')}

    <!-- Expanded Diagnostics & Value Section -->
    <section class="section" style="background:var(--bg-secondary); border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
      <div class="container">
        <div style="max-width:800px; margin:0 auto; line-height:1.7;">
          <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem;">Everything You Need For Clicking & Hardware Diagnostics — Directly In Your Browser</h2>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            CatKeyLab is a free, browser-based testing suite that helps you verify and troubleshoot computer input devices without downloading or installing any software. It provides diagnostic tools for <a href="#keyboard-test" style="color:var(--accent-cyan);">keyboard keys</a>, <a href="#mouse-test" style="color:var(--accent-cyan);">mouse buttons and scroll wheel</a>, <a href="#double-click-test" style="color:var(--accent-cyan);">double-click behavior</a>, and <a href="#typing-test" style="color:var(--accent-cyan);">typing speed</a>, along with performance benchmarks for <a href="#cps-test" style="color:var(--accent-cyan);">clicking speed</a>, <a href="#reaction-time-test" style="color:var(--accent-cyan);">reaction time</a>, and <a href="#aim-trainer-test" style="color:var(--accent-cyan);">aim accuracy</a>.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            Because all tools run locally in your web browser, they work instantly across Windows, macOS, Linux, ChromeOS, iOS, and Android with no installation or administrator permissions. Your inputs are processed entirely on your device — CatKeyLab does not record or transmit your keystrokes, clicks, or test data.
          </p>
          <p style="margin-bottom:1rem; color:var(--text-secondary);">
            <strong>What the tests can tell you:</strong> Whether keys and buttons register correctly, which key codes your keyboard sends, whether your mouse has double-click chatter, your typing speed and accuracy, your clicking rate, and your visual reaction time. <strong>What they cannot do:</strong> CatKeyLab cannot access hardware internals, diagnose electrical faults, or detect issues that do not produce observable browser-level events. If a key or button does not register in the tester, the problem could be the switch, wiring, driver, or OS-level configuration.
          </p>
          <p style="color:var(--text-secondary);">
            For common troubleshooting, start with the <a href="#keyboard-test" style="color:var(--accent-cyan);">Keyboard Tester</a> or <a href="#mouse-test" style="color:var(--accent-cyan);">Mouse Tester</a> to check whether your device is sending events to the browser. If a key or button is not detected, try a different USB port, check your device drivers, or test in another browser to determine whether the issue is hardware or software.
          </p>
        </div>
      </div>
    </section>

    <div class="container" id="home-faq-container"></div>
  `;

  initHeroQuickTestListeners();

  const lbContainer = document.getElementById('home-leaderboard-container');
  if (lbContainer) {
    renderLeaderboardView(lbContainer);
  }

  renderFAQ(document.getElementById('home-faq-container'), [
    { q: 'How do I test my keyboard?', a: 'Open the <a href="#keyboard-test">Keyboard Tester</a>, click inside the test area, and press each key on your physical keyboard. Every key that registers correctly will highlight on the on-screen layout. Keys that do not highlight may be faulty or not sending events to the browser.' },
    { q: 'How do I know if a keyboard key is broken?', a: 'If you press a key in the <a href="#keyboard-test">Keyboard Tester</a> and it does not highlight or appear in the event log, the key is not sending a signal to the browser. This usually indicates a faulty switch, broken connection, or driver issue. Try the key in another application to confirm.' },
    { q: 'Can I test a laptop keyboard?', a: 'Yes. Laptop keyboards send the same keyboard events as external keyboards. Open the <a href="#keyboard-test">Keyboard Tester</a> in your browser and press keys directly on your laptop keyboard.' },
    { q: 'Can I test a mechanical keyboard?', a: 'Yes. Mechanical keyboards work through the same browser keyboard events. You can also use the <a href="#keyboard-test">Keyboard Tester</a> to verify key rollover by pressing multiple keys simultaneously to see how many register at once.' },
    { q: 'How do I test my mouse buttons?', a: 'Open the <a href="#mouse-test">Mouse Button & Movement Tester</a> and click inside the test area with each mouse button. The corresponding button (left, right, middle, side buttons) will highlight if it registers correctly.' },
    { q: 'How do I test for mouse double-clicking problems?', a: 'Use the <a href="#double-click-test">Double Click Tester</a>. Click once firmly inside the test area. If the tool registers two clicks with a very short interval (under 40ms) when you only clicked once, your mouse may have switch chatter — a common hardware fault with aging mice.' },
    { q: 'What is a good typing speed?', a: 'Average typists score around 40 WPM (Words Per Minute). Office workers typically type 50–80 WPM. Professional typists often exceed 100 WPM. You can measure your typing speed with the <a href="#typing-test">Typing Speed Test</a>.' },
    { q: 'Does CatKeyLab store what I type?', a: 'No. All typing data, keystrokes, clicks, and test results are processed entirely within your local browser. Nothing is sent to any external server. CatKeyLab uses localStorage only for preferences like theme choice and personal high scores.' },
    { q: 'Do I need to install anything to use CatKeyLab?', a: 'No. All tools run 100% inside your web browser using standard HTML5, JavaScript, and Web Audio API. There is nothing to download, install, or configure.' },
    { q: 'Do CatKeyLab tests work on mobile devices?', a: 'Most tests work on mobile browsers. The <a href="#typing-test">Typing Speed Test</a> works with mobile soft keyboards (like Gboard), and touch-based tools like the <a href="#reaction-time-test">Reaction Time Test</a> and games work with tap input. Hardware-specific tests like the <a href="#keyboard-test">Keyboard Tester</a> are designed for physical keyboards.' },
    { q: 'Is CatKeyLab safe and private?', a: 'Yes. CatKeyLab does not collect personal data, email addresses, or browsing history. All test measurements process locally in your browser. The only network requests are for anonymous leaderboard scores (auto-generated cat aliases, no personal information) and ad delivery.' },
    { q: 'How accurate are the typing and reaction time tests?', a: 'Results depend on your browser, operating system, and hardware. Modern browsers on desktop provide millisecond-precision timing, which is sufficient for meaningful comparisons. For the most consistent results, use a desktop browser, close unnecessary tabs, and take multiple attempts.' }
  ]);
}

function initHeroQuickTestListeners() {
  const quickTestZone = document.getElementById('hero-quick-test-zone');
  const mouseValEl = document.getElementById('hero-mouse-btn');
  const keyValEl = document.getElementById('hero-key-btn');
  const countValEl = document.getElementById('hero-count-val');
  const surpriseBtn = document.getElementById('hero-surprise-btn');

  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', triggerRandomTool);
  }

  if (!quickTestZone) return;

  let inputCount = 0;
  const mouseNames = ['Left Click (MB1)', 'Middle Click (MB3)', 'Right Click (MB2)', 'Side Back (MB4)', 'Side Forward (MB5)'];

  quickTestZone.addEventListener('contextmenu', (e) => e.preventDefault());

  quickTestZone.addEventListener('mousedown', (e) => {
    e.preventDefault();
    inputCount++;
    if (countValEl) countValEl.textContent = inputCount;
    if (mouseValEl) {
      const btnName = mouseNames[e.button] || `Button ${e.button}`;
      mouseValEl.textContent = btnName;
      mouseValEl.style.color = 'var(--accent-cyan)';
    }
  });

  const keyHandler = (e) => {
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '') return;
    inputCount++;
    if (countValEl) countValEl.textContent = inputCount;
    if (keyValEl) {
      keyValEl.textContent = `${e.key === ' ' ? 'Space' : e.key} (${e.code})`;
      keyValEl.style.color = 'var(--accent-emerald)';
    }
  };

  window.addEventListener('keydown', keyHandler);
}

function renderToolsDirectoryPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="section-header">
        <h1 class="section-title" data-i18n="toolsDirectoryTitle">${t('toolsDirectoryTitle')}</h1>
        <p class="section-subtitle" data-i18n="toolsDirectorySubtitle">${t('toolsDirectorySubtitle')}</p>
      </div>

      <!-- Search & Filter Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:2rem; flex-wrap:wrap;">
        <input type="text" id="tool-search-input" class="form-input" placeholder="🔍 Search tools by name..." style="max-width:320px;">
        
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-primary tool-filter-btn active" data-filter="all" data-i18n="filterAll">${t('filterAll')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="memory" data-i18n="filterMemory">${t('filterMemory') || '🧠 Cognitive Memory'}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="clicking" data-i18n="filterClicking">${t('filterClicking')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="speed" data-i18n="filterSpeed">${t('filterSpeed')}</button>
          <button class="btn btn-sm btn-secondary tool-filter-btn" data-filter="hardware" data-i18n="filterHardware">${t('filterHardware')}</button>
        </div>
      </div>

      <div class="grid grid-cols-3" id="tools-directory-grid">
        ${Object.keys(TOOL_METADATA).map(key => {
          const tool = TOOL_METADATA[key];
          return `
            <div class="tool-card directory-tool-card" data-category="${tool.category}" data-name="${t(tool.titleKey).toLowerCase()}">
              <div>
                <div class="tool-card-header">
                  <div class="tool-card-icon">${tool.icon}</div>
                  <span class="tool-card-badge">${tool.category}</span>
                </div>
                <h3 class="tool-card-title">${t(tool.titleKey)}</h3>
                <p class="tool-card-desc">${tool.desc}</p>
              </div>
              <div class="tool-card-footer">
                <a href="#${key}" class="btn btn-primary btn-sm" style="width:100%;">
                  <span data-i18n="btnUseTool">${t('btnUseTool')}</span> →
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  bindToolsDirectoryEvents();
}

function bindToolsDirectoryEvents() {
  const searchInput = document.getElementById('tool-search-input');
  const filterBtns = document.querySelectorAll('.tool-filter-btn');
  const cards = document.querySelectorAll('.directory-tool-card');

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      filterCards();
    });
  });

  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const activeFilter = document.querySelector('.tool-filter-btn.active').dataset.filter;

    cards.forEach(card => {
      const name = card.dataset.name;
      const category = card.dataset.category;

      const matchesQuery = name.includes(query);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

function renderToolPage(container, toolKey, toolMeta) {
  const content = toolMeta.content || {};
  const toolTitle = t(toolMeta.titleKey);

  // Build related tools HTML if available
  let relatedToolsHTML = '';
  if (content.relatedTools && content.relatedTools.length > 0) {
    const relatedLinks = content.relatedTools
      .filter(key => TOOL_METADATA[key])
      .map(key => {
        const related = TOOL_METADATA[key];
        return `<a href="#${key}" class="related-tool-link">${related.icon} ${t(related.titleKey)}</a>`;
      }).join('');
    if (relatedLinks) {
      relatedToolsHTML = `
        <div class="info-section">
          <h3>Related Tools</h3>
          <div class="related-tools-grid">${relatedLinks}</div>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="container" style="padding-top:1.5rem;">
      <div class="tool-page-layout">
        <!-- Main Column (Tool) -->
        <div class="tool-page-main">
          <!-- Tool Title & Introduction -->
          <div style="margin-bottom:1.5rem;">
            <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
              <span>${toolMeta.icon}</span> <span>${toolTitle}</span>
            </h1>
            ${content.intro ? `<p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">${content.intro}</p>` : ''}
          </div>

          <!-- Interactive Tool Widget -->
          <div id="tool-render-box"></div>
        </div>
        
        <!-- Sidebar Column (Info & Ads) -->
        <div class="tool-page-sidebar">
          ${renderAdSpace('banner')}

          <!-- Tool Informational Content -->
          <div class="tool-content-section">
            ${content.howTo ? `
              <div class="info-section">
                <h2>How to Use ${toolTitle}</h2>
                <ol class="info-steps">
                  ${content.howTo.map(step => `<li>${step}</li>`).join('')}
                </ol>
              </div>
            ` : ''}

            ${content.whatItMeasures ? `
              <div class="info-section">
                <h2>What This Test Measures</h2>
                <p>${content.whatItMeasures}</p>
              </div>
            ` : ''}

            ${content.whyUseIt ? `
              <div class="info-section">
                <h2>Why Use This Test</h2>
                <p>${content.whyUseIt}</p>
              </div>
            ` : ''}

            ${content.interpretResults ? `
              <div class="info-section">
                <h2>How to Interpret Your Results</h2>
                <p>${content.interpretResults}</p>
              </div>
            ` : ''}

            ${content.tips ? `
              <div class="info-section">
                <h2>Tips for Accurate Results</h2>
                <ul>
                  ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${relatedToolsHTML}
          </div>
        </div>
      </div>
      
      <!-- Full Width FAQ Section -->
      <div id="tool-faq-container" style="margin-top: 3.5rem;"></div>
    </div>
  `;

  const toolRenderBox = document.getElementById('tool-render-box');
  toolMeta.renderFn(toolRenderBox);
  renderFAQ(document.getElementById('tool-faq-container'), toolMeta.faqs);
}

function renderLegalPage(container, type) {
  let title = 'About CatKeyLab';
  let body = `
    <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
      Free, Private & Powerful Online Hardware Testing Suite & Typing Speed Challenge 🐾
    </p>

    <div style="line-height:1.8; color:var(--text-secondary); display:flex; flex-direction:column; gap:1.5rem;">
      <!-- Creator Callout Card -->
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.25rem;">🎮 Created by Dylan</h3>
          <p style="color:var(--text-secondary);">CatKeyLab is crafted by Dylan. Check out games, utilities, and interactive creations on itch.io!</p>
          <p style="margin-top:0.5rem;"><a href="#nibbles" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat & See His Real-Life Photo →</a></p>
        </div>
        <a href="https://snowyorca.itch.io/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:linear-gradient(135deg, #f97316, #ea580c); border:none; font-weight:700;">
          <span>Visit Dylan on itch.io</span> ↗
        </a>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">📖 Overview</h3>
        <p>
          <strong>CatKeyLab</strong> (<a href="https://catkeylab.com/" style="color:var(--accent-cyan);">catkeylab.com</a>) is a lightweight, high-performance web application built for testing mouse hardware, keyboard switches, WPM typing speed, click velocity, and reaction latency directly inside your web browser.
        </p>
        <p style="margin-top:0.75rem;">
          Unlike bloated desktop software, CatKeyLab operates <strong>100% client-side</strong>, requiring <strong>zero downloads, zero plugins, zero accounts, and zero tracking</strong>. All hardware test measurements, typing accuracy calculations, and high score benchmarks process locally in your browser sandbox to guarantee absolute privacy and instant performance.
        </p>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🐱 Nibbles the Cat & Interactive Companions</h3>
        <p>CatKeyLab features <strong>Nibbles</strong>, a playful Ginger Tabby Cat wearing a ruby red collar with a shiny gold bell 🔔 who accompanies you while you test hardware!</p>
        <ul style="margin-top:0.75rem; margin-left:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
          <li><strong>🐾 Pupil & Paw Tracking</strong>: Nibbles' pupils follow your cursor across the viewport, while his paws reach out toward nearby mouse movements.</li>
          <li><strong>⌨️ WPM Typing Judging</strong>: Nibbles evaluates your typing speed, purring happily for fast typists or squinting judgmentally at typos!</li>
          <li><strong>🧶 Throwable Yarn Ball Toy</strong>: Interactive yarn ball featuring drag-and-throw physics, friction damping, and screen boundary bounce physics.</li>
          <li><strong>🥣 Cat Food Bowl & Fish Feeding</strong>: Click or drag the food bowl to spawn fresh fish 🐟 to feed Nibbles.</li>
        </ul>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🏆 Anonymous Global Leaderboards</h3>
        <p>CatKeyLab features a 100% private, anonymous leaderboard and percentile ranking engine. Players automatically receive a fun anonymous cat alias (e.g., <em>Speedy Tabby #4820</em>) with zero account creation or personal data collection.</p>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">✨ Included Tools & Modules (18 Suite Modules)</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-top:0.75rem;">
          <div><strong>⏱️ Reaction Time Test</strong>: Visual reaction latency tester in milliseconds.</div>
          <div><strong>🧠 Sequence Memory Test</strong>: Simon-says 3x3 interactive pattern recall with tones.</div>
          <div><strong>🎯 Aim Trainer</strong>: 30 targets precision challenge measuring acquisition speed & accuracy.</div>
          <div><strong>🔢 Number Memory Test</strong>: Digit span recall test with animated progress timer.</div>
          <div><strong>💬 Verbal Memory Test</strong>: SEEN vs NEW sequential word memory test with 3 lives.</div>
          <div><strong>🐒 Chimp Test</strong>: Ascending working memory grid test inspired by Kyoto University.</div>
          <div><strong>🔳 Visual Memory Test</strong>: Spatial matrix pattern recall expanding up to 7x7 grid.</div>
          <div><strong>⌨️ Typing Speed (WPM)</strong>: Distraction-free Monkeytype-inspired test with mechanical key sounds.</div>
          <div><strong>⛳ Nibbles 2D Mini Golf</strong>: 18-hole 2D physics golf game with 3/9/18 hole rounds, portals & windmills.</div>
          <div><strong>🐟 Help Nibbles Find Fish</strong>: 10x10 procedural maze puzzle guide game with touch/WASD controls.</div>
          <div><strong>🎴 Cat Card Memory Match</strong>: 3D card flipping memory game matching 8 cat pairs.</div>
          <div><strong>🖱️ Mouse Hardware Tester</strong>: MB1–MB5 buttons, scroll wheel direction, and velocity inspector.</div>
          <div><strong>🖥️ Keyboard Key Tester</strong>: NKRO key rollover verification and DOM KeyCode inspector.</div>
          <div><strong>🎯 Online Auto Clicker</strong>: In-browser automated clicking simulator with interval controls.</div>
          <div><strong>⚡ CPS Speed Test</strong>: Timed clicks-per-second benchmarking with high score badges.</div>
          <div><strong>🚀 Click Speed Test</strong>: Real-time velocity analytics and click consistency gauges.</div>
          <div><strong>🔢 Digital Click Counter</strong>: Tactile tally counter with spacebar triggers and target alerts.</div>
          <div><strong>👆 Double Click Tester</strong>: Hardware chatter detector for faulty mouse micro-switches.</div>
        </div>
      </div>

      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
        <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">🔊 Web Audio API Synthesizer</h3>
        <p>To maintain 100% offline capability and zero network overhead, CatKeyLab programmatically synthesizes audio in real-time using native Web Audio API oscillators for mechanical typing clicks, UI chimes, and cat purr sounds.</p>
      </div>
    </div>
  `;

  if (type === 'privacy') {
    title = 'Privacy Policy';
    body = `
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
          <p>All tool calculations—including mouse button detection, keyboard keycode logging, WPM speed benchmarks, mini golf physics, and reaction time measurements—execute <strong>100% locally inside your web browser sandbox</strong>. No raw test data ever leaves your device.</p>
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
    `;
  } else if (type === 'terms') {
    title = 'Terms of Service';
    body = `
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
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">3. Anonymous Leaderboards & Fair Play</h3>
          <p>CatKeyLab features global anonymous high score leaderboards across all benchmark games. Players agree to participate in fair play without using automated cheat scripts or artificial score injection.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">4. Open Source & MIT License</h3>
          <p>CatKeyLab is licensed under the <strong>MIT License</strong>. You are free to use, modify, and distribute the project for personal or commercial applications under the terms of the MIT open-source license.</p>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--text-primary); font-size:1.3rem; margin-bottom:0.75rem;">5. Disclaimer of Warranty</h3>
          <p>All utilities are provided "AS IS", without warranty of any kind, express or implied. Hardware measurements depend on device hardware, operating system drivers, and browser performance.</p>
        </div>
      </div>
    `;
  } else if (type === 'sitemap') {
    title = 'Sitemap & Index';
    body = `
      <p class="hero-subtitle" style="margin-bottom:1.5rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
        Complete Index of Interactive Tools, Companion Arcade Games & Resources on CatKeyLab 🗺️
      </p>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-emerald); font-size:1.2rem; margin-bottom:1rem;">🧠 Human Benchmark Suite</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#reaction-time-test" style="color:var(--text-primary); font-weight:600;">⏱️ Reaction Time Latency Test</a></li>
            <li><a href="#sequence-memory-test" style="color:var(--text-primary); font-weight:600;">🧠 Sequence Memory Test (Simon Grid)</a></li>
            <li><a href="#aim-trainer-test" style="color:var(--text-primary); font-weight:600;">🎯 Aim Trainer Precision Challenge</a></li>
            <li><a href="#number-memory-test" style="color:var(--text-primary); font-weight:600;">🔢 Number Memory Digit Span Test</a></li>
            <li><a href="#verbal-memory-test" style="color:var(--text-primary); font-weight:600;">💬 Verbal Memory Word Recall Test</a></li>
            <li><a href="#chimp-test" style="color:var(--text-primary); font-weight:600;">🐒 Chimp Test Working Memory Grid</a></li>
            <li><a href="#visual-memory-test" style="color:var(--text-primary); font-weight:600;">🔳 Visual Memory Spatial Recall Test</a></li>
            <li><a href="#typing-test" style="color:var(--text-primary); font-weight:600;">⌨️ Typing Speed Challenge (WPM)</a></li>
            <li><a href="#leaderboards" style="color:var(--accent-cyan); font-weight:700;">🏆 Anonymous Global Leaderboards</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-amber); font-size:1.2rem; margin-bottom:1rem;">🎮 Nibbles Companion Arcade Games</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#cat-fishing-game" style="color:var(--accent-cyan); font-weight:700;">🎣 Nibbles 2D Fishing Adventure</a></li>
            <li><a href="#fruit-slicer-game" style="color:var(--text-primary); font-weight:600;">🍉 Nibbles Fruit Slicer Arcade</a></li>
            <li><a href="#cat-mini-golf-game" style="color:var(--text-primary); font-weight:600;">⛳ Nibbles 2D Mini Golf (18 Holes)</a></li>
            <li><a href="#fish-maze-game" style="color:var(--text-primary); font-weight:600;">🐟 Help Nibbles Find Fish (Maze)</a></li>
            <li><a href="#card-memory-game" style="color:var(--text-primary); font-weight:600;">🎴 Cat Card Memory Match (3D)</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-cyan); font-size:1.2rem; margin-bottom:1rem;">🖱️ Hardware & Speed Diagnostics</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#mouse-test" style="color:var(--text-primary); font-weight:600;">🖱️ Mouse Button & Movement Tester</a></li>
            <li><a href="#keyboard-test" style="color:var(--text-primary); font-weight:600;">🖥️ Visual Keyboard Switch Tester</a></li>
            <li><a href="#auto-clicker" style="color:var(--text-primary); font-weight:600;">🎯 In-Browser Online Auto Clicker</a></li>
            <li><a href="#cps-test" style="color:var(--text-primary); font-weight:600;">⚡ CPS Test (Clicks Per Second)</a></li>
            <li><a href="#click-speed-test" style="color:var(--text-primary); font-weight:600;">🚀 Click Velocity & Burst Speed Test</a></li>
            <li><a href="#click-counter" style="color:var(--text-primary); font-weight:600;">🔢 Digital Tally Click Counter</a></li>
            <li><a href="#double-click-test" style="color:var(--text-primary); font-weight:600;">👆 Mouse Double Click Chatter Tester</a></li>
          </ul>
        </div>

        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
          <h3 style="color:var(--accent-rose); font-size:1.2rem; margin-bottom:1rem;">Platform & Information</h3>
          <ul style="line-height:2.2; display:flex; flex-direction:column; gap:0.25rem;">
            <li><a href="#nibbles" style="color:var(--accent-emerald); font-weight:700;">🐱 Meet Nibbles the Cat</a></li>
            <li><a href="https://catkeylab.com/#about" style="color:var(--text-primary); font-weight:600;">About CatKeyLab</a></li>
            <li><a href="https://catkeylab.com/#privacy" style="color:var(--text-primary); font-weight:600;">Privacy Policy</a></li>
            <li><a href="https://catkeylab.com/#terms" style="color:var(--text-primary); font-weight:600;">Terms of Service</a></li>
            <li><a href="https://catkeylab.com/#sitemap" style="color:var(--text-primary); font-weight:600;">Sitemap & Index</a></li>
          </ul>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:1rem;">${title}</h1>
        <div>${body}</div>
      </div>
    </div>
  `;
}

function renderMeetNibblesPage(container) {
  container.innerHTML = `
    <div class="container section">
      <div class="tool-wrapper" style="max-width:900px; margin:0 auto;">
        <h1 style="font-size:2.2rem; font-weight:800; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.6rem;">
          <span>🐱 Meet Nibbles the Cat</span>
        </h1>
        <p class="hero-subtitle" style="margin-bottom:1.75rem; color:var(--accent-emerald); font-weight:600; font-size:1.1rem;">
          The Real-Life Orange Cat Inspiration & Interactive Mascot Companion 🐾
        </p>

        <!-- Real Orange Cat Featured Hero Card -->
        <div style="background:linear-gradient(135deg, rgba(249,115,22,0.16), rgba(16,185,129,0.16)); border:2px solid #f97316; padding:2rem; border-radius:var(--radius-lg); display:flex; align-items:center; gap:2rem; flex-wrap:wrap; box-shadow:0 10px 30px rgba(0,0,0,0.35); margin-bottom:2rem;">
          <img src="./assets/orange-cat.jpg" alt="Real Orange Cat in Box - Inspiration for Nibbles" style="width:380px; max-width:100%; height:380px; object-fit:cover; border-radius:var(--radius-lg); border:4px solid #fb923c; box-shadow:0 12px 30px rgba(249,115,22,0.45); flex-shrink:0; margin:0 auto;" />
          <div style="flex:1; min-width:260px;">
            <h2 style="font-size:1.8rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
              Meet Nibbles in Real Life! 🐱
            </h2>
            <p style="color:var(--text-secondary); line-height:1.7; font-size:1.05rem;">
              This adorable orange cat sitting in a cardboard box is the real-life inspiration behind <strong>Nibbles</strong>! Created by <strong>Dylan</strong>, Nibbles lives on CatKeyLab to keep you company while you test hardware, practice typing, and play companion arcade games!
            </p>
          </div>
        </div>

        <!-- Nibbles Interactive Guide Cards -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-emerald); margin-bottom:0.5rem;">👀 Pupil & Cursor Tracking</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Nibbles' emerald eyes follow your mouse cursor smoothly across the screen in real-time as you move around the site.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-cyan); margin-bottom:0.5rem;">🐾 Swatting Paws & Petting</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Move your cursor close to Nibbles to see his white paws reach out to swat! Click Nibbles directly to pet him and hear him purr.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-amber); margin-bottom:0.5rem;">⛳ Nibbles 2D Mini Golf</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Play an 18-hole HTML5 Canvas 2D physics mini golf game with Nibbles! Master wind, portals, sand traps, and dual windmills.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="font-size:1.2rem; color:var(--accent-rose); margin-bottom:0.5rem;">🐟 Help Nibbles Find Fish</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Guide Nibbles through a 10x10 procedural maze puzzle to catch delicious fish using keyboard WASD or touch D-Pad controls!</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--accent-primary); font-size:1.2rem; margin-bottom:0.5rem;">🎴 Cat Card Memory Match</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Flip 3D cat cards to test your memory and find all 8 matching pairs in the fewest turns possible.</p>
          </div>

          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-lg);">
            <h3 style="color:var(--accent-primary); font-size:1.2rem; margin-bottom:0.5rem;">🥣 Cat Food Bowl & Fish</h3>
            <p style="color:var(--text-secondary); line-height:1.6;">Click the blue cat bowl 🥣 in the bottom-right corner to spawn fresh fish 🐟. Drag fish to Nibbles to feed him yummy treats!</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateSEOMetadata(title, description) {
  document.title = title;
  
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = description;

  // Open Graph
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title;
}
