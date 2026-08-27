const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const gameMenuButton = document.querySelector("#game-menu-button");
const menuOverlay = document.querySelector("#menu-overlay");
const startMenu = document.querySelector("#start-menu");
const loadGameMenu = document.querySelector("#load-game-menu");
const statisticsMenu = document.querySelector("#statistics-menu");
const pauseMenu = document.querySelector("#pause-menu");
const saveGameMenu = document.querySelector("#save-game-menu");
const victoryMenu = document.querySelector("#victory-menu");
const defeatMenu = document.querySelector("#defeat-menu");
const victoryTitle = document.querySelector("#victory-title");
const startGameButton = document.querySelector("#start-game-button");
const loadGameButton = document.querySelector("#load-game-button");
const loadGameBackButton = document.querySelector("#load-game-back-button");
const statisticsButton = document.querySelector("#statistics-button");
const statisticsBackButton = document.querySelector("#statistics-back-button");
const statisticsClearButton = document.querySelector("#statistics-clear-button");
const statisticsGames = document.querySelector("#statistics-games");
const statisticsWins = document.querySelector("#statistics-wins");
const statisticsLosses = document.querySelector("#statistics-losses");
const statisticsWinRate = document.querySelector("#statistics-win-rate");
const statisticsCurrentStreak = document.querySelector("#statistics-current-streak");
const statisticsBestStreak = document.querySelector("#statistics-best-streak");
const statisticsRobotBattles = document.querySelector("#statistics-robot-battles");
const statisticsByType = document.querySelector("#statistics-by-type");
const loadSlotButtons = document.querySelectorAll(
  "#load-game-menu .save-slot",
);
const saveSlotButtons = document.querySelectorAll(
  "#save-game-menu .save-slot",
);
const continueGameButton = document.querySelector("#continue-game-button");
const saveGameButton = document.querySelector("#save-game-button");
const saveGameBackButton = document.querySelector("#save-game-back-button");
const restartGameButton = document.querySelector("#restart-game-button");
const regenerateGameButton = document.querySelector("#regenerate-game-button");
const exitToMenuButton = document.querySelector("#exit-to-menu-button");
const newGameButton = document.querySelector("#new-game-button");
const victoryExitButton = document.querySelector("#victory-exit-button");
const defeatNewGameButton = document.querySelector("#defeat-new-game-button");
const defeatExitButton = document.querySelector("#defeat-exit-button");
const mapSizeSlider = document.querySelector("#map-size-slider");
const difficultySlider = document.querySelector("#difficulty-slider");
const speedSlider = document.querySelector("#speed-slider");
const quickPauseButton = document.querySelector("#quick-pause-button");
const quickPauseIcon = quickPauseButton.querySelector(".quick-pause-button__pause");
const quickPlayIcon = quickPauseButton.querySelector(".quick-pause-button__play");
const mountainsCheckbox = document.querySelector("#mountains-checkbox");
const robotBattleCheckbox = document.querySelector("#robot-battle-checkbox");
const playerCountSlider = document.querySelector("#player-count-slider");
const playerColorButtons = document.querySelectorAll("[data-player-color]");
const helpButton = document.querySelector("#help-button");
const helpPanel = document.querySelector("#help-panel");
const planetPanel = document.querySelector("#planet-panel");
const planetTypeButtons = document.querySelectorAll("[data-planet-type]");
const sendFractionButton = document.querySelector("#send-fraction-button");

const PLAYER_COLORS = {
  green: "#22a06b",
  red: "#ef5350",
  blue: "#3478f6",
  yellow: "#f4b740",
};
const COLORS = {
  player: PLAYER_COLORS.blue,
  enemy: PLAYER_COLORS.red,
  neutral: "#98a2b3",
  line: "#d0d5dd",
  text: "#ffffff",
};
const MAX_ENERGY = 10_000;
const TYPE_CHANGE_COST = 10;
const STANDARD_GENERATION = 1;
const ENERGY_TRAVEL_SPEED = 80;
const SHIELD_RECHARGE_TIME = 1;
const WORLD_WIDTH = 2_000;
const WORLD_HEIGHT = 2_000;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const PLANET_RADIUS = 13.524;
const MAX_CONNECTION_DISTANCE = PLANET_RADIUS * 2 * 12;
const MIN_PLANET_DISTANCE = PLANET_RADIUS * 5;
const SHIELD_OFFSET = 2.8175;
const SHIELD_LINE_WIDTH = 1.61;
const PLANET_TYPES = {
  standard: { generationMultiplier: 1, maxShield: 7 },
  economic: { generationMultiplier: 2, maxShield: 0 },
  defensive: { generationMultiplier: 0.5, maxShield: 20 },
};
const MAP_SIZE_RANGES = {
  small: [4, 6],
  medium: [10, 12],
  large: [30, 40],
  huge: [75, 90],
  hyper: [200, 250],
};
const MAP_SIZE_OPTIONS = ["small", "medium", "large", "huge", "hyper"];
const MAP_SIZE_LABELS = ["Малая", "Средняя", "Большая", "Огромная", "Гипер"];
const DIFFICULTY_OPTIONS = ["easy", "normal", "hard"];
const DIFFICULTY_LABELS = ["Лёгкий", "Средний", "Сложный"];
const DIFFICULTY_CONFIG = {
  easy: {
    minimumDecisionDelay: 1.5,
    maximumDecisionDelay: 2,
    maximumAttackReserve: 6,
    upgradeReserve: 25,
    defenseMargin: 0,
    rallyQuietTime: null,
    rallyMaximumWait: null,
    rallyAttackMultiplier: null,
    mistakeChance: 0.3,
    playerPriority: 0,
  },
  normal: {
    minimumDecisionDelay: 0.75,
    maximumDecisionDelay: 1.25,
    maximumAttackReserve: 4,
    upgradeReserve: 15,
    defenseMargin: 2,
    rallyQuietTime: 5,
    rallyMaximumWait: 20,
    rallyAttackMultiplier: 1.35,
    mistakeChance: 0,
    playerPriority: 2,
  },
  hard: {
    minimumDecisionDelay: 0.4,
    maximumDecisionDelay: 0.7,
    maximumAttackReserve: 2,
    upgradeReserve: 10,
    defenseMargin: 5,
    rallyQuietTime: 3,
    rallyMaximumWait: 12,
    rallyAttackMultiplier: 1.2,
    mistakeChance: 0,
    playerPriority: 6,
  },
};
const SPEED_OPTIONS = [0.1, 0.5, 1, 1.5, 2, 3];
const SETTINGS_STORAGE_KEY = "planet-flow-settings";
const STATISTICS_STORAGE_KEY = "planet-flow-statistics";
const SAVE_SLOTS_STORAGE_KEY = "planet-flow-save-slots";
const SAVE_SLOT_COUNT = 5;
const DEFAULT_SETTINGS = {
  mapSize: "medium",
  difficulty: "normal",
  speed: 1,
  mountains: false,
  robotBattle: false,
  playerCount: 2,
  playerColor: "blue",
};
const DEFAULT_STATISTICS = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  robotBattles: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  byType: {},
};
const PLAYER_COLOR_LABELS = {
  green: "Зелёный",
  red: "Красный",
  blue: "Синий",
  yellow: "Жёлтый",
};

function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
    return { ...DEFAULT_SETTINGS, ...savedSettings };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Игра продолжает работать, даже если хранилище браузера недоступно.
  }
}

function loadStatistics() {
  try {
    const savedStatistics = JSON.parse(
      localStorage.getItem(STATISTICS_STORAGE_KEY) || "{}",
    );
    return {
      ...DEFAULT_STATISTICS,
      ...savedStatistics,
      byType:
        savedStatistics.byType && typeof savedStatistics.byType === "object"
          ? savedStatistics.byType
          : {},
    };
  } catch {
    return { ...DEFAULT_STATISTICS, byType: {} };
  }
}

function saveStatistics() {
  try {
    localStorage.setItem(
      STATISTICS_STORAGE_KEY,
      JSON.stringify(statistics),
    );
  } catch {
    // Статистика не должна мешать игре при недоступном хранилище.
  }
}

function loadSaveSlots() {
  try {
    const storedSlots = JSON.parse(
      localStorage.getItem(SAVE_SLOTS_STORAGE_KEY) || "[]",
    );
    return Array.from(
      { length: SAVE_SLOT_COUNT },
      (_, index) => storedSlots[index] ?? null,
    );
  } catch {
    return Array(SAVE_SLOT_COUNT).fill(null);
  }
}

function saveSaveSlots() {
  try {
    localStorage.setItem(SAVE_SLOTS_STORAGE_KEY, JSON.stringify(saveSlots));
    return true;
  } catch {
    window.alert("Не удалось сохранить игру в localStorage.");
    return false;
  }
}

let planets = [];
let connections = [];
let routes = [];
let particles = [];
let captureEffects = [];
let drag = null;
let pan = null;
let pinch = null;
let selectedPlanet = null;
let lastTime = performance.now();
let result = null;
let statisticsRecorded = false;
let gameState = "menu";
let settings = loadSettings();
let statistics = loadStatistics();
let saveSlots = loadSaveSlots();
let currentGameConfiguration = null;
let selectedMapSize = MAP_SIZE_OPTIONS.includes(settings.mapSize) ? settings.mapSize : "medium";
settings.mapSize = selectedMapSize;
if (!DIFFICULTY_OPTIONS.includes(settings.difficulty)) settings.difficulty = "normal";
if (!SPEED_OPTIONS.includes(settings.speed)) settings.speed = 1;
settings.mountains = settings.mountains === true;
settings.robotBattle = settings.robotBattle === true;
if (![2, 3, 4].includes(settings.playerCount)) settings.playerCount = 2;
if (!PLAYER_COLORS[settings.playerColor]) settings.playerColor = "blue";
COLORS.player = PLAYER_COLORS[settings.playerColor];
let currentLevelLayout = null;
const camera = { x: 0, y: 0, zoom: 1 };
const activePointers = new Map();
const computerPlans = new Map();
const computerQuietTimers = new Map();

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  if (planets.length === 0) createLevel();
  clampCamera();
}

