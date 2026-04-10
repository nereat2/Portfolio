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
    cancelAnimationFrame(iRaf);
  }, 950);
}

setTimeout(showHello, 350);
intro.addEventListener('click', endIntro);

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

// Build fullname char spans
'Nerea Asensio'.split('').forEach(ch => {
  const s = document.createElement('span');
  s.className   = 'il-char';
  s.textContent = ch === ' ' ? '\u00A0' : ch;
  ilFullname.appendChild(s);
});

// Show initials shortly after page load
setTimeout(() => { ilInitials.classList.add('visible'); }, 180);

// Hover: expand initials → full name / collapse on leave
const ilLogo = document.getElementById('intro-logo');
let ilExpanded = false;

ilLogo.addEventListener('mouseenter', () => {
  if (ilExpanded) return;
  ilExpanded = true;
  ilInitials.classList.remove('visible');
  ilInitials.classList.add('out');
  ilFullname.querySelectorAll('.il-char').forEach((c, i) => {
    setTimeout(() => c.classList.add('in'), i * 45);
  });
});

ilLogo.addEventListener('mouseleave', () => {
  if (!ilExpanded) return;
  ilExpanded = false;
  ilFullname.querySelectorAll('.il-char').forEach(c => c.classList.remove('in'));
  setTimeout(() => {
    ilInitials.classList.remove('out');
    ilInitials.classList.add('visible');
  }, 220);
});

// ─── NAV LOGO (same hover-expand as intro) ────────
const nlInitials = document.getElementById('nl-initials');
const nlFullname  = document.getElementById('nl-fullname');

'Nerea Asensio'.split('').forEach(ch => {
  const s = document.createElement('span');
  s.className   = 'nl-char';
  s.textContent = ch === ' ' ? '\u00A0' : ch;
  nlFullname.appendChild(s);
});

const navLogo = document.getElementById('nav-logo');
let nlExpanded = false;

navLogo.addEventListener('mouseenter', () => {
  if (nlExpanded) return;
  nlExpanded = true;
  nlInitials.classList.add('out');
  nlFullname.querySelectorAll('.nl-char').forEach((c, i) => {
    setTimeout(() => c.classList.add('in'), i * 40);
  });
});

navLogo.addEventListener('mouseleave', () => {
  if (!nlExpanded) return;
  nlExpanded = false;
  nlFullname.querySelectorAll('.nl-char').forEach(c => c.classList.remove('in'));
  setTimeout(() => { nlInitials.classList.remove('out'); }, 200);
});

// ─── FLUID CANVAS (HERO BACKGROUND) ──────────────
const fc   = document.getElementById('fluidCanvas');
const fctx = fc.getContext('2d');
let FW, FH;

function resizeFluid() {
  FW = fc.width  = fc.offsetWidth;
  FH = fc.height = fc.offsetHeight;
}
resizeFluid();
window.addEventListener('resize', resizeFluid, { passive: true });

// Two-colour palette — distinct but harmonious hue pair (40–70° apart), varied tones
// Two-colour palette — random on refresh, 2 main hues + shades
(function buildHeroPalette() {
  // Pick 2 harmonious hues — always light background (no dark/black)
  const LIGHT_PAIRS = [
    [30, 200],   // warm amber + cyan
    [280, 120],  // soft violet + lime-green
    [10, 50],    // coral + golden yellow
    [180, 320],  // teal + pink
    [60, 220],   // yellow-green + blue
    [340, 160],  // rose + mint
    [90, 260],   // green + purple
    [20, 190],   // orange + sky blue
  ];
  const pair = LIGHT_PAIRS[Math.floor(Math.random() * LIGHT_PAIRS.length)];
  const baseH   = pair[0] + (Math.random() - 0.5) * 15;
  const secondH = pair[1] + (Math.random() - 0.5) * 15;

  // Always light background
  document.body.style.background = '#F9F7F2';

  // Determine if blobs will be light or mid-tone to set text contrast
  // Blobs use l: 60–85, background is cream — text must be dark for contrast
  const textColor = '#18180F';
  const mutedColor = '#5A5A4E';

  // Hero section text
  const heroEl = document.querySelector('.hero');
  heroEl.style.color = textColor;

  // Hero sub-paragraph and scroll cue
  document.querySelector('.hero-sub').style.color = mutedColor;
  document.querySelector('.scroll-cue').style.color = mutedColor;

  // Nav links and logo
  document.querySelectorAll('.nav-links a').forEach(a => a.style.color = mutedColor);
  const nlInitialsEl = document.getElementById('nl-initials');
  if (nlInitialsEl) nlInitialsEl.style.color = mutedColor;

  // Generate palette: always light, high saturation, 2 distinct hues
  window._FPALETTE = Array.from({ length: 40 }, (_, i) => ({
    h: (i < 20 ? baseH : secondH).toFixed(0),
    s: (55 + Math.random() * 35).toFixed(0),
    l: (62 + Math.random() * 23).toFixed(0),   // 62–85: always pastel/light, never dark
  }));
})();

