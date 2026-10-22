import { useEffect, useRef } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { stars, constellations } from '../lib/astronomy.js';
import { starStories, traditionForStar } from '../lib/starStories.js';
import { StarPhotoButton } from './StarPhoto.jsx';
import './StarStory.css';

export default function StarStory({ star, onChangeStar, onOpenPhoto }) {
  const heading = useRef(null);
  const story = starStories[star.id];
  const tradition = traditionForStar(star);
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
    <div className="story-prose">{story.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    <p className="story-fiction-note">เรื่องแต่งสั้น ๆ สำหรับอ่านใต้แสงดาว</p>
    {tradition && <details className="story-tradition" key={tradition.title}><summary>ตำนานที่เกี่ยวข้อง · {tradition.title}</summary><span className="tradition-culture">{tradition.culture} · เล่าใหม่โดยสรุป</span><p>{tradition.text}</p><a href={tradition.source} target="_blank" rel="noreferrer">อ่านที่มาของตำนาน ↗</a><small>ตำนานมีหลายสำนวน และเป็นเรื่องเล่าทางวัฒนธรรม</small></details>}
    <aside className="story-facts"><span><Sparkles size={14}/> ดาวจริงบนท้องฟ้า</span><p>{star.name} อยู่ในกลุ่มดาว{constellation?.name || star.constellationId} ห่างจากโลกประมาณ {Number(star.distance).toLocaleString('th-TH')} ปีแสง</p><small>ระยะทางเป็นค่าประมาณ แยกจากเหตุการณ์ในนิทาน</small></aside>
    <nav className="story-navigation" aria-label="เลือกนิทานดวงดาว"><button onClick={()=>change(-1)} aria-label="อ่านนิทานดวงก่อนหน้า"><ChevronLeft size={16}/><span>เรื่องก่อนหน้า</span></button><span>{index+1} / {stars.length}</span><button onClick={()=>change(1)} aria-label="อ่านนิทานดวงถัดไป"><span>เรื่องถัดไป</span><ChevronRight size={16}/></button></nav>
  </article>;
}
