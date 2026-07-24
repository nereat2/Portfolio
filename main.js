// ─── CUBE: INTERACTION (rotate + drag) ───────────────
(function initCube() {
  const scene = document.getElementById('cubeScene');
  const cube  = document.getElementById('cube');
  if (!scene || !cube) return;

  let rotX = -18, rotY = 28;
  let vRotX = 0, vRotY = 0;

  let isDragging = false;
  let lastPointerX = 0, lastPointerY = 0;
  let dragDist = 0;

  // Translation variables:
  let transX = 0, transY = 0;
  let startPointerX = 0, startPointerY = 0;
  let startTransX = 0, startTransY = 0;

  function applyTransform() {
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  (function tick() {
    if (!isDragging) {
      rotY += vRotY;
      rotX += vRotX;
      vRotY *= 0.96;
      vRotX *= 0.96;
      rotX = Math.max(-75, Math.min(75, rotX));
    }
    applyTransform();
    requestAnimationFrame(tick);
  })();

  scene.addEventListener('dragstart', e => e.preventDefault());

  scene.addEventListener('pointerdown', e => {
    isDragging   = true;
    dragDist     = 0;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    
    // Translation setup:
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startTransX = transX;
    startTransY = transY;
    
    vRotX = vRotY = 0;

    // Hide spin tag:
    const label = document.querySelector('.cube-label');
    if (label) {
      label.style.opacity = '0';
      label.style.pointerEvents = 'none';
    }
  });

  scene.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    dragDist += Math.abs(dx) + Math.abs(dy);

    if (dragDist > 10) {
      e.preventDefault();
      if (scene.hasPointerCapture && !scene.hasPointerCapture(e.pointerId)) {
        try { scene.setPointerCapture(e.pointerId); } catch(err) {}
      }
    }

    // Rotation:
    vRotY = dx * 0.55;
    vRotX = -dy * 0.55;
    rotY += vRotY;
    rotX += vRotX;
    rotX = Math.max(-75, Math.min(75, rotX));

    // Translation:
    transX = startTransX + (e.clientX - startPointerX);
    transY = startTransY + (e.clientY - startPointerY);
    scene.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;

    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  });

  scene.addEventListener('pointerup', e => {
    isDragging = false;
    if (dragDist <= 10) {
      const clickedEl = document.elementFromPoint(e.clientX, e.clientY);
      const link = clickedEl ? clickedEl.closest('.face-tap-zone') : null;
      if (link) { window.location.href = link.href; return; }
    } else {
      const links = scene.querySelectorAll('.face-tap-zone');
      links.forEach(l => { l.style.pointerEvents = 'none'; });
      setTimeout(() => { links.forEach(l => { l.style.pointerEvents = ''; }); }, 200);
    }
  });

  scene.addEventListener('pointercancel', () => {
    isDragging = false;
  });
})();

// ─── CUBE: STICKER CROPS FROM GRID PNG ───────────
const FACE_IMAGES = {
  'face-front':  "assets/projects/human loci/webp/humanloci-grid.webp",
  'face-back':   "assets/projects/elen/webp/elen-grid.webp",
  'face-right':  "assets/projects/adaptune/webp/adaptune-grid.webp",
  'face-left':   "assets/projects/meeting pond/webp/meetingpond-grid.webp",
  'face-top':    "assets/projects/philoxenia/webp/philoxenia-grid.webp",
  'face-bottom': "assets/projects/financial planning hub/webp/financialhub-grid.webp"
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
  const hero = document.getElementById('hero');
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

const landingParams = new URLSearchParams(window.location.search);
const returnProject = landingParams.get('project');

function focusReturnedProject() {
  const targetId = returnProject || window.location.hash.replace('#', '');
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start' });
  });
}

window.addEventListener('load', focusReturnedProject, { once: true });

