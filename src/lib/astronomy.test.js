import test from 'node:test';
import assert from 'node:assert/strict';
import { stars, constellations, julianDate, localSiderealTime, equatorialToHorizontal, moonPhase, sunPosition } from './astronomy.js';

const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
const epoch = new Date('2000-01-01T12:00:00Z');

test('Julian dates agree with the Unix and J2000 reference epochs', () => {
  close(julianDate(epoch), 2451545);
  close(julianDate(new Date(0)), 2440587.5);
  close(julianDate('2000-01-01T19:00:00+07:00'), julianDate(epoch));
  assert.throws(() => julianDate('invalid'), RangeError);
});

test('sidereal time uses the documented J2000 reference and east-positive longitude', () => {
  close(localSiderealTime(epoch, 0), 280.46061837);
  close(localSiderealTime(epoch, 100), 20.46061837);
  close(localSiderealTime(epoch, -100), 180.46061837);
});

test('an object on the local meridian at the observer latitude is at zenith', () => {
  const latitude = 13.7563;
  const longitude = 100.5018;
  const ra = localSiderealTime(epoch, longitude) / 15;
  const position = equatorialToHorizontal(ra, latitude, epoch, latitude, longitude);
  close(position.altitude, 90, 1e-6);
  assert.ok(Number.isFinite(position.azimuth));
});

test('north celestial pole altitude is observer latitude and its azimuth is north', () => {
  for (const latitude of [-35, 0, 13.7563, 60]) {
    const position = equatorialToHorizontal(0, 90, epoch, latitude, 100);
    close(position.altitude, latitude);
    close(position.azimuth, 0);
  }
});

test('an equatorial observer sees rising stars east and setting stars west', () => {
  const sidereal = localSiderealTime(epoch, 0) / 15;
  const rising = equatorialToHorizontal(sidereal + 6, 0, epoch, 0, 0);
  const setting = equatorialToHorizontal(sidereal - 6, 0, epoch, 0, 0);
  close(rising.altitude, 0);
  close(rising.azimuth, 90);
  close(setting.altitude, 0);
  close(setting.azimuth, 270);
});

test('positions change with time and longitude, and remain bounded at the poles', () => {
  const before = equatorialToHorizontal(6, 0, epoch, 14, 100);
  const after = equatorialToHorizontal(6, 0, new Date(epoch.getTime() + 6 * 3600000), 14, 100);
  assert.ok(Math.abs(before.altitude - after.altitude) > 30);
  for (const latitude of [-90, -60, 0, 60, 90]) {
    for (const star of stars) {
      const position = equatorialToHorizontal(star.ra, star.dec, epoch, latitude, 180);
      assert.ok(position.altitude >= -90 && position.altitude <= 90);
      assert.ok(position.azimuth >= 0 && position.azimuth < 360);
    }
  }
  assert.throws(() => equatorialToHorizontal(0, 91, epoch, 0, 0), RangeError);
  assert.throws(() => equatorialToHorizontal(0, 0, epoch, NaN, 0), RangeError);
});

test('catalog IDs and constellation line endpoints are consistent', () => {
  assert.ok(stars.length >= 55 && stars.length <= 90);
  const ids = new Set(stars.map(star => star.id));
  const patternIds = new Set(constellations.map(pattern => pattern.id));
  assert.equal(ids.size, stars.length);
  assert.equal(patternIds.size, constellations.length);
  for (const star of stars) {
    assert.ok(patternIds.has(star.constellationId));
    assert.ok(star.ra >= 0 && star.ra < 24);
    assert.ok(star.dec >= -90 && star.dec <= 90);
    assert.ok(Number.isFinite(star.magnitude));
    assert.ok(star.distance > 0);
  }
  for (const constellation of constellations) {
    for (const id of constellation.starIds) assert.ok(ids.has(id));
    for (const line of constellation.lines) {
      assert.equal(line.length, 2);
      for (const id of line) assert.ok(ids.has(id), `Unknown line endpoint ${id}`);
    }
  }
});

test('mean lunar cycle matches its reference new moon and half-cycle full moon', () => {
  const newMoon = new Date((2451550.25972 - 2440587.5) * 86400000);
  const dark = moonPhase(newMoon);
  assert.ok(dark.illumination < 0.000001);
  assert.equal(dark.nameEn, 'New moon');
  const full = moonPhase(new Date(newMoon.getTime() + 29.530588853 * 86400000 / 2));
  close(full.illumination, 1, 0.000001);
  assert.equal(full.nameEn, 'Full moon');
  for (const year of [1900, 2000, 2026, 2100]) {
    const phase = moonPhase(`${year}-06-01T00:00:00Z`);
    assert.ok(phase.phase >= 0 && phase.phase < 1);
    assert.ok(phase.illumination >= 0 && phase.illumination <= 1);
    assert.ok(phase.ageDays >= 0 && phase.ageDays < 29.531);
  }
});

test('solar position distinguishes Bangkok daytime and nighttime', () => {
  const noon = sunPosition(new Date('2026-03-20T05:00:00Z'), 13.7563, 100.5018);
  const midnight = sunPosition(new Date('2026-03-20T17:00:00Z'), 13.7563, 100.5018);
  assert.ok(noon.altitude > 70);
  assert.ok(midnight.altitude < -70);
});
