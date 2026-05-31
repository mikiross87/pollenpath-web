# Web Landing Redesign — Pixel-Faithful Port of `PollenPath.html`

_Date: 2026-05-31 · Repo: `mikiross87/pollenpath-web` · Branch: `feature/web-landing-redesign-port` (from `develop`)_

## Goal

Replace the current `pollenpath-web/index.html` with a pixel-faithful port of the new
marketing design (`PollenPath.html`, exported from Claude Design), while preserving
the live site's substance: real assets, pre-launch gating, SEO, CSP, and legal/footer
content. The design drives the **look**; the existing site drives the **truth**.

Source of the design (extracted handoff bundle): hero, data-source trust strip,
two-up feature rows, dark "privacy" section, pricing with monthly/yearly toggle,
FAQ accordion, gradient CTA banner, footer — in the PollenPath brand system
(Outfit display / DM Sans body, forest-green + cream, severity gradients).

## Approach

- **Single self-contained file.** Rewrite `index.html` with inline `<style>` and
  `<script>`, matching the repo's existing pattern and its `_headers` CSP-hash
  workflow. The design's external `tokens.css` / `styles.css` / `app.js` are inlined;
  the dev-only **`tweaks.js` panel is dropped** (a Claude Design artifact, not production).
- **Reuse existing self-hosted fonts** (`/fonts/outfit-{400,600,700,800}.woff2`,
  `/fonts/dm-sans-*.woff2`). Do not add the design's variable TTFs.
- **No other pages change** (`press`, `changelog`, `privacy-policy`, `terms-of-service`,
  `404` stay as-is). Their existing CSP style hashes must be preserved in `_headers`.

## Page structure (from the design)

1. Sticky frosted **nav** — `icon.png` wordmark, anchor links (Features / Privacy /
   Pricing / FAQ), **light/dark toggle**, CTA button.
