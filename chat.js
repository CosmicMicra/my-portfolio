// ============================================================
// Chat assistant
// For now it answers from a small set of notes about Soniya.
// To plug in a real model later, replace getReply() with a call to your
// own backend (for example a serverless function that talks to an LLM)
// and keep the rest of this file as it is.
// ============================================================
(() => {
  const notes = [
    { k: ['orewatch', 'rapticore', 'job', 'work', 'current', 'now', 'doing'],
      a: "I work at Rapticore, a cybersecurity company, on Orewatch. Before a package gets installed, Orewatch looks inside it and checks what it really does. If it's up to something, like trying to take your passwords, it stops it and explains why." },
    { k: ['mcp', 'drift', 'research', 'question'],
      a: "MCP drift is a question I keep coming back to: you install a tool and it's safe, but how do you know its author didn't change it later? Most of the time nobody checks, so I'm trying to measure how often that happens." },
    { k: ['frugal', 'kids', 'children', 'education', 'learn', 'tutor'],
      a: "At Santa Clara's Frugal Innovation Hub I worked on AI that helps children learn. I trained and benchmarked models and tried to keep safety in mind from the start, because the people using it were kids." },
    { k: ['cloud', 'monitor', 'before', 'previous', 'experience', 'kubernetes', 'k8'],
      a: "Before Rapticore I worked on cloud security: monitoring systems, measuring things and figuring out why something looked off. K8shield, one of my projects, came out of that." },
    { k: ['study', 'school', 'master', 'degree', 'santa clara', 'education', 'university'],
      a: "I did my master's in computer science at Santa Clara University (2024 – 2026), mostly machine learning." },
    { k: ['project', 'built', 'made', 'portfolio', 'hackathon'],
      a: "A few favorites: K8shield, Neighborhood Net (a hackathon project with friends for unhoused neighbors in SF), CodeShield, a bilingual math tutor and a study buddy. They're all in the \"things I made\" section." },
    { k: ['contact', 'email', 'reach', 'hire', 'linkedin', 'talk', 'resume'],
      a: "LinkedIn is the easiest way to reach me: linkedin.com/in/soniya-phaltane. My résumé is linked at the bottom of the page too." },
    { k: ['ai', 'security', 'why', 'love', 'interest'],
      a: "I love both AI and security, especially where they meet: using AI to keep systems safe, and making sure AI itself is safe to use." },
    { k: ['hi', 'hello', 'hey'], a: "Hi! ♡ Ask me anything about my work, or tap one of the suggestions below." }
  ];
  const suggestions = ['What do you work on?', 'What is MCP drift?', 'Your favorite project?', 'How can I reach you?'];

  // Swap this for a real model call later. Must return a Promise<string>.
  async function getReply(text) {
    const t = text.toLowerCase();
    let best = null, score = 0;
    notes.forEach(n => {
      const s = n.k.reduce((acc, k) => acc + (t.includes(k) ? k.length : 0), 0);
      if (s > score) { score = s; best = n; }
    });
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
    return best ? best.a
      : "Good question. I'm still learning, so I don't know that one yet. You could ask the real me on LinkedIn ♡";
  }

  const panel = document.getElementById('chat');
  const log = document.getElementById('chat-log');
  const chips = document.getElementById('chat-chips');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-in');
  let started = false;

  function add(text, who) {
    const m = document.createElement('div');
    m.className = `msg ${who}`;
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  async function ask(text) {
    if (!text.trim()) return;
    add(text, 'me');
    chips.hidden = true;
    const typing = add('• • •', 'bot typing');
    const reply = await getReply(text);
    typing.remove();
    add(reply, 'bot');
  }
  function open() {
    panel.hidden = false;
    document.body.classList.add('chat-open');
    if (!started) {
      started = true;
      add("Hi, I'm Soniya's little helper. I know the basics about her work. What would you like to know?", 'bot');
      suggestions.forEach(q => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = q;
        b.addEventListener('click', () => ask(q));
        chips.appendChild(b);
      });
    }
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    document.body.classList.remove('chat-open');
    document.getElementById('chat-fab').focus();
  }

  document.querySelectorAll('[data-open-chat]').forEach(b => b.addEventListener('click', open));
  document.getElementById('chat-x').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });
})();
