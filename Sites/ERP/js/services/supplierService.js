/**
 * supplierService.js — regras de negócio de Fornecedores.
 */
const SupplierService = (() => {
  const COL = COLLECTIONS.SUPPLIERS;

  function getAll() { return StorageService.getAll(COL); }
  function getById(id) { return StorageService.getById(COL, id); }

  function create(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome ou razão social.');
    if (data.document && !Utils.validateDocument(data.document, data.personType)) {
      throw new Error(data.personType === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.');
    }
    const code = Utils.nextSequentialCode(getAll(), 'FOR');
    return StorageService.insert(COL, Object.assign({}, data, { id: code, code }));
  }

  function update(id, patch) {
    if (patch.document && patch.personType && !Utils.validateDocument(patch.document, patch.personType)) {
      throw new Error(patch.personType === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.');
    }
    return StorageService.update(COL, id, patch);
  }

  function remove(id) {
    const inUse = ProductService && ProductService.getAll().some((p) => p.supplierId === id);
    if (inUse) throw new Error('Este fornecedor está vinculado a produtos cadastrados e não pode ser excluído.');
    return StorageService.remove(COL, id);
  }

  function count() { return getAll().length; }
  function activeCount() { return getAll().filter((s) => s.status === 'ativo').length; }

  return { getAll, getById, create, update, remove, count, activeCount };
})();
