/**
 * stockService.js — movimentações de estoque (entrada, saída, ajuste,
 * inventário). Toda alteração de saldo de produto passa por aqui, para que
 * o histórico de movimentações e o saldo do produto nunca fiquem
 * inconsistentes entre si.
 */
const StockService = (() => {
  const COL = COLLECTIONS.STOCK_MOVEMENTS;

  function getAll() { return StorageService.getAll(COL).sort((a, b) => new Date(b.date) - new Date(a.date) || String(b.createdAt).localeCompare(String(a.createdAt))); }
  function getByProduct(productId) { return getAll().filter((m) => m.productId === productId); }

  /**
   * data: { productId, quantity (delta assinado a aplicar no saldo), type,
   *         reason, responsibleUserId, date, meta (opcional, ex.: saldo contado) }
   */
  function create(data) {
    const product = ProductService.getById(data.productId);
    if (!product) throw new Error('Selecione um produto válido.');
    const qty = Number(data.quantity);
    if (!qty) throw new Error('Informe uma quantidade diferente de zero.');
    if (['entrada', 'saida'].includes(data.type) && qty < 0) throw new Error('Para entrada e saída, informe uma quantidade positiva.');

    const delta = data.type === 'saida' ? -Math.abs(qty) : qty;
    const nextStock = Number(product.currentStock) + delta;
    if (nextStock < 0) throw new Error(`Estoque insuficiente. Saldo atual: ${product.currentStock} ${product.unit || 'un.'}.`);

    const movement = StorageService.insert(COL, {
      date: data.date || Utils.todayISO(), productId: data.productId, quantity: delta, type: data.type,
      reason: data.reason || '', responsibleUserId: data.responsibleUserId, meta: data.meta || null,
    });
    ProductService.adjustStock(data.productId, delta);
    return movement;
  }

  function lastMovementDate(productId) {
    const list = getByProduct(productId);
    return list.length ? list[0].date : null;
  }

  return { getAll, getByProduct, create, lastMovementDate };
})();
