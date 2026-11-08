import assert from 'node:assert/strict';
import test from 'node:test';
import { deepSkyObjects, deepSkyPositions } from './deepSky.js';

const byId = id => deepSkyObjects.find(object => object.id === id);
const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`);

test('the deep sky catalog has unique real catalog identities and sourced J2000 positions', () => {
  assert.equal(deepSkyObjects.length, 32);
  assert.equal(new Set(deepSkyObjects.map(object => object.id)).size, 32);
  assert.equal(new Set(deepSkyObjects.map(object => object.sourceId)).size, 32);
  assert.deepEqual(Object.fromEntries(['galaxy', 'cluster', 'nebula'].map(type => [type, deepSkyObjects.filter(object => object.type === type).length])), { galaxy: 15, cluster: 10, nebula: 7 });
  for (const object of deepSkyObjects) {
    assert.ok(Number.isFinite(object.ra) && object.ra >= 0 && object.ra < 24);
    assert.ok(Number.isFinite(object.dec) && object.dec >= -90 && object.dec <= 90);
    assert.ok(object.aliases.includes(object.catalogId));
    assert.ok(object.aliases.includes(object.sourceId));
    assert.match(object.sourceUrl, /github\.com\/mattiaverga\/OpenNGC\/blob\/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0\/database_files\/(NGC|addendum)\.csv$/);
    assert.ok(object.name && object.nameEn && object.constellationName && object.description && object.observingTip);
    assert.ok(object.imageFov >= .2 && object.imageFov <= 5);
    assert.ok(object.angularSizeArcmin === null || object.angularSizeArcmin > 0);
    assert.equal(object.magnitude === null ? null : 'V', object.magnitudeBand);
    assert.ok(object.magnitude === null || Number.isFinite(object.magnitude));
    assert.equal(object.distance, undefined, 'no unsupported distance is inferred from redshift or apparent size');
  }
});

test('representative OpenNGC source rows retain positions, bands and missing values', () => {
  // Independent fixture values read from the pinned NGC.csv and addendum.csv.
  close(byId('m31').ra, 0 + 42 / 60 + 44.35 / 3600);
  close(byId('m31').dec, 41 + 16 / 60 + 8.6 / 3600);
  assert.equal(byId('m31').magnitude, 3.44);
  assert.equal(byId('m31').angularSizeArcmin, 177.83);
  assert.equal(byId('m45').sourceId, 'Mel022', 'M45 is a separate addendum entry, not an invented NGC identity');
  close(byId('m45').ra, 3 + 47 / 60 + 28.6 / 3600);
  close(byId('ngc5128').dec, -(43 + 1 / 60 + 8.8 / 3600));
  assert.equal(byId('m22').magnitude, null, 'a blank V field does not become 0 mag or get replaced with B');
  assert.equal(byId('ngc253').magnitude, null, 'questionable V data is withheld pending verification');
  assert.equal(byId('ngc5139').magnitude, null);
  assert.equal(byId('m1').sourceType, 'SNR');
  assert.equal(byId('m57').sourceType, 'PN');
  assert.equal(byId('m42').sourceType, 'Cl+N');
});

test('positions follow observation time and latitude without changing catalog data', () => {
  const date = new Date('2026-11-08T14:00:00Z');
  const bangkok = deepSkyPositions(date, 13.7563, 100.5018);
  const later = deepSkyPositions(new Date(date.getTime() + 6 * 3600_000), 13.7563, 100.5018);
  const sydney = deepSkyPositions(date, -33.8688, 151.2093);
  assert.equal(bangkok.length, deepSkyObjects.length);
  for (const object of bangkok) {
    assert.ok(Number.isFinite(object.altitude) && object.altitude >= -90 && object.altitude <= 90);
    assert.ok(Number.isFinite(object.azimuth) && object.azimuth >= 0 && object.azimuth < 360);
    assert.equal(object.ra, byId(object.id).ra);
  }
  const a = bangkok.find(object => object.id === 'm31');
  assert.ok(Math.abs(a.altitude - later.find(object => object.id === 'm31').altitude) > 10);
  assert.ok(Math.abs(a.altitude - sydney.find(object => object.id === 'm31').altitude) > 10);
  assert.equal(byId('m31').altitude, undefined, 'position calculation does not mutate the catalog');
  assert.ok(bangkok.some(object => object.altitude > 0));
  assert.ok(bangkok.some(object => object.altitude < 0), 'below-horizon objects remain distinguishable in the browser');
});
