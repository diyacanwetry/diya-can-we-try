/* ============================================================
   VALENTINE'S DAY WEBSITE — JAVASCRIPT OPTIMIZED
   Handles: No-button dodge, page transitions, music,
   card flip, secret surprise, confetti, floating hearts
   Performance optimizations for mobile devices
   ============================================================ */

// ===== STATE =====
let noClickCount = 0;

let confettiRunning = false;
let loveSongPlayed = false;
let isPageVisible = true;
let pickupLinePlayed = false; // Add state for pickup line

// ===== DOM ELEMENTS CACHE =====
const cache = {};
function getElement(id) {
    if (!cache[id]) {
        cache[id] = document.getElementById(id);
    }
    return cache[id];
}

// ===== SWEET MESSAGES FOR "NO" CLICKS =====
const noMessages = [
    {
        emoji: '🥺',
        title: 'Are you sure?',
        text: 'My heart just cracked a little... but I believe in second chances. Maybe reconsider? I promise I\'ll make you smile every single day. 💕'
    },
    {
        emoji: '😢',
        title: 'Really, Diya?',
        text: 'They say the best things in life are worth waiting for. I\'d wait forever for your "yes." Let me show you how much you mean to me... 🌹'
    },
    {
        emoji: '💔',
        title: 'My heart says try again...',
        text: 'Even the stars are sad right now looking at us. But you know what? I\'ll never stop trying. Because you\'re worth every attempt. ✨'
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core features
    createFloatingHearts();
    setupNoDodge();
    setupNavigation();
    setupEnvelope();
    setupCursorTrail();
    setupLetterTypewriter();
    // Removed setupPickupLineTyping() as it's now handled in showPage()
    setupMusic();
    setupTeddy();
    setupScrollAnimations();

    // Visibility API - pause heavy animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
    });

    // Throttled floating hearts (less frequent on mobile)
    const isMobile = window.innerWidth < 768;
    const heartInterval = isMobile ? 6000 : 4000;
    setInterval(createFloatingHearts, heartInterval);
});

// ===== FLOATING HEARTS BACKGROUND - OPTIMIZED =====
function createFloatingHearts() {
    if (!isPageVisible) return;

    const container = getElement('heartsBg');
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const hearts = ['💕', '💖', '💗', '💝', '❤️', '✨'];
    const count = isMobile ? 5 : 8;

    // Batch DOM operations
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 15 + 12) + 'px';
        heart.style.animationDuration = (Math.random() * 5 + 8) + 's';
        heart.style.animationDelay = (Math.random() * 3) + 's';

        fragment.appendChild(heart);

        // Auto cleanup after animation
        setTimeout(() => {
            if (heart.parentNode) heart.parentNode.removeChild(heart);
        }, 15000);
    }

    container.appendChild(fragment);
}

// ===== CURSOR HEART TRAIL - OPTIMIZED FOR SMOOTH PERFORMANCE =====
function setupCursorTrail() {
    let lastTrail = 0;
    const trailThreshold = 16; // ~60fps, smooth tracking

    // Pre-create DOM pool to avoid runtime DOM operations
    const trailPool = [];
    const POOL_SIZE = 20;

    for (let i = 0; i < POOL_SIZE; i++) {
        const trail = document.createElement('span');
        trail.className = 'cursor-heart';
        trail.style.position = 'fixed';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '10000';
        trail.style.willChange = 'transform, opacity';
        trail.style.transform = 'translate3d(-100px, -100px, 0)';
        trail.style.opacity = '0';
        trail.dataset.active = 'false';
        document.body.appendChild(trail);
        trailPool.push(trail);
    }

    let poolIndex = 0;

    document.addEventListener('mousemove', (e) => {
        if (!isPageVisible) return;

        const now = Date.now();
        if (now - lastTrail < trailThreshold) return;
        lastTrail = now;

        // Get trail from pool
        const trail = trailPool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;

        // Use transform for GPU-accelerated positioning (no layout reflow)
        trail.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        trail.style.opacity = '1';
        trail.textContent = ['💕', '✨', '💖'][Math.floor(Math.random() * 3)];
        trail.dataset.active = 'true';

        // Use CSS animation for fade out (GPU accelerated)
        trail.style.animation = 'none';
        trail.offsetHeight; // Trigger reflow
        trail.style.animation = 'cursorFadeOptimized 0.8s ease-out forwards';
    }, { passive: true });

    // CSS animation defined below
}

// ===== NO BUTTON — DODGE BEHAVIOR =====
function setupNoDodge() {
    addDodge(getElement('btnNo'));
    addDodge(getElement('btnNoAgain'));
}

