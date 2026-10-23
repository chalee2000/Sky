import { ArrowRight, Compass, MapPin, Star, Telescope } from 'lucide-react';
import { constellationProfiles } from '../lib/constellationProfiles.js';
import { constellationStars } from '../lib/constellationDetails.js';
import './ConstellationDetails.css';

const direction=angle=>['เหนือ','ตะวันออกเฉียงเหนือ','ตะวันออก','ตะวันออกเฉียงใต้','ใต้','ตะวันตกเฉียงใต้','ตะวันตก','ตะวันตกเฉียงเหนือ'][Math.round(angle/45)%8];
const dateLabel=date=>new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Bangkok'}).format(date);

function Diagram({constellation,stars,onSelectStar}){
  if(!stars.length)return null;
  const center=stars[0].ra;
  const coords=stars.map(star=>({...star,chartRa:center+((star.ra-center+36)%24-12)}));
  const minX=Math.min(...coords.map(s=>s.chartRa)),maxX=Math.max(...coords.map(s=>s.chartRa));
  const minY=Math.min(...coords.map(s=>s.dec)),maxY=Math.max(...coords.map(s=>s.dec));
  const byId=Object.fromEntries(coords.map(s=>[s.id,{...s,x:maxX===minX?200:330-(s.chartRa-minX)/(maxX-minX)*260,y:maxY===minY?120:40+(maxY-s.dec)/(maxY-minY)*150}]));
  return <figure className="constellation-diagram"><svg viewBox="0 0 400 240" role="group" aria-label={`แผนผังดาวเด่นกลุ่มดาว${constellation.name}`}><g aria-hidden="true">{constellation.lines.map(([a,b],i)=>byId[a]&&byId[b]&&<line key={i} x1={byId[a].x} y1={byId[a].y} x2={byId[b].x} y2={byId[b].y} stroke="#8f89c4" strokeWidth="1.2" opacity=".7"/>)}</g>{Object.values(byId).map(star=><g key={star.id} className="constellation-diagram-star" role="button" tabIndex={0} aria-label={`ข้อมูลดาว${star.name}`} onClick={()=>onSelectStar(star.id)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelectStar(star.id);}}}><title>{star.name} · {star.nameEn}</title><circle cx={star.x} cy={star.y} r="10" fill={star.color} opacity=".1"/><circle cx={star.x} cy={star.y} r={Math.max(2,4.8-star.magnitude*.55)} fill={star.color}/><text x={star.x} y={star.y+21} textAnchor="middle">{star.name}</text><circle cx={star.x} cy={star.y} r="13" className="constellation-diagram-hit" fill="transparent"/></g>)}</svg><figcaption>{constellation.lines.length?'แผนผังเพื่อจำรูปแบบ · แตะดาวเพื่อดูข้อมูล':'แสดงดาวเด่นที่มีในแอพ · ยังไม่มีเส้นเชื่อมเต็มกลุ่ม'}<small>ตำแหน่งจัดจากพิกัดดาว ไม่ใช่มุมมองท้องฟ้าปัจจุบันหรือขอบเขตกลุ่มดาว</small></figcaption></figure>;
}

export default function ConstellationDetails({constellation,positions,date,location,onSelectStar,onShowOnMap}){
  const profile=constellationProfiles[constellation.id];
  const {members,references,visible}=constellationStars(constellation,positions);
  const starRow=(star,reference=false)=><button key={star.id} className="constellation-member" data-member-star={star.id} data-reference={reference} onClick={()=>onSelectStar(star.id)}><span className="member-dot" style={{background:star.color}}/><span className="member-name">{star.name}<small>{star.nameEn}{reference?' · ดาวอ้างอิงจากกลุ่มข้างเคียง':''}</small></span><span className="member-position"><strong className={star.altitude>0?'above':''}>{star.altitude>0?'เหนือขอบฟ้า':'ใต้ขอบฟ้า'} · {star.altitude.toFixed(1)}°</strong><small>{direction(star.azimuth)} {star.azimuth.toFixed(1)}° · {star.magnitude.toFixed(2)} mag</small></span><ArrowRight size={13}/></button>;
  return <article className="constellation-details" data-constellation-details={constellation.id}>
    <div className="constellation-detail-identity"><span>{constellation.nameEn}</span><span className="constellation-abbreviation">{profile.abbreviation}</span></div>
    <Diagram constellation={constellation} stars={[...members,...references]} onSelectStar={onSelectStar}/>
    <p className="constellation-overview">{profile.overview}</p>
    <div className="constellation-observer"><MapPin size={15}/><div><strong>{location.short} · {dateLabel(date)} น. (UTC+7)</strong><span data-visible-count={visible}>ดาวเด่นในรายการอยู่เหนือขอบฟ้า {visible} / {members.length} ดวง</span><small>นับเฉพาะดาวที่แอพมีข้อมูล การเห็นจริงขึ้นกับความมืด เมฆ และสิ่งบดบัง</small></div></div>
    <section className="constellation-detail-section"><h3><Compass size={16}/> วิธีหาบนท้องฟ้า</h3><p>{constellation.description}</p><ul>{profile.observingTips.map(tip=><li key={tip}>{tip}</li>)}</ul></section>
    <section className="constellation-detail-section"><h3><Telescope size={16}/> สิ่งน่าสนใจในบริเวณนี้</h3><div className="constellation-highlights">{profile.highlights.map(item=><div key={item.name}><strong>{item.name}</strong><p>{item.description}</p></div>)}</div></section>
    <section className="constellation-detail-section"><h3><Star size={16}/> ดาวเด่นในกลุ่มนี้</h3><div className="constellation-member-list">{members.map(star=>starRow(star))}</div>{references.length>0&&<><h4>ดาวอ้างอิงในรูปแบบ</h4><p className="constellation-reference-note">ดาวด้านล่างช่วยต่อรูปบนแผนผัง แต่เป็นสมาชิกของกลุ่มดาวข้างเคียง จึงไม่นับในจำนวนดาวด้านบน</p><div className="constellation-member-list">{references.map(star=>starRow(star,true))}</div></>}</section>
    <button className="primary-button full-width" onClick={onShowOnMap}>ดูกลุ่มดาวนี้บนแผนที่ <ArrowRight size={15}/></button>
    <p className="constellation-scope">กลุ่มดาวคือบริเวณบนท้องฟ้า ดาวในภาพอาจอยู่ห่างจากโลกต่างกัน จึงไม่มีระยะทางเดียวสำหรับทั้งกลุ่ม แผนผังนี้แสดงดาวเด่นบางส่วนจากแค็ตตาล็อกในแอพ</p>
    <a className="constellation-source" href={profile.sourceUrl} target="_blank" rel="noreferrer">อ่านข้อมูลกลุ่มดาว{constellation.name}เพิ่มเติม ↗</a>
  </article>;
}
