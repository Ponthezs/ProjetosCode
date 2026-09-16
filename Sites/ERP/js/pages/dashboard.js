/**
 * dashboard.js — indicadores (KPIs) e gráficos do painel principal.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'dashboard' })) return;

  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const PALETTE = [cssVar('--brand-600'), cssVar('--gold-500'), cssVar('--success-500'), cssVar('--info-600'), cssVar('--warning-500'), cssVar('--danger-500'), cssVar('--brand-400'), cssVar('--n-500')];

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

  function monthKeyOf(dateIso) { return String(dateIso).slice(0, 7); }

  function renderKpis() {
    const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado');
    const months = last6Months();
    const curM = months[5];
    const prevM = months[4];

    const revenueOf = (mKey) => sales.filter((s) => monthKeyOf(s.date) === mKey).reduce((sum, s) => sum + s.total, 0);
    const curRevenue = revenueOf(curM.key);
    const prevRevenue = revenueOf(prevM.key);
    const revenueGrowth = prevRevenue > 0 ? ((curRevenue - prevRevenue) / prevRevenue) * 100 : (curRevenue > 0 ? 100 : 0);

    const salesCountOf = (mKey) => sales.filter((s) => monthKeyOf(s.date) === mKey).length;
    const curSalesCount = salesCountOf(curM.key);
    const prevSalesCount = salesCountOf(prevM.key);
    const salesGrowth = prevSalesCount > 0 ? ((curSalesCount - prevSalesCount) / prevSalesCount) * 100 : (curSalesCount > 0 ? 100 : 0);

    const receivablesPending = FinancialService.totalReceivablesPending();
    const payablesPending = FinancialService.totalPayablesPending();
    const balance = FinancialService.currentBalance();
    const activeCustomers = CustomerService.activeCount();
    const productsCount = ProductService.count();
    const lowStockCount = ProductService.getLowStock().length;

    const cards = [
      { label: 'Faturamento do mês', value: Utils.formatCurrency(curRevenue), icon: 'fa-sack-dollar', tone: 'brand', growth: revenueGrowth },
      { label: 'Total de vendas (mês)', value: String(curSalesCount), icon: 'fa-cart-shopping', tone: 'info', growth: salesGrowth },
      { label: 'Contas a receber', value: Utils.formatCurrency(receivablesPending), icon: 'fa-file-invoice-dollar', tone: 'success', note: 'em aberto' },
      { label: 'Contas a pagar', value: Utils.formatCurrency(payablesPending), icon: 'fa-file-invoice', tone: 'danger', note: 'em aberto' },
      { label: 'Saldo financeiro', value: Utils.formatCurrency(balance), icon: 'fa-scale-balanced', tone: balance >= 0 ? 'brand' : 'danger', note: 'acumulado' },
      { label: 'Clientes ativos', value: String(activeCustomers), icon: 'fa-users', tone: 'gold', note: `de ${CustomerService.count()} cadastrados` },
      { label: 'Produtos cadastrados', value: String(productsCount), icon: 'fa-box', tone: 'info', note: `${ProductService.activeCount()} ativos` },
      { label: 'Estoque baixo', value: String(lowStockCount), icon: 'fa-triangle-exclamation', tone: lowStockCount > 0 ? 'danger' : 'success', note: 'produtos abaixo do mínimo' },
    ];

    document.getElementById('kpiGrid').innerHTML = cards.map((c) => `
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon tone-${c.tone}"><i class="fa-solid ${c.icon}"></i></div>
        </div>
        <div class="kpi-label">${c.label}</div>
        <div class="kpi-value">${c.value}</div>
        ${c.growth !== undefined
          ? `<div class="kpi-trend ${c.growth >= 0 ? 'up' : 'down'}"><i class="fa-solid ${c.growth >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i> ${Math.abs(c.growth).toFixed(1)}%<span class="kpi-trend-note">vs. mês anterior</span></div>`
          : `<div class="kpi-trend" style="color:var(--text-subtle)">${c.note || ''}</div>`}
      </div>`).join('');
  }

  function renderRevenueChart() {
    const months = last6Months();
    const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado');
    const data = months.map((m) => sales.filter((s) => monthKeyOf(s.date) === m.key).reduce((sum, s) => sum + s.total, 0));
    new Chart(document.getElementById('chartRevenue'), {
      type: 'line',
      data: { labels: months.map((m) => m.label), datasets: [{ label: 'Faturamento', data, borderColor: PALETTE[0], backgroundColor: PALETTE[0] + '22', fill: true, tension: 0.35, pointRadius: 3 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: (v) => Utils.formatCurrency(v) } } } },
    });
  }

  function renderSalesCountChart() {
    const months = last6Months();
    const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado');
    const data = months.map((m) => sales.filter((s) => monthKeyOf(s.date) === m.key).length);
    new Chart(document.getElementById('chartSalesCount'), {
      type: 'bar',
      data: { labels: months.map((m) => m.label), datasets: [{ label: 'Vendas', data, backgroundColor: PALETTE[3], borderRadius: 6, maxBarThickness: 36 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { precision: 0 } } } },
    });
  }

  function monthBounds(m) {
    const from = new Date(m.year, m.month, 1);
    const to = new Date(m.year, m.month + 1, 0);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  function renderRevenueExpenseChart() {
    const months = last6Months();
    const flows = months.map((m) => { const b = monthBounds(m); return FinancialService.computeCashFlow(b.from, b.to); });
    const revenueData = flows.map((f) => f.totalIn);
    const expenseData = flows.map((f) => f.totalOut);
    new Chart(document.getElementById('chartRevenueExpense'), {
      type: 'bar',
      data: { labels: months.map((m) => m.label), datasets: [
        { label: 'Receitas', data: revenueData, backgroundColor: PALETTE[2], borderRadius: 6, maxBarThickness: 22 },
        { label: 'Despesas', data: expenseData, backgroundColor: PALETTE[5], borderRadius: 6, maxBarThickness: 22 },
      ] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: (v) => Utils.formatCurrency(v) } } } },
    });
  }

  function renderByCategoryChart() {
    const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado');
    const totals = {};
    sales.forEach((s) => s.items.forEach((it) => {
      const product = ProductService.getById(it.productId);
      const catName = product ? ProductService.categoryName(product.categoryId) : 'Outros';
      totals[catName] = (totals[catName] || 0) + it.qty * it.unitPrice;
    }));
    const labels = Object.keys(totals);
    const data = Object.values(totals);
    new Chart(document.getElementById('chartByCategory'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]), borderWidth: 0 }] },
      options: { plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, cutout: '62%' },
    });
  }

  function renderTopProductsChart() {
    const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado');
    const qtyByProduct = {};
    sales.forEach((s) => s.items.forEach((it) => { qtyByProduct[it.productId] = (qtyByProduct[it.productId] || 0) + it.qty; }));
    const ranked = Object.entries(qtyByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = ranked.map(([id]) => { const p = ProductService.getById(id); return p ? p.name : id; });
    const data = ranked.map(([, qty]) => qty);
    new Chart(document.getElementById('chartTopProducts'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Unidades vendidas', data, backgroundColor: PALETTE[1], borderRadius: 6 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { precision: 0 } } } },
    });
  }

  renderKpis();
  renderRevenueChart();
  renderSalesCountChart();
  renderRevenueExpenseChart();
  renderByCategoryChart();
  renderTopProductsChart();
})();
