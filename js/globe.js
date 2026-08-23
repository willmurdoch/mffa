/* Moving Forward for Ataxia — interactive donation globe (Three.js) */

import * as THREE from '../vendor/three.module.js';
import { LAND_DOTS } from '../data/land-dots.js';

const canvas = document.getElementById('globeCanvas');
const tooltip = document.getElementById('globeTooltip');
const wrap = document.getElementById('globeWrap');
const chipsList = document.getElementById('locationChips');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Locations. index 0 = home base; order matches the .chip data-loc indices */
const LOCATIONS = [
  { name: 'Downingtown, PA', sub: 'Home base — where it all started', lat: 40.006, lon: -75.703, home: true },
  { name: 'Dimondale, MI', lat: 42.646, lon: -84.649 },
  { name: 'Jacksonville, FL', lat: 30.332, lon: -81.656 },
  { name: 'Malden, MA', lat: 42.425, lon: -71.066 },
  { name: 'Dayton, OH', lat: 39.759, lon: -84.192 },
  { name: 'Inverness, FL', lat: 28.836, lon: -82.33 },
  { name: 'Windsor, CO', lat: 40.478, lon: -104.901 },
  { name: 'Austin, TX', lat: 30.267, lon: -97.743 },
  { name: 'Rio Rancho, NM', lat: 35.233, lon: -106.664 },
  { name: 'Springfield, MO', lat: 37.209, lon: -93.292 },
  { name: 'Thorndale, PA', lat: 39.993, lon: -75.745 },
  { name: 'St. Johns, MI', lat: 43.001, lon: -84.559 },
  { name: 'Elko, NV', lat: 40.833, lon: -115.763 },
  { name: 'San Jose, CA', lat: 37.339, lon: -121.895 },
  { name: 'Happy Valley, OR', lat: 45.447, lon: -122.53 },
  { name: 'Maquoketa, IA', lat: 42.069, lon: -90.666 },
  { name: 'Cyprus', sub: 'Across the Atlantic', lat: 35.126, lon: 33.43 },
  { name: 'Egypt', sub: 'Across the Atlantic', lat: 30.044, lon: 31.236 },
];

const R = 1;

