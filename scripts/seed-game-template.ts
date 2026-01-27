import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';

const gameTemplate = {
  name: 'Memory Room Adventure',
  description: 'An 8-bit pixel art game where your special someone explores a room filled with your memories, photos, and love messages. Walk around, discover surprises, and find the final treasure!',
  occasion: ['valentines', 'birthday', 'anniversary', 'just-because'],
  thumbnailUrl: '',
  basePrice: '4.99',
  htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Special Place for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      background: #1a1a2e;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Press Start 2P', monospace;
      overflow: hidden;
    }
    
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    .game-container {
      position: relative;
      border: 4px solid #ff6b9d;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(255, 107, 157, 0.5);
    }
    
    #gameCanvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
    
    .instructions {
      color: #ff6b9d;
      font-size: 10px;
      margin-top: 20px;
      text-align: center;
      line-height: 2;
    }
    
    .instructions span {
      background: #2d2d44;
      padding: 5px 10px;
      border-radius: 4px;
      margin: 0 5px;
    }
    
    /* Popup Overlay */
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .popup-overlay.active {
      display: flex;
    }
    
    .popup {
      background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
      border: 4px solid #ff6b9d;
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      text-align: center;
      animation: popIn 0.3s ease-out;
    }
    
    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .popup h2 {
      color: #ff6b9d;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .popup p {
      color: #fff;
      font-size: 11px;
      line-height: 2;
      margin-bottom: 20px;
    }
    
    .popup img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      border: 3px solid #ff6b9d;
      margin-bottom: 20px;
    }
    
    .popup button {
      background: #ff6b9d;
      color: #fff;
      border: none;
      padding: 12px 30px;
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .popup button:hover {
      background: #ff8fb3;
      transform: scale(1.05);
    }
    
    /* Start Screen */
    .start-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    
    .start-screen.hidden {
      display: none;
    }
    
    .start-screen h1 {
      color: #ff6b9d;
      font-size: 20px;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(255, 107, 157, 0.5);
    }
    
    .start-screen .subtitle {
      color: #fff;
      font-size: 12px;
      margin-bottom: 40px;
    }
    
    .start-screen .start-btn {
      background: #ff6b9d;
      color: #fff;
      border: none;
      padding: 15px 40px;
      font-family: 'Press Start 2P', monospace;
      font-size: 12px;
      cursor: pointer;
      border-radius: 8px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 107, 157, 0.5); }
      50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 107, 157, 0.8); }
    }
    
    /* Hearts counter */
    .hearts-counter {
      position: fixed;
      top: 20px;
      right: 20px;
      color: #ff6b9d;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    /* Mobile controls */
    .mobile-controls {
      display: none;
      margin-top: 20px;
      gap: 10px;
    }
    
    @media (max-width: 768px) {
      .mobile-controls {
        display: grid;
        grid-template-columns: repeat(3, 60px);
        grid-template-rows: repeat(3, 60px);
        gap: 5px;
      }
    }
    
    .mobile-btn {
      background: #2d2d44;
      border: 2px solid #ff6b9d;
      color: #ff6b9d;
      font-size: 20px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .mobile-btn:active {
      background: #ff6b9d;
      color: #fff;
    }
    
    .mobile-btn.up { grid-column: 2; grid-row: 1; }
    .mobile-btn.left { grid-column: 1; grid-row: 2; }
    .mobile-btn.action { grid-column: 2; grid-row: 2; }
    .mobile-btn.right { grid-column: 3; grid-row: 2; }
    .mobile-btn.down { grid-column: 2; grid-row: 3; }
  </style>
</head>
<body>
  <!-- Start Screen -->
  <div class="start-screen" id="startScreen">
    <h1>💝 A Special Place</h1>
    <p class="subtitle">for {{recipientName}}</p>
    <button class="start-btn" onclick="startGame()">Press to Start</button>
  </div>

  <!-- Hearts Counter -->
  <div class="hearts-counter" id="heartsCounter" style="display: none;">
    💖 <span id="heartCount">0</span> / 3
  </div>

  <!-- Game Container -->
  <div class="game-container">
    <canvas id="gameCanvas" width="640" height="480"></canvas>
  </div>
  
  <div class="instructions" id="instructions" style="display: none;">
    <span>↑ ↓ ← →</span> Move &nbsp;&nbsp;
    <span>SPACE</span> Interact
  </div>

  <!-- Mobile Controls -->
  <div class="mobile-controls" id="mobileControls">
    <button class="mobile-btn up" ontouchstart="mobileMove('up')" ontouchend="mobileStop()">↑</button>
    <button class="mobile-btn left" ontouchstart="mobileMove('left')" ontouchend="mobileStop()">←</button>
    <button class="mobile-btn action" ontouchstart="interact()">♥</button>
    <button class="mobile-btn right" ontouchstart="mobileMove('right')" ontouchend="mobileStop()">→</button>
    <button class="mobile-btn down" ontouchstart="mobileMove('down')" ontouchend="mobileStop()">↓</button>
  </div>

  <!-- Popup Overlay -->
  <div class="popup-overlay" id="popupOverlay">
    <div class="popup" id="popup">
      <h2 id="popupTitle">Title</h2>
      <div id="popupContent"></div>
      <button onclick="closePopup()">Continue</button>
    </div>
  </div>

  <script>
    // Game Configuration
    const CONFIG = {
      recipientName: '{{recipientName}}',
      photoUrl: '{{photoUrl}}',
      message1: '{{message1}}',
      finalLetter: '{{finalLetter}}',
      roomColor: '{{roomColor}}'
    };

    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Game state
    let gameStarted = false;
    let heartsCollected = 0;
    const totalHearts = 3;
    
    // Player
    const player = {
      x: 300,
      y: 350,
      width: 32,
      height: 48,
      speed: 3,
      direction: 'down',
      frame: 0,
      frameTimer: 0
    };
    
    // Movement
    const keys = { up: false, down: false, left: false, right: false };
    
    // Interactable objects
    const objects = [
      { 
        x: 100, y: 150, width: 64, height: 64, 
        type: 'photo', 
        sprite: '🖼️',
        title: 'A Special Memory',
        collected: false
      },
      { 
        x: 480, y: 150, width: 64, height: 64, 
        type: 'gift', 
        sprite: '🎁',
        title: 'A Message For You',
        collected: false
      },
      { 
        x: 290, y: 100, width: 64, height: 64, 
        type: 'chest', 
        sprite: '💝',
        title: 'The Treasure',
        collected: false,
        locked: true
      },
      // Collectible hearts
      { x: 150, y: 300, width: 32, height: 32, type: 'heart', sprite: '💖', collected: false },
      { x: 500, y: 280, width: 32, height: 32, type: 'heart', sprite: '💖', collected: false },
      { x: 320, y: 380, width: 32, height: 32, type: 'heart', sprite: '💖', collected: false },
    ];
    
    // Furniture (non-interactable, for collision)
    const furniture = [
      { x: 50, y: 50, width: 100, height: 60 },   // Bookshelf
      { x: 500, y: 50, width: 100, height: 60 },  // Dresser
    ];
    
    // Room colors
    const roomColors = {
      pink: { floor: '#3d2137', wall: '#5c3d5c', accent: '#ff6b9d' },
      blue: { floor: '#1e3a5f', wall: '#2d4a6f', accent: '#6bb3ff' },
      green: { floor: '#1e4d3a', wall: '#2d5f4a', accent: '#6bffb3' },
      purple: { floor: '#2e1e4d', wall: '#3d2d5f', accent: '#b36bff' },
    };
    
    const currentRoom = roomColors[CONFIG.roomColor] || roomColors.pink;

    function startGame() {
      document.getElementById('startScreen').classList.add('hidden');
      document.getElementById('heartsCounter').style.display = 'flex';
      document.getElementById('instructions').style.display = 'block';
      document.getElementById('mobileControls').style.display = 'grid';
      gameStarted = true;
      gameLoop();
    }

    function drawRoom() {
      // Floor
      ctx.fillStyle = currentRoom.floor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Floor pattern (tiles)
      ctx.strokeStyle = currentRoom.wall;
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.strokeRect(x, y, 40, 40);
        }
      }
      
      // Walls
      ctx.fillStyle = currentRoom.wall;
      ctx.fillRect(0, 0, canvas.width, 80); // Top wall
      
      // Wall decorations
      ctx.fillStyle = currentRoom.accent;
      for (let x = 50; x < canvas.width; x += 150) {
        ctx.fillRect(x, 20, 60, 40); // Pictures on wall
      }
      
      // Door
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(280, 0, 80, 70);
      ctx.fillStyle = '#6b5344';
      ctx.fillRect(290, 10, 60, 55);
      
      // Rug
      ctx.fillStyle = currentRoom.accent;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(220, 200, 200, 150);
      ctx.globalAlpha = 1;
    }

    function drawObjects() {
      objects.forEach(obj => {
        if (!obj.collected) {
          ctx.font = obj.type === 'heart' ? '24px serif' : '48px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Glow effect for interactive objects
          if (obj.type !== 'heart') {
            ctx.shadowColor = currentRoom.accent;
            ctx.shadowBlur = 15;
          }
          
          // Locked chest appears darker
          if (obj.type === 'chest' && obj.locked) {
            ctx.globalAlpha = 0.5;
          }
          
          ctx.fillText(obj.sprite, obj.x + obj.width/2, obj.y + obj.height/2);
          
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      });
    }

    function drawPlayer() {
      // Simple pixel character
      const px = player.x;
      const py = player.y;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 46, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillStyle = currentRoom.accent;
      ctx.fillRect(px + 8, py + 20, 16, 24);
      
      // Head
      ctx.fillStyle = '#ffdbac';
      ctx.fillRect(px + 6, py + 4, 20, 18);
      
      // Hair
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(px + 6, py + 2, 20, 8);
      
      // Eyes
      ctx.fillStyle = '#333';
      if (player.direction === 'up') {
        // Back of head
      } else {
        ctx.fillRect(px + 10, py + 10, 4, 4);
        ctx.fillRect(px + 18, py + 10, 4, 4);
      }
      
      // Walking animation (bob)
      const bob = Math.sin(player.frameTimer * 0.2) * 2;
      ctx.fillRect(px + 8, py + 20 + bob, 16, 24);
    }

    function drawInteractionPrompt() {
      const nearObject = getNearObject();
      if (nearObject && !nearObject.collected) {
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE', nearObject.x + nearObject.width/2, nearObject.y - 15);
      }
    }

    function update() {
      let moving = false;
      const newX = player.x;
      const newY = player.y;
      
      if (keys.up) { player.y -= player.speed; player.direction = 'up'; moving = true; }
      if (keys.down) { player.y += player.speed; player.direction = 'down'; moving = true; }
      if (keys.left) { player.x -= player.speed; player.direction = 'left'; moving = true; }
      if (keys.right) { player.x += player.speed; player.direction = 'right'; moving = true; }
      
      // Boundary check
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(80, Math.min(canvas.height - player.height, player.y));
      
      // Auto-collect hearts
      objects.forEach(obj => {
        if (obj.type === 'heart' && !obj.collected) {
          if (isColliding(player, obj)) {
            obj.collected = true;
            heartsCollected++;
            document.getElementById('heartCount').textContent = heartsCollected;
            
            // Unlock chest when all hearts collected
            if (heartsCollected >= totalHearts) {
              const chest = objects.find(o => o.type === 'chest');
              if (chest) chest.locked = false;
            }
          }
        }
      });
      
      if (moving) player.frameTimer++;
    }

    function isColliding(a, b) {
      return a.x < b.x + b.width &&
             a.x + a.width > b.x &&
             a.y < b.y + b.height &&
             a.y + a.height > b.y;
    }

    function getNearObject() {
      const interactDistance = 50;
      return objects.find(obj => {
        if (obj.type === 'heart') return false;
        const dx = (player.x + player.width/2) - (obj.x + obj.width/2);
        const dy = (player.y + player.height/2) - (obj.y + obj.height/2);
        return Math.sqrt(dx*dx + dy*dy) < interactDistance;
      });
    }

    function interact() {
      const obj = getNearObject();
      if (!obj || obj.collected) return;
      
      if (obj.type === 'chest' && obj.locked) {
        showPopup('🔒 Locked', '<p>Collect all 3 hearts to unlock!</p>');
        return;
      }
      
      obj.collected = true;
      
      if (obj.type === 'photo') {
        const imgHtml = CONFIG.photoUrl 
          ? \`<img src="\${CONFIG.photoUrl}" alt="Memory">\` 
          : '<p style="font-size:48px;">📸</p>';
        showPopup(obj.title, imgHtml + '<p>A beautiful memory of us...</p>');
      } else if (obj.type === 'gift') {
        showPopup(obj.title, \`<p>\${CONFIG.message1 || 'You are so special to me!'}</p>\`);
      } else if (obj.type === 'chest') {
        showPopup('💖 ' + CONFIG.recipientName + ' 💖', \`<p>\${CONFIG.finalLetter || 'I love you more than words can say. You mean everything to me!'}</p>\`);
      }
    }

    function showPopup(title, content) {
      document.getElementById('popupTitle').textContent = title;
      document.getElementById('popupContent').innerHTML = content;
      document.getElementById('popupOverlay').classList.add('active');
    }

    function closePopup() {
      document.getElementById('popupOverlay').classList.remove('active');
    }

    function gameLoop() {
      if (!gameStarted) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawRoom();
      drawObjects();
      drawPlayer();
      drawInteractionPrompt();
      update();
      
      requestAnimationFrame(gameLoop);
    }

    // Keyboard controls
    document.addEventListener('keydown', e => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
      if (e.code === 'Space') { e.preventDefault(); interact(); }
    });

    document.addEventListener('keyup', e => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    });

    // Mobile controls
    function mobileMove(dir) {
      keys[dir] = true;
    }
    function mobileStop() {
      keys.up = keys.down = keys.left = keys.right = false;
    }

    // Prevent scrolling on mobile
    document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  </script>
</body>
</html>`,
  cssTemplate: '',
  jsTemplate: '',
  isActive: true,
};

async function seedGameTemplate() {
  console.log('🎮 Adding Memory Room Adventure template...');
  
  const result = await db.insert(templates).values(gameTemplate).returning();
  
  console.log('✅ Created template:', result[0].name);
  console.log('   ID:', result[0].id);
  
  process.exit(0);
}

seedGameTemplate().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
