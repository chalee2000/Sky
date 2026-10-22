import test from 'node:test';
import assert from 'node:assert/strict';
import { planets, planetPositions, planetVisibility, AU_KM } from './planets.js';

test('seven observable planets have finite coordinates and physical values',()=>{
  assert.equal(planets.length,7);
  assert.equal(new Set(planets.map(p=>p.id)).size,7);
  for(const p of planetPositions(new Date('2026-10-22T14:00:00Z'),13.7563,100.5018)) {
    for(const key of ['ra','dec','altitude','azimuth','distanceAu','magnitude','illumination','elongation']) assert.ok(Number.isFinite(p[key]),`${p.id} ${key}`);
    assert.ok(p.altitude>=-90&&p.altitude<=90);
    assert.ok(p.azimuth>=0&&p.azimuth<360);
    assert.ok(p.distanceAu>0&&p.distanceAu<40);
    assert.equal(p.distanceKm,p.distanceAu*AU_KM);
    assert.ok(p.illumination>=0&&p.illumination<=1);
  }
});

test('positions reproduce the December 2020 Jupiter–Saturn great conjunction',()=>{
  const positions=planetPositions('2020-12-21T18:00:00Z',0,0);
  const j=positions.find(p=>p.id==='jupiter'),s=positions.find(p=>p.id==='saturn');
  const rad=Math.PI/180;
  const separation=Math.acos(Math.sin(j.dec*rad)*Math.sin(s.dec*rad)+Math.cos(j.dec*rad)*Math.cos(s.dec*rad)*Math.cos((j.ra-s.ra)*15*rad))/rad;
  assert.ok(separation>.05&&separation<.15,`expected about 0.1°, got ${separation}`);
});

test('Mercury is aligned with the Sun during its November 2019 transit',()=>{
  const mercury=planetPositions('2019-11-11T15:20:00Z',0,0).find(p=>p.id==='mercury');
  assert.ok(mercury.elongation<.1);
});

test('time and observer location change the sky and Mercury moves relative to stars',()=>{
  const first=planetPositions('2026-10-22T14:00:00Z',13.7563,100.5018)[0];
  const later=planetPositions('2026-10-29T14:00:00Z',13.7563,100.5018)[0];
  const elsewhere=planetPositions('2026-10-22T14:00:00Z',-33.8688,151.2093)[0];
  assert.ok(Math.abs(first.ra-later.ra)>.01);
  assert.ok(Math.abs(first.altitude-elsewhere.altitude)>1);
  assert.throws(()=>planetPositions('invalid',0,0),RangeError);
  assert.throws(()=>planetPositions(new Date(),91,0),RangeError);
});

test('visibility distinguishes horizon, solar proximity and faint planets',()=>{
  assert.match(planetVisibility({id:'mars',altitude:-1,elongation:90}),/ใต้ขอบฟ้า/);
  assert.match(planetVisibility({id:'mercury',altitude:20,elongation:5}),/ใกล้ดวงอาทิตย์/);
  assert.match(planetVisibility({id:'neptune',altitude:20,elongation:90}),/ต้องใช้กล้อง/);
});
