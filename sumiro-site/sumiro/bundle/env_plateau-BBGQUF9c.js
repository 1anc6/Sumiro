import{L as e,T as t,Z as n,d as r,g as i,h as a,lt as o,u as s}from"./index-VEMJneSs.js";import{t as c}from"./constants-BjlLV5tN.js";import{a as l,t as u}from"./ink_material-UyOP6egx.js";var d=`
in vec3 aPrev;
in vec3 aNext;
in vec2 aOut;
in vec2 aAlong; // metres along the rim, side of the ribbon
uniform vec2 uResolution;
uniform float uPxScale;
uniform float uWidth;
uniform float uNearFade;
out float vSide;
out float vPress;
out float vAlong;
float hash(float n) { return fract(sin(n) * 43758.5453123); }
float noise1(float x) {
  float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), f);
}
void main() {
  // Toward the camera a little, so the rough lip does not cut through the line.
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  view.xyz *= 1.0 - min(0.12 / max(length(view.xyz), 0.5), 0.1);
  vec4 clip = projectionMatrix * view;
  vec4 clipPrev = projectionMatrix * (modelViewMatrix * vec4(aPrev, 1.0));
  vec4 clipNext = projectionMatrix * (modelViewMatrix * vec4(aNext, 1.0));
  // Keep segments behind the camera from throwing the direction off.
  vec2 a = clipPrev.w > 0.01 ? clipPrev.xy / clipPrev.w : clip.xy / max(clip.w, 0.01);
  vec2 b = clipNext.w > 0.01 ? clipNext.xy / clipNext.w : clip.xy / max(clip.w, 0.01);
  vec2 dir = (b - a) * uResolution;
  dir = length(dir) > 1e-4 ? normalize(dir) : vec2(1.0, 0.0);
  vec2 normal = vec2(-dir.y, dir.x) / uResolution;

  float along = aAlong.x;
  float breath = 0.82 + 0.5 * noise1(along * 0.9) + 0.22 * noise1(along * 3.7);
  // Faded from above and outside: the near edge seen from over it. A rim seen edge-on or from below keeps its line.
  vec3 toCam = cameraPosition - position;
  float facing = dot(normalize(toCam.xz), aOut);
  float above = smoothstep(0.2, 0.7, toCam.y);
  float near = above * smoothstep(0.32, 0.72, facing);
  float press = mix(1.0, uNearFade, near);
  vPress = press;
  float w = uWidth * breath * mix(0.55, 1.0, press) * uPxScale;
  clip.xy += normal * aAlong.y * w * clip.w;
  gl_Position = clip;
  vSide = aAlong.y;
  vAlong = along;
}`,f=`
precision highp float;
in float vSide;
in float vPress;
in float vAlong;
uniform vec3 uInk;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 gNormal;
void main() {
  float edge = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  outColor = vec4(uInk, edge * vPress);
  // Alpha 0: blended, this attachment keeps whatever the rock wrote.
  gNormal = vec4(0.5, 0.5, 0.5, 0.0);
}`;function p(a,{width:o=1.8,nearFade:u=.06}={}){let p=a.points,m=p.length,h=new Float32Array((m+1)*2*3),g=new Float32Array((m+1)*2*3),_=new Float32Array((m+1)*2*3),v=new Float32Array((m+1)*2*2),y=new Float32Array((m+1)*2*2),b=[];for(let e=0;e<=m;e++){let t=p[e%m],n=p[(e-1+m)%m],r=p[(e+1)%m],i=e===m?a.total:t[5];for(let a=0;a<2;a++){let o=e*2+a;h.set([t[0],t[1],t[2]],o*3),g.set([n[0],n[1],n[2]],o*3),_.set([r[0],r[1],r[2]],o*3),v.set([t[3],t[4]],o*2),y.set([i,a?1:-1],o*2)}if(e<m){let t=e*2;b.push(t,t+2,t+1,t+1,t+2,t+3)}}let x=new r;x.setAttribute(`position`,new s(h,3)),x.setAttribute(`aPrev`,new s(g,3)),x.setAttribute(`aNext`,new s(_,3)),x.setAttribute(`aOut`,new s(v,2)),x.setAttribute(`aAlong`,new s(y,2)),x.setIndex(b);let S=new n({glslVersion:t,uniforms:{uResolution:l.uRes,uPxScale:l.uPxScale,uWidth:{value:o},uNearFade:{value:u},uInk:{value:new i(c.line.ink)}},vertexShader:d,fragmentShader:f,depthWrite:!1,side:2,transparent:!0});S.name=`plateau_rim_line`,S.userData.inkPass=`opaque`;let C=new e(x,S);return C.name=`plateau_rim_line`,C.frustumCulled=!1,C.renderOrder=50,{mesh:C,beforeRender(){},dispose(){x.dispose(),S.dispose()}}}var m={preset:`stone`,rampBias:.44,rampScale:.72,cavityK:.5,washWarp:.06,streakAmp:0,step:.2,hueAmt:.08,brushEdge:.08,tint:[1,1,1],poolAmt:.5,facetAmt:0,facetFreq:1.7,facetStretch:1,crackAmt:0,skyFill:.5,brushAmt:.08,brushLean:1,pitAmt:.06,scumble:.04,stainAmt:.5,stainFreq:.34,speckAmt:.22,grainAmp:.03},h={preset:`rock`,wrap:.08,skyFill:.28,cavityK:.72,facetAmt:.13,facetFreq:1.6,facetStretch:.6,facetBevel:.1,crackAmt:.26,crackW:.9,crackGate:.74,tint:[1.018,1,.965],stainAmt:.05,stainFreq:.8,speckAmt:.02,step:0,gouge:.2,zones:.5,zoneWander:.45,zoneSoft:.17,litClean:.82,blotchAmp:.035,streakAmp:.02,brushAmt:.07,pitAmt:0,scumble:0,grainAmp:.045,hueAmt:.4,dryCol:`#c2c2b8`,poolCol:`#23292d`,poolDeep:`#14181b`},g={wall:{preset:`rock`,look:!0,coolDark:0,dryDirect:1,poolTear:.5,cavityK:.1,wrap:.35,skyFill:.1,rampScale:.9,rampBias:.06,facetAmt:0,facetFreq:1.3,facetStretch:.36,facetBevel:.07,crackAmt:0,step:0,brushAmt:.02,pitAmt:0,scumble:0,grainAmp:.05,dryAmt:.75,stainAmt:0,washWarp:.03,speckAmt:0,blotchAmp:.012,streakAmp:0,litClean:.85,hueAmt:.15,tint:[1.012,1,.975],dryCol:`#bfbfb5`,poolCol:`#3e4040`,poolDeep:`#262829`},top:{...m,rampBias:.56,rampScale:.62,look:!0,lineWeight:.4,groundSqueeze:.5,groundHeading:20,stainAmt:.3,tint:[1.004,1,.985]},skirt:{...h,facetFreq:.8,crackAmt:.1},shoulder:{...h,facetAmt:.14,facetFreq:.85,facetStretch:.45,facetBevel:.06,crackAmt:.22,crackW:1.2,crackGate:.78,gouge:.12,zones:.4,litClean:.92,dryCol:`#b8b8ae`,tint:[1.008,1,.982]},steps:{...m,rampBias:.42,rampScale:.72,cavityK:.7,wrap:.1,stainAmt:.1,speckAmt:.1,poolAmt:.5,lineWeight:.9,skyFill:.3,facetAmt:.04,crackAmt:.2,crackW:.9,crackGate:.7}},_=`env_plateau`,v=20,y=`ch1_climb`,b=`env_plateau`,x=null,S=null,C=null,w=null,T=[],E=[],D=8.6,O=9.9,k=(e,t,n)=>{let r=Math.min(Math.max((n-e)/(t-e),0),1);return r*r*(3-2*r)};async function A(e,t){let n=await e.assets.loadTexture(`${b}/${t}`);return n.flipY=!1,n.colorSpace=``,n.wrapS=n.wrapT=a,n.needsUpdate=!0,E.push(n),n}async function j(e){let{registry:t,scene:n,assets:r}=e,[i,a,s,c]=await Promise.all([r.loadGLTF(`${b}/plateau.glb`),A(e,`wall_look.png`),A(e,`top_look.png`),r.loadJSON(`${b}/rim.json`)]);x=i.scene,x.name=`env_plateau`;let l={low:new o,high:new o};x.updateMatrixWorld(!0),x.getObjectByName(`grip_ledge_low`)?.getWorldPosition(l.low),x.getObjectByName(`grip_ledge_high`)?.getWorldPosition(l.high);let d=x.getObjectByName(`plateau_top`),f=x.getObjectByName(`plateau_collision`);f&&(f.visible=!1),u(x,e=>e.name===`wall_front`?{...g.wall,map:a,vertexPaint:!0}:e.name===`plateau_top`?{...g.top,map:s,vertexPaint:!0}:e.name===`wall_skirt`?g.skirt:e.name===`plateau_steps`?g.steps:e.name.startsWith(`shoulder`)?g.shoulder:{preset:`rock`}),x.traverse(e=>{e.isMesh&&((e.name.startsWith(`wall`)||e.name.startsWith(`shoulder`))&&(e.receiveShadow=!1,e.castShadow=!1),e.name===`plateau_top`&&(e.castShadow=!1),e.name===`plateau_collision`&&(e.castShadow=!1,e.receiveShadow=!1))}),n.add(x),C=x.getObjectByName(`wall_front`)?.material.userData.ink??null,w=d?.material.userData.ink??null;for(let e of[`shoulder_left`,`shoulder_left_low`,`shoulder_left_lower`]){let t=x.getObjectByName(e);t&&T.push({node:t,x:t.position.x,z:t.position.z})}S=p(c),n.add(S.mesh);let m=t.get(`camera_rig.layout`);t.set(`env_plateau.heightAt`,(e,t)=>m?.plateauY?m.plateauY(e,t):-.0065*t+7.9385),t.set(`env_plateau.top`,d),t.set(`env_plateau.rim`,c),t.set(`env_plateau.grips`,l)}function M(){}function N(e){if(C){let t=k(D,O,e.camera.position.y);C.uDryAmt.value=.42+.5*t,C.uRampBias.value=g.wall.rampBias+.14*t}if(w){let t=e.camera.position.z;w.uRampBias.value=g.top.rampBias+.035-.085*k(-50.5,-55,t)}let t=k(9.2,10,e.camera.position.y)*2.6;for(let e of T)e.node.position.x=e.x+.9*t,e.node.position.z=e.z-.44*t}function P(e){for(let t of[`heightAt`,`top`,`rim`,`grips`])e.registry.delete(`env_plateau.${t}`);x&&(e.scene.remove(x),x.traverse(e=>{e.geometry?.dispose(),e.material?.dispose?.()}),x=null,C=null,w=null,T.length=0),S&&=(e.scene.remove(S.mesh),S.dispose(),null);for(let e of E)e.dispose();E.length=0}export{N as beforeRender,y as chapter,P as dispose,j as init,_ as name,v as order,M as update};