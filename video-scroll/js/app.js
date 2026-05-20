/* ============================================================
   ZigoDev — Scroll Experience · js/app.js
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

// ── CONFIG ──────────────────────────────────────────────────
// Dark overlay (0–1 scroll progress)
const OVERLAY_ENTER = 0.47;

// Marquee range
const MARQUEE_ENTER = 0.22;
const MARQUEE_LEAVE = 0.79;

// ── DOM REFS ────────────────────────────────────────────────
const loader      = document.getElementById('loader');
const loaderBar   = document.getElementById('loader-bar');
const loaderPct   = document.getElementById('loader-percent');
const videoEl     = document.getElementById('bg-video');
const videoWrap   = document.getElementById('video-wrap');
const scrollCont  = document.getElementById('scroll-container');
const heroSection = document.getElementById('hero-section');
const darkOverlay = document.getElementById('dark-overlay');
const marqueeWrap = document.getElementById('marquee');
const marqueeText = marqueeWrap.querySelector('.marquee-text');

// ── LOADER ───────────────────────────────────────────────────
function runLoader() {
  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 18 + 8;
    if (pct >= 100) { pct = 100; clearInterval(tick); setTimeout(onReady, 120); }
    loaderBar.style.width = pct + '%';
    loaderPct.textContent = Math.floor(pct) + '%';
  }, 60);
}

function onReady() {
  loader.classList.add('hidden');
  videoEl.pause();
  videoEl.currentTime = 0;
  initLenis();
  initHeroTransition();
  initVideoScroll();
  initSectionAnimations();
  initDarkOverlay();
  initMarquee();
  initCounters();
  positionSections();
}

// ── LENIS ───────────────────────────────────────────────────
let lenisInstance = null;

function initLenis() {
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenisInstance.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Portfolio nav link → scroll to portfolio section enter point
  document.querySelector('.nav-portfolio')?.addEventListener('click', (e) => {
    e.preventDefault();
    const sc = document.getElementById('scroll-container');
    const target = sc.offsetTop + sc.offsetHeight * 0.64;
    lenisInstance.scrollTo(target, { duration: 1.8 });
  });
}

// ── POSITION SECTIONS ────────────────────────────────────────
function positionSections() {
  const totalH = scrollCont.getBoundingClientRect().height;
  document.querySelectorAll('.scroll-section').forEach((sec) => {
    const enter = parseFloat(sec.dataset.enter) / 100;
    const leave = parseFloat(sec.dataset.leave) / 100;
    const mid   = (enter + leave) / 2;
    sec.style.top       = (mid * totalH) + 'px';
    sec.style.transform = 'translateY(-50%)';
  });
}

// ── HERO TRANSITION ──────────────────────────────────────────
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      heroSection.style.opacity       = Math.max(0, 1 - p * 18);
      heroSection.style.pointerEvents = p > 0.05 ? 'none' : 'auto';
      // Video fades in as hero fades out
      videoWrap.style.opacity = Math.min(1, Math.max(0, (p - 0.02) / 0.08));
    },
  });
}

// ── VIDEO SCRUBBING ──────────────────────────────────────────
function initVideoScroll() {
  function setupScrub() {
    const dur = videoEl.duration;
    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        // Map scroll 0 → OVERLAY_ENTER to full video duration
        videoEl.currentTime = Math.min(self.progress / OVERLAY_ENTER, 1) * dur;
      },
    });
  }

  if (!isNaN(videoEl.duration) && videoEl.readyState >= 1) {
    setupScrub();
  } else {
    videoEl.addEventListener('loadedmetadata', setupScrub, { once: true });
  }
}

// ── SECTION ANIMATIONS ───────────────────────────────────────
function initSectionAnimations() {
  document.querySelectorAll('.scroll-section').forEach((sec) => {
    const type     = sec.dataset.animation;
    const persist  = sec.dataset.persist === 'true';
    const enterPct = parseFloat(sec.dataset.enter) / 100;
    const leavePct = parseFloat(sec.dataset.leave) / 100;

    const children = Array.from(sec.querySelectorAll(
      '.section-label, .section-heading, .section-body, .cta-button, .stat, .section-image'
    ));

    const tl = gsap.timeline({ paused: true });
    switch (type) {
      case 'slide-left':
        tl.from(children, { x: -80, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' }); break;
      case 'slide-right':
        tl.from(children, { x: 80, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' }); break;
      case 'scale-up':
        tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' }); break;
      case 'rotate-in':
        tl.from(children, { y: 40, rotation: 3, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }); break;
      case 'stagger-up':
        tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }); break;
      case 'clip-reveal':
        tl.from(children, { clipPath: 'inset(100% 0 0 0)', opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' }); break;
      default:
        tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
    }

    const FADE = 0.04;
    let played = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        let opacity = 0;
        if      (p >= enterPct - FADE && p <= enterPct)              opacity = (p - (enterPct - FADE)) / FADE;
        else if (p > enterPct && p < leavePct)                        opacity = 1;
        else if (!persist && p >= leavePct && p <= leavePct + FADE)  opacity = 1 - (p - leavePct) / FADE;
        else if (persist  && p >= leavePct)                           opacity = 1;

        sec.style.opacity = opacity;
        sec.classList.toggle('visible', opacity > 0);

        if (p >= enterPct && !played) { played = true; tl.play(0); }
        if (p < enterPct - FADE)      { played = false; tl.pause(0, true); }
      },
    });
  });
}

// ── DARK OVERLAY ─────────────────────────────────────────────
function initDarkOverlay() {
  const FADE = 0.03;
  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let o = 0;
      if (p >= OVERLAY_ENTER - FADE && p < OVERLAY_ENTER) o = (p - (OVERLAY_ENTER - FADE)) / FADE;
      else if (p >= OVERLAY_ENTER)                         o = 1;
      darkOverlay.style.opacity = o;
    },
  });
}

// ── MARQUEE ──────────────────────────────────────────────────
function initMarquee() {
  const speed = parseFloat(marqueeWrap.dataset.scrollSpeed) || -22;
  const FADE  = 0.05;

  gsap.to(marqueeText, {
    xPercent: speed,
    ease: 'none',
    scrollTrigger: { trigger: scrollCont, start: 'top top', end: 'bottom bottom', scrub: true },
  });

  ScrollTrigger.create({
    trigger: scrollCont,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let o = 0;
      if      (p >= MARQUEE_ENTER && p <= MARQUEE_ENTER + FADE)          o = (p - MARQUEE_ENTER) / FADE;
      else if (p > MARQUEE_ENTER + FADE && p < MARQUEE_LEAVE - FADE)     o = 1;
      else if (p >= MARQUEE_LEAVE - FADE && p <= MARQUEE_LEAVE)          o = 1 - (p - (MARQUEE_LEAVE - FADE)) / FADE;
      marqueeWrap.style.opacity = o;
    },
  });
}

// ── COUNTERS ─────────────────────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    let fired = false;

    ScrollTrigger.create({
      trigger: scrollCont,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (self.progress >= OVERLAY_ENTER && !fired) {
          fired = true;
          gsap.to(el, {
            textContent: target,
            duration: 2,
            ease: 'power1.out',
            snap: { textContent: decimals === 0 ? 1 : 0.01 },
            onUpdate() { el.textContent = parseFloat(el.textContent).toFixed(decimals); },
          });
        }
        if (self.progress < OVERLAY_ENTER - 0.05) {
          fired = false;
          el.textContent = '0';
        }
      },
    });
  });
}

// ── BOOT ─────────────────────────────────────────────────────
runLoader();
