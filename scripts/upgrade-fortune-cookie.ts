import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedFortuneCookie = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Fortune for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(145deg, #0a0a0f 0%, #1a1028 50%, #0f0f1a 100%);
      color: #fff;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      overflow: hidden;
      position: relative;
    }

    /* Ambient glow */
    .ambient {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }
    .ambient::before {
      content: '';
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(212, 160, 86, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: ambientPulse 4s ease-in-out infinite;
    }
    @keyframes ambientPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
      50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
    }

    .container {
      text-align: center;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
    }

    .header { margin-bottom: 2rem; }
    .subtitle {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 0.4rem;
    }
    .name {
      font-size: clamp(1.5rem, 6vw, 2.2rem);
      font-weight: 800;
      background: linear-gradient(135deg, #d4a056, #eab308, #d4a056);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: goldShift 3s ease infinite;
    }
    @keyframes goldShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    /* Cookie scene */
    .cookie-scene {
      position: relative;
      width: 200px;
      height: 160px;
      margin: 0 auto 1.5rem;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cookie-scene.cracked { cursor: default; pointer-events: none; }

    /* Fortune cookie - the classic folded shape */
    .cookie {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 160px;
      height: 100px;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cookie-scene:not(.cracked) .cookie:active {
      transform: translate(-50%, -50%) scale(0.93);
    }

    /* Main cookie body - rounded triangle / folded disc */
    .cookie-top, .cookie-bottom {
      position: absolute;
      left: 0;
      width: 100%;
      height: 55%;
      overflow: hidden;
      transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cookie-top { top: 0; transform-origin: center bottom; }
    .cookie-bottom { bottom: 0; transform-origin: center top; }

    .cookie-top::before, .cookie-bottom::before {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 200%;
      border-radius: 50%;
      background: linear-gradient(160deg, #f0d48a 0%, #dbb45c 30%, #c49a3c 60%, #a07830 100%);
      box-shadow:
        inset 0 2px 15px rgba(255, 230, 150, 0.4),
        inset 0 -4px 10px rgba(0,0,0,0.15);
    }
    .cookie-top::before { bottom: 0; }
    .cookie-bottom::before { top: 0; }

    /* Subtle texture on cookie */
    .cookie-top::after, .cookie-bottom::after {
      content: '';
      position: absolute;
      left: 10%;
      width: 80%;
      height: 200%;
      border-radius: 50%;
      background: repeating-conic-gradient(
        rgba(0,0,0,0.02) 0deg, transparent 3deg, transparent 6deg
      );
    }
    .cookie-top::after { bottom: 0; }
    .cookie-bottom::after { top: 0; }

    /* Fold line / seam in the middle */
    .cookie-seam {
      position: absolute;
      top: 50%;
      left: 5%;
      width: 90%;
      height: 3px;
      transform: translateY(-50%);
      background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 20%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.12) 80%, transparent 100%);
      border-radius: 50%;
      z-index: 2;
      transition: opacity 0.3s;
    }

    /* Highlight / sheen */
    .cookie-sheen {
      position: absolute;
      top: 18%;
      left: 25%;
      width: 35%;
      height: 20%;
      background: rgba(255, 240, 180, 0.25);
      border-radius: 50%;
      filter: blur(8px);
      z-index: 2;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    /* Cookie shadow on surface */
    .cookie-shadow {
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 140px;
      height: 20px;
      background: radial-gradient(ellipse, rgba(196, 144, 62, 0.25) 0%, transparent 70%);
      border-radius: 50%;
      transition: all 0.6s;
    }

    /* Cracked state - top half tilts up, bottom tilts down */
    .cracked .cookie-top {
      transform: rotateX(-70deg) translateY(-20px);
      opacity: 0.6;
    }
    .cracked .cookie-bottom {
      transform: rotateX(70deg) translateY(20px);
      opacity: 0.6;
    }
    .cracked .cookie-seam { opacity: 0; }
    .cracked .cookie-sheen { opacity: 0; }
    .cracked .cookie-shadow { opacity: 0; width: 80px; }

    /* Hint text */
    .hint {
      color: #666;
      font-size: 0.85rem;
      transition: opacity 0.5s;
    }
    .hint-finger {
      display: inline-block;
      animation: tapBounce 1.2s ease-in-out infinite;
    }
    @keyframes tapBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    /* Fortune paper */
    .fortune-paper {
      width: 100%;
      margin-top: 1.5rem;
      opacity: 0;
      transform: translateY(30px) scaleY(0.3);
      transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    }
    .fortune-paper.show {
      opacity: 1;
      transform: translateY(0) scaleY(1);
      pointer-events: auto;
    }
    .fortune-inner {
      background: linear-gradient(145deg, #fdf6e3, #f5e6c8);
      border-radius: 12px;
      padding: 1.5rem 1.25rem;
      position: relative;
      overflow: hidden;
      box-shadow:
        0 10px 40px rgba(0,0,0,0.3),
        0 2px 8px rgba(0,0,0,0.2);
    }
    /* Paper texture */
    .fortune-inner::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 28px,
        rgba(0,0,0,0.03) 28px,
        rgba(0,0,0,0.03) 29px
      );
      pointer-events: none;
    }
    /* Red accent line */
    .fortune-inner::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #d4453b, #c0392b);
    }

    .fortune-text {
      font-size: clamp(1rem, 4vw, 1.2rem);
      line-height: 1.7;
      color: #2c1810;
      font-style: italic;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .fortune-quote {
      color: #d4453b;
      font-size: 1.5rem;
      font-style: normal;
      line-height: 0;
      vertical-align: -4px;
    }

    /* Lucky numbers */
    .lucky-numbers {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px dashed rgba(0,0,0,0.1);
      font-size: 0.75rem;
      color: #8b7355;
      letter-spacing: 1px;
      display: none;
    }
    .lucky-numbers.show { display: block; }
    .lucky-label { text-transform: uppercase; font-weight: 600; }
    .lucky-nums {
      font-weight: 700;
      color: #d4453b;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      letter-spacing: 3px;
    }

    /* Crumbs */
    .crumb {
      position: absolute;
      background: #c4903e;
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
    }
    @keyframes crumbFall {
      0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
      100% { opacity: 0; transform: translate(var(--tx), var(--ty)) rotate(360deg); }
    }

    /* Confetti */
    #confetti-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 100;
    }
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confettiFall 3s ease-out forwards;
    }
    @keyframes confettiFall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }

    /* Sparkle container */
    .sparkle {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      pointer-events: none;
      animation: sparkleFloat 2s ease-out forwards;
    }
    @keyframes sparkleFloat {
      0% { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(0) translateY(-60px); }
    }
  </style>
