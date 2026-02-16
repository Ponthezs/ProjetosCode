import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('datailer_token') && localStorage.getItem('datailer_tipo') === 'lavacar') {
    window.location.href = 'lavacar-painel.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById('loginErro');
    erroEl.style.display = 'none';
    try {
      const data = await api('/auth/lavacar/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('email').value.trim(),
          senha: document.getElementById('senha').value,
        }),
      });
      localStorage.setItem('datailer_token', data.token);
      localStorage.setItem('datailer_tipo', 'lavacar');
      localStorage.setItem('datailer_user', JSON.stringify(data.lavacar));
      window.location.href = 'lavacar-painel.html';
    } catch (err) {
      erroEl.textContent = err.message || 'Erro ao fazer login';
      erroEl.style.display = 'block';
    }
  });
});
