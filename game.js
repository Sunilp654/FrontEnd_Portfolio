let shotCount = 0;
const BOMB_COLOR = '#000000';
let gameParticles = []; 
var canvas, ctx; 

const COLS = 8, ROWS = 14, RADIUS = 25, DIAMETER = 50;
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];
let grid = [], fallingBubbles = [], bullet = null;
let currentBubbleColor, nextBubbleColor, score = 0, angle = -Math.PI / 2, isGameOver = false;
let bubbleSpeed = 15;

function handleShoot() {
    if (!bullet && !isGameOver) {
        bullet = {
            x: canvas.width / 2, y: canvas.height - 30,
            vx: Math.cos(angle) * bubbleSpeed, vy: Math.sin(angle) * bubbleSpeed,
            color: currentBubbleColor
        };
        if (typeof sounds !== 'undefined') sounds.shoot.play();
    }
}

function handleAim(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const mouseY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    angle = Math.atan2(mouseY - (canvas.height - 30), mouseX - (canvas.width / 2));
    angle = Math.max(-2.9, Math.min(-0.2, angle));
}

// FIXED: Restart par score UI aur internal variable dono reset honge
function init() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    canvas.width = 415; 
    canvas.height = 600;
    ctx = canvas.getContext('2d');
    canvas.onmousedown = handleShoot;
    canvas.onmousemove = handleAim;

    // Resetting Variables
    grid = []; 
    fallingBubbles = []; 
    bullet = null;
    score = 0; // Internal score reset
    isGameOver = false;
    shotCount = 0;

    // Resetting UI elements
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = "0"; // UI score reset fix

    const levelElement = document.getElementById('current-level');
    if (levelElement) levelElement.innerText = "1";

    // LocalStorage se Best Score load karna
    const savedHS = localStorage.getItem('bubbleHighScore') || 0;
    const hsDisplay = document.getElementById('high-score');
    if (hsDisplay) hsDisplay.innerText = savedHS;

    // Grid Initialization
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = { active: r < 6, color: r < 6 ? getRandomColor() : null };
        }
    }
    
    nextBubbleColor = getRandomColor();
    loadLauncher();
}

function snapToGrid(b) {
    let closest = null, minDist = Infinity;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c].active) continue;
            let pos = getTileCoordinate(r, c), d = Math.hypot(b.x - pos.x, b.y - pos.y);
            if (d < minDist) { minDist = d; closest = { r, c }; }
        }
    }

    if (closest && minDist < RADIUS * 1.6) {
        if (b.color === BOMB_COLOR) {
            let area = getNeighbors(closest.r, closest.c);
            area.forEach(n => {
                if (grid[n.r][n.c].active) {
                    createBurst(getTileCoordinate(n.r, n.c).x, getTileCoordinate(n.r, n.c).y, grid[n.r][n.c].color);
                    grid[n.r][n.c].active = false; score += 50;
                }
            });
            dropFloaters();
            updateUIAfterMatch();
            return true;
        }
        grid[closest.r][closest.c] = { active: true, color: b.color };
        let matches = findMatches(closest.r, closest.c, b.color);
        if (matches.length >= 3) {
            matches.forEach(m => {
                createBurst(getTileCoordinate(m.r, m.c).x, getTileCoordinate(m.r, m.c).y, grid[m.r][m.c].color);
                grid[m.r][m.c].active = false; score += 10;
            });
            dropFloaters();
            updateUIAfterMatch();
        } else if (closest.r >= 12) isGameOver = true;
        
        return true;
    }
    return false;
}


function updateUIAfterMatch() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = score;
    
    // LEVEL LOGIC: every 500 points  level up
    let newLevel = Math.floor(score / 500) + 1;
    const levelElement = document.getElementById('current-level');
    
    if (levelElement && parseInt(levelElement.innerText) !== newLevel) {
        levelElement.innerText = newLevel;
        
        //  for Difficulty level increase  speed 
        bubbleSpeed = 15 + (newLevel * 2); 
        
        // Toaster message for Level Up
        if (typeof showAchievement === 'function') {
            showAchievement("Level Up! ⬆️", "Reached Level " + newLevel);
        }
    }
    
    if (typeof updateHighScore === 'function') {
        updateHighScore(score);
    }
}

