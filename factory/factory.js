const map = document.querySelector('.map');
const world = document.querySelector('.world');
const shopButton = document.querySelector('#shopButton');
const cancelButton = document.querySelector('#cancelButton');
const shopPopover = document.querySelector('#shopPopover');
const shopGrid = document.querySelector('.shop-grid');
const BASE_CELL_SIZE = 42;
const MAP_SIZE = 10;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1;
const camera = { x: 0, y: 0, scale: 1 };
let pointerStart = null;

const products = [
  { name: 'Шахта', price: 20, color: '#7194ae', description: 'Добывает базовую руду.' },
  { name: 'Печь', price: 35, color: '#e18550', description: 'Переплавляет руду в слитки.' },
  { name: 'Конвейер', price: 8, color: '#77838d', description: 'Перевозит предметы между машинами.' },
  { name: 'Сборщик', price: 60, color: '#9b79c8', description: 'Собирает детали по рецепту.' },
  { name: 'Склад', price: 45, color: '#a88054', description: 'Хранит готовую продукцию.' },
  { name: 'Дробилка', price: 75, color: '#c45e64', description: 'Измельчает сырьё для обработки.' },
  { name: 'Пресс', price: 90, color: '#527ca5', description: 'Формирует прочные заготовки.' },
  { name: 'Лаборатория', price: 140, color: '#62a99a', description: 'Открывает новые технологии.' },
  { name: 'Генератор', price: 120, color: '#d2a244', description: 'Создаёт энергию для фабрики.' },
  { name: 'Терминал', price: 180, color: '#596f9f', description: 'Автоматизирует работу цеха.' },
];

function formatAmount(value) {
  if (value < 1000) return String(value);
  const shortened = (value / 1000).toFixed(1);
  return `${shortened}к`;
}

function renderResources() {
  document.querySelectorAll('.resource').forEach((resource) => {
    const value = Number(resource.dataset.value);
    const max = resource.dataset.max;
    const label = max ? `${formatAmount(value)}/${formatAmount(Number(max))}` : formatAmount(value);
    resource.querySelector('.resource-value').textContent = label;
  });
}

function renderShop() {
  shopGrid.innerHTML = products.map((product) => `
    <article class="product-card" style="--product-color: ${product.color}">
      <h2 class="product-name">${product.name}</h2>
      <svg class="product-art" viewBox="0 0 160 76" aria-hidden="true">
        <rect class="machine-body" x="42" y="16" width="76" height="48" rx="8" />
        <rect class="machine-detail" x="54" y="27" width="28" height="11" rx="3" />
        <circle class="machine-detail" cx="100" cy="47" r="9" />
        <path class="machine-detail" d="M61 47h23v7H61z" />
      </svg>
      <span class="product-price">${formatAmount(product.price)} $</span>
      <button class="product-buy" type="button" aria-label="Купить: ${product.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
      </button>
      <p class="product-description">${product.description}</p>
    </article>
  `).join('');
}

function setShopOpen(isOpen) {
  shopPopover.classList.toggle('is-open', isOpen);
  shopButton.setAttribute('aria-expanded', String(isOpen));
}

function keepCameraInBounds() {
  const mapRect = map.getBoundingClientRect();
  const worldSize = BASE_CELL_SIZE * MAP_SIZE * camera.scale;
  const maxX = Math.max(0, (worldSize - mapRect.width) / 2);
  const maxY = Math.max(0, (worldSize - mapRect.height) / 2);
  camera.x = Math.min(maxX, Math.max(-maxX, camera.x));
  camera.y = Math.min(maxY, Math.max(-maxY, camera.y));
}

function renderCamera() {
  keepCameraInBounds();
  world.style.transform = `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
}

map.addEventListener('pointerdown', (event) => {
  pointerStart = { x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y };
  map.classList.add('is-panning');
  map.setPointerCapture(event.pointerId);
});

map.addEventListener('pointermove', (event) => {
  if (!pointerStart) return;
  camera.x = pointerStart.cameraX + event.clientX - pointerStart.x;
  camera.y = pointerStart.cameraY + event.clientY - pointerStart.y;
  renderCamera();
});

function stopPanning() {
  pointerStart = null;
  map.classList.remove('is-panning');
}

map.addEventListener('pointerup', stopPanning);
map.addEventListener('pointercancel', stopPanning);

map.addEventListener('wheel', (event) => {
  event.preventDefault();
  const nextScale = camera.scale * (event.deltaY > 0 ? 0.9 : 1.1);
  camera.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
  renderCamera();
}, { passive: false });

window.addEventListener('resize', renderCamera);

renderResources();
renderShop();

shopButton.addEventListener('click', () => {
  setShopOpen(!shopPopover.classList.contains('is-open'));
});

cancelButton.addEventListener('click', () => setShopOpen(false));

document.addEventListener('pointerdown', (event) => {
  if (!shopPopover.classList.contains('is-open')) return;
  if (!shopPopover.contains(event.target) && !shopButton.contains(event.target)) setShopOpen(false);
});
