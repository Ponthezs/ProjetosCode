// script.js

// ===== CONSTANTS & GLOBAL STATE =====
const DB_PRODUCTS_KEY = 'gestorProPlus_products_v2';
const DB_USERS_KEY = 'gestorProPlus_users_v2';
const DB_CART_KEY_PREFIX = 'gestorProPlus_cart_v2_';
const LOGGED_IN_USER_KEY = 'gestorProPlus_loggedInUser_v2';
const THEME_KEY = 'gestorProPlus_theme_v2';

let allProducts = {};
let users = [];
let loggedInUser = null; // { username: string, isAdmin: boolean }
let userCart = {}; // { productId: quantity }

// ===== UTILITY FUNCTIONS =====
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Erro ao salvar dados no localStorage:", e);
        showToast("Erro ao salvar dados. O armazenamento pode estar cheio.", "error");
    }
}

function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error("Erro ao carregar dados do localStorage:", e);
        return defaultValue;
    }
}

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn("Toast container não encontrado. Mensagem:", message);
        return;
    }
    toastContainer.textContent = message;
    toastContainer.className = `toast ${type} show`; // Reinicia classes e adiciona 'show'
    setTimeout(() => {
        toastContainer.classList.remove('show');
    }, duration);
}

function generateId() { // Para produtos, se não for fornecido um código manual
    return 'PROD' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// ===== THEME MODULE =====
function applyTheme(theme) {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode'); // Aplicar ao HTML para Tailwind dark: funcionar
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            saveData(THEME_KEY, newTheme);
        });
    }
}

// ===== AUTHENTICATION MODULE =====
function loginUser(username, password) {
    const user = users.find(u => u.username === username && u.password === password); // NUNCA FAÇA ISTO EM PRODUÇÃO!
    if (user) {
        loggedInUser = { username: user.username, isAdmin: user.isAdmin };
        saveData(LOGGED_IN_USER_KEY, loggedInUser);
        loadUserCart();
        showToast(`Bem-vindo, ${user.username}!`, 'success');
        window.location.href = 'index.html'; // Redirecionar para a loja
        return true;
    }
    showToast('Utilizador ou senha inválidos.', 'error');
    return false;
}

function registerUser(username, password) {
    if (users.find(u => u.username === username)) {
        showToast('Este nome de utilizador já existe.', 'error');
        return false;
    }
    users.push({ username, password, isAdmin: false }); // NUNCA GUARDE SENHA ASSIM EM PRODUÇÃO!
    saveData(DB_USERS_KEY, users);
    showToast('Conta criada com sucesso! Faça login.', 'success');
    window.location.href = 'login.html';
    return true;
}

function logoutUser() {
    if (loggedInUser) saveUserCart(); // Salvar carrinho antes de sair
    loggedInUser = null;
    userCart = {};
    saveData(LOGGED_IN_USER_KEY, null);
    updateCartIconCount();
    window.location.href = 'login.html';
    showToast('Sessão terminada.', 'info');
}

function checkAuthAndPermissions(currentPage) {
    loggedInUser = loadData(LOGGED_IN_USER_KEY); // Carregar estado de login

    const publicPages = ['login.html', 'register.html'];
    const adminPages = ['product-admin.html', 'permissions-admin.html'];

    if (!loggedInUser && !publicPages.includes(currentPage)) {
        showToast("Por favor, faça login para continuar.", "info");
        window.location.href = 'login.html';
        return false; // Bloquear renderização da página atual
    }

    if (loggedInUser) {
        if (publicPages.includes(currentPage)) { // Se logado e em página pública, redirecionar para loja
            window.location.href = 'index.html';
            return false;
        }
        if (adminPages.includes(currentPage) && !loggedInUser.isAdmin) {
            showToast("Acesso negado. Esta página é apenas para administradores.", "error");
            window.location.href = 'index.html';
            return false;
        }
        loadUserCart(); // Carregar carrinho se logado e em página protegida
    }
    return true; // Permitir renderização
}