function createLevel(regenerate = true) {
  const width = WORLD_WIDTH;
  const height = WORLD_HEIGHT;
  let playerIndex;

  if (regenerate || !currentLevelLayout) {
    const [minimumPlanets, maximumPlanets] = MAP_SIZE_RANGES[selectedMapSize];
    const planetCount = minimumPlanets + Math.floor(Math.random() * (maximumPlanets - minimumPlanets + 1));
    const points = generatePlanetPositions(width, height, planetCount);
    planets = points.map((point, index) =>
      createPlanet(index + 1, point.x, point.y, PLANET_RADIUS, "neutral", 3, "standard"),
    );
    connections = generatePlanetConnections(planets);

    const spawnIndices = chooseSpawnIndices(planets, connections, settings.playerCount);
    [playerIndex] = spawnIndices;
    const spawnPoints = spawnIndices.map((index) => points[index]);
    const owners = settings.robotBattle
      ? spawnIndices.map((_, index) => `enemy${index + 1}`)
      : [
          "player",
          ...spawnIndices.slice(1).map((_, index) => `enemy${index + 1}`),
        ];
    const availableColors = Object.keys(PLAYER_COLORS).filter(
      (color) => settings.robotBattle || color !== settings.playerColor,
    );
    for (let index = availableColors.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [availableColors[index], availableColors[randomIndex]] = [
        availableColors[randomIndex],
        availableColors[index],
      ];
    }

    for (const owner of owners) {
      COLORS[owner] = owner === "player"
        ? PLAYER_COLORS[settings.playerColor]
        : PLAYER_COLORS[availableColors.shift()];
    }

    const ownerByPlanetIndex = new Map(
      spawnIndices.map((planetIndex, index) => [planetIndex, owners[index]]),
    );

    for (let index = 0; index < planets.length; index += 1) {
      const planet = planets[index];
      const owner = ownerByPlanetIndex.get(index) ?? "neutral";
      const energy = owner === "player"
        ? 3
        : owner === "neutral"
          ? neutralStartingEnergy(planet, spawnPoints)
          : 3;
      planet.owner = owner;
      planet.energy = energy;
      planet.shield = owner === "neutral" ? planet.maxShield : 0;
      planet.shieldTimer = 0;
    }
    currentLevelLayout = {
      playerIndex,
      colors: Object.fromEntries(
        owners.map((owner) => [owner, COLORS[owner]]),
      ),
      planets: planets.map((planet) => ({
        id: planet.id,
        x: planet.x,
        y: planet.y,
        owner: planet.owner,
        energy: planet.energy,
      })),
      connections: connections.map((connection) => ({
        firstId: connection.first.id,
        secondId: connection.second.id,
      })),
    };
  } else {
    playerIndex = currentLevelLayout.playerIndex;
    for (const [owner, color] of Object.entries(currentLevelLayout.colors)) {
      COLORS[owner] = color;
    }
    planets = currentLevelLayout.planets.map((planet) =>
      createPlanet(
        planet.id,
        planet.x,
        planet.y,
        PLANET_RADIUS,
        planet.owner,
        planet.energy,
        "standard",
      ),
    );
    connections = currentLevelLayout.connections.map((connection) => ({
      first: planets.find((planet) => planet.id === connection.firstId),
      second: planets.find((planet) => planet.id === connection.secondId),
    }));
  }

  routes = [];
  particles = [];
  captureEffects = [];
  drag = null;
  pan = null;
  pinch = null;
  activePointers.clear();
  selectPlanet(null);
  result = null;
  statisticsRecorded = false;
  currentGameConfiguration = {
    mode: settings.robotBattle ? "robotBattle" : "regular",
    mapSize: selectedMapSize,
    difficulty: settings.difficulty,
    playerCount: settings.playerCount,
    mountains: settings.mountains,
  };
  computerPlans.clear();
  computerQuietTimers.clear();
  camera.zoom = 1;
  centerCameraOn(planets[playerIndex]);
}

function gameTypeKey(configuration) {
  return [
    configuration.mode,
    configuration.mapSize,
    configuration.difficulty,
    configuration.playerCount,
    configuration.mountains ? "mountains" : "plain",
  ].join(":");
}

function recordGameStatistics(outcome) {
  if (statisticsRecorded || !currentGameConfiguration) return;
  statisticsRecorded = true;

  const typeKey = gameTypeKey(currentGameConfiguration);
  const previousTypeStatistics = statistics.byType[typeKey] ?? {
    ...currentGameConfiguration,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
  };
  const isWin = outcome === "win";
  const isLoss = outcome === "loss";

  statistics.gamesPlayed += 1;
  statistics.wins += isWin ? 1 : 0;
  statistics.losses += isLoss ? 1 : 0;
  statistics.robotBattles += outcome === "robotBattle" ? 1 : 0;

  if (isWin) {
    statistics.currentWinStreak += 1;
    statistics.bestWinStreak = Math.max(
      statistics.bestWinStreak,
      statistics.currentWinStreak,
    );
  } else if (isLoss) {
    statistics.currentWinStreak = 0;
  }

  statistics.byType[typeKey] = {
    ...previousTypeStatistics,
    gamesPlayed: previousTypeStatistics.gamesPlayed + 1,
    wins: previousTypeStatistics.wins + (isWin ? 1 : 0),
    losses: previousTypeStatistics.losses + (isLoss ? 1 : 0),
  };
  saveStatistics();
}

function finishGame(label, outcome) {
  if (result) return;
  result = label;
  recordGameStatistics(outcome);
}

function createGameSnapshot() {
  return {
    version: 1,
    savedAt: Date.now(),
    settings: { ...settings, mapSize: selectedMapSize },
    currentGameConfiguration: { ...currentGameConfiguration },
    colors: { ...COLORS },
    planets: planets.map((planet) => ({
      id: planet.id,
      x: planet.x,
      y: planet.y,
      radius: planet.radius,
      owner: planet.owner,
      energy: planet.energy,
      type: planet.type,
      shield: planet.shield,
      maxShield: planet.maxShield,
      shieldTimer: planet.shieldTimer,
      computerDecisionTimer: planet.computerDecisionTimer,
      displayScale: planet.displayScale,
      sendFraction: planet.sendFraction,
    })),
    connections: connections.map((connection) => ({
      firstId: connection.first.id,
      secondId: connection.second.id,
    })),
    routes: routes.map((route) => ({
      sourceId: route.source.id,
      targetId: route.target.id,
      timer: route.timer,
      purpose: route.purpose,
      repeat: route.repeat,
      reserve: route.reserve,
    })),
    particles: particles.map((particle) => ({
      sourceId: particle.source.id,
      targetId: particle.target.id,
      owner: particle.owner,
      amount: particle.amount,
      progress: particle.progress,
    })),
    captureEffects: captureEffects.map((effect) => ({ ...effect })),
    camera: { ...camera },
    currentLevelLayout,
    computerPlans: [...computerPlans.values()].map((plan) => ({
      owner: plan.owner,
      rallyId: plan.rally.id,
      targetId: plan.target.id,
      requiredEnergy: plan.requiredEnergy,
      age: plan.age,
    })),
    computerQuietTimers: Object.fromEntries(computerQuietTimers),
  };
}

function restoreGameSnapshot(snapshot) {
  if (snapshot?.version !== 1 || !Array.isArray(snapshot.planets)) {
    window.alert("Этот слот содержит неподдерживаемое сохранение.");
    return false;
  }

  settings = { ...DEFAULT_SETTINGS, ...snapshot.settings };
  selectedMapSize = MAP_SIZE_OPTIONS.includes(settings.mapSize)
    ? settings.mapSize
    : "medium";
  settings.mapSize = selectedMapSize;
  if (!DIFFICULTY_OPTIONS.includes(settings.difficulty)) {
    settings.difficulty = "normal";
  }
  if (!SPEED_OPTIONS.includes(settings.speed)) settings.speed = 1;
  settings.mountains = settings.mountains === true;
  settings.robotBattle = settings.robotBattle === true;
  if (![2, 3, 4].includes(settings.playerCount)) settings.playerCount = 2;
  if (!PLAYER_COLORS[settings.playerColor]) settings.playerColor = "blue";

  Object.assign(COLORS, snapshot.colors ?? {});
  COLORS.player = snapshot.colors?.player ?? PLAYER_COLORS[settings.playerColor];

  planets = snapshot.planets.map((savedPlanet) => {
    const planet = createPlanet(
      savedPlanet.id,
      savedPlanet.x,
      savedPlanet.y,
      savedPlanet.radius ?? PLANET_RADIUS,
      savedPlanet.owner,
      savedPlanet.energy,
      savedPlanet.type,
    );
    planet.shield = savedPlanet.shield;
    planet.maxShield = savedPlanet.maxShield;
    planet.shieldTimer = savedPlanet.shieldTimer;
    planet.computerDecisionTimer = savedPlanet.computerDecisionTimer;
    planet.displayScale = savedPlanet.displayScale ?? 1;
    planet.sendFraction = savedPlanet.sendFraction ?? 1;
    return planet;
  });

  const planetsById = new Map(planets.map((planet) => [planet.id, planet]));
  connections = (snapshot.connections ?? [])
    .map((connection) => ({
      first: planetsById.get(connection.firstId),
      second: planetsById.get(connection.secondId),
    }))
    .filter((connection) => connection.first && connection.second);
  routes = (snapshot.routes ?? [])
    .map((route) => ({
      source: planetsById.get(route.sourceId),
      target: planetsById.get(route.targetId),
      timer: route.timer,
      purpose: route.purpose,
      repeat: route.repeat,
      reserve: route.reserve,
    }))
    .filter((route) => route.source && route.target);
  particles = (snapshot.particles ?? [])
    .map((particle) => ({
      source: planetsById.get(particle.sourceId),
      target: planetsById.get(particle.targetId),
      owner: particle.owner,
      amount: particle.amount,
      progress: particle.progress,
    }))
    .filter((particle) => particle.source && particle.target);
  captureEffects = (snapshot.captureEffects ?? []).map((effect) => ({
    ...effect,
  }));

  computerPlans.clear();
  for (const savedPlan of snapshot.computerPlans ?? []) {
    const rally = planetsById.get(savedPlan.rallyId);
    const target = planetsById.get(savedPlan.targetId);
    if (!rally || !target) continue;
    computerPlans.set(savedPlan.owner, {
      owner: savedPlan.owner,
      rally,
      target,
      requiredEnergy: savedPlan.requiredEnergy,
      age: savedPlan.age,
    });
  }
  computerQuietTimers.clear();
  for (const [owner, timer] of Object.entries(
    snapshot.computerQuietTimers ?? {},
  )) {
    computerQuietTimers.set(owner, timer);
  }

  currentLevelLayout = snapshot.currentLevelLayout ?? null;
  currentGameConfiguration = snapshot.currentGameConfiguration ?? {
    mode: settings.robotBattle ? "robotBattle" : "regular",
    mapSize: selectedMapSize,
    difficulty: settings.difficulty,
    playerCount: settings.playerCount,
    mountains: settings.mountains,
  };
  camera.x = snapshot.camera?.x ?? 0;
  camera.y = snapshot.camera?.y ?? 0;
  camera.zoom = snapshot.camera?.zoom ?? 1;
  clampCamera();

  drag = null;
  pan = null;
  pinch = null;
  activePointers.clear();
  selectPlanet(null);
  result = null;
  statisticsRecorded = false;
  lastTime = performance.now();
  syncSettingsControls();
  saveSettings();
  return true;
}