function latLonToVec3(lat, lon, radius = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  wrap.style.display = 'none'; /* WebGL unavailable — chips list still tells the story */
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.55, 3.6);
  camera.lookAt(0, 0, 0);

  const globe = new THREE.Group();
  scene.add(globe);

  /* --- inner sphere (dark body of the earth) --- */
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.985, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0x0a1126, transparent: true, opacity: 0.92 })
  );
  globe.add(sphere);

  /* --- atmosphere glow (fresnel shader on a slightly larger back-side sphere) --- */
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.12, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.33, 0.65, 1.0, 1.0) * intensity;
        }`,
    })
  );
  scene.add(atmosphere);

  /* --- land dot-matrix --- */
  function circleSprite(color, size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, color);
    grad.addColorStop(0.55, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const dotCount = LAND_DOTS.length / 2;
  const dotPositions = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    const v = latLonToVec3(LAND_DOTS[i * 2], LAND_DOTS[i * 2 + 1]);
    dotPositions[i * 3] = v.x;
    dotPositions[i * 3 + 1] = v.y;
    dotPositions[i * 3 + 2] = v.z;
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
  const dots = new THREE.Points(
    dotsGeo,
    new THREE.PointsMaterial({
      size: 0.0145,
      map: circleSprite('rgba(148,176,232,1)'),
      color: 0x94b0e8,
      transparent: true,
      opacity: 1,
      alphaTest: 0.08,
      depthWrite: false,
    })
  );
  globe.add(dots);

  /* --- location pins --- */
  const pinGroup = new THREE.Group();
  globe.add(pinGroup);
  const pinMeshes = [];

  const mintTex = circleSprite('rgba(55,208,162,1)');
  const goldTex = circleSprite('rgba(255,194,75,1)');

  LOCATIONS.forEach((loc, i) => {
    const pos = latLonToVec3(loc.lat, loc.lon, R * 1.005);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: loc.home ? goldTex : mintTex,
        transparent: true,
        depthWrite: false,
      })
    );
    sprite.position.copy(pos);
    const s = loc.home ? 0.085 : 0.062;
    sprite.scale.set(s, s, 1);
    sprite.userData = { index: i, baseScale: s };
    pinGroup.add(sprite);
    pinMeshes.push(sprite);

    /* pulse ring */
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.026, 32),
      new THREE.MeshBasicMaterial({
        color: loc.home ? 0xffc24b : 0x37d0a2,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.position.copy(pos);
    ring.lookAt(pos.clone().multiplyScalar(2));
    ring.userData = { t: Math.random() * Math.PI * 2 };
    pinGroup.add(ring);
    loc._ring = ring;
  });

  /* --- arcs from home base to each location --- */
  const home = LOCATIONS[0];
  const arcMat = new THREE.LineBasicMaterial({
    color: 0x58a6ff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const arcs = [];
  LOCATIONS.slice(1).forEach((loc, idx) => {
    const a = latLonToVec3(home.lat, home.lon, R * 1.004);
    const b = latLonToVec3(loc.lat, loc.lon, R * 1.004);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.1 + dist * 0.28));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    geo.setDrawRange(0, 0);
    const line = new THREE.Line(geo, arcMat.clone());
    line.userData = { delay: idx * 0.35, speed: 0.9 + Math.random() * 0.5, total: 65, progress: 0 };
    globe.add(line);
    arcs.push(line);
  });

  /* --- stars backdrop --- */
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(400 * 3);
  for (let i = 0; i < 400; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(12 + Math.random() * 20);
    starPos[i * 3] = v.x;
    starPos[i * 3 + 1] = v.y;
    starPos[i * 3 + 2] = v.z;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ size: 0.05, color: 0x8899cc, transparent: true, opacity: 0.5, depthWrite: false })
  );
  scene.add(stars);

  /* --- interaction: drag to rotate, hover pins --- */
  /* rotation that brings a longitude to face the camera (+z):
     a point's xz-angle is atan2(x, z) = theta - PI/2, and rotating the globe
     by alpha adds alpha to that angle, so alpha = PI/2 - theta centers it */
  const faceRotY = (lon) => Math.PI / 2 - ((lon + 180) * Math.PI) / 180;
  let targetRotY = faceRotY(home.lon) - 0.12; /* start on the US, home base just left of center */
  let targetRotX = 0.3;
  let rotY = targetRotY;
  let rotX = targetRotX;
  let autoSpin = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let resumeTimer;

  function pointerDown(e) {
    dragging = true;
    autoSpin = false;
    clearTimeout(resumeTimer);
    lastX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    lastY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  }
  function pointerMove(e) {
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    if (dragging && x !== undefined) {
      targetRotY += (x - lastX) * 0.005;
      targetRotX += (y - lastY) * 0.0028;
      targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
      lastX = x;
      lastY = y;
    }
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    resumeTimer = setTimeout(() => (autoSpin = true), 3500);
  }
  canvas.addEventListener('pointerdown', pointerDown);
  addEventListener('pointermove', pointerMove, { passive: true });
  addEventListener('pointerup', pointerUp, { passive: true });

  /* hover tooltips via raycaster */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoverIndex = -1;
  let mouseClient = null;

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseClient = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });
  canvas.addEventListener('pointerleave', () => {
    mouseClient = null;
    setHover(-1);
  });

  const chips = chipsList ? [...chipsList.querySelectorAll('.chip')] : [];
  function setHover(i) {
    if (i === hoverIndex) return;
    hoverIndex = i;
    chips.forEach((c) => c.classList.toggle('is-active', Number(c.dataset.loc) === i));
    if (i < 0) {
      tooltip.classList.remove('is-on');
      canvas.style.cursor = 'grab';
    } else {
      const loc = LOCATIONS[i];
      tooltip.innerHTML = `${loc.name}${loc.sub ? `<em>${loc.sub}</em>` : '<em>Supporters here moved us forward</em>'}`;
      tooltip.classList.add('is-on');
      canvas.style.cursor = 'pointer';
    }
  }

  /* chips hover highlights pin (spin globe toward it) */
  chips.forEach((chip) => {
    chip.addEventListener('mouseenter', () => {
      const i = Number(chip.dataset.loc);
      const loc = LOCATIONS[i];
      if (!loc) return;
      /* rotate globe so this location faces the camera */
      autoSpin = false;
      clearTimeout(resumeTimer);
      targetRotY = faceRotY(loc.lon);
      /* choose shortest path from current rotation */
      while (targetRotY - rotY > Math.PI) targetRotY -= Math.PI * 2;
      while (targetRotY - rotY < -Math.PI) targetRotY += Math.PI * 2;
      targetRotX = Math.max(-0.9, Math.min(0.9, (loc.lat * Math.PI) / 180 * 0.75));
      resumeTimer = setTimeout(() => (autoSpin = true), 4000);
    });
  });

  /* --- resize --- */
  function resize() {
    const size = Math.min(wrap.clientWidth, Math.round(innerHeight * 0.78));
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  /* --- pause rendering offscreen --- */
  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '100px' }).observe(canvas);

  /* --- animation loop --- */
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (autoSpin && !prefersReducedMotion) targetRotY += dt * 0.11;
    rotY += (targetRotY - rotY) * 0.07;
    rotX += (targetRotX - rotX) * 0.07;
    globe.rotation.y = rotY;
    globe.rotation.x = rotX;
    stars.rotation.y = rotY * 0.2;

    /* pulse rings */
    LOCATIONS.forEach((loc) => {
      const ring = loc._ring;
      ring.userData.t += dt * 1.6;
      const k = (Math.sin(ring.userData.t) + 1) / 2;
      const s = 1 + k * 2.2;
      ring.scale.set(s, s, 1);
      ring.material.opacity = 0.75 * (1 - k);
    });

    /* arcs draw in, then hold + shimmer */
    arcs.forEach((line) => {
      const u = line.userData;
      if (t > u.delay) {
        u.progress = Math.min(u.total, u.progress + dt * 60 * u.speed);
        line.geometry.setDrawRange(0, Math.floor(u.progress));
        line.material.opacity = 0.28 + 0.2 * Math.sin(t * 2 + u.delay * 4);
      }
    });

    /* raycast pins */
    if (mouseClient) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(pinMeshes, false);
      if (hits.length) {
        const sprite = hits[0].object;
        setHover(sprite.userData.index);
        /* position tooltip above pin */
        tmpV.copy(sprite.position).applyMatrix4(globe.matrixWorld).project(camera);
        const rect = canvas.getBoundingClientRect();
        tooltip.style.left = ((tmpV.x + 1) / 2) * rect.width + 'px';
        tooltip.style.top = ((-tmpV.y + 1) / 2) * rect.height + 'px';
      } else {
        setHover(-1);
      }
    }

    /* hovered / chip-active pin grows */
    pinMeshes.forEach((m) => {
      const want = m.userData.index === hoverIndex ? m.userData.baseScale * 1.7 : m.userData.baseScale;
      const cur = m.scale.x;
      const next = cur + (want - cur) * 0.18;
      m.scale.set(next, next, 1);
    });

    renderer.render(scene, camera);
  }
  animate();
}
