import { starScienceCatalog, starScienceSources } from './starScienceCatalog.js';

export const PARSEC_TO_LIGHT_YEARS = 3.26156;
export const nameSources = {
  alSufi: {
    label: 'Stellarium · ดาวตามบันทึกอัลศูฟี (HIP 88635)',
    url: 'https://github.com/Stellarium/stellarium/blob/master/skycultures/arabic_al-sufi/index.json',
  },
  modernIau: {
    label: 'Stellarium · Modern IAU (อ้างบัญชี IAU-CSN)',
    url: 'https://github.com/Stellarium/stellarium/blob/master/skycultures/modern_iau/index.json',
  },
  iau: {
    label: 'บัญชีชื่อดาว IAU-CSN',
    url: 'https://exopla.net/star-names/modern-iau-star-names/',
  },
};

// Translate only unambiguous luminosity classes. Keep qualifiers, ranges and
// composite spectra intact rather than inventing one type for a whole system.
export function spectralDescription(spectrum) {
  if (!spectrum) return 'ยังไม่มีการจัดประเภทในชุดข้อมูลนี้';
  if (/\+\s*[OBAFGKM]/.test(spectrum)) return 'สเปกตรัมประกอบของดาวหลายองค์ประกอบ';
  const color = { O:'สีฟ้า', B:'สีฟ้าขาว', A:'สีขาว', F:'สีขาวอมเหลือง', G:'สีเหลือง', K:'สีส้ม', M:'สีแดง' }[spectrum[0]];
  const match = spectrum.match(/^[OBAFGKM][\d.\-+:]*\s*(III|II|IV|V|I)([ab]*)/);
  if (!match || /-[IV]/.test(spectrum.slice(match.index + match[0].length))) return `ดาวฤกษ์สเปกตรัม ${spectrum[0]}`;
  const kind = { I:'ดาวมหายักษ์', II:'ดาวยักษ์สว่าง', III:'ดาวยักษ์', IV:'ดาวกึ่งยักษ์', V:'ดาวลำดับหลัก' }[match[1]];
  return `${kind}${color || ''}`;
}

export function getStarScience(star) {
  const catalog = starScienceCatalog[star.id];
  if (!catalog) throw new Error(`Missing scientific profile for ${star.id}`);
  const distanceLy = catalog.catalogDistanceParsecs * PARSEC_TO_LIGHT_YEARS;
  // Three significant figures avoid presenting catalog distances as exact.
  const distanceText = Number(distanceLy.toPrecision(3)).toLocaleString('th-TH');
  const source = `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(`HIP ${catalog.identifiers.hip}`)}`;
  return {
    ...catalog,
    starId: star.id,
    starType: spectralDescription(catalog.spectralType),
    magnitudeText: catalog.catalogMagnitude.toFixed(2),
    distanceLy,
    distanceText,
    distanceDiffers: Math.abs(distanceLy - star.distance) / distanceLy > .15,
    mapDistanceText: Number(star.distance).toLocaleString('th-TH'),
    nameMeaning: star.id === 'alnasl' ? 'ปลายลูกศร · รากศัพท์อาหรับ' : null,
    nameContext: star.id === 'alnasl' ? 'บันทึกดาวอัลศูฟีเรียกดาวดวงนี้ว่า “ดาวที่ปลายลูกศร” ชื่อบอกตำแหน่งในภาพจินตนาการของกลุ่มดาว ไม่ได้บอกว่าดาวมีรูปร่างเป็นลูกศร' : null,
    namingApprovalDate: null,
    references: catalog.sourceIds.map(id => ({ id, ...starScienceSources[id] })),
    source,
  };
}
