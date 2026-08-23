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

/* ---------------- Hero particle field ---------------- */
(function heroParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles, raf;
  const COLORS = ['rgba(88,166,255,', 'rgba(55,208,162,', 'rgba(255,194,75,'];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(x) {
    const speed = 0.35 + Math.random() * 1.15;
    return {
      x: x !== undefined ? x : Math.random() * w,
      y: Math.random() * h,
      vx: speed,
      len: 26 + Math.random() * 70,
      amp: 6 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      freq: 0.002 + Math.random() * 0.004,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: 0.08 + Math.random() * 0.22,
      width: 1 + Math.random() * 1.8,
    };
  }

  function init() {
    resize();
    const n = Math.min(90, Math.max(40, Math.floor(w / 16)));
    particles = Array.from({ length: n }, () => spawn());
  }

  let t = 0;
  function frame() {
    t += 1;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      const yOff = Math.sin(t * p.freq * 60 + p.phase + p.x * 0.004) * p.amp;
      if (p.x - p.len > w) {
        Object.assign(p, spawn(-p.len));
      }
      const grad = ctx.createLinearGradient(p.x - p.len, 0, p.x, 0);
      grad.addColorStop(0, p.color + '0)');
      grad.addColorStop(1, p.color + p.alpha + ')');
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x - p.len, p.y + Math.sin(t * p.freq * 60 + p.phase + (p.x - p.len) * 0.004) * p.amp);
      ctx.quadraticCurveTo(p.x - p.len / 2, p.y + yOff * 1.15, p.x, p.y + yOff);
      ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!raf) raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      raf = null;
    }
  });
  io.observe(canvas);

  addEventListener('resize', () => {
    init();
  });
  init();
})();
