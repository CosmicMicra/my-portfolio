// ============================================================
// Scroll story engine
// Each .scene is pinned while you scroll through it. Its words light up
// one by one, and illustration parts marked data-at="0..1" switch on
// once the scene's progress passes that point.
// ============================================================
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- theme ----------
  const themeBtn = document.getElementById('theme');
  const syncTheme = () => themeBtn.setAttribute('aria-pressed', root.dataset.theme === 'dark');
  syncTheme();
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });

  // jump straight past the story (smooth-scrolling through it would take ages)
  document.querySelectorAll('a[href="#made"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('made').scrollIntoView({ behavior: 'instant' });
    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('in'));
  }));

  // ---------- split story text into words ----------
  function splitWords(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        splitWords(child);
      }
    });
  }

  // draw-on paths: normalise length so CSS can animate 1 → 0
  document.querySelectorAll('.draw').forEach(p => p.setAttribute('pathLength', '1'));

  const scenes = [...document.querySelectorAll('.scene')].map(el => {
    el.querySelectorAll('.story').forEach(splitWords);
    const words = [...el.querySelectorAll('.story .w')];
    const parts = [...el.querySelectorAll('[data-at]')].map(n => ({ n, at: +n.dataset.at }));
    const scrub = el.querySelector('.scrub');
    // longer paragraphs get a little more scroll room
    el.style.height = `${Math.max(190, 110 + words.length * 2.1)}svh`;
    return { el, stage: el.querySelector('.stage'), art: el.querySelector('.art'), words, parts, scrub, lit: -1, top: 0, h: 0 };
  });

  document.getElementById('chapters').textContent = String(scenes.length).padStart(2, '0');
  const chapterEl = document.getElementById('chapter');
  const bar = document.getElementById('progress');

  // measure once (and again only when the width really changes, not when
  // a phone's address bar slides in and out)
  let vh = innerHeight, lastW = innerWidth;
  function measure() {
    vh = innerHeight;
    scenes.forEach(s => { s.top = s.el.offsetTop; s.h = s.el.offsetHeight; });
  }
  measure();

  function update() {
    const y = scrollY;
    let active = 0;
    scenes.forEach((s, i) => {
      const rTop = s.top - y;
      if (rTop <= vh * .5) active = i;
      if (rTop > vh * 1.5 || rTop + s.h < -vh) return; // far away, skip
      const p = reduced ? 1 : Math.min(1, Math.max(0, -rTop / (s.h - vh)));

      // words light up over the first 75% of the scene, leaving a beat to rest
      const lit = Math.round(Math.min(1, p / .75) * s.words.length);
      if (lit !== s.lit) {
        s.words.forEach((w, j) => w.classList.toggle('lit', j < lit));
        s.lit = lit;
      }
      s.parts.forEach(({ n, at }) => n.classList.toggle('on', p >= at || (at === 0 && rTop < vh)));
      if (s.scrub) s.scrub.style.strokeDashoffset = 1 - Math.min(1, p / .7);
      if (!reduced) {
        // settle, then softly dissolve into the next scene
        s.stage.style.opacity = 1 - Math.min(1, Math.max(0, (p - .93) / .07));
        if (s.art) s.art.style.transform = `translate3d(0, ${(p - .5) * -18}px, 0)`;
      }
    });
    chapterEl.textContent = String(active + 1).padStart(2, '0');
    const max = root.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
  }, { passive: true });
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - vh) < 120) return;
    lastW = innerWidth;
    requestAnimationFrame(() => { measure(); scenes.forEach(s => (s.lit = -1)); update(); });
  });
  addEventListener('load', () => { measure(); update(); });
  update();

  // ---------- gentle reveals after the story ----------
  const revealables = document.querySelectorAll('.made-head, .card, .papers, .thanks > *');
  revealables.forEach((el, i) => {
    el.classList.add('reveal-up');
    if (el.classList.contains('card')) el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  revealables.forEach(el => (reduced ? el.classList.add('in') : io.observe(el)));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
