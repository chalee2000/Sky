import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Compass, Crosshair, RotateCcw } from 'lucide-react';
import { stars, constellations, equatorialToHorizontal } from '../lib/astronomy.js';
import { projectToView } from '../lib/orientation.js';
import { projectSkyDome } from '../lib/skyDome.js';
import { clampMapZoom as clampZoom } from '../lib/mapGestures.js';
import useWheelZoom from '../hooks/useWheelZoom.js';
import './SkyPointer.css';
import { PlanetMarker } from './Planets.jsx';
import { DeepSkyMarker } from './DeepSky.jsx';
import PointerConstellations from './PointerConstellations.jsx';
import StarGlyph from './StarGlyph.jsx';
import { layoutSkyLabels, overlaps, textWidth } from '../lib/skyLabels.js';
import useSkyLabelExclusions from '../hooks/useSkyLabelExclusions.js';

const clampAltitude=value=>Math.max(-10,Math.min(89,value));
const wrapHeading=value=>((value%360)+360)%360;
function manualView(heading,altitude){
  const az=heading*Math.PI/180,alt=altitude*Math.PI/180;
  return {heading,altitude,source:'manual',forward:[Math.cos(alt)*Math.sin(az),Math.cos(alt)*Math.cos(az),Math.sin(alt)],right:[Math.cos(az),-Math.sin(az),0],up:[-Math.sin(alt)*Math.sin(az),-Math.sin(alt)*Math.cos(az),Math.cos(alt)]};
}
const direction = angle => ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'][Math.round(angle/45)%8];

