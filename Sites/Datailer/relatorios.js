/* Relatórios - faturamento e métricas */

function definirPeriodoPadrao() {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('relDataInicio').value = inicio.toISOString().slice(0, 10);
    document.getElementById('relDataFim').value = hoje.toISOString().slice(0, 10);
}

function gerarRelatorio() {
    const dataInicio = document.getElementById('relDataInicio')?.value;
    const dataFim = document.getElementById('relDataFim')?.value;
    if (!dataInicio || !dataFim) {
        toast('Selecione o período.', 'warning');
        return;
    }

    const ag = getAgendamentos();
    const cli = getClientes();
    const orc = getOrcamentos();

    const inRange = (dtStr) => {
        if (!dtStr) return false;
        const d = dtStr.slice(0, 10);
        return d >= dataInicio && d <= dataFim;
    };

    const concluidos = ag.filter(a => a.status === 'concluido' && inRange(a.data));
    const faturamento = concluidos.reduce((acc, a) => acc + (a.valorTotal || 0), 0);
    const novosClientes = cli.filter(c => inRange(c.dataCadastro || '')).length;
    const orcAprovados = orc.filter(o => o.status === 'aprovado' && inRange(o.dataCriacao)).length;

    document.getElementById('reportFaturamento').textContent = formatarMoeda(faturamento);
    document.getElementById('reportServicos').textContent = concluidos.length;
    document.getElementById('reportNovosClientes').textContent = novosClientes;
    document.getElementById('reportOrcAprovados').textContent = orcAprovados;

    const servicos = getServicos();
    const contagem = {};
    concluidos.forEach(a => {
        (a.servicosIds || []).forEach(id => {
            contagem[id] = (contagem[id] || 0) + 1;
        });
    });
    const topServicos = Object.entries(contagem)
        .map(([id, qtd]) => ({ id, qtd, nome: servicos.find(s => s.id === id)?.nome || id }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5);

    const topContainer = document.getElementById('reportTopServicos');
    if (topContainer) {
        topContainer.innerHTML = topServicos.length
            ? topServicos.map(s => `<div class="report-item"><span>${s.nome}</span><span>${s.qtd}x</span></div>`).join('')
            : '<p class="empty-state">Nenhum serviço no período.</p>';
    }

    const agPeriodo = ag.filter(a => inRange(a.data));
    const porStatus = { pendente: 0, em_andamento: 0, concluido: 0, cancelado: 0 };
    agPeriodo.forEach(a => {
        const st = a.status || 'pendente';
        porStatus[st] = (porStatus[st] || 0) + 1;
    });

    const statusContainer = document.getElementById('reportAgStatus');
    if (statusContainer) {
        statusContainer.innerHTML = Object.entries(porStatus)
            .filter(([, v]) => v > 0)
            .map(([st, v]) => `<div class="report-item"><span>${st.replace('_', ' ')}</span><span>${v}</span></div>`)
            .join('') || '<p class="empty-state">Nenhum agendamento no período.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    definirPeriodoPadrao();
    document.getElementById('btnGerarRelatorio')?.addEventListener('click', gerarRelatorio);
});
