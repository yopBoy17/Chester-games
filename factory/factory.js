import { FACTORY_CONFIG } from './game/config.js';
import { FACTORY_BALANCE } from './game/balance.js';
import { cellNextTo, directionForRotation, oppositeSide, sideToward } from './game/conveyor.js';
import { formatDrillRate, getDrillChances as calculateDrillChances, getDrillInterval as calculateDrillInterval, pickDrillResource as pickCalculatedDrillResource } from './game/machines/drill.js';
import { formatProcessingRate, getCrusherResources as calculateCrusherResources, getFurnaceResources as calculateFurnaceResources, getProcessingInterval } from './game/machines/processing.js';
import { bearingResources, crushedResources, drillResources, gearResources, getResourceType, pressedResources, rodResources, smeltedResources } from './game/resources.js';
import { createPhaserRenderer } from './game/phaser-renderer.js';
import { createInventoryController } from './game/inventory/inventory.js';
import { createWarehouseOutput } from './game/inventory/warehouse-output.js';
import { createEnergyController } from './game/energy/energy.js';

const map = document.querySelector('.map');
const gameLoader = document.querySelector('#gameLoader');
const world = document.querySelector('.world');
const phaserStage = document.querySelector('#phaserStage');
const shopButton = document.querySelector('#shopButton');
const moveButton = document.querySelector('#moveButton');
const rotateButton = document.querySelector('#rotateButton');
const cancelButton = document.querySelector('#cancelButton');
const inventoryButton = document.querySelector('#inventoryButton');
const shopPopover = document.querySelector('#shopPopover');
const shopGrid = document.querySelector('.shop-grid');
const buildPreview = document.querySelector('#buildPreview');
const placementMenu = document.querySelector('#placementMenu');
const placementName = document.querySelector('.placement-name');
const machineMenu = document.querySelector('#machineMenu');
const machineLevel = document.querySelector('.machine-level');
const machineRate = document.querySelector('.machine-rate');
const machineToggle = document.querySelector('#machineToggle');
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
const furnaceUpgrade = document.querySelector('#furnaceUpgrade');
const pressMenu = document.querySelector('#pressMenu');
const pressLevel = document.querySelector('.press-level'), pressRate = document.querySelector('.press-rate'), pressInputIcon = document.querySelector('.press-input-icon'), pressOutputIcon = document.querySelector('.press-output-icon'), pressInputName = document.querySelector('.press-input-name'), pressOutputName = document.querySelector('.press-output-name'), pressInputCount = document.querySelector('.press-input-count'), pressOutputCount = document.querySelector('.press-output-count'), pressUpgrade = document.querySelector('#pressUpgrade'), pressArrowProgress = document.querySelector('.press-arrow > span');
const metalFormerMenu = document.querySelector('#metalFormerMenu');
const metalFormerLevel = document.querySelector('.metal-former-level');
const metalFormerRate = document.querySelector('.metal-former-rate');
const metalFormerInputIcon = document.querySelector('.metal-former-input-icon');
const metalFormerInputName = document.querySelector('.metal-former-input-name');
const metalFormerInputCount = document.querySelector('.metal-former-input-count');
const metalFormerOutputIcon = document.querySelector('.metal-former-output-icon');
const metalFormerOutputName = document.querySelector('.metal-former-output-name');
const metalFormerOutputCount = document.querySelector('.metal-former-output-count');
const metalFormerArrowProgress = document.querySelector('.metal-former-arrow > span');
const metalFormerRecipeButton = document.querySelector('#metalFormerRecipeButton');
const metalFormerRecipes = document.querySelector('#metalFormerRecipes');
const metalFormerUpgrade = document.querySelector('#metalFormerUpgrade');
const recipeMachineMenu = document.querySelector('#recipeMachineMenu');
const recipeMachineTitle = document.querySelector('.recipe-machine-title');
const recipeMachineLevel = document.querySelector('.recipe-machine-level');
const recipeMachineRate = document.querySelector('.recipe-machine-rate');
const recipeMachineRecipeButton = document.querySelector('#recipeMachineRecipeButton');
const recipeMachineRecipes = document.querySelector('#recipeMachineRecipes');
const recipeMachineUpgrade = document.querySelector('#recipeMachineUpgrade');
const generatorMenu = document.querySelector('#generatorMenu');
const generatorLevel = document.querySelector('.generator-level');
const generatorOutput = document.querySelector('.generator-output');
const generatorOutputValue = document.querySelector('.generator-output-value');
const generatorBurnTime = document.querySelector('.generator-burn-time');
const generatorCoalCount = document.querySelector('.generator-coal-count');
const generatorFlame = document.querySelector('.generator-flame');
const generatorFlameProgress = document.querySelector('.generator-flame-progress');
const generatorUpgrade = document.querySelector('#generatorUpgrade');
const filterMenu = document.querySelector('#filterMenu');
const filterModes = document.querySelector('#filterModes');
const filterItems = document.querySelector('#filterItems');
const filterPicker = document.querySelector('#filterPicker');
const filterPickerTabs = document.querySelector('#filterPickerTabs');
const distributorMenu = document.querySelector('#distributorMenu');
const distributorModes = document.querySelector('#distributorModes');
const distributorGreenCount = document.querySelector('#distributorGreenCount');
const distributorRedCount = document.querySelector('#distributorRedCount');
const distributorBlueCount = document.querySelector('#distributorBlueCount');
const distributorBlueRow = document.querySelector('#distributorBlueRow');
const confirmPlacement = document.querySelector('#confirmPlacement');
const discardPlacement = document.querySelector('#discardPlacement');
const BASE_CELL_SIZE = FACTORY_CONFIG.cellSize;
const MAP_SIZE = FACTORY_CONFIG.mapSize;
const MIN_SCALE = FACTORY_CONFIG.minScale;
const MAX_SCALE = FACTORY_CONFIG.maxScale;
const WORLD_SIZE = BASE_CELL_SIZE * MAP_SIZE;
world.style.width = `${WORLD_SIZE}px`;
world.style.height = `${WORLD_SIZE}px`;
world.style.backgroundSize = `${BASE_CELL_SIZE}px ${BASE_CELL_SIZE}px`;
const STORAGE_KEY = 'chester-games.factory.save.v1';
const SAVE_API_URL = new URL('api/save', window.location.href).href;
localStorage.removeItem(STORAGE_KEY);

function getFittedCameraScale() {
  if (window.innerWidth > 620 && window.innerHeight > 600) return 1;
  const availableWidth = map.clientWidth || window.innerWidth;
  const availableHeight = map.clientHeight || Math.max(1, window.innerHeight - 132);
  return Math.min(1, Math.max(MIN_SCALE, Math.min(availableWidth, availableHeight) / WORLD_SIZE));
}

const camera = { x: 0, y: 0, scale: getFittedCameraScale() };
const activePointers = new Map();
let pointerStart = null;
let pinchStart = null;
let cameraScaleWasAdjusted = false;
let selectedProduct = null;
let moveMode = false;
let rotateMode = false;
let deleteMode = false;
let lastPlacedConveyorKey = null;
let selectedDrill = null;
let selectedCrusher = null;
let selectedFurnace = null;
let selectedPress = null;
let selectedMetalFormer = null;
let selectedMetalFormerRecipeType = null;
let selectedRecipeMachine = null;
let selectedRecipeMachineCategory = null;
let selectedGenerator = null;

function isCameraGestureActive() {
  return Boolean(pointerStart || pinchStart);
}

let selectedFilter = null;
let selectedFilterSlot = null;
let filterPickerTab = 'all';
let selectedDistributor = null;
let movingBuilding = null;
let movingOriginKey = null;
let selectedBuildingForMove = null;
let selectedBuildingOriginKey = null;
const buildings = new Map();
const draftBuildings = new Map();
const buildingsMarkedForDeletion = new Set();
const movingResources = new Set();
const { machines, conveyors, products: productPrices, sales } = FACTORY_BALANCE;
const DRILL_UPGRADE_COEFFICIENT = machines.drillUpgradeCoefficient;
const MAX_DRILL_LEVEL = machines.maxLevel;
const CRUSHER_UPGRADE_COEFFICIENT = machines.crusherUpgradeCoefficient;
const MAX_CRUSHER_LEVEL = machines.maxLevel;
const FURNACE_UPGRADE_COEFFICIENT = machines.furnaceUpgradeCoefficient;
const PRESS_UPGRADE_COEFFICIENT = machines.pressUpgradeCoefficient;
const METAL_FORMER_PROCESS_MS = machines.metalFormerProcessMs;
const METAL_FORMER_UPGRADE_COEFFICIENT = machines.metalFormerUpgradeCoefficient;
const MAX_METAL_FORMER_LEVEL = machines.maxLevel;
const GENERATOR_UPGRADE_COEFFICIENT = machines.generatorUpgradeCoefficient;
const RECIPE_MACHINE_DEFINITIONS = {
  former: {
    name: 'Формовщик',
    processMs: machines.formerProcessMs,
    upgradeCoefficient: machines.formerUpgradeCoefficient,
    categories: [
      { id: 'wire', name: 'Провода' },
      { id: 'profiles', name: 'Профили' },
    ],
  },
  'component-assembler': {
    name: 'Сборщик компонентов',
    processMs: machines.componentAssemblerProcessMs,
    upgradeCoefficient: machines.componentAssemblerUpgradeCoefficient,
    categories: [
      { id: 'motor', name: 'Двигатели' },
      { id: 'electronics', name: 'Электрокомпоненты' },
      { id: 'chip', name: 'Микросхемы' },
      { id: 'manipulator', name: 'Манипуляторы' },
    ],
  },
};
const MAX_FURNACE_LEVEL = machines.maxLevel;
const MAX_CONVEYOR_ITEMS = conveyors.maxItems;
const CONVEYOR_TRAVEL_MS = conveyors.travelMs;
const CONVEYOR_TURN_PAUSE_MS = conveyors.turnPauseMs;
let saveSyncTimer = null;

const energyController = createEnergyController({
  greenResource: document.querySelector('.resource--green'),
  redResource: document.querySelector('.resource--red'),
  storageResource: document.querySelector('.resource--yellow'),
  buildings,
  formatAmount,
  generatorBaseBurnMs: machines.generatorBaseBurnMs,
  generatorBurnReductionMs: machines.generatorBurnReductionMs,
});

const inventoryController = createInventoryController({
  button: inventoryButton,
  popover: document.querySelector('#inventoryPopover'),
  title: document.querySelector('#inventoryPopover .inventory-header strong'),
  grid: document.querySelector('#inventoryGrid'),
  detail: document.querySelector('#inventoryDetail'),
  tabs: document.querySelector('#inventoryTabs'),
  resourceGroups: {
    ores: drillResources,
    powders: crushedResources,
    ingots: smeltedResources,
    components: [...pressedResources, ...gearResources, ...bearingResources, ...rodResources],
  },
  sales,
  formatAmount,
  getMoney,
  setMoney,
  saveGameState,
  closeShop: () => setShopOpen(false),
  enqueueWarehouseEmission: (...args) => warehouseOutput.enqueue(...args),
  isWarehouseAvailable: (warehouse) => buildings.get(warehouse.dataset.cellKey) === warehouse,
});
const inventoryItems = inventoryController.items;
const warehouseOutput = createWarehouseOutput({
  isWarehouseAvailable: (warehouse) => buildings.get(warehouse.dataset.cellKey) === warehouse,
  getInventoryCount: inventoryController.getCount,
  removeInventoryItem: (itemId) => inventoryController.add(itemId, -1),
  getInventoryItem: (itemId) => inventoryItems.find((item) => item.id === itemId),
  isCellOnMap,
  getConveyorAt: getConfirmedConveyorAt,
  isConveyorFull,
  emitResource,
  saveGameState,
});

