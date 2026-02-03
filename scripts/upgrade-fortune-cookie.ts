import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const COOKIE_SVG = `<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><g id="color"><rect x="17.3962" y="28.2404" width="8.5369" height="17.1843" transform="matrix(0.5359, -0.8443, 0.8443, 0.5359, -21.0425, 35.3858)" fill="#d0cfce"/><path fill="#fcea2b" d="M38.0889,37.0473a25.4023,25.4023,0,0,0-5.68,1.2274,29.259,29.259,0,0,0-10.8,7.09l-.005.0055c-.0782.0857-.236.26-.242.269a14.5063,14.5063,0,0,0,2.3722,2.8561A19.3988,19.3988,0,1,0,25.5228,23.95a20.1316,20.1316,0,0,0-4.1612,4.5053c.006.0091.1638.1832.242.269l.005.0055A43.3575,43.3575,0,0,0,33,37"/><path fill="#f1b31c" d="M49.8957,20.9907a19.2835,19.2835,0,0,0-12.2606-2.9385,19.1877,19.1877,0,0,1,8.5782,2.9385,19.3518,19.3518,0,0,1-8.668,35.6183,19.3707,19.3707,0,0,0,12.35-35.6183Z"/></g><g id="line"><path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M38.0889,37.0473a25.4023,25.4023,0,0,0-5.68,1.2274,29.259,29.259,0,0,0-10.8,7.09l-.005.0055c-.0782.0857-.236.26-.242.269a14.5063,14.5063,0,0,0,2.3722,2.8561A19.3988,19.3988,0,1,0,25.5228,23.95a20.1316,20.1316,0,0,0-4.1612,4.5053c.006.0091.1638.1832.242.269l.005.0055C26.1318,33.6782,34,37,34,37"/><polyline fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="17.847 38.124 12.73 34.876 16.116 29.541 24.294 34.732"/></g></svg>`;

