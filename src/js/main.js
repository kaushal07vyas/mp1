// ============================================
// Load external stylesheets (fonts & icons)
// ============================================
(function () {
  var links = [
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
  ];
  links.forEach(function (href) {
    var el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    document.head.appendChild(el);
  });
})();

// ============================================
// DOM
// ============================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');
const sections = document.querySelectorAll('section, footer');

// ============================================
// Navbar resize + Position indicator
// ============================================
function onScroll() {
  const scrollY = window.scrollY;

  // Resize
  if (scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Position indicator
  const navH = navbar.offsetHeight;
  const winBottom = scrollY + window.innerHeight;
  const docH = document.documentElement.scrollHeight;

  // At the very bottom? Highlight last link.
  if (winBottom >= docH - 2) {
    setActive(navLinks[navLinks.length - 1]);
    return;
  }

  let current = '';
  sections.forEach(function (sec) {
    if (scrollY >= sec.offsetTop - navH - 20) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(function (link) {
    if (link.getAttribute('href') === '#' + current) {
      setActive(link);
    }
  });
}

function setActive(activeLink) {
  navLinks.forEach(function (l) { l.classList.remove('active'); });
  activeLink.classList.add('active');
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============================================
// Smooth scrolling
// ============================================
navLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var id = link.getAttribute('href');
    var target = document.querySelector(id);
    if (target) {
      var offset = target.offsetTop - navbar.offsetHeight + 1;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
    navMenu.classList.remove('open');
  });
});

// ============================================
// Mobile toggle
// ============================================
navToggle.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});

document.addEventListener('click', function (e) {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
  }
});

// ============================================
// Carousel
// ============================================
var track = document.querySelector('.carousel-track');
var slides = document.querySelectorAll('.carousel-slide');
var prevBtn = document.querySelector('.carousel-btn.prev');
var nextBtn = document.querySelector('.carousel-btn.next');
var dotsWrap = document.querySelector('.carousel-dots');
var current = 0;
var total = slides.length;

// Build dots
for (var i = 0; i < total; i++) {
  var dot = document.createElement('span');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  (function (idx) {
    dot.addEventListener('click', function () { goTo(idx); });
  })(i);
  dotsWrap.appendChild(dot);
}

var dots = dotsWrap.querySelectorAll('.dot');

function goTo(idx) {
  current = idx;
  track.style.transform = 'translateX(-' + (current * 100) + '%)';
  dots.forEach(function (d, j) {
    d.classList.toggle('active', j === current);
  });
}

prevBtn.addEventListener('click', function () {
  goTo((current - 1 + total) % total);
});

nextBtn.addEventListener('click', function () {
  goTo((current + 1) % total);
});

// Auto-advance
var timer = setInterval(function () { goTo((current + 1) % total); }, 5000);

var carouselEl = document.querySelector('.carousel');
carouselEl.addEventListener('mouseenter', function () { clearInterval(timer); });
carouselEl.addEventListener('mouseleave', function () {
  timer = setInterval(function () { goTo((current + 1) % total); }, 5000);
});

// ============================================
// Modals
// ============================================
var cards = document.querySelectorAll('[data-modal]');
var overlays = document.querySelectorAll('.modal-overlay');
var closeBtns = document.querySelectorAll('.modal-close');

cards.forEach(function (card) {
  card.addEventListener('click', function () {
    var id = card.getAttribute('data-modal');
    var modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

function closeModals() {
  overlays.forEach(function (o) { o.classList.remove('active'); });
  document.body.style.overflow = '';
}

closeBtns.forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeModals();
  });
});

overlays.forEach(function (o) {
  o.addEventListener('click', function (e) {
    if (e.target === o) closeModals();
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModals();
});

// ============================================
// Fade-in on scroll (IntersectionObserver)
// ============================================
var fadeEls = document.querySelectorAll('.fade-in');

var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

fadeEls.forEach(function (el) { observer.observe(el); });