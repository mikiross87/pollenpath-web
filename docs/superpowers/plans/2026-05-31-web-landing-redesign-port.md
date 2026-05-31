# Web Landing Redesign — Pixel-Faithful Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use the `frontend-design:frontend-design` skill while building the markup/CSS.

**Goal:** Rewrite `pollenpath-web/index.html` as a single self-contained, pixel-faithful port of the Claude Design export (`docs/superpowers/design-source/PollenPath.html` + `styles.css` + `tokens.css` + `app.js`), substituting real assets/prices and preserving the live site's SEO, pre-launch gating, CSP, and legal/footer content.

**Architecture:** One static HTML file with one inlined `<style>` (tokens.css + styles.css merged, woff2 fonts, dev `.tw-*` panel styles dropped) and inlined scripts (a tiny head theme-bootstrap, the JSON-LD block, and a trimmed body script: scroll-reveal + nav-shadow + billing-toggle + theme-toggle + waitlist handler). Phone mockups become real screenshot `<img>`s in the design's phone frames. Dark mode is driven by `data-theme` on `<html>` (bootstrap reads `localStorage` else `prefers-color-scheme`). Served by Cloudflare Pages; CSP hashes in `_headers` are regenerated after the inline blocks change.

**Tech Stack:** Static HTML/CSS/JS, Outfit + DM Sans self-hosted woff2, Cloudflare Pages, CSP via `_headers`.

**Source of truth for markup/CSS:** `docs/superpowers/design-source/` (committed). Build by inlining those files and applying the **exact deltas** in each task — do not re-author from scratch and do not copy the design verbatim where a delta says otherwise.

**Global conventions for every task:**
- Work in `pollenpath-web/` on branch `feature/web-landing-redesign-port`.
- The file is built top-to-bottom across tasks; after each task the file is valid HTML that renders progressively more. Commit at the end of each task.
- Drop entirely: `tweaks.js`, the `.tw-*` style block (design `styles.css` lines ~392–422), the design's JS phone-builder (`app.js` `statusbar`/`tabbar`/`metric`/`dashboardScreen`/`insightsScreen`/`screens` + the `[data-phone]` loop), the design's `tokens.css` `@font-face` TTF rules, and any rating-star markup.
- Keep: decorative leaf motifs (the `#leaf` symbol, `.hero-leaf-bg`, `.privacy-leaf`, `.cta-box .leaf-wm`, eyebrow leaves), the `--brand-a/--brand-b/--hero-a/--hero-b` CSS vars, the film-grain `body::before`.
- Real assets that already exist in-repo: `img/icon.png`, `img/screens/{home,insights,logger,forecast}.webp`, `fonts/outfit-{400,600,700,800}.woff2`, `fonts/dm-sans-*.woff2`.
- No mobile hamburger menu — follow the design (nav links simply hide < 940px via `styles.css` line ~434). The theme toggle + CTA stay visible on mobile.

**Local serve for verification (used by several tasks):**
```bash
cd /Users/miguelross/Developer/pollenpath-web && python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 &
# ... curl checks ...
# kill: pkill -f "http.server 8787"
```

---

### Task 1: Scaffold — head, inlined styles, leaf symbol, nav, theme bootstrap

**Goal:** Replace `index.html` with a new document containing the preserved `<head>`, the full inlined `<style>` (tokens + styles, woff2 fonts, drop `.tw-*`), the reusable `#leaf` SVG symbol, the sticky nav (real `icon.png` wordmark + theme toggle + gated CTA), and a head theme-bootstrap script — with an empty `<main id="top">` placeholder.

**Files:**
- Modify (overwrite): `pollenpath-web/index.html`
- Reference: `pollenpath-web/docs/superpowers/design-source/{PollenPath.html,styles.css,tokens.css}`
- Reference (for head + fonts): current `index.html` head/`@font-face` (lines 1–106 in the pre-change version; available via `git show develop:index.html`)

