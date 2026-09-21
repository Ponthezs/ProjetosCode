/**
 * contas-receber.js — listagem, cadastro, edição, recebimento e exclusão de
 * contas a receber. Regras de status/vencimento vêm de FinancialService.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'contas-receber' })) return;

  const PAYMENT_METHODS = ['Boleto', 'Transferência bancária', 'Pix', 'Dinheiro', 'Cartão'];

  const els = {
    search: document.getElementById('searchInput'),
    status: document.getElementById('filterStatus'),
    dueFrom: document.getElementById('filterDueFrom'),
    dueTo: document.getElementById('filterDueTo'),
    btnNovo: document.getElementById('btnNovo'),
    tableContainer: document.getElementById('tableContainer'),
  };

  let table;

  function statusBadge(effStatus) {
    const map = {
      pendente: '<span class="badge badge-warning">Pendente</span>',
      recebido: '<span class="badge badge-success">Recebido</span>',
      vencido: '<span class="badge badge-danger">Vencido</span>',
      cancelado: '<span class="badge badge-neutral">Cancelado</span>',
    };
    return map[effStatus] || `<span class="badge badge-neutral">${Utils.escapeHtml(effStatus)}</span>`;
  }

  function customerName(id) { const c = id ? CustomerService.getById(id) : null; return c ? c.name : '—'; }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const status = els.status.value;
    const from = els.dueFrom.value;
    const to = els.dueTo.value;

    const filtered = FinancialService.getReceivables().filter((r) => {
      if (status && r.effectiveStatus !== status) return false;
      if (from && r.dueDate < from) return false;
      if (to && r.dueDate > to) return false;
      if (term && !String(r.description || '').toLowerCase().includes(term)) return false;
      return true;
    });
    table.setData(filtered);
  }

  function buildFormFields() {
    const customers = CustomerService.getAll();
    const revenueCategories = FinancialService.getFinCategories().filter((c) => c.nature === 'receita');
    return [
      { name: 'customerId', label: 'Cliente', type: 'select', placeholder: 'Selecione (opcional)', options: customers.map((c) => ({ value: c.id, label: c.name })) },
      { name: 'description', label: 'Descrição', type: 'text', required: true, colSpan: 2 },
      { name: 'categoryId', label: 'Categoria financeira', type: 'select', required: true, placeholder: 'Selecione', options: revenueCategories.map((c) => ({ value: c.id, label: c.name })) },
      { name: 'amount', label: 'Valor', type: 'number', min: 0, step: 0.01, required: true, defaultValue: 0 },
      { name: 'issueDate', label: 'Data de emissão', type: 'date', required: true, defaultValue: Utils.todayISO() },
      { name: 'dueDate', label: 'Data de vencimento', type: 'date', required: true },
      { name: 'paymentMethod', label: 'Forma de pagamento', type: 'select', required: true, placeholder: 'Selecione', options: PAYMENT_METHODS.map((m) => ({ value: m, label: m })) },
      {
        name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'pendente',
        options: [{ value: 'pendente', label: 'Pendente' }, { value: 'recebido', label: 'Recebido' }, { value: 'cancelado', label: 'Cancelado' }],
      },
    ];
  }

  function openForm(receivable) {
    const isEdit = !!receivable;
    Modal.form({
      title: isEdit ? `Editar conta a receber — ${receivable.description}` : 'Nova conta a receber',
      fields: buildFormFields(),
      initialData: receivable || {},
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar conta',
      size: 'lg',
      onSubmit: async (data) => {
        if (isEdit) {
          FinancialService.updateReceivable(receivable.id, data);
          Toast.show('Conta a receber atualizada com sucesso.', 'success');
        } else {
          FinancialService.createReceivable(data);
          Toast.show('Conta a receber cadastrada com sucesso.', 'success');
        }
        applyFilters();
      },
    });
  }

  function openMarkReceivedForm(receivable) {
    Modal.form({
      title: `Marcar como recebido — ${receivable.description}`,
      size: 'sm',
      submitLabel: 'Confirmar recebimento',
      initialData: { receiptDate: Utils.todayISO(), paymentMethod: receivable.paymentMethod || '' },
      fields: [
        { name: 'receiptDate', label: 'Data de recebimento', type: 'date', required: true },
        { name: 'paymentMethod', label: 'Forma de pagamento', type: 'select', required: true, placeholder: 'Selecione', options: PAYMENT_METHODS.map((m) => ({ value: m, label: m })) },
      ],
      onSubmit: async (data) => {
        FinancialService.markReceivableReceived(receivable.id, data.receiptDate, data.paymentMethod);
        Toast.show('Conta marcada como recebida.', 'success');
        applyFilters();
      },
    });
  }

  function viewField(label, value, full) {
    return `<div class="view-item${full ? ' full' : ''}"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  function statusLabel(s) {
    return { pendente: 'Pendente', recebido: 'Recebido', vencido: 'Vencido', cancelado: 'Cancelado' }[s] || s;
  }

  function openView(r) {
    const bodyHtml = `
      ${r.sourceSaleId ? '<div style="font-size:12px;color:var(--text-subtle);margin-bottom:var(--space-3)"><i class="fa-solid fa-circle-info"></i> Gerada automaticamente pela venda.</div>' : ''}
      <div class="view-section-title">Dados da conta</div>
      <div class="view-grid">
        ${viewField('Cliente', customerName(r.customerId))}
        ${viewField('Descrição', r.description, true)}
        ${viewField('Categoria', FinancialService.finCategoryName(r.categoryId))}
        ${viewField('Valor', Utils.formatCurrency(r.amount))}
        ${viewField('Status', statusLabel(r.effectiveStatus))}
      </div>
      <div class="view-section-title">Datas e pagamento</div>
      <div class="view-grid">
        ${viewField('Data de emissão', Utils.formatDate(r.issueDate))}
        ${viewField('Data de vencimento', Utils.formatDate(r.dueDate))}
        ${viewField('Data de recebimento', r.receiptDate ? Utils.formatDate(r.receiptDate) : '—')}
        ${viewField('Forma de pagamento', r.paymentMethod)}
      </div>`;
    const inst = Modal.open({
      title: `Conta a receber — ${r.description}`,
      bodyHtml,
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
      size: 'lg',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  async function handleDelete(r) {
    const ok = await Modal.confirm({
      title: 'Excluir conta a receber',
      message: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      FinancialService.removeReceivable(r.id);
      Toast.show('Registro excluído com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildTable() {
    table = createDataTable(els.tableContainer, {
      columns: [
        { key: 'customerId', label: 'Cliente', sortable: true, sortValue: (r) => customerName(r.customerId), render: (r) => Utils.escapeHtml(customerName(r.customerId)) },
        { key: 'description', label: 'Descrição', sortable: true },
        { key: 'categoryId', label: 'Categoria', sortValue: (r) => FinancialService.finCategoryName(r.categoryId), render: (r) => Utils.escapeHtml(FinancialService.finCategoryName(r.categoryId)) },
        { key: 'amount', label: 'Valor', align: 'right', sortable: true, render: (r) => Utils.formatCurrency(r.amount) },
        { key: 'issueDate', label: 'Emissão', sortable: true, render: (r) => Utils.formatDate(r.issueDate) },
        { key: 'dueDate', label: 'Vencimento', sortable: true, render: (r) => Utils.formatDate(r.dueDate) },
        { key: 'receiptDate', label: 'Recebimento', render: (r) => (r.receiptDate ? Utils.formatDate(r.receiptDate) : '—') },
        { key: 'paymentMethod', label: 'Forma de pagamento' },
        { key: 'effectiveStatus', label: 'Status', sortable: true, render: (r) => statusBadge(r.effectiveStatus) },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-check', label: 'Marcar como recebido', onClick: openMarkReceivedForm, show: (r) => r.effectiveStatus === 'pendente' || r.effectiveStatus === 'vencido' },
        { icon: 'fa-pen', label: 'Editar', onClick: openForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'dueDate',
      emptyMessage: 'Nenhuma conta a receber encontrada.',
      emptyIcon: 'fa-file-invoice-dollar',
      rowClass: (r) => (r.effectiveStatus === 'vencido' ? 'row-danger' : ''),
    });
  }

  function bindEvents() {
    els.search.addEventListener('input', Utils.debounce(applyFilters, 250));
    els.status.addEventListener('change', applyFilters);
    els.dueFrom.addEventListener('change', applyFilters);
    els.dueTo.addEventListener('change', applyFilters);
    els.btnNovo.addEventListener('click', () => openForm(null));
  }

  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  buildTable();
  bindEvents();
  applyGlobalSearchQuery();
  applyFilters();
})();
