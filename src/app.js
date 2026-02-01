// Core game script for Medieval Kingdoms turn-based game

// Import static data and locales.  Using ES modules allows us to package
// everything into the build so that the game works from the file:// protocol
// without hitting CORS issues when fetching JSON.  All core data and
// translations are defined in separate modules (data.js, locales.js).
import { locales } from './locales.js';
import {
  nations as nationsData,
  traits as traitsData,
  turnRules as turnRulesData,
  actions as actionsData,
  eventsPrince as eventsPrinceData,
  eventsKing as eventsKingData,
  arcs as arcsData,
  endings as endingsData
} from './data.js';

const appEl = document.getElementById('app');

let locale = 'en';
const translations = {};
const data = {};

// Global game state
let state = {
  nation: null,
  traits: [],
  stats: { legitimacy: 50, gold: 50, military: 50, diplomacy: 50 },
  stage: 'prince',
  turn: 1,
  pa: 0,
  flags: {},
  eventsQueue: []
};

async function loadData() {
  // Populate translations from the locales module
  translations.en = locales.en;
  translations.pt = locales.pt;
  // Populate game data from the imported modules
  data.nations = nationsData.nations;
  data.traits = traitsData.traits;
  data.turnRules = turnRulesData;
  data.actions = actionsData.actions;
  data.eventsPrince = eventsPrinceData.events;
  data.eventsKing = eventsKingData.events;
  data.arcs = arcsData;
  data.endings = endingsData;
  // Return a resolved promise for compatibility with async initialization
  return Promise.resolve();
}

// Translation function
function t(key, params) {
  const str = (translations[locale] && translations[locale][key]) || key;
  if (params) {
    return str.replace(/\{(\w+)\}/g, (match, p1) => params[p1] ?? match);
  }
  return str;
}

function render(element) {
  appEl.innerHTML = '';
  appEl.appendChild(element);
}

function createButton(label, onClick) {
  const btn = document.createElement('div');
  btn.className = 'button';
  btn.textContent = label;
  btn.onclick = onClick;
  return btn;
}

// Language selection screen
function renderLanguageSelect() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = 'Medieval Kingdoms';
  card.appendChild(title);
  const subtitle = document.createElement('p');
  subtitle.textContent = t('ui.select_language');
  card.appendChild(subtitle);
  const langContainer = document.createElement('div');
  langContainer.className = 'language-select';
  const btnEn = createButton('English', () => { locale = 'en'; renderNationSelect(); });
  const btnPt = createButton('Português', () => { locale = 'pt'; renderNationSelect(); });
  langContainer.appendChild(btnEn);
  langContainer.appendChild(btnPt);
  card.appendChild(langContainer);
  render(card);
}

// Nation selection
function renderNationSelect() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = t('ui.choose_nation');
  card.appendChild(title);
  data.nations.forEach(nation => {
    const nDiv = document.createElement('div');
    nDiv.className = 'card';
    const img = document.createElement('img');
    img.src = nation.image;
    img.alt = nation.id;
    nDiv.appendChild(img);
    const nTitle = document.createElement('h3');
    nTitle.textContent = t(nation.nameKey);
    nDiv.appendChild(nTitle);
    const nDesc = document.createElement('p');
    nDesc.textContent = t(nation.descKey);
    nDiv.appendChild(nDesc);
    nDiv.onclick = () => {
      selectNation(nation);
    };
    card.appendChild(nDiv);
  });
  render(card);
}

function selectNation(nation) {
  state.nation = nation;
  // initialize stats copy
  state.stats = JSON.parse(JSON.stringify(nation.stats));
  renderTraitsSelect();
}

