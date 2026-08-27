const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const restartButton = document.querySelector("#restart");

const COLORS = {
  player: "#3478f6",
  enemy: "#ef5350",
  neutral: "#98a2b3",
  line: "#d0d5dd",
  text: "#ffffff",
};

let planets = [];
let routes = [];
let particles = [];
let drag = null;
let lastTime = performance.now();
let result = null;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createLevel();
}

function createLevel() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  planets = [
    { id: 1, x: width * 0.2, y: height * 0.55, radius: 42, owner: "player", energy: 28 },
    { id: 2, x: width * 0.5, y: height * 0.34, radius: 34, owner: "neutral", energy: 14 },
    { id: 3, x: width * 0.78, y: height * 0.58, radius: 42, owner: "enemy", energy: 24 },
  ];

  routes = [];
  particles = [];
  drag = null;
  result = null;
}

function planetAt(x, y) {
  return planets.find((planet) => Math.hypot(x - planet.x, y - planet.y) <= planet.radius);
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", (event) => {
  if (result) return;
  const point = pointerPosition(event);
  const source = planetAt(point.x, point.y);

  if (source?.owner === "player") {
    drag = { source, x: point.x, y: point.y };
    canvas.setPointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const point = pointerPosition(event);
  drag.x = point.x;
  drag.y = point.y;
});

canvas.addEventListener("pointerup", (event) => {
  if (!drag) return;
  const point = pointerPosition(event);
  const target = planetAt(point.x, point.y);

  if (target && target !== drag.source) {
    const existing = routes.find(
      (route) => route.source === drag.source && route.target === target,
    );

    if (existing) {
      routes = routes.filter((route) => route !== existing);
    } else {
      routes = routes.filter((route) => route.source !== drag.source);
      routes.push({ source: drag.source, target, timer: 0 });
    }
  }

  drag = null;
});

restartButton.addEventListener("click", createLevel);
window.addEventListener("resize", resize);

function spawnParticle(route) {
  if (route.source.energy < 1 || route.source.owner !== "player") return;

  route.source.energy -= 1;
  particles.push({
    source: route.source,
    target: route.target,
    owner: route.source.owner,
    progress: 0,
    speed: 0.55,
  });
}

function deliver(particle) {
  const target = particle.target;

  if (target.owner === particle.owner) {
    target.energy += 1;
    return;
  }

  target.energy -= 1;
  if (target.energy <= 0) {
    target.owner = particle.owner;
    target.energy = 1;
    routes = routes.filter((route) => route.source.owner === "player");
  }
}

function update(delta) {
  if (result) return;

  for (const planet of planets) {
    if (planet.owner !== "neutral") {
      planet.energy = Math.min(99, planet.energy + delta * 1.5);
    }
  }

  for (const route of routes) {
    route.timer += delta;
    if (route.timer >= 0.42) {
      route.timer -= 0.42;
      spawnParticle(route);
    }
  }

  for (const particle of particles) {
    particle.progress += particle.speed * delta;
    if (particle.progress >= 1) deliver(particle);
  }
  particles = particles.filter((particle) => particle.progress < 1);

  const playerPlanets = planets.filter((planet) => planet.owner === "player").length;
  const hostilePlanets = planets.filter((planet) => planet.owner !== "player").length;
  if (hostilePlanets === 0) result = "Победа!";
  if (playerPlanets === 0) result = "Поражение";
}

function drawArrow(fromX, fromY, toX, toY, color, alpha = 1) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const head = 10;

  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 3;
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

function draw() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const route of routes) {
    drawArrow(route.source.x, route.source.y, route.target.x, route.target.y, COLORS.player, 0.32);
  }

  if (drag) {
    drawArrow(drag.source.x, drag.source.y, drag.x, drag.y, COLORS.player, 0.55);
  }

  for (const particle of particles) {
    const x = particle.source.x + (particle.target.x - particle.source.x) * particle.progress;
    const y = particle.source.y + (particle.target.y - particle.source.y) * particle.progress;
    context.fillStyle = COLORS[particle.owner];
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fill();
  }

  for (const planet of planets) {
    context.fillStyle = COLORS[planet.owner];
    context.beginPath();
    context.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = COLORS.text;
    context.font = "600 18px -apple-system, BlinkMacSystemFont, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(Math.floor(planet.energy), planet.x, planet.y);
  }

  if (result) {
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
