import { api, logout } from './api.js';

function formatarMoeda(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function toast(msg, tipo = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('datailer_token') || localStorage.getItem('datailer_tipo') !== 'lavacar') {
    window.location.href = 'lavacar-login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('datailer_user') || '{}');
  document.getElementById('nomeEstabelecimento').textContent = user.nome || 'Painel';

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });

  async function carregar() {
    try {
      const me = await api('/lavacar-admin/me');
      document.getElementById('nomeEstabelecimento').textContent = me.nome || 'Painel';
      document.getElementById('nome').value = me.nome || '';
      document.getElementById('telefone').value = me.telefone || '';
      document.getElementById('endereco').value = me.endereco || '';
      document.getElementById('cidade').value = me.cidade || '';
      document.getElementById('estado').value = me.estado || '';
      document.getElementById('cep').value = me.cep || '';
      document.getElementById('taxaCancelamento').value = me.taxaCancelamento ?? 0;
      renderServicos(me.servicos || []);
    } catch (err) {
      window.location.href = 'lavacar-login.html';
    }
  }

  function renderServicos(list) {
    const container = document.getElementById('listaServicos');
    container.innerHTML = list.length
      ? list.map(s => `
          <div class="servico-item-card">
            <div>
              <strong>${s.nome}</strong>
              <p>${formatarMoeda(s.preco)} • ${s.duracao || 60} min</p>
            </div>
            <button class="btn btn-ghost btn-sm btn-del-srv" data-id="${s.id}">Excluir</button>
          </div>
        `).join('')
      : '<p class="empty-state">Nenhum serviço. Adicione acima.</p>';
    container.querySelectorAll('.btn-del-srv').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Excluir este serviço?')) return;
        try {
          await api(`/servicos/${btn.dataset.id}`, { method: 'DELETE' });
          toast('Serviço removido.');
          carregar();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    });
  }

  document.getElementById('formDados').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/lavacar-admin/me', {
        method: 'PUT',
        body: JSON.stringify({
          nome: document.getElementById('nome').value.trim(),
          telefone: document.getElementById('telefone').value.trim(),
          endereco: document.getElementById('endereco').value.trim(),
          cidade: document.getElementById('cidade').value.trim(),
          estado: document.getElementById('estado').value.trim().toUpperCase().slice(0, 2),
          cep: document.getElementById('cep').value.trim(),
          taxaCancelamento: parseFloat(document.getElementById('taxaCancelamento').value) || 0,
        }),
      });
      toast('Dados salvos.');
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('formNovoServico').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('srvNome').value.trim();
    const preco = parseFloat(document.getElementById('srvPreco').value);
    const duracao = parseInt(document.getElementById('srvDuracao').value, 10) || 60;
    if (!nome || isNaN(preco) || preco < 0) {
      toast('Preencha nome e preço.', 'error');
      return;
    }
    try {
      const me = await api('/lavacar-admin/me');
      await api('/servicos', {
        method: 'POST',
        body: JSON.stringify({
          lavaCarId: me.id,
          nome,
          preco,
          duracao,
        }),
      });
      toast('Serviço adicionado.');
      document.getElementById('srvNome').value = '';
      document.getElementById('srvPreco').value = '';
      document.getElementById('srvDuracao').value = 60;
      carregar();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  carregar();
});
