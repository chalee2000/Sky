import test from 'node:test';
import assert from 'node:assert/strict';
import { stars } from './astronomy.js';
import { starStories, thaiTales } from './starStories.js';

test('every named star has a Thai retelling with separate source and cultural label',()=>{
  assert.equal(Object.keys(starStories).length,stars.length);
  for(const star of stars){
    const story=starStories[star.id];
    assert.equal(story.starId,star.id);
    assert.equal(story.kind,'thai-retelling');
    assert.match(story.label,/ไทย/);
    assert.match(story.label,/เล่าใหม่/);
    assert.equal(new URL(story.source).protocol,'https:');
    assert.ok(story.paragraphs.length>=2);
    assert.ok(story.paragraphs.join(' ').length>300);
  }
});
test('Thai collection contains eight distinct tales and identifies literary works',()=>{
  assert.equal(thaiTales.length,8);
  assert.equal(new Set(thaiTales.map(t=>t.id)).size,8);
  assert.equal(new Set(thaiTales.map(t=>t.title)).size,8);
  assert.ok(thaiTales.some(t=>t.title==='ดาวลูกไก่'));
  assert.match(thaiTales.find(t=>t.id==='phra-aphai').label,/วรรณคดีไทยของสุนทรภู่/);
  assert.ok(thaiTales.every(t=>Object.values(starStories).some(s=>s.id===t.id)));
});
