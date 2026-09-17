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
  // Calming twilight/sakura gradient background
  scene.background = new THREE.Color('#1a1025'); 
  
  // Fog for depth and color blending
  scene.fog = new THREE.FogExp2('#2d1b36', 0.002);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Cherry Blossom Particle System
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1200; // More particles for a dense, calm falling effect
  
  const posArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);
  const randomDriftArray = new Float32Array(particlesCount);
  
  for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spread particles over a large area
    posArray[i] = (Math.random() - 0.5) * 500;   // x
    posArray[i+1] = (Math.random() - 0.5) * 500; // y
    posArray[i+2] = (Math.random() - 0.5) * 400; // z
  }
  for(let i = 0; i < particlesCount; i++) {
    scaleArray[i] = Math.random() * 0.5 + 0.5; // Random size variation
    randomDriftArray[i] = Math.random() * Math.PI * 2; // Random phase for drifting
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));
  particlesGeometry.setAttribute('aDrift', new THREE.BufferAttribute(randomDriftArray, 1));

  // Custom shader material for soft cherry blossom petals
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color('#ffb7c5') }, // Light sakura pink
      color2: { value: new THREE.Color('#ffffff') }  // White edge
    },
    vertexShader: `
      attribute float aScale;
      attribute float aDrift;
      uniform float time;
      varying vec2 vUv;
      varying float vDrift;
      void main() {
        vDrift = aDrift;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Gentle falling animation
        float fallSpeed = 15.0;
        // Wrap Y position so they loop endlessly
        modelPosition.y = mod(modelPosition.y - (time * fallSpeed * aScale) + 250.0, 500.0) - 250.0;
        
        // Horizontal drift like wind
        modelPosition.x += sin(time * 0.5 + aDrift) * 10.0 * aScale;
        modelPosition.z += cos(time * 0.3 + aDrift) * 5.0;
        
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
        
        // Size attenuation based on depth and scale
        gl_PointSize = (45.0 * aScale) * (1.0 / -viewPosition.z);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying float vDrift;
      void main() {
        // Create a soft petal-like circle
        vec2 center = gl_PointCoord - 0.5;
        float distanceToCenter = length(center);
        
        if (distanceToCenter > 0.5) {
            discard; // Make it a circle
        }
        
        // Mix pink and white for a soft petal look
        vec3 finalColor = mix(color1, color2, distanceToCenter * 2.0);
        
        // Soft edges
        float alpha = (0.5 - distanceToCenter) * 2.0;
        
        gl_FragColor = vec4(finalColor, alpha * 0.8);
      }
    `,
    transparent: true,
    blending: THREE.NormalBlending, // Normal blending looks softer than additive for petals
    depthWrite: false
  });

  const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
  scene.add(particleMesh);

  // Soft ambient lighting (even though shader doesn't strictly use it, good for future meshes)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

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

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    
    // Update shader time for falling logic
    particleMaterial.uniforms.time.value = elapsedTime;
    
    // Very slow scene rotation for dynamic wind effect
    particleMesh.rotation.y = Math.sin(elapsedTime * 0.1) * 0.1;

    // Smooth camera mouse follow (very subtle and calming)
    targetX = mouseX * 0.02;
    targetY = mouseY * 0.02;
    
    camera.position.x += (targetX - camera.position.x) * 0.01;
    camera.position.y += (-targetY - camera.position.y) * 0.01;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}
