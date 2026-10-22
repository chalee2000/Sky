export const SURVEY_IMAGE_SERVICE = 'https://alasky.cds.unistra.fr/hips-image-services/hips2fits';
export const SURVEY_CREDIT = 'ภาพ: Digitized Sky Survey (DSS2) / STScI · ภาพสีและบริการ HiPS: CDS';

/** Real DSS2 survey cutout centered on the selected star's J2000 coordinates.
 * This is a photographic field, not a resolved photograph of a stellar surface.
 * RA is stored in hours in our catalog; hips2fits requires degrees.
 * Service API: https://astroquery.readthedocs.io/en/latest/hips2fits/hips2fits.html
 */
export function starImage(star) {
  if (!star?.id || !Number.isFinite(star.ra) || !Number.isFinite(star.dec) || star.ra < 0 || star.ra >= 24 || Math.abs(star.dec) > 90) {
    throw new RangeError('A catalog star with valid J2000 coordinates is required');
  }
  const raDegrees = Number((star.ra*15).toFixed(6));
  const fieldOfView = star.magnitude < 1 ? 0.5 : 0.3;
  const url = new URL(SURVEY_IMAGE_SERVICE);
  url.search = new URLSearchParams({
    hips: 'CDS/P/DSS2/color', width: '640', height: '640',
    fov: String(fieldOfView), projection: 'TAN', coordsys: 'icrs',
    ra: String(raDegrees), dec: String(star.dec), rotation: '0', format: 'jpg',
  }).toString();
  return { url: url.href, starId: star.id, raDegrees, decDegrees: star.dec, fieldOfView, survey: 'DSS2 color', credit: SURVEY_CREDIT };
}