const renderInventory = () => inventoryController.render();
const addToInventory = (itemId, amount = 1) => inventoryController.add(itemId, amount);
const setInventoryOpen = (open, source = 'panel', warehouse = null) => inventoryController.setOpen(open, source, warehouse);

const cellPreview = document.createElement('div');
cellPreview.className = 'cell-preview';
world.append(cellPreview);

const products = [
  { id: 'drill', name: 'Бур', price: productPrices.drill, color: '#7194ae', image: 'assets/products/drill.png', footprint: { width: 1, height: 1 }, defaultRotation: 180, description: 'Добывает базовую руду.' },
  { id: 'conveyor', name: 'Конвейер', price: productPrices.conveyor, color: '#77838d', image: 'assets/products/conveyor.png', description: 'Перевозит предметы между машинами.' },
  { id: 'generator', name: 'Генератор', price: productPrices.generator, color: '#d2a244', image: 'assets/products/generator.png', description: 'Создаёт энергию для фабрики.' },
  { id: 'distributor', name: 'Распределитель', price: productPrices.distributor, color: '#87929a', image: 'assets/products/distributors/distributor-mode-1.png', description: 'Делит поток между цветными выходами.' },
  { id: 'filter', name: 'Фильтр', price: productPrices.filter, color: '#f4f5f6', image: 'assets/products/filters/filter-mode-1.png', description: 'Разделяет ресурсы на два выхода.' },
  { id: 'warehouse', name: 'Склад', price: productPrices.warehouse, color: '#a88054', image: 'assets/products/warehouse.png', description: 'Хранит готовую продукцию.' },
  { id: 'furnace', name: 'Печь', price: productPrices.furnace, color: '#e18550', image: 'assets/products/furnace.png', description: 'Переплавляет руду в слитки.' },
  { id: 'crusher', name: 'Дробилка', price: productPrices.crusher, color: '#c45e64', image: 'assets/products/crusher.png', description: 'Измельчает сырьё для обработки.' },
  // { id: 'assembler', name: 'Завод', price: productPrices.assembler, color: '#9b79c8', image: 'assets/products/factory-plant.png', description: 'Собирает детали по рецепту.' },
  { id: 'press', name: 'Пресс', price: productPrices.press, color: '#527ca5', image: 'assets/products/press.png', description: 'Формирует прочные заготовки.' },
  { id: 'metal-former', name: 'Металлоформовщик', price: productPrices.metalFormer, color: '#6b7b89', image: 'assets/products/metal-former.png', description: 'Создаёт детали из металлических слитков.' },
  { id: 'former', name: 'Формовщик', price: productPrices.former, color: '#60758a', image: 'assets/products/former.png', description: 'Формует детали по выбранному рецепту.' },
  { id: 'component-assembler', name: 'Сборщик компонентов', price: productPrices.componentAssembler, color: '#596d83', image: 'assets/products/component-assembler.png', description: 'Собирает компоненты по выбранному рецепту.' },
  // { id: 'lab', name: 'Лаборатория', price: productPrices.lab, color: '#62a99a', description: 'Открывает новые технологии.' },
  // { id: 'terminal', name: 'Терминал', price: productPrices.terminal, color: '#596f9f', description: 'Автоматизирует работу цеха.' },
];

const phaserRenderer = createPhaserRenderer({
  parent: phaserStage,
  world,
  products,
  resourceTypes: [...inventoryItems, ...drillResources, ...crushedResources, ...smeltedResources, ...pressedResources, ...gearResources, ...bearingResources, ...rodResources],
  getBuildings: () => new Map([...buildings, ...draftBuildings]),
  getMovingResources: () => movingResources,
  getCamera: () => camera,
  isCameraMoving: isCameraGestureActive,
  onReady: () => gameLoader.classList.add('is-hidden'),
});
world.classList.add('is-phaser-backed');
document.body.classList.add('is-phaser-enabled');

function formatAmount(value) {
  const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  if (rounded < 1000) return String(rounded);
  const shortened = (rounded / 1000).toFixed(1);
  return `${shortened}к`;
}

function renderCompactUpgrade(button, level, maxLevel, cost, deviceName) {
  const isMaxLevel = level >= maxLevel;
  button.querySelector('span').textContent = isMaxLevel ? 'Макс.' : `${formatAmount(cost)} $`;
  button.setAttribute('aria-label', isMaxLevel
    ? `Максимальный уровень: ${deviceName}`
    : `Улучшить ${deviceName} за ${formatAmount(cost)} долларов`);
  button.disabled = isMaxLevel || getMoney() < cost;
}

