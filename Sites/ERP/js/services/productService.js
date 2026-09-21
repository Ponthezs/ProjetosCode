/**
 * productService.js — regras de negócio de Produtos e integração com estoque.
 */
const ProductService = (() => {
  const COL = COLLECTIONS.PRODUCTS;

  function getAll() { return StorageService.getAll(COL); }
  function getById(id) { return StorageService.getById(COL, id); }

  function create(data) {
    if (!data.name || !data.name.trim()) throw new Error('Informe o nome do produto.');
    if (Number(data.salePrice) < 0 || Number(data.costPrice) < 0) throw new Error('Os preços não podem ser negativos.');
    const code = Utils.nextSequentialCode(getAll(), 'PRD');
    const record = StorageService.insert(COL, Object.assign({}, data, {
      id: code, code, costPrice: Number(data.costPrice) || 0, salePrice: Number(data.salePrice) || 0,
      currentStock: Number(data.currentStock) || 0, minStock: Number(data.minStock) || 0,
    }));
    return record;
  }

  function update(id, patch) {
    const clean = Object.assign({}, patch);
    if (clean.costPrice !== undefined) clean.costPrice = Number(clean.costPrice) || 0;
    if (clean.salePrice !== undefined) clean.salePrice = Number(clean.salePrice) || 0;
    if (clean.minStock !== undefined) clean.minStock = Number(clean.minStock) || 0;
    return StorageService.update(COL, id, clean);
  }

  function remove(id) {
    const usedInSales = window.SalesService && SalesService.getAll().some((s) => s.items.some((it) => it.productId === id));
    if (usedInSales) throw new Error('Este produto possui vendas registradas e não pode ser excluído.');
    return StorageService.remove(COL, id);
  }

  /** Ajusta o estoque de um produto em `delta` (positivo entrada, negativo saída) e retorna o produto atualizado. */
  function adjustStock(id, delta) {
    const product = getById(id);
    if (!product) throw new Error('Produto não encontrado.');
    const next = Math.max(0, Number(product.currentStock || 0) + Number(delta));
    return StorageService.update(COL, id, { currentStock: next });
  }

  function getLowStock() {
    return getAll().filter((p) => p.status === 'ativo' && Number(p.currentStock) <= Number(p.minStock));
  }

  function count() { return getAll().length; }
  function activeCount() { return getAll().filter((p) => p.status === 'ativo').length; }

  function categoryName(categoryId) {
    const cat = window.CategoryService ? CategoryService.getById(categoryId) : null;
    return cat ? cat.name : '—';
  }

  return { getAll, getById, create, update, remove, adjustStock, getLowStock, count, activeCount, categoryName };
})();
