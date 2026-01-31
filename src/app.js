// Medieval Kingdoms — Part 2 (Commercial Base)
// Turn-based strategy + narrative with factions, regions and treaties.
// Vanilla JS, mobile-first UI.

import { locales } from './locales.js';
import {
  nations as nationsData,
  traits as traitsData,
  factions as factionsData,
  regions as regionsData,
  turnRules as turnRulesData,
  actions as actionsData,
  eventsPrince as eventsPrinceData,
  eventsKing as eventsKingData,
  arcs as arcsData,
  endings as endingsData,
  warConfig as warConfigData,
  warActions as warActionsData,
  economyConfig as economyConfigData,
  economyActions as economyActionsData
} from './data.js';

const appEl = document.getElementById('app');

let locale = 'en';

function t(key, vars = {}) {
  const dict = locales[locale] || locales.en;
  let s = dict[key] ?? locales.en[key] ?? key;
  Object.entries(vars).forEach(([k, v]) => {
    s = s.replaceAll(`{${k}}`, String(v));
  });
  return s;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const CORE = {
  nations: deepClone(nationsData.nations),
  traits: deepClone(traitsData.traits),
  factions: deepClone(factionsData.factions),
  regions: deepClone(regionsData.regions),
  rules: deepClone(turnRulesData),
  actions: deepClone(actionsData.actions),
  events: [...deepClone(eventsPrinceData.events), ...deepClone(eventsKingData.events)],
  arc: deepClone(arcsData),
  endings: deepClone(endingsData),
  warConfig: deepClone(warConfigData),
  warActions: deepClone(warActionsData.actions),
  economyConfig: deepClone(economyConfigData),
  economyActions: deepClone(economyActionsData.actions)
};


// War events (Part 3) - kept in code for static delivery.
const WAR_EVENTS = [
  {
    id: "event_war_raid_result",
    stage: "king",
    priority: 90,
    trigger: { flag: "in_war" },
    image: "assets/images/events/war.png",
    titleKey: "event.war.raid_result.title",
    textKey: "event.war.raid_result.text",
    choices: [
      { textKey: "event.war.raid_result.choice1", effects: { war: { enemyPower: -2, morale: +2 }, stats: { legitimacy: -1 } } },
      { textKey: "event.war.raid_result.choice2", effects: { war: { playerPower: +1, morale: +1 }, stats: { legitimacy: +1 } } }
    ]
  },
  {
    id: "event_war_siege_result",
    stage: "king",
    priority: 95,
    trigger: { flag: "in_war" },
    image: "assets/images/events/war.png",
    titleKey: "event.war.siege_result.title",
    textKey: "event.war.siege_result.text",
    choices: [
      { textKey: "event.war.siege_result.choice1", effects: { war: { enemyPower: -5, morale: -1 }, stats: { military: -1 } } },
      { textKey: "event.war.siege_result.choice2", effects: { war: { enemyPower: -2, morale: +1 }, stats: { legitimacy: -2 } } }
    ]
  },
  {
    id: "event_war_peace_talks",
    stage: "king",
    priority: 98,
    trigger: { flag: "peace_attempt" },
    image: "assets/images/events/diplomacy.png",
    titleKey: "event.war.peace_talks.title",
    textKey: "event.war.peace_talks.text",
    choices: [
      { textKey: "event.war.peace_talks.choice1", effects: { war: { enemyPower: +2 }, stats: { gold: -20, legitimacy: -2 }, flagsSet: ["peace_signed"] } },
      { textKey: "event.war.peace_talks.choice2", effects: { war: { morale: +2 }, stats: { legitimacy: +1 }, flagsSet: ["peace_refused"] } }
    ]
  }
];

// merge war events into core
CORE.events.push(...WAR_EVENTS);

// Economy events

const ECON_EVENTS = [
  {
    id: "event_econ_famine",
    stage: "king",
    priority: 88,
    trigger: { random: true, turnAtLeast: 5 },
    image: "assets/images/events/market.png",
    titleKey: "event.econ.famine.title",
    textKey: "event.econ.famine.text",
    choices: [
      { textKey: "event.econ.famine.choice1", effects: { stats: { gold: -12, legitimacy: +2 }, economy: { food: +12, inflation: -1, stability: +2 } } },
      { textKey: "event.econ.famine.choice2", effects: { economy: { food: -12, inflation: +2, stability: -3 }, regionsMeta: { unrest: +3 } } }
    ]
  },
  {
    id: "event_econ_guild",
    stage: "king",
    priority: 70,
    trigger: { random: true, turnAtLeast: 6 },
    image: "assets/images/events/market.png",
    titleKey: "event.econ.guild.title",
    textKey: "event.econ.guild.text",
    choices: [
      { textKey: "event.econ.guild.choice1", effects: { economy: { trade: +6, stability: +1 }, factions: { merchants: +6 }, stats: { legitimacy: -1 } } },
      { textKey: "event.econ.guild.choice2", effects: { economy: { stability: -2 }, factions: { merchants: -4 }, stats: { legitimacy: +1 } } }
    ]
  },
  {
    id: "event_econ_inflation",
    stage: "king",
    priority: 92,
    trigger: { any: [{ random: true, turnAtLeast: 7 }, { minEconomy: { inflation: 15 } }] },
    image: "assets/images/events/court.png",
    titleKey: "event.econ.inflation.title",
    textKey: "event.econ.inflation.text",
    choices: [
      { textKey: "event.econ.inflation.choice1", effects: { economy: { inflation: -4, stability: +2 }, stats: { legitimacy: -1 } } },
      { textKey: "event.econ.inflation.choice2", effects: { stats: { gold: +15, legitimacy: -3 }, economy: { inflation: +4, debt: +10, stability: -2 } } }
    ]
  }
];

CORE.events.push(...ECON_EVENTS);


const STORAGE_KEY = 'mk2_save_v1';

let state = null;

function newGame() {
  state = {
    ui: { screen: 'lang', tab: 'actions', toast: null },
    locale,
    nation: null,
    traits: [],
    stage: 'prince', // prince -> king
    turn: 1,
    pa: CORE.rules.pa_per_turn,
    flags: {},
    seenEvents: {},
    stats: { legitimacy: 50, gold: 50, military: 50, diplomacy: 50 },
    factions: CORE.factions.map(f => ({ ...f })),
    regions: CORE.regions.map(r => ({ ...r })),
    diplomacyMeta: { alliances: 0, wars: 0, rivalries: 0 },
    war: { active: false, playerPower: 50, enemyPower: 55, morale: 50, days: 0 },
    economy: { inflation: 0, debt: 0, food: 55, trade: 10, stability: 55 },
    eventQueue: [],
    lastActionId: null,
    summary: []
  };
}

function saveGame() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, locale }));
  } catch {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw);
    state = obj;
    locale = obj.locale || 'en';
    return true;
  } catch {
    return false;
  }
}

