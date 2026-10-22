/**
 * A compact bright-star atlas. Coordinates are approximate J2000 equatorial
 * coordinates (RA in hours, declination in degrees); magnitudes are visual.
 * Distances in light-years are rounded, especially for distant variable stars.
 * These are educational naked-eye positions: proper motion, precession,
 * nutation and atmospheric refraction are not applied. Not for navigation.
 * Coordinate convention: azimuth 0° north, 90° east; altitude 0° horizon.
 * Background: Yale Bright Star Catalogue / IAU conventional star names.
 */

const rows = [
  // id, English name, Thai name, RA hours, Dec degrees, V magnitude, color, ly, constellation
  ['betelgeuse', 'Betelgeuse', 'บีเทลจุส', 5.9195, 7.4071, 0.42, '#ffb485', 550, 'orion'],
  ['rigel', 'Rigel', 'ไรเจล', 5.2423, -8.2016, 0.13, '#b6d5ff', 860, 'orion'],
  ['bellatrix', 'Bellatrix', 'เบลลาทริกซ์', 5.4189, 6.3497, 1.64, '#c8ddff', 250, 'orion'],
  ['saiph', 'Saiph', 'เซฟ', 5.7959, -9.6696, 2.06, '#bbd6ff', 650, 'orion'],
  ['alnitak', 'Alnitak', 'อัลนิตัก', 5.6793, -1.9426, 1.74, '#c6ddff', 1260, 'orion'],
  ['alnilam', 'Alnilam', 'อัลนิลัม', 5.6036, -1.2019, 1.69, '#c6ddff', 2000, 'orion'],
  ['mintaka', 'Mintaka', 'มินตากา', 5.5334, -0.2991, 2.23, '#cee0ff', 1200, 'orion'],
  ['meissa', 'Meissa', 'เมสซา', 5.5856, 9.9342, 3.33, '#d2e3ff', 1100, 'orion'],
  ['aldebaran', 'Aldebaran', 'อัลเดบารัน', 4.5987, 16.5093, 0.85, '#ffc18e', 65, 'taurus'],
  ['elnath', 'Elnath', 'เอลแนท', 5.4382, 28.6075, 1.65, '#c4dcff', 134, 'taurus'],
  ['zeta-tauri', 'Zeta Tauri', 'ซีตา วัว', 5.6274, 21.1426, 3.0, '#c2d7ff', 440, 'taurus'],
  ['castor', 'Castor', 'คาสเตอร์', 7.5767, 31.8883, 1.58, '#e4ecff', 51, 'gemini'],
  ['pollux', 'Pollux', 'พอลลักซ์', 7.7553, 28.0262, 1.14, '#ffd6a0', 34, 'gemini'],
  ['alhena', 'Alhena', 'อัลเฮนา', 6.6285, 16.3993, 1.93, '#e3ebff', 109, 'gemini'],
  ['sirius', 'Sirius', 'ซิริอุส', 6.7525, -16.7161, -1.46, '#dceaff', 8.6, 'canis-major'],
  ['adhara', 'Adhara', 'อัดฮารา', 6.9771, -28.9721, 1.5, '#c0d9ff', 430, 'canis-major'],
  ['wezen', 'Wezen', 'เวเซน', 7.1399, -26.3932, 1.83, '#fff0c7', 1600, 'canis-major'],
  ['caph', 'Caph', 'คาฟ', 0.1529, 59.1498, 2.27, '#fff3d8', 55, 'cassiopeia'],
  ['schedar', 'Schedar', 'เชดาร์', 0.6751, 56.5373, 2.24, '#ffd099', 228, 'cassiopeia'],
  ['gamma-cas', 'Gamma Cassiopeiae', 'แกมมา แคสซิโอเปีย', 0.9451, 60.7167, 2.15, '#c9dfff', 550, 'cassiopeia'],
  ['ruchbah', 'Ruchbah', 'รุกบาห์', 1.4303, 60.2353, 2.68, '#e1ebff', 99, 'cassiopeia'],
  ['segin', 'Segin', 'เซกิน', 1.9066, 63.6701, 3.35, '#d1e1ff', 410, 'cassiopeia'],
  ['dubhe', 'Dubhe', 'ดูเบ', 11.0621, 61.7508, 1.79, '#ffcb93', 123, 'ursa-major'],
  ['merak', 'Merak', 'เมอรัก', 11.0307, 56.3824, 2.37, '#e3ecff', 80, 'ursa-major'],
  ['phecda', 'Phecda', 'เฟกดา', 11.8972, 53.6948, 2.44, '#e5edff', 83, 'ursa-major'],
  ['megrez', 'Megrez', 'เมเกรซ', 12.2571, 57.0326, 3.31, '#e3edff', 81, 'ursa-major'],
  ['alioth', 'Alioth', 'อาลิโอท', 12.9005, 55.9598, 1.76, '#e5edff', 83, 'ursa-major'],
  ['mizar', 'Mizar', 'มิซาร์', 13.3987, 54.9254, 2.23, '#e5edff', 83, 'ursa-major'],
  ['alkaid', 'Alkaid', 'อัลไคด์', 13.7923, 49.3133, 1.86, '#c6dcff', 104, 'ursa-major'],
  ['polaris', 'Polaris', 'ดาวเหนือ', 2.5303, 89.2641, 1.98, '#fff0cf', 448, 'ursa-minor'],
  ['kochab', 'Kochab', 'โคคาบ', 14.8451, 74.1555, 2.08, '#ffc48e', 131, 'ursa-minor'],
  ['pherkad', 'Pherkad', 'เฟอร์คัด', 15.3455, 71.8340, 3.05, '#e2ebff', 487, 'ursa-minor'],
  ['deneb', 'Deneb', 'เดเนบ', 20.6905, 45.2803, 1.25, '#dceaff', 2600, 'cygnus'],
  ['sadr', 'Sadr', 'ซาดร์', 20.3705, 40.2567, 2.23, '#fff0d1', 1800, 'cygnus'],
  ['gienah', 'Gienah', 'กีเอนาห์', 20.7702, 33.9703, 2.48, '#ffcb96', 73, 'cygnus'],
  ['delta-cyg', 'Delta Cygni', 'เดลตา หงส์', 19.7496, 45.1308, 2.87, '#d4e4ff', 165, 'cygnus'],
  ['albireo', 'Albireo', 'อัลบิเรโอ', 19.5120, 27.9597, 3.08, '#ffd19a', 430, 'cygnus'],
  ['vega', 'Vega', 'เวกา', 18.6156, 38.7837, 0.03, '#dce9ff', 25, 'lyra'],
  ['sheliak', 'Sheliak', 'เชลีอัก', 18.8347, 33.3627, 3.52, '#cbdfff', 960, 'lyra'],
  ['sulafat', 'Sulafat', 'ซูลาฟัต', 18.9824, 32.6896, 3.25, '#cde0ff', 620, 'lyra'],
  ['altair', 'Altair', 'อัลแทร์', 19.8464, 8.8683, 0.77, '#e6edff', 16.7, 'aquila'],
  ['tarazed', 'Tarazed', 'ทาราเซด', 19.7710, 10.6133, 2.72, '#ffc993', 395, 'aquila'],
  ['alshain', 'Alshain', 'อัลเชน', 19.9219, 6.4068, 3.71, '#fff0c8', 44.7, 'aquila'],
  ['antares', 'Antares', 'แอนทาเรส', 16.4901, -26.4320, 1.06, '#ff9d78', 550, 'scorpius'],
  ['acrab', 'Acrab', 'อัคราบ', 16.0906, -19.8055, 2.62, '#c7dcff', 400, 'scorpius'],
  ['dschubba', 'Dschubba', 'ดชุบบา', 16.0056, -22.6217, 2.32, '#c7dcff', 490, 'scorpius'],
  ['wei', 'Wei', 'เว่ย', 16.8361, -34.2932, 2.29, '#ffd29b', 64, 'scorpius'],
  ['sargas', 'Sargas', 'ซาร์กัส', 17.6220, -42.9978, 1.86, '#fff0cf', 272, 'scorpius'],
  ['shaula', 'Shaula', 'เชาลา', 17.5601, -37.1038, 1.62, '#c6dcff', 570, 'scorpius'],
  ['lesath', 'Lesath', 'เลซัท', 17.5127, -37.2958, 2.70, '#c4dbff', 580, 'scorpius'],
  ['kaus-australis', 'Kaus Australis', 'คอส ออสตราลิส', 18.4029, -34.3846, 1.79, '#cbdfff', 143, 'sagittarius'],
  ['kaus-media', 'Kaus Media', 'คอส มีเดีย', 18.3499, -29.8281, 2.70, '#ffcb96', 348, 'sagittarius'],
  ['kaus-borealis', 'Kaus Borealis', 'คอส บอเรียลิส', 18.4662, -25.4217, 2.82, '#ffd09c', 78, 'sagittarius'],
  ['nunki', 'Nunki', 'นุนกี', 18.9211, -26.2967, 2.05, '#c6dcff', 228, 'sagittarius'],
  ['ascella', 'Ascella', 'แอสเซลลา', 19.0435, -29.8801, 2.59, '#e3ecff', 88, 'sagittarius'],
  ['alnasl', 'Alnasl', 'อัลนาสล์', 18.0968, -30.4241, 2.98, '#ffca92', 96, 'sagittarius'],
  ['tau-sgr', 'Tau Sagittarii', 'เทา คนยิงธนู', 19.1157, -27.6704, 3.32, '#ffc78d', 122, 'sagittarius'],
  ['acrux', 'Acrux', 'เอครักซ์', 12.4433, -63.0991, 0.76, '#bed8ff', 321, 'crux'],
  ['mimosa', 'Mimosa', 'มิโมซา', 12.7953, -59.6888, 1.25, '#c5dcff', 280, 'crux'],
  ['gacrux', 'Gacrux', 'แกครักซ์', 12.5194, -57.1132, 1.63, '#ffb58a', 89, 'crux'],
  ['imai', 'Imai', 'อิไม', 12.2524, -58.7489, 2.79, '#c6dcff', 345, 'crux'],
  ['regulus', 'Regulus', 'เรกูลัส', 10.1395, 11.9672, 1.35, '#c9dfff', 79, 'leo'],
  ['algieba', 'Algieba', 'อัลจีบา', 10.3329, 19.8415, 2.08, '#ffce96', 130, 'leo'],
  ['adhafera', 'Adhafera', 'อัดฮาเฟรา', 10.2782, 23.4173, 3.44, '#fff0d3', 274, 'leo'],
  ['zosma', 'Zosma', 'ซอสมา', 11.2351, 20.5237, 2.56, '#dfebff', 58, 'leo'],
  ['denebola', 'Denebola', 'เดเนโบลา', 11.8177, 14.5721, 2.14, '#e4ecff', 36, 'leo'],
  ['markab', 'Markab', 'มาร์คับ', 23.0794, 15.2053, 2.49, '#d6e4ff', 133, 'pegasus'],
  ['scheat', 'Scheat', 'เชียต', 23.0629, 28.0828, 2.42, '#ffb58a', 196, 'pegasus'],
  ['algenib', 'Algenib', 'อัลเจนิบ', 0.2206, 15.1836, 2.83, '#c9ddff', 390, 'pegasus'],
  ['alpheratz', 'Alpheratz', 'อัลเฟอรัตซ์', 0.1398, 29.0904, 2.06, '#d0e2ff', 97, 'andromeda'],
  ['mirach', 'Mirach', 'มิรัค', 1.1622, 35.6206, 2.05, '#ffb48b', 197, 'andromeda'],
  ['almach', 'Almach', 'อัลมัก', 2.0650, 42.3297, 2.10, '#ffc58e', 350, 'andromeda'],
  ['capella', 'Capella', 'คาเพลลา', 5.2782, 45.9980, 0.08, '#ffe2aa', 43, 'auriga'],
  ['arcturus', 'Arcturus', 'อาร์กทูรัส', 14.2610, 19.1824, -0.05, '#ffc793', 36.7, 'bootes'],
  ['spica', 'Spica', 'สไปกา', 13.4199, -11.1613, 0.98, '#c8dcff', 250, 'virgo'],
  ['procyon', 'Procyon', 'โพรซิออน', 7.6550, 5.2250, 0.34, '#fff2d6', 11.5, 'canis-minor'],
  ['fomalhaut', 'Fomalhaut', 'โฟมัลฮอต', 22.9608, -29.6222, 1.16, '#e0ebff', 25, 'piscis-austrinus'],
  ['achernar', 'Achernar', 'อเคอร์นาร์', 1.6286, -57.2368, 0.46, '#c6ddff', 139, 'eridanus'],
];

