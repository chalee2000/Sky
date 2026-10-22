import test from 'node:test';
import assert from 'node:assert/strict';
import {stars} from './astronomy.js';
import {starImage,SURVEY_IMAGE_SERVICE} from './starImages.js';

test('every star requests its own survey field, converting catalog RA hours into degrees',()=>{
  const urls=new Set();
  for(const star of stars){
    const photo=starImage(star),url=new URL(photo.url);
    assert.equal(url.origin+url.pathname,SURVEY_IMAGE_SERVICE);
    assert.equal(photo.starId,star.id);
    assert.ok(Math.abs(Number(url.searchParams.get('ra'))-star.ra*15)<1e-6);
    assert.equal(Number(url.searchParams.get('dec')),star.dec);
    assert.equal(url.searchParams.get('hips'),'CDS/P/DSS2/color');
    assert.equal(url.searchParams.get('format'),'jpg');
    assert.ok(photo.credit.includes('DSS2'));
    urls.add(photo.url);
  }
  assert.equal(urls.size,stars.length,'no star borrows the image of another star');
  assert.equal(starImage(stars.find(star=>star.id==='aldebaran')).raDegrees,68.9805);
});
test('invalid or missing coordinates cannot fall back to a generic star photo',()=>{
  for(const star of [null,{}, {id:'bad',ra:24,dec:0},{id:'bad',ra:0,dec:91},{id:'bad',ra:NaN,dec:0}])assert.throws(()=>starImage(star),RangeError);
});
