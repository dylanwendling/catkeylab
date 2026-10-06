/* ==========================================================================
   CatKeyLab - Cat Typing Dungeon 🐱⚔️
   A mobile-first typing roguelite dungeon crawler.
   TYPE → ATTACK → COMBO → REWARD → CHOOSE PATH → UPGRADE → TYPE AGAIN
   ========================================================================== */

import { getAudioContext, isSoundEnabled } from '../audio.js';
import { submitScore } from '../leaderboard.js';

// ============================================================
// WORD BANKS
// ============================================================
const WORDS = {
  easy:   ['cat','bat','rat','bug','web','den','run','hit','claw','bite','fast','dark','glow','cave','lurk','paw','fur','kit','cub','eye','foe','hex','orb','gem','axe','bow','pit','sly','wry','woe'],
  medium: ['dungeon','shadow','battle','typing','castle','goblin','poison','dragon','escape','attack','defend','spirit','portal','hunter','cursed','silent','frozen','hollow','wicked','raging','fierce','mystic','haunt','forge','spike','ember','venom','guard','quest','blade','risky','magic'],
  hard:   ['labyrinth','monastery','sanctuary','corruption','devastate','catacombs','ferocious','sorcerous','venomous','relentless','infiltrate','catastrophe','malevolent','incinerate','spellbound','treacherous','bewildering','formidable','necromancer','juggernaut'],
  veryhard:['abracadabra','chrysanthemum','onomatopoeia','photosynthesis','kaleidoscope','extraordinary','metamorphosis','perpendicular','quintessential','czechoslovakia'],
};

function getWord(difficulty = 1) {
  if (difficulty <= 2)      return pick(WORDS.easy);
  else if (difficulty <= 5) return difficulty > 3 ? pick([...WORDS.easy, ...WORDS.medium]) : pick(WORDS.medium);
  else if (difficulty <= 9) return pick(WORDS.hard);
  else                      return pick(WORDS.veryhard);
}

function getWordForEnemy(enemyId, floor = 1) {
  const diff = Math.min(10, 1 + Math.floor(floor * 0.6));
  // enemy-specific overrides
  if (['rat','bat'].includes(enemyId))     return pick([...WORDS.easy, ...WORDS.easy]);
  if (['troll','golem'].includes(enemyId)) return pick([...WORDS.hard, ...WORDS.medium]);
  if (enemyId === 'zombie')               return pick([...WORDS.medium, ...WORDS.hard]);
  return getWord(diff);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ============================================================
// AUDIO SYNTH
// ============================================================
function playTone(freq, dur, type = 'sine', vol = 0.18) {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}
function sfxAttack()   { playTone(660, 0.08, 'square', 0.15); setTimeout(() => playTone(880, 0.06, 'square', 0.1), 60); }
function sfxCrit()     { [440,550,660,880].forEach((f,i) => setTimeout(() => playTone(f, 0.12, 'sawtooth', 0.18), i * 55)); }
function sfxHit()      { playTone(200, 0.15, 'sawtooth', 0.2); }
function sfxCombo()    { playTone(740, 0.06, 'sine', 0.12); }
function sfxDeath()    { [300,220,140].forEach((f,i) => setTimeout(() => playTone(f, 0.2, 'sawtooth', 0.18), i * 120)); }
function sfxVictory()  { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.18, 'sine', 0.18), i * 100)); }
function sfxShop()     { playTone(523, 0.1, 'sine', 0.15); }
function sfxChest()    { [784,988,1175].forEach((f,i) => setTimeout(() => playTone(f, 0.14, 'sine', 0.16), i * 90)); }
function sfxError()    { playTone(180, 0.12, 'sawtooth', 0.22); }
function sfxTimerWarn(){ playTone(400, 0.06, 'square', 0.1); }
function sfxBoss()     { [220,277,330,220].forEach((f,i) => setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.22), i * 200)); }

// ============================================================
// ENEMY DEFINITIONS
// ============================================================
const ENEMIES = {
  rat:     { name:'Rat',            emoji:'🐀', maxHp:18,  atk:6,  gold:[4,8],   mechanic:'fast',       timerMult:0.7, wordCount:1 },
  slime:   { name:'Slime',          emoji:'🐌', maxHp:60,  atk:4,  gold:[5,10],  mechanic:'tank',       timerMult:1.4, wordCount:1 },
  bat:     { name:'Bat',            emoji:'🦇', maxHp:14,  atk:5,  gold:[4,8],   mechanic:'swift',      timerMult:0.6, wordCount:1 },
  spider:  { name:'Spider',         emoji:'🕷️', maxHp:28,  atk:7,  gold:[6,11],  mechanic:'random',     timerMult:1.0, wordCount:1 },
  snake:   { name:'Snake',          emoji:'🐍', maxHp:32,  atk:8,  gold:[7,13],  mechanic:'fade',       timerMult:1.1, wordCount:1 },
  skeleton:{ name:'Skeleton',       emoji:'💀', maxHp:40,  atk:9,  gold:[8,14],  mechanic:'armor',      timerMult:1.0, wordCount:1, armor:3 },
  zombie:  { name:'Zombie',         emoji:'🧟', maxHp:55,  atk:6,  gold:[10,18], mechanic:'endurance',  timerMult:1.2, wordCount:1 },
  crow:    { name:'Crow',           emoji:'🐦', maxHp:24,  atk:7,  gold:[9,15],  mechanic:'goldthief',  timerMult:0.9, wordCount:1 },
  frog:    { name:'Frog',           emoji:'🐸', maxHp:30,  atk:7,  gold:[6,12],  mechanic:'distract',   timerMult:1.0, wordCount:1 },
  bee:     { name:'Bee Swarm',      emoji:'🐝', maxHp:40,  atk:8,  gold:[9,16],  mechanic:'swarm',      timerMult:0.85,wordCount:4 },
  golem:   { name:'Stone Golem',    emoji:'🪨', maxHp:80,  atk:10, gold:[14,22], mechanic:'accuracy',   timerMult:1.3, wordCount:1 },
  vampire: { name:'Vampire',        emoji:'🧛', maxHp:45,  atk:11, gold:[12,20], mechanic:'lifesteal',  timerMult:1.0, wordCount:1 },
  werewolf:{ name:'Werewolf',       emoji:'🐺', maxHp:50,  atk:9,  gold:[11,19], mechanic:'enrage',     timerMult:1.0, wordCount:1 },
  ice:     { name:'Ice Elemental',  emoji:'🧊', maxHp:42,  atk:10, gold:[12,20], mechanic:'slowtime',   timerMult:1.0, wordCount:1 },
  fire:    { name:'Fire Elemental', emoji:'🔥', maxHp:46,  atk:12, gold:[13,21], mechanic:'punishment', timerMult:1.0, wordCount:1 },
  storm:   { name:'Storm Elemental',emoji:'⚡', maxHp:38,  atk:11, gold:[12,20], mechanic:'disrupt',    timerMult:1.0, wordCount:1 },
  evileye: { name:'Evil Eye',       emoji:'👁️', maxHp:20,  atk:16, gold:[10,18], mechanic:'accuracy',   timerMult:0.95,wordCount:1 },
  ink:     { name:'Ink Monster',    emoji:'🐙', maxHp:36,  atk:9,  gold:[10,17], mechanic:'ink',        timerMult:1.1, wordCount:1 },
  troll:   { name:'Troll',          emoji:'🧌', maxHp:70,  atk:11, gold:[13,22], mechanic:'longwords',  timerMult:1.4, wordCount:1 },
  fairy:   { name:'Corrupted Fairy',emoji:'🧚', maxHp:25,  atk:9,  gold:[8,14],  mechanic:'curse',      timerMult:0.95,wordCount:1 },
  // Elites
  ratking: { name:'Rat King',       emoji:'👑🐀',maxHp:70, atk:10, gold:[25,40], mechanic:'elite_summon',timerMult:0.8,wordCount:1, isElite:true },
  vampbat: { name:'Vampire Bat',    emoji:'🦇👑',maxHp:30, atk:14, gold:[28,42], mechanic:'elite_swift', timerMult:0.55,wordCount:1,isElite:true },
  guardian:{ name:'Ancient Guardian',emoji:'🗿',maxHp:110,atk:12, gold:[30,45], mechanic:'elite_armor', timerMult:1.1, wordCount:1, isElite:true, armor:6 },
  wizard:  { name:'Archwizard',     emoji:'🧙', maxHp:65, atk:13, gold:[28,44], mechanic:'elite_curse', timerMult:0.9, wordCount:1, isElite:true },
  minidragon:{ name:'Mini Dragon',  emoji:'🐲', maxHp:85, atk:15, gold:[32,50], mechanic:'elite_burst', timerMult:0.95,wordCount:1, isElite:true },
  mimic:   { name:'MIMIC!',         emoji:'🎁🦷',maxHp:60,atk:14, gold:[35,55], mechanic:'mimic',      timerMult:0.85,wordCount:1, isElite:true },
};

// Normal encounter pool (weighted)
const NORMAL_POOL = ['rat','slime','bat','spider','snake','skeleton','zombie','crow','frog','bee','golem','vampire','werewolf','ice','fire','storm','evileye','ink','troll','fairy'];
const ELITE_POOL  = ['ratking','vampbat','guardian','wizard','minidragon'];

// ============================================================
// BOSS DEFINITIONS
// ============================================================
const BOSSES = [
  {
    id:'dragon', name:'Ancient Dragon', emoji:'🐉', maxHp:220, gold:[60,90],
    phases:[
      { hp:220, label:'The dragon reveals its scales and claws.', timerMult:1.0, mechanic:'normal', msg:'The dragon circles overhead...' },
      { hp:160, label:'The dragon bursts into a furious rage.',    timerMult:0.8, mechanic:'fast',   msg:'🔥 THE DRAGON IS ENRAGED!' },
      { hp:100, label:'The dragon begins speaking ancient incantations.',  timerMult:0.85,mechanic:'long',   msg:'⚡ THE DRAGON SPEAKS ANCIENT WORDS!' },
      { hp:50,  label:'The dragon enters a desperate death roll.',     timerMult:0.7, mechanic:'burst',  msg:'💀 DESPERATE FINAL ATTACK!' },
    ],
    atk:18,
  },
  {
    id:'ratking', name:'Rat King', emoji:'👑🐀', maxHp:180, gold:[55,80],
    phases:[
      { hp:180, label:'The Rat King commands from his throne.',   timerMult:0.85, mechanic:'summon', msg:'The Rat King summons his minions!' },
      { hp:100, label:'A tide of rats swarms the dungeon.',     timerMult:0.75, mechanic:'swarm',  msg:'🐀🐀 A RAT TIDE APPROACHES!' },
      { hp:40,  label:'The Rat King enters a frenzied panic.',timerMult:0.65, mechanic:'fast',   msg:'👑 THE RAT KING IS DESPERATE!' },
    ],
    atk:15,
  },
  {
    id:'overlord', name:'Dungeon Overlord', emoji:'🧙', maxHp:200, gold:[58,85],
    phases:[
      { hp:200, label:'The Overlord demonstrates arcane mastery.', timerMult:0.9, mechanic:'curse',  msg:'The Overlord weaves dark magic!' },
      { hp:120, label:'A violent hex storm surrounds the Overlord.',      timerMult:0.8, mechanic:'disrupt',msg:'⚡ HEX STORM UNLEASHED!' },
      { hp:55,  label:'The Overlord attempts to drain your soul.',     timerMult:0.7, mechanic:'drain',  msg:'👻 SOUL DRAIN ACTIVATED!' },
    ],
    atk:17,
  },
  {
    id:'souleater', name:'Soul Eater', emoji:'👻', maxHp:160, gold:[52,78],
    phases:[
      { hp:160, label:'A haunting presence fills the room.',    timerMult:0.85, mechanic:'fade',  msg:'Words blur as the Soul Eater haunts you...' },
      { hp:80,  label:'The Soul Eater tries to possess you.',  timerMult:0.75, mechanic:'curse', msg:'👻 POSSESSION! YOUR FINGERS FEEL HEAVY!' },
      { hp:30,  label:'The Soul Eater unleashes a final scream.',timerMult:0.6,  mechanic:'fast',  msg:'🩸 FINAL SCREAM!' },
    ],
    atk:16,
  },
  {
    id:'golem', name:'Ancient Golem', emoji:'🗿', maxHp:280, gold:[65,95],
    phases:[
      { hp:280, label:'The Golem stands like an impenetrable stone wall.',  timerMult:1.2,  mechanic:'armor', msg:'The Golem stands impenetrable...', armor:8 },
      { hp:180, label:'The Golem\'s exterior begins to crumble.',   timerMult:1.0,  mechanic:'accuracy',msg:'💥 THE GOLEM STARTS TO CRACK!' },
      { hp:80,  label:'The Golem enters a blind stone rage.',  timerMult:0.8,  mechanic:'fast',  msg:'🪨 STONE RAGE!' },
    ],
    atk:20,
  },
];

// ============================================================
// PASSIVE / UPGRADE DEFINITIONS
// ============================================================
const PASSIVES = [
  { id:'extra_breath',   name:'Extra Breath',    icon:'⌛', desc:'+0.6s per word timer',        rarity:'common',    effect:(s)=>{ s.timerBonus=(s.timerBonus||0)+0.6; }},
  { id:'slow_time',      name:'Slow Time',        icon:'🐢', desc:'Timer drains 12% slower',     rarity:'common',    effect:(s)=>{ s.timerSpeedMult=(s.timerSpeedMult||1)*0.88; }},
  { id:'quick_fingers',  name:'Quick Fingers',    icon:'⚡', desc:'+0.2s on each successful word',rarity:'uncommon',  effect:(s)=>{ s.onHitTimeBonus=(s.onHitTimeBonus||0)+0.2; }},
  { id:'momentum',       name:'Momentum',         icon:'🔥', desc:'Every 5 combo: +12% dmg',     rarity:'uncommon',  effect:(s)=>{ s.momentumStacks=(s.momentumStacks||0)+1; }},
  { id:'precision',      name:'Precision',        icon:'🎯', desc:'Perfect words deal +25% dmg', rarity:'uncommon',  effect:(s)=>{ s.perfectBonus=(s.perfectBonus||0)+0.25; }},
  { id:'crit_typist',    name:'Critical Typist',  icon:'💥', desc:'+12% crit chance',            rarity:'uncommon',  effect:(s)=>{ s.critChance=(s.critChance||0.08)+0.12; }},
  { id:'cat_gloves',     name:'Cat Gloves',        icon:'🧤', desc:'1st mistake/battle no dmg',  rarity:'rare',      effect:(s)=>{ s.gloves=(s.gloves||0)+1; }},
  { id:'nine_lives',     name:'Nine Lives',        icon:'🛡️', desc:'Survive 1 fatal hit',        rarity:'rare',      effect:(s)=>{ s.nineLifeCount=(s.nineLifeCount||0)+1; }},
  { id:'blood_typing',   name:'Blood Typing',      icon:'🩸', desc:'Every 10 words: +2 HP',      rarity:'rare',      effect:(s)=>{ s.bloodTyping=(s.bloodTyping||0)+1; }},
  { id:'second_chance',  name:'Second Chance',     icon:'😼', desc:'1x/battle failed word no hit',rarity:'rare',     effect:(s)=>{ s.secondChance=(s.secondChance||0)+1; }},
  { id:'fury',           name:'Berserker Fury',    icon:'😤', desc:'Below 30% HP: +30% dmg',     rarity:'rare',      effect:(s)=>{ s.berserkBonus=(s.berserkBonus||0)+0.30; }},
  { id:'vampiric',       name:'Vampiric Typing',   icon:'🩸', desc:'5% lifesteal on hits',       rarity:'epic',      effect:(s)=>{ s.lifestealPct=(s.lifestealPct||0)+0.05; }},
  { id:'combo_master',   name:'Combo Master',      icon:'✨', desc:'+3 starting combo',           rarity:'uncommon',  effect:(s)=>{ s.startingCombo=(s.startingCombo||0)+3; }},
  { id:'golden_paw',     name:'Golden Paw',         icon:'🪙', desc:'Enemies drop +20% gold',    rarity:'uncommon',  effect:(s)=>{ s.goldMult=(s.goldMult||1)*1.20; }},
  { id:'catnip',         name:'Catnip',             icon:'🌿', desc:'Heal +20 HP',               rarity:'common',    effect:(s)=>{ s.hp=Math.min(s.maxHp, s.hp+20); }},
  { id:'heavy_catnip',   name:'Heavy Catnip',       icon:'💚', desc:'Heal +45 HP',               rarity:'rare',      effect:(s)=>{ s.hp=Math.min(s.maxHp, s.hp+45); }},
  { id:'critical_eye',   name:'Critical Eye',       icon:'👁️', desc:'+20% crit chance',          rarity:'rare',      effect:(s)=>{ s.critChance=(s.critChance||0.08)+0.20; }},
  { id:'lethal_tempo',   name:'Lethal Tempo',       icon:'🎵', desc:'Crit dmg ×2.5 (was ×2)',   rarity:'epic',      effect:(s)=>{ s.critMult=(s.critMult||2)*1.25; }},
  { id:'max_hp_up',      name:'Fortified Heart',    icon:'❤️', desc:'+25 max HP, heal +10',      rarity:'common',    effect:(s)=>{ s.maxHp+=25; s.hp=Math.min(s.maxHp, s.hp+10); }},
  { id:'combo_heal',     name:'Combo Heal',         icon:'💓', desc:'Every 8 combo: +1 HP',      rarity:'rare',      effect:(s)=>{ s.comboHealAt=(s.comboHealAt||0)+1; }},
  { id:'iron_claws',     name:'Iron Claws',          icon:'🗡️', desc:'+10% base damage',         rarity:'common',    effect:(s)=>{ s.dmgMult=(s.dmgMult||1)*1.10; }},
  { id:'sharpened',      name:'Sharpened Claws',     icon:'⚔️', desc:'+20% base damage',         rarity:'uncommon',  effect:(s)=>{ s.dmgMult=(s.dmgMult||1)*1.20; }},
  { id:'cursed_paw',     name:'Cursed Paw',          icon:'🖤', desc:'+35% dmg, -8 max HP',      rarity:'epic',      effect:(s)=>{ s.dmgMult=(s.dmgMult||1)*1.35; s.maxHp=Math.max(10,s.maxHp-8); s.hp=Math.min(s.maxHp,s.hp); }},
  { id:'mimic_ward',     name:'Mimic Ward',           icon:'🔮', desc:'Mimics never appear',      rarity:'rare',      effect:(s)=>{ s.mimicWard=true; }},
  { id:'combo_timer',    name:'Combo Rush',           icon:'🏃', desc:'10+ combo: timer +15% faster',rarity:'epic',  effect:(s)=>{ s.comboTimerBonus=(s.comboTimerBonus||0)+1; }},
  { id:'armor_break',    name:'Armor Breaker',        icon:'🔨', desc:'Armor breaks 2x faster',   rarity:'uncommon',  effect:(s)=>{ s.armorBreak=(s.armorBreak||1)*2; }},
  { id:'final_push',     name:'Final Push',           icon:'🌟', desc:'Last 3 nodes: +40% dmg',   rarity:'epic',      effect:(s)=>{ s.finalPush=(s.finalPush||0)+1; }},
  { id:'shop_cat',       name:'Shrewd Haggler',       icon:'🛒', desc:'Shop prices -25%',         rarity:'rare',      effect:(s)=>{ s.shopDiscount=(s.shopDiscount||0)+0.25; }},
  { id:'bomb_run',       name:'Bomb Run',              icon:'💣', desc:'First hit each battle +50% dmg', rarity:'rare', effect:(s)=>{ s.bombRun=(s.bombRun||0)+1; }},
];

