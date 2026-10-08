/* ===== LANGUAGE TOGGLE ===== */
let currentLang = localStorage.getItem('twcf-lang') || 'en';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('twcf-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = el.dataset[lang] || el.dataset.en;
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

/* ===== FORMSPREE AJAX SUBMIT ===== */
document.querySelectorAll('form[data-formspree]').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const successId = form.dataset.successTarget;
        if (successId) {
          form.style.display = 'none';
          const el = document.getElementById(successId);
          if (el) el.style.display = 'block';
        }
      } else {
        btn.textContent = 'Error — please try again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error — please try again';
      btn.disabled = false;
    }
  });
});

/* ===== KIT-SPECIFIC DONATION FORM (give-supplies.html) ===== */
const KIT_DATA = {
  'womens-dignity': {
    en: "Women's Dignity Kit", es: 'Kit de Dignidad para Mujeres', price: 3500,
    items: [
      { en: 'Body wash or 3-in-1', es: 'Gel de baño o 3 en 1' },
      { en: 'Shampoo', es: 'Champú' },
      { en: "Women's deodorant", es: 'Desodorante para mujer' },
      { en: 'Face wash', es: 'Limpiador facial' },
      { en: 'Body lotion', es: 'Loción corporal' },
      { en: 'Period products — menstrual pads (1 pack)', es: 'Productos menstruales — toallas sanitarias (1 paquete)' },
      { en: 'Underwear — new, packaged', es: 'Ropa interior — nueva y empaquetada' },
    ],
  },
  'baby-maternal': {
    en: 'Baby & Maternal Care Kit', es: 'Kit de Cuidado para Bebé y Madre', price: 5000,
    items: [
      { en: 'Baby wash, shampoo, and lotion set', es: 'Set de jabón, champú y loción para bebé' },
      { en: 'Diaper rash cream', es: 'Crema para rozaduras de pañal' },
      { en: 'Diapers — sizes 3–7 (1 pack)', es: 'Pañales — tallas 3–7 (1 paquete)' },
      { en: 'Pull-ups — any size (1 pack)', es: 'Pull-ups — cualquier talla (1 paquete)' },
      { en: 'Swaddle blanket (new)', es: 'Manta de swaddle (nueva)' },
      { en: 'Baby nail care kit', es: 'Kit de manicura para bebé' },
    ],
  },
  'childrens-education': {
    en: "Children's Education & Comfort Kit", es: 'Kit de Educación y Confort para Niños', price: 3500,
    items: [
      { en: 'Backpack (new)', es: 'Mochila (nueva)' },
      { en: 'Notebooks and pencils', es: 'Cuadernos y lápices' },
      { en: "Kid's body wash and shampoo", es: 'Gel de baño y champú para niños' },
      { en: 'Toothbrush and toothpaste (child-size)', es: 'Cepillo de dientes y pasta dental (tamaño infantil)' },
      { en: 'Age-appropriate book (new)', es: 'Libro apropiado para la edad (nuevo)' },
      { en: 'Small comfort item (stuffed animal, puzzle, or coloring book)', es: 'Artículo de confort pequeño (peluche, rompecabezas o libro para colorear)' },
    ],
  },
  'family-essentials': {
    en: 'Family Essentials Kit', es: 'Kit de Esenciales Familiares', price: 3000,
    items: [
      { en: 'Canned vegetables, canned fruit, or breakfast cereal', es: 'Verduras enlatadas, frutas enlatadas o cereal de desayuno' },
      { en: 'Parboiled rice or instant mashed potatoes', es: 'Arroz parbolizado o puré de papas instantáneo' },
      { en: 'Laundry pods', es: 'Cápsulas de detergente para ropa' },
      { en: 'Kleenex / facial tissues', es: 'Kleenex / pañuelos faciales' },
      { en: "Men's deodorant", es: 'Desodorante para hombre' },
      { en: 'Body wash', es: 'Gel de baño' },
      { en: "Men's or women's underwear — new, packaged (1 pair)", es: 'Ropa interior de hombre o mujer — nueva y empaquetada (1 par)' },
    ],
  },
  'teen-girls': {
    en: "Teen Girls' Essentials Kit", es: 'Kit de Esenciales para Adolescentes', price: 4500,
    items: [
      { en: 'Teen-formula deodorant', es: 'Desodorante fórmula juvenil' },
      { en: 'Body wash and face wash for acne-prone skin', es: 'Gel de baño y limpiador facial para piel con tendencia acnéica' },
      { en: 'Menstrual pads and tampons (multi-pack)', es: 'Toallas sanitarias y tampones (paquete múltiple)' },
      { en: 'New bra — packaged, various sizes', es: 'Sostén nuevo — empaquetado, varias tallas' },
      { en: 'Hairbrush and hair ties', es: 'Cepillo para el cabello y ligas' },
      { en: 'Underwear — new, packaged', es: 'Ropa interior — nueva y empaquetada' },
      { en: 'Journal and pen', es: 'Diario y bolígrafo' },
    ],
  },
  'hospital-comfort': {
    en: 'Hospital Comfort Kit for Kids', es: 'Kit de Confort Hospitalario para Niños', price: 2000,
    items: [
      { en: 'New stuffed animal or small plush toy', es: 'Peluche nuevo o muñeco pequeño' },
      { en: 'Coloring book and crayons or markers', es: 'Libro para colorear y crayones o marcadores' },
      { en: 'Small puzzle or activity book', es: 'Rompecabezas pequeño o libro de actividades' },
      { en: 'Get-well card', es: 'Tarjeta de mejórate pronto' },
      { en: 'Age-appropriate book (new)', es: 'Libro apropiado para la edad (nuevo)' },
    ],
  },
  'winter-warmth': {
    en: 'Winter Warmth Kit', es: 'Kit de Calor de Invierno', price: 3000,
    items: [
      { en: 'New winter hat', es: 'Gorro de invierno nuevo' },
      { en: 'Gloves or mittens (new pair)', es: 'Guantes o mitones (par nuevo)' },
      { en: 'Thick wool or thermal socks (new, multiple pairs)', es: 'Calcetines gruesos de lana o térmicos (nuevos, varios pares)' },
      { en: 'Hand warmers', es: 'Calentadores de manos' },
      { en: 'New thermal base-layer top or bottom', es: 'Capa base térmica nueva (superior o inferior)' },
    ],
  },
  'period-poverty': {
    en: 'Period Poverty Kit', es: 'Kit de Pobreza Menstrual', price: 3000,
    items: [
      { en: 'Menstrual pads (2 packs)', es: 'Toallas sanitarias (2 paquetes)' },
      { en: 'Tampons (1 pack)', es: 'Tampones (1 paquete)' },
      { en: 'Panty liners', es: 'Protectores diarios' },
      { en: 'Individual wet wipes', es: 'Toallitas húmedas individuales' },
      { en: 'Underwear — new, packaged (1 pair)', es: 'Ropa interior — nueva y empaquetada (1 par)' },
    ],
  },
  'home-start': {
    en: 'Home Start Kit', es: 'Kit de Nuevo Comienzo', price: 10000,
    items: [
      { en: 'Pots and a frying pan', es: 'Ollas y un sartén' },
      { en: 'Baking sheet', es: 'Charola para hornear' },
      { en: 'Cooking utensils and a can opener', es: 'Utensilios de cocina y un abrelatas' },
      { en: 'Cutting board and knives', es: 'Tabla para cortar y cuchillos' },
      { en: 'Plates, bowls, cups, and silverware', es: 'Platos, tazones, vasos y cubiertos' },
      { en: 'Dish towels', es: 'Toallas de cocina' },
      { en: 'Food-storage containers', es: 'Recipientes para almacenar alimentos' },
      { en: 'Dish soap and sponges', es: 'Jabón para platos y esponjas' },
    ],
  },
  'snack-kit': {
    en: 'Snack Kit', es: 'Kit de Meriendas',
    items: [
      { en: 'Granola or cereal bars (multi-pack)', es: 'Barras de granola o cereal (paquete múltiple)' },
      { en: 'Individual bags of crackers or pretzels', es: 'Bolsas individuales de galletas saladas o pretzels' },
      { en: 'Fruit snacks or applesauce pouches', es: 'Bocadillos de fruta o bolsitas de puré de manzana' },
      { en: 'Individually wrapped snacks (check for allergies)', es: 'Meriendas empaquetadas individualmente (verificar alergias)' },
      { en: 'Juice boxes or shelf-stable drink pouches', es: 'Cajitas de jugo o bolsitas de bebida no perecedera' },
      { en: 'Peanut-butter or cheese cracker packs', es: 'Paquetes de galletas con crema de cacahuate o queso' },
    ],
  },
  'dzaleka-childrens-education': {
    en: "Children's Education & Comfort Kit for Dzaleka", es: 'Kit de Educación y Confort para Niños para Dzaleka', price: 1500,
    items: [],
  },
  'dzaleka-baby-maternal': {
    en: 'Baby & Maternal Care Kit for Dzaleka', es: 'Kit de Cuidado para Bebé y Madre para Dzaleka', price: 3000,
    items: [],
  },
};

