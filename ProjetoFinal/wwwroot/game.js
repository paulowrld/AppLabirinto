let ctx;
let canvas;
let currentLevel;
let ballRadius = 10;
let startTime;
let currentTime;
let timerInterval;
let levelWon = false;

window.resetLevel = () => {
    levelWon = false;
    startTimer();
};

function startTimer() {
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    currentTime = (Date.now() - startTime) / 1000;
    window.updateGameTime(currentTime);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    return currentTime;
}

function saveRecord(time) {
    const record = {
        completionTime: time,
        completedAt: new Date().toISOString()
    };
    
    const currentRecord = localStorage.getItem('gameRecord');
    if (!currentRecord || time < JSON.parse(currentRecord).completionTime) {
        localStorage.setItem('gameRecord', JSON.stringify(record));
        return true;
    }
    return false;
}

window.getRecord = function() {
    const record = localStorage.getItem('gameRecord');
    return record ? JSON.parse(record) : null;
}

const levels = [
    {
        walls: [
            { x: 40, y: 60, width: 220, height: 20 },
            { x: 0, y: 140, width: 220, height: 20 },
            { x: 40, y: 220, width: 220, height: 20 },
            { x: 40, y: 60, width: 20, height: 80 },
            { x: 260, y: 140, width: 20, height: 80 }
        ],
        start: { x: 20, y: 40 },
        end: { x: 280, y: 280 }
    },

    {
        walls: [
            { x: 80, y: 0, width: 20, height: 220 },
            { x: 160, y: 60, width: 20, height: 220 },
            { x: 240, y: 0, width: 20, height: 220 }
        ],
        start: { x: 20, y: 40 },
        end: { x: 280, y: 280 }
    },
    {
        walls: [
            { x: 0, y: 80, width: 240, height: 20 },
            { x: 280, y: 80, width: 20, height: 120 },
            { x: 60, y: 200, width: 240, height: 20 },
            { x: 200, y: 130, width: 20, height: 80 },
            { x: 140, y: 90, width: 20, height: 80 },
            { x: 0, y: 150, width: 100, height: 20 },
            { x: 40, y: 200, width: 20, height: 60 },
        ],

        start: { x: 20, y: 40 },
        end: { x: 270, y: 260 }
    },
];

function logError(error) {
    console.error('Erro no jogo:', error);
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

window.startGame = function (levelIndex = 0) {
    try {
        canvas = document.getElementById('labirintoCanvas');
        if (!canvas) throw new Error('Canvas não encontrado');

        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Contexto 2D não pôde ser criado');

        if (typeof levelIndex !== 'number' || levelIndex < 0 || levelIndex >= levels.length)
            levelIndex = 0;

        currentLevel = levelIndex;
        levelWon = false;
        startTimer();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnd();
        drawWalls();

        return levels[currentLevel].start;
    } catch (error) {
        logError(error);
        throw error;
    }
};


function drawWalls() {
    try {
        ctx.fillStyle = "#663300";
        levels[currentLevel].walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
    } catch (error) {
        logError(error);
        throw error;
    }
}

function drawEnd() {
    try {
        const end = levels[currentLevel].end;
        ctx.fillStyle = "#00FF00";
        ctx.beginPath();
        ctx.arc(end.x, end.y, 15, 0, Math.PI * 2);
        ctx.fill();
    } catch (error) {
        logError(error);
        throw error;
    }
}

function checkCollision(x, y) {
    try {
        const walls = levels[currentLevel].walls;
        for (let wall of walls) {
            if (x + ballRadius > wall.x &&
                x - ballRadius < wall.x + wall.width &&
                y + ballRadius > wall.y &&
                y - ballRadius < wall.y + wall.height) {
                return true;
            }
        }
        return false;
    } catch (error) {
        logError(error);
        throw error;
    }
}

function checkWin(x, y) {
    try {
        const end = levels[currentLevel].end;
        const distance = Math.sqrt(Math.pow(x - end.x, 2) + Math.pow(y - end.y, 2));
        return distance < 25;
    } catch (error) {
        logError(error);
        throw error;
    }
}

function loadLevel(index) {
    currentLevel = index;
    levelWon = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEnd();
    drawWalls();


    const start = levels[currentLevel].start;
    ctx.fillStyle = "#0095DD";
    ctx.beginPath();
    ctx.arc(start.x, start.y, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    return start;
}

window.updateBall = function (x, y) {
    try {
        if (checkCollision(x, y)) return { status: "block" };

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnd();
        drawWalls();

        ctx.fillStyle = "#0095DD";
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fill();

        if (checkWin(x, y) && !levelWon) {
            levelWon = true;

            if (currentLevel < levels.length - 1) {
                alert(`Nível ${currentLevel + 1} concluído!`);
                const start = loadLevel(currentLevel + 1);
                return { status: "next", start };
            }

            const finalTime = stopTimer();
            const isNewRecord = saveRecord(finalTime);
            const message = isNewRecord 
                ? `Parabéns! Você zerou o jogo em ${finalTime.toFixed(2)} segundos - NOVO RECORDE! 🎉` 
                : `Parabéns! Você zerou o jogo em ${finalTime.toFixed(2)} segundos! 🎉`;
            alert(message);
            return { status: "finished" };
        }

        return { status: "ok" };
    } catch (error) {
        logError(error);
        throw error;
    }
};