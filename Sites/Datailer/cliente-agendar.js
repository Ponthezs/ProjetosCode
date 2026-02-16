import { api, getToken } from './api.js';

let lavacarSelecionado = null;
let servicoSelecionado = null;
let dataSelecionada = null;
let horaSelecionada = null;

function toast(msg, tipo = 'success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function formatarMoeda(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatarData(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR');
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getToken() || localStorage.getItem('datailer_tipo') !== 'cliente') {
    window.location.href = 'cliente-login.html';
    return;
  }

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('datailer_token');
    localStorage.removeItem('datailer_tipo');
    localStorage.removeItem('datailer_user');
    window.location.href = 'index.html';
  });

  const steps = document.querySelectorAll('.step');
  function showStep(n) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === n - 1);
    });
  }

  document.getElementById('btnBuscarLavacar').addEventListener('click', async () => {
    const cidade = document.getElementById('filtroCidade').value.trim();
    try {
      const list = await api(`/lavacars${cidade ? '?cidade=' + encodeURIComponent(cidade) : ''}`);
      const container = document.getElementById('listaLavacars');
      container.innerHTML = list.length
        ? list.map(l => `
            <div class="lavacar-item card" data-id="${l.id}">
              <strong>${l.nome}</strong>
              <p>${l.endereco}, ${l.cidade} - ${l.estado}</p>
              <p>Serviços: ${l.servicos?.length || 0}</p>
            </div>
          `).join('')
        : '<p class="empty-state">Nenhum lava-car encontrado.</p>';
      container.querySelectorAll('.lavacar-item').forEach(el => {
        el.addEventListener('click', () => {
          lavacarSelecionado = list.find(l => l.id === el.dataset.id);
          document.getElementById('listaServicos').innerHTML = (lavacarSelecionado.servicos || [])
            .map(s => `
              <div class="servico-item card" data-id="${s.id}" data-preco="${s.preco}" data-duracao="${s.duracao}" data-nome="${(s.nome || '').replace(/"/g, '&quot;')}">
                <strong>${s.nome}</strong>
                <p>${formatarMoeda(s.preco)} • ${s.duracao || 60} min</p>
              </div>
            `).join('');
          document.getElementById('listaServicos').querySelectorAll('.servico-item').forEach(sel => {
            sel.addEventListener('click', () => {
              servicoSelecionado = { id: sel.dataset.id, nome: sel.dataset.nome, preco: parseFloat(sel.dataset.preco), duracao: parseInt(sel.dataset.duracao, 10) };
              showStep(3);
              const hoje = new Date().toISOString().slice(0, 10);
              document.getElementById('dataAgendamento').min = hoje;
            });
          });
          showStep(2);
        });
      });
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('dataAgendamento')?.addEventListener('change', async () => {
    dataSelecionada = document.getElementById('dataAgendamento').value;
    if (!dataSelecionada || !lavacarSelecionado || !servicoSelecionado) return;
    try {
      const horarios = await api(`/horarios/${lavacarSelecionado.id}/${dataSelecionada}/${servicoSelecionado.id}`);
      const container = document.getElementById('listaHorarios');
      container.innerHTML = horarios.length
        ? horarios.map(h => `<button type="button" class="btn btn-ghost hora-btn" data-hora="${h}">${h}</button>`).join('')
        : '<p class="empty-state">Nenhum horário disponível nesta data.</p>';
      container.querySelectorAll('.hora-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          horaSelecionada = btn.dataset.hora;
          document.querySelectorAll('.hora-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById('resumoAgendamento').innerHTML = `
            <p><strong>Lava-car:</strong> ${lavacarSelecionado.nome}</p>
            <p><strong>Endereço:</strong> ${lavacarSelecionado.endereco}, ${lavacarSelecionado.cidade}</p>
            <p><strong>Serviço:</strong> ${servicoSelecionado.nome}</p>
            <p><strong>Data:</strong> ${formatarData(dataSelecionada)}</p>
            <p><strong>Horário:</strong> ${horaSelecionada}</p>
            <p><strong>Valor:</strong> ${formatarMoeda(servicoSelecionado.preco)}</p>
          `;
          showStep(4);
        });
      });
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('btnConfirmar')?.addEventListener('click', async () => {
    if (!lavacarSelecionado || !servicoSelecionado || !dataSelecionada || !horaSelecionada) {
      toast('Preencha todos os passos.', 'error');
      return;
    }
    try {
      await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          lavacarId: lavacarSelecionado.id,
          servicoId: servicoSelecionado.id,
          data: dataSelecionada,
          horaInicio: horaSelecionada,
        }),
      });
      toast('Agendamento confirmado! Você receberá um e-mail.');
      setTimeout(() => window.location.href = 'cliente-dashboard.html', 1500);
    } catch (err) {
      toast(err.message, 'error');
    }
  });
});
