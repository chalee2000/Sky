export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 4;
export const clampMapZoom = value => Math.max(MIN_MAP_ZOOM, Math.min(MAX_MAP_ZOOM, Number.isFinite(value) ? value : MIN_MAP_ZOOM));

// Keep the circular viewport inside the magnified hemisphere.
export function clampMapPan(pan, zoom, radius) {
  const limit = radius * (clampMapZoom(zoom) - 1);
  const length = Math.hypot(pan.x, pan.y);
  if (!length || !limit) return { x:0, y:0 };
  const factor = Math.min(1, limit / length);
  return { x:pan.x * factor, y:pan.y * factor };
}

export function zoomMapAtPoint(pan, oldZoom, newZoom, point, center) {
  const ratio = newZoom / oldZoom;
  return {
    x:point.x - center.x - (point.x - center.x - pan.x) * ratio,
    y:point.y - center.y - (point.y - center.y - pan.y) * ratio,
  };
}
