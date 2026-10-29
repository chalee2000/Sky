import test from 'node:test';
import assert from 'node:assert/strict';
import { stars, constellations } from './astronomy.js';
import { starStories, createStarStory } from './starStories.js';
import { getStarScience, spectralDescription } from './starScience.js';
import { starScienceCatalog, starScienceSources } from './starScienceCatalog.js';

test('all 78 stories use matching catalog identities, spectra and sourced numbers',()=>{
  assert.equal(Object.keys(starStories).length,stars.length);
  assert.equal(Object.keys(starScienceCatalog).length,stars.length);
  const identities=new Set();
  for(const star of stars){
    const story=starStories[star.id], science=story.science;
    const catalog=starScienceCatalog[star.id];
    assert.equal(story.starId,star.id);
    assert.equal(story.constellationId,star.constellationId);
    assert.equal(story.kind,'scientific-astronomy-storytelling');
    assert.ok(catalog.matchArcseconds<3.1,`coordinate match for ${star.id}`);
    assert.ok(catalog.catalogDistanceParsecs>0&&catalog.catalogDistanceParsecs<10000);
    assert.ok(Number.isFinite(catalog.catalogMagnitude));
    assert.ok(catalog.sourceIds.every(id=>starScienceSources[id]));
    assert.equal(new URL(story.source).searchParams.get('Ident'),`HIP ${catalog.identifiers.hip}`);
    const text=story.paragraphs.join(' ');
    for(const fact of [star.nameEn,science.designation,science.spectralType,science.magnitudeText,`${science.distanceText} ปีแสง`]) assert.ok(text.includes(fact),`${star.id}: missing ${fact}`);
    assert.match(text,/แค็ตตาล็อก/);
    assert.doesNotMatch(text,/สังข์ทอง|ปลาบู่ทอง|ไกรทอง|โสนน้อย|พิกุลทอง|ดาวลูกไก่/);
    identities.add(catalog.identifiers.hip);
  }
  assert.equal(identities.size,stars.length);
});

test('Alnasl is gamma TWO Sagittarii with sourced facts and no invented approval date',()=>{
  const story=starStories.alnasl, science=story.science;
  assert.equal(science.designation,'Gamma² Sagittarii (γ² Sgr)');
  assert.equal(science.identifiers.hip,88635);
  assert.equal(science.identifiers.hd,165135);
  assert.equal(science.spectralType,'K0III');
  assert.equal(science.starType,'ดาวยักษ์สีส้ม');
  assert.equal(science.magnitudeText,'2.98');
  assert.ok(science.distanceLy>96&&science.distanceLy<97);
  assert.equal(science.distanceText,'96.9');
  assert.match(science.nameMeaning,/ปลายลูกศร/);
  assert.equal(science.namingApprovalDate,null);
  assert.doesNotMatch(story.paragraphs.join(' '),/K1 III|21 สิงหาคม|2016/);
});

test('spectral qualifiers, composite systems and ranges are distinguished',()=>{
  assert.equal(spectralDescription('K1+IIIb'),'ดาวยักษ์สีส้ม');
  for(const spectrum of ['G5IIIe+G0III','B2IV+B']) assert.match(spectralDescription(spectrum),/หลายองค์ประกอบ/);
  assert.equal(spectralDescription('F5IV-V'),'ดาวฤกษ์สเปกตรัม F');
  assert.equal(spectralDescription('A0pCr'),'ดาวฤกษ์สเปกตรัม A');
  assert.match(starStories.capella.science.notes,/ไม่ควรอธิบายคาเพลลาว่าเป็นดาวเดี่ยว/);
  assert.match(starStories.acrux.science.notes,/องค์ประกอบ/);
});

test('ambiguous names resolve by HIP and unsupported name meanings stay unknown',()=>{
  const science=starStories.gienah.science;
  assert.equal(science.designation,'Epsilon Cygni (ε Cyg)');
  assert.equal(science.catalogName,'Aljanah');
  assert.equal(new URL(science.source).searchParams.get('Ident'),'HIP 102488');
  assert.equal(starStories.vega.science.nameMeaning,null);
  assert.match(starStories.aldebaran.paragraphs.join(' '),/อยู่ใกล้โลกกว่ากระจุกดาว/);
  assert.match(starStories.polaris.paragraphs.join(' '),/ใกล้ขั้วฟ้าเหนือ/);
});

test('story measurements use the cited catalog without silently mixing map estimates',()=>{
  const star={...stars.find(s=>s.id==='vega'),distance:900,magnitude:12};
  const story=createStarStory(star,constellations.find(c=>c.id===star.constellationId));
  assert.equal(story.science.distanceText,'25');
  assert.equal(story.science.magnitudeText,'0.03');
  assert.equal(story.science.mapDistanceText,'900');
  assert.equal(story.science.distanceDiffers,true);
  assert.doesNotMatch(story.paragraphs.join(' '),/900 ปีแสง|12.00 แมกนิจูด/);
  assert.throws(()=>getStarScience({id:'unknown'}),/Missing scientific profile/);
});