function renderSaveSlot(button, snapshot, canSave) {
  const status = button.querySelector(".save-slot__header strong");
  const details = button.querySelectorAll(".save-slot__details > span");
  button.disabled = !canSave && !snapshot;
  button.classList.toggle("is-filled", Boolean(snapshot));

  if (!snapshot) {
    status.textContent = "Пусто";
    details[0].replaceChildren();
    const color = document.createElement("i");
    color.className = "save-slot__color";
    details[0].append(color, "Цвет: —");
    details[1].textContent = "Карта: —";
    details[2].textContent = "Сложность: —";
    details[3].textContent = "Игроков: —";
    return;
  }

  const configuration = snapshot.currentGameConfiguration ?? snapshot.settings;
  const savedAt = new Date(snapshot.savedAt);
  status.textContent = Number.isNaN(savedAt.getTime())
    ? "Сохранено"
    : savedAt.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

  details[0].replaceChildren();
  const color = document.createElement("i");
  color.className = "save-slot__color";
  const isRobotBattle = configuration.mode === "robotBattle";
  color.style.background = isRobotBattle
    ? "conic-gradient(#22a06b, #ef5350, #3478f6, #f4b740, #22a06b)"
    : PLAYER_COLORS[snapshot.settings.playerColor];
  details[0].append(
    color,
    `Цвет: ${
      isRobotBattle
        ? "Роботы"
        : PLAYER_COLOR_LABELS[snapshot.settings.playerColor] ?? "—"
    }`,
  );
  details[1].textContent = `Карта: ${statisticOptionLabel(
    MAP_SIZE_OPTIONS,
    MAP_SIZE_LABELS,
    configuration.mapSize,
  )}`;
  details[2].textContent = `Сложность: ${statisticOptionLabel(
    DIFFICULTY_OPTIONS,
    DIFFICULTY_LABELS,
    configuration.difficulty,
  )}`;
  details[3].textContent = `Игроков: ${configuration.playerCount}`;
}

function renderSaveSlots() {
  loadSlotButtons.forEach((button, index) => {
    renderSaveSlot(button, saveSlots[index], false);
  });
  saveSlotButtons.forEach((button, index) => {
    renderSaveSlot(button, saveSlots[index], true);
  });
}

function saveGameToSlot(index) {
  if (saveSlots[index]) {
    const confirmed = window.confirm(`Перезаписать слот ${index + 1}?`);
    if (!confirmed) return;
  }

  const previousSnapshot = saveSlots[index];
  saveSlots[index] = createGameSnapshot();
  if (!saveSaveSlots()) {
    saveSlots[index] = previousSnapshot;
    return;
  }
  renderSaveSlots();
}

function loadGameFromSlot(index) {
  const snapshot = saveSlots[index];
  if (!snapshot || !restoreGameSnapshot(snapshot)) return;
  gameState = "quickPaused";
  menuOverlay.hidden = true;
  gameMenuButton.hidden = false;
  showQuickPauseState(true);
}

function neutralStartingEnergy(point, spawnPoints) {
  if (!settings.mountains) return 3;

  const nearestSpawnDistance = Math.min(
    ...spawnPoints.map((spawnPoint) =>
      Math.hypot(point.x - spawnPoint.x, point.y - spawnPoint.y),
    ),
  );
  if (nearestSpawnDistance <= MAX_CONNECTION_DISTANCE && Math.random() < 0.9) {
    return 1 + Math.floor(Math.random() * 10);
  }

  if (Math.random() < 0.75) return 1 + Math.floor(Math.random() * 30);
  return 31 + Math.floor(Math.random() * 70);
}

function chooseSpawnIndices(levelPlanets, levelConnections, playerCount) {
  const indexByPlanet = new Map(
    levelPlanets.map((planet, index) => [planet, index]),
  );
  const adjacency = levelPlanets.map(() => []);

  for (const connection of levelConnections) {
    const firstIndex = indexByPlanet.get(connection.first);
    const secondIndex = indexByPlanet.get(connection.second);
    adjacency[firstIndex].push(secondIndex);
    adjacency[secondIndex].push(firstIndex);
  }

  const graphDistances = adjacency.map((_, startIndex) => {
    const distances = Array(levelPlanets.length).fill(Infinity);
    const queue = [startIndex];
    distances[startIndex] = 0;

    for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
      const current = queue[queueIndex];
      for (const neighbor of adjacency[current]) {
        if (distances[neighbor] !== Infinity) continue;
        distances[neighbor] = distances[current] + 1;
        queue.push(neighbor);
      }
    }

    return distances;
  });

  let farthestPair = [0, 1];
  let farthestDistance = 0;

  for (let first = 0; first < levelPlanets.length; first += 1) {
    for (let second = first + 1; second < levelPlanets.length; second += 1) {
      const distance = graphDistances[first][second];
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestPair = [first, second];
      }
    }
  }

  const selected = farthestPair.slice(0, Math.min(2, playerCount));
  while (selected.length < playerCount && selected.length < levelPlanets.length) {
    let bestIndex = -1;
    let bestDistance = -1;

    for (let index = 0; index < levelPlanets.length; index += 1) {
      if (selected.includes(index)) continue;
      const nearestPlayerDistance = Math.min(
        ...selected.map((selectedIndex) => graphDistances[index][selectedIndex]),
      );

      if (nearestPlayerDistance > bestDistance) {
        bestDistance = nearestPlayerDistance;
        bestIndex = index;
      }
    }

    selected.push(bestIndex);
  }

  return selected;
}

function clampCamera() {
  const visibleWidth = window.innerWidth / camera.zoom;
  const visibleHeight = window.innerHeight / camera.zoom;

  camera.x = visibleWidth >= WORLD_WIDTH
    ? (WORLD_WIDTH - visibleWidth) / 2
    : Math.max(0, Math.min(camera.x, WORLD_WIDTH - visibleWidth));
  camera.y = visibleHeight >= WORLD_HEIGHT
    ? (WORLD_HEIGHT - visibleHeight) / 2
    : Math.max(0, Math.min(camera.y, WORLD_HEIGHT - visibleHeight));
}

function centerCameraOn(planet) {
  camera.x = planet.x - window.innerWidth / camera.zoom / 2;
  camera.y = planet.y - window.innerHeight / camera.zoom / 2;
  clampCamera();
}

function setCameraZoom(zoom, screenX, screenY) {
  const worldX = camera.x + screenX / camera.zoom;
  const worldY = camera.y + screenY / camera.zoom;
  camera.zoom = Math.max(MIN_ZOOM, Math.min(zoom, MAX_ZOOM));
  camera.x = worldX - screenX / camera.zoom;
  camera.y = worldY - screenY / camera.zoom;
  clampCamera();
}

function generatePlanetPositions(width, height, planetCount) {
  const center = { x: width / 2, y: height / 2 };
  const points = [center];
  let placementRadius = MAX_CONNECTION_DISTANCE * 0.75;

  while (points.length < planetCount) {
    let candidate = null;

    for (let attempt = 1; attempt <= 600; attempt += 1) {
      if (attempt % 150 === 0) placementRadius += MAX_CONNECTION_DISTANCE * 0.25;

      const angle = Math.random() * Math.PI * 2;
      const distanceFromCenter = Math.sqrt(Math.random()) * placementRadius;
      const point = {
        x: center.x + Math.cos(angle) * distanceFromCenter,
        y: center.y + Math.sin(angle) * distanceFromCenter,
      };

      const distances = points.map((existing) =>
        Math.hypot(point.x - existing.x, point.y - existing.y),
      );
      const nearestDistance = Math.min(...distances);

      if (nearestDistance < MIN_PLANET_DISTANCE) continue;
      if (nearestDistance > MAX_CONNECTION_DISTANCE) continue;
      if (point.x < 50 || point.x > width - 50 || point.y < 50 || point.y > height - 50) continue;

      candidate = point;
      break;
    }

    if (!candidate) {
      placementRadius += MAX_CONNECTION_DISTANCE * 0.5;
      continue;
    }

    points.push(candidate);
  }

  return points;
}

function generatePlanetConnections(levelPlanets) {
  const result = [];
  const connected = [levelPlanets[0]];
  const remaining = levelPlanets.slice(1);

  while (remaining.length > 0) {
    const candidates = [];

    for (const first of connected) {
      for (const second of remaining) {
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance <= MAX_CONNECTION_DISTANCE) candidates.push({ first, second, distance });
      }
    }

    candidates.sort((first, second) => first.distance - second.distance);
    const choice = candidates[0];
    result.push({ first: choice.first, second: choice.second });
    connected.push(choice.second);
    remaining.splice(remaining.indexOf(choice.second), 1);
  }

  const extraCandidates = [];
  for (let firstIndex = 0; firstIndex < levelPlanets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < levelPlanets.length; secondIndex += 1) {
      const first = levelPlanets[firstIndex];
      const second = levelPlanets[secondIndex];
      if (result.some((connection) => areSameConnection(connection, first, second))) continue;

      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance > MAX_CONNECTION_DISTANCE) continue;

      extraCandidates.push({
        first,
        second,
        distance,
      });
    }
  }

  extraCandidates.sort((first, second) => first.distance - second.distance);
  const extraConnectionCount = Math.floor(Math.random() * 3);
  let addedConnections = 0;
  while (addedConnections < extraConnectionCount && extraCandidates.length > 0) {
    const choiceIndex = Math.floor(Math.random() * Math.min(8, extraCandidates.length));
    const choice = extraCandidates.splice(choiceIndex, 1)[0];

    const crossesExisting = result.some((connection) =>
      connectionsIntersect(connection, { first: choice.first, second: choice.second }),
    );
    if (crossesExisting) continue;

    result.push({ first: choice.first, second: choice.second });
    addedConnections += 1;
  }

  return result;
}