const descriptions = {
  sirius: 'ดาวฤกษ์ที่สว่างที่สุดบนท้องฟ้ายามค่ำคืน อยู่ใกล้โลกเพียงประมาณ 8.6 ปีแสง มองหาต่อจากแนวเข็มขัดนายพราน',
  betelgeuse: 'ดาวมหายักษ์แดงบริเวณไหล่นายพราน สีส้มแดงเห็นได้ด้วยตาเปล่า ความสว่างเปลี่ยนแปลงได้และระยะทางยังมีความไม่แน่นอน',
  rigel: 'ดาวมหายักษ์สีฟ้าขาวบริเวณเท้านายพราน สว่างมากแม้อยู่ไกลจากโลกหลายร้อยปีแสง',
  polaris: 'อยู่ใกล้ขั้วฟ้าเหนือ จึงดูเหมือนอยู่นิ่งเมื่อดาวอื่นเคลื่อนรอบ ความสูงเหนือขอบฟ้าใกล้เคียงละติจูดของผู้สังเกต',
  vega: 'ดาวสว่างสีฟ้าขาวในกลุ่มดาวพิณ เป็นหนึ่งในสามมุมของสามเหลี่ยมฤดูร้อนร่วมกับเดเนบและอัลแทร์',
  deneb: 'ดาวมหายักษ์สีขาวที่หางหงส์ เป็นหนึ่งในสามเหลี่ยมฤดูร้อน ระยะทางที่ไกลทำให้ค่าประมาณมีความไม่แน่นอน',
  altair: 'ดาวสว่างในกลุ่มดาวนกอินทรี เป็นดาวใกล้โลกและหมุนรอบตัวเองเร็วมาก เป็นหนึ่งในสามเหลี่ยมฤดูร้อน',
  antares: 'ดาวมหายักษ์แดงที่หัวใจแมงป่อง สีแดงส้มเด่นชัด ชื่อหมายถึงคู่แข่งของดาวอังคาร',
  aldebaran: 'ดาวยักษ์สีส้มที่ดวงตาของวัว ดูเหมือนอยู่ในกระจุกดาวไฮยาดีส แต่จริง ๆ อยู่ใกล้โลกกว่ากระจุกดาว',
  castor: 'ดาวสว่างที่ดูเป็นจุดเดียวด้วยตาเปล่า แต่จริง ๆ เป็นระบบดาวหลายดวงในกลุ่มดาวคนคู่',
  pollux: 'ดาวยักษ์สีส้มที่สว่างที่สุดในกลุ่มดาวคนคู่ มีดาวเคราะห์นอกระบบที่ตรวจพบโคจรรอบ',
  arcturus: 'ดาวยักษ์สีส้มสว่างเด่นในกลุ่มดาวคนเลี้ยงสัตว์ หาได้โดยลากส่วนโค้งต่อจากด้ามกระบวยใหญ่',
  capella: 'ดาวสว่างสีเหลืองในกลุ่มดาวสารถี แสงส่วนใหญ่ที่เห็นมาจากดาวยักษ์สองดวงในระบบเดียวกัน',
  mizar: 'ดาวบริเวณด้ามกระบวยใหญ่ มีดาวอัลคอร์อยู่ใกล้กันบนท้องฟ้า เป็นคู่ดาวที่ใช้ทดสอบสายตากันมาแต่โบราณ',
  albireo: 'ดาวที่หัวหงส์ เมื่อมองผ่านกล้องโทรทรรศน์ขนาดเล็กจะเห็นคู่ดาวสีทองและสีฟ้าที่ต่างกันชัดเจน',
  fomalhaut: 'ดาวสว่างโดดเด่นในบริเวณท้องฟ้าทางใต้ที่มีดาวสว่างไม่มาก มีแผ่นจานฝุ่นล้อมรอบ',
  spica: 'ดาวสว่างสีฟ้าขาวในกลุ่มดาวหญิงสาว เป็นระบบดาวคู่ที่โคจรใกล้กันมาก',
};

