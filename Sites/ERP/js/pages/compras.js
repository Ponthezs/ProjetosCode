/**
 * compras.js — listagem de compras e tela de lançamento de nova compra.
 * A entrada de estoque e a geração automática da conta a pagar, quando a
 * compra é confirmada, estão inteiramente em PurchaseService.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'compras' })) return;

  const STATUS_LABELS = { pendente: 'Pendente', confirmada: 'Confirmada', cancelada: 'Cancelada' };
  const STATUS_BADGE = { pendente: 'badge-warning', confirmada: 'badge-success', cancelada: 'badge-danger' };

  const els = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    panelLista: document.getElementById('panelLista'),
    panelNova: document.getElementById('panelNova'),
    search: document.getElementById('searchInput'),
    filterStatus: document.getElementById('filterStatus'),
    filterSupplier: document.getElementById('filterSupplier'),
    filterDateFrom: document.getElementById('filterDateFrom'),
    filterDateTo: document.getElementById('filterDateTo'),
    tableCompras: document.getElementById('tableContainerCompras'),
    purchaseFormTitle: document.getElementById('purchaseFormTitle'),
    purchaseSupplier: document.getElementById('purchaseSupplier'),
    purchaseDate: document.getElementById('purchaseDate'),
    purchasePayment: document.getElementById('purchasePayment'),
    purchaseStatus: document.getElementById('purchaseStatus'),
    purchaseNotes: document.getElementById('purchaseNotes'),
    purchaseItemsBody: document.getElementById('purchaseItemsBody'),
    btnAddItem: document.getElementById('btnAddItem'),
    purchaseTotalOut: document.getElementById('purchaseTotalOut'),
    btnCancelPurchase: document.getElementById('btnCancelPurchase'),
    btnSavePurchase: document.getElementById('btnSavePurchase'),
  };

  let purchasesTable;
  let purchaseItems = [];
  let editingPurchaseId = null;

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
        if (btn.dataset.tab === 'nova') resetPurchaseForm();
        setActiveTab(btn.dataset.tab);
      });
    });
  }

  // ---------------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------------
  function supplierName(id) { const s = SupplierService.getById(id); return s ? s.name : '—'; }
  function responsibleName(id) { const u = UserService.getById(id); return u ? u.name : '—'; }
  function statusBadge(status) { return `<span class="badge ${STATUS_BADGE[status] || 'badge-neutral'}">${STATUS_LABELS[status] || status}</span>`; }

  function viewField(label, value, full) {
    return `<div class="view-item${full ? ' full' : ''}"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  // ---------------------------------------------------------------------
  // Aba: Lista de compras
  // ---------------------------------------------------------------------
  function refreshSupplierFilterOptions() {
    const current = els.filterSupplier.value;
    const suppliers = SupplierService.getAll();
    els.filterSupplier.innerHTML = '<option value="">Fornecedor (todos)</option>' +
      suppliers.map((s) => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`).join('');
    if (suppliers.some((s) => String(s.id) === current)) els.filterSupplier.value = current;
  }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const status = els.filterStatus.value;
    const supplierId = els.filterSupplier.value;
    const from = els.filterDateFrom.value;
    const to = els.filterDateTo.value;

    const filtered = PurchaseService.getAll().filter((p) => {
      if (status && p.status !== status) return false;
      if (supplierId && String(p.supplierId) !== supplierId) return false;
      if (from && p.date < from) return false;
      if (to && p.date > to) return false;
      if (term) {
        const haystack = `${p.number} ${supplierName(p.supplierId)}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    purchasesTable.setData(filtered);
  }

  function openView(purchase) {
    const itemsHtml = purchase.items.map((it) => `
      <tr>
        <td>${Utils.escapeHtml(it.productName)}</td>
        <td style="text-align:right">${Utils.formatNumber(it.qty)}</td>
        <td style="text-align:right">${Utils.formatCurrency(it.unitCost)}</td>
        <td style="text-align:right">${Utils.formatCurrency(it.qty * it.unitCost)}</td>
      </tr>`).join('');
    const bodyHtml = `
      <div class="view-grid">
        ${viewField('Número', purchase.number)}
        ${viewField('Fornecedor', supplierName(purchase.supplierId))}
        ${viewField('Data', Utils.formatDate(purchase.date))}
        ${viewField('Forma de pagamento', purchase.paymentMethod)}
        ${viewField('Situação', STATUS_LABELS[purchase.status] || purchase.status)}
        ${viewField('Responsável', responsibleName(purchase.responsibleUserId))}
      </div>
      <div class="view-section-title">Itens</div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Produto</th><th style="text-align:right">Qtd.</th><th style="text-align:right">Valor unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
      <div class="purchase-totals" style="margin-top:var(--space-4);margin-left:auto">
        <div class="totals-row total"><span>Total</span><strong>${Utils.formatCurrency(purchase.total)}</strong></div>
      </div>
      ${purchase.notes ? `<div class="view-section-title">Observações</div><div class="view-value">${Utils.escapeHtml(purchase.notes)}</div>` : ''}`;
    const inst = Modal.open({
      title: `Compra ${purchase.number}`, bodyHtml, size: 'lg',
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  async function handleConfirm(purchase) {
    const ok = await Modal.confirm({
      title: 'Confirmar compra',
      message: 'Confirmar esta compra vai dar entrada no estoque dos produtos e gerar a conta a pagar correspondente. Deseja continuar?',
      confirmText: 'Confirmar compra', danger: false,
    });
    if (!ok) return;
    try {
      PurchaseService.updateStatus(purchase.id, 'confirmada');
      Toast.show('Compra confirmada com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  async function handleCancel(purchase) {
    const message = purchase.status === 'confirmada'
      ? 'Tem certeza que deseja cancelar esta compra? O estoque que deu entrada será estornado automaticamente.'
      : 'Tem certeza que deseja cancelar esta compra?';
    const ok = await Modal.confirm({ title: 'Cancelar compra', message, confirmText: 'Cancelar compra' });
    if (!ok) return;
    try {
      PurchaseService.updateStatus(purchase.id, 'cancelada');
      Toast.show('Compra cancelada com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  async function handleDelete(purchase) {
    const ok = await Modal.confirm({
      title: 'Excluir compra',
      message: `Tem certeza que deseja excluir a compra "${Utils.escapeHtml(purchase.number)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      PurchaseService.remove(purchase.id);
      Toast.show('Compra excluída com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildPurchasesTable() {
    purchasesTable = createDataTable(els.tableCompras, {
      columns: [
        { key: 'number', label: 'Número', sortable: true },
        { key: 'supplierId', label: 'Fornecedor', sortable: true, sortValue: (p) => supplierName(p.supplierId), render: (p) => Utils.escapeHtml(supplierName(p.supplierId)) },
        { key: 'date', label: 'Data', sortable: true, render: (p) => Utils.formatDate(p.date) },
        { key: 'total', label: 'Valor', align: 'right', sortable: true, render: (p) => Utils.formatCurrency(p.total) },
        { key: 'status', label: 'Situação', sortable: true, render: (p) => statusBadge(p.status) },
        { key: 'responsibleUserId', label: 'Responsável', sortable: true, sortValue: (p) => responsibleName(p.responsibleUserId), render: (p) => Utils.escapeHtml(responsibleName(p.responsibleUserId)) },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-pen', label: 'Editar', show: (p) => p.status === 'pendente', onClick: (p) => enterEditMode(p) },
        { icon: 'fa-check', label: 'Confirmar', show: (p) => p.status === 'pendente', onClick: handleConfirm },
        { icon: 'fa-ban', label: 'Cancelar', show: (p) => p.status !== 'cancelada', onClick: handleCancel },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'date',
      defaultSortDir: 'desc',
      emptyMessage: 'Nenhuma compra encontrada.',
      emptyIcon: 'fa-truck-fast',
    });
  }

  // ---------------------------------------------------------------------
  // Aba: Nova compra
  // ---------------------------------------------------------------------
  function refreshFormSelects(extra) {
    extra = extra || {};
    let suppliers = SupplierService.getAll().filter((s) => s.status === 'ativo');
    if (extra.supplierId && !suppliers.some((s) => s.id === extra.supplierId)) {
      const s = SupplierService.getById(extra.supplierId);
      if (s) suppliers = suppliers.concat([s]);
    }
    els.purchaseSupplier.innerHTML = '<option value="">Selecione</option>' +
      suppliers.map((s) => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`).join('');
  }

  function addItemRow(initial) {
    purchaseItems.push({
      _rowId: Utils.uid('item'),
      productId: (initial && initial.productId) || '',
      qty: (initial && initial.qty) || 1,
      unitCost: (initial && initial.unitCost) || 0,
    });
    renderItems();
  }

  function renderItems() {
    const products = ProductService.getAll();
    if (purchaseItems.length === 0) {
      els.purchaseItemsBody.innerHTML = '<tr><td colspan="5"><div class="empty-items-hint">Nenhum item adicionado. Clique em "Adicionar item".</div></td></tr>';
    } else {
      els.purchaseItemsBody.innerHTML = purchaseItems.map((it) => `
        <tr data-row-id="${it._rowId}">
          <td><select class="input" data-role="product">
            <option value="">Selecione</option>
            ${products.map((p) => `<option value="${p.id}" ${String(p.id) === String(it.productId) ? 'selected' : ''}>${Utils.escapeHtml(p.name)}</option>`).join('')}
          </select></td>
          <td><input class="input" type="number" min="1" step="1" data-role="qty" value="${it.qty}"></td>
          <td><input class="input" type="number" min="0" step="0.01" data-role="cost" value="${it.unitCost}"></td>
          <td style="text-align:right" data-role="subtotal">${Utils.formatCurrency(it.qty * it.unitCost)}</td>
          <td><button type="button" class="btn btn-icon btn-ghost" data-role="remove" data-tooltip="Remover"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>`).join('');
    }
    bindItemRowEvents();
  }

  function bindItemRowEvents() {
    els.purchaseItemsBody.querySelectorAll('tr[data-row-id]').forEach((tr) => {
      const rowId = tr.dataset.rowId;
      const item = purchaseItems.find((it) => it._rowId === rowId);
      if (!item) return;
      const productSel = tr.querySelector('[data-role="product"]');
      const qtyInput = tr.querySelector('[data-role="qty"]');
      const costInput = tr.querySelector('[data-role="cost"]');
      const subtotalCell = tr.querySelector('[data-role="subtotal"]');
      const removeBtn = tr.querySelector('[data-role="remove"]');

      productSel.addEventListener('change', () => {
        item.productId = productSel.value;
        const product = ProductService.getById(item.productId);
        if (product) { item.unitCost = Number(product.costPrice) || 0; costInput.value = item.unitCost; }
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitCost);
        updateTotal();
      });
      qtyInput.addEventListener('input', () => {
        item.qty = Number(qtyInput.value) || 0;
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitCost);
        updateTotal();
      });
      costInput.addEventListener('input', () => {
        item.unitCost = Number(costInput.value) || 0;
        subtotalCell.textContent = Utils.formatCurrency(item.qty * item.unitCost);
        updateTotal();
      });
      removeBtn.addEventListener('click', () => {
        purchaseItems = purchaseItems.filter((it) => it._rowId !== rowId);
        renderItems();
        updateTotal();
      });
    });
  }

  function updateTotal() {
    const validItems = purchaseItems.filter((it) => it.productId).map((it) => ({ qty: it.qty, unitCost: it.unitCost }));
    const total = PurchaseService.computeTotal(validItems);
    els.purchaseTotalOut.textContent = Utils.formatCurrency(total);
  }

  function resetPurchaseForm() {
    editingPurchaseId = null;
    els.purchaseFormTitle.textContent = 'Nova compra';
    els.btnSavePurchase.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar compra';
    refreshFormSelects();
    els.purchaseSupplier.value = '';
    els.purchaseDate.value = Utils.todayISO();
    els.purchasePayment.value = 'Boleto';
    els.purchaseStatus.value = 'pendente';
    els.purchaseNotes.value = '';
    purchaseItems = [];
    addItemRow();
    updateTotal();
  }

  function enterEditMode(purchase) {
    editingPurchaseId = purchase.id;
    els.purchaseFormTitle.textContent = `Editar compra — ${purchase.number}`;
    els.btnSavePurchase.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
    refreshFormSelects({ supplierId: purchase.supplierId });
    els.purchaseSupplier.value = purchase.supplierId;
    els.purchaseDate.value = purchase.date;
    els.purchasePayment.value = purchase.paymentMethod;
    els.purchaseStatus.value = purchase.status;
    els.purchaseNotes.value = purchase.notes || '';
    purchaseItems = purchase.items.map((it) => ({ _rowId: Utils.uid('item'), productId: it.productId, qty: it.qty, unitCost: it.unitCost }));
    renderItems();
    updateTotal();
    setActiveTab('nova');
  }

  async function handleSavePurchase() {
    const supplierId = els.purchaseSupplier.value;
    const validItems = purchaseItems.filter((it) => it.productId);
    if (!supplierId) { Toast.show('Selecione um fornecedor.', 'error'); return; }
    if (validItems.length === 0) { Toast.show('Adicione ao menos um produto à compra.', 'error'); return; }

    const payload = {
      supplierId,
      date: els.purchaseDate.value || Utils.todayISO(),
      paymentMethod: els.purchasePayment.value,
      status: els.purchaseStatus.value,
      notes: els.purchaseNotes.value,
      items: validItems.map((it) => ({
        productId: it.productId,
        productName: (ProductService.getById(it.productId) || {}).name || '',
        qty: Number(it.qty) || 0,
        unitCost: Number(it.unitCost) || 0,
      })),
    };

    try {
      if (editingPurchaseId) {
        PurchaseService.update(editingPurchaseId, payload);
        Toast.show('Compra atualizada com sucesso.', 'success');
      } else {
        PurchaseService.create(payload);
        Toast.show('Compra cadastrada com sucesso.', 'success');
      }
      resetPurchaseForm();
      refreshSupplierFilterOptions();
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
    els.filterSupplier.addEventListener('change', applyFilters);
    els.filterDateFrom.addEventListener('change', applyFilters);
    els.filterDateTo.addEventListener('change', applyFilters);

    els.btnAddItem.addEventListener('click', () => addItemRow());
    els.btnCancelPurchase.addEventListener('click', () => { resetPurchaseForm(); setActiveTab('lista'); });
    els.btnSavePurchase.addEventListener('click', handleSavePurchase);
  }

  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  bindTabs();
  buildPurchasesTable();
  bindEvents();
  refreshSupplierFilterOptions();
  resetPurchaseForm();
  applyGlobalSearchQuery();
  applyFilters();
  setActiveTab('lista');
})();