function areSameConnection(connection, first, second) {
  return (
    (connection.first === first && connection.second === second) ||
    (connection.first === second && connection.second === first)
  );
}

function connectionsIntersect(firstConnection, secondConnection) {
  const firstStart = firstConnection.first;
  const firstEnd = firstConnection.second;
  const secondStart = secondConnection.first;
  const secondEnd = secondConnection.second;

  if (
    firstStart === secondStart ||
    firstStart === secondEnd ||
    firstEnd === secondStart ||
    firstEnd === secondEnd
  ) {
    return false;
  }

  const cross = (start, end, point) =>
    (end.x - start.x) * (point.y - start.y) -
    (end.y - start.y) * (point.x - start.x);

  const firstSideA = cross(firstStart, firstEnd, secondStart);
  const firstSideB = cross(firstStart, firstEnd, secondEnd);
  const secondSideA = cross(secondStart, secondEnd, firstStart);
  const secondSideB = cross(secondStart, secondEnd, firstEnd);

  return firstSideA * firstSideB < 0 && secondSideA * secondSideB < 0;
}

function createPlanet(id, x, y, radius, owner, energy, type) {
  const maxShield = PLANET_TYPES[type].maxShield;
  return {
    id,
    x,
    y,
    radius,
    owner,
    energy,
    type,
    shield: owner === "neutral" ? maxShield : 0,
    maxShield,
    shieldTimer: 0,
    computerDecisionTimer: Math.random() * computerDecisionDelay(),
    displayScale: 1,
    sendFraction: 1,
  };
}

function setPlanetType(planet, type) {
  const maxShield = PLANET_TYPES[type].maxShield;
  planet.type = type;
  planet.maxShield = maxShield;
  planet.shield = 0;
  planet.shieldTimer = 0;
}

function planetAt(x, y) {
  const hitRadius = 24 / camera.zoom;
  return planets.find((planet) =>
    Math.hypot(x - planet.x, y - planet.y) <= Math.max(hitRadius, planet.radius),
  );
}

function areConnected(first, second) {
  return connections.some(
    (connection) =>
      (connection.first === first && connection.second === second) ||
      (connection.first === second && connection.second === first),
  );
}

function directionalTarget(source, x, y) {
  const dragX = x - source.x;
  const dragY = y - source.y;
  const dragDistance = Math.hypot(dragX, dragY);
  if (dragDistance * camera.zoom < 18) return null;

  const neighbors = connections
    .filter((connection) => connection.first === source || connection.second === source)
    .map((connection) => connection.first === source ? connection.second : connection.first);
  let bestTarget = null;
  let bestDirection = Math.cos(Math.PI / 5);

  for (const neighbor of neighbors) {
    const targetX = neighbor.x - source.x;
    const targetY = neighbor.y - source.y;
    const targetDistance = Math.hypot(targetX, targetY);
    const direction = (dragX * targetX + dragY * targetY) / (dragDistance * targetDistance);

    if (direction > bestDirection) {
      bestDirection = direction;
      bestTarget = neighbor;
    }
  }

  return bestTarget;
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;
  return {
    x: screenX / camera.zoom + camera.x,
    y: screenY / camera.zoom + camera.y,
    screenX,
    screenY,
  };
}

function selectPlanet(planet) {
  selectedPlanet = planet?.owner === "player" ? planet : null;
  planetPanel.hidden = !selectedPlanet;

  if (selectedPlanet) {
    updatePlanetTypeButtons();
    updateSendFractionButton();
    positionPlanetPanel();
  }
}

function positionPlanetPanel() {
  if (!selectedPlanet || planetPanel.hidden) return;
  planetPanel.dataset.placement = "docked";
  planetPanel.style.removeProperty("left");
  planetPanel.style.removeProperty("top");
}

function updatePlanetTypeButtons() {
  for (const button of planetTypeButtons) {
    const isActive = button.dataset.planetType === selectedPlanet?.type;
    button.closest(".planet-type-option").hidden = isActive;
    button.disabled = !selectedPlanet || selectedPlanet.energy < TYPE_CHANGE_COST;
  }
}

function updateSendFractionButton() {
  const labels = { 1: "Всё", 0.5: "½", 0.25: "¼" };
  const fraction = selectedPlanet?.sendFraction ?? 1;
  sendFractionButton.textContent = labels[fraction];
  sendFractionButton.title = `Отправляется: ${labels[fraction]}`;
}

sendFractionButton.addEventListener("click", () => {
  if (!selectedPlanet) return;
  const fractions = [1, 0.5, 0.25];
  const currentIndex = fractions.indexOf(selectedPlanet.sendFraction);
  selectedPlanet.sendFraction = fractions[(currentIndex + 1) % fractions.length];
  updateSendFractionButton();
});

for (const button of planetTypeButtons) {
  button.addEventListener("click", () => {
    if (!selectedPlanet || selectedPlanet.energy < TYPE_CHANGE_COST) return;

    selectedPlanet.energy -= TYPE_CHANGE_COST;
    setPlanetType(selectedPlanet, button.dataset.planetType);
    updatePlanetTypeButtons();
  });
}

function beginPinch() {
  const [first, second] = [...activePointers.values()].slice(0, 2);
  const middleX = (first.screenX + second.screenX) / 2;
  const middleY = (first.screenY + second.screenY) / 2;
  pinch = {
    startDistance: Math.hypot(first.screenX - second.screenX, first.screenY - second.screenY),
    startZoom: camera.zoom,
    worldX: camera.x + middleX / camera.zoom,
    worldY: camera.y + middleY / camera.zoom,
  };
  drag = null;
  pan = null;
}

function updatePinch() {
  const [first, second] = [...activePointers.values()].slice(0, 2);
  const distance = Math.hypot(first.screenX - second.screenX, first.screenY - second.screenY);
  const middleX = (first.screenX + second.screenX) / 2;
  const middleY = (first.screenY + second.screenY) / 2;
  camera.zoom = Math.max(
    MIN_ZOOM,
    Math.min(pinch.startZoom * (distance / Math.max(1, pinch.startDistance)), MAX_ZOOM),
  );
  camera.x = pinch.worldX - middleX / camera.zoom;
  camera.y = pinch.worldY - middleY / camera.zoom;
  clampCamera();
}

canvas.addEventListener("pointerdown", (event) => {
  closeHelpPanel();

  if (gameState !== "playing" || result) return;
  const point = pointerPosition(event);
  activePointers.set(event.pointerId, { screenX: point.screenX, screenY: point.screenY });

  if (activePointers.size === 2) {
    beginPinch();
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  const source = planetAt(point.x, point.y);

  if (source?.owner === "player") {
    selectPlanet(source);
    drag = { source, x: point.x, y: point.y, target: null };
    canvas.setPointerCapture(event.pointerId);
  } else if (!source) {
    selectPlanet(null);
    pan = {
      pointerId: event.pointerId,
      startX: point.screenX,
      startY: point.screenY,
      cameraX: camera.x,
      cameraY: camera.y,
    };
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", (event) => {
  const point = pointerPosition(event);
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, { screenX: point.screenX, screenY: point.screenY });
  }

  if (pinch && activePointers.size >= 2) {
    updatePinch();
    return;
  }

  if (pan?.pointerId === event.pointerId) {
    camera.x = pan.cameraX - (point.screenX - pan.startX) / camera.zoom;
    camera.y = pan.cameraY - (point.screenY - pan.startY) / camera.zoom;
    clampCamera();
    return;
  }

  if (!drag) return;
  drag.x = point.x;
  drag.y = point.y;
  drag.target = directionalTarget(drag.source, point.x, point.y);
});

canvas.addEventListener("pointerup", (event) => {
  const wasPinching = Boolean(pinch);
  activePointers.delete(event.pointerId);

  if (wasPinching) {
    pinch = null;
    drag = null;
    pan = null;
    return;
  }

  if (pan?.pointerId === event.pointerId) {
    pan = null;
    return;
  }

  if (!drag) return;
  const point = pointerPosition(event);
  const directTarget = planetAt(point.x, point.y);
  const target = directTarget && areConnected(drag.source, directTarget)
    ? directTarget
    : directionalTarget(drag.source, point.x, point.y);

  if (target === drag.source) {
    selectPlanet(drag.source);
  } else if (target && areConnected(drag.source, target)) {
    const existing = routes.find(
      (route) => route.source === drag.source && route.target === target,
    );

    if (!existing) {
      routes = routes.filter((route) => route.source !== drag.source);
      const route = { source: drag.source, target, timer: 0 };
      routes.push(route);
      sendRouteEnergy(route);
    }
  }

  drag = null;
});

canvas.addEventListener("pointercancel", () => {
  activePointers.clear();
  drag = null;
  pan = null;
  pinch = null;
});

canvas.addEventListener(
  "wheel",
  (event) => {
    if (gameState !== "playing") return;
    event.preventDefault();
    const point = pointerPosition(event);
    const zoomFactor = Math.exp(-event.deltaY * 0.0025);
    setCameraZoom(camera.zoom * zoomFactor, point.screenX, point.screenY);
  },
  { passive: false },
);

canvas.addEventListener("dblclick", (event) => {
  if (gameState !== "playing" || result) return;
  const point = pointerPosition(event);
  const planet = planetAt(point.x, point.y);

  if (planet?.owner === "player") {
    routes = routes.filter((route) => route.source !== planet);
  }
});

function showQuickPauseState(isPaused) {
  quickPauseIcon.hidden = isPaused;
  quickPlayIcon.hidden = !isPaused;
  quickPauseIcon.style.display = isPaused ? "none" : "block";
  quickPlayIcon.style.display = isPaused ? "block" : "none";
  quickPauseButton.setAttribute(
    "aria-label",
    isPaused ? "Продолжить игру" : "Поставить игру на паузу",
  );
  quickPauseButton.title = isPaused ? "Продолжить" : "Пауза";
}

function resumeGame() {
  gameState = "playing";
  menuOverlay.hidden = true;
  gameMenuButton.hidden = false;
  showQuickPauseState(false);
}