let fmx = window.innerWidth / 2, fmy = window.innerHeight / 2;
let fpmx = fmx, fpmy = fmy;

let fCursorActive = false, fIdleTimer = null;
let fvx = 0, fvy = 0, fsvx = 0, fsvy = 0; // raw + smoothed cursor velocity
document.addEventListener('mousemove', e => {
  const nx = e.clientX, ny = e.clientY + window.scrollY;
  fvx = nx - fmx; fvy = ny - fmy;
  // Smooth velocity so quick twitches don't spike
  fsvx += (fvx - fsvx) * 0.35;
  fsvy += (fvy - fsvy) * 0.35;
  fmx = nx; fmy = ny;
  fCursorActive = true;
  clearTimeout(fIdleTimer);
  fIdleTimer = setTimeout(() => { fCursorActive = false; fsvx = 0; fsvy = 0; }, 100);
});

let FBLOBS = Array.from({ length: 18 }, (_, i) => ({
  x:      Math.random() * (FW || window.innerWidth),
  y:      Math.random() * (FH || window.innerHeight),
  vx:     0,
  vy:     0,
  baseR:  420 + Math.random() * 300,
  col:    { ...window._FPALETTE[i % window._FPALETTE.length] },
  phase:  Math.random() * Math.PI * 2,
  speed:  0.3 + Math.random() * 0.4,
  angle:  Math.random() * Math.PI * 2,
  aSpeed: (Math.random() - 0.5) * 0.0004,
  sx:     1.8 + Math.random() * 1.4,
  sy:     0.5 + Math.random() * 0.5,
  sPhase: Math.random() * Math.PI * 2,
}));

let ft = 0;
function drawFluid() {
  ft += 0.006;

  // Smooth colour transitions (from section observer targets)
  FBLOBS.forEach(b => {
    if (b.targetH === undefined) return;
    let dh = b.targetH - +b.col.h;
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    b.col.h = +b.col.h + dh * 0.02;
    b.col.s = +b.col.s + (b.targetS - +b.col.s) * 0.02;
    b.col.l = +b.col.l + (b.targetL - +b.col.l) * 0.02;
  });

  fctx.clearRect(0, 0, FW, FH);

  FBLOBS.forEach(b => {
    // Idle organic drift (same as intro)
    b.x += Math.sin(ft * b.speed + b.phase) * 0.5;
    b.y += Math.cos(ft * b.speed * 0.7 + b.phase) * 0.5;

    // Cursor repulsion (same mechanic as intro blobs)
    const dx   = b.x - fmx;
    const dy   = b.y - fmy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pr   = b.baseR * 0.8 + 100;
    if (dist < pr && dist > 1) {
      const p = (pr - dist) / pr;
      const f = p * p * 10;
      b.vx += (dx / dist) * f * 0.4;
      b.vy += (dy / dist) * f * 0.4;
    }

    b.vx *= 0.90;
    b.vy *= 0.90;
    b.x  += b.vx;
    b.y  += b.vy;

    // Soft wrap
    const pad = b.baseR;
    if (b.x < -pad)     b.x = FW + pad;
    if (b.x > FW + pad) b.x = -pad;
    if (b.y < -pad)     b.y = FH + pad;
    if (b.y > FH + pad) b.y = -pad;

    // Render: simple radial gradient (no scale/rotate — mirrors intro canvas)
    const { h, s, l } = b.col;
    const R = b.baseR;
    const gr = fctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R);
    gr.addColorStop(0,   `hsla(${h},${s}%,${l}%,0.95)`);
    gr.addColorStop(0.4, `hsla(${h},${s}%,${l}%,0.75)`);
    gr.addColorStop(0.7, `hsla(${h},${s}%,${l}%,0.35)`);
    gr.addColorStop(1,   `hsla(${h},${s}%,${l}%,0)`);
    fctx.fillStyle = gr;
    fctx.fillRect(0, 0, FW, FH);
  });

  requestAnimationFrame(drawFluid);
}
drawFluid();

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

