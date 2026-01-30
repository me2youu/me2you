import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const BOTTLE_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M580.8 149.7H442.4c-10.1 0-18.3-8.2-18.3-18.3V43.7c0-10.1 8.2-18.3 18.3-18.3 0 0 51.9-6.9 69.2-6.9 17.3 0 69.2 6.9 69.2 6.9 10.1 0 18.3 8.2 18.3 18.3v87.8c0 10-8.2 18.2-18.3 18.2z" fill="#F96806"/><path d="M580.8 160.7H442.3c-16.2 0-29.3-13.2-29.3-29.3V43.7c0-15.9 12.7-28.9 28.5-29.3 6.3-0.8 53.1-6.9 70-6.9 17 0 63.7 6.1 70 6.9 15.8 0.4 28.5 13.4 28.5 29.3v87.8c0.1 16.1-13.1 29.2-29.2 29.2zM511.5 29.4c-16.4 0-67.3 6.7-67.8 6.8-0.5 0.1-1 0.1-1.5 0.1-4 0-7.3 3.3-7.3 7.3v87.8c0 4 3.3 7.3 7.3 7.3h138.4c4 0 7.3-3.3 7.3-7.3V43.7c0-4-3.3-7.3-7.3-7.3-0.5 0-1 0-1.5-0.1-0.3-0.1-51.2-6.9-67.6-6.9z" fill="#C13105"/><path d="M580.8 149.7H442.4c-10.1 0-18.3-8.2-18.3-18.3V43.7c0-10.1 8.2-18.3 18.3-18.3 0 0 22.6-6.9 69.2-6.9 49.2 0 69.2 6.9 69.2 6.9 10.1 0 18.3 8.2 18.3 18.3v87.8c0 10-8.2 18.2-18.3 18.2z" fill="#F75708"/><path d="M580.8 160.7H442.3c-16.2 0-29.3-13.2-29.3-29.3V43.7c0-15.6 12.3-28.4 27.7-29.3 6-1.6 29.4-7 70.9-7 43 0 64.9 5.2 71 7 15.3 0.9 27.5 13.7 27.5 29.3v87.8c0 16.1-13.2 29.2-29.3 29.2zM511.5 29.4c-44 0-65.8 6.4-66 6.4-1 0.3-2.1 0.5-3.2 0.5-4 0-7.3 3.3-7.3 7.3v87.8c0 4 3.3 7.3 7.3 7.3h138.4c4 0 7.3-3.3 7.3-7.3V43.7c0-4-3.3-7.3-7.3-7.3-1.2 0-2.4-0.2-3.6-0.6-0.1-0.1-19.5-6.4-65.6-6.4z" fill="#C13105"/><path d="M556.5 120.4c-9.4 0-17-7.6-17-17V66.5c0-9.4 7.6-17 17-17s17 7.6 17 17v36.9c0 9.4-7.7 17-17 17z" fill="#FFD400"/><path d="M576.1 260.3V148H447v112.3c0 41.1-11 81.5-32 116.9L398.3 399c-10 13-15.4 28.9-15.4 45.2v557.9h257.2V444.2c0-16.4-5.4-32.2-15.4-45.2L608 377.2c-20.9-35.4-31.9-75.8-31.9-116.9z" fill="#E2B97F"/><path d="M640.1 1013.1H382.9c-6.1 0-11-4.9-11-11V444.2c0-18.7 6.3-37.1 17.6-51.9l16.3-21.3c19.7-33.6 30.1-71.8 30.1-110.8V148c0-6.1 4.9-11 11-11H576c6.1 0 11 4.9 11 11v112.3c0 38.9 10.4 77.2 30.1 110.8l16.3 21.3c11.4 14.8 17.6 33.2 17.6 51.9v557.9c0.1 6-4.8 10.9-10.9 10.9z m-246.2-22h235.2V444.2c0-13.9-4.6-27.5-13.1-38.5l-16.7-21.8c-0.3-0.4-0.5-0.7-0.7-1.1-21.9-37.1-33.5-79.4-33.5-122.5V159H458v101.3c0 43.1-11.6 85.4-33.5 122.5-0.2 0.4-0.5 0.7-0.7 1.1L407 405.7c-8.4 11-13.1 24.7-13.1 38.5v546.9z" fill="#C13105"/><path d="M613.6 966.3H565c-5.5 0-10-4.5-10-10s4.5-10 10-10h38.6V791.8c0-5.5 4.5-10 10-10s10 4.5 10 10v164.5c0 5.6-4.5 10-10 10zM434.4 432.4c-2.4 0-4.8-0.8-6.8-2.4-4.8-3.8-5.6-10.7-1.8-15.5 9.4-11.8 17-24.9 22.9-38.8 2.3-5.6 8.8-8.2 14.4-5.9 5.6 2.3 8.2 8.8 5.9 14.4-6.6 15.8-15.3 30.6-25.9 44-2.2 2.8-5.5 4.2-8.7 4.2z" fill="#FFD400"/></svg>`;

