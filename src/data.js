// This file contains static game data imported by app.js
// Part 2 (Commercial Base): adds regions + factions + richer effects payloads.

export const nations = {
  nations: [
    {
      id: "england",
      nameKey: "nation.england.name",
      descKey: "nation.england.desc",
      stats: { legitimacy: 50, gold: 60, military: 40, diplomacy: 60 },
      traits: ["diplomat"],
      image: "assets/images/nations/england.png"
    },
    {
      id: "france",
      nameKey: "nation.france.name",
      descKey: "nation.france.desc",
      stats: { legitimacy: 50, gold: 40, military: 60, diplomacy: 40 },
      traits: ["ambitious"],
      image: "assets/images/nations/france.png"
    },
    {
      id: "hre",
      nameKey: "nation.hre.name",
      descKey: "nation.hre.desc",
      stats: { legitimacy: 40, gold: 50, military: 50, diplomacy: 50 },
      traits: ["just"],
      image: "assets/images/nations/hre.png"
    },
    {
      id: "castile",
      nameKey: "nation.castile.name",
      descKey: "nation.castile.desc",
      stats: { legitimacy: 55, gold: 45, military: 45, diplomacy: 40 },
      traits: ["devout"],
      image: "assets/images/nations/castile.png"
    },
    {
      id: "ottoman",
      nameKey: "nation.ottoman.name",
      descKey: "nation.ottoman.desc",
      stats: { legitimacy: 45, gold: 60, military: 55, diplomacy: 50 },
      traits: ["cruel"],
      image: "assets/images/nations/ottoman.png"
    }
  ]
};

export const traits = {
  traits: [
    { id: "just", titleKey: "trait.just.title", descKey: "trait.just.desc", modifiers: { legitimacy: 10, military: -5 } },
    { id: "cruel", titleKey: "trait.cruel.title", descKey: "trait.cruel.desc", modifiers: { military: 10, diplomacy: -10 } },
    { id: "devout", titleKey: "trait.devout.title", descKey: "trait.devout.desc", modifiers: { legitimacy: 10, gold: -5 } },
    { id: "diplomat", titleKey: "trait.diplomat.title", descKey: "trait.diplomat.desc", modifiers: { diplomacy: 10, military: -5 } },
    { id: "ambitious", titleKey: "trait.ambitious.title", descKey: "trait.ambitious.desc", modifiers: { military: 5, legitimacy: -3 } }
  ]
};

export const factions = {
  factions: [
    { id: "nobility", nameKey: "faction.nobility", loyalty: 55 },
    { id: "clergy", nameKey: "faction.clergy", loyalty: 50 },
    { id: "army", nameKey: "faction.army", loyalty: 50 },
    { id: "merchants", nameKey: "faction.merchants", loyalty: 55 }
  ]
};

// Abstract realm map (4 regions). Later DLCs can add more.
export const regions = {
  regions: [
    { id: "capital", nameKey: "region.capital", prosperity: 60, unrest: 10 },
    { id: "coast", nameKey: "region.coast", prosperity: 55, unrest: 12 },
    { id: "heartland", nameKey: "region.heartland", prosperity: 50, unrest: 15 },
    { id: "frontier", nameKey: "region.frontier", prosperity: 45, unrest: 18 }
  ]
};

export const turnRules = {
  pa_per_turn: 3,
  max_turns: 24,
  // Base income + income per region derived from prosperity and stability.
  income: { gold: 4 },
  // Small decay to avoid infinite snowball
  decay: { legitimacy: 0, diplomacy: 0, military: 0 }
};

