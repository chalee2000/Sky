// Polar/equatorial radius ratios, rounded from NASA Planetary Fact Sheets.
// These describe the body's shape, not its current orientation in Earth's sky.
export const planetaryShapes = {
  mercury: { polarRatio:1, tilt:0.034 },
  venus: { polarRatio:1, tilt:177.36 },
  mars: { polarRatio:3376.2/3396.2, tilt:25.19 },
  jupiter: { polarRatio:66854/71492, tilt:3.13 },
  saturn: { polarRatio:54364/60268, tilt:26.73 },
  uranus: { polarRatio:24973/25559, tilt:97.77 },
  neptune: { polarRatio:24341/24764, tilt:28.32 },
};

const credit='NASA / NASA-3D-Resources';
const archive='https://github.com/nasa/NASA-3D-Resources/blob/master/Images%20and%20Textures/';
const processed='แผนที่ภาพที่ NASA เผยแพร่สำหรับงาน 3 มิติ ต้นทางไม่ระบุวันถ่ายหรือการปรับเทียบสี จึงไม่ใช่ภาพสดหรือการยืนยันสีที่ตาเห็นโดยตรง';
export const modelTextures = {
  mars:{file:'textures/mars.jpg',source:`${archive}Mars/Mars.jpg`,credit,label:'แผนที่พื้นผิวดาวอังคาร',note:processed},
  jupiter:{file:'textures/jupiter.jpg',source:`${archive}Jupiter/Jupiter.jpg`,credit,label:'แผนที่แถบเมฆดาวพฤหัสบดี',note:`${processed} แถบเมฆและจุดแดงใหญ่เปลี่ยนแปลงได้ ไม่ใช่พื้นดินแข็ง`},
  saturn:{file:'textures/saturn.jpg',source:`${archive}Saturn/Saturn.jpg`,credit,label:'แผนที่แถบเมฆดาวเสาร์',note:`${processed} ภาพแสดงบรรยากาศ ไม่ใช่พื้นดินแข็ง`},
  neptune:{file:'textures/neptune.jpg',source:`${archive}Neptune/Neptune.jpg`,credit,label:'แผนที่เนปจูนแบบปรับสี',note:`${processed} ภาพนี้ปรับสีฟ้าและรายละเอียดอย่างมาก ไม่ใช้แทนสีธรรมชาติของดาวเนปจูน`},
  venus:{file:'textures/venus.jpg',source:`${archive}Venus/Venus.jpg`,credit,label:'ภาพจำลองพื้นผิวดาวศุกร์ใต้เมฆ',note:`${processed} สีส้มในแผนที่เป็นสีสำหรับแสดงรายละเอียดพื้นผิว ภายใต้แสงที่ตามองเห็น เมฆหนาบดบังพื้นผิวนี้`},
};

export function celestialModel(object, mapView=false) {
  const shape=object.type==='planet' ? planetaryShapes[object.id] : null;
  if(shape) return {
    ...shape, kind:'planet', color:object.id==='neptune'?'#afd6d6':object.color,
    texture:['venus','neptune'].includes(object.id)&&!mapView?null:modelTextures[object.id] || null,
    alternativeMap:['venus','neptune'].includes(object.id),
    rings:object.id==='saturn',
    label:'แบบจำลองดาวเคราะห์ 3 มิติ',
    note:'แสง มุมมอง และการหมุนจัดไว้เพื่อสำรวจรูปร่าง ไม่ใช่เฟส ทิศแกน หรือสภาพเมฆ ณ เวลาที่เลือก ขนาดบนจอปรับให้ดูง่าย ไม่ใช้เทียบขนาดระหว่างดาว',
  };
  return {
    kind:'star', color:object.color, polarRatio:1, tilt:0, rings:false, texture:null,
    label:'แบบจำลองดาวฤกษ์อย่างง่าย',
    note:'ดาวฤกษ์ส่วนใหญ่ยังถ่ายรายละเอียดพื้นผิวไม่ได้ แบบจำลองนี้ใช้เฉดสีโดยประมาณจากแค็ตตาล็อกของแอพ ไม่ใช่ภาพถ่ายหรือรูปร่างที่วัดได้ บางดวงเป็นระบบดาวหลายดวง ซึ่งทรงกลมเดียวนี้ไม่ได้แสดงสมาชิกและวงโคจร',
  };
}
