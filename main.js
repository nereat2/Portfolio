// ─── CURSOR ───────────────────────────────────────
const cur = document.getElementById('cur');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
document.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
document.addEventListener('pointerdown', e => { mx = e.clientX; my = e.clientY; });
(function animCur() {
  cx += (mx - cx) * .18;
  cy += (my - cy) * .18;
  cur.style.left = cx + 'px';
  cur.style.top  = cy + 'px';
  requestAnimationFrame(animCur);
})();

document.querySelectorAll('a, button, .prow, .ftag').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});

// ─── CUBE: INTERACTION (rotate + move) ───────────────
(function initCube() {
  const scene  = document.getElementById('cubeScene');
  const cube   = document.getElementById('cube');
  const hero   = document.querySelector('.hero');
  if (!scene || !cube || !hero) return;

  // Rotation state
  let rotX = -18, rotY = 28;
  let vRotX = 0, vRotY = 0;

  // Position state (offset from hero center, in px)
  let posX = 0, posY = 0;
  let vPosX = 0, vPosY = 0;

  // Drag state
  let isDragging = false;
  let startPointerX = 0, startPointerY = 0;
  let lastPointerX = 0, lastPointerY = 0;
  let dragDist = 0;

  // Auto-rotate when idle
  let autoRotate = true;
  let autoTimer = null;

  function applyTransform() {
    // Scene handles translation, cube handles rotation
    const heroRect = hero.getBoundingClientRect();
    const cx = heroRect.width  / 2 + posX;
    const cy = heroRect.height / 2 + posY;
    scene.style.left      = cx + 'px';
    scene.style.top       = cy + 'px';
    scene.style.transform = 'translate(-50%, -50%)';
    cube.style.transform  = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  function clampPos() {
    // Keep cube within hero bounds (with padding)
    const heroRect = hero.getBoundingClientRect();
    const pad = 120;
    const maxX = heroRect.width  / 2 - pad;
    const maxY = heroRect.height / 2 - pad;
    if (posX >  maxX) { posX =  maxX; vPosX *= -0.4; }
    if (posX < -maxX) { posX = -maxX; vPosX *= -0.4; }
    if (posY >  maxY) { posY =  maxY; vPosY *= -0.4; }
    if (posY < -maxY) { posY = -maxY; vPosY *= -0.4; }
  }

  // Animation loop
  (function tick() {
    if (!isDragging) {
      // Auto-rotate
      if (autoRotate) {
        rotY += 0.15;
      }
      // Apply inertia from throw
      rotY  += vRotY;
      rotX  += vRotX;
      posX  += vPosX;
      posY  += vPosY;
      // Damping
      vRotY  *= 0.96;
      vRotX  *= 0.96;
      vPosX  *= 0.94;
      vPosY  *= 0.94;
      // Clamp rotation X so cube never flips upside down
      rotX = Math.max(-75, Math.min(75, rotX));
      clampPos();
    }
    applyTransform();
    requestAnimationFrame(tick);
  })();

  function resumeAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { autoRotate = true; }, 4000);
  }

  scene.addEventListener('pointerdown', e => {
    isDragging   = true;
    autoRotate   = false;
    clearTimeout(autoTimer);
    dragDist     = 0;
    startPointerX = lastPointerX = e.clientX;
    startPointerY = lastPointerY = e.clientY;
    vRotX = vRotY = vPosX = vPosY = 0;
    scene.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  scene.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    dragDist += Math.abs(dx) + Math.abs(dy);

    // Rotate
    vRotY = dx * 0.55;
    vRotX = -dy * 0.55;
    rotY += vRotY;
    rotX += vRotX;
    rotX = Math.max(-75, Math.min(75, rotX));

    // Translate
    vPosX = dx * 0.8;
    vPosY = dy * 0.8;
    posX += vPosX;
    posY += vPosY;
    clampPos();

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    e.preventDefault();
  });

  scene.addEventListener('pointerup', e => {
    isDragging = false;
    resumeAuto();
    // Block tap-zone clicks if it was a real drag
    if (dragDist > 10) {
      const links = scene.querySelectorAll('.face-tap-zone');
      links.forEach(l => { l.style.pointerEvents = 'none'; });
      setTimeout(() => {
        links.forEach(l => { l.style.pointerEvents = ''; });
      }, 100);
    }
  });

  scene.addEventListener('pointercancel', () => {
    isDragging = false;
    resumeAuto();
  });
})();

