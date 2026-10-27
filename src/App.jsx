import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Box, Camera, CalendarDays, Check, ChevronDown, ChevronRight, Clock3, Compass, Crosshair, Eye, HelpCircle, Layers3, LocateFixed, MapPin, Maximize2, Minimize2, Minus, Moon, Plus, RotateCcw, Search, Sparkles, Star, Sun, Telescope, X } from 'lucide-react';
import SkyMap from './components/SkyMap.jsx';
import { MIN_MAP_ZOOM, MAX_MAP_ZOOM, clampMapZoom } from './lib/mapGestures.js';
import SkyPointer from './components/SkyPointer.jsx';
import SkyHud from './components/SkyHud.jsx';
import StarStory from './components/StarStory.jsx';
import ConstellationDetails from './components/ConstellationDetails.jsx';
import CelestialModel from './components/CelestialModel.jsx';
import { PlanetList, PlanetCard, PlanetDetails } from './components/Planets.jsx';
import { planetPositions } from './lib/planets.js';
import StarPhoto, { StarPhotoButton } from './components/StarPhoto.jsx';
import useSkyOrientation from './hooks/useSkyOrientation.js';
import useLiveLocation from './hooks/useLiveLocation.js';
import useMapFullscreen from './hooks/useMapFullscreen.js';
import { stars, constellations, equatorialToHorizontal, moonPhase, sunPosition } from './lib/astronomy.js';

const cities = [
  { name: 'กรุงเทพมหานคร', short: 'กรุงเทพฯ', latitude: 13.7563, longitude: 100.5018 },
  { name: 'เชียงใหม่', short: 'เชียงใหม่', latitude: 18.7883, longitude: 98.9853 },
  { name: 'ดอยอินทนนท์', short: 'ดอยอินทนนท์', latitude: 18.5883, longitude: 98.4867 },
  { name: 'ขอนแก่น', short: 'ขอนแก่น', latitude: 16.4322, longitude: 102.8236 },
  { name: 'ชุมพร', short: 'ชุมพร', latitude: 10.4930, longitude: 99.1800 },
  { name: 'ภูเก็ต', short: 'ภูเก็ต', latitude: 7.8804, longitude: 98.3923 },
  { name: 'ลอนดอน', short: 'ลอนดอน', latitude: 51.5074, longitude: -0.1278 },
  { name: 'ซิดนีย์', short: 'ซิดนีย์', latitude: -33.8688, longitude: 151.2093 },
];
const BANGKOK_OFFSET = 7 * 60 * 60 * 1000;
const toInputDate = date => new Date(date.getTime() + BANGKOK_OFFSET).toISOString().slice(0, 16);
const dateFromInput = value => new Date(`${value}:00+07:00`);
const displayDate = date => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(date);
const displayTime = date => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }).format(date);
const direction = angle => ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้', 'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'][Math.round(angle / 45) % 8];
function initialDate() {
  const now = new Date();
  const hour = Number(toInputDate(now).slice(11, 13));
  return hour >= 18 || hour < 6 ? now : dateFromInput(`${toInputDate(now).slice(0, 10)}T21:00`);
}
function readBookmarks() {
  try { const data = JSON.parse(localStorage.getItem('sky-bookmarks') || '[]'); return Array.isArray(data) ? data.filter(id => stars.some(s => s.id === id)) : []; } catch { return []; }
}

function Brand({ small = false }) {
  return <span className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-icon"><Sparkles size={small ? 21 : 27} strokeWidth={1.5} /></span><span>sky<span className="brand-dot">.</span></span></span>;
}

function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} className={`modal ${wide ? 'modal-wide' : ''}`} onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}><div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="ปิดหน้าต่าง" onClick={onClose}><X size={20} /></button></div>{children}</dialog>;
}

function MoonArt({ phase }) {
  const p = phase.phase;
  const illuminated = Math.max(0, Math.min(1, phase.illumination));
  const radius = 45;
  const terminator = Math.abs(1 - 2 * illuminated) * radius;
  const waxing = p < 0.5;
  const edgeSweep = waxing ? 1 : 0;
  const innerSweep = illuminated > 0.5 ? edgeSweep : 1 - edgeSweep;
  const d = `M 60 15 A 45 45 0 0 ${edgeSweep} 60 105 A ${Math.max(0.01, terminator)} 45 0 0 ${innerSweep} 60 15`;
  return <svg className="moon-art" viewBox="0 0 120 120" aria-label={`ดวงจันทร์สว่าง ${Math.round(illuminated * 100)} เปอร์เซ็นต์`} role="img"><defs><radialGradient id="moon-base" cx="35%" cy="30%"><stop stopColor="#d6dbea" /><stop offset=".6" stopColor="#9aa5bb" /><stop offset="1" stopColor="#6b758e" /></radialGradient><clipPath id="moon-light"><path d={d} /></clipPath><filter id="moon-grain"><feTurbulence baseFrequency=".11" numOctaves="3" seed="4" /><feColorMatrix type="saturate" values="0" /><feBlend in="SourceGraphic" mode="multiply" /></filter></defs><circle cx="60" cy="60" r="46" fill="#39425b" opacity=".2" /><circle cx="60" cy="60" r="45" fill="#1b2233" /><g clipPath="url(#moon-light)"><circle cx="60" cy="60" r="45" fill="url(#moon-base)" /><circle cx="60" cy="60" r="45" fill="#9da5b7" filter="url(#moon-grain)" opacity=".44" /><g fill="#48516b" opacity=".24"><ellipse cx="48" cy="45" rx="13" ry="18" /><ellipse cx="65" cy="36" rx="11" ry="9" /><ellipse cx="74" cy="68" rx="13" ry="10" /><circle cx="43" cy="76" r="6" /><circle cx="67" cy="88" r="4" /></g></g></svg>;
}

