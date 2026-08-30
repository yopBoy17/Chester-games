const directions = ['right', 'bottom', 'left', 'top'];

export function directionForRotation(rotation) {
  const normalized = ((Number(rotation) % 360) + 360) % 360;
  return directions[normalized / 90];
}

export function oppositeSide(side) {
  return { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[side];
}

export function cellNextTo(cell, side) {
  const offsets = {
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 },
  };
  return { x: cell.x + offsets[side].x, y: cell.y + offsets[side].y };
}

export function sideToward(from, to) {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'bottom';
  return 'top';
}
