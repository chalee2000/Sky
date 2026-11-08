import { SURVEY_CREDIT, SURVEY_IMAGE_SERVICE } from './starImages.js';

/** DSS2 image centered on the object's J2000 coordinates, with a field in degrees. */
export function deepSkyImage(object) {
  if (!object?.id || !Number.isFinite(object.ra) || object.ra < 0 || object.ra >= 24
    || !Number.isFinite(object.dec) || Math.abs(object.dec) > 90
    || !Number.isFinite(object.imageFov) || object.imageFov <= 0 || object.imageFov > 20) {
    throw new RangeError('A deep sky object with valid coordinates and image field is required');
  }
  const raDegrees = Number((object.ra * 15).toFixed(6));
  const url = new URL(SURVEY_IMAGE_SERVICE);
  url.search = new URLSearchParams({
    hips: 'CDS/P/DSS2/color', width: '800', height: '800',
    fov: String(object.imageFov), projection: 'TAN', coordsys: 'icrs',
    ra: String(raDegrees), dec: String(object.dec), rotation: '0', format: 'jpg',
  }).toString();
  return { url: url.href, objectId: object.id, raDegrees, decDegrees: object.dec,
    fieldOfView: object.imageFov, survey: 'DSS2 color', credit: SURVEY_CREDIT };
}
