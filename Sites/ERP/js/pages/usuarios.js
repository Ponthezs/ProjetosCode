/**
 * usuarios.js — administração de usuários e perfis de acesso.
 * A própria página já é protegida por Layout.init (somente Administrador
 * tem o módulo "usuarios" liberado em ROLE_MODULES); aqui apenas tratamos a
 * regra de não permitir que um usuário exclua o próprio login.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'usuarios' })) return;

  const ROLES = Object.keys(Auth.ROLE_MODULES);
  const DEFAULT_ROLE = ROLES.includes('Vendedor') ? 'Vendedor' : ROLES[0];

  const els = {
    rolesInfo: document.getElementById('rolesInfo'),
    search: document.getElementById('searchInput'),
    filterRole: document.getElementById('filterRole'),
    filterStatus: document.getElementById('filterStatus'),
    btnNovo: document.getElementById('btnNovo'),
    tableContainer: document.getElementById('tableContainer'),
  };

  let table;

  // ---------------------------------------------------------------------
  // Matriz de permissões (referência rápida)
  // ---------------------------------------------------------------------
  function renderRolesInfo() {
    els.rolesInfo.innerHTML = ROLES.map((role) => `
      <div class="role-chip">
        <div class="role-chip-title"><span class="badge ${role === 'Administrador' ? 'badge-gold' : 'badge-info'}">${Utils.escapeHtml(role)}</span></div>
        <div class="role-chip-desc">${Utils.escapeHtml(Auth.ROLE_DESCRIPTIONS[role] || '')}</div>
      </div>`).join('');
  }

  function fillRoleFilter() {
    els.filterRole.innerHTML = '<option value="">Perfil (todos)</option>' + ROLES.map((r) => `<option value="${Utils.escapeHtml(r)}">${Utils.escapeHtml(r)}</option>`).join('');
  }

  // ---------------------------------------------------------------------
  // Listagem
  // ---------------------------------------------------------------------
  function roleBadge(role) {
    return `<span class="badge ${role === 'Administrador' ? 'badge-gold' : 'badge-info'}">${Utils.escapeHtml(role)}</span>`;
  }

  function statusBadge(status) {
    return status === 'ativo' ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-neutral">Inativo</span>';
  }

  function applyFilters() {
    const term = els.search.value.trim().toLowerCase();
    const role = els.filterRole.value;
    const status = els.filterStatus.value;
    const filtered = UserService.getAll().filter((u) => {
      if (role && u.role !== role) return false;
      if (status && u.status !== status) return false;
      if (term) {
        const haystack = `${u.name || ''} ${u.email || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    table.setData(filtered);
  }

  // ---------------------------------------------------------------------
  // Cadastro / edição
  // ---------------------------------------------------------------------
  function buildFormFields(isEdit) {
    return [
      { name: 'name', label: 'Nome', type: 'text', required: true, colSpan: 2 },
      { name: 'email', label: 'E-mail', type: 'email', required: true, validate: (v) => (!Utils.validateEmail(v) ? 'E-mail inválido.' : null) },
      { name: 'login', label: 'Login', type: 'text', required: false, hint: 'Se deixado em branco, é gerado automaticamente a partir do e-mail.' },
      {
        name: 'role', label: 'Cargo/Perfil', type: 'select', required: true,
        options: ROLES.map((r) => ({ value: r, label: r })),
        onChange: (val, ctx) => { ctx.values.roleInfo = Auth.ROLE_DESCRIPTIONS[val] || ''; ctx.rerenderField('roleInfo'); },
      },
      { name: 'roleInfo', label: 'O que este perfil pode acessar', type: 'textarea', rows: 2, disabled: true, colSpan: 2, showOptional: false },
      {
        name: 'password', label: 'Senha', type: 'password', required: !isEdit,
        hint: isEdit ? 'Deixe em branco para manter a senha atual.' : 'Mínimo de 6 caracteres.',
        validate: (v) => (v && v.length < 6 ? 'A senha deve ter ao menos 6 caracteres.' : null),
      },
      {
        name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'ativo',
        options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }],
      },
    ];
  }

  function openForm(user) {
    const isEdit = !!user;
    const initialData = isEdit
      ? Object.assign({}, user, { roleInfo: user.profileDescription || Auth.ROLE_DESCRIPTIONS[user.role] || '', password: '' })
      : { role: DEFAULT_ROLE, status: 'ativo', roleInfo: Auth.ROLE_DESCRIPTIONS[DEFAULT_ROLE] || '' };

    Modal.form({
      title: isEdit ? `Editar usuário — ${user.name}` : 'Novo usuário',
      fields: buildFormFields(isEdit),
      initialData,
      submitLabel: isEdit ? 'Salvar alterações' : 'Cadastrar usuário',
      size: 'lg',
      onSubmit: async (data) => {
        const payload = { name: data.name.trim(), email: data.email.trim(), role: data.role, status: data.status };
        if (data.login && data.login.trim()) payload.login = data.login.trim();
        if (data.password) payload.password = data.password;
        if (isEdit) {
          UserService.update(user.id, payload);
          Toast.show('Usuário atualizado com sucesso.', 'success');
        } else {
          UserService.create(payload);
          Toast.show('Usuário cadastrado com sucesso.', 'success');
        }
        applyFilters();
      },
    });
  }

  function viewField(label, value) {
    return `<div class="view-item"><label>${Utils.escapeHtml(label)}</label><div class="view-value">${Utils.escapeHtml(value || '—')}</div></div>`;
  }

  function openView(u) {
    const bodyHtml = `
      <div class="view-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-4)">
        ${viewField('Nome', u.name)}
        ${viewField('E-mail', u.email)}
        ${viewField('Login', u.login)}
        ${viewField('Cargo/Perfil', u.role)}
        ${viewField('Status', u.status === 'ativo' ? 'Ativo' : 'Inativo')}
        ${viewField('Cadastrado em', Utils.formatDate(u.createdAt))}
      </div>
      <div style="margin-top:var(--space-4)">
        <label style="display:block;font-size:11.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.03em;margin-bottom:3px">Acesso do perfil</label>
        <div style="font-size:13.5px;color:var(--text)">${Utils.escapeHtml(u.profileDescription || Auth.ROLE_DESCRIPTIONS[u.role] || '—')}</div>
      </div>`;
    const inst = Modal.open({
      title: `Usuário — ${u.name}`,
      bodyHtml,
      footerHtml: '<button type="button" class="btn btn-secondary" data-act="close">Fechar</button>',
      size: 'md',
    });
    inst.overlay.querySelector('[data-act="close"]').addEventListener('click', inst.close);
  }

  async function handleDelete(u) {
    const ok = await Modal.confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir o usuário "${Utils.escapeHtml(u.name)}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    });
    if (!ok) return;
    try {
      UserService.remove(u.id);
      Toast.show('Usuário excluído com sucesso.', 'success');
      applyFilters();
    } catch (e) {
      Toast.show(e.message, 'error');
    }
  }

  function buildTable() {
    table = createDataTable(els.tableContainer, {
      columns: [
        { key: 'name', label: 'Nome', sortable: true },
        { key: 'email', label: 'E-mail', sortable: true },
        { key: 'login', label: 'Login' },
        { key: 'role', label: 'Cargo/Perfil', sortable: true, render: (u) => roleBadge(u.role) },
        { key: 'status', label: 'Status', sortable: true, render: (u) => statusBadge(u.status) },
      ],
      actions: [
        { icon: 'fa-eye', label: 'Visualizar', onClick: openView },
        { icon: 'fa-pen', label: 'Editar', onClick: openForm },
        { icon: 'fa-trash-can', label: 'Excluir', onClick: handleDelete },
      ],
      pageSize: 8,
      defaultSortKey: 'name',
      emptyMessage: 'Nenhum usuário encontrado.',
      emptyIcon: 'fa-users',
    });
  }

  function bindEvents() {
    els.search.addEventListener('input', Utils.debounce(applyFilters, 250));
    els.filterRole.addEventListener('change', applyFilters);
    els.filterStatus.addEventListener('change', applyFilters);
    els.btnNovo.addEventListener('click', () => openForm(null));
  }

  renderRolesInfo();
  fillRoleFilter();
  buildTable();
  bindEvents();
  applyFilters();
})();
