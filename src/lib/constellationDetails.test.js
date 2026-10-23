import test from 'node:test';
import assert from 'node:assert/strict';
import { stars, constellations, equatorialToHorizontal } from './astronomy.js';
import { constellationStars } from './constellationDetails.js';
import { constellationProfiles } from './constellationProfiles.js';

test('all 22 available groups have distinct useful profiles and reference links',()=>{
  assert.equal(Object.keys(constellationProfiles).length,constellations.length);
  const abbreviations=new Set();
  for(const c of constellations){
    const profile=constellationProfiles[c.id];
    assert.ok(profile.overview.length>60,c.id);
    assert.ok(profile.observingTips.length>=2,c.id);
    assert.ok(profile.highlights.length>=1,c.id);
    assert.equal(new URL(profile.sourceUrl).protocol,'https:');
    abbreviations.add(profile.abbreviation);
  }
  assert.equal(abbreviations.size,constellations.length);
});
test('Alpheratz helps draw Pegasus but belongs to Andromeda, not Pegasus counts',()=>{
  const positions=stars.map(s=>({...s,altitude:s.id==='alpheratz'?45:-10}));
  const pegasus=constellationStars(constellations.find(c=>c.id==='pegasus'),positions);
  assert.equal(pegasus.members.length,3);
  assert.equal(pegasus.visible,0);
  assert.deepEqual(pegasus.references.map(s=>s.id),['alpheratz']);
  const andromeda=constellationStars(constellations.find(c=>c.id==='andromeda'),positions);
  assert.equal(andromeda.visible,1);
  assert.ok(andromeda.members.some(s=>s.id==='alpheratz'));
});
test('Orion status follows the selected date and observer rather than fixed season text',()=>{
  const orion=constellations.find(c=>c.id==='orion');
  const positions=time=>stars.map(s=>({...s,...equatorialToHorizontal(s.ra,s.dec,new Date(time),13.7563,100.5018)}));
  assert.equal(constellationStars(orion,positions('2026-12-15T15:00:00Z')).visible,8);
  assert.equal(constellationStars(orion,positions('2026-12-15T03:00:00Z')).visible,0);
});
