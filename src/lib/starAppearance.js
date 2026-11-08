// Display scaling, not angular diameters or calibrated photometry. Catalog
// magnitudes order the brightness; color is the catalog's approximate hue.
export function starAppearance(magnitude) {
  const mag=Number.isFinite(magnitude)?magnitude:6;
  const strength=Math.max(0,Math.min(1,(4-mag)/5.5));
  return {
    coreRadius: .65+1.45*strength,
    haloRadius: 4+9*strength,
    haloOpacity: .07+.14*strength,
    coreOpacity: .72+.28*strength,
  };
}