export default function SkyPointer({ sensor, date, location, showLines, showLabels, selectedStarId, onSelectStar, nightMode, planets=[],selectedPlanetId,onSelectPlanet,manual=false,zoom=1,onZoomChange,onToggleFullscreen,focusTarget,wideView=false,homeView=false,homeControlsExpanded=false,deepSky=[],selectedDeepSkyId,onSelectDeepSky }) {
  const container = useRef(null);
  const svgRef = useRef(null);
  const labelExclusions=useSkyLabelExclusions(container,homeView,homeControlsExpanded);
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
  const backgroundStars = useMemo(() => catalog.map(([ra, dec, magnitude, bv]) => ({ magnitude, color: bv===''||bv===null?'#e8eaff':Number(bv)>1?'#ffc897':'#d6e4ff', ...equatorialToHorizontal(ra, dec, new Date(timestamp), location.latitude, location.longitude) })).filter(star => star.altitude >= 0), [catalog, timestamp, location.latitude, location.longitude]);
  const { width, height } = size;
  const view = manual ? manualView(manualAngles.heading,manualAngles.altitude) : sensor.view;
  const scale=clampZoom(zoom);
  zoomRef.current=scale;
  const baseFieldOfView=wideView?Math.min(150,2*Math.atan(Math.tan(55*Math.PI/180)*height/Math.max(width,1))*180/Math.PI):62;
  const fieldOfView=baseFieldOfView/scale;
  const project = (altitude, azimuth) => {
    if(!wideView)return projectToView(altitude,azimuth,view,width,height,fieldOfView);
    const point=projectSkyDome(altitude,azimuth,view,width,height,scale);
    // The phone home has stacked menus above the sky. Center its view below
    // those controls, or above the expanded dock; desktop and fullscreen
    // use the exact canvas center.
    if(point&&homeView&&width<=740&&height>width){
      point.y+=homeControlsExpanded?-50:80;
      point.visible=point.x>=0&&point.x<=width&&point.y>=0&&point.y<=height;
    }
    return point;
  };
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
  useWheelZoom(svgRef, factor=>{
    applyZoom(zoomRef.current*factor);
    rebasePinch();
  });
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
  const doubleClick=event=>{
    event.preventDefault();
    event.stopPropagation();
    if(event.button===0&&!suppressClick.current)onToggleFullscreen?.();
  };
  const keyDown=event=>{
    if(event.target!==event.currentTarget)return;
    const shifts={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,5],ArrowDown:[0,-5]};
    if(manual&&shifts[event.key]){event.preventDefault();turn(...shifts[event.key]);}
    if(['+','=','-'].includes(event.key)&&onZoomChange){event.preventDefault();applyZoom(scale+(event.key==='-'?-.2:.2));}
  };
  const projected = namedStars.map(star => ({ ...star, point: star.altitude>=0 ? project(star.altitude,star.azimuth) : null }));
  const projectedPlanets=planets.filter(object=>object.altitude>=0).map(object=>({...object,point:project(object.altitude,object.azimuth)})).filter(object=>object.point?.visible);
  const projectedDeepSky=deepSky.filter(object=>object.altitude>=0).map(object=>({...object,point:project(object.altitude,object.azimuth)})).filter(object=>object.point?.visible).sort((a,b)=>Number(a.id===selectedDeepSkyId)-Number(b.id===selectedDeepSkyId)||(b.magnitude??99)-(a.magnitude??99));
  const horizonLabels=[];
  if(view)for(const [text,az] of [['เหนือ (N)',0],['ตะวันออก (E)',90],['ใต้ (S)',180],['ตะวันตก (W)',270]]){
    const point=project(0,az);
    if(!point?.visible)continue;
    const w=textWidth(text,11)+10;
    const x=Math.max(w/2+8,Math.min(width-w/2-8,point.x)),y=point.y-9;
    const box={x:x-w/2,y:y-13,width:w,height:19};
    if(box.y<8||box.y+box.height>height-8||[...labelExclusions,...horizonLabels.map(label=>label.box)].some(other=>overlaps(box,other)))continue;
    horizonLabels.push({text,x,y,box});
  }
  const markerBoxes=[...projected.filter(star=>star.point?.visible),...projectedPlanets,...projectedDeepSky].map(object=>({x:object.point.x-3,y:object.point.y-3,width:6,height:6}));
  const labelItems=[
    ...projected.filter(star=>star.point?.visible&&(star.id===selectedStarId||(showLabels&&star.magnitude<=(scale<1.5?1.8:3.5)))).map(star=>({id:`star-${star.id}`,text:star.name,...star.point,priority:star.id===selectedStarId?1000:200-star.magnitude})),
    ...projectedPlanets.filter(object=>showLabels||object.id===selectedPlanetId).map(object=>({id:`planet-${object.id}`,text:object.name,...object.point,priority:object.id===selectedPlanetId?1000:350})),
    ...projectedDeepSky.filter(object=>object.id===selectedDeepSkyId||(showLabels&&(scale>=1.5||(object.magnitude!==null&&object.magnitude<=6)))).map(object=>({id:`deep-${object.id}`,text:object.id===selectedDeepSkyId?object.name:object.catalogId,...object.point,priority:object.id===selectedDeepSkyId?1000:100-(object.magnitude??12)})),
  ];
  const labelLayout=layoutSkyLabels(labelItems,width,height,{reserved:[...labelExclusions,...markerBoxes,...horizonLabels.map(label=>label.box)]});
  const starLabelIds=new Set(projected.filter(star=>labelLayout.placements.has(`star-${star.id}`)).map(star=>star.id));
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
  return <div ref={container} className={`sky-pointer ${manual?'sky-pointer-manual':''}`} data-manual={manual} data-projection={wideView?'stereographic':'perspective'} data-heading={view?.heading.toFixed(1)} data-altitude={view?.altitude.toFixed(1)} data-fov={fieldOfView.toFixed(1)} data-zoom={scale.toFixed(2)} tabIndex={0} role="group" aria-label={manual?'ท้องฟ้าเต็มพื้นที่ ลากหรือใช้ปุ่มลูกศรเพื่อเปลี่ยนทิศ กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม':'ท้องฟ้าตามทิศมือถือ กางสองนิ้วหรือใช้ปุ่มบวกลบเพื่อซูม'} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerCancel} onLostPointerCapture={event=>{if(event.target===event.currentTarget)pointerUp(event);}} onClickCapture={clickCapture} onKeyDown={keyDown}>
    <svg ref={svgRef} className="sky-pointer-svg" data-catalog-count={catalog.length} data-magnitude-limit={6+Math.min(1,scale-1)} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={manual?'แผนที่ท้องฟ้ารอบตัวตามตำแหน่งผู้สังเกต':'แผนที่ดาวตามทิศที่กล้องหลังมือถือชี้'} aria-description="ดับเบิลคลิกเพื่อเข้า–ออกเต็มจอ" onDoubleClick={doubleClick}>
      <defs><radialGradient id={`${uid}-sky`}><stop stopColor={nightMode?'#1c1116':'#0b1424'}/><stop offset="1" stopColor="#03070f"/></radialGradient><radialGradient id={`${uid}-star-glow`}><stop stopColor="#f4f7ff" stopOpacity=".85"/><stop offset=".25" stopColor="#afd5ff" stopOpacity=".45"/><stop offset="1" stopColor="#71b8ff" stopOpacity="0"/></radialGradient><clipPath id={`${uid}-clip`}><rect width={width} height={height}/></clipPath></defs>
      <rect width={width} height={height} fill={`url(#${uid}-sky)`}/>
      <g clipPath={`url(#${uid}-clip)`}>
        {view && <g aria-hidden="true">{[0,15,30,60].map(alt => <path key={alt} d={curve(Array.from({length:181},(_,i)=>[alt,i*2]))} fill="none" stroke={alt===0?'#36b9ed':accent} strokeOpacity={alt===0?.65:.045} strokeWidth={alt===0?1.4:.6} strokeDasharray={alt===0?undefined:'3 6'}/>)}{Array.from({length:12},(_,i)=><path key={i} d={curve(Array.from({length:46},(_,j)=>[j*2,i*30]))} fill="none" stroke={accent} strokeOpacity=".035" strokeWidth=".6"/>)}</g>}
        {view && backgroundStars.map((star,i) => { if(star.magnitude>6+Math.min(1,scale-1))return null; const p=project(star.altitude,star.azimuth); return p?.visible && <circle key={i} cx={p.x} cy={p.y} r={wideView?Math.max(.35,1.5-star.magnitude*.17):Math.max(.55,2.1-star.magnitude*.24)} fill={nightMode?'#d5a292':star.color} opacity={wideView?Math.max(.035,.5-star.magnitude*.07):Math.max(.25,.95-star.magnitude*.09)}/>; })}
        {view && showLines && <PointerConstellations starLabelIds={starLabelIds} reservedBoxes={labelLayout.boxes} projectedStars={projected} constellations={constellations} selectedStarId={selectedStarId} width={width} height={height} showLabels={showLabels} nightMode={nightMode}/>}
        {view && projected.filter(star=>star.point?.visible).map(star=>{
          const label=labelLayout.placements.get(`star-${star.id}`);
          return <g key={star.id} role="button" tabIndex={0} className="pointer-star" aria-label={`${star.name} (${star.nameEn})`} aria-pressed={selectedStarId===star.id} onClick={()=>onSelectStar(star.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectStar(star.id);}}}>
            <title>{star.name} · {star.nameEn}</title>
            <StarGlyph x={star.point.x} y={star.point.y} magnitude={star.magnitude} color={star.color} nightMode={nightMode}/>
            {selectedStarId===star.id&&<circle className="sky-selected-ring" cx={star.point.x} cy={star.point.y} r="12" fill="none" stroke={accent} strokeWidth=".8" opacity=".8"/>}
            {label&&<text x={label.x} y={label.y} textAnchor={label.anchor} fill="#bdcbdc" className="pointer-star-label">{star.name}</text>}
            <circle cx={star.point.x} cy={star.point.y} r="13" fill="transparent" className="pointer-star-hit"/>
          </g>;
        })}
        {view && projectedDeepSky.map(object=><DeepSkyMarker key={object.id} object={object} x={object.point.x} y={object.point.y} selected={selectedDeepSkyId===object.id} onSelect={onSelectDeepSky} labelPlacement={labelLayout.placements.get(`deep-${object.id}`)||null} showLabels={showLabels} nightMode={nightMode}/>)}
        {view && projectedPlanets.map(planet=><PlanetMarker key={planet.id} planet={planet} x={planet.point.x} y={planet.point.y} selected={selectedPlanetId===planet.id} onSelect={onSelectPlanet} labelPlacement={labelLayout.placements.get(`planet-${planet.id}`)||null} showLabels={showLabels} nightMode={nightMode} pointer/>)}
        {horizonLabels.map(label=><text key={label.text} x={label.x} y={label.y} textAnchor="middle" className="sky-horizon-label">{label.text}</text>)}
      </g>
      {view&&!wideView&&<g aria-hidden="true" stroke={accent} strokeWidth="1" opacity=".7"><path d={`M${width/2-14},${height/2}h9 M${width/2+5},${height/2}h9 M${width/2},${height/2-14}v9 M${width/2},${height/2+5}v9`}/><circle cx={width/2} cy={height/2} r="2" fill={accent} stroke="none"/></g>}
    </svg>
    {!view && <div className="pointer-waiting" role="status"><Compass size={35}/><strong>{sensor.status==='requesting'?'รออนุญาตเซ็นเซอร์':'กำลังรอทิศทางจากมือถือ…'}</strong><span>ยกมือถือให้กล้องหลังชี้ไปยังท้องฟ้า<br/>แล้วค่อย ๆ หมุนตัวเพื่อสำรวจ</span></div>}
    {view && <><div className="pointer-readout"><Compass size={14}/><strong>{direction(view.heading)} {Math.round(view.heading)}°</strong><span>เงย {view.altitude.toFixed(0)}°</span></div><div className="pointer-guidance">{manual?<>{sensor.enabled?'รอทิศมือถือ · ลากดูได้ระหว่างรอ':`${view.altitude<0?'กำลังมองต่ำกว่าขอบฟ้า · ':''}ลากเพื่อหมุนมุมมอง · กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม`}</>:view.altitude<0?<><Crosshair size={14}/> ลองยกกล้องหลังขึ้นเหนือขอบฟ้า</>:<>ตามทิศมือถือ · กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม</>}</div></>}
    {manual&&<button className="pointer-reset" aria-label="คืนมุมมองท้องฟ้าเต็มจอ" onClick={()=>{setManualAngles({heading:0,altitude:45});onZoomChange?.(1);}}><RotateCcw size={13}/><span>N ↑ คืนมุมมอง</span></button>}
    {catalogError && <p className="pointer-catalog-error" role="status">โหลดข้อมูลดาวพื้นหลังไม่ได้ · แสดงเฉพาะดาวเด่น</p>}
  </div>;
}
