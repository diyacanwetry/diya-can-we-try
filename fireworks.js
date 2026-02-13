/* ============================================================
   THREE.JS FIREWORKS ANIMATION - OPTIMIZED
   Vibrant explosion effect for the proposal page
   Performance optimizations for mobile devices
   ============================================================ */

let fireworksScene, fireworksCamera, fireworksRenderer;
let fireworkParticles = [];
let fireworksActive = false;
let fireworksAnimationId;

// Throttle burst creation
let lastBurstTime = 0;
const BURST_THROTTLE = 500;

function initFireworks() {
    // Check if already initialized
    if (fireworksRenderer) return;

    // Detect device capabilities
    const isMobile = window.innerWidth < 768;
    const isLowEnd = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        navigator.hardwareConcurrency <= 4;

    // Create container
    const container = document.createElement('div');
    container.id = 'fireworks-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '9998';
    container.style.pointerEvents = 'none';
    container.style.display = 'none';
    document.body.appendChild(container);

    // Three.js Setup - optimized
    fireworksScene = new THREE.Scene();
    fireworksCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    fireworksRenderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: isLowEnd ? false : true,
        powerPreference: 'low-power'
    });

    fireworksRenderer.setSize(window.innerWidth, window.innerHeight);
    fireworksRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(fireworksRenderer.domElement);

    fireworksCamera.position.z = 50;

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleFireworksVisibility);

    animateFireworks();
}

function handleFireworksVisibility() {
    if (document.hidden) {
        cancelAnimationFrame(fireworksAnimationId);
    } else if (fireworksActive) {
        animateFireworks();
    }
}

function createFireworkExplosion(x, y, color, isLowEnd = false) {
    // Significantly reduce particle count for better performance
    const particleCount = isLowEnd ? 80 : 150;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = 0;

        // Simplified spherical explosion pattern
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const speed = (Math.random() * 0.3 + 0.2) * (isLowEnd ? 0.5 : 0.6);

        velocities.push({
            x: speed * Math.sin(phi) * Math.cos(theta),
            y: speed * Math.sin(phi) * Math.sin(theta),
            z: speed * Math.cos(phi),
            decay: Math.random() * 0.01 + 0.008
        });

        // Simplified color variation
        const colorVar = isLowEnd ? 0 : (Math.random() * 0.03);
        const c = baseColor.clone();
        c.r = Math.min(1, c.r + colorVar);
        c.g = Math.min(1, c.g + colorVar);
        c.b = Math.min(1, c.b + colorVar);

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: isLowEnd ? 0.4 : 0.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 1
    });

    const points = new THREE.Points(geometry, material);
    fireworksScene.add(points);

    fireworkParticles.push({
        mesh: points,
        velocities: velocities,
        life: 1.0,
        particleCount: particleCount
    });
}

function launchFireworks() {
    if (!fireworksRenderer) initFireworks();

    const container = document.getElementById('fireworks-container');
    if (container) container.style.display = 'block';

    fireworksActive = true;

    // Detect device
    const isLowEnd = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory < 4);

    // Colors - reduced palette
    const colors = [0xff007f, 0xff1493, 0xff69b4];

    // Immediate burst
    createFireworkExplosion(0, 5, colors[0], isLowEnd);

    // Throttled bursts
    let burstCount = 0;
    const maxBursts = isLowEnd ? 5 : 8;
    const burstInterval = isLowEnd ? 1000 : 800;

    const interval = setInterval(() => {
        if (!fireworksActive) {
            clearInterval(interval);
            return;
        }

        const now = Date.now();
        if (now - lastBurstTime < BURST_THROTTLE) return;
        lastBurstTime = now;

        const x = (Math.random() - 0.5) * 30;
        const y = Math.random() * 15;
        const color = colors[Math.floor(Math.random() * colors.length)];

        createFireworkExplosion(x, y, color, isLowEnd);

        burstCount++;
        if (burstCount > maxBursts) clearInterval(interval);
    }, burstInterval);
}

function animateFireworks() {
    if (!fireworksActive || !fireworksRenderer) return;

    fireworksAnimationId = requestAnimationFrame(animateFireworks);

    // Update particles
    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        const fw = fireworkParticles[i];
        const positions = fw.mesh.geometry.attributes.position.array;

        for (let j = 0; j < fw.particleCount; j++) {
            const v = fw.velocities[j];

            positions[j * 3] += v.x;
            positions[j * 3 + 1] += v.y;
            positions[j * 3 + 2] += v.z;

            v.y -= 0.012;
            v.x *= 0.99;
            v.y *= 0.99;
            v.z *= 0.99;
        }

        fw.mesh.geometry.attributes.position.needsUpdate = true;

        // Faster decay for performance
        fw.life -= 0.015;
        fw.mesh.material.opacity = fw.life;

        if (fw.life <= 0) {
            fireworksScene.remove(fw.mesh);
            fw.mesh.geometry.dispose();
            fw.mesh.material.dispose();
            fireworkParticles.splice(i, 1);
        }
    }

    fireworksRenderer.render(fireworksScene, fireworksCamera);
}

// Cleanup function
function disposeFireworks() {
    cancelAnimationFrame(fireworksAnimationId);
    document.removeEventListener('visibilitychange', handleFireworksVisibility);

    fireworkParticles.forEach(fw => {
        fireworksScene.remove(fw.mesh);
        fw.mesh.geometry.dispose();
        fw.mesh.material.dispose();
    });
    fireworkParticles = [];

    if (fireworksRenderer) {
        fireworksRenderer.dispose();
    }
}
