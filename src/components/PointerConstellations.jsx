import './PointerConstellations.css';

const overlaps = (a, b, gap = 4) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
const textWidth = (text, size) => [...text].filter(character => !/\p{M}/u.test(character)).length * size * .59;
const finitePoint = point => point && Number.isFinite(point.x) && Number.isFinite(point.y);

// Labels follow the projected catalog positions. Offsets only separate text;
// they never change a star position or add lines absent from the catalog.
function layoutLabels(groups, projectedStars, width, height, selectedGroup, starLabelIds) {
  const small = width < 500;
  const titleSize = small ? 11 : 12;
  const subtitleSize = small ? 9 : 10;
  const occupied = projectedStars.filter(star => star.point?.visible).flatMap(star => [
    { x:star.point.x - 6, y:star.point.y - 6, width:12, height:12 },
    ...(starLabelIds.has(star.id) ? [{ x:star.point.x + 8, y:star.point.y - 23, width:textWidth(star.name || star.nameEn || '', 11) + 5, height:17 }] : []),
  ]);
  const placed = [];
  const candidates = groups.map(group => {
    const members = projectedStars.filter(star => group.starIds.includes(star.id) && star.point?.visible);
    if (members.length < 2) return null;
    const center = members.reduce((sum, star) => ({ x:sum.x + star.point.x / members.length, y:sum.y + star.point.y / members.length }), { x:0, y:0 });
    return { group, center, count:members.length };
  }).filter(Boolean).sort((a, b) => Number(b.group.id === selectedGroup) - Number(a.group.id === selectedGroup) || b.count - a.count);

  for (const { group, center } of candidates) {
    const title = `กลุ่มดาว${group.name}`;
    const boxWidth = Math.min(width - 20, Math.max(textWidth(title, titleSize), textWidth(group.nameEn, subtitleSize)) + 12);
    const offsets = [[0,-30],[0,32],[56,-23],[-56,-23],[0,-58],[0,60],[72,27],[-72,27],[0,-86],[0,86]];
    for (const [dx, dy] of offsets) {
      const x = Math.max(10 + boxWidth / 2, Math.min(width - 10 - boxWidth / 2, center.x + dx));
      const y = Math.max(20, Math.min(height - 23, center.y + dy));
      const box = { x:x - boxWidth / 2, y:y - titleSize, width:boxWidth, height:titleSize + subtitleSize + 8 };
      if (occupied.some(other => overlaps(box, other)) || placed.some(other => overlaps(box, other.box, 9))) continue;
      placed.push({ group, title, x, y, box, titleSize, subtitleSize });
      break;
    }
  }
  return placed;
}

export default function PointerConstellations({ projectedStars, constellations, selectedStarId, width, height, starLabelIds, showLabels = true, nightMode = false }) {
  const byId = new Map(projectedStars.map(star => [star.id, star]));
  const selectedGroup = byId.get(selectedStarId)?.constellationId;
  const maxSegment = Math.hypot(width, height) * 1.7;
  const labels = showLabels && width > 100 && height > 80 ? layoutLabels(constellations, projectedStars, width, height, selectedGroup, starLabelIds) : [];

  return <g className={`pointer-constellation-layer${nightMode ? ' pointer-constellation-night' : ''}`} aria-hidden="true">
    <g className="pointer-constellation-lines">
      {constellations.map(group => <g key={group.id} data-constellation-lines={group.id} className={group.id === selectedGroup ? 'is-selected' : undefined}>
        {group.lines.map(([a, b], index) => {
          const first = byId.get(a)?.point;
          const second = byId.get(b)?.point;
          if (!finitePoint(first) || !finitePoint(second)) return null;
          if (Math.hypot(first.x - second.x, first.y - second.y) > maxSegment) return null;
          if (Math.max(first.x, second.x) < 0 || Math.min(first.x, second.x) > width || Math.max(first.y, second.y) < 0 || Math.min(first.y, second.y) > height) return null;
          return <line key={`${a}-${b}-${index}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} />;
        })}
      </g>)}
    </g>
    {labels.map(({ group, title, x, y, titleSize, subtitleSize }) => <g key={group.id} className={`pointer-constellation-name${group.id === selectedGroup ? ' is-selected' : ''}`} data-constellation-label={group.id}>
      <text x={x} y={y} textAnchor="middle" fontSize={titleSize}>{title}</text>
      <text x={x} y={y + 14} textAnchor="middle" fontSize={subtitleSize} className="pointer-constellation-english">{group.nameEn}</text>
    </g>)}
  </g>;
}
