/**
 * auth.js — sessão do usuário, login/logout e controle de permissões por perfil.
 */
const ROLE_MODULES = {
  'Administrador': ['dashboard', 'clientes', 'fornecedores', 'produtos', 'estoque', 'vendas', 'compras',
    'financeiro', 'contas-pagar', 'contas-receber', 'fluxo-caixa', 'relatorios', 'usuarios', 'configuracoes'],
  'Gerente': ['dashboard', 'clientes', 'fornecedores', 'produtos', 'estoque', 'vendas', 'compras',
    'financeiro', 'contas-pagar', 'contas-receber', 'fluxo-caixa', 'relatorios', 'configuracoes'],
  'Financeiro': ['dashboard', 'financeiro', 'contas-pagar', 'contas-receber', 'fluxo-caixa', 'relatorios'],
  'Vendedor': ['dashboard', 'clientes', 'produtos', 'vendas', 'relatorios'],
  'Estoque': ['dashboard', 'produtos', 'fornecedores', 'estoque', 'compras'],
  'Usuário': ['dashboard'],
};

const ROLE_DESCRIPTIONS = {
  'Administrador': 'Acesso completo a todos os módulos do sistema.',
  'Gerente': 'Acesso a todos os módulos operacionais, sem gestão de usuários.',
  'Financeiro': 'Acesso ao módulo financeiro, contas a pagar/receber, fluxo de caixa e relatórios.',
  'Vendedor': 'Acesso a clientes, produtos (consulta) e vendas.',
  'Estoque': 'Acesso a produtos, fornecedores, estoque e compras.',
  'Usuário': 'Acesso apenas ao dashboard geral.',
};

const Auth = (() => {
  const SESSION_KEY = SETTINGS_KEYS.SESSION;

  function _hash(str) {
    // Hash simples (não criptográfico) apenas para não guardar senha em texto puro
    // nesta demonstração front-end. Em produção, a validação de senha deve
    // ocorrer inteiramente no backend, nunca no cliente.
    let hash = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return 'h' + Math.abs(hash).toString(36) + s.length;
  }

  function hashPassword(pw) { return _hash(pw); }

  function login(email, password, rememberMe) {
    const users = StorageService.getAll(COLLECTIONS.USERS);
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return { ok: false, message: 'E-mail ou senha inválidos.' };
    if (user.status === 'inativo') return { ok: false, message: 'Este usuário está inativo. Contate o administrador.' };
    if (user.passwordHash !== _hash(password)) return { ok: false, message: 'E-mail ou senha inválidos.' };

    const session = { userId: user.id, name: user.name, email: user.email, role: user.role, loginAt: new Date().toISOString() };
    const payload = JSON.stringify(session);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
      localStorage.removeItem(SESSION_KEY);
    }
    return { ok: true, user: session };
  }

  function currentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function isAuthenticated() {
    return !!currentUser();
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = computeRelativePath('login.html');
  }

  function inPagesDir() {
    return window.location.pathname.includes('/pages/');
  }

  function computeRelativePath(target) {
    // As páginas públicas (login/cadastro) ficam em /public; as páginas
    // autenticadas ficam em /pages — ambas a um nível de profundidade da raiz.
    return inPagesDir() ? `../public/${target}` : target;
  }

  function dashboardPath() {
    return inPagesDir() ? 'dashboard.html' : '../pages/dashboard.html';
  }

  function allowedModules(role) {
    return ROLE_MODULES[role] || [];
  }

  function canAccess(moduleKey) {
    const user = currentUser();
    if (!user) return false;
    return allowedModules(user.role).includes(moduleKey);
  }

  /** Deve ser chamado no topo de toda página protegida, passando a chave do módulo daquela página. */
  function guardPage(moduleKey) {
    if (!isAuthenticated()) {
      window.location.replace(computeRelativePath('login.html'));
      return false;
    }
    if (moduleKey && !canAccess(moduleKey)) {
      window.location.replace(dashboardPath());
      return false;
    }
    return true;
  }

  return {
    hashPassword, login, currentUser, isAuthenticated, logout, allowedModules,
    canAccess, guardPage, computeRelativePath, dashboardPath, inPagesDir, ROLE_MODULES, ROLE_DESCRIPTIONS,
  };
})();
