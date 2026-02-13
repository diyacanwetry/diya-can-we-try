/* ============================================================
   THREE.JS PARTICLE SYSTEM - OPTIMIZED
   Subtle floating sparkles in the background
   Performance optimizations for mobile devices
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
});

let particleScene, particleCamera, particleRenderer, particleAnimationId;
let particles, particleCount, particleVelocities;
let isParticleVisible = true;

// Throttle mousemove events for better performance - reduced
let mouseMoveTimeout;
const MOUSE_THROTTLE = 100; // Increased throttle for less interference

function initParticles() {
    // Detect device capabilities - be more aggressive for mobile
    const isMobile = window.innerWidth < 768;
    const isLowEnd = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        navigator.deviceMemory && navigator.deviceMemory < 4;

    // Significantly reduce particle count for smoother cursor tracking
    particleCount = isLowEnd ? 20 : (isMobile ? 30 : 50);

    // Create scene, camera, renderer
    particleScene = new THREE.Scene();
    particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Use power preference for better performance
    particleRenderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false, // Disable antialias for performance
        powerPreference: 'low-power'
    });

    particleRenderer.setSize(window.innerWidth, window.innerHeight);
    particleRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio

    // Add canvas to body
    const container = document.createElement('div');
    container.id = 'particles-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    // GPU optimization: promote to own layer
    container.style.willChange = 'transform';
    container.appendChild(particleRenderer.domElement);
    document.body.prepend(container);

    // Create particles geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Random positions spread across screen
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        // Simplified velocities for better performance
        particleVelocities.push({
            y: (Math.random() - 0.5) * 0.002,
            swaySpeed: Math.random() * 0.005 + 0.002,
            swayOffset: Math.random() * Math.PI * 2
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material - simplified for performance
    const material = new THREE.PointsMaterial({
        color: 0xffadc6,
        size: isLowEnd ? 0.08 : 0.12,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particles = new THREE.Points(geometry, material);
    particleScene.add(particles);
    particleCamera.position.z = 5;

    // Use requestAnimationFrame with visibility check - pause when tab hidden
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start animation only when page is visible
    if (!document.hidden) {
        animateParticles();
    }
}

function handleVisibilityChange() {
    isParticleVisible = !document.hidden;
    if (!isParticleVisible) {
        cancelAnimationFrame(particleAnimationId);
    } else {
        animateParticles();
    }
}

function animateParticles() {
    if (!isParticleVisible) return;

    particleAnimationId = requestAnimationFrame(animateParticles);

    if (!particles) return;

    const time = Date.now() * 0.001;

    // Gentle constant rotation (no mouse interaction to avoid conflicts)
    particles.rotation.y += 0.0002;

    // Simplified individual particle movement
    const positions = particles.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        const v = particleVelocities[i];
        positions[i * 3 + 1] += Math.sin(time * v.swaySpeed + v.swayOffset) * 0.0005;

        // Wrap around for continuous flow
        if (positions[i * 3 + 1] > 10) positions[i * 3 + 1] = -10;
        if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] = 10;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particleRenderer.render(particleScene, particleCamera);
}

// Cleanup function
function disposeParticles() {
    if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (particles) {
        particles.geometry.dispose();
        particles.material.dispose();
        particleScene.remove(particles);
    }
    if (particleRenderer) particleRenderer.dispose();
}
