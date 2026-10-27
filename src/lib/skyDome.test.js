import test from 'node:test';
import assert from 'node:assert/strict';
import { projectSkyDome } from './skyDome.js';

const north = {forward:[0,1,0],right:[1,0,0],up:[0,0,1]};
const zenith = {forward:[0,0,1],right:[1,0,0],up:[0,1,0]};
test('the viewing direction stays centered, with east on the right',()=>{
  const center=projectSkyDome(0,0,north,1000,1000);
  assert.equal(center.x,500);assert.equal(center.y,500);
  assert.ok(projectSkyDome(0,90,north,1000,1000).x>center.x);
  assert.ok(projectSkyDome(0,270,north,1000,1000).x<center.x);
  assert.equal(projectSkyDome(0,180,north,1000,1000),null);
  assert.equal(projectSkyDome(30,150,north,1000,1000),null,'objects behind the observer are hidden');
});
test('looking at the zenith projects the horizon onto a circle; zoom preserves angles',()=>{
  const distances=[0,45,90,180,270].map(az=>{
    const p=projectSkyDome(0,az,zenith,1000,1000);
    const q=projectSkyDome(0,az,zenith,1000,1000,2);
    assert.ok(Math.abs(q.x-500-2*(p.x-500))<1e-9);
    assert.ok(Math.abs(q.y-500-2*(p.y-500))<1e-9);
    return Math.hypot(p.x-500,p.y-500);
  });
  assert.ok(Math.max(...distances)-Math.min(...distances)<1e-9);
  assert.equal(projectSkyDome(NaN,0,north,1000,1000),null);
});
