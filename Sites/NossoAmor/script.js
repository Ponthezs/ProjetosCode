// ===== CONTADOR EM TEMPO REAL =====
function updateTimer() {
    // Data de início: 18 de Fevereiro de 2024
    const startDate = new Date(2024, 1, 18, 0, 0, 0); 
    const now = new Date();
    
    const diff = now - startDate;
    
    if (diff < 0) return;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    const daysEl = document.getElementById('timerDays');
    const hoursEl = document.getElementById('timerHours');
    const minutesEl = document.getElementById('timerMinutes');
    const secondsEl = document.getElementById('timerSeconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Iniciar relógio imediatamente e atualizar a cada 1 segundo
updateTimer();
setInterval(updateTimer, 1000);

// ===== NAVBAR SCROLL EFFECT =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
});

// ===== LIGHTBOX GALERIA =====
function openLightbox(src, title, desc) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const descEl = document.getElementById('lightboxDesc');
    
    if (img) img.src = src;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede scroll ao abrir modal
}

function closeLightbox(event) {
    // Se o evento foi disparado pelo clique, fechar se for fechar direto ou no fundo
    if (!event || event.target.id === 'lightboxModal' || event.target.classList.contains('lightbox-close')) {
        const modal = document.getElementById('lightboxModal');
        modal?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Fechar com a tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('lightboxModal');
        if (modal?.classList.contains('active')) {
            closeLightbox();
        }
    }
});

// ===== TAB SYSTEM DAS CARTAS =====
function selectTab(index) {
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.letter-card');
    
    tabs.forEach((tab, idx) => {
        if (idx === index) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    cards.forEach((card, idx) => {
        if (idx === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// ===== CITAÇÕES ROMÂNTICAS =====
const quotes = [
    { text: "O amor não se vê com os olhos, mas com o coração.", author: "William Shakespeare" },
    { text: "Amar não é olhar um para o outro, é olhar juntos na mesma direção.", author: "Antoine de Saint-Exupéry" },
    { text: "Cada segundo ao seu lado é o presente mais bonito que o destino poderia me dar.", author: "Nosso Diário" },
    { text: "Deus mudou o meu caminho até chegar a ti, e deu-me a tua mão para eu não caminhar sozinho.", author: "Poesia de Amor" },
    { text: "Onde quer que você esteja, é lá que o meu coração encontra a sua paz.", author: "Eloah & Felipe" },
    { text: "Tão bom é saber que entre tantos caminhos no mundo, os nossos se cruzaram.", author: "Fragmentos da Nossa História" }
];

let currentQuoteIndex = 0;

function nextQuote() {
    const textEl = document.getElementById('quoteText');
    const authorEl = document.getElementById('quoteAuthor');
    
    if (!textEl || !authorEl) return;
    
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    
    // Efeito de transição suave
    textEl.style.opacity = '0';
    authorEl.style.opacity = '0';
    
    setTimeout(() => {
        textEl.textContent = `"${quotes[currentQuoteIndex].text}"`;
        authorEl.textContent = `— ${quotes[currentQuoteIndex].author}`;
        textEl.style.opacity = '1';
        authorEl.style.opacity = '1';
    }, 300);
}

// ===== AMBIENT CANVAS PARTICLES (BRILHO DOURADO) =====
const canvas = document.getElementById('ambientCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = -Math.random() * 0.4 - 0.1;
            this.alpha = Math.random() * 0.5 + 0.2;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.fadeSpeed;
            
            if (this.alpha <= 0 || this.y < 0) {
                this.reset();
                this.y = height + 10;
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = '#e6c8a5';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    const particles = Array.from({ length: 45 }, () => new Particle());
    
    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// ===== SCROLL REVEAL OBSERVER =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item, .bento-item, .timer-card, .letter-card-container, .quote-display-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(el);
});