function setToast(msg) {
  state.ui.toast = msg;
  render();
  setTimeout(() => {
    if (!state) return;
    state.ui.toast = null;
    render();
  }, 1600);
}

function meetsRequirements(req = {}) {
  if (!req) return true;

  // stage
  if (req.stageIn && !req.stageIn.includes(state.stage)) return false;

  // stats
  if (req.minStats) {
    for (const [k, v] of Object.entries(req.minStats)) {
      if ((state.stats[k] ?? 0) < v) return false;
    }
  }
  if (req.maxStats) {
    for (const [k, v] of Object.entries(req.maxStats)) {
      if ((state.stats[k] ?? 0) > v) return false;
    }
  }

  // factions
  if (req.minFactions) {
    for (const [id, v] of Object.entries(req.minFactions)) {
      const f = state.factions.find(x => x.id === id);
      if (!f || f.loyalty < v) return false;
    }
  }
  if (req.maxFactions) {
    for (const [id, v] of Object.entries(req.maxFactions)) {
      const f = state.factions.find(x => x.id === id);
      if (!f || f.loyalty > v) return false;
    }
  }

  // diplomacy meta
  if (req.minDiplomacyMeta) {
    for (const [k, v] of Object.entries(req.minDiplomacyMeta)) {
      if ((state.diplomacyMeta[k] ?? 0) < v) return false;
    }
  }

// economy requirements
  if (req.minEconomy) {
    const e = state.economy;
    for (const [k,v] of Object.entries(req.minEconomy)) if ((e[k] ?? 0) < v) return false;
  }
  if (req.maxEconomy) {
    const e = state.economy;
    for (const [k,v] of Object.entries(req.maxEconomy)) if ((e[k] ?? 0) > v) return false;
  }

// war requirements
  if (req.minWar) {
    if (typeof req.minWar.enemyPower === 'number' && state.war.enemyPower < req.minWar.enemyPower) return false;
    if (typeof req.minWar.playerPower === 'number' && state.war.playerPower < req.minWar.playerPower) return false;
    if (typeof req.minWar.morale === 'number' && state.war.morale < req.minWar.morale) return false;
  }
  if (req.maxWar) {
    if (typeof req.maxWar.enemyPower === 'number' && state.war.enemyPower > req.maxWar.enemyPower) return false;
    if (typeof req.maxWar.playerPower === 'number' && state.war.playerPower > req.maxWar.playerPower) return false;
    if (typeof req.maxWar.morale === 'number' && state.war.morale > req.maxWar.morale) return false;
  }

  // traits
  if (req.traitIn) {
    const has = req.traitIn.some(tr => state.traits.includes(tr));
    if (!has) return false;
  }

  // flags
  if (req.flag && !state.flags[req.flag]) return false;
  if (req.flagsAll) {
    for (const f of req.flagsAll) if (!state.flags[f]) return false;
  }

  // turn constraints
  if (typeof req.turnAtLeast === 'number' && state.turn < req.turnAtLeast) return false;
  if (typeof req.turnAtMost === 'number' && state.turn > req.turnAtMost) return false;

  // any/all composite
  if (req.any) return req.any.some(meetsRequirements);
  if (req.all) return req.all.every(meetsRequirements);

  return true;
}