// ─── HERO LIQUID TEXT ─────────────────────────────
(function initLiquidText() {
  const heroH1 = document.getElementById('heroH1');
  if (!heroH1) return;

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
  const cta      = document.getElementById('cta');
  const homeLink = document.getElementById('siteHomeLink');
  const navEl    = document.getElementById('nav');
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  let activeStackPos = -1;

  function showPhrase(phraseIdx) {
    phrases.forEach((p, i) => p.classList.toggle('active', i === phraseIdx));
  }

  function swapPose(poseIdx) {
    poses.forEach((img, i) => img.classList.toggle('active', i === poseIdx));
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
      else if (i < pos - 1)  line.classList.add('stack-faded2');
    });
  }

  function activateFromTrigger(t) {
    const phraseIdx = parseInt(t.dataset.phrase, 10);
    const poseIdx   = parseInt(t.dataset.pose,   10);
    const side      = t.dataset.side;
    const stackPos  = t.dataset.stackPos !== undefined ? parseInt(t.dataset.stackPos, 10) : null;

    showPhrase(phraseIdx);
    swapPose(poseIdx);
    if (mascot) {
      mascot.classList.toggle('side-left',  side === 'left');
      mascot.classList.toggle('side-right', side === 'right');
    }
    if (stackPos !== null) setStackPos(stackPos);
  }

  // Recompute trigger positions live on every scroll (avoids stale cache from intro-lock)
  function update() {
    const scrollY  = window.scrollY;
    const vH       = window.innerHeight;
    const philRect = section.getBoundingClientRect();

    if (philRect.top >= vH || philRect.bottom <= 0) {
      if (mascot) mascot.classList.remove('visible');
      if (homeLink) homeLink.style.color = '';
      if (navEl) navEl.classList.remove('on-dark');
      return;
    }

    // Reading line at 50% of viewport
    const readingY = scrollY + vH * 0.5;
    let bestIdx = 0;
    for (let i = triggers.length - 1; i >= 0; i--) {
      const top = triggers[i].getBoundingClientRect().top + scrollY;
      if (readingY >= top) { bestIdx = i; break; }
    }
    activateFromTrigger(triggers[bestIdx]);

    // Mascot: show once scrolled at least 30% into section, hide near CTA
    if (mascot) {
      const ctaRect = cta ? cta.getBoundingClientRect() : null;
      const deepEnough   = philRect.top < vH * 0.3;
      const ctaFar       = !ctaRect || ctaRect.top > vH * 0.85;
      mascot.classList.toggle('visible', deepEnough && ctaFar);
    }

    // Nav is over philosophy section when the section's top has reached the top of the viewport
    // and its bottom hasn't scrolled past the top of the viewport.
    const isOverPhilosophy = (philRect.top <= 0 && philRect.bottom > 0);
    if (isOverPhilosophy) {
      if (navEl) navEl.classList.add('on-dark');
      if (homeLink) homeLink.style.color = '#FFFFFF';
    } else {
      if (navEl) navEl.classList.remove('on-dark');
      if (homeLink) homeLink.style.color = '';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update(); // Run on load to ensure correct nav theme

  // Activate as soon as the section enters the viewport (handles intro dismissal timing)
  new IntersectionObserver((entries) => {
    update();
  }, { threshold: 0 }).observe(section);

  // ── Cursor parallax (desktop only) ────────────────────────
  if (!mascot || isMobile) return;

  let tx = 0, ty = 0, px = 0, py = 0, rafId = null, sectionActive = false;

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

  new IntersectionObserver(([e]) => {
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
  }, { threshold: 0.01 }).observe(section);
})();

// ─── CTA REVEAL ───────────────────────────────
(function initCta() {
  const cta = document.getElementById('cta');
  if (!cta) return;

  const obs = new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) { cta.classList.add('cta-revealed'); obs.disconnect(); } },
    { threshold: 0.25 }
  );
  obs.observe(cta);
})();

