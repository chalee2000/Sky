# Planet maps from NASA's 3D resource archive

These five original JPEG files were downloaded, without image edits, from the official [`nasa/NASA-3D-Resources`](https://github.com/nasa/NASA-3D-Resources) repository on 2026-10-23. Exact upstream paths, dimensions, byte sizes, checksums, and object-specific caveats are in [`manifest.json`](manifest.json).

Credit: **NASA / NASA-3D-Resources**.

The upstream README states: “These assets are free and without copyright.” The repository's `meta.json` separately labels the repository “NASA Open Source Agreement Version 1.3”. Neither source provides a separate license or acquisition metadata for each JPEG. See the [upstream README](https://github.com/nasa/NASA-3D-Resources/blob/master/README.md), [repository metadata](https://github.com/nasa/NASA-3D-Resources/blob/master/meta.json), and [NASA images and media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). Use of these files does not imply NASA endorsement.

## What these maps establish

They are official NASA-distributed **texture assets for visualization**. The archive does not identify the observing mission, acquisition date, color calibration, or provenance of every feature in these specific files. They must not be described as current disk photographs or scientifically calibrated true-color maps. A spherical display of a map is a 3D visualization, not a 3D photograph or a measured terrain mesh.

- `mars.jpg`: surface map, 1440 × 720.
- `jupiter.jpg`: cloud bands and Great Red Spot visualization, 720 × 360. The clouds and storm change over time.
- `saturn.jpg`: cloud-band visualization, 720 × 360. No ring texture is included.
- `neptune.jpg`: strongly processed blue visualization, 720 × 360. It does not establish Neptune's natural visible color or measured detail at every longitude.
- `venus.jpg`: orange surface-relief visualization, 1440 × 720, consistent with a radar-derived surface map. It is **not a visible-light cloud-top photograph**; Venus's opaque cloud cover hides its surface in visible light. The source does not document a specific mission for this file, so no mission attribution is asserted here. A UI should explicitly call it a surface visualization beneath the clouds.

No verified Mercury, Uranus, or Saturn-ring texture is bundled. Do not substitute another body's surface or claim an untextured sphere is a survey photograph.

Suggested Thai credit: “แผนที่ภาพสำหรับงาน 3 มิติ: NASA / NASA-3D-Resources”

Suggested Thai limitation: “แบบจำลองจากแผนที่ภาพที่ NASA เผยแพร่สำหรับงาน 3 มิติ สีและรายละเอียดผ่านการประมวลผล ไม่ใช่ภาพถ่ายสดหรือการยืนยันสีที่ตาเห็นโดยตรง”