function updateNavbar() {
    const mainNavbar = document.getElementById('mainNavbar');
    const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
    const adminMenuProductCreateLink = document.getElementById('adminMenuProductCreateLink');
    const adminMenuPermissionsLink = document.getElementById('adminMenuPermissionsLink');

    if (!mainNavbar) return; // Navbar não existe em todas as páginas (login/registo)

    if (loggedInUser) {
        mainNavbar.classList.remove('hidden-element');
        if (loggedInUserDisplay) loggedInUserDisplay.textContent = loggedInUser.username;
        updateCartIconCount();

        if (adminMenuProductCreateLink && adminMenuPermissionsLink) {
            if (loggedInUser.isAdmin) {
                adminMenuProductCreateLink.classList.remove('hidden-element');
                adminMenuPermissionsLink.classList.remove('hidden-element');
            } else {
                adminMenuProductCreateLink.classList.add('hidden-element');
                adminMenuPermissionsLink.classList.add('hidden-element');
            }
        }
    } else {
        mainNavbar.classList.add('hidden-element');
    }
}


// ===== PRODUCT MODULE =====
function loadInitialProducts() {
    const defaultProducts = {
        "PROD001": { name: "Caneta Esferográfica Pro", price: 2.50, stock: 100, imageUrl: "https://placehold.co/400x225/007bff/white?text=Caneta+Azul" },
        "PROD002": { name: "Caderno Universitário Premium", price: 15.00, stock: 50, imageUrl: "https://placehold.co/400x225/28a745/white?text=Caderno" },
        "PROD003": { name: "Borracha Soft Touch", price: 1.75, stock: 200, imageUrl: "https://placehold.co/400x225/ffc107/black?text=Borracha" },
        "PROD004": { name: "Lápis Grafite HB Especial", price: 0.90, stock: 150, imageUrl: "https://placehold.co/400x225/6f42c1/white?text=Lapis" },
    };
    allProducts = loadData(DB_PRODUCTS_KEY, defaultProducts);
    // Se o loadData retornou os defaults (porque não havia nada salvo), salvar os defaults.
    if (localStorage.getItem(DB_PRODUCTS_KEY) === null) {
        saveData(DB_PRODUCTS_KEY, allProducts);
    }
}

