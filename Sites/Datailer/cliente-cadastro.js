import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById('cadastroErro');
    erroEl.style.display = 'none';
    try {
      const data = await api('/auth/cliente/registro', {
        method: 'POST',
        body: JSON.stringify({
          nome: document.getElementById('nome').value.trim(),
          email: document.getElementById('email').value.trim(),
          telefone: document.getElementById('telefone').value.trim(),
          cidade: document.getElementById('cidade').value.trim() || undefined,
          senha: document.getElementById('senha').value,
        }),
      });
      localStorage.setItem('datailer_token', data.token);
      localStorage.setItem('datailer_tipo', 'cliente');
      localStorage.setItem('datailer_user', JSON.stringify(data.cliente));
      window.location.href = 'cliente-dashboard.html';
    } catch (err) {
      erroEl.textContent = err.message || 'Erro ao cadastrar';
      erroEl.style.display = 'block';
    }
  });
});
