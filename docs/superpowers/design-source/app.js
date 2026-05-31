/* PollenPath landing — interactions + phone mockup screens */
(function () {
  'use strict';

  /* ---- Phone screen templates ------------------------------------------- */
  var statusbar =
    '<div class="phone-notch"></div>' +
    '<div class="phone-statusbar">' +
      '<span>9:41</span>' +
      '<span class="sb-icons">' +
        '<svg viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".35"/></svg>' +
        '<svg viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 5.5C5 2.5 13 2.5 16 5.5M4.2 8C6.4 6 11.6 6 13.8 8M7 10.3c1-1 3-1 4 0" stroke-linecap="round"/></svg>' +
        '<svg viewBox="0 0 26 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="3" width="16" height="6" rx="1.5" fill="currentColor"/><rect x="23.2" y="4" width="1.8" height="4" rx="1" fill="currentColor"/></svg>' +
      '</span>' +
    '</div>';

  var leafSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5C4.5 11 10.5 4.5 19.5 4.5C19.5 13 13.5 19.5 4.5 19.5Z"/><path d="M5 19C8.2 14 12.2 10 17.5 7"/></svg>';
  var treeSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 6.5 11H9l-3.5 5.5H11V21h2v-4.5h5.5L15 11h2.5z"/></svg>';
  var sparkSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.5 3.7 1.8 5 5.5 5.5-3.7.5-5 1.8-5.5 5.5-.5-3.7-1.8-5-5.5-5.5 3.7-.5 5-1.8 5.5-5.5z"/><path d="M18.5 13.5c.3 1.9.9 2.5 2.8 2.8-1.9.3-2.5.9-2.8 2.8-.3-1.9-.9-2.5-2.8-2.8 1.9-.3 2.5-.9 2.8-2.8z"/></svg>';

  var tabbar = function (active) {
    var tabs = [
      ['home', 'Home', '<path d="M3 10.6 12 3l9 7.6V20a1 1 0 0 1-1 1h-5.2v-5.4H9.2V21H4a1 1 0 0 1-1-1z" fill="currentColor"/>'],
      ['log', 'Log', '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8.2v7.6M8.2 12h7.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'],
      ['history', 'History', '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'],
      ['insights', 'Insights', '<rect x="4" y="12" width="3.6" height="8" rx="1" fill="currentColor"/><rect x="10.2" y="7" width="3.6" height="13" rx="1" fill="currentColor"/><rect x="16.4" y="3.5" width="3.6" height="16.5" rx="1" fill="currentColor"/>']
    ];
    return '<div class="pp-tabbar">' + tabs.map(function (t) {
      var on = t[0] === active ? ' active' : '';
      return '<div class="pp-tab' + on + '"><svg viewBox="0 0 24 24">' + t[2] + '</svg>' + t[1] + '</div>';
    }).join('') + '</div>';
  };

  var dashboardScreen =
    '<div class="phone-screen">' + statusbar +
      '<div class="phone-body">' +
        '<div class="pp-header">' +
          '<div><div class="pp-greet">Good afternoon</div><div class="pp-name">John Doe</div></div>' +
          '<div class="pp-header-icons">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10.2 19.5a2 2 0 0 0 3.6 0"/></svg>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/></svg>' +
          '</div>' +
        '</div>' +
        '<div class="pp-hero-card">' +
          '<div class="pp-hero-top">' +
            '<div><div class="pp-ov">Today\'s Pollen Index</div><div class="pp-hero-num">1</div></div>' +
            '<div class="pp-hero-sev"><div class="lvl">Very Low</div><div class="sub">Pollen Level</div></div>' +
          '</div>' +
          '<div class="pp-hero-breakdown">' +
            '<div class="col"><div class="k">Grass</div><div class="v">Very Low</div></div>' +
            '<div class="col"><div class="k">Tree</div><div class="v">Very Low</div></div>' +
            '<div class="col muted"><div class="k">Weed</div><div class="v">Out of season</div></div>' +
          '</div>' +
          '<div class="pp-hero-foot"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3 3 10.5l7.3 2.9 2.9 7.3z"/></svg> Cuenca · Updated 3 hours ago</div>' +
        '</div>' +
        '<div class="pp-grid">' +
          metric('<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" fill="none" stroke="var(--pp-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', '11°C', 'Temperature') +
          metric('<path d="M12 3.2c3.2 3.4 6 6.3 6 9.6a6 6 0 0 1-12 0c0-3.3 2.8-6.2 6-9.6z" fill="none" stroke="var(--pp-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', '53%', 'Humidity') +
          metric('<path d="M3 8.5h11.5a2.6 2.6 0 1 0-2.6-2.6M3 12h16.5a2.6 2.6 0 1 1-2.6 2.6M3 15.5h9.5a2.6 2.6 0 1 1-2.6 2.6" fill="none" stroke="var(--pp-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', '21 km/h', 'Wind') +
          metric('<path d="M3.8 18.5a10 10 0 1 1 16.4 0" fill="none" stroke="var(--pp-foreground-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 13.5 16 8.5" fill="none" stroke="var(--pp-foreground-secondary)" stroke-width="2" stroke-linecap="round"/>', '1014 hPa', 'Pressure') +
        '</div>' +
        '<div class="pp-aqi">' +
          '<svg class="aqi-dot" viewBox="0 0 24 24" fill="var(--pp-success)">' +
            '<circle cx="12" cy="12" r="1.5"/>' +
            '<circle cx="12" cy="6.5" r="1.3"/><circle cx="12" cy="17.5" r="1.3"/><circle cx="6.5" cy="12" r="1.3"/><circle cx="17.5" cy="12" r="1.3"/>' +
            '<circle cx="8.1" cy="8.1" r="1.2"/><circle cx="15.9" cy="8.1" r="1.2"/><circle cx="8.1" cy="15.9" r="1.2"/><circle cx="15.9" cy="15.9" r="1.2"/>' +
            '<circle cx="12" cy="2.6" r="1"/><circle cx="12" cy="21.4" r="1"/><circle cx="2.6" cy="12" r="1"/><circle cx="21.4" cy="12" r="1"/>' +
            '<circle cx="5" cy="5" r=".9" opacity=".7"/><circle cx="19" cy="5" r=".9" opacity=".7"/><circle cx="5" cy="19" r=".9" opacity=".7"/><circle cx="19" cy="19" r=".9" opacity=".7"/>' +
          '</svg>' +
          '<span class="aqi-num">66</span><span class="aqi-txt">Good air quality</span>' +
          '<span class="aqi-meta">· O3 &nbsp; AQI <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5.5 15.5 12 9 18.5"/></svg></span>' +
        '</div>' +
      '</div>' +
      tabbar('home') +
    '</div>';

  function metric(icon, val, lbl) {
    return '<div class="pp-metric"><svg class="ic" viewBox="0 0 24 24">' + icon + '</svg>' +
      '<div class="val">' + val + '</div><div class="lbl">' + lbl + '</div></div>';
  }

  var insightsScreen =
    '<div class="phone-screen">' + statusbar +
      '<div class="phone-body">' +
        '<div class="pp-page-title">Insights</div>' +
        '<div class="pp-card">' +
          '<div class="pp-card-head"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0 1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"/></svg> Today for You</div>' +
          '<div class="pp-card-lead">You\'re feeling great and pollen is low — enjoy the day!</div>' +
          '<div class="pp-chips">' +
            '<span class="pp-chip">' + leafSvg + ' Grass Very Low</span>' +
            '<span class="pp-chip"><span style="color:var(--pp-primary)">' + treeSvg + '</span> Tree Very Low</span>' +
          '</div>' +
          '<div class="pp-hint">' + sparkSvg + ' Low pollen and mild symptoms — a good day for outdoor activities</div>' +
        '</div>' +
        '<div class="pp-card">' +
          '<div class="pp-ai-ov">' + sparkSvg + ' AI Insights</div>' +
          '<div class="pp-ai-body">This week your symptoms were quite mild, with no significant triggers reported. Tuesday was notably symptom-free — a stable week overall.</div>' +
        '</div>' +
      '</div>' +
      tabbar('insights') +
    '</div>';

  var screens = { dashboard: dashboardScreen, insights: insightsScreen };
  document.querySelectorAll('[data-phone]').forEach(function (el) {
    el.innerHTML = screens[el.getAttribute('data-phone')] || '';
  });

  /* ---- Scroll reveal ----------------------------------------------------- */
  /* Enable hide-then-reveal only now that JS is running. Content stays visible
     if anything below fails. */
  document.documentElement.classList.add('anim');
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: if anything visible is still hidden shortly after load, reveal it.
    window.addEventListener('load', function () {
      setTimeout(function () {
        revealEls.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('in');
        });
      }, 200);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Nav shadow on scroll ---------------------------------------------- */
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Billing toggle ---------------------------------------------------- */
  var billing = document.getElementById('billingToggle');
  if (billing) {
    billing.addEventListener('click', function (e) {
      var btn = e.target.closest('button'); if (!btn) return;
      var cycle = btn.getAttribute('data-cycle');
      billing.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('[data-monthly]').forEach(function (amt) {
        amt.textContent = amt.getAttribute(cycle === 'monthly' ? 'data-monthly' : 'data-yearly');
      });
      document.querySelectorAll('[data-per-cycle]').forEach(function (per) {
        per.textContent = cycle === 'monthly' ? '/ month' : '/ year';
      });
    });
  }

  /* ---- Theme toggle ------------------------------------------------------ */
  var sun = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M2.5 12h2M19.5 12h2M4.5 19.5l1.5-1.5M18 6l1.5-1.5"/>';
  var moon = '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>';
  var themeBtn = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  var saved = localStorage.getItem('pp-theme');
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    themeIcon.innerHTML = t === 'dark' ? moon : sun;
    localStorage.setItem('pp-theme', t);
  }
  apply(saved === 'dark' ? 'dark' : 'light');
  window.__ppApplyTheme = apply;
  themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.classList.add('theme-transition');
    apply(next);
    setTimeout(function () { document.body.classList.remove('theme-transition'); }, 500);
  });
})();
