import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';

async function seedTemplates() {
  console.log('🌱 Seeding templates...');

  // Template 1: Simple Valentine
  const valentine = await db.insert(templates).values({
    name: 'Simple Valentine',
    description: 'A sweet and playful Valentine\'s Day message with interactive buttons',
    occasion: ['valentines'],
    thumbnailUrl: '',
    basePrice: '3.99',
    htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valentine for {{recipientName}}</title>
</head>
<body>
  <div class="container">
    <div class="heart">💖</div>
    <h1>Hey {{recipientName}}!</h1>
    <p class="message">{{customMessage}}</p>
    <button class="yes-btn" onclick="handleYes()">Yes! 😍</button>
    <button class="no-btn" id="noBtn" onclick="handleNo()">No 😢</button>
    <div class="result" id="result"></div>
  </div>
</body>
</html>`,
    cssTemplate: `body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.2);
  max-width: 500px;
  position: relative;
}

.heart {
  font-size: 4rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

h1 {
  color: #e91e63;
  font-size: 2.5rem;
  margin: 1rem 0;
}

.message {
  font-size: 1.2rem;
  color: #555;
  margin: 2rem 0;
  line-height: 1.6;
}

button {
  font-size: 1.1rem;
  padding: 1rem 2rem;
  margin: 0.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
}

.yes-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.yes-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.no-btn {
  background: #f0f0f0;
  color: #666;
  position: relative;
}

.no-btn:hover {
  transform: translateY(2px);
}

.result {
  margin-top: 2rem;
  font-size: 1.5rem;
  min-height: 2rem;
}`,
    jsTemplate: `let noClickCount = 0;

function handleYes() {
  const result = document.getElementById('result');
  result.textContent = '🎉 Yay! I knew it! 💕';
  result.style.color = '#e91e63';
  
  // Hide buttons
  document.querySelector('.yes-btn').style.display = 'none';
  document.getElementById('noBtn').style.display = 'none';
  
  // Confetti effect
  for (let i = 0; i < 50; i++) {
    setTimeout(() => createConfetti(), i * 30);
  }
}

function handleNo() {
  noClickCount++;
  const noBtn = document.getElementById('noBtn');
  const container = document.querySelector('.container');
  
  if (noClickCount < 3) {
    // Move button to random position
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    
    const maxX = containerRect.width - btnRect.width - 40;
    const maxY = containerRect.height - btnRect.height - 40;
    
    const randomX = Math.random() * maxX + 20;
    const randomY = Math.random() * maxY + 20;
    
    noBtn.style.position = 'absolute';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
  } else {
    // After 3 clicks, just trigger yes
    handleYes();
  }
}

function createConfetti() {
  const confetti = document.createElement('div');
  confetti.textContent = ['💖', '💕', '💝', '💗', '💓'][Math.floor(Math.random() * 5)];
  confetti.style.position = 'fixed';
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-50px';
  confetti.style.fontSize = '2rem';
  confetti.style.animation = 'fall 3s linear';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '1000';
  
  document.body.appendChild(confetti);
  
  setTimeout(() => confetti.remove(), 3000);
}

// Add fall animation
const style = document.createElement('style');
style.textContent = \`
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
\`;
document.head.appendChild(style);`,
    isActive: true,
  }).returning();

  console.log('✅ Created: Simple Valentine');

  // Template 2: Birthday Celebration
  const birthday = await db.insert(templates).values({
    name: 'Birthday Bash',
    description: 'A colorful birthday celebration with balloons and surprises',
    occasion: ['birthday'],
    thumbnailUrl: '',
    basePrice: '3.99',
    htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy Birthday {{recipientName}}!</title>
</head>
<body>
  <div class="container">
    <div class="balloons">
      <span class="balloon">🎈</span>
      <span class="balloon">🎈</span>
      <span class="balloon">🎈</span>
    </div>
    <h1>Happy Birthday {{recipientName}}! 🎂</h1>
    <p class="message">{{customMessage}}</p>
    <button class="cake-btn" onclick="blowCandles()">🎂 Blow the Candles!</button>
    <div class="celebration" id="celebration"></div>
  </div>
</body>
</html>`,
    cssTemplate: `body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.3);
  max-width: 500px;
}

