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

    /* Friendship theme (default) */
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
      pointer-events:none;overflow:hidden;cursor:pointer;
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

    .slide::before{
      content:'';position:absolute;inset:0;
      background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
      background-size:128px;pointer-events:none;opacity:.5;z-index:0;
    }
    .slide>*{position:relative;z-index:1}

    .label{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.25em;color:rgba(255,255,255,.5);margin-bottom:.8rem}
    .big-text{font-size:clamp(2rem,9vw,3.8rem);font-weight:800;color:#fff;line-height:1.1;margin-bottom:.5rem}
    .mid-text{font-size:clamp(1.1rem,4.5vw,1.6rem);font-weight:700;color:#fff;line-height:1.4}
    .sub-text{font-size:clamp(.85rem,3.2vw,1.05rem);color:rgba(255,255,255,.55);font-weight:400;line-height:1.6}
    .accent{background:linear-gradient(135deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

    @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
    @keyframes countUp{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes barGrow{from{width:0}to{width:var(--w)}}
    @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

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

    /* Moment card */
    .moment-card{
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);
      border-radius:20px;padding:1.8rem 1.5rem;max-width:340px;width:100%;
      backdrop-filter:blur(8px);margin-top:.8rem;
    }
    .moment-text{
      color:rgba(255,255,255,.8);font-size:1rem;line-height:1.7;
      word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;
    }
    .moment-icon{font-size:2rem;margin-bottom:.6rem;animation:float 3s ease-in-out infinite}

    /* Inside joke */
    .joke-bubble{
      background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
      border:1.5px solid rgba(255,255,255,.08);border-radius:24px;
      padding:1.5rem 2rem;max-width:320px;margin-top:1rem;
      position:relative;
    }
    .joke-bubble::after{
      content:'';position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);
      width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;
      border-top:10px solid rgba(255,255,255,.06);
    }
    .joke-text{
      font-size:1.15rem;font-weight:700;color:var(--c2);font-style:italic;
      word-wrap:break-word;overflow-wrap:break-word;
    }

    /* Vinyl */
    .vinyl{
      width:min(150px,36vw);height:min(150px,36vw);border-radius:50%;position:relative;margin:.8rem auto;
      background:conic-gradient(from 0deg,#111,#222 30deg,#111 60deg,#1a1a1a 90deg,#222 120deg,#111 150deg,#1a1a1a 180deg,#222 210deg,#111 240deg,#1a1a1a 270deg,#222 300deg,#111 330deg,#1a1a1a 360deg);
      box-shadow:0 0 40px var(--vinyl-glow),0 0 80px rgba(0,0,0,.3);
    }
    .vinyl::after{
      content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:30%;height:30%;border-radius:50%;
      background:radial-gradient(circle,var(--c1) 0%,color-mix(in srgb,var(--c1),#000 40%) 50%,#111 52%);
    }
    .slide.active .vinyl{animation:spin 4s linear infinite}

    .eq{display:flex;gap:3px;align-items:flex-end;height:32px;margin:.6rem auto;justify-content:center}
    .eq-bar{width:4px;border-radius:2px;background:linear-gradient(to top,var(--c1),var(--c2));animation:eqBounce var(--d,.5s) ease-in-out infinite alternate}
    @keyframes eqBounce{from{height:var(--h1,6px)}to{height:var(--h2,24px)}}

    /* Moments list */
    .moments-list{width:100%;max-width:340px;text-align:left;margin-top:1rem}
    .moment-item{
      display:flex;align-items:flex-start;gap:.75rem;padding:.7rem .6rem;
      border-radius:14px;background:rgba(255,255,255,.04);margin-bottom:.5rem;
      border:1px solid rgba(255,255,255,.04);
    }
    .moment-rank{
      width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:.75rem;font-weight:800;flex-shrink:0;
      background:linear-gradient(135deg,color-mix(in srgb,var(--c1),transparent 80%),color-mix(in srgb,var(--c2),transparent 85%));
      color:var(--c2);border:1px solid color-mix(in srgb,var(--c1),transparent 70%);
    }
    .moment-item-text{
      font-size:.85rem;font-weight:500;color:rgba(255,255,255,.8);
      line-height:1.4;word-wrap:break-word;overflow-wrap:break-word;
      min-width:0;flex:1;
    }
    .moment-bar{
      height:3px;border-radius:2px;margin-top:6px;
      background:linear-gradient(90deg,var(--c1),var(--c2));
      animation:barGrow .8s ease-out backwards;
    }

    /* Songs list */
    .songs-list{width:100%;max-width:340px;margin-top:.6rem}
    .song-item{
      display:flex;align-items:center;gap:.6rem;padding:.45rem .5rem;
      border-radius:10px;background:rgba(255,255,255,.04);margin-bottom:.35rem;
      border:1px solid rgba(255,255,255,.04);
    }
    .song-rank{
      width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:.65rem;font-weight:800;flex-shrink:0;
      background:linear-gradient(135deg,color-mix(in srgb,var(--c1),transparent 80%),color-mix(in srgb,var(--c2),transparent 85%));
      color:var(--c2);border:1px solid color-mix(in srgb,var(--c1),transparent 70%);
    }
    .song-info{flex:1;min-width:0}
    .song-name{font-size:.8rem;font-weight:600;color:rgba(255,255,255,.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .song-artist{font-size:.65rem;color:rgba(255,255,255,.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    /* Final message */
    .msg-card{
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);
      border-radius:20px;padding:2rem 1.5rem;max-width:360px;width:100%;
      backdrop-filter:blur(8px);
    }
    .msg-text{
      color:rgba(255,255,255,.75);font-size:.95rem;line-height:1.8;font-style:italic;
      word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;
    }
    .msg-from{margin-top:1.2rem;color:rgba(255,255,255,.35);font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.15em}

    /* Progress & dots */
    .progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:100;background:rgba(255,255,255,.08)}
    .progress-fill{height:100%;background:linear-gradient(90deg,var(--c1),var(--c2));transition:width .4s ease;border-radius:0 2px 2px 0}
    .dots{position:fixed;bottom:2vh;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:100}
    .dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);transition:all .3s}
    .dot.active{background:var(--c1);width:20px;border-radius:3px}

    /* Particles */
    .sparkle{position:absolute;width:4px;height:4px;border-radius:50%;opacity:0;animation:sparkA var(--dur,3s) ease-in-out infinite var(--del,0s)}
    @keyframes sparkA{0%,100%{opacity:0;transform:scale(0)}50%{opacity:.6;transform:scale(1)}}
    .heart-p{position:absolute;opacity:0;animation:heartF var(--dur,5s) ease-in-out infinite var(--del,0s)}
    @keyframes heartF{0%{opacity:0;transform:translateY(0) scale(.5)}25%{opacity:.5;transform:translateY(-20px) scale(1)}75%{opacity:.3}100%{opacity:0;transform:translateY(-80px) scale(.6)}}
    .note{position:absolute;font-size:1.1rem;opacity:0;animation:noteF var(--dur,4s) ease-in-out infinite var(--del,0s)}
    @keyframes noteF{0%{opacity:0;transform:translateY(0)}20%{opacity:.35}80%{opacity:.35}100%{opacity:0;transform:translateY(-50px) rotate(15deg)}}

    .tap-hint{animation:pulse 2s ease-in-out infinite;font-size:.7rem;color:rgba(255,255,255,.25);margin-top:2rem}

    /* Calendar icon for together-since */
    .calendar{
      width:80px;height:90px;border-radius:14px;overflow:hidden;margin:.5rem auto;
      box-shadow:0 8px 30px rgba(0,0,0,.3);
    }
    .cal-top{height:28px;background:linear-gradient(135deg,var(--c1),var(--c2));display:flex;align-items:center;justify-content:center}
    .cal-top span{width:6px;height:6px;background:rgba(255,255,255,.6);border-radius:50%;margin:0 6px}
    .cal-body{background:rgba(255,255,255,.95);height:62px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:#1a1a2e}

    @media(max-width:380px){.slide{padding:2rem 1.2rem}.moment-item{padding:.5rem .4rem;gap:.5rem}}
  </style>
</head>
<body>
  <div style="display:none">{{enableExtraMoments}}{{enableExtraSongs}}{{wrappedTheme}}{{wrappedSong2}}{{wrappedArtist2}}{{wrappedSong3}}{{wrappedArtist3}}{{wrappedSong4}}{{wrappedArtist4}}{{wrappedSong5}}{{wrappedArtist5}}</div>

  <div class="progress"><div class="progress-fill" id="progFill"></div></div>
  <div class="dots" id="dots"></div>

  <div class="slides" id="slides">

    <!-- 0: Intro -->
    <div class="slide bg-1 active" data-slide="0">
      <div class="eq a1" aria-hidden="true">
        <div class="eq-bar" style="--h1:5px;--h2:24px;--d:.4s"></div>
        <div class="eq-bar" style="--h1:8px;--h2:32px;--d:.55s"></div>
        <div class="eq-bar" style="--h1:4px;--h2:18px;--d:.35s"></div>
        <div class="eq-bar" style="--h1:7px;--h2:28px;--d:.5s"></div>
        <div class="eq-bar" style="--h1:5px;--h2:22px;--d:.45s"></div>
      </div>
      <p class="label a2" id="heroLabel"></p>
      <h1 class="big-text a3" style="font-size:clamp(2.5rem,10vw,4.5rem)">
        <span class="accent">Wrapped</span>
      </h1>
      <p class="sub-text a4" style="margin-top:.8rem" id="heroSub"></p>
      <p class="tap-hint a5">Tap anywhere to continue</p>
    </div>

    <!-- 1: Together Since -->
    <div class="slide bg-2" data-slide="1">
      <p class="label a1" id="sinceLabel"></p>
      <div class="calendar asc" aria-hidden="true">
        <div class="cal-top"><span></span><span></span></div>
        <div class="cal-body" id="calDay"></div>
      </div>
      <p class="stat-number acnt" id="daysEl">0</p>
      <p class="big-text a3" style="font-size:1.1rem;color:rgba(255,255,255,.5)" id="daysUnit">days</p>
      <p class="sub-text a4" id="sinceSub"></p>
    </div>

    <!-- 2: Best Moment -->
    <div class="slide bg-3" data-slide="2">
      <p class="label a1" id="bestLabel">The Highlight</p>
      <div class="moment-icon asc" id="bestIcon">&#10024;</div>
      <div class="moment-card a2">
        <p class="moment-text" id="bestText">{{bestMoment}}</p>
      </div>
      <p class="sub-text a3" style="margin-top:.8rem;font-size:.75rem;opacity:.4" id="bestSub">The moment that defined your year</p>
    </div>

    <!-- 3: Inside Joke -->
    <div class="slide bg-4" data-slide="3">
      <p class="label a1" id="jokeLabel">Your Inside Joke</p>
      <div class="moment-icon asc">&#128514;</div>
      <div class="joke-bubble a2">
        <p class="joke-text">"{{insideJoke}}"</p>
      </div>
      <p class="sub-text a3" style="margin-top:1.2rem" id="jokeSub">The thing nobody else gets</p>
    </div>

    <!-- 4: Your Songs -->
    <div class="slide bg-5" data-slide="4">
      <p class="label a1" id="songLabel">Your Anthem</p>
      <div class="vinyl asc" style="width:min(100px,24vw);height:min(100px,24vw)"></div>
      <div class="songs-list a2" id="songsList"></div>
      <div class="eq a3" style="margin-top:.5rem" aria-hidden="true">
        <div class="eq-bar" style="--h1:4px;--h2:18px;--d:.35s"></div>
        <div class="eq-bar" style="--h1:7px;--h2:28px;--d:.45s"></div>
        <div class="eq-bar" style="--h1:3px;--h2:22px;--d:.4s"></div>
        <div class="eq-bar" style="--h1:6px;--h2:16px;--d:.5s"></div>
        <div class="eq-bar" style="--h1:5px;--h2:24px;--d:.38s"></div>
        <div class="eq-bar" style="--h1:8px;--h2:20px;--d:.42s"></div>
      </div>
    </div>

    <!-- 5: Top Moments -->
    <div class="slide bg-6" data-slide="5">
      <p class="label a1" id="momentsLabel">Top Moments</p>
      <div class="moments-list" id="momentsList"></div>
    </div>

    <!-- 6: Final Message -->
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
    var theme='{{wrappedTheme}}';
    var isLove=theme==='love';
    if(isLove)document.documentElement.classList.add('love');

    var recipientName='{{recipientName}}';
    var togetherSince='{{togetherSince}}';
    var allSongs=[
      {name:'{{wrappedSong1}}',artist:'{{wrappedArtist1}}'},
      {name:'{{wrappedSong2}}',artist:'{{wrappedArtist2}}'},
      {name:'{{wrappedSong3}}',artist:'{{wrappedArtist3}}'},
      {name:'{{wrappedSong4}}',artist:'{{wrappedArtist4}}'},
      {name:'{{wrappedSong5}}',artist:'{{wrappedArtist5}}'}
    ].filter(function(s){return s.name&&s.name!==''&&!s.name.match(/^\\[/)});

    var moments=[
      '{{wrappedMoment1}}','{{wrappedMoment2}}','{{wrappedMoment3}}','{{wrappedMoment4}}','{{wrappedMoment5}}'
    ].filter(function(m){return m&&m!==''&&!m.match(/^\\[/)});

    // Theme text
    var $=function(id){return document.getElementById(id)};
    if(isLove){
      $('heroLabel').textContent='Your Love Story';
      $('sinceLabel').textContent='In Love Since';
      $('sinceSub').textContent='and every day has been worth it';
      $('bestLabel').textContent='Your Best Moment';
      $('bestIcon').innerHTML='\\u2764\\uFE0F';
      $('bestSub').textContent='The moment your heart melted';
      $('jokeLabel').textContent='Your Little Secret';
      $('jokeSub').textContent='What makes you two, you';
      $('songLabel').textContent='Your Love Songs';
      $('momentsLabel').textContent='Your Love Highlights';
    }else{
      $('heroLabel').textContent='Your Friendship';
      $('sinceLabel').textContent='Friends Since';
      $('sinceSub').textContent='and counting!';
      $('bestLabel').textContent='The Highlight';
      $('bestIcon').innerHTML='&#10024;';
      $('bestSub').textContent='The moment that defined your year';
      $('jokeLabel').textContent='Your Inside Joke';
      $('jokeSub').textContent='The thing nobody else gets';
      $('songLabel').textContent='Your Top Songs';
      $('momentsLabel').textContent='Top Moments Together';
    }

    $('heroSub').innerHTML='A year of '+(isLove?'love':'memories')+' with<br><strong style="color:#fff">'+recipientName+'</strong>';

    // Together since — calculate days
    var dayCount=0;
    if(togetherSince&&!togetherSince.match(/^\\[/)){
      var parsed=new Date(togetherSince);
      if(!isNaN(parsed.getTime())){
        dayCount=Math.floor((Date.now()-parsed.getTime())/(1000*60*60*24));
        // Show abbreviated month on calendar
        var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        $('calDay').textContent=parsed.getDate();
      }
    }
    if(dayCount<=0){dayCount=0;$('sinceSub').textContent=''}

    // Songs list
    var songsList=$('songsList');
    if(allSongs.length>0){
      allSongs.forEach(function(s,i){
        var item=document.createElement('div');
        item.className='song-item a'+Math.min(i+2,5);
        var artistStr=(s.artist&&!s.artist.match(/^\\[/))?s.artist:'';
        item.innerHTML=
          '<div class="song-rank">'+(i+1)+'</div>'+
          '<div class="song-info">'+
            '<div class="song-name">'+s.name+'</div>'+
            (artistStr?'<div class="song-artist">'+artistStr+'</div>':'')+
          '</div>';
        songsList.appendChild(item);
      });
    }else{
      songsList.innerHTML='<p style="text-align:center;color:rgba(255,255,255,.3);padding:1rem;font-size:.8rem">No songs added yet</p>';
    }

    // Moments list
    var momList=$('momentsList');
    var barW=[100,80,65,52,42];
    var icons=isLove?['\\u2764\\uFE0F','\\uD83D\\uDC95','\\u2728','\\uD83C\\uDF39','\\uD83D\\uDE18']:['\\u2B50','\\uD83C\\uDF1F','\\u26A1','\\uD83C\\uDF08','\\uD83D\\uDE80'];
    moments.forEach(function(m,i){
      var item=document.createElement('div');
      item.className='moment-item a'+Math.min(i+1,5);
      item.innerHTML=
        '<div class="moment-rank">'+(i+1)+'</div>'+
        '<div style="flex:1;min-width:0">'+
          '<p class="moment-item-text">'+m+'</p>'+
          '<div class="moment-bar" style="--w:'+barW[i]+'%;animation-delay:'+(0.3+i*0.12)+'s"></div>'+
        '</div>';
      momList.appendChild(item);
    });
    if(moments.length===0){
      momList.innerHTML='<p style="text-align:center;color:rgba(255,255,255,.3);padding:2rem">No moments added yet</p>';
    }

    // Decorations
    document.querySelectorAll('.slide').forEach(function(sl,si){
      var colors=isLove?['#e040fb','#ff6090','#ffab91','#fff']:['#1db954','#1ed760','#b9ff66','#fff'];
      // Sparkles
      if(si===0||si===1||si===6){
        for(var i=0;i<7;i++){
          var sp=document.createElement('div');
          sp.className='sparkle';
          sp.style.cssText='top:'+Math.random()*100+'%;left:'+Math.random()*100+'%;--dur:'+(2+Math.random()*3)+'s;--del:'+(Math.random()*3)+'s;width:'+(3+Math.random()*3)+'px;height:'+(3+Math.random()*3)+'px;background:'+colors[Math.floor(Math.random()*4)];
          sl.appendChild(sp);
        }
      }
      // Music notes on song slide
      if(si===4){
        var notes=['&#9835;','&#9834;','&#9833;'];
        for(var j=0;j<5;j++){
          var n=document.createElement('div');n.className='note';n.innerHTML=notes[j%3];
          var nc=isLove?'rgba(224,64,251,':'rgba(29,185,84,';
          n.style.cssText='top:'+(40+Math.random()*50)+'%;left:'+(5+Math.random()*90)+'%;--dur:'+(3+Math.random()*3)+'s;--del:'+(Math.random()*4)+'s;font-size:'+(1+Math.random()*0.5)+'rem;color:'+nc+(0.15+Math.random()*0.15)+')';
          sl.appendChild(n);
        }
      }
      // Hearts on love theme — intro, best moment, finale
      if(isLove&&(si===0||si===2||si===6)){
        for(var k=0;k<5;k++){
          var h=document.createElement('div');h.className='heart-p';h.textContent='\\u2665';
          h.style.cssText='bottom:'+(5+Math.random()*30)+'%;left:'+(5+Math.random()*90)+'%;--dur:'+(4+Math.random()*4)+'s;--del:'+(Math.random()*5)+'s;font-size:'+(0.8+Math.random()*0.8)+'rem;color:rgba(224,64,251,'+(0.15+Math.random()*0.25)+')';
          sl.appendChild(h);
        }
      }
    });

    // Navigation
    var current=0;
    var allSlides=document.querySelectorAll('.slide');
    var total=allSlides.length;
    var dotsEl=$('dots');
    var progFill=$('progFill');
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
      setTimeout(function(){allSlides[idx].classList.add('active')},50);
      dots[current].classList.remove('active');
      dots[idx].classList.add('active');
      progFill.style.width=((idx/(total-1))*100)+'%';

      // Animate days counter
      if(idx===1&&dayCount>0)animateDays();

      var prev=current;current=idx;
      setTimeout(function(){allSlides[prev].classList.remove('exit');animating=false},550);
    }

    var daysAnimated=false;
    function animateDays(){
      if(daysAnimated)return;daysAnimated=true;
      var el=$('daysEl');var target=dayCount;
      var dur=1800;var start=performance.now();
      function tick(now){
        var p=Math.min((now-start)/dur,1);
        var e=1-Math.pow(1-p,3);
        el.textContent=Math.round(e*target).toLocaleString();
        if(p<1)requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    document.addEventListener('click',function(e){
      var x=e.clientX/window.innerWidth;
      if(x<0.3)goTo(current-1);else goTo(current+1);
    });

    var tx=0;
    document.addEventListener('touchstart',function(e){tx=e.changedTouches[0].screenX},{passive:true});
    document.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].screenX-tx;
      if(Math.abs(dx)>40){if(dx<0)goTo(current+1);else goTo(current-1)}
    },{passive:true});

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
        description: "Your Friendship or Love Wrapped! Swipe through your best moments, inside jokes, your anthem, and how long you've been together. Tap-through story slides.",
      })
      .where(eq(templates.name, 'Wrapped'));
    console.log('Updated Wrapped template');
  } else {
    console.log('Wrapped template not found');
  }

  process.exit(0);
}

main().catch(console.error);
