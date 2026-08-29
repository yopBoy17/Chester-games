const map = document.querySelector('.map');
const world = document.querySelector('.world');
const shopButton = document.querySelector('#shopButton');
const moveButton = document.querySelector('#moveButton');
const rotateButton = document.querySelector('#rotateButton');
const cancelButton = document.querySelector('#cancelButton');
const inventoryButton = document.querySelector('#inventoryButton');
const shopPopover = document.querySelector('#shopPopover');
const shopGrid = document.querySelector('.shop-grid');
const inventoryPopover = document.querySelector('#inventoryPopover');
const inventoryGrid = document.querySelector('#inventoryGrid');
const inventoryDetail = document.querySelector('#inventoryDetail');
const buildPreview = document.querySelector('#buildPreview');
const placementMenu = document.querySelector('#placementMenu');
const placementName = document.querySelector('.placement-name');
const machineMenu = document.querySelector('#machineMenu');
const machineLevel = document.querySelector('.machine-level');
const machineRate = document.querySelector('.machine-rate');
const machineDropList = document.querySelector('.machine-drop-list');
const machineUpgrade = document.querySelector('#machineUpgrade');
const crusherMenu = document.querySelector('#crusherMenu');
const crusherLevel = document.querySelector('.crusher-level');
const crusherRate = document.querySelector('.crusher-rate');
const crusherInputIcon = document.querySelector('.crusher-input-icon');
const crusherInputName = document.querySelector('.crusher-input-name');
const crusherInputCount = document.querySelector('.crusher-input-count');
const crusherOutputIcon = document.querySelector('.crusher-output-icon');
const crusherOutputName = document.querySelector('.crusher-output-name');
const crusherOutputCount = document.querySelector('.crusher-output-count');
const crusherArrowProgress = document.querySelector('.crusher-arrow > span');
const crusherAvailable = document.querySelector('.crusher-available');
const crusherUpgrade = document.querySelector('#crusherUpgrade');
const furnaceMenu = document.querySelector('#furnaceMenu');
const furnaceLevel = document.querySelector('.furnace-level');
const furnaceRate = document.querySelector('.furnace-rate');
const furnaceInputIcon = document.querySelector('.furnace-input-icon');
const furnaceInputName = document.querySelector('.furnace-input-name');
const furnaceInputCount = document.querySelector('.furnace-input-count');
const furnaceOutputIcon = document.querySelector('.furnace-output-icon');
const furnaceOutputName = document.querySelector('.furnace-output-name');
const furnaceOutputCount = document.querySelector('.furnace-output-count');
const furnaceArrowProgress = document.querySelector('.furnace-arrow > span');
const furnaceAvailable = document.querySelector('.furnace-available');
const furnaceUpgrade = document.querySelector('#furnaceUpgrade');
const confirmPlacement = document.querySelector('#confirmPlacement');
const discardPlacement = document.querySelector('#discardPlacement');
const BASE_CELL_SIZE = 42;
const MAP_SIZE = 10;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1;
const STORAGE_KEY = 'chester-games.factory.save.v1';
const SAVE_API_URL = new URL('api/save', window.location.href).href;
const camera = { x: 0, y: 0, scale: 1 };
let pointerStart = null;
let selectedProduct = null;
let moveMode = false;
let rotateMode = false;
let deleteMode = false;
let lastPlacedConveyorKey = null;
let selectedDrill = null;
let selectedCrusher = null;
let selectedFurnace = null;
let movingBuilding = null;
let movingOriginKey = null;
let selectedBuildingForMove = null;
let selectedBuildingOriginKey = null;
const buildings = new Map();
const draftBuildings = new Map();
const buildingsMarkedForDeletion = new Set();
const movingResources = new Set();
const DRILL_UPGRADE_COST = 10;
const MAX_DRILL_LEVEL = 9;
const CRUSHER_UPGRADE_COST = 10;
const MAX_CRUSHER_LEVEL = 9;
const FURNACE_UPGRADE_COST = 10;
const MAX_FURNACE_LEVEL = 9;
const MAX_CONVEYOR_ITEMS = 20;
const inventoryItems = [
  { id: 'trash', name: 'Мусор', color: '#6f7780', sellPrice: 1 },
];
let inventory = { trash: 0 };
let selectedInventoryItemId = null;
let saveSyncTimer = null;
const drillResources = [
  { id: 'coal', name: 'Уголь', color: '#202329' },
  { id: 'iron', name: 'Железная руда', color: '#73808b' },
  { id: 'copper', name: 'Медная руда', color: '#c7784e' },
  { id: 'tin', name: 'Оловянная руда', color: '#a7b7c2' },
  { id: 'silver', name: 'Серебряная руда', color: '#d6dbe1' },
  { id: 'gold', name: 'Золотая руда', color: '#e1b139' },
  { id: 'tungsten', name: 'Вольфрамовая руда', color: '#48525b' },
  { id: 'platinum', name: 'Платиновая руда', color: '#79a1a8' },
  { id: 'diamond', name: 'Алмазная руда', color: '#59bdd8' },
];
const crushedResources = drillResources.slice(1).map((resource) => ({
  id: `${resource.id}-powder`,
  name: resource.name.replace('ая руда', 'ый порошок').replace('яя руда', 'ий порошок').replace('овая руда', 'овый порошок'),
  color: resource.color,
}));
const smeltedResources = [
  { id: 'iron-ingot', name: 'Железный слиток', color: '#73808b' },
  { id: 'copper-ingot', name: 'Медный слиток', color: '#c7784e' },
  { id: 'tin-ingot', name: 'Оловянный слиток', color: '#a7b7c2' },
  { id: 'silver-ingot', name: 'Серебряный слиток', color: '#d6dbe1' },
  { id: 'gold-ingot', name: 'Золотой слиток', color: '#e1b139' },
  { id: 'tungsten-ingot', name: 'Вольфрамовый слиток', color: '#48525b' },
  { id: 'platinum-ingot', name: 'Платиновый слиток', color: '#79a1a8' },
  { id: 'diamond', name: 'Алмаз', color: '#59bdd8' },
];