function dropFloaters() {
    let safe = new Set(), q = [];
    for (let c = 0; c < COLS; c++) if (grid[0][c].active) { safe.add(`0,${c}`); q.push({r:0,c}); }
    while (q.length) {
        let curr = q.shift();
        getNeighbors(curr.r, curr.c).forEach(n => {
            if (grid[n.r][n.c].active && !safe.has(`${n.r},${n.c}`)) { safe.add(`${n.r},${n.c}`); q.push(n); }
        });
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (grid[r][c].active && !safe.has(`${r},${c}`)) {
            let p = getTileCoordinate(r, c);
            fallingBubbles.push({ x: p.x, y: p.y, color: grid[r][c].color, vy: 3 });
            grid[r][c].active = false; score += 20;
        }
    }
}

function findMatches(r, c, col) {
    let found = [], stack = [{ r, c }], visited = new Set([`${r},${c}`]);
    while (stack.length) {
        let curr = stack.pop(); found.push(curr);
        getNeighbors(curr.r, curr.c).forEach(n => {
            if (grid[n.r][n.c].active && grid[n.r][n.c].color === col && !visited.has(`${n.r},${n.c}`)) {
                visited.add(`${n.r},${n.c}`); stack.push(n);
            }
        });
    }
    return found;
}

// FIXED: Side cutting margin calculation
function getTileCoordinate(r, c) {
let x = (c * 50) + RADIUS + 12 + (r % 2 !== 0 ? RADIUS : 0); 
    let y = r * (50 * 0.85) + RADIUS + 5;
    return { x, y };
}

function getNeighbors(r, c) {
    let ns = [], os = (r % 2 === 0) ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    os.forEach(o => {
        let nr = r + o[0], nc = c + o[1];
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) ns.push({ r: nr, c: nc });
    });
    return ns;
}

function createBurst(x, y, color) {
    for (let i = 0; i < 8; i++) {
        gameParticles.push({ x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 1, color, size: Math.random()*5+2 });
    }
}

function getRandomColor() {
 return COLORS[Math.floor(Math.random() * COLORS.length)]; 
    
    }

function loadLauncher() {
    shotCount++;
    currentBubbleColor = nextBubbleColor || getRandomColor();
    nextBubbleColor = (shotCount % 10 === 0) ? BOMB_COLOR : getRandomColor();
    const preview = document.getElementById('next-bubble-preview');
    if (preview) preview.style.backgroundColor = nextBubbleColor;
}

function update() {
    gameParticles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; if (p.life <= 0) gameParticles.splice(i, 1); });
    if (bullet) {
        bullet.x += bullet.vx; bullet.y += bullet.vy;
        if (bullet.x < RADIUS || bullet.x > canvas.width - RADIUS) bullet.vx *= -1;
        let hit = false;
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (grid[r][c].active) {
                let p = getTileCoordinate(r, c);
                if (Math.hypot(bullet.x - p.x, bullet.y - p.y) < DIAMETER - 5) hit = true;
            }
        }
        if (hit || bullet.y < RADIUS) { snapToGrid(bullet); bullet = null; loadLauncher(); }
    }
    fallingBubbles.forEach((b, i) => { b.y += b.vy; if (b.y > canvas.height) fallingBubbles.splice(i, 1); });
}

function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!bullet && !isGameOver) {
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.moveTo(canvas.width / 2, canvas.height - 30);
        ctx.lineTo(canvas.width/2 + Math.cos(angle)*100, canvas.height-30 + Math.sin(angle)*100);
        ctx.strokeStyle = '#00f2fe'; ctx.stroke(); ctx.setLineDash([]);
    }
    for (let r=0; r<ROWS; r++) for (let c=0; c<COLS; c++) if (grid[r][c].active) drawBubble(getTileCoordinate(r,c).x, getTileCoordinate(r,c).y, grid[r][c].color);
    fallingBubbles.forEach(b => drawBubble(b.x, b.y, b.color));
    gameParticles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; });
    if (bullet) 
        drawBubble(bullet.x, bullet.y, bullet.color);
    if (!isGameOver) 
        drawBubble(canvas.width / 2, canvas.height - 30, currentBubbleColor);
    if (isGameOver) { 
        sounds.gameOver.play()
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
         ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.fillStyle='#fff'; 
          ctx.font='30px Arial'; 
          ctx.textAlign='center';
           ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2); 
    }
     sounds.gameOver.stop()
}

function drawBubble(x, y, col) { ctx.beginPath(); ctx.fillStyle = col; ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2); ctx.fill(); }

function gameLoop() { if (document.getElementById('gameModal').style.display === 'block') { update(); draw(); } requestAnimationFrame(gameLoop); }

init();
gameLoop();

// Restart trigger
function resetGame() { 
        sounds.click.play();

    init(); 
}