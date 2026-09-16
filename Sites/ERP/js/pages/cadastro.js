/**
 * cadastro.js — criação de conta (usuário Administrador + dados da empresa).
 */
(function () {
  SeedData.ensureSeeded();

  if (Auth.isAuthenticated()) {
    window.location.replace('pages/dashboard.html');
    return;
  }

  document.getElementById('footerYear').textContent = new Date().getFullYear();

  const form = document.getElementById('signupForm');
  const fields = {
    name: document.getElementById('suName'),
    email: document.getElementById('suEmail'),
    company: document.getElementById('suCompany'),
    cnpj: document.getElementById('suCnpj'),
    phone: document.getElementById('suPhone'),
    password: document.getElementById('suPassword'),
    passwordConfirm: document.getElementById('suPasswordConfirm'),
    terms: document.getElementById('suTerms'),
  };
  const submitBtn = document.getElementById('signupSubmitBtn');

  function togglePassword(btnId, inputEl) {
    document.getElementById(btnId).addEventListener('click', (e) => {
      const icon = e.currentTarget.querySelector('i');
      const showing = inputEl.type === 'text';
      inputEl.type = showing ? 'password' : 'text';
      icon.className = `fa-solid ${showing ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }
  togglePassword('toggleSuPassword', fields.password);
  togglePassword('toggleSuPasswordConfirm', fields.passwordConfirm);

  fields.cnpj.addEventListener('input', (e) => { e.target.value = Utils.maskCNPJ(e.target.value); });
  fields.phone.addEventListener('input', (e) => { e.target.value = Utils.maskPhone(e.target.value); });

  function setError(key, message) {
    const input = fields[key];
    const errorEl = document.getElementById(`su${key.charAt(0).toUpperCase() + key.slice(1)}Error`);
    if (input.closest('.form-field')) input.closest('.form-field').classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    Object.keys(fields).forEach((key) => {
      const input = fields[key];
      if (input.closest && input.closest('.form-field')) input.closest('.form-field').classList.remove('has-error');
      const errorEl = document.getElementById(`su${key.charAt(0).toUpperCase() + key.slice(1)}Error`);
      if (errorEl) errorEl.textContent = '';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let hasError = false;
    if (!fields.name.value.trim()) { setError('name', 'Informe seu nome.'); hasError = true; }
    if (!Utils.validateEmail(fields.email.value)) { setError('email', 'Informe um e-mail válido.'); hasError = true; }
    if (!fields.company.value.trim()) { setError('company', 'Informe o nome da sua empresa.'); hasError = true; }
    if (fields.cnpj.value.trim() && !Utils.validateCNPJ(fields.cnpj.value)) { setError('cnpj', 'CNPJ inválido.'); hasError = true; }
    if (!fields.password.value || fields.password.value.length < 6) { setError('password', 'A senha deve ter ao menos 6 caracteres.'); hasError = true; }
    if (fields.passwordConfirm.value !== fields.password.value) { setError('passwordConfirm', 'As senhas não coincidem.'); hasError = true; }
    if (!fields.terms.checked) { document.getElementById('suTermsError').textContent = 'É necessário concordar para continuar.'; hasError = true; }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando conta...';

    setTimeout(() => {
      try {
        UserService.create({
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          role: 'Administrador',
          status: 'ativo',
          password: fields.password.value,
        });

        CompanyService.updateCompany({
          corporateName: fields.company.value.trim(),
          cnpj: fields.cnpj.value.trim(),
          phone: fields.phone.value.trim(),
          email: fields.email.value.trim(),
        });

        const result = Auth.login(fields.email.value.trim(), fields.password.value, true);
        if (result.ok) {
          Toast.show('Conta criada com sucesso! Redirecionando...', 'success');
          setTimeout(() => { window.location.href = 'pages/dashboard.html'; }, 600);
        } else {
          Toast.show('Conta criada. Faça login para continuar.', 'success');
          setTimeout(() => { window.location.href = 'login.html'; }, 900);
        }
      } catch (err) {
        Toast.show((err && err.message) || 'Não foi possível criar sua conta.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Criar conta';
      }
    }, 300);
  });
})();
