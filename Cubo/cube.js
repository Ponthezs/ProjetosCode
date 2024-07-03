const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const moveSpeedX = 0.2;
const moveSpeedY = 0.2;
const moveSpeedZ = 0.2;

// ------------- CUBE -------------

const CubePoints3D = function(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
}

let positionX = canvas.width / 2;
let positionY = canvas.height / 2;
let positionZ = 0;
let cubeSize = canvas.height / 2

let vertices = [
    new CubePoints3D(
        positionX - cubeSize,
        positionY - cubeSize,
        positionZ - cubeSize,
    ),
    new CubePoints3D(
        positionX + cubeSize,
        positionY - cubeSize,
        positionZ - cubeSize,
    ),
    new CubePoints3D(
        positionX + cubeSize,
        positionY + cubeSize,
        positionZ - cubeSize,
    ),
    new CubePoints3D(
        positionX - cubeSize,
        positionY + cubeSize,
        positionZ - cubeSize,
    ),
    new CubePoints3D(
        positionX - cubeSize,
        positionY - cubeSize,
        positionZ + cubeSize,
    ),
    new CubePoints3D(
        positionX + cubeSize,
        positionY - cubeSize,
        positionZ + cubeSize,
    ),

    new CubePoints3D(
        positionX + cubeSize,
        positionY + cubeSize,
        positionZ + cubeSize,
    ),
    new CubePoints3D(
        positionX - cubeSize,
        positionY + cubeSize,
        positionZ + cubeSize,
    ),
    ];

    let edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
    ];


// ----------- loop Func ---------
let time, timeLast = 0;

function loop(currentTime) {
    time = currentTime = timeLast;
    timeLast = currentTime;
    update();
    render();
    resquestAnimationFrame(loop);
}

// ----------- Rotation Func ---------
function moveX(){
    angle = time *  0.001 * moveSpeedX * Math.PI * 2;
    for(let v of vertices) {
        let dy = v.y - positionY;
        let dz = v.z - positionZ;
        let y = dy * Math.sin(angle) + dx * Math.cos(angle);
        let z = dy * Math.cos(angle) - dx * Math.sin(angle);
        v.y = y + positionY;
        v.z = z + positionZ;
    }
}

function moveY(){
    angle = time *  0.001 * moveSpeedX * Math.PI * 2;
    for(let v of vertices) {
        let dy = v.x - positionY;
        let dz = v.z - positionZ;
        let y = dz * Math.sin(angle) + dx * Math.cos(angle);
        let z = dz * Math.cos(angle) - dx * Math.sin(angle);
        v.x = x + positionY;
        v.z = z + positionZ;
}

function moveZ(){
    angle = time *  0.001 * moveSpeedX * Math.PI * 2;
    for(let v of vertices) {
        let dy = v.x - positionY;
        let dz = v.y - positionZ;
        let y = dx * Math.sin(angle) + dy * Math.cos(angle);
        let z = dx * Math.cos(angle) - dy * Math.sin(angle);
        v.x = x + positionY;
        v.y = y + positionZ;
}

function update() {
     moveX();
     moveY();
     moveZ();
}


// ----------- Render All ---------
function render(){
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black"; //Background color
    context.strokeStyle = "Red"; // Cube color
    context.lineWidth = canvas.width / 50,
    context.lineCap = "round";

    for(let edge of edges){
        context.beginPath();
        context.moveTo(vertices[edge[0]].x, vertices[edge[0]].y);
        context.lineTo(vertices[edge[1]].x, vertices[edge[1]].y);
        context.stroke();
    }
}





