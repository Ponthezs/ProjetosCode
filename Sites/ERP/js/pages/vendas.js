/**
 * vendas.js — listagem de vendas (orçamentos, pedidos e vendas confirmadas)
 * e tela de lançamento de nova venda. Toda a regra de baixa de estoque e
 * geração automática de conta a receber está em SalesService; esta página
 * apenas monta o payload e chama os métodos do serviço.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'vendas' })) return;

  const STATUS_LABELS = { orcamento: 'Orçamento', pendente: 'Pendente', pago: 'Pago', finalizado: 'Finalizado', cancelado: 'Cancelado' };
  const STATUS_BADGE = { orcamento: 'badge-neutral', pendente: 'badge-warning', pago: 'badge-info', finalizado: 'badge-success', cancelado: 'badge-danger' };
  const STATUS_OPTIONS = Object.keys(STATUS_LABELS).map((value) => ({ value, label: STATUS_LABELS[value] }));

  const els = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    panelLista: document.getElementById('panelLista'),
    panelNova: document.getElementById('panelNova'),
    search: document.getElementById('searchInput'),
    filterStatus: document.getElementById('filterStatus'),
    filterCustomer: document.getElementById('filterCustomer'),
    filterDateFrom: document.getElementById('filterDateFrom'),
    filterDateTo: document.getElementById('filterDateTo'),
    tableVendas: document.getElementById('tableContainerVendas'),
    saleFormTitle: document.getElementById('saleFormTitle'),
    saleCustomer: document.getElementById('saleCustomer'),
    saleDate: document.getElementById('saleDate'),
    saleSeller: document.getElementById('saleSeller'),
    salePayment: document.getElementById('salePayment'),
    saleStatus: document.getElementById('saleStatus'),
    saleNotes: document.getElementById('saleNotes'),
    saleItemsBody: document.getElementById('saleItemsBody'),
    btnAddItem: document.getElementById('btnAddItem'),
    saleDiscount: document.getElementById('saleDiscount'),
    saleSubtotalOut: document.getElementById('saleSubtotalOut'),
    saleDiscountOut: document.getElementById('saleDiscountOut'),
    saleTotalOut: document.getElementById('saleTotalOut'),
    btnCancelSale: document.getElementById('btnCancelSale'),
    btnSaveSale: document.getElementById('btnSaveSale'),
  };

  let salesTable;
  let saleItems = [];
  let editingSaleId = null;

  // ---------------------------------------------------------------------
  // Abas
  // ---------------------------------------------------------------------
  function setActiveTab(tab) {
    els.tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    els.panelLista.hidden = tab !== 'lista';
    els.panelNova.hidden = tab !== 'nova';
  }

  function bindTabs() {
    els.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'nova') resetSaleForm();
        setActiveTab(btn.dataset.tab);
      });
    });
  }

  // ---------------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------------
  function customerName(id) { const c = CustomerService.getById(id); return c ? c.name : '—'; }
  function sellerName(id) { const u = UserService.getById(id); return u ? u.name : '—'; }
  function statusBadge(status) { return `<span class="badge ${STATUS_BADGE[status] || 'badge-neutral'}">${STATUS_LABELS[status] || status}</span>`; }

  function viewField(label, value, full) {
    return `<div class="view-item${full ? ' full' : ''}"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  // ---------------------------------------------------------------------
  // Aba: Lista de vendas
  // ---------------------------------------------------------------------
  function refreshCustomerFilterOptions() {
    const current = els.filterCustomer.value;
    const customers = CustomerService.getAll();
    els.filterCustomer.innerHTML = '<option value="">Cliente (todos)</option>' +
      customers.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');
    if (customers.some((c) => String(c.id) === current)) els.filterCustomer.value = current;
  }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const status = els.filterStatus.value;
    const customerId = els.filterCustomer.value;
    const from = els.filterDateFrom.value;
    const to = els.filterDateTo.value;

    const filtered = SalesService.getAll().filter((s) => {
      if (status && s.status !== status) return false;
      if (customerId && String(s.customerId) !== customerId) return false;
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      if (term) {
        const haystack = `${s.number} ${customerName(s.customerId)}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    salesTable.setData(filtered);
  }

  function renderStatusCell(sale) {
    return `<div class="status-cell">${statusBadge(sale.status)}
      <select class="input" data-status-select="${sale.id}" data-tooltip="Alterar status">
        ${STATUS_OPTIONS.map((o) => `<option value="${o.value}" ${o.value === sale.status ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>
    </div>`;
  }

  function openView(sale) {
    const itemsHtml = sale.items.map((it) => `
      <tr>
        <td>${Utils.escapeHtml(it.productName)}</td>
        <td style="text-align:right">${Utils.formatNumber(it.qty)}</td>
        <td style="text-align:right">${Utils.formatCurrency(it.unitPrice)}</td>
        <td style="text-align:right">${Utils.formatCurrency(it.qty * it.unitPrice - Number(it.discount || 0))}</td>
      </tr>`).join('');
    const bodyHtml = `
      <div class="view-grid">
        ${viewField('Número', sale.number)}
        ${viewField('Cliente', customerName(sale.customerId))}
        ${viewField('Data', Utils.formatDate(sale.date))}
        ${viewField('Vendedor', sellerName(sale.sellerId))}
        ${viewField('Forma de pagamento', sale.paymentMethod)}
        ${viewField('Status', STATUS_LABELS[sale.status] || sale.status)}
      </div>
      <div class="view-section-title">Itens</div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Produto</th><th style="text-align:right">Qtd.</th><th style="text-align:right">Preço unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
      <div class="sale-totals" style="margin-top:var(--space-4)">
        <div class="totals-row"><span>Subtotal</span><strong>${Utils.formatCurrency(sale.subtotal)}</strong></div>
        <div class="totals-row"><span>Desconto</span><strong>${Utils.formatCurrency(sale.discount)}</strong></div>
        <div class="totals-row total"><span>Total</span><strong>${Utils.formatCurrency(sale.total)}</strong></div>
      </div>
      ${sale.notes ? `<div class="view-section-title">Observações</div><div class="view-value">${Utils.escapeHtml(sale.notes)}</div>` : ''}`;
    const inst = Modal.open({
      title: `Venda ${sale.number}`, bodyHtml, size: 'lg',
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  async function handleDelete(sale) {
    const ok = await Modal.confirm({
      title: 'Excluir venda',
      message: `Tem certeza que deseja excluir a venda "${Utils.escapeHtml(sale.number)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      SalesService.remove(sale.id);
      Toast.show('Venda excluída com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  async function handleQuickStatusChange(id, newStatus) {
    const sale = SalesService.getById(id);
    if (!sale || newStatus === sale.status) { applyFilters(); return; }
    if (newStatus === 'cancelado') {
      const ok = await Modal.confirm({
        title: 'Cancelar venda',
        message: 'Tem certeza que deseja cancelar esta venda? Caso o estoque já tenha sido baixado, ele será estornado automaticamente.',
        confirmText: 'Cancelar venda',
      });
      if (!ok) { applyFilters(); return; }
    }
    try {
      SalesService.updateStatus(id, newStatus);
      Toast.show('Status da venda atualizado com sucesso.', 'success');
    } catch (e) {
      Toast.show(e.message, 'error');
    }
    applyFilters();
  }

  function buildSalesTable() {
    salesTable = createDataTable(els.tableVendas, {
      columns: [
        { key: 'number', label: 'Número', sortable: true },
        { key: 'customerId', label: 'Cliente', sortable: true, sortValue: (s) => customerName(s.customerId), render: (s) => Utils.escapeHtml(customerName(s.customerId)) },
        { key: 'date', label: 'Data', sortable: true, render: (s) => Utils.formatDate(s.date) },
        { key: 'sellerId', label: 'Vendedor', sortable: true, sortValue: (s) => sellerName(s.sellerId), render: (s) => Utils.escapeHtml(sellerName(s.sellerId)) },
        { key: 'paymentMethod', label: 'Forma de pagamento' },
        { key: 'total', label: 'Valor', align: 'right', sortable: true, render: (s) => Utils.formatCurrency(s.total) },
        { key: 'status', label: 'Status', sortable: true, render: renderStatusCell },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-pen', label: 'Editar', show: (s) => ['orcamento', 'pendente'].includes(s.status), onClick: (s) => enterEditMode(s) },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'date',
      defaultSortDir: 'desc',
      emptyMessage: 'Nenhuma venda encontrada.',
      emptyIcon: 'fa-cart-shopping',
    });
  }

  // ---------------------------------------------------------------------
  // Aba: Nova venda
  // ---------------------------------------------------------------------
  function refreshFormSelects(extra) {
    extra = extra || {};
    let customers = CustomerService.getAll().filter((c) => c.status === 'ativo');
    if (extra.customerId && !customers.some((c) => c.id === extra.customerId)) {
      const c = CustomerService.getById(extra.customerId);
      if (c) customers = customers.concat([c]);
    }
    els.saleCustomer.innerHTML = '<option value="">Selecione</option>' +
      customers.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');

    let sellers = UserService.getAll().filter((u) => u.status === 'ativo');
    if (extra.sellerId && !sellers.some((u) => u.id === extra.sellerId)) {
      const u = UserService.getById(extra.sellerId);
      if (u) sellers = sellers.concat([u]);
    }
    els.saleSeller.innerHTML = '<option value="">Selecione</option>' +
      sellers.map((u) => `<option value="${u.id}">${Utils.escapeHtml(u.name)}</option>`).join('');
  }

  function addItemRow(initial) {
    saleItems.push({
      _rowId: Utils.uid('item'),
      productId: (initial && initial.productId) || '',
      qty: (initial && initial.qty) || 1,
      unitPrice: (initial && initial.unitPrice) || 0,
    });
    renderItems();
  }

  function renderItems() {
    const products = ProductService.getAll();
    if (saleItems.length === 0) {
      els.saleItemsBody.innerHTML = '<tr><td colspan="5"><div class="empty-items-hint">Nenhum item adicionado. Clique em "Adicionar item".</div></td></tr>';
    } else {
      els.saleItemsBody.innerHTML = saleItems.map((it) => `
        <tr data-row-id="${it._rowId}">
          <td><select class="input" data-role="product">
            <option value="">Selecione</option>
            ${products.map((p) => `<option value="${p.id}" ${String(p.id) === String(it.productId) ? 'selected' : ''}>${Utils.escapeHtml(p.name)}</option>`).join('')}
          </select></td>
          <td><input class="input" type="number" min="1" step="1" data-role="qty" value="${it.qty}"></td>
          <td><input class="input" type="number" min="0" step="0.01" data-role="price" value="${it.unitPrice}"></td>
          <td style="text-align:right" data-role="subtotal">${Utils.formatCurrency(it.qty * it.unitPrice)}</td>
          <td><button type="button" class="btn btn-icon btn-ghost" data-role="remove" data-tooltip="Remover"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>`).join('');
    }
    bindItemRowEvents();
  }

  function bindItemRowEvents() {
    els.saleItemsBody.querySelectorAll('tr[data-row-id]').forEach((tr) => {
      const rowId = tr.dataset.rowId;
      const item = saleItems.find((it) => it._rowId === rowId);
      if (!item) return;
      const productSel = tr.querySelector('[data-role="product"]');
      const qtyInput = tr.querySelector('[data-role="qty"]');
      const priceInput = tr.querySelector('[data-role="price"]');
      const subtotalCell = tr.querySelector('[data-role="subtotal"]');
      const removeBtn = tr.querySelector('[data-role="remove"]');

      productSel.addEventListener('change', () => {
        item.productId = productSel.value;
        const product = ProductService.getById(item.productId);
        if (product) { item.unitPrice = Number(product.salePrice) || 0; priceInput.value = item.unitPrice; }
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitPrice);
        updateSummary();
      });
      qtyInput.addEventListener('input', () => {
        item.qty = Number(qtyInput.value) || 0;
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitPrice);
        updateSummary();
      });
      priceInput.addEventListener('input', () => {
        item.unitPrice = Number(priceInput.value) || 0;
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitPrice);
        updateSummary();
      });
      removeBtn.addEventListener('click', () => {
        saleItems = saleItems.filter((it) => it._rowId !== rowId);
        renderItems();
        updateSummary();
      });
    });
  }

  function updateSummary() {
    const discount = Number(els.saleDiscount.value) || 0;
    const validItems = saleItems.filter((it) => it.productId).map((it) => ({ qty: it.qty, unitPrice: it.unitPrice, discount: 0 }));
    const { subtotal, total } = SalesService.computeTotals(validItems, discount);
    els.saleSubtotalOut.textContent = Utils.formatCurrency(subtotal);
    els.saleDiscountOut.textContent = Utils.formatCurrency(discount);
    els.saleTotalOut.textContent = Utils.formatCurrency(total);
  }

  function resetSaleForm() {
    editingSaleId = null;
    els.saleFormTitle.textContent = 'Nova venda';
    els.btnSaveSale.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar venda';
    refreshFormSelects();
    els.saleCustomer.value = '';
    els.saleDate.value = Utils.todayISO();
    els.saleSeller.value = '';
    els.salePayment.value = 'Pix';
    els.saleStatus.value = 'pendente';
    els.saleNotes.value = '';
    els.saleDiscount.value = 0;
    saleItems = [];
    addItemRow();
    updateSummary();
  }

  function enterEditMode(sale) {
    editingSaleId = sale.id;
    els.saleFormTitle.textContent = `Editar venda — ${sale.number}`;
    els.btnSaveSale.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
    refreshFormSelects({ customerId: sale.customerId, sellerId: sale.sellerId });
    els.saleCustomer.value = sale.customerId;
    els.saleDate.value = sale.date;
    els.saleSeller.value = sale.sellerId || '';
    els.salePayment.value = sale.paymentMethod;
    els.saleStatus.value = sale.status;
    els.saleNotes.value = sale.notes || '';
    els.saleDiscount.value = sale.discount || 0;
    saleItems = sale.items.map((it) => ({ _rowId: Utils.uid('item'), productId: it.productId, qty: it.qty, unitPrice: it.unitPrice }));
    renderItems();
    updateSummary();
    setActiveTab('nova');
  }

  async function handleSaveSale() {
    const customerId = els.saleCustomer.value;
    const validItems = saleItems.filter((it) => it.productId);
    if (!customerId) { Toast.show('Selecione um cliente.', 'error'); return; }
    if (validItems.length === 0) { Toast.show('Adicione ao menos um produto à venda.', 'error'); return; }

    const payload = {
      customerId,
      date: els.saleDate.value || Utils.todayISO(),
      sellerId: els.saleSeller.value || null,
      paymentMethod: els.salePayment.value,
      status: els.saleStatus.value,
      notes: els.saleNotes.value,
      discount: Number(els.saleDiscount.value) || 0,
      items: validItems.map((it) => ({
        productId: it.productId,
        productName: (ProductService.getById(it.productId) || {}).name || '',
        qty: Number(it.qty) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        discount: 0,
      })),
    };

    try {
      if (editingSaleId) {
        SalesService.update(editingSaleId, payload);
        Toast.show('Venda atualizada com sucesso.', 'success');
      } else {
        SalesService.create(payload);
        Toast.show('Venda cadastrada com sucesso.', 'success');
      }
      resetSaleForm();
      refreshCustomerFilterOptions();
      setActiveTab('lista');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  function bindEvents() {
    els.search.addEventListener('input', Utils.debounce(applyFilters, 250));
    els.filterStatus.addEventListener('change', applyFilters);
    els.filterCustomer.addEventListener('change', applyFilters);
    els.filterDateFrom.addEventListener('change', applyFilters);
    els.filterDateTo.addEventListener('change', applyFilters);
    els.tableVendas.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-status-select]');
      if (!sel) return;
      handleQuickStatusChange(sel.dataset.statusSelect, sel.value);
    });

    els.btnAddItem.addEventListener('click', () => addItemRow());
    els.saleDiscount.addEventListener('input', updateSummary);
    els.btnCancelSale.addEventListener('click', () => { resetSaleForm(); setActiveTab('lista'); });
    els.btnSaveSale.addEventListener('click', handleSaveSale);
  }

  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  bindTabs();
  buildSalesTable();
  bindEvents();
  refreshCustomerFilterOptions();
  resetSaleForm();
  applyGlobalSearchQuery();
  applyFilters();
  setActiveTab('lista');
})();
