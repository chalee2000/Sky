import { useEffect, useState } from 'react';
import { Box, Camera, ExternalLink, ImageOff, LoaderCircle, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { starImage } from '../lib/starImages.js';
import './StarPhoto.css';

function usePhotoStatus(url) {
  const [status,setStatus]=useState('loading');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const timeout=setTimeout(()=>setStatus(previous=>previous==='loading'?'error':previous),20000);
    return()=>clearTimeout(timeout);
  },[url,attempt]);
  return {status,attempt,loaded:()=>setStatus('ready'),failed:()=>setStatus('error'),retry:()=>{setStatus('loading');setAttempt(value=>value+1);}};
}

export function StarPhotoButton({star,onOpen,showStatus=false}) {
  const photo=starImage(star);
  const {status,attempt,loaded,failed}=usePhotoStatus(photo.url);
  return <button className="star-photo-button" onClick={onOpen} aria-label={`ดูภาพถ่ายจริงบริเวณดาว${star.name}`} title={`ดูภาพถ่ายจริงบริเวณดาว${star.name}`} data-photo-star={star.id}>
    <img key={attempt} src={photo.url} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async" onLoad={loaded} onError={failed} className={status==='ready'?'ready':''}/>
    {status==='loading'&&<LoaderCircle size={19} className="photo-spinner" aria-hidden="true"/>}
    {status==='error'&&<Camera size={22} aria-hidden="true"/>}
    {showStatus&&status!=='ready'&&<span className="star-photo-inline-status">{status==='loading'?'กำลังโหลดภาพถ่ายจริง…':'ยังโหลดภาพจริงไม่ได้ · แตะเพื่อลอง'}</span>}
    <span className="photo-open-icon"><ZoomIn size={11}/></span>
  </button>;
}

export default function StarPhoto({star,onOpenModel}) {
  const photo=starImage(star);
  const {status,attempt,loaded,failed,retry}=usePhotoStatus(photo.url);
  const [zoom,setZoom]=useState(1);
  return <section className="star-photo-viewer" data-photo-star={star.id}>
    <div className="photo-kind"><Camera size={14}/> ภาพถ่ายสำรวจท้องฟ้าจริง · {photo.survey}</div>
    <div className={`photo-frame ${status==='ready'?'photo-ready':''}`}>
      <div className="photo-scroll" tabIndex={status==='ready'?0:-1} aria-label="ภาพดาว ขยายแล้วเลื่อนดูภาพได้">
        <img key={attempt} src={photo.url} alt={`ภาพถ่ายสำรวจ DSS2 บริเวณดาว${star.name} (${star.nameEn})`} referrerPolicy="no-referrer" decoding="async" onLoad={loaded} onError={failed} style={{width:`${zoom*100}%`,maxWidth:'none'}}/>
      </div>
      {status==='loading'&&<div className="photo-state" role="status"><LoaderCircle size={28} className="photo-spinner"/><strong>กำลังโหลดภาพจริงของบริเวณ{star.name}</strong><span>บริการสำรวจท้องฟ้ากำลังสร้างภาพตามพิกัดดาว</span></div>}
      {status==='error'&&<div className="photo-state photo-error" role="status"><ImageOff size={30}/><strong>ยังโหลดภาพถ่ายจริงไม่ได้</strong><span>ตรวจอินเทอร์เน็ต หรือลองใหม่ภายหลัง<br/>แอพจะไม่ใช้รูปดาวอื่นหรือภาพจำลองแทน</span><button onClick={retry}><RotateCcw size={14}/> ลองโหลดอีกครั้ง</button></div>}
    </div>
    <div className="photo-controls"><button aria-label="ย่อภาพดาว" disabled={status!=='ready'||zoom<=1} onClick={()=>setZoom(value=>Math.max(1,value-.5))}><ZoomOut size={17}/></button><span>{Math.round(zoom*100)}%</span><button aria-label="ขยายภาพดาว" disabled={status!=='ready'||zoom>=3} onClick={()=>setZoom(value=>Math.min(3,value+.5))}><ZoomIn size={17}/></button><button aria-label="คืนขนาดภาพดาว" disabled={zoom===1} onClick={()=>setZoom(1)}><RotateCcw size={15}/></button><a href={photo.url} target="_blank" rel="noreferrer">เปิดภาพต้นฉบับ <ExternalLink size={12}/></a></div>
    {onOpenModel&&<button className="model-view-entry" onClick={onOpenModel}><Box size={15}/> สำรวจแบบจำลอง 3 มิติของดาวนี้</button>}
    <h3 className="photo-star-name">{star.name} <span>{star.nameEn}</span></h3>
    <p className="photo-explanation">กรอบภาพตรงกับพิกัดของดาว{star.name} และบริเวณโดยรอบ ดาวส่วนใหญ่อยู่ไกลจนภาพถ่ายเห็นเป็นจุดแสง ไม่ใช่ภาพรายละเอียดผิวดาว</p>
    <dl className="photo-coordinates"><div><dt>ไรต์แอสเซนชัน J2000</dt><dd>{photo.raDegrees.toFixed(4)}°</dd></div><div><dt>เดคลิเนชัน J2000</dt><dd>{photo.decDegrees.toFixed(4)}°</dd></div><div><dt>ขอบเขตภาพ</dt><dd>{(photo.fieldOfView*60).toFixed(0)} ลิปดา</dd></div></dl>
    <p className="photo-color-note">ภาพผสมสีจากข้อมูลสำรวจ ไม่ใช่ภาพสดหรือสีที่ตาเห็นโดยตรง ดาวสว่างมากอาจเห็นแสงฟุ้งหรือเส้นแฉกจากอุปกรณ์ถ่ายภาพ</p>
    <div className="photo-credit"><p>{photo.credit}</p><a href="https://archive.stsci.edu/dss/" target="_blank" rel="noreferrer">เกี่ยวกับภาพ Digitized Sky Survey ↗</a><a href="https://aladin.cds.unistra.fr/hips/list" target="_blank" rel="noreferrer">ข้อมูลชุดสำรวจและเงื่อนไขการใช้ภาพ ↗</a></div>
  </section>;
}
