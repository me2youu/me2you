import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedWrapped = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Wrapped - {{recipientName}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{width:100%;height:100%;overflow:hidden;font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#000}

    /* Slide container */
    .slides{width:100%;height:100%;position:relative}
    .slide{
      position:absolute;inset:0;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:2.5rem 1.8rem;text-align:center;
      opacity:0;transform:scale(.92);
      transition:opacity .6s ease,transform .6s ease;
      pointer-events:none;overflow:hidden;
    }
    .slide.active{opacity:1;transform:scale(1);pointer-events:auto;z-index:2}
    .slide.exit-left{opacity:0;transform:translateX(-30%) scale(.9)}
    .slide.exit-right{opacity:0;transform:translateX(30%) scale(.9)}

    /* Gradient backgrounds */
    .bg-1{background:linear-gradient(145deg,#1a0533 0%,#2d1b69 35%,#1e3a5f 100%)}
    .bg-2{background:linear-gradient(145deg,#0d2137 0%,#1a4a3a 40%,#2d6b3f 100%)}
    .bg-3{background:linear-gradient(145deg,#3b1a45 0%,#6b213f 40%,#8b3a2a 100%)}
    .bg-4{background:linear-gradient(145deg,#1a2940 0%,#2a1f5e 40%,#4a1a6b 100%)}
    .bg-5{background:linear-gradient(145deg,#0f2b1a 0%,#1a4a2e 40%,#2d6b3f 100%)}
    .bg-6{background:linear-gradient(145deg,#2a1520 0%,#4a1a35 40%,#6b2150 100%)}
    .bg-7{background:linear-gradient(145deg,#1a1a2e 0%,#2d1b69 50%,#6b213f 100%)}

    /* Noise overlay for texture */
    .slide::before{
      content:'';position:absolute;inset:0;
      background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
      background-size:128px 128px;
      pointer-events:none;opacity:.5;z-index:0;
    }
    .slide>*{position:relative;z-index:1}

    /* Typography */
    .label{
      font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.25em;
      color:rgba(255,255,255,.5);margin-bottom:.8rem;
    }
    .big-text{
      font-size:clamp(2rem,9vw,3.8rem);font-weight:800;color:#fff;
      line-height:1.1;margin-bottom:.5rem;
    }
    .sub-text{
      font-size:clamp(.9rem,3.5vw,1.15rem);color:rgba(255,255,255,.6);
      font-weight:400;line-height:1.5;
    }
    .accent{
      background:linear-gradient(135deg,#1db954,#1ed760);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
    }
    .accent-pink{
      background:linear-gradient(135deg,#e040fb,#ff6090);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
    }
    .accent-gold{
      background:linear-gradient(135deg,#f9a825,#ff8f00);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
    }

    /* Animations */
    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
    @keyframes countUp{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes barGrow{from{width:0}to{width:var(--w)}}

    .slide.active .anim-1{animation:fadeUp .6s ease .1s backwards}
    .slide.active .anim-2{animation:fadeUp .6s ease .25s backwards}
    .slide.active .anim-3{animation:fadeUp .6s ease .4s backwards}
    .slide.active .anim-4{animation:fadeUp .6s ease .55s backwards}
    .slide.active .anim-5{animation:fadeUp .6s ease .7s backwards}
    .slide.active .anim-scale{animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1) .2s backwards}
    .slide.active .anim-count{animation:countUp .7s cubic-bezier(.34,1.56,.64,1) .3s backwards}

    /* Stat number */
    .stat-number{
      font-size:clamp(3.5rem,16vw,7rem);font-weight:800;
      line-height:1;margin:.5rem 0;
      background:linear-gradient(135deg,#1db954,#1ed760,#b9ff66);
      background-size:200% 200%;
      animation:shimmer 3s ease-in-out infinite;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
    }

    /* Vinyl disc */
    .vinyl{
      width:min(200px,45vw);height:min(200px,45vw);
      border-radius:50%;position:relative;margin:1rem auto;
      background:conic-gradient(from 0deg,#111 0deg,#222 30deg,#111 60deg,#1a1a1a 90deg,#222 120deg,#111 150deg,#1a1a1a 180deg,#222 210deg,#111 240deg,#1a1a1a 270deg,#222 300deg,#111 330deg,#1a1a1a 360deg);
      box-shadow:0 0 40px rgba(29,185,84,.15),0 0 80px rgba(29,185,84,.05);
    }
    .vinyl::after{
      content:'';position:absolute;
      top:50%;left:50%;transform:translate(-50%,-50%);
      width:30%;height:30%;border-radius:50%;
      background:radial-gradient(circle,#1db954 0%,#1a8a42 50%,#111 52%);
    }
    .slide.active .vinyl{animation:spin 4s linear infinite}

    /* Equalizer bars */
    .eq{display:flex;gap:3px;align-items:flex-end;height:40px;margin:.8rem auto;justify-content:center}
    .eq-bar{
      width:4px;border-radius:2px;
      background:linear-gradient(to top,#1db954,#1ed760);
      animation:eqBounce var(--d,.5s) ease-in-out infinite alternate;
    }
    @keyframes eqBounce{from{height:var(--h1,8px)}to{height:var(--h2,30px)}}

    /* Song list */
    .song-list{width:100%;max-width:340px;text-align:left;margin-top:1rem}
    .song-item{
      display:flex;align-items:center;gap:.75rem;
      padding:.7rem .5rem;border-radius:12px;
      background:rgba(255,255,255,.04);
      margin-bottom:.4rem;
      backdrop-filter:blur(4px);
      border:1px solid rgba(255,255,255,.04);
    }
    .song-rank{
      font-size:1.4rem;font-weight:800;width:1.6rem;text-align:center;
      flex-shrink:0;
    }
    .song-rank.r1{color:#1db954}
    .song-rank.r2{color:#1ed760}
    .song-rank.r3{color:#b9ff66}
    .song-rank.r4{color:#66d9a0}
    .song-rank.r5{color:#4ab887}
    .song-info{min-width:0;flex:1}
    .song-name{
      font-size:.85rem;font-weight:700;color:#fff;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .song-artist{
      font-size:.7rem;color:rgba(255,255,255,.45);font-weight:400;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .song-bar{
      height:3px;border-radius:2px;margin-top:4px;
      background:linear-gradient(90deg,#1db954,#1ed760);
      animation:barGrow .8s ease-out backwards;
    }

    /* Genre pill */
    .genre-pill{
      display:inline-block;padding:.8rem 2rem;border-radius:50px;
      background:linear-gradient(135deg,rgba(29,185,84,.15),rgba(30,215,96,.1));
      border:1.5px solid rgba(29,185,84,.3);
      font-size:1.5rem;font-weight:800;color:#1ed760;
      margin:.8rem 0;
    }

    /* Final message */
    .msg-card{
      background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.06);
      border-radius:20px;padding:2rem 1.5rem;
      max-width:360px;width:100%;
      backdrop-filter:blur(8px);
    }
    .msg-text{
      color:rgba(255,255,255,.75);font-size:.95rem;line-height:1.8;
      font-style:italic;
      word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;
    }
    .msg-from{
      margin-top:1.2rem;color:rgba(255,255,255,.35);font-size:.75rem;
      font-weight:600;text-transform:uppercase;letter-spacing:.15em;
    }

    /* Progress bar */
    .progress{
      position:fixed;top:0;left:0;right:0;height:3px;z-index:100;
      background:rgba(255,255,255,.08);
    }
    .progress-fill{
      height:100%;background:linear-gradient(90deg,#1db954,#1ed760);
      transition:width .4s ease;border-radius:0 2px 2px 0;
    }

    /* Nav dots */
    .dots{
      position:fixed;bottom:2vh;left:50%;transform:translateX(-50%);
      display:flex;gap:6px;z-index:100;
    }
    .dot{
      width:6px;height:6px;border-radius:50%;
      background:rgba(255,255,255,.2);transition:all .3s;
    }
    .dot.active{background:#1db954;width:20px;border-radius:3px}

    /* Tap zones */
    .tap-left,.tap-right{
      position:fixed;top:0;bottom:0;width:40%;z-index:50;cursor:pointer;
    }
    .tap-left{left:0}
    .tap-right{right:0}

    /* Sparkle decorations */
    .sparkle{
      position:absolute;width:4px;height:4px;border-radius:50%;
      background:#1db954;opacity:0;
      animation:sparkleAnim var(--dur,3s) ease-in-out infinite var(--del,0s);
    }
    @keyframes sparkleAnim{0%,100%{opacity:0;transform:scale(0)}50%{opacity:.6;transform:scale(1)}}

    /* Floating music notes */
    .note{
      position:absolute;font-size:1.2rem;opacity:0;
      animation:noteFloat var(--dur,4s) ease-in-out infinite var(--del,0s);
    }
    @keyframes noteFloat{
      0%{opacity:0;transform:translateY(0) rotate(0)}
      20%{opacity:.4}
      80%{opacity:.4}
      100%{opacity:0;transform:translateY(-60px) rotate(20deg)}
    }

    @media(max-width:380px){
      .slide{padding:2rem 1.2rem}
      .song-item{padding:.5rem .4rem;gap:.5rem}
      .song-name{font-size:.78rem}
    }
  </style>
</head>
<body>
  <div class="progress"><div class="progress-fill" id="progressFill"></div></div>
  <div class="dots" id="dots"></div>
  <div class="tap-left" id="tapLeft"></div>
  <div class="tap-right" id="tapRight"></div>

  <!-- Addon toggles (hidden, detected by customize page) -->
  <div style="display:none">{{enableExtraSongs}}</div>

  <div class="slides" id="slides">

    <!-- Slide 0: Intro -->
    <div class="slide bg-1 active" data-slide="0">
      <div class="eq anim-1" aria-hidden="true">
        <div class="eq-bar" style="--h1:6px;--h2:28px;--d:.4s"></div>
        <div class="eq-bar" style="--h1:10px;--h2:38px;--d:.55s"></div>
        <div class="eq-bar" style="--h1:4px;--h2:22px;--d:.35s"></div>
        <div class="eq-bar" style="--h1:8px;--h2:34px;--d:.5s"></div>
        <div class="eq-bar" style="--h1:5px;--h2:26px;--d:.45s"></div>
      </div>
      <p class="label anim-2">Your Friendship</p>
      <h1 class="big-text anim-3" style="font-size:clamp(2.5rem,10vw,4.5rem)">
        <span class="accent">Wrapped</span>
      </h1>
      <p class="sub-text anim-4" style="margin-top:.8rem">
        A year of music with<br><strong style="color:#fff">{{recipientName}}</strong>
      </p>
      <p class="sub-text anim-5" style="margin-top:2rem;font-size:.7rem;opacity:.4">Tap to continue &rarr;</p>
    </div>

    <!-- Slide 1: Top Song -->
    <div class="slide bg-2" data-slide="1">
      <p class="label anim-1">Your #1 Song Together</p>
      <div class="vinyl anim-scale"></div>
      <p class="big-text anim-2" style="margin-top:1rem;font-size:clamp(1.5rem,6vw,2.4rem)" id="topSongName"></p>
      <p class="sub-text anim-3" id="topSongArtist"></p>
      <div class="eq anim-4" style="margin-top:1.2rem" aria-hidden="true">
        <div class="eq-bar" style="--h1:5px;--h2:20px;--d:.35s"></div>
        <div class="eq-bar" style="--h1:8px;--h2:32px;--d:.45s"></div>
        <div class="eq-bar" style="--h1:4px;--h2:26px;--d:.4s"></div>
        <div class="eq-bar" style="--h1:7px;--h2:18px;--d:.5s"></div>
        <div class="eq-bar" style="--h1:6px;--h2:28px;--d:.38s"></div>
        <div class="eq-bar" style="--h1:9px;--h2:22px;--d:.42s"></div>
        <div class="eq-bar" style="--h1:5px;--h2:30px;--d:.48s"></div>
      </div>
    </div>

    <!-- Slide 2: Top Artist -->
    <div class="slide bg-3" data-slide="2">
      <p class="label anim-1">Most Played Artist</p>
      <p class="big-text anim-scale" style="font-size:clamp(2rem,9vw,3.5rem)">
        <span class="accent-pink">{{topArtist}}</span>
      </p>
      <p class="sub-text anim-3" style="margin-top:.5rem">was the soundtrack to your friendship</p>
      <div style="margin-top:1.5rem" class="anim-4">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style="opacity:.3">
          <path d="M9 18V5l12-2v13" stroke="#e040fb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="6" cy="18" r="3" stroke="#e040fb" stroke-width="1.5"/>
          <circle cx="18" cy="16" r="3" stroke="#e040fb" stroke-width="1.5"/>
        </svg>
      </div>
    </div>

    <!-- Slide 3: Minutes Listened -->
    <div class="slide bg-4" data-slide="3">
      <p class="label anim-1">Together You Listened For</p>
      <p class="stat-number anim-count" id="minutesEl">0</p>
      <p class="big-text anim-3" style="font-size:1.2rem;color:rgba(255,255,255,.5)">minutes</p>
      <p class="sub-text anim-4" style="margin-top:1rem" id="minutesSubtext"></p>
    </div>

    <!-- Slide 4: Top Genre -->
    <div class="slide bg-5" data-slide="4">
      <p class="label anim-1">Your Shared Vibe</p>
      <div class="genre-pill anim-scale">{{topGenre}}</div>
      <p class="sub-text anim-3" style="margin-top:1rem">This genre defined your year together</p>
    </div>

    <!-- Slide 5: Top Songs List -->
    <div class="slide bg-6" data-slide="5">
      <p class="label anim-1">Your Top Songs</p>
      <div class="song-list" id="songList"></div>
    </div>

    <!-- Slide 6: Final Message -->
    <div class="slide bg-7" data-slide="6">
      <p class="label anim-1">A Note For You</p>
      <div class="msg-card anim-2">
        <p class="msg-text">{{customMessage}}</p>
        <p class="msg-from">With love, for {{recipientName}}</p>
      </div>
      <p class="sub-text anim-3" style="margin-top:1.5rem;font-size:.7rem;opacity:.3">Made with me2you.world</p>
    </div>

  </div>

  <script>
    // Data
    var songs = [
      {name:'{{wrappedSong1}}',artist:'{{wrappedArtist1}}'},
      {name:'{{wrappedSong2}}',artist:'{{wrappedArtist2}}'},
      {name:'{{wrappedSong3}}',artist:'{{wrappedArtist3}}'},
      {name:'{{wrappedSong4}}',artist:'{{wrappedArtist4}}'},
      {name:'{{wrappedSong5}}',artist:'{{wrappedArtist5}}'}
    ];
    var minutes = parseInt('{{minutesListened}}',10) || 0;

    // Filter valid songs (not empty, not placeholder)
    var validSongs = songs.filter(function(s){
      return s.name && s.name !== '' && !s.name.match(/^\\[/);
    });

    // Populate top song slide
    var topSongNameEl = document.getElementById('topSongName');
    var topSongArtistEl = document.getElementById('topSongArtist');
    if(validSongs.length>0){
      topSongNameEl.textContent = validSongs[0].name;
      topSongArtistEl.textContent = validSongs[0].artist;
    } else {
      topSongNameEl.textContent = 'Your Song';
      topSongArtistEl.textContent = '';
    }

    // Populate minutes subtext
    var minsSubEl = document.getElementById('minutesSubtext');
    if(minutes > 0){
      var hours = Math.round(minutes/60);
      var days = (minutes/1440).toFixed(1);
      if(hours >= 24) minsSubEl.textContent = "That's about " + days + " full days of music!";
      else if(hours > 1) minsSubEl.textContent = "That's about " + hours + " hours of vibes!";
      else minsSubEl.textContent = "Every minute counts!";
    }

    // Build song list
    var songListEl = document.getElementById('songList');
    var barWidths = [100,82,68,55,45];
    validSongs.forEach(function(s,i){
      var item = document.createElement('div');
      item.className = 'song-item anim-' + (i+1);
      item.innerHTML =
        '<span class="song-rank r' + (i+1) + '">' + (i+1) + '</span>' +
        '<div class="song-info">' +
          '<p class="song-name">' + s.name + '</p>' +
          '<p class="song-artist">' + s.artist + '</p>' +
          '<div class="song-bar" style="--w:' + barWidths[i] + '%;animation-delay:' + (0.3 + i*0.15) + 's"></div>' +
        '</div>';
      songListEl.appendChild(item);
    });

    if(validSongs.length === 0){
      songListEl.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.3);padding:2rem">No songs added yet</p>';
    }

    // Add sparkles to some slides
    [0,3,6].forEach(function(si){
      var sl = document.querySelector('[data-slide="'+si+'"]');
      if(!sl) return;
      for(var i=0;i<8;i++){
        var sp = document.createElement('div');
        sp.className = 'sparkle';
        sp.style.cssText = 'top:'+Math.random()*100+'%;left:'+Math.random()*100+'%;--dur:'+(2+Math.random()*3)+'s;--del:'+(Math.random()*3)+'s;width:'+(3+Math.random()*4)+'px;height:'+(3+Math.random()*4)+'px;background:'+(['#1db954','#1ed760','#b9ff66','#fff'][Math.floor(Math.random()*4)]);
        sl.appendChild(sp);
      }
    });

    // Add floating notes to music slides
    [1,2,4].forEach(function(si){
      var sl = document.querySelector('[data-slide="'+si+'"]');
      if(!sl) return;
      var notes = ['&#9835;','&#9834;','&#9833;'];
      for(var i=0;i<5;i++){
        var n = document.createElement('div');
        n.className = 'note';
        n.innerHTML = notes[i%3];
        n.style.cssText = 'top:'+(50+Math.random()*40)+'%;left:'+(10+Math.random()*80)+'%;--dur:'+(3+Math.random()*3)+'s;--del:'+(Math.random()*4)+'s;font-size:'+(1+Math.random()*0.8)+'rem;color:rgba(29,185,84,'+(0.15+Math.random()*0.2)+')';
        sl.appendChild(n);
      }
    });

    // Slide navigation
    var current = 0;
    var total = document.querySelectorAll('.slide').length;
    var dotsEl = document.getElementById('dots');
    var progFill = document.getElementById('progressFill');
    var animating = false;

    // Build dots
    for(var i=0;i<total;i++){
      var d = document.createElement('div');
      d.className = 'dot' + (i===0?' active':'');
      dotsEl.appendChild(d);
    }

    function goTo(idx){
      if(animating || idx===current || idx<0 || idx>=total) return;
      animating = true;
      var slides = document.querySelectorAll('.slide');
      var dots = document.querySelectorAll('.dot');
      var dir = idx > current ? 'left' : 'right';
      slides[current].classList.remove('active');
      slides[current].classList.add('exit-'+dir);
      slides[idx].classList.remove('exit-left','exit-right');
      slides[idx].classList.add('active');
      dots[current].classList.remove('active');
      dots[idx].classList.add('active');
      progFill.style.width = ((idx/(total-1))*100)+'%';

      // Animate minutes counter
      if(idx === 3 && minutes > 0) animateCounter();

      setTimeout(function(){
        slides[current].classList.remove('exit-left','exit-right');
        current = idx;
        animating = false;
      },600);
    }

    // Minutes counter animation
    var counterAnimated = false;
    function animateCounter(){
      if(counterAnimated) return;
      counterAnimated = true;
      var el = document.getElementById('minutesEl');
      var target = minutes;
      var duration = 1500;
      var start = performance.now();
      function tick(now){
        var progress = Math.min((now-start)/duration,1);
        var eased = 1-Math.pow(1-progress,3);
        el.textContent = Math.round(eased*target).toLocaleString();
        if(progress<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // Touch/click navigation
    document.getElementById('tapRight').addEventListener('click',function(){goTo(current+1)});
    document.getElementById('tapLeft').addEventListener('click',function(){goTo(current-1)});

    // Swipe support
    var touchStartX = 0;
    var touchStartY = 0;
    document.addEventListener('touchstart',function(e){
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },{passive:true});
    document.addEventListener('touchend',function(e){
      var dx = e.changedTouches[0].screenX - touchStartX;
      var dy = e.changedTouches[0].screenY - touchStartY;
      if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40){
        if(dx < 0) goTo(current+1);
        else goTo(current-1);
      }
    },{passive:true});

    // Keyboard
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key===' ') goTo(current+1);
      if(e.key==='ArrowLeft') goTo(current-1);
    });

    // Set initial progress
    progFill.style.width = '0%';
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Wrapped template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Wrapped'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedWrapped,
        description: 'Your Friendship Wrapped! A Spotify-style year-in-review experience with animated stats, top songs, and a personal message. Tap through story-style slides.',
      })
      .where(eq(templates.name, 'Wrapped'));
    console.log('Updated Wrapped template');
  } else {
    console.log('Wrapped template not found — creating new');
    await db.insert(templates).values({
      name: 'Wrapped',
      description: 'Your Friendship Wrapped! A Spotify-style year-in-review experience with animated stats, top songs, and a personal message. Tap through story-style slides.',
      occasion: ['friendship', 'birthday', 'anniversary', 'general'],
      htmlTemplate: upgradedWrapped,
      cssTemplate: null,
      jsTemplate: null,
      basePrice: '1.50',
      isActive: true,
    });
    console.log('Created Wrapped template');
  }

  process.exit(0);
}

main().catch(console.error);
