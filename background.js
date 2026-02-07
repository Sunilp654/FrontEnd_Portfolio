// background.js - Top of file
window.PIXI = PIXI; 
gsap.registerPlugin(PixiPlugin);

let currentBgMode = 'stars'; 
let particles = [];
let lineGraphics;
let app;

(async () => {
    app = new PIXI.Application();
    await app.init({
        canvas: document.getElementById('bg-canvas'),
        resizeTo: window,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        eventMode: 'none' // Game clicks allow karne ke liye
    });

    // Pixi v8 mein Plugin ko manual link karne ka sahi tarika
    PixiPlugin.registerPIXI(PIXI);

    lineGraphics = new PIXI.Graphics();
    app.stage.addChildAt(lineGraphics, 0);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    window.initParticles = function(mode) {
        currentBgMode = mode;
        container.removeChildren();
        window.particles = []; 
        particles = [];
        lineGraphics.clear();

        const totalParticles = mode === 'neon' ? 600 : 800; 
        const colors = [0x00f2ff, 0x00ff9f, 0x7000ff]; //0xff0055, 

        for (let i = 0; i < totalParticles; i++) {
            const selectedColor = mode === 'neon' ? colors[Math.floor(Math.random() * colors.length)] : 0x4facfe;
            const p = new PIXI.Graphics()
                .circle(0, 0, mode === 'neon' ? Math.random() * 2 + 1 : 2)
                .fill(selectedColor);
            
            if(mode === 'neon') p.blendMode = 'add';

            p.x = Math.random() * app.screen.width;
            p.y = Math.random() * app.screen.height;
            p.originX = p.x; p.originY = p.y;
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = (Math.random() - 0.5) * 0.5;

            container.addChild(p);
            particles.push(p);
            window.particles.push(p);
        }
    };

    window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
    });

    app.ticker.add(() => {
        lineGraphics.clear();
        const mx = window.mouseX || -1000;
        const my = window.mouseY || -1000;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.originX += p1.vx; p1.originY += p1.vy;
            if (p1.originX < 0) p1.originX = app.screen.width;
            if (p1.originX > app.screen.width) p1.originX = 0;
            if (p1.originY < 0) p1.originY = app.screen.height;
            if (p1.originY > app.screen.height) p1.originY = 0;

            const dx = mx - p1.x, dy = my - p1.y, dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
                const angle = Math.atan2(dy, dx), force = (150 - dist) / 150;
                p1.x -= Math.cos(angle) * force * 15;
                p1.y -= Math.sin(angle) * force * 15;
            } else {
                p1.x += (p1.originX - p1.x) * 0.08;
                p1.y += (p1.originY - p1.y) * 0.08;
            }

            if (currentBgMode === 'neon') {
                for (let j = i + 1; j < Math.min(i + 50, particles.length); j++) {
                    const p2 = particles[j], d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    if (d < 70) { 
                        lineGraphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y)
                            .stroke({ width: 1, color: 0x3498db, alpha: 1 - d/70 });
                    }
                }
            }
        }
    });
    window.initParticles('stars'); 
})();