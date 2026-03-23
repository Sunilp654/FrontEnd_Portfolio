function openContact() {
    if (typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "block";
}

function closeContact() {
    
    if (typeof sounds !== 'undefined') sounds.click.play();
    document.getElementById("contactModal").style.display = "none";
}

// contact.js mein openSuccess ko update karein
function openSuccess() {
    document.body.classList.add('modal-open'); // Scroll lock on
    if (typeof sounds !== 'undefined') sounds.pop.play();
    document.getElementById("successModal").style.display = "block";

    // GSAP Confetti Effect
    for (let i = 0; i < 50; i++) {
        createConfetti();
    }

    if (typeof showAchievement === 'function') {
        showAchievement("The Communicator 🚀", "Successfully established a secure link!");
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    document.getElementById("successModal").appendChild(confetti);

    const colors = ['#00f2fe', '#ffd700', '#ff0000', '#2ecc71'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    gsap.set(confetti, {
        x: Math.random() * window.innerWidth,
        y: -10,
        backgroundColor: color
    });

    gsap.to(confetti, {
        y: window.innerHeight + 10,
        x: "+=" + (Math.random() * 200 - 100),
        rotation: Math.random() * 360,
        duration: Math.random() * 2 + 1,
        ease: "power1.out",
        onComplete: () => confetti.remove()
    });
}

function closeSuccess() {
    document.body.classList.remove('modal-open'); // Scroll lock off
    document.getElementById("successModal").style.display = "none";
    
}


const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const emailInput = this.querySelector('input[name="email"]').value;
        // Strict Regex: complete email check
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(emailInput)) {
            alert("⚠️ Comm-Link Error: Please provide a complete email address.");
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        const formData = new FormData(this);
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                closeContact();
                openSuccess(); // Mission Accomplished trigger
                this.reset();
            }
        } catch (error) {
            alert("Connection error. Please check your connection.");
        } finally {
            submitBtn.innerText = "Send Message 🚀";
            submitBtn.disabled = false;
        }
    });
}

function openSuccess() {
    document.getElementById("successModal").style.display = "block";
    document.body.classList.add('modal-open'); // Background scroll lock
}


