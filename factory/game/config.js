export const FACTORY_CONFIG = Object.freeze({
  cellSize: 42, // Базовый размер клетки игрового поля, px.
  mapSize: 20, // Размер обычного игрового поля в клетках.
  performanceMapSize: 200, // Размер поля в режиме проверки производительности.
  minScale: 0.25, // Минимальный масштаб камеры для небольших экранов.
  maxScale: 1.5, // Максимальный масштаб камеры.
});

export function isPerformancePreview() {
  return new URLSearchParams(window.location.search).get('phaser-preview') === '200';
}
