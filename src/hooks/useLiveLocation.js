import { useCallback, useEffect, useRef, useState } from 'react';

const initialState = { status: 'idle', message: '', accuracy: null };

/** Follow the observer's position only after an explicit start gesture.
 * GPS location is deliberately separate from the device's compass heading.
 */
export default function useLiveLocation(onPosition) {
  const [state, setState] = useState(initialState);
  const callback = useRef(onPosition);
  callback.current = onPosition;
  const enabled = useRef(false);
  const watch = useRef(null);
  const generation = useRef(0);
  const hasFix = useRef(false);

  const clearWatch = useCallback(() => {
    generation.current += 1;
    if (watch.current !== null) {
      navigator.geolocation?.clearWatch(watch.current);
      watch.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    enabled.current = false;
    hasFix.current = false;
    clearWatch();
    setState(initialState);
  }, [clearWatch]);

  const beginWatch = useCallback(() => {
    clearWatch();
    if (!enabled.current) return;
    const session = generation.current;
    const geolocation = navigator.geolocation;
    if (!geolocation || typeof geolocation.watchPosition !== 'function') {
      enabled.current = false;
      setState({ status: 'unavailable', accuracy: null, message: 'อุปกรณ์นี้ไม่รองรับการติดตามตำแหน่ง กรุณาเลือกเมืองหรือกรอกพิกัด' });
      return;
    }
    if (document.hidden) {
      setState({ status: 'requesting', accuracy: null, message: 'พักการติดตามตำแหน่งขณะอยู่เบื้องหลัง' });
      return;
    }
    setState({ status: 'requesting', accuracy: null, message: 'กำลังหาตำแหน่งปัจจุบัน…' });
    const current = () => enabled.current && session === generation.current && !document.hidden;
    try {
      // Do not await anything before this call: browsers may require a gesture.
      const id = geolocation.watchPosition(position => {
        if (!current()) return;
        const { latitude, longitude, accuracy } = position.coords || {};
        if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
          setState({ status: 'requesting', accuracy: null, message: 'ยังไม่ได้พิกัดที่ถูกต้อง กำลังรอสัญญาณตำแหน่งใหม่' });
          return;
        }
        hasFix.current = true;
        setState({ status: 'active', message: '', accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null });
        callback.current?.({ name: 'ตำแหน่งปัจจุบัน', short: 'ตำแหน่งของคุณ', latitude, longitude });
      }, error => {
        if (!current()) return;
        if (error.code === 1) {
          enabled.current = false;
          clearWatch();
          setState({ status: 'denied', accuracy: null, message: 'ยังไม่ได้รับอนุญาตตำแหน่งปัจจุบัน เลือกเมืองหรืออนุญาตตำแหน่งในเบราว์เซอร์แล้วลองใหม่ได้' });
          return;
        }
        // A watch can recover from a timeout or a temporarily unavailable fix.
        const prefix = error.code === 3 ? 'ค้นหาตำแหน่งใช้เวลานาน' : 'สัญญาณตำแหน่งยังไม่พร้อม';
        setState({ status: 'requesting', accuracy: null, message: `${prefix} กำลังรอสัญญาณใหม่${hasFix.current ? ' · ใช้พิกัดล่าสุดระหว่างรอ' : ''}` });
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
      // Also handles a synchronous permission error in tests/browser wrappers.
      if (!enabled.current || session !== generation.current || document.hidden) geolocation.clearWatch(id);
      else watch.current = id;
    } catch {
      if (!enabled.current || session !== generation.current) return;
      enabled.current = false;
      clearWatch();
      setState({ status: 'unavailable', accuracy: null, message: 'เริ่มติดตามตำแหน่งไม่ได้ กรุณาเปิดผ่าน HTTPS หรือลองอนุญาตตำแหน่งในเบราว์เซอร์อีกครั้ง' });
    }
  }, [clearWatch]);

  const start = useCallback(() => {
    enabled.current = true;
    hasFix.current = false;
    beginWatch();
  }, [beginWatch]);

  useEffect(() => {
    const visibility = () => {
      if (!enabled.current) return;
      if (document.hidden) {
        clearWatch();
        setState({ status: 'requesting', accuracy: null, message: 'พักการติดตามตำแหน่งขณะอยู่เบื้องหลัง' });
      } else beginWatch();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      enabled.current = false;
      clearWatch();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [beginWatch, clearWatch]);

  return { ...state, active: state.status === 'requesting' || state.status === 'active', start, stop };
}
