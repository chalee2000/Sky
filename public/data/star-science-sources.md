# Sky scientific star metadata: sources and attribution

`src/lib/starScienceCatalog.js` contains a 78-entry adapted subset for the named stars in Sky. The app's existing magnitude, distance, coordinates, and star IDs have not been replaced by this data addition. `catalogMagnitude` and `catalogDistanceParsecs` supply the scientific storytelling measurements, explicitly labeled HYG v4.1. The map retains its existing approximate values. The story card flags distance differences greater than 15% rather than silently mixing estimates. Light-years are calculated as parsecs × 3.26156 and rounded to three significant figures. These historical catalog measurements are not a claim of current research consensus.

## Spectral classifications

Source: Hoffleit, D. and Warren, W. H., Jr. (1991), **The Bright Star Catalogue, 5th Revised Edition (Preliminary Version)**, catalog **V/50**.

- Catalog description: https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html
- Accessible original-data mirror used: https://github.com/frostoven/BSC5P-JSON/blob/1018c1d32c85cd02d7bbdade5726bc828f5388bd/original_bsc5p/catalog
- Original format documentation: https://github.com/frostoven/BSC5P-JSON/blob/1018c1d32c85cd02d7bbdade5726bc828f5388bd/original_bsc5p/ReadMe
- Original catalog SHA-256: `69797549cc1605aad7ff94e9325e29a1661f2a253917faaa056d9bf20b809afd`

The `spectralType` strings are copied verbatim from columns 128–147 of the original catalog file. The mirror's JSON conversion was cross-checked against those original columns for all 78 entries. HD identifiers were also checked directly against columns 26–31. These are historical catalog classifications, not an assertion that they represent the latest literature classification.

Spectra can refer to a primary component or a composite spectrum. The app may display the combined brightness of a system while BSC5 has a row for one component (notably Castor, Acrux, Algieba, and Almach). Preserve this distinction. A plus sign inside a spectral string does not always mean two stars: for example `K1+IIIb` is a classification qualifier, whereas `G5IIIe+G0III` explicitly combines spectral types. Do not infer stellar system membership solely by splitting every plus sign.

The BSC mirror releases its conversion scripts under CC0 but explicitly leaves the catalog data subject to the source's terms. Sky does not relabel the original catalog as CC0. Credit Hoffleit and Warren and retain the data-source links. This research has made use of the VizieR catalogue access tool, CDS, Strasbourg, France (DOI: 10.26093/cds/vizier).

## Designations and cross-identifiers

Source: **HYG Database v4.1**, David Nash / Astronexus and the constituent catalog authors.

- Version documentation: https://github.com/astronexus/HYG-Database/blob/c7f7f883fe678cc7680169a50ccd7dcc49b060ce/hyg/README.md
- CSV: https://raw.githubusercontent.com/astronexus/HYG-Database/c7f7f883fe678cc7680169a50ccd7dcc49b060ce/hyg/CURRENT/hygdata_v41.csv
- CSV SHA-256: `d9f69fd86bbf90a4e4d52b4c5c53eacfa6dfc0bfdef85bfd94f095e0bebe4ebd`
- License: **Creative Commons Attribution–ShareAlike 4.0 International** — https://creativecommons.org/licenses/by-sa/4.0/
- Attribution/license notice: `public/licenses/HYG-CC-BY-SA-4.0.txt`

Changes made for Sky: selected 78 matching rows, expanded the abbreviated Bayer designations into Greek-letter names and constellation genitives, added Greek symbols, linked records by HR and HD to BSC5, and added explanatory notes. The adapted HYG-derived database fields in this subset are made available under CC BY-SA 4.0. This notice does not change the license of independent application code.

Matching used the app's rounded J2000 RA/Dec against HYG J2000 coordinates. All 78 nearest matches are within 3.028 arcseconds. The source HIP/HD/HR identifiers and raw Bayer/Flamsteed strings are retained, along with the match separation. BSC5 was joined using **both HR and HD**, avoiding a name-only match and the risk of confusing names shared by different stars.

HYG's `proper` field is retained as `catalogName`; it is not presented as independently verified IAU approval. HYG v4.1 itself includes some explicitly unofficial companion names. The name Aljanah corresponds to Epsilon Cygni at the app's `gienah` coordinates; Gienah can instead resolve to Gamma Corvi in name searches. The app's `wei` coordinates correspond to Epsilon Scorpii, listed as Larawag in HYG. Bayer identifiers are safer lookup keys for these entries.

HYG spectral strings are retained separately as `hygSpectralType` for inspection, not used as the main spectral classification: some entries describe a companion or ambiguous composite (for example Capella, Dubhe, Almach, and Sheliak). BSC5 supplies the displayed `spectralType` consistently.

## Alnasl example

The matched entry is **Gamma² Sagittarii (γ² Sgr)**, HIP 88635 / HD 165135 / HR 6746. HYG v4.1 gives V = 2.98 and distance 29.7 parsecs (about 96.9 light-years). BSC5 and HYG v4.1 both list K0III; BSC5 lists V = 2.99. Other literature classifications should be attributed separately instead of silently treating K0III and K1III as an identical value. This catalog module does not supply an etymology or a naming-approval date.

Retrieved and cross-checked for Sky on 2026-10-28. The linked primary HEASARC page was unavailable from the execution environment; the cited original-data mirror and original format documentation were read directly. Values were not presented as live measurements.

## Alnasl historical naming and storytelling

The historical description “star on the point of the arrow” for HIP 88635 is documented in Stellarium's al-Sufi sky culture:
- https://github.com/Stellarium/stellarium/blob/master/skycultures/arabic_al-sufi/index.json
- https://github.com/Stellarium/stellarium/blob/master/skycultures/arabic_al-sufi/description.md

The cited entry contains Arabic الذي على نصل السهم. The app provides a brief factual Thai summary of the arrow-point meaning; the story itself is original fictional dialogue. The sky culture credits al-Sufi, Paul Kunitzsch's The Arabs and the Stars (1989), and Khalid al-Ajaji's critical edition (2021); its documentation license is CC BY-ND 4.0. The full licensed text is not reproduced or adapted here.

Stellarium's Modern IAU catalog lists Alnasl for the same HIP identifier and references IAU-CSN:
- https://github.com/Stellarium/stellarium/blob/master/skycultures/modern_iau/index.json
- https://github.com/Stellarium/stellarium/blob/master/skycultures/modern_iau/description.md
- https://exopla.net/star-names/modern-iau-star-names/

These retrieved Stellarium entries do not provide the exact naming approval date. The primary IAU page was inaccessible in the execution environment. The app therefore does not assert 2016-08-21 as independently verified, and leaves `namingApprovalDate` null. This is not evidence of a different approval date. No unsupported translations are supplied for other star names. Composite spectra (including B2IV+B) and qualifiers such as K1+IIIb are distinguished in the Thai summary.
