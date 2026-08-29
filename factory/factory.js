const map = document.querySelector('.map');
const world = document.querySelector('.world');
const shopButton = document.querySelector('#shopButton');
const moveButton = document.querySelector('#moveButton');
const rotateButton = document.querySelector('#rotateButton');
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
let moveMode = false;
let rotateMode = false;
let movingBuilding = null;
let movingOriginKey = null;
let moveDragStarted = false;
let movingPointerStart = null;
let selectedBuildingForMove = null;
let selectedBuildingOriginKey = null;
const buildings = new Map();
const draftBuildings = new Map();
const cellPreview = document.createElement('div');
cellPreview.className = 'cell-preview';
world.append(cellPreview);

const products = [
  { id: 'drill', name: 'Бур', price: 20, color: '#7194ae', image: 'assets/products/drill.png', footprint: { width: 1, height: 1 }, description: 'Добывает базовую руду.' },
  { id: 'furnace', name: 'Печь', price: 35, color: '#e18550', image: 'assets/products/furnace.png', description: 'Переплавляет руду в слитки.' },
  { id: 'conveyor', name: 'Конвейер', price: 8, color: '#77838d', image: 'assets/products/conveyor-straight.png', description: 'Перевозит предметы между машинами.' },
  { id: 'assembler', name: 'Завод', price: 60, color: '#9b79c8', image: 'assets/products/factory-plant.png', description: 'Собирает детали по рецепту.' },
  { id: 'warehouse', name: 'Склад', price: 45, color: '#a88054', image: 'assets/products/warehouse.png', description: 'Хранит готовую продукцию.' },
  { id: 'crusher', name: 'Дробилка', price: 75, color: '#c45e64', image: 'assets/products/crusher.png', description: 'Измельчает сырьё для обработки.' },
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

function isCellOccupied(cell, ignoredKey = null) {
  const key = `${cell.x}:${cell.y}`;
  return (key !== ignoredKey && buildings.has(key)) || draftBuildings.has(key);
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

function getConveyorAt(x, y) {
  const key = `${x}:${y}`;
  const building = buildings.get(key) ?? draftBuildings.get(key);
  return building?.classList.contains('building--conveyor') ? building : null;
}

function getConveyorImage(building) {
  return building.dataset.conveyorShape === 'corner'
    ? 'assets/products/conveyor-corner.png'
    : 'assets/products/conveyor-straight.png';
}

function directionForRotation(rotation) {
  return ['right', 'bottom', 'left', 'top'][((Number(rotation) % 360) + 360) % 360 / 90];
}

function oppositeSide(side) {
  return { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[side];
}

function renderConveyor(building) {
  const graphic = building.querySelector('img');
  if (graphic) {
    graphic.src = getConveyorImage(building);
    graphic.style.transform = `rotate(${Number(building.dataset.rotation ?? 0)}deg)`;
  }
  building.classList.toggle('building--conveyor-corner', building.dataset.conveyorShape === 'corner');
}

function refreshConveyors() {
  const allConveyors = [...buildings.values(), ...draftBuildings.values()]
    .filter((building) => building.classList.contains('building--conveyor'));

  allConveyors.forEach((building) => {
    const [x, y] = building.dataset.cellKey.split(':').map(Number);
    const neighbors = [
      { side: 'left', x: x - 1, y },
      { side: 'right', x: x + 1, y },
      { side: 'top', x, y: y - 1 },
      { side: 'bottom', x, y: y + 1 },
    ].map((neighbor) => ({ ...neighbor, building: getConveyorAt(neighbor.x, neighbor.y) }))
      .filter((neighbor) => neighbor.building);

    const source = neighbors.find((neighbor) => (
      directionForRotation(neighbor.building.dataset.rotation ?? 0) === oppositeSide(neighbor.side)
    ));
    const destination = neighbors.find((neighbor) => (
      directionForRotation(neighbor.building.dataset.rotation ?? 0) === neighbor.side
    ));
    const isCorner = source && destination && source.side !== destination.side
      && !['left:right', 'right:left', 'top:bottom', 'bottom:top'].includes(`${source.side}:${destination.side}`);

    if (isCorner) {
      const rotations = {
        'left:top': 0,
        'top:right': 90,
        'right:bottom': 180,
        'bottom:left': 270,
      };
      building.dataset.conveyorShape = 'corner';
      if (building.dataset.manualRotation !== 'true') {
        building.dataset.rotation = String(rotations[`${source.side}:${destination.side}`] ?? 0);
      }
    } else {
      building.dataset.conveyorShape = 'straight';
    }
    renderConveyor(building);
  });
}

function placeBuilding(cell) {
  const key = `${cell.x}:${cell.y}`;
  if (!selectedProduct || isCellOccupied(cell)) return;
  const footprint = getFootprint(selectedProduct);

  const building = document.createElement('div');
  building.className = `building building--${selectedProduct.id} building--draft`;
  if (selectedProduct.id !== 'conveyor') {
    building.classList.add('building--has-active-side');
    building.dataset.activeSide = 'bottom';
    building.dataset.activeState = 'ready';
  }
  building.dataset.cellKey = key;
  building.dataset.rotation = '0';
  if (selectedProduct.id === 'conveyor') building.dataset.conveyorShape = 'straight';
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
  refreshConveyors();
  placementName.textContent = selectedProduct.name;
  placementMenu.classList.add('is-visible');
}

function setMoveMode(enabled) {
  if (enabled) setRotateMode(false);
  moveMode = enabled;
  if (!moveMode) clearMoveSelection();
  moveButton.classList.toggle('is-active', moveMode);
  moveButton.setAttribute('aria-pressed', String(moveMode));
  map.classList.toggle('is-move-mode', moveMode);
}

function setRotateMode(enabled) {
  if (enabled) setMoveMode(false);
  rotateMode = enabled;
  rotateButton.classList.toggle('is-active', rotateMode);
  rotateButton.setAttribute('aria-pressed', String(rotateMode));
  map.classList.toggle('is-rotate-mode', rotateMode);
}

function rotateBuilding(building) {
  const nextRotation = (Number(building.dataset.rotation ?? 0) + 90) % 360;
  building.dataset.rotation = String(nextRotation);
  if (building.classList.contains('building--conveyor')) {
    building.dataset.manualRotation = 'true';
  }
  building.style.transform = '';
  const graphic = building.querySelector('img, span');
  if (graphic) graphic.style.transform = `rotate(${nextRotation}deg)`;

  if (building.classList.contains('building--has-active-side')) {
    const sides = ['bottom', 'left', 'top', 'right'];
    building.dataset.activeSide = sides[nextRotation / 90];
  }

  if (building.classList.contains('building--conveyor')) refreshConveyors();
}

function clearMoveSelection() {
  selectedBuildingForMove?.classList.remove('building--move-selected');
  selectedBuildingForMove = null;
  selectedBuildingOriginKey = null;
}

function selectBuildingForMove(building) {
  if (selectedBuildingForMove === building) {
    clearMoveSelection();
    return;
  }
  clearMoveSelection();
  selectedBuildingForMove = building;
  selectedBuildingOriginKey = building.dataset.cellKey;
  building.classList.add('building--move-selected');
}

function updateMovePreview(event) {
  const cell = getCellAtPoint(event.clientX, event.clientY);
  if (!cell || isCellOccupied(cell, movingOriginKey)) {
    cellPreview.style.display = 'none';
    return null;
  }

  cellPreview.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  cellPreview.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  cellPreview.style.width = `${100 / MAP_SIZE}%`;
  cellPreview.style.height = `${100 / MAP_SIZE}%`;
  cellPreview.style.display = 'block';
  return cell;
}

function moveBuildingTo(cell) {
  if (!movingBuilding || !cell) return;
  const targetKey = `${cell.x}:${cell.y}`;
  buildings.delete(movingOriginKey);
  buildings.set(targetKey, movingBuilding);
  movingBuilding.dataset.cellKey = targetKey;
  movingBuilding.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  movingBuilding.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  refreshConveyors();
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
  const building = event.target.closest('.building');
  if (rotateMode && building && !building.classList.contains('building--draft')) {
    rotateBuilding(building);
    return;
  }
  if (moveMode && building && !building.classList.contains('building--draft')) {
    movingBuilding = building;
    movingOriginKey = building.dataset.cellKey;
    moveDragStarted = false;
    movingPointerStart = { x: event.clientX, y: event.clientY };
    building.classList.add('building--moving');
    map.setPointerCapture(event.pointerId);
    updateMovePreview(event);
    return;
  }
  pointerStart = { x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y };
  map.classList.add('is-panning');
  map.setPointerCapture(event.pointerId);
});

map.addEventListener('pointermove', (event) => {
  if (movingBuilding) {
    if (movingPointerStart && Math.hypot(event.clientX - movingPointerStart.x, event.clientY - movingPointerStart.y) > 6) {
      moveDragStarted = true;
    }
    updateMovePreview(event);
    return;
  }
  if (pointerStart) {
    camera.x = pointerStart.cameraX + event.clientX - pointerStart.x;
    camera.y = pointerStart.cameraY + event.clientY - pointerStart.y;
    renderCamera();
  }
  updatePlacementPreview(event);
});

map.addEventListener('pointerleave', () => {
  if (!movingBuilding) hidePlacementPreview();
});

function stopPanning(event) {
  if (movingBuilding) {
    const cell = updateMovePreview(event);
    if (moveDragStarted) moveBuildingTo(cell);
    else selectBuildingForMove(movingBuilding);
    movingBuilding.classList.remove('building--moving');
    movingBuilding = null;
    movingOriginKey = null;
    moveDragStarted = false;
    movingPointerStart = null;
    cellPreview.style.display = 'none';
    return;
  }
  const start = pointerStart;
  pointerStart = null;
  map.classList.remove('is-panning');
  if (moveMode && selectedBuildingForMove && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) {
    const cell = getCellAtPoint(event.clientX, event.clientY);
    if (cell && !isCellOccupied(cell, selectedBuildingOriginKey)) {
      const building = selectedBuildingForMove;
      const originKey = selectedBuildingOriginKey;
      movingBuilding = building;
      movingOriginKey = originKey;
      moveBuildingTo(cell);
      movingBuilding = null;
      movingOriginKey = null;
      clearMoveSelection();
    }
    return;
  }
  if (!start || !selectedProduct) return;
  if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
  const cell = getCellAtPoint(event.clientX, event.clientY);
  if (cell) placeBuilding(cell);
  updatePlacementPreview(event);
}

map.addEventListener('pointerup', stopPanning);
map.addEventListener('pointercancel', () => {
  if (movingBuilding) {
    movingBuilding.classList.remove('building--moving');
    movingBuilding = null;
    movingOriginKey = null;
    moveDragStarted = false;
    movingPointerStart = null;
    cellPreview.style.display = 'none';
  }
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

moveButton.addEventListener('click', () => {
  if (selectedProduct || draftBuildings.size) return;
  setMoveMode(!moveMode);
});

rotateButton.addEventListener('click', () => {
  if (selectedProduct || draftBuildings.size) return;
  setRotateMode(!rotateMode);
});

shopGrid.addEventListener('click', (event) => {
  const buyButton = event.target.closest('.product-buy');
  if (!buyButton) return;
  selectedProduct = products.find((product) => product.id === buyButton.dataset.productId) ?? null;
  setMoveMode(false);
  setRotateMode(false);
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
  refreshConveyors();
  finishPlacement();
});

discardPlacement.addEventListener('click', discardDraftBuildings);

document.addEventListener('pointerdown', (event) => {
  if (!shopPopover.classList.contains('is-open')) return;
  if (!shopPopover.contains(event.target) && !shopButton.contains(event.target)) setShopOpen(false);
});
