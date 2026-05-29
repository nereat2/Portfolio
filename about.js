// ─── CURSOR ───────────────────────────────────────
const cur = document.getElementById('cur');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

document.addEventListener('pointermove', e => {
  mx = e.clientX;
  my = e.clientY;
});

document.addEventListener('pointerdown', e => {
  mx = e.clientX;
  my = e.clientY;
});

(function animCur() {
  cx += (mx - cx) * 0.18;
  cy += (my - cy) * 0.18;
  if (cur) {
    cur.style.left = `${cx}px`;
    cur.style.top = `${cy}px`;
  }
  requestAnimationFrame(animCur);
})();

document.querySelectorAll('a, button, .nav-logo, .tag-bubble').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  const label = link.textContent;
  link.textContent = '';
  const word = document.createElement('span');
  word.className = 'nav-label';
  Array.from(label).forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'nav-char';
    span.style.setProperty('--i', i);
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    word.appendChild(span);
  });
  link.appendChild(word);
});

// ─── PAGE SURFACE ────────────────────────────────
(function initAboutPageSurface() {
  const OFF_WHITE = '#F5F5F0';
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

  document.querySelectorAll('.nav-links a, .about-q, .about-body, .pit-tab, .cta-line1, .cta-line2, .cta-link, #back-top').forEach(el => {
    if (el) el.style.color = BLACK;
  });
  document.querySelectorAll('.cta-link').forEach(el => {
    el.style.borderBottomColor = BLACK;
  });
  const navInitials = document.getElementById('nl-initials');
  if (navInitials) navInitials.style.color = BLACK;
})();

// ─── NAV SCROLL BORDER ────────────────────────────
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── BALL PITS ────────────────────────────────────
const pits = new Map();
let pitsRafId = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function capVelocity(vx, vy, maxSpeed) {
  const speed = Math.hypot(vx, vy);
  if (!speed || speed <= maxSpeed) return { vx, vy };
  const scale = maxSpeed / speed;
  return { vx: vx * scale, vy: vy * scale };
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function applyBubblePosition(bubble) {
  bubble.el.style.transform = `translate(${bubble.x}px,${bubble.y}px)`;
}

function clampBubbleToArena(bubble, pit) {
  bubble.x = clamp(bubble.x, 0, Math.max(0, pit.arenaW - bubble.w));
  bubble.y = clamp(bubble.y, 0, Math.max(0, pit.arenaH - bubble.h));
}

function updatePitBounds(pit) {
  pit.arenaW = pit.inner.offsetWidth;
  pit.arenaH = pit.inner.offsetHeight;
}

function resolvePitCollisions(pit) {
  const activeBubbles = pit.bubbles.filter(bubble => !bubble.dragging);

  for (let iter = 0; iter < 3; iter++) {
    let changed = false;

    for (let i = 0; i < activeBubbles.length; i++) {
      for (let j = i + 1; j < activeBubbles.length; j++) {
        const bi = activeBubbles[i];
        const bj = activeBubbles[j];

        const overlapX = (bi.x + bi.w / 2) - (bj.x + bj.w / 2);
        const overlapY = (bi.y + bi.h / 2) - (bj.y + bj.h / 2);
        const combinedW = (bi.w + bj.w) / 2;
        const combinedH = (bi.h + bj.h) / 2;

        if (Math.abs(overlapX) >= combinedW || Math.abs(overlapY) >= combinedH) continue;

        const penX = combinedW - Math.abs(overlapX);
        const penY = combinedH - Math.abs(overlapY);

        if (penY <= penX) {
          const dirY = overlapY === 0 ? (i < j ? -1 : 1) : Math.sign(overlapY);
          const pushY = (penY / 2) * dirY;
          bi.y += pushY;
          bj.y -= pushY;

          const nextVyI = bj.vy * 0.4;
          const nextVyJ = bi.vy * 0.4;
          bi.vy = nextVyI;
          bj.vy = nextVyJ;
        } else {
          const dirX = overlapX === 0 ? (i < j ? -1 : 1) : Math.sign(overlapX);
          const pushX = (penX / 2) * dirX;
          bi.x += pushX;
          bj.x -= pushX;

          const nextVxI = bj.vx * 0.4;
          const nextVxJ = bi.vx * 0.4;
          bi.vx = nextVxI;
          bj.vx = nextVxJ;
        }

        clampBubbleToArena(bi, pit);
        clampBubbleToArena(bj, pit);
        changed = true;
      }
    }

    if (!changed) break;
  }
}

function ensurePitLoop() {
  if (pitsRafId) return;

  function tick() {
    pits.forEach(pit => {
      pit.bubbles.forEach(bubble => {
        if (bubble.dragging) return;

        bubble.vy = Math.min(bubble.vy + 0.52, 24);
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;

        if (bubble.x < 0) {
          bubble.x = 0;
          bubble.vx = Math.abs(bubble.vx) * 0.72;
        }
        if (bubble.x + bubble.w > pit.arenaW) {
          bubble.x = pit.arenaW - bubble.w;
          bubble.vx = -Math.abs(bubble.vx) * 0.72;
        }
        if (bubble.y + bubble.h >= pit.arenaH) {
          bubble.y = pit.arenaH - bubble.h;
          bubble.vy *= -0.38;
        }
        if (bubble.y + bubble.h >= pit.arenaH - 1) {
          bubble.vx *= 0.95;
        }
        clampBubbleToArena(bubble, pit);
      });

      resolvePitCollisions(pit);

      pit.bubbles.forEach(bubble => {
        clampBubbleToArena(bubble, pit);
        applyBubblePosition(bubble);
      });
    });

    pitsRafId = requestAnimationFrame(tick);
  }

  pitsRafId = requestAnimationFrame(tick);
}

function initPit(panelEl) {
  if (!panelEl || panelEl.dataset.initialized === 'true') return;

  const pitInner = panelEl.querySelector('.pit-inner');
  if (!pitInner) return;

  if (pitInner.dataset.emojiDuped !== 'true') {
    const emojiBubbles = Array.from(pitInner.querySelectorAll('.tag-bubble--emoji'));
    const textBubbles = Array.from(pitInner.querySelectorAll('.tag-bubble:not(.tag-bubble--emoji)'));

    shuffle(emojiBubbles).forEach((emojiEl, idx) => {
      if (idx % 2 === 0) emojiEl.remove();
    });

    shuffle(textBubbles).slice(0, Math.max(2, Math.floor(textBubbles.length * 0.22))).forEach(textEl => {
      const extraCopies = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < extraCopies; i++) {
        pitInner.appendChild(textEl.cloneNode(true));
      }
    });

    pitInner.dataset.emojiDuped = 'true';
  }

  const pit = {
    panel: panelEl,
    inner: pitInner,
    arenaW: pitInner.offsetWidth,
    arenaH: pitInner.offsetHeight,
    bubbles: []
  };

  pitInner.querySelectorAll('.tag-bubble').forEach(el => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = Math.random() * Math.max(0, pit.arenaW - w);
    const y = -(h + Math.random() * Math.min(pit.arenaH * 0.18, 140));

    const bubble = {
      el,
      pit,
      x,
      y,
      vx: (Math.random() - 0.5) * 5,
      vy: 0,
      w,
      h,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      pointerHistory: []
    };

    applyBubblePosition(bubble);

    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));

    el.addEventListener('pointerdown', e => {
      const pitRect = pitInner.getBoundingClientRect();
      bubble.dragging = true;
      bubble.offsetX = e.clientX - bubble.x - pitRect.left;
      bubble.offsetY = e.clientY - bubble.y - pitRect.top;
      bubble.vx = 0;
      bubble.vy = 0;
      bubble.pointerHistory = [
        { x: e.clientX, y: e.clientY, time: performance.now() }
      ];
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = '10';
    });

    el.addEventListener('pointermove', e => {
      if (!bubble.dragging) return;
      const pitRect = pitInner.getBoundingClientRect();
      const rawX = e.clientX - pitRect.left - bubble.offsetX;
      const rawY = e.clientY - pitRect.top - bubble.offsetY;
      bubble.x = clamp(rawX, 0, Math.max(0, pit.arenaW - bubble.w));
      bubble.y = clamp(rawY, 0, Math.max(0, pit.arenaH - bubble.h));
      bubble.pointerHistory.push({ x: e.clientX, y: e.clientY, time: performance.now() });
      if (bubble.pointerHistory.length > 2) bubble.pointerHistory.shift();
      applyBubblePosition(bubble);
    });

    const releaseBubble = () => {
      if (!bubble.dragging) return;
      bubble.dragging = false;
      clampBubbleToArena(bubble, pit);

      const [prev, last] = bubble.pointerHistory;
      if (prev && last) {
        const timeDelta = Math.max(last.time - prev.time, 1);
        const throwVelocity = capVelocity(
          ((last.x - prev.x) / timeDelta) * 26,
          ((last.y - prev.y) / timeDelta) * 26,
          28
        );
        bubble.vx = throwVelocity.vx;
        bubble.vy = throwVelocity.vy;
      }

      el.style.zIndex = '';
      bubble.pointerHistory = [];
    };

    el.addEventListener('pointerup', releaseBubble);
    el.addEventListener('pointercancel', releaseBubble);

    pit.bubbles.push(bubble);
  });

  pits.set(panelEl.id, pit);
  panelEl.dataset.initialized = 'true';
  ensurePitLoop();
}

