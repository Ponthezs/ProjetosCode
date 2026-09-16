/**
 * categoryService.js — categorias de produtos (Cadastros > Categorias).
 */
const CategoryService = (() => {
  const COL = COLLECTIONS.CATEGORIES;

  function getAll() { return StorageService.getAll(COL); }
  function getById(id) { return StorageService.getById(COL, id); }

  function create(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome da categoria.');
    return StorageService.insert(COL, { name: data.name.trim(), status: data.status || 'ativo' });
  }

  function update(id, patch) { return StorageService.update(COL, id, patch); }

  function remove(id) {
    const inUse = window.ProductService && ProductService.getAll().some((p) => p.categoryId === id);
    if (inUse) throw new Error('Existem produtos cadastrados nesta categoria. Reclassifique-os antes de excluir.');
    return StorageService.remove(COL, id);
  }

  return { getAll, getById, create, update, remove };
})();