// ─── CUBE: STICKER CROPS FROM GRID PNG ───────────
const FACE_IMAGES = {
  'face-front':  "assets/projects/human loci/jpeg/humanloci-grid.png",
  'face-back':   "assets/projects/elen/jpeg/elen-grid.png",
  'face-right':  "assets/projects/adaptune/jpeg/adaptune-grid.png",
  'face-left':   "assets/projects/meeting pond/jpeg/meetingpond-grid.png",
  'face-top':    "assets/projects/rememberita/jpeg/rememberita-grid.png",
  'face-bottom': "assets/projects/financial planning hub/financialhub-grid.png"
};

const POS = ['0% 0%','50% 0%','100% 0%',
             '0% 50%','50% 50%','100% 50%',
             '0% 100%','50% 100%','100% 100%'];

document.querySelectorAll('.face').forEach(face => {
  const key = Array.from(face.classList).find(c => c.startsWith('face-') && c !== 'face');
  const img = FACE_IMAGES[key];
  if (!img) return;
  face.querySelectorAll('.sticker').forEach((sticker, i) => {
    sticker.style.backgroundImage    = `url('${img}')`;
    sticker.style.backgroundPosition = POS[i];
    sticker.style.backgroundSize     = '300% 300%';
  });
});

// ─── NAV SCROLL BORDER ────────────────────────────
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── HOME LINK: hero ↔ nav transition ─────────────
(function initHomeLink() {
  const link = document.getElementById('siteHomeLink');
  const hero = document.getElementById('home');
  if (!link || !hero) return;

  function update() {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const threshold  = window.innerHeight * 0.35;
    const isHero     = heroBottom > threshold;
    link.classList.toggle('is-hero', isHero);
    link.classList.toggle('is-nav',  !isHero);
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
})();

// ─── INTRO ────────────────────────────────────────
const WORDS = [
  { w: 'Hello!',      lang: 'English'    },
  { w: '¡Hola!',      lang: 'Spanish'    },
  { w: 'Ciao!',       lang: 'Italian'    },
  { w: 'Hola!',       lang: 'Catalan'    },
  { w: 'Bonjour!',    lang: 'French'     },
  { w: 'Olá!',        lang: 'Portuguese' },
  { w: 'Hej!',        lang: 'Swedish'    },
  { w: 'こんにちは',   lang: 'Japanese'   },
  { w: 'Merhaba!',    lang: 'Turkish'    },
  { w: 'مرحباً',      lang: 'Arabic'     },
];

const intro  = document.getElementById('intro');
const hword  = document.getElementById('hword');
const hlang  = document.getElementById('hlang');
let wi = 0, introActive = true;
const landingParams = new URLSearchParams(window.location.search);
const returnProject = landingParams.get('project');
const skipIntro = sessionStorage.getItem('skipIntroOnce') === '1';

if (sessionStorage.getItem('skipIntroOnce') === '1') {
  sessionStorage.removeItem('skipIntroOnce');
}

if (skipIntro) {
  introActive = false;
  intro.style.display = 'none';
} else {
  document.body.classList.add('intro-lock');
}

function showHello() {
  if (!introActive) return;
  hword.className = 'hello-word';
  hword.textContent = WORDS[wi].w;
  hlang.textContent = WORDS[wi].lang;
  void hword.offsetWidth; // force reflow for transition
  hword.classList.add('visible');

  const hold = wi < 4 ? 900 : 550; // linger longer on the languages she speaks
  setTimeout(() => {
    hword.classList.add('fading');
    setTimeout(() => {
      wi++;
      if (wi >= WORDS.length) { endIntro(); return; }
      showHello();
    }, 480);
  }, hold);
}

function endIntro() {
  introActive = false;
  intro.classList.add('out');
  setTimeout(() => {
    intro.style.display = 'none';
    document.body.classList.remove('intro-lock');
  }, 950);
}

if (!skipIntro) {
  setTimeout(showHello, 350);
  intro.addEventListener('click', endIntro);
}

function focusReturnedProject() {
  const targetId = returnProject || window.location.hash.replace('#', '');
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start' });
  });
}

