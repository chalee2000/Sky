import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Compass, Crosshair, RotateCcw } from 'lucide-react';
import { stars, constellations, equatorialToHorizontal } from '../lib/astronomy.js';
import { projectToView } from '../lib/orientation.js';
import { projectSkyDome } from '../lib/skyDome.js';
import { clampMapZoom as clampZoom } from '../lib/mapGestures.js';
import './SkyPointer.css';
import { PlanetMarker } from './Planets.jsx';
import PointerConstellations from './PointerConstellations.jsx';

const clampAltitude=value=>Math.max(-10,Math.min(89,value));
const wrapHeading=value=>((value%360)+360)%360;
function manualView(heading,altitude){
  const az=heading*Math.PI/180,alt=altitude*Math.PI/180;
  return {heading,altitude,source:'manual',forward:[Math.cos(alt)*Math.sin(az),Math.cos(alt)*Math.cos(az),Math.sin(alt)],right:[Math.cos(az),-Math.sin(az),0],up:[-Math.sin(alt)*Math.sin(az),-Math.sin(alt)*Math.cos(az),Math.cos(alt)]};
}
const direction = angle => ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'][Math.round(angle/45)%8];

export default function SkyPointer({ sensor, date, location, showLines, showLabels, selectedStarId, onSelectStar, nightMode, planets=[],selectedPlanetId,onSelectPlanet,manual=false,zoom=1,onZoomChange,focusTarget,wideView=false }) {
  const container = useRef(null);
  const pointers=useRef(new Map());
  const pinch=useRef(null);
  const zoomRef=useRef(zoom);
  const suppressClick=useRef(false);
  const [manualAngles,setManualAngles]=useState({heading:0,altitude:45});
  useEffect(()=>{if(focusTarget)setManualAngles({heading:wrapHeading(focusTarget.heading),altitude:clampAltitude(focusTarget.altitude)});},[focusTarget]);
  useEffect(()=>{
    pointers.current.clear();pinch.current=null;suppressClick.current=false;
    return ()=>{
      for(const id of pointers.current.keys()){
        if(container.current?.hasPointerCapture?.(id))container.current.releasePointerCapture(id);
      }
      pointers.current.clear();pinch.current=null;
    };
  },[manual]);
  const uid = useId().replaceAll(':', '');
  const [size, setSize] = useState({ width: 700, height: 480 });
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState(false);
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/stars.json`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw Error('catalog'); return r.json(); })
      .then(rows => { if (!Array.isArray(rows)) throw Error('catalog'); setCatalog(rows); })
      .catch(error => { if (error.name !== 'AbortError') setCatalogError(true); });
    return () => controller.abort();
  }, []);
  const timestamp = date.getTime();
  const namedStars = useMemo(() => stars.map(star => ({ ...star, ...equatorialToHorizontal(star.ra, star.dec, new Date(timestamp), location.latitude, location.longitude) })), [timestamp, location.latitude, location.longitude]);
  const backgroundStars = useMemo(() => catalog.map(([ra, dec, magnitude, bv]) => ({ magnitude, color: Number(bv)>1?'#ffc897':'#d6e4ff', ...equatorialToHorizontal(ra, dec, new Date(timestamp), location.latitude, location.longitude) })).filter(star => star.altitude >= 0), [catalog, timestamp, location.latitude, location.longitude]);
  const { width, height } = size;
  const view = manual ? manualView(manualAngles.heading,manualAngles.altitude) : sensor.view;
  const scale=clampZoom(zoom);
  zoomRef.current=scale;
  const baseFieldOfView=wideView?Math.min(150,2*Math.atan(Math.tan(55*Math.PI/180)*height/Math.max(width,1))*180/Math.PI):62;
  const fieldOfView=baseFieldOfView/scale;
  const project = (altitude, azimuth) => wideView?projectSkyDome(altitude,azimuth,view,width,height,scale):projectToView(altitude, azimuth, view, width, height,fieldOfView);
  const turn=(heading,altitude)=>setManualAngles(previous=>({heading:wrapHeading(previous.heading+heading),altitude:clampAltitude(previous.altitude+altitude)}));
  const applyZoom=value=>{
    const next=clampZoom(value);zoomRef.current=next;onZoomChange?.(next);
  };
  const capturePointers=()=>{
    for(const id of pointers.current.keys()){
      if(!container.current?.hasPointerCapture?.(id))container.current?.setPointerCapture?.(id);
    }
  };
  const rebasePinch=()=>{
    const [a,b]=[...pointers.current.values()];
    pinch.current=a&&b?{distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoomRef.current}:null;
  };
  const pointerDown=event=>{
    if(event.button!==0||!event.target.closest('.sky-pointer-svg'))return;
    if(pointers.current.size===0)suppressClick.current=false;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,dragged:false});
    if(pointers.current.size>=2){
      event.preventDefault();suppressClick.current=true;
      for(const point of pointers.current.values())point.dragged=true;
      capturePointers();rebasePinch();
    }
  };
  const pointerMove=event=>{
    const previous=pointers.current.get(event.pointerId);
    if(!previous)return;
    pointers.current.set(event.pointerId,{...previous,x:event.clientX,y:event.clientY});
    if(pointers.current.size>=2&&pinch.current){
      event.preventDefault();suppressClick.current=true;
      const [a,b]=[...pointers.current.values()];
      if(pinch.current.distance>0)applyZoom(pinch.current.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance);
    }else if(manual&&pointers.current.size===1){
      if(!previous.dragged&&Math.hypot(event.clientX-previous.startX,event.clientY-previous.startY)<5)return;
      event.preventDefault();suppressClick.current=true;capturePointers();
      pointers.current.get(event.pointerId).dragged=true;
      const degreesPerPixel=(baseFieldOfView/zoomRef.current)/Math.max(height,1);
      turn(-(event.clientX-(previous.dragged?previous.x:previous.startX))*degreesPerPixel,(event.clientY-(previous.dragged?previous.y:previous.startY))*degreesPerPixel);
    }else if(Math.hypot(event.clientX-previous.startX,event.clientY-previous.startY)>=5){
      // A swipe in compass mode must not become an accidental object tap.
      suppressClick.current=true;
    }
  };
  const pointerUp=event=>{
    if(!pointers.current.has(event.pointerId))return;
    pointers.current.delete(event.pointerId);
    if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    rebasePinch();
  };
  const pointerCancel=event=>{
    suppressClick.current=true;
    const ids=[...pointers.current.keys()];pointers.current.clear();pinch.current=null;
    for(const id of ids)if(event.currentTarget.hasPointerCapture?.(id))event.currentTarget.releasePointerCapture(id);
  };
  const clickCapture=event=>{
    if(event.detail>0&&suppressClick.current&&event.target.closest('.sky-pointer-svg')){
      event.preventDefault();event.stopPropagation();
    }
  };
  const keyDown=event=>{
    if(event.target!==event.currentTarget)return;
    const shifts={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,5],ArrowDown:[0,-5]};
    if(manual&&shifts[event.key]){event.preventDefault();turn(...shifts[event.key]);}
    if(['+','=','-'].includes(event.key)&&onZoomChange){event.preventDefault();applyZoom(scale+(event.key==='-'?-.2:.2));}
  };
  const projected = namedStars.map(star => ({ ...star, point: star.altitude>=0 ? project(star.altitude,star.azimuth) : null }));
  // Keep bright names readable at the overview scale; reveal more as users zoom.
  // Every star remains selectable, including those whose text is hidden.
  const starLabelIds = new Set();
  const labelBoxes = [];
  if(showLabels){
    const candidates=projected.filter(star=>star.point?.visible)
      .sort((a,b)=>Number(b.id===selectedStarId)-Number(a.id===selectedStarId)||a.magnitude-b.magnitude);
    for(const star of candidates){
      if(wideView&&width<500&&scale<1.5&&star.magnitude>1.6&&star.id!==selectedStarId)continue;
      const box={x:star.point.x+9,y:star.point.y-23,width:[...star.name].filter(c=>!/\p{M}/u.test(c)).length*6.5+10,height:18};
      const collides=labelBoxes.some(other=>box.x<other.x+other.width+5&&box.x+box.width+5>other.x&&box.y<other.y+other.height+5&&box.y+box.height+5>other.y);
      if(star.id!==selectedStarId&&(collides||box.x+box.width>width-4||box.y<4))continue;
      starLabelIds.add(star.id);labelBoxes.push(box);
    }
  }
  const accent = nightMode ? '#e4a091' : '#b5a7ff';
  function curve(points) {
    let path = '', connected = false;
    for (const [alt, az] of points) {
      const p = project(alt, az);
      if (!p || p.x < -width*3 || p.x > width*4 || p.y < -height*3 || p.y > height*4) { connected = false; continue; }
      path += `${connected?'L':'M'}${p.x.toFixed(2)},${p.y.toFixed(2)} `;
      connected = true;
    }
    return path;
  }
  return <div ref={container} className={`sky-pointer ${manual?'sky-pointer-manual':''}`} data-manual={manual} data-projection={wideView?'stereographic':'perspective'} data-heading={view?.heading.toFixed(1)} data-altitude={view?.altitude.toFixed(1)} data-fov={fieldOfView.toFixed(1)} data-zoom={scale.toFixed(2)} tabIndex={0} role="group" aria-label={manual?'ท้องฟ้าเต็มพื้นที่ ลากหรือใช้ปุ่มลูกศรเพื่อเปลี่ยนทิศ กางสองนิ้วเพื่อซูม':'ท้องฟ้าตามทิศมือถือ กางสองนิ้วหรือใช้ปุ่มบวกลบเพื่อซูม'} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel} onLostPointerCapture={event=>{if(event.target===event.currentTarget)pointerUp(event);}} onClickCapture={clickCapture} onKeyDown={keyDown}>
    <svg className="sky-pointer-svg" viewBox={`0 0 ${width} ${height}`} role="group" aria-label={manual?'แผนที่ท้องฟ้ารอบตัวตามตำแหน่งผู้สังเกต':'แผนที่ดาวตามทิศที่กล้องหลังมือถือชี้'}>
      <defs><radialGradient id={`${uid}-sky`}><stop stopColor={nightMode?'#21131b':'#101a32'}/><stop offset="1" stopColor="#03070f"/></radialGradient><radialGradient id={`${uid}-star-glow`}><stop stopColor="#f4f7ff" stopOpacity=".85"/><stop offset=".25" stopColor="#afd5ff" stopOpacity=".45"/><stop offset="1" stopColor="#71b8ff" stopOpacity="0"/></radialGradient><clipPath id={`${uid}-clip`}><rect width={width} height={height}/></clipPath></defs>
      <rect width={width} height={height} fill={`url(#${uid}-sky)`}/>
      <g clipPath={`url(#${uid}-clip)`}>
        {view && <g aria-hidden="true">{[0,15,30,60].map(alt => <path key={alt} d={curve(Array.from({length:181},(_,i)=>[alt,i*2]))} fill="none" stroke={alt===0?'#36b9ed':accent} strokeOpacity={alt===0?.65:.045} strokeWidth={alt===0?1.4:.6} strokeDasharray={alt===0?undefined:'3 6'}/>)}{Array.from({length:12},(_,i)=><path key={i} d={curve(Array.from({length:46},(_,j)=>[j*2,i*30]))} fill="none" stroke={accent} strokeOpacity=".035" strokeWidth=".6"/>)}</g>}
        {view && backgroundStars.map((star,i) => { const p=project(star.altitude,star.azimuth); return p?.visible && <circle key={i} cx={p.x} cy={p.y} r={wideView?Math.max(.35,1.5-star.magnitude*.17):Math.max(.55,2.1-star.magnitude*.24)} fill={nightMode?'#d5a292':star.color} opacity={wideView?Math.max(.035,.5-star.magnitude*.07):Math.max(.25,.95-star.magnitude*.09)}/>; })}
        {view && showLines && <PointerConstellations starLabelIds={starLabelIds} projectedStars={projected} constellations={constellations} selectedStarId={selectedStarId} width={width} height={height} showLabels={showLabels} nightMode={nightMode}/>}
        {view && projected.filter(star=>star.point?.visible).map(star=><g key={star.id} role="button" tabIndex={0} className="pointer-star" aria-label={`${star.name} (${star.nameEn})`} aria-pressed={selectedStarId===star.id} onClick={()=>onSelectStar(star.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectStar(star.id);}}}><title>{star.name} · {star.nameEn}</title>{!nightMode&&<circle cx={star.point.x} cy={star.point.y} r={star.magnitude<1?14:9} fill={`url(#${uid}-star-glow)`} pointerEvents="none"/>}{selectedStarId===star.id&&<circle cx={star.point.x} cy={star.point.y} r="15" fill="none" stroke={accent} strokeWidth="1"/>}<circle cx={star.point.x} cy={star.point.y} r={Math.max(1.6,3.6-star.magnitude*.5)} fill={nightMode?'#f0baa7':star.color}/>{starLabelIds.has(star.id)&&<text x={star.point.x+10} y={star.point.y-10} fill="#d7d8ec" className="pointer-star-label">{star.name}</text>}<circle cx={star.point.x} cy={star.point.y} r="13" fill="transparent" className="pointer-star-hit"/></g>)}
        {view && planets.filter(planet=>planet.altitude>=0).map(planet=>{const p=project(planet.altitude,planet.azimuth);return p?.visible&&<PlanetMarker key={planet.id} planet={planet} x={p.x} y={p.y} selected={selectedPlanetId===planet.id} onSelect={onSelectPlanet} showLabels={showLabels} nightMode={nightMode} pointer/>;})}
        {view && [['เหนือ (N)',0],['ตะวันออก (E)',90],['ใต้ (S)',180],['ตะวันตก (W)',270]].map(([label,az])=>{const p=project(0,az);return p&&<text key={label} x={p.x} y={p.y-9} textAnchor="middle" fill="#5dceff" fontSize="13">{label}</text>;})}
      </g>
      {view&&!wideView&&<g aria-hidden="true" stroke={accent} strokeWidth="1" opacity=".7"><path d={`M${width/2-14},${height/2}h9 M${width/2+5},${height/2}h9 M${width/2},${height/2-14}v9 M${width/2},${height/2+5}v9`}/><circle cx={width/2} cy={height/2} r="2" fill={accent} stroke="none"/></g>}
    </svg>
    {!view && <div className="pointer-waiting" role="status"><Compass size={35}/><strong>{sensor.status==='requesting'?'รออนุญาตเซ็นเซอร์':'กำลังรอทิศทางจากมือถือ…'}</strong><span>ยกมือถือให้กล้องหลังชี้ไปยังท้องฟ้า<br/>แล้วค่อย ๆ หมุนตัวเพื่อสำรวจ</span></div>}
    {view && <><div className="pointer-readout"><Compass size={14}/><strong>{direction(view.heading)} {Math.round(view.heading)}°</strong><span>เงย {view.altitude.toFixed(0)}°</span></div><div className="pointer-guidance">{manual?<>{sensor.enabled?'รอทิศมือถือ · ลากดูได้ระหว่างรอ':`${view.altitude<0?'กำลังมองต่ำกว่าขอบฟ้า · ':''}ลากเพื่อหมุนมุมมอง · กางสองนิ้วเพื่อซูม`}</>:view.altitude<0?<><Crosshair size={14}/> ลองยกกล้องหลังขึ้นเหนือขอบฟ้า</>:<>ตามทิศมือถือ · กางสองนิ้วเพื่อซูม</>}</div></>}
    {manual&&<button className="pointer-reset" aria-label="คืนมุมมองท้องฟ้าเต็มจอ" onClick={()=>{setManualAngles({heading:0,altitude:45});onZoomChange?.(1);}}><RotateCcw size={13}/><span>N ↑ คืนมุมมอง</span></button>}
    {catalogError && <p className="pointer-catalog-error" role="status">โหลดข้อมูลดาวพื้นหลังไม่ได้ · แสดงเฉพาะดาวเด่น</p>}
  </div>;
}
