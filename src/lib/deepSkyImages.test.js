import assert from 'node:assert/strict';
import { deepSkyImage } from './deepSkyImages.js';

const andromeda = { id:'m31', ra:.71231, dec:41.26917, imageFov:4 };
const photo = deepSkyImage(andromeda);
const url = new URL(photo.url);
assert.equal(url.searchParams.get('ra'), String(Number((andromeda.ra * 15).toFixed(6))));
assert.equal(url.searchParams.get('dec'), '41.26917');
assert.equal(url.searchParams.get('fov'), '4', 'a large galaxy keeps its own survey field');
assert.equal(url.searchParams.get('hips'), 'CDS/P/DSS2/color');
assert.equal(photo.objectId, 'm31');
assert.match(photo.credit, /DSS2/);
const compact = deepSkyImage({ id:'m13', ra:16.6949, dec:36.4613, imageFov:.7 });
assert.notEqual(compact.url, photo.url, 'different objects request their own coordinates and field');
assert.equal(new URL(compact.url).searchParams.get('fov'), '0.7');
for (const invalid of [{...andromeda,ra:24}, {...andromeda,dec:91}, {...andromeda,imageFov:0}, {...andromeda,imageFov:NaN}]) {
  assert.throws(() => deepSkyImage(invalid), RangeError);
}
console.log('PASS: deep sky survey images use each object’s J2000 position and angular field; invalid coordinates/fields are rejected.');