if (skipIntro) {
  window.addEventListener('load', focusReturnedProject, { once: true });
}

// ─── PAGE SURFACE ────────────────────────────────
(function initPageSurface() {
  const OFF_WHITE = '#EAEAEA';
  const BLACK = '#000000';

  document.body.style.background = OFF_WHITE;
  document.documentElement.style.setProperty('--cream', OFF_WHITE);
  document.documentElement.style.setProperty('--cream2', OFF_WHITE);
  document.documentElement.style.setProperty('--ink', BLACK);
  document.documentElement.style.setProperty('--ink2', 'rgba(0,0,0,0.78)');
  document.documentElement.style.setProperty('--muted', 'rgba(0,0,0,0.72)');
  document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.12)');
  document.documentElement.style.setProperty('--light', OFF_WHITE);

  const fluidCanvas = document.getElementById('fluidCanvas');
  if (fluidCanvas) fluidCanvas.style.display = 'none';

  document.querySelectorAll('.hero, .hero-sub, .scroll-cue, .nav-links a, .cta-line1, .cta-line2, .cta-link').forEach(el => {
    if (el) el.style.color = BLACK;
  });
  document.querySelectorAll('.cta-link').forEach(el => {
    el.style.borderBottomColor = BLACK;
  });

  function hslToRgb(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = Math.max(0, Math.min(s, 100)) / 100;
    const lig = Math.max(0, Math.min(l, 100)) / 100;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const hp = hue / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
    else if (hp < 2) [r1, g1, b1] = [x, c, 0];
    else if (hp < 3) [r1, g1, b1] = [0, c, x];
    else if (hp < 4) [r1, g1, b1] = [0, x, c];
    else if (hp < 5) [r1, g1, b1] = [x, 0, c];
    else [r1, g1, b1] = [c, 0, x];
    const m = lig - c / 2;
    return [
      Math.round((r1 + m) * 255),
      Math.round((g1 + m) * 255),
      Math.round((b1 + m) * 255)
    ];
  }

  window._hslToRgb = hslToRgb;
})();

// ─── HERO LIQUID TEXT ─────────────────────────────
(function initLiquidText() {
  const heroH1 = document.getElementById('heroH1');

  heroH1.querySelectorAll('.r-break').forEach(line => {
    const nodes = [...line.childNodes];
    line.innerHTML = '';

    nodes.forEach(node => {
      if (node.nodeType === 3) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach(part => {
          if (/^\s+$/.test(part)) {
            line.appendChild(document.createTextNode(part));
          } else if (part.length) {
            const word = document.createElement('span');
            word.className = 'lw';
            for (const ch of part) {
              const s = document.createElement('span');
              s.className = 'lc';
              s.textContent = ch;
              word.appendChild(s);
            }
            line.appendChild(word);
          }
        });
      } else if (node.nodeName === 'EM') {
        const word = document.createElement('span');
        word.className = 'lw';
        const text = node.textContent;
        for (const ch of text) {
          const s = document.createElement('span');
          s.className = 'lc';
          s.style.fontStyle = 'italic';
          s.textContent = ch;
          word.appendChild(s);
        }
        line.appendChild(word);
      } else {
        line.appendChild(node.cloneNode(true));
      }
    });
  });

  const chars = Array.from(heroH1.querySelectorAll('.lc'));
  const state = chars.map(() => ({ ty: 0, sc: 1 }));

  const RADIUS    = 90;
  const MAX_LIFT  = 8;
  const MAX_SCALE = 1.18;

  let mx = -9999, my = -9999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  (function tick() {
    chars.forEach((ch, i) => {
      const r    = ch.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      const t    = Math.max(0, 1 - dist / RADIUS);
      const ease = t * t * (3 - 2 * t);

      const targetY  = -ease * MAX_LIFT;
      const targetSc = 1 + ease * (MAX_SCALE - 1);

      const s = state[i];
      s.ty += (targetY  - s.ty) * 0.14;
      s.sc += (targetSc - s.sc) * 0.14;

      ch.style.transform = `translateY(${s.ty.toFixed(2)}px) scale(${s.sc.toFixed(3)})`;
    });
    requestAnimationFrame(tick);
  })();
})();

