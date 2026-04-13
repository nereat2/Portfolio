// ─── CURSOR ───────────────────────────────────────
const cur = document.getElementById('cur');
let mx = 0, my = 0, cx = 0, cy = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCur() {
  cx += (mx - cx) * .18;
  cy += (my - cy) * .18;
  cur.style.left = cx + 'px';
  cur.style.top  = cy + 'px';
  requestAnimationFrame(animCur);
})();
document.querySelectorAll('a, button, .prow, .nav-logo, .ftag').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});

// ─── NAV SCROLL BORDER ────────────────────────────
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

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
    cancelAnimationFrame(iRaf);
  }, 950);
}

if (!skipIntro) {
  setTimeout(showHello, 350);
  intro.addEventListener('click', endIntro);
}

function goHomeFromLogo(event) {
  event.preventDefault();
  const hero = document.getElementById('home');
  if (!hero) return;

  if (introActive) {
    endIntro();
    setTimeout(() => {
      history.replaceState(null, '', '#home');
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 980);
    return;
  }

  history.replaceState(null, '', '#home');
  hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.nav-logo-link[href="#home"]').forEach(link => {
  link.addEventListener('click', goHomeFromLogo);
});

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

// ─── INTRO CANVAS BACKGROUND ─────────────────────
const iCanvas = document.getElementById('introCanvas');
const ictx    = iCanvas.getContext('2d');
let IW, IH;

function resizeIC() {
  IW = iCanvas.width  = iCanvas.offsetWidth;
  IH = iCanvas.height = iCanvas.offsetHeight;
}
resizeIC();
window.addEventListener('resize', resizeIC, { passive: true });

const BLOB_PALETTE = [
  '#FF4500', // orange-red
  '#FF6B35', // vivid orange
  '#FF9A3C', // warm amber
  '#FFD166', // golden yellow
  '#FF3E8A', // hot pink
  '#FF6F91', // soft pink
  '#E8333C', // crimson red
  '#FFA500', // pure orange
  '#FF1493', // deep pink
  '#FFAE42', // yellow-orange
];

const iBlobs = Array.from({ length: 10 }, (_, i) => ({
  x:     (IW || window.innerWidth)  * (0.1 + Math.random() * 0.8),
  y:     (IH || window.innerHeight) * (0.1 + Math.random() * 0.8),
  vx:    (Math.random() - 0.5) * 0.5,
  vy:    (Math.random() - 0.5) * 0.5,
  baseR: 350 + Math.random() * 300,   // large enough to overlap, eliminating gaps
  col:   BLOB_PALETTE[i],
  phase: Math.random() * Math.PI * 2,
  speed: 0.4 + Math.random() * 0.55,
}));

let ipmx = window.innerWidth  / 2;
let ipmy = window.innerHeight / 2;
let it   = 0;
let iRaf = null;

function drawIntroBG() {
  it += 0.006;

  // Clear to transparent — CSS background (#0D0025) shows through gaps
  ictx.clearRect(0, 0, IW, IH);

  // Smooth cursor lag
  ipmx += (mx - ipmx) * 0.06;
  ipmy += (my - ipmy) * 0.06;

  iBlobs.forEach(b => {
    // Cursor repulsion — colour clouds push away from pointer
    const dx   = b.x - ipmx;
    const dy   = b.y - ipmy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pr   = b.baseR * 0.7 + 80;
    if (dist < pr && dist > 1) {
      const p = (pr - dist) / pr;
      const f = p * p * 12; // Increased force and squared for smoothness
      b.vx += (dx / dist) * f * 0.5;
      b.vy += (dy / dist) * f * 0.5;
    }

    // No idle drift — purely reactive.
    // High damping for a "heavy/liquid" feel that stops quickly.
    b.vx *= 0.88;
    b.vy *= 0.88;
    b.x  += b.vx;
    b.y  += b.vy;

    // Soft wrap — blobs re-enter from opposite side
    const pad = b.baseR;
    if (b.x < -pad)     b.x = IW + pad;
    if (b.x > IW + pad) b.x = -pad;
    if (b.y < -pad)     b.y = IH + pad;
    if (b.y > IH + pad) b.y = -pad;

    // 3. Rendering (Soft Radial Gradients)
    const gr = ictx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.baseR);
    gr.addColorStop(0,    b.col + 'D9'); // More opaque core for 70% coverage
    gr.addColorStop(0.5,  b.col + '59'); // Broad mid
    gr.addColorStop(1,    b.col + '00'); // Blurred edge
    ictx.fillStyle = gr;
    ictx.fillRect(0, 0, IW, IH);
  });

  iRaf = requestAnimationFrame(drawIntroBG);
}
drawIntroBG();