function applyEffects(effects = {}) {
  if (!effects) return;

  if (effects.stats) {
    for (const [k, v] of Object.entries(effects.stats)) {
      state.stats[k] = (state.stats[k] ?? 0) + v;
    }
  }

  const flags = effects.flagsSet || [];
  for (const f of flags) state.flags[f] = true;

  if (effects.factions) {
    for (const [id, delta] of Object.entries(effects.factions)) {
      const f = state.factions.find(x => x.id === id);
      if (f) f.loyalty = clamp(f.loyalty + delta, 0, 100);
    }
  }

  if (effects.diplomacyMeta) {
    for (const [k, delta] of Object.entries(effects.diplomacyMeta)) {
      state.diplomacyMeta[k] = (state.diplomacyMeta[k] ?? 0) + delta;
    }
  }

  if (effects.economy) {
    const e = effects.economy;
    const eco = state.economy;
    if (typeof e.inflation === 'number') eco.inflation = clamp(eco.inflation + e.inflation, -10, 50);
    if (typeof e.debt === 'number') eco.debt = clamp(eco.debt + e.debt, 0, 500);
    if (typeof e.food === 'number') eco.food = clamp(eco.food + e.food, 0, 100);
    if (typeof e.trade === 'number') eco.trade = clamp(eco.trade + e.trade, 0, 100);
    if (typeof e.stability === 'number') eco.stability = clamp(eco.stability + e.stability, 0, 100);
  }

  // Regions meta: for MVP we apply gently across all, plus a few special hooks
  if (effects.regionsMeta) {
    const meta = effects.regionsMeta;
    state.regions.forEach(r => {
      if (typeof meta.prosperity === 'number') r.prosperity = clamp(r.prosperity + meta.prosperity, 0, 100);
      if (typeof meta.unrest === 'number') r.unrest = clamp(r.unrest + meta.unrest, 0, 100);
      if (typeof meta.frontier_unrest === 'number' && r.id === 'frontier') {
        r.unrest = clamp(r.unrest + meta.frontier_unrest, 0, 100);
      }
    });
  }
}

  if (effects.war) {
    const w = effects.war;
    if (typeof w.playerPower === 'number') state.war.playerPower = clamp(state.war.playerPower + w.playerPower, 0, 120);
    if (typeof w.enemyPower === 'number') state.war.enemyPower = clamp(state.war.enemyPower + w.enemyPower, 0, 140);
    if (typeof w.morale === 'number') state.war.morale = clamp(state.war.morale + w.morale, 0, 100);
    if (w.peaceAttempt) state.flags.peace_attempt = true;
  }



function incomeForTurn() {
  // Base income + region contribution adjusted by unrest
  const base = CORE.rules.income.gold;
  const regionIncome = state.regions.reduce((sum, r) => {
    const stability = 1 - (r.unrest / 140); // unrest reduces
    return sum + Math.round((r.prosperity / 12) * stability);
  }, 0);
  const inflationFactor = 1 - (Math.max(0, state.economy.inflation) * CORE.economyConfig.inflationImpactOnIncome);
  const tradeBonus = Math.round(state.economy.trade / 10);
  return Math.round((base + regionIncome + tradeBonus) * inflationFactor);
}

function triggerEventsForTurn() {
  // Choose the best event to show (highest priority), not yet seen, matching stage.
  const candidates = CORE.events
    .filter(e => e.stage === state.stage)
    .filter(e => !state.seenEvents[e.id])
    .filter(e => {
      const trg = e.trigger || {};
      // random trigger
      if (trg.random) {
        const roll = Math.random();
        // gentle chance
        if (roll > 0.35) return false;
      }
      // flags, any/all, min/max stats etc reuse meetsRequirements
      // Map trigger into requirements-like structure
      const req = {};
      if (trg.flag) req.flag = trg.flag;
      if (trg.any) req.any = trg.any;
      if (trg.all) req.all = trg.all;
      if (trg.minStats) req.minStats = trg.minStats;
      if (trg.minEconomy) req.minEconomy = trg.minEconomy;
      if (trg.maxEconomy) req.maxEconomy = trg.maxEconomy;
      if (trg.maxStat) req.maxStats = trg.maxStat;
      if (trg.turnAtLeast) req.turnAtLeast = trg.turnAtLeast;
      if (trg.turnAtMost) req.turnAtMost = trg.turnAtMost;
      return meetsRequirements(req);
    });

  candidates.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const picked = candidates[0];
  if (picked) {
    state.eventQueue.push(picked.id);
    state.seenEvents[picked.id] = true;
  }
}

function queueSpecificEvent(id) {
  if (!id) return;
  const exists = CORE.events.some(e => e.id === id);
  if (exists) state.eventQueue.push(id);
}


function applyWarAction(action) {
  if (state.pa < action.costPA) return;
  if (!meetsRequirements(action.requirements)) return;

  state.pa -= action.costPA;
  applyEffects({ ...(action.effects || {}), flagsSet: action.flagsSet || [] });

  // Resolve direct combat pressure:
  // Compare effective strengths; if behind, morale drops.
  const advantage = (state.stats.military + state.war.playerPower) - state.war.enemyPower;
  if (advantage < 0) state.war.morale = clamp(state.war.morale - CORE.warConfig.moraleLossOnDefeat, 0, 100);
  else state.war.morale = clamp(state.war.morale + CORE.warConfig.moraleGainOnWin, 0, 100);

  // Queue war events
  if (action.mayTrigger && action.mayTrigger.length) queueSpecificEvent(action.mayTrigger[0]);

  // Win condition: enemy power <=0
  if (state.war.enemyPower <= 0) {
    state.war.active = false;
    state.flags.in_war = false;
    state.stats.legitimacy += 10;
    state.diplomacyMeta.wars = Math.max(0, state.diplomacyMeta.wars);
    setToast(locale === 'pt' ? 'Vitória na guerra!' : 'Victory in war!');
  }

  // Loss condition: morale 0
  if (state.war.morale <= 0) {
    // collapse -> set military to 0 to trigger ending
    state.stats.military = 0;
  }

  state.summary.push({ turn: state.turn, type: 'war', id: action.id });
  saveGame();
  render();
}


