# 🔧 Correções Práticas Imediatas

## 1. Melhorar Validação de Inputs

### Criar arquivo `validators.js`

```javascript
// validators.js - Funções de validação centralizadas

function validateUsername(username) {
    if (!username || username.trim().length < 3) {
        return { valid: false, error: 'Utilizador deve ter pelo menos 3 caracteres' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { valid: false, error: 'Utilizador pode conter apenas letras, números, - e _' };
    }
    return { valid: true };
}

function validatePassword(password) {
    if (!password || password.length < 6) {
        return { valid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Senha deve conter uma letra maiúscula' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Senha deve conter um número' };
    }
    return { valid: true };
}

function validateProductPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Preço deve ser um número positivo' };
    }
    return { valid: true };
}

function validateProductStock(stock) {
    const num = parseInt(stock);
    if (isNaN(num) || num < 0) {
        return { valid: false, error: 'Stock deve ser um número inteiro não-negativo' };
    }
    return { valid: true };
}

function validateProductName(name) {
    if (!name || name.trim().length < 2) {
        return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    if (name.length > 100) {
        return { valid: false, error: 'Nome não pode exceder 100 caracteres' };
    }
    return { valid: true };
}

// Sanitizar string (remover caracteres perigosos)
function sanitizeString(str) {
    return str.replace(/[<>\"']/g, '');
}

// Validar URL de imagem
function validateImageUrl(url) {
    if (!url) return { valid: true }; // Optional
    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, error: 'URL de imagem inválida' };
    }
}
```

**Usar no script.js:**

```javascript
function registerUser(username, password) {
    const userVal = validateUsername(username);
    if (!userVal.valid) {
        showToast(userVal.error, 'error');
        return false;
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
        showToast(passVal.error, 'error');
        return false;
    }

    if (users.find(u => u.username === username)) {
        showToast('Este nome de utilizador já existe.', 'error');
        return false;
    }

    // Hash da senha (implementar depois)
    users.push({ username, password: hashPassword(password), isAdmin: false });
    saveData(DB_USERS_KEY, users);
    showToast('Conta criada com sucesso! Faça login.', 'success');
    window.location.href = 'login.html';
    return true;
}

function handleProductFormSubmit(event) {
    event.preventDefault();
    if (!loggedInUser || !loggedInUser.isAdmin) {
        showToast("Acesso negado.", "error"); 
        return;
    }

    const form = event.target;
    const editingId = form.dataset.editingId;
    const id = (editingId || form.productCode.value.trim().toUpperCase()) || generateId();
    const name = sanitizeString(form.productName.value.trim());
    const price = parseFloat(form.productPrice.value);
    const stock = parseInt(form.productStock.value);
    const imageUrl = form.productImageUrl.value.trim();

    // Validações
    const nameVal = validateProductName(name);
    if (!nameVal.valid) {
        showToast(nameVal.error, 'error');
        return;
    }

    const priceVal = validateProductPrice(price);
    if (!priceVal.valid) {
        showToast(priceVal.error, 'error');
        return;
    }

    const stockVal = validateProductStock(stock);
    if (!stockVal.valid) {
        showToast(stockVal.error, 'error');
        return;
    }

    if (imageUrl) {
        const imgVal = validateImageUrl(imageUrl);
        if (!imgVal.valid) {
            showToast(imgVal.error, 'error');
            return;
        }
    }

    // ... resto do código
}
```

---

## 2. Hash de Senhas (Solução Temporária)

