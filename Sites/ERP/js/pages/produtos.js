/**
 * produtos.js — cadastro de produtos e categorias (abas "Produtos" e "Categorias").
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'produtos' })) return;

  const UNITS = ['UN', 'CX', 'PCT', 'KG', 'L', 'M'];

  const els = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    panelProdutos: document.getElementById('panelProdutos'),
    panelCategorias: document.getElementById('panelCategorias'),
    btnNovoProduto: document.getElementById('btnNovoProduto'),
    btnNovaCategoria: document.getElementById('btnNovaCategoria'),
    search: document.getElementById('searchInput'),
    filterCategory: document.getElementById('filterCategory'),
    filterStatus: document.getElementById('filterStatus'),
    filterLowStock: document.getElementById('filterLowStock'),
    tableContainerProdutos: document.getElementById('tableContainerProdutos'),
    tableContainerCategorias: document.getElementById('tableContainerCategorias'),
  };

  let productTable;
  let categoryTable;

  // ---------------------------------------------------------------------
  // Abas
  // ---------------------------------------------------------------------
  function setActiveTab(tab) {
    els.tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    els.panelProdutos.hidden = tab !== 'produtos';
    els.panelCategorias.hidden = tab !== 'categorias';
    els.btnNovoProduto.hidden = tab !== 'produtos';
    els.btnNovaCategoria.hidden = tab !== 'categorias';
  }

  function bindTabs() {
    els.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });
  }

  // ---------------------------------------------------------------------
  // Produtos
  // ---------------------------------------------------------------------
  function statusBadge(status) {
    return status === 'ativo'
      ? '<span class="badge badge-success">Ativo</span>'
      : '<span class="badge badge-neutral">Inativo</span>';
  }

  function isLowStock(p) { return Number(p.currentStock) <= Number(p.minStock); }

  function refreshCategoryFilterOptions() {
    const current = els.filterCategory.value;
    const cats = CategoryService.getAll();
    els.filterCategory.innerHTML = '<option value="">Categoria (todas)</option>' +
      cats.map((c) => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');
    if (cats.some((c) => String(c.id) === current)) els.filterCategory.value = current;
  }

  function applyProductFilters() {
    const term = els.search.value.trim().toLowerCase();
    const categoryId = els.filterCategory.value;
    const status = els.filterStatus.value;
    const onlyLow = els.filterLowStock.checked;

    const filtered = ProductService.getAll().filter((p) => {
      if (categoryId && String(p.categoryId) !== categoryId) return false;
      if (status && p.status !== status) return false;
      if (onlyLow && !isLowStock(p)) return false;
      if (term) {
        const haystack = `${p.name || ''} ${p.sku || ''} ${p.barcode || ''} ${p.code || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    productTable.setData(filtered);
  }

  function buildProductFormFields(product) {
    const isEdit = !!product;
    const categories = CategoryService.getAll();
    const fields = [
      { name: 'barcode', label: 'Código de barras', type: 'text' },
      { name: 'name', label: 'Produto', type: 'text', required: true, colSpan: 2 },
      {
        name: 'categoryId', label: 'Categoria', type: 'select', required: true, placeholder: 'Selecione',
        options: categories.map((c) => ({ value: c.id, label: c.status === 'ativo' ? c.name : `${c.name} (inativo)` })),
      },
      { name: 'brand', label: 'Marca', type: 'text' },
      { name: 'unit', label: 'Unidade', type: 'select', required: true, defaultValue: 'UN', options: UNITS.map((u) => ({ value: u, label: u })) },
      { name: 'costPrice', label: 'Preço de custo', type: 'number', min: 0, step: 0.01, required: true, defaultValue: 0 },
      { name: 'salePrice', label: 'Preço de venda', type: 'number', min: 0, step: 0.01, required: true, defaultValue: 0 },
      {
        name: 'currentStock', label: 'Estoque atual', type: 'number', min: 0, required: !isEdit, disabled: isEdit, defaultValue: 0,
        hint: isEdit ? 'Ajuste o estoque pelo módulo Estoque.' : undefined,
      },
      { name: 'minStock', label: 'Estoque mínimo', type: 'number', min: 0, required: true, defaultValue: 0 },
      {
        name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'ativo',
        options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }],
      },
    ];
    return fields;
  }

  function openQuickCategoryModal() {
    return Modal.form({
      title: 'Nova categoria',
      size: 'sm',
      submitLabel: 'Cadastrar categoria',
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true },
        {
          name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'ativo',
          options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }],
        },
      ],
      onSubmit: async (data) => {
        CategoryService.create(data);
        Toast.show('Categoria cadastrada com sucesso.', 'success');
        refreshCategoryFilterOptions();
        if (categoryTable) categoryTable.setData(CategoryService.getAll());
      },
    });
  }

  function openProductForm(product) {
    const isEdit = !!product;
    const formPromise = Modal.form({
      title: isEdit ? `Editar produto — ${product.code}` : 'Novo produto',
      fields: buildProductFormFields(product),
      initialData: product || {},
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar produto',
      size: 'lg',
      onSubmit: async (data) => {
        if (isEdit) {
          const patch = Object.assign({}, data);
          delete patch.currentStock; // estoque é ajustado apenas pelo módulo de Estoque
          ProductService.update(product.id, patch);
          Toast.show('Produto atualizado com sucesso.', 'success');
        } else {
          ProductService.create(data);
          Toast.show('Produto cadastrado com sucesso.', 'success');
        }
        refreshCategoryFilterOptions();
        applyProductFilters();
      },
    });

    const overlays = document.querySelectorAll('.modal-overlay');
    const overlay = overlays[overlays.length - 1];
    const catWrapper = overlay.querySelector('[data-field="categoryId"]');
    if (catWrapper) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'field-link-btn';
      link.textContent = '+ nova categoria';
      catWrapper.appendChild(link);
      link.addEventListener('click', async () => {
        const created = await openQuickCategoryModal();
        if (created) {
          const closeBtn = overlay.querySelector('.modal-close');
          if (closeBtn) closeBtn.click();
          openProductForm(product);
        }
      });
    }
    return formPromise;
  }

  async function handleDeleteProduct(p) {
    const ok = await Modal.confirm({
      title: 'Excluir produto',
      message: `Tem certeza que deseja excluir o produto "${Utils.escapeHtml(p.name)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      ProductService.remove(p.id);
      Toast.show('Produto excluído com sucesso.', 'success');
      applyProductFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildProductTable() {
    productTable = createDataTable(els.tableContainerProdutos, {
      columns: [
        { key: 'code', label: 'Código', sortable: true },
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Produto', sortable: true },
        { key: 'categoryId', label: 'Categoria', sortable: true, sortValue: (p) => ProductService.categoryName(p.categoryId), render: (p) => Utils.escapeHtml(ProductService.categoryName(p.categoryId)) },
        { key: 'brand', label: 'Marca' },
        { key: 'unit', label: 'Unidade' },
        { key: 'costPrice', label: 'Preço de custo', align: 'right', sortable: true, render: (p) => Utils.formatCurrency(p.costPrice) },
        { key: 'salePrice', label: 'Preço de venda', align: 'right', sortable: true, render: (p) => Utils.formatCurrency(p.salePrice) },
        { key: 'currentStock', label: 'Estoque atual', align: 'right', sortable: true, render: (p) => `<span class="stock-dot ${isLowStock(p) ? 'low' : 'ok'}"></span>${Utils.formatNumber(p.currentStock)}` },
        { key: 'minStock', label: 'Estoque mínimo', align: 'right', sortable: true, render: (p) => Utils.formatNumber(p.minStock) },
        { key: 'status', label: 'Status', sortable: true, render: (p) => statusBadge(p.status) },
      ],
      actions: [
        { icon: 'fa-pen', label: 'Editar', onClick: openProductForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDeleteProduct },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhum produto encontrado.',
      emptyIcon: 'fa-box',
      rowClass: (p) => (isLowStock(p) ? 'row-danger' : ''),
    });
  }

  function bindProductEvents() {
    els.search.addEventListener('input', Utils.debounce(applyProductFilters, 250));
    els.filterCategory.addEventListener('change', applyProductFilters);
    els.filterStatus.addEventListener('change', applyProductFilters);
    els.filterLowStock.addEventListener('change', applyProductFilters);
    els.btnNovoProduto.addEventListener('click', () => openProductForm(null));
  }

  // ---------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------
  function categoryStatusBadge(status) {
    return status === 'ativo'
      ? '<span class="badge badge-success">Ativa</span>'
      : '<span class="badge badge-neutral">Inativa</span>';
  }

  function openCategoryForm(category) {
    const isEdit = !!category;
    Modal.form({
      title: isEdit ? `Editar categoria — ${category.name}` : 'Nova categoria',
      size: 'sm',
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar categoria',
      initialData: category || { status: 'ativo' },
      fields: [
        { name: 'name', label: 'Nome', type: 'text', required: true },
        {
          name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'ativo',
          options: [{ value: 'ativo', label: 'Ativa' }, { value: 'inativo', label: 'Inativa' }],
        },
      ],
      onSubmit: async (data) => {
        if (isEdit) {
          CategoryService.update(category.id, data);
          Toast.show('Categoria atualizada com sucesso.', 'success');
        } else {
          CategoryService.create(data);
          Toast.show('Categoria cadastrada com sucesso.', 'success');
        }
        refreshCategoryFilterOptions();
        categoryTable.setData(CategoryService.getAll());
      },
    });
  }

  async function handleDeleteCategory(c) {
    const ok = await Modal.confirm({
      title: 'Excluir categoria',
      message: `Tem certeza que deseja excluir a categoria "${Utils.escapeHtml(c.name)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      CategoryService.remove(c.id);
      Toast.show('Categoria excluída com sucesso.', 'success');
      refreshCategoryFilterOptions();
      categoryTable.setData(CategoryService.getAll());
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildCategoryTable() {
    categoryTable = createDataTable(els.tableContainerCategorias, {
      columns: [
        { key: 'name', label: 'Nome', sortable: true },
        { key: 'status', label: 'Status', sortable: true, render: (c) => categoryStatusBadge(c.status) },
      ],
      actions: [
        { icon: 'fa-pen', label: 'Editar', onClick: openCategoryForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDeleteCategory },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhuma categoria cadastrada.',
      emptyIcon: 'fa-tags',
    });
    categoryTable.setData(CategoryService.getAll());
  }

  function bindCategoryEvents() {
    els.btnNovaCategoria.addEventListener('click', () => openCategoryForm(null));
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  function applyGlobalSearchQuery() {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) els.search.value = q;
  }

  bindTabs();
  buildProductTable();
  bindProductEvents();
  buildCategoryTable();
  bindCategoryEvents();
  refreshCategoryFilterOptions();
  applyGlobalSearchQuery();
  applyProductFilters();

  const initialTab = new URLSearchParams(window.location.search).get('tab');
  setActiveTab(initialTab === 'categorias' ? 'categorias' : 'produtos');
})();
