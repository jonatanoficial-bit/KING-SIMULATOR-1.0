// This file contains static game data imported by app.js

export const nations = {
  "nations": [
    {
      "id": "england",
      "nameKey": "nation.england.name",
      "descKey": "nation.england.desc",
      "stats": {"legitimacy": 50, "gold": 60, "military": 40, "diplomacy": 60},
      "traits": ["diplomat"],
      "image": "assets/images/nations/england.png"
    },
    {
      "id": "france",
      "nameKey": "nation.france.name",
      "descKey": "nation.france.desc",
      "stats": {"legitimacy": 50, "gold": 40, "military": 60, "diplomacy": 40},
      "traits": ["ambitious"],
      "image": "assets/images/nations/france.png"
    },
    {
      "id": "hre",
      "nameKey": "nation.hre.name",
      "descKey": "nation.hre.desc",
      "stats": {"legitimacy": 40, "gold": 50, "military": 50, "diplomacy": 50},
      "traits": ["just"],
      "image": "assets/images/nations/hre.png"
    },
    {
      "id": "castile",
      "nameKey": "nation.castile.name",
      "descKey": "nation.castile.desc",
      "stats": {"legitimacy": 55, "gold": 45, "military": 45, "diplomacy": 40},
      "traits": ["devout"],
      "image": "assets/images/nations/castile.png"
    },
    {
      "id": "ottoman",
      "nameKey": "nation.ottoman.name",
      "descKey": "nation.ottoman.desc",
      "stats": {"legitimacy": 45, "gold": 60, "military": 55, "diplomacy": 50},
      "traits": ["cruel"],
      "image": "assets/images/nations/ottoman.png"
    }
  ]
};

export const traits = {
  "traits": [
    {
      "id": "just",
      "titleKey": "trait.just.title",
      "descKey": "trait.just.desc",
      "modifiers": {"legitimacy": 10, "military": -5}
    },
    {
      "id": "cruel",
      "titleKey": "trait.cruel.title",
      "descKey": "trait.cruel.desc",
      "modifiers": {"military": 10, "diplomacy": -10}
    },
    {
      "id": "devout",
      "titleKey": "trait.devout.title",
      "descKey": "trait.devout.desc",
      "modifiers": {"legitimacy": 10, "gold": -5}
    },
    {
      "id": "diplomat",
      "titleKey": "trait.diplomat.title",
      "descKey": "trait.diplomat.desc",
      "modifiers": {"diplomacy": 10, "military": -5}
    },
    {
      "id": "ambitious",
      "titleKey": "trait.ambitious.title",
      "descKey": "trait.ambitious.desc",
      "modifiers": {"military": 5, "gold": 5, "legitimacy": -5}
    }
  ]
};

export const turnRules = /* turn_rules.json */
{
  "pa_per_turn": 3,
  "income": {
    "gold": 5
  },
  "decay": {
    "legitimacy": 0,
    "military": 0,
    "diplomacy": 0
  },
  "max_turns": 240
};

