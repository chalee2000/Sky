// Lay out text around catalog positions; the positions themselves never move.
export const overlaps = (a, b, gap = 4) => a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
export const textWidth = (text, size = 11) => [...text].filter(c => !/\p{M}/u.test(c)).length * size * .63;

export function layoutSkyLabels(items, width, height, { reserved = [], allowed = () => true } = {}) {
  const placements = new Map();
  const boxes = [...reserved];
  for (const item of [...items].sort((a, b) => b.priority - a.priority)) {
    const w = Math.min(width - 20, textWidth(item.text, item.size || 11) + 8);
    const h = (item.size || 11) + 6;
    const offsets = [[12,-11,'start'],[-12,-11,'end'],[12,20,'start'],[-12,20,'end'],[0,-23,'middle'],[0,31,'middle']];
    for (const [dx,dy,anchor] of offsets) {
      const x=item.x+dx, y=item.y+dy;
      const box={x:x-(anchor==='end'?w:anchor==='middle'?w/2:0),y:y-h+3,width:w,height:h};
      if(box.x<8||box.x+w>width-8||box.y<8||box.y+h>height-8||!allowed(box)||boxes.some(other=>overlaps(box,other)))continue;
      placements.set(item.id,{x,y,anchor,box});boxes.push(box);break;
    }
  }
  return { placements, boxes };
}
