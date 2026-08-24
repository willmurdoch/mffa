/* Moving Forward for Ataxia — interactions & animations */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsapOK = typeof gsap !== 'undefined';
if (gsapOK) gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ---------------- Nav ---------------- */
const nav = document.getElementById('nav');
const navLinks = document.getElementById('navLinks');
const burger = document.getElementById('navBurger');

addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', scrollY > 10);
}, { passive: true });
nav.classList.toggle('is-scrolled', scrollY > 10);

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  })
);

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Ticker: duplicate content for seamless loop ---------------- */
const track = document.getElementById('tickerTrack');
track.innerHTML += track.innerHTML;

/* ---------------- Share button ---------------- */
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', async () => {
  const shareData = {
    title: 'Moving Forward for Ataxia',
    text: 'Help put a recumbent trike into the hands of someone living with ataxia.',
    url: location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(location.href);
      const old = shareBtn.textContent;
      shareBtn.textContent = 'Link copied ✓';
      setTimeout(() => (shareBtn.textContent = old), 2200);
    }
  } catch {
    /* user cancelled */
  }
});

/* ---------------- Reveal-on-scroll ---------------- */
if (gsapOK && !prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onComplete: () => el.classList.add('is-visible'),
    });
  });
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* ---------------- Hero title lines ---------------- */
if (gsapOK && !prefersReducedMotion) {
  gsap.from('.hero__line > span', {
    yPercent: 110,
    duration: 1.1,
    stagger: 0.14,
    ease: 'power4.out',
    delay: 0.15,
  });
}

/* ---------------- Stat counters ---------------- */
function runCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString('en-US');
    return;
  }
  const dur = 2200;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll('.stat__num').forEach((el) => counterIO.observe(el));

/* ---------------- Story timeline spine fill ---------------- */
if (gsapOK && !prefersReducedMotion) {
  gsap.to('#spineFill', {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '#timeline',
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
    },
  });
} else {
  const fill = document.getElementById('spineFill');
  if (fill) fill.style.height = '100%';
}

/* ---------------- Ataxia path drawing ---------------- */
function preparePathDraw(id) {
  const p = document.getElementById(id);
  if (!p) return null;
  const len = p.getTotalLength();
  p.style.strokeDasharray = len;
  p.style.strokeDashoffset = len;
  return { p, len };
}
if (gsapOK && !prefersReducedMotion) {
  const intent = preparePathDraw('pathIntent');
  const wobble = preparePathDraw('pathAtaxia');
  if (intent && wobble) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.ataxia__viz', start: 'top 78%' },
    });
    tl.to(intent.p, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }).to(
      wobble.p,
      { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' },
      '-=0.7'
    );
  }
}

/* ---------------- Trike rides across on scroll ---------------- */
if (gsapOK && !prefersReducedMotion) {
  const stage = document.getElementById('trikeStage');
  const svg = document.getElementById('trikeSvg');
  if (stage && svg) {
    const ride = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: 0.8,
      },
    });
    ride.fromTo(
      svg,
      { x: () => -svg.getBoundingClientRect().width * 0.9 },
      { x: () => stage.getBoundingClientRect().width, ease: 'none' },
      0
    );
    ride.to('#wheelRear g, #wheelFront g', { rotation: 720, transformOrigin: 'center', ease: 'none' }, 0);
    ride.to('#crankArm', { rotation: 720, transformOrigin: '50% 50%', ease: 'none' }, 0);
  }
}

/* ---------------- Floating donate pill (after hero, hide near donate section) ---------------- */
const pill = document.getElementById('donatePill');
const heroEl = document.querySelector('.hero');
const donateSec = document.getElementById('donate');
function updatePill() {
  const pastHero = scrollY > heroEl.offsetHeight * 0.7;
  const r = donateSec.getBoundingClientRect();
  const donateVisible = r.top < innerHeight * 0.8 && r.bottom > 0;
  pill.classList.toggle('is-on', pastHero && !donateVisible);
}
addEventListener('scroll', updatePill, { passive: true });
updatePill();

/* ---------------- Smooth anchor scrolling with nav offset ---------------- */
if (gsapOK) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, { scrollTo: { y: target, offsetY: 64 }, duration: prefersReducedMotion ? 0 : 1, ease: 'power3.inOut' });
    });
  });
}


/* ---------------- Hero: drifting topographic contours ----------------
   A slowly morphing elevation map — the trail/terrain motif behind the
   whole mission. Contours are generated with value noise + marching
   squares, so the lines are nested and map-like rather than random.  */