// Actions: Part 2 adds richer effects: flagsSet, factions, diplomacyMeta, regionsMeta.
export const actions = {
  actions: [
    {
      id: "raise_taxes",
      costPA: 1,
      titleKey: "action.raise_taxes.title",
      descKey: "action.raise_taxes.desc",
      requirements: {},
      effects: {
        stats: { gold: 15, legitimacy: -5 },
        factions: { merchants: -6, nobility: -3 }
      },
      flagsSet: ["taxes_raised_once"],
      mayTrigger: ["event_revolt"]
    },
    {
      id: "lower_taxes",
      costPA: 1,
      titleKey: "action.lower_taxes.title",
      descKey: "action.lower_taxes.desc",
      requirements: {},
      effects: {
        stats: { gold: -10, legitimacy: 6 },
        factions: { merchants: 4, nobility: 2 }
      }
    },
    {
      id: "invest_infrastructure",
      costPA: 1,
      titleKey: "action.invest_infrastructure.title",
      descKey: "action.invest_infrastructure.desc",
      requirements: { minStats: { gold: 20 } },
      effects: {
        stats: { gold: -15, legitimacy: 3 },
        regionsMeta: { prosperity: +2, unrest: -1 }
      }
    },
    {
      id: "host_feast",
      costPA: 1,
      titleKey: "action.host_feast.title",
      descKey: "action.host_feast.desc",
      requirements: { minStats: { gold: 10 } },
      effects: { stats: { gold: -10, legitimacy: 6, diplomacy: 3 }, factions: { nobility: 4, clergy: 1 } }
    },
    {
      id: "recruit_troops",
      costPA: 1,
      titleKey: "action.recruit_troops.title",
      descKey: "action.recruit_troops.desc",
      requirements: { minStats: { gold: 10 } },
      effects: { stats: { gold: -10, military: 8 }, factions: { army: 4 } }
    },
    {
      id: "train_army",
      costPA: 1,
      titleKey: "action.train_army.title",
      descKey: "action.train_army.desc",
      requirements: {},
      effects: { stats: { military: 6 }, factions: { army: 2 } }
    },
    {
      id: "fortify_border",
      costPA: 1,
      titleKey: "action.fortify_border.title",
      descKey: "action.fortify_border.desc",
      requirements: { minStats: { gold: 10 } },
      effects: { stats: { gold: -10, military: 4, legitimacy: 2 }, regionsMeta: { frontier_unrest: -2 } }
    },
    {
      id: "propose_alliance",
      costPA: 1,
      titleKey: "action.propose_alliance.title",
      descKey: "action.propose_alliance.desc",
      requirements: { minStats: { diplomacy: 30 } },
      effects: { stats: { diplomacy: 6, legitimacy: 2 } },
      flagsSet: ["alliance_offer"],
      mayTrigger: ["event_diplomacy"]
    },
    {
      id: "send_gift",
      costPA: 1,
      titleKey: "action.send_gift.title",
      descKey: "action.send_gift.desc",
      requirements: { minStats: { gold: 10 } },
      effects: { stats: { gold: -10, diplomacy: 6 }, factions: { merchants: -1 } },
      flagsSet: ["gift_sent"]
    },
    {
      id: "declare_war",
      costPA: 2,
      titleKey: "action.declare_war.title",
      descKey: "action.declare_war.desc",
      requirements: { minStats: { military: 40 } },
      effects: { stats: { legitimacy: -10, military: -5 }, factions: { army: 4, merchants: -3 } },
      flagsSet: ["war_declaration"],
      mayTrigger: ["event_war"]
    },
    {
      id: "sign_trade_route",
      costPA: 1,
      titleKey: "action.sign_trade_route.title",
      descKey: "action.sign_trade_route.desc",
      requirements: { minStats: { diplomacy: 25 } },
      effects: { stats: { gold: 10, diplomacy: 3 }, factions: { merchants: 6 } },
      flagsSet: ["trade_route_signed"],
      mayTrigger: ["event_market"]
    },
    {
      id: "host_tournament",
      costPA: 1,
      titleKey: "action.host_tournament.title",
      descKey: "action.host_tournament.desc",
      requirements: { minStats: { gold: 15 } },
      effects: { stats: { gold: -15, legitimacy: 5, military: 2 }, factions: { nobility: 2, army: 2 } },
      flagsSet: ["tournament_hosted"]
    },
    {
      id: "pass_law",
      costPA: 1,
      titleKey: "action.pass_law.title",
      descKey: "action.pass_law.desc",
      requirements: { minStats: { legitimacy: 30 } },
      effects: { stats: { legitimacy: 4 }, factions: { nobility: -2, clergy: 1 } },
      flagsSet: ["law_pass_requested"],
      mayTrigger: ["event_court_meeting"]
    },
    {
      id: "spy_on_nobles",
      costPA: 1,
      titleKey: "action.spy_on_nobles.title",
      descKey: "action.spy_on_nobles.desc",
      requirements: {},
      effects: { stats: { diplomacy: -1 }, factions: { nobility: -4 } },
      flagsSet: ["noble_spy"],
      mayTrigger: ["event_conspiracy"]
    },
    {
      id: "sabotage_enemy",
      costPA: 1,
      titleKey: "action.sabotage_enemy.title",
      descKey: "action.sabotage_enemy.desc",
      requirements: { minStats: { diplomacy: 20 } },
      effects: { stats: { diplomacy: -3, military: 2 }, factions: { nobility: 1 } }
    },
    {
      id: "arrange_marriage",
      costPA: 1,
      titleKey: "action.arrange_marriage.title",
      descKey: "action.arrange_marriage.desc",
      requirements: { minStats: { diplomacy: 35 } },
      effects: { stats: { diplomacy: 8, legitimacy: 2 }, factions: { nobility: 2, clergy: 1 } }
    },
    {
      id: "hold_court",
      costPA: 1,
      titleKey: "action.hold_court.title",
      descKey: "action.hold_court.desc",
      requirements: {},
      effects: { stats: { legitimacy: 5 }, factions: { nobility: 1, clergy: 1 } }
    },
    {
      id: "suppress_revolt",
      costPA: 1,
      titleKey: "action.suppress_revolt.title",
      descKey: "action.suppress_revolt.desc",
      requirements: { minStats: { military: 25 } },
      effects: { stats: { military: -3, legitimacy: -2 }, factions: { army: 2, merchants: -1 } }
    },
    {
      id: "fund_clergy",
      costPA: 1,
      titleKey: "action.fund_clergy.title",
      descKey: "action.fund_clergy.desc",
      requirements: { minStats: { gold: 10 } },
      effects: { stats: { gold: -10, legitimacy: 5, diplomacy: 1 }, factions: { clergy: 6 } }
    },
    {
      id: "explore_new_land",
      costPA: 2,
      titleKey: "action.explore_new_land.title",
      descKey: "action.explore_new_land.desc",
      requirements: { minStats: { gold: 15 } },
      effects: { stats: { gold: -15, legitimacy: 3, diplomacy: 2 }, regionsMeta: { prosperity: +3 } }
    }
  ]
};

