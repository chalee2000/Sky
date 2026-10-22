import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Compass, Crosshair } from 'lucide-react';
import { stars, constellations, equatorialToHorizontal } from '../lib/astronomy.js';
import { projectToView } from '../lib/orientation.js';
import './SkyPointer.css';

const direction = angle => ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'][Math.round(angle/45)%8];

export default function SkyPointer({ sensor, date, location, showLines, showLabels, selectedStarId, onSelectStar, nightMode }) {
  const container = useRef(null);
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
  const view = sensor.view;
  const project = (altitude, azimuth) => projectToView(altitude, azimuth, view, width, height);
  const projected = namedStars.map(star => ({ ...star, point: star.altitude>=0 ? project(star.altitude,star.azimuth) : null }));
  const byId = new Map(projected.map(star => [star.id, star]));
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
  return <div ref={container} className="sky-pointer" data-heading={view?.heading.toFixed(1)} data-altitude={view?.altitude.toFixed(1)}>
    <svg className="sky-pointer-svg" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="แผนที่ดาวตามทิศที่กล้องหลังมือถือชี้">
      <defs><radialGradient id={`${uid}-sky`}><stop stopColor={nightMode?'#2c171f':'#1b2441'}/><stop offset="1" stopColor="#0b101c"/></radialGradient><clipPath id={`${uid}-clip`}><rect width={width} height={height}/></clipPath></defs>
      <rect width={width} height={height} fill={`url(#${uid}-sky)`}/>
      <g clipPath={`url(#${uid}-clip)`}>
        {view && <g aria-hidden="true">{[0,15,30,60].map(alt => <path key={alt} d={curve(Array.from({length:181},(_,i)=>[alt,i*2]))} fill="none" stroke={alt===0?'#a9b9b3':accent} strokeOpacity={alt===0?.55:.12} strokeWidth={alt===0?1.4:.6} strokeDasharray={alt===0?undefined:'3 6'}/>)}{Array.from({length:12},(_,i)=><path key={i} d={curve(Array.from({length:46},(_,j)=>[j*2,i*30]))} fill="none" stroke={accent} strokeOpacity=".1" strokeWidth=".6"/>)}</g>}
        {view && backgroundStars.map((star,i) => { const p=project(star.altitude,star.azimuth); return p?.visible && <circle key={i} cx={p.x} cy={p.y} r={Math.max(.55,2.1-star.magnitude*.24)} fill={nightMode?'#d5a292':star.color} opacity={Math.max(.25,.95-star.magnitude*.09)}/>; })}
        {view && showLines && <g className="pointer-constellation-lines" aria-hidden="true">{constellations.flatMap(c=>c.lines.map(([a,b],i)=>{const p=byId.get(a)?.point,q=byId.get(b)?.point;return p&&q&&Math.abs(p.x-q.x)<width*3&&Math.abs(p.y-q.y)<height*3&&<line key={`${c.id}-${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={accent} strokeWidth=".8" strokeOpacity=".45"/>;}))}</g>}
        {view && projected.filter(star=>star.point?.visible).map(star=><g key={star.id} role="button" tabIndex={0} className="pointer-star" aria-label={`${star.name} (${star.nameEn})`} aria-pressed={selectedStarId===star.id} onClick={()=>onSelectStar(star.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectStar(star.id);}}}><title>{star.name} · {star.nameEn}</title>{selectedStarId===star.id&&<circle cx={star.point.x} cy={star.point.y} r="15" fill="none" stroke={accent} strokeWidth="1"/>}<circle cx={star.point.x} cy={star.point.y} r={Math.max(1.6,3.6-star.magnitude*.5)} fill={nightMode?'#f0baa7':star.color}/>{showLabels&&<text x={star.point.x+10} y={star.point.y-10} fill="#d7d8ec" className="pointer-star-label">{star.name}</text>}<circle cx={star.point.x} cy={star.point.y} r="13" fill="transparent" className="pointer-star-hit"/></g>)}
        {view && [['N',0],['E',90],['S',180],['W',270]].map(([label,az])=>{const p=project(0,az);return p&&<text key={label} x={p.x} y={p.y-9} textAnchor="middle" fill="#c7c6df" fontSize="13">{label}</text>;})}
      </g>
      {view&&<g aria-hidden="true" stroke={accent} strokeWidth="1" opacity=".7"><path d={`M${width/2-14},${height/2}h9 M${width/2+5},${height/2}h9 M${width/2},${height/2-14}v9 M${width/2},${height/2+5}v9`}/><circle cx={width/2} cy={height/2} r="2" fill={accent} stroke="none"/></g>}
    </svg>
    {!view && <div className="pointer-waiting" role="status"><Compass size={35}/><strong>{sensor.status==='requesting'?'รออนุญาตเซ็นเซอร์':'กำลังรอทิศทางจากมือถือ…'}</strong><span>ยกมือถือให้กล้องหลังชี้ไปยังท้องฟ้า<br/>แล้วค่อย ๆ หมุนตัวเพื่อสำรวจ</span></div>}
    {view && <><div className="pointer-readout"><Compass size={14}/><strong>{direction(view.heading)} {Math.round(view.heading)}°</strong><span>เงย {view.altitude.toFixed(0)}°</span></div><div className="pointer-guidance">{view.altitude<0?<><Crosshair size={14}/> ลองยกกล้องหลังขึ้นเหนือขอบฟ้า</>:<>แผนที่ตามทิศมือถือ · ไม่ใช้กล้อง</>}</div></>}
    {catalogError && <p className="pointer-catalog-error" role="status">โหลดข้อมูลดาวพื้นหลังไม่ได้ · แสดงเฉพาะดาวเด่น</p>}
  </div>;
}
