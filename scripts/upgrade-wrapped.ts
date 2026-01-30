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

    /* Theme CSS variables — friendship (default) */
    :root{
      --c1:#1db954;--c2:#1ed760;--c3:#b9ff66;
      --bg1-a:#1a0533;--bg1-b:#2d1b69;--bg1-c:#1e3a5f;
      --bg2-a:#0d2137;--bg2-b:#1a4a3a;--bg2-c:#2d6b3f;
      --bg3-a:#3b1a45;--bg3-b:#6b213f;--bg3-c:#8b3a2a;
      --bg4-a:#1a2940;--bg4-b:#2a1f5e;--bg4-c:#4a1a6b;
      --bg5-a:#0f2b1a;--bg5-b:#1a4a2e;--bg5-c:#2d6b3f;
      --bg6-a:#2a1520;--bg6-b:#4a1a35;--bg6-c:#6b2150;
      --bg7-a:#1a1a2e;--bg7-b:#2d1b69;--bg7-c:#6b213f;
      --vinyl-glow:rgba(29,185,84,.15);
      --hero-word:Friendship;
      --sub-word:friendship;
    }
    /* Love theme */
    .love{
      --c1:#e040fb;--c2:#ff6090;--c3:#ffab91;
      --bg1-a:#2a0a1e;--bg1-b:#5c1a3a;--bg1-c:#3a1a4a;
      --bg2-a:#1a0520;--bg2-b:#4a1a35;--bg2-c:#6b2150;
      --bg3-a:#3a0a1a;--bg3-b:#8b2252;--bg3-c:#a0446a;
      --bg4-a:#200a2a;--bg4-b:#4a1a5e;--bg4-c:#6b2a7a;
      --bg5-a:#2a0a20;--bg5-b:#5c1a3a;--bg5-c:#7a2a52;
      --bg6-a:#1a0515;--bg6-b:#3a1028;--bg6-c:#5c1a3a;
      --bg7-a:#1a0a1e;--bg7-b:#3a1a4a;--bg7-c:#6b215f;
      --vinyl-glow:rgba(224,64,251,.15);
    }

    .slides{width:100%;height:100%;position:relative}
    .slide{
      position:absolute;inset:0;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      padding:2.5rem 1.8rem;text-align:center;
      opacity:0;transform:scale(.92);
      transition:opacity .5s ease,transform .5s ease;
      pointer-events:none;overflow:hidden;
      cursor:pointer;
    }
    .slide.active{opacity:1;transform:scale(1);pointer-events:auto;z-index:2}
    .slide.exit{opacity:0;transform:translateX(-30%) scale(.9)}

    .bg-1{background:linear-gradient(145deg,var(--bg1-a),var(--bg1-b) 35%,var(--bg1-c))}
    .bg-2{background:linear-gradient(145deg,var(--bg2-a),var(--bg2-b) 40%,var(--bg2-c))}
    .bg-3{background:linear-gradient(145deg,var(--bg3-a),var(--bg3-b) 40%,var(--bg3-c))}
    .bg-4{background:linear-gradient(145deg,var(--bg4-a),var(--bg4-b) 40%,var(--bg4-c))}
    .bg-5{background:linear-gradient(145deg,var(--bg5-a),var(--bg5-b) 40%,var(--bg5-c))}
    .bg-6{background:linear-gradient(145deg,var(--bg6-a),var(--bg6-b) 40%,var(--bg6-c))}
    .bg-7{background:linear-gradient(145deg,var(--bg7-a),var(--bg7-b) 50%,var(--bg7-c))}

    /* Noise */
    .slide::before{
      content:'';position:absolute;inset:0;
      background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
      background-size:128px;pointer-events:none;opacity:.5;z-index:0;
    }
    .slide>*{position:relative;z-index:1}

    .label{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.25em;color:rgba(255,255,255,.5);margin-bottom:.8rem}
    .big-text{font-size:clamp(2rem,9vw,3.8rem);font-weight:800;color:#fff;line-height:1.1;margin-bottom:.5rem}
    .sub-text{font-size:clamp(.9rem,3.5vw,1.15rem);color:rgba(255,255,255,.6);font-weight:400;line-height:1.5}
    .accent{background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .accent-alt{background:linear-gradient(135deg,var(--c2),var(--c3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
    @keyframes countUp{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes barGrow{from{width:0}to{width:var(--w)}}
    @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}

    .slide.active .a1{animation:fadeUp .6s ease .1s backwards}
    .slide.active .a2{animation:fadeUp .6s ease .25s backwards}
    .slide.active .a3{animation:fadeUp .6s ease .4s backwards}
    .slide.active .a4{animation:fadeUp .6s ease .55s backwards}
    .slide.active .a5{animation:fadeUp .6s ease .7s backwards}
    .slide.active .asc{animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1) .2s backwards}
    .slide.active .acnt{animation:countUp .7s cubic-bezier(.34,1.56,.64,1) .3s backwards}

    .stat-number{
      font-size:clamp(3.5rem,16vw,7rem);font-weight:800;line-height:1;margin:.5rem 0;
      background:linear-gradient(135deg,var(--c1),var(--c2),var(--c3));
      background-size:200% 200%;animation:shimmer 3s ease-in-out infinite;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }

    .vinyl{
      width:min(180px,42vw);height:min(180px,42vw);border-radius:50%;position:relative;margin:1rem auto;
      background:conic-gradient(from 0deg,#111,#222 30deg,#111 60deg,#1a1a1a 90deg,#222 120deg,#111 150deg,#1a1a1a 180deg,#222 210deg,#111 240deg,#1a1a1a 270deg,#222 300deg,#111 330deg,#1a1a1a 360deg);
      box-shadow:0 0 40px var(--vinyl-glow),0 0 80px rgba(0,0,0,.3);
    }
    .vinyl::after{
      content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:30%;height:30%;border-radius:50%;
      background:radial-gradient(circle,var(--c1) 0%,color-mix(in srgb,var(--c1),#000 40%) 50%,#111 52%);
    }
    .slide.active .vinyl{animation:spin 4s linear infinite}

    .eq{display:flex;gap:3px;align-items:flex-end;height:40px;margin:.8rem auto;justify-content:center}
    .eq-bar{width:4px;border-radius:2px;background:linear-gradient(to top,var(--c1),var(--c2));animation:eqBounce var(--d,.5s) ease-in-out infinite alternate}
    @keyframes eqBounce{from{height:var(--h1,8px)}to{height:var(--h2,30px)}}

    .song-list{width:100%;max-width:340px;text-align:left;margin-top:1rem}
    .song-item{display:flex;align-items:center;gap:.75rem;padding:.65rem .5rem;border-radius:12px;background:rgba(255,255,255,.04);margin-bottom:.4rem;border:1px solid rgba(255,255,255,.04)}
    .song-rank{font-size:1.4rem;font-weight:800;width:1.6rem;text-align:center;flex-shrink:0}
    .song-rank.r1{color:var(--c1)}.song-rank.r2{color:var(--c2)}.song-rank.r3{color:var(--c3)}.song-rank.r4{color:color-mix(in srgb,var(--c2),#fff 20%)}.song-rank.r5{color:color-mix(in srgb,var(--c1),#fff 30%)}
    .song-info{min-width:0;flex:1}
    .song-name{font-size:.85rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .song-artist{font-size:.7rem;color:rgba(255,255,255,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .song-bar{height:3px;border-radius:2px;margin-top:4px;background:linear-gradient(90deg,var(--c1),var(--c2));animation:barGrow .8s ease-out backwards}

    .genre-pill{display:inline-block;padding:.8rem 2rem;border-radius:50px;background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1.5px solid color-mix(in srgb,var(--c1),transparent 60%);font-size:1.5rem;font-weight:800;color:var(--c2);margin:.8rem 0}

    .msg-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:2rem 1.5rem;max-width:360px;width:100%;backdrop-filter:blur(8px)}
    .msg-text{color:rgba(255,255,255,.75);font-size:.95rem;line-height:1.8;font-style:italic;word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap}
    .msg-from{margin-top:1.2rem;color:rgba(255,255,255,.35);font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.15em}

    .progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:100;background:rgba(255,255,255,.08)}
    .progress-fill{height:100%;background:linear-gradient(90deg,var(--c1),var(--c2));transition:width .4s ease;border-radius:0 2px 2px 0}

    .dots{position:fixed;bottom:2vh;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:100}
    .dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:all .3s}
    .dot.active{background:var(--c1);width:20px;border-radius:3px}

    .sparkle{position:absolute;width:4px;height:4px;border-radius:50%;opacity:0;animation:sparkleA var(--dur,3s) ease-in-out infinite var(--del,0s)}
    @keyframes sparkleA{0%,100%{opacity:0;transform:scale(0)}50%{opacity:.6;transform:scale(1)}}

    .note{position:absolute;font-size:1.2rem;opacity:0;animation:noteF var(--dur,4s) ease-in-out infinite var(--del,0s)}
    @keyframes noteF{0%{opacity:0;transform:translateY(0) rotate(0)}20%{opacity:.4}80%{opacity:.4}100%{opacity:0;transform:translateY(-60px) rotate(20deg)}}

    /* Heart particles for love theme */
    .heart-p{position:absolute;font-size:1rem;opacity:0;animation:heartF var(--dur,5s) ease-in-out infinite var(--del,0s)}
    @keyframes heartF{0%{opacity:0;transform:translateY(0) scale(.5)}25%{opacity:.5;transform:translateY(-20px) scale(1)}75%{opacity:.3}100%{opacity:0;transform:translateY(-80px) scale(.6)}}

    .tap-hint{animation:pulse 2s ease-in-out infinite;font-size:.7rem;color:rgba(255,255,255,.25);margin-top:2rem}

    @media(max-width:380px){.slide{padding:2rem 1.2rem}.song-item{padding:.5rem .4rem;gap:.5rem}.song-name{font-size:.78rem}}
  </style>
</head>
<body>
  <!-- Addon toggles (hidden, detected by customize page) -->
  <div style="display:none">{{enableExtraSongs}}</div>

  <div class="progress"><div class="progress-fill" id="progFill"></div></div>
  <div class="dots" id="dots"></div>

  <div class="slides" id="slides">

    <!-- Slide 0: Intro -->
    <div class="slide bg-1 active" data-slide="0">
      <div class="eq a1" aria-hidden="true">
        <div class="eq-bar" style="--h1:6px;--h2:28px;--d:.4s"></div>
        <div class="eq-bar" style="--h1:10px;--h2:38px;--d:.55s"></div>
        <div class="eq-bar" style="--h1:4px;--h2:22px;--d:.35s"></div>
        <div class="eq-bar" style="--h1:8px;--h2:34px;--d:.5s"></div>
        <div class="eq-bar" style="--h1:5px;--h2:26px;--d:.45s"></div>
      </div>
      <p class="label a2" id="heroLabel"></p>
      <h1 class="big-text a3" style="font-size:clamp(2.5rem,10vw,4.5rem)">
        <span class="accent">Wrapped</span>
      </h1>
      <p class="sub-text a4" style="margin-top:.8rem" id="heroSub"></p>
      <p class="tap-hint a5">Tap anywhere to continue</p>
    </div>

    <!-- Slide 1: Top Song -->
    <div class="slide bg-2" data-slide="1">
      <p class="label a1">#1 Song Together</p>
      <div class="vinyl asc"></div>
      <p class="big-text a2" style="margin-top:1rem;font-size:clamp(1.4rem,5.5vw,2.2rem)" id="topSongName"></p>
      <p class="sub-text a3" id="topSongArtist"></p>
      <div class="eq a4" style="margin-top:1rem" aria-hidden="true">
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
      <p class="label a1">Most Played Artist</p>
      <p class="big-text asc" style="font-size:clamp(2rem,9vw,3.5rem)">
        <span class="accent">{{topArtist}}</span>
      </p>
      <p class="sub-text a3" style="margin-top:.5rem" id="artistSub"></p>
      <div style="margin-top:1.5rem" class="a4">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" style="opacity:.25">
          <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c1)"/>
          <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" style="color:var(--c1)"/>
          <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5" style="color:var(--c1)"/>
        </svg>
      </div>
    </div>

    <!-- Slide 3: Minutes -->
    <div class="slide bg-4" data-slide="3">
      <p class="label a1" id="minsLabel">Together You Listened For</p>
      <p class="stat-number acnt" id="minutesEl">0</p>
      <p class="big-text a3" style="font-size:1.2rem;color:rgba(255,255,255,.5)">minutes</p>
      <p class="sub-text a4" style="margin-top:1rem" id="minsSub"></p>
    </div>

    <!-- Slide 4: Genre -->
    <div class="slide bg-5" data-slide="4">
      <p class="label a1" id="genreLabel">Your Shared Vibe</p>
      <div class="genre-pill asc">{{topGenre}}</div>
      <p class="sub-text a3" style="margin-top:1rem" id="genreSub"></p>
    </div>

    <!-- Slide 5: Songs List -->
    <div class="slide bg-6" data-slide="5">
      <p class="label a1">Your Top Songs</p>
      <div class="song-list" id="songList"></div>
    </div>

    <!-- Slide 6: Message -->
    <div class="slide bg-7" data-slide="6">
      <p class="label a1">A Note For You</p>
      <div class="msg-card a2">
        <p class="msg-text">{{customMessage}}</p>
        <p class="msg-from">With love, for {{recipientName}}</p>
      </div>
      <p class="sub-text a3" style="margin-top:1.5rem;font-size:.65rem;opacity:.2">me2you.world</p>
    </div>

  </div>

  <script>
    // Config
    var theme = '{{wrappedTheme}}';
    var isLove = theme === 'love';
    if(isLove) document.documentElement.classList.add('love');

    var recipientName = '{{recipientName}}';
    var songs = [
      {name:'{{wrappedSong1}}',artist:'{{wrappedArtist1}}'},
      {name:'{{wrappedSong2}}',artist:'{{wrappedArtist2}}'},
      {name:'{{wrappedSong3}}',artist:'{{wrappedArtist3}}'},
      {name:'{{wrappedSong4}}',artist:'{{wrappedArtist4}}'},
      {name:'{{wrappedSong5}}',artist:'{{wrappedArtist5}}'}
    ];
    var minutes = parseInt('{{minutesListened}}',10) || 0;

    var validSongs = songs.filter(function(s){
      return s.name && s.name !== '' && !s.name.match(/^\\[/);
    });

    // Set theme-dependent text
    var heroLabelEl = document.getElementById('heroLabel');
    var heroSubEl = document.getElementById('heroSub');
    var artistSubEl = document.getElementById('artistSub');
    var genreLabelEl = document.getElementById('genreLabel');
    var genreSubEl = document.getElementById('genreSub');
    var minsLabelEl = document.getElementById('minsLabel');

    if(isLove){
      heroLabelEl.textContent = 'Your Love Story';
      heroSubEl.innerHTML = 'A year of music with<br><strong style="color:#fff">' + recipientName + '</strong>';
      artistSubEl.textContent = 'was the soundtrack to your love';
      genreLabelEl.textContent = 'Your Love Language';
      genreSubEl.textContent = 'The sound of your love story';
      minsLabelEl.textContent = 'You Both Listened For';
    } else {
      heroLabelEl.textContent = 'Your Friendship';
      heroSubEl.innerHTML = 'A year of music with<br><strong style="color:#fff">' + recipientName + '</strong>';
      artistSubEl.textContent = 'was the soundtrack to your friendship';
      genreLabelEl.textContent = 'Your Shared Vibe';
      genreSubEl.textContent = 'This genre defined your year together';
      minsLabelEl.textContent = 'Together You Listened For';
    }

    // Top song
    var topSongNameEl = document.getElementById('topSongName');
    var topSongArtistEl = document.getElementById('topSongArtist');
    if(validSongs.length>0){
      topSongNameEl.textContent = validSongs[0].name;
      topSongArtistEl.textContent = validSongs[0].artist;
    } else {
      topSongNameEl.textContent = 'Your Song';
      topSongArtistEl.textContent = '';
    }

    // Minutes subtext
    var minsSubEl = document.getElementById('minsSub');
    if(minutes > 0){
      var hours = Math.round(minutes/60);
      var days = (minutes/1440).toFixed(1);
      if(hours >= 24) minsSubEl.textContent = "That's about " + days + " full days of music!";
      else if(hours > 1) minsSubEl.textContent = "That's about " + hours + " hours of vibes!";
      else minsSubEl.textContent = "Every minute counts!";
    }

    // Song list
    var songListEl = document.getElementById('songList');
    var barWidths = [100,82,68,55,45];
    validSongs.forEach(function(s,i){
      var item = document.createElement('div');
      item.className = 'song-item a' + Math.min(i+1,5);
      item.innerHTML =
        '<span class="song-rank r'+(i+1)+'">'+(i+1)+'</span>'+
        '<div class="song-info">'+
          '<p class="song-name">'+s.name+'</p>'+
          '<p class="song-artist">'+s.artist+'</p>'+
          '<div class="song-bar" style="--w:'+barWidths[i]+'%;animation-delay:'+(0.3+i*0.15)+'s"></div>'+
        '</div>';
      songListEl.appendChild(item);
    });
    if(validSongs.length===0){
      songListEl.innerHTML='<p style="text-align:center;color:rgba(255,255,255,.3);padding:2rem">No songs added</p>';
    }

    // Decorations
    var decSlides = document.querySelectorAll('.slide');
    decSlides.forEach(function(sl,si){
      // Sparkles on intro, stats, finale
      if(si===0||si===3||si===6){
        for(var i=0;i<6;i++){
          var sp=document.createElement('div');
          sp.className='sparkle';
          var colors = isLove ? ['#e040fb','#ff6090','#ffab91','#fff'] : ['#1db954','#1ed760','#b9ff66','#fff'];
          sp.style.cssText='top:'+Math.random()*100+'%;left:'+Math.random()*100+'%;--dur:'+(2+Math.random()*3)+'s;--del:'+(Math.random()*3)+'s;width:'+(3+Math.random()*3)+'px;height:'+(3+Math.random()*3)+'px;background:'+colors[Math.floor(Math.random()*4)];
          sl.appendChild(sp);
        }
      }
      // Music notes on music slides
      if(si===1||si===2||si===4){
        var notes=['&#9835;','&#9834;','&#9833;'];
        for(var j=0;j<4;j++){
          var n=document.createElement('div');
          n.className='note';
          n.innerHTML=notes[j%3];
          var nc = isLove ? 'rgba(224,64,251,' : 'rgba(29,185,84,';
          n.style.cssText='top:'+(50+Math.random()*40)+'%;left:'+(10+Math.random()*80)+'%;--dur:'+(3+Math.random()*3)+'s;--del:'+(Math.random()*4)+'s;font-size:'+(1+Math.random()*0.6)+'rem;color:'+nc+(0.15+Math.random()*0.15)+')';
          sl.appendChild(n);
        }
      }
      // Hearts on love theme
      if(isLove && (si===0||si===6)){
        for(var k=0;k<6;k++){
          var h=document.createElement('div');
          h.className='heart-p';
          h.textContent='\\u2665';
          h.style.cssText='bottom:'+(5+Math.random()*30)+'%;left:'+(5+Math.random()*90)+'%;--dur:'+(4+Math.random()*4)+'s;--del:'+(Math.random()*5)+'s;font-size:'+(0.8+Math.random()*1)+'rem;color:rgba(224,64,251,'+(0.2+Math.random()*0.3)+')';
          sl.appendChild(h);
        }
      }
    });

    // Navigation
    var current=0;
    var allSlides=document.querySelectorAll('.slide');
    var total=allSlides.length;
    var dotsEl=document.getElementById('dots');
    var progFill=document.getElementById('progFill');
    var animating=false;

    for(var d=0;d<total;d++){
      var dot=document.createElement('div');
      dot.className='dot'+(d===0?' active':'');
      dotsEl.appendChild(dot);
    }

    function goTo(idx){
      if(animating||idx===current||idx<0||idx>=total)return;
      animating=true;
      var dots=document.querySelectorAll('.dot');
      allSlides[current].classList.remove('active');
      allSlides[current].classList.add('exit');
      allSlides[idx].classList.remove('exit');
      // Small delay before showing next for smoother feel
      setTimeout(function(){
        allSlides[idx].classList.add('active');
      },50);
      dots[current].classList.remove('active');
      dots[idx].classList.add('active');
      progFill.style.width=((idx/(total-1))*100)+'%';

      if(idx===3&&minutes>0)animateCounter();

      var prev=current;
      current=idx;
      setTimeout(function(){
        allSlides[prev].classList.remove('exit');
        animating=false;
      },550);
    }

    var counterDone=false;
    function animateCounter(){
      if(counterDone)return;
      counterDone=true;
      var el=document.getElementById('minutesEl');
      var target=minutes;
      var dur=1500;
      var start=performance.now();
      function tick(now){
        var p=Math.min((now-start)/dur,1);
        var e=1-Math.pow(1-p,3);
        el.textContent=Math.round(e*target).toLocaleString();
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    // Click anywhere on active slide to go next
    document.addEventListener('click',function(e){
      // Check if click is on left 30% for going back
      var x=e.clientX/window.innerWidth;
      if(x<0.3) goTo(current-1);
      else goTo(current+1);
    });

    // Swipe
    var tx=0,ty=0;
    document.addEventListener('touchstart',function(e){tx=e.changedTouches[0].screenX;ty=e.changedTouches[0].screenY},{passive:true});
    document.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].screenX-tx;
      var dy=e.changedTouches[0].screenY-ty;
      if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>40){
        if(dx<0)goTo(current+1);else goTo(current-1);
      }
    },{passive:true});

    // Keyboard
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key===' ')goTo(current+1);
      if(e.key==='ArrowLeft')goTo(current-1);
    });

    progFill.style.width='0%';
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
        description: 'Your Friendship or Love Wrapped! A Spotify-style year-in-review with animated stats, top songs, and a personal message. Tap through story-style slides.',
      })
      .where(eq(templates.name, 'Wrapped'));
    console.log('Updated Wrapped template');
  } else {
    console.log('Wrapped template not found — creating new');
    await db.insert(templates).values({
      name: 'Wrapped',
      description: 'Your Friendship or Love Wrapped! A Spotify-style year-in-review with animated stats, top songs, and a personal message. Tap through story-style slides.',
      occasion: ['friendship', 'birthday', 'anniversary', 'love', 'general'],
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