**Acceptance Criteria:**
- [ ] `<head>` preserves verbatim from the current site: the launch-flip HTML comment, title, meta description/keywords/author/robots, canonical, all Open Graph + Twitter tags, `apple-itunes-app` (`app-id=6760616969`), `al:ios:app_name`, favicon + apple-touch-icon, and the JSON-LD `MobileApplication` block.
- [ ] `<html lang="en" data-launch="pre">` is retained.
- [ ] A single inlined `<style>` contains: the woff2 `@font-face` block (Outfit 400/600/700/800 + DM Sans weights, from current site), then `tokens.css` (minus its TTF `@font-face`), then `styles.css` (minus the `.tw-*` block lines ~392–422).
- [ ] Head theme-bootstrap `<script>` sets `data-theme` from `localStorage['pp-theme']` else `matchMedia('(prefers-color-scheme: dark)')`, before first paint.
- [ ] Nav brand uses `<img src="img/icon.png">` (not the gradient leaf badge); nav has the theme toggle button and a CTA that is `Get Notified`→`#download` for `[data-show-when="pre"]` and an App Store link for `[data-show-when="live"]`.
- [ ] `<main id="top">` exists (empty for now); `<body>` opens with the `#leaf` `<symbol>` SVG.
- [ ] Page loads with no console errors; toggling theme button flips light/dark and persists across reload.

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
curl -s localhost:8787/ | grep -c 'app-id=6760616969'          # → 1
curl -s localhost:8787/ | grep -c 'data-launch="pre"'          # → 1
curl -s localhost:8787/ | grep -c 'img/icon.png'               # → ≥1 (nav)
curl -s localhost:8787/ | grep -c 'tw-panel'                   # → 0 (dropped)
curl -s localhost:8787/ | grep -c 'application/ld+json'        # → 1
pkill -f "http.server 8787"
```
Then open `http://localhost:8787/` in a browser: nav renders, theme toggle works, no console/CSP errors (CSP not yet regenerated — expect CSP violations until Task 6; verify only JS errors here).

**Steps:**

- [ ] **Step 1: Capture the current head + font block.** Run `git show develop:index.html > /tmp/old-index.html`. Copy the `<!-- launch-day flip … -->` comment, the entire `<head>` content through the JSON-LD `</script>`, and the `@font-face` woff2 declarations (old lines ~69–79). These are reused verbatim.

- [ ] **Step 2: Write the new file skeleton.** Create `index.html`:

```html
<!DOCTYPE html>
<!--
  Launch-day flip: this site ships both pre-launch and live-launch CTA variants
  in a single static build. The `data-launch` attribute below gates which set is
  visible (CSS via `[data-show-when]` selectors) and whether the JS waitlist
  handler binds. To go live:
    1. Flip `data-launch="pre"` → `data-launch="live"` on the <html> element below.
    2. Add `img/appstore-badge.svg` (Apple-supplied) if not yet present.
    3. Regenerate CSP `style-src` + `script-src` hashes (one-liner in `_headers` trailer).
    4. Commit, push — Cloudflare Pages auto-deploys.
-->
<html lang="en" data-launch="pre">
<head>
  <!-- PASTE: full current <head> (meta, canonical, OG, Twitter, apple-itunes-app,
       favicon, JSON-LD) verbatim from /tmp/old-index.html -->
  <script>
  (function(){try{var t=localStorage.getItem('pp-theme');
    if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
    document.documentElement.setAttribute('data-theme',t);}catch(e){
    document.documentElement.setAttribute('data-theme','light');}})();
  </script>
  <style>
  /* @font-face: PASTE woff2 block from /tmp/old-index.html (Outfit 400/600/700/800 + DM Sans) */
  /* PASTE tokens.css here — OMIT its TTF @font-face rules (design tokens.css lines 9–20) */
  /* PASTE styles.css here — OMIT the .tw-* block (design styles.css lines ~392–422) */
  </style>
</head>
<body>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="leaf" viewBox="0 0 24 24">
    <path d="M4.5 19.5C4.5 11 10.5 4.5 19.5 4.5C19.5 13 13.5 19.5 4.5 19.5Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
    <path d="M5 19C8.2 14 12.2 10 17.5 7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
  </symbol>
</svg>

<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="#top">
      <img src="img/icon.png" alt="" width="34" height="34" style="border-radius:10px">
      PollenPath
    </a>
    <nav class="nav-links">
      <a href="#features">Features</a>
      <a href="#privacy">Privacy</a>
      <a href="#pricing">Pricing</a>
      <a href="#faq">FAQ</a>
    </nav>
    <div class="nav-actions">
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle theme">
        <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M2.5 12h2M19.5 12h2M4.5 19.5l1.5-1.5M18 6l1.5-1.5"/></svg>
      </button>
      <a class="btn btn-primary" data-show-when="pre" href="#download">Get Notified</a>
      <a class="btn btn-primary" data-show-when="live" href="https://apps.apple.com/app/id6760616969">Get the app</a>
    </div>
  </div>
</header>

<main id="top">
  <!-- sections added in Tasks 2–5 -->
</main>

</body>
</html>
```