export const actions = {
  "actions": [
    {
      "id": "raise_taxes",
      "costPA": 1,
      "titleKey": "action.raise_taxes.title",
      "descKey": "action.raise_taxes.desc",
      "requirements": {},
      "effects": {"stats": {"gold": 15, "legitimacy": -5}},
      "mayTrigger": ["event_revolt"]
    },
    {
      "id": "lower_taxes",
      "costPA": 1,
      "titleKey": "action.lower_taxes.title",
      "descKey": "action.lower_taxes.desc",
      "requirements": {},
      "effects": {"stats": {"gold": -10, "legitimacy": 5}},
      "mayTrigger": []
    },
    {
      "id": "invest_infrastructure",
      "costPA": 1,
      "titleKey": "action.invest_infrastructure.title",
      "descKey": "action.invest_infrastructure.desc",
      "requirements": {"minStats": {"gold": 20}},
      "effects": {"stats": {"gold": -20, "legitimacy": 5, "diplomacy": 2}},
      "mayTrigger": []
    },
    {
      "id": "host_feast",
      "costPA": 1,
      "titleKey": "action.host_feast.title",
      "descKey": "action.host_feast.desc",
      "requirements": {"minStats": {"gold": 15}},
      "effects": {"stats": {"gold": -15, "legitimacy": 8, "diplomacy": 3}},
      "mayTrigger": []
    },
    {
      "id": "recruit_troops",
      "costPA": 1,
      "titleKey": "action.recruit_troops.title",
      "descKey": "action.recruit_troops.desc",
      "requirements": {"minStats": {"gold": 10}},
      "effects": {"stats": {"gold": -10, "military": 10}},
      "mayTrigger": []
    },
    {
      "id": "train_army",
      "costPA": 1,
      "titleKey": "action.train_army.title",
      "descKey": "action.train_army.desc",
      "requirements": {"minStats": {"military": 5}},
      "effects": {"stats": {"military": 5, "gold": -5}},
      "mayTrigger": []
    },
    {
      "id": "fortify_border",
      "costPA": 1,
      "titleKey": "action.fortify_border.title",
      "descKey": "action.fortify_border.desc",
      "requirements": {"stageIn": ["king"]},
      "effects": {"stats": {"gold": -15, "military": 5, "legitimacy": 3}},
      "mayTrigger": []
    },
    {
      "id": "propose_alliance",
      "costPA": 1,
      "titleKey": "action.propose_alliance.title",
      "descKey": "action.propose_alliance.desc",
      "requirements": {},
      "effects": {"stats": {"diplomacy": 6, "legitimacy": 2}},
      "mayTrigger": ["event_diplomacy"],
      "flagsSet": ["alliance_offer"]
    },
    {
      "id": "send_gift",
      "costPA": 1,
      "titleKey": "action.send_gift.title",
      "descKey": "action.send_gift.desc",
      "requirements": {"minStats": {"gold": 10}},
      "effects": {"stats": {"gold": -10, "diplomacy": 8}},
      "mayTrigger": []
    },
    {
      "id": "declare_war",
      "costPA": 2,
      "titleKey": "action.declare_war.title",
      "descKey": "action.declare_war.desc",
      "requirements": {"stageIn": ["king"], "minStats": {"military": 20}},
      "effects": {"stats": {"legitimacy": -10, "military": -5}},
      "mayTrigger": ["event_war"],
      "flagsSet": ["war_declaration"]
    },
    {
      "id": "sign_trade_route",
      "costPA": 1,
      "titleKey": "action.sign_trade_route.title",
      "descKey": "action.sign_trade_route.desc",
      "requirements": {},
      "effects": {"stats": {"gold": 10, "diplomacy": 4}},
      "mayTrigger": ["event_trade"],
      "flagsSet": ["trade_proposal", "trade_route_signed"]
    },
    {
      "id": "host_tournament",
      "costPA": 1,
      "titleKey": "action.host_tournament.title",
      "descKey": "action.host_tournament.desc",
      "requirements": {"minStats": {"gold": 20}},
      "effects": {"stats": {"gold": -20, "legitimacy": 7, "military": 5}},
      "mayTrigger": ["event_tournament"],
      "flagsSet": ["tournament_hosted"]
    },
    {
      "id": "pass_law",
      "costPA": 1,
      "titleKey": "action.pass_law.title",
      "descKey": "action.pass_law.desc",
      "requirements": {"stageIn": ["king"]},
      "effects": {"stats": {"legitimacy": 4, "diplomacy": -2}},
      "mayTrigger": ["event_court_meeting"],
      "flagsSet": ["law_pass_requested"]
    },
    {
      "id": "spy_on_nobles",
      "costPA": 1,
      "titleKey": "action.spy_on_nobles.title",
      "descKey": "action.spy_on_nobles.desc",
      "requirements": {},
      "effects": {"stats": {"diplomacy": -2}},
      "mayTrigger": ["event_conspiracy"],
      "flagsSet": ["noble_spy"]
    },
    {
      "id": "sabotage_enemy",
      "costPA": 1,
      "titleKey": "action.sabotage_enemy.title",
      "descKey": "action.sabotage_enemy.desc",
      "requirements": {"minStats": {"diplomacy": 10}},
      "effects": {"stats": {"diplomacy": -5, "military": 3}},
      "mayTrigger": []
    },
    {
      "id": "arrange_marriage",
      "costPA": 1,
      "titleKey": "action.arrange_marriage.title",
      "descKey": "action.arrange_marriage.desc",
      "requirements": {},
      "effects": {"stats": {"diplomacy": 5, "legitimacy": 3}},
      "mayTrigger": []
    },
    {
      "id": "hold_court",
      "costPA": 1,
      "titleKey": "action.hold_court.title",
      "descKey": "action.hold_court.desc",
      "requirements": {},
      "effects": {"stats": {"legitimacy": 6, "gold": -5}},
      "mayTrigger": []
    },
    {
      "id": "suppress_revolt",
      "costPA": 1,
      "titleKey": "action.suppress_revolt.title",
      "descKey": "action.suppress_revolt.desc",
      "requirements": {"minStats": {"military": 10}},
      "effects": {"stats": {"military": -3, "legitimacy": -5}},
      "mayTrigger": []
    },
    {
      "id": "fund_clergy",
      "costPA": 1,
      "titleKey": "action.fund_clergy.title",
      "descKey": "action.fund_clergy.desc",
      "requirements": {"minStats": {"gold": 10}},
      "effects": {"stats": {"gold": -10, "legitimacy": 4, "diplomacy": 2}},
      "mayTrigger": []
    },
    {
      "id": "explore_new_land",
      "costPA": 1,
      "titleKey": "action.explore_new_land.title",
      "descKey": "action.explore_new_land.desc",
      "requirements": {},
      "effects": {"stats": {"gold": -5, "legitimacy": 2, "diplomacy": 2}},
      "mayTrigger": []
    }
    ,
    // Part 6 actions – Advisors, Intrigues and Missions
    {
      "id": "hire_advisor",
      "costPA": 1,
      "titleKey": "action.hire_advisor.title",
      "descKey": "action.hire_advisor.desc",
      "requirements": {"stageIn": ["king"], "minStats": {"gold": 15}},
      "effects": {"stats": {"gold": -15, "diplomacy": 5}},
      "mayTrigger": ["event_advisor_suggest"],
      "flagsSet": ["advisor_hired"]
    },
    {
      "id": "send_spy_mission",
      "costPA": 1,
      "titleKey": "action.send_spy_mission.title",
      "descKey": "action.send_spy_mission.desc",
      "requirements": {"stageIn": ["king"], "minStats": {"diplomacy": 10}},
      "effects": {"stats": {"diplomacy": -2, "gold": -5}},
      "mayTrigger": ["event_mission_success", "event_mission_failure"],
      "flagsSet": ["mission_started"]
    },
    {
      "id": "hold_intrigue",
      "costPA": 1,
      "titleKey": "action.hold_intrigue.title",
      "descKey": "action.hold_intrigue.desc",
      "requirements": {"stageIn": ["king"]},
      "effects": {"stats": {"legitimacy": -2, "diplomacy": 2}},
      "mayTrigger": ["event_intrigue"],
      "flagsSet": ["intrigue_started"]
    },
    {
      "id": "launch_campaign",
      "costPA": 2,
      "titleKey": "action.launch_campaign.title",
      "descKey": "action.launch_campaign.desc",
      "requirements": {"stageIn": ["king"], "minStats": {"military": 20, "gold": 20}},
      "effects": {"stats": {"military": -5, "gold": -10}},
      "mayTrigger": ["event_campaign"],
      "flagsSet": ["campaign_started"]
    }
  ]
};