function renderResources() {
  energyController.render();
  document.querySelectorAll('.resource:not(.resource--green):not(.resource--red):not(.resource--yellow)').forEach((resource) => {
    const max = resource.dataset.max;
    const rawValue = Number(resource.dataset.value);
    const value = max
      ? Math.min(Number(max), Math.max(0, Number.isFinite(rawValue) ? rawValue : 0))
      : rawValue;
    if (max) resource.dataset.value = String(value);
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
  getMoneyResource().dataset.value = String(Math.max(0, Math.round((Number(value) + Number.EPSILON) * 100) / 100));
  renderResources();
  renderShop();
}

function canAfford(product) {
  return getMoney() >= product.price;
}

function getUpgradeCost(building, coefficient) {
  const product = products.find((item) => item.id === building.dataset.productId);
  const level = Number(building.dataset.level ?? 1);
  return (product?.price ?? 0) * (level + 1) * coefficient;
}

function saveGameState({ logServerSave = false } = {}) {
  renderResources();
  const serializeBuilding = (building, isDraft) => {
    const [x, y] = building.dataset.cellKey.split(':').map(Number);
    return {
      productId: building.dataset.productId,
      x,
      y,
      rotation: Number(building.dataset.rotation ?? 0),
      rotationModel: 2,
      activeSide: building.dataset.activeSide,
      isEnabled: building.dataset.isEnabled !== 'false',
      level: Number(building.dataset.level ?? 1),
      cost: Number(building.dataset.cost ?? 0),
      crusherInputId: building.dataset.crusherInputId ?? null,
      crusherInputCount: Number(building.dataset.crusherInputCount ?? 0),
      crusherNextProcessAt: Number(building.dataset.crusherNextProcessAt ?? 0),
      furnaceInputId: building.dataset.furnaceInputId ?? null,
      furnaceInputCount: Number(building.dataset.furnaceInputCount ?? 0),
      furnaceNextProcessAt: Number(building.dataset.furnaceNextProcessAt ?? 0),
      pressInputId: building.dataset.pressInputId ?? null,
      pressInputCount: Number(building.dataset.pressInputCount ?? 0),
      pressNextProcessAt: Number(building.dataset.pressNextProcessAt ?? 0),
      metalFormerRecipeId: building.dataset.metalFormerRecipeId ?? null,
      metalFormerInputCount: Number(building.dataset.metalFormerInputCount ?? 0),
      metalFormerNextProcessAt: Number(building.dataset.metalFormerNextProcessAt ?? 0),
      generatorCoalCount: Number(building.dataset.generatorCoalCount ?? 0),
      generatorBurnEndsAt: Number(building.dataset.generatorBurnEndsAt ?? 0),
      generatorIsActive: building.dataset.generatorIsActive !== 'false',
      generatorPausedBurnMs: Number(building.dataset.generatorPausedBurnMs ?? 0),
      filterMode: Number(building.dataset.filterMode ?? 1),
      filterItemIds: building.dataset.filterItemIds ?? '',
      distributorMode: Number(building.dataset.distributorMode ?? 1),
      distributorGreenCount: Number(building.dataset.distributorGreenCount ?? 1),
      distributorRedCount: Number(building.dataset.distributorRedCount ?? 1),
      distributorBlueCount: Number(building.dataset.distributorBlueCount ?? 1),
      distributorPhase: Number(building.dataset.distributorPhase ?? 0),
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
      .filter((item) => !item.isBeingRemoved && item.cell && getConfirmedConveyorAt(item.cell))
      .map((item) => ({ resourceId: item.resourceId, x: item.cell.x, y: item.cell.y })),
    inventory: inventoryController.getState(),
    selectedProductId: selectedProduct?.id ?? null,
  };
  syncGameState(state, logServerSave);
}

function syncGameState(state, logServerSave) {
  if (window.location.protocol === 'file:') return;
  window.clearTimeout(saveSyncTimer);
  saveSyncTimer = window.setTimeout(() => {
    const saveUrl = logServerSave ? `${SAVE_API_URL}?autosave=1` : SAVE_API_URL;
    fetch(saveUrl, {
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
  refreshBuildingConnections();
  if (refund) setMoney(getMoney() + refund);
  finishPlacement();
}

function removeDraftBuilding(building) {
  const key = building.dataset.cellKey;
  if (!key || draftBuildings.get(key) !== building) return;
  draftBuildings.delete(key);
  building.remove();
  setMoney(getMoney() + Number(building.dataset.cost ?? 0));
  if (lastPlacedConveyorKey === key) {
    lastPlacedConveyorKey = [...draftBuildings]
      .reverse()
      .find(([, draft]) => draft.dataset.productId === 'conveyor')?.[0] ?? null;
  }
  refreshConveyors();
  saveGameState();
}

function hidePlacementPreview() {
  buildPreview.classList.remove('is-visible');
  cellPreview.style.display = 'none';
  phaserRenderer.setPreview(null);
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
    phaserRenderer.setPreview(null);
    return;
  }

  const footprint = getFootprint(selectedProduct);
  cellPreview.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  cellPreview.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  cellPreview.style.width = `${(footprint.width / MAP_SIZE) * 100}%`;
  cellPreview.style.height = `${(footprint.height / MAP_SIZE) * 100}%`;
  cellPreview.style.display = 'block';
  phaserRenderer.setPreview({
    x: cell.x,
    y: cell.y,
    width: footprint.width,
    height: footprint.height,
    productId: selectedProduct.id,
  });
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

function renderConveyor(building) {
  const shape = 'straight';
  const turn = 'clockwise';
  let graphic = building.querySelector('.conveyor-tile');
  if (!graphic || graphic.dataset.shape !== shape || graphic.dataset.turn !== turn) {
    building.innerHTML = conveyorMarkup('conveyor-tile', shape, turn);
    graphic = building.querySelector('.conveyor-tile');
  }
  graphic.dataset.shape = shape;
  graphic.dataset.turn = turn;
  graphic.style.transform = `rotate(${Number(building.dataset.conveyorVisualRotation ?? building.dataset.rotation ?? 0)}deg)`;
}

function refreshBuildingConnections() {
  const allBuildings = new Map([...buildings, ...draftBuildings]);
  allBuildings.forEach((building) => {
    if (!building.classList.contains('building--has-active-side')) return;
    const [x, y] = building.dataset.cellKey.split(':').map(Number);
    const target = cellNextTo({ x, y }, building.dataset.activeSide ?? 'bottom');
    building.dataset.isOutputConnected = String(allBuildings.has(`${target.x}:${target.y}`));
  });
}

function refreshConveyors() {
  const allBuildings = [...buildings.values(), ...draftBuildings.values()];
  const allConveyors = allBuildings
    .filter((building) => building.classList.contains('building--conveyor'));

  allConveyors.forEach((building) => {
    building.dataset.conveyorShape = 'straight';
    building.dataset.conveyorTurn = 'clockwise';
    building.dataset.conveyorVisualRotation = String(Number(building.dataset.rotation ?? 0));
    renderConveyor(building);
  });
  refreshBuildingConnections();
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
  if (product.id !== 'conveyor' && product.id !== 'filter' && product.id !== 'distributor' && product.id !== 'generator') {
    building.classList.add('building--has-active-side');
    building.dataset.activeSide = activeSide;
    building.dataset.activeState = 'ready';
    building.dataset.isOutputConnected = 'false';
  }
  building.dataset.productId = product.id;
  building.dataset.cellKey = key;
  building.dataset.rotation = String(rotation);
  building.dataset.level = String(level);
  building.dataset.cost = String(cost);
  if (product.id === 'drill') building.dataset.isEnabled = 'true';
  if (product.id === 'conveyor') building.dataset.conveyorShape = 'straight';
  if (product.id === 'filter') {
    building.dataset.filterMode = '1';
    building.dataset.filterItemIds = '';
  }
  if (product.id === 'distributor') {
    building.dataset.distributorMode = '1';
    building.dataset.distributorGreenCount = '1';
    building.dataset.distributorRedCount = '1';
    building.dataset.distributorBlueCount = '1';
    building.dataset.distributorPhase = '0';
  }
  if (product.id === 'metal-former') {
    building.dataset.metalFormerInputCount = '0';
  }
  if (product.id === 'generator') {
    building.dataset.generatorCoalCount = '0';
    building.dataset.generatorIsActive = 'true';
  }
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
  if (graphic) {
    const graphicRotation = building.classList.contains('building--has-active-side')
      ? product.defaultRotation ?? 0
      : rotation + (product.defaultRotation ?? 0);
    graphic.style.transform = `rotate(${graphicRotation}deg)`;
  }
  world.append(building);
  if (product.id === 'conveyor') renderConveyor(building);
  return building;
}

function clearGameState() {
  warehouseOutput.clearAll();
  movingResources.forEach((resource) => resource.element.remove());
  movingResources.clear();
  buildings.forEach((building) => building.remove());
  draftBuildings.forEach((building) => building.remove());
  buildings.clear();
  draftBuildings.clear();
  selectedProduct = null;
}

function restoreGameState(savedState = null, replaceCurrent = false) {
  const state = savedState;
  if (!state || typeof state !== 'object') return false;
  if (replaceCurrent) clearGameState();

  if (state.inventory && typeof state.inventory === 'object') {
    inventoryController.replaceState(state.inventory);
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
    if (product.id === 'drill') building.dataset.isEnabled = String(savedBuilding.isEnabled !== false);
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
    if (product.id === 'press') {
      if (savedBuilding.pressInputId) building.dataset.pressInputId = savedBuilding.pressInputId;
      if (savedBuilding.pressInputCount) building.dataset.pressInputCount = String(savedBuilding.pressInputCount);
      if (savedBuilding.pressNextProcessAt) building.dataset.pressNextProcessAt = String(savedBuilding.pressNextProcessAt);
    }
    if (product.id === 'metal-former') {
      if (savedBuilding.metalFormerRecipeId) building.dataset.metalFormerRecipeId = savedBuilding.metalFormerRecipeId;
      if (savedBuilding.metalFormerInputCount) building.dataset.metalFormerInputCount = String(savedBuilding.metalFormerInputCount);
      if (savedBuilding.metalFormerNextProcessAt) building.dataset.metalFormerNextProcessAt = String(savedBuilding.metalFormerNextProcessAt);
    }
    if (product.id === 'generator') {
      building.dataset.generatorCoalCount = String(Math.max(0, Number(savedBuilding.generatorCoalCount ?? 0)));
      building.dataset.generatorIsActive = String(savedBuilding.generatorIsActive !== false);
      if (Number(savedBuilding.generatorBurnEndsAt) > 0) {
        building.dataset.generatorBurnEndsAt = String(savedBuilding.generatorBurnEndsAt);
      }
      if (Number(savedBuilding.generatorPausedBurnMs) > 0) {
        building.dataset.generatorPausedBurnMs = String(savedBuilding.generatorPausedBurnMs);
      }
    }
    if (product.id === 'filter') {
      building.dataset.filterMode = String(savedBuilding.filterMode ?? 1);
      building.dataset.filterItemIds = savedBuilding.filterItemIds ?? '';
    }
    if (product.id === 'distributor') {
      building.dataset.distributorMode = String(savedBuilding.distributorMode ?? 1);
      building.dataset.distributorGreenCount = String(Math.max(1, Number(savedBuilding.distributorGreenCount ?? 1)));
      building.dataset.distributorRedCount = String(Math.max(1, Number(savedBuilding.distributorRedCount ?? 1)));
      building.dataset.distributorBlueCount = String(Math.max(1, Number(savedBuilding.distributorBlueCount ?? 1)));
      building.dataset.distributorPhase = String(Math.max(0, Number(savedBuilding.distributorPhase ?? 0)));
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

function isCellOnMap(cell) {
  return cell.x >= 0 && cell.y >= 0 && cell.x < MAP_SIZE && cell.y < MAP_SIZE;
}

function getConfirmedConveyorAt(cell) {
  const building = buildings.get(`${cell.x}:${cell.y}`);
  return building?.classList.contains('building--conveyor') ? building : null;
}

function getDrillChances(level) {
  return calculateDrillChances(level, drillResources, MAX_DRILL_LEVEL);
}

function getDrillInterval(level) {
  return calculateDrillInterval(level, MAX_DRILL_LEVEL);
}

function formatProductionRate(level) {
  return formatDrillRate(level, MAX_DRILL_LEVEL);
}

function pickDrillResource(level) {
  return pickCalculatedDrillResource(level, drillResources, MAX_DRILL_LEVEL);
}

function getResourcePoint(cell, entryFrom = null, entryOffset = 0.08) {
  let offsetX = 0.5;
  let offsetY = 0.5;
  if (entryFrom === 'left') offsetX = entryOffset;
  if (entryFrom === 'right') offsetX = 1 - entryOffset;
  if (entryFrom === 'top') offsetY = entryOffset;
  if (entryFrom === 'bottom') offsetY = 1 - entryOffset;
  return { x: cell.x + offsetX, y: cell.y + offsetY };
}

function setResourcePosition(resource, cell, entryFrom = null, entryOffset = 0.08) {
  const point = getResourcePoint(cell, entryFrom, entryOffset);
  resource.element.style.left = `${(point.x / MAP_SIZE) * 100}%`;
  resource.element.style.top = `${(point.y / MAP_SIZE) * 100}%`;
}

function createMovingResource(resourceType, cell) {
  const resource = {
    resourceId: resourceType.id,
    cell: { ...cell },
    renderPosition: getResourcePoint(cell),
    element: document.createElement('div'),
  };
  resource.element.className = `factory-item factory-item--${resourceType.id}`;
  resource.element.style.background = resourceType.image ? 'transparent' : resourceType.color;
  if (resourceType.image) {
    const image = document.createElement('img');
    image.src = resourceType.image;
    image.alt = '';
    resource.element.append(image);
  }
  setResourcePosition(resource, cell);
  movingResources.add(resource);
  return resource;
}

function placeResourceImmediately(resource, cell, side) {
  setResourcePosition(resource, cell, side);
  resource.renderPosition = getResourcePoint(cell, side);
  resource.positionSide = side;
}

function emitResource(resourceType, source, side) {
  const target = cellNextTo(source, side);
  const resource = createMovingResource(resourceType, source);
  if (!isCellOnMap(target)) {
    removeResource(resource);
    return;
  }
  const conveyor = getConfirmedConveyorAt(target);
  if (!conveyor) {
    arriveAtCell(resource, target);
    return;
  }
  if (isConveyorFull(target, resource)) {
    removeResource(resource);
    return;
  }
  resource.cell = { ...target };
  placeResourceImmediately(resource, target);
  resource.lastDirection = side;
  advanceResource(resource, target);
}

function showTrashEffect(resource) {
  const point = resource.renderPosition ?? getResourcePoint(resource.cell, resource.positionSide);
  const mapRect = map.getBoundingClientRect();
  const worldRect = world.getBoundingClientRect();
  const effect = document.createElement('div');
  effect.className = 'trash-effect';
  effect.style.left = `${worldRect.left - mapRect.left + (point.x / MAP_SIZE) * worldRect.width}px`;
  effect.style.top = `${worldRect.top - mapRect.top + (point.y / MAP_SIZE) * worldRect.height}px`;
  effect.innerHTML = '<img src="assets/resources/trash.png" alt=""><span>+1</span>';
  map.append(effect);
  window.setTimeout(() => effect.remove(), 560);
}

function removeResource(resource) {
  if (resource.isBeingRemoved) return;
  if (resource.animationFrame) window.cancelAnimationFrame(resource.animationFrame);
  resource.isBeingRemoved = true;
  resource.element.classList.add('factory-item--destroyed');
  showTrashEffect(resource);
  addToInventory('trash');
  saveGameState();
  window.setTimeout(() => {
    movingResources.delete(resource);
    resource.element.remove();
  }, 180);
}

function moveResourceTo(resource, cell, onArrival, stopAtEntry = false, entryOffset = 0.08) {
  const travelDirection = sideToward(resource.cell, cell);
  const entryFrom = stopAtEntry ? oppositeSide(travelDirection) : null;
  const from = getResourcePoint(resource.cell, resource.positionSide);
  const to = getResourcePoint(cell, entryFrom, entryOffset);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const duration = Math.max(80, Math.round(CONVEYOR_TRAVEL_MS * distance));
  let completed = false;
  const finishMove = () => {
    if (completed) return;
    completed = true;
    if (!entryFrom) {
      setResourcePosition(resource, cell);
      resource.renderPosition = getResourcePoint(cell);
    }
    onArrival();
    saveGameState();
  };
  const startedAt = performance.now();
  const animate = (now) => {
    if (isCameraGestureActive()) {
      resource.animationFrame = window.requestAnimationFrame(animate);
      return;
    }
    const progress = Math.min(1, (now - startedAt) / duration);
    resource.renderPosition = {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
    if (progress < 1) {
      resource.animationFrame = window.requestAnimationFrame(animate);
      return;
    }
    resource.animationFrame = null;
    finishMove();
  };
  setResourcePosition(resource, cell, entryFrom, entryOffset);
  resource.positionSide = entryFrom;
  resource.lastDirection = travelDirection;
  resource.animationFrame = window.requestAnimationFrame(animate);
}

function isConveyorFull(cell, resource) {
  return [...movingResources].filter((item) => item !== resource && !item.isBeingRemoved
    && item.cell?.x === cell.x
    && item.cell?.y === cell.y).length >= MAX_CONVEYOR_ITEMS;
}

function getCrusherResources(level) {
  return calculateCrusherResources(level, drillResources);
}

function getCrusherInterval(level) {
  return getProcessingInterval(level, MAX_CRUSHER_LEVEL);
}

function getFurnaceResources(level) {
  return calculateFurnaceResources(level, crushedResources);
}

function getFurnaceInterval(level) {
  return getProcessingInterval(level, MAX_FURNACE_LEVEL);
}

function formatFurnaceRate(level) {
  return formatProcessingRate(level, 'Переплавка', MAX_FURNACE_LEVEL);
}

function formatCrusherRate(level) {
  return formatProcessingRate(level, 'Переработка', MAX_CRUSHER_LEVEL);
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

function acceptPressResource(resource, press, fromCell) {
  const [x, y] = press.dataset.cellKey.split(':').map(Number);
  const incomingSide = oppositeSide(sideToward(fromCell, { x, y }));
  const allowed = smeltedResources.slice(0, Number(press.dataset.level ?? 1));
  const accepted = incomingSide !== (press.dataset.activeSide ?? 'bottom') && allowed.some((item) => item.id === resource.resourceId);
  if (!accepted || (press.dataset.pressInputId && press.dataset.pressInputId !== resource.resourceId)) {
    removeResource(resource); return;
  }
  press.dataset.pressInputId = resource.resourceId;
  press.dataset.pressInputCount = String(Number(press.dataset.pressInputCount ?? 0) + 1);
  resource.element.remove(); movingResources.delete(resource); saveGameState();
}

function getMetalFormerRecipe(metalFormer) {
  const output = [...gearResources, ...bearingResources, ...rodResources].find((item) => item.id === metalFormer.dataset.metalFormerRecipeId);
  if (!output) return null;
  const level = Number(metalFormer.dataset.level ?? 1);
  const recipeResources = output.id.endsWith('-bearing')
    ? bearingResources
    : output.id.endsWith('-rod') ? rodResources : gearResources;
  if (recipeResources.indexOf(output) >= getAvailableMetalFormerMaterialCount(level)) return null;
  const input = smeltedResources[recipeResources.indexOf(output)];
  return input ? { input, output, outputCount: output.id.endsWith('-rod') ? 2 : 1 } : null;
}

function getAvailableMetalFormerMaterialCount(level) {
  return level >= MAX_METAL_FORMER_LEVEL ? gearResources.length : Math.min(gearResources.length - 1, level);
}

function acceptMetalFormerResource(resource, metalFormer, fromCell) {
  const [x, y] = metalFormer.dataset.cellKey.split(':').map(Number);
  const incomingSide = oppositeSide(sideToward(fromCell, { x, y }));
  const recipe = getMetalFormerRecipe(metalFormer);
  const accepted = recipe
    && incomingSide !== (metalFormer.dataset.activeSide ?? 'bottom')
    && recipe.input.id === resource.resourceId;
  if (!accepted) {
    removeResource(resource);
    addToInventory('trash');
    if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
    saveGameState();
    return;
  }
  metalFormer.dataset.metalFormerInputCount = String(Number(metalFormer.dataset.metalFormerInputCount ?? 0) + 1);
  resource.element.remove();
  movingResources.delete(resource);
  if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
  saveGameState();
}

function acceptGeneratorResource(resource, generator) {
  if (resource.resourceId !== 'coal') {
    removeResource(resource);
    return;
  }
  if (resource.animationFrame) window.cancelAnimationFrame(resource.animationFrame);
  generator.dataset.generatorCoalCount = String(Number(generator.dataset.generatorCoalCount ?? 0) + 1);
  if (generator.dataset.generatorIsActive !== 'false'
    && Number(generator.dataset.generatorBurnEndsAt ?? 0) <= Date.now()) {
    generator.dataset.generatorBurnEndsAt = String(Date.now() + energyController.getGeneratorBurnDuration(generator.dataset.level));
  }
  resource.element.remove();
  movingResources.delete(resource);
  if (selectedGenerator === generator) renderGeneratorMenu(generator);
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

function rotateSide(side, rotation) {
  const sides = ['right', 'bottom', 'left', 'top'];
  return sides[(sides.indexOf(side) + Math.round(rotation / 90)) % sides.length];
}

function getFilterDirections(filter) {
  const mode = Number(filter.dataset.filterMode ?? 1);
  const baseDirections = {
    1: { white: 'right', black: 'bottom' },
    2: { white: 'bottom', black: 'right' },
    3: { white: 'left', black: 'right' },
  }[mode] ?? { white: 'right', black: 'bottom' };
  const rotation = Number(filter.dataset.rotation ?? 0);
  return {
    white: rotateSide(baseDirections.white, rotation),
    black: rotateSide(baseDirections.black, rotation),
  };
}

function acceptFilterResource(resource, filter) {
  const selectedIds = (filter.dataset.filterItemIds ?? '').split(',').filter(Boolean);
  const directions = getFilterDirections(filter);
  const outputSide = selectedIds.includes(resource.resourceId) ? directions.white : directions.black;
  const [x, y] = filter.dataset.cellKey.split(':').map(Number);
  const resourceType = getResourceType(resource.resourceId);
  if (resource.animationFrame) window.cancelAnimationFrame(resource.animationFrame);
  resource.element.remove();
  movingResources.delete(resource);
  if (resourceType) emitResource(resourceType, { x, y }, outputSide);
  saveGameState();
}

function acceptDistributorResource(resource, distributor) {
  const mode = Number(distributor.dataset.distributorMode ?? 1);
  const base = mode === 3
    ? { green: 'left', red: 'right', blue: 'bottom' }
    : mode === 2 ? { green: 'left', red: 'right' } : { green: 'right', red: 'bottom' };
  const rotation = Number(distributor.dataset.rotation ?? 0);
  const directions = Object.fromEntries(Object.entries(base).map(([path, side]) => [path, rotateSide(side, rotation)]));
  const greenCount = Math.max(1, Number(distributor.dataset.distributorGreenCount ?? 1));
  const redCount = Math.max(1, Number(distributor.dataset.distributorRedCount ?? 1));
  const blueCount = mode === 3 ? Math.max(1, Number(distributor.dataset.distributorBlueCount ?? 1)) : 0;
  const cycleLength = greenCount + redCount + blueCount;
  const phase = Number(distributor.dataset.distributorPhase ?? 0) % cycleLength;
  const path = phase < greenCount ? 'green' : phase < greenCount + redCount ? 'red' : 'blue';
  distributor.dataset.distributorPhase = String((phase + 1) % cycleLength);
  const [x, y] = distributor.dataset.cellKey.split(':').map(Number);
  const resourceType = getResourceType(resource.resourceId);
  if (resource.animationFrame) window.cancelAnimationFrame(resource.animationFrame);
  resource.element.remove();
  movingResources.delete(resource);
  if (resourceType) emitResource(resourceType, { x, y }, directions[path]);
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
    resource.positionSide = null;
    const outgoingDirection = directionForRotation(conveyor.dataset.rotation ?? 0);
    const continuePath = () => advanceResource(resource, cell);
    if (resource.lastDirection && resource.lastDirection !== outgoingDirection) {
      window.setTimeout(continuePath, CONVEYOR_TURN_PAUSE_MS);
    } else {
      continuePath();
    }
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
  if (crusher?.classList.contains('building--press')) {
    acceptPressResource(resource, crusher, resource.cell);
    return;
  }
  if (crusher?.classList.contains('building--metal-former')) {
    acceptMetalFormerResource(resource, crusher, resource.cell);
    return;
  }
  if (crusher?.classList.contains('building--generator')) {
    acceptGeneratorResource(resource, crusher);
    return;
  }
  if (crusher?.classList.contains('building--former') || crusher?.classList.contains('building--component-assembler')) {
    removeResource(resource);
    return;
  }
  if (crusher?.classList.contains('building--warehouse')) {
    acceptWarehouseResource(resource, crusher, resource.cell);
    return;
  }
  if (crusher?.classList.contains('building--filter')) {
    acceptFilterResource(resource, crusher);
    return;
  }
  if (crusher?.classList.contains('building--distributor')) {
    acceptDistributorResource(resource, crusher);
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
  const targetBuilding = isCellOnMap(target) ? buildings.get(`${target.x}:${target.y}`) : null;
  if (!targetBuilding) {
    moveResourceTo(resource, target, () => removeResource(resource), true, 0);
    return;
  }
  const targetIsMachine = targetBuilding && !targetBuilding.classList.contains('building--conveyor');
  moveResourceTo(resource, target, () => arriveAtCell(resource, target), Boolean(targetIsMachine));
}

function produceDrillResource(drill) {
  const [x, y] = drill.dataset.cellKey.split(':').map(Number);
  const source = { x, y };
  const minedResource = pickDrillResource(Number(drill.dataset.level ?? 1));
  emitResource(minedResource, source, drill.dataset.activeSide ?? 'bottom');
}

function runCrushers() {
  const now = Date.now();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--crusher'))
    .forEach((crusher) => {
      const count = Number(crusher.dataset.crusherInputCount ?? 0);
      const inputId = crusher.dataset.crusherInputId;
      if (!inputId || count <= 0) return;
      if (!energyController.canPower(crusher)) {
        delete crusher.dataset.crusherNextProcessAt;
        if (selectedCrusher === crusher) renderCrusherMenu(crusher);
        return;
      }
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
        emitResource(output, source, crusher.dataset.activeSide ?? 'bottom');
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
      if (!energyController.canPower(furnace)) {
        delete furnace.dataset.furnaceNextProcessAt;
        if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
        return;
      }
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
      const outputId = inputId === 'diamond-powder' ? 'diamond-ingot' : inputId.replace('-powder', '-ingot');
      const output = smeltedResources.find((resource) => resource.id === outputId);
      furnace.dataset.furnaceInputCount = String(count - 1);
      if (count <= 1) delete furnace.dataset.furnaceInputId;
      delete furnace.dataset.furnaceNextProcessAt;
      if (output) {
        const [x, y] = furnace.dataset.cellKey.split(':').map(Number);
        const source = { x, y };
        [0, 1].forEach(() => {
          emitResource(output, source, furnace.dataset.activeSide ?? 'bottom');
        });
      }
      if (selectedFurnace === furnace) renderFurnaceMenu(furnace);
      saveGameState();
    });
}

function runPresses() {
  const now = Date.now();
  [...buildings.values()].filter((building) => building.classList.contains('building--press')).forEach((press) => {
    const count = Number(press.dataset.pressInputCount ?? 0);
    const inputId = press.dataset.pressInputId;
    if (!inputId || count <= 0) return;
    if (!energyController.canPower(press)) {
      delete press.dataset.pressNextProcessAt;
      if (selectedPress === press) openPressMenu(press);
      return;
    }
    const interval = getFurnaceInterval(Number(press.dataset.level ?? 1));
    const next = Number(press.dataset.pressNextProcessAt ?? 0);
    if (!next) { press.dataset.pressNextProcessAt = String(now + interval); return; }
    if (now < next) { if (selectedPress === press) openPressMenu(press); return; }
    press.dataset.pressInputCount = String(count - 1);
    if (count <= 1) delete press.dataset.pressInputId;
    delete press.dataset.pressNextProcessAt;
    const output = pressedResources.find((item) => item.id === inputId.replace('-ingot', '-plate'));
    if (output) {
      const [x, y] = press.dataset.cellKey.split(':').map(Number);
      emitResource(output, { x, y }, press.dataset.activeSide ?? 'bottom');
    }
    if (selectedPress === press) openPressMenu(press);
    saveGameState();
  });
}

function runMetalFormers() {
  const now = Date.now();
  [...buildings.values()].filter((building) => building.classList.contains('building--metal-former')).forEach((metalFormer) => {
    const recipe = getMetalFormerRecipe(metalFormer);
    const count = Number(metalFormer.dataset.metalFormerInputCount ?? 0);
    if (!recipe || count <= 0) return;
    if (!energyController.canPower(metalFormer)) {
      delete metalFormer.dataset.metalFormerNextProcessAt;
      if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
      return;
    }
    const next = Number(metalFormer.dataset.metalFormerNextProcessAt ?? 0);
    if (!next) {
      metalFormer.dataset.metalFormerNextProcessAt = String(now + METAL_FORMER_PROCESS_MS);
      if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
      return;
    }
    if (now < next) {
      if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
      return;
    }
    metalFormer.dataset.metalFormerInputCount = String(count - 1);
    delete metalFormer.dataset.metalFormerNextProcessAt;
    const [x, y] = metalFormer.dataset.cellKey.split(':').map(Number);
    for (let index = 0; index < recipe.outputCount; index += 1) {
      emitResource(recipe.output, { x, y }, metalFormer.dataset.activeSide ?? 'bottom');
    }
    if (selectedMetalFormer === metalFormer) openMetalFormerMenu(metalFormer);
    saveGameState();
  });
}

function runGenerators() {
  const now = Date.now();
  let stateChanged = energyController.balanceGenerators();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--generator'))
    .forEach((generator) => {
      if (generator.dataset.generatorIsActive === 'false') {
        if (selectedGenerator === generator) renderGeneratorMenu(generator);
        return;
      }
      let coalCount = Number(generator.dataset.generatorCoalCount ?? 0);
      const burnEndsAt = Number(generator.dataset.generatorBurnEndsAt ?? 0);
      if (burnEndsAt > now) {
        if (selectedGenerator === generator) renderGeneratorMenu(generator);
        return;
      }

      if (burnEndsAt) {
        coalCount = Math.max(0, coalCount - 1);
        generator.dataset.generatorCoalCount = String(coalCount);
        delete generator.dataset.generatorBurnEndsAt;
        stateChanged = true;
      }
      if (coalCount > 0) {
        generator.dataset.generatorBurnEndsAt = String(now + energyController.getGeneratorBurnDuration(generator.dataset.level));
        stateChanged = true;
      }
      if (selectedGenerator === generator) renderGeneratorMenu(generator);
    });

  if (stateChanged) saveGameState();
  else renderResources();
}

function runDrills() {
  const now = Date.now();
  [...buildings.values()]
    .filter((building) => building.classList.contains('building--drill'))
    .forEach((drill) => {
      if (drill.dataset.isEnabled === 'false') {
        delete drill.dataset.nextProductionAt;
        return;
      }
      if (!energyController.canPower(drill)) {
        delete drill.dataset.nextProductionAt;
        return;
      }
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
  closeFilterMenu();
  closeMetalFormerMenu();
  selectedDrill = drill;
  const level = Number(drill.dataset.level ?? 1);
  const isEnabled = drill.dataset.isEnabled !== 'false';
  const upgradeCost = getUpgradeCost(drill, DRILL_UPGRADE_COEFFICIENT);
  machineLevel.textContent = `${level} ур.`;
  machineRate.textContent = isEnabled ? `${formatAmount(getDrillInterval(level) / 1000)} сек.` : 'Остановлен';
  machineMenu.classList.toggle('is-disabled', !isEnabled);
  machineToggle.classList.toggle('is-active', isEnabled);
  machineToggle.setAttribute('aria-pressed', String(isEnabled));
  machineToggle.setAttribute('aria-label', isEnabled ? 'Выключить бур' : 'Включить бур');
  energyController.renderDevice(machineMenu, drill);
  machineDropList.innerHTML = getDrillChances(level).map((resource) => `
    <div class="machine-drop">
      <i class="resource-swatch" style="background:${resource.color}" aria-hidden="true">${resource.image ? `<img src="${resource.image}" alt="">` : ''}</i>
      <span>${resource.name}</span>
      <b>${resource.chance}%</b>
    </div>
  `).join('');
  renderCompactUpgrade(machineUpgrade, level, MAX_DRILL_LEVEL, upgradeCost, 'бур');
  machineMenu.classList.add('is-visible');
}

function closeMachineMenu() {
  machineMenu.classList.remove('is-visible');
  selectedDrill = null;
}

function renderCrusherMenu(crusher) {
  const level = Number(crusher.dataset.level ?? 1);
  const upgradeCost = getUpgradeCost(crusher, CRUSHER_UPGRADE_COEFFICIENT);
  const inputId = crusher.dataset.crusherInputId;
  const input = getResourceType(inputId);
  const output = input ? crushedResources.find((resource) => resource.id === `${input.id}-powder`) : null;
  const count = Number(crusher.dataset.crusherInputCount ?? 0);
  const interval = getCrusherInterval(level);
  const nextProcessAt = Number(crusher.dataset.crusherNextProcessAt ?? 0);
  const progress = nextProcessAt ? Math.max(0, Math.min(1, 1 - ((nextProcessAt - Date.now()) / interval))) : 0;
  crusherLevel.textContent = `${level} ур.`;
  crusherRate.textContent = `${formatAmount(interval / 1000)} сек.`;
  crusherInputIcon.style.background = input?.color ?? '#dfe4e8';
  crusherInputIcon.innerHTML = input?.image ? `<img src="${input.image}" alt="">` : '';
  crusherInputName.textContent = input?.name ?? 'Нет руды';
  crusherInputCount.textContent = String(count);
  crusherOutputIcon.style.background = output?.color ?? '#dfe4e8';
  crusherOutputIcon.innerHTML = output?.image ? `<img src="${output.image}" alt="">` : '';
  crusherOutputName.textContent = output?.name ?? '—';
  crusherOutputCount.textContent = output ? String(count * 2) : '0';
  crusherArrowProgress.style.width = `${progress * 100}%`;
  energyController.renderDevice(crusherMenu, crusher);
  renderCompactUpgrade(crusherUpgrade, level, MAX_CRUSHER_LEVEL, upgradeCost, 'дробилку');
}

function openCrusherMenu(crusher) {
  closeMachineMenu();
  closeFurnaceMenu();
  closeFilterMenu();
  closeMetalFormerMenu();
  selectedCrusher = crusher;
  renderCrusherMenu(crusher);
  crusherMenu.classList.add('is-visible');
}

function closeCrusherMenu() {
  crusherMenu.classList.remove('is-visible');
  selectedCrusher = null;
}

function renderFilterMenu(filter) {
  const selectedIds = (filter.dataset.filterItemIds ?? '').split(',').filter(Boolean);
  const mode = String(filter.dataset.filterMode ?? 1);
  filterModes.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.mode === mode);
  });
  filterItems.innerHTML = Array.from({ length: 6 }, (_, index) => {
    const item = inventoryItems.find((candidate) => candidate.id === selectedIds[index]);
    return `<button type="button" class="filter-slot" data-slot="${index}">
      ${item?.image ? `<img src="${item.image}" alt="">` : ''}
      <span>${item?.name ?? 'Выбрать'}</span>
    </button>`;
  }).join('');
  filterPicker.classList.remove('is-visible');
  filterPickerTabs.innerHTML = '';
  selectedFilterSlot = null;
}

function openFilterMenu(filter) {
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
  closeMetalFormerMenu();
  selectedFilter = filter;
  renderFilterMenu(filter);
  filterMenu.classList.add('is-visible');
}

function closeFilterMenu() {
  filterMenu.classList.remove('is-visible');
  selectedFilter = null;
  selectedFilterSlot = null;
}

function renderDistributorMenu(distributor) {
  const mode = distributor.dataset.distributorMode ?? '1';
  distributorModes.querySelectorAll('button').forEach((button) => button.classList.toggle('is-selected', button.dataset.mode === mode));
  distributorGreenCount.textContent = distributor.dataset.distributorGreenCount ?? '1';
  distributorRedCount.textContent = distributor.dataset.distributorRedCount ?? '1';
  distributorBlueCount.textContent = distributor.dataset.distributorBlueCount ?? '1';
  distributorBlueRow.classList.toggle('is-hidden', mode !== '3');
}

function openDistributorMenu(distributor) {
  closeFilterMenu(); closeMachineMenu(); closeCrusherMenu(); closeFurnaceMenu(); closeMetalFormerMenu();
  selectedDistributor = distributor; renderDistributorMenu(distributor); distributorMenu.classList.add('is-visible');
}

function closeDistributorMenu() { distributorMenu.classList.remove('is-visible'); selectedDistributor = null; }

distributorModes.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mode]'); if (!button || !selectedDistributor) return;
  selectedDistributor.dataset.distributorMode = button.dataset.mode;
  selectedDistributor.dataset.distributorPhase = '0';
  renderDistributorMenu(selectedDistributor);
  saveGameState();
});

distributorMenu.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-path]'); if (!button || !selectedDistributor) return;
  const key = {
    green: 'distributorGreenCount',
    red: 'distributorRedCount',
    blue: 'distributorBlueCount',
  }[button.dataset.path];
  if (!key) return;
  selectedDistributor.dataset[key] = String(Math.max(1, Number(selectedDistributor.dataset[key] ?? 1) + Number(button.dataset.change)));
  renderDistributorMenu(selectedDistributor); saveGameState();
});

filterModes.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-mode]');
  if (!button || !selectedFilter) return;
  selectedFilter.dataset.filterMode = button.dataset.mode;
  renderFilterMenu(selectedFilter);
  saveGameState();
});

filterItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-slot]');
  if (!button || !selectedFilter) return;
  selectedFilterSlot = Number(button.dataset.slot);
  filterPickerTab = 'all';
  renderFilterPicker();
  filterPicker.classList.add('is-visible');
});

function renderFilterPicker() {
  const selectedIds = (selectedFilter.dataset.filterItemIds ?? '').split(',').filter(Boolean);
  const items = filterPickerTab === 'ores' ? drillResources : filterPickerTab === 'powders' ? crushedResources : filterPickerTab === 'ingots' ? smeltedResources : filterPickerTab === 'components' ? [...pressedResources, ...gearResources, ...bearingResources, ...rodResources] : inventoryItems.filter((item) => item.id !== 'trash');
  filterPickerTabs.innerHTML = [['all','Всё'],['ores','Руда'],['powders','Порошки'],['ingots','Слитки'],['components','Компоненты']].map(([id,label]) => `<button type="button" data-filter-tab="${id}" class="${filterPickerTab === id ? 'is-active' : ''}">${label}</button>`).join('');
  filterPicker.innerHTML = `<button type="button" class="filter-picker-clear" data-resource-id="">Очистить ячейку</button>${items.map((item) => `<button type="button" data-resource-id="${item.id}" class="${selectedIds.includes(item.id) ? 'is-selected' : ''}">${item.image ? `<img src="${item.image}" alt="">` : ''}<span>${item.name}</span></button>`).join('')}`;
}

function selectFilterPickerTab(event) {
  const tab = event.target.closest('button[data-filter-tab]');
  if (tab) { filterPickerTab = tab.dataset.filterTab; renderFilterPicker(); return; }
}
filterPickerTabs.addEventListener('click', selectFilterPickerTab);
filterPicker.addEventListener('click', (event) => {
  selectFilterPickerTab(event);
  const button = event.target.closest('button[data-resource-id]');
  if (!button || !selectedFilter || selectedFilterSlot == null) return;
  const selectedIds = (selectedFilter.dataset.filterItemIds ?? '').split(',').filter(Boolean);
  const itemId = button.dataset.resourceId;
  const nextIds = [...selectedIds];
  if (itemId) {
    const existingSlot = nextIds.indexOf(itemId);
    if (existingSlot !== -1) nextIds.splice(existingSlot, 1);
    nextIds[selectedFilterSlot] = itemId;
  } else {
    nextIds.splice(selectedFilterSlot, 1);
  }
  selectedFilter.dataset.filterItemIds = nextIds.filter(Boolean).slice(0, 6).join(',');
  renderFilterMenu(selectedFilter);
  saveGameState();
});

function renderFurnaceMenu(furnace) {
  const level = Number(furnace.dataset.level ?? 1);
  const upgradeCost = getUpgradeCost(furnace, FURNACE_UPGRADE_COEFFICIENT);
  const inputId = furnace.dataset.furnaceInputId;
  const input = getResourceType(inputId);
  const outputId = inputId === 'diamond-powder' ? 'diamond-ingot' : inputId?.replace('-powder', '-ingot');
  const output = smeltedResources.find((resource) => resource.id === outputId);
  const count = Number(furnace.dataset.furnaceInputCount ?? 0);
  const interval = getFurnaceInterval(level);
  const nextProcessAt = Number(furnace.dataset.furnaceNextProcessAt ?? 0);
  const progress = nextProcessAt ? Math.max(0, Math.min(1, 1 - ((nextProcessAt - Date.now()) / interval))) : 0;
  furnaceLevel.textContent = `${level} ур.`;
  furnaceRate.textContent = `${formatAmount(interval / 1000)} сек.`;
  furnaceInputIcon.style.background = input?.color ?? '#dfe4e8';
  furnaceInputIcon.innerHTML = input?.image ? `<img src="${input.image}" alt="">` : '';
  furnaceInputName.textContent = input?.name ?? 'Нет порошка';
  furnaceInputCount.textContent = String(count);
  furnaceOutputIcon.style.background = output?.color ?? '#dfe4e8';
  furnaceOutputIcon.innerHTML = output?.image ? `<img src="${output.image}" alt="">` : '';
  furnaceOutputName.textContent = output?.name ?? '—';
  furnaceOutputCount.textContent = output ? String(count) : '0';
  furnaceArrowProgress.style.width = `${progress * 100}%`;
  energyController.renderDevice(furnaceMenu, furnace);
  renderCompactUpgrade(furnaceUpgrade, level, MAX_FURNACE_LEVEL, upgradeCost, 'печь');
}

function openFurnaceMenu(furnace) {
  closeMachineMenu();
  closeCrusherMenu();
  closeFilterMenu();
  closeMetalFormerMenu();
  selectedFurnace = furnace;
  renderFurnaceMenu(furnace);
  furnaceMenu.classList.add('is-visible');
}

function openPressMenu(press) {
  closeMetalFormerMenu();
  selectedPress = press;
  const level = Number(press.dataset.level ?? 1), input = getResourceType(press.dataset.pressInputId);
  const output = input && pressedResources.find((item) => item.id === input.id.replace('-ingot', '-plate'));
  const interval = getFurnaceInterval(level), next = Number(press.dataset.pressNextProcessAt ?? 0);
  pressLevel.textContent = `${level} ур.`;
  pressRate.textContent = `${formatAmount(interval / 1000)} сек.`;
  pressInputIcon.style.background = input?.color ?? '#dfe4e8';
  pressInputIcon.innerHTML = input?.image ? `<img src="${input.image}" alt="">` : '';
  pressOutputIcon.style.background = output?.color ?? '#dfe4e8';
  pressOutputIcon.innerHTML = output?.image ? `<img src="${output.image}" alt="">` : '';
  pressInputName.textContent = input?.name ?? 'Нет слитка'; pressInputCount.textContent = String(Number(press.dataset.pressInputCount ?? 0));
  pressOutputName.textContent = output?.name ?? '—'; pressOutputCount.textContent = output ? pressInputCount.textContent : '0';
  pressArrowProgress.style.width = `${next ? Math.max(0, Math.min(100, (1 - (next - Date.now()) / interval) * 100)) : 0}%`;
  energyController.renderDevice(pressMenu, press);
  const upgradeCost = getUpgradeCost(press, PRESS_UPGRADE_COEFFICIENT);
  renderCompactUpgrade(pressUpgrade, level, MAX_FURNACE_LEVEL, upgradeCost, 'пресс');
  pressMenu.classList.add('is-visible');
}

function renderMetalFormerRecipes(metalFormer) {
  const level = Number(metalFormer.dataset.level ?? 1);
  const availableMaterialCount = getAvailableMetalFormerMaterialCount(level);
  if (!selectedMetalFormerRecipeType) {
    const selectedRecipe = getMetalFormerRecipe(metalFormer);
    const selectedRecipeType = selectedRecipe?.output.id.endsWith('-bearing')
      ? 'bearing'
      : selectedRecipe?.output.id.endsWith('-rod') ? 'rod' : selectedRecipe ? 'gear' : null;
    metalFormerRecipes.innerHTML = `<button type="button" class="metal-former-recipes-back" data-recipe-close>← Производство</button>${[
      { id: 'gear', name: 'Шестерёнки', image: gearResources[0].image, enabled: true, selected: selectedRecipeType === 'gear' },
      { id: 'bearing', name: 'Подшипники', image: bearingResources[0].image, enabled: true, selected: selectedRecipeType === 'bearing' },
      { id: 'rod', name: 'Стержни', image: rodResources[0].image, enabled: true, selected: selectedRecipeType === 'rod' },
    ].map((type) => `<button type="button" data-recipe-type="${type.id}" class="${type.selected ? 'is-selected' : ''}" ${type.enabled ? '' : 'disabled'}>
      ${type.image ? `<img src="${type.image}" alt="">` : ''}<span>${type.name}${type.selected ? `<small>Выбрано: ${selectedRecipe.output.name}</small>` : type.enabled ? '<small>Выбрать материал</small>' : '<small>Будет добавлено позже</small>'}</span>
    </button>`).join('')}`;
    return;
  }

  const recipeResources = selectedMetalFormerRecipeType === 'bearing'
    ? bearingResources
    : selectedMetalFormerRecipeType === 'rod' ? rodResources : gearResources;
  metalFormerRecipes.innerHTML = `<button type="button" class="metal-former-recipes-back" data-recipe-back>← Тип рецепта</button>${recipeResources.map((output, index) => {
    const input = smeltedResources[index];
    const isLocked = index >= availableMaterialCount;
    return `<button type="button" data-recipe-id="${output.id}" class="${metalFormer.dataset.metalFormerRecipeId === output.id ? 'is-selected' : ''}" ${isLocked ? 'disabled' : ''}>
      <img src="${output.image}" alt=""><span>${output.name}<small>1 × ${input?.name ?? 'слиток'}${selectedMetalFormerRecipeType === 'rod' ? ` → 2 × ${output.name}` : ''}</small></span>
    </button>`;
  }).join('')}`;
}

function openMetalFormerMenu(metalFormer) {
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
  closeFilterMenu();
  closeDistributorMenu();
  pressMenu.classList.remove('is-visible');
  selectedPress = null;
  selectedMetalFormer = metalFormer;
  const recipe = getMetalFormerRecipe(metalFormer);
  const level = Number(metalFormer.dataset.level ?? 1);
  const inputCount = Number(metalFormer.dataset.metalFormerInputCount ?? 0);
  const next = Number(metalFormer.dataset.metalFormerNextProcessAt ?? 0);
  const upgradeCost = getUpgradeCost(metalFormer, METAL_FORMER_UPGRADE_COEFFICIENT);
  metalFormerLevel.textContent = `${level} ур.`;
  metalFormerRate.textContent = `${(METAL_FORMER_PROCESS_MS / 1000).toFixed(1).replace('.0', '')} сек.`;
  metalFormerInputIcon.style.background = recipe?.input?.image ? `center / contain no-repeat url("${recipe.input.image}")` : '#dfe4e8';
  metalFormerOutputIcon.style.background = recipe?.output?.image ? `center / contain no-repeat url("${recipe.output.image}")` : '#dfe4e8';
  metalFormerInputName.textContent = recipe?.input?.name ?? 'Выберите рецепт';
  metalFormerOutputName.textContent = recipe?.output?.name ?? 'Выберите рецепт';
  metalFormerInputCount.textContent = String(inputCount);
  metalFormerOutputCount.textContent = recipe ? String(inputCount * recipe.outputCount) : '0';
  metalFormerArrowProgress.style.width = `${next ? Math.max(0, Math.min(100, (1 - (next - Date.now()) / METAL_FORMER_PROCESS_MS) * 100)) : 0}%`;
  energyController.renderDevice(metalFormerMenu, metalFormer);
  if (!metalFormerRecipes.classList.contains('is-visible')) {
    renderMetalFormerRecipes(metalFormer);
  }
  renderCompactUpgrade(metalFormerUpgrade, level, MAX_METAL_FORMER_LEVEL, upgradeCost, 'металлоформовщик');
  metalFormerMenu.classList.add('is-visible');
}

function closeMetalFormerMenu() {
  metalFormerMenu.classList.remove('is-visible');
  metalFormerMenu.classList.remove('metal-former-menu--recipe-view');
  metalFormerRecipes.classList.remove('is-visible');
  selectedMetalFormer = null;
  selectedMetalFormerRecipeType = null;
}

function getRecipeMachineDefinition(machine) {
  return RECIPE_MACHINE_DEFINITIONS[machine?.dataset.productId] ?? null;
}

function renderRecipeMachineRecipes(machine) {
  const definition = getRecipeMachineDefinition(machine);
  if (!definition) return;
  if (!selectedRecipeMachineCategory) {
    recipeMachineRecipes.innerHTML = `<button type="button" class="metal-former-recipes-back" data-generic-recipe-close>← Производство</button>${definition.categories.map((category) => `
      <button type="button" data-generic-recipe-category="${category.id}"><span>${category.name}<small>Выбрать рецепт</small></span></button>
    `).join('')}`;
    return;
  }
  const category = definition.categories.find((item) => item.id === selectedRecipeMachineCategory);
  recipeMachineRecipes.innerHTML = `
    <button type="button" class="metal-former-recipes-back" data-generic-recipe-back>← Тип рецепта</button>
    <p class="recipe-machine-empty">Рецепты «${category?.name ?? ''}» будут добавлены вместе с ресурсами.</p>
  `;
}

function openRecipeMachineMenu(machine) {
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
  closeFilterMenu();
  closeDistributorMenu();
  closeMetalFormerMenu();
  pressMenu.classList.remove('is-visible');
  selectedPress = null;
  selectedRecipeMachine = machine;
  const definition = getRecipeMachineDefinition(machine);
  if (!definition) return;
  const level = Number(machine.dataset.level ?? 1);
  const upgradeCost = getUpgradeCost(machine, definition.upgradeCoefficient);
  recipeMachineTitle.textContent = definition.name;
  recipeMachineMenu.setAttribute('aria-label', `Меню: ${definition.name}`);
  recipeMachineLevel.textContent = `${level} ур.`;
  recipeMachineRate.textContent = `${formatAmount(definition.processMs / 1000)} сек.`;
  energyController.renderDevice(recipeMachineMenu, machine);
  renderCompactUpgrade(recipeMachineUpgrade, level, machines.maxLevel, upgradeCost, definition.name.toLowerCase());
  if (!recipeMachineRecipes.classList.contains('is-visible')) renderRecipeMachineRecipes(machine);
  recipeMachineMenu.classList.add('is-visible');
}

function closeRecipeMachineMenu() {
  recipeMachineMenu.classList.remove('is-visible', 'metal-former-menu--recipe-view');
  recipeMachineRecipes.classList.remove('is-visible');
  selectedRecipeMachine = null;
  selectedRecipeMachineCategory = null;
}

function renderGeneratorMenu(generator) {
  const level = Number(generator.dataset.level ?? 1);
  const upgradeCost = getUpgradeCost(generator, GENERATOR_UPGRADE_COEFFICIENT);
  const burnDuration = energyController.getGeneratorBurnDuration(level);
  const burnEndsAt = Number(generator.dataset.generatorBurnEndsAt ?? 0);
  const isBurning = generator.dataset.generatorIsActive !== 'false'
    && Number(generator.dataset.generatorCoalCount ?? 0) > 0
    && burnEndsAt > Date.now();
  const burnProgress = isBurning ? Math.max(0, Math.min(1, (burnEndsAt - Date.now()) / burnDuration)) : 0;
  const currentOutput = isBurning ? energyController.getGeneratorOutput(level) : 0;
  generatorLevel.textContent = `${level} ур.`;
  generatorOutputValue.textContent = formatAmount(currentOutput);
  generatorOutput.setAttribute('aria-label', `Текущая выработка энергии: ${formatAmount(currentOutput)}`);
  generatorBurnTime.textContent = `${formatAmount(burnDuration / 1000)} сек.`;
  generatorCoalCount.textContent = String(Number(generator.dataset.generatorCoalCount ?? 0));
  generatorFlameProgress.style.height = `${burnProgress * 100}%`;
  generatorFlame.setAttribute('aria-valuenow', String(Math.round(burnProgress * 100)));
  renderCompactUpgrade(generatorUpgrade, level, machines.maxLevel, upgradeCost, 'генератор');
}

function openGeneratorMenu(generator) {
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
  closeFilterMenu();
  closeDistributorMenu();
  closeMetalFormerMenu();
  closeRecipeMachineMenu();
  pressMenu.classList.remove('is-visible');
  selectedPress = null;
  selectedGenerator = generator;
  renderGeneratorMenu(generator);
  generatorMenu.classList.add('is-visible');
}

function closeGeneratorMenu() {
  generatorMenu.classList.remove('is-visible');
  selectedGenerator = null;
}

pressUpgrade.addEventListener('click', () => {
  if (!selectedPress || !buildings.has(selectedPress.dataset.cellKey)) return;
  const cost = getUpgradeCost(selectedPress, PRESS_UPGRADE_COEFFICIENT);
  if (Number(selectedPress.dataset.level ?? 1) >= MAX_FURNACE_LEVEL || getMoney() < cost) return;
  selectedPress.dataset.level = String(Number(selectedPress.dataset.level ?? 1) + 1);
  setMoney(getMoney() - cost);
  openPressMenu(selectedPress);
  saveGameState();
});

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
    warehouseOutput.clear(building);
    buildings.delete(building.dataset.cellKey);
    building.remove();
  });
  refreshConveyors();
  if (refund) setMoney(getMoney() + refund);
  else renderResources();
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
  if (graphic && !building.classList.contains('building--has-active-side')) {
    graphic.style.transform = `rotate(${nextRotation + (product?.defaultRotation ?? 0)}deg)`;
  }

  if (building.classList.contains('building--has-active-side')) {
    const sides = ['bottom', 'left', 'top', 'right'];
    building.dataset.activeSide = sides[nextRotation / 90];
  }

  if (building.classList.contains('building--conveyor')) refreshConveyors();
  else refreshBuildingConnections();
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
  if (!cell) {
    cellPreview.style.display = 'none';
    phaserRenderer.setPreview(null);
    return null;
  }

  cellPreview.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  cellPreview.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  cellPreview.style.width = `${100 / MAP_SIZE}%`;
  cellPreview.style.height = `${100 / MAP_SIZE}%`;
  cellPreview.style.display = 'block';
  phaserRenderer.setPreview({ x: cell.x, y: cell.y, width: 1, height: 1 });
  return cell;
}

