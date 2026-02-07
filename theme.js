// theme.js
const themeConfigs = {
    cyber: { primary: "#00f2fe", secondary: "#4facfe", star: 0x00f2fe },
    inferno: { primary: "#ff4757", secondary: "#ffa502", star: 0xff4757 },
    gold: { primary: "#ffd700", secondary: "#ff8c00", star: 0xffd700 }
};

function changeTheme(mode) {
    const config = themeConfigs[mode];

    gsap.to(":root", {
        "--neon-blue": config.primary,
        "--neon-purple": config.secondary,
        duration: 1.0
    });

    if (window.particles) {
        window.particles.forEach(p => {
            // Direct property animation to avoid internal 'instanceof' check
            gsap.to(p, {
                tint: config.star, 
                duration: 1.0,
                overwrite: 'auto'
            });
        });
    }
}

const originalInitParticles = window.initParticles;
window.initParticles = function(mode) {
    if(mode === 'neon') changeTheme('cyber');
    if(typeof originalInitParticles === 'function') originalInitParticles(mode);
};