const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;
canvas.classList.add('grid');

const grid = 50;
let count = 0;
let speed = 10;
let speedIncreaseRate = 0.5;

let snake = {
    x: 250,
    y: 250,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

let apple = { x: 0, y: 0 };
let currentScore = 0;
let highScore = localStorage.getItem('neonSnakeHighScore') || 0;
let isPlaying = true;

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const gameOverOverlay = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

highScoreEl.innerText = highScore;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function updateScore() {
    scoreEl.innerText = currentScore;
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreEl.innerText = highScore;
        localStorage.setItem('neonSnakeHighScore', highScore);
    }
}

function resetGame() {
    snake.x = 250;
    snake.y = 250;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    speed = 10;
    currentScore = 0;
    updateScore();
    placeApple();
    isPlaying = true;
    gameOverOverlay.classList.add('hidden');
}

function showGameOver() {
    isPlaying = false;
    finalScoreEl.innerText = currentScore;
    gameOverOverlay.classList.remove('hidden');
}

function placeApple() {
    apple.x = getRandomInt(0, canvas.width / grid) * grid;
    apple.y = getRandomInt(0, canvas.height / grid) * grid;
    // ensure apple doesn't spawn on snake
    for (let i = 0; i < snake.cells.length; i++) {
        if (snake.cells[i].x === apple.x && snake.cells[i].y === apple.y) {
            placeApple();
            return;
        }
    }
}

function update() {
    if (!isPlaying) return;
    
    if (++count < speed) {
        return;
    }
    count = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;
    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({x: snake.x, y: snake.y});

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // Draw Apple
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff0055";
    const gradient = ctx.createRadialGradient(apple.x + 25, apple.y + 25, 5, apple.x + 25, apple.y + 25, 25);
    gradient.addColorStop(0, "#ff6699");
    gradient.addColorStop(1, "#ff0055");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(apple.x + grid / 2, apple.y + grid / 2, grid / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.cells.forEach((cell, index) => {
        ctx.shadowBlur = 10;
        
        if (index === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = "#ffffff";
        } else {
            ctx.fillStyle = '#39ff14';
            ctx.shadowColor = "#39ff14";
            ctx.globalAlpha = Math.max(0.2, 1 - (index / snake.cells.length));
        }
        
        ctx.beginPath();
        ctx.roundRect(cell.x + 2, cell.y + 2, grid - 4, grid - 4, [8]); 
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            currentScore += 10;
            updateScore();
            placeApple();
            if (speed > 4) speed -= speedIncreaseRate;
        }

        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                showGameOver();
            }
        }
    });
}

function changeDirection(e) {
    if (!isPlaying) return;
    if (e.key === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if (e.key === 'ArrowUp' && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = -grid;
    } else if (e.key === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if (e.key === 'ArrowDown' && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = grid;
    }
}

function handleButton(direction) {
    if (!isPlaying) return;
    if (direction === "left" && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if (direction === "up" && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = -grid;
    } else if (direction === "right" && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if (direction === "down" && snake.dy === 0) {
        snake.dx = 0;
        snake.dy = grid;
    }
}

document.getElementById('left').addEventListener('click', () => handleButton("left"));
document.getElementById('up').addEventListener('click', () => handleButton("up"));
document.getElementById('right').addEventListener('click', () => handleButton("right"));
document.getElementById('down').addEventListener('click', () => handleButton("down"));

document.getElementById('restart-btn').addEventListener('click', resetGame);

document.getElementById('reset').addEventListener('click', () => {
    localStorage.removeItem('neonSnakeHighScore');
    highScore = 0;
    highScoreEl.innerText = highScore;
    if (currentScore > 0) {
        updateScore();
    }
});

document.addEventListener('keydown', changeDirection);

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
}

resetGame();
requestAnimationFrame(gameLoop);
