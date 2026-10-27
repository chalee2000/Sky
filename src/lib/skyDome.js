// Stereographic view of the celestial sphere. A wide field keeps neighbouring
// constellations together and renders the horizon as an arc without moving stars.
export function projectSkyDome(altitude, azimuth, view, width, height, zoom = 1) {
  if (!view || ![altitude,azimuth,width,height,zoom].every(Number.isFinite) || width <= 0 || height <= 0 || zoom <= 0) return null;
  const rad = Math.PI / 180;
  const alt = altitude * rad, az = azimuth * rad;
  const position = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
  const dot = axis => position.reduce((sum, value, index) => sum + value * axis[index], 0);
  const depth = dot(view.forward);
  // Show the hemisphere in front of the observer. Stars behind the viewer
  // become visible by turning, instead of wrapping over the top of the screen.
  if (depth < -1e-6) return null;
  const focal = Math.min(width, height) / (4 * Math.tan(210 * rad / 4)) * zoom;
  const x = width / 2 + 2 * focal * dot(view.right) / (1 + depth);
  const y = height / 2 - 2 * focal * dot(view.up) / (1 + depth);
  return { x, y, depth, visible: x >= 0 && x <= width && y >= 0 && y <= height };
}
