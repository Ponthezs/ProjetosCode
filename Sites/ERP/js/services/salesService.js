/**
 * salesService.js — regras de negócio de Vendas: cálculo de totais, baixa de
 * estoque quando a venda é confirmada e geração da conta a receber
 * correspondente.
 */
const SalesService = (() => {
  const COL = COLLECTIONS.SALES;
  const STOCK_AFFECTING_STATUSES = ['pago', 'finalizado'];

  function getAll() { return StorageService.getAll(COL).sort((a, b) => new Date(b.date) - new Date(a.date)); }
  function getById(id) { return StorageService.getById(COL, id); }

  function computeTotals(items, overallDiscount = 0) {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.unitPrice) - Number(it.discount || 0)), 0);
    const total = Math.max(0, Math.round((subtotal - Number(overallDiscount || 0)) * 100) / 100);
    return { subtotal: Math.round(subtotal * 100) / 100, total };
  }

  function _applyStockForItems(items, direction) {
    // direction: 1 dá entrada (cancelamento devolve estoque), -1 dá saída (confirma venda)
    items.forEach((it) => StockService.create({
      productId: it.productId, quantity: it.qty, type: direction === -1 ? 'saida' : 'entrada',
      reason: direction === -1 ? 'Baixa automática por venda' : 'Estorno automático por cancelamento de venda',
      responsibleUserId: (Auth.currentUser() || {}).userId,
    }));
  }

  function _ensureReceivable(sale) {
    const existing = FinancialService.getReceivables().find((r) => r.sourceSaleId === sale.id);
    if (existing) return existing;
    const immediate = ['Pix', 'Cartão de débito', 'Cartão de crédito', 'Dinheiro'].includes(sale.paymentMethod);
    const finCategories = FinancialService.getFinCategories();
    const cat = finCategories.find((c) => c.name === 'Venda de produtos') || finCategories[0];
    return FinancialService.createReceivable({
      customerId: sale.customerId, description: `Venda ${sale.number}`, categoryId: cat ? cat.id : null,
      amount: sale.total, issueDate: sale.date, dueDate: immediate ? sale.date : Utils.addDaysISO(sale.date, 30), paymentMethod: sale.paymentMethod,
      status: immediate ? 'recebido' : 'pendente', receiptDate: immediate ? sale.date : null, sourceSaleId: sale.id,
    });
  }

  function create(data) {
    if (!data.customerId) throw new Error('Selecione um cliente.');
    if (!data.items || data.items.length === 0) throw new Error('Adicione ao menos um produto à venda.');
    const { subtotal, total } = computeTotals(data.items, data.discount);
    const number = `VD${Utils.pad(getAll().length + 1, 4)}`;
    const record = StorageService.insert(COL, {
      number, customerId: data.customerId, date: data.date || Utils.todayISO(), sellerId: data.sellerId,
      paymentMethod: data.paymentMethod, items: data.items, subtotal, discount: Number(data.discount) || 0, total,
      status: data.status || 'pendente', notes: data.notes || '',
    });

    if (STOCK_AFFECTING_STATUSES.includes(record.status)) {
      _applyStockForItems(record.items, -1);
      _ensureReceivable(record);
    }
    if (window.NotificationService) NotificationService.notifyNewSale(record);
    return record;
  }

  /** Edita uma venda ainda em orçamento/pendente (não afeta estoque, pois essas situações não deram baixa). */
  function update(id, data) {
    const sale = getById(id);
    if (!sale) throw new Error('Venda não encontrada.');
    if (STOCK_AFFECTING_STATUSES.includes(sale.status)) throw new Error('Vendas pagas ou finalizadas não podem ser editadas. Cancele e crie uma nova venda, se necessário.');
    if (!data.items || data.items.length === 0) throw new Error('Adicione ao menos um produto à venda.');
    const { subtotal, total } = computeTotals(data.items, data.discount);
    const patch = {
      customerId: data.customerId, date: data.date, sellerId: data.sellerId, paymentMethod: data.paymentMethod,
      items: data.items, subtotal, discount: Number(data.discount) || 0, total, notes: data.notes || '', status: data.status || sale.status,
    };
    const updated = StorageService.update(COL, id, patch);
    if (STOCK_AFFECTING_STATUSES.includes(updated.status)) {
      _applyStockForItems(updated.items, -1);
      _ensureReceivable(updated);
    }
    return updated;
  }

  function updateStatus(id, newStatus) {
    const sale = getById(id);
    if (!sale) throw new Error('Venda não encontrada.');
    const wasAffecting = STOCK_AFFECTING_STATUSES.includes(sale.status);
    const willAffect = STOCK_AFFECTING_STATUSES.includes(newStatus);

    if (!wasAffecting && willAffect) _applyStockForItems(sale.items, -1);
    if (wasAffecting && !willAffect) _applyStockForItems(sale.items, 1);

    const updated = StorageService.update(COL, id, { status: newStatus });
    if (willAffect) _ensureReceivable(updated);
    return updated;
  }

  function remove(id) {
    const sale = getById(id);
    if (!sale) return false;
    if (STOCK_AFFECTING_STATUSES.includes(sale.status)) _applyStockForItems(sale.items, 1);
    return StorageService.remove(COL, id);
  }

  function countInPeriod(fromIso, toIso) {
    return getAll().filter((s) => s.date >= fromIso && s.date <= toIso && s.status !== 'cancelado');
  }

  return { getAll, getById, computeTotals, create, update, updateStatus, remove, countInPeriod };
})();
