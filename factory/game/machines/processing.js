export function getCrusherResources(level, resources) {
  return resources.slice(1, Math.min(resources.length, Math.max(1, level) + 1));
}

export function getFurnaceResources(level, resources) {
  return resources.slice(0, Math.min(resources.length, Math.max(1, level)));
}

export function getProcessingInterval(level, maxLevel = 9) {
  const progress = (Math.min(maxLevel, Math.max(1, level)) - 1) / (maxLevel - 1);
  return 2_000 - progress * 1_500;
}

export function formatProcessingRate(level, label, maxLevel = 9) {
  const seconds = getProcessingInterval(level, maxLevel) / 1000;
  return `${label}: 1 раз в ${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} сек.`;
}