// ─── SKILL BUBBLES ────────────────────────────────
const bc   = document.getElementById('bubblesCanvas');
const bctx = bc.getContext('2d');
let BW, BH;

function resizeBubbles() {
  BW = bc.width  = bc.offsetWidth;
  BH = bc.height = bc.offsetHeight;
}
resizeBubbles();
window.addEventListener('resize', resizeBubbles, { passive: true });

const SKILLS = [
  'Interaction design', 'Tangible interfaces', 'Prototyping',
  'Physical computing', 'Figma', 'HTML · CSS · JS',
  'Arduino', 'UX research', 'Spatial thinking',
  'Speculative design', 'Italian 🤌', 'Spanish',
  'English', 'Catalan',
];

// measure text widths before layout
bctx.font = '400 12px "DM Sans", sans-serif';
const bubbles = SKILLS.map(text => {
  const tw = bctx.measureText(text).width;
  const pad = 16;
  const r   = tw / 2 + pad;
  const angle = Math.random() * Math.PI * 2;
  return {
    x:   r + Math.random() * Math.max(BW - r * 2, 10),
    y:   r + Math.random() * Math.max(BH - r * 2, 10),
    vx:  Math.cos(angle) * (.15 + Math.random() * .2),
    vy:  Math.sin(angle) * (.15 + Math.random() * .2),
    r, text,
  };
});

let bmx = -9999, bmy = -9999;
bc.addEventListener('mousemove', e => {
  const rect = bc.getBoundingClientRect();
  bmx = e.clientX - rect.left;
  bmy = e.clientY - rect.top;
});
bc.addEventListener('mouseleave', () => { bmx = -9999; bmy = -9999; });

function drawBubbles() {
  bctx.clearRect(0, 0, BW, BH);
  bctx.font = '400 12px "DM Sans", sans-serif';

  bubbles.forEach(b => {
    // cursor repulsion
    const dx   = bmx - b.x;
    const dy   = bmy - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < b.r + 60 && dist > 0) {
      const f = ((b.r + 60 - dist) / (b.r + 60)) * .55;
      b.vx -= (dx / dist) * f;
      b.vy -= (dy / dist) * f;
    }

    b.vx *= .975;
    b.vy *= .975;
    b.x  += b.vx;
    b.y  += b.vy;

    // bounce off walls
    if (b.x - b.r < 0)  { b.x = b.r;      b.vx =  Math.abs(b.vx); }
    if (b.x + b.r > BW) { b.x = BW - b.r; b.vx = -Math.abs(b.vx); }
    if (b.y - b.r < 0)  { b.y = b.r;      b.vy =  Math.abs(b.vy); }
    if (b.y + b.r > BH) { b.y = BH - b.r; b.vy = -Math.abs(b.vy); }

    // draw pill
    const h = 28;
    bctx.beginPath();
    bctx.roundRect(b.x - b.r, b.y - h / 2, b.r * 2, h, h / 2);
    bctx.fillStyle   = 'rgba(24,24,15,0.06)';
    bctx.fill();
    bctx.strokeStyle = 'rgba(24,24,15,0.18)';
    bctx.lineWidth   = .5;
    bctx.stroke();

    // label
    bctx.fillStyle    = 'rgba(24,24,15,0.72)';
    bctx.textAlign    = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText(b.text, b.x, b.y);
  });

  requestAnimationFrame(drawBubbles);
}
drawBubbles();
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
        const hex = entry.target.getAttribute('data-color');
        let [h, s, l] = hexToHsl(hex);
        const secondH = (h + 60) % 360; 
        
        // Mutate fluid blobs hues smoothly (Maintain 2-hue distribution: 24 blobs hue A, 16 blobs hue B)
        FBLOBS.forEach((blob, i) => {
          blob.targetH = (i < 24 ? h : secondH);
          blob.targetS = s * 0.98; 
          blob.targetL = Math.max(l, 62);
        });
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

  // Global Section Color Shifter
  const globalSections = document.querySelectorAll('.hero, #who, #note');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const baseH = Math.random() * 360;
        const secondH = (baseH + 50) % 360;
        FBLOBS.forEach((blob, i) => {
          blob.targetH = (i < 12 ? baseH : secondH);
          blob.targetS = 35 + Math.random() * 25;
          blob.targetL = 65 + Math.random() * 20;
        });
      }
    });
  }, { threshold: 0.3 });
  globalSections.forEach(s => sectionObserver.observe(s));

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
