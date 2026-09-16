/**
 * login.js — tela de autenticação.
 */
(function () {
  SeedData.ensureSeeded();

  if (Auth.isAuthenticated()) {
    window.location.replace('pages/dashboard.html');
    return;
  }

  document.getElementById('footerYear').textContent = new Date().getFullYear();

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const emailError = document.getElementById('loginEmailError');
  const passwordError = document.getElementById('loginPasswordError');
  const submitBtn = document.getElementById('loginSubmitBtn');

  document.getElementById('togglePasswordBtn').addEventListener('click', (e) => {
    const icon = e.currentTarget.querySelector('i');
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    icon.className = `fa-solid ${showing ? 'fa-eye' : 'fa-eye-slash'}`;
  });

  document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
    e.preventDefault();
    Modal.open({
      title: 'Recuperar acesso',
      size: 'sm',
      bodyHtml: `<p>Por segurança, a redefinição de senha é feita pelo administrador do sistema em <strong>Usuários</strong>.
        Entre em contato com o administrador da sua empresa para solicitar uma nova senha.</p>`,
      footerHtml: `<button type="button" class="btn btn-primary" data-act="ok">Entendi</button>`,
    }).overlay.querySelector('[data-act="ok"]').addEventListener('click', (e2) => e2.target.closest('.modal-overlay').querySelector('.modal-close').click());
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.closest('.form-field').classList.remove('has-error');
    passwordInput.closest('.form-field').classList.remove('has-error');

    let hasError = false;
    if (!Utils.validateEmail(emailInput.value)) {
      emailError.textContent = 'Informe um e-mail válido.';
      emailInput.closest('.form-field').classList.add('has-error');
      hasError = true;
    }
    if (!passwordInput.value) {
      passwordError.textContent = 'Informe sua senha.';
      passwordInput.closest('.form-field').classList.add('has-error');
      hasError = true;
    }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';

    setTimeout(() => {
      const result = Auth.login(emailInput.value.trim(), passwordInput.value, document.getElementById('rememberMe').checked);
      if (result.ok) {
        window.location.href = 'pages/dashboard.html';
      } else {
        Toast.show(result.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Entrar';
      }
    }, 300);
  });
})();