function statisticOptionLabel(options, labels, value) {
  const index = options.indexOf(value);
  return index >= 0 ? labels[index] : value;
}

function renderStatistics() {
  const completedPlayerGames = statistics.wins + statistics.losses;
  const winRate = completedPlayerGames > 0
    ? Math.round((statistics.wins / completedPlayerGames) * 100)
    : 0;

  statisticsGames.textContent = String(statistics.gamesPlayed);
  statisticsWins.textContent = String(statistics.wins);
  statisticsLosses.textContent = String(statistics.losses);
  statisticsWinRate.textContent = `${winRate}%`;
  statisticsCurrentStreak.textContent = String(statistics.currentWinStreak);
  statisticsBestStreak.textContent = String(statistics.bestWinStreak);
  statisticsRobotBattles.textContent = String(statistics.robotBattles);
  statisticsByType.replaceChildren();

  const typeStatistics = Object.values(statistics.byType)
    .sort((first, second) => second.gamesPlayed - first.gamesPlayed);

  if (typeStatistics.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "statistics-empty";
    emptyMessage.textContent = "Завершённых игр пока нет.";
    statisticsByType.append(emptyMessage);
    return;
  }

  for (const type of typeStatistics) {
    const row = document.createElement("div");
    row.className = "statistics-type";

    const title = document.createElement("strong");
    const mode = type.mode === "robotBattle" ? "Роботы" : "Обычная";
    const mapSize = statisticOptionLabel(
      MAP_SIZE_OPTIONS,
      MAP_SIZE_LABELS,
      type.mapSize,
    );
    const difficulty = statisticOptionLabel(
      DIFFICULTY_OPTIONS,
      DIFFICULTY_LABELS,
      type.difficulty,
    );
    title.textContent = [
      mode,
      mapSize,
      difficulty,
      `${type.playerCount} игрока`,
      type.mountains ? "Горы" : "Без гор",
    ].join(" · ");

    const resultText = document.createElement("span");
    resultText.textContent = type.mode === "robotBattle"
      ? `${type.gamesPlayed} завершено`
      : `${type.gamesPlayed} игр · ${type.wins} побед · ${type.losses} поражений`;

    row.append(title, resultText);
    statisticsByType.append(row);
  }
}

function showLoadGameMenu() {
  gameState = "menu";
  renderSaveSlots();
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = false;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = true;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
  closeHelpPanel();
}

function showStatisticsMenu() {
  gameState = "menu";
  renderStatistics();
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = false;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = true;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
  closeHelpPanel();
}

function showStartMenu() {
  gameState = "menu";
  menuOverlay.hidden = false;
  startMenu.hidden = false;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = true;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
  selectPlanet(null);
  closeHelpPanel();
  showQuickPauseState(false);
}

function showPauseMenu() {
  if (gameState !== "playing" && gameState !== "quickPaused") return;
  gameState = "paused";
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = false;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = true;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
  selectPlanet(null);
  closeHelpPanel();
}

function showSaveGameMenu() {
  gameState = "paused";
  renderSaveSlots();
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = false;
  victoryMenu.hidden = true;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
}

function returnToPauseMenu() {
  saveGameMenu.hidden = true;
  pauseMenu.hidden = false;
}

function showVictoryMenu() {
  gameState = "victory";
  victoryTitle.textContent = result || "Победа!";
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = false;
  defeatMenu.hidden = true;
  gameMenuButton.hidden = true;
  selectPlanet(null);
  closeHelpPanel();
  showQuickPauseState(false);
}

function showDefeatMenu() {
  gameState = "defeat";
  menuOverlay.hidden = false;
  startMenu.hidden = true;
  loadGameMenu.hidden = true;
  statisticsMenu.hidden = true;
  pauseMenu.hidden = true;
  saveGameMenu.hidden = true;
  victoryMenu.hidden = true;
  defeatMenu.hidden = false;
  gameMenuButton.hidden = true;
  selectPlanet(null);
  closeHelpPanel();
  showQuickPauseState(false);
}

function syncSettingsControls() {
  mapSizeSlider.value = String(MAP_SIZE_OPTIONS.indexOf(selectedMapSize));
  mapSizeSlider.setAttribute(
    "aria-valuetext",
    MAP_SIZE_LABELS[MAP_SIZE_OPTIONS.indexOf(selectedMapSize)],
  );
  difficultySlider.value = String(
    DIFFICULTY_OPTIONS.indexOf(settings.difficulty),
  );
  difficultySlider.setAttribute(
    "aria-valuetext",
    DIFFICULTY_LABELS[DIFFICULTY_OPTIONS.indexOf(settings.difficulty)],
  );
  speedSlider.value = String(SPEED_OPTIONS.indexOf(settings.speed));
  speedSlider.setAttribute("aria-valuetext", String(settings.speed));
  mountainsCheckbox.checked = settings.mountains;
  robotBattleCheckbox.checked = settings.robotBattle;
  playerCountSlider.value = String(settings.playerCount);
  playerCountSlider.setAttribute(
    "aria-valuetext",
    String(settings.playerCount),
  );
  document.documentElement.style.setProperty(
    "--player-color",
    PLAYER_COLORS[settings.playerColor],
  );

  for (const button of playerColorButtons) {
    const isActive = button.dataset.playerColor === settings.playerColor;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = settings.robotBattle;
  }
}

syncSettingsControls();

mapSizeSlider.addEventListener("input", () => {
  const index = Number(mapSizeSlider.value);
  selectedMapSize = MAP_SIZE_OPTIONS[index];
  settings.mapSize = selectedMapSize;
  mapSizeSlider.setAttribute("aria-valuetext", MAP_SIZE_LABELS[index]);
  saveSettings();
});

difficultySlider.addEventListener("input", () => {
  const index = Number(difficultySlider.value);
  settings.difficulty = DIFFICULTY_OPTIONS[index];
  difficultySlider.setAttribute(
    "aria-valuetext",
    DIFFICULTY_LABELS[index],
  );
  saveSettings();
});

speedSlider.addEventListener("input", () => {
  settings.speed = SPEED_OPTIONS[Number(speedSlider.value)];
  speedSlider.setAttribute("aria-valuetext", String(settings.speed));
  saveSettings();
});

mountainsCheckbox.addEventListener("change", () => {
  settings.mountains = mountainsCheckbox.checked;
  saveSettings();
});

robotBattleCheckbox.addEventListener("change", () => {
  settings.robotBattle = robotBattleCheckbox.checked;
  for (const button of playerColorButtons) {
    button.disabled = settings.robotBattle;
  }
  saveSettings();
});

playerCountSlider.addEventListener("input", () => {
  settings.playerCount = Number(playerCountSlider.value);
  playerCountSlider.setAttribute("aria-valuetext", String(settings.playerCount));
  saveSettings();
});

for (const button of playerColorButtons) {
  button.addEventListener("click", () => {
    settings.playerColor = button.dataset.playerColor;
    COLORS.player = PLAYER_COLORS[settings.playerColor];
    document.documentElement.style.setProperty("--player-color", PLAYER_COLORS[settings.playerColor]);

    for (const option of playerColorButtons) {
      const isActive = option === button;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    }

    saveSettings();
  });
}

startGameButton.addEventListener("click", () => {
  createLevel();
  resumeGame();
});
loadGameButton.addEventListener("click", showLoadGameMenu);
loadGameBackButton.addEventListener("click", showStartMenu);
loadSlotButtons.forEach((button, index) => {
  button.addEventListener("click", () => loadGameFromSlot(index));
});
saveSlotButtons.forEach((button, index) => {
  button.addEventListener("click", () => saveGameToSlot(index));
});
statisticsButton.addEventListener("click", showStatisticsMenu);
statisticsBackButton.addEventListener("click", showStartMenu);
statisticsClearButton.addEventListener("click", () => {
  const confirmed = window.confirm("Удалить всю накопленную статистику?");
  if (!confirmed) return;

  statistics = { ...DEFAULT_STATISTICS, byType: {} };
  saveStatistics();
  renderStatistics();
});
continueGameButton.addEventListener("click", resumeGame);
saveGameButton.addEventListener("click", showSaveGameMenu);
saveGameBackButton.addEventListener("click", returnToPauseMenu);
restartGameButton.addEventListener("click", () => {
  createLevel(false);
  resumeGame();
});
regenerateGameButton.addEventListener("click", () => {
  createLevel(true);
  resumeGame();
});
exitToMenuButton.addEventListener("click", () => {
  createLevel();
  showStartMenu();
});
newGameButton.addEventListener("click", () => {
  createLevel();
  resumeGame();
});
victoryExitButton.addEventListener("click", () => {
  createLevel();
  showStartMenu();
});
defeatNewGameButton.addEventListener("click", () => {
  createLevel();
  resumeGame();
});
defeatExitButton.addEventListener("click", () => {
  createLevel();
  showStartMenu();
});
quickPauseButton.addEventListener("click", () => {
  if (gameState === "playing") {
    gameState = "quickPaused";
    selectPlanet(null);
    showQuickPauseState(true);
  } else if (gameState === "quickPaused") {
    resumeGame();
  }
});
gameMenuButton.addEventListener("click", showPauseMenu);

function openHelpPanel() {
  helpPanel.classList.remove("is-closing");
  helpPanel.hidden = false;
  helpButton.setAttribute("aria-expanded", "true");
}

function closeHelpPanel() {
  if (helpPanel.hidden || helpPanel.classList.contains("is-closing")) return;
  helpPanel.classList.add("is-closing");
  helpButton.setAttribute("aria-expanded", "false");
}

helpPanel.addEventListener("animationend", () => {
  if (!helpPanel.classList.contains("is-closing")) return;
  helpPanel.hidden = true;
  helpPanel.classList.remove("is-closing");
});

helpButton.addEventListener("click", () => {
  const isOpen = !helpPanel.hidden && !helpPanel.classList.contains("is-closing");
  if (isOpen) closeHelpPanel();
  else openHelpPanel();
});
window.addEventListener("resize", resize);

function sendRouteEnergy(route) {
  const availableEnergy = Math.max(
    0,
    route.source.energy - (route.reserve ?? 0),
  );
  if (availableEnergy < 1 || route.source.owner === "neutral") return;

  const fraction = route.source.owner === "player"
    ? route.source.sendFraction
    : 1;
  const amount = Math.min(
    availableEnergy,
    Math.ceil(availableEnergy * fraction),
  );

  route.source.energy -= amount;
  particles.push({
    source: route.source,
    target: route.target,
    owner: route.source.owner,
    amount,
    progress: 0,
  });
}

