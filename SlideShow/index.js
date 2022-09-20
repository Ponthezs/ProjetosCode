'use strict'

const Images = [
    { 'id' : '1' , 'url' : './img/roxa.jpg'},
    { 'id' : '2' , 'url' : './img/colina.jpg'},
    { 'id' : '3' , 'url' : './img/lunar.jpg'},
    { 'id' : '4' , 'url' : './img/neve.jpg'},
    { 'id' : '5' , 'url' : './img/praia.jpg'},
    { 'id' : '6' , 'url' : './img/sol.jpg'}
]

const containerItems = document.querySelector('#container-items');


const loadImages = (Images, containerItems) => {
    Images.forEach ( Image => {
        containerItems.innerHTML += `
        <div class='item'>
        <img src='${Image.url}'
        </div>
        `
    })
}

loadImages( Images, containerItems );

let items = document.querySelectorAll('.item');

const previous = () => {
    containerItems.appendChild(items[0]);
    items = document.querySelectorAll('.item');
}

const next = () => {
    const lastItem = items[items.length - 1];
    containerItems.insertBefore(lastItem, items[0] );
    items = document.querySelectorAll('.item');
}

document.querySelector('#previous').addEventListener('click', previous);
document.querySelector('#next').addEventListener('click', next);