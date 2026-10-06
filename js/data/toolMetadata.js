export const TOOL_METADATA = {
  'reaction-time-test': {
    titleKey: 'reactionTestTitle',
    desc: 'Check your reaction time. Wait for the signal to turn green and click as fast as you can.',
    icon: '⏱️',
    category: 'speed',
    content: {
      intro: 'See how fast you can react to a color change. This test records your reaction time in milliseconds by measuring the delay between a color change and your click.',
      howTo: [
        'Click the "Start" button to begin the test.',
        'Wait for the screen to change from red to green: do not click early.',
        'Click as quickly as possible once you see the green signal.',
        'Your reaction time in milliseconds will be displayed.',
        'Repeat for multiple attempts to get a consistent average.'
      ],
      whatItMeasures: 'This test tracks your visual reaction latency: the time between seeing a stimulus and physically responding with a mouse click. It shows how fast your brain and hand can react together.',
      whyUseIt: 'Gamers love checking their reflexes with this, but it\'s also just a fun way to see how quick you are.',
      interpretResults: 'Under 200ms is considered fast. 200–250ms is average for most people. 250–350ms is below average. Reaction time naturally varies between attempts, so take several tries and consider your average rather than a single result.',
      tips: [
        'Use a mouse rather than a trackpad for more consistent results.',
        'Avoid clicking during the red (waiting) phase: early clicks reset the test.',
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
    content: {
      intro: 'Follow the pattern of lights and sounds. How far can you get? Inspired by the classic Simon Says game, each round adds one more step to the sequence you need to remember.',
      howTo: [
        'Click "Start" to begin the test.',
        'Watch the sequence of pads that light up and listen to the tones.',
        'After the sequence finishes, click the pads in the same order.',
        'If correct, the sequence grows by one additional step.',
        'The test ends when you click the wrong pad in the sequence.'
      ],
      whatItMeasures: 'This test tracks your sequential short-term memory capacity: your ability to observe, store, and accurately reproduce an ordered pattern. Each additional step in the sequence increases the cognitive load on your working memory.',
      whyUseIt: 'It\'s a great way to train your brain to remember patterns. It is also a well-known cognitive benchmark used in psychology.',
      interpretResults: 'Reaching level 7–8 is average for most adults. Levels 10+ demonstrate strong sequential memory. The audio tones provide an additional memory cue: some people remember sequences better through sound than visual patterns alone.',
      tips: [
        'Pay attention to both the visual pattern and the audio tones: dual encoding helps memory.',
        'Try to group the sequence into chunks of 3–4 rather than remembering each step individually.',
        'Take the test in a quiet environment to avoid distraction.',
        'Consistent practice can improve sequential memory over time.'
      ],
      relatedTools: ['number-memory-test', 'visual-memory-test', 'verbal-memory-test', 'chimp-test']
    },
    faqs: [
      { q: 'How does the Sequence Memory test work?', a: 'Watch the sequence of glowing pads, then repeat it in exact order. Each round adds one extra pad to the sequence.' },
      { q: 'What is a good score on the Sequence Memory test?', a: 'An average score is around level 7–8. Reaching level 12 or higher indicates excellent sequential memory recall.' },
      { q: 'Does practicing this test improve my memory?', a: 'Yes: sequential memory exercises like this can strengthen your working memory with consistent practice, similar to how musicians improve through repetitive pattern training.' }
    ]
  },
  'aim-trainer-test': {
    titleKey: 'aimTestTitle',
    desc: 'How quickly can you hit 30 targets? Test your mouse precision and reflex speed.',
    icon: '🎯',
    category: 'speed',
    content: {
      intro: 'Click the 30 targets as fast as you can. A great way to test your mouse precision.',
      howTo: [
        'Click "Start" to begin the aim training session.',
        'A target will appear at a random position on the screen.',
        'Move your mouse to the target and click it as quickly as possible.',
        'A new target appears immediately after each successful hit.',
        'After hitting all 30 targets, your average time per target is displayed.'
      ],
      whatItMeasures: 'The Aim Trainer measures your target acquisition speed: how fast you can identify a target location, move your cursor to it, and click accurately. It tests your hand-eye coordination and mouse control.',
      whyUseIt: 'A lot of FPS gamers use aim trainers to warm up and improve their tracking. But it\'s also helpful if you just want to get better at using your mouse.',
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
    content: {
      intro: 'Challenge your numerical short-term memory by memorizing increasingly long number sequences. Each level displays a number for a brief period, and you must type it back from memory.',
      howTo: [
        'Click "Start" to begin the test.',
        'A number will appear on screen for a few seconds.',
        'After the number disappears, type the number you saw into the input field.',
        'If correct, the next level shows a longer number.',
        'The test ends when you enter an incorrect number.'
      ],
      whatItMeasures: 'This test tracks your digit span: the maximum number of digits you can hold in short-term working memory at one time. Digit span is a well-established cognitive measurement used in standardized intelligence and memory assessments.',
      whyUseIt: 'Understanding your digit span is useful for evaluating working memory capacity. Students, professionals, and researchers use digit span tests to benchmark cognitive performance or track changes in memory over time.',
      interpretResults: 'The average adult can remember about 7 digits (plus or minus 2). Scoring 9+ digits consistently indicates above-average short-term memory capacity. Scores below 5 may indicate fatigue or distraction rather than a memory deficit.',
      tips: [
        'Try "chunking": break long numbers into groups of 3–4 digits (like a phone number).',
        'Say the number quietly to yourself while memorizing to use verbal reinforcement.',
        'Avoid external distractions during the test.',
        'Do not rush: use the full display time to encode the number.'
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
    content: {
      intro: 'Test your verbal memory by identifying whether each word shown has appeared before or is being shown for the first time. You have three lives: each incorrect answer costs one life.',
      howTo: [
        'Click "Start" to begin the test.',
        'A word will appear on screen.',
        'If you have seen this word before during the test, click "SEEN."',
        'If this is the first time the word has appeared, click "NEW."',
        'Continue identifying words correctly. Three wrong answers end the test.'
      ],
      whatItMeasures: 'This checks how well you remember words you\'ve just seen: your ability to remember and distinguish previously encountered words from new ones. It challenges you to maintain an expanding mental list of seen words as the test progresses.',
      whyUseIt: 'Verbal memory is fundamental to reading comprehension, language learning, and academic performance. This test provides a quick benchmark of how well you can track and recognize previously encountered verbal information.',
      interpretResults: 'Scores above 70 indicate strong verbal recall. Scores between 40–70 are average. The test becomes increasingly difficult as the pool of seen words grows, making it harder to distinguish old words from new ones.',
      tips: [
        'Try to form a quick mental association or image for each new word to strengthen encoding.',
        'Focus on the word itself rather than trying to maintain a running list.',
        'Take the test when well-rested for more accurate results.',
        'Avoid guessing: deliberate recall produces better scores than random choices.'
      ],
      relatedTools: ['number-memory-test', 'sequence-memory-test', 'visual-memory-test']
    },
    faqs: [
      { q: 'How is Verbal Memory scored?', a: 'You earn 1 point for every correct SEEN or NEW guess with 3 lives total.' },
      { q: 'Why do the words start repeating?', a: 'Repetition is the core mechanic: the test deliberately re-shows previously displayed words mixed with new ones to challenge your ability to remember which words you have already seen.' },
      { q: 'Does this test use the same word list every time?', a: 'Words are drawn from a curated list and presented in a randomized order, so each test session will have a different sequence.' }
    ]
  },
  'chimp-test': {
    titleKey: 'chimpTestTitle',
    desc: 'Are you smarter than a chimpanzee? Memorize number locations before they turn into blank tiles.',
    icon: '🐒',
    category: 'memory',
    content: {
      intro: 'Based on research at Kyoto University where chimpanzees outperformed humans in rapid spatial memory tasks, this test challenges you to memorize the positions of numbered tiles and click them in ascending order after they are hidden.',
      howTo: [
        'Click "Start" to begin the test.',
        'Numbers will briefly appear on a grid of tiles.',
        'After the numbers disappear, click the tiles in ascending numerical order (1, 2, 3...).',
        'If correct, the next round adds one more number to memorize.',
        'The test ends when you click the wrong tile.'
      ],
      whatItMeasures: 'This test tracks your rapid spatial working memory: the ability to quickly memorize the positions of multiple items in a spatial layout and recall their order. Chimpanzees are remarkably good at this specific type of memory task.',
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
      { q: 'What cognitive skills does the Chimp Test target?', a: 'It specifically targets rapid spatial working memory: the ability to quickly encode and recall the positions of items in a visual layout, which is a distinct skill from verbal or sequential memory.' }
    ]
  },
  'visual-memory-test': {
    titleKey: 'visualTestTitle',
    desc: 'Remember an increasingly large board of squares as the grid expands.',
    icon: '🔳',
    category: 'memory',
    content: {
      intro: 'Test your visual spatial memory by memorizing which squares on a grid are highlighted, then selecting them from memory. The grid grows larger and adds more highlighted squares each level.',
      howTo: [
        'Click "Start" to begin the test.',
        'A grid of squares will appear with some squares briefly highlighted.',
        'After the highlights disappear, click the squares that were highlighted.',
        'If you correctly identify enough squares, the grid expands for the next level.',
        'Three mistakes end the test.'
      ],
      whatItMeasures: 'This test tracks your visual-spatial short-term memory: the ability to remember the locations of items in a two-dimensional layout. As the grid expands from 3×3 to larger sizes, the test increasingly challenges your spatial encoding capacity.',
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
      whyUseIt: 'Maze games provide a fun way to exercise spatial reasoning and planning. This game also works well for testing keyboard input responsiveness: if arrow keys or WASD controls do not respond properly, it may indicate a keyboard input issue.',
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
      { q: 'Is the maze the same every time?', a: 'No: each maze is procedurally generated, so you get a unique layout every time you start a new game.' },
      { q: 'Can I play the maze game on mobile?', a: 'Yes. Use the on-screen D-Pad touch buttons to navigate Nibbles through the maze on phones and tablets.' }
    ]
  },
  'card-memory-game': {
    titleKey: 'cardMemoryTitle',
    desc: 'Flip 3D cat-themed cards to find all 8 matching pairs in the fewest turns possible.',
    icon: '🎴',
    category: 'games',
    content: {
      intro: 'A classic card matching game with cat-themed 3D flip animations. Flip two cards at a time to find matching pairs: complete all 8 matches using as few turns as possible.',
      howTo: [
        'Cards are laid out face-down in a 4×4 grid.',
        'Click any card to flip it and reveal its cat image.',
        'Click a second card to check for a match.',
        'If the two cards match, they stay face-up. If not, both flip back.',
        'Continue until you have matched all 8 pairs.'
      ],
      whatItMeasures: 'This game tests your visual recognition memory: your ability to remember the positions and identities of previously seen cards. Fewer turns to complete the game indicates stronger visual recall.',
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
      { q: 'What is the best possible score?', a: 'The minimum number of turns to complete the game is 8: one perfect match per turn with no mistakes.' },
      { q: 'Does this game work on touchscreens?', a: 'Yes. Tap cards on your phone or tablet to flip them. The 3D flip animation works on all modern mobile browsers.' }
    ]
  },
  'cat-mini-golf-game': {
    titleKey: 'catMiniGolfTitle',
    desc: 'HTML5 Canvas 2D Physics Mini Golf with 18 holes, dynamic weather, wind, strategic sand traps, water hazards, kinetic windmills, and portals!',
    icon: '⛳',
    category: 'games',
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
        'Avoid sand traps: they slow the ball significantly with heavy drag.'
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
    content: {
      intro: 'Join Nibbles the Cat on a 2D fishing adventure. Cast your lure into the ocean, attract fish by dragging it underwater, and complete a reeling mini-game to catch 6 different species of fish.',
      howTo: [
        'Click "Cast Lure" to throw your fishing line into the ocean.',
        'Click and drag your lure underwater to attract nearby fish.',
        'Wait for a fish to bite: you will see a "BITE! HOOKED!" indicator.',
        'Rapidly press the "Reel" button or Spacebar to keep the tension in the green zone.',
        'Successfully reel in the fish to earn points based on the species.'
      ],
      whatItMeasures: 'This game combines mouse coordination (lure steering), reaction time (responding to bites), and rapid clicking (reeling mini-game). It is primarily an entertainment game rather than a formal test.',
      whyUseIt: 'The fishing game provides an entertaining way to practice mouse dragging precision and rapid clicking. The reeling mini-game is also a fun coordination challenge.',
      interpretResults: 'Points are scored based on the rarity and value of fish caught. Silver Minnow (100 pts), Orange Clownfish (250 pts), Spiky Pufferfish (400 pts), Golden Koi (750 pts), Legendary Rainbow Fish (1500 pts), and Brown Mudfish (50 pts).',
      tips: [
        'Move your lure slowly and steadily to attract fish: erratic movement can scare them away.',
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
    content: {
      intro: 'Slice flying fruits by swiping your mouse or finger across the screen. Score points with each slice, chain multi-fruit combos for bonus multipliers, and avoid letting fruits fall unsliced.',
      howTo: [
        'Click or tap "Start" to begin the game.',
        'Fruits will fly upward from the bottom of the screen.',
        'Click and drag your mouse (or swipe your finger) across fruits to slice them.',
        'Slice multiple fruits in one swipe for combo multiplier bonuses.',
        'Avoid letting fruits fall past the bottom unsliced: each missed fruit costs one life.'
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
    content: {
      intro: 'Measure your typing speed in Words Per Minute (WPM) and accuracy with a clean, distraction-free test interface. Featuring synthesized mechanical keyboard sounds and live feedback as you type.',
      howTo: [
        'Select a test duration (15s, 30s, or 60s).',
        'Start typing the displayed text: the timer begins with your first keystroke.',
        'Correct characters are highlighted green; mistakes are highlighted red.',
        'Your live WPM and accuracy update in real-time as you type.',
        'After the timer ends, your final WPM, accuracy, and character counts are displayed.'
      ],
      whatItMeasures: 'This test tracks your typing speed (WPM: Words Per Minute) and accuracy percentage. WPM is calculated using the standard measurement where one "word" equals 5 characters, including spaces. Accuracy is the percentage of correct keystrokes out of total keystrokes.',
      whyUseIt: 'Knowing your typing speed is useful for job applications that require a minimum WPM, academic assessments, personal improvement tracking, or simply curiosity. Regular practice with typing tests can measurably improve your speed and accuracy over time.',
      interpretResults: 'Under 30 WPM is considered slow. 30–50 WPM is average for casual typists. 50–80 WPM is above average and typical for office workers. 80–120 WPM is fast. 120+ WPM is professional or competitive level. Accuracy above 95% is considered good.',
      tips: [
        'Focus on accuracy first: speed comes naturally with correct technique.',
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
        'Right-click inside the test area: the tool prevents the context menu so you can test MB2 freely.',
        'If side buttons (MB4/MB5) do not register, your browser or operating system may be intercepting those buttons for navigation.',
        'Test each button individually to isolate any issues.',
        'Compare behavior across different browsers if a button seems unresponsive.'
      ],
      relatedTools: ['double-click-test', 'keyboard-test', 'click-speed-test', 'cps-test']
    },
    faqs: [
      { q: 'Which mouse buttons can I test?', a: 'You can test Left Click (MB1), Right Click (MB2), Middle Click (MB3/Wheel), Side Button 4 (Back), Side Button 5 (Forward), and Scroll Wheel direction.' },
      { q: 'How to check if my mouse right click or side buttons work?', a: 'Click anywhere inside our interactive mouse visualizer. The corresponding mouse button will glow cyan in real time if functioning properly.' },
      { q: 'Can this tool detect mouse hardware damage?', a: 'This tool can confirm whether button presses are registering in the browser. If a button does not register at all, the switch may be faulty. However, the tool cannot diagnose internal hardware issues like degraded switches or sensor problems: only whether button events reach the browser.' },
      { q: 'Why won\'t my side buttons register?', a: 'Some browsers and operating systems intercept MB4 and MB5 for back/forward navigation. Try testing in a different browser, or check your mouse driver software for button remapping settings.' }
    ]
  },
  'keyboard-test': {
    titleKey: 'keyboardTestTitle',
    desc: 'Interactive visual keyboard key tester. Press any key to see real-time highlight feedback, event keycode logging, and modifier status.',
    icon: '🖥️',
    category: 'hardware',
    content: {
      intro: 'Press any key on your physical keyboard to see it highlighted on an interactive on-screen keyboard layout. This tool logs key events, key codes, and modifier key states in real-time to help you verify that every key on your keyboard is working correctly.',
      howTo: [
        'Click inside the test area to make sure it has focus.',
        'Press any key on your physical keyboard.',
        'The corresponding key on the visual keyboard layout will highlight.',
        'Check the event log below for detailed key code and event information.',
        'Test all keys you want to verify: especially modifier keys (Shift, Ctrl, Alt).'
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
      { q: 'Can I test a mechanical keyboard?', a: 'Yes. Mechanical keyboards work the same way through browser keyboard events. You can also use this tool to verify key rollover: press multiple keys simultaneously to see how many register at once.' },
      { q: 'Why is key testing important for gaming and typing?', a: 'Key testing helps verify key rollover (NKRO), ghosting, and faulty key switches on mechanical or membrane keyboards.' }
    ]
  },
  'auto-clicker': {
    titleKey: 'autoClickerTitle',
    desc: 'Free online auto clicker running directly in your browser. Set click intervals, target counts, and hotkeys with zero software downloads.',
    icon: '🎯',
    category: 'clicking',
    content: {
      intro: 'A browser-based auto clicker that simulates rapid mouse clicks within the page. Configure click interval, total click count, and start/stop hotkeys: all without downloading or installing any software.',
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
        'This tool only clicks within the browser page: it cannot click outside the browser window.',
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
      { q: 'Why is my CPS different on 1-second vs. 10-second tests?', a: 'Short-duration tests measure burst speed: your fastest possible rate for a brief moment. Longer tests measure sustained clicking speed, which is usually lower due to fatigue.' }
    ]
  },
  'click-speed-test': {
    titleKey: 'speedTestTitle',
    desc: 'Measure your click velocity, burst speed, and clicking consistency with real-time analytics and dynamic speed gauges.',
    icon: '🚀',
    category: 'speed',
    content: {
      intro: 'Analyze your clicking performance with real-time speed gauges that track velocity, burst speed, and consistency. Unlike a simple CPS counter, this tool provides detailed analytics about the timing between your clicks.',
      howTo: [
        'Click "Start" to begin the click speed analysis.',
        'Click rapidly in the test area.',
        'Watch the real-time speed gauges update with each click.',
        'The tool tracks your average speed, burst speed, and clicking consistency.',
        'Review your detailed analytics when you finish.'
      ],
      whatItMeasures: 'This tool tests the time intervals between consecutive clicks and calculates average click velocity, peak burst speed, and clicking consistency (how uniform your click timing is).',
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
      whyUseIt: 'Use the click counter as a digital tally counter for anything that needs counting: inventory items, exercise reps, event attendees, or any situation where you need a reliable running count with accessible input methods.',
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
    content: {
      intro: 'Test your double-click speed and check for mouse button "chatter": a common hardware fault where a single click accidentally registers as two clicks due to a worn-out micro-switch.',
      howTo: [
        'Click inside the test area.',
        'The tool records the time interval between consecutive clicks in milliseconds.',
        'Intentionally double-click to see your natural double-click speed.',
        'To test for chatter, click once firmly and check if a second click registers unintentionally.',
        'Intervals under 40–50ms on a single click likely indicate switch chatter.'
      ],
      whatItMeasures: 'We track the exact time between your clicks. This helps catch intentional double-clicks and accidental chatter: false double-clicks caused by degraded micro-switches.',
      whyUseIt: 'If your mouse is getting old, it might start double-clicking on its own. This tool helps you figure out if your mouse switch is actually failing.',
      interpretResults: 'Intentional double-clicks typically register between 60–200ms apart. If you see intervals under 40ms when you are only clicking once, your mouse switch may be "chattering": registering false double-clicks due to mechanical wear. Consistent chatter under 20ms strongly suggests a failing micro-switch.',
      tips: [
        'Click firmly and deliberately with single clicks to test for chatter: do not try to double-click.',
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
  },
  'cat-typing-dungeon': {
    titleKey: 'Cat Typing Dungeon',
    desc: 'A mobile typing game where you fight through a dungeon by typing words as fast as you can to build combos and earn rewards.',
    icon: '⚔️',
    category: 'games',
    content: {
      intro: 'Type fast to defeat monsters and explore the Cat Typing Dungeon. Choose your path, grab upgrades along the way, and try to take down the final boss.',
      howTo: [
        'Select a cat to start your run.',
        'Choose paths on the map to navigate through the dungeon.',
        'During combat, type the displayed words before the timer runs out.',
        'Chain successful words to build a combo and trigger passive effects.',
        'Visit shops and chests to unlock powerful run-changing passive upgrades.',
        'Defeat the boss at the end of the dungeon to win!'
      ],
      whatItMeasures: 'The game exercises a combination of rapid reading, hand-eye coordination, typing speed, typing accuracy, and working memory as you balance reading enemy mechanics with executing keystrokes under time pressure.',
      whyUseIt: 'Unlike traditional typing tests, this is an actual game. It builds typing speed and accuracy under chaotic, gamified pressure. It makes typing practice addicting.',
      interpretResults: 'Defeating the boss signifies a successful run. Your final score is determined by enemies defeated, words typed, accuracy, gold gathered, and max combo achieved.',
      tips: [
        'Prioritize accuracy over raw speed: breaking a combo and taking a hit from a missed word is punishing.',
        'Read the enemy mechanic before typing: some enemies steal gold, obscure words, or require armor breaking.',
        'Synergize your passives. For example, a combo-healing passive works great with a cat class that starts with bonus combo.',
        'Try Endless Mode after a victory for an ever-increasing challenge!'
      ],
      relatedTools: ['typing-test', 'aim-trainer-test']
    },
    faqs: [
      { q: 'How does the typing combat work?', a: 'Every enemy displays a word. You must type the word correctly before the timer bar drains. A successful word triggers an attack. A failed word breaks your combo and gives the enemy an opening.' },
      { q: 'Can I play this on a mobile phone?', a: 'Yes! The game is explicitly designed to be mobile-first. Tap the input box and use your phone\'s native keyboard to type the words.' },
      { q: 'What do the passives do?', a: 'Passives are upgrades you get from shops and chests. They modify the game rules - giving you more time, bonus damage, healing, or special abilities like ignoring a mistake.' }
    ]
  }
};
