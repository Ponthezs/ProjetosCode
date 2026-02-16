/* Clientes - CRUD e listagem */

function renderClientes(filtro = '') {
    const tbody = document.getElementById('tbodyClientes');
    const empty = document.getElementById('emptyClientes');
    if (!tbody) return;

    let list = getClientes();
    if (filtro) {
        const f = filtro.toLowerCase();
        list = list.filter(c =>
            (c.nome || '').toLowerCase().includes(f) ||
            (c.telefone || '').includes(f) ||
            (c.email || '').toLowerCase().includes(f)
        );
    }

    tbody.innerHTML = '';
    if (list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    list.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome || '-'}</td>
            <td>${c.telefone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td class="btn-row">
                <button class="btn btn-ghost btn-icon btn-edit-cli" data-id="${c.id}">Editar</button>
                <button class="btn btn-ghost btn-icon btn-del-cli" data-id="${c.id}">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-cli').forEach(btn => {
        btn.addEventListener('click', () => abrirEditCliente(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-del-cli').forEach(btn => {
        btn.addEventListener('click', () => excluirCliente(btn.dataset.id));
    });
}

function abrirEditCliente(id) {
    const c = getClientes().find(x => x.id === id);
    if (!c) return;
    document.getElementById('editCliId').value = id;
    document.getElementById('editCliNome').value = c.nome || '';
    document.getElementById('editCliTelefone').value = c.telefone || '';
    document.getElementById('editCliEmail').value = c.email || '';
    document.getElementById('editCliEndereco').value = c.endereco || '';
    document.getElementById('modalCliente').classList.add('active');
}

function excluirCliente(id) {
    if (!confirm('Excluir este cliente?')) return;
    const list = getClientes().filter(c => c.id !== id);
    setClientes(list);
    renderClientes(document.getElementById('searchCliente')?.value || '');
    toast('Cliente excluído.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderClientes();

    document.getElementById('searchCliente')?.addEventListener('input', (e) => {
        renderClientes(e.target.value);
    });

    document.getElementById('formCliente')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const novo = {
            id: uid(),
            dataCadastro: new Date().toISOString().slice(0, 10),
            nome: document.getElementById('cliNome').value.trim(),
            telefone: document.getElementById('cliTelefone').value.trim(),
            email: document.getElementById('cliEmail').value.trim() || '',
            cpf: document.getElementById('cliCPF').value.trim() || '',
            endereco: document.getElementById('cliEndereco').value.trim() || '',
        };
        const list = [...getClientes(), novo];
        setClientes(list);
        toast('Cliente cadastrado!');
        document.getElementById('formCliente').reset();
        renderClientes();
    });

    document.getElementById('formEditCliente')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editCliId').value;
        const list = getClientes();
        const idx = list.findIndex(c => c.id === id);
        if (idx < 0) return;
        list[idx].nome = document.getElementById('editCliNome').value.trim();
        list[idx].telefone = document.getElementById('editCliTelefone').value.trim();
        list[idx].email = document.getElementById('editCliEmail').value.trim() || '';
        list[idx].endereco = document.getElementById('editCliEndereco').value.trim() || '';
        setClientes(list);
        document.getElementById('modalCliente').classList.remove('active');
        toast('Cliente atualizado.');
        renderClientes(document.getElementById('searchCliente')?.value || '');
    });

    document.getElementById('modalCliCancelar')?.addEventListener('click', () => {
        document.getElementById('modalCliente').classList.remove('active');
    });
});