// ─── INTRO LOGO ───────────────────────────────────
const ilInitials = document.getElementById('il-initials');
const ilFullname  = document.getElementById('il-fullname');

// Show initials shortly after page load
setTimeout(() => { ilInitials.classList.add('visible'); }, 180);

// ─── NAV LOGO (same hover-expand as intro) ────────
const nlInitials = document.getElementById('nl-initials');
const nlFullname  = document.getElementById('nl-fullname');

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

document.querySelectorAll('.learn-more').forEach(link => {
  const labelText = link.childNodes[0]?.textContent?.trim() || 'LEARN MORE';
  link.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'learn-more-label';
  Array.from(labelText).forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'learn-char';
    span.style.setProperty('--i', i);
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    label.appendChild(span);
  });
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = '→';
  link.appendChild(label);
  link.appendChild(arrow);
});

// ─── TRIANGLE MESH BACKGROUND ────────────────────
(function initMesh() {
  const canvas = document.getElementById('fluidCanvas');
  const ctx    = canvas.getContext('2d');
  const glowCanvas = document.createElement('canvas');
  const glowCtx    = glowCanvas.getContext('2d');
  let W, H, blobs, t = 0;
  let mx = -9999, my = -9999;

  function hslToRgb(h, s, l) {
    const hue = ((h % 360) + 360) % 360;
    const sat = clamp(s, 0, 100) / 100;
    const lig = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * lig - 1)) * sat;
    const hp = hue / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r1 = 0, g1 = 0, b1 = 0;
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
      Math.round((b1 + m) * 255),
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

  // Random fresh palette on each reload: vivid, youthful, and clean.
  const HUE_PAIRS = [
    [318, 18],  // fuchsia + coral
    [284, 338], // violet + pink
    [194, 236], // aqua + electric blue
    [152, 194], // mint + cyan
    [226, 332], // cobalt + raspberry
    [42, 320],  // mango + magenta
    [170, 258], // turquoise + purple
  ];
  const pair = HUE_PAIRS[Math.floor(Math.random() * HUE_PAIRS.length)];
  const hA = pair[0] + (Math.random() - 0.5) * 12;
  const hB = pair[1] + (Math.random() - 0.5) * 12;
  const bgHue = ((hA + hB) / 2 + 360) % 360;
  const useLightBackground = Math.random() < 0.42;
  const bgRgb = useLightBackground
    ? hslToRgb(bgHue, 10 + Math.random() * 12, 92 + Math.random() * 5)
    : hslToRgb(bgHue, 48 + Math.random() * 10, 9 + Math.random() * 3);
  const PAL = {
    a: hslToRgb(hA, 78 + Math.random() * 10, 58 + Math.random() * 8),
    b: hslToRgb(hB, 76 + Math.random() * 12, 56 + Math.random() * 8),
    bg: rgb(bgRgb),
  };

  const bgIsLight = relativeLuminance(bgRgb) > 0.72;
  const textColor = bgIsLight ? '#18180F' : '#FFFFFF';
  const mutedColor = bgIsLight ? 'rgba(24,24,15,0.78)' : 'rgba(255,255,255,0.82)';
  const borderColor = bgIsLight ? 'rgba(24,24,15,0.12)' : 'rgba(255,164,120,0.14)';
  const lightPanel = bgIsLight ? '#F3EFE8' : '#221015';

  // Expose for other sections (philosophy background, etc.)
  window._FPALETTE  = { bgHue, hA, hB, bgRgb, useLightBackground };
  window._hslToRgb  = hslToRgb;

  // Shift the main canvas and page tokens to match the active background.
  document.body.style.background = PAL.bg;
  document.documentElement.style.setProperty('--cream',  PAL.bg);
  document.documentElement.style.setProperty('--ink',    textColor);
  document.documentElement.style.setProperty('--ink2',   mutedColor);
  document.documentElement.style.setProperty('--muted',  mutedColor);
  document.documentElement.style.setProperty('--border', borderColor);
  document.documentElement.style.setProperty('--light',  lightPanel);

  // Set hero and supporting small text to follow the active contrast mode.
  const heroEl = document.querySelector('.hero');
  if (heroEl) heroEl.style.color = textColor;
  document.querySelector('.hero-sub').style.color   = textColor;
  document.querySelector('.scroll-cue').style.color = textColor;
  document.querySelectorAll('.nav-links a').forEach(a => a.style.color = textColor);
  const nlInitialsEl = document.getElementById('nl-initials');
  if (nlInitialsEl) nlInitialsEl.style.color = textColor;

  // CTA section — adapt text to canvas background
  const ctaSection = document.getElementById('cta');
  if (ctaSection) {
    ctaSection.querySelectorAll('.cta-line1, .cta-line2').forEach(el => {
      el.style.color = textColor;
    });
    ctaSection.querySelectorAll('.cta-link').forEach(el => {
      el.style.color = textColor;
      el.style.borderBottomColor = textColor;
    });
  }

  function lerpColor(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t),
    ];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rgb(color, alpha = 1) {
    return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  }

  function tintColor(color, amount) {
    return [
      Math.round(color[0] + (255 - color[0]) * amount),
      Math.round(color[1] + (255 - color[1]) * amount),
      Math.round(color[2] + (255 - color[2]) * amount),
    ];
  }

  function shadeColor(color, amount) {
    return [
      Math.round(color[0] * (1 - amount)),
      Math.round(color[1] * (1 - amount)),
      Math.round(color[2] * (1 - amount)),
    ];
  }

  document.documentElement.style.setProperty(
    '--cream2',
    `rgb(${(bgIsLight ? shadeColor(bgRgb, 0.05) : shadeColor(bgRgb, 0.1)).join(',')})`
  );

  function setup() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    glowCanvas.width  = W;
    glowCanvas.height = H;
    const blobCount = 12;
    blobs = Array.from({ length: blobCount }, (_, i) => {
      const mix = i / Math.max(blobCount - 1, 1);
      const base = lerpColor(PAL.a, PAL.b, mix);
      const hueShifted = lerpColor(
        base,
        i % 2 === 0 ? tintColor(PAL.a, 0.16) : tintColor(PAL.b, 0.16),
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
        aSpeed: (Math.random() - 0.5) * 0.0022,
      };
    });
  }

  function draw() {
    t += 0.007;
    ctx.clearRect(0, 0, W, H);

    const sceneBg = ctx.createLinearGradient(0, 0, W, H);
    sceneBg.addColorStop(0, rgb(bgIsLight ? tintColor(PAL.a, 0.7) : shadeColor(PAL.a, 0.9)));
    sceneBg.addColorStop(0.5, rgb(bgIsLight ? tintColor(lerpColor(PAL.a, PAL.b, 0.45), 0.74) : shadeColor(lerpColor(PAL.a, PAL.b, 0.45), 0.88)));
    sceneBg.addColorStop(1, rgb(bgIsLight ? tintColor(PAL.b, 0.72) : shadeColor(PAL.b, 0.86)));
    ctx.fillStyle = sceneBg;
    ctx.fillRect(0, 0, W, H);

    blobs.forEach((b, i) => {
      b.x += Math.sin(t * b.speed + b.phase) * 0.55;
      b.y += Math.cos(t * b.speed * 0.82 + b.phase) * 0.55;

      const dx   = b.x - mx;
      const dy   = b.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const R    = b.baseR * 0.82;
      if (dist < R && dist > 1 && mx > -999) {
        const strength = (1 - dist / R) * (1 - dist / R) * 18;
        b.vx += (dx / dist) * strength;
        b.vy += (dy / dist) * strength;
      }
      b.vx *= 0.92;
      b.vy *= 0.92;
      b.x += b.vx;
      b.y += b.vy;

      const pad = b.baseR;
      if (b.x < -pad) b.x = W + pad;
      if (b.x > W + pad) b.x = -pad;
      if (b.y < -pad) b.y = H + pad;
      if (b.y > H + pad) b.y = -pad;

      const pulse = 0.94 + Math.sin(t * 1.7 + b.phase + i * 0.2) * 0.06;
      const radius = b.baseR * pulse;
      const core = tintColor(b.color, 0.16);
      const outer = shadeColor(b.color, 0.08);
      const shapeX = radius * (0.65 + b.sx * (0.9 + Math.sin(t * 0.9 + b.phase) * 0.12));
      const shapeY = radius * (0.65 + b.sy * (0.9 + Math.cos(t * 0.75 + b.phase) * 0.12));
      b.angle += b.aSpeed;

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, rgb(core, 0.48));
      grad.addColorStop(0.34, rgb(b.color, 0.34));
      grad.addColorStop(0.7, rgb(outer, 0.16));
      grad.addColorStop(1, rgb(outer, 0));

      ctx.globalCompositeOperation = 'screen';
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
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

  // Track cursor in page coordinates (mesh is fixed fullscreen)
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
  window.addEventListener('resize', setup, { passive: true });

  setup();
  draw();
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

function initWork() {
  const pList = document.getElementById('pList');
  const timeline = document.getElementById('workTimeline');
  const projects = document.querySelectorAll('.project-section');
  
  // Generate timeline lines
  projects.forEach((_, i) => {
    const line = document.createElement('div');
    line.className = 'timeline-line';
    timeline.appendChild(line);
  });

  const lines = document.querySelectorAll('.timeline-line');

  // Intersection Observer for scroll tracking (Viewport root)
  const observerOptions = {
    root: null, // Viewport
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.getAttribute('data-index')) - 1;
        
        // Show timeline only in work section
        timeline.style.opacity = '1';
        
        // Update timeline lines
        lines.forEach((l, i) => l.classList.toggle('active', i === idx));
        
        // Update background color based on project data-color
      }
    });
  }, observerOptions);

  projects.forEach(p => observer.observe(p));

  // Hide timeline when not in work section
  const workSection = document.getElementById('work');
  const workObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        timeline.style.opacity = '0';
      }
    });
  }, { threshold: 0.1 });
  workObserver.observe(workSection);


  // Image displacement (Reactive)
  document.querySelectorAll('.project-section').forEach(sec => {
    const container = sec.querySelector('.project-img-container');
    const inner = sec.querySelector('.project-inner');
    
    sec.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const dx = x * 0.05;
      const dy = y * 0.05;
      
      container.style.transform = `translate(${dx}px, ${dy}px) rotateX(${-dy * 0.1}deg) rotateY(${dx * 0.1}deg)`;
    });

    sec.addEventListener('mouseleave', () => {
      container.style.transform = `translate(0, 0) rotateX(0) rotateY(0)`;
    });
  });
}

initWork();

// ─── PHILOSOPHY ───────────────────────────────
(function initPhilosophy() {
  const section  = document.getElementById('philosophy');
  if (!section) return;

  const mascot   = section.querySelector('.phil-mascot');
  const poses    = Array.from(section.querySelectorAll('.phil-pose'));
  const phrases  = Array.from(section.querySelectorAll('.phil-phrase'));
  const triggers = Array.from(section.querySelectorAll('.phil-trigger'));
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  // ── Dark background from palette hue ──────────────────────
  const fp = window._FPALETTE;
  if (fp && window._hslToRgb) {
    const [r, g, b] = window._hslToRgb(fp.bgHue, 28, 13);
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
    if (!mascot || isMobile) return;
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