(function initProjectLiquidText() {
  const titles = Array.from(document.querySelectorAll('.project-overlay .project-title'));

  titles.forEach(title => {
    const text = title.textContent;
    title.innerHTML = '';
    text.split(/(\s+)/).forEach(part => {
      if (/^\s+$/.test(part)) {
        title.appendChild(document.createTextNode(part));
      } else if (part.length) {
        const word = document.createElement('span');
        word.className = 'lw';
        for (const ch of part) {
          const span = document.createElement('span');
          span.className = 'lc';
          span.textContent = ch;
          word.appendChild(span);
        }
        title.appendChild(word);
      }
    });
  });

  const chars = Array.from(document.querySelectorAll('.project-overlay .lc'));
  const state = chars.map(() => ({ ty: 0, sc: 1 }));
  const RADIUS = 88;
  const MAX_LIFT = 8;
  const MAX_SCALE = 1.16;
  let px = -9999;
  let py = -9999;

  document.addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; });
  document.addEventListener('mouseleave', () => { px = -9999; py = -9999; });

  (function tick() {
    chars.forEach((ch, i) => {
      const rect = ch.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
      const t = Math.max(0, 1 - dist / RADIUS);
      const targetY = -MAX_LIFT * t * t;
      const targetS = 1 + (MAX_SCALE - 1) * t * t;
      state[i].ty += (targetY - state[i].ty) * 0.18;
      state[i].sc += (targetS - state[i].sc) * 0.18;
      ch.style.transform = `translateY(${state[i].ty}px) scale(${state[i].sc})`;
    });
    requestAnimationFrame(tick);
  })();
})();

// ─── PROJECT ACCORDION ────────────────────────────
document.querySelectorAll('.prow').forEach(row => {
  const swatch = row.querySelector('.prow-swatch');
  const desc   = row.querySelector('.prow-desc');
  swatch.style.background = row.dataset.color;
  desc.textContent = row.dataset.desc;

  row.querySelector('.prow-top').addEventListener('click', () => {
    const isOpen = row.classList.contains('open');
    document.querySelectorAll('.prow.open').forEach(r => r.classList.remove('open'));
    if (!isOpen) row.classList.add('open');
  });
});