```javascript
// Usar CryptoJS temporariamente (não é tão seguro quanto bcrypt, mas melhor que nada)
// Adicionar ao <head>: <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.0/crypto-js.min.js"></script>

function hashPassword(password) {
    return CryptoJS.SHA256(password + 'salt_secret_key').toString();
}

function loginUser(username, password) {
    const hashedPassword = hashPassword(password);
    const user = users.find(u => u.username === username && u.password === hashedPassword);
    
    if (user) {
        loggedInUser = { username: user.username, isAdmin: user.isAdmin };
        saveData(LOGGED_IN_USER_KEY, loggedInUser);
        loadUserCart();
        showToast(`Bem-vindo, ${user.username}!`, 'success');
        window.location.href = 'index.html';
        return true;
    }
    showToast('Utilizador ou senha inválidos.', 'error');
    return false;
}

function registerUser(username, password) {
    // ... validações ...
    
    const hashedPassword = hashPassword(password);
    users.push({ username, password: hashedPassword, isAdmin: false });
    saveData(DB_USERS_KEY, users);
    showToast('Conta criada com sucesso! Faça login.', 'success');
    window.location.href = 'login.html';
    return true;
}

// Atualizar admin padrão
if (users.length === 0 || !users.find(u => u.username === 'adm')) {
    const defaultAdminPassword = hashPassword('1234');
    users = [{ username: 'adm', password: defaultAdminPassword, isAdmin: true }];
    saveData(DB_USERS_KEY, users);
}
```

---

## 3. Melhorar Toast Notifications

```javascript
// Melhorar o sistema de toast com mais tipos e duração customizável

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.warn("Toast container não encontrado.");
        alert(message); // Fallback
        return;
    }

    // Remover toast anterior se existir
    const existingToast = toastContainer.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Criar novo toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    
    let icon = '✓'; // default
    switch(type) {
        case 'success': icon = '✓'; break;
        case 'error': icon = '✕'; break;
        case 'warning': icon = '⚠'; break;
        case 'info': icon = 'ℹ'; break;
    }

    toast.innerHTML = `<span>${icon}</span> ${sanitizeString(message)}`;
    toast.style.minWidth = 'auto';
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, duration);
}
```

**Melhorar CSS:**

```css
.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    padding: 14px 24px;
    border-radius: 8px;
    color: white;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.5s ease-in-out, transform 0.3s ease-in-out;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 90%;
}

.toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.toast-success { background-color: #10b981; }
.toast-error { background-color: #ef4444; }
.toast-info { background-color: #3b82f6; }
.toast-warning { background-color: #f59e0b; }
```

---

## 4. Adicionar Loading States

```javascript
function showLoading(show = true, message = 'Carregando...') {
    let loadingDiv = document.getElementById('loadingOverlay');
    
    if (show) {
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingOverlay';
            loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loadingDiv.innerHTML = `
                <div class="bg-white dark:bg-slate-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
                    <p class="text-gray-700 dark:text-slate-200">${message}</p>
                </div>
            `;
            document.body.appendChild(loadingDiv);
        }
    } else {
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

// Usar assim:
async function addProductToCart(productId, quantityInputId) {
    if (!loggedInUser) {
        showToast("Faça login para adicionar produtos ao carrinho.", "info");
        return;
    }

    showLoading(true, 'Adicionando ao carrinho...');
    
    try {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        const product = allProducts[productId];
        const quantityInput = document.getElementById(quantityInputId);
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        if (!product) {
            showToast("Produto não encontrado.", "error");
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            showToast("Quantidade inválida.", "error");
            return;
        }

        const currentCartQuantity = userCart[productId] || 0;
        const totalQuantityAttempted = currentCartQuantity + quantity;

        if (product.stock < totalQuantityAttempted) {
            showToast(`Stock insuficiente para ${product.name}. Disponível: ${product.stock}.`, "error");
            return;
        }

        userCart[productId] = totalQuantityAttempted;
        saveUserCart();
        showToast(`${quantity}x ${product.name} adicionado(s) ao carrinho!`, "success");
        updateCartIconCount();
    } finally {
        showLoading(false);
    }
}
```

---

## 5. Melhorar Tratamento de Erros

```javascript
// Error handler global
window.addEventListener('error', (event) => {
    console.error('Erro não tratado:', event.error);
    showToast('Um erro inesperado ocorreu. Por favor, recarregue a página.', 'error', 5000);
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada não tratada:', event.reason);
    showToast('Erro na operação. Por favor, tente novamente.', 'error', 5000);
});

// Validação de localStorage
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// Verificar ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (!isLocalStorageAvailable()) {
        showToast('Armazenamento local não disponível. Algumas funcionalidades podem não funcionar.', 'warning', 7000);
    }
    // ... resto do código ...
});
```