export const stars = rows.map(([id, nameEn, name, ra, dec, magnitude, color, distance, constellationId]) => ({
  id, nameEn, name, ra, dec, magnitude, color, distance, constellationId,
  description: descriptions[id] || `${name} (${nameEn}) เป็นดาวฤกษ์ในแผนที่ดาวนี้ สีและความสว่างที่มองเห็นอาจเปลี่ยนไปตามสภาพบรรยากาศและแสงรบกวน`,
}));

const patterns = [
  ['orion', 'นายพราน', 'Orion', 'จดจำได้จากดาวสามดวงเรียงเป็นเข็มขัด มีบีเทลจุสสีส้มและไรเจลสีฟ้าขาวอยู่คนละมุม', [['betelgeuse','meissa'],['meissa','bellatrix'],['bellatrix','mintaka'],['mintaka','alnilam'],['alnilam','alnitak'],['alnitak','betelgeuse'],['mintaka','rigel'],['rigel','saiph'],['saiph','alnitak']]],
  ['taurus', 'วัว', 'Taurus', 'มองหาอัลเดบารันสีส้มเป็นดวงตา และดาวปลายเขาทั้งสองดวง', [['aldebaran','elnath'],['aldebaran','zeta-tauri']]],
  ['gemini', 'คนคู่', 'Gemini', 'คาสเตอร์และพอลลักซ์เป็นคู่ดาวสว่างที่ช่วยระบุตำแหน่งกลุ่มดาว', [['castor','pollux'],['pollux','alhena']]],
  ['canis-major', 'สุนัขใหญ่', 'Canis Major', 'บ้านของซิริอุส ดาวฤกษ์ที่สว่างที่สุดในท้องฟ้ายามค่ำคืน', [['sirius','wezen'],['wezen','adhara']]],
  ['cassiopeia', 'แคสซิโอเปีย', 'Cassiopeia', 'ดาวสว่างห้าดวงเรียงเป็นรูป W หรือ M อยู่ในท้องฟ้าทางเหนือ', [['caph','schedar'],['schedar','gamma-cas'],['gamma-cas','ruchbah'],['ruchbah','segin']]],
  ['ursa-major', 'หมีใหญ่', 'Ursa Major', 'แสดงส่วนกระบวยใหญ่ ดาวดูเบและเมอรักช่วยชี้ไปยังดาวเหนือ', [['dubhe','merak'],['merak','phecda'],['phecda','megrez'],['megrez','dubhe'],['megrez','alioth'],['alioth','mizar'],['mizar','alkaid']]],
  ['ursa-minor', 'หมีเล็ก', 'Ursa Minor', 'ดาวเหนืออยู่ปลายด้ามกระบวยเล็ก ที่นี่แสดงดาวสว่างสามดวงเป็นแนวช่วยค้นหา', [['polaris','kochab'],['kochab','pherkad']]],
  ['cygnus', 'หงส์', 'Cygnus', 'รูปกางเขนเหนือทอดตัวตามทางช้างเผือก เดเนบอยู่ที่หาง อัลบิเรโออยู่ที่หัว', [['deneb','sadr'],['sadr','albireo'],['delta-cyg','sadr'],['sadr','gienah']]],
  ['lyra', 'พิณ', 'Lyra', 'กลุ่มดาวขนาดเล็กใกล้เวกา หนึ่งในจุดเริ่มต้นที่ดีสำหรับการสำรวจท้องฟ้า', [['vega','sheliak'],['sheliak','sulafat'],['sulafat','vega']]],
  ['aquila', 'นกอินทรี', 'Aquila', 'อัลแทร์อยู่ระหว่างทาราเซดและอัลเชน เป็นแนวดาวที่สังเกตได้ง่าย', [['tarazed','altair'],['altair','alshain']]],
  ['scorpius', 'แมงป่อง', 'Scorpius', 'แอนทาเรสสีแดงอยู่บริเวณหัวใจ ส่วนหางโค้งไปจบที่ดาวเชาลาและเลซัท', [['acrab','dschubba'],['dschubba','antares'],['antares','wei'],['wei','sargas'],['sargas','shaula'],['shaula','lesath']]],
  ['sagittarius', 'คนยิงธนู', 'Sagittarius', 'แนวดาวส่วนหนึ่งดูคล้ายกาน้ำชา อยู่ในทิศใกล้ศูนย์กลางทางช้างเผือก', [['alnasl','kaus-media'],['kaus-media','kaus-borealis'],['kaus-borealis','nunki'],['nunki','ascella'],['ascella','kaus-australis'],['kaus-australis','alnasl'],['kaus-media','kaus-australis'],['nunki','tau-sgr'],['tau-sgr','ascella']]],
  ['crux', 'กางเขนใต้', 'Crux', 'กลุ่มดาวขนาดเล็กรูปกางเขน ในประเทศไทยจะอยู่ต่ำทางขอบฟ้าด้านใต้และเห็นได้เฉพาะบางช่วง', [['acrux','gacrux'],['mimosa','imai']]],
  ['leo', 'สิงโต', 'Leo', 'เรกูลัสอยู่บริเวณหัวใจสิงโต ส่วนเดเนโบลาอยู่ที่หาง', [['regulus','algieba'],['algieba','adhafera'],['algieba','zosma'],['zosma','denebola'],['denebola','regulus']]],
  ['pegasus', 'ม้าบิน', 'Pegasus', 'สี่เหลี่ยมใหญ่ของม้าบินใช้ดาวอัลเฟอรัตซ์ในกลุ่มดาวแอนดรอเมดาเป็นมุมหนึ่ง', [['markab','scheat'],['scheat','alpheratz'],['alpheratz','algenib'],['algenib','markab']]],
  ['andromeda', 'แอนดรอเมดา', 'Andromeda', 'แนวดาวต่อจากสี่เหลี่ยมม้าบิน ในบริเวณนี้มีกาแล็กซีแอนดรอเมดาซึ่งต้องอาศัยท้องฟ้ามืดในการสังเกต', [['alpheratz','mirach'],['mirach','almach']]],
  ['auriga', 'สารถี', 'Auriga', 'มองหาคาเพลลาสีเหลืองเป็นดาวหลักของกลุ่มดาวสารถี', []],
  ['bootes', 'คนเลี้ยงสัตว์', 'Boötes', 'มองหาอาร์กทูรัสสีส้มตามแนวโค้งจากด้ามกระบวยใหญ่', []],
  ['virgo', 'หญิงสาว', 'Virgo', 'สไปกาเป็นดาวสว่างหลักของกลุ่มดาวขนาดใหญ่นี้', []],
  ['canis-minor', 'สุนัขเล็ก', 'Canis Minor', 'โพรซิออนเป็นหนึ่งในสามเหลี่ยมฤดูหนาวร่วมกับซิริอุสและบีเทลจุส', []],
  ['piscis-austrinus', 'ปลาใต้', 'Piscis Austrinus', 'โฟมัลฮอตเป็นดาวสว่างโดดเด่นของกลุ่มดาวปลาใต้', []],
  ['eridanus', 'แม่น้ำ', 'Eridanus', 'อเคอร์นาร์อยู่ที่ปลายด้านใต้ของกลุ่มดาวแม่น้ำที่ทอดยาวบนท้องฟ้า', []],
];

