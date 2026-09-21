/**
 * clientes.js — listagem, cadastro, edição, visualização e exclusão de clientes.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'clientes' })) return;

  const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  const els = {
    search: document.getElementById('searchInput'),
    status: document.getElementById('filterStatus'),
    city: document.getElementById('filterCity'),
    state: document.getElementById('filterState'),
    period: document.getElementById('filterPeriod'),
    btnNovo: document.getElementById('btnNovo'),
    tableContainer: document.getElementById('tableContainer'),
  };

  let table;

  function fillSelect(select, values) {
    const current = select.value;
    const placeholder = select.options[0];
    select.innerHTML = '';
    select.appendChild(placeholder);
    values.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
    if (values.includes(current)) select.value = current;
  }

  function refreshFilterOptions() {
    fillSelect(els.city, CustomerService.cities());
    fillSelect(els.state, CustomerService.states());
  }

  function withinPeriod(createdAt, period) {
    if (!period) return true;
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    if (period === 'year') return created.getFullYear() === now.getFullYear();
    const days = Number(period);
    const diffDays = (now - created) / 86400000;
    return diffDays <= days;
  }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const status = els.status.value;
    const city = els.city.value;
    const state = els.state.value;
    const period = els.period.value;

    const filtered = CustomerService.getAll().filter((c) => {
      if (status && c.status !== status) return false;
      if (city && c.city !== city) return false;
      if (state && c.state !== state) return false;
      if (!withinPeriod(c.createdAt, period)) return false;
      if (term) {
        const haystack = `${c.name || ''} ${c.code || ''} ${c.document || ''} ${c.email || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    table.setData(filtered);
  }

  function statusBadge(status) {
    return status === 'ativo'
      ? '<span class="badge badge-success">Ativo</span>'
      : '<span class="badge badge-neutral">Inativo</span>';
  }

  function documentField() {
    return {
      name: 'document', label: 'CPF/CNPJ', type: 'text', required: true,
      mask: (v, getValues) => Utils.maskDocument(v, getValues().personType),
      validate: (v, values) => (!Utils.validateDocument(v, values.personType) ? (values.personType === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.') : null),
    };
  }

  function tradeNameField() {
    return { name: 'tradeName', label: 'Nome fantasia', type: 'text', required: false, hint: 'Obrigatório para Pessoa Jurídica.' };
  }

  function buildFormFields() {
    const fields = [
      {
        name: 'personType', label: 'Tipo de pessoa', type: 'select', required: true, defaultValue: 'PF',
        options: [{ value: 'PF', label: 'Pessoa Física' }, { value: 'PJ', label: 'Pessoa Jurídica' }],
        onChange: (val, ctx) => {
          const trade = fields.find((f) => f.name === 'tradeName');
          trade.required = val === 'PJ';
          const doc = fields.find((f) => f.name === 'document');
          ctx.values.document = Utils.maskDocument(ctx.values.document, val);
          ctx.rerenderField('tradeName');
          ctx.rerenderField('document');
        },
      },
      { name: 'name', label: 'Nome/Razão Social', type: 'text', required: true, colSpan: 2 },
      tradeNameField(),
      documentField(),
      { name: 'stateDocument', label: 'RG/Inscrição Estadual', type: 'text' },
      { name: 'email', label: 'E-mail', type: 'email', validate: (v) => (!Utils.validateEmail(v) ? 'E-mail inválido.' : null) },
      { name: 'phone', label: 'Telefone', type: 'tel', mask: 'phone' },
      { name: 'mobile', label: 'Celular', type: 'tel', mask: 'phone' },
      { name: 'zip', label: 'CEP', type: 'text', mask: 'cep' },
      { name: 'address', label: 'Endereço', type: 'text' },
      { name: 'number', label: 'Número', type: 'text' },
      { name: 'complement', label: 'Complemento', type: 'text' },
      { name: 'district', label: 'Bairro', type: 'text' },
      { name: 'city', label: 'Cidade', type: 'text' },
      { name: 'state', label: 'Estado', type: 'select', placeholder: 'Selecione', options: UFS.map((uf) => ({ value: uf, label: uf })) },
      { name: 'notes', label: 'Observações', type: 'textarea', rows: 3, colSpan: 2 },
      {
        name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'ativo',
        options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }],
      },
    ];
    return fields;
  }

  function openForm(customer) {
    const isEdit = !!customer;
    Modal.form({
      title: isEdit ? `Editar cliente — ${customer.code}` : 'Novo cliente',
      fields: buildFormFields(),
      initialData: customer || { personType: 'PF' },
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar cliente',
      size: 'lg',
      onSubmit: async (data) => {
        if (isEdit) {
          CustomerService.update(customer.id, data);
          Toast.show('Cliente atualizado com sucesso.', 'success');
        } else {
          CustomerService.create(data);
          Toast.show('Cliente cadastrado com sucesso.', 'success');
        }
        refreshFilterOptions();
        applyFilters();
      },
    });
  }

  function viewField(label, value, full) {
    return `<div class="view-item${full ? ' full' : ''}"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  function openView(c) {
    const address = [c.address, c.number].filter(Boolean).join(', ') || '—';
    const bodyHtml = `
      <div class="view-section-title">Dados gerais</div>
      <div class="view-grid">
        ${viewField('Código', c.code)}
        ${viewField('Tipo de pessoa', c.personType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física')}
        ${viewField('Nome/Razão Social', c.name, true)}
        ${viewField('Nome fantasia', c.tradeName)}
        ${viewField('CPF/CNPJ', c.document)}
        ${viewField('RG/Inscrição Estadual', c.stateDocument)}
        ${viewField('Status', c.status === 'ativo' ? 'Ativo' : 'Inativo')}
      </div>
      <div class="view-section-title">Contato</div>
      <div class="view-grid">
        ${viewField('E-mail', c.email)}
        ${viewField('Telefone', c.phone)}
        ${viewField('Celular', c.mobile)}
      </div>
      <div class="view-section-title">Endereço</div>
      <div class="view-grid">
        ${viewField('CEP', c.zip)}
        ${viewField('Endereço', address)}
        ${viewField('Complemento', c.complement)}
        ${viewField('Bairro', c.district)}
        ${viewField('Cidade', c.city)}
        ${viewField('Estado', c.state)}
      </div>
      <div class="view-section-title">Observações</div>
      <div class="view-grid">
        ${viewField('Observações', c.notes, true)}
        ${viewField('Data de cadastro', Utils.formatDate(c.createdAt))}
      </div>`;
    const inst = Modal.open({
      title: `Cliente — ${c.code}`,
      bodyHtml,
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
      size: 'lg',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  async function handleDelete(c) {
    const ok = await Modal.confirm({
      title: 'Excluir cliente',
      message: `Tem certeza que deseja excluir o cliente "${Utils.escapeHtml(c.name)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      CustomerService.remove(c.id);
      Toast.show('Cliente excluído com sucesso.', 'success');
      refreshFilterOptions();
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildTable() {
    table = createDataTable(els.tableContainer, {
      columns: [
        { key: 'code', label: 'Código', sortable: true },
        { key: 'name', label: 'Nome', sortable: true, render: (c) => `${Utils.escapeHtml(c.name)}${c.tradeName ? `<div style="font-size:11.5px;color:var(--text-subtle)">${Utils.escapeHtml(c.tradeName)}</div>` : ''}` },
        { key: 'document', label: 'CPF/CNPJ', sortable: true },
        { key: 'email', label: 'E-mail' },
        { key: 'phone', label: 'Telefone' },
        { key: 'city', label: 'Cidade', sortable: true },
        { key: 'state', label: 'Estado', sortable: true },
        { key: 'status', label: 'Status', sortable: true, render: (c) => statusBadge(c.status) },
        { key: 'createdAt', label: 'Data de cadastro', sortable: true, render: (c) => Utils.formatDate(c.createdAt) },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-pen', label: 'Editar', onClick: openForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhum cliente encontrado.',
      emptyIcon: 'fa-users',
    });
  }

  function bindEvents() {
    els.search.addEventListener('input', Utils.debounce(applyFilters, 250));
    els.status.addEventListener('change', applyFilters);
    els.city.addEventListener('change', applyFilters);
    els.state.addEventListener('change', applyFilters);
    els.period.addEventListener('change', applyFilters);
    els.btnNovo.addEventListener('click', () => openForm(null));
  }

  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  buildTable();
  bindEvents();
  refreshFilterOptions();
  applyGlobalSearchQuery();
  applyFilters();
})();