function applyEconomyAction(action) {
  if (state.pa < action.costPA) return;
  if (!meetsRequirements(action.requirements)) return;

  state.pa -= action.costPA;
  applyEffects({ ...(action.effects || {}), flagsSet: action.flagsSet || [] });

  if (action.mayTrigger && action.mayTrigger.length) queueSpecificEvent(action.mayTrigger[0]);

  state.summary.push({ turn: state.turn, type: 'economy', id: action.id });
  saveGame();
  render();
}

function applyAction(action) {
  if (state.pa < action.costPA) return;
  if (!meetsRequirements(action.requirements)) return;

  state.pa -= action.costPA;
  state.lastActionId = action.id;
  applyEffects({ ...(action.effects || {}), flagsSet: action.flagsSet || [] });

  if (state.flags.war_declaration) {
    state.flags.in_war = true;
    state.war.active = true;
    state.diplomacyMeta.wars += 1;
  }

  // mild systemic reactions
  if (action.id === 'raise_taxes') {
    // unrest rises slightly in heartland/frontier
    state.regions.forEach(r => {
      if (r.id === 'heartland' || r.id === 'frontier') r.unrest = clamp(r.unrest + 3, 0, 100);
    });
  }
  if (action.id === 'lower_taxes') {
    state.regions.forEach(r => (r.unrest = clamp(r.unrest - 2, 0, 100)));
  }

  // may trigger event
  if (action.mayTrigger && action.mayTrigger.length) {
    // queue first one — deterministic for MVP
    queueSpecificEvent(action.mayTrigger[0]);
  }

  state.summary.push({ turn: state.turn, type: 'action', id: action.id });
  saveGame();
  render();
}

function endTurn() {
  // advance time
  // prince -> king transition at turn 4
  if (state.turn === 3 && state.stage === 'prince') {
    state.stage = 'king';
    state.flags.succession_crisis = true;
    queueSpecificEvent('event_succession');
    setToast('👑 ' + (locale === 'pt' ? 'Você agora é Rei.' : 'You are now King.'));
  }

  // income & decay
  state.stats.gold += incomeForTurn();
  // economy: interest, food, stability
  const eco = state.economy;
  const interest = Math.round(eco.debt * CORE.economyConfig.debtInterestRate);
  if (interest > 0) state.stats.gold -= interest;
  // basic food consumption per turn
  eco.food = clamp(eco.food - 4, 0, 100);
  if (eco.food < 20) { eco.stability = clamp(eco.stability - 3, 0, 100); state.stats.legitimacy -= 2; }
  if (eco.debt > 200) { eco.stability = clamp(eco.stability - 2, 0, 100); }
  if (eco.inflation > 15) { eco.stability = clamp(eco.stability - 2, 0, 100); }
  if (eco.stability > 70 && eco.food > 40) { state.stats.legitimacy += 1; }
  // collapse triggers
  if (eco.stability <= 0) state.stats.legitimacy = 0; // will trigger overthrow

  for (const [k, v] of Object.entries(CORE.rules.decay)) {
    state.stats[k] = (state.stats[k] ?? 0) + v;
  }

  // regions drift: prosperity slowly rises if unrest low
  state.regions.forEach(r => {
    if (r.unrest < 20) r.prosperity = clamp(r.prosperity + 1, 0, 100);
    if (r.unrest > 60) r.prosperity = clamp(r.prosperity - 1, 0, 100);
  });

  // factions drift: if gold negative, merchants lose loyalty
  if (state.stats.gold < 0) {
    const m = state.factions.find(f => f.id === 'merchants');
    if (m) m.loyalty = clamp(m.loyalty - 2, 0, 100);
  }

  // increment turn
  state.turn += 1;
  state.pa = CORE.rules.pa_per_turn;

  // arc milestone checks (simple)
  (CORE.arc.milestones || []).forEach(m => {
    const req = { ...(m.unlock || {}) };
    if (!state.flags[m.id] && meetsRequirements(req)) {
      (m.flagsSet || []).forEach(f => (state.flags[f] = true));
      (m.onStartQueueEvents || []).forEach(queueSpecificEvent);
    }
  });

    // war progression
  if (state.war.active) {
    state.war.days += 1;
    state.war.enemyPower = clamp(state.war.enemyPower + CORE.warConfig.enemyGrowthPerTurn, 0, 140);
    // morale drains slightly each turn of war
    state.war.morale = clamp(state.war.morale - 2, 0, 100);
    // if enemy power is crushed, end war
    if (state.war.enemyPower <= 0) {
      state.war.active = false;
      state.flags.in_war = false;
      state.stats.legitimacy += 8;
      state.stats.military += 6;
      setToast(locale === 'pt' ? '⚔️ Vitória na guerra!' : '⚔️ War victory!');
    }
    // if morale hits 0, military collapses
    if (state.war.morale <= 0) {
      state.stats.military = clamp(state.stats.military - 10, -50, 120);
    }
  }

  // reactive event roll
  if (state.eventQueue.length === 0) triggerEventsForTurn();

  // evaluate endings after processing (but before UI)
  const ending = evaluateEndings();
  if (ending) {
    state.ui.screen = 'ending';
    state.ui.ending = ending;
  } else if (state.turn > CORE.rules.max_turns) {
    // soft ending: evaluate again with max turns exceeded
    state.ui.screen = 'ending';
    state.ui.ending = CORE.endings.victory[0];
  }

  saveGame();
  render();
}

