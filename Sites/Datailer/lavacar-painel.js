import { api, logout } from './api.js';

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
      const list = await api(`/agendamentos/lavacar/${me.id}`);
      const tbody = document.getElementById('tbodyAgendamentos');
      const empty = document.getElementById('emptyAgendamentos');
      tbody.innerHTML = '';
      if (!list || list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';
      list.sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio));
      list.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatarData(a.data)}</td>
          <td>${a.horaInicio}</td>
          <td>${a.cliente?.nome || '-'}<br><small>${a.cliente?.telefone || ''}</small></td>
          <td>${a.servico?.nome || '-'}</td>
          <td>${formatarMoeda(a.valor)}</td>
          <td><span class="badge badge-${a.status}">${a.status}</span></td>
          <td>
            ${a.status === 'confirmado' ? `
              <button class="btn btn-ghost btn-sm btn-concluir" data-id="${a.id}">Concluir</button>
              <button class="btn btn-ghost btn-sm btn-cancelar" data-id="${a.id}">Cancelar</button>
            ` : '-'}
          </td>
        `;
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('.btn-concluir').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await api(`/agendamentos/${btn.dataset.id}/concluir`, { method: 'PATCH' });
            toast('Agendamento concluído.');
            carregar();
          } catch (err) {
            toast(err.message, 'error');
          }
        });
      });
      tbody.querySelectorAll('.btn-cancelar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Cancelar este agendamento?')) return;
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
      window.location.href = 'lavacar-login.html';
    }
  }

  carregar();
});
