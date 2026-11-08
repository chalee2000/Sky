import { useId } from 'react';
import { starAppearance } from '../lib/starAppearance.js';

export default function StarGlyph({ x, y, magnitude, color='#dce6f4', nightMode=false }) {
  const id=`star-light-${useId().replaceAll(':','')}`;
  const style=starAppearance(magnitude);
  const hue=nightMode?'#dc8b79':color;
  return <g className="sky-star-light" pointerEvents="none" aria-hidden="true">
    <defs><radialGradient id={id}><stop stopColor={hue} stopOpacity=".9"/><stop offset=".2" stopColor={hue} stopOpacity=".35"/><stop offset=".6" stopColor={hue} stopOpacity=".08"/><stop offset="1" stopColor={hue} stopOpacity="0"/></radialGradient></defs>
    <circle cx={x} cy={y} r={style.haloRadius} fill={`url(#${id})`} opacity={style.haloOpacity}/>
    <circle cx={x} cy={y} r={style.coreRadius+1.1} fill={hue} opacity=".09"/>
    <circle cx={x} cy={y} r={style.coreRadius} fill={hue} opacity={style.coreOpacity}/>
    <circle cx={x} cy={y} r={Math.max(.4,style.coreRadius*.48)} fill={nightMode?'#f7b39d':'#fff8ed'} opacity=".9"/>
  </g>;
}