export const constellations = patterns.map(([id, name, nameEn, description, lines]) => ({
  id, name, nameEn, description, lines,
  starIds: [...new Set([...stars.filter(star => star.constellationId === id).map(star => star.id), ...lines.flat()])],
}));

const radians = Math.PI / 180;
const wrap = (value, period) => ((value % period) + period) % period;

export function julianDate(date) {
  const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(time)) throw new RangeError('Invalid date');
  return time / 86400000 + 2440587.5;
}

/** Local mean sidereal time, in degrees. East longitude is positive. */
export function localSiderealTime(date, longitude = 0) {
  if (!Number.isFinite(longitude)) throw new RangeError('Longitude must be finite');
  const elapsed = julianDate(date) - 2451545.0;
  const centuries = elapsed / 36525;
  return wrap(280.46061837 + 360.98564736629 * elapsed
    + 0.000387933 * centuries ** 2 - centuries ** 3 / 38710000 + longitude, 360);
}

/** Geometric position; refraction near the horizon is deliberately omitted. */
export function equatorialToHorizontal(raHours, decDegrees, date, latitude, longitude) {
  if (![raHours, decDegrees, latitude, longitude].every(Number.isFinite)
    || Math.abs(decDegrees) > 90 || Math.abs(latitude) > 90) {
    throw new RangeError('Coordinates must be finite; latitude and declination must be within ±90°');
  }
  const hourAngle = (localSiderealTime(date, longitude) - raHours * 15) * radians;
  const dec = decDegrees * radians;
  const lat = latitude * radians;
  const sinAltitude = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAltitude))) / radians;
  const east = -Math.cos(dec) * Math.sin(hourAngle);
  const north = Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(hourAngle);
  // Azimuth is undefined at the zenith/nadir. Use 0° as a stable convention.
  const azimuth = Math.hypot(east, north) < 1e-12 ? 0 : wrap(Math.atan2(east, north) / radians, 360);
  return { altitude, azimuth };
}

