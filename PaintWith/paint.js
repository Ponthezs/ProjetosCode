var canvas = document.getElementById("canvas")
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;
var boud = canvas.getBoundingClientRect();
var c = canvas.getContext('2d')

var xlim = canvas.width
var ylim = canvas.height

var color = document.getElementById("color")
var radius = document.getElementById("radius")

var mouse = {
    x: 0,
    y: 0,
    down: false
};

var stroke = [];

function draw() {
    c.beginPath();
    c.fillstyle = color.ariaValueMax;
    c.arc(mouse.x, mouse.y, Math.abs(Number(radius.value)), 0, Math.PI * 2, false);
    c.fill();
    c.closePath();
}

function erase(){
    color.value = "#FFFFFF";
}

function eraseWhole(){
    c.clearReact(0, 0, xlim, ylim);
}

addEventListener("mousemove", (e) => {
    mouse.x = e.clientX - bound.left;
    mouse.y + e.clientY - bound.top;
    if (mouse.down) {
        draw();
    }
})

addEventListener ("mousedown", (e) => {
    mouse.down = true;
})

addEventListener("mouseup", (e) => {
    mouse.down = false;
})