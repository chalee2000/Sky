import { useCallback, useEffect, useRef, useState } from 'react';
import { orientationToView, smoothView } from '../lib/orientation.js';

export default function useSkyOrientation() {
  const [state, setState] = useState({ status: 'idle', view: null, message: '' });
  const cleanup = useRef(() => {});
  const generation = useRef(0);
  const stop = useCallback(() => {
    generation.current += 1;
    cleanup.current();
    cleanup.current = () => {};
    setState({ status: 'idle', view: null, message: '' });
  }, []);

  const start = useCallback(async () => {
    const session = ++generation.current;
    cleanup.current();
    cleanup.current = () => {};
    const fail = (status, message) => {
      if (session !== generation.current) return;
      cleanup.current();
      cleanup.current = () => {};
      setState({ status, view: null, message });
    };
    if (!window.isSecureContext) {
      fail('unavailable', 'โหมดส่องฟ้าต้องเปิดผ่าน HTTPS กรุณาเปิดลิงก์เว็บไซต์ใน Safari หรือ Chrome');
      return;
    }
    const Orientation = window.DeviceOrientationEvent;
    if (!Orientation) {
      fail('unsupported', 'อุปกรณ์นี้ไม่รองรับเซ็นเซอร์ทิศทาง คุณยังลากดูแผนที่ได้ หรือเปิดแอพบนมือถือใน Safari / Chrome');
      return;
    }
    setState({ status: 'requesting', view: null, message: '' });
    try {
      // Called directly from the user's button gesture; Safari requires this.
      if (typeof Orientation.requestPermission === 'function') {
        const permission = await Orientation.requestPermission(true);
        if (session !== generation.current) return;
        if (permission !== 'granted') {
          fail('denied', 'ยังไม่ได้รับอนุญาตเซ็นเซอร์ กรุณาอนุญาตการเคลื่อนไหวและทิศทางใน Safari แล้วลองเปิดโหมดส่องฟ้าอีกครั้ง');
          return;
        }
      }
    } catch {
      fail('denied', 'เปิดเซ็นเซอร์ไม่ได้ ลองเปิดเว็บไซต์ใน Safari หรือ Chrome แล้วกดปุ่มส่องฟ้าเพื่ออนุญาตอีกครั้ง');
      return;
    }
    if (session !== generation.current) return;
    setState({ status: 'waiting', view: null, message: '' });
    let frame = 0, latest = null, previous = null, lastPaint = 0, lastAngle = null;
    let hasAbsoluteEvent = false;
    let lastSample = Date.now();
    const screenAngle = () => window.screen?.orientation?.angle ?? (typeof window.orientation === 'number' ? window.orientation : 0);
    const paint = time => {
      frame = 0;
      if (session !== generation.current || !latest) return;
      if (time-lastPaint < 40) { frame = requestAnimationFrame(paint); return; }
      lastPaint = time;
      previous = smoothView(previous, latest);
      setState({ status: 'active', view: previous, message: '' });
    };
    const onOrientation = event => {
      if (document.hidden || session !== generation.current) return;
      if (event.type === 'deviceorientation' && hasAbsoluteEvent && !Number.isFinite(event.webkitCompassHeading)) return;
      const angle = screenAngle();
      const view = orientationToView(event, angle);
      if (!view) return;
      if (event.type === 'deviceorientationabsolute') hasAbsoluteEvent = true;
      lastSample = Date.now();
      if (angle !== lastAngle) { previous = null; lastAngle = angle; }
      clearTimeout(timeout);
      latest = view;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const timeout = setTimeout(() => fail('unavailable', 'ยังไม่ได้รับทิศเหนือจากเซ็นเซอร์ ลองเปิดใน Safari / Chrome บนมือถือ และตรวจสิทธิ์การเคลื่อนไหวกับเข็มทิศ'), 10000);
    const onVisibility = () => {
      lastSample = Date.now();
      latest = null;
      previous = null;
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) setState({ status: 'waiting', view: null, message: '' });
    };
    const watchdog = setInterval(() => {
      if (!document.hidden && Date.now()-lastSample > 10000) {
        fail('unavailable', 'สัญญาณเซ็นเซอร์หยุดส่ง โหมดส่องฟ้าหยุดแล้ว กรุณากดเปิดใหม่อีกครั้ง');
      }
    }, 1000);
    window.addEventListener('deviceorientationabsolute', onOrientation);
    window.addEventListener('deviceorientation', onOrientation);
    document.addEventListener('visibilitychange', onVisibility);
    cleanup.current = () => {
      clearTimeout(timeout);
      clearInterval(watchdog);
      cancelAnimationFrame(frame);
      window.removeEventListener('deviceorientationabsolute', onOrientation);
      window.removeEventListener('deviceorientation', onOrientation);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => () => { generation.current += 1; cleanup.current(); }, []);
  return { ...state, start, stop, enabled: ['requesting', 'waiting', 'active'].includes(state.status) };
}
