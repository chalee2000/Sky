import { Body, Observer, Equator, Horizon, Illumination, AngleFromSun } from 'astronomy-engine';

export const AU_KM = 149597870.7;
export const planets = [
  { id:'mercury',body:Body.Mercury,name:'ดาวพุธ',nameEn:'Mercury',symbol:'☿',color:'#b9afa0',diameterKm:4879,periodDays:87.97,description:'ดาวเคราะห์หินที่อยู่ใกล้ดวงอาทิตย์ที่สุด พื้นผิวมีหลุมอุกกาบาตจำนวนมาก มักอยู่ใกล้ดวงอาทิตย์บนท้องฟ้า จึงสังเกตได้ยาก',fact:'หนึ่งปีบนดาวพุธยาวประมาณ 88 วันบนโลก' },
  { id:'venus',body:Body.Venus,name:'ดาวศุกร์',nameEn:'Venus',symbol:'♀',color:'#f3d5a3',diameterKm:12104,periodDays:224.7,description:'ดาวเคราะห์ที่สว่างเด่น บางช่วงเห็นก่อนดวงอาทิตย์ขึ้นหรือหลังตก บรรยากาศหนาทึบทำให้พื้นผิวร้อนมาก แม้จะอยู่ไกลดวงอาทิตย์กว่าดาวพุธ',fact:'เมื่อดูผ่านกล้อง ดาวศุกร์มีเฟสคล้ายดวงจันทร์' },
  { id:'mars',body:Body.Mars,name:'ดาวอังคาร',nameEn:'Mars',symbol:'♂',color:'#e99872',diameterKm:6779,periodDays:686.98,description:'ดาวเคราะห์หินที่เห็นเป็นสีส้มแดงจากแร่เหล็กบนพื้นผิว มีภูเขาไฟขนาดใหญ่และร่องรอยของน้ำในอดีต ความสว่างเปลี่ยนมากตามระยะห่างจากโลก',fact:'ดาวอังคารมีดวงจันทร์สองดวง คือ โฟบอสและดีมอส' },
  { id:'jupiter',body:Body.Jupiter,name:'ดาวพฤหัสบดี',nameEn:'Jupiter',symbol:'♃',color:'#e1bf96',diameterKm:139820,periodDays:4332.59,description:'ดาวเคราะห์ที่ใหญ่ที่สุดในระบบสุริยะ เป็นดาวแก๊สยักษ์ที่มีแถบเมฆและพายุขนาดใหญ่ กล้องขนาดเล็กอาจเห็นดวงจันทร์บริวารหลักเรียงอยู่ข้างดาว',fact:'จุดแดงใหญ่เป็นพายุในบรรยากาศ ไม่ใช่พื้นผิวแข็ง' },
  { id:'saturn',body:Body.Saturn,name:'ดาวเสาร์',nameEn:'Saturn',symbol:'♄',color:'#e4d09c',diameterKm:116460,periodDays:10759.22,description:'ดาวแก๊สยักษ์ที่โดดเด่นด้วยวงแหวนซึ่งประกอบด้วยน้ำแข็งและเศษวัตถุจำนวนมาก การเห็นวงแหวนต้องใช้กล้องและขึ้นกับมุมที่วงแหวนหันมาทางโลก',fact:'วงแหวนกว้างมาก แต่บางเมื่อเทียบกับขนาดของมัน' },
  { id:'uranus',body:Body.Uranus,name:'ดาวยูเรนัส',nameEn:'Uranus',symbol:'♅',color:'#9cd8df',diameterKm:50724,periodDays:30688.5,description:'ดาวน้ำแข็งยักษ์สีฟ้าอมเขียว มีแกนหมุนเอียงมากจนดูคล้ายกลิ้งไปตามวงโคจร แสงค่อนข้างจาง โดยทั่วไปควรใช้กล้องสองตาหรือกล้องโทรทรรศน์ช่วยค้นหา',fact:'ใช้เวลาประมาณ 84 ปีบนโลกเพื่อโคจรรอบดวงอาทิตย์หนึ่งรอบ' },
  { id:'neptune',body:Body.Neptune,name:'ดาวเนปจูน',nameEn:'Neptune',symbol:'♆',color:'#8caff0',diameterKm:49244,periodDays:60182,description:'ดาวน้ำแข็งยักษ์ที่อยู่ไกลดวงอาทิตย์ที่สุดในบรรดาดาวเคราะห์แปดดวง มีลมรุนแรงและแสงจางเกินกว่าจะเห็นด้วยตาเปล่า ต้องใช้กล้องช่วยสังเกต',fact:'หนึ่งปีของดาวเนปจูนยาวประมาณ 165 ปีบนโลก' },
].map(planet=>({...planet,type:'planet',sourceUrl:`https://science.nasa.gov/${planet.id}/`}));

export function planetPositions(date, latitude, longitude) {
  const time = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(time.getTime()) || !Number.isFinite(latitude) || Math.abs(latitude)>90 || !Number.isFinite(longitude) || Math.abs(longitude)>180) throw new RangeError('Valid time and observer coordinates are required');
  const observer = new Observer(latitude,longitude,0);
  return planets.map(planet=>{
    const equatorial=Equator(planet.body,time,observer,true,true);
    const horizontal=Horizon(time,observer,equatorial.ra,equatorial.dec);
    const light=Illumination(planet.body,time);
    return {...planet,ra:equatorial.ra,dec:equatorial.dec,altitude:horizontal.altitude,azimuth:horizontal.azimuth,distanceAu:equatorial.dist,distanceKm:equatorial.dist*AU_KM,magnitude:light.mag,illumination:light.phase_fraction,elongation:AngleFromSun(planet.body,time)};
  });
}

export function planetVisibility(planet) {
  if (planet.altitude<=0) return 'อยู่ใต้ขอบฟ้าในเวลานี้';
  if (planet.elongation<15) return 'อยู่ใกล้ดวงอาทิตย์ · สังเกตยาก';
  if (planet.id==='neptune') return 'เหนือขอบฟ้า · ต้องใช้กล้อง';
  if (planet.id==='uranus') return 'เหนือขอบฟ้า · ควรใช้กล้องช่วย';
  return 'อยู่เหนือขอบฟ้า';
}