function areOppositeParticles(first, second) {
  return (
    first.owner !== second.owner &&
    first.source === second.target &&
    first.target === second.source
  );
}

function resolveParticleCollisions() {
  const destroyedParticles = new Set();

  for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
    const first = particles[firstIndex];
    if (destroyedParticles.has(first)) continue;

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < particles.length;
      secondIndex += 1
    ) {
      const second = particles[secondIndex];
      if (destroyedParticles.has(second)) continue;
      if (!areOppositeParticles(first, second)) continue;
      if (first.progress + second.progress < 1) continue;

      const difference = first.amount - second.amount;
      if (Math.abs(difference) < 0.001) {
        destroyedParticles.add(first);
        destroyedParticles.add(second);
        break;
      }

      if (difference > 0) {
        first.amount = difference;
        destroyedParticles.add(second);
      } else {
        second.amount = Math.abs(difference);
        destroyedParticles.add(first);
        break;
      }
    }
  }

  particles = particles.filter(
    (particle) => !destroyedParticles.has(particle),
  );
}

function deliver(particle) {
  const target = particle.target;

  if (target.owner === particle.owner) {
    target.energy = Math.min(MAX_ENERGY, target.energy + particle.amount);
    return;
  }

  let damage = particle.amount;
  const absorbedDamage = Math.min(target.shield, damage);
  target.shield -= absorbedDamage;
  damage -= absorbedDamage;
  target.energy -= damage;

  if (target.energy <= 0) {
    routes = routes.filter((route) => route.source !== target);
    target.owner = particle.owner;
    target.energy = Math.min(MAX_ENERGY, Math.abs(target.energy));
    setPlanetType(target, "standard");
    target.sendFraction = 1;
    captureEffects.push({
      x: target.x,
      y: target.y,
      color: COLORS[particle.owner],
      progress: 0,
    });
  }
}

function connectedPlanets(source) {
  const neighbors = [];

  for (const connection of connections) {
    if (connection.first === source) neighbors.push(connection.second);
    if (connection.second === source) neighbors.push(connection.first);
  }

  return neighbors;
}

function computerDecisionDelay() {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  return (
    config.minimumDecisionDelay +
    Math.random() *
      (config.maximumDecisionDelay - config.minimumDecisionDelay)
  );
}

function requiredComputerAttackEnergy(target, owner) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  let defense = target.energy + target.shield;

  if (settings.difficulty === "hard") {
    const possibleAttackers = connectedPlanets(target).filter(
      (planet) => planet.owner === owner,
    ).length;
    defense /= Math.max(1, possibleAttackers);
  }

  return (
    defense +
    Math.floor(
      Math.random() ** 2 * (config.maximumAttackReserve + 1),
    )
  );
}

function computerPlanetUpgradeType(planet) {
  if (planet.type === "defensive") return null;
  const neighbors = connectedPlanets(planet);
  const bordersOpponent = neighbors.some(
    (neighbor) =>
      neighbor.owner !== "neutral" && neighbor.owner !== planet.owner,
  );
  const isBackline = neighbors.every(
    (neighbor) => neighbor.owner === planet.owner,
  );
  const blockedByStrongNeutral = neighbors.some(
    (neighbor) =>
      neighbor.owner === "neutral" &&
      neighbor.energy + neighbor.shield >= planet.energy,
  );

  if (computerThreatLevel(planet, planet.owner) > 0 || bordersOpponent) {
    return "defensive";
  }
  if (planet.type !== "standard") return null;
  if (isBackline || blockedByStrongNeutral) return "economic";
  return null;
}

function upgradeComputerPlanet(planet, type) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  if (
    !type ||
    planet.type === type ||
    planet.energy < TYPE_CHANGE_COST + config.upgradeReserve
  ) {
    return false;
  }

  planet.energy -= TYPE_CHANGE_COST;
  setPlanetType(planet, type);
  return true;
}

function computerSupportTarget(source, owner) {
  const visited = new Set([source]);
  const queue = connectedPlanets(source)
    .filter((planet) => planet.owner === owner)
    .map((planet) => ({ planet, firstStep: planet }));

  for (const item of queue) visited.add(item.planet);

  for (let index = 0; index < queue.length; index += 1) {
    const { planet, firstStep } = queue[index];
    const neighbors = connectedPlanets(planet);
    const isFrontline = neighbors.some(
      (neighbor) => neighbor.owner !== owner,
    );
    if (isFrontline) return firstStep;

    for (const neighbor of neighbors) {
      if (neighbor.owner !== owner || visited.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push({ planet: neighbor, firstStep });
    }
  }

  return null;
}

function computerThreatLevel(planet, owner) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  let hostileIncomingEnergy = 0;
  let friendlyIncomingEnergy = 0;

  for (const particle of particles) {
    if (particle.target !== planet) continue;
    if (particle.owner === owner) friendlyIncomingEnergy += particle.amount;
    else hostileIncomingEnergy += particle.amount;
  }

  if (hostileIncomingEnergy === 0) return 0;

  return (
    hostileIncomingEnergy +
    config.defenseMargin -
    planet.energy -
    planet.shield -
    friendlyIncomingEnergy
  );
}

function threatenedComputerNeighbor(source, owner) {
  return connectedPlanets(source)
    .filter((planet) => planet.owner === owner)
    .map((planet) => ({
      planet,
      threat: computerThreatLevel(planet, owner),
    }))
    .filter((item) => item.threat > 0)
    .sort((first, second) => second.threat - first.threat)[0]?.planet ?? null;
}

function computerFirstStepToward(source, target, owner) {
  if (source === target) return null;

  const visited = new Set([source]);
  const queue = connectedPlanets(source)
    .filter((planet) => planet.owner === owner)
    .map((planet) => ({ planet, firstStep: planet }));

  for (const item of queue) visited.add(item.planet);

  for (let index = 0; index < queue.length; index += 1) {
    const { planet, firstStep } = queue[index];
    if (planet === target) return firstStep;

    for (const neighbor of connectedPlanets(planet)) {
      if (neighbor.owner !== owner || visited.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push({ planet: neighbor, firstStep });
    }
  }

  return null;
}

function computerOwnedDistances(origin, owner) {
  const distances = new Map([[origin, 0]]);
  const queue = [origin];

  for (let index = 0; index < queue.length; index += 1) {
    const planet = queue[index];
    for (const neighbor of connectedPlanets(planet)) {
      if (neighbor.owner !== owner || distances.has(neighbor)) continue;
      distances.set(neighbor, distances.get(planet) + 1);
      queue.push(neighbor);
    }
  }

  return distances;
}

function createHardComputerPlan(owner) {
  const candidates = [];

  for (const rally of planets.filter((planet) => planet.owner === owner)) {
    const distances = computerOwnedDistances(rally, owner);
    const availableEnergy = [...distances.keys()].reduce(
      (total, planet) => total + Math.max(0, planet.energy - 3),
      0,
    );
    const income = [...distances.keys()].reduce(
      (total, planet) =>
        total + PLANET_TYPES[planet.type].generationMultiplier,
      0,
    );

    for (const target of connectedPlanets(rally)) {
      if (target.owner === owner || target.owner === "neutral") continue;

      const defense = target.energy + target.shield;
      const opponentBonus = target.owner === "player" ? 40 : 24;
      const economicBonus = target.type === "economic" ? 12 : 0;
      const connectivityBonus = connectedPlanets(target).length * 4;
      const adjacentAttackers = connectedPlanets(target).filter(
        (planet) => planet.owner === owner,
      ).length;

      candidates.push({
        rally,
        target,
        score:
          opponentBonus +
          economicBonus +
          connectivityBonus +
          adjacentAttackers * 8 +
          Math.min(30, availableEnergy * 0.2 + income * 2) -
          defense * 1.4,
      });
    }
  }

  candidates.sort((first, second) => second.score - first.score);
  const choice = candidates[0];
  if (!choice) return null;

  return {
    owner,
    rally: choice.rally,
    target: choice.target,
    requiredEnergy: Math.ceil(
      (choice.target.energy + choice.target.shield) * 1.15 + 6,
    ),
    age: 0,
  };
}

function hardComputerRequiredEnergy(plan) {
  const attackers = connectedPlanets(plan.target).filter(
    (planet) => planet.owner === plan.owner,
  );
  const longestTravelTime = attackers.reduce((longest, attacker) => {
    const distance = Math.hypot(
      plan.target.x - attacker.x,
      plan.target.y - attacker.y,
    );
    return Math.max(longest, distance / ENERGY_TRAVEL_SPEED);
  }, 0);
  const targetGeneration = plan.target.owner === "neutral"
    ? 0
    : STANDARD_GENERATION *
      PLANET_TYPES[plan.target.type].generationMultiplier *
      settings.speed;
  let projectedDefense =
    plan.target.energy +
    plan.target.shield +
    targetGeneration * longestTravelTime;

  for (const particle of particles) {
    if (particle.target !== plan.target) continue;
    projectedDefense += particle.owner === plan.target.owner
      ? particle.amount
      : -particle.amount;
  }

  return Math.max(1, Math.ceil(projectedDefense + 6));
}

function launchHardComputerAttack(plan) {
  const attackers = connectedPlanets(plan.target)
    .filter(
      (planet) =>
        planet.owner === plan.owner &&
        computerThreatLevel(planet, plan.owner) <= 0 &&
        planet.energy >= 1,
    )
    .sort((first, second) => second.energy - first.energy);
  const requiredEnergy = hardComputerRequiredEnergy(plan);
  const selectedAttackers = [];
  let attackEnergy = 0;

  for (const attacker of attackers) {
    selectedAttackers.push(attacker);
    attackEnergy += attacker.energy;
    if (attackEnergy >= requiredEnergy) break;
  }

  if (attackEnergy < requiredEnergy) return false;

  for (const source of selectedAttackers) {
    routes = routes.filter((route) => route.source !== source);
    const route = {
      source,
      target: plan.target,
      timer: 0,
      purpose: "attack",
      repeat: false,
    };
    routes.push(route);
    sendRouteEnergy(route);
  }

  return true;
}

function createComputerRallyPlan(owner) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  if (config.rallyQuietTime === null) return null;
  if (settings.difficulty === "hard") return createHardComputerPlan(owner);

  const candidates = [];
  for (const rally of planets.filter((planet) => planet.owner === owner)) {
    for (const target of connectedPlanets(rally)) {
      if (target.owner === owner || target.owner === "neutral") continue;

      const defense = target.energy + target.shield;
      const friendlyConnections = connectedPlanets(rally).filter(
        (planet) => planet.owner === owner,
      ).length;
      candidates.push({
        rally,
        target,
        defense,
        score:
          defense -
          friendlyConnections * 5 -
          (target.owner === "player" ? config.playerPriority : 0),
      });
    }
  }

  candidates.sort((first, second) => first.score - second.score);
  const choice = candidates[0];
  if (!choice) return null;

  return {
    owner,
    rally: choice.rally,
    target: choice.target,
    requiredEnergy: Math.max(
      10,
      Math.ceil(choice.defense * config.rallyAttackMultiplier + 5),
    ),
    age: 0,
  };
}