.balloons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.balloon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

.balloon:nth-child(1) { animation-delay: 0s; }
.balloon:nth-child(2) { animation-delay: 0.5s; }
.balloon:nth-child(3) { animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin: 1rem 0;
}

.message {
  font-size: 1.2rem;
  color: #555;
  margin: 2rem 0;
  line-height: 1.6;
}

.cake-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.cake-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(245, 87, 108, 0.4);
}

.celebration {
  margin-top: 2rem;
  font-size: 1.5rem;
  min-height: 2rem;
}`,
    jsTemplate: `function blowCandles() {
  const celebration = document.getElementById('celebration');
  celebration.textContent = '🎉 Woohoo! Make a wish! 🎊';
  celebration.style.color = '#667eea';
  
  document.querySelector('.cake-btn').style.display = 'none';
  
  // Create confetti
  for (let i = 0; i < 100; i++) {
    setTimeout(() => createConfetti(), i * 20);
  }
  
  // Play sound effect (silent for now, but structure is here)
  console.log('🎵 Happy Birthday music playing!');
}

function createConfetti() {
  const emojis = ['🎉', '🎊', '🎈', '🎂', '🎁', '⭐', '✨'];
  const confetti = document.createElement('div');
  confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  confetti.style.position = 'fixed';
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-50px';
  confetti.style.fontSize = '2rem';
  confetti.style.animation = 'fall 4s linear';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '1000';
  
  document.body.appendChild(confetti);
  
  setTimeout(() => confetti.remove(), 4000);
}

const style = document.createElement('style');
style.textContent = \`
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
\`;
document.head.appendChild(style);`,
    isActive: true,
  }).returning();

  console.log('✅ Created: Birthday Bash');

  // Template 3: Thank You Card
  const thankYou = await db.insert(templates).values({
    name: 'Thank You Card',
    description: 'A heartfelt thank you message with elegant design',
    occasion: ['thank-you', 'just-because'],
    thumbnailUrl: '',
    basePrice: '2.99',
    htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You {{recipientName}}!</title>
</head>
<body>
  <div class="container">
    <div class="icon">🙏</div>
    <h1>Thank You {{recipientName}}!</h1>
    <p class="message">{{customMessage}}</p>
    <div class="signature">With gratitude ✨</div>
  </div>
</body>
</html>`,
    cssTemplate: `body {
  margin: 0;
  padding: 0;
  font-family: 'Georgia', serif;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  text-align: center;
  background: white;
  padding: 4rem 3rem;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  max-width: 500px;
  border: 2px solid #fcb69f;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

h1 {
  color: #d35400;
  font-size: 2.5rem;
  margin: 1rem 0;
  font-weight: normal;
}

.message {
  font-size: 1.3rem;
  color: #555;
  margin: 2rem 0;
  line-height: 1.8;
  font-style: italic;
}

.signature {
  margin-top: 3rem;
  font-size: 1.1rem;
  color: #888;
  font-family: 'Brush Script MT', cursive;
}`,
    jsTemplate: `// Add a subtle sparkle effect
setInterval(() => {
  createSparkle();
}, 500);

function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.textContent = '✨';
  sparkle.style.position = 'fixed';
  sparkle.style.left = Math.random() * 100 + 'vw';
  sparkle.style.top = Math.random() * 100 + 'vh';
  sparkle.style.fontSize = '1rem';
  sparkle.style.animation = 'sparkle 2s ease-out';
  sparkle.style.pointerEvents = 'none';
  sparkle.style.zIndex = '1000';
  
  document.body.appendChild(sparkle);
  
  setTimeout(() => sparkle.remove(), 2000);
}

const style = document.createElement('style');
style.textContent = \`
  @keyframes sparkle {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
  }
\`;
document.head.appendChild(style);`,
    isActive: true,
  }).returning();

  console.log('✅ Created: Thank You Card');

  console.log('\n🎉 Successfully seeded 3 templates!');
  process.exit(0);
}

seedTemplates().catch((error) => {
  console.error('❌ Error seeding templates:', error);
  process.exit(1);
});
