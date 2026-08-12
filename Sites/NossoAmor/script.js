// ===== CALCULAR DIAS JUNTOS =====
function calcularDiasJuntos() {
    // Data do primeiro encontro: 18/02/2024
    const dataInicio = new Date(2024, 1, 18); // Mês é 0-indexed
    const dataAtual = new Date();
    
    const diferenca = dataAtual - dataInicio;
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    document.getElementById('diasJuntos').textContent = dias;
}

// Chamar ao carregar a página
calcularDiasJuntos();

// ===== MENSAGENS ESPECIAIS =====
const mensagensArray = [
    {
        titulo: "Para Eloah 💕",
        texto: "Você é a pessoa mais incrível que já conheci. Seu sorriso ilumina meus dias, seu amor me torna uma pessoa melhor. Obrigado por existir e por estar ao meu lado em cada momento. Você é meu amor, minha inspiração e meu melhor amigo. Te amo infinitamente! ❤️"
    },
    {
        titulo: "Para Felipe 💙",
        texto: "Você é meu herói, meu companheiro e meu grande amor. Cada dia ao seu lado é uma bênção. Suas atitudes, seu carinho e sua presença fazem toda a diferença na minha vida. Obrigado por me amar do jeito que ama. Você é tudo o que eu sempre desejei. Te amo muito! 💙"
    },
    {
        titulo: "Nosso Amor 💕",
        texto: "A cada dia que passa, nosso amor cresce mais. Somos uma dupla perfeita, juntos superamos qualquer desafio. Nossos momentos felizes ficarão para sempre em nossos corações. O futuro é nosso e será cheio de aventuras, risadas e muito amor. Somos para sempre! 💕"
    }
];

let mensagemAtual = -1;

function mostrarMensagem(index) {
    const display = document.getElementById('mensagemDisplay');
    const texto = document.getElementById('textoMensagem');
    
    mensagemAtual = index;
    texto.textContent = mensagensArray[index].texto;
    
    display.classList.add('show');
}

function fecharMensagem() {
    const display = document.getElementById('mensagemDisplay');
    display.classList.remove('show');
}

// Fechar mensagem ao clicar fora
document.addEventListener('click', function(event) {
    const display = document.getElementById('mensagemDisplay');
    const mensagensContainer = document.querySelector('.mensagens-container');
    
    if (display.classList.contains('show') && 
        !display.contains(event.target) && 
        !mensagensContainer.contains(event.target)) {
        fecharMensagem();
    }
});

// ===== CURIOSIDADES ROMÂNTICAS =====
const curiosidades = [
    "Sabias que o amor verdadeiro é quando você quer estar perto da pessoa sempre?",
    "Sabias que um simples sorriso pode fazer uma grande diferença no dia de alguém?",
    "Sabias que casais que riem juntos têm relacionamentos mais duradouros?",
    "Sabias que agarrar a mão de alguém aumenta os sentimentos de amor e confiança?",
    "Sabias que passar tempo juntos é mais importante do que coisas materiais?",
    "Sabias que discutir abertamente fortalece o relacionamento?",
    "Sabias que pequenos gestos de carinho têm mais impacto do que você imagina?",
    "Sabias que ouvir ativamente é uma forma de mostrar amor genuíno?",
    "Sabias que apoiar os sonhos do outro é fundamental para um relacionamento feliz?",
    "Sabias que dizer 'eu te amo' nunca é demais quando você realmente sente?",
    "Sabias que casais que compartilham interesses têm mais conexão?",
    "Sabias que o perdão é a chave para um amor duradouro?",
    "Sabias que criar memórias juntos é mais importante que ter coisas juntos?",
    "Sabias que surpresas pequenas mantêm a centelha viva?",
    "Sabias que você é melhor com essa pessoa ao seu lado?"
];

let curiosidadeAtual = 0;

function proximaCuriosidade() {
    const quoteText = document.getElementById('quoteText');
    
    curiosidadeAtual = Math.floor(Math.random() * curiosidades.length);
    
    // Efeito de saída
    quoteText.style.opacity = '0';
    
    setTimeout(() => {
        quoteText.textContent = curiosidades[curiosidadeAtual];
        quoteText.style.opacity = '1';
    }, 200);
}

// Adicionar transição suave ao texto
const quoteText = document.getElementById('quoteText');
quoteText.style.transition = 'opacity 0.3s ease';

// ===== ANIMAÇÃO SUAVE DO SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== EFFECT AO FAZER SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar observador em seções
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});

// ===== EFEITO PARALLAX NO HERO =====
window.addEventListener('mousemove', (e) => {
    const heroBg = document.querySelector('.hero::before');
    if (heroBg) {
        const x = (e.clientX / window.innerWidth) * 20;
        const y = (e.clientY / window.innerHeight) * 20;
    }
});

// ===== ATUALIZAR DIAS JUNTOS DIARIAMENTE =====
setInterval(calcularDiasJuntos, 1000 * 60 * 60); // Atualizar a cada hora

// ===== ANIMAÇÃO DE CARREGAMENTO =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// ===== INTERATIVIDADE ADICIONAL =====
// Fazer os botões de mensagem terem efeito de ripple
document.querySelectorAll('.msg-button').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
    });
});

// Adicionar confete ao clicar em mensagens (opcional)
function triggerConfetti() {
    // Simples implementação de confete
    for (let i = 0; i < 10; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        confetti.innerHTML = '💕';
        confetti.style.fontSize = '2rem';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '1000';
        
        document.body.appendChild(confetti);
        
        const duration = 2 + Math.random() * 1;
        const xMove = (Math.random() - 0.5) * 200;
        
        anime({
            targets: confetti,
            translateY: window.innerHeight + 100,
            translateX: xMove,
            opacity: 0,
            duration: duration * 1000,
            easing: 'easeInQuad',
            complete: () => confetti.remove()
        });
    }
}

// Simpler confetti effect without anime library
function simpleConfetti() {
    for (let i = 0; i < 8; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.pointerEvents = 'none';
        confetti.innerHTML = '💕';
        confetti.style.fontSize = '1.5rem';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '1000';
        confetti.style.opacity = '1';
        confetti.style.transition = 'all 2s ease-in';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.style.opacity = '0';
            confetti.style.transform = `translateY(${window.innerHeight + 100}px) translateX(${(Math.random() - 0.5) * 200}px)`;
        }, 10);
        
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Adicionar confete quando mostrar mensagem
const originalMostrarMensagem = window.mostrarMensagem;
window.mostrarMensagem = function(index) {
    originalMostrarMensagem(index);
    simpleConfetti();
};