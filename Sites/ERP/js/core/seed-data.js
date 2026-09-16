/**
 * seed-data.js — dados de demonstração inseridos apenas na primeira execução
 * (quando o localStorage do navegador está vazio). Depois disso, todos os
 * dados vêm exclusivamente das ações do usuário dentro do sistema.
 */
const SeedData = (() => {

  const CATEGORIES = ['Papelaria', 'Informática', 'Limpeza', 'Alimentos e Bebidas', 'Mobiliário', 'Eletrônicos'];

  const FIN_CATEGORIES = [
    { name: 'Venda de produtos', nature: 'receita' },
    { name: 'Prestação de serviços', nature: 'receita' },
    { name: 'Outras receitas', nature: 'receita' },
    { name: 'Fornecedores', nature: 'despesa' },
    { name: 'Salários e encargos', nature: 'despesa' },
    { name: 'Aluguel', nature: 'despesa' },
    { name: 'Energia elétrica', nature: 'despesa' },
    { name: 'Impostos e taxas', nature: 'despesa' },
    { name: 'Marketing', nature: 'despesa' },
    { name: 'Manutenção e serviços', nature: 'despesa' },
  ];

  const CITY_STATE = [
    ['São Paulo', 'SP'], ['Campinas', 'SP'], ['Rio de Janeiro', 'RJ'], ['Belo Horizonte', 'MG'],
    ['Curitiba', 'PR'], ['Porto Alegre', 'RS'], ['Salvador', 'BA'], ['Recife', 'PE'],
    ['Fortaleza', 'CE'], ['Goiânia', 'GO'], ['Florianópolis', 'SC'], ['Brasília', 'DF'],
  ];

  function pick(arr, i) { return arr[i % arr.length]; }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function daysAgoISO(days) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().slice(0, 10); }
  function daysAheadISO(days) { return daysAgoISO(-days); }

  function buildCategories() {
    return CATEGORIES.map((name, i) => ({ id: `CAT${Utils.pad(i + 1, 3)}`, name, status: 'ativo', createdAt: new Date().toISOString() }));
  }

  function buildFinCategories() {
    return FIN_CATEGORIES.map((c, i) => ({ id: `FCAT${Utils.pad(i + 1, 3)}`, name: c.name, nature: c.nature, createdAt: new Date().toISOString() }));
  }

  function buildUsers() {
    const users = [
      { name: 'Felipe Andrade', email: 'admin@erp.com', login: 'admin', role: 'Administrador', password: 'admin123' },
      { name: 'Marina Souza', email: 'marina.souza@fluxenerp.com.br', login: 'marina.souza', role: 'Gerente', password: 'Gerente123' },
      { name: 'Rafael Lima', email: 'rafael.lima@fluxenerp.com.br', login: 'rafael.lima', role: 'Financeiro', password: 'Financ123' },
      { name: 'Juliana Costa', email: 'juliana.costa@fluxenerp.com.br', login: 'juliana.costa', role: 'Vendedor', password: 'Vendas123' },
      { name: 'Bruno Carvalho', email: 'bruno.carvalho@fluxenerp.com.br', login: 'bruno.carvalho', role: 'Estoque', password: 'Estoque123' },
    ];
    return users.map((u, i) => ({
      id: `USR${Utils.pad(i + 1, 3)}`,
      name: u.name, email: u.email, login: u.login, role: u.role,
      profileDescription: Auth.ROLE_DESCRIPTIONS[u.role],
      status: 'ativo',
      passwordHash: Auth.hashPassword(u.password),
      createdAt: daysAgoISO(rand(60, 400)) + 'T09:00:00.000Z',
    }));
  }

  function buildCustomers() {
    const pf = [
      'Ana Beatriz Lima', 'Carlos Eduardo Santos', 'Fernanda Oliveira', 'Gustavo Henrique Souza',
      'Larissa Almeida', 'Marcelo Ribeiro', 'Patrícia Gomes', 'Rodrigo Ferreira',
    ];
    const pj = ['Comercial Silva & Filhos Ltda', 'Distribuidora Boa Vista ME'];
    const list = [];
    pf.forEach((name, i) => {
      const [city, state] = pick(CITY_STATE, i);
      list.push({
        id: `CLI${Utils.pad(i + 1, 4)}`, code: `CLI${Utils.pad(i + 1, 4)}`, personType: 'PF', name, tradeName: '',
        document: '', stateDocument: '', email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ').pop().toLowerCase()}@gmail.com`,
        phone: Utils.maskPhone(`11${rand(30000000, 39999999)}`), mobile: Utils.maskPhone(`119${rand(80000000, 99999999)}`),
        zip: Utils.maskCEP(String(rand(1000000, 99999999))), address: `Rua ${pick(['das Flores', 'Sete de Setembro', 'Barão do Rio Branco', 'Getúlio Vargas', 'São João', 'XV de Novembro', 'do Comércio', 'Rio Branco'], i)}`,
        number: String(rand(10, 2500)), complement: i % 3 === 0 ? `Apto ${rand(11, 302)}` : '', district: pick(['Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'Santa Cecília'], i),
        city, state, notes: '', status: i === 7 ? 'inativo' : 'ativo', createdAt: daysAgoISO(rand(30, 500)) + 'T10:00:00.000Z',
      });
    });
    pj.forEach((name, j) => {
      const i = pf.length + j;
      const [city, state] = pick(CITY_STATE, i);
      list.push({
        id: `CLI${Utils.pad(i + 1, 4)}`, code: `CLI${Utils.pad(i + 1, 4)}`, personType: 'PJ', name, tradeName: name.split(' ').slice(0, 2).join(' '),
        document: '', stateDocument: String(rand(100000000, 999999999)), email: `contato@${name.split(' ')[0].toLowerCase()}.com.br`,
        phone: Utils.maskPhone(`11${rand(30000000, 39999999)}`), mobile: Utils.maskPhone(`119${rand(80000000, 99999999)}`),
        zip: Utils.maskCEP(String(rand(1000000, 99999999))), address: 'Avenida Industrial', number: String(rand(100, 3000)), complement: '',
        district: 'Distrito Industrial', city, state, notes: '', status: 'ativo', createdAt: daysAgoISO(rand(30, 500)) + 'T10:00:00.000Z',
      });
    });
    // CPF/CNPJ fictícios porém com formato válido de máscara (não precisam passar checksum real)
    list.forEach((c, i) => {
      c.document = c.personType === 'PJ' ? Utils.maskCNPJ(String(10000000000000 + i * 137)) : Utils.maskCPF(String(10000000000 + i * 91));
    });
    return list;
  }

  function buildSuppliers() {
    const names = ['Papelaria Central Distribuição Ltda', 'TechPrime Componentes e Informática', 'Limpa Bem Produtos de Higiene', 'Alimentos Sabor & Cia Distribuidora', 'Mobiliário Corporativo Vetta'];
    return names.map((name, i) => {
      const [city, state] = pick(CITY_STATE, i + 3);
      return {
        id: `FOR${Utils.pad(i + 1, 4)}`, code: `FOR${Utils.pad(i + 1, 4)}`, personType: 'PJ', name, tradeName: name.split(' ').slice(0, 2).join(' '),
        document: Utils.maskCNPJ(String(20000000000000 + i * 251)), stateDocument: String(rand(100000000, 999999999)),
        email: `comercial@${name.split(' ')[0].toLowerCase()}.com.br`, phone: Utils.maskPhone(`11${rand(30000000, 39999999)}`), mobile: Utils.maskPhone(`119${rand(80000000, 99999999)}`),
        zip: Utils.maskCEP(String(rand(1000000, 99999999))), address: 'Rodovia dos Distribuidores', number: String(rand(500, 5000)), complement: '', district: 'Zona Industrial',
        city, state, notes: '', status: 'ativo', createdAt: daysAgoISO(rand(120, 600)) + 'T09:00:00.000Z',
      };
    });
  }

  function buildProducts(categories, suppliers) {
    const items = [
      { name: 'Caneta Esferográfica Azul (caixa c/ 50)', cat: 'Papelaria', unit: 'CX', cost: 18.9, sale: 34.9, stock: 42, min: 15 },
      { name: 'Papel A4 75g (pacote 500 folhas)', cat: 'Papelaria', unit: 'PCT', cost: 21.5, sale: 36.9, stock: 8, min: 20 },
      { name: 'Grampeador de Mesa Médio', cat: 'Papelaria', unit: 'UN', cost: 12.4, sale: 24.9, stock: 30, min: 10 },
      { name: 'Notebook 15" i5 8GB 256GB SSD', cat: 'Informática', unit: 'UN', cost: 2450.0, sale: 3299.0, stock: 6, min: 5 },
      { name: 'Mouse Óptico Sem Fio', cat: 'Informática', unit: 'UN', cost: 32.0, sale: 59.9, stock: 54, min: 20 },
      { name: 'Teclado ABNT2 USB', cat: 'Informática', unit: 'UN', cost: 41.0, sale: 79.9, stock: 3, min: 12 },
      { name: 'Álcool em Gel 70% 500ml', cat: 'Limpeza', unit: 'UN', cost: 6.2, sale: 12.9, stock: 120, min: 30 },
      { name: 'Detergente Neutro 5L', cat: 'Limpeza', unit: 'UN', cost: 14.0, sale: 26.5, stock: 18, min: 15 },
      { name: 'Café Torrado e Moído 500g', cat: 'Alimentos e Bebidas', unit: 'UN', cost: 9.8, sale: 18.9, stock: 65, min: 25 },
      { name: 'Cadeira de Escritório Ergonômica', cat: 'Mobiliário', unit: 'UN', cost: 320.0, sale: 549.0, stock: 4, min: 6 },
    ];
    return items.map((it, i) => {
      const category = categories.find((c) => c.name === it.cat);
      const supplier = pick(suppliers, i);
      return {
        id: `PRD${Utils.pad(i + 1, 4)}`, code: `PRD${Utils.pad(i + 1, 4)}`, sku: `SKU-${Utils.pad(i + 1, 5)}`,
        barcode: String(7890000000000 + i * 1234), name: it.name, categoryId: category ? category.id : null,
        supplierId: supplier.id, brand: pick(['Genérica', 'Master', 'ProLine', 'Nexa', 'Vitalle'], i), unit: it.unit,
        costPrice: it.cost, salePrice: it.sale, currentStock: it.stock, minStock: it.min,
        status: 'ativo', createdAt: daysAgoISO(rand(60, 400)) + 'T09:00:00.000Z',
      };
    });
  }

  function buildSales(customers, products, users) {
    const seller = users.find((u) => u.role === 'Vendedor') || users[0];
    const admin = users.find((u) => u.role === 'Administrador') || users[0];
    const statuses = ['finalizado', 'finalizado', 'finalizado', 'pago', 'pendente', 'orcamento', 'cancelado'];
    const methods = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Dinheiro'];
    const activeCustomers = customers.filter((c) => c.status === 'ativo');
    const sales = [];
    for (let i = 0; i < 15; i++) {
      const customer = pick(activeCustomers, i);
      const itemCount = rand(1, 3);
      const items = [];
      const usedProducts = new Set();
      for (let k = 0; k < itemCount; k++) {
        let product = pick(products, i + k * 3);
        let attempts = 0;
        while (usedProducts.has(product.id) && attempts < products.length) { product = products[(i + k * 3 + attempts) % products.length]; attempts++; }
        usedProducts.add(product.id);
        const qty = rand(1, 4);
        items.push({ productId: product.id, productName: product.name, qty, unitPrice: product.salePrice, discount: 0 });
      }
      const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      const discount = i % 4 === 0 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
      const total = Math.round((subtotal - discount) * 100) / 100;
      sales.push({
        id: `VDA${Utils.pad(i + 1, 4)}`, number: `VD${Utils.pad(i + 1, 4)}`, customerId: customer.id, date: daysAgoISO(rand(0, 90)),
        sellerId: i % 5 === 0 ? admin.id : seller.id, paymentMethod: pick(methods, i), items, subtotal: Math.round(subtotal * 100) / 100,
        discount, total, status: pick(statuses, i), notes: '', createdAt: daysAgoISO(rand(0, 90)) + 'T14:30:00.000Z',
      });
    }
    return sales;
  }

  function buildPurchases(suppliers, products, users) {
    const responsible = users.find((u) => u.role === 'Estoque') || users[0];
    const statuses = ['confirmada', 'confirmada', 'pendente', 'confirmada'];
    const methods = ['Boleto', 'Transferência bancária', 'Pix'];
    const purchases = [];
    for (let i = 0; i < 8; i++) {
      const supplier = pick(suppliers, i);
      const itemCount = rand(1, 3);
      const items = [];
      for (let k = 0; k < itemCount; k++) {
        const product = pick(products, i + k * 2);
        const qty = rand(5, 30);
        items.push({ productId: product.id, productName: product.name, qty, unitCost: product.costPrice });
      }
      const total = Math.round(items.reduce((s, it) => s + it.qty * it.unitCost, 0) * 100) / 100;
      purchases.push({
        id: `CMP${Utils.pad(i + 1, 4)}`, number: `CP${Utils.pad(i + 1, 4)}`, supplierId: supplier.id, date: daysAgoISO(rand(10, 120)),
        items, total, status: pick(statuses, i), paymentMethod: pick(methods, i), responsibleUserId: responsible.id, notes: '',
        createdAt: daysAgoISO(rand(10, 120)) + 'T11:00:00.000Z',
      });
    }
    return purchases;
  }

  function buildStockMovements(products, users) {
    const responsible = users.find((u) => u.role === 'Estoque') || users[0];
    const moves = [];
    let seq = 1;
    products.forEach((p, i) => {
      moves.push({ id: `MOV${Utils.pad(seq++, 4)}`, date: daysAgoISO(rand(90, 180)), productId: p.id, quantity: p.currentStock + rand(10, 40), type: 'entrada', reason: 'Estoque inicial', responsibleUserId: responsible.id, createdAt: daysAgoISO(rand(90, 180)) + 'T08:00:00.000Z' });
      moves.push({ id: `MOV${Utils.pad(seq++, 4)}`, date: daysAgoISO(rand(5, 60)), productId: p.id, quantity: rand(3, 12), type: 'saida', reason: 'Venda ao cliente', responsibleUserId: responsible.id, createdAt: daysAgoISO(rand(5, 60)) + 'T15:00:00.000Z' });
      if (i % 3 === 0) moves.push({ id: `MOV${Utils.pad(seq++, 4)}`, date: daysAgoISO(rand(1, 20)), productId: p.id, quantity: rand(1, 5), type: 'ajuste', reason: 'Ajuste de inventário', responsibleUserId: responsible.id, createdAt: daysAgoISO(rand(1, 20)) + 'T17:00:00.000Z' });
    });
    return moves;
  }

  function buildPayables(suppliers, finCategories) {
    const despesaCats = finCategories.filter((c) => c.nature === 'despesa');
    const rows = [];
    const specs = [
      { desc: 'Compra de material de papelaria', due: -6, status: 'vencido' },
      { desc: 'Aluguel do escritório — mês vigente', due: 3, status: 'pendente' },
      { desc: 'Conta de energia elétrica', due: 0, status: 'pendente' },
      { desc: 'Manutenção de equipamentos de informática', due: 12, status: 'pendente' },
      { desc: 'Fatura de fornecedor — insumos de limpeza', due: -15, status: 'pago' },
      { desc: 'Folha de pagamento — salários', due: -2, status: 'pago' },
      { desc: 'Serviço de marketing digital', due: 20, status: 'pendente' },
      { desc: 'Impostos municipais (ISS)', due: 8, status: 'pendente' },
      { desc: 'Compra de notebooks para revenda', due: -20, status: 'pago' },
      { desc: 'Manutenção do sistema de segurança', due: -3, status: 'cancelado' },
    ];
    specs.forEach((s, i) => {
      const due = daysAheadISO(s.due);
      rows.push({
        id: `PAG${Utils.pad(i + 1, 4)}`, description: s.desc, supplierId: pick(suppliers, i).id, categoryId: pick(despesaCats, i).id,
        amount: Math.round(rand(180, 4200) * 1.0 * 100) / 100, issueDate: daysAgoISO(30 - s.due < 0 ? 5 : 30), dueDate: due,
        paymentDate: s.status === 'pago' ? daysAgoISO(Math.abs(s.due) + 1) : null, paymentMethod: pick(['Boleto', 'Transferência bancária', 'Pix'], i),
        status: s.status, createdAt: daysAgoISO(35) + 'T09:00:00.000Z',
      });
    });
    return rows;
  }

  function buildReceivables(customers, finCategories) {
    const receitaCats = finCategories.filter((c) => c.nature === 'receita');
    const activeCustomers = customers.filter((c) => c.status === 'ativo');
    const rows = [];
    const specs = [
      { due: -10, status: 'vencido' }, { due: -4, status: 'vencido' }, { due: 0, status: 'pendente' },
      { due: 5, status: 'pendente' }, { due: 15, status: 'pendente' }, { due: -20, status: 'recebido' },
      { due: -30, status: 'recebido' }, { due: 25, status: 'pendente' }, { due: -8, status: 'cancelado' }, { due: 10, status: 'pendente' },
    ];
    specs.forEach((s, i) => {
      const due = daysAheadISO(s.due);
      rows.push({
        id: `REC${Utils.pad(i + 1, 4)}`, customerId: pick(activeCustomers, i).id, description: `Venda de produtos — pedido ${Utils.pad(i + 1, 4)}`,
        categoryId: pick(receitaCats, i).id, amount: Math.round(rand(150, 3200) * 100) / 100, issueDate: daysAgoISO(35),
        dueDate: due, receiptDate: s.status === 'recebido' ? daysAgoISO(Math.abs(s.due) + 1) : null,
        paymentMethod: pick(['Pix', 'Cartão de crédito', 'Boleto'], i), status: s.status, createdAt: daysAgoISO(35) + 'T09:30:00.000Z',
      });
    });
    return rows;
  }

  function buildCashEntries(finCategories) {
    const entries = [
      { type: 'entrada', desc: 'Aporte de capital dos sócios', cat: 'Outras receitas', amount: 15000, days: 85 },
      { type: 'saida', desc: 'Pagamento de tarifas bancárias', cat: 'Manutenção e serviços', amount: 89.9, days: 40 },
      { type: 'entrada', desc: 'Recebimento de serviço de consultoria', cat: 'Prestação de serviços', amount: 2400, days: 35 },
      { type: 'saida', desc: 'Compra de material de limpeza para escritório', cat: 'Manutenção e serviços', amount: 210.5, days: 28 },
      { type: 'saida', desc: 'Taxas de cartório e contabilidade', cat: 'Impostos e taxas', amount: 340, days: 22 },
      { type: 'entrada', desc: 'Reembolso de fornecedor', cat: 'Outras receitas', amount: 180, days: 18 },
      { type: 'saida', desc: 'Retirada de pró-labore', cat: 'Salários e encargos', amount: 4500, days: 14 },
      { type: 'saida', desc: 'Assinatura de ferramentas de gestão', cat: 'Manutenção e serviços', amount: 149, days: 9 },
      { type: 'entrada', desc: 'Venda de ativo imobilizado (mobiliário antigo)', cat: 'Outras receitas', amount: 650, days: 5 },
      { type: 'saida', desc: 'Despesas com combustível e logística', cat: 'Manutenção e serviços', amount: 320, days: 2 },
    ];
    return entries.map((e, i) => ({
      id: `CAX${Utils.pad(i + 1, 4)}`, date: daysAgoISO(e.days), type: e.type, description: e.desc,
      categoryId: (finCategories.find((c) => c.name === e.cat) || finCategories[0]).id, amount: e.amount,
      createdAt: daysAgoISO(e.days) + 'T16:00:00.000Z',
    }));
  }

  function ensureSeeded() {
    if (!StorageService.isAvailable()) return;
    const already = StorageService.getSetting(SETTINGS_KEYS.SEED_FLAG, false);
    if (already) return;

    const categories = StorageService.seedIfEmpty(COLLECTIONS.CATEGORIES, buildCategories);
    const finCategories = StorageService.seedIfEmpty(COLLECTIONS.FIN_CATEGORIES, buildFinCategories);
    const users = StorageService.seedIfEmpty(COLLECTIONS.USERS, buildUsers);
    const customers = StorageService.seedIfEmpty(COLLECTIONS.CUSTOMERS, buildCustomers);
    const suppliers = StorageService.seedIfEmpty(COLLECTIONS.SUPPLIERS, buildSuppliers);
    const products = StorageService.seedIfEmpty(COLLECTIONS.PRODUCTS, () => buildProducts(categories, suppliers));
    StorageService.seedIfEmpty(COLLECTIONS.SALES, () => buildSales(customers, products, users));
    StorageService.seedIfEmpty(COLLECTIONS.PURCHASES, () => buildPurchases(suppliers, products, users));
    StorageService.seedIfEmpty(COLLECTIONS.STOCK_MOVEMENTS, () => buildStockMovements(products, users));
    StorageService.seedIfEmpty(COLLECTIONS.PAYABLES, () => buildPayables(suppliers, finCategories));
    StorageService.seedIfEmpty(COLLECTIONS.RECEIVABLES, () => buildReceivables(customers, finCategories));
    StorageService.seedIfEmpty(COLLECTIONS.CASH_ENTRIES, () => buildCashEntries(finCategories));
    StorageService.seedIfEmpty(COLLECTIONS.NOTIFICATIONS, () => []);

    if (!StorageService.getSetting(SETTINGS_KEYS.COMPANY, null)) {
      StorageService.setSetting(SETTINGS_KEYS.COMPANY, {
        logo: '', corporateName: 'Fluxen Comércio e Distribuição Ltda', tradeName: 'Fluxen ERP',
        cnpj: '12.345.678/0001-90', phone: '(11) 3555-0100', email: 'contato@fluxenerp.com.br',
        zip: '01310-100', address: 'Avenida Paulista', number: '1500', complement: 'Conjunto 82', district: 'Bela Vista', city: 'São Paulo', state: 'SP',
      });
    }
    if (!StorageService.getSetting(SETTINGS_KEYS.SETTINGS, null)) {
      StorageService.setSetting(SETTINGS_KEYS.SETTINGS, { theme: 'light', sidebarCollapsed: false, dateFormat: 'dd/MM/yyyy', currency: 'BRL' });
    }

    StorageService.setSetting(SETTINGS_KEYS.SEED_FLAG, true);
  }

  return { ensureSeeded };
})();
