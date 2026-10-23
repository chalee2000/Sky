import { stars, constellations } from './astronomy.js';

// Fictional Thai storytelling frame; astronomical statements come directly
// from the selected star and constellation, never from a rotating tale list.
export function createStarStory(star, constellation) {
  const distance=Number(star.distance).toLocaleString('th-TH');
  const group=constellation.name;
  return {
    starId:star.id,
    constellationId:star.constellationId,
    kind:'astronomy-fiction',
    label:'นิทานเรียนรู้ดวงดาว · แต่งจากข้อมูลจริง',
    title:`ยายเล่าเรื่อง${star.name}`,
    paragraphs:[
      `ค่ำหนึ่งที่ลานบ้าน เด็กน้อยเปิดแผนที่ฟ้าแล้วถามยายว่า “${star.name} คือดาวดวงไหนหรือจ๊ะ” ยายชวนให้ดูชื่อ ${star.nameEn} บนแผนที่ แล้วบอกว่า “ดาวดวงนี้อยู่ในกลุ่มดาว${group} ลองดูตำแหน่งของมันกับดาวรอบ ๆ ก่อนนะ คืนนี้เราจะเห็นหรือไม่ ต้องดูเวลา สถานที่ และท้องฟ้าด้วย”`,
      `ยายเล่าต่อว่า “${star.description}” เด็กน้อยจึงค่อย ๆ ทำความรู้จักดาวจากลักษณะของมัน แทนที่จะคิดว่าจุดสว่างทุกดวงเหมือนกัน ยายชี้ที่รูปกลุ่มดาวในแผนที่แล้วอธิบายว่า “${constellation.description}”`,
      `“แล้วแสงเดินทางมาไกลแค่ไหนจ๊ะ” เด็กน้อยถาม ยายเปิดข้อมูลให้ดูว่า ${star.name} อยู่ห่างจากโลกประมาณ ${distance} ปีแสง “ปีแสงเป็นหน่วยระยะทาง แสงจากระยะเท่านี้ใช้เวลาเดินทางประมาณ ${distance} ปีจึงมาถึงเรา ตัวเลขนี้เป็นค่าประมาณนะ” เด็กน้อยมองแผนที่อีกครั้ง คราวนี้จุดเล็ก ๆ มีทั้งชื่อ ระยะทาง และเรื่องให้ค้นหาต่อ`,
      `ก่อนเก็บแผนที่ ยายฝากว่า “เส้นที่ลากเป็นรูปกลุ่มดาวเป็นวิธีช่วยจำจากมุมมองบนโลก ไม่ใช่เชือกที่ผูกดาวไว้ ดาวในรูปเดียวกันอาจอยู่ห่างจากเราไม่เท่ากัน” เด็กน้อยจึงจดชื่อ${star.name}ไว้ เพื่อกลับมาดูตำแหน่งจริงบนแผนที่ในคืนถัดไป`,
    ],
    source:`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(star.nameEn)}`,
  };
}

export const starStories=Object.fromEntries(stars.map(star=>{
  const constellation=constellations.find(item=>item.id===star.constellationId);
  if(!constellation) throw new Error(`Missing constellation for ${star.id}`);
  return [star.id,createStarStory(star,constellation)];
}));
