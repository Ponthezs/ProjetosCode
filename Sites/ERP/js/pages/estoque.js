/**
 * estoque.js — visão geral de saldo por produto e histórico de movimentações
 * (entrada, saída, ajuste, inventário). A regra de negócio (aplicação do
 * delta no saldo do produto) fica inteiramente em StockService.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'estoque' })) return;

  const TYPE_LABELS = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste', inventario: 'Inventário' };
  const TYPE_BADGE = { entrada: 'badge-success', saida: 'badge-danger', ajuste: 'badge-warning', inventario: 'badge-info' };

  const els = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    panelVisao: document.getElementById('panelVisao'),
    panelMovimentacoes: document.getElementById('panelMovimentacoes'),
    btnNova: document.getElementById('btnNovaMovimentacao'),
    search: document.getElementById('searchInput'),
    filterCategory: document.getElementById('filterCategory'),
    filterLowStock: document.getElementById('filterLowStock'),
    tableVisao: document.getElementById('tableContainerVisao'),
    filterProduct: document.getElementById('filterProduct'),
    filterType: document.getElementById('filterType'),
    filterDateFrom: document.getElementById('filterDateFrom'),
    filterDateTo: document.getElementById('filterDateTo'),
    tableMovimentacoes: document.getElementById('tableContainerMovimentacoes'),
  };

  let visaoTable;
  let movTable;

  // ---------------------------------------------------------------------
  // Abas
  // ---------------------------------------------------------------------
  function setActiveTab(tab) {
    els.tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    els.panelVisao.hidden = tab !== 'visao';
    els.panelMovimentacoes.hidden = tab !== 'movimentacoes';
  }

  function bindTabs() {
    els.tabButtons.forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
  }

  // ---------------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------------
  function isLowStock(p) { return Number(p.currentStock) <= Number(p.minStock); }
  function productName(id) { const p = ProductService.getById(id); return p ? p.name : '—'; }
  function userName(id) { const u = UserService.getById(id); return u ? u.name : '—'; }

  function refreshCategoryOptions() {
    const current = els.filterCategory.value;
    const cats = CategoryService.getAll();
    els.filterCategory.innerHTML = '<option value="">Categoria (todas)</option>' +
      cats.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');
    if (cats.some((c) => String(c.id) === current)) els.filterCategory.value = current;
  }

  function refreshProductOptions() {
    const current = els.filterProduct.value;
    const products = ProductService.getAll();
    els.filterProduct.innerHTML = '<option value="">Produto (todos)</option>' +
      products.map((p) => `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`).join('');
    if (products.some((p) => String(p.id) === current)) els.filterProduct.value = current;
  }

  // ---------------------------------------------------------------------
  // Aba: Visão geral
  // ---------------------------------------------------------------------
  function applyVisaoFilters() {
    const term = els.search.value.trim().toLowerCase();
    const categoryId = els.filterCategory.value;
    const onlyLow = els.filterLowStock.checked;

    const filtered = ProductService.getAll().filter((p) => {
      if (categoryId && String(p.categoryId) !== categoryId) return false;
      if (onlyLow && !isLowStock(p)) return false;
      if (term) {
        const haystack = `${p.name || ''} ${p.code || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    visaoTable.setData(filtered);
  }

  function buildVisaoTable() {
    visaoTable = createDataTable(els.tableVisao, {
      columns: [
        { key: 'name', label: 'Produto', sortable: true },
        { key: 'categoryId', label: 'Categoria', sortable: true, sortValue: (p) => ProductService.categoryName(p.categoryId), render: (p) => Utils.escapeHtml(ProductService.categoryName(p.categoryId)) },
        { key: 'currentStock', label: 'Estoque atual', align: 'right', sortable: true, render: (p) => `<span class="stock-dot ${isLowStock(p) ? 'low' : 'ok'}"></span>${Utils.formatNumber(p.currentStock)}` },
        { key: 'minStock', label: 'Estoque mínimo', align: 'right', sortable: true, render: (p) => Utils.formatNumber(p.minStock) },
        { key: 'lastMovement', label: 'Última movimentação', sortable: true, sortValue: (p) => StockService.lastMovementDate(p.id) || '', render: (p) => Utils.formatDate(StockService.lastMovementDate(p.id)) },
      ],
      actions: [
        { icon: 'fa-right-left', label: 'Movimentar', onClick: (p) => openMovementForm(p.id) },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhum produto encontrado.',
      emptyIcon: 'fa-boxes-stacked',
      rowClass: (p) => (isLowStock(p) ? 'row-danger' : ''),
    });
  }

  // ---------------------------------------------------------------------
  // Aba: Movimentações
  // ---------------------------------------------------------------------
  function applyMovFilters() {
    const productId = els.filterProduct.value;
    const type = els.filterType.value;
    const from = els.filterDateFrom.value;
    const to = els.filterDateTo.value;

    const filtered = StockService.getAll().filter((m) => {
      if (productId && String(m.productId) !== productId) return false;
      if (type && m.type !== type) return false;
      if (from && m.date < from) return false;
      if (to && m.date > to) return false;
      return true;
    });
    movTable.setData(filtered);
  }

  function buildMovTable() {
    movTable = createDataTable(els.tableMovimentacoes, {
      columns: [
        { key: 'date', label: 'Data', sortable: true, render: (m) => Utils.formatDate(m.date) },
        { key: 'productId', label: 'Produto', sortable: true, sortValue: (m) => productName(m.productId), render: (m) => Utils.escapeHtml(productName(m.productId)) },
        { key: 'type', label: 'Tipo', sortable: true, render: (m) => `<span class="badge ${TYPE_BADGE[m.type] || 'badge-neutral'}">${TYPE_LABELS[m.type] || m.type}</span>` },
        { key: 'quantity', label: 'Quantidade', align: 'right', sortable: true, render: (m) => `<span class="${m.quantity >= 0 ? 'text-success' : 'text-danger'}">${m.quantity >= 0 ? '+' : '-'}${Utils.formatNumber(Math.abs(m.quantity))}</span>` },
        { key: 'reason', label: 'Motivo', render: (m) => Utils.escapeHtml(m.reason || '—') },
        { key: 'responsibleUserId', label: 'Usuário responsável', render: (m) => Utils.escapeHtml(userName(m.responsibleUserId)) },
      ],
      pageSize: 8,
      defaultSortKey: 'date',
      defaultSortDir: 'desc',
      emptyMessage: 'Nenhuma movimentação encontrada.',
      emptyIcon: 'fa-right-left',
    });
  }

  // ---------------------------------------------------------------------
  // Modal de nova movimentação
  // ---------------------------------------------------------------------
  function updateQuantityField(field, type) {
    if (type === 'inventario') {
      field.label = 'Saldo contado';
      field.min = 0;
      field.hint = 'Informe o saldo físico contado; a diferença em relação ao estoque atual é calculada automaticamente.';
    } else if (type === 'ajuste') {
      field.label = 'Quantidade (ajuste)';
      field.min = undefined;
      field.hint = 'Pode ser um número positivo (acréscimo) ou negativo (redução).';
    } else {
      field.label = 'Quantidade';
      field.min = 1;
      field.hint = 'Informe um valor positivo.';
    }
  }

  function openMovementForm(preselectedProductId) {
    const products = ProductService.getAll();
    const qtyField = { name: 'quantity', label: 'Quantidade', type: 'number', required: true, step: 1 };
    updateQuantityField(qtyField, 'entrada');
    qtyField.validate = (v, values) => {
      const n = Number(v);
      if (!n) return 'Informe uma quantidade diferente de zero.';
      if (['entrada', 'saida'].includes(values.type) && n <= 0) return 'Informe uma quantidade positiva.';
      if (values.type === 'inventario' && n < 0) return 'O saldo contado não pode ser negativo.';
      return null;
    };

    const fields = [
      {
        name: 'productId', label: 'Produto', type: 'select', required: true, placeholder: 'Selecione',
        defaultValue: preselectedProductId || '',
        options: products.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
      },
      {
        name: 'type', label: 'Tipo', type: 'select', required: true, defaultValue: 'entrada',
        options: [
          { value: 'entrada', label: 'Entrada' }, { value: 'saida', label: 'Saída' },
          { value: 'ajuste', label: 'Ajuste' }, { value: 'inventario', label: 'Inventário' },
        ],
        onChange: (val, ctx) => { updateQuantityField(qtyField, val); ctx.rerenderField('quantity'); },
      },
      qtyField,
      { name: 'reason', label: 'Motivo', type: 'text', placeholder: 'Ex.: compra, quebra, perda, correção de saldo...' },
      { name: 'date', label: 'Data', type: 'date', required: true, defaultValue: Utils.todayISO() },
    ];

    return Modal.form({
      title: 'Nova movimentação de estoque',
      fields,
      size: 'md',
      submitLabel: 'Registrar movimentação',
      onSubmit: async (data) => {
        let quantity = Number(data.quantity);
        if (data.type === 'inventario') {
          const product = ProductService.getById(data.productId);
          quantity = quantity - Number(product ? product.currentStock : 0);
          if (quantity === 0) throw new Error('O saldo contado é igual ao estoque atual. Nenhuma movimentação foi necessária.');
        }
        StockService.create({
          productId: data.productId, quantity, type: data.type, reason: data.reason,
          date: data.date, responsibleUserId: (Auth.currentUser() || {}).userId,
        });
        Toast.show('Movimentação registrada com sucesso.', 'success');
        refreshAll();
      },
    });
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  function refreshAll() {
    refreshCategoryOptions();
    refreshProductOptions();
    applyVisaoFilters();
    applyMovFilters();
  }

  function bindEvents() {
    els.search.addEventListener('input', Utils.debounce(applyVisaoFilters, 250));
    els.filterCategory.addEventListener('change', applyVisaoFilters);
    els.filterLowStock.addEventListener('change', applyVisaoFilters);
    els.filterProduct.addEventListener('change', applyMovFilters);
    els.filterType.addEventListener('change', applyMovFilters);
    els.filterDateFrom.addEventListener('change', applyMovFilters);
    els.filterDateTo.addEventListener('change', applyMovFilters);
    els.btnNova.addEventListener('click', () => openMovementForm());
  }

  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  function applyQuerystringState() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const type = params.get('type');
    if (tab === 'movimentacoes') {
      setActiveTab('movimentacoes');
      if (type) els.filterType.value = type;
    } else if (tab === 'minimo') {
      setActiveTab('visao');
      els.filterLowStock.checked = true;
    } else {
      setActiveTab('visao');
    }
  }

  bindTabs();
  buildVisaoTable();
  buildMovTable();
  bindEvents();
  refreshCategoryOptions();
  refreshProductOptions();
  applyGlobalSearchQuery();
  applyQuerystringState();
  applyVisaoFilters();
  applyMovFilters();
})();
