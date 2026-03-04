/*
 * script.js
 *
 * Contém a lógica principal do jogo Medieval Kingdoms.
 * O jogo carrega eventos a partir de arquivos JSON (core e DLCs),
 * exibe texto e opções ao usuário e atualiza as estatísticas do
 * personagem conforme as escolhas. Todo o estado é mantido em memória e
 * salvo apenas para DLCs instaladas via localStorage.
 */

(function () {
  'use strict';

  /**
   * Estado global do jogo. Mantém a nação, fase (prince/king), estatísticas,
   * eventos carregados e uma fila de eventos de expansões.
   */
  const state = {
    nation: null,
    stage: 'prince',
    stats: {
      legitimacy: 50,
      gold: 100,
      military: 50,
      diplomacy: 50,
    },
    events: {},
    currentEventId: null,
    expansionQueue: [],
  };

  // Elementos do DOM
  const selectionScreen = document.getElementById('selection-screen');
  const storyScreen = document.getElementById('story-screen');
  const statsBar = document.getElementById('stats-bar');
  const eventTextEl = document.getElementById('event-text');
  const choicesEl = document.getElementById('choices');

  /**
   * Atualiza a exibição das estatísticas no topo da página.
   */
  function updateStatsDisplay() {
    document.getElementById('stat-legitimacy').textContent = state.stats.legitimacy;
    document.getElementById('stat-gold').textContent = state.stats.gold;
    document.getElementById('stat-military').textContent = state.stats.military;
    document.getElementById('stat-diplomacy').textContent = state.stats.diplomacy;
  }

  /**
   * Eventos principais embutidos no script. Isso elimina a necessidade de
   * carregar arquivos via fetch em contextos file://, garantindo que o jogo
   * funcione localmente. Caso deseje adicionar novos eventos, edite este
   * objeto ou crie DLCs via área administrativa.
   */
  const BASE_EVENTS = [
    {
      id: 'start_prince',
      stage: 'prince',
      text:
        'Você é o jovem príncipe de [nation]. Seu pai, o rei, está envelhecendo e você precisa se preparar para o trono. O que deseja focar primeiro?',
      choices: [
        {
          text: 'Fortalecer relações diplomáticas',
          effects: { diplomacy: 10 },
          next: 'diplomacy_training',
        },
        {
          text: 'Melhorar força militar',
          effects: { military: 10 },
          next: 'military_training',
        },
        {
          text: 'Aumentar riqueza por comércio',
          effects: { gold: 15 },
          next: 'trade_training',
        },
      ],
    },
    {
      id: 'diplomacy_training',
      stage: 'prince',
      text:
        'Você passa meses viajando entre cortes estrangeiras, aprendendo com conselheiros e negociando tratados.',
      choices: [
        {
          text: 'Continuar viagem',
          effects: { diplomacy: 5 },
          next: 'father_ill',
        },
        {
          text: 'Voltar para casa',
          effects: {},
          next: 'father_ill',
        },
      ],
    },
    {
      id: 'military_training',
      stage: 'prince',
      text:
        'Você treina com os melhores comandantes do reino, aperfeiçoando táticas e estratégias de batalha.',
      choices: [
        {
          text: 'Participar de torneios',
          effects: { military: 5 },
          next: 'father_ill',
        },
        {
          text: 'Treinar tropas locais',
          effects: {},
          next: 'father_ill',
        },
      ],
    },
    {
      id: 'trade_training',
      stage: 'prince',
      text:
        'Você investe tempo nas finanças do reino, aprendendo com mercadores e construindo novas rotas comerciais.',
      choices: [
        {
          text: 'Abrir novas rotas',
          effects: { gold: 10 },
          next: 'father_ill',
        },
        {
          text: 'Cobrar impostos',
          effects: { gold: 5, legitimacy: -5 },
          next: 'father_ill',
        },
      ],
    },
    {
      id: 'father_ill',
      stage: 'prince',
      text:
        'Seu pai adoece gravemente. Os conselheiros aguardam suas decisões: você pode tentar curá-lo com remédios caros ou preparar-se para o trono.',
      choices: [
        {
          text: 'Investir em cura',
          effects: { gold: -20 },
          next: 'war_threat',
        },
        {
          text: 'Preparar-se para reinar',
          effects: { legitimacy: 10 },
          next: 'war_threat',
        },
      ],
    },
    {
      id: 'war_threat',
      stage: 'prince',
      text:
        'Uma nação vizinha ameaça invadir. Seu pai está incapaz. Você decide...',
      choices: [
        {
          text: 'Solicitar ajuda diplomática',
          effects: { diplomacy: -5, military: 5 },
          next: 'ascension',
        },
        {
          text: 'Pagar mercenários',
          effects: { gold: -30, military: 10 },
          next: 'ascension',
        },
      ],
    },
    {
      id: 'ascension',
      stage: 'king',
      text:
        'Seu pai falece. Você é coroado rei de [nation]. Agora, todas as decisões são suas.',
      choices: [
        {
          text: 'Começar reinado',
          effects: { legitimacy: 20 },
          next: 'king_start',
        },
      ],
    },
    {
      id: 'king_start',
      stage: 'king',
      text:
        'Como rei, você deve equilibrar diplomacia, guerra e economia. Um vizinho oferece aliança comercial.',
      choices: [
        {
          text: 'Aceitar aliança',
          effects: { gold: 20, diplomacy: 10 },
          next: 'king_event2',
        },
        {
          text: 'Recusar aliança',
          effects: { diplomacy: -10, military: 10 },
          next: 'king_event2',
        },
      ],
    },
    {
      id: 'king_event2',
      stage: 'king',
      text: 'Uma rebelião interna ameaça seu trono. O que você faz?',
      choices: [
        {
          text: 'Negociar com rebeldes',
          effects: { diplomacy: 10, legitimacy: 5 },
          next: 'end_game',
        },
        {
          text: 'Suprimir com força',
          effects: { military: -10, legitimacy: -5 },
          next: 'end_game',
        },
      ],
    },
    {
      id: 'end_game',
      stage: 'king',
      text:
        'Após anos de reinado, as decisões moldaram seu reino. Obrigado por jogar!',
      choices: [],
    },
  ];

  /**
   * Manifesto embutido das DLCs. Cada entrada contém os eventos da
   * expansão, evitando carregamento via rede. A propriedade `events`
   * abriga um array de objetos compatíveis com a estrutura de eventos do jogo.
   */
  const MANIFEST = [
    {
      name: 'Rota Mercante',
      description: 'Adiciona eventos focados em rotas comerciais e riqueza.',
      version: '1.0.0',
      events: [
        {
          id: 'trade_1',
          stage: 'king',
          text:
            'Os mercadores sugerem criar uma rota marítima arriscada mas lucrativa para o Oriente.',
          choices: [
            {
              text: 'Investir na rota',
              effects: { gold: 30, diplomacy: 5 },
              next: 'trade_2',
            },
            {
              text: 'Recusar a proposta',
              effects: { diplomacy: -5 },
              next: 'trade_2',
            },
          ],
        },
        {
          id: 'trade_2',
          stage: 'king',
          text:
            'A rota marítima enfrenta piratas. Você precisa decidir como proteger seus navios.',
          choices: [
            {
              text: 'Contratar escoltas militares',
              effects: { gold: -10, military: -5 },
              next: 'trade_end',
            },
            {
              text: 'Negociar com os piratas',
              effects: { gold: -5, diplomacy: -5 },
              next: 'trade_end',
            },
          ],
        },
        {
          id: 'trade_end',
          stage: 'king',
          text:
            'A rota comercial rende grandes lucros e fortalece suas relações comerciais. Os mercadores estão satisfeitos.',
          choices: [],
        },
      ],
    },
  ];

  /**
   * Carrega eventos base e DLCs instaladas. Preenche o estado global
   * com todos os eventos disponíveis. Com as constantes embutidas,
   * evitamos a necessidade de fetch.
   */
  async function loadEvents() {
    // Carregar eventos principais
    BASE_EVENTS.forEach((e) => {
      state.events[e.id] = e;
    });
    // Verificar DLCs instaladas no localStorage
    const installed = JSON.parse(localStorage.getItem('installedDLCs') || '[]');
    for (const dlcName of installed) {
      // Verifica se o nome existe no manifesto embutido
      const dlcDef = MANIFEST.find((item) => item.name === dlcName);
      if (dlcDef) {
        dlcDef.events.forEach((e) => {
          state.events[e.id] = e;
        });
        if (dlcDef.events.length > 0) {
          state.expansionQueue.push(dlcDef.events[0].id);
        }
      } else {
        // DLC personalizada salva no localStorage
        const raw = localStorage.getItem(`dlc_custom_${dlcName}`);
        if (raw) {
          try {
            const customEvents = JSON.parse(raw);
            customEvents.forEach((e) => {
              state.events[e.id] = e;
            });
            if (customEvents.length > 0) {
              state.expansionQueue.push(customEvents[0].id);
            }
          } catch (err) {
            console.error('Falha ao analisar DLC personalizada', dlcName, err);
          }
        }
      }
    }
  }

  /**
   * Mostra um evento específico, atualizando texto e opções.
   * @param {string} eventId
   */
  function showEvent(eventId) {
    const event = state.events[eventId];
    if (!event) {
      // Evento não encontrado. Finaliza jogo.
      eventTextEl.textContent = 'Fim da história. Obrigado por jogar!';
      choicesEl.innerHTML = '';
      return;
    }
    // Atualizar estágio
    state.stage = event.stage || state.stage;
    state.currentEventId = eventId;
    // Substituir [nation] no texto
    const text = event.text.replace(/\[nation\]/g, state.nation);
    eventTextEl.textContent = text;
    // Criar botões de escolha
    choicesEl.innerHTML = '';
    if (!event.choices || event.choices.length === 0) {
      // Se não houver escolhas, verificar se há expansões pendentes
      if (state.expansionQueue.length > 0) {
        const nextDlcEvent = state.expansionQueue.shift();
        showEvent(nextDlcEvent);
      } else {
        eventTextEl.textContent += '\n\n(Fim do jogo)';
      }
      return;
    }
    event.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => handleChoice(choice));
      choicesEl.appendChild(btn);
    });
  }

  /**
   * Lida com a escolha do jogador, atualizando estatísticas e avançando para o próximo evento.
   * @param {Object} choice
   */
  function handleChoice(choice) {
    // Atualizar estatísticas de acordo com os efeitos
    if (choice.effects) {
      for (const key of Object.keys(choice.effects)) {
        const delta = choice.effects[key];
        // Garantir que o valor exista
        if (state.stats[key] !== undefined) {
          state.stats[key] += delta;
          // Impedir valores negativos
          if (state.stats[key] < 0) state.stats[key] = 0;
        }
      }
      updateStatsDisplay();
    }
    const nextId = choice.next;
    if (nextId) {
      showEvent(nextId);
    } else {
      // Se não houver próximo, finalizar
      eventTextEl.textContent = 'Fim do jogo. Obrigado por jogar!';
      choicesEl.innerHTML = '';
    }
  }

  /**
   * Inicia o jogo com a nação escolhida.
   * @param {string} nation
   */
  function startGame(nation) {
    state.nation = nation;
    state.stage = 'prince';
    // Reiniciar estatísticas
    state.stats = {
      legitimacy: 50,
      gold: 100,
      military: 50,
      diplomacy: 50,
    };
    updateStatsDisplay();
    statsBar.classList.remove('hidden');
    selectionScreen.classList.add('hidden');
    storyScreen.classList.remove('hidden');
    // Começar pelo evento inicial
    showEvent('start_prince');
  }

  /**
   * Configura os manipuladores de interface e carrega conteúdos.
   */
  async function init() {
    await loadEvents();
    // Adicionar listener a cada botão de nação
    document.querySelectorAll('.nation-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nation = btn.getAttribute('data-nation');
        startGame(nation);
      });
    });
  }

  // Iniciar o jogo quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', init);
})();