function addDodge(btn) {
    if (!btn) return;

    const maxX = window.innerWidth - btn.offsetWidth - 20;
    const maxY = window.innerHeight - btn.offsetHeight - 20;

    const dodge = (e) => {
        e.preventDefault();
        const newX = Math.random() * maxX;
        const newY = Math.max(100, Math.random() * maxY);

        btn.style.position = 'fixed';
        btn.style.left = newX + 'px';
        btn.style.top = newY + 'px';
        btn.style.zIndex = '999';
        btn.style.transition = 'all 0.15s ease-out';
    };

    btn.addEventListener('mouseover', dodge, { passive: true });
    btn.addEventListener('touchstart', dodge, { passive: false });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleNo();
        btn.style.position = '';
        btn.style.left = '';
        btn.style.top = '';
        btn.style.zIndex = '';
    });
}

// ===== HANDLE NO CLICK =====
function handleNo() {
    noClickCount++;

    if (noClickCount <= 3) {
        const msg = noMessages[noClickCount - 1];
        const noEmoji = getElement('noEmoji');
        const noTitle = getElement('noTitle');
        const noText = getElement('noText');

        if (noEmoji) noEmoji.textContent = msg.emoji;
        if (noTitle) noTitle.textContent = msg.title;
        if (noText) noText.textContent = msg.text;

        showPage('noResponsePage');
    } else {
        showPage('finalNoPage');
    }


}

// ===== HANDLE YES CLICK =====
function handleYes() {
    const navbar = getElement('navbar');
    if (navbar) navbar.classList.add('visible');



    showPage('loveLetter');
}

// ===== PAGE NAVIGATION - OPTIMIZED =====
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const currentPage = document.querySelector('.page.active');
    const target = getElement(pageId);

    if (!target || target === currentPage) return;

    if (currentPage) {
        currentPage.classList.remove('active');
        currentPage.classList.add('page-exit');
        setTimeout(() => {
            currentPage.classList.remove('page-exit');
        }, 400);
    }

    setTimeout(() => {
        target.classList.add('active');
        target.style.animation = 'none';
        target.offsetHeight;
        target.style.animation = '';

        if (pageId === 'proposalPage' && !loveSongPlayed) {
            playLoveSong();
        }

        // Trigger pickup line animation if switching to that page
        if (pageId === 'pickupLinePage' && !pickupLinePlayed) {
            pickupLinePlayed = true;
            startPickupLineAnimation();
        }
    }, currentPage ? 150 : 0);

    const navLinks = getElement('navLinks');
    if (navLinks) navLinks.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToNextPage(pageId) {
    if (pageId) showPage(pageId);
}

// ===== NAVBAR SETUP =====
function setupNavigation() {
    const navToggle = getElement('navToggle');
    const navLinks = getElement('navLinks');
    const navbar = getElement('navbar');

    if (!navToggle || !navLinks || !navbar) return;

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('open');
        }
    });
}

// ===== ENVELOPE INTERACTION =====
function setupEnvelope() {
    const envelope = getElement('envelope');
    const letterCard = getElement('letterCard');

    if (!envelope || !letterCard) return;

    envelope.addEventListener('click', () => {
        envelope.classList.add('opened');
        setTimeout(() => {
            envelope.style.display = 'none';
            letterCard.classList.add('visible');
        }, 600);
    }, { passive: true });
}



// ===== CONFETTI / HEART EXPLOSION - OPTIMIZED FOR PERFORMANCE =====
function triggerConfetti() {
    const canvas = getElement('confettiCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true }); // Enable alpha for transparency
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const proposalContent = getElement('proposalContent');
    const postConfetti = getElement('postConfetti');

    if (proposalContent) proposalContent.style.display = 'none';
    if (postConfetti) postConfetti.classList.add('visible');

    if (confettiRunning) return;
    confettiRunning = true;

    if (typeof launchFireworks === 'function') {
        launchFireworks();
    }

    // Auto-stop fireworks after 8 seconds to prevent blocking text
    setTimeout(() => {
        console.log('[Confetti] Auto-stopping after timeout');
        fireworksActive = false;
        const fwContainer = document.getElementById('fireworks-container');
        if (fwContainer) fwContainer.style.display = 'none';
    }, 8000);

    const particles = [];
    const colors = ['#ff69b4', '#ff1493', '#c71585', '#ffb6c1', '#e91e63'];

    // Reduced particle count for better performance
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 6,
            gravity: 0.1,
            friction: 0.985,
            life: 1,
            decay: Math.random() * 0.006 + 0.004,
            isHeart: Math.random() > 0.5
        });
    }

    function drawHeart(ctx, x, y, size, color, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -size / 4);
        ctx.bezierCurveTo(size / 2, -size, size, -size / 4, 0, size / 2);
        ctx.bezierCurveTo(-size, -size / 4, -size / 2, -size, 0, -size / 4);
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        if (!isPageVisible) {
            requestAnimationFrame(animate);
            return;
        }

        // Use clearRect to make the canvas transparent so text behind it is visible
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let active = false;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.life <= 0) continue;
            active = true;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.rotation += p.rotSpeed;
            p.life -= p.decay;

            ctx.globalAlpha = p.life;
            if (p.isHeart) {
                drawHeart(ctx, p.x, p.y, p.size, p.color, p.rotation);
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.globalAlpha = 1;
        }

        if (active) {
            requestAnimationFrame(animate);
        } else {
            confettiRunning = false;
            console.log('[Confetti] Animation complete - clearing canvas');
            // Clear canvas completely instead of filling with dark color
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Hide the canvas element to prevent any rendering issues
            if (canvas) canvas.style.display = 'none';
            // Also hide fireworks container
            fireworksActive = false;
            const fwContainer = document.getElementById('fireworks-container');
            if (fwContainer) fwContainer.style.display = 'none';
        }
    }

    animate();
}

