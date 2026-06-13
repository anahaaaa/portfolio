
/* ─── Cursor ─────────────────────────────────────────────── */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
const RING_LAG = 0.12; // lower = more lag / trail feel

// Trail dots pool
const TRAIL_COUNT = 6;
const trail = [];
const trailPositions = [];

for (let i = 0; i < TRAIL_COUNT; i++) {
  const el = document.createElement('div');
  el.className = 'cursor-trail';
  const scale = 1 - i * 0.14;
  const alpha = 0.35 - i * 0.05;
  el.style.cssText = `width:${6*scale}px;height:${6*scale}px;opacity:${alpha};`;
  document.body.appendChild(el);
  trail.push(el);
  trailPositions.push({ x: 0, y: 0 });
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

document.addEventListener('mousedown', () => dot.classList.add('clicking'));
document.addEventListener('mouseup',   () => dot.classList.remove('clicking'));

// Smooth ring + trail via RAF
function animateCursor() {
  // Ring easing
  ringX += (mouseX - ringX) * RING_LAG;
  ringY += (mouseY - ringY) * RING_LAG;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';

  // Trail: each dot chases the previous one
  trailPositions[0].x += (mouseX - trailPositions[0].x) * 0.22;
  trailPositions[0].y += (mouseY - trailPositions[0].y) * 0.22;

  for (let i = 1; i < TRAIL_COUNT; i++) {
    const lag = 0.18 - i * 0.015;
    trailPositions[i].x += (trailPositions[i-1].x - trailPositions[i].x) * lag;
    trailPositions[i].y += (trailPositions[i-1].y - trailPositions[i].y) * lag;
  }

  trail.forEach((el, i) => {
    el.style.left = trailPositions[i].x + 'px';
    el.style.top  = trailPositions[i].y + 'px';
  });

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover enlarge ring
const hoverTargets = document.querySelectorAll(
  'a, button, .project-card, .cert-item, .blog-card, .contact-item, .skill-pills span'
);
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

/* ─── Navbar scroll state + light-section detection ─────── */
const navbar = document.getElementById('navbar');

const lightSections = document.querySelectorAll('.light-section');

const navThemeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navbar.classList.add('on-light');
    } else {
      const anyLight = [...lightSections].some(sec => {
        const r = sec.getBoundingClientRect();
        return r.top < 80 && r.bottom > 0;
      });
      if (!anyLight) navbar.classList.remove('on-light');
    }
  });
}, { threshold: 0, rootMargin: '-1px 0px -95% 0px' });

lightSections.forEach(sec => navThemeObserver.observe(sec));

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ─── Hamburger / Mobile Menu ────────────────────────────── */
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileLinks  = document.querySelectorAll('.mob-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Scroll Reveal ──────────────────────────────────────── */
const revealEls = document.querySelectorAll('[data-reveal], .timeline-item, .cert-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

/* ─── Active nav link on scroll ─────────────────────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.removeAttribute('style'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) {
        const isLight = navbar.classList.contains('on-light');
        active.style.color = isLight ? '#111' : '#fff';
        active.style.fontWeight = '600';
      }
    }
  });
}, { threshold: 0.4 });

/* ─── Skill bar fill animation ───────────────────────────── */
const skillFills = document.querySelectorAll('.skill-fill');

skillFills.forEach(bar => {
  bar.style.setProperty('--target-width', bar.dataset.width + '%');
});

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillFills.forEach(bar => barObserver.observe(bar));


/* ─── Skills tab filter ───────────────────────────────────── */
const tabs = document.querySelectorAll('.skills-tab');
const chips = document.querySelectorAll('.skill-chip');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const cat = tab.dataset.cat;
    chips.forEach(chip => {
      if (cat === 'all' || chip.dataset.cat === cat) {
        chip.classList.remove('hidden');
      } else {
        chip.classList.add('hidden');
      }
    });
  });
});

/* ─── Stat counter animation ─────────────────────────────── */
function animateCount(el) {
  const target = parseInt(el.dataset.count);
  const duration = 1600;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + '+';
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  countObserver.observe(el);
});

/* ─── Tap Sound Effect ───────────────────────────────────── */
const tapSound = new Audio('path/to/your/click.mp3'); // Update this path!

// Function to play sound
const playTap = () => {
  tapSound.currentTime = 0; // Reset to start so it plays rapidly
  tapSound.play().catch(err => console.log("Audio play blocked until first interaction"));
};

// Target elements that should trigger the sound
const clickableElements = document.querySelectorAll(
  'a, button, .project-card, .cert-item, .blog-card, .contact-item'
);

clickableElements.forEach(el => {
  el.addEventListener('mousedown', playTap);
});

sections.forEach(s => sectionObserver.observe(s));

/* ─── Contact form ───────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Sent! ✓';
  btn.style.background = '#059669';
  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

/* ─── Smooth section transitions for same-page links ──────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});