(function heroTerrain() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* --- deterministic value noise (no dependencies) --- */
  const PERM = new Uint8Array(512);
  (function seed() {
    let s = 20240607;
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const j = s % (i + 1);
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  })();

  const smooth = (t) => t * t * (3 - 2 * t);
  const corner = (x, y) => PERM[(PERM[x & 255] + (y & 255)) & 255] / 127.5 - 1;

  function noise2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = smooth(x - xi), v = smooth(y - yi);
    const a = corner(xi, yi), b = corner(xi + 1, yi);
    const c = corner(xi, yi + 1), d = corner(xi + 1, yi + 1);
    const top = a + (b - a) * u;
    const bot = c + (d - c) * u;
    return top + (bot - top) * v;
  }

  /* three octaves, each drifting differently so the terrain morphs
     instead of merely sliding past */
  function elevation(x, y, t) {
    return (
      noise2(x, y + t * 0.55) * 0.60 +
      noise2(x * 2.1 + t * 0.30, y * 2.1) * 0.28 +
      noise2(x * 4.3, y * 4.3 - t * 0.22) * 0.12
    );
  }

  /* marching-squares edge pairs, keyed by corner mask
     (TL=8, TR=4, BR=2, BL=1); edges: 0=top 1=right 2=bottom 3=left */
  const CASES = [
    [], [[3, 2]], [[2, 1]], [[3, 1]],
    [[0, 1]], [[0, 3], [2, 1]], [[0, 2]], [[3, 0]],
    [[3, 0]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]],
    [[3, 1]], [[2, 1]], [[3, 2]], [],
  ];

  const CELL = 26;          /* px per grid cell */
  const LEVELS = 13;        /* number of contour lines */
  const SCALE = 1 / 300;    /* noise units per px */

  let w = 0, h = 0, cols = 0, rows = 0, field = null, raf = null;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CELL) + 1;
    rows = Math.ceil(h / CELL) + 1;
    field = new Float32Array((cols + 1) * (rows + 1));
  }

  function buildField(t) {
    for (let j = 0; j <= rows; j++) {
      const y = j * CELL * SCALE;
      for (let i = 0; i <= cols; i++) {
        field[j * (cols + 1) + i] = elevation(i * CELL * SCALE, y, t);
      }
    }
  }

  function draw(t) {
    buildField(t);
    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let L = 0; L < LEVELS; L++) {
      const threshold = -0.42 + (L / (LEVELS - 1)) * 0.84;
      const index = L % 4 === 0; /* every 4th line reads as an index contour */
      const mix = L / (LEVELS - 1);
      const r = Math.round(88 + (55 - 88) * mix);
      const g = Math.round(166 + (208 - 166) * mix);
      const b = Math.round(255 + (162 - 255) * mix);

      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * (cols + 1) + i;
          const a = field[idx];              /* TL */
          const bb = field[idx + 1];         /* TR */
          const c = field[idx + cols + 2];   /* BR */
          const d = field[idx + cols + 1];   /* BL */

          let mask = 0;
          if (a > threshold) mask |= 8;
          if (bb > threshold) mask |= 4;
          if (c > threshold) mask |= 2;
          if (d > threshold) mask |= 1;
          const segs = CASES[mask];
          if (!segs.length) continue;

          const x0 = i * CELL, y0 = j * CELL;
          const pt = (edge) => {
            switch (edge) {
              case 0: return [x0 + CELL * ((threshold - a) / (bb - a)), y0];
              case 1: return [x0 + CELL, y0 + CELL * ((threshold - bb) / (c - bb))];
              case 2: return [x0 + CELL * ((threshold - d) / (c - d)), y0 + CELL];
              default: return [x0, y0 + CELL * ((threshold - a) / (d - a))];
            }
          };
          for (const [e1, e2] of segs) {
            const p1 = pt(e1), p2 = pt(e2);
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
          }
        }
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},${index ? 0.38 : 0.18})`;
      ctx.lineWidth = index ? 1.5 : 1;
      ctx.stroke();
    }

    /* fade the map back where the headline sits so type stays crisp */
    ctx.globalCompositeOperation = 'destination-out';
    const fade = ctx.createLinearGradient(0, 0, w * 0.8, 0);
    fade.addColorStop(0, 'rgba(0,0,0,0.94)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.38)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  /* redraw at ~24fps: the drift is slow, so a full 60fps rebuild is waste */
  const FRAME = 1000 / 24;
  let last = 0;
  let clock = 0;

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    clock += (now - last) / 1000;
    last = now;
    draw(clock * 0.08);
  }

  function start() {
    if (raf || prefersReducedMotion) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = null;
  }

  resize();
  draw(0); /* first paint is static, so reduced-motion users still get the map */

  if (!prefersReducedMotion) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  }

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      draw(clock * 0.08);
    }, 150);
  });
})();

/* ---------------- Riders: seamless marquee + lightbox ---------------- */
(function riders() {
  const rows = document.querySelectorAll('.marquee');
  if (!rows.length) return;

  /* duplicate each row's cards so the -50% keyframe loops seamlessly */
  rows.forEach((row) => {
    const clones = [...row.children].map((el) => {
      const c = el.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.tabIndex = -1;
      return c;
    });
    clones.forEach((c) => row.appendChild(c));
  });

  /* ---- lightbox ---- */
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const cap = document.getElementById('lbCap');
  const btnClose = document.getElementById('lbClose');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');
  if (!box) return;

  /* originals only — the aria-hidden clones would double every photo */
  const shots = [...document.querySelectorAll('.rider:not([aria-hidden])')].map((b) => ({
    full: b.dataset.full,
    alt: b.dataset.alt,
    el: b,
  }));
  let current = 0;
  let lastFocus = null;

  function show(i) {
    current = (i + shots.length) % shots.length;
    const s = shots[current];
    img.src = s.full;
    img.alt = s.alt;
    cap.textContent = `${s.alt}  ·  ${current + 1} of ${shots.length}`;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      box.hidden = true;
      img.src = '';
    }, 300);
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.rider').forEach((btn) => {
    btn.addEventListener('click', () => {
      /* a clone was clicked — match it back to its original by image source */
      const idx = shots.findIndex((s) => s.full === btn.dataset.full);
      open(idx < 0 ? 0 : idx);
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => show(current - 1));
  btnNext.addEventListener('click', () => show(current + 1));
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lightbox__figure')) close();
  });

  addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      /* keep focus inside the dialog */
      const focusables = [btnClose, btnPrev, btnNext];
      const i = focusables.indexOf(document.activeElement);
      if (i !== -1) {
        e.preventDefault();
        const next = e.shiftKey ? i - 1 : i + 1;
        focusables[(next + focusables.length) % focusables.length].focus();
      }
    }
  });
})();