- [ ] **Step 3: Add the launch-gating CSS.** Inside the `<style>`, after the pasted `styles.css`, append (ported from the current site so `[data-show-when]` works):

```css
[data-show-when] { display: none; }
html[data-launch="pre"]  [data-show-when="pre"]  { display: inherit; }
html[data-launch="live"] [data-show-when="live"] { display: inherit; }
html[data-launch="pre"]  .btn[data-show-when="pre"]  { display: inline-flex; }
html[data-launch="live"] .btn[data-show-when="live"] { display: inline-flex; }
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
```

- [ ] **Step 4: Run the Verify block above.** Confirm all curl counts and a clean browser load (ignore CSP-violation warnings for now).

- [ ] **Step 5: Commit.**
```bash
git add index.html && git commit -m "feat(web): scaffold redesigned landing — head, inlined styles, nav, theming"
```

---

### Task 2: Hero + trust strip

**Goal:** Add the hero (display headline, lede, **pre-launch waitlist CTA**, trust pills with **stars removed**, dual real-screenshot phones) and the data-source trust strip.

**Files:**
- Modify: `pollenpath-web/index.html` (inside `<main>`)
- Reference: design `PollenPath.html` hero (lines 44–95)

**Acceptance Criteria:**
- [ ] Hero copy matches the design (overline `Allergy Tracker · iOS`, h1 `Connect how you feel to what's in the air.` with `feel` in `.em`, the design's lede).
- [ ] Hero CTA is gated: `[data-show-when="pre"]` shows a waitlist `<form class="hero-waitlist">` (email input + `Get Notified` primary button) + a `.btn-ghost` "See how it works" → `#features`; `[data-show-when="live"]` shows the App Store `.appstore` badge (hidden in pre).
- [ ] `.hero-meta` keeps the `Privacy-first · Free to start · Apple Health` pills but the `.stars` block is removed.
- [ ] `.hero-stage` shows two real-screenshot phones: front = `img/screens/home.webp`, secondary (behind) = `img/screens/insights.webp`, each inside the `.phone`/`.phone-screen` frame with the notch; images use `object-fit:cover;object-position:top center` to fill the 600px frame.
- [ ] Trust strip renders the four text credits (Google Pollen API · Google Air Quality API · Apple WeatherKit · On-device Core ML), no logo marks.

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
curl -s localhost:8787/ | grep -c "what's in the air"        # → 1
curl -s localhost:8787/ | grep -c 'hero-waitlist'            # → 1
curl -s localhost:8787/ | grep -c 'class="stars"'           # → 0 (removed)
curl -s localhost:8787/ | grep -o 'screens/[a-z]*.webp' | sort -u   # → home.webp, insights.webp
for f in img/screens/home.webp img/screens/insights.webp; do curl -s -o /dev/null -w "%{http_code} $f\n" localhost:8787/$f; done  # → 200
pkill -f "http.server 8787"
```
Browser: hero phones show the real Home + Insights screens framed; waitlist form visible, no stars.

**Steps:**

- [ ] **Step 1: Add a phone-image rule** to the `<style>` (the real screenshot fills the existing `.phone-screen` frame):

```css
.phone-screen > img.app-screen { width:100%; height:100%; object-fit:cover; object-position:top center; display:block; }
```

- [ ] **Step 2: Insert the hero + trust markup** at the top of `<main>`:

```html
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <div class="overline eyebrow-leaf"><svg width="16" height="16" style="color:var(--pp-primary)"><use href="#leaf"/></svg> Allergy Tracker · iOS</div>
      <h1 class="display">Connect how you <span class="em">feel</span> to what's in the air.</h1>
      <p class="lede">PollenPath pulls real-time pollen, air quality, and weather, lets you log symptoms in seconds, and finds your personal triggers — all on your device. No guessing, no tracking, no ads.</p>
      <div class="hero-cta">
        <form class="hero-waitlist" data-show-when="pre" action="#" novalidate style="display:flex;gap:8px;align-items:stretch;max-width:420px;width:100%">
          <label class="sr-only" for="hero-email">Email address</label>
          <input type="email" id="hero-email" name="email" placeholder="you@example.com" required style="flex:1;min-width:0;padding:12px 16px;border:1px solid var(--pp-border);border-radius:12px;font-family:var(--pp-font-body);font-size:15px;background:var(--pp-surface);color:var(--pp-foreground)">
          <button type="submit" class="btn btn-primary" style="flex-shrink:0">Get Notified</button>
        </form>
        <a class="appstore" data-show-when="live" href="https://apps.apple.com/app/id6760616969" aria-label="Download on the App Store">
          <svg viewBox="0 0 24 24" fill="#fff"><path d="M17.05 12.54c-.02-2.05 1.68-3.04 1.76-3.09-.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.51 2.1 2.58 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.82-1.01 2.5-2.01.79-1.15 1.11-2.27 1.13-2.32-.02-.01-2.17-.83-2.19-3.3zM15 6.27c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.39 1.23-.52.61-.98 1.58-.86 2.51.91.07 1.84-.46 2.4-1.14z"/></svg>
          <span class="as-txt"><span class="as-small">Download on the</span><span class="as-big">App Store</span></span>
        </a>
        <a class="btn btn-ghost" href="#features">See how it works</a>
      </div>
      <div class="hero-meta">
        <span>Privacy-first</span><span class="dot"></span>
        <span>Free to start</span><span class="dot"></span>
        <span>Apple Health</span>
      </div>
    </div>
    <div class="hero-stage reveal d1">
      <div class="hero-glow"></div>
      <svg class="hero-leaf-bg"><use href="#leaf"/></svg>
      <div class="phone secondary"><div class="phone-screen"><div class="phone-notch"></div><img class="app-screen" src="img/screens/insights.webp" alt="PollenPath Insights screen" loading="lazy" width="786" height="2680"></div></div>
      <div class="phone"><div class="phone-screen"><div class="phone-notch"></div><img class="app-screen" src="img/screens/home.webp" alt="PollenPath Home screen — pollen index, weather, air quality" width="786" height="2840"></div></div>
    </div>
  </div>
</section>

<section class="trust">
  <div class="wrap trust-inner reveal">
    <span class="trust-label">Environmental data from</span>
    <span class="trust-item">Google Pollen API</span><span class="trust-sep">·</span>
    <span class="trust-item">Google Air Quality API</span><span class="trust-sep">·</span>
    <span class="trust-item">Apple WeatherKit</span><span class="trust-sep">·</span>
    <span class="trust-item">On-device Core ML</span>
  </div>
</section>
```

- [ ] **Step 3: Run the Verify block** and confirm browser rendering.

- [ ] **Step 4: Commit.**
```bash
git add index.html && git commit -m "feat(web): hero with real-screenshot phones + waitlist gating, trust strip"
```

---

### Task 3: Features (two-up rows + card grid) + dark Privacy section

**Goal:** Add the two feature rows (Dashboard, Insights) using real screenshots, the 4-card feature grid, and the dark forest privacy section.

**Files:**
- Modify: `pollenpath-web/index.html` (append inside `<main>`)
- Reference: design `PollenPath.html` lines 97–199

**Acceptance Criteria:**
- [ ] Two `.feature-row`s (second `.flip`) matching the design copy; each `.feature-art` contains a framed real screenshot — row 1 `home.webp`, row 2 `insights.webp` — using the same `.phone`/`.phone-screen`/`img.app-screen` structure as the hero (not JS mockups).
- [ ] The 4-card `.card-grid` (Log in seconds / Look back / Apple Health / Gentle alerts) matches the design.
- [ ] The dark `.privacy` section renders with its heading, lede, `.privacy-leaf` watermark, and 3 `.pcard`s (On-device ML / No tracking / No ads).
- [ ] No `data-phone` attributes anywhere in the file.

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
curl -s localhost:8787/ | grep -c 'data-phone'              # → 0
curl -s localhost:8787/ | grep -c 'class="feature-row'      # → 2
curl -s localhost:8787/ | grep -c 'class="privacy"'        # → 1
curl -s localhost:8787/ | grep -c 'never leaves your phone' # → 1
pkill -f "http.server 8787"
```
Browser: feature rows show framed real screens; privacy section is dark green with 3 cards.

**Steps:**

- [ ] **Step 1: Append the features section.** Copy the design's `<section class="sec" id="features">` (lines 98–142) and the card-grid `<section>` (lines 145–170) verbatim, BUT in each `.feature-art` replace `<div class="phone" data-phone="..."></div>` with the framed-image structure:

```html
<!-- Feature row 1 art (Dashboard) -->
<div class="feature-art reveal">
  <div class="blob" style="background:var(--pp-sev-low)"></div>
  <div class="phone"><div class="phone-screen"><div class="phone-notch"></div><img class="app-screen" src="img/screens/home.webp" alt="PollenPath Home screen" loading="lazy" width="786" height="2840"></div></div>
</div>
<!-- Feature row 2 art (Insights) — inside the .flip row -->
<div class="feature-art reveal">
  <div class="blob" style="background:var(--pp-secondary)"></div>
  <div class="phone"><div class="phone-screen"><div class="phone-notch"></div><img class="app-screen" src="img/screens/insights.webp" alt="PollenPath Insights screen" loading="lazy" width="786" height="2680"></div></div>
</div>
```
Keep all the design's `.feature-copy` blocks (overlines, h3s, paragraphs, `.feature-list` items) verbatim.

- [ ] **Step 2: Append the privacy section.** Copy the design's `<section class="privacy" id="privacy">` (lines 173–199) verbatim.

- [ ] **Step 3: Run the Verify block** and confirm browser rendering.

- [ ] **Step 4: Commit.**
```bash
git add index.html && git commit -m "feat(web): feature rows + card grid + dark privacy section"
```

---

### Task 4: Pricing (real prices + toggle) + FAQ

**Goal:** Add the pricing section with **corrected real prices**, the monthly/yearly toggle, a **"2 months free"** badge, a USD/region note, and the FAQ accordion.

**Files:**
- Modify: `pollenpath-web/index.html` (append inside `<main>`)
- Reference: design `PollenPath.html` lines 202–296

**Acceptance Criteria:**
- [ ] Three tiers (Free / Basic / Pro featured) matching the design's structure and feature lists.
- [ ] Basic price `data-monthly="$2.99" data-yearly="$29.99"`; Pro price `data-monthly="$7.99" data-yearly="$79.99"`; default display = yearly (`$29.99` / `$79.99`), `per` = `/ year`.
- [ ] Billing toggle default-active = Yearly; the save badge reads **`2 months free`** (not "Save ~58%").
- [ ] `.price-note` reads: `Prices in USD; actual price varies by region — see the App Store. Auto-renews · Cancel anytime · 7-day free trial.`
- [ ] FAQ accordion: 5 `<details class="faq-item">` matching the design's questions/answers, first one `open`.

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
curl -s localhost:8787/ | grep -o 'data-monthly="[^"]*"'     # → "$2.99" and "$7.99"
curl -s localhost:8787/ | grep -o 'data-yearly="[^"]*"'      # → "$29.99" and "$79.99"
curl -s localhost:8787/ | grep -c '2 months free'           # → 1
curl -s localhost:8787/ | grep -c 'Save ~58%'               # → 0
curl -s localhost:8787/ | grep -c 'varies by region'        # → 1
curl -s localhost:8787/ | grep -c 'class="faq-item'         # → 5
pkill -f "http.server 8787"
```
Browser (after Task 5 wires JS): clicking Monthly flips prices to `$2.99` / `$7.99` and `per` to `/ month`; FAQ items expand/collapse.

**Steps:**

- [ ] **Step 1: Append the pricing section.** Copy the design's `<section class="sec" id="pricing">` (lines 202–264) verbatim EXCEPT these substitutions:
  - Basic amount span → `<span class="amt" data-monthly="$2.99" data-yearly="$29.99">$29.99</span>`
  - Pro amount span → `<span class="amt" data-monthly="$7.99" data-yearly="$79.99">$79.99</span>`
  - Save badge → `<span class="save-badge">2 months free</span>`
  - Replace the `.price-note` text with: `Prices in USD; actual price varies by region — see the App Store. Auto-renews · Cancel anytime · 7-day free trial.`
  - Tier CTA buttons (`Get started` / `Choose Basic` / `Choose Pro`) → `href="#download"` and gate is unnecessary (they anchor to the CTA/waitlist).

- [ ] **Step 2: Append the FAQ section.** Copy the design's `<section class="sec" id="faq">` (lines 267–296) verbatim (keeps `<details>`/`<summary class="faq-q">` + chevron; first item `open`).

- [ ] **Step 3: Run the Verify block** (price-attribute + badge + region-note + faq-count checks).

- [ ] **Step 4: Commit.**
```bash
git add index.html && git commit -m "feat(web): pricing with real US prices + region note, FAQ accordion"
```

---

### Task 5: CTA banner + footer + page JavaScript

**Goal:** Add the gradient CTA banner (gated), the footer (real links + founder quote + data attributions + disclaimer), and the trimmed inlined body `<script>` (scroll-reveal, nav-shadow, billing toggle, theme toggle, waitlist handler).

**Files:**
- Modify: `pollenpath-web/index.html` (append CTA + footer after `</main>`, add `<script>` before `</body>`)
- Reference: design `PollenPath.html` lines 298–373 + `app.js`; current site footer (`git show develop:index.html`, footer block) for founder/attribution content

**Acceptance Criteria:**
- [ ] `.cta-banner` (`id="download"`) renders with leaf watermarks + heading + copy; CTA is gated — `[data-show-when="pre"]` shows a waitlist form (reusing `.hero-waitlist` styling), `[data-show-when="live"]` shows the `.appstore` badge.
- [ ] Footer uses the design's `.footer-top` layout with the real `icon.png` brand mark, and real links: Product (Features/Privacy/Pricing/FAQ anchors), Company (Press→`press.html`, Changelog→`changelog.html`, Instagram, `mailto:support@pollenpath.app`), Legal (`privacy-policy.html`, `terms-of-service.html`).
- [ ] Footer includes the founder blockquote and the **Data & Attributions** list (Google Maps Platform / Apple WeatherKit / Apple HealthKit — on device / Apple MapKit — city-level), plus the wellness disclaimer and `© 2026 PollenPath`.
- [ ] Inlined body `<script>` implements ONLY: scroll-reveal (`.anim` + IntersectionObserver, fail-safe), nav `.scrolled` shadow, billing toggle (updates `[data-monthly]`/`[data-yearly]` + `[data-per-cycle]`), theme toggle (reads current `data-theme`, swaps icon, persists `pp-theme`), and the pre-launch waitlist submit handler (`preventDefault` → button "Thanks!", disable). NO phone-builder, NO tweaks code.
- [ ] No reference to `app.js`, `tweaks.js`, or `tweaks` anywhere.

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
curl -s localhost:8787/ | grep -c 'tweaks'                      # → 0
curl -s localhost:8787/ | grep -c 'app.js'                      # → 0
curl -s localhost:8787/ | grep -c 'id="download"'              # → 1
curl -s localhost:8787/ | grep -c 'privacy-policy.html'        # → 1
curl -s localhost:8787/ | grep -c 'support@pollenpath.app'     # → 1
curl -s localhost:8787/ | grep -c 'Data &amp; Attributions'    # → 1
pkill -f "http.server 8787"
```
Browser: scroll reveals fire; nav gains border on scroll; Monthly/Yearly flips prices; theme toggle persists; waitlist submit shows "Thanks!".

**Steps:**

- [ ] **Step 1: Append the CTA banner** after the FAQ section, gating the CTA:

```html
<section class="cta-banner" id="download">
  <div class="wrap reveal">
    <div class="cta-box">
      <svg class="leaf-wm"><use href="#leaf"/></svg>
      <svg class="leaf-wm r"><use href="#leaf"/></svg>
      <h2 class="display">Breathe a little easier.</h2>
      <p>Download PollenPath and connect how you feel to what's in the air — free to start, on your iPhone.</p>
      <form class="hero-waitlist" data-show-when="pre" action="#" novalidate style="display:flex;gap:8px;justify-content:center;max-width:420px;margin:0 auto">
        <label class="sr-only" for="cta-email">Email address</label>
        <input type="email" id="cta-email" name="email" placeholder="you@example.com" required style="flex:1;min-width:0;padding:12px 16px;border:none;border-radius:12px;font-family:var(--pp-font-body);font-size:15px;background:#fff;color:#141A16">
        <button type="submit" class="btn" style="background:#fff;color:#141A16;flex-shrink:0">Get Notified</button>
      </form>
      <a class="appstore" data-show-when="live" href="https://apps.apple.com/app/id6760616969">
        <svg viewBox="0 0 24 24"><path d="M17.05 12.54c-.02-2.05 1.68-3.04 1.76-3.09-.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.51 2.1 2.58 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.82-1.01 2.5-2.01.79-1.15 1.11-2.27 1.13-2.32-.02-.01-2.17-.83-2.19-3.3zM15 6.27c.57-.69.95-1.65.85-2.6-.82.03-1.81.54-2.39 1.23-.52.61-.98 1.58-.86 2.51.91.07 1.84-.46 2.4-1.14z" fill="currentColor"/></svg>
        <span class="as-txt"><span class="as-small">Download on the</span><span class="as-big">App Store</span></span>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append the footer** after `</main>` (design `.footer` layout, real content):

```html
<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="brand"><img src="img/icon.png" alt="" width="34" height="34" style="border-radius:10px"> PollenPath</div>
        <p>A warm, privacy-first allergy tracker that connects how you feel to what's in the air.</p>
      </div>
      <div class="footer-col">
        <h5>Product</h5>
        <ul><li><a href="#features">Features</a></li><li><a href="#privacy">Privacy</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#faq">FAQ</a></li></ul>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <ul><li><a href="press.html">Press</a></li><li><a href="changelog.html">Changelog</a></li><li><a href="https://instagram.com/pollenpath.app" target="_blank" rel="noopener">Instagram</a></li><li><a href="mailto:support@pollenpath.app">Contact</a></li></ul>
      </div>
      <div class="footer-col">
        <h5>Legal</h5>
        <ul><li><a href="privacy-policy.html">Privacy Policy</a></li><li><a href="terms-of-service.html">Terms of Service</a></li></ul>
      </div>
    </div>
    <blockquote style="margin:0 0 28px;padding:0 0 24px;border-bottom:1px solid var(--pp-border-subtle)">
      <p style="font-style:italic;color:var(--pp-foreground-secondary);font-size:14.5px;line-height:1.5;max-width:540px;margin:0 0 6px">"I wanted an allergy tracker I could trust with my own data. So I built one."</p>
      <cite style="font-style:normal;font-size:12.5px;color:var(--pp-foreground-muted)">— Miguel, founder</cite>
    </blockquote>
    <div style="margin-bottom:24px">
      <h5 style="font-family:var(--pp-font-body);font-weight:600;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--pp-foreground-secondary);margin:0 0 12px">Data &amp; Attributions</h5>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px 24px;font-size:13px;color:var(--pp-foreground-secondary)">
        <li><b style="font-weight:600;color:var(--pp-foreground)">Pollen &amp; Air Quality:</b> Google Maps Platform</li>
        <li><b style="font-weight:600;color:var(--pp-foreground)">Weather:</b> Apple WeatherKit</li>
        <li><b style="font-weight:600;color:var(--pp-foreground)">Health data:</b> Apple HealthKit — stored on your device</li>
        <li><b style="font-weight:600;color:var(--pp-foreground)">Maps &amp; Location:</b> Apple MapKit — city-level only</li>
      </ul>
    </div>
    <div class="footer-bottom">
      <p class="disclaimer">PollenPath is a wellness and tracking tool. It does not provide medical advice, diagnosis, or treatment. Species coverage varies by region.</p>
      <span class="copy">© 2026 PollenPath</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Add the inlined body `<script>`** before `</body>` (trimmed from `app.js` — reveal + nav + billing + theme + waitlist, NO phone builder, NO tweaks):

```html
<script>
(function () {
  'use strict';
  // Scroll reveal — content visible by default; hiding enabled only once JS runs.
  document.documentElement.classList.add('anim');
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      setTimeout(function () {
        revealEls.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); });
      }, 200);
    });
  } else { revealEls.forEach(function (el) { el.classList.add('in'); }); }

  // Nav shadow on scroll
  var nav = document.getElementById('nav');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Billing toggle
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

  // Theme toggle
  var sun = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.5 1.5M18 18l1.5 1.5M2.5 12h2M19.5 12h2M4.5 19.5l1.5-1.5M18 6l1.5-1.5"/>';
  var moon = '<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>';
  var themeIcon = document.getElementById('themeIcon');
  function applyIcon(t) { themeIcon.innerHTML = t === 'dark' ? moon : sun; }
  applyIcon(document.documentElement.getAttribute('data-theme'));
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('pp-theme', next); } catch (e) {}
    applyIcon(next);
    setTimeout(function () { document.body.classList.remove('theme-transition'); }, 500);
  });

  // Pre-launch waitlist (no backend yet)
  if (document.documentElement.dataset.launch === 'pre') {
    document.querySelectorAll('.hero-waitlist').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.querySelector('input[type="email"]').value.trim()) return;
        var btn = form.querySelector('button'), input = form.querySelector('input');
        btn.textContent = 'Thanks!'; btn.disabled = true; input.disabled = true;
      });
    });
  }
})();
</script>
```

- [ ] **Step 4: Run the Verify block** and confirm browser behavior (reveals, nav shadow, price toggle, theme persist, waitlist submit).

- [ ] **Step 5: Commit.**
```bash
git add index.html && git commit -m "feat(web): CTA banner, footer, and trimmed page interactions"
```

---

### Task 6: CSP hash regeneration + full verification pass

**Goal:** Regenerate the `index.html` CSP hashes (style + 2 scripts + JSON-LD) in `_headers`, add `data:` to `img-src` for the film-grain, and run a full local verification.

**Files:**
- Modify: `pollenpath-web/_headers`
- Verify: `pollenpath-web/index.html`

**Acceptance Criteria:**
- [ ] `_headers` `script-src` contains the sha256 hashes for the head theme-bootstrap script, the body script, and the JSON-LD block (3 hashes for index).
- [ ] `_headers` `style-src` contains the sha256 hash of `index.html`'s `<style>` block, AND retains the existing style hashes for the other 5 pages (`press`, `changelog`, `privacy-policy`, `terms-of-service`, `404`).
- [ ] `img-src` is `'self' data:` (so the CSS film-grain data-URI background renders).
- [ ] Loading `index.html` in a browser produces **zero** CSP violations in the console.
- [ ] All referenced assets return 200 (icon, both screens, all fonts); no 404s.
- [ ] Page renders correctly at ~375px, ~768px, ~1280px in both light and dark themes; theme choice persists across reload; system preference is honored on first visit (no stored choice).

**Verify:**
```bash
cd /Users/miguelross/Developer/pollenpath-web
# Recompute hashes using the documented one-liner in the _headers trailer:
python3 -c "import hashlib,base64,re;\
files=['index.html','press.html','changelog.html','privacy-policy.html','terms-of-service.html','404.html'];\
patterns=[('style',r'<style>(.*?)</style>'),('script',r'<script>(.*?)</script>'),('jsonld',r'<script type=\"application/ld\+json\">(.*?)</script>')];\
[print(f'{f} {t}[{i}]: sha256-{base64.b64encode(hashlib.sha256(m.encode()).digest()).decode()}') for f in files for t,p in patterns for i,m in enumerate(re.findall(p,open(f).read(),re.DOTALL))]"
# Update _headers style-src/script-src to match, then confirm no stale hashes:
python3 -m http.server 8787 >/tmp/pp-web.log 2>&1 & sleep 1
for a in img/icon.png img/screens/home.webp img/screens/insights.webp fonts/outfit-800.woff2 fonts/dm-sans-400.woff2; do curl -s -o /dev/null -w "%{http_code} $a\n" localhost:8787/$a; done  # all 200
pkill -f "http.server 8787"
```
Browser devtools (Console + Network) on `http://localhost:8787/`: no CSP errors, no 404s. Resize + toggle theme to confirm responsive + persistence.

**Steps:**

- [ ] **Step 1: Run the hash one-liner** (above). Note the `index.html style[0]`, `script[0]` (head bootstrap), `script[1]` (body), and `jsonld[0]` hashes.

- [ ] **Step 2: Update `_headers`.** Replace the `script-src` hashes with `index.html`'s `script[0]`, `script[1]`, and `jsonld[0]`. In `style-src`, replace the `index.html` style hash (the first of the six) with the new value; **leave the other five pages' style hashes untouched** (re-verify them against the one-liner output to be safe). Change `img-src 'self'` → `img-src 'self' data:`.

- [ ] **Step 3: Verify CSP in browser.** Serve and open devtools; confirm zero CSP violations and zero 404s. Fix any hash mismatch by re-running Step 1.

- [ ] **Step 4: Responsive + theme pass.** Check 375/768/1280px, light/dark, reload persistence, and first-visit system-preference fallback (clear `localStorage`, set OS dark, reload → dark).

- [ ] **Step 5: Commit.**
```bash
git add _headers && git commit -m "chore(web): regenerate CSP hashes for redesigned index; allow data: img for grain"
```

---

## Final integration

After Task 6, open a PR from `feature/web-landing-redesign-port` into `develop` using the repo's PR conventions. Do not flip `data-launch` to `live` (out of scope). The design-source reference files under `docs/superpowers/design-source/` stay committed for future reference.

## Self-Review notes (author)

- **Spec coverage:** scaffold/head/CSP (T1, T6), hero + real phones + gating + stars-removed (T2), trust strip (T2), features + privacy (T3), pricing real prices + region note + toggle (T4), FAQ (T4), CTA + footer + founder + attributions + JS (T5), theming toggle + system fallback (T1 bootstrap + T5 toggle), dropped widgets/tweaks/stars (throughout), CSP + data: grain (T6). All spec sections map to a task.
- **No placeholders:** every code-changing step shows the code or the exact verbatim-copy + substitution instruction against the committed design source.
- **Consistency:** `.hero-waitlist`, `data-monthly/data-yearly/data-per-cycle`, `#billingToggle`, `#themeToggle/#themeIcon`, `data-theme`, `pp-theme`, `.app-screen`, `data-show-when` are used identically across tasks.
