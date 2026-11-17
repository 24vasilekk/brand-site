const hero = document.querySelector('.hero');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = Math.min(window.scrollY * 0.08, 45);
    hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
  }, { passive: true });
}

const archiveProducts = Array.from({ length: 24 }, (_, index) => {
  const number = String(index + 1).padStart(3, '0');
  const file = String(index + 1).padStart(2, '0');
  return { number, file, title: `US / ${number}`, image: `assets/catalog/us-${file}.webp` };
});

const newYearProducts = Array.from({ length: 7 }, (_, index) => {
  const number = String(index + 25).padStart(3, '0');
  const file = String(index + 1).padStart(2, '0');
  return { number, file, title: `US / ${number}`, image: `assets/catalog/new-year-${file}.webp` };
});

const latestProducts = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 32).padStart(3, '0');
  const file = String(index + 1).padStart(2, '0');
  return { number, file, title: `US / ${number}`, image: `assets/catalog/drop-02-${file}.webp` };
});

const products = [...archiveProducts, ...newYearProducts, ...latestProducts];

const productGrid = document.querySelector('#product-grid');
const fullProductGrid = document.querySelector('#full-product-grid');
const catalogDialog = document.querySelector('#catalog-dialog');
const showAllCatalog = document.querySelector('#show-all-catalog');
const dialog = document.querySelector('#order-dialog');
const orderImage = document.querySelector('#order-image');
const orderNumber = document.querySelector('#order-number');
const orderMessage = document.querySelector('#order-message');
const telegramButton = document.querySelector('#telegram-button');
let selectedProduct = null;

function createProductCard(product, index) {
  const card = document.createElement('article');
  card.className = `product-card tone-${index % 4}`;
  card.innerHTML = `
    <div class="product-picture">
      <span class="product-index">${product.number}</span>
      <img src="${product.image}" alt="Футболка ${product.title}" loading="${index < 4 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" decoding="async">
    </div>
    <div class="product-info">
      <div><span>print archive</span><h3>${product.title}</h3></div>
      <button type="button" class="order-button" aria-label="Заказать ${product.title}">Заказать <i class="ui-arrow" aria-hidden="true"></i></button>
    </div>`;
  card.querySelector('.order-button').addEventListener('click', () => {
    if (catalogDialog.open) catalogDialog.close();
    openOrder(product);
  });
  return card;
}

products.slice(0, 4).forEach((product, index) => productGrid.append(createProductCard(product, index)));
products.forEach((product, index) => fullProductGrid.append(createProductCard(product, index)));

function openCatalog(updateUrl = true) {
  sendGoal('catalog_open');
  catalogDialog.showModal();
  document.body.classList.add('dialog-open');
  if (updateUrl) history.replaceState({}, '', `${window.location.pathname}?catalog=all`);
}

function closeCatalog() {
  catalogDialog.close();
  document.body.classList.remove('dialog-open');
  history.replaceState({}, '', `${window.location.pathname}#catalog`);
}

showAllCatalog.addEventListener('click', () => openCatalog());
catalogDialog.querySelector('.catalog-dialog-close').addEventListener('click', closeCatalog);
catalogDialog.addEventListener('click', (event) => {
  if (event.target === catalogDialog) closeCatalog();
});
catalogDialog.addEventListener('close', () => {
  if (!dialog.open) document.body.classList.remove('dialog-open');
  if (new URLSearchParams(window.location.search).has('catalog')) history.replaceState({}, '', `${window.location.pathname}#catalog`);
});

const requestedOrder = new URLSearchParams(window.location.search).get('order');
const initialProduct = products.find((product) => product.number === requestedOrder);
if (initialProduct) openOrder(initialProduct, false);
if (!initialProduct && new URLSearchParams(window.location.search).get('catalog') === 'all') openCatalog(false);

function openOrder(product, updateUrl = true) {
  sendGoal('product_order_open');
  selectedProduct = product;
  const message = `Здравствуйте! Хочу заказать принт ${product.title} со своими фотографиями. Подскажите, пожалуйста, какие вещи и размеры доступны и как оформить заказ?`;
  orderImage.src = product.image;
  orderImage.alt = `Выбранная футболка ${product.title}`;
  orderNumber.textContent = product.title;
  orderMessage.textContent = message;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  if (updateUrl) history.replaceState({}, '', `${window.location.pathname}?order=${product.number}#catalog`);
}

function closeOrder() {
  dialog.close();
  document.body.classList.remove('dialog-open');
  history.replaceState({}, '', `${window.location.pathname}#catalog`);
}

dialog.querySelector('.dialog-close').addEventListener('click', closeOrder);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeOrder();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (new URLSearchParams(window.location.search).has('order')) history.replaceState({}, '', `${window.location.pathname}#catalog`);
});

telegramButton.addEventListener('click', () => {
  sendGoal('order_telegram');
  if (!selectedProduct) return;
  const telegramUrl = `https://t.me/usmgmt?text=${encodeURIComponent(orderMessage.textContent)}`;
  window.location.assign(telegramUrl);
});

function sendGoal(goal) {
  const counterId = window.US_YM_COUNTER_ID;
  if (counterId && typeof window.ym === 'function') window.ym(counterId, 'reachGoal', goal);
}

document.querySelectorAll('[data-goal]').forEach((link) => {
  link.addEventListener('click', () => sendGoal(link.dataset.goal));
});