function ConstellationArt({ constellation }) {
  const points = constellation.starIds.map(id => stars.find(s => s.id === id)).filter(Boolean);
  if (!points.length) return null;
  const reference = points[0].ra;
  const unwrapped = points.map(s => ({ ...s, ra: reference + ((s.ra - reference + 36) % 24 - 12) }));
  const minX = Math.min(...unwrapped.map(s => s.ra)), maxX = Math.max(...unwrapped.map(s => s.ra));
  const minY = Math.min(...points.map(s => s.dec)), maxY = Math.max(...points.map(s => s.dec));
  const coords = Object.fromEntries(unwrapped.map(s => [s.id, { x: 165 - ((s.ra - minX) / (maxX - minX || 1)) * 120, y: 22 + (1 - (s.dec - minY) / (maxY - minY || 1)) * 95 }]));
  return <svg className="constellation-art" viewBox="0 0 210 140" aria-hidden="true"><defs><radialGradient id={`glow-${constellation.id}`}><stop stopColor="#8677e0" stopOpacity=".16" /><stop offset="1" stopColor="#8677e0" stopOpacity="0" /></radialGradient></defs><ellipse cx="105" cy="70" rx="100" ry="70" fill={`url(#glow-${constellation.id})`} />{constellation.lines.map(([a,b],i) => coords[a] && coords[b] && <line key={i} x1={coords[a].x} y1={coords[a].y} x2={coords[b].x} y2={coords[b].y} stroke="#8f8bc0" strokeOpacity=".6" strokeWidth="1" />)}{unwrapped.map(s => <g key={s.id}><circle cx={coords[s.id].x} cy={coords[s.id].y} r="5" fill="#b9b0ff" opacity=".1" /><circle cx={coords[s.id].x} cy={coords[s.id].y} r={Math.max(1.5, 3.3 - s.magnitude * .3)} fill="#e8e5ff" /></g>)}</svg>;
}