/* ===== STRIPE EMBEDDED CHECKOUT (sponsor.html / donate.html) ===== */
const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_ME'; // TODO: swap for real test key, then live key once verified

const DONATE_PRICES = {
  'donate-15':   { en: "Help complete a child's education kit", es: 'Ayuda a completar un kit de educación para un niño', amount: 15 },
  'donate-30':   { en: 'Help complete a maternal/baby care kit', es: 'Ayuda a completar un kit de cuidado materno/infantil', amount: 30 },
  'donate-50':   { en: 'Sponsor supplies for multiple beneficiaries', es: 'Patrocina suministros para varios beneficiarios', amount: 50 },
  'donate-125':  { en: 'Help fund humanitarian supplies and logistics', es: 'Ayuda a financiar suministros humanitarios y logística', amount: 125 },
  'donate-250':  { en: 'Major project sponsor', es: 'Patrocinador principal de proyecto', amount: 250 },
  'donate-1250': { en: 'Fund a pallet of care kits shipped internationally', es: 'Financia un tarima de kits de cuidado enviada internacionalmente', amount: 1250 },
};

function startEmbeddedCheckout({ type, slug, customAmount, containerEl, errorEl, loadingEl }) {
  if (typeof Stripe === 'undefined') {
    if (errorEl) errorEl.textContent = 'Payment system failed to load. Please refresh and try again.';
    return;
  }
  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const payload = { type, slug };
  if (customAmount !== undefined) payload.customAmount = customAmount;

  fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(r => r.json())
    .then(data => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (data.error) {
        if (errorEl) errorEl.textContent = data.error;
        return;
      }
      return stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret }).then(checkout => {
        containerEl.innerHTML = '';
        checkout.mount(containerEl);
      });
    })
    .catch(() => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) errorEl.textContent = 'Something went wrong starting checkout. Please try again.';
    });
}

