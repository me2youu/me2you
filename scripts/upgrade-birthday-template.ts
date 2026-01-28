import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedBirthdayTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Happy Birthday {{recipientName}}!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
    }

    /* Physics Canvas */
    #physics-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    /* Content Overlay */
    .content {
      position: relative;
      z-index: 10;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 2rem 1rem;
      pointer-events: none;
    }

    /* Glass Card */
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      pointer-events: auto;
      margin-bottom: 1rem;
    }

    h1 {
      color: #fff;
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }

    h1 .emoji {
      display: inline-block;
      animation: wiggle 0.5s ease-in-out infinite;
    }

    @keyframes wiggle {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }

    .message {
      color: rgba(255, 255, 255, 0.85);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    /* Cake Container */
    .cake-container {
      position: relative;
      width: 200px;
      height: 180px;
      margin: 1rem auto;
    }

    /* Cake */
    .cake {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .cake-layer {
      border-radius: 10px;
      margin: 0 auto;
    }

    .cake-layer-1 {
      width: 160px;
      height: 50px;
      background: linear-gradient(135deg, #f5a9bc 0%, #f48fb1 100%);
      border-bottom: 4px solid #ec407a;
    }

    .cake-layer-2 {
      width: 130px;
      height: 40px;
      background: linear-gradient(135deg, #ce93d8 0%, #ba68c8 100%);
      border-bottom: 4px solid #ab47bc;
      margin-top: -5px;
    }

    .cake-layer-3 {
      width: 100px;
      height: 35px;
      background: linear-gradient(135deg, #90caf9 0%, #64b5f6 100%);
      border-bottom: 4px solid #42a5f5;
      margin-top: -5px;
    }

    .cake-plate {
      width: 180px;
      height: 15px;
      background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
      border-radius: 0 0 50% 50%;
      margin: 0 auto;
    }

    /* Candles */
    .candles {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .candle {
      position: relative;
      width: 8px;
      height: 40px;
      background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
      border-radius: 3px;
    }

    .candle::before {
      content: '';
      position: absolute;
      top: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 6px;
      background: #333;
      border-radius: 2px;
    }

    /* Flame */
    .flame {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 20px;
      background: linear-gradient(to top, #ff9800, #ffeb3b, #fff);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      animation: flicker 0.3s ease-in-out infinite alternate;
      box-shadow: 0 0 20px #ff9800, 0 0 40px #ff5722;
      transition: opacity 0.3s, transform 0.3s;
    }

    .flame.out {
      opacity: 0;
      transform: translateX(-50%) scale(0);
    }

    @keyframes flicker {
      0% { transform: translateX(-50%) scale(1) rotate(-2deg); }
      100% { transform: translateX(-50%) scale(1.1) rotate(2deg); }
    }

    /* Smoke when blown out */
    .smoke {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: rgba(150, 150, 150, 0.6);
      border-radius: 50%;
      opacity: 0;
    }

    .smoke.active {
      animation: smoke-rise 1.5s ease-out forwards;
    }

    @keyframes smoke-rise {
      0% {
        opacity: 0.8;
        transform: translateX(-50%) translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateX(-50%) translateY(-60px) scale(3);
      }
    }

    /* Blow Button / Mic Prompt */
    .blow-section {
      margin-top: 1rem;
    }

    .blow-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
      pointer-events: auto;
    }

    .blow-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
    }

    .blow-btn:active {
      transform: scale(0.98);
    }

    .mic-status {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 0.75rem;
    }

    .mic-status.listening {
      color: #4caf50;
    }

    .mic-status.error {
      color: #ff5722;
    }

    /* Mic Visualizer */
    .mic-visualizer {
      display: none;
      width: 100%;
      max-width: 200px;
      height: 40px;
      margin: 1rem auto 0;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      position: relative;
    }

    .mic-visualizer.active {
      display: block;
    }

    .mic-bar {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 0%;
      background: linear-gradient(to top, #4caf50, #8bc34a);
      border-radius: 10px 10px 0 0;
      transition: height 0.05s;
    }

    .blow-threshold {
      position: absolute;
      top: 30%;
      left: 10%;
      right: 10%;
      height: 2px;
      background: rgba(255, 255, 255, 0.5);
    }

    .blow-threshold::after {
      content: 'Blow here!';
      position: absolute;
      right: 0;
      top: -8px;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.6);
    }

    /* Result */
    .result {
      display: none;
      color: #fff;
      font-size: 1.3rem;
      font-weight: 700;
      margin-top: 1rem;
      text-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
    }

    .result.visible {
      display: block;
      animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes pop-in {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Hint for balloons */
    .balloon-hint {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      z-index: 5;
      text-align: center;
      pointer-events: none;
      animation: fade-hint 3s ease-out forwards;
    }

    @keyframes fade-hint {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; }
    }

    /* Confetti */
    .confetti {
      position: fixed;
      font-size: 2rem;
      pointer-events: none;
      z-index: 100;
      animation: confetti-fall 4s linear forwards;
    }

    @keyframes confetti-fall {
      0% {
        transform: translateY(-100px) rotate(0deg) scale(0);
        opacity: 1;
      }
      10% {
        transform: translateY(0) rotate(30deg) scale(1);
      }
      100% {
        transform: translateY(100vh) rotate(720deg) scale(0.5);
        opacity: 0;
      }
    }

    .hidden {
      display: none !important;
    }

    /* Mobile */
    @media (max-width: 480px) {
      .card {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.4rem;
      }

      .cake-container {
        transform: scale(0.85);
        margin: 0.5rem auto;
      }
    }
  </style>
</head>
<body>
  <!-- Physics Canvas for Balloons -->
  <canvas id="physics-canvas"></canvas>

  <!-- Content -->
  <div class="content">
    <div class="card">
      <h1>Happy Birthday <span class="emoji">🎂</span><br>{{recipientName}}!</h1>
      <p class="message">{{customMessage}}</p>

      <!-- Cake with Candles -->
      <div class="cake-container">
        <div class="candles" id="candles">
          <div class="candle"><div class="flame" id="flame-0"></div><div class="smoke" id="smoke-0"></div></div>
          <div class="candle"><div class="flame" id="flame-1"></div><div class="smoke" id="smoke-1"></div></div>
          <div class="candle"><div class="flame" id="flame-2"></div><div class="smoke" id="smoke-2"></div></div>
          <div class="candle"><div class="flame" id="flame-3"></div><div class="smoke" id="smoke-3"></div></div>
          <div class="candle"><div class="flame" id="flame-4"></div><div class="smoke" id="smoke-4"></div></div>
        </div>
        <div class="cake">
          <div class="cake-layer cake-layer-3"></div>
          <div class="cake-layer cake-layer-2"></div>
          <div class="cake-layer cake-layer-1"></div>
          <div class="cake-plate"></div>
        </div>
      </div>

      <!-- Blow Section -->
      <div class="blow-section" id="blow-section">
        <button class="blow-btn" id="blow-btn">🎤 Blow Out Candles!</button>
        <p class="mic-status" id="mic-status">Tap to enable microphone</p>
        <div class="mic-visualizer" id="mic-visualizer">
          <div class="mic-bar" id="mic-bar"></div>
          <div class="blow-threshold"></div>
        </div>
      </div>

      <div class="result" id="result">🎉 Make a wish! 🌟</div>
    </div>
  </div>

  <!-- Balloon Hint -->
  <div class="balloon-hint">🎈 Drag and throw the balloons!</div>

  <!-- Matter.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

  <script>
    // ============================================
    // Matter.js Physics Setup
    // ============================================
    const canvas = document.getElementById('physics-canvas');
    const ctx = canvas.getContext('2d');

    // Resize canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matter.js modules
    const { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Events, Composite } = Matter;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.5; // Lighter gravity for floaty balloons

    // Balloon colors
    const balloonColors = [
      '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3',
      '#54a0ff', '#5f27cd', '#00d2d3', '#ff6b9d', '#c44569'
    ];

    // Create balloons
    const balloons = [];
    const balloonCount = 15;

    function createBalloon(x, y) {
      const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
      const radius = 30 + Math.random() * 20;

      const balloon = Bodies.circle(x, y, radius, {
        restitution: 0.6, // Bouncy
        friction: 0.1,
        frictionAir: 0.02,
        density: 0.0005, // Light
        render: { fillStyle: color },
        label: 'balloon',
        balloonColor: color,
        balloonRadius: radius,
        stringLength: 40 + Math.random() * 30
      });

      return balloon;
    }

    // Spawn balloons at bottom, piled up
    for (let i = 0; i < balloonCount; i++) {
      const x = Math.random() * (canvas.width - 100) + 50;
      const y = canvas.height - 100 - Math.random() * 200;
      const balloon = createBalloon(x, y);
      balloons.push(balloon);
      World.add(engine.world, balloon);
    }

    // Create walls (invisible)
    const wallThickness = 50;
    const walls = [
      // Floor
      Bodies.rectangle(canvas.width / 2, canvas.height + wallThickness / 2, canvas.width * 2, wallThickness, { isStatic: true, label: 'floor' }),
      // Left wall
      Bodies.rectangle(-wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
      // Right wall
      Bodies.rectangle(canvas.width + wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
      // Ceiling
      Bodies.rectangle(canvas.width / 2, -wallThickness / 2, canvas.width * 2, wallThickness, { isStatic: true })
    ];
    World.add(engine.world, walls);

    // Mouse constraint for dragging
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    World.add(engine.world, mouseConstraint);

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.position.x = touch.clientX - rect.left;
      mouse.position.y = touch.clientY - rect.top;
      mouse.button = 0;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.position.x = touch.clientX - rect.left;
      mouse.position.y = touch.clientY - rect.top;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      mouse.button = -1;
    });

    // Apply slight upward force to balloons (helium effect)
    Events.on(engine, 'beforeUpdate', () => {
      balloons.forEach(balloon => {
        if (balloon.position.y > 100) {
          Body.applyForce(balloon, balloon.position, { x: 0, y: -0.0002 });
        }
      });
    });

    // Render loop
    function renderBalloons() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      balloons.forEach(balloon => {
        const { x, y } = balloon.position;
        const radius = balloon.balloonRadius;
        const color = balloon.balloonColor;
        const stringLength = balloon.stringLength;

        // Draw string
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.quadraticCurveTo(
          x + Math.sin(Date.now() / 500 + x) * 5,
          y + radius + stringLength / 2,
          x,
          y + radius + stringLength
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw balloon body
        ctx.beginPath();
        ctx.ellipse(x, y, radius * 0.85, radius, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Balloon shine
        ctx.beginPath();
        ctx.ellipse(x - radius * 0.3, y - radius * 0.3, radius * 0.25, radius * 0.35, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // Balloon knot
        ctx.beginPath();
        ctx.moveTo(x - 6, y + radius - 2);
        ctx.lineTo(x, y + radius + 8);
        ctx.lineTo(x + 6, y + radius - 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      requestAnimationFrame(renderBalloons);
    }

    // Start physics engine
    Engine.run(engine);
    renderBalloons();

    // Update walls on resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      // Remove old walls and add new ones
      Composite.remove(engine.world, walls);
      walls.length = 0;
      walls.push(
        Bodies.rectangle(canvas.width / 2, canvas.height + wallThickness / 2, canvas.width * 2, wallThickness, { isStatic: true, label: 'floor' }),
        Bodies.rectangle(-wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
        Bodies.rectangle(canvas.width + wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
        Bodies.rectangle(canvas.width / 2, -wallThickness / 2, canvas.width * 2, wallThickness, { isStatic: true })
      );
      World.add(engine.world, walls);
    });

    // ============================================
    // Microphone Candle Blowing
    // ============================================
    const blowBtn = document.getElementById('blow-btn');
    const micStatus = document.getElementById('mic-status');
    const micVisualizer = document.getElementById('mic-visualizer');
    const micBar = document.getElementById('mic-bar');
    const blowSection = document.getElementById('blow-section');
    const result = document.getElementById('result');

    let audioContext = null;
    let analyser = null;
    let microphone = null;
    let isListening = false;
    let candlesLit = 5;
    let blowStrength = 0;
    const BLOW_THRESHOLD = 0.4; // Sensitivity (0-1)

    async function startMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isListening = true;
        micStatus.textContent = '🎤 Blow into the mic!';
        micStatus.classList.add('listening');
        micVisualizer.classList.add('active');
        blowBtn.textContent = '🌬️ Listening...';
        blowBtn.disabled = true;

        detectBlow();
      } catch (err) {
        console.error('Microphone error:', err);
        micStatus.textContent = '❌ Mic access denied. Tap candles to blow!';
        micStatus.classList.add('error');
        enableTapToBlow();
      }
    }

    function detectBlow() {
      if (!isListening || candlesLit <= 0) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;

      // Update visualizer
      micBar.style.height = (average * 100) + '%';

      // Smooth blow strength
      blowStrength = blowStrength * 0.8 + average * 0.2;

      // Check if blowing
      if (blowStrength > BLOW_THRESHOLD) {
        // Blow out a candle
        blowOutCandle();
      }

      requestAnimationFrame(detectBlow);
    }

    function blowOutCandle() {
      if (candlesLit <= 0) return;

      const candleIndex = candlesLit - 1;
      const flame = document.getElementById('flame-' + candleIndex);
      const smoke = document.getElementById('smoke-' + candleIndex);

      if (flame && !flame.classList.contains('out')) {
        flame.classList.add('out');
        smoke.classList.add('active');
        candlesLit--;

        // Vibrate on mobile
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        if (candlesLit <= 0) {
          // All candles blown out!
          setTimeout(celebrateSuccess, 500);
        }
      }
    }

    function enableTapToBlow() {
      // Fallback: tap candles to blow them out
      const candles = document.querySelectorAll('.candle');
      candles.forEach((candle, i) => {
        candle.style.cursor = 'pointer';
        candle.style.pointerEvents = 'auto';
        candle.addEventListener('click', () => {
          const flame = document.getElementById('flame-' + i);
          const smoke = document.getElementById('smoke-' + i);
          if (flame && !flame.classList.contains('out')) {
            flame.classList.add('out');
            smoke.classList.add('active');
            candlesLit--;

            if (candlesLit <= 0) {
              setTimeout(celebrateSuccess, 500);
            }
          }
        });
      });

      micStatus.textContent = '👆 Tap candles to blow them out!';
    }

    function celebrateSuccess() {
      isListening = false;

      // Stop audio
      if (audioContext) {
        audioContext.close();
      }

      // Hide blow section, show result
      blowSection.classList.add('hidden');
      result.classList.add('visible');

      // Spawn confetti
      spawnConfetti();

      // Make balloons go crazy
      balloons.forEach(balloon => {
        Body.applyForce(balloon, balloon.position, {
          x: (Math.random() - 0.5) * 0.05,
          y: -0.02 - Math.random() * 0.02
        });
      });
    }

    function spawnConfetti() {
      const emojis = ['🎉', '🎊', '🎈', '🎂', '🎁', '⭐', '✨', '🥳', '🎵', '💖'];

      for (let i = 0; i < 60; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
          confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
          document.body.appendChild(confetti);

          setTimeout(() => confetti.remove(), 5000);
        }, i * 40);
      }
    }

    // Button click handler
    blowBtn.addEventListener('click', () => {
      if (!isListening) {
        startMicrophone();
      }
    });

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micStatus.textContent = '📱 Mic not supported. Tap candles instead!';
      enableTapToBlow();
      blowBtn.classList.add('hidden');
    }
  </script>
</body>
</html>`;

async function upgradeBirthdayTemplate() {
  console.log('🎂 Upgrading Birthday Bash to "Physics Party"...\n');

  // Update the existing template
  const result = await db
    .update(templates)
    .set({
      name: 'Physics Party',
      description: 'A physics-powered birthday celebration! Drag and throw real balloons with Matter.js physics, and blow into your microphone to extinguish the candles. Mobile-first with touch support.',
      htmlTemplate: upgradedBirthdayTemplate,
      cssTemplate: '',
      jsTemplate: '',
      updatedAt: new Date(),
    })
    .where(eq(templates.name, 'Birthday Bash'))
    .returning();

  if (result.length > 0) {
    console.log('✅ Upgraded template:', result[0].name);
    console.log('   ID:', result[0].id);
  } else {
    // If "Birthday Bash" doesn't exist, create new
    const newResult = await db.insert(templates).values({
      name: 'Physics Party',
      description: 'A physics-powered birthday celebration! Drag and throw real balloons with Matter.js physics, and blow into your microphone to extinguish the candles. Mobile-first with touch support.',
      occasion: ['birthday'],
      thumbnailUrl: '',
      basePrice: '3.99',
      htmlTemplate: upgradedBirthdayTemplate,
      cssTemplate: '',
      jsTemplate: '',
      isActive: true,
    }).returning();

    console.log('✅ Created new template:', newResult[0].name);
    console.log('   ID:', newResult[0].id);
  }

  process.exit(0);
}

upgradeBirthdayTemplate().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