// ===== TYPEWRITER EFFECT - OPTIMIZED =====
function typeWriter(element, text, speed = 25) {
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function setupLetterTypewriter() {
    const letterBody = document.querySelector('.letter-body');
    if (!letterBody) return;

    const paragraphs = letterBody.querySelectorAll('p');
    const originalTexts = Array.from(paragraphs).map(p => p.innerHTML);

    paragraphs.forEach(p => p.innerHTML = '');

    const envelope = getElement('envelope');
    if (envelope) {
        envelope.addEventListener('click', () => {
            setTimeout(() => {
                let delay = 0;
                paragraphs.forEach((p, index) => {
                    setTimeout(() => {
                        typeWriter(p, originalTexts[index], 15);
                    }, delay);
                    delay += originalTexts[index].length * 15 + 200;
                });
            }, 800);
        }, { passive: true });
    }
}

// ===== PICKUP LINE ANIMATION - OPTIMIZED =====
// Function called directly from showPage so no MutationObserver needed
function startPickupLineAnimation() {
    const textContainer = getElement('pickupLineText');
    const nextBtn = getElement('pickupLineNextBtn');

    if (!textContainer || !nextBtn) return;

    const paragraphs = [
        '✨ Tum perfect ho ya nahi, honestly mujhe pata nahi…',
        'aur shayad perfection matter bhi nahi karta.',
        'Par itna zaroor pata hai ke mere liye tum definitely special ho.',
        'Tumhari vibe, tumhari smile, tumhari simplicity —',
        'sab milke tumhe mere liye thodi extra important bana deti hai ❤️'
    ];

    textContainer.innerHTML = '';
    nextBtn.style.display = 'none';

    // Batch paragraph creation
    const fragment = document.createDocumentFragment();

    paragraphs.forEach((para, index) => {
        const p = document.createElement('p');
        p.textContent = para;
        p.style.opacity = '0';
        p.style.animation = `fadeInUp 0.4s ease-out ${index * 0.25}s forwards`;
        fragment.appendChild(p);
    });

    textContainer.appendChild(fragment);

    setTimeout(() => {
        nextBtn.style.display = 'block';
        nextBtn.style.animation = 'pageEnter 0.5s ease-out';
    }, paragraphs.length * 250 + 400);
}

// ===== MUSIC CONTROL =====
function setupMusic() {
    const musicBtn = getElement('musicToggle');
    const bgMusic = getElement('bgMusic');

    if (!musicBtn || !bgMusic) return;

    bgMusic.volume = 0.3;

    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicBtn.classList.add('playing');
                musicBtn.innerHTML = '❚❚';
            }).catch(() => { });
        } else {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            musicBtn.innerHTML = '🎵';
        }
    }, { passive: true });
}

function playLoveSong() {
    const loveSong = getElement('loveSong');
    if (!loveSong) return;

    loveSong.volume = 0.5;
    loveSong.play().then(() => {
        loveSongPlayed = true;
    }).catch(() => { });
}

// ===== TEDDY POPUP =====
function setupTeddy() {
    const teddyBtn = getElement('teddyBtn');
    const teddyPopup = getElement('teddyPopup');

    if (!teddyBtn || !teddyPopup) return;

    teddyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        teddyPopup.classList.toggle('visible');
    }, { passive: true });

    document.addEventListener('click', (e) => {
        if (!teddyBtn.contains(e.target)) {
            teddyPopup.classList.remove('visible');
        }
    });
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
            }
        });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.timeline-item, .flip-card, .section-title');
    animatedElements.forEach(el => {
        el.classList.add('scroll-hidden');
        observer.observe(el);
    });
}

// ===== WINDOW RESIZE HANDLER =====
window.addEventListener('resize', () => {
    const canvas = getElement('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}, { passive: true });

// ===== FLIP CARD ACCORDION BEHAVIOR =====
function handleCardFlip(card) {
    // Close all other open cards
    const allCards = document.querySelectorAll('.flip-card');
    allCards.forEach(c => {
        if (c !== card && c.classList.contains('flipped')) {
            c.classList.remove('flipped');
        }
    });
    card.classList.toggle('flipped');
}


