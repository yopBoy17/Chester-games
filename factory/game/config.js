export const FACTORY_CONFIG = Object.freeze({
  cellSize: 42, // Базовый размер клетки игрового поля, px.
  mapSize: 10, // Размер обычного игрового поля в клетках.
  performanceMapSize: 200, // Размер поля в режиме проверки производительности.
  minScale: 0.5, // Минимальный масштаб камеры.
  maxScale: 2, // Максимальный масштаб камеры.
});

export function isPerformancePreview() {
  return new URLSearchParams(window.location.search).get('phaser-preview') === '200';
}
