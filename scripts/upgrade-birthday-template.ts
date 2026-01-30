import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedBirthdayTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Happy Birthday {{recipientName}}!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%);
    }

    /* Physics Canvas */
    #physics-canvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      z-index: 0;
    }

    /* Content Overlay */
    .content {
      position: relative; z-index: 10;
      min-height: 100vh; min-height: 100dvh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-start;
      padding: 1.5rem 1rem;
      pointer-events: none;
    }

    /* Glass Card */
    .card {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 24px;
      padding: 1.8rem 1.5rem;
      max-width: 380px; width: 100%;
      text-align: center;
      pointer-events: auto;
    }

    h1 {
      color: #fff;
      font-size: clamp(1.3rem, 5vw, 1.7rem);
      font-weight: 700;
      margin-bottom: .4rem;
      text-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    h1 .emoji {
      display: inline-block;
      animation: wiggle .5s ease-in-out infinite;
    }
    @keyframes wiggle { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }

    .message {
      color: rgba(255,255,255,0.8);
      font-size: clamp(.85rem, 3.5vw, 1rem);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    /* Cake */
    .cake-container {
      position: relative;
      width: 160px; height: 136px;
      margin: .5rem auto;
      transform: scale(.75);
    }
    .cake {
      position: absolute; bottom: 0;
      left: 50%; transform: translateX(-50%);
    }
    .cake-layer { border-radius: 10px; margin: 0 auto; }
    .cake-layer-1 { width: 160px; height: 48px; background: linear-gradient(135deg, #f5a9bc, #f48fb1); border-bottom: 4px solid #ec407a; }
    .cake-layer-2 { width: 130px; height: 38px; background: linear-gradient(135deg, #ce93d8, #ba68c8); border-bottom: 4px solid #ab47bc; margin-top: -5px; }
    .cake-layer-3 { width: 100px; height: 33px; background: linear-gradient(135deg, #90caf9, #64b5f6); border-bottom: 4px solid #42a5f5; margin-top: -5px; }
    .cake-plate { width: 180px; height: 14px; background: linear-gradient(135deg, #fff, #e0e0e0); border-radius: 0 0 50% 50%; margin: 0 auto; }

    /* Frosting drips */
    .drip {
      position: absolute; width: 12px; border-radius: 0 0 6px 6px;
      background: linear-gradient(to bottom, #f48fb1, #ec407a);
    }

    /* Candles */
    .candles {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      display: flex; gap: 14px; justify-content: center;
    }
    .candle {
      position: relative; width: 8px; height: 38px;
      background: linear-gradient(135deg, #ffeb3b, #ffc107);
      border-radius: 3px;
      cursor: pointer;
      transition: transform .15s;
    }
    .candle:active { transform: scale(.9); }
    .candle::before {
      content: ''; position: absolute; top: -3px; left: 50%; transform: translateX(-50%);
      width: 4px; height: 6px; background: #333; border-radius: 2px;
    }

    /* Flame */
    .flame {
      position: absolute; top: -24px; left: 50%; transform: translateX(-50%);
      width: 12px; height: 18px;
      background: linear-gradient(to top, #ff9800, #ffeb3b, #fff);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      animation: flicker .3s ease-in-out infinite alternate;
      box-shadow: 0 0 15px #ff9800, 0 0 35px #ff5722;
      transition: opacity .3s, transform .3s;
    }
    .flame.out { opacity: 0; transform: translateX(-50%) scale(0); }
    @keyframes flicker { 0% { transform: translateX(-50%) scale(1) rotate(-2deg); } 100% { transform: translateX(-50%) scale(1.1) rotate(2deg); } }

    /* Smoke */
    .smoke {
      position: absolute; top: -28px; left: 50%; transform: translateX(-50%);
      width: 8px; height: 8px; background: rgba(150,150,150,0.6);
      border-radius: 50%; opacity: 0;
    }
    .smoke.active { animation: smoke-rise 1.5s ease-out forwards; }
    @keyframes smoke-rise { 0% { opacity:.8; transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity:0; transform: translateX(-50%) translateY(-60px) scale(3); } }

    /* Blow section (mic addon) */
    .blow-section { margin-top: .8rem; }
    .blow-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff; border: none;
      padding: .8rem 1.8rem; font-size: .95rem; font-weight: 600;
      border-radius: 50px; cursor: pointer;
      transition: all .3s;
      box-shadow: 0 6px 25px rgba(102,126,234,0.4);
    }
    .blow-btn:hover { transform: translateY(-2px); }
    .blow-btn:active { transform: scale(.97); }
    .mic-status { font-size: .8rem; color: rgba(255,255,255,.5); margin-top: .6rem; }
    .mic-status.listening { color: #4caf50; }
    .mic-status.error { color: #ff5722; }

    .mic-visualizer {
      display: none; width: 100%; max-width: 180px; height: 36px;
      margin: .8rem auto 0; background: rgba(255,255,255,.08);
      border-radius: 18px; overflow: hidden; position: relative;
    }
    .mic-visualizer.active { display: block; }
    .mic-bar {
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 80%; height: 0%;
      background: linear-gradient(to top, #4caf50, #8bc34a);
      border-radius: 10px 10px 0 0; transition: height .05s;
    }
    .blow-threshold {
      position: absolute; top: 30%; left: 10%; right: 10%;
      height: 2px; background: rgba(255,255,255,.4);
    }
    .blow-threshold::after {
      content: 'Blow here!'; position: absolute; right: 0; top: -8px;
      font-size: .6rem; color: rgba(255,255,255,.5);
    }

    /* Tap hint (default - no mic addon) */
    .tap-hint {
      font-size: .8rem; color: rgba(255,255,255,.5);
      margin-top: .8rem;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }

    /* Result */
    .result {
      display: none; color: #fff;
      font-size: 1.2rem; font-weight: 700;
      margin-top: .8rem;
      text-shadow: 0 0 30px rgba(102,126,234,.8);
    }
    .result.visible { display: block; animation: pop-in .5s cubic-bezier(.68,-.55,.265,1.55); }
    @keyframes pop-in { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }

    /* Balloon hint */
    .balloon-hint {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,.4); font-size: .75rem; z-index: 5;
      text-align: center; pointer-events: none;
      animation: fade-hint 4s ease-out forwards;
    }
    @keyframes fade-hint { 0%,60% { opacity:1; } 100% { opacity:0; } }

    /* Confetti */
    .confetti {
      position: fixed; font-size: 1.8rem; pointer-events: none; z-index: 100;
      animation: confetti-fall 4s linear forwards;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(-100px) rotate(0) scale(0); opacity:1; }
      10% { transform: translateY(0) rotate(30deg) scale(1); }
      100% { transform: translateY(100vh) rotate(720deg) scale(.5); opacity:0; }
    }

    /* Sparkles */
    .sparkle {
      position: fixed; border-radius: 50%; pointer-events: none; z-index: 15;
      animation: sparkFloat 2.5s ease-out forwards;
    }
    @keyframes sparkFloat {
      0% { opacity:1; transform: scale(1) translateY(0); }
      100% { opacity:0; transform: scale(0) translateY(-30px); }
    }

    /* Message overlay card (shown after candles blown) */
    .msg-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.8);
      display: flex; align-items: center; justify-content: center;
      z-index: 100; opacity: 0; pointer-events: none;
      transition: opacity .5s;
    }
    .msg-overlay.visible { opacity: 1; pointer-events: auto; }
    .msg-card {
      width: 88%; max-width: 380px;
      opacity: 0;
      transform: translateY(40px) scale(.85) rotate(-3deg);
      transition: all .7s cubic-bezier(.34,1.56,.64,1);
    }
    .msg-overlay.visible .msg-card {
      opacity: 1; transform: translateY(0) scale(1) rotate(0);
    }
    .msg-card-inner {
      background: linear-gradient(145deg, #fdf6e3, #f5e6c8);
      border-radius: 16px; padding: 2rem 1.5rem;
      position: relative; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 4px 12px rgba(0,0,0,.3);
    }
    .msg-card-inner::before {
      content:''; position: absolute; inset:0;
      background: repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(0,0,0,.03) 28px,rgba(0,0,0,.03) 29px);
      pointer-events: none;
    }
    .msg-card-inner::after {
      content:''; position: absolute; top:0; left:0; right:0; height: 4px;
      background: linear-gradient(90deg, #a855f7, #ec4899);
    }
    .msg-card-to {
      font-size: clamp(1.1rem,4.5vw,1.4rem);
      font-weight: 700; color: #5f27cd; margin-bottom: .8rem;
    }
    .msg-card-body {
      font-size: clamp(.9rem,3.5vw,1.05rem);
      line-height: 1.8; color: #2c1810;
      font-style: italic;
      word-wrap: break-word; overflow-wrap: break-word;
    }
    .msg-card-close {
      display: block; margin: 1.5rem auto 0;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: #fff; border: none;
      padding: .7rem 2rem; border-radius: 10px;
      font-size: .9rem; font-weight: 600;
      cursor: pointer; transition: transform .2s;
    }
    .msg-card-close:active { transform: scale(.95); }

    @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
    .hidden { display: none !important; }

    @media (max-width: 480px) {
      .card { padding: 1.3rem 1.2rem; }
      .cake-container { transform: scale(.82); margin: .3rem auto; }
    }
  </style>
</head>
<body>
  <canvas id="physics-canvas"></canvas>

  <div class="content">
    <div class="card">
      <h1>Happy Birthday <span class="emoji">🎂</span><br>{{recipientName}}!</h1>

      <div class="cake-container">
        <div class="candles" id="candles">
          <div class="candle" onclick="tapCandle(0)"><div class="flame" id="flame-0"></div><div class="smoke" id="smoke-0"></div></div>
          <div class="candle" onclick="tapCandle(1)"><div class="flame" id="flame-1"></div><div class="smoke" id="smoke-1"></div></div>
          <div class="candle" onclick="tapCandle(2)"><div class="flame" id="flame-2"></div><div class="smoke" id="smoke-2"></div></div>
          <div class="candle" onclick="tapCandle(3)"><div class="flame" id="flame-3"></div><div class="smoke" id="smoke-3"></div></div>
          <div class="candle" onclick="tapCandle(4)"><div class="flame" id="flame-4"></div><div class="smoke" id="smoke-4"></div></div>
        </div>
        <div class="cake">
          <div class="cake-layer cake-layer-3"></div>
          <div class="cake-layer cake-layer-2"></div>
          <div class="cake-layer cake-layer-1">
            <div class="drip" style="left:20px;height:14px;top:100%;"></div>
            <div class="drip" style="left:60px;height:18px;top:100%;"></div>
            <div class="drip" style="left:110px;height:12px;top:100%;"></div>
            <div class="drip" style="left:140px;height:16px;top:100%;"></div>
          </div>
          <div class="cake-plate"></div>
        </div>
      </div>

      <!-- Mic Blow section (addon) -->
      <div class="blow-section" id="blow-section" style="display:none;">
        <button class="blow-btn" id="blow-btn">🎤 Blow Out Candles!</button>
        <p class="mic-status" id="mic-status">Tap to enable microphone</p>
        <div class="mic-visualizer" id="mic-visualizer">
          <div class="mic-bar" id="mic-bar"></div>
          <div class="blow-threshold"></div>
        </div>
      </div>

      <!-- Tap hint (default, no mic addon) -->
      <p class="tap-hint" id="tap-hint">👆 Tap the candles to blow them out!</p>

      <div class="result" id="result">🎉 Make a wish! 🌟</div>
    </div>
  </div>

  <div class="balloon-hint">🎈 Drag and throw the balloons!</div>

  <!-- Message overlay (shown after candles blown) -->
  <div class="msg-overlay" id="msgOverlay">
    <div class="msg-card">
      <div class="msg-card-inner">
        <p class="msg-card-to">Dear {{recipientName}},</p>
        <p class="msg-card-body">{{customMessage}}</p>
        <button class="msg-card-close" onclick="document.getElementById('msgOverlay').classList.remove('visible');">Close</button>
      </div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

  <script>
    var hasMicBlow = '{{enableMicBlow}}' === 'true';
    var hasConfetti = '{{enableConfetti}}' === 'true';
    var hasSparkles = '{{enableSparkles}}' === 'true';
    var hasHaptics = 'vibrate' in navigator;

    // Show mic section or tap hint
    if (hasMicBlow) {
      document.getElementById('blow-section').style.display = 'block';
      document.getElementById('tap-hint').style.display = 'none';
    }

    // ============================================
    // Matter.js Physics Balloons
    // ============================================
    var canvas = document.getElementById('physics-canvas');
    var ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies,
        Body = Matter.Body, Mouse = Matter.Mouse, MouseConstraint = Matter.MouseConstraint,
        Events = Matter.Events, Composite = Matter.Composite;

    var engine = Engine.create();
    engine.world.gravity.y = 0.5;

    var balloonColors = [
      '#ff6b6b','#ff8e53','#feca57','#48dbfb','#ff9ff3',
      '#54a0ff','#5f27cd','#00d2d3','#ff6b9d','#c44569'
    ];

    var balloons = [];
    var balloonCount = 15;

    function createBalloon(x, y) {
      var color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
      var radius = 28 + Math.random() * 18;
      return Bodies.circle(x, y, radius, {
        restitution: 0.6, friction: 0.1, frictionAir: 0.02, density: 0.0005,
        label: 'balloon',
        balloonColor: color,
        balloonRadius: radius,
        stringLength: 35 + Math.random() * 25
      });
    }

    for (var i = 0; i < balloonCount; i++) {
      var x = Math.random() * (canvas.width - 100) + 50;
      var y = canvas.height - 100 - Math.random() * 200;
      var b = createBalloon(x, y);
      balloons.push(b);
      World.add(engine.world, b);
    }

    var wallThickness = 50;
    var walls = [
      Bodies.rectangle(canvas.width/2, canvas.height + wallThickness/2, canvas.width*2, wallThickness, { isStatic: true }),
      Bodies.rectangle(-wallThickness/2, canvas.height/2, wallThickness, canvas.height*2, { isStatic: true }),
      Bodies.rectangle(canvas.width + wallThickness/2, canvas.height/2, wallThickness, canvas.height*2, { isStatic: true }),
      Bodies.rectangle(canvas.width/2, -wallThickness/2, canvas.width*2, wallThickness, { isStatic: true })
    ];
    World.add(engine.world, walls);

    var mouse = Mouse.create(canvas);
    var mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    World.add(engine.world, mouseConstraint);

    // Touch support
    canvas.addEventListener('touchstart', function(e) {
      var t = e.touches[0], r = canvas.getBoundingClientRect();
      mouse.position.x = t.clientX - r.left;
      mouse.position.y = t.clientY - r.top;
      mouse.button = 0;
    }, { passive: false });
    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var t = e.touches[0], r = canvas.getBoundingClientRect();
      mouse.position.x = t.clientX - r.left;
      mouse.position.y = t.clientY - r.top;
    }, { passive: false });
    canvas.addEventListener('touchend', function() { mouse.button = -1; });

    // Helium effect
    Events.on(engine, 'beforeUpdate', function() {
      balloons.forEach(function(b) {
        if (b.position.y > 100) {
          Body.applyForce(b, b.position, { x: 0, y: -0.0002 });
        }
      });
    });

    // Render balloons
    function renderBalloons() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balloons.forEach(function(b) {
        var x = b.position.x, y = b.position.y;
        var rad = b.balloonRadius, col = b.balloonColor, sLen = b.stringLength;

        // String
        ctx.beginPath();
        ctx.moveTo(x, y + rad);
        ctx.quadraticCurveTo(x + Math.sin(Date.now()/500 + x)*5, y + rad + sLen/2, x, y + rad + sLen);
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.ellipse(x, y, rad*.85, rad, 0, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();

        // Shine
        ctx.beginPath();
        ctx.ellipse(x - rad*.3, y - rad*.3, rad*.22, rad*.32, -.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();

        // Knot
        ctx.beginPath();
        ctx.moveTo(x-5, y+rad-2); ctx.lineTo(x, y+rad+7); ctx.lineTo(x+5, y+rad-2);
        ctx.fillStyle = col; ctx.fill();
      });
      requestAnimationFrame(renderBalloons);
    }

    Engine.run(engine);
    renderBalloons();

    // Resize walls
    window.addEventListener('resize', function() {
      resizeCanvas();
      Composite.remove(engine.world, walls);
      walls.length = 0;
      walls.push(
        Bodies.rectangle(canvas.width/2, canvas.height+wallThickness/2, canvas.width*2, wallThickness, { isStatic: true }),
        Bodies.rectangle(-wallThickness/2, canvas.height/2, wallThickness, canvas.height*2, { isStatic: true }),
        Bodies.rectangle(canvas.width+wallThickness/2, canvas.height/2, wallThickness, canvas.height*2, { isStatic: true }),
        Bodies.rectangle(canvas.width/2, -wallThickness/2, canvas.width*2, wallThickness, { isStatic: true })
      );
      World.add(engine.world, walls);
    });

    // ============================================
    // Sparkles addon (around cake)
    // ============================================
    if (hasSparkles) {
      setInterval(function() {
        var card = document.querySelector('.cake-container');
        if (!card) return;
        var r = card.getBoundingClientRect();
        var s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = (r.left + Math.random()*r.width) + 'px';
        s.style.top = (r.top + Math.random()*r.height) + 'px';
        var sz = (3 + Math.random()*5) + 'px';
        s.style.width = sz; s.style.height = sz;
        s.style.background = ['#feca57','#ff9ff3','#48dbfb','#fff','#ff6b6b'][Math.floor(Math.random()*5)];
        document.body.appendChild(s);
        setTimeout(function() { s.remove(); }, 2500);
      }, 300);
    }

    // ============================================
    // Candle Blowing Logic
    // ============================================
    var candlesLit = 5;
    var audioContext = null;
    var analyser = null;
    var isListening = false;
    var blowStrength = 0;
    var BLOW_THRESHOLD = 0.12;

    // Tap to blow (always available, default mode)
    function tapCandle(idx) {
      if (!hasMicBlow || !isListening) {
        // Tap mode
        var flame = document.getElementById('flame-' + idx);
        var smoke = document.getElementById('smoke-' + idx);
        if (flame && !flame.classList.contains('out')) {
          flame.classList.add('out');
          smoke.classList.add('active');
          candlesLit--;
          if (hasHaptics) navigator.vibrate(50);
          if (candlesLit <= 0) setTimeout(celebrateSuccess, 500);
        }
      }
    }

    // Mic blow (addon)
    if (hasMicBlow) {
      var blowBtn = document.getElementById('blow-btn');
      var micStatus = document.getElementById('mic-status');
      var micVisualizer = document.getElementById('mic-visualizer');
      var micBar = document.getElementById('mic-bar');

      blowBtn.addEventListener('click', function() {
        if (!isListening) startMicrophone();
      });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        micStatus.textContent = '📱 Mic not supported. Tap candles instead!';
        blowBtn.classList.add('hidden');
        document.getElementById('tap-hint').style.display = 'block';
        document.getElementById('blow-section').style.display = 'none';
      }
    }

    function startMicrophone() {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioContext.createMediaStreamSource(stream).connect(analyser);

        isListening = true;
        document.getElementById('mic-status').textContent = '🎤 Blow into the mic!';
        document.getElementById('mic-status').classList.add('listening');
        document.getElementById('mic-visualizer').classList.add('active');
        document.getElementById('blow-btn').textContent = '🌬️ Listening...';
        document.getElementById('blow-btn').disabled = true;

        detectBlow();
      }).catch(function() {
        document.getElementById('mic-status').textContent = '❌ Mic denied. Tap candles instead!';
        document.getElementById('mic-status').classList.add('error');
        // Fall back to tap
        document.getElementById('tap-hint').style.display = 'block';
      });
    }

    function detectBlow() {
      if (!isListening || candlesLit <= 0) return;
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      var sum = 0;
      for (var i = 0; i < data.length; i++) sum += data[i];
      var avg = sum / data.length / 255;
      document.getElementById('mic-bar').style.height = (avg*100) + '%';
      blowStrength = blowStrength * 0.5 + avg * 0.5;
      if (blowStrength > BLOW_THRESHOLD) blowOutCandle();
      requestAnimationFrame(detectBlow);
    }

    function blowOutCandle() {
      if (candlesLit <= 0) return;
      var idx = candlesLit - 1;
      var flame = document.getElementById('flame-' + idx);
      var smoke = document.getElementById('smoke-' + idx);
      if (flame && !flame.classList.contains('out')) {
        flame.classList.add('out');
        smoke.classList.add('active');
        candlesLit--;
        if (hasHaptics) navigator.vibrate(50);
        if (candlesLit <= 0) setTimeout(celebrateSuccess, 500);
      }
    }

    function celebrateSuccess() {
      isListening = false;
      if (audioContext) audioContext.close();

      // Hide blow UI
      var bs = document.getElementById('blow-section');
      if (bs) bs.style.display = 'none';
      document.getElementById('tap-hint').style.display = 'none';
      document.getElementById('result').classList.add('visible');

      // Show message card overlay after a short delay
      setTimeout(function() {
        document.getElementById('msgOverlay').classList.add('visible');
      }, 1200);

      // Confetti
      if (hasConfetti) spawnConfetti();

      // Balloons go crazy
      balloons.forEach(function(b) {
        Body.applyForce(b, b.position, {
          x: (Math.random()-.5) * .05,
          y: -.02 - Math.random() * .02
        });
      });
    }

    function spawnConfetti() {
      var emojis = ['🎉','🎊','🎈','🎂','🎁','⭐','✨','🥳','🎵','💖'];
      for (var i = 0; i < 60; i++) {
        (function(idx) {
          setTimeout(function() {
            var c = document.createElement('div');
            c.className = 'confetti';
            c.textContent = emojis[Math.floor(Math.random()*emojis.length)];
            c.style.left = Math.random()*100 + 'vw';
            c.style.fontSize = (1.5+Math.random()*1.5) + 'rem';
            c.style.animationDuration = (3+Math.random()*2) + 's';
            document.body.appendChild(c);
            setTimeout(function() { c.remove(); }, 5000);
          }, idx*40);
        })(i);
      }
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Birthday Bash template...');

  // Try to update "Physics Party" (current name in DB)
  let result = await db
    .update(templates)
    .set({
      name: 'Birthday Bash',
      description: 'An interactive birthday celebration! Drag and throw physics balloons, tap candles to blow them out, and celebrate with confetti. Add the mic blowing addon for a real blow-out experience!',
      htmlTemplate: upgradedBirthdayTemplate,
      cssTemplate: '',
      jsTemplate: '',
      updatedAt: new Date(),
    })
    .where(eq(templates.name, 'Physics Party'))
    .returning();

  if (result.length > 0) {
    console.log('Updated Physics Party -> Birthday Bash');
  } else {
    // Try "Birthday Bash" (original name)
    result = await db
      .update(templates)
      .set({
        description: 'An interactive birthday celebration! Drag and throw physics balloons, tap candles to blow them out, and celebrate with confetti. Add the mic blowing addon for a real blow-out experience!',
        htmlTemplate: upgradedBirthdayTemplate,
        cssTemplate: '',
        jsTemplate: '',
        updatedAt: new Date(),
      })
      .where(eq(templates.name, 'Birthday Bash'))
      .returning();

    if (result.length > 0) {
      console.log('Updated Birthday Bash template');
    } else {
      console.log('Template not found (tried Physics Party and Birthday Bash)');
    }
  }

  process.exit(0);
}

main().catch(console.error);