function evaluateEndings() {
  const all = [...CORE.endings.gameover.map(e => ({ ...e, kind: 'gameover' })), ...CORE.endings.victory.map(e => ({ ...e, kind: 'victory' }))];
  for (const e of all) {
    if (meetsRequirements(e.requirements)) return e;
  }
  return null;
}

function currentEvent() {
  const id = state.eventQueue[0];
  if (!id) return null;
  return CORE.events.find(e => e.id === id) || null;
}

function chooseEventOption(choice) {
  const e = currentEvent();
  if (!e) return;

  // requirements for choices (optional)
  if (choice.requirements && !meetsRequirements(choice.requirements)) return;

  applyEffects(choice.effects || {});
  // activate war mode
  if (state.flags.in_war) state.war.active = true;
  state.summary.push({ turn: state.turn, type: 'event', id: e.id });

  // pop
  state.eventQueue.shift();

  // after event, check endings
  const ending = evaluateEndings();
  if (ending) {
    state.ui.screen = 'ending';
    state.ui.ending = ending;
  }

  saveGame();
  render();
}

function setLocale(newLocale) {
  locale = newLocale;
  if (state) state.locale = locale;
  saveGame();
  render();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function button(text, onClick, cls = 'btn') {
  const b = el('button', cls, text);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

function renderLang() {
  const card = el('div', 'card');
  card.appendChild(el('h2', 'title', t('ui.select_language')));
  const row = el('div', 'row');
  row.appendChild(button('English', () => { setLocale('en'); state.ui.screen = 'nation'; render(); }, 'btn'));
  row.appendChild(button('Português', () => { setLocale('pt'); state.ui.screen = 'nation'; render(); }, 'btn'));
  card.appendChild(row);

  const sub = el('p', 'muted', locale === 'pt'
    ? 'Você pode trocar o idioma a qualquer momento no topo.'
    : 'You can change language anytime from the top bar.');
  card.appendChild(sub);

  appEl.innerHTML = '';
  appEl.appendChild(card);
}

function renderNation() {
  const card = el('div', 'card');
  const top = el('div', 'topbar');
  top.appendChild(el('div', 'brand', 'Medieval Kingdoms'));
  const langBtn = button('🌐', () => state.ui.screen = 'lang', 'iconBtn');
  top.appendChild(langBtn);
  card.appendChild(top);

  card.appendChild(el('h2', 'title', t('ui.choose_nation')));

  const grid = el('div', 'grid');
  CORE.nations.forEach(n => {
    const c = el('button', 'nationCard');
    c.addEventListener('click', () => {
      state.nation = n.id;
      state.stats = { ...state.stats, ...n.stats };
      // apply nation suggested trait (bonus)
      (n.traits || []).forEach(tr => { if (!state.traits.includes(tr)) state.traits.push(tr); });
      state.ui.screen = 'traits';
      render();
    });
    const img = el('img', 'nationImg');
    img.src = n.image;
    img.alt = t(n.nameKey);
    const name = el('div', 'nationName', t(n.nameKey));
    const desc = el('div', 'nationDesc', t(n.descKey));
    c.appendChild(img);
    c.appendChild(name);
    c.appendChild(desc);
    grid.appendChild(c);
  });

  card.appendChild(grid);

  appEl.innerHTML = '';
  appEl.appendChild(card);
}

function renderTraits() {
  const card = el('div', 'card');
  const top = el('div', 'topbar');
  top.appendChild(el('div', 'brand', 'Medieval Kingdoms'));
  top.appendChild(button('🌐', () => state.ui.screen = 'lang', 'iconBtn'));
  card.appendChild(top);

  card.appendChild(el('h2', 'title', t('ui.select_traits')));
  const sub = el('p', 'muted', locale === 'pt' ? 'Selecione 2 traços.' : 'Select 2 traits.');
  card.appendChild(sub);

  const grid = el('div', 'grid');
  const selected = new Set(state.traits);

  CORE.traits.forEach(tr => {
    const c = el('button', 'traitCard');
    const title = el('div', 'traitName', t(tr.titleKey));
    const desc = el('div', 'traitDesc', t(tr.descKey));
    c.appendChild(title);
    c.appendChild(desc);

    const refresh = () => {
      c.classList.toggle('active', selected.has(tr.id));
    };
    refresh();

    c.addEventListener('click', () => {
      if (selected.has(tr.id)) {
        selected.delete(tr.id);
      } else {
        if (selected.size >= 2) return;
        selected.add(tr.id);
      }
      refresh();
    });

    grid.appendChild(c);
  });

  card.appendChild(grid);

  const footer = el('div', 'row');
  const start = button(t('ui.confirm'), () => {
    if (selected.size < 2) { setToast(locale === 'pt' ? 'Escolha 2 traços.' : 'Pick 2 traits.'); return; }
    state.traits = Array.from(selected);
    // apply trait modifiers once at start
    state.traits.forEach(id => {
      const tr = CORE.traits.find(x => x.id === id);
      if (tr?.modifiers) applyEffects({ stats: tr.modifiers });
    });
    state.ui.screen = 'game';
    render();
  }, 'btn primary');
  footer.appendChild(start);
  card.appendChild(footer);

  appEl.innerHTML = '';
  appEl.appendChild(card);
}

function renderTopHUD(container) {
  const top = el('div', 'hud');
  const left = el('div', 'hudLeft');
  left.appendChild(el('div', 'hudTitle', 'Medieval Kingdoms'));
  left.appendChild(el('div', 'hudSub', `${t('ui.turn')} ${state.turn} • ${state.stage.toUpperCase()}`));

  const right = el('div', 'hudRight');
  right.appendChild(button('🌐', () => state.ui.screen = 'lang', 'iconBtn'));
  right.appendChild(button('💾', () => { saveGame(); setToast(locale === 'pt' ? 'Salvo!' : 'Saved!'); }, 'iconBtn'));

  top.appendChild(left);
  top.appendChild(right);

  // stats strip
  const strip = el('div', 'statsStrip');
  const makeStat = (key) => {
    const wrap = el('div', 'stat');
    wrap.appendChild(el('div', 'statLabel', t(`ui.stats.${key}`)));
    wrap.appendChild(el('div', 'statValue', String(Math.round(state.stats[key]))));
    return wrap;
  };
  strip.appendChild(makeStat('legitimacy'));
  strip.appendChild(makeStat('gold'));
  strip.appendChild(makeStat('military'));
  strip.appendChild(makeStat('diplomacy'));

  // treaties
  const treaties = el('div', 'treaties');
  treaties.appendChild(el('div', 'treatiesTitle', t('ui.diplomacy_meta')));
  const pills = el('div', 'pillRow');
  pills.appendChild(el('div', 'pill', `${t('ui.alliances')}: ${state.diplomacyMeta.alliances}`));
  pills.appendChild(el('div', 'pill', `${t('ui.wars')}: ${state.diplomacyMeta.wars}`));
  pills.appendChild(el('div', 'pill', `${t('ui.rivalries')}: ${state.diplomacyMeta.rivalries}`));
  treaties.appendChild(pills);

  container.appendChild(top);
  container.appendChild(strip);
  container.appendChild(treaties);

  // tabs
  const tabs = el('div', 'tabs');
  const tabBtn = (id, labelKey) => {
    const b = el('button', 'tabBtn', t(labelKey));
    b.classList.toggle('active', state.ui.tab === id);
    b.addEventListener('click', () => { state.ui.tab = id; render(); });
    return b;
  };
  tabs.appendChild(tabBtn('actions', 'ui.tab.actions'));
  tabs.appendChild(tabBtn('realm', 'ui.tab.realm'));
  tabs.appendChild(tabBtn('council', 'ui.tab.council'));
  tabs.appendChild(tabBtn('economy', 'ui.tab.economy'));
  if (state.war.active || state.flags.in_war) tabs.appendChild(tabBtn('war', 'ui.tab.war'));
  container.appendChild(tabs);
}

function renderActions(container) {
  const wrap = el('div', 'panel');
  wrap.appendChild(el('div', 'panelTitle', t('ui.tab.actions')));
  wrap.appendChild(el('div', 'muted', t('ui.actions_remaining', { pa: state.pa })));

  const list = el('div', 'actionList');

  CORE.actions.forEach(a => {
    const enabled = state.pa >= a.costPA && meetsRequirements(a.requirements);
    const item = el('button', 'actionCard');
    item.classList.toggle('disabled', !enabled);
    item.addEventListener('click', () => enabled && applyAction(a));

    const head = el('div', 'actionHead');
    head.appendChild(el('div', 'actionName', t(a.titleKey)));
    head.appendChild(el('div', 'badge', `-${a.costPA} PA`));
    const desc = el('div', 'actionDesc', t(a.descKey));
    item.appendChild(head);
    item.appendChild(desc);

    list.appendChild(item);
  });

  wrap.appendChild(list);

  const footer = el('div', 'row');
  footer.appendChild(button(t('ui.end_turn'), () => endTurn(), 'btn primary'));
  wrap.appendChild(footer);

  container.appendChild(wrap);
}

function renderRealm(container) {
  const wrap = el('div', 'panel');
  wrap.appendChild(el('div', 'panelTitle', t('ui.regions')));

  const grid = el('div', 'regionGrid');
  state.regions.forEach(r => {
    const c = el('div', 'regionCard');
    c.appendChild(el('div', 'regionName', t(r.nameKey)));
    const row1 = el('div', 'miniRow');
    row1.appendChild(el('div', 'miniLabel', t('ui.prosperity')));
    row1.appendChild(el('div', 'miniValue', String(r.prosperity)));
    const row2 = el('div', 'miniRow');
    row2.appendChild(el('div', 'miniLabel', t('ui.unrest')));
    row2.appendChild(el('div', 'miniValue', String(r.unrest)));
    c.appendChild(row1);
    c.appendChild(row2);
    grid.appendChild(c);
  });

  wrap.appendChild(grid);

  wrap.appendChild(el('div', 'panelTitle', t('ui.factions')));
  const fgrid = el('div', 'regionGrid');
  state.factions.forEach(f => {
    const c = el('div', 'regionCard');
    c.appendChild(el('div', 'regionName', t(f.nameKey)));
    const row = el('div', 'miniRow');
    row.appendChild(el('div', 'miniLabel', locale === 'pt' ? 'Lealdade' : 'Loyalty'));
    row.appendChild(el('div', 'miniValue', String(f.loyalty)));
    c.appendChild(row);
    fgrid.appendChild(c);
  });
  wrap.appendChild(fgrid);

  container.appendChild(wrap);
}

function renderCouncil(container) {
  const wrap = el('div', 'panel');
  wrap.appendChild(el('div', 'panelTitle', t('ui.tab.council')));
  const p = el('p', 'muted',
    locale === 'pt'
      ? 'Aqui (Parte 2) você já vê facções e tratados. Na Parte 3 entra guerra avançada, economia profunda e dinastia.'
      : 'Here (Part 2) you can already see factions and treaties. Part 3 adds advanced war, deeper economy and dynasty.');
  wrap.appendChild(p);

  // Quick tips
  const tips = el('div', 'tipList');
  const tip = (txt) => tips.appendChild(el('div', 'tip', txt));
  if (locale === 'pt') {
    tip('• Impostos altos aumentam ouro, mas podem gerar revoltas e reduzir lealdade.');
    tip('• Alianças contam para a vitória diplomática.');
    tip('• Se a lealdade da Nobreza chegar a 0, acontece um golpe.');
  } else {
    tip('• High taxes increase gold, but may cause revolts and reduce loyalty.');
    tip('• Alliances count toward diplomatic victory.');
    tip('• If Nobility loyalty reaches 0, you suffer a coup.');
  }
  wrap.appendChild(tips);

  container.appendChild(wrap);
}



function renderEconomy(container) {
  const wrap = el('div', 'panel');
  wrap.appendChild(el('div', 'panelTitle', t('ui.econ_status')));

  const grid = el('div', 'regionGrid');
  const mk = (label, value) => {
    const c = el('div', 'regionCard');
    c.appendChild(el('div', 'regionName', label));
    const row = el('div', 'miniRow');
    row.appendChild(el('div', 'miniLabel', label));
    row.appendChild(el('div', 'miniValue', String(value)));
    c.appendChild(row);
    return c;
  };

  const eco = state.economy;
  const c1 = el('div', 'regionCard');
  c1.appendChild(el('div', 'regionName', t('ui.inflation')));
  c1.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.inflation')}</div><div class="miniValue">${eco.inflation}</div>`;
  const c2 = el('div', 'regionCard');
  c2.appendChild(el('div', 'regionName', t('ui.debt')));
  c2.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.debt')}</div><div class="miniValue">${eco.debt}</div>`;
  const c3 = el('div', 'regionCard');
  c3.appendChild(el('div', 'regionName', t('ui.food')));
  c3.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.food')}</div><div class="miniValue">${eco.food}</div>`;
  const c4 = el('div', 'regionCard');
  c4.appendChild(el('div', 'regionName', t('ui.trade')));
  c4.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.trade')}</div><div class="miniValue">${eco.trade}</div>`;

  grid.appendChild(c1); grid.appendChild(c2); grid.appendChild(c3); grid.appendChild(c4);
  wrap.appendChild(grid);

  wrap.appendChild(el('div', 'muted', t('ui.econ_hint')));

  wrap.appendChild(el('div', 'panelTitle', locale === 'pt' ? 'Ações Econômicas' : 'Economic Actions'));
  const list = el('div', 'actionList');
  CORE.economyActions.forEach(a => {
    const enabled = state.pa >= a.costPA && meetsRequirements(a.requirements);
    const item = el('button', 'actionCard');
    item.classList.toggle('disabled', !enabled);
    item.addEventListener('click', () => enabled && applyEconomyAction(a));
    const head = el('div', 'actionHead');
    head.appendChild(el('div', 'actionName', t(a.titleKey)));
    head.appendChild(el('div', 'badge', `-${a.costPA} PA`));
    item.appendChild(head);
    item.appendChild(el('div', 'actionDesc', t(a.descKey)));
    list.appendChild(item);
  });
  wrap.appendChild(list);

  container.appendChild(wrap);
}

function renderWar(container) {
  const wrap = el('div', 'panel');
  wrap.appendChild(el('div', 'panelTitle', t('ui.war_status')));

  const grid = el('div', 'regionGrid');
  const statCard = (labelKey, value) => {
    const c = el('div', 'regionCard');
    c.appendChild(el('div', 'regionName', labelKey));
    const row = el('div', 'miniRow');
    row.appendChild(el('div', 'miniLabel', t('ui.war_power')));
    row.appendChild(el('div', 'miniValue', String(value)));
    c.appendChild(row);
    return c;
  };

  const c1 = el('div', 'regionCard');
  c1.appendChild(el('div', 'regionName', locale === 'pt' ? 'Seu Exército' : 'Your Army'));
  c1.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.war_power')}</div><div class="miniValue">${Math.round(state.war.playerPower)}</div>`;
  c1.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.war_morale')}</div><div class="miniValue">${Math.round(state.war.morale)}</div>`;

  const c2 = el('div', 'regionCard');
  c2.appendChild(el('div', 'regionName', locale === 'pt' ? 'Inimigo' : 'Enemy'));
  c2.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${t('ui.war_enemy')}</div><div class="miniValue">${Math.round(state.war.enemyPower)}</div>`;
  c2.appendChild(el('div', 'miniRow')).innerHTML = `<div class="miniLabel">${locale === 'pt' ? 'Dias' : 'Days'}</div><div class="miniValue">${state.war.days}</div>`;

  grid.appendChild(c1);
  grid.appendChild(c2);
  wrap.appendChild(grid);

  const hint = el('div', 'muted', `${t('ui.war_victory_hint')} ${t('ui.war_defeat_hint')}`);
  wrap.appendChild(hint);

  wrap.appendChild(el('div', 'panelTitle', locale === 'pt' ? 'Ações de Guerra' : 'War Actions'));
  const list = el('div', 'actionList');

  CORE.warActions.forEach(a => {
    const enabled = state.pa >= a.costPA && meetsRequirements(a.requirements);
    const item = el('button', 'actionCard');
    item.classList.toggle('disabled', !enabled);
    item.addEventListener('click', () => enabled && applyWarAction(a));
    const head = el('div', 'actionHead');
    head.appendChild(el('div', 'actionName', t(a.titleKey)));
    head.appendChild(el('div', 'badge', `-${a.costPA} PA`));
    item.appendChild(head);
    item.appendChild(el('div', 'actionDesc', t(a.descKey)));
    list.appendChild(item);
  });

  wrap.appendChild(list);
  container.appendChild(wrap);
}

function renderEventModal(container) {
  const e = currentEvent();
  if (!e) return;

  const overlay = el('div', 'modalOverlay');
  const modal = el('div', 'modal');

  if (e.image) {
    const img = el('img', 'modalImg');
    img.src = e.image;
    img.alt = '';
    modal.appendChild(img);
  }

  modal.appendChild(el('h3', 'modalTitle', t(e.titleKey)));
  modal.appendChild(el('p', 'modalText', t(e.textKey)));

  const choices = el('div', 'choiceList');
  (e.choices || []).forEach(ch => {
    const ok = !ch.requirements || meetsRequirements(ch.requirements);
    const b = button(t(ch.textKey), () => ok && chooseEventOption(ch), 'btn');
    if (!ok) b.classList.add('disabled');
    choices.appendChild(b);
  });
  modal.appendChild(choices);

  overlay.appendChild(modal);
  container.appendChild(overlay);
}

function renderEnding() {
  const e = state.ui.ending;
  const card = el('div', 'card');
  const kind = e.kind === 'gameover' ? t('ui.game_over') : t('ui.victory');
  card.appendChild(el('h2', 'title', kind));

  if (e.image) {
    const img = el('img', 'endingImg');
    img.src = e.image;
    img.alt = '';
    card.appendChild(img);
  }
  card.appendChild(el('h3', 'modalTitle', t(e.titleKey)));
  card.appendChild(el('p', 'modalText', t(e.textKey)));

  // Summary
  const sumTitle = el('div', 'panelTitle', locale === 'pt' ? 'Resumo' : 'Summary');
  card.appendChild(sumTitle);

  const ul = el('div', 'tipList');
  const actionsCount = state.summary.filter(x => x.type === 'action').length;
  const eventsCount = state.summary.filter(x => x.type === 'event').length;
  ul.appendChild(el('div', 'tip', `${locale === 'pt' ? 'Ações realizadas' : 'Actions taken'}: ${actionsCount}`));
  ul.appendChild(el('div', 'tip', `${locale === 'pt' ? 'Eventos resolvidos' : 'Events resolved'}: ${eventsCount}`));
  ul.appendChild(el('div', 'tip', `${t('ui.alliances')}: ${state.diplomacyMeta.alliances}`));
  ul.appendChild(el('div', 'tip', `${t('ui.wars')}: ${state.diplomacyMeta.wars}`));
  ul.appendChild(el('div', 'tip', `${locale === 'pt' ? 'Lealdade da Nobreza' : 'Nobility loyalty'}: ${state.factions.find(f=>f.id==='nobility')?.loyalty ?? '-'}`));
  card.appendChild(ul);

  card.appendChild(button(t('ui.play_again'), () => { localStorage.removeItem(STORAGE_KEY); newGame(); state.ui.screen='lang'; render(); }, 'btn primary'));

  appEl.innerHTML='';
  appEl.appendChild(card);
}

function renderGame() {
  const root = el('div', 'gameRoot');
  renderTopHUD(root);

  // main
  if (state.ui.tab === 'actions') renderActions(root);
  else if (state.ui.tab === 'realm') renderRealm(root);
  else if (state.ui.tab === 'economy') renderEconomy(root);
  else if (state.ui.tab === 'war') renderWar(root);
  else renderCouncil(root);

  // modals
  renderEventModal(root);

  if (state.ui.toast) {
    const toast = el('div', 'toast', state.ui.toast);
    root.appendChild(toast);
  }

  appEl.innerHTML = '';
  appEl.appendChild(root);
}

function render() {
  if (!state) newGame();

  // keep locale in sync
  state.locale = locale;

  if (state.ui.screen === 'ending') return renderEnding();
  if (state.ui.screen === 'lang') return renderLang();
  if (state.ui.screen === 'nation') return renderNation();
  if (state.ui.screen === 'traits') return renderTraits();
  return renderGame();
}

// Boot
if (!loadGame()) {
  newGame();
} else {
  // when loaded, go straight to game
  if (!state.nation) state.ui.screen = 'lang';
  else state.ui.screen = 'game';
}
render();