function updateComputerPlans(computerOwners, delta) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  const requiredQuietTime = settings.difficulty === "hard"
    ? 1
    : config.rallyQuietTime;

  for (const owner of computerOwners) {
    const isUnderAttack = particles.some(
      (particle) =>
        particle.target.owner === owner && particle.owner !== owner,
    );
    const quietTime = isUnderAttack
      ? 0
      : (computerQuietTimers.get(owner) ?? 0) + delta;
    computerQuietTimers.set(owner, quietTime);

    const plan = computerPlans.get(owner);
    if (plan) {
      plan.age += delta;
      const invalidPlan =
        plan.rally.owner !== owner || plan.target.owner === owner;
      const threatenedRally = computerThreatLevel(plan.rally, owner) > 0;
      if (invalidPlan || threatenedRally) {
        computerPlans.delete(owner);
        computerQuietTimers.set(owner, 0);
      }
    }

    if (
      !computerPlans.has(owner) &&
      requiredQuietTime !== null &&
      quietTime >= requiredQuietTime
    ) {
      const newPlan = createComputerRallyPlan(owner);
      if (newPlan) computerPlans.set(owner, newPlan);
    }
  }
}

function updateComputerPlayers(delta) {
  const config = DIFFICULTY_CONFIG[settings.difficulty];
  const readyPlanets = new Set();

  for (const planet of planets) {
    if (!planet.owner.startsWith("enemy")) continue;

    planet.computerDecisionTimer -= delta;
    if (planet.computerDecisionTimer > 0) continue;

    readyPlanets.add(planet);
    planet.computerDecisionTimer = computerDecisionDelay();
  }

  const computerOwners = [
    ...new Set(
      planets
        .filter((planet) => planet.owner.startsWith("enemy"))
        .map((planet) => planet.owner),
    ),
  ];

  updateComputerPlans(computerOwners, delta);

  for (const owner of computerOwners) {
    const activePlan = computerPlans.get(owner);
    if (
      settings.difficulty === "hard" &&
      activePlan &&
      launchHardComputerAttack(activePlan)
    ) {
      computerPlans.delete(owner);
      computerQuietTimers.set(owner, 0);
    }

    const ownedPlanets = planets
      .filter(
        (planet) => planet.owner === owner && readyPlanets.has(planet),
      )
      .sort((first, second) => second.energy - first.energy);

    for (const source of ownedPlanets) {
      const existingRoute = routes.find((route) => route.source === source);
      const plannedUpgrade = computerPlanetUpgradeType(source);
      const sourceThreat = computerThreatLevel(source, owner);
      const threatenedNeighbor = threatenedComputerNeighbor(source, owner);
      const plan = computerPlans.get(owner);

      if (sourceThreat > 0) {
        routes = routes.filter((route) => route.source !== source);
        upgradeComputerPlanet(source, "defensive");
        continue;
      }

      if (threatenedNeighbor) {
        routes = routes.filter((route) => route.source !== source);
        if (source.energy >= 1) {
          const route = {
            source,
            target: threatenedNeighbor,
            timer: 0,
            purpose: "defense",
            repeat: false,
          };
          routes.push(route);
          sendRouteEnergy(route);
        }
        continue;
      }

      if (plan?.rally === source) {
        routes = routes.filter((route) => route.source !== source);
        const targetDefense = plan.target.energy + plan.target.shield;
        const waitedTooLong = plan.age >= config.rallyMaximumWait;
        if (settings.difficulty === "hard") {
          if (waitedTooLong) {
            computerPlans.delete(owner);
            computerQuietTimers.set(owner, 0);
          }
          continue;
        }
        const canAttack =
          source.energy >= plan.requiredEnergy ||
          (waitedTooLong && source.energy >= targetDefense + 1);

        if (canAttack) {
          const route = {
            source,
            target: plan.target,
            timer: 0,
            purpose: "attack",
            repeat: false,
          };
          routes.push(route);
          sendRouteEnergy(route);
          computerPlans.delete(owner);
          computerQuietTimers.set(owner, 0);
        } else if (waitedTooLong) {
          computerPlans.delete(owner);
          computerQuietTimers.set(owner, 0);
        }
        continue;
      }

      if (plan) {
        const bordersOpponent = connectedPlanets(source).some(
          (planet) =>
            planet.owner !== "neutral" && planet.owner !== owner,
        );
        const attacksPlannedTarget = connectedPlanets(source).includes(
          plan.target,
        );
        if (settings.difficulty === "hard" && attacksPlannedTarget) {
          routes = routes.filter(
            (route) =>
              route.source !== source || route.purpose === "defense",
          );
          continue;
        }
        const rallyStep =
          settings.difficulty === "hard" || !bordersOpponent
            ? computerFirstStepToward(source, plan.rally, owner)
            : null;

        if (rallyStep) {
          const followsPlan =
            existingRoute?.purpose === "rally" &&
            existingRoute.target === rallyStep;
          if (!followsPlan) {
            routes = routes.filter((route) => route.source !== source);
            if (source.energy >= 5) {
              const route = {
                source,
                target: rallyStep,
                timer: 0,
                purpose: "rally",
                reserve:
                  settings.difficulty === "hard" && bordersOpponent ? 7 : 3,
              };
              routes.push(route);
              sendRouteEnergy(route);
            }
          }
          continue;
        }
      }

      if (existingRoute?.purpose === "defense") {
        routes = routes.filter((route) => route !== existingRoute);
      }

      if (
        existingRoute &&
        existingRoute.purpose === "support" &&
        plannedUpgrade
      ) {
        routes = routes.filter((route) => route !== existingRoute);
      }

      if (
        existingRoute &&
        existingRoute.purpose === "attack" &&
        existingRoute.target.owner !== owner
      ) {
        routes = routes.filter((route) => route !== existingRoute);
      }

      if (
        existingRoute &&
        existingRoute.purpose === "attack" &&
        existingRoute.target.owner === owner &&
        existingRoute.target.energy >= 5
      ) {
        routes = routes.filter((route) => route !== existingRoute);
      }

      upgradeComputerPlanet(source, plannedUpgrade);
      if (
        plannedUpgrade === "economic" &&
        source.type === "standard"
      ) {
        continue;
      }
      if (routes.some((route) => route.source === source)) continue;

      const neighboringTargets = connectedPlanets(source).filter(
        (planet) => planet.owner !== owner,
      );
      const targets = neighboringTargets
        .map((planet) => ({
          planet,
          requiredEnergy: requiredComputerAttackEnergy(planet, owner),
        }))
        .filter((target) => source.energy >= target.requiredEnergy)
        .sort((first, second) => {
          const firstPriority =
            first.requiredEnergy -
            (first.planet.owner === "player" ? config.playerPriority : 0);
          const secondPriority =
            second.requiredEnergy -
            (second.planet.owner === "player" ? config.playerPriority : 0);
          return firstPriority - secondPriority;
        });

      if (targets.length > 0) {
        const selectedTarget =
          targets.length > 1 && Math.random() < config.mistakeChance
            ? targets[Math.floor(Math.random() * targets.length)]
            : targets[0];
        const route = {
          source,
          target: selectedTarget.planet,
          timer: 0,
          purpose: "attack",
          repeat: false,
        };
        routes.push(route);
        sendRouteEnergy(route);
        continue;
      }

      if (neighboringTargets.length > 0 || source.energy < 5) continue;

      const supportTarget = computerSupportTarget(source, owner);
      if (!supportTarget) continue;

      const route = {
        source,
        target: supportTarget,
        timer: 0,
        purpose: "support",
      };
      routes.push(route);
      sendRouteEnergy(route);
    }
  }
}

function update(delta) {
  if (gameState !== "playing") return;

  for (const effect of captureEffects) {
    effect.progress += delta * 1.35;
  }
  captureEffects = captureEffects.filter((effect) => effect.progress < 1);

  if (result) {
    if (captureEffects.length === 0) {
      if (result === "Поражение") showDefeatMenu();
      else showVictoryMenu();
    }
    return;
  }

  for (const planet of planets) {
    const targetScale = selectedPlanet === planet ? 1.1 : 1;
    const scaleSpeed = Math.min(1, delta * 12);
    planet.displayScale += (targetScale - planet.displayScale) * scaleSpeed;

    if (planet.owner !== "neutral") {
      const generation = STANDARD_GENERATION * PLANET_TYPES[planet.type].generationMultiplier;
      planet.energy = Math.min(
        MAX_ENERGY,
        planet.energy + delta * generation * settings.speed,
      );
    }

    if (planet.shield < planet.maxShield) {
      planet.shieldTimer += delta * settings.speed;
      if (planet.shieldTimer >= SHIELD_RECHARGE_TIME) {
        planet.shieldTimer -= SHIELD_RECHARGE_TIME;
        planet.shield = Math.min(planet.maxShield, planet.shield + 1);
      }
    } else {
      planet.shieldTimer = 0;
    }
  }

  if (selectedPlanet) {
    updatePlanetTypeButtons();
    positionPlanetPanel();
  }

  updateComputerPlayers(delta);

  for (const route of routes) {
    if (route.repeat === false) continue;
    route.timer += delta;
    if (route.timer >= 1) {
      route.timer -= 1;
      sendRouteEnergy(route);
    }
  }

  for (const particle of particles) {
    const distance = Math.hypot(
      particle.target.x - particle.source.x,
      particle.target.y - particle.source.y,
    );
    particle.progress +=
      (ENERGY_TRAVEL_SPEED / distance) * delta * settings.speed;
  }

  resolveParticleCollisions();
  for (const particle of particles) {
    if (particle.progress >= 1) deliver(particle);
  }
  particles = particles.filter((particle) => particle.progress < 1);

  if (settings.robotBattle) {
    const computerOwners = new Set(
      planets
        .filter((planet) => planet.owner.startsWith("enemy"))
        .map((planet) => planet.owner),
    );
    if (computerOwners.size <= 1) {
      finishGame("Победил компьютер!", "robotBattle");
    }
  } else {
    const playerPlanets = planets.filter(
      (planet) => planet.owner === "player",
    ).length;
    const enemyPlanets = planets.filter(
      (planet) => planet.owner.startsWith("enemy"),
    ).length;
    if (playerPlanets === 0) finishGame("Поражение", "loss");
    else if (enemyPlanets === 0) finishGame("Победа!", "win");
  }
}