---

## 6. Adicionar Confirmação para Ações Destrutivas

```javascript
function deleteProductWithConfirmation(productId) {
    if (!loggedInUser || !loggedInUser.isAdmin) {
        showToast("Acesso negado.", "error");
        return;
    }

    const product = allProducts[productId];
    if (!product) return;

    // Criar modal de confirmação
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirmar exclusão</h3>
            <p class="text-gray-700 dark:text-slate-300 mb-4">
                Tem a certeza que quer apagar "<strong>${product.name}</strong>"? 
                <br><small>Esta ação não pode ser desfeita.</small>
            </p>
            <div class="flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-slate-600">
                    Cancelar
                </button>
                <button onclick="confirmDeleteProduct('${productId}'); this.closest('.fixed').remove();" 
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Apagar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function confirmDeleteProduct(productId) {
    // Implementação da exclusão real
    delete allProducts[productId];
    users.forEach(user => {
        const userCartKey = DB_CART_KEY_PREFIX + user.username;
        let cartData = loadData(userCartKey, {});
        if (cartData[productId]) {
            delete cartData[productId];
            saveData(userCartKey, cartData);
        }
    });
    saveData(DB_PRODUCTS_KEY, allProducts);
    showToast("Produto apagado.", "success");
    renderAdminProductTable();
}
```

---

## 7. Melhorar Responsive Design para Mobile

```html
<!-- No index.html, adicionar ao <head>: -->
<style>
    @media (max-width: 768px) {
        body {
            padding-top: 60px;
        }

        #mainNavbar {
            position: static;
        }

        .product-card {
            border: 1px solid #e5e7eb;
        }

        input[type="number"] {
            font-size: 16px; /* Evitar zoom em mobile */
            padding: 10px;
        }

        .grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
    }

    @media (max-width: 480px) {
        .grid {
            grid-template-columns: 1fr;
        }
    }
</style>

<!-- Melhorar inputs em mobile: -->
<input 
    type="number" 
    inputmode="numeric" 
    pattern="[0-9]*"
    min="1" 
    max="100"
    class="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-md text-center dark:bg-slate-700"
>
```

---

## 8. Adicionar Busca de Produtos

```javascript
function searchProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
        renderProductListStore();
        return;
    }

    const filtered = Object.entries(allProducts).reduce((acc, [id, product]) => {
        if (
            product.name.toLowerCase().includes(term) ||
            id.toLowerCase().includes(term)
        ) {
            acc[id] = product;
        }
        return acc;
    }, {});

    renderFilteredProducts(filtered);
}

function renderFilteredProducts(products) {
    const container = document.getElementById('productListContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(products).length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">Nenhum produto encontrado.</p>';
        return;
    }

    for (const id in products) {
        const product = products[id];
        if (product.stock <= 0) continue;

        const card = document.createElement('div');
        card.className = 'product-card bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col';
        card.innerHTML = `
            <img src="${product.imageUrl || 'https://placehold.co/400x225/cccccc/333333?text=Sem+Imagem'}" alt="${product.name}">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-2 truncate">${product.name}</h3>
                <p class="text-gray-700 dark:text-slate-300 mb-1 text-sm">Cód: ${id}</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">R$ ${product.price.toFixed(2)}</p>
                <p class="text-sm text-gray-600 dark:text-slate-400 mb-3">Em stock: ${product.stock}</p>
                <div class="mt-auto flex items-center space-x-2">
                    <input type="number" id="qty-store-${id}" value="1" min="1" max="${product.stock}" class="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-md">
                    <button class="flex-grow bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-md text-sm" 
                            onclick="addProductToCart('${id}', 'qty-store-${id}')">
                        <i class="fas fa-cart-plus mr-1"></i>Adicionar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

