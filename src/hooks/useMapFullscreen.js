import { useCallback, useEffect, useRef, useState } from 'react';
import './mapFullscreen.css';

export default function useMapFullscreen(panelRef) {
  const [mode, setMode] = useState(null);
  const pending = useRef(false);
  const request = useRef(0);

  const exit = useCallback(async () => {
    request.current += 1;
    if (document.fullscreenElement && document.fullscreenElement === panelRef.current && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { /* Keep an explicit CSS exit available. */ }
      if (document.fullscreenElement === panelRef.current) return;
    }
    setMode(null);
  }, [panelRef]);

  const enter = useCallback(async () => {
    const panel = panelRef.current;
    if (!panel || pending.current) return;
    const id = ++request.current;
    pending.current = true;
    try {
      if (typeof panel.requestFullscreen === 'function') {
        try {
          await panel.requestFullscreen();
          if (id === request.current && panel.isConnected) {
            setMode(document.fullscreenElement === panel ? 'native' : 'fallback');
          }
          return;
        } catch { /* Safari and embedded browsers can reject the native API. */ }
      }
      if (id === request.current && panel.isConnected) setMode('fallback');
    } finally { pending.current = false; }
  }, [panelRef]);

  useEffect(() => {
    const changed = () => {
      if (document.fullscreenElement === panelRef.current && panelRef.current) setMode('native');
      else setMode(previous => previous === 'native' ? null : previous);
    };
    document.addEventListener('fullscreenchange', changed);
    return () => { request.current += 1; document.removeEventListener('fullscreenchange', changed); };
  }, [panelRef]);

  useEffect(() => {
    if (!mode || !panelRef.current) return;
    const panel = panelRef.current;
    const previousFocus = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    // Keep keyboard and screen-reader navigation inside the enlarged map.
    const siblings = [];
    for (let node = panel; node?.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && !['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
    }
    const closeButton = panel.querySelector('[data-fullscreen-toggle]');
    closeButton?.focus({ preventScroll: true });
    const keydown = event => {
      if (event.defaultPrevented || document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') { event.preventDefault(); void exit(); }
      if (event.key !== 'Tab') return;
      const focusable = [...panel.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      siblings.forEach(([sibling, inert]) => { sibling.inert = inert; });
      document.removeEventListener('keydown', keydown);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [mode, panelRef, exit]);

  return { active: mode !== null, fallback: mode === 'fallback', enter, exit, toggle: mode ? exit : enter };
}
