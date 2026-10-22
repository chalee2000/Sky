// Earth frame: x=east, y=north, z=up. Rear camera looks along device -z.
// DeviceOrientation uses intrinsic Z-X'-Y'' rotations (alpha, beta, gamma).
const radians = Math.PI / 180;
const wrap = degrees => ((degrees % 360) + 360) % 360;
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const unit = vector => {
  const length = Math.hypot(...vector);
  return length > 1e-8 ? vector.map(value => value / length) : null;
};

function describe(forward, up, source) {
  const right = unit(cross(forward, up));
  if (!right) return null;
  const orthogonalUp = unit(cross(right, forward));
  return {
    forward, right, up: orthogonalUp, source,
    heading: wrap(Math.atan2(forward[0], forward[1]) / radians),
    altitude: Math.asin(Math.max(-1, Math.min(1, forward[2]))) / radians,
  };
}

export function orientationToView(sample, screenAngle = 0) {
  if (!sample || !Number.isFinite(sample.beta) || !Number.isFinite(sample.gamma)) return null;
  const compass = Number.isFinite(sample.webkitCompassHeading) && sample.webkitCompassHeading >= 0;
  // Relative alpha alone cannot establish north. Never present it as a compass.
  if (!compass && !(sample.absolute === true && Number.isFinite(sample.alpha))) return null;
  if (compass && Number.isFinite(sample.webkitCompassAccuracy) && sample.webkitCompassAccuracy < 0) return null;
  const alpha = (compass ? wrap(360 - sample.webkitCompassHeading) : sample.alpha) * radians;
  const beta = sample.beta * radians;
  const gamma = sample.gamma * radians;
  const angle = (Number.isFinite(screenAngle) ? screenAngle : 0) * radians;
  const ca = Math.cos(alpha), sa = Math.sin(alpha);
  const cb = Math.cos(beta), sb = Math.sin(beta);
  const cg = Math.cos(gamma), sg = Math.sin(gamma);
  const deviceX = [ca*cg-sa*sb*sg, sa*cg+ca*sb*sg, -cb*sg];
  const deviceY = [-sa*cb, ca*cb, sb];
  const forward = [-ca*sg-sa*sb*cg, -sa*sg+ca*sb*cg, -cb*cg];
  const up = deviceX.map((value, i) => value*Math.sin(angle)+deviceY[i]*Math.cos(angle));
  return describe(unit(forward), up, compass ? 'magnetic' : 'absolute');
}

export function smoothView(previous, next, amount = 0.3) {
  if (!previous || !next || previous.source !== next.source) return next;
  const mix = (a, b) => unit(a.map((value, i) => value*(1-amount)+b[i]*amount));
  const forward = mix(previous.forward, next.forward);
  const up = mix(previous.up, next.up);
  return forward && up ? describe(forward, up, next.source) || next : next;
}

export function projectToView(altitude, azimuth, view, width, height, verticalFov = 62) {
  if (!view || ![altitude, azimuth, width, height, verticalFov].every(Number.isFinite) || width <= 0 || height <= 0 || verticalFov <= 0 || verticalFov >= 180) return null;
  const alt = altitude*radians, az = azimuth*radians;
  const position = [Math.cos(alt)*Math.sin(az), Math.cos(alt)*Math.cos(az), Math.sin(alt)];
  const depth = dot(position, view.forward);
  if (depth <= 0.02) return null;
  const focalLength = height / (2*Math.tan(verticalFov*radians/2));
  const x = width/2+dot(position, view.right)*focalLength/depth;
  const y = height/2-dot(position, view.up)*focalLength/depth;
  return { x, y, depth, visible: x >= 0 && x <= width && y >= 0 && y <= height };
}
