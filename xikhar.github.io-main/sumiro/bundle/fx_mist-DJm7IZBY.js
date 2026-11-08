const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./stage-CLEEU_vp.js","./test_scene-DODe7HVg.js","./index-VEMJneSs.js","./rolldown-runtime-DK3Fl9T5.js","./ink_material-UyOP6egx.js","./constants-BjlLV5tN.js"])))=>i.map(i=>d[i]);
import{t as e}from"./rolldown-runtime-DK3Fl9T5.js";import{a as t,f as n,r}from"./ink_material-UyOP6egx.js";import{G as i,L as a,M as o,ct as s,d as c,h as l,lt as u,ot as d,t as f,u as p,ut as m,y as h}from"./index-VEMJneSs.js";var g={x:5,y:6,z:-48.2},_=[.549,-.836],ee=[.836,.549],v={x:-1.62,y:7.88,z:-38.14,yaw:-33.46,pitch:-5.71},y=352/Math.tan(20*Math.PI/180),b=v.yaw*Math.PI/180,x=v.pitch*Math.PI/180,S=[-Math.sin(b)*Math.cos(x),Math.sin(x),-Math.cos(b)*Math.cos(x)],C=[Math.cos(b),0,-Math.sin(b)],w=[C[1]*S[2]-C[2]*S[1],C[2]*S[0]-C[0]*S[2],C[0]*S[1]-C[1]*S[0]],T={position:[v.x,v.y,v.z],side:C,up:w,fwd:S,focal:y};function E(e,t,n){let r=(e-640)/y,i=(352-t)/y,a=[0,1,2].map(e=>S[e]+C[e]*r+w[e]*i),o=(e,t)=>e*_[0]+t*_[1],s=(o(g.x,g.z)+n-o(v.x,v.z))/o(a[0],a[2]);return[v.x+a[0]*s,v.y+a[1]*s,v.z+a[2]*s]}var D={x0:-700,y0:150,x1:2e3,y1:1150,w:512,h:224},O=[{x:490,y:466,rx:145,up:66,dn:110,rot:6,w:.97,drape:.1},{x:300,y:508,rx:260,up:46,dn:80,rot:10,w:.93,drape:.05},{x:40,y:548,rx:300,up:46,dn:80,rot:5,w:.5,drape:0},{x:470,y:452,rx:105,up:38,dn:70,rot:8,w:.8,drape:.1},{x:885,y:452,rx:145,up:68,dn:130,rot:2,w:.98,drape:.75},{x:775,y:515,rx:120,up:50,dn:90,rot:14,w:.8,drape:.4},{x:1050,y:490,rx:165,up:68,dn:130,rot:-3,w:.72,drape:.8},{x:1260,y:545,rx:260,up:66,dn:170,rot:-6,w:.36,drape:.6},{x:880,y:438,rx:115,up:42,dn:90,rot:2,w:.85,drape:.7},{x:300,y:700,rx:500,up:70,dn:260,rot:0,w:.6,drape:.25},{x:1e3,y:700,rx:500,up:70,dn:260,rot:0,w:.7,drape:.8},{x:650,y:525,rx:100,up:40,dn:90,rot:0,w:.6,drape:.1},{x:640,y:446,rx:120,up:7,dn:9,rot:-14,w:.2,free:!0},{x:610,y:508,rx:150,up:9,dn:11,rot:16,w:.28,free:!0},{x:680,y:480,rx:130,up:7,dn:8,rot:-22,w:.2,free:!0},{x:655,y:414,rx:90,up:6,dn:7,rot:10,w:.12,free:!0},{x:440,y:452,rx:190,up:36,dn:56,rot:9,w:.82,early:!0},{x:860,y:452,rx:210,up:34,dn:56,rot:3,w:.8,early:!0}],te=e=>e*e*(3-2*e);function ne(){let{x0:e,y0:t,x1:n,y1:r,w:i,h:a}=D,o=new Uint8Array(i*a*4),s=O.map(e=>{let t=(e.rot??0)*Math.PI/180;return{...e,c:Math.cos(t),s:Math.sin(t)}});for(let c=0;c<a;c++){let l=t+(c+.5)/a*(r-t);for(let t=0;t<i;t++){let r=e+(t+.5)/i*(n-e),a=1,u=1,d=1,f=0,p=0;for(let e of s){let t=r-e.x,n=l-e.y,i=t*e.c-n*e.s,o=t*e.s+n*e.c,s=o<0?e.up:e.dn,c=i*i/(e.rx*e.rx)+o*o/(s*s);if(c>=4)continue;let m=te(1-Math.sqrt(c)/2)*e.w;e.early?u*=1-m:e.free?d*=1-m:(a*=1-m,f+=m*e.drape,p+=m)}let m=(c*i+t)*4;o[m]=Math.round((1-a)*255),o[m+1]=Math.round((p>0?f/p:0)*255),o[m+2]=Math.round((1-u)*255),o[m+3]=Math.round((1-d)*255)}}return o}var k=[{a:2.6,gain:.3,seed:3.17},{a:1.2,gain:.3,seed:19.41},{a:0,gain:.24,seed:37.73},{a:-1.3,gain:.16,seed:58.29}];function A(){let e=new Float32Array(k.length*4*3),t=new Float32Array(k.length*4*2),n=new Uint16Array(k.length*6);return k.forEach((r,i)=>{[E(D.x0,D.y1,r.a),E(D.x1,D.y1,r.a),E(D.x1,D.y0,r.a),E(D.x0,D.y0,r.a)].forEach((n,a)=>{e.set(n,(i*4+a)*3),t.set([r.gain,r.seed],(i*4+a)*2)}),n.set([0,1,2,0,2,3].map(e=>e+i*4),i*6)}),{position:e,look:t,index:n}}var j=[138,154],M=[160,176],N=[146,172],P=[220,238],F=[206,216],I=[136,240],L=`
in vec2 aLook;    // share of the optical depth, seed
uniform vec3  uRefP, uRefS, uRefU, uRefF;
uniform float uRefFocal;
uniform vec2  uAcross;
out vec3  vRef;   // through the frozen f180 camera: x, y before the divide, and depth
out vec2  vM;     // metres across the line of run, metres of height
out vec2  vLook;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vec3 d = w.xyz - uRefP;
  vRef = vec3(dot(d, uRefS) * uRefFocal, dot(d, uRefU) * uRefFocal, dot(d, uRefF));
  vM = vec2(dot(w.xz, uAcross), w.y);
  vLook = aLook;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`,re=`
in vec3 vRef;
in vec2 vM;
in vec2 vLook;
layout(location = 0) out vec4 outColor;
${n}
uniform highp sampler2D tDepth;
uniform sampler2D tField;
uniform vec4  uField;     // x0, y0, width, height in f180 pixels
uniform vec2  uRes;
uniform float uNear, uFar;
uniform float uTime;
uniform float uSoftZ;
uniform float uAlphaMax;
uniform vec3  uMistCol;
uniform vec3  uMistThin;
uniform float uPxScale;
uniform float uOpticalDepth;
uniform vec4  uState;     // bank fill, early bands, whole-bank fade, rise in f180 pixels
uniform float uHang;      // 0 streaks lie level, 1 they hang wherever the map says so
uniform float uStrands;   // how much of the loose strands is out
uniform vec4  uGap;       // screen x in -1 to 1, half width left and right in reference px, strength
uniform vec2  uCamFade;   // metres: gone at x, whole at y
float linZ(float d) {
  float n = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}
void main() {
  float seed = vLook.y;
  float u = vM.x;
  float v = vM.y;

  // One long slow bend shared by streak and outline, so no streak is ruler-straight and no outline is the map's ellipse.
  float t = uTime * 0.05;
  float bendA = vnoise(vec3(u * 0.17, v * 0.31, seed + t)) - 0.5;
  float bendB = vnoise(vec3(u * 0.23 + 9.0, v * 0.43, seed + 13.0 + t)) - 0.5;

  // The map, read through the frozen camera, its outline pushed around by the bend.
  vec2 px = vec2(640.0 + vRef.x / vRef.z, 352.0 - vRef.y / vRef.z);
  px += vec2(bendB * 90.0, bendA * 46.0 + uState.w);
  vec4 f = texture(tField, (px - uField.xy) / uField.zw);
  float mask = f.r * uState.x;
  float early = f.b * uState.y;
  float wisp = f.a * uStrands;
  mask = 1.0 - (1.0 - mask) * (1.0 - early);
  if (mask + wisp < 0.004) discard;

  // Level silk: long and thin, leaning a little along the slope of the band.
  float level = fbm3(vec3((u + bendB * 4.0) * 0.2, (v + bendA * 1.6 - u * 0.07) * 1.9, seed + t * 1.1));
  float levelFine = fbm3(vec3((u + bendB * 3.0) * 0.3, (v + bendA * 1.1 - u * 0.07) * 2.4, seed + 7.0 + t * 1.4));
  // Hanging takes over lower down and later on, and level silk always keeps the top of the bank.
  float low = 1.0 - smoothstep(5.2, 7.6, v);
  float drape = clamp(f.g * 1.25, 0.0, 1.0) * uHang * mix(0.45, 1.0, low);
  float silk = level * 0.62 + levelFine * 0.38;
  if (drape > 0.01) {
    // Hanging silk: long and thin the other way, sliding slowly down.
    float fall = uTime * 0.09;
    float hang = fbm3(vec3((u + bendA * 1.2) * 1.15, (v + fall + bendB * 2.4) * 0.11, seed + 31.0 + t * 0.7));
    float hangFine = fbm3(vec3((u + bendA * 0.8) * 3.0, (v + fall + bendB * 1.5) * 0.24, seed + 43.0 + t * 0.9));
    silk = mix(silk, hang * 0.6 + hangFine * 0.4, drape);
  }
  float streak = smoothstep(0.3, 0.68, silk);

  // Where the map is thin, the streaks are all there is, and the edge is feathered by them. At the heart they only shade it.
  float heart = smoothstep(0.25, 0.85, mask);
  float density = pow(mask, 1.6) * mix(streak * 1.1, 0.72 + 0.46 * streak, heart);

  // The gap. Each side thins out as a long uneven wedge, and level strands stay behind, crossing the opening.
  vec2 frag = gl_FragCoord.xy;
  float gapPx = (uGap.x * 0.5 + 0.5) * uRes.x;
  float sx = (frag.x - gapPx) / uPxScale;
  float toothy = level * 0.5 + levelFine * 0.5;
  float wander = vnoise(vec3(v * 0.8, sx < 0.0 ? 3.1 : 21.3, seed * 0.3 + t)) - 0.5;
  float toEdge = (sx < 0.0 ? -sx - uGap.y : sx - uGap.z) + wander * 90.0 + (toothy - 0.5) * 115.0;
  float wedge = smoothstep(0.0, sx < 0.0 ? 150.0 : 115.0, toEdge);
  density *= mix(1.0, wedge + (1.0 - wedge) * 0.05, uGap.w);
  density += wisp * smoothstep(0.32, 0.66, levelFine) * 1.3;

  density *= uState.z;
  if (density < 0.002) discard;

  float zS = linZ(texture(tDepth, frag / uRes).r);
  float zF = linZ(gl_FragCoord.z);
  // It thins as the camera nears: rock ghosts through by f0204, and it is 0.5 to 0.6 at most from inside (f0214).
  density *= mix(0.5, 1.0, smoothstep(4.0, 11.5, zF));

  float a = 1.0 - exp(-density * vLook.x * uOpticalDepth);
  a *= smoothstep(0.0, uSoftZ, zS - zF);
  a *= smoothstep(uCamFade.x, uCamFade.y, zF);

  // One grey throughout. A little dimmer where it is thin, and a soft fine grain that holds its size on screen.
  float grain = vnoise(vec3(frag / (uPxScale * 2.6), seed + uTime * 0.3)) - 0.5;
  float grainB = vnoise(vec3(frag / (uPxScale * 1.2), seed + 5.0 + uTime * 0.4)) - 0.5;
  vec3 col = mix(uMistThin, uMistCol, smoothstep(0.05, 0.6, density) * 0.75 + streak * 0.25);
  col += (grain * 0.6 + grainB * 0.4) * 0.032;
  a *= 1.0 + (grain * 0.5 + grainB * 0.5) * 0.14;
  outColor = vec4(col, clamp(a, 0.0, 1.0) * uAlphaMax);
}
`,ie=e({beforeRender:()=>Q,budgetMs:()=>B,chapter:()=>z,dispose:()=>$,init:()=>X,name:()=>R,order:()=>340,update:()=>Z}),R=`fx_mist`,ae=340,z=`ch1_climb`,B=.2,oe=8,V=26,H=2,U=4,W=null,G=null,K=null,q=null,J=new u,Y=(e,t,n)=>{let r=Math.min(Math.max((n-e)/(t-e),0),1);return r*r*(3-2*r)};function se(){let{position:e,look:n,index:f}=A(),g=new c;g.setAttribute(`position`,new p(e,3)),g.setAttribute(`aLook`,new p(n,2)),g.setIndex(new p(f,1)),K=new h(ne(),D.w,D.h,i,d),K.minFilter=K.magFilter=o,K.wrapS=K.wrapT=l,K.colorSpace=``,K.needsUpdate=!0,G=r({color:`#babdbb`,thin:`#a4a7a5`,alphaMax:.97,softZ:1.1}),G.vertexShader=L,G.fragmentShader=re,Object.assign(G.uniforms,{tField:{value:K},uField:{value:new m(D.x0,D.y0,D.x1-D.x0,D.y1-D.y0)},uRefP:{value:new u(...T.position)},uRefS:{value:new u(...T.side)},uRefU:{value:new u(...T.up)},uRefF:{value:new u(...T.fwd)},uRefFocal:{value:T.focal},uAcross:{value:new s(...ee)},uPxScale:t.uPxScale,uOpticalDepth:{value:U},uState:{value:new m},uHang:{value:0},uStrands:{value:0},uGap:{value:new m(0,oe,V,0)},uCamFade:{value:new s(.9,3.2)}});let _=new a(g,G);return _.name=`fx_mist_bank`,_.frustumCulled=!1,_}async function X(e){if(W=se(),W.visible=!1,e.scene.add(W),e.params.raw?.get(`miststage`)){let{createStage:t}=await f(async()=>{let{createStage:e}=await import(`./stage-CLEEU_vp.js`);return{createStage:e}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url);q=await t(e)}}function Z(e,t){q?.update()}function Q(e){q?.beforeRender();let t=(e.registry.get(`camera_rig.rail`)?.u??e.time.t)*24;if(W.visible=t>=I[0]&&t<=I[1],!W.visible)return;let n=G.uniforms;n.uTime.value=e.time.t,n.uState.value.set(Y(N[0],N[1],t),Y(j[0],j[1],t)*(1-Y(M[0],M[1],t)),1-Y(P[0],P[1],t),Y(170,208,t)*42),n.uHang.value=.35+.65*Y(172,196,t),n.uStrands.value=Y(N[0],N[1],t)*(1-Y(186,200,t)),e.camera.updateMatrixWorld(),J.set(g.x,g.y,g.z).applyMatrix4(e.camera.matrixWorldInverse);let r=J.z<-.5;J.applyMatrix4(e.camera.projectionMatrix),n.uGap.value.x=J.x+H/1280*2,n.uGap.value.w=r?1-Y(F[0],F[1],t):0}function $(e){q?.dispose(),q=null,W&&(e.scene.remove(W),W.geometry.dispose(),G.dispose(),K.dispose()),W=G=K=null}export{Q as beforeRender,B as budgetMs,z as chapter,$ as dispose,X as init,g as n,R as name,ae as order,ie as t,Z as update};