// HTML para search:
// <input 
//     type="text" 
//     id="productSearchInput"
//     placeholder="Buscar produtos..."
//     class="w-full p-3 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 mb-6"
//     oninput="searchProducts(this.value)"
// >
```

---

## 9. Adicionar Paginação

```javascript
const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;

function renderProductListStorePaginated() {
    const allProductsArray = Object.entries(allProducts)
        .filter(([id, product]) => product.stock > 0)
        .sort((a, b) => a[1].name.localeCompare(b[1].name));

    const totalPages = Math.ceil(allProductsArray.length / PRODUCTS_PER_PAGE);
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    const pageProducts = allProductsArray.slice(start, end);

    const container = document.getElementById('productListContainer');
    container.innerHTML = '';

    if (pageProducts.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Nenhum produto nesta página.</p>';
        return;
    }

    pageProducts.forEach(([id, product]) => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col';
        card.innerHTML = `
            <img src="${product.imageUrl || 'https://placehold.co/400x225/cccccc/333333?text=Sem+Imagem'}" alt="${product.name}">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-xl font-semibold text-sky-700 dark:text-sky-400 mb-2 truncate">${product.name}</h3>
                <p class="text-gray-700 dark:text-slate-300 mb-1 text-sm">Cód: ${id}</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">R$ ${product.price.toFixed(2)}</p>
                <p class="text-sm text-gray-600 dark:text-slate-400 mb-3">Em stock: ${product.stock}</p>
                <div class="mt-auto flex items-center space-x-2">
                    <input type="number" id="qty-store-${id}" value="1" min="1" max="${product.stock}" class="w-20 p-2 border border-gray-300 dark:border-slate-600 rounded-md">
                    <button class="flex-grow bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-md text-sm" 
                            onclick="addProductToCart('${id}', 'qty-store-${id}')">
                        <i class="fas fa-cart-plus mr-1"></i>Adicionar
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Renderizar controles de paginação
    if (totalPages > 1) {
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'col-span-full flex justify-center items-center space-x-2 mt-8';
        
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `px-3 py-2 rounded-md ${i === currentPage ? 'bg-sky-600 text-white' : 'bg-gray-300 dark:bg-slate-700'}`;
            btn.textContent = i;
            btn.onclick = () => {
                currentPage = i;
                renderProductListStorePaginated();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            paginationDiv.appendChild(btn);
        }

        container.parentElement.appendChild(paginationDiv);
    }
}
```

---

## 10. Sistema de Categorias Simples

```javascript
const DB_CATEGORIES_KEY = 'gestorProPlus_categories_v2';

function loadInitialCategories() {
    const defaultCategories = {
        'escritorio': 'Artigos de Escritório',
        'informatica': 'Informática',
        'papelaria': 'Papelaria',
        'outros': 'Outros'
    };
    return loadData(DB_CATEGORIES_KEY, defaultCategories);
}

function assignCategoryToProduct(productId, categoryId) {
    if (allProducts[productId]) {
        allProducts[productId].category = categoryId || 'outros';
        saveData(DB_PRODUCTS_KEY, allProducts);
    }
}

function filterProductsByCategory(categoryId) {
    const filtered = Object.entries(allProducts).reduce((acc, [id, product]) => {
        if (!categoryId || product.category === categoryId) {
            acc[id] = product;
        }
        return acc;
    }, {});
    renderFilteredProducts(filtered);
}

// HTML:
// <div class="mb-6 flex space-x-2 overflow-x-auto pb-2">
//     <button onclick="filterProductsByCategory()" class="px-4 py-2 bg-sky-600 text-white rounded-full whitespace-nowrap">Todos</button>
//     <button onclick="filterProductsByCategory('escritorio')" class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-full whitespace-nowrap">Escritório</button>
//     <button onclick="filterProductsByCategory('informatica')" class="px-4 py-2 bg-gray-300 dark:bg-slate-700 rounded-full whitespace-nowrap">Informática</button>
// </div>
```

---

Estas são as **correções mais práticas e fáceis de implementar agora**. Recomendo implementá-las na ordem acima para melhorar significativamente a qualidade do sistema!

