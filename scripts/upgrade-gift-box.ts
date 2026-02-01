import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedGiftBox = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>A Gift for {{recipientName}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    html,body{width:100%;height:100%;overflow:hidden;font-family:'Nunito',sans-serif}

    body{
      background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);
      display:flex;flex-direction:column;justify-content:center;align-items:center;
      min-height:100vh;min-height:100dvh;padding:1.5rem;
      -webkit-user-select:none;user-select:none;
    }

    .greeting{
      font-size:clamp(1.2rem,4.5vw,1.6rem);color:#fff;font-weight:700;
      text-align:center;margin-bottom:1.5rem;text-shadow:0 2px 12px rgba(0,0,0,.2);
      opacity:0;animation:fadeIn .8s ease .2s forwards;
      word-wrap:break-word;overflow-wrap:break-word;max-width:90vw;
    }

    /* === Gift Box (2D) === */
    .gift-wrapper{position:relative;cursor:pointer;transition:transform .1s}

    .gift-box{position:relative;width:min(220px,55vw);aspect-ratio:1/1}

    /* Box body */
    .box-body{
      position:absolute;bottom:0;width:100%;height:78%;
      background:linear-gradient(145deg,#ff6b9d,#e04080);
      border-radius:8px;border:4px solid rgba(255,255,255,.85);
      box-shadow:0 8px 30px rgba(0,0,0,.2),inset 0 -8px 20px rgba(0,0,0,.1);
    }

    /* Ribbon cross on box body */
    .ribbon-h,.ribbon-v{position:absolute;background:linear-gradient(145deg,#ffd93d,#f0b800);z-index:2}
    .ribbon-h{width:100%;height:14%;top:50%;transform:translateY(-50%);left:0}
    .ribbon-v{height:100%;width:14%;left:50%;transform:translateX(-50%);top:0}

    /* Lid */
    .box-lid{
      position:absolute;top:0;left:-5%;width:110%;height:28%;z-index:3;
      transition:transform .6s cubic-bezier(.68,-.55,.265,1.55),opacity .4s;
      transform-origin:center bottom;
    }
    .lid-face{
      width:100%;height:100%;
      background:linear-gradient(145deg,#ff85a2,#d94070);
      border-radius:8px 8px 4px 4px;border:4px solid rgba(255,255,255,.85);
      box-shadow:0 -2px 15px rgba(0,0,0,.1);
    }
    /* Ribbon on lid */
    .lid-ribbon{
      position:absolute;width:12.7%;height:100%;left:50%;transform:translateX(-50%);top:0;
      background:linear-gradient(145deg,#ffd93d,#f0b800);z-index:1;
      border-radius:4px 4px 0 0;
    }

    /* Bow */
    .bow{
      position:absolute;top:-30px;left:50%;transform:translateX(-50%);z-index:5;
      font-size:clamp(2.8rem,8vw,3.5rem);
      filter:drop-shadow(0 2px 6px rgba(0,0,0,.15));
      transition:transform .3s;
    }

    /* Power meter */
    .power-meter{
      width:min(260px,70vw);height:16px;background:rgba(255,255,255,.25);
      border-radius:10px;margin-top:1.8rem;overflow:hidden;
      opacity:0;transition:opacity .4s;
      box-shadow:inset 0 2px 4px rgba(0,0,0,.15);
    }
    .power-meter.visible{opacity:1}
    .power-fill{
      height:100%;width:0%;border-radius:10px;
      background:linear-gradient(90deg,#ffd93d,#ff6b6b,#ff3366);
      transition:width .08s ease;
    }

    .tap-text{
      color:rgba(255,255,255,.85);font-size:clamp(.8rem,3vw,.95rem);font-weight:700;
      margin-top:.6rem;opacity:0;transition:opacity .4s;text-transform:uppercase;letter-spacing:.1em;
    }
    .tap-text.visible{opacity:1;animation:pulse .6s ease infinite}

    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    @keyframes fadeIn{to{opacity:1}}

    /* Exploded states */
    .gift-wrapper.exploded .box-lid{
      transform:translateY(-250px) rotate(25deg) scale(.7);opacity:0;
    }
    .gift-wrapper.exploded .bow{
      transform:translateX(-50%) translateY(-200px) rotate(360deg) scale(0);opacity:0;
      transition:transform .6s ease,opacity .4s;
    }
    .gift-wrapper.exploded .box-body{
      animation:bodyExplode .6s ease .1s forwards;
    }
    @keyframes bodyExplode{
      0%{transform:scale(1);opacity:1}
      50%{transform:scale(1.15);opacity:.8}
      100%{transform:scale(.3);opacity:0}
    }

    /* Message card */
    .message-card{
      position:fixed;inset:0;display:none;justify-content:center;align-items:center;
      z-index:100;padding:1.5rem;
    }
    .message-card.visible{display:flex}

    .card-inner{
      background:#fff;border-radius:20px;padding:2rem 1.8rem;max-width:380px;width:100%;
      text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);
      animation:cardPop .5s cubic-bezier(.68,-.55,.265,1.55);
    }
    .card-emojis{font-size:2rem;margin-bottom:.8rem;letter-spacing:.3em}
    .card-title{
      font-size:clamp(1.2rem,4vw,1.5rem);font-weight:800;
      color:#764ba2;margin-bottom:.8rem;
      word-wrap:break-word;overflow-wrap:break-word;
    }
    .card-text{
      color:#555;font-size:clamp(.9rem,3.2vw,1.05rem);line-height:1.7;
      word-wrap:break-word;overflow-wrap:break-word;white-space:pre-wrap;
    }
    .card-from{
      margin-top:1.2rem;color:#aaa;font-size:.8rem;font-weight:600;
      text-transform:uppercase;letter-spacing:.12em;
    }
    @keyframes cardPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}

    /* Confetti */
    .confetti{
      position:fixed;width:10px;height:10px;top:-20px;pointer-events:none;z-index:50;
      animation:confettiFall linear forwards;
    }
    @keyframes confettiFall{
      0%{transform:translateY(0) rotate(0deg)}
      100%{transform:translateY(110vh) rotate(720deg)}
    }

    /* Floating sparkles */
    .sparkle{
      position:fixed;pointer-events:none;opacity:0;z-index:0;
      animation:sparkFloat var(--dur,6s) ease-in-out infinite var(--del,0s);
    }
    @keyframes sparkFloat{
      0%,100%{opacity:0;transform:translateY(0)}
      50%{opacity:.4;transform:translateY(-30px)}
    }
  </style>
</head>
<body>
  <div style="display:none">{{messageTitle}}{{senderName}}{{emoji1}}{{emoji2}}{{emoji3}}{{emoji4}}</div>

  <p class="greeting">Hey {{recipientName}}! You got a gift!</p>

  <div class="gift-wrapper" id="gift">
    <div class="gift-box">
      <div class="bow" id="bow">&#127872;</div>
      <div class="box-lid" id="lid">
        <div class="lid-ribbon"></div>
        <div class="lid-face"></div>
      </div>
      <div class="box-body">
        <div class="ribbon-h"></div>
        <div class="ribbon-v"></div>
      </div>
    </div>
  </div>

  <div class="power-meter" id="meter"><div class="power-fill" id="fill"></div></div>
  <p class="tap-text" id="tapText">Tap the gift to open it!</p>

  <div class="message-card" id="card">
    <div class="card-inner">
      <div class="card-emojis" id="emojis"></div>
      <div class="card-title" id="cardTitle"></div>
      <div class="card-text">{{customMessage}}</div>
      <div class="card-from" id="cardFrom"></div>
    </div>
  </div>

  <script>
    var power=0;
    var exploded=false;
    var gift=document.getElementById('gift');
    var meter=document.getElementById('meter');
    var fill=document.getElementById('fill');
    var tapText=document.getElementById('tapText');

    var messageTitle='{{messageTitle}}';
    var senderName='{{senderName}}';
    var emojis=['{{emoji1}}','{{emoji2}}','{{emoji3}}','{{emoji4}}'].filter(function(e){
      return e&&e!==''&&e.indexOf('{{')===-1;
    });

    // Show meter after a short delay
    setTimeout(function(){
      meter.classList.add('visible');
      tapText.classList.add('visible');
    },800);

    gift.addEventListener('click',function(){
      if(exploded)return;

      power=Math.min(power+7,100);
      fill.style.width=power+'%';

      // Shake
      var rx=(Math.random()-.5)*12;
      var ry=(Math.random()-.5)*6;
      gift.style.transform='rotate('+rx+'deg) translateX('+ry+'px)';
      setTimeout(function(){gift.style.transform=''},80);

      // Wiggle the lid more as power increases
      var lid=document.getElementById('lid');
      var lift=power*.15;
      lid.style.transform='translateY(-'+lift+'px) rotate('+(Math.random()-.5)*3+'deg)';
      setTimeout(function(){lid.style.transform=''},120);

      if(power>=100) doExplode();
    });

    function doExplode(){
      exploded=true;
      gift.classList.add('exploded');
      meter.style.opacity='0';
      tapText.style.opacity='0';

      // Confetti burst
      var colors=['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff85a2','#c44569','#f093fb','#667eea'];
      for(var i=0;i<60;i++){
        (function(idx){
          setTimeout(function(){
            var c=document.createElement('div');
            c.className='confetti';
            c.style.left=Math.random()*100+'vw';
            c.style.background=colors[Math.floor(Math.random()*colors.length)];
            c.style.animationDuration=(2+Math.random()*2)+'s';
            c.style.width=(6+Math.random()*8)+'px';
            c.style.height=(6+Math.random()*8)+'px';
            c.style.borderRadius=Math.random()>.5?'50%':'2px';
            document.body.appendChild(c);
            setTimeout(function(){c.remove()},4500);
          },idx*25);
        })(i);
      }

      // Show message card
      setTimeout(function(){
        var card=document.getElementById('card');
        card.classList.add('visible');

        // Emojis
        if(emojis.length>0){
          document.getElementById('emojis').textContent=emojis.join(' ');
        }

        // Title
        var title=messageTitle;
        if(!title||title===''||title.indexOf('{{')!==-1) title='A Special Message';
        document.getElementById('cardTitle').textContent=title;

        // From
        if(senderName&&senderName!==''&&senderName.indexOf('{{')===-1){
          document.getElementById('cardFrom').textContent='\\u2014 '+senderName;
        }
      },700);
    }

    // Background sparkles
    var sparkChars=['\\u2728','\\u2B50','\\u2764\\uFE0F','\\uD83D\\uDC96'];
    for(var s=0;s<10;s++){
      var sp=document.createElement('div');
      sp.className='sparkle';
      sp.textContent=sparkChars[s%sparkChars.length];
      sp.style.left=Math.random()*100+'%';
      sp.style.top=Math.random()*100+'%';
      sp.style.fontSize=(.6+Math.random()*.8)+'rem';
      sp.style.setProperty('--dur',(4+Math.random()*5)+'s');
      sp.style.setProperty('--del',(-Math.random()*6)+'s');
      document.body.appendChild(sp);
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Exploding Gift Box...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Exploding Gift Box'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedGiftBox,
        cssTemplate: null,
        jsTemplate: null,
        description: 'A gift box that shakes, wobbles, and explodes with confetti when tapped! Reveals a custom message card inside.',
        updatedAt: new Date(),
      })
      .where(eq(templates.name, 'Exploding Gift Box'));
    console.log('Updated Exploding Gift Box');
  } else {
    console.log('Exploding Gift Box template not found');
  }

  process.exit(0);
}

main().catch(console.error);
