import { useEffect, useRef, useState } from 'react';
import { Box, ChevronLeft, ChevronRight, LoaderCircle, Pause, Play, Plus, Minus, RotateCcw } from 'lucide-react';
import { celestialModel } from '../lib/celestialModels.js';
import './CelestialModel.css';

export default function CelestialModel({object}) {
  const host=useRef(null),scene=useRef(null);
  const [status,setStatus]=useState('loading');
  const [textureStatus,setTextureStatus]=useState('none');
  const [mapView,setMapView]=useState(false);
  const [retry,setRetry]=useState(0);
  const [spinning,setSpinning]=useState(false);
  const [guides,setGuides]=useState(false);
  const profile=celestialModel(object,mapView);
  useEffect(()=>{
    let cancelled=false;
    setStatus('loading');setTextureStatus(profile.texture?'loading':'none');setSpinning(false);setGuides(false);
    import('../lib/modelScene.js').then(({createModelScene})=>{
      if(cancelled)return;
      try {
        scene.current=createModelScene(host.current,profile,{
          onTextureError:()=>setTextureStatus('error'),
          onTextureLoaded:()=>setTextureStatus('ready'),
          onContextLost:()=>{setStatus('lost');setSpinning(false);},
          onRender:position=>{if(host.current)host.current.dataset.view=position.toArray().map(n=>n.toFixed(3)).join(',');},
        });
        setStatus('ready');
      } catch {setStatus('unavailable');}
    }).catch(()=>{if(!cancelled)setStatus('unavailable');});
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null;};
  },[object.id,retry,mapView]);
  const ready=status==='ready';
  const keyDown=event=>{
    const actions={ArrowLeft:()=>scene.current?.turn(-.16),ArrowRight:()=>scene.current?.turn(.16),ArrowUp:()=>scene.current?.turn(0,-.16),ArrowDown:()=>scene.current?.turn(0,.16),'+':()=>scene.current?.zoom(.85),'=':()=>scene.current?.zoom(.85),'-':()=>scene.current?.zoom(1.18)};
    if(actions[event.key]){event.preventDefault();actions[event.key]();}
  };
  return <section className="celestial-model" data-model-object={object.id} data-model-kind={profile.kind} data-model-status={status} data-texture-status={textureStatus}>
    <div className="model-heading"><Box size={15}/><span>{profile.label}</span><span className="model-badge">3D</span></div>
    {profile.alternativeMap&&<div className="model-map-options" aria-label="รูปแบบภาพดาวเคราะห์"><button aria-pressed={!mapView} onClick={()=>setMapView(false)}>สีโดยประมาณ</button><button aria-pressed={mapView} onClick={()=>setMapView(true)}>{object.id==='venus'?'พื้นผิวใต้เมฆ (ปรับสี)':'แผนที่ NASA (ปรับสี)'}</button></div>}
    <div className="model-stage-wrap">
      <div ref={host} className="model-stage" tabIndex={ready?0:-1} role="group" aria-label={`แบบจำลอง 3 มิติ ${object.name} ใช้ปุ่มลูกศรเพื่อหมุน และบวกลบเพื่อซูม`} onKeyDown={keyDown}/>
      {status==='loading'&&<div className="model-state" role="status"><LoaderCircle className="photo-spinner" size={25}/><span>กำลังเตรียมมุมมอง 3 มิติ…</span></div>}
      {['unavailable','lost'].includes(status)&&<div className="model-state" role="status"><Box size={30}/><strong>{status==='lost'?'การแสดงผล 3 มิติหยุดชั่วคราว':'อุปกรณ์นี้ยังเปิดภาพ 3 มิติไม่ได้'}</strong><span>ยังอ่านข้อมูลและเปิดแหล่งภาพด้านล่างได้</span><button onClick={()=>setRetry(value=>value+1)}>ลองเปิด 3 มิติอีกครั้ง</button></div>}
      {ready&&<span className="model-gesture">ลากเพื่อหมุน · กางสองนิ้วเพื่อซูม</span>}
    </div>
    <div className="model-controls" aria-label="ควบคุมภาพ 3 มิติ">
      <button disabled={!ready} aria-label="หมุนโมเดลไปทางซ้าย" onClick={()=>scene.current?.turn(-.3)}><ChevronLeft size={18}/></button>
      <button disabled={!ready} aria-label="หมุนโมเดลไปทางขวา" onClick={()=>scene.current?.turn(.3)}><ChevronRight size={18}/></button>
      <button disabled={!ready} aria-label="ขยายโมเดล 3 มิติ" onClick={()=>scene.current?.zoom(.85)}><Plus size={18}/></button>
      <button disabled={!ready} aria-label="ย่อโมเดล 3 มิติ" onClick={()=>scene.current?.zoom(1.18)}><Minus size={18}/></button>
      <button disabled={!ready} aria-label="คืนมุมมอง 3 มิติ" onClick={()=>{scene.current?.reset();scene.current?.setAutoRotate(false);setSpinning(false);}}><RotateCcw size={16}/></button>
      <button disabled={!ready} className="model-play" aria-pressed={spinning} onClick={()=>{scene.current?.setAutoRotate(!spinning);setSpinning(!spinning);}}>{spinning?<Pause size={14}/>:<Play size={14}/>}<span>{spinning?'หยุดหมุน':'หมุนอัตโนมัติ'}</span></button>
    </div>
    <label className="model-guides"><input type="checkbox" checked={guides} disabled={!ready} onChange={event=>{setGuides(event.target.checked);scene.current?.setGuides(event.target.checked);}}/>เส้นอ้างอิงบนแบบจำลอง</label>
    <p className="model-caption">{profile.note}</p>
    {profile.texture?<div className="model-source"><strong>{profile.texture.label}</strong><p>{profile.texture.note}</p>{textureStatus==='loading'&&<p role="status">กำลังโหลดแผนที่ภาพ…</p>}{textureStatus==='error'&&<p className="model-texture-error" role="status">โหลดแผนที่ภาพไม่สำเร็จ ขณะนี้แสดงเฉพาะรูปร่างและสีโดยประมาณ <button onClick={()=>setRetry(value=>value+1)}>ลองโหลดใหม่</button></p>}<a href={profile.texture.source} target="_blank" rel="noreferrer">ที่มาของแผนที่ภาพ · {profile.texture.credit} ↗</a><a href={`${import.meta.env.BASE_URL}${profile.texture.file}`} target="_blank" rel="noreferrer">เปิดแผนที่ภาพที่ใช้สร้างโมเดล ↗</a></div>:profile.kind==='planet'&&<p className="model-caption">{profile.alternativeMap?'มุมมองนี้แสดงรูปร่างและสีโดยประมาณ เลือกแผนที่แบบปรับสีด้านบนเพื่อสำรวจรายละเอียดเพิ่มเติม':'ยังไม่มีแผนที่ภาพที่ตรวจสอบได้สำหรับดาวดวงนี้ จึงแสดงรูปร่างและสีโดยประมาณ'}</p>}
    {profile.rings&&<p className="model-caption">วงแหวนหลัก A, B และ C แสดงสัดส่วนรัศมีและช่องว่างแคสซินี สีวงแหวนเป็นแบบจำลอง ไม่ใช่ภาพถ่าย</p>}
    {profile.kind==='planet'&&<div className="model-measurements"><span>เส้นผ่านศูนย์กลางเฉลี่ย <strong>{object.diameterKm.toLocaleString('th-TH')} กม.</strong></span><span>รัศมีขั้ว / เส้นศูนย์สูตร <strong>{profile.polarRatio.toFixed(3)}</strong></span><a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" target="_blank" rel="noreferrer">ข้อมูลรูปร่าง · NASA Planetary Fact Sheets ↗</a><small>แสดงตัวดาวและวงแหวนหลักของดาวเสาร์ วงแหวนจางของดาวอื่นกับดวงจันทร์บริวารยังไม่แสดง</small></div>}
  </section>;
}
