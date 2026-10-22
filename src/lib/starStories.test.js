import test from 'node:test';
import assert from 'node:assert/strict';
import { stars } from './astronomy.js';
import { starStories, traditions, traditionForStar } from './starStories.js';

test('every named star has its own original story and an explicit fiction label',()=>{
  assert.equal(Object.keys(starStories).length,stars.length);
  const titles=new Set(),texts=new Set();
  for(const star of stars){
    const story=starStories[star.id];
    assert.equal(story.starId,star.id);
    assert.equal(story.kind,'original');
    assert.match(story.label,/แต่ง/);
    assert.ok(story.title.trim().length>5);
    assert.ok(story.paragraphs.join(' ').length>100);
    titles.add(story.title);texts.add(story.paragraphs.join(' '));
  }
  assert.equal(titles.size,stars.length,'story titles are distinct');
  assert.equal(texts.size,stars.length,'stories are distinct, not the same fallback text');
});
test('traditional stories are optional, culturally labeled, and link to background reading',()=>{
  for(const tradition of Object.values(traditions)){
    assert.ok(tradition.culture.length>0);
    assert.ok(tradition.text.length>100);
    assert.equal(new URL(tradition.source).protocol,'https:');
  }
  const vega=stars.find(star=>star.id==='vega'),altair=stars.find(star=>star.id==='altair');
  assert.equal(traditionForStar(vega),traditions.tanabata);
  assert.equal(traditionForStar(altair),traditions.tanabata);
  assert.equal(traditionForStar(stars.find(star=>star.id==='polaris')),null);
});
