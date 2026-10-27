import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { constellations, equatorialToHorizontal, stars } from '../lib/astronomy';
import './SkyMap.css';
import { PlanetMarker } from './Planets.jsx';
import useMapGestures from '../hooks/useMapGestures.js';

const WIDTH = 900;
const HEIGHT = 560;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const RADIUS = 247;
const RAD = Math.PI / 180;

function project(altitude, azimuth, rotation, zoom, pan = {x:0,y:0}) {
  const radius = ((90 - altitude) / 90) * RADIUS * zoom;
  const angle = (azimuth + rotation) * RAD;
  return { x: CX + pan.x - radius * Math.sin(angle), y: CY + pan.y - radius * Math.cos(angle) };
}

function colorForIndex(value) {
  const index = Number(value);
  if (!Number.isFinite(index)) return '#e8eaff';
  if (index < 0.1) return '#b9d2ff';
  if (index < 0.5) return '#eef1ff';
  if (index < 1) return '#fff2d4';
  return '#ffc38e';
}

export default function SkyMap({
  date,
  location,
  showLines = true,
  showLabels = true,
  selectedStarId,
  onSelectStar,
  zoom = 1,
  onZoomChange,
  nightMode = false,
  planets = [],
  selectedPlanetId,
  onSelectPlanet,
}) {
  const uid = useId().replaceAll(':', '');
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);
  const svgRef = useRef(null);
  const latitude = location?.latitude ?? 13.7563;
  const longitude = location?.longitude ?? 100.5018;
  const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const { rotation, pan, dragging, safeZoom, reset:resetView, handlers } = useMapGestures({
    svgRef, zoom, onZoomChange, onSelectStar, onSelectPlanet, center:{x:CX,y:CY}, radius:RADIUS,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/stars.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      })
      .then((rows) => {
        if (!Array.isArray(rows) || !rows.every((row) => Array.isArray(row) && row.length >= 3)) {
          throw new Error('Invalid star catalog');
        }
        setCatalog(rows);
        setCatalogError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCatalogError(true);
      });
    return () => controller.abort();
  }, []);

  const horizontalStars = useMemo(() => {
    const observationDate = new Date(timestamp);
    return stars.map((star) => ({
      ...star,
      ...equatorialToHorizontal(star.ra, star.dec, observationDate, latitude, longitude),
    }));
  }, [timestamp, latitude, longitude]);

  const backgroundStars = useMemo(() => {
    const observationDate = new Date(timestamp);
    return catalog.map(([ra, dec, magnitude, bv]) => ({
      magnitude,
      color: colorForIndex(bv),
      ...equatorialToHorizontal(ra, dec, observationDate, latitude, longitude),
    })).filter((star) => star.altitude >= 0);
  }, [catalog, timestamp, latitude, longitude]);

  const projectedStars = useMemo(() => horizontalStars.map((star) => ({
    ...star,
    ...project(star.altitude, star.azimuth, rotation, safeZoom, pan),
  })), [horizontalStars, rotation, safeZoom, pan]);
  const byId = useMemo(() => new Map(projectedStars.map((star) => [star.id, star])), [projectedStars]);
  const visibleStars = projectedStars.filter((star) => star.altitude >= 0 && Math.hypot(star.x - CX, star.y - CY) < RADIUS - 2);
  const selectedStar = byId.get(selectedStarId);
  const accent = nightMode ? '#e88474' : '#aaa3ff';

  return (
    <div data-zoom={safeZoom} data-pan-x={pan.x} data-pan-y={pan.y} data-rotation={rotation} className={`sky-map ${dragging ? 'is-dragging' : ''} ${nightMode ? 'sky-map-red' : ''}`}>
      <svg
        ref={svgRef}
        viewBox={`175 0 550 ${HEIGHT}`}
        className="sky-map-svg"
        role="group"
        tabIndex={0}
        aria-label="แผนที่ดาวเหนือขอบฟ้า กางสองนิ้วเพื่อซูม ลากเพื่อหมุน หรือเลื่อนเมื่อขยาย ใช้ปุ่มบวกลบและลูกศรได้"
        {...handlers}
      >
        <defs>
          <radialGradient id={`${uid}-sky`}>
            <stop offset="0" stopColor={nightMode ? '#26161b' : '#17203b'} stopOpacity="0.82" />
            <stop offset="0.68" stopColor={nightMode ? '#1d1117' : '#10182e'} stopOpacity="0.6" />
            <stop offset="1" stopColor="#0c1020" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id={`${uid}-glow`}>
            <stop offset="0" stopColor={accent} stopOpacity="0.48" />
            <stop offset="0.25" stopColor={accent} stopOpacity="0.18" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}><circle cx={CX} cy={CY} r={RADIUS} /></clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={RADIUS + 11} fill="none" stroke={accent} strokeOpacity="0.045" />
        <circle cx={CX} cy={CY} r={RADIUS} fill={`url(#${uid}-sky)`} stroke={accent} strokeOpacity="0.18" />

        <g clipPath={`url(#${uid}-clip)`}>
          {[30, 60].map((altitude) => (
            <circle key={altitude} cx={CX+pan.x} cy={CY+pan.y} r={((90 - altitude) / 90) * RADIUS * safeZoom} fill="none" stroke={accent} strokeOpacity="0.09" strokeDasharray="2 6" />
          ))}
          {Array.from({ length: 12 }, (_, i) => {
            const point = project(0, i * 30, rotation, safeZoom, pan);
            return <line key={i} x1={CX+pan.x} y1={CY+pan.y} x2={point.x} y2={point.y} stroke={accent} strokeOpacity="0.045" />;
          })}

          <g aria-hidden="true">
            {backgroundStars.map((star, i) => {
              const { x, y } = project(star.altitude, star.azimuth, rotation, safeZoom, pan);
              if (Math.hypot(x - CX, y - CY) > RADIUS) return null;
              return <circle key={i} cx={x} cy={y} r={Math.max(0.4, 1.75 - star.magnitude * 0.22)} fill={nightMode ? '#d69c92' : star.color} opacity={Math.min(0.84, Math.max(0.18, 1.05 - star.magnitude * 0.115))} />;
            })}
          </g>

          {showLines && <g className="constellation-lines" aria-hidden="true">
            {constellations.map((constellation) => <g key={constellation.id}>
              {constellation.lines.map(([start, end], i) => {
                const a = byId.get(start);
                const b = byId.get(end);
                if (!a || !b || (a.altitude < 0 && b.altitude < 0)) return null;
                const highlighted = selectedStar?.constellationId === constellation.id;
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={accent} strokeWidth={highlighted ? 1.1 : 0.8} strokeOpacity={highlighted ? 0.7 : 0.32} />;
              })}
            </g>)}
          </g>}

          {showLines && showLabels && constellations.map((constellation) => {
            const members = constellation.starIds.map((id) => byId.get(id)).filter((star) => star && star.altitude > 8 && Math.hypot(star.x - CX, star.y - CY) < RADIUS - 28);
            if (members.length < 3) return null;
            const x = members.reduce((sum, star) => sum + star.x, 0) / members.length;
            const y = members.reduce((sum, star) => sum + star.y, 0) / members.length;
            return <text key={constellation.id} x={x} y={y + 23} className="constellation-label" textAnchor="middle" fill={accent} opacity="0.6">{constellation.nameEn.toUpperCase()}</text>;
          })}

          {visibleStars.map((star) => {
            const isSelected = star.id === selectedStarId;
            const isHovered = star.id === hoveredStar;
            const radius = Math.max(1.25, 2.7 - star.magnitude * 0.38);
            const color = nightMode ? '#edb4a6' : (star.color || '#e8eeff');
            return (
              <g
                key={star.id}
                data-star={star.id}
                className={`map-star ${isSelected ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${star.name} (${star.nameEn}) สูง ${Math.round(star.altitude)} องศา`}
                aria-pressed={isSelected}
                onClick={() => onSelectStar?.(star.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectStar?.(star.id);
                  }
                }}
                onMouseEnter={() => setHoveredStar(star.id)}
                onMouseLeave={() => setHoveredStar(null)}
                onFocus={() => setHoveredStar(star.id)}
                onBlur={() => setHoveredStar(null)}
              >
                <title>{star.name} · {star.nameEn}</title>
                {(star.magnitude < 1.1 || isSelected) && <circle cx={star.x} cy={star.y} r={isSelected ? 32 : 12} fill={`url(#${uid}-glow)`} aria-hidden="true" />}
                {isSelected && <>
                  <circle cx={star.x} cy={star.y} r="13" fill="none" stroke={accent} strokeWidth="0.9" opacity="0.8" />
                  <circle cx={star.x} cy={star.y} r="19" fill="none" stroke={accent} strokeWidth="0.65" strokeDasharray="2 5" opacity="0.5" />
                </>}
                {isHovered && !isSelected && <circle cx={star.x} cy={star.y} r="11" fill={accent} fillOpacity="0.08" stroke={accent} strokeOpacity="0.6" strokeWidth="0.7" />}
                <circle cx={star.x} cy={star.y} r={radius} fill={color} />
                {star.magnitude < 0.7 && <path d={`M${star.x - 5} ${star.y}h10 M${star.x} ${star.y - 5}v10`} stroke={color} strokeOpacity="0.35" strokeWidth="0.6" aria-hidden="true" />}
                {(showLabels && star.magnitude < 1.7 || isSelected || isHovered) && <text x={star.x + (isSelected ? 22 : 9)} y={star.y - 8} className={`star-label ${isSelected ? 'selected-label' : ''}`} fill={isSelected ? '#e9e6ff' : '#a6aec8'}>{star.nameEn}</text>}
                <circle cx={star.x} cy={star.y} r="10" fill="transparent" className="star-hit-area" />
              </g>
            );
          })}
          {planets.filter(planet=>planet.altitude>=0).map(planet=>{
            const point=project(planet.altitude,planet.azimuth,rotation,safeZoom,pan);
            if(Math.hypot(point.x-CX,point.y-CY)>RADIUS-2)return null;
            return <PlanetMarker key={planet.id} planet={planet} x={point.x} y={point.y} selected={selectedPlanetId===planet.id} onSelect={onSelectPlanet} showLabels={showLabels} nightMode={nightMode}/>;
          })}
        </g>

        <g aria-hidden="true">
          {Array.from({ length: 72 }, (_, i) => {
            const a = project(0, i * 5, rotation, 1);
            const b = project(i % 6 === 0 ? -2 : -1, i * 5, rotation, 1);
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={accent} strokeOpacity={i % 6 === 0 ? 0.35 : 0.13} strokeWidth="0.8" />;
          })}
          {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([label, azimuth]) => {
            const { x, y } = project(-7, azimuth, rotation, 1);
            return <text key={label} x={x} y={y + 4} className={`compass-label ${label === 'N' ? 'north' : ''}`} fill={label === 'N' ? accent : '#79829e'} textAnchor="middle">{label}</text>;
          })}
          <path d={`M${CX+pan.x - 4} ${CY+pan.y}h8 M${CX+pan.x} ${CY+pan.y - 4}v8`} stroke={accent} strokeOpacity="0.3" strokeWidth="0.6" />
        </g>
      </svg>
      {catalogError && <p className="map-catalog-status" role="status">โหลดแค็ตตาล็อกไม่ได้ · แสดงเฉพาะดาวเด่น</p>}
      <div className="map-orientation-note" aria-hidden="true"><span className="map-orientation-dot" />มุมมองเมื่อเงยหน้ามองท้องฟ้า</div>
      <button type="button" className="map-reset" onClick={resetView} title="คืนการหมุนและระดับซูม">N <span>↑</span> คืนมุมมอง</button>
    </div>
  );
}
