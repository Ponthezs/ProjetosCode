/**
 * fluxo-caixa.js — entradas, saídas, saldo e evolução do caixa por período,
 * com lançamentos manuais (aportes/retiradas) que não vêm de vendas/compras.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'fluxo-caixa' })) return;

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const PALETTE = [cssVar('--brand-600'), cssVar('--gold-500'), cssVar('--success-500'), cssVar('--info-600'), cssVar('--warning-500'), cssVar('--danger-500')];

  const els = {
    periodQuick: document.getElementById('periodQuick'),
    customFields: document.getElementById('customPeriodFields'),
    customFrom: document.getElementById('customFrom'),
    customTo: document.getElementById('customTo'),
    kpiGrid: document.getElementById('kpiGrid'),
    tableContainer: document.getElementById('tableContainer'),
    btnNovo: document.getElementById('btnNovoLancamento'),
  };

  let table;
  let chart;

  // ---------------------------------------------------------------------
  // Período
  // ---------------------------------------------------------------------
  function startOfWeek(d) {
    const r = new Date(d);
    const day = r.getDay(); // 0 = domingo
    r.setDate(r.getDate() - day);
    return r;
  }

  function toIso(d) { return d.toISOString().slice(0, 10); }

  function currentBounds() {
    const today = new Date();
    const todayIso = toIso(today);
    switch (els.periodQuick.value) {
      case 'hoje':
        return { from: todayIso, to: todayIso };
      case 'semana':
        return { from: toIso(startOfWeek(today)), to: todayIso };
      case 'ano':
        return { from: `${today.getFullYear()}-01-01`, to: todayIso };
      case 'personalizado':
        return { from: els.customFrom.value || todayIso, to: els.customTo.value || todayIso };
      case 'mes':
      default:
        return { from: toIso(new Date(today.getFullYear(), today.getMonth(), 1)), to: todayIso };
    }
  }

  function bindPeriodEvents() {
    els.periodQuick.addEventListener('change', () => {
      els.customFields.hidden = els.periodQuick.value !== 'personalizado';
      if (els.periodQuick.value === 'personalizado' && !els.customFrom.value) {
        const today = Utils.todayISO();
        els.customFrom.value = Utils.addDaysISO(today, -30);
        els.customTo.value = today;
      }
      renderAll();
    });
    els.customFrom.addEventListener('change', renderAll);
    els.customTo.addEventListener('change', renderAll);
  }

  // ---------------------------------------------------------------------
  // KPIs e gráfico
  // ---------------------------------------------------------------------
  function renderKpis(flow) {
    const cards = [
      { label: 'Entradas', value: Utils.formatCurrency(flow.totalIn), icon: 'fa-arrow-trend-up', tone: 'success' },
      { label: 'Saídas', value: Utils.formatCurrency(flow.totalOut), icon: 'fa-arrow-trend-down', tone: 'danger' },
      { label: 'Saldo do período', value: Utils.formatCurrency(flow.saldo), icon: 'fa-scale-balanced', tone: flow.saldo >= 0 ? 'brand' : 'danger' },
    ];
    els.kpiGrid.innerHTML = cards.map((c) => `
      <div class="kpi-card">
        <div class="kpi-top"><div class="kpi-icon tone-${c.tone}"><i class="fa-solid ${c.icon}"></i></div></div>
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value">${c.value}</div>
      </div>`).join('');
  }

  /** Agrupa a série diária em blocos semanais quando o período é muito longo, para não poluir o eixo X. */
  function groupSeriesForChart(series) {
    if (series.length <= 60) return series.map((s) => ({ label: Utils.formatDate(s.date), saldoAcumulado: s.saldoAcumulado }));
    const grouped = [];
    for (let i = 0; i < series.length; i += 7) {
      const chunk = series.slice(i, i + 7);
      const last = chunk[chunk.length - 1];
      grouped.push({ label: `${Utils.formatDate(chunk[0].date)} – ${Utils.formatDate(last.date)}`, saldoAcumulado: last.saldoAcumulado });
    }
    return grouped;
  }

  function renderChart(flow) {
    const points = groupSeriesForChart(flow.series);
    const data = { labels: points.map((p) => p.label), datasets: [{ label: 'Saldo acumulado', data: points.map((p) => p.saldoAcumulado), borderColor: PALETTE[0], backgroundColor: PALETTE[0] + '22', fill: true, tension: 0.3, pointRadius: points.length > 30 ? 0 : 3 }] };
    if (chart) { chart.data = data; chart.update(); return; }
    chart = new Chart(document.getElementById('chartBalance'), {
      type: 'line',
      data,
      options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => Utils.formatCurrency(v) } }, x: { ticks: { maxRotation: 0, autoSkip: true } } } },
    });
  }

  // ---------------------------------------------------------------------
  // Tabela de movimentações
  // ---------------------------------------------------------------------
  function buildMovements(from, to) {
    const rows = [];
    FinancialService.getReceivables().forEach((r) => {
      if (r.status === 'recebido' && r.receiptDate >= from && r.receiptDate <= to) {
        rows.push({ id: `rec_${r.id}`, date: r.receiptDate, description: r.description, type: 'entrada', amount: r.amount, source: 'receivable' });
      }
    });
    FinancialService.getPayables().forEach((p) => {
      if (p.status === 'pago' && p.paymentDate >= from && p.paymentDate <= to) {
        rows.push({ id: `pay_${p.id}`, date: p.paymentDate, description: p.description, type: 'saida', amount: p.amount, source: 'payable' });
      }
    });
    FinancialService.getCashEntries().forEach((c) => {
      if (c.date >= from && c.date <= to) {
        rows.push({ id: c.id, date: c.date, description: c.description, type: c.type, amount: c.amount, source: 'manual' });
      }
    });
    rows.sort((a, b) => b.date.localeCompare(a.date));
    return rows;
  }

  function typeBadge(type) {
    return type === 'entrada'
      ? '<span class="badge badge-success">Entrada</span>'
      : '<span class="badge badge-danger">Saída</span>';
  }

  async function handleDeleteManual(row) {
    const ok = await Modal.confirm({
      title: 'Excluir lançamento',
      message: 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      FinancialService.removeCashEntry(row.id);
      Toast.show('Registro excluído com sucesso.', 'success');
      renderAll();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildTable() {
    table = createDataTable(els.tableContainer, {
      columns: [
        { key: 'date', label: 'Data', sortable: true, render: (r) => Utils.formatDate(r.date) },
        { key: 'description', label: 'Descrição', sortable: true },
        { key: 'type', label: 'Tipo', sortable: true, render: (r) => typeBadge(r.type) },
        { key: 'amount', label: 'Valor', align: 'right', sortable: true, render: (r) => `${r.type === 'entrada' ? '+ ' : '- '}${Utils.formatCurrency(r.amount)}` },
      ],
      actions: [
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDeleteManual, show: (r) => r.source === 'manual' },
      ],
      pageSize: 10,
      defaultSortKey: 'date',
      defaultSortDir: 'desc',
      emptyMessage: 'Nenhuma movimentação encontrada no período.',
      emptyIcon: 'fa-money-bill-transfer',
    });
  }

  // ---------------------------------------------------------------------
  // Novo lançamento manual
  // ---------------------------------------------------------------------
  function categoriesForType(type) {
    const nature = type === 'entrada' ? 'receita' : 'despesa';
    return FinancialService.getFinCategories().filter((c) => c.nature === nature);
  }

  function openCashEntryForm() {
    const fields = [
      {
        name: 'type', label: 'Tipo', type: 'select', required: true, defaultValue: 'saida',
        options: [{ value: 'entrada', label: 'Entrada' }, { value: 'saida', label: 'Saída' }],
        onChange: (val, ctx) => {
          const catField = fields.find((f) => f.name === 'categoryId');
          catField.options = categoriesForType(val).map((c) => ({ value: c.id, label: c.name }));
          ctx.rerenderField('categoryId');
        },
      },
      { name: 'date', label: 'Data', type: 'date', required: true, defaultValue: Utils.todayISO() },
      { name: 'description', label: 'Descrição', type: 'text', required: true, colSpan: 2 },
      { name: 'categoryId', label: 'Categoria financeira', type: 'select', placeholder: 'Selecione (opcional)', options: categoriesForType('saida').map((c) => ({ value: c.id, label: c.name })) },
      { name: 'amount', label: 'Valor', type: 'number', min: 0, step: 0.01, required: true, defaultValue: 0 },
    ];
    Modal.form({
      title: 'Novo lançamento manual',
      size: 'md',
      submitLabel: 'Cadastrar lançamento',
      fields,
      onSubmit: async (data) => {
        FinancialService.createCashEntry(data);
        Toast.show('Lançamento cadastrado com sucesso.', 'success');
        renderAll();
      },
    });
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  function renderAll() {
    const { from, to } = currentBounds();
    const flow = FinancialService.computeCashFlow(from, to);
    renderKpis(flow);
    renderChart(flow);
    table.setData(buildMovements(from, to));
  }

  buildTable();
  bindPeriodEvents();
  els.btnNovo.addEventListener('click', openCashEntryForm);
  renderAll();
})();
