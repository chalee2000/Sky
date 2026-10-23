// A line drawing may borrow a neighbouring constellation's star (e.g.
// Alpheratz in the Great Square). Keep those separate from actual membership.
export function constellationStars(constellation, positions) {
  const members=positions.filter(star=>star.constellationId===constellation.id).sort((a,b)=>a.magnitude-b.magnitude);
  const references=positions.filter(star=>constellation.starIds.includes(star.id)&&star.constellationId!==constellation.id);
  return {members,references,visible:members.filter(star=>star.altitude>0).length};
}
