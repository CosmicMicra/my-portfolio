// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
  toggle.textContent = open ? 'close' : 'menu';
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'menu';
}));

// Nav shadow once the page scrolls
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Fade sections in (and draw their doodles) as they enter the view
const reveal = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// Underline the nav link for the section in view
const navLinks = [...links.querySelectorAll('a')];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => spy.observe(s));

// Project filters
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.toggle('is-on', c === chip));
  const f = chip.dataset.filter;
  cards.forEach(card => {
    card.classList.toggle('is-hidden', f !== 'all' && !card.dataset.tags.split(' ').includes(f));
  });
}));

document.getElementById('year').textContent = new Date().getFullYear();
