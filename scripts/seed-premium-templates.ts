import { db } from '../src/lib/db';
import { templates } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Helper to upsert template by name
async function upsertTemplate(data: {
  name: string;
  description: string;
  occasion: string[];
  basePrice: string;
  htmlTemplate: string;
  cssTemplate?: string;
  jsTemplate?: string;
}) {
  const existing = await db.select().from(templates).where(eq(templates.name, data.name));
  
  if (existing.length > 0) {
    await db.update(templates)
      .set({
        description: data.description,
        occasion: data.occasion,
        basePrice: data.basePrice,
        htmlTemplate: data.htmlTemplate,
        cssTemplate: data.cssTemplate || '',
        jsTemplate: data.jsTemplate || '',
        updatedAt: new Date(),
      })
      .where(eq(templates.name, data.name));
    console.log(`  Updated: ${data.name}`);
  } else {
    await db.insert(templates).values({
      name: data.name,
      description: data.description,
      occasion: data.occasion,
      thumbnailUrl: '',
      basePrice: data.basePrice,
      htmlTemplate: data.htmlTemplate,
      cssTemplate: data.cssTemplate || '',
      jsTemplate: data.jsTemplate || '',
      isActive: true,
    });
    console.log(`  Created: ${data.name}`);
  }
}

// ============================================================
// TEMPLATE 1: The Receipt (CVS Style)
// ============================================================
const receiptTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt for {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Space Mono', monospace;
      background: #1a1a1a;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 2rem 1rem;
    }
    
    .receipt {
      background: #fafafa;
      color: #1a1a1a;
      width: 100%;
      max-width: 320px;
      padding: 1.5rem 1rem 3rem;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    
    /* Jagged bottom edge */
    .receipt::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      background: linear-gradient(135deg, #fafafa 25%, transparent 25%),
                  linear-gradient(225deg, #fafafa 25%, transparent 25%);
      background-size: 12px 20px;
      transform: translateY(100%);
    }
    
    /* Paper texture overlay */
    .receipt::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px dashed #ccc;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    
    .store-name {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 0.25rem;
    }
    
    .store-tagline {
      font-size: 0.7rem;
      color: #666;
      letter-spacing: 1px;
    }
    
    .date-time {
      font-size: 0.65rem;
      color: #888;
      margin-top: 0.75rem;
    }
    
    .divider {
      border: none;
      border-top: 1px dashed #ccc;
      margin: 1rem 0;
    }
    
    .customer {
      text-align: center;
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .customer-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .items {
      margin: 1rem 0;
    }
    
    .item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 0.6rem 0;
      font-size: 0.75rem;
      gap: 0.5rem;
    }
    
    .item-name {
      flex: 1;
      word-wrap: break-word;
    }
    
    .item-price {
      white-space: nowrap;
      font-weight: 700;
    }
    
    .item-price.priceless {
      color: #e91e63;
    }
    
    .total-section {
      border-top: 2px solid #1a1a1a;
      border-bottom: 2px solid #1a1a1a;
      padding: 0.75rem 0;
      margin: 1rem 0;
    }
    
    .total {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      font-weight: 700;
    }
    
    .message-section {
      text-align: center;
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    .message-label {
      font-size: 0.6rem;
      color: #888;
      letter-spacing: 2px;
      margin-bottom: 0.5rem;
    }
    
    .message {
      font-size: 0.8rem;
      line-height: 1.5;
      color: #333;
    }
    
    .barcode-section {
      text-align: center;
      margin-top: 1.5rem;
    }
    
    .barcode {
      display: flex;
      justify-content: center;
      gap: 2px;
      margin-bottom: 0.5rem;
    }
    
    .bar {
      background: #1a1a1a;
      height: 40px;
    }
    
    .barcode-number {
      font-size: 0.6rem;
      color: #888;
      letter-spacing: 3px;
    }
    
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.6rem;
      color: #888;
    }
    
    .footer-heart {
      color: #e91e63;
      font-size: 0.8rem;
    }
    
    .stars {
      color: #ffc107;
      font-size: 1rem;
      letter-spacing: 2px;
      margin: 0.5rem 0;
    }
    
    /* Animation */
    .receipt {
      animation: printIn 0.8s ease-out;
    }
    
    @keyframes printIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
        clip-path: inset(0 0 100% 0);
      }
      to {
        transform: translateY(0);
        opacity: 1;
        clip-path: inset(0 0 0 0);
      }
    }
    
    .item {
      animation: fadeIn 0.4s ease-out backwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="store-name">{{storeName}}</div>
      <div class="store-tagline">APPRECIATION STORE</div>
      <div class="date-time">{{receiptDate}}</div>
    </div>
    
    <div class="customer">
      VALUED CUSTOMER
      <div class="customer-name">{{recipientName}}</div>
    </div>
    
    <hr class="divider">
    
    <div class="items">
      <div class="item" style="animation-delay: 0.1s">
        <span class="item-name">{{item1}}</span>
        <span class="item-price">{{price1}}</span>
      </div>
      <div class="item" style="animation-delay: 0.2s">
        <span class="item-name">{{item2}}</span>
        <span class="item-price">{{price2}}</span>
      </div>
      <div class="item" style="animation-delay: 0.3s">
        <span class="item-name">{{item3}}</span>
        <span class="item-price">{{price3}}</span>
      </div>
      <div class="item" style="animation-delay: 0.4s">
        <span class="item-name">{{item4}}</span>
        <span class="item-price">{{price4}}</span>
      </div>
      <div class="item" style="animation-delay: 0.5s">
        <span class="item-name">{{item5}}</span>
        <span class="item-price priceless">{{price5}}</span>
      </div>
    </div>
    
    <div class="total-section">
      <div class="total">
        <span>TOTAL VALUE</span>
        <span>PRICELESS</span>
      </div>
    </div>
    
    <div class="stars">{{rating}}</div>
    
    <div class="message-section">
      <div class="message-label">PERSONAL NOTE</div>
      <div class="message">{{customMessage}}</div>
    </div>
    
    <div class="barcode-section">
      <div class="barcode" id="barcode"></div>
      <div class="barcode-number">{{barcodeNumber}}</div>
    </div>
    
    <div class="footer">
      THANK YOU FOR BEING AMAZING<br>
      <span class="footer-heart">♥</span> NO RETURNS ACCEPTED <span class="footer-heart">♥</span>
    </div>
  </div>
  
  <script>
    // Generate random barcode bars
    const barcode = document.getElementById('barcode');
    const pattern = [2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1,2,1,3,2,4,1,2];
    pattern.forEach(width => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.width = width + 'px';
      barcode.appendChild(bar);
      // Add space
      const space = document.createElement('div');
      space.style.width = (Math.random() * 2 + 1) + 'px';
      barcode.appendChild(space);
    });
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 2: Code Repo (GitHub Parody)
// ============================================================
const codeRepoTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{repoName}} - GitHub</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      min-height: 100vh;
      line-height: 1.5;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    
    /* Header */
    .repo-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .repo-icon {
      width: 20px;
      height: 20px;
      color: #8b949e;
    }
    
    .repo-path {
      font-size: 1.1rem;
    }
    
    .repo-path a {
      color: #58a6ff;
      text-decoration: none;
    }
    
    .repo-path a:hover {
      text-decoration: underline;
    }
    
    .repo-path span {
      color: #8b949e;
      margin: 0 0.25rem;
    }
    
    .badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border: 1px solid #30363d;
      border-radius: 2rem;
      color: #8b949e;
      margin-left: 0.5rem;
    }
    
    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid #21262d;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }
    
    .tab {
      padding: 0.75rem 1rem;
      color: #8b949e;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }
    
    .tab.active {
      color: #c9d1d9;
      border-bottom: 2px solid #f78166;
    }
    
    .tab-count {
      background: #30363d;
      padding: 0.1rem 0.5rem;
      border-radius: 2rem;
      font-size: 0.75rem;
    }
    
    /* README */
    .readme {
      border: 1px solid #30363d;
      border-radius: 6px;
      overflow: hidden;
    }
    
    .readme-header {
      background: #161b22;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #30363d;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    
    .readme-content {
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .readme h1 {
      font-size: 2rem;
      border-bottom: 1px solid #21262d;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .readme h2 {
      font-size: 1.4rem;
      border-bottom: 1px solid #21262d;
      padding-bottom: 0.3rem;
      margin: 1.5rem 0 1rem;
    }
    
    .readme p {
      margin: 1rem 0;
      color: #8b949e;
    }
    
    .readme ul {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    
    .readme li {
      margin: 0.5rem 0;
      color: #8b949e;
    }
    
    .readme code {
      font-family: 'JetBrains Mono', monospace;
      background: #161b22;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #f0883e;
    }
    
    .readme a {
      color: #58a6ff;
      text-decoration: none;
    }
    
    .readme a:hover {
      text-decoration: underline;
    }
    
    /* Commits */
    .commits {
      margin: 2rem 0;
    }
    
    .commit {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #21262d;
    }
    
    .commit-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #238636, #2ea043);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .commit-info {
      flex: 1;
    }
    
    .commit-msg {
      color: #c9d1d9;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .commit-meta {
      font-size: 0.8rem;
      color: #8b949e;
    }
    
    .commit-hash {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #8b949e;
      background: #21262d;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    
    /* Issues */
    .issue {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: #161b22;
      border-radius: 6px;
      margin: 0.75rem 0;
    }
    
    .issue-icon {
      color: #3fb950;
      font-size: 1.2rem;
    }
    
    .issue-title {
      color: #c9d1d9;
      font-weight: 500;
    }
    
    .issue-labels {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    
    .label {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 2rem;
      font-weight: 500;
    }
    
    .label.enhancement { background: #a371f7; color: #fff; }
    .label.priority { background: #f85149; color: #fff; }
    .label.love { background: #db61a2; color: #fff; }
    
    /* PR Button */
    .pr-section {
      margin-top: 2rem;
      text-align: center;
    }
    
    .pr-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #238636, #2ea043);
      color: #fff;
      padding: 1rem 2rem;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      font-size: 1rem;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
    }
    
    .pr-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 20px rgba(46, 160, 67, 0.4);
    }
    
    .pr-icon {
      font-size: 1.2rem;
    }
    
    /* Success Animation */
    .success-overlay {
      position: fixed;
      inset: 0;
      background: rgba(13, 17, 23, 0.95);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    
    .success-overlay.show {
      display: flex;
      animation: fadeIn 0.3s ease-out;
    }
    
    .success-content {
      text-align: center;
      animation: scaleIn 0.4s ease-out;
    }
    
    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .success-title {
      font-size: 1.5rem;
      color: #3fb950;
      margin-bottom: 0.5rem;
    }
    
    .success-message {
      color: #8b949e;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="repo-header">
      <svg class="repo-icon" viewBox="0 0 16 16" fill="currentColor">
        <path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path>
      </svg>
      <div class="repo-path">
        <a href="#">{{senderName}}</a>
        <span>/</span>
        <a href="#"><strong>{{repoName}}</strong></a>
      </div>
      <span class="badge">Public</span>
    </div>
    
    <div class="tabs">
      <div class="tab active">
        <span>Code</span>
      </div>
      <div class="tab">
        <span>Issues</span>
        <span class="tab-count">{{issueCount}}</span>
      </div>
      <div class="tab">
        <span>Pull requests</span>
        <span class="tab-count">1</span>
      </div>
    </div>
    
    <div class="readme">
      <div class="readme-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75V1.75zm8.755 3a2.25 2.25 0 012.25-2.25H14.5v9h-3.757c-.71 0-1.4.201-1.992.572l.004-7.322zm-1.504 7.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 011.994.574z"></path>
        </svg>
        <span>README.md</span>
      </div>
      <div class="readme-content">
        <h1>{{repoName}}</h1>
        <p>{{repoDescription}}</p>
        
        <h2>Commit History</h2>
        <div class="commits">
          <div class="commit">
            <div class="commit-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
                <path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"></path>
              </svg>
            </div>
            <div class="commit-info">
              <div class="commit-msg">{{commit1}}</div>
              <div class="commit-meta">{{senderName}} committed on {{commitDate1}}</div>
            </div>
            <span class="commit-hash">{{hash1}}</span>
          </div>
          <div class="commit">
            <div class="commit-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
                <path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"></path>
              </svg>
            </div>
            <div class="commit-info">
              <div class="commit-msg">{{commit2}}</div>
              <div class="commit-meta">{{senderName}} committed on {{commitDate2}}</div>
            </div>
            <span class="commit-hash">{{hash2}}</span>
          </div>
          <div class="commit">
            <div class="commit-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff">
                <path fill-rule="evenodd" d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z"></path>
              </svg>
            </div>
            <div class="commit-info">
              <div class="commit-msg">{{commit3}}</div>
              <div class="commit-meta">{{senderName}} committed on {{commitDate3}}</div>
            </div>
            <span class="commit-hash">{{hash3}}</span>
          </div>
        </div>
        
        <h2>Open Issues</h2>
        <div class="issue">
          <span class="issue-icon">&#9679;</span>
          <div>
            <div class="issue-title">{{issue1}}</div>
            <div class="issue-labels">
              <span class="label enhancement">enhancement</span>
            </div>
          </div>
        </div>
        <div class="issue">
          <span class="issue-icon">&#9679;</span>
          <div>
            <div class="issue-title">{{issue2}}</div>
            <div class="issue-labels">
              <span class="label priority">high priority</span>
              <span class="label love">love</span>
            </div>
          </div>
        </div>
        
        <div class="pr-section">
          <button class="pr-button" onclick="mergePR()">
            <span class="pr-icon">&#128994;</span>
            <span>Merge "{{prTitle}}" into {{recipientName}}'s heart</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="success-overlay" id="success">
    <div class="success-content">
      <div class="success-icon">&#128154;</div>
      <div class="success-title">Pull Request Merged!</div>
      <div class="success-message">{{customMessage}}</div>
    </div>
  </div>
  
  <script>
    function mergePR() {
      document.getElementById('success').classList.add('show');
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 3: Infinity Scroll Love Letter
// ============================================================
const infinityLetterTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Letter for {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Caveat:wght@500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Playfair Display', Georgia, serif;
      background: #fef9f3;
      color: #2c2c2c;
      min-height: 100vh;
      transition: background 3s ease;
    }
    
    .letter-container {
      max-width: 680px;
      margin: 0 auto;
      padding: 4rem 2rem 6rem;
    }
    
    .date {
      font-family: 'Caveat', cursive;
      font-size: 1.3rem;
      color: #a08060;
      margin-bottom: 2rem;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 1s ease forwards;
    }
    
    .salutation {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 2rem;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeUp 1s ease 0.3s forwards;
    }
    
    .salutation span {
      background: linear-gradient(120deg, #e8b4b8 0%, #e8b4b8 100%);
      background-repeat: no-repeat;
      background-size: 100% 40%;
      background-position: 0 90%;
    }
    
    .paragraph {
      font-size: 1.15rem;
      line-height: 2;
      margin-bottom: 2rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease;
    }
    
    .paragraph.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .highlight {
      background: linear-gradient(120deg, #ffd700 0%, #ffd700 100%);
      background-repeat: no-repeat;
      background-size: 0% 40%;
      background-position: 0 90%;
      cursor: pointer;
      transition: background-size 0.4s ease;
    }
    
    .highlight:hover {
      background-size: 100% 40%;
    }
    
    .highlight.clicked {
      background-size: 100% 40%;
    }
    
    .signature {
      font-family: 'Caveat', cursive;
      font-size: 2rem;
      margin-top: 3rem;
      opacity: 0;
      transform: translateY(20px) rotate(-2deg);
      transition: all 1s ease;
    }
    
    .signature.visible {
      opacity: 1;
      transform: translateY(0) rotate(-2deg);
    }
    
    .ps {
      font-style: italic;
      font-size: 1rem;
      color: #666;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0d5c8;
      opacity: 0;
      transition: opacity 1s ease;
    }
    
    .ps.visible {
      opacity: 1;
    }
    
    /* Floating elements on highlight click */
    .float-particle {
      position: fixed;
      pointer-events: none;
      font-size: 1.5rem;
      animation: floatUp 2s ease-out forwards;
      z-index: 100;
    }
    
    @keyframes fadeUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes floatUp {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-100px) scale(1.5);
      }
    }
    
    /* Progress indicator */
    .progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #e8b4b8, #d4a574);
      width: 0%;
      transition: width 0.2s ease;
      z-index: 100;
    }
    
    /* Noise overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="progress" id="progress"></div>
  
  <div class="letter-container">
    <div class="date">{{letterDate}}</div>
    
    <div class="salutation">
      My dearest <span>{{recipientName}}</span>,
    </div>
    
    <p class="paragraph" data-delay="0">
      {{paragraph1}}
    </p>
    
    <p class="paragraph" data-delay="1">
      {{paragraph2}}
    </p>
    
    <p class="paragraph" data-delay="2">
      There are moments when I think of you and <span class="highlight" data-emoji="&#10024;">{{highlight1}}</span>. 
      It's in the small things - the way you {{highlight2}}, how you always {{highlight3}}.
    </p>
    
    <p class="paragraph" data-delay="3">
      {{paragraph3}}
    </p>
    
    <p class="paragraph" data-delay="4">
      If I could tell you one thing, it would be this: <span class="highlight" data-emoji="&#128156;">{{highlight4}}</span>
    </p>
    
    <p class="paragraph" data-delay="5">
      {{paragraph4}}
    </p>
    
    <div class="signature">
      Forever yours,<br>
      {{senderName}}
    </div>
    
    <p class="ps">
      P.S. {{customMessage}}
    </p>
  </div>
  
  <script>
    // Intersection Observer for scroll animations
    const paragraphs = document.querySelectorAll('.paragraph, .signature, .ps');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, (entry.target.dataset.delay || 0) * 100);
        }
      });
    }, { threshold: 0.3 });
    
    paragraphs.forEach(p => observer.observe(p));
    
    // Background color transition based on scroll
    window.addEventListener('scroll', () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      
      // Update progress bar
      document.getElementById('progress').style.width = (scrollPercent * 100) + '%';
      
      // Transition from warm morning to evening purple
      const r = Math.round(254 - (scrollPercent * 30));
      const g = Math.round(249 - (scrollPercent * 50));
      const b = Math.round(243 + (scrollPercent * 20));
      document.body.style.background = \`rgb(\${r}, \${g}, \${b})\`;
    });
    
    // Highlight click effects
    document.querySelectorAll('.highlight').forEach(el => {
      el.addEventListener('click', (e) => {
        el.classList.add('clicked');
        
        // Create floating particles
        const emoji = el.dataset.emoji || '&#10024;';
        for (let i = 0; i < 5; i++) {
          const particle = document.createElement('div');
          particle.className = 'float-particle';
          particle.innerHTML = emoji;
          particle.style.left = (e.clientX + (Math.random() - 0.5) * 40) + 'px';
          particle.style.top = e.clientY + 'px';
          document.body.appendChild(particle);
          
          setTimeout(() => particle.remove(), 2000);
        }
      });
    });
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 4: Tamagotchi (Virtual Pet)
// ============================================================
const tamagotchiTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Little Friend for {{recipientName}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Press Start 2P', monospace;
      background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    
    .device {
      background: linear-gradient(145deg, #e8d5b7, #c9b896);
      border-radius: 30px 30px 60px 60px;
      padding: 20px;
      box-shadow: 
        0 10px 30px rgba(0,0,0,0.3),
        inset 0 2px 0 rgba(255,255,255,0.3);
      max-width: 320px;
      width: 100%;
    }
    
    .screen-border {
      background: #2a2a4a;
      border-radius: 15px;
      padding: 8px;
    }
    
    .screen {
      background: #9bbc0f;
      border-radius: 10px;
      padding: 15px;
      min-height: 280px;
      position: relative;
      image-rendering: pixelated;
    }
    
    /* Scanlines */
    .screen::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.03) 2px,
        rgba(0,0,0,0.03) 4px
      );
      pointer-events: none;
      border-radius: 10px;
    }
    
    .pet-area {
      height: 160px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    
    .egg {
      font-size: 80px;
      animation: wobble 1s ease-in-out infinite;
      cursor: pointer;
      transition: transform 0.1s;
      filter: drop-shadow(2px 4px 0 rgba(0,0,0,0.2));
    }
    
    .egg:hover {
      transform: scale(1.1);
    }
    
    .egg.hatching {
      animation: shake 0.3s ease-in-out infinite;
    }
    
    .pet {
      font-size: 70px;
      display: none;
      animation: bounce 0.6s ease-in-out infinite;
      filter: drop-shadow(2px 4px 0 rgba(0,0,0,0.2));
    }
    
    .pet.visible {
      display: block;
    }
    
    .pet.dancing {
      animation: dance 0.3s ease-in-out infinite;
    }
    
    @keyframes wobble {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(-5px) rotate(-10deg); }
      50% { transform: translateX(5px) rotate(10deg); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes dance {
      0% { transform: translateY(0) rotate(-10deg); }
      25% { transform: translateY(-15px) rotate(0deg); }
      50% { transform: translateY(0) rotate(10deg); }
      75% { transform: translateY(-15px) rotate(0deg); }
      100% { transform: translateY(0) rotate(-10deg); }
    }
    
    .stats {
      margin-top: 10px;
    }
    
    .stat-label {
      font-size: 8px;
      color: #306230;
      margin-bottom: 4px;
    }
    
    .stat-bar {
      height: 16px;
      background: #306230;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .stat-fill {
      height: 100%;
      background: #0f380f;
      width: 0%;
      transition: width 0.3s ease;
    }
    
    .stat-fill.full {
      background: #ff6b6b;
      animation: pulse 0.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .buttons {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
    }
    
    .btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.1s;
      box-shadow: 
        0 4px 0 rgba(0,0,0,0.2),
        inset 0 2px 0 rgba(255,255,255,0.3);
    }
    
    .btn:active {
      transform: translateY(2px);
      box-shadow: 
        0 2px 0 rgba(0,0,0,0.2),
        inset 0 2px 0 rgba(255,255,255,0.3);
    }
    
    .btn-feed { background: #ff9f43; }
    .btn-pet { background: #ee5a5a; }
    .btn-play { background: #4cd137; }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .message {
      text-align: center;
      font-size: 8px;
      color: #0f380f;
      margin-top: 10px;
      min-height: 24px;
      line-height: 1.5;
    }
    
    .win-message {
      position: absolute;
      inset: 0;
      background: rgba(155, 188, 15, 0.95);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      padding: 20px;
    }
    
    .win-message.visible {
      display: flex;
    }
    
    .win-title {
      font-size: 12px;
      color: #0f380f;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .win-text {
      font-size: 8px;
      color: #306230;
      text-align: center;
      line-height: 2;
    }
    
    .hearts {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 16px;
    }
    
    /* Float hearts animation */
    .float-heart {
      position: absolute;
      font-size: 20px;
      animation: floatHeart 1s ease-out forwards;
      pointer-events: none;
    }
    
    @keyframes floatHeart {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-50px) scale(1.5); }
    }
    
    .instruction {
      text-align: center;
      font-size: 6px;
      color: #5a4a3a;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="device">
    <div class="screen-border">
      <div class="screen" id="screen">
        <div class="hearts" id="hearts"></div>
        
        <div class="pet-area">
          <div class="egg" id="egg" onclick="hatchEgg()">🥚</div>
          <div class="pet" id="pet">{{petEmoji}}</div>
        </div>
        
        <div class="stats">
          <div class="stat-label">LOVE METER</div>
          <div class="stat-bar">
            <div class="stat-fill" id="loveFill"></div>
          </div>
        </div>
        
        <div class="message" id="message">Tap the egg to hatch!</div>
        
        <div class="win-message" id="winMessage">
          <div class="win-title">{{petEmoji}} LOVE MAXED! {{petEmoji}}</div>
          <div class="win-text">{{customMessage}}</div>
        </div>
      </div>
    </div>
    
    <div class="buttons">
      <button class="btn btn-feed" id="btnFeed" onclick="feed()" disabled title="Feed">🧁</button>
      <button class="btn btn-pet" id="btnPet" onclick="pet()" disabled title="Pet">💕</button>
      <button class="btn btn-play" id="btnPlay" onclick="play()" disabled title="Play">🎮</button>
    </div>
    
    <div class="instruction">Made with love for {{recipientName}}</div>
  </div>
  
  <script>
    let hatched = false;
    let love = 0;
    let clickCount = 0;
    const maxLove = 100;
    
    const messages = [
      "{{petName}} looks hungry...",
      "{{petName}} wants attention!",
      "{{petName}} is so happy!",
      "{{petName}} loves you!",
      "Keep going!",
      "Almost there!",
      "{{petName}} is dancing!"
    ];
    
    function hatchEgg() {
      const egg = document.getElementById('egg');
      clickCount++;
      
      egg.classList.add('hatching');
      document.getElementById('message').textContent = 'Keep tapping! (' + clickCount + '/5)';
      
      if (clickCount >= 5) {
        egg.style.display = 'none';
        document.getElementById('pet').classList.add('visible');
        document.getElementById('btnFeed').disabled = false;
        document.getElementById('btnPet').disabled = false;
        document.getElementById('btnPlay').disabled = false;
        hatched = true;
        document.getElementById('message').textContent = messages[0];
        createHearts(3);
      }
    }
    
    function addLove(amount) {
      love = Math.min(love + amount, maxLove);
      document.getElementById('loveFill').style.width = love + '%';
      
      if (love >= maxLove) {
        win();
      } else {
        const msgIndex = Math.min(Math.floor(love / 20), messages.length - 1);
        document.getElementById('message').textContent = messages[msgIndex];
      }
    }
    
    function feed() {
      if (!hatched || love >= maxLove) return;
      addLove(10);
      createHearts(2);
      animatePet();
    }
    
    function pet() {
      if (!hatched || love >= maxLove) return;
      addLove(15);
      createHearts(3);
      animatePet();
    }
    
    function play() {
      if (!hatched || love >= maxLove) return;
      addLove(20);
      createHearts(4);
      animatePet();
    }
    
    function animatePet() {
      const pet = document.getElementById('pet');
      pet.style.animation = 'none';
      pet.offsetHeight; // Trigger reflow
      pet.style.animation = 'dance 0.3s ease-in-out 3';
      setTimeout(() => {
        pet.style.animation = 'bounce 0.6s ease-in-out infinite';
      }, 900);
    }
    
    function createHearts(count) {
      const screen = document.getElementById('screen');
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'float-heart';
          heart.textContent = '❤️';
          heart.style.left = (30 + Math.random() * 40) + '%';
          heart.style.top = '50%';
          screen.appendChild(heart);
          setTimeout(() => heart.remove(), 1000);
        }, i * 100);
      }
    }
    
    function win() {
      document.getElementById('pet').classList.add('dancing');
      document.getElementById('loveFill').classList.add('full');
      document.getElementById('btnFeed').disabled = true;
      document.getElementById('btnPet').disabled = true;
      document.getElementById('btnPlay').disabled = true;
      
      setTimeout(() => {
        document.getElementById('winMessage').classList.add('visible');
      }, 1500);
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 5: Netflix Streaming Service Parody
// ============================================================
const netflixTemplate = `<!DOCTYPE html>
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
      height: 85vh;
      min-height: 500px;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 0 4% 15%;
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
    
    @media (max-width: 600px) {
      .show-logo { font-size: 2.5rem; }
      .hero { height: 70vh; padding-bottom: 20%; }
      .card { width: 140px; }
      .nav { display: none; }
    }
  </style>
</head>
<body>
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
          <span>▶</span> Play
        </button>
        <button class="btn btn-info">
          <span>ℹ</span> More Info
        </button>
      </div>
    </div>
  </section>
  
  <section class="content">
    <div class="row">
      <h2 class="row-title">Season 1: The Beginning</h2>
      <div class="row-content">
        <div class="card" onclick="showModal('ep1')">
          <div class="card-info">
            <div class="card-title">{{episode1Title}}</div>
            <div class="card-ep">E1 • {{episode1Date}}</div>
          </div>
        </div>
        <div class="card" onclick="showModal('ep2')">
          <div class="card-info">
            <div class="card-title">{{episode2Title}}</div>
            <div class="card-ep">E2 • {{episode2Date}}</div>
          </div>
        </div>
        <div class="card" onclick="showModal('ep3')">
          <div class="card-info">
            <div class="card-title">{{episode3Title}}</div>
            <div class="card-ep">E3 • {{episode3Date}}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <h2 class="row-title">Top 10 Things About {{recipientName}}</h2>
      <div class="row-content">
        <div class="top10-card">
          <span class="top10-num">1</span>
          <div class="card-title">{{top1}}</div>
        </div>
        <div class="top10-card">
          <span class="top10-num">2</span>
          <div class="card-title">{{top2}}</div>
        </div>
        <div class="top10-card">
          <span class="top10-num">3</span>
          <div class="card-title">{{top3}}</div>
        </div>
        <div class="top10-card">
          <span class="top10-num">4</span>
          <div class="card-title">{{top4}}</div>
        </div>
        <div class="top10-card">
          <span class="top10-num">5</span>
          <div class="card-title">{{top5}}</div>
        </div>
      </div>
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
    const episodes = {
      main: { title: '{{showTitle}}', desc: '{{customMessage}}' },
      ep1: { title: '{{episode1Title}}', desc: '{{episode1Desc}}' },
      ep2: { title: '{{episode2Title}}', desc: '{{episode2Desc}}' },
      ep3: { title: '{{episode3Title}}', desc: '{{episode3Desc}}' }
    };
    
    function showModal(ep) {
      document.getElementById('modalTitle').textContent = episodes[ep].title;
      document.getElementById('modalDesc').textContent = episodes[ep].desc;
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

// ============================================================
// TEMPLATE 6: Exploding Gift Box
// ============================================================
const giftBoxTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Gift for {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      padding: 2rem;
    }
    
    .greeting {
      font-size: 1.5rem;
      color: #fff;
      text-align: center;
      margin-bottom: 2rem;
      opacity: 0;
      animation: fadeIn 1s ease forwards;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .box-container {
      perspective: 1000px;
      position: relative;
    }
    
    .box {
      width: 200px;
      height: 200px;
      position: relative;
      transform-style: preserve-3d;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    
    .box:hover {
      transform: scale(1.05) rotateY(5deg);
    }
    
    .box-face {
      position: absolute;
      width: 200px;
      height: 200px;
      background: linear-gradient(145deg, #ff6b9d, #c44569);
      border: 4px solid #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .box-front { transform: translateZ(100px); }
    .box-back { transform: translateZ(-100px) rotateY(180deg); }
    .box-left { transform: translateX(-100px) rotateY(-90deg); }
    .box-right { transform: translateX(100px) rotateY(90deg); }
    .box-bottom { transform: translateY(100px) rotateX(-90deg); }
    
    .box-top {
      transform: translateY(-100px) rotateX(90deg);
      background: linear-gradient(145deg, #ff85a2, #c44569);
      transition: transform 0.6s ease;
      transform-origin: top;
    }
    
    .ribbon {
      position: absolute;
      background: linear-gradient(145deg, #ffd93d, #f6c90e);
      z-index: 10;
    }
    
    .ribbon-h {
      width: 220px;
      height: 30px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(101px);
    }
    
    .ribbon-v {
      width: 30px;
      height: 220px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateZ(101px);
    }
    
    .bow {
      position: absolute;
      top: -40px;
      left: 50%;
      transform: translateX(-50%) translateZ(102px);
      font-size: 60px;
      cursor: pointer;
      transition: transform 0.3s ease;
      z-index: 20;
    }
    
    .bow:hover {
      transform: translateX(-50%) translateZ(102px) scale(1.2);
    }
    
    .bow.untied {
      animation: flyAway 0.5s ease forwards;
    }
    
    @keyframes flyAway {
      to { transform: translateX(200px) translateY(-200px) rotate(360deg) scale(0); opacity: 0; }
    }
    
    .power-meter {
      width: 250px;
      height: 20px;
      background: rgba(255,255,255,0.3);
      border-radius: 10px;
      margin-top: 2rem;
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .power-meter.visible {
      opacity: 1;
    }
    
    .power-fill {
      height: 100%;
      background: linear-gradient(90deg, #ffd93d, #ff6b6b, #ff3366);
      width: 0%;
      transition: width 0.1s ease;
      border-radius: 10px;
    }
    
    .tap-text {
      color: #fff;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .tap-text.visible {
      opacity: 1;
      animation: pulse 0.5s ease infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    /* Exploded state */
    .box.exploded .box-top { transform: translateY(-300px) rotateX(90deg) rotateZ(30deg); }
    .box.exploded .box-front { transform: translateZ(300px) rotateX(-30deg); opacity: 0; }
    .box.exploded .box-left { transform: translateX(-300px) rotateY(-90deg) rotateZ(-20deg); opacity: 0; }
    .box.exploded .box-right { transform: translateX(300px) rotateY(90deg) rotateZ(20deg); opacity: 0; }
    .box.exploded .ribbon { opacity: 0; }
    
    /* Gallery */
    .gallery {
      position: fixed;
      inset: 0;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 100;
      padding: 2rem;
    }
    
    .gallery.visible {
      display: flex;
    }
    
    .gallery-content {
      text-align: center;
      animation: scaleIn 0.5s ease;
    }
    
    .photo-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .photo {
      width: 120px;
      height: 120px;
      background: #fff;
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transform: rotate(var(--r, 0deg));
      animation: floatIn 0.5s ease backwards;
    }
    
    .photo:nth-child(1) { --r: -5deg; animation-delay: 0.1s; }
    .photo:nth-child(2) { --r: 3deg; animation-delay: 0.2s; }
    .photo:nth-child(3) { --r: -3deg; animation-delay: 0.3s; }
    .photo:nth-child(4) { --r: 5deg; animation-delay: 0.4s; }
    
    .photo-inner {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #ffecd2, #fcb69f);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2.5rem;
    }
    
    @keyframes floatIn {
      from { transform: translateY(50px) rotate(var(--r, 0deg)) scale(0); opacity: 0; }
      to { transform: translateY(0) rotate(var(--r, 0deg)) scale(1); opacity: 1; }
    }
    
    .message-reveal {
      background: #fff;
      padding: 2rem;
      border-radius: 16px;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: floatIn 0.6s ease 0.5s backwards;
    }
    
    .message-title {
      font-size: 1.5rem;
      color: #764ba2;
      margin-bottom: 1rem;
    }
    
    .message-text {
      color: #666;
      line-height: 1.6;
    }
    
    /* Confetti */
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      top: -20px;
      animation: fall linear forwards;
      z-index: 50;
    }
    
    @keyframes fall {
      to { transform: translateY(100vh) rotate(720deg); }
    }
    
    @keyframes fadeIn {
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="greeting">Hey {{recipientName}}! You got a gift!</div>
  
  <div class="box-container">
    <div class="box" id="box">
      <div class="box-face box-front"></div>
      <div class="box-face box-back"></div>
      <div class="box-face box-left"></div>
      <div class="box-face box-right"></div>
      <div class="box-face box-top"></div>
      <div class="box-face box-bottom"></div>
      <div class="ribbon ribbon-h"></div>
      <div class="ribbon ribbon-v"></div>
      <div class="bow" id="bow" onclick="untieRibbon()">🎀</div>
    </div>
  </div>
  
  <div class="power-meter" id="powerMeter">
    <div class="power-fill" id="powerFill"></div>
  </div>
  <div class="tap-text" id="tapText">TAP THE BOX RAPIDLY!</div>
  
  <div class="gallery" id="gallery">
    <div class="gallery-content">
      <div class="photo-grid">
        <div class="photo"><div class="photo-inner">{{emoji1}}</div></div>
        <div class="photo"><div class="photo-inner">{{emoji2}}</div></div>
        <div class="photo"><div class="photo-inner">{{emoji3}}</div></div>
        <div class="photo"><div class="photo-inner">{{emoji4}}</div></div>
      </div>
      <div class="message-reveal">
        <div class="message-title">{{messageTitle}}</div>
        <div class="message-text">{{customMessage}}</div>
      </div>
    </div>
  </div>
  
  <script>
    let ribbonUntied = false;
    let power = 0;
    let tapping = false;
    
    function untieRibbon() {
      if (ribbonUntied) return;
      ribbonUntied = true;
      document.getElementById('bow').classList.add('untied');
      document.querySelectorAll('.ribbon').forEach(r => r.style.opacity = '0');
      
      setTimeout(() => {
        document.getElementById('powerMeter').classList.add('visible');
        document.getElementById('tapText').classList.add('visible');
        document.getElementById('box').addEventListener('click', tapBox);
      }, 600);
    }
    
    function tapBox() {
      if (!ribbonUntied || tapping) return;
      
      power = Math.min(power + 8, 100);
      document.getElementById('powerFill').style.width = power + '%';
      
      // Shake effect
      const box = document.getElementById('box');
      box.style.transform = 'scale(1.05) rotate(' + (Math.random() - 0.5) * 10 + 'deg)';
      setTimeout(() => box.style.transform = '', 100);
      
      if (power >= 100) {
        explode();
      }
    }
    
    function explode() {
      tapping = true;
      const box = document.getElementById('box');
      box.classList.add('exploded');
      document.getElementById('powerMeter').style.opacity = '0';
      document.getElementById('tapText').style.opacity = '0';
      
      // Confetti
      for (let i = 0; i < 50; i++) {
        setTimeout(() => createConfetti(), i * 30);
      }
      
      setTimeout(() => {
        document.getElementById('gallery').classList.add('visible');
      }, 800);
    }
    
    function createConfetti() {
      const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff85a2'];
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 7: Vinyl Player
// ============================================================
const vinylTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Song - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(180deg, #2d1f3d 0%, #1a1225 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      overflow: hidden;
    }
    
    /* Grain overlay */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.05;
      pointer-events: none;
      z-index: 100;
    }
    
    .player {
      background: linear-gradient(145deg, #3d2a4d, #2a1d35);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 
        0 30px 60px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
      max-width: 400px;
      width: 100%;
    }
    
    .player-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .brand {
      font-family: 'Playfair Display', serif;
      font-size: 1.2rem;
      color: #d4a574;
      letter-spacing: 2px;
    }
    
    .power-light {
      width: 8px;
      height: 8px;
      background: #444;
      border-radius: 50%;
      transition: all 0.3s;
    }
    
    .power-light.on {
      background: #4ade80;
      box-shadow: 0 0 10px #4ade80;
    }
    
    .turntable {
      position: relative;
      padding-bottom: 100%;
      background: #1a1225;
      border-radius: 50%;
      margin-bottom: 20px;
      box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
    }
    
    .platter {
      position: absolute;
      inset: 10%;
      background: conic-gradient(
        from 0deg,
        #222 0deg,
        #333 10deg,
        #222 20deg,
        #333 30deg,
        #222 40deg,
        #333 50deg,
        #222 60deg
      );
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .platter.spinning {
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .label {
      width: 40%;
      height: 40%;
      background: linear-gradient(145deg, #d4a574, #b8956a);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 10px;
    }
    
    .label-title {
      font-family: 'Playfair Display', serif;
      font-size: 0.7rem;
      color: #1a1225;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .label-artist {
      font-size: 0.5rem;
      color: #3d2a4d;
    }
    
    .center-hole {
      width: 8px;
      height: 8px;
      background: #1a1225;
      border-radius: 50%;
      margin-top: 5px;
    }
    
    /* Tonearm */
    .tonearm-container {
      position: absolute;
      right: 5%;
      top: 10%;
      width: 50%;
      height: 60%;
    }
    
    .tonearm {
      position: absolute;
      right: 0;
      top: 0;
      width: 80%;
      height: 8px;
      background: linear-gradient(90deg, #888, #aaa);
      transform-origin: right center;
      transform: rotate(-30deg);
      transition: transform 0.8s ease;
      cursor: grab;
      border-radius: 4px;
    }
    
    .tonearm.playing {
      transform: rotate(15deg);
    }
    
    .tonearm::before {
      content: '';
      position: absolute;
      right: -15px;
      top: -10px;
      width: 30px;
      height: 30px;
      background: radial-gradient(circle, #aaa, #666);
      border-radius: 50%;
    }
    
    .tonearm::after {
      content: '';
      position: absolute;
      left: -8px;
      top: -4px;
      width: 15px;
      height: 15px;
      background: #666;
      clip-path: polygon(100% 50%, 0 0, 0 100%);
    }
    
    .instruction {
      text-align: center;
      color: #8b7a9e;
      font-size: 0.8rem;
      margin-bottom: 15px;
      min-height: 1.5em;
    }
    
    /* Notes */
    .notes-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      min-height: 80px;
    }
    
    .note {
      background: rgba(212, 165, 116, 0.2);
      border: 1px solid #d4a574;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.75rem;
      color: #d4a574;
      cursor: pointer;
      transition: all 0.3s;
      opacity: 0;
      transform: translateY(20px);
    }
    
    .note.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .note:hover {
      background: rgba(212, 165, 116, 0.3);
      transform: translateY(-2px);
    }
    
    /* Message modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(26, 18, 37, 0.95);
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
      background: #2d1f3d;
      border-radius: 16px;
      padding: 2rem;
      max-width: 350px;
      text-align: center;
      animation: scaleIn 0.3s ease;
    }
    
    .modal-emoji {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    
    .modal-text {
      color: #c9b8d9;
      line-height: 1.6;
    }
    
    .modal-close {
      margin-top: 1.5rem;
      background: #d4a574;
      border: none;
      color: #1a1225;
      padding: 10px 30px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 500;
    }
    
    /* Floating notes animation */
    .float-note {
      position: fixed;
      font-size: 1.5rem;
      pointer-events: none;
      animation: floatNote 3s ease-out forwards;
      z-index: 50;
    }
    
    @keyframes floatNote {
      0% { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(-200px) rotate(20deg); }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .song-link {
      display: block;
      margin-top: 15px;
      color: #d4a574;
      text-decoration: none;
      font-size: 0.85rem;
    }
    
    .song-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="player">
    <div class="player-top">
      <div class="brand">ME2YOU</div>
      <div class="power-light" id="powerLight"></div>
    </div>
    
    <div class="turntable">
      <div class="platter" id="platter">
        <div class="label">
          <div class="label-title">{{songTitle}}</div>
          <div class="label-artist">{{artistName}}</div>
          <div class="center-hole"></div>
        </div>
      </div>
      <div class="tonearm-container">
        <div class="tonearm" id="tonearm" onclick="dropNeedle()"></div>
      </div>
    </div>
    
    <div class="instruction" id="instruction">Drag the needle onto the record</div>
    
    <div class="notes-container" id="notes">
      <div class="note" data-text="{{note1Text}}" onclick="showNote(this)">{{note1}}</div>
      <div class="note" data-text="{{note2Text}}" onclick="showNote(this)">{{note2}}</div>
      <div class="note" data-text="{{note3Text}}" onclick="showNote(this)">{{note3}}</div>
    </div>
    
    <a href="{{spotifyLink}}" target="_blank" class="song-link" id="songLink" style="display:none;">
      🎵 Listen on Spotify
    </a>
  </div>
  
  <div class="modal" id="modal" onclick="closeModal()">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-emoji" id="modalEmoji">🎵</div>
      <div class="modal-text" id="modalText"></div>
      <button class="modal-close" onclick="closeModal()">Close</button>
    </div>
  </div>
  
  <script>
    let playing = false;
    let noteInterval;
    
    function dropNeedle() {
      if (playing) return;
      playing = true;
      
      document.getElementById('tonearm').classList.add('playing');
      document.getElementById('platter').classList.add('spinning');
      document.getElementById('powerLight').classList.add('on');
      document.getElementById('instruction').textContent = 'Now playing... Click the notes below!';
      document.getElementById('songLink').style.display = 'block';
      
      // Show notes one by one
      const notes = document.querySelectorAll('.note');
      notes.forEach((note, i) => {
        setTimeout(() => {
          note.classList.add('visible');
        }, (i + 1) * 500);
      });
      
      // Floating music notes
      noteInterval = setInterval(createFloatingNote, 800);
    }
    
    function createFloatingNote() {
      const notes = ['🎵', '🎶', '♪', '♫'];
      const note = document.createElement('div');
      note.className = 'float-note';
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = (20 + Math.random() * 60) + '%';
      note.style.top = '60%';
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 3000);
    }
    
    function showNote(el) {
      document.getElementById('modalEmoji').textContent = el.textContent;
      document.getElementById('modalText').textContent = el.dataset.text;
      document.getElementById('modal').classList.add('visible');
    }
    
    function closeModal() {
      document.getElementById('modal').classList.remove('visible');
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 8: Constellation Star Map
// ============================================================
const constellationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Written in the Stars - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cormorant Garamond', serif;
      background: #0a0a14;
      min-height: 100vh;
      overflow: hidden;
    }
    
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .ui {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 10;
    }
    
    .instruction {
      color: #6b7aa1;
      font-size: 1rem;
      margin-bottom: 15px;
      transition: opacity 0.5s;
    }
    
    .progress-dots {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .dot {
      width: 10px;
      height: 10px;
      background: #1e2438;
      border: 1px solid #3d4a6b;
      border-radius: 50%;
      transition: all 0.3s;
    }
    
    .dot.connected {
      background: #64b5f6;
      border-color: #64b5f6;
      box-shadow: 0 0 10px #64b5f6;
    }
    
    .message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      opacity: 0;
      transition: opacity 1s;
      pointer-events: none;
      z-index: 20;
    }
    
    .message.visible {
      opacity: 1;
    }
    
    .message-text {
      font-size: 2rem;
      color: #fff;
      text-shadow: 0 0 30px rgba(100, 181, 246, 0.5);
      margin-bottom: 1rem;
    }
    
    .message-sub {
      font-size: 1.2rem;
      color: #6b7aa1;
      font-style: italic;
    }
    
    .custom-message {
      margin-top: 2rem;
      font-size: 1rem;
      color: #8b9cc1;
      max-width: 400px;
      line-height: 1.8;
    }
    
    .reset-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(100, 181, 246, 0.2);
      border: 1px solid #64b5f6;
      color: #64b5f6;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 30;
    }
    
    .reset-btn.visible {
      opacity: 1;
    }
    
    .reset-btn:hover {
      background: rgba(100, 181, 246, 0.3);
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  
  <div class="ui" id="ui">
    <div class="instruction" id="instruction">Connect the bright stars</div>
    <div class="progress-dots" id="progressDots"></div>
  </div>
  
  <div class="message" id="message">
    <div class="message-text">{{revealText}}</div>
    <div class="message-sub">For {{recipientName}}</div>
    <div class="custom-message">{{customMessage}}</div>
  </div>
  
  <button class="reset-btn" id="resetBtn" onclick="resetGame()">Start Over</button>
  
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    let keyStars = [];
    let connections = [];
    let currentStar = null;
    let mouseX = 0, mouseY = 0;
    let completed = false;
    
    // Configuration - shape to draw (heart by default)
    const SHAPE_POINTS = {{shapePoints}}; // Will be replaced with actual points
    const TOTAL_KEY_STARS = SHAPE_POINTS.length;
    
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateStars();
      generateKeyStars();
    }
    
    function generateStars() {
      stars = [];
      const count = Math.floor((width * height) / 3000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03
        });
      }
    }
    
    function generateKeyStars() {
      keyStars = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.3;
      
      SHAPE_POINTS.forEach((point, i) => {
        keyStars.push({
          x: centerX + point[0] * scale,
          y: centerY + point[1] * scale,
          size: 4,
          connected: false,
          index: i
        });
      });
      
      // Create progress dots
      const dotsContainer = document.getElementById('progressDots');
      dotsContainer.innerHTML = '';
      for (let i = 0; i < TOTAL_KEY_STARS; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.id = 'dot' + i;
        dotsContainer.appendChild(dot);
      }
    }
    
    function draw() {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);
      
      // Draw background stars
      stars.forEach(star => {
        star.twinkle += star.speed;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.fillStyle = \`rgba(255, 255, 255, \${alpha})\`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw connections
      ctx.strokeStyle = '#64b5f6';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#64b5f6';
      ctx.shadowBlur = 10;
      
      connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      });
      
      // Draw line to mouse if dragging
      if (currentStar && !completed) {
        ctx.beginPath();
        ctx.moveTo(currentStar.x, currentStar.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      
      // Draw key stars
      keyStars.forEach(star => {
        const glow = star.connected ? 20 : 10;
        const color = star.connected ? '#64b5f6' : '#fff';
        
        // Glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glow);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glow, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(draw);
    }
    
    function getStarAt(x, y) {
      return keyStars.find(star => {
        const dist = Math.hypot(star.x - x, star.y - y);
        return dist < 30;
      });
    }
    
    function handleMouseDown(e) {
      if (completed) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const star = getStarAt(x, y);
      if (star && !star.connected) {
        currentStar = star;
      }
    }
    
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }
    
    function handleMouseUp(e) {
      if (!currentStar || completed) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const targetStar = getStarAt(x, y);
      
      if (targetStar && targetStar !== currentStar && !targetStar.connected) {
        // Valid connection
        connections.push({ from: currentStar, to: targetStar });
        currentStar.connected = true;
        targetStar.connected = true;
        
        // Update progress
        const connectedCount = keyStars.filter(s => s.connected).length;
        document.querySelectorAll('.dot').forEach((dot, i) => {
          if (i < connectedCount) dot.classList.add('connected');
        });
        
        // Check if complete
        if (keyStars.every(s => s.connected)) {
          complete();
        }
      }
      
      currentStar = null;
    }
    
    function complete() {
      completed = true;
      document.getElementById('instruction').style.opacity = '0';
      document.getElementById('message').classList.add('visible');
      document.getElementById('resetBtn').classList.add('visible');
    }
    
    function resetGame() {
      completed = false;
      connections = [];
      keyStars.forEach(s => s.connected = false);
      document.querySelectorAll('.dot').forEach(d => d.classList.remove('connected'));
      document.getElementById('instruction').style.opacity = '1';
      document.getElementById('message').classList.remove('visible');
      document.getElementById('resetBtn').classList.remove('visible');
    }
    
    // Touch support
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      handleMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', resize);
    
    resize();
    draw();
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 9: Open When Time Capsule
// ============================================================
const timeCapsuleTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open When... - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cormorant Garamond', serif;
      background: linear-gradient(180deg, #0f1729 0%, #1a1f35 50%, #0f1729 100%);
      min-height: 100vh;
      color: #d4c5a9;
      overflow-x: hidden;
    }
    
    .header {
      text-align: center;
      padding: 3rem 2rem 2rem;
    }
    
    .title {
      font-family: 'Cinzel', serif;
      font-size: 2.5rem;
      color: #d4af37;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 20px rgba(212, 175, 55, 0.3);
    }
    
    .subtitle {
      font-style: italic;
      color: #8b7d6b;
      font-size: 1.1rem;
    }
    
    .envelopes {
      max-width: 500px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .envelope {
      background: linear-gradient(145deg, #1e2642, #151b30);
      border: 1px solid #2a3352;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .envelope::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #d4af37, #f4d03f);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .envelope:hover::before {
      transform: scaleX(1);
    }
    
    .envelope:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border-color: #d4af37;
    }
    
    .envelope.locked {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .envelope.locked:hover {
      transform: none;
      box-shadow: none;
      border-color: #2a3352;
    }
    
    .envelope.locked:hover::before {
      transform: scaleX(0);
    }
    
    .envelope-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    
    .envelope-label {
      font-family: 'Cinzel', serif;
      font-size: 1.1rem;
      color: #d4af37;
    }
    
    .envelope-icon {
      font-size: 1.5rem;
    }
    
    .envelope-desc {
      font-size: 0.95rem;
      color: #8b8b9b;
      line-height: 1.5;
    }
    
    .lock-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: #666;
    }
    
    .shake {
      animation: shake 0.5s ease;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px) rotate(-2deg); }
      40% { transform: translateX(10px) rotate(2deg); }
      60% { transform: translateX(-10px) rotate(-2deg); }
      80% { transform: translateX(10px) rotate(2deg); }
    }
    
    /* Modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 41, 0.95);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 100;
      padding: 1.5rem;
    }
    
    .modal.visible {
      display: flex;
    }
    
    .letter {
      background: linear-gradient(145deg, #f5f0e6, #e8e0d0);
      color: #2c2416;
      max-width: 450px;
      width: 100%;
      border-radius: 4px;
      padding: 2rem;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      animation: unfold 0.6s ease;
    }
    
    @keyframes unfold {
      0% { transform: scaleY(0) rotateX(-90deg); opacity: 0; }
      100% { transform: scaleY(1) rotateX(0); opacity: 1; }
    }
    
    .wax-seal {
      position: absolute;
      top: -20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: radial-gradient(circle at 30% 30%, #c41e3a, #8b0000);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    .letter-title {
      font-family: 'Cinzel', serif;
      font-size: 1.3rem;
      color: #8b4513;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .letter-content {
      font-size: 1rem;
      line-height: 1.8;
      text-align: center;
    }
    
    .letter-close {
      margin-top: 1.5rem;
      text-align: center;
    }
    
    .letter-close button {
      background: linear-gradient(145deg, #d4af37, #b8962e);
      border: none;
      color: #1a1f35;
      padding: 10px 30px;
      border-radius: 25px;
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .letter-close button:hover {
      transform: scale(1.05);
    }
    
    /* Stars background */
    .stars {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="stars" id="stars"></div>
  
  <header class="header">
    <h1 class="title">Open When...</h1>
    <p class="subtitle">Letters for {{recipientName}}</p>
  </header>
  
  <div class="envelopes">
    <div class="envelope" onclick="openEnvelope(0)">
      <div class="envelope-header">
        <span class="envelope-label">{{envelope1Label}}</span>
        <span class="envelope-icon">💌</span>
      </div>
      <p class="envelope-desc">{{envelope1Desc}}</p>
    </div>
    
    <div class="envelope" onclick="openEnvelope(1)">
      <div class="envelope-header">
        <span class="envelope-label">{{envelope2Label}}</span>
        <span class="envelope-icon">💝</span>
      </div>
      <p class="envelope-desc">{{envelope2Desc}}</p>
    </div>
    
    <div class="envelope" onclick="openEnvelope(2)">
      <div class="envelope-header">
        <span class="envelope-label">{{envelope3Label}}</span>
        <span class="envelope-icon">✨</span>
      </div>
      <p class="envelope-desc">{{envelope3Desc}}</p>
    </div>
    
    <div class="envelope" onclick="openEnvelope(3)">
      <div class="envelope-header">
        <span class="envelope-label">{{envelope4Label}}</span>
        <span class="envelope-icon">🌟</span>
      </div>
      <p class="envelope-desc">{{envelope4Desc}}</p>
    </div>
  </div>
  
  <div class="modal" id="modal" onclick="closeModal()">
    <div class="letter" onclick="event.stopPropagation()">
      <div class="wax-seal">💛</div>
      <h2 class="letter-title" id="letterTitle"></h2>
      <div class="letter-content" id="letterContent"></div>
      <div class="letter-close">
        <button onclick="closeModal()">Close Letter</button>
      </div>
    </div>
  </div>
  
  <script>
    // Generate stars
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      starsContainer.appendChild(star);
    }
    
    const letters = [
      { title: '{{envelope1Label}}', content: '{{envelope1Content}}' },
      { title: '{{envelope2Label}}', content: '{{envelope2Content}}' },
      { title: '{{envelope3Label}}', content: '{{envelope3Content}}' },
      { title: '{{envelope4Label}}', content: '{{envelope4Content}}' }
    ];
    
    function openEnvelope(index) {
      const letter = letters[index];
      document.getElementById('letterTitle').textContent = letter.title;
      document.getElementById('letterContent').textContent = letter.content;
      document.getElementById('modal').classList.add('visible');
    }
    
    function closeModal() {
      document.getElementById('modal').classList.remove('visible');
    }
  </script>
</body>
</html>`;

// ============================================================
// TEMPLATE 10: Adventure Map
// ============================================================
const adventureMapTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Adventure - {{recipientName}}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f5ebe0;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Paper texture */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0.04;
      pointer-events: none;
      z-index: 1000;
    }
    
    .header {
      text-align: center;
      padding: 2rem;
      position: relative;
      z-index: 10;
    }
    
    .title {
      font-family: 'Caveat', cursive;
      font-size: 3rem;
      color: #5c4033;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      color: #8b7355;
      font-size: 0.9rem;
    }
    
    .map-container {
      position: relative;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    /* SVG Map Path */
    .map-path {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .path-line {
      fill: none;
      stroke: #c9a66b;
      stroke-width: 3;
      stroke-dasharray: 10 5;
      stroke-linecap: round;
    }
    
    .path-line-bg {
      fill: none;
      stroke: rgba(201, 166, 107, 0.3);
      stroke-width: 20;
      stroke-linecap: round;
    }
    
    /* Locations */
    .locations {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4rem;
      padding: 1rem 0;
    }
    
    .location {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .location.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .location:nth-child(even) {
      flex-direction: row-reverse;
      text-align: right;
    }
    
    .pin {
      width: 50px;
      height: 50px;
      background: linear-gradient(145deg, #e74c3c, #c0392b);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
      flex-shrink: 0;
    }
    
    .pin-inner {
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      transform: rotate(45deg);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.7rem;
    }
    
    .location-content {
      flex: 1;
      max-width: 300px;
    }
    
    .polaroid {
      background: #fff;
      padding: 10px 10px 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transform: rotate(-2deg);
      margin-bottom: 1rem;
      transition: transform 0.3s ease;
    }
    
    .location:nth-child(even) .polaroid {
      transform: rotate(2deg);
    }
    
    .polaroid:hover {
      transform: rotate(0deg) scale(1.05);
    }
    
    .polaroid-img {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #f0e6d3, #e8dcc8);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 3rem;
    }
    
    .polaroid-caption {
      font-family: 'Caveat', cursive;
      font-size: 1rem;
      color: #5c4033;
      text-align: center;
      margin-top: 10px;
    }
    
    .location-title {
      font-family: 'Caveat', cursive;
      font-size: 1.5rem;
      color: #5c4033;
      margin-bottom: 0.25rem;
    }
    
    .location-date {
      font-size: 0.75rem;
      color: #a08060;
      margin-bottom: 0.5rem;
    }
    
    .location-desc {
      font-size: 0.9rem;
      color: #6b5344;
      line-height: 1.6;
    }
    
    /* Paper plane */
    .plane {
      position: fixed;
      font-size: 2rem;
      pointer-events: none;
      z-index: 100;
      transition: all 0.1s ease;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
    }
    
    /* Final message */
    .final-message {
      text-align: center;
      padding: 3rem 2rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .final-message.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .final-title {
      font-family: 'Caveat', cursive;
      font-size: 2rem;
      color: #5c4033;
      margin-bottom: 1rem;
    }
    
    .final-text {
      color: #6b5344;
      line-height: 1.8;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .compass {
      position: fixed;
      bottom: 20px;
      right: 20px;
      font-size: 2.5rem;
      opacity: 0.5;
      animation: spin 20s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="title">Our Adventure Map</h1>
    <p class="subtitle">The journey of {{senderName}} & {{recipientName}}</p>
  </header>
  
  <div class="map-container">
    <div class="locations">
      <div class="location">
        <div class="pin"><div class="pin-inner">1</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img">{{location1Emoji}}</div>
            <div class="polaroid-caption">{{location1Caption}}</div>
          </div>
          <h3 class="location-title">{{location1Title}}</h3>
          <p class="location-date">{{location1Date}}</p>
          <p class="location-desc">{{location1Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">2</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img">{{location2Emoji}}</div>
            <div class="polaroid-caption">{{location2Caption}}</div>
          </div>
          <h3 class="location-title">{{location2Title}}</h3>
          <p class="location-date">{{location2Date}}</p>
          <p class="location-desc">{{location2Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">3</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img">{{location3Emoji}}</div>
            <div class="polaroid-caption">{{location3Caption}}</div>
          </div>
          <h3 class="location-title">{{location3Title}}</h3>
          <p class="location-date">{{location3Date}}</p>
          <p class="location-desc">{{location3Desc}}</p>
        </div>
      </div>
      
      <div class="location">
        <div class="pin"><div class="pin-inner">4</div></div>
        <div class="location-content">
          <div class="polaroid">
            <div class="polaroid-img">{{location4Emoji}}</div>
            <div class="polaroid-caption">{{location4Caption}}</div>
          </div>
          <h3 class="location-title">{{location4Title}}</h3>
          <p class="location-date">{{location4Date}}</p>
          <p class="location-desc">{{location4Desc}}</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="final-message">
    <h2 class="final-title">And the adventure continues...</h2>
    <p class="final-text">{{customMessage}}</p>
  </div>
  
  <div class="plane" id="plane">✈️</div>
  <div class="compass">🧭</div>
  
  <script>
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.location, .final-message').forEach(el => {
      observer.observe(el);
    });
    
    // Paper plane follows scroll
    const plane = document.getElementById('plane');
    let scrollY = 0;
    
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
      const progress = scrollY / (document.body.scrollHeight - window.innerHeight);
      const x = 50 + Math.sin(progress * Math.PI * 4) * 30;
      const y = 100 + progress * (window.innerHeight - 200);
      const rotation = Math.sin(progress * Math.PI * 4) * 20;
      
      plane.style.left = x + '%';
      plane.style.top = Math.min(y, window.innerHeight - 100) + 'px';
      plane.style.transform = \`rotate(\${rotation}deg)\`;
    });
  </script>
</body>
</html>`;

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seedPremiumTemplates() {
  console.log('Seeding premium templates...');
  
  // 1. Receipt
  await upsertTemplate({
    name: 'The Receipt',
    description: 'A quirky CVS-style receipt listing all the reasons someone is priceless',
    occasion: ['friendship', 'thank-you', 'just-because', 'appreciation'],
    basePrice: '10.00',
    htmlTemplate: receiptTemplate,
  });
  
  // 2. Code Repo
  await upsertTemplate({
    name: 'Code Repository',
    description: 'A GitHub-style repo documenting your relationship with commits and pull requests',
    occasion: ['friendship', 'anniversary', 'valentines', 'just-because'],
    basePrice: '10.00',
    htmlTemplate: codeRepoTemplate,
  });
  
  // 3. Infinity Letter
  await upsertTemplate({
    name: 'Love Letter',
    description: 'A beautifully typeset letter with scroll animations and interactive highlights',
    occasion: ['valentines', 'anniversary', 'love', 'just-because'],
    basePrice: '10.00',
    htmlTemplate: infinityLetterTemplate,
  });
  
  // 4. Tamagotchi
  await upsertTemplate({
    name: 'Virtual Pet',
    description: 'A retro Tamagotchi-style pet that needs love - fill the meter to reveal your message',
    occasion: ['friendship', 'just-because', 'apology', 'miss-you'],
    basePrice: '10.00',
    htmlTemplate: tamagotchiTemplate,
  });
  
  // 5. Netflix
  await upsertTemplate({
    name: 'Streaming Service',
    description: 'A Netflix-style show page documenting your relationship as episodes',
    occasion: ['anniversary', 'friendship', 'valentines', 'our-story'],
    basePrice: '10.00',
    htmlTemplate: netflixTemplate,
  });
  
  // 6. Gift Box
  await upsertTemplate({
    name: 'Exploding Gift Box',
    description: 'A 3D gift box that explodes with photos and messages when you tap it enough',
    occasion: ['birthday', 'surprise', 'just-because', 'congratulations'],
    basePrice: '10.00',
    htmlTemplate: giftBoxTemplate,
  });
  
  // 7. Vinyl Player
  await upsertTemplate({
    name: 'Vinyl Player',
    description: 'A nostalgic record player - drop the needle to play your song and reveal liner notes',
    occasion: ['anniversary', 'valentines', 'friendship', 'our-song'],
    basePrice: '10.00',
    htmlTemplate: vinylTemplate,
  });
  
  // 8. Constellation
  await upsertTemplate({
    name: 'Constellation',
    description: 'Connect the stars to reveal a hidden shape and message in the night sky',
    occasion: ['valentines', 'anniversary', 'love', 'romantic'],
    basePrice: '10.00',
    htmlTemplate: constellationTemplate,
  });
  
  // 9. Time Capsule
  await upsertTemplate({
    name: 'Open When Letters',
    description: 'A collection of sealed letters to open at different moments - for when they need you most',
    occasion: ['friendship', 'love', 'long-distance', 'care-package'],
    basePrice: '10.00',
    htmlTemplate: timeCapsuleTemplate,
  });
  
  // 10. Adventure Map
  await upsertTemplate({
    name: 'Adventure Map',
    description: 'A hand-drawn style map tracing your journey together with polaroid memories',
    occasion: ['anniversary', 'travel', 'friendship', 'our-story'],
    basePrice: '10.00',
    htmlTemplate: adventureMapTemplate,
  });
  
  console.log('Done seeding premium templates!');
  process.exit(0);
}

seedPremiumTemplates().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
