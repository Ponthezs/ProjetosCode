/**
 * layout.js — monta a sidebar e o header em toda página autenticada,
 * aplica o tema salvo, e liga os comportamentos de UI do cabeçalho
 * (busca global, notificações, menu do usuário, tela cheia, colapsar sidebar).
 */
const Layout = (() => {
  const BRAND_NAME = 'Fluxen ERP';
  const BRAND_MARK_SRC = '../assets/logo/fluxen-mark.png';

  const MENU = [
    { type: 'link', key: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high', href: 'dashboard.html' },
    { type: 'group', key: 'cadastros', label: 'Cadastros', icon: 'fa-address-book', children: [
      { key: 'clientes', label: 'Clientes', href: 'clientes.html' },
      { key: 'fornecedores', label: 'Fornecedores', href: 'fornecedores.html' },
      { key: 'produtos', label: 'Produtos', href: 'produtos.html' },
      { key: 'produtos', label: 'Categorias', href: 'produtos.html?tab=categorias' },
    ] },
    { type: 'group', key: 'estoque-group', label: 'Estoque', icon: 'fa-boxes-stacked', children: [
      { key: 'produtos', label: 'Produtos', href: 'produtos.html' },
      { key: 'estoque', label: 'Movimentações', href: 'estoque.html?tab=movimentacoes' },
      { key: 'estoque', label: 'Inventário', href: 'estoque.html?tab=movimentacoes&type=inventario' },
      { key: 'estoque', label: 'Estoque mínimo', href: 'estoque.html?tab=minimo' },
    ] },
    { type: 'link', key: 'vendas', label: 'Vendas', icon: 'fa-cart-shopping', href: 'vendas.html' },
    { type: 'link', key: 'compras', label: 'Compras', icon: 'fa-truck-fast', href: 'compras.html' },
    { type: 'group', key: 'financeiro-group', label: 'Financeiro', icon: 'fa-sack-dollar', children: [
      { key: 'financeiro', label: 'Dashboard financeiro', href: 'financeiro.html' },
      { key: 'contas-pagar', label: 'Contas a pagar', href: 'contas-pagar.html' },
      { key: 'contas-receber', label: 'Contas a receber', href: 'contas-receber.html' },
      { key: 'fluxo-caixa', label: 'Fluxo de caixa', href: 'fluxo-caixa.html' },
      { key: 'financeiro', label: 'Categorias financeiras', href: 'financeiro.html?tab=categorias' },
    ] },
    { type: 'link', key: 'relatorios', label: 'Relatórios', icon: 'fa-chart-column', href: 'relatorios.html' },
    { type: 'link', key: 'usuarios', label: 'Usuários', icon: 'fa-users', href: 'usuarios.html' },
    { type: 'link', key: 'configuracoes', label: 'Configurações', icon: 'fa-gear', href: 'configuracoes.html' },
  ];

  function currentPageFile() {
    return window.location.pathname.split('/').pop();
  }

  function renderMenuItem(item, allowed) {
    if (item.type === 'group') {
      const children = item.children.filter((c) => allowed.includes(c.key));
      if (children.length === 0) return '';
      const isActiveGroup = children.some((c) => c.href.split('?')[0] === currentPageFile());
      return `
        <div class="nav-item">
          <button type="button" class="nav-toggle" aria-expanded="${isActiveGroup}" data-group="${item.key}">
            <i class="fa-solid ${item.icon} nav-icon"></i><span class="nav-text">${item.label}</span><i class="fa-solid fa-chevron-right chevron"></i>
          </button>
          <div class="nav-sub ${isActiveGroup ? 'open' : ''}" data-group-panel="${item.key}">
            ${children.map((c) => `<a class="nav-link ${c.href.split('?')[0] === currentPageFile() ? 'active' : ''}" href="${c.href}">${c.label}</a>`).join('')}
          </div>
        </div>`;
    }
    if (!allowed.includes(item.key)) return '';
    const active = item.href.split('?')[0] === currentPageFile();
    return `<a class="nav-link ${active ? 'active' : ''}" href="${item.href}" data-tooltip="${item.label}"><i class="fa-solid ${item.icon}"></i><span class="nav-text">${item.label}</span></a>`;
  }

  function renderSidebar(user) {
    const allowed = Auth.allowedModules(user.role);
    const settings = StorageService.getSetting(SETTINGS_KEYS.SETTINGS, {});
    const collapsed = !!settings.sidebarCollapsed;
    const items = MENU.map((i) => renderMenuItem(i, allowed)).join('');
    return `
      <aside class="sidebar ${collapsed ? 'collapsed' : ''}" id="appSidebar">
        <div class="sidebar-brand">
          <div class="brand-mark"><img src="${BRAND_MARK_SRC}" alt="Fluxen"></div>
          <div class="brand-text">
            <div class="brand-name">${BRAND_NAME}</div>
            <div class="brand-sub">Gestão que move o seu negócio</div>
          </div>
        </div>
        <nav class="sidebar-nav">${items}</nav>
        <div class="sidebar-collapse-btn">
          <button type="button" id="sidebarCollapseBtn" data-tooltip="Recolher menu">
            <i class="fa-solid fa-angles-${collapsed ? 'right' : 'left'}"></i>
          </button>
        </div>
      </aside>
      <div class="mobile-overlay" id="mobileOverlay"></div>`;
  }

  function renderHeader(user) {
    return `
      <header class="app-header">
        <div class="header-left">
          <button type="button" class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Abrir menu"><i class="fa-solid fa-bars"></i></button>
          <div class="global-search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input type="text" id="globalSearchInput" placeholder="Buscar clientes, produtos, vendas, fornecedores..." autocomplete="off">
            <div class="search-results" id="globalSearchResults" hidden></div>
          </div>
        </div>
        <div class="header-right">
          <button type="button" class="icon-btn" id="fullscreenBtn" data-tooltip="Tela cheia"><i class="fa-solid fa-expand"></i></button>
          <button type="button" class="icon-btn" id="themeToggleBtn" data-tooltip="Alternar tema"><i class="fa-solid fa-moon"></i></button>
          <div style="position:relative">
            <button type="button" class="icon-btn" id="notifBtn" data-tooltip="Notificações">
              <i class="fa-solid fa-bell"></i><span class="icon-badge" id="notifBadge" hidden>0</span>
            </button>
            <div class="dropdown-panel notif-panel" id="notifPanel" hidden></div>
          </div>
          <div class="user-menu">
            <button type="button" class="user-menu-trigger" id="userMenuBtn">
              <div class="avatar">${Utils.initials(user.name)}</div>
              <div class="user-meta"><div class="user-name">${Utils.escapeHtml(user.name)}</div><div class="user-role">${Utils.escapeHtml(user.role)}</div></div>
              <i class="fa-solid fa-chevron-down" style="font-size:11px;color:var(--text-subtle)"></i>
            </button>
            <div class="dropdown-panel" id="userMenuPanel" hidden style="min-width:210px">
              <div class="dp-header"><div class="dp-name">${Utils.escapeHtml(user.name)}</div><div class="dp-email">${Utils.escapeHtml(user.email)}</div></div>
              <a class="dropdown-item" href="configuracoes.html?tab=empresa"><i class="fa-solid fa-user"></i> Meu perfil</a>
              <a class="dropdown-item" href="configuracoes.html"><i class="fa-solid fa-gear"></i> Configurações</a>
              <a class="dropdown-item" href="configuracoes.html?tab=seguranca"><i class="fa-solid fa-key"></i> Alterar senha</a>
              <div class="dropdown-divider"></div>
              <button type="button" class="dropdown-item danger" id="logoutBtn" style="width:100%;border:none;background:none;text-align:left;cursor:pointer"><i class="fa-solid fa-right-from-bracket"></i> Sair</button>
            </div>
          </div>
        </div>
      </header>`;
  }

  // ---------------- Tema ----------------
  function applyThemeIcon() {
    const settings = StorageService.getSetting(SETTINGS_KEYS.SETTINGS, {});
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggleBtn i');
    if (icon) icon.className = `fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
  }

  function toggleTheme() {
    const settings = StorageService.getSetting(SETTINGS_KEYS.SETTINGS, {});
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    StorageService.setSetting(SETTINGS_KEYS.SETTINGS, settings);
    applyThemeIcon();
  }

  // ---------------- Painéis (dropdown) ----------------
  function closeAllPanels(except) {
    ['notifPanel', 'userMenuPanel', 'globalSearchResults'].forEach((id) => {
      if (id === except) return;
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
  }

  function renderNotifPanel() {
    const panel = document.getElementById('notifPanel');
    const badge = document.getElementById('notifBadge');
    if (!panel || !badge) return;
    const notifs = window.NotificationService ? NotificationService.getAll().slice(0, 20) : [];
    const unread = window.NotificationService ? NotificationService.unreadCount() : 0;
    badge.hidden = unread === 0;
    badge.textContent = unread > 9 ? '9+' : String(unread);

    const ICONS = { estoque: ['fa-box', 'badge-warning'], financeiro: ['fa-sack-dollar', 'badge-danger'], venda: ['fa-cart-shopping', 'badge-success'] };
    const list = notifs.length === 0
      ? '<div class="notif-empty"><i class="fa-regular fa-bell-slash" style="font-size:22px;display:block;margin-bottom:8px;color:var(--n-300)"></i>Nenhuma notificação por aqui.</div>'
      : notifs.map((n) => {
        const [icon, tone] = ICONS[n.type] || ['fa-circle-info', 'badge-info'];
        const toneVar = tone === 'badge-warning' ? ['var(--warning-100)', 'var(--warning-600)'] : tone === 'badge-danger' ? ['var(--danger-100)', 'var(--danger-600)'] : tone === 'badge-success' ? ['var(--success-100)', 'var(--success-600)'] : ['var(--info-100)', 'var(--info-600)'];
        return `<div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" data-link="${n.link || ''}">
          <div class="notif-icon" style="background:${toneVar[0]};color:${toneVar[1]}"><i class="fa-solid ${icon}"></i></div>
          <div class="notif-body"><div class="notif-msg">${Utils.escapeHtml(n.message)}</div><div class="notif-time">${Utils.formatDate(n.date, true)}</div></div>
        </div>`;
      }).join('');

    panel.innerHTML = `
      <div class="dp-header"><strong style="font-size:13.5px">Notificações</strong>
        <button type="button" class="btn btn-ghost btn-sm" id="notifMarkAllBtn">Marcar todas como lidas</button>
      </div>
      <div class="notif-list">${list}</div>`;

    const markAllBtn = panel.querySelector('#notifMarkAllBtn');
    if (markAllBtn) markAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      NotificationService.markAllRead();
      renderNotifPanel();
    });
    panel.querySelectorAll('.notif-item').forEach((el) => {
      el.addEventListener('click', () => {
        NotificationService.markRead(el.dataset.notifId);
        if (el.dataset.link) window.location.href = el.dataset.link;
        else renderNotifPanel();
      });
    });
  }

  function performGlobalSearch(term) {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    const customers = (window.CustomerService ? CustomerService.getAll() : []).filter((c) => c.name.toLowerCase().includes(t) || Utils.onlyDigits(c.document).includes(Utils.onlyDigits(t))).slice(0, 4);
    const suppliers = (window.SupplierService ? SupplierService.getAll() : []).filter((s) => s.name.toLowerCase().includes(t)).slice(0, 4);
    const products = (window.ProductService ? ProductService.getAll() : []).filter((p) => p.name.toLowerCase().includes(t) || (p.sku || '').toLowerCase().includes(t) || (p.code || '').toLowerCase().includes(t)).slice(0, 4);
    const sales = (window.SalesService ? SalesService.getAll() : []).filter((s) => s.number.toLowerCase().includes(t)).slice(0, 4);
    return { customers, suppliers, products, sales };
  }

  function renderSearchResults(results) {
    const box = document.getElementById('globalSearchResults');
    if (!box) return;
    if (!results) { box.hidden = true; return; }
    const groups = [
      { label: 'Clientes', items: results.customers, sub: (r) => r.document || r.email, href: (r) => `clientes.html?q=${encodeURIComponent(r.name)}` },
      { label: 'Fornecedores', items: results.suppliers, sub: (r) => r.document || r.email, href: (r) => `fornecedores.html?q=${encodeURIComponent(r.name)}` },
      { label: 'Produtos', items: results.products, sub: (r) => `SKU ${r.sku || '—'} · ${Utils.formatCurrency(r.salePrice)}`, href: (r) => `produtos.html?q=${encodeURIComponent(r.name)}` },
      { label: 'Vendas', items: results.sales, sub: (r) => `${Utils.formatDate(r.date)} · ${Utils.formatCurrency(r.total)}`, name: (r) => r.number, href: (r) => `vendas.html?q=${encodeURIComponent(r.number)}` },
    ].filter((g) => g.items.length > 0);

    if (groups.length === 0) {
      box.innerHTML = '<div class="sr-empty">Nenhum resultado encontrado.</div>';
    } else {
      box.innerHTML = groups.map((g) => `
        <div class="sr-group-label">${g.label}</div>
        ${g.items.map((r) => `
          <div class="sr-item" data-href="${g.href(r)}">
            <span class="sr-title">${Utils.escapeHtml(g.name ? g.name(r) : r.name)}</span>
            <span class="sr-meta">${Utils.escapeHtml(g.sub(r))}</span>
          </div>`).join('')}
      `).join('');
      box.querySelectorAll('.sr-item').forEach((el) => el.addEventListener('click', () => { window.location.href = el.dataset.href; }));
    }
    box.hidden = false;
  }

  function bindEvents() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) {
      sidebar.querySelectorAll('.nav-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
          const panel = sidebar.querySelector(`[data-group-panel="${btn.dataset.group}"]`);
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
          if (panel) panel.classList.toggle('open', !expanded);
        });
      });
    }
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if (collapseBtn) collapseBtn.addEventListener('click', () => {
      const settings = StorageService.getSetting(SETTINGS_KEYS.SETTINGS, {});
      settings.sidebarCollapsed = !settings.sidebarCollapsed;
      StorageService.setSetting(SETTINGS_KEYS.SETTINGS, settings);
      sidebar.classList.toggle('collapsed', settings.sidebarCollapsed);
      collapseBtn.querySelector('i').className = `fa-solid fa-angles-${settings.sidebarCollapsed ? 'right' : 'left'}`;
    });

    const mobileBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.getElementById('mobileOverlay');
    if (mobileBtn && sidebar && overlay) {
      mobileBtn.addEventListener('click', () => { sidebar.classList.add('mobile-open'); overlay.classList.add('show'); });
      overlay.addEventListener('click', () => { sidebar.classList.remove('mobile-open'); overlay.classList.remove('show'); });
      sidebar.querySelectorAll('.nav-link').forEach((a) => a.addEventListener('click', () => { sidebar.classList.remove('mobile-open'); overlay.classList.remove('show'); }));
    }

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    });

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const notifBtn = document.getElementById('notifBtn');
    const notifPanel = document.getElementById('notifPanel');
    if (notifBtn && notifPanel) notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willShow = notifPanel.hidden;
      closeAllPanels();
      if (willShow) { renderNotifPanel(); notifPanel.hidden = false; } else notifPanel.hidden = true;
    });

    const userBtn = document.getElementById('userMenuBtn');
    const userPanel = document.getElementById('userMenuPanel');
    if (userBtn && userPanel) userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willShow = userPanel.hidden;
      closeAllPanels();
      userPanel.hidden = !willShow;
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => Auth.logout());

    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      const doSearch = Utils.debounce(() => renderSearchResults(performGlobalSearch(searchInput.value)), 220);
      searchInput.addEventListener('input', doSearch);
      searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) renderSearchResults(performGlobalSearch(searchInput.value)); });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.global-search')) { const r = document.getElementById('globalSearchResults'); if (r) r.hidden = true; }
      if (!e.target.closest('.user-menu')) { const p = document.getElementById('userMenuPanel'); if (p) p.hidden = true; }
      if (!e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')) { const p = document.getElementById('notifPanel'); if (p) p.hidden = true; }
    });
  }

  function init({ moduleKey }) {
    if (!Auth.guardPage(moduleKey)) return false;
    const user = Auth.currentUser();
    const sidebarRoot = document.getElementById('sidebar-root');
    const headerRoot = document.getElementById('header-root');
    if (sidebarRoot) sidebarRoot.innerHTML = renderSidebar(user);
    if (headerRoot) headerRoot.innerHTML = renderHeader(user);
    applyThemeIcon();
    bindEvents();
    if (window.NotificationService) NotificationService.refreshAutomatic();
    document.body.classList.add('layout-ready');
    return true;
  }

  return { init, BRAND_NAME };
})();