const upgradedFortuneCookie = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Fortune for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; }
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
    @media (min-width: 768px) {
      .ambient::before { width: 500px; height: 500px; }
    }
    @keyframes glow {
      0%,100% { transform: translate(-50%,-50%) scale(1); opacity:.5; }
      50% { transform: translate(-50%,-50%) scale(1.3); opacity:1; }
    }

    .container {
      text-align: center;
      width: 100%;
      max-width: 500px;
      position: relative;
      z-index: 1;
    }
    @media (min-width: 768px) {
      .container { max-width: 600px; }
    }

    .header { margin-bottom: 1.5rem; }
    .subtitle {
      font-size: .85rem; color: #666;
      text-transform: uppercase; letter-spacing: 2px;
      margin-bottom: .4rem;
    }
    @media (min-width: 768px) {
      .subtitle { font-size: 1rem; letter-spacing: 3px; }
      .header { margin-bottom: 2rem; }
    }
    .name {
      font-size: clamp(1.5rem,6vw,3rem);
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

    /* Cookie wrapper - holds both halves */
    .cookie-wrap {
      position: relative;
      width: clamp(140px, 40vw, 200px);
      height: clamp(140px, 40vw, 200px);
      margin: 0 auto 1.5rem;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    @media (min-width: 768px) {
      .cookie-wrap {
        width: 280px;
        height: 280px;
        margin: 0 auto 2rem;
      }
    }

    /* Whole cookie (shown before crack) */
    .cookie-whole {
      width: 100%; height: 100%;
      filter: drop-shadow(0 12px 30px rgba(196,144,62,.4));
      transition: transform .3s;
    }
    .cookie-wrap:hover .cookie-whole { transform: translateY(-8px); }
    .cookie-wrap:active .cookie-whole { transform: scale(.93); }

    /* Shake before splitting */
    .cookie-wrap.shaking .cookie-whole {
      animation: shake .4s ease-in-out;
    }
    @keyframes shake {
      0% { transform: rotate(0); }
      15% { transform: rotate(-12deg); }
      30% { transform: rotate(10deg); }
      45% { transform: rotate(-8deg); }
      60% { transform: rotate(6deg); }
      75% { transform: rotate(-3deg); }
      100% { transform: rotate(0); }
    }

    /* After shake, whole hides, halves show */
    .cookie-whole.hide { display: none; }

    /* Two halves of the cookie */
    .cookie-half {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      filter: drop-shadow(0 8px 20px rgba(196,144,62,.3));
      display: none;
    }
    .cookie-half svg { width: 100%; height: 100%; }
    .cookie-half.show { display: block; }

    .cookie-top {
      clip-path: polygon(0 0, 100% 0, 100% 52%, 0 52%);
    }
    .cookie-bottom {
      clip-path: polygon(0 48%, 100% 48%, 100% 100%, 0 100%);
    }

    .cookie-top.fly {
      animation: flyTop .7s ease-out forwards;
    }
    .cookie-bottom.fly {
      animation: flyBottom .7s ease-out forwards;
    }
    @keyframes flyTop {
      0% { transform: translate(0,0) rotate(0); opacity:1; }
      100% { transform: translate(-40px, -60px) rotate(-25deg); opacity:0; }
    }
    @keyframes flyBottom {
      0% { transform: translate(0,0) rotate(0); opacity:1; }
      100% { transform: translate(40px, 50px) rotate(20deg); opacity:0; }
    }

    /* Hint */
    .hint {
      color: #888; font-size: .85rem;
      margin-bottom: 1.5rem;
      transition: opacity .5s;
    }
    @media (min-width: 768px) {
      .hint { font-size: 1rem; margin-bottom: 2rem; }
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

    /* Fortune paper card */
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
    @media (min-width: 768px) {
      .fortune-inner { padding: 2.5rem 2rem; border-radius: 18px; }
    }
    .fortune-inner::before {
      content:'';
      position: absolute; inset:0;
      background: repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(0,0,0,.03) 28px,rgba(0,0,0,.03) 29px);
      pointer-events: none;
    }
    .fortune-inner::after {
      content:'';
      position: absolute; top:0; left:0; right:0;
      height: 3px;
      background: linear-gradient(90deg,#d4453b,#c0392b);
    }
    .fortune-text {
      font-size: clamp(1rem,4vw,1.35rem);
      line-height: 1.7;
      color: #2c1810;
      font-style: italic;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .q { color: #d4453b; font-size: 1.5rem; font-style: normal; vertical-align: -4px; }
    @media (min-width: 768px) {
      .fortune-text { font-size: 1.4rem; }
      .q { font-size: 1.8rem; }
    }

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

    <div class="cookie-wrap" id="cookieWrap" onclick="crack()">
      <!-- Whole cookie before crack -->
      <div class="cookie-whole" id="cookieWhole">
        ${COOKIE_SVG}
      </div>
      <!-- Top half (shown during crack) -->
      <div class="cookie-half cookie-top" id="cookieTop">
        ${COOKIE_SVG}
      </div>
      <!-- Bottom half (shown during crack) -->
      <div class="cookie-half cookie-bottom" id="cookieBot">
        ${COOKIE_SVG}
      </div>
    </div>

    <p class="hint" id="hint">
      <span class="hint-tap">&#9757;</span> Tap to crack open
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
    var done = false;
    var hasConfetti = '{{enableConfetti}}' === 'true';
    var hasLucky = '{{enableLuckyNumbers}}' === 'true';
    var hasSparkles = '{{enableSparkles}}' === 'true';
    var hasHaptics = 'vibrate' in navigator;

    if (hasSparkles) {
      setInterval(function() {
        if (done) return;
        var el = document.getElementById('cookieWrap');
        if (!el) return;
        var r = el.getBoundingClientRect();
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

      if (hasHaptics) navigator.vibrate([30,30,60]);

      var wrap = document.getElementById('cookieWrap');
      wrap.style.cursor = 'default';

      // Step 1: Shake
      wrap.classList.add('shaking');

      // Step 2: After shake, split into halves
      setTimeout(function() {
        // Hide whole, show halves
        document.getElementById('cookieWhole').classList.add('hide');
        document.getElementById('cookieTop').classList.add('show');
        document.getElementById('cookieBot').classList.add('show');

        // Spawn crumbs from center
        var r = wrap.getBoundingClientRect();
        var cx = r.left + r.width/2, cy = r.top + r.height/2;
        for (var i = 0; i < 20; i++) {
          var c = document.createElement('div');
          c.className = 'crumb';
          var sz = 3 + Math.random()*8;
          c.style.width = sz+'px'; c.style.height = sz+'px';
          c.style.left = (cx + (Math.random()-.5)*60) + 'px';
          c.style.top = (cy + (Math.random()-.5)*30) + 'px';
          c.style.setProperty('--tx', (Math.random()-.5)*200+'px');
          c.style.setProperty('--ty', (20+Math.random()*140)+'px');
          c.style.animation = 'crumbFly '+(0.4+Math.random()*0.6)+'s ease-out forwards';
          c.style.background = ['#c4903e','#d4a056','#a07030','#e8c373','#fcea2b'][Math.floor(Math.random()*5)];
          document.body.appendChild(c);
          setTimeout(function(el) { el.remove(); }, 1200, c);
        }

        // Fly halves apart
        setTimeout(function() {
          document.getElementById('cookieTop').classList.add('fly');
          document.getElementById('cookieBot').classList.add('fly');
        }, 50);

        // Hide hint
        document.getElementById('hint').style.opacity = '0';

        // Show fortune
        setTimeout(function() {
          document.getElementById('fortune').classList.add('show');

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

          if (hasConfetti) launchConfetti();
        }, 600);
      }, 450); // after shake finishes
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
        description: 'Crack open a fortune cookie to reveal a personalized message. Shake, split, and crumbs fly! Features lucky numbers, sparkles, and confetti addons.',
      })
      .where(eq(templates.name, 'Fortune Cookie'));
    console.log('Updated Fortune Cookie template');
  } else {
    console.log('Fortune Cookie template not found');
  }

  process.exit(0);
}

main().catch(console.error);
