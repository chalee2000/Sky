import { useEffect, useState } from 'react';
import { ArrowRight, Camera, ExternalLink, ImageOff, LoaderCircle, Orbit, RotateCcw, Search, Telescope } from 'lucide-react';
import { deepSkyImage } from '../lib/deepSkyImages.js';
import './DeepSky.css';

const categories = { galaxy: 'กาแล็กซี', cluster: 'กระจุกดาว', nebula: 'เนบิวลา' };
const number = value => Number.isFinite(value) ? value.toFixed(1) : '—';
const magnitudeText = object => Number.isFinite(object.magnitude)
  ? `${object.magnitude.toFixed(1)} mag${object.magnitudeBand ? ` (${object.magnitudeBand})` : ''}` : 'ไม่มีค่าระบุ';
const aboveHorizon = object => Number.isFinite(object.altitude) && object.altitude >= 0;

export function DeepSkyMarker({ object, x, y, selected, onSelect, showLabels, nightMode }) {
  const color = nightMode ? '#e4a091' : object.type === 'galaxy' ? '#b99af1' : object.type === 'cluster' ? '#82d7df' : '#f0adcf';
  return <g className="deep-sky-marker" data-deep-sky={object.id} role="button" tabIndex={0}
    aria-label={`${object.name} (${object.catalogId}) · ${categories[object.type]}`} aria-pressed={selected}
    onClick={() => onSelect?.(object.id)} onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(object.id); }
    }}>
    <title>{object.name} · {object.catalogId} · สัญลักษณ์ตำแหน่ง</title>
    {selected && <circle cx={x} cy={y} r="17" fill="none" stroke={color} strokeWidth="1" />}
    <g stroke={color} strokeWidth="1.2" fill="none" pointerEvents="none">
      {object.type === 'galaxy' ? <><ellipse cx={x} cy={y} rx="7" ry="3.5" transform={`rotate(-30 ${x} ${y})`} /><circle cx={x} cy={y} r="1.5" fill={color} stroke="none" /></>
        : object.type === 'cluster' ? <><circle cx={x} cy={y} r="6" strokeDasharray="2 2" />{[[0,0],[-2.5,-2],[2,2],[-2,2.5],[2.5,-2]].map(([dx,dy],i) => <circle key={i} cx={x+dx} cy={y+dy} r=".8" fill={color} stroke="none" />)}</>
          : <path d={`M${x} ${y-6}l6 6-6 6-6-6z`} />}
    </g>
    {(showLabels || selected) && <text x={x+12} y={y-8} fill={color} className="deep-sky-marker-label">{selected ? object.name : object.catalogId}</text>}
    <circle cx={x} cy={y} r="13" fill="transparent" className="deep-sky-hit" />
  </g>;
}

