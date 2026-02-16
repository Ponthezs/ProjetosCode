/* Agendamentos - CRUD e listagem */

function carregarSelectClientes(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const first = sel.querySelector('option');
    sel.innerHTML = first ? first.outerHTML : '<option value="">Selecione o cliente</option>';
    getClientes().forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nome;
        sel.appendChild(opt);
    });
}

function carregarCheckServicos() {
    const container = document.getElementById('agServicosCheck');
    if (!container) return;
    container.innerHTML = '';
    getServicos().forEach(s => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="agServico" value="${s.id}"> ${s.nome} - ${formatarMoeda(s.preco)}`;
        container.appendChild(label);
    });
}

function renderAgendamentos() {
    const tbody = document.getElementById('tbodyAgendamentos');
    const empty = document.getElementById('emptyAgendamentos');
    if (!tbody) return;

    const filtroData = document.getElementById('filterData')?.value;
    const filtroStatus = document.getElementById('filterStatus')?.value;
    let list = getAgendamentos();

    if (filtroData) list = list.filter(a => a.data?.slice(0, 10) === filtroData);
    if (filtroStatus) list = list.filter(a => a.status === filtroStatus);

    list.sort((a, b) => {
        const da = (a.data || '') + (a.hora || '');
        const db = (b.data || '') + (b.hora || '');
        return db.localeCompare(da);
    });

    const clientes = getClientes();
    const servicos = getServicos();

    tbody.innerHTML = '';
    if (list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    list.forEach(a => {
        const cli = clientes.find(c => c.id === a.clienteId);
        const nomes = (a.servicosIds || [])
            .map(id => servicos.find(s => s.id === id)?.nome)
            .filter(Boolean);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarDataHora(a.data + ' ' + (a.hora || ''))}</td>
            <td>${cli ? cli.nome : '-'}</td>
            <td>${a.veiculo || '-'}</td>
            <td>${nomes.join(', ') || '-'}</td>
            <td><span class="badge badge-${a.status || 'pendente'}">${(a.status || 'pendente').replace('_', ' ')}</span></td>
            <td class="btn-row">
                <button class="btn btn-ghost btn-icon btn-edit-ag" data-id="${a.id}">Editar</button>
                <button class="btn btn-ghost btn-icon btn-del-ag" data-id="${a.id}">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-ag').forEach(btn => {
        btn.addEventListener('click', () => abrirEditAgendamento(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-del-ag').forEach(btn => {
        btn.addEventListener('click', () => excluirAgendamento(btn.dataset.id));
    });
}

function abrirEditAgendamento(id) {
    const ag = getAgendamentos().find(a => a.id === id);
    if (!ag) return;
    document.getElementById('editAgId').value = id;
    carregarSelectClientes('editAgCliente');
    document.getElementById('editAgCliente').value = ag.clienteId || '';
    document.getElementById('editAgData').value = ag.data || '';
    document.getElementById('editAgHora').value = ag.hora || '';
    document.getElementById('editAgStatus').value = ag.status || 'pendente';
    document.getElementById('modalAgendamento').classList.add('active');
}

function excluirAgendamento(id) {
    if (!confirm('Excluir este agendamento?')) return;
    const list = getAgendamentos().filter(a => a.id !== id);
    setAgendamentos(list);
    renderAgendamentos();
    toast('Agendamento excluído.');
}

document.addEventListener('DOMContentLoaded', () => {
    carregarSelectClientes('agCliente');
    carregarCheckServicos();
    renderAgendamentos();

    document.getElementById('filterData')?.addEventListener('change', renderAgendamentos);
    document.getElementById('filterStatus')?.addEventListener('change', renderAgendamentos);

    document.getElementById('formAgendamento')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const servicosIds = [];
        document.querySelectorAll('input[name="agServico"]:checked').forEach(cb => servicosIds.push(cb.value));

        const servicos = getServicos();
        let valorTotal = 0;
        servicosIds.forEach(id => {
            const s = servicos.find(x => x.id === id);
            if (s) valorTotal += s.preco || 0;
        });

        const novo = {
            id: uid(),
            clienteId: document.getElementById('agCliente').value,
            data: document.getElementById('agData').value,
            hora: document.getElementById('agHora').value,
            veiculo: document.getElementById('agVeiculo').value || '',
            servicosIds,
            observacao: document.getElementById('agObservacao').value || '',
            status: 'pendente',
            valorTotal,
        };
        const list = [...getAgendamentos(), novo];
        setAgendamentos(list);
        toast('Agendamento salvo!');
        document.getElementById('formAgendamento').reset();
        renderAgendamentos();
    });

    document.getElementById('formEditAgendamento')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editAgId').value;
        const list = getAgendamentos();
        const idx = list.findIndex(a => a.id === id);
        if (idx < 0) return;
        list[idx].clienteId = document.getElementById('editAgCliente').value;
        list[idx].data = document.getElementById('editAgData').value;
        list[idx].hora = document.getElementById('editAgHora').value;
        list[idx].status = document.getElementById('editAgStatus').value;
        setAgendamentos(list);
        document.getElementById('modalAgendamento').classList.remove('active');
        toast('Agendamento atualizado.');
        renderAgendamentos();
    });

    document.getElementById('modalAgCancelar')?.addEventListener('click', () => {
        document.getElementById('modalAgendamento').classList.remove('active');
    });
});
