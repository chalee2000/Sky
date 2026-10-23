import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import { constellations } from '../lib/astronomy.js';
import { constellationMyths } from '../lib/constellationMyths.js';
import './ConstellationMyth.css';

export default function ConstellationMyth({ constellation, onSelectConstellation }) {
  const details = useRef(null);
  const heading = useRef(null);
  const story = constellationMyths[constellation.id];
  useEffect(() => {
    // Keep the reader in the open story when following a related constellation.
    if (details.current?.open) {
      heading.current?.focus({ preventScroll: true });
      details.current.scrollIntoView({ block: 'start' });
    }
  }, [constellation.id]);
  if (!story) return null;
  const history = story.kind === 'history';
  const related = story.relatedIds.map(id => constellations.find(c => c.id === id)).filter(Boolean);

  return <details ref={details} className="constellation-myth" data-myth={constellation.id} data-myth-kind={story.kind}>
    <summary>
      <BookOpen size={19} aria-hidden="true" />
      <span>{history ? 'ประวัติการตั้งชื่อกลุ่มดาว' : 'ตำนานกลุ่มดาว'}<small>{story.title}</small></span>
      <ChevronDown size={17} className="myth-chevron" aria-hidden="true" />
    </summary>
    <div className="constellation-myth-body">
      <span className="myth-tradition">{story.tradition}</span>
      <h3 ref={heading} tabIndex={-1}>{story.title}</h3>
      {!history && <p className="myth-context">กลุ่มดาวคลาสสิกหลายกลุ่มสืบทอดเรื่องเล่ากรีก–โรมัน แต่แต่ละวัฒนธรรมมีเรื่องราวบนท้องฟ้าต่างกัน เรื่องนี้เป็นตำนานฉบับย่อ ไม่ใช่คำอธิบายการเกิดดาว</p>}
      <div className="myth-paragraphs">{story.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <div className="myth-sky-connection"><strong>{history ? 'ชื่อกับแผนที่ดาว' : 'จากเรื่องเล่าสู่แผนที่ดาว'}</strong><p>{story.skyConnection}</p></div>
      <p className="myth-variant">{story.variantNote}</p>
      <div className="myth-sources"><span>อ่านที่มาเพิ่มเติม</span>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={12} aria-hidden="true" /></a>)}</div>
      {related.length > 0 && <nav className="myth-related" aria-label="กลุ่มดาวที่เกี่ยวข้องกับเรื่องเล่า"><span>อ่านเรื่องที่เชื่อมโยงกัน</span>{related.map(group => <button key={group.id} onClick={() => onSelectConstellation(group)}>{group.name} · {group.nameEn}<ArrowRight size={14} aria-hidden="true" /></button>)}</nav>}
    </div>
  </details>;
}