export const eventsPrince = {
  events: [
    {
      id: "event_prince_tutor",
      stage: "prince",
      priority: 90,
      trigger: { turnAtLeast: 1 },
      image: "assets/images/events/court.png",
      titleKey: "event.prince.tutor.title",
      textKey: "event.prince.tutor.text",
      choices: [
        { textKey: "event.prince.tutor.choice1", effects: { stats: { diplomacy: 10 } } },
        { textKey: "event.prince.tutor.choice2", effects: { stats: { military: 10 } } }
      ]
    },
    {
      id: "event_prince_hunt",
      stage: "prince",
      priority: 60,
      trigger: { random: true, turnAtLeast: 2 },
      image: "assets/images/events/hunt.png",
      titleKey: "event.prince.hunt.title",
      textKey: "event.prince.hunt.text",
      choices: [
        { textKey: "event.prince.hunt.choice1", effects: { flagsSet: ["trait_just"], stats: { legitimacy: 5 } } },
        { textKey: "event.prince.hunt.choice2", effects: { flagsSet: ["trait_cruel"], stats: { military: 5 } } }
      ]
    },
    {
      id: "event_prince_study",
      stage: "prince",
      priority: 50,
      trigger: { turnAtLeast: 3 },
      image: "assets/images/events/market.png",
      titleKey: "event.prince.study.title",
      textKey: "event.prince.study.text",
      choices: [
        { textKey: "event.prince.study.choice1", effects: { stats: { gold: 15 } } },
        { textKey: "event.prince.study.choice2", effects: { stats: { legitimacy: 10 } } }
      ]
    },
    {
      id: "event_prince_dissent",
      stage: "prince",
      priority: 40,
      trigger: { maxStat: { legitimacy: 40 } },
      image: "assets/images/events/conspiracy.png",
      titleKey: "event.prince.dissent.title",
      textKey: "event.prince.dissent.text",
      choices: [
        { textKey: "event.prince.dissent.choice1", effects: { stats: { legitimacy: 5 } } },
        { textKey: "event.prince.dissent.choice2", effects: { stats: { legitimacy: -5 }, flagsSet: ["ignored_dissent"] } }
      ]
    }
  ]
};