function moveBuildingTo(cell) {
  if (!movingBuilding || !cell) return;
  const targetKey = `${cell.x}:${cell.y}`;
  const displacedBuilding = buildings.get(targetKey);
  const [originX, originY] = movingOriginKey.split(':').map(Number);
  buildings.delete(movingOriginKey);
  buildings.set(targetKey, movingBuilding);
  movingBuilding.dataset.cellKey = targetKey;
  movingBuilding.style.left = `${(cell.x / MAP_SIZE) * 100}%`;
  movingBuilding.style.top = `${(cell.y / MAP_SIZE) * 100}%`;
  if (displacedBuilding && displacedBuilding !== movingBuilding) {
    buildings.set(movingOriginKey, displacedBuilding);
    displacedBuilding.dataset.cellKey = movingOriginKey;
    displacedBuilding.style.left = `${(originX / MAP_SIZE) * 100}%`;
    displacedBuilding.style.top = `${(originY / MAP_SIZE) * 100}%`;
  }
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

let cameraRenderFrame = 0;

function renderCamera() {
  keepCameraInBounds();
  if (cameraRenderFrame) return;
  cameraRenderFrame = window.requestAnimationFrame(() => {
    cameraRenderFrame = 0;
    world.style.transform = `translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`;
  });
}

map.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  map.setPointerCapture(event.pointerId);
  if (activePointers.size === 2) {
    const [first, second] = [...activePointers.values()];
    pinchStart = {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      scale: camera.scale,
    };
    pointerStart = null;
    map.classList.remove('is-panning');
    return;
  }
  setInventoryOpen(false);
  const building = event.target.closest('.building');
  if (building?.classList.contains('building--draft')) {
    removeDraftBuilding(building);
    hidePlacementPreview();
    return;
  }
  if (deleteMode && building && !building.classList.contains('building--draft')) {
    toggleBuildingDeletion(building);
    return;
  }
  if (rotateMode && building && !building.classList.contains('building--draft')) {
    rotateBuilding(building);
    return;
  }
  if (moveMode && building && !building.classList.contains('building--draft')) {
    if (selectedBuildingForMove && selectedBuildingForMove !== building) {
      const [x, y] = building.dataset.cellKey.split(':').map(Number);
      movingBuilding = selectedBuildingForMove;
      movingOriginKey = selectedBuildingOriginKey;
      moveBuildingTo({ x, y });
      movingBuilding = null;
      movingOriginKey = null;
      clearMoveSelection();
      return;
    }
    selectBuildingForMove(building);
    return;
  }
  if (selectedRecipeMachine && building !== selectedRecipeMachine) closeRecipeMachineMenu();
  if (selectedGenerator && building !== selectedGenerator) closeGeneratorMenu();
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
  if (building?.classList.contains('building--press') && !selectedProduct && !draftBuildings.size) { openPressMenu(building); return; }
  if (building?.classList.contains('building--metal-former') && !selectedProduct && !draftBuildings.size) { openMetalFormerMenu(building); return; }
  if ((building?.classList.contains('building--former') || building?.classList.contains('building--component-assembler'))
    && !selectedProduct && !draftBuildings.size) { openRecipeMachineMenu(building); return; }
  if (building?.classList.contains('building--generator') && !selectedProduct && !draftBuildings.size) {
    openGeneratorMenu(building);
    return;
  }
  if (building?.classList.contains('building--warehouse') && !selectedProduct && !draftBuildings.size) {
    setShopOpen(false);
    setInventoryOpen(true, 'warehouse', building);
    return;
  }
  if (building?.classList.contains('building--filter') && !selectedProduct && !draftBuildings.size) {
    openFilterMenu(building);
    return;
  }
  if (building?.classList.contains('building--distributor') && !selectedProduct && !draftBuildings.size) {
    openDistributorMenu(building);
    return;
  }
  closeMachineMenu();
  closeCrusherMenu();
  closeFurnaceMenu();
  closeFilterMenu();
  closeDistributorMenu();
  pressMenu.classList.remove('is-visible');
  selectedPress = null;
  closeMetalFormerMenu();
  closeRecipeMachineMenu();
  closeGeneratorMenu();
  pointerStart = {
    x: event.clientX,
    y: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
  };
  map.classList.add('is-panning');
});

