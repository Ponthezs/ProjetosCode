/**
 * financialService.js — Contas a pagar, contas a receber, categorias
 * financeiras, lançamentos de caixa e cálculo de fluxo de caixa.
 */
const FinancialService = (() => {
  const PAY = COLLECTIONS.PAYABLES;
  const REC = COLLECTIONS.RECEIVABLES;
  const CASH = COLLECTIONS.CASH_ENTRIES;
  const FCAT = COLLECTIONS.FIN_CATEGORIES;

  function effectiveStatus(record, pendingLabel = 'pendente') {
    if (record.status === pendingLabel && Utils.isOverdue(record.dueDate)) return 'vencido';
    return record.status;
  }

  // ---------- Categorias financeiras ----------
  function getFinCategories() { return StorageService.getAll(FCAT); }
  function createFinCategory(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome da categoria.');
    return StorageService.insert(FCAT, { name: data.name.trim(), nature: data.nature || 'despesa' });
  }
  function updateFinCategory(id, patch) { return StorageService.update(FCAT, id, patch); }
  function removeFinCategory(id) {
    const inUse = getPayables().some((p) => p.categoryId === id) || getReceivables().some((r) => r.categoryId === id) || getCashEntries().some((c) => c.categoryId === id);
    if (inUse) throw new Error('Categoria em uso em lançamentos financeiros e não pode ser excluída.');
    return StorageService.remove(FCAT, id);
  }
  function finCategoryName(id) { const c = getFinCategories().find((x) => x.id === id); return c ? c.name : '—'; }

  // ---------- Contas a pagar ----------
  function getPayables() { return StorageService.getAll(PAY).map((p) => Object.assign({}, p, { effectiveStatus: effectiveStatus(p) })); }
  function getPayableById(id) { return getPayables().find((p) => p.id === id) || null; }
  function createPayable(data) {
    if (!data.description) throw new Error('Informe a descrição da conta.');
    if (!data.dueDate) throw new Error('Informe a data de vencimento.');
    return StorageService.insert(PAY, Object.assign({ status: 'pendente', paymentDate: null }, data, { amount: Number(data.amount) || 0 }));
  }
  function updatePayable(id, patch) { return StorageService.update(PAY, id, patch); }
  function markPayablePaid(id, paymentDate, paymentMethod) { return StorageService.update(PAY, id, { status: 'pago', paymentDate: paymentDate || Utils.todayISO(), paymentMethod: paymentMethod || getPayableById(id).paymentMethod }); }
  function removePayable(id) { return StorageService.remove(PAY, id); }

  // ---------- Contas a receber ----------
  function getReceivables() { return StorageService.getAll(REC).map((r) => Object.assign({}, r, { effectiveStatus: effectiveStatus(r, 'pendente') })); }
  function getReceivableById(id) { return getReceivables().find((r) => r.id === id) || null; }
  function createReceivable(data) {
    if (!data.description) throw new Error('Informe a descrição da conta.');
    if (!data.dueDate) throw new Error('Informe a data de vencimento.');
    return StorageService.insert(REC, Object.assign({ status: 'pendente', receiptDate: null }, data, { amount: Number(data.amount) || 0 }));
  }
  function updateReceivable(id, patch) { return StorageService.update(REC, id, patch); }
  function markReceivableReceived(id, receiptDate, paymentMethod) { return StorageService.update(REC, id, { status: 'recebido', receiptDate: receiptDate || Utils.todayISO(), paymentMethod: paymentMethod || getReceivableById(id).paymentMethod }); }
  function removeReceivable(id) { return StorageService.remove(REC, id); }

  // ---------- Lançamentos manuais de caixa ----------
  function getCashEntries() { return StorageService.getAll(CASH).sort((a, b) => new Date(b.date) - new Date(a.date)); }
  function createCashEntry(data) {
    if (!data.description) throw new Error('Informe a descrição do lançamento.');
    if (!data.amount || Number(data.amount) <= 0) throw new Error('Informe um valor maior que zero.');
    return StorageService.insert(CASH, { date: data.date || Utils.todayISO(), type: data.type, description: data.description, categoryId: data.categoryId || null, amount: Number(data.amount) });
  }
  function removeCashEntry(id) { return StorageService.remove(CASH, id); }

  // ---------- Indicadores ----------
  function totalPending(list, amountKey = 'amount') {
    return list.filter((x) => x.effectiveStatus === 'pendente' || x.effectiveStatus === 'vencido').reduce((s, x) => s + Number(x[amountKey]), 0);
  }
  function totalOverdue(list) { return list.filter((x) => x.effectiveStatus === 'vencido').reduce((s, x) => s + Number(x.amount), 0); }

  function totalReceivablesPending() { return totalPending(getReceivables()); }
  function totalPayablesPending() { return totalPending(getPayables()); }

  /** Saldo de caixa acumulado (todas as entradas realizadas - saídas realizadas, desde o início). */
  function currentBalance() {
    const receivedIn = getReceivables().filter((r) => r.status === 'recebido').reduce((s, r) => s + Number(r.amount), 0);
    const paidOut = getPayables().filter((p) => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0);
    const cashIn = getCashEntries().filter((c) => c.type === 'entrada').reduce((s, c) => s + Number(c.amount), 0);
    const cashOut = getCashEntries().filter((c) => c.type === 'saida').reduce((s, c) => s + Number(c.amount), 0);
    return Math.round((receivedIn + cashIn - paidOut - cashOut) * 100) / 100;
  }

  /**
   * Calcula entradas/saídas/saldo realizados dentro de um período,
   * combinando recebimentos, pagamentos e lançamentos manuais de caixa.
   * Retorna também uma série diária para o gráfico de evolução.
   */
  function computeCashFlow(fromIso, toIso) {
    const inflow = [];
    const outflow = [];
    getReceivables().forEach((r) => { if (r.status === 'recebido' && r.receiptDate >= fromIso && r.receiptDate <= toIso) inflow.push({ date: r.receiptDate, amount: Number(r.amount), label: r.description }); });
    getPayables().forEach((p) => { if (p.status === 'pago' && p.paymentDate >= fromIso && p.paymentDate <= toIso) outflow.push({ date: p.paymentDate, amount: Number(p.amount), label: p.description }); });
    getCashEntries().forEach((c) => {
      if (c.date < fromIso || c.date > toIso) return;
      (c.type === 'entrada' ? inflow : outflow).push({ date: c.date, amount: Number(c.amount), label: c.description });
    });

    const totalIn = inflow.reduce((s, x) => s + x.amount, 0);
    const totalOut = outflow.reduce((s, x) => s + x.amount, 0);

    const days = [];
    let cursor = new Date(fromIso + 'T00:00:00');
    const end = new Date(toIso + 'T00:00:00');
    while (cursor <= end && days.length < 366) { days.push(cursor.toISOString().slice(0, 10)); cursor.setDate(cursor.getDate() + 1); }
    let running = 0;
    const series = days.map((day) => {
      const dayIn = inflow.filter((x) => x.date === day).reduce((s, x) => s + x.amount, 0);
      const dayOut = outflow.filter((x) => x.date === day).reduce((s, x) => s + x.amount, 0);
      running += dayIn - dayOut;
      return { date: day, entradas: dayIn, saidas: dayOut, saldoAcumulado: Math.round(running * 100) / 100 };
    });

    return { totalIn: Math.round(totalIn * 100) / 100, totalOut: Math.round(totalOut * 100) / 100, saldo: Math.round((totalIn - totalOut) * 100) / 100, inflow, outflow, series };
  }

  return {
    getFinCategories, createFinCategory, updateFinCategory, removeFinCategory, finCategoryName,
    getPayables, getPayableById, createPayable, updatePayable, markPayablePaid, removePayable,
    getReceivables, getReceivableById, createReceivable, updateReceivable, markReceivableReceived, removeReceivable,
    getCashEntries, createCashEntry, removeCashEntry,
    totalReceivablesPending, totalPayablesPending, totalOverdue, currentBalance, computeCashFlow,
  };
})();