2. **Hero** — eyebrow, Outfit display headline ("Connect how you *feel* to what's in
   the air."), lede, CTA cluster, trust pills, and a dual-phone stage
   (Dashboard front + Insights behind) using **real screenshots**.
3. **Trust strip** — "Environmental data from · Google Pollen API · Google Air Quality
   API · Apple WeatherKit · On-device Core ML" (text only, no fabricated logos).
4. **Features** — two-up rows (Dashboard, Insights) + a 4-card grid
   (Log / History / Apple Health / Gentle alerts).
5. **Privacy (dark forest section)** — "Your health data never leaves your phone" +
   3 cards (On-device ML / No tracking / No ads).
6. **Pricing** — Free / Basic / Pro cards with monthly↔yearly toggle.
7. **FAQ** — `<details>` accordion (5 items).
8. **CTA banner** — gradient, leaf watermarks, "Breathe a little easier."
9. **Footer** — brand, link columns, founder quote, data attributions, disclaimer.

## Truth substitutions (the "relevant aspects" judgment calls)

The design's chat transcript flags its phone screens **and** app icon as fabricated;
ratings and two prices are also wrong. Corrections:

| Element | Design (fabricated/wrong) | This build |
|---|---|---|
| Phone screens | JS-built CSS mockups | Real `/img/screens/home.webp` (front) + `insights.webp` (behind), framed |
| App-icon logo | Invented leaf-glyph badge | Real `img/icon.png` in nav + footer wordmark |
| Decorative leaf motifs | — | **Kept** (hero bg, privacy watermark, CTA watermark, eyebrows) — brand decoration, not an icon claim |
| Rating stars | Fabricated 4.8★ | **Removed.** Keep `Privacy-first · Free to start · Apple Health` pills |
| Basic monthly | $3.99 | **$2.99** |
| Basic yearly | $29.99 | $29.99 ✓ |
| Pro monthly | $8.99 | **$7.99** |
| Pro yearly | $79.99 | $79.99 ✓ |
| Savings badge | "Save ~58%" | **"2 months free"** (~17%, per scaling plan) |

Prices confirmed against `pollenpath/Products.storekit` and
`docs/plans/2026-03-08-pollen-api-scaling.md` (US / Tier-1 baseline).

## Pricing localization

US prices shown, in USD, with a note: **"Prices in USD. Actual price varies by
region — see the App Store for prices in your area."** No edge geo / Pages Function —
the site stays pure static. Rationale: a website can't know the user's Apple ID
store country (App Store pricing is tied to it, not IP/locale), and only USD tier
buckets are documented, so any "localized" web price would be an approximate guess
that risks misleading. The App Store is the source of truth for exact local prices.

## Launch-state gating (preserved)

Keep `data-launch="pre"` on `<html>` and the `[data-show-when="pre|live"]` mechanism:

- **Hero CTA:** pre → waitlist email form + "Coming soon to the App Store" eyebrow;
  live → App Store badge (hidden until flip).
- **Nav CTA:** pre → "Get Notified" (→ hero waitlist); live → App Store link.
- **CTA banner:** pre → waitlist/"Get Notified"; live → App Store badge.
- Waitlist `submit` handler (preventDefault → "Thanks!") carried over from current site.
- The launch-day flip comment block at the top of `index.html` is preserved/updated.

## Theming

Add the manual **light/dark toggle** from the design:

- Toggle button in nav sets `data-theme="light|dark"` on `<html>`, persists in
  `localStorage` (`pp-theme`), swaps sun/moon icon.
- CSS dark overrides keyed on `:root[data-theme="dark"]`.
- **System fallback:** when no stored choice, honor `prefers-color-scheme: dark`
  (apply `data-theme` from the media query at load). Existing
  `@media (prefers-color-scheme: dark)` rules are migrated to the `data-theme` model
  (or retained as the no-choice default).

## Preserved from current site (non-negotiable)

- Full `<head>`: meta description/keywords, canonical, Open Graph, Twitter card,
  `apple-itunes-app` (app-id=6760616969), favicon/apple-touch-icon, JSON-LD
  `MobileApplication` structured data.
- Footer: founder quote, **Data & Attributions** block (Google Maps Platform / Apple
  WeatherKit / Apple HealthKit / Apple MapKit — city-level only), wellness disclaimer,
  copyright, real links (privacy-policy, terms-of-service, press, changelog, Instagram,
  `support@pollenpath.app`).
- Mobile hamburger menu; scroll-reveal via IntersectionObserver (fail-safe: content
  visible if JS/observer absent); reduced-motion handling.

## Dropped

- Standalone **Widgets** section (not in the new design; home-screen widgets still
  mentioned in the Dashboard feature list).
- `tweaks.js` dev panel.
- Fabricated rating stars.

## Infra: CSP hash regeneration

Inline `<style>`/`<script>` content changes → recompute hashes and update the
`Content-Security-Policy` in `_headers` using the documented one-liner (the Python
regex in the `_headers` trailer; per repo convention, **not** sed). `index.html`
contributes its `style[0]`, `script[0]`, and the JSON-LD hash; the other 5 pages'
style hashes in `style-src` must remain intact. `connect-src` stays `'none'`
(pre-launch waitlist is JS-only placeholder, no POST yet).

## Accessibility / quality bar

- Dark mode required; semantic tokens only.
- Dynamic-type-friendly `clamp()` headings; sufficient contrast (AA) in both themes,
  including tinted Pro/Basic tier cards.
- Keyboard-operable toggle, accordion, mobile menu; `aria-label`s on icon buttons;
  `prefers-reduced-motion` respected.
- Responsive: desktop / tablet / mobile breakpoints per the design.

## Verification

- Serve locally (`python3 -m http.server` in repo root) and visually verify hero,
  trust strip, both feature rows, dark privacy section, pricing toggle (prices flip
  $2.99↔$29.99 / $7.99↔$79.99, "2 months free" badge), FAQ accordion, CTA, footer.
- Toggle light/dark; reload to confirm persistence + system fallback.
- Confirm pre-launch gating: waitlist visible, no App Store badges/rating.
- Validate `_headers` CSP hashes match the new inline blocks (no console CSP
  violations in browser devtools).
- Responsive check at ~375 / 768 / 1280 px.
- All real assets resolve (icon, screens, fonts) — no 404s.

## Out of scope

- App Store go-live flip (stays `pre`).
- Edge geo-localized pricing.
- Other pages, backend waitlist wiring, new screenshot/widget art.

## Open risks

- Design's two-phone hero overlap must read well with real (taller) screenshots —
  may need frame-size/crop tuning vs. the mockup proportions.
- Migrating theming from media-query-only to `data-theme` toggle touches every dark
  rule; verify no FOUC and correct system fallback.
