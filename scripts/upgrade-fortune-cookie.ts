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
    html, body {
      width: 100%; height: 100%;
    }
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

    /* Ambient glow */
    .ambient {
      position: fixed; inset: 0; pointer-events: none;
    }
    .ambient::before {
      content: '';
      position: absolute;
      top: 40%; left: 50%;
      transform: translate(-50%, -50%);
      width: 320px; height: 320px;
      background: radial-gradient(circle, rgba(212,160,86,0.18) 0%, transparent 70%);
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
      max-width: 420px;
      position: relative;
      z-index: 1;
    }

    .header { margin-bottom: 1.2rem; }
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

    /* Cookie area */
    .cookie-area {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    /* Cookie image - uses the openclipart fortune cookie SVG */
    .cookie-btn {
      background: none; border: none; padding: 0;
      cursor: pointer; outline: none;
      display: block;
      transition: transform .3s;
      -webkit-tap-highlight-color: transparent;
    }
    .cookie-btn:hover { transform: translateY(-8px); }
    .cookie-btn:active { transform: scale(.93); }
    .cookie-btn.cracked {
      cursor: default; pointer-events: none;
      animation: cookieCrack .6s ease-out forwards;
    }
    @keyframes cookieCrack {
      0% { transform: scale(1); opacity:1; }
      20% { transform: scale(1.1) rotate(-5deg); }
      50% { transform: scale(.9) rotate(4deg); opacity:.7; }
      100% { transform: scale(.6) rotate(0); opacity:0; }
    }
    .cookie-img {
      width: clamp(140px, 40vw, 200px);
      height: auto;
      filter: drop-shadow(0 12px 30px rgba(196,144,62,.4));
    }

    /* Hint */
    .hint {
      color: #888; font-size: .85rem;
      margin-bottom: 1.5rem;
      transition: opacity .5s;
    }
    .hint-tap {
      display: inline-block;
      animation: tap 1.2s ease-in-out infinite;
      font-size: 1rem;
    }
    @keyframes tap {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    /* Fortune reveal area - scroll + paper */
    .fortune-area {
      position: relative;
      width: 100%;
      opacity: 0;
      transform: translateY(30px) scaleY(.3);
      transition: all .8s cubic-bezier(.34,1.56,.64,1);
      pointer-events: none;
    }
    .fortune-area.show {
      opacity: 1;
      transform: translateY(0) scaleY(1);
      pointer-events: auto;
    }

    /* Scroll SVG as background image */
    .scroll-wrap {
      position: relative;
      width: 100%;
      max-width: 360px;
      margin: 0 auto;
    }
    .scroll-img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Fortune text overlaid on the scroll */
    .fortune-overlay {
      position: absolute;
      top: 34%;
      left: 15%;
      right: 15%;
      bottom: 5%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .fortune-text {
      font-size: clamp(.85rem, 3.5vw, 1.1rem);
      line-height: 1.6;
      color: #3a2a18;
      font-style: italic;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: 0 .25rem;
    }
    .q { color: #c0392b; font-size: 1.3rem; font-style: normal; vertical-align: -3px; }

    /* Lucky numbers */
    .lucky { display: none; margin-top: .5rem; }
    .lucky.show { display: block; }
    .lucky-label { text-transform: uppercase; font-size: .6rem; color: #8b7355; letter-spacing: 1px; font-weight: 600; }
    .lucky-nums { font-weight: 700; color: #c0392b; font-size: .75rem; margin-top: .15rem; letter-spacing: 2px; }

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

    <div class="cookie-area">
      <button class="cookie-btn" id="cookie" onclick="crack()" aria-label="Crack the cookie">
        <img class="cookie-img" src="https://me2you.world/images/fortune-cookie/cookie.svg" alt="Fortune Cookie" />
      </button>
    </div>

    <p class="hint" id="hint">
      <span class="hint-tap">&#9757;</span> Tap to crack open
    </p>

    <div class="fortune-area" id="fortune">
      <div class="scroll-wrap">
        <img class="scroll-img" src="https://me2you.world/images/fortune-cookie/scroll.svg" alt="Fortune scroll" />
        <div class="fortune-overlay">
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
  </div>

  <div id="confetti"></div>

  <script>
    let done = false;
    const hasConfetti = '{{enableConfetti}}' === 'true';
    const hasLucky = '{{enableLuckyNumbers}}' === 'true';
    const hasSparkles = '{{enableSparkles}}' === 'true';
    const hasHaptics = 'vibrate' in navigator;

    // Sparkles around cookie before cracking
    if (hasSparkles) {
      setInterval(function() {
        if (done) return;
        var btn = document.getElementById('cookie');
        if (!btn) return;
        var r = btn.getBoundingClientRect();
        var s = document.createElement('div');
        s.className = 'spark';
        s.style.left = (r.left + Math.random() * r.width) + 'px';
        s.style.top = (r.top + Math.random() * r.height) + 'px';
        var sz = (3 + Math.random() * 5) + 'px';
        s.style.width = sz; s.style.height = sz;
        s.style.background = ['#eab308','#d4a056','#ffd700','#fff'][Math.floor(Math.random()*4)];
        document.body.appendChild(s);
        setTimeout(function() { s.remove(); }, 2000);
      }, 300);
    }

    function crack() {
      if (done) return;
      done = true;

      // Haptic feedback
      if (hasHaptics) navigator.vibrate([30,30,60]);

      // Crack animation
      document.getElementById('cookie').classList.add('cracked');

      // Crumbs fly out
      var btn = document.getElementById('cookie');
      var r = btn.getBoundingClientRect();
      var cx = r.left + r.width/2, cy = r.top + r.height/2;
      for (var i = 0; i < 20; i++) {
        var c = document.createElement('div');
        c.className = 'crumb';
        var sz = 3 + Math.random()*8;
        c.style.width = sz+'px'; c.style.height = sz+'px';
        c.style.left = (cx + (Math.random()-.5)*60) + 'px';
        c.style.top = cy + 'px';
        c.style.setProperty('--tx', (Math.random()-.5)*180+'px');
        c.style.setProperty('--ty', (30+Math.random()*120)+'px');
        c.style.animation = 'crumbFly '+(0.4+Math.random()*0.6)+'s ease-out forwards';
        c.style.background = ['#c4903e','#d4a056','#a07030','#e8c373'][Math.floor(Math.random()*4)];
        document.body.appendChild(c);
        setTimeout(function(el) { el.remove(); }, 1200, c);
      }

      // Hide hint
      document.getElementById('hint').style.opacity = '0';

      // Show fortune after cookie fades
      setTimeout(function() {
        document.getElementById('fortune').classList.add('show');

        // Lucky numbers
        if (hasLucky) {
          var nums = [];
          while (nums.length < 6) {
            var n = Math.floor(Math.random()*49)+1;
            if (nums.indexOf(n) === -1) nums.push(n);
          }
          nums.sort(function(a,b){return a-b;});
          document.getElementById('lucky-nums').textContent = nums.join('  ');
          document.getElementById('lucky').classList.add('show');
        }

        // Confetti rain
        if (hasConfetti) launchConfetti();
      }, 600);
    }

    function launchConfetti() {
      var colors = ['#eab308','#d4a056','#a855f7','#ec4899','#22c55e','#fff','#f97316'];
      var el = document.getElementById('confetti');
      for (var i = 0; i < 90; i++) {
        (function(idx) {
          setTimeout(function() {
            var c = document.createElement('div');
            c.className = 'conf';
            c.style.left = Math.random()*100+'vw';
            c.style.background = colors[Math.floor(Math.random()*colors.length)];
            c.style.animationDuration = (2+Math.random()*2)+'s';
            c.style.animationDelay = (Math.random()*.4)+'s';
            if (Math.random()>.5) c.style.borderRadius = '50%';
            el.appendChild(c);
            setTimeout(function() { c.remove(); }, 5000);
          }, idx*12);
        })(i);
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
        description: 'Crack open a fortune cookie to reveal a personalized message on a scroll. Features crumbs, lucky numbers, sparkles, and confetti addons!',
      })
      .where(eq(templates.name, 'Fortune Cookie'));
    console.log('Updated Fortune Cookie template');
  } else {
    console.log('Fortune Cookie template not found');
  }

  process.exit(0);
}

main().catch(console.error);
