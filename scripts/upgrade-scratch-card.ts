import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedScratchCard = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Scratch Card for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%);
      color: #fff;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      overflow: hidden;
      position: relative;
    }

    /* Ambient background glow */
    .ambient {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .ambient::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
      animation: ambientMove 20s ease-in-out infinite;
    }
    @keyframes ambientMove {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-5%, -5%) rotate(5deg); }
    }

    .container {
      text-align: center;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
      padding: 0;
    }

    .header {
      margin-bottom: 1rem;
    }
    .subtitle {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 0.5rem;
    }
    .name {
      font-size: clamp(1.5rem, 6vw, 2.2rem);
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #ec4899, #f97316);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 3s ease infinite;
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    /* Scratch card container */
    .scratch-card {
      position: relative;
      width: 100%;
      aspect-ratio: 16/11;
      border-radius: 16px;
      overflow: hidden;
      cursor: crosshair;
      touch-action: none;
      box-shadow: 
        0 0 0 1px rgba(255,255,255,0.1),
        0 20px 50px -10px rgba(168, 85, 247, 0.3),
        0 10px 30px -5px rgba(0,0,0,0.5);
      transition: box-shadow 0.3s ease;
    }

    /* Hidden message underneath */
    .message-layer {
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .message-icon {
      width: 72px;
      height: 72px;
      margin-bottom: 0.75rem;
      animation: heartPulse 1.5s ease-in-out infinite;
    }
    .message-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.4));
    }
    @keyframes heartPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    .message-text {
      font-size: clamp(1rem, 4vw, 1.3rem);
      line-height: 1.6;
      color: #e5e5e5;
      text-align: center;
      max-width: 90%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }

    /* Scratch canvas */
    #scratch-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: 20px;
    }

    /* Sparkle container */
    #sparkles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      border-radius: 20px;
    }
    .sparkle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, #fff 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: sparkleOut 0.6s ease-out forwards;
    }
    @keyframes sparkleOut {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0); opacity: 0; }
    }

    /* Hint text */
    .hint {
      margin-top: 1.5rem;
      color: #555;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .hint-icon {
      animation: swipe 1.5s ease-in-out infinite;
    }
    @keyframes swipe {
      0%, 100% { transform: translateX(-5px); }
      50% { transform: translateX(5px); }
    }

    /* Progress bar */
    .progress-container {
      margin-top: 1rem;
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #a855f7, #ec4899);
      border-radius: 2px;
      transition: width 0.2s ease;
    }

    /* Confetti */
    #confetti-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 100;
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confettiFall 3s ease-out forwards;
    }
    @keyframes confettiFall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* Revealed state */
    .revealed .scratch-card {
      box-shadow: 
        0 0 0 1px rgba(168, 85, 247, 0.3),
        0 0 60px -10px rgba(168, 85, 247, 0.5),
        0 20px 50px -10px rgba(168, 85, 247, 0.4);
    }
    .revealed .message-icon {
      animation: celebrateBounce 0.5s ease;
    }
    @keyframes celebrateBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }


  </style>