export const eventsKing = {
  events: [
    {
      id: "event_succession",
      stage: "king",
      priority: 100,
      trigger: { flag: "succession_crisis" },
      image: "assets/images/events/succession.png",
      titleKey: "event.succession.title",
      textKey: "event.succession.text",
      choices: [
        { textKey: "event.succession.choice1", effects: { stats: { legitimacy: 5, diplomacy: 2 }, flagsSet: ["heir_prepared"] } },
        { textKey: "event.succession.choice2", effects: { stats: { legitimacy: 3, gold: -5 }, flagsSet: ["power_consolidated"], factions: { nobility: -3 } } },
        { textKey: "event.succession.choice3", effects: { stats: { legitimacy: -5 } } }
      ]
    },
    {
      id: "event_revolt",
      stage: "king",
      priority: 80,
      trigger: { any: [{ flag: "taxes_raised_once" }, { maxStat: { legitimacy: 30 } }] },
      image: "assets/images/events/revolt.png",
      titleKey: "event.revolt.title",
      textKey: "event.revolt.text",
      choices: [
        { textKey: "event.revolt.choice1", effects: { stats: { military: -5, legitimacy: -5 }, factions: { army: 1, merchants: -2 } } },
        { textKey: "event.revolt.choice2", effects: { stats: { gold: -10, legitimacy: 5 }, factions: { merchants: 2 } } }
      ]
    },
    {
      id: "event_diplomacy",
      stage: "king",
      priority: 55,
      trigger: { flag: "alliance_offer" },
      image: "assets/images/events/diplomacy.png",
      titleKey: "event.diplomacy.title",
      textKey: "event.diplomacy.text",
      choices: [
        { textKey: "event.diplomacy.choice1", effects: { stats: { diplomacy: 10, military: -5 }, diplomacyMeta: { alliances: +1 } } },
        { textKey: "event.diplomacy.choice2", effects: { stats: { legitimacy: -3 }, diplomacyMeta: { rivalries: +1 } } }
      ]
    },
    {
      id: "event_war",
      stage: "king",
      priority: 60,
      trigger: { any: [{ flag: "war_declaration" }, { random: true, turnAtLeast: 5 }] },
      image: "assets/images/events/war.png",
      titleKey: "event.war.title",
      textKey: "event.war.text",
      choices: [
        { textKey: "event.war.choice1", effects: { stats: { military: -5, legitimacy: 5 }, diplomacyMeta: { wars: +1 }, flagsSet: ["in_war"] } },
        { textKey: "event.war.choice2", effects: { stats: { diplomacy: 5, legitimacy: -2 }, flagsSet: ["avoided_war"] } }
      ]
    },
    {
      id: "event_market",
      stage: "king",
      priority: 45,
      trigger: { flag: "trade_route_signed" },
      image: "assets/images/events/market.png",
      titleKey: "event.market.title",
      textKey: "event.market.text",
      choices: [
        { textKey: "event.market.choice1", effects: { stats: { gold: 10, diplomacy: -3 }, factions: { merchants: -1 } } },
        { textKey: "event.market.choice2", effects: { stats: { diplomacy: 5, gold: 5 }, factions: { merchants: 2 } } }
      ]
    },
    {
      id: "event_conspiracy",
      stage: "king",
      priority: 50,
      trigger: { flag: "noble_spy" },
      image: "assets/images/events/conspiracy.png",
      titleKey: "event.conspiracy.title",
      textKey: "event.conspiracy.text",
      choices: [
        { textKey: "event.conspiracy.choice1", effects: { stats: { legitimacy: -2, diplomacy: -5, military: 2 }, factions: { nobility: -8 } } },
        { textKey: "event.conspiracy.choice2", effects: { stats: { gold: 10, legitimacy: -5 }, flagsSet: ["blackmail_used"], factions: { nobility: -3 } } }
      ]
    },
    {
      id: "event_court_meeting",
      stage: "king",
      priority: 70,
      trigger: { flag: "law_pass_requested" },
      image: "assets/images/events/court.png",
      titleKey: "event.court_meeting.title",
      textKey: "event.court_meeting.text",
      choices: [
        { textKey: "event.court_meeting.choice1", effects: { stats: { legitimacy: 5, gold: -5 }, factions: { nobility: -2 } } },
        { textKey: "event.court_meeting.choice2", effects: { stats: { legitimacy: -2, diplomacy: 2 }, factions: { nobility: 1 } } }
      ]
    }
  ]
};

