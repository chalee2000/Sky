# Background star catalog

The background sky contains **15,544 catalog stars** with apparent magnitude
`mag <= 7`, including all 5,044 stars in the previous magnitude-6 catalog.
These are catalog positions, not randomly generated points. The rendering
limit varies with zoom; inclusion does not mean an object is visible to the
unaided eye at the observer's location.

## Source and license

- Project: d3-celestial by Olaf Frohn.
- Snapshot commit: `7e720a3de062059d4c5400a379146a601d9010e0`.
- Source file: [data/stars.8.json](https://github.com/ofrohn/d3-celestial/blob/7e720a3de062059d4c5400a379146a601d9010e0/data/stars.8.json).
- Raw download: <https://raw.githubusercontent.com/ofrohn/d3-celestial/7e720a3de062059d4c5400a379146a601d9010e0/data/stars.8.json>.
- Source SHA-256: `e3ec6cde89bae0dde064d91c1edb9ec53c3c40d5c12fdf5d30f9a4de5dbc2143`.
- Source file has 41,411 features before filtering.
- License: [BSD-3-Clause](LICENSE-d3-celestial.txt), copyright Olaf Frohn.
  The unchanged license is included with the distributed data.

## Transformation

For every source feature whose `properties.mag <= 7`, `stars.json` stores:

```text
[rightAscensionHours, declinationDegrees, apparentMagnitude, bvColorIndex]
```

- Right ascension is the source GeoJSON longitude normalized to `[0, 360)`,
  divided by 15 and rounded to six decimal places.
- Declination, magnitude and B−V color index are copied without alteration.
- Source order is retained. All previous magnitude-6 rows retain exactly
  the same coordinates, brightness, color value and relative order.
- Magnitudes range from −1.44 to 7.00. There are 10,500 additional stars with
  `6 < mag <= 7`.
- B−V remains a source string; 13 records have an empty color index. An empty
  index is missing data, not a measured value of zero.
- Coordinates are the source catalog's J2000 positions. The app does not apply
  proper motion or precession and is intended for general sky exploration.

## Verification

Run `node scripts/verify-star-catalog.mjs` to validate the shipped catalog's
schema, coordinate ranges, duplicate rows and bright/faint counts. To verify
every value against the pinned original, download the raw file above and run:

```sh
node scripts/verify-star-catalog.mjs /path/to/stars.8.json
```

The second form checks the original file's SHA-256 and compares the complete
transformation with the shipped data. It does not fetch or modify files.
