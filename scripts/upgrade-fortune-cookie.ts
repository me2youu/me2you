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
      padding: 0.75rem;
      overflow: hidden;
      position: relative;
    }

    /* Ambient glow behind cookie */
    .ambient {
      position: fixed; inset: 0; pointer-events: none;
    }
    .ambient::before {
      content: '';
      position: absolute;
      top: 35%; left: 50%;
      transform: translate(-50%, -50%);
      width: 280px; height: 280px;
      background: radial-gradient(circle, rgba(212,160,86,0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: glow 4s ease-in-out infinite;
    }
    @keyframes glow {
      0%,100% { transform: translate(-50%,-50%) scale(1); opacity:.5; }
      50% { transform: translate(-50%,-50%) scale(1.3); opacity:1; }
    }

    .container {
      text-align: center;
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
    }

    .header { margin-bottom: 1.5rem; }
    .subtitle {
      font-size: .85rem; color: #666;
      text-transform: uppercase; letter-spacing: 2px;
      margin-bottom: .4rem;
    }
    .name {
      font-size: clamp(1.5rem,6vw,2.2rem);
      font-weight: 800;
      background: linear-gradient(135deg,#d4a056,#eab308,#d4a056);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: goldShift 3s ease infinite;
    }
    @keyframes goldShift {
      0%,100% { background-position:0% 50%; }
      50% { background-position:100% 50%; }
    }

    /* Cookie wrapper */
    .cookie-btn {
      background: none; border: none; padding: 0;
      cursor: pointer; outline: none;
      display: block; margin: 0 auto 1.5rem;
      transition: transform .2s;
      -webkit-tap-highlight-color: transparent;
    }
    .cookie-btn:active { transform: scale(.93); }
    .cookie-btn.cracked {
      cursor: default; pointer-events: none;
      animation: cookieCrack .5s ease-out forwards;
    }
    @keyframes cookieCrack {
      0% { transform: scale(1); opacity:1; }
      30% { transform: scale(1.15) rotate(-8deg); }
      60% { transform: scale(.85) rotate(5deg); opacity:.6; }
      100% { transform: scale(.7) rotate(0); opacity:0; }
    }

    /* SVG cookie */
    .cookie-svg {
      width: clamp(180px, 50vw, 240px);
      height: auto;
      filter: drop-shadow(0 12px 30px rgba(196,144,62,.35));
    }

    /* Hint */
    .hint {
      color: #666; font-size: .85rem;
      transition: opacity .5s;
    }
    .hint-tap {
      display: inline-block;
      animation: tap 1.2s ease-in-out infinite;
    }
    @keyframes tap {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    /* Fortune paper */
    .fortune {
      width: 100%;
      padding: 0 .5rem;
      opacity: 0;
      transform: translateY(30px) scaleY(.2);
      transition: all .8s cubic-bezier(.34,1.56,.64,1);
      pointer-events: none;
    }
    .fortune.show {
      opacity: 1;
      transform: translateY(0) scaleY(1);
      pointer-events: auto;
    }
    .fortune-inner {
      background: linear-gradient(145deg, #fdf6e3, #f5e6c8);
      border-radius: 14px;
      padding: 1.5rem 1.25rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,.3), 0 2px 8px rgba(0,0,0,.2);
    }
    /* Paper lines */
    .fortune-inner::before {
      content:'';
      position: absolute; inset:0;
      background: repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(0,0,0,.03) 28px,rgba(0,0,0,.03) 29px);
      pointer-events: none;
    }
    /* Red top accent */
    .fortune-inner::after {
      content:'';
      position: absolute; top:0; left:0; right:0;
      height: 3px;
      background: linear-gradient(90deg,#d4453b,#c0392b);
    }
    .fortune-text {
      font-size: clamp(1rem,4vw,1.2rem);
      line-height: 1.7;
      color: #2c1810;
      font-style: italic;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .q { color: #d4453b; font-size: 1.5rem; font-style: normal; vertical-align: -4px; }

    /* Lucky numbers */
    .lucky { display: none; margin-top: 1rem; padding-top: .75rem; border-top: 1px dashed rgba(0,0,0,.1); }
    .lucky.show { display: block; }
    .lucky-label { text-transform: uppercase; font-size: .7rem; color: #8b7355; letter-spacing: 1px; font-weight: 600; }
    .lucky-nums { font-weight: 700; color: #d4453b; font-size: .85rem; margin-top: .2rem; letter-spacing: 3px; }

    /* Crumbs */
    .crumb {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
    }
    @keyframes crumbFly {
      0% { opacity:1; transform: translate(0,0) rotate(0); }
      100% { opacity:0; transform: translate(var(--tx),var(--ty)) rotate(360deg); }
    }

    /* Confetti */
    #confetti { position: fixed; inset:0; pointer-events:none; z-index:100; }
    .conf {
      position: absolute;
      width: 10px; height: 10px;
      animation: confDrop 3s ease-out forwards;
    }
    @keyframes confDrop {
      0% { transform: translateY(-100vh) rotate(0); opacity:1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity:0; }
    }

    /* Sparkles */
    .spark {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      animation: sparkUp 2s ease-out forwards;
    }
    @keyframes sparkUp {
      0% { opacity:1; transform: scale(1); }
      100% { opacity:0; transform: scale(0) translateY(-50px); }
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

    <button class="cookie-btn" id="cookie" onclick="crack()" aria-label="Crack the cookie">
      <svg class="cookie-svg" viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f0d48a"/>
            <stop offset="35%" stop-color="#dbb45c"/>
            <stop offset="70%" stop-color="#c49a3c"/>
            <stop offset="100%" stop-color="#a07830"/>
          </linearGradient>
          <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,240,180,.35)"/>
            <stop offset="100%" stop-color="rgba(255,240,180,0)"/>
          </linearGradient>
        </defs>
        <!-- Main cookie body - fortune cookie crescent shape -->
        <path d="M 15,85 Q 30,15 100,20 Q 170,15 185,85 Q 160,55 100,65 Q 40,55 15,85 Z" fill="url(#cg)" stroke="rgba(0,0,0,.08)" stroke-width=".5"/>
        <!-- Highlight sheen -->
        <ellipse cx="80" cy="40" rx="35" ry="14" fill="url(#hi)"/>
        <!-- Fold line -->
        <path d="M 28,72 Q 65,48 100,52 Q 135,48 172,72" fill="none" stroke="rgba(0,0,0,.1)" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Texture dots -->
        <circle cx="55" cy="45" r="1" fill="rgba(0,0,0,.05)"/>
        <circle cx="80" cy="35" r="1.2" fill="rgba(0,0,0,.04)"/>
        <circle cx="120" cy="38" r="1" fill="rgba(0,0,0,.05)"/>
        <circle cx="145" cy="48" r="1.1" fill="rgba(0,0,0,.04)"/>
        <circle cx="68" cy="55" r=".8" fill="rgba(0,0,0,.05)"/>
        <circle cx="130" cy="53" r=".9" fill="rgba(0,0,0,.04)"/>
      </svg>
    </button>

    <p class="hint" id="hint">
      <span class="hint-tap">👆</span> Tap to crack open
    </p>

    <div class="fortune" id="fortune">
      <div class="fortune-inner">
        <p class="fortune-text">
          <span class="q">&ldquo;</span>{{customMessage}}<span class="q">&rdquo;</span>
        </p>
        <div class="lucky" id="lucky">
          <p class="lucky-label">Lucky Numbers</p>
          <p class="lucky-nums" id="lucky-nums"></p>
        </div>
      </div>
    </div>
  </div>

  <div id="confetti"></div>

  <script>
    let done = false;
    const hasConfetti = '{{enableConfetti}}' === 'true';
    const hasLucky = '{{enableLuckyNumbers}}' === 'true';
    const hasSparkles = '{{enableSparkles}}' === 'true';
    const hasHaptics = 'vibrate' in navigator;

    // Sparkles around cookie
    if (hasSparkles) {
      setInterval(() => {
        if (done) return;
        const btn = document.getElementById('cookie');
        const r = btn.getBoundingClientRect();
        const s = document.createElement('div');
        s.className = 'spark';
        s.style.left = (r.left + Math.random() * r.width) + 'px';
        s.style.top = (r.top + Math.random() * r.height) + 'px';
        s.style.width = s.style.height = (3 + Math.random() * 4) + 'px';
        s.style.background = ['#eab308','#d4a056','#ffd700','#fff'][Math.floor(Math.random()*4)];
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 2000);
      }, 350);
    }

    function crack() {
      if (done) return;
      done = true;

      // Haptic
      if (hasHaptics) navigator.vibrate([30,30,60]);

      // Crack animation on cookie
      document.getElementById('cookie').classList.add('cracked');

      // Spawn crumbs
      const btn = document.getElementById('cookie');
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      for (let i = 0; i < 18; i++) {
        const c = document.createElement('div');
        c.className = 'crumb';
        const sz = 3 + Math.random()*7;
        c.style.width = sz+'px'; c.style.height = sz+'px';
        c.style.left = (cx + (Math.random()-.5)*50) + 'px';
        c.style.top = cy + 'px';
        c.style.setProperty('--tx', (Math.random()-.5)*150+'px');
        c.style.setProperty('--ty', (30+Math.random()*100)+'px');
        c.style.animation = 'crumbFly '+(0.4+Math.random()*0.5)+'s ease-out forwards';
        c.style.background = ['#c4903e','#d4a056','#a07030','#e8c373'][Math.floor(Math.random()*4)];
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1000);
      }

      // Hide hint
      document.getElementById('hint').style.opacity = '0';

      // Show fortune
      setTimeout(() => {
        document.getElementById('fortune').classList.add('show');

        if (hasLucky) {
          const nums = [];
          while (nums.length < 6) {
            const n = Math.floor(Math.random()*49)+1;
            if (!nums.includes(n)) nums.push(n);
          }
          nums.sort((a,b)=>a-b);
          document.getElementById('lucky-nums').textContent = nums.join('  ');
          document.getElementById('lucky').classList.add('show');
        }

        if (hasConfetti) launchConfetti();
      }, 500);
    }

    function launchConfetti() {
      const colors = ['#eab308','#d4a056','#a855f7','#ec4899','#22c55e','#fff'];
      const el = document.getElementById('confetti');
      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const c = document.createElement('div');
          c.className = 'conf';
          c.style.left = Math.random()*100+'vw';
          c.style.background = colors[Math.floor(Math.random()*colors.length)];
          c.style.animationDuration = (2+Math.random()*2)+'s';
          c.style.animationDelay = (Math.random()*.3)+'s';
          if (Math.random()>.5) c.style.borderRadius = '50%';
          el.appendChild(c);
          setTimeout(() => c.remove(), 4000);
        }, i*15);
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
    console.log('Updated Fortune Cookie template');
  } else {
    console.log('Fortune Cookie template not found');
  }

  process.exit(0);
}

main().catch(console.error);
