import { useState } from 'react';
import { Camera } from 'lucide-react';
import { starImage } from '../lib/starImages.js';
import { deepSkyImage } from '../lib/deepSkyImages.js';

export default function SurveyThumbnail({ object, deepSky=false }) {
  const [ready,setReady]=useState(false);
  const photo=deepSky?deepSkyImage(object):starImage(object);
  return <span className="survey-thumbnail" aria-hidden="true">
    <Camera size={17}/>
    <img src={photo.url} alt="" referrerPolicy="no-referrer" decoding="async" className={ready?'ready':''} onLoad={()=>setReady(true)} onError={()=>setReady(false)}/>
  </span>;
}
