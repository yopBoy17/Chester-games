const map = document.querySelector('.map');
const world = document.querySelector('.world');
const shopButton = document.querySelector('#shopButton');
const cancelButton = document.querySelector('#cancelButton');
const shopPopover = document.querySelector('#shopPopover');
const shopGrid = document.querySelector('.shop-grid');
const buildPreview = document.querySelector('#buildPreview');
const placementMenu = document.querySelector('#placementMenu');
const placementName = document.querySelector('.placement-name');
const confirmPlacement = document.querySelector('#confirmPlacement');
const discardPlacement = document.querySelector('#discardPlacement');
const BASE_CELL_SIZE = 42;
const MAP_SIZE = 10;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1;
const camera = { x: 0, y: 0, scale: 1 };
let pointerStart = null;
let selectedProduct = null;
const buildings = new Map();
const draftBuildings = new Map();
const cellPreview = document.createElement('div');
cellPreview.className = 'cell-preview';
world.append(cellPreview);

const products = [
  { id: 'drill', name: 'Бур', price: 20, color: '#7194ae', image: 'assets/products/drill.png', footprint: { width: 1, height: 1 }, description: 'Добывает базовую руду.' },
  { id: 'furnace', name: 'Печь', price: 35, color: '#e18550', description: 'Переплавляет руду в слитки.' },
  { id: 'conveyor', name: 'Конвейер', price: 8, color: '#77838d', description: 'Перевозит предметы между машинами.' },
  { id: 'assembler', name: 'Сборщик', price: 60, color: '#9b79c8', description: 'Собирает детали по рецепту.' },
  { id: 'warehouse', name: 'Склад', price: 45, color: '#a88054', description: 'Хранит готовую продукцию.' },
  { id: 'crusher', name: 'Дробилка', price: 75, color: '#c45e64', description: 'Измельчает сырьё для обработки.' },
  { id: 'press', name: 'Пресс', price: 90, color: '#527ca5', description: 'Формирует прочные заготовки.' },
  { id: 'lab', name: 'Лаборатория', price: 140, color: '#62a99a', description: 'Открывает новые технологии.' },
  { id: 'generator', name: 'Генератор', price: 120, color: '#d2a244', description: 'Создаёт энергию для фабрики.' },
  { id: 'terminal', name: 'Терминал', price: 180, color: '#596f9f', description: 'Автоматизирует работу цеха.' },
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
      ${product.image
        ? `<img class="product-art product-art--image" src="${product.image}" alt="" />`
        : `<svg class="product-art" viewBox="0 0 160 76" aria-hidden="true">
            <rect class="machine-body" x="42" y="16" width="76" height="48" rx="8" />
            <rect class="machine-detail" x="54" y="27" width="28" height="11" rx="3" />
            <circle class="machine-detail" cx="100" cy="47" r="9" />
            <path class="machine-detail" d="M61 47h23v7H61z" />
          </svg>`}
      <span class="product-price">${formatAmount(product.price)} $</span>
        <button class="product-buy" type="button" data-product-id="${product.id}" aria-label="Выбрать: ${product.name}">
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

function getFootprint(product) {
  return product?.footprint ?? { width: 1, height: 1 };
}

function isCellOccupied(cell) {
  const key = `${cell.x}:${cell.y}`;
  return buildings.has(key) || draftBuildings.has(key);
}

function finishPlacement() {
  selectedProduct = null;
  placementMenu.classList.remove('is-visible');
  hidePlacementPreview();
}

function discardDraftBuildings() {
  draftBuildings.forEach((building) => building.remove());
  draftBuildings.clear();
  finishPlacement();
}

function hidePlacementPreview() {
  buildPreview.classList.remove('is-visible');
  cellPreview.style.display = 'none';
}

function renderBuildPreview() {
  if (!selectedProduct) return hidePlacementPreview();
  buildPreview.innerHTML = selectedProduct.image
    ? `<img src="${selectedProduct.image}" alt="" />`
    : `<span style="background:${selectedProduct.color}"></span>`;
}

function updatePlacementPreview(event) {
  if (!selectedProduct) return hidePlacementPreview();
  buildPreview.style.left = `${event.clientX}px`;
  buildPreview.style.top = `${event.clientY}px`;
  buildPreview.classList.add('is-visible');

  const cell = getCellAtPoint(event.clientX, event.clientY);
  if (!cell || isCellOccupied(cell)) {
    cellPreview.style.display = 'none';
    return;
  }

  const footprint = getFootprint(selectedProduct);
  cellPreview.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  cellPreview.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  cellPreview.style.width = `${(footprint.width / MAP_SIZE) * 100}%`;
  cellPreview.style.height = `${(footprint.height / MAP_SIZE) * 100}%`;
  cellPreview.style.display = 'block';
}

function getCellAtPoint(clientX, clientY) {
  const worldRect = world.getBoundingClientRect();
  const x = Math.floor(((clientX - worldRect.left) / worldRect.width) * MAP_SIZE);
  const y = Math.floor(((clientY - worldRect.top) / worldRect.height) * MAP_SIZE);
  if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return null;
  return { x, y };
}

function placeBuilding(cell) {
  const key = `${cell.x}:${cell.y}`;
  if (!selectedProduct || isCellOccupied(cell)) return;
  const footprint = getFootprint(selectedProduct);

  const building = document.createElement('div');
  building.className = 'building building--draft';
  building.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  building.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  building.style.width = `${(footprint.width / MAP_SIZE) * 100}%`;
  building.style.height = `${(footprint.height / MAP_SIZE) * 100}%`;
  building.title = selectedProduct.name;
  building.innerHTML = selectedProduct.image
    ? `<img src="${selectedProduct.image}" alt="${selectedProduct.name}" />`
    : `<span style="background:${selectedProduct.color}"></span>`;
  world.append(building);
  draftBuildings.set(key, building);
  placementName.textContent = selectedProduct.name;
  placementMenu.classList.add('is-visible');
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
  if (event.button !== 0) return;
  pointerStart = { x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y };
  map.classList.add('is-panning');
  map.setPointerCapture(event.pointerId);
});

