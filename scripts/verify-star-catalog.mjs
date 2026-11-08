import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const rows = JSON.parse(await readFile(new URL('../public/data/stars.json', import.meta.url), 'utf8'));
assert.equal(rows.length, 15544, 'the magnitude-7 catalog contains 15,544 stars');
assert.equal(rows.filter(row => row[2] <= 6).length, 5044, 'all original bright stars are retained');
assert.equal(rows.filter(row => row[2] > 6).length, 10500, '10,500 faint stars are added');
assert.equal(new Set(rows.map(row => JSON.stringify(row))).size, rows.length, 'no duplicated catalog rows');
for (const [ra, dec, magnitude, bv, ...extra] of rows) {
  assert.equal(extra.length, 0);
  assert.ok(Number.isFinite(ra) && ra >= 0 && ra < 24, 'RA is normalized hours');
  assert.ok(Number.isFinite(dec) && dec >= -90 && dec <= 90, 'declination is degrees');
  assert.ok(Number.isFinite(magnitude) && magnitude >= -1.44 && magnitude <= 7);
  assert.ok(typeof bv === 'string' && (bv === '' || Number.isFinite(Number(bv))), 'B−V is numeric or missing');
}
if (process.argv[2]) {
  const original = await readFile(process.argv[2]);
  assert.equal(createHash('sha256').update(original).digest('hex'), 'e3ec6cde89bae0dde064d91c1edb9ec53c3c40d5c12fdf5d30f9a4de5dbc2143', 'source matches the pinned d3-celestial snapshot');
  const source = JSON.parse(original);
  assert.equal(source.features.length, 41411);
  const expected = source.features.filter(feature => feature.properties.mag <= 7).map(feature => {
    const [longitude, dec] = feature.geometry.coordinates;
    return [Number((((longitude % 360 + 360) % 360) / 15).toFixed(6)), dec, feature.properties.mag, feature.properties.bv];
  });
  assert.deepEqual(rows, expected, 'each shipped row is the documented source transformation');
}
console.log('PASS: 15,544 real catalog stars, 5,044 original bright stars, 10,500 added faint stars, valid coordinates and no duplicated rows.');
