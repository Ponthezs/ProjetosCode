/* Serviços - CRUD e listagem */

function renderServicos() {
    const container = document.getElementById('listaServicos');
    const empty = document.getElementById('emptyServicos');
    if (!container) return;

    const list = getServicos();
    container.innerHTML = '';

    if (list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    list.forEach(s => {
        const card = document.createElement('div');
        card.className = 'service-item-card';
        card.innerHTML = `
            <div class="srv-info">
                <h4>${s.nome}</h4>
                <p>${s.descricao || ''} ${s.duracao ? '• ' + s.duracao + ' min' : ''}</p>
            </div>
            <div class="srv-actions">
                <span class="srv-price">${formatarMoeda(s.preco)}</span>
                <div class="btn-row" style="margin-top:0.5rem;">
                    <button class="btn btn-ghost btn-icon btn-edit-srv" data-id="${s.id}">Editar</button>
                    ${s.id.startsWith('s') && ['s1','s2','s3','s4','s5'].includes(s.id) ? '' : `<button class="btn btn-ghost btn-icon btn-del-srv" data-id="${s.id}">Excluir</button>`}
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.btn-edit-srv').forEach(btn => {
        btn.addEventListener('click', () => abrirEditServico(btn.dataset.id));
    });
    container.querySelectorAll('.btn-del-srv').forEach(btn => {
        btn.addEventListener('click', () => excluirServico(btn.dataset.id));
    });
}

function abrirEditServico(id) {
    const s = getServicos().find(x => x.id === id);
    if (!s) return;
    document.getElementById('editSrvId').value = id;
    document.getElementById('editSrvNome').value = s.nome || '';
    document.getElementById('editSrvPreco').value = s.preco || 0;
    document.getElementById('editSrvDuracao').value = s.duracao || '';
    document.getElementById('editSrvDescricao').value = s.descricao || '';
    document.getElementById('modalServico').classList.add('active');
}

function excluirServico(id) {
    if (!confirm('Excluir este serviço?')) return;
    const list = getServicos().filter(s => s.id !== id);
    setServicos(list);
    renderServicos();
    toast('Serviço excluído.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderServicos();

    document.getElementById('formServico')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const novo = {
            id: uid(),
            nome: document.getElementById('srvNome').value.trim(),
            preco: parseFloat(document.getElementById('srvPreco').value) || 0,
            duracao: parseInt(document.getElementById('srvDuracao').value, 10) || null,
            descricao: document.getElementById('srvDescricao').value.trim() || '',
        };
        const list = [...getServicos(), novo];
        setServicos(list);
        toast('Serviço cadastrado!');
        document.getElementById('formServico').reset();
        renderServicos();
    });

    document.getElementById('formEditServico')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editSrvId').value;
        const list = getServicos();
        const idx = list.findIndex(s => s.id === id);
        if (idx < 0) return;
        list[idx].nome = document.getElementById('editSrvNome').value.trim();
        list[idx].preco = parseFloat(document.getElementById('editSrvPreco').value) || 0;
        list[idx].duracao = parseInt(document.getElementById('editSrvDuracao').value, 10) || null;
        list[idx].descricao = document.getElementById('editSrvDescricao').value.trim() || '';
        setServicos(list);
        document.getElementById('modalServico').classList.remove('active');
        toast('Serviço atualizado.');
        renderServicos();
    });

    document.getElementById('modalSrvCancelar')?.addEventListener('click', () => {
        document.getElementById('modalServico').classList.remove('active');
    });
});