// Trait selection screen (choose 2)
function renderTraitsSelect() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = t('ui.select_traits');
  card.appendChild(title);
  const selected = [];
  const traitContainer = document.createElement('div');
  traitContainer.className = 'actions-grid';
  data.traits.forEach(tr => {
    const div = document.createElement('div');
    div.className = 'action-card card';
    const h = document.createElement('h3');
    h.textContent = t(tr.titleKey);
    div.appendChild(h);
    const p = document.createElement('p');
    p.textContent = t(tr.descKey);
    div.appendChild(p);
    div.onclick = () => {
      if (selected.includes(tr)) {
        div.style.outline = '';
        selected.splice(selected.indexOf(tr), 1);
      } else if (selected.length < 2) {
        selected.push(tr);
        div.style.outline = '2px solid #4c73aa';
      }
    };
    traitContainer.appendChild(div);
  });
  card.appendChild(traitContainer);
  const confirm = createButton(t('ui.confirm'), () => {
    if (selected.length === 0) return;
    state.traits = selected.map(tr => tr.id);
    // apply modifiers
    selected.forEach(tr => {
      Object.entries(tr.modifiers).forEach(([k, v]) => {
        state.stats[k] = (state.stats[k] || 0) + v;
      });
    });
    startGameplay();
  });
  card.appendChild(confirm);
  render(card);
}

function startGameplay() {
  state.stage = 'prince';
  state.turn = 1;
  state.pa = data.turnRules.pa_per_turn;
  state.flags = {};
  state.eventsQueue = [];
  // Determine initial events? We can queue tutor event immediately
  // We'll rely on event triggers in endTurn
  renderTurn();
}

function getAvailableActions() {
  return data.actions.filter(act => {
    // Check stage requirement
    if (act.requirements && act.requirements.stageIn && !act.requirements.stageIn.includes(state.stage)) return false;
    // Check minStats
    if (act.requirements && act.requirements.minStats) {
      for (const key in act.requirements.minStats) {
        if ((state.stats[key] || 0) < act.requirements.minStats[key]) return false;
      }
    }
    // Check flags requirements (not implemented yet) and maxStats if required
    return true;
  });
}

function renderTurn() {
  const container = document.createElement('div');
  container.className = 'card';
  const h = document.createElement('h2');
  h.textContent = `${t('ui.turn')} ${state.turn}`;
  container.appendChild(h);
  // Stats bar
  const statsBar = document.createElement('div');
  statsBar.className = 'stats-bar';
  const statsMap = [
    { key: 'legitimacy', labelKey: 'ui.stats.legitimacy', emoji: '👑' },
    { key: 'gold', labelKey: 'ui.stats.gold', emoji: '💰' },
    { key: 'military', labelKey: 'ui.stats.military', emoji: '⚔️' },
    { key: 'diplomacy', labelKey: 'ui.stats.diplomacy', emoji: '🤝' }
  ];
  statsMap.forEach(st => {
    const statEl = document.createElement('div');
    statEl.className = 'stat';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = `${st.emoji} ${t(st.labelKey)}`;
    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = state.stats[st.key];
    statEl.appendChild(label);
    statEl.appendChild(value);
    statsBar.appendChild(statEl);
  });
  container.appendChild(statsBar);
  const paInfo = document.createElement('p');
  paInfo.textContent = t('ui.actions_remaining', { pa: state.pa });
  container.appendChild(paInfo);
  // Actions list
  const actions = getAvailableActions();
  const actionsGrid = document.createElement('div');
  actionsGrid.className = 'actions-grid';
  actions.forEach(act => {
    const aDiv = document.createElement('div');
    aDiv.className = 'action-card card';
    const title = document.createElement('h4');
    title.textContent = t(act.titleKey);
    aDiv.appendChild(title);
    const desc = document.createElement('p');
    desc.textContent = t(act.descKey);
    aDiv.appendChild(desc);
    const cost = document.createElement('small');
    cost.textContent = `PA: ${act.costPA}`;
    aDiv.appendChild(cost);
    aDiv.onclick = () => {
      performAction(act);
    };
    actionsGrid.appendChild(aDiv);
  });
  container.appendChild(actionsGrid);
  // End turn button
  const endBtn = createButton(t('ui.end_turn'), () => {
    endTurn();
  });
  container.appendChild(endBtn);
  render(container);
}

