// server.js
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;

if (!API_KEY) {
  console.error("Missing GROQ_API_KEY in .env file");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send(HTML_PAGE);
});

app.post("/api/generate-email", async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!userPrompt || typeof userPrompt !== "string") {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(response.status).json({ error: "Groq API request failed" });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    res.json({ content: [{ text }] });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Dispatch is running -> open http://localhost:${PORT} in your browser`);
});

const HTML_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dispatch — email generator</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --navy:#161F2E; --navy-panel:#1D2A3D; --paper:#F4EFE2; --gold:#C68A2E;
    --gold-dim:#8A611F; --stamp:#B2402C; --slate:#8391A5; --ink:#1B2430;
    --line: rgba(244,239,226,0.14); --line-strong: rgba(244,239,226,0.28);
  }
  *{box-sizing:border-box;}
  body{ margin:0; background:var(--navy); color:var(--paper); font-family:'Inter',sans-serif; min-height:100vh; }
  .wrap{ max-width:1080px; margin:0 auto; padding:48px 28px 80px; }
  header{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--line-strong); padding-bottom:20px; margin-bottom:36px; flex-wrap:wrap; gap:16px; }
  .brand{ display:flex; align-items:baseline; gap:14px; }
  .brand-mark{ font-family:'Special Elite',monospace; font-size:34px; letter-spacing:1px; color:var(--paper); }
  .brand-sub{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:2.5px; text-transform:uppercase; color:var(--gold); }
  .desk-tag{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:1.5px; color:var(--slate); text-transform:uppercase; }
  .grid{ display:grid; grid-template-columns:minmax(300px,380px) 1fr; gap:32px; }
  @media (max-width:820px){ .grid{grid-template-columns:1fr;} }
  .panel{ background:var(--navy-panel); border:1px solid var(--line); border-radius:2px; }
  .panel-head{ display:flex; align-items:center; gap:10px; padding:16px 20px; border-bottom:1px solid var(--line); }
  .panel-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--gold); border:1px solid var(--gold-dim); border-radius:50%; width:20px;height:20px; display:flex;align-items:center;justify-content:center; }
  .panel-title{ font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:var(--paper); }
  .panel-body{ padding:20px; }
  label{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:1.2px; text-transform:uppercase; color:var(--slate); margin-bottom:7px; }
  .field{margin-bottom:18px;}
  textarea,input,select{ width:100%; background:rgba(244,239,226,0.05); border:1px solid var(--line-strong); color:var(--paper); font-family:'Inter',sans-serif; font-size:14px; padding:10px 12px; border-radius:2px; resize:vertical; outline:none; }
  textarea::placeholder,input::placeholder{color:rgba(244,239,226,0.35);}
  textarea:focus,input:focus,select:focus{border-color:var(--gold);}
  .row2{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
  .chip-group{display:flex; flex-wrap:wrap; gap:8px;}
  .chip{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.5px; padding:6px 12px; border:1px solid var(--line-strong); border-radius:20px; color:var(--slate); cursor:pointer; background:transparent; transition:all .15s ease; }
  .chip:hover{border-color:var(--gold-dim); color:var(--paper);}
  .chip.active{background:var(--gold); border-color:var(--gold); color:var(--navy); font-weight:500;}
  .generate-btn{ width:100%; margin-top:6px; background:var(--stamp); color:var(--paper); border:none; border-radius:2px; padding:14px; font-family:'IBM Plex Mono',monospace; font-size:12.5px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:background .15s ease; }
  .generate-btn:hover{background:#C24A34;}
  .generate-btn:disabled{background:var(--slate); cursor:default;}
  .hint{font-size:12px; color:var(--slate); margin-top:10px; line-height:1.5;}
  .output-panel{ background:var(--navy-panel); border:1px solid var(--line); min-height:520px; display:flex; flex-direction:column; }
  .output-toolbar{ display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--line); }
  .toolbar-actions{display:flex; gap:10px;}
  .icon-btn{ background:transparent; border:1px solid var(--line-strong); color:var(--slate); font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:1px; padding:7px 12px; border-radius:2px; cursor:pointer; text-transform:uppercase; }
  .icon-btn:hover{color:var(--paper); background:rgba(244,239,226,0.05);}
  .paper-area{ flex:1; padding:36px; display:flex; align-items:flex-start; justify-content:center; }
  .letter{ background:var(--paper); color:var(--ink); width:100%; max-width:560px; min-height:420px; padding:44px 44px 40px; position:relative; font-family:'Inter',sans-serif; box-shadow:0 18px 40px rgba(0,0,0,0.35); }
  .letter-empty{ color:#8a8672; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.5px; text-align:center; margin-top:120px; }
  .subject-line{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#8a8672; margin-bottom:6px; }
  .subject-text{ font-family:'Special Elite',monospace; font-size:20px; color:var(--ink); margin:0 0 22px; padding-bottom:16px; border-bottom:1px solid #D8D0B8; }
  .body-text{ font-size:14.5px; line-height:1.85; white-space:pre-wrap; color:var(--ink); }
  .postmark{ position:absolute; top:28px; right:32px; width:78px; height:78px; border:2px solid var(--stamp); border-radius:50%; display:flex; align-items:center; justify-content:center; transform:rotate(-8deg); opacity:0; transition:opacity .3s ease; }
  .postmark.show{opacity:0.82;}
  .postmark-inner{ text-align:center; color:var(--stamp); }
  .postmark-inner .pm-top{ font-family:'IBM Plex Mono',monospace; font-size:8px; letter-spacing:1px; text-transform:uppercase; display:block; }
  .postmark-inner .pm-date{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; font-weight:500; display:block; margin:2px 0; }
  .postmark-inner .pm-bottom{ font-family:'IBM Plex Mono',monospace; font-size:7px; letter-spacing:1px; text-transform:uppercase; display:block; }
  .loading-row{ display:flex; align-items:center; gap:10px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--gold); margin-top:120px; justify-content:center; }
  .dot{ width:6px;height:6px;border-radius:50%; background:var(--gold); animation:blink 1s infinite ease-in-out; }
  .dot:nth-child(2){animation-delay:.15s;}
  .dot:nth-child(3){animation-delay:.3s;}
  @keyframes blink{0%,80%,100%{opacity:.2;}40%{opacity:1;}}
  .error-text{ color:var(--stamp); font-family:'IBM Plex Mono',monospace; font-size:12px; margin-top:100px; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="brand">
      <span class="brand-mark">Dispatch</span>
      <span class="brand-sub">Email drafting desk</span>
    </div>
    <span class="desk-tag" id="clock"></span>
  </header>

  <div class="grid">
    <div class="panel">
      <div class="panel-head">
        <span class="panel-num">1</span>
        <span class="panel-title">Draft a message</span>
      </div>
      <div class="panel-body">
        <div class="field">
          <label for="purpose">Purpose of the email</label>
          <textarea id="purpose" rows="4" placeholder="e.g. Ask my landlord to fix a leaking tap in the kitchen"></textarea>
        </div>
        <div class="field">
          <label>Tone</label>
          <div class="chip-group" id="toneChips">
            <button class="chip active" data-tone="Professional">Professional</button>
            <button class="chip" data-tone="Friendly">Friendly</button>
            <button class="chip" data-tone="Formal">Formal</button>
            <button class="chip" data-tone="Direct">Direct</button>
            <button class="chip" data-tone="Persuasive">Persuasive</button>
            <button class="chip" data-tone="Apologetic">Apologetic</button>
          </div>
        </div>
        <div class="row2">
          <div class="field">
            <label for="recipient">Recipient (optional)</label>
            <input id="recipient" type="text" placeholder="e.g. Mr. Sharma">
          </div>
          <div class="field">
            <label for="sender">Your name (optional)</label>
            <input id="sender" type="text" placeholder="e.g. Priya">
          </div>
        </div>
        <div class="field">
          <label for="length">Length</label>
          <select id="length">
            <option value="short">Short — a few lines</option>
            <option value="medium" selected>Medium — a few paragraphs</option>
            <option value="long">Long — fully detailed</option>
          </select>
        </div>
        <div class="field">
          <label for="context">Extra details to include (optional)</label>
          <textarea id="context" rows="3" placeholder="e.g. It's been leaking for 3 days, worried about water damage, available for a call anytime this week"></textarea>
        </div>
        <button class="generate-btn" id="generateBtn">Generate email</button>
        <p class="hint">Dispatch writes a subject line and full email body from what you enter. Review before sending.</p>
      </div>
    </div>

    <div class="output-panel">
      <div class="output-toolbar">
        <span class="panel-title" style="padding:0;">Drafted letter</span>
        <div class="toolbar-actions">
          <button class="icon-btn" id="copyBtn">Copy</button>
          <button class="icon-btn" id="regenBtn">Regenerate</button>
        </div>
      </div>
      <div class="paper-area">
        <div class="letter" id="letter">
          <div class="postmark" id="postmark">
            <div class="postmark-inner">
              <span class="pm-top">Dispatch</span>
              <span class="pm-date" id="pmDate">— · —</span>
              <span class="pm-bottom">Drafted</span>
            </div>
          </div>
          <div id="letterContent">
            <p class="letter-empty">Enter a purpose on the left and press<br>Generate email to draft your letter.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  const clock = document.getElementById('clock');
  function updateClock(){
    const d = new Date();
    clock.textContent = 'Desk time · ' + d.toLocaleDateString(undefined,{weekday:'short',day:'2-digit',month:'short'}) + ' · ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
  }
  updateClock();
  setInterval(updateClock, 30000);

  let selectedTone = 'Professional';
  document.querySelectorAll('#toneChips .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('#toneChips .chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      selectedTone = chip.dataset.tone;
    });
  });

  const generateBtn = document.getElementById('generateBtn');
  const regenBtn = document.getElementById('regenBtn');
  const copyBtn = document.getElementById('copyBtn');
  const letterContent = document.getElementById('letterContent');
  const postmark = document.getElementById('postmark');
  const pmDate = document.getElementById('pmDate');

  let lastSubject = '';
  let lastBody = '';

  async function generateEmail(){
    const purpose = document.getElementById('purpose').value.trim();
    if(!purpose){
      letterContent.innerHTML = '<p class="error-text">Enter a purpose for the email before generating.</p>';
      postmark.classList.remove('show');
      return;
    }
    const recipient = document.getElementById('recipient').value.trim();
    const sender = document.getElementById('sender').value.trim();
    const length = document.getElementById('length').value;
    const context = document.getElementById('context').value.trim();

    generateBtn.disabled = true;
    generateBtn.textContent = 'Drafting…';
    postmark.classList.remove('show');
    letterContent.innerHTML = '<div class="loading-row"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span style="margin-left:6px;">Composing your email</span></div>';

    const lengthGuide = {
      short: '3-5 sentences total, very concise',
      medium: '2-3 short paragraphs',
      long: 'a fully detailed email with 4+ paragraphs covering all context thoroughly'
    }[length];

    const systemPrompt = 'You write complete, ready-to-send emails. Always respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape: {"subject": "string", "body": "string"}. The body should be the full email body text including a greeting and sign-off, with paragraphs separated by newline characters. Do not include the subject line inside the body. Do not use placeholder brackets like [Your Name] unless no name was given, in which case use a generic closing like "Best regards".';

    const userPrompt = 'Write an email for this purpose: "' + purpose + '"\\n\\n' +
      'Tone: ' + selectedTone + '\\n' +
      'Length: ' + lengthGuide + '\\n' +
      (recipient ? ('Recipient name: ' + recipient) : 'Recipient name: not given, use a generic polite greeting') + '\\n' +
      (sender ? ('Sender name (sign off with this): ' + sender) : 'Sender name: not given, use a generic sign-off without a name') + '\\n' +
      (context ? ('Additional details to weave in naturally: ' + context) : '') + '\\n\\n' +
      'Return only the JSON object.';

    try{
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userPrompt })
      });

      if(!response.ok){ throw new Error('Server responded with status ' + response.status); }

      const data = await response.json();
      let raw = data.content.map(b => b.text || '').join('').trim();
      raw = raw.replace(/^\`\`\`json\\s*/i,'').replace(/^\`\`\`\\s*/,'').replace(/\`\`\`\\s*$/,'').trim();

      let parsed;
      try{ parsed = JSON.parse(raw); }
      catch(e){
        const match = raw.match(/\\{[\\s\\S]*\\}/);
        parsed = match ? JSON.parse(match[0]) : { subject: 'Draft', body: raw };
      }

      lastSubject = parsed.subject || '';
      lastBody = parsed.body || '';

      letterContent.innerHTML =
        '<div class="subject-line">Subject</div>' +
        '<p class="subject-text">' + escapeHtml(lastSubject) + '</p>' +
        '<div class="body-text">' + escapeHtml(lastBody) + '</div>';

      const now = new Date();
      pmDate.textContent = now.toLocaleDateString(undefined,{day:'2-digit',month:'short'});
      postmark.classList.add('show');

    }catch(err){
      console.error('Dispatch error:', err);
      letterContent.innerHTML = '<p class="error-text">Something went wrong drafting the email. Check the terminal running node server.js for details, then try again.</p>';
    }finally{
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate email';
    }
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function copyToClipboard(){
    if(!lastBody){ return; }
    const fullText = 'Subject: ' + lastSubject + '\\n\\n' + lastBody;
    navigator.clipboard.writeText(fullText).then(()=>{
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied';
      setTimeout(()=>{ copyBtn.textContent = orig; }, 1500);
    });
  }

  generateBtn.addEventListener('click', generateEmail);
  regenBtn.addEventListener('click', generateEmail);
  copyBtn.addEventListener('click', copyToClipboard);

  document.getElementById('purpose').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && e.metaKey){ generateEmail(); }
  });
</script>
</body>
</html>
`;