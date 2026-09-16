/**
 * configuracoes.js — dados da empresa, preferências do sistema, atalhos para
 * financeiro/usuários, alteração de senha e tema da interface.
 */
(function () {
  SeedData.ensureSeeded();
  if (!Layout.init({ moduleKey: 'configuracoes' })) return;

  const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  const VALID_TABS = ['empresa', 'sistema', 'financeiro', 'usuarios', 'seguranca', 'aparencia'];

  const panels = {
    empresa: document.getElementById('panelEmpresa'),
    sistema: document.getElementById('panelSistema'),
    financeiro: document.getElementById('panelFinanceiro'),
    usuarios: document.getElementById('panelUsuarios'),
    seguranca: document.getElementById('panelSeguranca'),
    aparencia: document.getElementById('panelAparencia'),
  };
  const tabButtons = document.querySelectorAll('#tabsBar .tab-btn');

  // ---------------------------------------------------------------------
  // Abas
  // ---------------------------------------------------------------------
  function setActiveTab(tab) {
    tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    Object.keys(panels).forEach((key) => { panels[key].hidden = key !== tab; });
  }

  function bindTabs() {
    tabButtons.forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
  }

  function applyPermissions() {
    // Somente Administrador tem o módulo "usuarios" liberado — esconde o
    // atalho para quem não tem acesso (ex.: Gerente, que acessa Configurações).
    if (!Auth.canAccess('usuarios')) {
      const btn = document.querySelector('#tabsBar [data-tab="usuarios"]');
      if (btn) btn.hidden = true;
    }
  }

  // ---------------------------------------------------------------------
  // Empresa
  // ---------------------------------------------------------------------
  function fillStateOptions() {
    const select = document.getElementById('companyState');
    select.innerHTML = '<option value="">Selecione</option>' + UFS.map((uf) => `<option value="${uf}">${uf}</option>`).join('');
  }

  function fillCompanyForm() {
    const c = CompanyService.getCompany();
    document.getElementById('companyCorporateName').value = c.corporateName || '';
    document.getElementById('companyTradeName').value = c.tradeName || '';
    document.getElementById('companyCnpj').value = c.cnpj || '';
    document.getElementById('companyPhone').value = c.phone || '';
    document.getElementById('companyEmail').value = c.email || '';
    document.getElementById('companyZip').value = c.zip || '';
    document.getElementById('companyAddress').value = c.address || '';
    document.getElementById('companyNumber').value = c.number || '';
    document.getElementById('companyComplement').value = c.complement || '';
    document.getElementById('companyDistrict').value = c.district || '';
    document.getElementById('companyCity').value = c.city || '';
    document.getElementById('companyState').value = c.state || '';
    setLogoPreview(c.logo || '');
  }

  function setLogoPreview(base64) {
    const img = document.getElementById('logoPreview');
    const placeholder = document.getElementById('logoPlaceholder');
    if (base64) { img.src = base64; img.hidden = false; placeholder.hidden = true; }
    else { img.src = ''; img.hidden = true; placeholder.hidden = false; }
  }

  function bindCompanyForm() {
    document.getElementById('companyCnpj').addEventListener('input', (e) => { e.target.value = Utils.maskCNPJ(e.target.value); });
    document.getElementById('companyPhone').addEventListener('input', (e) => { e.target.value = Utils.maskPhone(e.target.value); });
    document.getElementById('companyZip').addEventListener('input', (e) => { e.target.value = Utils.maskCEP(e.target.value); });

    let pendingLogo;
    document.getElementById('logoInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { Toast.show('Selecione um arquivo de imagem válido.', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = () => { pendingLogo = reader.result; setLogoPreview(pendingLogo); };
      reader.onerror = () => Toast.show('Não foi possível ler a imagem selecionada.', 'error');
      reader.readAsDataURL(file);
    });

    document.getElementById('companyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('companyEmail').value.trim();
      if (email && !Utils.validateEmail(email)) { Toast.show('Informe um e-mail válido.', 'warning'); return; }
      const patch = {
        corporateName: document.getElementById('companyCorporateName').value.trim(),
        tradeName: document.getElementById('companyTradeName').value.trim(),
        cnpj: document.getElementById('companyCnpj').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        email,
        zip: document.getElementById('companyZip').value.trim(),
        address: document.getElementById('companyAddress').value.trim(),
        number: document.getElementById('companyNumber').value.trim(),
        complement: document.getElementById('companyComplement').value.trim(),
        district: document.getElementById('companyDistrict').value.trim(),
        city: document.getElementById('companyCity').value.trim(),
        state: document.getElementById('companyState').value,
      };
      if (pendingLogo !== undefined) patch.logo = pendingLogo;
      try {
        CompanyService.updateCompany(patch);
        Toast.show('Dados da empresa atualizados com sucesso.', 'success');
      } catch (err) {
        Toast.show((err && err.message) || 'Não foi possível salvar os dados da empresa.', 'error');
      }
    });
  }

  // ---------------------------------------------------------------------
  // Sistema
  // ---------------------------------------------------------------------
  function bindSystemTab() {
    document.getElementById('btnResetDemo').addEventListener('click', async () => {
      const ok = await Modal.confirm({
        title: 'Restaurar dados de demonstração',
        message: 'Esta ação apaga TODOS os dados atualmente salvos neste navegador (clientes, produtos, vendas, usuários e demais registros) e recria os dados de demonstração originais. Esta ação não pode ser desfeita. Deseja continuar?',
        confirmText: 'Restaurar dados',
        cancelText: 'Cancelar',
        danger: true,
      });
      if (!ok) return;
      localStorage.clear();
      window.location.href = '../login.html';
    });
  }

  // ---------------------------------------------------------------------
  // Financeiro
  // ---------------------------------------------------------------------
  function renderFinCategoriesPreview() {
    const cats = FinancialService.getFinCategories();
    const box = document.getElementById('finCategoriesPreview');
    box.innerHTML = cats.length === 0
      ? '<span class="settings-note" style="margin-top:0">Nenhuma categoria financeira cadastrada.</span>'
      : cats.map((c) => `<span class="badge ${c.nature === 'receita' ? 'badge-success' : 'badge-danger'}">${Utils.escapeHtml(c.name)}</span>`).join('');
  }

  function bindFinanceiroTab() {
    document.getElementById('btnGoFinCategories').addEventListener('click', () => { window.location.href = 'financeiro.html?tab=categorias'; });
  }

  // ---------------------------------------------------------------------
  // Usuários
  // ---------------------------------------------------------------------
  function bindUsuariosTab() {
    document.getElementById('btnGoUsers').addEventListener('click', () => { window.location.href = 'usuarios.html'; });
  }

  // ---------------------------------------------------------------------
  // Segurança
  // ---------------------------------------------------------------------
  function bindSecurityTab() {
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('pwdCurrent').value;
      const next = document.getElementById('pwdNew').value;
      const confirmValue = document.getElementById('pwdConfirm').value;
      if (next !== confirmValue) { Toast.show('A nova senha e a confirmação não coincidem.', 'warning'); return; }
      try {
        const user = Auth.currentUser();
        UserService.changePassword(user.userId, current, next);
        Toast.show('Senha alterada com sucesso.', 'success');
        e.target.reset();
      } catch (err) {
        Toast.show((err && err.message) || 'Não foi possível alterar a senha.', 'error');
      }
    });
  }

  // ---------------------------------------------------------------------
  // Aparência
  // ---------------------------------------------------------------------
  function syncThemeUi(theme) {
    document.getElementById('themeSwitch').checked = theme === 'dark';
    document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Tema escuro' : 'Tema claro';
    const headerIcon = document.querySelector('#themeToggleBtn i');
    if (headerIcon) headerIcon.className = `fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
  }

  function bindAppearanceTab() {
    const settings = CompanyService.getSettings();
    syncThemeUi(settings.theme || 'light');
    document.getElementById('themeSwitch').addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      CompanyService.updateSettings({ theme });
      document.documentElement.setAttribute('data-theme', theme);
      syncThemeUi(theme);
    });
  }

  // ---------------------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------------------
  applyPermissions();
  bindTabs();
  fillStateOptions();
  fillCompanyForm();
  bindCompanyForm();
  bindSystemTab();
  renderFinCategoriesPreview();
  bindFinanceiroTab();
  bindUsuariosTab();
  bindSecurityTab();
  bindAppearanceTab();

  const requestedTab = new URLSearchParams(window.location.search).get('tab');
  const initialTab = VALID_TABS.includes(requestedTab) && !(requestedTab === 'usuarios' && !Auth.canAccess('usuarios')) ? requestedTab : 'empresa';
  setActiveTab(initialTab);
})();