function performAction(act) {
  if (state.pa < act.costPA) return;
  state.pa -= act.costPA;
  // Apply stat effects
  if (act.effects && act.effects.stats) {
    for (const key in act.effects.stats) {
      state.stats[key] = (state.stats[key] || 0) + act.effects.stats[key];
    }
  }
  // Set flags
  if (act.flagsSet) {
    act.flagsSet.forEach(f => { state.flags[f] = true; });
  }
  // Queue mayTrigger events as flags as well (not immediate; triggers in events processing)
  if (act.mayTrigger) {
    // We'll set flags for triggers; but not all triggers use flags
    // For each mayTrigger event, we can set a flag to evaluate random events later
    act.mayTrigger.forEach(evtId => {
      // Add to queue? We'll add via flags? Instead, store 'trigger_eventId' to flags
      state.flags[`trigger_${evtId}`] = true;
    });
  }
  // Rerender after action if still has PA
  renderTurn();
}

function endTurn() {
  // Apply income and decay
  const income = data.turnRules.income || {};
  for (const key in income) {
    state.stats[key] = (state.stats[key] || 0) + income[key];
  }
  const decay = data.turnRules.decay || {};
  for (const key in decay) {
    state.stats[key] = (state.stats[key] || 0) + decay[key];
  }
  // Reset PA
  state.pa = data.turnRules.pa_per_turn;
  // Increase turn
  state.turn += 1;
  // Stage transition: after certain turn or after milestone we can move to king
  if (state.stage === 'prince' && state.turn >= 4) {
    state.stage = 'king';
  }
  // Evaluate arcs (milestones)
  checkArcs();
  // Process triggered events
  processEvents();
  // After events processed, check endings
  if (!checkEndings()) {
    renderTurn();
  }
}

function checkArcs() {
  const arc = data.arcs;
  if (!state.flags._milestones) state.flags._milestones = {};
  arc.milestones.forEach(ms => {
    if (state.flags._milestones[ms.id]) return;
    // Check unlock conditions
    let ok = true;
    if (ms.unlock) {
      if (ms.unlock.turnAtLeast && state.turn < ms.unlock.turnAtLeast) ok = false;
      if (ms.unlock.stageIn && !ms.unlock.stageIn.includes(state.stage)) ok = false;
      if (ms.unlock.minStats) {
        for (const k in ms.unlock.minStats) {
          if ((state.stats[k] || 0) < ms.unlock.minStats[k]) ok = false;
        }
      }
    }
    if (ok) {
      // Mark milestone complete
      state.flags._milestones[ms.id] = true;
      // Set flags
      if (ms.flagsSet) ms.flagsSet.forEach(f => { state.flags[f] = true; });
      // Queue events
      if (ms.onStartQueueEvents) {
        ms.onStartQueueEvents.forEach(ev => {
          state.eventsQueue.push(ev);
        });
      }
    }
  });
}

function processEvents() {
  // Evaluate events triggers to populate queue
  const eventsList = state.stage === 'prince' ? data.eventsPrince : data.eventsKing;
  eventsList.forEach(ev => {
    // Skip if already in queue or flagged as processed
    if (state.flags[`event_done_${ev.id}`]) return;
    // Already queued?
    if (state.eventsQueue.includes(ev.id)) return;
    // Evaluate trigger
    if (!ev.trigger) return;
    if (checkTrigger(ev.trigger)) {
      state.eventsQueue.push(ev.id);
    }
  });
  // If there is an event in the queue, process the first one
  if (state.eventsQueue.length > 0) {
    const evId = state.eventsQueue.shift();
    const ev = (state.stage === 'prince' ? data.eventsPrince : data.eventsKing).find(e => e.id === evId);
    if (ev) {
      showEvent(ev);
    }
  }
}

function checkTrigger(trigger) {
  // Trigger object can have multiple keys
  if (trigger.any) {
    return trigger.any.some(cond => checkTrigger(cond));
  }
  if (trigger.all) {
    return trigger.all.every(cond => checkTrigger(cond));
  }
  if (trigger.flag) {
    return !!state.flags[trigger.flag];
  }
  if (trigger.minStat) {
    for (const k in trigger.minStat) {
      if ((state.stats[k] || 0) < trigger.minStat[k]) return false;
    }
    return true;
  }
  if (trigger.maxStat) {
    for (const k in trigger.maxStat) {
      if ((state.stats[k] || 0) > trigger.maxStat[k]) return false;
    }
    return true;
  }
  if (trigger.turnAtLeast) {
    return state.turn >= trigger.turnAtLeast;
  }
  if (trigger.random) {
    // 50% chance to trigger random events
    return Math.random() < 0.3;
  }
  return false;
}

