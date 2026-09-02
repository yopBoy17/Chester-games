export function createEnergyController({
  greenResource,
  redResource,
  storageResource,
  buildings,
  formatAmount,
  generatorBaseBurnMs,
  generatorBurnReductionMs,
}) {
  function isBuildingWorking(building) {
    if (building.dataset.productId === 'drill') return building.dataset.isEnabled !== 'false';

    const inputCountField = {
      crusher: 'crusherInputCount',
      furnace: 'furnaceInputCount',
      press: 'pressInputCount',
      'metal-former': 'metalFormerInputCount',
    }[building.dataset.productId];

    return Boolean(inputCountField) && Number(building.dataset[inputCountField] ?? 0) > 0;
  }

  function getRequiredConsumption(building) {
    const level = Math.max(1, Number(building.dataset.level) || 1);
    return 2 ** (level - 1);
  }

  function canPower(building) {
    return getStorageState().current >= getRequiredConsumption(building);
  }

  function getBuildingConsumption(building) {
    if (!isBuildingWorking(building) || !canPower(building)) return 0;
    return getRequiredConsumption(building);
  }

  function getTotalConsumption() {
    return [...buildings.values()].reduce((total, building) => total + getBuildingConsumption(building), 0);
  }

  function getGeneratorOutput(level) {
    return 2 ** Math.max(1, Number(level) || 1);
  }

  function getGeneratorBurnDuration(level) {
    return generatorBaseBurnMs - ((Math.max(1, Number(level) || 1) - 1) * generatorBurnReductionMs);
  }

  function getTotalGeneration() {
    const now = Date.now();
    return [...buildings.values()]
      .filter((building) => building.dataset.productId === 'generator'
        && building.dataset.generatorIsActive !== 'false'
        && Number(building.dataset.generatorCoalCount ?? 0) > 0
        && Number(building.dataset.generatorBurnEndsAt ?? 0) > now)
      .reduce((total, generator) => total + getGeneratorOutput(generator.dataset.level), 0);
  }

  function balanceGenerators() {
    const now = Date.now();
    const { current, maximum } = getStorageState();
    const generators = [...buildings.values()]
      .filter((building) => building.dataset.productId === 'generator'
        && Number(building.dataset.generatorCoalCount ?? 0) > 0);
    const activeGenerators = new Set();

    if (maximum <= 0 || current / maximum <= 0.9) {
      generators.forEach((generator) => activeGenerators.add(generator));
    } else {
      const requiredOutput = getTotalConsumption();
      let selectedOutput = 0;
      [...generators]
        .sort((left, right) => getGeneratorOutput(right.dataset.level) - getGeneratorOutput(left.dataset.level))
        .some((generator) => {
          activeGenerators.add(generator);
          selectedOutput += getGeneratorOutput(generator.dataset.level);
          return selectedOutput > requiredOutput;
        });
    }

    let changed = false;
    generators.forEach((generator) => {
      const shouldBeActive = activeGenerators.has(generator);
      const isActive = generator.dataset.generatorIsActive !== 'false';
      if (shouldBeActive === isActive) return;

      changed = true;
      generator.dataset.generatorIsActive = String(shouldBeActive);
      if (!shouldBeActive) {
        const burnEndsAt = Number(generator.dataset.generatorBurnEndsAt ?? 0);
        if (burnEndsAt > now) generator.dataset.generatorPausedBurnMs = String(burnEndsAt - now);
        delete generator.dataset.generatorBurnEndsAt;
        return;
      }

      const pausedBurnMs = Math.max(0, Number(generator.dataset.generatorPausedBurnMs ?? 0));
      if (pausedBurnMs > 0) generator.dataset.generatorBurnEndsAt = String(now + pausedBurnMs);
      delete generator.dataset.generatorPausedBurnMs;
    });
    return changed;
  }

  function renderValue(resource, value, maximum = null) {
    resource.dataset.value = String(value);
    resource.querySelector('.resource-value').textContent = maximum == null
      ? formatAmount(value)
      : `${formatAmount(value)}/${formatAmount(maximum)}`;
  }

  function getStorageState() {
    const maximum = Math.max(0, Number(storageResource.dataset.max) || 0);
    const current = Math.min(maximum, Math.max(0, Number(storageResource.dataset.value) || 0));
    return { current, maximum };
  }

  function render() {
    const generation = getTotalGeneration();
    const consumption = getTotalConsumption();
    const { current, maximum } = getStorageState();

    renderValue(greenResource, generation);
    renderValue(redResource, consumption);
    renderValue(storageResource, current, maximum);
    greenResource.setAttribute('aria-label', `Выработка энергии: ${formatAmount(generation)}`);
    redResource.setAttribute('aria-label', `Потребление энергии: ${formatAmount(consumption)}`);
    storageResource.setAttribute('aria-label', `Жёлтая энергия: ${formatAmount(current)} из ${formatAmount(maximum)}`);
  }

  function renderDevice(menu, building) {
    menu.querySelector('.device-energy-value').textContent = formatAmount(getRequiredConsumption(building));
  }

  function updateStorage() {
    const difference = getTotalGeneration() - getTotalConsumption();
    if (!difference) return;

    const { current, maximum } = getStorageState();
    if ((difference > 0 && current >= maximum) || (difference < 0 && current <= 0)) return;

    const next = Math.min(maximum, Math.max(0, current + difference));
    if (next === current) return;
    storageResource.dataset.value = String(next);
    render();
  }

  return {
    balanceGenerators,
    canPower,
    getGeneratorBurnDuration,
    getGeneratorOutput,
    render,
    renderDevice,
    updateStorage,
  };
}
