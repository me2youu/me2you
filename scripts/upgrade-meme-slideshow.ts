import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const upgradedMeme = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Memes for {{recipientName}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0f;
      color: #fff;
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .container {
      max-width: 500px; width: 92%; text-align: center;
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; } }

    h1 {
      font-size: .85rem; color: #555; text-transform: uppercase;
      letter-spacing: 0.15em; margin-bottom: 0.4rem;
    }
    .name {
      font-size: 1.6rem; font-weight: 700; margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .viewer {
      background: rgba(22,22,31,0.8);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px; padding: 1.2rem;
      margin-bottom: 1.2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      transition: opacity .4s;
    }

    .media-container {
      width: 100%; aspect-ratio: 1; border-radius: 14px; overflow: hidden;
      background: #111118; display: flex; align-items: center; justify-content: center;
      margin-bottom: .8rem; position: relative;
    }
    .media-container img, .media-container video {
      max-width: 100%; max-height: 100%; object-fit: contain;
      animation: slideIn .4s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: scale(.92); }
      to { opacity: 1; transform: scale(1); }
    }
    .media-container .placeholder {
      color: #333; font-size: 3rem;
    }

    .counter {
      font-size: .75rem; color: #444; margin-bottom: .5rem;
      letter-spacing: .05em;
    }
    .progress-bar {
      width: 100%; height: 3px; background: rgba(255,255,255,.05);
      border-radius: 2px; margin-bottom: .8rem; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, #a855f7, #ec4899);
      transition: width .4s ease;
    }

    .caption {
      color: #bbb; font-size: .95rem; line-height: 1.5;
      min-height: 2.5rem; padding: 0 .5rem;
    }

    .controls {
      display: flex; gap: .8rem; justify-content: center;
    }
    button {
      padding: .7rem 2rem; font-size: .95rem; border: none; border-radius: 12px;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .next-btn {
      background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff;
      box-shadow: 0 4px 20px rgba(168,85,247,0.3);
      flex: 1; max-width: 280px;
    }
    .next-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(168,85,247,0.5); }
    .next-btn:active { transform: scale(.97); }

    .end-screen {
      display: none; text-align: center;
      animation: fadeIn 0.6s ease-out;
      padding: 2rem 0;
    }
    .end-emoji { font-size: 3rem; margin-bottom: 1rem; }
    .end-title {
      font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: .5rem;
    }
    .end-subtitle {
      color: #666; font-size: .95rem; line-height: 1.6;
    }
    .end-message {
      color: #888; font-size: 1rem; line-height: 1.6;
      margin-top: 1.5rem; padding: 1rem;
      background: rgba(168,85,247,.05);
      border: 1px solid rgba(168,85,247,.1);
      border-radius: 12px;
      font-style: italic;
    }

    /* GIF badge */
    .gif-badge {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,.7); color: #ec4899;
      font-size: .65rem; font-weight: 700; letter-spacing: .05em;
      padding: 3px 8px; border-radius: 6px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Curated memes for</h1>
    <p class="name">{{recipientName}}</p>

    <div class="viewer" id="viewer">
      <div class="media-container" id="media"></div>
      <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
      <p class="counter" id="counter"></p>
      <p class="caption" id="caption"></p>
    </div>

    <div class="controls" id="controls">
      <button class="next-btn" id="nextBtn" onclick="nextMeme()">Next Meme</button>
    </div>

    <div class="end-screen" id="endScreen">
      <div class="end-emoji">😂</div>
      <p class="end-title">That's all the memes!</p>
      <p class="end-subtitle">Hope they made you smile</p>
      <div class="end-message" id="endMsg">{{customMessage}}</div>
    </div>
  </div>

  <script>
    // Individual slide URLs and captions
    var slideData = [
      { url: '{{memeSlide1}}', cap: '{{memeCaption1}}' },
      { url: '{{memeSlide2}}', cap: '{{memeCaption2}}' },
      { url: '{{memeSlide3}}', cap: '{{memeCaption3}}' },
      { url: '{{memeSlide4}}', cap: '{{memeCaption4}}' },
      { url: '{{memeSlide5}}', cap: '{{memeCaption5}}' }
    ];

    var hasExtra = '{{enableExtraSlides}}' === 'true';

    // Filter to only slides that have a URL
    var slides = slideData.filter(function(s) { return s.url && s.url !== '' && !s.url.match(/^\\{\\{/); });

    // If no slides at all, show a default
    if (slides.length === 0) {
      slides = [{ url: 'https://media.giphy.com/media/ICOhEbwlJ0njW/giphy.gif', cap: 'No memes added yet!' }];
    }

    var current = 0;
    var total = slides.length;

    function isVideo(url) {
      return /\\.(mp4|webm|mov)/i.test(url);
    }

    function isGif(url) {
      return /\\.gif/i.test(url) || /giphy\\.com/i.test(url) || /tenor\\.com/i.test(url);
    }

    function showMeme(idx) {
      var mediaEl = document.getElementById('media');
      var s = slides[idx];
      var url = s.url;

      if (isVideo(url)) {
        mediaEl.innerHTML = '<video src="' + url + '" autoplay loop muted playsinline style="max-width:100%;max-height:100%;object-fit:contain;animation:slideIn .4s ease-out"></video>' +
          '<div class="gif-badge">VIDEO</div>';
      } else {
        mediaEl.innerHTML = '<img src="' + url + '" alt="meme" style="animation:slideIn .4s ease-out" onerror="this.parentElement.innerHTML=\\'<div class=placeholder>?</div>\\'" />' +
          (isGif(url) ? '<div class="gif-badge">GIF</div>' : '');
      }

      document.getElementById('caption').textContent = s.cap || '';
      document.getElementById('counter').textContent = (idx + 1) + ' / ' + total;
      document.getElementById('progress').style.width = ((idx + 1) / total * 100) + '%';

      // Update button text on last slide
      if (idx === total - 1) {
        document.getElementById('nextBtn').textContent = 'Finish';
      } else {
        document.getElementById('nextBtn').textContent = 'Next Meme';
      }
    }

    function nextMeme() {
      current++;
      if (current >= total) {
        document.getElementById('viewer').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('endScreen').style.display = 'block';
        return;
      }
      showMeme(current);
    }

    // Start
    showMeme(0);
  </script>
</body>
</html>`;

async function main() {
  console.log('Upgrading Meme Slideshow template...');

  const existing = await db
    .select()
    .from(templates)
    .where(eq(templates.name, 'Meme Slideshow'));

  if (existing.length > 0) {
    await db
      .update(templates)
      .set({
        htmlTemplate: upgradedMeme,
        description: 'A curated meme slideshow! Upload images or paste Giphy GIF links. Add extra slides for more laughs!',
      })
      .where(eq(templates.name, 'Meme Slideshow'));
    console.log('Updated Meme Slideshow template');
  } else {
    console.log('Meme Slideshow template not found');
  }

  process.exit(0);
}

main().catch(console.error);