const upgradedBottle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Message for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(to bottom, #020617 0%, #0c1a3a 30%, #0c4a6e 70%, #164e63 100%);
      color: #fff;
      min-height: 100vh;
      min-height: 100dvh;
      overflow: hidden;
      position: relative;
    }

    /* Stars */
    .stars { position: fixed; inset: 0; pointer-events: none; }
    .star {
      position: absolute;
      background: #fff; border-radius: 50%;
      animation: twinkle var(--dur) ease-in-out infinite;
      animation-delay: var(--del);
    }
    @keyframes twinkle { 0%,100% { opacity:.15; } 50% { opacity:1; } }

    /* Moon */
    .moon {
      position: fixed; top: 8vh; right: 10vw;
      width: clamp(50px,12vw,90px); height: clamp(50px,12vw,90px);
      border-radius: 50%; background: #fef3c7;
      box-shadow: 0 0 40px rgba(254,243,199,0.4), 0 0 80px rgba(254,243,199,0.15);
    }
    .moon-crater {
      position: absolute; border-radius: 50%; background: rgba(0,0,0,0.05);
    }
    .moon-crater:nth-child(1) { width:15px; height:15px; top:20%; left:25%; }
    .moon-crater:nth-child(2) { width:10px; height:10px; top:50%; left:55%; }
    .moon-crater:nth-child(3) { width:8px; height:8px; top:35%; left:65%; }

    /* Sand */
    .sand {
      position: fixed; bottom: 0; left: 0; right: 0; height: 10vh;
      background: linear-gradient(to bottom, #c2b280 0%, #b0a070 40%, #a0926b 100%);
      z-index: 3;
    }
    .sand::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(circle at 15% 30%, rgba(0,0,0,.06) 1px, transparent 1px),
        radial-gradient(circle at 45% 60%, rgba(0,0,0,.05) 1px, transparent 1px),
        radial-gradient(circle at 75% 20%, rgba(0,0,0,.06) 1px, transparent 1px),
        radial-gradient(circle at 30% 80%, rgba(0,0,0,.04) 1px, transparent 1px),
        radial-gradient(circle at 85% 50%, rgba(0,0,0,.05) 1px, transparent 1px),
        radial-gradient(circle at 60% 40%, rgba(0,0,0,.04) 1px, transparent 1px);
      background-size: 8px 8px, 12px 12px, 10px 10px, 7px 7px, 9px 9px, 11px 11px;
      pointer-events: none;
    }
    /* Wet sand line where water meets beach */
    .sand::after {
      content: '';
      position: absolute; top: -4px; left: 0; right: 0;
      height: 8px;
      background: linear-gradient(to bottom, rgba(12,74,110,.3), rgba(194,178,128,.6));
      filter: blur(2px);
    }
    /* Sand ripples */
    .sand-ripple {
      position: absolute; left: 0; right: 0;
      height: 2px; border-radius: 50%;
      background: rgba(0,0,0,.04);
    }

    /* Ocean */
    .ocean {
      position: fixed; bottom: 9vh; left: 0; right: 0; height: 38vh;
      background: linear-gradient(to bottom, rgba(12,74,110,0) 0%, #0c4a6e 15%, #164e63 60%, #1e3a5f 100%);
      z-index: 2;
    }
    .wave {
      position: absolute; width: 200%; height: 60px; left: -50%;
      opacity: var(--wo, .6);
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60'%3E%3Cpath fill='%230e5a7e' fill-opacity='.5' d='M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 L0,60Z'/%3E%3C/svg%3E") repeat-x;
      background-size: 50% 100%;
      animation: wave var(--ws, 8s) linear infinite;
    }
    .wave:nth-child(1) { top:-40px; --wo:.7; --ws:7s; }
    .wave:nth-child(2) { top:-25px; --wo:.4; --ws:11s; animation-direction: reverse; }
    .wave:nth-child(3) { top:-10px; --wo:.25; --ws:9s; }

    @keyframes wave { to { transform: translateX(50%); } }

    /* Moon reflection on water */
    .moon-reflect {
      position: fixed; bottom: 25vh; left: 50%;
      transform: translateX(-50%);
      width: 6px; height: 15vh;
      background: linear-gradient(to bottom, rgba(254,243,199,.15), transparent);
      filter: blur(4px);
      pointer-events: none;
    }

    /* Bottle */
    .bottle-wrap {
      position: fixed;
      bottom: 30vh;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      cursor: pointer;
      animation: bob 4s ease-in-out infinite;
      -webkit-tap-highlight-color: transparent;
    }
    .bottle-wrap svg {
      width: clamp(80px, 22vw, 120px);
      height: auto;
      filter: drop-shadow(0 8px 25px rgba(0,0,0,.4));
      transition: transform .3s;
    }
    .bottle-wrap:hover svg { transform: scale(1.05); }
    .bottle-wrap:active svg { transform: scale(.95); }
    .bottle-wrap.opened { pointer-events: none; opacity: .4; transform: translateX(-50%) scale(.8); transition: all .6s; }

    @keyframes bob {
      0%,100% { transform: translateX(-50%) translateY(0) rotate(-3deg); }
      25% { transform: translateX(-50%) translateY(-10px) rotate(1deg); }
      50% { transform: translateX(-50%) translateY(-5px) rotate(3deg); }
      75% { transform: translateX(-50%) translateY(-12px) rotate(-1deg); }
    }

    /* Extra bottles - hidden offscreen initially */
    .bottle-extra {
      position: fixed;
      bottom: 30vh;
      z-index: 10;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      opacity: 0;
      pointer-events: none;
    }
    .bottle-extra svg {
      width: clamp(65px, 18vw, 100px);
      height: auto;
      filter: drop-shadow(0 8px 25px rgba(0,0,0,.4));
      transition: transform .3s;
    }
    .bottle-extra:hover svg { transform: scale(1.05); }
    .bottle-extra:active svg { transform: scale(.95); }
    .bottle-extra.opened { pointer-events: none; opacity: .4 !important; transform: scale(.8); transition: all .6s; }

    /* Bottle 2: washes in from left */
    .bottle-extra.wash-left {
      left: -120px;
      animation: washFromLeft 2s ease-out forwards, bob2 4s ease-in-out 2s infinite;
    }
    @keyframes washFromLeft {
      0% { left: -120px; opacity: 0; transform: rotate(-20deg); }
      60% { opacity: 1; transform: rotate(5deg); }
      80% { left: 28%; transform: rotate(-3deg); }
      100% { left: 25%; opacity: 1; transform: rotate(-2deg); }
    }
    @keyframes bob2 {
      0%,100% { transform: rotate(-2deg) translateY(0); }
      25% { transform: rotate(2deg) translateY(-8px); }
      50% { transform: rotate(-1deg) translateY(-4px); }
      75% { transform: rotate(3deg) translateY(-10px); }
    }

    /* Bottle 3: washes in from right */
    .bottle-extra.wash-right {
      right: -120px;
      animation: washFromRight 2s ease-out forwards, bob3 4.5s ease-in-out 2s infinite;
    }
    @keyframes washFromRight {
      0% { right: -120px; opacity: 0; transform: rotate(20deg); }
      60% { opacity: 1; transform: rotate(-5deg); }
      80% { right: 28%; transform: rotate(3deg); }
      100% { right: 25%; opacity: 1; transform: rotate(2deg); }
    }
    @keyframes bob3 {
      0%,100% { transform: rotate(2deg) translateY(0); }
      25% { transform: rotate(-1deg) translateY(-9px); }
      50% { transform: rotate(3deg) translateY(-5px); }
      75% { transform: rotate(-2deg) translateY(-11px); }
    }

    /* Hint */
    .hint {
      position: fixed;
      bottom: 16vh;
      left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,.5);
      font-size: .85rem;
      z-index: 12;
      animation: pulse 2s ease-in-out infinite;
      transition: opacity .5s;
      text-align: center;
      white-space: nowrap;
    }
    @keyframes pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }

    /* Cork flying off */
    .cork-pop {
      position: fixed;
      width: 20px; height: 14px;
      background: #F75708;
      border-radius: 3px 3px 6px 6px;
      z-index: 20;
      pointer-events: none;
      animation: corkFly .8s ease-out forwards;
    }
    @keyframes corkFly {
      0% { transform: translate(0,0) rotate(0); opacity:1; }
      100% { transform: translate(40px, -200px) rotate(180deg); opacity:0; }
    }

    /* Letter overlay */
    .letter-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity .5s;
    }
    .letter-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Paper card */
    .letter {
      width: 90%;
      max-width: 420px;
      opacity: 0;
      transform: translateY(40px) scale(.8) rotate(-5deg);
      transition: all .7s cubic-bezier(.34,1.56,.64,1);
    }
    .letter-overlay.visible .letter {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0);
    }
    .letter-inner {
      background: linear-gradient(145deg, #fdf6e3, #f5e6c8);
      border-radius: 14px;
      padding: 2rem 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.2);
    }
    .letter-inner::before {
      content:'';
      position: absolute; inset:0;
      background: repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(0,0,0,.03) 30px,rgba(0,0,0,.03) 31px);
      pointer-events: none;
    }
    .letter-inner::after {
      content:'';
      position: absolute; top:0; left:0; right:0;
      height: 3px;
      background: linear-gradient(90deg,#0c4a6e,#0ea5e9);
    }
    .letter-to {
      font-size: clamp(1.1rem,4.5vw,1.4rem);
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 1rem;
    }
    .letter-msg {
      font-size: clamp(.95rem,3.5vw,1.1rem);
      line-height: 1.8;
      color: #2c1810;
      font-style: italic;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .letter-count {
      font-size: .7rem;
      color: #8b7355;
      text-align: center;
      margin-top: 1rem;
      opacity: .6;
    }
    .letter-close {
      display: block;
      margin: 1.5rem auto 0;
      background: linear-gradient(135deg, #0c4a6e, #0ea5e9);
      color: #fff;
      border: none;
      padding: .75rem 2rem;
      border-radius: 10px;
      font-size: .9rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform .2s;
    }
    .letter-close:active { transform: scale(.95); }

    /* Fireflies */
    .firefly {
      position: fixed;
      border-radius: 50%;
      pointer-events: none;
      animation: fireflyFloat var(--fd) ease-in-out infinite;
      animation-delay: var(--fdd);
    }
    @keyframes fireflyFloat {
      0%,100% { transform: translate(0,0); opacity:.2; }
      25% { transform: translate(var(--fx),var(--fy)); opacity:.8; }
      50% { transform: translate(calc(var(--fx)*-0.5),calc(var(--fy)*1.5)); opacity:.4; }
      75% { transform: translate(calc(var(--fx)*0.8),calc(var(--fy)*-0.3)); opacity:.9; }
    }

    /* Confetti */
    #confetti { position: fixed; inset:0; pointer-events:none; z-index:200; }
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
      z-index: 15;
      animation: sparkUp 2s ease-out forwards;
    }
    @keyframes sparkUp {
      0% { opacity:1; transform: scale(1); }
      100% { opacity:0; transform: scale(0) translateY(-40px); }
    }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>

  <div class="moon">
    <div class="moon-crater"></div>
    <div class="moon-crater"></div>
    <div class="moon-crater"></div>
  </div>
  <div class="moon-reflect"></div>

  <!-- Sand beach -->
  <div class="sand">
    <div class="sand-ripple" style="top:25%;left:10%;width:60px;"></div>
    <div class="sand-ripple" style="top:50%;left:40%;width:80px;"></div>
    <div class="sand-ripple" style="top:70%;left:65%;width:50px;"></div>
    <div class="sand-ripple" style="top:35%;left:80%;width:45px;"></div>
  </div>

  <!-- Ocean waves -->
  <div class="ocean">
    <div class="wave"></div>
    <div class="wave"></div>
    <div class="wave"></div>
  </div>

  <!-- Bottle 1 (always visible) -->
  <div class="bottle-wrap" id="bottle1" onclick="openBottle(1)">
    \${BOTTLE_SVG}
  </div>

  <!-- Bottle 2 (extra - hidden until bottle 1 is closed) -->
  <div class="bottle-extra" id="bottle2" onclick="openBottle(2)">
    \${BOTTLE_SVG}
  </div>

  <!-- Bottle 3 (extra - hidden until bottle 2 is closed) -->
  <div class="bottle-extra" id="bottle3" onclick="openBottle(3)">
    \${BOTTLE_SVG}
  </div>

  <p class="hint" id="hint">
    <span style="display:inline-block;animation:pulse 1.2s ease-in-out infinite;">&#9757;</span>
    Tap the bottle
  </p>

  <!-- Letter overlay -->
  <div class="letter-overlay" id="overlay">
    <div class="letter">
      <div class="letter-inner">
        <p class="letter-to">Dear {{recipientName}},</p>
        <p class="letter-msg" id="letterMsg">{{customMessage}}</p>
        <p class="letter-count" id="letterCount"></p>
        <button class="letter-close" id="closeBtn" onclick="closeLetter()">Close</button>
      </div>
    </div>
  </div>

  <div id="confetti"></div>

  <script>
    var hasConfetti = '{{enableConfetti}}' === 'true';
    var hasSparkles = '{{enableSparkles}}' === 'true';
    var hasFireflies = '{{enableFireflies}}' === 'true';
    var hasExtraBottles = '{{enableExtraBottles}}' === 'true';
    var hasHaptics = 'vibrate' in navigator;

    var messages = [
      '{{customMessage}}',
      '{{customMessage2}}',
      '{{customMessage3}}'
    ];
    var totalBottles = hasExtraBottles ? 3 : 1;
    var currentBottle = 0; // 0-indexed: which bottle we are about to open
    var bottlesOpened = 0;

    // Generate stars
    (function() {
      var el = document.getElementById('stars');
      for (var i = 0; i < 120; i++) {
        var s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random()*100+'%';
        s.style.top = Math.random()*55+'%';
        var sz = (1 + Math.random()*2.5)+'px';
        s.style.width = sz; s.style.height = sz;
        s.style.setProperty('--dur', (2+Math.random()*4)+'s');
        s.style.setProperty('--del', (Math.random()*5)+'s');
        el.appendChild(s);
      }
    })();

    // Fireflies addon
    if (hasFireflies) {
      for (var i = 0; i < 15; i++) {
        var f = document.createElement('div');
        f.className = 'firefly';
        f.style.left = (10+Math.random()*80)+'%';
        f.style.top = (5+Math.random()*50)+'%';
        var sz = (3+Math.random()*4)+'px';
        f.style.width = sz; f.style.height = sz;
        f.style.background = ['rgba(254,243,199,.7)','rgba(234,179,8,.6)','rgba(253,224,71,.5)'][Math.floor(Math.random()*3)];
        f.style.boxShadow = '0 0 6px rgba(254,243,199,.4)';
        f.style.setProperty('--fd', (4+Math.random()*6)+'s');
        f.style.setProperty('--fdd', (Math.random()*5)+'s');
        f.style.setProperty('--fx', ((Math.random()-.5)*80)+'px');
        f.style.setProperty('--fy', ((Math.random()-.5)*60)+'px');
        document.body.appendChild(f);
      }
    }

    // Sparkles around active bottle
    if (hasSparkles) {
      setInterval(function() {
        var id = 'bottle' + (currentBottle + 1);
        var el = document.getElementById(id);
        if (!el || el.classList.contains('opened')) return;
        var r = el.getBoundingClientRect();
        if (r.width === 0) return;
        var s = document.createElement('div');
        s.className = 'spark';
        s.style.left = (r.left + Math.random()*r.width)+'px';
        s.style.top = (r.top + Math.random()*r.height)+'px';
        var sz = (3+Math.random()*5)+'px';
        s.style.width = sz; s.style.height = sz;
        s.style.background = ['#0ea5e9','#38bdf8','#fef3c7','#fff'][Math.floor(Math.random()*4)];
        document.body.appendChild(s);
        setTimeout(function() { s.remove(); }, 2000);
      }, 350);
    }

    function popCork(bottleEl) {
      var r = bottleEl.getBoundingClientRect();
      var cork = document.createElement('div');
      cork.className = 'cork-pop';
      cork.style.left = (r.left + r.width/2 - 10) + 'px';
      cork.style.top = (r.top) + 'px';
      document.body.appendChild(cork);
      setTimeout(function() { cork.remove(); }, 900);
    }

    function openBottle(num) {
      if (num !== currentBottle + 1) return; // Only allow opening the current bottle in sequence

      var bottleEl = document.getElementById('bottle' + num);
      if (!bottleEl || bottleEl.classList.contains('opened')) return;

      if (hasHaptics) navigator.vibrate([20,20,40]);

      // Pop cork
      popCork(bottleEl);

      // Mark bottle as opened visually
      bottleEl.classList.add('opened');
      bottlesOpened++;

      // Hide hint
      document.getElementById('hint').style.opacity = '0';

      // Update letter content
      var msg = messages[num - 1] || '';
      document.getElementById('letterMsg').textContent = msg;

      // Show bottle count if extra bottles
      if (totalBottles > 1) {
        document.getElementById('letterCount').textContent = 'Bottle ' + num + ' of ' + totalBottles;
      }

      // Show letter after cork pops
      setTimeout(function() {
        document.getElementById('overlay').classList.add('visible');
        if (hasConfetti) launchConfetti();
      }, 500);
    }

    function closeLetter() {
      document.getElementById('overlay').classList.remove('visible');

      // If extra bottles enabled and there are more bottles, wash the next one ashore
      if (hasExtraBottles && bottlesOpened < totalBottles) {
        currentBottle = bottlesOpened;
        var nextNum = currentBottle + 1;

        setTimeout(function() {
          var nextBottle = document.getElementById('bottle' + nextNum);
          if (!nextBottle) return;

          // Alternate wash direction
          if (nextNum === 2) {
            nextBottle.classList.add('wash-left');
          } else {
            nextBottle.classList.add('wash-right');
          }
          nextBottle.style.pointerEvents = 'auto';

          // Show hint for next bottle
          setTimeout(function() {
            var hint = document.getElementById('hint');
            hint.textContent = nextNum === 2 ? 'Another bottle washed ashore!' : 'One more bottle!';
            hint.style.opacity = '1';
          }, 1200);
        }, 600);
      }
    }

    function launchConfetti() {
      var colors = ['#0ea5e9','#38bdf8','#a855f7','#ec4899','#22c55e','#fef3c7','#f97316'];
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
  console.log('Upgrading Message in a Bottle template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Message in a Bottle'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedBottle,
        description: 'A bottle floating on a moonlit ocean with sandy beach. Tap to uncork and read the letter inside. Add extra bottles that wash ashore with their own messages!',
      })
      .where(eq(templates.name, 'Message in a Bottle'));
    console.log('Updated Message in a Bottle template');
  } else {
    console.log('Message in a Bottle template not found');
  }

  process.exit(0);
}

main().catch(console.error);
