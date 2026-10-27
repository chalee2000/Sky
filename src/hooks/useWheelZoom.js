import { useEffect, useRef } from 'react';

export default function useWheelZoom(targetRef, onZoom) {
  const callback = useRef(onZoom);
  callback.current = onZoom;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const wheel = event => {
      // Keep browser zoom shortcuts and gestures outside the canvas available.
      if (event.ctrlKey || event.metaKey || !event.cancelable || !Number.isFinite(event.deltaY) || event.deltaY === 0) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? target.clientHeight : 1;
      const pixels = Math.max(-240, Math.min(240, event.deltaY * unit));
      event.preventDefault();
      callback.current(Math.exp(-pixels * .0025), event);
    };
    // React delegates wheel events passively; this listener prevents page scroll
    // only while the wheel is zooming the sky, including at the zoom limits.
    target.addEventListener('wheel', wheel, { passive:false });
    return () => target.removeEventListener('wheel', wheel);
  }, [targetRef]);
}
