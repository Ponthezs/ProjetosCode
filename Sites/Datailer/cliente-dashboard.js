import { api, getToken, logout } from './api.js';

function formatarData(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR');
}

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
  if (!getToken() || localStorage.getItem('datailer_tipo') !== 'cliente') {
    window.location.href = 'cliente-login.html';
    return;
  }

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });

  async function carregar() {
    try {
      const list = await api('/agendamentos');
      const container = document.getElementById('listaAgendamentos');
      const empty = document.getElementById('emptyAgendamentos');
      if (!list || list.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';
      container.innerHTML = list.map(a => `
        <div class="card agendamento-card">
          <div class="ag-header">
            <span class="badge badge-${a.status}">${a.status}</span>
            <span>${formatarData(a.data)} às ${a.horaInicio}</span>
          </div>
          <p><strong>${a.servico?.nome || '-'}</strong> - ${formatarMoeda(a.valor)}</p>
          <p>${a.lavaCar?.nome || '-'} - ${a.lavaCar?.endereco || ''}</p>
          ${a.status === 'confirmado' ? `
            <button type="button" class="btn btn-ghost btn-sm btn-cancelar" data-id="${a.id}">Cancelar</button>
          ` : ''}
        </div>
      `).join('');
      container.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Deseja cancelar este agendamento? Lembre-se: cancelamentos com menos de 24h podem gerar taxa.')) return;
          try {
            await api(`/agendamentos/${btn.dataset.id}/cancelar`, { method: 'PATCH' });
            toast('Agendamento cancelado.');
            carregar();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });
    } catch (err) {
      document.getElementById('emptyAgendamentos').style.display = 'block';
      document.getElementById('listaAgendamentos').innerHTML = '';
    }
  }

  carregar();
});
