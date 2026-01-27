import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Helper to upsert template by name
async function upsertTemplate(data: {
  name: string;
  description: string;
  occasion: string[];
  basePrice: string;
  htmlTemplate: string;
  cssTemplate?: string;
  jsTemplate?: string;
}) {
  const existing = await db.select().from(templates).where(eq(templates.name, data.name));
  
  if (existing.length > 0) {
    await db.update(templates)
      .set({
        description: data.description,
        occasion: data.occasion,
        basePrice: data.basePrice,
        htmlTemplate: data.htmlTemplate,
        cssTemplate: data.cssTemplate || '',
        jsTemplate: data.jsTemplate || '',
        updatedAt: new Date(),
      })
      .where(eq(templates.name, data.name));
    console.log(`  ✓ Updated: ${data.name}`);
  } else {
    await db.insert(templates).values({
      name: data.name,
      description: data.description,
      occasion: data.occasion,
      thumbnailUrl: '',
      basePrice: data.basePrice,
      htmlTemplate: data.htmlTemplate,
      cssTemplate: data.cssTemplate || '',
      jsTemplate: data.jsTemplate || '',
      isActive: true,
    });
    console.log(`  ✓ Created: ${data.name}`);
  }
}

// ============================================================
// TEMPLATE 1: Yes/No Question - ENHANCED
// ============================================================
const yesNoTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Question for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
      position: relative;
    }
    /* Ambient background glow */
    .bg-glow {
      position: fixed;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.15;
      pointer-events: none;
      animation: drift 20s ease-in-out infinite;
    }
    .glow-1 { background: #a855f7; top: -200px; left: -200px; animation-delay: 0s; }
    .glow-2 { background: #ec4899; bottom: -200px; right: -200px; animation-delay: 5s; }
    .glow-3 { background: #3b82f6; top: 50%; left: 50%; animation-delay: 10s; }
    @keyframes drift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(50px, -30px) scale(1.1); }
      66% { transform: translate(-30px, 50px) scale(0.9); }
    }
    .container { 
      text-align: center; 
      position: relative; 
      z-index: 1;
      animation: fadeIn 0.8s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    h1 { 
      font-size: 2.5rem; 
      font-weight: 700; 
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 40px rgba(168, 85, 247, 0.3);
    }
    .question { 
      font-size: 1.5rem; 
      color: #888; 
      margin-bottom: 3rem; 
      line-height: 1.6;
    }
    .buttons { display: flex; gap: 1.5rem; justify-content: center; margin-top: 2rem; }
    button {
      padding: 1rem 2.5rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    button:hover::before {
      width: 300px;
      height: 300px;
    }
    #yes-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #fff;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
    }
    #yes-btn:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(34, 197, 94, 0.5); }
    #no-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      min-width: 120px;
    }
    #no-btn:hover { transform: scale(1.05); }
    .prompt { color: #555; font-size: 0.9rem; margin-top: 1.5rem; min-height: 1.5rem; }
    .victory {
      display: none;
      font-size: 3rem;
      animation: celebrate 0.8s ease-out;
    }
    @keyframes celebrate {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      background: #a855f7;
      animation: fall 3s linear;
      pointer-events: none;
    }
    @keyframes fall {
      to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="bg-glow glow-1"></div>
  <div class="bg-glow glow-2"></div>
  <div class="bg-glow glow-3"></div>
  
  <div class="container" id="container">
    <h1>Hey {{recipientName}}</h1>
    <p class="question">{{customMessage}}</p>
    <div class="buttons">
      <button id="yes-btn">Yes</button>
      <button id="no-btn">No</button>
    </div>
    <p class="prompt" id="prompt">Choose wisely...</p>
    <div class="victory" id="victory">🎉</div>
  </div>

  <script>
    let noClickCount = 0;
    const prompts = [
      "Choose wisely...",
      "Are you sure about that?",
      "Think about it...",
      "Really?",
      "The other button looks better",
      "Come on...",
      "Just click Yes already",
      "Pretty please?",
      "I'll wait...",
      "You know you want to",
      "The Yes button is getting bigger...",
      "Last chance!"
    ];

    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const prompt = document.getElementById('prompt');
    const victory = document.getElementById('victory');

    noBtn.addEventListener('click', () => {
      noClickCount++;
      if (noClickCount >= prompts.length) noClickCount = prompts.length - 1;
      
      prompt.textContent = prompts[noClickCount];
      
      // Make No button jump around after 3 clicks
      if (noClickCount > 2) {
        const x = Math.random() * (window.innerWidth - 200) - (window.innerWidth / 2 - 100);
        const y = Math.random() * (window.innerHeight - 100) - (window.innerHeight / 2 - 50);
        noBtn.style.position = 'fixed';
        noBtn.style.left = '50%';
        noBtn.style.top = '50%';
        noBtn.style.transform = \`translate(\${x}px, \${y}px)\`;
      }
      
      // Make Yes button grow
      if (noClickCount > 4) {
        const scale = 1 + (noClickCount - 4) * 0.15;
        yesBtn.style.transform = \`scale(\${scale})\`;
      }
    });

    yesBtn.addEventListener('click', () => {
      // Hide everything
      document.querySelector('.question').style.display = 'none';
      document.querySelector('.buttons').style.display = 'none';
      prompt.style.display = 'none';
      victory.style.display = 'block';
      
      // Confetti
      const colors = ['#a855f7', '#ec4899', '#3b82f6', '#22c55e', '#eab308'];
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const c = document.createElement('div');
          c.className = 'confetti';
          c.style.left = Math.random() * 100 + 'vw';
          c.style.background = colors[Math.floor(Math.random() * colors.length)];
          c.style.animationDelay = Math.random() * 0.3 + 's';
          document.body.appendChild(c);
          setTimeout(() => c.remove(), 3000);
        }, i * 30);
      }
    });
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 2: Countdown Timer - FIXED with separate date field
// ============================================================
const countdownTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counting down for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
      position: relative;
    }
    /* Animated gradient background */
    .bg-gradient {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at top, rgba(168, 85, 247, 0.1), transparent 50%),
                  radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.1), transparent 50%);
      pointer-events: none;
    }
    .container { text-align: center; padding: 2rem; position: relative; z-index: 1; }
    h1 { 
      font-size: 1.2rem; 
      color: #888; 
      margin-bottom: 0.5rem; 
      letter-spacing: 0.1em; 
      text-transform: uppercase;
    }
    .event-name {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #a855f7, #ec4899);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 3rem;
      animation: gradientShift 6s ease infinite;
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .countdown { 
      display: flex; 
      gap: 1.5rem; 
      justify-content: center; 
      margin-bottom: 3rem;
    }
    .unit {
      background: rgba(22, 22, 31, 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      min-width: 90px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .unit:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2);
    }
    .number {
      font-size: 3rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
    }
    .label { 
      font-size: 0.75rem; 
      color: #666; 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      margin-top: 0.5rem; 
    }
    .message { 
      color: #888; 
      font-size: 1.1rem; 
      line-height: 1.6; 
      max-width: 500px; 
      margin: 0 auto; 
    }
    .particle {
      position: fixed;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      pointer-events: none;
      animation: drift 10s linear infinite;
      opacity: 0;
    }
    @keyframes drift {
      0% { transform: translateY(100vh) rotate(0deg) scale(0); opacity: 0; }
      10% { opacity: 0.4; transform: scale(1); }
      90% { opacity: 0.4; }
      100% { transform: translateY(-20px) rotate(360deg) scale(0); opacity: 0; }
    }
    .revealed .countdown { display: none; }
    .revealed .message { display: none; }
    .reveal-message { 
      display: none;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #22c55e, #14b8a6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: celebrate 1s ease-out;
    }
    .revealed .reveal-message { display: block; }
    @keyframes celebrate {
      0% { transform: scale(0) rotate(-5deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(2deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
    @media (max-width: 600px) {
      .countdown { gap: 0.75rem; flex-wrap: wrap; }
      .unit { min-width: 70px; padding: 1rem 0.75rem; }
      .number { font-size: 2rem; }
      .event-name { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  
  <div class="container" id="container">
    <h1>Hey {{recipientName}}</h1>
    <p class="event-name">{{eventName}}</p>
    <div class="countdown">
      <div class="unit"><div class="number" id="days">00</div><div class="label">Days</div></div>
      <div class="unit"><div class="number" id="hours">00</div><div class="label">Hours</div></div>
      <div class="unit"><div class="number" id="minutes">00</div><div class="label">Minutes</div></div>
      <div class="unit"><div class="number" id="seconds">00</div><div class="label">Seconds</div></div>
    </div>
    <div class="reveal-message">The wait is over!</div>
    <p class="message">{{customMessage}}</p>
  </div>

  <script>
    // Parse the target date - format: YYYY-MM-DD or YYYY-MM-DDTHH:mm
    const targetDateStr = '{{targetDate}}';
    let targetDate;
    
    if (targetDateStr && targetDateStr !== '{{targetDate}}') {
      targetDate = new Date(targetDateStr).getTime();
    }
    
    // Fallback to 7 days from now if invalid date
    if (!targetDate || isNaN(targetDate)) {
      targetDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
    }

    // Create animated particles
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.animationDuration = (8 + Math.random() * 6) + 's';
      p.style.width = p.style.height = (4 + Math.random() * 6) + 'px';
      document.body.appendChild(p);
    }

    function update() {
      const now = Date.now();
      const diff = targetDate - now;
      
      if (diff <= 0) { 
        document.getElementById('container').classList.add('revealed'); 
        return; 
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = String(d).padStart(2, '0');
      document.getElementById('hours').textContent = String(h).padStart(2, '0');
      document.getElementById('minutes').textContent = String(m).padStart(2, '0');
      document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 3: Wrapped - WITH CUSTOMIZABLE CATEGORIES
// ============================================================
const wrappedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{recipientName}}'s Wrapped</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #fff;
      overflow: hidden;
      touch-action: pan-y;
    }
    .container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .slides {
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 80vh;
      perspective: 1000px;
    }
    .slide {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1e1e2a, #16161f);
      border-radius: 24px;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      opacity: 0;
      transform: translateX(100%) rotateY(20deg);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.05);
    }
    .slide.active {
      opacity: 1;
      transform: translateX(0) rotateY(0);
      z-index: 2;
    }
    .slide.prev {
      opacity: 0;
      transform: translateX(-100%) rotateY(-20deg);
      z-index: 1;
    }
    .emoji { font-size: 4rem; margin-bottom: 2rem; animation: bounce 1s ease-in-out infinite; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .category {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 1rem;
    }
    .big-number {
      font-size: 5rem;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(135deg, #a855f7, #ec4899, #f97316);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      animation: gradientShift 6s ease infinite;
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    .label {
      font-size: 1.5rem;
      font-weight: 600;
      color: #e5e5e5;
      margin-bottom: 0.5rem;
    }
    .description {
      font-size: 1rem;
      color: #888;
      line-height: 1.6;
      max-width: 400px;
    }
    .progress {
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 10;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transition: all 0.3s;
    }
    .dot.active {
      width: 24px;
      border-radius: 4px;
      background: #a855f7;
    }
    .nav {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
      z-index: 10;
    }
    button {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(168, 85, 247, 0.5); }
    button:disabled { opacity: 0.3; cursor: not-allowed; }
    @media (max-width: 600px) {
      .big-number { font-size: 3.5rem; }
      .label { font-size: 1.2rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="progress" id="progress"></div>
    <div class="slides" id="slides"></div>
    <div class="nav">
      <button id="prev" onclick="prevSlide()">Previous</button>
      <button id="next" onclick="nextSlide()">Next</button>
    </div>
  </div>

  <script>
    // Wrapped data - customizable via template variables
    const wrappedData = [
      {
        emoji: '👋',
        category: 'Hello',
        bigNumber: '',
        label: 'Hey {{recipientName}}',
        description: "Let's look back at some special moments..."
      },
      {
        emoji: '{{category1Emoji}}',
        category: '{{category1Name}}',
        bigNumber: '{{category1Number}}',
        label: '{{category1Label}}',
        description: '{{category1Description}}'
      },
      {
        emoji: '{{category2Emoji}}',
        category: '{{category2Name}}',
        bigNumber: '{{category2Number}}',
        label: '{{category2Label}}',
        description: '{{category2Description}}'
      },
      {
        emoji: '{{category3Emoji}}',
        category: '{{category3Name}}',
        bigNumber: '{{category3Number}}',
        label: '{{category3Label}}',
        description: '{{category3Description}}'
      },
      {
        emoji: '{{category4Emoji}}',
        category: '{{category4Name}}',
        bigNumber: '{{category4Number}}',
        label: '{{category4Label}}',
        description: '{{category4Description}}'
      },
      {
        emoji: '💝',
        category: 'Final Message',
        bigNumber: '',
        label: '',
        description: '{{customMessage}}'
      }
    ];

    let currentSlide = 0;
    const slidesContainer = document.getElementById('slides');
    const progressContainer = document.getElementById('progress');

    // Create slides
    wrappedData.forEach((data, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i === 0 ? ' active' : '');
      slide.innerHTML = \`
        <div class="emoji">\${data.emoji || '✨'}</div>
        \${data.category ? \`<div class="category">\${data.category}</div>\` : ''}
        \${data.bigNumber ? \`<div class="big-number">\${data.bigNumber}</div>\` : ''}
        \${data.label ? \`<div class="label">\${data.label}</div>\` : ''}
        <div class="description">\${data.description}</div>
      \`;
      slidesContainer.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      progressContainer.appendChild(dot);
    });

    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    function updateSlide() {
      slides.forEach((s, i) => {
        s.className = 'slide';
        if (i === currentSlide) s.classList.add('active');
        else if (i < currentSlide) s.classList.add('prev');
      });
      dots.forEach((d, i) => {
        d.className = 'dot';
        if (i === currentSlide) d.classList.add('active');
      });
      document.getElementById('prev').disabled = currentSlide === 0;
      document.getElementById('next').disabled = currentSlide === slides.length - 1;
    }

    function nextSlide() {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        updateSlide();
      }
    }

    // Swipe support
    let startX = 0;
    slidesContainer.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    slidesContainer.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) nextSlide();
      else if (endX - startX > 50) prevSlide();
    });

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    });
  </script>
</body>
</html>`;

// Continue with more templates...
async function seedAll() {
  console.log('🌱 Seeding all enhanced templates...\n');

  await upsertTemplate({
    name: 'Yes or No',
    description: 'A fun interactive question with a runaway "No" button and growing "Yes" button. Perfect for playful questions!',
    occasion: ['valentines', 'friendship', 'just-because', 'birthday', 'anniversary'],
    basePrice: '1.99',
    htmlTemplate: yesNoTemplate,
  });

  await upsertTemplate({
    name: 'Countdown Timer',
    description: 'Beautiful countdown to any date with particle effects and reveal message. Great for birthdays, events, or special moments.',
    occasion: ['birthday', 'anniversary', 'congratulations', 'just-because'],
    basePrice: '1.99',
    htmlTemplate: countdownTemplate,
  });

  await upsertTemplate({
    name: 'Wrapped',
    description: 'Spotify Wrapped-style swipeable story cards. Customize up to 5 categories with your own stats, emojis, and messages.',
    occasion: ['friendship', 'birthday', 'thank-you', 'congratulations', 'just-because', 'anniversary'],
    basePrice: '2.99',
    htmlTemplate: wrappedTemplate,
  });

  console.log('\n✅ All templates seeded successfully!');
  process.exit(0);
}

seedAll().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
