const MAX_ENERGY = 10_000;
const TYPE_CHANGE_COST = 10;
const STANDARD_GENERATION = 1;
const ENERGY_TRAVEL_SPEED = 80;
const SHIELD_RECHARGE_TIME = 1;
const WORLD_WIDTH = 2_000;
const WORLD_HEIGHT = 2_000;
const PLANET_RADIUS = 13.524;
const MAX_CONNECTION_DISTANCE = PLANET_RADIUS * 2 * 12;
const MIN_PLANET_DISTANCE = PLANET_RADIUS * 5;

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

const PLAYER_COLORS = {
  green: "#22a06b",
  red: "#ef5350",
  blue: "#3478f6",
  yellow: "#f4b740",
};

function randomInteger(minimum, maximum) {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

function createPlanet(id, point) {
  return {
    id,
    x: point.x,
    y: point.y,
    radius: PLANET_RADIUS,
    owner: "neutral",
    energy: 3,
    type: "standard",
    shield: PLANET_TYPES.standard.maxShield,
    maxShield: PLANET_TYPES.standard.maxShield,
    shieldTimer: 0,
    computerDecisionTimer: 0,
    displayScale: 1,
    sendFraction: 1,
    upgradeEffect: 0,
  };
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

  return (
    cross(firstStart, firstEnd, secondStart) *
      cross(firstStart, firstEnd, secondEnd) <
      0 &&
    cross(secondStart, secondEnd, firstStart) *
      cross(secondStart, secondEnd, firstEnd) <
      0
  );
}

function generatePlanetPositions(planetCount) {
  const center = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
  const points = [center];
  let placementRadius = MAX_CONNECTION_DISTANCE * 0.75;

  while (points.length < planetCount) {
    let candidate = null;

    for (let attempt = 1; attempt <= 600; attempt += 1) {
      if (attempt % 150 === 0) {
        placementRadius += MAX_CONNECTION_DISTANCE * 0.25;
      }

      const angle = Math.random() * Math.PI * 2;
      const distanceFromCenter = Math.sqrt(Math.random()) * placementRadius;
      const point = {
        x: center.x + Math.cos(angle) * distanceFromCenter,
        y: center.y + Math.sin(angle) * distanceFromCenter,
      };
      const nearestDistance = Math.min(
        ...points.map((existing) =>
          Math.hypot(point.x - existing.x, point.y - existing.y),
        ),
      );

      if (nearestDistance < MIN_PLANET_DISTANCE) continue;
      if (nearestDistance > MAX_CONNECTION_DISTANCE) continue;
      if (
        point.x < 50 ||
        point.x > WORLD_WIDTH - 50 ||
        point.y < 50 ||
        point.y > WORLD_HEIGHT - 50
      ) {
        continue;
      }

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

function generatePlanetConnections(planets) {
  const result = [];
  const connected = [planets[0]];
  const remaining = planets.slice(1);

  while (remaining.length > 0) {
    const candidates = [];
    for (const first of connected) {
      for (const second of remaining) {
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance <= MAX_CONNECTION_DISTANCE) {
          candidates.push({ first, second, distance });
        }
      }
    }
    candidates.sort((first, second) => first.distance - second.distance);
    const choice = candidates[0];
    result.push({ first: choice.first, second: choice.second });
    connected.push(choice.second);
    remaining.splice(remaining.indexOf(choice.second), 1);
  }

  const extras = [];
  for (let firstIndex = 0; firstIndex < planets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < planets.length; secondIndex += 1) {
      const first = planets[firstIndex];
      const second = planets[secondIndex];
      if (
        result.some(
          (connection) =>
            (connection.first === first && connection.second === second) ||
            (connection.first === second && connection.second === first),
        )
      ) {
        continue;
      }
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance <= MAX_CONNECTION_DISTANCE) {
        extras.push({ first, second, distance });
      }
    }
  }

  extras.sort((first, second) => first.distance - second.distance);
  const extraCount = Math.floor(Math.random() * 3);
  let added = 0;
  while (added < extraCount && extras.length > 0) {
    const index = Math.floor(Math.random() * Math.min(8, extras.length));
    const choice = extras.splice(index, 1)[0];
    if (result.some((connection) => connectionsIntersect(connection, choice))) {
      continue;
    }
    result.push({ first: choice.first, second: choice.second });
    added += 1;
  }

  return result;
}

function chooseSpawnIndices(planets, connections) {
  const indexByPlanet = new Map(planets.map((planet, index) => [planet, index]));
  const adjacency = planets.map(() => []);
  for (const connection of connections) {
    const first = indexByPlanet.get(connection.first);
    const second = indexByPlanet.get(connection.second);
    adjacency[first].push(second);
    adjacency[second].push(first);
  }

  let farthestPair = [0, 1];
  let farthestDistance = -1;
  for (let start = 0; start < planets.length; start += 1) {
    const distances = Array(planets.length).fill(Infinity);
    const queue = [start];
    distances[start] = 0;
    for (let index = 0; index < queue.length; index += 1) {
      for (const neighbor of adjacency[queue[index]]) {
        if (distances[neighbor] !== Infinity) continue;
        distances[neighbor] = distances[queue[index]] + 1;
        queue.push(neighbor);
      }
    }
    for (let target = start + 1; target < planets.length; target += 1) {
      if (distances[target] > farthestDistance) {
        farthestDistance = distances[target];
        farthestPair = [start, target];
      }
    }
  }
  return farthestPair;
}

class MultiplayerGameEngine {
  constructor(options = {}) {
    const mapSize = MAP_SIZE_RANGES[options.mapSize] ? options.mapSize : "medium";
    const hostColor = PLAYER_COLORS[options.playerColor]
      ? options.playerColor
      : "blue";
    const enemyColorNames = Object.keys(PLAYER_COLORS).filter(
      (color) => color !== hostColor,
    );
    const enemyColor = enemyColorNames.includes(options.enemyColor)
      ? options.enemyColor
      : enemyColorNames[Math.floor(Math.random() * enemyColorNames.length)];
    this.enemyColorName = enemyColor;
    this.swapSpawns = options.swapSpawns === true;

    this.settings = {
      mapSize,
      difficulty: "normal",
      speed: 1,
      mountains: options.mountains === true,
      robotBattle: false,
      playerCount: 2,
      playerColor: hostColor,
    };
    this.colors = {
      player: PLAYER_COLORS[hostColor],
      enemy1: PLAYER_COLORS[enemyColor],
      enemy: PLAYER_COLORS[enemyColor],
      neutral: "#98a2b3",
      line: "#d0d5dd",
      text: "#ffffff",
    };
    this.routes = [];
    this.particles = [];
    this.captureEffects = [];
    this.collisionEffects = [];
    this.result = null;
    this.nextParticleId = 1;

    const [minimum, maximum] = MAP_SIZE_RANGES[mapSize];
    const planetCount = randomInteger(minimum, maximum);
    this.planets = generatePlanetPositions(planetCount).map((point, index) =>
      createPlanet(index + 1, point),
    );
    this.connections = generatePlanetConnections(this.planets);
    this.assignStartingPlanets();
  }

  assignStartingPlanets() {
    const spawnIndices = chooseSpawnIndices(this.planets, this.connections);
    const spawnPlanets = spawnIndices.map((index) => this.planets[index]);

    for (const planet of this.planets) {
      const playerSpawn = this.swapSpawns ? spawnPlanets[1] : spawnPlanets[0];
      const enemySpawn = this.swapSpawns ? spawnPlanets[0] : spawnPlanets[1];
      if (planet === playerSpawn) planet.owner = "player";
      else if (planet === enemySpawn) planet.owner = "enemy1";
      else planet.owner = "neutral";

      if (planet.owner === "neutral") {
        planet.energy = this.neutralStartingEnergy(planet, spawnPlanets);
        planet.shield = planet.maxShield;
      } else {
        planet.energy = 3;
        planet.shield = 0;
      }
    }
  }

  neutralStartingEnergy(planet, spawnPlanets) {
    if (!this.settings.mountains) return 3;
    const nearestSpawnDistance = Math.min(
      ...spawnPlanets.map((spawn) =>
        Math.hypot(planet.x - spawn.x, planet.y - spawn.y),
      ),
    );
    if (nearestSpawnDistance <= MAX_CONNECTION_DISTANCE && Math.random() < 0.9) {
      return randomInteger(1, 10);
    }
    if (Math.random() < 0.75) return randomInteger(1, 30);
    return randomInteger(31, 100);
  }

  ownerForPlayer(playerIndex) {
    return playerIndex === 0 ? "player" : "enemy1";
  }

  areConnected(first, second) {
    return this.connections.some(
      (connection) =>
        (connection.first === first && connection.second === second) ||
        (connection.first === second && connection.second === first),
    );
  }

  applyCommand(playerIndex, command) {
    if (this.result || ![0, 1].includes(playerIndex)) return;
    const owner = this.ownerForPlayer(playerIndex);

    if (command.type === "start_route") {
      const source = this.planets.find((planet) => planet.id === command.sourceId);
      const target = this.planets.find((planet) => planet.id === command.targetId);
      if (!source || !target || source.owner !== owner || !this.areConnected(source, target)) {
        return;
      }
      this.routes = this.routes.filter((route) => route.source !== source);
      const route = { source, target, timer: 0 };
      this.routes.push(route);
      this.sendRouteEnergy(route);
      return;
    }

    if (command.type === "stop_route") {
      const source = this.planets.find((planet) => planet.id === command.sourceId);
      if (source?.owner === owner) {
        this.routes = this.routes.filter((route) => route.source !== source);
      }
      return;
    }

    if (command.type === "set_fraction") {
      const planet = this.planets.find((current) => current.id === command.planetId);
      if (planet?.owner === owner && [1, 0.5, 0.25].includes(command.fraction)) {
        planet.sendFraction = command.fraction;
      }
      return;
    }

    if (command.type === "set_planet_type") {
      const planet = this.planets.find((current) => current.id === command.planetId);
      if (
        planet?.owner !== owner ||
        !["economic", "defensive"].includes(command.planetType) ||
        planet.type === command.planetType ||
        planet.energy < TYPE_CHANGE_COST
      ) {
        return;
      }
      planet.energy -= TYPE_CHANGE_COST;
      this.setPlanetType(planet, command.planetType, true);
    }
  }

  setPlanetType(planet, type, animate = false) {
    planet.type = type;
    planet.maxShield = PLANET_TYPES[type].maxShield;
    planet.shield = 0;
    planet.shieldTimer = 0;
    if (animate) planet.upgradeEffect = 1;
  }

  sendRouteEnergy(route) {
    if (route.source.owner === "neutral" || route.source.energy < 1) return;
    const amount = Math.min(
      route.source.energy,
      Math.ceil(route.source.energy * route.source.sendFraction),
    );
    route.source.energy -= amount;
    this.particles.push({
      id: this.nextParticleId++,
      source: route.source,
      target: route.target,
      owner: route.source.owner,
      amount,
      progress: 0,
    });
  }

  resolveParticleCollisions() {
    const destroyed = new Set();
    for (let firstIndex = 0; firstIndex < this.particles.length; firstIndex += 1) {
      const first = this.particles[firstIndex];
      if (destroyed.has(first)) continue;
      for (let secondIndex = firstIndex + 1; secondIndex < this.particles.length; secondIndex += 1) {
        const second = this.particles[secondIndex];
        if (destroyed.has(second)) continue;
        const opposite =
          first.owner !== second.owner &&
          first.source === second.target &&
          first.target === second.source;
        if (!opposite || first.progress + second.progress < 1) continue;

        const firstAmount = first.amount;
        const secondAmount = second.amount;
        const difference = firstAmount - secondAmount;
        const firstX = first.source.x + (first.target.x - first.source.x) * first.progress;
        const firstY = first.source.y + (first.target.y - first.source.y) * first.progress;
        const secondX = second.source.x + (second.target.x - second.source.x) * second.progress;
        const secondY = second.source.y + (second.target.y - second.source.y) * second.progress;
        this.collisionEffects.push({
          x: (firstX + secondX) / 2,
          y: (firstY + secondY) / 2,
          firstOwner: first.owner,
          secondOwner: second.owner,
          firstAmount,
          secondAmount,
          result: Math.abs(difference),
          progress: 0,
        });
        if (Math.abs(difference) < 0.001) {
          destroyed.add(first);
          destroyed.add(second);
          break;
        }
        if (difference > 0) {
          first.amount = difference;
          destroyed.add(second);
        } else {
          second.amount = Math.abs(difference);
          destroyed.add(first);
          break;
        }
      }
    }
    this.particles = this.particles.filter((particle) => !destroyed.has(particle));
  }

  deliver(particle) {
    const target = particle.target;
    if (target.owner === particle.owner) {
      target.energy = Math.min(MAX_ENERGY, target.energy + particle.amount);
      return;
    }

    let damage = particle.amount;
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    damage -= absorbed;
    target.energy -= damage;

    if (target.energy <= 0) {
      this.routes = this.routes.filter((route) => route.source !== target);
      target.owner = particle.owner;
      target.energy = Math.min(MAX_ENERGY, Math.abs(target.energy));
      target.sendFraction = 1;
      this.setPlanetType(target, "standard");
      this.captureEffects.push({
        x: target.x,
        y: target.y,
        color: this.colors[particle.owner],
        progress: 0,
      });
    }
  }

  update(delta) {
    for (const effect of this.captureEffects) effect.progress += delta * 1.35;
    this.captureEffects = this.captureEffects.filter((effect) => effect.progress < 1);
    for (const effect of this.collisionEffects) effect.progress += delta * 1.8;
    this.collisionEffects = this.collisionEffects.filter((effect) => effect.progress < 1);
    if (this.result) return;

    for (const planet of this.planets) {
      planet.upgradeEffect = Math.max(0, planet.upgradeEffect - delta * 1.6);
      if (planet.owner !== "neutral") {
        const generation =
          STANDARD_GENERATION * PLANET_TYPES[planet.type].generationMultiplier;
        planet.energy = Math.min(MAX_ENERGY, planet.energy + delta * generation);
      }
      if (planet.shield < planet.maxShield) {
        planet.shieldTimer += delta;
        while (
          planet.shieldTimer >= SHIELD_RECHARGE_TIME &&
          planet.shield < planet.maxShield
        ) {
          planet.shieldTimer -= SHIELD_RECHARGE_TIME;
          planet.shield += 1;
        }
      } else {
        planet.shieldTimer = 0;
      }
    }

    for (const route of this.routes) {
      if (route.repeat === false) continue;
      route.timer += delta;
      while (route.timer >= 1) {
        route.timer -= 1;
        this.sendRouteEnergy(route);
      }
    }

    for (const particle of this.particles) {
      const distance = Math.hypot(
        particle.target.x - particle.source.x,
        particle.target.y - particle.source.y,
      );
      particle.progress += (ENERGY_TRAVEL_SPEED / distance) * delta;
    }
    this.resolveParticleCollisions();
    for (const particle of this.particles) {
      if (particle.progress >= 1) this.deliver(particle);
    }
    this.particles = this.particles.filter((particle) => particle.progress < 1);

    const playerPlanets = this.planets.filter(
      (planet) => planet.owner === "player",
    ).length;
    const enemyPlanets = this.planets.filter(
      (planet) => planet.owner === "enemy1",
    ).length;
    if (playerPlanets === 0) this.result = "Поражение";
    else if (enemyPlanets === 0) this.result = "Победа!";
  }

  createSnapshot() {
    return {
      version: 1,
      savedAt: Date.now(),
      settings: { ...this.settings },
      currentGameConfiguration: {
        mode: "multiplayer",
        mapSize: this.settings.mapSize,
        difficulty: "normal",
        playerCount: 2,
        mountains: this.settings.mountains,
      },
      colors: { ...this.colors },
      planets: this.planets.map((planet) => ({ ...planet })),
      connections: this.connections.map((connection) => ({
        firstId: connection.first.id,
        secondId: connection.second.id,
      })),
      routes: [],
      particles: [],
      captureEffects: [],
      collisionEffects: [],
      camera: { x: 0, y: 0, zoom: 1 },
      currentLevelLayout: null,
      computerPlans: [],
      computerQuietTimers: {},
    };
  }

  createState() {
    return {
      planets: this.planets.map((planet) => ({
        id: planet.id,
        owner: planet.owner,
        energy: planet.energy,
        type: planet.type,
        shield: planet.shield,
        maxShield: planet.maxShield,
        shieldTimer: planet.shieldTimer,
        sendFraction: planet.sendFraction,
        upgradeEffect: planet.upgradeEffect,
      })),
      routes: this.routes.map((route) => ({
        sourceId: route.source.id,
        targetId: route.target.id,
        timer: route.timer,
        purpose: route.purpose,
        repeat: route.repeat,
      })),
      particles: this.particles.map((particle) => ({
        id: particle.id,
        sourceId: particle.source.id,
        targetId: particle.target.id,
        owner: particle.owner,
        amount: particle.amount,
        progress: particle.progress,
      })),
      captureEffects: this.captureEffects.map((effect) => ({ ...effect })),
      collisionEffects: this.collisionEffects.map((effect) => ({ ...effect })),
      result: this.result,
    };
  }
}

module.exports = { MultiplayerGameEngine };
