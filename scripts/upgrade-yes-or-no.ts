import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedYesOrNo = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>A Question for {{recipientName}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;font-family:'Nunito',sans-serif;background:#121212;color:#fff}

    #app{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100vh;min-height:100dvh;text-align:center;padding:1.5rem;
      position:relative;
    }

    h1{
      font-size:clamp(1.6rem,5vw,2.5rem);font-weight:800;margin-bottom:1rem;
      line-height:1.3;
      word-wrap:break-word;overflow-wrap:break-word;max-width:90vw;
    }

    .gif{
      width:min(250px,65vw);height:auto;border-radius:16px;margin-bottom:1.2rem;
      display:block;
    }
    .gif.hidden{display:none}

    #text{
      font-size:clamp(0.95rem,3.5vw,1.15rem);color:rgba(255,255,255,.7);
      margin-bottom:1.8rem;min-height:2.5em;
      max-width:90vw;line-height:1.5;
      word-wrap:break-word;overflow-wrap:break-word;
      transition:opacity .2s;
    }

    .buttons{
      display:flex;gap:12px;justify-content:center;align-items:center;
      flex-wrap:wrap;position:relative;
    }

    .btn{
      padding:14px 32px;font-size:1.15rem;font-weight:700;border:none;border-radius:12px;
      cursor:pointer;transition:transform .15s ease,font-size .3s ease;
      font-family:'Nunito',sans-serif;
      -webkit-tap-highlight-color:transparent;
    }

    .yes{
      background:linear-gradient(135deg,#4caf50,#66bb6a);color:#fff;
      box-shadow:0 4px 20px rgba(76,175,80,.4);
    }
    .yes:hover{transform:scale(1.05)}
    .yes:active{transform:scale(.97)}

    .no{
      background:linear-gradient(135deg,#f44336,#ef5350);color:#fff;
      box-shadow:0 4px 20px rgba(244,67,54,.3);
      min-width:80px;min-height:52px;
    }
    .no:hover{transform:scale(1.05)}

    /* Victory state */
    .victory-text{
      font-size:clamp(1.3rem,5vw,2rem);font-weight:800;margin-top:1rem;
      animation:popIn .5s cubic-bezier(.68,-.55,.265,1.55);
    }
    .from-text{
      font-size:clamp(.85rem,3vw,1rem);color:rgba(255,255,255,.45);margin-top:.8rem;
      font-weight:600;
    }

    @keyframes popIn{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes confettiFall{
      0%{transform:translateY(-60px) rotate(0deg) scale(0);opacity:1}
      15%{transform:translateY(0) rotate(40deg) scale(1);opacity:1}
      100%{transform:translateY(100vh) rotate(720deg) scale(.5);opacity:0}
    }
    .confetti{
      position:fixed;font-size:1.8rem;pointer-events:none;z-index:50;
      animation:confettiFall var(--dur,4s) linear forwards;
    }

    /* Floating hearts background */
    .bg-heart{
      position:fixed;pointer-events:none;opacity:.06;z-index:0;
      animation:floatUp var(--dur,12s) linear infinite;font-size:var(--size,2rem);
    }
    @keyframes floatUp{
      0%{transform:translateY(110vh) rotate(0deg)}
      100%{transform:translateY(-10vh) rotate(360deg)}
    }
  </style>
</head>
<body>
  <div style="display:none">{{senderName}}</div>

  <div id="app">
    <h1 id="heading">{{customMessage}}</h1>
    <img
      src="/images/yes-or-no/cute.gif"
      id="ask-gif" class="gif" alt="Please say yes"
    />
    <img
      src="/images/yes-or-no/yipee.gif"
      id="yes-gif" class="gif hidden" alt="Yay!"
    />
    <p id="text">Click the yes below!</p>
    <div class="buttons" id="buttons">
      <button id="yes-btn" class="btn yes">Yes</button>
      <button id="no-btn" class="btn no">No</button>
    </div>
    <div id="victory" style="display:none">
      <p class="victory-text" id="victory-text"></p>
      <p class="from-text" id="from-text"></p>
    </div>
  </div>

  <script>
    var counter=0;
    var recipientName='{{recipientName}}';
    var senderName='{{senderName}}';

    var prompts=[
      'Click the yes below!',
      "Oops! Looks like you may have clicked the wrong button... no worries - click 'Yes'!",
      'Pretty please?',
      'Stop',
      'Stop trying',
      'Stop trying to',
      'Stop trying to click',
      "Stop trying to click the",
      "Stop trying to click the 'No'",
      "Stop trying to click the 'No' button",
      "Stop trying to click the 'No' button and",
      "Stop trying to click the 'No' button and click",
      "Stop trying to click the 'No' button and click the",
      "Stop trying to click the 'No' button and click the 'Yes' button",
      "Okay clearly I need a change in strategy... go ahead, click 'No' - see if I care.",
      'Aha! You have fallen for my trap.',
      "Oh no, what's happening to the Yes button :O - I swear its not me!",
      'Alright...',
      'I feel like its really quite hard to miss the big green button at this point',
      'Surely you see a big green button and think oooooo let me click that',
      'I mean, I would',
      '...',
      'While we are here, random question:',
      'What are you doing this weekend?',
      "No way! I'm free too!",
      "Click the green button then we both won't be free",
      'Hmmm, maybe sign language will work on you',
      String.fromCodePoint(0x1F44D,0x1F44C,0x1F44F,0x1F91E,0x1F64C,0x1F44B,0x1F919,0x1F44A,0x261D,0xFE0F,0x1F91F,0x1F447,0x270B,0x1F449,0x1F91C,0x1F91B),
      'Wow, I really thought that one would get you.',
      'Well I did try my best',
      'Guess we will just be stuck here forever...',
      'With only one way to escape - I wonder what it could be?'
    ];

    var scaleFactor=1.15;
    var noBtn=document.getElementById('no-btn');
    var yesBtn=document.getElementById('yes-btn');
    var textEl=document.getElementById('text');

    noBtn.addEventListener('click',function(){
      counter=(counter+1)%prompts.length;
      textEl.textContent=prompts[counter];

      if(counter===0){
        yesBtn.style.fontSize='1.15rem';
        yesBtn.style.padding='14px 32px';
        scaleFactor=1.15;
        noBtn.style.position='relative';
        noBtn.style.top='0';
        noBtn.style.left='0';
      }

      // No button runs away (counters 3-13)
      if(counter>2&&counter<14){
        noBtn.style.position='fixed';
        noBtn.style.top=Math.max(5,Math.random()*80)+'%';
        noBtn.style.left=Math.max(5,Math.random()*80)+'%';
        noBtn.style.zIndex='99';
      }

      // No button comes back (counter 14)
      if(counter===14){
        noBtn.style.position='relative';
        noBtn.style.top='0';
        noBtn.style.left='0';
        noBtn.style.zIndex='auto';
      }

      // Yes button grows (counter > 14)
      if(counter>14){
        scaleFactor+=0.3;
        yesBtn.style.fontSize=scaleFactor+'rem';
        yesBtn.style.padding=(14+scaleFactor*4)+'px '+(32+scaleFactor*8)+'px';
      }
    });

    yesBtn.addEventListener('click',function(){
      // Hide ask state
      document.getElementById('ask-gif').classList.add('hidden');
      document.getElementById('yes-gif').classList.remove('hidden');
      noBtn.style.display='none';
      yesBtn.style.display='none';
      textEl.style.display='none';
      document.getElementById('heading').textContent='WOOOOOHOOOOO!!! I mean... nice \\uD83D\\uDE0E';

      // Show victory
      var victory=document.getElementById('victory');
      victory.style.display='block';
      var vText=document.getElementById('victory-text');
      vText.textContent='I knew you\\u2019d say yes! \\u2764\\uFE0F';
      if(senderName&&senderName!==''&&senderName.indexOf('{{')===-1){
        document.getElementById('from-text').textContent='\\u2014 '+senderName;
      }

      // Confetti
      var emojis=['\\u2764\\uFE0F','\\uD83D\\uDC95','\\uD83D\\uDC97','\\u2728','\\uD83C\\uDF89','\\uD83C\\uDF8A','\\uD83D\\uDC96','\\uD83D\\uDC9D'];
      for(var i=0;i<35;i++){
        (function(idx){
          setTimeout(function(){
            var c=document.createElement('div');
            c.className='confetti';
            c.textContent=emojis[Math.floor(Math.random()*emojis.length)];
            c.style.left=Math.random()*100+'vw';
            c.style.setProperty('--dur',(3+Math.random()*2)+'s');
            c.style.fontSize=(1.2+Math.random()*1.2)+'rem';
            document.body.appendChild(c);
            setTimeout(function(){c.remove()},5500);
          },idx*60);
        })(i);
      }
    });

    // Background floating hearts
    for(var h=0;h<8;h++){
      var heart=document.createElement('div');
      heart.className='bg-heart';
      heart.textContent='\\u2665';
      heart.style.left=Math.random()*100+'%';
      heart.style.setProperty('--dur',(8+Math.random()*12)+'s');
      heart.style.setProperty('--size',(1+Math.random()*2.5)+'rem');
      heart.style.animationDelay=(-Math.random()*12)+'s';
      document.body.appendChild(heart);
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Yes or No template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Yes or No'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedYesOrNo,
        cssTemplate: null,
        jsTemplate: null,
        description: 'Ask the big question! A cute begging GIF, escalating pleas, a runaway No button, and a growing Yes button — they literally cannot say no.',
        occasion: ['valentines', 'anniversary', 'just-because', 'friendship'],
        updatedAt: new Date(),
      })
      .where(eq(templates.name, 'Yes or No'));
    console.log('Updated Yes or No template');
  } else {
    console.log('Yes or No template not found');
  }

  process.exit(0);
}

main().catch(console.error);
