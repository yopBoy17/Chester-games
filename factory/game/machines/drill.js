const chanceTable = [
  [75, 25], [70, 30], [25, 50, 25], [15, 35, 35, 15], [10, 20, 40, 20, 10],
  [7, 13, 28, 32, 13, 7], [5, 9, 20, 32, 20, 9, 5], [5, 7, 14, 24, 24, 14, 7, 5],
  [5, 7, 11, 16, 22, 16, 11, 7, 5],
];

export function getDrillChances(level, resources, maxLevel = 9) {
  const chances = chanceTable[Math.min(maxLevel, Math.max(1, level)) - 1];
  return resources.map((resource, index) => ({ ...resource, chance: chances[index] ?? 0 }));
}

export function getDrillInterval(level, maxLevel = 9) {
  const progress = (Math.min(maxLevel, Math.max(1, level)) - 1) / (maxLevel - 1);
  return 10_000 - progress * 7_700;
}

export function formatDrillRate(level, maxLevel = 9) {
  const seconds = getDrillInterval(level, maxLevel) / 1000;
  return `Добыча: 1 раз в ${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)} сек.`;
}

export function pickDrillResource(level, resources, maxLevel = 9) {
  const roll = Math.random() * 100;
  let total = 0;
  return getDrillChances(level, resources, maxLevel).find((resource) => {
    total += resource.chance;
    return roll < total;
  }) ?? resources[0];
}
