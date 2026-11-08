import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutSkyLabels, overlaps } from './skyLabels.js';
import { starAppearance } from './starAppearance.js';

test('crowded labels avoid controls and each other without moving sky objects',()=>{
  const items=[
    {id:'selected',text:'กาแล็กซีแอนดรอเมดา',x:160,y:100,priority:1000},
    {id:'star',text:'อัลเดบารัน',x:164,y:101,priority:200},
    {id:'planet',text:'ดาวเสาร์',x:163,y:99,priority:350},
    {id:'galaxy',text:'M32',x:165,y:102,priority:100},
    {id:'edge',text:'ดาวใกล้ขอบภาพ',x:385,y:285,priority:50},
  ];
  const original=structuredClone(items);
  const reserved=[{x:0,y:0,width:400,height:80}];
  const {placements}=layoutSkyLabels(items,400,300,{reserved});
  assert.ok(placements.has('selected'),'selected object gets placement priority');
  const boxes=[...placements.values()].map(label=>label.box);
  for(let i=0;i<boxes.length;i++){
    const box=boxes[i];
    assert.ok(box.x>=8&&box.x+box.width<=392&&box.y>=8&&box.y+box.height<=292);
    assert.ok(!overlaps(box,reserved[0]));
    for(let j=i+1;j<boxes.length;j++)assert.ok(!overlaps(box,boxes[j]));
  }
  assert.deepEqual(items,original,'only text moves, never object coordinates');
});

test('star light remains ordered by catalog magnitude with bounded display sizes',()=>{
  const bright=starAppearance(-1.4),medium=starAppearance(2),faint=starAppearance(6);
  assert.ok(bright.coreRadius>medium.coreRadius&&medium.coreRadius>faint.coreRadius);
  assert.ok(bright.haloOpacity>faint.haloOpacity);
  for(const magnitude of [-100,0,7,100,NaN]){
    const style=starAppearance(magnitude);
    assert.ok(Number.isFinite(style.coreRadius)&&style.coreRadius<=2.1&&style.coreRadius>0);
    assert.ok(style.haloOpacity<=.22&&style.haloOpacity>0);
  }
});
