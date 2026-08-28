const map = document.querySelector('.map');
const world = document.querySelector('.world');
const BASE_CELL_SIZE = 42;
const MAP_SIZE = 10;
const MIN_SCALE = 0.5;
const MAX_SCALE = 1;
const camera = { x: 0, y: 0, scale: 1 };
let pointerStart = null;

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
