/* Dashboard - estatísticas e lista do dia */

document.addEventListener('DOMContentLoaded', () => {
    const hoje = hojeStr();
    const agendamentos = getAgendamentos();
    const clientes = getClientes();
    const orcamentos = getOrcamentos();

    const agHoje = agendamentos.filter(a => a.data?.slice(0, 10) === hoje);
    const concluidos = agendamentos.filter(a => a.status === 'concluido');
    const fatMes = concluidos
        .filter(a => {
            const m = a.data?.slice(0, 7);
            return m === hoje.slice(0, 7);
        })
        .reduce((acc, a) => acc + (a.valorTotal || 0), 0);

    document.getElementById('statAgendamentos').textContent = agHoje.length;
    document.getElementById('statClientes').textContent = clientes.length;
    document.getElementById('statFaturamento').textContent = formatarMoeda(fatMes);
    document.getElementById('statConcluidos').textContent = concluidos.length;

    const lista = document.getElementById('listaAgendamentosHoje');
    if (!lista) return;

    const empty = lista.querySelector('.empty-state');
    if (agHoje.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.remove();
    agHoje.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

    agHoje.forEach(a => {
        const cliente = clientes.find(c => c.id === a.clienteId);
        const nome = cliente ? cliente.nome : 'Cliente';
        const div = document.createElement('div');
        div.className = 'mini-item';
        div.innerHTML = `
            <span>${a.hora || '-'} - ${nome}</span>
            <span class="badge badge-${a.status || 'pendente'}">${(a.status || 'pendente').replace('_', ' ')}</span>
        `;
        lista.appendChild(div);
    });
});
