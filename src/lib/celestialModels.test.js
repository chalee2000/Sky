import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { stars } from './astronomy.js';
import { planets } from './planets.js';
import { celestialModel, modelTextures } from './celestialModels.js';

test('each visual map matches its NASA source object and unchanged downloaded asset',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../../public/textures/manifest.json',import.meta.url)));
  for(const [id,map] of Object.entries(modelTextures)){
    const record=manifest.textures.find(item=>item.id===id);
    assert.equal(map.source,record.source);
    assert.equal(map.file,`textures/${record.file}`);
    const bytes=readFileSync(new URL(`../../public/${map.file}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
    assert.match(map.note,/ไม่ใช่ภาพสด/);
  }
});

test('planet shapes and optional processed maps do not misrepresent optical views',()=>{
  const get=id=>planets.find(p=>p.id===id);
  assert.ok(celestialModel(get('saturn')).polarRatio<celestialModel(get('jupiter')).polarRatio);
  assert.equal(celestialModel(get('saturn')).rings,true);
  for(const id of ['venus','neptune']){
    assert.equal(celestialModel(get(id)).texture,null,'processed map requires an explicit view choice');
    assert.ok(celestialModel(get(id),true).texture);
  }
  for(const id of ['mercury','uranus']) assert.equal(celestialModel(get(id)).texture,null,'no substitute map from another planet');
});

test('unresolved stars have no made-up surface maps or planetary night hemispheres',()=>{
  for(const star of stars){
    const model=celestialModel(star);
    assert.equal(model.kind,'star');
    assert.equal(model.texture,null);
    assert.equal(model.color,star.color);
    assert.match(model.note,/ไม่ใช่ภาพถ่ายหรือรูปร่างที่วัดได้/);
    assert.match(model.note,/ระบบดาวหลายดวง/);
  }
});
