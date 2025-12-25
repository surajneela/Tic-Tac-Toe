function launchConfetti() {
    const colors = ['#00b894', '#0984e3', '#e84393', '#fdcb6e', '#ff7675', '#74b9ff'];
    const confettiCount = 200;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random positioning and properties
        const left = Math.random() * 100;
        const animDuration = Math.random() * 3 + 2; // 2-5 seconds
        const animDelay = Math.random() * 2;

        confetti.style.left = left + 'vw';
        confetti.style.top = '-20px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = animDuration + 's';
        confetti.style.animationDelay = animDelay + 's';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, (animDuration + animDelay) * 1000);
    }
}

// Make it globally available
window.launchConfetti = launchConfetti;
