/**
 * purchaseService.js — regras de negócio de Compras: ao confirmar uma
 * compra, o estoque dos produtos é atualizado automaticamente e a conta a
 * pagar correspondente é gerada.
 */
const PurchaseService = (() => {
  const COL = COLLECTIONS.PURCHASES;
  const STOCK_AFFECTING_STATUSES = ['confirmada'];

  function getAll() { return StorageService.getAll(COL).sort((a, b) => new Date(b.date) - new Date(a.date)); }
  function getById(id) { return StorageService.getById(COL, id); }

  function computeTotal(items) {
    return Math.round(items.reduce((sum, it) => sum + Number(it.qty) * Number(it.unitCost), 0) * 100) / 100;
  }

  function _applyStockForItems(items, direction) {
    items.forEach((it) => StockService.create({
      productId: it.productId, quantity: it.qty, type: direction === 1 ? 'entrada' : 'saida',
      reason: direction === 1 ? 'Entrada automática por compra confirmada' : 'Estorno automático por cancelamento de compra',
      responsibleUserId: (Auth.currentUser() || {}).userId,
    }));
  }

  function _ensurePayable(purchase) {
    const existing = FinancialService.getPayables().find((p) => p.sourcePurchaseId === purchase.id);
    if (existing) return existing;
    const finCategories = FinancialService.getFinCategories();
    const cat = finCategories.find((c) => c.name === 'Fornecedores') || finCategories[0];
    const immediate = ['Pix', 'Dinheiro'].includes(purchase.paymentMethod);
    return FinancialService.createPayable({
      description: `Compra ${purchase.number}`, supplierId: purchase.supplierId, categoryId: cat ? cat.id : null,
      amount: purchase.total, issueDate: purchase.date, dueDate: immediate ? purchase.date : Utils.addDaysISO(purchase.date, 30),
      paymentMethod: purchase.paymentMethod, status: immediate ? 'pago' : 'pendente',
      paymentDate: immediate ? purchase.date : null, sourcePurchaseId: purchase.id,
    });
  }

  function create(data) {
    if (!data.supplierId) throw new Error('Selecione um fornecedor.');
    if (!data.items || data.items.length === 0) throw new Error('Adicione ao menos um produto à compra.');
    const total = computeTotal(data.items);
    const number = `CP${Utils.pad(getAll().length + 1, 4)}`;
    const record = StorageService.insert(COL, {
      number, supplierId: data.supplierId, date: data.date || Utils.todayISO(), items: data.items, total,
      status: data.status || 'pendente', paymentMethod: data.paymentMethod, responsibleUserId: (Auth.currentUser() || {}).userId, notes: data.notes || '',
    });
    if (STOCK_AFFECTING_STATUSES.includes(record.status)) {
      _applyStockForItems(record.items, 1);
      _ensurePayable(record);
    }
    return record;
  }

  /** Edita uma compra ainda pendente (compras confirmadas já refletiram no estoque e não devem ser editadas). */
  function update(id, data) {
    const purchase = getById(id);
    if (!purchase) throw new Error('Compra não encontrada.');
    if (STOCK_AFFECTING_STATUSES.includes(purchase.status)) throw new Error('Compras confirmadas não podem ser editadas.');
    if (!data.items || data.items.length === 0) throw new Error('Adicione ao menos um produto à compra.');
    const total = computeTotal(data.items);
    const patch = { supplierId: data.supplierId, date: data.date, items: data.items, total, paymentMethod: data.paymentMethod, notes: data.notes || '', status: data.status || purchase.status };
    const updated = StorageService.update(COL, id, patch);
    if (STOCK_AFFECTING_STATUSES.includes(updated.status)) { _applyStockForItems(updated.items, 1); _ensurePayable(updated); }
    return updated;
  }

  function updateStatus(id, newStatus) {
    const purchase = getById(id);
    if (!purchase) throw new Error('Compra não encontrada.');
    const was = STOCK_AFFECTING_STATUSES.includes(purchase.status);
    const will = STOCK_AFFECTING_STATUSES.includes(newStatus);
    if (!was && will) _applyStockForItems(purchase.items, 1);
    if (was && !will) _applyStockForItems(purchase.items, -1);
    const updated = StorageService.update(COL, id, { status: newStatus });
    if (will) _ensurePayable(updated);
    return updated;
  }

  function remove(id) {
    const purchase = getById(id);
    if (!purchase) return false;
    if (STOCK_AFFECTING_STATUSES.includes(purchase.status)) _applyStockForItems(purchase.items, -1);
    return StorageService.remove(COL, id);
  }

  return { getAll, getById, computeTotal, create, update, updateStatus, remove };
})();