/**
 * Mean synodic-cycle approximation, not a lunar ephemeris. Phase timing can
 * differ from the observed Moon by roughly a day. Illumination is a fraction.
 */
export function moonPhase(date) {
  const phase = wrap((julianDate(date) - 2451550.25972) / 29.530588853, 1);
  const names = [
    ['จันทร์ดับ', 'New moon'], ['จันทร์เสี้ยวข้างขึ้น', 'Waxing crescent'],
    ['ครึ่งดวงข้างขึ้น', 'First quarter'], ['เกือบเต็มดวงข้างขึ้น', 'Waxing gibbous'],
    ['จันทร์เต็มดวง', 'Full moon'], ['เกือบเต็มดวงข้างแรม', 'Waning gibbous'],
    ['ครึ่งดวงข้างแรม', 'Last quarter'], ['จันทร์เสี้ยวข้างแรม', 'Waning crescent'],
  ];
  const [name, nameEn] = names[Math.round(phase * 8) % 8];
  return {
    phase, illumination: (1 - Math.cos(2 * Math.PI * phase)) / 2,
    ageDays: phase * 29.530588853, name, nameEn, approximate: true,
  };
}

/** Approximate solar position, sufficient to distinguish daylight/twilight. */
export function sunPosition(date, latitude, longitude) {
  const elapsed = julianDate(date) - 2451545;
  const meanLongitude = wrap(280.460 + 0.9856474 * elapsed, 360);
  const anomaly = wrap(357.528 + 0.9856003 * elapsed, 360) * radians;
  const eclipticLongitude = (meanLongitude + 1.915 * Math.sin(anomaly) + 0.020 * Math.sin(2 * anomaly)) * radians;
  const obliquity = (23.439 - 0.0000004 * elapsed) * radians;
  const ra = wrap(Math.atan2(Math.cos(obliquity) * Math.sin(eclipticLongitude), Math.cos(eclipticLongitude)) / radians, 360) / 15;
  const dec = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude)) / radians;
  return equatorialToHorizontal(ra, dec, date, latitude, longitude);
}
