import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Created only when a detail view opens. The default view renders on demand.
export function createModelScene(host, profile, {onTextureError,onTextureLoaded,onContextLost,onRender}) {
  const cleanups=[];
  let cleaned=false;
  const cleanup=()=>{if(cleaned)return;cleaned=true;for(const dispose of cleanups.reverse()){try{dispose();}catch{/* Continue releasing the remaining resources. */}}};
  try {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  cleanups.push(()=>{renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=profile.rings;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(36,1,.1,100);
  const distance=profile.rings?9:5.3;
  camera.position.set(0,profile.rings?2.8:.65,distance);
  const controls=new OrbitControls(camera,renderer.domElement);
  cleanups.push(()=>controls.dispose());
  controls.enablePan=false;
  controls.enableDamping=false;
  controls.minDistance=profile.rings?4.2:2.3;
  controls.maxDistance=13;
  controls.rotateSpeed=.65;
  controls.zoomSpeed=.7;
  controls.saveState();
  const group=new THREE.Group();
  group.rotation.z=THREE.MathUtils.degToRad(-profile.tilt);
  scene.add(group);
  const geometry=new THREE.SphereGeometry(1,96,64);
  cleanups.push(()=>geometry.dispose());
  const materials=[];
  cleanups.push(()=>materials.forEach(material=>material.dispose()));
  let disposed=false,texture=null,frame=0,autoRotate=false,previousTime=0,textureTimeout=0;
  cleanups.push(()=>{disposed=true;cancelAnimationFrame(frame);clearTimeout(textureTimeout);texture?.dispose();});
  const color=new THREE.Color(profile.color);
  let material;
  if(profile.kind==='star') {
    material=new THREE.ShaderMaterial({uniforms:{starColor:{value:color}},vertexShader:`
      varying vec3 surfaceNormal; varying vec3 viewDirection;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.0);surfaceNormal=normalize(normalMatrix*normal);viewDirection=normalize(-p.xyz);gl_Position=projectionMatrix*p;}
    `,fragmentShader:`
      uniform vec3 starColor; varying vec3 surfaceNormal; varying vec3 viewDirection;
      void main(){float mu=max(dot(normalize(surfaceNormal),normalize(viewDirection)),0.0);float brightness=0.42+0.58*pow(mu,0.45);gl_FragColor=vec4(starColor*brightness*1.2,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }
    `});
  } else {
    material=new THREE.MeshStandardMaterial({color,roughness:1,metalness:0});
    scene.add(new THREE.AmbientLight('#ffffff',.5));
    const sun=new THREE.DirectionalLight('#ffffff',3.2);
    sun.position.set(-4,3,6);sun.castShadow=profile.rings;
    sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-3;sun.shadow.camera.right=3;sun.shadow.camera.top=3;sun.shadow.camera.bottom=-3;sun.shadow.camera.near=.1;sun.shadow.camera.far=20;sun.shadow.normalBias=.025;
    scene.add(sun);cleanups.push(()=>sun.shadow.map?.dispose());
  }
  materials.push(material);
  const globe=new THREE.Mesh(geometry,material);
  globe.scale.y=profile.polarRatio;globe.castShadow=profile.rings;globe.receiveShadow=profile.rings;
  group.add(globe);
  // These optional guide lines are a coordinate aid, not observed surface marks.
  const guideSphere=new THREE.SphereGeometry(1.005,18,12);
  const guideGeometry=new THREE.WireframeGeometry(guideSphere);guideSphere.dispose();
  cleanups.push(()=>guideGeometry.dispose());
  const guideMaterial=new THREE.LineBasicMaterial({color:'#eef0ff',transparent:true,opacity:.18});
  cleanups.push(()=>guideMaterial.dispose());
  const guide=new THREE.LineSegments(guideGeometry,guideMaterial);
  guide.scale.y=profile.polarRatio;guide.visible=false;group.add(guide);
  const ringGeometries=[];
  cleanups.push(()=>ringGeometries.forEach(g=>g.dispose()));
  if(profile.rings) {
    // Main C, B and A rings; the Cassini division remains a physical gap.
    for(const [inner,outer,color,opacity] of [[74658,92000,'#8d8171',.45],[92000,117580,'#d8cbb1',.9],[122170,136775,'#b9ac91',.7]]) {
      const ringGeometry=new THREE.RingGeometry(inner/60268,outer/60268,192);
      const ringMaterial=new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,transparent:true,opacity,roughness:1,depthWrite:false});
      const ring=new THREE.Mesh(ringGeometry,ringMaterial);ring.rotation.x=-Math.PI/2;ring.castShadow=true;ring.receiveShadow=true;
      group.add(ring);ringGeometries.push(ringGeometry);materials.push(ringMaterial);
    }
  }
  const draw=()=>{if(!disposed){renderer.render(scene,camera);onRender?.(camera.position);}};
  if(profile.texture){
  textureTimeout=setTimeout(()=>{if(!disposed)onTextureError();},15000);
  new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}${profile.texture.file}`,loaded=>{
    if(disposed){loaded.dispose();return;}
    clearTimeout(textureTimeout);
    texture=loaded;texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    material.color.set('#ffffff');material.map=texture;material.needsUpdate=true;onTextureLoaded();draw();
  },undefined,()=>{
    clearTimeout(textureTimeout);
    if(disposed)return;
    material.color.set(profile.color);material.needsUpdate=true;onTextureError();draw();
  });
  }
  const resize=()=>{
    const width=host.clientWidth,height=host.clientHeight;
    if(width<=0||height<=0)return;
    camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);draw();
  };
  const observer=new ResizeObserver(resize);
  cleanups.push(()=>observer.disconnect());
  host.appendChild(renderer.domElement);observer.observe(host);
  controls.addEventListener('change',draw);
  const lost=event=>{event.preventDefault();setAutoRotate(false);onContextLost();};
  renderer.domElement.addEventListener('webglcontextlost',lost);
  cleanups.push(()=>renderer.domElement.removeEventListener('webglcontextlost',lost));
  function tick(time){
    if(disposed||!autoRotate)return;
    const delta=previousTime?Math.min((time-previousTime)/1000,.05):0;
    previousTime=time;globe.rotation.y+=delta*.16;guide.rotation.y=globe.rotation.y;
    draw();frame=requestAnimationFrame(tick);
  }
  function setAutoRotate(value){
    autoRotate=value;cancelAnimationFrame(frame);previousTime=0;
    if(value&&!document.hidden)frame=requestAnimationFrame(tick);
  }
  const visibility=()=>setAutoRotate(autoRotate);
  document.addEventListener('visibilitychange',visibility);
  cleanups.push(()=>document.removeEventListener('visibilitychange',visibility));
  function turn(horizontal,vertical=0){
    const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    spherical.theta+=horizontal;spherical.phi=Math.max(.02,Math.min(Math.PI-.02,spherical.phi+vertical));
    camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(controls.target));controls.update();draw();
  }
  function zoom(factor){
    const direction=camera.position.clone().sub(controls.target);
    direction.setLength(THREE.MathUtils.clamp(direction.length()*factor,controls.minDistance,controls.maxDistance));
    camera.position.copy(direction.add(controls.target));controls.update();draw();
  }
  resize();
  return {
    turn,zoom,setAutoRotate,
    setGuides:value=>{guide.visible=value;draw();},
    reset:()=>{controls.reset();globe.rotation.y=0;guide.rotation.y=0;draw();},
    dispose:cleanup,
  };
  }catch(error){cleanup();throw error;}
}
