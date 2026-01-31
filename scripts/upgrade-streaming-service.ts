import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedNetflix = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{showTitle}} | Me2YouFlix</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #141414;
      color: #fff;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 15px 4%;
      background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 30px;
    }
    
    .logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #e50914;
      letter-spacing: 2px;
    }
    
    .nav {
      display: flex;
      gap: 20px;
    }
    
    .nav a {
      color: #e5e5e5;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.2s;
    }
    
    .nav a:hover, .nav a.active {
      color: #fff;
    }
    
    /* Hero Banner */
    .hero {
      height: clamp(400px, 85vh, 800px);
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 0 4% 8%;
      background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 60%),
                  linear-gradient(0deg, #141414 0%, transparent 30%),
                  url('{{heroImageUrl}}') center/cover no-repeat;
      background-color: #1a1a2e;
    }
    
    .hero-content {
      max-width: 500px;
    }
    
    .show-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 4rem;
      line-height: 1;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
    }
    
    .show-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
    
    .match {
      color: #46d369;
      font-weight: 600;
    }
    
    .rating {
      border: 1px solid #fff;
      padding: 0 5px;
      font-size: 0.75rem;
    }
    
    .show-desc {
      font-size: 1rem;
      line-height: 1.5;
      color: #e5e5e5;
      margin-bottom: 1.5rem;
    }
    
    .hero-buttons {
      display: flex;
      gap: 10px;
    }
    
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 25px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .btn-play {
      background: #fff;
      color: #000;
    }
    
    .btn-play:hover {
      background: #e5e5e5;
    }
    
    .btn-info {
      background: rgba(109, 109, 110, 0.7);
      color: #fff;
    }
    
    .btn-info:hover {
      background: rgba(109, 109, 110, 0.5);
    }
    
    /* Content Rows */
    .content {
      padding: 0 4%;
      margin-top: -100px;
      position: relative;
      z-index: 10;
    }
    
    .row {
      margin-bottom: 2rem;
    }
    
    .row-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    
    .row-content {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    
    .row-content::-webkit-scrollbar {
      height: 4px;
    }
    
    .row-content::-webkit-scrollbar-thumb {
      background: #e50914;
      border-radius: 2px;
    }
    
    .card {
      flex-shrink: 0;
      width: 200px;
      aspect-ratio: 16/9;
      background: #2a2a2a;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
      scroll-snap-align: start;
    }
    
    .card:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10;
    }
    
    .card-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .card-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 30px 10px 10px;
      background: linear-gradient(transparent, rgba(0,0,0,0.9));
    }
    
    .card-title {
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .card-ep {
      font-size: 0.7rem;
      color: #aaa;
    }
    
    /* Top 10 */
    .top10-card {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      scroll-snap-align: start;
    }
    
    .top10-num {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 5rem;
      color: #141414;
      -webkit-text-stroke: 2px #fff;
      line-height: 1;
    }
    
    .top10-img {
      width: 100px;
      height: 140px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    /* Modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 200;
      padding: 2rem;
    }
    
    .modal.visible {
      display: flex;
    }
    
    .modal-content {
      background: #181818;
      border-radius: 8px;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .modal-header {
      padding: 30px;
      background: linear-gradient(transparent, #181818),
                  linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4));
      background-color: #333;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    
    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .modal-body {
      padding: 20px 30px 30px;
    }
    
    .modal-desc {
      color: #d2d2d2;
      line-height: 1.6;
      margin-bottom: 1rem;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .modal-close {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #181818;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }
    
    /* Hidden addon toggles */
    .addon-toggle { display: none; }
    
    @media (max-width: 600px) {
      .show-logo { font-size: 2.5rem; }
      .hero { height: clamp(300px, 70vh, 500px); padding-bottom: 12%; }
      .card { width: 140px; }
      .nav { display: none; }
    }
  </style>
</head>
<body>
  <!-- Addon toggles (hidden, read by JS) -->
  <div class="addon-toggle" id="addonExtraEpisodes">{{enableExtraEpisodes}}</div>
  <div class="addon-toggle" id="addonExtraTopThings">{{enableExtraTopThings}}</div>

  <header class="header">
    <div class="logo">ME2YOUFLIX</div>
    <nav class="nav">
      <a href="#" class="active">Home</a>
      <a href="#">Our Story</a>
      <a href="#">Episodes</a>
      <a href="#">My List</a>
    </nav>
  </header>
  
  <section class="hero">
    <div class="hero-content">
      <h1 class="show-logo">{{showTitle}}</h1>
      <div class="show-meta">
        <span class="match">98% Match</span>
        <span>{{showYear}}</span>
        <span class="rating">TV-MA</span>
        <span>{{seasonCount}} Season</span>
      </div>
      <p class="show-desc">{{showDescription}}</p>
      <div class="hero-buttons">
        <button class="btn btn-play" onclick="showModal('main')">
          <span>&#9654;</span> Play
        </button>
        <button class="btn btn-info">
          <span>&#8505;</span> More Info
        </button>
      </div>
    </div>
  </section>
  
  <section class="content">
    <!-- Episodes row — built dynamically by JS -->
    <div class="row">
      <h2 class="row-title">Season 1: The Beginning</h2>
      <div class="row-content" id="episodeRow"></div>
    </div>
    
    <!-- Top Things row — built dynamically by JS -->
    <div class="row">
      <h2 class="row-title">Top 10 Things About {{recipientName}}</h2>
      <div class="row-content" id="topThingsRow"></div>
    </div>
  </section>
  
  <div class="modal" id="modal" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h2 class="modal-title" id="modalTitle"></h2>
      </div>
      <div class="modal-body">
        <p class="modal-desc" id="modalDesc"></p>
      </div>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
  </div>
  
  <script>
    // Episode data — ep1 always included, ep2-3 only if filled AND addon is on
    var allEpisodes = [
      { key:'ep1', title:'{{episode1Title}}', date:'{{episode1Date}}', desc:'{{episode1Desc}}' },
      { key:'ep2', title:'{{episode2Title}}', date:'{{episode2Date}}', desc:'{{episode2Desc}}' },
      { key:'ep3', title:'{{episode3Title}}', date:'{{episode3Date}}', desc:'{{episode3Desc}}' }
    ];
    
    var mainEp = { title: '{{showTitle}}', desc: '{{customMessage}}' };
    
    // Top things data — top1-3 always included, top4-5 only if filled AND addon is on
    var allTopThings = [
      '{{top1}}','{{top2}}','{{top3}}','{{top4}}','{{top5}}'
    ];
    
    var extraEpisodesOn = (document.getElementById('addonExtraEpisodes').textContent.trim() === 'true');
    var extraTopThingsOn = (document.getElementById('addonExtraTopThings').textContent.trim() === 'true');
    
    // Filter episodes: ep1 always shows, ep2-3 only if extra addon on and filled
    var episodes = allEpisodes.filter(function(ep, i) {
      if (i === 0) return ep.title && ep.title !== '{{episode1Title}}' && ep.title.trim() !== '';
      if (!extraEpisodesOn) return false;
      return ep.title && !ep.title.startsWith('{{') && ep.title.trim() !== '';
    });
    
    // If no episodes at all (ep1 empty), still show ep1 slot
    if (episodes.length === 0 && allEpisodes[0].title) {
      episodes = [allEpisodes[0]];
    }
    
    // Build episode cards
    var epRow = document.getElementById('episodeRow');
    var epLookup = { main: mainEp };
    episodes.forEach(function(ep, i) {
      epLookup[ep.key] = { title: ep.title, desc: ep.desc };
      var card = document.createElement('div');
      card.className = 'card';
      card.onclick = (function(k){ return function(){ showModal(k); }; })(ep.key);
      card.innerHTML = '<div class="card-info"><div class="card-title">' + ep.title + '</div><div class="card-ep">E' + (i+1) + ' &bull; ' + ep.date + '</div></div>';
      epRow.appendChild(card);
    });
    
    // Filter top things: top1-3 always show, top4-5 only if extra addon on and filled
    var topThings = allTopThings.filter(function(t, i) {
      if (i < 3) return t && !t.startsWith('{{') && t.trim() !== '';
      if (!extraTopThingsOn) return false;
      return t && !t.startsWith('{{') && t.trim() !== '';
    });
    
    // Build top things cards
    var topRow = document.getElementById('topThingsRow');
    topThings.forEach(function(t, i) {
      var card = document.createElement('div');
      card.className = 'top10-card';
      card.innerHTML = '<span class="top10-num">' + (i+1) + '</span><div class="card-title">' + t + '</div>';
      topRow.appendChild(card);
    });
    
    function showModal(ep) {
      var data = epLookup[ep];
      if (!data) return;
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalDesc').textContent = data.desc;
      document.getElementById('modal').classList.add('visible');
    }
    
    function closeModal(e) {
      if (!e || e.target === document.getElementById('modal')) {
        document.getElementById('modal').classList.remove('visible');
      }
    }
  </script>
</body>
</html>`;

async function main() {
  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Streaming Service'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedNetflix,
        description: "A Netflix-style streaming page dedicated to your relationship. Episodes are your memories, with a Top Things list about them.",
      })
      .where(eq(templates.name, 'Streaming Service'));
    console.log('Updated Streaming Service template');
  } else {
    console.log('Streaming Service template not found');
  }

  process.exit(0);
}

main().catch(console.error);
