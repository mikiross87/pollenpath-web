(() => {

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // sticky steps
  const steps = [...document.querySelectorAll('.step')], shots = [...document.querySelectorAll('.screens img')], dots = [...document.querySelectorAll('.rail i')];
  const setStep = i => { steps.forEach((s, k) => s.classList.toggle('on', k === i)); shots.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((s, k) => s.classList.toggle('on', k === i)); };
  setStep(0);
  const stepIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setStep(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepIO.observe(s));


  // bento camera: scroll zooms into the card on the phone, then the vector card lifts off the screen and settles in the tile
  const zooms = [...document.querySelectorAll('.zoom')].map(z => ({ z, cam: z.querySelector('.cam'), dev: z.querySelector('.dev'), vec: z.querySelector('.vec'),
    box: z.dataset.box.split(',').map(Number), card: z.dataset.card.split(',').map(Number) }));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const camH = 2056, camW = 1138;
  const zoomFrame = () => zooms.forEach(o => {
    const r = o.z.getBoundingClientRect(), W = r.width, H = r.height, vh = innerHeight;
    const p = reduce ? 1 : clamp((vh - (r.top + H * .3)) / (vh * .6));
    const [bx, by, bw] = o.box, [card, total] = o.card;
    const kc = card / total, pf = 32 / total;
    const nat = o.vec.naturalHeight / o.vec.naturalWidth || .75;
    const cardH = (bw / kc) * (nat - 2 * pf);
    // camera
    const ez = ease(clamp(p / .7));
    const s0 = H * 1.08 / camH, s1 = W * .8 / bw, s = s0 * Math.pow(s1 / s0, ez);
    const fx = lerp(camW / 2, bx + bw / 2, ez), fy = lerp(0, by + cardH / 2, ez);
    const px = W / 2, py = lerp(18, H / 2, ez);
    const tx = px - fx * s, ty = py - fy * s;
    o.cam.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    o.dev.style.opacity = (1 - smooth(.5, .9, p)).toFixed(3);
    o.dev.style.filter = `blur(${(smooth(.45, .9, p) * 7).toFixed(2)}px)`;
    // vector card: starts on the screenshot card, lifts to the centre of the tile
    const k = ease(smooth(.42, 1, p));
    const wF = Math.min(W * .88, H * .86 * bw / cardH);
    const x0 = tx + bx * s, y0 = ty + by * s, w0 = bw * s;
    const xF = (W - wF) / 2, yF = (H - wF * cardH / bw) / 2;
    const w = lerp(w0, wF, k), x = lerp(x0, xF, k), y = lerp(y0, yF, k);
    const imgW = w / kc;
    o.vec.style.width = imgW + 'px';
    o.vec.style.transform = `translate(${x - imgW * pf}px, ${y - imgW * pf}px)`;
    o.vec.style.opacity = smooth(.38, .5, p).toFixed(3);
  });

  // scroll-linked
  const hero = document.getElementById('hero'), track = document.querySelector('.stage-track');
  const clamp = v => Math.max(0, Math.min(1, v));
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    if (reduce) { zoomFrame(); return; }
    const tr = track.getBoundingClientRect(), pin = 96;
    const hp = clamp((pin - tr.top) / 480);
    hero.style.setProperty('--p', hp.toFixed(3));
    hero.style.setProperty('--e', (hp < .5 ? 4 * hp ** 3 : 1 - (-2 * hp + 2) ** 3 / 2).toFixed(3));
    zoomFrame();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
  addEventListener('resize', frame);
  addEventListener('load', frame);

  // pricing toggle
  const btns = [...document.querySelectorAll('.toggle button')], knob = document.querySelector('.knob');
  const place = b => { knob.style.width = b.offsetWidth + 'px'; knob.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
  const setBill = b => {
    btns.forEach(x => x.setAttribute('aria-pressed', x === b)); place(b);
    const k = b.dataset.b;
    document.querySelectorAll('.pv').forEach((pv, i) => {
      const amt = pv.querySelector('.amt'), per = pv.querySelector('.per');
      const swap = () => { amt.textContent = amt.dataset[k]; if (per) per.textContent = per.dataset[k]; };
      pv.getAnimations().forEach(a => a.cancel());
      if (amt.textContent === amt.dataset[k] && (!per || per.textContent === per.dataset[k])) return;
      if (reduce) return swap();
      const out = pv.animate([{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: 'translateY(-45%)', opacity: 0, filter: 'blur(5px)' }],
        { duration: 170, delay: i * 45, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      out.onfinish = () => {
        swap(); out.cancel();
        pv.animate([{ transform: 'translateY(45%)', opacity: 0, filter: 'blur(5px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
          { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' });
      };
    });
  };
  btns.forEach(b => b.addEventListener('click', () => setBill(b)));
  const active = () => btns.find(b => b.getAttribute('aria-pressed') === 'true');
  addEventListener('load', () => place(active()));
  addEventListener('resize', () => place(active()));
  document.fonts && document.fonts.ready.then(() => place(active()));
  place(btns[1]);
})();
