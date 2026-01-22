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

function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>\"']/g, char => {
        const map = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[char];
    });
}

function validateImageUrl(url) {
    if (!url || url.trim() === '') return { valid: true };
    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, error: 'URL de imagem inválida' };
    }
}

function hashPassword(password) {
    if (typeof CryptoJS === 'undefined') {
        console.warn('CryptoJS não carregado. Usando password em texto plano como fallback.');
        return password;
    }
    return CryptoJS.SHA256(password + 'salt_secret_key_erp_2025').toString();
}

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
