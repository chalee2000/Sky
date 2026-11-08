import { useLayoutEffect, useState } from 'react';

// Read actual overlay bounds so names don't end up under the compass, cards,
// or expanded touch controls. ResizeObserver also handles wrapped Thai text.
export default function useSkyLabelExclusions(container, home, expanded) {
  const [boxes,setBoxes]=useState([]);
  useLayoutEffect(()=>{
    const sky=container.current;
    const panel=sky?.closest('.map-panel');
    if(!sky||!panel)return;
    const elements=[...panel.querySelectorAll('.sky-hud,.sky-selection,.map-caption,.map-top-right,.daylight-notice,.pointer-readout,.pointer-guidance,.pointer-reset,.panel-heading,.sky-location-bar,.map-control-deck')];
    const measure=()=>{
      const bounds=sky.getBoundingClientRect();
      const next=elements.map(element=>element.getBoundingClientRect())
        .filter(r=>r.width&&r.height&&r.right>bounds.left&&r.left<bounds.right&&r.bottom>bounds.top&&r.top<bounds.bottom)
        .map(r=>({x:r.left-bounds.left-5,y:r.top-bounds.top-5,width:r.width+10,height:r.height+10}));
      setBoxes(previous=>JSON.stringify(previous)===JSON.stringify(next)?previous:next);
    };
    const observer=new ResizeObserver(measure);
    [sky,...elements].forEach(element=>observer.observe(element));
    measure();window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[container,home,expanded]);
  return boxes;
}
