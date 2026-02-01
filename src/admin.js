const adminApp = document.getElementById('admin-app');

function renderLogin() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = 'Admin Login';
  card.appendChild(title);
  const userLabel = document.createElement('label');
  userLabel.textContent = 'Username:';
  const userInput = document.createElement('input');
  userInput.type = 'text';
  userInput.style.width = '100%';
  const passLabel = document.createElement('label');
  passLabel.textContent = 'Password:';
  const passInput = document.createElement('input');
  passInput.type = 'password';
  passInput.style.width = '100%';
  const message = document.createElement('p');
  message.style.color = 'salmon';
  const btn = document.createElement('div');
  btn.className = 'button';
  btn.textContent = 'Login';
  btn.onclick = () => {
    if (userInput.value === 'admin' && passInput.value === 'admin123') {
      renderPanel();
    } else {
      message.textContent = 'Invalid credentials';
    }
  };
  card.appendChild(userLabel);
  card.appendChild(userInput);
  card.appendChild(passLabel);
  card.appendChild(passInput);
  card.appendChild(btn);
  card.appendChild(message);
  adminApp.innerHTML = '';
  adminApp.appendChild(card);
}

function renderPanel() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = 'Admin Panel';
  card.appendChild(title);
  const textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.height = '200px';
  textarea.value = localStorage.getItem('mk_overrides') || '';
  card.appendChild(textarea);
  const exportBtn = document.createElement('div');
  exportBtn.className = 'button';
  exportBtn.textContent = 'Export';
  exportBtn.onclick = () => {
    const dataStr = textarea.value;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mk_overrides.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const importBtn = document.createElement('div');
  importBtn.className = 'button';
  importBtn.textContent = 'Save';
  importBtn.onclick = () => {
    try {
      const json = JSON.parse(textarea.value || '{}');
      localStorage.setItem('mk_overrides', JSON.stringify(json));
      alert('Overrides saved');
    } catch (e) {
      alert('Invalid JSON');
    }
  };
  card.appendChild(exportBtn);
  card.appendChild(importBtn);
  adminApp.innerHTML = '';
  adminApp.appendChild(card);
}

renderLogin();