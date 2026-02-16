/* ===== DATAILER - CORE APP ===== */

const STORAGE_KEYS = {
    clientes: 'datailer_clientes',
    servicos: 'datailer_servicos',
    agendamentos: 'datailer_agendamentos',
    orcamentos: 'datailer_orcamentos',
};

// Serviços padrão
const SERVICOS_PADRAO = [
    { id: 's1', nome: 'Polimento', preco: 350, duracao: 180, descricao: 'Polimento completo' },
    { id: 's2', nome: 'Cristalização', preco: 800, duracao: 240, descricao: 'Cristalização da pintura' },
    { id: 's3', nome: 'Revestimento Cerâmico', preco: 2500, duracao: 480, descricao: 'Proteção nanotecnológica' },
    { id: 's4', nome: 'Vitrificação de Vidros', preco: 200, duracao: 60, descricao: 'Proteção hidrofóbica' },
    { id: 's5', nome: 'Detalhamento Interno', preco: 400, duracao: 120, descricao: 'Higienização profunda' },
];

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function getClientes() {
    return getStorage(STORAGE_KEYS.clientes) || [];
}

function setClientes(arr) {
    return setStorage(STORAGE_KEYS.clientes, arr);
}

function getServicos() {
    let s = getStorage(STORAGE_KEYS.servicos);
    if (!s || s.length === 0) {
        s = SERVICOS_PADRAO.map((x, i) => ({ ...x, id: x.id || 's' + (i + 1) }));
        setStorage(STORAGE_KEYS.servicos, s);
    }
    return s;
}

function setServicos(arr) {
    return setStorage(STORAGE_KEYS.servicos, arr);
}

function getAgendamentos() {
    return getStorage(STORAGE_KEYS.agendamentos) || [];
}

function setAgendamentos(arr) {
    return setStorage(STORAGE_KEYS.agendamentos, arr);
}

function getOrcamentos() {
    return getStorage(STORAGE_KEYS.orcamentos) || [];
}

function setOrcamentos(arr) {
    return setStorage(STORAGE_KEYS.orcamentos, arr);
}

function toast(msg, tipo = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

function formatarMoeda(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatarData(str) {
    if (!str) return '-';
    const d = new Date(str);
    return d.toLocaleDateString('pt-BR');
}

function formatarDataHora(str) {
    if (!str) return '-';
    const d = new Date(str);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function hojeStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function dataHoje(dtStr) {
    if (!dtStr) return false;
    return dtStr.slice(0, 10) === hojeStr();
}

// Proteção de rota
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', ''];
    const isPublic = publicPages.includes(page);

    if (!isPublic && !sessionStorage.getItem('datailer_logged')) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('datailer_logged');
            window.location.href = 'login.html';
        });
    }

    // Menu mobile
    const toggle = document.querySelector('.nav-mobile-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    if (toggle && navMobile) {
        toggle.addEventListener('click', () => navMobile.classList.toggle('active'));
    }
});
