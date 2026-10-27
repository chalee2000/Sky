import { useState } from 'react';
import { ChevronDown, Compass, Moon } from 'lucide-react';
import { localSiderealTime } from '../lib/astronomy.js';
import './SkyHud.css';

const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Bangkok' });
const calendar = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });
const pad = value => String(value).padStart(2, '0');

function siderealClock(date, longitude) {
  const seconds = Math.round(localSiderealTime(date, longitude) * 240) % 86400;
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}

function skyCondition(altitude) {
  if (altitude >= 0) return 'กลางวัน';
  if (altitude > -6) return 'สนธยาพลเรือน';
  if (altitude > -12) return 'สนธยาเดินเรือ';
  if (altitude > -18) return 'สนธยาดาราศาสตร์';
  return 'กลางคืนทางดาราศาสตร์';
}

export default function SkyHud({ date, location, sun, phase, liveClock }) {
  const [expanded, setExpanded] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 740px) and (min-height: 540px)').matches);
  const moonlight = Math.round(phase.illumination * 100);
  const lst = siderealClock(date, location.longitude);
  const latitude = `${Math.abs(location.latitude).toFixed(2)}° ${location.latitude >= 0 ? 'N' : 'S'}`;
  const longitude = `${Math.abs(location.longitude).toFixed(2)}° ${location.longitude >= 0 ? 'E' : 'W'}`;

  return <details className="sky-hud" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)} data-live={!!liveClock}>
    <summary>
      <span className="sky-hud-title"><Compass size={14} aria-hidden="true" />ข้อมูลท้องฟ้า</span>
      <span className="sky-hud-moon" aria-label={`ดวงจันทร์สว่างประมาณ ${moonlight} เปอร์เซ็นต์`}><Moon size={12} aria-hidden="true" />≈{moonlight}%</span>
      <ChevronDown size={13} className="sky-hud-chevron" aria-hidden="true" />
    </summary>
    <div className="sky-hud-body">
      <p className="sky-hud-condition"><span />{skyCondition(sun.altitude)}</p>
      <p className="sky-hud-location">{location.short}<span>{latitude} · {longitude}</span></p>
      <dl>
        <div><dt>{liveClock ? 'เวลาปัจจุบัน' : 'เวลาที่เลือก'}</dt><dd><time dateTime={date.toISOString()}>{clock.format(date)}</time><small>UTC+7</small></dd></div>
        <div><dt><abbr title="เวลาดาราคติท้องถิ่นเฉลี่ย">LST</abbr></dt><dd data-lst={lst}>{lst}</dd></div>
        <div><dt>ดวงอาทิตย์</dt><dd data-sun-altitude={sun.altitude}>{sun.altitude >= 0 ? '+' : '−'}{Math.abs(sun.altitude).toFixed(1)}°<small>จากขอบฟ้า</small></dd></div>
        <div><dt>แสงจันทร์</dt><dd data-moon-illumination={phase.illumination}>≈{moonlight}%<small>โดยประมาณ</small></dd></div>
      </dl>
      <p className="sky-hud-date">{calendar.format(date)} · {phase.name}</p>
      <p className="sky-hud-note">ช่วงกลางวันและสนธยาคำนวณจากดวงอาทิตย์ สภาพฟ้าจริงขึ้นกับเมฆและแสงรบกวน</p>
    </div>
  </details>;
}