export default function App() {
  const [date, setDate] = useState(initialDate);
  const sensor = useSkyOrientation();
  const [location, setLocation] = useState(cities[0]);
  const liveLocation=useLiveLocation(setLocation);
  const liveClock=sensor.enabled||liveLocation.active;
  const [tab, setTab] = useState('explore');
  const [skyLayout,setSkyLayout]=useState(()=>new URLSearchParams(window.location.search).get('view')==='map'?'map':'sky');
  const [homeControlsOpen,setHomeControlsOpen]=useState(()=>window.innerWidth>740&&window.innerHeight>540);
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [selectedStarId, setSelectedStarId] = useState(null);
  const [selectedPlanetId, setSelectedPlanetId] = useState(null);
  const [selectedConstellationId,setSelectedConstellationId]=useState(null);
  const [skyFocus,setSkyFocus]=useState(()=>new URLSearchParams(window.location.search).get('view')==='map'?null:{heading:135,altitude:32});
  const [modal, setModal] = useState(null);
  const [photoReturn, setPhotoReturn] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState('');
  const [geoError, setGeoError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [dateDraft, setDateDraft] = useState(toInputDate(date));
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [filter, setFilter] = useState('visible');
  const mapRef = useRef(null);
  const fullscreen = useMapFullscreen(mapRef);
  const home=tab==='explore'&&skyLayout==='sky'&&!fullscreen.active;
  const lastFullscreen=useRef(false);
  const fullscreenOwnsSensor=useRef(false);
  const searchRef = useRef(null);
  const starPositions = useMemo(() => stars.map(s => ({ ...s, ...equatorialToHorizontal(s.ra, s.dec, date, location.latitude, location.longitude) })), [date, location]);
  const planetLocations = useMemo(() => planetPositions(date, location.latitude, location.longitude), [date, location]);
  const selectedConstellation=constellations.find(c=>c.id===selectedConstellationId);
  const selectedPlanet = planetLocations.find(planet => planet.id === selectedPlanetId);
  const selectSkyObject = id => { setSelectedPlanetId(null); setSelectedStarId(id); };
  const visibleStars = useMemo(() => starPositions.filter(s => s.altitude > 0).sort((a,b) => a.magnitude - b.magnitude), [starPositions]);
  const selected = starPositions.find(s => s.id === selectedStarId) || visibleStars[0] || starPositions[0];
  const phase = useMemo(() => moonPhase(date), [date]);
  const sun = useMemo(() => sunPosition(date, location.latitude, location.longitude), [date, location]);
  const constellationData = useMemo(() => constellations.map(c => { const members = starPositions.filter(s => s.constellationId===c.id); return { ...c, visible: members.filter(s => s.altitude > 0).length, total: members.length, best: [...members].sort((a,b) => a.magnitude-b.magnitude)[0] }; }).sort((a,b) => b.visible / (b.total || 1) - a.visible / (a.total || 1) || b.visible - a.visible), [starPositions]);
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return [];
    return [...planetLocations.filter(p => `${p.name} ${p.nameEn}`.toLocaleLowerCase().includes(q)), ...starPositions.filter(s => `${s.name} ${s.nameEn}`.toLocaleLowerCase().includes(q)).map(s => ({ ...s, type: 'star' })), ...constellationData.filter(c => `${c.name} ${c.nameEn}`.toLocaleLowerCase().includes(q)).map(c => ({ ...c, type: 'constellation' }))].slice(0, 7);
  }, [query, starPositions, constellationData, planetLocations]);
  useEffect(()=>{
    if(!home)return;
    const header=document.querySelector('.site-header');
    const app=header.closest('.app');
    const observer=new ResizeObserver(()=>app.style.setProperty('--home-header-height',`${header.getBoundingClientRect().height}px`));
    observer.observe(header);
    return()=>observer.disconnect();
  },[home]);
  useEffect(() => { try { localStorage.setItem('sky-bookmarks', JSON.stringify(bookmarks)); } catch { setToast('เบราว์เซอร์ไม่อนุญาตให้บันทึก รายการนี้จะอยู่จนกว่าจะปิดหน้า'); } }, [bookmarks]);
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timeout); }, [toast]);
  useEffect(() => { const fn = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); } if (e.key === 'Escape') setSearchFocused(false); }; window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn); }, []);

  useEffect(() => {
    if (!liveClock) return;
    setDate(new Date());
    const timer = setInterval(() => setDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, [liveClock]);
  useEffect(() => { if (tab !== 'explore') { sensor.stop(); liveLocation.stop(); void fullscreen.exit(); } }, [tab, sensor.stop, liveLocation.stop, fullscreen.exit]);
  useEffect(()=>{
    if(lastFullscreen.current&&!fullscreen.active){
      liveLocation.stop();
      if(fullscreenOwnsSensor.current)sensor.stop();
      fullscreenOwnsSensor.current=false;
    }
    lastFullscreen.current=fullscreen.active;
  },[fullscreen.active,liveLocation.stop,sensor.stop]);
  const startFullSky=()=>{
    setDate(new Date());setZoom(1);
    if(!sensor.enabled){fullscreenOwnsSensor.current=true;void sensor.start();}
    liveLocation.start();
    void fullscreen.enter();
  };
  const toggleSensor=()=>{
    if(sensor.enabled){sensor.stop();fullscreenOwnsSensor.current=false;}
    else {fullscreenOwnsSensor.current=fullscreen.active;void sensor.start();}
  };
  const chooseLocation=next=>{liveLocation.stop();setLocation(next);setModal(null);};

  const openPhoto = (from = null) => { if (selectedPlanet) { setModal('planet'); return; } setPhotoReturn(from); setModal('photo'); };
  const toggleBookmark = id => { const exists = bookmarks.includes(id); setBookmarks(prev => exists ? prev.filter(x => x !== id) : [...prev, id]); setToast(exists ? 'นำดาวออกจากบันทึกแล้ว' : 'เพิ่มดาวในบันทึกของคุณแล้ว'); };
  const pickStar = id => { const target=starPositions.find(s=>s.id===id);if(target){setSkyFocus({heading:target.azimuth,altitude:Math.max(0,target.altitude)});if(target.altitude<0)setToast('ดาวดวงนี้อยู่ใต้ขอบฟ้าในเวลาที่เลือก');} setSelectedPlanetId(null); sensor.stop(); liveLocation.stop(); setZoom(1); setSelectedStarId(id); setTab('explore'); setSearchFocused(false); setQuery(''); };
  const pickPlanet = id => { const target=planetLocations.find(p=>p.id===id);if(target){setSkyFocus({heading:target.azimuth,altitude:Math.max(0,target.altitude)});if(target.altitude<0)setToast('ดาวเคราะห์ดวงนี้อยู่ใต้ขอบฟ้าในเวลาที่เลือก');} sensor.stop(); liveLocation.stop(); setZoom(1); setSelectedPlanetId(id); setTab('explore'); setSearchFocused(false); setQuery(''); };
  const openConstellation=c=>{setSelectedConstellationId(c.id);setSearchFocused(false);setQuery('');setModal('constellation');};
  const pickResult = result => result.type === 'planet' ? pickPlanet(result.id) : result.type === 'star' ? pickStar(result.id) : openConstellation(result);
  const pickConstellation = c => { const member = starPositions.filter(s => c.starIds.includes(s.id) && s.constellationId === c.id).sort((a,b) => (b.altitude > 0) - (a.altitude > 0) || a.magnitude - b.magnitude)[0]; if (member) {pickStar(member.id);setSkyFocus({heading:member.azimuth,altitude:Math.max(0,Math.min(89,member.altitude))});if(member.altitude<=0)setToast('ดาวเด่นของกลุ่มนี้อยู่ใต้ขอบฟ้าในเวลาที่เลือก');} setShowLines(true); mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const locate = () => {
    liveLocation.stop();
    if (!navigator.geolocation) { setGeoError('เบราว์เซอร์นี้ไม่รองรับตำแหน่งปัจจุบัน กรุณาเลือกเมืองหรือกรอกพิกัด'); return; }
    setGeoLoading(true); setGeoError('');
    navigator.geolocation.getCurrentPosition(p => { setLocation({ name: 'ตำแหน่งของคุณ', short: 'ตำแหน่งของคุณ', latitude: p.coords.latitude, longitude: p.coords.longitude }); setGeoLoading(false); setModal(null); }, error => { setGeoLoading(false); setGeoError(error.code === 1 ? 'ยังไม่ได้รับอนุญาตเข้าถึงตำแหน่ง เลือกเมืองหรือกรอกพิกัดด้านล่างได้' : 'ไม่พบตำแหน่งในขณะนี้ กรุณาเลือกเมืองหรือกรอกพิกัด'); }, { timeout: 10000 });
  };
  const minutes = Number(toInputDate(date).slice(11,13)) * 60 + Number(toInputDate(date).slice(14,16));
  const setMinutes = value => setDate(dateFromInput(`${toInputDate(date).slice(0,10)}T${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`));

  return <div className={`app ${home?'sky-home':''} ${homeControlsOpen?'home-controls-open':''} ${nightMode ? 'night-mode' : ''} ${fullscreen.active ? 'map-fullscreen' : ''}`}>
    <header className="site-header"><div className="header-inner"><a href="#" aria-label="Sky หน้าหลัก" onClick={e => { e.preventDefault(); setTab('explore'); }}><Brand /><span className="home-brand-caption">แผนที่ดาว 360° และเรื่องราวบนท้องฟ้า</span></a><nav aria-label="เมนูหลัก">{[['explore','สำรวจท้องฟ้า'],['constellations','กลุ่มดาว'],['saved','บันทึกของฉัน']].map(([key,label]) => <button key={key} className={tab===key?'nav-link active':'nav-link'} onClick={() => setTab(key)}>{label}{key==='saved' && bookmarks.length > 0 && <span className="nav-count">{bookmarks.length}</span>}</button>)}</nav><div className="header-actions"><div className="search-wrap" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSearchFocused(false); }}><Search size={16} /><input ref={searchRef} aria-label="ค้นหาดาวหรือกลุ่มดาว" placeholder="ค้นหาดาว ดาวเคราะห์ กลุ่มดาว…" value={query} onChange={e => { setQuery(e.target.value); setSearchFocused(true); }} onFocus={() => setSearchFocused(true)} onKeyDown={e => { if (e.key==='Enter' && results.length) { const r=results[0]; pickResult(r); } }} /><kbd>⌘ K</kbd>{searchFocused && query.trim() && <div className="search-results">{results.length ? results.map(r => <button key={`${r.type}-${r.id}`} onMouseDown={e=>e.preventDefault()} onClick={() => pickResult(r)}>{r.type==='planet'?<Compass size={17}/>:r.type==='star'?<Star size={17}/>:<Sparkles size={17}/>}<span>{r.name}<small>{r.nameEn}</small></span><span className="search-kind">{r.type==='planet'?'ดาวเคราะห์':r.type==='star'?'ดาวฤกษ์':'กลุ่มดาว'}</span></button>) : <p>ไม่พบ “{query}” ลองค้นหา Sirius หรือ Orion</p>}</div>}</div>{home&&<div className="home-top-actions"><button onClick={()=>{setGeoError('');setModal('location');}}><MapPin size={14}/>{location.short}</button><button className="home-date-control" onClick={()=>{sensor.stop();liveLocation.stop();setDateDraft(toInputDate(date));setModal('date');}}><CalendarDays size={14}/>วันและเวลา</button><button className="home-night-toggle" aria-label="โหมดถนอมสายตา" aria-pressed={nightMode} onClick={()=>setNightMode(v=>!v)}><Moon size={14}/>Night Vision</button></div>}<button className="icon-button help-button" aria-label="วิธีใช้แอพ" onClick={() => setModal('help')}><HelpCircle size={20}/></button></div></div></header>

    <main>
      <section className="page-intro"><div><div className="eyebrow"><span className="live-dot"/> A LITTLE CLOSER TO THE UNIVERSE</div><h1>{tab==='saved'?'จักรวาลส่วนตัวของคุณ':tab==='constellations'?'เรื่องราวที่เขียนไว้บนฟ้า':'คืนนี้มีอะไรให้ค้นพบ'}<span className="title-spark">✦</span></h1><p>{tab==='saved'?'เก็บดาวดวงโปรดไว้ แล้วกลับมาพบกันอีกในคืนถัดไป':tab==='constellations'?'เชื่อมต่อดวงดาว แล้วทำความรู้จักเรื่องราวเบื้องหลังกลุ่มดาว':'ปล่อยให้ความสงสัยพาคุณออกเดินทาง ท่ามกลางดวงดาวนับพัน'}</p></div><div className="context-controls"><button className="context-button" onClick={()=>{setGeoError('');setModal('location');}}><MapPin size={16}/><span>{location.short}</span><ChevronDown size={14}/></button><button className="context-button date-control" onClick={()=>{sensor.stop();liveLocation.stop();setDateDraft(toInputDate(date));setModal('date');}}><CalendarDays size={16}/><span>{displayDate(date)}<small>{displayTime(date)} น. · UTC+7</small></span><ChevronDown size={14}/></button></div></section>

      {tab==='explore' && <>
        <div className="observatory-layout"><section className={`map-panel ${home?'home-map':''} ${fullscreen.active?'is-fullscreen':''} ${fullscreen.fallback?'fullscreen-fallback':''}`} ref={mapRef}><div className="panel-heading"><div className="panel-title"><Crosshair size={17}/><h2>แผนที่ท้องฟ้า</h2><span className="subtle-badge">มุมมองจากโลก</span></div><div className="map-heading-actions"><button className="sky-layout-toggle" aria-pressed={skyLayout==='sky'} onClick={()=>{sensor.stop();setSkyLayout(v=>v==='sky'?'map':'sky');setZoom(1);}}>{skyLayout==='sky'?'แผนที่วงกลม':'ท้องฟ้า 360°'}</button><button className={`tracking-button ${sensor.enabled?'active':''}`} aria-pressed={sensor.enabled} onClick={toggleSensor}><Compass size={15}/>{sensor.enabled?'หยุดส่องฟ้า':'ส่องฟ้าตามมือถือ'}</button><button className="icon-button fullscreen-toggle" data-fullscreen-toggle aria-label={fullscreen.active?'ออกจากโหมดเต็มจอ':'แสดงแผนที่เต็มหน้าจอ'} aria-pressed={fullscreen.active} title={fullscreen.active?'ออกจากโหมดเต็มจอ':'เต็มจอ'} onClick={fullscreen.toggle}>{fullscreen.active?<><Minimize2 size={17}/><span className="fullscreen-exit-label">ออกเต็มจอ</span></>:<Maximize2 size={17}/>}</button></div></div>{sensor.message&&<div className="sensor-alert" role="alert"><span>{sensor.message}</span><button aria-label="ปิดข้อความเซ็นเซอร์" onClick={sensor.stop}>×</button></div>}
          <div className="sky-location-bar">
            {!fullscreen.active?<button className="immersive-launch" onClick={startFullSky}><Maximize2 size={15}/><span>เต็มจอและติดตามตำแหน่ง</span><LocateFixed size={15}/></button>:<><button className={`gps-toggle ${liveLocation.active?'active':''}`} aria-pressed={liveLocation.active} onClick={()=>liveLocation.active?liveLocation.stop():liveLocation.start()}><LocateFixed size={14}/>{liveLocation.active?'หยุดติดตาม GPS':'ติดตาม GPS'}</button><button className="sky-location-choice" aria-label="เปลี่ยนตำแหน่งบนแผนที่เต็มจอ" onClick={()=>{setGeoError('');setModal('location');}}><MapPin size={13}/>{location.short}<ChevronDown size={12}/></button><span className="gps-status" role="status">{liveLocation.status==='active'?(liveLocation.accuracy===null?'GPS เชื่อมต่อแล้ว':`GPS ±${Math.round(liveLocation.accuracy)} ม.`):liveLocation.status==='requesting'?'กำลังรับพิกัด…':'ตำแหน่งที่เลือก'}</span></>}
          </div>
          {liveLocation.message&&<div className="location-tracking-message" role="status" data-location-status={liveLocation.status}>{liveLocation.message}<button aria-label="หยุดและปิดข้อความตำแหน่ง" onClick={liveLocation.stop}>×</button></div>}
          <div className="sky-viewport">{home&&<><SkyHud date={date} location={location} sun={sun} phase={phase} liveClock={liveClock}/><button className="sky-selection" onClick={()=>setModal(selectedPlanet?'planet':'star')}><Star size={18}/><span><small>ดาวที่เลือก · แตะเพื่อดูข้อมูล</small><strong>{selectedPlanet?.name||selected.name}</strong><em>{selectedPlanet?.nameEn||selected.nameEn}</em></span><ArrowUpRight size={16}/></button></>}<div className="map-caption"><span className="live-dot"/><span>ท้องฟ้าเหนือ{location.short}<small>{Math.abs(location.latitude).toFixed(2)}° {location.latitude>=0?'N':'S'} &nbsp; {Math.abs(location.longitude).toFixed(2)}° {location.longitude>=0?'E':'W'}</small></span></div><div className="map-top-right"><span className="map-live-label">{displayTime(date)} <span>UTC+7</span></span></div>{sun.altitude > -18 && <div className="daylight-notice" role="status"><Sun size={13}/>{sun.altitude > 0 ? 'เวลากลางวัน · แสดงตำแหน่งดาวเพื่อวางแผน' : 'ช่วงสนธยา · ท้องฟ้ายังไม่มืดสนิท'}</div>}{(skyLayout==='sky'||sensor.enabled||fullscreen.active)?<SkyPointer homeView={home} wideView={skyLayout==='sky'&&!sensor.enabled} sensor={sensor} focusTarget={skyFocus} manual={!sensor.enabled||(!sensor.view&&(skyLayout==='sky'||fullscreen.active))} zoom={zoom} onZoomChange={setZoom} date={date} location={location} showLines={showLines} showLabels={showLabels} selectedStarId={selectedPlanet?null:selected?.id} onSelectStar={selectSkyObject} planets={planetLocations} selectedPlanetId={selectedPlanetId} onSelectPlanet={setSelectedPlanetId} nightMode={nightMode}/>:<SkyMap date={date} location={location} showLines={showLines} showLabels={showLabels} selectedStarId={selectedPlanet?null:selected?.id} onSelectStar={selectSkyObject} planets={planetLocations} selectedPlanetId={selectedPlanetId} onSelectPlanet={setSelectedPlanetId} zoom={zoom} onZoomChange={setZoom} nightMode={nightMode} expanded={fullscreen.active}/>}<div className="map-bottom"><span><Compass size={14}/>{sensor.view?'ส่องตามทิศมือถือ':sensor.enabled?'รอทิศมือถือ':fullscreen.active?'ท้องฟ้ารอบตัว · ลากเพื่อเปลี่ยนทิศ':'มองขึ้นฟ้า · ทิศตะวันออกอยู่ซ้าย'}</span><button aria-pressed={nightMode} onClick={()=>setNightMode(v=>!v)}><Moon size={14}/><span>โหมดถนอมสายตา</span><i className={nightMode?'switch on':'switch'}/></button></div></div>
          <div className="map-control-deck" data-expanded={homeControlsOpen}>{home&&<button className="home-deck-toggle" aria-expanded={homeControlsOpen} onClick={()=>setHomeControlsOpen(v=>!v)}><Layers3 size={16}/><span>เครื่องมือและเวลา</span><small>{zoom.toFixed(1)}×</small><ChevronDown size={16}/></button>}<div className="map-gesture-hint"><span/>{sensor.enabled?'กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม · หมุนมือถือเพื่อเปลี่ยนทิศ':zoom>1?'กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม · ลากเพื่อเลื่อนดูดาว':'กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม · ลากเพื่อหมุนแผนที่'}</div>
          <div className="map-tools" role="group" aria-label="เครื่องมือสำรวจท้องฟ้า">
            <div className="map-object-tools">
              <button aria-label="รายละเอียดกลุ่มดาวที่เลือก" title="รายละเอียดกลุ่มดาว" disabled={!!selectedPlanet} onClick={()=>{const group=constellations.find(c=>c.id===selected?.constellationId);if(group)openConstellation(group);}}><Sparkles size={18}/><span>กลุ่มดาว</span></button>
              <button aria-label="ดูแบบจำลอง 3 มิติของดาวที่เลือก" title="สำรวจดาวแบบ 3 มิติ" onClick={()=>setModal(selectedPlanet?'planet':'star')}><Box size={18}/><span>3 มิติ</span></button>
              <button aria-label="ดูภาพดาวที่เลือก" title={selectedPlanet?'ข้อมูลดาวเคราะห์ที่เลือก':'ภาพถ่ายดาวที่เลือก'} onClick={()=>openPhoto()}><Camera size={18}/><span>{selectedPlanet?'ข้อมูล':'ภาพจริง'}</span></button>
              <button aria-label="อ่านนิทานดาวที่เลือก" title={selectedPlanet?'นิทานมีสำหรับดาวฤกษ์':'นิทานดาวที่เลือก'} disabled={!!selectedPlanet} onClick={()=>setModal('story')}><BookOpen size={18}/><span>เรื่องเล่า</span></button>
            </div>
            <div className="map-view-tools">
              <div className="map-layer-tools"><button className={showLines?'active':''} aria-label="แสดงเส้นกลุ่มดาว" aria-pressed={showLines} title="เส้นกลุ่มดาว" onClick={()=>setShowLines(v=>!v)}><Layers3 size={19}/></button><button className={showLabels?'active':''} aria-label="แสดงชื่อดาว" aria-pressed={showLabels} title="ชื่อดาว" onClick={()=>setShowLabels(v=>!v)}><Eye size={19}/></button></div>
              <div className="map-zoom-tools"><button aria-label="ซูมออก" title="ซูมออก" disabled={zoom<=MIN_MAP_ZOOM} onClick={()=>setZoom(v=>clampMapZoom(v-.25))}><Minus size={19}/></button><output className="map-zoom-value" aria-label="ระดับการซูม" aria-live="off">{zoom.toFixed(1)}<small>×</small></output><button aria-label="ซูมเข้า" title="ซูมเข้า" disabled={zoom>=MAX_MAP_ZOOM} onClick={()=>setZoom(v=>clampMapZoom(v+.25))}><Plus size={19}/></button><button aria-label="รีเซ็ตการซูม" title="รีเซ็ตการซูม" onClick={()=>setZoom(MIN_MAP_ZOOM)}><RotateCcw size={17}/></button></div>
            </div>
          </div>
          <div className={`timeline ${liveClock?'timeline-tracking':''}`}><div className="timeline-heading"><span><Clock3 size={15}/>{liveClock?'ติดตาม · เวลาปัจจุบัน':'เดินทางผ่านเวลา'}</span><button onClick={()=>{setDate(new Date());setToast('แสดงท้องฟ้าตามเวลาปัจจุบันแล้ว');}}><RotateCcw size={12}/> เวลาปัจจุบัน</button><strong>{displayTime(date)} <small>น.</small></strong></div><input aria-label="เวลาที่ต้องการดูท้องฟ้า" type="range" disabled={liveClock} min="0" max="1439" step="1" value={minutes} onChange={e=>setMinutes(Number(e.target.value))} style={{'--range-progress':`${minutes/1439*100}%`}}/><div className="timeline-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div></div>
          </div>{sensor.enabled&&<p className="pointer-calibration-note">เลือกตำแหน่งให้ตรงกับที่อยู่จริง แล้วชี้กล้องหลังไปบนฟ้า · หากทิศคลาดเคลื่อน ลองหมุนมือถือเป็นเลข 8 และหลีกเลี่ยงแม่เหล็กหรือโลหะใกล้เครื่อง</p>}
        </section>

        <aside className="sidebar"><section className="moon-card"><div className="card-eyebrow"><Moon size={14}/><span>ดวงจันทร์คืนนี้</span><span className="tiny-star">✧</span></div><div className="moon-content"><MoonArt phase={phase}/><div><h3>{phase.name}</h3><p>ส่องสว่าง <strong>{Math.round(phase.illumination*100)}%</strong></p><span className="phase-badge">{phase.illumination>.65?'คืนแห่งแสงจันทร์':'คืนที่เหมาะกับการมองดาว'}</span></div></div><p className="moon-note">{phase.illumination>.65?'แสงจันทร์อาจทำให้เห็นดาวจาง ๆ ได้ยากขึ้น':'หลีกเลี่ยงแสงไฟเมือง เพื่อมองเห็นดาวได้มากขึ้น'}<span>เฟสจันทร์โดยประมาณ · ไม่ใช่ข้อมูลสภาพอากาศ</span></p></section>
          {selectedPlanet?<PlanetCard planet={selectedPlanet} onDetails={()=>setModal('planet')}/>:selected && <section className="star-card"><div className="card-eyebrow"><Sparkles size={14}/><span>ทำความรู้จักดาวดวงนี้</span><button className={`icon-button bookmark-button ${bookmarks.includes(selected.id)?'is-saved':''}`} aria-label={bookmarks.includes(selected.id)?'นำดาวนี้ออกจากบันทึก':'บันทึกดาวนี้'} aria-pressed={bookmarks.includes(selected.id)} onClick={()=>toggleBookmark(selected.id)}><Bookmark size={18} fill={bookmarks.includes(selected.id)?'currentColor':'none'}/></button></div><div className="star-identity"><StarPhotoButton key={selected.id} star={selected} onOpen={()=>openPhoto()}/><div><span className="object-type">ดาวฤกษ์ · STAR</span><h2>{selected.name}</h2><p>{selected.nameEn}</p></div></div><button className="model-view-entry" onClick={()=>setModal('star')}><Box size={15}/> ดูแบบจำลอง 3 มิติ <ArrowRight size={13}/></button><button className="photo-view-entry" onClick={()=>openPhoto()}><Camera size={13}/> ดูภาพถ่ายจริงบริเวณดาวนี้ <ArrowRight size={12}/></button><div className={`visibility ${selected.altitude>0?'above':'below'}`}><span/>{selected.altitude>0?'อยู่เหนือขอบฟ้า':'อยู่ใต้ขอบฟ้าในเวลานี้'}<span className="visibility-direction">{direction(selected.azimuth)}</span></div><p className="star-description">{selected.description || 'หนึ่งในดวงดาวบนท้องฟ้า ลองสังเกตสีและความสว่างที่แตกต่างกันในคืนที่ฟ้าใส'}</p><button className="story-entry" onClick={()=>setModal('story')}><BookOpen size={16}/><span>อ่านนิทานของดาวดวงนี้</span><ArrowRight size={14}/></button><div className="star-stats"><div><span>ความสูงจากขอบฟ้า</span><strong>{selected.altitude.toFixed(1)}<small>°</small></strong></div><div><span>มุมทิศ</span><strong>{selected.azimuth.toFixed(1)}<small>°</small></strong></div><div><span>ระยะห่าง</span><strong>{selected.distance?Number(selected.distance).toLocaleString('th-TH'):'—'}<small> ปีแสง</small></strong></div><div><span>อันดับความสว่าง</span><strong>{selected.magnitude.toFixed(2)}<small> mag</small></strong></div></div><button className="text-button star-more" onClick={()=>setModal('star')}>รู้จักดาวดวงนี้ให้มากขึ้น <ArrowRight size={15}/></button></section>}
        </aside></div>
        <PlanetList positions={planetLocations} selectedId={selectedPlanetId} onSelect={pickPlanet}/><section className="discover-section"><div className="section-heading"><div><div className="section-eyebrow">YOUR NEXT DISCOVERY</div><h2>น่ามองในคืนนี้ <Sparkles size={18}/></h2></div><button className="text-button" onClick={()=>setTab('constellations')}>สำรวจทุกกลุ่มดาว <ArrowRight size={16}/></button></div><div className="constellation-grid">{constellationData.filter(c=>c.visible>=2).slice(0,3).map(c=><ConstellationCard key={c.id} constellation={c} onClick={()=>openConstellation(c)}/>)}</div></section>
      </>}

      {tab==='constellations' && <section className="library"><div className="library-toolbar"><span>{constellations.length} เรื่องราวบนท้องฟ้า</span><div className="segmented"><button className={filter==='visible'?'active':''} onClick={()=>setFilter('visible')}>เหนือขอบฟ้า</button><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>ทั้งหมด</button></div></div><div className="constellation-grid library-grid">{constellationData.filter(c=>filter==='all'||c.visible>0).map(c=><ConstellationCard key={c.id} constellation={c} onClick={()=>openConstellation(c)}/>)}</div></section>}
      {tab==='saved' && <section className="saved-section">{bookmarks.length ? <div className="saved-grid">{bookmarks.map(id=>{const s=starPositions.find(x=>x.id===id); return s && <article key={id} className="saved-card"><div className="saved-card-top"><Star size={25} style={{color:s.color}}/><button aria-label={`ลบ ${s.name} จากบันทึก`} className="icon-button is-saved" onClick={()=>toggleBookmark(id)}><Bookmark size={18} fill="currentColor"/></button></div><h2>{s.name}</h2><p>{s.nameEn}</p><span className={`visibility ${s.altitude>0?'above':'below'}`}><span/>{s.altitude>0?'อยู่เหนือขอบฟ้า':'อยู่ใต้ขอบฟ้า'}</span><button className="text-button" onClick={()=>pickStar(id)}>ดูบนแผนที่ <ArrowRight size={15}/></button></article>;})}</div>:<div className="empty-state"><span className="empty-orbit"><Bookmark size={30}/></span><h2>ดาวดวงโปรดกำลังรอคุณอยู่</h2><p>กดสัญลักษณ์บันทึกบนการ์ดดาว<br/>เพื่อเก็บดาวที่อยากกลับมามองอีกครั้ง</p><button className="primary-button" onClick={()=>setTab('explore')}>ออกไปสำรวจ <ArrowRight size={16}/></button></div>}</section>}

      <div className="observing-tip"><span className="tip-icon"><Telescope size={21}/></span><p><strong>ให้ดวงตาได้คุ้นกับความมืด</strong><span>พักสายตาจากหน้าจอประมาณ 20 นาที แล้วคุณจะเห็นดาวมากกว่าที่เคย</span></p><span className="tip-tag">A MOMENT UNDER THE STARS</span><Sparkles size={22}/></div>
    </main>
    <footer><Brand small/><p>ท้องฟ้าเดียวกัน ความมหัศจรรย์ไม่สิ้นสุด</p><button onClick={()=>setModal('about')}>ข้อมูลและแหล่งอ้างอิง <ArrowDownLeft size={13}/></button></footer>
    {toast && createPortal(<div className="toast" role="status"><Check size={17}/>{toast}</div>, document.body)}

    {modal==='location' && <Modal title="คุณกำลังมองฟ้าจากที่ไหน" onClose={()=>setModal(null)}><p className="modal-copy">ตำแหน่งของคุณใช้คำนวณดาวที่อยู่เหนือขอบฟ้า</p><button className="primary-button full-width" onClick={locate} disabled={geoLoading}><LocateFixed size={17}/>{geoLoading?'กำลังค้นหาตำแหน่ง…':'ใช้ตำแหน่งปัจจุบัน'}</button>{geoError&&<p className="form-error" role="alert">{geoError}</p>}<div className="city-list">{cities.map(city=><button key={city.name} onClick={()=>chooseLocation(city)}><MapPin size={16}/><span>{city.name}<small>{city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°</small></span>{location.name===city.name?<Check size={17}/>:<ChevronRight size={16}/>}</button>)}</div><form className="coordinate-form" onSubmit={e=>{e.preventDefault();chooseLocation({name:'พิกัดที่กำหนด',short:'พิกัดที่กำหนด',latitude:Number(customLat),longitude:Number(customLon)});}}><label>ละติจูด<input type="number" min="-90" max="90" step="any" required value={customLat} placeholder="13.7563" onChange={e=>setCustomLat(e.target.value)}/></label><label>ลองจิจูด<input type="number" min="-180" max="180" step="any" required value={customLon} placeholder="100.5018" onChange={e=>setCustomLon(e.target.value)}/></label><button className="secondary-button" type="submit">ใช้พิกัดนี้</button></form></Modal>}
    {modal==='date' && <Modal title="ท้องฟ้าในเวลาของคุณ" onClose={()=>setModal(null)}><p className="modal-copy">ย้อนดูคืนที่ผ่านมา หรือวางแผนคืนถัดไป<br/>เวลาทั้งหมดในแอพใช้เขตเวลาประเทศไทย (UTC+7)</p><form onSubmit={e=>{e.preventDefault();const next=dateFromInput(dateDraft);if(!Number.isNaN(next.getTime())){setDate(next);setModal(null);}}}><label className="form-label">วันและเวลา<input aria-label="วันและเวลา" type="datetime-local" min="1900-01-01T00:00" max="2100-12-31T23:59" value={dateDraft} required onChange={e=>setDateDraft(e.target.value)}/></label><div className="date-shortcuts"><button type="button" className="secondary-button" onClick={()=>setDateDraft(toInputDate(new Date()))}>ตอนนี้</button><button type="button" className="secondary-button" onClick={()=>setDateDraft(`${toInputDate(new Date()).slice(0,10)}T21:00`)}>คืนนี้ 21:00</button></div><button type="submit" className="primary-button full-width">แสดงท้องฟ้า <ArrowRight size={16}/></button></form></Modal>}
    {modal==='constellation' && selectedConstellation && <Modal title={`กลุ่มดาว${selectedConstellation.name}`} onClose={()=>setModal(null)}><ConstellationDetails onSelectConstellation={openConstellation} constellation={selectedConstellation} positions={starPositions} date={date} location={location} onSelectStar={id=>{selectSkyObject(id);setModal('star');}} onShowOnMap={()=>{pickConstellation(selectedConstellation);setModal(null);}}/></Modal>}
    {modal==='planet' && selectedPlanet && <Modal title={`รู้จัก${selectedPlanet.name}`} onClose={()=>setModal(null)}><PlanetDetails planet={selectedPlanet}/></Modal>}
    {modal==='photo' && selected && <Modal title={`ภาพดาว${selected.name}`} onClose={()=>setModal(photoReturn)}><StarPhoto key={selected.id} star={selected} onOpenModel={()=>setModal('star')}/></Modal>}
    {modal==='story' && selected && <Modal title="นิทานดวงดาว" onClose={()=>setModal(null)}><StarStory star={selected} onChangeStar={setSelectedStarId} onOpenPhoto={()=>openPhoto('story')}/></Modal>}
    {modal==='star' && selected && <Modal title={`${selected.name} · ${selected.nameEn}`} onClose={()=>setModal(null)}><CelestialModel key={selected.id} object={selected}/><p className="modal-copy">{selected.description}</p><button className="secondary-button full-width" onClick={()=>openPhoto()}><Camera size={16}/> ดูภาพถ่ายจริงบริเวณดาว{selected.name}</button><dl className="detail-list"><div><dt>กลุ่มดาว</dt><dd><button className="constellation-group-link" onClick={()=>openConstellation(constellations.find(c=>c.id===selected.constellationId))}>{constellations.find(c=>c.id===selected.constellationId)?.name||'—'}</button></dd></div><div><dt>ไรต์แอสเซนชัน (J2000)</dt><dd>{selected.ra.toFixed(4)} ชั่วโมง</dd></div><div><dt>เดคลิเนชัน (J2000)</dt><dd>{selected.dec.toFixed(4)}°</dd></div><div><dt>ทิศที่มอง</dt><dd>{direction(selected.azimuth)} · {selected.azimuth.toFixed(1)}°</dd></div><div><dt>ความสูงจากขอบฟ้า</dt><dd>{selected.altitude.toFixed(1)}°</dd></div></dl><button className="primary-button full-width" onClick={()=>toggleBookmark(selected.id)}><Bookmark size={16}/>{bookmarks.includes(selected.id)?'นำออกจากบันทึก':'บันทึกดาวดวงนี้'}</button><p className="fine-print">อันดับความสว่างยิ่งน้อย ดาวยิ่งสว่าง · การมองเห็นจริงขึ้นกับเมฆ แสงรบกวน และสิ่งบดบัง</p></Modal>}
    {modal==='help' && <Modal title="เริ่มสำรวจท้องฟ้า" onClose={()=>setModal(null)}><div className="help-steps"><div><MapPin/><span><strong>เลือกจุดที่คุณอยู่</strong>กำหนดเมือง ใช้ตำแหน่งปัจจุบัน หรือกรอกพิกัด</span></div><div><Clock3/><span><strong>เลือกเวลาที่อยากมอง</strong>เลื่อนแถบเวลา หรือเลือกวันและเวลาจากด้านบน</span></div><div><Compass/><span><strong>ลากสำรวจท้องฟ้ารอบตัว</strong>ลากเพื่อเปลี่ยนทิศ กางสองนิ้วหรือเลื่อนล้อเมาส์เพื่อซูม หากเลือกแผนที่วงกลม ให้ถือเหนือศีรษะและหันทิศเหนือให้ตรงกับทิศจริง</span></div><div><Compass/><span><strong>ส่องฟ้าตามมือถือ</strong>กดปุ่มส่องฟ้า อนุญาตเซ็นเซอร์ แล้วชี้กล้องหลังไปบนฟ้า ใช้เวลาปัจจุบันและตำแหน่งที่เลือก</span></div><div><Star/><span><strong>รู้จักดาวให้มากขึ้น</strong>แตะดาวบนแผนที่ ค้นหาชื่อ และบันทึกดวงที่ชอบ</span></div></div><p className="fine-print">แผนที่ปกติแสดงดาวเหนือขอบฟ้า โหมดส่องฟ้าใช้เซ็นเซอร์ทิศทางหลังจากกดอนุญาต ไม่ใช้ภาพจากกล้อง ความแม่นยำขึ้นกับเข็มทิศของเครื่อง</p></Modal>}
    {modal==='about' && <Modal title="แผนที่เล็ก ๆ ของจักรวาล" onClose={()=>setModal(null)}><p className="modal-copy">Sky ใช้ข้อมูลดาวฤกษ์จริง 5,044 ดวง และคำนวณมุมทิศกับความสูงจากพิกัดผู้สังเกตและเวลาที่เลือก</p><div className="about-block"><h3>แหล่งข้อมูล</h3><p>แค็ตตาล็อกดาวจาก d3-celestial โดย Olaf Frohn (BSD-3-Clause) และข้อมูลดาวสว่างยุคอ้างอิง J2000</p><a href="https://github.com/ofrohn/d3-celestial" target="_blank" rel="noreferrer">d3-celestial ↗</a><a href={`${import.meta.env.BASE_URL}data/LICENSE-d3-celestial.txt`} target="_blank" rel="noreferrer">สัญญาอนุญาตข้อมูล ↗</a></div><div className="about-block"><h3>ดาวเคราะห์</h3><p>Astronomy Engine โดย Don Cross (MIT) · ภาพดาวเคราะห์ในแอพเป็นภาพประกอบ มีลิงก์ภาพถ่ายและข้อมูล NASA ในรายละเอียด</p><a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noreferrer">Astronomy Engine ↗</a></div><div className="about-block"><h3>ความแม่นยำและขอบเขต</h3><p>เหมาะกับการเรียนรู้และวางแผนดูดาวทั่วไป ไม่รวมการหักเหของบรรยากาศ การส่ายของแกนโลก และการเคลื่อนที่เฉพาะของดาว เฟสจันทร์เป็นค่าประมาณจากคาบเฉลี่ย ไม่แสดงตำแหน่งดวงจันทร์บนแผนที่ ดาวเคราะห์ 7 ดวงคำนวณด้วย Astronomy Engine ตามเวลาและตำแหน่งผู้สังเกต โดยไม่รวมการหักเหของบรรยากาศ</p><p>ความสว่างของท้องฟ้า เมฆ และแสงไฟเมืองอาจทำให้มองไม่เห็นดาวที่แสดง</p></div><p className="fine-print">บันทึกดาวเก็บไว้ในเบราว์เซอร์ของคุณ ตำแหน่งใช้คำนวณภายในอุปกรณ์และไม่ถูกส่งไปยังเซิร์ฟเวอร์</p></Modal>}
  </div>;
}

function ConstellationCard({ constellation: c, onClick }) {
  return <button className="constellation-card" onClick={onClick}><div className="constellation-card-copy"><span className={`constellation-status ${c.visible>0?'visible':''}`}><span/>{c.visible===c.total?'ดาวเด่นอยู่เหนือขอบฟ้า':c.visible>0?'ดาวเด่นอยู่เหนือฟ้าบางส่วน':'ดาวเด่นอยู่ใต้ขอบฟ้า'}</span><h3>{c.name}</h3><p>{c.nameEn}</p><span className="card-link">{c.id==='crux'?'รายละเอียดและประวัติ':'รายละเอียดและตำนาน'} <ArrowRight size={14}/></span></div><ConstellationArt constellation={c}/><span className="card-corner"><ArrowUpRight size={15}/></span></button>;
}