function activatePitTab(tab) {
  const targetId = tab.dataset.target;
  const targetPanel = document.getElementById(targetId);
  if (!targetPanel) return;

  document.querySelectorAll('.pit-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.pit-panel').forEach(panel => panel.classList.remove('active'));

  tab.classList.add('active');
  targetPanel.classList.add('active');

  if (targetPanel.dataset.initialized !== 'true') {
    initPit(targetPanel);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href="index.html#work"]').forEach(link => {
    link.addEventListener('click', () => {
      sessionStorage.setItem('skipIntroOnce', '1');
    });
  });

  document.querySelectorAll('.pit-tab').forEach(tab => {
    tab.addEventListener('click', () => activatePitTab(tab));
  });

  initPit(document.getElementById('pit-skills'));
  document.querySelectorAll('.tag-bubble').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });
});

// ─── CTA REVEAL ───────────────────────────────
(function initCta() {
  const cta = document.getElementById('cta');
  if (!cta) return;

  cta.querySelectorAll('.cta-link').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });

  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        cta.classList.add('cta-revealed');
        obs.disconnect();
      }
    },
    { threshold: 0.25 }
  );
  obs.observe(cta);
})();

// ─── BACK TO TOP ──────────────────────────────
(function initBackTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  const toggle = () => {
    const nearBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 300;
    btn.classList.toggle('visible', nearBottom);
  };

  toggle();
  window.addEventListener('scroll', toggle, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btn.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  btn.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
})();

window.addEventListener('resize', () => {
  pits.forEach(pit => {
    updatePitBounds(pit);
    pit.bubbles.forEach(bubble => {
      clampBubbleToArena(bubble, pit);
      applyBubblePosition(bubble);
    });
  });
}, { passive: true });
