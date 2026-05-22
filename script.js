/* ===== LANGUAGE TOGGLE ===== */
let currentLang = localStorage.getItem('twcf-lang') || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('twcf-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en;
  });

  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    el.placeholder = (lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder) || el.dataset.enPlaceholder || '';
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

/* ===== MOBILE NAV ===== */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ===== ACTIVE NAV LINK ===== */
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('active');
});

/* ===== GET HELP — CATEGORY SELECTOR ===== */
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.category;

    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.help-content').forEach(c => {
      c.classList.toggle('visible', c.dataset.category === cat);
    });

    const visible = document.querySelector('.help-content.visible');
    if (visible) visible.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ===== HERO SLIDESHOW ===== */
const slides     = document.querySelectorAll('.slide');
const dots       = document.querySelectorAll('.dot');
let   slideIndex = 0;
let   slideTimer;

function goToSlide(n) {
  slides[slideIndex].classList.remove('active');
  dots[slideIndex].classList.remove('active');
  slideIndex = (n + slides.length) % slides.length;
  slides[slideIndex].classList.add('active');
  dots[slideIndex].classList.add('active');
}

if (slides.length > 0) {
  slideTimer = setInterval(() => goToSlide(slideIndex + 1), 5000);
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(slideTimer);
      goToSlide(i);
      slideTimer = setInterval(() => goToSlide(slideIndex + 1), 5000);
    });
  });
}

/* ===== INIT ===== */
applyLanguage(currentLang);
