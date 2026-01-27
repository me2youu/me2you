import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';

const template3D = {
  name: '3D Memory Room',
  description: 'A stunning 3D room experience where your special someone explores a beautiful space filled with floating memories, photo frames, and hidden love messages. Walk around in third-person and discover each surprise!',
  occasion: ['valentines', 'birthday', 'anniversary', 'just-because'],
  thumbnailUrl: '',
  basePrice: '6.99',
  htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Special Place for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      overflow: hidden; 
      background: #000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    #game-container {
      width: 100vw;
      height: 100vh;
      position: relative;
    }
    
    canvas { 
      display: block; 
    }
    
    /* Loading Screen */
    #loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: opacity 0.5s;
    }
    
    #loading-screen.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .loading-heart {
      font-size: 60px;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    
    .loading-text {
      color: #fff;
      font-size: 24px;
      margin-top: 20px;
    }
    
    .loading-subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 14px;
      margin-top: 10px;
    }
    
    /* Start Screen */
    #start-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 900;
    }
    
    #start-screen.visible {
      display: flex;
    }
    
    #start-screen h1 {
      color: #ff6b9d;
      font-size: 48px;
      margin-bottom: 10px;
      text-shadow: 0 0 30px rgba(255, 107, 157, 0.5);
    }
    
    #start-screen .subtitle {
      color: #fff;
      font-size: 24px;
      margin-bottom: 40px;
    }
    
    #start-screen button {
      background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
      color: #fff;
      border: none;
      padding: 20px 60px;
      font-size: 20px;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 10px 30px rgba(255, 107, 157, 0.4);
    }
    
    #start-screen button:hover {
      transform: scale(1.05);
      box-shadow: 0 15px 40px rgba(255, 107, 157, 0.6);
    }
    
    /* HUD */
    #hud {
      position: fixed;
      top: 20px;
      left: 20px;
      color: #fff;
      font-size: 16px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
      z-index: 100;
      display: none;
    }
    
    #hud.visible {
      display: block;
    }
    
    .memory-count {
      background: rgba(0,0,0,0.5);
      padding: 10px 20px;
      border-radius: 25px;
      backdrop-filter: blur(10px);
    }
    
    /* Interaction Prompt */
    #interact-prompt {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 107, 157, 0.9);
      color: #fff;
      padding: 15px 30px;
      border-radius: 30px;
      font-size: 16px;
      display: none;
      z-index: 100;
      animation: bounce 1s ease-in-out infinite;
    }
    
    #interact-prompt.visible {
      display: block;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }
    
    /* Controls hint */
    #controls {
      position: fixed;
      bottom: 20px;
      left: 20px;
      color: rgba(255,255,255,0.7);
      font-size: 14px;
      z-index: 100;
      display: none;
    }
    
    #controls.visible {
      display: block;
    }
    
    #controls span {
      background: rgba(255,255,255,0.2);
      padding: 5px 10px;
      border-radius: 5px;
      margin-right: 10px;
    }
    
    /* Popup Modal */
    #popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    #popup-overlay.visible {
      display: flex;
    }
    
    .popup-content {
      background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
      border: 3px solid #ff6b9d;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      text-align: center;
      animation: popIn 0.3s ease-out;
    }
    
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .popup-content h2 {
      color: #ff6b9d;
      font-size: 28px;
      margin-bottom: 20px;
    }
    
    .popup-content p {
      color: #fff;
      font-size: 18px;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    
    .popup-content img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .popup-content button {
      background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
      color: #fff;
      border: none;
      padding: 15px 40px;
      font-size: 16px;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .popup-content button:hover {
      transform: scale(1.05);
    }

    /* Mobile joystick */
    #mobile-controls {
      display: none;
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 200;
    }

    @media (max-width: 768px) {
      #mobile-controls {
        display: block;
      }
      #controls {
        display: none !important;
      }
    }

    .joystick-base {
      width: 120px;
      height: 120px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      position: relative;
    }

    .joystick-thumb {
      width: 50px;
      height: 50px;
      background: rgba(255, 107, 157, 0.8);
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    #mobile-interact {
      position: fixed;
      bottom: 50px;
      right: 30px;
      width: 80px;
      height: 80px;
      background: rgba(255, 107, 157, 0.8);
      border: none;
      border-radius: 50%;
      font-size: 30px;
      color: #fff;
      display: none;
      z-index: 200;
    }

    @media (max-width: 768px) {
      #mobile-interact {
        display: block;
      }
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  
  <!-- Loading Screen -->
  <div id="loading-screen">
    <div class="loading-heart">💖</div>
    <div class="loading-text">Loading your special place...</div>
    <div class="loading-subtitle">A gift for {{recipientName}}</div>
  </div>
  
  <!-- Start Screen -->
  <div id="start-screen">
    <h1>💝 A Special Place</h1>
    <p class="subtitle">for {{recipientName}}</p>
    <button onclick="startExperience()">Enter</button>
  </div>
  
  <!-- HUD -->
  <div id="hud">
    <div class="memory-count">✨ Memories Found: <span id="memory-count">0</span> / 4</div>
  </div>
  
  <!-- Interaction Prompt -->
  <div id="interact-prompt">Press E to interact</div>
  
  <!-- Controls -->
  <div id="controls">
    <span>WASD</span> Move
    <span>Mouse</span> Look
    <span>E</span> Interact
  </div>

  <!-- Mobile Controls -->
  <div id="mobile-controls">
    <div class="joystick-base" id="joystick">
      <div class="joystick-thumb" id="joystick-thumb"></div>
    </div>
  </div>
  <button id="mobile-interact" onclick="tryInteract()">💖</button>
  
  <!-- Popup -->
  <div id="popup-overlay">
    <div class="popup-content">
      <h2 id="popup-title">Memory</h2>
      <div id="popup-body"></div>
      <button onclick="closePopup()">Continue</button>
    </div>
  </div>

  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  
  <script>
    // Configuration from template
    const CONFIG = {
      recipientName: '{{recipientName}}',
      photoUrl: '{{photoUrl}}',
      message1: '{{message1}}',
      message2: '{{message2}}',
      finalLetter: '{{finalLetter}}',
      roomColor: '{{roomColor}}'
    };

    // Room color themes
    const THEMES = {
      pink: { wall: 0xffe4ec, floor: 0xffd1dc, accent: 0xff6b9d, light: 0xffb6c1 },
      blue: { wall: 0xe4f0ff, floor: 0xd1e8ff, accent: 0x6b9dff, light: 0xb6d1ff },
      purple: { wall: 0xf0e4ff, floor: 0xe1d1ff, accent: 0x9d6bff, light: 0xd1b6ff },
      warm: { wall: 0xfff4e4, floor: 0xffe8d1, accent: 0xffa06b, light: 0xffd1b6 }
    };

    const theme = THEMES[CONFIG.roomColor] || THEMES.pink;

    // Game state
    let scene, camera, renderer;
    let player, playerBody;
    let interactables = [];
    let memoriesFound = 0;
    let currentInteractable = null;
    let gameStarted = false;

    // Controls
    const keys = { w: false, a: false, s: false, d: false };
    let mouseX = 0, mouseY = 0;
    let playerRotation = 0;

    // Initialize Three.js
    function init() {
      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);
      scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

      // Camera
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 8, 12);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.getElementById('game-container').appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(5, 10, 5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);

      // Accent lights
      const pinkLight = new THREE.PointLight(theme.light, 1, 20);
      pinkLight.position.set(-5, 5, -5);
      scene.add(pinkLight);

      const pinkLight2 = new THREE.PointLight(theme.light, 1, 20);
      pinkLight2.position.set(5, 5, 5);
      scene.add(pinkLight2);

      // Create room
      createRoom();

      // Create player
      createPlayer();

      // Create interactables
      createInteractables();

      // Event listeners
      setupControls();

      // Hide loading, show start
      setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.add('visible');
      }, 2000);

      // Start render loop
      animate();
    }

    function createRoom() {
      // Floor
      const floorGeom = new THREE.PlaneGeometry(20, 20);
      const floorMat = new THREE.MeshStandardMaterial({ 
        color: theme.floor,
        roughness: 0.8
      });
      const floor = new THREE.Mesh(floorGeom, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      // Walls
      const wallMat = new THREE.MeshStandardMaterial({ 
        color: theme.wall,
        roughness: 0.9
      });

      // Back wall
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMat);
      backWall.position.set(0, 5, -10);
      scene.add(backWall);

      // Left wall
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMat);
      leftWall.position.set(-10, 5, 0);
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), wallMat);
      rightWall.position.set(10, 5, 0);
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);

      // Add some furniture shapes
      // Bed
      const bedBase = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      bedBase.position.set(-6, 0.5, -6);
      bedBase.castShadow = true;
      scene.add(bedBase);

      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.5, 5.8),
        new THREE.MeshStandardMaterial({ color: theme.accent })
      );
      mattress.position.set(-6, 1.25, -6);
      scene.add(mattress);

      // Nightstand
      const nightstand = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      nightstand.position.set(-3, 0.75, -8);
      nightstand.castShadow = true;
      scene.add(nightstand);

      // Desk
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.2, 2),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      deskTop.position.set(6, 2.5, -8);
      deskTop.castShadow = true;
      scene.add(deskTop);

      // Rug
      const rug = new THREE.Mesh(
        new THREE.CircleGeometry(3, 32),
        new THREE.MeshStandardMaterial({ color: theme.accent, transparent: true, opacity: 0.5 })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(0, 0.01, 0);
      scene.add(rug);
    }

    function createPlayer() {
      // Simple player character
      const bodyGeom = new THREE.CapsuleGeometry(0.4, 1, 8, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: theme.accent });
      playerBody = new THREE.Mesh(bodyGeom, bodyMat);
      playerBody.position.set(0, 1, 5);
      playerBody.castShadow = true;
      scene.add(playerBody);

      // Head
      const headGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.y = 1.1;
      playerBody.add(head);

      player = playerBody;
    }

    function createInteractables() {
      // Photo frame on wall
      createPhotoFrame(-8, 4, -9.9, 'photo', '📸 A Special Memory', CONFIG.photoUrl);

      // Floating memory orbs
      createMemoryOrb(5, 3, -5, 'orb1', '✨ Memory', CONFIG.message1 || 'Every moment with you is magical...');
      createMemoryOrb(-3, 2.5, 2, 'orb2', '✨ Memory', CONFIG.message2 || 'You make my heart smile...');

      // Gift box on nightstand
      createGiftBox(-3, 2, -8, 'gift', '🎁 A Gift For You', CONFIG.finalLetter || 'I love you more than all the stars in the sky. You are my everything, my forever, my home. Thank you for being you. 💖');
    }

    function createPhotoFrame(x, y, z, id, title, photoUrl) {
      const group = new THREE.Group();
      
      // Frame
      const frameGeom = new THREE.BoxGeometry(3, 2.5, 0.2);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const frame = new THREE.Mesh(frameGeom, frameMat);
      group.add(frame);

      // Inner (photo area)
      const innerGeom = new THREE.PlaneGeometry(2.6, 2.1);
      const innerMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      inner.position.z = 0.11;
      group.add(inner);

      // Glow
      const glowGeom = new THREE.PlaneGeometry(3.5, 3);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: theme.accent, 
        transparent: true, 
        opacity: 0.3 
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      glow.position.z = -0.1;
      group.add(glow);

      group.position.set(x, y, z);
      scene.add(group);

      interactables.push({
        object: group,
        id: id,
        title: title,
        content: photoUrl ? \`<img src="\${photoUrl}" alt="Memory">\` : '<p style="font-size:60px">📸</p>',
        type: 'photo',
        collected: false
      });
    }

    function createMemoryOrb(x, y, z, id, title, message) {
      const group = new THREE.Group();

      // Orb
      const orbGeom = new THREE.SphereGeometry(0.5, 32, 32);
      const orbMat = new THREE.MeshStandardMaterial({ 
        color: theme.accent,
        emissive: theme.accent,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const orb = new THREE.Mesh(orbGeom, orbMat);
      group.add(orb);

      // Outer glow
      const glowGeom = new THREE.SphereGeometry(0.7, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: theme.accent, 
        transparent: true, 
        opacity: 0.2 
      });
      const glow = new THREE.Mesh(glowGeom, glowMat);
      group.add(glow);

      // Point light
      const light = new THREE.PointLight(theme.accent, 0.5, 5);
      group.add(light);

      group.position.set(x, y, z);
      group.userData.baseY = y;
      scene.add(group);

      interactables.push({
        object: group,
        id: id,
        title: title,
        content: \`<p>\${message}</p>\`,
        type: 'orb',
        collected: false,
        animate: true
      });
    }

    function createGiftBox(x, y, z, id, title, message) {
      const group = new THREE.Group();

      // Box
      const boxGeom = new THREE.BoxGeometry(0.8, 0.6, 0.8);
      const boxMat = new THREE.MeshStandardMaterial({ color: theme.accent });
      const box = new THREE.Mesh(boxGeom, boxMat);
      group.add(box);

      // Ribbon
      const ribbonGeom = new THREE.BoxGeometry(0.1, 0.65, 0.85);
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const ribbon1 = new THREE.Mesh(ribbonGeom, ribbonMat);
      group.add(ribbon1);

      const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.1), ribbonMat);
      group.add(ribbon2);

      // Bow
      const bowGeom = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
      const bow1 = new THREE.Mesh(bowGeom, ribbonMat);
      bow1.position.set(-0.15, 0.35, 0);
      bow1.rotation.y = Math.PI / 2;
      group.add(bow1);

      const bow2 = new THREE.Mesh(bowGeom, ribbonMat);
      bow2.position.set(0.15, 0.35, 0);
      bow2.rotation.y = Math.PI / 2;
      group.add(bow2);

      group.position.set(x, y, z);
      scene.add(group);

      interactables.push({
        object: group,
        id: id,
        title: title,
        content: \`<p>\${message}</p>\`,
        type: 'gift',
        collected: false
      });
    }

    function setupControls() {
      // Keyboard
      document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        if (e.key.toLowerCase() === 'w') keys.w = true;
        if (e.key.toLowerCase() === 'a') keys.a = true;
        if (e.key.toLowerCase() === 's') keys.s = true;
        if (e.key.toLowerCase() === 'd') keys.d = true;
        if (e.key.toLowerCase() === 'e') tryInteract();
      });

      document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() === 'w') keys.w = false;
        if (e.key.toLowerCase() === 'a') keys.a = false;
        if (e.key.toLowerCase() === 's') keys.s = false;
        if (e.key.toLowerCase() === 'd') keys.d = false;
      });

      // Mouse
      document.addEventListener('mousemove', (e) => {
        if (!gameStarted) return;
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        playerRotation = -mouseX * Math.PI;
      });

      // Mobile joystick
      const joystick = document.getElementById('joystick');
      const thumb = document.getElementById('joystick-thumb');
      let joystickActive = false;

      joystick?.addEventListener('touchstart', (e) => {
        joystickActive = true;
      });

      joystick?.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        const touch = e.touches[0];
        const rect = joystick.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        
        const maxDist = rect.width / 2 - 25;
        const dist = Math.min(Math.sqrt(x*x + y*y), maxDist);
        const angle = Math.atan2(y, x);
        
        thumb.style.transform = \`translate(calc(-50% + \${Math.cos(angle) * dist}px), calc(-50% + \${Math.sin(angle) * dist}px))\`;
        
        keys.w = y < -20;
        keys.s = y > 20;
        keys.a = x < -20;
        keys.d = x > 20;
      });

      joystick?.addEventListener('touchend', () => {
        joystickActive = false;
        thumb.style.transform = 'translate(-50%, -50%)';
        keys.w = keys.a = keys.s = keys.d = false;
      });

      // Resize
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    function tryInteract() {
      if (currentInteractable && !currentInteractable.collected) {
        currentInteractable.collected = true;
        memoriesFound++;
        document.getElementById('memory-count').textContent = memoriesFound;
        
        showPopup(currentInteractable.title, currentInteractable.content);
        
        // Hide the orb if it's an orb
        if (currentInteractable.type === 'orb') {
          currentInteractable.object.visible = false;
        }
      }
    }

    function showPopup(title, content) {
      document.getElementById('popup-title').textContent = title;
      document.getElementById('popup-body').innerHTML = content;
      document.getElementById('popup-overlay').classList.add('visible');
    }

    function closePopup() {
      document.getElementById('popup-overlay').classList.remove('visible');
    }

    function startExperience() {
      document.getElementById('start-screen').classList.remove('visible');
      document.getElementById('hud').classList.add('visible');
      document.getElementById('controls').classList.add('visible');
      gameStarted = true;
      
      // Lock pointer on desktop
      if (window.innerWidth > 768) {
        renderer.domElement.requestPointerLock?.();
      }
    }

    function updatePlayer() {
      if (!gameStarted) return;

      const speed = 0.1;
      const direction = new THREE.Vector3();

      if (keys.w) direction.z -= 1;
      if (keys.s) direction.z += 1;
      if (keys.a) direction.x -= 1;
      if (keys.d) direction.x += 1;

      direction.normalize().multiplyScalar(speed);
      
      // Apply rotation
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation);

      // Move player
      player.position.add(direction);

      // Clamp to room
      player.position.x = Math.max(-9, Math.min(9, player.position.x));
      player.position.z = Math.max(-9, Math.min(9, player.position.z));

      // Rotate player
      player.rotation.y = playerRotation;

      // Update camera to follow
      const cameraOffset = new THREE.Vector3(0, 5, 8);
      cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation);
      camera.position.lerp(player.position.clone().add(cameraOffset), 0.1);
      camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
    }

    function checkInteractables() {
      currentInteractable = null;
      let closestDist = 3;

      interactables.forEach(item => {
        if (item.collected) return;
        
        const dist = player.position.distanceTo(item.object.position);
        if (dist < closestDist) {
          closestDist = dist;
          currentInteractable = item;
        }
      });

      const prompt = document.getElementById('interact-prompt');
      if (currentInteractable) {
        prompt.classList.add('visible');
      } else {
        prompt.classList.remove('visible');
      }
    }

    function animateObjects(time) {
      interactables.forEach(item => {
        if (item.animate && !item.collected) {
          // Float up and down
          item.object.position.y = item.object.userData.baseY + Math.sin(time * 0.002) * 0.3;
          // Rotate
          item.object.rotation.y += 0.01;
        }
      });
    }

    function animate(time) {
      requestAnimationFrame(animate);
      
      updatePlayer();
      checkInteractables();
      animateObjects(time);
      
      renderer.render(scene, camera);
    }

    // Start
    init();
  </script>
</body>
</html>`,
  cssTemplate: '',
  jsTemplate: '',
  isActive: true,
};

async function seed3DTemplate() {
  console.log('🎮 Adding 3D Memory Room template...');
  
  const result = await db.insert(templates).values(template3D).returning();
  
  console.log('✅ Created template:', result[0].name);
  console.log('   ID:', result[0].id);
  
  process.exit(0);
}

seed3DTemplate().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