export const eventsPrince = {
  "events": [
    {
      "id": "event_prince_tutor",
      "stage": "prince",
      "priority": 90,
      "trigger": {
        "turnAtLeast": 1
      },
      "image": "assets/images/events/court.png",
      "titleKey": "event.prince.tutor.title",
      "textKey": "event.prince.tutor.text",
      "choices": [
        {
          "textKey": "event.prince.tutor.choice1",
          "effects": {"stats": {"diplomacy": 10}}
        },
        {
          "textKey": "event.prince.tutor.choice2",
          "effects": {"stats": {"military": 10}}
        }
      ]
    },
    {
      "id": "event_prince_hunt",
      "stage": "prince",
      "priority": 60,
      "trigger": {
        "random": true,
        "turnAtLeast": 2
      },
      "image": "assets/images/events/hunt.png",
      "titleKey": "event.prince.hunt.title",
      "textKey": "event.prince.hunt.text",
      "choices": [
        {
          "textKey": "event.prince.hunt.choice1",
          "effects": {"flagsSet": ["trait_just"], "stats": {"legitimacy": 5}}
        },
        {
          "textKey": "event.prince.hunt.choice2",
          "effects": {"flagsSet": ["trait_cruel"], "stats": {"military": 5}}
        }
      ]
    },
    {
      "id": "event_prince_study",
      "stage": "prince",
      "priority": 50,
      "trigger": {
        "turnAtLeast": 3
      },
      "image": "assets/images/events/market.png",
      "titleKey": "event.prince.study.title",
      "textKey": "event.prince.study.text",
      "choices": [
        {
          "textKey": "event.prince.study.choice1",
          "effects": {"stats": {"gold": 15}}
        },
        {
          "textKey": "event.prince.study.choice2",
          "effects": {"stats": {"legitimacy": 10}}
        }
      ]
    },
    {
      "id": "event_prince_dissent",
      "stage": "prince",
      "priority": 40,
      "trigger": {
        "maxStat": {"legitimacy": 40}
      },
      "image": "assets/images/events/conspiracy.png",
      "titleKey": "event.prince.dissent.title",
      "textKey": "event.prince.dissent.text",
      "choices": [
        {
          "textKey": "event.prince.dissent.choice1",
          "effects": {"stats": {"legitimacy": 5}}
        },
        {
          "textKey": "event.prince.dissent.choice2",
          "effects": {"stats": {"legitimacy": -5}}
        }
      ]
    }
  ]
};