export function DeepSkyBrowser({ objects, onSelect }) {
  const [category, setCategory] = useState('all');
  const [visibleOnly, setVisibleOnly] = useState(false);
  const [query, setQuery] = useState('');
  const search = query.trim().toLocaleLowerCase().replaceAll(' ', '');
  const filtered = objects.filter(object => (category === 'all' || object.type === category)
    && (!visibleOnly || aboveHorizon(object))
    && (!search || `${object.name} ${object.nameEn} ${object.catalogId} ${(object.aliases || []).join(' ')}`.toLocaleLowerCase().replaceAll(' ', '').includes(search)))
    .sort((a,b) => Number(aboveHorizon(b)) - Number(aboveHorizon(a)) || (a.magnitude ?? 99) - (b.magnitude ?? 99));
  return <section className="deep-sky-browser" aria-label="คลังกาแล็กซีและกระจุกดาว">
    <p className="deep-sky-intro">มองออกไปไกลกว่าดาวแต่ละดวง สำรวจกาแล็กซี กระจุกดาว และเนบิวลาจากตำแหน่งจริงในแค็ตตาล็อก</p>
    <label className="deep-sky-search"><Search size={17}/><input aria-label="ค้นหาในคลังกาแล็กซี" placeholder="ค้นหา Andromeda, M31, กระจุกดาว…" value={query} onChange={event => setQuery(event.target.value)}/></label>
    <div className="deep-sky-categories" aria-label="ประเภทวัตถุท้องฟ้า">{[['all','ทั้งหมด'], ...Object.entries(categories)].map(([key,label]) => <button key={key} aria-pressed={category === key} className={category === key ? 'active' : ''} onClick={() => setCategory(key)}>{label}</button>)}</div>
    <div className="deep-sky-filter"><span>{filtered.length} วัตถุ</span><label><input type="checkbox" checked={visibleOnly} onChange={event => setVisibleOnly(event.target.checked)}/> เฉพาะเหนือขอบฟ้า</label></div>
    <div className="deep-sky-list">{filtered.map(object => <button className="deep-sky-tile" data-deep-sky-choice={object.id} key={object.id} onClick={() => onSelect(object.id)}>
      <span className={`deep-sky-symbol deep-sky-symbol-${object.type}`}><Orbit size={23}/></span>
      <span className="deep-sky-tile-copy"><small>{object.catalogId} · {categories[object.type]}</small><strong>{object.name}</strong><span>{object.nameEn}</span><em className={aboveHorizon(object) ? 'above' : ''}>{aboveHorizon(object) ? 'เหนือขอบฟ้า' : 'ใต้ขอบฟ้า'} · {number(object.altitude)}°</em></span>
      <ArrowRight size={16}/>
    </button>)}</div>
    {!filtered.length && <p className="deep-sky-empty" role="status">ไม่พบวัตถุในเงื่อนไขนี้ ลองเปลี่ยนประเภทหรือแสดงทั้งหมด</p>}
    <p className="deep-sky-note">เหนือขอบฟ้าไม่ได้หมายความว่าจะมองเห็นด้วยตาเปล่า หลายวัตถุต้องใช้กล้องและท้องฟ้ามืด สัญลักษณ์บนแผนที่ขยายเพื่อให้เลือกได้ ไม่ใช่ขนาดหรือสีจริง</p>
  </section>;
}

function DeepSkyPhoto({ object }) {
  const photo = deepSkyImage(object);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setStatus(previous => previous === 'loading' ? 'error' : previous), 20000);
    return () => clearTimeout(timer);
  }, [attempt]);
  return <figure className="deep-sky-photo" data-deep-sky-photo={object.id}>
    <div className={`deep-sky-photo-frame ${status}`}>
      <img key={attempt} src={photo.url} alt={`ภาพสำรวจ DSS2 ของ${object.name} (${object.catalogId}) และบริเวณโดยรอบ`} referrerPolicy="no-referrer" decoding="async"
        onLoad={() => setStatus('ready')} onError={() => setStatus('error')}/>
      {status !== 'ready' && <div className="deep-sky-photo-state" role="status">{status === 'loading' ? <><LoaderCircle className="deep-sky-spinner" size={28}/><strong>กำลังโหลดภาพสำรวจจริง…</strong></> : <><ImageOff size={28}/><strong>ยังโหลดภาพสำรวจไม่ได้</strong><span>ลองใหม่เมื่อเชื่อมต่อบริการภาพได้</span><button onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}><RotateCcw size={14}/> ลองโหลดอีกครั้ง</button></>}</div>}
    </div>
    <figcaption><span><Camera size={13}/> DSS2 color · ขอบเขตภาพ {number(photo.fieldOfView)}°</span><a href={photo.url} target="_blank" rel="noreferrer">เปิดภาพเต็ม <ExternalLink size={12}/></a></figcaption>
    <p className="deep-sky-note">ภาพถ่ายสำรวจผสมสีที่พิกัดของวัตถุ ไม่ใช่ภาพสดหรือสีที่ตาเปล่าเห็นโดยตรง</p>
    <p className="deep-sky-credit">{photo.credit}</p>
  </figure>;
}

