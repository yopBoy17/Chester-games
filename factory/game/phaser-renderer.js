import { FACTORY_CONFIG, isPerformancePreview } from './config.js';
import { FACTORY_BALANCE } from './balance.js';

function resourcePosition(resource, world, mapSize) {
  if (resource.renderPosition) {
    return {
      x: resource.renderPosition.x * FACTORY_CONFIG.cellSize,
      y: resource.renderPosition.y * FACTORY_CONFIG.cellSize,
    };
  }
  const resourceRect = resource.element.getBoundingClientRect();
  const worldRect = world.getBoundingClientRect();
  if (!worldRect.width || !worldRect.height) return null;
  return {
    x: ((resourceRect.left + resourceRect.width / 2 - worldRect.left) / worldRect.width) * mapSize * FACTORY_CONFIG.cellSize,
    y: ((resourceRect.top + resourceRect.height / 2 - worldRect.top) / worldRect.height) * mapSize * FACTORY_CONFIG.cellSize,
  };
}

export function createPhaserRenderer({ parent, world, products, resourceTypes, getBuildings, getMovingResources, getCamera, onReady }) {
  const performancePreview = isPerformancePreview();
  const mapSize = performancePreview ? FACTORY_CONFIG.performanceMapSize : FACTORY_CONFIG.mapSize;
  const worldSize = mapSize * FACTORY_CONFIG.cellSize;
  const textureSources = new Map([
    ...products.filter((item) => item.image).map((item) => [`product:${item.id}`, item.image]),
    ...resourceTypes.filter((item) => item.image).map((item) => [`resource:${item.id}`, item.image]),
    ['product:filter-mode-1', 'assets/products/filters/filter-mode-1.svg'],
    ['product:filter-mode-2', 'assets/products/filters/filter-mode-2.svg'],
    ['product:filter-mode-3', 'assets/products/filters/filter-mode-3.svg'],
    ['product:distributor-mode-1', 'assets/products/distributors/distributor-mode-1.svg'],
    ['product:distributor-mode-2', 'assets/products/distributors/distributor-mode-2.svg'],
    ['product:distributor-mode-3', 'assets/products/distributors/distributor-mode-3.svg'],
    ['product:conveyor', 'assets/products/conveyor.svg'],
  ]);
  const sprites = new Map();
  const resourceFrames = new Map();
  const resourceKeys = new WeakMap();
  let nextResourceKey = 1;
  let placementPreview = null;
  let scene;

  const game = new window.Phaser.Game({
    type: window.Phaser.AUTO,
    parent,
    transparent: true,
    render: { antialias: true, pixelArt: false },
    scale: {
      mode: window.Phaser.Scale.RESIZE,
      width: parent.clientWidth,
      height: parent.clientHeight,
    },
    scene: {
      preload() {
        textureSources.forEach((source, key) => this.load.image(key, source));
      },
      create() {
        scene = this;
        resourceTypes.filter((item) => item.image).forEach((item) => {
          const textureKey = `resource:${item.id}`;
          const texture = this.textures.get(textureKey);
          const source = texture.getSourceImage();
          if (!source?.width || !source?.height) return;
          const canvas = document.createElement('canvas');
          canvas.width = source.width;
          canvas.height = source.height;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(source, 0, 0);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let left = canvas.width;
          let top = canvas.height;
          let right = -1;
          let bottom = -1;
          for (let y = 0; y < canvas.height; y += 1) {
            for (let x = 0; x < canvas.width; x += 1) {
              if (pixels[(y * canvas.width + x) * 4 + 3] <= 8) continue;
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          }
          if (right < left || bottom < top) return;
          const frameName = 'visible-content';
          texture.add(frameName, 0, left, top, right - left + 1, bottom - top + 1);
          resourceFrames.set(textureKey, frameName);
        });
        this.grid = this.add.graphics();
        this.buildingEffects = this.add.graphics();
        this.buildingIndicators = this.add.graphics().setDepth(3);
        this.grid.lineStyle(1, 0xeef0f2, 1);
        for (let index = 0; index <= mapSize; index += 1) {
          const point = index * FACTORY_CONFIG.cellSize;
          this.grid.lineBetween(point, 0, point, worldSize);
          this.grid.lineBetween(0, point, worldSize, point);
        }
        this.grid.lineStyle(3, 0x8f98a2, 1);
        this.grid.strokeRect(0, 0, worldSize, worldSize);
        if (performancePreview) {
          this.cameras.main.setBounds(0, 0, worldSize, worldSize);
        }
        onReady?.();
      },
      update() {
        if (scene) syncScene();
      },
    },
  });

  function textureForBuilding(building) {
    if (building.classList.contains('building--filter')) {
      return `product:filter-mode-${building.dataset.filterMode ?? 1}`;
    }
    if (building.classList.contains('building--distributor')) {
      return `product:distributor-mode-${building.dataset.distributorMode ?? 1}`;
    }
    if (building.classList.contains('building--conveyor')) {
      return 'product:conveyor';
    }
    return `product:${building.dataset.productId}`;
  }

  function syncSprite(key, texture, x, y, size, rotation = 0, tint = null, frame = null) {
    if (!scene.textures.exists(texture)) return;
    let sprite = sprites.get(key);
    const frameName = frame ?? '__BASE';
    if (!sprite || sprite.texture.key !== texture || sprite.frame.name !== frameName) {
      sprite?.destroy();
      sprite = frame ? scene.add.image(x, y, texture, frame) : scene.add.image(x, y, texture);
      sprites.set(key, sprite);
    }
    sprite.setPosition(x, y).setDisplaySize(size, size).setRotation(rotation);
    sprite.setTint(tint ?? 0xffffff);
  }

  function syncScene() {
    if (!scene) return;
    const activeKeys = new Set();
    const cellSize = FACTORY_CONFIG.cellSize;
    const levelBackgrounds = ['#ffffff', '#a96d3e', '#68717b', '#c9d0d6', '#d6aa36', '#56abb4', '#8870b4', '#ba6571', '#5c92c8'];
    scene.buildingEffects.clear();
    scene.buildingIndicators.clear();
    getBuildings().forEach((building, key) => {
      const [cellX, cellY] = key.split(':').map(Number);
      const spriteKey = `building:${key}`;
      activeKeys.add(spriteKey);
      const isConveyor = building.classList.contains('building--conveyor');
      const product = products.find((item) => item.id === building.dataset.productId);
      const rotation = isConveyor
        ? Number(building.dataset.conveyorVisualRotation ?? building.dataset.rotation ?? 0) * Math.PI / 180
        : Number((building.classList.contains('building--has-active-side')
          ? product?.defaultRotation ?? 0
          : Number(building.dataset.rotation ?? 0) + (product?.defaultRotation ?? 0)) % 360) * Math.PI / 180;
      if (!isConveyor) {
        const level = Math.max(1, Math.min(9, Number(building.dataset.level ?? 1)));
        scene.buildingEffects.fillStyle(Number.parseInt(levelBackgrounds[level - 1].slice(1), 16), building.classList.contains('building--draft') ? 0.42 : 1);
        scene.buildingEffects.fillRoundedRect(cellX * cellSize + 2, cellY * cellSize + 2, cellSize - 4, cellSize - 4, 6);
        const side = building.dataset.activeSide;
        if (side) {
          const sideColor = building.dataset.isOutputConnected === 'false'
            || (building.classList.contains('building--drill') && building.dataset.isEnabled === 'false')
            ? 0xe45050
            : 0x3fbd78;
          const edge = {
            bottom: [cellX * cellSize, (cellY + 1) * cellSize, (cellX + 1) * cellSize, (cellY + 1) * cellSize],
            top: [cellX * cellSize, cellY * cellSize, (cellX + 1) * cellSize, cellY * cellSize],
            left: [cellX * cellSize, cellY * cellSize, cellX * cellSize, (cellY + 1) * cellSize],
            right: [(cellX + 1) * cellSize, cellY * cellSize, (cellX + 1) * cellSize, (cellY + 1) * cellSize],
          }[side];
          if (edge) {
            scene.buildingIndicators.lineStyle(7, 0x17212d, 0.9);
            scene.buildingIndicators.lineBetween(...edge);
            scene.buildingIndicators.lineStyle(5, sideColor, 1);
            scene.buildingIndicators.lineBetween(...edge);
          }
        }
      }
      if (building.classList.contains('building--delete-selected') || building.classList.contains('building--move-selected')) {
        scene.buildingEffects.lineStyle(3, building.classList.contains('building--delete-selected') ? 0xe75252 : 0x51b9e8, 1);
        scene.buildingEffects.strokeRoundedRect(cellX * cellSize + 2, cellY * cellSize + 2, cellSize - 4, cellSize - 4, 6);
      }
      syncSprite(spriteKey, textureForBuilding(building), (cellX + 0.5) * cellSize, (cellY + 0.5) * cellSize, cellSize, rotation);
      sprites.get(spriteKey)?.setAlpha(building.classList.contains('building--draft') ? 0.42 : 1);
      sprites.get(spriteKey)?.setTint(building.classList.contains('building--delete-selected') ? 0xdf5353 : building.classList.contains('building--move-selected') ? 0x50c878 : 0xffffff);
    });

    if (placementPreview) {
      scene.buildingEffects.fillStyle(0x3fbd78, 0.22);
      scene.buildingEffects.fillRect(placementPreview.x * cellSize, placementPreview.y * cellSize, placementPreview.width * cellSize, placementPreview.height * cellSize);
      scene.buildingEffects.lineStyle(2, 0x3fbd78, 0.9);
      scene.buildingEffects.strokeRect(placementPreview.x * cellSize, placementPreview.y * cellSize, placementPreview.width * cellSize, placementPreview.height * cellSize);
      const product = products.find((item) => item.id === placementPreview.productId);
      const texture = product?.image ? `product:${product.id}` : null;
      if (texture && scene.textures.exists(texture)) {
        const spriteKey = 'preview:product';
        activeKeys.add(spriteKey);
        syncSprite(
          spriteKey,
          texture,
          (placementPreview.x + placementPreview.width / 2) * cellSize,
          (placementPreview.y + placementPreview.height / 2) * cellSize,
          Math.min(placementPreview.width, placementPreview.height) * cellSize,
          Number(product.defaultRotation ?? 0) * Math.PI / 180,
        );
        sprites.get(spriteKey)?.setAlpha(0.58);
      }
    }

    getMovingResources().forEach((resource) => {
      const position = resourcePosition(resource, world, mapSize);
      const resourceType = resourceTypes.find((item) => item.id === resource.resourceId);
      if (!position || !resourceType) return;
      if (!resourceKeys.has(resource)) resourceKeys.set(resource, nextResourceKey++);
      const spriteKey = `resource:${resource.resourceId}:${resourceKeys.get(resource)}`;
      activeKeys.add(spriteKey);
      if (resourceType.image) {
        const textureKey = `resource:${resourceType.id}`;
        const displaySize = cellSize * FACTORY_BALANCE.resources.displaySize;
        syncSprite(spriteKey, textureKey, position.x, position.y, displaySize, 0, resource.isBeingRemoved ? 0xff5555 : null, resourceFrames.get(textureKey));
      } else {
        let sprite = sprites.get(spriteKey);
        if (!sprite) {
          sprite = scene.add.rectangle(position.x, position.y, cellSize * 0.36, cellSize * 0.36, Number.parseInt(resourceType.color.slice(1), 16));
          sprites.set(spriteKey, sprite);
        }
        sprite.setPosition(position.x, position.y);
      }
      sprites.get(spriteKey)?.setAlpha(resource.isBeingRemoved ? 0.4 : 1);
    });

    sprites.forEach((sprite, key) => {
      if (!activeKeys.has(key)) {
        sprite.destroy();
        sprites.delete(key);
      }
    });

    const camera = getCamera();
    scene.cameras.main.setZoom(camera.scale);
    scene.cameras.main.centerOn(
      worldSize / 2 - camera.x / camera.scale,
      worldSize / 2 - camera.y / camera.scale,
    );
  }

  const resizeObserver = new ResizeObserver(() => {
    if (parent.clientWidth && parent.clientHeight) game.scale.resize(parent.clientWidth, parent.clientHeight);
  });
  resizeObserver.observe(parent);

  return {
    preview: performancePreview,
    sync() { if (scene) syncScene(); },
    setPreview(nextPreview) {
      placementPreview = nextPreview;
      if (scene) syncScene();
    },
    destroy() {
      resizeObserver.disconnect();
      game.destroy(true);
    },
  };
}
