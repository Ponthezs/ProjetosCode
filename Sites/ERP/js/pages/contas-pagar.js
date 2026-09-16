/**
 * contas-pagar.js — listagem, cadastro, edição, pagamento e exclusão de
 * contas a pagar. Regras de status/vencimento vêm de FinancialService.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'contas-pagar' })) return;

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
      pago: '<span class="badge badge-success">Pago</span>',
      vencido: '<span class="badge badge-danger">Vencido</span>',
      cancelado: '<span class="badge badge-neutral">Cancelado</span>',
    };
    return map[effStatus] || `<span class="badge badge-neutral">${Utils.escapeHtml(effStatus)}</span>`;
  }

  function supplierName(id) { const s = id ? SupplierService.getById(id) : null; return s ? s.name : '—'; }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const status = els.status.value;
    const from = els.dueFrom.value;
    const to = els.dueTo.value;

    const filtered = FinancialService.getPayables().filter((p) => {
      if (status && p.effectiveStatus !== status) return false;
      if (from && p.dueDate < from) return false;
      if (to && p.dueDate > to) return false;
      if (term && !String(p.description || '').toLowerCase().includes(term)) return false;
      return true;
    });
    table.setData(filtered);
  }

  function buildFormFields(payable) {
    const suppliers = SupplierService.getAll();
    const expenseCategories = FinancialService.getFinCategories().filter((c) => c.nature === 'despesa');
    return [
      { name: 'description', label: 'Descrição', type: 'text', required: true, colSpan: 2 },
      { name: 'supplierId', label: 'Fornecedor', type: 'select', placeholder: 'Selecione (opcional)', options: suppliers.map((s) => ({ value: s.id, label: s.name })) },
      { name: 'categoryId', label: 'Categoria financeira', type: 'select', required: true, placeholder: 'Selecione', options: expenseCategories.map((c) => ({ value: c.id, label: c.name })) },
      { name: 'amount', label: 'Valor', type: 'number', min: 0, step: 0.01, required: true, defaultValue: 0 },
      { name: 'issueDate', label: 'Data de emissão', type: 'date', required: true, defaultValue: Utils.todayISO() },
      { name: 'dueDate', label: 'Data de vencimento', type: 'date', required: true },
      { name: 'paymentMethod', label: 'Forma de pagamento', type: 'select', required: true, placeholder: 'Selecione', options: PAYMENT_METHODS.map((m) => ({ value: m, label: m })) },
      {
        name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'pendente',
        options: [{ value: 'pendente', label: 'Pendente' }, { value: 'pago', label: 'Pago' }, { value: 'cancelado', label: 'Cancelado' }],
      },
    ];
  }

  function openForm(payable) {
    const isEdit = !!payable;
    Modal.form({
      title: isEdit ? `Editar conta a pagar — ${payable.description}` : 'Nova conta a pagar',
      fields: buildFormFields(payable),
      initialData: payable || {},
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar conta',
      size: 'lg',
      onSubmit: async (data) => {
        if (isEdit) {
          FinancialService.updatePayable(payable.id, data);
          Toast.show('Conta a pagar atualizada com sucesso.', 'success');
        } else {
          FinancialService.createPayable(data);
          Toast.show('Conta a pagar cadastrada com sucesso.', 'success');
        }
        applyFilters();
      },
    });
  }

  function openMarkPaidForm(payable) {
    Modal.form({
      title: `Marcar como pago — ${payable.description}`,
      size: 'sm',
      submitLabel: 'Confirmar pagamento',
      initialData: { paymentDate: Utils.todayISO(), paymentMethod: payable.paymentMethod || '' },
      fields: [
        { name: 'paymentDate', label: 'Data de pagamento', type: 'date', required: true },
        { name: 'paymentMethod', label: 'Forma de pagamento', type: 'select', required: true, placeholder: 'Selecione', options: PAYMENT_METHODS.map((m) => ({ value: m, label: m })) },
      ],
      onSubmit: async (data) => {
        FinancialService.markPayablePaid(payable.id, data.paymentDate, data.paymentMethod);
        Toast.show('Conta marcada como paga.', 'success');
        applyFilters();
      },
    });
  }

  function viewField(label, value, full) {
    return `<div class="view-item${full ? ' full' : ''}"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  function openView(p) {
    const bodyHtml = `
      ${p.sourcePurchaseId ? '<div style="font-size:12px;color:var(--text-subtle);margin-bottom:var(--space-3)"><i class="fa-solid fa-circle-info"></i> Gerada automaticamente pela compra.</div>' : ''}
      <div class="view-section-title">Dados da conta</div>
      <div class="view-grid">
        ${viewField('Descrição', p.description, true)}
        ${viewField('Fornecedor', supplierName(p.supplierId))}
        ${viewField('Categoria', FinancialService.finCategoryName(p.categoryId))}
        ${viewField('Valor', Utils.formatCurrency(p.amount))}
        ${viewField('Status', statusLabel(p.effectiveStatus))}
      </div>
      <div class="view-section-title">Datas e pagamento</div>
      <div class="view-grid">
        ${viewField('Data de emissão', Utils.formatDate(p.issueDate))}
        ${viewField('Data de vencimento', Utils.formatDate(p.dueDate))}
        ${viewField('Data de pagamento', p.paymentDate ? Utils.formatDate(p.paymentDate) : '—')}
        ${viewField('Forma de pagamento', p.paymentMethod)}
      </div>`;
    const inst = Modal.open({
      title: `Conta a pagar — ${p.description}`,
      bodyHtml,
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
      size: 'lg',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  function statusLabel(s) {
    return { pendente: 'Pendente', pago: 'Pago', vencido: 'Vencido', cancelado: 'Cancelado' }[s] || s;
  }

  async function handleDelete(p) {
    const ok = await Modal.confirm({
      title: 'Excluir conta a pagar',
      message: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      FinancialService.removePayable(p.id);
      Toast.show('Registro excluído com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildTable() {
    table = createDataTable(els.tableContainer, {
      columns: [
        { key: 'description', label: 'Descrição', sortable: true },
        { key: 'supplierId', label: 'Fornecedor', sortValue: (p) => supplierName(p.supplierId), render: (p) => Utils.escapeHtml(supplierName(p.supplierId)) },
        { key: 'categoryId', label: 'Categoria', sortValue: (p) => FinancialService.finCategoryName(p.categoryId), render: (p) => Utils.escapeHtml(FinancialService.finCategoryName(p.categoryId)) },
        { key: 'amount', label: 'Valor', align: 'right', sortable: true, render: (p) => Utils.formatCurrency(p.amount) },
        { key: 'issueDate', label: 'Emissão', sortable: true, render: (p) => Utils.formatDate(p.issueDate) },
        { key: 'dueDate', label: 'Vencimento', sortable: true, render: (p) => Utils.formatDate(p.dueDate) },
        { key: 'paymentDate', label: 'Pagamento', render: (p) => (p.paymentDate ? Utils.formatDate(p.paymentDate) : '—') },
        { key: 'paymentMethod', label: 'Forma de pagamento' },
        { key: 'effectiveStatus', label: 'Status', sortable: true, render: (p) => statusBadge(p.effectiveStatus) },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-check', label: 'Marcar como pago', onClick: openMarkPaidForm, show: (p) => p.effectiveStatus === 'pendente' || p.effectiveStatus === 'vencido' },
        { icon: 'fa-pen', label: 'Editar', onClick: openForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'dueDate',
      emptyMessage: 'Nenhuma conta a pagar encontrada.',
      emptyIcon: 'fa-file-invoice',
      rowClass: (p) => (p.effectiveStatus === 'vencido' ? 'row-danger' : ''),
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
