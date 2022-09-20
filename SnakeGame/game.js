import {update as updateSnake, draw as drawSnake, SNAKE_SPEED} from './snake.js '
import {update as updateFood, draw as drawFood} from './food.js'

const gameBoard = document.getElementById("game-board")

let lastRenderTime = 0;

//const SNAKE_SPEED = 4;

requestAnimationFrame (main)

function main(currentTime) {
    requestAnimationFrame (main)

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    if(secondsSinceLastRender < 1  / SNAKE_SPEED) return

    lastRenderTime = currentTime    

    update()
    draw()
}

function update(){
    updateSnake()
}

function draw(){
    gameBoard.innerHTML = ""
    drawSnake(gameBoard)
    drawFood(gameBoard)
}