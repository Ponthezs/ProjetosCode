// Inicializar o canvas e o contexto
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;
var bound = canvas.getBoundingClientRect();
var c = canvas.getContext('2d');

// Inicializar variáveis para limites do canvas
var xlim = canvas.width;
var ylim = canvas.height;

// Obter referências para elementos de cor e raio
var color = document.getElementById("color");
var radius = document.getElementById("radius");

// Objeto para armazenar informações do mouse
var mouse = {
    x: 0,
    y: 0,
    down: false
};

// Função para desenhar no canvas
function draw() {
    c.beginPath();
    c.fillStyle = color.value; // Corrigido de ariaValueMax para value
    c.arc(mouse.x, mouse.y, Math.abs(Number(radius.value)), 0, Math.PI * 2, false);
    c.fill();
    c.closePath();
}

// Função para apagar (resetar a cor para branco)
function erase() {
    color.value = "#FFFFFF";
}

// Função para apagar tudo do canvas
function eraseWhole() {
    c.clearRect(0, 0, xlim, ylim); // Corrigido de clearReact para clearRect
}

// Atualizar as dimensões do canvas quando a janela for redimensionada
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    xlim = canvas.width;
    ylim = canvas.height;
    bound = canvas.getBoundingClientRect();
});

// Atualizar a posição do mouse e desenhar quando o botão do mouse estiver pressionado
addEventListener("mousemove", (e) => {
    mouse.x = e.clientX - bound.left;
    mouse.y = e.clientY - bound.top; // Corrigido o cálculo da coordenada Y
    if (mouse.down) {
        draw();
    }
});

// Definir o estado do mouse quando o botão é pressionado
addEventListener("mousedown", () => {
    mouse.down = true;
});

// Definir o estado do mouse quando o botão é liberado
addEventListener("mouseup", () => {
    mouse.down = false;
});