// ─── BACK TO TOP ──────────────────────────────
(function initBackTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  // Only show when within ~300px of the page bottom
  window.addEventListener('scroll', () => {
    const nearBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 300;
    btn.classList.toggle('visible', nearBottom);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btn.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  btn.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
})();
// ─────────────────────────────────────────────
// IMMERSIVE WORK SECTION LOGIC
// ─────────────────────────────────────────────

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1,3), 16) / 255;
  let g = parseInt(hex.slice(3,5), 16) / 255;
  let b = parseInt(hex.slice(5,7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max == min) { h = s = 0; }
  else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

// ─── PHILOSOPHY ───────────────────────────────
(function initPhilosophy() {
  const section  = document.getElementById('philosophy');
  if (!section) return;

  const mascot   = section.querySelector('.phil-mascot');
  const poses    = Array.from(section.querySelectorAll('.phil-pose'));
  const phrases  = Array.from(section.querySelectorAll('.phil-phrase'));
  const triggers = Array.from(section.querySelectorAll('.phil-trigger'));
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  // ── Random dark background on each refresh ────────────────
  if (window._hslToRgb) {
    const hue = Math.random() * 360;
    const sat = 18 + Math.random() * 18;
    const light = 8 + Math.random() * 8;
    const [r, g, b] = window._hslToRgb(hue, sat, light);
    const philBg = `rgb(${r},${g},${b})`;
    section.style.background = philBg;
    document.documentElement.style.setProperty('--phil-bg', philBg);
  }

  // ── State ─────────────────────────────────────────────────
  let activePoseIdx   = -1;
  let activePhraseIdx = -1;
  let activeStackPos  = -1;
  let currentTrigIdx  = -1;

  // ── Helpers ───────────────────────────────────────────────
  function swapPose(idx) {
    if (idx === activePoseIdx || !poses[idx]) return;
    poses.forEach((img, i) => img.classList.toggle('active', i === idx));
    activePoseIdx = idx;
  }

  function moveMascot(side) {
    if (!mascot) return;
    mascot.classList.toggle('side-left',  side === 'left');
    mascot.classList.toggle('side-right', side === 'right');
  }

  function showPhrase(phraseIdx) {
    phrases.forEach((p, i) => p.classList.toggle('active', i === phraseIdx));
    activePhraseIdx = phraseIdx;
  }

  function setStackPos(pos) {
    if (pos === activeStackPos) return;
    activeStackPos = pos;
    const stackEl = section.querySelector('.phil-phrase--stack');
    if (!stackEl) return;
    stackEl.querySelectorAll('.phil-stack-line').forEach((line, i) => {
      line.classList.remove('stack-current', 'stack-faded1', 'stack-faded2');
      if (i === pos)          line.classList.add('stack-current');
      else if (i === pos - 1) line.classList.add('stack-faded1');
      else if (i < pos - 1)   line.classList.add('stack-faded2');
    });
  }

  function activateTrigger(idx) {
    if (idx === currentTrigIdx) return;
    currentTrigIdx = idx;
    const t          = triggers[idx];
    const phraseIdx  = parseInt(t.dataset.phrase, 10);
    const poseIdx    = parseInt(t.dataset.pose, 10);
    const side       = t.dataset.side;
    const stackPosS  = t.dataset.stackPos;
    const stackPos   = stackPosS !== undefined ? parseInt(stackPosS, 10) : null;

    showPhrase(phraseIdx);
    moveMascot(side);
    setTimeout(() => swapPose(poseIdx), isMobile ? 0 : 120);
    if (stackPos !== null) setStackPos(stackPos);
  }

  // ── Mascot visibility ─────────────────────────────────────
  const cta = document.getElementById('cta');

  function checkMascotVisibility() {
    if (!mascot) return;
    const philRect = section.getBoundingClientRect();
    const ctaRect  = cta ? cta.getBoundingClientRect() : null;
    const philShowThreshold = window.innerHeight * 0.18;
    const philInView = philRect.top < philShowThreshold && philRect.bottom > 0;
    const ctaApproaching = ctaRect && ctaRect.top < window.innerHeight * 0.85;
    if (!philInView || ctaApproaching) {
      mascot.classList.remove('visible');
    } else {
      mascot.classList.add('visible');
    }
  }

  const homeLink = document.getElementById('siteHomeLink');
  function syncPhilosophyNavColor() {
    if (!homeLink) return;
    const philRect = section.getBoundingClientRect();
    const inView = philRect.top < window.innerHeight && philRect.bottom > 0;
    homeLink.style.color = inView ? '#FFFFFF' : '';
  }

  // ── Scroll-based trigger detection ────────────────────────
  // Cache absolute document positions of each trigger once, recompute on resize.
  // On each scroll, find which trigger the viewport "reading line" falls within.
  let triggerTops = [];

  function cacheTriggerPositions() {
    const scrollY = window.scrollY;
    triggerTops = triggers.map(t => {
      const r = t.getBoundingClientRect();
      return r.top + scrollY;
    });
  }

  function updateActivePhrase() {
    // "Reading line" = 50% down the viewport. When this line crosses a trigger,
    // that trigger becomes active.
    const readingY = window.scrollY + window.innerHeight * 0.5;

    let newIdx = 0;
    for (let i = triggerTops.length - 1; i >= 0; i--) {
      if (readingY >= triggerTops[i]) { newIdx = i; break; }
    }

    // Only change phrase when section is in view
    const philRect = section.getBoundingClientRect();
    if (philRect.top < window.innerHeight && philRect.bottom > 0) {
      activateTrigger(newIdx);
    }

    checkMascotVisibility();
    syncPhilosophyNavColor();
  }

  window.addEventListener('scroll', updateActivePhrase, { passive: true });
  window.addEventListener('resize', () => {
    cacheTriggerPositions();
    updateActivePhrase();
  }, { passive: true });

  // Wait one frame for layout, then cache positions and set initial state
  requestAnimationFrame(() => {
    cacheTriggerPositions();
    // Pre-activate trigger 0 so first phrase + pose are ready before scrolling
    activateTrigger(0);
    syncPhilosophyNavColor();
  });

  // ── Cursor parallax (desktop only) ────────────────────────
  if (!mascot || isMobile) return;

  let tx = 0, ty = 0, px = 0, py = 0;
  let rafId = null;
  let sectionActive = false;

  function loopParallax() {
    px += (tx - px) * 0.055;
    py += (ty - py) * 0.055;
    mascot.style.setProperty('--px', `${px}px`);
    mascot.style.setProperty('--py', `${py}px`);
    rafId = requestAnimationFrame(loopParallax);
  }

  document.addEventListener('mousemove', e => {
    if (!sectionActive) return;
    tx = (e.clientX / window.innerWidth  - 0.5) * 22;
    ty = (e.clientY / window.innerHeight - 0.5) * 14;
  });

  const parallaxObs = new IntersectionObserver(([e]) => {
    sectionActive = e.isIntersecting;
    if (sectionActive && !rafId) {
      rafId = requestAnimationFrame(loopParallax);
    } else if (!sectionActive) {
      cancelAnimationFrame(rafId);
      rafId = null;
      tx = ty = px = py = 0;
      mascot.style.setProperty('--px', '0px');
      mascot.style.setProperty('--py', '0px');
    }
  }, { threshold: 0.01 });
  parallaxObs.observe(section);
})();

// ─── CTA REVEAL ───────────────────────────────
(function initCta() {
  const cta = document.getElementById('cta');
  if (!cta) return;

  // Cursor hover for links
  cta.querySelectorAll('.cta-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });

  const obs = new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) { cta.classList.add('cta-revealed'); obs.disconnect(); } },
    { threshold: 0.25 }
  );
  obs.observe(cta);
})();

