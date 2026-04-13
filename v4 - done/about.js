// ─── CURSOR ───────────────────────────────────────
const cur = document.getElementById('cur');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
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

// ─── ADAPTIVE FLUID BACKGROUND ───────────────────
(function initAboutFluidBackground() {
  const canvas = document.getElementById('fluidCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const glowCanvas = document.createElement('canvas');
  const glowCtx = glowCanvas.getContext('2d');
  let W = 0;
  let H = 0;
  let blobs = [];
  let t = 0;
  let fx = -9999;
  let fy = -9999;

  function clampValue(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function hslToRgb(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = clampValue(s, 0, 100) / 100;
    const lig = clampValue(l, 0, 100) / 100;
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

  function relativeLuminance(color) {
    const toLinear = v => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const [r, g, b] = color.map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function lerpColor(c1, c2, mix) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * mix),
      Math.round(c1[1] + (c2[1] - c1[1]) * mix),
      Math.round(c1[2] + (c2[2] - c1[2]) * mix)
    ];
  }

  function rgb(color, alpha = 1) {
    return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  }

  function tintColor(color, amount) {
    return [
      Math.round(color[0] + (255 - color[0]) * amount),
      Math.round(color[1] + (255 - color[1]) * amount),
      Math.round(color[2] + (255 - color[2]) * amount)
    ];
  }

  function shadeColor(color, amount) {
    return [
      Math.round(color[0] * (1 - amount)),
      Math.round(color[1] * (1 - amount)),
      Math.round(color[2] * (1 - amount))
    ];
  }

  const HUE_PAIRS = [
    [318, 18],
    [284, 338],
    [194, 236],
    [152, 194],
    [226, 332],
    [42, 320],
    [170, 258]
  ];

  const pair = HUE_PAIRS[Math.floor(Math.random() * HUE_PAIRS.length)];
  const hA = pair[0] + (Math.random() - 0.5) * 12;
  const hB = pair[1] + (Math.random() - 0.5) * 12;
  const bgHue = ((hA + hB) / 2 + 360) % 360;
  const useLightBackground = Math.random() < 0.42;
  const bgRgb = useLightBackground
    ? hslToRgb(bgHue, 10 + Math.random() * 12, 92 + Math.random() * 5)
    : hslToRgb(bgHue, 48 + Math.random() * 10, 9 + Math.random() * 3);
  const palette = {
    a: hslToRgb(hA, 78 + Math.random() * 10, 58 + Math.random() * 8),
    b: hslToRgb(hB, 76 + Math.random() * 12, 56 + Math.random() * 8),
    bg: rgb(bgRgb)
  };

  const bgIsLight = relativeLuminance(bgRgb) > 0.72;
  const textColor = bgIsLight ? '#18180F' : '#FFFFFF';
  const mutedColor = bgIsLight ? 'rgba(24,24,15,0.78)' : 'rgba(255,255,255,0.82)';
  const borderColor = bgIsLight ? 'rgba(24,24,15,0.12)' : 'rgba(255,164,120,0.14)';
  const lightPanel = bgIsLight ? '#F3EFE8' : '#221015';

  document.body.style.background = palette.bg;
  document.documentElement.style.setProperty('--cream', palette.bg);
  document.documentElement.style.setProperty('--ink', textColor);
  document.documentElement.style.setProperty('--ink2', mutedColor);
  document.documentElement.style.setProperty('--muted', mutedColor);
  document.documentElement.style.setProperty('--border', borderColor);
  document.documentElement.style.setProperty('--light', lightPanel);
  document.documentElement.style.setProperty(
    '--cream2',
    `rgb(${(bgIsLight ? shadeColor(bgRgb, 0.05) : shadeColor(bgRgb, 0.1)).join(',')})`
  );

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.style.color = textColor;
  });
  const navInitials = document.getElementById('nl-initials');
  if (navInitials) navInitials.style.color = textColor;

  function setup() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    glowCanvas.width = W;
    glowCanvas.height = H;

    const blobCount = 12;
    blobs = Array.from({ length: blobCount }, (_, i) => {
      const mix = i / Math.max(blobCount - 1, 1);
      const base = lerpColor(palette.a, palette.b, mix);
      const hueShifted = lerpColor(
        base,
        i % 2 === 0 ? tintColor(palette.a, 0.16) : tintColor(palette.b, 0.16),
        0.24 + Math.random() * 0.16
      );
      const vivid = tintColor(hueShifted, 0.04 + Math.random() * 0.06);
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        baseR: Math.max(W, H) * (0.18 + Math.random() * 0.16),
        color: vivid,
        phase: Math.random() * Math.PI * 2,
        speed: 0.28 + Math.random() * 0.26,
        sx: 0.8 + Math.random() * 1.1,
        sy: 0.8 + Math.random() * 1.1,
        angle: Math.random() * Math.PI * 2,
        aSpeed: (Math.random() - 0.5) * 0.0022
      };
    });
  }

  function draw() {
    t += 0.007;
    ctx.clearRect(0, 0, W, H);

    const sceneBg = ctx.createLinearGradient(0, 0, W, H);
    sceneBg.addColorStop(0, rgb(bgIsLight ? tintColor(palette.a, 0.7) : shadeColor(palette.a, 0.9)));
    sceneBg.addColorStop(0.5, rgb(bgIsLight ? tintColor(lerpColor(palette.a, palette.b, 0.45), 0.74) : shadeColor(lerpColor(palette.a, palette.b, 0.45), 0.88)));
    sceneBg.addColorStop(1, rgb(bgIsLight ? tintColor(palette.b, 0.72) : shadeColor(palette.b, 0.86)));
    ctx.fillStyle = sceneBg;
    ctx.fillRect(0, 0, W, H);

    blobs.forEach((blob, i) => {
      blob.x += Math.sin(t * blob.speed + blob.phase) * 0.55;
      blob.y += Math.cos(t * blob.speed * 0.82 + blob.phase) * 0.55;

      const dx = blob.x - fx;
      const dy = blob.y - fy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radiusLimit = blob.baseR * 0.82;
      if (dist < radiusLimit && dist > 1 && fx > -999) {
        const strength = (1 - dist / radiusLimit) * (1 - dist / radiusLimit) * 18;
        blob.vx += (dx / dist) * strength;
        blob.vy += (dy / dist) * strength;
      }

      blob.vx *= 0.92;
      blob.vy *= 0.92;
      blob.x += blob.vx;
      blob.y += blob.vy;

      const pad = blob.baseR;
      if (blob.x < -pad) blob.x = W + pad;
      if (blob.x > W + pad) blob.x = -pad;
      if (blob.y < -pad) blob.y = H + pad;
      if (blob.y > H + pad) blob.y = -pad;

      const pulse = 0.94 + Math.sin(t * 1.7 + blob.phase + i * 0.2) * 0.06;
      const radius = blob.baseR * pulse;
      const core = tintColor(blob.color, 0.16);
      const outer = shadeColor(blob.color, 0.08);
      const shapeX = radius * (0.65 + blob.sx * (0.9 + Math.sin(t * 0.9 + blob.phase) * 0.12));
      const shapeY = radius * (0.65 + blob.sy * (0.9 + Math.cos(t * 0.75 + blob.phase) * 0.12));
      blob.angle += blob.aSpeed;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, rgb(core, 0.48));
      grad.addColorStop(0.34, rgb(blob.color, 0.34));
      grad.addColorStop(0.7, rgb(outer, 0.16));
      grad.addColorStop(1, rgb(outer, 0));

      ctx.globalCompositeOperation = 'screen';
      ctx.save();
      ctx.translate(blob.x, blob.y);
      ctx.rotate(blob.angle);
      ctx.scale(shapeX / radius, shapeY / radius);
      ctx.fillStyle = grad;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    });

    ctx.save();
    glowCtx.clearRect(0, 0, W, H);
    glowCtx.drawImage(canvas, 0, 0);
    ctx.filter = 'blur(40px) saturate(138%)';
    ctx.globalAlpha = 0.42;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(glowCanvas, -24, -24, W + 48, H + 48);
    ctx.restore();

    ctx.save();
    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.72);
    vignette.addColorStop(0, bgIsLight ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)');
    vignette.addColorStop(1, bgIsLight ? 'rgba(255,255,255,0.18)' : 'rgba(8,2,4,0.34)');
    ctx.globalCompositeOperation = bgIsLight ? 'screen' : 'multiply';
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', e => {
    fx = e.clientX;
    fy = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    fx = -9999;
    fy = -9999;
  });
  window.addEventListener('resize', setup, { passive: true });

  setup();
  draw();
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