</head>
<body>
  <div class="ambient"></div>

  <div class="container">
    <div class="header">
      <p class="subtitle">A fortune for</p>
      <h1 class="name">{{recipientName}}</h1>
    </div>

    <div class="cookie-scene" id="cookie-scene" onclick="crackCookie()">
      <div class="cookie">
        <div class="cookie-top"></div>
        <div class="cookie-seam"></div>
        <div class="cookie-bottom"></div>
        <div class="cookie-sheen"></div>
      </div>
      <div class="cookie-shadow"></div>
    </div>

    <p class="hint" id="hint">
      <span class="hint-finger">👆</span> Tap the cookie
    </p>

    <div class="fortune-paper" id="fortune-paper">
      <div class="fortune-inner">
        <p class="fortune-text">
          <span class="fortune-quote">&ldquo;</span>{{customMessage}}<span class="fortune-quote">&rdquo;</span>
        </p>
        <div class="lucky-numbers" id="lucky-numbers">
          <p class="lucky-label">Lucky Numbers</p>
          <p class="lucky-nums" id="lucky-nums-values"></p>
        </div>
      </div>
    </div>
  </div>

  <div id="confetti-container"></div>

  <script>
    let cracked = false;
    const enableConfetti = '{{enableConfetti}}' === 'true';
    const enableLuckyNumbers = '{{enableLuckyNumbers}}' === 'true';
    const enableSparkles = '{{enableSparkles}}' === 'true';
    const enableHaptics = 'vibrate' in navigator;

    // Sparkles floating around cookie before crack
    if (enableSparkles) {
      setInterval(() => {
        if (cracked) return;
        const scene = document.getElementById('cookie-scene');
        const rect = scene.getBoundingClientRect();
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = (rect.left + Math.random() * rect.width) + 'px';
        s.style.top = (rect.top + Math.random() * rect.height) + 'px';
        s.style.background = ['#eab308', '#d4a056', '#ffd700', '#fff'][Math.floor(Math.random() * 4)];
        s.style.width = s.style.height = (3 + Math.random() * 4) + 'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 2000);
      }, 300);
    }

    function crackCookie() {
      if (cracked) return;
      cracked = true;

      const scene = document.getElementById('cookie-scene');
      scene.classList.add('cracked');

      // Haptic
      if (enableHaptics) navigator.vibrate([30, 30, 60]);

      // Spawn crumbs
      const rect = scene.getBoundingClientRect();
      for (let i = 0; i < 15; i++) {
        const crumb = document.createElement('div');
        crumb.className = 'crumb';
        const size = 3 + Math.random() * 6;
        crumb.style.width = size + 'px';
        crumb.style.height = size + 'px';
        crumb.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 40) + 'px';
        crumb.style.top = (rect.top + rect.height / 2) + 'px';
        crumb.style.position = 'fixed';
        crumb.style.setProperty('--tx', (Math.random() - 0.5) * 120 + 'px');
        crumb.style.setProperty('--ty', (40 + Math.random() * 80) + 'px');
        crumb.style.animation = 'crumbFall ' + (0.4 + Math.random() * 0.4) + 's ease-out forwards';
        crumb.style.background = ['#c4903e', '#d4a056', '#a07030', '#e8c373'][Math.floor(Math.random() * 4)];
        document.body.appendChild(crumb);
        setTimeout(() => crumb.remove(), 1000);
      }

      // Hide hint
      document.getElementById('hint').style.opacity = '0';

      // Show fortune paper after crack animation
      setTimeout(() => {
        document.getElementById('fortune-paper').classList.add('show');

        // Lucky numbers
        if (enableLuckyNumbers) {
          const nums = [];
          while (nums.length < 6) {
            const n = Math.floor(Math.random() * 49) + 1;
            if (!nums.includes(n)) nums.push(n);
          }
          nums.sort((a, b) => a - b);
          document.getElementById('lucky-nums-values').textContent = nums.join('  ');
          document.getElementById('lucky-numbers').classList.add('show');
        }
      }, 600);

      // Confetti
      if (enableConfetti) {
        setTimeout(() => launchConfetti(), 600);
      }
    }

    function launchConfetti() {
      const colors = ['#eab308', '#d4a056', '#a855f7', '#ec4899', '#22c55e', '#fff'];
      const container = document.getElementById('confetti-container');
      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const c = document.createElement('div');
          c.className = 'confetti-piece';
          c.style.left = Math.random() * 100 + 'vw';
          c.style.background = colors[Math.floor(Math.random() * colors.length)];
          c.style.animationDuration = (2 + Math.random() * 2) + 's';
          c.style.animationDelay = (Math.random() * 0.3) + 's';
          if (Math.random() > 0.5) c.style.borderRadius = '50%';
          container.appendChild(c);
          setTimeout(() => c.remove(), 4000);
        }, i * 15);
      }
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Fortune Cookie template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Fortune Cookie'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedFortuneCookie,
        description: 'Crack open a fortune cookie to reveal a personalized message. Features crumbs, lucky numbers, and confetti addons. Mobile-optimized!',
      })
      .where(eq(templates.name, 'Fortune Cookie'));
    console.log('✅ Updated existing Fortune Cookie template');
  } else {
    console.log('❌ Fortune Cookie template not found');
  }

  process.exit(0);
}

main().catch(console.error);