export const eventsKing = {
  "events": [
    {
      "id": "event_succession",
      "stage": "king",
      "priority": 100,
      "trigger": {
        "flag": "succession_crisis"
      },
      "image": "assets/images/events/succession.png",
      "titleKey": "event.succession.title",
      "textKey": "event.succession.text",
      "choices": [
        {
          "textKey": "event.succession.choice1",
          "effects": {"stats": {"legitimacy": 5, "diplomacy": 2}, "flagsSet": ["heir_prepared"]}
        },
        {
          "textKey": "event.succession.choice2",
          "effects": {"stats": {"legitimacy": 3, "gold": -5}, "flagsSet": ["power_consolidated"]}
        },
        {
          "textKey": "event.succession.choice3",
          "effects": {"stats": {"legitimacy": -5}}
        }
      ]
    },
    {
      "id": "event_revolt",
      "stage": "king",
      "priority": 80,
      "trigger": {
        "any": [
          {"flag": "taxes_raised_once"},
          {"maxStat": {"legitimacy": 30}}
        ]
      },
      "image": "assets/images/events/revolt.png",
      "titleKey": "event.revolt.title",
      "textKey": "event.revolt.text",
      "choices": [
        {
          "textKey": "event.revolt.choice1",
          "effects": {"stats": {"military": -5, "legitimacy": -5}}
        },
        {
          "textKey": "event.revolt.choice2",
          "effects": {"stats": {"gold": -10, "legitimacy": 5}}
        }
      ]
    },
    {
      "id": "event_court_meeting",
      "stage": "king",
      "priority": 70,
      "trigger": {
        "flag": "law_pass_requested"
      },
      "image": "assets/images/events/court.png",
      "titleKey": "event.court_meeting.title",
      "textKey": "event.court_meeting.text",
      "choices": [
        {
          "textKey": "event.court_meeting.choice1",
          "effects": {"stats": {"legitimacy": 5, "gold": -5}}
        },
        {
          "textKey": "event.court_meeting.choice2",
          "effects": {"stats": {"legitimacy": -2, "diplomacy": 2}}
        }
      ]
    },
    {
      "id": "event_war",
      "stage": "king",
      "priority": 60,
      "trigger": {
        "any": [
          {"flag": "war_declaration"},
          {"random": true, "turnAtLeast": 5}
        ]
      },
      "image": "assets/images/events/war.png",
      "titleKey": "event.war.title",
      "textKey": "event.war.text",
      "choices": [
        {
          "textKey": "event.war.choice1",
          "effects": {"stats": {"military": -5, "legitimacy": 5}, "flagsSet": ["in_war"]}
        },
        {
          "textKey": "event.war.choice2",
          "effects": {"stats": {"diplomacy": 5, "legitimacy": -2}, "flagsSet": ["avoided_war"]}
        }
      ]
    },
    {
      "id": "event_trade",
      "stage": "king",
      "priority": 60,
      "trigger": {
        "flag": "trade_proposal"
      },
      "image": "assets/images/events/trade.png",
      "titleKey": "event.trade.title",
      "textKey": "event.trade.text",
      "choices": [
        {
          "textKey": "event.trade.choice1",
          "effects": {"stats": {"gold": 15, "diplomacy": -2}}
        },
        {
          "textKey": "event.trade.choice2",
          "effects": {"stats": {"legitimacy": 2}}
        }
      ]
    },
    {
      "id": "event_diplomacy",
      "stage": "king",
      "priority": 55,
      "trigger": {
        "flag": "alliance_offer"
      },
      "image": "assets/images/events/diplomacy.png",
      "titleKey": "event.diplomacy.title",
      "textKey": "event.diplomacy.text",
      "choices": [
        {
          "textKey": "event.diplomacy.choice1",
          "effects": {"stats": {"diplomacy": 10, "military": -5}}
        },
        {
          "textKey": "event.diplomacy.choice2",
          "effects": {"stats": {"legitimacy": -3}}
        }
      ]
    },
    {
      "id": "event_tax",
      "stage": "king",
      "priority": 50,
      "trigger": {
        "random": true,
        "turnAtLeast": 6
      },
      "image": "assets/images/events/tax.png",
      "titleKey": "event.tax.title",
      "textKey": "event.tax.text",
      "choices": [
        {
          "textKey": "event.tax.choice1",
          "effects": {"stats": {"gold": 20, "legitimacy": -5}}
        },
        {
          "textKey": "event.tax.choice2",
          "effects": {"stats": {"legitimacy": 5, "gold": -15}}
        }
      ]
    },
    {
      "id": "event_market",
      "stage": "king",
      "priority": 45,
      "trigger": {
        "flag": "trade_route_signed"
      },
      "image": "assets/images/events/market.png",
      "titleKey": "event.market.title",
      "textKey": "event.market.text",
      "choices": [
        {
          "textKey": "event.market.choice1",
          "effects": {"stats": {"gold": 10, "diplomacy": -3}}
        },
        {
          "textKey": "event.market.choice2",
          "effects": {"stats": {"diplomacy": 5, "gold": 5}}
        }
      ]
    },
    {
      "id": "event_conspiracy",
      "stage": "king",
      "priority": 50,
      "trigger": {
        "flag": "noble_spy"
      },
      "image": "assets/images/events/conspiracy.png",
      "titleKey": "event.conspiracy.title",
      "textKey": "event.conspiracy.text",
      "choices": [
        {
          "textKey": "event.conspiracy.choice1",
          "effects": {"stats": {"legitimacy": -2, "diplomacy": -5, "military": 2}}
        },
        {
          "textKey": "event.conspiracy.choice2",
          "effects": {"stats": {"gold": 10, "legitimacy": -5}, "flagsSet": ["blackmail_used"]}
        }
      ]
    },
    {
      "id": "event_tournament",
      "stage": "king",
      "priority": 40,
      "trigger": {
        "flag": "tournament_hosted"
      },
      "image": "assets/images/events/court.png",
      "titleKey": "event.tournament.title",
      "textKey": "event.tournament.text",
      "choices": [
        {
          "textKey": "event.tournament.choice1",
          "effects": {"stats": {"gold": -15, "legitimacy": 8, "military": 3}}
        },
        {
          "textKey": "event.tournament.choice2",
          "effects": {"stats": {}}
        }
      ]
    }
    ,
    // Part 6 events – Advisors, Intrigues and Missions
    {
      "id": "event_advisor_suggest",
      "stage": "king",
      "priority": 35,
      "trigger": {
        "flag": "advisor_hired"
      },
      "image": "assets/images/events/court.png",
      "titleKey": "event.advisor_suggest.title",
      "textKey": "event.advisor_suggest.text",
      "choices": [
        {
          "textKey": "event.advisor_suggest.choice1",
          "effects": {"stats": {"diplomacy": 5}, "flagsSet": ["mission_started"]}
        },
        {
          "textKey": "event.advisor_suggest.choice2",
          "effects": {"stats": {"diplomacy": -2}}
        }
      ]
    },
    {
      "id": "event_mission_success",
      "stage": "king",
      "priority": 30,
      "trigger": {
        "all": [
          {"flag": "mission_started"},
          {"random": true}
        ]
      },
      "image": "assets/images/events/trade.png",
      "titleKey": "event.mission_success.title",
      "textKey": "event.mission_success.text",
      "choices": [
        {
          "textKey": "event.mission_success.choice1",
          "effects": {"stats": {"gold": 20, "legitimacy": 5}}
        },
        {
          "textKey": "event.mission_success.choice2",
          "effects": {"stats": {"legitimacy": 3, "diplomacy": 2}}
        }
      ]
    },
    {
      "id": "event_mission_failure",
      "stage": "king",
      "priority": 29,
      "trigger": {
        "all": [
          {"flag": "mission_started"},
          {"random": true}
        ]
      },
      "image": "assets/images/events/conspiracy.png",
      "titleKey": "event.mission_failure.title",
      "textKey": "event.mission_failure.text",
      "choices": [
        {
          "textKey": "event.mission_failure.choice1",
          "effects": {"stats": {"legitimacy": -5, "diplomacy": -2}, "flagsSet": ["advisor_fired"]}
        },
        {
          "textKey": "event.mission_failure.choice2",
          "effects": {"stats": {"gold": -15, "diplomacy": -5}}
        }
      ]
    },
    {
      "id": "event_intrigue",
      "stage": "king",
      "priority": 28,
      "trigger": {
        "flag": "intrigue_started"
      },
      "image": "assets/images/events/conspiracy.png",
      "titleKey": "event.intrigue.title",
      "textKey": "event.intrigue.text",
      "choices": [
        {
          "textKey": "event.intrigue.choice1",
          "effects": {"stats": {"legitimacy": 5, "gold": -10}}
        },
        {
          "textKey": "event.intrigue.choice2",
          "effects": {"stats": {"legitimacy": -5}}
        }
      ]
    },
    {
      "id": "event_campaign",
      "stage": "king",
      "priority": 27,
      "trigger": {
        "flag": "campaign_started"
      },
      "image": "assets/images/events/war.png",
      "titleKey": "event.campaign.title",
      "textKey": "event.campaign.text",
      "choices": [
        {
          "textKey": "event.campaign.choice1",
          "effects": {"stats": {"military": 10, "gold": -5, "diplomacy": -3}}
        },
        {
          "textKey": "event.campaign.choice2",
          "effects": {"stats": {"diplomacy": 3}}
        }
      ]
    }
  ]
};

