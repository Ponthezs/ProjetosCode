/**
 * customerService.js — regras de negócio de Clientes.
 * Isola o módulo de Cadastros/Clientes da camada de armazenamento, para que
 * uma futura API REST possa substituir o StorageService sem mudar as telas.
 */
const CustomerService = (() => {
  const COL = COLLECTIONS.CUSTOMERS;

  function getAll() { return StorageService.getAll(COL); }
  function getById(id) { return StorageService.getById(COL, id); }

  function create(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome ou razão social.');
    if (data.document && !Utils.validateDocument(data.document, data.personType)) {
      throw new Error(data.personType === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.');
    }
    const code = Utils.nextSequentialCode(getAll(), 'CLI');
    return StorageService.insert(COL, Object.assign({}, data, { id: code, code }));
  }

  function update(id, patch) {
    if (patch.document && patch.personType && !Utils.validateDocument(patch.document, patch.personType)) {
      throw new Error(patch.personType === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.');
    }
    return StorageService.update(COL, id, patch);
  }

  function remove(id) { return StorageService.remove(COL, id); }

  function count() { return getAll().length; }
  function activeCount() { return getAll().filter((c) => c.status === 'ativo').length; }

  function cities() { return [...new Set(getAll().map((c) => c.city).filter(Boolean))].sort(); }
  function states() { return [...new Set(getAll().map((c) => c.state).filter(Boolean))].sort(); }

  return { getAll, getById, create, update, remove, count, activeCount, cities, states };
})();