(function initPhilosophy() {
  const section  = document.getElementById('philosophy');
  if (!section) return;

  const mascot   = section.querySelector('.phil-mascot');
  const poses    = Array.from(section.querySelectorAll('.phil-pose'));
  const phrases  = Array.from(section.querySelectorAll('.phil-phrase'));
  const triggers = Array.from(section.querySelectorAll('.phil-trigger'));
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  if (window._hslToRgb) {
    const hue = Math.random() * 360;
    const sat = 18 + Math.random() * 18;
    const light = 8 + Math.random() * 8;
    const [r, g, b] = window._hslToRgb(hue, sat, light);
    const philBg = `rgb(${r},${g},${b})`;
    section.style.background = philBg;
    document.documentElement.style.setProperty('--phil-bg', philBg);
  }

  let activePoseIdx   = -1;
  let activePhraseIdx = -1;
  let activeStackPos  = -1;
  let currentTrigIdx  = -1;

  function swapPose(idx) {
    if (idx === activePoseIdx || !poses[idx]) return;
    poses.forEach((img, i) => img.classList.toggle('active', i === idx));
    activePoseIdx = idx;
  }

  function moveMascot(side) {
    if (!mascot) return;
    mascot.classList.toggle('side-left',  side === 'left');
    mascot.classList.toggle('side-right', side === 'right');
  }

  function showPhrase(phraseIdx) {
    phrases.forEach((p, i) => p.classList.toggle('active', i === phraseIdx));
    activePhraseIdx = phraseIdx;
  }

  function setStackPos(pos) {
    if (pos === activeStackPos) return;
    activeStackPos = pos;
    const stackEl = section.querySelector('.phil-phrase--stack');
    if (!stackEl) return;
    stackEl.querySelectorAll('.phil-stack-line').forEach((line, i) => {
      line.classList.remove('stack-current', 'stack-faded1', 'stack-faded2');
      if (i === pos)          line.classList.add('stack-current');
      else if (i === pos - 1) line.classList.add('stack-faded1');
      else if (i < pos - 1)   line.classList.add('stack-faded2');
    });
  }

  function activateTrigger(idx) {
    if (idx === currentTrigIdx) return;
    currentTrigIdx = idx;
    const t         = triggers[idx];
    const phraseIdx = parseInt(t.dataset.phrase, 10);
    const poseIdx   = parseInt(t.dataset.pose, 10);
    const side      = t.dataset.side;
    const stackPosS = t.dataset.stackPos;
    const stackPos  = stackPosS !== undefined ? parseInt(stackPosS, 10) : null;

    showPhrase(phraseIdx);
    moveMascot(side);
    setTimeout(() => swapPose(poseIdx), isMobile ? 0 : 120);
    if (stackPos !== null) setStackPos(stackPos);
  }

  const cta = document.getElementById('cta');

  function checkMascotVisibility() {
    if (!mascot) return;
    const philRect = section.getBoundingClientRect();
    const ctaRect  = cta ? cta.getBoundingClientRect() : null;
    const philInView = philRect.top < window.innerHeight * 0.18 && philRect.bottom > 0;
    const ctaApproaching = ctaRect && ctaRect.top < window.innerHeight * 0.85;
    if (!philInView || ctaApproaching) {
      mascot.classList.remove('visible');
    } else {
      mascot.classList.add('visible');
    }
  }

  let triggerTops = [];

  function cacheTriggerPositions() {
    const scrollY = window.scrollY;
    triggerTops = triggers.map(t => {
      const r = t.getBoundingClientRect();
      return r.top + scrollY;
    });
  }

  function updateActivePhrase() {
    const readingY = window.scrollY + window.innerHeight * 0.5;
    let newIdx = 0;
    for (let i = triggerTops.length - 1; i >= 0; i--) {
      if (readingY >= triggerTops[i]) { newIdx = i; break; }
    }
    const philRect = section.getBoundingClientRect();
    if (philRect.top < window.innerHeight && philRect.bottom > 0) {
      activateTrigger(newIdx);
    }
    checkMascotVisibility();
  }

  window.addEventListener('scroll', updateActivePhrase, { passive: true });
  window.addEventListener('resize', () => {
    cacheTriggerPositions();
    updateActivePhrase();
  }, { passive: true });

  requestAnimationFrame(() => {
    cacheTriggerPositions();
    activateTrigger(0);
  });

  if (!mascot || isMobile) return;

  let tx = 0, ty = 0, px = 0, py = 0;
  let rafId = null;
  let sectionActive = false;

  function loopParallax() {
    px += (tx - px) * 0.055;
    py += (ty - py) * 0.055;
    mascot.style.setProperty('--px', `${px}px`);
    mascot.style.setProperty('--py', `${py}px`);
    rafId = requestAnimationFrame(loopParallax);
  }

  document.addEventListener('mousemove', e => {
    if (!sectionActive) return;
    tx = (e.clientX / window.innerWidth  - 0.5) * 22;
    ty = (e.clientY / window.innerHeight - 0.5) * 14;
  });

  const parallaxObs = new IntersectionObserver(([e]) => {
    sectionActive = e.isIntersecting;
    if (sectionActive && !rafId) {
      rafId = requestAnimationFrame(loopParallax);
    } else if (!sectionActive) {
      cancelAnimationFrame(rafId);
      rafId = null;
      tx = ty = px = py = 0;
      mascot.style.setProperty('--px', '0px');
      mascot.style.setProperty('--py', '0px');
    }
  }, { threshold: 0.01 });
  parallaxObs.observe(section);
})();

// ─── CTA REVEAL ───────────────────────────────────
(function initCta() {
  const cta = document.getElementById('cta');
  if (!cta) return;

  cta.querySelectorAll('.cta-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });

  const obs = new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) { cta.classList.add('cta-revealed'); obs.disconnect(); } },
    { threshold: 0.25 }
  );
  obs.observe(cta);
})();
