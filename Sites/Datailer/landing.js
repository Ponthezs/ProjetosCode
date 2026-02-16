/* Landing page - menu mobile e smooth scroll */

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const navMobile = document.querySelector('.nav-mobile');

    if (toggle && navMobile) {
        toggle.addEventListener('click', () => navMobile.classList.toggle('active'));
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href === '#') return;
            const el = document.querySelector(href);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
                navMobile?.classList.remove('active');
            }
        });
    });
});