export function DeepSkyDetails({ object, onShowOnMap }) {
  return <section className="deep-sky-details" data-deep-sky-details={object.id}>
    <div className="deep-sky-detail-heading"><span>{object.catalogId} · {object.kind || categories[object.type]}</span><h3>{object.name}</h3><p>{object.nameEn}</p></div>
    <DeepSkyPhoto key={object.id} object={object}/>
    <p className="deep-sky-description">{object.description}</p>
    <div className="deep-sky-observing"><Telescope size={20}/><p>{object.observingTip}</p></div>
    <dl className="deep-sky-facts">
      <div><dt>ประเภท</dt><dd>{object.kind || categories[object.type]}</dd></div>
      <div><dt>กลุ่มดาวที่อยู่ในแนวสายตา</dt><dd>{object.constellationName || '—'}</dd></div>
      <div><dt>ความสว่างรวมตามแค็ตตาล็อก</dt><dd>{magnitudeText(object)}</dd></div>
      {Number.isFinite(object.angularSizeArcmin) && <div><dt>ขนาดเชิงมุมตามแค็ตตาล็อก (แกนยาว)</dt><dd>{number(object.angularSizeArcmin)} ลิปดา</dd></div>}
      <div><dt>ไรต์แอสเซนชัน J2000</dt><dd>{object.ra.toFixed(4)} ชั่วโมง</dd></div>
      <div><dt>เดคลิเนชัน J2000</dt><dd>{object.dec.toFixed(4)}°</dd></div>
      <div><dt>ความสูงจากขอบฟ้า</dt><dd>{number(object.altitude)}° · {aboveHorizon(object) ? 'เหนือขอบฟ้า' : 'ใต้ขอบฟ้า'}</dd></div>
      <div><dt>มุมทิศ</dt><dd>{number(object.azimuth)}°</dd></div>
    </dl>
    {object.magnitudeNote && <p className="deep-sky-note">{object.magnitudeNote}</p>}
    <p className="deep-sky-note">วัตถุแผ่กว้างอาจมองเห็นยากกว่าดาวที่มีแมกนิจูดเท่ากัน เพราะแสงกระจายบนพื้นที่ใหญ่ การเห็นจริงขึ้นกับท้องฟ้า อุปกรณ์ และแสงรบกวน</p>
    <button className="primary-button full-width" onClick={onShowOnMap}><Telescope size={17}/> ดูตำแหน่งบนแผนที่ <ArrowRight size={16}/></button>
    <div className="deep-sky-sources"><a href={object.sourceUrl} target="_blank" rel="noreferrer">ข้อมูลแค็ตตาล็อกของ {object.catalogId} <ExternalLink size={12}/></a><a href={`${import.meta.env.BASE_URL}data/deep-sky-sources.md`} target="_blank" rel="noreferrer">แหล่งข้อมูลและวิธีเลือกวัตถุ <ExternalLink size={12}/></a><a href="https://archive.stsci.edu/dss/" target="_blank" rel="noreferrer">เกี่ยวกับภาพ DSS <ExternalLink size={12}/></a></div>
  </section>;
}

export function DeepSkyCard({ object, onDetails }) {
  return <section className="star-card deep-sky-card" data-selected-deep-sky={object.id}>
    <div className="card-eyebrow"><Orbit size={16}/><span>ไกลออกไปในจักรวาล</span></div>
    <div className="deep-sky-detail-heading"><span>{object.catalogId} · {object.kind || categories[object.type]}</span><h2>{object.name}</h2><p>{object.nameEn}</p></div>
    <span className={`visibility ${aboveHorizon(object) ? 'above' : 'below'}`}><span/>{aboveHorizon(object) ? 'อยู่เหนือขอบฟ้า' : 'อยู่ใต้ขอบฟ้า'} · {number(object.altitude)}°</span>
    <p className="deep-sky-description">{object.description}</p>
    <button className="text-button star-more" onClick={onDetails}>ดูภาพจริงและรายละเอียด <ArrowRight size={15}/></button>
  </section>;
}
