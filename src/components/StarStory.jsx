import { useEffect, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { stars, constellations } from '../lib/astronomy.js';
import { starStories } from '../lib/starStories.js';
import { nameSources } from '../lib/starScience.js';
import { StarPhotoButton } from './StarPhoto.jsx';
import './StarStory.css';

export default function StarStory({ star, onChangeStar, onOpenPhoto }) {
  const heading = useRef(null);
  const story = starStories[star.id];
  const science = story.science;
  const index = stars.findIndex(item => item.id === star.id);
  const constellation = constellations.find(item => item.id === star.constellationId);
  useEffect(() => {
    heading.current?.closest('dialog')?.scrollTo({ top: 0 });
  }, [star.id]);
  const change = offset => {
    onChangeStar(stars[(index+offset+stars.length)%stars.length].id);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  };
  return <article className="star-story" data-story-id={star.id}>
    <figure className="story-photo-hero"><StarPhotoButton key={star.id} star={star} onOpen={onOpenPhoto} showStatus/><figcaption>ภาพสำรวจท้องฟ้า DSS2 · แตะดูภาพขยาย</figcaption></figure>
    <div className="story-star-name">{star.name} <span>· {star.nameEn}</span></div>
    <span className="story-kind"><BookOpen size={12}/>{story.label}</span>
    <h3 ref={heading} tabIndex={-1} className="story-title">{story.title}</h3>
    <aside className="story-facts" aria-label="ข้อมูลทางดาราศาสตร์ของดาว">
      <span><Sparkles size={14}/> รู้จักดาวก่อนอ่านเรื่อง</span>
      <dl className="story-science-grid">
        <div className="science-wide"><dt>ชื่อทางดาราศาสตร์</dt><dd data-science="designation">{science.designation}</dd><small>HIP {science.identifiers.hip} · HD {science.identifiers.hd} · {science.catalogId}</small></div>
        <div className="science-wide"><dt>ชนิดดาวตามแค็ตตาล็อก</dt><dd>{science.starType}</dd><dd className="science-spectrum" data-science="spectral-type">{science.spectralType}</dd><small>Bright Star Catalogue · ฉบับที่ 5 (1991)</small></div>
        <div><dt>ความสว่างปรากฏ (V)</dt><dd data-science="magnitude">≈{science.magnitudeText} <span>mag</span></dd><small>HYG v4.1 · ค่ายิ่งน้อยยิ่งสว่าง</small></div>
        <div><dt>ระยะทางในแค็ตตาล็อก</dt><dd data-science="distance">≈{science.distanceText} <span>ปีแสง</span></dd><small>HYG v4.1 · {science.catalogDistanceParsecs.toLocaleString('th-TH')} pc</small></div>
        <div className="science-wide"><dt>ความหมายชื่อ</dt><dd data-science="name-meaning" className={!science.nameMeaning?'science-unverified':''}>{science.nameMeaning || 'ยังไม่มีคำแปลที่ยืนยันในแหล่งอ้างอิงของหน้านี้'}</dd>{science.nameContext&&<small>{science.nameContext}</small>}</div>
      </dl>
      <p>{star.name} อยู่ในกลุ่มดาว{constellation?.name || star.constellationId}</p>
      {science.notes&&<p className="science-catalog-note">{science.notes}</p>}
      {science.catalogName&&science.catalogName!==star.nameEn&&<p className="science-catalog-note">ชื่อที่ HYG ใช้: <strong>{science.catalogName}</strong> · ใช้รหัส HIP ด้านบนเพื่อระบุดาวดวงเดียวกัน</p>}
      {science.distanceDiffers&&<p className="science-catalog-note">ค่าในแผนที่ Sky คือประมาณ {science.mapDistanceText} ปีแสง ส่วนหน้านิทานอ้างค่า HYG v4.1 ตามที่ระบุไว้ ระยะทางที่เผยแพร่อาจต่างกันตามชุดข้อมูลและวิธีวัด โดยเฉพาะดาวไกล</p>}
      <small>สเปกตรัมอาจอ้างดาวองค์ประกอบหรือแสงรวมของระบบ สีที่อธิบายเป็นค่าโดยประมาณ การจัดประเภทและระยะทางอาจต่างจากงานวิจัยใหม่ ความสว่างไม่ใช่ค่าที่วัดสด และดาวแปรแสงมีความสว่างเปลี่ยนแปลงได้</small>
    </aside>
    <p className="story-fiction-note">ฉาก ตัวละคร และบทสนทนาเป็นเรื่องสมมติเพื่อการเรียนรู้ ไม่ใช่ตำนานพื้นบ้านไทย ส่วนชื่อทางดาราศาสตร์ สเปกตรัม และตัวเลขอ้างแค็ตตาล็อกที่ระบุ</p>
    <div className="story-prose">{story.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    <section className="story-sources" aria-label="แหล่งอ้างอิงนิทาน"><h4>อ่านจากข้อมูลต้นทาง</h4>
      {science.references.map(reference=><a key={reference.id} href={reference.url} target="_blank" rel="noreferrer">{reference.label} ↗</a>)}
      {star.id==='alnasl'&&<><a href={nameSources.alSufi.url} target="_blank" rel="noreferrer">{nameSources.alSufi.label} ↗</a><a href={nameSources.modernIau.url} target="_blank" rel="noreferrer">{nameSources.modernIau.label} ↗</a><p>พบชื่อ Alnasl ใน Stellarium ฉบับ Modern IAU ที่อ้างบัญชี IAU-CSN แต่ยังไม่มีวันที่รับรองชื่อที่ยืนยันจากต้นฉบับในแหล่งข้อมูลที่ใช้</p><a href={nameSources.iau.url} target="_blank" rel="noreferrer">ตรวจบัญชีชื่อดาว IAU-CSN ↗</a></>}
      <a href={story.source} target="_blank" rel="noreferrer">ค้นข้อมูลดาวนี้ใน SIMBAD ↗</a>
      <a href={`${import.meta.env.BASE_URL}data/star-science-sources.md`} target="_blank" rel="noreferrer">ที่มาของข้อมูลและเครดิตแค็ตตาล็อก ↗</a>
    </section>
    <nav className="story-navigation" aria-label="เลือกนิทานดวงดาว"><button onClick={()=>change(-1)} aria-label="อ่านนิทานดวงก่อนหน้า"><ChevronLeft size={16}/><span>เรื่องก่อนหน้า</span></button><span>{index+1} / {stars.length}</span><button onClick={()=>change(1)} aria-label="อ่านนิทานดวงถัดไป"><span>เรื่องถัดไป</span><ChevronRight size={16}/></button></nav>
  </article>;
}
