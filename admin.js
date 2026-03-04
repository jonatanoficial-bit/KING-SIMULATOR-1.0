/*
 * admin.js
 *
 * Script responsável pela área administrativa do Medieval Kingdoms.
 * Permite login simples, instalação/remoção de DLCs e upload de novas
 * expansões em formato JSON. Todos os dados são armazenados em
 * localStorage para facilitar futuras integrações com back‑end.
 */

(function () {
  'use strict';
  const loginScreen = document.getElementById('login-screen');
  const panelScreen = document.getElementById('panel-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');
  const dlcListEl = document.getElementById('dlc-list');
  const dlcForm = document.getElementById('dlc-form');
  const dlcMessage = document.getElementById('dlc-message');

  // Inicializar credenciais padrão se não existirem
  if (!localStorage.getItem('adminUser')) {
    localStorage.setItem('adminUser', 'admin');
  }
  if (!localStorage.getItem('adminPass')) {
    localStorage.setItem('adminPass', 'admin123');
  }

  /**
   * Autentica o usuário com base nos valores de localStorage.
   */
  function authenticate(username, password) {
    const storedUser = localStorage.getItem('adminUser');
    const storedPass = localStorage.getItem('adminPass');
    return username === storedUser && password === storedPass;
  }

  /**
   * Alterna a instalação de uma DLC. Atualiza a lista em localStorage.
   * @param {string} name Nome da DLC
   */
  function toggleInstall(name) {
    let installed = JSON.parse(localStorage.getItem('installedDLCs') || '[]');
    if (installed.includes(name)) {
      installed = installed.filter((n) => n !== name);
    } else {
      installed.push(name);
    }
    localStorage.setItem('installedDLCs', JSON.stringify(installed));
    loadDlcList();
  }

  /**
   * Carrega e exibe a lista de DLCs disponíveis, marcando quais estão instaladas.
   */
  async function loadDlcList() {
    dlcListEl.innerHTML = '';
    // Manifesto embutido para evitar dependência de fetch
    const MANIFEST = [
      {
        name: 'Rota Mercante',
        description: 'Adiciona eventos focados em rotas comerciais e riqueza.',
      },
    ];
    // DLCs instaladas e personalizadas
    const installed = JSON.parse(localStorage.getItem('installedDLCs') || '[]');
    const custom = JSON.parse(localStorage.getItem('customDLCs') || '[]');
    // Mesclar lista oficial com personalizadas
    const allDlc = MANIFEST.map((d) => ({
      name: d.name,
      description: d.description,
      isCustom: false,
    }));
    custom.forEach((name) => {
      allDlc.push({ name, description: 'Expansão personalizada', isCustom: true });
    });
    if (allDlc.length === 0) {
      dlcListEl.textContent = 'Nenhuma DLC disponível.';
      return;
    }
    allDlc.forEach((dlc) => {
      const item = document.createElement('div');
      item.className = 'dlc-item';
      const info = document.createElement('span');
      info.textContent = dlc.name + ' – ' + dlc.description;
      const button = document.createElement('button');
      if (installed.includes(dlc.name)) {
        button.textContent = 'Remover';
      } else {
        button.textContent = 'Instalar';
      }
      button.addEventListener('click', () => toggleInstall(dlc.name));
      item.appendChild(info);
      item.appendChild(button);
      dlcListEl.appendChild(item);
    });
  }

  /**
   * Processa o upload de uma nova DLC customizada. Salva o conteúdo em
   * localStorage com o prefixo dlc_custom_ e registra o nome nas listas de
   * DLCs instaladas e personalizadas.
   */
  function handleDlcUpload(evt) {
    evt.preventDefault();
    const nameInput = document.getElementById('dlc-name');
    const fileInput = document.getElementById('dlc-file');
    const name = nameInput.value.trim();
    const file = fileInput.files[0];
    if (!name || !file) {
      dlcMessage.textContent = 'Preencha o nome e selecione o arquivo.';
      dlcMessage.className = 'error-message';
      dlcMessage.classList.remove('hidden');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const content = JSON.parse(e.target.result);
        // Armazenar conteúdo como string
        localStorage.setItem(`dlc_custom_${name}`, JSON.stringify(content));
        // Registrar nome na lista de customDLCs
        let custom = JSON.parse(localStorage.getItem('customDLCs') || '[]');
        if (!custom.includes(name)) {
          custom.push(name);
          localStorage.setItem('customDLCs', JSON.stringify(custom));
        }
        // Instalar automaticamente
        let installed = JSON.parse(localStorage.getItem('installedDLCs') || '[]');
        if (!installed.includes(name)) {
          installed.push(name);
          localStorage.setItem('installedDLCs', JSON.stringify(installed));
        }
        dlcMessage.textContent = 'DLC adicionada com sucesso!';
        dlcMessage.className = 'success-message';
        dlcMessage.classList.remove('hidden');
        // Limpar formulário
        dlcForm.reset();
        // Atualizar lista
        loadDlcList();
      } catch (err) {
        console.error('Erro ao ler DLC', err);
        dlcMessage.textContent = 'Falha ao analisar o arquivo JSON.';
        dlcMessage.className = 'error-message';
        dlcMessage.classList.remove('hidden');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Exibe o painel após login bem-sucedido.
   */
  function showPanel() {
    loginScreen.classList.add('hidden');
    panelScreen.classList.remove('hidden');
    loadDlcList();
  }

  // Evento de clique no botão de login
  loginBtn.addEventListener('click', () => {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    if (authenticate(username, password)) {
      loginError.classList.add('hidden');
      showPanel();
    } else {
      loginError.classList.remove('hidden');
    }
  });

  // Evento de submit do formulário de upload de DLC
  dlcForm.addEventListener('submit', handleDlcUpload);
})();