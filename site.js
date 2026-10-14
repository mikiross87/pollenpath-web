(() => {
  const nav = document.getElementById('nav');
  const bar = document.querySelector('.progress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 8);
    if (bar) bar.style.setProperty('--read', (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
  };
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  onScroll();

  // reveal on scroll (tiles in a pair stagger)
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach((el, i) => {
    if (el.classList.contains('tile')) el.style.transitionDelay = (i % 2) * 90 + 'ms';
    io.observe(el);
  });

  // legal contents: highlight the section being read
  const toc = [...document.querySelectorAll('.toc a')];
  if (toc.length) {
    const byId = new Map(toc.map(a => [a.hash.slice(1), a]));
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      toc.forEach(a => a.classList.remove('on'));
      const a = byId.get(e.target.id); a.classList.add('on');
      const t = a.parentElement;
      if (t.scrollWidth > t.clientWidth) t.scrollTo({ left: a.offsetLeft - (t.clientWidth - a.offsetWidth) / 2 });
      if (t.scrollHeight > t.clientHeight) t.scrollTo({ top: a.offsetTop - (t.clientHeight - a.offsetHeight) / 2 });
    }), { rootMargin: '-20% 0px -70% 0px' });
    byId.forEach((_, id) => tio.observe(document.getElementById(id)));
  }

  // press: copy descriptions
  document.querySelectorAll('.copy-btn').forEach(b => b.addEventListener('click', async () => {
    const text = b.closest('.copy-block').querySelector('.cb-text').innerText.trim();
    try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; b.classList.add('done'); }
    catch { b.textContent = 'Select and copy'; }
    setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1800);
  }));

  // mobile menu
  const mb = document.querySelector('.menu-btn'), mm = document.getElementById('mobileMenu');
  if (mb && mm) {
    const set = open => { mm.classList.toggle('open', open); mb.setAttribute('aria-expanded', open); };
    mb.addEventListener('click', () => set(!mm.classList.contains('open')));
    mm.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
})();
