// Global Variables for the core components
let scene, camera, renderer;
let lobbyUI = document.getElementById('lobby-ui');
let startButton = document.getElementById('start-button');
let particleSystem;

// --- Helper function to detect mobile ---
function isMobile() {
    // Simple check based on window width.
    return window.innerWidth <= 768;
}

// --- NEW: Helper to make background "cover" ---
/**
 * Calculates the offset and repeat properties for a texture to
 * make it "cover" the background viewport without stretching.
 * @param {THREE.Texture} texture The background texture.
 */
function updateBackgroundAspect(texture) {
    const imageAspect = texture.image.width / texture.image.height;
    const screenAspect = window.innerWidth / window.innerHeight;

    if (imageAspect > screenAspect) {
        // Image is wider than the screen. Fit height, crop width.
        texture.repeat.x = screenAspect / imageAspect;
        texture.repeat.y = 1;
        texture.offset.x = (1 - texture.repeat.x) / 2;
        texture.offset.y = 0;
    } else {
        // Image is narrower than (or same as) the screen. Fit width, crop height.
        texture.repeat.x = 1;
        texture.repeat.y = imageAspect / screenAspect;
        texture.offset.x = 0;
        texture.offset.y = (1 - texture.repeat.y) / 2;
    }
}


// --- Initialization and Core Loop ---

function init() {
    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Load the 2D background
    loadLobbyEnvironment();

    // Create the 3D particle system
    createParticles();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    startButton.addEventListener('click', transitionToMap);

    // Start the game loop
    animate();
}

/**
 * MODIFIED: Loads the Flikha Island 2D image as the scene background.
 * Now ensures the image "covers" the screen without distortion.
 */
function loadLobbyEnvironment() {
    const textureLoader = new THREE.TextureLoader();
    // !!! IMPORTANT: Remember to update this path !!!
    textureLoader.load('assets/failaka_island.jpg', function(texture) {
        // --- NEW: Call the helper function to fit the texture ---
        updateBackgroundAspect(texture);

        scene.background = texture;
    }, undefined, function(err) {
        console.error('An error happened while loading the texture.', err);
    });
}

/**
 * UPDATED: Creates an animated 3D particle system for depth.
 * (Now optimized for mobile)
 */
function createParticles() {
    // Adjust particle count for mobile
    const particleCount = isMobile() ? 400 : 1000;

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        // Create particles within a 20x20x20 cube centered at origin
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

/**
 * Game loop for continuous rendering.
 */
function animate() {
    requestAnimationFrame(animate);

    if (particleSystem) {
        particleSystem.rotation.y += 0.0005;
        particleSystem.rotation.x += 0.0002;
    }

    renderer.render(scene, camera);
}

/**
 * MODIFIED: Handles window resizing for responsiveness.
 * Now also updates the background texture's aspect ratio.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- NEW: Update background aspect on resize ---
    if (scene.background) {
        updateBackgroundAspect(scene.background);
    }
}

/**
 * Hides the lobby UI to prepare for the map view.
 */
function transitionToMap() {
    // --- FIXED: Typo from console.Log to console.log ---
    console.log("Transitioning to Theme Selection (Map) View...");

    // Use the CSS class for a fade-out effect
    lobbyUI.style.animation = "fadeOut 1s forwards";

    // We also need a fadeOut keyframe in CSS
    // (You can add this to your style.css)
    /*
    @keyframes fadeOut {
        to {
            opacity: 0;
            visibility: hidden;
        }
    }
    */

    setTimeout(() => {
        lobbyUI.style.display = 'none';

        // Logic to setup the Map scene (e.g., calling a new function like setupMapView()) goes here
        alert("Lobby closed. Ready to build the Map View!");
    }, 1000); // Wait for the CSS transition to complete
}

// Start the application!
init();