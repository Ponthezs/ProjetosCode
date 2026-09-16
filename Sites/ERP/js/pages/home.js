/**
 * home.js — página institucional (home) do Fluxen ERP.
 * Sem dependência de dados de negócio: apenas sessão (para adaptar os
 * botões de ação) e as interações visuais da página.
 */
(function () {
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // Se já existe sessão ativa, troca os CTAs de "Entrar/Criar conta" por
  // um atalho direto para o dashboard, sem forçar redirecionamento —
  // a home continua acessível mesmo autenticado.
  if (typeof Auth !== 'undefined' && Auth.isAuthenticated()) {
    document.querySelectorAll('a[href="login.html"]').forEach((el) => {
      el.href = 'pages/dashboard.html';
      el.innerHTML = '<i class="fa-solid fa-gauge-high"></i> <span>Ir para o dashboard</span>';
    });
    document.querySelectorAll('a[href="cadastro.html"]').forEach((el) => {
      if (el.closest('.cta-banner')) return; // mantém CTA de conversão intacto na seção final
      el.href = 'pages/dashboard.html';
      el.textContent = 'Meu painel';
    });
  }

  // ---------------------------------------------------------------------
  // Menu mobile
  // ---------------------------------------------------------------------
  const burger = document.getElementById('navBurger');
  const mobilePanel = document.getElementById('mobileNavPanel');
  if (burger && mobilePanel) {
    burger.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('open');
      burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    mobilePanel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      mobilePanel.classList.remove('open');
      burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }));
  }

  // ---------------------------------------------------------------------
  // Scroll reveal
  // ---------------------------------------------------------------------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  // ---------------------------------------------------------------------
  // Contadores animados (stats bar)
  // ---------------------------------------------------------------------
  function animateCount(el) {
    const target = Number(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statEls = document.querySelectorAll('.stat-value[data-count]');
  if ('IntersectionObserver' in window && statEls.length) {
    const statIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach((el) => statIo.observe(el));
  } else {
    statEls.forEach((el) => { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
  }

  // ---------------------------------------------------------------------
  // Traço do mini-gráfico do hero (desenha a linha)
  // ---------------------------------------------------------------------
  const hvPath = document.getElementById('hvPath');
  if (hvPath && hvPath.getTotalLength) {
    const len = hvPath.getTotalLength();
    hvPath.style.strokeDasharray = String(len);
    hvPath.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => {
      hvPath.style.transition = 'stroke-dashoffset 1.6s ease-out';
      hvPath.style.strokeDashoffset = '0';
    });
  }

  // ---------------------------------------------------------------------
  // Rede de partículas do hero (canvas)
  // ---------------------------------------------------------------------
  const canvas = document.getElementById('heroCanvas');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && canvas.getContext && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let width, height, particles, rafId;

    function resize() {
      width = canvas.width = hero.clientWidth;
      height = canvas.height = hero.clientHeight;
    }

    function makeParticles() {
      const count = Math.min(70, Math.max(28, Math.round((width * height) / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = Math.min(140, width / 6);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(189,141,51,${0.16 * (1 - dist / linkDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    resize();
    makeParticles();
    step();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); makeParticles(); }, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(rafId); }
      else { rafId = requestAnimationFrame(step); }
    });
  }
})();
