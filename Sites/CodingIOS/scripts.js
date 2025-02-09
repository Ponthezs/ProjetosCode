// Variáveis de controle do cronômetro
let timer;
let isRunning = false;
let elapsedTime = 0; // Tempo total em milissegundos

// Elementos da interface
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const lapButton = document.getElementById('lapButton');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('miliseconds');
const lapsList = document.querySelector('.laps');

// Atualiza o tempo exibido
function updateTime() {
    elapsedTime += 10; // Incrementa o tempo em milissegundos

    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((elapsedTime % 1000) / 10);

    minutesDisplay.textContent = String(minutes).padStart(2, '0') + ':';
    secondsDisplay.textContent = String(seconds).padStart(2, '0') + ':';
    millisecondsDisplay.textContent = String(milliseconds).padStart(2, '0');
}

// Inicia o cronômetro
function startTimer() {
    if (!isRunning) {
        timer = setInterval(updateTime, 10); // Atualiza a cada 10 milissegundos
        isRunning = true;
        startButton.style.display = 'none';
        stopButton.style.display = 'inline';
        lapButton.disabled = false; // Habilita o botão Lap
    }
}

// Para o cronômetro
function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startButton.style.display = 'inline';
        stopButton.style.display = 'none';
        lapButton.disabled = true; // Desabilita o botão Lap
    }
}

// Adiciona um novo lap à lista
function recordLap() {
    if (isRunning) {
        const lapTime = formatTime(elapsedTime);
        const lapItem = document.createElement('li');
        lapItem.textContent = lapTime;
        lapsList.appendChild(lapItem);
    }
}

// Formata o tempo em minutos, segundos e milissegundos
function formatTime(timeInMs) {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    const milliseconds = Math.floor((timeInMs % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}

// Event listeners para os botões
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
lapButton.addEventListener('click', recordLap);