inventoryItems.push(
  ...[...drillResources, ...crushedResources, ...smeltedResources].map((resource) => ({
    ...resource,
    sellPrice: 0,
  })),
);

function getResourceType(resourceId) {
  return [...drillResources, ...crushedResources, ...smeltedResources].find((resource) => resource.id === resourceId) ?? null;
}
const drillChanceTable = [
  [75, 25],
  [70, 30],
  [25, 50, 25],
  [15, 35, 35, 15],
  [10, 20, 40, 20, 10],
  [7, 13, 28, 32, 13, 7],
  [5, 9, 20, 32, 20, 9, 5],
  [5, 7, 14, 24, 24, 14, 7, 5],
  [5, 7, 11, 16, 22, 16, 11, 7, 5],
];
const cellPreview = document.createElement('div');
cellPreview.className = 'cell-preview';
world.append(cellPreview);

const products = [
  { id: 'drill', name: 'Бур', price: 20, color: '#7194ae', image: 'assets/products/drill.png', footprint: { width: 1, height: 1 }, defaultRotation: 180, description: 'Добывает базовую руду.' },
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

function getMoneyResource() {
  return document.querySelector('.resource--money-green');
}

function getMoney() {
  return Number(getMoneyResource().dataset.value);
}

function setMoney(value) {
  getMoneyResource().dataset.value = String(Math.max(0, value));
  renderResources();
  renderShop();
}

function canAfford(product) {
  return getMoney() >= product.price;
}

function saveGameState() {
  const serializeBuilding = (building, isDraft) => {
    const [x, y] = building.dataset.cellKey.split(':').map(Number);
    return {
      productId: building.dataset.productId,
      x,
      y,
      rotation: Number(building.dataset.rotation ?? 0),
      rotationModel: 2,
      activeSide: building.dataset.activeSide,
      level: Number(building.dataset.level ?? 1),
      cost: Number(building.dataset.cost ?? 0),
      crusherInputId: building.dataset.crusherInputId ?? null,
      crusherInputCount: Number(building.dataset.crusherInputCount ?? 0),
      crusherNextProcessAt: Number(building.dataset.crusherNextProcessAt ?? 0),
      furnaceInputId: building.dataset.furnaceInputId ?? null,
      furnaceInputCount: Number(building.dataset.furnaceInputCount ?? 0),
      furnaceNextProcessAt: Number(building.dataset.furnaceNextProcessAt ?? 0),
      isDraft,
    };
  };

  const state = {
    resources: [...document.querySelectorAll('.resource')].map((resource) => ({
      value: resource.dataset.value,
      max: resource.dataset.max ?? null,
    })),
    buildings: [
      ...[...buildings.values()].map((building) => serializeBuilding(building, false)),
      ...[...draftBuildings.values()].map((building) => serializeBuilding(building, true)),
    ],
    conveyorItems: [...movingResources]
      .filter((item) => item.cell && getConfirmedConveyorAt(item.cell))
      .map((item) => ({ resourceId: item.resourceId, x: item.cell.x, y: item.cell.y })),
    inventory,
    selectedProductId: selectedProduct?.id ?? null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncGameState(state);
}

function syncGameState(state) {
  if (window.location.protocol === 'file:') return;
  window.clearTimeout(saveSyncTimer);
  saveSyncTimer = window.setTimeout(() => {
    fetch(SAVE_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {});
  }, 250);
}

function renderShop() {
  shopGrid.innerHTML = products.map((product) => `
    <article class="product-card" style="--product-color: ${product.color}">
      <h2 class="product-name">${product.name}</h2>
      ${product.id === 'conveyor'
        ? conveyorMarkup('product-art product-art--conveyor')
        : product.image
        ? `<img class="product-art product-art--image" src="${product.image}" alt="" draggable="false" />`
        : `<svg class="product-art" viewBox="0 0 160 76" aria-hidden="true">
            <rect class="machine-body" x="42" y="16" width="76" height="48" rx="8" />
            <rect class="machine-detail" x="54" y="27" width="28" height="11" rx="3" />
            <circle class="machine-detail" cx="100" cy="47" r="9" />
            <path class="machine-detail" d="M61 47h23v7H61z" />
          </svg>`}
      <span class="product-price">${formatAmount(product.price)} $</span>
        <button class="product-buy" type="button" data-product-id="${product.id}" aria-label="Купить: ${product.name}" ${canAfford(product) ? '' : 'disabled'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
      </button>
      <p class="product-description">${product.description}</p>
    </article>
  `).join('');
}

function renderInventory() {
  const filledSlots = inventoryItems
    .filter((item) => Number(inventory[item.id] ?? 0) > 0)
    .map((item) => ({ ...item, count: Number(inventory[item.id]) }));
  const slots = [...filledSlots, ...Array.from({ length: 100 - filledSlots.length }, () => null)];
  inventoryGrid.innerHTML = slots.map((item) => item
    ? `<button class="inventory-slot" type="button" data-item-id="${item.id}" title="${item.name}">
        <i class="inventory-item-icon" style="background:${item.color}" aria-hidden="true"></i>
        <span class="inventory-count">${item.count}</span>
      </button>`
    : '<div class="inventory-slot is-empty" aria-label="Пустая ячейка"><span class="inventory-count"></span></div>')
    .join('');
  renderInventoryDetail();
}

function renderInventoryDetail() {
  const item = inventoryItems.find((entry) => entry.id === selectedInventoryItemId);
  const count = item ? Number(inventory[item.id] ?? 0) : 0;
  if (!item || count <= 0) {
    selectedInventoryItemId = null;
    inventoryDetail.classList.remove('is-visible');
    inventoryDetail.innerHTML = '';
    return;
  }
  inventoryDetail.innerHTML = `
    <i class="inventory-detail-preview" style="background:${item.color}" aria-hidden="true"></i>
    <strong>${item.name}</strong>
    <span>Количество: ${count}</span>
    ${item.sellPrice > 0
      ? `<span>Цена: ${item.sellPrice} $ за шт.</span><button class="inventory-sell" type="button" data-item-id="${item.id}">Продать всё · ${count * item.sellPrice} $</button>`
      : '<span>Материал на складе</span>'}
  `;
  inventoryDetail.classList.add('is-visible');
}

function addToInventory(itemId, amount = 1) {
  inventory[itemId] = Math.max(0, Number(inventory[itemId] ?? 0) + amount);
  renderInventory();
}

function setInventoryOpen(open) {
  inventoryPopover.classList.toggle('is-open', open);
  inventoryButton.classList.toggle('is-active', open);
  inventoryButton.setAttribute('aria-expanded', String(open));
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
  lastPlacedConveyorKey = null;
  placementMenu.classList.remove('is-visible');
  hidePlacementPreview();
  saveGameState();
}

function discardDraftBuildings() {
  const refund = [...draftBuildings.values()].reduce((sum, building) => sum + Number(building.dataset.cost ?? 0), 0);
  draftBuildings.forEach((building) => building.remove());
  draftBuildings.clear();
  if (refund) setMoney(getMoney() + refund);
  finishPlacement();
}

function hidePlacementPreview() {
  buildPreview.classList.remove('is-visible');
  cellPreview.style.display = 'none';
}

function renderBuildPreview() {
  if (!selectedProduct) return hidePlacementPreview();
  buildPreview.innerHTML = selectedProduct.image
    ? `<img src="${selectedProduct.image}" alt="" draggable="false" />`
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

function conveyorMarkup(className = 'conveyor-tile') {
  return `<svg class="${className}" viewBox="0 0 100 100" aria-hidden="true">
    <rect x="0" y="0" width="100" height="100" fill="#151b27" />
    <rect x="0" y="4" width="100" height="8" fill="#f3a51b" />
    <rect x="0" y="88" width="100" height="8" fill="#f3a51b" />
    <rect x="0" y="14" width="100" height="72" fill="#303847" />
    <path d="M21 35 35 50 21 65M44 35 58 50 44 65M67 35 81 50 67 65" fill="none" stroke="#b8c2d1" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter" />
    <path d="M0 1h100M0 99h100" stroke="#080d16" stroke-width="3" />
  </svg>`;
}

function directionForRotation(rotation) {
  return ['right', 'bottom', 'left', 'top'][((Number(rotation) % 360) + 360) % 360 / 90];
}

function oppositeSide(side) {
  return { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[side];
}

function renderConveyor(building) {
  let graphic = building.querySelector('.conveyor-tile');
  if (!graphic) {
    building.innerHTML = conveyorMarkup();
    graphic = building.querySelector('.conveyor-tile');
  }
  graphic.style.transform = `rotate(${Number(building.dataset.rotation ?? 0)}deg)`;
  building.classList.remove('building--conveyor-corner');
}

function refreshConveyors() {
  const allConveyors = [...buildings.values(), ...draftBuildings.values()]
    .filter((building) => building.classList.contains('building--conveyor'));

  allConveyors.forEach((building) => {
    building.dataset.conveyorShape = 'straight';
    renderConveyor(building);
  });
}

function rotationForDirection(from, to) {
  if (to.x > from.x) return 0;
  if (to.y > from.y) return 90;
  if (to.x < from.x) return 180;
  return 270;
}

function setConveyorRotation(building, rotation) {
  building.dataset.rotation = String(rotation);
  renderConveyor(building);
}

function orientPlacedConveyor(building, cell) {
  const previous = lastPlacedConveyorKey
    ? buildings.get(lastPlacedConveyorKey) ?? draftBuildings.get(lastPlacedConveyorKey)
    : null;
  if (previous) {
    const [previousX, previousY] = previous.dataset.cellKey.split(':').map(Number);
    const distance = Math.abs(cell.x - previousX) + Math.abs(cell.y - previousY);
    if (distance === 1) {
      const rotation = rotationForDirection({ x: previousX, y: previousY }, cell);
      setConveyorRotation(previous, rotation);
      setConveyorRotation(building, rotation);
    }
  }
  lastPlacedConveyorKey = building.dataset.cellKey;
}

function createBuilding(product, cell, options = {}) {
  const {
    isDraft = false,
    rotation = 0,
    activeSide = 'bottom',
    level = 1,
    cost = 0,
  } = options;
  const key = `${cell.x}:${cell.y}`;
  const footprint = getFootprint(product);
  const building = document.createElement('div');
  building.className = `building building--${product.id}${isDraft ? ' building--draft' : ''}`;
  if (product.id !== 'conveyor') {
    building.classList.add('building--has-active-side');
    building.dataset.activeSide = activeSide;
    building.dataset.activeState = 'ready';
  }
  building.dataset.productId = product.id;
  building.dataset.cellKey = key;
  building.dataset.rotation = String(rotation);
  building.dataset.level = String(level);
  building.dataset.cost = String(cost);
  if (product.id === 'conveyor') building.dataset.conveyorShape = 'straight';
  building.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  building.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  building.style.width = `${(footprint.width / MAP_SIZE) * 100}%`;
  building.style.height = `${(footprint.height / MAP_SIZE) * 100}%`;
  building.title = product.name;
  building.innerHTML = product.id === 'conveyor'
    ? conveyorMarkup()
    : product.image
      ? `<img src="${product.image}" alt="${product.name}" draggable="false" />`
      : `<span style="background:${product.color}"></span>`;
  const graphic = building.querySelector('img, span');
  if (graphic) graphic.style.transform = `rotate(${rotation + (product.defaultRotation ?? 0)}deg)`;
  world.append(building);
  if (product.id === 'conveyor') renderConveyor(building);
  return building;
}

function clearGameState() {
  movingResources.forEach((resource) => resource.element.remove());
  movingResources.clear();
  buildings.forEach((building) => building.remove());
  draftBuildings.forEach((building) => building.remove());
  buildings.clear();
  draftBuildings.clear();
  selectedProduct = null;
}

function restoreGameState(savedState = null, replaceCurrent = false) {
  let state = savedState;
  if (!state) {
    try {
      state = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }
  if (!state || typeof state !== 'object') return false;
  if (replaceCurrent) clearGameState();

  if (state.inventory && typeof state.inventory === 'object') {
    inventory = Object.fromEntries(Object.entries(state.inventory)
      .map(([itemId, count]) => [itemId, Math.max(0, Number(count) || 0)]));
    inventory.trash ??= 0;
  }

  state.resources?.forEach((savedResource, index) => {
    const resource = document.querySelectorAll('.resource')[index];
    if (!resource || !Number.isFinite(Number(savedResource.value))) return;
    resource.dataset.value = savedResource.value;
    if (savedResource.max != null) resource.dataset.max = savedResource.max;
  });

  state.buildings?.forEach((savedBuilding) => {
    const product = products.find((item) => item.id === savedBuilding.productId);
    const cell = { x: Number(savedBuilding.x), y: Number(savedBuilding.y) };
    if (!product || !Number.isInteger(cell.x) || !Number.isInteger(cell.y)
      || cell.x < 0 || cell.y < 0 || cell.x >= MAP_SIZE || cell.y >= MAP_SIZE || isCellOccupied(cell)) return;
    const building = createBuilding(product, cell, {
      isDraft: Boolean(savedBuilding.isDraft),
      rotation: product.id === 'drill' && savedBuilding.rotationModel !== 2
        ? ([0, 180].includes(Number(savedBuilding.rotation))
          ? 0
          : (Number(savedBuilding.rotation) - (product.defaultRotation ?? 0) + 360) % 360)
        : Number(savedBuilding.rotation) || 0,
      activeSide: savedBuilding.activeSide || 'bottom',
      level: Number(savedBuilding.level) || 1,
      cost: savedBuilding.cost == null ? product.price : Number(savedBuilding.cost) || 0,
    });
    (savedBuilding.isDraft ? draftBuildings : buildings).set(building.dataset.cellKey, building);
    if (product.id === 'crusher') {
      if (savedBuilding.crusherInputId) building.dataset.crusherInputId = savedBuilding.crusherInputId;
      if (savedBuilding.crusherInputCount) building.dataset.crusherInputCount = String(savedBuilding.crusherInputCount);
      if (savedBuilding.crusherNextProcessAt) building.dataset.crusherNextProcessAt = String(savedBuilding.crusherNextProcessAt);
    }
    if (product.id === 'furnace') {
      if (savedBuilding.furnaceInputId) building.dataset.furnaceInputId = savedBuilding.furnaceInputId;
      if (savedBuilding.furnaceInputCount) building.dataset.furnaceInputCount = String(savedBuilding.furnaceInputCount);
      if (savedBuilding.furnaceNextProcessAt) building.dataset.furnaceNextProcessAt = String(savedBuilding.furnaceNextProcessAt);
    }
  });

  selectedProduct = products.find((product) => product.id === state.selectedProductId) ?? null;
  if (draftBuildings.size && !selectedProduct) {
    const firstDraft = draftBuildings.values().next().value;
    selectedProduct = products.find((product) => product.id === firstDraft.dataset.productId) ?? null;
  }
  if (selectedProduct) {
    renderBuildPreview();
    placementName.textContent = selectedProduct.name;
    placementMenu.classList.add('is-visible');
  }
  refreshConveyors();

  state.conveyorItems?.forEach((savedItem) => {
    const resource = getResourceType(savedItem.resourceId);
    const cell = { x: Number(savedItem.x), y: Number(savedItem.y) };
    if (!resource || !isCellOnMap(cell) || !getConfirmedConveyorAt(cell)) return;
    const item = createMovingResource(resource, cell);
    advanceResource(item, cell);
  });
  return true;
}

async function restoreServerGameState() {
  if (window.location.protocol === 'file:') return;
  try {
    const response = await fetch(SAVE_API_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const state = await response.json();
    if (state && Object.keys(state).length) {
      restoreGameState(state, true);
      renderResources();
      renderShop();
      renderInventory();
    } else {
      saveGameState();
    }
  } catch {
    // Local storage remains available when the server cannot be reached.
  }
}

function cellNextTo(cell, side) {
  const offsets = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
  };
  return { x: cell.x + offsets[side].x, y: cell.y + offsets[side].y };
}

function isCellOnMap(cell) {
  return cell.x >= 0 && cell.y >= 0 && cell.x < MAP_SIZE && cell.y < MAP_SIZE;
}

function getConfirmedConveyorAt(cell) {
  const building = buildings.get(`${cell.x}:${cell.y}`);
  return building?.classList.contains('building--conveyor') ? building : null;
}

function getDrillChances(level) {
  const chances = drillChanceTable[Math.min(MAX_DRILL_LEVEL, Math.max(1, level)) - 1];
  return drillResources.map((resource, index) => ({ ...resource, chance: chances[index] ?? 0 }));
}

function getDrillInterval(level) {
  const progress = (Math.min(MAX_DRILL_LEVEL, Math.max(1, level)) - 1) / (MAX_DRILL_LEVEL - 1);
  return 10_000 - progress * 7_700;
}

function formatProductionRate(level) {
  const seconds = getDrillInterval(level) / 1000;
  const label = Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(1);
  return `Добыча: 1 раз в ${label} сек.`;
}

function pickDrillResource(level) {
  const roll = Math.random() * 100;
  let total = 0;
  return getDrillChances(level).find((resource) => {
    total += resource.chance;
    return roll < total;
  }) ?? drillResources[0];
}

function setResourcePosition(resource, cell) {
  resource.element.style.left = `${((cell.x + 0.5) / MAP_SIZE) * 100}%`;
  resource.element.style.top = `${((cell.y + 0.5) / MAP_SIZE) * 100}%`;
}

function createMovingResource(resourceType, cell) {
  const resource = {
    resourceId: resourceType.id,
    cell: { ...cell },
    element: document.createElement('div'),
  };
  resource.element.className = `factory-item factory-item--${resourceType.id}`;
  resource.element.style.background = resourceType.color;
  setResourcePosition(resource, cell);
  world.append(resource.element);
  movingResources.add(resource);
  return resource;
}

function removeResource(resource) {
  resource.element.style.opacity = '0';
  movingResources.delete(resource);
  addToInventory('trash');
  saveGameState();
  window.setTimeout(() => resource.element.remove(), 160);
}

function moveResourceTo(resource, cell, onArrival) {
  setResourcePosition(resource, cell);
  window.setTimeout(() => {
    onArrival();
    saveGameState();
  }, 840);
}

function isConveyorFull(cell, resource) {
  return [...movingResources].filter((item) => item !== resource
    && item.cell?.x === cell.x
    && item.cell?.y === cell.y).length >= MAX_CONVEYOR_ITEMS;
}

function sideToward(from, to) {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'bottom';
  return 'top';
}

function getCrusherResources(level) {
  return drillResources.slice(1, Math.min(drillResources.length, Math.max(1, level) + 1));
}

function getCrusherInterval(level) {
  const progress = (Math.min(MAX_CRUSHER_LEVEL, Math.max(1, level)) - 1) / (MAX_CRUSHER_LEVEL - 1);
  return 2_000 - progress * 1_500;
}

function getFurnaceResources(level) {
  return crushedResources.slice(0, Math.min(crushedResources.length, Math.max(1, level)));
}

function getFurnaceInterval(level) {
  const progress = (Math.min(MAX_FURNACE_LEVEL, Math.max(1, level)) - 1) / (MAX_FURNACE_LEVEL - 1);
  return 2_000 - progress * 1_500;
}

function formatFurnaceRate(level) {
  const seconds = getFurnaceInterval(level) / 1000;
  return `Переплавка: 1 раз в ${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} сек.`;
}

function formatCrusherRate(level) {
  const seconds = getCrusherInterval(level) / 1000;
  return `Переработка: 1 раз в ${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} сек.`;
}

function acceptCrusherResource(resource, crusher, fromCell) {
  const incomingSide = oppositeSide(sideToward(fromCell, {
    x: Number(crusher.dataset.cellKey.split(':')[0]),
    y: Number(crusher.dataset.cellKey.split(':')[1]),
  }));
  const allowedResources = getCrusherResources(Number(crusher.dataset.level ?? 1));
  const accepted = incomingSide !== (crusher.dataset.activeSide ?? 'bottom')
    && allowedResources.some((item) => item.id === resource.resourceId);
  if (!accepted) {
    removeResource(resource);
    return;
  }
  const queuedId = crusher.dataset.crusherInputId;
  if (queuedId && queuedId !== resource.resourceId) {
    removeResource(resource);
    return;
  }
  crusher.dataset.crusherInputId = resource.resourceId;
  crusher.dataset.crusherInputCount = String(Number(crusher.dataset.crusherInputCount ?? 0) + 1);
  resource.element.remove();
  movingResources.delete(resource);
  if (selectedCrusher === crusher) renderCrusherMenu(crusher);
  saveGameState();
}

function acceptFurnaceResource(resource, furnace, fromCell) {
  const [x, y] = furnace.dataset.cellKey.split(':').map(Number);
  const incomingSide = oppositeSide(sideToward(fromCell, { x, y }));
  const allowedResources = getFurnaceResources(Number(furnace.dataset.level ?? 1));
  const accepted = incomingSide !== (furnace.dataset.activeSide ?? 'bottom')
    && allowedResources.some((item) => item.id === resource.resourceId);
  if (!accepted) {
    removeResource(resource);
    return;
  }
  const queuedId = furnace.dataset.furnaceInputId;
  if (queuedId && queuedId !== resource.resourceId) {
    removeResource(resource);
    return;
  }
  furnace.dataset.furnaceInputId = resource.resourceId;
  furnace.dataset.furnaceInputCount = String(Number(furnace.dataset.furnaceInputCount ?? 0) + 1);
  resource.element.remove();
  movingResources.delete(resource);
  if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
  saveGameState();
}

function acceptWarehouseResource(resource, warehouse, fromCell) {
  const [x, y] = warehouse.dataset.cellKey.split(':').map(Number);
  const incomingSide = oppositeSide(sideToward(fromCell, { x, y }));
  if (incomingSide === (warehouse.dataset.activeSide ?? 'bottom')) {
    removeResource(resource);
    return;
  }
  addToInventory(resource.resourceId);
  resource.element.remove();
  movingResources.delete(resource);
  saveGameState();
}

function arriveAtCell(resource, cell) {
  const conveyor = getConfirmedConveyorAt(cell);
  const crusher = buildings.get(`${cell.x}:${cell.y}`);
  if (conveyor && isConveyorFull(cell, resource)) {
    removeResource(resource);
    return;
  }
  if (conveyor) {
    resource.cell = { ...cell };
    advanceResource(resource, cell);
    return;
  }
  if (crusher?.classList.contains('building--crusher')) {
    acceptCrusherResource(resource, crusher, resource.cell);
    return;
  }
  if (crusher?.classList.contains('building--furnace')) {
    acceptFurnaceResource(resource, crusher, resource.cell);
    return;
  }
  if (crusher?.classList.contains('building--warehouse')) {
    acceptWarehouseResource(resource, crusher, resource.cell);
    return;
  }
  removeResource(resource);
}

function advanceResource(resource, cell) {
  const conveyor = getConfirmedConveyorAt(cell);
  if (!conveyor) {
    removeResource(resource);
    return;
  }
  const target = cellNextTo(cell, directionForRotation(conveyor.dataset.rotation ?? 0));
  if (!isCellOnMap(target)) {
    removeResource(resource);
    return;
  }
  moveResourceTo(resource, target, () => arriveAtCell(resource, target));
}

function produceDrillResource(drill) {
  const [x, y] = drill.dataset.cellKey.split(':').map(Number);
  const source = { x, y };
  const target = cellNextTo(source, drill.dataset.activeSide ?? 'bottom');
  const minedResource = pickDrillResource(Number(drill.dataset.level ?? 1));
  const resource = createMovingResource(minedResource, source);
  window.requestAnimationFrame(() => {
    if (!isCellOnMap(target)) {
      removeResource(resource);
      return;
    }
    moveResourceTo(resource, target, () => arriveAtCell(resource, target));
  });
}

function runCrushers() {
  const now = Date.now();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--crusher'))
    .forEach((crusher) => {
      const count = Number(crusher.dataset.crusherInputCount ?? 0);
      const inputId = crusher.dataset.crusherInputId;
      if (!inputId || count <= 0) return;
      const interval = getCrusherInterval(Number(crusher.dataset.level ?? 1));
      const nextProcessAt = Number(crusher.dataset.crusherNextProcessAt);
      if (!nextProcessAt) {
        crusher.dataset.crusherNextProcessAt = String(now + interval);
        if (selectedCrusher === crusher) renderCrusherMenu(crusher);
        return;
      }
      if (now < nextProcessAt) {
        if (selectedCrusher === crusher) renderCrusherMenu(crusher);
        return;
      }
      const output = crushedResources.find((resource) => resource.id === `${inputId}-powder`);
      crusher.dataset.crusherInputCount = String(count - 1);
      if (count <= 1) delete crusher.dataset.crusherInputId;
      delete crusher.dataset.crusherNextProcessAt;
      if (output) {
        const [x, y] = crusher.dataset.cellKey.split(':').map(Number);
        const source = { x, y };
        const target = cellNextTo(source, crusher.dataset.activeSide ?? 'bottom');
        const resource = createMovingResource(output, source);
        window.requestAnimationFrame(() => {
          if (!isCellOnMap(target)) return removeResource(resource);
          moveResourceTo(resource, target, () => arriveAtCell(resource, target));
        });
      }
      if (selectedCrusher === crusher) renderCrusherMenu(crusher);
      saveGameState();
    });
}

function runFurnaces() {
  const now = Date.now();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--furnace'))
    .forEach((furnace) => {
      const count = Number(furnace.dataset.furnaceInputCount ?? 0);
      const inputId = furnace.dataset.furnaceInputId;
      if (!inputId || count <= 0) return;
      const interval = getFurnaceInterval(Number(furnace.dataset.level ?? 1));
      const nextProcessAt = Number(furnace.dataset.furnaceNextProcessAt);
      if (!nextProcessAt) {
        furnace.dataset.furnaceNextProcessAt = String(now + interval);
        if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
        return;
      }
      if (now < nextProcessAt) {
        if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
        return;
      }
      const outputId = inputId === 'diamond-powder' ? 'diamond' : inputId.replace('-powder', '-ingot');
      const output = smeltedResources.find((resource) => resource.id === outputId);
      furnace.dataset.furnaceInputCount = String(count - 1);
      if (count <= 1) delete furnace.dataset.furnaceInputId;
      delete furnace.dataset.furnaceNextProcessAt;
      if (output) {
        const [x, y] = furnace.dataset.cellKey.split(':').map(Number);
        const source = { x, y };
        const target = cellNextTo(source, furnace.dataset.activeSide ?? 'bottom');
        [0, 1].forEach(() => {
          const resource = createMovingResource(output, source);
          window.requestAnimationFrame(() => {
            if (!isCellOnMap(target)) return removeResource(resource);
            moveResourceTo(resource, target, () => arriveAtCell(resource, target));
          });
        });
      }
      if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
      saveGameState();
    });
}

function runDrills() {
  const now = Date.now();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--drill'))
    .forEach((drill) => {
      const interval = getDrillInterval(Number(drill.dataset.level ?? 1));
      const nextProductionAt = Number(drill.dataset.nextProductionAt);
      if (!nextProductionAt) {
        drill.dataset.nextProductionAt = String(now + interval);
        return;
      }
      if (now >= nextProductionAt) {
        produceDrillResource(drill);
        drill.dataset.nextProductionAt = String(now + interval);
      }
    });
}

function openDrillMenu(drill) {
  closeCrusherMenu();
  closeFurnaceMenu();
  selectedDrill = drill;
  const level = Number(drill.dataset.level ?? 1);
  machineLevel.textContent = `Уровень ${level} из ${MAX_DRILL_LEVEL}`;
  machineRate.textContent = formatProductionRate(level);
  machineDropList.innerHTML = getDrillChances(level).map((resource) => `
    <div class="machine-drop">
      <i class="resource-swatch" style="background:${resource.color}" aria-hidden="true"></i>
      <span>${resource.name}</span>
      <b>${resource.chance}%</b>
    </div>
  `).join('');
  machineUpgrade.textContent = level >= MAX_DRILL_LEVEL
    ? 'Максимальный уровень'
    : `Улучшить · ${DRILL_UPGRADE_COST} $`;
  machineUpgrade.disabled = level >= MAX_DRILL_LEVEL || getMoney() < DRILL_UPGRADE_COST;
  machineMenu.classList.add('is-visible');
}

function closeMachineMenu() {
  machineMenu.classList.remove('is-visible');
  selectedDrill = null;
}

function renderCrusherMenu(crusher) {
  const level = Number(crusher.dataset.level ?? 1);
  const inputId = crusher.dataset.crusherInputId;
  const input = getResourceType(inputId);
  const output = input ? crushedResources.find((resource) => resource.id === `${input.id}-powder`) : null;
  const count = Number(crusher.dataset.crusherInputCount ?? 0);
  const interval = getCrusherInterval(level);
  const nextProcessAt = Number(crusher.dataset.crusherNextProcessAt ?? 0);
  const progress = nextProcessAt ? Math.max(0, Math.min(1, 1 - ((nextProcessAt - Date.now()) / interval))) : 0;
  crusherLevel.textContent = `Уровень ${level} из ${MAX_CRUSHER_LEVEL}`;
  crusherRate.textContent = formatCrusherRate(level);
  crusherInputIcon.style.background = input?.color ?? '#dfe4e8';
  crusherInputName.textContent = input?.name ?? 'Нет руды';
  crusherInputCount.textContent = String(count);
  crusherOutputIcon.style.background = output?.color ?? '#dfe4e8';
  crusherOutputName.textContent = output?.name ?? '—';
  crusherOutputCount.textContent = output ? String(count * 2) : '0';
  crusherArrowProgress.style.width = `${progress * 100}%`;
  const available = getCrusherResources(level).map((resource) => resource.name).join(', ');
  crusherAvailable.textContent = available ? `Принимает: ${available}` : 'На этом уровне ещё не принимает руду.';
  crusherUpgrade.textContent = level >= MAX_CRUSHER_LEVEL
    ? 'Максимальный уровень'
    : `Улучшить · ${CRUSHER_UPGRADE_COST} $`;
  crusherUpgrade.disabled = level >= MAX_CRUSHER_LEVEL || getMoney() < CRUSHER_UPGRADE_COST;
}

function openCrusherMenu(crusher) {
  closeMachineMenu();
  closeFurnaceMenu();
  selectedCrusher = crusher;
  renderCrusherMenu(crusher);
  crusherMenu.classList.add('is-visible');
}

function closeCrusherMenu() {
  crusherMenu.classList.remove('is-visible');
  selectedCrusher = null;
}

function renderFurnaceMenu(furnace) {
  const level = Number(furnace.dataset.level ?? 1);
  const inputId = furnace.dataset.furnaceInputId;
  const input = getResourceType(inputId);
  const outputId = inputId === 'diamond-powder' ? 'diamond' : inputId?.replace('-powder', '-ingot');
  const output = smeltedResources.find((resource) => resource.id === outputId);
  const count = Number(furnace.dataset.furnaceInputCount ?? 0);
  const interval = getFurnaceInterval(level);
  const nextProcessAt = Number(furnace.dataset.furnaceNextProcessAt ?? 0);
  const progress = nextProcessAt ? Math.max(0, Math.min(1, 1 - ((nextProcessAt - Date.now()) / interval))) : 0;
  furnaceLevel.textContent = `Уровень ${level} из ${MAX_FURNACE_LEVEL}`;
  furnaceRate.textContent = formatFurnaceRate(level);
  furnaceInputIcon.style.background = input?.color ?? '#dfe4e8';
  furnaceInputName.textContent = input?.name ?? 'Нет порошка';
  furnaceInputCount.textContent = String(count);
  furnaceOutputIcon.style.background = output?.color ?? '#dfe4e8';
  furnaceOutputName.textContent = output?.name ?? '—';
  furnaceOutputCount.textContent = output ? String(count) : '0';
  furnaceArrowProgress.style.width = `${progress * 100}%`;
  const available = getFurnaceResources(level).map((resource) => resource.name).join(', ');
  furnaceAvailable.textContent = available ? `Принимает: ${available}` : 'На этом уровне ещё не принимает порошок.';
  furnaceUpgrade.textContent = level >= MAX_FURNACE_LEVEL
    ? 'Максимальный уровень'
    : `Улучшить · ${FURNACE_UPGRADE_COST} $`;
  furnaceUpgrade.disabled = level >= MAX_FURNACE_LEVEL || getMoney() < FURNACE_UPGRADE_COST;
}

function openFurnaceMenu(furnace) {
  closeMachineMenu();
  closeCrusherMenu();
  selectedFurnace = furnace;
  renderFurnaceMenu(furnace);
  furnaceMenu.classList.add('is-visible');
}

function closeFurnaceMenu() {
  furnaceMenu.classList.remove('is-visible');
  selectedFurnace = null;
}

function placeBuilding(cell) {
  const key = `${cell.x}:${cell.y}`;
  if (!selectedProduct || isCellOccupied(cell) || !canAfford(selectedProduct)) return;
  setMoney(getMoney() - selectedProduct.price);
  const building = createBuilding(selectedProduct, cell, { isDraft: true, cost: selectedProduct.price });
  draftBuildings.set(key, building);
  if (selectedProduct.id === 'conveyor') orientPlacedConveyor(building, cell);
  refreshConveyors();
  placementName.textContent = selectedProduct.name;
  placementMenu.classList.add('is-visible');
  saveGameState();
}

function setDeleteMode(enabled) {
  if (enabled) {
    setMoveMode(false);
    setRotateMode(false);
  }
  deleteMode = enabled;
  if (!deleteMode) {
    buildingsMarkedForDeletion.forEach((building) => building.classList.remove('building--delete-selected'));
    buildingsMarkedForDeletion.clear();
  }
  map.classList.toggle('is-delete-mode', deleteMode);
  if (deleteMode) {
    placementName.textContent = 'Удаление';
    placementMenu.classList.add('is-visible');
  }
}

function toggleBuildingDeletion(building) {
  if (buildingsMarkedForDeletion.has(building)) {
    buildingsMarkedForDeletion.delete(building);
    building.classList.remove('building--delete-selected');
  } else {
    buildingsMarkedForDeletion.add(building);
    building.classList.add('building--delete-selected');
  }
  placementName.textContent = buildingsMarkedForDeletion.size
    ? `Удаление: ${buildingsMarkedForDeletion.size}`
    : 'Удаление';
}

function confirmDeletion() {
  const refund = [...buildingsMarkedForDeletion].reduce(
    (sum, building) => sum + Number(building.dataset.cost ?? 0) * 0.5,
    0,
  );
  buildingsMarkedForDeletion.forEach((building) => {
    buildings.delete(building.dataset.cellKey);
    building.remove();
  });
  if (refund) setMoney(getMoney() + refund);
  setDeleteMode(false);
  placementMenu.classList.remove('is-visible');
  saveGameState();
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
  const product = products.find((item) => item.id === building.dataset.productId);
  if (graphic) graphic.style.transform = `rotate(${nextRotation + (product?.defaultRotation ?? 0)}deg)`;

  if (building.classList.contains('building--has-active-side')) {
    const sides = ['bottom', 'left', 'top', 'right'];
    building.dataset.activeSide = sides[nextRotation / 90];
  }

  if (building.classList.contains('building--conveyor')) refreshConveyors();
  saveGameState();
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
  saveGameState();
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
  if (deleteMode && building && !building.classList.contains('building--draft')) {
    toggleBuildingDeletion(building);
    return;
  }
  if (rotateMode && building && !building.classList.contains('building--draft')) {
    rotateBuilding(building);
    return;
  }
  if (moveMode && building && !building.classList.contains('building--draft')) {
    selectBuildingForMove(building);
    return;
  }
  if (building?.classList.contains('building--drill') && !selectedProduct && !draftBuildings.size) {
    openDrillMenu(building);
    return;
  }
  if (building?.classList.contains('building--crusher') && !selectedProduct && !draftBuildings.size) {
    openCrusherMenu(building);
    return;
  }
  if (building?.classList.contains('building--furnace') && !selectedProduct && !draftBuildings.size) {
    openFurnaceMenu(building);
    return;
  }
  if (building?.classList.contains('building--warehouse') && !selectedProduct && !draftBuildings.size) {
    setShopOpen(false);
    setInventoryOpen(true);
    return;
  }
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
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

map.addEventListener('pointerleave', () => {
  if (!movingBuilding) hidePlacementPreview();
});

function stopPanning(event) {
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
map.addEventListener('dragstart', (event) => event.preventDefault());
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

restoreGameState();
renderResources();
renderShop();
renderInventory();
restoreServerGameState();
window.setInterval(runDrills, 250);
window.setInterval(runCrushers, 100);
window.setInterval(runFurnaces, 100);

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

inventoryButton.addEventListener('click', () => {
  setShopOpen(false);
  setInventoryOpen(!inventoryPopover.classList.contains('is-open'));
});

inventoryGrid.addEventListener('click', (event) => {
  const slot = event.target.closest('[data-item-id]');
  if (!slot) return;
  selectedInventoryItemId = slot.dataset.itemId;
  renderInventoryDetail();
});

inventoryDetail.addEventListener('click', (event) => {
  const sellButton = event.target.closest('[data-item-id]');
  if (!sellButton) return;
  const item = inventoryItems.find((entry) => entry.id === sellButton.dataset.itemId);
  const count = item ? Number(inventory[item.id] ?? 0) : 0;
  if (!item || count <= 0) return;
  inventory[item.id] = 0;
  selectedInventoryItemId = null;
  setMoney(getMoney() + count * item.sellPrice);
  renderInventory();
  saveGameState();
});

machineUpgrade.addEventListener('click', () => {
  if (!selectedDrill || !buildings.has(selectedDrill.dataset.cellKey)
    || Number(selectedDrill.dataset.level ?? 1) >= MAX_DRILL_LEVEL
    || getMoney() < DRILL_UPGRADE_COST) return;
  selectedDrill.dataset.level = String(Number(selectedDrill.dataset.level ?? 1) + 1);
  delete selectedDrill.dataset.nextProductionAt;
  setMoney(getMoney() - DRILL_UPGRADE_COST);
  openDrillMenu(selectedDrill);
  saveGameState();
});

crusherUpgrade.addEventListener('click', () => {
  if (!selectedCrusher || !buildings.has(selectedCrusher.dataset.cellKey)
    || Number(selectedCrusher.dataset.level ?? 1) >= MAX_CRUSHER_LEVEL
    || getMoney() < CRUSHER_UPGRADE_COST) return;
  selectedCrusher.dataset.level = String(Number(selectedCrusher.dataset.level ?? 1) + 1);
  setMoney(getMoney() - CRUSHER_UPGRADE_COST);
  renderCrusherMenu(selectedCrusher);
  saveGameState();
});

furnaceUpgrade.addEventListener('click', () => {
  if (!selectedFurnace || !buildings.has(selectedFurnace.dataset.cellKey)
    || Number(selectedFurnace.dataset.level ?? 1) >= MAX_FURNACE_LEVEL
    || getMoney() < FURNACE_UPGRADE_COST) return;
  selectedFurnace.dataset.level = String(Number(selectedFurnace.dataset.level ?? 1) + 1);
  setMoney(getMoney() - FURNACE_UPGRADE_COST);
  renderFurnaceMenu(selectedFurnace);
  saveGameState();
});

shopGrid.addEventListener('click', (event) => {
  const buyButton = event.target.closest('.product-buy');
  if (!buyButton) return;
  selectedProduct = products.find((product) => product.id === buyButton.dataset.productId) ?? null;
  if (!selectedProduct || !canAfford(selectedProduct)) return;
  setDeleteMode(false);
  lastPlacedConveyorKey = null;
  setMoveMode(false);
  setRotateMode(false);
  renderBuildPreview();
  placementName.textContent = selectedProduct?.name ?? '';
  placementMenu.classList.toggle('is-visible', Boolean(selectedProduct));
  setShopOpen(false);
  saveGameState();
});

cancelButton.addEventListener('click', () => {
  setShopOpen(false);
  setInventoryOpen(false);
  if (deleteMode) {
    setDeleteMode(false);
    placementMenu.classList.remove('is-visible');
  } else if (selectedProduct || draftBuildings.size) {
    discardDraftBuildings();
  } else {
    setDeleteMode(true);
  }
});

confirmPlacement.addEventListener('click', () => {
  if (deleteMode) {
    confirmDeletion();
    return;
  }
  draftBuildings.forEach((building, key) => {
    building.classList.remove('building--draft');
    buildings.set(key, building);
  });
  draftBuildings.clear();
  refreshConveyors();
  finishPlacement();
});

discardPlacement.addEventListener('click', () => {
  if (deleteMode) {
    setDeleteMode(false);
    placementMenu.classList.remove('is-visible');
  } else {
    discardDraftBuildings();
  }
});

document.addEventListener('pointerdown', (event) => {
  if (!shopPopover.classList.contains('is-open')) return;
  if (!shopPopover.contains(event.target) && !shopButton.contains(event.target)) setShopOpen(false);
});
