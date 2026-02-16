import { api, logout } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('datailer_token') && localStorage.getItem('datailer_tipo') === 'cliente') {
    window.location.href = 'cliente-dashboard.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const erroEl = document.getElementById('loginErro');
    erroEl.style.display = 'none';
    try {
      const data = await api('/auth/cliente/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      localStorage.setItem('datailer_token', data.token);
      localStorage.setItem('datailer_tipo', 'cliente');
      localStorage.setItem('datailer_user', JSON.stringify(data.cliente));
      window.location.href = 'cliente-dashboard.html';
    } catch (err) {
      erroEl.textContent = err.message || 'Erro ao fazer login';
      erroEl.style.display = 'block';
    }
  });
});
