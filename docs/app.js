window.copy = (key, fallback) => window.fujiCopy?.[key] ?? fallback;
const root = document.documentElement;
const experience = document.getElementById('experience');
const slices = document.querySelector('.slices');
const dialog = document.getElementById('info');
const panel = document.getElementById('panel-content');
const topics = ['origin', 'grown', 'journey', 'buy', 'care'];
const names = ['THE ORIGIN', 'WHERE IT GROWS', 'ORCHARD TO SHELF', 'FIND YOUR FUJI', 'THE PERFECT BITE'];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let framePending = false;
let phase = -1;
let savedOverflow = '';
const clamp = x => Math.max(0, Math.min(1, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
function paint() {
  framePending = false;
  const progress = clamp(window.scrollY / Math.max(1, experience.offsetHeight - window.innerHeight));
  const peel = smooth((progress - .1) / .32);
  const cut = smooth((progress - .52) / .3);
  const ready = progress >= .85;
  const activePhase = progress < .24 ? 0 : progress < .72 ? 1 : 2;
  const values = (motion.matches || window.fujiAnimationEnabled === false) ? {
    whole: activePhase === 0 ? 1 : 0, peel: activePhase === 1 ? 1 : 0,
    cut: activePhase === 2 ? 1 : 0, reveal: '100%', spread: 1, intro: activePhase === 0 ? 1 : 0,
    labels: ready ? 1 : 0, progress
  } : {
    whole: 1 - peel, peel: 1 - cut, cut, reveal: `${peel * 100}%`,
    spread: smooth((progress - .58) / .3), intro: 1 - smooth((progress - .12) / .22),
    labels: smooth((progress - .80) / .09), progress
  };
  Object.entries(values).forEach(([key,value]) => root.style.setProperty(`--${key}`, value));
  slices.inert = !ready;
  if (phase !== activePhase) {
    phase = activePhase;
    document.querySelectorAll('[data-phase]').forEach(button => {
      const active = Number(button.dataset.phase) === phase;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    document.getElementById('status').textContent = copy(`status.${phase}`, ['A JAPANESE ORIGINAL', 'THERE’S MORE BENEATH THE SURFACE', 'FIVE SLICES. FIVE STORIES.'][phase]);
  }
  const instruction = ready ? copy('instruction.sliced', 'Choose a slice to look inside.') : phase === 0 ? copy('instruction.whole', 'Scroll to peel it back.') : copy('instruction.peel', 'Keep scrolling. The story opens up.');
  const element = document.getElementById('instruction');
  if (element.textContent !== instruction) element.textContent = instruction;
  document.querySelector('.scroll-hint').innerHTML = ready ? 'CHOOSE A SLICE <b>↑</b>' : 'SCROLL TO DISCOVER <b>↓</b>';
}
function queuePaint() { if (!framePending) { framePending = true; requestAnimationFrame(paint); } }
function goToPhase(index) {
  window.scrollTo({top: (experience.offsetHeight - window.innerHeight) * [0,.46,.98][index], behavior:motion.matches ? 'instant' : 'smooth'});
}
document.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => goToPhase(Number(button.dataset.phase))));
document.getElementById('skip').addEventListener('click', () => goToPhase(2));
function showTopic(index) {
  current = (index + topics.length) % topics.length;
  let attempts=0;
  while(document.querySelector(`[data-topic="${topics[current]}"]`).hidden && attempts++<topics.length)current=(current+1)%topics.length;
  if(attempts>=topics.length)return;
  panel.replaceChildren(document.getElementById(`content-${topics[current]}`).content.cloneNode(true));
  document.getElementById('panel-title').textContent = `SLICE 0${current + 1} / ${names[current]}`;
  document.getElementById('panel-count').textContent = `0${current + 1} / 05`;
  panel.scrollTop = 0;
  if (!dialog.open) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    document.getElementById('close').focus();
  }
}
document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => showTopic(topics.indexOf(button.dataset.topic))));
document.getElementById('close').addEventListener('click', () => dialog.close());
document.getElementById('previous').addEventListener('click', () => showTopic(current - 1));
document.getElementById('next').addEventListener('click', () => showTopic(current + 1));
dialog.addEventListener('close', () => { document.body.style.overflow = savedOverflow; document.querySelector(`[data-topic="${topics[current]}"]`).focus({preventScroll:true}); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('scroll', queuePaint, {passive:true});
window.addEventListener('resize', queuePaint);
motion.addEventListener('change', queuePaint);
paint();
