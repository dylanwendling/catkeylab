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
  // Transparent background so the Light/Dark mode CSS shows underneath
  scene.background = null; 

  // Subtle fog for depth
  scene.fog = new THREE.FogExp2('#161b22', 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true // Enable transparent background
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Calming Particle System (Soft dust motes)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 500;
  
  const posArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);
  
  for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles
    posArray[i] = (Math.random() - 0.5) * 400;
  }
  for(let i = 0; i < particlesCount; i++) {
    scaleArray[i] = Math.random();
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x10b981, // Soft emerald
    size: 1.5,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particleMesh);

  // Calming Cat-Related 3D Objects: Floating "Yarn Balls" (Spheres)
  const shapes = [];
  const shapeGeometry = new THREE.SphereGeometry(6, 32, 32); // Smooth spheres
  
  // Soft, calming colors for the yarn balls
  const colors = [
    0xfda4af, // Soft pink
    0x93c5fd, // Soft blue
    0xfcd34d, // Soft yellow
    0x6ee7b7, // Soft mint
    0xc4b5fd  // Soft lavender
  ];

  for(let i = 0; i < 8; i++) {
    const shapeMaterial = new THREE.MeshPhysicalMaterial({
      color: colors[i % colors.length],
      metalness: 0.1,
      roughness: 0.8, // Matte finish like yarn
      clearcoat: 0.1, // Slight sheen
      clearcoatRoughness: 0.5
    });

    const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    
    // Spread them around calmly
    mesh.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 60 - 20
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    // Custom properties for VERY slow, calming animation
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.005,
      rotSpeedY: (Math.random() - 0.5) * 0.005,
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y // Keep track of base height for bobbing
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xffffff, 1, 200); 
  pointLight1.position.set(50, 50, 50);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x10b981, 1, 200); // Emerald tint
  pointLight2.position.set(-50, -50, 20);
  scene.add(pointLight2);

  // Interaction: Mouse movement
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

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    
    // Slow scene rotation
    particleMesh.rotation.y = elapsedTime * 0.02;
    particleMesh.position.y = Math.sin(elapsedTime * 0.2) * 5;

    // Update yarn balls (slow rotation and floating)
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotSpeedX;
      shape.rotation.y += shape.userData.rotSpeedY;
      shape.position.y = shape.userData.baseY + Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 15;
    });

    // Extremely smooth and slow camera mouse follow
    targetX = mouseX * 0.02;
    targetY = mouseY * 0.02;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