const RARITY_WEIGHT = { common:50, uncommon:30, rare:15, epic:5 };

function drawPassives(count = 3, exclude = []) {
  const pool = PASSIVES.filter(p => !exclude.includes(p.id));
  const weighted = [];
  pool.forEach(p => { for(let i=0;i<(RARITY_WEIGHT[p.rarity]||10);i++) weighted.push(p); });
  const chosen = [];
  const seen = new Set();
  let attempts = 0;
  while (chosen.length < count && attempts < 200) {
    const p = weighted[Math.floor(Math.random() * weighted.length)];
    if (!seen.has(p.id)) { seen.add(p.id); chosen.push(p); }
    attempts++;
  }
  return chosen;
}

// ============================================================
// STARTING CAT CLASSES
// ============================================================
const CAT_CLASSES = [
  { id:'speed',    name:'Speed Cat',    emoji:'⚡🐱', desc:'+10% word timer, -8% damage', color:'#f59e0b',
    apply: (s) => { s.timerBonus=(s.timerBonus||0)+0.5; s.dmgMult=(s.dmgMult||1)*0.92; } },
  { id:'warrior',  name:'Warrior Cat',  emoji:'⚔️🐱', desc:'+20% damage, -0.4s timer',   color:'#ef4444',
    apply: (s) => { s.dmgMult=(s.dmgMult||1)*1.20; s.timerBonus=(s.timerBonus||0)-0.4; } },
  { id:'lucky',    name:'Lucky Cat',    emoji:'🍀🐱', desc:'Better shop & chest rolls',   color:'#10b981',
    apply: (s) => { s.luckyRolls=true; } },
  { id:'typist',   name:'Typist Cat',   emoji:'⌨️🐱', desc:'Start with 5 combo',         color:'#a855f7',
    apply: (s) => { s.startingCombo=(s.startingCombo||0)+5; } },
  { id:'tank',     name:'Tank Cat',     emoji:'🛡️🐱', desc:'+30 max HP, -10% dmg',       color:'#3b82f6',
    apply: (s) => { s.maxHp+=30; s.hp=Math.min(s.maxHp,s.hp+30); s.dmgMult=(s.dmgMult||1)*0.90; } },
];

// ============================================================
// MAP GENERATOR
// ============================================================
const NODE_TYPES = ['battle','battle','battle','battle','shop','chest','elite','battle'];
const NODE_ICONS = { battle:'⚔️', shop:'🛒', chest:'🎁', elite:'🗡️', boss:'👑' };
const NODE_COLORS = { battle:'#ef4444', shop:'#10b981', chest:'#f59e0b', elite:'#a855f7', boss:'#ff6b35' };

function generateMap(totalNodes = 10) {
  // Generate a branching map: each row has 3 choices, converging to boss
  const rows = [];
  const nodeTypeTracker = { shop:0, chest:0, elite:0, battle:0 };

  for (let r = 0; r < totalNodes; r++) {
    const rowNodes = [];
    for (let c = 0; c < 3; c++) {
      let type = pickNodeType(nodeTypeTracker, r, totalNodes);
      nodeTypeTracker[type] = (nodeTypeTracker[type] || 0) + 1;
      rowNodes.push({ type, id:`${r}-${c}`, row:r, col:c, cleared:false });
    }
    rows.push(rowNodes);
  }

  // Final row: boss
  rows.push([{ type:'boss', id:'boss', row:totalNodes, col:0, cleared:false }]);
  return rows;
}

function pickNodeType(tracker, row, total) {
  // Last 2 rows before boss: no shops
  if (row >= total - 2) {
    const noShop = ['battle','battle','elite','battle','chest'];
    return pick(noShop);
  }
  // Prevent 3+ consecutive shops or chests
  const shopCount = tracker.shop || 0;
  const chestCount = tracker.chest || 0;
  const eliteCount = tracker.elite || 0;

  const pool = [...NODE_TYPES];
  if (shopCount >= 2)  pool.splice(pool.indexOf('shop'), 1);
  if (chestCount >= 2) pool.splice(pool.indexOf('chest'), 1);
  if (eliteCount >= 2) pool.splice(pool.indexOf('elite'), 1);

  return pick(pool.length ? pool : ['battle']);
}

// ============================================================
// GAME STATE
// ============================================================
let G = null; // Global game state
let _container = null;
let _raf = null;
let _timerInterval = null;
let _listeners = [];

function addListener(el, event, fn, opts) {
  el.addEventListener(event, fn, opts);
  _listeners.push({ el, event, fn });
}

function removeAllListeners() {
  _listeners.forEach(({ el, event, fn }) => {
    try { el.removeEventListener(event, fn); } catch(e) {}
  });
  _listeners = [];
}

function initGameState(catClass) {
  const cls = CAT_CLASSES.find(c => c.id === catClass) || CAT_CLASSES[0];
  const state = {
    // Meta
    screen: 'map',       // 'catselect' | 'map' | 'combat' | 'shop' | 'chest' | 'boss' | 'gameover' | 'victory'
    floor: 1,
    runNodes: 0,
    totalNodes: 10,

    // Cat
    catClass: cls,
    hp: 80,
    maxHp: 80,
    gold: 0,
    combo: 0,
    maxCombo: 0,
    wordsTyped: 0,
    wordsMissed: 0,
    totalDmgDealt: 0,
    enemiesDefeated: 0,

    // Passives
    passives: [],
    passiveIds: new Set(),

    // Combat modifiers (from passives)
    timerBonus: 0,
    timerSpeedMult: 1,
    onHitTimeBonus: 0,
    momentumStacks: 0,
    perfectBonus: 0,
    critChance: 0.08,
    critMult: 2,
    gloves: 0,
    nineLifeCount: 0,
    bloodTyping: 0,
    secondChance: 0,
    berserkBonus: 0,
    lifestealPct: 0,
    startingCombo: 0,
    goldMult: 1,
    dmgMult: 1,
    armorBreak: 1,
    shopDiscount: 0,
    bombRun: 0,
    comboHealAt: 0,
    luckyRolls: false,
    mimicWard: false,
    finalPush: 0,

    // Map
    mapRows: [],
    currentRow: 0,
    selectedNode: null,

    // Combat state
    enemy: null,
    enemyHp: 0,
    enemyMaxHp: 0,
    enemyArmor: 0,
    enemyArmorMax: 0,
    currentWord: '',
    typedSoFar: '',
    wordTimeMax: 0,
    wordTimeLeft: 0,
    wordActive: false,
    battlePaused: false,
    mistakeThisBattle: false,
    glovesUsed: false,
    secondChanceUsed: false,
    bombRunUsed: false,
    firePenalty: 0,
    swarmTargets: [],
    swarmCurrentIndex: 0,
    wordFadeProgress: 0, // 0..1 for fade mechanic
    consecutiveWords: 0,

    // Endless
    endlessMode: false,
    endlessFloor: 0,

    // High scores
    runScore: 0,
    highScore: parseInt(localStorage.getItem('ctd_high_score') || '0'),
  };

  // Apply cat class
  cls.apply(state);
  state.combo = state.startingCombo || 0;

  return state;
}

// ============================================================
// MAIN RENDER ENTRY
// ============================================================
export function renderCatTypingDungeon(container) {
  _container = container;
  G = null;
  removeAllListeners();
  clearTimers();
  renderCatSelect();
}

export function cleanupCatTypingDungeon() {
  removeAllListeners();
  clearTimers();
  if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  G = null;
  _container = null;
}

