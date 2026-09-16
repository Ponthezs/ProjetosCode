/**
 * financeiro.js — dashboard financeiro (visão geral) e categorias financeiras.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'financeiro' })) return;

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const PALETTE = [cssVar('--brand-600'), cssVar('--gold-500'), cssVar('--success-500'), cssVar('--info-600'), cssVar('--warning-500'), cssVar('--danger-500'), cssVar('--brand-400'), cssVar('--n-500')];

  const els = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    panelGeral: document.getElementById('panelGeral'),
    panelCategorias: document.getElementById('panelCategorias'),
    btnNovaCategoria: document.getElementById('btnNovaCategoria'),
    tableContainerCategorias: document.getElementById('tableContainerCategorias'),
    dueListBody: document.getElementById('dueListBody'),
  };

  let categoryTable;

  // ---------------------------------------------------------------------
  // Abas
  // ---------------------------------------------------------------------
  function setActiveTab(tab) {
    els.tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    els.panelGeral.hidden = tab !== 'geral';
    els.panelCategorias.hidden = tab !== 'categorias';
    els.btnNovaCategoria.hidden = tab !== 'categorias';
  }

  function bindTabs() {
    els.tabButtons.forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
  }

  // ---------------------------------------------------------------------
  // Visão geral
  // ---------------------------------------------------------------------
  function monthLabel(offsetFromNow) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - offsetFromNow);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''), year: d.getFullYear(), month: d.getMonth() };
  }

  function last6Months() {
    const arr = [];
    for (let i = 5; i >= 0; i--) arr.push(monthLabel(i));
    return arr;
  }

  function monthBounds(m) {
    const from = new Date(m.year, m.month, 1);
    const to = new Date(m.year, m.month + 1, 0);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  function renderKpis() {
    const months = last6Months();
    const curM = months[5];
    const curBounds = monthBounds(curM);
    const curFlow = FinancialService.computeCashFlow(curBounds.from, curBounds.to);

    const balance = FinancialService.currentBalance();
    const receivablesPending = FinancialService.totalReceivablesPending();
    const payablesPending = FinancialService.totalPayablesPending();
    const monthlyResult = Math.round((curFlow.totalIn - curFlow.totalOut) * 100) / 100;

    const cards = [
      { label: 'Saldo atual', value: Utils.formatCurrency(balance), icon: 'fa-scale-balanced', tone: balance >= 0 ? 'brand' : 'danger', note: 'acumulado' },
      { label: 'Receitas do mês', value: Utils.formatCurrency(curFlow.totalIn), icon: 'fa-arrow-trend-up', tone: 'success', note: 'realizadas' },
      { label: 'Despesas do mês', value: Utils.formatCurrency(curFlow.totalOut), icon: 'fa-arrow-trend-down', tone: 'danger', note: 'realizadas' },
      { label: 'Contas a receber', value: Utils.formatCurrency(receivablesPending), icon: 'fa-file-invoice-dollar', tone: 'info', note: 'em aberto' },
      { label: 'Contas a pagar', value: Utils.formatCurrency(payablesPending), icon: 'fa-file-invoice', tone: 'gold', note: 'em aberto' },
      { label: 'Resultado mensal', value: Utils.formatCurrency(monthlyResult), icon: 'fa-chart-line', tone: monthlyResult >= 0 ? 'success' : 'danger', note: 'receitas - despesas' },
    ];

    document.getElementById('kpiGrid').innerHTML = cards.map((c) => `
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon tone-${c.tone}"><i class="fa-solid ${c.icon}"></i></div>
        </div>
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value" style="${c.label === 'Resultado mensal' ? `color:${monthlyResult >= 0 ? 'var(--success-600)' : 'var(--danger-600)'}` : ''}">${c.value}</div>
        <div class="kpi-trend" style="color:var(--text-subtle)">${c.note}</div>
      </div>`).join('');
  }

  function renderRevenueExpenseChart() {
    const months = last6Months();
    const flows = months.map((m) => { const b = monthBounds(m); return FinancialService.computeCashFlow(b.from, b.to); });
    new Chart(document.getElementById('chartRevenueExpense'), {
      type: 'bar',
      data: {
        labels: months.map((m) => m.label),
        datasets: [
          { label: 'Receitas', data: flows.map((f) => f.totalIn), backgroundColor: PALETTE[2], borderRadius: 6, maxBarThickness: 26 },
          { label: 'Despesas', data: flows.map((f) => f.totalOut), backgroundColor: PALETTE[5], borderRadius: 6, maxBarThickness: 26 },
        ],
      },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: (v) => Utils.formatCurrency(v) } } } },
    });
  }

  function renderDueList() {
    const today = Utils.todayISO();
    const limit = Utils.addDaysISO(today, 7);
    const payables = FinancialService.getPayables().filter((p) => p.status === 'pendente' && p.dueDate >= today && p.dueDate <= limit)
      .map((p) => ({ date: p.dueDate, desc: p.description, meta: `Fornecedor: ${p.supplierId ? (SupplierService.getById(p.supplierId) || {}).name || '—' : '—'}`, amount: p.amount, kind: 'out' }));
    const receivables = FinancialService.getReceivables().filter((r) => r.status === 'pendente' && r.dueDate >= today && r.dueDate <= limit)
      .map((r) => ({ date: r.dueDate, desc: r.description, meta: `Cliente: ${r.customerId ? (CustomerService.getById(r.customerId) || {}).name || '—' : '—'}`, amount: r.amount, kind: 'in' }));
    const combined = payables.concat(receivables).sort((a, b) => a.date.localeCompare(b.date));

    if (combined.length === 0) {
      els.dueListBody.innerHTML = `<div class="table-empty"><i class="fa-solid fa-circle-check"></i>Nenhuma conta vencendo nos próximos 7 dias.</div>`;
      return;
    }
    els.dueListBody.innerHTML = combined.map((item) => `
      <div class="due-row">
        <div class="due-icon ${item.kind}"><i class="fa-solid ${item.kind === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></div>
        <div class="due-info">
          <div class="due-desc">${Utils.escapeHtml(item.desc)}</div>
          <div class="due-meta">${Utils.escapeHtml(item.meta)} · Vencimento: ${Utils.formatDate(item.date)}${item.date === Utils.todayISO() ? ' (hoje)' : ''}</div>
        </div>
        <div class="due-amount" style="color:${item.kind === 'in' ? 'var(--success-600)' : 'var(--danger-600)'}">${item.kind === 'in' ? '+' : '-'} ${Utils.formatCurrency(item.amount)}</div>
      </div>`).join('');
  }

  // ---------------------------------------------------------------------
  // Categorias financeiras
  // ---------------------------------------------------------------------
  function natureBadge(nature) {
    return nature === 'receita'
      ? '<span class="badge badge-success">Receita</span>'
      : '<span class="badge badge-danger">Despesa</span>';
  }

  function openCategoryForm(category) {
    const isEdit = !!category;
    Modal.form({
      title: isEdit ? `Editar categoria — ${category.name}` : 'Nova categoria',
      size: 'sm',
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar categoria',
      initialData: category || { nature: 'despesa' },
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true },
        {
          name: 'nature', label: 'Natureza', type: 'select', required: true, defaultValue: 'despesa',
          options: [{ value: 'receita', label: 'Receita' }, { value: 'despesa', label: 'Despesa' }],
        },
      ],
      onSubmit: async (data) => {
        if (isEdit) {
          FinancialService.updateFinCategory(category.id, data);
          Toast.show('Categoria atualizada com sucesso.', 'success');
        } else {
          FinancialService.createFinCategory(data);
          Toast.show('Categoria cadastrada com sucesso.', 'success');
        }
        categoryTable.setData(FinancialService.getFinCategories());
      },
    });
  }

  async function handleDeleteCategory(c) {
    const ok = await Modal.confirm({
      title: 'Excluir categoria',
      message: `Tem certeza que deseja excluir a categoria "${Utils.escapeHtml(c.name)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      FinancialService.removeFinCategory(c.id);
      Toast.show('Categoria excluída com sucesso.', 'success');
      categoryTable.setData(FinancialService.getFinCategories());
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildCategoryTable() {
    categoryTable = createDataTable(els.tableContainerCategorias, {
      columns: [
        { key: 'name', label: 'Nome', sortable: true },
        { key: 'nature', label: 'Natureza', sortable: true, render: (c) => natureBadge(c.nature) },
      ],
      actions: [
        { icon: 'fa-pen', label: 'Editar', onClick: openCategoryForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDeleteCategory },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhuma categoria financeira cadastrada.',
      emptyIcon: 'fa-tags',
    });
    categoryTable.setData(FinancialService.getFinCategories());
  }

  function bindCategoryEvents() {
    els.btnNovaCategoria.addEventListener('click', () => openCategoryForm(null));
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  bindTabs();
  renderKpis();
  renderRevenueExpenseChart();
  renderDueList();
  buildCategoryTable();
  bindCategoryEvents();

  const initialTab = new URLSearchParams(window.location.search).get('tab');
  setActiveTab(initialTab === 'categorias' ? 'categorias' : 'geral');
})();
