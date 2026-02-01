import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedOpenWhen = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Open When... - {{recipientName}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}

    body{
      font-family:'Lora',Georgia,serif;
      background:linear-gradient(180deg,#0f1729 0%,#1a1f35 50%,#0f1729 100%);
      min-height:100vh;color:#d4c5a9;overflow-x:hidden;
      -webkit-font-smoothing:antialiased;
    }

    .header{text-align:center;padding:2.5rem 1.5rem 1.5rem;position:relative;z-index:2}
    .title{
      font-family:'Cinzel',serif;font-size:clamp(1.8rem,6vw,2.5rem);font-weight:700;
      color:#d4af37;margin-bottom:.4rem;
      text-shadow:0 2px 20px rgba(212,175,55,.25);
    }
    .subtitle{
      font-style:italic;color:#6b6372;font-size:clamp(.9rem,3vw,1.05rem);
      word-wrap:break-word;overflow-wrap:break-word;
    }

    .envelopes{
      max-width:480px;margin:0 auto;padding:0 1.2rem 3rem;
      display:flex;flex-direction:column;gap:1rem;position:relative;z-index:2;
    }

    .envelope{
      background:linear-gradient(145deg,#1e2642,#161c30);
      border:1px solid #2a3352;border-radius:14px;
      padding:1.2rem 1.4rem;cursor:pointer;
      transition:all .3s ease;position:relative;overflow:hidden;
    }
    .envelope::before{
      content:'';position:absolute;top:0;left:0;right:0;height:3px;
      background:linear-gradient(90deg,#d4af37,#f4d03f);
      transform:scaleX(0);transition:transform .3s ease;transform-origin:left;
    }
    .envelope:hover::before,.envelope:active::before{transform:scaleX(1)}
    .envelope:hover{
      transform:translateY(-2px);
      box-shadow:0 8px 25px rgba(0,0,0,.3);border-color:rgba(212,175,55,.3);
    }
    .envelope:active{transform:scale(.98)}

    .env-label{
      font-family:'Cinzel',serif;font-size:clamp(.95rem,3.5vw,1.1rem);
      color:#d4af37;font-weight:600;margin-bottom:.35rem;
      word-wrap:break-word;overflow-wrap:break-word;
    }
    .env-desc{
      font-size:clamp(.82rem,2.8vw,.92rem);color:#7a7a8a;line-height:1.5;
      word-wrap:break-word;overflow-wrap:break-word;
    }

    /* Sealed indicator */
    .seal{
      position:absolute;top:50%;right:1rem;transform:translateY(-50%);
      width:32px;height:32px;border-radius:50%;
      background:radial-gradient(circle at 35% 35%,#c41e3a,#8b0000);
      display:flex;align-items:center;justify-content:center;
      font-family:'Cinzel',serif;font-size:.7rem;color:#f4d03f;font-weight:700;
      box-shadow:0 2px 8px rgba(139,0,0,.4);
      transition:transform .3s;
    }
    .envelope:hover .seal{transform:translateY(-50%) scale(1.1)}
    .envelope.opened .seal{background:radial-gradient(circle at 35% 35%,#2a6b3a,#1a4a2a)}

    /* Letter modal */
    .modal{
      position:fixed;inset:0;background:rgba(10,14,26,.92);
      display:none;justify-content:center;align-items:center;
      z-index:100;padding:1.2rem;backdrop-filter:blur(6px);
    }
    .modal.visible{display:flex}

    .letter{
      background:linear-gradient(145deg,#f5f0e6,#e8e0d0);color:#2c2416;
      max-width:420px;width:100%;border-radius:6px;padding:2rem 1.6rem;
      position:relative;box-shadow:0 20px 60px rgba(0,0,0,.5);
      animation:unfold .5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes unfold{
      from{transform:scaleY(0) rotateX(-60deg);opacity:0}
      to{transform:scaleY(1) rotateX(0);opacity:1}
    }

    .letter-seal{
      position:absolute;top:-16px;right:16px;
      width:42px;height:42px;border-radius:50%;
      background:radial-gradient(circle at 30% 30%,#c41e3a,#8b0000);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 15px rgba(0,0,0,.3);
      font-family:'Cinzel',serif;font-size:.65rem;color:#f4d03f;font-weight:700;
    }

    .letter-label{
      font-family:'Cinzel',serif;font-size:clamp(1rem,3.5vw,1.2rem);
      color:#8b4513;text-align:center;margin-bottom:.8rem;
      word-wrap:break-word;overflow-wrap:break-word;
    }
    .letter-body{
      font-size:clamp(.9rem,3vw,1rem);line-height:1.8;text-align:center;
      color:#4a3c2a;
      word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;
    }
    .letter-close{text-align:center;margin-top:1.5rem}
    .letter-close button{
      background:linear-gradient(145deg,#d4af37,#b8962e);border:none;
      color:#1a1f35;padding:10px 28px;border-radius:25px;
      font-family:'Cinzel',serif;font-size:.85rem;font-weight:600;
      cursor:pointer;transition:transform .2s;
    }
    .letter-close button:hover{transform:scale(1.05)}
    .letter-close button:active{transform:scale(.97)}

    /* Stars */
    .star{
      position:fixed;width:2px;height:2px;background:#fff;border-radius:50%;
      pointer-events:none;z-index:0;
      animation:twinkle var(--dur,3s) ease-in-out infinite var(--del,0s);
    }
    @keyframes twinkle{0%,100%{opacity:.15}50%{opacity:.7}}

    @media(max-width:380px){
      .envelope{padding:1rem 1.1rem}
      .letter{padding:1.5rem 1.2rem}
    }
  </style>
</head>
<body>
  <div style="display:none">{{enableExtraLetters}}</div>

  <header class="header">
    <h1 class="title">Open When...</h1>
    <p class="subtitle">Letters for {{recipientName}}</p>
  </header>

  <div class="envelopes" id="envelopes"></div>

  <div class="modal" id="modal">
    <div class="letter" onclick="event.stopPropagation()">
      <div class="letter-seal">M2Y</div>
      <h2 class="letter-label" id="lLabel"></h2>
      <div class="letter-body" id="lBody"></div>
      <div class="letter-close"><button onclick="closeModal()">Close Letter</button></div>
    </div>
  </div>

  <script>
    var letters=[
      {label:'{{letter1Label}}',content:'{{letter1Content}}'},
      {label:'{{letter2Label}}',content:'{{letter2Content}}'},
      {label:'{{letter3Label}}',content:'{{letter3Content}}'},
      {label:'{{letter4Label}}',content:'{{letter4Content}}'},
      {label:'{{letter5Label}}',content:'{{letter5Content}}'}
    ];

    // Filter out empty/placeholder letters
    var validLetters=letters.filter(function(l){
      return l.label&&l.label!==''&&l.label.indexOf('{{')===-1&&
             l.content&&l.content!==''&&l.content.indexOf('{{')===-1;
    });

    var envContainer=document.getElementById('envelopes');

    validLetters.forEach(function(letter,i){
      var env=document.createElement('div');
      env.className='envelope';
      env.onclick=function(){openLetter(i)};
      env.innerHTML=
        '<div style="padding-right:42px">'+
          '<div class="env-label">'+escapeHtml(letter.label)+'</div>'+
          '<div class="env-desc">Tap to open this letter</div>'+
        '</div>'+
        '<div class="seal">M2Y</div>';
      envContainer.appendChild(env);
    });

    if(validLetters.length===0){
      envContainer.innerHTML='<p style="text-align:center;color:#6b6372;padding:3rem 1rem;font-style:italic">No letters have been written yet.</p>';
    }

    function escapeHtml(s){
      var d=document.createElement('div');d.textContent=s;return d.innerHTML;
    }

    function openLetter(idx){
      var l=validLetters[idx];
      document.getElementById('lLabel').textContent=l.label;
      document.getElementById('lBody').textContent=l.content;
      document.getElementById('modal').classList.add('visible');
      // Mark as opened
      var envs=document.querySelectorAll('.envelope');
      if(envs[idx])envs[idx].classList.add('opened');
    }

    function closeModal(){
      document.getElementById('modal').classList.remove('visible');
    }

    // Close on backdrop click
    document.getElementById('modal').addEventListener('click',function(e){
      if(e.target===this)closeModal();
    });

    // Stars background
    for(var i=0;i<80;i++){
      var s=document.createElement('div');
      s.className='star';
      s.style.left=Math.random()*100+'%';
      s.style.top=Math.random()*100+'%';
      s.style.setProperty('--dur',(2+Math.random()*4)+'s');
      s.style.setProperty('--del',(-Math.random()*4)+'s');
      if(Math.random()>.7){s.style.width='3px';s.style.height='3px'}
      document.body.appendChild(s);
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Open When Letters...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Open When Letters'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedOpenWhen,
        cssTemplate: null,
        jsTemplate: null,
        description: 'A collection of "Open When..." letters, each sealed in an envelope. Tap to unfold and read each heartfelt message.',
        occasion: ['valentines', 'anniversary', 'just-because', 'friendship', 'birthday', 'miss-you'],
        updatedAt: new Date(),
      })
      .where(eq(templates.name, 'Open When Letters'));
    console.log('Updated Open When Letters');
  } else {
    console.log('Open When Letters template not found');
  }

  process.exit(0);
}

main().catch(console.error);
