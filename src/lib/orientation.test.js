import test from 'node:test';
import assert from 'node:assert/strict';
import { orientationToView, projectToView, smoothView } from './orientation.js';

const close = (a,b,tolerance=1e-7) => assert.ok(Math.abs(a-b)<tolerance, `${a} != ${b}`);
const view = (alpha=0,beta=90,gamma=0,screen=0) => orientationToView({alpha,beta,gamma,absolute:true},screen);

test('upright rear camera points north, with east to the right and zenith above',()=>{
  const v=view();close(v.heading,0);close(v.altitude,0);
  const center=projectToView(0,0,v,800,500);close(center.x,400);close(center.y,250);
  assert.ok(projectToView(0,10,v,800,500).x>400);
  assert.ok(projectToView(10,0,v,800,500).y<250);
});
test('absolute rotation follows all four compass directions without mirroring',()=>{
  for(const [alpha,heading] of [[0,0],[270,90],[180,180],[90,270]]) {
    const v=view(alpha);close(v.heading,heading);
    const point=projectToView(0,heading,v,800,500);close(point.x,400);close(point.y,250);
  }
});
test('tilt points to a star above the horizon and handles zenith and ground',()=>{
  const tilted=view(0,135);close(tilted.altitude,45);
  const centered=projectToView(45,0,tilted,800,500);close(centered.x,400);close(centered.y,250);
  close(view(0,180).altitude,90);
  close(view(0,0).altitude,-90);
});
test('landscape screen rotation preserves pointing but rotates screen axes',()=>{
  const portrait=view(),landscape=view(0,90,0,90);
  for(let i=0;i<3;i++)close(portrait.forward[i],landscape.forward[i]);
  const east=projectToView(0,10,landscape,800,500);
  close(east.x,400);assert.ok(east.y<250);
});
test('iPhone compass supplies north even when alpha is relative or absent',()=>{
  const v=orientationToView({alpha:null,beta:90,gamma:0,absolute:false,webkitCompassHeading:90,webkitCompassAccuracy:12});
  close(v.heading,90);assert.equal(v.source,'magnetic');
  assert.equal(orientationToView({beta:90,gamma:0,webkitCompassHeading:90,webkitCompassAccuracy:-1}),null);
});
test('relative, missing, or non-finite sensor readings never masquerade as a compass',()=>{
  for(const s of [null,{}, {alpha:0,beta:90,gamma:0,absolute:false},{alpha:0,beta:null,gamma:0,absolute:true},{alpha:NaN,beta:90,gamma:0,absolute:true}])assert.equal(orientationToView(s),null);
});
test('rear hemisphere and field-of-view bounds are clipped',()=>{
  const v=view();assert.equal(projectToView(0,180,v,800,500),null);
  assert.equal(projectToView(60,0,v,800,500).visible,false);
  assert.equal(projectToView(10,0,v,800,500).visible,true);
  assert.equal(projectToView(0,0,v,0,500),null);
});
test('roll and screen rotation leave the basis orthonormal',()=>{
  for(const a of [0,57,270])for(const b of [-90,0,90,135,180])for(const g of [-60,0,60]) {
    const v=view(a,b,g,90);
    for(const axis of [v.forward,v.right,v.up])close(Math.hypot(...axis),1);
    close(v.forward.reduce((sum,n,i)=>sum+n*v.up[i],0),0);
    close(v.right.reduce((sum,n,i)=>sum+n*v.up[i],0),0);
  }
});
test('smoothing crosses north by the short path instead of spinning 360 degrees',()=>{
  const smoothed=smoothView(view(1),view(359),.5);
  assert.ok(smoothed.heading<.01||smoothed.heading>359.99);
  close(Math.hypot(...smoothed.forward),1);
});