const kitItemsGroup = document.getElementById('kit-items-group');
if (kitItemsGroup) {
  const kitSlug = new URLSearchParams(window.location.search).get('kit');
  const kit = kitSlug ? KIT_DATA[kitSlug] : null;

  if (kit) {
    document.getElementById('generic-items-group').style.display = 'none';
    kitItemsGroup.style.display = 'block';

    const banner = document.getElementById('kit-context-banner');
    banner.style.display = 'flex';
    document.getElementById('kit-context-name').textContent = currentLang === 'es' ? kit.es : kit.en;

    const listEl = document.getElementById('kit-items-list');
    kit.items.forEach((item, i) => {
      const label = document.createElement('label');
      label.style.cssText = 'display: flex; align-items: center; gap: 0.6rem; font-weight: 400; color: var(--muted); cursor: pointer;';
      label.innerHTML = `<input type="checkbox" name="kit_items[]" value="${item.en.replace(/"/g, '&quot;')}" style="accent-color: var(--purple); width: 16px; height: 16px;" />
        <span data-en="${item.en.replace(/"/g, '&quot;')}" data-es="${item.es.replace(/"/g, '&quot;')}">${item.en}</span>`;
      listEl.appendChild(label);
    });

    const kitTypeInput = document.getElementById('ds-kit-type');
    if (kitTypeInput) kitTypeInput.value = kitSlug;

    const descField = document.getElementById('ds-description');
    if (descField) {
      const placeholderEn = `e.g. 2 packs of shampoo and 1 backpack for the ${kit.en}...`;
      const placeholderEs = `Ej. 2 paquetes de champú y 1 mochila para el ${kit.es}...`;
      descField.setAttribute('data-en-placeholder', placeholderEn);
      descField.setAttribute('data-es-placeholder', placeholderEs);
      descField.placeholder = currentLang === 'es' ? placeholderEs : placeholderEn;
      descField.required = false;
    }
  }
}

/* ===== INIT ===== */
applyLanguage(currentLang);
