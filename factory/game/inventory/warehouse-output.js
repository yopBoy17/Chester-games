import { cellNextTo } from '../conveyor.js';

export function createWarehouseOutput({
  intervalMs = 500,
  isWarehouseAvailable,
  getInventoryCount,
  removeInventoryItem,
  getInventoryItem,
  isCellOnMap,
  getConveyorAt,
  isConveyorFull,
  emitResource,
  saveGameState,
}) {
  const queues = new Map();

  function clear(warehouse) {
    const state = queues.get(warehouse);
    if (state?.timerId) window.clearTimeout(state.timerId);
    queues.delete(warehouse);
  }

  function schedule(warehouse) {
    const state = queues.get(warehouse);
    if (!state || state.timerId) return;
    state.timerId = window.setTimeout(() => {
      state.timerId = null;
      process(warehouse);
    }, intervalMs);
  }

  function process(warehouse) {
    const state = queues.get(warehouse);
    if (!state || !isWarehouseAvailable(warehouse)) {
      clear(warehouse);
      return;
    }

    while (state.items.length
      && (state.items[0].remaining <= 0 || getInventoryCount(state.items[0].itemId) <= 0)) {
      state.items.shift();
    }
    const task = state.items[0];
    if (!task) {
      clear(warehouse);
      return;
    }

    const resourceType = getInventoryItem(task.itemId);
    const [x, y] = warehouse.dataset.cellKey.split(':').map(Number);
    const source = { x, y };
    const side = warehouse.dataset.activeSide ?? 'bottom';
    const target = cellNextTo(source, side);
    const conveyor = isCellOnMap(target) ? getConveyorAt(target) : null;
    if (resourceType && conveyor && !isConveyorFull(target, null)) {
      removeInventoryItem(task.itemId);
      task.remaining -= 1;
      emitResource(resourceType, source, side);
      saveGameState();
    }
    schedule(warehouse);
  }

  function enqueue(warehouse, itemId, quantity) {
    let state = queues.get(warehouse);
    if (!state) {
      state = { items: [], timerId: null };
      queues.set(warehouse, state);
    }
    state.items.push({ itemId, remaining: quantity });
    schedule(warehouse);
  }

  function clearAll() {
    queues.forEach((state) => {
      if (state.timerId) window.clearTimeout(state.timerId);
    });
    queues.clear();
  }

  return { clear, clearAll, enqueue };
}
