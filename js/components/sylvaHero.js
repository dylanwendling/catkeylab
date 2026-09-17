export function initSylvaHero() {
  const canvas = document.getElementById('sylva-canvas');
  if (!canvas) return;

  if (typeof window.THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    return;
  }

  const THREE = window.THREE;

  const scene = new THREE.Scene();
  scene.background = null; 
  scene.fog = new THREE.FogExp2('#161b22', 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Soft glowing ambient particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 300;
  
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 400;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x10b981,
    size: 2.0,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particleMesh);

  // Floating Keyboard Keycaps
  const shapes = [];
  
  // Create a bevelled look using a simple box (standard keycap)
  const keyGeometry = new THREE.BoxGeometry(6, 2, 6);
  // Create a wider spacebar style keycap
  const spacebarGeometry = new THREE.BoxGeometry(16, 2, 6);
  
  const colors = [
    0x3b82f6, // Blue
    0x10b981, // Emerald
    0x8b5cf6, // Violet
    0xf43f5e, // Rose
    0xf59e0b  // Amber
  ];

  for(let i = 0; i < 15; i++) {
    // 20% chance of being a "spacebar" wide key, otherwise standard square key
    const isSpacebar = Math.random() > 0.8;
    const geo = isSpacebar ? spacebarGeometry : keyGeometry;

    const shapeMaterial = new THREE.MeshPhysicalMaterial({
      color: colors[i % colors.length],
      metalness: 0.2,
      roughness: 0.4,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4
    });

    const mesh = new THREE.Mesh(geo, shapeMaterial);
    
    mesh.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 80 - 10
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.005,
      rotSpeedY: (Math.random() - 0.5) * 0.005,
      floatSpeed: Math.random() * 0.01 + 0.005,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(20, 50, 30);
  scene.add(directionalLight);

  const fillLight = new THREE.PointLight(0x3b82f6, 1, 200); 
  fillLight.position.set(-50, -50, 20);
  scene.add(fillLight);

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

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    // Slow particle rotation
    particleMesh.rotation.y = elapsedTime * 0.02;

    // Update floating keycaps
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotSpeedX;
      shape.rotation.y += shape.userData.rotSpeedY;
      shape.position.y = shape.userData.baseY + Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 12;
    });

    targetX = mouseX * 0.02;
    targetY = mouseY * 0.02;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
