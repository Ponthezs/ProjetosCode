/* Orçamentos - CRUD e listagem */

let orcItens = [];

function carregarSelectClientes() {
    const sel = document.getElementById('orcCliente');
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

function carregarSelectServicos() {
    const sel = document.getElementById('orcServicoAdd');
    if (!sel) return;
    const first = sel.querySelector('option');
    sel.innerHTML = first ? first.outerHTML : '<option value="">Adicionar serviço</option>';
    getServicos().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.nome} - ${formatarMoeda(s.preco)}`;
        sel.appendChild(opt);
    });
}

function atualizarOrcTotal() {
    const servicos = getServicos();
    let total = 0;
    orcItens.forEach(item => {
        const s = servicos.find(x => x.id === item.servicoId);
        if (s) total += (s.preco || 0) * (item.quantidade || 1);
    });
    const desc = parseFloat(document.getElementById('orcDesconto')?.value) || 0;
    total = Math.max(0, total - desc);
    const el = document.getElementById('orcTotalDisplay');
    if (el) el.textContent = formatarMoeda(total);
}

function renderOrcItens() {
    const container = document.getElementById('orcItensLista');
    if (!container) return;
    const servicos = getServicos();
    container.innerHTML = '';
    orcItens.forEach((item, i) => {
        const s = servicos.find(x => x.id === item.servicoId);
        const nome = s ? s.nome : '-';
        const preco = s ? s.preco : 0;
        const qtd = item.quantidade || 1;
        const subtotal = preco * qtd;
        const div = document.createElement('div');
        div.className = 'orc-item-row';
        div.innerHTML = `
            <span>${nome} x${qtd}</span>
            <span>${formatarMoeda(subtotal)}</span>
            <button type="button" class="btn btn-ghost btn-sm btn-remove-orc" data-i="${i}">Remover</button>
        `;
        container.appendChild(div);
    });
    container.querySelectorAll('.btn-remove-orc').forEach(btn => {
        btn.addEventListener('click', () => {
            orcItens.splice(parseInt(btn.dataset.i, 10), 1);
            renderOrcItens();
            atualizarOrcTotal();
        });
    });
    atualizarOrcTotal();
}

function renderOrcamentos() {
    const tbody = document.getElementById('tbodyOrcamentos');
    const empty = document.getElementById('emptyOrcamentos');
    if (!tbody) return;

    const filtro = document.getElementById('filterOrcStatus')?.value;
    let list = getOrcamentos();
    if (filtro) list = list.filter(o => o.status === filtro);

    list.sort((a, b) => (b.dataCriacao || '').localeCompare(a.dataCriacao || ''));

    const clientes = getClientes();

    tbody.innerHTML = '';
    if (list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    list.forEach((o, i) => {
        const cli = clientes.find(c => c.id === o.clienteId);
        const venc = o.validade ? (() => {
            const d = new Date(o.dataCriacao || '');
            d.setDate(d.getDate() + o.validade);
            return formatarData(d);
        })() : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${(list.length - i).toString().padStart(4, '0')}</td>
            <td>${cli ? cli.nome : '-'}</td>
            <td>${formatarMoeda(o.total)}</td>
            <td>${venc}</td>
            <td><span class="badge badge-${o.status || 'aberto'}">${(o.status || 'aberto')}</span></td>
            <td class="btn-row">
                <button class="btn btn-ghost btn-icon btn-ver-orc" data-id="${o.id}">Ver</button>
                <button class="btn btn-ghost btn-icon btn-aprovar-orc" data-id="${o.id}">Aprovar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-ver-orc').forEach(btn => {
        btn.addEventListener('click', () => verOrcamento(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-aprovar-orc').forEach(btn => {
        btn.addEventListener('click', () => aprovarOrcamento(btn.dataset.id));
    });
}

function verOrcamento(id) {
    const o = getOrcamentos().find(x => x.id === id);
    if (!o) return;
    const clientes = getClientes();
    const servicos = getServicos();
    const cli = clientes.find(c => c.id === o.clienteId);
    let html = `<p><strong>Cliente:</strong> ${cli ? cli.nome : '-'}</p>`;
    html += `<p><strong>Total:</strong> ${formatarMoeda(o.total)}</p>`;
    html += '<p><strong>Itens:</strong></p><ul>';
    (o.itens || []).forEach(item => {
        const s = servicos.find(x => x.id === item.servicoId);
        const nome = s ? s.nome : '-';
        const preco = s ? s.preco : 0;
        const qtd = item.quantidade || 1;
        html += `<li>${nome} x${qtd} - ${formatarMoeda(preco * qtd)}</li>`;
    });
    html += '</ul>';
    document.getElementById('modalOrcConteudo').innerHTML = html;
    document.getElementById('modalOrcamento').dataset.currentId = id;
    document.getElementById('modalOrcamento').classList.add('active');
}

function aprovarOrcamento(id) {
    const list = getOrcamentos();
    const idx = list.findIndex(o => o.id === id);
    if (idx < 0) return;
    list[idx].status = 'aprovado';
    setOrcamentos(list);
    toast('Orçamento aprovado!');
    renderOrcamentos();
    document.getElementById('modalOrcamento').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    carregarSelectClientes();
    carregarSelectServicos();
    renderOrcItens();
    renderOrcamentos();

    document.getElementById('orcAddItem')?.addEventListener('click', () => {
        const sel = document.getElementById('orcServicoAdd');
        const qtd = parseInt(document.getElementById('orcQtdAdd').value, 10) || 1;
        const id = sel.value;
        if (!id) return;
        const ja = orcItens.find(i => i.servicoId === id);
        if (ja) ja.quantidade = (ja.quantidade || 1) + qtd;
        else orcItens.push({ servicoId: id, quantidade: qtd });
        renderOrcItens();
        sel.value = '';
        document.getElementById('orcQtdAdd').value = 1;
    });

    document.getElementById('orcDesconto')?.addEventListener('input', atualizarOrcTotal);

    document.getElementById('formOrcamento')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (orcItens.length === 0) {
            toast('Adicione ao menos um serviço.', 'warning');
            return;
        }
        const servicos = getServicos();
        let total = 0;
        orcItens.forEach(item => {
            const s = servicos.find(x => x.id === item.servicoId);
            if (s) total += (s.preco || 0) * (item.quantidade || 1);
        });
        const desc = parseFloat(document.getElementById('orcDesconto').value) || 0;
        total = Math.max(0, total - desc);

        const novo = {
            id: uid(),
            clienteId: document.getElementById('orcCliente').value,
            itens: orcItens.map(i => ({ ...i })),
            total,
            desconto: desc,
            validade: parseInt(document.getElementById('orcValidade').value, 10) || 7,
            status: 'aberto',
            dataCriacao: new Date().toISOString(),
        };
        const list = [...getOrcamentos(), novo];
        setOrcamentos(list);
        toast('Orçamento salvo!');
        orcItens = [];
        document.getElementById('formOrcamento').reset();
        document.getElementById('orcValidade').value = 7;
        document.getElementById('orcDesconto').value = 0;
        renderOrcItens();
        renderOrcamentos();
    });

    document.getElementById('filterOrcStatus')?.addEventListener('change', renderOrcamentos);
    document.getElementById('modalOrcFechar')?.addEventListener('click', () => {
        document.getElementById('modalOrcamento').classList.remove('active');
    });
    document.getElementById('modalOrcAprovar')?.addEventListener('click', () => {
        const id = document.getElementById('modalOrcamento').dataset.currentId;
        if (id) aprovarOrcamento(id);
    });
});
