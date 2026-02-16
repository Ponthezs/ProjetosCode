/* Login - credenciais padrão: admin / 1234 */

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('datailer_logged')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('usuario').value.trim();
        const pass = document.getElementById('senha').value;

        if (user === 'admin' && pass === '1234') {
            sessionStorage.setItem('datailer_logged', '1');
            window.location.href = 'dashboard.html';
        } else {
            alert('Usuário ou senha incorretos.');
        }
    });
});