export const arcs = {
  id: "arc_kingdom_rise",
  milestones: [
    {
      id: "succession_crisis",
      unlock: { turnAtLeast: 4, stageIn: ["king"] },
      onStartQueueEvents: ["event_succession"],
      flagsSet: ["succession_crisis"]
    }
  ]
};


// --- WAR SYSTEM (Part 3) ---
export const warConfig = {
  enemyBase: 55,         // baseline enemy strength
  enemyGrowthPerTurn: 2, // enemy grows during war
  moraleLossOnDefeat: 6,
  moraleGainOnWin: 4
};

export const warActions = {
  actions: [
    {
      id: "war_raid",
      costPA: 1,
      titleKey: "war.raid.title",
      descKey: "war.raid.desc",
      requirements: { flagsAll: ["in_war"] },
      effects: {
        war: { playerPower: +2, enemyPower: -3, morale: +2 },
        stats: { gold: +8, legitimacy: -2 },
        factions: { army: +2, merchants: -1 }
      },
      mayTrigger: ["event_war_raid_result"]
    },
    {
      id: "war_siege",
      costPA: 2,
      titleKey: "war.siege.title",
      descKey: "war.siege.desc",
      requirements: { flagsAll: ["in_war"], minStats: { military: 45 } },
      effects: {
        war: { playerPower: +4, enemyPower: -6, morale: +3 },
        stats: { military: -2, legitimacy: +2 },
        factions: { army: +3 }
      },
      mayTrigger: ["event_war_siege_result"]
    },
    {
      id: "war_reinforce",
      costPA: 1,
      titleKey: "war.reinforce.title",
      descKey: "war.reinforce.desc",
      requirements: { flagsAll: ["in_war"], minStats: { gold: 10 } },
      effects: {
        war: { playerPower: +3, morale: +1 },
        stats: { gold: -10, military: +2 },
        factions: { army: +2, merchants: -1 }
      }
    },
    {
      id: "war_seek_peace",
      costPA: 1,
      titleKey: "war.seek_peace.title",
      descKey: "war.seek_peace.desc",
      requirements: { flagsAll: ["in_war"], minStats: { diplomacy: 35 } },
      effects: {
        war: { peaceAttempt: true },
        stats: { diplomacy: +1 }
      },
      mayTrigger: ["event_war_peace_talks"]
    }
  ]
};

export const endings = {
  victory: [
    {
      id: "victory_diplomatic",
      requirements: { minStats: { diplomacy: 80 }, minDiplomacyMeta: { alliances: 1 } },
      titleKey: "ending.victory_diplomatic.title",
      textKey: "ending.victory_diplomatic.text",
      image: "assets/images/endings/victory.png"
    },
    {
      id: "victory_military",
      requirements: { minStats: { military: 80 } },
      titleKey: "ending.victory_military.title",
      textKey: "ending.victory_military.text",
      image: "assets/images/endings/victory.png"
    },
    {
      id: "victory_economic",
      requirements: { minStats: { gold: 170 }, minFactions: { merchants: 60 } },
      titleKey: "ending.victory_economic.title",
      textKey: "ending.victory_economic.text",
      image: "assets/images/endings/victory.png"
    }
  ],
  gameover: [
    {
      id: "overthrow",
      requirements: { maxStats: { legitimacy: 0 } },
      titleKey: "ending.overthrow.title",
      textKey: "ending.overthrow.text",
      image: "assets/images/endings/defeat.png"
    },
    {
      id: "bankrupt",
      requirements: { maxStats: { gold: -50 } },
      titleKey: "ending.bankrupt.title",
      textKey: "ending.bankrupt.text",
      image: "assets/images/endings/defeat.png"
    },
    {
      id: "war_loss",
      requirements: { maxStats: { military: 0 }, maxWar: { morale: 0 } },
      titleKey: "ending.war_loss.title",
      textKey: "ending.war_loss.text",
      image: "assets/images/endings/defeat.png"
    },
    {
      id: "coup",
      requirements: { maxFactions: { nobility: 0 } },
      titleKey: "ending.coup.title",
      textKey: "ending.coup.text",
      image: "assets/images/endings/defeat.png"
    }
  ]
};