function handleMapPointerMove(event) {
  if (event.cancelable) event.preventDefault();
  const coalescedEvents = event.getCoalescedEvents?.();
  const pointerEvent = coalescedEvents?.length
    ? coalescedEvents[coalescedEvents.length - 1]
    : event;
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, { x: pointerEvent.clientX, y: pointerEvent.clientY });
  }
  if (pinchStart && activePointers.size >= 2) {
    const [first, second] = [...activePointers.values()];
    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    camera.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStart.scale * (distance / Math.max(1, pinchStart.distance))));
    cameraScaleWasAdjusted = true;
    renderCamera();
    return;
  }
  if (pointerStart) {
    camera.x += pointerEvent.clientX - pointerStart.lastX;
    camera.y += pointerEvent.clientY - pointerStart.lastY;
    pointerStart.lastX = pointerEvent.clientX;
    pointerStart.lastY = pointerEvent.clientY;
    renderCamera();
  }
  updatePlacementPreview(pointerEvent);
}

function handleMapTouchMove(event) {
  event.preventDefault();
  if (pinchStart && event.touches.length >= 2) {
    const [first, second] = event.touches;
    const distance = Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    camera.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStart.scale * (distance / Math.max(1, pinchStart.distance))));
    cameraScaleWasAdjusted = true;
    renderCamera();
    return;
  }

  const touch = event.touches[0];
  if (!touch || !pointerStart) return;
  camera.x += touch.clientX - pointerStart.lastX;
  camera.y += touch.clientY - pointerStart.lastY;
  pointerStart.lastX = touch.clientX;
  pointerStart.lastY = touch.clientY;
  renderCamera();
  updatePlacementPreview(touch);
}