export const arcs = /* arcs/arc_kingdom_rise.json */
{
  "id": "arc_kingdom_rise",
  "milestones": [
    {
      "id": "succession_crisis",
      "unlock": {"turnAtLeast": 4, "stageIn": ["king"]},
      "onStartQueueEvents": ["event_succession"],
      "flagsSet": ["succession_crisis"]
    }
  ]
};

export const endings = /* endings.json */
{
  "victory": [
    {
      "id": "victory_diplomatic",
      "requirements": {"turnAtLeast": 120, "stageIn": ["king"], "minStats": {"diplomacy": 200}},
      "titleKey": "ending.victory_diplomatic.title",
      "textKey": "ending.victory_diplomatic.text",
      "image": "assets/images/endings/victory.png"
    },
    {
      "id": "victory_military",
      "requirements": {"turnAtLeast": 120, "stageIn": ["king"], "minStats": {"military": 200}},
      "titleKey": "ending.victory_military.title",
      "textKey": "ending.victory_military.text",
      "image": "assets/images/endings/victory.png"
    },
    {
      "id": "victory_economic",
      "requirements": {"turnAtLeast": 120, "stageIn": ["king"], "minStats": {"gold": 650}},
      "titleKey": "ending.victory_economic.title",
      "textKey": "ending.victory_economic.text",
      "image": "assets/images/endings/victory.png"
    }
  ],
  "gameover": [
    {
      "id": "overthrow",
      "requirements": {"maxStats": {"legitimacy": 0}},
      "titleKey": "ending.overthrow.title",
      "textKey": "ending.overthrow.text",
      "image": "assets/images/endings/defeat.png"
    },
    {
      "id": "bankrupt",
      "requirements": {"maxStats": {"gold": -50}},
      "titleKey": "ending.bankrupt.title",
      "textKey": "ending.bankrupt.text",
      "image": "assets/images/endings/defeat.png"
    },
    {
      "id": "war_loss",
      "requirements": {"maxStats": {"military": 0}},
      "titleKey": "ending.war_loss.title",
      "textKey": "ending.war_loss.text",
      "image": "assets/images/endings/defeat.png"
    }
  ]
};