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
  scene.background = new THREE.Color('#0a1913'); // Deep forest green
  
  // Fog for depth
  scene.fog = new THREE.FogExp2('#0a1913', 0.0015);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle System (Fireflies / Spores)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 800;
  
  const posArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);
  
  for(let i = 0; i < particlesCount * 3; i++) {
    // Spread particles over a large area
    posArray[i] = (Math.random() - 0.5) * 400;
  }
  for(let i = 0; i < particlesCount; i++) {
    scaleArray[i] = Math.random();
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

  // Custom shader material for softer particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#6ee7b7') } // Emerald green
    },
    vertexShader: `
      attribute float aScale;
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Add subtle floating animation
        modelPosition.y += sin(time * 0.5 + modelPosition.x * 0.05) * 2.0;
        modelPosition.x += cos(time * 0.3 + modelPosition.y * 0.05) * 1.0;
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        
        // Size attenuation based on depth and scale
        gl_PointSize = (40.0 * aScale) * (1.0 / -viewPosition.z);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        // Create a soft circle
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float strength = 0.05 / distanceToCenter - 0.1;
        
        gl_FragColor = vec4(color, strength);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particleMesh);

  // Add Abstract Floating Geometric Shapes (Glassmorphism look)
  const shapes = [];
  const shapeGeometry = new THREE.IcosahedronGeometry(8, 0);
  const shapeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.9, // glass-like
    thickness: 1.5,
    ior: 1.5
  });

  for(let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    mesh.position.set(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 50 - 20
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    // Custom properties for animation
    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.01,
      rotSpeedY: (Math.random() - 0.5) * 0.01,
      floatSpeed: Math.random() * 0.02 + 0.01,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    scene.add(mesh);
    shapes.push(mesh);
  }

  // Lighting for the shapes
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x10b981, 2, 200); // Emerald
  pointLight1.position.set(50, 50, 50);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 200); // Blueish tint
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
    
    // Update particles
    particleMaterial.uniforms.time.value = elapsedTime;
    
    // Slow scene rotation
    particleMesh.rotation.y = elapsedTime * 0.05;

    // Update shapes
    shapes.forEach(shape => {
      shape.rotation.x += shape.userData.rotSpeedX;
      shape.rotation.y += shape.userData.rotSpeedY;
      shape.position.y += Math.sin(elapsedTime * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.1;
    });

    // Smooth camera mouse follow
    targetX = mouseX * 0.05;
    targetY = mouseY * 0.05;
    
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
