/**
 * relatorios.js — área central de relatórios: seleciona o tipo de relatório,
 * aplica um filtro de período, exibe o resultado em tabela e permite
 * imprimir, exportar em CSV e exportar em PDF (jsPDF + autoTable).
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'relatorios' })) return;

  // ---------------------------------------------------------------------
  // Rótulos de status reaproveitados nos relatórios
  // ---------------------------------------------------------------------
  const SALE_STATUS = {
    orcamento: ['Orçamento', 'badge-neutral'], pendente: ['Pendente', 'badge-warning'],
    pago: ['Pago', 'badge-success'], cancelado: ['Cancelado', 'badge-danger'], finalizado: ['Finalizado', 'badge-info'],
  };
  const PURCHASE_STATUS = {
    pendente: ['Pendente', 'badge-warning'], confirmada: ['Confirmada', 'badge-success'], cancelada: ['Cancelada', 'badge-danger'],
  };
  const PAYABLE_STATUS = {
    pendente: ['Pendente', 'badge-warning'], pago: ['Pago', 'badge-success'], vencido: ['Vencido', 'badge-danger'], cancelado: ['Cancelado', 'badge-neutral'],
  };
  const RECEIVABLE_STATUS = {
    pendente: ['Pendente', 'badge-warning'], recebido: ['Recebido', 'badge-success'], vencido: ['Vencido', 'badge-danger'], cancelado: ['Cancelado', 'badge-neutral'],
  };

  function statusBadge(map, status) {
    const [label, cls] = map[status] || [status || '—', 'badge-neutral'];
    return `<span class="badge ${cls}">${label}</span>`;
  }
  function statusLabel(map, status) { return (map[status] || [status || '—'])[0]; }

  function customerName(id) { const c = CustomerService.getById(id); return c ? c.name : '—'; }
  function supplierName(id) { const s = SupplierService.getById(id); return s ? s.name : '—'; }

  // ---------------------------------------------------------------------
  // Período
  // ---------------------------------------------------------------------
  function toISODate(d) { return d.toISOString().slice(0, 10); }

  function monthRange(offsetMonths) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offsetMonths);
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { from: toISODate(from), to: toISODate(to) };
  }

  function yearRange() {
    const y = new Date().getFullYear();
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }

  // ---------------------------------------------------------------------
  // Definição dos relatórios
  // ---------------------------------------------------------------------
  const REPORTS = [
    {
      id: 'vendas', label: 'Relatório de vendas', icon: 'fa-cart-shopping', fileBase: 'relatorio-vendas', needsPeriod: true,
      compute(from, to) {
        const rows = SalesService.getAll().filter((s) => s.date >= from && s.date <= to);
        return {
          rows,
          columns: [
            { label: 'Número', render: (r) => Utils.escapeHtml(r.number), value: (r) => r.number },
            { label: 'Cliente', render: (r) => Utils.escapeHtml(customerName(r.customerId)), value: (r) => customerName(r.customerId) },
            { label: 'Data', render: (r) => Utils.formatDate(r.date), value: (r) => Utils.formatDate(r.date) },
            { label: 'Valor', render: (r) => Utils.formatCurrency(r.total), value: (r) => Utils.formatCurrency(r.total) },
            { label: 'Status', render: (r) => statusBadge(SALE_STATUS, r.status), value: (r) => statusLabel(SALE_STATUS, r.status) },
          ],
          emptyMessage: 'Nenhuma venda encontrada no período selecionado.',
        };
      },
    },
    {
      id: 'financeiro', label: 'Relatório financeiro', icon: 'fa-sack-dollar', fileBase: 'relatorio-financeiro', needsPeriod: true,
      compute(from, to) {
        const flow = FinancialService.computeCashFlow(from, to);
        const rows = [
          ...flow.inflow.map((e) => Object.assign({}, e, { kind: 'entrada' })),
          ...flow.outflow.map((e) => Object.assign({}, e, { kind: 'saida' })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        const summaryHtml = `
          <div class="summary-cards">
            <div class="summary-card"><div class="sc-label">Entradas no período</div><div class="sc-value" style="color:var(--success-600)">${Utils.formatCurrency(flow.totalIn)}</div></div>
            <div class="summary-card"><div class="sc-label">Saídas no período</div><div class="sc-value" style="color:var(--danger-600)">${Utils.formatCurrency(flow.totalOut)}</div></div>
            <div class="summary-card"><div class="sc-label">Saldo do período</div><div class="sc-value" style="color:${flow.saldo >= 0 ? 'var(--success-600)' : 'var(--danger-600)'}">${Utils.formatCurrency(flow.saldo)}</div></div>
          </div>`;
        return {
          rows, summaryHtml,
          columns: [
            { label: 'Data', render: (r) => Utils.formatDate(r.date), value: (r) => Utils.formatDate(r.date) },
            { label: 'Descrição', render: (r) => Utils.escapeHtml(r.label), value: (r) => r.label },
            { label: 'Tipo', render: (r) => `<span class="badge ${r.kind === 'entrada' ? 'badge-success' : 'badge-danger'}">${r.kind === 'entrada' ? 'Entrada' : 'Saída'}</span>`, value: (r) => (r.kind === 'entrada' ? 'Entrada' : 'Saída') },
            { label: 'Valor', render: (r) => Utils.formatCurrency(r.amount), value: (r) => Utils.formatCurrency(r.amount) },
          ],
          emptyMessage: 'Nenhum lançamento realizado no período selecionado.',
        };
      },
    },
    {
      id: 'top-produtos', label: 'Produtos mais vendidos', icon: 'fa-ranking-star', fileBase: 'produtos-mais-vendidos', needsPeriod: true,
      compute(from, to) {
        const sales = SalesService.getAll().filter((s) => s.status !== 'cancelado' && s.date >= from && s.date <= to);
        const agg = {};
        sales.forEach((s) => s.items.forEach((it) => {
          const key = it.productId;
          if (!agg[key]) agg[key] = { name: it.productName || '—', qty: 0, total: 0 };
          agg[key].qty += Number(it.qty) || 0;
          agg[key].total += (Number(it.qty) || 0) * (Number(it.unitPrice) || 0) - (Number(it.discount) || 0);
        }));
        const rows = Object.values(agg).sort((a, b) => b.qty - a.qty);
        return {
          rows,
          columns: [
            { label: 'Produto', render: (r) => Utils.escapeHtml(r.name), value: (r) => r.name },
            { label: 'Quantidade vendida', render: (r) => Utils.formatNumber(r.qty), value: (r) => Utils.formatNumber(r.qty) },
            { label: 'Valor total', render: (r) => Utils.formatCurrency(r.total), value: (r) => Utils.formatCurrency(r.total) },
          ],
          emptyMessage: 'Nenhuma venda encontrada no período selecionado.',
        };
      },
    },
    {
      id: 'estoque', label: 'Relatório de estoque', icon: 'fa-boxes-stacked', fileBase: 'relatorio-estoque', needsPeriod: false,
      compute() {
        const rows = ProductService.getAll();
        return {
          rows,
          columns: [
            { label: 'Produto', render: (r) => Utils.escapeHtml(r.name), value: (r) => r.name },
            { label: 'Categoria', render: (r) => Utils.escapeHtml(ProductService.categoryName(r.categoryId)), value: (r) => ProductService.categoryName(r.categoryId) },
            { label: 'Estoque atual', render: (r) => Utils.formatNumber(r.currentStock), value: (r) => Utils.formatNumber(r.currentStock) },
            { label: 'Estoque mínimo', render: (r) => Utils.formatNumber(r.minStock), value: (r) => Utils.formatNumber(r.minStock) },
            {
              label: 'Status',
              render: (r) => { const low = Number(r.currentStock) <= Number(r.minStock); return `<span class="stock-dot ${low ? 'low' : 'ok'}"></span>${low ? 'Baixo' : 'Regular'}`; },
              value: (r) => (Number(r.currentStock) <= Number(r.minStock) ? 'Baixo' : 'Regular'),
            },
          ],
          emptyMessage: 'Nenhum produto cadastrado.',
        };
      },
    },
    {
      id: 'clientes', label: 'Relatório de clientes', icon: 'fa-users', fileBase: 'relatorio-clientes', needsPeriod: true,
      compute(from, to) {
        const rows = CustomerService.getAll().filter((c) => {
          const d = String(c.createdAt || '').slice(0, 10);
          return d >= from && d <= to;
        });
        return {
          rows,
          columns: [
            { label: 'Código', render: (r) => Utils.escapeHtml(r.code), value: (r) => r.code },
            { label: 'Nome', render: (r) => Utils.escapeHtml(r.name), value: (r) => r.name },
            { label: 'Cidade', render: (r) => Utils.escapeHtml(r.city || '—'), value: (r) => r.city || '—' },
            { label: 'Estado', render: (r) => Utils.escapeHtml(r.state || '—'), value: (r) => r.state || '—' },
            { label: 'Status', render: (r) => (r.status === 'ativo' ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-neutral">Inativo</span>'), value: (r) => (r.status === 'ativo' ? 'Ativo' : 'Inativo') },
          ],
          emptyMessage: 'Nenhum cliente cadastrado no período selecionado.',
        };
      },
    },
    {
      id: 'compras', label: 'Relatório de compras', icon: 'fa-truck-fast', fileBase: 'relatorio-compras', needsPeriod: true,
      compute(from, to) {
        const rows = PurchaseService.getAll().filter((p) => p.date >= from && p.date <= to);
        return {
          rows,
          columns: [
            { label: 'Número', render: (r) => Utils.escapeHtml(r.number), value: (r) => r.number },
            { label: 'Fornecedor', render: (r) => Utils.escapeHtml(supplierName(r.supplierId)), value: (r) => supplierName(r.supplierId) },
            { label: 'Data', render: (r) => Utils.formatDate(r.date), value: (r) => Utils.formatDate(r.date) },
            { label: 'Valor', render: (r) => Utils.formatCurrency(r.total), value: (r) => Utils.formatCurrency(r.total) },
            { label: 'Situação', render: (r) => statusBadge(PURCHASE_STATUS, r.status), value: (r) => statusLabel(PURCHASE_STATUS, r.status) },
          ],
          emptyMessage: 'Nenhuma compra encontrada no período selecionado.',
        };
      },
    },
    {
      id: 'contas-pagar', label: 'Contas a pagar', icon: 'fa-file-invoice', fileBase: 'contas-a-pagar', needsPeriod: true,
      compute(from, to) {
        const rows = FinancialService.getPayables().filter((p) => p.dueDate >= from && p.dueDate <= to);
        return {
          rows,
          columns: [
            { label: 'Descrição', render: (r) => Utils.escapeHtml(r.description), value: (r) => r.description },
            { label: 'Fornecedor', render: (r) => Utils.escapeHtml(supplierName(r.supplierId)), value: (r) => supplierName(r.supplierId) },
            { label: 'Categoria', render: (r) => Utils.escapeHtml(FinancialService.finCategoryName(r.categoryId)), value: (r) => FinancialService.finCategoryName(r.categoryId) },
            { label: 'Valor', render: (r) => Utils.formatCurrency(r.amount), value: (r) => Utils.formatCurrency(r.amount) },
            { label: 'Emissão', render: (r) => Utils.formatDate(r.issueDate), value: (r) => Utils.formatDate(r.issueDate) },
            { label: 'Vencimento', render: (r) => Utils.formatDate(r.dueDate), value: (r) => Utils.formatDate(r.dueDate) },
            { label: 'Pagamento', render: (r) => Utils.formatDate(r.paymentDate), value: (r) => Utils.formatDate(r.paymentDate) },
            { label: 'Forma de pagamento', render: (r) => Utils.escapeHtml(r.paymentMethod || '—'), value: (r) => r.paymentMethod || '—' },
            { label: 'Status', render: (r) => statusBadge(PAYABLE_STATUS, r.effectiveStatus), value: (r) => statusLabel(PAYABLE_STATUS, r.effectiveStatus) },
          ],
          emptyMessage: 'Nenhuma conta a pagar com vencimento no período selecionado.',
        };
      },
    },
    {
      id: 'contas-receber', label: 'Contas a receber', icon: 'fa-file-invoice-dollar', fileBase: 'contas-a-receber', needsPeriod: true,
      compute(from, to) {
        const rows = FinancialService.getReceivables().filter((r) => r.dueDate >= from && r.dueDate <= to);
        return {
          rows,
          columns: [
            { label: 'Cliente', render: (r) => Utils.escapeHtml(customerName(r.customerId)), value: (r) => customerName(r.customerId) },
            { label: 'Descrição', render: (r) => Utils.escapeHtml(r.description), value: (r) => r.description },
            { label: 'Valor', render: (r) => Utils.formatCurrency(r.amount), value: (r) => Utils.formatCurrency(r.amount) },
            { label: 'Emissão', render: (r) => Utils.formatDate(r.issueDate), value: (r) => Utils.formatDate(r.issueDate) },
            { label: 'Vencimento', render: (r) => Utils.formatDate(r.dueDate), value: (r) => Utils.formatDate(r.dueDate) },
            { label: 'Recebimento', render: (r) => Utils.formatDate(r.receiptDate), value: (r) => Utils.formatDate(r.receiptDate) },
            { label: 'Forma de pagamento', render: (r) => Utils.escapeHtml(r.paymentMethod || '—'), value: (r) => r.paymentMethod || '—' },
            { label: 'Status', render: (r) => statusBadge(RECEIVABLE_STATUS, r.effectiveStatus), value: (r) => statusLabel(RECEIVABLE_STATUS, r.effectiveStatus) },
          ],
          emptyMessage: 'Nenhuma conta a receber com vencimento no período selecionado.',
        };
      },
    },
  ];

  // ---------------------------------------------------------------------
  // Estado e elementos
  // ---------------------------------------------------------------------
  const els = {
    menu: document.getElementById('reportsMenu'),
    filterFrom: document.getElementById('filterFrom'),
    filterTo: document.getElementById('filterTo'),
    periodShortcuts: document.getElementById('periodShortcuts'),
    reportNote: document.getElementById('reportNote'),
    printTitle: document.getElementById('printReportTitle'),
    printPeriod: document.getElementById('printReportPeriod'),
    summaryArea: document.getElementById('summaryArea'),
    tableContainer: document.getElementById('tableContainer'),
    btnPrint: document.getElementById('btnPrint'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnExportPdf: document.getElementById('btnExportPdf'),
  };

  const state = { reportId: 'vendas', currentDef: null, currentResult: null };

  function renderMenu() {
    els.menu.innerHTML = REPORTS.map((r) => `
      <button type="button" class="report-nav-btn ${r.id === state.reportId ? 'active' : ''}" data-report="${r.id}">
        <i class="fa-solid ${r.icon}"></i> ${Utils.escapeHtml(r.label)}
      </button>`).join('');
    els.menu.querySelectorAll('.report-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.reportId = btn.dataset.report;
        renderMenu();
        renderReport();
      });
    });
  }

  function setPeriod(from, to) {
    els.filterFrom.value = from;
    els.filterTo.value = to;
  }

  function currentPeriod() {
    return { from: els.filterFrom.value || Utils.todayISO(), to: els.filterTo.value || Utils.todayISO() };
  }

  function renderReport() {
    const def = REPORTS.find((r) => r.id === state.reportId);
    const period = currentPeriod();
    const usesPeriod = def.needsPeriod !== false;

    els.filterFrom.disabled = !usesPeriod;
    els.filterTo.disabled = !usesPeriod;
    els.periodShortcuts.querySelectorAll('button').forEach((b) => { b.disabled = !usesPeriod; });
    els.reportNote.hidden = usesPeriod;
    if (!usesPeriod) els.reportNote.textContent = 'Este relatório mostra a posição atual do estoque e não utiliza filtro de período.';

    const result = usesPeriod ? def.compute(period.from, period.to) : def.compute();

    els.printTitle.textContent = def.label;
    els.printPeriod.textContent = usesPeriod ? `Período: ${Utils.formatDate(period.from)} a ${Utils.formatDate(period.to)}` : `Posição em ${Utils.formatDate(Utils.todayISO())}`;
    els.summaryArea.innerHTML = result.summaryHtml || '';

    createDataTable(els.tableContainer, {
      columns: result.columns.map((c, i) => ({ key: String(i), label: c.label, render: c.render })),
      pageSize: 1000,
      emptyMessage: result.emptyMessage,
      emptyIcon: def.icon,
    }).setData(result.rows);

    state.currentDef = def;
    state.currentResult = result;
  }

  function bindPeriodControls() {
    els.filterFrom.addEventListener('change', renderReport);
    els.filterTo.addEventListener('change', renderReport);
    els.periodShortcuts.querySelectorAll('[data-shortcut]').forEach((btn) => {
      btn.addEventListener('click', () => {
        let range;
        if (btn.dataset.shortcut === 'month') range = monthRange(0);
        else if (btn.dataset.shortcut === 'lastMonth') range = monthRange(-1);
        else range = yearRange();
        setPeriod(range.from, range.to);
        renderReport();
      });
    });
  }

  function exportCsv() {
    const { currentDef: def, currentResult: result } = state;
    if (!result || result.rows.length === 0) { Toast.show('Não há dados para exportar neste período.', 'warning'); return; }
    const headers = result.columns.map((c) => ({ label: c.label, value: c.value }));
    const csv = Utils.toCSV(result.rows, headers);
    Utils.downloadFile(`${def.fileBase}.csv`, csv, 'text/csv;charset=utf-8');
    Toast.show('Arquivo CSV exportado com sucesso.', 'success');
  }

  function exportPdf() {
    const { currentDef: def, currentResult: result } = state;
    if (!result || result.rows.length === 0) { Toast.show('Não há dados para exportar neste período.', 'warning'); return; }
    if (!window.jspdf) { Toast.show('Não foi possível carregar o gerador de PDF.', 'error'); return; }
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(14);
    doc.text(def.label, 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(els.printPeriod.textContent, 14, 22);
    doc.autoTable({
      startY: 28,
      head: [result.columns.map((c) => c.label)],
      body: result.rows.map((row) => result.columns.map((c) => c.value(row))),
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [21, 41, 66] },
    });
    doc.save(`${def.fileBase}.pdf`);
    Toast.show('Arquivo PDF exportado com sucesso.', 'success');
  }

  function bindActions() {
    els.btnPrint.addEventListener('click', () => window.print());
    els.btnExportCsv.addEventListener('click', exportCsv);
    els.btnExportPdf.addEventListener('click', exportPdf);
  }

  renderMenu();
  setPeriod(monthRange(0).from, monthRange(0).to);
  bindPeriodControls();
  bindActions();
  renderReport();
})();