map.addEventListener('pointermove', (event) => {
  if (pointerStart) {
    camera.x = pointerStart.cameraX + event.clientX - pointerStart.x;
    camera.y = pointerStart.cameraY + event.clientY - pointerStart.y;
    renderCamera();
  }
  updatePlacementPreview(event);
});

map.addEventListener('pointerleave', hidePlacementPreview);

function stopPanning(event) {
  const start = pointerStart;
  pointerStart = null;
  map.classList.remove('is-panning');
  if (!start || !selectedProduct) return;
  if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
  const cell = getCellAtPoint(event.clientX, event.clientY);
  if (cell) placeBuilding(cell);
  updatePlacementPreview(event);
}

map.addEventListener('pointerup', stopPanning);
map.addEventListener('pointercancel', () => {
  pointerStart = null;
  map.classList.remove('is-panning');
});

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

shopGrid.addEventListener('click', (event) => {
  const buyButton = event.target.closest('.product-buy');
  if (!buyButton) return;
  selectedProduct = products.find((product) => product.id === buyButton.dataset.productId) ?? null;
  renderBuildPreview();
  placementName.textContent = selectedProduct?.name ?? '';
  placementMenu.classList.toggle('is-visible', Boolean(selectedProduct));
  setShopOpen(false);
});

cancelButton.addEventListener('click', () => {
  setShopOpen(false);
  discardDraftBuildings();
});

confirmPlacement.addEventListener('click', () => {
  draftBuildings.forEach((building, key) => {
    building.classList.remove('building--draft');
    buildings.set(key, building);
  });
  draftBuildings.clear();
  finishPlacement();
});

discardPlacement.addEventListener('click', discardDraftBuildings);

document.addEventListener('pointerdown', (event) => {
  if (!shopPopover.classList.contains('is-open')) return;
  if (!shopPopover.contains(event.target) && !shopButton.contains(event.target)) setShopOpen(false);
});
