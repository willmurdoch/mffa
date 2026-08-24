# Moving Forward for Ataxia — website

A complete remake of [movingforwardforataxia.org](https://movingforwardforataxia.org/): a single-page, animation-rich site for the nonprofit started by Monica and Jack in Downingtown, PA, which puts recumbent trikes into the hands of people living with ataxia.

## What's here

- **`index.html`** — the whole site (hero, story timeline, ataxia explainer, why-trikes, interactive globe, how-it-works, donate section).
- **`css/styles.css`** — design system (dark theme, gradient accents, responsive, `prefers-reduced-motion` aware).
- **`js/main.js`** — GSAP scroll animations, counters, hero particle field, riding trike animation, floating donate pill.
- **`js/globe.js`** — the interactive 3D donation globe (Three.js): dot-matrix earth, glowing pins for every supporter location, animated arcs from Downingtown to each one. Drag to spin; hover pins or the chips below it.
- **`data/land-dots.js`** — precomputed land dot coordinates (generated from the public-domain [world-atlas](https://github.com/topojson/world-atlas) 110m dataset).
- **`vendor/`** — Three.js r160, GSAP 3.12 + ScrollTrigger/ScrollToPlugin, vendored locally so the site has no CDN dependencies (only Google Fonts is external).

No build step. It's plain HTML/CSS/JS — open `index.html` over any static server.

## Run locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (GitHub Pages)

A workflow is included at `.github/workflows/deploy.yml`. To go live:

1. Merge this branch into the default branch (`main`).
2. In the repo settings → **Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` deploys automatically.

To point `movingforwardforataxia.org` at it, add a `CNAME` file containing the domain and configure DNS per [GitHub Pages custom-domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Things to verify with Monica

- **Donate links** all point to the PayPal checkout Monica provided: `https://www.paypal.com/ncp/payment/7JQHV38D94YJ6`. To change it, search that URL in `index.html` (11 places).
- **Tax-deductible language was removed.** The earlier draft claimed 501(c)(3) status via Help Hope Live as fiscal sponsor. Since donations now go through PayPal directly, that claim no longer applies as written. If Moving Forward for Ataxia is a registered 501(c)(3) (or still runs gifts through a fiscal sponsor), add the entity name and EIN back to the donate fine print and footer — donors look for it, and it measurably lifts giving.
- **Contact**: the site currently routes contact through the [Facebook page](https://www.facebook.com/movingforwardforataxia/). If there's an official email, add it in the footer and the "Get a Trike" section.
- **Stats** ($55,000+ raised, 17 trikes, 13 states, 2 countries, 1,500-mile Maine→Ohio ride, 41 days, 55,000 ft of climbing, 100-mile single rides) came from press coverage (Rails-to-Trails Conservancy, Brandywine Conservancy, Help Hope Live). Update the numbers in `index.html` as they grow — search for `data-count` for the animated counters.
- **Map locations** are in `js/globe.js` (`LOCATIONS`) and mirrored as chips in `index.html`. Add new ones in both places.
- **Photos**: `assets/slideshow01-*.jpg` power the scrolling riders wall (`#riders`); `assets/thumbs/` holds the small versions the marquee loads, with the full-size originals reserved for the lightbox. To add a photo, drop it in `assets/`, generate a thumb (max 480px tall), and add a `.rider` button to either marquee row in `index.html`.
- **Alt text is generic** ("A rider on his red recumbent trike outside a bicycle shop") because I don't know these riders' names. If Monica wants them named — and has their permission — swap the `alt` and `data-alt` values on each `.rider` button.
- **Fonts are self-hosted** in `vendor/fonts/` (Sora + Inter, woff2). No Google Fonts request, so the site renders identically offline and behind restrictive networks.
- **The nav mark vs. the badge logo**: the official round logo (`assets/logo.png`) is in the footer and the share card. The nav uses the simplified trike mark, since the badge's text ring is illegible at 40px. Say the word if you'd rather use the badge everywhere.