function renderProductListStore() { // Para index.html
    const container = document.getElementById('productListContainer');
    if (!container) return;
    container.innerHTML = '';
    if (Object.keys(allProducts).length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Nenhum produto disponível no momento.</p>';
        return;
    }
    for (const id in allProducts) {
        const product = allProducts[id];
        if (product.stock <= 0) continue; // Não mostrar produtos sem stock na loja

        const card = document.createElement('div');
        card.className = 'product-card bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700';
        card.innerHTML = `
            <img src="${product.imageUrl || 'https://placehold.co/400x225/cccccc/333333?text=Sem+Imagem'}" alt="${product.name}" class="w-full h-48">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-2 truncate" title="${product.name}">${product.name}</h3>
                <p class="text-gray-700 dark:text-slate-300 mb-1 text-sm">Cód: ${id}</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">R$ ${product.price.toFixed(2)}</p>
                <p class="text-sm text-gray-600 dark:text-slate-400 mb-3">Em stock: ${product.stock}</p>
                <div class="mt-auto flex items-center space-x-2">
                    <input type="number" id="qty-store-${id}" value="1" min="1" max="${product.stock}" class="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-md text-center dark:bg-slate-700">
                    <button class="flex-grow bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-150" 
                            onclick="addProductToCart('${id}', 'qty-store-${id}')">
                        <i class="fas fa-cart-plus mr-1"></i>Adicionar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function renderAdminProductTable() { // Para product-admin.html
    const container = document.getElementById('adminProductTableBody');
    const noProductsMsg = document.getElementById('noAdminProductsMessage');
    if (!container || !noProductsMsg) return;

    container.innerHTML = '';
    if (Object.keys(allProducts).length === 0) {
        noProductsMsg.classList.remove('hidden-element');
        container.classList.add('hidden-element'); // Esconder a tabela se vazia
        return;
    }
    noProductsMsg.classList.add('hidden-element');
    container.classList.remove('hidden-element');

    Object.entries(allProducts).forEach(([id, product]) => {
        const row = container.insertRow();
        row.className = "border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors";
        row.innerHTML = `
            <td class="px-4 py-3"><img src="${product.imageUrl || 'https://placehold.co/60x40?text=N/A'}" alt="${product.name}" class="w-16 h-10 object-cover rounded"></td>
            <td class="px-4 py-3 font-medium">${id}</td>
            <td class="px-4 py-3">${product.name}</td>
            <td class="px-4 py-3">R$ ${product.price.toFixed(2)}</td>
            <td class="px-4 py-3">${product.stock}</td>
            <td class="px-4 py-3 text-right">
                <button class="text-blue-500 hover:text-blue-700 p-1" onclick="populateProductFormForEdit('${id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="text-red-500 hover:text-red-700 p-1" onclick="deleteProduct('${id}')" title="Apagar"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}


function handleProductFormSubmit(event) {
    event.preventDefault();
    if (!loggedInUser || !loggedInUser.isAdmin) {
        showToast("Acesso negado.", "error"); return;
    }

    const form = event.target;
    const editingId = form.dataset.editingId; // Usar data attribute para ID de edição
    const id = (editingId || form.productCode.value.trim().toUpperCase()) || generateId(); // Gerar ID se novo e não fornecido
    const name = form.productName.value.trim();
    const price = parseFloat(form.productPrice.value);
    const stock = parseInt(form.productStock.value);
    const imageUrl = form.productImageUrl.value.trim();

    if (!id || !name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
        showToast("Preencha Código, Nome, Preço (>=0) e Stock (>=0) corretamente.", "error", 4000); return;
    }

    if (!editingId && allProducts[id]) { // Adicionando novo, mas ID já existe
        showToast("Erro: Código de produto já existe. Escolha outro ou deixe em branco para gerar um automaticamente.", "error", 5000); return;
    }
    
    allProducts[id] = { name, price, stock, imageUrl };
    saveData(DB_PRODUCTS_KEY, allProducts);
    showToast(editingId ? "Produto atualizado!" : "Produto adicionado!", "success");
    
    form.reset();
    form.removeAttribute('data-editing-id');
    document.getElementById('formProductTitle').textContent = 'Adicionar Novo Produto';
    document.getElementById('saveProductButton').textContent = 'Adicionar Produto';
    document.getElementById('productCode').disabled = false;
    document.getElementById('cancelEditButton').classList.add('hidden-element');
    
    renderAdminProductTable();
}

function populateProductFormForEdit(productId) {
    const product = allProducts[productId];
    const form = document.getElementById('formManageProduct');
    if (product && form) {
        form.dataset.editingId = productId; // Guardar ID de edição
        document.getElementById('formProductTitle').textContent = 'Editar Produto';
        document.getElementById('productCode').value = productId;
        document.getElementById('productCode').disabled = true; // Não permitir editar código/ID
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImageUrl').value = product.imageUrl || '';
        document.getElementById('saveProductButton').textContent = 'Atualizar Produto';
        document.getElementById('cancelEditButton').classList.remove('hidden-element');
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelProductFormEdit() {
    const form = document.getElementById('formManageProduct');
    if (form) {
        form.reset();
        form.removeAttribute('data-editing-id');
        document.getElementById('formProductTitle').textContent = 'Adicionar Novo Produto';
        document.getElementById('saveProductButton').textContent = 'Adicionar Produto';
        document.getElementById('productCode').disabled = false;
        document.getElementById('cancelEditButton').classList.add('hidden-element');
    }
}

function deleteProduct(productId) {
    if (!loggedInUser || !loggedInUser.isAdmin) {
        showToast("Acesso negado.", "error"); return;
    }
    if (confirm(`Tem a certeza que quer apagar o produto ${allProducts[productId]?.name || productId}? Esta ação também o removerá de todos os carrinhos.`)) {
        delete allProducts[productId];
        // Remover de todos os carrinhos (simulação)
        users.forEach(user => {
            const userCartKey = DB_CART_KEY_PREFIX + user.username;
            let cartData = loadData(userCartKey, {});
            if (cartData[productId]) {
                delete cartData[productId];
                saveData(userCartKey, cartData);
            }
        });
        if (userCart[productId]) { // Remover do carrinho do utilizador logado
            delete userCart[productId];
            saveUserCart();
            updateCartIconCount();
        }

        saveData(DB_PRODUCTS_KEY, allProducts);
        showToast("Produto apagado.", "info");
        renderAdminProductTable();
        // Se a página da loja estiver aberta em outra aba, ela não será atualizada automaticamente.
    }
}

// ===== CART MODULE =====
function loadUserCart() {
    if (loggedInUser) {
        userCart = loadData(DB_CART_KEY_PREFIX + loggedInUser.username, {});
    } else {
        userCart = {}; // Carrinho é apenas para utilizadores logados
    }
    updateCartIconCount();
}

function saveUserCart() {
    if (loggedInUser) {
        saveData(DB_CART_KEY_PREFIX + loggedInUser.username, userCart);
    }
}

function addProductToCart(productId, quantityInputId) {
    if (!loggedInUser) {
        showToast("Faça login para adicionar produtos ao carrinho.", "info");
        // Opcional: redirecionar para login ou mostrar modal de login
        // window.location.href = 'login.html';
        return;
    }
    const product = allProducts[productId];
    const quantityInput = document.getElementById(quantityInputId);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

    if (!product) { showToast("Produto não encontrado.", "error"); return; }
    if (isNaN(quantity) || quantity <= 0) { showToast("Quantidade inválida.", "error"); return; }
    
    const currentCartQuantity = userCart[productId] || 0;
    const totalQuantityAttempted = currentCartQuantity + quantity;

    if (product.stock < totalQuantityAttempted) {
        showToast(`Stock insuficiente para ${product.name}. Disponível: ${product.stock}. No carrinho: ${currentCartQuantity}. Tentando adicionar: ${quantity}.`, "error", 6000);
        if (quantityInput) quantityInput.value = Math.max(1, product.stock - currentCartQuantity); // Sugerir quantidade máxima possível
        return;
    }

    userCart[productId] = totalQuantityAttempted;
    saveUserCart();
    showToast(`${quantity}x ${product.name} adicionado(s) ao carrinho!`, "success");
    updateCartIconCount();
}

function updateCartQuantity(productId, newQuantity) {
    if (!userCart[productId]) return;
    const product = allProducts[productId];

    if (!product) { // Produto pode ter sido removido do catálogo
        delete userCart[productId];
        showToast("Um item foi removido do seu carrinho pois não está mais disponível.", "info");
    } else if (newQuantity <= 0) {
        delete userCart[productId];
    } else if (product.stock < newQuantity) {
        userCart[productId] = product.stock;
        showToast(`Quantidade de ${product.name} ajustada para ${product.stock} (stock máximo).`, "info");
    } else {
        userCart[productId] = newQuantity;
    }
    saveUserCart();
    renderCartPageContent(); // Atualiza a página do carrinho
    updateCartIconCount();
}

function removeFromCart(productId) {
    delete userCart[productId];
    saveUserCart();
    renderCartPageContent();
    updateCartIconCount();
}

function calculateCartTotal() {
    let total = 0;
    for (const productId in userCart) {
        const product = allProducts[productId];
        if (product) {
            total += product.price * userCart[productId];
        }
    }
    return total;
}

function updateCartIconCount() {
    const cartItemCountDisplay = document.getElementById('cartItemCount');
    if (cartItemCountDisplay) {
        const count = Object.values(userCart).reduce((sum, qty) => sum + qty, 0);
        cartItemCountDisplay.textContent = count;
    }
}

function renderCartPageContent() { // Para cart.html
    const container = document.getElementById('cartItemsContainer');
    const totalContainer = document.getElementById('cartTotalContainer');
    const checkoutButton = document.getElementById('checkoutButton');

    if (!container || !totalContainer || !checkoutButton) return;
    container.innerHTML = '';

    if (Object.keys(userCart).length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-slate-400">O seu carrinho está vazio.</p>';
        totalContainer.innerHTML = '';
        checkoutButton.disabled = true;
        checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    checkoutButton.disabled = false;
    checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');

    Object.entries(userCart).forEach(([productId, quantity]) => {
        const product = allProducts[productId];
        if (!product) { // Produto pode ter sido removido
            const itemDiv = document.createElement('div');
            itemDiv.className = 'p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md flex justify-between items-center';
            itemDiv.innerHTML = `
                <p class="text-red-700 dark:text-red-300">Produto (Cód: ${productId}) não está mais disponível.</p>
                <button class="text-red-500 hover:text-red-700" onclick="removeFromCart('${productId}')" title="Remover"><i class="fas fa-times-circle"></i></button>
            `;
            container.appendChild(itemDiv);
            // Não precisa remover do userCart aqui, pois o próximo `calculateCartTotal` e `saveUserCart` vão lidar com isso.
            // Ou melhor, remover explicitamente para consistência imediata:
            delete userCart[productId]; 
            return; // Pular este item
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0';
        itemDiv.innerHTML = `
            <div class="flex items-center space-x-4 w-full md:w-1/2">
                <img src="${product.imageUrl || 'https://placehold.co/80x80?text=N/A'}" alt="${product.name}" class="w-20 h-20 object-cover rounded">
                <div>
                    <h4 class="text-lg font-semibold text-sky-700 dark:text-sky-400">${product.name}</h4>
                    <p class="text-sm text-gray-600 dark:text-slate-400">R$ ${product.price.toFixed(2)} cada</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <label for="cartQty-${productId}" class="text-sm sr-only">Qtd:</label>
                <input type="number" id="cartQty-${productId}" value="${quantity}" min="1" max="${product.stock}" 
                       class="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-md text-center dark:bg-slate-700"
                       onchange="updateCartQuantity('${productId}', parseInt(this.value))">
                <p class="text-md font-semibold w-24 text-right">R$ ${(product.price * quantity).toFixed(2)}</p>
                <button class="text-red-500 hover:text-red-700 p-1" onclick="removeFromCart('${productId}')" title="Remover do Carrinho"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(itemDiv);
    });
    const total = calculateCartTotal();
    totalContainer.innerHTML = `<h3 class="text-xl font-bold text-right">Total: R$ ${total.toFixed(2)}</h3>`;
    saveUserCart(); // Salvar se algum item inválido foi removido
}


// ===== CHECKOUT MODULE =====
function renderCheckoutPageContent() { // Para checkout.html
    const summaryContainer = document.getElementById('checkoutOrderSummary');
    const paymentOptionsDiv = document.getElementById('paymentOptions');

    if (!summaryContainer || !paymentOptionsDiv) return;
    summaryContainer.innerHTML = '';

    if (Object.keys(userCart).length === 0) {
        summaryContainer.innerHTML = '<p class="text-gray-500 dark:text-slate-400">Não há itens no seu carrinho para finalizar.</p>';
        paymentOptionsDiv.classList.add('hidden-element');
        return;
    }
    paymentOptionsDiv.classList.remove('hidden-element');

    let summaryHTML = '<ul class="divide-y divide-gray-200 dark:divide-slate-700">';
    Object.entries(userCart).forEach(([productId, quantity]) => {
        const product = allProducts[productId];
        if (product) {
            summaryHTML += `
                <li class="py-3 flex justify-between text-sm">
                    <span>${product.name} (x${quantity})</span>
                    <span>R$ ${(product.price * quantity).toFixed(2)}</span>
                </li>`;
        }
    });
    summaryHTML += `
        <li class="py-3 flex justify-between text-base font-bold border-t-2 border-gray-300 dark:border-slate-600 mt-2 pt-3">
            <span>Total do Pedido:</span>
            <span>R$ ${calculateCartTotal().toFixed(2)}</span>
        </li>`;
    summaryHTML += '</ul>';
    summaryContainer.innerHTML = summaryHTML;
    document.getElementById('paymentSimulationResult').innerHTML = '';
}

function simulatePayment(method) {
    const paymentResultDiv = document.getElementById('paymentSimulationResult');
    if (!paymentResultDiv) return;

    let stockSufficient = true;
    let productsToUpdateStock = {};

    for (const productId in userCart) {
        const product = allProducts[productId];
        const quantityNeeded = userCart[productId];
        if (!product || product.stock < quantityNeeded) {
            stockSufficient = false;
            showToast(`Stock insuficiente para ${product?.name || 'um produto'} no momento do pagamento. Pedido não pode ser completado.`, "error", 6000);
            // Idealmente, redirecionar para o carrinho para ajuste
            window.location.href = 'cart.html';
            break;
        }
        productsToUpdateStock[productId] = product.stock - quantityNeeded;
    }

    if (!stockSufficient) return;

    // Se stock suficiente, deduzir (apenas na simulação, na prática seria após confirmação do pagamento)
    for (const productId in productsToUpdateStock) {
        allProducts[productId].stock = productsToUpdateStock[productId];
    }
    saveData(DB_PRODUCTS_KEY, allProducts);

    paymentResultDiv.innerHTML = `
        <div class="mt-4 p-4 border rounded-md bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700">
            <h4 class="font-semibold text-green-700 dark:text-green-300">Pagamento com ${method} Simulado com Sucesso!</h4>
            <p>O seu pedido foi processado (simulação).</p>
            <p>O stock dos produtos foi atualizado.</p>
            <p>Obrigado por comprar!</p>
        </div>
    `;
    showToast("Pagamento simulado com sucesso!", "success");
    userCart = {}; // Esvaziar carrinho
    saveUserCart();
    updateCartIconCount();
    
    // Desabilitar opções de pagamento e redirecionar
    const paymentOptionsDiv = document.getElementById('paymentOptions');
    if(paymentOptionsDiv) paymentOptionsDiv.classList.add('hidden-element');

    setTimeout(() => { window.location.href = 'index.html'; }, 4000);
}


// ===== PERMISSIONS MODULE (Admin) =====
function renderUserPermissionsPageContent() { // Para permissions-admin.html
    const container = document.getElementById('userPermissionsListContainer');
    if (!container) return;
    container.innerHTML = '';

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'p-4 bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 flex justify-between items-center';
        userDiv.innerHTML = `
            <div>
                <span class="font-semibold">${user.username}</span>
                <span class="text-sm ml-2 ${user.isAdmin ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}">
                    (${user.isAdmin ? 'Admin' : 'Utilizador'})
                </span>
            </div>
            ${user.username !== 'adm' ? `
            <button onclick="toggleAdminStatus('${user.username}')" 
                    class="px-3 py-1 text-sm rounded-md 
                           ${user.isAdmin ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors">
                ${user.isAdmin ? 'Revogar Admin' : 'Tornar Admin'}
            </button>` : '<span class="text-sm text-gray-400 dark:text-slate-500">(Admin principal)</span>'}
        `;
        container.appendChild(userDiv);
    });
}

function toggleAdminStatus(usernameToToggle) {
    if (!loggedInUser || !loggedInUser.isAdmin) {
        showToast("Acesso negado.", "error"); return;
    }
    const user = users.find(u => u.username === usernameToToggle);
    if (user && user.username !== 'adm') {
        user.isAdmin = !user.isAdmin;
        saveData(DB_USERS_KEY, users);
        showToast(`Permissões de ${usernameToToggle} atualizadas.`, "success");
        renderUserPermissionsPageContent(); // Re-renderizar a lista
        // Se o admin atual estiver a revogar o seu próprio estatuto (e não for o 'adm' principal)
        if (loggedInUser.username === usernameToToggle && !user.isAdmin) {
            loggedInUser.isAdmin = false;
            saveData(LOGGED_IN_USER_KEY, loggedInUser);
            updateNavbar(); // Atualizar a navbar para remover links de admin
            showToast("As suas próprias permissões de admin foram revogadas. Será redirecionado.", "info", 4000);
            setTimeout(() => { window.location.href = 'index.html'; }, 4000);
        }
    } else if (user && user.username === 'adm') {
        showToast("O admin principal ('adm') não pode ter as suas permissões revogadas.", "warn");
    }
}


// ===== PAGE INITIALIZATION ROUTER =====
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar tema salvo ou default
    const savedTheme = loadData(THEME_KEY, 'light');
    applyTheme(savedTheme);
    setupThemeToggle(); // Configurar o botão de toggle

    // Carregar dados essenciais
    loadInitialProducts();
    users = loadData(DB_USERS_KEY, []);
    if (users.length === 0 || !users.find(u => u.username === 'adm')) { // Garantir admin default
        users = [{ username: 'adm', password: '1234', isAdmin: true }];
        saveData(DB_USERS_KEY, users);
    }

    const currentPage = window.location.pathname.split("/").pop() || 'index.html'; // Default para index se path for /

    if (!checkAuthAndPermissions(currentPage)) {
        return; // Auth check já redirecionou, não continuar
    }
    
    updateNavbar(); // Atualizar visibilidade da navbar e links

    // Chamar a função de inicialização específica da página
    switch (currentPage) {
        case 'login.html':
            const loginForm = document.getElementById('formLogin');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    loginUser(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value);
                });
            }
            break;
        case 'register.html':
            const registerForm = document.getElementById('formRegister');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const pass = document.getElementById('registerPassword').value;
                    const confirmPass = document.getElementById('registerPasswordConfirm').value;
                    if (pass !== confirmPass) {
                        showToast('As senhas não coincidem.', 'error'); return;
                    }
                    registerUser(document.getElementById('registerUsername').value, pass);
                });
            }
            break;
        case 'index.html':
            renderProductListStore();
            break;
        case 'product-admin.html':
            if (loggedInUser && loggedInUser.isAdmin) {
                renderAdminProductTable();
                const productAdminForm = document.getElementById('formManageProduct');
                if (productAdminForm) productAdminForm.addEventListener('submit', handleProductFormSubmit);
                const cancelBtn = document.getElementById('cancelEditButton');
                if(cancelBtn) cancelBtn.addEventListener('click', cancelProductFormEdit);
            }
            break;
        case 'permissions-admin.html':
            if (loggedInUser && loggedInUser.isAdmin) {
                renderUserPermissionsPageContent();
            }
            break;
        case 'cart.html':
            renderCartPageContent();
            const checkoutBtnCart = document.getElementById('checkoutButton');
            if(checkoutBtnCart) checkoutBtnCart.addEventListener('click', () => window.location.href = 'checkout.html');
            break;
        case 'checkout.html':
            renderCheckoutPageContent();
            // Event listeners para botões de pagamento são adicionados dinamicamente ou podem ser fixos
            document.getElementById('payBoletoBtn')?.addEventListener('click', () => simulatePayment('Boleto'));
            document.getElementById('payPixBtn')?.addEventListener('click', () => simulatePayment('PIX'));
            document.getElementById('payCardBtn')?.addEventListener('click', () => simulatePayment('Cartão de Crédito'));
            break;
    }
});
