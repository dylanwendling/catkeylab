export function initSylvaHero() {
  const canvas = document.getElementById('sylva-canvas');
  if (!canvas) return;

  // Ensure Three.js is loaded
  if (typeof window.THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    return;
  }

  const THREE = window.THREE;

  // Scene setup
  const scene = new THREE.Scene();
  // Transparent background so the Light/Dark mode CSS shows underneath!
  scene.background = null; 

  // Subtle fog to fade out rain in the distance
  scene.fog = new THREE.FogExp2('#111827', 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true // Enable transparent background
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Clear color is transparent
  renderer.setClearColor(0x000000, 0);

  // Calming Rain Particle System
  const rainCount = 1500;
  const rainGeometry = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  const rainSpeeds = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    // Spread rain drops
    rainPositions[i * 3] = (Math.random() - 0.5) * 400; // x
    rainPositions[i * 3 + 1] = Math.random() * 400 - 200; // y
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 300; // z
    
    // Varying drop speeds
    rainSpeeds[i] = Math.random() * 2 + 1.5;
  }

  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

  const rainMaterial = new THREE.PointsMaterial({
    color: 0x94a3b8, // Soft slate blue/grey for rain
    size: 0.8,
    transparent: true,
    opacity: 0.6,
    blending: THREE.NormalBlending,
    depthWrite: false
  });

  const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
  scene.add(rainSystem);

  // Add a few subtle low-poly "Greenery" leaves floating around for the "Sylva" touch
  const leaves = [];
  const leafGeometry = new THREE.PlaneGeometry(3, 3);
  const leafMaterial = new THREE.MeshBasicMaterial({
    color: 0x10b981, // Emerald green
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  for(let i = 0; i < 20; i++) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(
      (Math.random() - 0.5) * 300,
      Math.random() * 400 - 200,
      (Math.random() - 0.5) * 200
    );
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    leaf.userData = {
      speedY: Math.random() * 0.5 + 0.2,
      speedX: Math.random() * 0.2 - 0.1,
      rotSpeed: Math.random() * 0.05 + 0.01
    };
    
    scene.add(leaf);
    leaves.push(leaf);
  }

  // Interaction: Mouse movement for subtle parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  function animate() {
    requestAnimationFrame(animate);

    // Update Rain
    const positions = rainSystem.geometry.attributes.position.array;
    for(let i = 0; i < rainCount; i++) {
      // Move rain down
      positions[i * 3 + 1] -= rainSpeeds[i];
      
      // Reset rain when it hits the bottom
      if (positions[i * 3 + 1] < -200) {
        positions[i * 3 + 1] = 200;
      }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true;

    // Update Leaves
    leaves.forEach(leaf => {
      leaf.position.y -= leaf.userData.speedY;
      leaf.position.x += leaf.userData.speedX;
      leaf.rotation.x += leaf.userData.rotSpeed;
      leaf.rotation.y += leaf.userData.rotSpeed;

      if (leaf.position.y < -200) {
        leaf.position.y = 200;
        leaf.position.x = (Math.random() - 0.5) * 300;
      }
    });

    // Smooth camera mouse follow (very subtle parallax)
    targetX = mouseX * 0.05;
    targetY = mouseY * 0.05;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
