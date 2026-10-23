import test from 'node:test';
import assert from 'node:assert/strict';
import { stars, constellations } from './astronomy.js';
import { starStories, createStarStory } from './starStories.js';

test('each story uses its own star facts rather than a rotating unrelated tale',()=>{
  assert.equal(Object.keys(starStories).length,stars.length);
  const texts=new Set();
  for(const star of stars){
    const story=starStories[star.id];
    const group=constellations.find(c=>c.id===star.constellationId);
    assert.equal(story.starId,star.id);
    assert.equal(story.constellationId,group.id);
    assert.equal(story.kind,'astronomy-fiction');
    assert.match(story.label,/แต่งจากข้อมูลจริง/);
    const text=story.paragraphs.join(' ');
    assert.ok(story.title.includes(star.name));
    for(const fact of [star.nameEn,star.description,group.description,`กลุ่มดาว${group.name}`,`${Number(star.distance).toLocaleString('th-TH')} ปีแสง`]) assert.ok(text.includes(fact),`${star.id}: missing ${fact}`);
    assert.equal(new URL(story.source).searchParams.get('Ident'),star.nameEn);
    assert.doesNotMatch(text,/สังข์ทอง|ปลาบู่ทอง|ไกรทอง|โสนน้อย|พิกุลทอง|ดาวลูกไก่/);
    texts.add(text);
  }
  assert.equal(texts.size,stars.length);
});
test('known mismatches stay fixed: Aldebaran, Vega and Polaris have matching facts',()=>{
  assert.match(starStories.aldebaran.paragraphs.join(' '),/65 ปีแสง/);
  assert.match(starStories.aldebaran.paragraphs.join(' '),/อยู่ใกล้โลกกว่ากระจุกดาว/);
  assert.match(starStories.vega.paragraphs.join(' '),/กลุ่มดาวพิณ/);
  assert.match(starStories.polaris.paragraphs.join(' '),/ใกล้ขั้วฟ้าเหนือ/);
});
test('revised catalog values flow into the story without stale copied facts',()=>{
  const star={...stars.find(s=>s.id==='vega'),distance:26.4,description:'ข้อมูลทดสอบที่ปรับปรุงใหม่'};
  const story=createStarStory(star,constellations.find(c=>c.id===star.constellationId));
  assert.match(story.paragraphs.join(' '),/26.4 ปีแสง/);
  assert.ok(story.paragraphs.join(' ').includes(star.description));
  assert.doesNotMatch(story.paragraphs.join(' '),/25 ปีแสง/);
});