function drawArrow(fromX, fromY, toX, toY, color, alpha = 1) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const head = 11.5;

  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 3.45;
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();

  context.beginPath();
  context.moveTo(toX, toY);
  context.lineTo(toX - head * Math.cos(angle - Math.PI / 6), toY - head * Math.sin(angle - Math.PI / 6));
  context.lineTo(toX - head * Math.cos(angle + Math.PI / 6), toY - head * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
  context.restore();
}

function drawRouteDirection(route) {
  const from = route.source;
  const to = route.target;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const markerSize = PLANET_RADIUS * 0.45;
  const phase = (performance.now() / 1_200) % 1;

  context.save();
  context.strokeStyle = COLORS[route.source.owner];
  context.fillStyle = COLORS[route.source.owner];
  context.globalAlpha = 0.58;
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();

  for (let index = 0; index < 3; index += 1) {
    const progress = 0.18 + ((phase + index / 3) % 1) * 0.64;
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;

    context.beginPath();
    context.moveTo(x + Math.cos(angle) * markerSize, y + Math.sin(angle) * markerSize);
    context.lineTo(x + Math.cos(angle + 2.5) * markerSize, y + Math.sin(angle + 2.5) * markerSize);
    context.lineTo(x + Math.cos(angle - 2.5) * markerSize, y + Math.sin(angle - 2.5) * markerSize);
    context.closePath();
    context.fill();
  }

  context.restore();
}

function drawPlanetRouteTail(planet) {
  const route = routes.find((currentRoute) => currentRoute.source === planet);
  if (!route) return;

  const radius = planetDisplayRadius(planet);
  const angle = Math.atan2(route.target.y - planet.y, route.target.x - planet.x);
  const baseDistance = radius * 0.55;
  const tipDistance = radius + PLANET_RADIUS * 0.7;
  const halfWidth = radius * 0.48;
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const perpendicularX = -directionY;
  const perpendicularY = directionX;

  context.save();
  context.fillStyle = COLORS[planet.owner];
  context.beginPath();
  context.moveTo(
    planet.x + directionX * tipDistance,
    planet.y + directionY * tipDistance,
  );
  context.lineTo(
    planet.x + directionX * baseDistance + perpendicularX * halfWidth,
    planet.y + directionY * baseDistance + perpendicularY * halfWidth,
  );
  context.lineTo(
    planet.x + directionX * baseDistance - perpendicularX * halfWidth,
    planet.y + directionY * baseDistance - perpendicularY * halfWidth,
  );
  context.closePath();
  context.fill();
  context.restore();
}

function fitPlanetFont(text, radius) {
  const maxWidth = radius * 1.35;
  let size = Math.min(22, radius * 0.55);

  context.font = `600 ${size}px -apple-system, BlinkMacSystemFont, sans-serif`;
  while (context.measureText(text).width > maxWidth && size > 4) {
    size -= 1;
    context.font = `600 ${size}px -apple-system, BlinkMacSystemFont, sans-serif`;
  }
}

function ownerTextColor(owner) {
  return COLORS[owner] === PLAYER_COLORS.yellow ? "#5b4300" : COLORS.text;
}

function planetDisplayRadius(planet) {
  return planet.radius * planet.displayScale;
}

function drawShield(planet) {
  if (planet.maxShield === 0) return;

  const radius = planetDisplayRadius(planet);
  const visibleSegments = Math.ceil(planet.shield);
  const segmentAngle = (Math.PI * 2) / planet.maxShield;
  const gap = Math.min(0.1, segmentAngle * 0.28);

  context.save();
  context.strokeStyle = COLORS[planet.owner];
  context.lineWidth = SHIELD_LINE_WIDTH;
  context.lineCap = "round";

  for (let index = 0; index < planet.maxShield; index += 1) {
    context.globalAlpha = index < visibleSegments ? 1 : 0.18;
    const start = -Math.PI / 2 + index * segmentAngle + gap;
    const end = -Math.PI / 2 + (index + 1) * segmentAngle - gap;
    context.beginPath();
    context.arc(planet.x, planet.y, radius + SHIELD_OFFSET, start, end);
    context.stroke();
  }

  context.restore();
}

function drawEconomicMarker(planet) {
  if (planet.type !== "economic") return;

  const radius = planetDisplayRadius(planet);
  const badgeRadius = Math.max(5.175, radius * 0.28);
  const x = planet.x + radius * 0.7;
  const y = planet.y - radius * 0.7;

  context.save();
  context.fillStyle = "#f4b740";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2.3;
  context.beginPath();
  context.arc(x, y, badgeRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = "#ffffff";
  context.font = `700 ${badgeRadius * 1.25}px -apple-system, BlinkMacSystemFont, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("₽", x, y + 0.5);
  context.restore();
}

function drawSendFractionMarker(planet) {
  if (planet.sendFraction === 1) return;

  const label = planet.sendFraction === 0.5 ? "½" : "¼";
  const radius = planetDisplayRadius(planet);
  const badgeRadius = Math.max(6.5, radius * 0.36);
  const x = planet.x - radius * 0.78;
  const y = planet.y - radius * 0.78;

  context.save();
  context.fillStyle = planet.sendFraction === 0.5 ? "#f4b740" : "#c5cad3";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2.3;
  context.beginPath();
  context.arc(x, y, badgeRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = "#101828";
  context.font = `700 ${badgeRadius * 1.15}px -apple-system, BlinkMacSystemFont, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, x, y + 0.4);
  context.restore();
}

function drawCaptureEffects() {
  for (const effect of captureEffects) {
    const progress = effect.progress;
    const alpha = 1 - progress;
    const radius = PLANET_RADIUS * (0.75 + progress * 3);

    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = effect.color;
    context.lineWidth = 2.875 - progress * 1.725;
    context.beginPath();
    context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = effect.color;
    for (let index = 0; index < 12; index += 1) {
      const angle = (Math.PI * 2 * index) / 12;
      const distance = PLANET_RADIUS * (0.85 + progress * 2.45);
      const x = effect.x + Math.cos(angle) * distance;
      const y = effect.y + Math.sin(angle) * distance;
      context.beginPath();
      context.arc(x, y, PLANET_RADIUS * (0.04 + alpha * 0.17), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }
}

function drawWorld() {
  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  context.lineWidth = 1;
  for (let position = 0; position <= WORLD_WIDTH; position += 32) {
    context.strokeStyle = position % 160 === 0 ? "rgb(71 84 103 / 7%)" : "rgb(71 84 103 / 4%)";
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, WORLD_HEIGHT);
    context.stroke();
  }

  for (let position = 0; position <= WORLD_HEIGHT; position += 32) {
    context.strokeStyle = position % 160 === 0 ? "rgb(71 84 103 / 7%)" : "rgb(71 84 103 / 4%)";
    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(WORLD_WIDTH, position);
    context.stroke();
  }

  context.strokeStyle = "rgb(71 84 103 / 18%)";
  context.lineWidth = 2;
  context.strokeRect(1, 1, WORLD_WIDTH - 2, WORLD_HEIGHT - 2);
}

function draw() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  if (gameState === "menu") return;

  context.save();
  context.scale(camera.zoom, camera.zoom);
  context.translate(-camera.x, -camera.y);
  drawWorld();

  context.strokeStyle = COLORS.line;
  context.lineWidth = 4.6;
  context.lineCap = "round";
  for (const connection of connections) {
    context.beginPath();
    context.moveTo(connection.first.x, connection.first.y);
    context.lineTo(connection.second.x, connection.second.y);
    context.stroke();
  }

  for (const route of routes) {
    drawRouteDirection(route);
  }

  drawCaptureEffects();

  if (drag) {
    const targetX = drag.target?.x ?? drag.x;
    const targetY = drag.target?.y ?? drag.y;
    drawArrow(drag.source.x, drag.source.y, targetX, targetY, COLORS.player, 0.55);
  }

  for (const particle of particles) {
    const x = particle.source.x + (particle.target.x - particle.source.x) * particle.progress;
    const y = particle.source.y + (particle.target.y - particle.source.y) * particle.progress;
    context.fillStyle = COLORS[particle.owner];
    context.beginPath();
    const packetRadius = PLANET_RADIUS * 0.64;
    context.arc(x, y, packetRadius, 0, Math.PI * 2);
    context.fill();

    const packetText = String(Math.floor(particle.amount));
    context.fillStyle = ownerTextColor(particle.owner);
    fitPlanetFont(packetText, packetRadius);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(packetText, x, y);
  }

  for (const planet of planets) {
    const radius = planetDisplayRadius(planet);
    drawPlanetRouteTail(planet);
    context.fillStyle = COLORS[planet.owner];
    context.beginPath();
    context.arc(planet.x, planet.y, radius, 0, Math.PI * 2);
    context.fill();
    drawShield(planet);
    drawEconomicMarker(planet);
    drawSendFractionMarker(planet);

    const energyText = String(Math.floor(planet.energy));
    context.fillStyle = ownerTextColor(planet.owner);
    fitPlanetFont(energyText, radius);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(energyText, planet.x, planet.y);
  }

  context.restore();

  if (result && result !== "Победа!" && captureEffects.length === 0) {
    context.fillStyle = "rgb(255 255 255 / 82%)";
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "#101828";
    context.font = "700 42px -apple-system, BlinkMacSystemFont, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(result, window.innerWidth / 2, window.innerHeight / 2);
  }
}

function frame(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