// ─── WORK SECTION ─────────────────────────────
// Drag scroll for work section
(function() {
  const el = document.getElementById('workScroll');
  if (!el) return;
  let down = false, startX, left;
  el.addEventListener('mousedown', e => {
    down = true;
    el.classList.add('is-dragging');
    startX = e.pageX - el.offsetLeft;
    left = el.scrollLeft;
  });
  document.addEventListener('mouseup', () => {
    down = false;
    el.classList.remove('is-dragging');
  });
  el.addEventListener('mousemove', e => {
    if (!down) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = left - (x - startX) * 1.5;
  });
})();

// View toggle
(function() {
  const btn = document.getElementById('viewToggle');
  const scroll = document.getElementById('workScroll');
  if (!btn || !scroll) return;
  btn.addEventListener('click', () => {
    scroll.classList.toggle('grid-view');
    scroll.scrollLeft = 0;
    btn.textContent = scroll.classList.contains('grid-view')
      ? 'Scroll view' : 'Grid view';
  });
})();

// Filter
(function() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-card');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        card.classList.toggle('hidden',
          f !== 'all' && !tags.includes(f));
      });
    });
  });
})();

// ─── HERO DOODLE PARALLAX ─────────────────────
(function() {
  const hero = document.getElementById('hero');
  const doodles = document.querySelectorAll(
    '.hero-doodle[data-depth]'
  );
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (!hero || !doodles.length || reduceMotion) return;

  let ticking = false;
  let pointerX = 0;
  let pointerY = 0;

  function moveDoodles() {
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (pointerX - cx) / (rect.width / 2);
    const dy = (pointerY - cy) / (rect.height / 2);

    doodles.forEach(el => {
      const depth = parseFloat(el.dataset.depth) || 0.08;
      const mx = dx * depth * 140;
      const my = dy * depth * 110;
      el.style.transform =
        `translate3d(${mx}px, ${my}px, 0)`;
    });
    ticking = false;
  }

  hero.addEventListener('pointermove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(moveDoodles);
  });

  hero.addEventListener('pointerleave', () => {
    doodles.forEach(el => {
      el.style.transform = 'translate3d(0, 0, 0)';
    });
  });
})();

// ─── NAV BRAND VISIBILITY ─────────────────────
(function() {
  const brand = document.querySelector('.nav-brand');
  const hero = document.getElementById('hero');
  if (!brand || !hero) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      brand.classList.toggle(
        'nav-brand--hidden', entry.isIntersecting
      );
    },
    { threshold: 0.2 }
  );
  obs.observe(hero);
})();

// ─── ABOUT PROFILE PHOTO CYCLE ───────────────────
(function initPhotoCycle() {
  const container = document.getElementById('aboutPhotoContainer');
  if (!container) return;

  const images = [
    'assets/who/webp/nerea-about-main.webp',
    'assets/who/webp/0EE6CC74-15D5-4511-9AD6-750D167FF077.webp',
    'assets/who/webp/IMG_8007.webp',
    'assets/who/webp/IMG_8160.webp',
    'assets/who/webp/IMG_8586.webp'
  ];

  // Preload images
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  const imgElements = container.querySelectorAll('img');
  if (imgElements.length < 2) return;

  let currentIndex = 0;
  let intervalId = null;
  let activeImgIndex = 0; // Index of the active img element

  function showNextImage() {
    const nextIndex = (currentIndex + 1) % images.length;
    const nextSrc = images[nextIndex];

    const inactiveImgIndex = 1 - activeImgIndex;
    const activeImg = imgElements[activeImgIndex];
    const inactiveImg = imgElements[inactiveImgIndex];

    inactiveImg.src = nextSrc;
    inactiveImg.style.opacity = '1';
    activeImg.style.opacity = '0';

    currentIndex = nextIndex;
    activeImgIndex = inactiveImgIndex;
  }

  function startCycle() {
    if (intervalId) return;
    intervalId = setInterval(showNextImage, 4000);
  }

  function stopCycle() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  container.addEventListener('mouseenter', stopCycle);
  container.addEventListener('mouseleave', startCycle);

  startCycle();
})();
