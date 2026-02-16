import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erroEl = document.getElementById('registroErro');
    erroEl.style.display = 'none';
    try {
      const data = await api('/auth/lavacar/registro', {
        method: 'POST',
        body: JSON.stringify({
          nome: document.getElementById('nome').value.trim(),
          email: document.getElementById('email').value.trim(),
          telefone: document.getElementById('telefone').value.trim() || undefined,
          endereco: document.getElementById('endereco').value.trim(),
          cidade: document.getElementById('cidade').value.trim(),
          estado: document.getElementById('estado').value.trim().toUpperCase().slice(0, 2),
          cep: document.getElementById('cep').value.trim() || undefined,
          senha: document.getElementById('senha').value,
        }),
      });
      localStorage.setItem('datailer_token', data.token);
      localStorage.setItem('datailer_tipo', 'lavacar');
      localStorage.setItem('datailer_user', JSON.stringify(data.lavacar));
      window.location.href = 'lavacar-painel.html';
    } catch (err) {
      erroEl.textContent = err.message || 'Erro ao cadastrar';
      erroEl.style.display = 'block';
    }
  });
});
