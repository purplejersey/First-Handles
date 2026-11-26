import { drillAnimation, mountDrillAnimation } from '../js/components/drillAnimation.js';
import { MOTIONS, motionFor, originalPound } from '../js/components/motions.js';

MOTIONS['one-hand-dribble-original'] = originalPound;

const grid = document.getElementById('grid');
const ctls = [];
const entries = [];
for (const speed of [1, .5]) for (const hand of ['left', 'right']) {
  const pair = document.createElement('section');
  pair.className = 'pair';
  pair.innerHTML = `<h2>${hand === 'left' ? 'Left' : 'Right'} hand · ${speed === 1 ? '1×' : '½×'}</h2><div class="compare"></div>`;
  grid.append(pair);
  for (const variant of ['current', 'revised']) {
    const cell = document.createElement('div');
    cell.className = `cell ${variant}`;
    const drill = variant === 'current' ? 'one-hand-dribble-original' : 'one-hand-dribble';
    cell.innerHTML = `<h2>${variant === 'current' ? 'Current' : 'Revised'}</h2><div class="stage">${drillAnimation({ drill, hand, view: 'mirror', number: '23', closeFrame: true })}</div>`;
    pair.querySelector('.compare').append(cell);
    const ctl = mountDrillAnimation(cell.querySelector('.stage'));
    ctl.setPhase('paused');
    const svg = cell.querySelector('.anim__svg');
    svg.setAttribute('viewBox', '85 50 230 225');
    // Scope the renderer's paint IDs for a multi-instance comparison.
    const suffix = `-${entries.length}`;
    for (const def of svg.querySelectorAll('[id]')) {
      const old = def.id;
      def.id += suffix;
      for (const el of svg.querySelectorAll('[fill]')) {
        if (el.getAttribute('fill') === `url(#${old})`) el.setAttribute('fill', `url(#${def.id})`);
      }
    }
    ctls.push(ctl);
    entries.push({ ctl, speed, hand, svg, cycle: motionFor(drill).cycle });
  }
}
window.__ctls = ctls;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reduced.matches, elapsed = 0, phaseOffset = 0, last = null, zoom = false, raf;
const play = document.getElementById('play');
const scrub = document.getElementById('scrub');
const phase = document.getElementById('phase');
function status() {
  play.textContent = playing ? 'Pause' : 'Play';
  play.setAttribute('aria-pressed', String(playing));
  document.getElementById('status').textContent = `${playing ? 'Playing' : 'Paused'} · Current 120 / Revised 150 pounds per minute at 1×`;
}
function draw(q) {
  for (const e of entries) {
    const cycles = phaseOffset + elapsed * e.speed / e.cycle;
    e.ctl._renderAt(q ?? cycles % 1, Math.floor(cycles));
  }
  const p = q ?? (phaseOffset + elapsed / .5) % 1;
  scrub.value = p;
  phase.value = p.toFixed(2);
}
function tick(t) {
  if (playing && !document.hidden && last !== null) elapsed += Math.min(.1, (t-last)/1000);
  last = t;
  if (playing) draw();
  raf = requestAnimationFrame(tick);
}
play.addEventListener('click', () => { playing = !playing; last = null; status(); });
document.getElementById('restart').addEventListener('click', () => { elapsed = 0; phaseOffset = 0; last = null; draw(0); });
scrub.addEventListener('input', () => { playing = false; elapsed = 0; phaseOffset = Number(scrub.value); draw(phaseOffset); status(); });
document.getElementById('zoom').addEventListener('click', e => {
  zoom = !zoom;
  e.currentTarget.setAttribute('aria-pressed', String(zoom));
  for (const { svg, hand } of entries) svg.setAttribute('viewBox', zoom ? `${hand === 'left' ? 104 : 216} 147 80 120` : '85 50 230 225');
});
document.getElementById('seams').addEventListener('click', e => {
  const active = document.body.classList.toggle('seams');
  e.currentTarget.setAttribute('aria-pressed', String(active));
});
document.getElementById('jersey').addEventListener('change', e => {
  const [j, t] = e.target.value.split(',');
  for (const [name, value] of [['--jersey', j], ['--jersey-trim', t]]) {
    if (value) document.documentElement.style.setProperty(name, value);
    else document.documentElement.style.removeProperty(name);
  }
  ctls.forEach(c => c.recolor());
});
document.addEventListener('visibilitychange', () => { last = null; });
reduced.addEventListener('change', () => { if (reduced.matches) { playing = false; status(); } });
window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); ctls.forEach(c => c.destroy()); });
status(); draw(0); raf = requestAnimationFrame(tick);