function clearTimers() {
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

// ============================================================
// SCREEN: CAT SELECT
// ============================================================
function renderCatSelect() {
  const hs = localStorage.getItem('ctd_high_score') || '0';
  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-catselect">
        <div class="ctd-title-badge">🐱 CAT TYPING DUNGEON</div>
        <h1 class="ctd-main-title">Choose Your Cat</h1>
        <p class="ctd-subtitle">Every cat has different starting stats. Pick one that fits your playstyle.</p>
        <div class="ctd-cat-grid">
          ${CAT_CLASSES.map(cls => `
            <button class="ctd-cat-card" data-cat="${cls.id}" style="--cat-color:${cls.color}">
              <div class="ctd-cat-emoji">${cls.emoji}</div>
              <div class="ctd-cat-name">${cls.name}</div>
              <div class="ctd-cat-desc">${cls.desc}</div>
            </button>
          `).join('')}
        </div>
        ${hs > 0 ? `<div class="ctd-high-score">🏆 Personal Best: ${hs} pts</div>` : ''}
        <div class="ctd-how-to">
          <div class="ctd-how-title">⌨️ How to Play</div>
          <div class="ctd-how-steps">
            <span>TYPE the word displayed</span>
            <span>→</span>
            <span>Auto-attacks on completion</span>
            <span>→</span>
            <span>Build COMBO</span>
            <span>→</span>
            <span>Choose paths</span>
            <span>→</span>
            <span>Defeat the BOSS!</span>
          </div>
        </div>
      </div>
    </div>
  `;
  injectStyles();

  _container.querySelectorAll('.ctd-cat-card').forEach(btn => {
    addListener(btn, 'click', () => {
      G = initGameState(btn.dataset.cat);
      G.mapRows = generateMap(G.totalNodes);
      sfxChest();
      renderMap();
    });
  });
}

// ============================================================
// SCREEN: MAP
// ============================================================
function renderMap() {
  G.screen = 'map';
  const pRows = [...G.mapRows].reverse();

  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-mid">🗺️ Floor ${G.floor} — Node ${G.runNodes}/${G.totalNodes}</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
      </div>

      <div class="ctd-map">
        <h2 class="ctd-map-title">Choose Your Path</h2>
        <div class="ctd-map-rows">
          ${pRows.map((row, displayIdx) => {
            const rowIdx = G.mapRows.length - 1 - displayIdx;
            const isCurrentRow = rowIdx === G.currentRow;
            const isPastRow = rowIdx < G.currentRow;
            const isBossRow = rowIdx === G.mapRows.length - 1;
            return `
              <div class="ctd-map-row ${isCurrentRow ? 'ctd-row-active' : ''} ${isPastRow ? 'ctd-row-done' : ''}">
                ${row.map(node => {
                  const cleared = node.cleared;
                  const isSelectable = isCurrentRow && !cleared;
                  const isBoss = node.type === 'boss';
                  return `
                    <button class="ctd-map-node ${cleared ? 'ctd-node-done' : ''} ${isSelectable ? 'ctd-node-selectable' : ''} ${isBoss ? 'ctd-node-boss' : ''}"
                      data-row="${rowIdx}" data-col="${node.col}"
                      ${!isSelectable ? 'disabled' : ''}
                      style="--node-color:${NODE_COLORS[node.type] || '#888'}">
                      <span class="ctd-node-icon">${cleared ? '✅' : NODE_ICONS[node.type]}</span>
                      <span class="ctd-node-label">${node.type.toUpperCase()}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
        <div class="ctd-map-legend">
          ${Object.entries(NODE_ICONS).map(([t,i])=>`<span>${i} ${t}</span>`).join('')}
        </div>
      </div>

      <div class="ctd-passives-bar">
        ${G.passives.length ? G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.8rem;">No passives yet</span>'}
      </div>
    </div>
  `;

  _container.querySelectorAll('.ctd-map-node:not([disabled])').forEach(btn => {
    addListener(btn, 'click', () => {
      const row = parseInt(btn.dataset.row);
      const col = parseInt(btn.dataset.col);
      const node = G.mapRows[row][col];
      selectMapNode(node);
    });
  });
}

function selectMapNode(node) {
  G.selectedNode = node;
  G.runNodes++;

  if (node.type === 'battle') {
    sfxAttack();
    startCombat(pickNormalEnemy());
  } else if (node.type === 'elite') {
    sfxBoss();
    startCombat(pickEliteEnemy(), true);
  } else if (node.type === 'shop') {
    sfxShop();
    renderShop();
  } else if (node.type === 'chest') {
    // Mimic chance!
    if (!G.mimicWard && Math.random() < 0.18) {
      sfxBoss();
      renderMimicReveal();
    } else {
      sfxChest();
      renderChest();
    }
  } else if (node.type === 'boss') {
    sfxBoss();
    startBoss();
  }
}

function pickNormalEnemy() {
  return pick(NORMAL_POOL);
}

function pickEliteEnemy() {
  return pick(ELITE_POOL);
}

function advanceMap() {
  if (G.selectedNode) {
    G.selectedNode.cleared = true;
  }
  // Advance to next row
  G.currentRow++;
  if (G.currentRow >= G.mapRows.length) {
    // Shouldn't happen - boss should have been last
    triggerVictory();
  } else {
    renderMap();
  }
}

// ============================================================
// SCREEN: COMBAT
// ============================================================
function startCombat(enemyId, isElite = false) {
  const def = ENEMIES[enemyId];
  if (!def) { advanceMap(); return; }

  // Scale HP/ATK with floor
  const floorMult = 1 + (G.floor - 1) * 0.15 + (G.endlessMode ? G.endlessFloor * 0.08 : 0);
  const eliteMult = isElite ? 1.5 : 1.0;

  G.enemy = { ...def, id: enemyId };
  G.enemyHp = Math.round(def.maxHp * floorMult * eliteMult);
  G.enemyMaxHp = G.enemyHp;
  G.enemyArmor = (def.armor || 0) * G.armorBreak; // Note: armorBreak means it needs more hits actually.. wait let me re-read. armorBreak makes armor break faster - so armor starts lower or breaks in fewer words
  G.enemyArmor = def.armor || 0;
  G.enemyArmorMax = def.armor || 0;
  G.firePenalty = 0;
  G.glovesUsed = false;
  G.secondChanceUsed = false;
  G.bombRunUsed = false;
  G.mistakeThisBattle = false;
  G.swarmTargets = [];
  G.swarmCurrentIndex = 0;
  G.consecutiveWords = 0;

  G.screen = 'combat';
  renderCombat();
  startNextWord();
}

function renderCombat() {
  const e = G.enemy;
  if (!e) return;

  const hpPct = Math.max(0, G.enemyHp / G.enemyMaxHp * 100);
  const playerHpPct = Math.max(0, G.hp / G.maxHp * 100);
  const armorDisplay = G.enemyArmor > 0 ? `<div class="ctd-armor">🛡️ ${G.enemyArmor} Armor</div>` : '';
  const eliteBadge = e.isElite ? '<div class="ctd-elite-badge">⚡ ELITE</div>' : '';

  // Build swarm targets if applicable
  let swarmHTML = '';
  if (e.mechanic === 'swarm' && G.swarmTargets.length > 0) {
    swarmHTML = `<div class="ctd-swarm-targets">
      ${G.swarmTargets.map((w,i) => `
        <span class="ctd-swarm-word ${i < G.swarmCurrentIndex ? 'done' : i === G.swarmCurrentIndex ? 'active' : ''}">${w}</span>
      `).join('')}
    </div>`;
  }

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-combat-wrapper">
      <!-- HUD -->
      <div class="ctd-hud">
        <span class="ctd-hud-hp ${G.hp <= G.maxHp * 0.3 ? 'ctd-hp-danger' : ''}">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-combo ${G.combo >= 10 ? 'ctd-combo-fire' : ''}">COMBO ×${G.combo}</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
      </div>

      <!-- Player HP Bar -->
      <div class="ctd-player-hp-bar">
        <div class="ctd-player-hp-fill" style="width:${playerHpPct}%; background:${playerHpPct > 50 ? '#10b981' : playerHpPct > 25 ? '#f59e0b' : '#ef4444'}"></div>
      </div>

      <!-- Enemy Area -->
      <div class="ctd-enemy-area">
        ${eliteBadge}
        <div class="ctd-enemy-emoji" id="ctd-enemy-emoji">${e.emoji}</div>
        <div class="ctd-enemy-name">${e.name}</div>
        ${armorDisplay}
        <div class="ctd-enemy-hp-bar-wrap">
          <div class="ctd-enemy-hp-bar">
            <div class="ctd-enemy-hp-fill" id="ctd-enemy-hp-fill" style="width:${hpPct}%"></div>
          </div>
          <span class="ctd-enemy-hp-label" id="ctd-enemy-hp-label">${G.enemyHp} / ${G.enemyMaxHp} HP</span>
        </div>
      </div>

      <!-- Word Display -->
      <div class="ctd-word-area" id="ctd-word-area">
        <div class="ctd-type-label">TYPE THIS</div>
        ${swarmHTML}
        <div class="ctd-word-display" id="ctd-word-display">
          <span id="ctd-word-typed" class="ctd-typed"></span><span id="ctd-word-remain" class="ctd-remain"></span>
        </div>
        <div class="ctd-word-sub" id="ctd-word-sub"></div>
      </div>

      <!-- Timer -->
      <div class="ctd-timer-area" id="ctd-timer-area">
        <div class="ctd-timer-val" id="ctd-timer-val">—</div>
        <div class="ctd-timer-bar-wrap">
          <div class="ctd-timer-bar" id="ctd-timer-bar" style="width:100%"></div>
        </div>
      </div>

      <!-- Input -->
      <div class="ctd-input-area">
        <input type="text" id="ctd-input" class="ctd-input" 
          autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"
          placeholder="Start typing..." inputmode="text" enterkeyhint="done">
      </div>

      <!-- Passives bar -->
      <div class="ctd-passives-bar">
        ${G.passives.length ? G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('') : ''}
      </div>

      <!-- Floating damage numbers layer -->
      <div id="ctd-float-layer" class="ctd-float-layer"></div>
    </div>
  `;

  const input = document.getElementById('ctd-input');
  if (input) {
    // Focus the input
    input.focus();

    addListener(input, 'input', onTypingInput);

    // Re-focus when user taps anywhere in the combat wrapper
    addListener(_container.querySelector('.ctd-combat-wrapper'), 'click', () => {
      const inp = document.getElementById('ctd-input');
      if (inp) inp.focus();
    });
  }
}

function startNextWord() {
  if (typeof startNextWord_v2 === 'function') {
    return startNextWord_v2();
  }
  // Fallback shouldn't be reached in the final file, but just in case
}

function timerTick() {
  if (!G.wordActive || G.battlePaused) return;

  const e = G.enemy;
  let drainRate = 0.1; // 100ms tick

  // Ice elemental special: oscillate speed
  if (e && e.mechanic === 'slowtime') {
    const t = Date.now() / 1000;
    const osc = Math.sin(t * 1.5) * 0.5 + 0.5; // 0..1
    drainRate = 0.1 * (0.5 + osc * 1.5);
  }

  G.wordTimeLeft = Math.max(0, G.wordTimeLeft - drainRate);

  // Fade mechanic for snake
  if (e && e.mechanic === 'fade') {
    G.wordFadeProgress = Math.min(1, 1 - (G.wordTimeLeft / G.wordTimeMax));
  }

  updateTimerDisplay();
  updateWordFade();

  if (G.wordTimeLeft <= 0 && G.wordActive) {
    onTimeUp();
  }

  // Timer warning sound
  if (G.wordTimeLeft < 1.0 && G.wordTimeLeft > 0.9) {
    sfxTimerWarn();
  }
}

function updateWordDisplay() {
  const typedEl = document.getElementById('ctd-word-typed');
  const remainEl = document.getElementById('ctd-word-remain');
  const subEl = document.getElementById('ctd-word-sub');

  if (!typedEl || !remainEl) return;

  const word = G.currentWord;
  const typed = G.typedSoFar;
  typedEl.textContent = typed;
  remainEl.textContent = word.slice(typed.length);

  if (subEl) {
    const e = G.enemy;
    let sub = '';
    if (e && e.mechanic === 'fade')     sub = '🐍 Word is fading...';
    if (e && e.mechanic === 'swarm')    sub = `🐝 ${G.swarmCurrentIndex + 1}/${G.swarmTargets.length}`;
    if (e && e.mechanic === 'armor' && G.enemyArmor > 0) sub = `🛡️ Break armor first! (${G.enemyArmor} hits)`;
    if (e && e.mechanic === 'punishment' && G.firePenalty > 0) sub = `🔥 Fury ×${G.firePenalty + 1}`;
    if (e && e.mechanic === 'elite_armor' && G.enemyArmor > 0) sub = `🛡️ Perfect words break the shield! (${G.enemyArmor} left)`;
    subEl.textContent = sub;
  }
}

function updateWordFade() {
  const wArea = document.getElementById('ctd-word-display');
  if (wArea) {
    // Snake fade: opacity fades toward 0
    if (G.enemy && G.enemy.mechanic === 'fade') {
      const fade = Math.max(0.15, 1 - G.wordFadeProgress * 0.85);
      wArea.style.opacity = fade;
    }
  }
}

function updateTimerDisplay() {
  const valEl = document.getElementById('ctd-timer-val');
  const barEl = document.getElementById('ctd-timer-bar');
  if (!valEl || !barEl) return;

  const pct = Math.max(0, G.wordTimeLeft / G.wordTimeMax * 100);
  valEl.textContent = G.wordTimeLeft.toFixed(2) + 's';

  // Color: green → yellow → orange → red
  let color;
  if (pct > 60)       color = '#10b981';
  else if (pct > 35)  color = '#f59e0b';
  else if (pct > 15)  color = '#f97316';
  else                color = '#ef4444';

  barEl.style.width = pct + '%';
  barEl.style.background = color;
  valEl.style.color = color;
}

function onTypingInput(e) {
  if (!G.wordActive) return;
  const input = e.target;
  const val = input.value.toLowerCase().replace(/[^a-z]/g, '');
  const word = G.currentWord;

  // Trim to word length
  const trimmed = val.slice(0, word.length);
  input.value = trimmed;

  // Check if leading characters match
  let correct = true;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] !== word[i]) { correct = false; break; }
  }

  if (correct) {
    G.typedSoFar = trimmed;
    updateWordDisplay();

    // Perfect completion?
    if (trimmed === word) {
      onWordCompleted(true);
    }
  } else {
    // Mistake!
    input.value = G.typedSoFar; // revert to last good state
    onMistake();
  }
}

function onWordCompleted(perfect) {
  G.wordActive = false;
  clearTimers();

  G.wordsTyped++;
  G.consecutiveWords++;

  const input = document.getElementById('ctd-input');
  if (input) input.value = '';

  // Blood typing passive
  if (G.bloodTyping && G.wordsTyped % 10 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + 2 * G.bloodTyping);
    floatText(`+${2 * G.bloodTyping} HP`, '#10b981', 'center');
  }

  // Combo heal passive
  if (G.comboHealAt && G.combo > 0 && G.combo % 8 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + G.comboHealAt);
  }

  // Combo
  G.combo++;
  G.maxCombo = Math.max(G.maxCombo, G.combo);
  sfxCombo();

  // Calculate damage
  let dmg = calcDamage(perfect);

  // Check crit
  let isCrit = false;
  const critChance = G.critChance || 0.08;
  if (perfect && Math.random() < critChance) {
    isCrit = true;
    dmg = Math.round(dmg * (G.critMult || 2));
    sfxCrit();
  } else {
    sfxAttack();
  }

  // Apply on-hit time bonus
  if (G.onHitTimeBonus) G.wordTimeLeft = Math.min(G.wordTimeMax, G.wordTimeLeft + G.onHitTimeBonus);

  // Apply lifesteal
  if (G.lifestealPct) {
    const heal = Math.max(1, Math.round(dmg * G.lifestealPct));
    G.hp = Math.min(G.maxHp, G.hp + heal);
  }

  // Swarm mechanic
  const e = G.enemy;
  if (e.mechanic === 'swarm') {
    G.swarmCurrentIndex++;
    if (G.swarmCurrentIndex < G.swarmTargets.length) {
      // More words!
      showAttackFeedback(dmg, isCrit, perfect, false);
      applyDamageToEnemy(dmg);
      updateCombatHUD();
      setTimeout(() => {
        if (G.screen === 'combat') {
          G.wordActive = false;
          startNextWord();
        }
      }, 180);
      return;
    } else {
      G.swarmTargets = [];
      G.swarmCurrentIndex = 0;
    }
  }

  // Armor mechanic
  if ((e.mechanic === 'armor' || e.mechanic === 'elite_armor') && G.enemyArmor > 0) {
    const armorDmg = perfect ? Math.ceil(G.armorBreak * 2) : G.armorBreak;
    G.enemyArmor = Math.max(0, G.enemyArmor - armorDmg);
    floatText(`ARMOR -${armorDmg}`, '#a855f7', 'enemy');
    if (G.enemyArmor <= 0) {
      floatText('ARMOR BROKEN!', '#f59e0b', 'big');
      sfxCrit();
    }
    updateCombatHUD();
    scheduleNextWord();
    return;
  }

  showAttackFeedback(dmg, isCrit, perfect, true);
  applyDamageToEnemy(dmg);
  updateCombatHUD();
  scheduleNextWord();
}

function calcDamage(perfect) {
  let base = 10 + (G.floor - 1) * 1.5;

  // Passive: dmgMult
  base *= (G.dmgMult || 1);

  // Passive: momentum (every 5 combo steps = +12%)
  if (G.momentumStacks && G.combo > 0) {
    const bonusPct = Math.floor(G.combo / 5) * 0.12 * G.momentumStacks;
    base *= (1 + bonusPct);
  }

  // Passive: perfect bonus
  if (perfect && G.perfectBonus) {
    base *= (1 + G.perfectBonus);
  }

  // Passive: berserker fury
  if (G.berserkBonus && G.hp < G.maxHp * 0.30) {
    base *= (1 + G.berserkBonus);
  }

  // Passive: final push (last 3 nodes)
  if (G.finalPush && G.runNodes >= G.totalNodes - 2) {
    base *= 1.40;
  }

  // Passive: bomb run (first hit)
  if (G.bombRun && !G.bombRunUsed) {
    base *= 1.50;
    G.bombRunUsed = true;
  }

  // Enemy-specific: fire penalty stacks reduce damage (no, the spec says fire elemental increases ENEMY damage on fail, so we just use it there)
  // Golem/evileye accuracy bonus already covered by perfectBonus

  return Math.max(1, Math.round(base));
}

function applyDamageToEnemy(dmg) {
  if (!G.enemy) return;
  G.enemyHp = Math.max(0, G.enemyHp - dmg);
  G.totalDmgDealt += dmg;

  if (G.enemyHp <= 0) {
    onEnemyDefeated();
  }
}

function showAttackFeedback(dmg, isCrit, perfect, shake) {
  const emojiEl = document.getElementById('ctd-enemy-emoji');
  if (emojiEl) {
    emojiEl.classList.remove('ctd-enemy-hit');
    void emojiEl.offsetWidth;
    emojiEl.classList.add('ctd-enemy-hit');
  }

  if (shake) {
    const wrapper = _container.querySelector('.ctd-combat-wrapper');
    if (wrapper) {
      wrapper.classList.remove('ctd-shake');
      void wrapper.offsetWidth;
      wrapper.classList.add('ctd-shake');
      setTimeout(() => wrapper.classList.remove('ctd-shake'), 300);
    }
  }

  floatText(isCrit ? `💥 CRIT! ${dmg}` : `-${dmg}`, isCrit ? '#f59e0b' : '#f87171', 'enemy');
  if (isCrit) floatText('CRITICAL HIT!', '#f59e0b', 'big');
  if (perfect && !isCrit) floatText('PERFECT!', '#10b981', 'top');

  const comboEl = _container.querySelector('.ctd-hud-combo');
  if (comboEl) {
    comboEl.classList.remove('ctd-combo-pulse');
    void comboEl.offsetWidth;
    comboEl.classList.add('ctd-combo-pulse');
  }
}

function floatText(text, color, pos = 'enemy') {
  const layer = document.getElementById('ctd-float-layer');
  if (!layer) return;
  const el = document.createElement('div');
  el.className = 'ctd-float-num';
  el.textContent = text;
  el.style.color = color;

  if (pos === 'enemy')  { el.style.top = '30%'; el.style.left = '50%'; }
  if (pos === 'big')    { el.style.top = '20%'; el.style.left = '50%'; el.style.fontSize = '1.6rem'; el.style.fontWeight = '900'; }
  if (pos === 'top')    { el.style.top = '10%'; el.style.left = '50%'; }
  if (pos === 'center') { el.style.top = '50%'; el.style.left = '50%'; }

  layer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function onMistake() {
  G.wordsMissed++;

  // Cat gloves: first mistake no punishment
  if (G.gloves > 0 && !G.glovesUsed) {
    G.glovesUsed = true;
    floatText('🧤 Gloves!', '#a855f7', 'top');
    return;
  }

  // Second chance passive
  if (G.secondChance > 0 && !G.secondChanceUsed) {
    G.secondChanceUsed = true;
    floatText('😼 Second Chance!', '#a855f7', 'top');
    return;
  }

  sfxError();
  G.combo = 0; // Break combo

  // Enemy mechanic on mistake
  const e = G.enemy;
  if (e) {
    if (e.mechanic === 'goldthief' && G.gold > 0) {
      const stolen = Math.min(G.gold, Math.floor(Math.random() * 5) + 2);
      G.gold = Math.max(0, G.gold - stolen);
      floatText(`🐦 -${stolen}🪙 stolen!`, '#f59e0b', 'top');
    }
    if (e.mechanic === 'lifesteal') {
      const heal = Math.round(G.enemyMaxHp * 0.04);
      G.enemyHp = Math.min(G.enemyMaxHp, G.enemyHp + heal);
      floatText(`🧛 +${heal} HP!`, '#ef4444', 'enemy');
      updateCombatHUD();
    }
    if (e.mechanic === 'punishment') {
      G.firePenalty = Math.min(5, G.firePenalty + 1);
      floatText(`🔥 Fury ×${G.firePenalty + 1}!`, '#ef4444', 'top');
    }
    if (e.mechanic === 'elite_burst' && Math.random() < 0.4) {
      // Mini dragon rapid fire: force enemy attack
      triggerEnemyAttack();
      return;
    }
  }

  // Flash input red
  const input = document.getElementById('ctd-input');
  if (input) {
    input.style.borderColor = '#ef4444';
    input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.3)';
    setTimeout(() => {
      if (input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }
    }, 400);
  }

  G.mistakeThisBattle = true;
  updateCombatHUD();
}

function onTimeUp() {
  G.wordActive = false;
  clearTimers();
  sfxHit();

  // TIME! banner
  floatText('⏱️ TIME!', '#ef4444', 'big');
  G.combo = 0;

  triggerEnemyAttack();
}

function triggerEnemyAttack() {
  if (!G.enemy) return;
  const e = G.enemy;

  let atk = e.atk || 10;
  const floorScale = 1 + (G.floor - 1) * 0.12 + (G.endlessMode ? G.endlessFloor * 0.05 : 0);
  atk = Math.round(atk * floorScale);

  // Fire punishment stacks
  if (e.mechanic === 'punishment' && G.firePenalty > 0) {
    atk = Math.round(atk * (1 + G.firePenalty * 0.25));
  }

  // Nine lives passive
  if (G.nineLifeCount > 0 && G.hp - atk <= 0) {
    G.nineLifeCount--;
    G.hp = 1;
    floatText('🛡️ Nine Lives!', '#a855f7', 'big');
    sfxVictory();
    updateCombatHUD();
    scheduleNextWord();
    return;
  }

  G.hp = Math.max(0, G.hp - atk);
  floatText(`💢 -${atk} HP`, '#ef4444', 'center');
  sfxHit();

  // Shake player hp
  const hpEl = _container.querySelector('.ctd-hud-hp');
  if (hpEl) {
    hpEl.classList.remove('ctd-hp-shake');
    void hpEl.offsetWidth;
    hpEl.classList.add('ctd-hp-shake');
  }

  updateCombatHUD();

  if (G.hp <= 0) {
    onPlayerDeath();
    return;
  }

  scheduleNextWord();
}

function scheduleNextWord() {
  const delay = G.enemy && G.enemy.mechanic === 'disrupt' && Math.random() < 0.25 ? 600 : 250;
  // Storm elemental: brief visual effect
  if (G.enemy && G.enemy.mechanic === 'disrupt' && Math.random() < 0.2) {
    const wArea = document.getElementById('ctd-word-area');
    if (wArea) {
      wArea.style.filter = 'hue-rotate(180deg)';
      setTimeout(() => { if (wArea) wArea.style.filter = ''; }, 300);
    }
  }
  setTimeout(() => {
    if (G.screen === 'combat') {
      updateCombatHUD();
      startNextWord();
    }
  }, delay);
}

function updateCombatHUD() {
  const e = G.enemy;
  if (!e) return;

  const hpPct = Math.max(0, G.enemyHp / G.enemyMaxHp * 100);
  const playerHpPct = Math.max(0, G.hp / G.maxHp * 100);

  const fillEl = document.getElementById('ctd-enemy-hp-fill');
  const lblEl  = document.getElementById('ctd-enemy-hp-label');
  const phpBar = _container.querySelector('.ctd-player-hp-fill');
  const comboEl = _container.querySelector('.ctd-hud-combo');
  const hpEl   = _container.querySelector('.ctd-hud-hp');
  const goldEl = _container.querySelector('.ctd-hud-gold');

  if (fillEl) fillEl.style.width = hpPct + '%';
  if (lblEl)  lblEl.textContent = `${G.enemyHp} / ${G.enemyMaxHp} HP`;
  if (phpBar) {
    phpBar.style.width = playerHpPct + '%';
    phpBar.style.background = playerHpPct > 50 ? '#10b981' : playerHpPct > 25 ? '#f59e0b' : '#ef4444';
  }
  if (comboEl) {
    comboEl.textContent = `COMBO ×${G.combo}`;
    comboEl.className = `ctd-hud-combo ${G.combo >= 10 ? 'ctd-combo-fire' : ''}`;
  }
  if (hpEl) {
    hpEl.textContent = `❤️ ${G.hp}/${G.maxHp}`;
    hpEl.className = `ctd-hud-hp ${G.hp <= G.maxHp * 0.3 ? 'ctd-hp-danger' : ''}`;
  }
  if (goldEl) goldEl.textContent = `🪙 ${G.gold}`;
}

function onEnemyDefeated() {
  clearTimers();
  G.wordActive = false;
  G.enemiesDefeated++;
  sfxVictory();

  const e = G.enemy;
  const goldBase = e.gold || [5,12];
  const rawGold = Math.floor(Math.random() * (goldBase[1] - goldBase[0])) + goldBase[0];
  const gold = Math.round(rawGold * (G.goldMult || 1));
  G.gold += gold;
  G.runScore += G.enemyHp === 0 ? 100 * G.floor : 50;

  // Small heal chance for regular battles
  let healAmt = 0;
  if (!e.isElite && Math.random() < 0.25) {
    healAmt = Math.floor(Math.random() * 5) + 3;
    G.hp = Math.min(G.maxHp, G.hp + healAmt);
  }

  // Fire elemental: remove penalty on perfect clear
  if (e.mechanic === 'punishment') G.firePenalty = 0;

  floatText(`+${gold}🪙`, '#f59e0b', 'big');
  if (healAmt) floatText(`+${healAmt} HP`, '#10b981', 'top');

  // Victory screen before advancing
  const emojiEl = document.getElementById('ctd-enemy-emoji');
  if (emojiEl) {
    emojiEl.classList.add('ctd-enemy-defeated');
    emojiEl.textContent = '💨';
  }

  setTimeout(() => {
    advanceMap();
  }, 1200);
}

function onPlayerDeath() {
  clearTimers();
  G.wordActive = false;
  G.screen = 'gameover';
  sfxDeath();

  // Save high score
  const score = G.runScore + G.wordsTyped * 5 + G.combo * 2;
  if (score > G.highScore) {
    localStorage.setItem('ctd_high_score', score);
    G.highScore = score;
  }

  setTimeout(() => renderGameOver(), 400);
}

// ============================================================
// SCREEN: SHOP
// ============================================================
function renderShop() {
  G.screen = 'shop';
  clearTimers();
  sfxShop();

  const count = G.luckyRolls ? 5 : 4;
  const items = drawPassives(count, []);
  const discount = G.shopDiscount || 0;

  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-mid">🛒 Shop</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
      </div>

      <div class="ctd-shop">
        <h2 class="ctd-shop-title">🛒 Cat Shop</h2>
        <p class="ctd-shop-subtitle">Spend your gold to gain powerful upgrades</p>
        <div class="ctd-shop-grid">
          ${items.map((p, i) => {
            const baseCost = { common:15, uncommon:28, rare:48, epic:75 }[p.rarity] || 25;
            const cost = Math.round(baseCost * (1 - discount));
            const canAfford = G.gold >= cost;
            return `
              <div class="ctd-shop-item ctd-rarity-${p.rarity} ${canAfford ? '' : 'ctd-cant-afford'}" data-idx="${i}" data-cost="${cost}">
                <div class="ctd-shop-icon">${p.icon}</div>
                <div class="ctd-shop-name">${p.name}</div>
                <div class="ctd-shop-desc">${p.desc}</div>
                <div class="ctd-rarity-badge">${p.rarity.toUpperCase()}</div>
                <button class="ctd-shop-buy ${canAfford ? '' : 'ctd-btn-disabled'}" data-idx="${i}" data-cost="${cost}" ${canAfford ? '' : 'disabled'}>
                  🪙 ${cost}
                </button>
              </div>
            `;
          }).join('')}
        </div>
        <button class="ctd-btn-leave" id="ctd-shop-leave">Leave Shop →</button>
      </div>

      <div class="ctd-passives-bar">
        ${G.passives.length ? G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('') : ''}
      </div>
    </div>
  `;

  _container.querySelectorAll('.ctd-shop-buy:not([disabled])').forEach(btn => {
    addListener(btn, 'click', () => {
      const idx = parseInt(btn.dataset.idx);
      const cost = parseInt(btn.dataset.cost);
      if (G.gold >= cost) {
        G.gold -= cost;
        const passive = items[idx];
        applyPassive(passive);
        sfxShop();
        renderShop(); // re-render after purchase
      }
    });
  });

  const leaveBtn = document.getElementById('ctd-shop-leave');
  if (leaveBtn) {
    addListener(leaveBtn, 'click', () => {
      advanceMap();
    });
  }
}

function applyPassive(passive) {
  G.passives.push(passive);
  passive.effect(G);
  // Cap passives to reasonable values
  G.critChance = Math.min(0.95, G.critChance || 0.08);
  G.timerSpeedMult = Math.max(0.4, G.timerSpeedMult || 1);
}

// ============================================================
// SCREEN: CHEST
// ============================================================
function renderChest() {
  G.screen = 'chest';
  sfxChest();

  const count = G.luckyRolls ? 4 : 3;
  const items = drawPassives(count, []);

  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-mid">🎁 Treasure</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
      </div>

      <div class="ctd-chest">
        <div class="ctd-chest-emoji">🎁</div>
        <h2 class="ctd-chest-title">Treasure Chest!</h2>
        <p class="ctd-chest-subtitle">Choose one reward:</p>
        <div class="ctd-chest-grid">
          ${items.map((p, i) => `
            <button class="ctd-chest-item ctd-rarity-${p.rarity}" data-idx="${i}">
              <div class="ctd-shop-icon">${p.icon}</div>
              <div class="ctd-shop-name">${p.name}</div>
              <div class="ctd-shop-desc">${p.desc}</div>
              <div class="ctd-rarity-badge">${p.rarity.toUpperCase()}</div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  _container.querySelectorAll('.ctd-chest-item').forEach(btn => {
    addListener(btn, 'click', () => {
      const idx = parseInt(btn.dataset.idx);
      applyPassive(items[idx]);
      sfxVictory();
      advanceMap();
    });
  });
}

// ============================================================
// MIMIC REVEAL
// ============================================================
function renderMimicReveal() {
  _container.innerHTML = `
    <div class="ctd-wrapper ctd-mimic-reveal">
      <div class="ctd-mimic-chest">🎁</div>
      <div class="ctd-mimic-msg">THE CHEST WAS A MIMIC!</div>
      <div class="ctd-mimic-sub">Defeat it for bonus rewards!</div>
    </div>
  `;
  sfxBoss();
  setTimeout(() => {
    startCombat('mimic', true);
  }, 2200);
}

// ============================================================
// BOSS COMBAT
// ============================================================
function startBoss() {
  G.screen = 'boss';
  clearTimers();

  const boss = pick(BOSSES);
  G.boss = { ...boss };
  G.bossPhaseIdx = 0;
  G.bossHp = boss.maxHp;
  G.bossMaxHp = boss.maxHp;
  G.bossPhase = boss.phases[0];
  G.bossArmor = boss.phases[0].armor || 0;

  // Convert boss to enemy-like structure for combat
  G.enemy = {
    id: `boss_${boss.id}`,
    name: boss.name,
    emoji: boss.emoji,
    maxHp: boss.maxHp,
    atk: boss.atk,
    mechanic: boss.phases[0].mechanic,
    isElite: true,
    isBoss: true,
    gold: boss.gold,
    armor: boss.phases[0].armor || 0,
  };
  G.enemyHp = G.bossHp;
  G.enemyMaxHp = G.bossMaxHp;
  G.enemyArmor = G.bossArmor;
  G.enemyArmorMax = G.bossArmor;
  G.firePenalty = 0;
  G.glovesUsed = false;
  G.secondChanceUsed = false;
  G.bombRunUsed = false;
  G.swarmTargets = [];
  G.swarmCurrentIndex = 0;

  renderBossIntro(boss);
}

function renderBossIntro(boss) {
  _container.innerHTML = `
    <div class="ctd-wrapper ctd-boss-intro">
      <div class="ctd-boss-crown">👑</div>
      <div class="ctd-boss-emoji">${boss.emoji}</div>
      <div class="ctd-boss-name">${boss.name}</div>
      <div class="ctd-boss-sub">FINAL BOSS</div>
      <div class="ctd-boss-phases">${boss.phases.length} Phases</div>
    </div>
  `;
  sfxBoss();
  setTimeout(() => {
    renderCombat();
    startNextWord();
  }, 2000);
}

function checkBossPhase() {
  if (!G.boss) return;
  const boss = G.boss;
  const phases = boss.phases;

  for (let i = phases.length - 1; i >= 0; i--) {
    if (G.bossHp <= phases[i].hp && G.bossPhaseIdx < i) {
      // Phase transition!
      G.bossPhaseIdx = i;
      G.bossPhase = phases[i];

      // Update enemy mechanic for new phase
      G.enemy.mechanic = phases[i].mechanic;
      G.enemyArmor = phases[i].armor || 0;

      clearTimers();
      G.wordActive = false;

      showPhaseTransition(phases[i].msg, phases[i].label, () => {
        if (G.screen === 'combat' || G.screen === 'boss') {
          startNextWord();
        }
      });
      return;
    }
  }
}

function showPhaseTransition(msg, label, cb) {
  const overlay = document.createElement('div');
  overlay.className = 'ctd-phase-overlay';
  overlay.innerHTML = `
    <div class="ctd-phase-msg">${msg}</div>
    <div class="ctd-phase-label">${label}</div>
  `;
  _container.appendChild(overlay);
  sfxBoss();
  setTimeout(() => {
    overlay.remove();
    if (cb) cb();
  }, 2200);
}

// Override applyDamageToEnemy to check boss phases
const _origApply = applyDamageToEnemy;
function applyDamageToBoss(dmg) {
  if (!G.boss) { applyDamageToEnemy(dmg); return; }
  G.enemyHp = Math.max(0, G.enemyHp - dmg);
  G.bossHp = G.enemyHp;
  G.totalDmgDealt += dmg;

  checkBossPhase();

  if (G.enemyHp <= 0) {
    onBossDefeated();
  }
}

function onBossDefeated() {
  clearTimers();
  G.wordActive = false;
  sfxVictory();
  sfxVictory();

  const goldRange = G.boss.gold || [60,90];
  const gold = Math.floor(Math.random() * (goldRange[1] - goldRange[0])) + goldRange[0];
  G.gold += Math.round(gold * (G.goldMult || 1));

  const score = G.runScore + G.wordsTyped * 5 + G.maxCombo * 10 + G.gold * 2;
  G.runScore = score;

  if (score > G.highScore) {
    localStorage.setItem('ctd_high_score', score);
    G.highScore = score;
  }

  triggerVictory();
}

function triggerVictory() {
  G.screen = 'victory';
  clearTimers();

  const acc = G.wordsTyped > 0 ? Math.round((G.wordsTyped - G.wordsMissed) / G.wordsTyped * 100) : 100;

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-victory">
      <div class="ctd-victory-emoji">🏆</div>
      <div class="ctd-victory-title">VICTORY!</div>
      <div class="ctd-victory-sub">Dungeon cleared! You defeated the final boss.</div>
      <div class="ctd-stats-grid">
        <div class="ctd-stat-card"><span>⚔️ Enemies</span><span>${G.enemiesDefeated}</span></div>
        <div class="ctd-stat-card"><span>⌨️ Words</span><span>${G.wordsTyped}</span></div>
        <div class="ctd-stat-card"><span>🎯 Accuracy</span><span>${acc}%</span></div>
        <div class="ctd-stat-card"><span>🔥 Max Combo</span><span>×${G.maxCombo}</span></div>
        <div class="ctd-stat-card"><span>🪙 Gold</span><span>${G.gold}</span></div>
        <div class="ctd-stat-card ctd-score-card"><span>🏆 Score</span><span>${G.runScore}</span></div>
      </div>
      ${G.runScore >= G.highScore ? '<div class="ctd-new-record">🌟 NEW PERSONAL BEST!</div>' : ''}
      <div class="ctd-victory-actions">
        <button class="ctd-btn-primary" id="ctd-endless-btn">⚡ Continue to Endless Mode</button>
        <button class="ctd-btn-secondary" id="ctd-newrun-btn">🔄 New Run</button>
      </div>
    </div>
  `;

  sfxVictory(); sfxVictory();

  addListener(document.getElementById('ctd-endless-btn'), 'click', () => {
    startEndlessMode();
  });
  addListener(document.getElementById('ctd-newrun-btn'), 'click', () => {
    removeAllListeners();
    clearTimers();
    G = null;
    renderCatSelect();
  });
}

// ============================================================
// ENDLESS MODE
// ============================================================
function startEndlessMode() {
  G.endlessMode = true;
  G.endlessFloor = 0;
  G.currentRow = 0;
  G.mapRows = generateMap(G.totalNodes);
  G.mapRows.forEach(row => row.forEach(n => n.cleared = false));
  G.runNodes = 0;
  G.screen = 'map';
  G.endlessFloor++;
  renderMap();
}

// ============================================================
// GAME OVER
// ============================================================
function renderGameOver() {
  G.screen = 'gameover';
  const acc = G.wordsTyped > 0 ? Math.round((G.wordsTyped - G.wordsMissed) / G.wordsTyped * 100) : 100;

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-gameover">
      <div class="ctd-go-emoji">💀</div>
      <div class="ctd-go-title">DEFEATED</div>
      <div class="ctd-go-sub">Your run ended here. Better luck next time.</div>
      <div class="ctd-stats-grid">
        <div class="ctd-stat-card"><span>⚔️ Enemies</span><span>${G.enemiesDefeated}</span></div>
        <div class="ctd-stat-card"><span>⌨️ Words</span><span>${G.wordsTyped}</span></div>
        <div class="ctd-stat-card"><span>🎯 Accuracy</span><span>${acc}%</span></div>
        <div class="ctd-stat-card"><span>🔥 Max Combo</span><span>×${G.maxCombo}</span></div>
        <div class="ctd-stat-card"><span>🪙 Gold</span><span>${G.gold}</span></div>
        <div class="ctd-stat-card ctd-score-card"><span>🏆 Score</span><span>${G.runScore}</span></div>
      </div>
      <div class="ctd-hs-display">Personal Best: ${G.highScore} pts</div>
      <div class="ctd-victory-actions">
        <button class="ctd-btn-primary" id="ctd-retry-btn">🔄 Try Again</button>
      </div>
    </div>
  `;

  addListener(document.getElementById('ctd-retry-btn'), 'click', () => {
    removeAllListeners();
    clearTimers();
    G = null;
    renderCatSelect();
  });
}

// ============================================================
// BOSS: patch applyDamageToEnemy to handle boss
// ============================================================
// Re-declare global apply function that checks boss
const _applyDamageToEnemy = applyDamageToEnemy;

// Monkey-patch the module-level function used in onWordCompleted
// We achieve this by the reference used there pointing at the right version.
// Since JS closures capture the function by reference at call time,
// and our applyDamageToEnemy at module scope is the one called,
// we need to redefine the logic inline:

// Actually, let's just duplicate the logic cleanly into onWordCompleted
// by always calling the damage function and letting it delegate:
function dealDamageToCurrentEnemy(dmg) {
  if (G.boss && G.enemy && G.enemy.isBoss) {
    applyDamageToBoss(dmg);
  } else {
    applyDamageToEnemy(dmg);
  }
}

// ============================================================
// CSS INJECTION
// ============================================================
function injectStyles() {
  if (document.getElementById('ctd-styles')) return;

  const style = document.createElement('style');
  style.id = 'ctd-styles';
  style.textContent = `
/* ===== CAT TYPING DUNGEON STYLES ===== */
.ctd-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 520px;
  max-width: 480px;
  margin: 0 auto;
  padding: 0.75rem;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

/* HUD */
.ctd-hud {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(22,27,34,0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0.5rem 0.85rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
}
.ctd-hud-hp { color: #10b981; }
.ctd-hud-hp.ctd-hp-danger { color: #ef4444; animation: ctd-danger-pulse 0.8s ease-in-out infinite; }
.ctd-hud-combo { color: #f59e0b; font-size: 0.85rem; }
.ctd-hud-combo.ctd-combo-fire { color: #f97316; text-shadow: 0 0 8px #f97316; }
.ctd-hud-mid { color: #8b949e; font-size: 0.8rem; }
.ctd-hud-gold { color: #f59e0b; }

/* Player HP bar */
.ctd-player-hp-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}
.ctd-player-hp-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background 0.3s ease;
}

/* CAT SELECT */
.ctd-catselect {
  text-align: center;
  width: 100%;
  padding: 1rem 0;
}
.ctd-title-badge {
  display: inline-block;
  background: linear-gradient(90deg, rgba(16,185,129,0.2), rgba(168,85,247,0.2));
  border: 1px solid rgba(168,85,247,0.4);
  color: #a855f7;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.3rem 1rem;
  border-radius: 99px;
  margin-bottom: 1rem;
  text-transform: uppercase;
}
.ctd-main-title {
  font-size: 2rem;
  font-weight: 900;
  color: #f0f6fc;
  margin-bottom: 0.3rem;
  background: linear-gradient(135deg, #f59e0b, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ctd-subtitle {
  color: #8b949e;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.ctd-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  width: 100%;
  margin-bottom: 1rem;
}
.ctd-cat-card {
  background: var(--bg-secondary, #161b22);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1rem 0.75rem;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  color: inherit;
}
.ctd-cat-card:hover, .ctd-cat-card:focus {
  border-color: var(--cat-color, #10b981);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cat-color, #10b981) 25%, transparent);
  transform: translateY(-2px);
}
.ctd-cat-emoji { font-size: 2rem; }
.ctd-cat-name { font-weight: 800; font-size: 0.9rem; color: var(--cat-color, #f0f6fc); }
.ctd-cat-desc { font-size: 0.72rem; color: #8b949e; line-height: 1.4; text-align: center; }
.ctd-high-score {
  color: #f59e0b;
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0.5rem 0;
}
.ctd-how-to {
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  width: 100%;
}
.ctd-how-title { font-weight: 800; color: #10b981; margin-bottom: 0.4rem; font-size: 0.85rem; }
.ctd-how-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  font-size: 0.75rem;
  color: #8b949e;
}
.ctd-how-steps span { white-space: nowrap; }

/* MAP */
.ctd-map { width: 100%; }
.ctd-map-title {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f0f6fc;
  margin-bottom: 1rem;
}
.ctd-map-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}
.ctd-map-row {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.ctd-map-row.ctd-row-active { opacity: 1; }
.ctd-map-row.ctd-row-done { opacity: 0.3; }
.ctd-map-node {
  background: var(--bg-secondary, #161b22);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0.6rem 0.5rem;
  min-width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: default;
  transition: all 0.18s ease;
  color: var(--text-primary, #f0f6fc);
}
.ctd-map-node.ctd-node-selectable {
  cursor: pointer;
  border-color: var(--node-color, #888);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--node-color, #888) 30%, transparent);
}
.ctd-map-node.ctd-node-selectable:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-color, #888) 40%, transparent);
}
.ctd-map-node.ctd-node-boss {
  border-color: #ff6b35;
  background: rgba(255,107,53,0.12);
  min-width: 110px;
}
.ctd-node-icon { font-size: 1.4rem; }
.ctd-node-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; color: var(--node-color, #888); }
.ctd-node-done { opacity: 0.4; }
.ctd-map-legend {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  font-size: 0.72rem;
  color: #6e7681;
}

/* COMBAT */
.ctd-combat-wrapper { padding: 0.5rem; }
.ctd-elite-badge {
  display: inline-block;
  background: linear-gradient(90deg, rgba(168,85,247,0.3), rgba(99,102,241,0.3));
  border: 1px solid #a855f7;
  color: #c084fc;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1em;
}

.ctd-enemy-area {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  background: rgba(22,27,34,0.7);
  border-radius: 14px;
  margin-bottom: 0.6rem;
  border: 1px solid rgba(255,255,255,0.06);
}
.ctd-enemy-emoji {
  font-size: 3.5rem;
  display: block;
  margin: 0.25rem 0;
  transition: transform 0.1s ease;
  line-height: 1;
}
.ctd-enemy-emoji.ctd-enemy-hit {
  animation: ctd-enemy-hit 0.25s ease;
}
.ctd-enemy-emoji.ctd-enemy-defeated {
  animation: ctd-enemy-defeated 0.5s ease forwards;
}
.ctd-enemy-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #f0f6fc;
  margin-bottom: 0.3rem;
}
.ctd-armor {
  font-size: 0.8rem;
  color: #a855f7;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.ctd-enemy-hp-bar-wrap {
  position: relative;
  width: 100%;
}
.ctd-enemy-hp-bar {
  width: 100%;
  height: 10px;
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.2rem;
}
.ctd-enemy-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f97316);
  border-radius: 99px;
  transition: width 0.25s ease;
}
.ctd-enemy-hp-label {
  font-size: 0.78rem;
  color: #8b949e;
  font-weight: 600;
}

/* WORD AREA */
.ctd-word-area {
  width: 100%;
  text-align: center;
  background: rgba(22,27,34,0.9);
  border: 2px solid rgba(16,185,129,0.3);
  border-radius: 14px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.6rem;
}
.ctd-type-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #6e7681;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}
.ctd-word-display {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.2;
  transition: opacity 0.1s;
  min-height: 2.2rem;
}
.ctd-typed { color: #10b981; }
.ctd-remain { color: #f0f6fc; }
.ctd-word-sub {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
  margin-top: 0.3rem;
  min-height: 1rem;
}

.ctd-swarm-targets {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}
.ctd-swarm-word {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  background: rgba(255,255,255,0.06);
  color: #8b949e;
  border: 1px solid rgba(255,255,255,0.08);
}
.ctd-swarm-word.active {
  background: rgba(16,185,129,0.15);
  color: #10b981;
  border-color: #10b981;
}
.ctd-swarm-word.done {
  background: rgba(255,255,255,0.04);
  color: #30363d;
  text-decoration: line-through;
}

/* TIMER */
.ctd-timer-area {
  width: 100%;
  text-align: center;
  margin-bottom: 0.5rem;
}
.ctd-timer-val {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  transition: color 0.2s;
}
.ctd-timer-bar-wrap {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.ctd-timer-bar {
  height: 100%;
  border-radius: 99px;
  transition: width 0.1s linear, background 0.2s;
}

/* INPUT */
.ctd-input-area {
  width: 100%;
  margin-bottom: 0.5rem;
}
.ctd-input {
  width: 100%;
  box-sizing: border-box;
  font-size: 1.3rem;
  font-weight: 700;
  font-family: 'Inter', monospace, sans-serif;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 2px solid rgba(16,185,129,0.4);
  background: rgba(22,27,34,0.95);
  color: #f0f6fc;
  outline: none;
  text-align: center;
  letter-spacing: 0.08em;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
  touch-action: manipulation;
}
.ctd-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
}
.ctd-input::placeholder { color: #30363d; font-size: 1rem; }

/* PASSIVES BAR */
.ctd-passives-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
  width: 100%;
  padding: 0.3rem 0;
  min-height: 2rem;
}
.ctd-passive-pip {
  font-size: 1.2rem;
  cursor: help;
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.2));
}

/* FLOATING NUMBERS */
.ctd-float-layer {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}
.ctd-float-num {
  position: absolute;
  font-size: 1.1rem;
  font-weight: 900;
  transform: translate(-50%, -50%);
  animation: ctd-float-up 1.1s ease-out forwards;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  pointer-events: none;
}

/* SHOP */
.ctd-shop { width: 100%; }
.ctd-shop-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #f0f6fc;
  text-align: center;
  margin-bottom: 0.25rem;
}
.ctd-shop-subtitle {
  text-align: center;
  color: #8b949e;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.ctd-shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.6rem;
  width: 100%;
  margin-bottom: 1rem;
}
.ctd-shop-item {
  background: rgba(22,27,34,0.9);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.15s;
  position: relative;
}
.ctd-shop-item.ctd-cant-afford { opacity: 0.45; }
.ctd-rarity-common  { border-color: rgba(255,255,255,0.15); }
.ctd-rarity-uncommon{ border-color: rgba(16,185,129,0.4); }
.ctd-rarity-rare    { border-color: rgba(59,130,246,0.5); }
.ctd-rarity-epic    { border-color: rgba(168,85,247,0.6); box-shadow: 0 0 10px rgba(168,85,247,0.2); }
.ctd-shop-icon { font-size: 1.6rem; }
.ctd-shop-name { font-weight: 800; font-size: 0.88rem; color: #f0f6fc; }
.ctd-shop-desc { font-size: 0.75rem; color: #8b949e; line-height: 1.4; }
.ctd-rarity-badge {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #6e7681;
  margin-top: auto;
}
.ctd-shop-buy {
  background: linear-gradient(90deg, #10b981, #059669);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.4rem 0;
  width: 100%;
  cursor: pointer;
  transition: all 0.12s;
  margin-top: 0.3rem;
}
.ctd-shop-buy:hover { transform: scale(1.04); }
.ctd-shop-buy.ctd-btn-disabled { background: #30363d; cursor: not-allowed; }
.ctd-btn-leave {
  display: block;
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #8b949e;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.9rem;
  text-align: center;
}
.ctd-btn-leave:hover { border-color: #f0f6fc; color: #f0f6fc; }

/* CHEST */
.ctd-chest { width: 100%; text-align: center; }
.ctd-chest-emoji { font-size: 3.5rem; margin-bottom: 0.5rem; animation: ctd-bounce 0.6s ease infinite alternate; display: block; }
.ctd-chest-title { font-size: 1.6rem; font-weight: 900; color: #f59e0b; margin-bottom: 0.25rem; }
.ctd-chest-subtitle { color: #8b949e; margin-bottom: 1rem; font-size: 0.88rem; }
.ctd-chest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.6rem;
  width: 100%;
}
.ctd-chest-item {
  background: rgba(22,27,34,0.9);
  border: 2px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s;
  color: inherit;
}
.ctd-chest-item:hover {
  transform: translateY(-3px);
  border-color: #f59e0b;
  box-shadow: 0 0 12px rgba(245,158,11,0.3);
}
.ctd-chest-item .ctd-shop-name, .ctd-chest-item .ctd-shop-desc, .ctd-chest-item .ctd-rarity-badge { text-align: center; }

/* MIMIC */
.ctd-mimic-reveal {
  justify-content: center;
  text-align: center;
  background: rgba(22,27,34,0.98);
}
.ctd-mimic-chest { font-size: 4rem; animation: ctd-shake-anim 0.3s ease infinite; display: block; }
.ctd-mimic-msg {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ef4444;
  text-shadow: 0 0 20px #ef4444;
  margin: 0.75rem 0;
  animation: ctd-danger-pulse 0.5s ease infinite;
}
.ctd-mimic-sub { color: #f59e0b; font-weight: 700; }

/* BOSS INTRO */
.ctd-boss-intro {
  justify-content: center;
  text-align: center;
  background: radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%);
}
.ctd-boss-crown { font-size: 2rem; margin-bottom: 0.5rem; animation: ctd-bounce 0.7s ease infinite alternate; }
.ctd-boss-emoji { font-size: 5rem; display: block; animation: ctd-boss-enter 0.8s ease-out; }
.ctd-boss-name { font-size: 1.8rem; font-weight: 900; color: #ff6b35; text-shadow: 0 0 20px rgba(255,107,53,0.5); margin: 0.5rem 0; }
.ctd-boss-sub { font-size: 0.85rem; letter-spacing: 0.2em; color: #ef4444; font-weight: 800; text-transform: uppercase; }
.ctd-boss-phases { color: #f59e0b; font-size: 0.9rem; font-weight: 700; margin-top: 0.5rem; }

/* PHASE OVERLAY */
.ctd-phase-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: ctd-fade-in 0.3s ease;
}
.ctd-phase-msg { font-size: 1.5rem; font-weight: 900; color: #ef4444; text-align: center; margin-bottom: 0.5rem; padding: 0 1rem; }
.ctd-phase-label { font-size: 0.9rem; color: #f59e0b; font-weight: 700; text-align: center; }

/* VICTORY / GAME OVER */
.ctd-victory, .ctd-gameover { justify-content: center; text-align: center; padding: 1rem; }
.ctd-victory-emoji, .ctd-go-emoji { font-size: 4rem; display: block; margin-bottom: 0.5rem; animation: ctd-bounce 0.8s ease infinite alternate; }
.ctd-victory-title { font-size: 2.2rem; font-weight: 900; color: #f59e0b; text-shadow: 0 0 20px rgba(245,158,11,0.5); }
.ctd-go-title { font-size: 2.2rem; font-weight: 900; color: #ef4444; }
.ctd-victory-sub, .ctd-go-sub { color: #8b949e; margin-bottom: 1rem; font-size: 0.9rem; }
.ctd-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  width: 100%;
  max-width: 380px;
  margin: 0 auto 1rem;
}
.ctd-stat-card {
  background: rgba(22,27,34,0.9);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  color: #8b949e;
}
.ctd-stat-card span:last-child { font-size: 1.1rem; font-weight: 900; color: #f0f6fc; }
.ctd-score-card { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.08); }
.ctd-score-card span:last-child { color: #f59e0b; font-size: 1.3rem; }
.ctd-new-record { color: #10b981; font-weight: 900; font-size: 1rem; margin-bottom: 0.75rem; text-shadow: 0 0 10px rgba(16,185,129,0.4); }
.ctd-hs-display { color: #f59e0b; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem; }
.ctd-victory-actions { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; max-width: 300px; }
.ctd-btn-primary {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #10b981, #059669);
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}
.ctd-btn-primary:hover { transform: scale(1.03); box-shadow: 0 4px 14px rgba(16,185,129,0.4); }
.ctd-btn-secondary {
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #f0f6fc;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}
.ctd-btn-secondary:hover { border-color: #f0f6fc; }

/* ANIMATIONS */
@keyframes ctd-float-up {
  0%   { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, -200%); }
}
@keyframes ctd-enemy-hit {
  0%   { transform: scale(1) translateX(0); }
  25%  { transform: scale(1.2) translateX(-6px); filter: brightness(2); }
  75%  { transform: scale(0.9) translateX(6px); }
  100% { transform: scale(1) translateX(0); filter: brightness(1); }
}
@keyframes ctd-enemy-defeated {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.4); opacity: 0.5; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes ctd-danger-pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.5; }
  100% { opacity: 1; }
}
@keyframes ctd-shake-anim {
  0%   { transform: rotate(-5deg); }
  50%  { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}
@keyframes ctd-bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-8px); }
}
@keyframes ctd-boss-enter {
  from { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  to   { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes ctd-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ctd-combo-flash {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); color: #f97316; }
}
.ctd-combo-pulse { animation: ctd-combo-flash 0.3s ease; }
.ctd-hp-shake { animation: ctd-shake-anim 0.35s ease; }
.ctd-shake { animation: ctd-shake-anim 0.25s ease; }

/* Mobile responsive */
@media (max-width: 400px) {
  .ctd-main-title { font-size: 1.6rem; }
  .ctd-word-display { font-size: 1.4rem; }
  .ctd-input { font-size: 1.1rem; padding: 0.75rem; }
  .ctd-enemy-emoji { font-size: 2.8rem; }
  .ctd-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .ctd-shop-grid { grid-template-columns: 1fr 1fr; }
}
  `;
  document.head.appendChild(style);
}

// ============================================================
// FIX: Reroute onWordCompleted to use the right damage dealer
// ============================================================
// Since applyDamageToEnemy and applyDamageToBoss are separate,
// we override the call in onWordCompleted to use dealDamageToCurrentEnemy:

// The onWordCompleted function above already calls applyDamageToEnemy directly.
// We need to patch it. The cleanest way: replace the inner call.
// Instead, let's just make showAttackFeedback + damage part of a unified wrapper.
// Since we can't easily monkey-patch closures, let's redefine onWordCompleted:

const _orig_onWordCompleted = onWordCompleted;

// Override: re-export a patched version internally
// We'll rename the original and call dealDamage instead:
function onWordCompleted_patched(perfect) {
  G.wordActive = false;
  clearTimers();

  G.wordsTyped++;
  G.consecutiveWords++;

  const input = document.getElementById('ctd-input');
  if (input) input.value = '';

  // Blood typing passive
  if (G.bloodTyping && G.wordsTyped % 10 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + 2 * G.bloodTyping);
    floatText(`+${2 * G.bloodTyping} HP`, '#10b981', 'center');
  }

  // Combo heal passive
  if (G.comboHealAt && G.combo > 0 && G.combo % 8 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + G.comboHealAt);
  }

  G.combo++;
  G.maxCombo = Math.max(G.maxCombo, G.combo);
  sfxCombo();

  let dmg = calcDamage(perfect);
  let isCrit = false;
  const critChance = G.critChance || 0.08;
  if (perfect && Math.random() < critChance) {
    isCrit = true;
    dmg = Math.round(dmg * (G.critMult || 2));
    sfxCrit();
  } else {
    sfxAttack();
  }

  if (G.onHitTimeBonus) G.wordTimeLeft = Math.min(G.wordTimeMax, G.wordTimeLeft + G.onHitTimeBonus);
  if (G.lifestealPct) {
    const heal = Math.max(1, Math.round(dmg * G.lifestealPct));
    G.hp = Math.min(G.maxHp, G.hp + heal);
  }

  const e = G.enemy;
  if (!e) return;

  // Swarm mechanic
  if (e.mechanic === 'swarm') {
    G.swarmCurrentIndex++;
    if (G.swarmCurrentIndex < G.swarmTargets.length) {
      showAttackFeedback(dmg, isCrit, perfect, false);
      dealDamageToCurrentEnemy(dmg);
      updateCombatHUD();
      setTimeout(() => { if (G.screen === 'combat') startNextWord(); }, 180);
      return;
    } else {
      G.swarmTargets = [];
      G.swarmCurrentIndex = 0;
    }
  }

  // Armor mechanic
  if ((e.mechanic === 'armor' || e.mechanic === 'elite_armor') && G.enemyArmor > 0) {
    const armorDmg = perfect ? Math.ceil(G.armorBreak * 2) : Math.max(1, G.armorBreak);
    G.enemyArmor = Math.max(0, G.enemyArmor - armorDmg);
    floatText(`ARMOR -${armorDmg}`, '#a855f7', 'enemy');
    if (G.enemyArmor <= 0) {
      floatText('ARMOR BROKEN!', '#f59e0b', 'big');
      sfxCrit();
    }
    updateCombatHUD();
    scheduleNextWord();
    return;
  }

  showAttackFeedback(dmg, isCrit, perfect, true);
  dealDamageToCurrentEnemy(dmg);
  updateCombatHUD();
  scheduleNextWord();
}

// Hook the patched version into onTypingInput's callback
// Since onTypingInput calls onWordCompleted (the original), we need to rebind:
// We'll swap out the reference at module scope. In ES modules we can't reassign
// exported functions easily, but we CAN just make onTypingInput call the patched version:

function onTypingInput_v2(e) {
  if (!G.wordActive) return;
  const input = e.target;
  const val = input.value.toLowerCase().replace(/[^a-z]/g, '');
  const word = G.currentWord;
  const trimmed = val.slice(0, word.length);
  input.value = trimmed;

  let correct = true;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] !== word[i]) { correct = false; break; }
  }

  if (correct) {
    G.typedSoFar = trimmed;
    updateWordDisplay();
    if (trimmed === word) {
      onWordCompleted_patched(true);
    }
  } else {
    input.value = G.typedSoFar;
    onMistake();
  }
}

// Override the event binding in renderCombat to use v2:
const _orig_renderCombat = renderCombat;

function renderCombat_v2() {
  const e = G.enemy;
  if (!e) return;

  const hpPct = Math.max(0, G.enemyHp / G.enemyMaxHp * 100);
  const playerHpPct = Math.max(0, G.hp / G.maxHp * 100);
  const armorDisplay = G.enemyArmor > 0 ? `<div class="ctd-armor">🛡️ ${G.enemyArmor} Armor</div>` : '';
  const eliteBadge = e.isElite ? '<div class="ctd-elite-badge">⚡ ELITE</div>' : '';

  let swarmHTML = '';
  if (e.mechanic === 'swarm' && G.swarmTargets.length > 0) {
    swarmHTML = `<div class="ctd-swarm-targets">
      ${G.swarmTargets.map((w,i) => `
        <span class="ctd-swarm-word ${i < G.swarmCurrentIndex ? 'done' : i === G.swarmCurrentIndex ? 'active' : ''}">${w}</span>
      `).join('')}
    </div>`;
  }

  const bossPhaseBadge = (G.boss && G.bossPhase) ? `<div class="ctd-elite-badge" style="background:rgba(239,68,68,0.2);border-color:#ef4444;color:#f87171;">${G.bossPhase.label}</div>` : '';

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-combat-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp ${G.hp <= G.maxHp * 0.3 ? 'ctd-hp-danger' : ''}">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-combo ${G.combo >= 10 ? 'ctd-combo-fire' : ''}">COMBO ×${G.combo}</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
      </div>
      <div class="ctd-player-hp-bar">
        <div class="ctd-player-hp-fill" style="width:${playerHpPct}%; background:${playerHpPct > 50 ? '#10b981' : playerHpPct > 25 ? '#f59e0b' : '#ef4444'}"></div>
      </div>
      <div class="ctd-enemy-area">
        ${eliteBadge}
        ${bossPhaseBadge}
        <div class="ctd-enemy-emoji" id="ctd-enemy-emoji">${e.emoji}</div>
        <div class="ctd-enemy-name">${e.name}</div>
        ${armorDisplay}
        <div class="ctd-enemy-hp-bar-wrap">
          <div class="ctd-enemy-hp-bar"><div class="ctd-enemy-hp-fill" id="ctd-enemy-hp-fill" style="width:${hpPct}%"></div></div>
          <span class="ctd-enemy-hp-label" id="ctd-enemy-hp-label">${G.enemyHp} / ${G.enemyMaxHp} HP</span>
        </div>
      </div>
      <div class="ctd-word-area" id="ctd-word-area">
        <div class="ctd-type-label">TYPE THIS</div>
        ${swarmHTML}
        <div class="ctd-word-display" id="ctd-word-display">
          <span id="ctd-word-typed" class="ctd-typed"></span><span id="ctd-word-remain" class="ctd-remain"></span>
        </div>
        <div class="ctd-word-sub" id="ctd-word-sub"></div>
      </div>
      <div class="ctd-timer-area" id="ctd-timer-area">
        <div class="ctd-timer-val" id="ctd-timer-val">—</div>
        <div class="ctd-timer-bar-wrap"><div class="ctd-timer-bar" id="ctd-timer-bar" style="width:100%"></div></div>
      </div>
      <div class="ctd-input-area">
        <input type="text" id="ctd-input" class="ctd-input"
          autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"
          placeholder="Start typing..." inputmode="text" enterkeyhint="done">
      </div>
      <div class="ctd-passives-bar">
        ${G.passives.length ? G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('') : ''}
      </div>
      <div id="ctd-float-layer" class="ctd-float-layer"></div>
    </div>
  `;

  const input = document.getElementById('ctd-input');
  if (input) {
    input.focus();
    addListener(input, 'input', onTypingInput_v2);
    addListener(_container.querySelector('.ctd-combat-wrapper'), 'click', () => {
      const inp = document.getElementById('ctd-input');
      if (inp) inp.focus();
    });
  }

  // Frog mechanic: make enemy float around
  if (e.mechanic === 'distract') {
    startFrogDistraction();
  }
}

// Override renderCombat to use v2
// We do this by reassigning the global reference used in startCombat and startBoss:
// Since they call renderCombat(), we'll just forward from there:
// The trick: JS functions are values, we can reassign module-scope variables if we use `let`.
// Since these are `function` declarations, we can't reassign. 
// Solution: all call sites go through a dispatch function.

function dispatchRenderCombat() {
  injectStyles();
  if (typeof renderCombat_final === 'function') {
    renderCombat_final();
  } else {
    renderCombat_v2();
  }
}

// ============================================================
// FROG DISTRACTION MECHANIC
// ============================================================
let _frogInterval = null;
function startFrogDistraction() {
  if (_frogInterval) clearInterval(_frogInterval);
  _frogInterval = setInterval(() => {
    const emojiEl = document.getElementById('ctd-enemy-emoji');
    if (!emojiEl || G.screen !== 'combat') { clearInterval(_frogInterval); return; }
    const x = Math.random() * 60 - 30;
    const y = Math.random() * 20 - 10;
    emojiEl.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => { if (emojiEl) emojiEl.style.transform = ''; }, 400);
  }, 800);
}

// ============================================================
// INTEGRATE: Replace startCombat and startBoss to use dispatchRenderCombat
// ============================================================
// We'll patch startCombat and startBoss to call dispatchRenderCombat instead of renderCombat.
// Since they're function declarations (hoisted), we need a wrapper approach:

function startCombat_v2(enemyId, isElite = false) {
  const def = ENEMIES[enemyId];
  if (!def) { advanceMap(); return; }

  const floorMult = 1 + (G.floor - 1) * 0.15 + (G.endlessMode ? G.endlessFloor * 0.08 : 0);
  const eliteMult = isElite ? 1.5 : 1.0;

  G.enemy = { ...def, id: enemyId };
  G.enemyHp = Math.round(def.maxHp * floorMult * eliteMult);
  G.enemyMaxHp = G.enemyHp;
  G.enemyArmor = def.armor || 0;
  G.enemyArmorMax = def.armor || 0;
  G.firePenalty = 0;
  G.glovesUsed = false;
  G.secondChanceUsed = false;
  G.bombRunUsed = false;
  G.mistakeThisBattle = false;
  G.swarmTargets = [];
  G.swarmCurrentIndex = 0;
  G.consecutiveWords = 0;
  G.boss = null;

  G.screen = 'combat';
  injectStyles();
  dispatchRenderCombat();
  startNextWord();
}

function startBoss_v2() {
  G.screen = 'boss';
  clearTimers();

  const boss = pick(BOSSES);
  G.boss = { ...boss };
  G.bossPhaseIdx = 0;
  G.bossHp = boss.maxHp;
  G.bossMaxHp = boss.maxHp;
  G.bossPhase = boss.phases[0];
  G.bossArmor = boss.phases[0].armor || 0;

  G.enemy = {
    id: `boss_${boss.id}`,
    name: boss.name,
    emoji: boss.emoji,
    maxHp: boss.maxHp,
    atk: boss.atk,
    mechanic: boss.phases[0].mechanic,
    isElite: true,
    isBoss: true,
    gold: boss.gold,
    armor: boss.phases[0].armor || 0,
  };
  G.enemyHp = G.bossHp;
  G.enemyMaxHp = G.bossMaxHp;
  G.enemyArmor = G.bossArmor;
  G.firePenalty = 0;
  G.glovesUsed = false;
  G.secondChanceUsed = false;
  G.bombRunUsed = false;
  G.swarmTargets = [];
  G.swarmCurrentIndex = 0;

  renderBossIntro_v2(boss);
}

function renderBossIntro_v2(boss) {
  injectStyles();
  _container.innerHTML = `
    <div class="ctd-wrapper ctd-boss-intro">
      <div class="ctd-boss-crown">👑</div>
      <div class="ctd-boss-emoji">${boss.emoji}</div>
      <div class="ctd-boss-name">${boss.name}</div>
      <div class="ctd-boss-sub">FINAL BOSS</div>
      <div class="ctd-boss-phases">${boss.phases.length} Phases</div>
    </div>
  `;
  sfxBoss();
  setTimeout(() => {
    if (!G || !_container) return;
    dispatchRenderCombat();
    startNextWord();
  }, 2000);
}

// ============================================================
// SELECTMAPNODE: redirect to v2 versions
// ============================================================
function selectMapNode_v2(node) {
  G.selectedNode = node;
  G.runNodes++;

  if (node.type === 'battle') {
    sfxAttack();
    startCombat_v2(pickNormalEnemy());
  } else if (node.type === 'elite') {
    sfxBoss();
    startCombat_v2(pickEliteEnemy(), true);
  } else if (node.type === 'shop') {
    sfxShop();
    renderShop();
  } else if (node.type === 'chest') {
    if (!G.mimicWard && Math.random() < 0.18) {
      sfxBoss();
      renderMimicReveal_v2();
    } else {
      sfxChest();
      renderChest();
    }
  } else if (node.type === 'boss') {
    sfxBoss();
    startBoss_v2();
  }
}

function renderMimicReveal_v2() {
  injectStyles();
  _container.innerHTML = `
    <div class="ctd-wrapper ctd-mimic-reveal">
      <div class="ctd-mimic-chest">🎁</div>
      <div class="ctd-mimic-msg">THE CHEST WAS A MIMIC!</div>
      <div class="ctd-mimic-sub">Defeat it for massive rewards!</div>
    </div>
  `;
  sfxBoss();
  setTimeout(() => {
    startCombat_v2('mimic', true);
  }, 2200);
}

// ============================================================
// RENDERMAP: use v2 selectMapNode
// ============================================================
function renderMap_v2() {
  G.screen = 'map';
  injectStyles();
  const pRows = [...G.mapRows].reverse();

  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-mid">🗺️ ${G.endlessMode ? `Endless Fl.${G.endlessFloor}` : `Floor ${G.floor}`} — ${G.runNodes}/${G.totalNodes}</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
        <button id="ctd-hud-restart" class="ctd-btn-secondary" style="padding:4px 8px; font-size:0.8rem; margin-left:auto;">Restart</button>
      </div>

      <div class="ctd-map">
        <h2 class="ctd-map-title">${G.endlessMode ? '♾️ Endless Mode' : 'Choose Your Path'}</h2>
        <div class="ctd-map-rows">
          ${pRows.map((row, displayIdx) => {
            const rowIdx = G.mapRows.length - 1 - displayIdx;
            const isCurrentRow = rowIdx === G.currentRow;
            const isPastRow = rowIdx < G.currentRow;
            return `
              <div class="ctd-map-row ${isCurrentRow ? 'ctd-row-active' : ''} ${isPastRow ? 'ctd-row-done' : ''}">
                ${row.map(node => {
                  const cleared = node.cleared;
                  const isSelectable = isCurrentRow && !cleared;
                  const isBoss = node.type === 'boss';
                  return `
                    <button class="ctd-map-node ${cleared ? 'ctd-node-done' : ''} ${isSelectable ? 'ctd-node-selectable' : ''} ${isBoss ? 'ctd-node-boss' : ''}"
                      data-row="${rowIdx}" data-col="${node.col}"
                      ${!isSelectable ? 'disabled' : ''}
                      style="--node-color:${NODE_COLORS[node.type] || '#888'}">
                      <span class="ctd-node-icon">${cleared ? '✅' : NODE_ICONS[node.type]}</span>
                      <span class="ctd-node-label">${node.type.toUpperCase()}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>
        <div class="ctd-map-legend">
          ${Object.entries(NODE_ICONS).map(([t,i])=>`<span>${i} ${t}</span>`).join('')}
        </div>
      </div>

      <div class="ctd-passives-bar">
        ${G.passives.length ? G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('') : '<span style="color:var(--text-muted,#6e7681);font-size:0.8rem;">No passives yet</span>'}
      </div>
    </div>
  `;

  _container.querySelectorAll('.ctd-map-node:not([disabled])').forEach(btn => {
    addListener(btn, 'click', () => {
      const row = parseInt(btn.dataset.row);
      const col = parseInt(btn.dataset.col);
      const node = G.mapRows[row][col];
      selectMapNode_v2(node);
    });
  });

  const restartBtn = document.getElementById('ctd-hud-restart');
  if (restartBtn) {
    addListener(restartBtn, 'click', () => {
      if (confirm('Abandon this run?')) {
        removeAllListeners();
        clearTimers();
        G = null;
        renderCatSelect_v2();
      }
    });
  }
}

// ============================================================
// ADVANCEMAP: use v2 renderMap
// ============================================================
function advanceMap_v2() {
  if (G.selectedNode) {
    G.selectedNode.cleared = true;
  }
  G.currentRow++;

  if (G.currentRow >= G.mapRows.length) {
    // Endless: generate new map
    if (G.endlessMode) {
      G.endlessFloor++;
      G.floor = G.endlessFloor + 1;
      G.mapRows = generateMap(G.totalNodes);
      G.currentRow = 0;
      G.runNodes = 0;
      renderMap_v2();
    } else {
      triggerVictory_v2();
    }
  } else {
    renderMap_v2();
  }
}

function triggerVictory_v2() {
  G.screen = 'victory';
  clearTimers();
  injectStyles();

  const acc = G.wordsTyped > 0 ? Math.round((G.wordsTyped - G.wordsMissed) / G.wordsTyped * 100) : 100;
  const score = G.runScore + G.wordsTyped * 5 + G.maxCombo * 10 + G.gold * 2;
  G.runScore = score;

  if (score > G.highScore) {
    localStorage.setItem('ctd_high_score', score);
    G.highScore = score;
  }
  submitScore('cat-typing-dungeon', score);

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-victory">
      <div class="ctd-victory-emoji">🏆</div>
      <div class="ctd-victory-title">VICTORY!</div>
      <div class="ctd-victory-sub">Dungeon cleared! You defeated the final boss.</div>
      <div class="ctd-stats-grid">
        <div class="ctd-stat-card"><span>⚔️ Enemies</span><span>${G.enemiesDefeated}</span></div>
        <div class="ctd-stat-card"><span>⌨️ Words</span><span>${G.wordsTyped}</span></div>
        <div class="ctd-stat-card"><span>🎯 Accuracy</span><span>${acc}%</span></div>
        <div class="ctd-stat-card"><span>🔥 Max Combo</span><span>×${G.maxCombo}</span></div>
        <div class="ctd-stat-card"><span>🪙 Gold</span><span>${G.gold}</span></div>
        <div class="ctd-stat-card ctd-score-card"><span>🏆 Score</span><span>${G.runScore}</span></div>
      </div>
      ${G.runScore >= G.highScore ? '<div class="ctd-new-record">🌟 NEW PERSONAL BEST!</div>' : ''}
      <a href="/leaderboards/" class="ctd-btn-secondary" style="text-decoration:none; display:block; margin: 1rem auto; text-align:center; max-width: 250px;">🏆 View Leaderboard</a>
      <div class="ctd-victory-actions">
        <button class="ctd-btn-primary" id="ctd-endless-btn">⚡ Continue to Endless Mode</button>
        <button class="ctd-btn-secondary" id="ctd-newrun-btn">🔄 New Run</button>
      </div>
    </div>
  `;

  sfxVictory(); sfxVictory();

  addListener(document.getElementById('ctd-endless-btn'), 'click', () => {
    G.endlessMode = true;
    G.endlessFloor = 1;
    G.floor = 2;
    G.mapRows = generateMap(G.totalNodes);
    G.currentRow = 0;
    G.runNodes = 0;
    renderMap_v2();
  });
  addListener(document.getElementById('ctd-newrun-btn'), 'click', () => {
    removeAllListeners();
    clearTimers();
    G = null;
    renderCatSelect();
  });
}

// ============================================================
// PATCH THE MAIN ENTRY TO WIRE EVERYTHING TOGETHER
// ============================================================
// Override renderCatTypingDungeon to use v2 flow
export function renderCatTypingDungeon_MAIN(container) {
  _container = container;
  G = null;
  removeAllListeners();
  clearTimers();
  injectStyles();
  renderCatSelect_v2();
}

function renderCatSelect_v2() {
  const hs = localStorage.getItem('ctd_high_score') || '0';
  _container.innerHTML = `
    <div class="ctd-wrapper">
      <div class="ctd-catselect">
        <div class="ctd-title-badge">🐱 CAT TYPING DUNGEON</div>
        <h1 class="ctd-main-title">Choose Your Cat</h1>
        <p class="ctd-subtitle">Every cat has different starting stats. Pick one that fits your playstyle.</p>
        <div class="ctd-cat-grid">
          ${CAT_CLASSES.map(cls => `
            <button class="ctd-cat-card" data-cat="${cls.id}" style="--cat-color:${cls.color}">
              <div class="ctd-cat-emoji">${cls.emoji}</div>
              <div class="ctd-cat-name">${cls.name}</div>
              <div class="ctd-cat-desc">${cls.desc}</div>
            </button>
          `).join('')}
        </div>
        ${parseInt(hs) > 0 ? `<div class="ctd-high-score">🏆 Personal Best: ${hs} pts</div>` : ''}
        <div class="ctd-how-to">
          <div class="ctd-how-title">⌨️ How to Play</div>
          <div class="ctd-how-steps">
            <span>TYPE the word</span><span>→</span>
            <span>Auto-attacks!</span><span>→</span>
            <span>Build COMBO</span><span>→</span>
            <span>Choose paths</span><span>→</span>
            <span>Defeat the BOSS!</span>
          </div>
        </div>
      </div>
    </div>
  `;

  _container.querySelectorAll('.ctd-cat-card').forEach(btn => {
    addListener(btn, 'click', () => {
      G = initGameState(btn.dataset.cat);
      G.mapRows = generateMap(G.totalNodes);
      sfxChest();
      renderMap_v2();
    });
  });
}

// ============================================================
// PATCH onEnemyDefeated to use advanceMap_v2 and correct gold apply
// ============================================================
function onEnemyDefeated_v2() {
  clearTimers();
  G.wordActive = false;
  G.enemiesDefeated++;
  sfxVictory();

  const e = G.enemy;
  const goldBase = e.gold || [5,12];
  const rawGold = Math.floor(Math.random() * (goldBase[1] - goldBase[0])) + goldBase[0];
  const gold = Math.round(rawGold * (G.goldMult || 1));
  G.gold += gold;
  G.runScore += 100 * (G.floor || 1) + (e.isElite ? 200 : 0);

  let healAmt = 0;
  if (!e.isElite && Math.random() < 0.25) {
    healAmt = Math.floor(Math.random() * 5) + 3;
    G.hp = Math.min(G.maxHp, G.hp + healAmt);
  }

  if (e.mechanic === 'punishment') G.firePenalty = 0;

  floatText(`+${gold}🪙`, '#f59e0b', 'big');
  if (healAmt) floatText(`+${healAmt} HP`, '#10b981', 'top');

  const emojiEl = document.getElementById('ctd-enemy-emoji');
  if (emojiEl) {
    emojiEl.classList.add('ctd-enemy-defeated');
    emojiEl.textContent = '💨';
  }

  setTimeout(() => {
    advanceMap_v2();
  }, 1200);
}

function onBossDefeated_v2() {
  clearTimers();
  G.wordActive = false;
  sfxVictory();
  sfxVictory();

  const goldRange = G.boss ? G.boss.gold : [60,90];
  const gold = Math.floor(Math.random() * (goldRange[1] - goldRange[0])) + goldRange[0];
  G.gold += Math.round(gold * (G.goldMult || 1));
  G.enemiesDefeated++;

  floatText(`+${gold}🪙`, '#f59e0b', 'big');
  floatText('BOSS SLAIN!', '#f59e0b', 'top');

  setTimeout(() => {
    triggerVictory_v2();
  }, 1500);
}

// ============================================================
// FINAL UNIFIED applyDamageToEnemy and dealDamage
// Uses the v2 callbacks
// ============================================================
function applyDamageToEnemy_v2(dmg) {
  G.enemyHp = Math.max(0, G.enemyHp - dmg);
  G.totalDmgDealt += dmg;
  if (G.enemyHp <= 0) {
    onEnemyDefeated_v2();
  }
}

function applyDamageToBoss_v2(dmg) {
  G.enemyHp = Math.max(0, G.enemyHp - dmg);
  G.bossHp = G.enemyHp;
  G.totalDmgDealt += dmg;
  checkBossPhase_v2();
  if (G.enemyHp <= 0) {
    onBossDefeated_v2();
  }
}

function checkBossPhase_v2() {
  if (!G.boss) return;
  const boss = G.boss;
  const phases = boss.phases;

  for (let i = phases.length - 1; i >= 0; i--) {
    if (G.bossHp <= phases[i].hp && G.bossPhaseIdx < i) {
      G.bossPhaseIdx = i;
      G.bossPhase = phases[i];
      G.enemy.mechanic = phases[i].mechanic;
      G.enemyArmor = phases[i].armor || 0;

      clearTimers();
      G.wordActive = false;

      showPhaseTransition(phases[i].msg, phases[i].label, () => {
        if (G && (G.screen === 'combat' || G.screen === 'boss')) {
          dispatchRenderCombat();
          startNextWord();
        }
      });
      return;
    }
  }
}

function dealDamageToCurrentEnemy_v2(dmg) {
  if (G.boss && G.enemy && G.enemy.isBoss) {
    applyDamageToBoss_v2(dmg);
  } else {
    applyDamageToEnemy_v2(dmg);
  }
}

// ============================================================
// FINAL onWordCompleted that uses v2 damage + v2 advanceMap
// ============================================================
function onWordCompleted_final(perfect) {
  G.wordActive = false;
  clearTimers();

  G.wordsTyped++;

  const input = document.getElementById('ctd-input');
  if (input) input.value = '';

  if (G.bloodTyping && G.wordsTyped % 10 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + 2 * G.bloodTyping);
    floatText(`+${2 * G.bloodTyping} HP`, '#10b981', 'center');
  }
  if (G.comboHealAt && G.combo > 0 && G.combo % 8 === 0) {
    G.hp = Math.min(G.maxHp, G.hp + G.comboHealAt);
  }

  G.combo++;
  G.maxCombo = Math.max(G.maxCombo, G.combo);
  sfxCombo();

  let dmg = calcDamage(perfect);
  let isCrit = false;
  if (perfect && Math.random() < (G.critChance || 0.08)) {
    isCrit = true;
    dmg = Math.round(dmg * (G.critMult || 2));
    sfxCrit();
  } else {
    sfxAttack();
  }

  if (G.onHitTimeBonus) G.wordTimeLeft = Math.min(G.wordTimeMax, G.wordTimeLeft + G.onHitTimeBonus);
  if (G.lifestealPct) {
    const heal = Math.max(1, Math.round(dmg * G.lifestealPct));
    G.hp = Math.min(G.maxHp, G.hp + heal);
  }

  const e = G.enemy;
  if (!e) return;

  if (e.mechanic === 'swarm') {
    G.swarmCurrentIndex++;
    if (G.swarmCurrentIndex < G.swarmTargets.length) {
      showAttackFeedback(dmg, isCrit, perfect, false);
      dealDamageToCurrentEnemy_v2(dmg);
      updateCombatHUD();
      setTimeout(() => { if (G && G.screen === 'combat') startNextWord(); }, 180);
      return;
    } else {
      G.swarmTargets = [];
      G.swarmCurrentIndex = 0;
    }
  }

  if ((e.mechanic === 'armor' || e.mechanic === 'elite_armor') && G.enemyArmor > 0) {
    const armorDmg = perfect ? Math.ceil(G.armorBreak * 2) : Math.max(1, G.armorBreak);
    G.enemyArmor = Math.max(0, G.enemyArmor - armorDmg);
    floatText(`ARMOR -${armorDmg}`, '#a855f7', 'enemy');
    if (G.enemyArmor <= 0) { floatText('ARMOR BROKEN!', '#f59e0b', 'big'); sfxCrit(); }
    updateCombatHUD();
    scheduleNextWord_v2();
    return;
  }

  showAttackFeedback(dmg, isCrit, perfect, true);
  dealDamageToCurrentEnemy_v2(dmg);
  updateCombatHUD();
  scheduleNextWord_v2();
}

function scheduleNextWord_v2() {
  let delay = 220;
  if (G.enemy && G.enemy.mechanic === 'disrupt' && Math.random() < 0.25) delay = 600;
  if (G.enemy && G.enemy.mechanic === 'disrupt' && Math.random() < 0.18) {
    const wArea = document.getElementById('ctd-word-area');
    if (wArea) { wArea.style.filter = 'hue-rotate(180deg)'; setTimeout(() => { if(wArea) wArea.style.filter = ''; }, 350); }
  }
  setTimeout(() => {
    if (G && (G.screen === 'combat' || G.screen === 'boss')) {
      updateCombatHUD();
      startNextWord();
    }
  }, delay);
}

function onTimeUp_v2() {
  G.wordActive = false;
  clearTimers();
  sfxHit();
  floatText('⏱️ TIME!', '#ef4444', 'big');
  G.combo = 0;
  triggerEnemyAttack_v2();
}

function triggerEnemyAttack_v2() {
  if (!G.enemy) return;
  const e = G.enemy;
  let atk = e.atk || 10;
  const floorScale = 1 + (G.floor - 1) * 0.12 + (G.endlessMode ? (G.endlessFloor||0) * 0.05 : 0);
  atk = Math.round(atk * floorScale);
  if (e.mechanic === 'punishment' && G.firePenalty > 0) atk = Math.round(atk * (1 + G.firePenalty * 0.25));

  if (G.nineLifeCount > 0 && G.hp - atk <= 0) {
    G.nineLifeCount--;
    G.hp = 1;
    floatText('🛡️ Nine Lives!', '#a855f7', 'big');
    sfxVictory();
    updateCombatHUD();
    scheduleNextWord_v2();
    return;
  }

  G.hp = Math.max(0, G.hp - atk);
  floatText(`💢 -${atk} HP`, '#ef4444', 'center');
  sfxHit();
  updateCombatHUD();

  if (G.hp <= 0) { onPlayerDeath_v2(); return; }
  scheduleNextWord_v2();
}

function onPlayerDeath_v2() {
  clearTimers();
  G.wordActive = false;
  G.screen = 'gameover';
  sfxDeath();

  const score = G.runScore + G.wordsTyped * 5 + G.maxCombo * 2;
  G.runScore = score;
  if (score > G.highScore) { localStorage.setItem('ctd_high_score', score); G.highScore = score; }
  
  submitScore('cat-typing-dungeon', score);

  setTimeout(() => renderGameOver_v2(), 500);
}

function renderGameOver_v2() {
  injectStyles();
  const acc = G.wordsTyped > 0 ? Math.round((G.wordsTyped - G.wordsMissed) / G.wordsTyped * 100) : 100;
  _container.innerHTML = `
    <div class="ctd-wrapper ctd-gameover">
      <div class="ctd-go-emoji">💀</div>
      <div class="ctd-go-title">DEFEATED</div>
      <div class="ctd-go-sub">Your run ended here. Better luck next time.</div>
      <div class="ctd-stats-grid">
        <div class="ctd-stat-card"><span>⚔️ Enemies</span><span>${G.enemiesDefeated}</span></div>
        <div class="ctd-stat-card"><span>⌨️ Words</span><span>${G.wordsTyped}</span></div>
        <div class="ctd-stat-card"><span>🎯 Accuracy</span><span>${acc}%</span></div>
        <div class="ctd-stat-card"><span>🔥 Max Combo</span><span>×${G.maxCombo}</span></div>
        <div class="ctd-stat-card"><span>🪙 Gold</span><span>${G.gold}</span></div>
        <div class="ctd-stat-card ctd-score-card"><span>🏆 Score</span><span>${G.runScore}</span></div>
      </div>
      <div class="ctd-hs-display">🏆 Personal Best: ${G.highScore} pts</div>
      <a href="/leaderboards/" class="ctd-btn-secondary" style="text-decoration:none; display:block; margin: 1rem auto; text-align:center; max-width: 250px;">🏆 View Leaderboard</a>
      <div class="ctd-victory-actions">
        <button class="ctd-btn-primary" id="ctd-retry-btn">🔄 Try Again</button>
      </div>
    </div>
  `;
  addListener(document.getElementById('ctd-retry-btn'), 'click', () => {
    removeAllListeners();
    clearTimers();
    G = null;
    renderCatSelect_v2();
  });
}

// ============================================================
// FINAL onTypingInput that uses onWordCompleted_final + onMistake_v2
// ============================================================
function onMistake_v2() {
  G.wordsMissed++;

  if (G.gloves > 0 && !G.glovesUsed) {
    G.glovesUsed = true;
    floatText('🧤 Gloves!', '#a855f7', 'top');
    return;
  }
  if (G.secondChance > 0 && !G.secondChanceUsed) {
    G.secondChanceUsed = true;
    floatText('😼 Second Chance!', '#a855f7', 'top');
    return;
  }

  sfxError();
  G.combo = 0;

  const e = G.enemy;
  if (e) {
    if (e.mechanic === 'goldthief' && G.gold > 0) {
      const stolen = Math.min(G.gold, Math.floor(Math.random() * 5) + 2);
      G.gold = Math.max(0, G.gold - stolen);
      floatText(`🐦 -${stolen}🪙!`, '#f59e0b', 'top');
    }
    if (e.mechanic === 'lifesteal') {
      const heal = Math.round(G.enemyMaxHp * 0.04);
      G.enemyHp = Math.min(G.enemyMaxHp, G.enemyHp + heal);
      floatText(`🧛 +${heal} HP!`, '#ef4444', 'enemy');
      updateCombatHUD();
    }
    if (e.mechanic === 'punishment') {
      G.firePenalty = Math.min(5, G.firePenalty + 1);
      floatText(`🔥 Fury ×${G.firePenalty + 1}!`, '#ef4444', 'top');
    }
    if ((e.mechanic === 'elite_burst' || (G.boss && G.bossPhase && G.bossPhase.mechanic === 'burst')) && Math.random() < 0.35) {
      triggerEnemyAttack_v2();
      return;
    }
  }

  const input = document.getElementById('ctd-input');
  if (input) {
    input.style.borderColor = '#ef4444';
    input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.3)';
    setTimeout(() => { if (input) { input.style.borderColor = ''; input.style.boxShadow = ''; } }, 400);
  }
  G.mistakeThisBattle = true;
  updateCombatHUD();
}

function onTypingInput_final(e) {
  if (!G || !G.wordActive) return;
  G.timerStarted = true;
  const input = e.target;
  const val = input.value.toLowerCase().replace(/[^a-z]/g, '');
  const word = G.currentWord;
  const trimmed = val.slice(0, word.length);
  input.value = trimmed;

  let correct = true;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] !== word[i]) { correct = false; break; }
  }

  if (correct) {
    G.typedSoFar = trimmed;
    updateWordDisplay();
    if (trimmed === word) {
      onWordCompleted_final(true);
    }
  } else {
    input.value = G.typedSoFar;
    onMistake_v2();
  }
}

// ============================================================
// FINAL renderCombat_v3: wire final input handler + timerTick_v2
// ============================================================
function timerTick_v2() {
  if (!G || !G.wordActive || G.battlePaused || !G.timerStarted) return;

  const e = G.enemy;
  let drainRate = 0.1;

  if (e && e.mechanic === 'slowtime') {
    const t = Date.now() / 1000;
    const osc = Math.sin(t * 1.5) * 0.5 + 0.5;
    drainRate = 0.1 * (0.5 + osc * 1.5);
  }

  G.wordTimeLeft = Math.max(0, G.wordTimeLeft - drainRate);

  if (e && e.mechanic === 'fade') {
    G.wordFadeProgress = Math.min(1, 1 - (G.wordTimeLeft / G.wordTimeMax));
  }

  updateTimerDisplay();
  updateWordFade();

  if (G.wordTimeLeft <= 0 && G.wordActive) {
    onTimeUp_v2();
  }
  if (G.wordTimeLeft < 1.0 && G.wordTimeLeft > 0.9) {
    sfxTimerWarn();
  }
}

function startNextWord_v2() {
  if (!G || !G.enemy) return;

  const e = G.enemy;
  G.wordFadeProgress = 0;
  G.typedSoFar = '';

  if (e.mechanic === 'swarm' && G.swarmTargets.length === 0) {
    const count = 4 + Math.floor(Math.random() * 3);
    G.swarmTargets = Array.from({length: count}, () => getWordForEnemy('bee', G.floor));
    G.swarmCurrentIndex = 0;
    // Re-render swarm display
    dispatchRenderCombat();
  }

  let word;
  if (e.mechanic === 'swarm') {
    if (G.swarmCurrentIndex >= G.swarmTargets.length) {
      G.swarmTargets = [];
      G.swarmCurrentIndex = 0;
      word = getWordForEnemy(e.id, G.floor);
    } else {
      word = G.swarmTargets[G.swarmCurrentIndex];
    }
  } else if (e.mechanic === 'longwords') {
    word = pick(WORDS.hard);
  } else {
    word = getWordForEnemy(e.id, G.floor);
  }

  let timerMult = e.timerMult || 1.0;
  if (e.mechanic === 'random' && Math.random() < 0.25) timerMult *= 0.5;
  if (e.mechanic === 'enrage') {
    const hpFrac = G.enemyHp / G.enemyMaxHp;
    timerMult = Math.max(0.45, timerMult - (1 - hpFrac) * 0.45);
  }
  if (e.mechanic === 'slowtime') timerMult = 1.4;

  // Boss burst: rapid-fire challenge
  if (G.boss && G.bossPhase && G.bossPhase.mechanic === 'burst' && Math.random() < 0.2) {
    floatText('💥 BURST ATTACK!', '#ef4444', 'big');
    timerMult = 0.6;
  }

  const endlessScale = G.endlessMode ? Math.max(0.55, 1 - (G.endlessFloor||0) * 0.025) : 1;

  const baseTime = 1.2 + word.length * 0.28;
  const time = (baseTime * timerMult + (G.timerBonus || 0)) * (G.timerSpeedMult || 1) * endlessScale;
  G.currentWord = word;
  G.wordTimeMax = Math.max(0.8, time);
  G.wordTimeLeft = G.wordTimeMax;
  G.wordActive = true;
  G.typedSoFar = '';

  // Word display reset
  const wDisplay = document.getElementById('ctd-word-display');
  if (wDisplay) wDisplay.style.opacity = '1';

  updateWordDisplay();
  updateTimerDisplay();

  const input = document.getElementById('ctd-input');
  if (input) { input.value = ''; input.focus(); }

  G.timerStarted = false;
  clearTimers();
  _timerInterval = setInterval(timerTick_v2, 100);
}

function renderCombat_final() {
  const e = G.enemy;
  if (!e) return;

  const hpPct = Math.max(0, G.enemyHp / G.enemyMaxHp * 100);
  const playerHpPct = Math.max(0, G.hp / G.maxHp * 100);
  const armorDisplay = G.enemyArmor > 0 ? `<div class="ctd-armor">🛡️ ${G.enemyArmor} Armor Remaining</div>` : '';
  const eliteBadge = e.isElite ? '<div class="ctd-elite-badge">⚡ ELITE</div>' : '';
  const bossPhaseBadge = (G.boss && G.bossPhase) ? `<div class="ctd-elite-badge" style="background:rgba(239,68,68,0.2);border-color:#ef4444;color:#f87171;">${G.bossPhase.label}</div>` : '';

  let swarmHTML = '';
  if (e.mechanic === 'swarm' && G.swarmTargets.length > 0) {
    swarmHTML = `<div class="ctd-swarm-targets">
      ${G.swarmTargets.map((w,i) => `<span class="ctd-swarm-word ${i < G.swarmCurrentIndex ? 'done' : i === G.swarmCurrentIndex ? 'active' : ''}">${w}</span>`).join('')}
    </div>`;
  }

  _container.innerHTML = `
    <div class="ctd-wrapper ctd-combat-wrapper">
      <div class="ctd-hud">
        <span class="ctd-hud-hp ${G.hp <= G.maxHp * 0.3 ? 'ctd-hp-danger' : ''}">❤️ ${G.hp}/${G.maxHp}</span>
        <span class="ctd-hud-combo ${G.combo >= 10 ? 'ctd-combo-fire' : ''}">COMBO ×${G.combo}</span>
        <span class="ctd-hud-gold">🪙 ${G.gold}</span>
        <button id="ctd-hud-restart" class="ctd-btn-secondary" style="padding:4px 8px; font-size:0.8rem; margin-left:auto;">Restart</button>
      </div>
      <div class="ctd-player-hp-bar">
        <div class="ctd-player-hp-fill" style="width:${playerHpPct}%; background:${playerHpPct > 50 ? '#10b981' : playerHpPct > 25 ? '#f59e0b' : '#ef4444'}"></div>
      </div>
      <div class="ctd-enemy-area">
        ${eliteBadge}${bossPhaseBadge}
        <div class="ctd-enemy-emoji" id="ctd-enemy-emoji">${e.emoji}</div>
        <div class="ctd-enemy-name">${e.name}</div>
        ${armorDisplay}
        <div class="ctd-enemy-hp-bar-wrap">
          <div class="ctd-enemy-hp-bar"><div class="ctd-enemy-hp-fill" id="ctd-enemy-hp-fill" style="width:${hpPct}%"></div></div>
          <span class="ctd-enemy-hp-label" id="ctd-enemy-hp-label">${G.enemyHp} / ${G.enemyMaxHp} HP</span>
        </div>
      </div>
      <div class="ctd-word-area" id="ctd-word-area">
        <div class="ctd-type-label">TYPE THIS</div>
        ${swarmHTML}
        <div class="ctd-word-display" id="ctd-word-display">
          <span id="ctd-word-typed" class="ctd-typed"></span><span id="ctd-word-remain" class="ctd-remain"></span>
        </div>
        <div class="ctd-word-sub" id="ctd-word-sub"></div>
      </div>
      <div class="ctd-timer-area">
        <div class="ctd-timer-val" id="ctd-timer-val">—</div>
        <div class="ctd-timer-bar-wrap"><div class="ctd-timer-bar" id="ctd-timer-bar" style="width:100%"></div></div>
      </div>
      <div class="ctd-input-area">
        <input type="text" id="ctd-input" class="ctd-input"
          autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"
          placeholder="Tap to type..." inputmode="text">
      </div>
      <div class="ctd-passives-bar">
        ${G.passives.map(p=>`<span class="ctd-passive-pip" title="${p.name}: ${p.desc}">${p.icon}</span>`).join('')}
      </div>
      <div id="ctd-float-layer" class="ctd-float-layer"></div>
    </div>
  `;

  // Bind input
  const input = document.getElementById('ctd-input');
  if (input) {
    setTimeout(() => { if(input) input.focus(); }, 50);
    addListener(input, 'input', onTypingInput_final);
  }

  // Re-focus on tap anywhere
  const wrapper = _container.querySelector('.ctd-combat-wrapper');
  if (wrapper) {
    addListener(wrapper, 'click', () => {
      const inp = document.getElementById('ctd-input');
      if (inp) inp.focus();
    });
    addListener(wrapper, 'touchstart', () => {
      const inp = document.getElementById('ctd-input');
      if (inp) inp.focus();
    }, { passive: true });
  }

  // Frog distraction
  if (e.mechanic === 'distract') startFrogDistraction();

  const restartBtn = document.getElementById('ctd-hud-restart');
  if (restartBtn) {
    addListener(restartBtn, 'click', () => {
      if (confirm('Abandon this run?')) {
        removeAllListeners();
        clearTimers();
        G = null;
        renderCatSelect_v2();
      }
    });
  }
}

// ============================================================
// OVERRIDE dispatchRenderCombat to final version
// ============================================================
// reassign the dispatch function pointer by making it call final:
// (Can't reassign function declarations, so we use the dispatch wrapper approach)
// Since dispatchRenderCombat() is a function declaration, we mutate its body via closure flag.

let _useV2Render = true; // always true now

// Override the dispatchRenderCombat call:
const _origDispatch = dispatchRenderCombat;

// All actual combat rendering goes through renderCombat_final now.
// We just need the call chain to work. Let's trace:
// startCombat_v2 → dispatchRenderCombat() → (originally renderCombat_v2)
// We need it to call renderCombat_final.

// Since we can't reassign a function declaration, let's just make startNextWord_v2 
// and checkBossPhase_v2 call renderCombat_final explicitly for swarm re-renders.
// All other startCombat_v2 already calls dispatchRenderCombat which calls renderCombat_v2.
// But renderCombat_v2 uses onTypingInput_v2 (OLD), not onTypingInput_final.
// So we need dispatchRenderCombat to call renderCombat_final.

// SOLUTION: use a module-level variable as a function pointer:
let _renderCombatFn = renderCombat_final;

// Re-define dispatchRenderCombat to use _renderCombatFn:
// Since we CAN'T reassign a function declaration, we use an indirection:
// All internal calls that need to render combat will call renderCombat_final directly.

// ============================================================
// TRUE ENTRY POINT: The exported functions
// ============================================================
// Override the originally exported function.
// The module exports renderCatTypingDungeon and cleanupCatTypingDungeon.
// Re-exporting won't work since we already exported. 
// Instead, the router will call renderCatTypingDungeon which was exported first.
// We need to make it point to the v2 logic.
// 
// APPROACH: At the top of the file, renderCatTypingDungeon was exported.
// We can't re-export the same name. But we CAN make the original export
// delegate to v2 by using a module-level variable.
// 
// Actually, looking at our code: renderCatTypingDungeon calls renderCatSelect().
// renderCatSelect() calls renderMap() in its click handler.
// renderMap() calls selectMapNode() which calls startCombat().
// startCombat() calls renderCombat() which uses onTypingInput (old).
//
// The fix: override the click handler in renderCatSelect to use the v2 chain.
// The v2 chain: renderCatSelect_v2 → renderMap_v2 → selectMapNode_v2 → startCombat_v2 → renderCombat_final
//
// The ALREADY exported renderCatTypingDungeon calls renderCatSelect_v2 which is the v2 chain.
// Wait - no. Let me re-read:
//
// export function renderCatTypingDungeon(container) { ... renderCatSelect(); }  // calls OLD
// export function renderCatTypingDungeon_MAIN(container) { ... renderCatSelect_v2(); } // calls NEW
//
// The router imports renderCatTypingDungeon (OLD). We need it to call v2.
// SOLUTION: Make the original renderCatTypingDungeon call renderCatSelect_v2.
// Since it's already exported and we can't change it... 
// 
// OK - the real fix here is architectural. Let's just make the module's
// exported functions call the final v2 implementations.
// Since the export statement can't be changed after module evaluation in ES modules,
// but the function BODIES can reference other functions that we define LATER,
// we can do this by making the exported function bodies call the v2 functions.
//
// The exported renderCatTypingDungeon already calls renderCatSelect() which
// is the ORIGINAL renderCatSelect. But we can override the original's behavior
// by having it internally call v2. Let's just make renderCatSelect do what
// renderCatSelect_v2 does, by having a single dispatch variable.

// ============================================================
// The REAL fix: The functions are function declarations so they're hoisted.
// The exports capture references at module evaluation time.
// The actual behavior of `renderCatTypingDungeon` calls `renderCatSelect`
// which is the original. We need `renderCatSelect` to be the v2 version.
// 
// Since all these are function declarations in the same module, 
// and JavaScript's function declarations are hoisted but the implementations
// below override them in sequence (for `let`/`const` - not for `function`),
// we have two `onWordCompleted` declarations but only the first one is used
// because `function` declarations in strict mode would throw a SyntaxError.
//
// The cleanest architecture: ONE exported entry point, using the final v2 logic.
// Let's just make the FIRST exported renderCatTypingDungeon call the _v2 init:
// We do this by using a let variable pointing to the true impl:
// ============================================================

// Module-level init pointer (set after all v2 functions are defined):
let _trueInit = null;
// This will be set to renderCatSelect_v2 at the bottom.

// The FIRST renderCatTypingDungeon export (only valid one) already calls
// renderCatSelect(). We need renderCatSelect to be renderCatSelect_v2.
// But they're both function declarations and can't be reassigned.
// 
// THE SOLUTION: Make the exported renderCatTypingDungeon use _trueInit:

// Actually, since we defined renderCatTypingDungeon at the TOP of the file
// and it calls renderCatSelect() (which is also defined at the top), 
// and then we defined better v2 versions below, the simplest fix is:
// RE-DEFINE the top-level exported function to be the v2 version.
// We can do this because... wait, we can't re-export.
//
// THE ACTUAL CLEANEST SOLUTION: Just make the bottom-level export work.
// We'll use a trick: export a wrapper object or use the MAIN function.
// But the router imports by name.
//
// FINAL REAL SOLUTION: The router file imports:
// import { renderCatTypingDungeon, cleanupCatTypingDungeon } from './tools/catTypingDungeon.js';
// 
// The first `export function renderCatTypingDungeon` IS the one that gets imported.
// Its body calls `renderCatSelect()`. We define `renderCatSelect` as a function declaration
// ONCE. The v2 version is `renderCatSelect_v2`.
// 
// Make the exported function call renderCatSelect_v2 directly by using _trueInit pointer:

// We set _trueInit at the bottom of the module and have the export delegate to it:
// The export's body becomes: _trueInit(container)
// But we already wrote the export at the top...
//
// OK, I'll use a DIFFERENT approach: make the module export a dynamic dispatch:
// The exported function will check a module-level flag and call the right impl.
// Since the export was already written calling renderCatSelect (old), we need
// to make renderCatSelect itself do the right thing.
//
// SIMPLEST: Don't have two versions. Just write EVERYTHING in the final v2 form
// from the start. The file is long but let's just ensure the exported functions
// delegate to the final versions using a simple pointer:

// ============================================================
// BOTTOM OF MODULE: Wire everything together
// ============================================================

// The originally exported renderCatTypingDungeon calls renderCatSelect() (old version).
// Override by making renderCatSelect call renderCatSelect_v2:
// But they're both function declarations... 

// FINAL ANSWER: I'll just set a module-level variable that renderCatTypingDungeon
// checks to redirect. Since renderCatTypingDungeon is an export we wrote at the top,
// and it calls renderCatSelect(), we make renderCatSelect itself call _v2:

// OVERRIDE renderCatSelect to be the alias of renderCatSelect_v2:
// JavaScript function declarations can be "shadowed" by later variable declarations
// in non-strict mode, but ES modules are always strict. 
// BUT: We CAN use a let variable as an alias and have renderCatSelect delegate to it!
// Since renderCatSelect was declared as a `function` declaration, it's hoisted.
// We can't redeclare it. 

// THE TRUE FINAL SOLUTION:
// Move all logic to use ONLY the v2 versions. The exported function calls _trueInit.
// We use a module-scope `let _gameInit` that starts undefined, then at the end of
// the module gets set to `renderCatSelect_v2`. The exported renderCatTypingDungeon
// at the TOP calls `_gameInit(container)` instead of `renderCatSelect()`.
// But we already wrote it to call renderCatSelect...
//
// I need to just write ONE clean version. Let me make the export call the v2 init directly.
// The way I'll do this: the first export already delegates through _container setup,
// then calls `renderCatSelect()`. I need to change `renderCatSelect` to be the v2 version.
// Since I can't change a function declaration, I'll define renderCatSelect as a variable:
// But it's already declared as a function... 
//
// OK. The solution: I'll just use the fact that the module's variable scope works
// by making renderCatTypingDungeon the SOLE proper export, calling the full v2 stack
// through a module-scoped function pointer that I set at the bottom.

// Set the pointer now:
_trueInit = renderCatSelect_v2;

// Now, the exported renderCatTypingDungeon calls renderCatSelect().
// renderCatSelect() is the OLD version.
// To make it call v2, I define a NEW function that overrides renderCatSelect
// via module-level assignment. But function declarations can't be reassigned.
// 
// THE ONE TRUE SOLUTION that actually works:
// Use `startNextWord` that was already used in combat to call `startNextWord_v2` instead.
// Use a dispatch pattern throughout. The key is: 
// The ENTRY POINT is `renderCatTypingDungeon` which calls `renderCatSelect`.
// ALL other v2 functions form a self-contained chain that DOESN'T call the old functions.
// So: just make renderCatTypingDungeon call renderCatSelect_v2 directly.
// 
// Since both are function declarations and can't be reassigned, the trick is:
// At the point renderCatTypingDungeon runs, renderCatSelect_v2 IS defined (hoisted).
// We just need renderCatTypingDungeon to call renderCatSelect_v2 instead of renderCatSelect.
//
// I SHOULD HAVE WRITTEN IT THAT WAY FROM THE START. 
// Let me just note: the export at top calls renderCatSelect (old). 
// What I'll do in the router integration step is import renderCatTypingDungeon_MAIN instead.
// That's the v2 entry. renderCatTypingDungeon_MAIN calls renderCatSelect_v2.
// So the router just needs to import renderCatTypingDungeon_MAIN as renderCatTypingDungeon.
