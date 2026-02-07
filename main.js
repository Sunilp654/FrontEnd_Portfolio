
// 1. Right click disable
document.addEventListener('contextmenu', e => e.preventDefault());

// 2. Disable Keyboard Shortcuts for Inspect Element
document.onkeydown = function(e) {
    // Disable F12
    if (e.keyCode == 123) return false;

    // Disable Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false;

    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) return false;

    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false;
};

// 3. Console Warning (Agar koi fir bhi khol le)
setInterval(() => {
    console.clear();
    console.log("%cSTOP!", "color: red; font-size: 40px; font-weight: bold;");
    console.log("%cThis is a protected portfolio. Accessing the source code is not allowed.", "font-size: 18px;");
}, 1000);



const sounds = {
    bg: new Howl({ src: ['./src/assets/Audio/Yucatan_BG_Sound.mp3'], loop: true, volume: 0.5, html5: true }),
    shoot: new Howl({ src: ['./src/assets/Audio/burstSound.mp3'], volume: 0.3 }),
    pop: new Howl({ src: ['./src/assets/Audio/big win game sound.mp3'], volume: 0.4 }),
    click: new Howl({ src: ['./src/assets/Audio/Button_Sound_3.mp3'], volume: 0.2 }),
    gameOver: new Howl({ src: ['./src/assets/Audio/big win game sound.mp3'],loop: false, volume: 0.5 })
};
let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    
    // Howler.js global volume control
    if (isMuted) {
        Howler.volume(0); 
        document.getElementById("muteBtn").innerText = "🔇 Unmute";
        document.getElementById("muteBtn").style.background = "#e74c3c"; // Red highlight
    } else {
        Howler.volume(1); 
        document.getElementById("muteBtn").innerText = "🔊 Mute";
        document.getElementById("muteBtn").style.background = "#555"; // Original color
    }
    
    // Sound effect on click
    if(typeof sounds !== 'undefined' && sounds.click) {
        sounds.click.play();
    }
}

function openGame() {
    sounds.click.play();
    sounds.bg.play();
    document.getElementById("gameModal").style.display = "block";
    if (typeof init === 'function') init();
}

function closeGame() {
    sounds.click.play();
    sounds.bg.stop();
    document.getElementById("gameModal").style.display = "none";
}

function toggleGames() {
    sounds.click.play();
    let h = document.getElementById('hidden-games'), b = document.getElementById('toggleBtn');
    if (h.style.display === 'none') { h.style.display = 'block'; b.innerHTML = 'Show Less ▲'; }
    else { h.style.display = 'none'; b.innerHTML = 'View All Games ▼'; }
}

// Typing Logic
const roles = ["Frontend Developer", "React.JS Developer", "Senior Software Engineer"];
let roleIndex = 0, charIndex = 0;

function type() {
    const target = document.getElementById("typing-text");
    if (!target) return;
    if (charIndex < roles[roleIndex].length) {
        target.textContent += roles[roleIndex].charAt(charIndex);
        charIndex++; setTimeout(type, 100);
    } else setTimeout(erase, 2000);
}

function erase() {
    const target = document.getElementById("typing-text");
    if (charIndex > 0) {
        target.textContent = roles[roleIndex].substring(0, charIndex - 1);
        charIndex--; setTimeout(erase, 50);
    } else {
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 500);
    }
}
// main.js mein ye function add karein (Toaster message ke liye)
function showAchievement(title, message) {
    const toast = document.getElementById("achievement-toast");
    if (!toast) return;
    
    document.getElementById("toast-title").innerText = title;
    document.getElementById("toast-msg").innerText = message;
    
    toast.classList.add("show");
    if (typeof sounds !== 'undefined' && sounds.pop) sounds.pop.play();

    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// High Score Save/Load Logic (LocalStorage ke liye)
function updateHighScore(newScore) {
    const savedHS = parseInt(localStorage.getItem('bubbleHighScore') || 0);
    if (newScore > savedHS) {
        localStorage.setItem('bubbleHighScore', newScore);
        document.getElementById('high-score').innerText = newScore;
        showAchievement("New High Score! 🏆", `You reached ${newScore} points!`);
    }
}

window.addEventListener('load', () => {
    type();
    gsap.to(".glow-ring", { rotation: 360, duration: 8, repeat: -1, ease: "none" });
});

function openSkills() { 
    sounds.click.play()
    document.getElementById("skillsModal").style.display = "block";
 }
function closeSkills() { sounds.click.play();
    document.getElementById("skillsModal").style.display = "none"; }
function openExperience() {sounds.click.play(); document.getElementById("experienceModal").style.display = "block"; }
function closeExperience() {sounds.click.play(); document.getElementById("experienceModal").style.display = "none"; }
// main.js ke end mein add karein
function openRTP() {
    
    if (typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("rtpModal").style.display = "block";
    
}

function closeRTP() {
    sounds.click.play();
    document.getElementById("rtpModal").style.display = "none";
}
function calculateRTP() {
        sounds.click.play();

    const bet = parseFloat(document.getElementById("totalBet").value);
    const win = parseFloat(document.getElementById("totalWin").value);
    const display = document.getElementById("rtpDisplay");
    const resultDiv = document.getElementById("rtpResult");
    const status = document.getElementById("rtpStatus");

    if (bet > 0) {
        const rtp = ((win / bet) * 100).toFixed(2);
        resultDiv.style.display = "block";
        display.innerText = rtp + "%";
        
        // Status Check Logic
        if (rtp >= 92 && rtp <= 98) {
            status.innerText = "✅ GLI COMPLIANT: Standard Market RTP";
            status.style.color = "#25d366"; // Green
        } else if (rtp > 98) {
            status.innerText = "🔥 HIGH PAYOUT: Player Advantage Mode";
            status.style.color = "#4facfe"; // Blue
        } else {
            status.innerText = "⚠️ HIGH VOLATILITY: Operator Advantage Mode";
            status.style.color = "#ff4757"; // Red
        }
                showAchievement("Math Engine Analyzed ⚙️", `Theoretical RTP calculated at ${rtp}%`);

        gsap.from(display, { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
    } else {
        alert("Please enter a valid Bet amount.");
    }
}

window.onclick = function (e) {
    if (e.target.className === 'modal') {
        const modals = ['skillsModal', 'gameModal', 'experienceModal', 'contactModal', 'educationModal', 'rtpModal'];
        modals.forEach(m => document.getElementById(m).style.display = 'none');
        sounds.bg.stop();
    }
}

function playGif(card) {
    const img = card.querySelector('img');
    const gifUrl = img.getAttribute('data-gif');
    if (gifUrl) {
        img.src = gifUrl; // Hover par GIF load karega
    }
}

function stopGif(card) {
    const img = card.querySelector('img');
    const staticUrl = img.getAttribute('data-static');
    if (staticUrl) {
        img.src = staticUrl; // Mouse hatate hi static image wapas
    }
}

function handleDownload(btn) {
    const loader = btn.querySelector('.btn-loader');
    const text = btn.querySelector('.btn-text');
    const resumePath = "./src/Resume/Shubham_Jaiswal_Resume.pdf"; //resume path

    // Button Animation
    text.style.display = 'none';
    loader.style.display = 'inline-block';

    setTimeout(() => {
        // Download Trigger
        const link = document.createElement('a');
        link.href = resumePath;
        link.download = "Shubham_Jaiswal_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset Button
        text.style.display = 'inline-flex';
        loader.style.display = 'none';
        
        // Success Toast (Optional)
        showToast("Resume Download Started!"); 
    }, 1000); // 1 sec ka professional delay
}