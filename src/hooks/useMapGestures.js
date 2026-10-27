import { useLayoutEffect, useRef, useState } from 'react';
import { clampMapPan, clampMapZoom, zoomMapAtPoint } from '../lib/mapGestures.js';
import useWheelZoom from './useWheelZoom.js';

export default function useMapGestures({ svgRef, zoom, onZoomChange, onSelectStar, onSelectPlanet, center, radius }) {
  const [transform, setTransform] = useState({ pan:{x:0,y:0}, rotation:0 });
  const [dragging, setDragging] = useState(false);
  const view = useRef({ ...transform, zoom:clampMapZoom(zoom) });
  const pointers = useRef(new Map());
  const baseline = useRef(null);
  const moved = useRef(false);
  const safeZoom = clampMapZoom(zoom);

  useLayoutEffect(() => {
    if (safeZoom !== view.current.zoom) {
      const pan = clampMapPan(view.current.pan, safeZoom, radius);
      view.current = { ...view.current, zoom:safeZoom, pan };
      setTransform({ pan, rotation:view.current.rotation });
    }
  }, [safeZoom, radius]);

  const point = event => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return {x:center.x,y:center.y};
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return {x:p.x,y:p.y};
  };
  const commit = next => {
    const newZoom = clampMapZoom(next.zoom);
    const pan = clampMapPan(next.pan, newZoom, radius);
    view.current = { ...next, zoom:newZoom, pan };
    setTransform({ pan, rotation:next.rotation });
    onZoomChange?.(newZoom);
  };
  const rebase = () => {
    const all = [...pointers.current.values()];
    if (!all.length) { baseline.current = null; return; }
    const current = view.current;
    if (all.length > 1) {
      const [a,b] = all;
      baseline.current = { ...current, midpoint:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}, distance:Math.hypot(a.x-b.x,a.y-b.y) };
    } else baseline.current = { ...current, start:{x:all[0].x,y:all[0].y} };
  };
  const pointerDown = event => {
    if (event.button !== 0) return;
    if (!pointers.current.size) moved.current = false;
    const target = event.target.closest('[data-star],[data-planet]');
    pointers.current.set(event.pointerId, { ...point(event), star:target?.dataset.star, planet:target?.dataset.planet });
    // Capture on the stable SVG; moving stars can otherwise lose pointer capture
    // when they are clipped out of the viewport during a pan.
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size > 1) moved.current = true;
    rebase();
  };
  const pointerMove = event => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous || !baseline.current) return;
    event.preventDefault();
    pointers.current.set(event.pointerId, { ...previous, ...point(event) });
    const all = [...pointers.current.values()];
    const start = baseline.current;
    if (all.length > 1 && start.midpoint) {
      const [a,b] = all;
      const distance = Math.hypot(a.x-b.x,a.y-b.y);
      if (start.distance < 1) return;
      const nextZoom = clampMapZoom(start.zoom * distance / start.distance);
      const nextMidpoint = {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      const anchored = zoomMapAtPoint(start.pan, start.zoom, nextZoom, start.midpoint, center);
      moved.current = true;
      setDragging(true);
      commit({ ...start, zoom:nextZoom, pan:{x:anchored.x+nextMidpoint.x-start.midpoint.x,y:anchored.y+nextMidpoint.y-start.midpoint.y} });
    } else if (start.start) {
      const dx = all[0].x - start.start.x, dy = all[0].y - start.start.y;
      if (!moved.current && Math.hypot(dx,dy) < 5) return;
      moved.current = true;
      setDragging(true);
      if (start.zoom > 1.001) commit({ ...start, pan:{x:start.pan.x+dx,y:start.pan.y+dy} });
      else commit({ ...start, rotation:(start.rotation+dx/550*180)%360 });
    }
  };
  const pointerEnd = (event, cancelled = false) => {
    const pointer = pointers.current.get(event.pointerId);
    if (!pointer) return;
    const tapped = !cancelled && !moved.current && pointers.current.size === 1;
    pointers.current.delete(event.pointerId);
    // Delete before release, because release emits lostpointercapture.
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) moved.current = true;
    rebase();
    if (!pointers.current.size) setDragging(false);
    if (tapped) {
      if (pointer.star) onSelectStar?.(pointer.star);
      if (pointer.planet) onSelectPlanet?.(pointer.planet);
    }
  };
  const zoomAt = (nextZoom, anchor=center) => {
    const current = view.current;
    const next = clampMapZoom(nextZoom);
    commit({ ...current, zoom:next, pan:zoomMapAtPoint(current.pan,current.zoom,next,anchor,center) });
  };
  useWheelZoom(svgRef, (factor, event) => {
    zoomAt(view.current.zoom * factor, point(event));
    rebase();
  });
  const reset = () => {
    pointers.current.clear(); baseline.current = null; moved.current = false;
    setDragging(false);
    commit({ zoom:1, pan:{x:0,y:0}, rotation:0 });
  };
  const keyDown = event => {
    if (event.target !== event.currentTarget) return;
    const current = view.current;
    if (['+','=','-'].includes(event.key)) {
      event.preventDefault(); zoomAt(current.zoom + (event.key==='-'?-.25:.25));
    }
    const arrows = {ArrowLeft:[-25,0],ArrowRight:[25,0],ArrowUp:[0,-25],ArrowDown:[0,25]};
    if (arrows[event.key]) {
      event.preventDefault();
      const [x,y] = arrows[event.key];
      if (current.zoom>1.001) commit({...current,pan:{x:current.pan.x+x,y:current.pan.y+y}});
      else commit({...current,rotation:(current.rotation+(x||y)/5)%360});
    }
    if (event.key==='Home') { event.preventDefault(); reset(); }
  };

  return { ...transform, dragging, safeZoom, reset, handlers:{
    onPointerDown:pointerDown, onPointerMove:pointerMove,
    onPointerUp:event=>pointerEnd(event), onPointerCancel:event=>pointerEnd(event,true),
    onLostPointerCapture:event=>{if(event.target===event.currentTarget)pointerEnd(event,true);},
    // Pointer selection is handled above after distinguishing a tap from a
    // gesture. Keyboard and assistive-technology clicks still reach markers.
    onClickCapture:event=>{if(event.detail>0){event.preventDefault();event.stopPropagation();}},
    onDoubleClick:reset, onKeyDown:keyDown,
  }};
}