</head>
<body>
  <div class="ambient"></div>
  
  <div class="container" id="main-container">
    <div class="header">
      <p class="subtitle">A surprise for</p>
      <h1 class="name">{{recipientName}}</h1>
    </div>

    <div class="scratch-card" id="scratch-card">
      <div class="message-layer">
        <div class="message-icon"><img src="/images/icons/heart.png" alt="heart" /></div>
        <p class="message-text">{{customMessage}}</p>
      </div>
      <canvas id="scratch-canvas"></canvas>
      <div id="sparkles"></div>
    </div>

    <p class="hint" id="hint">
      <span class="hint-icon">👆</span>
      <span>Scratch to reveal your surprise</span>
    </p>

    <div class="progress-container" id="progress-container">
      <div class="progress-bar" id="progress-bar"></div>
    </div>


  </div>

  <div id="confetti-container"></div>

  <script>
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const sparklesEl = document.getElementById('sparkles');
    const progressBar = document.getElementById('progress-bar');
    const container = document.getElementById('main-container');
    const hint = document.getElementById('hint');
    const confettiContainer = document.getElementById('confetti-container');
    
    let isScratching = false;
    let revealed = false;
    let scratchPercent = 0;
    
    // Addon flags (replaced by template engine from customData)
    const enableConfetti = '{{enableConfetti}}' === 'true';
    const enableSparkles = '{{enableSparkles}}' === 'true';
    const enableHaptics = 'vibrate' in navigator;

    // Set canvas size
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawScratchSurface();
    }

    // Draw the holographic scratch surface
    function drawScratchSurface() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      // Base gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.3, '#ec4899');
      gradient.addColorStop(0.6, '#f97316');
      gradient.addColorStop(1, '#a855f7');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Holographic shimmer lines
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }

      // Sparkle dots
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center text
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold ' + Math.min(w * 0.06, 20) + 'px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨ SCRATCH HERE ✨', w / 2, h / 2);
    }

    // Get position from touch/mouse event
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }

    // Create sparkle at position
    function createSparkle(x, y) {
      if (!enableSparkles) return;
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
      sparkle.style.top = (y + (Math.random() - 0.5) * 30) + 'px';
      sparkle.style.background = \`radial-gradient(circle, \${['#fff', '#a855f7', '#ec4899', '#f97316'][Math.floor(Math.random() * 4)]} 0%, transparent 70%)\`;
      sparklesEl.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 600);
    }

    // Scratch function - coordinates are in CSS pixels (ctx.scale handles DPR)
    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      
      // Main scratch circle (small radius for satisfying scratch feel)
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      
      // Create sparkle occasionally
      if (enableSparkles && Math.random() > 0.5) {
        createSparkle(x, y);
      }
      
      // Haptic feedback
      if (enableHaptics && isScratching) {
        navigator.vibrate(1);
      }
      
      updateProgress();
    }

    // Update progress and check for reveal
    function updateProgress() {
      if (revealed) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      const total = imageData.length / 4;
      
      // Sample every 10th pixel for performance
      for (let i = 3; i < imageData.length; i += 40) {
        if (imageData[i] === 0) cleared++;
      }
      
      scratchPercent = (cleared / (total / 10)) * 100;
      progressBar.style.width = Math.min(scratchPercent * 2, 100) + '%';
      
      // Reveal at 50%
      if (scratchPercent > 50 && !revealed) {
        revealMessage();
      }
    }

    // Reveal the message
    function revealMessage() {
      revealed = true;
      
      // Fade out canvas
      canvas.style.transition = 'opacity 0.8s ease';
      canvas.style.opacity = '0';
      
      // Hide hint, show revealed state
      hint.style.display = 'none';
      document.getElementById('progress-container').style.display = 'none';
      container.classList.add('revealed');
      
      // Haptic celebration
      if (enableHaptics) {
        navigator.vibrate([50, 50, 100]);
      }
      
      // Confetti!
      if (enableConfetti) {
        launchConfetti();
      }
      

    }

    // Launch confetti
    function launchConfetti() {
      const colors = ['#a855f7', '#ec4899', '#f97316', '#22c55e', '#3b82f6', '#fff'];
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + 'vw';
          confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
          confetti.style.animationDelay = (Math.random() * 0.5) + 's';
          if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
          }
          confettiContainer.appendChild(confetti);
          setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
      }
    }



    // Event listeners
    canvas.addEventListener('mousedown', (e) => {
      isScratching = true;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    });
    canvas.addEventListener('mousemove', (e) => {
      if (isScratching) {
        const pos = getPos(e);
        scratch(pos.x, pos.y);
      }
    });
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mouseleave', () => isScratching = false);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isScratching = true;
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (isScratching) {
        const pos = getPos(e);
        scratch(pos.x, pos.y);
      }
    }, { passive: false });
    canvas.addEventListener('touchend', () => isScratching = false);

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Scratch Card template...');
  
  // Find the scratch card template
  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Scratch Card'));
  
  if (existing.length > 0) {
    // Update existing
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedScratchCard,
        description: 'Premium scratch card with holographic surface, sparkle effects, haptic feedback, and confetti celebration. Mobile-optimized!',
      })
      .where(eq(templates.name, 'Scratch Card'));
    console.log('✅ Updated existing Scratch Card template');
  } else {
    console.log('❌ Scratch Card template not found');
  }
  
  process.exit(0);
}

main().catch(console.error);
