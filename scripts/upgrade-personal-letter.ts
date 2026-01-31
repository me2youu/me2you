import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Deactivate the old Thank You Card template (can't delete due to FK on gifts)
async function deactivateThankYouCard() {
  const existing = await db
    .select({ id: templates.id })
    .from(templates)
    .where(eq(templates.name, 'Thank You Card'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({ isActive: false })
      .where(eq(templates.name, 'Thank You Card'));
    console.log('Deactivated Thank You Card template');
  } else {
    console.log('Thank You Card not found (already removed)');
  }
}

// Upgraded Personal Letter template (was "Love Letter")
const personalLetterTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>A Letter for {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Caveat:wght@500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Playfair Display', Georgia, serif;
      background: #fef9f3;
      color: #2c2c2c;
      min-height: 100vh;
      transition: background 3s ease;
      -webkit-font-smoothing: antialiased;
    }
    
    .letter-container {
      max-width: 680px;
      margin: 0 auto;
      padding: 2rem 1.2rem 4rem;
    }
    
    .date {
      font-family: 'Caveat', cursive;
      font-size: 1.2rem;
      color: #a08060;
      margin-bottom: 1.5rem;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 1s ease forwards;
    }
    
    .salutation {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 1s ease 0.3s forwards;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .salutation span {
      background: linear-gradient(120deg, #e8b4b8 0%, #e8b4b8 100%);
      background-repeat: no-repeat;
      background-size: 100% 40%;
      background-position: 0 90%;
    }
    
    .paragraph {
      font-size: 1rem;
      line-height: 1.9;
      margin-bottom: 1.5rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .paragraph.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .highlight {
      background: linear-gradient(120deg, #ffd700 0%, #ffd700 100%);
      background-repeat: no-repeat;
      background-size: 0% 40%;
      background-position: 0 90%;
      cursor: pointer;
      transition: background-size 0.4s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .highlight:hover,
    .highlight.clicked {
      background-size: 100% 40%;
    }
    
    .signature {
      font-family: 'Caveat', cursive;
      font-size: 1.8rem;
      margin-top: 2.5rem;
      opacity: 0;
      transform: translateY(20px) rotate(-2deg);
      transition: all 1s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .signature.visible {
      opacity: 1;
      transform: translateY(0) rotate(-2deg);
    }
    
    .ps {
      font-style: italic;
      font-size: 0.95rem;
      color: #666;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0d5c8;
      opacity: 0;
      transform: translateY(10px);
      transition: all 1s ease 0.3s;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .ps.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Floating particles on highlight click */
    .float-particle {
      position: fixed;
      pointer-events: none;
      font-size: 1.5rem;
      animation: floatUp 2s ease-out forwards;
      z-index: 100;
    }
    
    @keyframes fadeUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes floatUp {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
    }
    
    /* Progress bar */
    .progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #e8b4b8, #d4a574);
      width: 0%;
      transition: width 0.2s ease;
      z-index: 100;
    }
    
    /* Paper texture overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 1000;
    }
    
    /* Desktop */
    @media (min-width: 640px) {
      .letter-container {
        padding: 4rem 2.5rem 6rem;
      }
      .date { font-size: 1.3rem; margin-bottom: 2rem; }
      .salutation { font-size: 1.8rem; margin-bottom: 2rem; }
      .paragraph { font-size: 1.15rem; line-height: 2; margin-bottom: 2rem; }
      .signature { font-size: 2rem; margin-top: 3rem; }
      .ps { font-size: 1rem; margin-top: 2rem; }
    }
  </style>
</head>
<body>
  <div class="progress" id="progress"></div>
  
  <div class="letter-container">
    <div class="date">{{letterDate}}</div>
    
    <div class="salutation">
      My dearest <span>{{recipientName}}</span>,
    </div>
    
    <p class="paragraph" data-delay="0">
      {{paragraph1}}
    </p>
    
    <p class="paragraph" data-delay="1">
      {{paragraph2}}
    </p>
    
    <p class="paragraph" data-delay="2">
      There are moments when I think of you and <span class="highlight" data-emoji="&#10024;">{{highlight1}}</span>. 
      It's in the small things - the way you {{highlight2}}, how you always {{highlight3}}.
    </p>
    
    <p class="paragraph" data-delay="3">
      {{paragraph3}}
    </p>
    
    <p class="paragraph" data-delay="4">
      If I could tell you one thing, it would be this: <span class="highlight" data-emoji="&#128156;">{{highlight4}}</span>
    </p>
    
    <p class="paragraph" data-delay="5">
      {{paragraph4}}
    </p>
    
    <div class="signature">
      Forever yours,<br>
      {{senderName}}
    </div>
    
    <p class="ps">
      P.S. {{customMessage}}
    </p>
  </div>
  
  <script>
    // Intersection Observer for scroll animations
    var sections = document.querySelectorAll('.paragraph, .signature, .ps');
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var delay = (entry.target.dataset.delay || 0) * 100;
          setTimeout(function() {
            entry.target.classList.add('visible');
          }, delay);
          // Stop observing once visible
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    
    sections.forEach(function(el) { observer.observe(el); });
    
    // Also make P.S. visible after a delay as fallback
    // (in case it's too short to hit threshold at page bottom)
    setTimeout(function() {
      var ps = document.querySelector('.ps');
      if (ps) ps.classList.add('visible');
    }, 4000);
    
    // Background color transition on scroll
    window.addEventListener('scroll', function() {
      var h = document.body.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = window.scrollY / h;
      
      document.getElementById('progress').style.width = (pct * 100) + '%';
      
      var r = Math.round(254 - (pct * 30));
      var g = Math.round(249 - (pct * 50));
      var b = Math.round(243 + (pct * 20));
      document.body.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
    });
    
    // Highlight click effects
    document.querySelectorAll('.highlight').forEach(function(el) {
      el.addEventListener('click', function(e) {
        el.classList.add('clicked');
        var emoji = el.dataset.emoji || '&#10024;';
        for (var i = 0; i < 5; i++) {
          var p = document.createElement('div');
          p.className = 'float-particle';
          p.innerHTML = emoji;
          p.style.left = (e.clientX + (Math.random() - 0.5) * 40) + 'px';
          p.style.top = e.clientY + 'px';
          document.body.appendChild(p);
          setTimeout(function(el) { el.remove(); }, 2000, p);
        }
      });
    });
  </script>
</body>
</html>`;

async function main() {
  // 1. Deactivate Thank You Card
  await deactivateThankYouCard();

  // 2. Rename + upgrade Love Letter → Personal Letter
  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Love Letter'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        name: 'Personal Letter',
        htmlTemplate: personalLetterTemplate,
        description: 'A beautifully typeset personal letter with scroll animations, background transitions, and interactive highlights. Perfect for any heartfelt message.',
        occasion: ['valentines', 'anniversary', 'love', 'just-because', 'thank-you', 'friendship', 'apology', 'miss-you'],
      })
      .where(eq(templates.name, 'Love Letter'));
    console.log('Renamed Love Letter → Personal Letter and upgraded template');
  } else {
    // Maybe already renamed
    const renamed = await db
      .select()
      .from(templates)
      .where(eq(templates.name, 'Personal Letter'));
    if (renamed.length > 0) {
      await db
        .update(templates)
        .set({
          htmlTemplate: personalLetterTemplate,
          description: 'A beautifully typeset personal letter with scroll animations, background transitions, and interactive highlights. Perfect for any heartfelt message.',
          occasion: ['valentines', 'anniversary', 'love', 'just-because', 'thank-you', 'friendship', 'apology', 'miss-you'],
        })
        .where(eq(templates.name, 'Personal Letter'));
      console.log('Updated existing Personal Letter template');
    } else {
      console.log('Love Letter / Personal Letter template not found');
    }
  }

  process.exit(0);
}

main().catch(console.error);
