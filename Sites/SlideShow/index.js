'use strict'

const slides = [
    { id: 1, url: './img/roxa.jpg', title: 'Céu Roxo' },
    { id: 2, url: './img/colina.jpg', title: 'Colina Verde' },
    { id: 3, url: './img/lunar.jpg', title: 'Paisagem Lunar' },
    { id: 4, url: './img/neve.jpg', title: 'Neve Branca' },
    { id: 5, url: './img/praia.jpg', title: 'Praia Dourada' },
    { id: 6, url: './img/sol.jpg', title: 'Pôr do Sol' }
];

const containerItems = document.querySelector('#container-items');
const dotsContainer = document.querySelector('#dots');
const progressFill = document.querySelector('#progressFill');
const playPauseBtn = document.querySelector('#playPause');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
const containerSlide = document.querySelector('#containerSlide');

const AUTOPLAY_MS = 4500;
const VISIBLE_RANGE = 2; // quantos slides ficam visíveis para cada lado

let current = 0;
let items = [];
let dots = [];
let autoplayTimer = null;
let isPlaying = true;

// ---------- construção do DOM ----------

const buildSlides = () => {
    containerItems.innerHTML = slides.map((slide, i) => `
        <figure class="item" data-index="${i}">
            <img src="${slide.url}" alt="${slide.title}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
            <figcaption>${slide.title}</figcaption>
        </figure>
    `).join('');

    items = Array.from(containerItems.querySelectorAll('.item'));

    items.forEach((item, i) => {
        item.addEventListener('click', () => { if (i !== current) goTo(i); });

        const img = item.querySelector('img');
        const markLoaded = () => img.classList.add('loaded');
        if (img.complete) markLoaded();
        else img.addEventListener('load', markLoaded);
    });
};

const buildDots = () => {
    dotsContainer.innerHTML = slides
        .map((_, i) => `<button class="dot" data-index="${i}" aria-label="Ir para o slide ${i + 1}"></button>`)
        .join('');

    dots = Array.from(dotsContainer.querySelectorAll('.dot'));
    dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));
};

// ---------- carrossel 3D (coverflow) ----------

const shortestOffset = (index) => {
    const n = slides.length;
    let diff = (index - current + n) % n;
    if (diff > n / 2) diff -= n;
    return diff;
};

const render = () => {
    items.forEach((item, i) => {
        const offset = shortestOffset(i);
        const abs = Math.abs(offset);

        if (abs > VISIBLE_RANGE) {
            item.style.opacity = '0';
            item.style.pointerEvents = 'none';
            item.style.zIndex = '0';
            return;
        }

        const translateX = offset * 55;
        const rotateY = offset * -32;
        const scale = 1 - abs * 0.18;
        const opacity = Math.max(1 - abs * 0.35, 0);

        item.style.transform = `translate(-50%, -50%) translateX(${translateX}%) rotateY(${rotateY}deg) scale(${scale})`;
        item.style.opacity = String(opacity);
        item.style.zIndex = String(10 - abs);
        item.style.pointerEvents = offset === 0 ? 'auto' : 'none';
        item.classList.toggle('active', offset === 0);
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
};

const goTo = (index) => {
    const n = slides.length;
    current = ((index % n) + n) % n;
    render();
    restartAutoplay();
};

const next = () => goTo(current + 1);
const previous = () => goTo(current - 1);

// ---------- autoplay + barra de progresso ----------

const restartAutoplay = () => {
    clearInterval(autoplayTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';

    requestAnimationFrame(() => {
        progressFill.style.transition = `width ${AUTOPLAY_MS}ms linear`;
        if (isPlaying) progressFill.style.width = '100%';
    });

    if (isPlaying) {
        autoplayTimer = setInterval(next, AUTOPLAY_MS);
    }
};

const stopAutoplay = () => {
    clearInterval(autoplayTimer);
    progressFill.style.transition = 'none';
};

const togglePlay = () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar apresentação' : 'Reproduzir apresentação');
    restartAutoplay();
};

// ---------- tela cheia ----------

const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerSlide.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
};

// ---------- inicialização ----------

buildSlides();
buildDots();
render();
restartAutoplay();

document.querySelector('#previous').addEventListener('click', previous);
document.querySelector('#next').addEventListener('click', next);
playPauseBtn.addEventListener('click', togglePlay);
fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previous();
    if (e.key === 'ArrowRight') next();
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    if (e.key.toLowerCase() === 'f') toggleFullscreen();
});

// swipe / toque (mobile)
let touchStartX = 0;
containerItems.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

containerItems.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
        dx > 0 ? previous() : next();
    }
}, { passive: true });

// pausa ao passar o mouse, retoma ao sair
containerSlide.addEventListener('mouseenter', stopAutoplay);
containerSlide.addEventListener('mouseleave', () => { if (isPlaying) restartAutoplay(); });
