let timerInterval;
let isRunning = false;
let elapsedTime = 0; // tempo em milissegundos

const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('miliseconds');
const startBtn = document.querySelector('.mainStartBtn');
const lapResetBtn = document.querySelector('.lapResetBtn');
const lapsEl = document.querySelector('.laps');

function formatTime(time) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);
    
    return {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: milliseconds.toString().padStart(2, '0')
    };
}

function updateDisplay() {
    const { minutes, seconds, milliseconds } = formatTime(elapsedTime);
    minutesEl.textContent = `${minutes}:`;
    secondsEl.textContent = `${seconds}:`;
    millisecondsEl.textContent = milliseconds;
}

function startTimer() {
    if (!isRunning) {
        timerInterval = setInterval(() => {
            elapsedTime += 10;
            updateDisplay();
        }, 10);
        isRunning = true;
        startBtn.textContent = 'Stop';
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.textContent = 'Start';
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    updateDisplay();
    startBtn.textContent = 'Start';
}

function addLap() {
    if (isRunning) {
        const lapTime = formatTime(elapsedTime);
        const lapEl = document.createElement('div');
        lapEl.className = 'lap';
        lapEl.textContent = `Lap: ${lapTime.minutes}:${lapTime.seconds}:${lapTime.milliseconds}`;
        lapsEl.appendChild(lapEl);
    }
}

startBtn.addEventListener('click', startTimer);
lapResetBtn.addEventListener('click', () => {
    if (isRunning) {
        addLap();
    } else {
        resetTimer();
    }
});