const useAndroidStandaloneTouch = /Android/i.test(navigator.userAgent)
  && window.matchMedia('(display-mode: standalone)').matches;

if (useAndroidStandaloneTouch) {
  map.addEventListener('touchmove', handleMapTouchMove, { passive: false });
} else {
  map.addEventListener('pointermove', handleMapPointerMove, { passive: false });
}

map.addEventListener('pointerleave', () => {
  if (!movingBuilding) hidePlacementPreview();
});

function stopPanning(event) {
  const wasPinching = Boolean(pinchStart);
  activePointers.delete(event.pointerId);
  if (wasPinching) {
    if (activePointers.size < 2) pinchStart = null;
    pointerStart = null;
    map.classList.remove('is-panning');
    return;
  }
  const start = pointerStart;
  pointerStart = null;
  map.classList.remove('is-panning');
  if (moveMode && selectedBuildingForMove && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) {
    const cell = getCellAtPoint(event.clientX, event.clientY);
    if (cell) {
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
  activePointers.clear();
  pinchStart = null;
  pointerStart = null;
  map.classList.remove('is-panning');
});

map.addEventListener('wheel', (event) => {
  event.preventDefault();
  const nextScale = camera.scale * (event.deltaY > 0 ? 0.9 : 1.1);
  camera.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
  cameraScaleWasAdjusted = true;
  renderCamera();
}, { passive: false });

window.addEventListener('resize', () => {
  if (!cameraScaleWasAdjusted) {
    camera.scale = getFittedCameraScale();
    camera.x = 0;
    camera.y = 0;
  }
  renderCamera();
});

renderCamera();
restoreGameState();
renderResources();
renderShop();
renderInventory();
restoreServerGameState();
const runWhenCameraIdle = (callback) => () => {
  if (!isCameraGestureActive()) callback();
};

window.setInterval(runWhenCameraIdle(runDrills), 250);
window.setInterval(runWhenCameraIdle(runCrushers), 100);
window.setInterval(runWhenCameraIdle(runFurnaces), 100);
window.setInterval(runWhenCameraIdle(runPresses), 100);
window.setInterval(runWhenCameraIdle(runMetalFormers), 100);
window.setInterval(runWhenCameraIdle(runGenerators), 250);
window.setInterval(runWhenCameraIdle(energyController.updateStorage), 1_000);
window.setInterval(runWhenCameraIdle(() => saveGameState({ logServerSave: true })), 10_000);

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

machineUpgrade.addEventListener('click', () => {
  const upgradeCost = selectedDrill ? getUpgradeCost(selectedDrill, DRILL_UPGRADE_COEFFICIENT) : 0;
  if (!selectedDrill || !buildings.has(selectedDrill.dataset.cellKey)
    || Number(selectedDrill.dataset.level ?? 1) >= MAX_DRILL_LEVEL
    || getMoney() < upgradeCost) return;
  selectedDrill.dataset.level = String(Number(selectedDrill.dataset.level ?? 1) + 1);
  delete selectedDrill.dataset.nextProductionAt;
  setMoney(getMoney() - upgradeCost);
  openDrillMenu(selectedDrill);
  saveGameState();
});

machineToggle.addEventListener('click', () => {
  if (!selectedDrill || !buildings.has(selectedDrill.dataset.cellKey)) return;
  const isEnabled = selectedDrill.dataset.isEnabled === 'false';
  selectedDrill.dataset.isEnabled = String(isEnabled);
  delete selectedDrill.dataset.nextProductionAt;
  openDrillMenu(selectedDrill);
  saveGameState();
});

crusherUpgrade.addEventListener('click', () => {
  const upgradeCost = selectedCrusher ? getUpgradeCost(selectedCrusher, CRUSHER_UPGRADE_COEFFICIENT) : 0;
  if (!selectedCrusher || !buildings.has(selectedCrusher.dataset.cellKey)
    || Number(selectedCrusher.dataset.level ?? 1) >= MAX_CRUSHER_LEVEL
    || getMoney() < upgradeCost) return;
  selectedCrusher.dataset.level = String(Number(selectedCrusher.dataset.level ?? 1) + 1);
  setMoney(getMoney() - upgradeCost);
  renderCrusherMenu(selectedCrusher);
  saveGameState();
});

furnaceUpgrade.addEventListener('click', () => {
  const upgradeCost = selectedFurnace ? getUpgradeCost(selectedFurnace, FURNACE_UPGRADE_COEFFICIENT) : 0;
  if (!selectedFurnace || !buildings.has(selectedFurnace.dataset.cellKey)
    || Number(selectedFurnace.dataset.level ?? 1) >= MAX_FURNACE_LEVEL
    || getMoney() < upgradeCost) return;
  selectedFurnace.dataset.level = String(Number(selectedFurnace.dataset.level ?? 1) + 1);
  setMoney(getMoney() - upgradeCost);
  renderFurnaceMenu(selectedFurnace);
  saveGameState();
});

metalFormerRecipeButton.addEventListener('click', () => {
  if (!selectedMetalFormer) return;
  selectedMetalFormerRecipeType = null;
  renderMetalFormerRecipes(selectedMetalFormer);
  metalFormerMenu.classList.add('metal-former-menu--recipe-view');
  metalFormerRecipes.classList.add('is-visible');
});

metalFormerRecipes.addEventListener('click', (event) => {
  if (event.target.closest('[data-recipe-close]') && selectedMetalFormer) {
    selectedMetalFormerRecipeType = null;
    metalFormerRecipes.classList.remove('is-visible');
    metalFormerMenu.classList.remove('metal-former-menu--recipe-view');
    return;
  }
  const typeButton = event.target.closest('[data-recipe-type]');
  if (typeButton && selectedMetalFormer) {
    selectedMetalFormerRecipeType = typeButton.dataset.recipeType;
    renderMetalFormerRecipes(selectedMetalFormer);
    return;
  }
  if (event.target.closest('[data-recipe-back]') && selectedMetalFormer) {
    selectedMetalFormerRecipeType = null;
    renderMetalFormerRecipes(selectedMetalFormer);
    return;
  }
  const recipeButton = event.target.closest('[data-recipe-id]');
  if (!recipeButton || !selectedMetalFormer || !buildings.has(selectedMetalFormer.dataset.cellKey)) return;
  const recipeId = recipeButton.dataset.recipeId;
  const recipeResources = selectedMetalFormerRecipeType === 'bearing'
    ? bearingResources
    : selectedMetalFormerRecipeType === 'rod' ? rodResources : gearResources;
  const recipeIndex = recipeResources.findIndex((item) => item.id === recipeId);
  if (recipeIndex < 0 || recipeIndex >= getAvailableMetalFormerMaterialCount(Number(selectedMetalFormer.dataset.level ?? 1))) return;
  const previousRecipe = getMetalFormerRecipe(selectedMetalFormer);
  const nextInput = smeltedResources[recipeIndex];
  selectedMetalFormer.dataset.metalFormerRecipeId = recipeId;
  if (previousRecipe?.input.id !== nextInput?.id) {
    selectedMetalFormer.dataset.metalFormerInputCount = '0';
  }
  delete selectedMetalFormer.dataset.metalFormerNextProcessAt;
  selectedMetalFormerRecipeType = null;
  metalFormerRecipes.classList.remove('is-visible');
  metalFormerMenu.classList.remove('metal-former-menu--recipe-view');
  openMetalFormerMenu(selectedMetalFormer);
  saveGameState();
});

metalFormerUpgrade.addEventListener('click', () => {
  if (!selectedMetalFormer || !buildings.has(selectedMetalFormer.dataset.cellKey)) return;
  const level = Number(selectedMetalFormer.dataset.level ?? 1);
  const cost = getUpgradeCost(selectedMetalFormer, METAL_FORMER_UPGRADE_COEFFICIENT);
  if (level >= MAX_METAL_FORMER_LEVEL || getMoney() < cost) return;
  selectedMetalFormer.dataset.level = String(level + 1);
  setMoney(getMoney() - cost);
  openMetalFormerMenu(selectedMetalFormer);
  saveGameState();
});

recipeMachineRecipeButton.addEventListener('click', () => {
  if (!selectedRecipeMachine) return;
  selectedRecipeMachineCategory = null;
  renderRecipeMachineRecipes(selectedRecipeMachine);
  recipeMachineMenu.classList.add('metal-former-menu--recipe-view');
  recipeMachineRecipes.classList.add('is-visible');
});

recipeMachineRecipes.addEventListener('click', (event) => {
  if (event.target.closest('[data-generic-recipe-close]')) {
    selectedRecipeMachineCategory = null;
    recipeMachineRecipes.classList.remove('is-visible');
    recipeMachineMenu.classList.remove('metal-former-menu--recipe-view');
    return;
  }
  const categoryButton = event.target.closest('[data-generic-recipe-category]');
  if (categoryButton && selectedRecipeMachine) {
    selectedRecipeMachineCategory = categoryButton.dataset.genericRecipeCategory;
    renderRecipeMachineRecipes(selectedRecipeMachine);
    return;
  }
  if (event.target.closest('[data-generic-recipe-back]') && selectedRecipeMachine) {
    selectedRecipeMachineCategory = null;
    renderRecipeMachineRecipes(selectedRecipeMachine);
  }
});

recipeMachineUpgrade.addEventListener('click', () => {
  const definition = getRecipeMachineDefinition(selectedRecipeMachine);
  if (!selectedRecipeMachine || !definition || !buildings.has(selectedRecipeMachine.dataset.cellKey)) return;
  const level = Number(selectedRecipeMachine.dataset.level ?? 1);
  const cost = getUpgradeCost(selectedRecipeMachine, definition.upgradeCoefficient);
  if (level >= machines.maxLevel || getMoney() < cost) return;
  selectedRecipeMachine.dataset.level = String(level + 1);
  setMoney(getMoney() - cost);
  openRecipeMachineMenu(selectedRecipeMachine);
  saveGameState();
});

generatorUpgrade.addEventListener('click', () => {
  if (!selectedGenerator || !buildings.has(selectedGenerator.dataset.cellKey)) return;
  const level = Number(selectedGenerator.dataset.level ?? 1);
  const cost = getUpgradeCost(selectedGenerator, GENERATOR_UPGRADE_COEFFICIENT);
  if (level >= machines.maxLevel || getMoney() < cost) return;
  selectedGenerator.dataset.level = String(level + 1);
  setMoney(getMoney() - cost);
  renderGeneratorMenu(selectedGenerator);
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
  renderResources();
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
