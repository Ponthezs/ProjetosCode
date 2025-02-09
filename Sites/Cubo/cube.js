const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const moveSpeedX = 0.2;
const moveSpeedY = 0.2;
const moveSpeedZ = 0.2;

class CubePoints3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

let positionX = canvas.width / 2;
let positionY = canvas.height / 2;
let positionZ = 0;
let cubeSize = canvas.height / 4;

let vertices = [
    new CubePoints3D(positionX - cubeSize, positionY - cubeSize, positionZ - cubeSize),
    new CubePoints3D(positionX + cubeSize, positionY - cubeSize, positionZ - cubeSize),
    new CubePoints3D(positionX + cubeSize, positionY + cubeSize, positionZ - cubeSize),
    new CubePoints3D(positionX - cubeSize, positionY + cubeSize, positionZ - cubeSize),
    new CubePoints3D(positionX - cubeSize, positionY - cubeSize, positionZ + cubeSize),
    new CubePoints3D(positionX + cubeSize, positionY - cubeSize, positionZ + cubeSize),
    new CubePoints3D(positionX + cubeSize, positionY + cubeSize, positionZ + cubeSize),
    new CubePoints3D(positionX - cubeSize, positionY + cubeSize, positionZ + cubeSize),
];

let edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
];

let timeLast = 0;

function loop(currentTime) {
    const deltaTime = currentTime - timeLast;
    timeLast = currentTime;
    update(deltaTime);
    render();
    requestAnimationFrame(loop);
}

function rotateX(angle) {
    for (let v of vertices) {
        let dy = v.y - positionY;
        let dz = v.z - positionZ;
        v.y = dy * Math.cos(angle) - dz * Math.sin(angle) + positionY;
        v.z = dy * Math.sin(angle) + dz * Math.cos(angle) + positionZ;
    }
}

function rotateY(angle) {
    for (let v of vertices) {
        let dx = v.x - positionX;
        let dz = v.z - positionZ;
        v.x = dx * Math.cos(angle) + dz * Math.sin(angle) + positionX;
        v.z = -dx * Math.sin(angle) + dz * Math.cos(angle) + positionZ;
    }
}

function rotateZ(angle) {
    for (let v of vertices) {
        let dx = v.x - positionX;
        let dy = v.y - positionY;
        v.x = dx * Math.cos(angle) - dy * Math.sin(angle) + positionX;
        v.y = dx * Math.sin(angle) + dy * Math.cos(angle) + positionY;
    }
}

function update(deltaTime) {
    const angleX = deltaTime * 0.001 * moveSpeedX * Math.PI * 2;
    const angleY = deltaTime * 0.001 * moveSpeedY * Math.PI * 2;
    const angleZ = deltaTime * 0.001 * moveSpeedZ * Math.PI * 2;
    
    rotateX(angleX);
    rotateY(angleY);
    rotateZ(angleZ);
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.lineCap = "round";

    for (let edge of edges) {
        context.beginPath();
        context.moveTo(vertices[edge[0]].x, vertices[edge[0]].y);
        context.lineTo(vertices[edge[1]].x, vertices[edge[1]].y);
        context.stroke();
    }
}

requestAnimationFrame(loop);
