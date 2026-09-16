/**
 * notifications.js — notificações do sistema (sino do cabeçalho).
 * Combina notificações geradas automaticamente (estoque baixo, contas
 * vencendo) com eventos pontuais (nova venda registrada, etc.).
 */
const NotificationService = (() => {

  function getAll() {
    return StorageService.getAll(COLLECTIONS.NOTIFICATIONS)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function unreadCount() {
    return getAll().filter((n) => !n.read).length;
  }

  function push({ type, message, link = '', dedupeKey = null }) {
    return StorageService.insert(COLLECTIONS.NOTIFICATIONS, {
      type, message, link, dedupeKey, date: new Date().toISOString(), read: false,
    });
  }

  function markRead(id) { return StorageService.update(COLLECTIONS.NOTIFICATIONS, id, { read: true }); }

  function markAllRead() {
    getAll().forEach((n) => { if (!n.read) StorageService.update(COLLECTIONS.NOTIFICATIONS, n.id, { read: true }); });
  }

  function existsForKeyToday(dedupeKey) {
    const todayStr = Utils.todayISO();
    return getAll().some((n) => n.dedupeKey === dedupeKey && String(n.date).slice(0, 10) === todayStr);
  }

  /**
   * Gera notificações automáticas de sistema (idempotente por dia).
   * Deve ser chamada uma vez a cada carregamento de página autenticada.
   */
  function refreshAutomatic() {
    try {
      if (window.ProductService) {
        ProductService.getLowStock().forEach((p) => {
          const key = `estoque-baixo-${p.id}`;
          if (!existsForKeyToday(key)) {
            push({ type: 'estoque', message: `Produto "${p.name}" está com estoque baixo (${p.currentStock} ${p.unit || 'un.'} restantes).`, link: 'produtos.html', dedupeKey: key });
          }
        });
      }
      if (window.FinancialService) {
        FinancialService.getPayables().forEach((c) => {
          if (c.status === 'cancelado' || c.status === 'pago') return;
          const key = `pagar-vence-${c.id}`;
          if (Utils.isDueToday(c.dueDate) && !existsForKeyToday(key)) {
            push({ type: 'financeiro', message: `Conta a pagar de ${Utils.formatCurrency(c.amount)} vence hoje.`, link: 'contas-pagar.html', dedupeKey: key });
          }
        });
        FinancialService.getReceivables().forEach((c) => {
          if (c.status === 'cancelado' || c.status === 'recebido') return;
          const key = `receber-vence-${c.id}`;
          if (Utils.isDueToday(c.dueDate) && !existsForKeyToday(key)) {
            push({ type: 'financeiro', message: `Conta a receber de ${Utils.formatCurrency(c.amount)} vence hoje.`, link: 'contas-receber.html', dedupeKey: key });
          }
        });
      }
    } catch (e) {
      console.error('Falha ao gerar notificações automáticas', e);
    }
  }

  function notifyNewSale(sale) {
    push({ type: 'venda', message: `Nova venda registrada: ${sale.number} — ${Utils.formatCurrency(sale.total)}.`, link: 'vendas.html' });
  }

  return { getAll, unreadCount, push, markRead, markAllRead, refreshAutomatic, notifyNewSale };
})();
