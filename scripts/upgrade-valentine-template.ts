import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedValentineTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Valentine for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }

    /* WebGL Canvas Background */
    #fluid-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* Content Container */
    .container {
      position: relative;
      z-index: 10;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    /* Glass Card */
    .card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: translateY(0);
      transition: transform 0.3s ease;
    }

    /* Heart Icon */
    .heart-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 0 20px rgba(255, 100, 150, 0.8));
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.05); }
    }

    /* Typography */
    h1 {
      color: #fff;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }

    .message {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 1.5rem 0 2rem;
    }

    /* Buttons Container */
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    /* Magnetic Yes Button */
    .yes-btn {
      position: relative;
      background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
      color: #fff;
      border: none;
      padding: 1.2rem 3rem;
      font-size: 1.2rem;
      font-weight: 700;
      border-radius: 50px;
      cursor: pointer;
      transition: transform 0.1s ease, box-shadow 0.3s ease;
      box-shadow: 0 10px 40px rgba(255, 107, 157, 0.5),
                  0 0 60px rgba(255, 107, 157, 0.3);
      z-index: 20;
    }

    .yes-btn::before {
      content: '';
      position: absolute;
      inset: -4px;
      background: linear-gradient(135deg, #ff6b9d, #ff8fab, #c44569);
      border-radius: 54px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .yes-btn:hover::before,
    .yes-btn.magnetic-active::before {
      opacity: 1;
      animation: glow-pulse 1.5s ease-in-out infinite;
    }

    @keyframes glow-pulse {
      0%, 100% { filter: blur(8px); opacity: 0.6; }
      50% { filter: blur(15px); opacity: 1; }
    }

    .yes-btn:active {
      transform: scale(0.95);
    }

    /* Magnetic Pull Indicator */
    .magnetic-field {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .magnetic-field.active {
      opacity: 1;
      animation: pulse-field 2s ease-in-out infinite;
    }

    @keyframes pulse-field {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    /* No Button - Subtle */
    .no-btn {
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.8rem 2rem;
      font-size: 0.9rem;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .no-btn:hover {
      color: rgba(255, 255, 255, 0.7);
      border-color: rgba(255, 255, 255, 0.4);
    }

    /* Result Message */
    .result {
      display: none;
      color: #fff;
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 1rem;
      text-shadow: 0 0 30px rgba(255, 107, 157, 0.8);
    }

    .result.visible {
      display: block;
      animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes pop-in {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Heartbeat Shockwave Overlay */
    .shockwave-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      pointer-events: none;
      opacity: 0;
    }

    .shockwave-overlay.active {
      animation: shockwave 2s ease-out forwards;
    }

    @keyframes shockwave {
      0% {
        opacity: 1;
        background: radial-gradient(circle at center, rgba(255,107,157,0.8) 0%, transparent 0%);
      }
      10% {
        background: radial-gradient(circle at center, rgba(255,107,157,0.6) 0%, rgba(255,107,157,0.3) 30%, transparent 50%);
      }
      30% {
        background: radial-gradient(circle at center, transparent 0%, rgba(255,107,157,0.2) 40%, transparent 70%);
      }
      50% {
        opacity: 0.8;
        background: radial-gradient(circle at center, rgba(255,107,157,0.5) 0%, transparent 30%);
      }
      60% {
        background: radial-gradient(circle at center, transparent 0%, rgba(255,107,157,0.15) 50%, transparent 80%);
      }
      80% {
        background: radial-gradient(circle at center, rgba(255,107,157,0.3) 0%, transparent 20%);
      }
      100% {
        opacity: 0;
        background: transparent;
      }
    }

    /* Screen shake during heartbeat */
    .shake {
      animation: heartbeat-shake 2s ease-out;
    }

    @keyframes heartbeat-shake {
      0%, 100% { transform: translate(0, 0) scale(1); }
      5% { transform: translate(0, 0) scale(1.02); }
      10% { transform: translate(-2px, -2px) scale(1); }
      15% { transform: translate(2px, 2px) scale(1.015); }
      25% { transform: translate(0, 0) scale(1); }
      35% { transform: translate(-1px, 1px) scale(1.01); }
      45% { transform: translate(1px, -1px) scale(1); }
      55% { transform: translate(0, 0) scale(1.005); }
      70% { transform: translate(0, 0) scale(1); }
    }

    /* Confetti Hearts */
    .confetti-heart {
      position: fixed;
      font-size: 2rem;
      pointer-events: none;
      z-index: 50;
      animation: confetti-fall 4s linear forwards;
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(-100px) rotate(0deg) scale(0);
        opacity: 1;
      }
      10% {
        transform: translateY(0) rotate(30deg) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0.5);
        opacity: 0;
      }
    }

    /* Hidden state */
    .hidden {
      display: none !important;
    }

    /* Mobile adjustments */
    @media (max-width: 480px) {
      .card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .message {
        font-size: 1rem;
      }

      .yes-btn {
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
      }

      .heart-icon {
        font-size: 3rem;
      }
    }

    /* Cursor (desktop only) */
    @media (pointer: fine) {
      .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(255, 107, 157, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background 0.2s;
        mix-blend-mode: screen;
      }

      .custom-cursor.attracted {
        width: 30px;
        height: 30px;
        background: rgba(255, 107, 157, 1);
        box-shadow: 0 0 30px rgba(255, 107, 157, 0.8);
      }

      body {
        cursor: none;
      }

      .yes-btn, .no-btn {
        cursor: none;
      }
    }
  </style>
</head>
<body>
  <!-- WebGL Fluid Background -->
  <canvas id="fluid-canvas"></canvas>

  <!-- Custom Cursor (desktop) -->
  <div class="custom-cursor" id="cursor"></div>

  <!-- Shockwave Overlay -->
  <div class="shockwave-overlay" id="shockwave"></div>

  <!-- Main Content -->
  <div class="container" id="main-container">
    <div class="card">
      <div class="heart-icon">💖</div>
      <h1>Hey {{recipientName}}!</h1>
      <p class="message">{{customMessage}}</p>

      <div class="buttons" id="buttons">
        <div class="magnetic-field" id="magnetic-field"></div>
        <button class="yes-btn" id="yes-btn">Yes! 😍</button>
        <button class="no-btn" id="no-btn">Maybe later...</button>
      </div>

      <div class="result" id="result">🎉 I knew it! 💕</div>
    </div>
  </div>

  <script>
    // ============================================
    // WebGL Fluid Simulation (Simplified for mobile)
    // ============================================
    const fluidCanvas = document.getElementById('fluid-canvas');
    const gl = fluidCanvas.getContext('webgl') || fluidCanvas.getContext('experimental-webgl');

    let fluidProgram, positionBuffer;
    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;
    let time = 0;
    let intensity = 1.0;

    function initFluid() {
      if (!gl) {
        // Fallback for no WebGL
        fluidCanvas.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 50%, #1a1a2e 100%)';
        return;
      }

      resizeCanvas();

      // Vertex shader
      const vsSource = \`
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      \`;

      // Fragment shader - Fluid smoke effect
      const fsSource = \`
        precision mediump float;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform float u_intensity;

        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution;
          vec2 mouse = u_mouse;

          // Create flowing smoke effect
          float t = u_time * 0.3;

          // Multiple noise layers for depth
          float n1 = snoise(uv * 3.0 + vec2(t * 0.5, t * 0.3)) * 0.5;
          float n2 = snoise(uv * 5.0 - vec2(t * 0.4, t * 0.2)) * 0.3;
          float n3 = snoise(uv * 8.0 + vec2(t * 0.2, -t * 0.4)) * 0.2;

          float noise = n1 + n2 + n3;

          // Mouse influence - creates swirling effect
          float dist = distance(uv, mouse);
          float mouseInfluence = smoothstep(0.5, 0.0, dist) * u_intensity;

          // Swirl around mouse
          vec2 toMouse = uv - mouse;
          float angle = atan(toMouse.y, toMouse.x);
          float swirl = sin(angle * 3.0 + t * 2.0 - dist * 10.0) * mouseInfluence * 0.3;

          noise += swirl;

          // Base colors - deep romantic purples and pinks
          vec3 color1 = vec3(0.1, 0.08, 0.15);  // Deep purple-black
          vec3 color2 = vec3(0.25, 0.1, 0.2);   // Dark magenta
          vec3 color3 = vec3(0.6, 0.2, 0.4);    // Pink accent
          vec3 color4 = vec3(0.9, 0.4, 0.5);    // Bright pink highlight

          // Mix colors based on noise
          float t1 = smoothstep(-0.5, 0.5, noise);
          float t2 = smoothstep(0.0, 0.8, noise + mouseInfluence);

          vec3 col = mix(color1, color2, t1);
          col = mix(col, color3, t2 * 0.6);
          col = mix(col, color4, mouseInfluence * 0.4);

          // Add subtle vignette
          float vignette = 1.0 - smoothstep(0.3, 1.0, length(uv - 0.5) * 1.2);
          col *= vignette * 0.8 + 0.2;

          // Slight color boost near mouse
          col += vec3(0.1, 0.02, 0.05) * mouseInfluence;

          gl_FragColor = vec4(col, 1.0);
        }
      \`;

      // Compile shaders
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, vsSource);
      gl.compileShader(vs);

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, fsSource);
      gl.compileShader(fs);

      // Create program
      fluidProgram = gl.createProgram();
      gl.attachShader(fluidProgram, vs);
      gl.attachShader(fluidProgram, fs);
      gl.linkProgram(fluidProgram);
      gl.useProgram(fluidProgram);

      // Create buffer
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]), gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(fluidProgram, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    function resizeCanvas() {
      fluidCanvas.width = window.innerWidth;
      fluidCanvas.height = window.innerHeight;
      if (gl) {
        gl.viewport(0, 0, fluidCanvas.width, fluidCanvas.height);
      }
    }

    function renderFluid() {
      if (!gl || !fluidProgram) return;

      // Smooth mouse movement
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      time += 0.016;

      gl.useProgram(fluidProgram);

      const resolutionLocation = gl.getUniformLocation(fluidProgram, 'u_resolution');
      const mouseLocation = gl.getUniformLocation(fluidProgram, 'u_mouse');
      const timeLocation = gl.getUniformLocation(fluidProgram, 'u_time');
      const intensityLocation = gl.getUniformLocation(fluidProgram, 'u_intensity');

      gl.uniform2f(resolutionLocation, fluidCanvas.width, fluidCanvas.height);
      gl.uniform2f(mouseLocation, mouseX, 1.0 - mouseY);
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(intensityLocation, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // ============================================
    // Magnetic Button Physics
    // ============================================
    const yesBtn = document.getElementById('yes-btn');
    const magneticField = document.getElementById('magnetic-field');
    const cursor = document.getElementById('cursor');

    let btnRect = yesBtn.getBoundingClientRect();
    let btnCenterX = btnRect.left + btnRect.width / 2;
    let btnCenterY = btnRect.top + btnRect.height / 2;

    const MAGNETIC_RADIUS = 150;
    const MAGNETIC_STRENGTH = 0.15;

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let actualCursorX = cursorX;
    let actualCursorY = cursorY;
    let isInMagneticField = false;

    function updateButtonPosition() {
      btnRect = yesBtn.getBoundingClientRect();
      btnCenterX = btnRect.left + btnRect.width / 2;
      btnCenterY = btnRect.top + btnRect.height / 2;
    }

    function applyMagneticForce(x, y) {
      updateButtonPosition();

      const dx = btnCenterX - x;
      const dy = btnCenterY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < MAGNETIC_RADIUS && distance > 0) {
        isInMagneticField = true;

        // Calculate pull strength (stronger when closer)
        const strength = (1 - distance / MAGNETIC_RADIUS) * MAGNETIC_STRENGTH;

        // Apply force toward button
        cursorX = x + dx * strength * 3;
        cursorY = y + dy * strength * 3;

        // Button reacts - slight pull toward cursor
        const btnPull = strength * 8;
        yesBtn.style.transform = \`translate(\${-dx * btnPull / distance}px, \${-dy * btnPull / distance}px) scale(\${1 + strength * 0.1})\`;
        yesBtn.classList.add('magnetic-active');

        // Show magnetic field
        magneticField.style.left = btnCenterX + 'px';
        magneticField.style.top = btnCenterY + 'px';
        magneticField.classList.add('active');

        cursor.classList.add('attracted');
      } else {
        isInMagneticField = false;
        cursorX = x;
        cursorY = y;
        yesBtn.style.transform = '';
        yesBtn.classList.remove('magnetic-active');
        magneticField.classList.remove('active');
        cursor.classList.remove('attracted');
      }

      // Update cursor position
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';

      // Update fluid mouse position
      targetMouseX = cursorX / window.innerWidth;
      targetMouseY = cursorY / window.innerHeight;
    }

    // Mouse events (desktop)
    document.addEventListener('mousemove', (e) => {
      actualCursorX = e.clientX;
      actualCursorY = e.clientY;
      applyMagneticForce(e.clientX, e.clientY);
    });

    // Touch events (mobile)
    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      targetMouseX = touch.clientX / window.innerWidth;
      targetMouseY = touch.clientY / window.innerHeight;
      applyMagneticForce(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      targetMouseX = touch.clientX / window.innerWidth;
      targetMouseY = touch.clientY / window.innerHeight;
    }, { passive: true });

    // ============================================
    // Heartbeat Shockwave Effect
    // ============================================
    const shockwave = document.getElementById('shockwave');
    const container = document.getElementById('main-container');
    const buttons = document.getElementById('buttons');
    const result = document.getElementById('result');

    // Create AudioContext for heartbeat sound
    let audioCtx = null;

    function playHeartbeat() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

        // Create heartbeat sound (two thuds)
        const playThud = (time, volume) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.frequency.setValueAtTime(80, time);
          osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

          gain.gain.setValueAtTime(volume, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

          osc.start(time);
          osc.stop(time + 0.15);
        };

        const now = audioCtx.currentTime;

        // First beat pattern (lub-dub, pause, lub-dub)
        playThud(now, 0.5);
        playThud(now + 0.15, 0.3);
        playThud(now + 0.6, 0.4);
        playThud(now + 0.75, 0.25);
        playThud(now + 1.2, 0.3);
        playThud(now + 1.35, 0.2);
      } catch (e) {
        // Audio not supported, continue without sound
      }
    }

    function triggerShockwave() {
      // Play heartbeat sound
      playHeartbeat();

      // Trigger shockwave animation
      shockwave.classList.add('active');

      // Screen shake
      container.classList.add('shake');

      // Boost fluid intensity temporarily
      intensity = 3.0;
      setTimeout(() => { intensity = 2.0; }, 200);
      setTimeout(() => { intensity = 1.5; }, 600);
      setTimeout(() => { intensity = 1.0; }, 1200);

      // After shockwave, show result
      setTimeout(() => {
        buttons.classList.add('hidden');
        result.classList.add('visible');

        // Spawn confetti hearts
        spawnConfetti();
      }, 800);

      // Cleanup
      setTimeout(() => {
        shockwave.classList.remove('active');
        container.classList.remove('shake');
      }, 2000);
    }

    function spawnConfetti() {
      const hearts = ['💖', '💕', '💗', '💓', '💝', '✨', '💫'];

      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'confetti-heart';
          heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
          heart.style.left = Math.random() * 100 + 'vw';
          heart.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
          heart.style.animationDuration = (3 + Math.random() * 2) + 's';
          document.body.appendChild(heart);

          setTimeout(() => heart.remove(), 5000);
        }, i * 50);
      }
    }

    // ============================================
    // Button Handlers
    // ============================================
    yesBtn.addEventListener('click', triggerShockwave);
    yesBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      triggerShockwave();
    });

    document.getElementById('no-btn').addEventListener('click', () => {
      // Gentle persuasion - button fades and comes back
      const noBtn = document.getElementById('no-btn');
      noBtn.style.opacity = '0.3';
      noBtn.textContent = 'Are you sure? 🥺';

      setTimeout(() => {
        noBtn.style.opacity = '0.5';
        noBtn.textContent = 'Just click Yes! 💕';
      }, 2000);
    });

    // ============================================
    // Animation Loop
    // ============================================
    function animate() {
      renderFluid();
      requestAnimationFrame(animate);
    }

    // ============================================
    // Initialize
    // ============================================
    window.addEventListener('resize', () => {
      resizeCanvas();
      updateButtonPosition();
    });

    initFluid();
    animate();
    updateButtonPosition();

    // Hide custom cursor on touch devices
    if ('ontouchstart' in window) {
      cursor.style.display = 'none';
    }
  </script>
</body>
</html>`;

async function upgradeValentineTemplate() {
  console.log('💖 Upgrading Simple Valentine to "The Magnetic Heart"...\n');

  // Update the existing template
  const result = await db
    .update(templates)
    .set({
      name: 'The Magnetic Heart',
      description: 'An irresistible Valentine experience with WebGL fluid background, magnetic physics pulling you toward "Yes", and a heartbeat shockwave climax. Mobile-first design.',
      htmlTemplate: upgradedValentineTemplate,
      cssTemplate: '',
      jsTemplate: '',
      updatedAt: new Date(),
    })
    .where(eq(templates.name, 'Simple Valentine'))
    .returning();

  if (result.length > 0) {
    console.log('✅ Upgraded template:', result[0].name);
    console.log('   ID:', result[0].id);
  } else {
    // If "Simple Valentine" doesn't exist, create new
    const newResult = await db.insert(templates).values({
      name: 'The Magnetic Heart',
      description: 'An irresistible Valentine experience with WebGL fluid background, magnetic physics pulling you toward "Yes", and a heartbeat shockwave climax. Mobile-first design.',
      occasion: ['valentines', 'anniversary', 'just-because'],
      thumbnailUrl: '',
      basePrice: '3.99',
      htmlTemplate: upgradedValentineTemplate,
      cssTemplate: '',
      jsTemplate: '',
      isActive: true,
    }).returning();

    console.log('✅ Created new template:', newResult[0].name);
    console.log('   ID:', newResult[0].id);
  }

  process.exit(0);
}

upgradeValentineTemplate().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
