/**
 * Selected OpenNGC objects, J2000 coordinates (RA hours, declination degrees).
 * Adapted from Mattia Verga/OpenNGC, CC BY-SA 4.0.
 * Source revision: be3cd6c5498806a2fbb2f7e0452ef802dbb02be0.
 * See public/data/deep-sky-sources.md for field definitions and limitations.
 */
import { equatorialToHorizontal } from './astronomy.js';

export const deepSkyObjects = [
  {
    "id": "m31",
    "name": "กาแล็กซีแอนดรอเมดา",
    "nameEn": "Andromeda Galaxy",
    "catalogId": "M31",
    "aliases": [
      "M31",
      "NGC0224",
      "NGC 224",
      "Andromeda Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 0.7123194444,
    "dec": 41.2690555556,
    "magnitude": 3.44,
    "magnitudeBand": "V",
    "constellationName": "แอนดรอเมดา",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวแอนดรอเมดา ชื่อ M31 และ NGC 224 หมายถึงวัตถุเดียวกัน แสงของกาแล็กซีเกิดจากดาวจำนวนมหาศาลรวมกัน",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 177.83,
    "imageFov": 4.446,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0224",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "00:42:44.35",
      "dec": "+41:16:08.6"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pax:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m32",
    "name": "กาแล็กซี M32",
    "nameEn": "Messier 32",
    "catalogId": "M32",
    "aliases": [
      "M32",
      "NGC0221",
      "NGC 221"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีทรงรี",
    "ra": 0.7116194444,
    "dec": 40.8652777778,
    "magnitude": 8.13,
    "magnitudeBand": "V",
    "constellationName": "แอนดรอเมดา",
    "description": "กาแล็กซีทรงรีในทิศกลุ่มดาวแอนดรอเมดา อยู่ใกล้ M31 บนแผนที่ท้องฟ้า แต่เป็นวัตถุคนละรายการ",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 7.74,
    "imageFov": 0.2,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0221",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "00:42:41.83",
      "dec": "+40:51:55.0"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m110",
    "name": "กาแล็กซี M110",
    "nameEn": "Messier 110",
    "catalogId": "M110",
    "aliases": [
      "M110",
      "NGC0205",
      "NGC 205"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีทรงรี",
    "ra": 0.6728,
    "dec": 41.6853055556,
    "magnitude": 8.15,
    "magnitudeBand": "V",
    "constellationName": "แอนดรอเมดา",
    "description": "กาแล็กซีทรงรีในบริเวณท้องฟ้าใกล้ M31 มีชื่อในแค็ตตาล็อก NGC ว่า NGC 205",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 16.22,
    "imageFov": 0.405,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0205",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "00:40:22.08",
      "dec": "+41:41:07.1"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m33",
    "name": "กาแล็กซีสามเหลี่ยม",
    "nameEn": "Triangulum Galaxy",
    "catalogId": "M33",
    "aliases": [
      "M33",
      "NGC0598",
      "NGC 598",
      "Triangulum Galaxy",
      "Triangulum Pinwheel"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 1.5641361111,
    "dec": 30.6602222222,
    "magnitude": 5.79,
    "magnitudeBand": "V",
    "constellationName": "สามเหลี่ยม",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวสามเหลี่ยม แสงกระจายบนพื้นที่กว้าง จึงไม่ได้เห็นง่ายเท่าดาวฤกษ์ที่มีแมกนิจูดเท่ากัน",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 62.09,
    "imageFov": 1.552,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0598",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "01:33:50.89",
      "dec": "+30:39:36.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m81",
    "name": "กาแล็กซีโบเด",
    "nameEn": "Bode’s Galaxy",
    "catalogId": "M81",
    "aliases": [
      "M81",
      "NGC3031",
      "NGC 3031",
      "Bode's Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 9.9258805556,
    "dec": 69.0653055556,
    "magnitude": 6.92,
    "magnitudeBand": "V",
    "constellationName": "หมีใหญ่",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวหมีใหญ่ คู่ชื่อ M81 และ NGC 3031 ระบุวัตถุเดียวกัน",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 21.63,
    "imageFov": 0.541,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC3031",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "09:55:33.17",
      "dec": "+69:03:55.1"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m82",
    "name": "กาแล็กซีซิการ์",
    "nameEn": "Cigar Galaxy",
    "catalogId": "M82",
    "aliases": [
      "M82",
      "NGC3034",
      "NGC 3034",
      "Cigar Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซี",
    "ra": 9.9313138889,
    "dec": 69.6793888889,
    "magnitude": 8.3,
    "magnitudeBand": "V",
    "constellationName": "หมีใหญ่",
    "description": "กาแล็กซีในทิศกลุ่มดาวหมีใหญ่ ชื่อซิการ์บรรยายรูปร่างที่เห็นบนภาพถ่าย ส่วน M82 เป็นหมายเลขแค็ตตาล็อก",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 10.99,
    "imageFov": 0.275,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC3034",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "09:55:52.73",
      "dec": "+69:40:45.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m51",
    "name": "กาแล็กซีวังวน",
    "nameEn": "Whirlpool Galaxy",
    "catalogId": "M51",
    "aliases": [
      "M51",
      "NGC5194",
      "NGC 5194",
      "Whirlpool Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 13.497975,
    "dec": 47.1951666667,
    "magnitude": 8.36,
    "magnitudeBand": "V",
    "constellationName": "สุนัขล่าเนื้อ",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวสุนัขล่าเนื้อ จุดที่ปักบนแผนที่เป็นศูนย์กลางของ NGC 5194 ไม่ใช่ตำแหน่งของดาวฤกษ์ดวงเดียว",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 13.71,
    "imageFov": 0.343,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5194",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "13:29:52.71",
      "dec": "+47:11:42.6"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pax:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m101",
    "name": "กาแล็กซีกังหันลม",
    "nameEn": "Pinwheel Galaxy",
    "catalogId": "M101",
    "aliases": [
      "M101",
      "NGC5457",
      "NGC 5457"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 14.0534833333,
    "dec": 54.3489444444,
    "magnitude": 7.9,
    "magnitudeBand": "V",
    "constellationName": "หมีใหญ่",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวหมีใหญ่ แสงของวัตถุแผ่กว้าง การดูรายละเอียดจึงอาศัยท้องฟ้ามืดและกล้องโทรทรรศน์",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 23.99,
    "imageFov": 0.6,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5457",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "14:03:12.54",
      "dec": "+54:20:56.2"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m104",
    "name": "กาแล็กซีหมวกปีกกว้าง",
    "nameEn": "Sombrero Galaxy",
    "catalogId": "M104",
    "aliases": [
      "M104",
      "NGC4594",
      "NGC 4594",
      "Sombrero Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 12.6665083333,
    "dec": -11.6230555556,
    "magnitude": 8.59,
    "magnitudeBand": "V",
    "constellationName": "หญิงสาว",
    "description": "กาแล็กซีในทิศกลุ่มดาวหญิงสาว รู้จักในชื่อ Sombrero หรือหมวกปีกกว้าง หมายเลข NGC 4594 และ M104 คือวัตถุเดียวกัน",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 8.45,
    "imageFov": 0.211,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC4594",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "12:39:59.43",
      "dec": "-11:37:23.0"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "ngc253",
    "name": "กาแล็กซีช่างแกะสลัก",
    "nameEn": "Sculptor Galaxy",
    "catalogId": "NGC253",
    "aliases": [
      "NGC253",
      "NGC0253",
      "NGC 253",
      "Sculptor Filament",
      "Silver Coin"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 0.7925333333,
    "dec": -25.2882222222,
    "magnitude": null,
    "magnitudeBand": null,
    "constellationName": "ช่างแกะสลัก",
    "description": "กาแล็กซีในทิศกลุ่มดาวช่างแกะสลัก มีชื่ออื่นว่า Silver Coin แผนที่แสดงทิศของศูนย์กลางกาแล็กซี",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 26.79,
    "imageFov": 0.67,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0253",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "00:47:33.12",
      "dec": "-25:17:17.6"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2",
    "magnitudeNote": "ยังไม่แสดงค่าความสว่าง เพราะค่า V ในแค็ตตาล็อกรายการนี้ยังต้องตรวจสอบเพิ่มเติม"
  },
  {
    "id": "ngc5128",
    "name": "กาแล็กซีเซนทอรัสเอ",
    "nameEn": "Centaurus A",
    "catalogId": "NGC5128",
    "aliases": [
      "NGC5128",
      "NGC 5128",
      "Centaurus A"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซี",
    "ra": 13.4243388889,
    "dec": -43.0191111111,
    "magnitude": 7.22,
    "magnitudeBand": "V",
    "constellationName": "คนครึ่งม้า",
    "description": "กาแล็กซีในทิศกลุ่มดาวคนครึ่งม้า มีชื่อแค็ตตาล็อก NGC 5128 คำว่า Centaurus A เป็นชื่อวัตถุ ไม่ใช่ชื่อดาวฤกษ์ดวงหนึ่ง",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 25.88,
    "imageFov": 0.647,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5128",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "13:25:27.62",
      "dec": "-43:01:08.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m63",
    "name": "กาแล็กซีดอกทานตะวัน",
    "nameEn": "Sunflower Galaxy",
    "catalogId": "M63",
    "aliases": [
      "M63",
      "NGC5055",
      "NGC 5055",
      "Sunflower Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 13.2637027778,
    "dec": 42.0292777778,
    "magnitude": 8.61,
    "magnitudeBand": "V",
    "constellationName": "สุนัขล่าเนื้อ",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวสุนัขล่าเนื้อ มีชื่อสามัญว่าดอกทานตะวัน และหมายเลข M63 หรือ NGC 5055",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 11.83,
    "imageFov": 0.296,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5055",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "13:15:49.33",
      "dec": "+42:01:45.4"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m64",
    "name": "กาแล็กซีตาดำ",
    "nameEn": "Black Eye Galaxy",
    "catalogId": "M64",
    "aliases": [
      "M64",
      "NGC4826",
      "NGC 4826",
      "Black Eye Galaxy",
      "Evil Eye Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 12.9454555556,
    "dec": 21.6829722222,
    "magnitude": 8.52,
    "magnitudeBand": "V",
    "constellationName": "ผมเบเรนิซ",
    "description": "กาแล็กซีในทิศกลุ่มดาวผมเบเรนิซ ชื่อสามัญ Black Eye และหมายเลข M64 ระบุวัตถุเดียวกับ NGC 4826",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 10.52,
    "imageFov": 0.263,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC4826",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "12:56:43.64",
      "dec": "+21:40:58.7"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m66",
    "name": "กาแล็กซี M66",
    "nameEn": "Messier 66",
    "catalogId": "M66",
    "aliases": [
      "M66",
      "NGC3627",
      "NGC 3627"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีกังหัน",
    "ra": 11.3374888889,
    "dec": 12.9915277778,
    "magnitude": 8.92,
    "magnitudeBand": "V",
    "constellationName": "สิงโต",
    "description": "กาแล็กซีกังหันในทิศกลุ่มดาวสิงโต มีหมายเลข NGC 3627 ตำแหน่งบนฟ้าเป็นเพียงทิศที่มองจากโลก",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 10.28,
    "imageFov": 0.257,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC3627",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "11:20:14.96",
      "dec": "+12:59:29.5"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|RadVel:2|Redshift:2"
  },
  {
    "id": "m87",
    "name": "กาแล็กซี M87",
    "nameEn": "Messier 87",
    "catalogId": "M87",
    "aliases": [
      "M87",
      "NGC4486",
      "NGC 4486",
      "Virgo Galaxy"
    ],
    "type": "galaxy",
    "kind": "กาแล็กซีทรงรี",
    "ra": 12.5137277778,
    "dec": 12.3911111111,
    "magnitude": 9.0,
    "magnitudeBand": "V",
    "constellationName": "หญิงสาว",
    "description": "กาแล็กซีทรงรีในทิศกลุ่มดาวหญิงสาว แผนที่แสดงศูนย์กลางของกาแล็กซี และภาพสำรวจท้องฟ้าแสดงแสงจากวัตถุในช่วงคลื่นแสง",
    "observingTip": "ใช้กล้องโทรทรรศน์และท้องฟ้ามืด แสงกระจายของกาแล็กซีอาจจางกว่าดาวเดี่ยวที่มีแมกนิจูดเท่ากัน",
    "angularSizeArcmin": 7.11,
    "imageFov": 0.2,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC4486",
    "sourceType": "G",
    "sourceCoordinates": {
      "ra": "12:30:49.42",
      "dec": "+12:23:28.0"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:3|MinAx:3|PosAng:3|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|SurfBr:3|Hubble:3|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m45",
    "name": "กระจุกดาวลูกไก่",
    "nameEn": "Pleiades",
    "catalogId": "M45",
    "aliases": [
      "M45",
      "Mel022",
      "Melotte 22",
      "Pleiades"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวเปิด",
    "ra": 3.7912777778,
    "dec": 24.1052777778,
    "magnitude": 1.2,
    "magnitudeBand": "V",
    "constellationName": "วัว",
    "description": "กระจุกดาวเปิดในทิศกลุ่มดาววัว ประกอบด้วยดาวหลายดวงที่อยู่รวมกัน หมายเลข M45 และ Melotte 22 ใช้ระบุกระจุกเดียวกัน",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 150.0,
    "imageFov": 3.75,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/addendum.csv",
    "sourceId": "Mel022",
    "sourceType": "OCl",
    "sourceCoordinates": {
      "ra": "03:47:28.6",
      "dec": "+24:06:19"
    },
    "sourceFields": "Type:2|RA:2|Dec:2|Const:99|MajAx:5|V-Mag:10|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m44",
    "name": "กระจุกดาวรังผึ้ง",
    "nameEn": "Beehive Cluster",
    "catalogId": "M44",
    "aliases": [
      "M44",
      "NGC2632",
      "NGC 2632",
      "Beehive",
      "Praesepe Cluster"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวเปิด",
    "ra": 8.6728333333,
    "dec": 19.6720555556,
    "magnitude": 3.1,
    "magnitudeBand": "V",
    "constellationName": "ปู",
    "description": "กระจุกดาวเปิดในทิศกลุ่มดาวปู มีชื่ออีกชื่อว่า Praesepe ดวงดาวหลายดวงภายในกระจุกช่วยสร้างภาพคล้ายกลุ่มแสงเมื่อมองด้วยตาเปล่า",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 108.6,
    "imageFov": 2.715,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC2632",
    "sourceType": "OCl",
    "sourceCoordinates": {
      "ra": "08:40:22.20",
      "dec": "+19:40:19.4"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m13",
    "name": "กระจุกดาวเฮอร์คิวลีส",
    "nameEn": "Hercules Globular Cluster",
    "catalogId": "M13",
    "aliases": [
      "M13",
      "NGC6205",
      "NGC 6205",
      "Hercules Globular Cluster"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 16.6948972222,
    "dec": 36.4613055556,
    "magnitude": 5.8,
    "magnitudeBand": "V",
    "constellationName": "เฮอร์คิวลีส",
    "description": "กระจุกดาวทรงกลมในทิศกลุ่มดาวเฮอร์คิวลีส ดาวจำนวนมากกระจุกตัวหนาแน่น ต่างจากรูปกลุ่มดาวที่เชื่อมดาวตามแนวสายตา",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 16.5,
    "imageFov": 0.412,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6205",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "16:41:41.63",
      "dec": "+36:27:40.7"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m5",
    "name": "กระจุกดาว M5",
    "nameEn": "Messier 5",
    "catalogId": "M5",
    "aliases": [
      "M5",
      "NGC5904",
      "NGC 5904"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 15.309375,
    "dec": 2.0826944444,
    "magnitude": 5.95,
    "magnitudeBand": "V",
    "constellationName": "งู (ส่วนหัว)",
    "description": "กระจุกดาวทรงกลมในส่วนหัวของกลุ่มดาวงู มีชื่อในแค็ตตาล็อกว่า NGC 5904",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 15.0,
    "imageFov": 0.375,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5904",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "15:18:33.75",
      "dec": "+02:04:57.7"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|K-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m15",
    "name": "กระจุกดาว M15",
    "nameEn": "Messier 15",
    "catalogId": "M15",
    "aliases": [
      "M15",
      "NGC7078",
      "NGC 7078"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 21.49955,
    "dec": 12.1668333333,
    "magnitude": 6.3,
    "magnitudeBand": "V",
    "constellationName": "ม้าบิน",
    "description": "กระจุกดาวทรงกลมในทิศกลุ่มดาวม้าบิน แสงที่เห็นมาจากดาวสมาชิกหลายดวง ไม่ใช่ดาวเดี่ยวที่มีขนาดใหญ่",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 11.1,
    "imageFov": 0.277,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC7078",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "21:29:58.38",
      "dec": "+12:10:00.6"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:3|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m22",
    "name": "กระจุกดาว M22",
    "nameEn": "Messier 22",
    "catalogId": "M22",
    "aliases": [
      "M22",
      "NGC6656",
      "NGC 6656"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 18.6067222222,
    "dec": -23.9034166667,
    "magnitude": null,
    "magnitudeBand": null,
    "constellationName": "คนยิงธนู",
    "description": "กระจุกดาวทรงกลมในทิศกลุ่มดาวคนยิงธนู หมายเลข M22 และ NGC 6656 ใช้เรียกวัตถุเดียวกัน",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 12.6,
    "imageFov": 0.315,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6656",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "18:36:24.20",
      "dec": "-23:54:12.3"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|K-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2",
    "magnitudeNote": "แหล่งข้อมูลไม่ได้ระบุความสว่างย่าน V สำหรับรายการนี้"
  },
  {
    "id": "ngc5139",
    "name": "กระจุกดาวโอเมกาเซนทอรี",
    "nameEn": "Omega Centauri",
    "catalogId": "NGC5139",
    "aliases": [
      "NGC5139",
      "NGC 5139",
      "Omega Centauri"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 13.4460805556,
    "dec": -47.4768611111,
    "magnitude": null,
    "magnitudeBand": null,
    "constellationName": "คนครึ่งม้า",
    "description": "กระจุกดาวทรงกลมในทิศกลุ่มดาวคนครึ่งม้า แม้ชื่อมีรูปแบบคล้ายชื่อดาว แต่แค็ตตาล็อกระบุว่าเป็นกระจุกดาว",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 27.0,
    "imageFov": 0.675,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC5139",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "13:26:45.89",
      "dec": "-47:28:36.7"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2",
    "magnitudeNote": "ยังไม่แสดงค่าความสว่าง เพราะค่า V ในแค็ตตาล็อกรายการนี้ยังต้องตรวจสอบเพิ่มเติม"
  },
  {
    "id": "ngc104",
    "name": "กระจุกดาว 47 ทูคานี",
    "nameEn": "47 Tucanae",
    "catalogId": "NGC104",
    "aliases": [
      "NGC104",
      "NGC0104",
      "NGC 104",
      "47 Tuc Cluster"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวทรงกลม",
    "ra": 0.4014888889,
    "dec": -72.0814444444,
    "magnitude": 4.09,
    "magnitudeBand": "V",
    "constellationName": "นกทูแคน",
    "description": "กระจุกดาวทรงกลมในทิศกลุ่มดาวนกทูแคน อยู่ไกลทางฟ้าใต้ จึงไม่ขึ้นเหนือขอบฟ้าจากบางพื้นที่ในซีกโลกเหนือ",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 31.8,
    "imageFov": 0.795,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0104",
    "sourceType": "GCl",
    "sourceCoordinates": {
      "ra": "00:24:05.36",
      "dec": "-72:04:53.2"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|J-Mag:2|H-Mag:2|K-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "ngc869",
    "name": "กระจุกดาวเอชเพอร์ซี",
    "nameEn": "h Persei Cluster",
    "catalogId": "NGC869",
    "aliases": [
      "NGC869",
      "NGC0869",
      "NGC 869",
      "h Persei Cluster"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวเปิด",
    "ra": 2.3162666667,
    "dec": 57.11725,
    "magnitude": 3.7,
    "magnitudeBand": "V",
    "constellationName": "เพอร์ซิอัส",
    "description": "กระจุกดาวเปิดในทิศกลุ่มดาวเพอร์ซิอัส อยู่ใกล้กระจุก NGC 884 บนท้องฟ้า แผนที่แสดงเป็นคนละรายการเพื่อให้พิกัดตรงกับแค็ตตาล็อก",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 14.4,
    "imageFov": 0.36,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0869",
    "sourceType": "OCl",
    "sourceCoordinates": {
      "ra": "02:18:58.56",
      "dec": "+57:07:02.1"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "ngc884",
    "name": "กระจุกดาวไคเพอร์ซี",
    "nameEn": "Chi Persei Cluster",
    "catalogId": "NGC884",
    "aliases": [
      "NGC884",
      "NGC0884",
      "NGC 884",
      "chi Persei Cluster"
    ],
    "type": "cluster",
    "kind": "กระจุกดาวเปิด",
    "ra": 2.3755833333,
    "dec": 57.1441111111,
    "magnitude": 3.8,
    "magnitudeBand": "V",
    "constellationName": "เพอร์ซิอัส",
    "description": "กระจุกดาวเปิดในทิศกลุ่มดาวเพอร์ซิอัส อยู่ใกล้กระจุก NGC 869 บนท้องฟ้า ทั้งสองรวมเป็นคู่เป้าหมายที่นิยมส่องด้วยกล้องสองตา",
    "observingTip": "เริ่มด้วยกล้องสองตาหรือกล้องโทรทรรศน์กำลังขยายต่ำ แล้วเพิ่มกำลังขยายเมื่อวัตถุอยู่สูงและฟ้ามืด",
    "angularSizeArcmin": 10.5,
    "imageFov": 0.263,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC0884",
    "sourceType": "OCl",
    "sourceCoordinates": {
      "ra": "02:22:32.10",
      "dec": "+57:08:38.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:5|B-Mag:2|V-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m1",
    "name": "เนบิวลาปู",
    "nameEn": "Crab Nebula",
    "catalogId": "M1",
    "aliases": [
      "M1",
      "NGC1952",
      "NGC 1952",
      "Crab Nebula"
    ],
    "type": "nebula",
    "kind": "ซากซูเปอร์โนวา",
    "ra": 5.5755472222,
    "dec": 22.0144722222,
    "magnitude": 8.4,
    "magnitudeBand": "V",
    "constellationName": "วัว",
    "description": "ซากซูเปอร์โนวาในทิศกลุ่มดาววัว แค็ตตาล็อกจำแนกเป็น SNR จึงเป็นวัตถุคนละประเภทกับเนบิวลาดาวเคราะห์",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 8.0,
    "imageFov": 0.2,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC1952",
    "sourceType": "SNR",
    "sourceCoordinates": {
      "ra": "05:34:31.97",
      "dec": "+22:00:52.1"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:9|MinAx:9|V-Mag:3"
  },
  {
    "id": "m42",
    "name": "เนบิวลานายพราน",
    "nameEn": "Orion Nebula",
    "catalogId": "M42",
    "aliases": [
      "M42",
      "NGC1976",
      "NGC 1976",
      "Great Orion Nebula",
      "Orion Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลาและกระจุกดาว",
    "ra": 5.5879111111,
    "dec": -5.3896666667,
    "magnitude": 4.0,
    "magnitudeBand": "V",
    "constellationName": "นายพราน",
    "description": "บริเวณเนบิวลาและกระจุกดาวในทิศกลุ่มดาวนายพราน แค็ตตาล็อกจัดเป็น Cl+N คือกระจุกดาวร่วมกับเนบิวลา",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 90.0,
    "imageFov": 2.25,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC1976",
    "sourceType": "Cl+N",
    "sourceCoordinates": {
      "ra": "05:35:16.48",
      "dec": "-05:23:22.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:9|MinAx:9|B-Mag:3|V-Mag:10|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m8",
    "name": "เนบิวลาลากูน",
    "nameEn": "Lagoon Nebula",
    "catalogId": "M8",
    "aliases": [
      "M8",
      "NGC6523",
      "NGC 6523",
      "Lagoon Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลา",
    "ra": 18.0614638889,
    "dec": -24.3801666667,
    "magnitude": 5.8,
    "magnitudeBand": "V",
    "constellationName": "คนยิงธนู",
    "description": "เนบิวลาในทิศกลุ่มดาวคนยิงธนู หมายเลข M8 และ NGC 6523 ระบุวัตถุเดียวกัน แสงกระจายกว้างกว่าจุดดาวเดี่ยว",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 45.0,
    "imageFov": 1.125,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6523",
    "sourceType": "Neb",
    "sourceCoordinates": {
      "ra": "18:03:41.27",
      "dec": "-24:22:48.6"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:9|MinAx:9|B-Mag:3|V-Mag:10|RadVel:2|Redshift:2"
  },
  {
    "id": "m20",
    "name": "เนบิวลาตรีแฉก",
    "nameEn": "Trifid Nebula",
    "catalogId": "M20",
    "aliases": [
      "M20",
      "NGC6514",
      "NGC 6514",
      "Trifid Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลา",
    "ra": 18.0450305556,
    "dec": -22.9718888889,
    "magnitude": 8.5,
    "magnitudeBand": "V",
    "constellationName": "คนยิงธนู",
    "description": "เนบิวลาในทิศกลุ่มดาวคนยิงธนู มีชื่อแค็ตตาล็อก NGC 6514 การดูรายละเอียดต่างจากภาพถ่ายต้องคำนึงถึงแสงรบกวนและกำลังของกล้อง",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 28.0,
    "imageFov": 0.7,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6514",
    "sourceType": "Neb",
    "sourceCoordinates": {
      "ra": "18:02:42.11",
      "dec": "-22:58:18.8"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:9|MinAx:9|B-Mag:3|V-Mag:10|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  },
  {
    "id": "m57",
    "name": "เนบิวลาวงแหวน",
    "nameEn": "Ring Nebula",
    "catalogId": "M57",
    "aliases": [
      "M57",
      "NGC6720",
      "NGC 6720",
      "Ring Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลาดาวเคราะห์",
    "ra": 18.8930583333,
    "dec": 33.0285833333,
    "magnitude": 8.8,
    "magnitudeBand": "V",
    "constellationName": "พิณ",
    "description": "เนบิวลาดาวเคราะห์ในทิศกลุ่มดาวพิณ คำว่าดาวเคราะห์เป็นชื่อประเภททางประวัติศาสตร์ วัตถุนี้เป็นก๊าซจากดาวฤกษ์ ไม่ใช่ดาวเคราะห์",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 1.27,
    "imageFov": 0.2,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6720",
    "sourceType": "PN",
    "sourceCoordinates": {
      "ra": "18:53:35.01",
      "dec": "+33:01:42.9"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:8|B-Mag:3|V-Mag:3|J-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2|Cstar B-Mag:8|Cstar V-Mag:8"
  },
  {
    "id": "m27",
    "name": "เนบิวลาดัมเบลล์",
    "nameEn": "Dumbbell Nebula",
    "catalogId": "M27",
    "aliases": [
      "M27",
      "NGC6853",
      "NGC 6853",
      "Dumbbell Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลาดาวเคราะห์",
    "ra": 19.9934388889,
    "dec": 22.7210277778,
    "magnitude": 7.4,
    "magnitudeBand": "V",
    "constellationName": "สุนัขจิ้งจอก",
    "description": "เนบิวลาดาวเคราะห์ในทิศกลุ่มดาวสุนัขจิ้งจอก เป็นวัตถุที่แสงแผ่เป็นบริเวณ ไม่ใช่จุดดาวฤกษ์บนแผนที่",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 6.7,
    "imageFov": 0.2,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6853",
    "sourceType": "PN",
    "sourceCoordinates": {
      "ra": "19:59:36.38",
      "dec": "+22:43:15.7"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:8|B-Mag:3|V-Mag:3|J-Mag:2|H-Mag:2|K-Mag:2|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2|Cstar U-Mag:8|Cstar B-Mag:8|Cstar V-Mag:8"
  },
  {
    "id": "m17",
    "name": "เนบิวลาโอเมกา",
    "nameEn": "Omega Nebula",
    "catalogId": "M17",
    "aliases": [
      "M17",
      "NGC6618",
      "NGC 6618",
      "Checkmark Nebula",
      "Lobster Nebula",
      "Swan Nebula",
      "omega Nebula"
    ],
    "type": "nebula",
    "kind": "เนบิวลา",
    "ra": 18.3464194444,
    "dec": -16.1715277778,
    "magnitude": 7.0,
    "magnitudeBand": "V",
    "constellationName": "คนยิงธนู",
    "description": "เนบิวลาในทิศกลุ่มดาวคนยิงธนู มีชื่อสามัญอีกชื่อว่า Swan Nebula และหมายเลข NGC 6618",
    "observingTip": "ใช้กล้องโทรทรรศน์ในบริเวณมืด สีและรายละเอียดที่เห็นด้วยตาอาจต่างจากภาพถ่ายเปิดรับแสงนาน",
    "angularSizeArcmin": 12.6,
    "imageFov": 0.315,
    "sourceCatalog": "OpenNGC",
    "sourceUrl": "https://github.com/mattiaverga/OpenNGC/blob/be3cd6c5498806a2fbb2f7e0452ef802dbb02be0/database_files/NGC.csv",
    "sourceId": "NGC6618",
    "sourceType": "Neb",
    "sourceCoordinates": {
      "ra": "18:20:47.11",
      "dec": "-16:10:17.5"
    },
    "sourceFields": "Type:1|RA:1|Dec:1|Const:99|MajAx:9|B-Mag:3|V-Mag:10|Pax:2|Pm-RA:2|Pm-Dec:2|RadVel:2|Redshift:2"
  }
];

export function deepSkyPositions(date, latitude, longitude) {
  return deepSkyObjects.map(object => ({
    ...object,
    ...equatorialToHorizontal(object.ra, object.dec, date, latitude, longitude),
  }));
}