function showEvent(ev) {
  // Mark event as processed
  state.flags[`event_done_${ev.id}`] = true;
  const card = document.createElement('div');
  card.className = 'card';
  const img = document.createElement('img');
  img.className = 'event-image';
  img.src = ev.image;
  img.alt = '';
  card.appendChild(img);
  const title = document.createElement('h3');
  title.textContent = t(ev.titleKey);
  card.appendChild(title);
  const text = document.createElement('p');
  text.textContent = t(ev.textKey);
  card.appendChild(text);
  ev.choices.forEach(choice => {
    const btn = createButton(t(choice.textKey), () => {
      // Apply effects
      if (choice.effects) {
        if (choice.effects.stats) {
          for (const k in choice.effects.stats) {
            state.stats[k] = (state.stats[k] || 0) + choice.effects.stats[k];
          }
        }
        if (choice.effects.flagsSet) {
          choice.effects.flagsSet.forEach(f => { state.flags[f] = true; });
        }
      }
      // After choice, process next events or continue
      processEvents();
      if (!checkEndings()) {
        renderTurn();
      }
    });
    card.appendChild(btn);
  });
  render(card);
}

function checkEndings() {
  // Check gameover first
  for (const ending of data.endings.gameover) {
    if (meetsRequirements(ending.requirements)) {
      showEnding(ending, false);
      return true;
    }
  }
  // Check victory
  for (const ending of data.endings.victory) {
    if (meetsRequirements(ending.requirements)) {
      showEnding(ending, true);
      return true;
    }
  }
  // Also if max turn reached
  if (state.turn > data.turnRules.max_turns) {
    // determine highest stat for final ending
    const bestStat = Object.entries(state.stats).reduce((a, b) => (b[1] > a[1] ? b : a));
    let endingId;
    if (bestStat[0] === 'military') endingId = 'victory_military';
    else if (bestStat[0] === 'diplomacy') endingId = 'victory_diplomatic';
    else endingId = 'victory_economic';
    const ending = data.endings.victory.find(e => e.id === endingId);
    showEnding(ending, true);
    return true;
  }
  return false;
}

function meetsRequirements(req) {
  if (!req) return false;
  if (req.minStats) {
    for (const k in req.minStats) {
      if ((state.stats[k] || 0) < req.minStats[k]) return false;
    }
  }
  if (req.maxStats) {
    for (const k in req.maxStats) {
      if ((state.stats[k] || 0) > req.maxStats[k]) return false;
    }
  }
  if (req.flags) {
    for (const f of req.flags) {
      if (!state.flags[f]) return false;
    }
  }
  return true;
}

function showEnding(ending, victory) {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = victory ? t('ui.victory') + ' - ' + t(ending.titleKey) : t('ui.game_over') + ' - ' + t(ending.titleKey);
  card.appendChild(title);
  const img = document.createElement('img');
  img.className = 'event-image';
  img.src = ending.image;
  card.appendChild(img);
  const text = document.createElement('p');
  text.textContent = t(ending.textKey);
  card.appendChild(text);
  // show final stats summary
  const summary = document.createElement('p');
  summary.innerHTML = `<strong>Final Stats:</strong>\n👑 ${state.stats.legitimacy}, 💰 ${state.stats.gold}, ⚔️ ${state.stats.military}, 🤝 ${state.stats.diplomacy}`;
  card.appendChild(summary);
  const playAgain = createButton(t('ui.play_again'), () => {
    // restart game
    state = {
      nation: null,
      traits: [],
      stats: { legitimacy: 50, gold: 50, military: 50, diplomacy: 50 },
      stage: 'prince',
      turn: 1,
      pa: 0,
      flags: {},
      eventsQueue: []
    };
    renderLanguageSelect();
  });
  card.appendChild(playAgain);
  render(card);
}

// Initialize game
loadData().then(() => {
  renderLanguageSelect();
});